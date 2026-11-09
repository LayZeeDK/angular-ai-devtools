// navigation-narrator.js — the join behind M041: one recorded navigation stream turned into the
// navigations it carries — the terminal each one reached and only the fields that terminal recorded,
// the stage an open one sits at and the holder no payload names, and the three absences this
// milestone must report rather than invent.
//
// T001 measured (`research/raw/m041-navigation.json`) what the router's stream actually carries, and
// every rule below is one of those measurements rather than a reading of prose:
//
//   - sixteen event classes, each with its own key set; the four terminals carry their own fields and
//     no others — `NavigationCancel` `{code, id, reason, type, url}` (code 1 measured, reason "Navigation
//     ID 2 is not equal to the current navigation id 3"), `NavigationError` `{error, id, target, type,
//     url}` with the error's own name and message (a `TypeError` from a failed dynamic import),
//     `NavigationSkipped` `{code, id, reason, type, url}` (code 0, the same-URL reason), and
//     `NavigationEnd` `{id, type, url, urlAfterRedirects}` — the only terminal that carries an end
//     route at all.
//   - `RouteConfigLoadStart` and `RouteConfigLoadEnd` carry `{route, type}` and no navigation id at
//     all. In the superseded run the abandoned navigation was cancelled at 564.2 ms, its own load end
//     arrived at 1756.3 ms — 1192.1 ms after its own cancel — and the successor's load end at
//     2071.1 ms, 314.8 ms later. The two loads are told apart by `route.path` (`claim` against
//     `contract`) and by nothing else: arrival order alone attributes the abandoned navigation's load
//     to its successor, which is what SC5 and E9 forbid.
//   - a navigation held for 2,500 ms at its lazy chunk recorded two events — `NavigationStart` then
//     `RouteConfigLoadStart` — and no terminal event, with `router.url` still `/home`. `currentNavigation()`
//     carried ten fields (abort, beforeActivateHandler, extractedUrl, extras, id, initialUrl,
//     previousNavigation, routesRecognizeHandler, targetBrowserUrl, trigger) and the two route-config
//     payloads carry `{route, type}`: no key of either names a guard, a resolver, a chunk or a task, so
//     the holder of an open navigation is cannot-tell with `no-holder-recorded` (SC3, N3, E5).
//   - `GuardsCheckEnd` adds exactly one field over `GuardsCheckStart` — `shouldActivate`, a boolean
//     aggregate of the whole check — and a refused `canMatch` is the same eleven events with the same
//     key sets as an unmatched URL: both recognise the wildcard chain `[null, "**"]`, both record
//     `shouldActivate: true`, both end `NavigationEnd`, neither records a cancel. A guard's verdict is
//     therefore cannot-tell with `guard-verdict-not-recorded`, and a wildcard match is reported as the
//     match it is and never as a refusal (SC4, N4, E6, E7).
//   - neither target declares a resolver — 0 resolve keys across 23 walked portal rows and 20 fixture
//     rows — while the portal still emits `ResolveStart`/`ResolveEnd`. A resolve stage is therefore not
//     evidence of a resolver, and it answers `no-resolver-configured` (SC4, N4, E7).
//   - a warm lazy navigation measured two route-config intervals (15.6 ms for `claim`, 37.6 ms for
//     `list`) and ended `NavigationEnd` 3.1 ms after the last load end. The interval is a measurement
//     and the terminal event is the discriminator: a navigation with a terminal is never reported open,
//     however long its load interval was (SC5, N5, E8).
//
// The record this join reads is the one `extension/agent-main.js` publishes beside the
// change-detection frame — one entry per `Router.events` emission, in arrival order, one shape for
// every class:
//
//   record.routerEvents = [ { type, at, id, url, urlAfterRedirects, route, reason, code, error,
//                             shouldActivate, matchedPaths }, … ]
//
// `type` is the event's own class name and never its number, `at` is the page's own
// `performance.now()` reading at receipt, every field the event did not carry is `null` (a start
// with no id is `id: null`, never the id of the last navigation seen), `error` is the error's own
// `{ name, message }`, and `matchedPaths` holds the primary route chain's own config paths in order
// — `[null, "contract", "", "list"]` on the measured portal frame — and is empty where the event
// carried no route-tree snapshot. Nothing else on the record is read, so a record carrying a frame,
// a cycle id or a field a later capture adds changes nothing this join reports.
//
// The answer is one object:
//
//   narrateNavigation(record) -> { state, absence, navigations, unattributed }
//
// `state` is `open` when any recorded navigation is open, `ended` when every one of them recorded a
// terminal event, and `cannot-tell` with a named absence when the record carries no navigation to
// narrate at all — an empty record answers the absence rather than a zero that reads as success.
// `absence` is the record-level absence or `null`, and `unattributed` lists an id-less load by
// `{ kind, route }`: a load start that arrived with no navigation in flight, or a load end whose own
// route names no open load. No load is ever dropped and no load is ever lent an id.
//
// `navigations` holds one entry per navigation, in the order the record opened them, each of:
//
//   { id, state, url, urlAfterRedirects, terminal, code, reason, error, stage, lastEvent, holder,
//     absence, matched, loads, guards, resolve }
//
//   id                 the navigation's own recorded id; never a position in the list
//   state              `open` or `ended`
//   url                the route it was heading for, from its own start event's `url`
//   urlAfterRedirects  the end route, and only where the terminal event carried it — a cancel or an
//                      error record therefore names no end route at all (SC1, E2)
//   terminal           the terminal class the record carries (`NavigationEnd`, `NavigationCancel`,
//                      `NavigationError` or `NavigationSkipped`), or `null` for an open navigation
//   code, reason       the terminal's own fields where that class recorded them, else `null`
//   error              the terminal's own `{ name, message }` where it recorded an error, else `null`
//   stage              one of the four stage words for an open navigation, derived from the class of
//                      its last recorded event; `null` otherwise (SC2, E3, E4)
//   lastEvent          the class of the navigation's last recorded event: its terminal when it has
//                      one, and otherwise the last event attributed to it
//   holder             `{ state: "cannot-tell", absence: "no-holder-recorded" }` for an open
//                      navigation — and nothing else, no guard, chunk, task or resolver name — and
//                      `null` for a navigation that ended (SC3, E5)
//   absence            `no-stage-recorded` when an open navigation's last event maps to no stage, and
//                      `null` otherwise: the stage is never presented as the reason it is open
//   matched            the route chain the record carried for it, as `{ path, wildcard, paths }`,
//                      where `path` is the chain's own leaf, or `null` when no event of the
//                      navigation carried a chain (SC4, E6)
//   loads              one entry per route-config load, `{ route, startedAt, endedAt, durationMs,
//                      open }`: the interval is the difference between the two recorded receipt
//                      times, a measured zero stays a measured zero, and a load with no end carries
//                      no duration at all
//   guards             `{ state: "cannot-tell", absence: "guard-verdict-not-recorded", shouldActivate }`
//                      when the navigation recorded a `GuardsCheckEnd`, and `null` otherwise: the
//                      aggregate is reported as the aggregate it is, never attributed to a guard
//   resolve            `{ state: "cannot-tell", absence: "no-resolver-configured" }` when the
//                      navigation reached the resolve stage, and `null` otherwise
//
// This module is a reader of the record it is handed and of nothing else: no imports, no DOM, no
// clock, no console, no network and no page global beyond the one namespace below, so a bare
// `node:vm` context with nothing in it is enough to run it (which the suite proves). It holds no
// state between calls, never sorts, and answers the same text for the same record twice. It also
// reads no `currentNavigation()`, no router instance and no configuration: the absences it reports
// are the ones T001 measured, and where a measurement is the authority it is named as a measurement.
(function () {
  'use strict';

  // The two states a navigation can carry, and the verdict a question no payload answers carries.
  const ENDED = 'ended';
  const OPEN = 'open';
  const CANNOT_TELL = 'cannot-tell';

  // The four stage words. A stage is where the last recorded event sits, and each word is the class
  // its own events carry: the two route-config classes, the two guard classes, the two resolve
  // classes, and the four activation classes.
  const ROUTE_CONFIG_LOAD = 'route-config-load';
  const GUARDS_CHECK = 'guards-check';
  const RESOLVE = 'resolve';
  const ACTIVATION = 'activation';

  // The absences. Published as names rather than prose, so a caller compares a constant and never a
  // sentence, and a pane renders the absence it was handed.
  const NO_HOLDER_RECORDED = 'no-holder-recorded';
  const GUARD_VERDICT_NOT_RECORDED = 'guard-verdict-not-recorded';
  const NO_RESOLVER_CONFIGURED = 'no-resolver-configured';
  const NO_STAGE_RECORDED = 'no-stage-recorded';
  const NO_NAVIGATION_RECORDED = 'no-navigation-recorded';
  const RECORD_UNREADABLE = 'record-unreadable';

  // The class names this join branches on — the record's `type`, never its number.
  const NAVIGATION_START = 'NavigationStart';
  const ROUTE_CONFIG_LOAD_START = 'RouteConfigLoadStart';
  const ROUTE_CONFIG_LOAD_END = 'RouteConfigLoadEnd';
  const GUARDS_CHECK_END = 'GuardsCheckEnd';
  const TERMINAL_CLASSES = [
    'NavigationEnd',
    'NavigationCancel',
    'NavigationError',
    'NavigationSkipped',
  ];
  const RESOLVE_CLASSES = ['ResolveStart', 'ResolveEnd'];

  // Class name to stage word, as a table rather than a chain of comparisons: a stage word exists
  // only because an event class names it, and a class the table does not hold maps to no stage at
  // all — `NavigationStart` and `RoutesRecognized` among them, so a navigation whose only recorded
  // event is its start answers the stage as absent rather than guessing one (SC2, E4).
  const STAGE_BY_CLASS = [
    [ROUTE_CONFIG_LOAD_START, ROUTE_CONFIG_LOAD],
    [ROUTE_CONFIG_LOAD_END, ROUTE_CONFIG_LOAD],
    ['GuardsCheckStart', GUARDS_CHECK],
    [GUARDS_CHECK_END, GUARDS_CHECK],
    ['ResolveStart', RESOLVE],
    ['ResolveEnd', RESOLVE],
    ['ChildActivationStart', ACTIVATION],
    ['ActivationStart', ACTIVATION],
    ['ActivationEnd', ACTIVATION],
    ['ChildActivationEnd', ACTIVATION],
  ];

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A receipt time the page measured: a finite number and nothing else. `null`, a string and a
  // `NaN` are all the same absence here, and an interval built on one would be a duration nobody
  // measured.
  function isMeasurement(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // A string that says something, or null. A blank class name names no class, so it is read as no
  // class rather than as an empty one.
  function nonEmptyText(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // The record's own list of arrivals, or null when the record is not one this join can read. A
  // record that carries no list is unread, which is not the same as a record that carries an empty
  // one: the first is an absence to name, the second is a stream with no navigation in it.
  function eventsOf(record) {
    if (!isObject(record)) return null;
    if (!Array.isArray(record.routerEvents)) return null;
    return record.routerEvents;
  }

  // An error as the page recorded it: its own name and message, and nothing else. The error object
  // never crossed the boundary, so there is nothing here to read beyond these two fields.
  function readError(value) {
    if (!isObject(value)) return null;
    const name = nonEmptyText(value.name);
    const message = typeof value.message === 'string' ? value.message : null;
    if (name === null && message === null) return null;
    return { name: name, message: message };
  }

  // The primary route chain as the page recorded it: its own config paths in order, with `null` for a
  // snapshot that carries no route configuration and `''` for a componentless route — T001 measured
  // `[null, "contract", "", "list"]` on the portal, so all three cases occur in one chain. An event
  // that carried no chain contributes an empty list, and no path is invented to fill one.
  function readPaths(value) {
    if (!Array.isArray(value)) return [];
    const paths = [];
    for (let i = 0; i < value.length; i += 1) {
      paths.push(typeof value[i] === 'string' ? value[i] : null);
    }
    return paths;
  }

  // One recorded entry, read as what it says. A field the record does not carry is null here too, so
  // nothing below has to tell "unknown" from "not applicable" — and an entry with no class name is
  // not an entry this join can place, so it contributes nothing at all.
  function readEntry(value) {
    if (!isObject(value)) return null;
    const type = nonEmptyText(value.type);
    if (type === null) return null;
    return {
      type: type,
      at: isMeasurement(value.at) ? value.at : null,
      id: isMeasurement(value.id) ? value.id : null,
      url: nonEmptyText(value.url),
      urlAfterRedirects: nonEmptyText(value.urlAfterRedirects),
      route: typeof value.route === 'string' ? value.route : null,
      reason: typeof value.reason === 'string' ? value.reason : null,
      code: isMeasurement(value.code) ? value.code : null,
      error: readError(value.error),
      shouldActivate:
        typeof value.shouldActivate === 'boolean' ? value.shouldActivate : null,
      matchedPaths: readPaths(value.matchedPaths),
    };
  }

  // A navigation the record opened, or one a terminal event opened because its start fell off the
  // front of a bounded record. Every field starts empty: a navigation says only what its own events
  // say, in the order they arrived.
  function newNavigation(id, url, at) {
    return {
      id: id,
      state: OPEN,
      url: url,
      urlAfterRedirects: null,
      terminal: null,
      code: null,
      reason: null,
      error: null,
      last: { type: NAVIGATION_START, at: at },
      matchedPaths: null,
      shouldActivate: null,
      sawGuardEnd: false,
      sawResolve: false,
      loads: [],
    };
  }

  // The last event a navigation recorded, kept as the event's own class and the page's own receipt
  // time. The time is kept because the record carries it, and the stage is never read off it: a
  // navigation with a terminal event keeps its terminal here, so a route-config load that closes
  // after the navigation completed is reported on the load and never as the navigation's stage
  // (SC5, N5, E8).
  function noteLast(navigation, entry) {
    if (navigation.state === OPEN) {
      navigation.last = { type: entry.type, at: entry.at };
    }
  }

  // What a navigation's own events carry beyond its stage: the route chain its recognition read, the
  // aggregate its guard check ended on, and whether it reached the resolve stage. None of the three is
  // a verdict, none is attributed to a named guard or resolver, and the chain is the first one the
  // record carries for the navigation — its recognition's own primary chain, which a later event's
  // suffix says nothing beyond (SC4, N4, E6, E7).
  function recordEvidence(navigation, entry) {
    if (navigation.matchedPaths === null && entry.matchedPaths.length > 0) {
      navigation.matchedPaths = entry.matchedPaths.slice();
    }
    if (entry.type === GUARDS_CHECK_END) {
      navigation.sawGuardEnd = true;
      navigation.shouldActivate = entry.shouldActivate;
    }
    if (RESOLVE_CLASSES.indexOf(entry.type) !== -1) {
      navigation.sawResolve = true;
    }
  }

  // A navigation's terminal, read off the terminal event and off nothing else. Each field is that
  // event's own: `code` and `reason` where the class recorded them, the error's own name and message
  // where it recorded one, and `urlAfterRedirects` only where the event carried it — a cancel or an
  // error therefore names no end route, and no field is filled from another event, from the
  // navigation's start or from a neighbouring navigation's terminal (SC1, N1, E1, E2).
  function endNavigation(navigation, entry) {
    navigation.state = ENDED;
    navigation.terminal = entry.type;
    navigation.urlAfterRedirects = entry.urlAfterRedirects;
    navigation.code = entry.code;
    navigation.reason = entry.reason;
    navigation.error = entry.error;
    navigation.last = { type: entry.type, at: entry.at };
  }

  // The stage an open navigation sits at, from the class of its last recorded event — a table lookup
  // and nothing else. A last event the table does not hold answers no stage, and no stage word is
  // ever produced that an event in the record did not name (SC2, E4).
  function stageOf(last) {
    for (let i = 0; i < STAGE_BY_CLASS.length; i += 1) {
      if (STAGE_BY_CLASS[i][0] === last.type) return STAGE_BY_CLASS[i][1];
    }
    return null;
  }

  // A wildcard route's own path: `**`, or a wildcard that closes a prefixed path.
  function isWildcardPath(path) {
    return path === '**' || (path !== null && path.slice(-3) === '/**');
  }

  // The route chain the record carried for one navigation, and the leaf it ends on. Where the chain
  // holds the wildcard route the answer names that wildcard match, because a refused `canMatch`
  // reaches the same chain and the stream cannot tell the two apart: the answer never calls it a
  // refusal (SC4, N4, E6).
  function matchedAnswer(navigation) {
    if (navigation.matchedPaths === null) return null;
    const paths = navigation.matchedPaths.slice();
    let wildcard = false;
    for (let i = 0; i < paths.length; i += 1) {
      if (isWildcardPath(paths[i])) wildcard = true;
    }
    return {
      path: paths.length === 0 ? null : paths[paths.length - 1],
      wildcard: wildcard,
      paths: paths,
    };
  }

  // An open navigation's holder: cannot-tell with the one absence the page measured, and no name of
  // any kind — no guard, no resolver, no chunk, no task, and no borrowed word as a fallback (SC3,
  // N3, E5).
  function holderAnswer() {
    return { state: CANNOT_TELL, absence: NO_HOLDER_RECORDED };
  }

  // A guard's verdict: cannot-tell with the one absence the page measured, and the aggregate the
  // guard-end event carried reported as the aggregate it is. No guard is named, because the stream
  // names none (SC4, N4, E7).
  function guardAnswer(navigation) {
    if (!navigation.sawGuardEnd) return null;
    return {
      state: CANNOT_TELL,
      absence: GUARD_VERDICT_NOT_RECORDED,
      shouldActivate: navigation.shouldActivate,
    };
  }

  // A resolve stage: cannot-tell with `no-resolver-configured`, because neither target declares a
  // resolver and the stage runs anyway. Nothing here is inferred from the resolve class (SC4, N4, E7).
  function resolveAnswer(navigation) {
    if (!navigation.sawResolve) return null;
    return { state: CANNOT_TELL, absence: NO_RESOLVER_CONFIGURED };
  }

  // One route-config load, reported as its own numbers: no id, no cause and no borrowed time. A load
  // the record never closed carries no end and no duration at all, not a zero and not the next
  // event's receipt time.
  function loadAnswer(load) {
    return {
      route: load.route,
      startedAt: load.startedAt,
      endedAt: load.endedAt,
      durationMs: load.durationMs,
      open: load.open,
    };
  }

  // One navigation's answer, read off what the record says about it. An open navigation names its
  // stage and the absence of a holder and no reason; a navigation with a terminal names that terminal
  // and its own fields and nothing that could be read as a cause (SC1, SC2, SC3).
  function navigationAnswer(navigation) {
    const open = navigation.state === OPEN;
    const stage = open ? stageOf(navigation.last) : null;
    return {
      id: navigation.id,
      state: navigation.state,
      url: navigation.url,
      urlAfterRedirects: navigation.urlAfterRedirects,
      terminal: navigation.terminal,
      code: navigation.code,
      reason: navigation.reason,
      error: navigation.error,
      stage: stage,
      lastEvent: navigation.last === null ? null : navigation.last.type,
      holder: open ? holderAnswer() : null,
      absence: open && stage === null ? NO_STAGE_RECORDED : null,
      matched: matchedAnswer(navigation),
      loads: navigation.loads.map(loadAnswer),
      guards: guardAnswer(navigation),
      resolve: resolveAnswer(navigation),
    };
  }

  function answer(state, absence, navigations, unattributed) {
    return {
      state: state,
      absence: absence,
      navigations: navigations,
      unattributed: unattributed,
    };
  }

  // The join. `record` is what the page agent publishes; its `routerEvents` list is walked once, in
  // arrival order, and nothing else on the record is read.
  function narrateNavigation(record) {
    const events = eventsOf(record);
    if (events === null) {
      return answer(CANNOT_TELL, RECORD_UNREADABLE, [], []);
    }

    const navigations = [];
    const byId = new Map();
    // Every load still open, in the order its own start arrived, with the navigation it belongs to.
    const openLoads = [];
    const unattributed = [];
    // The navigation whose events are on the wire: it is set by a start and cleared by that
    // navigation's own terminal, so an id-less stage event and a route-config load start are
    // attributed to the navigation that was in flight when they arrived and never to a later one.
    let inFlight = null;

    for (let i = 0; i < events.length; i += 1) {
      const entry = readEntry(events[i]);
      if (entry === null) continue; // an entry with no class name is not placed anywhere
      const type = entry.type;

      if (type === NAVIGATION_START) {
        // A navigation opens at the event whose own payload carries its id and whose class is a
        // start. It is identified by that id and never by its position: a start with no id opens
        // nothing, and a second start for an id already recorded is not a second navigation (E3).
        if (!isMeasurement(entry.id) || byId.has(entry.id)) continue;
        const navigation = newNavigation(entry.id, entry.url, entry.at);
        byId.set(entry.id, navigation);
        navigations.push(navigation);
        inFlight = navigation;
        continue;
      }

      if (TERMINAL_CLASSES.indexOf(type) !== -1) {
        // A navigation is ended at its first terminal event, and that event is what the answer
        // reports. A terminal whose start the record does not carry is still that navigation's own
        // terminal: it is keyed by its own id and its route is the `url` the terminal itself
        // recorded, so nothing is borrowed from a neighbour (SC1, N1).
        if (!isMeasurement(entry.id)) continue;
        let navigation = byId.get(entry.id);
        if (!navigation) {
          navigation = newNavigation(entry.id, entry.url, entry.at);
          byId.set(entry.id, navigation);
          navigations.push(navigation);
        }
        if (navigation.state === OPEN) {
          endNavigation(navigation, entry);
          if (inFlight === navigation) inFlight = null;
        }
        continue;
      }

      if (type === ROUTE_CONFIG_LOAD_START) {
        // A route-config load start carries `route` and `type` and no id at all (SC5, E9). It opens a
        // load on the navigation in flight when it arrived, and the load keeps the route its own
        // start named — which is the only thing that will pair it with its own end.
        const navigation = inFlight;
        if (navigation === null) {
          unattributed.push({ kind: type, route: entry.route });
          continue;
        }
        const load = {
          route: entry.route,
          startedAt: entry.at,
          endedAt: null,
          durationMs: null,
          open: true,
        };
        navigation.loads.push(load);
        openLoads.push({
          route: entry.route,
          load: load,
          navigation: navigation,
        });
        noteLast(navigation, entry);
        continue;
      }

      if (type === ROUTE_CONFIG_LOAD_END) {
        // A load end is attributed by the `route` path its own payload names, and never by arrival
        // order: the abandoned navigation's load end arrives 1192.1 ms after its own cancel and
        // 314.8 ms before its successor's, so pairing by arrival would hand it to the successor (SC5,
        // E9). The end closes the load its own start opened, on the navigation that start belonged to.
        const slot = claimLoad(openLoads, entry.route);
        if (slot === null) {
          unattributed.push({ kind: type, route: entry.route });
          continue;
        }
        closeLoad(slot, entry.at);
        noteLast(slot.navigation, entry);
        continue;
      }

      // Every other class is a stage event: it is attributed by its own recorded id where the class
      // carries one, and by the navigation in flight where it carries none — T001 measured the four
      // activation classes as `{snapshot, type}`, so an id-less stage event has no id to be
      // attributed by and no other navigation is on the wire when it arrives (SC2, E4).
      const navigation = isMeasurement(entry.id)
        ? byId.get(entry.id)
        : inFlight;
      if (!navigation) continue;
      noteLast(navigation, entry);
      recordEvidence(navigation, entry);
    }

    // A record carrying no navigation answers the absence rather than zero navigations, because a
    // zero reads as a stream with nothing wrong in it (SC2, E3).
    if (navigations.length === 0) {
      return answer(CANNOT_TELL, NO_NAVIGATION_RECORDED, [], unattributed);
    }

    const answers = [];
    let anyOpen = false;
    for (let i = 0; i < navigations.length; i += 1) {
      answers.push(navigationAnswer(navigations[i]));
      if (navigations[i].state === OPEN) anyOpen = true;
    }
    return answer(anyOpen ? OPEN : ENDED, null, answers, unattributed);
  }

  // The open load an end closes: the oldest load whose own `route` path is the one the end names, and
  // nothing else — never the newest, never whichever load happens to be open, and never the one the
  // navigation in flight owns (SC5, E9).
  function claimLoad(openLoads, route) {
    if (typeof route !== 'string') return null;
    for (let i = 0; i < openLoads.length; i += 1) {
      if (openLoads[i].load.open && openLoads[i].route === route) {
        return openLoads[i];
      }
    }
    return null;
  }

  // A load two recorded receipt times measured. A difference of `0` is a measured zero and stays a
  // number — it is never read as falsy and replaced by a missing cost (SC5, E8).
  function closeLoad(slot, at) {
    const load = slot.load;
    load.endedAt = at;
    load.open = false;
    load.durationMs =
      isMeasurement(load.startedAt) && isMeasurement(at)
        ? at - load.startedAt
        : null;
  }

  const namespace = {
    narrateNavigation: narrateNavigation,
    ENDED: ENDED,
    OPEN: OPEN,
    CANNOT_TELL: CANNOT_TELL,
    ROUTE_CONFIG_LOAD: ROUTE_CONFIG_LOAD,
    GUARDS_CHECK: GUARDS_CHECK,
    RESOLVE: RESOLVE,
    ACTIVATION: ACTIVATION,
    NO_HOLDER_RECORDED: NO_HOLDER_RECORDED,
    GUARD_VERDICT_NOT_RECORDED: GUARD_VERDICT_NOT_RECORDED,
    NO_RESOLVER_CONFIGURED: NO_RESOLVER_CONFIGURED,
    NO_STAGE_RECORDED: NO_STAGE_RECORDED,
    NO_NAVIGATION_RECORDED: NO_NAVIGATION_RECORDED,
    RECORD_UNREADABLE: RECORD_UNREADABLE,
  };

  if (globalThis.angularAiNavigationNarrator) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiNavigationNarrator, namespace);
  } else {
    globalThis.angularAiNavigationNarrator = namespace;
  }
})();
