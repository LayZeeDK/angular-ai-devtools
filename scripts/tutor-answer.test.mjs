// @ts-check
// Run: node --test scripts/tutor-answer.test.mjs
//
// M055 T002 pins the milestone's two authored files and then mutates each of them in memory, one defect
// at a time, because a pin nobody has watched fail is a comment with an assertion around it.
//
// The two files it holds are `extension/tutor-index.js` — the one authored mapping this milestone owns
// (C2), rows of the question text, the criterion id and the milestone and nothing else — and
// `extension/tutor-foundations.js` — the pure join that reads the criterion-to-artefact side from the
// records' own fields and reads presence through a reader the caller injects. The index half is held to
// the records on disk at authoring time and on every run: every criterion id the index names is one the
// named record's own `claims[].criterion` fields carry, and every question no row carries is an absence
// and not a guess.
//
// T001's measurement (`research/raw/m055-record-shapes.json`) is the reality this suite builds to (C4):
// `claims[].artefactPath` is carried by 12 of the 34 verdict-claims records and by 44 claims, while 22
// records carry none of it in four different shapes. So the suite proves both halves — that the join
// answers the 44 claims that carry the field with the path the record states, and that it renders the 22
// records that carry none as `no-artefact-named`, naming the field that is missing, never as an answer
// assembled from prose and never as a path composed from a file name.
//
// The load-bearing mutant is the N5 one: a join that replaces a record's `artefactPath` with a
// hard-coded constant and still answers — right milestone, right criterion, a path the record does not
// state. The fixtures carry paths that constant cannot match, and the pin demands the rendered path
// equal the record's own field, so the milestone's central prohibition cannot pass a green suite.
//
// E4 is held out and this suite owns it. The dead-path state has no live instance to measure: all 44
// `artefactPath` values resolve at the head T001 recorded, so the missing-artefact input here is
// constructed, the recording is asserted to say so, and the state is demanded to be `missing-artefact`
// naming the record and the missing path — never `no-matching-criterion`.
//
// M057 T006 reads this milestone's own map, `research/raw/m057-record-shapes.json`, beside M055's (C2,
// C7), because two suites reading one recording by two rules is the defect M055's T004 hit twice. The
// subtraction below is the union of the paths every map read here names in `inventory.outsideTheMap`,
// read from the records themselves — never a list of paths this suite holds — and each map may name
// outside itself only the records its own milestone owes. A record present and named by no map still
// reddens naming it, so nothing is excused by adding it here.
//
// M058 T001 added its map, `research/raw/m058-record-shapes.json`, to the same read rather than to a
// second rule: it names the two records M058 owes — the surface T003 writes and the verdict-claims T004
// writes — outside itself from the start and measures no verdict-claims record of its own, so those two
// are subtracted here by name and are absent at this head with nothing read as missing.
//
// M059 T010 added its map, `research/raw/m059-record-shapes.json`, to the same read for the same
// reason: it measures no verdict-claims or surface record of its own and names the two records M059
// owes — the surface T003 writes and the verdict-claims T004 writes — outside itself, so both leave
// the census below because a recording says so and not because this suite forgot to list them.
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The two files this task authors, and the recording it measures against. */
const INDEX = 'extension/tutor-index.js';
const JOIN = 'extension/tutor-foundations.js';
const RECORDING = 'research/raw/m055-record-shapes.json';

/** Where the records live and what their file names end with. */
const RECORD_DIR = 'research/raw';
const CLAIM_SUFFIX = '-verdict-claims.json';

const INDEX_SOURCE = readFileSync(join(ROOT, INDEX), 'utf8');
const JOIN_SOURCE = readFileSync(join(ROOT, JOIN), 'utf8');
const RECORDING_DATA = JSON.parse(readFileSync(join(ROOT, RECORDING), 'utf8'));

/** This milestone's own map, read beside M055's on every run (C2, C7). */
const OWN_MAP = 'research/raw/m057-record-shapes.json';
const OWN_MAP_DATA = JSON.parse(readFileSync(join(ROOT, OWN_MAP), 'utf8'));

/** M058's map, read beside the two on every run: each milestone's map excuses its own records. */
const BESIDE_MAP = 'research/raw/m058-record-shapes.json';
const BESIDE_MAP_DATA = JSON.parse(
  readFileSync(join(ROOT, BESIDE_MAP), 'utf8'),
);

/**
 * M059's map, read beside the three on every run: it names the two records M059 owes, the surface T003
 * writes and the verdict-claims T004 writes, so the census below subtracts them by the map's own words
 * rather than by a path listed here.
 */
const SECOND_BESIDE_MAP = 'research/raw/m059-record-shapes.json';
const SECOND_BESIDE_MAP_DATA = JSON.parse(
  readFileSync(join(ROOT, SECOND_BESIDE_MAP), 'utf8'),
);

/** Every map the census is read from, in the order the maps were measured. */
const MAPS = [
  RECORDING_DATA,
  OWN_MAP_DATA,
  BESIDE_MAP_DATA,
  SECOND_BESIDE_MAP_DATA,
];

/**
 * The two records each milestone owes, and so the only paths its map may name outside itself: a map
 * may excuse its own record and never another milestone's, which is what keeps a third record from
 * being excused by naming it in a recording.
 */
const PINNED_OUTSIDE = Object.freeze({
  M055: [
    'research/raw/m055-surface.json',
    'research/raw/m055-verdict-claims.json',
  ],
  M057: [
    'research/raw/m057-surface.json',
    'research/raw/m057-verdict-claims.json',
  ],
  M058: [
    'research/raw/m058-surface.json',
    'research/raw/m058-verdict-claims.json',
  ],
  M059: [
    'research/raw/m059-surface.json',
    'research/raw/m059-verdict-claims.json',
  ],
});

/** A row's three fields, sorted: exactly these and nothing else (N5). */
const ROW_FIELDS = ['criterion', 'milestone', 'question'];

/** The three structural fields an answer reads. */
const READ_FIELDS = {
  milestone: 'milestone',
  criterion: 'claims[].criterion',
  artefactPath: 'claims[].artefactPath',
};

/**
 * The fields the derivation writes as one template across milestones: never read (N1, C3). `artefact`
 * is scanned as a property access of its own — `/\.artefact\b/` — because the field the join does read,
 * `claims[].artefactPath`, carries the word inside it.
 */
const NEVER_READ_FIELDS = ['reason', 'reading'];

/** The contract's five states, in the order it lists them. */
const STATES = [
  'answered',
  'no-matching-criterion',
  'no-artefact-named',
  'records-unreadable',
  'missing-artefact',
];

/** The three absences SC2 requires stated distinctly (E3, N2). */
const ABSENCES = [
  'no-matching-criterion',
  'no-artefact-named',
  'records-unreadable',
];

/** A file-extension-shaped token: a path or a file name, whichever way it is spelled. */
const FILE_SHAPED =
  /\b[\w@-]+\.(?:js|mjs|cjs|ts|tsx|json|md|html|css|txt|ya?ml|log)\b/i;

/** A repository-relative path, by the top-level directory it starts with. */
const REPO_PATH =
  /(?:research|scripts|apps|extension|packages|src|tests|\.project)\//;

/** The template sentence the derivation shares word for word across milestones (C3). */
const PROSE_POISON =
  "a fact about this repository's own gate, its recordings and the tests that hold them, which no route of any page produces";

/** A file the derivation's prose names and the record's own fields do not: the decoy for N1. */
const DECOY = 'research/raw/decoy-template-prose.json';

/** The two paths the fixtures state: one names a recording, one names a suite (E1). */
const RECORDING_PATH = 'research/raw/fixture-recording.json';
const SUITE_PATH = 'scripts/fixture-suite.test.mjs';

// ------------------------------------------------------------------------------------------------
// Loading: both files as they sit on disk, evaluated in a bare context, plus the records on disk.
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

/** The first whitespace-delimited token of a milestone field, as the join reads one. */
/** @param {unknown} value */
function firstToken(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  const space = trimmed.search(/\s/);
  return space === -1 ? trimmed : trimmed.slice(0, space);
}

/** `extension/tutor-index.js` as it sits on disk, or as this file mutates it in memory. */
/** @param {string} [source] */
function loadIndex(source = INDEX_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiTutorIndex;
  assert.ok(api, `${INDEX} publishes angularAiTutorIndex`);
  return api;
}

/** `extension/tutor-foundations.js` as it sits on disk, or as this file mutates it in memory. */
/** @param {string} [source] */
function loadJoin(source = JOIN_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiTutorFoundations;
  assert.ok(api, `${JOIN} publishes angularAiTutorFoundations`);
  assert.equal(
    typeof api.tutorAnswer,
    'function',
    `${JOIN} exports tutorAnswer`,
  );
  return api;
}

/** Every verdict-claims record on disk, in file-name order, with the path it is read from. */
const presentRecords = readdirSync(join(ROOT, RECORD_DIR))
  .filter((name) => name.endsWith(CLAIM_SUFFIX))
  .sort()
  .map((name) => ({
    path: RECORD_DIR + '/' + name,
    record: JSON.parse(readFileSync(join(ROOT, RECORD_DIR, name), 'utf8')),
  }));

/**
 * The paths one recording names in `inventory.outsideTheMap`: the records it measured its map
 * before, which it names on purpose rather than omitting. A map that carries no inventory at all
 * names nothing outside itself, which is a statement too — it measures no record yet.
 * @param {any} recording the map to read
 * @returns {string[]}
 */
function outsideTheMapOf(recording) {
  const named = recording.inventory?.outsideTheMap ?? [];
  return named.map((/** @type {any} */ entry) => entry.path);
}

/**
 * The paths the maps name outside themselves: the whole subtraction, read from the records. Each
 * map contributes only what its own recording states, so a path is subtracted because a recording says
 * so and never because this suite lists it.
 * @returns {string[]}
 */
function outsideTheMap() {
  const all = [];
  for (const map of MAPS)
    for (const path of outsideTheMapOf(/** @type {any} */ (map)))
      all.push(path);
  return [...new Set(all)];
}

/**
 * The records one map measures, by the lists its inventory carries. A map that carries no inventory
 * measures nothing, so every record present in its own milestone would have to be named outside it.
 * @param {any} recording
 * @returns {string[]}
 */
function measuredByMap(recording) {
  return [
    ...(recording.inventory?.verdictClaims?.paths ?? []),
    ...(recording.inventory?.surface?.paths ?? []),
  ];
}

/** The milestone a record's own file name states, e.g. `M055`. */
/** @param {string} path */
function milestoneOf(path) {
  const found = /m(\d{3})-/.exec(path);
  return found === null ? '' : 'M' + found[1];
}

/**
 * The named-outside set, pinned per milestone and read from the maps (C2, C7). Three rules, applied to
 * every recording by one code path because two suites reading one recording by two rules is the defect
 * this task repairs:
 *
 *   only its own   a map may name outside itself only a record its own milestone owes — a path the
 *                  pinned pair of that milestone holds — so a third record cannot be excused by
 *                  editing a recording, and a record another map measures cannot be subtracted here.
 *   nothing unmeasured
 *                  a record of that milestone which is present and which its map does not measure must
 *                  be named outside it, so nothing a milestone lands reads as an unmeasured record and
 *                  the refusal names the record rather than a bare count.
 *   read, not listed
 *                  the set subtracted below is what the recordings state, so a path leaves the census
 *                  because a map says so and never because this suite forgot to list it.
 * @param {{path: string, record: any}[]} [present] the records present, by default read from disk
 * @param {any[]} [maps] the maps to hold, by default the maps on disk
 */
function pinNamedOutside(present = presentRecords, maps = MAPS) {
  for (const map of maps) {
    const pinned =
      PINNED_OUTSIDE[
        /** @type {'M055'|'M057'|'M058'|'M059'} */ (map.milestone)
      ] ?? [];
    const named = outsideTheMapOf(map);
    for (const path of named)
      assert.ok(
        pinned.includes(path),
        `${map.milestone}'s own map names ${path} outside itself, and the records ${map.milestone} owes are ${pinned.join(', ')}: a map may excuse only its own record, so a third record cannot be excused by naming it outside a recording and a record another map measures is never subtracted here`,
      );
    const measured = measuredByMap(map);
    for (const entry of present)
      if (
        milestoneOf(entry.path) === map.milestone &&
        !measured.includes(entry.path)
      )
        assert.ok(
          named.includes(entry.path),
          `${entry.path} is ${map.milestone}'s own record and is present, and ${map.milestone}'s map measures it nowhere and names it nowhere outside itself: the census below reads it as an unmeasured record, which is the refusal M055's T004 hit twice — the recording names what it measured, so name ${entry.path} in its inventory.outsideTheMap or measure it`,
        );
  }
}

/**
 * The records the map is measured over: every verdict-claims record present except the ones the maps
 * name in `inventory.outsideTheMap` — the same subtraction
 * `scripts/tutor-record-shapes.test.mjs` makes through its `mappedRecords`, made here so the two
 * suites hold the tree to one rule. M055's T004 captured `research/raw/m055-verdict-claims.json`
 * after the 34 beneath it were measured and named it outside the map for exactly that reason, and the
 * later maps are read the same way rather than by a second rule. Only the named paths are subtracted,
 * so a record that is present and named outside no map is still measured and still reddens the census
 * below — which is what the census mutant proves.
 * @param {{path: string, record: any}[]} [present] the records the tree holds, by default read from
 *   disk; the mutant passes a synthetic list so a record that is not on disk is held to the maps too
 * @returns {{path: string, record: any}[]}
 */
function mappedRecords(present = presentRecords) {
  const outside = outsideTheMap();
  return present.filter((entry) => !outside.includes(entry.path));
}

/** T001's 34 records, as the join answers over them: the records the map is measured over. */
const realRecords = mappedRecords();

/** The claim rows one record entry carries, whatever shape the record is in. */
/** @param {{record: any}} entry */
function claimsOf(entry) {
  const claims = entry.record && entry.record.claims;
  return Array.isArray(claims) ? claims : [];
}

/**
 * An injected presence reader: present unless the path is listed absent, with every path it was asked
 * about kept, so a pin can hold the join to reading presence rather than baking it.
 * @param {string[]} [absent]
 */
function readerFor(absent = []) {
  /** @type {string[]} */
  const calls = [];
  return {
    calls: calls,
    /** @param {string} path */
    exists: (path) => {
      calls.push(path);
      return !absent.includes(path);
    },
  };
}

/** A presence reader over the real tree: the path is there or it is not, read at answer time. */
function realReader() {
  /** @type {string[]} */
  const calls = [];
  return {
    calls: calls,
    /** @param {string} path */
    exists: (path) => {
      calls.push(path);
      return existsSync(join(ROOT, path));
    },
  };
}

/** One row of the authored mapping, as the join is handed it. */
/** @param {string} question @param {string} criterion @param {string} milestone */
function row(question, criterion, milestone) {
  return { question: question, criterion: criterion, milestone: milestone };
}

/**
 * One question answered by the join over these rows, these records and this reader.
 * @param {any} api
 * @param {string} question
 * @param {any[]} rows
 * @param {any[]} records
 * @param {string[]} [absent]
 */
function ask(api, question, rows, records, absent = []) {
  const reader = readerFor(absent);
  const answer = copyOf(
    api.tutorAnswer(question, {
      index: { rows: rows },
      records: records,
      exists: reader.exists,
    }),
  );
  return { answer: answer, calls: reader.calls };
}

// ------------------------------------------------------------------------------------------------
// The fixtures. Each patterns the real shape the records carry — `milestone`, a `claims[]` list with
// `criterion` and `artefactPath` — with paths the N5 constant cannot match.
// ------------------------------------------------------------------------------------------------

/** A record whose one claim states a recording: the E1 recording half, with prose that decoys (N1). */
function recordingFixture() {
  return {
    path: 'research/raw/fixture-m901-verdict-claims.json',
    record: {
      milestone: 'M901',
      claims: [
        {
          criterion: 'SC1',
          criterionText: PROSE_POISON,
          reason: PROSE_POISON + ' and it names ' + DECOY,
          artefact: DECOY,
          reading: 'the decoy ' + DECOY,
          artefactPath: RECORDING_PATH,
        },
      ],
    },
  };
}

/** A record whose one claim states a suite: the E1 suite half, rendered through the same read. */
function suiteFixture() {
  return {
    path: 'research/raw/fixture-m902-verdict-claims.json',
    record: {
      milestone: 'M902',
      claims: [{ criterion: 'SC1', artefactPath: SUITE_PATH }],
    },
  };
}

/** A record that states one criterion twice, each claim naming its own path: E2's more than one. */
function twoPathsFixture() {
  return {
    path: 'research/raw/fixture-m903-verdict-claims.json',
    record: {
      milestone: 'M903',
      claims: [
        { criterion: 'SC2', artefactPath: RECORDING_PATH },
        { criterion: 'SC2', artefactPath: SUITE_PATH },
      ],
    },
  };
}

/** A record in the shape 22 of the 34 carry: the criterion, the prose, and no artefact path (C4). */
function noArtefactPathFixture() {
  return {
    path: 'research/raw/fixture-m904-verdict-claims.json',
    record: {
      milestone: 'M904',
      claims: [
        {
          criterion: 'SC2',
          criterionText: PROSE_POISON,
          reason: PROSE_POISON + ' and it names ' + DECOY,
          ruling: 'not-required',
        },
      ],
    },
  };
}

// ------------------------------------------------------------------------------------------------
// The pins. Each one is green on the module as it sits on disk and reddens on the mutation it names.
// ------------------------------------------------------------------------------------------------

/**
 * The index's own pin: rows of exactly three fields, every criterion id carried by the named record on
 * disk, and no path-shaped string anywhere the index could hold one (N5).
 * @param {any} api
 * @param {string} source
 */
function pinIndex(api, source = INDEX_SOURCE) {
  assert.ok(Array.isArray(api.rows), `${INDEX} publishes a rows list`);
  const rows = copyOf(api.rows);
  assert.ok(rows.length > 0, 'the authored mapping carries at least one row');

  const questions = [];
  for (const entry of rows) {
    const where = `row ${JSON.stringify(entry)}`;
    assert.deepEqual(
      Object.keys(entry).sort(),
      ROW_FIELDS,
      `${where} is two facts in three fields — question, criterion, milestone — and no path, no value and no answer text (N5)`,
    );
    for (const field of ROW_FIELDS)
      assert.equal(
        typeof entry[field],
        'string',
        `${where} spells ${field} as a string`,
      );
    assert.ok(
      entry.question.length > 0 && entry.question.trim().endsWith('?'),
      `${where} carries the question text a person would ask`,
    );
    assert.match(
      entry.criterion,
      /^SC\d+$/,
      `${where} names a criterion id and nothing else`,
    );
    assert.match(
      entry.milestone,
      /^M\d{3}$/,
      `${where} names a milestone id and nothing else`,
    );
    questions.push(entry.question);

    const owners = realRecords.filter(
      (recordEntry) =>
        firstToken(recordEntry.record.milestone) === entry.milestone,
    );
    assert.ok(
      owners.length > 0,
      `${where} names milestone ${entry.milestone}, and a verdict-claims record on disk carries that milestone`,
    );
    const carried = owners.some((recordEntry) =>
      claimsOf(recordEntry).some(
        (claim) => claim && claim.criterion === entry.criterion,
      ),
    );
    assert.ok(
      carried,
      `every criterion id the index names is one the named record's own claims[].criterion fields carry, and ${entry.milestone} carries no ${entry.criterion} (N4) — ${where}`,
    );
  }
  assert.equal(
    new Set(questions).size,
    rows.length,
    'no two rows carry the same question text, so every question binds one criterion',
  );

  // The refusal, over the bytes rather than over a promise: a slash in the code is a path-shaped string,
  // a file-extension-shaped token in the code or in a row is a file name, and a repository path anywhere
  // in the file is a path however it was spelled into it.
  const texts = [codeOf(source)];
  for (const entry of rows)
    for (const field of ROW_FIELDS)
      if (typeof entry[field] === 'string') texts.push(entry[field]);
  for (const text of texts) {
    const slash = text.match(/[^\s"']*[\\/][^\s"']*/);
    assert.equal(
      slash,
      null,
      `the index spells no path: its code and its rows carry no slash, and this text does — ${slash === null ? '' : slash[0]} (N5)`,
    );
    const shaped = text.match(FILE_SHAPED);
    assert.equal(
      shaped,
      null,
      `the index spells no path: its code and its rows carry no file-extension-shaped token, and this text does — ${shaped === null ? '' : shaped[0]} (N5)`,
    );
  }
  const repoPath = source.match(
    /[^\s"'`]*(?:research|scripts|apps|extension|packages|src|tests|\.project)\/[^\s"'`]*/,
  );
  assert.equal(
    repoPath,
    null,
    `the index spells no path anywhere in its bytes, and this file holds one — ${repoPath === null ? '' : repoPath[0]} (N5)`,
  );
}

/**
 * The load-bearing pin (N5, AC3): the artefact path rendered is the record's own `claims[].artefactPath`
 * — never a hard-coded constant, never a path assembled from the derivation's prose, never one composed
 * by a path convention. The fixture's path is one no constant in the shipped module names.
 * @param {any} api
 */
function pinArtefactFromRecord(api) {
  const fixture = recordingFixture();
  const question = 'which recording holds the fixture claim about the gate?';
  const asked = ask(api, question, [row(question, 'SC1', 'M901')], [fixture]);

  assert.equal(
    asked.answer.state,
    'answered',
    `the record states claims[].artefactPath for SC1 and the reader reports it present, so the answer is answered and the join said "${asked.answer.state}"`,
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [RECORDING_PATH],
    `the answer renders the record's own claims[].artefactPath, verbatim — never a hard-coded constant, never a path assembled from the record's prose, and never one composed by a path convention: the record states "${RECORDING_PATH}" and the answer rendered ${JSON.stringify(asked.answer.artefactPaths)}`,
  );
  const whole = JSON.stringify(asked.answer);
  assert.equal(
    whole.includes(PROSE_POISON),
    false,
    `the template prose never reaches the answer (N1): "${PROSE_POISON}"`,
  );
  assert.equal(
    whole.includes(DECOY),
    false,
    `no field the derivation's reason, artefact or reading states is rendered (N1): "${DECOY}"`,
  );
}

/** E2: a criterion whose record states more than one path renders each as the record spells it. */
/** @param {any} api */
function pinPathSpelling(api) {
  const fixture = twoPathsFixture();
  const question =
    'which two artefacts does the fixture state for one criterion?';
  const asked = ask(api, question, [row(question, 'SC2', 'M903')], [fixture]);

  assert.equal(
    asked.answer.state,
    'answered',
    `the record states claims[].artefactPath twice for SC2, so the answer is answered and the join said "${asked.answer.state}"`,
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [RECORDING_PATH, SUITE_PATH],
    `each path is rendered as the record spells it — never re-rooted, normalised or shortened to make the render match: the record states ${JSON.stringify([RECORDING_PATH, SUITE_PATH])} and the answer rendered ${JSON.stringify(asked.answer.artefactPaths)}`,
  );
}

/** A record carrying the criterion but no artefact path is the second absence, and it names the field. */
/** @param {any} api */
function pinNoArtefactNamed(api) {
  const fixture = noArtefactPathFixture();
  const question =
    'which artefact does the fixture state for its second criterion?';
  const asked = ask(api, question, [row(question, 'SC2', 'M904')], [fixture]);

  assert.equal(
    asked.answer.state,
    'no-artefact-named',
    `a record that carries the criterion but states no claims[].artefactPath renders no-artefact-named — never an answer with a composed path in it — and the join said "${asked.answer.state}" for ${fixture.path}`,
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [],
    'the absence names no file at all',
  );
  assert.ok(
    asked.answer.detail.includes('claims[].artefactPath'),
    `the absence names the field that is missing: ${asked.answer.detail}`,
  );
  assert.ok(
    asked.answer.detail.includes(fixture.path),
    `the absence names the record it read: ${asked.answer.detail}`,
  );
  assert.equal(
    JSON.stringify(asked.answer).includes(PROSE_POISON),
    false,
    'the prose is not the answer (N1)',
  );
}

/**
 * Held-out E4. Constructed, and the recording is why: all 44 `artefactPath` values resolve at the head
 * T001 measured, so the dead-path state has no live instance in the tree to ask for.
 * @param {any} api
 */
function pinDeadPath(api) {
  const fixture = {
    path: 'research/raw/fixture-m905-verdict-claims.json',
    record: {
      milestone: 'M905',
      claims: [{ criterion: 'SC1', artefactPath: RECORDING_PATH }],
    },
  };
  const question =
    'which recording proves the fixture claim, now that the recording is gone?';
  const asked = ask(
    api,
    question,
    [row(question, 'SC1', 'M905')],
    [fixture],
    [RECORDING_PATH],
  );

  assert.equal(
    asked.answer.state,
    'missing-artefact',
    `held-out E4: every rendered path is read through the injected reader at answer time, so a record that states a file which is not where the record says it lives answers missing-artefact, naming the record and the missing path — and never no-matching-criterion. The join said "${asked.answer.state}"`,
  );
  assert.deepEqual(
    asked.calls,
    [RECORDING_PATH],
    'the reader was asked about the path the record states, once',
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [RECORDING_PATH],
    'the missing path is the one the record states, spelled as the record spells it',
  );
  assert.ok(
    asked.answer.detail.includes(fixture.path),
    `the missing-artefact sentence names the record: ${asked.answer.detail}`,
  );
  assert.ok(
    asked.answer.detail.includes(RECORDING_PATH),
    `the missing-artefact sentence names the missing path: ${asked.answer.detail}`,
  );
}

/** The milestone is the answering record's own field, verbatim, however it spells the id. */
/** @param {any} api */
function pinMilestoneFromField(api) {
  const fixture = {
    path: 'research/raw/fixture-m046-verdict-claims.json',
    record: {
      milestone: 'M046 copy-to-agent',
      claims: [{ criterion: 'SC1', artefactPath: SUITE_PATH }],
    },
  };
  const question =
    'does the copy-to-agent hand-off quote the finding it copied?';
  const asked = ask(api, question, [row(question, 'SC1', 'M046')], [fixture]);

  assert.equal(
    asked.answer.state,
    'answered',
    `a record that spells the id and the milestone's name in one string is recognised by its first token, so the answer is answered and the join said "${asked.answer.state}"`,
  );
  assert.equal(
    asked.answer.milestone,
    'M046 copy-to-agent',
    `the milestone rendered is the answering record's own milestone field, verbatim: the record states "M046 copy-to-agent" and the answer rendered ${JSON.stringify(asked.answer.milestone)} — a milestone composed from the record's path or from the id the row named is not the record's field`,
  );
}

/** The criterion rendered is the record's own field for the claim that carries it (N4). */
/** @param {any} api */
function pinCriterionFromRecord(api) {
  const fixture = {
    path: 'research/raw/fixture-m906-verdict-claims.json',
    record: {
      milestone: 'M906',
      claims: [
        { criterion: 'SC1', artefactPath: RECORDING_PATH },
        { criterion: 'SC2', artefactPath: SUITE_PATH },
      ],
    },
  };
  const question = 'does the fixture hold its second criterion?';
  const asked = ask(api, question, [row(question, 'SC2', 'M906')], [fixture]);

  assert.equal(
    asked.answer.criterion,
    'SC2',
    `the criterion rendered is the record's own claims[].criterion for the claim that carries it, and an id the record does not carry for the question is never rendered (N4): the row named SC2, the record carries SC2, and the answer rendered ${JSON.stringify(asked.answer.criterion)}`,
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [SUITE_PATH],
    'the path rendered is the one the claim carrying the criterion states',
  );
}

/** The three absences are three distinct states, each naming which absence holds (E3, N2). */
/** @param {any} api */
function pinDistinctAbsences(api) {
  const present = recordingFixture();
  const absent = noArtefactPathFixture();
  const question = 'which recording holds the fixture claim about the gate?';
  const rows = [row(question, 'SC1', 'M901')];

  const cases = [
    {
      id: 'no row of the mapping carries the question',
      answer: ask(api, 'what does no row carry?', rows, [present]).answer,
      expected: 'no-matching-criterion',
      names: 'no row of the authored mapping',
    },
    {
      id: 'the record carries no such criterion',
      answer: ask(
        api,
        'which criterion does the record not carry?',
        [row('which criterion does the record not carry?', 'SC9', 'M901')],
        [present],
      ).answer,
      expected: 'no-matching-criterion',
      names: 'carries criterion SC9',
    },
    {
      id: 'the claim names no artefact path',
      answer: ask(api, question, [row(question, 'SC2', 'M904')], [absent])
        .answer,
      expected: 'no-artefact-named',
      names: 'claims[].artefactPath',
    },
    {
      id: 'no record was supplied',
      answer: copyOf(
        api.tutorAnswer(question, {
          index: { rows: rows },
          records: [],
          exists: readerFor().exists,
        }),
      ),
      expected: 'records-unreadable',
      names: 'no record was supplied',
    },
    {
      id: 'no record could be parsed',
      answer: copyOf(
        api.tutorAnswer(question, {
          index: { rows: rows },
          records: [
            { path: 'research/raw/fixture-unreadable.json', record: null },
          ],
          exists: readerFor().exists,
        }),
      ),
      expected: 'records-unreadable',
      names: 'none of the 1 record(s)',
    },
    {
      id: 'no reader was injected',
      answer: copyOf(
        api.tutorAnswer(question, {
          index: { rows: rows },
          records: [present],
        }),
      ),
      expected: 'records-unreadable',
      names: 'no reader',
    },
  ];

  for (const one of cases) {
    assert.equal(
      one.answer.state,
      one.expected,
      `the absence "${one.id}" is its own state among the three absences, which are distinct and never one blank unanswered state: expected "${one.expected}" and the join said "${one.answer.state}"`,
    );
    assert.ok(
      one.answer.detail.includes(one.names),
      `the absence "${one.id}" names which absence holds, among the three absences the surface renders distinctly: ${one.answer.detail}`,
    );
    assert.deepEqual(
      one.answer.artefactPaths,
      [],
      `the absence "${one.id}" names no artefact, so no path is rendered beside it`,
    );
  }

  const states = cases.map((one) => one.answer.state);
  assert.deepEqual(
    [...new Set(states)].sort(),
    [...ABSENCES].sort(),
    `the three absences are three distinct states and never one blank unanswered state: the join answered ${JSON.stringify(states)}`,
  );
  const details = new Set(cases.map((one) => one.answer.detail));
  assert.equal(
    details.size,
    cases.length,
    `each absence states its own sentence, and ${cases.length} absences produced ${details.size} distinct sentence(s)`,
  );
}

/** A question no row carries is unanswered, with nothing beside it (N2). */
/** @param {any} api */
function pinNoRowIsNotAnAnswer(api) {
  const fixture = recordingFixture();
  const question =
    'which recording answers a question the mapping never authored?';
  const asked = ask(api, question, [], [fixture]);

  assert.equal(
    asked.answer.state,
    'no-matching-criterion',
    `an unanswered question is unanswered, with nothing beside it: the join said "${asked.answer.state}" for a question no row carries`,
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [],
    'an unanswered question renders no artefact path',
  );
  assert.equal(
    asked.answer.milestone,
    null,
    'an unanswered question names no milestone',
  );
  assert.equal(
    asked.answer.criterion,
    null,
    'an unanswered question names no criterion',
  );
  assert.ok(
    asked.answer.detail.includes('no criterion matches the question'),
    `the absence says which absence holds: ${asked.answer.detail}`,
  );
  assert.equal(
    asked.calls.length,
    0,
    'no artefact path was read, because no record answered',
  );
}

/** A second answer names the same artefact, milestone and criterion: the answer is stable (E5). */
/** @param {any} api */
function pinStableSecondAnswer(api) {
  const fixture = recordingFixture();
  const question = 'which recording holds the fixture claim about the gate?';
  const rows = [row(question, 'SC1', 'M901')];

  const first = ask(api, question, rows, [fixture]);
  const second = ask(api, question, rows, [fixture]);

  assert.deepEqual(
    second.answer,
    first.answer,
    `a second answer to the same question over the same records names the same artefact, milestone and criterion — purity, and the answer is stable across calls: the first named ${JSON.stringify(first.answer.artefactPaths)} and the second named ${JSON.stringify(second.answer.artefactPaths)}`,
  );
  assert.deepEqual(
    second.calls,
    first.calls,
    'the same paths were read, in the same order, on both calls',
  );
}

/** The shipped index answered over the real records with a real reader, row by row (C4, E4, E5). */
/** @param {any} api */
function pinShippedRowsOverRealRecords(api) {
  const rows = copyOf(loadIndex().rows);
  let answered = 0;
  let absence = 0;

  for (const entry of rows) {
    const owner = realRecords.find(
      (recordEntry) =>
        firstToken(recordEntry.record.milestone) === entry.milestone,
    );
    assert.ok(owner, `the row for ${entry.milestone} names a record on disk`);
    const claims = claimsOf(owner).filter(
      (claim) => claim && claim.criterion === entry.criterion,
    );
    assert.ok(
      claims.length > 0,
      `${owner.path} carries criterion ${entry.criterion}`,
    );
    const stated = claims
      .map((claim) => claim.artefactPath)
      .filter((path) => typeof path === 'string');

    const reader = realReader();
    const answer = copyOf(
      api.tutorAnswer(entry.question, {
        index: { rows: rows },
        records: realRecords,
        exists: reader.exists,
      }),
    );

    if (stated.length > 0) {
      answered += 1;
      assert.equal(
        answer.state,
        'answered',
        `the answer to "${entry.question}" must be answered — a surface that always refuses is not a surface — and the join said "${answer.state}"`,
      );
      assert.deepEqual(
        answer.artefactPaths,
        stated,
        `the paths rendered are the ones ${owner.path} states for ${entry.criterion}, spelled as it spells them, and a surface that always refuses is not a surface`,
      );
      assert.equal(
        answer.milestone,
        owner.record.milestone,
        `the milestone rendered is the record's own field and a surface that always refuses is not a surface`,
      );
      assert.equal(
        answer.criterion,
        entry.criterion,
        `the criterion rendered is the record's own field and a surface that always refuses is not a surface`,
      );
      continue;
    }

    absence += 1;
    assert.equal(
      answer.state,
      'no-artefact-named',
      `the record ${owner.path} states no claims[].artefactPath for ${entry.criterion}, so the answer is no-artefact-named — naming the field that is missing, and never a path composed from the record's prose — and a surface that always refuses is not a surface: the join said "${answer.state}"`,
    );
    assert.deepEqual(answer.artefactPaths, [], 'the absence names no artefact');
    assert.ok(
      answer.detail.includes('claims[].artefactPath'),
      `the absence names the missing field: ${answer.detail}`,
    );
    assert.ok(
      answer.detail.includes(owner.path),
      `the absence names the record: ${answer.detail}`,
    );
  }

  assert.ok(
    answered > 0,
    'the authored index names at least one criterion its record states an artefact path for, so the answered state is reached from the real records',
  );
  assert.ok(
    absence > 0,
    'the authored index names one criterion whose record cannot name an artefact, so the second absence is rendered from the real records and not only from a fixture (C4)',
  );
}

// ------------------------------------------------------------------------------------------------
// The index's own pins, before any mutation.
// ------------------------------------------------------------------------------------------------

test('T002 — the index is two facts in three fields, and every criterion id is one the record on disk carries', () => {
  pinIndex(loadIndex(), INDEX_SOURCE);
  const rows = copyOf(loadIndex().rows);
  const owning = rows.filter((entry) => {
    const owner = realRecords.find(
      (recordEntry) =>
        firstToken(recordEntry.record.milestone) === entry.milestone,
    );
    return (
      owner !== undefined &&
      claimsOf(owner).some(
        (claim) =>
          claim &&
          claim.criterion === entry.criterion &&
          typeof claim.artefactPath === 'string',
      )
    );
  });
  console.log(
    `T002 index: ${rows.length} row(s), ${owning.length} naming a criterion whose record states an artefact path, ${rows.length - owning.length} naming one whose record states none`,
  );
});

test('T002 — a criterion id no record carries is refused by the join rather than rendered (N4)', () => {
  const api = loadJoin();
  const fixture = recordingFixture();
  const question =
    'which recording proves a criterion the record does not carry?';
  const asked = ask(api, question, [row(question, 'SC9', 'M901')], [fixture]);
  assert.equal(
    asked.answer.state,
    'no-matching-criterion',
    `a row naming a criterion the record's claims do not carry yields the first absence and never an answered criterion id (N4): the join said "${asked.answer.state}"`,
  );
  assert.deepEqual(
    asked.answer.artefactPaths,
    [],
    'no artefact is cited for a criterion no record carries',
  );
});

// The join's pins over the records on disk: the claims that carry the field, and the records that carry none.

/**
 * The census this suite reads through: the map measures every verdict-claims record present, the
 * records the maps name outside themselves excepted — the pin the record-shapes suite makes over the
 * same maps. It is strict in both directions, because a bare count is satisfied by the wrong records: a
 * record present and named outside no map must be on the map, and one it measures must be present.
 * @param {{path: string, record: any}[]} [present] the records the tree holds, by default read from
 *   disk; the mutant passes a synthetic list so a record that is not on disk is held to the maps too
 * @returns {{path: string, record: any}[]} the records the map measures
 */
function pinRecordCensus(present = presentRecords) {
  pinNamedOutside(present);
  const outside = outsideTheMap();
  const measured = mappedRecords(present);
  const mapped = RECORDING_DATA.inventory.verdictClaims.paths;
  for (const entry of measured)
    assert.ok(
      mapped.includes(entry.path),
      `${entry.path} is present and is not named outside the map by any recording, so the map must measure it: T001 measured ${mapped.length} verdict-claims record(s) and the maps name ${outside.length} outside themselves (${outside.join(', ')})`,
    );
  for (const path of mapped)
    assert.ok(
      measured.some((entry) => entry.path === path),
      `the map measures ${path}, so that record is present and is not named outside the map by any recording`,
    );
  assert.equal(
    measured.length,
    RECORDING_DATA.inventory.verdictClaims.count,
    'the suite reads every verdict-claims record T001 measured',
  );
  return measured;
}

test('T002 — the join answers every claim that carries the field and renders the 22 records that carry none as the absence (C4)', () => {
  pinRecordCensus();
  const withPaths = realRecords.filter((entry) =>
    claimsOf(entry).some((claim) => typeof claim.artefactPath === 'string'),
  );
  const withoutPaths = realRecords.filter(
    (entry) =>
      !claimsOf(entry).some((claim) => typeof claim.artefactPath === 'string'),
  );

  assert.equal(
    realRecords.length,
    RECORDING_DATA.inventory.verdictClaims.count,
    'the suite reads every verdict-claims record T001 measured',
  );
  assert.equal(
    withPaths.length,
    RECORDING_DATA.artefactPaths.recordsCarryingIt,
    `claims[].artefactPath is carried by ${withPaths.length} records, and T001 measured the same count`,
  );
  assert.equal(
    withoutPaths.length,
    realRecords.length - withPaths.length,
    'the rest carry none of it — 22 of the 34 records at this head',
  );

  const api = loadJoin();
  let answered = 0;
  for (const entry of withPaths) {
    for (const claim of claimsOf(entry).filter(
      (one) => typeof one.artefactPath === 'string',
    )) {
      const question =
        'does ' +
        claim.criterion +
        ' of ' +
        entry.record.milestone +
        ' hold, and which artefact holds it?';
      const reader = realReader();
      const answer = copyOf(
        api.tutorAnswer(question, {
          index: {
            rows: [row(question, claim.criterion, entry.record.milestone)],
          },
          records: realRecords,
          exists: reader.exists,
        }),
      );
      assert.equal(
        answer.state,
        'answered',
        `${entry.path} states ${claim.artefactPath} for ${claim.criterion}, so the answer is answered and the join said "${answer.state}"`,
      );
      assert.deepEqual(
        answer.artefactPaths,
        [claim.artefactPath],
        `the path rendered is ${entry.path}'s own claims[].artefactPath for ${claim.criterion}, spelled as the record spells it`,
      );
      assert.equal(
        answer.milestone,
        entry.record.milestone,
        'the milestone rendered is the record field, verbatim',
      );
      assert.equal(
        answer.criterion,
        claim.criterion,
        'the criterion rendered is the record field, verbatim',
      );
      assert.deepEqual(
        reader.calls,
        [claim.artefactPath],
        'presence of the rendered path is read at answer time on every run, never baked into the index, the join or a build step',
      );
      assert.ok(
        existsSync(join(ROOT, claim.artefactPath)),
        `the path the record states resolves where the record says it lives: ${claim.artefactPath}`,
      );
      answered += 1;
    }
  }
  assert.equal(
    answered,
    RECORDING_DATA.artefactPaths.claimsCarryingIt,
    `every claim that carries the field answers with it: ${answered} answer(s), and T001 measured ${RECORDING_DATA.artefactPaths.claimsCarryingIt} claim(s) carrying it`,
  );

  let absences = 0;
  for (const entry of withoutPaths) {
    const first = claimsOf(entry)[0];
    const question =
      'which artefact proves ' +
      first.criterion +
      ' of ' +
      entry.record.milestone +
      '?';
    const reader = realReader();
    const answer = copyOf(
      api.tutorAnswer(question, {
        index: {
          rows: [row(question, first.criterion, entry.record.milestone)],
        },
        records: realRecords,
        exists: reader.exists,
      }),
    );
    assert.equal(
      answer.state,
      'no-artefact-named',
      `${entry.path} states no claims[].artefactPath for ${first.criterion}, so a record that cannot answer renders the absence that names the missing field — never an answer, never prose — and the join said "${answer.state}"`,
    );
    assert.deepEqual(answer.artefactPaths, [], 'the absence names no file');
    assert.ok(
      answer.detail.includes('claims[].artefactPath'),
      `the absence names the field that is missing: ${answer.detail}`,
    );
    assert.ok(
      answer.detail.includes(entry.path),
      `the absence names the record: ${answer.detail}`,
    );
    absences += 1;
  }
  assert.equal(
    absences,
    withoutPaths.length,
    'every record that carries none renders the absence rather than an answer',
  );

  console.log(
    `T002 records: ${realRecords.length} verdict-claims records, ${answered} claim(s) answered with their own claims[].artefactPath, ${absences} record(s) rendered as no-artefact-named`,
  );
});

test('T002 — a record present and not named outside the map still reddens the census', () => {
  const unlisted = {
    path: `${RECORD_DIR}/m901-verdict-claims.json`,
    record: { milestone: 'M901', claims: [{ criterion: 'SC9' }] },
  };
  const failure = failureOf(() =>
    pinRecordCensus([...presentRecords, unlisted]),
  );
  assert.ok(
    failure !== null,
    'a record present and not named outside the map must redden the census, and it reddened nothing',
  );
  assert.ok(
    failure.message.includes(unlisted.path),
    `the census names the unlisted record rather than reporting a bare count: ${failure.message.split('\n')[0]}`,
  );
  assert.ok(
    failure.message.includes('outside the map'),
    `the census says what the record would have had to be to be excused: ${failure.message.split('\n')[0]}`,
  );
  assert.deepEqual(
    presentRecords
      .filter((entry) => outsideTheMap().includes(entry.path))
      .map((entry) => entry.path),
    presentRecords
      .filter((entry) => !realRecords.some((kept) => kept.path === entry.path))
      .map((entry) => entry.path),
    'the census subtracts exactly the verdict-claims records the maps name outside themselves and no others, so the exclusion is the recordings’ own rather than this suite’s — and a name that resolves to no record on disk subtracts nothing',
  );
  pinRecordCensus();
  console.log(`T002 census mutant: ${failure.message.split('\n')[0]}`);
});

test('T006 — every map is read, and each may name outside itself only the record its own milestone owes', () => {
  pinNamedOutside();
  const outside = outsideTheMap();
  for (const map of MAPS) {
    const named = outsideTheMapOf(map);
    const pinned =
      PINNED_OUTSIDE[
        /** @type {'M055'|'M057'|'M058'|'M059'} */ (map.milestone)
      ] ?? [];
    for (const path of named)
      assert.ok(
        pinned.includes(path),
        `${map.milestone}'s map names ${path} outside itself, which is not a record ${map.milestone} owes`,
      );
    assert.ok(
      Array.isArray(named) && named.every((path) => outside.includes(path)),
      `${map.milestone}'s own named-outside set is part of the subtraction`,
    );
  }
  assert.deepEqual(
    [...outside].sort(),
    [
      ...new Set([
        ...PINNED_OUTSIDE.M055,
        ...MAPS.slice(1).flatMap((map) => outsideTheMapOf(map)),
      ]),
    ].sort(),
    `the subtraction is M055's map's own two plus whatever each later map names outside itself, read from the recordings: the maps name ${JSON.stringify(outside)}`,
  );
  console.log(
    `T006 maps: ${MAPS.map((map) => `${String(map.milestone)} names ${outsideTheMapOf(map).length} outside itself`).join(', ')}, the subtraction is ${outside.length} path(s) and the census reads ${realRecords.length} record(s)`,
  );
});

test('T006 — a third path named outside a map reddens, and a record no map names reddens naming it', () => {
  for (const map of [OWN_MAP_DATA, BESIDE_MAP_DATA]) {
    const third = {
      ...map,
      inventory: {
        ...(map.inventory ?? {}),
        outsideTheMap: [
          {
            path: 'research/raw/m901-verdict-claims.json',
            why: 'a third record',
          },
        ],
      },
    };
    const excused = failureOf(() => pinNamedOutside(presentRecords, [third]));
    assert.ok(
      excused !== null,
      `${String(map.milestone)}'s map naming a path its own milestone does not owe must redden, and it reddened nothing`,
    );
    assert.ok(
      excused.message.includes('research/raw/m901-verdict-claims.json'),
      `the refusal names the path it refuses to subtract: ${excused.message.split('\n')[0]}`,
    );

    const owedPath =
      PINNED_OUTSIDE[/** @type {'M057'|'M058'} */ (map.milestone)][1];
    const owed = {
      path: owedPath,
      record: {
        milestone: String(map.milestone),
        claims: [{ criterion: 'SC1' }],
      },
    };
    // The record this milestone owes is named outside the map now that its own task has captured it,
    // so the mutant is that map with `inventory.outsideTheMap` emptied: the property under it is "a
    // present record the map neither measures nor names reddens", not "this record is unnamed", which
    // the capture made false by construction.
    const unnamed = {
      ...map,
      inventory: { ...(map.inventory ?? {}), outsideTheMap: [] },
    };
    const unmeasured = failureOf(() =>
      pinNamedOutside([...presentRecords, owed], [RECORDING_DATA, unnamed]),
    );
    assert.ok(
      unmeasured !== null,
      'the record this milestone still owes, once present, is not measured by its own map and not named outside it, so it must redden rather than read as unmeasured',
    );
    assert.ok(
      unmeasured.message.includes(owed.path),
      `the refusal names the record it will not read as unmeasured: ${unmeasured.message.split('\n')[0]}`,
    );
    const named = {
      ...map,
      inventory: {
        ...(map.inventory ?? {}),
        outsideTheMap: [
          { path: owed.path, why: 'recorded by the task that owes it' },
        ],
      },
    };
    pinNamedOutside([...presentRecords, owed], [RECORDING_DATA, named]);
    const subtracted = [
      ...outsideTheMapOf(RECORDING_DATA),
      ...outsideTheMapOf(named),
    ];
    assert.equal(
      subtracted.includes(owed.path),
      true,
      `once the recording names it outside itself the record this milestone owes is subtracted rather than read as unmeasured: ${owed.path}`,
    );
    console.log(
      `T006 mutants ${String(map.milestone)}: third path -> ${excused.message.split('\n')[0]} || unmeasured record -> ${unmeasured.message.split('\n')[0]}`,
    );
  }
});

test('T002 — the shipped index answers over the real records with a real reader, one row at a time', () => {
  pinShippedRowsOverRealRecords(loadJoin());
});

test('T002 — held-out E4: the dead-path state is constructed, because the recording measures no dead path', () => {
  assert.equal(
    RECORDING_DATA.artefactPaths.resolved,
    RECORDING_DATA.artefactPaths.claimsCarryingIt,
    'T001 measured every artefact path resolving at its head, so E4 has no live instance among them',
  );
  assert.deepEqual(
    RECORDING_DATA.artefactPaths.unresolved,
    [],
    'the recording names no unresolved artefact path, which is why this suite constructs the missing-artefact input rather than asking the tree for one',
  );
  pinDeadPath(loadJoin());
  const api = loadJoin();
  for (const entry of realRecords) {
    for (const claim of claimsOf(entry).filter(
      (one) => typeof one.artefactPath === 'string',
    )) {
      const reader = realReader();
      const question =
        'held-out E4: is ' + claim.artefactPath + ' still there?';
      const answer = copyOf(
        api.tutorAnswer(question, {
          index: {
            rows: [row(question, claim.criterion, entry.record.milestone)],
          },
          records: realRecords,
          exists: reader.exists,
        }),
      );
      assert.notEqual(
        answer.state,
        'missing-artefact',
        `${claim.artefactPath} is where ${entry.path} says it lives, so the missing-artefact state is reached by no record the tree holds`,
      );
    }
  }
});

test('T002 — E1: a recording and a suite render through the same read, both answers carrying the same three fields', () => {
  const api = loadJoin();
  const firstQuestion =
    'which recording holds the fixture claim about the gate?';
  const secondQuestion = 'which suite holds the fixture claim about the gate?';
  const recording = ask(
    api,
    firstQuestion,
    [row(firstQuestion, 'SC1', 'M901')],
    [recordingFixture()],
  ).answer;
  const suite = ask(
    api,
    secondQuestion,
    [row(secondQuestion, 'SC1', 'M902')],
    [suiteFixture()],
  ).answer;

  for (const [label, answer, expected] of [
    ['recording', recording, RECORDING_PATH],
    ['suite', suite, SUITE_PATH],
  ]) {
    assert.equal(
      answer.state,
      'answered',
      `a claim whose artefactPath names a ${label} renders through the same read as any other: the join said "${answer.state}"`,
    );
    assert.deepEqual(
      answer.artefactPaths,
      [expected],
      `the ${label} answer names the path the record states`,
    );
  }
  assert.deepEqual(
    Object.keys(recording).sort(),
    Object.keys(suite).sort(),
    'both answers carry the same fields, because the surface does not branch on the path shape',
  );
  assert.deepEqual(
    Object.keys(recording),
    ['state', 'question', 'milestone', 'criterion', 'artefactPaths', 'detail'],
    'an answered result carries the contract’s six fields and nothing else',
  );
  for (const field of ['milestone', 'criterion']) {
    assert.equal(
      typeof recording[field],
      'string',
      `the recording answer carries ${field} as the record spells it`,
    );
    assert.equal(
      typeof suite[field],
      'string',
      `the suite answer carries ${field} as the record spells it`,
    );
    assert.ok(
      recording[field].length > 0 && suite[field].length > 0,
      `both answers carry ${field}, read from the record that answered`,
    );
  }
});

test('T002 — E2: one criterion whose record states more than one path renders each as the record spells it', () => {
  pinPathSpelling(loadJoin());
});

test('T002 — E5: a second answer names the same artefact, milestone and criterion', () => {
  pinStableSecondAnswer(loadJoin());
});

test('T002 — the join is pure: no import, no filesystem, no network, no DOM, no clock, no prose field', () => {
  const api = loadJoin();
  const code = codeOf(JOIN_SOURCE);

  for (const needle of [
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
    'angularAiTutorIndex',
  ])
    assert.equal(
      code.includes(needle),
      false,
      `the join is pure: it holds no ${needle} — it imports nothing, touches no filesystem, dispatches no message, performs no network call and holds no clock — and its presence reader is injected`,
    );

  for (const field of NEVER_READ_FIELDS)
    assert.equal(
      new RegExp('\\b' + field + '\\b').test(code),
      false,
      `the join never reads the derivation's ${field} field, which is one template shared across milestones (N1, C3)`,
    );
  assert.equal(
    /\.artefact\b/.test(code),
    false,
    "the join never reads the derivation's artefact field, which is prose around a path (N1, C3)",
  );
  assert.equal(
    REPO_PATH.test(code),
    false,
    'the join branches on no path shape: no repository-relative path appears in its code, so a recording and a suite are read by the same rule (E1)',
  );

  assert.deepEqual(
    Object.keys(api).sort(),
    ['ABSENCES', 'READS', 'STATES', 'tutorAnswer'],
    'the join publishes the answer, the five states, the three absences and the three fields it reads, and no state of its own',
  );
  assert.deepEqual(
    copyOf(api.STATES),
    STATES,
    'the five states are the contract’s',
  );
  assert.deepEqual(
    copyOf(api.ABSENCES),
    ABSENCES,
    'the three absences are the contract’s',
  );
  assert.deepEqual(
    copyOf(api.READS),
    READ_FIELDS,
    'the fields an answer reads are the record’s own three structural fields',
  );

  for (const entry of copyOf(loadIndex().rows))
    assert.equal(
      code.includes(entry.question),
      false,
      'the join holds no question text of its own: the question side is the authored mapping (C2, N5)',
    );
});

// The mutants. Each is one edit of one shipped file, applied in memory; `defect` is the word the pin must name.

const JOIN_MUTATIONS = [
  {
    id: 'artefact-hard-coded',
    // N5 built into the join: the record's path replaced by a constant that still answers.
    defect: 'hard-coded',
    names: 'claims[].artefactPath',
    anchor: "    if (typeof stated === 'string') return [stated];",
    replacement:
      "    if (typeof stated === 'string') return ['scripts/copy-check.test.mjs'];",
    pin: pinArtefactFromRecord,
  },
  {
    id: 'answer-from-prose',
    // N1: the answer assembled from the derivation's `artefact` prose instead of the record's field.
    defect: 'prose',
    names: 'claims[].artefactPath',
    anchor: "    if (typeof stated === 'string') return [stated];",
    replacement:
      "    if (typeof stated === 'string') return [String(claim.artefact)];",
    pin: pinArtefactFromRecord,
  },
  {
    id: 'path-from-convention',
    // A path composed from the criterion id by a naming convention, which no record states.
    defect: 'convention',
    names: 'claims[].artefactPath',
    anchor: "    if (typeof stated === 'string') return [stated];",
    replacement:
      "    if (typeof stated === 'string')\n      return ['scripts/' + String(claim.criterion).toLowerCase() + '.test.mjs'];",
    pin: pinArtefactFromRecord,
  },
  {
    id: 'path-renormalised',
    // E2 backwards: the path re-rooted and shortened to make the render match.
    defect: 'normalis',
    names: 'as the record spells it',
    anchor: "    if (typeof stated === 'string') return [stated];",
    replacement:
      "    if (typeof stated === 'string') return ['./' + stated.split('/').pop()];",
    pin: pinPathSpelling,
  },
  {
    id: 'missing-field-answered',
    // C4 backwards: a record with no artefact field answered as an answer rather than the absence.
    defect: 'no-artefact-named',
    names: 'claims[].artefactPath',
    anchor: '    if (matched.paths.length === 0) {',
    replacement: '    if (false) {',
    pin: pinNoArtefactNamed,
  },
  {
    id: 'missing-file-as-unanswered',
    // E4 backwards: a gone file folded into the unanswered state.
    defect: 'missing-artefact',
    names: 'no-matching-criterion',
    anchor: '        MISSING_ARTEFACT,',
    replacement: '        NO_MATCHING_CRITERION,',
    pin: pinDeadPath,
  },
  {
    id: 'reader-ignored',
    // The bake: presence asserted instead of read, so the answer is the same whether the file is there.
    defect: 'reader',
    names: 'missing-artefact',
    anchor: '      const present = exists(path) === true;',
    replacement: '      const present = true;',
    pin: pinDeadPath,
  },
  {
    id: 'criterion-not-carried',
    // N4: the join answers with whichever claim the record carries, whatever criterion the row named.
    defect: 'criterion',
    names: 'the record',
    anchor: '        if (claim.criterion !== criterion) continue;',
    replacement: "        if (typeof claim.criterion !== 'string') continue;",
    pin: pinCriterionFromRecord,
  },
  {
    id: 'milestone-from-id',
    // The milestone read from the id the row named or from the file name rather than the field.
    defect: 'milestone',
    names: 'verbatim',
    anchor: '      milestone: owner.record.milestone,',
    replacement: "      milestone: 'M046',",
    pin: pinMilestoneFromField,
  },
  {
    id: 'absences-folded',
    // N2: the three absences folded into one blank state.
    defect: 'three absences',
    names: 'distinct',
    anchor:
      '  function answerOf(state, asked, milestone, criterion, artefactPaths, detail) {',
    replacement:
      '  function answerOf(state, asked, milestone, criterion, artefactPaths, detail) {\n' +
      '    if (ABSENCES.indexOf(state) !== -1) {\n' +
      '      state = NO_MATCHING_CRITERION;\n' +
      "      detail = 'nothing answered here';\n" +
      '    }',
    pin: pinDistinctAbsences,
  },
  {
    id: 'always-refuses',
    // N2: a surface that always refuses is not a surface.
    defect: 'refuses',
    names: 'not a surface',
    anchor: '  function tutorAnswer(question, sources) {',
    replacement:
      '  function tutorAnswer(question, sources) {\n' +
      '    return answerOf(\n' +
      '      NO_MATCHING_CRITERION,\n' +
      "      typeof question === 'string' ? question.trim() : '',\n" +
      '      null,\n' +
      '      null,\n' +
      '      [],\n' +
      "      'no criterion matches the question: no row of the authored mapping carries it',\n" +
      '    );',
    pin: pinShippedRowsOverRealRecords,
  },
  {
    id: 'unanswered-as-answer',
    // N2: a question no row carries answered with the first claim the records happen to hold.
    defect: 'unanswered',
    names: 'nothing beside it',
    anchor: '    if (row === null) {',
    replacement:
      '    if (\n' +
      '      row === null &&\n' +
      '      records.length > 0 &&\n' +
      '      Array.isArray(records[0].record.claims) &&\n' +
      '      records[0].record.claims.length > 0\n' +
      '    ) {\n' +
      '      const first = records[0].record.claims[0];\n' +
      '      return answerOf(\n' +
      '        ANSWERED,\n' +
      '        asked,\n' +
      '        records[0].record.milestone,\n' +
      '        first.criterion,\n' +
      '        pathsOfClaim(first),\n' +
      "        'an answer assembled for a question no row of the mapping carries',\n" +
      '      );\n' +
      '    }\n' +
      '    if (row === null) {',
    pin: pinNoRowIsNotAnAnswer,
  },
  {
    id: 'second-call-differs',
    // Purity backwards: the second answer over the same records is not the first.
    defect: 'purity',
    names: 'a second answer',
    anchor: '      matched.paths,',
    replacement:
      '      (globalThis.__tutorAnswerSecondCall = !globalThis.__tutorAnswerSecondCall)\n' +
      '        ? matched.paths\n' +
      '        : [],',
    pin: pinStableSecondAnswer,
  },
];

const INDEX_MUTATIONS = [
  {
    id: 'row-carries-a-path',
    // N5 itself: a row that carries an artefact path beside its two facts.
    defect: 'path',
    names: 'two facts',
    anchor: "      criterion: 'SC1',\n      milestone: 'M044',",
    replacement:
      "      criterion: 'SC1',\n      milestone: 'M044',\n      artefactPath: 'research/raw/m044-gate-shapes.json',",
    pin: pinIndex,
  },
  {
    id: 'row-carries-a-value',
    // The third fact a row must not acquire: a measured value.
    defect: 'value',
    names: 'two facts',
    anchor: "      criterion: 'SC1',\n      milestone: 'M044',",
    replacement:
      "      criterion: 'SC1',\n      milestone: 'M044',\n      value: 'a recording of the gate shapes',",
    pin: pinIndex,
  },
  {
    id: 'row-carries-an-answer',
    // The answer text the index must never hold: the join reads it from the records instead.
    defect: 'answer',
    names: 'two facts',
    anchor: "      criterion: 'SC1',\n      milestone: 'M044',",
    replacement:
      "      criterion: 'SC1',\n      milestone: 'M044',\n      answer: 'The gate refuses that test.',",
    pin: pinIndex,
  },
  {
    id: 'row-names-a-criterion-no-record-holds',
    // N4 caught at authoring time: an id the named record does not carry.
    defect: 'criterion',
    names: 'carries',
    anchor: "      criterion: 'SC3',\n      milestone: 'M044',",
    replacement: "      criterion: 'SC9',\n      milestone: 'M044',",
    pin: pinIndex,
  },
  {
    id: 'row-question-carries-a-path',
    // N5 through the question text: a path spelled into the one authored field.
    defect: 'path',
    names: 'no slash',
    anchor:
      "        'which check refuses a test that resolves a milestone path its own archive move deletes?',",
    replacement:
      "        'which file research/raw/m044-gate-shapes.json refuses a test that resolves a milestone path its own archive move deletes?',",
    pin: pinIndex,
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

/** The failure a pin raises on a mutated source, or `null` where it stayed green. */
/** @param {() => void} pin */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    return /** @type {Error} */ (error);
  }
  return null;
}

/** The battery, one file's mutations at a time. */
const BATTERY = [
  {
    label: INDEX,
    source: INDEX_SOURCE,
    mutations: INDEX_MUTATIONS,
    load: loadIndex,
  },
  {
    label: JOIN,
    source: JOIN_SOURCE,
    mutations: JOIN_MUTATIONS,
    load: loadJoin,
  },
];

test('T002 mutants — every anchor is one place in the shipped file and really changes it', () => {
  for (const one of BATTERY)
    for (const mutation of one.mutations) {
      assert.equal(
        one.source.split(mutation.anchor).length - 1,
        1,
        `mutation ${mutation.id} anchors on exactly one place in ${one.label}`,
      );
      mutated(one.source, mutation);
      assert.equal(
        typeof mutation.pin,
        'function',
        `mutation ${mutation.id} has a pin`,
      );
    }
});

test('T002 mutants — each defect reddens its pin, and the failure names the defect by string', () => {
  const lines = [];
  for (const one of BATTERY) {
    for (const mutation of one.mutations) {
      const source = mutated(one.source, mutation);

      // The pin is green on the file as it sits on disk first, so a failure below is the mutation's and
      // not a pin that was already red — and a pin that never loaded the file would fail here.
      mutation.pin(one.load(), one.source);

      const failure = failureOf(() => mutation.pin(one.load(source), source));
      assert.ok(
        failure !== null,
        `mutation ${mutation.id} must redden the pin that names it, and it reddened nothing`,
      );
      assert.match(
        failure.message,
        new RegExp(mutation.defect),
        `mutation ${mutation.id} must redden a pin naming "${mutation.defect}", and it said: ${failure.message.split('\n')[0]}`,
      );
      assert.ok(
        failure.message.includes(mutation.names),
        `mutation ${mutation.id} must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
      );
      lines.push(`${mutation.id}: ${failure.message.split('\n')[0]}`);
    }
  }
  console.log(`T002 mutants: ${lines.join(' || ')}`);
});
