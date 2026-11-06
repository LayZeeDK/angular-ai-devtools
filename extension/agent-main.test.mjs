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
  OutputStart: 6,
  OutputEnd: 7,
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
  vm.runInThisContext(SRC, { filename: 'agent-main.js' });
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
