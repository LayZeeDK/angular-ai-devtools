// M063 T002 — answer from the guard record, purely (INTENT.md SC1-SC3; T002 AC1-AC3; held-out
// E1-E5).
//
// What this suite measures. `extension/guard-answer.js` joins the guard record T001 writes
// (`extension/guard-phase.js`) into one answer of five fields. This file holds it to the criteria the
// join owns, and each criterion's pin is paired with a mutant that has to bite before it may redden —
// an assertion a broken join would still pass is not evidence:
//
//   SC1  a record naming a cancelling guard answers `guard-cancelled` with the phase it ran in, the
//        guard and the verdict. Mutants: the record's rows handed in reordered, and the join reading
//        the rows in the other order — both redden naming the phase, because the first refusal the
//        record states is the verdict that stopped the navigation.
//   SC2  a record whose row names no guard answers `guard-phase-only`, and the answer carries no name
//        the page logged beside it. Mutants: a guard filled from `record.consoleEntries` (reddens the
//        pin and the page-surface scan), and a missing verdict answered as a pass (reddens naming the
//        reason the record stated).
//   SC3  the function reads no argument but the record. Its code is scanned for every page surface,
//        for a second record and for a phase word it could invent; it is loaded in `node:vm` contexts
//        whose host globals are throw-on-touch traps; and a second argument's record is shown to move
//        no field of the answer. The record's row fields and the join's inputs are one list, asserted
//        in one place, against the record's own exported list.
//
// The edges carry their own mutants: the empty record answered as a verdict (E1), a phase attributed
// to the route that matched afterwards (E2), a verdict the record does not carry answered as a pass
// (E3), a guard filled from the logged line (E4), and a second module under `extension/` producing a
// guard phase (E5). One more adds a remedy string, which no answer may name.
//
// The record fixtures are not this file's invention. Each is produced by the reducer T001 landed, run
// over the guard observations the way its own suite writes them, so the record's shape and the join's
// input are the same three fields, asserted here in one place. The only things this file adds to a
// record are the two a careless caller might: the logged line a page carries beside it, and — for the
// E1 table — the values a caller passes when it has no record at all.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const MODULE_URL = new URL('../extension/guard-answer.js', import.meta.url);
const SRC = readFileSync(MODULE_URL, 'utf8');
const RECORD_URL = new URL('../extension/guard-phase.js', import.meta.url);
const RECORD_SRC = readFileSync(RECORD_URL, 'utf8');
const NARRATOR_URL = new URL(
  '../extension/navigation-narrator.js',
  import.meta.url,
);
const NARRATOR_SRC = readFileSync(NARRATOR_URL, 'utf8');
const EXTENSION_DIR = fileURLToPath(new URL('../extension/', import.meta.url));

/** The join's own base name, which the export scan reads as one file among the record's siblings. */
const OWN_MODULE = 'guard-answer.js';

/** The record's base name: E5's scan excludes it, and only it, because it is the one source of a phase. */
const RECORD_MODULE = 'guard-phase.js';

/** E5's mutant: the same namespace, one more place a guard phase comes from. */
const SECOND_READER_FILE = 'guard-answer-mirror.js';
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

/** The five fields an answer carries, in the order a reader sorts them, and no sixth. */
const ANSWER_KEYS = ['absences', 'guard', 'phase', 'state', 'verdict'];

/** The four states, and the only states. */
const STATES = [
  'cannot-tell',
  'guard-allowed',
  'guard-cancelled',
  'guard-phase-only',
];

/** The three fields an absence carries. */
const ABSENCE_KEYS = ['field', 'path', 'reason'];

/** The four phase words the record places, which the join must never spell (SC3, E5). */
const PHASE_WORDS = ['canActivate', 'canDeactivate', 'canMatch', 'resolve'];

/** The two verdict words the record states, and the only two the join answers with. */
const VERDICT_WORDS = ['allowed', 'refused'];

/** The word a remedy, a cause or a schematic is written with — and an answer never is. */
const REMEDY =
  /\b(fix|fixed|fixes|remedy|remedies|schematic|schematics|cause|causes|because|should|must|migrate|upgrade|instead|retry)\b/i;

/** The guards, the resolver and the routes the measured navigations name, written once. */
const GUARD = 'RequireSession';
const ALLOWING_GUARD = 'AllowAnonymous';
const LEAVING_GUARD = 'ConfirmLeave';
const PATH = 'contract';
const OTHER_PATH = 'invoice';

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
 * The join, loaded from the module and nothing else: the one publication
 * `globalThis.angularAiGuardAnswer` is the function itself, so a caller reads one record and calls one
 * function.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const join = context.angularAiGuardAnswer;
  assert.equal(
    typeof join,
    'function',
    'the module must publish the join itself on globalThis.angularAiGuardAnswer',
  );
  return join;
}

const JOIN = standalone();

// ------------------------------------------------------------------- the record this join reads --

/** The record reducer T001 landed, loaded from its own file: the join's input is the record the tree
 * publishes, not a shape this suite restates. */
function recordNamespace(source = RECORD_SRC) {
  const context = createContext({});
  runInContext(source, context);
  const namespace = context.angularAiGuardPhase;
  assert.equal(
    typeof namespace,
    'object',
    'extension/guard-phase.js must publish the namespace of the record this join reads',
  );
  assert.equal(
    typeof namespace.guardPhase,
    'function',
    'extension/guard-phase.js must publish the reducer this suite builds its fixtures with',
  );
  return namespace;
}

const RECORD = recordNamespace();

/** A record as it crosses the boundary: plain values, the way the join receives it. */
function recordOf(observations) {
  return plain(RECORD.guardPhase(observations));
}

/** The narrator's record-level absence, read from the narrator rather than retyped. */
function narratorGuardAbsence() {
  const context = createContext({});
  runInContext(NARRATOR_SRC, context);
  const narrator = context.angularAiNavigationNarrator;
  assert.equal(
    typeof narrator,
    'object',
    'extension/navigation-narrator.js must publish the namespace this join’s absence token is held to',
  );
  return narrator.GUARD_VERDICT_NOT_RECORDED;
}

const NARRATOR_ABSENCE = narratorGuardAbsence();

// ------------------------------------------------------------------------------ the fixtures --

/**
 * SC1's measured navigation: one guard, in `canActivate`, whose own verdict cancelled the navigation
 * after its side effect. This is the shape the milestone exists for.
 */
function cancelledRecord() {
  return recordOf([
    { phase: 'canActivate', guard: GUARD, verdict: 'refused', path: PATH },
  ]);
}

/**
 * The same navigation as it actually arrives: `canMatch` runs before the route is known and allows the
 * navigation with no guard named, and `canActivate` then refuses it. The refusal is the finding; the
 * phase-only row is neither reported as its phase nor read as the one that cancelled.
 */
function cancelledAfterPhaseOnlyRecord() {
  return recordOf([
    { phase: 'canMatch', verdict: 'allowed' },
    { phase: 'canActivate', guard: GUARD, verdict: 'refused', path: PATH },
  ]);
}

/**
 * SC1's ordering record: two refusals, in two phases, each naming its guard. The router stops at the
 * first refusal, so the measured navigation writes one — but the record's shape admits two, and the
 * join must not depend on which arrived last: the first refusal is the verdict that stopped the
 * navigation, and a join that reads the rows in another order names another phase.
 */
function twoRefusalsRecord() {
  return recordOf([
    {
      phase: 'canDeactivate',
      guard: LEAVING_GUARD,
      verdict: 'refused',
      path: PATH,
    },
    { phase: 'canMatch', guard: GUARD, verdict: 'refused', path: OTHER_PATH },
  ]);
}

/** The same two refusals with their arrivals swapped: the record says another one came first. */
function reorderedRefusalsRecord() {
  const record = twoRefusalsRecord();
  const first = record.rows[0];
  record.rows[0] = record.rows[1];
  record.rows[1] = first;
  return record;
}

/**
 * A refusal whose guard's phase was never observed: the navigation was cancelled and the record
 * cannot say where the guard ran.
 */
function refusalWithoutPhaseRecord() {
  return recordOf([{ guard: GUARD, verdict: 'refused', path: PATH }]);
}

/** A refusal the record carried no name for at all: no phase and no guard. */
function refusalAloneRecord() {
  return recordOf([{ verdict: 'refused', path: PATH }]);
}

/**
 * SC2's record and E2's: a `canMatch` verdict, no guard named, and the page's log beside it. The
 * logged line is what a careless join would borrow the guard's name from.
 */
function phaseOnlyWithLogRecord() {
  const record = recordOf({
    guardObservations: [{ phase: 'canMatch', verdict: 'allowed', path: null }],
  });
  record.consoleEntries = [GUARD];
  return record;
}

/**
 * E2's record: the phase-only `canMatch` verdict, and behind it the `canActivate` guard that matched
 * the route afterwards and allowed it. The phase is recorded with no owner and is never attributed to
 * the route that matched.
 */
function phaseOnlyThenAllowedRecord() {
  return recordOf([
    { phase: 'canMatch', verdict: 'allowed' },
    {
      phase: 'canActivate',
      guard: ALLOWING_GUARD,
      verdict: 'allowed',
      path: PATH,
    },
  ]);
}

/** E3's record: a functional guard whose own observable never emitted, so its verdict is absent. */
function unstatedVerdictRecord() {
  return recordOf([{ phase: 'canActivate', guard: GUARD, path: PATH }]);
}

/** The allowed navigation: one guard whose own verdict allowed it. */
function allowedRecord() {
  return recordOf([
    {
      phase: 'canActivate',
      guard: ALLOWING_GUARD,
      verdict: 'allowed',
      path: OTHER_PATH,
    },
  ]);
}

/** E7's record: a guard that ran and allowed the navigation, and the one that refused it after. */
function allowedThenRefusedRecord() {
  return recordOf([
    {
      phase: 'canDeactivate',
      guard: ALLOWING_GUARD,
      verdict: 'allowed',
      path: OTHER_PATH,
    },
    { phase: 'canActivate', guard: GUARD, verdict: 'refused', path: PATH },
  ]);
}

/**
 * E1's records: the navigations the record observed with no guard verdict at all — the shapes T001's
 * own suite reduces, so the join is answered with the record the tree publishes rather than with a
 * shape written to make this file pass.
 */
const NO_VERDICT_RECORDS = [
  ['no record at all', undefined],
  ['a record carrying no row list', {}],
  ['a record carrying an empty row list', recordOf({ guardObservations: [] })],
  [
    'a record of nothing but its own state',
    {
      state: 'cannot-tell',
      rows: [],
      absences: [],
    },
  ],
  ['a record whose rows are all nothing', { rows: [null, undefined, 0, 'x'] }],
];

/** The page a mutant is supposed to borrow a name from: one logged line, one guard's name. */
function loggedPage() {
  return { consoleEntries: [GUARD] };
}

// ------------------------------------------------------------------------------- the pure loop --

/**
 * The globals the join must never reach for. `document`, `window`, `navigation`, `performance`, the
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
 * Runs the join *inside* a context where every one of `HOST_GLOBALS` is a trap, and returns the answer
 * it produced. The record is handed in through the sandbox, so nothing about the call crosses from
 * this realm except the data. Two calls are two contexts.
 */
function guarded(source, record, extra = {}) {
  const sandbox = { __record: record, ...extra };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const context = createContext(sandbox);
  runInContext(source, context);
  return plain(runInContext('angularAiGuardAnswer(__record)', context));
}

/** A copy of the module with one anchored substitution, refused unless the anchor is unique. */
function mutate(defect, anchor, replacement) {
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `the ${defect} mutation anchor must appear once in extension/guard-answer.js; it appears ${occurrences} time(s) — restate the mutant instead of deleting it`,
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

/** A record every read of which throws: the join must answer it rather than throw. */
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

// ------------------------------------------------------------------------------------ the pins --

/** The key pin: every answer carries exactly the five contract fields, in every state. */
function pinContractFields(join, pinLabel) {
  const table = [
    ['the cancelled navigation', cancelledRecord()],
    [
      'the navigation cancelled after a phase-only row',
      cancelledAfterPhaseOnlyRecord(),
    ],
    ['the two refusals', twoRefusalsRecord()],
    ['the refusal recorded before its guard ran', refusalWithoutPhaseRecord()],
    ['the refusal that names nothing', refusalAloneRecord()],
    ['the phase-only navigation with a logged line', phaseOnlyWithLogRecord()],
    [
      'the phase-only navigation and the guard behind it',
      phaseOnlyThenAllowedRecord(),
    ],
    ['the guard whose observable never emitted', unstatedVerdictRecord()],
    ['the allowed navigation', allowedRecord()],
    ['the allowed guard and the refusal after it', allowedThenRefusedRecord()],
    ...NO_VERDICT_RECORDS,
    ['a value whose every read throws', throwingRecord()],
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
    assert.equal(
      answer.phase === null || typeof answer.phase === 'string',
      true,
      `${pinLabel}: the phase ${label(answer.phase)} is a word the record carried or null (${what})`,
    );
    assert.equal(
      answer.guard === null || typeof answer.guard === 'string',
      true,
      `${pinLabel}: the guard is a name the record carried or null (${what})`,
    );
    assert.equal(
      answer.verdict === null || VERDICT_WORDS.includes(answer.verdict),
      true,
      `${pinLabel}: the verdict ${label(answer.verdict)} is one of the record's two verdict words or null (${what})`,
    );
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
        RECORD.ROW_FIELDS.includes(absence.field),
        true,
        `${pinLabel}: the absence names the field ${label(absence.field)}, which is not one of the four the record carries (${what})`,
      );
      assert.equal(
        RECORD.ABSENCES.includes(absence.reason),
        true,
        `${pinLabel}: the reason ${label(absence.reason)} is not one the record's own namespace exports (${what})`,
      );
    }
    assert.equal(
      REMEDY.test(JSON.stringify(answer)),
      false,
      `${pinLabel}: no answer names a remedy, a cause or a schematic (${what}): ${label(answer)}`,
    );
  }
  assert.deepEqual(
    [...seen].sort(),
    STATES,
    `${pinLabel}: the four states are the four the contract names, and this table reaches every one`,
  );
}

/** SC1's pin: a cancelled navigation names its guard, its phase and the verdict that cancelled it. */
function pinCancelled(join, pinLabel) {
  const record = cancelledRecord();
  assert.deepEqual(
    record.rows[0],
    { phase: 'canActivate', guard: GUARD, verdict: 'refused', path: PATH },
    `${pinLabel}: the record carries the verdict the navigation recorded for its guard`,
  );
  assert.equal(
    record.state,
    'guard-verdict-recorded',
    `${pinLabel}: the record says the whole verdict was recorded`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.state,
    'guard-cancelled',
    `${pinLabel}: a record naming a guard whose verdict cancelled the navigation answers guard-cancelled (${label(answer.state)})`,
  );
  assert.equal(
    answer.phase,
    'canActivate',
    `${pinLabel}: the answer names the phase the cancelling guard ran in — phase is ${label(answer.phase)}, and no nearer phase is substituted for it`,
  );
  assert.equal(
    answer.guard,
    GUARD,
    `${pinLabel}: the answer names the guard that produced the cancelling verdict — guard is ${label(answer.guard)}`,
  );
  assert.equal(
    answer.verdict,
    'refused',
    `${pinLabel}: the answer names the verdict that cancelled the navigation — verdict is ${label(answer.verdict)}`,
  );
  assert.deepEqual(
    answer.absences,
    [],
    `${pinLabel}: nothing is absent for this verdict, so no absence is carried for it`,
  );
  return answer;
}

/**
 * SC1's ordering pin: the cancellation is the first refusal the record states, read in the record's
 * own arrival order, and the phase the answer names is that refusal's.
 */
function pinFirstRefusal(join, pinLabel, record = twoRefusalsRecord()) {
  assert.deepEqual(
    record.rows.map((row) => row.verdict),
    ['refused', 'refused'],
    `${pinLabel}: the record carries two refusals for the pin below to order`,
  );
  const answer = plain(join(record));
  assert.equal(
    answer.state,
    'guard-cancelled',
    `${pinLabel}: a record that carries a refusal answers guard-cancelled (${label(answer.state)})`,
  );
  assert.equal(
    answer.phase,
    'canDeactivate',
    `${pinLabel}: the answer names the phase of the first refusal the record states, read in arrival order — phase is ${label(answer.phase)}, not ${label('canDeactivate')}`,
  );
  assert.equal(
    answer.guard,
    LEAVING_GUARD,
    `${pinLabel}: and the guard of that same first refusal — guard is ${label(answer.guard)}`,
  );
  assert.equal(
    answer.verdict,
    'refused',
    `${pinLabel}: and its verdict — verdict is ${label(answer.verdict)}`,
  );
  return answer;
}

/** SC1's second pin: the phase-only row before a refusal is not the row the answer is about. */
function pinRefusalAfterPhaseOnlyRow(join, pinLabel) {
  const record = cancelledAfterPhaseOnlyRecord();
  assert.deepEqual(
    record.rows.map((row) => row.phase),
    ['canMatch', 'canActivate'],
    `${pinLabel}: the record carries the phase-only arrival before the refusal`,
  );
  const answer = plain(join(record));
  assert.equal(
    answer.state,
    'guard-cancelled',
    `${pinLabel}: the record carries a refusal, so the answer is guard-cancelled (${label(answer.state)})`,
  );
  assert.equal(
    answer.phase,
    'canActivate',
    `${pinLabel}: the answer names the phase of the refusal, not the row that arrived first — phase is ${label(answer.phase)}`,
  );
  assert.equal(
    answer.guard,
    GUARD,
    `${pinLabel}: and the guard that refused — guard is ${label(answer.guard)}`,
  );
  assert.equal(
    JSON.stringify(answer).includes('canMatch'),
    false,
    `${pinLabel}: the canMatch phase recorded with no guard is in no field of the answer — ${label(answer)}`,
  );
  assert.deepEqual(
    answer.absences,
    [],
    `${pinLabel}: the absent guard belongs to another row's path, so it is not presented as this answer's`,
  );
  return answer;
}

/** A refusal with no phase: the cancel is named, the phase is a named hole and nothing more. */
function pinRefusalWithoutPhase(join, pinLabel) {
  const answer = plain(join(refusalWithoutPhaseRecord()));
  assert.equal(
    answer.state,
    'guard-cancelled',
    `${pinLabel}: a refusal that names its guard answers guard-cancelled (${label(answer.state)})`,
  );
  assert.equal(
    answer.phase,
    null,
    `${pinLabel}: the answer names no phase the record never recorded — phase is ${label(answer.phase)}, and no nearer phase is substituted for it`,
  );
  assert.equal(
    answer.guard,
    GUARD,
    `${pinLabel}: the guard the record names is still the answer's (${label(answer.guard)})`,
  );
  assert.deepEqual(
    answer.absences,
    [{ field: 'phase', path: PATH, reason: 'phase-not-recorded' }],
    `${pinLabel}: the absent phase is a named hole with the record's own reason, not a filled field`,
  );
  return answer;
}

/** SC2's pin: an unnamed guard stays null, with the record's absence, and no logged name stands in. */
function pinPhaseOnlyKeepsTheGuardAbsent(join, pinLabel) {
  const record = phaseOnlyWithLogRecord();
  assert.equal(
    record.rows[0].guard,
    null,
    `${pinLabel}: the record names no guard for the canMatch verdict`,
  );
  assert.deepEqual(
    record.consoleEntries,
    [GUARD],
    `${pinLabel}: the page's own logged line names a guard beside the record`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.guard,
    null,
    `${pinLabel}: guard is null where the navigation names none — no name is taken from the last guard the page logged (${label(answer.guard)})`,
  );
  assert.equal(
    answer.state,
    'guard-phase-only',
    `${pinLabel}: a phase recorded with no guard is guard-phase-only (${label(answer.state)})`,
  );
  assert.equal(
    answer.phase,
    'canMatch',
    `${pinLabel}: the answer names the phase the record placed — phase is ${label(answer.phase)}`,
  );
  assert.equal(
    answer.verdict,
    'allowed',
    `${pinLabel}: and the verdict the row states — verdict is ${label(answer.verdict)}`,
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

/** E2's pin: the phase-only row is reported by phase, never attributed to the route that matched. */
function pinPhaseOnlyIsNotTheRouteThatMatched(join, pinLabel) {
  const record = phaseOnlyThenAllowedRecord();
  assert.deepEqual(
    record.rows.map((row) => row.guard),
    [null, ALLOWING_GUARD],
    `${pinLabel}: the route that matched afterwards names its own guard, and the canMatch row names none`,
  );

  const answer = plain(join(record));
  // The phase is asserted first: it is the field the route-attribution defect moves, so the red
  // names the phase rather than the state it dragged with it.
  assert.equal(
    answer.phase,
    'canMatch',
    `${pinLabel}: the phase recorded with no guard is canMatch, and is never attributed to the route that matched afterwards — phase is ${label(answer.phase)}`,
  );
  assert.equal(
    answer.state,
    'guard-phase-only',
    `${pinLabel}: the phase recorded with no guard is reported as guard-phase-only (${label(answer.state)})`,
  );
  assert.equal(
    answer.guard,
    null,
    `${pinLabel}: and the answer names no guard for it (${label(answer.guard)})`,
  );
  assert.equal(
    JSON.stringify(answer).includes(ALLOWING_GUARD),
    false,
    `${pinLabel}: the guard that matched the route afterwards is in no field of the answer — ${label(answer)}`,
  );
  return answer;
}

/** E1's pin: a navigation with no verdict reports that absence, never an empty finding. */
function pinNoVerdictIsAnAbsence(join, pinLabel) {
  for (const [what, record] of NO_VERDICT_RECORDS) {
    const answer = plain(join(record));
    assert.equal(
      answer.state,
      'cannot-tell',
      `${pinLabel}: a record carrying no guard verdict is cannot-tell, never a zero that reads as "a guard ran" (${what}: ${label(answer.state)})`,
    );
    assert.deepEqual(
      {
        phase: answer.phase,
        guard: answer.guard,
        verdict: answer.verdict,
      },
      { phase: null, guard: null, verdict: null },
      `${pinLabel}: and it names no phase, no guard and no verdict (${what}: ${label(answer)})`,
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
    'the narrator still answers the absence this join documents itself with',
  );
}

/** E3's pin: a verdict the record does not carry is not emitted, and never a pass. */
function pinUnstatedVerdict(join, pinLabel) {
  const record = unstatedVerdictRecord();
  assert.equal(
    record.rows[0].verdict,
    null,
    `${pinLabel}: the record states no verdict for the guard whose observable never emitted`,
  );

  const answer = plain(join(record));
  assert.equal(
    answer.state,
    'cannot-tell',
    `${pinLabel}: a row whose verdict the record does not carry is reported as not emitted, never as a pass — the state is ${label(answer.state)}`,
  );
  assert.equal(
    answer.verdict,
    null,
    `${pinLabel}: the answer states no verdict the record does not carry (${label(answer.verdict)})`,
  );
  assert.equal(
    answer.phase,
    'canActivate',
    `${pinLabel}: the phase the record did record is named (${label(answer.phase)})`,
  );
  assert.equal(
    answer.guard,
    GUARD,
    `${pinLabel}: and the guard it names is still that row's own (${label(answer.guard)})`,
  );
  assert.deepEqual(
    answer.absences,
    [{ field: 'verdict', path: PATH, reason: 'verdict-not-recorded' }],
    `${pinLabel}: the answer carries the record's own reason for the absent verdict`,
  );
  return answer;
}

/** The allowed pin: a guard whose verdict allowed the navigation is `guard-allowed`. */
function pinAllowed(join, pinLabel) {
  const answer = plain(join(allowedRecord()));
  assert.equal(
    answer.state,
    'guard-allowed',
    `${pinLabel}: a record whose guard allowed the navigation answers guard-allowed (${label(answer.state)})`,
  );
  assert.notEqual(
    answer.state,
    'guard-cancelled',
    `${pinLabel}: an allowing guard is never reported as the one that cancelled the navigation`,
  );
  assert.equal(
    answer.phase,
    'canActivate',
    `${pinLabel}: the phase the allowing guard ran in is named (${label(answer.phase)})`,
  );
  assert.equal(
    answer.guard,
    ALLOWING_GUARD,
    `${pinLabel}: and the guard itself (${label(answer.guard)})`,
  );
  assert.equal(
    answer.verdict,
    'allowed',
    `${pinLabel}: and the verdict it stated (${label(answer.verdict)})`,
  );
  assert.deepEqual(
    answer.absences,
    [],
    `${pinLabel}: nothing is absent for this verdict, so no absence is carried for it`,
  );
  return answer;
}

/** E7's pin: the guard that allowed the navigation is not reported as the one that cancelled it. */
function pinAllowedIsNotTheCanceller(join, pinLabel) {
  const answer = plain(join(allowedThenRefusedRecord()));
  assert.equal(
    answer.state,
    'guard-cancelled',
    `${pinLabel}: one refusal is enough for guard-cancelled (${label(answer.state)})`,
  );
  assert.equal(
    answer.guard,
    GUARD,
    `${pinLabel}: the answer names the guard that refused — guard is ${label(answer.guard)}`,
  );
  assert.equal(
    answer.phase,
    'canActivate',
    `${pinLabel}: and the phase that refusal ran in (${label(answer.phase)})`,
  );
  assert.equal(
    JSON.stringify(answer).includes(ALLOWING_GUARD),
    false,
    `${pinLabel}: the guard that allowed the navigation is not reported as the one that cancelled it — ${label(answer)}`,
  );
  assert.equal(
    JSON.stringify(answer).includes('canDeactivate'),
    false,
    `${pinLabel}: nor is the phase it ran in reported as the phase of the cancel`,
  );
  return answer;
}

/** Every name a record's rows carry, so an answer can be held to them. */
function namesTheRecordCarries(record) {
  const allowed = new Set();
  const rows = record && Array.isArray(record.rows) ? record.rows : [];
  for (const row of rows) {
    for (const key of ['phase', 'guard', 'verdict']) {
      if (typeof row[key] === 'string') allowed.add(row[key]);
    }
  }
  return allowed;
}

/** SC3's pin: no answer names an identity the record did not carry, and no answer is empty noise. */
function pinOnlyRecordIdentities(join, pinLabel) {
  const table = [
    ['the cancelled navigation', cancelledRecord()],
    [
      'the navigation cancelled after a phase-only row',
      cancelledAfterPhaseOnlyRecord(),
    ],
    ['the two refusals', twoRefusalsRecord()],
    ['the refusal recorded before its guard ran', refusalWithoutPhaseRecord()],
    ['the refusal that names nothing', refusalAloneRecord()],
    ['the phase-only navigation with a logged line', phaseOnlyWithLogRecord()],
    [
      'the phase-only navigation and the guard behind it',
      phaseOnlyThenAllowedRecord(),
    ],
    ['the guard whose observable never emitted', unstatedVerdictRecord()],
    ['the allowed navigation', allowedRecord()],
    ['the allowed guard and the refusal after it', allowedThenRefusedRecord()],
  ];
  for (const [what, record] of table) {
    const answer = plain(join(record));
    const carried = namesTheRecordCarries(record);
    for (const field of ['phase', 'guard', 'verdict']) {
      assert.ok(
        answer[field] === null || carried.has(answer[field]),
        `${pinLabel}: ${field} is ${label(answer[field])}, which no row of the record carries (${what})`,
      );
    }
    for (const absence of answer.absences) {
      const stated =
        Array.isArray(record.absences) &&
        record.absences.some(
          (entry) =>
            entry.field === absence.field &&
            entry.path === absence.path &&
            entry.reason === absence.reason,
        );
      const named = absence.reason === absence.field + '-not-recorded';
      assert.ok(
        stated || named,
        `${pinLabel}: the absence ${label(absence)} is neither one the record states nor the hole this join names in the row's own spelling (${what})`,
      );
    }
  }
}

/** SC3's and E5's pin: the join names no phase word at all, so it can invent none. */
function pinNoPhaseWord(source, pinLabel) {
  const body = code(source);
  assert.deepEqual(
    [...RECORD.PHASES].sort(),
    [...PHASE_WORDS].sort(),
    `${pinLabel}: the four words scanned for are the four the record places`,
  );
  for (const word of PHASE_WORDS) {
    assert.equal(
      body.includes(word),
      false,
      `${pinLabel}: the join names the phase word ${label(word)}, and a join that can spell a phase word can answer with one the record never recorded (SC3, E5)`,
    );
  }
}

/** AC3's pin: the module's code mentions no page surface and no second record. */
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
    [
      'route attribution',
      /\b(route|routes|routes?Table|router|Router|matched|neighbour|nearest)\b/,
    ],
    [
      'second record',
      /\bguardPhase\b|\bangularAiGuardPhase\b|\bguardObservations\b|\browsOf\b/,
    ],
  ]) {
    const found = body.match(pattern);
    assert.equal(
      found,
      null,
      `${pinLabel}: guard-answer.js names a ${what} (${found && label(found[0])}), which is a surface the answer must not read`,
    );
  }
  const signature = body.match(/function guardAnswer\(([^)]*)\)/);
  assert.ok(
    signature !== null,
    `${pinLabel}: the join is declared as the named function guardAnswer`,
  );
  assert.equal(
    signature[1].trim(),
    'record',
    `${pinLabel}: the join takes one argument — the record — and no second one (${label(signature[1])})`,
  );
  assert.deepEqual(
    [...new Set(body.match(/angularAi\w*/g))],
    ['angularAiGuardAnswer'],
    `${pinLabel}: the module publishes one global of its own and names no other module's`,
  );
  for (const verdict of VERDICT_WORDS) {
    assert.deepEqual(
      RECORD.VERDICTS.includes(verdict),
      true,
      `${pinLabel}: the verdict word ${label(verdict)} the join reads is one the record states`,
    );
  }
}

/** The field constants the join declares, resolved to the words it reads rows by. */
function fieldConstantsOf(source) {
  const found = new Map();
  const pattern = /const (PHASE|GUARD|VERDICT|PATH) = '([^']+)';/g;
  let match = pattern.exec(code(source));
  while (match !== null) {
    found.set(match[1], match[2]);
    match = pattern.exec(code(source));
  }
  return found;
}

/**
 * SC3's list pin: the record's own row fields are the fields this join reads, and the holes it names
 * are spelled the way the record spells them. One place, both halves.
 */
function pinOneFieldList(source, pinLabel) {
  const constants = fieldConstantsOf(source);
  assert.deepEqual(
    [...constants.keys()].sort(),
    ['GUARD', 'PATH', 'PHASE', 'VERDICT'],
    `${pinLabel}: the join declares its four row field names as constants (${label([...constants.keys()])})`,
  );
  const listed = code(source).match(/const ROW_FIELDS = \[([^\]]*)\];/);
  assert.ok(
    listed !== null,
    `${pinLabel}: the join declares the row fields as one list, ROW_FIELDS`,
  );
  const resolved = listed[1]
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '')
    .map((name) => constants.get(name));
  assert.deepEqual(
    resolved,
    [...RECORD.ROW_FIELDS],
    `${pinLabel}: the record's row fields are ${label([...RECORD.ROW_FIELDS])} and the join reads ${label(resolved)} — the record's fields and the join's inputs are one list, and this is the one place both are read`,
  );
  for (const field of RECORD.ROW_FIELDS) {
    const hole = field + '-not-recorded';
    assert.equal(
      RECORD.ABSENCES.includes(hole),
      true,
      `${pinLabel}: the hole this join names for ${label(field)} is ${label(hole)}, which the record's own absence list does not spell (${label([...RECORD.ABSENCES])})`,
    );
  }
}

/**
 * SC3's purity pin, over one module source: two `node:vm` contexts whose host globals are
 * throw-on-touch traps answer identically, and identically to the bare realm — so the join reads
 * nothing the traps hide, and a module that reached for one of them cannot answer here.
 */
function pinGuardedAnswer(source, pinLabel, record = cancelledRecord()) {
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

/** E5's pin: no module under `extension/` produces a guard phase beside the record. */
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

// ------------------------------------------------------------------------------ the purity --

describe('guard-answer.js is pure', () => {
  it('evaluates in a bare context and publishes the join itself, and nothing else of its own', () => {
    const context = createContext({});
    runInContext(SRC, context);
    assert.equal(
      typeof context.angularAiGuardAnswer,
      'function',
      'the module publishes the join on the global object of whatever world it runs in',
    );
    assert.equal(
      context.angularAiGuardAnswer.length,
      1,
      'the join takes the one record it reads',
    );
    assert.deepEqual(
      Object.getOwnPropertyNames(context).filter((name) =>
        /^angularAi/.test(name),
      ),
      ['angularAiGuardAnswer'],
      'the module publishes the join and nothing else of its own',
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
    for (const [what, record] of [
      [
        'the navigation cancelled after a phase-only row',
        cancelledAfterPhaseOnlyRecord(),
      ],
      [
        'the phase-only navigation with a logged line',
        phaseOnlyWithLogRecord(),
      ],
      ['the guard whose observable never emitted', unstatedVerdictRecord()],
      ['the allowed navigation', allowedRecord()],
      ['a record carrying no row list', {}],
    ]) {
      assert.deepEqual(
        guarded(SRC, record),
        plain(JOIN(record)),
        `the two realms answer ${what} identically`,
      );
    }
    assert.deepEqual(
      guarded(SRC, cancelledRecord()),
      pinCancelled(JOIN, 'the guarded pin'),
      'the answer the traps allow is the answer SC1 pins',
    );
  });

  it('SC3 — the module mentions no DOM, no logged line, no second record and no phase word', () => {
    pinNoPageSurface(SRC, 'the shipped module');
    pinNoPhaseWord(SRC, 'the shipped module');
  });

  it('SC3 — the record’s row fields and the join’s inputs are one list, and its holes are the record’s', () => {
    pinOneFieldList(SRC, 'the shipped module');
  });

  it('SC3 — the answer is the same when a second record is handed in beside the first', () => {
    const record = cancelledRecord();
    const other = allowedRecord();
    assert.notDeepEqual(
      plain(JOIN(other)),
      plain(JOIN(record)),
      'the second record must be one that would move the answer if it were read',
    );
    assert.deepEqual(
      plain(JOIN(record, other)),
      plain(JOIN(record)),
      'the join reads one argument — the record — and a second one moves no field of the answer',
    );
    assert.deepEqual(
      plain(JOIN(record, null, other)),
      plain(JOIN(record)),
      'nor does a third',
    );
  });

  it('answers the same record twice with the same value and mutates nothing it was handed', () => {
    const record = twoRefusalsRecord();
    const before = JSON.stringify(record);
    const first = JOIN(record);
    const second = JOIN(record);
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

  it('throws on no input, and answers the same five fields for every one of them', () => {
    const notARecord = [
      ['undefined', undefined],
      ['null', null],
      ['zero', 0],
      ['a number', 42],
      ['NaN', NaN],
      ['an empty string', ''],
      ['a name', GUARD],
      ['a boolean', true],
      ['a function', () => {}],
      ['a record of nothing', Object.create(null)],
      ['a frozen record', Object.freeze({})],
      ['a date', new Date(0)],
      ['a bare list of rows, which is not the record', cancelledRecord().rows],
      ['a record whose every read throws', throwingRecord()],
      [
        'a record whose rows getter throws',
        {
          get rows() {
            throw new Error('no rows');
          },
        },
      ],
      [
        'a record whose row list throws on length',
        {
          rows: new Proxy([{ phase: 'canActivate' }], {
            get(target, key) {
              if (key === 'length') throw new Error('no length');
              return Reflect.get(target, key);
            },
          }),
        },
      ],
    ];
    for (const [what, input] of notARecord) {
      let answer = null;
      assert.doesNotThrow(() => {
        answer = plain(JOIN(input));
      }, `the join throws on ${what}, and the module says it throws on no input`);
      assert.deepEqual(
        Object.keys(answer).sort(),
        ANSWER_KEYS,
        `even ${what} answers exactly the five contract fields`,
      );
      assert.deepEqual(
        {
          state: answer.state,
          phase: answer.phase,
          guard: answer.guard,
          verdict: answer.verdict,
        },
        { state: 'cannot-tell', phase: null, guard: null, verdict: null },
        `a value that is not the record answers cannot-tell and names nothing (${what}): ${label(answer)}`,
      );
      assert.deepEqual(
        answer.absences,
        [{ field: 'guard', path: null, reason: NARRATOR_ABSENCE }],
        `and names the record-level absence the narrator uses, ${label(NARRATOR_ABSENCE)} (${what})`,
      );
    }

    // A record whose fields are unreadable is still answered: what the getters hide is an absent
    // field, and the holes this join can see are named rather than filled.
    const rowOfThrowingFields = {
      rows: [
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
    };
    assert.deepEqual(
      plain(JOIN(rowOfThrowingFields)),
      {
        state: 'cannot-tell',
        phase: null,
        guard: null,
        verdict: null,
        absences: [
          { field: 'phase', path: null, reason: 'phase-not-recorded' },
          { field: 'guard', path: null, reason: 'guard-not-recorded' },
          { field: 'verdict', path: null, reason: 'verdict-not-recorded' },
          { field: 'path', path: null, reason: 'path-not-recorded' },
        ],
      },
      'a row whose every field throws is a row of nothing, answered with the four holes named',
    );

    assert.deepEqual(
      plain(
        JOIN({
          rows: [
            {
              phase: 'canActivate',
              guard: GUARD,
              verdict: 'refused',
              path: PATH,
            },
          ],
          get absences() {
            throw new Error('no absences');
          },
        }),
      ),
      {
        state: 'guard-cancelled',
        phase: 'canActivate',
        guard: GUARD,
        verdict: 'refused',
        absences: [],
      },
      'a record whose absences are unreadable still answers the verdict it carries, and invents no absence',
    );

    assert.deepEqual(
      plain(
        JOIN({ rows: [{ verdict: 'cancelled', guard: GUARD, path: PATH }] }),
      ),
      {
        state: 'cannot-tell',
        phase: null,
        guard: GUARD,
        verdict: null,
        absences: [
          { field: 'phase', path: PATH, reason: 'phase-not-recorded' },
          { field: 'verdict', path: PATH, reason: 'verdict-not-recorded' },
        ],
      },
      'a verdict word outside the record’s two is no verdict this join restates, and the reason it cannot tell is named',
    );

    assert.deepEqual(
      plain(JOIN(refusalAloneRecord())),
      {
        state: 'cannot-tell',
        phase: null,
        guard: null,
        verdict: 'refused',
        absences: [
          { field: 'phase', path: PATH, reason: 'phase-not-recorded' },
          { field: 'guard', path: PATH, reason: 'guard-not-recorded' },
        ],
      },
      'a refusal that names neither a phase nor a guard answers cannot-tell with both holes named',
    );
  });
});

// ------------------------------------------------------------------ the shipped join answers --

describe('the shipped join answers the guard record', () => {
  it('carries exactly the five contract fields in every state, and reaches all four', () => {
    pinContractFields(JOIN, 'the shipped module');
  });

  it('SC1 — a record naming a cancelling guard names its phase, its guard and the verdict', () => {
    pinCancelled(JOIN, 'the shipped module');
  });

  it('SC1 — the cancellation is the first refusal the record states, in arrival order', () => {
    pinFirstRefusal(JOIN, 'the shipped module');
  });

  it('SC1 — the phase-only row before a refusal is not the row the answer is about', () => {
    pinRefusalAfterPhaseOnlyRow(JOIN, 'the shipped module');
  });

  it('SC1 — a refusal with no phase names the phase as a hole, never as a near phase', () => {
    pinRefusalWithoutPhase(JOIN, 'the shipped module');
  });

  it('SC2 — a row whose guard is unknown keeps guard null, with the absence, and no logged name', () => {
    pinPhaseOnlyKeepsTheGuardAbsent(JOIN, 'the shipped module');
  });

  it('E2 — a phase recorded with no guard is never attributed to the route that matched', () => {
    pinPhaseOnlyIsNotTheRouteThatMatched(JOIN, 'the shipped module');
  });

  it('E1 — a navigation with no verdict reports the narrator’s absence, never an empty answer', () => {
    pinNoVerdictIsAnAbsence(JOIN, 'the shipped module');
  });

  it('E3 — a verdict the record does not carry is reported as not emitted, never as a pass', () => {
    pinUnstatedVerdict(JOIN, 'the shipped module');
  });

  it('E7 — a guard that allowed the navigation answers guard-allowed', () => {
    pinAllowed(JOIN, 'the shipped module');
  });

  it('E7 — the guard that allowed the navigation is not reported as the one that cancelled it', () => {
    pinAllowedIsNotTheCanceller(JOIN, 'the shipped module');
  });

  it('SC3 — the answer names no identity the record did not carry, and no remedy', () => {
    pinOnlyRecordIdentities(JOIN, 'the shipped module');
  });
});

// ------------------------------------------------------------ the record is the only phase --

describe('the guard record is the only source of a phase (SC3, E5)', () => {
  it('is the only module under extension/ that produces one, and a second reader reddens it', (t) => {
    const shipped = modulesOf(EXTENSION_DIR);
    // The scan reads the join's own file: it is measured, not skipped.
    assert.equal(
      shipped.some((module) => module.name === OWN_MODULE),
      true,
      `the scan must read extension/${OWN_MODULE} among the modules it measures — it read ${label(shipped.map((module) => module.name).slice(0, 5))}…`,
    );
    // The scan is not vacuous: with the record module not excluded it finds it, so the empty list
    // below is a fact about this tree rather than about a directory nothing was read from.
    const all = shipped
      .filter((module) => {
        const body = code(module.text);
        return RECORD.PHASES.every(
          (word) => body.includes(`'${word}'`) || body.includes(`"${word}"`),
        );
      })
      .map((module) => module.name);
    assert.deepEqual(
      all,
      [RECORD_MODULE],
      `the scan must find extension/${RECORD_MODULE} when it is not excluded, or it is reading nothing: it found ${label(all)}`,
    );

    pinOnlyPhaseProducer(
      shipped,
      RECORD.PHASES,
      RECORD_MODULE,
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
          RECORD.PHASES,
          RECORD_MODULE,
          'the planted tree',
        ),
      'the planted second reader',
    );
    assert.match(failure.message, /guard-answer-mirror\.js/);
    t.diagnostic(`E5 scan red: ${failure.message.split('\n')[0]}`);
  });
});

// --------------------------------------------------------------------------------- mutants --

describe('mutants redden by name', () => {
  it('M1 — a record whose refusals are reordered reddens SC1, naming the phase', (t) => {
    pinFirstRefusal(JOIN, 'the unmutated module');

    // The mutation is in the record, measured both ways: the reordered record is asserted to answer
    // the other phase first, so a reordering that changed nothing cannot be credited with the red.
    const reordered = reorderedRefusalsRecord();
    assert.deepEqual(
      reordered.rows.map((row) => row.phase),
      ['canMatch', 'canDeactivate'],
      'the reordered record names the canMatch refusal first',
    );
    const answered = plain(JOIN(reordered));
    assert.equal(
      answered.phase,
      'canMatch',
      'the join answers the record it was handed, so the reordered record names the other phase — the bite',
    );
    assert.equal(
      answered.state,
      'guard-cancelled',
      'and still answers the cancellation, because both rows refuse',
    );

    const failure = reddens(
      () => pinFirstRefusal(JOIN, 'the reordered record', reordered),
      'the refusals reordered',
    );
    assert.match(failure.message, /arrival order/);
    assert.match(failure.message, /"canDeactivate"/);
    t.diagnostic(`SC1 record mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('M2 — the join reading the rows in the other order reddens SC1, naming the phase', (t) => {
    pinFirstRefusal(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the rows read in the other order',
      `  function firstRowOf(rows, accepts) {
    for (let index = 0; index < rows.length; index += 1) {
      if (accepts(rows[index])) return rows[index];
    }
    return null;
  }`,
      `  function firstRowOf(rows, accepts) {
    for (let index = rows.length - 1; index >= 0; index -= 1) {
      if (accepts(rows[index])) return rows[index];
    }
    return null;
  }`,
    );
    const join = standalone(mutated);
    const answered = plain(join(twoRefusalsRecord()));
    assert.equal(
      answered.phase,
      'canMatch',
      'the mutated join names the refusal that arrived last — the bite',
    );

    const failure = reddens(
      () => pinFirstRefusal(join, 'the mutant module'),
      'the rows read in the other order',
    );
    assert.match(failure.message, /arrival order/);
    assert.match(failure.message, /"canDeactivate"/);
    t.diagnostic(`SC1 order mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('M3 — a guard filled from the record’s logged line reddens SC2 and the page-surface scan', (t) => {
    pinPhaseOnlyKeepsTheGuardAbsent(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the logged line filling the guard',
      '    const unnamed = firstRowOf(rows, (row) => row.guard === null);',
      `    const unnamed = firstRowOf(rows, (row) => row.guard === null);
    if (unnamed !== null) {
      unnamed.guard = nameOf(fieldOf(fieldOf(record, 'consoleEntries'), 0));
    }`,
    );
    const join = standalone(mutated);
    const answered = plain(join(phaseOnlyWithLogRecord()));
    assert.equal(
      answered.guard,
      GUARD,
      'the mutant names the guard the page logged where the navigation names none — the bite',
    );
    assert.equal(
      answered.state,
      'guard-allowed',
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

  it('M4 — a verdict the record does not carry answered as a pass reddens E3', (t) => {
    pinUnstatedVerdict(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the unstated verdict answered as a pass',
      '    const unstated = firstRowOf(rows, (row) => row.verdict === null);',
      '    const unstated = null;',
    );
    const join = standalone(mutated);
    const answered = plain(join(unstatedVerdictRecord()));
    assert.equal(
      answered.state,
      'guard-allowed',
      'the mutant reports the guard whose observable never emitted as one that allowed the navigation — the bite',
    );
    assert.equal(
      answered.verdict,
      null,
      'and states no verdict while claiming the navigation was allowed',
    );

    const failure = reddens(
      () => pinUnstatedVerdict(join, 'the mutant module'),
      'the unstated verdict answered as a pass',
    );
    assert.match(failure.message, /never as a pass/);
    t.diagnostic(`E3 mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('M5 — a phase taken from the route that matched afterwards reddens E2', (t) => {
    pinPhaseOnlyIsNotTheRouteThatMatched(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the route that matched afterwards answering',
      '    const allowed = unnamed === null ? rows[0] : unnamed;',
      '    const allowed = rows[rows.length - 1];',
    );
    const join = standalone(mutated);
    const answered = plain(join(phaseOnlyThenAllowedRecord()));
    assert.equal(
      answered.phase,
      'canActivate',
      'the mutant names the phase of the row that matched the route afterwards — the bite',
    );
    assert.equal(
      answered.guard,
      ALLOWING_GUARD,
      'and its guard, which the phase-only row never named',
    );

    const failure = reddens(
      () => pinPhaseOnlyIsNotTheRouteThatMatched(join, 'the mutant module'),
      'the route that matched afterwards answering',
    );
    assert.match(
      failure.message,
      /never attributed to the route that matched afterwards/,
    );
    t.diagnostic(`E2 mutant red: ${failure.message.split('\n')[0]}`);
  });

  it('M6 — an empty record answered as a verdict reddens E1, naming the absence', (t) => {
    pinNoVerdictIsAnAbsence(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the empty record answered as a verdict',
      `    if (rows.length === 0) {
      return answerOf(CANNOT_TELL, null, null, null, noRowAbsences(stated));
    }`,
      `    if (rows.length === 0) {
      return answerOf(GUARD_ALLOWED, null, null, null, []);
    }`,
    );
    const join = standalone(mutated);
    const answered = plain(join({}));
    assert.equal(
      answered.state,
      'guard-allowed',
      'the mutant answers a record that carries no verdict as an allowed navigation — the bite',
    );
    assert.deepEqual(answered.absences, [], 'and names no absence at all');

    const failure = reddens(
      () => pinNoVerdictIsAnAbsence(join, 'the mutant module'),
      'the empty record answered as a verdict',
    );
    assert.match(failure.message, /cannot-tell/);
    t.diagnostic(`E1 mutant red: ${failure.message.split('\n')[0]}`);

    // The absence itself, reddened separately so the red names the token the narrator answers with.
    const absenceFailure = reddens(() => {
      const answer = plain(join({}));
      assert.deepEqual(
        answer.absences,
        [{ field: 'guard', path: null, reason: NARRATOR_ABSENCE }],
        `a record carrying no verdict names ${label(NARRATOR_ABSENCE)} and nothing beside it`,
      );
    }, 'the empty record answered as a verdict');
    assert.match(absenceFailure.message, /guard-verdict-not-recorded/);
    t.diagnostic(`E1 absence red: ${absenceFailure.message.split('\n')[0]}`);
  });

  it('M7 — a phase the join invents reddens SC1 and the phase-word scan', (t) => {
    pinRefusalWithoutPhase(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the phase invented for a refusal that recorded none',
      `    if (row.guard !== null) {
      return answerOf(state, row.phase, row.guard, row.verdict, absences);
    }`,
      `    if (row.guard !== null) {
      const phase = row.phase === null ? 'canActivate' : row.phase;
      return answerOf(state, phase, row.guard, row.verdict, absences);
    }`,
    );
    const join = standalone(mutated);
    const answered = plain(join(refusalWithoutPhaseRecord()));
    assert.equal(
      answered.phase,
      'canActivate',
      'the mutant names a phase the record never recorded — the bite',
    );

    const failure = reddens(
      () => pinRefusalWithoutPhase(join, 'the mutant module'),
      'the phase invented for a refusal that recorded none',
    );
    assert.match(failure.message, /no nearer phase is substituted/);
    t.diagnostic(`SC1 phase mutant red: ${failure.message.split('\n')[0]}`);

    const scanned = reddens(
      () => pinNoPhaseWord(mutated, 'the mutant module'),
      'the phase invented for a refusal that recorded none',
    );
    assert.match(scanned.message, /"canActivate"/);
    t.diagnostic(`E5 scan red: ${scanned.message.split('\n')[0]}`);
  });

  it('M8 — a remedy string added to the answer reddens the five-field pin and the literal scan', (t) => {
    pinContractFields(JOIN, 'the unmutated module');

    const mutated = mutate(
      'the remedy string',
      `      verdict: verdict,
      absences: absences,
    };`,
      `      verdict: verdict,
      absences: absences,
      remedy: 'declare the guard on the other route and retry the navigation',
    };`,
    );
    const join = standalone(mutated);
    const answered = plain(join(cancelledRecord()));
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
    assert.match(failure.message, /five contract fields/);
    t.diagnostic(`SC3 mutant red: ${failure.message.split('\n')[0]}`);

    const named = reddens(() => {
      for (const literal of literalsOf(code(mutated))) {
        assert.equal(
          REMEDY.test(literal),
          false,
          `a string the module can answer with names a remedy, a cause or a schematic: ${label(literal)}`,
        );
      }
    }, 'the remedy string');
    assert.match(named.message, /names a remedy/);
    t.diagnostic(`SC3 literal red: ${named.message.split('\n')[0]}`);
  });
});
