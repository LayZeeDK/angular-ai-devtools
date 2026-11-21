// @ts-check
// Run: node --test scripts/tutor-routing.test.mjs
//
// M058 T002 builds `extension/tutor-routing.js` — the pure join `tutorRouting(records)` — and then
// mutates it in memory, one defect at a time, because a pin nobody has watched fail is a comment with
// an assertion around it. The join reads exactly the two records T001 measured
// (`research/raw/m058-record-shapes.json`): the recorded navigation stream
// (`research/raw/m041-navigation.json`) and the recorded router config
// (`research/raw/m030-router-config.json`). Every field it renders is a field one of those two records
// states — the terminal event's class, its `id` and that class's own fields; the config entry's own
// `path` and the fields it states — and every claim carries the artefact path that states it.
//
// The suite proves, rather than assumes, the five things the answer can lie about:
//
//   SC1  the terminal is the class the stream recorded for the `id` asked about, never a class it did
//        not record and never a verdict about the navigation's outcome; the route is the config entry
//        the navigation's own address names, never the entry its final URL names.
//   SC2  a navigation the stream recorded a start for and no terminal for is `cannot-tell` naming the
//        last class recorded for that id and nothing else: no destination from the address bar, from
//        `router.url` or from `currentNavigation()`'s fields.
//   SC3  the two absences are two states on one navigation, never folded into one "no findings" answer
//        or one absent-field list, `shouldActivate` is never rendered as any guard's verdict, no
//        refusal is inferred from the terminal class, and a config entry's `redirectTo` is a
//        configuration fact and never the redirect that decided the navigation (held out E5).
//   SC4  every `path` the answer renders is one the config records, and a URL segment no configured
//        path matches is named unconfigured beside the paths that were compared, never resolved to the
//        wildcard `**` or to a `redirectTo` row.
//   SC5  attribution is by `id` and `route.path` in each event's own payload, never by arrival
//        position: across a reused `id` the abandoned navigation's own `RouteConfigLoadEnd` is never
//        given to the successor (held out E7).
//
// Purity is proved by running the module in a bare `node:vm` context with nothing in it, by a scan of
// its code for every reach a pure join must not have, and by an answer that does not move when the
// record gains an address bar, a `router.url`, a `currentNavigation()` or a clock.
//
// Every fixture below is either a frame of `research/raw/m041-navigation.json` or a shape that record
// states (`GuardsCheckEnd`, `RouteConfigLoadStart` naming `**`, a config row naming a guard), so the
// suite reads the records rather than inventing what the router emits.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The module this task authors, and the records it is read against. */
const JOIN = 'extension/tutor-routing.js';
const NAV = 'research/raw/m041-navigation.json';
const CONFIG = 'research/raw/m030-router-config.json';
const SHAPES = 'research/raw/m058-record-shapes.json';
const AGENT = 'extension/agent-main.js';

const JOIN_SOURCE = readFileSync(join(ROOT, JOIN), 'utf8');
const NAVIGATION = JSON.parse(readFileSync(join(ROOT, NAV), 'utf8'));
const CONFIG_RECORD = JSON.parse(readFileSync(join(ROOT, CONFIG), 'utf8'));
const RECORD_SHAPES = JSON.parse(readFileSync(join(ROOT, SHAPES), 'utf8'));

/** The two states, the two absences and the eight fields, exactly as the contract lists them. */
const STATES = ['answered', 'cannot-tell'];
const ABSENCES = ['no-guard-verdict', 'no-redirect-decision'];
const ANSWER_FIELDS = [
  'absences',
  'claims',
  'detail',
  'question',
  'route',
  'state',
  'terminal',
  'unconfigured',
];
const CLAIM_FIELDS = ['artefactPath', 'claim', 'values'];

/** The claim names the answer renders, from the contract's own list. */
const CLAIMS = [
  'absence',
  'cannot-tell',
  'route',
  'route-config-load',
  'terminal',
  'unconfigured',
];

/** The config's five fields (C2), and the four an entry may state. */
const CONFIG_FIELDS = [
  'path',
  'component',
  'redirectTo',
  'canActivate',
  'loadChildren',
];

/** The record's own configured rows: 18 of them, and the paths they state ({@link CONFIG_RECORD}). */
const CONFIG_ROWS = CONFIG_RECORD.config;

/** The terminal key sets the recording measured, by class. */
const TERMINAL_KEYS = {
  NavigationEnd: ['id', 'type', 'url', 'urlAfterRedirects'],
  NavigationCancel: ['code', 'id', 'reason', 'type', 'url'],
  NavigationError: ['error', 'id', 'target', 'type', 'url'],
  NavigationSkipped: ['code', 'id', 'reason', 'type', 'url'],
};

/** The reaches a pure join must not have, scanned over the module's code (its comments stripped). */
const REACHES = [
  'require(',
  'import ',
  'fetch(',
  'XMLHttpRequest',
  'new Date',
  'Date.now',
  'Math.random',
  'performance.now',
  'localStorage',
  'document.',
  'window.',
  'chrome.',
  'process.',
  'setTimeout',
  'setInterval',
  'readFileSync',
  'angularAiTutorSignals',
  'angularAiRenderer',
];

/** The fields the records carry that the join must never read, as reads (`record.field`). */
const IGNORED_READS = [
  /\.routerUrl\b/,
  /\.addressBar\b/,
  /\.currentNavigation\b/,
  /\.finalUrl\b/,
  /\.navResolved\b/,
  /\.cause\b/,
];

// ------------------------------------------------------------------------------------------------
// Loading: the module as it sits on disk, or as this file mutates it in memory.
// ------------------------------------------------------------------------------------------------

/** A vm-realm value as a plain value, so a deepEqual compares data and not two realms' prototypes. */
/** @param {any} value */
function copyOf(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One file's code with its comments removed: the doc comments are prose and decide nothing. */
/** @param {string} source */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** A file's lines, for the citation checks. @param {string} path */
function linesOf(path) {
  return readFileSync(join(ROOT, path), 'utf8').split(/\r?\n/);
}

/** `extension/tutor-routing.js` in a bare context with nothing in it. */
/** @param {string} [source] */
function loadJoin(source = JOIN_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiTutorRouting;
  assert.ok(api, `${JOIN} publishes angularAiTutorRouting`);
  assert.equal(
    typeof api.tutorRouting,
    'function',
    `${JOIN} exports tutorRouting`,
  );
  return api;
}

/** One answer for the records handed over, as plain data. */
/** @param {any} api @param {any} records */
function ask(api, records) {
  const answer = api.tutorRouting(records);
  assert.ok(
    answer && typeof answer === 'object',
    'the join answers an object for the records it was handed',
  );
  return copyOf(answer);
}

// ------------------------------------------------------------------------------------------------
// The fixtures. Each is a frame the navigation record carries, or a shape it states.
// ------------------------------------------------------------------------------------------------

/** One recorded event, as the record writes it: the `class` and the `payload` it emitted. */
/** @param {string} cls @param {any} payload */
function event(cls, payload) {
  return { class: cls, payload };
}

/** The router config record: its own rows and the artefact path that states them. */
/** @param {any[]} [rows] */
function configRecord(rows = CONFIG_ROWS) {
  return { path: CONFIG, config: rows };
}

/** The recorded config plus the `**` row the portal's table carries (E6). */
function wildcardConfig() {
  return CONFIG_ROWS.concat([{ path: '**', component: '[fn _Unmatched]' }]);
}

/** The records of one recorded frame, asked about one navigation `id`. */
/** @param {any} frame @param {number} id @param {string} question @param {any} [config] */
function frameRecords(frame, id, question, config = configRecord()) {
  return {
    navigation: { path: NAV, id: id, question: question, events: frame.events },
    config: config,
  };
}

/** The held navigation: `NavigationStart` then `RouteConfigLoadStart`, and no terminal (E2). */
function heldNavigation() {
  return {
    path: NAV,
    id: 2,
    question: NAVIGATION.held.question,
    events: NAVIGATION.held.inFlight.events,
  };
}

/** The held navigation's records, decorated with the fields the record states beside it. */
/** @param {Record<string, any>} [decoration] */
function heldRecords(decoration = {}) {
  return {
    navigation: heldNavigation(),
    config: configRecord(),
    ...decoration,
  };
}

/**
 * A URL no configured path matches, as the portal's unmatched navigation recorded it: the recognition
 * loads the `**` route (`absences.guard-verdict-not-recorded.refusedGuardVersusUnmatchedUrl`), the
 * guard check passes, and the navigation ends `NavigationEnd`.
 */
function unmatchedNavigation() {
  const url = '/this-route-does-not-exist';
  return {
    path: NAV,
    id: 7,
    question: 'Which route node does a URL no configured path matches name?',
    events: [
      event('NavigationStart', {
        id: 7,
        navigationTrigger: 'imperative',
        restoredState: null,
        type: 0,
        url: url,
      }),
      event('RouteConfigLoadStart', { route: { path: '**' }, type: 9 }),
      event('RoutesRecognized', {
        id: 7,
        state: { url: url },
        type: 4,
        url: url,
        urlAfterRedirects: url,
      }),
      event('GuardsCheckStart', {
        id: 7,
        state: { url: url },
        type: 7,
        url: url,
        urlAfterRedirects: url,
      }),
      event('GuardsCheckEnd', {
        id: 7,
        shouldActivate: true,
        state: { url: url },
        type: 8,
        url: url,
        urlAfterRedirects: url,
      }),
      event('NavigationEnd', {
        id: 7,
        type: 1,
        url: url,
        urlAfterRedirects: url,
      }),
      event('RouteConfigLoadEnd', { route: { path: '**' }, type: 10 }),
    ],
  };
}

/** The fixture's one guard-carrying row: `gated` declares `canActivate: ["[fn redirectGuard]"]`. */
function gatedNavigation() {
  return {
    path: NAV,
    id: 9,
    question: 'Which guard does this navigation name?',
    events: [
      event('NavigationStart', {
        id: 9,
        navigationTrigger: 'imperative',
        restoredState: null,
        type: 0,
        url: '/gated',
      }),
      event('GuardsCheckStart', {
        id: 9,
        state: { url: '/gated' },
        type: 7,
        url: '/gated',
        urlAfterRedirects: '/gated',
      }),
      event('GuardsCheckEnd', {
        id: 9,
        shouldActivate: true,
        state: { url: '/gated' },
        type: 8,
        url: '/gated',
        urlAfterRedirects: '/gated',
      }),
      event('NavigationEnd', {
        id: 9,
        type: 1,
        url: '/gated',
        urlAfterRedirects: '/gated',
      }),
    ],
  };
}

/** A route-config load, as the claim renders it. @param {any} claim */
function loadOfClaim(claim) {
  return String(claim.values.class) + ':' + String(claim.values.routePath);
}

// ------------------------------------------------------------------------------------------------
// The pins. Each is green on the module as it sits on disk and reddens on the mutation it names.
// ------------------------------------------------------------------------------------------------

/**
 * SC1, E1, E3, E10: `answered` names the terminal the stream recorded and the config entry the
 * navigation's own address names, by their own fields, and every claim carries its artefact path.
 * @param {any} api
 * @param {string} [source]
 */
function pinAnsweredFromTheRecord(api, source = JOIN_SOURCE) {
  const answer = ask(api, frameRecords(NAVIGATION.terminals.redirect, 2, ''));

  assert.equal(
    answer.state,
    'answered',
    `a navigation whose stream recorded a terminal answers answered, and the join said "${answer.state}"`,
  );
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_FIELDS,
    'an answer carries the contract\u2019s eight fields and nothing else',
  );
  assert.deepEqual(
    answer.terminal,
    {
      class: 'NavigationEnd',
      id: 2,
      type: 1,
      url: '/redirect',
      urlAfterRedirects: '/landing',
    },
    `the terminal is the event the stream recorded, with its own id and that class's own fields \u2014 the redirect frame ends NavigationEnd for id 2 with url "/redirect" and urlAfterRedirects "/landing" \u2014 and the answer rendered ${JSON.stringify(answer.terminal)}`,
  );
  assert.deepEqual(
    Object.keys(answer.terminal).sort(),
    ['class'].concat(TERMINAL_KEYS.NavigationEnd).sort(),
    `a terminal carries its class and that class's own fields and no other class's: NavigationEnd carries ${TERMINAL_KEYS.NavigationEnd.join(', ')} and the answer rendered ${JSON.stringify(answer.terminal)}`,
  );
  assert.deepEqual(
    answer.route,
    { path: 'redirect', redirectTo: 'landing' },
    `the route is the config entry the navigation's own url names, by that entry's own path and the fields it states \u2014 the terminal states url "/redirect", the config records the entry path "redirect" with redirectTo "landing" \u2014 and never the entry its final URL names, which is "landing": the answer rendered ${JSON.stringify(answer.route)}`,
  );

  for (const claim of answer.claims) {
    assert.deepEqual(
      Object.keys(claim).sort(),
      CLAIM_FIELDS,
      `every claim carries a name, the values it renders and the artefact path that states it: ${JSON.stringify(claim)}`,
    );
    assert.equal(
      typeof claim.artefactPath,
      'string',
      `a claim carries the artefact path that states it, and a claim with no artefact path is not an answer this module produces: ${JSON.stringify(claim)}`,
    );
    assert.ok(
      claim.artefactPath.length > 0,
      `no claim renders an empty artefact path: ${JSON.stringify(claim)}`,
    );
    assert.equal(
      CLAIMS.includes(claim.claim),
      true,
      `a claim is one of the contract's ${CLAIMS.length} names, and this one rendered ${JSON.stringify(claim.claim)}`,
    );
  }

  const terminalClaims = answer.claims.filter(
    (claim) => claim.claim === 'terminal',
  );
  assert.equal(
    terminalClaims.length,
    1,
    'the terminal is one rendered claim, so there is one place the class could be misread',
  );
  assert.deepEqual(
    terminalClaims[0].values,
    { class: 'NavigationEnd', id: 2 },
    'the terminal claim carries the event it rests on \u2014 the class and the id \u2014 and nothing else',
  );
  assert.equal(
    terminalClaims[0].artefactPath,
    NAV,
    `the stream-side claim cites the navigation record's own path, and this one rendered ${JSON.stringify(terminalClaims[0].artefactPath)}`,
  );

  const routeClaims = answer.claims.filter((claim) => claim.claim === 'route');
  assert.equal(routeClaims.length, 1, 'the route is one rendered claim');
  assert.deepEqual(
    routeClaims[0].values,
    { path: 'redirect' },
    'the route claim carries the config entry it rests on by that entry\u2019s own path',
  );
  assert.equal(
    routeClaims[0].artefactPath,
    CONFIG,
    'the config-side claim cites the config record\u2019s own path',
  );

  assert.equal(
    codeOf(source).includes('artefactPath: artefactPath'),
    true,
    'the shipped claim builder takes the path as an argument, so no claim can be built without one',
  );

  // The question is the frame's own field, verbatim, and the detail is the join's own sentence.
  const asked = ask(
    api,
    frameRecords(NAVIGATION.warm, 2, NAVIGATION.warm.question),
  );
  assert.equal(
    asked.question,
    NAVIGATION.warm.question,
    'the question is the frame\u2019s own field, verbatim',
  );
  assert.ok(
    asked.detail.length > 0 && typeof asked.detail === 'string',
    'the answer states its own sentence about what it read',
  );

  // A frame that carries one navigation needs no `id` handed over: the id is the one its own events
  // carry, read from the record and never guessed.
  const derived = ask(api, {
    navigation: {
      path: NAV,
      question: NAVIGATION.warm.question,
      events: NAVIGATION.warm.events,
    },
    config: configRecord(),
  });
  assert.deepEqual(
    derived,
    asked,
    `the id asked about is the one the stream\u2019s own events carry where the caller names none, so the answer is the same answer: the record states ${JSON.stringify(NAVIGATION.warm.terminal.payload.id)}`,
  );
}

/**
 * SC1: a record that cannot state an artefact path answers cannot-tell rather than a claim with no
 * path, so "an answer with no artefact path is not an answer this module can produce" is structural
 * and not a promise.
 * @param {any} api
 */
function pinRecordsWithoutProvenance(api) {
  const cases = [
    ['no navigation record', { config: configRecord() }],
    [
      'a navigation record naming no path',
      {
        navigation: { id: 2, events: NAVIGATION.warm.events },
        config: configRecord(),
      },
    ],
    [
      'a navigation record naming no id and a stream that names none',
      { navigation: { path: NAV, events: [] }, config: configRecord() },
    ],
    ['no router config record', { navigation: heldNavigation() }],
    [
      'a config record naming no path',
      { navigation: heldNavigation(), config: { config: CONFIG_ROWS } },
    ],
  ];

  for (const [id, records] of cases) {
    const answer = ask(api, records);
    assert.equal(
      answer.state,
      'cannot-tell',
      `a records object that cannot produce a claim carrying an artefact path answers cannot-tell rather than a claim with no path: ${id} answered ${JSON.stringify(answer.state)}`,
    );
    assert.equal(
      answer.terminal,
      null,
      `the absence ${id} names no terminal, because no readable stream states one`,
    );
    assert.equal(answer.route, null, `the absence ${id} names no route node`);
    assert.equal(
      answer.unconfigured,
      null,
      `the absence ${id} names no unconfigured segment`,
    );
    assert.deepEqual(
      answer.absences,
      [],
      `the absence ${id} decides no absence`,
    );
    for (const claim of answer.claims) {
      assert.equal(
        typeof claim.artefactPath,
        'string',
        `every claim the absence ${id} renders carries an artefact path, and this one rendered ${JSON.stringify(claim)}`,
      );
      assert.ok(
        claim.artefactPath.length > 0,
        `no claim the absence ${id} renders has an empty artefact path: ${JSON.stringify(claim)}`,
      );
    }
  }
}

/**
 * SC1, E1: the terminal class is the one the stream recorded for that id — never a class the stream
 * did not record.
 * @param {any} api
 */
function pinTerminalClassIsTheRecordedOne(api) {
  const cases = [
    ['warm', NAVIGATION.warm, 2, 'NavigationEnd'],
    ['redirect', NAVIGATION.terminals.redirect, 2, 'NavigationEnd'],
    ['superseded (abandoned)', NAVIGATION.superseded, 2, 'NavigationCancel'],
    ['superseded (successor)', NAVIGATION.superseded, 3, 'NavigationEnd'],
    ['skip', NAVIGATION.terminals.skip, 3, 'NavigationSkipped'],
    ['error', NAVIGATION.terminals.error, 2, 'NavigationError'],
  ];

  for (const [id, frame, asked, expected] of cases) {
    const answer = ask(api, frameRecords(frame, asked, ''));
    assert.equal(
      answer.terminal.class,
      expected,
      `the terminal names the class the stream recorded for the id asked about, and never a class the stream did not record: the ${id} frame records ${expected} for id ${asked} and the answer named ${JSON.stringify(answer.terminal.class)}`,
    );
    assert.equal(
      answer.terminal.id,
      asked,
      `the terminal carries the navigation id the event itself carries: the ${id} frame was asked about id ${asked} and the answer rendered ${JSON.stringify(answer.terminal.id)}`,
    );
  }

  // A refused canMatch and an unmatched URL are the same eleven events ending NavigationEnd: the class
  // is read from the event, never from whether the navigation is thought to have succeeded.
  const refusal =
    NAVIGATION.absences['guard-verdict-not-recorded']
      .refusedGuardVersusUnmatchedUrl;
  assert.equal(
    refusal.comparison.terminalClassEqual,
    true,
    'the record states a refusal and an unmatched URL end in the same terminal class, so no class can be read as a verdict',
  );
  assert.equal(
    refusal.comparison.hasNavigationCancelInEither,
    false,
    'neither of those navigations records a NavigationCancel, so a refusal is never inferred from the terminal class',
  );
}

/**
 * SC2, E2: a navigation the stream records a start for and no terminal for is cannot-tell naming the
 * last event class the stream recorded for that id, and nothing else.
 * @param {any} api
 * @param {string} [source]
 */
function pinHeldCannotTell(api, source = JOIN_SOURCE) {
  const held = NAVIGATION.held.inFlight;
  const answer = ask(api, heldRecords());

  // The record's own shape first, so this leg is measured and not assumed.
  assert.equal(
    held.hasTerminalEvent,
    false,
    'the held frame records no terminal',
  );
  assert.equal(held.eventCount, 2, 'the held frame records two events');
  assert.equal(
    NAVIGATION.held.stillInFlightLater.lastEventClass,
    held.lastEventClass,
    'the record states the same last class 738.2 ms later',
  );
  assert.equal(
    NAVIGATION.held.currentNavigation.values.finalUrl,
    'absent',
    'currentNavigation() carries no finalUrl at the hold, which is why no destination can be read from it',
  );

  assert.equal(
    answer.state,
    'cannot-tell',
    `a navigation the stream recorded a start for and no terminal for the id asked about is reported cannot-tell, and never reported as landed: the join said "${answer.state}"`,
  );
  assert.equal(
    answer.terminal,
    null,
    'cannot-tell names no terminal class, because the stream recorded none',
  );
  assert.equal(
    answer.route,
    null,
    'cannot-tell names no route node, because no terminal states an address to match',
  );
  assert.deepEqual(
    answer.absences,
    [],
    'cannot-tell decides no absence: a navigation the stream never terminated has no urlAfterRedirects to compare and no guard stage to judge',
  );
  assert.equal(
    answer.unconfigured,
    null,
    'cannot-tell names no unconfigured segment, because that would name the address it may not name',
  );
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_FIELDS,
    'cannot-tell carries the same eight fields as answered',
  );

  const claim = answer.claims[0];
  assert.equal(
    answer.claims.length,
    1,
    'cannot-tell renders one claim: the last class it names',
  );
  assert.deepEqual(
    claim.values,
    { id: 2, lastClass: held.lastEventClass },
    `the claim names the last event class the stream recorded for that id \u2014 the record states ${JSON.stringify(held.lastEventClass)} \u2014 and the answer rendered ${JSON.stringify(claim.values)}`,
  );
  assert.equal(
    claim.artefactPath,
    NAV,
    'the claim cites the navigation record that states the class',
  );
  assert.ok(
    answer.detail.includes(held.lastEventClass),
    `cannot-tell states the last class the stream recorded in its own sentence: ${answer.detail}`,
  );
  assert.equal(
    codeOf(source).includes('no terminal event for that id'),
    true,
    'the shipped module states the absence as an absence, in its own sentence',
  );
}

/** A marker no record states, so a read of it cannot hide behind a value the record already carries. */
/** @param {any} api */
function pinHeldNoAddressBar(api) {
  const plain = ask(api, heldRecords());
  const answer = ask(
    api,
    heldRecords({ addressBar: { url: 'the-address-bar' } }),
  );
  const rendered = JSON.stringify(answer);

  assert.equal(
    rendered.includes('the-address-bar'),
    false,
    `cannot-tell reads no destination from the address bar: a records object carrying an address bar changes nothing this module reports, and the answer rendered ${rendered}`,
  );
  assert.deepEqual(
    answer,
    plain,
    'a records object carrying an address bar answers exactly as one that does not',
  );
}

/** @param {any} api */
function pinHeldNoRouterUrl(api) {
  const plain = ask(api, heldRecords());
  const answer = ask(api, heldRecords({ routerUrl: '/home' }));
  const rendered = JSON.stringify(answer);

  assert.equal(
    rendered.includes('/home'),
    false,
    `cannot-tell reads no destination from router.url: the record states router.url still /home at the hold and 738.2 ms later, and the answer rendered ${rendered}`,
  );
  assert.deepEqual(
    answer,
    plain,
    'a records object carrying router.url answers exactly as one that does not',
  );
}

/** @param {any} api */
function pinHeldNoCurrentNavigation(api) {
  const plain = ask(api, heldRecords());
  const answer = ask(
    api,
    heldRecords({
      currentNavigation: {
        values: {
          finalUrl: 'the-final-url',
          initialUrl: '/complaint/list',
          targetBrowserUrl: 'the-target-browser-url',
        },
      },
    }),
  );
  const rendered = JSON.stringify(answer);

  assert.equal(
    rendered.includes('the-final-url'),
    false,
    `cannot-tell reads no destination from currentNavigation()'s fields: the record states finalUrl absent at the hold, and the answer rendered ${rendered}`,
  );
  assert.equal(
    rendered.includes('/complaint'),
    false,
    `cannot-tell reads no destination from currentNavigation()'s initialUrl either: the answer rendered ${rendered}`,
  );
  assert.deepEqual(
    answer,
    plain,
    'a records object carrying currentNavigation() answers exactly as one that does not',
  );
}

/**
 * SC3, E5 (held out): both absences on one navigation stay two states, neither folded into one "no
 * findings" answer nor into one absent-field list.
 * @param {any} api
 * @param {string} [source]
 */
function pinTwoAbsences(api, source = JOIN_SOURCE) {
  const redirect = NAVIGATION.terminals.redirect;
  const answer = ask(api, frameRecords(redirect, 2, ''));

  // The record's own shape first: the redirect is a url change and nothing else.
  assert.equal(
    redirect.eventCount,
    11,
    'the redirect frame records eleven events',
  );
  assert.equal(
    redirect.cancelCount,
    0,
    'the redirect frame records no NavigationCancel',
  );
  assert.equal(
    redirect.terminal.payload.url,
    '/redirect',
    'the terminal states the url the navigation was made to',
  );
  assert.equal(
    redirect.terminal.payload.urlAfterRedirects,
    '/landing',
    'the terminal states the url the redirect produced',
  );
  const cancellation = NAVIGATION.events.codes.cancellation.filter(
    (code) => code.name === 'Redirect',
  );
  assert.equal(
    cancellation.length,
    1,
    'the record enumerates the Redirect code',
  );
  assert.equal(
    cancellation[0].value,
    0,
    'NavigationCancellationCode.Redirect is 0',
  );
  assert.equal(
    cancellation[0].producedByARun,
    false,
    'no run in the record produced a cancellation code 0',
  );

  assert.equal(
    answer.absences.length,
    2,
    `both absences hold on this one navigation and stay two states \u2014 never folded into one "no findings" answer nor into one absent-field list: the answer rendered ${JSON.stringify(answer.absences.map((absence) => absence.state))}`,
  );
  assert.deepEqual(
    answer.absences.map((absence) => absence.state),
    ABSENCES,
    `the two absences are the two the contract names, in the order this module decides them: ${JSON.stringify(answer.absences.map((absence) => absence.state))}`,
  );
  const details = answer.absences.map((absence) => absence.detail);
  assert.equal(
    new Set(details).size,
    2,
    `each absence states its own sentence and never the other's: ${JSON.stringify(details)}`,
  );
  assert.ok(
    answer.absences[0].detail.includes('no-guard-verdict'),
    `the guard-verdict absence names itself: ${answer.absences[0].detail}`,
  );
  assert.ok(
    answer.absences[1].detail.includes('no-redirect-decision'),
    `the redirect-decision absence names itself: ${answer.absences[1].detail}`,
  );
  assert.equal(
    answer.absences[0].detail.includes('no-redirect-decision'),
    false,
    'the guard-verdict absence never names the other absence',
  );
  assert.equal(
    answer.absences[1].detail.includes('no-guard-verdict'),
    false,
    'the redirect-decision absence never names the other absence',
  );
  assert.ok(
    answer.detail.includes('no-guard-verdict') &&
      answer.detail.includes('no-redirect-decision'),
    `the answer states both absences beside each other: ${answer.detail}`,
  );
  assert.equal(
    JSON.stringify(answer).includes('no-findings'),
    false,
    'the pair is never joined into one "no findings" answer',
  );
  assert.equal(
    JSON.stringify(answer).includes('absentFields'),
    false,
    'the pair is never joined into one absent-field list',
  );
  const absenceClaims = answer.claims.filter(
    (claim) => claim.claim === 'absence',
  );
  assert.deepEqual(
    absenceClaims.map((claim) => claim.values.state),
    ABSENCES,
    'each absence is its own claim, so neither can be rendered as the other',
  );
  for (const claim of absenceClaims) {
    assert.equal(
      claim.artefactPath,
      NAV,
      'each absence claim cites the navigation record that states it',
    );
  }
  assert.equal(
    codeOf(source).includes('side by side'),
    true,
    'the shipped module states the two absences side by side rather than as one',
  );
}

/**
 * SC3, E4: `shouldActivate` is never rendered as any guard's verdict and no refusal is inferred from
 * the terminal class.
 * @param {any} api
 */
function pinNoGuardVerdictAbsence(api) {
  const redirect = ask(api, frameRecords(NAVIGATION.terminals.redirect, 2, ''));
  const guardAbsence = redirect.absences[0];

  // The record's own shape: GuardsCheckEnd adds exactly one field over GuardsCheckStart.
  const classes = NAVIGATION.events.classes;
  const guardsCheckEnd = classes.filter(
    (one) => one.name === 'GuardsCheckEnd',
  )[0];
  const guardsCheckStart = classes.filter(
    (one) => one.name === 'GuardsCheckStart',
  )[0];
  const added = guardsCheckEnd.keys.filter(
    (key) => !guardsCheckStart.keys.includes(key),
  );
  assert.deepEqual(
    added,
    ['shouldActivate'],
    'the record states GuardsCheckEnd adds exactly one field over GuardsCheckStart',
  );
  assert.deepEqual(
    NAVIGATION.absences['guard-verdict-not-recorded']
      .refusedGuardVersusUnmatchedUrl.comparison.guardNamesInEitherPayload,
    [],
    'no payload in either navigation names a guard',
  );

  assert.equal(
    guardAbsence.state,
    'no-guard-verdict',
    'the guard verdict is stated as its own absence',
  );
  assert.deepEqual(
    guardAbsence.guardFields,
    added,
    `the absence names the guard fields the payload carries, which are the aggregate ${added.join(', ')} and no per-guard verdict \u2014 and never renders one as a guard's verdict: the answer rendered ${JSON.stringify(guardAbsence.guardFields)}`,
  );
  assert.deepEqual(
    guardAbsence.guardsNamed,
    [],
    `the stream names no guard, so the absence asserts no guard's verdict: the answer rendered ${JSON.stringify(guardAbsence.guardsNamed)}`,
  );
  assert.deepEqual(
    Object.keys(guardAbsence).sort(),
    ['detail', 'guardFields', 'guardsCheckEndKeys', 'guardsNamed', 'state'],
    `the absence carries its own fields, so no verdict field and no refusal field is rendered beside them: ${JSON.stringify(guardAbsence)}`,
  );
  assert.equal(
    JSON.stringify(guardAbsence).includes('"verdict"'),
    false,
    'no field of the absence is a guard verdict',
  );
  assert.deepEqual(
    guardAbsence.guardsCheckEndKeys,
    guardsCheckEnd.keys,
    'the absence states the key set the payload it read carries',
  );

  // A refusal is never inferred from the terminal class: the cancel frame's terminal names a
  // cancellation code and the answer still states no verdict about a guard.
  const cancelled = ask(api, frameRecords(NAVIGATION.superseded, 2, ''));
  assert.equal(
    cancelled.terminal.class,
    'NavigationCancel',
    'the abandoned navigation ended NavigationCancel',
  );
  assert.equal(
    JSON.stringify(cancelled.absences).includes('verdict'),
    false,
    `a NavigationCancel is never rendered as a guard's refusal: the answer rendered ${JSON.stringify(cancelled.absences)}`,
  );

  // The guard's name is configurable and its verdict is not: the config declares it, the stream does
  // not decide it.
  const gated = ask(api, {
    navigation: gatedNavigation(),
    config: configRecord(),
  });
  assert.deepEqual(
    gated.route,
    {
      path: 'gated',
      component: '[fn _LandingPage]',
      canActivate: ['[fn redirectGuard]'],
    },
    `a guard's name is read from the config entry that declares it \u2014 gated declares canActivate ["[fn redirectGuard]"] \u2014 and rendered as configuration: the answer rendered ${JSON.stringify(gated.route)}`,
  );
  assert.deepEqual(
    gated.absences[0].guardsNamed,
    [],
    'the config declares the guard\u2019s name and the stream declares no verdict, so the absence names no guard',
  );
}

/**
 * SC3, E3: a config entry's `redirectTo` is a configuration fact and never the redirect that decided
 * the navigation.
 * @param {any} api
 */
function pinRouteIsAConfigurationFact(api) {
  const answer = ask(api, frameRecords(NAVIGATION.terminals.redirect, 2, ''));
  const route = answer.route;

  assert.deepEqual(
    Object.keys(route).sort(),
    ['path', 'redirectTo'],
    `a route is the config entry by its own path and only the fields that entry states, so a redirectTo is a configuration fact and never the redirect that decided the navigation: the answer rendered ${JSON.stringify(route)}`,
  );
  for (const key of Object.keys(route)) {
    assert.equal(
      CONFIG_FIELDS.includes(key),
      true,
      `every field a route renders is one of the config's five \u2014 ${CONFIG_FIELDS.join(', ')} \u2014 and the answer rendered ${JSON.stringify(key)}`,
    );
  }
  assert.equal(
    route.redirectTo,
    'landing',
    'the redirectTo is rendered as the value the config row states',
  );
  assert.equal(
    'decision' in route || 'decidedBy' in route || 'redirected' in route,
    false,
    'no field of the route claims the redirect decided anything',
  );
  assert.ok(
    answer.detail.includes('configuration fact'),
    `the answer\u2019s own sentence states the redirectTo is a configuration fact: ${answer.detail}`,
  );
}

/**
 * SC4, E6: a URL segment no configured path matches is named unconfigured beside the paths that were
 * compared, and never resolved to the wildcard or to a `redirectTo` row.
 * @param {any} api
 */
function pinUnmatchedNamed(api) {
  const answer = ask(api, {
    navigation: unmatchedNavigation(),
    config: configRecord(wildcardConfig()),
  });

  assert.deepEqual(
    answer.unconfigured.segments,
    ['this-route-does-not-exist'],
    `every URL segment no configured path matches is named unconfigured, as the segment it is: the diagnostic record names this-route-does-not-exist and the answer rendered ${JSON.stringify(answer.unconfigured.segments)}`,
  );
  assert.deepEqual(
    answer.unconfigured.compared,
    wildcardConfig().map((row) => row.path),
    'the paths that were compared are the config\u2019s own, verbatim and in the config\u2019s own order',
  );
  assert.equal(
    JSON.stringify(answer.route).includes('**'),
    false,
    `a URL segment no configured path matches is never resolved to the \`**\` row, even when the config carries one: the answer rendered ${JSON.stringify(answer.route)}`,
  );
  const redirected =
    answer.route === null || answer.route.redirectTo === undefined
      ? null
      : answer.route.redirectTo;
  assert.equal(
    redirected,
    null,
    `a URL segment no configured path matches is never resolved to a redirectTo row: the answer rendered ${JSON.stringify(answer.route)}`,
  );
  assert.deepEqual(
    answer.route,
    null,
    `no path is rendered that the config does not carry: the config records ${wildcardConfig().length} paths and none of them is this segment \u2014 the answer rendered ${JSON.stringify(answer.route)}`,
  );
  assert.equal(
    answer.claims.filter((claim) => claim.claim === 'route').length,
    0,
    'no route claim is rendered for a URL no configured path matches',
  );
}

/**
 * SC4: every `path` the answer renders is one the config records.
 * @param {any} api
 */
function pinNoPathOutsideTheConfig(api) {
  const answer = ask(api, frameRecords(NAVIGATION.warm, 2, ''));
  const configured = CONFIG_ROWS.map((row) => row.path);

  assert.deepEqual(
    answer.route,
    null,
    `no path is rendered that the config does not carry: the config records ${configured.length} paths and a portal address names none of them \u2014 the answer rendered ${JSON.stringify(answer.route)}`,
  );
  assert.deepEqual(
    answer.unconfigured.segments,
    ['claim', 'list'],
    'the segments the config cannot place are named beside the paths that were compared',
  );
  for (const claim of answer.claims) {
    if (claim.claim !== 'route') continue;
    assert.equal(
      configured.includes(claim.values.path),
      true,
      `a route claim names a path the config records: ${JSON.stringify(claim.values.path)}`,
    );
  }
}

/**
 * SC5, E7 (held out): attribution is by `id` and `route.path` in each event's own payload, never by
 * arrival position.
 * @param {any} api
 * @param {string} [source]
 */
function pinAttributionByRoutePath(api, source = JOIN_SOURCE) {
  const frame = NAVIGATION.superseded;

  // The ordering, re-derived from the events' own `t` values rather than from the record's summary.
  const cancel = frame.events.filter(
    (one) => one.class === 'NavigationCancel',
  )[0];
  const loadEnds = frame.events.filter(
    (one) => one.class === 'RouteConfigLoadEnd',
  );
  const abandoned = loadEnds.filter(
    (one) => one.payload.route.path === 'claim',
  )[0];
  const successor = loadEnds.filter(
    (one) => one.payload.route.path === 'contract',
  )[0];
  assert.equal(cancel.payload.id, 2, 'the abandoned navigation is id 2');
  assert.equal(cancel.payload.code, 1, 'the cancel states cancellation code 1');
  assert.equal(
    abandoned.t > cancel.t,
    true,
    'the abandoned navigation\u2019s own load end arrives after its own cancel',
  );
  assert.equal(
    abandoned.t < successor.t,
    true,
    'and before the successor\u2019s load end, so arrival order cannot tell the two apart',
  );
  assert.equal(
    Math.round((abandoned.t - cancel.t) * 10) / 10,
    frame.ordering.cancelToAbandonedLoadEndMs,
    `the record states ${frame.ordering.cancelToAbandonedLoadEndMs} ms from the cancel to its own load end, and the events state ${Math.round((abandoned.t - cancel.t) * 10) / 10}`,
  );
  assert.equal(
    Math.round((successor.t - abandoned.t) * 10) / 10,
    frame.ordering.abandonedLoadEndToSuccessorLoadEndMs,
    `the record states ${frame.ordering.abandonedLoadEndToSuccessorLoadEndMs} ms from the abandoned load end to the successor's, and the events state ${Math.round((successor.t - abandoned.t) * 10) / 10}`,
  );
  assert.equal(
    frame.attribution,
    'by route.path in the event\u2019s own payload, never by position',
    'the record states the rule this pin holds the answer to',
  );

  const abandonedAnswer = ask(api, frameRecords(frame, 2, ''));
  const successorAnswer = ask(api, frameRecords(frame, 3, ''));

  // The two decisions, kept apart by `id`.
  assert.equal(
    abandonedAnswer.terminal.class,
    'NavigationCancel',
    'the abandoned navigation\u2019s own decision is its cancel',
  );
  assert.equal(
    abandonedAnswer.terminal.id,
    2,
    'the abandoned answer names id 2',
  );
  assert.equal(
    successorAnswer.terminal.class,
    'NavigationEnd',
    'the successor\u2019s own decision is its end',
  );
  assert.equal(
    successorAnswer.terminal.id,
    3,
    'the successor answer names id 3',
  );

  const abandonedLoads = abandonedAnswer.claims
    .filter((claim) => claim.claim === 'route-config-load')
    .map(loadOfClaim);
  const successorLoads = successorAnswer.claims
    .filter((claim) => claim.claim === 'route-config-load')
    .map(loadOfClaim);

  assert.deepEqual(
    abandonedLoads,
    ['RouteConfigLoadStart:claim', 'RouteConfigLoadEnd:claim'],
    `the abandoned navigation owns the route-config events naming its own route path \u2014 its own RouteConfigLoadEnd arrived 1192.1 ms after its cancel and 314.8 ms before the successor's \u2014 because attribution is by route.path in the event's own payload and never by arrival position: the answer rendered ${JSON.stringify(abandonedLoads)}`,
  );
  assert.deepEqual(
    successorLoads,
    ['RouteConfigLoadStart:contract', 'RouteConfigLoadEnd:contract'],
    `a route-config event is attributed to the navigation by route.path in the event's own payload and never by arrival position: the successor's answer rendered ${JSON.stringify(successorLoads)} where the abandoned navigation's own load end arrived 314.8 ms before the successor's`,
  );
  assert.equal(
    JSON.stringify(successorLoads).includes('claim'),
    false,
    `the abandoned navigation's own RouteConfigLoadEnd is never given to the navigation that arrived beside it: the successor's answer rendered ${JSON.stringify(successorLoads)}`,
  );
  assert.equal(
    JSON.stringify(abandonedLoads).includes('contract'),
    false,
    'and the successor\u2019s load events are never given to the abandoned navigation',
  );
  assert.equal(
    JSON.stringify(abandonedLoads).includes('list'),
    false,
    'a load naming a nested path neither navigation\u2019s own address starts with is attributed to no navigation rather than to the one that arrived nearest',
  );
  assert.equal(
    codeOf(source).includes('never by arrival position'),
    true,
    'the shipped module states the rule it is held to',
  );
}

/**
 * SC6, SC1 E10: the join is pure, reads no field the records do not carry, and answers the same thing
 * twice.
 * @param {any} api
 * @param {string} [source]
 */
function pinPurity(api, source = JOIN_SOURCE) {
  const code = codeOf(source);
  for (const reach of REACHES) {
    assert.equal(
      code.includes(reach),
      false,
      `the join is pure: it holds no ${reach} \u2014 it imports nothing, touches no filesystem, dispatches no message, performs no network call, holds no clock, starts no tap and reads no page global`,
    );
  }
  for (const read of IGNORED_READS) {
    assert.equal(
      read.test(code),
      false,
      `the join reads no field the records do not carry: it reads no ${String(read)}, because a destination is the terminal event\u2019s own url and a clock is the caller\u2019s`,
    );
  }
  assert.equal(
    /research\/|scripts\/|\.project\//.test(code),
    false,
    'the join spells no record path: a record\u2019s path is handed over with the record, never composed',
  );

  // A second answer to the same question over the same records is the same answer.
  const records = frameRecords(NAVIGATION.warm, 2, '');
  const first = ask(api, records);
  const second = ask(api, records);
  assert.deepEqual(
    second,
    first,
    `a second answer to the same question over the same records names the same terminal class, the same navigation id, the same config path and the same fields \u2014 purity, and the answer is stable across calls \u2014 and the second answer differs: first ${JSON.stringify(first.terminal)} / ${JSON.stringify(first.route)}, second ${JSON.stringify(second.terminal)} / ${JSON.stringify(second.route)}`,
  );
  assert.equal(
    JSON.stringify(second),
    JSON.stringify(first),
    'the two answers are byte-identical, so no clock, no counter and no set decides their order',
  );

  // The records decorated with every field the join must ignore, at the record and inside it.
  const plain = ask(api, {
    navigation: unmatchedNavigation(),
    config: configRecord(wildcardConfig()),
  });
  const decorated = ask(api, {
    navigation: {
      ...unmatchedNavigation(),
      navResolved: true,
      routerUrl: '/home',
      addressBar: { url: '/' },
      currentNavigation: { values: { finalUrl: '/landing' } },
      cause: 'the lazy chunk was loaded',
      clock: 221.5,
    },
    config: configRecord(wildcardConfig()),
    navResolved: true,
    routerUrl: '/home',
    addressBar: { url: '/' },
    currentNavigation: { values: { finalUrl: '/landing' } },
    cause: 'the lazy chunk was loaded',
    clock: 221.5,
  });
  assert.deepEqual(
    decorated,
    plain,
    'the join reads no field the recording says it ignores, so a record carrying router.url, an address bar, currentNavigation(), a navResolved flag, a cause or a clock changes nothing this module reports',
  );

  // An event's own `t`, numeric `type` and `keys` decide nothing either.
  const timed = JSON.parse(
    JSON.stringify({ events: unmatchedNavigation().events }),
  );
  for (let i = 0; i < timed.events.length; i += 1) {
    timed.events[i].t = 100 + i;
    timed.events[i].type = i;
    timed.events[i].keys = ['a field the join does not read'];
  }
  assert.deepEqual(
    ask(api, {
      navigation: {
        path: NAV,
        id: 7,
        question: unmatchedNavigation().question,
        events: timed.events,
      },
      config: configRecord(wildcardConfig()),
    }),
    plain,
    'an event is read for its class and its payload and nothing else, so its arrival time, numeric type and key list decide nothing',
  );
}

// ------------------------------------------------------------------------------------------------
// The module, its vocabulary and the recording it is held to, before any mutation.
// ------------------------------------------------------------------------------------------------

test('T002 — the join is a bare-context module with the contract\u2019s two states and two absences', () => {
  const api = loadJoin();

  assert.deepEqual(
    Object.keys(api).sort(),
    [
      'ABSENCES',
      'CONFIG_FIELDS',
      'IGNORED',
      'READS',
      'STATES',
      'TERMINAL_FIELDS',
      'tutorRouting',
    ],
    'the join publishes the answer, the two states, the two absences, the terminal key sets, the config fields, the fields it reads and the fields it ignores, and nothing else',
  );
  assert.deepEqual(
    copyOf(api.STATES),
    STATES,
    'the two states are the contract\u2019s',
  );
  assert.deepEqual(
    copyOf(api.ABSENCES),
    ABSENCES,
    'the two absences are the contract\u2019s',
  );
  assert.deepEqual(
    copyOf(api.CONFIG_FIELDS),
    CONFIG_FIELDS,
    'the five config fields are the recording\u2019s own',
  );
  assert.equal(
    copyOf(api.READS).navigationEvents,
    'navigation.events',
    'the join names the recorded event list as the field it reads it from',
  );
  assert.equal(
    copyOf(api.READS).rowPath,
    'config.config[].path',
    'the join names the config row\u2019s own path as the field it reads it from',
  );
  for (const field of [
    'routerUrl',
    'addressBar',
    'currentNavigation',
    'finalUrl',
    'navResolved',
    'cause',
    'clock',
  ]) {
    assert.equal(
      copyOf(api.IGNORED).includes(field),
      true,
      `the join declares ${field} a field it ignores, which is the list this suite holds it to`,
    );
  }
  for (const [cls, keys] of Object.entries(TERMINAL_KEYS)) {
    assert.deepEqual(
      copyOf(api.TERMINAL_FIELDS[cls]),
      keys,
      `the ${cls} key set is the recording's own`,
    );
  }

  // The recording T001 measured is what binds the join to the two records and no others.
  const stream = RECORD_SHAPES.fieldMap.stream;
  for (const terminal of stream.terminals) {
    assert.deepEqual(
      terminal.keys,
      copyOf(api.TERMINAL_FIELDS[terminal.class]),
      `the recording states ${terminal.class} carries ${terminal.keys.join(', ')}, which is the key set the join renders`,
    );
  }
  assert.equal(
    stream.terminals.length,
    Object.keys(TERMINAL_KEYS).length,
    'the join names every terminal class the recording names, and no other class',
  );
  assert.deepEqual(
    RECORD_SHAPES.fieldMap.config.fields,
    CONFIG_FIELDS,
    'the recording states the config\u2019s five fields, which the join renders and nothing else',
  );
  assert.deepEqual(
    stream.attribution.by,
    ['id', 'route.path'],
    'the recording states attribution is by id and route.path',
  );
  assert.deepEqual(
    RECORD_SHAPES.absences['no-guard-verdict'].state,
    ABSENCES[0],
    'the recording names the guard-verdict absence as the join does',
  );
  assert.deepEqual(
    RECORD_SHAPES.absences['no-redirect-decision'].state,
    ABSENCES[1],
    'the recording names the redirect-decision absence as the join does',
  );
  assert.equal(
    RECORD_SHAPES.absences['no-guard-verdict'].guardFieldsAreAggregateOnly,
    true,
    'the recording states the guard fields are aggregates only',
  );
  assert.equal(
    RECORD_SHAPES.reach.noNewTap.sentence,
    'No new tap is needed.',
    'the recording states the config half arrives through the read the agent already produces',
  );
});

test('T002 — the citations this suite rests on state what it claims, at this head', () => {
  assert.match(
    linesOf(NAV)[2185],
    /never by position/,
    'research/raw/m041-navigation.json:2186 states attribution is by route.path, never by position',
  );
  assert.match(
    linesOf(NAV)[2890],
    /hasNavigationCancelInEither/,
    'research/raw/m041-navigation.json:2891 states neither navigation records a NavigationCancel',
  );
  assert.match(
    linesOf(NAV)[2649],
    /A route redirect from \/redirect to \/landing emitted 11 events/,
    'research/raw/m041-navigation.json:2650 states the redirect emitted 11 events and 0 NavigationCancel',
  );
  assert.match(
    linesOf(CONFIG)[86],
    /"path": "redirect"/,
    'research/raw/m030-router-config.json:87 states the redirect row',
  );
  assert.match(
    linesOf(CONFIG)[97],
    /redirectGuard/,
    'research/raw/m030-router-config.json:98 states the configured guard\u2019s name',
  );
  assert.match(
    linesOf(AGENT)[1825],
    /stream = router\.events/,
    'extension/agent-main.js:1826 is the one subscription that reads the stream the answer is built from',
  );
});

test('T002 — SC1, E1, E3, E10: the answer names what the terminal and the config entry state', () => {
  const api = loadJoin();
  pinAnsweredFromTheRecord(api);
  pinTerminalClassIsTheRecordedOne(api);
  pinRecordsWithoutProvenance(api);
  const answer = ask(api, frameRecords(NAVIGATION.terminals.redirect, 2, ''));
  console.log(
    `T002 answered: ${answer.terminal.class} id ${answer.terminal.id} ${answer.terminal.url} -> ${answer.terminal.urlAfterRedirects}, route ${JSON.stringify(answer.route)}, claims ${JSON.stringify(answer.claims.map((claim) => claim.claim))}`,
  );
});

test('T002 — SC3, E3, E4: the redirectTo and the guard name are configuration, not a decision', () => {
  const api = loadJoin();
  pinRouteIsAConfigurationFact(api);
  pinNoGuardVerdictAbsence(api);
});

test('T002 — SC2, E2: a held navigation is cannot-tell, and it names nothing else', () => {
  const api = loadJoin();
  pinHeldCannotTell(api);
  pinHeldNoAddressBar(api);
  pinHeldNoRouterUrl(api);
  pinHeldNoCurrentNavigation(api);
  const answer = ask(api, heldRecords());
  console.log(
    `T002 cannot-tell: ${answer.state}, last class ${answer.claims[0].values.lastClass}, terminal/route/unconfigured ${String(answer.terminal)}/${String(answer.route)}/${String(answer.unconfigured)}`,
  );
});

test('T002 — SC4, E6: an unmatched segment is named unconfigured, never resolved', () => {
  const api = loadJoin();
  pinUnmatchedNamed(api);
  pinNoPathOutsideTheConfig(api);
  const answer = ask(api, {
    navigation: unmatchedNavigation(),
    config: configRecord(wildcardConfig()),
  });
  console.log(
    `T002 unconfigured: ${JSON.stringify(answer.unconfigured.segments)} beside ${answer.unconfigured.compared.length} compared paths, route ${String(answer.route)}`,
  );
});

test('T002 — SC6, E10: the join is pure and a second read answers the same', () => {
  const api = loadJoin();
  pinPurity(api);
});

test('held-out E5: the two absences stay two states on one navigation', () => {
  const api = loadJoin();
  pinTwoAbsences(api);
  const answer = ask(api, frameRecords(NAVIGATION.terminals.redirect, 2, ''));
  console.log(
    `held-out E5: ${JSON.stringify(answer.absences.map((absence) => absence.state))} side by side on the redirect frame`,
  );
});

test('held-out E7: a reused id keeps two decisions apart by id and route.path, never by arrival position', () => {
  const api = loadJoin();
  pinAttributionByRoutePath(api);
  const abandoned = ask(api, frameRecords(NAVIGATION.superseded, 2, ''));
  const successor = ask(api, frameRecords(NAVIGATION.superseded, 3, ''));
  console.log(
    `held-out E7: id 2 ${abandoned.terminal.class} carries ${JSON.stringify(abandoned.claims.filter((claim) => claim.claim === 'route-config-load').map(loadOfClaim))}, id 3 ${successor.terminal.class} carries ${JSON.stringify(successor.claims.filter((claim) => claim.claim === 'route-config-load').map(loadOfClaim))}`,
  );
});

// ------------------------------------------------------------------------------------------------
// The mutants. Each is one edit of the shipped module, applied in memory. `defect` is the pattern the
// failing pin must be shown to match and `names` the string in its failure text: a mutant that reddens
// with a stack and no sentence would prove nothing about the answer.
// ------------------------------------------------------------------------------------------------

const MUTATIONS = [
  {
    id: 'no-artefact-path',
    // SC1 itself: a claim rendered with no artefact path is not an answer this module produces.
    defect: /artefact path/,
    names: 'no claim renders an empty artefact path',
    anchor:
      '    return { claim: claim, values: values, artefactPath: artefactPath };',
    replacement:
      "    return { claim: claim, values: values, artefactPath: '' };",
    pin: pinAnsweredFromTheRecord,
  },
  {
    id: 'terminal-class-not-recorded',
    // SC1 backwards: a terminal class the stream did not record.
    defect: /did not record/,
    names: 'the class the stream recorded',
    anchor:
      '      const terminal = /** @type {Record<string, any>} */ ({ class: cls });',
    replacement:
      "      const terminal = /** @type {Record<string, any>} */ ({ class: 'NavigationEnd' });",
    pin: pinTerminalClassIsTheRecordedOne,
  },
  {
    id: 'route-from-the-final-url',
    // SC1 backwards: the route named from the final URL the redirect produced.
    defect: /final URL/,
    names: 'never the entry its final URL names',
    anchor: '    const route = routeOf(routeRowOf(segments, config.rows));',
    replacement:
      '    const route = routeOf(\n      routeRowOf(segmentsOf(terminal.urlAfterRedirects), config.rows),\n    );',
    pin: pinAnsweredFromTheRecord,
  },
  {
    id: 'held-reported-landed',
    // SC2 backwards: the held navigation reported as landed.
    defect: /landed/,
    names: 'never reported as landed',
    anchor: '    if (terminal === null) {\n      return cannotTellAnswer(',
    replacement:
      '    if (terminal === null) {\n' +
      '      return answerOf(\n' +
      '        true,\n' +
      '        askedOf(records),\n' +
      '        { class: String(classOf(own[own.length - 1])) },\n' +
      '        null,\n' +
      '        [],\n' +
      '        null,\n' +
      '        [],\n' +
      "        'the stream records no terminal event for that id, so the navigation is not known to have landed at any route',\n" +
      '      );\n' +
      '    }\n' +
      '    if (terminal === null) {\n      return cannotTellAnswer(',
    pin: pinHeldCannotTell,
  },
  {
    id: 'destination-from-the-address-bar',
    // SC2 backwards: a destination read from the address bar.
    defect: /address bar/,
    names: 'reads no destination from the address bar',
    anchor:
      '    const claim = claimOf(\n      CLAIM_CANNOT_TELL,\n      { id: id, lastClass: lastClass },',
    replacement:
      '    const claim = claimOf(\n' +
      '      CLAIM_CANNOT_TELL,\n' +
      '      {\n' +
      '        id: id,\n' +
      '        lastClass: lastClass,\n' +
      '        url: String(\n' +
      '          isObject(records) && isObject(records.addressBar)\n' +
      '            ? records.addressBar.url\n' +
      "            : '',\n" +
      '        ),\n' +
      '      },',
    pin: pinHeldNoAddressBar,
  },
  {
    id: 'destination-from-router-url',
    // SC2 backwards: a destination read from the live `router.url`.
    defect: /router\.url/,
    names: 'reads no destination from router.url',
    anchor:
      "        'the stream records no terminal event for that id, so the navigation is not known to have landed at any route',",
    replacement:
      "        'the stream records no terminal event for that id, so the navigation is not known to have landed at any route; router.url still states ' +\n" +
      '          String(read.routerUrl),',
    pin: pinHeldNoRouterUrl,
  },
  {
    id: 'destination-from-current-navigation',
    // SC2 backwards: a destination read from `currentNavigation()`'s fields.
    defect: /currentNavigation/,
    names: 'reads no destination from currentNavigation()',
    anchor: '    return answerOf(\n      false,\n      askedOf(records),',
    replacement:
      '    return answerOf(\n' +
      '      false,\n' +
      '      askedOf(records) +\n' +
      '        JSON.stringify(\n' +
      '          isObject(records) && isObject(records.currentNavigation)\n' +
      '            ? records.currentNavigation.values\n' +
      '            : null,\n' +
      '        ),',
    pin: pinHeldNoCurrentNavigation,
  },
  {
    id: 'absences-folded',
    // SC3 backwards: the two absences folded into one "no findings" answer.
    defect: /folded/,
    names: 'two states',
    anchor: '    return absences;',
    replacement:
      '    if (absences.length === 2) {\n' +
      '      return [\n' +
      '        {\n' +
      "          state: 'no-findings',\n" +
      '          absentFields: [absences[0].state, absences[1].state],\n' +
      "          detail: 'no findings: no guard verdict and no redirect decision',\n" +
      '        },\n' +
      '      ];\n' +
      '    }\n' +
      '    return absences;',
    pin: pinTwoAbsences,
  },
  {
    id: 'should-activate-as-a-verdict',
    // SC3 backwards: `shouldActivate: true` rendered as a guard's verdict.
    defect: /verdict/,
    names: "asserts no guard's verdict",
    anchor: '      guardsNamed: [],',
    replacement:
      "      guardsNamed: ['shouldActivate'],\n" +
      '      verdict: guardsCheckEnd.shouldActivate,',
    pin: pinNoGuardVerdictAbsence,
  },
  {
    id: 'refusal-inferred-from-the-terminal-class',
    // SC3 backwards: a refusal inferred from the terminal class, which is never a verdict.
    defect: /refusal/,
    names: 'no refusal field is rendered',
    anchor: '      guardsNamed: [],',
    replacement:
      "      guardsNamed: [],\n      refused: terminalClass === 'NavigationCancel',",
    pin: pinNoGuardVerdictAbsence,
  },
  {
    id: 'redirect-to-as-the-decision',
    // SC3 backwards: the config entry's `redirectTo` rendered as the redirect that decided the
    // navigation.
    defect: /decided the navigation/,
    names: 'never the redirect that decided the navigation',
    anchor: '      route[field] = value;',
    replacement:
      '      route[field] = value;\n' +
      '    }\n' +
      '    if (route.redirectTo !== undefined) {\n' +
      "      route.decidedBy = 'the redirect that decided the navigation';\n" +
      '    }\n' +
      '    if (false) {',
    pin: pinRouteIsAConfigurationFact,
  },
  {
    id: 'unmatched-resolved-to-the-wildcard',
    // SC4 backwards: an unmatched segment resolved to the `**` row.
    defect: /\*\*/,
    names: 'never resolved to the',
    anchor:
      '      if (path === segments[0]) return row;\n    }\n    return null;\n  }',
    replacement:
      '      if (path === segments[0]) return row;\n' +
      '    }\n' +
      '    for (let i = 0; i < rows.length; i += 1) {\n' +
      '      const row = rows[i];\n' +
      '      if (!isObject(row)) continue;\n' +
      '      if (comparablePath(row.path) === WILDCARD_PATH) return row;\n' +
      '    }\n' +
      '    return null;\n' +
      '  }',
    pin: pinUnmatchedNamed,
  },
  {
    id: 'unmatched-resolved-to-a-redirect-row',
    // SC4 backwards: an unmatched segment resolved to a `redirectTo` row.
    defect: /redirectTo row/,
    names: 'never resolved to a redirectTo row',
    anchor: '      if (path === segments[0]) return row;',
    replacement:
      '      if (path === segments[0]) return row;\n' +
      '      if (comparablePath(row.redirectTo) !== null) return row;',
    pin: pinUnmatchedNamed,
  },
  {
    id: 'path-the-config-does-not-carry',
    // SC4 backwards: a path rendered that the config does not carry.
    defect: /does not carry/,
    names: 'no path is rendered that the config does not carry',
    anchor: '    const route = routeOf(routeRowOf(segments, config.rows));',
    replacement:
      '    const route = segments.length === 0 ? null : { path: segments[0] };',
    pin: pinNoPathOutsideTheConfig,
  },
  {
    id: 'route-config-attributed-by-arrival',
    // SC5 backwards: a route-config event attributed to the navigation that arrived beside it.
    defect: /arriv/,
    names: 'never by arrival position',
    anchor: '      if (routePathOf(event) !== firstSegment) continue;',
    replacement:
      '      if (own.length > 0) {\n        own.push(event);\n        continue;\n      }\n' +
      '      if (routePathOf(event) !== firstSegment) continue;',
    pin: pinAttributionByRoutePath,
  },
  {
    id: 'second-answer-differs',
    // Purity backwards: the second answer over the same records is not the first.
    defect: /purity/,
    names: 'a second answer to the same question',
    anchor: '      question: question,',
    replacement:
      '      question:\n' +
      '        question +\n' +
      '        ((globalThis.__tutorRoutingAsks =\n' +
      '          (globalThis.__tutorRoutingAsks || 0) + 1) > 1\n' +
      "          ? ' (second read)'\n" +
      "          : ''),",
    pin: pinPurity,
  },
];

/** One mutation, written into the source on disk's bytes — and asserted to have changed them. */
/** @param {string} source @param {{anchor: string, replacement: string}} mutation */
function mutated(source, mutation) {
  const changed = source.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    changed,
    source,
    `mutation ${mutation.anchor} must change the source it is applied to`,
  );
  return changed;
}

/** The failure a pin raises on a mutated source. @param {() => void} pin */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    return /** @type {Error} */ (error);
  }
  return null;
}

test('T002 mutants — every anchor is one place in the shipped module and really changes it', () => {
  assert.ok(
    MUTATIONS.length >= 12,
    'the battery carries the defects the contract names',
  );
  for (const mutation of MUTATIONS) {
    assert.equal(
      JOIN_SOURCE.split(mutation.anchor).length - 1,
      1,
      `mutation ${mutation.id} anchors on exactly one place in ${JOIN}`,
    );
    mutated(JOIN_SOURCE, mutation);
    assert.equal(
      typeof mutation.pin,
      'function',
      `mutation ${mutation.id} has a pin`,
    );
  }
});

test('T002 mutants — each defect reddens its pin, and the failure names the defect by string', () => {
  const lines = [];
  for (const mutation of MUTATIONS) {
    const source = mutated(JOIN_SOURCE, mutation);

    // The pin is green on the module as it sits on disk first, so a failure below is the mutation's
    // and not a pin that was already red.
    mutation.pin(loadJoin(), JOIN_SOURCE);

    const failure = failureOf(() => mutation.pin(loadJoin(source), source));
    assert.ok(
      failure !== null,
      `mutation ${mutation.id} must redden the pin that names it, and it reddened nothing`,
    );
    assert.match(
      failure.message,
      mutation.defect,
      `mutation ${mutation.id} must redden a pin naming ${String(mutation.defect)}, and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes(mutation.names),
      `mutation ${mutation.id} must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
    );
    lines.push(`${mutation.id}: ${failure.message.split('\n')[0]}`);
  }
  console.log(`T002 mutants: ${lines.join(' || ')}`);
});
