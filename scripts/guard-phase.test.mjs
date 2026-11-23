// M063 T001 — the record the milestone joins against: one row per guard verdict, in arrival order,
// with the phase the guard ran in (INTENT.md SC1-SC3; T001 AC1-AC3; C1-C3).
//
// What this suite measures. `extension/guard-phase.js` reduces the ordered guard observations a
// navigation carried into rows of `{ phase, guard, verdict, path }` and names every field it could not
// read. Each criterion's pin is paired with a mutant that has to bite before it may redden — an
// assertion a broken record would still pass is not evidence:
//
//   SC1  a cancelled navigation whose guard ran names the guard, the phase it ran in and the verdict
//        that cancelled; a mutant record whose cancel arrived before the guard's phase was observed
//        reddens it, and the red names the phase field. The arrival order is pinned twice: a record
//        handed in with two arrivals swapped, and the shipped module with its push made an unshift.
//   SC2  a row whose guard the navigation does not name keeps `guard: null` with an absence, and the
//        answer carries no name the page logged beside it. A mutant that fills the gap from the
//        record's logged-line list reddens both the absence pin and the page-surface scan.
//   SC3  the record is the only source of a guard phase: no other module under `extension/` produces
//        one, a planted second reader reddens that scan by name, and the record's row fields and the
//        reducer's inputs are one exported list. The module is also proved pure — a bare `node:vm`
//        context runs it, every host global a trap answers identically, it throws on no input, and it
//        answers the same value twice without touching what it was handed.
//
// The record's absence for a navigation that carried no observation is the narrator's own token, read
// from the narrator's own module rather than retyped here: a record with no verdicts must still produce
// the state `extension/navigation-narrator.js` already answers with.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const MODULE_URL = new URL('../extension/guard-phase.js', import.meta.url);
const SRC = readFileSync(MODULE_URL, 'utf8');
const NARRATOR_SRC = readFileSync(
  new URL('../extension/navigation-narrator.js', import.meta.url),
  'utf8',
);
const EXTENSION_DIR = fileURLToPath(new URL('../extension/', import.meta.url));

/** The record module's own base name, which the source scan excludes once and names once. */
const OWN_MODULE = 'guard-phase.js';

/** The second reader SC3's mutant plants: the same namespace, one more place a phase comes from. */
const SECOND_READER_FILE = 'guard-mirror.js';
const SECOND_READER = `(function () {
  'use strict';
  var PHASES = ['canMatch', 'canActivate', 'canDeactivate', 'resolve'];
  function rowsFor(navigation) {
    return PHASES.map(function (phase) {
      return { phase: phase, guard: null, verdict: 'allowed', path: null };
    });
  }
  globalThis.angularAiSecondGuardPhase = { rowsFor: rowsFor };
})();
`;

/** The three fields an answer carries, and the only fields it carries. */
const ANSWER_KEYS = ['absences', 'rows', 'state'];

/** The three fields an absence carries. */
const ABSENCE_KEYS = ['field', 'path', 'reason'];

/** The guard that cancelled the measured navigation, and the route it was cancelled on. */
const GUARD = 'RequireSession';
const PATH = 'contract';
const OTHER_PATH = 'invoice';

/** The narrator's record-level absence, read from the narrator rather than retyped. */
function narratorGuardAbsence() {
  const context = createContext({});
  runInContext(NARRATOR_SRC, context);
  const narrator = context.angularAiNavigationNarrator;
  assert.equal(
    typeof narrator,
    'object',
    'extension/navigation-narrator.js must publish the namespace this record’s absence token is held to',
  );
  return narrator.GUARD_VERDICT_NOT_RECORDED;
}

const NARRATOR_ABSENCE = narratorGuardAbsence();

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

/** A value from the vm context carries that context's prototypes, so it is copied here. */
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

/** A value as a message may name it, without asking it to convert itself. */
function label(value) {
  const written = JSON.stringify(value);
  return written === undefined ? String(value) : written;
}

/**
 * The module in a bare context, holding nothing the caller did not put there, answering its namespace.
 * No DOM, no clock and no logged line are installed by `node:vm` beyond the two every JavaScript
 * context has (`Date` and `Intl`), which the guarded pins below handle.
 */
function namespaceOf(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const namespace = context.angularAiGuardPhase;
  assert.equal(
    typeof namespace,
    'object',
    'the module must publish its namespace on globalThis.angularAiGuardPhase',
  );
  assert.equal(
    typeof namespace.guardPhase,
    'function',
    'the namespace must publish the reducer itself as guardPhase',
  );
  return namespace;
}

/** The shipped reducer, loaded once, so a pin and its mutant call the same function shape. */
const SHIPPED = namespaceOf();
const SHIPPED_REDUCER = SHIPPED.guardPhase;

/**
 * The globals the record must never reach for. `document`, `window`, `navigation`, `performance`, the
 * two timers, `fetch` and `XMLHttpRequest` are absent from a `node:vm` context altogether; `Date`,
 * `Intl` and `console` are in every context there is, so only a trap can catch a module that used them.
 */
const HOST_GLOBALS = [
  'navigator',
  'navigation',
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
 * Runs the reducer *inside* a context where every one of `HOST_GLOBALS` is a trap, and returns the
 * answer it produced. The observations are handed in through the sandbox, so nothing about the call
 * crosses from this realm except the data. Two calls are two contexts.
 */
function guarded(source, observations, extra = {}) {
  const sandbox = { __observations: observations, ...extra };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const context = createContext(sandbox);
  runInContext(source, context);
  return plain(
    runInContext('angularAiGuardPhase.guardPhase(__observations)', context),
  );
}

/** A copy of the module with one anchored substitution, refused unless the anchor is unique. */
function mutate(defect, anchor, replacement) {
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the ${defect} mutation anchor must appear once in extension/guard-phase.js; it appears ${occurrences} time(s) — restate the mutant instead of deleting it`,
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

/** The authored modules under a directory: no suite, no built output, in a stable order. */
function authoredModules(directory) {
  return readdirSync(directory)
    .filter((name) => name.endsWith('.js') && !/\.(test|spec)\.js$/.test(name))
    .sort((left, right) => left.localeCompare(right, 'en'));
}

/** Every module of a directory with its text, so a mutant can add one without touching the disk. */
function modulesOf(directory) {
  return authoredModules(directory).map((name) => ({
    name: name,
    text: readFileSync(join(directory, name), 'utf8'),
  }));
}

// ------------------------------------------------------------------------ the observations --

/**
 * The measured navigation of SC1: one guard, in `canActivate`, whose own verdict cancelled the
 * navigation after its side effect. This is the shape the record exists for.
 */
function cancelledNavigation() {
  return [
    { phase: 'canActivate', guard: GUARD, verdict: 'refused', path: PATH },
  ];
}

/**
 * SC1's mutant: the same cancel, recorded before the guard's phase was observed. The navigation was
 * cancelled and the guard's phase is absent, so no row can name where it ran.
 */
function cancelledBeforeTheGuardRan() {
  return [{ verdict: 'refused', path: PATH }];
}

/**
 * SC1's arrival-order navigation: three verdicts, three phases, arriving `canMatch`, then
 * `canActivate`, then `resolve`. `canMatch` runs before the route is known, so its row names no guard
 * and no path — a real state, not a gap (C2, E2).
 */
function arrivalOrder() {
  return [
    { phase: 'canMatch', verdict: 'allowed' },
    { phase: 'canActivate', guard: GUARD, verdict: 'refused', path: PATH },
    {
      phase: 'resolve',
      guard: 'InvoiceResolver',
      verdict: 'allowed',
      path: OTHER_PATH,
    },
  ];
}

/** SC2's navigation: a `canMatch` verdict, no guard named, and a logged line beside it. */
function phaseOnlyNavigation() {
  return {
    guardObservations: [{ phase: 'canMatch', verdict: 'allowed', path: null }],
    consoleEntries: [GUARD],
  };
}

/** The narrator's own record: a navigation the agent observed and no guard verdict at all. */
const NO_VERDICT_RECORDS = [
  ['no record at all', undefined],
  ['a record carrying no observation list', {}],
  ['a record carrying an empty list', { guardObservations: [] }],
  ['an empty list handed in directly', []],
  ['a list of nothing', [null, undefined, 0, 'x']],
];

// --------------------------------------------------------------------------------- the pins --

/** The key pin: every answer carries exactly the three contract fields, in every state. */
function pinContractFields(guardPhase, pinLabel) {
  const table = [
    ['the cancelled navigation', cancelledNavigation()],
    [
      'the navigation cancelled before its guard ran',
      cancelledBeforeTheGuardRan(),
    ],
    ['the three-phase arrival order', arrivalOrder()],
    ['the phase-only navigation', phaseOnlyNavigation()],
    [
      'a row carrying a field the record does not name',
      [
        {
          phase: 'canActivate',
          guard: GUARD,
          verdict: 'refused',
          path: PATH,
          severity: 'high',
        },
      ],
    ],
    ...NO_VERDICT_RECORDS,
    ['a value whose every read throws', throwingRecord()],
  ];
  const seen = new Set();
  const fieldNames = SHIPPED.ROW_FIELDS;
  for (const [what, observations] of table) {
    const answer = plain(guardPhase(observations));
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_KEYS,
      `${pinLabel}: every answer carries exactly the three contract fields and no fourth (${what})`,
    );
    assert.equal(
      SHIPPED.STATES.includes(answer.state),
      true,
      `${pinLabel}: the state ${label(answer.state)} is not one of the four the record names (${what})`,
    );
    seen.add(answer.state);
    assert.equal(
      Array.isArray(answer.rows),
      true,
      `${pinLabel}: the rows are a list in every state (${what})`,
    );
    for (const row of answer.rows) {
      assert.deepEqual(
        Object.keys(row).sort(),
        [...fieldNames].sort(),
        `${pinLabel}: every row carries exactly the four fields the reducer reads, and no fifth (${what})`,
      );
      assert.equal(
        row.phase === null || SHIPPED.PHASES.includes(row.phase),
        true,
        `${pinLabel}: the row's phase ${label(row.phase)} is one of the four phase words or null (${what})`,
      );
      assert.equal(
        row.guard === null || typeof row.guard === 'string',
        true,
        `${pinLabel}: the row's guard is a name the record carried or null (${what})`,
      );
      assert.equal(
        row.verdict === null || SHIPPED.VERDICTS.includes(row.verdict),
        true,
        `${pinLabel}: the row's verdict ${label(row.verdict)} is one of the two verdict words or null (${what})`,
      );
      assert.equal(
        row.path === null || typeof row.path === 'string',
        true,
        `${pinLabel}: the row's path is a path the record carried or null (${what})`,
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
        ABSENCE_KEYS,
        `${pinLabel}: an absence carries the record's own three fields (${what})`,
      );
      assert.equal(
        fieldNames.includes(absence.field),
        true,
        `${pinLabel}: the absence names the field ${label(absence.field)}, which is not one of the four the record carries (${what})`,
      );
      assert.equal(
        SHIPPED.ABSENCES.includes(absence.reason),
        true,
        `${pinLabel}: the reason ${label(absence.reason)} is not one of the tokens the module exports (${what})`,
      );
    }
    assert.equal(
      JSON.stringify(answer).includes('severity'),
      false,
      `${pinLabel}: a field the record does not name reaches no part of the answer (${what})`,
    );
  }
  assert.deepEqual(
    [...seen].sort(),
    [...SHIPPED.STATES].sort(),
    `${pinLabel}: the four states are the four the record names, and this table reaches every one`,
  );
}

/** SC1's pin: a cancelled navigation names its guard, its phase and the verdict that cancelled it. */
function pinCancelledNamesItsGuard(
  guardPhase,
  pinLabel,
  observations = cancelledNavigation(),
) {
  const answer = plain(guardPhase(observations));
  assert.equal(
    answer.rows.length,
    1,
    `${pinLabel}: one recorded verdict is one row (${label(answer.rows)})`,
  );
  const row = answer.rows[0];
  assert.equal(
    row.phase,
    'canActivate',
    `${pinLabel}: the row names the phase the guard ran in — phase is ${label(row.phase)}, and no nearer phase is substituted for it`,
  );
  assert.equal(
    row.guard,
    GUARD,
    `${pinLabel}: the row names the guard that produced the verdict — guard is ${label(row.guard)}`,
  );
  assert.equal(
    row.verdict,
    'refused',
    `${pinLabel}: the row names the verdict that cancelled the navigation — verdict is ${label(row.verdict)}`,
  );
  assert.equal(
    row.path,
    PATH,
    `${pinLabel}: the row carries the route's own path — path is ${label(row.path)}`,
  );
  assert.equal(
    answer.state,
    'guard-verdict-recorded',
    `${pinLabel}: every field of the row was recorded, so the record says so (${label(answer.state)})`,
  );
  assert.deepEqual(
    answer.absences,
    [],
    `${pinLabel}: nothing is absent for this verdict, so no absence is carried for it`,
  );
  return answer;
}

/** SC1's order pin: the rows are the arrivals, in the order they arrived. */
function pinArrivalOrder(guardPhase, pinLabel, observations = arrivalOrder()) {
  const answer = plain(guardPhase(observations));
  assert.deepEqual(
    answer.rows.map((row) => row.phase),
    ['canMatch', 'canActivate', 'resolve'],
    `${pinLabel}: the rows are the arrivals in arrival order — the phases read ${label(answer.rows.map((row) => row.phase))}, and canMatch is first because it runs before the route is known`,
  );
  assert.deepEqual(
    answer.rows.map((row) => row.guard),
    [null, GUARD, 'InvoiceResolver'],
    `${pinLabel}: each row keeps its own guard, in the same order — a guard is never lent to the row beside it`,
  );
  assert.deepEqual(
    answer.rows.map((row) => row.verdict),
    ['allowed', 'refused', 'allowed'],
    `${pinLabel}: and each row keeps its own verdict in the same order (${label(answer.rows.map((row) => row.verdict))})`,
  );
  // The three-phase record is not `guard-verdict-recorded`: its first row names a phase and no guard,
  // which is the state C2 says is real rather than a gap.
  assert.equal(
    answer.state,
    'guard-phase-only',
    `${pinLabel}: a phase with no guard is guard-phase-only, never a filled guard (${label(answer.state)})`,
  );
  assert.deepEqual(
    answer.absences.filter((absence) => absence.field === 'guard'),
    [{ field: 'guard', path: null, reason: 'guard-not-recorded' }],
    `${pinLabel}: the absent guard is named where it is absent, with the route's own path`,
  );
  return answer;
}

/** SC2's pin: an unnamed guard stays null, with an absence, and no logged name stands in for it. */
function pinPhaseOnlyKeepsTheGuardAbsent(guardPhase, pinLabel) {
  const observations = phaseOnlyNavigation();
  const answer = plain(guardPhase(observations));
  assert.equal(
    answer.rows.length,
    1,
    `${pinLabel}: one observation is one row (${label(answer.rows)})`,
  );
  assert.equal(
    answer.rows[0].guard,
    null,
    `${pinLabel}: guard is null where the navigation names none — no name is taken from the last guard the page logged (${label(answer.rows[0].guard)})`,
  );
  assert.equal(
    answer.state,
    'guard-phase-only',
    `${pinLabel}: a phase recorded with no guard is guard-phase-only (${label(answer.state)})`,
  );
  assert.deepEqual(
    answer.absences.filter((absence) => absence.field === 'guard'),
    [{ field: 'guard', path: null, reason: 'guard-not-recorded' }],
    `${pinLabel}: the absent guard is a named hole, not a filled field`,
  );
  assert.equal(
    JSON.stringify(answer).includes(GUARD),
    false,
    `${pinLabel}: the name the page logged beside the record is in no field of the answer — ${label(answer)}`,
  );
  return answer;
}

/** E1's pin: a navigation with no verdict reports that absence, never an empty row list. */
function pinNoVerdictIsAnAbsence(guardPhase, pinLabel) {
  for (const [what, observations] of NO_VERDICT_RECORDS) {
    const answer = plain(guardPhase(observations));
    assert.equal(
      answer.state,
      'cannot-tell',
      `${pinLabel}: a record carrying no verdict is cannot-tell, never a zero that reads as "a guard ran" (${what}: ${label(answer.state)})`,
    );
    assert.deepEqual(
      answer.rows,
      [],
      `${pinLabel}: and it carries no row to read (${what})`,
    );
    assert.deepEqual(
      answer.absences,
      [{ field: 'guard', path: null, reason: NARRATOR_ABSENCE }],
      `${pinLabel}: the absence is the narrator's own token, ${label(NARRATOR_ABSENCE)}, and nothing beside it (${what})`,
    );
  }
  assert.equal(
    NARRATOR_ABSENCE,
    'guard-verdict-not-recorded',
    'the narrator still answers the absence this record documents itself with',
  );
}

/** SC3's pin: the module names no page surface, no second record and no second argument. */
function pinNoPageSurface(source, pinLabel) {
  const body = code(source);
  for (const [what, pattern] of [
    ['document read', /\bdocument\b/],
    ['window read', /\bwindow\b/],
    ['navigator read', /\bnavigator\b/],
    ['navigation read', /\bnavigation\b/],
    ['console read', /\bconsole/],
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
      `${pinLabel}: guard-phase.js names a ${what} (${found && label(found[0])}), which is a surface the record must not read`,
    );
  }
  const signature = body.match(/function guardPhase\(([^)]*)\)/);
  assert.ok(
    signature !== null,
    `${pinLabel}: the reducer is declared as the named function guardPhase`,
  );
  assert.equal(
    signature[1].trim(),
    'observations',
    `${pinLabel}: the reducer takes one argument — the observations — and no second one (${label(signature[1])})`,
  );
  assert.deepEqual(
    [...new Set(body.match(/angularAi\w*/g))],
    ['angularAiGuardPhase'],
    `${pinLabel}: the module publishes one global of its own and names no other module's`,
  );
}

/**
 * SC3's list pin: every string the module can answer with is one of the tokens its own namespace
 * exports, so the four row fields are the four fields an observation is read by and no third name
 * reaches a row. The observation fixtures hand in exactly those four, which is the same list.
 */
function pinOneFieldList(namespace, source, pinLabel) {
  const exported = [
    ...namespace.ROW_FIELDS,
    ...namespace.STATES,
    ...namespace.ABSENCES,
    ...namespace.PHASES,
    ...namespace.VERDICTS,
    namespace.OBSERVATIONS,
  ];
  const own = [
    'use strict',
    'angularAiGuardPhase',
    // A `typeof` comparison is not a field name: the literals the scan allows beside the tokens are
    // the type words the reducer's own guards compare against.
    'object',
    'number',
    'string',
  ];
  assert.deepEqual(
    [...namespace.ROW_FIELDS].sort(),
    ['guard', 'path', 'phase', 'verdict'],
    `${pinLabel}: the record's row fields are the four the contract names (${label(namespace.ROW_FIELDS)})`,
  );
  // The fields the reducer reads, taken from its own source: every `field(<value>, '<name>')` call is
  // one name the reducer reads, and the list must be the row fields themselves — the record's fields
  // and the reducer's inputs are the same list, and this is the one place both are read.
  const readFields = [
    ...new Set(
      [...code(source).matchAll(/field\([^,()]+,\s*'([^']+)'\)/g)].map(
        (match) => match[1],
      ),
    ),
  ].sort();
  assert.deepEqual(
    readFields,
    [...namespace.ROW_FIELDS].sort(),
    `${pinLabel}: the reducer reads the fields ${label(readFields)}, which are not the four its rows carry (${label(namespace.ROW_FIELDS)})`,
  );
  for (const literal of literalsOf(code(source))) {
    // The empty string is the value that names nothing, so it is no token the module answers with.
    if (literal === '') continue;
    assert.equal(
      exported.includes(literal) || own.includes(literal),
      true,
      `${pinLabel}: the module answers with the token ${label(literal)}, which its own namespace does not export — the record's fields and the reducer's inputs are one list`,
    );
  }
  // An observation is read by the row's own four names and by nothing else, so every name a fixture
  // observation carries is one of them — and the measured observation carries all four.
  for (const observations of [
    cancelledNavigation(),
    arrivalOrder(),
    phaseOnlyNavigation().guardObservations,
  ]) {
    for (const observation of observations) {
      for (const key of Object.keys(observation)) {
        assert.equal(
          namespace.ROW_FIELDS.includes(key),
          true,
          `${pinLabel}: the fixture observation carries ${label(key)}, which is not one of the row fields — an observation is read by the same list a row carries`,
        );
      }
    }
  }
  assert.deepEqual(
    Object.keys(cancelledNavigation()[0]).sort(),
    [...namespace.ROW_FIELDS].sort(),
    `${pinLabel}: the measured observation carries all four fields, so the list is not vacuous (${label(cancelledNavigation()[0])})`,
  );
}

/** SC3's source pin: no other module under `extension/` produces a guard phase. */
function pinOnlyPhaseProducer(modules, phases, own, pinLabel) {
  const producers = modules
    .filter((module) => module.name !== own)
    .filter((module) => {
      const body = code(module.text);
      return phases.every(
        (word) => body.includes(`'${word}'`) || body.includes(`"${word}"`),
      );
    })
    .map((module) => module.name);
  assert.deepEqual(
    producers,
    [],
    `${pinLabel}: ${label(producers)} under extension/ produce a guard phase; the record ${own} is the only source of a phase, and a second reader is a second place one comes from (SC3, E5)`,
  );
}

/**
 * SC3's purity pin, over one module source: two `node:vm` contexts whose host globals are
 * throw-on-touch traps answer identically, and identically to the bare realm — so the reducer reads
 * nothing the traps hide, and a module that reached for one of them cannot answer here.
 */
function pinGuardedAnswer(
  source,
  pinLabel,
  observations = cancelledNavigation(),
) {
  const first = guarded(source, observations);
  const second = guarded(source, observations);
  assert.deepEqual(
    second,
    first,
    `${pinLabel}: two node:vm contexts with throw-on-touch globals answer identically`,
  );
  assert.deepEqual(
    first,
    plain(namespaceOf(source).guardPhase(observations)),
    `${pinLabel}: the guarded answer is the bare realm's answer, so nothing the traps hide was read`,
  );
  return first;
}

/** A record every read of which throws: the reducer must answer it rather than throw. */
function throwingRecord() {
  return new Proxy(
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
}

// ------------------------------------------------------------------------------ the record --

describe('the record the shipped module writes', () => {
  it('carries exactly the three contract fields in every state, and reaches all four', () => {
    pinContractFields(SHIPPED_REDUCER, 'the shipped module');
  });

  it('SC1 — a cancelled navigation names its guard, the phase it ran in and the verdict', () => {
    pinCancelledNamesItsGuard(SHIPPED_REDUCER, 'the shipped module');
  });

  it('SC1 — the rows are the arrivals, in arrival order, with each phase named', () => {
    pinArrivalOrder(SHIPPED_REDUCER, 'the shipped module');
  });

  it('SC2 — a row whose guard is unknown keeps guard null, with an absence, and no logged name', () => {
    pinPhaseOnlyKeepsTheGuardAbsent(SHIPPED_REDUCER, 'the shipped module');
  });

  it('E1 — a navigation with no verdict reports the narrator’s absence, never an empty list', () => {
    pinNoVerdictIsAnAbsence(SHIPPED_REDUCER, 'the shipped module');
  });

  it('SC3 — the record’s row fields and the reducer’s inputs are one exported list', () => {
    pinOneFieldList(SHIPPED, SRC, 'the shipped module');
  });
});

// -------------------------------------------------------------------------------- the purity --

describe('the record reads the value it is handed and nothing else (SC3)', () => {
  it('evaluates in a bare context and publishes the reducer and its token lists, and no global beside them', () => {
    const context = createContext({});
    runInContext(SRC, context);
    assert.equal(
      typeof context.angularAiGuardPhase.guardPhase,
      'function',
      'the module publishes the reducer on the global object of whatever world it runs in',
    );
    assert.equal(
      context.angularAiGuardPhase.guardPhase.length,
      1,
      'the reducer takes the one value it reads',
    );
    assert.deepEqual(
      Object.getOwnPropertyNames(context).filter((name) =>
        /^angularAi/.test(name),
      ),
      ['angularAiGuardPhase'],
      'the module publishes one namespace and nothing else of its own',
    );
    assert.deepEqual(
      Object.keys(context.angularAiGuardPhase).sort(),
      [
        'ABSENCES',
        'OBSERVATIONS',
        'PHASES',
        'ROW_FIELDS',
        'STATES',
        'VERDICTS',
        'guardPhase',
      ],
      'and that namespace carries the reducer and the closed token lists a caller compares against',
    );
  });

  it('SC3 — two node:vm contexts with throw-on-touch globals produce deep-equal answers', () => {
    // The traps are armed, and proven armed before anything is asserted through them: a guard that
    // did not throw would make every guarded pin pass on any module.
    const armed = armedContext();
    for (const name of [
      'navigator',
      'navigation',
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
    for (const [what, observations] of [
      ['the three-phase arrival order', arrivalOrder()],
      ['the phase-only navigation', phaseOnlyNavigation()],
      ['a record carrying no observation at all', undefined],
    ]) {
      assert.deepEqual(
        guarded(SRC, observations),
        plain(SHIPPED_REDUCER(observations)),
        `the two realms answer ${what} identically`,
      );
    }
    assert.deepEqual(
      guarded(SRC, cancelledNavigation()),
      pinCancelledNamesItsGuard(SHIPPED_REDUCER, 'the guarded pin'),
      'the answer the traps allow is the answer SC1 pins',
    );
  });

  it('SC3 — the module mentions no DOM, no logged line and no second record', () => {
    pinNoPageSurface(SRC, 'the shipped module');
  });

  it('answers the same value twice and mutates nothing it was handed', () => {
    const observations = arrivalOrder();
    const before = JSON.stringify(observations);
    const first = plain(SHIPPED_REDUCER(observations));
    const second = plain(SHIPPED_REDUCER(observations));
    assert.deepEqual(second, first);
    assert.notEqual(
      SHIPPED_REDUCER(observations),
      SHIPPED_REDUCER(observations),
      'each call answers a fresh object',
    );
    assert.notEqual(
      SHIPPED_REDUCER(observations).rows,
      SHIPPED_REDUCER(observations).rows,
      'each call answers a fresh rows list, so no caller can edit the next answer',
    );
    assert.equal(
      JSON.stringify(observations),
      before,
      'the reducer mutates nothing in the observations it was handed',
    );
  });

  it('throws on no input, and answers the same three fields for every one of them', () => {
    const inputs = [
      ['undefined', undefined],
      ['null', null],
      ['zero', 0],
      ['a number', 42],
      ['NaN', NaN],
      ['an empty string', ''],
      ['a name', GUARD],
      ['a boolean', true],
      ['a function', () => {}],
      ['an array of nothing', [null, undefined, 0, 'x']],
      ['a record of nothing', Object.create(null)],
      ['a frozen record', Object.freeze({})],
      ['a date', new Date(0)],
      ['a record whose every read throws', throwingRecord()],
      [
        'a record whose observations getter throws',
        {
          get guardObservations() {
            throw new Error('no observations');
          },
        },
      ],
      [
        'a record whose list throws on length',
        {
          guardObservations: new Proxy([{ phase: 'canMatch' }], {
            get(target, key) {
              if (key === 'length') throw new Error('no length');
              return Reflect.get(target, key);
            },
          }),
        },
      ],
      [
        'an observation whose fields all throw',
        [
          {
            get phase() {
              throw new Error('no phase');
            },
            get guard() {
              throw new Error('no guard');
            },
            get verdict() {
              throw new Error('no verdict');
            },
            get path() {
              throw new Error('no path');
            },
          },
        ],
      ],
    ];
    for (const [what, input] of inputs) {
      let answer = null;
      assert.doesNotThrow(() => {
        answer = plain(SHIPPED_REDUCER(input));
      }, `the reducer throws on ${what}, and the module says it throws on no input`);
      assert.deepEqual(
        Object.keys(answer).sort(),
        ANSWER_KEYS,
        `even ${what} answers exactly the three contract fields`,
      );
      assert.equal(
        SHIPPED.STATES.includes(answer.state),
        true,
        `even ${what} answers one of the four states`,
      );
      assert.equal(
        Array.isArray(answer.rows) && Array.isArray(answer.absences),
        true,
        `even ${what} answers both of its lists`,
      );
    }
  });
});

// -------------------------------------------------------------------------------- the source --

describe('the record is the only source of a guard phase (SC3)', () => {
  it('is the only module under extension/ that produces one, and a second reader reddens it', (t) => {
    const shipped = modulesOf(EXTENSION_DIR);
    // The scan is not vacuous: with the record module not excluded it finds it, so the empty list
    // below is a fact about this tree rather than about a directory nothing was read from.
    const all = shipped
      .filter((module) => {
        const body = code(module.text);
        return SHIPPED.PHASES.every(
          (word) => body.includes(`'${word}'`) || body.includes(`"${word}"`),
        );
      })
      .map((module) => module.name);
    assert.deepEqual(
      all,
      [OWN_MODULE],
      `the scan must find extension/${OWN_MODULE} when it is not excluded, or it is reading nothing: it found ${label(all)}`,
    );

    pinOnlyPhaseProducer(
      shipped,
      SHIPPED.PHASES,
      OWN_MODULE,
      'the shipped tree',
    );

    // The mutant: the shipped tree, module for module, plus one reader. The only difference between
    // the pin above and this one is therefore the planted module.
    const planted = shipped.concat([
      { name: SECOND_READER_FILE, text: SECOND_READER },
    ]);
    assert.equal(
      planted.length,
      shipped.length + 1,
      'the planted tree must be the shipped one plus exactly one reader',
    );
    const failure = reddens(
      () =>
        pinOnlyPhaseProducer(
          planted,
          SHIPPED.PHASES,
          OWN_MODULE,
          'the planted tree',
        ),
      'the planted second reader',
    );
    assert.match(failure.message, /guard-mirror\.js/);
    t.diagnostic(`SC3 scan red: ${failure.message.split('\n')[0]}`);
  });
});

// --------------------------------------------------------------------------------- mutants --

describe('mutants redden by name', () => {
  it('M1 — a record whose cancel arrived before the guard’s phase reddens SC1, naming the phase', (t) => {
    pinCancelledNamesItsGuard(SHIPPED_REDUCER, 'the unmutated module');

    // The mutation is in the record, measured both ways: the mutant record is asserted to differ
    // first, so a mutation that changed nothing cannot be credited with the red.
    const mutated = plain(SHIPPED_REDUCER(cancelledBeforeTheGuardRan()));
    assert.equal(
      mutated.rows.length,
      1,
      'the mutant record still carries the one verdict the navigation recorded',
    );
    assert.equal(
      mutated.rows[0].phase,
      null,
      'the mutant record names no phase, because the guard’s phase was never observed — the bite',
    );
    assert.notEqual(
      mutated.state,
      'guard-verdict-recorded',
      'and the record says so rather than completing the phase',
    );

    const failure = reddens(() => {
      pinCancelledNamesItsGuard(
        SHIPPED_REDUCER,
        'the mutant record',
        cancelledBeforeTheGuardRan(),
      );
    }, 'the cancel before the guard ran');
    assert.match(failure.message, /the phase the guard ran in/);
    t.diagnostic(`SC1 mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('M2 — two rows reordered redden the arrival-order pin, naming the phase', (t) => {
    pinArrivalOrder(SHIPPED_REDUCER, 'the unmutated module');

    // (a) The record handed in with two arrivals swapped: the navigation recorded them in the other
    // order, which is exactly what a record built from arrival order must not repair.
    const swapped = arrivalOrder();
    const first = swapped[1];
    swapped[1] = swapped[2];
    swapped[2] = first;
    assert.deepEqual(
      plain(SHIPPED_REDUCER(swapped)).rows.map((row) => row.phase),
      ['canMatch', 'resolve', 'canActivate'],
      'the swapped record must answer the swapped order, or the pin below proves nothing',
    );
    const inputFailure = reddens(
      () => pinArrivalOrder(SHIPPED_REDUCER, 'the mutant record', swapped),
      'the swapped arrivals',
    );
    assert.match(inputFailure.message, /arrival order/);
    assert.match(inputFailure.message, /canMatch/);
    t.diagnostic(
      `SC1 order mutant red: ${inputFailure.message.split('\n')[0]}`,
    );

    // (b) The shipped module with its push made an unshift: the rows are read correctly and placed at
    // the front, so the phases appear in the reverse of the order the navigation recorded them.
    const unshifted = mutate(
      'the rows unshifted',
      '      rows.push(row);',
      '      rows.unshift(row);',
    );
    const join = namespaceOf(unshifted).guardPhase;
    assert.deepEqual(
      plain(join(arrivalOrder())).rows.map((row) => row.phase),
      ['resolve', 'canActivate', 'canMatch'],
      'the unshifted module must answer the arrivals reversed — the bite',
    );
    const sourceFailure = reddens(
      () => pinArrivalOrder(join, 'the mutant module'),
      'the rows unshifted',
    );
    assert.match(sourceFailure.message, /arrival order/);
    assert.match(sourceFailure.message, /canMatch/);
    t.diagnostic(
      `SC1 source mutant red: ${sourceFailure.message.split('\n')[0]}`,
    );
  });

  it('M3 — a guard filled from the record’s logged line reddens SC2 and the page-surface scan', (t) => {
    pinPhaseOnlyKeepsTheGuardAbsent(SHIPPED_REDUCER, 'the unmutated module');

    const mutated = mutate(
      'the logged line filling the guard',
      `      const reduced = reduceObservation(observation);
      const row = reduced.row;`,
      `      const reduced = reduceObservation(observation);
      const row = reduced.row;
      if (row.guard === null) {
        row.guard = textOf(field(field(observations, 'consoleEntries'), 0));
        reduced.named = row.guard !== null;
      }`,
    );
    const join = namespaceOf(mutated).guardPhase;
    const answered = plain(join(phaseOnlyNavigation()));
    assert.equal(
      answered.rows[0].guard,
      GUARD,
      'the mutant names the guard the page logged where the navigation names none — the bite',
    );
    assert.equal(
      answered.state,
      'guard-verdict-recorded',
      'and answers a state the record never established',
    );

    const failure = reddens(
      () => pinPhaseOnlyKeepsTheGuardAbsent(join, 'the mutant module'),
      'the logged line filling the guard',
    );
    assert.match(
      failure.message,
      /no name is taken from the last guard the page logged/,
    );
    t.diagnostic(`SC2 mutant red: ${failure.message.split('\n')[0]}`);

    const scanned = reddens(
      () => pinNoPageSurface(mutated, 'the mutant module'),
      'the logged line filling the guard',
    );
    assert.match(scanned.message, /console/);
    t.diagnostic(`SC3 scan red: ${scanned.message.split('\n')[0]}`);
  });

  it('M4 — an empty record answered as recorded reddens E1, naming the absence', (t) => {
    pinNoVerdictIsAnAbsence(SHIPPED_REDUCER, 'the unmutated module');

    const mutated = mutate(
      'the empty record answered as recorded',
      `    if (rows.length === 0) {
      return {
        state: CANNOT_TELL,
        rows: [],
        absences: [absent('guard', null, GUARD_VERDICT_NOT_RECORDED)],
      };
    }`,
      `    if (rows.length === 0) {
      return { state: GUARD_VERDICT_RECORDED, rows: [], absences: [] };
    }`,
    );
    const join = namespaceOf(mutated).guardPhase;
    const answered = plain(join({ guardObservations: [] }));
    assert.equal(
      answered.state,
      'guard-verdict-recorded',
      'the mutant answers an empty row list as a recorded record — the bite',
    );
    assert.deepEqual(answered.absences, [], 'and names no absence at all');

    const failure = reddens(
      () => pinNoVerdictIsAnAbsence(join, 'the mutant module'),
      'the empty record answered as recorded',
    );
    assert.match(failure.message, /cannot-tell/);
    t.diagnostic(`E1 mutant red: ${failure.message.split('\n')[0]}`);

    // The absence itself, reddened separately so the red names the token the narrator answers with.
    const absenceFailure = reddens(() => {
      const answer = plain(join({ guardObservations: [] }));
      assert.deepEqual(
        answer.absences,
        [{ field: 'guard', path: null, reason: NARRATOR_ABSENCE }],
        `a record carrying no verdict names ${label(NARRATOR_ABSENCE)} and nothing beside it`,
      );
    }, 'the empty record answered as recorded');
    assert.match(absenceFailure.message, /guard-verdict-not-recorded/);
    t.diagnostic(`E1 absence red: ${absenceFailure.message.split('\n')[0]}`);
  });

  it('M5 — a phase taken from the nearest phase reddens the order pin, naming canMatch', (t) => {
    pinArrivalOrder(SHIPPED_REDUCER, 'the unmutated module');

    const mutated = mutate(
      'the nearest phase substituted',
      `    if (PHASES.indexOf(word) === -1) {
      return { phase: null, reason: PHASE_NOT_A_PHASE_WORD };
    }`,
      `    if (PHASES.indexOf(word) === -1) {
      return { phase: CAN_MATCH, reason: null };
    }`,
    );
    const join = namespaceOf(mutated).guardPhase;
    const answered = plain(
      join([
        { phase: 'canLoad', guard: GUARD, verdict: 'refused', path: PATH },
      ]),
    );
    assert.equal(
      answered.rows[0].phase,
      'canMatch',
      'the mutant names canMatch for a phase word that is not one of the four — the bite',
    );

    const failure = reddens(
      () =>
        pinArrivalOrder(join, 'the mutant module', [
          { phase: 'canLoad', guard: GUARD, verdict: 'refused', path: PATH },
          ...arrivalOrder(),
        ]),
      'the nearest phase substituted',
    );
    assert.match(failure.message, /canMatch/);
    t.diagnostic(`E2 mutant red: ${failure.message.split('\n')[0]}`);
  });
});
