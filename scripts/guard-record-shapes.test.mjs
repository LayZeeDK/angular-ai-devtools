// @ts-check
// Run: node --test scripts/guard-record-shapes.test.mjs
// Armed (the only writer this milestone has):
//   M063_CAPTURE=1 node --test scripts/guard-record-shapes.test.mjs
// On Windows, where the shell is cmd.exe:
//   set "M063_CAPTURE=1"&& node --test scripts/guard-record-shapes.test.mjs
//
// M063 T005 re-derives this milestone's own map: `research/raw/m063-record-shapes.json` states the
// shape of the two artefacts the milestone ships, `extension/guard-phase.js` (the guard record T001
// writes) and `extension/guard-answer.js` (the join T002 publishes), and nothing this head does not
// carry.
//
// The record is measured, not typed. Every shape it states is read by running the shipped module in
// a bare `node:vm` context and reading back what it published: the record's own field lists and the
// row and absence rows' field lists come from one record of four observations the T001 module
// reduced, its four states from four records each establishing one of them, its seven absence
// reasons from the union of what three records produced — every reason the module exports, proved by
// a record that produces it — and the join's five fields, four states, absence fields and own
// absence from five records handed to the function T002 publishes. Nothing here reads the panel, the
// route table or a page.
//
// Three rules hold the record to this tree:
//
//   the read      a default run derives the whole record again and asserts the committed bytes are
//                 exactly that serialization, so a value that moved is named by path and field
//                 rather than found by a reader (SC1: a mutant that moves one counted field without
//                 re-capturing reddens naming the record and the field).
//   the head      the record names the commit it was measured at. A record whose head is a commit
//                 this history does not carry measures nothing, and a record whose head predates a
//                 change in a file it measures states a tree this checkout is not: both refusals
//                 name the recorded head and this head (SC4).
//   the census    the map measures no verdict-claims or surface record. It names the one record this
//                 milestone owes outside itself — the claim list T004 publishes — and it states its
//                 own capture command, so the suite that command names carries this record's path and
//                 the flag the command arms (the rule `scripts/tutor-record-shapes.test.mjs` and
//                 `scripts/tutor-answer.test.mjs` apply to a record its own census holds).
//
// One file is written by this suite and only behind the opt-in switch: an armed run derives,
// compares and writes only when a value moved, so two armed runs in a row are byte-identical, and a
// default run writes nothing at all. No page is opened, no browser is started and nothing is built.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** The record this suite writes and the suite that writes it, each named as a literal. */
const RECORD_REL = 'research/raw/m063-record-shapes.json';
const SUITE_REL = 'scripts/guard-record-shapes.test.mjs';
const RECORD_PATH = join(REPO_ROOT, ...RECORD_REL.split('/'));

/** The milestone, the task and the schema the record states. */
const MILESTONE = 'M063';
const TASK = 'T005';
const SCHEMA = 'm063-record-shapes/v1';
const TITLE = "Re-derive this milestone's own records";

/** The two modules this record measures: the record T001 writes and the join T002 publishes. */
const RECORD_MODULE = 'extension/guard-phase.js';
const ANSWER_MODULE = 'extension/guard-answer.js';
const MEASURED_PATHS = Object.freeze([RECORD_MODULE, ANSWER_MODULE]);

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const ARMED_COMMAND = `M063_CAPTURE=1 ${CHECK_COMMAND}`;
const ARMED_COMMAND_WINDOWS = `set "M063_CAPTURE=1"&& ${CHECK_COMMAND}`;
const CAPTURE_ENV = 'M063_CAPTURE';
const HEAD_COMMAND = 'git rev-parse HEAD';
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** The one record this milestone owes that this map does not measure. */
const OWED_CLAIMS = `research/raw/${MILESTONE.toLowerCase()}-verdict-claims.json`;

/**
 * Every reach a record and a join must not have: a page surface, a console line, a clock, a random
 * source, a timer, a network call, an import and a host process. Each is scanned in the module's code
 * with its comments stripped, because the comments name these words to say they are not reached.
 */
const FORBIDDEN = Object.freeze([
  'document.',
  'window.',
  'console.',
  'localStorage',
  'chrome.',
  'XMLHttpRequest',
  'fetch(',
  'require(',
  'import ',
  'Date.now',
  'new Date',
  'Math.random',
  'performance.now',
  'setTimeout',
  'setInterval',
  'process.',
]);

// ------------------------------------------------------------------- reading ----

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel @returns {string}
 */
function read(rel) {
  const path = join(REPO_ROOT, ...rel.split('/'));
  assert.ok(existsSync(path), `${rel} is a file this tree carries`);
  return readFileSync(path, 'utf8');
}

/** @param {string} text @returns {string} */
function digest(text) {
  return createHash('sha256').update(text).digest('hex');
}

/** The bytes the recording is written as, and read back as, on every run. @param {unknown} record @returns {string} */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named
 * rather than reported as a mismatch somewhere in the record.
 * @param {any} left @param {any} right @param {string} at @returns {string}
 */
function firstDifference(left, right, at) {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length)
      return `${at}: ${String(left.length)} row(s) -> ${String(right.length)} row(s)`;
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
        left[index],
        right[index],
        `${at}[${index}]`,
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
      const found = firstDifference(
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

/** @param {string} command @param {readonly string[]} args @returns {string} */
function git(command, args) {
  return execFileSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: 'pipe',
  });
}

/** The commit this run reads the tree at, as `git rev-parse HEAD` answers it. @returns {string} */
function gitHead() {
  const sha = git('git', ['rev-parse', 'HEAD']).trim();
  assert.match(
    sha,
    /^[0-9a-f]{40}$/,
    `${HEAD_COMMAND} must answer with one commit sha, and it answered ${JSON.stringify(sha)}`,
  );
  return sha;
}

/**
 * Whether `sha` is a commit this checkout can reach from HEAD: `rev-parse --verify` refuses a sha no
 * object carries, and `merge-base --is-ancestor` refuses a commit this history does not contain.
 * @param {string} sha @returns {boolean}
 */
function headIsAncestor(sha) {
  try {
    git('git', ['rev-parse', '--verify', `${sha}^{commit}`]);
  } catch {
    return false;
  }
  try {
    git('git', ['merge-base', '--is-ancestor', sha, 'HEAD']);
    return true;
  } catch {
    return false;
  }
}

/**
 * The last commit that changed `rel`, and the commit before it: the head a record written before
 * that change would name, used to prove the staleness refusal bites rather than assuming it does.
 * @param {string} rel @returns {{ last: string, beforeLast: string }}
 */
function lastChangeOf(rel) {
  const last = git('git', ['log', '-1', '--format=%H', '--', rel]).trim();
  assert.match(
    last,
    /^[0-9a-f]{40}$/,
    `${rel} is a tracked file, so git log must name the commit that last changed it, and it named ${JSON.stringify(last)}`,
  );
  const beforeLast = git('git', ['rev-parse', `${last}^`]).trim();
  return { last, beforeLast };
}

/** The measured paths that changed between `head` and HEAD, by name. @param {string} head @returns {string[]} */
function changedSince(head) {
  return git('git', [
    'diff',
    '--name-only',
    head,
    'HEAD',
    '--',
    ...MEASURED_PATHS,
  ])
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

/**
 * A value a module answered as a plain value: the module runs in a context of its own, so its
 * arrays and objects carry that realm's prototypes and a comparison of two realms compares
 * prototypes rather than data. The record is serialized as JSON either way, so this is the same
 * value a reader of the file gets.
 * @param {any} value @returns {any}
 */
function plainOf(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * One module's code with its comments removed: the shipped comments say what the module does not
 * read, and a scan that read them would find every word it forbids.
 * @param {string} source @returns {string}
 */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

// ---------------------------------------------------------------- derivation ----

/**
 * One shipped module run in a bare `node:vm` context: a context with nothing in it but the module's
 * own publication, so the shape read back is the shape the file publishes rather than a copy of it.
 * @param {string} rel @returns {Record<string, any>}
 */
function sandboxOf(rel) {
  const context = createContext({});
  runInContext(read(rel), context, { filename: rel });
  return /** @type {Record<string, any>} */ (context);
}

/**
 * What neither module reaches: the tokens above, searched in both modules' code with their comments
 * stripped. An empty `found` is what makes "no page, no console, no clock, no neighbour" a
 * measurement rather than a claim.
 * @returns {{ scan: string, forbidden: string[], found: string[] }}
 */
function purity() {
  /** @type {string[]} */
  const found = [];
  for (const rel of MEASURED_PATHS) {
    const code = codeOf(read(rel));
    for (const needle of FORBIDDEN)
      if (code.includes(needle)) found.push(`${rel}: ${needle}`);
  }
  return {
    scan: 'both modules with their comments stripped',
    forbidden: [...FORBIDDEN],
    found,
  };
}

/**
 * The shape `extension/guard-phase.js` publishes, read by running it. Every value below is what the
 * module answered or what it exported; nothing is typed.
 * @returns {Record<string, any>}
 */
function guardRecordShape() {
  const module = sandboxOf(RECORD_MODULE);
  const api = module.angularAiGuardPhase;
  assert.equal(
    typeof api?.guardPhase,
    'function',
    `${RECORD_MODULE} must publish guardPhase on angularAiGuardPhase, and it published ${typeof api?.guardPhase}`,
  );

  // Four observations in arrival order, each establishing something different: a `canActivate`
  // refusal that names its guard, a `canMatch` verdict that names a phase and no guard (the state
  // C2 says is real), a `resolve` that allowed on the componentless route's own empty path, and one
  // whose phase word is outside the four, whose guard is the empty string and whose verdict word is
  // outside the two.
  const observations = [
    {
      phase: 'canActivate',
      guard: 'authGuard',
      verdict: 'refused',
      path: 'admin',
    },
    { phase: 'canMatch', verdict: 'allowed', path: 'admin' },
    { phase: 'resolve', guard: 'loadResolver', verdict: 'allowed', path: '' },
    { phase: 'canRun', guard: '', verdict: 'maybe', path: '' },
  ];
  const answered = plainOf(
    api.guardPhase({
      [api.OBSERVATIONS]: observations,
    }),
  );
  assert.equal(
    answered.rows.length,
    observations.length,
    `the record must carry one row per observation and it carried ${String(answered.rows.length)} for ${String(observations.length)}`,
  );
  assert.equal(
    answered.rows[0]?.guard,
    'authGuard',
    `a row must carry the guard its own observation named, and the first carried ${JSON.stringify(answered.rows[0]?.guard)}`,
  );
  assert.equal(
    answered.rows[1]?.guard,
    null,
    `a row whose observation named no guard must keep null, and the second carried ${JSON.stringify(answered.rows[1]?.guard)}`,
  );
  assert.equal(
    answered.rows[2]?.path,
    '',
    `the empty string is the componentless route's own path, and the third row carried ${JSON.stringify(answered.rows[2]?.path)}`,
  );
  assert.equal(
    answered.rows[3]?.phase,
    null,
    `a word outside the four phases must place no phase, and the fourth row carried ${JSON.stringify(answered.rows[3]?.phase)}`,
  );

  // The four states, each read from a record that establishes it. The exported list is then held to
  // what the reducer answered rather than trusted as a list.
  const probes = [
    [
      'guard-verdict-recorded',
      {
        guardObservations: [
          {
            phase: 'canActivate',
            guard: 'authGuard',
            verdict: 'refused',
            path: 'admin',
          },
        ],
      },
    ],
    [
      'guard-phase-only',
      {
        guardObservations: [
          { phase: 'canMatch', verdict: 'allowed', path: 'admin' },
        ],
      },
    ],
    [
      'guard-verdict-absent',
      {
        guardObservations: [
          { phase: 'canActivate', guard: 'authGuard', path: 'admin' },
        ],
      },
    ],
    ['cannot-tell', {}],
  ];
  const states = probes.map(([, input]) => api.guardPhase(input).state);
  assert.deepEqual(
    states,
    probes.map(([expected]) => expected),
    `the reducer must answer the four states the contract names, one per record above, and it answered ${JSON.stringify(states)}`,
  );
  assert.deepEqual(
    [...api.STATES],
    states,
    `the states the module exports must be the states it answers, in the same order: it exports ${JSON.stringify([...api.STATES])} and answered ${JSON.stringify(states)}`,
  );

  // Every absence the module names, produced by a record: the union of what three records stated is
  // the exported list, so a reason the module cannot produce would be a name it exports for nothing.
  const absenceProbes = [
    { guardObservations: observations },
    { guardObservations: [{}] },
    {},
  ];
  const absenceReasons = [
    ...new Set(
      absenceProbes.flatMap((input) =>
        api
          .guardPhase(input)
          .absences.map((/** @type {any} */ row) => row.reason),
      ),
    ),
  ].sort();
  assert.deepEqual(
    absenceReasons,
    [...api.ABSENCES].sort(),
    `every absence reason the module exports must be one a record produces, and the records produced ${JSON.stringify(absenceReasons)} while the module exports ${JSON.stringify([...api.ABSENCES])}`,
  );

  // A bare array is the list itself, and a record carries it under the one field the module exports:
  // both are read the same way, so the shape is one input and not two.
  assert.deepEqual(
    plainOf(api.guardPhase(observations)),
    answered,
    `a bare array of observations must be the record's own list, and the two readings differed`,
  );

  const fields = Object.keys(answered);
  const rowFields = Object.keys(answered.rows[0] ?? {});
  const absenceFields = Object.keys(answered.absences[0] ?? {});
  const phases = [...api.PHASES];
  const verdicts = [...api.VERDICTS];

  assert.deepEqual(
    [...api.ROW_FIELDS],
    rowFields,
    `the row fields ${RECORD_MODULE} exports must be the fields its rows carry: it exports ${JSON.stringify([...api.ROW_FIELDS])} and a row carries ${JSON.stringify(rowFields)}`,
  );

  return {
    module: RECORD_MODULE,
    namespace: 'angularAiGuardPhase',
    functions: Object.keys(api).filter((key) => typeof api[key] === 'function'),
    fields,
    rowFields,
    absenceFields,
    states,
    absenceReasons,
    phases,
    verdicts,
    observationsField: String(api.OBSERVATIONS),
    sample: {
      observations,
      state: answered.state,
      rows: answered.rows,
      absences: answered.absences,
    },
    empty: plainOf(api.guardPhase({})),
    oneEmptyObservation: plainOf(api.guardPhase({ guardObservations: [{}] })),
    counts: {
      fields: fields.length,
      rowFields: rowFields.length,
      absenceFields: absenceFields.length,
      states: states.length,
      absenceReasons: absenceReasons.length,
      phases: phases.length,
      verdicts: verdicts.length,
      functions: Object.keys(api).filter(
        (key) => typeof api[key] === 'function',
      ).length,
    },
  };
}

/**
 * The shape `extension/guard-answer.js` publishes, read by running it. The join is one function, so
 * its five fields are the keys of one answer and its four states are the states five records
 * established.
 * @returns {Record<string, any>}
 */
function guardAnswerShape() {
  const module = sandboxOf(ANSWER_MODULE);
  const join = module.angularAiGuardAnswer;
  assert.equal(
    typeof join,
    'function',
    `${ANSWER_MODULE} must publish guardAnswer on angularAiGuardAnswer, and it published ${typeof join}`,
  );

  // One record per state the contract names, each establishing that state and nothing beside it.
  const probes = [
    [
      'guard-cancelled',
      {
        state: 'guard-verdict-recorded',
        rows: [
          {
            phase: 'canActivate',
            guard: 'authGuard',
            verdict: 'refused',
            path: 'admin',
          },
        ],
        absences: [],
      },
    ],
    [
      'guard-phase-only',
      {
        state: 'guard-phase-only',
        rows: [
          { phase: 'canMatch', guard: null, verdict: 'allowed', path: 'admin' },
        ],
        absences: [
          { field: 'guard', path: 'admin', reason: 'guard-not-recorded' },
        ],
      },
    ],
    [
      'guard-allowed',
      {
        state: 'guard-verdict-recorded',
        rows: [
          {
            phase: 'resolve',
            guard: 'loadResolver',
            verdict: 'allowed',
            path: '',
          },
        ],
        absences: [],
      },
    ],
    [
      'cannot-tell',
      {
        state: 'guard-verdict-absent',
        rows: [{ phase: null, guard: null, verdict: null, path: null }],
        absences: [
          { field: 'phase', path: null, reason: 'phase-not-a-phase-word' },
        ],
      },
    ],
    [
      'cannot-tell',
      {
        state: 'cannot-tell',
        rows: [],
        absences: [
          { field: 'guard', path: null, reason: 'guard-verdict-not-recorded' },
        ],
      },
    ],
  ];
  const observed = probes.map(([, input]) => join(input).state);
  assert.deepEqual(
    observed,
    probes.map(([expected]) => expected),
    `the join must answer the four states the contract names: handed five records, it answered ${JSON.stringify(observed)}`,
  );

  const cancelled = plainOf(join(probes[0][1]));
  const phaseOnly = plainOf(join(probes[1][1]));
  const cannotTell = plainOf(join(probes[3][1]));
  assert.equal(
    cancelled.guard,
    'authGuard',
    `the cancellation must name the guard the refused row carried, and it named ${JSON.stringify(cancelled.guard)}`,
  );
  assert.equal(
    phaseOnly.guard,
    null,
    `a row that names a phase and no guard must answer phase-only with no guard, and it named ${JSON.stringify(phaseOnly.guard)}`,
  );
  // The record's own absence is carried unrelabelled, and the holes it did not name are named in the
  // record's own spelling rather than dropped because the record left them unnamed.
  const stated = probes[3][1].absences[0];
  assert.ok(
    cannotTell.absences.some(
      (/** @type {any} */ row) =>
        row.field === stated.field &&
        row.path === stated.path &&
        row.reason === stated.reason,
    ),
    `cannot-tell must copy the record's own absence unrelabelled, and it said ${JSON.stringify(cannotTell.absences)}`,
  );
  assert.deepEqual(
    cannotTell.absences.map(
      (/** @type {any} */ row) => `${String(row.field)}:${String(row.reason)}`,
    ),
    [
      'phase:phase-not-a-phase-word',
      'guard:guard-not-recorded',
      'verdict:verdict-not-recorded',
      'path:path-not-recorded',
    ],
    `the answer names the record's own reason where the record states one and the hole in the record's own spelling where it does not, and it said ${JSON.stringify(cannotTell.absences)}`,
  );

  // A record with no rows and a bare list of rows are both no record at all, so the join answers its
  // own absence rather than an empty finding: an empty list would read as "a guard ran and said
  // nothing", which is a claim.
  const noRecord = join({});
  const emptyRows = join({ rows: [] });
  const bareRows = join(probes[0][1].rows);
  assert.equal(
    noRecord.state,
    'cannot-tell',
    `a record carrying no rows must answer cannot-tell, and it answered ${JSON.stringify(noRecord.state)}`,
  );
  assert.deepEqual(
    noRecord.absences,
    emptyRows.absences,
    `a record carrying no rows and one carrying an empty list must answer the same absence, and they differed`,
  );
  assert.equal(
    bareRows.state,
    'cannot-tell',
    `a bare list of rows is not the record, so it must answer cannot-tell rather than an empty finding, and it answered ${JSON.stringify(bareRows.state)}`,
  );

  const fields = Object.keys(cancelled);
  const absenceFields = Object.keys(
    cancelled.absences[0] ?? cannotTell.absences[0] ?? {},
  );
  const states = [...new Set(observed)];

  // Which fields of the record the join reads, proved by removing each rather than listed: a record
  // carrying no `rows` answers cannot-tell where the same record with rows answers a cancellation, and
  // a record whose `absences` state an entry for the answered row carries it.
  const rowsRead =
    join({ absences: [] }).state === 'cannot-tell' &&
    cancelled.state === 'guard-cancelled';
  assert.ok(
    rowsRead,
    `the join must read the record's \`rows\` list: a record carrying none answered ${JSON.stringify(join({ absences: [] }).state)} and the same record with rows answered ${JSON.stringify(cancelled.state)}`,
  );
  const absencesRead = phaseOnly.absences.length > 0;
  assert.ok(
    absencesRead,
    `the join must carry the absences the record states about the answered row, and it carried ${JSON.stringify(phaseOnly.absences)}`,
  );

  // The record's own state word is a reading of the same rows, never evidence the join has: at least
  // one record above states one state and is answered another, and that is what proves it is unread.
  const readsTheRecordsStateWord = probes.every(
    ([, input], index) => input.state === observed[index],
  );
  assert.equal(
    readsTheRecordsStateWord,
    false,
    'the record’s own `state` word must not be the answer, and every record above was answered the state it stated',
  );

  // A fifth key on a row reaches no field of the answer: the four the record carries are the four the
  // join reads, and a field it was not given is a field it cannot render.
  const fifth = 'a fifth field the row carries';
  const withFifth = plainOf(
    join({
      rows: [
        {
          phase: 'canActivate',
          guard: 'authGuard',
          verdict: 'refused',
          path: 'admin',
          detail: fifth,
        },
      ],
      absences: [],
    }),
  );
  const copiesAFifthRowField = JSON.stringify(withFifth).includes(fifth);
  assert.equal(
    copiesAFifthRowField,
    false,
    'a row carrying a fifth key must render no fifth field, and the answer carried it',
  );

  const inputFields = [
    ...(rowsRead ? ['rows'] : []),
    ...(absencesRead ? ['absences'] : []),
  ];
  const ownAbsenceProbes = [noRecord, emptyRows, bareRows];
  const ownAbsences = [
    ...new Set(
      ownAbsenceProbes.map(
        (/** @type {any} */ answer) => answer.absences[0]?.reason,
      ),
    ),
  ];

  return {
    module: ANSWER_MODULE,
    namespace: 'angularAiGuardAnswer',
    fields,
    states,
    absenceFields,
    inputFields,
    readsTheRecordsStateWord,
    copiesAFifthRowField,
    ownAbsences,
    ownAbsenceProbes: ownAbsenceProbes.length,
    answers: probes.map(([expected], index) => ({
      record: plainOf(probes[index][1]).state,
      state: expected,
      phase: plainOf(join(probes[index][1])).phase,
      guard: plainOf(join(probes[index][1])).guard,
      verdict: plainOf(join(probes[index][1])).verdict,
    })),
    counts: {
      fields: fields.length,
      states: states.length,
      absenceFields: absenceFields.length,
      inputFields: inputFields.length,
      ownAbsences: ownAbsences.length,
    },
  };
}

/**
 * The record as this head derives it. `head` is stated rather than derived, because the record names
 * the commit it was measured at: a read run passes the head the file carries, and the armed capture
 * passes the head it runs at.
 * @param {string} head @returns {Record<string, any>}
 */
function derive(head) {
  const shapes = guardRecordShape();
  const answer = guardAnswerShape();
  const shared = shapes.states.filter((state) => answer.states.includes(state));
  const reading = purity();
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    head,
    headCommand: HEAD_COMMAND,
    commands: [
      { command: HEAD_COMMAND, output: head },
      {
        command: ARMED_COMMAND_WINDOWS,
        output: `capture run: ran both modules in a bare context at ${head} and wrote ${RECORD_REL} byte-exactly; the suite then asserted the file it wrote`,
      },
    ],
    records: [
      {
        path: RECORD_MODULE,
        task: 'T001',
        carries:
          'the guard record the milestone joins against: one object of three fields — `state`, `rows` and `absences` — where each row carries the phase the guard ran in, the guard its own verdict named, the verdict it stated and the route’s own configured path, in arrival order, and each absence row names the field, the path it sits at and the reason. The four phases are the four words the router’s configuration carries and the two verdicts are the two a guard’s own result states; a word outside either set places nothing, with the absence that says which case it is, and no nearer phase and no neighbouring row is substituted for it (N1, E2).',
        shape: shapes,
      },
      {
        path: ANSWER_MODULE,
        task: 'T002',
        carries:
          'the join the panel renders: a pure function of one guard record, answering one object of five fields — `state`, `phase`, `guard`, `verdict` and `absences` — in every state, with `phase` and `guard` filled only from fields the record carries and otherwise null, the first refusal in arrival order named as the one that cancelled the navigation, a verdict that names a phase and no guard answered `guard-phase-only` rather than attributed to the route that matched afterwards, and the record’s own absences copied as stated and filtered to the answered row. It adds no remedy, no cause and no identity it was not given (N4, E8).',
        shape: answer,
      },
    ],
    purity: reading,
    sharedStates: shared,
    inventory: {
      measured:
        'This map measures the two artefacts the milestone ships and nothing under `research/raw/`: the guard record T001 writes (`extension/guard-phase.js`) and the join T002 publishes (`extension/guard-answer.js`), each read by running the shipped module in a bare context at the head stated above. The panel surface T003 rendered is a pane and its copy records rather than a record under `research/raw/`, so it is not named here, and the claim list T004 published is the one record of this milestone that sits beside this map: it reads those artefacts rather than being an input to this one, so it is named outside the map below.',
      outsideTheMap: [
        {
          path: OWED_CLAIMS,
          why: 'the verdict-claims record T004 publishes — one claim per criterion this milestone’s intent declares, each quoting the criterion and naming the suite and test that prove it at this head; it reads this milestone’s artefacts rather than being measured by this map, and its own census `scripts/guard-verdict-claims.test.mjs` writes and reads it back (T004).',
        },
      ],
    },
    capture: {
      task: TASK,
      command: ARMED_COMMAND,
      windowsCommand: ARMED_COMMAND_WINDOWS,
      check: CHECK_COMMAND,
      records: RECORD_REL,
      head,
      measuredPaths: [...MEASURED_PATHS],
      reads:
        'both modules are run in a bare `node:vm` context and their published shapes read back: the record’s field lists, the row and absence rows’ field lists, the four phases and two verdicts it exports, one record of four observations and the rows it answered in arrival order, the four states four records established, the seven absence reasons three records produced, and the join’s five fields, four states, absence fields, the two record fields it reads, the state word it does not read and the three records each answering its own absence. No page is opened, no browser is started and nothing is built.',
      reading:
        'an armed run derives the whole record again, writes only when a value moved, and states no head but the one it ran at; a default run derives the same record at the head the file names and asserts the committed bytes are exactly that serialization, so a value that moved is named by path and field and the record cannot drift from the tree without failing. A head that predates a change in a file this record measures is refused, naming both heads (SC4).',
    },
    verdict: verdictOf(shapes, answer, shared, reading),
  };
}

/**
 * The record's one-sentence verdict, built from the measured sections rather than typed: a sentence
 * written here would keep claiming the counts of the head it was written at.
 * @param {Record<string, any>} shapes @param {Record<string, any>} answer
 * @param {string[]} shared @param {{ found: string[] }} reading @returns {string}
 */
function verdictOf(shapes, answer, shared, reading) {
  return [
    `the record ${RECORD_MODULE} answers ${String(shapes.counts.fields)} fields with ${String(shapes.counts.rowFields)} in a row, in ${String(shapes.counts.states)} states, and it names ${String(shapes.counts.absenceReasons)} absences, each one a record here produced`,
    `the join ${ANSWER_MODULE} answers ${String(answer.counts.fields)} fields in ${String(answer.counts.states)} states, and the ${String(shared.length)} state word(s) it shares with the record are ${shared.join(' and ')}`,
    `and neither module reaches a page, a console line, a clock or a neighbouring record (${String(reading.found.length)} forbidden token(s) found in both)`,
  ]
    .join('; ')
    .concat('.');
}

/** The record as bytes, exactly as the capture writes them. @param {string} head @returns {string} */
function serialize(head) {
  return canonical(derive(head));
}

/** @returns {Record<string, any>} */
function loadRecord() {
  assert.ok(
    existsSync(RECORD_PATH),
    `${RECORD_REL} is missing - the map has never been captured: run \`${ARMED_COMMAND}\` once, then keep the file`,
  );
  return JSON.parse(readFileSync(RECORD_PATH, 'utf8'));
}

// ------------------------------------------------------------------- checks ----

/**
 * The record the read pins assert on: one record against the bytes this head derives at the head the
 * record names, naming the file and the first field that moved. Callable on a doctored copy, so a
 * mutant is caught by the same pin the committed file passes.
 * @param {Record<string, any>} record @returns {void}
 */
function assertDerived(record) {
  const head = String(record.head ?? '');
  const difference = firstDifference(record, derive(head), '');
  assert.equal(
    difference,
    '',
    `${RECORD_REL} is not what this head derives: ${difference} - re-capture with ${ARMED_COMMAND} at this head`,
  );
  assert.equal(
    canonical(record),
    serialize(head),
    `${RECORD_REL} is not serialized as the capture writes it, so a re-capture would move bytes the values do not`,
  );
}

/**
 * The head rule: a record measured at a commit this history does not carry, or at one that predates
 * a change in a file the record measures, states a tree this checkout is not. Both refusals name the
 * recorded head and this head (SC4).
 * @param {any} record @returns {void}
 */
function refuseStaleHead(record) {
  const head = String(record?.head ?? '');
  const current = gitHead();
  assert.match(
    head,
    /^[0-9a-f]{40}$/,
    `${RECORD_REL} must name one full commit sha as its head, and it names ${JSON.stringify(head)}`,
  );
  assert.ok(
    headIsAncestor(head),
    `${RECORD_REL} was captured at ${head}, and this checkout at ${current} does not carry that commit: a record that names a commit no branch carries measures nothing this history holds`,
  );
  const moved = changedSince(head);
  assert.deepEqual(
    moved,
    [],
    `${RECORD_REL} was captured at ${head} and this head is ${current}: ${moved.join(', ')} changed after it was measured, so the record states a tree this checkout is not - re-capture with ${ARMED_COMMAND} at ${current}`,
  );
}

/** The armed capture: derive, compare, write only when a value moved. @returns {{ wrote: boolean, moved: string, after: string }} */
function capture() {
  const present = existsSync(RECORD_PATH);
  const text = present ? readFileSync(RECORD_PATH, 'utf8') : '';
  const head = gitHead();
  const candidate = serialize(head);
  if (present && text === candidate)
    return { wrote: false, moved: '', after: digest(text) };
  const moved = present
    ? `the record moved: ${JSON.stringify(
        firstDifference(JSON.parse(text), JSON.parse(candidate), ''),
      )}`
    : 'the record had not been written';
  // Never write a record that would fail its own derivation.
  assertDerived(JSON.parse(candidate));
  writeFileSync(RECORD_PATH, candidate);
  return {
    wrote: true,
    moved,
    after: digest(readFileSync(RECORD_PATH, 'utf8')),
  };
}

/** @type {{ wrote: boolean, moved: string, after: string } | null} */
const CAPTURED = ARMED ? capture() : null;

if (CAPTURED !== null)
  console.log(
    CAPTURED.wrote
      ? `armed run wrote ${RECORD_REL} (${CAPTURED.moved})`
      : 'armed run: nothing moved, nothing written',
  );

// -------------------------------------------------------------------- tests ----

test('a default run is a read: the record is exactly what this head derives, and a moved field is named', () => {
  const recorded = loadRecord();
  if (CAPTURED !== null) {
    const after = digest(readFileSync(RECORD_PATH));
    assert.equal(
      after,
      CAPTURED.after,
      'the bytes the armed run reports are not the bytes on disk',
    );
    assert.equal(
      capture().wrote,
      false,
      'a second armed run wrote, and nothing had moved',
    );
    assert.equal(
      digest(readFileSync(RECORD_PATH)),
      after,
      'a second armed run changed the record, so the re-capture is not idempotent',
    );
  }
  assertDerived(loadRecord());

  // The mutant the criterion is written about: one counted field moved, without a re-capture. The
  // unmutated record passes the same pin above, so the red below is the mutation and not drift.
  const planted = structuredClone(recorded);
  const counted = planted.records?.[0]?.shape?.counts;
  assert.ok(
    counted !== undefined,
    'the record must carry the counted fields the mutant moves',
  );
  counted.absenceReasons += 1;
  assert.notEqual(
    firstDifference(planted, recorded, ''),
    '',
    'the planted record must differ from the captured one, or the mutant is a no-op',
  );
  let failure = null;
  try {
    assertDerived(planted);
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    'a moved counted field must redden, and it passed',
  );
  assert.ok(
    failure.message.includes(RECORD_REL),
    `the refusal must name the record it refuses; it said ${JSON.stringify(failure.message.slice(0, 240))}`,
  );
  assert.ok(
    failure.message.includes('records[0].shape.counts.absenceReasons'),
    `the refusal must name the field that moved; it said ${JSON.stringify(failure.message.slice(0, 240))}`,
  );
  console.log(`counted-field mutant: ${failure.message.split('\n')[0]}`);
});

test('the record names the head it was measured at, and a record measured at another head refuses to land naming both', () => {
  const recorded = loadRecord();
  assert.match(
    recorded.head,
    /^[0-9a-f]{40}$/,
    `head is not one full sha: ${JSON.stringify(recorded.head)}`,
  );
  // The committed record is measured at a head that carries this tree: no measured file moved after
  // it. This is the pin the mutant below is run against, so it is asserted before the mutant bites.
  assert.doesNotThrow(() => refuseStaleHead(recorded));
  assert.equal(
    headIsAncestor('0'.repeat(40)),
    false,
    'the reachability rule does not bite: a sha no object carries must be refused',
  );

  // A record captured before the last change to a file it measures: the head the capture would have
  // named had it run one commit earlier.
  const { last, beforeLast } = lastChangeOf(ANSWER_MODULE);
  const stale = structuredClone(recorded);
  stale.head = beforeLast;
  stale.commands[0].output = beforeLast;
  let failure = null;
  try {
    refuseStaleHead(stale);
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${ANSWER_MODULE} changed at ${last.slice(0, 8)}, so a record naming ${beforeLast.slice(0, 8)} must refuse to land`,
  );
  assert.ok(
    failure.message.includes(beforeLast),
    `the refusal must name the head the record was captured at; it said ${JSON.stringify(failure.message.slice(0, 320))}`,
  );
  assert.ok(
    failure.message.includes(gitHead()),
    `the refusal must name this head; it said ${JSON.stringify(failure.message.slice(0, 320))}`,
  );
  assert.ok(
    failure.message.includes(ANSWER_MODULE),
    `the refusal must name the file that moved; it said ${JSON.stringify(failure.message.slice(0, 320))}`,
  );
  console.log(`stale-head mutant: ${failure.message.split('\n')[0]}`);
});

test('commands[0] is `git rev-parse HEAD`, and the command that captured the record names this suite and its flag', () => {
  const recorded = loadRecord();
  assert.equal(
    recorded.commands[0].command,
    HEAD_COMMAND,
    `${RECORD_REL} must record the command its head came from first`,
  );
  assert.equal(
    recorded.commands[0].output,
    recorded.head,
    'the rev-parse output and the head field must be one value',
  );
  assert.equal(
    recorded.headCommand,
    HEAD_COMMAND,
    'the record states the command its head was read by',
  );
  assert.equal(
    recorded.capture.command,
    ARMED_COMMAND,
    `${RECORD_REL} must name the command that armed this suite as its capture`,
  );
  assert.ok(
    recorded.capture.command.includes(SUITE_REL),
    `the capture command must name the suite that writes the record, and it names ${JSON.stringify(recorded.capture.command)}`,
  );
  assert.equal(
    recorded.capture.check,
    CHECK_COMMAND,
    'the capture block names the read-only command',
  );
  assert.equal(
    recorded.capture.records,
    RECORD_REL,
    'the record must name the file it is',
  );
  assert.deepEqual(
    recorded.capture.measuredPaths,
    [...MEASURED_PATHS],
    'the record must state the paths its shape is measured from',
  );
});

test('the record states its own capture command, and the suite it names carries this record’s path and the flag', () => {
  const recorded = loadRecord();
  const command = String(recorded.capture?.command ?? '');
  const suite = /(scripts\/[\w.-]+\.test\.mjs)/.exec(command)?.[1] ?? '';
  const flag = /M\d{3}_CAPTURE/.exec(command)?.[0] ?? '';
  assert.equal(
    suite,
    SUITE_REL,
    `the capture command must name one suite this checkout carries, and it named ${JSON.stringify(suite)}`,
  );
  assert.equal(
    flag,
    CAPTURE_ENV,
    `the capture command must arm the flag the suite reads, and it named ${JSON.stringify(flag)}`,
  );
  assert.ok(
    existsSync(join(REPO_ROOT, ...suite.split('/'))),
    `${suite} is a file this checkout carries`,
  );
  const source = read(suite);
  assert.ok(
    source.includes(RECORD_REL),
    `${suite} must name the record its command captures, so a record held to its own census is excused by the suite that writes it (${RECORD_REL})`,
  );
  assert.ok(
    source.includes(flag),
    `${suite} must read the flag the command arms (${flag}), or the command states an arming that does not happen`,
  );
});

test('the inventory names the record this milestone owes outside itself, and names no other', () => {
  const recorded = loadRecord();
  const outside = recorded.inventory?.outsideTheMap;
  assert.ok(
    Array.isArray(outside) && outside.length > 0,
    `${RECORD_REL} must state the records it does not measure`,
  );
  assert.deepEqual(
    outside.map((/** @type {any} */ entry) => entry.path),
    [OWED_CLAIMS],
    `this map may name only the record this milestone owes, and it names ${JSON.stringify(outside.map((/** @type {any} */ entry) => entry.path))}`,
  );
  for (const entry of outside) {
    assert.ok(
      /T00\d/.test(String(entry.why)),
      `the why for ${String(entry.path)} must cite the task that writes it`,
    );
  }
  assert.ok(
    !outside.some((/** @type {any} */ entry) => entry.path === RECORD_REL),
    'a map that names itself outside itself would excuse its own absence',
  );
});

test('each recorded shape is what the module publishes when it is run now, field by field', () => {
  const recorded = loadRecord();
  const fresh = [guardRecordShape(), guardAnswerShape()];
  const recordedShapes = (recorded.records ?? []).map(
    (/** @type {any} */ entry) => entry.shape,
  );
  assert.deepEqual(
    recordedShapes,
    fresh,
    `the shapes this head derives by running the two modules must be the shapes the record carries, and they differ first at ${firstDifference(recordedShapes, fresh, 'records')}`,
  );
  for (const [index, entry] of (recorded.records ?? []).entries())
    assert.equal(
      entry.path,
      MEASURED_PATHS[index],
      `records[${String(index)}] names the module it measured, and it names ${String(entry.path)}`,
    );
  const [recordShape, answerShape] = recordedShapes;
  assert.deepEqual(
    recordShape.rowFields,
    [...sandboxOf(RECORD_MODULE).angularAiGuardPhase.ROW_FIELDS],
    `the row fields the record states are the row fields the module exports`,
  );
  assert.deepEqual(
    Object.keys(answerShape.answers[0] ?? {}),
    ['record', 'state', 'phase', 'guard', 'verdict'],
    'each recorded answer names the record it was handed and the four fields of the answer it got',
  );
});

test('neither module reaches a page, a console line, a clock or a neighbouring record', () => {
  const recorded = loadRecord();
  const fresh = purity();
  assert.deepEqual(
    recorded.purity,
    fresh,
    `the reach scan must be the scan this head makes: the record says ${JSON.stringify(recorded.purity?.found)} and this head found ${JSON.stringify(fresh.found)}`,
  );
  assert.deepEqual(
    recorded.purity.found,
    [],
    `a record with no page, no console, no clock and no neighbour is a measurement, and this head found ${JSON.stringify(recorded.purity.found)}`,
  );
  const modules = recorded.records.map(
    (/** @type {any} */ entry) => entry.shape.module,
  );
  assert.deepEqual(
    modules,
    [...MEASURED_PATHS],
    'the record names the two modules it measured and no third',
  );
  for (const entry of recorded.records)
    assert.notEqual(
      entry.shape.namespace,
      recorded.records.find((/** @type {any} */ other) => other !== entry)
        ?.shape.namespace,
      'each module publishes its own namespace, so one reading is not two',
    );
});

test('the state words the two modules share are the words this head derives, and nothing else', () => {
  const recorded = loadRecord();
  const [recordShape, answerShape] = recorded.records.map(
    (/** @type {any} */ entry) => entry.shape,
  );
  assert.deepEqual(
    recorded.sharedStates,
    recordShape.states.filter((/** @type {string} */ state) =>
      answerShape.states.includes(state),
    ),
    'the shared state words are the intersection of the two modules’ own lists, computed rather than typed',
  );
  assert.ok(
    recorded.sharedStates.length > 0,
    'the join reads the record it joins, so at least one state word is shared',
  );
  for (const state of answerShape.states)
    assert.ok(
      typeof state === 'string' && state !== '',
      'every state the join answers is a word and not a hole',
    );
});

test('the record carries no numeric bytes field, so the prose byte-consistency scan skips it', () => {
  const recorded = loadRecord();
  /** @type {string[]} */
  const fields = [];
  /** @param {unknown} value @param {string} path */
  const walk = (value, path) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, `${path}[${String(index)}]`));
      return;
    }
    if (value !== null && typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        const child = path === '' ? key : `${path}.${key}`;
        if (/bytes/i.test(key) && typeof item === 'number') fields.push(child);
        walk(item, child);
      }
    }
  };
  walk(recorded, '');
  assert.deepEqual(
    fields,
    [],
    'a numeric bytes field would pull this record into the byte-consistency corpus while its prose states a different total',
  );
});

test('the armed run is the only writer, and a default run leaves the file it read alone', () => {
  const recorded = loadRecord();
  const before = digest(readFileSync(RECORD_PATH));
  if (CAPTURED !== null)
    assert.equal(
      recorded.capture.task,
      TASK,
      'the capture block names the task that ran it',
    );
  assertDerived(recorded);
  assert.equal(
    digest(readFileSync(RECORD_PATH)),
    before,
    `${RECORD_REL} changed during this run, so a read is not a read`,
  );
  console.log(
    `${RECORD_REL}: ${String((recorded.records ?? []).length)} measured module(s), ${String(recorded.sharedStates.length)} shared state word(s), ${String(recorded.purity.found.length)} forbidden token(s) found at ${String(recorded.head).slice(0, 8)}`,
  );
  console.log(recorded.verdict);
});
