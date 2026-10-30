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
  var DI_QUERY_EVENT = NS + ":di-query";
  var DI_GRAPH_EVENT = NS + ":di-graph";
  var ERROR_CAPTURE_EVENT = NS + ":error-capture";

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
      getInjectorResolutionPath: false,
      getInjectorMetadata: false,
      getInjectorProviders: false,
    };
    if (!ng) return f;
    f.setProfiler = typeof ng.ɵsetProfiler === "function" || typeof ng.setProfiler === "function";
    f.getSignalGraph = typeof ng.ɵgetSignalGraph === "function" || typeof ng.getSignalGraph === "function";
    f.getHostElement = typeof ng.getHostElement === "function" || typeof ng.ɵgetHostElement === "function";
    f.getInjector = typeof ng.getInjector === "function" || typeof ng.ɵgetInjectorFromNode === "function";
    f.getDirectiveMetadata = typeof ng.getDirectiveMetadata === "function" || typeof ng.ɵgetDirectiveMetadata === "function";
    f.getInjectorResolutionPath = typeof ng.ɵgetInjectorResolutionPath === "function";
    f.getInjectorMetadata = typeof ng.ɵgetInjectorMetadata === "function";
    f.getInjectorProviders = typeof ng.ɵgetInjectorProviders === "function";
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
    var gsgCheck = typeof ngObj.ɵgetSignalGraph === "function" ? ngObj.ɵgetSignalGraph : (typeof ngObj.getSignalGraph === "function" ? ngObj.getSignalGraph : null);
    if (!gsgCheck) {
      announceState(false, "ng.ɵgetSignalGraph not found (production build or not an Angular page)");
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
    // Resolve edges from raw indices to global node ids.
    var edges = [];
    for (var j = 0; j < graph.edges.length; j++) {
      var e2 = graph.edges[j];
      var consumerIdx = typeof e2.consumer === "number" ? e2.consumer : -1;
      var producerIdx = typeof e2.producer === "number" ? e2.producer : -1;
      var consumerId = (consumerIdx >= 0 && consumerIdx < nodes.length) ? nodes[consumerIdx].id : (typeof e2.consumer === "string" ? e2.consumer : null);
      var producerId = (producerIdx >= 0 && producerIdx < nodes.length) ? nodes[producerIdx].id : (typeof e2.producer === "string" ? e2.producer : null);
      edges.push({ consumer: consumerId, producer: producerId });
    }
    // Check for a template node (owning component). Missing means graph unavailable.
    var hasTemplate = false;
    for (var t = 0; t < nodes.length; t++) {
      if (nodes[t].kind === "template") { hasTemplate = true; break; }
    }
    var result = { nodes: nodes, edges: edges };
    if (!hasTemplate) result.unavailable = true;
    return result;
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

  function handleDiQuery(e) {
    try {
      var detail = e && e.detail ? e.detail : {};
      var componentName = detail.componentName;
      var elementTag = detail.elementTag;
      var ng = ngObj || readNg();
      var el = null;
      if (elementTag && typeof document !== "undefined" && document && typeof document.querySelector === "function") {
        try { el = document.querySelector(elementTag); } catch (err) { el = null; }
      }
      if (!el && componentName && typeof document !== "undefined" && document && typeof document.querySelector === "function") {
        try { el = document.querySelector(componentName); } catch (err) { el = null; }
      }
      var getInjector = ng && (typeof ng.getInjector === "function" ? ng.getInjector : (typeof ng.ɵgetInjectorFromNode === "function" ? ng.ɵgetInjectorFromNode : null));
      var injector = null;
      if (el && getInjector) {
        try { injector = getInjector(el); } catch (err) { injector = null; }
      }
      var gip = ng && typeof ng.ɵgetInjectorResolutionPath === "function" ? ng.ɵgetInjectorResolutionPath : null;
      var injectors = [];
      if (gip && injector) {
        try { injectors = gip(injector) || []; } catch (err) { injectors = []; }
      } else if (injector) {
        injectors = [injector];
      }
      if (!Array.isArray(injectors)) injectors = [];
      var path = [];
      for (var i = 0; i < injectors.length; i++) {
        var inj = injectors[i];
        var meta = null;
        var providers = null;
        if (ng && typeof ng.ɵgetInjectorMetadata === "function") {
          try { meta = ng.ɵgetInjectorMetadata(inj); } catch (err) { meta = null; }
        }
        if (ng && typeof ng.ɵgetInjectorProviders === "function") {
          try { providers = ng.ɵgetInjectorProviders(inj); } catch (err) { providers = null; }
        }
        var injectorName = "Injector";
        if (meta) {
          if (typeof meta === "string") injectorName = meta;
          else if (meta.source != null) {
            if (typeof meta.source === "string") injectorName = meta.source;
            else if (meta.source.tagName != null) injectorName = meta.source.tagName;
          }
        }
        var provs = [];
        if (Array.isArray(providers)) {
          for (var p = 0; p < providers.length; p++) {
            var pr = providers[p];
            var token = (pr && pr.token != null)
              ? (pr.token.name ?? (typeof pr.token.toString === "function" ? pr.token.toString() : undefined) ?? String(pr.token))
              : (pr && pr.name != null ? String(pr.name) : String(pr));
            var prov = pr && pr.provider;
            var providerKind = "none";
            if (prov && typeof prov === "object") {
              if (Object.prototype.hasOwnProperty.call(prov, "useFactory")) providerKind = "factory";
              else if (Object.prototype.hasOwnProperty.call(prov, "useValue")) providerKind = "value";
              else if (Object.prototype.hasOwnProperty.call(prov, "useClass")) providerKind = "class";
              else if (Object.prototype.hasOwnProperty.call(prov, "useExisting")) providerKind = "existing";
            } else if (typeof prov === "function") {
              providerKind = "class";
            }
            var source = (pr && pr.source) || "";
            var importPathRaw = pr && (pr.importPath || pr.moduleName);
            var importPath;
            if (Array.isArray(importPathRaw)) {
              importPath = importPathRaw.map(function (t) {
                if (t == null) return "";
                if (typeof t === "string") return t;
                if (t.name != null) return String(t.name);
                if (typeof t.toString === "function") return t.toString();
                return String(t);
              }).filter(function (s) { return s !== ""; }).join(", ");
            } else if (importPathRaw != null) {
              importPath = String(importPathRaw);
            }
            if (!importPath) importPath = source || undefined;
            var entry = {
              token: token,
              isViewProvider: (pr && typeof pr.isViewProvider === "boolean") ? pr.isViewProvider : false,
              provider: providerKind,
              importPath: importPath,
            };
            provs.push(entry);
          }
        }
        var metaType;
        if (typeof meta === "string") {
          metaType = "environment";
        } else if (meta && meta.type) {
          if (meta.type === "element") metaType = "element";
          else metaType = "environment";
        } else {
          metaType = "environment";
        }
        path.push({
          id: i,
          metadata: { type: metaType, source: String(injectorName) },
          providers: provs,
        });
      }
      dispatch(DI_GRAPH_EVENT, {
        type: DI_GRAPH_EVENT,
        resolutionPath: {
          component: componentName,
          elementTag: elementTag,
          path: path,
          available: true,
        },
      });
    } catch (e) {
      /* never throw */
    }
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
    handleDiQuery: handleDiQuery,
    PROFILER_EVENT: ProfilerEvent,
    RECORD_EVENT: RECORD_EVENT,
    STATE_EVENT: STATE_EVENT,
    DI_QUERY_EVENT: DI_QUERY_EVENT,
    DI_GRAPH_EVENT: DI_GRAPH_EVENT,
    ERROR_CAPTURE_EVENT: ERROR_CAPTURE_EVENT,
    getSubscriber: function () {
      return subscriber;
    },
    get installed() {
      return installed;
    },
  };

  if (typeof globalThis !== "undefined") globalThis.__ngRecorder = api;
  if (typeof globalThis !== "undefined" && typeof globalThis.addEventListener === "function") {
    try { globalThis.addEventListener(DI_QUERY_EVENT, handleDiQuery); } catch (e) {}
  }

  // N4: error capture hooks at document_start (console.error, window.onerror,
  // unhandledrejection). Wired alongside N1/N2/N3 without changing their events.
  function captureErrorPayload(message) {
    try {
      var ng = ngObj || readNg();
      var text = message instanceof Error ? (message.message || String(message)) : String(message);
      var codeMatch = text.match(/NG0\d{3,}/);
      var code = codeMatch ? codeMatch[0] : null;
      var component = null;
      if (ng && typeof ng.getOwningComponent === "function") {
        try {
          var el = (typeof document !== "undefined" && document)
            ? (document.activeElement || document.querySelector("app-root") || document.body || document.documentElement)
            : null;
          var instance = ng.getOwningComponent(el);
          if (instance && instance.constructor && instance.constructor.name) component = instance.constructor.name;
          else if (typeof instance === "string") component = instance;
        } catch (e) { component = null; }
      }
      dispatch(ERROR_CAPTURE_EVENT, {
        code: code,
        message: text,
        component: component,
        timestamp: (typeof Date !== "undefined") ? Date.now() : 0,
      });
    } catch (e) { /* never throw */ }
  }

  try {
    if (typeof console !== "undefined" && typeof console.error === "function") {
      var originalConsoleError = console.error;
      console.error = function () {
        try { captureErrorPayload(Array.prototype.slice.call(arguments).join(" ")); } catch (e) {}
        return originalConsoleError.apply(this, arguments);
      };
    }
  } catch (e) {}

  try {
    if (typeof globalThis !== "undefined" && typeof globalThis.addEventListener === "function") {
      globalThis.addEventListener("error", function (ev) {
        try { captureErrorPayload(ev && ev.error ? ev.error : (ev && ev.message ? ev.message : ev)); } catch (e) {}
      });
      globalThis.addEventListener("unhandledrejection", function (ev) {
        try { captureErrorPayload(ev && ev.reason ? ev.reason : ev); } catch (e) {}
      });
    }
  } catch (e) {}

  // Auto-run when loaded as a content script.
  start();
})(typeof globalThis !== "undefined" ? globalThis : this);
