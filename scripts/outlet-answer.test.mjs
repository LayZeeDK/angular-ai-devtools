// M062 T002 — answer from the outlet record, purely (INTENT.md SC1-SC3; T002 AC1-AC3;
// held-out E1-E4, E7, E8).
//
// What this suite measures. `extension/outlet-answer.js` joins the outlet record T001 writes
// into one answer of five fields. This file holds it to the criteria the join owns, and each
// criterion's pin is paired with a mutant that has to bite before it may redden — an assertion a
// broken answer would still pass is not evidence:
//
//   SC1  a record naming a second outlet answers `outlet-matched` with both names and the path.
//        The mutant renames the outlet in the record's own row, and the red names `requested`
//        and the two names that moved.
//   SC2  a record whose route carries no matched outlet name answers `cannot-tell` carrying the
//        record's reason, never a nearby name. Mutants: a DOM fallback that fills `matched`
//        from `document.querySelector`, and a name taken from a component.
//   SC3  the function reads no argument but the record. Its code is scanned for every page
//        surface, for a second record and for a component identity; it is loaded in `node:vm`
//        contexts whose host globals are throw-on-touch traps; and a second argument's record
//        is shown to move no field of the answer.
//
// The edges carry their own mutants: the primary normalisation dropped (E1), the last named
// outlet chosen (E2), a name taken from the template (E3), the chain-level absences dropped
// (E4), and a stated absence reported as a mismatch (E7). Each reddens the pin for its edge.
//
// The record fixtures are not this file's invention. Each is produced by the reducer T001 landed
// (`extension/outlet-state.js`) run over a router state shaped the way its own suite shapes them,
// so the record's shape and the join's input are the same three fields, asserted in one place.
// The only things this file adds to a record are the two a careless caller might: the `host` copy
// a message boundary makes, and — for E3 — the template's own outlet list beside it.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const MODULE_URL = new URL('../extension/outlet-answer.js', import.meta.url);
const SRC = readFileSync(MODULE_URL, 'utf8');
const RECORD_URL = new URL('../extension/outlet-state.js', import.meta.url);
const RECORD_SRC = readFileSync(RECORD_URL, 'utf8');

// The names the fixtures' route configurations and snapshots state, written once so a red names
// the value rather than a literal nobody can check.
const PRIMARY = 'primary';
const SIDEBAR = 'sidebar';
const CHAT = 'chat';
const ASIDE = 'aside';
const CONTRACT = 'contract';
const LIST = 'list';
const SETTINGS = 'settings';
const LOOP = 'loop';

// The component identity this tree's records do carry (`componentName: 'RouterOutlet'` in the
// demo panel record, C1): a name that is not an outlet name and must never answer as one.
const COMPONENT_NAME = 'RouterOutlet';

/** The five fields an answer carries, and the only fields it carries. */
const ANSWER_KEYS = ['absences', 'matched', 'path', 'requested', 'state'];

/** The four states, and the only states. */
const STATES = [
  'cannot-tell',
  'outlet-absent',
  'outlet-matched',
  'outlet-unnamed-primary',
];

/** The fields an absence can name: the record's own three, and the chain itself. */
const ABSENCE_FIELDS = ['matched', 'path', 'requested', 'route'];

/** The absence reasons the record states (T001's closed set). */
const RECORD_REASONS = [
  'chain-truncated',
  'no-route-chain',
  'outlet-name-absent',
  'outlet-name-empty',
  'outlet-not-requested',
  'path-absent',
  'route-config-absent',
];

/** The two holes the join can name in its own input, and no third. */
const JOIN_REASONS = ['no-outlet-record', 'no-route-row'];

/** The words a remedy, a cause or a schematic is written with — and an answer never is. */
const REMEDY =
  /\b(fix|fixed|fixes|remedy|remedies|schematic|schematics|cause|causes|because|should|must|migrate|upgrade|instead)\b/i;

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

/** Every string literal a module can answer with, comments already stripped by the caller. */
function literalsOf(source) {
  const found = [];
  const pattern = /'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g;
  let match = pattern.exec(source);
  while (match !== null) {
    found.push(match[0].slice(1, -1));
    match = pattern.exec(source);
  }
  return found;
}

/**
 * The module in a bare context, holding nothing the caller did not put there. No DOM, no clock,
 * no console are installed by `node:vm` beyond the two every JavaScript context has (`Date` and
 * `Intl`), which the guarded pins below handle.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const join = context.angularAiOutletAnswer;
  assert.equal(
    typeof join,
    'function',
    'the module must publish the join itself on globalThis.angularAiOutletAnswer',
  );
  return join;
}

/** A value from the vm context carries that context's own prototypes, so it is copied here. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** A value as a message may name it, without asking it to convert itself. */
function label(value) {
  const written = JSON.stringify(value);
  return written === undefined ? String(value) : written;
}

/**
 * The globals the join must never reach for. `document`, `window`, `performance`, the two timers,
 * `fetch` and `XMLHttpRequest` are absent from a `node:vm` context altogether; `Date`, `Intl` and
 * `console` are in every context there is, so only a trap can catch a module that used them.
 */
const HOST_GLOBALS = [
  'navigator',
  'window',
  'document',
  'performance',
  'Intl',
  'console',
  'Date',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/** A global that throws when it is read, called or constructed, naming itself in the error. */
function tripwire(name) {
  const reached = () => {
    throw new Error('the module reached for ' + name);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/** The armed-traps context, for the assertions that prove the guard is live. */
function armedContext() {
  const sandbox = {};
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  return createContext(sandbox);
}

/**
 * Runs the join *inside* a context where every one of `HOST_GLOBALS` is a trap, and returns the
 * answer it produced. The record is handed in through the sandbox, so nothing about the call
 * crosses from this realm except the data. Two calls are two contexts.
 */
function guarded(source, record, extra = {}) {
  const sandbox = { __record: record, ...extra };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const context = createContext(sandbox);
  runInContext(source, context);
  return plain(runInContext('angularAiOutletAnswer(__record)', context));
}

/** A copy of the module with one anchored substitution, refused unless the anchor is unique. */
function mutate(defect, anchor, replacement) {
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the ${defect} mutation anchor must appear once in extension/outlet-answer.js; it appears ${occurrences} time(s) — restate the mutant instead of deleting it`,
  );
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(
    mutated,
    SRC,
    `the ${defect} mutation must change the module`,
  );
  return mutated;
}

/** A pin that must redden on a mutant: returns the failure the pin raises on it. */
function reddens(pin, defect) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    '"' + defect + '" passed its pin, so the mutation is not caught',
  );
  return failure;
}

// ------------------------------------------------------------------ the records handed over --

/**
 * The record reducer T001 landed, loaded from its own file: the join's input is the record the
 * tree publishes, not a shape this suite restates.
 */
function recordReducer() {
  const context = createContext({});
  runInContext(RECORD_SRC, context);
  const namespace = context.angularAiOutletState;
  assert.equal(
    namespace && typeof namespace.outletState,
    'function',
    'extension/outlet-state.js must publish the outlet reducer this join reads',
  );
  return namespace.outletState;
}

const OUTLET_STATE = recordReducer();

/** A record as it crosses the boundary: plain values, the way the panel receives it. */
function recordOf(state) {
  return plain(OUTLET_STATE(state));
}

/**
 * One activated-route snapshot, in the fields Angular's own `ActivatedRouteSnapshot` carries: the
 * outlet name the router state matched, the route configuration it was activated from, and its
 * children — one per outlet the enclosing component's template declares, in declaration order.
 */
function activatedRoute(config, outlet, children) {
  const list = children ?? [];
  return {
    outlet: outlet,
    routeConfig: config,
    url: [],
    params: {},
    data: {},
    pathFromRoot: [],
    firstChild: list.length > 0 ? list[0] : null,
    children: list,
  };
}

/**
 * The router state this milestone's verification target produces: the app component's
 * componentless root, whose template declares two outlets the router filled — the primary chain
 * (`contract` -> `list`) and a second, named outlet `sidebar` beside it.
 */
function routerState() {
  return {
    state: {
      root: activatedRoute(null, PRIMARY, [
        activatedRoute({ path: CONTRACT }, PRIMARY, [
          activatedRoute({ path: LIST, outlet: PRIMARY }, PRIMARY, []),
        ]),
        activatedRoute({ path: SETTINGS, outlet: SIDEBAR }, SIDEBAR, []),
      ]),
    },
  };
}

/** SC1's record: the route that declares the second named outlet, as T001 reduces it. */
function secondOutletRecord() {
  return recordOf(routerState());
}

/**
 * The SC1 mutant as a review describes it: the outlet is renamed in the route configuration and
 * nowhere else, so the route asked for one name and the state matched another.
 */
function renamedRecord() {
  const state = routerState();
  const rows = state.state.root.children;
  rows[1].routeConfig.outlet = ASIDE;
  return recordOf(state);
}

/** SC2's record: the second outlet's snapshot carries no outlet name at all. */
function noMatchedRecord() {
  const state = routerState();
  delete state.state.root.children[1].outlet;
  return recordOf(state);
}

/** E1's record: one route that declares no outlet, which the state matched to primary. */
function singleRouteRecord() {
  return recordOf({ root: activatedRoute({ path: CONTRACT }, PRIMARY, []) });
}

/** E2's record: two named outlets declared one after the other on one route. */
function twoNamedOutletsRecord() {
  return recordOf({
    root: activatedRoute(null, PRIMARY, [
      activatedRoute({ path: CONTRACT }, PRIMARY, []),
      activatedRoute({ path: SETTINGS, outlet: SIDEBAR }, SIDEBAR, []),
      activatedRoute({ path: CHAT, outlet: CHAT }, CHAT, []),
    ]),
  });
}

/** E7's record: an outlet the route configuration requests and the state never reached. */
function neverReachedRecord() {
  return recordOf({
    root: activatedRoute(null, PRIMARY, [
      activatedRoute({ path: CONTRACT }, PRIMARY, []),
      activatedRoute({ path: CHAT, outlet: CHAT }, undefined, []),
    ]),
  });
}

/** E4's record: a chain the reducer truncated at its own bound. */
function truncatedRecord() {
  const node = activatedRoute({ path: LOOP }, PRIMARY, []);
  node.children = [node];
  node.firstChild = node;
  return recordOf(node);
}

/** The record the reducer answers for a value carrying no activated-route chain. */
function noChainRecord() {
  return recordOf({});
}

/**
 * E3's record: a route whose template declares a third outlet (`chat`) that no route
 * configuration requests. The reducer reads the router state, so the template's outlet is in no
 * field of the record — and the record is handed over with the template's own list beside it,
 * the way a caller could decorate it.
 */
function templateOutletRecord() {
  const record = singleRouteRecord();
  record.templateOutlets = [CHAT];
  return record;
}

/** The page a mutant is supposed to borrow a name from: one element, one outlet name on it. */
function renderedPage() {
  return {
    document: {
      querySelector: () => ({ getAttribute: () => SIDEBAR }),
    },
  };
}

/** Every string the record itself carries for the answered route, plus the one the join states. */
function namesTheRecordCarries(record) {
  const allowed = new Set([PRIMARY]);
  const routes = Array.isArray(record && record.routes) ? record.routes : [];
  for (const row of routes) {
    for (const key of ['requested', 'matched', 'path']) {
      if (typeof row[key] === 'string') allowed.add(row[key]);
    }
  }
  return allowed;
}

// --------------------------------------------------------------------------------- the pins --

/** The key pin: every answer carries exactly the five contract fields, in every state. */
function pinContractFields(join, pinLabel) {
  const table = [
    ['the record naming a second outlet', secondOutletRecord()],
    ['the record whose outlet was renamed', renamedRecord()],
    ['the record whose route carries no matched name', noMatchedRecord()],
    ['the record of one route that requests nothing', singleRouteRecord()],
    [
      'the record of two outlets declared one after the other',
      twoNamedOutletsRecord(),
    ],
    ['the record of an outlet the route never reached', neverReachedRecord()],
    ['the record of a truncated chain', truncatedRecord()],
    [
      'a record with an empty route list',
      { state: 'outlet-recorded', routes: [], absences: [] },
    ],
    ['the record that carries no route chain', noChainRecord()],
    ['no record at all', undefined],
    ['an empty record', {}],
  ];
  const seen = new Set();
  for (const [what, record] of table) {
    const answer = plain(join(record));
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      `${pinLabel}: every answer carries exactly the five contract fields and no sixth (${what})`,
    );
    assert.equal(
      STATES.includes(answer.state),
      true,
      `${pinLabel}: the state ${label(answer.state)} is not one of the four the contract names (${what})`,
    );
    seen.add(answer.state);
    for (const field of ['requested', 'matched', 'path']) {
      assert.ok(
        answer[field] === null ||
          (typeof answer[field] === 'string' && answer[field] !== ''),
        `${pinLabel}: ${field} is a name the record carried or null, never an empty stand-in (${what})`,
      );
    }
    assert.equal(
      Array.isArray(answer.absences),
      true,
      `${pinLabel}: the absences are a list in every state (${what})`,
    );
    for (const absence of answer.absences) {
      assert.deepEqual(
        Object.keys(absence).sort(),
        ['field', 'path', 'reason'],
        `${pinLabel}: an absence carries the record's own three fields (${what})`,
      );
      assert.equal(
        ABSENCE_FIELDS.includes(absence.field),
        true,
        `${pinLabel}: the absence names the field ${label(absence.field)}, which is not one the record names (${what})`,
      );
      assert.equal(
        RECORD_REASONS.includes(absence.reason) ||
          JOIN_REASONS.includes(absence.reason),
        true,
        `${pinLabel}: the reason ${label(absence.reason)} is neither one the record states nor a hole the join names in its own input (${what})`,
      );
    }
  }
  assert.deepEqual(
    [...seen].sort(),
    STATES,
    `${pinLabel}: the four states are the four the contract names, and this table reaches every one`,
  );
}

/** SC1's pin: the record naming a second outlet names both names and the route's path. */
function pinSecondOutlet(join, pinLabel) {
  const record = secondOutletRecord();

  // The record this join reads is the shape T001 publishes, and it names both outlets the root
  // declares — so the answer below is read from a record that carries the second name.
  assert.deepEqual(
    Object.keys(record).sort(),
    ['absences', 'routes', 'state'],
    `${pinLabel}: the record is the three-field record T001 publishes (state, routes, absences)`,
  );
  assert.deepEqual(
    record.routes.map((route) => route.matched),
    [PRIMARY, PRIMARY, PRIMARY, SIDEBAR],
    `${pinLabel}: the record names both outlets the root declares, in declaration order`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.state,
    'outlet-matched',
    `${pinLabel}: the route that asked for ${label(SIDEBAR)} was matched to it, so the answer is outlet-matched (${label(answer.state)})`,
  );
  assert.equal(
    answer.requested,
    SIDEBAR,
    `${pinLabel}: requested is the outlet the route configuration requested (${label(answer.requested)})`,
  );
  assert.equal(
    answer.matched,
    SIDEBAR,
    `${pinLabel}: matched is the outlet name the router state carried (${label(answer.matched)})`,
  );
  assert.equal(
    answer.path,
    SETTINGS,
    `${pinLabel}: path is the answered route's own configured path (${label(answer.path)})`,
  );
  assert.deepEqual(
    answer.absences,
    [],
    `${pinLabel}: nothing is absent for this route, so no absence is carried for it`,
  );
  assert.notEqual(
    answer.requested,
    PRIMARY,
    `${pinLabel}: the answer is about the second outlet, never folded back into the primary`,
  );
  return answer;
}

/** E1's pin: an absent request is reported as `primary`, and the record's reason is carried. */
function pinUnnamedPrimary(join, pinLabel) {
  const record = singleRouteRecord();
  assert.equal(
    record.routes[0].requested,
    null,
    `${pinLabel}: the record states no request for the route, which is the absence the join normalises`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.requested,
    PRIMARY,
    `${pinLabel}: an unnamed outlet is reported as ${label(PRIMARY)} — the name is not left null and no absence stands in for it (${label(answer.requested)})`,
  );
  assert.equal(
    answer.matched,
    PRIMARY,
    `${pinLabel}: the state matched the same outlet, so both names are the one outlet (${label(answer.matched)})`,
  );
  assert.equal(
    answer.state,
    'outlet-unnamed-primary',
    `${pinLabel}: the state says the name came from the normalisation the join states (${label(answer.state)})`,
  );
  assert.equal(
    answer.path,
    CONTRACT,
    `${pinLabel}: the path is the route's own (${label(answer.path)})`,
  );
  assert.deepEqual(
    answer.absences,
    [
      {
        field: 'requested',
        path: CONTRACT,
        reason: 'outlet-not-requested',
      },
    ],
    `${pinLabel}: the record's own reason for the absent request is carried unrelabelled, so the reader sees the configuration requested nothing`,
  );
  return answer;
}

/** E2's pin: two outlets declared one after the other name the first, never the last read. */
function pinFirstNamedOutlet(join, pinLabel) {
  const record = twoNamedOutletsRecord();
  assert.deepEqual(
    record.routes.map((route) => route.matched),
    [PRIMARY, PRIMARY, SIDEBAR, CHAT],
    `${pinLabel}: the record carries both named outlets, in declaration order`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.requested,
    SIDEBAR,
    `${pinLabel}: two outlets are declared one after the other, and the answer names the first in declaration order (${label(answer.requested)})`,
  );
  assert.equal(
    answer.matched,
    SIDEBAR,
    `${pinLabel}: the matched name is that same first outlet's (${label(answer.matched)})`,
  );
  assert.equal(
    answer.path,
    SETTINGS,
    `${pinLabel}: and the path is that route's own (${label(answer.path)})`,
  );
  assert.equal(
    answer.state,
    'outlet-matched',
    `${pinLabel}: the first named outlet was matched to its own name (${label(answer.state)})`,
  );
  assert.equal(
    JSON.stringify(answer).includes(CHAT),
    false,
    `${pinLabel}: the outlet declared last is never the one named, and does not appear beside it`,
  );
  return answer;
}

/** SC2's pin: a route the record carries no matched name for is `cannot-tell`, with the reason. */
function pinNoMatched(join, pinLabel) {
  const record = noMatchedRecord();
  assert.deepEqual(
    record.routes[3],
    { requested: SIDEBAR, matched: null, path: SETTINGS },
    `${pinLabel}: the record states no matched name for the second outlet, and names the absence`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.matched,
    null,
    `${pinLabel}: matched is null where the record carries no outlet name — no nearby outlet is borrowed for it (${label(answer.matched)})`,
  );
  assert.equal(
    answer.state,
    'cannot-tell',
    `${pinLabel}: a route the state names no outlet for is cannot-tell (${label(answer.state)})`,
  );
  assert.equal(
    answer.requested,
    SIDEBAR,
    `${pinLabel}: requested is still the configuration's own name (${label(answer.requested)})`,
  );
  assert.equal(
    answer.path,
    SETTINGS,
    `${pinLabel}: and the path is still the route's own (${label(answer.path)})`,
  );
  assert.deepEqual(
    answer.absences,
    [{ field: 'matched', path: SETTINGS, reason: 'outlet-name-absent' }],
    `${pinLabel}: the answer carries the reason the name is missing, as the record states it`,
  );
  assert.equal(
    JSON.stringify(answer).includes(PRIMARY),
    false,
    `${pinLabel}: nothing near the route — not the primary outlet it sits beside — is reported as its match`,
  );
  return answer;
}

/** E3's pin: a name only the template declares is an absence, never the answer's name. */
function pinTemplateNameIsAnAbsence(join, pinLabel) {
  const record = templateOutletRecord();
  const answer = plain(join(record));
  assert.equal(
    JSON.stringify(answer).includes(CHAT),
    false,
    `${pinLabel}: the outlet the template declares and the configuration never requests is in no field of the answer — it is absent from the record, and the answer says so rather than naming it (${label(answer)})`,
  );
  assert.deepEqual(
    answer.absences.filter((absence) => absence.field === 'requested'),
    [{ field: 'requested', path: CONTRACT, reason: 'outlet-not-requested' }],
    `${pinLabel}: it is reported as absent from the record, by the record's own reason, and never as the template's name`,
  );
  assert.equal(
    answer.requested,
    PRIMARY,
    `${pinLabel}: the configuration requests no outlet, so the join reports ${label(PRIMARY)} (${label(answer.requested)})`,
  );
  return answer;
}

/** E4's pin: the truncation the record states is reported, never completed from the page. */
function pinTruncated(join, pinLabel) {
  const record = truncatedRecord();
  assert.deepEqual(
    record.absences.slice(-1),
    [{ field: 'route', path: null, reason: 'chain-truncated' }],
    `${pinLabel}: the record states that its chain was truncated`,
  );

  const answer = plain(join(record));
  assert.deepEqual(
    answer.absences.filter((absence) => absence.reason === 'chain-truncated'),
    [{ field: 'route', path: null, reason: 'chain-truncated' }],
    `${pinLabel}: the truncation the record states is carried in the answer, so the outlet name it could not read is reported truncated — the answer's reasons are ${label([...new Set(answer.absences.map((absence) => absence.reason))])}`,
  );
  assert.equal(
    answer.absences.length,
    record.absences.length,
    `${pinLabel}: every absence the record states about the chain or about the answered route is carried, and none is dropped`,
  );
  assert.equal(
    answer.matched,
    PRIMARY,
    `${pinLabel}: the outlet the record did carry is named, and nothing is completed from the rendered tree (${label(answer.matched)})`,
  );
  assert.equal(
    answer.state,
    'outlet-unnamed-primary',
    `${pinLabel}: a chain whose rows request nothing is answered by the state's own name (${label(answer.state)})`,
  );
  assert.equal(
    answer.path,
    LOOP,
    `${pinLabel}: the path is the route's own (${label(answer.path)})`,
  );
  return answer;
}

/** E7's pin: an outlet the route never reached is `cannot-tell`, never a mismatch. */
function pinNeverReached(join, pinLabel) {
  const record = neverReachedRecord();
  assert.deepEqual(
    record.routes[2],
    { requested: CHAT, matched: null, path: CHAT },
    `${pinLabel}: the record carries an outlet the configuration requests and the state never matched`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.requested,
    CHAT,
    `${pinLabel}: requested is the outlet the configuration asked for (${label(answer.requested)})`,
  );
  assert.equal(
    answer.matched,
    null,
    `${pinLabel}: matched is null, because the record carries no name for it (${label(answer.matched)})`,
  );
  assert.notEqual(
    answer.state,
    'outlet-absent',
    `${pinLabel}: an outlet the route never reached is not a mismatch, and the answer never reports one (${label(answer.state)})`,
  );
  assert.equal(
    answer.state,
    'cannot-tell',
    `${pinLabel}: an outlet the record does not carry is cannot-tell (${label(answer.state)})`,
  );
  assert.deepEqual(
    answer.absences,
    [{ field: 'matched', path: CHAT, reason: 'outlet-name-absent' }],
    `${pinLabel}: with the record's own reason for the absent name`,
  );
  return answer;
}

/** SC3's pin: no field of an answer names an identity the record did not carry, or a remedy. */
function pinOnlyRecordIdentities(join, pinLabel) {
  const table = [
    ['the record naming a second outlet', secondOutletRecord()],
    ['the record whose outlet was renamed', renamedRecord()],
    ['the record whose route carries no matched name', noMatchedRecord()],
    ['the record of one route that requests nothing', singleRouteRecord()],
    ['the record of a truncated chain', truncatedRecord()],
    ['the record of an outlet the route never reached', neverReachedRecord()],
    ['the record that carries no route chain', noChainRecord()],
    ['no record at all', undefined],
  ];
  for (const [what, record] of table) {
    const answer = plain(join(record));
    assert.equal(
      REMEDY.test(JSON.stringify(answer)),
      false,
      `${pinLabel}: no answer names a remedy, a cause or a schematic (${what}): ${label(answer)}`,
    );
    const allowed = namesTheRecordCarries(record);
    for (const field of ['requested', 'matched', 'path']) {
      assert.ok(
        answer[field] === null || allowed.has(answer[field]),
        `${pinLabel}: ${field} is ${label(answer[field])}, which the record does not carry (${what})`,
      );
    }
    const stated = Array.isArray(record && record.absences)
      ? record.absences
      : [];
    for (const absence of answer.absences) {
      const carried = stated.some(
        (entry) =>
          entry.field === absence.field &&
          entry.path === absence.path &&
          entry.reason === absence.reason,
      );
      assert.ok(
        carried || JOIN_REASONS.includes(absence.reason),
        `${pinLabel}: the absence ${label(absence)} is neither one the record states nor a hole the join names in its own input (${what})`,
      );
    }
  }
}

/** AC3's pin: the module's code mentions no page surface and no second record. */
function pinNoPageSurface(source, pinLabel) {
  const body = code(source);
  for (const [what, pattern] of [
    ['document read', /\bdocument\b/],
    ['window read', /\bwindow\b/],
    ['navigator read', /\bnavigator\b/],
    ['console call', /\bconsole\b/],
    ['clock read', /\b(Date|performance|setTimeout|setInterval)\b/],
    [
      'DOM query',
      /\b(querySelector|querySelectorAll|getElementById|getElementsByClassName|createElement|getComputedStyle|getAttribute|closest)\b/,
    ],
    [
      'read of the rendered tree',
      /\b(textContent|innerText|outerText|innerHTML|nodeValue|dataset)\b/,
    ],
    ['element handle', /\belements?\b|\bElements?\b/],
    ['inspector read', /\b(ng|getOwningComponent|__ngContext__)\b/],
    ['network call', /\b(fetch|XMLHttpRequest)\b/],
    ['browser store', /\b(localStorage|sessionStorage|chrome)\b/],
    ['module load', /\b(require|import|readFileSync)\b/],
    ['second argument', /\barguments\b/],
  ]) {
    const found = body.match(pattern);
    assert.equal(
      found,
      null,
      `${pinLabel}: outlet-answer.js names a ${what} (${found && label(found[0])}), which is a surface the answer must not read`,
    );
  }
  const signature = body.match(/function outletAnswer\(([^)]*)\)/);
  assert.ok(
    signature !== null,
    `${pinLabel}: the join is declared as the named function outletAnswer`,
  );
  assert.equal(
    signature[1].trim(),
    'record',
    `${pinLabel}: the join takes one argument — the record — and no second one (${label(signature[1])})`,
  );
  assert.deepEqual(
    body.match(/angularAi\w*/g),
    ['angularAiOutletAnswer'],
    `${pinLabel}: the module publishes one global of its own and names no other module's`,
  );
}

/** N1's pin: the module names no component identity, so no name can come from one. */
function pinNoComponentIdentity(source, pinLabel) {
  const body = code(source);
  for (const [what, pattern] of [
    ['component-name field', /\bcomponentName\b/],
    ['outlet component', /\bRouterOutlet\b|\bngComponentOutlet\b/],
    [
      'template declaration',
      /\btemplateOutlets\b|\btemplateUrl\b|\bselector\b/,
    ],
  ]) {
    const found = body.match(pattern);
    assert.equal(
      found,
      null,
      `${pinLabel}: outlet-answer.js names a ${what} (${found && label(found[0])}), so a name could be taken from a component rather than from the record`,
    );
  }
}

/** E8's pin, over the strings the module can answer with: none of them names a remedy. */
function pinNoRemedyInLiterals(source, pinLabel) {
  const literals = literalsOf(code(source));
  assert.ok(
    literals.length > 0,
    `${pinLabel}: the scan must find the module's own string literals, or it reads nothing`,
  );
  for (const literal of literals) {
    assert.equal(
      REMEDY.test(literal),
      false,
      `${pinLabel}: a string the module can answer with names a remedy, a cause or a schematic: ${label(literal)}`,
    );
  }
}

/**
 * SC3's purity pin, over one module source: two `node:vm` contexts whose host globals are
 * throw-on-touch traps answer identically, and identically to the bare realm — so the join reads
 * nothing the traps hide, and a module that reached for one of them cannot answer here.
 */
function pinGuardedAnswer(source, pinLabel, record = secondOutletRecord()) {
  const first = guarded(source, record);
  const second = guarded(source, record);
  assert.deepEqual(
    second,
    first,
    `${pinLabel}: two node:vm contexts with throw-on-touch globals answer identically`,
  );
  assert.deepEqual(
    first,
    plain(standalone(source)(record)),
    `${pinLabel}: the guarded answer is the bare realm's answer, so nothing the traps hide was read`,
  );
  return first;
}

// ------------------------------------------------------------------------------ the purity --

describe('outlet-answer.js is pure', () => {
  it('evaluates in a bare context and publishes the join itself, and nothing else of its own', () => {
    const context = createContext({});
    runInContext(SRC, context);
    assert.equal(
      typeof context.angularAiOutletAnswer,
      'function',
      'the module publishes the join on the global object of whatever world it runs in',
    );
    assert.equal(
      context.angularAiOutletAnswer.length,
      1,
      'the join takes the one record it reads',
    );
    assert.deepEqual(
      Object.getOwnPropertyNames(context).filter((name) =>
        /^angularAi/.test(name),
      ),
      ['angularAiOutletAnswer'],
      'the module publishes the join and nothing else of its own',
    );
  });

  it('SC3 — two node:vm contexts with throw-on-touch globals produce deep-equal answers', () => {
    // The traps are armed, and proven armed before anything is asserted through them: a guard
    // that did not throw would make every guarded pin pass on any module.
    const armed = armedContext();
    for (const name of [
      'navigator',
      'window',
      'document',
      'performance',
      'Intl',
      'console',
    ]) {
      assert.throws(
        () => runInContext(`${name}.toString()`, armed),
        new RegExp('reached for ' + name),
        `the ${name} trap must bite, or the guard is decoration`,
      );
    }
    assert.throws(
      () => runInContext('Date.now()', armed),
      /reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );

    pinGuardedAnswer(SRC, 'the shipped module');
    for (const [what, record] of [
      ['the record whose route carries no matched name', noMatchedRecord()],
      ['the record of a truncated chain', truncatedRecord()],
      ['the record that carries no route chain', noChainRecord()],
      ['no record at all', undefined],
    ]) {
      assert.deepEqual(
        guarded(SRC, record),
        plain(standalone()(record)),
        `the two realms answer ${what} identically`,
      );
    }
    assert.deepEqual(
      guarded(SRC, secondOutletRecord()),
      pinSecondOutlet(standalone(), 'the guarded pin'),
      'the answer the traps allow is the answer SC1 pins',
    );
  });

  it('SC3 — the module mentions no DOM API, no second record and no component identity', () => {
    pinNoPageSurface(SRC, 'the shipped module');
    pinNoComponentIdentity(SRC, 'the shipped module');
    pinNoRemedyInLiterals(SRC, 'the shipped module');
  });

  it('SC3 — the answer is the same when a second record is handed in beside the first', () => {
    const join = standalone();
    const record = secondOutletRecord();
    const other = renamedRecord();
    assert.notDeepEqual(
      plain(join(other)),
      plain(join(record)),
      'the second record must be one that would move the answer if it were read',
    );
    assert.deepEqual(
      plain(join(record, other)),
      plain(join(record)),
      'the join reads one argument — the record — and a second one moves no field of the answer',
    );
    assert.deepEqual(
      plain(join(record, null, other)),
      plain(join(record)),
      'nor does a third',
    );
  });

  it('answers the same record twice with the same value and mutates nothing it was handed', () => {
    const join = standalone();
    const record = noMatchedRecord();
    const before = JSON.stringify(record);
    const first = join(record);
    const second = join(record);
    assert.deepEqual(plain(second), plain(first));
    assert.notEqual(first, second, 'each call answers a fresh object');
    assert.notEqual(
      first.absences,
      second.absences,
      'each call answers a fresh absences list, so no caller can edit the next answer',
    );
    assert.equal(
      JSON.stringify(record),
      before,
      'the join mutates nothing in the record it was handed',
    );
  });

  it('throws on no input', () => {
    const join = standalone();
    const throwing = new Proxy(
      {},
      {
        get() {
          throw new Error('no read');
        },
        has() {
          throw new Error('no has');
        },
        getOwnPropertyDescriptor() {
          return { configurable: true, enumerable: true, value: undefined };
        },
      },
    );
    const throwingList = new Proxy([{ requested: SIDEBAR }], {
      get(target, key) {
        if (key === 'length') throw new Error('no length');
        return Reflect.get(target, key);
      },
    });
    const rowless = 'a value carrying no route row';
    const inputs = [
      ['undefined', undefined, null],
      ['null', null, null],
      ['zero', 0, null],
      ['a number', 42, null],
      ['NaN', NaN, null],
      ['an empty string', '', null],
      ['a name', SIDEBAR, null],
      ['a boolean', true, null],
      ['a function', () => {}, null],
      ['an array of nothing', [null, undefined, 0, 'x'], null],
      ['a record of nothing', Object.create(null), null],
      ['a frozen record', Object.freeze({}), null],
      ['a date', new Date(0), null],
      ['a record whose every read throws', throwing, null],
      [
        'a record whose routes getter throws',
        {
          get routes() {
            throw new Error('no routes');
          },
        },
        null,
      ],
      [
        'a record whose row list throws on length',
        { routes: throwingList },
        null,
        'no-route-row',
      ],
      [
        'a record with an empty route list',
        { state: 'outlet-recorded', routes: [], absences: [] },
        null,
        'no-route-row',
      ],
      [
        'a record whose row getter throws',
        {
          routes: [
            {
              get requested() {
                throw new Error('no requested field');
              },
            },
          ],
        },
        // The row is there and its request reads as an absent field, so the join reports the
        // one normalisation it states; the name the getter hides is not guessed.
        {
          state: 'cannot-tell',
          requested: PRIMARY,
          matched: null,
          path: null,
        },
      ],
      [
        'a record whose absences getter throws',
        {
          routes: [{ requested: SIDEBAR, matched: SIDEBAR, path: SETTINGS }],
          get absences() {
            throw new Error('no absences');
          },
        },
        // The route row is readable and both names agree, so the answer stands; only the
        // statements about absences are unreadable, and none is invented for them.
        {
          state: 'outlet-matched',
          requested: SIDEBAR,
          matched: SIDEBAR,
          path: SETTINGS,
        },
      ],
    ];
    for (const [what, input, expected, rowlessReason] of inputs) {
      let answer = null;
      assert.doesNotThrow(() => {
        answer = plain(join(input));
      }, `the join throws on ${what}, and the contract says it throws on no input`);
      assert.deepEqual(
        Object.keys(answer).sort(),
        ANSWER_KEYS,
        `even ${what} answers exactly the five contract fields`,
      );
      assert.equal(
        STATES.includes(answer.state),
        true,
        `even ${what} answers one of the four states`,
      );
      assert.deepEqual(
        {
          state: answer.state,
          requested: answer.requested,
          matched: answer.matched,
          path: answer.path,
        },
        expected ?? {
          state: 'cannot-tell',
          requested: null,
          matched: null,
          path: null,
        },
        `the join answers what it could read and nothing beside it (${what}): ${label(answer)}`,
      );
      if (expected === null) {
        assert.deepEqual(
          answer.absences,
          [
            {
              field: 'route',
              path: null,
              reason: rowlessReason ?? 'no-outlet-record',
            },
          ],
          `${rowless} is named by the join's own token, and no outlet is named (${what})`,
        );
      }
    }
  });
});

// ----------------------------------------------------------- the shipped join and the record --

describe('the shipped join answers the outlet record', () => {
  it('carries exactly the five contract fields in every state, and reaches all four', () => {
    pinContractFields(standalone(), 'the shipped module');
  });

  it('SC1 — a record naming a second outlet names both names and the path', () => {
    pinSecondOutlet(standalone(), 'the shipped module');
  });

  it('E1 — a route that declares no outlet asks for primary, and the answer says primary', () => {
    pinUnnamedPrimary(standalone(), 'the shipped module');
  });

  it('E2 — two outlets named one after the other: the first is named, never the last', () => {
    pinFirstNamedOutlet(standalone(), 'the shipped module');
  });

  it('SC2 — a record whose route carries no matched name is cannot-tell, with the reason', () => {
    pinNoMatched(standalone(), 'the shipped module');
  });

  it('E3 — an outlet only the template names is an absence, never the answer name', () => {
    pinTemplateNameIsAnAbsence(standalone(), 'the shipped module');
  });

  it('E4 — the name the record truncates is reported truncated, never completed', () => {
    pinTruncated(standalone(), 'the shipped module');
  });

  it('E7 — an outlet the route never reached is cannot-tell, never a mismatch', () => {
    pinNeverReached(standalone(), 'the shipped module');
  });

  it('SC3 — the answer names no identity the record did not carry, and no remedy', () => {
    pinOnlyRecordIdentities(standalone(), 'the shipped module');
  });
});

// --------------------------------------------------------------------------------- mutants --

describe('mutants redden by name', () => {
  it('M1 — a DOM fallback filling `matched` reddens the absence pin and the page-surface scan', (t) => {
    pinNoMatched(standalone(), 'the unmutated module');

    const mutated = mutate(
      'the DOM fallback filling matched',
      `  function rowOf(routes, index) {
    const row = fieldOf(routes, index);
    if (row === null || typeof row !== 'object') return null;
    return {
      requested: nameOf(fieldOf(row, 'requested')),
      matched: nameOf(fieldOf(row, 'matched')),
      path: pathOf(fieldOf(row, 'path')),
    };
  }`,
      `  function rowOf(routes, index) {
    const row = fieldOf(routes, index);
    if (row === null || typeof row !== 'object') return null;
    const rendered = document.querySelector('[data-outlet]');
    const matched =
      nameOf(fieldOf(row, 'matched')) ||
      nameOf(rendered && rendered.getAttribute('name'));
    return {
      requested: nameOf(fieldOf(row, 'requested')),
      matched: matched,
      path: pathOf(fieldOf(row, 'path')),
    };
  }`,
    );
    const join = standalone(mutated, renderedPage());
    const answered = plain(join(noMatchedRecord()));
    assert.equal(
      answered.matched,
      SIDEBAR,
      'the mutant fills the absent matched name from the rendered tree — the bite',
    );
    assert.equal(
      answered.state,
      'outlet-matched',
      'and answers a match the record never carried',
    );

    const failure = reddens(
      () => pinNoMatched(join, 'the mutant module'),
      'the DOM fallback filling matched',
    );
    assert.match(
      failure.message,
      /no nearby outlet is borrowed/,
      'the DOM mutant must redden the absence pin by name: ' + failure.message,
    );
    t.diagnostic('SC2 DOM mutant red: ' + failure.message.split('\n')[0]);

    const scanned = reddens(
      () => pinNoPageSurface(mutated, 'the mutant module'),
      'the DOM fallback filling matched',
    );
    assert.match(scanned.message, /document/);
    t.diagnostic('AC3 scan red: ' + scanned.message.split('\n')[0]);

    const guardedFailure = reddens(
      () => pinGuardedAnswer(mutated, 'the mutant module', noMatchedRecord()),
      'the DOM fallback filling matched',
    );
    assert.match(
      guardedFailure.message,
      /reached for document/,
      'the purity pin must redden on the DOM mutant by name: ' +
        guardedFailure.message,
    );
    t.diagnostic('AC3 purity red: ' + guardedFailure.message.split('\n')[0]);
  });

  it('M2 — a remedy string added to the answer reddens the five-field pin and the literal scan', (t) => {
    pinContractFields(standalone(), 'the unmutated module');

    const mutated = mutate(
      'the remedy string',
      `      path: path,
      absences: absences,
    };`,
      `      path: path,
      absences: absences,
      remedy:
        'declare the outlet in the route table, so the state matches it instead',
    };`,
    );
    const join = standalone(mutated);
    const answered = plain(join(secondOutletRecord()));
    assert.deepEqual(
      Object.keys(answered).sort(),
      [...ANSWER_KEYS, 'remedy'].sort(),
      'the mutant answers a sixth field the contract does not carry — the bite',
    );
    assert.match(
      answered.remedy,
      REMEDY,
      'and that field names a remedy the record does not state',
    );

    const failure = reddens(
      () => pinContractFields(join, 'the mutant module'),
      'the remedy string',
    );
    assert.match(
      failure.message,
      /five contract fields/,
      'the remedy mutant must redden the five-field pin by name: ' +
        failure.message,
    );
    t.diagnostic('E8 mutant red: ' + failure.message.split('\n')[0]);

    const literals = reddens(
      () => pinNoRemedyInLiterals(mutated, 'the mutant module'),
      'the remedy string',
    );
    assert.match(literals.message, /names a remedy/);
    t.diagnostic('E8 literal scan red: ' + literals.message.split('\n')[0]);
  });

  it('M3 — a name taken from a component reddens the absence pin and the component scan', (t) => {
    pinNoMatched(standalone(), 'the unmutated module');

    const mutated = mutate(
      'the component name',
      `      matched: nameOf(fieldOf(row, 'matched')),`,
      `      matched: nameOf(
        fieldOf(row, 'matched') ||
          fieldOf(row, 'componentName') ||
          'RouterOutlet',
      ),`,
    );
    const join = standalone(mutated);
    const answered = plain(join(noMatchedRecord()));
    assert.equal(
      answered.matched,
      COMPONENT_NAME,
      'the mutant names the component that renders the outlet where the record carries no outlet name — the bite',
    );

    const failure = reddens(
      () => pinNoMatched(join, 'the mutant module'),
      'the component name',
    );
    assert.match(
      failure.message,
      /no nearby outlet is borrowed/,
      'the component-name mutant must redden the absence pin by name: ' +
        failure.message,
    );
    t.diagnostic('N1 mutant red: ' + failure.message.split('\n')[0]);

    const scanned = reddens(
      () => pinNoComponentIdentity(mutated, 'the mutant module'),
      'the component name',
    );
    assert.match(
      scanned.message,
      /RouterOutlet|componentName/,
      'the component scan must name what it found: ' + scanned.message,
    );
    t.diagnostic('N1 scan red: ' + scanned.message.split('\n')[0]);
  });

  it('M4 — the outlet renamed in the record reddens the pin, naming `requested`', (t) => {
    pinSecondOutlet(standalone(), 'the unmutated module');

    const answered = plain(standalone()(renamedRecord()));
    // The two sources moved apart: only the record's requested name moved.
    assert.equal(
      answered.matched,
      SIDEBAR,
      'the state still matched "sidebar" after the configuration was renamed',
    );
    assert.equal(
      answered.requested,
      ASIDE,
      'the renamed configuration now requests "aside" — the mutant bites',
    );

    const failure = reddens(
      () =>
        assert.equal(
          answered.requested,
          SIDEBAR,
          `requested moved: the answer names requested ${label(answered.requested)} where the route configuration of ${label(SETTINGS)} requests ${label(SIDEBAR)} — the name is the record's, never a rename of the join's`,
        ),
      'the outlet renamed in the record',
    );
    assert.match(failure.message, /requested moved/);
    assert.match(failure.message, /"aside"/);
    assert.match(failure.message, /"sidebar"/);
    t.diagnostic('SC1 mutant red: ' + failure.message.split('\n')[0]);
  });

  it('M5 — the primary normalisation dropped reddens the unnamed-primary pin', (t) => {
    pinUnnamedPrimary(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'the primary normalisation dropped',
        '    const requested = requestedAbsent ? PRIMARY : row.requested;',
        '    const requested = row.requested;',
      ),
    );
    const answered = plain(join(singleRouteRecord()));
    assert.equal(
      answered.requested,
      null,
      'the mutant leaves the absent request absent, which is the bite',
    );

    const failure = reddens(
      () => pinUnnamedPrimary(join, 'the mutant module'),
      'the primary normalisation dropped',
    );
    assert.match(
      failure.message,
      /reported as "primary"/,
      'the normalisation mutant must redden the primary pin by name: ' +
        failure.message,
    );
    t.diagnostic('E1 mutant red: ' + failure.message.split('\n')[0]);
  });

  it('M6 — the last named outlet chosen reddens the declaration-order pin', (t) => {
    pinFirstNamedOutlet(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'the last named outlet chosen',
        `  function answeredRowOf(routes) {
    const count = lengthOf(routes);
    let first = null;
    for (let i = 0; i < count; i += 1) {
      const row = rowOf(routes, i);
      if (row === null) continue;
      if (first === null) first = row;
      if (namesAnotherOutlet(row)) return row;
    }
    return first;
  }`,
        `  function answeredRowOf(routes) {
    const count = lengthOf(routes);
    let first = null;
    let chosen = null;
    for (let i = 0; i < count; i += 1) {
      const row = rowOf(routes, i);
      if (row === null) continue;
      if (first === null) first = row;
      if (namesAnotherOutlet(row)) chosen = row;
    }
    return chosen === null ? first : chosen;
  }`,
      ),
    );
    const answered = plain(join(twoNamedOutletsRecord()));
    assert.equal(
      answered.requested,
      CHAT,
      'the mutant answers the outlet declared last, which is the bite',
    );

    const failure = reddens(
      () => pinFirstNamedOutlet(join, 'the mutant module'),
      'the last named outlet chosen',
    );
    assert.match(
      failure.message,
      /declaration order/,
      'the ordering mutant must redden the declaration-order pin by name: ' +
        failure.message,
    );
    t.diagnostic('E2 mutant red: ' + failure.message.split('\n')[0]);
  });

  it('M7 — the chain-level absences dropped reddens the truncation pin', (t) => {
    pinTruncated(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'the chain-level absences dropped',
        '      if (statedPath !== path && field !== ROUTE) continue;',
        '      if (statedPath !== path) continue;',
      ),
    );
    const answered = plain(join(truncatedRecord()));
    assert.deepEqual(
      answered.absences.filter(
        (absence) => absence.reason === 'chain-truncated',
      ),
      [],
      'the mutant drops the truncation the record states — the bite',
    );

    const failure = reddens(
      () => pinTruncated(join, 'the mutant module'),
      'the chain-level absences dropped',
    );
    assert.match(
      failure.message,
      /reported truncated/,
      'the truncation mutant must redden the truncation pin by name: ' +
        failure.message,
    );
    t.diagnostic('E4 mutant red: ' + failure.message.split('\n')[0]);
  });

  it('M8 — a stated absence reported as a mismatch reddens the not-a-mismatch pin', (t) => {
    pinNeverReached(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'a stated absence reported as a mismatch',
        `    let state;
    if (row.matched === null) {
      state = CANNOT_TELL;
    } else if (requested !== row.matched) {`,
        `    let state;
    if (row.matched === null && requestedAbsent) {
      state = CANNOT_TELL;
    } else if (requested !== row.matched) {`,
      ),
    );
    const answered = plain(join(neverReachedRecord()));
    assert.equal(
      answered.state,
      'outlet-absent',
      'the mutant reports the outlet the route never reached as a mismatch — the bite',
    );

    const failure = reddens(
      () => pinNeverReached(join, 'the mutant module'),
      'a stated absence reported as a mismatch',
    );
    assert.match(
      failure.message,
      /not a mismatch/,
      'the mismatch mutant must redden the not-a-mismatch pin by name: ' +
        failure.message,
    );
    t.diagnostic('E7 mutant red: ' + failure.message.split('\n')[0]);
  });

  it('M9 — a name taken from the template reddens the template-absence pin', (t) => {
    pinTemplateNameIsAnAbsence(standalone(), 'the unmutated module');

    const join = standalone(
      mutate(
        'the template outlet name',
        '    const requested = requestedAbsent ? PRIMARY : row.requested;',
        `    const declared = fieldOf(record, 'templateOutlets');
    const requested = requestedAbsent
      ? nameOf(fieldOf(declared, 0)) || PRIMARY
      : row.requested;`,
      ),
    );
    const answered = plain(join(templateOutletRecord()));
    assert.equal(
      answered.requested,
      CHAT,
      'the mutant names the outlet the template declares where the configuration requested none — the bite',
    );

    const failure = reddens(
      () => pinTemplateNameIsAnAbsence(join, 'the mutant module'),
      'the template outlet name',
    );
    assert.match(
      failure.message,
      /template/,
      'the template-name mutant must redden the template pin by name: ' +
        failure.message,
    );
    t.diagnostic('E3 mutant red: ' + failure.message.split('\n')[0]);
  });
});
