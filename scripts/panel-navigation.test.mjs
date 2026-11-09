// Tests for apps/angular-ai-devtools/src/app/panel-navigation.ts — the display half of M041 T004
// (INTENT.md SC1, SC2, SC3; held-out E2, E5, E7). The join itself is
// `extension/navigation-narrator.js` (T003), already landed: this suite runs that join over streams
// built from T001's recording (`research/raw/m041-navigation.json`) inside a bare `node:vm` context
// and feeds its answers straight into the pane, so the two halves are pinned against each other
// rather than against a hand-written copy of an answer.
//
// Every frame below is the recording converted into the entry shape T002 publishes — the class name,
// the page's own receipt time and the fields the event carried — so the pins are held to a
// measurement rather than to a fixture invented for the test:
//
//   held          NavigationStart + RouteConfigLoadStart, no terminal, `router.url` still /home
//   warm          two measured route-config intervals, a NavigationEnd, the guard aggregate and the
//                 resolve stage, all on one completed navigation
//   superseded    a NavigationCancel carrying code 1 and the router's own reason with no end route,
//                 and the successor's NavigationEnd carrying one — two navigations, one record
//   error         a NavigationError carrying a TypeError's own name and message
//   skip          a NavigationSkipped with code 0 and the same-URL reason
//   redirect      a NavigationEnd whose only trace of the redirect is `url` against the end route
//   wildcard      the eleven classes the recording measured for a refused `canMatch` and an
//                 unmatched URL, whose chain ends on `**` — the match, never a refusal
//
// Two frames are not verbatim recordings and say so where they sit: the measured-zero frame repeats
// one recorded reading on both ends of one load, and the unattributed frame is the warm stream plus
// one load end whose own route names no open load — the recording contains neither case.
//
// The pane's job is separation (SC3). Each navigation becomes one block, in the answer's order and
// no other, and each block renders only the fields the answer carried for it: an open navigation its
// stage reached, its last event and the holder it cannot name; an ended one its terminal class and
// only that class's own fields, with an end route only where the terminal event recorded one; the
// guard aggregate with its own absence and never a guard name; the resolve stage with
// `no-resolver-configured`; each route-config load by its own `route` with its measured interval; and
// the answer's unattributed loads as unattributed rather than folded into a navigation.
//
// Every criterion is proven non-vacuously: the pin runs against the untouched module first, then the
// same pin runs against a copy of the module source carrying one anchored mutation which is asserted
// to change the source, and it must redden with a failure message that names the defect by string. A
// mutant that survives its pin, or reddens with a message that does not name the defect, fails here.
//
// What this suite does not cover, stated so the evidence is not read as wider than it is: the pane
// is rendered as its own text and its own rows, not as DOM. The demo's markup — the
// `section.panel-demo[data-surface][data-state]`, `h2`, `p.state` and `p.line` hooks this surface's
// lines flow through — is the demo component's, pinned by `scripts/panel-styles.test.mjs` and the
// app suite, and this task adds no CSS and no markup of its own.
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-navigation.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/navigation-narrator.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m041-navigation.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ measured fixture ----

/** The four terminal classes the recording enumerates, and no fifth. */
const TERMINAL_CLASSES = [
  'NavigationEnd',
  'NavigationCancel',
  'NavigationError',
  'NavigationSkipped',
];

/** The recorded frames, verbatim. */
const HELD = RECORDING.held.inFlight.events;
const WARM = RECORDING.warm.events;
const SUPERSEDED = RECORDING.superseded.events;
const ERROR = RECORDING.terminals.error.events;
const SKIP = RECORDING.terminals.skip.events;
const REDIRECT = RECORDING.terminals.redirect.events;

/** The refused-`canMatch` versus unmatched-URL comparison the recording measured. */
const GUARD_COMPARISON =
  RECORDING.absences['guard-verdict-not-recorded']
    .refusedGuardVersusUnmatchedUrl.comparison;

/** The guard names the recording measured on both targets, all of them empty or one fixture name. */
const MEASURED_GUARD_NAMES = [
  ...RECORDING.guards.portal.canMatchNames,
  ...RECORDING.guards.fixture.canActivateNames,
].filter((name) => typeof name === 'string' && name !== '');

/** The fixture's own lazy boundary: a route path a load end can name with no open load. */
const UNOPENED_ROUTE = RECORDING.guards.fixture.loadChildrenBoundaries[0];

function numberOrNull(value) {
  return typeof value === 'number' ? value : null;
}

function textOrNull(value) {
  return typeof value === 'string' ? value : null;
}

/** The chain a recorded payload carried, in the order the record carried it. */
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
 * the fields the event carried — every field it did not carry is `null`.
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
function recordedEvent(events, type) {
  const found = events.filter((event) => event.class === type);
  assert.ok(
    found.length > 0,
    `the recording carries no ${type} in the frame this pin reads`,
  );
  return found[0];
}

function heldRecord() {
  return recordOf(HELD);
}

function warmRecord() {
  return recordOf(WARM);
}

function supersededRecord() {
  return recordOf(SUPERSEDED);
}

function errorRecord() {
  return recordOf(ERROR);
}

function skipRecord() {
  return recordOf(SKIP);
}

function redirectRecord() {
  return recordOf(REDIRECT);
}

/**
 * The refused `canMatch` and the unmatched URL: one class sequence, one chain ending on `**`, one
 * `shouldActivate` aggregate. The ids and urls are the two navigations the recording compared.
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

/** The unmatched URL: no route matches, so the wildcard `**` route matches it (E2, E7). */
function unmatchedRecord() {
  return wildcardRecord({ id: 3, url: '/nowhere' });
}

/**
 * One load whose two ends carry the same recorded reading: a measured zero, which the recording
 * contains no instance of and whose two ends are therefore one recorded reading used twice.
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
 * The warm stream plus one load end whose own route names no open load, which is the one way an
 * id-less load is unattributed while a navigation is still in the record.
 */
function navigatedWithUnattributedRecord() {
  const routes = RECORDING.warm.routeConfigLoads.map((row) => row.routePath);
  assert.ok(
    !routes.includes(UNOPENED_ROUTE),
    'the stray load must name a route no navigation in this stream opened',
  );
  return {
    routerEvents: [
      ...WARM.map(fromRecording),
      entry({ type: 'RouteConfigLoadEnd', at: 6000, route: UNOPENED_ROUTE }),
    ],
  };
}

/** Every frame this suite pins, with the name the failure messages use for it. */
function everyRecord() {
  return [
    ['held', heldRecord()],
    ['warm', warmRecord()],
    ['superseded', supersededRecord()],
    ['error', errorRecord()],
    ['skip', skipRecord()],
    ['redirect', redirectRecord()],
    ['refused canMatch', wildcardRecord({ id: 2, url: '/claim/list' })],
    ['unmatched URL', unmatchedRecord()],
    ['a measured zero', measuredZeroRecord()],
    ['an unattributed load', navigatedWithUnattributedRecord()],
  ];
}

// --------------------------------------------------------------------------- the join ----

/** `extension/navigation-narrator.js` run in a bare context, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiNavigationNarrator;
  assert.ok(api, 'extension/navigation-narrator.js must publish its namespace');
  assert.equal(typeof api.narrateNavigation, 'function');
  return api;
}

const JOIN = joinApi();

/** A value from the vm context carries that context's own prototypes, so it is copied here first. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The join's own answer for one record, copied into this realm. */
function answerOf(record) {
  return clone(JOIN.narrateNavigation(record));
}

/** The words the join publishes, read from the join rather than restated here. */
const CANNOT_TELL = JOIN.CANNOT_TELL;
const NO_HOLDER_RECORDED = JOIN.NO_HOLDER_RECORDED;
const GUARD_VERDICT_NOT_RECORDED = JOIN.GUARD_VERDICT_NOT_RECORDED;
const NO_RESOLVER_CONFIGURED = JOIN.NO_RESOLVER_CONFIGURED;

// ---------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface source with one anchored replacement applied. The anchor must occur exactly
 * once, so a mutation cannot silently rewrite a different branch, and the result must differ from
 * the source, so a no-op mutation is a failure rather than a green mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-navigation.ts: ${JSON.stringify(anchor)}`,
  );
  assert.equal(
    SURFACE_SRC.split(anchor).length - 1,
    1,
    `mutation anchor must occur exactly once: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `the mutation must change the source: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-navigation-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return { module: await import(pathToFileURL(file).href), source };
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * Three phases of a non-vacuous pin, with the untouched module's pass asserted by the caller: the
 * mutated copy is run through the same pin, the pin reddens, and the failure names the defect.
 */
function reddens(name, render) {
  let failure = null;
  try {
    render();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${name}: the mutated copy must redden the pin`,
  );
  assert.match(
    failure.message,
    new RegExp(name),
    `${name}: the pin must fail by name, got: ${failure.message}`,
  );
  // The whole failure, flattened: the defect's name and the text the mutant rendered beside the
  // text the pin expected, so the log quotes what named the defect rather than only its title.
  console.log(
    `mutant ${name} reddens: ${failure.message.replace(/\s+/g, ' ').trim()}`,
  );
  return failure;
}

// ------------------------------------------------------------- the pane's own answer ----

/** A string that says something, or null — the reading the expectation below is written from. */
function text(value) {
  if (typeof value !== 'string') return null;
  return value.trim() === '' ? null : value;
}

/** A measurement the page wrote, or null. `0` is a measurement. */
function measured(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

/** The answer's own boolean as its own word, or null. */
function booleanText(value) {
  if (typeof value !== 'boolean') return null;
  return String(value);
}

/** One navigation's part labels, and whether the answer carried the part for it. */
const PART_LABELS = [
  ['route', (nav) => text(nav.url) !== null],
  ['endRoute', (nav) => text(nav.urlAfterRedirects) !== null],
  ['terminal', (nav) => text(nav.terminal) !== null],
  ['code', (nav) => measured(nav.code) !== null],
  ['reason', (nav) => text(nav.reason) !== null],
  ['error', (nav) => text(nav.error && nav.error.name) !== null],
  ['error message', (nav) => text(nav.error && nav.error.message) !== null],
  ['stage reached', (nav) => text(nav.stage) !== null],
  ['stage absence', (nav) => text(nav.absence) !== null],
  [
    'lastEvent',
    (nav) => text(nav.terminal) === null && text(nav.lastEvent) !== null,
  ],
  ['holder', (nav) => nav.holder !== null && text(nav.holder.state) !== null],
  [
    'holder absence',
    (nav) => nav.holder !== null && text(nav.holder.absence) !== null,
  ],
  ['guards', (nav) => nav.guards !== null && text(nav.guards.state) !== null],
  [
    'guards absence',
    (nav) => nav.guards !== null && text(nav.guards.absence) !== null,
  ],
  [
    'shouldActivate',
    (nav) => nav.guards !== null && booleanText(nav.guards.shouldActivate),
  ],
  [
    'resolve',
    (nav) => nav.resolve !== null && text(nav.resolve.state) !== null,
  ],
  [
    'resolve absence',
    (nav) => nav.resolve !== null && text(nav.resolve.absence) !== null,
  ],
  ['matched', (nav) => nav.matched !== null && text(nav.matched.path) !== null],
];

/**
 * The lines one answer is expected to render, written from the interface contract rather than from
 * the module's own code: the record's absence where it named one, then one block per navigation in
 * the answer's order, each part only where the answer carried it, then the unattributed loads.
 */
function expectedLines(answer) {
  const lines = [];
  if (text(answer.absence) !== null) lines.push(`absence: ${answer.absence}`);
  for (const nav of answer.navigations) {
    lines.push(`state: ${nav.state}`);
    if (text(nav.url) !== null) lines.push(`route: ${nav.url}`);
    if (text(nav.urlAfterRedirects) !== null)
      lines.push(`endRoute: ${nav.urlAfterRedirects}`);
    if (text(nav.terminal) !== null) lines.push(`terminal: ${nav.terminal}`);
    if (measured(nav.code) !== null) lines.push(`code: ${nav.code}`);
    if (text(nav.reason) !== null) lines.push(`reason: ${nav.reason}`);
    if (text(nav.error && nav.error.name) !== null)
      lines.push(`error: ${nav.error.name}`);
    if (text(nav.error && nav.error.message) !== null)
      lines.push(`error message: ${nav.error.message}`);
    if (text(nav.stage) !== null) lines.push(`stage reached: ${nav.stage}`);
    if (text(nav.absence) !== null) lines.push(`stage absence: ${nav.absence}`);
    if (text(nav.terminal) === null && text(nav.lastEvent) !== null)
      lines.push(`lastEvent: ${nav.lastEvent}`);
    if (nav.holder !== null) {
      if (text(nav.holder.state) !== null)
        lines.push(`holder: ${nav.holder.state}`);
      if (text(nav.holder.absence) !== null)
        lines.push(`holder absence: ${nav.holder.absence}`);
    }
    if (nav.guards !== null) {
      if (text(nav.guards.state) !== null)
        lines.push(`guards: ${nav.guards.state}`);
      if (text(nav.guards.absence) !== null)
        lines.push(`guards absence: ${nav.guards.absence}`);
      if (booleanText(nav.guards.shouldActivate) !== null)
        lines.push(`shouldActivate: ${nav.guards.shouldActivate}`);
    }
    if (nav.resolve !== null) {
      if (text(nav.resolve.state) !== null)
        lines.push(`resolve: ${nav.resolve.state}`);
      if (text(nav.resolve.absence) !== null)
        lines.push(`resolve absence: ${nav.resolve.absence}`);
    }
    if (nav.matched !== null && text(nav.matched.path) !== null)
      lines.push(`matched: ${nav.matched.path}`);
    for (const load of nav.loads) {
      lines.push(
        `load: ${text(load.route) === null ? SURFACE.NO_LOAD_ROUTE : load.route}`,
      );
      if (measured(load.durationMs) !== null)
        lines.push(`load interval: ${load.durationMs}`);
    }
  }
  for (const entry of answer.unattributed) {
    const kind = text(entry.kind);
    const route = text(entry.route);
    if (kind === null && route === null)
      lines.push(`unattributed: ${SURFACE.NO_UNATTRIBUTED_FIELD}`);
    else if (route === null) lines.push(`unattributed: ${kind}`);
    else if (kind === null) lines.push(`unattributed: ${route}`);
    else lines.push(`unattributed: ${kind} ${route}`);
  }
  if (lines.length === 0) lines.push(SURFACE.NO_NAVIGATION_LINE);
  return lines;
}

/** One navigation of the answer, rendered alone: the block whose own text the pins read. */
function alone(answer, navigation) {
  return {
    state: answer.state,
    absence: answer.absence,
    navigations: [navigation],
    unattributed: [],
  };
}

function rowsOf(surface, what) {
  assert.ok(
    Array.isArray(surface.columns),
    `${what}: the pane answers a row per navigation`,
  );
  return surface.columns;
}

// --------------------------------------------------------------------------- the pins ----

/** AC1: one block per navigation the answer carried, in the answer's order and no other. */
function pinOneBlockPerNavigation(surface, answer, what) {
  if (surface.columns.length !== answer.navigations.length) {
    throw new assert.AssertionError({
      message: `one-block-per-navigation (${what}): the answer carried ${answer.navigations.length} navigation(s) and the pane rendered ${surface.columns.length}`,
    });
  }
  answer.navigations.forEach((nav, index) => {
    const row = surface.columns[index];
    if (
      row === undefined ||
      row.state !== nav.state ||
      row.route !== (nav.url ?? '')
    ) {
      throw new assert.AssertionError({
        message: `one-block-per-navigation (${what}): block ${index} must keep the state and place of its navigation (${nav.state} ${nav.url}); it held ${JSON.stringify(row && { state: row.state, route: row.route })}`,
      });
    }
  });
}

/** AC3: an open navigation renders its stage reached, its last event and the holder it cannot name. */
function pinOpenNavigation(surface, nav, what) {
  const row = rowsOf(surface, what)[0];
  if (row === undefined)
    throw new assert.AssertionError({
      message: `open-navigation-own-text (${what}): the pane rendered no row`,
    });
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `open-navigation-own-text (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  if (row.state !== nav.state)
    fail(`state must be ${nav.state}, got ${row.state}`);
  if (row.stage !== (nav.stage ?? ''))
    fail(`stage must be ${nav.stage}, got ${JSON.stringify(row.stage)}`);
  if (row.lastEvent !== (nav.lastEvent ?? ''))
    fail(
      `lastEvent must be ${nav.lastEvent}, got ${JSON.stringify(row.lastEvent)}`,
    );
  // The holder is the answer's own cannot-tell answer, never a name: no guard, chunk or task.
  if (row.holder !== CANNOT_TELL)
    fail(`holder must be ${CANNOT_TELL}, got ${JSON.stringify(row.holder)}`);
  if (row.holderAbsence !== NO_HOLDER_RECORDED)
    fail(
      `holder absence must be ${NO_HOLDER_RECORDED}, got ${JSON.stringify(row.holderAbsence)}`,
    );
  if (
    nav.stage !== null &&
    !surface.lines.includes(`stage reached: ${nav.stage}`)
  )
    fail(`the pane must print stage reached: ${nav.stage}`);
  if (
    nav.lastEvent !== null &&
    !surface.lines.includes(`lastEvent: ${nav.lastEvent}`)
  )
    fail(`the pane must print lastEvent: ${nav.lastEvent}`);
  if (!surface.lines.includes(`holder: ${CANNOT_TELL}`))
    fail(`the pane must print holder: ${CANNOT_TELL}`);
  if (!surface.lines.includes(`holder absence: ${NO_HOLDER_RECORDED}`))
    fail(`the pane must print holder absence: ${NO_HOLDER_RECORDED}`);
  // An open navigation has no terminal, so it prints none of the terminal's own text.
  for (const other of TERMINAL_CLASSES) {
    if (surface.lines.includes(`terminal: ${other}`))
      fail(`an open navigation must not print terminal: ${other}`);
  }
  if (surface.lines.some((line) => line.startsWith('endRoute: ')))
    fail('an open navigation recorded no end route, so the pane prints none');
  for (const label of ['code: ', 'reason: ', 'error: ', 'error message: ']) {
    if (surface.lines.some((line) => line.startsWith(label)))
      fail(
        `an open navigation carries no ${label.trim()}, so the pane prints none`,
      );
  }
}

/**
 * AC1/AC2: an ended navigation renders its terminal class and only that class's own fields, with the
 * end route only where the terminal event recorded one.
 */
function pinTerminalNavigation(surface, nav, what) {
  const row = rowsOf(surface, what)[0];
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `terminal-navigation-own-fields (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  if (!TERMINAL_CLASSES.includes(nav.terminal))
    fail(`the fixture must carry a terminal class, got ${nav.terminal}`);
  if (row.terminal !== nav.terminal)
    fail(
      `terminal must be ${nav.terminal}, got ${JSON.stringify(row.terminal)}`,
    );
  if (!surface.lines.includes(`terminal: ${nav.terminal}`))
    fail(`the pane must print terminal: ${nav.terminal}`);
  for (const other of TERMINAL_CLASSES) {
    if (other !== nav.terminal && surface.lines.includes(`terminal: ${other}`))
      fail(
        `the navigation reached ${nav.terminal}, so the pane may not print terminal: ${other}`,
      );
  }
  const endRoute = nav.urlAfterRedirects ?? '';
  if (row.endRoute !== endRoute)
    fail(
      `endRoute must be ${JSON.stringify(endRoute)}, got ${JSON.stringify(row.endRoute)}`,
    );
  if (endRoute === '' && surface.lines.some((l) => l.startsWith('endRoute: ')))
    fail(
      `${nav.terminal} recorded no end route, so the pane prints none — printing one would name a destination the router never stated`,
    );
  if (endRoute !== '' && !surface.lines.includes(`endRoute: ${endRoute}`))
    fail(`the terminal carried ${endRoute}, so the pane must print it`);
  const code = measured(nav.code);
  if ((code === null ? '' : String(code)) !== row.code)
    fail(`code must be ${code}, got ${JSON.stringify(row.code)}`);
  if (code !== null && !surface.lines.includes(`code: ${code}`))
    fail(`the terminal carried code ${code}, so the pane must print it`);
  if ((nav.reason ?? '') !== row.reason)
    fail(
      `reason must be ${JSON.stringify(nav.reason)}, got ${JSON.stringify(row.reason)}`,
    );
  const errorName = nav.error === null ? '' : (nav.error.name ?? '');
  if (row.errorName !== errorName)
    fail(
      `error must be ${JSON.stringify(errorName)}, got ${JSON.stringify(row.errorName)}`,
    );
  if (errorName !== '' && !surface.lines.includes(`error: ${errorName}`))
    fail(`the terminal carried error ${errorName}, so the pane must print it`);
  // An ended navigation prints no stage, no last event and no holder: it sits at no stage and the
  // answer names no holder for it.
  if (surface.lines.some((line) => line.startsWith('stage reached: ')))
    fail('an ended navigation sits at no stage, so the pane prints none');
  if (surface.lines.some((line) => line.startsWith('lastEvent: ')))
    fail(
      'an ended navigation prints its terminal class and not the same class again as a last event',
    );
  for (const label of ['holder: ', 'holder absence: ']) {
    if (surface.lines.some((line) => line.startsWith(label)))
      fail(
        `the answer named no holder for an ended navigation, so the pane prints none`,
      );
  }
}

/** AC4: the guard aggregate is reported as the aggregate it is, with its own absence and no name. */
function pinGuardAggregate(surface, nav, what) {
  const row = rowsOf(surface, what)[0];
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `guard-verdict-names-no-guard (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  if (nav.guards === null) {
    for (const label of ['guards: ', 'guards absence: ', 'shouldActivate: ']) {
      if (surface.lines.some((line) => line.startsWith(label)))
        fail(
          `the answer carried no guard check, so the pane prints no ${label.trim()}`,
        );
    }
    if (surface.text.includes(GUARD_VERDICT_NOT_RECORDED))
      fail(
        `the answer carried no guard check, so the pane may not print ${GUARD_VERDICT_NOT_RECORDED}`,
      );
    return;
  }
  if (row.guards !== CANNOT_TELL)
    fail(`guards must be ${CANNOT_TELL}, got ${JSON.stringify(row.guards)}`);
  if (row.guardAbsence !== GUARD_VERDICT_NOT_RECORDED)
    fail(
      `guards absence must be ${GUARD_VERDICT_NOT_RECORDED}, got ${JSON.stringify(row.guardAbsence)}`,
    );
  if (row.shouldActivate !== booleanText(nav.guards.shouldActivate))
    fail(
      `shouldActivate must be the aggregate ${nav.guards.shouldActivate}, got ${JSON.stringify(row.shouldActivate)}`,
    );
  if (!surface.lines.includes(`guards: ${CANNOT_TELL}`))
    fail(`the pane must print guards: ${CANNOT_TELL}`);
  if (!surface.lines.includes(`guards absence: ${GUARD_VERDICT_NOT_RECORDED}`))
    fail(`the pane must print guards absence: ${GUARD_VERDICT_NOT_RECORDED}`);
  if (!surface.lines.includes(`shouldActivate: ${nav.guards.shouldActivate}`))
    fail(`the pane must print shouldActivate: ${nav.guards.shouldActivate}`);
  // Never a guard name: the recording's own names, and the words a reader could mistake for one.
  for (const name of MEASURED_GUARD_NAMES) {
    if (surface.text.includes(name))
      fail(`the stream names no guard, so the pane may not name ${name}`);
  }
  if (/chunk|task/i.test(surface.text))
    fail('no chunk or task name may appear in the pane');
}

/** AC4: a resolve stage prints its own named absence. */
function pinResolveAbsence(surface, nav, what) {
  const row = rowsOf(surface, what)[0];
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `resolve-names-no-resolver (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  if (nav.resolve === null) {
    for (const label of ['resolve: ', 'resolve absence: ']) {
      if (surface.lines.some((line) => line.startsWith(label)))
        fail(
          `the answer reached no resolve stage, so the pane prints no ${label.trim()}`,
        );
    }
    if (surface.text.includes(NO_RESOLVER_CONFIGURED))
      fail(
        `the answer reached no resolve stage, so the pane may not print ${NO_RESOLVER_CONFIGURED}`,
      );
    return;
  }
  if (row.resolve !== CANNOT_TELL)
    fail(`resolve must be ${CANNOT_TELL}, got ${JSON.stringify(row.resolve)}`);
  if (row.resolveAbsence !== NO_RESOLVER_CONFIGURED)
    fail(
      `resolve absence must be ${NO_RESOLVER_CONFIGURED}, got ${JSON.stringify(row.resolveAbsence)}`,
    );
  if (!surface.lines.includes(`resolve: ${CANNOT_TELL}`))
    fail(`the pane must print resolve: ${CANNOT_TELL}`);
  if (!surface.lines.includes(`resolve absence: ${NO_RESOLVER_CONFIGURED}`))
    fail(`the pane must print resolve absence: ${NO_RESOLVER_CONFIGURED}`);
}

/**
 * AC5: each load is attributed by its own `route` and carries its measured interval as its own
 * number, while a load the answer could not close carries none.
 */
function pinLoadsAttributed(surface, nav, what) {
  const row = rowsOf(surface, what)[0];
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `loads-attributed-by-route (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  if (row.loads.length !== nav.loads.length)
    fail(
      `the answer carried ${nav.loads.length} load(s) and the pane rendered ${row.loads.length}`,
    );
  nav.loads.forEach((load, index) => {
    const cell = row.loads[index];
    if (cell === undefined || cell.route !== (load.route ?? ''))
      fail(
        `load ${index} must be attributed by its own route ${JSON.stringify(load.route)}, got ${JSON.stringify(cell && cell.route)}`,
      );
    const duration = measured(load.durationMs);
    const interval = duration === null ? '' : String(duration);
    if (cell.interval !== interval)
      fail(
        `load ${index} (${load.route}) must carry its measured interval ${JSON.stringify(interval)}, got ${JSON.stringify(cell.interval)}`,
      );
    if (duration === null && cell.interval !== '')
      fail(
        `load ${index} (${load.route}) has no end, so its interval cell holds nothing; it held ${JSON.stringify(cell.interval)}`,
      );
    const routeLine = `load: ${load.route === null ? SURFACE.NO_LOAD_ROUTE : load.route}`;
    if (!surface.lines.includes(routeLine))
      fail(`the pane must print ${routeLine}`);
    if (
      duration !== null &&
      !surface.lines.includes(`load interval: ${duration}`)
    )
      fail(`the pane must print load interval: ${duration}`);
  });
}

/** AC5: a measured zero is a measurement and renders `0`, never a blank and never dropped. */
function pinMeasuredZero(surface, answer, what) {
  let zeros = 0;
  answer.navigations.forEach((nav, navIndex) => {
    const row = surface.columns[navIndex];
    nav.loads.forEach((load, index) => {
      if (load.durationMs !== 0) return;
      zeros += 1;
      const cell = row === undefined ? undefined : row.loads[index];
      if (cell === undefined || cell.interval !== '0')
        throw new assert.AssertionError({
          message: `measured-zero-renders-zero (${what}): a load measured at 0 must render 0; the cell held ${JSON.stringify(cell && cell.interval)}`,
        });
      if (!surface.lines.includes('load interval: 0'))
        throw new assert.AssertionError({
          message: `measured-zero-renders-zero (${what}): the pane must print load interval: 0; it printed ${JSON.stringify(surface.lines)}`,
        });
    });
  });
  assert.ok(
    zeros > 0,
    `measured-zero-renders-zero (${what}): the fixture must carry a measured zero to pin`,
  );
}

/** AC5: a load the answer could not close prints no number at all. */
function pinUnclosedLoadPrintsNoNumber(surface, answer, what) {
  let unclosed = 0;
  let measuredLoads = 0;
  for (const nav of answer.navigations) {
    for (const load of nav.loads) {
      if (measured(load.durationMs) === null) unclosed += 1;
      else measuredLoads += 1;
    }
  }
  assert.ok(
    unclosed > 0,
    `unclosed-load-prints-no-number (${what}): the fixture must carry an unclosed load to pin`,
  );
  const intervalLines = surface.lines.filter((line) =>
    line.startsWith('load interval: '),
  );
  if (intervalLines.length !== measuredLoads)
    throw new assert.AssertionError({
      message: `unclosed-load-prints-no-number (${what}): the answer measured ${measuredLoads} load(s) and ${unclosed} it could not close, so the pane may print ${measuredLoads} interval line(s) and not one more; it printed ${JSON.stringify(intervalLines)}`,
    });
  for (const row of surface.columns) {
    row.loads.forEach((cell, index) => {
      if (cell.open && cell.interval !== '')
        throw new assert.AssertionError({
          message: `unclosed-load-prints-no-number (${what}): an unclosed load's interval cell must hold nothing; load ${index} held ${JSON.stringify(cell.interval)}`,
        });
    });
  }
}

/** AC5: the answer's unattributed loads render as unattributed, never as a navigation's load. */
function pinUnattributedIsNotALoad(surface, answer, what) {
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `unattributed-is-not-a-load (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  const rendered = surface.lines.filter((line) =>
    line.startsWith('unattributed: '),
  );
  if (rendered.length !== answer.unattributed.length)
    fail(
      `the answer carried ${answer.unattributed.length} unattributed load(s) and the pane rendered ${rendered.length}`,
    );
  for (const entry of answer.unattributed) {
    const route = text(entry.route);
    const kind = text(entry.kind);
    if (route !== null) {
      if (!surface.text.includes(route))
        fail(`the unattributed load's route ${route} must be rendered`);
      for (const row of surface.columns) {
        if (row.loads.some((cell) => cell.route === route))
          fail(
            `the unattributed load ${route} was folded into a navigation, which is the attribution the answer refused`,
          );
      }
      if (surface.lines.includes(`load: ${route}`))
        fail(
          `the unattributed load ${route} was printed as a navigation's load`,
        );
    }
    if (kind !== null && !surface.text.includes(kind))
      fail(`the unattributed load's kind ${kind} must be rendered`);
  }
  assert.ok(
    answer.unattributed.length > 0,
    `unattributed-is-not-a-load (${what}): the fixture must carry an unattributed load to pin`,
  );
}

/** AC5/AC1: a matched path renders where the answer carried it, and only then. */
function pinMatchedPath(surface, nav, what) {
  const row = rowsOf(surface, what)[0];
  const fail = (detail) => {
    throw new assert.AssertionError({
      message: `matched-path-only-where-carried (${what}): ${detail}; the pane rendered ${JSON.stringify(surface.lines)}`,
    });
  };
  const carried = nav.matched === null ? null : text(nav.matched.path);
  if ((carried ?? '') !== row.matched)
    fail(
      `matched must be ${JSON.stringify(carried)}, got ${JSON.stringify(row.matched)}`,
    );
  if (carried === null) {
    if (surface.lines.some((line) => line.startsWith('matched: ')))
      fail(
        'the answer carried no route chain, so the pane prints no matched path',
      );
    return;
  }
  if (!surface.lines.includes(`matched: ${carried}`))
    fail(`the pane must print matched: ${carried}`);
}

/** AC1/E7: each state renders its own text and no other state's. */
function pinStatesExclusive(surface, nav, what) {
  for (const [label, carried] of PART_LABELS) {
    const has = carried(nav);
    const printed = surface.lines.filter((line) =>
      line.startsWith(`${label}: `),
    );
    if (!has && printed.length > 0)
      throw new assert.AssertionError({
        message: `states-exclusive (${what}): the answer carried no ${label} for this navigation, so the pane may print no ${label} line; it printed ${JSON.stringify(printed)}`,
      });
    if (has && printed.length === 0)
      throw new assert.AssertionError({
        message: `states-exclusive (${what}): the answer carried a ${label}, so the pane must print it; it printed ${JSON.stringify(surface.lines)}`,
      });
    if (printed.length > 1)
      throw new assert.AssertionError({
        message: `states-exclusive (${what}): one ${label} is one line; the pane printed ${JSON.stringify(printed)}`,
      });
  }
}

/** SC3/AC2: nothing the answer did not carry is rendered — the exact lines, and nothing else. */
function pinRendersNothingElse(surface, answer, what) {
  const expected = expectedLines(answer);
  assert.deepEqual(
    [...surface.lines],
    expected,
    `renders-nothing-it-was-not-given (${what}): the pane must render the answer's own values in the answer's order; it rendered ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.text,
    expected.join('\n'),
    `renders-nothing-it-was-not-given (${what}): the text is the lines`,
  );
  assert.equal(
    surface.state,
    answer.state,
    `renders-nothing-it-was-not-given (${what}): the state is the answer's own word (${answer.state}), got ${surface.state}`,
  );
  assert.ok(
    surface.text.trim() !== '',
    `renders-nothing-it-was-not-given (${what}): never a blank pane`,
  );
}

/** AC4: the pane starts idle, renders no row, and states nothing about any navigation. */
function pinIdle(surface) {
  assert.equal(surface.state, 'idle', 'idle-own-text: state');
  assert.equal(surface.kind, 'idle', 'idle-own-text: kind');
  assert.deepEqual(
    surface.columns,
    [],
    'idle-own-text: no row while nothing arrived',
  );
  assert.ok(surface.lines.length > 0, 'idle-own-text: never a blank pane');
  assert.ok(surface.text.includes('idle'), 'idle-own-text: says idle');
  for (const marker of [
    'state: ',
    'route: ',
    'terminal: ',
    'stage reached: ',
    'holder: ',
    'load: ',
    'unattributed: ',
  ]) {
    assert.equal(
      surface.text.includes(marker),
      false,
      `idle-own-text: nothing has arrived, so it renders no ${marker.trim()} line; it rendered: ${surface.text}`,
    );
  }
}

/** AC1: a state word this pane was not written for is rendered as the word it was given. */
function pinGivenState(surface, word) {
  assert.equal(
    surface.state,
    word,
    `given-state-rendered: the word the answer carried, got ${surface.state}`,
  );
  assert.ok(
    surface.lines.includes(`state: ${word}`),
    `given-state-rendered: the block prints the word it was given; it printed: ${surface.text}`,
  );
  for (const other of ['open', 'ended']) {
    if (other === word) continue;
    assert.equal(
      surface.lines.includes(`state: ${other}`),
      false,
      `given-state-rendered: the pane must not relabel ${word} as ${other}; it printed: ${surface.text}`,
    );
  }
}

/** E8: the same answer rendered twice is byte-identical. */
function pinByteIdentical(render) {
  const once = render();
  const twice = render();
  assert.equal(once.text, twice.text, 'byte-identical: the text of two reads');
  assert.deepEqual(
    [...once.lines],
    [...twice.lines],
    'byte-identical: the lines of two reads',
  );
  assert.deepEqual(
    [...once.columns],
    [...twice.columns],
    'byte-identical: the rows of two reads',
  );
}

/**
 * SC1: the pane reads no record, joins nothing, matches nothing and reads no clock — measured in
 * its source with its own prose removed, so a comment cannot satisfy or violate the rule.
 */
function pinReadsOnlyTheAnswer(source) {
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
  const forbidden = [
    ['the record the join reads', 'routerEvents'],
    ["the page's current navigation", 'currentNavigation'],
    ['the join itself', 'narrateNavigation'],
    ["the narrator's namespace", 'globalThis'],
    ['a wall clock', 'Date.now('],
    ["the page's clock", 'performance.now('],
    ['a fresh date', 'new Date('],
    ['a document', 'document'],
    ['a window', 'window'],
  ];
  for (const [what, needle] of forbidden) {
    assert.equal(
      code.includes(needle),
      false,
      `reads-only-the-answer: the pane must not read ${what}; its code names ${needle}`,
    );
  }
  assert.equal(
    /^\s*import\s/m.test(code),
    false,
    'reads-only-the-answer: the pane imports nothing at runtime, so its suite executes it',
  );
  assert.equal(
    /\.sort\(/.test(code),
    false,
    "reads-only-the-answer: the answer's order is the pane's order, so the pane never sorts",
  );
}

// -------------------------------------------------------------------------- the cases ----

describe('the measurement this pane renders', () => {
  it('the recording measures the frames, the guard names and the wildcard chain', () => {
    assert.deepEqual(
      RECORDING.events.classes
        .map((row) => row.name)
        .filter((name) => TERMINAL_CLASSES.includes(name))
        .sort(),
      [...TERMINAL_CLASSES].sort(),
      'the recording enumerates the four terminal classes and no fifth',
    );
    assert.equal(MEASURED_GUARD_NAMES.includes('redirectGuard'), true);
    // The portal's canMatch guards are anonymous functions: a name from configuration only when
    // the function carries one, which is why a guard is never printed from this stream.
    assert.deepEqual(RECORDING.guards.portal.canMatchNames, ['']);
    assert.deepEqual(
      GUARD_COMPARISON.refusedMatchedChain.map((node) => node.path),
      [null, '**'],
      'the refused and the unmatched navigation both end on the wildcard route',
    );
    assert.equal(UNOPENED_ROUTE, 'lazy');
    console.log(
      `navigation fixture: terminals ${TERMINAL_CLASSES.join(', ')}; guard names ${JSON.stringify(MEASURED_GUARD_NAMES)}; wildcard chain ${JSON.stringify(GUARD_COMPARISON.refusedMatchedChain.map((node) => node.path))}`,
    );
  });

  it('the join answers the frames this pane is written for', () => {
    const held = answerOf(heldRecord());
    assert.equal(held.state, JOIN.OPEN);
    assert.equal(held.navigations[0].stage, JOIN.ROUTE_CONFIG_LOAD);
    assert.deepEqual(held.navigations[0].holder, {
      state: CANNOT_TELL,
      absence: NO_HOLDER_RECORDED,
    });

    const warm = answerOf(warmRecord());
    assert.equal(warm.state, JOIN.ENDED);
    assert.deepEqual(
      warm.navigations[0].loads.map((load) => load.durationMs),
      RECORDING.warm.routeConfigLoads.map((load) => load.endAt - load.startAt),
    );
    assert.equal(
      warm.navigations[0].guards.absence,
      GUARD_VERDICT_NOT_RECORDED,
    );
    assert.equal(warm.navigations[0].resolve.absence, NO_RESOLVER_CONFIGURED);

    const superseded = answerOf(supersededRecord());
    assert.deepEqual(
      superseded.navigations.map((nav) => nav.terminal),
      ['NavigationCancel', 'NavigationEnd'],
    );
    assert.equal(superseded.navigations[0].urlAfterRedirects, null);
    assert.equal(superseded.navigations[1].urlAfterRedirects, '/contract/list');

    const skip = answerOf(skipRecord());
    assert.equal(skip.navigations[0].terminal, 'NavigationSkipped');
    assert.equal(skip.navigations[0].code, 0);

    const zero = answerOf(measuredZeroRecord());
    assert.equal(zero.navigations[0].loads[0].durationMs, 0);

    const stray = answerOf(navigatedWithUnattributedRecord());
    assert.deepEqual(
      [...stray.unattributed],
      [{ kind: 'RouteConfigLoadEnd', route: UNOPENED_ROUTE }],
    );
    assert.equal(stray.navigations.length, 1);
    assert.ok(
      stray.navigations[0].loads.every((load) => load.route !== UNOPENED_ROUTE),
      'no navigation in the stream opened the stray load',
    );

    const wildcard = answerOf(unmatchedRecord());
    assert.equal(wildcard.navigations[0].matched.path, '**');
    assert.equal(wildcard.navigations[0].matched.wildcard, true);
    assert.equal(wildcard.navigations[0].guards.shouldActivate, true);
  });
});

describe('the pane renders the join’s answer (SC1, SC2, SC3)', () => {
  it('AC3: an open navigation renders its stage reached, its last event and no holder name', () => {
    const answer = answerOf(heldRecord());
    const nav = answer.navigations[0];
    const surface = SURFACE.navigationPanel(answer);
    const one = SURFACE.navigationPanel(alone(answer, nav));

    pinOneBlockPerNavigation(surface, answer, 'held');
    pinOpenNavigation(one, nav, 'held');
    pinStatesExclusive(one, nav, 'held');
    pinLoadsAttributed(one, nav, 'held');
    pinUnclosedLoadPrintsNoNumber(one, answer, 'held');
    pinRendersNothingElse(surface, answer, 'held');
    // The stage is where the navigation got to, never the reason it is open: the pane says the
    // stage, the last event and the holder, and offers no cause.
    assert.equal(/\bbecause\b|\breason\b|caused/i.test(surface.text), false);
    assert.deepEqual(
      [...one.lines],
      [
        'state: open',
        'route: /complaint/list',
        'stage reached: route-config-load',
        'lastEvent: RouteConfigLoadStart',
        'holder: cannot-tell',
        'holder absence: no-holder-recorded',
        'load: complaint',
      ],
    );
    console.log(`navigation open: ${JSON.stringify(one.lines)}`);
  });

  it('AC1/AC2: each terminal class renders as itself and only its own fields', () => {
    const cases = [
      ['warm', answerOf(warmRecord())],
      ['superseded', answerOf(supersededRecord())],
      ['error', answerOf(errorRecord())],
      ['skip', answerOf(skipRecord())],
      ['redirect', answerOf(redirectRecord())],
    ];
    const terminals = new Set();
    for (const [what, answer] of cases) {
      const surface = SURFACE.navigationPanel(answer);
      pinOneBlockPerNavigation(surface, answer, what);
      pinRendersNothingElse(surface, answer, what);
      answer.navigations.forEach((nav, index) => {
        terminals.add(nav.terminal);
        const one = SURFACE.navigationPanel(alone(answer, nav));
        assert.equal(
          one.columns.length,
          1,
          `${what}: the block under pin must be one row`,
        );
        void index;
        pinTerminalNavigation(one, nav, what);
        pinStatesExclusive(one, nav, what);
        pinGuardAggregate(one, nav, what);
        pinResolveAbsence(one, nav, what);
        pinMatchedPath(one, nav, what);
        pinLoadsAttributed(one, nav, what);
      });
    }
    // All four classes the recording enumerates render, so none was dropped by this pin.
    assert.deepEqual(
      [...terminals].sort(),
      [...TERMINAL_CLASSES].sort(),
      'every terminal class the recording enumerates renders as itself',
    );
  });

  it('AC2: an end route appears only where the terminal event carried one', () => {
    const answer = answerOf(supersededRecord());
    const surface = SURFACE.navigationPanel(answer);
    const [cancelled, ended] = answer.navigations;
    assert.equal(cancelled.urlAfterRedirects, null);
    assert.equal(ended.urlAfterRedirects, '/contract/list');
    // One record, two navigations, one end route: the cancel prints none and the end prints one.
    assert.equal(
      surface.lines.filter((line) => line.startsWith('endRoute: ')).length,
      1,
      `one of the two navigations recorded an end route; the pane rendered ${JSON.stringify(surface.lines)}`,
    );
    assert.ok(surface.lines.includes('endRoute: /contract/list'));
    // The heading route is the recorded `url`, never the end route on the navigation that has none.
    assert.ok(surface.lines.includes('route: /claim/list'));
    assert.ok(surface.lines.includes('route: /contract/list'));
    console.log(
      `navigation end routes: ${JSON.stringify(surface.lines.filter((line) => line.startsWith('endRoute: ')))}`,
    );
  });

  it('AC4: the guard aggregate and the resolve stage render their own named absences', () => {
    const answer = answerOf(warmRecord());
    const nav = answer.navigations[0];
    const one = SURFACE.navigationPanel(alone(answer, nav));
    pinGuardAggregate(one, nav, 'warm');
    pinResolveAbsence(one, nav, 'warm');
    assert.ok(one.lines.includes('shouldActivate: true'));
    assert.ok(
      one.lines.includes(`guards absence: ${GUARD_VERDICT_NOT_RECORDED}`),
    );
    assert.ok(one.lines.includes(`resolve absence: ${NO_RESOLVER_CONFIGURED}`));
  });

  it('AC4: an answer that carried no guard check and no resolve stage prints neither', () => {
    const answer = answerOf(supersededRecord());
    const cancelled = answer.navigations[0];
    const one = SURFACE.navigationPanel(alone(answer, cancelled));
    pinGuardAggregate(one, cancelled, 'cancel');
    pinResolveAbsence(one, cancelled, 'cancel');
    assert.equal(one.text.includes(GUARD_VERDICT_NOT_RECORDED), false);
    assert.equal(one.text.includes(NO_RESOLVER_CONFIGURED), false);
  });

  it('AC5: each load is attributed by its own route with its measured interval', () => {
    const answer = answerOf(warmRecord());
    const surface = SURFACE.navigationPanel(answer);
    const [loads] = answer.navigations.map((nav) => nav.loads);
    assert.equal(loads.length, 2);
    assert.deepEqual(
      surface.columns[0].loads.map((cell) => cell.route),
      loads.map((load) => load.route),
    );
    for (const load of loads) {
      assert.ok(surface.lines.includes(`load: ${load.route}`));
      assert.ok(
        surface.lines.includes(`load interval: ${load.durationMs}`),
        `the pane must print the measured interval of ${load.route}`,
      );
    }
    // The abandoned navigation's own load end closed its own load: the superseded stream's cancel
    // carries the interval that belongs to it, and the successor carries its own two.
    const superseded = answerOf(supersededRecord());
    const abandoned = superseded.navigations[0];
    const successor = superseded.navigations[1];
    assert.equal(abandoned.loads[0].route, 'claim');
    assert.ok(abandoned.loads[0].endedAt > abandoned.loads[0].startedAt);
    assert.deepEqual(
      successor.loads.map((load) => load.route),
      ['contract', 'list'],
      'the successor owns its own loads, never the abandoned one',
    );
    const rendered = SURFACE.navigationPanel(superseded);
    assert.deepEqual(
      rendered.columns.map((row) => row.loads.map((cell) => cell.route)),
      [['claim'], ['contract', 'list']],
      `each load stays with the navigation its own start belonged to; the pane rendered ${JSON.stringify(rendered.columns.map((row) => row.loads))}`,
    );
  });

  it('AC5: a measured zero renders as 0 and a wildcard match renders the path carried', () => {
    const zero = answerOf(measuredZeroRecord());
    const zeroSurface = SURFACE.navigationPanel(zero);
    pinMeasuredZero(zeroSurface, zero, 'measured zero');
    pinRendersNothingElse(zeroSurface, zero, 'measured zero');
    assert.equal(zero.navigations[0].loads[0].durationMs, 0);
    assert.ok(zeroSurface.lines.includes('load interval: 0'));
    assert.equal(
      zeroSurface.lines.filter((line) => line.startsWith('load interval: '))
        .length,
      1,
      'one measured load, one interval line',
    );

    const wildcard = answerOf(unmatchedRecord());
    const wildcardSurface = SURFACE.navigationPanel(wildcard);
    pinMatchedPath(wildcardSurface, wildcard.navigations[0], 'unmatched URL');
    assert.ok(wildcardSurface.lines.includes('matched: **'));
    // A wildcard match is the match it is: no refusal, no guard name, no cancel.
    assert.equal(
      wildcardSurface.lines.some((line) =>
        line.startsWith('terminal: NavigationCancel'),
      ),
      false,
    );
    for (const name of MEASURED_GUARD_NAMES) {
      assert.equal(wildcardSurface.text.includes(name), false);
    }
  });

  it('AC5: an unattributed load renders as unattributed, never as a navigation’s load', () => {
    const answer = answerOf(navigatedWithUnattributedRecord());
    const surface = SURFACE.navigationPanel(answer);
    pinUnattributedIsNotALoad(surface, answer, 'unattributed');
    pinOneBlockPerNavigation(surface, answer, 'unattributed');
    pinRendersNothingElse(surface, answer, 'unattributed');
    assert.deepEqual(
      [...answer.unattributed],
      [{ kind: 'RouteConfigLoadEnd', route: UNOPENED_ROUTE }],
    );
    assert.ok(
      surface.lines.includes(
        `unattributed: RouteConfigLoadEnd ${UNOPENED_ROUTE}`,
      ),
    );
    assert.equal(
      surface.columns.some((row) =>
        row.loads.some((cell) => cell.route === UNOPENED_ROUTE),
      ),
      false,
      'no row may own the load the answer left unattributed',
    );
    assert.equal(surface.lines.includes(`load: ${UNOPENED_ROUTE}`), false);
  });

  it('AC1: each state renders its own text and no other state’s', () => {
    for (const [what, record] of everyRecord()) {
      const answer = answerOf(record);
      const surface = SURFACE.navigationPanel(answer);
      pinOneBlockPerNavigation(surface, answer, what);
      pinRendersNothingElse(surface, answer, what);
      for (const nav of answer.navigations) {
        const one = SURFACE.navigationPanel(alone(answer, nav));
        pinStatesExclusive(one, nav, what);
      }
      if (answer.unattributed.length > 0)
        pinUnattributedIsNotALoad(surface, answer, what);
    }
  });

  it('AC1: a navigation that recorded only its start renders the absence the answer names', () => {
    const answer = answerOf({
      routerEvents: [
        entry({ type: 'NavigationStart', at: 10, id: 4, url: '/nowhere-yet' }),
      ],
    });
    const nav = answer.navigations[0];
    assert.equal(nav.stage, null);
    assert.equal(nav.absence, JOIN.NO_STAGE_RECORDED);
    const one = SURFACE.navigationPanel(alone(answer, nav));
    assert.ok(one.lines.includes(`stage absence: ${JOIN.NO_STAGE_RECORDED}`));
    assert.equal(
      one.lines.some((line) => line.startsWith('stage reached: ')),
      false,
      'the answer carried no stage, so the pane mints none',
    );
    pinStatesExclusive(one, nav, 'start only');
    pinOpenNavigation(one, nav, 'start only');
  });

  it('AC3: a record with no navigation states the absence the join named, never a row', () => {
    const answer = answerOf({ routerEvents: [] });
    assert.equal(answer.state, CANNOT_TELL);
    assert.equal(answer.absence, JOIN.NO_NAVIGATION_RECORDED);
    const surface = SURFACE.navigationPanel(answer);
    assert.deepEqual(surface.columns, []);
    assert.equal(surface.state, CANNOT_TELL);
    assert.deepEqual(
      [...surface.lines],
      [`absence: ${JOIN.NO_NAVIGATION_RECORDED}`],
    );

    // An answer carrying nothing at all still says something rather than rendering blank.
    const bare = SURFACE.navigationPanel({ state: JOIN.ENDED });
    assert.deepEqual([...bare.lines], [SURFACE.NO_NAVIGATION_LINE]);
    assert.ok(bare.text.trim() !== '');
  });

  it('AC1: a state the pane was not written for still renders the word it was given', () => {
    const given = {
      state: 'wedged',
      absence: null,
      navigations: [
        {
          id: 9,
          state: 'wedged',
          url: '/somewhere',
          urlAfterRedirects: null,
          terminal: null,
          code: null,
          reason: null,
          error: null,
          stage: null,
          lastEvent: null,
          holder: null,
          absence: null,
          matched: null,
          loads: [],
          guards: null,
          resolve: null,
        },
      ],
      unattributed: [],
    };
    const surface = SURFACE.navigationPanel(given);
    pinGivenState(surface, 'wedged');
    assert.equal(surface.columns.length, 1);
    assert.equal(surface.columns[0].state, 'wedged');
    // Nothing the answer did not carry is minted for a word this pane was not written for.
    assert.deepEqual(
      [...surface.lines],
      ['state: wedged', 'route: /somewhere'],
    );
    // The two words the join does answer stay themselves beside it.
    const mixed = SURFACE.navigationPanel({
      ...given,
      navigations: [
        given.navigations[0],
        { ...given.navigations[0], state: 'open', stage: 'resolve' },
      ],
    });
    assert.deepEqual(
      mixed.lines.filter((line) => line.startsWith('state: ')),
      ['state: wedged', 'state: open'],
    );
  });

  it('AC4: idle renders its own text for every way of having nothing to render', () => {
    for (const input of [
      undefined,
      null,
      {},
      [],
      'navigation',
      7,
      { loading: true },
      { assembling: true },
      { state: CANNOT_TELL, loading: true },
      { navigations: [] },
    ]) {
      pinIdle(SURFACE.navigationPanel(input));
    }
  });

  it('SC1: the pane reads only the answer — no record, no clock, no join', () => {
    pinReadsOnlyTheAnswer(SURFACE_SRC);
    // Handed the record the join reads, the pane answers idle: a record is not an answer and the
    // pane will not become the join.
    pinIdle(SURFACE.navigationPanel(warmRecord()));
    pinIdle(SURFACE.navigationPanel({ routerEvents: WARM.map(fromRecording) }));
  });

  it('E8: the same answer rendered twice is byte-identical', () => {
    for (const [, answer] of everyRecord()) {
      pinByteIdentical(() => SURFACE.navigationPanel(answer));
    }
    const answer = answerOf(warmRecord());
    // The same values, inserted in a different key order, render the same bytes: nothing here reads
    // an object's own order, and nothing is accumulated between reads.
    const reordered = {
      unattributed: [],
      navigations: answer.navigations.map((nav) => {
        const copy = {};
        for (const key of Object.keys(nav).reverse()) copy[key] = nav[key];
        return copy;
      }),
      absence: answer.absence,
      state: answer.state,
    };
    assert.deepEqual(
      [...SURFACE.navigationPanel(reordered).lines],
      expectedLines(answer),
    );
    pinByteIdentical(() => SURFACE.navigationPanel(answer));
  });

  it('AC1: the pane’s exports are the three the route suite names', () => {
    assert.equal(typeof SURFACE.navigationPanel, 'function');
    assert.equal(SURFACE.panelNavigation, SURFACE.navigationPanel);
    assert.equal(SURFACE.navigationSurface, SURFACE.navigationPanel);
    assert.equal(SURFACE.default, SURFACE.navigationPanel);
  });
});

describe('panel-navigation mutants', () => {
  it('M1: a block rendering another state’s text reddens the exclusivity pin, naming it', async () => {
    const mutant = await loadMutant(
      "  if (row.holder !== '') lines.push(`holder: ${row.holder}`);",
      "  lines.push(`holder: ${row.holder === '' ? 'cannot-tell' : row.holder}`);",
    );
    const answer = answerOf(warmRecord());
    const nav = answer.navigations[0];
    // The untouched module renders the ended navigation with no holder line at all.
    pinStatesExclusive(
      SURFACE.navigationPanel(alone(answer, nav)),
      nav,
      'warm',
    );
    const failure = reddens('states-exclusive', () =>
      pinStatesExclusive(
        mutant.module.navigationPanel(alone(answer, nav)),
        nav,
        'warm',
      ),
    );
    assert.match(failure.message, /holder/);
    assert.ok(
      mutant.module
        .navigationPanel(alone(answer, nav))
        .lines.includes('holder: cannot-tell'),
      'the mutant really renders the open state’s text inside an ended navigation',
    );
  });

  it('M2: a held navigation gaining a holder name reddens the open pin, naming it', async () => {
    const mutant = await loadMutant(
      "    holder: holder === null ? '' : (nonEmptyString(holder['state']) ?? ''),",
      "    holder: holder === null ? '' : 'the-lazy-chunk',",
    );
    const answer = answerOf(heldRecord());
    const nav = answer.navigations[0];
    pinOpenNavigation(SURFACE.navigationPanel(alone(answer, nav)), nav, 'held');
    const failure = reddens('open-navigation-own-text', () =>
      pinOpenNavigation(
        mutant.module.navigationPanel(alone(answer, nav)),
        nav,
        'held',
      ),
    );
    assert.match(failure.message, /the-lazy-chunk/);
    assert.equal(
      mutant.module.navigationPanel(alone(answer, nav)).columns[0].holder,
      'the-lazy-chunk',
      'the mutant really names a holder the stream never names',
    );
  });

  it('M3: a guard refusal gaining an identity reddens the guard pin, naming it', async () => {
    const mutant = await loadMutant(
      "  if (row.guards !== '') lines.push(`guards: ${row.guards}`);",
      "  if (row.guards !== '') lines.push(`guards: redirectGuard`);",
    );
    const answer = answerOf(warmRecord());
    const nav = answer.navigations[0];
    pinGuardAggregate(SURFACE.navigationPanel(alone(answer, nav)), nav, 'warm');
    const failure = reddens('guard-verdict-names-no-guard', () =>
      pinGuardAggregate(
        mutant.module.navigationPanel(alone(answer, nav)),
        nav,
        'warm',
      ),
    );
    assert.match(failure.message, /redirectGuard/);
    assert.ok(
      mutant.module
        .navigationPanel(alone(answer, nav))
        .text.includes('redirectGuard'),
      'the mutant really names the guard the configuration carries',
    );
  });

  it('M4: an unattributed load folded into a navigation reddens the unattributed pin, naming it', async () => {
    const mutant = await loadMutant(
      [
        '  const lines: string[] = [];',
        "  // The record's own absence, where it named one: the reason there is no navigation to render. It",
      ].join('\n'),
      [
        '  if (columns.length > 0) {',
        '    const first = columns[0];',
        '    for (const entry of read.unattributed) {',
        '      if (!isObject(entry)) continue;',
        '      first.loads.push({',
        "        route: nonEmptyString(entry['route']) ?? '',",
        "        interval: '',",
        '        open: true,',
        '      });',
        '    }',
        '  }',
        '  const lines: string[] = [];',
        "  // The record's own absence, where it named one: the reason there is no navigation to render. It",
      ].join('\n'),
    );
    const answer = answerOf(navigatedWithUnattributedRecord());
    const surface = SURFACE.navigationPanel(answer);
    pinUnattributedIsNotALoad(surface, answer, 'unattributed');
    const failure = reddens('unattributed-is-not-a-load', () =>
      pinUnattributedIsNotALoad(
        mutant.module.navigationPanel(answer),
        answer,
        'unattributed',
      ),
    );
    assert.match(failure.message, new RegExp(UNOPENED_ROUTE));
    assert.ok(
      mutant.module
        .navigationPanel(answer)
        .columns.some((row) =>
          row.loads.some((cell) => cell.route === UNOPENED_ROUTE),
        ),
      'the mutant really gives the stray load to the first navigation',
    );
  });

  it('M5: a measured zero dropped reddens the zero pin, naming it', async () => {
    const mutant = await loadMutant(
      [
        "  if (typeof value !== 'number' || !Number.isFinite(value)) return '';",
        '  return String(value);',
      ].join('\n'),
      [
        "  if (typeof value !== 'number' || !Number.isFinite(value)) return '';",
        "  if (value === 0) return '';",
        '  return String(value);',
      ].join('\n'),
    );
    const answer = answerOf(measuredZeroRecord());
    pinMeasuredZero(SURFACE.navigationPanel(answer), answer, 'measured zero');
    const failure = reddens('measured-zero-renders-zero', () =>
      pinMeasuredZero(
        mutant.module.navigationPanel(answer),
        answer,
        'measured zero',
      ),
    );
    assert.match(failure.message, /must render 0/);
    assert.equal(
      mutant.module.navigationPanel(answer).columns[0].loads[0].interval,
      '',
      'the mutant really drops the measured zero',
    );
  });

  it('M6: an end route invented where none was recorded reddens the terminal pin, naming it', async () => {
    const mutant = await loadMutant(
      "  if (row.endRoute !== '') lines.push(`endRoute: ${row.endRoute}`);",
      "  lines.push(`endRoute: ${row.endRoute === '' ? row.route : row.endRoute}`);",
    );
    const answer = answerOf(supersededRecord());
    const cancelled = answer.navigations[0];
    pinTerminalNavigation(
      SURFACE.navigationPanel(alone(answer, cancelled)),
      cancelled,
      'cancel',
    );
    const failure = reddens('terminal-navigation-own-fields', () =>
      pinTerminalNavigation(
        mutant.module.navigationPanel(alone(answer, cancelled)),
        cancelled,
        'cancel',
      ),
    );
    assert.match(failure.message, /cancel|end route/i);
    assert.ok(
      mutant.module
        .navigationPanel(alone(answer, cancelled))
        .lines.includes('endRoute: /claim/list'),
      'the mutant really reports the cancel’s own url as its end route',
    );
  });

  it('M7: an unclosed load given a cost reddens the unclosed pin, naming it', async () => {
    const mutant = await loadMutant(
      "    if (load.interval !== '') lines.push(`load interval: ${load.interval}`);",
      "    lines.push(`load interval: ${load.interval === '' ? '0' : load.interval}`);",
    );
    const answer = answerOf(heldRecord());
    pinUnclosedLoadPrintsNoNumber(
      SURFACE.navigationPanel(answer),
      answer,
      'held',
    );
    const failure = reddens('unclosed-load-prints-no-number', () =>
      pinUnclosedLoadPrintsNoNumber(
        mutant.module.navigationPanel(answer),
        answer,
        'held',
      ),
    );
    assert.match(failure.message, /interval/);
    assert.ok(
      mutant.module.navigationPanel(answer).lines.includes('load interval: 0'),
      'the mutant really mints the cost the page never measured',
    );
  });
});
