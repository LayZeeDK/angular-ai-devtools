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
  // the 22.x surface this extension targets. The five paired work events T001 measured
  // (research/raw/m040-work-events.json) sit here in value order beside the output pair the
  // recorder already tracked. The fourteen values this milestone does not read are still
  // dropped, which is what `onEvent`'s record branch states by omission.
  var ProfilerEvent = {
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
      recordWorkEvent(event, instance);
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

  // --- The twelve recorded values, in one frame-level list (T002) -----------------------------
  //
  // T001 measured what each pair's two emission sites carry (`research/raw/m040-work-events.json`):
  // `TemplateUpdate`, `LifecycleHook` and `HostBindingsUpdate` pass an instance at both ends,
  // `Component` passes one at its end only — every `ComponentStart` measured `null` — and
  // `ChangeDetection` passes none at all. This list states what arrived and nothing more: an event
  // the profiler passed no instance for is recorded with `componentName: null`, never with a name
  // read from a node index, a list position, a neighbour or the `'component'` fallback
  // `componentNameFor` answers. That absence is what lets a narrator answer cannot-tell honestly.
  //
  // Every recorded value travels one entry shape — `{ type, pair, end, at, componentName }` — and
  // the pair and the end bit travel with the entry, so a surface reads fields and never compares an
  // event number. `at` is the page's own `performance.now()` reading at receipt, so a start and its
  // matching end differ by a duration the page measured rather than one a panel reconstructs from
  // emission order.
  //
  // The frame boundary is the microtask `closeCycle` runs in, not the template update that opens it:
  // an event that arrives before the frame's opener is held here and adopted by the frame the same
  // task opens later. T001 measured that case — `ChangeDetection`'s start arrived with no frame open
  // 3/3 on both pages and preceded the opener, `Component`'s outermost start 3 of 6 times on `/`,
  // and `OutputStart`/`OutputEnd` arrived with no frame open at all — so the held list crosses a task
  // boundary. Nothing here pairs a start with its end: the pairing rule belongs to the narrator that
  // reads this record, and this file keeps both arrivals.
  var pendingWorkEvents = []; // entries recorded before the frame's opener: { type, pair, ... }
  var PENDING_WORK_EVENT_LIMIT = 64; // one frame's worth; a page that never ticks holds no record

  // The one table that maps a value to its pair and end bit. It is data, not a branch: the group of
  // six pairs is the whole vocabulary this record speaks, so a reader never needs the number.
  var WORK_EVENT_PAIRS = [
    {
      pair: 'TemplateUpdate',
      start: ProfilerEvent.TemplateUpdateStart,
      end: ProfilerEvent.TemplateUpdateEnd,
    },
    {
      pair: 'LifecycleHook',
      start: ProfilerEvent.LifecycleHookStart,
      end: ProfilerEvent.LifecycleHookEnd,
    },
    {
      pair: 'Output',
      start: ProfilerEvent.OutputStart,
      end: ProfilerEvent.OutputEnd,
    },
    {
      pair: 'ChangeDetection',
      start: ProfilerEvent.ChangeDetectionStart,
      end: ProfilerEvent.ChangeDetectionEnd,
    },
    {
      pair: 'Component',
      start: ProfilerEvent.ComponentStart,
      end: ProfilerEvent.ComponentEnd,
    },
    {
      pair: 'HostBindingsUpdate',
      start: ProfilerEvent.HostBindingsUpdateStart,
      end: ProfilerEvent.HostBindingsUpdateEnd,
    },
  ];

  // value -> { pair, end }, built once at load from the table above.
  var WORK_EVENT_KINDS = indexWorkEvents();

  function indexWorkEvents() {
    var kinds = {};
    for (var i = 0; i < WORK_EVENT_PAIRS.length; i++) {
      var named = WORK_EVENT_PAIRS[i];
      kinds[named.start] = { pair: named.pair, end: false };
      kinds[named.end] = { pair: named.pair, end: true };
    }
    return kinds;
  }

  // One entry per recorded value, in emission order. The entry is built from the table and the
  // measurement alone: no value is named here, so no branch decides what an entry carries.
  function recordWorkEvent(event, instance) {
    var kind = WORK_EVENT_KINDS[event];
    if (!kind) return null; // one of the fourteen values this milestone does not read
    var entry = {
      type: event,
      pair: kind.pair,
      end: kind.end,
      at: nowMs(),
      componentName: instanceNameFor(instance),
    };
    if (cycle) cycle.events.push(entry);
    else holdPendingWorkEvent(entry);
    return entry;
  }

  function holdPendingWorkEvent(entry) {
    pendingWorkEvents.push(entry);
    // Bounded: a frame is one task's worth of work, so a page that emits work events and never
    // opens a frame keeps at most the most recent bound rather than growing without limit.
    if (pendingWorkEvents.length > PENDING_WORK_EVENT_LIMIT) {
      pendingWorkEvents.splice(
        0,
        pendingWorkEvents.length - PENDING_WORK_EVENT_LIMIT,
      );
    }
  }

  // The frame the task opens takes the events held before its opener, in arrival order.
  function adoptPendingWorkEvents() {
    var adopted = pendingWorkEvents;
    pendingWorkEvents = [];
    return adopted;
  }

  // The page's own clock, read at receipt. One reader, so the record's `at` and the cycle's
  // `startedAt` are the same measurement on the same scale.
  function nowMs() {
    if (
      typeof globalThis.performance !== 'undefined' &&
      typeof globalThis.performance.now === 'function'
    ) {
      return globalThis.performance.now();
    }
    return Date.now();
  }

  function openCycle() {
    cycle = {
      cycleId: ++cycleId,
      startedAt: nowMs(),
      trigger: pendingTrigger || { kind: 'unknown', listenerName: null },
      checks: new Map(),
      events: adoptPendingWorkEvents(),
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
    return hostOrClassName(instance) || 'component';
  }

  // The name an instance yields — its host tag lowercased, then its constructor name lowercased —
  // or `null` when it yields neither. The one reading both the shipped per-check name and the
  // frame-level entry use; `componentNameFor` adds the `'component'` fallback, and the entry
  // deliberately does not (an event that named nothing is recorded as naming nothing).
  function hostOrClassName(instance) {
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
    var cls = classNameFor(instance);
    return cls ? cls.toLowerCase() : null;
  }

  // The identity the profiler passed, or `null` when it passed none. Nothing is derived: a null
  // instance is recorded as no component, and an instance that yields no name is recorded the same
  // way rather than borrowing a fallback word, a neighbour or a list position (AC3).
  function instanceNameFor(instance) {
    if (instance === null || typeof instance === 'undefined') return null;
    return hostOrClassName(instance);
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

  // The map's key is tested, not its write wrapped: a `WeakMap` takes an object identity and no
  // other, and the profiler hands a block view's context as `null` or `undefined` at the five sites
  // T001 measured, so it gets no entry — no epoch delta, not an empty one. `get` never throws; `set` does.
  function diffEpochs(instance, graph) {
    var keyed =
      (typeof instance === 'object' && instance !== null) ||
      typeof instance === 'function';
    var prev = keyed ? prevEpochs.get(instance) : null;
    var changed = [];
    var next = new Map();
    for (var i = 0; graph && graph.nodes && i < graph.nodes.length; i++) {
      var n = graph.nodes[i];
      if (prev && prev.get(n.id) !== n.epoch) changed.push(String(n.id));
      next.set(n.id, n.epoch);
    }
    if (!keyed) return changed;
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
      // The frame's own work, in arrival order: the four existing fields are untouched and this
      // list is the additive half (the per-check `events` below keeps the four bare numbers).
      events: c.events.slice(),
      // The router's own arrivals, in arrival order, as their own field: a stream is not frame-scoped,
      // so the list is what has arrived and not what this frame saw (T002).
      routerEvents: routerEventList(),
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
        startedAt: nowMs(),
        trigger: { kind: 'unknown', listenerName: null },
        zoneMode: zoneMode,
        // The snapshot carries the same list a frame carries, empty: this record read no profiler
        // event, and a record that omitted the field would make a reader guess at its shape.
        events: [],
        // The router's list is not frame-scoped, so the snapshot carries what has already arrived —
        // a reader attached after the fact is exactly who the replay is for.
        routerEvents: routerEventList(),
        checks: [check],
      });
    } catch (e) {
      /* never throw */
    }
  }

  // --- The router's own stream, beside the profiler subscription (T002) ------------------------
  //
  // T001 measured the stream this block records (`research/raw/m041-navigation.json`): sixteen event
  // classes, each with its own key set; the `Router` reachable from the agent's own read —
  // `getInjector` on the host element, then `ɵgetInjectorResolutionPath`, then the provider record
  // whose `token` names it — at resolution path entry 2 on the measured page (`Environment Injector`,
  // 90 provider records), never entry 0 (the element injector, 6 records); and the two route-config
  // classes carrying no navigation id at all.
  //
  // One entry per emission, in arrival order, built from the event alone, one shape for every class:
  // `{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate,
  // matchedPaths }`. `type` is the class name the runtime reports and never the event number, so no
  // surface branches on a number; every field the event did not carry is `null` and is never filled in
  // from the last navigation seen or from the navigation in flight (SC5); and nothing else crosses the
  // boundary — a routed snapshot contributes its own route-config path strings, an error its own name
  // and message.
  //
  // The subscription is created beside the profiler tap and never inside it: the tap answers once and
  // this reads the page's own injector beside that answer, `reset` removes both, and the profiler is
  // never cleared with `null`, which would take every callback with it, this agent's included.
  var ROUTER_TOKEN_NAME = 'Router';
  var ROUTER_EVENT_LIMIT = 512; // arrivals kept: a page-health guard, not a curation
  var ROUTER_CHAIN_LIMIT = 32; // route-config paths read from one snapshot
  var ROUTER_HOST_SCAN_LIMIT = 64; // elements read once, for the dev-context presence test
  var routerEvents = []; // one entry per Router.events emission, in arrival order
  var routerSubscription = null; // the stream's own subscription, removed by reset()

  // `true` when the event object itself carries the field, whatever its value. This is the one test
  // that decides whether an entry records a value: an absent field is never read from anywhere else.
  function routerCarries(event, field) {
    if (event === null || typeof event !== 'object') return false;
    return Object.prototype.hasOwnProperty.call(event, field);
  }

  // The field's own value, or `null` where the event carries none. An own field whose value is
  // `undefined` is recorded as `null` too, because the boundary is serialized and `undefined` does not
  // cross it — a reader never has to tell "unknown" from "not applicable".
  function routerFieldOf(event, field) {
    if (!routerCarries(event, field)) return null;
    var value;
    try {
      value = event[field];
    } catch (e) {
      return null;
    }
    return typeof value === 'undefined' ? null : value;
  }

  // A field that crosses the boundary as it stands, or `null`. Numbers, strings and booleans only, so
  // no instance, element, function or URL tree is ever recorded as a field value.
  function routerPrimitiveOf(event, field) {
    var value = routerFieldOf(event, field);
    var kind = typeof value;
    if (kind === 'string' || kind === 'number' || kind === 'boolean')
      return value;
    return null;
  }

  // The class name the runtime reports for the event, never its number: a surface reads the name and
  // has to know no event number to read one (AC5). An event whose class the runtime cannot name is
  // recorded as naming none.
  function routerClassNameOf(event) {
    var name = null;
    try {
      name =
        event && event.constructor && typeof event.constructor.name === 'string'
          ? event.constructor.name
          : null;
    } catch (e) {
      name = null;
    }
    return name && name.length ? name : null;
  }

  // The route a route-config event names, as the plain path string its own payload carries: the `Route`
  // object is a function-bearing instance and cannot cross the boundary (AC4). T001 attributed a late
  // load end by exactly this field, so it is the one the record keeps.
  function routerRoutePathOf(event) {
    var route = routerFieldOf(event, 'route');
    if (route === null || typeof route !== 'object') return null;
    var path;
    try {
      path = route.path;
    } catch (e) {
      return null;
    }
    return typeof path === 'string' ? path : null;
  }

  // The route-tree snapshot an event carried: a router state snapshot answers its own `root`, and an
  // activation event carries the activated snapshot itself. Anything else carries none, and a payload
  // this read cannot follow is no snapshot rather than an error.
  function routerSnapshotOf(event) {
    var state = routerFieldOf(event, 'state');
    if (state !== null && typeof state === 'object') {
      var root;
      try {
        root = state.root;
      } catch (e) {
        root = null;
      }
      if (root) return root;
    }
    var snapshot = routerFieldOf(event, 'snapshot');
    return snapshot !== null && typeof snapshot === 'object' ? snapshot : null;
  }

  // One config path from one snapshot: the route's own `path`, `''` for a componentless route and
  // `null` where the snapshot carries no route configuration at all. T001 measured the portal's
  // primary chain as `[null, "contract", "", "list"]`, so all three cases occur in one chain.
  function routerSnapshotPathOf(snapshot) {
    var config;
    try {
      config = snapshot.routeConfig;
    } catch (e) {
      return null;
    }
    if (!config || typeof config !== 'object') return null;
    var path;
    try {
      path = config.path;
    } catch (e) {
      return null;
    }
    return typeof path === 'string' ? path : null;
  }

  // The primary chain's own config paths, in order, and nothing else: no snapshot object, no URL tree
  // and no component reference crosses the boundary. An event with no route-tree snapshot contributes
  // an empty list rather than a guess.
  function routerMatchedPathsOf(event) {
    var paths = [];
    var node = routerSnapshotOf(event);
    var depth = 0;
    while (node && depth < ROUTER_CHAIN_LIMIT) {
      paths.push(routerSnapshotPathOf(node));
      var child = null;
      try {
        child = node.firstChild;
      } catch (e) {
        child = null;
      }
      node = child || null;
      depth += 1;
    }
    return paths;
  }

  // An error contributes its own name and message only: the error object itself does not cross the
  // boundary. A `NavigationError`'s `target` field has no counterpart in the entry at all, so nothing
  // can record a `null` for the value T001 measured as `undefined`: the absence is the absent field.
  function routerErrorOf(event) {
    var error = routerFieldOf(event, 'error');
    if (error === null) return null;
    var name = null;
    var message = null;
    if (typeof error === 'string') {
      message = error;
    } else if (typeof error === 'object') {
      try {
        if (typeof error.name === 'string' && error.name.length)
          name = error.name;
        else if (
          error.constructor &&
          typeof error.constructor.name === 'string' &&
          error.constructor.name.length
        )
          name = error.constructor.name;
      } catch (e) {
        name = null;
      }
      try {
        if (typeof error.message === 'string') message = error.message;
      } catch (e) {
        message = null;
      }
    }
    if (name === null && message === null) return null;
    return { name: name, message: message };
  }

  // One entry per emission, in arrival order, one shape for every class. The entry is built from the
  // event alone: no field is read from the last event seen, from the navigation in flight or from a
  // previous entry, which is what keeps the two id-less route-config events id-less (SC5). The
  // builder names no class and compares no number, so no branch decides what an entry carries.
  function recordRouterEvent(event) {
    var entry = {
      type: routerClassNameOf(event),
      at: nowMs(),
      id: routerPrimitiveOf(event, 'id'),
      url: routerPrimitiveOf(event, 'url'),
      urlAfterRedirects: routerPrimitiveOf(event, 'urlAfterRedirects'),
      route: routerRoutePathOf(event),
      reason: routerPrimitiveOf(event, 'reason'),
      code: routerPrimitiveOf(event, 'code'),
      error: routerErrorOf(event),
      shouldActivate: routerPrimitiveOf(event, 'shouldActivate'),
      matchedPaths: routerMatchedPathsOf(event),
    };
    routerEvents.push(entry);
    // Bounded as a page-health guard, not as a curation: below the bound nothing is dropped,
    // coalesced or reordered, and above it the oldest arrivals fall off the front so the newest — the
    // ones a reader is looking at — stay whole. The pairing rule belongs to the join that reads this.
    if (routerEvents.length > ROUTER_EVENT_LIMIT) {
      routerEvents.splice(0, routerEvents.length - ROUTER_EVENT_LIMIT);
    }
    return entry;
  }

  // The one subscriber. It records and nothing else: a held navigation is therefore whatever arrived,
  // with no terminal synthesised for it, and a late arrival keeps its own place in arrival order.
  function onRouterEvent(event) {
    try {
      recordRouterEvent(event);
    } catch (e) {
      /* never throw into the router's own stream */
    }
  }

  // The list as the record publishes it: a copy, so a reader can hold it without mutating the
  // recorder's own and the next record still answers what arrived.
  function routerEventList() {
    return routerEvents.slice();
  }

  // The name a provider record's `token` yields. `record.provider.provide` is deliberately not read:
  // T001 measured 33 of the entry's 90 `provide` names and `Router` is not among them.
  function routerTokenNameOf(token) {
    if (token === null || typeof token === 'undefined') return null;
    try {
      if (typeof token === 'string') return token;
      if (typeof token.name === 'string' && token.name.length)
        return token.name;
      if (typeof token.toString === 'function') return String(token);
    } catch (e) {
      return null;
    }
    return null;
  }

  // The candidate host elements, in the order the rest of this file prefers them. The last resort is
  // the first element in the document that carries a dev context, because `getInjector` answers only on
  // a node that carries one and an app's root component is not always called `app-root` (T001's portal
  // root is `ng-journal-root`). The scan is bounded and is the same presence test the picker reads.
  function routerHostCandidates() {
    var candidates = [];
    var push = function (element) {
      if (element && candidates.indexOf(element) === -1)
        candidates.push(element);
    };
    if (typeof document === 'undefined' || !document) return candidates;
    try {
      if (typeof document.querySelector === 'function')
        push(document.querySelector('app-root'));
    } catch (e) {}
    try {
      push(document.body);
    } catch (e) {}
    try {
      push(document.documentElement);
    } catch (e) {}
    var elements = null;
    try {
      elements =
        typeof document.querySelectorAll === 'function'
          ? document.querySelectorAll('*')
          : null;
    } catch (e) {
      elements = null;
    }
    var limit =
      elements && elements.length
        ? Math.min(elements.length, ROUTER_HOST_SCAN_LIMIT)
        : 0;
    for (var i = 0; i < limit; i++) {
      if (routerCarriesDevContext(elements[i])) {
        push(elements[i]);
        break;
      }
    }
    return candidates;
  }

  // The dev-context presence test the picker reads, on the same untyped element: `__ngContext__` is the
  // page's own private field and is not on the DOM type, so it is read as a presence test and never
  // serialized. A getter that throws answers "no context here" instead of stopping the scan.
  function routerCarriesDevContext(node) {
    var context;
    try {
      context = node.__ngContext__;
    } catch (e) {
      return false;
    }
    return typeof context !== 'undefined';
  }

  // The token the app's own provider record gives the `Router`, read from one host element's injector
  // resolution path. Every entry is walked — the element injector is entry 0 on the measured page and
  // holds 6 records, and the app's environment injector is not the first entry — and the token is taken
  // from `record.token`, the field T001 measured as the one that finds it.
  function routerTokenFrom(element, getInjector, getPath, getProviders) {
    var injector = null;
    try {
      injector = getInjector(element);
    } catch (e) {
      injector = null;
    }
    if (!injector) return null;
    var entries = [];
    try {
      entries = getPath(injector) || [];
    } catch (e) {
      entries = [];
    }
    if (!isArrayValue(entries) || !entries.length) entries = [injector];
    for (var i = 0; i < entries.length; i++) {
      var records = null;
      try {
        records = getProviders(entries[i]);
      } catch (e) {
        records = null;
      }
      if (!isArrayValue(records)) continue;
      for (var j = 0; j < records.length; j++) {
        var token = null;
        try {
          token = records[j] ? records[j].token : null;
        } catch (e) {
          token = null;
        }
        if (routerTokenNameOf(token) !== ROUTER_TOKEN_NAME) continue;
        return { injector: entries[i], token: token };
      }
    }
    return null;
  }

  // The router instance and its stream, reached from the page's own debug API and no new tap. Every ɵ
  // function is feature-detected and every call guarded, so a page without this read subscribes to
  // nothing rather than throwing into its own bootstrap.
  function routerSubscribe() {
    var ng = ngObj || readNg();
    if (!ng) return null;
    var getInjector =
      typeof ng.getInjector === 'function'
        ? ng.getInjector
        : typeof ng.ɵgetInjectorFromNode === 'function'
          ? ng.ɵgetInjectorFromNode
          : null;
    var getPath =
      typeof ng.ɵgetInjectorResolutionPath === 'function'
        ? ng.ɵgetInjectorResolutionPath
        : null;
    var getProviders =
      typeof ng.ɵgetInjectorProviders === 'function'
        ? ng.ɵgetInjectorProviders
        : null;
    if (!getInjector || !getPath || !getProviders) return null;
    var candidates = routerHostCandidates();
    for (var i = 0; i < candidates.length; i++) {
      var found = routerTokenFrom(
        candidates[i],
        getInjector,
        getPath,
        getProviders,
      );
      if (!found) continue;
      var router = null;
      try {
        router = found.injector.get(found.token);
      } catch (e) {
        router = null;
      }
      if (!router) return null;
      var stream = null;
      try {
        stream = router.events;
      } catch (e) {
        stream = null;
      }
      if (!stream || typeof stream.subscribe !== 'function') return null;
      var subscription = null;
      try {
        subscription = stream.subscribe(onRouterEvent);
      } catch (e) {
        return null;
      }
      return subscription || null;
    }
    return null;
  }

  // Armed from the install path's own answer and never from inside the profiler callback: the tap
  // answered `installed` once, this reads the page's own injector beside it, and a second arm returns
  // the first subscription instead of adding a second one.
  function installRouterEvents() {
    if (routerSubscription || !installed) return routerSubscription;
    var subscription = routerSubscribe();
    if (subscription) routerSubscription = subscription;
    return routerSubscription;
  }

  // Removed by the same reset path as the profiler subscription, so a second install starts from an
  // empty stream rather than from one this page's earlier subscription is still writing to.
  function uninstallRouterEvents() {
    var subscription = routerSubscription;
    routerSubscription = null;
    if (!subscription) return;
    try {
      if (typeof subscription.unsubscribe === 'function')
        subscription.unsubscribe();
    } catch (e) {}
  }

  function start() {
    var r = tryInstall();
    installRouterEvents();
    if (r === 'installed' || r === 'notsupported') return;
    var handle = globalThis.setInterval(function () {
      var r2 = tryInstall();
      installRouterEvents();
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
    pendingWorkEvents = [];
    prevEpochs = new WeakMap();
    stopCompanionRecheck();
    lastState = null;
    // The router subscription is removed here, beside the profiler's own removal, and its list with it:
    // the profiler is never cleared with `null`, which would remove every callback on the page.
    uninstallRouterEvents();
    routerEvents = [];
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
