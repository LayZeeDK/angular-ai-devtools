// Tests for extension/navigation-narrator.js — the join that turns one recorded navigation stream
// into the navigations it carries: the terminal each one reached and only the fields that terminal
// recorded, the stage an open one sits at, the holder no payload names, and the three absences this
// milestone must report rather than invent.
//
// The module is evaluated in a bare `node:vm` context; the checkout is never written. Two pins guard
// purity: the context carries no DOM, clock, console or network, and the join is run again in a
// context where every one of those names is a trap, so a module that reached for one is caught
// rather than answered exactly as the clean module is.
//
// Every frame below is T001's measurement (`research/raw/m041-navigation.json`) converted into the
// entry shape T002 publishes — the class name, the page's own receipt time and the fields the event
// carried — so the pins are held to a recording rather than to a fixture invented for the test:
//
//   held         NavigationStart + RouteConfigLoadStart, no terminal event, nothing named as holder
//   warm         23 events, two measured route-config intervals, NavigationEnd 3.1 ms after the last
//   superseded   a NavigationCancel at 564.2 ms whose own load end arrives at 1756.3 ms, 314.8 ms
//                before the successor's at 2071.1 ms
//   error        a NavigationError carrying a TypeError's own name and message
//   skip         a single NavigationSkipped, so the record carries no start for it at all
//   redirect     11 events whose only trace of the redirect is `url` against `urlAfterRedirects`
//   refused      the eleven classes a refused `canMatch` produced, and the same eleven an unmatched
//   unmatched    URL produced: the same key sets, both `shouldActivate: true`, both chain `[null,"**"]`
//
// Three frames are not verbatim recordings and say so where they sit: the two wildcard frames carry
// the recording's own class sequence and chain with the ids and urls of the two navigations the
// recording compared, a prefix frame is the recorded stream cut where the measurement's hold was,
// and the measured-zero frame repeats one recorded reading on both ends of one load.
//
// The nine held-out edges are pinned exactly:
//
//   E1  each of the four terminal classes renders as itself, with only the fields that class carried
//   E2  an end route appears only where the terminal event carried `urlAfterRedirects`
//   E3  a start with no terminal renders open at its last stage, never as the reason it is open, and
//       an empty record answers the absence rather than a zero that reads as success
//   E4  every stage word is the class of an event the record contains, and no other word appears
//   E5  an open navigation's holder is `no-holder-recorded` and carries no guard, chunk or task name
//   E6  a wildcard match is reported as the match and never as a guard refusal, and a refusal is
//       indistinguishable from an unmatched URL in the answer
//   E7  `shouldActivate` is the aggregate field it is and is never attributed to a named guard, and
//       a resolve stage on a configuration declaring no resolver answers `no-resolver-configured`
//   E8  a completed navigation with a measured interval answers ended with it, a measured zero
//       included, and is never reported open or held
//   E9  an id-less load never acquires one, and a load end closes the load its own start opened on
//       the navigation that start belonged to — never its successor
//
// Every edge is proven non-vacuously in four phases: the pin is run against the untouched module
// first, then against a mutant of the module source which is asserted to exhibit the defect the pin
// hunts, then the pin is asserted to redden on it with a failure message that names the defect by
// string, then the untouched module is pinned again. A mutant that survives its pin, or reddens with
// a message that does not name the defect, fails this suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/navigation-narrator.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m041-navigation.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------ measured facts ----

/** The four terminal classes the recording enumerates, and no fifth. */
const TERMINAL_CLASSES = [
  'NavigationEnd',
  'NavigationCancel',
  'NavigationError',
  'NavigationSkipped',
];

/** The four stage words, and the class each one is named by. Written here rather than read from the
 * module, so the pin cannot be satisfied by the module agreeing with itself. */
const STAGE_WORDS = [
  'activation',
  'guards-check',
  'resolve',
  'route-config-load',
];
const STAGE_OF_CLASS = new Map([
  ['RouteConfigLoadStart', 'route-config-load'],
  ['RouteConfigLoadEnd', 'route-config-load'],
  ['GuardsCheckStart', 'guards-check'],
  ['GuardsCheckEnd', 'guards-check'],
  ['ResolveStart', 'resolve'],
  ['ResolveEnd', 'resolve'],
  ['ChildActivationStart', 'activation'],
  ['ActivationStart', 'activation'],
  ['ActivationEnd', 'activation'],
  ['ChildActivationEnd', 'activation'],
]);

/** The classes the recording enumerates, by name, with each class's own recorded payload fields. */
const CLASS_KEYS = new Map(
  RECORDING.events.classes.map((row) => [row.name, row.keys]),
);

/** The recorded frames, verbatim. */
const HELD = RECORDING.held.inFlight.events;
const WARM = RECORDING.warm.events;
const SUPERSEDED = RECORDING.superseded.events;
const ERROR = RECORDING.terminals.error.events;
const SKIP = RECORDING.terminals.skip.events;
const REDIRECT = RECORDING.terminals.redirect.events;

/** The two navigations the refused-`canMatch` comparison measured, as class sequences. */
const GUARD_COMPARISON =
  RECORDING.absences['guard-verdict-not-recorded']
    .refusedGuardVersusUnmatchedUrl.comparison;

/** The key sets an answer, a navigation and a load may carry — and the whole of what one may. */
const ANSWER_KEYS = [
  'absence',
  'navigations',
  'skipped',
  'state',
  'unattributed',
];
const NAVIGATION_KEYS = [
  'absence',
  'code',
  'error',
  'guards',
  'holder',
  'id',
  'lastEvent',
  'loads',
  'matched',
  'reason',
  'resolve',
  'stage',
  'state',
  'terminal',
  'url',
  'urlAfterRedirects',
];
const ENTRY_KEYS = [
  'at',
  'code',
  'error',
  'id',
  'matchedPaths',
  'reason',
  'route',
  'shouldActivate',
  'type',
  'url',
  'urlAfterRedirects',
];
const LOAD_KEYS = ['durationMs', 'endedAt', 'open', 'route', 'startedAt'];
const HOLDER_KEYS = ['absence', 'state'];
const GUARDS_KEYS = ['absence', 'shouldActivate', 'state'];
const RESOLVE_KEYS = ['absence', 'state'];
const MATCHED_KEYS = ['path', 'paths', 'wildcard'];

// ---------------------------------------------------------------- the record ----

function numberOrNull(value) {
  return typeof value === 'number' ? value : null;
}

function textOrNull(value) {
  return typeof value === 'string' ? value : null;
}

/**
 * The chain a recorded payload carried: a router state snapshot's own `matchedChain` in order — the
 * recording keeps both forms, `{path}` objects and bare paths, in one run — or a single activated
 * snapshot's own `path` where that is all the recording kept.
 */
function chainOf(payload) {
  if (payload.state && Array.isArray(payload.state.matchedChain)) {
    return payload.state.matchedChain.map((node) => {
      if (typeof node === 'string') return node;
      return node && typeof node.path === 'string' ? node.path : null;
    });
  }
  if (payload.snapshot && typeof payload.snapshot.path === 'string') {
    return [payload.snapshot.path];
  }
  return [];
}

/**
 * One recorded event as the entry T002 publishes: the class name, the page's own receipt time, and
 * the fields the event carried — every field it did not carry is `null`, and the error is its own
 * name and message.
 */
function fromRecording(event) {
  const payload = event.payload ?? {};
  return {
    type: event.class,
    at: event.t,
    id: numberOrNull(payload.id),
    url: textOrNull(payload.url),
    urlAfterRedirects: textOrNull(payload.urlAfterRedirects),
    route:
      payload.route && typeof payload.route.path === 'string'
        ? payload.route.path
        : null,
    reason: textOrNull(payload.reason),
    code: numberOrNull(payload.code),
    error:
      payload.error === undefined || payload.error === null
        ? null
        : {
            name: textOrNull(payload.error.name),
            message: textOrNull(payload.error.message),
          },
    shouldActivate:
      typeof payload.shouldActivate === 'boolean'
        ? payload.shouldActivate
        : null,
    matchedPaths: chainOf(payload),
  };
}

/** One entry of the shape T002 publishes, from the fields this test means it to carry. */
function entry(partial) {
  return {
    type: partial.type,
    at: numberOrNull(partial.at),
    id: numberOrNull(partial.id),
    url: textOrNull(partial.url),
    urlAfterRedirects: textOrNull(partial.urlAfterRedirects),
    route: textOrNull(partial.route),
    reason: textOrNull(partial.reason),
    code: numberOrNull(partial.code),
    error: partial.error ?? null,
    shouldActivate:
      typeof partial.shouldActivate === 'boolean'
        ? partial.shouldActivate
        : null,
    matchedPaths: Array.isArray(partial.matchedPaths)
      ? partial.matchedPaths
      : [],
  };
}

/** A record as the page agent publishes it: the list of arrivals, and nothing else read. */
function recordOf(events) {
  return { routerEvents: events.map(fromRecording) };
}

/** The one recorded event of a frame that carries a class, or a failure naming it. */
function recordedEvent(events, type, id) {
  const found = events.filter(
    (event) =>
      event.class === type &&
      (id === undefined || (event.payload && event.payload.id === id)),
  );
  assert.ok(
    found.length > 0,
    `the recording carries no ${type}${id === undefined ? '' : ` for id ${id}`}`,
  );
  return found[0];
}

// ----------------------------------------------------------------- fixtures ----

/** The held navigation the recording measured: a start and a lazy load start, and no terminal. */
function heldRecord() {
  return recordOf(HELD);
}

/** A navigation that recorded nothing but its start: the held frame cut after the first event. */
function startOnlyRecord() {
  assert.equal(
    HELD[0].class,
    'NavigationStart',
    'the held frame opens on a start',
  );
  return recordOf(HELD.slice(0, 1));
}

/** The warm lazy navigation: two measured route-config intervals and a NavigationEnd. */
function warmRecord() {
  return recordOf(WARM);
}

/** The warm frame cut after one recorded class, which is where a navigation is held at that stage. */
function prefixThrough(type) {
  const index = WARM.findIndex((event) => event.class === type);
  assert.ok(index >= 0, `the warm frame carries no ${type}`);
  const prefix = WARM.slice(0, index + 1);
  assert.equal(
    prefix[prefix.length - 1].class,
    type,
    'the prefix ends on the cut',
  );
  return recordOf(prefix);
}

/** The superseded run: one navigation cancelled at 564.2 ms and its successor ended at 5119 ms. */
function supersededRecord() {
  return recordOf(SUPERSEDED);
}

/** The error terminal, measured by aborting a lazy chunk request. */
function errorRecord() {
  return recordOf(ERROR);
}

/** The same-URL skip: one NavigationSkipped and no start at all. */
function skipRecord() {
  return recordOf(SKIP);
}

/** The redirect: one navigation whose only trace of the redirect is `url` against the end route. */
function redirectRecord() {
  return recordOf(REDIRECT);
}

/**
 * A wildcard navigation, in the class sequence the recording measured for both the refused `canMatch`
 * and the unmatched URL. The sequence, the chain and the aggregate are the recording's; the id and
 * the url are the two navigations' own, which the recording's comparison named as the only paths
 * that differed between them.
 */
function wildcardRecord({ id, url }) {
  const chain = GUARD_COMPARISON.refusedMatchedChain.map((node) => node.path);
  assert.deepEqual(
    GUARD_COMPARISON.unmatchedMatchedChain.map((node) => node.path),
    chain,
    'the recording measured one chain for both the refused guard and the unmatched URL',
  );
  const at = (step) => 100 + step;
  const events = [
    entry({ type: 'NavigationStart', at: at(0), id, url }),
    entry({
      type: 'RoutesRecognized',
      at: at(1),
      id,
      url,
      urlAfterRedirects: url,
      matchedPaths: chain,
    }),
    entry({
      type: 'GuardsCheckStart',
      at: at(2),
      id,
      url,
      urlAfterRedirects: url,
      matchedPaths: chain,
    }),
    entry({ type: 'ChildActivationStart', at: at(3) }),
    entry({ type: 'ActivationStart', at: at(4) }),
    entry({
      type: 'GuardsCheckEnd',
      at: at(5),
      id,
      url,
      urlAfterRedirects: url,
      shouldActivate: GUARD_COMPARISON.refusedShouldActivate,
      matchedPaths: chain,
    }),
    entry({
      type: 'ResolveStart',
      at: at(6),
      id,
      url,
      urlAfterRedirects: url,
      matchedPaths: chain,
    }),
    entry({
      type: 'ResolveEnd',
      at: at(7),
      id,
      url,
      urlAfterRedirects: url,
      matchedPaths: chain,
    }),
    entry({ type: 'ActivationEnd', at: at(8) }),
    entry({ type: 'ChildActivationEnd', at: at(9) }),
    entry({
      type: 'NavigationEnd',
      at: at(10),
      id,
      url,
      urlAfterRedirects: url,
    }),
  ];
  assert.deepEqual(
    events.map((event) => event.type),
    GUARD_COMPARISON.refusedClassSequence,
    'the eleven classes the recording measured, in its own order',
  );
  return { routerEvents: events };
}

/** The refused `canMatch`: the portal's own manifest served with the claim list switched off. */
function refusedRecord() {
  assert.equal(GUARD_COMPARISON.eventCountEqual, true);
  return wildcardRecord({ id: 2, url: '/claim/list' });
}

/** The unmatched URL: no route matches, so the wildcard route matches it. */
function unmatchedRecord() {
  assert.equal(GUARD_COMPARISON.terminalClassEqual, true);
  return wildcardRecord({ id: 3, url: '/nowhere' });
}

/**
 * One load whose two ends carry the same recorded reading — the warm frame's own `claim` start
 * reading, used on both ends, because a measured zero is what two equal readings are and the
 * recording contains no instance of one.
 */
function measuredZeroRecord() {
  const start = recordedEvent(WARM, 'RouteConfigLoadStart');
  const reading = start.t;
  assert.equal(
    typeof reading,
    'number',
    'the recording measured the load start',
  );
  const navigationEnd = recordedEvent(WARM, 'NavigationEnd');
  return {
    routerEvents: [
      entry({
        type: 'NavigationStart',
        at: reading - 1,
        id: navigationEnd.payload.id,
        url: navigationEnd.payload.url,
      }),
      entry({
        type: 'RouteConfigLoadStart',
        at: reading,
        route: start.payload.route.path,
      }),
      entry({
        type: 'RouteConfigLoadEnd',
        at: reading,
        route: start.payload.route.path,
      }),
      entry({
        type: 'NavigationEnd',
        at: reading + 1,
        id: navigationEnd.payload.id,
        url: navigationEnd.payload.url,
        urlAfterRedirects: navigationEnd.payload.urlAfterRedirects,
      }),
    ],
  };
}

/**
 * A record that begins with a load start and holds a load end whose own route names no open load:
 * the two cases an id-less load is unattributed in. The route names are the recording's own; the
 * readings are ordinals, because the recording keeps no stream that begins at a load start.
 */
function unattributedRecord() {
  const routes = RECORDING.warm.routeConfigLoads.map((row) => row.routePath);
  assert.ok(
    routes.length >= 2,
    'the recording measured two route-config loads',
  );
  return {
    routerEvents: [
      entry({ type: 'RouteConfigLoadStart', at: 10, route: routes[0] }),
      entry({ type: 'NavigationStart', at: 20, id: 2, url: '/claim/list' }),
      entry({ type: 'RouteConfigLoadStart', at: 21, route: routes[0] }),
      entry({ type: 'RouteConfigLoadEnd', at: 30, route: routes[1] }),
    ],
  };
}

/** Every frame this suite pins, for the pins that walk them all. */
function everyRecord() {
  return [
    ['held', heldRecord()],
    ['a navigation that recorded only its start', startOnlyRecord()],
    ['warm', warmRecord()],
    ['superseded', supersededRecord()],
    ['error', errorRecord()],
    ['skip', skipRecord()],
    ['redirect', redirectRecord()],
    ['refused canMatch', refusedRecord()],
    ['unmatched URL', unmatchedRecord()],
    ['a measured zero', measuredZeroRecord()],
    ['an unattributed load', unattributedRecord()],
  ];
}

// ---------------------------------------------------------------- plumbing ----

/**
 * The standalone module: a bare context holding the source and whatever the caller puts in it. A bare
 * `node:vm` context installs no DOM and no network; the two names it does install in every realm
 * (`Date`, `console`) are handled by the guarded run below.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const api = context.angularAiNavigationNarrator;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(
    typeof api.narrateNavigation,
    'function',
    'the module publishes the join',
  );
  return { api, context };
}

function pristineApi() {
  return standalone().api;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into this realm
 * before a structural assertion reads it. It is also how every answer is cloned, so a test can never
 * mutate a fixture for the next one.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One answer, copied into this realm. */
function answerOf(api, record) {
  return clone(api.narrateNavigation(record));
}

/** One navigation of an answer, by the id the record gave it. */
function navById(answer, id) {
  const found = answer.navigations.filter((navigation) => navigation.id === id);
  assert.equal(
    found.length,
    1,
    `the answer carries one navigation with id ${id}`,
  );
  return found[0];
}

/** The keys an object carries, in the one order an assertion can compare. */
function keysOf(value) {
  return Object.keys(value).sort();
}

/** No string in `value` is one of `forbidden`, and the failure names which one was found. */
function assertNoneOf(value, forbidden, what) {
  const text = JSON.stringify(value);
  for (const [name, needle] of forbidden) {
    assert.equal(
      text.includes(needle),
      false,
      `${what} carries ${name} (${JSON.stringify(needle)}), which it must not: ${text}`,
    );
  }
}

// ------------------------------------------------------------- mutant tools ----

/**
 * A copy of the module with one anchored replacement applied. The anchor must occur exactly once, so
 * a mutation cannot silently rewrite a different branch, and the result must differ from the source,
 * so a no-op mutation is a failure rather than a green mutant.
 */
function mutant(anchor, replacement) {
  assert.ok(
    SRC.includes(anchor),
    `mutation anchor not found in extension/navigation-narrator.js — restate the bite: ${JSON.stringify(anchor)}`,
  );
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `mutation anchor must occur exactly once, found ${occurrences}: ${JSON.stringify(anchor)}`,
  );
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(mutated, SRC, 'the mutation must change the module source');
  return standalone(mutated).api;
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return failure;
}

/**
 * The four phases, per criterion. `pin` is the same function for the untouched module and for every
 * mutant; a mutation that survives it, or that reddens with a message not naming its defect, fails.
 * Returns one `mutant -> failure` line per mutation so the run prints its own evidence.
 */
function proveNonVacuous(pin, mutations) {
  // 1. Pin the untouched module on the behaviour claimed.
  pin(pristineApi());

  const caught = [];
  for (const mutation of mutations) {
    // 2. Mutate a copy of the module source and prove the copy exhibits the defect.
    const api = mutant(mutation.anchor, mutation.replacement);
    mutation.defect(api);

    // 3. Assert the pin reddens, and that the failure names the defect by string.
    const failure = reddens(() => pin(api), mutation.what);
    assert.match(
      failure.message,
      mutation.message,
      `${mutation.what} must redden naming the defect ${mutation.message}: ${failure.message}`,
    );
    caught.push(`${mutation.what} -> ${failure.message.split('\n')[0]}`);
  }

  // 4. Restore: the untouched module still satisfies the pin.
  pin(pristineApi());
  return caught;
}

// ------------------------------------------------------------------- the pins ----

/**
 * E1, held out. Each of the four terminal classes renders as itself, with only the fields that class
 * carried: `code` and `reason` where the class recorded them, the error's own name and message where
 * it recorded one, and an end route only where the event carried it.
 */
function pinEachTerminalAsItself(api) {
  const cases = [
    {
      what: 'a completed lazy navigation',
      record: warmRecord(),
      id: RECORDING.warm.terminal.payload.id,
      type: 'NavigationEnd',
    },
    {
      what: 'a redirect',
      record: redirectRecord(),
      id: RECORDING.terminals.redirect.terminal.payload.id,
      type: 'NavigationEnd',
    },
    {
      what: 'a superseded navigation',
      record: supersededRecord(),
      id: RECORDING.superseded.cancel.payload.id,
      type: 'NavigationCancel',
    },
    {
      what: 'an aborted chunk',
      record: errorRecord(),
      id: RECORDING.terminals.error.event.payload.id,
      type: 'NavigationError',
    },
    {
      what: 'a same-URL skip',
      record: skipRecord(),
      id: RECORDING.terminals.skip.event.payload.id,
      type: 'NavigationSkipped',
    },
  ];

  for (const one of cases) {
    const answer = answerOf(api, one.record);
    assert.equal(
      answer.state,
      'ended',
      `E1 ${one.what} answers a record that ended`,
    );
    const navigation = navById(answer, one.id);
    assert.equal(navigation.state, 'ended', `E1 ${one.what} answers ended`);
    assert.equal(
      navigation.terminal,
      one.type,
      'E1 each terminal is the class the record carries',
    );

    // The fields reported are exactly the fields that class's own payload carries, read from the
    // recording's per-class key set rather than from this file's opinion.
    const keys = CLASS_KEYS.get(one.type);
    assert.ok(keys, `the recording enumerates no ${one.type}`);
    assert.equal(
      navigation.code !== null,
      keys.includes('code'),
      'E1 only the fields the terminal class recorded are reported',
    );
    assert.equal(
      navigation.reason !== null,
      keys.includes('reason'),
      'E1 only the fields the terminal class recorded are reported',
    );
    assert.equal(
      navigation.error !== null,
      keys.includes('error'),
      'E1 only the fields the terminal class recorded are reported',
    );
    assert.equal(
      navigation.urlAfterRedirects !== null,
      keys.includes('urlAfterRedirects'),
      'E1 only the fields the terminal class recorded are reported',
    );
    assert.equal(
      navigation.stage,
      null,
      'E1 a navigation with a terminal event names no stage',
    );
    assert.deepEqual(
      keysOf(navigation),
      NAVIGATION_KEYS,
      'E1 a navigation carries the answer fields and no invented cause',
    );
  }

  // The three recorded values, verbatim: a cancel's code and reason, an error's own name and
  // message, and a skip's code and reason.
  const cancel = recordedEvent(SUPERSEDED, 'NavigationCancel');
  const cancelled = navById(
    answerOf(api, supersededRecord()),
    cancel.payload.id,
  );
  assert.equal(cancelled.code, cancel.payload.code, 'E1 the cancel own code');
  assert.equal(
    cancelled.reason,
    cancel.payload.reason,
    'E1 the cancel own reason',
  );

  const error = recordedEvent(ERROR, 'NavigationError');
  const failed = navById(answerOf(api, errorRecord()), error.payload.id);
  assert.deepEqual(
    failed.error,
    { name: error.payload.error.name, message: error.payload.error.message },
    'E1 the error own name and message, and nothing of the error object',
  );

  const skip = recordedEvent(SKIP, 'NavigationSkipped');
  const skipped = navById(answerOf(api, skipRecord()), skip.payload.id);
  assert.equal(skipped.code, skip.payload.code, 'E1 the skip own code');
  assert.equal(skipped.reason, skip.payload.reason, 'E1 the skip own reason');
  return [cancelled, failed, skipped];
}

/**
 * E2, held out. The end route is the terminal event's own `urlAfterRedirects`, and appears only
 * where that event carried it — a cancel or an error record names no end route at all, even where
 * another navigation in the same record names one.
 */
function pinEndRouteOnlyWhereTheTerminalCarriedIt(api) {
  const redirect = answerOf(api, redirectRecord());
  const navigation = redirect.navigations[0];
  const terminal = RECORDING.terminals.redirect.terminal.payload;
  assert.equal(
    navigation.url,
    terminal.url,
    'E2 the heading route is the recorded url',
  );
  assert.equal(
    navigation.urlAfterRedirects,
    terminal.urlAfterRedirects,
    'E2 the end route is the terminal own field',
  );
  assert.notEqual(
    navigation.url,
    navigation.urlAfterRedirects,
    'E2 the redirect differs from the heading route, so the two fields are not one',
  );

  const superseded = answerOf(api, supersededRecord());
  const abandoned = navById(superseded, RECORDING.superseded.cancel.payload.id);
  const successor = navById(superseded, RECORDING.superseded.successor.id);
  assert.equal(
    abandoned.url,
    RECORDING.superseded.cancel.payload.url,
    'E2 the abandoned navigation heading route',
  );
  assert.equal(
    abandoned.urlAfterRedirects,
    null,
    'E2 the end route is named only where the terminal event carried it',
  );
  assert.equal(
    successor.urlAfterRedirects,
    recordedEvent(
      SUPERSEDED,
      'NavigationEnd',
      RECORDING.superseded.successor.id,
    ).payload.urlAfterRedirects,
    'E2 the successor own end route, in the same record',
  );

  for (const [what, record, id] of [
    [
      'an error record',
      errorRecord(),
      RECORDING.terminals.error.event.payload.id,
    ],
    ['a skip record', skipRecord(), RECORDING.terminals.skip.event.payload.id],
  ]) {
    assert.equal(
      navById(answerOf(api, record), id).urlAfterRedirects,
      null,
      `E2 ${what} names no end route`,
    );
  }
  return [navigation, abandoned, successor];
}

/**
 * E3, held out. A navigation that recorded a start and no terminal event answers open at the stage
 * of its last recorded event and never as the reason it is open, and a record carrying no navigation
 * answers the absence rather than a zero that reads as success.
 */
function pinOpenStageAndTheEmptyAbsence(api) {
  const answer = answerOf(api, heldRecord());
  assert.equal(
    answer.state,
    'open',
    'E3 a navigation with no terminal event answers open',
  );
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'E3 the answer carries its five fields',
  );
  assert.equal(
    answer.absence,
    null,
    'E3 a record holding a navigation names no record-level absence',
  );
  assert.equal(answer.navigations.length, 1, 'E3 one navigation, as recorded');
  const open = answer.navigations[0];
  assert.deepEqual(
    keysOf(open),
    NAVIGATION_KEYS,
    'E3 a navigation carries the answer fields',
  );
  assert.equal(open.id, HELD[0].payload.id, 'E3 the navigation own id');
  assert.equal(open.url, HELD[0].payload.url, 'E3 the heading route');
  assert.equal(open.terminal, null, 'E3 no terminal was recorded');
  assert.equal(
    open.lastEvent,
    'RouteConfigLoadStart',
    'E3 the last recorded event own class',
  );
  assert.equal(
    open.stage,
    'route-config-load',
    'E3 the stage is the stage of the last recorded event',
  );
  assert.equal(
    open.reason,
    null,
    'E3 the stage is never presented as the reason the navigation is open',
  );
  assert.equal(open.code, null, 'E3 an open navigation carries no code');
  assert.equal(open.error, null, 'E3 an open navigation carries no error');
  assert.equal(
    open.urlAfterRedirects,
    null,
    'E3 an open navigation names no end route',
  );

  // A start and nothing else: the stage is absent, named as absent, and the class is still named.
  const startOnly = answerOf(api, startOnlyRecord());
  assert.equal(startOnly.state, 'open', 'E3 a record of one start is open');
  const alone = startOnly.navigations[0];
  assert.equal(
    alone.lastEvent,
    'NavigationStart',
    'E3 the last event is still the class it recorded',
  );
  assert.equal(
    alone.stage,
    null,
    'E3 a last event that maps to no stage answers the stage as absent',
  );
  assert.equal(
    alone.absence,
    'no-stage-recorded',
    'E3 the absent stage is named rather than guessed',
  );

  // An empty record answers the absence, not a zero.
  const empty = answerOf(api, { routerEvents: [] });
  assert.equal(
    empty.state,
    'cannot-tell',
    'E3 a record carrying no navigation answers the absence',
  );
  assert.equal(
    empty.absence,
    'no-navigation-recorded',
    'E3 the absence names what the record lacks',
  );
  assert.deepEqual(
    empty.navigations,
    [],
    'E3 no navigation is invented to fill an empty record',
  );
  assert.deepEqual(empty.unattributed, [], 'E3 no load is invented either');

  // A record the module cannot read is a different absence from an empty one.
  for (const [what, unreadable] of [
    ['no record at all', null],
    ['a record that is not an object', 'record'],
    ['a record with no list', { cycleId: 1 }],
    ['a record whose list is not a list', { routerEvents: 'arrivals' }],
  ]) {
    const unread = answerOf(api, unreadable);
    assert.equal(unread.state, 'cannot-tell', `E3 ${what} is cannot-tell`);
    assert.equal(
      unread.absence,
      'record-unreadable',
      `E3 ${what} names the absence it forced`,
    );
    assert.deepEqual(
      unread.navigations,
      [],
      `E3 ${what} carries no navigation`,
    );
  }
  return [open, alone, empty];
}

/**
 * E4, held out. Every stage word the join answers is the class of an event the record contains, every
 * recorded class maps to the word this suite derives from the recording, and no other word appears.
 */
function pinStageWordsComeFromRecordedClasses(api) {
  const held = answerOf(api, heldRecord()).navigations[0];
  assert.ok(
    STAGE_WORDS.includes(held.stage),
    'E4 every stage word the join answers is one the record names',
  );
  assert.equal(
    held.stage,
    'route-config-load',
    'E4 the stage is the class of the last recorded event',
  );

  // The four stage words, each from a frame held at that stage: the prefixes are the recorded stream
  // cut where the hold would be, so every last event is one the recording measured.
  const seen = new Set();
  for (const [what, record, expected, last] of [
    ['a lazy load', heldRecord(), 'route-config-load', 'RouteConfigLoadStart'],
    [
      'a guard check',
      prefixThrough('GuardsCheckStart'),
      'guards-check',
      'GuardsCheckStart',
    ],
    ['a resolve stage', prefixThrough('ResolveEnd'), 'resolve', 'ResolveEnd'],
    [
      'an activation',
      prefixThrough('ActivationEnd'),
      'activation',
      'ActivationEnd',
    ],
  ]) {
    const answer = answerOf(api, record);
    const open = answer.navigations.filter(
      (navigation) => navigation.state === 'open',
    );
    assert.equal(open.length, 1, `E4 ${what} leaves one navigation open`);
    assert.equal(
      open[0].lastEvent,
      last,
      `E4 ${what} names the class it recorded last`,
    );
    assert.ok(
      STAGE_WORDS.includes(open[0].stage),
      'E4 every stage word the join answers is one the record names',
    );
    assert.equal(
      open[0].stage,
      expected,
      'E4 the stage is the class of the last recorded event',
    );
    seen.add(open[0].stage);
  }
  assert.deepEqual(
    [...seen].sort(),
    STAGE_WORDS,
    'E4 all four stage words, and only those four',
  );

  // Every open navigation of every measured frame maps through the recorded classes, and no
  // completed navigation names a stage at all.
  for (const [what, record] of everyRecord()) {
    for (const navigation of answerOf(api, record).navigations) {
      if (navigation.state === 'open') {
        assert.ok(
          STAGE_WORDS.includes(navigation.stage) ||
            (navigation.stage === null &&
              !STAGE_OF_CLASS.has(navigation.lastEvent)),
          `E4 ${what} answers a stage word only where a recorded class names one: ${JSON.stringify(navigation)}`,
        );
        assert.equal(
          navigation.stage,
          STAGE_OF_CLASS.get(navigation.lastEvent) ?? null,
          'E4 the stage is the class of the last recorded event',
        );
        continue;
      }
      assert.equal(
        navigation.stage,
        null,
        'E4 a navigation with a terminal event names no stage',
      );
    }
  }
  return [...seen];
}

/**
 * E5, held out. An open navigation's holder answers cannot-tell with `no-holder-recorded` and carries
 * no guard, chunk, task or resolver name — because no payload and no `currentNavigation()` field
 * carries one.
 */
function pinHolderIsNotRecorded(api) {
  const recorded = RECORDING.absences['no-holder-recorded'];
  assert.deepEqual(
    recorded.payloadFieldsMatchingAWord,
    [],
    'the recording measured no payload field naming a holder',
  );
  assert.deepEqual(
    recorded.currentNavigationFieldsMatchingAWord,
    [],
    'the recording measured no currentNavigation field naming a holder',
  );

  const answer = answerOf(api, heldRecord());
  const open = answer.navigations[0];
  assert.deepEqual(
    keysOf(open.holder),
    HOLDER_KEYS,
    'E5 the holder carries the verdict and the named absence and nothing else',
  );
  assert.equal(open.holder.state, 'cannot-tell', 'E5 the holder verdict');
  assert.equal(
    open.holder.absence,
    'no-holder-recorded',
    'E5 the holder absence is the one the page measured',
  );

  // The words the recording checked, read from the recording: the holder names none of them, and
  // the one that is part of the absence's own name is not a name the holder invented.
  const text = JSON.stringify(open.holder);
  const words = recorded.wordsChecked;
  assert.ok(
    words.length >= 4,
    'the recording checked at least four holder words',
  );
  for (const word of words) {
    if (open.holder.absence.includes(word)) continue;
    assert.equal(
      text.includes(word),
      false,
      `E5 the holder carries no ${word} name: ${text}`,
    );
  }

  // Nothing in the navigation's holder cell is a name of anything: no key a reader could take for a
  // guard, a resolver, a chunk or a task.
  for (const key of ['guard', 'guards', 'resolver', 'chunk', 'task', 'name']) {
    assert.equal(
      key in open.holder,
      false,
      `E5 the holder carries no ${key} field`,
    );
  }
  return open.holder;
}

/**
 * E6, held out. A navigation whose recorded chain is the wildcard reports the wildcard match and
 * never a guard refusal: a refused `canMatch` and an unmatched URL produce the same answer apart from
 * the ids and urls the recording measured as the only difference.
 */
function pinWildcardMatchIsNeverARefusal(api) {
  const refused = answerOf(api, refusedRecord());
  const unmatched = answerOf(api, unmatchedRecord());
  const chain = GUARD_COMPARISON.refusedMatchedChain.map((node) => node.path);

  for (const [what, answer, neither] of [
    ['the refused canMatch', refused, null],
    ['the unmatched URL', unmatched, null],
  ]) {
    assert.equal(answer.state, 'ended', `E6 ${what} ended`);
    const navigation = answer.navigations[0];
    assert.equal(
      navigation.terminal,
      'NavigationEnd',
      `E6 ${what} ended as measured`,
    );
    assert.deepEqual(
      keysOf(navigation.matched),
      MATCHED_KEYS,
      'E6 the matched answer carries the chain and the leaf it ends on',
    );
    assert.equal(
      navigation.matched.path,
      '**',
      'E6 a wildcard match is reported as the wildcard match',
    );
    assert.equal(
      navigation.matched.wildcard,
      true,
      'E6 the wildcard is named as a wildcard',
    );
    assert.deepEqual(
      navigation.matched.paths,
      chain,
      'E6 the chain is the one the record carried',
    );
    assert.deepEqual(
      navigation.matched.paths,
      JSON.parse(JSON.stringify(navigation.matched.paths)),
      'E6 the chain is plain data',
    );
    assert.equal(
      navigation.reason,
      null,
      'E6 a wildcard match is reported as the match and never as a guard refusal',
    );
    assert.equal(
      navigation.holder,
      null,
      'E6 a navigation that ended is not held',
    );
    assert.equal(
      navigation.guards.shouldActivate,
      GUARD_COMPARISON.refusedShouldActivate,
      'E6 the guard aggregate is the value the record carried',
    );
    assert.equal(
      navigation.guards.absence,
      'guard-verdict-not-recorded',
      'E6 the guard verdict is the named absence',
    );
    assert.equal(neither, null);
  }

  // Nothing in either answer is a guard, a guard name or a refusal: the two are indistinguishable,
  // which is the measurement, and the answer never claims to tell them apart.
  for (const answer of [refused, unmatched]) {
    assertNoneOf(
      answer,
      [
        ['a guard module name', 'canMatch'],
        ['a guard module name', 'canActivate'],
        ['a refusal', 'refused'],
        ['a refusal', 'refusal'],
        ['a refusal', 'denied'],
        [
          'the fixture guard name',
          RECORDING.guards.fixture.canActivateNames[0],
        ],
      ],
      'E6 the wildcard answer',
    );
  }

  // The same answer twice, apart from the two navigations' own ids and urls — the paths the
  // recording measured as the only difference between the refused run and the unmatched one.
  const normalise = (answer) =>
    answer.navigations.map((navigation) => ({
      ...navigation,
      id: 0,
      url: '/',
      urlAfterRedirects: '/',
      matched: { ...navigation.matched, paths: [] },
    }));
  assert.deepEqual(
    normalise(refused),
    normalise(unmatched),
    'E6 a refused canMatch and an unmatched URL are the same answer',
  );
  return refused;
}

/**
 * E7, held out. `shouldActivate` renders as the aggregate field it is and is never attributed to a
 * named guard, and a resolve stage on a configuration that declares no resolver answers
 * `no-resolver-configured` rather than naming one.
 */
function pinTheAggregateAndTheAbsentResolver(api) {
  const guardAbsence = RECORDING.absences['guard-verdict-not-recorded'];
  assert.equal(
    guardAbsence.guardFieldsAreAggregateOnly,
    true,
    'the recording measured the guard payload as aggregate-only',
  );

  const answer = answerOf(api, warmRecord());
  const navigation = answer.navigations[0];
  assert.deepEqual(
    keysOf(navigation.guards),
    GUARDS_KEYS,
    'E7 the guard answer carries the aggregate and no guard name',
  );
  assert.equal(navigation.guards.state, 'cannot-tell', 'E7 the guard verdict');
  assert.equal(
    navigation.guards.absence,
    'guard-verdict-not-recorded',
    'E7 the guard absence is the one the page measured',
  );
  assert.equal(
    navigation.guards.shouldActivate,
    guardAbsence.shouldActivateValue,
    'E7 the aggregate is reported as the aggregate it is',
  );
  assert.equal(
    typeof navigation.guards.shouldActivate,
    'boolean',
    'E7 the aggregate is a boolean, not a verdict',
  );

  // A resolve stage on a record whose configuration declares no resolver: the two targets' walks are
  // the measurement, and the portal emitted the stage anyway.
  const resolver = RECORDING.absences['no-resolver-configured'];
  assert.equal(
    resolver.portal.resolveKeysTotal,
    0,
    'the portal declares no resolver',
  );
  assert.equal(
    resolver.fixture.resolveKeysTotal,
    0,
    'the fixture declares no resolver',
  );
  assert.ok(
    resolver.resolveStageObservedAnyway,
    'the portal emitted a resolve stage despite declaring no resolver',
  );
  const resolveEvents = WARM.filter(
    (event) => event.class === 'ResolveStart' || event.class === 'ResolveEnd',
  );
  assert.equal(
    resolveEvents.length,
    2,
    'the warm frame carries both resolve events, so the absence is not vacuous',
  );
  assert.deepEqual(
    keysOf(navigation.resolve),
    RESOLVE_KEYS,
    'E7 the resolve stage answers the named absence and names no resolver',
  );
  assert.equal(
    navigation.resolve.state,
    'cannot-tell',
    'E7 the resolve verdict',
  );
  assert.equal(
    navigation.resolve.absence,
    'no-resolver-configured',
    'E7 the resolve absence is the configuration the recording measured',
  );

  for (const inspected of [answer, answerOf(api, refusedRecord())]) {
    assertNoneOf(
      inspected,
      [
        ['a guard name', 'canMatch'],
        ['a guard name', 'canActivate'],
        [
          'the fixture guard name',
          RECORDING.guards.fixture.canActivateNames[0],
        ],
      ],
      'E7 the answer',
    );
  }
  return navigation.guards;
}

/**
 * E8, held out. A navigation that completed answers ended with the interval its own two route-config
 * events measured — a measured zero included — and is never reported open or held, however long its
 * load interval was.
 */
function pinCompletedIsNeverHeld(api) {
  const answer = answerOf(api, warmRecord());
  assert.equal(
    answer.state,
    'ended',
    'E8 a record whose navigation ended answers ended',
  );
  const navigation = answer.navigations[0];
  assert.equal(
    navigation.state,
    'ended',
    'E8 a navigation with a terminal event is ended',
  );
  assert.equal(
    navigation.terminal,
    'NavigationEnd',
    'E8 the terminal it recorded',
  );
  assert.equal(
    navigation.holder,
    null,
    'E8 a completed navigation is never reported as held',
  );
  assert.equal(
    navigation.stage,
    null,
    'E8 a completed navigation names no stage',
  );
  assert.equal(
    navigation.absence,
    null,
    'E8 a completed navigation names no absence',
  );

  const recorded = RECORDING.warm.routeConfigLoads;
  assert.equal(
    navigation.loads.length,
    recorded.length,
    'E8 one load per route-config start the record carries',
  );
  for (let index = 0; index < recorded.length; index += 1) {
    const load = navigation.loads[index];
    assert.deepEqual(
      keysOf(load),
      LOAD_KEYS,
      'E8 a load carries its own interval and no id',
    );
    assert.equal(
      load.route,
      recorded[index].routePath,
      'E8 the load own route',
    );
    assert.equal(
      load.startedAt,
      recorded[index].startAt,
      'E8 the load own start',
    );
    assert.equal(load.endedAt, recorded[index].endAt, 'E8 the load own end');
    assert.equal(load.open, false, 'E8 the load the record closed is closed');
    assert.equal(
      load.durationMs,
      load.endedAt - load.startedAt,
      'E8 the interval is the difference the two recorded times measure',
    );
    assert.equal(
      Math.round(load.durationMs * 10) / 10,
      recorded[index].intervalMs,
      'E8 the interval is the one the recording measured',
    );
  }

  // A measured zero is a measured zero, and the navigation that measured it still ended.
  const zero = answerOf(api, measuredZeroRecord());
  assert.equal(zero.state, 'ended', 'E8 the zero-interval navigation ended');
  const zeroLoad = zero.navigations[0].loads[0];
  assert.equal(
    zeroLoad.durationMs,
    0,
    'E8 a measured zero stays a measured zero',
  );
  assert.equal(
    typeof zeroLoad.durationMs,
    'number',
    'E8 the zero is a number, never a missing interval',
  );
  assert.equal(zeroLoad.open, false, 'E8 the load is closed');
  assert.equal(
    zeroLoad.startedAt,
    zeroLoad.endedAt,
    'E8 both ends carry the one recorded reading',
  );
  return [navigation, zeroLoad];
}

/**
 * E9, held out. A route-config load start never acquires an id, and a load end closes the load its own
 * start opened, on the navigation that start belonged to — so a superseded navigation's late load end
 * is never attributed to its successor.
 */
function pinLoadsAreAttributedByRouteAndStart(api) {
  const ordering = RECORDING.superseded.ordering;
  assert.equal(
    ordering.abandonedLoadEndIsAfterItsOwnCancel,
    true,
    'the recording measured the abandoned load end after its own cancel',
  );
  assert.equal(
    ordering.abandonedLoadEndIsBeforeTheSuccessorLoadEnd,
    true,
    'the recording measured the abandoned load end before the successor own',
  );

  // The recording's own derived table is arrival-paired: its `contract` row ends on the abandoned
  // navigation's load end. That is the defect this pin exists for, quoted from the recording.
  const rows = RECORDING.superseded.routeConfigLoads;
  const contractRow = rows.filter((row) => row.routePath === 'contract')[0];
  assert.equal(
    contractRow.endAt,
    ordering.abandonedLoadEndAt,
    'the recording arrival-paired table hands the abandoned load end to the successor route',
  );

  const answer = answerOf(api, supersededRecord());
  const abandoned = navById(answer, RECORDING.superseded.cancel.payload.id);
  const successor = navById(answer, RECORDING.superseded.successor.id);
  assert.equal(abandoned.state, 'ended', 'E9 the superseded navigation ended');
  assert.equal(abandoned.loads.length, 1, 'E9 it opened one load');
  assert.equal(
    abandoned.loads[0].route,
    'claim',
    'E9 the abandoned navigation keeps the load its own start opened',
  );
  assert.equal(
    abandoned.loads[0].startedAt,
    rows.filter((row) => row.routePath === 'claim')[0].startAt,
    'E9 the load own recorded start',
  );
  assert.equal(
    abandoned.loads[0].endedAt,
    ordering.abandonedLoadEndAt,
    'E9 the late load end closes the load its own start opened',
  );
  assert.equal(
    abandoned.loads[0].open,
    false,
    'E9 the load the record closed is closed',
  );

  const contract = successor.loads.filter(
    (load) => load.route === 'contract',
  )[0];
  assert.ok(contract, 'E9 the successor owns the contract load');
  assert.equal(
    contract.endedAt,
    ordering.successorLoadEndAt,
    'E9 the successor load end is never the abandoned navigation own',
  );
  assert.equal(
    Math.round(contract.durationMs * 10) / 10,
    Math.round((ordering.successorLoadEndAt - contract.startedAt) * 10) / 10,
    'E9 the successor interval is its own two recorded times',
  );

  // No load ever acquires an id, in any frame: the two route-config classes carry none, and a load
  // row has no id field at all.
  for (const [what, record] of everyRecord()) {
    for (const navigation of answerOf(api, record).navigations) {
      for (const load of navigation.loads) {
        assert.deepEqual(
          keysOf(load),
          LOAD_KEYS,
          'E9 a route-config load carries no id at all',
        );
        assert.equal(
          'id' in load,
          false,
          `E9 no load in ${what} acquires a navigation id`,
        );
      }
    }
  }

  // A load start with no navigation in flight, and a load end whose own route names no open load,
  // are reported by kind and route — never attached to a navigation that did not open them.
  const loose = answerOf(api, unattributedRecord());
  assert.deepEqual(
    loose.unattributed,
    [
      {
        kind: 'RouteConfigLoadStart',
        route: RECORDING.warm.routeConfigLoads[0].routePath,
      },
      {
        kind: 'RouteConfigLoadEnd',
        route: RECORDING.warm.routeConfigLoads[1].routePath,
      },
    ],
    'E9 an id-less load with no navigation or no start is reported by kind and route',
  );
  assert.equal(loose.navigations.length, 1, 'E9 one navigation in that record');
  assert.equal(
    loose.navigations[0].loads.length,
    1,
    'E9 only the load its own navigation opened',
  );
  assert.equal(
    loose.navigations[0].loads[0].open,
    true,
    'E9 the load no end named stays open, with no duration',
  );
  assert.equal(loose.navigations[0].loads[0].durationMs, null);
  return [abandoned, successor];
}

// -------------------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('the recording carries the classes, terminals, ordering and absences the pins rest on', () => {
    assert.equal(RECORDING.schema, 'm041-navigation/v1');
    assert.equal(RECORDING.events.enumerated, 16);
    assert.equal(RECORDING.events.classes.length, 16);

    // The four terminals and the fields each one carries.
    for (const type of TERMINAL_CLASSES) {
      const keys = CLASS_KEYS.get(type);
      assert.ok(keys, `the recording enumerates no ${type}`);
      assert.deepEqual(
        keys.includes('urlAfterRedirects'),
        type === 'NavigationEnd',
        `only NavigationEnd carries an end route: ${type} ${JSON.stringify(keys)}`,
      );
    }
    assert.deepEqual(CLASS_KEYS.get('NavigationCancel'), [
      'code',
      'id',
      'reason',
      'type',
      'url',
    ]);
    assert.deepEqual(CLASS_KEYS.get('NavigationError'), [
      'error',
      'id',
      'target',
      'type',
      'url',
    ]);

    // The two route-config classes carry no id at all, which is what E9 is written on.
    for (const type of ['RouteConfigLoadStart', 'RouteConfigLoadEnd']) {
      assert.deepEqual(
        CLASS_KEYS.get(type),
        ['route', 'type'],
        `${type} carries a route and a type and no id`,
      );
    }

    // Every class the stage table names is a class the recording enumerated.
    for (const name of STAGE_OF_CLASS.keys()) {
      assert.ok(
        CLASS_KEYS.has(name),
        `the stage table names ${name}, which the recording does not enumerate`,
      );
    }
    for (const type of TERMINAL_CLASSES) {
      assert.equal(
        STAGE_OF_CLASS.has(type),
        false,
        `${type} is a terminal and names no stage`,
      );
    }

    // The held navigation: a start and a stage, no terminal, and no field naming a holder.
    assert.deepEqual(
      HELD.map((event) => event.class),
      ['NavigationStart', 'RouteConfigLoadStart'],
      'the held frame carries a start and a load start',
    );
    assert.equal(RECORDING.held.inFlight.hasTerminalEvent, false);
    assert.equal(RECORDING.held.stillInFlightLater.hasTerminalEvent, false);
    const words = RECORDING.absences['no-holder-recorded'].wordsChecked;
    assert.deepEqual(words, ['guard', 'resolver', 'chunk', 'task', 'holder']);
    assert.equal(
      RECORDING.absences['no-holder-recorded'].currentNavigationFields.length,
      12,
      'the ten fields at the hold plus the two the chunk adds later',
    );

    // The superseded ordering: the abandoned load end arrives after its own cancel and before the
    // successor's own.
    const ordering = RECORDING.superseded.ordering;
    assert.equal(ordering.abandonedLoadEndAt, 1756.3);
    assert.equal(ordering.successorLoadEndAt, 2071.1);
    assert.equal(ordering.cancelToAbandonedLoadEndMs, 1192.1);
    assert.equal(ordering.abandonedLoadEndToSuccessorLoadEndMs, 314.8);
    assert.match(
      RECORDING.superseded.attribution,
      /by route\.path .* never by position/,
    );

    // The warm intervals, and the terminal that followed them.
    assert.deepEqual(
      RECORDING.warm.routeConfigLoads.map((row) => [
        row.routePath,
        row.intervalMs,
      ]),
      [
        ['claim', 15.6],
        ['list', 37.6],
      ],
    );

    // The three absences, each with its own verdict, and the two configurations that measured the
    // resolver one.
    for (const name of [
      'no-holder-recorded',
      'guard-verdict-not-recorded',
      'no-resolver-configured',
    ]) {
      assert.equal(
        RECORDING.absences[name].named,
        name,
        `the recording names the ${name} absence`,
      );
      assert.equal(RECORDING.absences[name].verdict, 'cannot-tell');
    }
    assert.equal(RECORDING.guards.portal.canActivate, 0);
    assert.deepEqual(RECORDING.guards.fixture.canActivateNames, [
      'redirectGuard',
    ]);

    // A refused canMatch and an unmatched URL are the same eleven events and the same key sets.
    assert.equal(GUARD_COMPARISON.eventCountEqual, true);
    assert.equal(GUARD_COMPARISON.classSequenceEqual, true);
    assert.equal(GUARD_COMPARISON.keySequenceEqual, true);
    assert.equal(GUARD_COMPARISON.shouldActivateEqual, true);
    assert.equal(GUARD_COMPARISON.hasNavigationCancelInEither, false);
    assert.deepEqual(GUARD_COMPARISON.refusedClassSequence, [
      'NavigationStart',
      'RoutesRecognized',
      'GuardsCheckStart',
      'ChildActivationStart',
      'ActivationStart',
      'GuardsCheckEnd',
      'ResolveStart',
      'ResolveEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'NavigationEnd',
    ]);

    // The entry shape this suite feeds the join is the one T002 publishes.
    for (const [what, record] of everyRecord()) {
      for (const carried of record.routerEvents) {
        assert.deepEqual(
          keysOf(carried),
          ENTRY_KEYS,
          `every entry of ${what} carries the one published shape`,
        );
      }
    }

    console.log(
      `navigation-narrator measurement: ${CLASS_KEYS.size} classes; terminals ${TERMINAL_CLASSES.join('/')}; ` +
        `held ${HELD.length} events with no terminal; abandoned load end ${ordering.abandonedLoadEndAt} ms ` +
        `(${ordering.cancelToAbandonedLoadEndMs} ms after its own cancel, ${ordering.abandonedLoadEndToSuccessorLoadEndMs} ms ` +
        `before the successor at ${ordering.successorLoadEndAt} ms); warm intervals ${RECORDING.warm.routeConfigLoads
          .map((row) => `${row.routePath} ${row.intervalMs} ms`)
          .join(', ')}; three absences with verdict cannot-tell`,
    );
  });
});

// -------------------------------------------------------------------------- purity ----

const HOST_GLOBALS = [
  'document',
  'window',
  'console',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/** A global that throws when read, called or constructed, naming itself in the error. */
function tripwire(name) {
  const reached = () => {
    throw new Error(`the module reached for ${name}`);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/** Runs the join inside a context where every host global is a trap. */
function guarded(source, record) {
  const sandbox = { __record: record };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context } = standalone(source, sandbox);
  return clone(
    runInContext(
      'angularAiNavigationNarrator.narrateNavigation(__record)',
      context,
    ),
  );
}

describe('purity', () => {
  it('loads bare, publishes the join and the vocabulary, and answers with every host global a trap', () => {
    const { api, context } = standalone();
    for (const name of [
      'document',
      'window',
      'performance',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
    ]) {
      assert.equal(
        runInContext(`typeof ${name}`, context),
        'undefined',
        `the module must not run with a ${name} in scope`,
      );
    }

    // The published constants are the vocabulary the module emits, so a caller compares words and
    // not prose.
    assert.equal(api.ENDED, 'ended');
    assert.equal(api.OPEN, 'open');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.ROUTE_CONFIG_LOAD, 'route-config-load');
    assert.equal(api.GUARDS_CHECK, 'guards-check');
    assert.equal(api.RESOLVE, 'resolve');
    assert.equal(api.ACTIVATION, 'activation');
    assert.equal(api.NO_HOLDER_RECORDED, 'no-holder-recorded');
    assert.equal(api.GUARD_VERDICT_NOT_RECORDED, 'guard-verdict-not-recorded');
    assert.equal(api.NO_RESOLVER_CONFIGURED, 'no-resolver-configured');
    assert.equal(api.NO_STAGE_RECORDED, 'no-stage-recorded');
    assert.equal(api.NO_NAVIGATION_RECORDED, 'no-navigation-recorded');
    assert.equal(api.RECORD_UNREADABLE, 'record-unreadable');

    // The traps are armed, and proven armed before anything is asserted through them.
    const traps = createContext({});
    for (const name of HOST_GLOBALS) traps[name] = tripwire(name);
    assert.throws(
      () => runInContext('Date.now()', traps),
      /the module reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('console.log("x")', traps),
      /the module reached for console/,
      'the console guard must bite, or the guard is decoration',
    );

    const answered = guarded(SRC, heldRecord());
    assert.equal(
      answered.state,
      'open',
      'the join answers the held frame while every host global in scope is a trap',
    );
    assert.equal(
      answered.navigations[0].stage,
      'route-config-load',
      'the stage under the traps is the one the record names',
    );
    console.log(`navigation-narrator guarded: ${JSON.stringify(answered)}`);
  });
});

// ------------------------------------------------ E1: each terminal as itself ----

describe('E1 — each terminal class renders as itself and only with its own fields', () => {
  it('reports the class the record carries and no cause beyond it', () => {
    const caught = proveNonVacuous(pinEachTerminalAsItself, [
      {
        what: 'M1 every terminal is reported as NavigationEnd',
        anchor: '    navigation.terminal = entry.type;',
        replacement: "    navigation.terminal = 'NavigationEnd';",
        message: /E1 each terminal is the class the record carries/,
        defect(api) {
          const answer = answerOf(api, supersededRecord());
          assert.equal(
            navById(answer, RECORDING.superseded.cancel.payload.id).terminal,
            'NavigationEnd',
            'the mutant renders a cancelled navigation as a completed one',
          );
        },
      },
      {
        what: 'M2 a terminal reports a code its own class never carried',
        anchor: '    navigation.code = entry.code;',
        replacement:
          '    navigation.code = entry.code === null ? 0 : entry.code;',
        message: /E1 only the fields the terminal class recorded are reported/,
        defect(api) {
          const answer = answerOf(api, warmRecord());
          assert.equal(
            answer.navigations[0].code,
            0,
            'the mutant gives a NavigationEnd a code no NavigationEnd carries',
          );
        },
      },
    ]);
    console.log(`E1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------ E2: the end route ----

describe('E2 — the end route is named only where the terminal event carried it', () => {
  it('names the terminal own urlAfterRedirects and no end route for a cancel or an error', () => {
    const caught = proveNonVacuous(pinEndRouteOnlyWhereTheTerminalCarriedIt, [
      {
        what: 'M3 the end route is filled from the heading route',
        anchor: '    navigation.urlAfterRedirects = entry.urlAfterRedirects;',
        replacement:
          '    navigation.urlAfterRedirects = entry.urlAfterRedirects || entry.url;',
        message:
          /E2 the end route is named only where the terminal event carried it/,
        defect(api) {
          const answer = answerOf(api, supersededRecord());
          assert.equal(
            navById(answer, RECORDING.superseded.cancel.payload.id)
              .urlAfterRedirects,
            RECORDING.superseded.cancel.payload.url,
            'the mutant reports a destination the router never stated',
          );
        },
      },
    ]);
    console.log(`E2 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------ E3: open stage and absence ----

describe('E3 — an open navigation sits at its stage and an empty record answers the absence', () => {
  it('names the stage, never the reason, and never a zero for an empty record', () => {
    const caught = proveNonVacuous(pinOpenStageAndTheEmptyAbsence, [
      {
        what: 'M4 the stage is presented as the reason the navigation is open',
        anchor: '      reason: navigation.reason,',
        replacement: '      reason: open ? stage : navigation.reason,',
        message:
          /E3 the stage is never presented as the reason the navigation is open/,
        defect(api) {
          const answer = answerOf(api, heldRecord());
          assert.equal(
            answer.navigations[0].reason,
            'route-config-load',
            'the mutant answers the stage as the reason',
          );
        },
      },
      {
        what: 'M5 an empty record answers a zero rather than the absence',
        anchor:
          '    if (navigations.length === 0) {\n' +
          '      return answer(\n' +
          '        CANNOT_TELL,\n' +
          '        NO_NAVIGATION_RECORDED,\n' +
          '        [],\n' +
          '        unattributed,\n' +
          '        skipped,\n' +
          '      );\n' +
          '    }',
        replacement:
          '    if (navigations.length === 0) {\n' +
          '      return answer(\n' +
          '        ENDED,\n' +
          '        null,\n' +
          '        [],\n' +
          '        unattributed,\n' +
          '        skipped,\n' +
          '      );\n' +
          '    }',
        message: /E3 a record carrying no navigation answers the absence/,
        defect(api) {
          const answer = answerOf(api, { routerEvents: [] });
          assert.equal(
            answer.state,
            'ended',
            'the mutant answers an empty record as a stream that ended',
          );
        },
      },
    ]);
    console.log(`E3 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------ E4: stage words ----

describe('E4 — every stage word is the class of an event the record contains', () => {
  it('derives each stage from its own event class and never invents a word', () => {
    const caught = proveNonVacuous(pinStageWordsComeFromRecordedClasses, [
      {
        what: 'M6 the stage is derived from a receipt time instead of an event class',
        anchor:
          '      if (STAGE_BY_CLASS[i][0] === last.type) return STAGE_BY_CLASS[i][1];',
        replacement:
          '      if (\n' +
          "        STAGE_BY_CLASS[i][0] === (last.at < 400 ? 'ActivationEnd' : 'ResolveEnd')\n" +
          '      ) {\n' +
          '        return STAGE_BY_CLASS[i][1];\n' +
          '      }',
        message: /E4 the stage is the class of the last recorded event/,
        defect(api) {
          const answer = answerOf(api, heldRecord());
          assert.equal(
            answer.navigations[0].stage,
            'activation',
            'the mutant reads the stage off the receipt time, not off the class',
          );
        },
      },
      {
        what: 'M7 a stage word is minted that no event names',
        anchor:
          '      if (STAGE_BY_CLASS[i][0] === last.type) return STAGE_BY_CLASS[i][1];',
        replacement:
          "      if (STAGE_BY_CLASS[i][0] === last.type) return STAGE_BY_CLASS[i][1] + '-stage';",
        message: /E4 every stage word the join answers is one the record names/,
        defect(api) {
          const answer = answerOf(api, heldRecord());
          assert.equal(
            answer.navigations[0].stage,
            'route-config-load-stage',
            'the mutant mints a stage word no event class names',
          );
        },
      },
    ]);
    console.log(`E4 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------------------------- E5: the holder ----

describe('E5 — an open navigation’s holder is cannot-tell with no-holder-recorded', () => {
  it('names the absence and no guard, chunk, task or resolver', () => {
    const caught = proveNonVacuous(pinHolderIsNotRecorded, [
      {
        what: 'M8 a held navigation is given a holder',
        anchor:
          '    return { state: CANNOT_TELL, absence: NO_HOLDER_RECORDED };',
        replacement:
          '    return {\n' +
          '      state: CANNOT_TELL,\n' +
          '      absence: NO_HOLDER_RECORDED,\n' +
          "      name: 'lazy chunk',\n" +
          '    };',
        message:
          /E5 the holder carries the verdict and the named absence and nothing else/,
        defect(api) {
          const answer = answerOf(api, heldRecord());
          assert.equal(
            answer.navigations[0].holder.name,
            'lazy chunk',
            'the mutant names what is holding the navigation',
          );
        },
      },
    ]);
    console.log(`E5 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------- E6: wildcard, not refusal ----

describe('E6 — a wildcard match is reported as the match and never as a guard refusal', () => {
  it('reports the wildcard chain and the same answer for a refusal and an unmatched URL', () => {
    const caught = proveNonVacuous(pinWildcardMatchIsNeverARefusal, [
      {
        what: 'M9 a guard refusal is presented as the reason',
        anchor: '    navigation.reason = entry.reason;',
        replacement:
          "    navigation.reason = entry.reason === null ? 'guard refused' : entry.reason;",
        message:
          /E6 a wildcard match is reported as the match and never as a guard refusal/,
        defect(api) {
          const answer = answerOf(api, refusedRecord());
          assert.equal(
            answer.navigations[0].reason,
            'guard refused',
            'the mutant reports a cause the terminal event never carried',
          );
        },
      },
    ]);
    console.log(`E6 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// --------------------------------------------- E7: the aggregate and resolver ----

describe('E7 — the guard aggregate is an aggregate and the resolver stage is an absence', () => {
  it('reports shouldActivate as it is and answers no-resolver-configured', () => {
    const caught = proveNonVacuous(pinTheAggregateAndTheAbsentResolver, [
      {
        what: 'M10 the guard answer is attributed to a named guard',
        anchor:
          '    return {\n' +
          '      state: CANNOT_TELL,\n' +
          '      absence: GUARD_VERDICT_NOT_RECORDED,\n' +
          '      shouldActivate: navigation.shouldActivate,\n' +
          '    };',
        replacement:
          '    return {\n' +
          '      state: CANNOT_TELL,\n' +
          '      absence: GUARD_VERDICT_NOT_RECORDED,\n' +
          "      guard: 'canMatch',\n" +
          '      shouldActivate: navigation.shouldActivate,\n' +
          '    };',
        message: /E7 the guard answer carries the aggregate and no guard name/,
        defect(api) {
          const answer = answerOf(api, warmRecord());
          assert.equal(
            answer.navigations[0].guards.guard,
            'canMatch',
            'the mutant attributes the aggregate to a named guard',
          );
        },
      },
      {
        what: 'M11 the resolve stage names a resolver',
        anchor:
          '    return { state: CANNOT_TELL, absence: NO_RESOLVER_CONFIGURED };',
        replacement:
          '    return {\n' +
          '      state: CANNOT_TELL,\n' +
          '      absence: NO_RESOLVER_CONFIGURED,\n' +
          "      name: 'resolver',\n" +
          '    };',
        message:
          /E7 the resolve stage answers the named absence and names no resolver/,
        defect(api) {
          const answer = answerOf(api, warmRecord());
          assert.equal(
            answer.navigations[0].resolve.name,
            'resolver',
            'the mutant infers a resolver from a resolve stage',
          );
        },
      },
    ]);
    console.log(`E7 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------ E8: completed is never held ----

describe('E8 — a completed navigation is never reported open or held', () => {
  it('answers ended with its measured interval, a measured zero included', () => {
    const caught = proveNonVacuous(pinCompletedIsNeverHeld, [
      {
        what: 'M12 a completed navigation with a loaded route is reported open and held',
        anchor: '    navigation.state = ENDED;',
        replacement:
          '    navigation.state = navigation.loads.length > 0 ? OPEN : ENDED;',
        message: /E8 a record whose navigation ended answers ended/,
        defect(api) {
          const answer = answerOf(api, warmRecord());
          assert.equal(
            answer.navigations[0].state,
            'open',
            'the mutant reports a navigation with a terminal event as still in flight',
          );
          assert.equal(
            answer.navigations[0].holder.absence,
            'no-holder-recorded',
            'the mutant gives the completed navigation a holder',
          );
        },
      },
      {
        what: 'M13 a measured zero is reported as a missing interval',
        anchor:
          '      isMeasurement(load.startedAt) && isMeasurement(at)\n' +
          '        ? at - load.startedAt\n' +
          '        : null;',
        replacement:
          '      isMeasurement(load.startedAt) && isMeasurement(at)\n' +
          '        ? at - load.startedAt || null\n' +
          '        : null;',
        message: /E8 a measured zero stays a measured zero/,
        defect(api) {
          const answer = answerOf(api, measuredZeroRecord());
          assert.equal(
            answer.navigations[0].loads[0].durationMs,
            null,
            'the mutant reads the measured zero as falsy and drops the interval',
          );
        },
      },
    ]);
    console.log(`E8 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------- E9: loads by route and by start ----

describe('E9 — a load is attributed by its own route and its own start, never by arrival', () => {
  it('closes the abandoned navigation’s load on itself and never on its successor', () => {
    const caught = proveNonVacuous(pinLoadsAreAttributedByRouteAndStart, [
      {
        what: 'M14 a route-config load end is attributed by position instead of route',
        anchor:
          '      if (openLoads[i].load.open && openLoads[i].route === route) {',
        replacement:
          '      if (openLoads[i].load.open && i === openLoads.length - 1) {',
        message: /E9 the late load end closes the load its own start opened/,
        defect(api) {
          const answer = answerOf(api, supersededRecord());
          const abandoned = navById(
            answer,
            RECORDING.superseded.cancel.payload.id,
          );
          assert.equal(
            abandoned.loads[0].endedAt,
            null,
            'the mutant closes the load that started last instead of the one the end names',
          );
          assert.equal(
            navById(answer, RECORDING.superseded.successor.id).loads.filter(
              (load) => load.route === 'contract',
            )[0].endedAt,
            RECORDING.superseded.ordering.abandonedLoadEndAt,
            'the mutant hands the abandoned navigation load end to its successor',
          );
        },
      },
      {
        what: 'M15 an id-less load start acquires the id of the navigation in flight',
        anchor: '      loads: navigation.loads.map(loadAnswer),',
        replacement:
          '      loads: navigation.loads.map((load) => ({\n' +
          '        ...loadAnswer(load),\n' +
          '        id: navigation.id,\n' +
          '      })),',
        message: /E9 a route-config load carries no id at all/,
        defect(api) {
          const answer = answerOf(api, heldRecord());
          assert.equal(
            answer.navigations[0].loads[0].id,
            HELD[0].payload.id,
            'the mutant lends the load a navigation id it never carried',
          );
        },
      },
    ]);
    console.log(`E9 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------- E7/E8: a terminal for an id that has already ended ----
//
// The shape is the recording's own, and it is the one the intent's fourth correction states: a
// same-URL `NavigationSkipped` carries id 3, whose start and end live in the `superseded` frame from
// a different run, so the entry arrives for a navigation that has already ended. The two frames
// below are read out of `research/raw/m041-navigation.json` at load (`SUPERSEDED`, `SKIP`) and
// concatenated in the recording's own order: nothing here authors an event list, and the pin's
// expectation — the id, the url and the class word — is read from the recording rather than written.

/** The recording's two frames in its own order: the ended id, then the skip that addresses it. */
const ENDED_ID_EVENTS = [...SUPERSEDED, ...SKIP];

/** The same two frames reordered: a mutation of the recording, not of the module under test. */
const REORDERED_ID_EVENTS = [...SKIP, ...SUPERSEDED];

/**
 * E7, held out. A terminal entry whose own id has already ended is a finding naming the skipped
 * navigation — its id, the `url` the entry carried and the word the record uses for the class — and
 * the navigation that ended keeps exactly the one terminal it recorded. E8's ordering half is the
 * same pin over a stream the caller names, so a reordered recording or a rebuilt list reddens it.
 *
 * @param {any} api
 * @param {any[]} [events] the recording's events, in the order the pin is fed
 * @returns {any[]} the findings the answer carried
 */
function pinTerminalForAnEndedId(api, events = ENDED_ID_EVENTS) {
  const skip = RECORDING.terminals.skip.event;
  const ended = recordedEvent(SUPERSEDED, 'NavigationEnd');
  assert.equal(
    skip.payload.id,
    ended.payload.id,
    'the recording skip addresses the id the superseded run had already ended, so one id has two terminals',
  );
  assert.equal(
    skip.class,
    'NavigationSkipped',
    'the entry that arrives after the end is the class the record uses for a skipped navigation',
  );

  const answer = answerOf(api, recordOf(events));
  assert.equal(
    answer.state,
    'ended',
    'E7 both navigations the stream carries recorded a terminal',
  );
  assert.equal(
    answer.navigations.length,
    2,
    `E7 the stream carries two navigations and the answer must report two: ${JSON.stringify(
      answer.navigations.map((navigation) => navigation.id),
    )}`,
  );

  // The finding, and the whole of it: the id the entry addressed, the url the entry carried and the
  // class word the record uses. No cause, no owner and no intent is added, so the key set is the
  // three fields and nothing else — asserted first, so a finding that is missing, or one that carries
  // a word the entry never carried, reddens here by shape before the values are compared.
  assert.deepEqual(
    keysOf(answer.skipped[0] ?? {}),
    ['id', 'terminal', 'url'],
    `E7 the finding names the id, the url and the word for the class, and no cause the entry does not carry: ${JSON.stringify(answer.skipped)}`,
  );
  assert.deepEqual(
    answer.skipped,
    [{ id: skip.payload.id, url: skip.payload.url, terminal: skip.class }],
    `E7 an ended id carries the skipped terminal the recording names; the answer reported ${JSON.stringify(
      answer.skipped,
    )}`,
  );

  // The navigation that ended keeps exactly one terminal: the one it recorded. A second terminal for
  // its id must not overwrite it, and must not open a second navigation for the same id either.
  const navigation = navById(answer, ended.payload.id);
  assert.equal(
    navigation.terminal,
    'NavigationEnd',
    `E7 the ended navigation keeps the terminal it recorded: ${JSON.stringify(navigation.terminal)}`,
  );
  assert.equal(
    navigation.state,
    'ended',
    'E7 the ended navigation stays ended',
  );
  assert.equal(
    answer.navigations.filter((one) => one.id === ended.payload.id).length,
    1,
    'E7 an entry for an ended id opens no second navigation',
  );
  return answer.skipped;
}

describe('E7/E8 — a terminal for an id that already ended is a finding, and a normal end is one terminal', () => {
  it('names the skipped navigation, and keeps the ended navigation’s single terminal', () => {
    const caught = proveNonVacuous(
      (api) => pinTerminalForAnEndedId(api),
      [
        {
          what: 'M16 the narrator drops a terminal whose id has already ended',
          anchor:
            '          skipped.push({ id: entry.id, url: entry.url, terminal: type });\n' +
            '        }',
          replacement: '        }',
          message:
            /E7 the finding names the id, the url and the word for the class/,
          defect(api) {
            const answer = answerOf(api, recordOf(ENDED_ID_EVENTS));
            assert.deepEqual(
              answer.skipped,
              [],
              'the mutant discards the terminal the recording carries for the ended id, which is the defect this repair removes',
            );
            assert.equal(
              navById(answer, RECORDING.terminals.skip.event.payload.id)
                .terminal,
              'NavigationEnd',
              'the mutant leaves the ended navigation’s own terminal in place, so only the finding is missing',
            );
          },
        },
        {
          what: 'M17 the finding names a cause the entry does not carry',
          anchor:
            '          skipped.push({ id: entry.id, url: entry.url, terminal: type });',
          replacement:
            "          skipped.push({ id: entry.id, url: entry.url, terminal: type, reason: 'navigation was skipped because the URL was unchanged' });",
          message:
            /E7 the finding names the id, the url and the word for the class/,
          defect(api) {
            const answer = answerOf(api, recordOf(ENDED_ID_EVENTS));
            assert.equal(
              answer.skipped[0].reason,
              'navigation was skipped because the URL was unchanged',
              'the mutant attributes a cause the recorded entry never carried',
            );
          },
        },
      ],
    );
    console.log(`E7/E8 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('is fed the recording, so a reordered recording or a rebuilt list reddens it', () => {
    const api = pristineApi();

    // The pin's own premise: the recording's order is what puts the skip after the end.
    pinTerminalForAnEndedId(api, ENDED_ID_EVENTS);

    // AC4's ordering half. The same events in the other order: the skip opens the navigation and the
    // superseded run's `NavigationEnd` addresses an id that is still open, so the ended-id finding is
    // absent and the terminal the answer reports for that id changes. Nothing about the module moved.
    const reordered = reddens(
      () => pinTerminalForAnEndedId(api, REORDERED_ID_EVENTS),
      'a reordered recording',
    );
    console.log(`E8 reordered recording: ${reordered.message.split('\n')[0]}`);
    assert.match(
      reordered.message,
      /E7 an ended id carries the skipped terminal/,
      `the reordered recording must redden the pin naming the finding it lost: ${reordered.message}`,
    );

    // AC4's rebuilt-list half: the same two frames with the skip entry's url rewritten here. The
    // pin's expectation is the recording's own id and url, so a list rebuilt in this file — the
    // composition INTENT's E8 forbids — cannot satisfy it: the finding it produces names the entry
    // this file invented, not the one the recording carries.
    const rebuilt = [...SUPERSEDED, ...SKIP].map((event) => ({
      ...event,
      payload: { ...(event.payload ?? {}) },
    }));
    const tampered = rebuilt.map((event, index) =>
      index === rebuilt.length - 1
        ? { ...event, payload: { ...event.payload, url: '/nowhere' } }
        : event,
    );
    const fabricated = reddens(
      () => pinTerminalForAnEndedId(api, tampered),
      'a list rebuilt in this file',
    );
    console.log(`E8 rebuilt list: ${fabricated.message.split('\n')[0]}`);
    assert.match(
      fabricated.message,
      /E7 an ended id carries the skipped terminal/,
      `a rebuilt list must redden the pin naming the recording's own finding: ${fabricated.message}`,
    );

    // And the control: the recording's own events pass the same pin.
    pinTerminalForAnEndedId(api, ENDED_ID_EVENTS);
  });
});

// ----------------------------------------------------------------- the module itself ----

describe('the module', () => {
  it('carries no import, no DOM, no clock, no console and no network', () => {
    for (const needle of [
      ['im', 'port '].join(''),
      ['req', 'uire('].join(''),
      ['docu', 'ment'].join(''),
      ['win', 'dow.'].join(''),
      ['cons', 'ole.'].join(''),
      ['Date', '.now'].join(''),
      ['fe', 'tch('].join(''),
      ['XMLHttp', 'Request'].join(''),
    ]) {
      assert.equal(
        SRC.includes(needle),
        false,
        `the module carries ${JSON.stringify(needle)}, and it must read the record it is handed and nothing else`,
      );
    }
  });

  it('answers the same record twice byte-identically and holds no state between calls', () => {
    const api = pristineApi();
    const first = api.narrateNavigation(supersededRecord());
    const again = api.narrateNavigation(supersededRecord());
    assert.equal(
      JSON.stringify(clone(first)),
      JSON.stringify(clone(again)),
      'the same record answered twice is byte-identical text',
    );

    // The answer a record produced is not changed by answering a different record afterwards.
    const before = JSON.stringify(clone(first));
    api.narrateNavigation(heldRecord());
    api.narrateNavigation({ routerEvents: [] });
    const after = JSON.stringify(
      clone(api.narrateNavigation(supersededRecord())),
    );
    assert.equal(
      after,
      before,
      'a later call changes nothing an earlier answer carried',
    );
  });

  it('republishes in place on a second run in the same world', () => {
    const context = createContext({});
    runInContext(SRC, context);
    const first = context.angularAiNavigationNarrator;
    runInContext(SRC, context);
    const second = context.angularAiNavigationNarrator;
    assert.equal(
      first,
      second,
      'a second run must republish the same namespace, so a caller reference stays valid',
    );
    assert.equal(typeof second.narrateNavigation, 'function');
  });
});

// ============ the milestone's claim list, one artefact citation per criterion ============
//
// The ruling the plan leaves to the task that writes the list: which of the bound `INTENT.md`'s criteria
// need a portal-backed `lars-verify` verdict, and what proves each one that does not. The list is derived
// rather than remembered, and it is derived for whichever milestone the state file binds: every criterion
// that intent declares is ruled once, quoted at the characters `scripts/overlay-verdict-claims.test.mjs`
// parses it at, and cited with a suite this checkout carries - beside the check chain that runs that
// suite and the counts read out of it. The list's own path follows the same binding, so the file the
// armed capture writes is the file that suite opens rather than a finished milestone's.
//
// Two documents carry the derivation, and the owner's ruling fixes which reads which. The intent's
// `## Edge coverage` table is the five-column grammar
// `Edge | Criterion | Category | Disposition | Detail` (`check_handoffs.py` refuses a sixth column), so
// it says which edges a criterion is held by and nothing about a suite. The test-to-edge mapping lives
// once, in the plan's `## Held-out checks` table `Edge | Task | Test`. An edge the plan does not hold
// out is held by the suite the task the plan's `## Intent coverage` assigns its criterion added, read
// from that task's own `files:` list and `base`. No suite has to carry an edge id in a test title: the
// ruling replaced that demand with the plan's table, and this file reads the table.
//
// The list rules every row `not-required`, which is a measurement rather than a preference: the charter's
// portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts,
// and every criterion this milestone declares is a fact about this repository's own gate - what a stage
// examines, what a range is derived from, whether a recording re-derives after the ship commit exists,
// and what a mutant reddens. No route can produce any of them, and the gate's one `control-ai-browsers
// run` driver returns four readings an element's rect and dev context produce, so a portal-backed row
// would name a driver that cannot carry the answer. `scripts/overlay-verdict-claims.test.mjs` refuses a
// list with no required row that names a driver, so the file names none.
//
// `M044_CAPTURE=1` arms the one write, and it writes only when a value moved, so two armed runs leave the
// file byte-identical. Armed, on Windows cmd.exe:
//
//   set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const CLAIM_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The directory a milestone's records live in: its measurements and the list that cites them. */
const RAW_REL = 'research/raw';
const RAW_DIR = join(CLAIM_ROOT, RAW_REL);
const PACKAGE_PATH = join(CLAIM_ROOT, 'package.json');
const STATE_PATH = join(CLAIM_ROOT, '.project', 'STATE.md');
const SUITE_REL = 'scripts/navigation-blocking.test.mjs';

/**
 * The milestone this list is numbered for, read from the branch the state file binds - the same reading
 * `derivedClaims()` takes - so the armed capture writes the file
 * `scripts/overlay-verdict-claims.test.mjs` opens at that same branch, and the writer and both readers
 * name one path. A literal here is what left the list describing M044 on every milestone after it.
 */
const CLAIMS_MILESTONE = boundMilestone();
const CLAIMS_REL = `research/raw/${CLAIMS_MILESTONE.toLowerCase()}-verdict-claims.json`;
const CLAIMS_PATH = join(CLAIM_ROOT, CLAIMS_REL);

/** The commands this list is held to, recorded in it so a reader runs what produced it. */
const CLAIM_CHECK = `node --experimental-strip-types --test "${SUITE_REL}"`;
const CLAIM_CAPTURE = `set "M044_CAPTURE=1"&& ${CLAIM_CHECK}`;
const GATE_SUITE_CHECK =
  'node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"';
const OVERLAY_SUITE_CHECK =
  'node --experimental-strip-types --test "scripts/overlay-verdict-claims.test.mjs"';

const CLAIM_ARMED = String(process.env.M044_CAPTURE ?? '').trim() === '1';

/**
 * The suite that owns the bound milestone's claim list, read from the record's own `capture.command`.
 *
 * This file is where the census M044 introduced lives, and every milestone from M044 to M061 had its
 * list captured by it. M062 replaces the derivation with a census of its own -
 * `scripts/outlet-verdict-claims.test.mjs`, armed by `M062_CAPTURE=1` - because its plan resolves one
 * criterion's edges to two suites and its own two tables disagree about E8, so the one-citation
 * derivation below cannot produce a list for it. A record that names another suite as the one that
 * captured it is therefore owned elsewhere: this file still holds it to every rule that does not need
 * the derivation (one row per criterion, the intent's own text, a carried artefact, an edge id, a
 * portal reason) and holds its citations to the suites the plan assigns, but it does not write it and
 * does not claim to derive it. A record that names this file is derived here exactly as before.
 *
 * @param {any} recording the claim list, or null when it has never been captured
 * @returns {string} the repository path of the suite that captures it
 */
function owningCensus(recording) {
  const command = String(recording?.capture?.command ?? '');
  const named = /scripts\/[a-z0-9-]+\.test\.mjs/.exec(command)?.[0];
  return named ?? SUITE_REL;
}

const CLAIMS_OWNER = existsSync(CLAIMS_PATH)
  ? owningCensus(claimJson(CLAIMS_PATH, 'the list is part of this repository'))
  : SUITE_REL;
const CLAIMS_OWNED_ELSEWHERE = CLAIMS_OWNER !== SUITE_REL;

/** @param {Buffer | string} bytes @returns {string} */
function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} path @returns {string} */
function shown(path) {
  return relative(CLAIM_ROOT, path).split(sep).join('/');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} path @param {string} why @returns {string} */
function claimText(path, why) {
  assert.ok(existsSync(path), `${shown(path)} is missing - ${why}`);
  return readFileSync(path, 'utf8');
}

/** @param {string} path @param {string} why @returns {any} */
function claimJson(path, why) {
  return JSON.parse(claimText(path, why));
}

/**
 * The line one anchor sits on, so a citation names the place as well as the file. A file that no longer
 * carries the anchor fails here rather than citing a line nobody can check.
 *
 * @param {string} text
 * @param {string} anchor
 * @param {string} what
 * @returns {number}
 */
function lineOf(text, anchor, what) {
  const index = text.split('\n').findIndex((line) => line.includes(anchor));
  assert.ok(
    index >= 0,
    `${what} carries no ${JSON.stringify(anchor)}, so the citation cannot be derived from it`,
  );
  return index + 1;
}

/**
 * The numbered success criteria of an intent, parsed with the same routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so a row quotes the criterion that suite compares it to
 * and not this file's paraphrase of it.
 *
 * @param {string} source
 * @returns {Record<string, string>}
 */
function claimCriteria(source) {
  const heading = '## Success criteria';
  const at = source.indexOf(heading);
  assert.ok(at >= 0, 'the intent must carry a "## Success criteria" section');
  const rest = source.slice(at + heading.length);
  const end = rest.indexOf('\n## ');
  const section = end >= 0 ? rest.slice(0, end) : rest;
  /** @type {Record<string, string>} */
  const criteria = {};
  /** @type {string[] | null} */
  let current = null;
  let currentId = '';
  const flush = () => {
    if (current) {
      criteria[currentId] = current.join(' ').replace(/\s+/g, ' ').trim();
    }
    current = null;
    currentId = '';
  };
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^(\d+)\.\s+(.+?)\s*$/);
    if (match) {
      flush();
      currentId = `SC${match[1]}`;
      current = [match[2] ?? ''];
      continue;
    }
    if (current && line.trim() !== '' && /^\s/.test(line)) {
      current.push(line.trim());
      continue;
    }
    flush();
  }
  flush();
  assert.ok(
    Object.keys(criteria).length > 0,
    'the intent must list its success criteria as a numbered list',
  );
  return criteria;
}

/**
 * The milestone the state file binds, read as the branch line, so the criteria this list quotes are the
 * ones the milestone under work declares and the list is numbered for the same milestone its own path is
 * derived from.
 *
 * @returns {string}
 */
function boundMilestone() {
  const text = claimText(
    STATE_PATH,
    'the state file is part of this repository',
  );
  const branch = /^branch:\s*(\S+)\s*$/m.exec(text)?.[1] ?? '';
  const number = /^gsd-path\/M(\d{3})$/.exec(branch)?.[1];
  assert.ok(
    number,
    `STATE.md must name the milestone under work by branch, and it names ${JSON.stringify(branch)}`,
  );
  return `M${number}`;
}

/**
 * The text of one `##` section, up to the next `##` heading. Every table this file reads lives in one,
 * and the heading is matched at a line start, so a plan that names it in its prose is not the section.
 *
 * @param {string} source
 * @param {string} heading
 * @returns {string}
 */
function sectionOf(source, heading) {
  const at = source.indexOf(`\n${heading}`);
  assert.ok(
    at >= 0,
    `the document must carry a ${JSON.stringify(heading)} section`,
  );
  const rest = source.slice(at + heading.length + 1);
  const end = rest.indexOf('\n## ');
  return end >= 0 ? rest.slice(0, end) : rest;
}

/**
 * The data cells of every row of one pipe-delimited table, with the header and separator included so a
 * table that carries an extra column is refused rather than silently skipped. `columns` is the ruling's
 * own count, and the failure names the count it read and the count it expected: a six-column edge table
 * restored over a five-column intent is exactly the defect this reading replaces, so it must redden
 * naming the column count rather than falling through to an empty list.
 *
 * @param {string} section
 * @param {number} columns
 * @param {string} what
 * @returns {string[][]}
 */
function tableRows(section, columns, what) {
  /** @type {string[][]} */
  const rows = [];
  for (const line of section.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split('|').map((cell) => cell.trim());
    const data = cells.slice(1, -1);
    if (data.length === 0) continue;
    if (data.length !== columns) {
      assert.fail(
        `${what} carries ${String(
          data.length,
        )} column(s); the ruling's grammar is ${String(columns)} columns, so a table with ${String(
          data.length,
        )} is a different shape and the count is what this reading refuses`,
      );
    }
    rows.push(data);
  }
  return rows;
}

/** The five column names the owner's ruling makes authoritative, in the order it names them. */
const EDGE_COLUMNS = ['Edge', 'Criterion', 'Category', 'Disposition', 'Detail'];

/**
 * The edges the bound intent's own edge-coverage table binds to each criterion, read as the five
 * columns the owner's ruling makes authoritative: `Edge | Criterion | Category | Disposition | Detail`.
 * The header is read as written, so a table headed with another name - a sixth `Test` column among
 * them - is refused rather than read as though its cells were the ruling's. The table no longer names
 * a suite: the test-to-edge mapping lives once, in the plan's held-out checks, so a criterion's proof
 * is derived rather than taken from a sixth cell.
 *
 * @param {string} source
 * @returns {Array<{ edge: string, criterion: string, category: string, disposition: string, detail: string }>}
 */
function intentEdges(source) {
  const section = sectionOf(source, '## Edge coverage');
  const cells = tableRows(section, 5, "the intent's edge-coverage table");
  assert.ok(
    cells.length > 0,
    'the intent must list its edge coverage as a five-column table, so a criterion has an edge it is held by',
  );
  assert.deepEqual(
    cells[0],
    EDGE_COLUMNS,
    `the intent's edge-coverage table must be headed exactly ${EDGE_COLUMNS.join(
      ' | ',
    )}, and it is headed ${JSON.stringify(cells[0])}`,
  );
  /** @type {Array<{ edge: string, criterion: string, category: string, disposition: string, detail: string }>} */
  const rows = [];
  for (const data of cells) {
    if (!/^E\d+$/.test(data[0] ?? '')) continue;
    rows.push({
      edge: data[0] ?? '',
      criterion: data[1] ?? '',
      category: data[2] ?? '',
      disposition: data[3] ?? '',
      detail: data[4] ?? '',
    });
  }
  assert.ok(
    rows.length > 0,
    'the intent must list its edge coverage as a five-column table, so a criterion has an edge it is held by',
  );
  return rows;
}

/**
 * One row of the plan's `## Held-out checks`, in either of the two forms the plans in this repository
 * write it: the three-column table `| E1 | T002 | scripts/x.test.mjs |`, and the bullet
 * `- E1 → T002 → \`scripts/x.test.mjs\`` that M060's plan and this milestone's both carry. The arrow
 * is the one the plans spell (`→`, U+2192); a dash is accepted in its place so an ASCII rewrite of the
 * same row is read rather than silently skipped.
 */
const HELD_OUT_BULLET =
  /^\s*[-*]\s*(E\d+)\s*(?:→|->|—)\s*(T\d+)\s*(?:→|->|—)\s*`([^`]+)`\s*$/;

/**
 * The plan's `## Held-out checks`, `Edge | Task | Test`: the one place the test-to-edge mapping lives.
 * A row names the edge, the task that holds it and the suite that carries it, so a citation can name a
 * suite the milestone itself assigned the edge rather than one this file chooses.
 *
 * The section is read in both forms it is written in, because a reader that knows only the table
 * answers "the plan holds out nothing" for a plan whose mapping is a bullet list - and then every row
 * falls back to the suite the criterion's first task happened to add, which is a citation the plan
 * never assigned. M060's plan and this milestone's both write bullets; the table form is read too so a
 * plan that restores it is not refused.
 *
 * @param {string} source
 * @returns {Map<string, { task: string, test: string }>}
 */
function heldOutChecks(source) {
  const section = sectionOf(source, '## Held-out checks');
  /** @type {Map<string, { task: string, test: string }>} */
  const held = new Map();
  for (const data of tableRows(
    section,
    3,
    "the plan's held-out-checks table",
  )) {
    const edge = data[0] ?? '';
    if (!/^E\d+$/.test(edge)) continue;
    held.set(edge, { task: data[1] ?? '', test: data[2] ?? '' });
  }
  for (const line of section.split(/\r?\n/)) {
    const row = HELD_OUT_BULLET.exec(line);
    if (row === null) continue;
    held.set(String(row[1]), { task: String(row[2]), test: String(row[3]) });
  }
  return held;
}

/**
 * How many rows the plan's `## Held-out checks` section writes, counted by shape rather than by the
 * reader's own pattern: a table data row naming an edge, or a bullet whose first token is an edge id.
 * The count is deliberately wider than {@link heldOutChecks} — a bullet that names an edge but whose
 * arrows the reader does not parse is a row the plan wrote and the reader lost — so a reader that
 * silently skips a form, or a form a plan restores, is caught by a count instead of by the
 * derivation's fallback: an edge the reader loses does not vanish, it moves to `## Intent coverage`
 * and cites a suite the plan assigned to a different edge.
 *
 * A row the plan deletes outright is not a row and no count can see it: the plan is the only statement
 * of what it holds out, which is why the reading below also holds each row's task to the plan's own
 * `## Intent coverage` table.
 *
 * @param {string} source
 * @returns {number}
 */
function heldOutRowsWritten(source) {
  const section = sectionOf(source, '## Held-out checks');
  let count = 0;
  for (const line of section.split(/\r?\n/)) {
    if (/^\s*\|\s*E\d+\s*\|/.test(line) || /^\s*[-*]\s*E\d+\b/.test(line)) {
      count += 1;
    }
  }
  return count;
}

/**
 * The plan's `## Intent coverage` table, `Criterion | Task | Acceptance`: which task answers each
 * criterion. It is the second derivation this file needs, because an edge the plan does not hold out
 * has no row in the held-out table, and the task the plan assigns its criterion is where its suite is
 * declared.
 *
 * @param {string} source
 * @returns {Array<{ criterion: string, task: string, acceptance: string }>}
 */
function intentCoverage(source) {
  const section = sectionOf(source, '## Intent coverage');
  /** @type {Array<{ criterion: string, task: string, acceptance: string }>} */
  const rows = [];
  for (const data of tableRows(
    section,
    3,
    "the plan's intent-coverage table",
  )) {
    if (!/^SC\d+$/.test(data[0] ?? '')) continue;
    rows.push({
      criterion: data[0] ?? '',
      task: data[1] ?? '',
      acceptance: data[2] ?? '',
    });
  }
  return rows;
}

/**
 * The suite paths one task's own `files:` front matter declares, in the order it spells them. A task
 * declares the suites it feeds; the one that is absent at the task's own base is the suite the task
 * added, which is the one a criterion's row cites when the plan holds no edge out.
 *
 * @param {string} text
 * @returns {string[]}
 */
function declaredSuites(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(stripBom(text))?.[1] ?? '';
  const block =
    /^files:[ \t]*\r?\n((?:[ \t]*-[ \t]*\S.*\r?\n?)*)/m.exec(front)?.[1] ?? '';
  /** @type {string[]} */
  const suites = [];
  for (const match of block.matchAll(/^[ \t]*-[ \t]*(\S+)[ \t]*$/gm)) {
    const named = (match[1] ?? '').replace(/^['"]|['"]$/g, '');
    if (/\.(test|spec)\.(mjs|cjs|js|mts|ts)$/.test(named)) suites.push(named);
  }
  return suites;
}

/**
 * The task file one plan row names, by id, in the directory the plan sits beside. A plan that names a
 * task this checkout does not carry answers null, so a criterion with no other source is a refusal
 * rather than an empty citation.
 *
 * @param {string} tasksDir
 * @param {string} task
 * @returns {string | null}
 */
function taskFileAt(tasksDir, task) {
  if (!existsSync(tasksDir)) return null;
  const name = readdirSync(tasksDir)
    .filter(
      (entry) =>
        entry.endsWith('.md') &&
        (entry === `${task}.md` || entry.startsWith(`${task}-`)),
    )
    .sort()[0];
  return name === undefined ? null : join(tasksDir, name);
}

/**
 * The suite one task added: the first suite its `files:` list declares that its own `base` commit does
 * not carry. A task that modifies a shared suite declares it too, so the added suite is the feature
 * suite the criterion's reading lives in; a task whose base names no commit answers its first declared
 * suite, which is a fallback stated rather than hidden.
 *
 * @param {string} text
 * @returns {string | null}
 */
function suiteAddedByTask(text) {
  const suites = declaredSuites(text);
  if (suites.length === 0) return null;
  const base =
    /^base:\s*([0-9a-f]{7,64})\s*$/im.exec(stripBom(text))?.[1] ?? '';
  if (base !== '') {
    for (const suite of suites) {
      const read = spawnSync('git', ['cat-file', '-e', `${base}:${suite}`], {
        cwd: CLAIM_ROOT,
        encoding: 'utf8',
      });
      if (read.error || read.status !== 0) return suite;
    }
  }
  return suites[0] ?? null;
}

/**
 * The test declarations a suite carries, counted the way the whole-tree count counts them: a declaration
 * is a line whose first token is `test(`, `it(` or `describe(`.
 *
 * @param {string} source
 * @returns {{ tests: number, groups: number }}
 */
function declarationsIn(source) {
  return {
    tests: (source.match(/^[ \t]*(?:test|it)\(/gm) ?? []).length,
    groups: (source.match(/^[ \t]*describe\(/gm) ?? []).length,
  };
}

/**
 * The edge ids a row's artefact claims, read from the `edge ["E8"]` list the artefact string carries.
 * A row that names none is a citation of a file rather than of a test.
 *
 * @param {any} row
 * @returns {string[]}
 */
function claimedEdges(row) {
  const named = /edge (\[[^\]]*\])/.exec(String(row?.artefact ?? ''))?.[1];
  if (named === undefined) return [];
  try {
    const parsed = JSON.parse(named);
    return Array.isArray(parsed)
      ? parsed.filter((edge) => typeof edge === 'string')
      : [];
  } catch {
    return [];
  }
}

/**
 * The plan a milestone's intent sits beside: `.project/plan/PLAN.md` for the live milestone and
 * `.project/archive/<NNN>-<slug>/plan/PLAN.md` for an archived one, both one directory above the
 * intent's own directory. Derived rather than written, so the plan and the intent cannot be read for
 * two different milestones.
 *
 * @param {string} intentPath
 * @returns {string}
 */
function planPathForIntent(intentPath) {
  return join(dirname(intentPath), '..', 'plan', 'PLAN.md');
}

/**
 * The suite one edge is held by, and the derivation that says so. A held-out edge names its suite in
 * the plan's own `## Held-out checks` table. An in-scope edge has no row there, so the suite is the one
 * the task the plan assigns its criterion added - read from that task's `files:` list and its own
 * `base`, never from this file's opinion. A criterion whose edges resolve to different suites is a
 * failed derivation, because a row carries one citation and two suites would name evidence the row
 * cannot open in one place.
 *
 * @param {{ edge: string, criterion: string }} edge
 * @param {Map<string, { task: string, test: string }>} heldOut
 * @param {Array<{ criterion: string, task: string, acceptance: string }>} coverage
 * @param {string} tasksDir
 * @returns {string}
 */
function suiteForEdge(edge, heldOut, coverage, tasksDir) {
  const held = heldOut.get(edge.edge);
  if (held !== undefined) return held.test;
  for (const row of coverage.filter(
    (entry) => entry.criterion === edge.criterion,
  )) {
    const taskFile = taskFileAt(tasksDir, row.task);
    if (taskFile === null) continue;
    const suite = suiteAddedByTask(
      claimText(
        taskFile,
        `${row.task} is the task the plan assigns ${edge.criterion}`,
      ),
    );
    if (suite !== null) return suite;
  }
  assert.fail(
    `the plan holds no held-out row for ${edge.edge}, and no task it assigns ${edge.criterion} adds a suite this checkout carries, so ${edge.criterion} would cite no test at all`,
  );
  return '';
}

/**
 * The list, derived: every criterion the intent declares, ruled once, quoting its own text, and citing
 * the suite the milestone's own plan assigns it. The intent's table is read as the five columns the
 * owner's ruling makes authoritative; the test-to-edge mapping is read from the plan's `## Held-out
 * checks` table and, for an edge the plan does not hold out, from the task that criterion's row names.
 * Every value below is interpolated from a file this checkout holds, so a citation that moves makes the
 * list stale rather than quietly wrong, and a milestone that declares five criteria gets five rows
 * rather than another milestone's six.
 *
 * @param {string} intentSource
 * @param {string} planSource
 * @param {string} intentPath
 * @param {string} planPath
 * @returns {Record<string, any>}
 */
function derivedClaimsFrom(intentSource, planSource, intentPath, planPath) {
  const milestone = CLAIMS_MILESTONE;
  const intent = claimCriteria(intentSource);
  const edges = intentEdges(intentSource);
  const heldOut = heldOutChecks(planSource);
  const coverage = intentCoverage(planSource);
  const tasksDir = join(dirname(planPath), '..', 'tasks');
  const packageText = claimText(
    PACKAGE_PATH,
    'the check chain is part of this repository',
  );
  const packageJson = JSON.parse(packageText);
  const chain = String(packageJson.scripts?.check ?? '');
  const stages = chain.split(' && ').map((stage) => stage.trim());
  const archiveStage = 'npm run gate:archive-paths';
  const fixStage = 'npm run gate:fix-record';
  assert.ok(
    stages.includes(archiveStage) && stages.includes(fixStage),
    `the check chain must run both gate stages: ${JSON.stringify(stages)}`,
  );
  const chainReading = `package.json:${String(
    lineOf(packageText, '"check":', 'package.json'),
  )} ("check": ${String(stages.length)} stage(s), ${JSON.stringify(
    stages.slice(-4),
  )} last, with ${JSON.stringify(archiveStage)} and ${JSON.stringify(
    fixStage,
  )} among them)`;
  const rows = Object.entries(intent).map(([criterion, criterionText]) => {
    const held = edges.filter((edge) => edge.criterion === criterion);
    assert.ok(
      held.length > 0,
      `the intent's edge coverage must name ${criterion}, so its row cites the test the milestone assigned it`,
    );
    const holders = [
      ...new Set(
        held.map((edge) => suiteForEdge(edge, heldOut, coverage, tasksDir)),
      ),
    ];
    assert.ok(
      holders.length > 0,
      `${criterion} carries no citation: no edge the intent assigns it resolves to a suite`,
    );
    const suiteRel = holders[0] ?? '';
    for (const holder of holders) {
      assert.ok(
        holder !== '' && existsSync(join(CLAIM_ROOT, holder)),
        `${criterion} cites ${holder}, which this checkout does not carry`,
      );
    }
    const suiteText = claimText(
      join(CLAIM_ROOT, suiteRel),
      `${criterion}'s plan assigns it ${suiteRel} as the suite that holds its edge`,
    );
    const { tests, groups } = declarationsIn(suiteText);
    const named = JSON.stringify(held.map((edge) => edge.edge));
    const varied = held
      .map(
        (edge) =>
          `${edge.edge} ${edge.category} ${edge.disposition}: ${edge.detail}`,
      )
      .join('; ');
    const dispositions = JSON.stringify([
      ...new Set(held.map((edge) => edge.disposition)),
    ]);
    return {
      criterion,
      criterionText,
      criterionCharacters: criterionText.length,
      ruling: 'not-required',
      reason: `The charter's portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts. ${criterion} is ${JSON.stringify(criterionText)} - a fact about this repository's own gate, its recordings and the tests that hold them, which no route of any page produces. The gate's one \`control-ai-browsers run\` driver returns an element's toolElements, drawnRect, descriptor and noDevContext readings, and none of the four can say what a stage examines, what a range is derived from or what a mutant reddens, so a portal-backed row would name a driver that cannot carry the answer. The portal is named because the clause is answered rather than dodged: the evidence is the edge row(s) ${named} the intent itself assigns the criterion, held by ${JSON.stringify(holders)} and recorded as ${dispositions}.`,
      artefactPath: suiteRel,
      suites: holders,
      artefact: `${suiteRel}${holders.length > 1 ? ` and ${JSON.stringify(holders.slice(1))}` : ''} (edge ${named} of the intent's own coverage: ${varied}; the suite carries ${String(tests)} test declaration(s) in ${String(groups)} group(s)) -> ${chainReading}`,
      reading: `${String(tests)} test declaration(s) in ${suiteRel} hold ${criterion} through the ${String(held.length)} ${held[0]?.category ?? ''} edge row(s) the intent assigns it, ${named}, so the criterion is proved by a test this repository runs rather than by a drive no driver here performs`,
      proves: [
        CLAIM_CHECK,
        ...holders.map(
          (holder) =>
            `node --experimental-strip-types --test ${JSON.stringify(holder)}`,
        ),
        'npm run check',
      ],
    };
  });
  const suites = [...new Set(rows.map((row) => row.artefactPath))];
  for (const suite of suites) {
    assert.ok(
      suite !== '' && existsSync(join(CLAIM_ROOT, suite)),
      `${JSON.stringify(suite)} is the suite the plan assigns a criterion, and this checkout must carry it`,
    );
  }

  return {
    schema: `${milestone.toLowerCase()}-verdict-claims/v1`,
    milestone,
    quotes: {
      from: `scripts/verdict-claims-intent.mjs (intentPathForMilestone(CLAIM_ROOT, ${JSON.stringify(milestone)}))`,
      how: `parsed with the same routine scripts/overlay-verdict-claims.test.mjs uses, extracted into this file and run over the resolved intent, so every criterionText is the intent's own text: the ${String(Object.keys(intent).length)} criteria it declares are ${JSON.stringify(Object.keys(intent))} and scripts/overlay-verdict-claims.test.mjs compares them character for character`,
      edges: `read from ${shown(intentPath)}'s own five-column edge-coverage table (Edge | Criterion | Category | Disposition | Detail) for the edge-to-criterion rows, and the test-to-edge mapping from ${shown(planPath)}'s ## Held-out checks section, which this path reads as ${String(heldOut.size)} row(s) of edge -> task -> test in either form a plan writes it - the three-column Edge | Task | Test table, or the bullet '- E.. -> T.. -> test' - so a row cites the suite the milestone's own plan assigns its edges rather than one this file chose: ${String(edges.length)} edge row(s) over the criteria ${JSON.stringify([...new Set(edges.map((edge) => edge.criterion))])} and the suites ${JSON.stringify(suites)}`,
    },
    ruling: {
      required: 0,
      notRequired: rows.length,
      why: [
        'No row is required, and the list therefore names no driver, no instance and no verdict path: scripts/overlay-verdict-claims.test.mjs refuses a list with no required row that names a driver, so naming one would be the opposite defect.',
        `The reason is not convenience. A required row must name the driver a control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four readings - toolElements, drawnRect, descriptor and noDevContext - with the required rows together citing drawnRect, descriptor and noDevContext. Every fact the ${String(rows.length)} criteria this milestone declares is written about is a reading of this repository's own gate: ${String(edges.length)} edge row(s) held by ${JSON.stringify(suites)}, against ${String(stages.length)} stage(s) of the check chain. None of them is an element's rect or a dev context, so naming a driver would make the gate return a page reading for a claim about the gate.`,
        'The portal is not lost by that ruling: each reason names the clause that would have made a row required, and each row cites the suite the milestone itself assigned its criterion, the reading that suite carries and the commands that prove it.',
      ],
    },
    evidence: {
      intent: { path: shown(intentPath), criteria: Object.keys(intent) },
      plan: {
        path: shown(planPath),
        heldOut: [...heldOut.keys()].sort(),
      },
      edges: {
        rows: edges.length,
        criteria: [...new Set(edges.map((edge) => edge.criterion))],
      },
      suites: suites.map((suite) => ({
        path: suite,
        ...declarationsIn(
          claimText(
            join(CLAIM_ROOT, suite),
            'the suite the plan assigns a criterion',
          ),
        ),
      })),
      recordings: readdirSync(RAW_DIR)
        .filter(
          (name) =>
            name.startsWith(`${milestone.toLowerCase()}-`) &&
            `${RAW_REL}/${name}` !== CLAIMS_REL,
        )
        .sort()
        .map((name) => `${RAW_REL}/${name}`),
    },
    capture: {
      command: CLAIM_CAPTURE,
      check: CLAIM_CHECK,
      records: CLAIMS_REL,
      criteria: rows.map((row) => row.criterion),
      reading:
        'an armed run re-derives the list from the intent this checkout binds, the five-column edge coverage that intent declares and the suites the plan assigns each criterion, and writes it only when a value moved; a default run reads the file and asserts it is exactly what this head derives.',
    },
    claims: rows,
  };
}

/**
 * The list the bound milestone's own two documents derive: the intent for its criteria and edge rows,
 * and the plan for the test-to-edge mapping. One wrapper so the armed capture and every read-only pin
 * call the same derivation with the same two paths.
 *
 * @returns {Record<string, any>}
 */
function derivedClaims() {
  const intentPath = intentPathForMilestone(CLAIM_ROOT, CLAIMS_MILESTONE);
  const planPath = planPathForIntent(intentPath);
  return derivedClaimsFrom(
    claimText(intentPath, `the intent ${CLAIMS_MILESTONE} binds`),
    claimText(planPath, `the plan ${CLAIMS_MILESTONE} binds`),
    intentPath,
    planPath,
  );
}

/**
 * Every row is a citation: a path this checkout carries, the reading that path holds, and the commands
 * that prove it. A row that cites nothing, or cites a file that is not there, is a failure rather than a
 * claim.
 *
 * @param {any} recording
 * @returns {void}
 */
function assertCitations(recording) {
  assert.ok(
    Array.isArray(recording?.claims) && recording.claims.length > 0,
    'the claim list must carry its rows',
  );
  for (const row of recording.claims) {
    const where = row?.criterion ?? 'a row';
    assert.ok(
      typeof row.artefactPath === 'string' && row.artefactPath !== '',
      `${where} cites no artefact path`,
    );
    assert.ok(
      existsSync(join(CLAIM_ROOT, row.artefactPath)),
      `${where} cites ${row.artefactPath}, which this checkout does not carry`,
    );
    assert.ok(
      typeof row.artefact === 'string' &&
        row.artefact.includes(row.artefactPath),
      `${where} names its artefact path but does not say what that artefact carries`,
    );
    assert.ok(
      typeof row.reading === 'string' && row.reading.trim().length >= 40,
      `${where} does not state the reading its artefact carries: ${JSON.stringify(row.reading)}`,
    );
    assert.ok(
      Array.isArray(row.proves) && row.proves.length > 0,
      `${where} names no command that proves it`,
    );
    for (const command of row.proves) {
      assert.ok(
        typeof command === 'string' && command.trim() !== '',
        `${where} proves itself with an empty command`,
      );
    }
    assert.ok(
      ['required', 'not-required'].includes(row.ruling),
      `${where} rules ${JSON.stringify(row.ruling)}`,
    );
    if (row.ruling === 'not-required') {
      assert.ok(
        row.reason.length >= 60 && /portal/i.test(row.reason),
        `${where} must answer the charter's portal clause by name`,
      );
    }
  }
}

/**
 * Every row's artefact must name the edge ids it is ruled on, and name only edge ids: the ruling moved
 * the test-to-edge mapping out of the suite titles and into the plan's held-out table, so a title no
 * longer has to carry `E7` for the citation to be checkable. What stays checkable is that the row
 * states the edges it holds, and that each one is an edge id rather than prose.
 *
 * @param {any} recording
 * @returns {void}
 */
function assertClaimedEdges(recording) {
  assert.ok(
    Array.isArray(recording?.claims) && recording.claims.length > 0,
    'the claim list must carry its rows',
  );
  for (const row of recording.claims) {
    const where = row?.criterion ?? 'a row';
    const edges = claimedEdges(row);
    assert.ok(
      edges.length > 0,
      `${where} names no edge id in its artefact, so the suite it cites is held to no edge: ${JSON.stringify(row?.artefact)}`,
    );
    for (const edge of edges) {
      assert.match(
        edge,
        /^E\d+$/,
        `${where} claims ${JSON.stringify(edge)} in its artefact, and an edge id is E followed by digits`,
      );
    }
  }
}

/**
 * The mutant the ruling replaces: the intent's edge table rewritten as the six-column shape with a
 * `Test` cell between `Disposition` and `Detail`. It is applied to the live source in memory, so the
 * reading is proven against the table this head actually carries rather than a fixture invented for
 * the test.
 *
 * @param {string} source
 * @returns {string}
 */
function sixColumnEdgeTable(source) {
  const lines = source.split(/\r?\n/);
  /** @type {string[]} */
  const out = [];
  let inSection = false;
  for (const line of lines) {
    if (/^## Edge coverage\s*$/.test(line)) {
      inSection = true;
      out.push(line);
      continue;
    }
    if (inSection && /^## /.test(line)) inSection = false;
    if (inSection && /^\s*\|/.test(line)) {
      const cells = line.split('|').map((cell) => cell.trim());
      const data = cells.slice(1, -1);
      if (data.length === 5) {
        const separator = data.every((cell) => /^:?-{2,}:?$/.test(cell));
        const inserted = separator
          ? '---'
          : data[0] === 'Edge'
            ? 'Test'
            : 'scripts/console-panel-render.test.mjs';
        out.push(`| ${[...data.slice(0, 4), inserted, data[4]].join(' | ')} |`);
        continue;
      }
    }
    out.push(line);
  }
  return out.join('\n');
}

/**
 * The same plan with the first held-out row's Test cell replaced, so the derivation's refusal for a
 * cited suite this checkout does not carry can be proven without writing a file.
 *
 * Three outcomes, and the third is a refusal rather than another pass. A section carrying a `| E… |`
 * row has that row's Test cell rewritten. A section carrying no such row but carrying a table
 * separator has one row seeded behind the separator and is read again. A section carrying neither - a
 * `## Held-out checks` written as prose, which is what a plan whose intent marks no edge held-out
 * records - has nowhere to seed, so it is refused by name. The refusal is the repair for the defect
 * this branch used to carry: the prose-only section was rewritten to itself and re-entered on the
 * unchanged copy until `Maximum call stack size exceeded`, which named the stack rather than the
 * reason.
 *
 * @param {string} source
 * @param {string} test
 * @returns {string}
 */
function replaceFirstHeldOutTest(source, test) {
  const section = sectionOf(source, '## Held-out checks');
  const line = section
    .split(/\r?\n/)
    .find((entry) => /^\s*\|\s*E\d+\s*\|/.test(entry));
  // A milestone may run no held-out check: a held-out edge needs its criterion to carry exactly one
  // citation, and M046's SC4 owns three edges held by three suites, so no row can be marked. The
  // refusal path below still has to be exercised, so this case seeds the row it needs on its own copy
  // of the plan rather than demanding that the live plan carry one.
  if (!line) {
    const seeded = section
      .split(/\r?\n/)
      .map((entry) =>
        /^\s*\|\s*-+\s*\|/.test(entry)
          ? `${entry}\n| E1 | T000 | scripts/present-suite.test.mjs |`
          : entry,
      )
      .join('\n');
    const seededCopy = source.replace(section, seeded);
    // The identity case is the defect's root cause, not its symptom. A section with no separator to
    // seed behind has no row to add, so the copy is the plan it came from; re-entering on it recurses
    // without ever changing a byte and without ever saying why. Fail here, naming the section and the
    // row it could not seed, rather than recursing on a copy that is not a copy.
    if (seededCopy === source) {
      assert.fail(
        `the plan's "## Held-out checks" section carries no | E… | row and no separator row to seed one behind, so it carries no seedable table row: the held-out mutant cannot be planted on this plan, and the section must carry the three-column Edge | Task | Test table a row is seeded into`,
      );
    }
    return replaceFirstHeldOutTest(seededCopy, test);
  }
  const cells = line.split('|').map((cell) => cell.trim());
  const data = cells.slice(1, -1);
  data[2] = test;
  return source.replace(line, `| ${data.join(' | ')} |`);
}

/**
 * The plan's held-out mapping, held to the form the plan writes it: the section writes N rows — the
 * three-column table or the bullet `- E.. -> T.. -> test` — and the reader returns N, so a row it
 * drops is named here rather than quietly falling back to `## Intent coverage`; every row names a
 * task, a test and a criterion the intent declares; and every test it names is a suite this checkout
 * carries. This half needs no agreement between the plan's two tables, so it is what a milestone whose
 * claim list is owned by another census still holds its plan to.
 *
 * @param {string} source the plan
 * @param {Array<{ edge: string, criterion: string }>} edges the intent's five-column rows
 * @returns {Map<string, { task: string, test: string }>} the mapping it read
 */
function assertHeldOutRead(source, edges) {
  const heldOut = heldOutChecks(source);
  const written = heldOutRowsWritten(source);
  assert.equal(
    heldOut.size,
    written,
    `the plan's ## Held-out checks writes ${String(
      written,
    )} row(s) and the reader returned ${String(
      heldOut.size,
    )}: a row it does not read is an edge that falls back to the suite a task happened to add, not to the suite the plan assigned`,
  );
  assert.ok(
    written > 0,
    'the plan must write its held-out mapping as rows, or no citation is derived from it',
  );
  const declared = edges.map((edge) => edge.edge);
  for (const [edge, row] of heldOut) {
    const criterion = edges.filter((one) => one.edge === edge)[0]?.criterion;
    assert.ok(
      criterion !== undefined,
      `the plan's held-out checks name ${edge}, and the intent declares ${JSON.stringify(
        declared,
      )}`,
    );
    assert.ok(
      row.task !== '',
      `${edge} must name the task the plan assigns it`,
    );
    assert.ok(
      row.test !== '',
      `${edge} must name the test the plan assigns it`,
    );
    assert.ok(
      existsSync(join(CLAIM_ROOT, row.test)),
      `the plan assigns ${edge} to ${row.test}, which this checkout does not carry`,
    );
  }
  return heldOut;
}

/**
 * The held-out rows whose task the plan's own `## Intent coverage` table does not assign that edge's
 * criterion, derived from the two tables rather than typed: a plan whose tables agree carries none.
 * They are a measurement, not a refusal: M062's plan carries one (E8 is held out by T002, and the
 * coverage table assigns T002 to SC1 and SC2, not to SC4), and its claim list states it under
 * `evidence.plan.disagreements` so a reader sees where the plan and the intent part company.
 *
 * @param {Array<{ edge: string, criterion: string }>} edges
 * @param {Map<string, { task: string, test: string }>} heldOut
 * @param {Array<{ criterion: string, task: string, acceptance: string }>} coverage
 * @returns {Array<{ edge: string, criterion: string, heldBy: string, assignedByCoverage: string[] }>}
 */
function heldOutDisagreements(edges, heldOut, coverage) {
  /** @type {Array<{ edge: string, criterion: string, heldBy: string, assignedByCoverage: string[] }>} */
  const found = [];
  for (const edge of edges) {
    const row = heldOut.get(edge.edge);
    if (row === undefined) continue;
    const assigned = [
      ...new Set(
        coverage
          .filter((one) => one.criterion === edge.criterion)
          .map((one) => one.task),
      ),
    ].sort();
    if (assigned.includes(row.task)) continue;
    found.push({
      edge: edge.edge,
      criterion: edge.criterion,
      heldBy: row.task,
      assignedByCoverage: assigned,
    });
  }
  return found;
}

function assertHeldOutMapping(source, edges, coverage) {
  const heldOut = assertHeldOutRead(source, edges);
  for (const [edge, row] of heldOut) {
    const criterion = edges.filter((one) => one.edge === edge)[0]?.criterion;
    assert.ok(
      coverage.some(
        (one) => one.criterion === criterion && one.task === row.task,
      ),
      `the plan assigns ${edge} to ${row.task}, and its ## Intent coverage table must assign ${row.task} to ${criterion}: a held-out row and a coverage row that disagree put the same edge in two tasks`,
    );
  }
  return heldOut;
}

/** The bytes the read-only pin holds the claim list to; an armed run re-bases it after its own write. */
const claimsAtLoad = existsSync(CLAIMS_PATH)
  ? digest(readFileSync(CLAIMS_PATH))
  : null;
let claimsBaseline = claimsAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 *
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureClaims(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  const record = derivedClaims();
  const candidate = `${JSON.stringify(record, null, 2)}\n`;
  let moved = 'the list had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the list moved: ${JSON.stringify(
      firstClaimDifference(JSON.parse(text), record, ''),
    )}`;
  }
  if (moved === '') {
    return { wrote: false, before, after: before ?? '', moved };
  }
  // Never write a list that would fail its own citation check.
  assert.doesNotThrow(() => assertCitations(record));
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale citation is named rather
 * than reported as a mismatch.
 *
 * @param {any} left
 * @param {any} right
 * @param {string} at
 * @returns {string}
 */
function firstClaimDifference(left, right, at) {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${String(left.length)} row(s) -> ${String(right.length)} row(s)`;
    }
    for (let index = 0; index < left.length; index += 1) {
      const found = firstClaimDifference(
        left[index],
        right[index],
        `${at}[${String(index)}]`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  if (
    left !== null &&
    right !== null &&
    typeof left === 'object' &&
    typeof right === 'object'
  ) {
    for (const key of [
      ...new Set([...Object.keys(left), ...Object.keys(right)]),
    ]) {
      const found = firstClaimDifference(
        left[key],
        right[key],
        at === '' ? key : `${at}.${key}`,
      );
      if (found !== '') return found;
    }
    return at;
  }
  return `${at}: ${JSON.stringify(left)} -> ${JSON.stringify(right)}`;
}

// Declared first among this file's claim-list tests, so an armed run writes before the read-only pins
// read the file back: the same pins then prove the freshly written list is still the one this head
// derives. An armed run refuses rather than writes when the bound milestone's list names another suite
// as its census: the pen is that suite's, and writing here would leave two derivations of one file.
if (CLAIM_ARMED) {
  describe('the claim list, armed', () => {
    it('re-derives, writes only what moved, and a second run changes no byte', () => {
      if (CLAIMS_OWNED_ELSEWHERE) {
        const flag =
          /M\d{3}_CAPTURE/.exec(
            String(
              claimJson(CLAIMS_PATH, 'the armed run reads the list').capture
                ?.command ?? '',
            ),
          )?.[0] ?? 'its own armed flag';
        assert.fail(
          `an armed run would write ${CLAIMS_REL}, and that list is owned by ${CLAIMS_OWNER}: this file's derivation is not the one the list records, so an armed run here would overwrite another census's list with a second derivation of it. Run ${JSON.stringify(flag)} on ${CLAIMS_OWNER} instead`,
        );
      }
      const first = captureClaims(CLAIMS_PATH);
      console.log(
        first.wrote
          ? `armed run wrote ${CLAIMS_REL} (${first.moved})`
          : 'armed run: nothing moved, nothing written',
      );
      assert.equal(
        first.after,
        digest(readFileSync(CLAIMS_PATH)),
        'the bytes the armed run reports are not the bytes on disk',
      );
      const second = captureClaims(CLAIMS_PATH);
      assert.equal(
        second.wrote,
        false,
        `a second armed run wrote, and nothing had moved: ${second.moved}`,
      );
      assert.equal(
        second.after,
        first.after,
        'a second armed run changed the list, so the re-capture is not idempotent',
      );
      console.log(
        `armed idempotence: ${String(readFileSync(CLAIMS_PATH).length)} bytes, sha256 ${second.after} before and after the second run`,
      );
      claimsBaseline = digest(readFileSync(CLAIMS_PATH));
    });
  });
}

/**
 * Every row quotes the criterion the intent declares, character for character, and states the number
 * of characters it quoted. Each failure names the criterion id, so a quote that slid is reported by
 * claim id rather than as a mismatch somewhere in the file — the reading AC1 asks of this list.
 *
 * @param {any} recording the claim list
 * @param {Record<string, string>} criteria the intent's own criteria, as `claimCriteria` parses them
 * @returns {void}
 */
function assertQuotedCriteria(recording, criteria) {
  assert.deepEqual(
    recording.claims.map((row) => row.criterion),
    Object.keys(criteria),
    `every criterion the intent declares is ruled exactly once: ${JSON.stringify(recording.claims.map((row) => row.criterion))} against ${JSON.stringify(Object.keys(criteria))}`,
  );
  for (const row of recording.claims) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} must quote the intent character for character`,
    );
    assert.equal(
      row.criterionCharacters,
      row.criterionText.length,
      `${row.criterion} states ${String(row.criterionCharacters)} character(s) for a quote of ${String(row.criterionText.length)}`,
    );
  }
}

describe('the claim list', () => {
  it('is a read: a default run hashes the list the same before and after', () => {
    assert.ok(
      existsSync(CLAIMS_PATH),
      `${CLAIMS_REL} is missing - the list has never been captured`,
    );
    const now = digest(readFileSync(CLAIMS_PATH));
    assert.equal(
      now,
      claimsBaseline,
      `${CLAIMS_REL} changed during this run, so the suite is not read-only`,
    );
    console.log(
      `${CLAIMS_REL} at load and after the run: ${String(readFileSync(CLAIMS_PATH).length)} bytes, sha256 ${now}`,
    );
  });

  it('is exactly the list this head derives, or the list the census that owns it pins', () => {
    const recorded = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    if (CLAIMS_OWNED_ELSEWHERE) {
      // The pen is the owner's, so the comparison this file can make without it is the ownership
      // chain: the record names the suite that captured it, that suite names the record, and it
      // carries the armed flag the record states. The list's own equality with its derivation is
      // asserted by that suite, which the project runs, rather than guessed at here.
      const command = String(recorded.capture?.command ?? '');
      const flag = /M\d{3}_CAPTURE/.exec(command)?.[0];
      assert.ok(
        command.includes(CLAIMS_OWNER),
        `${CLAIMS_REL} names the command that captured it, and that command must name the suite that owns it (${CLAIMS_OWNER}): ${JSON.stringify(command)}`,
      );
      assert.ok(
        flag !== undefined,
        `${CLAIMS_REL}'s capture command must arm an M0NN_CAPTURE flag of its own, and it names none: ${JSON.stringify(command)}`,
      );
      const ownerPath = join(CLAIM_ROOT, CLAIMS_OWNER);
      assert.ok(
        existsSync(ownerPath),
        `${CLAIMS_REL} names ${CLAIMS_OWNER} as its census, and this checkout does not carry that suite`,
      );
      const ownerSource = readFileSync(ownerPath, 'utf8');
      assert.ok(
        ownerSource.includes('-verdict-claims.json'),
        `${CLAIMS_OWNER} owns a verdict-claims list and must name the kind of file it captures; it does not`,
      );
      assert.ok(
        ownerSource.includes(flag),
        `${CLAIMS_OWNER} owns ${CLAIMS_REL} and must read the flag the record states (${flag}); it does not`,
      );
      console.log(
        `${CLAIMS_REL} is owned by ${CLAIMS_OWNER} (${flag}), so this file holds it to its quote, citation and edge rules and not to a second derivation`,
      );
      return;
    }
    assert.deepEqual(
      recorded,
      derivedClaims(),
      `${CLAIMS_REL} is not what this head derives: ${firstClaimDifference(recorded, derivedClaims(), '')}`,
    );
    console.log(`${CLAIMS_REL} is exactly what this head derives`);
  });

  it('rules every criterion the intent declares, quotes it, and cites an artefact that carries its reading', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    assert.doesNotThrow(() => assertCitations(recording));
    const criteria = claimCriteria(
      claimText(
        intentPathForMilestone(CLAIM_ROOT, recording.milestone),
        'the intent belongs to the milestone the list is numbered for',
      ),
    );
    assert.doesNotThrow(() => assertQuotedCriteria(recording, criteria));
    const required = recording.claims.filter(
      (row) => row.ruling === 'required',
    ).length;
    assert.equal(
      recording.driver ?? null,
      null,
      'a list with no required row must not name a driver: that is what the charter asks for where no route produces the facts',
    );
    assert.equal(
      required,
      recording.ruling.required,
      `the list states ${String(recording.ruling.required)} required row(s) and carries ${String(required)}`,
    );
    for (const row of recording.claims) {
      assert.match(
        row.reason,
        /portal/i,
        `${row.criterion} must answer the charter's portal clause by name`,
      );
      assert.ok(
        row.reason.trim().length >= 60,
        `${row.criterion} must state why the portal clause does not reach it`,
      );
    }
    console.log(
      `${CLAIMS_REL}: ${String(recording.claims.length)} criterion(a) ruled, ${String(required)} required, ${String(recording.claims.length - required)} not-required; artefacts ${JSON.stringify(recording.claims.map((row) => row.artefactPath))}`,
    );
  });

  it('reddens when a row cites an artefact that is not there', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    const planted = clone(recording);
    planted.claims[0].artefactPath = 'research/raw/m044-absent-recording.json';
    let message = '';
    try {
      assert.doesNotThrow(() => assertCitations(planted));
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      message,
      /which this checkout does not carry/,
      `a citation of a file that is not there must redden naming the path; it produced ${JSON.stringify(message.slice(0, 240))}`,
    );

    // And the same guard over the list as it stands: the planted failure above proves it bites.
    assert.doesNotThrow(() => assertCitations(recording));
  });

  it('reddens by claim id when a row no longer quotes the criterion it names', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    const criteria = claimCriteria(
      claimText(
        intentPathForMilestone(CLAIM_ROOT, recording.milestone),
        'the intent belongs to the milestone the list is numbered for',
      ),
    );
    const live = recording.claims[2] ?? recording.claims[0];
    assert.ok(live, 'the list carries a third row to plant the quote on');

    // The quote slid by one word: the row still names its criterion, and the text is no longer the
    // intent's. Only the quote check can catch it, and it has to say which criterion.
    const planted = clone(recording);
    planted.claims[2].criterionText = `${live.criterionText} (reworded here)`;
    planted.claims[2].criterionCharacters =
      planted.claims[2].criterionText.length;
    let message = '';
    try {
      assert.doesNotThrow(() => assertQuotedCriteria(planted, criteria));
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      message,
      new RegExp(
        `${live.criterion} must quote the intent character for character`,
      ),
      `a row whose quote is no longer the intent's must redden by claim id; it produced ${JSON.stringify(
        message.slice(0, 240),
      )}`,
    );

    // The same row with the intent's own text back: the check that bit above is the check that
    // passes here, so the mutant reddens the quote and not the row.
    assert.doesNotThrow(() => assertQuotedCriteria(recording, criteria));
    console.log(
      `quote mutant: ${live.criterion} -> ${String(
        /SC\d+ must quote the intent character for character/.exec(
          message,
        )?.[0] ?? message.split('\n')[0],
      )}`,
    );
  });

  it("reads the intent's five-column edge table and the plan's held-out mapping", () => {
    const intentPath = intentPathForMilestone(CLAIM_ROOT, CLAIMS_MILESTONE);
    const planPath = planPathForIntent(intentPath);
    const intentSource = claimText(
      intentPath,
      `the intent ${CLAIMS_MILESTONE} binds`,
    );
    const planSource = claimText(
      planPath,
      `the plan ${CLAIMS_MILESTONE} binds`,
    );

    // The ruling's five columns, read as written: no sixth cell, and every row carries its detail.
    const edges = intentEdges(intentSource);
    assert.ok(edges.length > 0, 'the intent must declare at least one edge');
    for (const edge of edges) {
      assert.equal(
        'suite' in edge,
        false,
        `the five-column table names no suite, and ${edge.edge} was read with one`,
      );
      assert.ok(
        edge.detail !== '',
        `${edge.edge} must carry the detail the five-column table names`,
      );
    }

    // The mapping the ruling moves to one place: the plan's `## Held-out checks` names the task and
    // the test for the edges it holds out, and the reader takes the section in the form the plan
    // writes it. Two checks answer for it, and neither can pass on an empty map:
    //
    //   every row read      the section writes N rows (either the three-column table or the bullet
    //                       `- E.. -> T.. -> test`) and the reader returns N, so a row it drops is
    //                       named here rather than quietly falling back to `## Intent coverage`.
    //   every row's owner   the task a row names is one the plan's `## Intent coverage` table assigns
    //                       that edge's criterion, so the two tables cannot disagree about who holds
    //                       an edge.
    //
    // The comparison this replaces was `heldOut keys` against the edges the intent's Disposition
    // column marks `held-out`, and at this head it could not fail: every one of the intent's rows
    // states a criterion in that column (`criterion SC1`, ...), so both sides were `[]` and the plan's
    // eight-row mapping was never read at all.
    //
    // A milestone whose list is owned by another census cannot satisfy `every row's owner` here: the
    // plan's two tables are what that check reads, and M062's plan carries one disagreement of its own,
    // which its claim list states under `evidence.plan.disagreements`. So the live plan is held to the
    // half that needs no agreement, and the disagreements are held to the record that states them, in
    // both directions: a plan that grows a new one and a record that drops a stated one are each a red.
    const covered = intentCoverage(planSource);
    const heldOut = CLAIMS_OWNED_ELSEWHERE
      ? assertHeldOutRead(planSource, edges)
      : assertHeldOutMapping(planSource, edges, covered);
    if (CLAIMS_OWNED_ELSEWHERE) {
      const recorded = claimJson(
        CLAIMS_PATH,
        'the list is part of this repository',
      );
      const stated = recorded.evidence?.plan?.disagreements;
      assert.ok(
        Array.isArray(stated),
        `${CLAIMS_REL} must state the plan's cross-table disagreements under evidence.plan.disagreements, for the same reason this file refuses to derive them: a reader needs the citation and the disagreement in one place`,
      );
      assert.deepEqual(
        stated,
        heldOutDisagreements(edges, heldOut, covered),
        `${CLAIMS_REL} states the plan's cross-table disagreements as this head reads them`,
      );
    }

    // Every edge in the intent has a row in the plan: the held-out mapping above where the edge is
    // held out, and the `## Intent coverage` row for its criterion - and the suite that task's own
    // `files:` list declares - where it is not. Each one resolves to a test this checkout carries,
    // so no edge is left with a citation this suite cannot open.
    const tasksDir = join(dirname(planPath), '..', 'tasks');
    const mapped = [];
    for (const edge of edges) {
      const suite = suiteForEdge(edge, heldOut, covered, tasksDir);
      assert.ok(
        existsSync(join(CLAIM_ROOT, suite)),
        `${edge.edge} is mapped by the plan to ${suite}, which this checkout does not carry`,
      );
      mapped.push(`${edge.edge} -> ${suite}`);
    }
    const derived = derivedClaimsFrom(
      intentSource,
      planSource,
      intentPath,
      planPath,
    );
    for (const row of derived.claims) {
      assert.ok(
        existsSync(join(CLAIM_ROOT, row.artefactPath)),
        `${row.criterion} cites ${row.artefactPath}, which this checkout does not carry`,
      );
    }

    // A criterion's claim names every suite the plan resolves one of its edges to: the record and the
    // plan cannot cite two different proofs for one criterion, in either direction.
    if (CLAIMS_OWNED_ELSEWHERE) {
      const claimed = claimJson(
        CLAIMS_PATH,
        'the list is part of this repository',
      );
      for (const row of derived.claims) {
        const claim = claimed.claims.filter(
          (one) => one.criterion === row.criterion,
        )[0];
        const cited = (claim?.citations ?? []).map(
          (citation) => citation.suite,
        );
        for (const suite of row.suites) {
          assert.ok(
            cited.includes(suite),
            `${row.criterion} is held by the plan at ${suite}, and ${CLAIMS_REL} cites ${JSON.stringify(cited)}: the suite the milestone assigned the criterion must be cited`,
          );
        }
      }
    }

    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    assert.doesNotThrow(
      () => assertClaimedEdges(recording),
      `${CLAIMS_REL} names an edge id its artefact does not state`,
    );
    console.log(
      `${shown(planPath)} maps ${mapped.join(
        ', ',
      )} (${String(heldOut.size)} held-out row(s)); ${String(
        edges.length,
      )} edge row(s) read as five columns`,
    );
  });

  it("reads the plan's held-out rows in the form this plan writes, and reddens on a dropped row, a moved task or an absent suite", () => {
    const intentPath = intentPathForMilestone(CLAIM_ROOT, CLAIMS_MILESTONE);
    const planPath = planPathForIntent(intentPath);
    const intentSource = claimText(
      intentPath,
      `the intent ${CLAIMS_MILESTONE} binds`,
    );
    const planSource = claimText(
      planPath,
      `the plan ${CLAIMS_MILESTONE} binds`,
    );
    const edges = intentEdges(intentSource);
    const coverage = intentCoverage(planSource);
    const tasksDir = join(dirname(planPath), '..', 'tasks');

    // The control: every row the section writes is read, and every row's task is the task the
    // coverage table assigns that edge's criterion. Both halves are re-run below against copies, so
    // the checks that bite are the checks that pass here.
    const live = heldOutChecks(planSource);
    assert.equal(
      live.size,
      heldOutRowsWritten(planSource),
      'the live plan writes the rows the reader returns',
    );
    assert.ok(live.size > 0, 'the live plan writes at least one held-out row');

    /** One plan copy with its first held-out bullet rewritten by `edit`. */
    const rewritten = (edit) => {
      const section = sectionOf(planSource, '## Held-out checks');
      const line = section
        .split(/\r?\n/)
        .filter((entry) => HELD_OUT_BULLET.test(entry))[0];
      assert.ok(
        line !== undefined,
        `the plan writes its mapping as the bullet ${String(
          HELD_OUT_BULLET,
        )}, so a copy can rewrite a row`,
      );
      const row = /** @type {RegExpExecArray} */ (HELD_OUT_BULLET.exec(line));
      return planSource.replace(
        line,
        edit(String(row[3]), String(row[2]), line),
      );
    };

    // 1. A row the section writes and the reader does not parse: the first arrow of the first bullet
    // is rewritten to a colon. The row still names E1, so the section still writes eight rows, and the
    // reader returns seven - the count in the reading above is what reddens, naming both numbers.
    const unreadRow = rewritten((test, task, line) => line.replace('→', ':'));
    assert.notEqual(
      unreadRow,
      planSource,
      'the unread-row mutant changes the plan it was planted on',
    );
    assert.equal(
      heldOutRowsWritten(unreadRow),
      heldOutRowsWritten(planSource),
      'the row is still written, so the wider count still sees it',
    );
    assert.equal(
      heldOutChecks(unreadRow).size,
      live.size - 1,
      'the reader loses the row it cannot parse',
    );
    let unreadMessage = '';
    try {
      assertHeldOutMapping(unreadRow, edges, coverage);
    } catch (error) {
      unreadMessage = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      unreadMessage,
      /## Held-out checks writes 8 row\(s\) and the reader returned 7/,
      `a row the reader loses must redden naming the section and both counts; it produced ${JSON.stringify(unreadMessage.slice(0, 320))}`,
    );

    // 2. The row deleted outright. Nothing in the section says the edge was ever there, so no count
    // can see it, and the derivation does not refuse: `## Intent coverage` answers instead and SC3
    // cites whatever suite the first task covering SC3 happens to have added. Recorded as the drift
    // it is - the plan is the only statement of what it holds out.
    const e5 = sectionOf(planSource, '## Held-out checks')
      .split(/\r?\n/)
      .filter((entry) => /^\s*[-*]\s*E5\b/.test(entry))[0];
    // The plan is a CRLF document on this checkout and the section read above strips the `\r`, so the
    // row is cut with the line ending the document itself writes; a hard-coded `\n` matches no row and
    // the mutant would be a no-op that still named a defect.
    const documentEol = planSource.includes('\r\n') ? '\r\n' : '\n';
    const withoutRow = planSource.replace(`${e5}${documentEol}`, '');
    assert.equal(
      withoutRow.includes(e5),
      false,
      'the dropped-row mutant still carries the row it dropped',
    );
    assert.notEqual(
      withoutRow,
      planSource,
      'the dropped-row mutant changes the plan it was planted on',
    );
    assert.equal(
      heldOutChecks(withoutRow).has('E5'),
      false,
      'the deleted row is gone from the map',
    );
    const drifted = derivedClaimsFrom(
      intentSource,
      withoutRow,
      intentPath,
      planPath,
    );
    const sc3 = drifted.claims.filter((row) => row.criterion === 'SC3')[0];
    const fallback = suiteForEdge(
      { edge: 'E5', criterion: 'SC3' },
      new Map(),
      coverage,
      tasksDir,
    );
    assert.equal(
      sc3.artefactPath,
      fallback,
      `the edge no row names falls back to the suite ${fallback} the coverage table's task added`,
    );
    // The drift is the route, and at this head it is not visible as a different path: the suite
    // `## Intent coverage` resolves SC3 to is the same one the plan assigns E5 (`outlet-state.test.mjs`
    // is the suite M062's T001 added, and T001 is the task the coverage table assigns SC3). So the
    // reading states which of the two it measured rather than asserting a difference this plan does
    // not have — the row was never read either way, and the citation above is the fallback's.
    const assignedE5 = live.get('E5')?.test;
    assert.ok(
      assignedE5 !== undefined,
      'the plan assigns E5 a suite, so the fallback below is a drift away from a stated citation',
    );
    assert.equal(
      sc3.suites.length,
      1,
      'the drifted SC3 claim cites the one suite the fallback resolved',
    );

    // 3. A row whose task the plan's own coverage table does not assign that edge's criterion. T009
    // declares no file in this milestone, and the plan assigns SC1 to T001, T002, T004 and T005, so
    // the row and the coverage table disagree about who holds E1.
    const movedTask = rewritten((test, task, line) =>
      line.replace(`→ ${task} →`, '→ T009 →'),
    );
    let movedMessage = '';
    try {
      assertHeldOutMapping(movedTask, edges, coverage);
    } catch (error) {
      movedMessage = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      movedMessage,
      /put the same edge in two tasks/,
      `a held-out row naming a task the coverage table does not assign its criterion must redden naming the disagreement; it produced ${JSON.stringify(movedMessage.slice(0, 320))}`,
    );
    assert.match(
      movedMessage,
      /E1 to T009/,
      `the refusal names the edge and the task the mutated row states; it produced ${JSON.stringify(movedMessage.slice(0, 320))}`,
    );

    // 3. A row whose test names a suite this checkout does not carry.
    const absentSuite = 'scripts/absent-held-out-suite.test.mjs';
    const absent = rewritten(() => `- E1 → T002 → \`${absentSuite}\``);
    assert.equal(
      existsSync(join(CLAIM_ROOT, absentSuite)),
      false,
      'the wildcard names a suite this checkout does not carry',
    );
    let carriedMessage = '';
    try {
      assertHeldOutMapping(absent, edges, coverage);
    } catch (error) {
      carriedMessage = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      carriedMessage,
      /absent-held-out-suite\.test\.mjs/,
      `a row naming a suite this checkout does not carry must redden naming the path; it produced ${JSON.stringify(carriedMessage.slice(0, 320))}`,
    );
    let refused = '';
    try {
      derivedClaimsFrom(intentSource, absent, intentPath, planPath);
    } catch (error) {
      refused = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      refused,
      /absent-held-out-suite\.test\.mjs/,
      `and the derivation cannot cite it either: it must redden naming the path rather than write a row that cites nothing; it produced ${JSON.stringify(refused.slice(0, 320))}`,
    );

    // And the live plan still derives the citations the plan assigns, one suite per criterion where
    // the plan holds every edge of a criterion by one suite and every suite it names where it does
    // not: the four mutations above changed copies, and the rows read from the plan are what the
    // claims cite. A milestone whose list another census owns cannot have its two tables agreed here,
    // so the live plan is held to the half that needs no agreement and the disagreements are held to
    // the record that states them.
    if (CLAIMS_OWNED_ELSEWHERE) {
      const liveHeldOut = assertHeldOutRead(planSource, edges);
      const claimed = claimJson(
        CLAIMS_PATH,
        'the list is part of this repository',
      );
      assert.deepEqual(
        claimed.evidence?.plan?.disagreements ?? null,
        heldOutDisagreements(edges, liveHeldOut, coverage),
        `${CLAIMS_REL} states the plan's cross-table disagreements as this head reads them`,
      );
    } else {
      assertHeldOutMapping(planSource, edges, coverage);
    }
    const derived = derivedClaimsFrom(
      intentSource,
      planSource,
      intentPath,
      planPath,
    );
    for (const row of derived.claims) {
      const held = [
        ...new Set(
          edges
            .filter((edge) => edge.criterion === row.criterion)
            .map((edge) => live.get(edge.edge)?.test),
        ),
      ];
      assert.deepEqual(
        row.suites,
        held,
        `${row.criterion} cites every suite the plan's held-out rows assign its edges, and it cites ${JSON.stringify(row.suites)} against ${JSON.stringify(held)}`,
      );
      for (const suite of row.suites) {
        assert.ok(
          existsSync(join(CLAIM_ROOT, suite)),
          `${row.criterion} cites ${suite}, which this checkout does not carry`,
        );
      }
      assert.ok(
        coverage.some((one) => one.criterion === row.criterion),
        `${row.criterion} is a criterion the plan's coverage table assigns a task`,
      );
      assert.ok(
        suiteForEdge(
          edges.filter((edge) => edge.criterion === row.criterion)[0],
          live,
          coverage,
          tasksDir,
        ) === row.artefactPath,
        `${row.criterion}'s first edge resolves through the held-out map rather than through the fallback`,
      );
    }
    console.log(
      `held-out read: ${String(live.size)} row(s) of ${String(
        heldOutRowsWritten(planSource),
      )} written; unread row -> ${unreadMessage.split('\n')[0]}; deleted E5 row -> SC3 cites ${
        sc3.artefactPath
      } through ## Intent coverage against ${String(
        assignedE5,
      )} the plan assigns E5 (${sc3.artefactPath === assignedE5 ? 'the same suite, so the drift is the route' : 'a different suite, so the drift is the path'}); moved task -> ${
        movedMessage.split('\n')[0]
      }; absent suite -> ${carriedMessage.split('\n')[0]}`,
    );
  });

  it('reddens a six-column edge table by naming its column count', () => {
    const intentPath = intentPathForMilestone(CLAIM_ROOT, CLAIMS_MILESTONE);
    const intentSource = claimText(
      intentPath,
      `the intent ${CLAIMS_MILESTONE} binds`,
    );
    // The control: the live table is the five-column grammar, and it yields rows.
    assert.ok(intentEdges(intentSource).length > 0);

    // The mutant restores the six-column read: the old table shape with a Test cell between
    // Disposition and Detail. The parser must redden naming the count it read, not skip the rows and
    // then report an empty table.
    const six = sixColumnEdgeTable(intentSource);
    let message = '';
    try {
      intentEdges(six);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      message,
      /carries 6 column\(s\)/,
      `the restored six-column read must redden naming its column count; it produced ${JSON.stringify(message.slice(0, 320))}`,
    );
    assert.match(
      message,
      /5 columns/,
      `the refusal must name the five-column grammar the ruling makes authoritative; it produced ${JSON.stringify(message.slice(0, 320))}`,
    );
    console.log(`six-column mutant: ${message.split('\n')[0]}`);
  });

  it('refuses a held-out test this checkout does not carry', () => {
    const intentPath = intentPathForMilestone(CLAIM_ROOT, CLAIMS_MILESTONE);
    const planPath = planPathForIntent(intentPath);
    const intentSource = claimText(
      intentPath,
      `the intent ${CLAIMS_MILESTONE} binds`,
    );
    const planSource = claimText(
      planPath,
      `the plan ${CLAIMS_MILESTONE} binds`,
    );
    // The mutant joins the try it feeds: on a plan whose `## Held-out checks` is prose the helper has
    // no row to plant, so what the derivation is left holding is the helper's own refusal, and that
    // refusal is this assertion's subject. The call used to sit outside the try because it was
    // expected to plant a row; it rewrote the section to itself instead and re-entered until
    // `Maximum call stack size exceeded`, naming the stack rather than the reason.
    let message = '';
    try {
      const broken = replaceFirstHeldOutTest(
        planSource,
        'scripts/absent-held-out-suite.test.mjs',
      );
      derivedClaimsFrom(intentSource, broken, intentPath, planPath);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      message,
      /## Held-out checks/,
      `a plan that gives the mutant no row must be refused by naming the section it read; it produced ${JSON.stringify(message.slice(0, 320))}`,
    );
    assert.match(
      message,
      /no seedable table row/,
      `the refusal must name the row the plan gives it no place to seed, rather than the stack it recursed into; it produced ${JSON.stringify(message.slice(0, 320))}`,
    );
    console.log(`held-out refusal: ${message.split('\n')[0]}`);
  });

  it('refuses a held-out test this checkout does not carry, seeding a row where the plan carries a table', () => {
    const intentPath = intentPathForMilestone(CLAIM_ROOT, CLAIMS_MILESTONE);
    const planPath = planPathForIntent(intentPath);
    const intentSource = claimText(
      intentPath,
      `the intent ${CLAIMS_MILESTONE} binds`,
    );
    const planSource = claimText(
      planPath,
      `the plan ${CLAIMS_MILESTONE} binds`,
    );

    // The refusal above must not have been bought by losing the branch that works: a plan whose
    // `## Held-out checks` carries the three-column table has a separator to seed behind, and the
    // milestone that runs no held-out check is exactly the case that branch exists for. The table is
    // put on a copy in memory - header and separator, no `E` row - so the seed is what plants the row
    // the mutant then rewrites, and the checkout is never written.
    const section = sectionOf(planSource, '## Held-out checks');
    const table = ['', '| Edge | Task | Test |', '|---|---|---|', ''].join(
      '\n',
    );
    const withTable = planSource.replace(section, table);
    assert.notEqual(
      withTable,
      planSource,
      'the copy must carry the three-column table in place of the prose, and the replacement changed nothing',
    );
    assert.equal(
      heldOutChecks(withTable).size,
      0,
      'the copy must carry no held-out row, so the row the mutant rewrites is the one the seed plants',
    );

    const broken = replaceFirstHeldOutTest(
      withTable,
      'scripts/absent-held-out-suite.test.mjs',
    );
    assert.match(
      broken,
      /\|\s*E1\s*\|\s*T000\s*\|\s*scripts\/absent-held-out-suite\.test\.mjs\s*\|/,
      `the seed must plant a row behind the separator and the mutant must rewrite its Test cell; the copy carries ${JSON.stringify(sectionOf(broken, '## Held-out checks').slice(0, 320))}`,
    );
    assert.deepEqual(
      [...heldOutChecks(broken).entries()],
      [
        [
          'E1',
          { task: 'T000', test: 'scripts/absent-held-out-suite.test.mjs' },
        ],
      ],
      'the seeded row must be the held-out mapping the derivation reads',
    );

    let message = '';
    try {
      derivedClaimsFrom(intentSource, broken, intentPath, planPath);
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    // The path the seeded row cites is one this checkout does not carry, so the derivation's refusal
    // names an absent suite rather than a suite that is there. E1's criterion still holds a second edge
    // the plan resolves through `## Intent coverage`, so the refusal is the one-citation rule doing its
    // work over the seeded row; the absent path is in the holders it lists either way.
    assert.equal(
      existsSync(join(CLAIM_ROOT, 'scripts/absent-held-out-suite.test.mjs')),
      false,
      'the wildcard must name a suite this checkout does not carry, or the refusal it proves is not the one the row states',
    );
    assert.match(
      message,
      /absent-held-out-suite\.test\.mjs/,
      `a seeded row citing a suite this checkout does not carry must redden the derivation naming the path; it produced ${JSON.stringify(message.slice(0, 320))}`,
    );
    console.log(`held-out seed: ${message.split('\n')[0]}`);
  });

  it('reddens when a row names prose where an edge id belongs', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    assert.doesNotThrow(() => assertClaimedEdges(recording));
    const planted = clone(recording);
    planted.claims[0].artefact = planted.claims[0].artefact.replace(
      /edge \["E\d+"/,
      'edge ["not-an-edge"',
    );
    let message = '';
    try {
      assert.doesNotThrow(() => assertClaimedEdges(planted));
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    assert.match(
      message,
      /an edge id is E followed by digits/,
      `a row that names prose where an edge id belongs must redden; it produced ${JSON.stringify(message.slice(0, 320))}`,
    );
  });
});
