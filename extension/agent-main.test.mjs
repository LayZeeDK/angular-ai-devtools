// Tests for extension/agent-main.js (Angular change-detection cycle recorder).
// The content script is loaded via vm.runInThisContext so it executes in Node's own realm
// (no cross-realm prototype mismatch), with window.ng / globals mocked per test.
import assert from "node:assert/strict";
import { describe, it, before, afterEach } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const SRC = readFileSync(new URL("./agent-main.js", import.meta.url), "utf8");

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
  return new Function(`return function ${name.replace(/[^A-Za-z0-9_$]/g, "_")}() {}`)();
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
  vm.runInThisContext(SRC, { filename: "agent-main.js" });
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
  const captured = { subscriber: null, profilerCalls: 0, getSignalGraphCalls: 0 };
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
    getHostElement: (inst) => ({ tagName: opts.hostTag || "APP-COUNTER" }),
    getDirectiveMetadata: (inst) => ({ changeDetection: opts.changeDetection ?? 1 }),
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
      { id: "n0", kind: "signal", label: "count", epoch: 1 },
      { id: "n1", kind: "computed", label: "double", epoch: 1 },
      { id: "n2", kind: "template", label: "app-counter", epoch: 1, debuggableFn: Counter },
    ],
    edges: [
      { consumer: 2, producer: 0 },
      { consumer: 2, producer: 1 },
      { consumer: 1, producer: 0 },
    ],
  };
}

describe("agent-main.js (recorder)", () => {
  afterEach(() => {
    // Restore originals to avoid leaking mocks across tests.
    globalThis.ng = ORIGINALS.ng;
    globalThis.Zone = ORIGINALS.Zone;
    globalThis.CustomEvent = ORIGINALS.CustomEvent;
    globalThis.dispatchEvent = ORIGINALS.dispatchEvent;
    globalThis.performance = ORIGINALS.performance;
    globalThis.__ngRecorder = ORIGINALS.__ngRecorder;
  });

  describe("forbidden tokens", () => {
    const code = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    it("does not use ViewContainerRef / getViewContainerRef / di_graph / devtools discovery", () => {
      assert.equal(code.includes("ViewContainerRef"), false);
      assert.equal(code.includes("getViewContainerRef"), false);
      assert.equal(code.includes("di_graph"), false);
      assert.equal(code.includes("devtoolstooldiscovery"), false);
    });
    it("contains no Prompt API / LanguageModel code", () => {
      assert.equal(code.includes("LanguageModel"), false);
      assert.equal(code.includes("setPrompt"), false);
    });
  });

  describe("feature detection", () => {
    it("installs exactly one profiler subscriber when ng.ɵsetProfiler is present", () => {
      const { ng, captured } = makeNg({ graph: null });
      const { recorder, dispatched } = boot({ ng });
      assert.equal(captured.profilerCalls, 1);
      assert.equal(recorder.installed, true);
      const state = dispatched.find((e) => e.type === "angular-ai:state");
      assert.equal(state.detail.supported, true);
    });

    it("says 'not supported' when ng.ɵsetProfiler is missing", () => {
      const { dispatched } = boot({ ng: {} });
      const state = dispatched.find((e) => e.type === "angular-ai:state");
      assert.equal(state.detail.supported, false);
      assert.match(String(state.detail.reason), /ɵsetProfiler/);
      assert.equal(state.detail.features.setProfiler, false);
    });

    it("reports 'not supported' for a Zone.js app (E7)", () => {
      const { ng } = makeNg({ graph: null });
      const { dispatched } = boot({ ng, Zone: function Zone() {} });
      const state = dispatched.find((e) => e.type === "angular-ai:state");
      assert.equal(state.detail.supported, false);
      assert.match(String(state.detail.reason), /Zone\.js/i);
    });

    it("reports supported for a zoneless app, attaching the zone mode", () => {
      const { ng } = makeNg({ graph: null });
      const { dispatched, recorder } = boot({ ng });
      const state = dispatched.find((e) => e.type === "angular-ai:state");
      assert.equal(state.detail.supported, true);
      assert.equal(state.detail.zoneMode, "noop");
      assert.equal(state.detail.features.getSignalGraph, true);
      assert.equal(recorder.installed, true);
    });
  });

  describe("microtask cycle-order rule (E4)", () => {
    it("groups the pre-cycle OutputStart as the trigger and TemplateUpdateStart/End in order", async () => {
      const counter = new Counter();
      const listener = namedFn("Counter_Template_button_click_0_listener");
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.OutputStart, counter, listener);
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === "angular-ai:record");
      assert.equal(record.detail.trigger.kind, "output");
      assert.equal(record.detail.trigger.listenerName, "click");
      assert.equal(record.detail.zoneMode, "noop");
      assert.equal(record.detail.checks.length, 1);
      assert.deepEqual(record.detail.checks[0].events, [PE.TemplateUpdateStart, PE.TemplateUpdateEnd]);
      assert.equal(record.detail.checks[0].componentName, "app-counter");
      assert.equal(record.detail.checks[0].className, "Counter");
      assert.equal(record.detail.checks[0].changeDetection, "eager");
      assert.notEqual(record.detail.checks[0].graph, null);
    });

    it("preserves profiler event order with no name-based tie-break (mid-cycle OutputStart)", async () => {
      const counter = new Counter();
      const listener = namedFn("Counter_Template_button_click_0_listener");
      const { ng } = makeNg({ graph: counterGraph(), hostTag: "app-counter" });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.OutputStart, counter, listener);
      sub(PE.TemplateUpdateEnd, counter);
      sub(PE.OutputEnd, counter, listener);
      await flushMicrotasks();

      const record = dispatched.find((e) => e.type === "angular-ai:record");
      assert.deepEqual(record.detail.checks[0].events, [
        PE.TemplateUpdateStart,
        PE.OutputStart,
        PE.TemplateUpdateEnd,
        PE.OutputEnd,
      ]);
      // one trigger per cycle; a mid-cycle OutputStart does not overwrite an unknown cycle trigger
      assert.equal(record.detail.trigger.kind, "unknown");
    });

    it("groups multiple checked components into one cycle", async () => {
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
      const record = dispatched.find((e) => e.type === "angular-ai:record");
      assert.equal(record.detail.checks.length, 2);
    });
  });

  describe("shaped facts over the CustomEvent channel", () => {
    it("never carries a component-instance reference, LanguageModel or prompt text", async () => {
      const counter = new Counter();
      const listener = namedFn("Counter_Template_button_click_0_listener");
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.OutputStart, counter, listener);
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === "angular-ai:record");
      const json = JSON.stringify(record.detail);
      assert.equal(json.includes("APP-COUNTER"), false); // host tag string, not the instance object
      assert.equal(json.includes("constructor"), false);
      assert.equal(json.includes("LanguageModel"), false);
      assert.equal(json.includes("prompt"), false);
      assert.equal(record.detail.trigger.listenerName, "click");
    });
  });

  describe("extractTriggerName (formatOutput-style)", () => {
    it("extracts the DOM event name from a generated listener name", () => {
      assert.equal(extractTrigger("Counter_Template_button_click_0_listener"), "click");
      assert.equal(extractTrigger("Foo_Template_input_change_2_listener"), "change");
      assert.equal(extractTrigger("App_Template_button_click_10_listener"), "click");
    });
    it("extracts from a host-binding handler name", () => {
      assert.equal(extractTrigger("Counter_host_class_active_HostBindingHandler"), "active");
    });
    it("returns null for names without a recognizable shape", () => {
      assert.equal(extractTrigger(null), null);
      assert.equal(extractTrigger(""), null);
      assert.equal(extractTrigger("not_a_listener"), null);
    });
  });

  describe("signal-graph capture and epoch diff", () => {
    it("resolves edges to global node ids in serialized graph", async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === "angular-ai:record");
      const graph = record.detail.checks[0].graph;
      assert.ok(graph);
      // Edges should be resolved to node id strings, not raw indices.
      assert.equal(typeof graph.edges[0].consumer, "string");
      assert.equal(typeof graph.edges[0].producer, "string");
      assert.equal(graph.edges[0].consumer, "n2");
      assert.equal(graph.edges[0].producer, "n0");
      assert.equal(graph.edges[1].consumer, "n2");
      assert.equal(graph.edges[1].producer, "n1");
      assert.equal(graph.edges[2].consumer, "n1");
      assert.equal(graph.edges[2].producer, "n0");
    });

    it("marks graph as unavailable when no template node exists", async () => {
      const counter = new Counter();
      const noTemplateGraph = {
        nodes: [
          { id: "n0", kind: "signal", label: "count", epoch: 1 },
          { id: "n1", kind: "computed", label: "double", epoch: 1 },
        ],
        edges: [{ consumer: 1, producer: 0 }],
      };
      const { ng } = makeNg({ graph: noTemplateGraph });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === "angular-ai:record");
      const graph = record.detail.checks[0].graph;
      assert.ok(graph);
      assert.equal(graph.unavailable, true);
    });

    it("does not mark graph as unavailable when template node exists", async () => {
      const counter = new Counter();
      const { ng } = makeNg({ graph: counterGraph() });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();
      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const record = dispatched.find((e) => e.type === "angular-ai:record");
      const graph = record.detail.checks[0].graph;
      assert.ok(graph);
      assert.equal(graph.unavailable, undefined);
    });

    it("serializes the graph without signal values and diffs epochs across cycles", async () => {
      const counter = new Counter();
      const graphA = {
        nodes: [
          { id: "n0", kind: "signal", label: "count", epoch: 1 },
          { id: "n2", kind: "template", label: "app-counter", epoch: 1, debuggableFn: Counter },
        ],
        edges: [{ consumer: 1, producer: 0 }],
      };
      const graphB = {
        nodes: [
          { id: "n0", kind: "signal", label: "count", epoch: 2 },
          { id: "n2", kind: "template", label: "app-counter", epoch: 2, debuggableFn: Counter },
        ],
        edges: [{ consumer: 1, producer: 0 }],
      };
      const { ng } = makeNg({ graph: [graphA, graphB] });
      const { recorder, dispatched } = boot({ ng });
      const sub = recorder.getSubscriber();

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const r1 = dispatched.filter((e) => e.type === "angular-ai:record")[0];
      assert.deepEqual(r1.detail.checks[0].changedNodeIds, []);
      assert.equal(r1.detail.checks[0].graph.nodes[0].hasOwnProperty("value"), false);
      assert.equal(r1.detail.checks[0].graph.nodes[1].debuggableFn, "Counter");

      sub(PE.TemplateUpdateStart, counter);
      sub(PE.TemplateUpdateEnd, counter);
      await flushMicrotasks();
      const r2 = dispatched.filter((e) => e.type === "angular-ai:record")[1];
      assert.deepEqual(r2.detail.checks[0].changedNodeIds, ["n0", "n2"]);
    });

    it("reports 'not supported' when ɵgetSignalGraph is unavailable", () => {
      const { ng } = makeNg({ graph: null });
      delete ng.ɵgetSignalGraph;
      const { recorder, dispatched } = boot({ ng });
      const state = dispatched.find((e) => e.type === "angular-ai:state");
      assert.equal(state.detail.supported, false);
      assert.match(String(state.detail.reason), /ɵgetSignalGraph/);
      assert.equal(recorder.installed, false);
    });
  });
});

describe("agent-main.js (DI doctor)", () => {
  var origAddEventListener;
  var origDocument;

  before(() => {
    origAddEventListener = globalThis.addEventListener;
    origDocument = globalThis.document;
  });

  afterEach(() => {
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

  it("dispatches di-graph with DiResolutionPath format on di-query", () => {
    var diQueryCb = null;
    var capAdd = globalThis.addEventListener;
    globalThis.addEventListener = function (type, cb) {
      if (type === "angular-ai:di-query") diQueryCb = cb;
      if (capAdd) capAdd.call(globalThis, type, cb);
    };

    globalThis.document = {
      querySelector: function () { return { tagName: "APP-COUNTER" }; },
    };

    var { ng } = makeNg();
    ng.ɵgetInjectorResolutionPath = function () { return [1, 2, 3]; };
    ng.ɵgetInjectorMetadata = function () {
      return { type: "environment", source: "EnvironmentInjector" };
    };
    ng.ɵgetInjectorProviders = function () {
      return [
        { token: "FooService", provider: { useValue: 1 }, source: "AppModule", importPath: "app/module", isViewProvider: false },
        { token: { name: "BarToken", toString: function () { return "InjectionToken BarToken"; } }, provider: { useFactory: function () {} }, source: "CounterComponent", isViewProvider: true },
      ];
    };

    var { dispatched } = boot({ ng });
    globalThis.addEventListener = capAdd;

    assert.ok(diQueryCb, "handleDiQuery should be registered as di-query listener");
    diQueryCb({ detail: { componentName: "app-counter", elementTag: "app-counter" } });

    var diGraph = dispatched.find(function (e) { return e.type === "angular-ai:di-graph"; });
    assert.ok(diGraph, "di-graph event should be dispatched");
    assert.equal(diGraph.detail.resolutionPath.component, "app-counter");
    assert.equal(diGraph.detail.resolutionPath.elementTag, "app-counter");
    assert.equal(diGraph.detail.resolutionPath.available, true);
    assert.equal(diGraph.detail.resolutionPath.path.length, 3);

    var inj0 = diGraph.detail.resolutionPath.path[0];
    assert.equal(inj0.id, 0);
    assert.equal(inj0.metadata.type, "environment");
    assert.equal(inj0.metadata.source, "EnvironmentInjector");
    assert.equal(inj0.providers.length, 2);
    assert.equal(inj0.providers[0].token, "FooService");
    assert.equal(inj0.providers[0].provider, "value");
    assert.equal(inj0.providers[0].isViewProvider, false);
    assert.equal(inj0.providers[0].importPath, "app/module");
    assert.equal(inj0.providers[1].token, "BarToken");
    assert.equal(inj0.providers[1].provider, "factory");
    assert.equal(inj0.providers[1].isViewProvider, true);
  });

  it("falls back to single-injector path when ɵgetInjectorResolutionPath is unavailable", () => {
    var diQueryCb = null;
    var capAdd = globalThis.addEventListener;
    globalThis.addEventListener = function (type, cb) {
      if (type === "angular-ai:di-query") diQueryCb = cb;
      if (capAdd) capAdd.call(globalThis, type, cb);
    };

    globalThis.document = {
      querySelector: function () { return { tagName: "APP-COUNTER" }; },
    };

    var { ng } = makeNg();
    delete ng.ɵgetInjectorResolutionPath;
    ng.ɵgetInjectorMetadata = function () {
      return { type: "environment", source: "RootInjector" };
    };
    ng.ɵgetInjectorProviders = function () { return [{ token: "FooService", provider: { useValue: 1 } }]; };

    var { dispatched } = boot({ ng });
    globalThis.addEventListener = capAdd;

    diQueryCb({ detail: { componentName: "app-root", elementTag: "app-root" } });

    var diGraph = dispatched.find(function (e) { return e.type === "angular-ai:di-graph"; });
    assert.ok(diGraph, "di-graph event should be dispatched even with fallback");
    assert.equal(diGraph.detail.resolutionPath.path.length, 1);
    assert.equal(diGraph.detail.resolutionPath.path[0].metadata.source, "RootInjector");
  });

  it("uses componentName as querySelector fallback when elementTag is absent", () => {
    var diQueryCb = null;
    var capAdd = globalThis.addEventListener;
    globalThis.addEventListener = function (type, cb) {
      if (type === "angular-ai:di-query") diQueryCb = cb;
      if (capAdd) capAdd.call(globalThis, type, cb);
    };

    var queriedSelector = null;
    globalThis.document = {
      querySelector: function (sel) {
        queriedSelector = sel;
        return { tagName: "APP-COUNTER" };
      },
    };

    var { ng } = makeNg();
    ng.ɵgetInjectorResolutionPath = function () { return []; };
    ng.ɵgetInjectorMetadata = function () { return "RootInjector"; };
    ng.ɵgetInjectorProviders = function () { return []; };

    var { dispatched } = boot({ ng });
    globalThis.addEventListener = capAdd;

    diQueryCb({ detail: { componentName: "app-counter", elementTag: null } });

    assert.equal(queriedSelector, "app-counter", "should fall back to componentName selector");
    var diGraph = dispatched.find(function (e) { return e.type === "angular-ai:di-graph"; });
    assert.ok(diGraph);
    assert.equal(diGraph.detail.resolutionPath.available, true);
  });
});
