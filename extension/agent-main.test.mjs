// Tests for extension/agent-main.js (Angular change-detection cycle recorder).
// The content script is loaded via vm.runInThisContext so it executes in Node's own realm
// (no cross-realm prototype mismatch), with window.ng / globals mocked per test.
import assert from 'node:assert/strict';
import { describe, it, before, afterEach } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const SRC = readFileSync(new URL('./agent-main.js', import.meta.url), 'utf8');

const PE = {
  TemplateUpdateStart: 2,
  TemplateUpdateEnd: 3,
  LifecycleHookStart: 4,
  LifecycleHookEnd: 5,
  OutputStart: 6,
  OutputEnd: 7,
  ChangeDetectionStart: 12,
  ChangeDetectionEnd: 13,
  ComponentStart: 18,
  ComponentEnd: 19,
  HostBindingsUpdateStart: 24,
  HostBindingsUpdateEnd: 25,
};

const ORIGINALS = {
  ng: globalThis.ng,
  Zone: globalThis.Zone,
  CustomEvent: globalThis.CustomEvent,
  dispatchEvent: globalThis.dispatchEvent,
  performance: globalThis.performance,
  __ngRecorder: globalThis.__ngRecorder,
};

class Counter {}

function namedFn(name) {
  return new Function(
    `return function ${name.replace(/[^A-Za-z0-9_$]/g, '_')}() {}`,
  )();
}

function boot(opts = {}) {
  return bootSource(SRC, opts);
}

// The one boot, parameterised by the source it evaluates: the pins below drive the shipped file and
// their mutants drive one anchored edit of it, so a mutant is measured through the same boot.
function bootSource(source, opts = {}) {
  const dispatched = [];
  globalThis.CustomEvent = function (type, options) {
    return { type, detail: options && options.detail };
  };
  globalThis.dispatchEvent = (ev) => {
    dispatched.push(ev);
  };
  globalThis.performance = { now: () => 4242 };
  if (opts.Zone !== undefined) globalThis.Zone = opts.Zone;
  else delete globalThis.Zone;
  if (opts.ng !== undefined) globalThis.ng = opts.ng;
  else delete globalThis.ng;
  delete globalThis.__ngRecorder;
  vm.runInThisContext(source, { filename: 'agent-main.js' });
  return { recorder: globalThis.__ngRecorder, dispatched };
}

function extractTrigger(name) {
  let rec = globalThis.__ngRecorder;
  if (!rec) {
    const { ng } = makeNg({ graph: null });
    const b = boot({ ng });
    rec = b.recorder;
  }
  return rec.extractTriggerName(name);
}

function makeNg(opts = {}) {
  const captured = {
    subscriber: null,
    profilerCalls: 0,
    getSignalGraphCalls: 0,
  };
  const graphs = Array.isArray(opts.graph) ? opts.graph : null;
  let graphCalls = 0;
  const ng = {
    ɵsetProfiler: (cb) => {
      captured.profilerCalls++;
      captured.subscriber = cb;
      return () => {
        captured.subscriber = null;
      };
    },
    ɵgetSignalGraph: () => {
      captured.getSignalGraphCalls++;
      if (graphs) return graphs[Math.min(graphCalls++, graphs.length - 1)];
      return opts.graph;
    },
    getHostElement: (inst) => ({ tagName: opts.hostTag || 'APP-COUNTER' }),
    getDirectiveMetadata: (inst) => ({
      changeDetection: opts.changeDetection ?? 1,
    }),
    getInjector: () => ({ get: () => null }),
  };
  return { ng, captured };
}

function flushMicrotasks() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function counterGraph() {
  return {
    nodes: [
      { id: 'n0', kind: 'signal', label: 'count', epoch: 1 },
      { id: 'n1', kind: 'computed', label: 'double', epoch: 1 },
      {
        id: 'n2',
        kind: 'template',
        label: 'app-counter',
        epoch: 1,
        debuggableFn: Counter,
      },
    ],
    edges: [
      { consumer: 2, producer: 0 },
      { consumer: 2, producer: 1 },
      { consumer: 1, producer: 0 },
    ],
  };
}

describe('agent-main.js (recorder)', () => {
  afterEach(() => {
    // Clear any timer the boot armed (the companion re-check): a leaked page timer would keep this
    // process alive and turn a regression into a hang instead of a failed assertion.
    if (
      globalThis.__ngRecorder &&
      typeof globalThis.__ngRecorder.reset === 'function'
    ) {
      globalThis.__ngRecorder.reset();
    }
    // Restore originals to avoid leaking mocks across tests.
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    globalThis.__ngRecorder = ORIGINALS.__ngRecorder;
  });

  describe('forbidden tokens', () => {
    const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(
      /\/\/[^\n]*/g,
      '',
    );
    it('does not use ViewContainerRef / getViewContainerRef / di_graph / devtools discovery', () => {
      assert.equal(code.includes('ViewContainerRef'), false);
      assert.equal(code.includes('getViewContainerRef'), false);
      assert.equal(code.includes('di_graph'), false);
      assert.equal(code.includes('devtoolstooldiscovery'), false);
    });
    it('contains no Prompt API / LanguageModel code', () => {
      assert.equal(code.includes('LanguageModel'), false);
      assert.equal(code.includes('setPrompt'), false);
    });
  });

  describe('feature detection', () => {
    it('installs exactly one profiler subscriber when ng.ɵsetProfiler is present', () => {
      const { ng, captured } = makeNg({ graph: null });
      const { recorder, dispatched } = boot({ ng });
      assert.equal(captured.profilerCalls, 1);
      assert.equal(recorder.installed, true);
      const state = dispatched.find((e) => e.type === 'angular-ai:state');
      assert.equal(state.detail.supported, true);
    });

    it("says 'not supported' when ng.ɵsetProfiler is missing", () => {
      const { dispatched } = boot({ ng: {} });
      const state = dispatched.find((e) => e.type === 'angular-ai:state');
      assert.equal(state.detail.supported, false);
      assert.match(String(state.detail.reason), /ɵsetProfiler/);
      assert.equal(state.detail.features.setProfiler, false);
    });

    it("reports 'not supported' for a Zone.js app (E7)", () => {
      const { ng } = makeNg({ graph: null });
      const { dispatched } = boot({ ng, Zone: function Zone() {} });
      const state = dispatched.find((e) => e.type === 'angular-ai:state');
      assert.equal(state.detail.supported, false);
      assert.match(String(state.detail.reason), /Zone\.js/i);
    });

    it('reports supported for a zoneless app, attaching the zone mode', () => {
      const { ng } = makeNg({ graph: null });
      const { dispatched, recorder } = boot({ ng });
      const state = dispatched.find((e) => e.type === 'angular-ai:state');
      assert.equal(state.detail.supported, true);
      assert.equal(state.detail.zoneMode, 'noop');
      assert.equal(state.detail.features.getSignalGraph, true);
      assert.equal(recorder.installed, true);
    });
  });

  describe('microtask cycle-order rule (E4)', () => {
    it('groups the pre-cycle OutputStart as the trigger and TemplateUpdateStart/End in order', async () => {
      const counter = new Counter();
      const listener = namedFn('Counter_Template_button_click_0_listener');
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.OutputStart, counter, listener);
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.equal(record.detail.trigger.kind, 'output');
      assert.equal(record.detail.trigger.listenerName, 'click');
      assert.equal(record.detail.zoneMode, 'noop');
      assert.equal(record.detail.checks.length, 1);
      assert.deepEqual(record.detail.checks[0].events, [
        PE.TemplateUpdateStart,
        PE.TemplateUpdateEnd,
      ]);
      assert.equal(record.detail.checks[0].componentName, 'app-counter');
      assert.equal(record.detail.checks[0].className, 'Counter');
      assert.equal(record.detail.checks[0].changeDetection, 'eager');
      assert.notEqual(record.detail.checks[0].graph, null);
    });

    it('preserves profiler event order with no name-based tie-break (mid-cycle OutputStart)', async () => {
      const counter = new Counter();
      const listener = namedFn('Counter_Template_button_click_0_listener');
      const { ng } = makeNg({ graph: counterGraph(), hostTag: 'app-counter' });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.OutputStart, counter, listener);
      sub(PE.TemplateUpdateEnd, counter);
      sub(PE.OutputEnd, counter, listener);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.deepEqual(record.detail.checks[0].events, [
        PE.TemplateUpdateStart,
        PE.OutputStart,
        PE.TemplateUpdateEnd,
        PE.OutputEnd,
      ]);
      // one trigger per cycle; a mid-cycle OutputStart does not overwrite an unknown cycle trigger
      assert.equal(record.detail.trigger.kind, 'unknown');
    });

    it('groups multiple checked components into one cycle', async () => {
      class Child {}
      const a = new Counter();
      const b = new Child();
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, a);
      sub(PE.TemplateUpdateStart, b);
      sub(PE.TemplateUpdateEnd, a);
      sub(PE.TemplateUpdateEnd, b);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.equal(record.detail.checks.length, 2);
    });
  });

  describe('shaped facts over the CustomEvent channel', () => {
    it('never carries a component-instance reference, LanguageModel or prompt text', async () => {
      const counter = new Counter();
      const listener = namedFn('Counter_Template_button_click_0_listener');
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.OutputStart, counter, listener);
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      const json = JSON.stringify(record.detail);
      assert.equal(json.includes('APP-COUNTER'), false); // host tag string, not the instance object
      assert.equal(json.includes('constructor'), false);
      assert.equal(json.includes('LanguageModel'), false);
      assert.equal(json.includes('prompt'), false);
      assert.equal(record.detail.trigger.listenerName, 'click');
    });
  });

  /**
   * The unreadable-metadata case: the recorder answers nothing, never the best case.
   *
   * `changeDetectionFor` used to answer `'onpush'` on both of its unreadable paths — the runtime
   * publishes no metadata function, and the metadata call throws. That made "this component is
   * OnPush" the silent answer for a component nobody read. The consumer
   * (`apps/angular-ai-devtools/src/app/update-cause-chain.ts`) treats only `1`/`'eager'`/`'Eager'`
   * as eager, so the fallback did not merely mislabel the strategy: it suppressed the eager branch
   * for a component whose strategy was never read. Both assertions below are red on that default,
   * which reported `'onpush'`.
   */
  describe('change-detection metadata that cannot be read', () => {
    it("answers null, not 'onpush', when the runtime publishes no metadata function", async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph() });
      delete ng.getDirectiveMetadata;
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.ok(record, 'a cycle must still be recorded');
      assert.equal(record.detail.checks[0].changeDetection, null);
      assert.notEqual(record.detail.checks[0].changeDetection, 'onpush');
      assert.equal(record.detail.checks[0].componentName, 'app-counter');
    });

    it("answers null, not 'onpush', when the metadata read throws", async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph() });
      ng.getDirectiveMetadata = () => {
        throw new Error('no directive metadata for this instance');
      };
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.ok(record, 'a throwing metadata read must not lose the record');
      assert.equal(record.detail.checks[0].changeDetection, null);
      assert.notEqual(record.detail.checks[0].changeDetection, 'onpush');
    });

    it("still answers the strategy it read: 'eager' for an explicitly declared Default", async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph(), changeDetection: 1 });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.equal(record.detail.checks[0].changeDetection, 'eager');
    });
  });

  /**
   * The initial record: the one snapshot `tryInstall` publishes 500 ms after install, before any
   * profiler cycle exists.
   *
   * `dispatchInitialRecord` builds that check out of what the page hands it — a component node and
   * its class name — and reads no change-detection metadata at all. It used to fill that gap with
   * the literal `'onpush'`, asserting the best case for a component nobody read, one function below
   * the `return null` correction `changeDetectionFor` received for the same reason. The value is
   * now the `null` every unread path answers, and the two cases below are red the moment `'onpush'`
   * comes back: the first pins `null` itself, the second pins the wire the consumer receives.
   */
  describe('the initial record published after install', () => {
    /** Installs into a page with one component node and answers the initial record's detail. */
    function initialRecord() {
      const instance = new Counter();
      const element = { tagName: 'APP-COUNTER' };
      const { ng } = pageNg({ resolve: { getComponent: () => instance } });
      const document = {
        querySelector: () => ({ tagName: 'APP-ROOT' }),
        querySelectorAll: () => [element],
        body: { tagName: 'APP-ROOT' },
        documentElement: { tagName: 'APP-ROOT' },
      };
      const page = bootSandbox({ ng, document });
      page.sandbox.__ngRecorder.start();
      page.clock.tickMany(); // drains the shipped 500 ms initial-record timeout
      const record = page.dispatched.find(
        (event) => event.type === 'angular-ai:record',
      );
      assert.ok(record, 'the initial record must still be dispatched');
      return plain(record.detail);
    }

    it('records the strategy it did not read as null', () => {
      const detail = initialRecord();
      assert.equal(detail.checks.length, 1);
      assert.equal(detail.checks[0].componentName, 'Counter');
      assert.equal(detail.checks[0].changeDetection, null);
    });

    it("never says 'onpush' for a strategy the page did not supply", () => {
      const detail = initialRecord();
      assert.notEqual(detail.checks[0].changeDetection, 'onpush');
      // The serialised value the panel consumes, not a type this file invented: the field is
      // present and null, so the walk reads "no claim" rather than an absent key it must guess at.
      assert.match(JSON.stringify(detail), /"changeDetection":null/);
    });
  });

  describe('extractTriggerName (formatOutput-style)', () => {
    it('extracts the DOM event name from a generated listener name', () => {
      assert.equal(
        extractTrigger('Counter_Template_button_click_0_listener'),
        'click',
      );
      assert.equal(
        extractTrigger('Foo_Template_input_change_2_listener'),
        'change',
      );
      assert.equal(
        extractTrigger('App_Template_button_click_10_listener'),
        'click',
      );
    });
    it('extracts from a host-binding handler name', () => {
      assert.equal(
        extractTrigger('Counter_host_class_active_HostBindingHandler'),
        'active',
      );
    });
    it('returns null for names without a recognizable shape', () => {
      assert.equal(extractTrigger(null), null);
      assert.equal(extractTrigger(''), null);
      assert.equal(extractTrigger('not_a_listener'), null);
    });
  });

  describe('signal-graph capture and epoch diff', () => {
    it('resolves edges to global node ids in serialized graph', async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      const graph = record.detail.checks[0].graph;
      assert.ok(graph);
      // Edges should be resolved to node id strings, not raw indices.
      assert.equal(typeof graph.edges[0].consumer, 'string');
      assert.equal(typeof graph.edges[0].producer, 'string');
      assert.equal(graph.edges[0].consumer, 'n2');
      assert.equal(graph.edges[0].producer, 'n0');
      assert.equal(graph.edges[1].consumer, 'n2');
      assert.equal(graph.edges[1].producer, 'n1');
      assert.equal(graph.edges[2].consumer, 'n1');
      assert.equal(graph.edges[2].producer, 'n0');
    });

    it('serializes a graph that carries nodes but no edges instead of losing the record', async () => {
      const counter = new Counter();
      // The guard in serializeGraph substitutes { nodes: [], edges: [] } only
      // when `nodes` is missing. A graph with nodes and no edges passes that
      // guard, so `graph.edges.length` threw inside the record dispatch and
      // the whole record was lost.
      const { ng } = makeNg({ graph: { nodes: counterGraph().nodes } });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      assert.ok(record, 'a graph without edges must not lose the record');
      const graph = record.detail.checks[0].graph;
      assert.ok(graph, 'the graph must still be reported');
      assert.deepEqual(graph.edges, [], 'edges must default to an empty list');
      assert.ok(graph.nodes.length > 0, 'the nodes must survive');
    });

    it('marks graph as unavailable when no template node exists', async () => {
      const counter = new Counter();
      const noTemplateGraph = {
        nodes: [
          { id: 'n0', kind: 'signal', label: 'count', epoch: 1 },
          { id: 'n1', kind: 'computed', label: 'double', epoch: 1 },
        ],
        edges: [{ consumer: 1, producer: 0 }],
      };
      const { ng } = makeNg({ graph: noTemplateGraph });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      const graph = record.detail.checks[0].graph;
      assert.ok(graph);
      assert.equal(graph.unavailable, true);
    });

    it('does not mark graph as unavailable when template node exists', async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === 'angular-ai:record');
      const graph = record.detail.checks[0].graph;
      assert.ok(graph);
      assert.equal(graph.unavailable, undefined);
    });

    it('serializes the graph without signal values and diffs epochs across cycles', async () => {
      const counter = new Counter();
      const graphA = {
        nodes: [
          { id: 'n0', kind: 'signal', label: 'count', epoch: 1 },
          {
            id: 'n2',
            kind: 'template',
            label: 'app-counter',
            epoch: 1,
            debuggableFn: Counter,
          },
        ],
        edges: [{ consumer: 1, producer: 0 }],
      };
      const graphB = {
        nodes: [
          { id: 'n0', kind: 'signal', label: 'count', epoch: 2 },
          {
            id: 'n2',
            kind: 'template',
            label: 'app-counter',
            epoch: 2,
            debuggableFn: Counter,
          },
        ],
        edges: [{ consumer: 1, producer: 0 }],
      };
      const { ng } = makeNg({ graph: [graphA, graphB] });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const r1 = dispatched.filter((e) => e.type === 'angular-ai:record')[0];
      assert.deepEqual(r1.detail.checks[0].changedNodeIds, []);
      assert.equal(
        r1.detail.checks[0].graph.nodes[0].hasOwnProperty('value'),
        false,
      );
      assert.equal(r1.detail.checks[0].graph.nodes[1].debuggableFn, 'Counter');

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const r2 = dispatched.filter((e) => e.type === 'angular-ai:record')[1];
      assert.deepEqual(r2.detail.checks[0].changedNodeIds, ['n0', 'n2']);
    });

    it("reports 'not supported' when ɵgetSignalGraph is unavailable", () => {
      const { ng } = makeNg({ graph: null });
      delete ng.ɵgetSignalGraph;
      const { recorder, dispatched } = boot({ ng });
      const state = dispatched.find((e) => e.type === 'angular-ai:state');
      assert.equal(state.detail.supported, false);
      assert.match(String(state.detail.reason), /ɵgetSignalGraph/);
      assert.equal(recorder.installed, false);
    });
  });
});

describe('agent-main.js (DI doctor)', () => {
  var origAddEventListener;
  var origDocument;

  before(() => {
    origAddEventListener = globalThis.addEventListener;
    origDocument = globalThis.document;
  });

  afterEach(() => {
    if (
      globalThis.__ngRecorder &&
      typeof globalThis.__ngRecorder.reset === 'function'
    ) {
      globalThis.__ngRecorder.reset();
    }
    globalThis.addEventListener = origAddEventListener;
    if (origDocument !== undefined) {
      globalThis.document = origDocument;
    } else {
      delete globalThis.document;
    }
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    delete globalThis.__ngRecorder;
  });

  it('dispatches di-graph with DiResolutionPath format on di-query', () => {
    var diQueryCb = null;
    var capAdd = globalThis.addEventListener;
    globalThis.addEventListener = function (type, cb) {
      if (type === 'angular-ai:di-query') diQueryCb = cb;
      if (capAdd) capAdd.call(globalThis, type, cb);
    };

    globalThis.document = {
      querySelector: function () {
        return { tagName: 'APP-COUNTER' };
      },
    };

    var { ng } = makeNg();
    ng.ɵgetInjectorResolutionPath = function () {
      return [1, 2, 3];
    };
    ng.ɵgetInjectorMetadata = function () {
      return { type: 'environment', source: 'EnvironmentInjector' };
    };
    ng.ɵgetInjectorProviders = function () {
      return [
        {
          token: 'FooService',
          provider: { useValue: 1 },
          source: 'AppModule',
          importPath: 'app/module',
          isViewProvider: false,
        },
        {
          token: {
            name: 'BarToken',
            toString: function () {
              return 'InjectionToken BarToken';
            },
          },
          provider: { useFactory: function () {} },
          source: 'CounterComponent',
          isViewProvider: true,
        },
      ];
    };

    var { dispatched } = boot({ ng });
    globalThis.addEventListener = capAdd;

    assert.ok(
      diQueryCb,
      'handleDiQuery should be registered as di-query listener',
    );
    diQueryCb({
      detail: { componentName: 'app-counter', elementTag: 'app-counter' },
    });

    var diGraph = dispatched.find(function (e) {
      return e.type === 'angular-ai:di-graph';
    });
    assert.ok(diGraph, 'di-graph event should be dispatched');
    assert.equal(diGraph.detail.resolutionPath.component, 'app-counter');
    assert.equal(diGraph.detail.resolutionPath.elementTag, 'app-counter');
    assert.equal(diGraph.detail.resolutionPath.available, true);
    assert.equal(diGraph.detail.resolutionPath.path.length, 3);

    var inj0 = diGraph.detail.resolutionPath.path[0];
    assert.equal(inj0.id, 0);
    assert.equal(inj0.metadata.type, 'environment');
    assert.equal(inj0.metadata.source, 'EnvironmentInjector');
    assert.equal(inj0.providers.length, 2);
    assert.equal(inj0.providers[0].token, 'FooService');
    assert.equal(inj0.providers[0].provider, 'value');
    assert.equal(inj0.providers[0].isViewProvider, false);
    assert.equal(inj0.providers[0].importPath, 'app/module');
    assert.equal(inj0.providers[1].token, 'BarToken');
    assert.equal(inj0.providers[1].provider, 'factory');
    assert.equal(inj0.providers[1].isViewProvider, true);
  });

  it('falls back to single-injector path when ɵgetInjectorResolutionPath is unavailable', () => {
    var diQueryCb = null;
    var capAdd = globalThis.addEventListener;
    globalThis.addEventListener = function (type, cb) {
      if (type === 'angular-ai:di-query') diQueryCb = cb;
      if (capAdd) capAdd.call(globalThis, type, cb);
    };

    globalThis.document = {
      querySelector: function () {
        return { tagName: 'APP-COUNTER' };
      },
    };

    var { ng } = makeNg();
    delete ng.ɵgetInjectorResolutionPath;
    ng.ɵgetInjectorMetadata = function () {
      return { type: 'environment', source: 'RootInjector' };
    };
    ng.ɵgetInjectorProviders = function () {
      return [{ token: 'FooService', provider: { useValue: 1 } }];
    };

    var { dispatched } = boot({ ng });
    globalThis.addEventListener = capAdd;

    diQueryCb({
      detail: { componentName: 'app-root', elementTag: 'app-root' },
    });

    var diGraph = dispatched.find(function (e) {
      return e.type === 'angular-ai:di-graph';
    });
    assert.ok(
      diGraph,
      'di-graph event should be dispatched even with fallback',
    );
    assert.equal(diGraph.detail.resolutionPath.path.length, 1);
    assert.equal(
      diGraph.detail.resolutionPath.path[0].metadata.source,
      'RootInjector',
    );
  });

  it('uses componentName as querySelector fallback when elementTag is absent', () => {
    var diQueryCb = null;
    var capAdd = globalThis.addEventListener;
    globalThis.addEventListener = function (type, cb) {
      if (type === 'angular-ai:di-query') diQueryCb = cb;
      if (capAdd) capAdd.call(globalThis, type, cb);
    };

    var queriedSelector = null;
    globalThis.document = {
      querySelector: function (sel) {
        queriedSelector = sel;
        return { tagName: 'APP-COUNTER' };
      },
    };

    var { ng } = makeNg();
    ng.ɵgetInjectorResolutionPath = function () {
      return [];
    };
    ng.ɵgetInjectorMetadata = function () {
      return 'RootInjector';
    };
    ng.ɵgetInjectorProviders = function () {
      return [];
    };

    var { dispatched } = boot({ ng });
    globalThis.addEventListener = capAdd;

    diQueryCb({ detail: { componentName: 'app-counter', elementTag: null } });

    assert.equal(
      queriedSelector,
      'app-counter',
      'should fall back to componentName selector',
    );
    var diGraph = dispatched.find(function (e) {
      return e.type === 'angular-ai:di-graph';
    });
    assert.ok(diGraph);
    assert.equal(diGraph.detail.resolutionPath.available, true);
  });
});

// ---------------------------------------------------------------------------
// Companion opt-in probe (T004) — the page realm is a sandbox, never this process
// ---------------------------------------------------------------------------
//
// Two properties decide the shape of this block.
//
// 1. **The entry is injected into a stubbed page, never into this process's own global.** The
//    script is booted inside `vm.createContext`, so `globalThis.ngAiDevTools` is the sandbox's
//    property: a stub that would make detection true in the test but false in production cannot
//    pass here, and a boot leaves this process's global untouched (asserted).
// 2. **Time is driven through the sandbox's own timer.** The bounded re-check is asserted by
//    ticking a fake clock, never by waiting, so "re-emits once per change and then stops" is a
//    counted observation rather than a timing assumption.
const COMPANION_ENTRY_KEY = 'ngAiDevTools';

/** The accepted vocabulary this milestone fixes (INTENT.md § Interface contract). */
const COMPANION_VERSION = '0.2202.0';
const VETTED_SYMBOLS = [
  { pkg: '@angular/platform-browser', name: 'Meta' },
  { pkg: '@angular/router', name: 'Router' },
];

/** The classes the page's entry carries, and a second Angular copy's lookalikes. */
class VettedRouter {}
class VettedMeta {}
class SecondCopyRouter {}
class SecondCopyMeta {}

/** The eight `features` names, in the order `featuresOf` writes them. */
const FEATURE_NAMES = [
  'setProfiler',
  'getSignalGraph',
  'getHostElement',
  'getInjector',
  'getDirectiveMetadata',
  'getInjectorResolutionPath',
  'getInjectorMetadata',
  'getInjectorProviders',
];

/** A well-formed entry; `overrides` mutate one part of it per case. */
function vettedEntry(overrides = {}) {
  return {
    version: COMPANION_VERSION,
    '@angular/platform-browser': { Meta: VettedMeta },
    '@angular/router': { Router: VettedRouter },
    ...overrides,
  };
}

/** A deep copy into this realm, so `assert.deepEqual` compares values and not prototypes. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** True when any leaf of `value` is a function — a class object in the payload would be N4. */
function containsFunction(value) {
  if (typeof value === 'function') return true;
  if (value === null || typeof value !== 'object') return false;
  return Object.keys(value).some((key) => containsFunction(value[key]));
}

/** A deterministic clock: `tick()` fires the earliest due task, `tickMany()` drains the queue. */
function makeClock() {
  let now = 0;
  let nextId = 1;
  let intervalFires = 0;
  const tasks = new Map();
  return {
    get pending() {
      return tasks.size;
    },
    get repeating() {
      return [...tasks.values()].filter((task) => task.period !== null).length;
    },
    get intervalFires() {
      return intervalFires;
    },
    setTimeout(fn, ms) {
      const id = nextId++;
      tasks.set(id, {
        fn,
        due: now + Math.max(0, Number(ms) || 0),
        period: null,
      });
      return id;
    },
    setInterval(fn, ms) {
      const id = nextId++;
      const period = Math.max(1, Number(ms) || 1);
      tasks.set(id, { fn, due: now + period, period });
      return id;
    },
    clearTimeout(id) {
      tasks.delete(id);
    },
    clearInterval(id) {
      tasks.delete(id);
    },
    tick() {
      let next = null;
      for (const [id, task] of tasks) {
        if (
          next === null ||
          task.due < next.task.due ||
          (task.due === next.task.due && id < next.id)
        ) {
          next = { id, task };
        }
      }
      if (next === null) return false;
      now = next.task.due;
      if (next.task.period === null) {
        tasks.delete(next.id);
      } else {
        intervalFires += 1;
        next.task.due = now + next.task.period;
      }
      next.task.fn();
      return true;
    },
    tickMany(limit = 200) {
      let fired = 0;
      while (fired < limit && this.tick()) fired += 1;
      return fired;
    },
  };
}

/**
 * The page's `ng`, with the shipped identity walk: a root injector reached from `getInjector`, the
 * resolution path from `ɵgetInjectorResolutionPath`, and provider records from
 * `ɵgetInjectorProviders`. `injector.get` records every token it is asked for, so a lookup on a
 * vetted symbol is observable rather than inferred.
 */
function pageNg(options = {}) {
  const getCalls = [];
  const injector = {
    get(token) {
      getCalls.push(token);
      return null;
    },
  };
  const path = options.path ?? [injector];
  const providersFor = options.providersFor ?? (() => []);
  const ng = {
    ɵsetProfiler: () => () => {},
    ɵgetSignalGraph: () => ({ nodes: [], edges: [] }),
    getHostElement: () => ({ tagName: 'APP-COUNTER' }),
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getInjector: () => injector,
    ɵgetInjectorResolutionPath: () => path,
    ɵgetInjectorProviders: (candidate) => providersFor(candidate),
  };
  for (const [key, value] of Object.entries(options.resolve ?? {})) {
    if (value === undefined) delete ng[key];
    else ng[key] = value;
  }
  return { ng, injector, getCalls };
}

/** A page document stub: `detectZone` and the companion walk both need a root element. */
function pageDocument() {
  const root = { tagName: 'APP-ROOT' };
  return { querySelector: () => root, body: root, documentElement: root };
}

/**
 * Boots the real content script inside a fresh sandbox. `options.entry` is injected into the page
 * realm before the script runs; nothing is written to this process's global.
 */
function bootSandbox(options = {}) {
  const clock = makeClock();
  const dispatched = [];
  const sandbox = {
    performance: { now: () => 4242 },
    CustomEvent: function (type, eventOptions) {
      return { type, detail: eventOptions && eventOptions.detail };
    },
    dispatchEvent: (event) => {
      dispatched.push(event);
    },
    setTimeout: clock.setTimeout,
    clearTimeout: clock.clearTimeout,
    setInterval: clock.setInterval,
    clearInterval: clock.clearInterval,
  };
  if (options.ng !== undefined) sandbox.ng = options.ng;
  if (options.document !== undefined) sandbox.document = options.document;
  if (options.entry !== undefined) sandbox[COMPANION_ENTRY_KEY] = options.entry;
  if (options.Zone !== undefined) sandbox.Zone = options.Zone;

  const context = vm.createContext(sandbox);
  // Snapshot after contextification and before the script runs: the difference is exactly what the
  // content script itself adds to the page's global object.
  const keysBefore = Object.getOwnPropertyNames(sandbox);
  vm.runInContext(SRC, context, { filename: 'agent-main.js' });
  const keysAfter = Object.getOwnPropertyNames(sandbox);

  return {
    sandbox,
    context,
    clock,
    dispatched,
    keysBefore,
    keysAfter,
    states: () =>
      dispatched.filter((event) => event.type === 'angular-ai:state'),
    /** Injects the entry into the page realm after bootstrap, the way a late install would. */
    install: (entry) => {
      sandbox[COMPANION_ENTRY_KEY] = entry;
    },
  };
}

describe('agent-main.js (companion probe)', () => {
  it('answers `absent` for a page with no entry, and never writes the key itself (N1, N3)', () => {
    const { ng } = pageNg();
    const page = bootSandbox({ ng, document: pageDocument() });

    const states = page.states();
    assert.equal(
      states.length,
      1,
      'the page announces its state once at install',
    );
    const companion = plain(states[0].detail.companion);

    assert.equal(companion.state, 'absent');
    assert.equal(companion.version, null);
    assert.equal(companion.declared, 0);
    assert.equal(companion.resolved, 0);
    assert.deepEqual(companion.symbols, []);
    // A named state, not a boolean: no member of the answer is `true`/`false`.
    assert.deepEqual(
      Object.values(companion).filter((value) => typeof value === 'boolean'),
      [],
      'the answer is one of four names, not a presence boolean (N1)',
    );
    // The probe reads the page's key and never writes it.
    assert.equal(
      Object.hasOwn(page.sandbox, COMPANION_ENTRY_KEY),
      false,
      "the extension must not write the package's key",
    );
    // ...and the stub stayed in the sandbox: this process's global was never touched (AC8).
    assert.equal(Object.hasOwn(globalThis, COMPANION_ENTRY_KEY), false);
  });

  it('answers `declared` with the accepted symbols and counts declared and resolved apart (SC1)', () => {
    const entry = vettedEntry();
    const { ng, getCalls } = pageNg({
      providersFor: (injector) => [
        {
          token: VettedRouter,
          provider: {},
          source: 'AppModule',
          importPath: '@angular/router',
        },
        {
          token: VettedMeta,
          provider: {},
          source: 'AppModule',
          importPath: '@angular/platform-browser',
        },
      ],
    });
    const page = bootSandbox({ ng, document: pageDocument(), entry });

    const companion = plain(page.states()[0].detail.companion);
    assert.equal(companion.state, 'declared');
    assert.equal(companion.version, COMPANION_VERSION);
    assert.equal(companion.declared, 2);
    assert.equal(companion.resolved, 2);
    assert.deepEqual(companion.symbols, VETTED_SYMBOLS);
    assert.equal(
      companion.declared,
      companion.symbols.length,
      'declared counts exactly the symbols the answer carries',
    );

    // Resolution came from the provider records, never from a lookup on a vetted token (N4).
    assert.deepEqual(
      getCalls.filter(
        (token) => token === VettedRouter || token === VettedMeta,
      ),
      [],
      'no `injector.get` may be issued for a vetted symbol',
    );

    // A well-formed entry is answered once, so no re-check is left running.
    assert.equal(
      page.clock.repeating,
      0,
      'a non-absent answer is never re-checked',
    );
  });

  it('reports a second Angular copy as declared symbols with no resolved record (SC1)', () => {
    const entry = vettedEntry();
    const { ng } = pageNg({
      // The app's providers carry a *different* class object: a second copy of @angular/router.
      providersFor: () => [
        { token: SecondCopyRouter, provider: {} },
        { token: SecondCopyMeta, provider: {} },
      ],
    });
    const page = bootSandbox({ ng, document: pageDocument(), entry });

    const companion = plain(page.states()[0].detail.companion);
    assert.equal(companion.state, 'declared');
    assert.equal(companion.declared, 2, 'the entry declared both symbols');
    assert.equal(companion.resolved, 0, 'identity matched no provider record');
    assert.deepEqual(
      companion.symbols,
      VETTED_SYMBOLS,
      'a wiring defect must not read as an empty symbol list',
    );
  });

  it('counts one resolved symbol when only one identity matches, across the whole resolution path', () => {
    const entry = vettedEntry();
    const outer = { get: () => null };
    const inner = { get: () => null };
    const { ng } = pageNg({
      path: [outer, inner],
      providersFor: (injector) =>
        injector === inner ? [{ token: VettedMeta, provider: {} }] : [],
    });
    const page = bootSandbox({ ng, document: pageDocument(), entry });

    const companion = plain(page.states()[0].detail.companion);
    assert.equal(companion.declared, 2);
    assert.equal(
      companion.resolved,
      1,
      'the walk reached the injector that holds the record',
    );
  });

  it('answers `declared` with zero symbols for an empty table, not a refusal (E1)', () => {
    const page = bootSandbox({
      ng: pageNg().ng,
      document: pageDocument(),
      entry: { version: COMPANION_VERSION },
    });

    const companion = plain(page.states()[0].detail.companion);
    assert.equal(
      companion.state,
      'declared',
      'an empty table is the honest declared state, not `foreign-entry`',
    );
    assert.equal(companion.declared, 0);
    assert.equal(companion.resolved, 0);
    assert.deepEqual(companion.symbols, []);
  });

  it("refuses every entry that fails the package's own shape as `foreign-entry` (N1)", () => {
    const mutants = [
      ['a string stub', 'ngAiDevTools', null],
      ['a number stub', 42, null],
      ['null', null, null],
      ['an array', [], null],
      [
        'an object with no version',
        { '@angular/router': { Router: VettedRouter } },
        null,
      ],
      ['an empty version string', { ...vettedEntry(), version: '' }, null],
      ['a non-string version', { ...vettedEntry(), version: 2202 }, null],
      [
        'a group that is not an object',
        vettedEntry({ '@angular/router': 'Router' }),
        COMPANION_VERSION,
      ],
      [
        'a group that is null',
        vettedEntry({ '@angular/platform-browser': null }),
        COMPANION_VERSION,
      ],
      [
        'an unvetted symbol name',
        vettedEntry({
          '@angular/router': { Router: VettedRouter, NotVetted: () => {} },
        }),
        COMPANION_VERSION,
      ],
      [
        'an unvetted package group',
        vettedEntry({ '@angular/common': {} }),
        COMPANION_VERSION,
      ],
      [
        'a symbol whose value is not a function',
        vettedEntry({ '@angular/router': { Router: {} } }),
        COMPANION_VERSION,
      ],
      [
        'a symbol whose value is a string',
        vettedEntry({ '@angular/platform-browser': { Meta: 'Meta' } }),
        COMPANION_VERSION,
      ],
    ];

    for (const [label, entry, version] of mutants) {
      const page = bootSandbox({
        ng: pageNg().ng,
        document: pageDocument(),
        entry,
      });
      const companion = plain(page.states()[0].detail.companion);
      assert.equal(
        companion.state,
        'foreign-entry',
        `${label} must be refused as foreign-entry`,
      );
      assert.equal(
        companion.version,
        version,
        `${label} reports the version it could read, or null`,
      );
      assert.equal(companion.declared, 0, `${label} declares nothing`);
      assert.equal(companion.resolved, 0, `${label} resolves nothing`);
      assert.deepEqual(
        companion.symbols,
        [],
        `${label} carries no accepted symbol`,
      );
      assert.equal(
        Object.hasOwn(page.sandbox, COMPANION_ENTRY_KEY),
        true,
        `${label} stays where the page put it`,
      );
    }
  });

  it('answers `version-unsupported` for a well-formed entry at an unfamiliar version', () => {
    const page = bootSandbox({
      ng: pageNg().ng,
      document: pageDocument(),
      entry: { ...vettedEntry(), version: '0.0.1' },
    });

    const companion = plain(page.states()[0].detail.companion);
    assert.equal(companion.state, 'version-unsupported');
    assert.equal(
      companion.version,
      '0.0.1',
      'the panel names the version the entry declares',
    );
    assert.equal(companion.declared, 0);
    assert.equal(companion.resolved, 0);
    assert.deepEqual(companion.symbols, []);
  });

  it('accepts an entry that passes every check and publishes no class object (N4)', () => {
    const entry = vettedEntry();
    const { ng } = pageNg({
      providersFor: () => [{ token: VettedRouter, provider: {} }],
    });
    const page = bootSandbox({ ng, document: pageDocument(), entry });

    const detail = page.states()[0].detail;
    const companion = plain(detail.companion);
    assert.equal(companion.state, 'declared');
    assert.deepEqual(
      companion.symbols,
      VETTED_SYMBOLS,
      'the accepted symbols by pkg and name only',
    );
    for (const symbol of companion.symbols) {
      assert.deepEqual(Object.keys(symbol).sort(), ['name', 'pkg']);
    }
    assert.equal(
      containsFunction(detail),
      false,
      'a vetted class is a lookup token, never payload content (N4)',
    );
  });

  it('survives missing ɵ helpers: a declared answer with no resolvable record, and no throw', () => {
    const entry = vettedEntry();
    const { ng } = pageNg({ resolve: { ɵgetInjectorProviders: undefined } });
    const page = bootSandbox({ ng, document: pageDocument(), entry });
    const withoutProviders = plain(page.states()[0].detail.companion);
    assert.equal(withoutProviders.state, 'declared');
    assert.equal(withoutProviders.declared, 2);
    assert.equal(withoutProviders.resolved, 0);

    const noPath = pageNg({
      resolve: { ɵgetInjectorResolutionPath: undefined },
      providersFor: () => [{ token: VettedRouter, provider: {} }],
    });
    const fallback = bootSandbox({
      ng: noPath.ng,
      document: pageDocument(),
      entry,
    });
    const withoutPath = plain(fallback.states()[0].detail.companion);
    assert.equal(withoutPath.declared, 2);
    assert.equal(
      withoutPath.resolved,
      1,
      'with no resolution path the root injector is walked directly',
    );
  });

  it('survives a page with no document and no injector: declared, zero resolved', () => {
    const page = bootSandbox({ ng: pageNg().ng, entry: vettedEntry() });
    const companion = plain(page.states()[0].detail.companion);
    assert.equal(companion.state, 'declared');
    assert.equal(companion.declared, 2);
    assert.equal(companion.resolved, 0);
  });
});

describe('agent-main.js (companion field on the state record)', () => {
  it('carries `companion` as the fifth top-level field and keeps the four existing ones (SC2)', () => {
    const entry = vettedEntry();
    const page = bootSandbox({
      ng: pageNg().ng,
      document: pageDocument(),
      entry,
    });
    const detail = plain(page.states()[0].detail);

    assert.deepEqual(
      Object.keys(detail),
      ['supported', 'reason', 'zoneMode', 'features', 'companion'],
      'the fifth field is additive',
    );
    assert.equal(detail.supported, true);
    assert.equal(detail.reason, null);
    assert.equal(detail.zoneMode, 'noop');
    assert.deepEqual(
      Object.keys(detail.features),
      FEATURE_NAMES,
      'the eight `features` names are untouched, with no ninth',
    );
    for (const name of FEATURE_NAMES) {
      assert.equal(
        typeof detail.features[name],
        'boolean',
        `${name} keeps its boolean`,
      );
    }
    assert.equal(detail.companion.state, 'declared');
  });

  it('keeps the absent answer beside an unsupported page, without changing any other field', () => {
    // No ng on the page at all: the record is the shipped `supported:false` one, plus the named
    // absent companion answer.
    const page = bootSandbox({ ng: {}, document: pageDocument() });
    const detail = plain(page.states()[0].detail);
    assert.equal(detail.supported, false);
    assert.match(String(detail.reason), /ɵsetProfiler/);
    assert.deepEqual(Object.keys(detail.features), FEATURE_NAMES);
    assert.equal(detail.companion.state, 'absent');
  });
});

describe('agent-main.js (bounded companion re-check)', () => {
  it('re-emits the same record once when the answer changes away from absent, then stops (AC5, AC6)', () => {
    const entry = vettedEntry();
    const { ng } = pageNg({
      providersFor: () => [{ token: VettedRouter, provider: {} }],
    });
    const page = bootSandbox({ ng, document: pageDocument() });

    assert.equal(page.states().length, 1, 'the shipped one-shot record');
    assert.equal(
      page.clock.repeating,
      1,
      'exactly one re-check timer is armed for an absent answer',
    );

    // The app installs the package after bootstrap, where only the page can see it.
    page.install(entry);
    assert.equal(page.clock.tick(), true, 'the timer fires');
    assert.equal(
      page.states().length,
      2,
      'the answer changed, so the record is re-emitted',
    );

    const [first, second] = page.states().map((state) => plain(state.detail));
    assert.equal(first.companion.state, 'absent');
    assert.equal(second.companion.state, 'declared');
    assert.equal(second.companion.declared, 2);
    assert.equal(second.companion.resolved, 1);
    // The same record `tryInstall` publishes for the same page state: identical but for the answer.
    assert.deepEqual(
      { ...second, companion: null },
      { ...first, companion: null },
      'the four existing fields are unchanged',
    );

    assert.equal(
      page.clock.repeating,
      0,
      'the re-check is cleared on the first non-absent answer',
    );
    page.clock.tickMany(); // drains only the shipped 500 ms initial-record timeout
    assert.equal(page.clock.pending, 0, 'nothing is left scheduled');
    assert.equal(page.states().length, 2, 'and no third record is emitted');
    assert.ok(
      page.dispatched.every((event) => event.type === 'angular-ai:state'),
      'no new event type',
    );
  });

  it('stops on the last attempt while the answer stays absent, emitting no second record (AC5)', () => {
    const page = bootSandbox({ ng: pageNg().ng, document: pageDocument() });

    assert.equal(page.states().length, 1);
    assert.equal(page.clock.repeating, 1);

    // Each call to `tick` advances to the next due task; a live interval would never let this end.
    const fired = page.clock.tickMany();
    assert.ok(
      fired < 200,
      `the attempt budget must be finite; the queue drained after ${fired} ticks`,
    );
    assert.ok(
      page.clock.intervalFires >= 2,
      `a handful of attempts, not one; saw ${page.clock.intervalFires}`,
    );
    assert.ok(
      page.clock.intervalFires <= 10,
      `a handful of attempts, not a loop; saw ${page.clock.intervalFires}`,
    );
    assert.equal(
      page.clock.repeating,
      0,
      'the timer is cleared on the last attempt',
    );
    assert.equal(page.clock.pending, 0, 'nothing is left scheduled');
    assert.equal(
      page.states().length,
      1,
      'an unchanged absent answer is never re-emitted',
    );
  });

  it('ends the re-check on the first foreign answer it sees, without a third attempt', () => {
    const page = bootSandbox({ ng: pageNg().ng, document: pageDocument() });
    page.install({
      version: COMPANION_VERSION,
      '@angular/router': { Router: 'not-a-class' },
    });

    assert.equal(page.clock.tick(), true);
    assert.equal(page.states().length, 2);
    assert.equal(
      plain(page.states()[1].detail.companion).state,
      'foreign-entry',
    );
    assert.equal(page.clock.repeating, 0);
    page.clock.tickMany(); // drains only the shipped 500 ms initial-record timeout
    assert.equal(page.clock.pending, 0);
    assert.equal(page.states().length, 2);
  });
});

describe('agent-main.js (page blast radius)', () => {
  it("adds exactly `__ngRecorder` to the page's own globals and touches no other name (N3, N7)", () => {
    const page = bootSandbox({ ng: pageNg().ng, document: pageDocument() });
    const added = page.keysAfter.filter(
      (key) => !page.keysBefore.includes(key),
    );
    const removed = page.keysBefore.filter(
      (key) => !page.keysAfter.includes(key),
    );

    assert.deepEqual(
      added,
      ['__ngRecorder'],
      'the only page global the extension owns is the shipped one',
    );
    assert.deepEqual(removed, [], 'no name is removed');
    assert.equal(
      Object.hasOwn(page.sandbox, COMPANION_ENTRY_KEY),
      false,
      'the entry name is never written by the extension',
    );
  });

  it('writes no DOM node and raises no page prompt, confirm or toast (AR-3, AR-6, N7)', () => {
    const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(
      /\/\/[^\n]*/g,
      '',
    );
    for (const [what, pattern] of [
      ['a page alert', /\balert\s*\(/],
      ['a page confirm', /\bconfirm\s*\(/],
      ['a page prompt', /\bprompt\s*\(/],
      ['an element creation', /\bcreateElement\s*\(/],
      ['a node insertion', /\bappendChild\s*\(/],
      ['an innerHTML write', /\binnerHTML\b/],
      ['a storage write', /\b(localStorage|sessionStorage)\b/],
    ]) {
      assert.equal(
        pattern.test(code),
        false,
        `the page realm must contain no ${what}: ${pattern}`,
      );
    }
    // One global property assignment in the whole script, and it is the shipped recorder handle.
    const writes = [
      ...code.matchAll(
        /\bglobalThis\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])\s*=[^=]/g,
      ),
    ].map((match) => match[1] ?? match[2]);
    assert.deepEqual(
      [...new Set(writes)],
      ['__ngRecorder'],
      `the script writes one global name; wrote ${JSON.stringify(writes)}`,
    );
  });

  it('spells the accepted vocabulary once: one version, the two vetted symbols, no third', () => {
    const code = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(
      /\/\/[^\n]*/g,
      '',
    );
    assert.equal(
      (code.match(/0\.2202\.0/g) ?? []).length,
      1,
      'the accepted version appears exactly once',
    );
    const packages = [
      ...new Set(
        [...code.matchAll(/["'](@angular\/[a-z-]+)["']/g)].map(
          (match) => match[1],
        ),
      ),
    ].sort();
    assert.deepEqual(
      packages,
      VETTED_SYMBOLS.map((symbol) => symbol.pkg).sort(),
      'exactly the two vetted packages',
    );
    assert.equal(
      code.includes(`"${COMPANION_ENTRY_KEY}"`) ||
        code.includes(`'${COMPANION_ENTRY_KEY}'`),
      true,
      'the entry name is spelled as the package writes it',
    );
    for (const symbol of VETTED_SYMBOLS) {
      assert.ok(
        code.includes(`"${symbol.name}"`) || code.includes(`'${symbol.name}'`),
        `the table must carry ${symbol.pkg}#${symbol.name}`,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Picker: resolve a picked page element in the MAIN world (T006, SC2)
// ---------------------------------------------------------------------------
//
// The sandbox is the page. Every case below drives the listener the script itself registers, with a
// fabricated element tree and a fabricated `ng`, so what is asserted is this file's behaviour and
// not a real component's. The three named outcomes are driven apart and compared apart, because
// collapsing two of them is the failure E4 exists to prevent. The vocabulary is INTENT
// § Corrections (2026-11-03): `__ngContext__` is written in production builds too, so a page with no
// debug API is `no-dev-api`, never the superseded `no-dev-context`.
const PICK_EVENT = 'angular-ai:pick';
const PICKED_EVENT = 'angular-ai:picked';

/** A fabricated DOM node: the listener reads exactly `tagName`, `parentElement`, `__ngContext__`. */
function pageNode(tagName, parent = null, context = {}) {
  return {
    tagName: String(tagName).toUpperCase(),
    parentElement: parent,
    __ngContext__: context,
  };
}

/**
 * Boots the script with the pick registration captured instead of attached to this process, so the
 * test drives the listener the shipped code registered rather than a copy of its body. Every boot
 * handle is collected, because a test boots more than one page and a leaked companion re-check timer
 * would turn a regression into a hang instead of a failed assertion.
 */
const PICK_BOOTS = [];

function bootPickPage(ng = {}) {
  const registered = [];
  const capAdd = globalThis.addEventListener;
  globalThis.addEventListener = function (type, callback, options) {
    if (type === PICK_EVENT) {
      registered.push({ callback, options });
      return;
    }
    if (capAdd) capAdd.call(globalThis, type, callback, options);
  };
  // `ng` is always an object here: a boot with no `ng` at all arms the shipped retry interval, which
  // is that feature's polling and not this one's — the no-`ng` case is driven by deleting the global
  // after boot instead.
  const booted = boot({ ng });
  globalThis.addEventListener = capAdd;
  PICK_BOOTS.push(booted.recorder);
  return {
    ...booted,
    registered,
    handler() {
      assert.equal(
        registered.length,
        1,
        'exactly one pick listener is registered',
      );
      return registered[0].callback;
    },
    picked: () =>
      booted.dispatched.filter((event) => event.type === PICKED_EVENT),
  };
}

class ShellComponent {}
class CardComponent {}

/**
 * `app-shell` (host of Shell) > `my-card` (host of Card) > `button` (inside Card's view).
 * `getOwningComponent` answers the component whose view holds the node, so the picked button belongs
 * to Card; `getComponent` deliberately answers the outer component, which is what a resolver chosen
 * for the wrong reason would report.
 */
function pageComponentTree() {
  const shell = pageNode('app-shell');
  const card = pageNode('my-card', shell);
  const button = pageNode('button', card);
  const shellInstance = new ShellComponent();
  const cardInstance = new CardComponent();
  const owningFor = new Map([
    [button, cardInstance],
    [card, shellInstance],
    [shell, shellInstance],
  ]);
  const hostTagFor = new Map([
    [cardInstance, 'MY-CARD'],
    [shellInstance, 'APP-SHELL'],
  ]);
  const calls = { owning: 0, getComponent: 0 };
  const ng = {
    getOwningComponent(node) {
      calls.owning += 1;
      return owningFor.get(node) ?? null;
    },
    getComponent() {
      calls.getComponent += 1;
      return shellInstance;
    },
    getHostElement(instance) {
      return { tagName: hostTagFor.get(instance) };
    },
  };
  return { button, card, shell, cardInstance, shellInstance, ng, calls };
}

describe('agent-main.js (page-realm pick resolution)', () => {
  let origAddEventListener;
  let origDocument;

  before(() => {
    origAddEventListener = globalThis.addEventListener;
    origDocument = globalThis.document;
  });

  afterEach(() => {
    if (
      globalThis.__ngRecorder &&
      typeof globalThis.__ngRecorder.reset === 'function'
    ) {
      globalThis.__ngRecorder.reset();
    }
    // A test may boot more than one page; each boot armed its own bounded re-check timer, and a
    // leaked interval would keep this process alive after the last assertion.
    for (const recorder of PICK_BOOTS.splice(0)) {
      if (recorder && typeof recorder.reset === 'function') recorder.reset();
    }
    globalThis.addEventListener = origAddEventListener;
    if (origDocument === undefined) delete globalThis.document;
    else globalThis.document = origDocument;
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    delete globalThis.__ngRecorder;
  });

  it('registers one capture-phase pick listener and adds no page global (AC1, AC6)', () => {
    const { button, ng } = pageComponentTree();
    const page = bootPickPage(ng);

    assert.equal(
      page.registered.length,
      1,
      'one listener, beside the shipped ones',
    );
    const { options } = page.registered[0];
    const capture = options === true || (options && options.capture === true);
    assert.equal(
      capture,
      true,
      'the listener must run in the capture phase to see a bubbled pick',
    );

    const before = Object.getOwnPropertyNames(globalThis);
    page.handler()({ target: button });
    assert.equal(page.picked().length, 1, 'the answer is one event');
    assert.deepEqual(
      Object.getOwnPropertyNames(globalThis).filter(
        (key) => !before.includes(key),
      ),
      [],
      'resolving a pick writes no page global',
    );
  });

  it("resolves an element inside a component's view to that component, not to its host's parent (E5, AC2)", () => {
    const { button, ng, calls } = pageComponentTree();
    const page = bootPickPage(ng);

    page.handler()({ target: button });

    const [answer] = page.picked();
    assert.ok(answer, 'a pick is always answered');
    assert.deepEqual(answer.detail, {
      status: 'resolved',
      elementTag: 'button',
      componentName: 'my-card',
      className: 'CardComponent',
      componentPath: ['CardComponent', 'ShellComponent'],
    });
    assert.equal(
      calls.getComponent,
      0,
      'getComponent answers the outer component and is never consulted',
    );
    assert.ok(calls.owning >= 2, 'the resolver is the owning-component walk');
  });

  it('names the element, the owning component and the distinct class path as the panel lists them (AC5)', () => {
    const { button, ng } = pageComponentTree();
    const page = bootPickPage(ng);

    page.handler()({ target: button });
    const descriptor = page.picked()[0].detail;

    assert.equal(
      descriptor.elementTag,
      'button',
      "the element's tag, lowercased",
    );
    assert.equal(
      descriptor.componentName,
      'my-card',
      "the owning instance's host tag, lowercased",
    );
    assert.equal(
      descriptor.className,
      'CardComponent',
      'the constructor name, not a lowercased copy',
    );
    assert.deepEqual(
      descriptor.componentPath,
      ['CardComponent', 'ShellComponent'],
      'innermost first, distinct',
    );
    assert.deepEqual(Object.keys(descriptor), [
      'status',
      'elementTag',
      'componentName',
      'className',
      'componentPath',
    ]);
  });

  it('bounds the path by ancestor depth and never queries the document (AC5)', () => {
    // A 200-deep chain: picked at the bottom, so a walk that trusted the document would run past the
    // bound this file sets on itself.
    const chain = [];
    let parent = null;
    for (let index = 0; index < 200; index += 1) {
      const el = pageNode('div', parent);
      chain.push(el);
      parent = el;
    }
    const picked = chain[chain.length - 1];
    const owningFor = new Map(
      chain.map((el, index) => [el, new (namedFn('Layer' + index))()]),
    );
    const calls = { owning: 0 };
    let queries = 0;
    globalThis.document = {
      querySelector() {
        queries += 1;
        return null;
      },
      querySelectorAll() {
        queries += 1;
        return [];
      },
      body: null,
      documentElement: null,
    };

    const page = bootPickPage({
      getOwningComponent(node) {
        calls.owning += 1;
        return owningFor.get(node) ?? null;
      },
      getHostElement: () => ({ tagName: 'DIV' }),
    });
    const afterBoot = queries;

    page.handler()({ target: picked });
    const descriptor = page.picked()[0].detail;

    assert.equal(descriptor.status, 'resolved');
    assert.equal(
      descriptor.componentPath[0],
      'Layer199',
      "the path starts at the picked element's own component",
    );
    assert.equal(
      descriptor.componentPath.length,
      calls.owning,
      'one distinct name per consulted ancestor',
    );
    assert.ok(
      calls.owning <= 64,
      `the walk stops at a fixed depth, not at the document root; asked ${calls.owning} nodes`,
    );
    assert.ok(
      calls.owning < chain.length,
      'the deep ancestors above the bound are never consulted',
    );
    assert.equal(
      new Set(descriptor.componentPath).size,
      descriptor.componentPath.length,
      'the path carries distinct names',
    );
    assert.equal(
      queries,
      afterBoot,
      'resolution reads the picked node and its ancestors, never a document query',
    );
  });

  it('answers no-dev-api for an element with no __ngContext__, and never no-component (E4, AC3)', () => {
    for (const context of [undefined, null]) {
      const { button, ng, calls } = pageComponentTree();
      if (context === null) delete button.__ngContext__;
      else button.__ngContext__ = undefined;
      const page = bootPickPage(ng);

      page.handler()({ target: button });
      const descriptor = page.picked()[0].detail;

      assert.equal(descriptor.status, 'no-dev-api');
      assert.notEqual(
        descriptor.status,
        'no-dev-context',
        'INTENT § Corrections 2026-11-03 supersedes that name',
      );
      assert.notEqual(
        descriptor.status,
        'no-component',
        'a missing dev context is never collapsed into no-component',
      );
      assert.deepEqual(
        Object.keys(descriptor),
        ['status', 'reason'],
        'the state is named and carries its reason',
      );
      assert.match(
        String(descriptor.reason),
        /may be a production build/,
        'the possibility is named, not asserted',
      );
      assert.equal(
        calls.owning,
        0,
        'no resolver call is made without a dev context',
      );
    }
  });

  it('answers no-dev-api for a page with a partial debug API, and for a page with no ng at all (E4)', () => {
    const partial = bootPickPage({
      getHostElement: () => ({ tagName: 'APP-ROOT' }),
    });
    partial.handler()({ target: pageNode('div') });
    const [partialAnswer] = partial.picked();
    assert.ok(
      partialAnswer,
      'a page with a partial debug API is still answered',
    );
    assert.equal(
      partialAnswer.detail.status,
      'no-dev-api',
      'the absent component getter is the dev-API state',
    );
    assert.match(
      String(partialAnswer.detail.reason),
      /may be a production build/,
      'the possibility is named',
    );

    const bare = bootPickPage({});
    delete globalThis.ng;
    assert.doesNotThrow(() => bare.handler()({ target: pageNode('div') }));
    const [bareAnswer] = bare.picked();
    assert.ok(
      bareAnswer,
      "a page with no ng at all is still answered, not left to the overlay's timer",
    );
    assert.equal(bareAnswer.detail.status, 'no-dev-api');
    assert.match(String(bareAnswer.detail.reason), /may be a production build/);
  });

  it('answers no-component for a dev context with no owning instance (AC4)', () => {
    const page = bootPickPage({
      getOwningComponent: () => null,
      getHostElement: () => ({ tagName: 'DIV' }),
    });

    page.handler()({ target: pageNode('span') });
    const descriptor = page.picked()[0].detail;

    assert.deepEqual(
      descriptor,
      { status: 'no-component' },
      'no reason and no element are invented for this state',
    );
  });

  it('keeps the three named outcomes distinguishable in the dispatched payload (AC4)', () => {
    const tree = pageComponentTree();
    const resolvedPage = bootPickPage(tree.ng);
    resolvedPage.handler()({ target: tree.button });

    const noDevApiPage = bootPickPage({
      getHostElement: () => ({ tagName: 'APP-ROOT' }),
    });
    noDevApiPage.handler()({ target: pageNode('div') });

    const noComponentPage = bootPickPage({ getOwningComponent: () => null });
    noComponentPage.handler()({ target: pageNode('div') });

    const statuses = [resolvedPage, noDevApiPage, noComponentPage].map(
      (page) => page.picked()[0].detail.status,
    );
    assert.deepEqual(statuses, ['resolved', 'no-dev-api', 'no-component']);
    assert.equal(
      new Set(statuses).size,
      3,
      'three outcomes, never one collapsed state',
    );
  });

  it('carries plain data only: a JSON round-trip equals itself and no __ngContext__ value escapes (N2, AC6)', () => {
    const { button, ng } = pageComponentTree();
    button.__ngContext__ = { secretSentinel: 'CONTEXT-SENTINEL' };
    const page = bootPickPage(ng);

    page.handler()({ target: button });
    const descriptor = page.picked()[0].detail;

    assert.deepEqual(
      JSON.parse(JSON.stringify(descriptor)),
      descriptor,
      'the payload round-trips unchanged',
    );
    assert.equal(
      containsFunction(descriptor),
      false,
      'no function crosses the boundary',
    );
    assert.equal(
      Object.hasOwn(descriptor, '__ngContext__'),
      false,
      'the dev context is read, never carried',
    );
    const json = JSON.stringify(descriptor);
    assert.equal(
      json.includes('CONTEXT-SENTINEL'),
      false,
      'no value out of the dev context crosses',
    );
    assert.equal(json.includes('__ngContext__'), false);
    for (const [key, value] of Object.entries(descriptor)) {
      const plainLeaf = Array.isArray(value)
        ? value.every((entry) => typeof entry === 'string')
        : typeof value === 'string';
      assert.ok(plainLeaf, `${key} is a string or an array of strings`);
    }
  });

  it('throws nothing into the page, and never reads a pick payload object (AC6)', () => {
    const page = bootPickPage({
      getOwningComponent() {
        throw new Error('page defect: the resolver threw');
      },
      getHostElement() {
        throw new Error('page defect: the host element threw');
      },
    });
    const event = { target: pageNode('section') };
    Object.defineProperty(event, 'detail', {
      get() {
        throw new Error(
          'the pick payload must not be read; event.target is the carrier',
        );
      },
    });

    assert.doesNotThrow(() => page.handler()(event));
    assert.deepEqual(
      page.picked()[0].detail,
      { status: 'no-component' },
      'a throwing resolver answers, never throws',
    );

    const quiet = bootPickPage({ getOwningComponent: () => null });
    assert.doesNotThrow(() => quiet.handler()({}));
    assert.equal(
      quiet.picked().length,
      0,
      'an event with no target claims nothing',
    );
  });

  it('falls back to the class name lowercased when the host element cannot be read (AC5)', () => {
    const { button } = pageComponentTree();
    const page = bootPickPage({
      getOwningComponent: (node) =>
        node === button ? new CardComponent() : null,
      getHostElement() {
        throw new Error('page defect');
      },
    });

    page.handler()({ target: button });

    assert.deepEqual(page.picked()[0].detail, {
      status: 'resolved',
      elementTag: 'button',
      componentName: 'cardcomponent',
      className: 'CardComponent',
      componentPath: ['CardComponent'],
    });
  });
});

// ---------------------------------------------------------------------------
// The five paired work events reach one frame-level list (T002, SC2, held-out E3)
// ---------------------------------------------------------------------------
//
// T001 measured what the ends of each pair carry (`research/raw/m040-work-events.json`):
// `TemplateUpdate`, `LifecycleHook` and `HostBindingsUpdate` pass an instance at both ends, `Component`
// at its end only — every `ComponentStart` measured `null` — and `ChangeDetection` at neither, 3/3 on
// both pages. The block below drives the shipped subscriber with exactly that frame, so what is
// asserted is the record the page produces and not a copy of the record's builder.
//
// Three halves are pinned together, because SC2 is a requirement about all three at once:
//
//   1. **one list, one shape.** Every recorded value reaches `record.events` in emission order, each
//      entry `{ type, pair, end, at, componentName }` — the same five fields for an added event as for
//      the four the recorder already recorded.
//   2. **additive.** `OutputStart` still sets the trigger, `TemplateUpdateStart` still opens the cycle,
//      the per-check `events` list still carries bare event numbers, and the added events create no
//      check and open no cycle.
//   3. **a surface reads fields, never a number.** The pair and the end bit travel with the entry, so
//      a reader answers from `pair`/`end`/`componentName` — and answers the same with the event number
//      scrambled. The shipped builder names no value at all.
//
// Each pin is proven non-vacuously at the end of the block: the untouched source passes, one anchored
// mutant of the shipped file reddens it, and the failure names the defect by string.

/** Every value the agent records, as `[pair, isEnd]`, keyed by the number the profiler passes. */
const RECORDED_PAIRS = {
  [PE.TemplateUpdateStart]: ['TemplateUpdate', false],
  [PE.TemplateUpdateEnd]: ['TemplateUpdate', true],
  [PE.LifecycleHookStart]: ['LifecycleHook', false],
  [PE.LifecycleHookEnd]: ['LifecycleHook', true],
  [PE.OutputStart]: ['Output', false],
  [PE.OutputEnd]: ['Output', true],
  [PE.ChangeDetectionStart]: ['ChangeDetection', false],
  [PE.ChangeDetectionEnd]: ['ChangeDetection', true],
  [PE.ComponentStart]: ['Component', false],
  [PE.ComponentEnd]: ['Component', true],
  [PE.HostBindingsUpdateStart]: ['HostBindingsUpdate', false],
  [PE.HostBindingsUpdateEnd]: ['HostBindingsUpdate', true],
};

/** The one entry shape the interface contract fixes, in its field order. */
const FRAME_ENTRY_KEYS = ['type', 'pair', 'end', 'at', 'componentName'];

/** The emission order this block drives: T001's recorded frame order with the output pair ahead. */
const FRAME_ORDER = [
  PE.OutputStart,
  PE.OutputEnd,
  PE.ChangeDetectionStart,
  PE.TemplateUpdateStart,
  PE.LifecycleHookStart,
  PE.LifecycleHookEnd,
  PE.ComponentStart,
  PE.ComponentEnd,
  PE.HostBindingsUpdateStart,
  PE.HostBindingsUpdateEnd,
  PE.TemplateUpdateEnd,
  PE.ChangeDetectionEnd,
];

/**
 * The identity each value measured, read off T001's witness: three pairs carry one at both ends,
 * `Component` at its end only, `ChangeDetection` at neither. The page below names its three instances
 * differently, so an entry's name is checkable rather than a constant.
 */
const MEASURED_IDENTITY = {
  [PE.TemplateUpdateStart]: 'app-counter',
  [PE.TemplateUpdateEnd]: 'app-counter',
  [PE.LifecycleHookStart]: 'app-form-root',
  [PE.LifecycleHookEnd]: 'app-form-root',
  [PE.OutputStart]: 'app-counter',
  [PE.OutputEnd]: 'app-counter',
  [PE.ChangeDetectionStart]: null,
  [PE.ChangeDetectionEnd]: null,
  [PE.ComponentStart]: null,
  [PE.ComponentEnd]: 'child-cmp',
  [PE.HostBindingsUpdateStart]: 'app-form-root',
  [PE.HostBindingsUpdateEnd]: 'app-form-root',
};

/** The name of a recorded value, from this file's copy of the agent's literal. */
function nameOf(type) {
  const found = Object.keys(PE).find((name) => PE[name] === type);
  return found ?? `event ${type}`;
}

/** Every `angular-ai:record` a boot dispatched. */
function recordsOf(dispatched) {
  return dispatched.filter((event) => event.type === 'angular-ai:record');
}

/** The one record this frame produced, or a failure that names what arrived instead. */
function theFrame(dispatched) {
  const records = recordsOf(dispatched);
  assert.equal(
    records.length,
    1,
    `TemplateUpdateStart must still open the cycle and the queued microtask must close it: exactly one record per frame, and this run dispatched ${records.length}`,
  );
  return records[0].detail;
}

/** The recorders this block booted, reset after each test so no page timer outlives its assertions. */
const WORK_BOOTS = [];

/**
 * A page whose three instances carry three different host tags, so a name an entry records can be
 * told apart from the name a neighbour or a fallback word would produce.
 */
function workPage() {
  const counter = new (namedFn('Counter'))();
  const directive = new (namedFn('FormRoot'))();
  const child = new (namedFn('Child'))();
  const tags = new Map([
    [counter, 'APP-COUNTER'],
    [directive, 'APP-FORM-ROOT'],
    [child, 'CHILD-CMP'],
  ]);
  const captured = { profilerCalls: 0 };
  const ng = {
    ɵsetProfiler(callback) {
      captured.profilerCalls += 1;
      captured.subscriber = callback;
      return () => {};
    },
    ɵgetSignalGraph: () => counterGraph(),
    getHostElement(instance) {
      if (!tags.has(instance)) throw new Error('no host element here');
      return { tagName: tags.get(instance) };
    },
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getInjector: () => ({ get: () => null }),
  };
  return { ng, captured, counter, directive, child, tags };
}

/**
 * Boots the (possibly mutated) script on that page and hands it a page clock that advances on every
 * read, so a receipt time is a measurement: two receipts are two different readings.
 */
function bootWorkPage(options = {}) {
  const page = workPage();
  const booted = bootSource(options.source ?? SRC, { ng: page.ng });
  WORK_BOOTS.push(booted.recorder);
  let now = 500;
  globalThis.performance = {
    now: () => {
      now += 1;
      return now;
    },
  };
  assert.equal(
    page.captured.profilerCalls,
    1,
    'the widening extends the one subscription and never adds a second tap',
  );
  return { ...page, ...booted, subscriber: booted.recorder.getSubscriber() };
}

/** The measured frame: one call per emission, with the arguments the profiler passes at that site. */
function driveMeasuredFrame(page) {
  const sub = page.subscriber;
  const listener = namedFn('Counter_Template_button_click_0_listener');
  sub(PE.OutputStart, page.counter, listener);
  sub(PE.OutputEnd, page.counter, listener);
  sub(PE.ChangeDetectionStart); // the site passes no instance, so the profiler's default is null
  sub(PE.TemplateUpdateStart, page.counter);
  sub(PE.LifecycleHookStart, page.directive);
  sub(PE.LifecycleHookEnd, page.directive);
  sub(PE.ComponentStart); // measured: every ComponentStart arrives with a null instance
  sub(PE.ComponentEnd, page.child);
  sub(PE.HostBindingsUpdateStart, page.directive);
  sub(PE.HostBindingsUpdateEnd, page.directive);
  sub(PE.TemplateUpdateEnd, page.counter);
  sub(PE.ChangeDetectionEnd);
}

/**
 * A surface: it answers from the entry's fields and never from its number, which is what the record's
 * shape exists for.
 */
function surfaceOf(entry) {
  return (
    entry.pair +
    ':' +
    (entry.end ? 'end' : 'start') +
    ' ' +
    (entry.componentName === null ? '(no component)' : entry.componentName)
  );
}

/**
 * The pin. Every failure names the value or the field it is about, so a mutant reports the defect
 * rather than a diff nobody can read.
 */
function assertMeasuredFrame(detail) {
  assert.deepEqual(
    Object.keys(detail),
    [
      'cycleId',
      'startedAt',
      'trigger',
      'zoneMode',
      'events',
      'routerEvents',
      // Re-cut for T003: this assertion read
      //   ['cycleId','startedAt','trigger','zoneMode','events','routerEvents','checks']
      // and failed with `+ 'boundary'` present in `actual` once the boundary record was added beside
      // the router's list. The additive rule is unchanged — the four recorded fields keep their
      // order, `events` is the first additive field, the router list the second, the boundary record
      // the third, and `checks` stays last.
      //
      // Re-cut again for M043 T001, which failed with `+ 'stability'` present in `actual`:
      //   actual:   [..., 'boundary', 'stability', 'checks']
      //   expected: [..., 'boundary', 'checks']
      // The fourth additive field, and still not a change to the four recorded ones.
      'boundary',
      'stability',
      'checks',
    ],
    'the frame-level list must be additive: the four recorded fields keep their order, `events` is added, the router list and the boundary record are added beside it and `checks` stays last',
  );

  const entries = detail.events;
  assert.ok(
    Array.isArray(entries),
    `the record must publish the frame's work as a list \`events\`; it published ${JSON.stringify(entries)}`,
  );
  for (const type of FRAME_ORDER) {
    assert.ok(
      entries.some((entry) => entry.type === type),
      `${nameOf(type)} (${type}) must reach the frame-level list; the record holds ${JSON.stringify(entries.map((entry) => entry.type))}`,
    );
  }
  assert.deepEqual(
    entries.map((entry) => entry.type),
    FRAME_ORDER,
    'the frame-level list must hold one entry per recorded event in emission order; a value out of place means the list was reordered by name or by pair',
  );

  entries.forEach((entry, index) => {
    assert.deepEqual(
      Object.keys(entry),
      FRAME_ENTRY_KEYS,
      `the frame-level list must use one shape for every recorded value: entry ${index} (${nameOf(entry.type)}) carries ${JSON.stringify(Object.keys(entry))}`,
    );
    const [pair, end] = RECORDED_PAIRS[entry.type];
    assert.equal(
      entry.pair,
      pair,
      `entry ${index} (${nameOf(entry.type)}) must carry pair ${JSON.stringify(pair)}; it carries ${JSON.stringify(entry.pair)}`,
    );
    assert.equal(
      entry.end,
      end,
      `entry ${index} (${nameOf(entry.type)}) must carry end ${end}; it carries ${JSON.stringify(entry.end)}`,
    );
    assert.equal(
      typeof entry.at,
      'number',
      `entry ${index} (${nameOf(entry.type)}) must carry the page's own receipt time; it carries ${JSON.stringify(entry.at)}`,
    );
    if (MEASURED_IDENTITY[entry.type] === null) {
      assert.equal(
        entry.componentName,
        null,
        `an event the profiler passed no instance for must record componentName null, never a name derived from a node index, a list position, a neighbour or the recorder's fallback; ${nameOf(entry.type)} (${entry.type}) recorded ${JSON.stringify(entry.componentName)}`,
      );
    } else {
      assert.equal(
        entry.componentName,
        MEASURED_IDENTITY[entry.type],
        `${nameOf(entry.type)} (${entry.type}) must record the identity the profiler's instance yielded, ${JSON.stringify(MEASURED_IDENTITY[entry.type])}; it recorded ${JSON.stringify(entry.componentName)}`,
      );
    }
  });

  const times = entries.map((entry) => entry.at);
  assert.deepEqual(
    [...times].sort((left, right) => left - right),
    times,
    'the receipt times must be the readings of the page clock, in emission order',
  );
  assert.equal(
    new Set(times).size,
    times.length,
    'each entry carries its own receipt reading, so no entry borrows a neighbour`s time',
  );
  for (const pair of ['TemplateUpdate', 'LifecycleHook', 'Component']) {
    const start = entries.find((entry) => entry.pair === pair && !entry.end);
    const end = entries.find((entry) => entry.pair === pair && entry.end);
    assert.ok(
      end.at - start.at > 0,
      `${pair}'s duration is its end's measured receipt minus its start's; this page clock advanced between them, so a zero or negative difference means a time was reconstructed instead of read`,
    );
  }

  assert.equal(
    detail.checks.length,
    1,
    'the added events must not create a check: TemplateUpdateStart alone opens the cycle and creates one',
  );
  assert.deepEqual(
    detail.checks[0].events,
    [PE.TemplateUpdateStart, PE.TemplateUpdateEnd],
    'the per-check `events` list must still carry the bare event numbers it carried before T002 — the template update pair here, because the output pair arrived before the cycle opened — and none of the ten added values',
  );
  for (const check of detail.checks) {
    for (const value of check.events) {
      assert.ok(
        [
          PE.TemplateUpdateStart,
          PE.TemplateUpdateEnd,
          PE.OutputStart,
          PE.OutputEnd,
        ].includes(value),
        `the per-check list carries one of the four values T002 left alone; it carries ${nameOf(value)} (${value}), which is an added value`,
      );
    }
  }
  assert.equal(
    detail.trigger.kind,
    'output',
    'OutputStart must still set the cycle trigger, which the change-detection chain reads',
  );
  assert.equal(
    detail.trigger.listenerName,
    'click',
    'the trigger must still name the DOM event the listener name carries',
  );
}

/**
 * One anchored mutation of the shipped source. The anchor must appear exactly once, so a pin that no
 * longer mutates anything fails loudly instead of proving nothing.
 */
function mutantOf(anchor, replacement) {
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the mutant anchor ${JSON.stringify(anchor)} must appear once in extension/agent-main.js; it appears ${occurrences} time(s) — restate the mutant instead of deleting it`,
  );
  return SRC.replace(anchor, replacement);
}

/** Boots a mutant, drives the measured frame and hands the pin the detail it produced. */
async function frameOfMutant(source) {
  const page = bootWorkPage({ source });
  driveMeasuredFrame(page);
  await flushMicrotasks();
  return theFrame(page.dispatched);
}

describe('agent-main.js (the five paired work events, T002)', () => {
  afterEach(() => {
    for (const recorder of WORK_BOOTS.splice(0)) {
      if (recorder && typeof recorder.reset === 'function') recorder.reset();
    }
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    delete globalThis.__ngRecorder;
  });

  it('records the five pairs in one frame-level list, one entry shape, in emission order (AC1)', async () => {
    const page = bootWorkPage();
    driveMeasuredFrame(page);
    await flushMicrotasks();

    assertMeasuredFrame(theFrame(page.dispatched));
  });

  it('held-out E3: an added event reaches a surface through the same shape, and OutputStart still sets the trigger', async () => {
    const page = bootWorkPage();
    driveMeasuredFrame(page);
    await flushMicrotasks();
    const detail = theFrame(page.dispatched);

    const added = detail.events.find(
      (entry) => entry.type === PE.LifecycleHookEnd,
    );
    const recorded = detail.events.find(
      (entry) => entry.type === PE.TemplateUpdateEnd,
    );
    assert.deepEqual(
      Object.keys(added),
      Object.keys(recorded),
      'an added event must travel exactly the shape the four recorded events travel',
    );
    assert.equal(
      surfaceOf(added),
      'LifecycleHook:end app-form-root',
      'a surface must name the added pair and its component from the entry`s own fields',
    );
    assert.equal(
      surfaceOf(recorded),
      'TemplateUpdate:end app-counter',
      'and name the pair the recorder already recorded the same way',
    );

    // The number is not what a surface reads: with the same entries and the numbers made unreadable,
    // every answer is unchanged.
    const scrambled = detail.events.map((entry) => ({ ...entry, type: 999 }));
    assert.deepEqual(
      scrambled.map(surfaceOf),
      detail.events.map(surfaceOf),
      'a surface reading pair, end and componentName must answer the same whatever the event number says; a surface that switched on the number would answer differently here',
    );

    assert.equal(
      detail.trigger.kind,
      'output',
      'OutputStart must still set the cycle trigger beside the added events',
    );
    assert.equal(detail.trigger.listenerName, 'click');
  });

  it('a given event record is what the agent writes: the record builder names no value (SC2)', () => {
    const start = SRC.indexOf('function recordWorkEvent(');
    const end = SRC.indexOf('function holdPendingWorkEvent(', start);
    assert.notEqual(
      start,
      -1,
      'the agent must carry `function recordWorkEvent(`',
    );
    assert.notEqual(
      end,
      -1,
      'the record builder must be followed by `function holdPendingWorkEvent(`',
    );
    const builder = SRC.slice(start, end);

    assert.equal(
      builder.includes('ProfilerEvent.'),
      false,
      'the record builder must name no value: the pair and the end bit come from WORK_EVENT_PAIRS, so no branch decides what an entry carries',
    );
    assert.equal(
      /event\s*===|event\s*!==|switch\s*\(\s*event\s*\)|case\s+\d+\s*:/.test(
        builder,
      ),
      false,
      'the record builder must not compare the event number to read a field',
    );
  });

  it('added events open no cycle and create no check, and the frame the task opens adopts them (AC2)', async () => {
    const page = bootWorkPage();
    page.subscriber(PE.ChangeDetectionStart);
    page.subscriber(PE.ComponentStart);
    await flushMicrotasks();
    assert.deepEqual(
      recordsOf(page.dispatched),
      [],
      'an added event must not open a cycle: only TemplateUpdateStart opens one, so nothing is dispatched here',
    );

    page.subscriber(PE.TemplateUpdateStart, page.counter);
    page.subscriber(PE.ComponentEnd, page.child);
    page.subscriber(PE.ChangeDetectionEnd);
    await flushMicrotasks();

    const detail = theFrame(page.dispatched);
    assert.deepEqual(
      detail.events.map((entry) => entry.type),
      [
        PE.ChangeDetectionStart,
        PE.ComponentStart,
        PE.TemplateUpdateStart,
        PE.ComponentEnd,
        PE.ChangeDetectionEnd,
      ],
      'the frame the microtask closes must carry every arrival in emission order, including the two that arrived before its opener',
    );
    assert.deepEqual(
      detail.checks[0].events,
      [PE.TemplateUpdateStart],
      'and the per-check list still holds only the bare values the recorder recorded before T002',
    );
  });

  it('records null for an event the profiler named nothing for, never a derived name (AC3)', async () => {
    const page = bootWorkPage();
    // An instance that yields no name: no host element and no named constructor.
    const nameless = Object.create(null);
    page.subscriber(PE.TemplateUpdateStart, page.counter);
    page.subscriber(PE.LifecycleHookStart, nameless);
    page.subscriber(PE.ComponentStart);
    await flushMicrotasks();

    const entries = theFrame(page.dispatched).events;
    assert.equal(
      entries[1].componentName,
      null,
      'an instance that yields no name must be recorded as naming no component, never as a fallback word',
    );
    assert.notEqual(
      entries[1].componentName,
      'component',
      "the recorder's 'component' fallback must not reach the frame-level entry",
    );
    assert.equal(
      entries[2].componentName,
      null,
      'ComponentStart measured null on every page T001 drove and is recorded as measured, not filled in from its end',
    );
  });

  it('the initial record carries the same `events` list, empty (AC1)', async () => {
    // The one snapshot `tryInstall` publishes is dispatched after its own 500 ms timer, from the
    // nodes the page enumerates and no profiler event at all: it must carry the same list, empty,
    // so a reader never has to guess whether the field is there.
    const instance = new Counter();
    const { ng } = pageNg({ resolve: { getComponent: () => instance } });
    const document = {
      querySelector: () => ({ tagName: 'APP-ROOT' }),
      querySelectorAll: () => [{ tagName: 'APP-COUNTER' }],
      body: { tagName: 'APP-ROOT' },
      documentElement: { tagName: 'APP-ROOT' },
    };
    const page = bootSandbox({ ng, document });
    page.sandbox.__ngRecorder.start();
    page.clock.tickMany();
    const record = page.dispatched.find(
      (event) => event.type === 'angular-ai:record',
    );
    assert.ok(record, 'the initial record must still be dispatched');
    const detail = plain(record.detail);
    assert.deepEqual(
      detail.events,
      [],
      'the snapshot carries the list a frame carries, empty: it read no profiler event',
    );
    assert.deepEqual(
      Object.keys(detail),
      [
        'cycleId',
        'startedAt',
        'trigger',
        'zoneMode',
        'events',
        'routerEvents',
        // Re-cut for T003: this assertion read
        //   ['cycleId','startedAt','trigger','zoneMode','events','routerEvents','checks']
        // and failed with `+ 'boundary'` present in `actual` once the boundary record joined the
        // snapshot. The field still sits in the same position in both records.
        //
        // Re-cut again for M043 T001, which failed with `+ 'stability'` present in `actual`:
        //   actual:   [..., 'boundary', 'stability', 'checks']
        //   expected: [..., 'boundary', 'checks']
        // The snapshot carries the same fourth additive field in the same position.
        'boundary',
        'stability',
        'checks',
      ],
      'and each additive field sits in the same position in both records — the router list is the second, the boundary record the third, and `checks` stays last',
    );
  });

  describe('the pins are non-vacuous: a mutant reddens one, naming the defect', () => {
    it('passes on the untouched source first', async () => {
      const detail = await frameOfMutant(SRC);
      assert.doesNotThrow(
        () => assertMeasuredFrame(detail),
        'the untouched source must pass the pin before any mutant is credited with reddening it',
      );
    });

    it('M1 drops an added pair`s end event: the pin names the value it lost', async () => {
      const dropped = mutantOf(
        'kinds[named.end] = { pair: named.pair, end: true };',
        'if (named.end !== ProfilerEvent.HostBindingsUpdateEnd) kinds[named.end] = { pair: named.pair, end: true };',
      );
      const detail = await frameOfMutant(dropped);
      assert.throws(
        () => assertMeasuredFrame(detail),
        /HostBindingsUpdateEnd \(25\) must reach the frame-level list/,
        'a dropped end event must redden the pin naming the value that went missing',
      );
    });

    it('M2 records an added event in a second shape: the pin names the entry', async () => {
      const secondShape = mutantOf(
        'var kind = WORK_EVENT_KINDS[event];',
        "var kind = WORK_EVENT_KINDS[event];\n    if (event === ProfilerEvent.LifecycleHookEnd) {\n      if (cycle)\n        cycle.events.push({\n          type: event,\n          pair: 'LifecycleHook',\n          ended: true,\n          at: nowMs(),\n          componentName: instanceNameFor(instance),\n        });\n      return null;\n    }",
      );
      const detail = await frameOfMutant(secondShape);
      assert.throws(
        () => assertMeasuredFrame(detail),
        /must use one shape for every recorded value: entry \d+ \(LifecycleHookEnd\)/,
        'a second shape must redden the pin naming the value that travelled it',
      );
    });

    it("M3 fills a name in from the recorder's fallback: the pin names the absence", async () => {
      const fallback = mutantOf(
        'componentName: instanceNameFor(instance),',
        'componentName: componentNameFor(instance),',
      );
      const detail = await frameOfMutant(fallback);
      assert.throws(
        () => assertMeasuredFrame(detail),
        /must record componentName null, never a name derived/,
        'a name derived for an event that named nothing must redden the absence pin',
      );
    });

    it('M4 stops setting the trigger on OutputStart: the pin names the trigger', async () => {
      const triggerless = mutantOf('if (!pendingTrigger) {', 'if (false) {');
      const detail = await frameOfMutant(triggerless);
      assert.throws(
        () => assertMeasuredFrame(detail),
        /OutputStart must still set the cycle trigger/,
        'a trigger the recorder no longer sets must redden the additive pin',
      );
    });

    it('M5 stops opening the cycle on TemplateUpdateStart: the frame is lost and named', async () => {
      const openerless = mutantOf(
        'if (!cycle) openCycle();',
        'if (false) openCycle();',
      );
      const page = bootWorkPage({ source: openerless });
      driveMeasuredFrame(page);
      await flushMicrotasks();
      assert.throws(
        () => theFrame(page.dispatched),
        /TemplateUpdateStart must still open the cycle/,
        'a cycle nothing opens must redden the frame pin by name',
      );
    });
  });
});

// ---------------------------------------------------------------------------
// The router's own stream reaches one record beside the profiler list (T002, SC1, SC2, SC5)
// ---------------------------------------------------------------------------
//
// T001 measured the vocabulary (`research/raw/m041-navigation.json`): sixteen classes, each with its
// own key set, the `Router` at injector resolution path entry 2 with its token readable as
// `record.token`, and the two route-config classes carrying no navigation id at all. The block below
// drives the shipped subscriber with the recording's own frames, so what is asserted is the record the
// page produces and not a copy of its builder:
//
//   1. one list, one shape. Every `Router.events` emission reaches `record.routerEvents` in arrival
//      order, each entry the eleven fields the interface contract fixes, `type` the class name the
//      runtime reports and never the event number a surface would have to know.
//   2. the absences. An entry records `id: null` where the event carried none — never the id of the
//      last navigation seen or of the one in flight — and an error records its own name and message
//      only, with no field for the `target` T001 measured as `undefined`.
//   3. additive. `ɵsetProfiler` is still called once with the same subscriber, the trigger and the cycle
//      opener keep their meanings, and `reset` removes both subscriptions.
//
// Each pin is proven non-vacuously at the end of the block: the untouched source passes first, one
// anchored mutant of the shipped file reddens it, and the failure names the defect by string.

/** The sixteen classes T001 recorded, each with the key set the installed chunk declares. */
const ROUTER_CLASSES = {
  NavigationStart: ['id', 'navigationTrigger', 'restoredState', 'type', 'url'],
  RouteConfigLoadStart: ['route', 'type'],
  RouteConfigLoadEnd: ['route', 'type'],
  RoutesRecognized: ['id', 'state', 'type', 'url', 'urlAfterRedirects'],
  GuardsCheckStart: ['id', 'state', 'type', 'url', 'urlAfterRedirects'],
  GuardsCheckEnd: [
    'id',
    'shouldActivate',
    'state',
    'type',
    'url',
    'urlAfterRedirects',
  ],
  ResolveStart: ['id', 'state', 'type', 'url', 'urlAfterRedirects'],
  ResolveEnd: ['id', 'state', 'type', 'url', 'urlAfterRedirects'],
  ChildActivationStart: ['snapshot', 'type'],
  ActivationStart: ['snapshot', 'type'],
  ActivationEnd: ['snapshot', 'type'],
  ChildActivationEnd: ['snapshot', 'type'],
  NavigationEnd: ['id', 'type', 'url', 'urlAfterRedirects'],
  NavigationCancel: ['code', 'id', 'reason', 'type', 'url'],
  NavigationError: ['error', 'id', 'target', 'type', 'url'],
  NavigationSkipped: ['code', 'id', 'reason', 'type', 'url'],
};

/** The `EventType` numbers the recording attributes to those classes. */
const ROUTER_EVENT_TYPES = {
  NavigationStart: 0,
  NavigationEnd: 1,
  NavigationCancel: 2,
  NavigationError: 3,
  RoutesRecognized: 4,
  ResolveStart: 5,
  ResolveEnd: 6,
  GuardsCheckStart: 7,
  GuardsCheckEnd: 8,
  RouteConfigLoadStart: 9,
  RouteConfigLoadEnd: 10,
  ChildActivationStart: 11,
  ChildActivationEnd: 12,
  ActivationStart: 13,
  ActivationEnd: 14,
  NavigationSkipped: 16,
};

/** The one entry shape the interface contract fixes, in its field order. */
const ROUTER_ENTRY_KEYS = [
  'type',
  'at',
  'id',
  'url',
  'urlAfterRedirects',
  'route',
  'reason',
  'code',
  'error',
  'shouldActivate',
  'matchedPaths',
];

const ROUTER_CLASS_CACHE = new Map();

/** A constructor the runtime reports under the measured class name. */
function namedRouterClass(className) {
  if (!ROUTER_CLASS_CACHE.has(className)) {
    ROUTER_CLASS_CACHE.set(className, namedFn(className));
  }
  return ROUTER_CLASS_CACHE.get(className);
}

/** One router event of a measured class, carrying exactly that class's measured key set. */
function routerEventOf(className, payload = {}) {
  const keys = ROUTER_CLASSES[className];
  assert.ok(
    keys,
    `${className} is not one of the sixteen classes T001 recorded`,
  );
  const Ctor = namedRouterClass(className);
  const event = new Ctor();
  event.type = ROUTER_EVENT_TYPES[className];
  for (const key of keys) {
    if (key === 'type') continue;
    if (key in payload) event[key] = payload[key];
  }
  return event;
}

/** A route-configuration object, function-bearing the way the real `Route` is. */
function measuredRoute(path, extra = {}) {
  return {
    path,
    hasLoadChildren: extra.hasLoadChildren ?? true,
    hasLoadComponent: extra.hasLoadComponent ?? false,
    redirectTo: null,
    loadChildren: () => ({}),
    ...extra,
  };
}

/** One activated route snapshot, from its own config path. */
function activatedRouteSnapshot(path, firstChild = null) {
  return { routeConfig: path === null ? null : { path }, firstChild };
}

/** A router state snapshot: the primary chain, root first, following `firstChild`. */
function routerStateSnapshot(paths) {
  let next = null;
  for (let index = paths.length - 1; index >= 0; index -= 1) {
    next = activatedRouteSnapshot(paths[index], next);
  }
  return { root: next };
}

/** The class names of a frame, in emission order — what the record's `type` fields must answer. */
function classesOf(events) {
  return events.map((event) => event.constructor.name);
}

/**
 * T001's superseded frame, verbatim in arrival order (`superseded.events`): navigation 2 is cancelled
 * with code 1 at its lazy boundary and its own `RouteConfigLoadEnd` arrives afterwards — after its
 * cancel and before its successor's load end — so the record's order is arrival order and never an
 * attribution.
 */
function measuredSupersededFrame() {
  const contract = () => routerStateSnapshot([null, 'contract', '', 'list']);
  const recognised = () => ({
    id: 3,
    state: contract(),
    url: '/contract/list',
    urlAfterRedirects: '/contract/list',
  });
  return [
    routerEventOf('NavigationStart', { id: 2, url: '/claim/list' }),
    routerEventOf('RouteConfigLoadStart', {
      route: measuredRoute('claim'),
    }),
    routerEventOf('NavigationCancel', {
      code: 1,
      id: 2,
      reason: 'Navigation ID 2 is not equal to the current navigation id 3',
      url: '/claim/list',
    }),
    routerEventOf('NavigationStart', { id: 3, url: '/contract/list' }),
    routerEventOf('RouteConfigLoadStart', {
      route: measuredRoute('contract'),
    }),
    routerEventOf('RouteConfigLoadEnd', { route: measuredRoute('claim') }),
    routerEventOf('RouteConfigLoadEnd', {
      route: measuredRoute('contract'),
    }),
    routerEventOf('RoutesRecognized', recognised()),
    routerEventOf('GuardsCheckStart', recognised()),
    routerEventOf('ChildActivationStart', {
      snapshot: activatedRouteSnapshot(null),
    }),
    routerEventOf('ActivationStart', {
      snapshot: activatedRouteSnapshot('contract'),
    }),
    routerEventOf('ChildActivationStart', {
      snapshot: activatedRouteSnapshot('contract'),
    }),
    routerEventOf('ActivationStart', { snapshot: activatedRouteSnapshot('') }),
    routerEventOf('ChildActivationStart', {
      snapshot: activatedRouteSnapshot(''),
    }),
    routerEventOf('ActivationStart', {
      snapshot: activatedRouteSnapshot('list'),
    }),
    routerEventOf('GuardsCheckEnd', {
      id: 3,
      shouldActivate: true,
      state: contract(),
      url: '/contract/list',
      urlAfterRedirects: '/contract/list',
    }),
    routerEventOf('ResolveStart', recognised()),
    routerEventOf('ResolveEnd', recognised()),
    routerEventOf('RouteConfigLoadStart', {
      route: measuredRoute('list', {
        hasLoadChildren: false,
        hasLoadComponent: true,
      }),
    }),
    routerEventOf('RouteConfigLoadEnd', {
      route: measuredRoute('list', {
        hasLoadChildren: false,
        hasLoadComponent: true,
      }),
    }),
    routerEventOf('ActivationEnd', {
      snapshot: activatedRouteSnapshot('list'),
    }),
    routerEventOf('ChildActivationEnd', {
      snapshot: activatedRouteSnapshot(''),
    }),
    routerEventOf('ActivationEnd', { snapshot: activatedRouteSnapshot('') }),
    routerEventOf('ChildActivationEnd', {
      snapshot: activatedRouteSnapshot('contract'),
    }),
    routerEventOf('ActivationEnd', {
      snapshot: activatedRouteSnapshot('contract'),
    }),
    routerEventOf('ChildActivationEnd', {
      snapshot: activatedRouteSnapshot(null),
    }),
    routerEventOf('NavigationEnd', {
      id: 3,
      url: '/contract/list',
      urlAfterRedirects: '/contract/list',
    }),
  ];
}

/** T001's held frame (`held.inFlight.events`): a start and a stage, and no terminal event. */
function measuredHeldFrame() {
  return [
    routerEventOf('NavigationStart', { id: 2, url: '/complaint/list' }),
    routerEventOf('RouteConfigLoadStart', {
      route: measuredRoute('complaint'),
    }),
  ];
}

/** T001's error frame (`terminals.error.events`): a navigation that died fetching a lazy chunk. */
function measuredErrorFrame() {
  const failure = new TypeError(
    'Failed to fetch dynamically imported module: http://localhost:4507/src-2HBDPKHR.js',
  );
  return [
    routerEventOf('NavigationStart', { id: 2, url: '/customer/list' }),
    routerEventOf('RouteConfigLoadStart', {
      route: measuredRoute('customer'),
    }),
    routerEventOf('NavigationError', {
      error: failure,
      id: 2,
      target: undefined,
      url: '/customer/list',
    }),
  ];
}

/** Every leaf of a recorded value, asserted to be something the serialized boundary can carry. */
function assertPlainData(value, where) {
  if (value === null || typeof value !== 'object') {
    assert.notEqual(
      typeof value,
      'function',
      `${where} must be plain data; it carries a function, which cannot cross the serialized boundary`,
    );
    assert.notEqual(
      typeof value,
      'undefined',
      `${where} must be plain data; it carries undefined, which the serialized boundary drops`,
    );
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    assertPlainData(nested, `${where}.${key}`);
  }
}

/** The recorders this block booted, reset after each test so no page timer outlives its assertions. */
const ROUTER_BOOTS = [];

/**
 * A page whose `Router` sits where T001 measured it: the element injector is resolution path entry 0
 * (6 records, no `Router`), the app's environment injector is entry 2 (90 records) and holds the token
 * as `record.token`, and `record.provider.provide` names none of the 90 `Router`.
 */
function routerPageModel() {
  const routerToken = { name: 'Router' };
  const subscribers = [];
  const subscriptions = [];
  const stream = {
    subscribe(callback) {
      subscribers.push(callback);
      const subscription = {
        unsubscribed: 0,
        unsubscribe() {
          this.unsubscribed += 1;
          const index = subscribers.indexOf(callback);
          if (index !== -1) subscribers.splice(index, 1);
        },
      };
      subscriptions.push(subscription);
      return subscription;
    },
  };
  const router = { events: stream };
  const getCalls = [];
  const profilerCalls = [];
  const named = (count, prefix) => {
    const records = [];
    for (let index = 0; index < count; index += 1) {
      const name = `${prefix}${index}`;
      records.push({
        token: { name },
        provider: { provide: name },
        source: 'Measured',
        isViewProvider: false,
      });
    }
    return records;
  };
  const injectorOf = (label, providers) => ({
    label,
    providers,
    get(token) {
      getCalls.push({ injector: label, token });
      if (label === 'environment' && token === routerToken) return router;
      return null;
    },
  });
  const element = injectorOf('element', named(6, 'Element'));
  const app = injectorOf('app', named(6, 'App'));
  const environment = injectorOf(
    'environment',
    named(89, 'Environment').concat([
      {
        token: routerToken,
        provider: { provide: 'RouterService' },
        source: 'provideRouter',
        isViewProvider: false,
      },
    ]),
  );
  const spare = injectorOf('spare', named(8, 'Spare'));
  const path = [element, app, environment, spare];
  const ng = {
    ɵsetProfiler(callback) {
      profilerCalls.push(callback);
      return () => {};
    },
    ɵgetSignalGraph: () => counterGraph(),
    getHostElement: () => ({ tagName: 'APP-COUNTER' }),
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    // The element injector for every element, as the page's own root answers it: the walk that finds
    // the `Router` is the resolution path beside it, never the node it started from.
    getInjector: () => element,
    ɵgetInjectorResolutionPath: (candidate) =>
      candidate === element ? path : [candidate],
    ɵgetInjectorProviders: (candidate) => candidate.providers,
  };
  return {
    ng,
    path,
    element,
    app,
    environment,
    spare,
    router,
    routerToken,
    stream,
    subscribers,
    subscriptions,
    getCalls,
    profilerCalls,
    emit(event) {
      for (const callback of [...subscribers]) callback(event);
    },
  };
}

/** The root element the page answers `getInjector` on, and nothing else. */
function routerRoot() {
  return { tagName: 'APP-ROOT' };
}

/** A page document: the root the agent's own reads prefer, and one element list for the presence test. */
function routerDocument(elements) {
  const root = routerRoot();
  return {
    querySelector: (selector) => (selector === 'app-root' ? root : null),
    querySelectorAll: () => elements ?? [root],
    body: root,
    documentElement: root,
  };
}

/** Boots the (possibly mutated) script on that page and gives it a clock that advances per read. */
function bootRouterPage(options = {}) {
  const page = routerPageModel();
  globalThis.document = options.document ?? routerDocument();
  const booted = bootSource(options.source ?? SRC, { ng: page.ng });
  ROUTER_BOOTS.push(booted.recorder);
  let now = 900;
  globalThis.performance = {
    now: () => {
      now += 1;
      return now;
    },
  };
  assert.equal(
    page.profilerCalls.length,
    1,
    'the widening extends the one profiler tap and never adds a second one',
  );
  return { ...page, ...booted, subscriber: booted.recorder.getSubscriber() };
}

/** One emitter, one profiler frame, one record: the shipped path, driven the way the page drives it. */
async function recordOfEvents(page, events) {
  for (const event of events) page.emit(event);
  page.subscriber(PE.TemplateUpdateStart, page.counter ?? {});
  await flushMicrotasks();
  return theFrame(page.dispatched);
}

/** The router list's pins: one list, one shape, arrival order, the class name, the page's own clock. */
function assertRouterStream(detail, events) {
  const entries = detail.routerEvents;
  assert.ok(
    Array.isArray(entries),
    `the record must publish the router's arrivals as a list \`routerEvents\`; it published ${JSON.stringify(entries)}`,
  );
  entries.forEach((entry, index) => {
    assert.deepEqual(
      Object.keys(entry),
      ROUTER_ENTRY_KEYS,
      `the router list must use one shape for every recorded event: entry ${index} (${entry.type}) carries ${JSON.stringify(Object.keys(entry))}`,
    );
    assert.equal(
      typeof entry.type,
      'string',
      `the entry's type must be the event's own class name, never the event number (entry ${index} carries ${JSON.stringify(entry.type)})`,
    );
    assert.equal(
      typeof entry.at,
      'number',
      `entry ${index} (${entry.type}) must carry the page's own receipt time; it carries ${JSON.stringify(entry.at)}`,
    );
    assertPlainData(entry, `entry ${index} (${entry.type})`);
  });
  assert.deepEqual(
    entries.map((entry) => entry.type),
    classesOf(events),
    'the router list must hold one entry per Router.events emission, in arrival order, with nothing coalesced, sorted or dropped',
  );
  const times = entries.map((entry) => entry.at);
  assert.deepEqual(
    [...times].sort((left, right) => left - right),
    times,
    'the receipt times must be the readings of the page clock, in arrival order',
  );
  assert.equal(
    new Set(times).size,
    times.length,
    'each entry carries its own receipt reading, so no entry borrows a neighbour`s time',
  );
  const roundTripped = JSON.parse(JSON.stringify(entries));
  assert.deepEqual(
    roundTripped,
    entries,
    'the router list must be plain data: a value the serialized boundary drops or rewrites means an instance crossed it',
  );
}

/** The two route-config events, and only them, are the entries the measurement found id-less. */
function assertRouteConfigIds(detail) {
  const loads = detail.routerEvents.filter(
    (entry) =>
      entry.type === 'RouteConfigLoadStart' ||
      entry.type === 'RouteConfigLoadEnd',
  );
  assert.ok(
    loads.length > 0,
    'the frame must record its route-config arrivals; none reached the list',
  );
  for (const entry of loads) {
    assert.equal(
      entry.id,
      null,
      `${entry.type} must record id null, never the id of the last navigation seen or of the navigation in flight (it recorded ${JSON.stringify(entry.id)})`,
    );
    assert.equal(
      typeof entry.id,
      'object',
      `${entry.type} must record the absence as null and nothing else; it recorded ${JSON.stringify(entry.id)}`,
    );
  }
}

/** The error terminal: its own name and message, no `target`, and nothing else. */
function assertErrorSummary(detail) {
  const errors = detail.routerEvents.filter(
    (entry) => entry.type === 'NavigationError',
  );
  assert.equal(errors.length, 1, 'the error frame carries one NavigationError');
  const entry = errors[0];
  assert.deepEqual(
    Object.keys(entry.error ?? {}),
    ['name', 'message'],
    `an error must record its own name and message and nothing else: ${entry.type} records ${JSON.stringify(entry.error)}`,
  );
  assert.equal(entry.error.name, 'TypeError');
  assert.equal(
    entry.error.message,
    'Failed to fetch dynamically imported module: http://localhost:4507/src-2HBDPKHR.js',
    'the message must be the error`s own, not a paraphrase',
  );
  assert.equal(
    Object.keys(entry).includes('target'),
    false,
    'the error entry must carry no `target` field at all: the measured value was undefined, so nothing records a null for it',
  );
}

/** The reach: one subscription, taken through `record.token` on the entry that holds it. */
function assertRouterReached(page) {
  assert.equal(
    page.subscribers.length,
    1,
    'the Router must be reached through record.token on the injector resolution path: no subscription was taken, so the token was not found where T001 measured it',
  );
  assert.ok(
    page.getCalls.some((call) => call.injector === 'environment'),
    'the walk must ask the environment injector for the token: the element injector at entry 0 holds no Router and the app injector is not the first entry',
  );
}

/** The additive rule: the subscription exists before any profiler event, so a pre-frame arrival lands. */
function assertRouterArmed(detail) {
  const entries = detail.routerEvents;
  assert.ok(
    entries.length >= 1 && entries[0].type === 'NavigationStart',
    'the router subscription must be created beside the profiler subscription, never inside the profiler callback: an event the router emitted before the first profiler event must still be in the record',
  );
}

describe('agent-main.js (the router stream beside the profiler subscription, T002)', () => {
  afterEach(() => {
    for (const recorder of ROUTER_BOOTS.splice(0)) {
      if (recorder && typeof recorder.reset === 'function') recorder.reset();
    }
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    delete globalThis.__ngRecorder;
    delete globalThis.document;
  });

  it('the sixteen classes are T001`s measured sixteen, each with its own recorded key set (AC2)', () => {
    const recording = JSON.parse(
      readFileSync(
        new URL('../research/raw/m041-navigation.json', import.meta.url),
        'utf8',
      ),
    );
    const measured = recording.events.classes;
    assert.equal(
      measured.length,
      16,
      'the recording enumerates the sixteen classes this record is held to',
    );
    assert.deepEqual(
      measured.map((entry) => entry.name).sort(),
      Object.keys(ROUTER_CLASSES).sort(),
      'the classes this suite drives must be the sixteen T001 measured, not a vocabulary invented here',
    );
    for (const entry of measured) {
      assert.deepEqual(
        ROUTER_CLASSES[entry.name],
        entry.keys,
        `${entry.name} must be driven with the key set the recording carries`,
      );
      assert.equal(
        ROUTER_EVENT_TYPES[entry.name],
        entry.type,
        `${entry.name} must be driven with its recorded EventType number`,
      );
    }
  });

  it('records one entry per emission, in arrival order, in one shape, by class name (AC2, AC5)', async () => {
    const events = measuredSupersededFrame();
    const page = bootRouterPage();
    const detail = await recordOfEvents(page, events);

    assertRouterStream(detail, events);
    assertRouterReached(page);

    const cancel = detail.routerEvents.find(
      (entry) => entry.type === 'NavigationCancel',
    );
    assert.equal(cancel.id, 2);
    assert.equal(
      cancel.code,
      1,
      'a cancel carries its own code, and code 1 is the measured one',
    );
    assert.equal(
      cancel.reason,
      'Navigation ID 2 is not equal to the current navigation id 3',
      'a cancel carries the router`s own reason text',
    );
    assert.equal(
      cancel.urlAfterRedirects,
      null,
      'a cancel carries no urlAfterRedirects, so the entry records none',
    );

    const end = detail.routerEvents.find(
      (entry) => entry.type === 'NavigationEnd',
    );
    assert.equal(end.urlAfterRedirects, '/contract/list');
    const recognised = detail.routerEvents.find(
      (entry) => entry.type === 'RoutesRecognized',
    );
    assert.deepEqual(
      recognised.matchedPaths,
      [null, 'contract', '', 'list'],
      'a routed snapshot contributes its primary chain`s own config paths, in order, including the componentless empty path T001 measured',
    );
    const guardEnd = detail.routerEvents.find(
      (entry) => entry.type === 'GuardsCheckEnd',
    );
    assert.equal(
      guardEnd.shouldActivate,
      true,
      'the guard end carries its own aggregate verdict',
    );
    assert.equal(
      detail.routerEvents.filter((entry) => entry.type === 'ActivationStart')[0]
        .matchedPaths[0],
      'contract',
      'an activation event contributes its own snapshot`s config path and no other route',
    );
  });

  it('records id null for the two route-config events and borrows no navigation id (AC3, SC5)', async () => {
    const events = measuredSupersededFrame();
    const page = bootRouterPage();
    const detail = await recordOfEvents(page, events);

    assertRouteConfigIds(detail);
    const loads = detail.routerEvents
      .filter((entry) => entry.type === 'RouteConfigLoadEnd')
      .map((entry) => entry.route);
    assert.deepEqual(
      loads,
      ['claim', 'contract', 'list'],
      'a load end keeps its own route path, in arrival order',
    );
  });

  it('keeps arrival order as arrival order: the abandoned load end stays after its own cancel (SC5)', async () => {
    const events = measuredSupersededFrame();
    const page = bootRouterPage();
    const detail = await recordOfEvents(page, events);

    const cancelAt = detail.routerEvents.findIndex(
      (entry) => entry.type === 'NavigationCancel',
    );
    const abandonedAt = cancelAt + 3;
    assert.equal(
      detail.routerEvents[abandonedAt].route,
      'claim',
      'the abandoned navigation`s own RouteConfigLoadEnd arrives after its cancel and is recorded where it arrived, so arrival order is not read as attribution',
    );
    assert.equal(
      detail.routerEvents[abandonedAt].id,
      null,
      'and it is still an id-less load: the navigation it belongs to is the join`s question, not the record`s',
    );
  });

  it('records plain data only: an error contributes its own name and message, never the object (AC4)', async () => {
    const events = measuredErrorFrame();
    const page = bootRouterPage();
    const detail = await recordOfEvents(page, events);

    assertRouterStream(detail, events);
    assertErrorSummary(detail);
  });

  it('a held navigation records its last event and no synthesised terminal (AC2)', async () => {
    const events = measuredHeldFrame();
    const page = bootRouterPage();
    const detail = await recordOfEvents(page, events);

    assertRouterStream(detail, events);
    assert.equal(
      detail.routerEvents.length,
      2,
      'a held navigation is the start and the stage that arrived, and nothing else',
    );
    assert.deepEqual(
      detail.routerEvents.map((entry) => entry.type),
      ['NavigationStart', 'RouteConfigLoadStart'],
      'the last event is the stage the navigation reached',
    );
    for (const terminal of [
      'NavigationEnd',
      'NavigationCancel',
      'NavigationError',
      'NavigationSkipped',
    ]) {
      assert.equal(
        detail.routerEvents.some((entry) => entry.type === terminal),
        false,
        `a held navigation must carry no synthesised ${terminal}: the terminal event is the only discriminator and the record never mints one`,
      );
    }
  });

  it('arms beside the profiler tap, and reset removes both subscriptions (AC1)', async () => {
    const page = bootRouterPage();
    assert.equal(
      page.profilerCalls.length,
      1,
      'ɵsetProfiler must still be called exactly once',
    );
    assert.equal(
      page.profilerCalls[0],
      page.recorder.getSubscriber(),
      'and with the same subscriber the trigger and the cycle opener read',
    );
    assert.equal(
      page.subscribers.length,
      1,
      'the router subscription must exist as soon as the install answered, before any profiler event',
    );

    const detail = await recordOfEvents(page, measuredHeldFrame());
    assertRouterArmed(detail);

    page.recorder.reset();
    assert.equal(
      page.subscribers.length,
      0,
      'reset must remove the router subscription beside the profiler`s own remover',
    );
    assert.equal(
      page.subscriptions[0].unsubscribed,
      1,
      'and the stream`s own unsubscribe is what removes it',
    );

    page.emit(routerEventOf('NavigationStart', { id: 9, url: '/after-reset' }));
    page.subscriber(PE.TemplateUpdateStart, {});
    await flushMicrotasks();
    const after = recordsOf(page.dispatched).at(-1).detail;
    assert.deepEqual(
      after.routerEvents,
      [],
      'the list is cleared with the subscription, so a second install starts from an empty stream',
    );
  });

  it('reaches the Router at the injector entry that holds record.token, not entry 0 and not provider.provide (AC1)', async () => {
    const page = bootRouterPage();
    assertRouterReached(page);
    assert.equal(
      page.getCalls.filter((call) => call.token === page.routerToken).length,
      1,
      'the token is read from the provider record and asked of the injector exactly once',
    );
    assert.equal(
      page.getCalls.find((call) => call.token === page.routerToken).injector,
      'environment',
      'and it is asked of the environment injector, which is entry 2 of the measured path — not the element injector at entry 0',
    );
  });

  it('reaches a root that is not app-root through the dev-context presence test (AC1)', async () => {
    const portalRoot = { tagName: 'NG-JOURNAL-ROOT', __ngContext__: 12 };
    const page = bootRouterPage({
      document: {
        querySelector: () => null,
        querySelectorAll: () => [{ tagName: 'BODY' }, portalRoot],
        body: { tagName: 'BODY' },
        documentElement: { tagName: 'HTML' },
      },
    });
    assertRouterReached(page);
    assert.equal(
      page.getCalls.some((call) => call.token === page.routerToken),
      true,
      'the host element is found by carrying a dev context, because getInjector answers on no other node and an app root is not always called app-root',
    );
  });

  it('bounds the list as a page-health guard, keeping the newest arrivals in order (AC2)', async () => {
    const page = bootRouterPage();
    const emissions = 515;
    for (let index = 0; index < emissions; index += 1) {
      page.emit(
        routerEventOf(index % 2 === 0 ? 'NavigationStart' : 'NavigationEnd', {
          id: index,
          url: `/page/${index}`,
        }),
      );
    }
    page.subscriber(PE.TemplateUpdateStart, {});
    await flushMicrotasks();
    const entries = theFrame(page.dispatched).routerEvents;

    assert.equal(
      entries.length,
      512,
      'the list is bounded: a page that never stops navigating keeps a fixed number of arrivals rather than growing without limit',
    );
    assert.equal(
      entries[0].id,
      emissions - 512,
      'the oldest arrivals fall off the front',
    );
    assert.equal(entries.at(-1).id, emissions - 1, 'and the newest stay whole');
    assert.deepEqual(
      entries.map((entry) => entry.id),
      [...entries.map((entry) => entry.id)].sort((left, right) => left - right),
      'within the bound nothing is dropped, coalesced or reordered',
    );
  });

  describe('the pins are non-vacuous: a mutant reddens one, naming the defect', () => {
    it('passes on the untouched source first', async () => {
      const page = bootRouterPage();
      const detail = await recordOfEvents(page, measuredSupersededFrame());
      assert.doesNotThrow(() => {
        assertRouterStream(detail, measuredSupersededFrame());
        assertRouteConfigIds(detail);
      }, 'the untouched source must pass the pins before any mutant is credited with reddening one');
    });

    it('M1 gives a route-config load a synthesised id: the pin names the absence', async () => {
      const synthesised = mutantOf(
        "      id: routerPrimitiveOf(event, 'id'),",
        `      id: routerCarries(event, 'id')
        ? event.id
        : (function () {
            for (var r = routerEvents.length - 1; r >= 0; r -= 1) {
              if (typeof routerEvents[r].id === 'number') return routerEvents[r].id;
            }
            return null;
          })(),`,
      );
      const page = bootRouterPage({ source: synthesised });
      const detail = await recordOfEvents(page, measuredSupersededFrame());
      assert.throws(
        () => assertRouteConfigIds(detail),
        /must record id null, never the id of the last navigation seen or of the navigation in flight/,
        'an id borrowed from the navigation in flight must redden the absence pin',
      );
    });

    it('M2 records an event in a second shape: the pin names the entry', async () => {
      const secondShape = mutantOf(
        '  function recordRouterEvent(event) {\n    var entry = {',
        `  function recordRouterEvent(event) {
    var entry = {
      ...(routerClassNameOf(event) === 'RouteConfigLoadEnd'
        ? { ended: true }
        : {}),`,
      );
      const page = bootRouterPage({ source: secondShape });
      const detail = await recordOfEvents(page, measuredSupersededFrame());
      assert.throws(
        () => assertRouterStream(detail, measuredSupersededFrame()),
        /must use one shape for every recorded event: entry \d+ \(RouteConfigLoadEnd\)/,
        'a second shape must redden the pin naming the entry that travelled it',
      );
    });

    it('M3 records the event number as the type: the pin names what a surface must not need', async () => {
      const numbered = mutantOf(
        '      type: routerClassNameOf(event),',
        "      type: routerPrimitiveOf(event, 'type'),",
      );
      const page = bootRouterPage({ source: numbered });
      const detail = await recordOfEvents(page, measuredSupersededFrame());
      assert.throws(
        () => assertRouterStream(detail, measuredSupersededFrame()),
        /must be the event's own class name, never the event number/,
        'a type recorded as the event number must redden the pin that says no surface needs one',
      );
    });

    it('M4 installs the router subscription inside the profiler callback: the pin names the additive rule', async () => {
      const inside = mutantOf(
        '    var r = tryInstall();\n    installRouterEvents();\n',
        '    var r = tryInstall();\n',
      );
      const chained = (() => {
        const anchor =
          '    subscriber = function (event, instance, eventFn) {\n      onEvent(event, instance, eventFn);\n    };';
        const occurrences = inside.split(anchor).length - 1;
        assert.equal(
          occurrences,
          1,
          'the profiler callback anchor must appear once in the mutated source',
        );
        return inside.replace(
          anchor,
          '    subscriber = function (event, instance, eventFn) {\n      installRouterEvents();\n      onEvent(event, instance, eventFn);\n    };',
        );
      })();
      const page = bootRouterPage({ source: chained });
      const detail = await recordOfEvents(page, measuredHeldFrame());
      assert.throws(
        () => assertRouterArmed(detail),
        /must be created beside the profiler subscription, never inside the profiler callback/,
        'a subscription taken inside the profiler callback must redden the additive pin',
      );
    });

    it('M5 carries the error object itself: the pin names the boundary', async () => {
      const carried = mutantOf(
        '      error: routerErrorOf(event),',
        "      error: routerFieldOf(event, 'error'),",
      );
      const page = bootRouterPage({ source: carried });
      const detail = await recordOfEvents(page, measuredErrorFrame());
      assert.throws(
        () => assertErrorSummary(detail),
        /must record its own name and message and nothing else/,
        'an error instance crossing the boundary must redden the plain-data pin',
      );
    });

    it('M6 reads provider.provide instead of record.token: the pin names the field that finds the Router (AC1)', async () => {
      const provideRead = mutantOf(
        '        if (routerTokenNameOf(token) !== ROUTER_TOKEN_NAME) continue;',
        '        if (routerTokenNameOf(records[j].provider.provide) !== ROUTER_TOKEN_NAME)\n          continue;',
      );
      const page = bootRouterPage({ source: provideRead });
      assert.throws(
        () => assertRouterReached(page),
        /must be reached through record\.token on the injector resolution path/,
        'reading the provider`s `provide` name instead of its `token` must redden the reach pin',
      );
    });
  });
});

// ---------------------------------------------------------------------------
// The epoch map`s key: no throw, no lost frame, and the delta intact (T002, SC6)
// ---------------------------------------------------------------------------
//
// T001 measured the defect (`research/raw/m042-error-boundary.json`): a `TemplateUpdateStart`
// whose instance is `null` or `undefined` — an embedded block view`s context, which five measured
// sites pass that way — reaches `getOrCreateCheck`, opens a frame, and throws
// `TypeError: Invalid value used as weak map key` when the frame closes, at
// `prevEpochs.set(instance, next)`. The close runs from a queued microtask, outside `onEvent`'s
// try/catch, so the throw reaches the page and the frame`s whole record is lost (`records: 0`).
//
// The pins below drive the shipped file through the same boot the reproduction used, and they hold
// both halves of SC6 at once, because either half alone can be reached by trading the other away:
//
//   1. the frame lands. A frame carrying a non-object identity closes without a throw, reaches the
//      page`s dispatch, and carries the check with the shape a valid check travels.
//   2. the delta still names. An object identity whose node epoch moved still names that node —
//      T001 measured `movedOne → ["n0"]` and `bothMoved → ["n0","n1"]` — so a repair that reaches
//      the absence by emptying the list reddens the second half, and one that keeps the list by
//      restoring the throw reddens the first.
//
// Each pin is proven non-vacuously at the end of the block: the untouched source passes first, and
// three anchored mutants of the shipped file each redden one, the failure naming the defect.

/** The upstream `queueMicrotask`, put back after every epoch test. */
const ORIGINAL_QUEUE_MICROTASK = globalThis.queueMicrotask;

/** The recorders this block booted, reset after each test so no page timer outlives it. */
const EPOCH_BOOTS = [];

/** The two-node graph T001`s epoch passes drove: `n0` and `n1`, at the epochs given. */
function epochGraph(n0, n1) {
  return {
    nodes: [
      { id: 'n0', kind: 'signal', label: 'count', epoch: n0 },
      { id: 'n1', kind: 'computed', label: 'double', epoch: n1 },
    ],
    edges: [{ consumer: 1, producer: 0 }],
  };
}

/**
 * A page whose frame close is captured rather than run. The defect`s throw escaped exactly this
 * callback — it is the microtask `closeCycle` runs in — so the test invokes it and records what it
 * threw, instead of letting the throw reach this process`s uncaught handler and turn a measured
 * red into a crash.
 */
function bootEpochPage(options = {}) {
  const closers = [];
  const errors = [];
  const tags = new Map();
  const instances = (options.instances ?? ['Counter']).map((name) => {
    const instance = new (namedFn(name))();
    tags.set(instance, 'APP-' + name.toUpperCase());
    return instance;
  });
  const captured = { calls: [] };
  let graph = options.graph ?? null;
  const ng = {
    ɵsetProfiler(callback) {
      captured.calls.push(callback);
      return () => {};
    },
    ɵgetSignalGraph: () => graph,
    // An identity the page knows yields its host tag; one it does not yields nothing, which is the
    // honest answer for an embedded view`s context and leaves the check named by the fallback word.
    getHostElement(instance) {
      const tag = tags.get(instance);
      return tag === undefined ? null : { tagName: tag };
    },
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getInjector: () => ({ get: () => null }),
  };
  globalThis.queueMicrotask = (callback) => closers.push(callback);
  const booted = bootSource(options.source ?? SRC, { ng });
  EPOCH_BOOTS.push(booted.recorder);
  return {
    ...booted,
    ng,
    captured,
    instances,
    errors,
    subscriber: booted.recorder.getSubscriber(),
    setGraph: (next) => {
      graph = next;
    },
    /** Runs every queued frame close, recording a throw instead of letting it escape. */
    close() {
      const pending = closers.splice(0);
      for (const callback of pending) {
        try {
          callback();
        } catch (error) {
          errors.push(error);
        }
      }
      return pending.length;
    },
    records: () => recordsOf(booted.dispatched),
  };
}

/** The one check the record carries for the named identity, or a failure naming what it carried. */
function checkNamed(detail, name) {
  const found = detail.checks.filter((check) => check.componentName === name);
  assert.equal(
    found.length,
    1,
    `the record must carry one check for ${JSON.stringify(name)}; it carried ${JSON.stringify(detail.checks.map((check) => check.componentName))}`,
  );
  return found[0];
}

/** The checks the record carries for the identities that were not objects. */
function namelessChecks(detail) {
  return detail.checks.filter((check) => check.componentName === 'component');
}

/**
 * Drives the measured frames and hands the pin two readings: the frame that carried the non-object
 * identities, and the pass in which `n0` moved while `n1` held.
 */
function epochReadingOf(source) {
  const page = bootEpochPage({ instances: ['Counter'], source });
  const [counter] = page.instances;

  // The frame T001`s `twoKeysInOneFrame` measured: both shapes an embedded view`s context arrives
  // in, with the component instance beside them.
  page.setGraph(epochGraph(1, 1));
  page.subscriber(PE.TemplateUpdateStart, undefined);
  page.subscriber(PE.TemplateUpdateStart, null);
  page.subscriber(PE.TemplateUpdateStart, counter);
  page.subscriber(PE.TemplateUpdateEnd, counter);
  page.close();

  // The pass T001 measured as `movedOne`: `n0`s epoch moved and `n1`s held.
  page.setGraph(epochGraph(2, 1));
  page.subscriber(PE.TemplateUpdateStart, null);
  page.subscriber(PE.TemplateUpdateStart, counter);
  page.subscriber(PE.TemplateUpdateEnd, counter);
  page.close();

  return { page, errors: page.errors, frames: page.records() };
}

/** The pin: both halves of SC6, on the frame and then on the pass. */
function assertEpochRecord(reading) {
  const errors = reading.errors.map(
    (error) => `${error.name}: ${error.message}`,
  );
  assert.deepEqual(
    errors,
    [],
    `a frame whose identity is not an object must close without a throw. The throw escapes the queued microtask, which is outside onEvent's try/catch, so the frame's record is lost with it: the page's error channel carried ${JSON.stringify(errors)} and the page received ${reading.frames.length} record(s)`,
  );

  const frame = reading.frames[0];
  assert.ok(
    frame,
    `the frame that carried a null and an undefined identity must still reach the page's dispatch, as it did for a valid instance (T001 measured records: 1 for an object and 0 for either non-object); the page received ${reading.frames.length} record(s)`,
  );
  const detail = frame.detail;
  assert.deepEqual(
    detail.checks.map((check) => check.events.length).sort(),
    [1, 1, 2],
    `frame ${detail.cycleId} must carry one check per identity that opened it — the null one, the undefined one and the component instance — each with the events it saw; the record carried ${detail.checks.length} check(s), named ${JSON.stringify(detail.checks.map((check) => check.componentName))}`,
  );

  for (const [index, check] of namelessChecks(detail).entries()) {
    assert.deepEqual(
      Object.keys(check),
      Object.keys(checkNamed(detail, 'app-counter')),
      `the check an identity that is not an object produced must travel the shape a valid check travels; check ${index} of frame ${detail.cycleId} carries ${JSON.stringify(Object.keys(check))}`,
    );
    assert.deepEqual(
      check.changedNodeIds,
      [],
      `a check whose identity cannot key the epoch map answers no changed node: it has no previous pass to compare against, and T001 measured the empty list only for a pass that was diffed. Check ${index} of frame ${detail.cycleId} answered ${JSON.stringify(check.changedNodeIds)}`,
    );
  }

  const moved = reading.frames[1];
  assert.ok(
    moved,
    'the pass after the frame must still reach the dispatch: a repair that stops the page agent recording would pass the throw pin and lose this one',
  );
  const named = checkNamed(moved.detail, 'app-counter').changedNodeIds;
  assert.deepEqual(
    named,
    ['n0'],
    `the epoch record must still name the node whose epoch moved: T001 measured movedOne → ["n0"], and this pass answered ${JSON.stringify(named)}`,
  );
  assert.deepEqual(
    namelessChecks(moved.detail).map((check) => check.changedNodeIds),
    [[]],
    'and the non-object check beside it must name no changed node in any pass: an identity that cannot be a key never gets an entry, so a write under an identity of its own would have named n0 here',
  );
}

describe('agent-main.js (the epoch map`s key, T002)', () => {
  afterEach(() => {
    for (const recorder of EPOCH_BOOTS.splice(0)) {
      if (recorder && typeof recorder.reset === 'function') recorder.reset();
    }
    globalThis.queueMicrotask = ORIGINAL_QUEUE_MICROTASK;
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    delete globalThis.__ngRecorder;
  });

  it('held-out E12: a load and a reload close their frames without an agent-thrown error, and every changed epoch is still named (AC1, AC2, AC3)', () => {
    const load = epochReadingOf(SRC);
    assertEpochRecord(load);

    const { page } = load;
    const counter = page.instances[0];

    // A pass in which nothing moved is still the empty list — and only that pass answers it.
    page.setGraph(epochGraph(2, 1));
    page.subscriber(PE.TemplateUpdateStart, counter);
    page.close();
    assert.deepEqual(
      checkNamed(page.records()[2].detail, 'app-counter').changedNodeIds,
      [],
      'a pass in which nothing moved answers the empty list, which is why the empty list cannot be the only answer this record gives',
    );

    // The pass in which both epochs moved names both, as T001 measured `bothMoved → ["n0","n1"]`.
    page.setGraph(epochGraph(3, 4));
    page.subscriber(PE.TemplateUpdateStart, counter);
    page.close();
    assert.deepEqual(
      checkNamed(page.records()[3].detail, 'app-counter').changedNodeIds,
      ['n0', 'n1'],
      'the pass in which both epochs moved must name both, as T001 measured bothMoved → ["n0","n1"]',
    );
    assert.deepEqual(
      page.errors.map((error) => `${error.name}: ${error.message}`),
      [],
      'no pass may throw: every one of these frames reached the dispatch',
    );

    // The reload: the shipped file evaluated a second time on the same page global. Its first pass
    // has no previous entry to diff against, so it names nothing — and it reaches its dispatch.
    assertEpochRecord(epochReadingOf(SRC));
  });

  it('held-out E13: two loads in one session record no agent error, and no epoch change crosses a load or an instance (AC4)', () => {
    const firstLoad = epochReadingOf(SRC);
    assertEpochRecord(firstLoad);
    const firstInstance = firstLoad.page.instances[0];
    firstLoad.page.setGraph(epochGraph(3, 4));
    firstLoad.page.subscriber(PE.TemplateUpdateStart, firstInstance);
    firstLoad.page.close();
    const namedByTheFirstLoad = checkNamed(
      firstLoad.page.records()[2].detail,
      'app-counter',
    ).changedNodeIds;
    assert.deepEqual(
      namedByTheFirstLoad,
      ['n0', 'n1'],
      'the first load ends having named both nodes',
    );

    // The second load, on the same page global, in the same session. Its first pass reads epochs
    // that differ from the ones the first load held: a map that outlived its load would name them.
    const secondLoad = bootEpochPage({ instances: ['Counter'] });
    const secondInstance = secondLoad.instances[0];
    secondLoad.setGraph(epochGraph(9, 9));
    secondLoad.subscriber(PE.TemplateUpdateStart, secondInstance);
    secondLoad.close();
    assert.deepEqual(
      secondLoad.errors.map((error) => `${error.name}: ${error.message}`),
      [],
      'the second load must record zero agent-thrown errors of its own',
    );
    const firstFrameOfTheSecondLoad = secondLoad.records()[0];
    assert.ok(
      firstFrameOfTheSecondLoad,
      'the second load must record the frame that opened it, so no epoch change is attributed across loads',
    );
    assert.deepEqual(
      checkNamed(firstFrameOfTheSecondLoad.detail, 'app-counter')
        .changedNodeIds,
      [],
      `no epoch change may be attributed to the other load's instance: this load's first pass answered ${JSON.stringify(checkNamed(firstFrameOfTheSecondLoad.detail, 'app-counter').changedNodeIds)} where the first load's last pass named ${JSON.stringify(namedByTheFirstLoad)}`,
    );

    // Two instances of one load keep their own entries apart: the second instance's first pass
    // answers nothing even though the first instance's entry holds an older epoch for n0
    // (T001 measured `secondInstanceFirstPass → []`).
    const load = bootEpochPage({ instances: ['Counter', 'Journal'] });
    const [counter, journal] = load.instances;
    load.setGraph(epochGraph(1, 1));
    load.subscriber(PE.TemplateUpdateStart, counter);
    load.close();
    assert.deepEqual(
      checkNamed(load.records()[0].detail, 'app-counter').changedNodeIds,
      [],
    );
    load.setGraph(epochGraph(2, 1));
    load.subscriber(PE.TemplateUpdateStart, journal);
    load.close();
    assert.deepEqual(
      checkNamed(load.records()[1].detail, 'app-journal').changedNodeIds,
      [],
      'the second instance`s first pass must answer no changed node, even though the first instance`s entry holds an older epoch for n0 — T001 measured secondInstanceFirstPass → []',
    );
    assert.deepEqual(
      load.errors.map((error) => `${error.name}: ${error.message}`),
      [],
      'and nothing in that load threw',
    );
  });

  it('the guard is a key test and not a silencing: the entry is written for every object identity and cleared only by reset (AC5)', () => {
    const page = bootEpochPage({ instances: ['Counter'] });
    const [counter] = page.instances;

    page.setGraph(epochGraph(1, 1));
    page.subscriber(PE.TemplateUpdateStart, null);
    page.subscriber(PE.TemplateUpdateStart, counter);
    page.close();
    page.setGraph(epochGraph(2, 1));
    page.subscriber(PE.TemplateUpdateStart, counter);
    page.close();
    assert.deepEqual(
      checkNamed(page.records()[1].detail, 'app-counter').changedNodeIds,
      ['n0'],
      'the map must still be written for every object identity: this pass names n0 only because the pass before it stored its epochs',
    );

    assert.equal(
      page.captured.calls.length,
      1,
      'the profiler is installed exactly once',
    );
    assert.equal(
      typeof page.captured.calls[0],
      'function',
      'and never removed with `ɵsetProfiler(null)`, which would clear every callback on the page',
    );

    page.setGraph(epochGraph(3, 4));
    page.subscriber(PE.TemplateUpdateStart, counter);
    page.close();
    assert.deepEqual(
      checkNamed(page.records()[2].detail, 'app-counter').changedNodeIds,
      ['n0', 'n1'],
      'both epochs moved in this pass, so both are named',
    );
    page.recorder.reset();
    page.subscriber(PE.TemplateUpdateStart, counter);
    page.close();
    assert.deepEqual(
      checkNamed(page.records()[3].detail, 'app-counter').changedNodeIds,
      [],
      'the first pass after reset() has no entry to diff against, so the map is cleared there and nowhere else',
    );
    assert.equal(
      SRC.split('new WeakMap()').length - 1,
      2,
      'the map is declared once and replaced once — on the reset path — and nowhere else',
    );
  });

  describe('the pins are non-vacuous: a mutant reddens one, naming the defect', () => {
    it('passes on the untouched source first', () => {
      assert.doesNotThrow(
        () => assertEpochRecord(epochReadingOf(SRC)),
        'the untouched source must pass the pin before any mutant is credited with reddening it',
      );
    });

    it('M1 drops the non-object check from the record: the pin names the lost frame', () => {
      const dropped = mutantOf(
        '      if (serialized) facts.checks.push(serialized);',
        '      if (serialized && instance)\n        facts.checks.push(serialized);',
      );
      assert.throws(
        () => assertEpochRecord(epochReadingOf(dropped)),
        /frame \d+ must carry one check per identity that opened it/,
        'a record that silently drops the check a non-object identity opened must redden the pin naming the frame it emptied',
      );
    });

    it('M2 stops writing the map: the pin names the moved-epoch case it emptied', () => {
      const unwritten = mutantOf(
        '    prevEpochs.set(instance, next);',
        '    void next;',
      );
      assert.throws(
        () => assertEpochRecord(epochReadingOf(unwritten)),
        /must still name the node whose epoch moved/,
        'a map that is never written answers the empty list on every pass, and must redden the pin naming the pass that moved',
      );
    });

    it('M3 restores the throw: the pin names the frame the marker loses', () => {
      const unguarded = mutantOf(
        '    if (!keyed) return changed;',
        '    if (!keyed && false) return changed;',
      );
      assert.throws(
        () => assertEpochRecord(epochReadingOf(unguarded)),
        /must close without a throw/,
        'the throw the repair removed must redden the pin that says the frame is lost with it',
      );
    });
  });
});

// ---------------------------------------------------------------------------
// The boundary hook's record, beside the profiler and the router (T003, SC2, SC5)
// ---------------------------------------------------------------------------
//
// T001 measured what an error boundary hands a page (`research/raw/m042-error-boundary.json`), and the
// block below drives the shipped install with exactly that: the `ErrorHandler` the page resolved, the
// two `details` shapes the installed chunk passes to `onViewError`, and the one published key that
// separates a core with the boundary machinery from a core without it. What is asserted is the record
// the page produces, never a copy of its builder.
//
//   1. **one section, one shape.** `record.boundary` sits beside `events` and `routerEvents`, and every
//      arrival travels the same entry shape: the route it arrived by, the error's own name and message,
//      the detail fields that payload carried, and the page's own receipt time.
//   2. **the absences.** `caughtBy` is `null` on the construction shape, which does not carry it, and
//      is never synthesised from `boundary.type`; `cause` is absent on a thrown `Error` and present
//      only on the boundary's own wrapped error; an absent discriminator answers `cannot-tell` with a
//      named absence rather than an empty boundary list; and a handler that cannot be reached, or one
//      that refuses the hook, is its own named absence.
//   3. **additive.** `ɵsetProfiler` is called once and never with `null`, the hook is armed beside it
//      and never inside its callback, an app-declared `onViewError` is chained rather than replaced,
//      and `reset` removes it and puts the app's own back.
//
// Each pin is proven non-vacuously at the end of the block: the untouched source passes first, one
// anchored mutant of the shipped file reddens it, and the failure names the defect by string.

/** The token name the walk reads on `record.token`, as the chunk names the class it provides. */
class ErrorHandler {}

/** The two views T001 measured apart: the one whose template threw, and the one that declared. */
class S10Child {}
class S10Parent {}

/** The one entry shape the interface contract fixes, in its field order. */
const BOUNDARY_ENTRY_KEYS = ['route', 'error', 'details', 'at'];

/** The detail fields, in their field order: two of them are the declaring view's, one is the catch's. */
const BOUNDARY_DETAIL_KEYS = [
  'declarationType',
  'declarationInstanceName',
  'caughtBy',
  'boundaryType',
  'boundaryReset',
];

/** The recorders this block booted, reset after each test so no page timer outlives its assertions. */
const BOUNDARY_BOOTS = [];

/** The root element the agent's own reads prefer, and one element list for the presence test. */
function boundaryRoot() {
  return { tagName: 'APP-ROOT' };
}

function boundaryDocument() {
  const root = boundaryRoot();
  return {
    querySelector: (selector) => (selector === 'app-root' ? root : null),
    querySelectorAll: () => [root],
    body: root,
    documentElement: root,
  };
}

/**
 * The page T001 measured: `toggleWatchSignal` published (the one key 22.2.2 publishes and 22.1.8 does
 * not), the `ErrorHandler` token on resolution path entry 1 read from `record.token` — entry 0 is the
 * element injector and holds none — and the provider record `provideBrowserGlobalErrorListeners()`
 * leaves behind, whose token carries the name `GlobalErrorListeners`. `options` switches one half of
 * that page off per case, so each absence is driven apart and compared apart.
 */
function boundaryPage(options = {}) {
  const handler = new ErrorHandler();
  if (options.appHook) handler.onViewError = options.appHook;
  if (options.freeze) Object.freeze(handler);
  const getCalls = [];
  const profilerCalls = [];
  const throwing = new S10Child();
  const declaring = new S10Parent();
  const tags = new Map([
    [throwing, 'S10-CHILD'],
    [declaring, 'S10-PARENT'],
  ]);
  const records = [];
  if (options.handler !== false) {
    records.push({
      token: ErrorHandler,
      provider: { provide: 'ErrorHandler' },
      source: 'provideBrowserGlobalErrorListeners',
      isViewProvider: false,
    });
  }
  if (options.globalListeners !== false) {
    records.push({
      token: { name: 'GlobalErrorListeners' },
      provider: {},
      source: '@angular/core',
      isViewProvider: false,
    });
  }
  const injectorOf = (label, providers) => ({
    label,
    providers,
    get(token) {
      getCalls.push({ injector: label, token });
      if (label === 'environment' && token === ErrorHandler) return handler;
      return null;
    },
  });
  const element = injectorOf('element', [
    { token: { name: 'ElementRef' }, provider: {} },
  ]);
  const environment = injectorOf('environment', records);
  const path = [element, environment];
  const ng = {
    ɵsetProfiler(callback) {
      profilerCalls.push(callback);
      return () => {};
    },
    ɵgetSignalGraph: () => counterGraph(),
    // An identity the page knows yields its host tag, so an entry's name is checkable rather than a
    // constant; one it does not know yields nothing, which is the honest answer.
    getHostElement(instance) {
      const tag = tags.get(instance);
      return tag === undefined ? null : { tagName: tag };
    },
    getDirectiveMetadata: () => ({ changeDetection: 1 }),
    getInjector: () => element,
    ɵgetInjectorResolutionPath: (candidate) =>
      candidate === element ? path : [candidate],
    ɵgetInjectorProviders: (candidate) => candidate.providers,
  };
  // The discriminator T001 enumerated: present on a build that publishes it, absent otherwise.
  if (options.discriminator !== false) ng.toggleWatchSignal = () => {};
  return {
    ng,
    handler,
    throwing,
    declaring,
    getCalls,
    profilerCalls,
    element,
    environment,
    path,
    records,
  };
}

/** Boots the (possibly mutated) script on that page, once, beside the one profiler tap. */
function bootBoundaryPage(options = {}) {
  const page = boundaryPage(options);
  globalThis.document = boundaryDocument();
  const booted = bootSource(options.source ?? SRC, { ng: page.ng });
  BOUNDARY_BOOTS.push(booted.recorder);
  assert.equal(
    page.profilerCalls.length,
    1,
    'the record extends the one profiler tap and never adds a second one',
  );
  return { ...page, ...booted, subscriber: booted.recorder.getSubscriber() };
}

/** The two `details` payloads the installed chunk passes, with the boundary's own field added. */
function boundaryDetails() {
  return {
    view: (throwing, declaring) => ({
      declarationInstance: throwing,
      declarationType: S10Child,
      caughtBy: () => {},
      boundary: { type: S10Parent, reset: () => {} },
    }),
    construction: (declaring) => ({
      declarationInstance: declaring,
      declarationType: S10Parent,
      boundary: { type: S10Parent, reset: () => {} },
    }),
  };
}

/** The boundary's own wrapped error, as `encapsulateBoundaryError` builds it. */
function wrappedBoundaryError(cause) {
  const error = new Error(
    `Error boundary caught an error that's not an Error instance: ${String(cause)}. Check this error's .cause for the actual error.`,
    { cause },
  );
  error.name = 'ErrorBoundaryWrappedError';
  return error;
}

/** One frame's record, so a record exists for what the hook collected before it. */
async function boundaryFrame(page) {
  page.subscriber(PE.TemplateUpdateStart, {});
  await flushMicrotasks();
  const records = recordsOf(page.dispatched);
  assert.ok(
    records.length > 0,
    'TemplateUpdateStart must still open the cycle and the queued microtask must close it: this run dispatched no record',
  );
  return records.at(-1).detail;
}

/** The two detail shapes' own fields: the thrower and the declarer are two answers, recorded apart. */
function assertBoundaryFields(detail) {
  const [first] = detail.boundary.entries;
  assert.equal(
    first.details.declarationType,
    'S10Child',
    'the change-detection shape names the view whose template threw',
  );
  assert.equal(
    first.details.boundaryType,
    'S10Parent',
    'the boundary is the component that declared it, never the component that threw (N1)',
  );
  assert.notEqual(
    first.details.declarationType,
    first.details.boundaryType,
    'the throwing view and the declaring view are two answers and are recorded apart',
  );
}

/** The construction shape omits `caughtBy`, so that entry records the absence rather than a value. */
function assertCaughtByAbsence(detail) {
  const entries = detail.boundary.entries;
  assert.equal(
    entries.length,
    2,
    'the pin drives the two shapes, one arrival each',
  );
  assert.equal(
    entries[0].details.caughtBy,
    true,
    'the change-detection shape carries a caught-by mechanism, and the record says so',
  );
  assert.equal(
    entries[1].details.caughtBy,
    null,
    'the construction shape does not carry caughtBy, so the record answers null for it — never a synthesised caught-by read from boundary.type (AC4)',
  );
}

/** The values of one entry's `details`, by the field order the contract fixes. */
function detailValues(entry) {
  return BOUNDARY_DETAIL_KEYS.map((key) => entry.details[key]);
}

/** One anchored edit of an already-mutated source, refusing to proceed if the anchor went away. */
function mutantEdit(source, anchor, replacement) {
  const occurrences = source.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the mutant anchor ${JSON.stringify(anchor)} must appear once in the mutated source; it appears ${occurrences} time(s) — restate the mutant instead of deleting it`,
  );
  return source.replace(anchor, replacement);
}

/**
 * The pin: the record's section, its one entry shape, and the two detail shapes read by the fields
 * each carries. Every failure names the field it is about, so a mutant reports the defect.
 */
function assertBoundaryRecord(detail) {
  const boundary = detail.boundary;
  assert.ok(
    boundary && typeof boundary === 'object',
    `the record must publish a boundary section beside \`events\` and \`routerEvents\`; it published ${JSON.stringify(boundary)}`,
  );
  assert.deepEqual(
    Object.keys(boundary),
    [
      'state',
      'absence',
      'chained',
      'globalListeners',
      'version',
      'coreVersion',
      'entries',
    ],
    'the boundary section is one fixed shape: the install answer, its named absence, the chaining flag, the browser-listener answer, the version this surface works against and the one the page reports, and the arrivals',
  );
  assert.equal(
    boundary.state,
    'installed',
    `a page that publishes the discriminator and resolves its handler has the hook armed; the record answered ${JSON.stringify(boundary.state)} with ${JSON.stringify(boundary.absence)}`,
  );
  assert.equal(
    boundary.absence,
    null,
    'an installed hook has no absence beside it',
  );
  assert.equal(
    boundary.version,
    '22.2.2',
    'the version is the constant T001 measured as the @angular/core this surface works against, never a claim about the page',
  );
  assert.equal(
    boundary.coreVersion,
    null,
    'no measured page reports its own core version, so the field records the one it reported — null — and never an invented version',
  );
  assert.equal(
    boundary.globalListeners,
    'declared',
    `the page declares the browser global error listeners and the record must name that, not guess at it; it answered ${JSON.stringify(boundary.globalListeners)}`,
  );

  const entries = boundary.entries;
  assert.ok(
    Array.isArray(entries),
    `the boundary section must publish its arrivals as a list; it published ${JSON.stringify(entries)}`,
  );
  entries.forEach((entry, index) => {
    assert.deepEqual(
      Object.keys(entry),
      BOUNDARY_ENTRY_KEYS,
      `every arrival must travel one entry shape: entry ${index} (${entry.route}) carries ${JSON.stringify(Object.keys(entry))}`,
    );
    assert.deepEqual(
      Object.keys(entry.details),
      BOUNDARY_DETAIL_KEYS,
      `every entry carries the same five detail fields, each null where the payload did not carry it: entry ${index} carries ${JSON.stringify(Object.keys(entry.details))}`,
    );
    assert.equal(
      typeof entry.at,
      'number',
      `entry ${index} must carry the page's own receipt time; it carries ${JSON.stringify(entry.at)}`,
    );
    assertPlainData(entry, `boundary entry ${index}`);
  });
  const roundTripped = JSON.parse(JSON.stringify(entries));
  assert.deepEqual(
    roundTripped,
    entries,
    'the entries must be plain data: a value the serialized boundary drops or rewrites means an instance crossed it',
  );
}

/** The hook's own installation: reached through `record.token`, armed once, removed by `reset`. */
function assertBoundaryArmed(page) {
  assert.equal(
    page.getCalls.filter((call) => call.token === ErrorHandler).length,
    1,
    'the ErrorHandler must be reached from `record.token` and asked of its injector exactly once',
  );
  assert.equal(
    page.getCalls.find((call) => call.token === ErrorHandler).injector,
    'environment',
    'and it is asked of the entry that holds the record — the app injector at entry 1, not the element injector at entry 0',
  );
  assert.equal(
    typeof page.handler.onViewError,
    'function',
    'the hook must be armed on the handler the page resolved, before any profiler event arrives',
  );
}

describe('agent-main.js (the boundary hook record, T003)', () => {
  afterEach(() => {
    for (const recorder of BOUNDARY_BOOTS.splice(0)) {
      if (recorder && typeof recorder.reset === 'function') recorder.reset();
    }
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    delete globalThis.__ngRecorder;
    delete globalThis.document;
  });

  it('arms one hook on the handler the page resolved, and reads the two detail shapes by their fields (AC1, AC4)', async () => {
    const page = bootBoundaryPage();
    assertBoundaryArmed(page);

    const { view, construction } = boundaryDetails();
    const boom = new Error('boom');
    page.handler.onViewError(boom, view(page.throwing, page.declaring));
    page.handler.onViewError(
      new TypeError('created'),
      construction(page.declaring),
    );

    const detail = await boundaryFrame(page);
    assertBoundaryRecord(detail);
    assertBoundaryFields(detail);
    assertCaughtByAbsence(detail);

    const entries = detail.boundary.entries;
    assert.equal(
      entries.length,
      2,
      'one entry per arrival, in arrival order, with nothing coalesced',
    );

    // The change-detection catch: the throwing view threw, the declaring view declared the boundary.
    assert.equal(
      entries[0].route,
      'hook',
      'an arrival that carried details came by the hook',
    );
    assert.deepEqual(entries[0].error, { name: 'Error', message: 'boom' });
    assert.equal(entries[0].details.declarationInstanceName, 's10-child');
    assert.equal(entries[0].details.boundaryReset, true);

    // The construction catch: no `caughtBy` at all, and nothing synthesised for it.
    assert.deepEqual(entries[1].error, {
      name: 'TypeError',
      message: 'created',
    });
    assert.equal(
      entries[1].details.boundaryType,
      'S10Parent',
      'and the boundary it named is still recorded whole: one absent field is not a missing record',
    );
    assert.equal(entries[1].details.boundaryReset, true);

    // Nothing the record carries is an instance, an element or a function.
    assert.equal(
      containsFunction(detail.boundary),
      false,
      'no handler, callback, reset or instance may cross the message boundary',
    );
    assert.deepEqual(
      Object.keys(entries[0].error),
      ['name', 'message'],
      'an Error the app threw is recorded as its own name and message, with no `cause` field at all',
    );
  });

  it('names the route each error arrived by, and a delivery with no details names no boundary (AC3)', async () => {
    const page = bootBoundaryPage();
    page.handler.onViewError(new Error('delivered'));
    page.handler.onViewError(
      new Error('hooked'),
      boundaryDetails().view(page.throwing, page.declaring),
    );

    const detail = await boundaryFrame(page);
    assertBoundaryRecord(detail);
    const [delivery, hooked] = detail.boundary.entries;

    assert.equal(
      delivery.route,
      'handler',
      'a delivery that carried no details arrived by the handler, and the record names that route',
    );
    assert.deepEqual(
      detailValues(delivery),
      [null, null, null, null, null],
      'an arrival with no details names no declaring component, no boundary, no caught-by and no reset — and the absence is one record, never a boundary that was not observed',
    );
    assert.equal(
      hooked.route,
      'hook',
      'and the arrival beside it still names its own route: the two outcomes are told apart from the record alone',
    );
    assert.notEqual(
      hooked.details.boundaryType,
      null,
      'a record that carries a boundary is not overwritten by the delivery beside it',
    );
  });

  it('records the wrapped cause only where the boundary wrapped a value that is not Error-like (SC2)', async () => {
    const page = bootBoundaryPage();
    page.handler.onViewError(
      wrappedBoundaryError('boom'),
      boundaryDetails().view(page.throwing, page.declaring),
    );

    const detail = await boundaryFrame(page);
    assertBoundaryRecord(detail);
    const [entry] = detail.boundary.entries;

    assert.deepEqual(
      Object.keys(entry.error),
      ['name', 'message', 'cause'],
      'the boundary wrapped a thrown string, so the record carries that value as the cause',
    );
    assert.equal(entry.error.name, 'ErrorBoundaryWrappedError');
    assert.equal(
      entry.error.cause,
      'boom',
      'the cause is the value the boundary wrapped, as plain data',
    );
    assertPlainData(entry.error, 'the wrapped error');
    assert.equal(
      JSON.stringify(entry.error).includes('[object'),
      false,
      'nothing is coerced through `String()` into the record',
    );
  });

  it('answers cannot-tell with a named absence, never an empty boundary list, where the machinery cannot be confirmed (AC5, SC5)', async () => {
    const page = bootBoundaryPage({ discriminator: false });

    const detail = await boundaryFrame(page);
    const boundary = detail.boundary;
    assert.equal(
      boundary.state,
      'cannot-tell',
      'a page whose published key list lacks `toggleWatchSignal` cannot be confirmed to carry the boundary machinery, and the record answers cannot-tell',
    );
    assert.equal(
      boundary.absence,
      'machinery-unconfirmed',
      `the absence is named, so it is never read as a page that caught nothing; it answered ${JSON.stringify(boundary.absence)}`,
    );
    assert.deepEqual(
      boundary.entries,
      [],
      'and the list is empty because nothing arrived, which the named absence makes legible rather than a claim that no boundary exists',
    );
    assert.equal(
      page.handler.onViewError,
      undefined,
      'no hook is installed on a build this surface cannot confirm carries the machinery',
    );
    assert.equal(
      boundary.globalListeners,
      'declared',
      'the browser-listener answer is read independently of the discriminator, so SC5 still separates its two outcomes',
    );
  });

  it('names a handler that cannot be resolved, and one that refuses the hook, as their own absences (AC6)', async () => {
    const unreachable = bootBoundaryPage({ handler: false });
    const noHandler = (await boundaryFrame(unreachable)).boundary;
    assert.equal(noHandler.state, 'cannot-tell');
    assert.equal(
      noHandler.absence,
      'handler-unresolved',
      'a handler the walk cannot reach is its own named absence, never an empty caught list',
    );

    const frozen = bootBoundaryPage({ freeze: true });
    const refused = (await boundaryFrame(frozen)).boundary;
    assert.equal(refused.state, 'cannot-tell');
    assert.equal(
      refused.absence,
      'hook-refused',
      'a handler that refuses the assignment is a different absence from one that was never found',
    );
    assert.notEqual(
      refused.absence,
      noHandler.absence,
      'the three states a reader must tell apart stay three',
    );
    assert.equal(
      frozen.handler.onViewError,
      undefined,
      'a refusal leaves the handler exactly as it was',
    );
  });

  it('chains an app-declared onViewError instead of replacing it, and reset puts it back (AC1, AC7)', async () => {
    const seen = [];
    function appHook(error, details) {
      seen.push({ self: this, error, details });
      return 'app-answer';
    }
    const page = bootBoundaryPage({ appHook });
    assert.equal(
      typeof page.handler.onViewError,
      'function',
      'the hook is armed on a handler that already declares one',
    );
    assert.notEqual(
      page.handler.onViewError,
      appHook,
      'the app declared its own hook, so the armed one is this file`s and cannot be the app`s',
    );

    const boom = new Error('boom');
    const details = boundaryDetails().view(page.throwing, page.declaring);
    const answer = page.handler.onViewError(boom, details);

    assert.equal(
      seen.length,
      1,
      'the app-declared hook must still be called — an installation that replaced it would leave this empty',
    );
    assert.equal(
      seen[0].error,
      boom,
      'and called with the same error the boundary handed the hook',
    );
    assert.equal(seen[0].details, details, 'and the same details object');
    assert.equal(
      seen[0].self,
      page.handler,
      'and the same `this`, so an app hook that reads its own handler still works',
    );
    assert.equal(
      answer,
      'app-answer',
      'the app hook`s return value reaches the caller, as it did before this installation',
    );

    const detail = await boundaryFrame(page);
    const boundary = detail.boundary;
    assert.equal(boundary.state, 'installed');
    assert.equal(
      boundary.chained,
      true,
      'the record says the hook was chained onto an app-declared one, so a reader knows the absence is the app`s and not a gap',
    );
    assert.equal(
      boundary.entries.length,
      1,
      'a chained hook still records the arrival, once',
    );
    assert.equal(
      seen.length,
      1,
      'and the app hook is called exactly once per arrival',
    );
    assert.equal(
      SRC.split('handler.onViewError = onViewError;').length - 1,
      1,
      'one definition is installed on the handler the page resolves, and it is the only write to that property',
    );

    page.recorder.reset();
    assert.equal(
      page.handler.onViewError,
      appHook,
      'reset must put the app`s own hook back where it declared one',
    );
  });

  it('removes the hook and clears the arrivals on reset, so a second install starts clean (AC1)', async () => {
    const page = bootBoundaryPage();
    page.handler.onViewError(
      new Error('boom'),
      boundaryDetails().view(page.throwing, page.declaring),
    );
    const first = await boundaryFrame(page);
    assert.equal(first.boundary.entries.length, 1);

    page.recorder.reset();
    assert.equal(
      page.handler.onViewError,
      undefined,
      'the hook this file installed is removed by the same reset path as the profiler and router subscriptions',
    );

    page.recorder.tryInstall();
    const second = await boundaryFrame(page);
    assert.equal(
      typeof page.handler.onViewError,
      'function',
      'a second install arms the hook again',
    );
    assert.deepEqual(
      second.boundary.entries,
      [],
      'and the list is cleared with the hook, so a second install starts from an empty stream',
    );
  });

  it('bounds the list as a page-health guard, keeping the newest arrivals in order (AC4)', async () => {
    const page = bootBoundaryPage();
    for (let index = 0; index < 130; index += 1) {
      page.handler.onViewError(new Error(`boom ${index}`));
    }
    const detail = await boundaryFrame(page);
    const entries = detail.boundary.entries;

    assert.equal(
      entries.length,
      128,
      'the list is bounded: a page that throws without end keeps a fixed number of arrivals rather than growing without limit',
    );
    assert.equal(
      entries[0].error.message,
      'boom 2',
      'the oldest arrivals fall off the front',
    );
    assert.equal(
      entries.at(-1).error.message,
      'boom 129',
      'and the newest stay whole',
    );
    assert.deepEqual(
      entries.map((entry) => entry.error.message),
      [...entries.map((entry) => entry.error.message)].sort(
        (left, right) =>
          Number(left.split(' ')[1]) - Number(right.split(' ')[1]),
      ),
      'within the bound nothing is dropped, coalesced or reordered',
    );
  });

  it('records the page`s own answer for the browser global error listeners, never an absence read as "no errors" (AC3, SC5)', async () => {
    const page = bootBoundaryPage({ globalListeners: false });
    const detail = await boundaryFrame(page);
    assert.equal(
      detail.boundary.globalListeners,
      'no-global-error-listeners',
      'a page with no record for the provider answers the named absence, so no surface can read it as "no raw browser error occurred" (N5)',
    );
    assert.deepEqual(detail.boundary.entries, []);

    const unreadable = bootBoundaryPage();
    delete unreadable.ng.ɵgetInjectorProviders;
    // A page that publishes no provider reader cannot answer either way; the field is null rather
    // than a `false` claim about a subject nobody read.
    const second = await boundaryFrame(unreadable);
    assert.equal(
      second.boundary.globalListeners,
      null,
      'where the page publishes no reader for the provider the answer is null, never a claim',
    );
  });

  describe('the pins are non-vacuous: a mutant reddens one, naming the defect', () => {
    it('passes on the untouched source first', async () => {
      const page = bootBoundaryPage();
      page.handler.onViewError(
        new Error('boom'),
        boundaryDetails().view(page.throwing, page.declaring),
      );
      const detail = await boundaryFrame(page);
      assert.doesNotThrow(
        () => assertBoundaryRecord(detail),
        'the untouched source must pass the pin before any mutant is credited with reddening it',
      );
    });

    it('M1 gives a payload that lacks caughtBy a synthetic one: the pin names the absent field (AC4)', async () => {
      const synthesised = mutantOf(
        "        caughtBy: typeof caughtBy === 'function' ? true : null,",
        '        caughtBy: hasBoundary ? true : null,',
      );
      const page = bootBoundaryPage({ source: synthesised });
      const { view, construction } = boundaryDetails();
      page.handler.onViewError(
        new Error('boom'),
        view(page.throwing, page.declaring),
      );
      page.handler.onViewError(
        new TypeError('created'),
        construction(page.declaring),
      );
      const detail = await boundaryFrame(page);
      assert.throws(
        () => assertCaughtByAbsence(detail),
        /the construction shape does not carry caughtBy, so the record answers null/,
        'a caught-by synthesised for a shape that omits it must redden the absence pin',
      );
    });

    it('M2 swaps the throwing view and the declaring boundary: the pin names the field (N1)', async () => {
      const swappedFirst = mutantOf(
        "          boundaryFieldOf(details, 'declarationType'),",
        "          boundaryFieldOf(boundary, 'type'),",
      );
      const swapped = mutantEdit(
        swappedFirst,
        "        boundaryType: hasBoundary\n          ? boundaryTypeNameOf(boundaryFieldOf(boundary, 'type'))\n          : null,",
        "        boundaryType: hasBoundary\n          ? boundaryTypeNameOf(boundaryFieldOf(details, 'declarationType'))\n          : null,",
      );
      const page = bootBoundaryPage({ source: swapped });
      page.handler.onViewError(
        new Error('boom'),
        boundaryDetails().view(page.throwing, page.declaring),
      );
      const detail = await boundaryFrame(page);
      assert.throws(
        () => assertBoundaryFields(detail),
        /the change-detection shape names the view whose template threw/,
        'a record that presents the throwing component as the boundary must redden the field pin',
      );
    });

    it('M3 answers an absent discriminator as an empty list: the pin names the absence (AC5)', async () => {
      const assumed = mutantOf(
        "    if (!ng || typeof ng.toggleWatchSignal !== 'function') {\n      boundaryAbsence = 'machinery-unconfirmed';\n      return false;\n    }",
        "    if (!ng || typeof ng.toggleWatchSignal !== 'function') {\n      boundaryInstalled = true;\n      return true;\n    }",
      );
      const page = bootBoundaryPage({
        source: assumed,
        discriminator: false,
      });
      const detail = await boundaryFrame(page);
      assert.throws(
        () => {
          assert.equal(
            detail.boundary.state,
            'cannot-tell',
            `a page whose published key list lacks the discriminator cannot be confirmed to carry the boundary machinery; the record answered ${JSON.stringify(detail.boundary.state)} with ${JSON.stringify(detail.boundary.absence)}`,
          );
          assert.equal(detail.boundary.absence, 'machinery-unconfirmed');
        },
        /cannot be confirmed to carry the boundary machinery/,
        'an absent discriminator answered as an empty boundary list must redden the absence pin',
      );
    });

    it('M4 replaces an app-declared onViewError instead of chaining it: the pin names the app`s hook (AC7)', async () => {
      const replaced = mutantOf(
        "    boundaryPriorHook = typeof prior === 'function' ? prior : null;",
        '    boundaryPriorHook = null;',
      );
      const seen = [];
      const page = bootBoundaryPage({
        source: replaced,
        appHook: (error, details) => seen.push(error),
      });
      page.handler.onViewError(
        new Error('boom'),
        boundaryDetails().view(page.throwing, page.declaring),
      );
      assert.throws(
        () =>
          assert.equal(
            seen.length,
            1,
            'the app-declared hook must still be called — an installation that replaced it leaves this empty',
          ),
        /an installation that replaced it leaves this empty/,
        'an installation that overwrites an app-declared hook must redden the chaining pin',
      );
    });

    it('M5 installs the hook inside the profiler callback: the pin names the additive rule (AC1, AC7)', async () => {
      const moved = mutantOf(
        "    // The third subscription, armed beside the tap's answer and never inside its callback.\n    installBoundaryHook();\n",
        '',
      );
      const inside = mutantEdit(
        moved,
        '    subscriber = function (event, instance, eventFn) {\n      onEvent(event, instance, eventFn);\n    };',
        '    subscriber = function (event, instance, eventFn) {\n      installBoundaryHook();\n      onEvent(event, instance, eventFn);\n    };',
      );
      const page = bootBoundaryPage({ source: inside });
      assert.throws(
        () =>
          assert.equal(
            typeof page.handler.onViewError,
            'function',
            'the hook must be armed on the handler the page resolved, before any profiler event arrives',
          ),
        /the hook must be armed on the handler the page resolved, before any profiler event arrives/,
        'a hook taken inside the profiler callback must redden the additive pin',
      );
      // The mutant is not vacuous: it installs, just later than the page's own bootstrap.
      await boundaryFrame(page);
      assert.equal(
        typeof page.handler.onViewError,
        'function',
        'and the same mutant does arm the hook once a profiler event has arrived, so the pin reddens the timing and not the installation',
      );
    });
  });
});
