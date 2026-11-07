/*!
 * agent-main.js - Angular change-detection causality recorder (MAIN world).
 *
 * Runs inside the inspected page's MAIN world so it can read `window.ng` (Angular dev-mode
 * profiling hooks) and `ng.ɵgetSignalGraph`. It records microtask-delimited change-detection
 * cycles and dispatches them to the isolated-world relay as a window CustomEvent.
 */
(function (global) {
  'use strict';

  var NS = 'angular-ai';
  var RECORD_EVENT = NS + ':record';
  var STATE_EVENT = NS + ':state';
  var DI_QUERY_EVENT = NS + ':di-query';
  var DI_GRAPH_EVENT = NS + ':di-graph';
  var ERROR_CAPTURE_EVENT = NS + ':error-capture';

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
  var zoneMode = 'noop';
  var ngObj = null;

  function readNg() {
    return typeof globalThis !== 'undefined' ? globalThis.ng : global.ng;
  }

  // Mirrors Angular DevTools' profile-formatter: the generated listener name is
  // `${viewFn}_${tag}_${event}_${slot}_listener`, so the DOM event name is the segment
  // immediately before `<slot>_listener`. Host-binding listeners end in `_HostBindingHandler`;
  // there the event is the rightmost segment of the prefix.
  function extractTriggerName(name) {
    if (!name) return null;
    var m = name.match(/(.+?)_(\d+)_listener$/);
    if (m) {
      var parts = m[1].split('_');
      return parts[parts.length - 1] || null;
    }
    m = name.match(/^(.+)_HostBindingHandler$/);
    if (m) {
      var parts2 = m[1].split('_');
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
    f.setProfiler =
      typeof ng.ɵsetProfiler === 'function' ||
      typeof ng.setProfiler === 'function';
    f.getSignalGraph =
      typeof ng.ɵgetSignalGraph === 'function' ||
      typeof ng.getSignalGraph === 'function';
    f.getHostElement =
      typeof ng.getHostElement === 'function' ||
      typeof ng.ɵgetHostElement === 'function';
    f.getInjector =
      typeof ng.getInjector === 'function' ||
      typeof ng.ɵgetInjectorFromNode === 'function';
    f.getDirectiveMetadata =
      typeof ng.getDirectiveMetadata === 'function' ||
      typeof ng.ɵgetDirectiveMetadata === 'function';
    f.getInjectorResolutionPath =
      typeof ng.ɵgetInjectorResolutionPath === 'function';
    f.getInjectorMetadata = typeof ng.ɵgetInjectorMetadata === 'function';
    f.getInjectorProviders = typeof ng.ɵgetInjectorProviders === 'function';
    return f;
  }

  // E7: read zone mode from the root injector's NgZone. A NoopNgZone (zoneless app, including
  // one that still loads zone.js) is supported; a real ZoneNgZone is not. Fall back to the
  // global Zone marker only when no injector/NgZone is available.
  function detectZone(ng, hostElement) {
    var n = ng || ngObj || readNg();
    var getInjector =
      n &&
      (typeof n.getInjector === 'function'
        ? n.getInjector
        : typeof n.ɵgetInjectorFromNode === 'function'
          ? n.ɵgetInjectorFromNode
          : null);
    var injector = null;
    if (getInjector) {
      try {
        var root = hostElement;
        if (
          !root &&
          typeof document !== 'undefined' &&
          document.querySelector
        ) {
          root =
            document.querySelector('app-root') ||
            document.body ||
            document.documentElement;
        }
        if (root) injector = getInjector(root);
      } catch (e) {
        injector = null;
      }
    }
    if (injector && typeof injector.get === 'function') {
      var zone = null;
      try {
        zone = injector.get('NgZone');
      } catch (e) {
        zone = null;
      }
      if (!zone) {
        try {
          zone = injector.get(globalThis.NgZone);
        } catch (e) {
          zone = null;
        }
      }
      if (zone && zone.constructor) {
        var name = zone.constructor.name || '';
        if (name === 'ZoneNgZone' || /ZoneNgZone/.test(name)) return 'zone';
        if (name === 'NoopNgZone' || /NoopNgZone/.test(name)) return 'noop';
      }
      if (zone) return 'zone';
    }
    if (globalThis && globalThis.Zone) return 'zone';
    return 'noop';
  }

  // --- Companion opt-in: the page's own `globalThis.ngAiDevTools` entry (T004) ----------------
  //
  // The package the app installs writes exactly one own string key on the page's global object,
  // first-write-wins, whose value is `{ version, '@angular/platform-browser': { Meta },
  // '@angular/router': { Router } }`. Detection runs here, in the MAIN world, because the panel is
  // a devtools document and a `globalThis` read there reads the panel's own absent property.
  //
  // The probe answers one of four named states, never a boolean and never a ninth `features` name:
  //   absent              no entry at all
  //   foreign-entry       the key is there but is not the package's shape — a stub or a stale copy
  //   version-unsupported right shape, unfamiliar version
  //   declared            the entry passed validation; carries the accepted symbols
  // Presence alone is deliberately not detection (N1): `featuresOf` is eight `typeof` checks and
  // the panel renders any published bit as present, so a bit set from a `typeof` read would read
  // to the user as a full opt-in (N1, N2). Nothing is added to the `features` map either: an extra
  // name there would reach the group gate but neither `app_facts`' closed tuple nor the chip.
  var COMPANION_KEY = 'ngAiDevTools';

  // The accepted vocabulary, spelled once in the page realm. The panel keeps its own closed copy of
  // the same literal (T005); the identical interface-contract bullet is what makes them one promise.
  var COMPANION_ACCEPTED_VERSION = '0.2202.0';
  var COMPANION_SYMBOLS = [
    { pkg: '@angular/platform-browser', name: 'Meta' },
    { pkg: '@angular/router', name: 'Router' },
  ];

  // The bounded re-check: a handful of attempts on a timer, then it stops. No new event type, no
  // new message type and no panel-to-page request — the entry is read from the page's own global.
  var COMPANION_RECHECK_ATTEMPTS = 5;
  var COMPANION_RECHECK_INTERVAL_MS = 250;

  var lastState = null; // { supported, reason }: the record `tryInstall` published, re-emitted as-is
  var companionRecheck = null; // { handle, remaining } | null

  function isVettedPackage(pkg) {
    for (var i = 0; i < COMPANION_SYMBOLS.length; i++) {
      if (COMPANION_SYMBOLS[i].pkg === pkg) return true;
    }
    return false;
  }

  function isVettedSymbol(pkg, name) {
    for (var i = 0; i < COMPANION_SYMBOLS.length; i++) {
      if (
        COMPANION_SYMBOLS[i].pkg === pkg &&
        COMPANION_SYMBOLS[i].name === name
      )
        return true;
    }
    return false;
  }

  // Reads the entry. A read only: this is the one global name the extension looks at besides
  // `__ngRecorder`, and it never writes it (N3).
  function readCompanionEntry() {
    try {
      return typeof globalThis !== 'undefined'
        ? globalThis[COMPANION_KEY]
        : undefined;
    } catch (e) {
      return undefined;
    }
  }

  // A named answer carrying no accepted symbol, so `declared` always equals `symbols.length` and an
  // `absent` answer is a state, never an empty symbol list.
  function companionRefusal(state, version) {
    return {
      state: state,
      version: typeof version === 'string' && version.length ? version : null,
      symbols: [],
    };
  }

  // Validates the entry against the package's own facade shape before believing anything: a
  // non-null object, a non-empty string `version`, every group an object, every symbol name on the
  // vetted table — with a class as its value, because the whole contribution to the lookup is a
  // class object compared by identity. A name on the table whose value is not a function is still
  // `foreign-entry`: a stale copy that kept the key and lost the class is not a partial opt-in. A
  // group this vocabulary does not name is refused for the same reason: the shape the contract
  // fixes is these groups and no others, and an extra one is surface no version of the package
  // promised. The shape walk runs first so an unfamiliar version on a well-formed entry keeps its
  // own answer, and a missing symbol is not a refusal but the honest "declared, no symbols".
  function probeCompanion() {
    var entry = readCompanionEntry();
    if (typeof entry === 'undefined') return companionRefusal('absent', null);
    if (entry === null || typeof entry !== 'object' || isArrayValue(entry))
      return companionRefusal('foreign-entry', null);
    var version;
    try {
      version = entry.version;
    } catch (e) {
      return companionRefusal('foreign-entry', null);
    }
    if (typeof version !== 'string' || version.length === 0)
      return companionRefusal('foreign-entry', null);
    var accepted = [];
    var keys;
    try {
      keys = Object.keys(entry);
    } catch (e) {
      return companionRefusal('foreign-entry', version);
    }
    for (var i = 0; i < keys.length; i++) {
      var pkg = keys[i];
      if (pkg === 'version') continue;
      if (!isVettedPackage(pkg))
        return companionRefusal('foreign-entry', version);
      var group;
      try {
        group = entry[pkg];
      } catch (e) {
        return companionRefusal('foreign-entry', version);
      }
      if (group === null || typeof group !== 'object' || isArrayValue(group))
        return companionRefusal('foreign-entry', version);
      var names;
      try {
        names = Object.keys(group);
      } catch (e) {
        return companionRefusal('foreign-entry', version);
      }
      for (var j = 0; j < names.length; j++) {
        var name = names[j];
        if (!isVettedSymbol(pkg, name))
          return companionRefusal('foreign-entry', version);
        var value;
        try {
          value = group[name];
        } catch (e) {
          return companionRefusal('foreign-entry', version);
        }
        if (typeof value !== 'function')
          return companionRefusal('foreign-entry', version);
        accepted.push({ pkg: pkg, name: name, value: value });
      }
    }
    if (version !== COMPANION_ACCEPTED_VERSION)
      return companionRefusal('version-unsupported', version);
    return { state: 'declared', version: version, symbols: accepted };
  }

  function isArrayValue(value) {
    try {
      return typeof Array.isArray === 'function' ? Array.isArray(value) : false;
    } catch (e) {
      return false;
    }
  }

  // The page's injector, reached the way the rest of this file reaches it: `getInjector` (or the
  // compiler-private alias) on the app's root element. No `injector.get` is ever called with a
  // vetted token, because a lookup would instantiate someone else's class (N4).
  function companionInjector(ng) {
    var getInjector =
      ng &&
      (typeof ng.getInjector === 'function'
        ? ng.getInjector
        : typeof ng.ɵgetInjectorFromNode === 'function'
          ? ng.ɵgetInjectorFromNode
          : null);
    if (!getInjector) return null;
    var root = null;
    try {
      if (
        typeof document !== 'undefined' &&
        document &&
        typeof document.querySelector === 'function'
      ) {
        root =
          document.querySelector('app-root') ||
          document.body ||
          document.documentElement;
      }
    } catch (e) {
      root = null;
    }
    if (!root) return null;
    try {
      return getInjector(root);
    } catch (e) {
      return null;
    }
  }

  // Identity against the shipped walk: each provider record's token is compared with the class read
  // from the entry, over `ɵgetInjectorResolutionPath` + `ɵgetInjectorProviders`, with every `ɵ`
  // function feature-detected and every call guarded. A second Angular copy produces a well-formed
  // entry and a walk that matches no record, so `declared` and `resolved` are counted apart and the
  // honest "N declared, 0 resolved" is what the panel receives.
  function countCompanionResolved(ng, symbols) {
    if (!symbols.length) return 0;
    var injector = companionInjector(ng);
    if (!injector) return 0;
    var getProviders =
      ng && typeof ng.ɵgetInjectorProviders === 'function'
        ? ng.ɵgetInjectorProviders
        : null;
    if (!getProviders) return 0;
    var getPath =
      ng && typeof ng.ɵgetInjectorResolutionPath === 'function'
        ? ng.ɵgetInjectorResolutionPath
        : null;
    var injectors = [];
    if (getPath) {
      try {
        injectors = getPath(injector) || [];
      } catch (e) {
        injectors = [];
      }
    }
    if (!isArrayValue(injectors) || !injectors.length) injectors = [injector];
    var resolved = 0;
    for (var i = 0; i < symbols.length; i++) {
      var matched = false;
      for (var j = 0; j < injectors.length && !matched; j++) {
        var providers = null;
        try {
          providers = getProviders(injectors[j]);
        } catch (e) {
          providers = null;
        }
        if (!isArrayValue(providers)) continue;
        for (var k = 0; k < providers.length; k++) {
          var record = providers[k];
          if (record && record.token === symbols[i].value) {
            matched = true;
            break;
          }
        }
      }
      if (matched) resolved++;
    }
    return resolved;
  }

  // The fifth top-level field: the state, the version the entry declares, the two counts kept
  // apart, and the accepted symbols by `pkg`/`name` only — a vetted symbol is a lookup token, never
  // app content, so its class never reaches the payload (N4).
  function companionField(ng) {
    var probe = probeCompanion();
    var symbols = [];
    for (var i = 0; i < probe.symbols.length; i++) {
      symbols.push({ pkg: probe.symbols[i].pkg, name: probe.symbols[i].name });
    }
    return {
      state: probe.state,
      version: probe.version,
      declared: symbols.length,
      resolved:
        probe.state === 'declared'
          ? countCompanionResolved(ng, probe.symbols)
          : 0,
      symbols: symbols,
    };
  }

  function stopCompanionRecheck() {
    if (!companionRecheck) return;
    var handle = companionRecheck.handle;
    companionRecheck = null;
    try {
      globalThis.clearInterval(handle);
    } catch (e) {}
  }

  // Armed only when the answer is `absent`: an entry the app writes after its bootstrap would
  // otherwise be invisible, because the record is one-shot and no panel-to-page ask exists.
  function armCompanionRecheck(answering) {
    stopCompanionRecheck();
    if (answering !== 'absent' || !lastState) return;
    var handle;
    try {
      handle = globalThis.setInterval(
        recheckCompanion,
        COMPANION_RECHECK_INTERVAL_MS,
      );
    } catch (e) {
      return;
    }
    companionRecheck = {
      handle: handle,
      remaining: COMPANION_RECHECK_ATTEMPTS,
    };
  }

  // Finite: the timer is cleared on the first non-absent answer and on the last attempt, and the
  // re-emission goes through `announceState` so the payload is the same record `tryInstall` builds.
  function recheckCompanion() {
    if (!companionRecheck) return;
    try {
      companionRecheck.remaining -= 1;
      var probe = probeCompanion();
      if (probe.state !== 'absent') {
        stopCompanionRecheck();
        if (lastState) announceState(lastState.supported, lastState.reason);
        return;
      }
      if (companionRecheck.remaining <= 0) stopCompanionRecheck();
    } catch (e) {
      /* a timer must never throw into the page */
    }
  }

  function announceState(supported, reason) {
    var ng = readNg();
    lastState = { supported: supported, reason: reason || null };
    var companion = companionField(ng);
    dispatch(STATE_EVENT, {
      supported: supported,
      reason: reason || null,
      zoneMode: zoneMode,
      features: featuresOf(ng),
      companion: companion,
    });
    armCompanionRecheck(companion.state);
  }

  function angularVersionString(ng) {
    try {
      if (ng && ng.VERSION && (ng.VERSION.full || ng.VERSION.major != null)) {
        if (ng.VERSION.full) return String(ng.VERSION.full);
        return (
          String(ng.VERSION.major) +
          '.' +
          String(ng.VERSION.minor) +
          '.' +
          String(ng.VERSION.patch)
        );
      }
      if (ng && ng.version) return String(ng.version);
    } catch (e) {}
    return null;
  }
  function versionOlderThan(v, minMajor, minMinor, minPatch) {
    if (!v) return false;
    var m = String(v).match(/(\d+)\.(\d+)\.(\d+)/);
    if (!m) return false;
    var maj = Number(m[1]),
      min = Number(m[2]),
      pat = Number(m[3]);
    if (maj !== minMajor) return maj < minMajor;
    if (min !== minMinor) return min < minMinor;
    return pat < minPatch;
  }
  function tryInstall() {
    ngObj = readNg();
    if (!ngObj) return 'waiting';
    var detectedVersion = angularVersionString(ngObj);
    if (detectedVersion && versionOlderThan(detectedVersion, 22, 1, 3)) {
      announceState(
        false,
        'Angular ' +
          detectedVersion +
          ' is not supported; requires 22.1.3 or newer',
      );
      return 'notsupported';
    }
    var setProfiler =
      typeof ngObj.ɵsetProfiler === 'function'
        ? ngObj.ɵsetProfiler
        : typeof ngObj.setProfiler === 'function'
          ? ngObj.setProfiler
          : null;
    if (!setProfiler) {
      announceState(
        false,
        'ng.ɵsetProfiler not found (production build or not an Angular page)',
      );
      return 'notsupported';
    }
    var gsgCheck =
      typeof ngObj.ɵgetSignalGraph === 'function'
        ? ngObj.ɵgetSignalGraph
        : typeof ngObj.getSignalGraph === 'function'
          ? ngObj.getSignalGraph
          : null;
    if (!gsgCheck) {
      announceState(
        false,
        'ng.ɵgetSignalGraph not found (production build or not an Angular page)',
      );
      return 'notsupported';
    }
    var zone = detectZone(ngObj);
    if (zone === 'zone') {
      announceState(
        false,
        'Zone.js change detection is not supported; use zoneless Angular 22',
      );
      return 'notsupported';
    }
    if (installed) return 'installed';
    subscriber = function (event, instance, eventFn) {
      onEvent(event, instance, eventFn);
    };
    var remover = setProfiler(subscriber);
    subscriberRemover = typeof remover === 'function' ? remover : null;
    installed = true;
    zoneMode = zone;
    announceState(true, null);
    try {
      globalThis.setTimeout(function () {
        dispatchInitialRecord();
      }, 500);
    } catch (e) {
      dispatchInitialRecord();
    }
    return 'installed';
  }

  function onEvent(event, instance, eventFn) {
    try {
      if (event === ProfilerEvent.OutputStart) {
        if (!pendingTrigger) {
          pendingTrigger = {
            kind: 'output',
            listenerName:
              eventFn && typeof eventFn.name === 'string'
                ? extractTriggerName(eventFn.name)
                : null,
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
      startedAt:
        typeof globalThis.performance !== 'undefined' &&
        typeof globalThis.performance.now === 'function'
          ? globalThis.performance.now()
          : Date.now(),
      trigger: pendingTrigger || { kind: 'unknown', listenerName: null },
      checks: new Map(),
    };
    pendingTrigger = null;
    globalThis.queueMicrotask(closeCycle);
  }

  function getOrCreateCheck(instance) {
    var c = cycle.checks.get(instance);
    if (c) return c;
    c = {
      instance: instance,
      componentName: componentNameFor(instance),
      events: [],
    };
    cycle.checks.set(instance, c);
    return c;
  }

  function componentNameFor(instance) {
    var gh =
      typeof ngObj.getHostElement === 'function'
        ? ngObj.getHostElement
        : typeof ngObj.ɵgetHostElement === 'function'
          ? ngObj.ɵgetHostElement
          : null;
    if (gh) {
      try {
        var el = gh(instance);
        if (el && typeof el.tagName === 'string')
          return el.tagName.toLowerCase();
      } catch (e) {}
    }
    if (instance && instance.constructor && instance.constructor.name)
      return instance.constructor.name.toLowerCase();
    return 'component';
  }

  function classNameFor(instance) {
    try {
      return (
        (instance && instance.constructor && instance.constructor.name) || null
      );
    } catch (e) {
      return null;
    }
  }

  function changeDetectionFor(instance) {
    var gdm =
      typeof ngObj.getDirectiveMetadata === 'function'
        ? ngObj.getDirectiveMetadata
        : typeof ngObj.ɵgetDirectiveMetadata === 'function'
          ? ngObj.ɵgetDirectiveMetadata
          : null;
    if (!gdm) return null;
    try {
      var meta = gdm(instance);
      return meta && meta.changeDetection === 0 ? 'onpush' : 'eager';
    } catch (e) {
      return null;
    }
  }

  function captureGraph(instance) {
    var gh =
      typeof ngObj.getHostElement === 'function'
        ? ngObj.getHostElement
        : typeof ngObj.ɵgetHostElement === 'function'
          ? ngObj.ɵgetHostElement
          : null;
    var gi =
      typeof ngObj.getInjector === 'function'
        ? ngObj.getInjector
        : typeof ngObj.ɵgetInjectorFromNode === 'function'
          ? ngObj.ɵgetInjectorFromNode
          : null;
    var gsg =
      typeof ngObj.ɵgetSignalGraph === 'function'
        ? ngObj.ɵgetSignalGraph
        : typeof ngObj.getSignalGraph === 'function'
          ? ngObj.getSignalGraph
          : null;
    if (!gh || !gi || !gsg) return null;
    try {
      var hostElement = gh(instance);
      var injector = gi(hostElement);
      return gsg(injector);
    } catch (e) {
      return null;
    }
  }

  function enumerateComponentNodes() {
    var ng = ngObj || readNg();
    var getComponent =
      ng &&
      (typeof ng.getComponent === 'function'
        ? ng.getComponent
        : typeof ng.ɵgetComponent === 'function'
          ? ng.ɵgetComponent
          : typeof ng.getOwningComponent === 'function'
            ? ng.getOwningComponent
            : null);
    if (!getComponent) return [];
    if (
      typeof document === 'undefined' ||
      !document ||
      typeof document.querySelectorAll !== 'function'
    )
      return [];
    var seen = new Set();
    var out = [];
    var els = null;
    try {
      els = document.querySelectorAll('*');
    } catch (e) {
      els = null;
    }
    if (!els) return out;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var inst = null;
      try {
        inst = getComponent(el);
      } catch (e) {
        inst = null;
      }
      if (!inst || !inst.constructor) continue;
      var cls = inst.constructor.name;
      if (!cls || seen.has(cls)) continue;
      seen.add(cls);
      var src = '';
      try {
        src = String(inst.constructor);
      } catch (e) {
        src = '';
      }
      out.push({
        id: 'cmp:' + cls,
        kind: 'template',
        label:
          el && typeof el.tagName === 'string'
            ? el.tagName.toLowerCase()
            : cls.toLowerCase(),
        epoch: null,
        debuggableFn: cls,
        debuggableFnSource: src,
        component: cls,
      });
    }
    return out;
  }

  function serializeGraph(graph) {
    if (!graph || !graph.nodes) graph = { nodes: [], edges: [] };
    var nodes = [];
    var seenClasses = new Set();
    if (graph.nodes) {
      for (var i = 0; i < graph.nodes.length; i++) {
        var n = graph.nodes[i];
        if (n && n.debuggableFn && n.debuggableFn.name)
          seenClasses.add(String(n.debuggableFn.name));
        var nodeValue = null;
        try {
          var v =
            n.value !== undefined
              ? n.value
              : typeof n.getValue === 'function'
                ? n.getValue()
                : undefined;
          if (v === undefined) {
            try {
              v = n.value;
            } catch (e2) {
              v = undefined;
            }
          }
        } catch (e1) {
          v = undefined;
        }
        var valueSummary = undefined;
        try {
          if (v === null) valueSummary = null;
          else if (typeof v === 'string')
            valueSummary = v.length > 64 ? v.slice(0, 64) + '...' : v;
          else if (typeof v === 'number' || typeof v === 'boolean')
            valueSummary = v;
          else if (Array.isArray(v))
            valueSummary = { type: 'array', length: v.length };
          else if (typeof v === 'object')
            valueSummary = {
              type: (v && v.constructor && v.constructor.name) || 'object',
              keys: Object.keys(v).length,
            };
          else if (v !== undefined) valueSummary = String(v).slice(0, 64);
        } catch (e3) {
          valueSummary = undefined;
        }
        var pushedNode = {
          id: String(n.id),
          kind: n.kind,
          label: n.label != null ? String(n.label) : null,
          epoch: n.epoch != null ? n.epoch : null,
          debuggableFn:
            n.debuggableFn && n.debuggableFn.name ? n.debuggableFn.name : null,
          debuggableFnSource: n.debuggableFn
            ? String(n.debuggableFn)
            : typeof n.debuggableFnSource === 'string'
              ? n.debuggableFnSource
              : null,
        };
        if (valueSummary !== undefined) pushedNode.value = valueSummary;
        nodes.push(pushedNode);
      }
    }
    // Augment with real component instances enumerated from the document.
    var extra = enumerateComponentNodes();
    for (var e = 0; e < extra.length; e++) {
      var en = extra[e];
      if (seenClasses.has(en.component)) continue;
      seenClasses.add(en.component);
      nodes.push(en);
    }
    // Resolve edges from raw indices to global node ids. `edges` is optional:
    // a graph that carries only nodes must serialize as a graph with no
    // edges, not throw inside the record dispatch and lose the whole record.
    var rawEdges = graph.edges || [];
    var edges = [];
    for (var j = 0; j < rawEdges.length; j++) {
      var e2 = rawEdges[j];
      var consumerIdx = typeof e2.consumer === 'number' ? e2.consumer : -1;
      var producerIdx = typeof e2.producer === 'number' ? e2.producer : -1;
      var consumerId =
        consumerIdx >= 0 && consumerIdx < nodes.length
          ? nodes[consumerIdx].id
          : typeof e2.consumer === 'string'
            ? e2.consumer
            : null;
      var producerId =
        producerIdx >= 0 && producerIdx < nodes.length
          ? nodes[producerIdx].id
          : typeof e2.producer === 'string'
            ? e2.producer
            : null;
      edges.push({ consumer: consumerId, producer: producerId });
    }
    // Check for a template node (owning component). Missing means graph unavailable.
    var hasTemplate = false;
    for (var t = 0; t < nodes.length; t++) {
      if (nodes[t].kind === 'template') {
        hasTemplate = true;
        break;
      }
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
      if (
        elementTag &&
        typeof document !== 'undefined' &&
        document &&
        typeof document.querySelector === 'function'
      ) {
        try {
          el = document.querySelector(elementTag);
        } catch (err) {
          el = null;
        }
      }
      if (
        !el &&
        componentName &&
        typeof document !== 'undefined' &&
        document &&
        typeof document.querySelector === 'function'
      ) {
        try {
          el = document.querySelector(componentName);
        } catch (err) {
          el = null;
        }
      }
      var getInjector =
        ng &&
        (typeof ng.getInjector === 'function'
          ? ng.getInjector
          : typeof ng.ɵgetInjectorFromNode === 'function'
            ? ng.ɵgetInjectorFromNode
            : null);
      var injector = null;
      if (el && getInjector) {
        try {
          injector = getInjector(el);
        } catch (err) {
          injector = null;
        }
      }
      var gip =
        ng && typeof ng.ɵgetInjectorResolutionPath === 'function'
          ? ng.ɵgetInjectorResolutionPath
          : null;
      var injectors = [];
      if (gip && injector) {
        try {
          injectors = gip(injector) || [];
        } catch (err) {
          injectors = [];
        }
      } else if (injector) {
        injectors = [injector];
      }
      if (!Array.isArray(injectors)) injectors = [];
      var path = [];
      for (var i = 0; i < injectors.length; i++) {
        var inj = injectors[i];
        var meta = null;
        var providers = null;
        if (ng && typeof ng.ɵgetInjectorMetadata === 'function') {
          try {
            meta = ng.ɵgetInjectorMetadata(inj);
          } catch (err) {
            meta = null;
          }
        }
        if (ng && typeof ng.ɵgetInjectorProviders === 'function') {
          try {
            providers = ng.ɵgetInjectorProviders(inj);
          } catch (err) {
            providers = null;
          }
        }
        var injectorName = 'Injector';
        if (meta) {
          if (typeof meta === 'string') injectorName = meta;
          else if (meta.source != null) {
            if (typeof meta.source === 'string') injectorName = meta.source;
            else if (meta.source.tagName != null)
              injectorName = meta.source.tagName;
          }
        }
        var provs = [];
        if (Array.isArray(providers)) {
          for (var p = 0; p < providers.length; p++) {
            var pr = providers[p];
            var token =
              pr && pr.token != null
                ? (pr.token.name ??
                  (typeof pr.token.toString === 'function'
                    ? pr.token.toString()
                    : undefined) ??
                  String(pr.token))
                : pr && pr.name != null
                  ? String(pr.name)
                  : String(pr);
            var prov = pr && pr.provider;
            var providerKind = 'none';
            if (prov && typeof prov === 'object') {
              if (Object.prototype.hasOwnProperty.call(prov, 'useFactory'))
                providerKind = 'factory';
              else if (Object.prototype.hasOwnProperty.call(prov, 'useValue'))
                providerKind = 'value';
              else if (Object.prototype.hasOwnProperty.call(prov, 'useClass'))
                providerKind = 'class';
              else if (
                Object.prototype.hasOwnProperty.call(prov, 'useExisting')
              )
                providerKind = 'existing';
            } else if (typeof prov === 'function') {
              providerKind = 'class';
            }
            var source = (pr && pr.source) || '';
            var importPathRaw = pr && (pr.importPath || pr.moduleName);
            var importPath;
            if (Array.isArray(importPathRaw)) {
              importPath = importPathRaw
                .map(function (t) {
                  if (t == null) return '';
                  if (typeof t === 'string') return t;
                  if (t.name != null) return String(t.name);
                  if (typeof t.toString === 'function') return t.toString();
                  return String(t);
                })
                .filter(function (s) {
                  return s !== '';
                })
                .join(', ');
            } else if (importPathRaw != null) {
              importPath = String(importPathRaw);
            }
            if (!importPath) importPath = source || undefined;
            var entry = {
              token: token,
              isViewProvider:
                pr && typeof pr.isViewProvider === 'boolean'
                  ? pr.isViewProvider
                  : false,
              provider: providerKind,
              importPath: importPath,
            };
            provs.push(entry);
          }
        }
        var metaType;
        if (typeof meta === 'string') {
          metaType = 'environment';
        } else if (meta && meta.type) {
          if (meta.type === 'element') metaType = 'element';
          else metaType = 'environment';
        } else {
          metaType = 'environment';
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

  // --- Picker: resolve a picked page element to its owning component (T006) ---------------------
  //
  // The overlay lives in the ISOLATED world and cannot read the page's `ng`, so the only thing that
  // can cross the world boundary is a DOM node: the overlay dispatches the pick event on the picked
  // element and this MAIN-world listener reads `event.target`. `event.detail` is never read — its
  // cross-world semantics are unverified in this tree, while a DOM node is shared by construction.
  //
  // The resolver is `getOwningComponent` and not `getComponent`: an element inside a component's
  // template resolves to that component, which is the case a picker exists to get right, while
  // `getComponent` answers null there and would fail it.
  //
  // The answer is plain data only — strings and a string array — because the message boundary is
  // JSON (N2). No instance, element or function is carried, and `__ngContext__` is read as a
  // presence test, never serialized: its absence is a named state, not an error, and per T001's
  // measurement it is written in production builds too, so the state is named for the debug API
  // (`no-dev-api`) with a reason that names the possibility of a production build rather than
  // asserting one.
  var PICK_EVENT = NS + ':pick';
  var PICKED_EVENT = NS + ':picked';

  // The ancestor bound of the path walk: a picked element's depth in its own document, never a
  // document-wide query.
  var PICK_MAX_ANCESTORS = 64;

  var PICK_NO_API_REASON =
    'ng.getOwningComponent not found; this page may be a production build';
  var PICK_NO_CONTEXT_REASON =
    'the picked element carries no __ngContext__; this page may be a production build';

  function lowerTagName(el) {
    try {
      var tag = el && el.tagName;
      return typeof tag === 'string' && tag.length ? tag.toLowerCase() : null;
    } catch (e) {
      return null;
    }
  }

  // The identifier the panel already lists components by: the owning instance's host tag name
  // lowercased, with the class name lowercased as the fallback the shipped records use.
  function pickComponentName(instance, ng) {
    var gh =
      ng && typeof ng.getHostElement === 'function'
        ? ng.getHostElement
        : ng && typeof ng.ɵgetHostElement === 'function'
          ? ng.ɵgetHostElement
          : null;
    if (gh) {
      try {
        var tag = lowerTagName(gh(instance));
        if (tag) return tag;
      } catch (e) {}
    }
    var cls = classNameFor(instance);
    return cls ? cls.toLowerCase() : null;
  }

  // The owning instance of the picked element, plus the distinct constructor names from that element
  // upward. A getter that throws resolves as "no instance here" instead of stopping the walk, and the
  // walk is bounded by ancestor depth.
  function walkOwningComponents(el, getOwning) {
    var owning = null;
    var path = [];
    var seen = new Set();
    var node = el;
    var depth = 0;
    while (node && depth < PICK_MAX_ANCESTORS) {
      depth += 1;
      var instance = null;
      try {
        instance = getOwning(node);
      } catch (e) {
        instance = null;
      }
      if (instance) {
        if (!owning) owning = instance;
        var cls = classNameFor(instance);
        if (cls && !seen.has(cls)) {
          seen.add(cls);
          path.push(cls);
        }
      }
      var parent = null;
      try {
        parent = node.parentElement;
      } catch (e) {
        parent = null;
      }
      node = parent;
    }
    return { owning: owning, path: path };
  }

  // One of three named outcomes, never collapsed: `no-dev-api` (the page publishes no component
  // getter, or this element carries no dev context), `no-component` (a dev context with no owning
  // instance) and the resolved descriptor.
  function pickDescriptorFor(el) {
    if (!el) return null;
    var ng = null;
    try {
      ng = readNg();
    } catch (e) {
      ng = null;
    }
    var getOwning =
      ng && typeof ng.getOwningComponent === 'function'
        ? ng.getOwningComponent
        : null;
    if (!getOwning) return { status: 'no-dev-api', reason: PICK_NO_API_REASON };
    var context;
    try {
      context = el.__ngContext__;
    } catch (e) {
      context = undefined;
    }
    if (context === undefined)
      return { status: 'no-dev-api', reason: PICK_NO_CONTEXT_REASON };
    var walk = walkOwningComponents(el, getOwning);
    if (!walk.owning) return { status: 'no-component' };
    return {
      status: 'resolved',
      elementTag: lowerTagName(el),
      componentName: pickComponentName(walk.owning, ng),
      className: classNameFor(walk.owning),
      componentPath: walk.path,
    };
  }

  // Capture phase, registered on the global object: the overlay dispatches the pick event on the
  // picked element itself, so a page bubble-phase listener cannot swallow it first.
  function handlePick(e) {
    try {
      var target = e && e.target ? e.target : null;
      if (!target) return;
      var descriptor = pickDescriptorFor(target);
      if (descriptor) dispatch(PICKED_EVENT, descriptor);
    } catch (err) {
      /* a page event listener must never throw into the page's own loop */
    }
  }

  function dispatch(type, detail) {
    var CustomEventCtor =
      typeof globalThis.CustomEvent === 'function'
        ? globalThis.CustomEvent
        : typeof global.CustomEvent === 'function'
          ? global.CustomEvent
          : null;
    // `dispatchEvent` takes a DOM `Event`, and a bare `{ type, detail }` is not one — it has none of
    // an event's members and a DOM dispatcher refuses it. The fallback for a realm with no
    // `CustomEvent` constructor is therefore that realm's base `Event` of the requested type, with
    // the same `detail` attached, so the relay reads the same two members on either path.
    var ev = CustomEventCtor
      ? new CustomEventCtor(type, { detail: detail })
      : Object.assign(new Event(type), { detail: detail });
    if (typeof globalThis.dispatchEvent === 'function') {
      globalThis.dispatchEvent(ev);
    } else if (typeof global.dispatchEvent === 'function') {
      global.dispatchEvent(ev);
    }
  }

  function dispatchInitialRecord() {
    try {
      var nodes = enumerateComponentNodes();
      if (!nodes || !nodes.length) return;
      var check = {
        componentName: nodes[0].component,
        className: nodes[0].component,
        // Nothing here read a strategy: this record is built from the enumerated nodes alone, so
        // the honest answer is the same `null` `changeDetectionFor` gives on its unread paths.
        changeDetection: null,
        events: [],
        graph: { nodes: nodes, edges: [] },
        changedNodeIds: [],
      };
      dispatch(RECORD_EVENT, {
        cycleId: ++cycleId,
        startedAt:
          typeof globalThis.performance !== 'undefined' &&
          typeof globalThis.performance.now === 'function'
            ? globalThis.performance.now()
            : Date.now(),
        trigger: { kind: 'unknown', listenerName: null },
        zoneMode: zoneMode,
        checks: [check],
      });
    } catch (e) {
      /* never throw */
    }
  }

  function start() {
    var r = tryInstall();
    if (r === 'installed' || r === 'notsupported') return;
    var handle = globalThis.setInterval(function () {
      var r2 = tryInstall();
      if (r2 === 'installed' || r2 === 'notsupported')
        globalThis.clearInterval(handle);
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
    stopCompanionRecheck();
    lastState = null;
  }

  var api = {
    start: start,
    tryInstall: tryInstall,
    onEvent: onEvent,
    closeCycle: closeCycle,
    extractTriggerName: extractTriggerName,
    reset: reset,
    handleDiQuery: handleDiQuery,
    handlePick: handlePick,
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

  if (typeof globalThis !== 'undefined') globalThis.__ngRecorder = api;
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.addEventListener === 'function'
  ) {
    try {
      globalThis.addEventListener(DI_QUERY_EVENT, handleDiQuery);
    } catch (e) {}
    // The pick hop: registered beside the shipped listener, in the capture phase, and it writes no
    // global and no DOM — the answer leaves as one plain-data event on the same global object.
    try {
      globalThis.addEventListener(PICK_EVENT, handlePick, true);
    } catch (e) {}
  }

  // N4: error capture hooks at document_start (console.error, window.onerror,
  // unhandledrejection). Wired alongside N1/N2/N3 without changing their events.
  function captureErrorPayload(message) {
    try {
      var ng = ngObj || readNg();
      var text =
        message instanceof Error
          ? message.message || String(message)
          : String(message);
      var codeMatch = text.match(/NG0\d{3,}/);
      var code = codeMatch ? codeMatch[0] : null;
      var component = null;
      if (ng && typeof ng.getOwningComponent === 'function') {
        try {
          var el =
            typeof document !== 'undefined' && document
              ? document.activeElement ||
                document.querySelector('app-root') ||
                document.body ||
                document.documentElement
              : null;
          var instance = ng.getOwningComponent(el);
          if (instance && instance.constructor && instance.constructor.name)
            component = instance.constructor.name;
          else if (typeof instance === 'string') component = instance;
        } catch (e) {
          component = null;
        }
      }
      dispatch(ERROR_CAPTURE_EVENT, {
        code: code,
        message: text,
        component: component,
        timestamp: typeof Date !== 'undefined' ? Date.now() : 0,
      });
    } catch (e) {
      /* never throw */
    }
  }

  try {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
      var originalConsoleError = console.error;
      console.error = function () {
        try {
          captureErrorPayload(Array.prototype.slice.call(arguments).join(' '));
        } catch (e) {}
        return originalConsoleError.apply(this, arguments);
      };
    }
  } catch (e) {}

  try {
    if (
      typeof globalThis !== 'undefined' &&
      typeof globalThis.addEventListener === 'function'
    ) {
      globalThis.addEventListener('error', function (ev) {
        try {
          captureErrorPayload(
            ev && ev.error ? ev.error : ev && ev.message ? ev.message : ev,
          );
        } catch (e) {}
      });
      globalThis.addEventListener('unhandledrejection', function (ev) {
        try {
          captureErrorPayload(ev && ev.reason ? ev.reason : ev);
        } catch (e) {}
      });
    }
  } catch (e) {}

  // Auto-run when loaded as a content script.
  start();
})(typeof globalThis !== 'undefined' ? globalThis : this);
