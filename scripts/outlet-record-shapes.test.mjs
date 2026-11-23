// @ts-check
// Run: node --test scripts/outlet-record-shapes.test.mjs
// Armed (the only writer this milestone has):
//   M062_CAPTURE=1 node --test scripts/outlet-record-shapes.test.mjs
// On Windows, where the shell is cmd.exe:
//   set "M062_CAPTURE=1"&& node --test scripts/outlet-record-shapes.test.mjs
//
// M062 T005 re-derives this milestone's own map: `research/raw/m062-record-shapes.json` states the
// shape of the two artefacts the milestone ships, `extension/outlet-state.js` (the outlet record
// T001 writes) and `extension/outlet-answer.js` (the join T002 publishes), and nothing this head
// does not carry.
//
// The record is measured, not typed. Every shape it states is read by running the shipped module in
// a bare `node:vm` context and reading back what it published: the record's own field lists and the
// route and absence rows' field lists come from one record the T001 module produced, its three
// states and seven absence reasons from the namespace that module exports, the route cap from a
// chain deeper than it admits, and the join's five fields, four states and two own absences from
// four records handed to the function T002 publishes. Nothing here reads the panel, the route table
// or a page.
//
// Three rules hold the record to this tree:
//
//   the read      a default run derives the whole record again and asserts the committed bytes are
//                 exactly that serialization, so a value that moved is named by path and field
//                 rather than found by a reader (SC1: a mutant that moves one counted field without
//                 re-capturing reddens naming the record).
//   the head      the record names the commit it was measured at. A record whose head is a commit
//                 this history does not carry measures nothing, and a record whose head predates a
//                 change in a file it measures states a tree this checkout is not: both refusals
//                 name the recorded head and this head (SC4).
//   the census    the map measures no verdict-claims or surface record. It names the one record
//                 this milestone owes outside itself — the claim list T004 publishes — and it states
//                 its own capture command, so the suite that command names carries this record's
//                 path and the flag the command arms (the rule `scripts/tutor-record-shapes.test.mjs`
//                 and `scripts/tutor-answer.test.mjs` apply to a record its own census holds).
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
const RECORD_REL = 'research/raw/m062-record-shapes.json';
const SUITE_REL = 'scripts/outlet-record-shapes.test.mjs';
const RECORD_PATH = join(REPO_ROOT, ...RECORD_REL.split('/'));

/** The milestone, the task and the schema the record states. */
const MILESTONE = 'M062';
const TASK = 'T005';
const SCHEMA = 'm062-record-shapes/v1';
const TITLE = "Re-derive this milestone's own records";

/** The two modules this record measures: the record T001 writes and the join T002 publishes. */
const STATE_MODULE = 'extension/outlet-state.js';
const ANSWER_MODULE = 'extension/outlet-answer.js';
const MEASURED_PATHS = Object.freeze([STATE_MODULE, ANSWER_MODULE]);

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const ARMED_COMMAND = `M062_CAPTURE=1 ${CHECK_COMMAND}`;
const ARMED_COMMAND_WINDOWS = `set "M062_CAPTURE=1"&& ${CHECK_COMMAND}`;
const CAPTURE_ENV = 'M062_CAPTURE';
const HEAD_COMMAND = 'git rev-parse HEAD';
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** The one record this milestone owes that this map does not measure. */
const OWED_CLAIMS = `research/raw/${MILESTONE.toLowerCase()}-verdict-claims.json`;

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
 * One activated-route node in the shape the agent hands the reader: the outlet name the state
 * matched, the outlet the route configuration requested, and the configured path. `requested` is
 * `undefined` where the configuration states no outlet, which is the absence the record names.
 * @param {string | undefined} matched @param {string | undefined} requested
 * @param {string} path @param {any[]} [children] @returns {any}
 */
function node(matched, requested, path, children = []) {
  return {
    outlet: matched,
    routeConfig: { path, outlet: requested },
    children,
  };
}

/** The record `extension/outlet-state.js` states, read by running it. @returns {Record<string, any>} */
function outletRecordShape() {
  const module = sandboxOf(STATE_MODULE);
  const api = module.angularAiOutletState;
  assert.equal(
    typeof api?.outletState,
    'function',
    `${STATE_MODULE} must publish outletState on angularAiOutletState, and it published ${typeof api?.outletState}`,
  );

  // A root route the state matched as `primary` and the configuration named no outlet for, carrying
  // two named-outlet children: one both sides call `sidebar`, and one the configuration requested as
  // `panel` while the state matched `sidebar`. The record's own three fields, a route row's three
  // fields and an absence row's three fields are read from what the module answered.
  const twoOutlets = api.outletState({
    state: {
      root: node('primary', undefined, '', [
        node('sidebar', 'sidebar', 'admin'),
        node('sidebar', 'panel', 'panel'),
      ]),
    },
  });
  assert.equal(
    twoOutlets.routes.length,
    3,
    `the record must carry one row per activated route and it carried ${String(twoOutlets.routes.length)}`,
  );
  assert.equal(
    twoOutlets.routes[1]?.requested,
    'sidebar',
    `a route row must carry the outlet its configuration requested, and it carried ${JSON.stringify(twoOutlets.routes[1]?.requested)}`,
  );
  assert.equal(
    twoOutlets.routes[2]?.matched,
    'sidebar',
    `a route row must carry the outlet name the state matched, and it carried ${JSON.stringify(twoOutlets.routes[2]?.matched)}`,
  );

  // A chain deeper than the reader admits: the cap is the number of rows it answered rather than a
  // number this suite remembers, and the truncated chain is named as the absence it is.
  let deep = node('primary', 'primary', '');
  for (let index = 0; index < 70; index += 1)
    deep = node(undefined, undefined, `p${String(index)}`, [deep]);
  const truncated = api.outletState({ state: { root: deep } });
  const chainReasons = truncated.absences
    .filter((/** @type {any} */ row) => row.field === 'route')
    .map((/** @type {any} */ row) => row.reason);

  const fields = Object.keys(twoOutlets);
  const routeFields = Object.keys(twoOutlets.routes[0] ?? {});
  const absenceFields = Object.keys(twoOutlets.absences[0] ?? {});
  const states = [...api.STATES];
  const absenceReasons = [...api.ABSENCES];

  assert.deepEqual(
    [...api.ROUTE_FIELDS],
    routeFields,
    `the route fields ${STATE_MODULE} exports must be the fields its rows carry: it exports ${JSON.stringify(api.ROUTE_FIELDS)} and a row carries ${JSON.stringify(routeFields)}`,
  );

  return {
    module: STATE_MODULE,
    namespace: 'angularAiOutletState',
    fields,
    routeFields,
    absenceFields,
    states,
    absenceReasons,
    routeLimit: truncated.routes.length,
    sample: {
      route:
        "a root route the state matched as 'primary' whose configuration named no outlet, carrying two named-outlet children: one both sides call 'sidebar', and one the configuration requested as 'panel' while the state matched 'sidebar'",
      state: twoOutlets.state,
      routes: twoOutlets.routes,
      absences: twoOutlets.absences,
    },
    truncated: {
      routes: truncated.routes.length,
      chainReasons,
      namesTheCap: chainReasons.includes('chain-truncated'),
    },
    counts: {
      fields: fields.length,
      routeFields: routeFields.length,
      absenceFields: absenceFields.length,
      states: states.length,
      absenceReasons: absenceReasons.length,
      routeLimit: truncated.routes.length,
    },
  };
}

/** The shape `extension/outlet-answer.js` publishes, read by running it. @returns {Record<string, any>} */
function answerShape() {
  const module = sandboxOf(ANSWER_MODULE);
  const join = module.angularAiOutletAnswer;
  assert.equal(
    typeof join,
    'function',
    `${ANSWER_MODULE} must publish outletAnswer on angularAiOutletAnswer, and it published ${typeof join}`,
  );

  // One record per state the contract names, each establishing that state and nothing beside it.
  const probes = [
    [
      'outlet-matched',
      {
        routes: [{ requested: 'sidebar', matched: 'sidebar', path: 'admin' }],
        absences: [],
      },
    ],
    [
      'outlet-unnamed-primary',
      {
        routes: [{ requested: null, matched: 'primary', path: '' }],
        absences: [],
      },
    ],
    [
      'outlet-absent',
      {
        routes: [{ requested: 'sidebar', matched: 'primary', path: 'admin' }],
        absences: [],
      },
    ],
    [
      'cannot-tell',
      {
        routes: [{ requested: 'sidebar', matched: null, path: 'admin' }],
        absences: [
          { field: 'matched', path: 'admin', reason: 'outlet-name-absent' },
        ],
      },
    ],
  ];
  const observed = probes.map(([, input]) => join(input).state);
  assert.deepEqual(
    observed,
    probes.map(([expected]) => expected),
    `the join must answer the four states the contract names: handed four records, one per state, it answered ${JSON.stringify(observed)}`,
  );

  const answered = join(probes[3][1]);
  const fields = Object.keys(answered);
  const absenceFields = Object.keys(answered.absences[0] ?? {});
  const noRecord = join({});
  const noRow = join({ routes: [] });
  const unnamed = join({
    routes: [{ requested: null, matched: 'primary', path: '' }],
  });
  assert.equal(
    unnamed.requested,
    'primary',
    `an absent request must be reported as primary, and the answer said ${JSON.stringify(unnamed.requested)}`,
  );

  return {
    module: ANSWER_MODULE,
    namespace: 'angularAiOutletAnswer',
    fields,
    states: observed,
    absenceFields,
    primary: unnamed.requested,
    ownAbsences: [noRecord.absences[0]?.reason, noRow.absences[0]?.reason],
    cannotTellKeepsTheRecordsAbsence: answered.absences.map(
      (/** @type {any} */ row) => `${String(row.field)}:${String(row.reason)}`,
    ),
    counts: {
      fields: fields.length,
      states: observed.length,
      absenceFields: absenceFields.length,
      ownAbsences: [noRecord, noRow].length,
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
  const outletRecord = outletRecordShape();
  const answer = answerShape();
  return {
    schema: SCHEMA,
    milestone: MILESTONE,
    task: TASK,
    title: TITLE,
    head,
    commands: [
      { command: HEAD_COMMAND, output: head },
      {
        command: ARMED_COMMAND_WINDOWS,
        output: `capture run: ran both modules in a bare context at ${head} and wrote ${RECORD_REL} byte-exactly; the suite then asserted the file it wrote`,
      },
    ],
    records: [
      {
        path: STATE_MODULE,
        task: 'T001',
        carries:
          'the outlet record the milestone joins against: one object of three fields — `state`, `routes` and `absences` — where each route row carries the outlet the route configuration requested, the outlet name the router state matched and that route\u2019s own configured path, and each absence row names the field, the path it sits at and the reason. The names are recorded as the state stated them and no field is completed: an unnamed request is the absence `outlet-not-requested` here, never `primary`, and that equivalence is the join\u2019s own stated decision (C2).',
        shape: outletRecord,
      },
      {
        path: ANSWER_MODULE,
        task: 'T002',
        carries:
          'the join the panel renders: a pure function of one outlet record, answering one object of five fields — `state`, `requested`, `matched`, `path` and `absences` — in every state, with `requested` and `matched` filled only from fields the record carries, an absent request reported as `primary`, and the record\u2019s own absences copied as stated and filtered to the answered route. It adds no remedy, no cause and no identity it was not given (N4, E8).',
        shape: answer,
      },
    ],
    inventory: {
      measured:
        'This map measures the two artefacts the milestone ships and nothing under `research/raw/`: the outlet record T001 writes (`extension/outlet-state.js`) and the join T002 publishes (`extension/outlet-answer.js`), each read by running the shipped module in a bare context at the head stated above. The panel surface T003 rendered is a pane and its copy record rather than a file under `research/raw/`, so it is not named here, and the claim list T004 published is the one record of this milestone that sits beside this map: it reads those artefacts rather than being an input to this one, so it is named outside the map below.',
      outsideTheMap: [
        {
          path: OWED_CLAIMS,
          why: 'the verdict-claims record T004 publishes — one claim per criterion this milestone\u2019s intent declares, each quoting the criterion and naming the suite and test that prove it at this head; it reads this milestone\u2019s artefacts rather than being measured by this map, and its own census `scripts/outlet-verdict-claims.test.mjs` writes and reads it back (T004).',
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
        'both modules are run in a bare `node:vm` context and their published shapes read back: the record\u2019s field lists, the route and absence rows\u2019 field lists, the three states and seven absence reasons the reader exports, the route cap a chain deeper than it admits answers, and the join\u2019s five fields, four states and two own absences. No page is opened and no browser is started.',
      reading:
        'an armed run derives the whole record again, writes only when a value moved, and states no head but the one it ran at; a default run derives the same record at the head the file names and asserts the committed bytes are exactly that serialization, so a value that moved is named by path and field and the record cannot drift from the tree without failing. A head that predates a change in a file this record measures is refused, naming both heads (SC4).',
    },
    verdict: '',
  };
}

/**
 * The verdict sentence, which states this file's own UTF-8 length: the length is a recorded count
 * rather than a reader's guess, and the sentence is what the suite holds the file to.
 * @param {number} byteTotal @returns {string}
 */
function verdictOf(byteTotal) {
  return `This record is ${String(byteTotal)} bytes, the UTF-8 length of the file the armed capture wrote, stated so the file's own size is a recorded number rather than a reader's guess. It carries no numeric \`bytes\` field, so the prose byte-consistency scan skips it; the sentence is held to this file's length by the suite that writes it.`;
}

/**
 * The whole record, verdict included: the stated byte count changes the length it states, so the
 * derivation iterates until the two agree. `canonical()` of the returned object is the file's bytes.
 * @param {string} head @returns {Record<string, any>}
 */
function derivedRecord(head) {
  const record = derive(head);
  let byteTotal = 0;
  for (let attempt = 0; attempt < 24; attempt += 1) {
    record.verdict = verdictOf(byteTotal);
    const measured = Buffer.byteLength(canonical(record), 'utf8');
    if (measured === byteTotal) return record;
    byteTotal = measured;
  }
  throw new Error('the stated byte total did not reach a fixed point');
}

/** The record as bytes, exactly as the capture writes them. @param {string} head @returns {string} */
function serialize(head) {
  return canonical(derivedRecord(head));
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
  const difference = firstDifference(record, derivedRecord(head), '');
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
  assert.ok(
    planted.records[0]?.shape?.counts,
    'the record must carry the counted fields the mutant moves',
  );
  planted.records[0].shape.counts.routeLimit += 1;
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
    failure.message.includes('records[0].shape.counts.routeLimit'),
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
    recorded.capture.command,
    ARMED_COMMAND,
    `${RECORD_REL} must name the command that armed this suite as its capture`,
  );
  assert.ok(
    recorded.capture.command.includes(SUITE_REL),
    `the capture command must name the suite that writes the record, and it names ${JSON.stringify(recorded.capture.command)}`,
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

test('the verdict states this file’s own length, and the file is that long', () => {
  const recorded = loadRecord();
  const match = /(\d+) bytes/.exec(String(recorded.verdict ?? ''));
  assert.ok(
    match,
    `the verdict never states an integer followed by "bytes": ${String(recorded.verdict)}`,
  );
  const stated = Number(match[1]);
  const actual = Buffer.byteLength(readFileSync(RECORD_PATH), 'utf8');
  assert.equal(
    stated,
    actual,
    `the verdict states ${String(stated)} bytes and the file is ${String(actual)}`,
  );
  console.log(
    `${RECORD_REL}: ${String(actual)} bytes at ${String(recorded.head).slice(0, 8)}, ${String(recorded.records.length)} measured module(s), 3 states and 7 reasons in the record, 5 fields and 4 states in the join`,
  );
});
