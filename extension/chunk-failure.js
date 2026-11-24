// chunk-failure.js — the join M064's panel renders: the record `extension/import-failure.js` writes,
// read as the one state each dynamic-import attempt ended in — the specifier it could not load, the
// route path whose configuration requested it, the response status and the content hash when the
// attempt produced them — or the named absence where the record does not settle the question.
//
// What this join reads, and where each field comes from:
//
//   - the attempt record, one per dynamic-import attempt, as `extension/import-failure.js` writes it:
//
//       { specifier, routePath, status, hash, outcome }
//
//     `specifier` is the specifier the router's `import()` was called with, as the page stated it and
//     never a chunk name read back out of a request URL; `routePath` is the configured path of the
//     route whose route-config load requested the import, `''` for a componentless route and the root;
//     `status` is the status a response carried, absent where no response arrived; `hash` is the
//     content hash of the body when the page computed one, absent otherwise and never derived from a
//     filename, a size or a status; `outcome` is `loaded` or `failed`, absent where the page did not
//     record what the attempt returned. The record's own field list is `ATTEMPT_FIELDS` below, and
//     the suite asserts it is the list the module that writes the record publishes — the record's
//     fields and this join's inputs are one list.
//   - the router's own stream, as `extension/agent-main.js` publishes it beside the change-detection
//     frame: `record.routerEvents`, one entry per `Router.events` emission in arrival order. Of that
//     stream this join reads two fields and no others: an entry's `type` and its `route`. A
//     `RouteConfigLoadStart` or `RouteConfigLoadEnd` entry is the router's own statement that it
//     attempted to load that route's configuration — the load that requests the dynamic import —
//     and its `route` is the route config's own path, as a plain string
//     (`agent-main.js:1642` writes `route: routerRoutePathOf(event)`, and `routerRoutePathOf`
//     `1527-1537` returns `route.path` and null for anything but a string). No id, url, error,
//     timing or payload of that stream is read here, and the two classes are the whole list: a
//     navigation that emitted neither attempted no route this join can name.
//
// The answer is one object, in every state (the surface renders this and nothing else):
//
//   { state, specifier?, routePath?, status?, hash?, consideredCount?, reason? }
//
//   state            `missing-import`  the import failed and the record names the specifier
//                    `never-completed` the attempt's request produced no response status
//                    `resolved`       the import loaded, so there is no failure to report
//                    `cannot-tell`    a reason on its own
//   specifier        the specifier the attempt's own record carried, and only then
//   routePath        the owning route path the record carried and the router's stream admits, and
//                    only then — a path the router never attempted is refused rather than repeated
//   status           the status a response carried, only where one arrived; a missing status is
//                    never written as a 404 and never kept as a zero
//   hash             the content hash the record carried, truncated where the record truncated it,
//                    and never completed from the attempt's chunk filename
//   consideredCount  the number of attempts the answer walked, stated only by an answer produced
//                    from a list: a single attempt is one attempt and says so by carrying no count
//   reason           a token from the closed set below, never prose and never a cause:
//                      `record-unreadable`      the value handed over is not an attempt record
//                      `no-import-recorded`     the record carried no attempt at all
//                      `specifier-not-recorded` a failed attempt that names no specifier, so there
//                                               is no missing import to name
//                      `no-response`            the attempt completed no request: its own reason for
//                                               being `never-completed`
//                      `outcome-not-recorded`   the record does not say what the attempt returned,
//                                               so nothing here calls it a failure
//
// `no-response` is the one reason that rides on a state other than `cannot-tell`: a `never-completed`
// attempt names the fact that it never completed, and nothing about why.
//
// Three rules decide what is written, and each is a defect this module is written against:
//
//   - the state is read from the attempt's own `outcome`, never from its `status`. A response that
//     arrived is a measurement, not a verdict: an attempt the record does not say failed answers
//     `cannot-tell` with `outcome-not-recorded` however bad its status looks, because a status that
//     worsened is not a failure the record states (E3, N1).
//   - a route path is attributed only where the router attempted it. Where the router's stream is
//     handed over, the answer carries a `routePath` only when that path is one of the paths the
//     stream's route-config entries name; a path the router never attempted is refused, and the
//     answer keeps the failure it does state without the attribution it cannot (E7). Where no stream
//     is handed over the refusal has nothing to compare against, and the record's own path is carried
//     as the record's own statement. An empty stream attempted nothing, so no path is attributed.
//   - every answer of a list is the answer of its own attempt. A navigation that failed twice is two
//     answers, in the order the record holds them — which is the order the router attempted them —
//     each with its own specifier, its own route path and its own status: no answer is lent a
//     neighbour's field, none is collapsed onto the last, and none stands in for another (E2).
//
// One function answers, and the shape of what it answers follows the shape of what it is handed:
//
//   chunkFailure(attempt)   -> one answer, for one attempt record
//   chunkFailure(attempts)  -> one answer per attempt, in the order the list holds them
//
// `attempts` is either the record `extension/import-failure.js` writes (`{ importAttempts: [...] }`)
// or a bare array of attempt records. A list's answers each state `consideredCount`, the number of
// attempts walked, so a surface renders "this failure, one of three import attempts" without counting
// anything itself. A list that holds no attempt answers one absence, `no-import-recorded`, with a
// count of zero: an empty list of answers would read as a clean stream, and "no import was recorded"
// and "the import worked" are different answers.
//
// This module is one pure function and it reads nothing else: no imports, no DOM, no clock, no
// console, no network, no extension API and no page global — it opens no request to learn a status or
// a hash and wraps no `import()` of its own, because the record is the caller's and this file only
// joins what the caller published. A bare `node:vm` context with nothing in it is enough to run it,
// which is what its suite proves. It holds no state between calls, never sorts, writes nothing into
// the records it is handed, and answers the same bytes for the same record twice.
(function () {
  'use strict';

  // The four states, and the verdict a question the record does not answer carries.
  const MISSING_IMPORT = 'missing-import';
  const NEVER_COMPLETED = 'never-completed';
  const RESOLVED = 'resolved';
  const CANNOT_TELL = 'cannot-tell';

  // The absences, published as names rather than prose so a caller compares a constant and a surface
  // renders the absence it was handed. They are the record's own five: one vocabulary, one list.
  const RECORD_UNREADABLE = 'record-unreadable';
  const NO_IMPORT_RECORDED = 'no-import-recorded';
  const SPECIFIER_NOT_RECORDED = 'specifier-not-recorded';
  const NO_RESPONSE = 'no-response';
  const OUTCOME_NOT_RECORDED = 'outcome-not-recorded';

  // The two values an attempt's own `outcome` field may take: what the import returned, and nothing
  // about why it returned it.
  const LOADED = 'loaded';
  const FAILED = 'failed';

  // The two route-config classes: the router's own statement that it attempted a route's
  // configuration, which is the load that requests the dynamic import.
  const ROUTE_CONFIG_LOAD_START = 'RouteConfigLoadStart';
  const ROUTE_CONFIG_LOAD_END = 'RouteConfigLoadEnd';
  const LOAD_CLASSES = [ROUTE_CONFIG_LOAD_START, ROUTE_CONFIG_LOAD_END];

  // The closed sets, exported so a caller, a record and a surface all read one list.
  const STATES = [MISSING_IMPORT, NEVER_COMPLETED, RESOLVED, CANNOT_TELL];
  const REASONS = [
    RECORD_UNREADABLE,
    NO_IMPORT_RECORDED,
    SPECIFIER_NOT_RECORDED,
    NO_RESPONSE,
    OUTCOME_NOT_RECORDED,
  ];
  const FIELDS = [
    'state',
    'specifier',
    'routePath',
    'status',
    'hash',
    'consideredCount',
    'reason',
  ];
  const ATTEMPT_FIELDS = [
    'specifier',
    'routePath',
    'status',
    'hash',
    'outcome',
  ];
  const OUTCOMES = [LOADED, FAILED];

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A string that says something, or null. A blank specifier names no specifier, and a blank hash is
  // no hash: both are read as absences rather than as empty values.
  function nonEmptyText(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // A response status the page could have read: an integer HTTP status. A string, a float, a `NaN`
  // and a plausible-looking 0 are all the same absence here, so a status that arrived is never
  // confused with one that was written down.
  function isStatus(value) {
    return (
      typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 100 &&
      value <= 599
    );
  }

  // A route path the record states. `''` is a route path — a componentless route and the root both
  // state one — so it is kept as stated and is not read as an absence.
  function isRoutePath(value) {
    return typeof value === 'string';
  }

  // One attempt, read as what the record says and nothing more. An object carrying none of the
  // attempt fields is not an attempt record at all, which is a different answer from an attempt that
  // says nothing about its outcome: the first is `record-unreadable`, the second is a named absence.
  function readAttempt(value) {
    if (!isObject(value)) return null;
    let stated = false;
    for (let i = 0; i < ATTEMPT_FIELDS.length; i += 1) {
      if (ATTEMPT_FIELDS[i] in value) stated = true;
    }
    if (!stated) return null;
    return {
      specifier: nonEmptyText(value.specifier),
      routePath: isRoutePath(value.routePath) ? value.routePath : null,
      status: isStatus(value.status) ? value.status : null,
      hash: nonEmptyText(value.hash),
      outcome: OUTCOMES.indexOf(value.outcome) === -1 ? null : value.outcome,
    };
  }

  // The one place a field is written. A field the record did not carry is left out entirely rather
  // than written as null, a placeholder or a guess, so `hash` and `status` are absent when nothing
  // produced them.
  function put(written, name, value) {
    if (value !== null && value !== undefined) written[name] = value;
    return written;
  }

  // One attempt's state, from what the attempt's own record says it returned: a loaded import is a
  // resolution and never a failure, and a failed one is a missing import only when it names the
  // specifier and a response arrived. The status decides nothing here beyond whether one arrived, so
  // a status that worsened cannot promote an attempt the record does not call failed.
  function stateOf(entry) {
    if (entry.outcome === LOADED) return RESOLVED;
    if (entry.outcome !== FAILED) return CANNOT_TELL;
    if (entry.specifier === null) return CANNOT_TELL;
    return entry.status === null ? NEVER_COMPLETED : MISSING_IMPORT;
  }

  // The absence a cannot-tell attempt names: what the record did not say, and never what it might
  // have meant.
  function cannotTellReason(entry) {
    if (entry.outcome !== LOADED && entry.outcome !== FAILED) {
      return OUTCOME_NOT_RECORDED;
    }
    return SPECIFIER_NOT_RECORDED;
  }

  // An absence, written in one place so every way of reaching it says the same thing and nothing
  // that reads as a cause, a fix or a clean stream.
  function absence(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  // The route paths the router's own stream names, in the order it named them, or null where no
  // stream was handed over. Only a route-config entry's own `route` is read, and only where it is a
  // string: an entry of another class names no attempt, and a load whose route the record does not
  // state names no path.
  function attemptedPathsOf(navigation) {
    if (!isObject(navigation)) return null;
    const events = navigation.routerEvents;
    if (!Array.isArray(events)) return null;
    const paths = [];
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i];
      if (!isObject(event)) continue;
      if (LOAD_CLASSES.indexOf(event.type) === -1) continue;
      if (typeof event.route !== 'string') continue;
      paths.push(event.route);
    }
    return paths;
  }

  // The route path an answer may carry: the record's own, where the router's stream admits that it
  // attempted it. A path the stream never names is refused — an answer never attributes a failure to
  // a route the router did not attempt — and a refused path is absent rather than corrected.
  function attributed(routePath, attempted) {
    if (routePath === null) return null;
    if (attempted === null) return routePath;
    return attempted.indexOf(routePath) === -1 ? null : routePath;
  }

  // One attempt's answer: the state first, then only the fields the attempt's own record carried, in
  // the order the interface names them, and a `never-completed` attempt naming the one fact it knows.
  function answerFor(entry, attempted) {
    const state = stateOf(entry);
    if (state === CANNOT_TELL) return absence(cannotTellReason(entry));
    const written = put({ state: state }, 'specifier', entry.specifier);
    put(written, 'routePath', attributed(entry.routePath, attempted));
    put(written, 'status', entry.status);
    put(written, 'hash', entry.hash);
    if (state === NEVER_COMPLETED) written.reason = NO_RESPONSE;
    return written;
  }

  // An answer produced from a list, rewritten in the interface's own order with the number of
  // attempts it walked before the reason it may name: one answer states its count and its absence in
  // the order a surface renders them.
  function counted(answer, consideredCount) {
    const written = { state: answer.state };
    put(written, 'specifier', answer.specifier);
    put(written, 'routePath', answer.routePath);
    put(written, 'status', answer.status);
    put(written, 'hash', answer.hash);
    written.consideredCount = consideredCount;
    put(written, 'reason', answer.reason);
    return written;
  }

  // The list a record carries, or null where the record is one attempt. The record
  // `extension/import-failure.js` writes holds its attempts in `importAttempts`, and a caller reading
  // that record hands them over in that order: the order the router attempted them.
  function listOf(record) {
    if (Array.isArray(record)) return record;
    if (isObject(record) && Array.isArray(record.importAttempts)) {
      return record.importAttempts;
    }
    return null;
  }

  // The join. `record` is one attempt as the tap wrote it, or the record that carries the list of
  // attempts it collected; `navigation` is the router's own stream, handed over for the one question
  // the attempt record cannot answer — whether the route path it carries is one the router attempted.
  function chunkFailure(record, navigation) {
    const attempted = attemptedPathsOf(navigation);
    const attempts = listOf(record);
    if (attempts === null) {
      const entry = readAttempt(record);
      if (entry === null) return absence(RECORD_UNREADABLE);
      return answerFor(entry, attempted);
    }
    if (attempts.length === 0) {
      return [counted(absence(NO_IMPORT_RECORDED), 0)];
    }
    const answers = [];
    for (let i = 0; i < attempts.length; i += 1) {
      const entry = readAttempt(attempts[i]);
      const answer =
        entry === null
          ? absence(RECORD_UNREADABLE)
          : answerFor(entry, attempted);
      answers.push(counted(answer, attempts.length));
    }
    return answers;
  }

  const namespace = {
    chunkFailure: chunkFailure,
    STATES: STATES,
    REASONS: REASONS,
    FIELDS: FIELDS,
    ATTEMPT_FIELDS: ATTEMPT_FIELDS,
    OUTCOMES: OUTCOMES,
    MISSING_IMPORT: MISSING_IMPORT,
    NEVER_COMPLETED: NEVER_COMPLETED,
    RESOLVED: RESOLVED,
    CANNOT_TELL: CANNOT_TELL,
    RECORD_UNREADABLE: RECORD_UNREADABLE,
    NO_IMPORT_RECORDED: NO_IMPORT_RECORDED,
    SPECIFIER_NOT_RECORDED: SPECIFIER_NOT_RECORDED,
    NO_RESPONSE: NO_RESPONSE,
    OUTCOME_NOT_RECORDED: OUTCOME_NOT_RECORDED,
  };

  const g = globalThis;
  if (g.angularAiChunkFailure) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(g.angularAiChunkFailure, namespace);
  } else {
    g.angularAiChunkFailure = namespace;
  }
})();
