// tutor-routing.js — the pure join behind M058's tutor surface: one routing question answered from
// the two records the agent already keeps, the terminal event the recorded navigation stream carries
// for the navigation asked about named by its class and its own `id`, the router config's own entry
// named by its own `path`, and the two members no record on disk carries stated as their own named
// absences rather than inferred.
//
// The inputs are the two records, and nothing else (SC6, N6):
//
//   the navigation  the recorded navigation stream, as `research/raw/m041-navigation.json` records
//     record        it: the frames and events for the navigation asked about, each event carrying
//                   the `class` the installed router emitted and the `payload` it emitted, with the
//                   event's `keys` list beside them. `extension/agent-main.js:1826` subscribes to
//                   `router.events` and that subscription is the whole of the stream half; the
//                   record also states where it is written — a `path` — because every claim this
//                   module renders carries the artefact path that states it, and a pure join may
//                   not read a record's own bytes (SC1). `id` is the navigation asked about and
//                   `question` is the frame's own question, verbatim.
//   the config      the recorded router config, as `research/raw/m030-router-config.json` records it:
//     record        `{ path, config: [{ path, component, redirectTo, canActivate, loadChildren }] }`
//                   — an array of rows, each carrying only the fields its entry states (C2). The
//                   half arrives through the `Router` token the agent's own injector walk already
//                   resolves (`extension/agent-main.js:1750-1839`, `reach.readFrom`), so no new tap
//                   and no second read is asked of the page.
//
// Anything else on `records` — an address bar, `router.url`, `currentNavigation()`, a clock, a
// cause, a `navResolved` flag — is ignored, so a caller cannot smuggle a page value or a verdict into
// the answer (C3, N2, N5). The same holds inside each record: an event is read for its `class` and
// its `payload` and nothing else, so its arrival time `t`, its numeric `type` and its `keys` list
// decide nothing here.
//
// The answer is one object with eight fields, every one present in every state:
//
//   { state, question, terminal, route, absences, unconfigured, claims, detail }
//
//   state         answered    the stream recorded a terminal event for the `id` asked about, and the
//                             answer renders what that event and the config entry state.
//                 cannot-tell the stream recorded no terminal for the `id` asked about — or one of
//                             the two records states no artefact path, so no claim could carry the
//                             artefact that states it. The answer names the last event class the
//                             stream recorded for that `id` and nothing else: no destination, no
//                             route node, no cause, never a landed route (SC2, E2, N2).
//   question      the frame's own `question`, verbatim, or the empty string where the record states
//                 none. Never composed and never paraphrased, echoed into every state.
//   terminal      on `answered`, `{ class, …that class's own fields }` and on `cannot-tell` `null`.
//                 The class is read from the terminal event, never from whether the navigation is
//                 thought to have succeeded, and only that class's own fields are rendered: `id`,
//                 `type`, `url` and `urlAfterRedirects` on `NavigationEnd` — the four keys the
//                 recording declares for it, `type` included, since `type` is a field each class
//                 carries and the class is named by `class`, not by that number — `code`, `id`,
//                 `reason`, `type` and `url` on `NavigationCancel` and `NavigationSkipped`; `error`,
//                 `id`, `target`, `type` and `url` on `NavigationError` (C3, E1). The class key sets
//                 are `research/raw/m058-record-shapes.json` `fieldMap.stream.terminals`.
//   route         on `answered`, the config entry the navigation's own address names, by that
//                 entry's own `path` and by the `component`, `redirectTo`, `canActivate` or
//                 `loadChildren` that entry states — and by no field it does not state. Where no
//                 configured row matches, `null`, and the segments are named in `unconfigured`. The
//                 entry is found from the terminal event's own `url` and never from
//                 `urlAfterRedirects`: a redirect-shaped navigation names the entry it was made to,
//                 and the entry that entry redirects to is the final url, not the route node this
//                 answer is asked for (SC1, SC3, E3). A `redirectTo` renders as the configuration
//                 fact it is and never as the redirect that decided the navigation; a
//                 `canActivate` name renders as configuration and never as a verdict.
//   absences      on `answered`, the two absences as two states, each its own object, in the order
//                 this module decides them, and never folded:
//                   no-guard-verdict     the stream records no per-guard verdict. `GuardsCheckEnd`'s
//                                        only field over `GuardsCheckStart` is the aggregate
//                                        `shouldActivate`, which is never rendered as any guard's
//                                        verdict, and a refusal is never inferred from the terminal
//                                        class — a refused `canMatch` and an unmatched URL are the
//                                        same eleven events (SC3, E4). Stated where the stream
//                                        recorded a `GuardsCheckEnd` for this navigation, which is
//                                        the only stage a verdict could sit in.
//                   no-redirect-decision the terminal's `url` differs from its
//                                        `urlAfterRedirects` with zero `NavigationCancel` and no
//                                        cancellation code 0, so the redirect is only the two urls
//                                        differing and is neither a stage nor a terminal (SC3, E3).
//                 Where both hold on one navigation they render side by side, as two objects with
//                 two names and two sentences, and are never joined into one "no findings" line nor
//                 into one absent-field list (E5). On `cannot-tell`, `[]`: a navigation the stream
//                 never terminated has no `urlAfterRedirects` to compare and no guard stage to
//                 judge, so no absence is decided about it.
//   unconfigured  on `answered`, `{ segments, compared }`: every URL segment of the navigation's own
//                 address that no configured path matches, named as the segment it is, beside the
//                 configured paths that were compared, verbatim and in the config's own order. An
//                 unmatched segment is never resolved to the nearest route, to the `**` row or to a
//                 `redirectTo` row (SC4, E6). On `cannot-tell`, `null`.
//   claims        one entry per rendered claim, each as `{ claim, values, artefactPath }` in M055's
//                 answer shape — a claim carries the artefact that states it or it is not a claim
//                 this module produces (SC1, N1). `claim` is one of `terminal`, `route-config-load`,
//                 `route`, `absence`, `unconfigured`, `cannot-tell`; `values` is what that claim
//                 renders, and the terminal claim carries the event's class and `id` while the route
//                 claim carries the config entry's `path`. Every stream-side claim cites the
//                 navigation record's own path and every config-side claim cites the config record's
//                 own path; no path is composed and none is invented.
//   detail        this join's own sentence about what it read or which absence holds. Never a record
//                 field and never a record's prose: where it quotes a value it quotes the value.
//
// Attribution is by `id` and `route.path` in each event's own payload, never by arrival position
// (SC5, E7, `.project/ROADMAP.md:2053`): the events a navigation owns are the events whose payload
// carries its `id`, and the route-config events whose `route.path` names the outermost segment of
// that navigation's own address. A `RouteConfigLoadStart` and its `RouteConfigLoadEnd` carry no `id`
// at all and are paired by the path they both name, so the abandoned navigation's own load end —
// which arrived 1192.1 ms after its cancel and 314.8 ms before the successor's
// (`research/raw/m041-navigation.json` `superseded.ordering`) — is never given to the navigation
// that arrived beside it. A load naming a path this navigation's address does not start with is
// attributed to no navigation here, rather than to whichever one arrived nearest.
//
// This module imports nothing at runtime, touches no filesystem, dispatches no message, performs no
// network call, holds no clock, starts no tap and reads no page global (SC6, N6). It is a pure join,
// so it cannot reach a page even if it wanted to: the capture belongs to the caller, and this module
// only says what the captured records support. A bare `node:vm` context with nothing in it is enough
// to run it, which the suite proves rather than assuming, and a second answer to the same question
// over the same records names the same terminal class, the same navigation `id`, the same config
// `path` and the same fields (SC1, E10).
(function () {
  'use strict';

  // The two states the join can answer, as data a surface can enumerate rather than as two string
  // comparisons scattered through a renderer.
  const ANSWERED = 'answered';
  const CANNOT_TELL = 'cannot-tell';

  const STATES = Object.freeze([ANSWERED, CANNOT_TELL]);

  // The two absences SC3 requires stated distinctly, in the order this module decides them.
  const NO_GUARD_VERDICT = 'no-guard-verdict';
  const NO_REDIRECT_DECISION = 'no-redirect-decision';

  const ABSENCES = Object.freeze([NO_GUARD_VERDICT, NO_REDIRECT_DECISION]);

  // A terminal class carries its own fields and no others (C3, `fieldMap.stream.terminals`): the four
  // key sets are the recording's own, `type` included, because `type` is a field each class declares
  // and the class is named by `class`, never by that number.
  const NAVIGATION_END_FIELDS = Object.freeze([
    'id',
    'type',
    'url',
    'urlAfterRedirects',
  ]);
  const CANCELLED_FIELDS = Object.freeze([
    'code',
    'id',
    'reason',
    'type',
    'url',
  ]);
  const ERRORED_FIELDS = Object.freeze([
    'error',
    'id',
    'target',
    'type',
    'url',
  ]);

  const TERMINAL_FIELDS = Object.freeze({
    NavigationEnd: NAVIGATION_END_FIELDS,
    NavigationCancel: CANCELLED_FIELDS,
    NavigationError: ERRORED_FIELDS,
    NavigationSkipped: CANCELLED_FIELDS,
  });

  // The router config's five fields (C2, `fieldMap.config`), split into the one every row must carry
  // and the four an entry may state.
  const CONFIG_FIELDS = Object.freeze([
    'path',
    'component',
    'redirectTo',
    'canActivate',
    'loadChildren',
  ]);
  const STATED_FIELDS = Object.freeze([
    'component',
    'redirectTo',
    'canActivate',
    'loadChildren',
  ]);

  // The event classes this join names. No label, no url and no config row is consulted to decide
  // what class an event is.
  const CLASS_NAVIGATION_START = 'NavigationStart';
  const CLASS_ROUTE_CONFIG_START = 'RouteConfigLoadStart';
  const CLASS_ROUTE_CONFIG_END = 'RouteConfigLoadEnd';
  const CLASS_GUARDS_CHECK_START = 'GuardsCheckStart';
  const CLASS_GUARDS_CHECK_END = 'GuardsCheckEnd';
  const CLASS_NAVIGATION_CANCEL = 'NavigationCancel';

  // The wildcard a config may carry and this join never resolves an unmatched segment to.
  const WILDCARD_PATH = '**';

  // The claim names an answer renders, one per statement it makes.
  const CLAIM_TERMINAL = 'terminal';
  const CLAIM_ROUTE_CONFIG_LOAD = 'route-config-load';
  const CLAIM_ROUTE = 'route';
  const CLAIM_ABSENCE = 'absence';
  const CLAIM_UNCONFIGURED = 'unconfigured';
  const CLAIM_CANNOT_TELL = 'cannot-tell';

  // The fields an answer reads, named once so a surface can say which field it rendered from and so
  // the suite can hold this list to the recording's own field map.
  const READS = Object.freeze({
    navigation: 'navigation',
    navigationPath: 'navigation.path',
    navigationId: 'navigation.id',
    navigationQuestion: 'navigation.question',
    navigationEvents: 'navigation.events',
    eventClass: 'event.class',
    eventPayload: 'event.payload',
    terminalClass: 'event.class (terminal)',
    terminalId: 'event.payload.id',
    terminalUrl: 'event.payload.url',
    terminalUrlAfterRedirects: 'event.payload.urlAfterRedirects',
    routePath: 'event.payload.route.path',
    config: 'config',
    configPath: 'config.path',
    configRows: 'config.config',
    rowPath: 'config.config[].path',
  });

  // The fields the records carry that this join never reads, declared here so a pin can hold the
  // module to reading none of them and so no later capture can widen the answer through them
  // (C3, N2, N5). A record carrying one changes nothing this module reports.
  const IGNORED = Object.freeze([
    'event.t',
    'event.keys',
    'event.type',
    'navResolved',
    'routerUrl',
    'addressBar',
    'currentNavigation',
    'finalUrl',
    'cause',
    'clock',
  ]);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A navigation id: the numbers the recordings carry as `id`.
  function isId(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // A quoted value, for this join's own sentences. The value is quoted as the record spells it.
  function quote(value) {
    return '"' + String(value) + '"';
  }

  function countOf(count, one, many) {
    return count + ' ' + (count === 1 ? one : many);
  }

  function payloadOf(event) {
    return isObject(event) && isObject(event.payload) ? event.payload : null;
  }

  function classOf(event) {
    return isObject(event) && typeof event.class === 'string'
      ? event.class
      : null;
  }

  // The navigation an event's own payload names, or null where the payload names none: the one field
  // attribution may never replace with a position in the array (SC5).
  function idOf(event) {
    const payload = payloadOf(event);
    if (payload === null) return null;
    return isId(payload.id) ? payload.id : null;
  }

  // The route a route-config event's own payload names, or null where it names none.
  function routePathOf(event) {
    const payload = payloadOf(event);
    if (payload === null || !isObject(payload.route)) return null;
    const path = payload.route.path;
    return typeof path === 'string' ? path : null;
  }

  // A URL's own segments: the path before the query and the fragment, split on `/`, empties dropped.
  // A segment is named as it stands there, never re-spelled and never resolved.
  function segmentsOf(url) {
    if (typeof url !== 'string') return [];
    let path = url;
    const query = path.indexOf('?');
    if (query !== -1) path = path.slice(0, query);
    const fragment = path.indexOf('#');
    if (fragment !== -1) path = path.slice(0, fragment);
    const parts = path.split('/');
    const segments = [];
    for (let i = 0; i < parts.length; i += 1) {
      const segment = parts[i].trim();
      if (segment !== '') segments.push(segment);
    }
    return segments;
  }

  // A configured path as the row spells it, with the surrounding slashes a config may carry removed
  // for the comparison only: the path the answer renders is always the row's own value.
  function comparablePath(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (trimmed === '') return '';
    return trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
  }

  function terminalFieldsOf(cls) {
    if (cls === 'NavigationEnd') return NAVIGATION_END_FIELDS;
    if (cls === 'NavigationCancel') return CANCELLED_FIELDS;
    if (cls === 'NavigationError') return ERRORED_FIELDS;
    if (cls === 'NavigationSkipped') return CANCELLED_FIELDS;
    return null;
  }

  // The navigation record: the events, the artefact path that states them, the id asked about and
  // the frame's own question. Every one of the four is required for the answer to be renderable,
  // because a claim with no artefact path is not a claim this module produces (SC1).
  function navigationRecordOf(records) {
    const record = isObject(records) ? records.navigation : null;
    if (!isObject(record)) {
      return {
        problem:
          'no navigation record was supplied, so no recorded stream states a terminal event for any navigation',
        path: null,
        id: null,
        question: '',
        events: null,
      };
    }
    if (typeof record.path !== 'string' || record.path === '') {
      return {
        problem:
          'the navigation record names no path, so no claim could carry the artefact that states it',
        path: null,
        id: null,
        question: typeof record.question === 'string' ? record.question : '',
        events: null,
      };
    }
    if (!Array.isArray(record.events)) {
      return {
        problem:
          'the navigation record ' +
          record.path +
          ' holds no event list, so there is no recorded stream to read',
        path: record.path,
        id: null,
        question: typeof record.question === 'string' ? record.question : '',
        events: null,
      };
    }
    const events = record.events;
    let id = isId(record.id) ? record.id : null;
    if (id === null) {
      for (let i = 0; i < events.length; i += 1) {
        const found = idOf(events[i]);
        if (found !== null) {
          id = found;
          break;
        }
      }
    }
    if (id === null) {
      return {
        problem:
          'the navigation record ' +
          record.path +
          ' names no navigation id and its stream records none, so no navigation is asked about',
        path: record.path,
        id: null,
        question: typeof record.question === 'string' ? record.question : '',
        events: null,
      };
    }
    return {
      problem: null,
      path: record.path,
      id: id,
      question: typeof record.question === 'string' ? record.question : '',
      events: events,
    };
  }

  // The router config record: its own rows and the artefact path that states them.
  function configRecordOf(records) {
    const record = isObject(records) ? records.config : null;
    if (!isObject(record)) {
      return {
        problem:
          'no router config record was supplied, so no configured entry states the route this navigation names',
        path: null,
        rows: null,
      };
    }
    if (typeof record.path !== 'string' || record.path === '') {
      return {
        problem:
          'the router config record names no path, so no route claim could carry the artefact that states it',
        path: null,
        rows: null,
      };
    }
    if (!Array.isArray(record.config)) {
      return {
        problem:
          'the router config record ' +
          record.path +
          ' holds no configured rows, so no path is stated for any route',
        path: record.path,
        rows: null,
      };
    }
    return { problem: null, path: record.path, rows: record.config };
  }

  // Every event whose own payload carries the id asked about, in arrival order. Attribution by `id`
  // and by nothing else (SC5).
  function eventsNamed(events, id) {
    const named = [];
    for (let i = 0; i < events.length; i += 1) {
      if (idOf(events[i]) === id) named.push(events[i]);
    }
    return named;
  }

  // The events the asked navigation owns: its own id-carrying events, plus the route-config events
  // that name the outermost segment of its own address and carry no other navigation's id. The merge
  // keeps the record's own order, so "the last event class the stream recorded for this id" is read
  // from the record as it stands (SC2, SC5).
  function ownEventsOf(events, id, firstSegment) {
    const own = [];
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      const owner = idOf(event);
      if (owner === id) {
        own.push(event);
        continue;
      }
      if (owner !== null) continue;
      const cls = classOf(event);
      if (cls !== CLASS_ROUTE_CONFIG_START && cls !== CLASS_ROUTE_CONFIG_END) {
        continue;
      }
      if (firstSegment === null) continue;
      if (routePathOf(event) !== firstSegment) continue;
      own.push(event);
    }
    return own;
  }

  // The terminal event that closed the navigation: the last event for this id whose class is one of
  // the four, read from the event itself and never from a flag about the navigation's outcome
  // (SC1, E1).
  function terminalOf(events) {
    for (let i = events.length - 1; i >= 0; i -= 1) {
      const cls = classOf(events[i]);
      if (terminalFieldsOf(cls) === null) continue;
      const payload = payloadOf(events[i]);
      const terminal = /** @type {Record<string, any>} */ ({ class: cls });
      const fields = terminalFieldsOf(cls);
      for (let f = 0; f < fields.length; f += 1) {
        const value = payload === null ? undefined : payload[fields[f]];
        terminal[fields[f]] = value === undefined ? null : value;
      }
      return terminal;
    }
    return null;
  }

  // The last event of a class among the navigation's own id-carrying events, as its own payload.
  function lastPayloadOfClass(events, cls) {
    for (let i = events.length - 1; i >= 0; i -= 1) {
      if (classOf(events[i]) !== cls) continue;
      return payloadOf(events[i]);
    }
    return null;
  }

  // The url a navigation without a terminal still names: the one its own `NavigationStart` carries.
  // It is read for attribution only and is never rendered on `cannot-tell` (SC2).
  function startUrlOf(events) {
    const payload = lastPayloadOfClass(events, CLASS_NAVIGATION_START);
    if (payload === null) return null;
    return typeof payload.url === 'string' ? payload.url : null;
  }

  // The route-config events attributed to the navigation, each by the `route.path` its own payload
  // names and never by where it arrived (SC5, E7).
  function routeConfigLoadsOf(own) {
    const loads = [];
    for (let i = 0; i < own.length; i += 1) {
      const cls = classOf(own[i]);
      if (cls !== CLASS_ROUTE_CONFIG_START && cls !== CLASS_ROUTE_CONFIG_END) {
        continue;
      }
      loads.push({ class: cls, routePath: routePathOf(own[i]) });
    }
    return loads;
  }

  // The config row the navigation's own address names: the row whose own `path` is that address, or
  // — for a nested address — the row whose `path` is its outermost segment. A `**` row is never
  // matched, because a wildcard is not a route node the address names (SC4, E6).
  function routeRowOf(segments, rows) {
    if (segments.length === 0) {
      for (let i = 0; i < rows.length; i += 1) {
        const row = rows[i];
        if (!isObject(row)) continue;
        const path = comparablePath(row.path);
        if (path === null) continue;
        if (path === '') return row;
      }
      return null;
    }
    const whole = segments.join('/');
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!isObject(row)) continue;
      const path = comparablePath(row.path);
      if (path === null || path === WILDCARD_PATH) continue;
      if (path === whole) return row;
    }
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!isObject(row)) continue;
      const path = comparablePath(row.path);
      if (path === null || path === WILDCARD_PATH) continue;
      if (path === segments[0]) return row;
    }
    return null;
  }

  // The config entry as the answer renders it: its own `path` and the fields it states, and none it
  // does not. A `redirectTo` is a configuration fact here and never the redirect that decided the
  // navigation; a `canActivate` name is configuration and never a verdict (SC3).
  function routeOf(row) {
    if (row === null) return null;
    const route = /** @type {Record<string, any>} */ ({ path: row.path });
    for (let i = 0; i < STATED_FIELDS.length; i += 1) {
      const field = STATED_FIELDS[i];
      const value = row[field];
      if (value === undefined || value === null) continue;
      route[field] = value;
    }
    return route;
  }

  // The configured paths that were compared, verbatim and in the config's own order.
  function comparedPathsOf(rows) {
    const paths = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      if (!isObject(row)) continue;
      if (typeof row.path !== 'string') continue;
      paths.push(row.path);
    }
    return paths;
  }

  // Every URL segment no configured path matches, named as the segment it is (SC4, E6).
  function unmatchedSegmentsOf(segments, compared) {
    const unmatched = [];
    const named = [];
    for (let i = 0; i < compared.length; i += 1) {
      const path = comparablePath(compared[i]);
      if (path !== null) named.push(path);
    }
    for (let i = 0; i < segments.length; i += 1) {
      if (named.indexOf(segments[i]) === -1) unmatched.push(segments[i]);
    }
    return unmatched;
  }

  // Whether the stream records a cancellation code 0 — `NavigationCancellationCode.Redirect` — among
  // this navigation's own cancel events. It is read, and it is never produced by a run in the record
  // this milestone measured (C1, E3).
  function cancellationCodeZeroIn(events) {
    for (let i = 0; i < events.length; i += 1) {
      if (classOf(events[i]) !== CLASS_NAVIGATION_CANCEL) continue;
      const payload = payloadOf(events[i]);
      if (payload !== null && payload.code === 0) return true;
    }
    return false;
  }

  function cancelEventsOf(events) {
    const cancels = [];
    for (let i = 0; i < events.length; i += 1) {
      if (classOf(events[i]) === CLASS_NAVIGATION_CANCEL)
        cancels.push(events[i]);
    }
    return cancels;
  }

  // The absence no record can fill: `GuardsCheckEnd` adds the aggregate `shouldActivate` to
  // `GuardsCheckStart` and names no guard, so the answer states the absence rather than rendering a
  // verdict or inferring a refusal from the terminal class (SC3, E4, N3).
  function noGuardVerdictOf(guardsCheckEnd, guardsCheckStart, terminalClass) {
    const endKeys = Object.keys(guardsCheckEnd);
    const guardFields = [];
    if (guardsCheckStart !== null) {
      for (let i = 0; i < endKeys.length; i += 1) {
        if (!(endKeys[i] in guardsCheckStart)) guardFields.push(endKeys[i]);
      }
    }
    return {
      state: NO_GUARD_VERDICT,
      guardsCheckEndKeys: endKeys,
      guardFields: guardFields,
      guardsNamed: [],
      detail:
        'the absence no-guard-verdict holds: the stream records GuardsCheckEnd for this navigation and it adds ' +
        countOf(guardFields.length, 'field', 'fields') +
        ' over GuardsCheckStart' +
        (guardFields.length > 0 ? ' (' + guardFields.join(', ') + ')' : '') +
        ', which is the aggregate of the whole check, and the payload names ' +
        countOf(0, 'guard', 'guards') +
        ': no per-guard verdict is recorded here, so none is rendered and no refusal is inferred from the terminal class ' +
        quote(terminalClass),
    };
  }

  // The absence the record's own shape states: the two urls differ and no cancel explains why, so the
  // redirect is a url change and never a decision (SC3, E3, N3).
  function noRedirectDecisionOf(terminal, cancels) {
    return {
      state: NO_REDIRECT_DECISION,
      url: terminal.url,
      urlAfterRedirects: terminal.urlAfterRedirects,
      cancels: cancels.length,
      cancellationCodeZero: cancellationCodeZeroIn(cancels),
      detail:
        'the absence no-redirect-decision holds: the terminal states url ' +
        quote(terminal.url) +
        ' and urlAfterRedirects ' +
        quote(terminal.urlAfterRedirects) +
        ', so the two differ, and the stream records ' +
        countOf(cancels.length, 'NavigationCancel', 'NavigationCancel events') +
        ' for this navigation and no cancellation code 0: the redirect is only the two urls differing, so it is not a stage and not a terminal, and the change is stated rather than rendered as the decision',
    };
  }

  // The two absences, decided in the order the contract lists them, each its own object. They are
  // pushed by two separate decisions and never merged, so one navigation can carry both — and where
  // it does, it carries two states and not one (SC3, E5).
  function absencesOf(events, terminal) {
    const absences = [];
    const guardsCheckEnd = lastPayloadOfClass(events, CLASS_GUARDS_CHECK_END);
    if (guardsCheckEnd !== null) {
      absences.push(
        noGuardVerdictOf(
          guardsCheckEnd,
          lastPayloadOfClass(events, CLASS_GUARDS_CHECK_START),
          terminal.class,
        ),
      );
    }
    const cancels = cancelEventsOf(events);
    if (
      typeof terminal.url === 'string' &&
      typeof terminal.urlAfterRedirects === 'string' &&
      terminal.url !== terminal.urlAfterRedirects &&
      cancels.length === 0 &&
      !cancellationCodeZeroIn(cancels)
    ) {
      absences.push(noRedirectDecisionOf(terminal, cancels));
    }
    return absences;
  }

  // One claim: what it renders, and the artefact path that states it. A claim with no artefact path is
  // not a claim this module can build, because the path is an argument here (SC1).
  function claimOf(claim, values, artefactPath) {
    return { claim: claim, values: values, artefactPath: artefactPath };
  }

  // The claims an `answered` answer renders, in the order it renders them: the terminal, the
  // route-config loads attributed to this navigation, the route, the two absences and what the config
  // could not place. Every stream-side claim cites the navigation record's own path and every
  // config-side claim cites the config record's own path (SC1, E7).
  function answeredClaims(
    navigation,
    config,
    terminal,
    loads,
    route,
    absences,
    unconfigured,
  ) {
    const claims = [];
    claims.push(
      claimOf(
        CLAIM_TERMINAL,
        { class: terminal.class, id: terminal.id },
        navigation.path,
      ),
    );
    for (let i = 0; i < loads.length; i += 1) {
      claims.push(
        claimOf(
          CLAIM_ROUTE_CONFIG_LOAD,
          { class: loads[i].class, routePath: loads[i].routePath },
          navigation.path,
        ),
      );
    }
    if (route !== null) {
      claims.push(claimOf(CLAIM_ROUTE, { path: route.path }, config.path));
    }
    for (let i = 0; i < absences.length; i += 1) {
      claims.push(
        claimOf(CLAIM_ABSENCE, { state: absences[i].state }, navigation.path),
      );
    }
    claims.push(
      claimOf(
        CLAIM_UNCONFIGURED,
        { segments: unconfigured.segments },
        config.path,
      ),
    );
    return claims;
  }

  // One answer, with every field present in every state, so a renderer reads eight fields and not
  // seven sometimes.
  function answerOf(
    answered,
    question,
    terminal,
    route,
    absences,
    unconfigured,
    claims,
    detail,
  ) {
    return {
      state: answered ? ANSWERED : CANNOT_TELL,
      question: question,
      terminal: terminal,
      route: route,
      absences: absences,
      unconfigured: unconfigured,
      claims: claims,
      detail: detail,
    };
  }

  // The sentence an `answered` answer states: what was read, where it is written, and the absences
  // that stand beside it.
  function answeredDetail(
    navigation,
    config,
    terminal,
    route,
    unconfigured,
    absences,
    loads,
  ) {
    let detail =
      'the navigation record ' +
      navigation.path +
      ' states ' +
      terminal.class +
      ' for navigation id ' +
      terminal.id +
      ' with url ' +
      quote(terminal.url) +
      (typeof terminal.urlAfterRedirects === 'string'
        ? ' and urlAfterRedirects ' + quote(terminal.urlAfterRedirects)
        : '') +
      ', so the destination it names is the url the terminal event itself carries and never the address bar, router.url or currentNavigation()';
    if (route === null) {
      detail +=
        '; the config record ' +
        config.path +
        ' states no entry whose path is the address this navigation names, so no route node is named';
    } else {
      const stated = [];
      for (let i = 0; i < STATED_FIELDS.length; i += 1) {
        if (route[STATED_FIELDS[i]] !== undefined)
          stated.push(STATED_FIELDS[i]);
      }
      detail +=
        '; the config record ' +
        config.path +
        ' states the entry path ' +
        quote(route.path) +
        ' with ' +
        (stated.length > 0
          ? countOf(stated.length, 'stated field', 'stated fields') +
            ' (' +
            stated.join(', ') +
            ')'
          : 'no other field');
      if (route.redirectTo !== undefined) {
        detail +=
          ', and that redirectTo is a configuration fact and never the redirect that decided this navigation';
      }
      if (route.canActivate !== undefined) {
        detail +=
          ', and that canActivate name is configuration and never a guard\u2019s verdict';
      }
    }
    if (unconfigured.segments.length > 0) {
      detail +=
        '; ' +
        countOf(unconfigured.segments.length, 'url segment', 'url segments') +
        ' (' +
        unconfigured.segments.join(', ') +
        ') match no configured path and are named unconfigured beside the ' +
        countOf(unconfigured.compared.length, 'path', 'paths') +
        ' that were compared, never resolved to the nearest route, to the wildcard or to a redirectTo row';
    } else {
      detail +=
        '; every url segment this navigation names matches a configured path beside the ' +
        countOf(unconfigured.compared.length, 'path', 'paths') +
        ' that were compared';
    }
    if (loads.length > 0) {
      detail +=
        '; ' +
        countOf(loads.length, 'route-config event', 'route-config events') +
        ' naming the path this navigation\u2019s own address starts with ' +
        (loads.length === 1 ? 'is' : 'are') +
        ' attributed to it by route.path in the event\u2019s own payload, never by arrival position';
    }
    if (absences.length === 0) {
      detail +=
        '; neither absence holds on this navigation: the stream records no GuardsCheckEnd to judge a guard field by, and its terminal states no url that differs from urlAfterRedirects';
    } else if (absences.length === 1) {
      detail += '; the absence ' + absences[0].state + ' holds beside it';
    } else {
      detail +=
        '; the two absences hold side by side on this one navigation and stay two states, neither as the other and neither folded: ' +
        absences[0].state +
        ' and ' +
        absences[1].state;
    }
    return detail;
  }

  // The sentence a `cannot-tell` answer states: the last class the stream recorded for the id, and
  // nothing else — no destination, no route node, no cause (SC2, E2, N2).
  function cannotTellDetail(navigation, id, lastClass, recorded, reason) {
    let detail = '';
    if (navigation.path !== null) {
      detail =
        'the navigation record ' +
        navigation.path +
        ' records ' +
        countOf(recorded, 'event', 'events') +
        ' for navigation id ' +
        id +
        ' and the last of them is ' +
        String(lastClass) +
        '; ';
    }
    detail += reason;
    detail +=
      ': no destination, no route node and no cause is named, not from the address bar, not from router.url and not from currentNavigation(), and no absences are decided about a navigation the stream never terminated';
    return detail;
  }

  // The question a caller asks, echoed verbatim from the frame's own field. It is never composed and
  // never paraphrased.
  function askedOf(records) {
    if (!isObject(records) || !isObject(records.navigation)) return '';
    const question = records.navigation.question;
    return typeof question === 'string' ? question : '';
  }

  // One `cannot-tell` answer, built in one place: the last event class the stream recorded for the id
  // asked about and nothing else — no destination, no route node and no cause, and no absence decided
  // about a navigation the stream never terminated (SC2, E2, N2).
  function cannotTellAnswer(records, navigation, id, own, reason) {
    const lastClass = own.length === 0 ? null : classOf(own[own.length - 1]);
    const claim = claimOf(
      CLAIM_CANNOT_TELL,
      { id: id, lastClass: lastClass },
      navigation.path,
    );
    return answerOf(
      false,
      askedOf(records),
      null,
      null,
      [],
      null,
      navigation.path === null ? [] : [claim],
      cannotTellDetail(navigation, id, lastClass, own.length, reason),
    );
  }

  // The join. `records` is the two records and nothing else — the recorded navigation stream and the
  // recorded router config — so a caller cannot smuggle a page value, a clock, a cause or a verdict
  // into the answer through this function. Anything else on `records` is ignored.
  function tutorRouting(records) {
    const read = isObject(records) ? records : {};

    // 1. The navigation record. A record that names no artefact path cannot produce a claim, so it
    // answers cannot-tell rather than a claim with no path (SC1).
    const navigation = navigationRecordOf(read);
    if (navigation.problem !== null) {
      return cannotTellAnswer(
        read,
        navigation,
        navigation.id,
        [],
        navigation.problem,
      );
    }

    const id = navigation.id;
    const named = eventsNamed(navigation.events, id);
    const terminal = terminalOf(named);

    // 2. The router config record, read at the same time: both halves are needed for a route claim to
    // carry the artefact that states it.
    const config = configRecordOf(read);
    if (config.problem !== null) {
      return cannotTellAnswer(
        read,
        navigation,
        id,
        ownEventsOf(navigation.events, id, null),
        config.problem,
      );
    }

    // 3. The navigation's own address: the terminal's own `url` where the stream recorded a terminal,
    // and its own `NavigationStart` url where it recorded none. Read for attribution only.
    const address =
      terminal !== null && typeof terminal.url === 'string'
        ? terminal.url
        : startUrlOf(named);
    const segments = segmentsOf(address);
    const firstSegment = segments.length > 0 ? segments[0] : null;

    // 4. The events this navigation owns, merged in the record's own order so the last class is the
    // record's last, and never a position's guess (SC5, E7).
    const own = ownEventsOf(navigation.events, id, firstSegment);

    // 5. No terminal for this id is cannot-tell, naming the last event class the stream recorded for
    // it and nothing else (SC2, E2).
    if (terminal === null) {
      return cannotTellAnswer(
        read,
        navigation,
        id,
        own,
        'the stream records no terminal event for that id, so the navigation is not known to have landed at any route',
      );
    }

    // 6. The route the navigation's own address names, the segments no configured path matches, the
    // two absences and the route-config loads attributed by route.path (SC1, SC3, SC4, SC5).
    const route = routeOf(routeRowOf(segments, config.rows));
    const unconfigured = {
      segments: unmatchedSegmentsOf(segments, comparedPathsOf(config.rows)),
      compared: comparedPathsOf(config.rows),
    };
    const absences = absencesOf(named, terminal);
    const loads = routeConfigLoadsOf(own);

    return answerOf(
      true,
      askedOf(records),
      terminal,
      route,
      absences,
      unconfigured,
      answeredClaims(
        navigation,
        config,
        terminal,
        loads,
        route,
        absences,
        unconfigured,
      ),
      answeredDetail(
        navigation,
        config,
        terminal,
        route,
        unconfigured,
        absences,
        loads,
      ),
    );
  }

  const namespace = {
    tutorRouting: tutorRouting,
    STATES: STATES,
    ABSENCES: ABSENCES,
    TERMINAL_FIELDS: TERMINAL_FIELDS,
    CONFIG_FIELDS: CONFIG_FIELDS,
    READS: READS,
    IGNORED: IGNORED,
  };

  if (globalThis.angularAiTutorRouting) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiTutorRouting, namespace);
  } else {
    globalThis.angularAiTutorRouting = namespace;
  }
})();
