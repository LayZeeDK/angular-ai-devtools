/*!
 * agent-main.js - Angular change-detection causality recorder (MAIN world).
 *
 * Runs inside the inspected page's MAIN world so it can read `window.ng` (Angular dev-mode
 * profiling hooks) and `ng.ɵgetSignalGraph`. It records microtask-delimited change-detection
 * cycles and dispatches them to the isolated-world relay as a window CustomEvent.
 */
(function (global) {
  "use strict";

  var NS = "angular-ai";
  var RECORD_EVENT = NS + ":record";
  var STATE_EVENT = NS + ":state";

  // ProfilerEvent enum values (packages/core/primitives/devtools/src/profiler_types.ts).
  // The enum is not published on the page's `ng` global, so the values are hard-coded for
  // the 22.x surface this extension targets.
  var ProfilerEvent = {
    TemplateUpdateStart: 2,
    TemplateUpdateEnd: 3,
    OutputStart: 6,
    OutputEnd: 7,
  };

  var pendingTrigger = null; // { kind, listenerName } | null, set by the first OutputStart per cycle
  var cycle = null; // { cycleId, startedAt, trigger, checks: Map<instance, {instance, componentName, events}> }
  var cycleId = 0;
  var prevEpochs = new WeakMap(); // instance -> Map(nodeId, epoch)
  var subscriber = null;
  var subscriberRemover = null;
  var installed = false;
  var zoneMode = "noop";
  var ngObj = null;

  function readNg() {
    return typeof globalThis !== "undefined" ? globalThis.ng : global.ng;
  }

  // Mirrors Angular DevTools' profile-formatter: the generated listener name is
  // `${viewFn}_${tag}_${event}_${slot}_listener`, so the DOM event name is the segment
  // immediately before `<slot>_listener`. Host-binding listeners end in `_HostBindingHandler`;
  // there the event is the rightmost segment of the prefix.
  function extractTriggerName(name) {
    if (!name) return null;
    var m = name.match(/(.+?)_(\d+)_listener$/);
    if (m) {
      var parts = m[1].split("_");
      return parts[parts.length - 1] || null;
    }
    m = name.match(/^(.+)_HostBindingHandler$/);
    if (m) {
      var parts2 = m[1].split("_");
      return parts2[parts2.length - 1] || null;
    }
    return null;
  }

  function featuresOf(ng) {
    var f = {
      setProfiler: false,
      getSignalGraph: false,
      getHostElement: false,
      getInjector: false,
      getDirectiveMetadata: false,
    };
    if (!ng) return f;
    f.setProfiler = typeof ng.ɵsetProfiler === "function" || typeof ng.setProfiler === "function";
    f.getSignalGraph = typeof ng.ɵgetSignalGraph === "function" || typeof ng.getSignalGraph === "function";
    f.getHostElement = typeof ng.getHostElement === "function" || typeof ng.ɵgetHostElement === "function";
    f.getInjector = typeof ng.getInjector === "function" || typeof ng.ɵgetInjectorFromNode === "function";
    f.getDirectiveMetadata = typeof ng.getDirectiveMetadata === "function" || typeof ng.ɵgetDirectiveMetadata === "function";
    return f;
  }

  // E7: read zone mode from the root injector's NgZone. A NoopNgZone (zoneless app, including
  // one that still loads zone.js) is supported; a real ZoneNgZone is not. Fall back to the
  // global Zone marker only when no injector/NgZone is available.
  function detectZone(ng, hostElement) {
    var n = ng || ngObj || readNg();
    var getInjector = n && (typeof n.getInjector === "function" ? n.getInjector : (typeof n.ɵgetInjectorFromNode === "function" ? n.ɵgetInjectorFromNode : null));
    var injector = null;
    if (getInjector) {
      try {
        var root = hostElement;
        if (!root && typeof document !== "undefined" && document.querySelector) {
          root = document.querySelector("app-root") || document.body || document.documentElement;
        }
        if (root) injector = getInjector(root);
      } catch (e) { injector = null; }
    }
    if (injector && typeof injector.get === "function") {
      var zone = null;
      try { zone = injector.get("NgZone"); } catch (e) { zone = null; }
      if (!zone) {
        try { zone = injector.get(globalThis.NgZone); } catch (e) { zone = null; }
      }
      if (zone && zone.constructor) {
        var name = zone.constructor.name || "";
        if (name === "ZoneNgZone" || /ZoneNgZone/.test(name)) return "zone";
        if (name === "NoopNgZone" || /NoopNgZone/.test(name)) return "noop";
      }
      if (zone) return "zone";
    }
    if (globalThis && globalThis.Zone) return "zone";
    return "noop";
  }

  function announceState(supported, reason) {
    dispatch(STATE_EVENT, {
      supported: supported,
      reason: reason || null,
      zoneMode: zoneMode,
      features: featuresOf(readNg()),
    });
  }

  function tryInstall() {
    ngObj = readNg();
    if (!ngObj) return "waiting";
    var setProfiler = typeof ngObj.ɵsetProfiler === "function" ? ngObj.ɵsetProfiler : (typeof ngObj.setProfiler === "function" ? ngObj.setProfiler : null);
    if (!setProfiler) {
      announceState(false, "ng.ɵsetProfiler not found (production build or not an Angular page)");
      return "notsupported";
    }
    var zone = detectZone(ngObj);
    if (zone === "zone") {
      announceState(false, "Zone.js change detection is not supported; use zoneless Angular 22");
      return "notsupported";
    }
    if (installed) return "installed";
    subscriber = function (event, instance, eventFn) {
      onEvent(event, instance, eventFn);
    };
    var remover = setProfiler(subscriber);
    subscriberRemover = typeof remover === "function" ? remover : null;
    installed = true;
    zoneMode = zone;
    announceState(true, null);
    return "installed";
  }

  function onEvent(event, instance, eventFn) {
    try {
      if (event === ProfilerEvent.OutputStart) {
        if (!pendingTrigger) {
          pendingTrigger = {
            kind: "output",
            listenerName: eventFn && typeof eventFn.name === "string" ? extractTriggerName(eventFn.name) : null,
          };
        }
        if (cycle) {
          var c = cycle.checks.get(instance);
          if (c) c.events.push(event); // mid-cycle output belongs to this component
        }
        return;
      }
      if (event === ProfilerEvent.OutputEnd) {
        if (cycle) {
          var c2 = cycle.checks.get(instance);
          if (c2) c2.events.push(event);
        }
        return;
      }
      if (event === ProfilerEvent.TemplateUpdateStart) {
        if (!cycle) openCycle();
        getOrCreateCheck(instance).events.push(event);
        return;
      }
      if (event === ProfilerEvent.TemplateUpdateEnd) {
        if (cycle) {
          var c3 = cycle.checks.get(instance);
          if (c3) c3.events.push(event);
        }
        return;
      }
    } catch (e) {
      /* never throw into Angular's profiler loop */
    }
  }

  function openCycle() {
    cycle = {
      cycleId: ++cycleId,
      startedAt: (typeof globalThis.performance !== "undefined" && typeof globalThis.performance.now === "function") ? globalThis.performance.now() : Date.now(),
      trigger: pendingTrigger || { kind: "unknown", listenerName: null },
      checks: new Map(),
    };
    pendingTrigger = null;
    globalThis.queueMicrotask(closeCycle);
  }

  function getOrCreateCheck(instance) {
    var c = cycle.checks.get(instance);
    if (c) return c;
    c = { instance: instance, componentName: componentNameFor(instance), events: [] };
    cycle.checks.set(instance, c);
    return c;
  }

  function componentNameFor(instance) {
    var gh = typeof ngObj.getHostElement === "function" ? ngObj.getHostElement : (typeof ngObj.ɵgetHostElement === "function" ? ngObj.ɵgetHostElement : null);
    if (gh) {
      try {
        var el = gh(instance);
        if (el && typeof el.tagName === "string") return el.tagName.toLowerCase();
      } catch (e) {}
    }
    if (instance && instance.constructor && instance.constructor.name) return instance.constructor.name.toLowerCase();
    return "component";
  }

  function classNameFor(instance) {
    try {
      return (instance && instance.constructor && instance.constructor.name) || null;
    } catch (e) {
      return null;
    }
  }

  function changeDetectionFor(instance) {
    var gdm = typeof ngObj.getDirectiveMetadata === "function" ? ngObj.getDirectiveMetadata : (typeof ngObj.ɵgetDirectiveMetadata === "function" ? ngObj.ɵgetDirectiveMetadata : null);
    if (!gdm) return "onpush";
    try {
      var meta = gdm(instance);
      return meta && meta.changeDetection === 0 ? "onpush" : "eager";
    } catch (e) {
      return "onpush";
    }
  }

  function captureGraph(instance) {
    var gh = typeof ngObj.getHostElement === "function" ? ngObj.getHostElement : (typeof ngObj.ɵgetHostElement === "function" ? ngObj.ɵgetHostElement : null);
    var gi = typeof ngObj.getInjector === "function" ? ngObj.getInjector : (typeof ngObj.ɵgetInjectorFromNode === "function" ? ngObj.ɵgetInjectorFromNode : null);
    var gsg = typeof ngObj.ɵgetSignalGraph === "function" ? ngObj.ɵgetSignalGraph : (typeof ngObj.getSignalGraph === "function" ? ngObj.getSignalGraph : null);
    if (!gh || !gi || !gsg) return null;
    try {
      var hostElement = gh(instance);
      var injector = gi(hostElement);
      return gsg(injector);
    } catch (e) {
      return null;
    }
  }

  function serializeGraph(graph) {
    if (!graph || !graph.nodes) return null;
    var nodes = [];
    for (var i = 0; i < graph.nodes.length; i++) {
      var n = graph.nodes[i];
      nodes.push({
        id: String(n.id),
        kind: n.kind,
        label: n.label != null ? String(n.label) : null,
        epoch: n.epoch != null ? n.epoch : null,
        debuggableFn: n.debuggableFn && n.debuggableFn.name ? n.debuggableFn.name : null,
      });
    }
    var edges = [];
    for (var j = 0; j < graph.edges.length; j++) {
      var e2 = graph.edges[j];
      edges.push({ consumer: e2.consumer, producer: e2.producer });
    }
    return { nodes: nodes, edges: edges };
  }

  function diffEpochs(instance, graph) {
    var prev = prevEpochs.get(instance);
    var changed = [];
    if (prev && graph && graph.nodes) {
      for (var i = 0; i < graph.nodes.length; i++) {
        var n = graph.nodes[i];
        if (prev.get(n.id) !== n.epoch) changed.push(String(n.id));
      }
    }
    var next = new Map();
    if (graph && graph.nodes) {
      for (var j = 0; j < graph.nodes.length; j++) {
        var nj = graph.nodes[j];
        next.set(nj.id, nj.epoch);
      }
    }
    prevEpochs.set(instance, next);
    return changed;
  }

  function closeCycle() {
    if (!cycle) return;
    var c = cycle;
    cycle = null;
    var facts = {
      cycleId: c.cycleId,
      startedAt: c.startedAt,
      trigger: c.trigger,
      zoneMode: zoneMode,
      checks: [],
    };
    c.checks.forEach(function (check, instance) {
      var serialized = serializeCheck(instance, check);
      if (serialized) facts.checks.push(serialized);
    });
    dispatch(RECORD_EVENT, facts);
  }

  function serializeCheck(instance, check) {
    var graph = captureGraph(instance);
    var changedNodeIds = diffEpochs(instance, graph);
    return {
      componentName: check.componentName,
      className: classNameFor(instance),
      changeDetection: changeDetectionFor(instance),
      events: check.events.slice(),
      graph: serializeGraph(graph),
      changedNodeIds: changedNodeIds,
    };
  }

  function dispatch(type, detail) {
    var CustomEventCtor = typeof globalThis.CustomEvent === "function" ? globalThis.CustomEvent : (typeof global.CustomEvent === "function" ? global.CustomEvent : null);
    var ev = CustomEventCtor ? new CustomEventCtor(type, { detail: detail }) : { type: type, detail: detail };
    if (typeof globalThis.dispatchEvent === "function") {
      globalThis.dispatchEvent(ev);
    } else if (typeof global.dispatchEvent === "function") {
      global.dispatchEvent(ev);
    }
  }

  function start() {
    var r = tryInstall();
    if (r === "installed" || r === "notsupported") return;
    var handle = globalThis.setInterval(function () {
      var r2 = tryInstall();
      if (r2 === "installed" || r2 === "notsupported") globalThis.clearInterval(handle);
    }, 100);
    return handle;
  }

  function reset() {
    if (subscriberRemover) {
      try {
        subscriberRemover();
      } catch (e) {}
      subscriberRemover = null;
    }
    installed = false;
    subscriber = null;
    pendingTrigger = null;
    cycle = null;
    prevEpochs = new WeakMap();
  }

  var api = {
    start: start,
    tryInstall: tryInstall,
    onEvent: onEvent,
    closeCycle: closeCycle,
    extractTriggerName: extractTriggerName,
    reset: reset,
    PROFILER_EVENT: ProfilerEvent,
    RECORD_EVENT: RECORD_EVENT,
    STATE_EVENT: STATE_EVENT,
    getSubscriber: function () {
      return subscriber;
    },
    get installed() {
      return installed;
    },
  };

  if (typeof globalThis !== "undefined") globalThis.__ngRecorder = api;
  // Auto-run when loaded as a content script.
  start();
})(typeof globalThis !== "undefined" ? globalThis : this);
