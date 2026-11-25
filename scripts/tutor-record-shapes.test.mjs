// @ts-check
// Run: node --experimental-strip-types --test scripts/tutor-record-shapes.test.mjs
//
// M055 T001 measured the shape of every verdict-claims record and every surface record on disk:
// which field names the milestone, which names a criterion and its text, which names the artefact
// file, and where that map does not hold — because a wave that names a field the records do not
// carry is building on prose, and the derivation's template prose (C3) is exactly a field that
// looks like an answer and is not. `research/raw/m055-record-shapes.json` is that measurement.
//
// A record nobody re-reads drifts the way a comment does, so this suite holds the recording to the
// tree, four ways:
//
//   citations   every `path:line` the recording makes is re-resolved by reading the file it names
//               and searching that file for the exact line the recording quotes — never by
//               trusting the typed number, and never by trusting the quotation either. A citation
//               that slid off its line reddens naming the claim it belongs to.
//   the table   every record's presence, absence and count is re-measured from the file itself, so
//               a record that claims a field it does not carry — or hides one it does — reddens.
//               The recording states its own absences (`absentFields`, and an `instead` for each),
//               and this suite asserts that statement is true rather than that it exists.
//   paths       every artefact path a record names is resolved at this head. A path that stopped
//               resolving is the missing-artefact state E4 renders; the recording states how many
//               resolve and which do not, and this suite re-measures both.
//   the two findings
//               the negative measurement (no record carries end-user question vocabulary mapped to
//               a criterion) and the C3 trap (the derivation's `reason` is one template across
//               milestones, and its commands cite a suite the recorded milestone never names) are
//               re-derived from the records rather than read back, because both are claims about
//               what the records do *not* hold.
//
// Nothing here builds: no index, no join, no surface and no route. It reads the records, the files
// they name and git; a default run writes nothing, and `M055_CAPTURE=1` arms the one write (T010).
//
// M057 T006 reads this milestone's own map, `research/raw/m057-record-shapes.json`, beside M055's (C2,
// C7), because two suites reading one recording by two rules is the defect M055's T004 hit twice. The
// inventory check below subtracts the union of the paths every map read here names in
// `inventory.outsideTheMap` — read from the records themselves, never from a list this suite holds —
// and each map may name outside itself only the records its own milestone owes, so a third record
// cannot be excused by editing a recording and a record another map measures is never subtracted here.
// A record present and named by no map still reddens naming it.
//
// M058 T001 added its map, `research/raw/m058-record-shapes.json`, to the same read rather than to a
// second rule: it measures no record under `research/raw/` (its citations are lines of the records this
// milestone's answer reads), and it names the two records M058 owes — the surface T003 writes and the
// verdict-claims T004 writes — outside itself from the start. So a record either milestone lands is
// excused by its own map, and the two records M058 still owes are absent at this head with nothing
// measured by its map to be missing.
//
// M059 T010 added its map, `research/raw/m059-record-shapes.json`, to the same read for the same
// reason: it measures no verdict-claims or surface record — its sections are read from the digest, the
// two shipped joins, the capture record and M045's map — and it names the two records M059 owes, the
// surface T003 writes and the verdict-claims T004 writes, outside itself, so both are subtracted from
// the census by the recording that says so rather than by a path listed here.
//
// M060 T001 added its map, `research/raw/m060-record-shapes.json`, to the same read for the same
// reason: it measures no verdict-claims or surface record — its sections are read from
// extension/agent-main.js — and it names the two records M060 owes, the surface T003 writes and the
// verdict-claims T004 writes, outside itself through its own `inventory.outsideTheMap` (derived by its
// capture suite), so both are subtracted from the census by the recording that says so rather than by a
// path listed here.
//
// M061 T004 added its map, `research/raw/m061-record-shapes.json`, to the same read by the same rule:
// it measures the provider record extension/agent-main.js carries and names the two records M061 owes
// — the surface T003 writes and the verdict-claims record this task writes — outside itself, so the
// record this task lands is subtracted by the recording that says so, and the map's own row is the one
// the census below reads back.
//
// M062 T004 lands its claim list before the map that would excuse it — the plan writes the claims at
// T004 and `m062-record-shapes.json` at T005 — so there is no map to name it outside. The census
// therefore reads a third kind of excuse, and only for a record that earns it: a record whose own
// `capture.command` names a suite this checkout carries, where that suite names the kind of record it
// captures and reads the armed flag the command states. Such a record is measured by the suite that
// writes and reads it back rather than by a map that does not exist yet, and the moment the map lands
// the rule above excuses it in the ordinary way. A record that merely names a suite earns nothing: the
// named suite has to carry it, be present, and be the one the command's flag arms.
//
// M063 T005 added its map, `research/raw/m063-record-shapes.json`, to the same read by the same rule:
// it measures no verdict-claims or surface record — its sections are read from
// `extension/guard-phase.js` and `extension/guard-answer.js`, run in a bare context — and it names the
// one record M063 owes, the verdict-claims record T004 publishes, outside itself, so that record is
// subtracted by the recording that says so. Its own map is held by the census `M063_CAPTURE=1`
// writes, which is also why the two records M063 earns are each excused by their own capture command
// before any map is read for them.
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const RECORD = 'research/raw/m055-record-shapes.json';
const RAW = 'research/raw';
const SCHEMA = 'm055-record-shapes/v1';
const VC_PATTERN = /^m0\d\d-verdict-claims\.json$/;
const SF_PATTERN = /^m0\d\d-surface\.json$/;

/** This milestone's own map, read beside M055's on every run (C2, C7). */
const OWN_RECORD = 'research/raw/m057-record-shapes.json';
const OWN = JSON.parse(
  readFileSync(join(ROOT, ...OWN_RECORD.split('/')), 'utf8'),
);

/**
 * The maps read beside M055's, each with the path it sits at: every milestone that wrote a map after
 * M055 is read here by one rule rather than by a rule of its own (C2, C7).
 */
const LATER = Object.freeze(
  [
    'research/raw/m057-record-shapes.json',
    'research/raw/m058-record-shapes.json',
    'research/raw/m059-record-shapes.json',
    'research/raw/m060-record-shapes.json',
    'research/raw/m061-record-shapes.json',
    'research/raw/m063-record-shapes.json',
  ].map((rel) => ({
    rel,
    map: JSON.parse(readFileSync(join(ROOT, ...rel.split('/')), 'utf8')),
  })),
);

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
  M060: [
    'research/raw/m060-surface.json',
    'research/raw/m060-verdict-claims.json',
  ],
  M061: [
    'research/raw/m061-surface.json',
    'research/raw/m061-verdict-claims.json',
  ],
  M063: [
    'research/raw/m063-surface.json',
    'research/raw/m063-verdict-claims.json',
  ],
});

/** The seven fields the map is measured over, in the order the recording states them. */
const FIELD_IDS = Object.freeze([
  'milestone',
  'criterion',
  'criterionText',
  'artefactPath',
  'recordings',
  'suitePath',
  'captureRecords',
]);

/** Which claim of the recording states each field. */
const CLAIM_OF = Object.freeze({
  milestone: 'F1',
  criterion: 'F2',
  criterionText: 'F3',
  artefactPath: 'F4',
  recordings: 'F5',
  suitePath: 'F6',
  captureRecords: 'F7',
});

/** The JSON key a field is carried under, which is what its cited line has to start with. */
const JSON_KEY = Object.freeze({
  milestone: 'milestone',
  criterion: 'criterion',
  criterionText: 'criterionText',
  artefactPath: 'artefactPath',
  recordings: 'recordings',
  suitePath: 'path',
  captureRecords: 'records',
});

/**
 * The block a cited line has to sit inside, for the two fields whose key is not unique in the file:
 * `path` is carried by `evidence.intent`, `evidence.plan` and every suite, and `records` only by
 * `capture`. A citation that quotes the right key on the wrong line is refused here.
 */
const REGION = Object.freeze({
  suitePath: /^\s*"suites": \[/,
  captureRecords: /^\s*"capture": \{/,
});

/** The suite the derivation's commands cite: M041's, named by records that never ran it. */
const NAV = 'scripts/navigation-blocking.test.mjs';

/** The keys a question would be carried under, matched case-insensitively anywhere in a record. */
const QUESTION_KEY = /question|query|prompt/i;

/** A key named `ask` is a question; a key named `task` is not, which a substring pattern would miss. */
const QUESTION_EXACT = /^(?:ask|asks|asked)$/i;

/** The over-broad pattern, measured so the sharp one is proven rather than assumed. */
const BROAD_ASK = /ask|question|query|prompt/i;

// ---------------------------------------------------------------- reading ----

/** @type {Map<string, readonly string[]>} */
const LINES = new Map();

/**
 * The lines of a repository file, split the way a line number counts them. A path the tree does not
 * hold throws here, which is itself a check: a citation names a real file.
 * @param {string} rel
 * @returns {readonly string[]}
 */
function linesOf(rel) {
  if (!LINES.has(rel)) {
    LINES.set(
      rel,
      readFileSync(join(ROOT, ...rel.split('/')), 'utf8').split(/\r?\n/),
    );
  }
  return LINES.get(rel) ?? [];
}

/**
 * @param {string} rel
 * @returns {any}
 */
function jsonOf(rel) {
  return JSON.parse(readFileSync(join(ROOT, ...rel.split('/')), 'utf8'));
}

/**
 * The trimmed text of one line, or null where the file does not reach it.
 * @param {string} rel
 * @param {number} line
 * @returns {string | null}
 */
function textAt(rel, line) {
  const lines = linesOf(rel);
  if (!Number.isInteger(line) || line < 1 || line > lines.length) return null;
  return String(lines[line - 1] ?? '')
    .replace(/\r$/, '')
    .trim();
}

/**
 * The 1-indexed line of the first line of `rel` matching `re`, at or after `from`.
 * @param {string} rel
 * @param {RegExp} re
 * @param {number} [from]
 * @returns {number}
 */
function lineMatching(rel, re, from = 0) {
  const lines = linesOf(rel);
  for (let index = from; index < lines.length; index += 1)
    if (re.test(lines[index])) return index + 1;
  assert.fail(`${rel} holds no line matching ${re}`);
}

/**
 * The first 60 characters of a quotation, for a failure message that stays readable.
 * @param {string} text
 * @returns {string}
 */
function short(text) {
  return text.length <= 60 ? text : `${text.slice(0, 60)}…`;
}

/**
 * One citation, resolved the way the task demands: by reading the file it names and searching that
 * file for the exact line it quotes. The typed number is checked against what the search found, so
 * neither the number nor the quotation is trusted on its own.
 * @param {any} citation
 * @param {string} where
 * @returns {number} the line the search found the quotation on
 */
function resolveCitation(citation, where) {
  assert.ok(
    citation !== null && typeof citation === 'object',
    `${where}: a citation is an object`,
  );
  const rel = citation.path;
  assert.equal(typeof rel, 'string', `${where}: path is a string`);
  assert.ok(
    rel.startsWith(`${RAW}/`) && rel.endsWith('.json'),
    `${where}: path ${String(rel)} is a record under ${RAW}/`,
  );
  assert.ok(!rel.includes('\\'), `${where}: path ${rel} is posix`);
  assert.ok(
    Number.isInteger(citation.line) && citation.line >= 1,
    `${where}: line is ${String(citation.line)}, not a 1-indexed number`,
  );
  assert.equal(typeof citation.text, 'string', `${where}: text is a string`);
  assert.ok(citation.text.length > 0, `${where}: text says something`);
  assert.equal(
    citation.text,
    citation.text.trim(),
    `${where}: text carries the line's own trimmed text, not "${short(citation.text)}" with its indent`,
  );
  assert.ok(
    existsSync(join(ROOT, ...rel.split('/'))),
    `${where}: ${rel} is in the tree`,
  );

  const found = [];
  const lines = linesOf(rel);
  for (let index = 0; index < lines.length; index += 1)
    if (
      String(lines[index] ?? '')
        .replace(/\r$/, '')
        .trim() === citation.text
    )
      found.push(index + 1);
  assert.ok(
    found.length > 0,
    `${where}: quotes "${short(citation.text)}" and ${rel} holds no line with that text — the quotation was typed rather than read`,
  );
  assert.ok(
    found.includes(citation.line),
    `${where}: cites ${rel}:${citation.line} and searching the file for the quoted line finds it at ${found.join(', ')} — the number is not where the line it quotes sits`,
  );
  return citation.line;
}

/**
 * Whether the citation sits inside the block its field is carried in, for the two fields whose key
 * is not unique in the file.
 * @param {string} rel
 * @param {string} id
 * @param {number} line
 * @param {string} where
 */
function assertRegion(rel, id, line, where) {
  const marker = REGION[id] ?? null;
  if (marker === null) return;
  const at = lineMatching(rel, marker);
  assert.ok(
    line > at,
    `${where}: cites ${rel}:${line} and "${JSON_KEY[id]}" is carried by the block that opens at ${rel}:${at} — the cited line is outside it`,
  );
}

// ------------------------------------------------------------ measurement ----

/**
 * How many places in one record carry `id`: the claim rows for the claim fields, the entries for
 * the lists. This is the one measurement the recording's per-file table is made of.
 * @param {any} json
 * @param {string} id
 * @returns {number}
 */
function countField(json, id) {
  const claims = Array.isArray(json.claims) ? json.claims : [];
  const evidence =
    json.evidence !== null && typeof json.evidence === 'object'
      ? json.evidence
      : null;
  const capture =
    json.capture !== null && typeof json.capture === 'object'
      ? json.capture
      : null;
  switch (id) {
    case 'milestone':
      return 'milestone' in json ? 1 : 0;
    case 'criterion':
    case 'criterionText':
    case 'artefactPath':
      return claims.filter(
        (claim) => claim !== null && typeof claim === 'object' && id in claim,
      ).length;
    case 'recordings': {
      const value = evidence === null ? undefined : evidence.recordings;
      if (value === undefined) return 0;
      return Array.isArray(value) ? value.length : 1;
    }
    case 'suitePath': {
      const suites = evidence === null ? undefined : evidence.suites;
      return Array.isArray(suites)
        ? suites.filter(
            (entry) =>
              entry !== null &&
              typeof entry.path === 'string' &&
              entry.path.trim() !== '',
          ).length
        : 0;
    }
    case 'captureRecords': {
      const value = capture === null ? undefined : capture.records;
      return typeof value === 'string' && value.trim() !== '' ? 1 : 0;
    }
    default:
      assert.fail(`unknown field ${id}`);
  }
}

/**
 * The keys a claim row carries, taken as a union so one record has one shape.
 * @param {readonly any[]} claims
 * @returns {string[]}
 */
function unionKeys(claims) {
  const seen = new Set();
  for (const claim of claims)
    if (claim !== null && typeof claim === 'object')
      for (const key of Object.keys(claim)) seen.add(key);
  return [...seen].sort();
}

/**
 * The derivation's `reason` with its substitutions taken out: the criterion id, the criterion's own
 * text (escaped or not) and every bracketed list of quoted strings. Two rows that differ only in
 * what they substitute land on the same template, which is what makes the repetition measurable
 * rather than a matter of reading.
 * @param {string} criterionText
 * @param {string} reason
 * @returns {string}
 */
function templateOf(criterionText, reason) {
  let text = reason;
  text = text.split(criterionText).join('«criterionText»');
  text = text.split(criterionText.replace(/"/g, '\\"')).join('«criterionText»');
  text = text.replace(/\[(?:"[^"]*"\s*,?\s*)*\]/g, '«list»');
  return text.replace(/\bSC\d\b/g, '«SC»');
}

/**
 * Every key at every depth that a question could be carried under, or that an over-broad `ask`
 * pattern would call one. A record that maps a user question to a criterion would have to hold a
 * question key, so measuring this is measuring the negative — and the near-miss list is what proves
 * the pattern is sharp: `task` carries the letters of `ask` and is not a question.
 * @param {any} value
 * @param {'question' | 'near'} [kind]
 * @returns {string[]}
 */
function questionShapedKeys(value, kind = 'question') {
  /** @type {string[]} */
  const hits = [];
  /** @param {any} node @param {string} at */
  const walk = (node, at) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => walk(item, `${at}[${index}]`));
      return;
    }
    if (node === null || typeof node !== 'object') return;
    for (const [key, inner] of Object.entries(node)) {
      const where = at === '' ? key : `${at}.${key}`;
      const question = QUESTION_KEY.test(key) || QUESTION_EXACT.test(key);
      if (kind === 'question' ? question : BROAD_ASK.test(key) && !question)
        hits.push(where);
      walk(inner, where);
    }
  };
  walk(value, '');
  return hits;
}

/** The milestone id a record's own file name states, e.g. `M054`. */
function ownIdOf(rel) {
  const found = /m(\d{3})-/.exec(rel);
  assert.ok(found !== null, `${rel} names a milestone in its file name`);
  return `M${found[1]}`;
}

/** The verdict-claims and surface records present in the tree, as repository paths. */
function presentRecords() {
  const names = readdirSync(join(ROOT, RAW)).sort();
  return {
    verdictClaims: names
      .filter((name) => VC_PATTERN.test(name))
      .map((name) => `${RAW}/${name}`),
    surface: names
      .filter((name) => SF_PATTERN.test(name))
      .map((name) => `${RAW}/${name}`),
  };
}

// ------------------------------------------------------------------ checks ----

/**
 * The recording's own shape and provenance: the values no reading of the tree settles, checked
 * before anything is compared so a hand-edited heading is named rather than read as a difference.
 * @param {any} candidate
 */
function validateShape(candidate) {
  assert.ok(
    candidate !== null && typeof candidate === 'object',
    'the recording is an object',
  );
  assert.equal(
    candidate.schema,
    SCHEMA,
    `the recording schema is ${String(candidate.schema)}`,
  );
  assert.equal(
    candidate.milestone,
    'M055',
    `the recording milestone is ${String(candidate.milestone)}`,
  );
  assert.equal(
    candidate.task,
    'T001',
    `the recording task is ${String(candidate.task)}`,
  );
  for (const key of ['title', 'question', 'measuredAt'])
    assert.ok(
      typeof candidate[key] === 'string' && candidate[key].trim() !== '',
      `the recording states its own ${key}`,
    );
  assert.match(
    String(candidate.head),
    /^[0-9a-f]{40}$/,
    `the recording head is ${String(candidate.head)}, not one commit sha`,
  );
  assert.equal(
    candidate.headCommand,
    'git rev-parse HEAD',
    'the recording states the command its head was read by',
  );
  assert.ok(
    candidate.instrument !== null && typeof candidate.instrument === 'object',
    'the recording carries its instrument: what was read, how, and what `holds` means',
  );
  assert.ok(
    Array.isArray(candidate.unknowns) && candidate.unknowns.length > 0,
    'the recording states what it could not establish',
  );
  for (const unknown of candidate.unknowns)
    assert.ok(
      typeof unknown === 'string' && unknown.trim() !== '',
      'every unknown says something',
    );
}

/**
 * The head the recording was measured at is a commit this checkout carries, and it is behind (or
 * equal to) the head the suite is running at. It is deliberately not pinned to HEAD: the commit
 * that lands the recording moves HEAD, and a record pinned at HEAD would pin nothing it outlives.
 * @param {any} candidate
 */
function validateHead(candidate) {
  const run = spawnSync(
    'git',
    ['rev-parse', '--verify', `${String(candidate.head)}^{commit}`],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  );
  assert.equal(
    run.status,
    0,
    `git rev-parse --verify ${String(candidate.head)}^{commit} must resolve the head the recording names: ${String(run.stderr)}`,
  );
  assert.equal(
    String(run.stdout).trim(),
    String(candidate.head),
    'the recorded head resolves to itself, so it names a commit rather than a branch',
  );
  const behind = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', String(candidate.head), 'HEAD'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  );
  assert.equal(
    behind.status,
    0,
    `the recorded head ${String(candidate.head).slice(0, 8)} must be an ancestor of this HEAD, or the record was measured somewhere this checkout is not`,
  );
}

/**
 * The paths one recording names in `inventory.outsideTheMap`: the records it measured its map before,
 * which it names on purpose rather than omitting. A map that carries no inventory at all names nothing
 * outside itself, which is a statement too — it measures no record yet.
 * @param {any} map
 * @returns {string[]}
 */
function outsideTheMapOf(map) {
  return (map.inventory?.outsideTheMap ?? []).map(
    (/** @type {any} */ entry) => entry.path,
  );
}

/**
 * The paths every map read here names outside itself: the whole subtraction. Each map contributes only
 * what its own record states, so a path is subtracted because a recording says so and never because
 * this suite lists it.
 * @param {any} candidate
 * @returns {string[]}
 */
function outsideEither(candidate) {
  const maps = [candidate, ...LATER.map((entry) => entry.map)];
  return [...new Set(maps.flatMap((map) => outsideTheMapOf(map)))];
}

/**
 * The records one map measures, by the lists its inventory carries. A map that carries no inventory
 * measures nothing, so every record of its own milestone which is present would have to be named
 * outside it.
 * @param {any} map
 * @returns {string[]}
 */
function measuredByMap(map) {
  return [
    ...(map.inventory?.verdictClaims?.paths ?? []),
    ...(map.inventory?.surface?.paths ?? []),
  ];
}

/**
 * The milestone the state file binds, as `m065`, or `''` where the file binds none. This is the same
 * reading `scripts/verdict-claims-intent.mjs` makes, and it is the only way to hold a census that
 * derives its record's path rather than spelling it: the path it writes is a function of the bound
 * milestone, so the milestone is what says which record that census holds.
 *
 * @returns {string}
 */
function boundMilestone() {
  const state = join(ROOT, '.project', 'STATE.md');
  if (!existsSync(state)) return '';
  const branch = /^branch:\s*(\S+)\s*$/m.exec(readFileSync(state, 'utf8'))?.[1];
  const number = /^gsd-path\/M(\d{3})$/.exec(String(branch))?.[1];
  return number === undefined ? '' : `m${number}`;
}

/**
 * A record its own census writes and reads back, so the map census is not the only thing that measures
 * it. The test is read from the record's own `capture.command`, never from a list here: the command
 * must name a suite this checkout carries, that suite must name *this record's path* and must read the
 * armed flag the command states. A record that names a suite which does not exist, or whose source does
 * not name the record, or whose flag the suite does not read, earns nothing and is held against the maps
 * exactly as before.
 *
 * A census may also derive its record's path from the bound branch instead of spelling it, and the
 * census M044 introduced — `scripts/navigation-blocking.test.mjs`, which recorded every milestone from
 * M044 to M061 and which M065 names again — does exactly that: it writes
 * `research/raw/<the bound milestone>-verdict-claims.json`. Such a census holds one record at a head,
 * this milestone's, and it reads that record back; so the record it derives at this head is excused and
 * no other is. That is what keeps this reading narrow: the same template is the census of every earlier
 * milestone, and at this head it derives M065's path, not theirs, so their records stay measured by the
 * maps and the count this map states does not move when one of them is subtracted.
 * @param {string} rel the record's repository path
 * @returns {boolean}
 */
function heldByItsOwnCensus(rel) {
  let json;
  try {
    json = jsonOf(rel);
  } catch {
    return false;
  }
  const command = String(json?.capture?.command ?? '');
  const owner = /scripts\/[a-z0-9-]+\.test\.mjs/.exec(command)?.[0];
  const flag = /M\d{3}_CAPTURE/.exec(command)?.[0];
  if (owner === undefined || flag === undefined) return false;
  const ownerPath = join(ROOT, ...owner.split('/'));
  if (!existsSync(ownerPath)) return false;
  const source = readFileSync(ownerPath, 'utf8');
  if (source.includes(rel) && source.includes(flag)) return true;
  const template =
    /`research\/raw\/\$\{[^}]*\}-(verdict-claims|surface)\.json`/.exec(source);
  const bound = boundMilestone();
  if (template === null || bound === '') return false;
  return rel === `research/raw/${bound}-${template[1]}.json`;
}

/**
 * The records the map is measured over: every record present except the ones the two recordings name
 * in `inventory.outsideTheMap`, and except a record its own census captures and reads back. M055's T004
 * captured its two records after the map was measured and named them there on purpose rather than
 * omitting them; M057's map is read by the same rule rather than by a second one. Only the named paths
 * and the self-held ones are subtracted, so a record that appears later without being named is still
 * held against the map and reddens.
 * @param {any} candidate the map to read, M055's on the default path
 * @param {{ verdictClaims: string[], surface: string[] }} [present] the records the tree holds, by
 *   default read from disk; a mutant passes a synthetic list so a record that is not on disk can
 *   still be held against the maps
 * @returns {{ verdictClaims: string[], surface: string[] }}
 */
function mappedRecords(candidate, present = presentRecords()) {
  const outside = outsideEither(candidate);
  return {
    verdictClaims: present.verdictClaims.filter(
      (path) => !outside.includes(path) && !heldByItsOwnCensus(path),
    ),
    surface: present.surface.filter(
      (path) => !outside.includes(path) && !heldByItsOwnCensus(path),
    ),
  };
}

/**
 * A map read beside M055's, held by the same rules M055's is, in the same code path — because two
 * suites reading one recording by two rules is the defect this task repairs (C2, C7):
 *
 *   only its own     the map may name outside itself only a record its own milestone owes, so a third
 *                    record cannot be excused by editing a recording and a record another map measures
 *                    is never subtracted.
 *   nothing unmeasured
 *                    a record of its own milestone which is present and which the map does not measure
 *                    must be named outside it, so nothing this milestone lands reads as unmeasured and
 *                    the refusal names the record rather than a bare count.
 *
 * M057's map names the two records M057 owes, and M058's map names the two records M058 owes, so both
 * are read by this one rule rather than by a rule each. At this head M058's two records are absent, so
 * its map measures nothing that could be missing — and the first one to land is excused by name rather
 * than read as unmeasured.
 * @param {any} [map] the map to hold, by default M057's
 * @param {{ verdictClaims: string[], surface: string[] }} [present] see {@link mappedRecords}
 */
function validateOwnMap(map = OWN, present = presentRecords()) {
  const where =
    LATER.find((entry) => entry.map.milestone === map.milestone)?.rel ??
    `${String(map.milestone)}'s map`;
  const pinned =
    PINNED_OUTSIDE[
      /** @type {'M057'|'M058'|'M059'|'M060'|'M061'} */ (map.milestone)
    ] ?? null;
  assert.ok(
    pinned !== null,
    `${where} is read beside M055's and must be a map of a milestone that owes two records, and it says ${String(map.milestone)}`,
  );
  const named = outsideTheMapOf(map);
  for (const path of named)
    assert.ok(
      pinned.includes(path),
      `${path} is named outside ${where} and is not one of the two records this milestone owes (${pinned.join(', ')}): a map may excuse only its own record, so a third record cannot be excused by naming it outside a recording`,
    );
  const measured = measuredByMap(map);
  for (const path of [...present.verdictClaims, ...present.surface]) {
    if (ownIdOf(path) !== map.milestone || measured.includes(path)) continue;
    assert.ok(
      named.includes(path),
      `${path} is this milestone's record and is present, and ${where} measures it nowhere and names it nowhere outside itself: the two inventories would read it as an unmeasured record, which is the refusal M055's T004 hit twice — the recording names what it measured, so name ${path} in its inventory.outsideTheMap or measure it`,
    );
  }
}

/**
 * Every record present is measured, and every record measured is present. The two records each
 * milestone captures after its map was measured are named outside that map on purpose, so landing them
 * cannot silently outgrow a map that was measured before they existed — and a record of another
 * milestone that appears later is a red test rather than an unmeasured record. Every map read beside
 * M055's is held here by one rule (C2, C7).
 * @param {any} candidate
 * @param {{ verdictClaims: string[], surface: string[] }} [present] see {@link mappedRecords}
 */
function validateInventory(candidate, present = presentRecords()) {
  const inventory = candidate.inventory;
  assert.ok(
    inventory !== null && typeof inventory === 'object',
    'the recording carries an inventory',
  );
  const own = outsideTheMapOf(candidate);
  for (const entry of inventory.outsideTheMap ?? []) {
    assert.ok(
      typeof entry.why === 'string' && entry.why.includes('T004'),
      `outsideTheMap[${String(entry.path)}] says why it is outside the map`,
    );
  }
  assert.deepEqual(
    [...own].sort(),
    [...PINNED_OUTSIDE.M055].sort(),
    'the records outside the map are exactly the two this milestone captures at T004, so a record of another milestone cannot be excused by naming it outside the map',
  );
  for (const entry of LATER) validateOwnMap(entry.map, present);
  const outside = outsideEither(candidate);
  const mapped = mappedRecords(candidate, present);
  assert.deepEqual(
    inventory.verdictClaims?.paths,
    mapped.verdictClaims,
    `the map measures every verdict-claims record present, the records the maps name outside themselves excepted: the tree holds ${present.verdictClaims.length}, and the maps name ${outside.length} outside themselves (${outside.join(', ')})`,
  );
  assert.deepEqual(
    inventory.surface?.paths,
    mapped.surface,
    `the map measures every surface record present, the records the maps name outside themselves excepted: the tree holds ${present.surface.length}, and the maps name ${outside.length} outside themselves (${outside.join(', ')})`,
  );
  assert.equal(
    inventory.verdictClaims?.count,
    mapped.verdictClaims.length,
    'inventory.verdictClaims.count is the list it carries',
  );
  assert.equal(
    inventory.surface?.count,
    mapped.surface.length,
    'inventory.surface.count is the list it carries',
  );

  const measured = (candidate.records ?? []).map((entry) => entry.path);
  assert.equal(
    new Set(measured).size,
    measured.length,
    'each record is measured once',
  );
  assert.deepEqual(
    [...measured].sort(),
    [...mapped.verdictClaims, ...mapped.surface].sort(),
    'the table carries one entry per record present and no entry for a record that is not there, the records the maps name outside themselves excepted',
  );
  for (const entry of candidate.records ?? [])
    assert.ok(
      !outside.includes(entry.path),
      `${String(entry.path)} is named as outside the map and is measured in it`,
    );
  for (const path of outside)
    assert.ok(
      !measured.includes(path),
      `${path} is outside the map and must not be measured in it`,
    );
}

/**
 * One record's own shape: the key sets the "shape they use instead" prose rests on, and the fields
 * the recording says are there and not there.
 * @param {any} entry
 */
function validateRecordEntry(entry) {
  const rel = entry.path;
  const where = `records[${String(rel)}]`;
  assert.ok(
    existsSync(join(ROOT, ...String(rel).split('/'))),
    `${where}: the record is in the tree`,
  );
  const json = jsonOf(rel);
  const claims = Array.isArray(json.claims) ? json.claims : null;
  const kind = rel.endsWith('-surface.json') ? 'surface' : 'verdict-claims';
  assert.equal(
    entry.kind,
    kind,
    `${where}: kind is ${kind}, as its file name says`,
  );
  assert.equal(
    entry.milestone,
    json.milestone,
    `${where}: milestone is the value the record carries, ${JSON.stringify(json.milestone)}`,
  );
  assert.equal(
    entry.claims,
    claims === null ? 0 : claims.length,
    `${where}: claims is the number of claim rows the record carries`,
  );
  assert.deepEqual(
    entry.topKeys,
    Object.keys(json),
    `${where}: topKeys is the record's own key list`,
  );
  assert.deepEqual(
    entry.claimKeys,
    claims === null ? null : unionKeys(claims),
    `${where}: claimKeys is the union of the claim rows' keys, which is what the "instead" prose names`,
  );
  assert.deepEqual(
    entry.evidenceKeys,
    json.evidence !== null && typeof json.evidence === 'object'
      ? Object.keys(json.evidence)
      : null,
    `${where}: evidenceKeys is the evidence block's key list`,
  );
  assert.deepEqual(
    entry.captureKeys,
    json.capture !== null && typeof json.capture === 'object'
      ? Object.keys(json.capture)
      : null,
    `${where}: captureKeys is the capture block's key list`,
  );

  const fields = entry.fields;
  assert.ok(
    fields !== null && typeof fields === 'object',
    `${where}: carries a field table`,
  );
  assert.deepEqual(
    Object.keys(fields).sort(),
    [...FIELD_IDS].sort(),
    `${where}: the field table covers all ${FIELD_IDS.length} fields`,
  );

  const absent = [];
  for (const id of FIELD_IDS) {
    const field = fields[id];
    const at = `${where}.fields.${id} (claim ${CLAIM_OF[id]})`;
    assert.equal(
      field.claim,
      CLAIM_OF[id],
      `${at}: the field is recorded under the claim that states it`,
    );
    const count = countField(json, id);
    assert.equal(
      field.count,
      count,
      `${at}: count is ${String(field.count)} and this head measures ${count}`,
    );
    if (field.present === true) {
      assert.ok(
        count > 0,
        `${at}: the record claims a field it does not carry — this head measures ${count} place(s) carrying it, so the field is absent here`,
      );
      assert.ok(
        Number.isInteger(field.line) && field.line >= 1,
        `${at}: line is a 1-indexed number`,
      );
      assert.equal(
        typeof field.text,
        'string',
        `${at}: text is the cited line's own trimmed text`,
      );
      assert.ok(
        String(field.text).startsWith(`"${JSON_KEY[id]}":`),
        `${at}: cites "${short(String(field.text))}", which is not a "${JSON_KEY[id]}" line`,
      );
      assertRegion(rel, id, field.line, at);
    } else {
      assert.equal(
        field.present,
        false,
        `${at}: present is true or false, not ${String(field.present)}`,
      );
      assert.equal(
        count,
        0,
        `${at}: the record states the field is absent and this head measures ${count} place(s) carrying it`,
      );
      assert.ok(
        typeof field.instead === 'string' && field.instead.trim() !== '',
        `${at}: an absent field states the shape the record uses instead`,
      );
      absent.push(id);
    }
  }

  assert.deepEqual(
    [...(entry.absentFields ?? [])].sort(),
    [...absent].sort(),
    `${where}: absentFields names exactly the fields the table marks absent — a record states its own absences`,
  );
}

/**
 * The per-file, per-field table, and the map's own summary of it.
 * @param {any} candidate
 */
function validateTable(candidate) {
  assert.ok(
    Array.isArray(candidate.records) && candidate.records.length > 0,
    'the recording carries a per-record table',
  );
  for (const entry of candidate.records) validateRecordEntry(entry);

  const sides = candidate.map?.sides;
  assert.ok(
    Array.isArray(sides) && sides.length === FIELD_IDS.length,
    'the map states one side per field',
  );
  for (const side of sides) {
    assert.ok(
      FIELD_IDS.includes(side.field),
      `the map states the field ${String(side.field)}`,
    );
    const measured = candidate.records.filter(
      (entry) => entry.fields[side.field]?.present === true,
    );
    const verdictClaims = measured.filter(
      (entry) => entry.kind === 'verdict-claims',
    ).length;
    const surface = measured.filter((entry) => entry.kind === 'surface').length;
    assert.equal(
      side.verdictClaims,
      verdictClaims,
      `map.sides[${side.field}].verdictClaims is ${String(side.verdictClaims)} and this head measures ${verdictClaims}`,
    );
    assert.equal(
      side.surface,
      surface,
      `map.sides[${side.field}].surface is ${String(side.surface)} and this head measures ${surface}`,
    );
    assert.equal(
      side.holds,
      verdictClaims === candidate.inventory.verdictClaims.count,
      `map.sides[${side.field}].holds says whether every verdict-claims record carries the field`,
    );
    assert.ok(
      typeof side.names === 'string' && side.names.trim() !== '',
      `map.sides[${side.field}] says what the field names`,
    );
  }
  assert.match(
    String(
      candidate.map.sides.find((side) => side.field === 'milestone')?.spelling,
    ),
    /bare id/,
    'the milestone side states that a surface record spells the id and the milestone name together',
  );
  assert.ok(
    Array.isArray(candidate.map.breaks) && candidate.map.breaks.length > 0,
    'the map states where it does not hold',
  );
}

/**
 * Each record's field is `null` or an entry of the shape a claimant would write.
 * @param {any} entry
 * @param {string} where
 */
function validateArtefactRow(entry, where) {
  assert.equal(typeof entry.record, 'string', `${where}: names the record`);
  assert.equal(
    typeof entry.criterion,
    'string',
    `${where}: names the criterion row`,
  );
  assert.equal(typeof entry.named, 'string', `${where}: names the path`);
  assert.equal(
    typeof entry.resolves,
    'boolean',
    `${where}: states whether the path resolves`,
  );
  const json = jsonOf(entry.record);
  const claim = (json.claims ?? []).find(
    (row) => row.criterion === entry.criterion,
  );
  assert.ok(
    claim !== undefined,
    `${where}: ${entry.criterion} is a claim row of ${entry.record}`,
  );
  assert.equal(
    claim.artefactPath,
    entry.named,
    `${where}: names the path the record states, ${JSON.stringify(claim.artefactPath)}`,
  );
  assert.equal(
    entry.resolves,
    existsSync(join(ROOT, ...entry.named.split('/'))),
    `${where}: resolves is measured at this head, and ${entry.named} is ${existsSync(join(ROOT, ...entry.named.split('/'))) ? 'there' : 'not there'}`,
  );
}

/**
 * The artefact-path measurement: every `claims[].artefactPath` in every record, with what it
 * resolves to at this head. A path that does not resolve is the missing-artefact state E4 renders,
 * so the recording states how many resolve and names the ones that do not.
 * @param {any} candidate
 */
function validateArtefacts(candidate) {
  const table = candidate.artefactPaths;
  assert.ok(
    table !== null && typeof table === 'object',
    'the recording carries its artefact-path table',
  );
  const rows = table.present;
  assert.ok(Array.isArray(rows), 'artefactPaths.present is a list');
  let expected = 0;
  for (const entry of candidate.records)
    expected += countField(jsonOf(entry.path), 'artefactPath');
  assert.equal(
    rows.length,
    expected,
    `the table carries one row per artefact path in the records: this head holds ${expected}`,
  );
  assert.equal(
    table.claimsCarryingIt,
    expected,
    'artefactPaths.claimsCarryingIt is the number of claim rows that name a path',
  );
  for (const [index, row] of rows.entries())
    validateArtefactRow(row, `artefactPaths.present[${index}]`);

  const unresolved = rows.filter((row) => row.resolves === false);
  assert.deepEqual(
    table.unresolved.map((row) => row.named),
    unresolved.map((row) => row.named),
    `artefactPaths.unresolved names the paths that do not resolve at this head, and this head measures ${unresolved.length}`,
  );
  assert.equal(
    table.resolved,
    rows.length - unresolved.length,
    'artefactPaths.resolved counts the paths that are there',
  );
  assert.equal(
    table.distinctPaths,
    new Set(rows.map((row) => row.named)).size,
    'artefactPaths.distinctPaths counts the files behind the rows',
  );

  const others = candidate.otherNamedPaths;
  assert.ok(
    others !== null && typeof others === 'object',
    'the recording names the paths that are not artefact paths',
  );
  for (const [index, row] of (others.rows ?? []).entries()) {
    const where = `otherNamedPaths.rows[${index}]`;
    assert.equal(
      typeof row.field,
      'string',
      `${where}: names the field it was found in`,
    );
    assert.equal(
      row.resolves,
      existsSync(join(ROOT, ...String(row.named).split('/'))),
      `${where}: resolves is measured at this head, and ${String(row.named)} is ${existsSync(join(ROOT, ...String(row.named).split('/'))) ? 'there' : 'not there'}`,
    );
  }
}

/**
 * Every citation the recording makes, with the place it sits and the claim it belongs to, so one
 * walk holds the whole record to the tree.
 * @param {any} candidate
 * @returns {Generator<[string, any]>}
 */
function* allCitations(candidate) {
  for (const claim of candidate.claims ?? []) {
    const at = `claims[${String(claim.id)}]`;
    for (const [index, citation] of (claim.citations ?? []).entries())
      yield [`${at}.citations[${index}] (claim ${String(claim.id)})`, citation];
  }
  for (const entry of candidate.records ?? []) {
    for (const id of FIELD_IDS) {
      const field = entry.fields?.[id];
      if (field?.present !== true) continue;
      yield [
        `records[${String(entry.path)}].fields.${id} (claim ${CLAIM_OF[id]})`,
        { path: entry.path, line: field.line, text: field.text },
      ];
    }
  }
  for (const [index, row] of (candidate.artefactPaths?.present ?? []).entries())
    yield [
      `artefactPaths.present[${index}] (claim F4)`,
      { path: row.record, line: row.line, text: row.text },
    ];
  for (const [index, row] of (candidate.otherNamedPaths?.rows ?? []).entries())
    yield [
      `otherNamedPaths.rows[${index}] (claim A1)`,
      { path: row.record, line: row.line, text: row.text },
    ];
  for (const [index, row] of (candidate.milestoneField?.rows ?? []).entries())
    yield [
      `milestoneField.rows[${index}] (claim G4)`,
      { path: row.path, line: row.line, text: row.text },
    ];
  for (const [index, row] of (
    candidate.negative?.surface?.question ?? []
  ).entries())
    yield [
      `negative.surface.question[${index}] (claim N1)`,
      { path: row.path, line: row.line, text: row.text },
    ];
  const trap = candidate.trap ?? {};
  for (const [index, citation] of (trap.sharedProse?.citations ?? []).entries())
    yield [`trap.sharedProse.citations[${index}] (claim C1)`, citation];
  for (const [index, citation] of (
    trap.artefactField?.citations ?? []
  ).entries())
    yield [`trap.artefactField.citations[${index}] (claim C4)`, citation];
  for (const [index, citation] of (
    trap.readingField?.citations ?? []
  ).entries())
    yield [`trap.readingField.citations[${index}] (claim C4)`, citation];
  for (const [index, citation] of (trap.proves?.citations ?? []).entries())
    yield [`trap.proves.citations[${index}] (claim C2)`, citation];
  for (const [index, row] of (trap.rulings?.topLevelTotals ?? []).entries())
    for (const [nth, citation] of (row.cited ?? []).entries())
      yield [
        `trap.rulings.topLevelTotals[${index}].cited[${nth}] (claim C3)`,
        { path: row.record, line: citation.line, text: citation.text },
      ];
  for (const [index, citation] of (
    trap.rulings?.claimRulingCitations ?? []
  ).entries())
    yield [`trap.rulings.claimRulingCitations[${index}] (claim C3)`, citation];
}

/**
 * The claims' own shape: each one is named once, says something, cites at least one line and states
 * what was observed at this head.
 * @param {any} candidate
 */
function validateClaims(candidate) {
  const claims = candidate.claims;
  assert.ok(
    Array.isArray(claims) && claims.length > 0,
    'the recording carries its claims',
  );
  const ids = claims.map((claim) => claim.id);
  assert.equal(new Set(ids).size, ids.length, 'each claim is named once');
  for (const claim of claims) {
    const where = `claims[${String(claim.id)}]`;
    assert.equal(
      typeof claim.statement,
      'string',
      `${where}: states what it claims`,
    );
    assert.ok(claim.statement.trim() !== '', `${where}: says something`);
    assert.ok(
      Array.isArray(claim.citations) && claim.citations.length > 0,
      `${where}: cites at least one path:line`,
    );
    assert.ok(
      claim.observedHere !== null && typeof claim.observedHere === 'object',
      `${where}: states what was observed at this head`,
    );
    assert.equal(
      typeof claim.observedHere.holds,
      'boolean',
      `${where}.observedHere.holds is true or false`,
    );
    assert.ok(
      typeof claim.observedHere.measured === 'string' &&
        claim.observedHere.measured.trim() !== '',
      `${where}.observedHere.measured says what was measured`,
    );
    if (
      CLAIM_OF[
        Object.keys(CLAIM_OF).find((key) => CLAIM_OF[key] === claim.id)
      ] !== undefined
    ) {
      const field = Object.keys(CLAIM_OF).find(
        (key) => CLAIM_OF[key] === claim.id,
      );
      const carried = candidate.records.filter(
        (entry) => entry.fields[field]?.present === true,
      );
      const verdictClaims = carried.filter(
        (entry) => entry.kind === 'verdict-claims',
      ).length;
      assert.equal(
        claim.counts?.verdictClaims,
        verdictClaims,
        `${where}.counts.verdictClaims is ${String(claim.counts?.verdictClaims)} and this head measures ${verdictClaims}`,
      );
      assert.equal(
        claim.observedHere.holds,
        verdictClaims === candidate.inventory.verdictClaims.count,
        `${where}.observedHere.holds is whether every verdict-claims record carries ${String(field)}`,
      );
      assert.equal(
        claim.absentFrom?.length,
        candidate.records.length - carried.length,
        `${where}.absentFrom names every record that does not carry the field`,
      );
    }
  }
  for (const id of FIELD_IDS)
    assert.ok(
      ids.includes(CLAIM_OF[id]),
      `the recording carries the claim ${CLAIM_OF[id]} for ${id}`,
    );
}

/**
 * The negative measurement and the trap, re-derived from the records rather than read back.
 * @param {any} candidate
 */
function validateFindings(candidate) {
  const present = mappedRecords(candidate);

  const questionKeys = [];
  const nearMisses = [];
  for (const rel of present.verdictClaims) {
    for (const key of questionShapedKeys(jsonOf(rel)))
      questionKeys.push(`${rel}:${key}`);
    for (const key of questionShapedKeys(jsonOf(rel), 'near'))
      nearMisses.push(`${rel}:${key}`);
  }
  assert.deepEqual(
    candidate.negative?.verdictClaims?.questionShapedKeys,
    questionKeys,
    `no verdict-claims record carries a question-shaped key: this head measures ${questionKeys.length}`,
  );
  assert.deepEqual(
    candidate.negative?.verdictClaims?.nearMatches,
    nearMisses,
    `the keys an over-broad \`ask\` pattern would call a question are stated as near matches rather than counted as questions: this head measures ${nearMisses.length}`,
  );
  for (const key of nearMisses)
    assert.match(
      key,
      /:task$|:[\w.]*\.task$/,
      `${key} is a near match, and every near match this head measures is a \`task\` field carrying a task id`,
    );
  assert.equal(
    candidate.negative?.verdictClaims?.records,
    present.verdictClaims.length,
    'the negative is measured over every verdict-claims record',
  );

  const questions = [];
  for (const rel of present.surface) {
    const json = jsonOf(rel);
    questions.push({
      path: rel,
      value: json.question,
      claims: Array.isArray(json.claims),
      criterionId: /\b(?:SC|E|N)\d\b/.test(String(json.question)),
    });
  }
  assert.equal(
    candidate.negative?.surface?.records,
    present.surface.length,
    'the negative is measured over every surface record',
  );
  assert.deepEqual(
    candidate.negative?.surface?.question?.map((row) => row.path),
    questions.map((row) => row.path),
    'every surface record’s `question` is carried with what it holds',
  );
  for (const [index, row] of questions.entries()) {
    const recorded = candidate.negative.surface.question[index];
    assert.equal(
      recorded.value,
      row.value,
      `negative.surface.question[${index}] carries the value the record holds`,
    );
    assert.ok(
      typeof recorded.asks === 'string' && recorded.asks.trim() !== '',
      `negative.surface.question[${index}] says what the value asks`,
    );
    assert.equal(
      row.criterionId,
      false,
      `${row.path}: a "question" that names a criterion id would be the mapping this milestone has to author`,
    );
    assert.equal(
      row.claims,
      false,
      `${row.path}: a surface record carries no claims array`,
    );
  }
  assert.equal(
    candidate.negative?.surface?.namingACriterionId,
    0,
    'no surface question names a criterion id',
  );
  assert.equal(
    candidate.negative?.surface?.carryingClaims,
    0,
    'no surface record carries a claim row',
  );
  assert.equal(
    candidate.negative?.holds,
    true,
    'the negative measurement holds at this head, which is what makes the mapping authored rather than read',
  );

  const trap = candidate.trap;
  assert.ok(
    trap !== null && typeof trap === 'object',
    'the recording carries the C3 trap',
  );
  assert.deepEqual(
    trap.neverRendered,
    ['reason', 'artefact', 'reading'],
    'the trap names the three fields this milestone never renders',
  );
  const fragment = String(trap.sharedProse?.fragment);
  assert.ok(fragment.length > 80, 'the shared prose is quoted, not described');
  assert.ok(
    String(trap.sharedProse?.template).includes(fragment),
    'the normalised template carries the quoted sentence verbatim',
  );

  const rows = [];
  const perRecord = new Map();
  for (const rel of present.verdictClaims) {
    const json = jsonOf(rel);
    for (const claim of json.claims ?? []) {
      const reason = String(claim.reason ?? '');
      if (!reason.includes(fragment)) continue;
      rows.push({
        path: rel,
        template: templateOf(String(claim.criterionText), reason),
      });
      perRecord.set(rel, (perRecord.get(rel) ?? 0) + 1);
    }
  }
  const templates = [...new Set(rows.map((row) => row.template))];
  assert.equal(
    rows.length,
    trap.sharedProse?.rows,
    `the shared prose is in ${rows.length} reason row(s) at this head and the recording states ${String(trap.sharedProse?.rows)}`,
  );
  assert.equal(
    perRecord.size,
    trap.sharedProse?.records,
    `the shared prose is in ${perRecord.size} record(s) at this head and the recording states ${String(trap.sharedProse?.records)}`,
  );
  assert.deepEqual(
    [...perRecord.entries()].map(([record, count]) => ({
      record,
      rows: count,
    })),
    trap.sharedProse?.perRecord,
    'the recording states how many rows of each record carry the shared prose',
  );
  assert.equal(
    templates.length,
    1,
    `the rows that carry the shared prose must be one template, and this head derives ${templates.length}`,
  );
  assert.equal(
    trap.sharedProse?.distinctTemplates,
    1,
    'the recording states that the prose is one template',
  );
  assert.equal(
    templates[0],
    trap.sharedProse?.template,
    'the recorded template is the one this head derives',
  );
  for (const [index, citation] of (trap.sharedProse?.citations ?? []).entries())
    assert.ok(
      textAt(citation.path, citation.line)?.includes(fragment) === true,
      `trap.sharedProse.citations[${index}] cites a line that carries the shared sentence`,
    );

  let provesRows = 0;
  let provesRecords = 0;
  const provesCiting = [];
  for (const rel of present.verdictClaims) {
    const json = jsonOf(rel);
    let carries = false;
    for (const claim of json.claims ?? []) {
      if (claim.proves === undefined) continue;
      carries = true;
      const text = Array.isArray(claim.proves)
        ? claim.proves.join(' ')
        : String(claim.proves);
      if (text.includes(NAV)) {
        provesRows += 1;
        provesCiting.push(rel);
      }
    }
    if (carries) provesRecords += 1;
  }
  assert.equal(
    trap.proves?.suite,
    NAV,
    `the trap names the suite its commands cite, ${NAV}`,
  );
  assert.equal(
    trap.proves?.suiteExistsAtThisHead,
    existsSync(join(ROOT, ...NAV.split('/'))),
    'the trap states whether the suite it names is in the tree',
  );
  assert.equal(
    trap.proves?.rowsCitingTheSuite,
    provesRows,
    `this head measures ${provesRows} claim row(s) whose \`proves\` cites ${NAV}`,
  );
  assert.equal(
    trap.proves?.recordsCitingTheSuite,
    new Set(provesCiting).size,
    'the trap counts the records whose `proves` cites the suite',
  );
  assert.equal(
    trap.proves?.recordsCarryingProves,
    provesRecords,
    'the trap counts the records that carry a `proves` field at all',
  );
  const inEvidence = present.verdictClaims.filter((rel) =>
    (jsonOf(rel).evidence?.suites ?? []).some((suite) => suite?.path === NAV),
  ).length;
  assert.equal(
    trap.proves?.evidenceSuitesNamingIt,
    inEvidence,
    `no record's \`evidence.suites\` names ${NAV}: this head measures ${inEvidence}`,
  );
  const captureCommands = present.verdictClaims.filter((rel) =>
    String(jsonOf(rel).capture?.command ?? '').includes(NAV),
  );
  assert.equal(
    trap.proves?.captureCommandsCitingIt,
    captureCommands.length,
    `the trap counts the records whose own capture command cites ${NAV}: this head measures ${captureCommands.length}`,
  );
  assert.deepEqual(
    trap.proves?.captureVariables,
    [
      ...new Set(
        captureCommands.map(
          (rel) =>
            /M\d{3}_CAPTURE/.exec(String(jsonOf(rel).capture?.command))?.[0] ??
            '',
        ),
      ),
    ],
    'the trap names the switch every capture command sets, which is the milestone whose suite it also cites',
  );

  let required = 0;
  let notRequired = 0;
  for (const rel of present.verdictClaims)
    for (const claim of jsonOf(rel).claims ?? []) {
      if (claim.ruling === 'required') required += 1;
      if (claim.ruling === 'not-required') notRequired += 1;
    }
  assert.equal(
    trap.rulings?.required,
    required,
    `the trap counts the ${required} \`required\` row(s)`,
  );
  assert.equal(
    trap.rulings?.notRequired,
    notRequired,
    `the trap counts the ${notRequired} \`not-required\` row(s)`,
  );
  assert.equal(
    trap.rulings?.rows,
    required + notRequired,
    'the trap counts every ruled row',
  );

  let artefactRows = 0;
  let artefactStart = 0;
  for (const rel of present.verdictClaims)
    for (const claim of jsonOf(rel).claims ?? []) {
      if (typeof claim.artefact !== 'string') continue;
      artefactRows += 1;
      if (
        typeof claim.artefactPath === 'string' &&
        claim.artefact.startsWith(claim.artefactPath)
      )
        artefactStart += 1;
    }
  assert.equal(
    trap.artefactField?.rows,
    artefactRows,
    'the trap counts the rows that carry an `artefact` field',
  );
  assert.equal(
    trap.artefactField?.rowsStartingWithTheArtefactPath,
    artefactStart,
    `the trap states how many \`artefact\` values begin with the claim's own path: this head measures ${artefactStart}`,
  );

  const pieces = candidate.milestoneField;
  assert.ok(
    pieces !== null && typeof pieces === 'object',
    'the recording states how `milestone` is spelled',
  );
  assert.deepEqual(
    pieces.rows.map((row) => row.path),
    [...present.verdictClaims, ...present.surface],
    'the milestone spelling table covers every record',
  );
  for (const row of pieces.rows) {
    const value = String(jsonOf(row.path).milestone);
    assert.equal(
      row.value,
      value,
      `milestoneField[${row.path}] carries the value the record holds`,
    );
    assert.equal(
      row.idOnly,
      value === ownIdOf(row.path),
      `milestoneField[${row.path}] states whether the record spells the id alone`,
    );
    assert.equal(
      row.startsWithOwnId,
      value.startsWith(ownIdOf(row.path)),
      `milestoneField[${row.path}] states whether the value begins with the record's own id`,
    );
  }
  assert.equal(
    pieces.idOnly,
    pieces.rows.filter((row) => row.idOnly).length,
    'the count of records that spell the bare id is the table it carries',
  );
  assert.equal(
    pieces.idAndName,
    pieces.rows.filter((row) => !row.idOnly).length,
    'the count of records that append the milestone name is the table it carries',
  );
}

/**
 * The whole check of one recording: its shape, the head it names, the records it measures, their
 * table, the artefact paths, every citation, the claims, and the two findings. Kept callable so a
 * doctored recording is put through exactly the check the recording itself passes.
 * @param {any} candidate
 * @returns {{ citations: number, records: number, artefactPaths: number }}
 */
function validate(candidate) {
  validateShape(candidate);
  validateHead(candidate);
  validateInventory(candidate);
  validateTable(candidate);
  validateArtefacts(candidate);
  validateClaims(candidate);
  let citations = 0;
  for (const [where, citation] of allCitations(candidate)) {
    resolveCitation(citation, where);
    citations += 1;
  }
  validateFindings(candidate);
  return {
    citations,
    records: (candidate.records ?? []).length,
    artefactPaths: (candidate.artefactPaths?.present ?? []).length,
  };
}

// ------------------------------------------------------------- the derivation ----
//
// M067 T010 gave this map the writer every other record in this programme carries, because a map
// re-typed at every rebind drifts: `research/raw/m055-record-shapes.json` carried no `capture` field,
// so nothing derived it, and it drifted twice — once at the rebind that orphaned
// `research/raw/m066-verdict-claims.json`. The writer is this suite's own derivation, armed with
// `M055_CAPTURE=1`, and it reuses the measurements the pins above already make — `countField`,
// `unionKeys`, `presentRecords`, `mappedRecords`, `outsideEither`, `templateOf`, `questionShapedKeys`,
// `lineMatching`, `textAt` — rather than a second copy of the map's shape, so there is one owner of
// what the map says. What no derivation can read is prose (the title, the statements, each absent
// field's `instead` sentence), and that is carried over from the document being re-derived.
//
// Three rules hold the write:
//
//   the arm      a default run derives the map at the head the file names and asserts the committed
//                bytes are exactly that serialization, naming the record that moved; it writes
//                nothing. Only `M055_CAPTURE=1` reaches the one `writeFileSync` in this file.
//   the pin      the bytes about to be written are put through this suite's own `validate`, so the
//                writer cannot emit a map the read-only run then calls wrong.
//   the fixed point
//                and the candidate must be the fixed point of that pin: re-deriving it at the head it
//                names reproduces it byte for byte, so a second armed run moves nothing. A candidate
//                that fails either refusal is not written at all.
//
// The armed run, from the repository root:
//   set "M055_CAPTURE=1"&& node --test scripts/tutor-record-shapes.test.mjs
//   M055_CAPTURE=1 node --test scripts/tutor-record-shapes.test.mjs

/** The map this suite writes, the arm that writes it and the commands a reader runs to re-derive it. */
const RECORD_PATH = join(ROOT, ...RECORD.split('/'));
const CAPTURE_ENV = 'M055_CAPTURE';
const HEAD_COMMAND = 'git rev-parse HEAD';
const CHECK_COMMAND = 'node --test scripts/tutor-record-shapes.test.mjs';
const ARMED_COMMAND = `${CAPTURE_ENV}=1 ${CHECK_COMMAND}`;
const ARMED_COMMAND_WINDOWS = `set "${CAPTURE_ENV}=1"&& ${CHECK_COMMAND}`;
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/**
 * The sections the map carries, in the order it states them. The derivation builds every one of them
 * and refuses a recorded document that carries a section it does not state or misses one it does.
 */
const RECORD_KEYS = Object.freeze([
  'schema',
  'milestone',
  'task',
  'title',
  'question',
  'head',
  'headCommand',
  'measuredAt',
  'capture',
  'instrument',
  'inventory',
  'milestoneField',
  'map',
  'records',
  'artefactPaths',
  'otherNamedPaths',
  'negative',
  'trap',
  'claims',
  'unknowns',
]);

/** The map as bytes, exactly as the writer writes them. @param {unknown} record */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

/** The commit this suite runs at: the head an armed run states, and never a hand-typed one. */
function gitHead() {
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  }).trim();
  assert.match(
    head,
    /^[0-9a-f]{40}$/,
    `${HEAD_COMMAND} must answer with one commit sha, and it answered ${JSON.stringify(head)}`,
  );
  return head;
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather
 * than reported as a mismatch somewhere in the record. The same walk `scripts/guard-record-shapes.test.mjs`
 * and `scripts/chunk-failure-claims.test.mjs` use to name a moved field.
 * @param {any} left
 * @param {any} right
 * @param {string} at
 * @returns {string}
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

/**
 * The first difference between the committed map and the one this head derives, naming the record that
 * moved before anything else: a count that moved is a sentence, a record that moved is a path, and the
 * refusal this map exists to make is the second one.
 * @param {any} recorded
 * @param {any} derived
 * @returns {string}
 */
function mapDifference(recorded, derived) {
  for (const [key, kind] of [
    ['verdictClaims', 'verdict-claims'],
    ['surface', 'surface'],
  ]) {
    const before = recorded?.inventory?.[key]?.paths ?? [];
    const after = derived?.inventory?.[key]?.paths ?? [];
    for (const path of after)
      if (!before.includes(path))
        return `${path} is a ${kind} record this head measures and ${RECORD} does not carry it`;
    for (const path of before)
      if (!after.includes(path))
        return `${RECORD} carries ${path} and this head does not measure it as a ${kind} record`;
  }
  const rows = new Map((recorded?.records ?? []).map((row) => [row.path, row]));
  for (const row of derived?.records ?? []) {
    const found = firstDifference(
      rows.get(row.path),
      row,
      `records[${row.path}]`,
    );
    if (found !== '') return found;
  }
  return firstDifference(recorded, derived, '');
}

/**
 * The line a JSON key sits on, and that line's own trimmed text: the `path:line` the map quotes, found
 * by searching the file for the key rather than typed.
 * @param {string} rel
 * @param {string} key
 * @param {number} [from] the 1-indexed line to start searching at
 * @returns {{ line: number, text: string }}
 */
function citationOf(rel, key, from = 0) {
  const line = lineMatching(rel, new RegExp(`^\\s*"${key}":`), from);
  return { line, text: String(textAt(rel, line)) };
}

/**
 * The line a record's field is cited on. For the two fields whose key is not unique in the file, the
 * search starts at the block the field is carried in — the same region the pins refuse a citation that
 * sits outside.
 * @param {string} rel
 * @param {string} id
 * @returns {{ line: number, text: string }}
 */
function fieldCitation(rel, id) {
  let from = 0;
  if (id === 'suitePath') from = lineMatching(rel, REGION.suitePath);
  if (id === 'captureRecords') from = lineMatching(rel, REGION.captureRecords);
  return citationOf(rel, JSON_KEY[id], from);
}

/**
 * Every line of a record that states an `artefactPath`, in file order, with its trimmed text: the rows
 * of the artefact-path table paired with the claims that carry the field, in the order both appear.
 * @param {string} rel
 * @returns {{ line: number, text: string }[]}
 */
function artefactCitedLines(rel) {
  const lines = linesOf(rel);
  const found = [];
  for (let index = 0; index < lines.length; index += 1) {
    const text = String(lines[index] ?? '')
      .replace(/\r$/, '')
      .trim();
    if (text.startsWith('"artefactPath":'))
      found.push({ line: index + 1, text });
  }
  return found;
}

/** The kind a record is, by the suffix its file name carries. @param {string} rel */
function kindOf(rel) {
  return rel.endsWith('-surface.json') ? 'surface' : 'verdict-claims';
}

/**
 * An absent field's sentence, for a record this map has not measured before: the shape a record uses
 * instead is the one thing a derivation cannot read, so a new absence states the keys the record does
 * carry rather than inventing a reading of them. A recorded sentence always wins over this one.
 * @param {any} json
 * @param {string} id
 * @returns {string}
 */
function derivedInstead(json, id) {
  return `no \`${JSON_KEY[id]}\` field at this head: the record's top-level keys are ${Object.keys(json).join(', ')}`;
}

/**
 * One record's row in the table: its key lists, its claim count and, for each of the seven fields, the
 * count this head measures, the line it is cited on and the shape it uses where it carries none.
 * @param {string} rel
 * @param {any} [previous] the row the committed map carries, whose `instead` sentences are prose
 * @returns {any}
 */
function recordEntryOf(rel, previous) {
  const json = jsonOf(rel);
  const claims = Array.isArray(json.claims) ? json.claims : [];
  const fields = {};
  const absent = [];
  for (const id of FIELD_IDS) {
    const count = countField(json, id);
    const field = { present: count > 0, claim: CLAIM_OF[id], count };
    if (count > 0) {
      const cited = fieldCitation(rel, id);
      field.line = cited.line;
      field.text = cited.text;
    } else {
      absent.push(id);
      field.instead =
        previous?.fields?.[id]?.instead ?? derivedInstead(json, id);
    }
    fields[id] = field;
  }
  return {
    path: rel,
    kind: kindOf(rel),
    milestone: json.milestone,
    claims: claims.length,
    topKeys: Object.keys(json),
    claimKeys: Array.isArray(json.claims) ? unionKeys(json.claims) : null,
    evidenceKeys:
      json.evidence !== null && typeof json.evidence === 'object'
        ? Object.keys(json.evidence)
        : null,
    captureKeys:
      json.capture !== null && typeof json.capture === 'object'
        ? Object.keys(json.capture)
        : null,
    absentFields: absent,
    fields,
  };
}

/**
 * The artefact-path table: one row per `claims[].artefactPath` in every measured record, with what it
 * resolves to at this head, in record and claim order.
 * @param {readonly string[]} paths
 * @returns {any[]}
 */
function artefactRowsOf(paths) {
  const rows = [];
  for (const rel of paths) {
    const json = jsonOf(rel);
    const cited = artefactCitedLines(rel);
    const carrying = (Array.isArray(json.claims) ? json.claims : []).filter(
      (claim) =>
        claim !== null && typeof claim === 'object' && 'artefactPath' in claim,
    );
    assert.equal(
      cited.length,
      carrying.length,
      `${rel} states ${String(cited.length)} \`artefactPath\` line(s) and ${String(carrying.length)} claim row(s) carrying the field: the derivation pairs them one to one, so a record where the two disagree is refused rather than paired by guess`,
    );
    for (const [index, claim] of carrying.entries())
      rows.push({
        record: rel,
        criterion: claim.criterion,
        line: cited[index].line,
        text: cited[index].text,
        named: claim.artefactPath,
        resolves: existsSync(
          join(ROOT, ...String(claim.artefactPath).split('/')),
        ),
      });
  }
  return rows;
}

/**
 * How `milestone` is spelled in every measured record: the value, the line it sits on, and whether it
 * is the bare id or the id and the milestone's name in one string.
 * @param {readonly string[]} paths
 * @returns {any[]}
 */
function milestoneRowsOf(paths) {
  return paths.map((rel) => {
    const value = String(jsonOf(rel).milestone);
    const cited = fieldCitation(rel, 'milestone');
    return {
      path: rel,
      kind: kindOf(rel),
      value,
      line: cited.line,
      text: cited.text,
      idOnly: value === ownIdOf(rel),
      startsWithOwnId: value.startsWith(ownIdOf(rel)),
    };
  });
}

/**
 * Every surface record's `question`, with what it asks: the value and the line are read, the sentence
 * saying what it asks is prose and is carried over from the record being re-derived.
 * @param {readonly string[]} paths
 * @param {any} recorded
 * @returns {any[]}
 */
function questionRowsOf(paths, recorded) {
  const asks = new Map(
    (recorded?.negative?.surface?.question ?? []).map((row) => [
      row.path,
      row.asks,
    ]),
  );
  return paths.map((rel) => {
    const json = jsonOf(rel);
    const cited = citationOf(rel, 'question');
    return {
      path: rel,
      line: cited.line,
      text: cited.text,
      value: json.question,
      asks: asks.get(rel) ?? String(json.question),
      namesACriterionId: /\b(?:SC|E|N)\d\b/.test(String(json.question)),
      carriesClaims: Array.isArray(json.claims),
    };
  });
}

/**
 * The map as this head derives it. `head` is stated rather than derived, because the map names the
 * commit it was measured at: a read run passes the head the file carries, and the armed run passes the
 * head it runs at. Everything a pin reads is measured here through the pins' own helpers; the prose it
 * cannot measure is carried over from `recorded`.
 * @param {string} head
 * @param {any} recorded the document the prose comes from — the committed map, or a candidate of it
 * @returns {any}
 */
function derive(head, recorded) {
  assert.ok(
    recorded !== null && typeof recorded === 'object',
    `${RECORD} is missing - the map has never been captured: run \`${ARMED_COMMAND}\` once, then keep the file`,
  );
  assert.deepEqual(
    Object.keys(recorded).filter((key) => key !== 'capture'),
    RECORD_KEYS.filter((key) => key !== 'capture'),
    `${RECORD} carries sections this record does not state: the derivation builds each of ${RECORD_KEYS.join(', ')} and would drop a section it does not know, so a hand-added section is refused rather than lost`,
  );

  const next = JSON.parse(JSON.stringify(recorded));
  const present = presentRecords();
  const mapped = mappedRecords(recorded, present);
  const paths = [...mapped.verdictClaims, ...mapped.surface];
  const previous = new Map(
    (recorded.records ?? []).map((row) => [row.path, row]),
  );

  next.inventory.verdictClaims = {
    count: mapped.verdictClaims.length,
    paths: mapped.verdictClaims,
  };
  next.inventory.surface = {
    count: mapped.surface.length,
    paths: mapped.surface,
  };
  next.inventory.milestones = [
    ...new Set(mapped.verdictClaims.map((rel) => ownIdOf(rel))),
  ];
  next.inventory.claims = paths.reduce(
    (sum, rel) =>
      sum + (Array.isArray(jsonOf(rel).claims) ? jsonOf(rel).claims.length : 0),
    0,
  );

  next.records = paths.map((rel) => recordEntryOf(rel, previous.get(rel)));

  next.milestoneField.rows = milestoneRowsOf(paths);
  next.milestoneField.idOnly = next.milestoneField.rows.filter(
    (row) => row.idOnly,
  ).length;
  next.milestoneField.idAndName = next.milestoneField.rows.filter(
    (row) => !row.idOnly,
  ).length;

  next.map.sides = next.map.sides.map((side) => {
    const carried = next.records.filter(
      (entry) => entry.fields[side.field].present === true,
    );
    const verdictClaims = carried.filter(
      (entry) => entry.kind === 'verdict-claims',
    ).length;
    const surface = carried.filter((entry) => entry.kind === 'surface').length;
    return {
      ...side,
      verdictClaims,
      surface,
      holds: verdictClaims === next.inventory.verdictClaims.count,
    };
  });

  const artefactRows = artefactRowsOf(paths);
  const unresolvedArtefacts = artefactRows.filter(
    (row) => row.resolves === false,
  );
  next.artefactPaths = {
    ...next.artefactPaths,
    claimsCarryingIt: artefactRows.length,
    recordsCarryingIt: next.records.filter(
      (entry) => entry.fields.artefactPath.present === true,
    ).length,
    distinctPaths: new Set(artefactRows.map((row) => row.named)).size,
    distinct: [...new Set(artefactRows.map((row) => row.named))].sort(),
    resolved: artefactRows.length - unresolvedArtefacts.length,
    unresolved: unresolvedArtefacts.map((row) => row.named),
    present: artefactRows,
  };

  next.otherNamedPaths.rows = (next.otherNamedPaths.rows ?? []).map((row) => ({
    ...row,
    resolves: existsSync(join(ROOT, ...String(row.named).split('/'))),
  }));
  next.otherNamedPaths.unresolved = next.otherNamedPaths.rows
    .filter((row) => row.resolves === false)
    .map((row) => row.named);

  next.negative.verdictClaims.records = mapped.verdictClaims.length;
  next.negative.verdictClaims.questionShapedKeys = mapped.verdictClaims.flatMap(
    (rel) => questionShapedKeys(jsonOf(rel)).map((key) => `${rel}:${key}`),
  );
  next.negative.verdictClaims.nearMatches = mapped.verdictClaims.flatMap(
    (rel) =>
      questionShapedKeys(jsonOf(rel), 'near').map((key) => `${rel}:${key}`),
  );
  next.negative.surface.records = mapped.surface.length;
  next.negative.surface.question = questionRowsOf(mapped.surface, recorded);
  next.negative.surface.carryingClaims = next.negative.surface.question.filter(
    (row) => row.carriesClaims,
  ).length;
  next.negative.surface.namingACriterionId =
    next.negative.surface.question.filter(
      (row) => row.namesACriterionId,
    ).length;

  const fragment = String(next.trap.sharedProse.fragment);
  const proseRows = [];
  const perRecord = new Map();
  for (const rel of mapped.verdictClaims)
    for (const claim of jsonOf(rel).claims ?? []) {
      const reason = String(claim.reason ?? '');
      if (!reason.includes(fragment)) continue;
      proseRows.push({
        path: rel,
        template: templateOf(String(claim.criterionText), reason),
      });
      perRecord.set(rel, (perRecord.get(rel) ?? 0) + 1);
    }
  const templates = [...new Set(proseRows.map((row) => row.template))];
  next.trap.sharedProse.rows = proseRows.length;
  next.trap.sharedProse.records = perRecord.size;
  next.trap.sharedProse.distinctTemplates = templates.length;
  next.trap.sharedProse.perRecord = [...perRecord.entries()].map(
    ([record, rows]) => ({ record, rows }),
  );
  if (templates.length === 1) next.trap.sharedProse.template = templates[0];

  let provesRows = 0;
  let provesRecords = 0;
  const provesCiting = [];
  const provesWithoutCiting = [];
  const provesShapes = { string: 0, array: 0 };
  for (const rel of mapped.verdictClaims) {
    let carries = false;
    let cites = false;
    for (const claim of jsonOf(rel).claims ?? []) {
      if (claim.proves === undefined) continue;
      carries = true;
      if (Array.isArray(claim.proves)) provesShapes.array += 1;
      else provesShapes.string += 1;
      const text = Array.isArray(claim.proves)
        ? claim.proves.join(' ')
        : String(claim.proves);
      if (text.includes(NAV)) {
        provesRows += 1;
        cites = true;
        provesCiting.push(rel);
      }
    }
    if (carries) provesRecords += 1;
    if (carries && !cites) provesWithoutCiting.push(rel);
  }
  const captureCommands = mapped.verdictClaims.filter((rel) =>
    String(jsonOf(rel).capture?.command ?? '').includes(NAV),
  );
  next.trap.proves = {
    ...next.trap.proves,
    suiteExistsAtThisHead: existsSync(join(ROOT, ...NAV.split('/'))),
    shapes: provesShapes,
    recordsCarryingProves: provesRecords,
    recordsCitingTheSuite: new Set(provesCiting).size,
    rowsCitingTheSuite: provesRows,
    recordsCarryingProvesButNotCitingIt: provesWithoutCiting,
    evidenceSuitesNamingIt: mapped.verdictClaims.filter((rel) =>
      (jsonOf(rel).evidence?.suites ?? []).some((suite) => suite?.path === NAV),
    ).length,
    captureCommandsCitingIt: captureCommands.length,
    captureVariables: [
      ...new Set(
        captureCommands.map(
          (rel) =>
            /M\d{3}_CAPTURE/.exec(String(jsonOf(rel).capture?.command))?.[0] ??
            '',
        ),
      ),
    ],
  };

  let required = 0;
  let notRequired = 0;
  const requiredIn = [];
  for (const rel of mapped.verdictClaims) {
    let hasRequired = false;
    for (const claim of jsonOf(rel).claims ?? []) {
      if (claim.ruling === 'required') {
        required += 1;
        hasRequired = true;
      }
      if (claim.ruling === 'not-required') notRequired += 1;
    }
    if (hasRequired) requiredIn.push(rel);
  }
  next.trap.rulings = {
    ...next.trap.rulings,
    rows: required + notRequired,
    required,
    notRequired,
    recordsWithARequiredRow: requiredIn,
  };

  let artefactFieldRows = 0;
  let artefactStart = 0;
  let readingRows = 0;
  for (const rel of mapped.verdictClaims)
    for (const claim of jsonOf(rel).claims ?? []) {
      if (typeof claim.artefact === 'string') {
        artefactFieldRows += 1;
        if (
          typeof claim.artefactPath === 'string' &&
          claim.artefact.startsWith(claim.artefactPath)
        )
          artefactStart += 1;
      }
      if (claim.reading !== undefined) readingRows += 1;
    }
  next.trap.artefactField = {
    ...next.trap.artefactField,
    rows: artefactFieldRows,
    rowsStartingWithTheArtefactPath: artefactStart,
  };
  next.trap.readingField = { ...next.trap.readingField, rows: readingRows };

  const fieldOfClaim = new Map(
    Object.entries(CLAIM_OF).map(([field, claim]) => [claim, field]),
  );
  for (const claim of next.claims) {
    const field = fieldOfClaim.get(claim.id);
    if (field === undefined) continue;
    const carried = next.records.filter(
      (entry) => entry.fields[field].present === true,
    );
    const verdictClaims = carried.filter(
      (entry) => entry.kind === 'verdict-claims',
    ).length;
    claim.counts = {
      verdictClaims,
      surface: carried.filter((entry) => entry.kind === 'surface').length,
    };
    claim.observedHere = {
      ...claim.observedHere,
      holds: verdictClaims === next.inventory.verdictClaims.count,
    };
    claim.absentFrom = next.records
      .filter((entry) => entry.fields[field].present !== true)
      .map((entry) => entry.path);
  }

  // The head is a reading, so the one unknown a reader wrote about it is re-derived rather than kept:
  // a sentence naming the head a past run measured at would contradict the head this run states. Every
  // other unknown is the author's and carries over untouched.
  const aboutTheHead = /^re-(?:measured|derived) at /;
  next.unknowns = [
    ...(recorded.unknowns ?? []).filter(
      (note) => !aboutTheHead.test(String(note)),
    ),
    `re-derived at ${head}: ${String(next.inventory.verdictClaims.count)} verdict-claims and ${String(next.inventory.surface.count)} surface records are measured at this head, and the record a map names outside itself or a census of its own holds is not one of them. Every number in this map was read from the tree here; the sentences around them are the author's, carried over, so a count that moved and the sentence that quotes it can disagree until a reader re-authors the sentence.`,
  ];

  const sections = {
    schema: next.schema,
    milestone: next.milestone,
    task: next.task,
    title: next.title,
    question: next.question,
    head,
    headCommand: next.headCommand,
    measuredAt: next.measuredAt,
    capture: {
      task: 'T010',
      command: ARMED_COMMAND,
      windowsCommand: ARMED_COMMAND_WINDOWS,
      check: CHECK_COMMAND,
      records: RECORD,
      head,
      reading:
        'an armed run re-derives the whole map from the records on disk at the head it runs at — every measured record, its key lists, the line each of the seven fields is carried on, the artefact paths and what they resolve to, the milestone spelling, the negative measurement and the C3 trap — writes it only when a value moved, and writes nothing on a default run. The prose it cannot measure carries over from the file, so a re-derivation moves the readings and keeps the sentences.',
    },
    instrument: next.instrument,
    inventory: next.inventory,
    milestoneField: next.milestoneField,
    map: next.map,
    records: next.records,
    artefactPaths: next.artefactPaths,
    otherNamedPaths: next.otherNamedPaths,
    negative: next.negative,
    trap: next.trap,
    claims: next.claims,
    unknowns: next.unknowns,
  };
  assert.deepEqual(
    Object.keys(sections),
    [...RECORD_KEYS],
    'the derivation states every section the map carries, in the order it carries them',
  );
  return sections;
}

/** The map as bytes at one head, exactly as the writer writes them. */
function serializeMap(head, recorded) {
  return canonical(derive(head, recorded));
}

/**
 * The committed map, as the document a re-derivation carries its prose from, or null where the file
 * has never been written.
 * @returns {any}
 */
function loadRecorded() {
  return existsSync(RECORD_PATH)
    ? JSON.parse(readFileSync(RECORD_PATH, 'utf8'))
    : null;
}

/**
 * The one write this suite has. It refuses twice before it reaches the file, and the two refusals are
 * the two ways a map can disagree with the tree it states:
 *
 *   the pin      the bytes are put through this suite's own `validate`, so the writer cannot emit a map
 *                the read-only run then calls wrong — one refusal, and the pin is the owner of it.
 *   the fixed point
 *                and re-deriving the candidate at the head it names must reproduce it byte for byte, so
 *                a second armed run moves nothing and a value the writer emits is a value it derives.
 *
 * A candidate that fails either is not written at all: nothing below reaches `writeFileSync`.
 * @param {string} candidate
 * @returns {string} the bytes on disk after the check
 */
function writeCandidate(candidate) {
  const refused = (() => {
    try {
      validate(JSON.parse(candidate));
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the pin fails with an Error');
      return error;
    }
  })();
  assert.ok(
    refused === null,
    `armed capture refused: the bytes it would write fail this suite's own pin, so the derivation does not derive through the pin its reader holds: ${String(refused?.message)} - nothing was written`,
  );
  const again = JSON.parse(candidate);
  assert.equal(
    serializeMap(again.head, again),
    candidate,
    "armed capture refused: the bytes it would write are not the fixed point of this suite's own pin — re-deriving the candidate at the head it names moves it, so the writer would emit bytes its own next run rewrites. Nothing was written.",
  );
  writeFileSync(RECORD_PATH, candidate);
  return readFileSync(RECORD_PATH, 'utf8');
}

/**
 * The armed run: derive at this head, compare with the committed bytes, and write only what moved. A
 * second armed run at the same head writes nothing, because the first one wrote the fixed point.
 * @returns {{ wrote: boolean, moved: string, after: string }}
 */
function capture() {
  const recorded = loadRecorded();
  assert.ok(
    recorded !== null,
    `${RECORD} is missing - the map has never been captured: run \`${ARMED_COMMAND}\` once, then keep the file`,
  );
  const head = gitHead();
  const candidate = serializeMap(head, recorded);
  const text = readFileSync(RECORD_PATH, 'utf8');
  if (text === candidate) return { wrote: false, moved: '', after: text };
  const moved = `the map moved: ${mapDifference(recorded, JSON.parse(candidate))}`;
  return { wrote: true, moved, after: writeCandidate(candidate) };
}

/** The bytes on disk before this suite did anything: what a default run proves it left alone. */
const RECORD_AT_LOAD = existsSync(RECORD_PATH)
  ? readFileSync(RECORD_PATH, 'utf8')
  : null;

/**
 * The armed write, run before the record is read below so the pins that follow read the bytes the
 * writer just derived. A default run never reaches `capture`.
 * @type {{ wrote: boolean, moved: string, after: string } | null}
 */
const CAPTURED = ARMED ? capture() : null;

if (CAPTURED !== null)
  console.log(
    CAPTURED.wrote
      ? `armed run wrote ${RECORD} (${CAPTURED.moved})`
      : 'armed run: nothing moved, nothing written',
  );

// -------------------------------------------------------------- the record ----

const RECORDING = JSON.parse(
  readFileSync(join(ROOT, ...RECORD.split('/')), 'utf8'),
);

/** A copy of the recording, so a mutant can be patched without touching the file on disk. */
function copy() {
  return JSON.parse(JSON.stringify(RECORDING));
}

/**
 * A copy with one record's field replaced: the shape a recording would take if it were written from
 * a record other than the one on disk.
 * @param {string} rel
 * @param {string} id
 * @param {any} patch
 */
function withField(rel, id, patch) {
  const candidate = copy();
  const entry = candidate.records.find((row) => row.path === rel);
  assert.ok(entry !== undefined, `${rel} is one of the measured records`);
  entry.fields[id] = { ...entry.fields[id], ...patch };
  if (patch.present === true)
    entry.absentFields = entry.absentFields.filter((field) => field !== id);
  return candidate;
}

// ------------------------------------------------------------------- tests ----

test('the recording is the shape map this head measures', (t) => {
  const stats = validate(RECORDING);
  t.diagnostic(
    `${stats.records} record(s), ${stats.citations} citation(s), ${stats.artefactPaths} artefact path(s)`,
  );
  t.diagnostic(
    `the map: ${RECORDING.map.sides
      .map(
        (side) =>
          `${side.field} ${side.verdictClaims}/${RECORDING.inventory.verdictClaims.count}+${side.surface}/${RECORDING.inventory.surface.count}`,
      )
      .join(', ')}`,
  );
});

test('every citation is the line its own number names, found by searching the file it quotes', (t) => {
  let citations = 0;
  let longest = '';
  for (const [where, citation] of allCitations(RECORDING)) {
    resolveCitation(citation, where);
    citations += 1;
    if (citation.text.length > longest.length) longest = String(citation.path);
  }
  assert.ok(
    citations >= 400,
    `the recording cites ${citations} line(s), which is fewer than the map it states needs`,
  );
  t.diagnostic(
    `${citations} citation(s) re-resolved by search; the longest line quoted is in ${longest}`,
  );
});

test('every record present is measured and every record measured is present', (t) => {
  validateInventory(RECORDING);
  const present = presentRecords();
  const mapped = mappedRecords(RECORDING, present);
  t.diagnostic(
    `${mapped.verdictClaims.length} verdict-claims and ${mapped.surface.length} surface record(s) measured; ${present.verdictClaims.length + present.surface.length} present, ${outsideTheMapOf(RECORDING).length} named outside M055's map at T004 and ${LATER.map((entry) => `${outsideTheMapOf(entry.map).length} outside ${String(entry.map.milestone)}'s map`).join(' and ')}`,
  );
  // The two counts M055's T001 pinned, re-derived rather than retuned: the map measures 36
  // verdict-claims records at this head because `research/raw/m066-verdict-claims.json` is no longer
  // held by a census of its own. The census M044 introduced derives
  // `research/raw/<the bound milestone>-verdict-claims.json` from the bound branch, and the branch
  // moved from gsd-path/M065 to gsd-path/M067 after M066's record was landed: the record it derives
  // at this head is M067's, so M066's is measured by this map instead of being excused by nothing.
  for (const expected of [
    ['verdict-claims', 36],
    ['surface', 9],
  ]) {
    const [kind, count] = expected;
    const measured =
      kind === 'surface' ? mapped.surface.length : mapped.verdictClaims.length;
    assert.equal(
      measured,
      count,
      `${measured} ${kind} record(s) are present and ${count} were measured when the map was written: a new one is a record this map does not carry, so re-measure rather than leave it out`,
    );
  }
});

test('the per-file per-field table states its own absences, and they are the absences this head holds', (t) => {
  validateTable(RECORDING);
  const absences = new Map();
  for (const entry of RECORDING.records)
    for (const id of entry.absentFields)
      absences.set(id, (absences.get(id) ?? 0) + 1);
  for (const [id, count] of absences)
    t.diagnostic(
      `${id}: absent from ${count} record(s), each one stating the shape it uses instead`,
    );
  assert.ok(
    absences.size >= 4,
    `the map states ${absences.size} absence(s), and it is a map of where it does not hold`,
  );
  for (const entry of RECORDING.records)
    assert.equal(
      entry.absentFields.length,
      FIELD_IDS.length -
        FIELD_IDS.filter((id) => entry.fields[id].present === true).length,
      `${entry.path}: the absences it states are the fields it does not carry`,
    );
});

test('every artefact path a record names resolves at this head, and the recording states which do not', (t) => {
  validateArtefacts(RECORDING);
  const table = RECORDING.artefactPaths;
  t.diagnostic(
    `${table.resolved} of ${table.claimsCarryingIt} artefact path(s) resolve over ${table.distinctPaths} distinct file(s); ${table.unresolved.length} do not`,
  );
  t.diagnostic(
    `the missing-artefact state E4 renders has ${table.unresolved.length === 0 ? 'no live instance among them' : `${table.unresolved.length} live instance(s)`}, and the index may never paper over a path that stops resolving`,
  );
  for (const row of RECORDING.otherNamedPaths.rows)
    t.diagnostic(
      `${row.record.split('/').pop()} ${row.criterion} names ${row.named}, which is ${row.resolves ? 'there' : 'not there'}: ${row.field}, not an artefact path`,
    );
});

test('no record carries an end-user question mapped to a criterion', (t) => {
  validateFindings(RECORDING);
  t.diagnostic(
    `${RECORDING.negative.verdictClaims.records} verdict-claims record(s) carry ${RECORDING.negative.verdictClaims.questionShapedKeys.length} question-shaped key(s)`,
  );
  for (const row of RECORDING.negative.surface.question)
    t.diagnostic(`${row.path.split('/').pop()} asks ${row.asks}`);
  assert.equal(
    RECORDING.negative.holds,
    true,
    'the negative is what decides the design: the question-to-criterion side is authored because no record holds it',
  );
});

test('the C3 trap is quoted as a ruling, not repaired', (t) => {
  validateFindings(RECORDING);
  const shared = RECORDING.trap.sharedProse;
  t.diagnostic(
    `reason: ${shared.rows} row(s) in ${shared.records} record(s), ${shared.distinctTemplates} template`,
  );
  t.diagnostic(
    `proves/capture: ${RECORDING.trap.proves.rowsCitingTheSuite} row(s) in ${RECORDING.trap.proves.recordsCitingTheSuite} record(s) cite ${NAV}, and ${RECORDING.trap.proves.evidenceSuitesNamingIt} record(s) name it in evidence.suites`,
  );
  t.diagnostic(
    `rulings: ${RECORDING.trap.rulings.required} required, ${RECORDING.trap.rulings.notRequired} not-required`,
  );
  assert.ok(
    RECORDING.trap.ruling.includes('never'),
    'the trap is recorded as a ruling and says the prose is never rendered',
  );
});

test('a doctored citation reddens naming the claim it belongs to', () => {
  const target = 'research/raw/m023-verdict-claims.json';
  const slid = withField(target, 'criterionText', {
    line:
      RECORDING.records.find((entry) => entry.path === target).fields
        .criterionText.line + 1,
  });
  const failure = (() => {
    try {
      validate(slid);
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the check fails with an Error');
      return error;
    }
  })();
  assert.ok(
    failure !== null,
    'a citation one line off its quotation must redden',
  );
  assert.match(
    failure.message,
    /claim F3/,
    `the failure names the claim the doctored citation belongs to, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(`mutant: doctored citation -> ${failure.message.split('\n')[0]}`);
});

test('a record that claims a field it does not carry reddens naming the claim', () => {
  const target = 'research/raw/m023-verdict-claims.json';
  const invented = withField(target, 'artefactPath', {
    present: true,
    count: 4,
    line: 5,
    text: '"criterion": "SC1",',
  });
  const failure = (() => {
    try {
      validate(invented);
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the check fails with an Error');
      return error;
    }
  })();
  assert.ok(
    failure !== null,
    'a record claiming a field it does not carry must redden',
  );
  assert.match(
    failure.message,
    /claim F4/,
    `the failure names the claim whose field was invented, and it says ${JSON.stringify(failure.message)}`,
  );
  assert.ok(
    failure.message.includes(target),
    `the failure names the record the field was invented in, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(`mutant: invented field -> ${failure.message.split('\n')[0]}`);
});

test('a record that hides a field it carries reddens naming the claim', () => {
  const target = 'research/raw/m054-verdict-claims.json';
  const hidden = withField(target, 'criterionText', {
    present: false,
    count: 0,
    instead: 'nothing to see',
  });
  const failure = (() => {
    try {
      validate(hidden);
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the check fails with an Error');
      return error;
    }
  })();
  assert.ok(failure !== null, 'a record hiding a field it carries must redden');
  assert.match(
    failure.message,
    /claim F3/,
    `the failure names the claim whose field was hidden, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(`mutant: hidden field -> ${failure.message.split('\n')[0]}`);
});

test('a record the map does not measure reddens naming the record', () => {
  const extended = copy();
  const first = extended.records[0];
  extended.records.push({
    ...JSON.parse(JSON.stringify(first)),
    path: `${RAW}/m999-verdict-claims.json`,
  });
  const failure = (() => {
    try {
      validate(extended);
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the check fails with an Error');
      return error;
    }
  })();
  assert.ok(failure !== null, 'a record added to the table must redden');
  console.log(`mutant: unmeasured record -> ${failure.message.split('\n')[0]}`);
});

test('a record present and not named outside the map reddens naming the record', () => {
  const present = presentRecords();
  const unlisted = `${RAW}/m999-surface.json`;
  present.surface = [...present.surface, unlisted].sort();
  const failure = (() => {
    try {
      validateInventory(RECORDING, present);
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the check fails with an Error');
      return error;
    }
  })();
  assert.ok(
    failure !== null,
    'a surface record present at this head and not named outside the map must redden, so the subtraction is the recording’s named exceptions rather than every record',
  );
  assert.ok(
    failure.message.includes(unlisted),
    `the failure names the record the map does not carry, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(
    `mutant: new unlisted record -> ${failure.message.split('\n')[0]}`,
  );
});

test('every map read beside M055’s is its own statement, and the subtraction is what they state', (t) => {
  for (const entry of LATER) validateOwnMap(entry.map);
  const outside = outsideEither(RECORDING);
  assert.deepEqual(
    [...outside].sort(),
    [
      ...new Set([
        ...PINNED_OUTSIDE.M055,
        ...LATER.flatMap((entry) => outsideTheMapOf(entry.map)),
      ]),
    ].sort(),
    `the subtraction is M055's map's own two plus whatever each later map names outside itself, read from the recordings rather than listed here: the maps name ${JSON.stringify(outside)}`,
  );
  for (const map of [RECORDING, ...LATER.map((entry) => entry.map)])
    for (const path of outsideTheMapOf(map))
      assert.ok(
        (
          PINNED_OUTSIDE[
            /** @type {'M055'|'M057'|'M058'|'M059'|'M060'} */ (map.milestone)
          ] ?? []
        ).includes(path),
        `${String(map.milestone)}'s map names ${path} outside itself, and that is not a record ${String(map.milestone)} owes`,
      );
  assert.deepEqual(
    mappedRecords(RECORDING),
    {
      verdictClaims: presentRecords().verdictClaims.filter(
        (path) => !outside.includes(path) && !heldByItsOwnCensus(path),
      ),
      surface: presentRecords().surface.filter(
        (path) => !outside.includes(path) && !heldByItsOwnCensus(path),
      ),
    },
    'the table is measured over every record present except the ones the maps name outside themselves and the ones their own census names, and over no other',
  );
  for (const entry of LATER)
    t.diagnostic(
      `${entry.map.milestone}'s map at ${entry.rel} names ${outsideTheMapOf(entry.map).length} record(s) outside itself and measures ${measuredByMap(entry.map).length}`,
    );
  t.diagnostic(
    `the maps name ${outside.length} record(s) between them (${outside.join(', ')})`,
  );
});

test('each later map may name only its own records, and a record it neither measures nor names reddens naming it', () => {
  for (const entry of LATER) {
    const map = entry.map;
    const pinned =
      PINNED_OUTSIDE[
        /** @type {'M057'|'M058'|'M059'|'M060'|'M061'} */ (map.milestone)
      ] ?? [];
    const third = {
      ...map,
      inventory: {
        ...(map.inventory ?? {}),
        outsideTheMap: [
          {
            path: `${RAW}/m901-surface.json`,
            why: 'a record this milestone does not owe',
          },
        ],
      },
    };
    const excused = (() => {
      try {
        validateOwnMap(third);
        return null;
      } catch (error) {
        assert.ok(error instanceof Error, 'the check fails with an Error');
        return error;
      }
    })();
    assert.ok(
      excused !== null,
      `${entry.rel} naming a path its own milestone does not owe must redden, and it reddened nothing`,
    );
    assert.ok(
      excused.message.includes(`${RAW}/m901-surface.json`),
      `the refusal names the path it refuses to subtract, and it says ${JSON.stringify(excused.message)}`,
    );

    // The mutant is the map with `inventory.outsideTheMap` emptied and a present list that carries no
    // other record of this milestone's: the property under it is "a record the map neither measures nor
    // names outside itself reddens", so the run must isolate that record — each map names the record the
    // milestone owes, and the block below pins that naming. With the real map the assertion would read
    // "this record is unnamed", which is false by construction.
    const unnamed = {
      ...map,
      inventory: { ...(map.inventory ?? {}), outsideTheMap: [] },
    };
    const owed = pinned[0] ?? `${RAW}/m901-surface.json`;
    const present = { ...presentRecords(), verdictClaims: [] };
    present.surface = [...present.surface, owed].sort();
    const unmeasured = (() => {
      try {
        validateOwnMap(unnamed, present);
        return null;
      } catch (error) {
        assert.ok(error instanceof Error, 'the check fails with an Error');
        return error;
      }
    })();
    assert.ok(
      unmeasured !== null,
      'a record the map neither measures nor names outside itself must redden rather than read as an unmeasured record, and with inventory.outsideTheMap emptied this record is that record',
    );
    assert.ok(
      unmeasured.message.includes(owed),
      `the refusal names the record it will not read as unmeasured, and it says ${JSON.stringify(unmeasured.message)}`,
    );

    const naming = {
      ...map,
      inventory: {
        ...(map.inventory ?? {}),
        outsideTheMap: [
          { path: owed, why: 'recorded by the task that owes it' },
        ],
      },
    };
    validateOwnMap(naming, present);
    assert.equal(
      outsideEither(naming).includes(owed),
      true,
      `once the recording names it outside itself the record this milestone owes is subtracted rather than read as unmeasured: ${owed}`,
    );
    assert.equal(
      mappedRecords(naming, present).surface.includes(owed),
      false,
      `the subtracted record is not measured, so it never reaches the table as an unmeasured record: ${owed}`,
    );
    console.log(
      `mutant ${entry.rel}: third path -> ${String(excused.message).split('\n')[0]} || owed record -> ${String(unmeasured.message).split('\n')[0]}`,
    );
  }
});

test('the recording is a read: it names its head and a default run writes nothing', (t) => {
  const before = readFileSync(join(ROOT, ...RECORD.split('/')), 'utf8');
  validateHead(RECORDING);
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const imported = /import \{([^}]*)\} from 'node:fs'/m.exec(source);
  assert.ok(imported !== null, 'the suite imports its readers from node:fs');
  assert.deepEqual(
    String(imported[1])
      .split(',')
      .map((name) => name.trim())
      .sort(),
    ['existsSync', 'readFileSync', 'readdirSync', 'writeFileSync'],
    'this suite imports its three readers and the one writer symbol, so a default run writes nothing to the tree it measures and the armed run has one way to write',
  );
  // One write, and it is the armed run's: a second call site would be a second owner of the map. The
  // needle is built from two halves so this scan does not count its own text.
  const call = `${'writeFileSync'}(`;
  const calls = source.split(call).length - 1;
  assert.equal(
    calls,
    1,
    `this suite writes in one place — the armed capture — and its source names ${call} ${String(calls)} time(s)`,
  );
  assert.equal(
    readFileSync(join(ROOT, ...RECORD.split('/')), 'utf8'),
    before,
    `${RECORD} is the same before and after the run`,
  );
  if (CAPTURED === null)
    assert.equal(
      readFileSync(join(ROOT, ...RECORD.split('/')), 'utf8'),
      RECORD_AT_LOAD,
      `${RECORD} is the byte-for-byte file this run loaded, because a default run derives and compares rather than writing`,
    );
  t.diagnostic(
    `head ${String(RECORDING.head).slice(0, 8)} is a commit this checkout carries, and the suite resolves it through ${String(RECORDING.headCommand)}`,
  );
});

test('the map is the one this head derives, and a record that moved is named', () => {
  const recorded = loadRecorded();
  const head = String(recorded.head);
  const difference = mapDifference(recorded, derive(head, recorded));
  assert.equal(
    difference,
    '',
    `${RECORD} is not what this head derives: ${difference} - re-derive with \`${ARMED_COMMAND}\` at this head rather than editing the map`,
  );
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    serializeMap(head, recorded),
    `${RECORD} is not serialized as the armed writer writes it, so a re-derivation would move bytes the values do not`,
  );

  // The mutant the criterion is written about: the record this rebind orphaned, dropped from the table
  // and from the inventory without touching the tree. The unmutated map passes the same pin above, so
  // the red below is the mutation and not drift.
  const orphan = `${RAW}/m066-verdict-claims.json`;
  const planted = JSON.parse(JSON.stringify(recorded));
  planted.records = planted.records.filter((row) => row.path !== orphan);
  planted.inventory.verdictClaims.paths =
    recorded.inventory.verdictClaims.paths.filter((path) => path !== orphan);
  planted.inventory.verdictClaims.count =
    planted.inventory.verdictClaims.paths.length;
  const failure = (() => {
    try {
      const moved = mapDifference(
        planted,
        derive(String(recorded.head), planted),
      );
      assert.equal(
        moved,
        '',
        `${RECORD} is not what this head derives: ${moved}`,
      );
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the check fails with an Error');
      return error;
    }
  })();
  assert.ok(
    failure !== null,
    `a map that does not measure ${orphan} must redden, and it reddened nothing`,
  );
  assert.ok(
    failure.message.includes(orphan),
    `the refusal names the record that moved rather than reporting a bare count, and it says ${JSON.stringify(failure.message)}`,
  );
  console.log(`mutant: unmeasured record -> ${failure.message.split('\n')[0]}`);
});

test('the armed writer refuses a candidate that is not the fixed point of its own pin, and writes nothing', () => {
  const before = readFileSync(RECORD_PATH, 'utf8');
  const recorded = loadRecorded();
  const good = serializeMap(String(recorded.head), recorded);

  // The first refusal: a candidate this suite's own pin calls wrong. Nothing reaches the file.
  const short = JSON.parse(good);
  short.records = short.records.slice(0, short.records.length - 1);
  const pinRefusal = (() => {
    try {
      writeCandidate(canonical(short));
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the refusal fails with an Error');
      return error;
    }
  })();
  assert.ok(
    pinRefusal !== null,
    'a candidate the pin refuses must be refused by the writer rather than written, and it was written',
  );
  assert.match(
    pinRefusal.message,
    /armed capture refused/,
    `the refusal says what it is, and it says ${JSON.stringify(pinRefusal.message.split('\n')[0])}`,
  );
  assert.match(
    pinRefusal.message,
    /nothing was written/,
    `the refusal states that it wrote nothing, and it says ${JSON.stringify(pinRefusal.message.split('\n')[0])}`,
  );
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    before,
    'a refused candidate wrote nothing to the map',
  );

  // The second refusal: a candidate the pin passes and the writer still refuses, because a value the
  // derivation owns moved. `inventory.milestones` is measured by the writer and read by no pin, so
  // without the fixed point this candidate would be written and the next armed run would rewrite it.
  const drifted = JSON.parse(good);
  drifted.inventory.milestones = drifted.inventory.milestones.slice(0, 3);
  assert.doesNotThrow(
    () => validate(drifted),
    'the pin does not read inventory.milestones, which is why the fixed point is the second refusal',
  );
  const fixedPointRefusal = (() => {
    try {
      writeCandidate(canonical(drifted));
      return null;
    } catch (error) {
      assert.ok(error instanceof Error, 'the refusal fails with an Error');
      return error;
    }
  })();
  assert.ok(
    fixedPointRefusal !== null,
    'a candidate that is not the fixed point of the pin must be refused, and it was written',
  );
  assert.match(
    fixedPointRefusal.message,
    /fixed point/,
    `the refusal names the rule it holds, and it says ${JSON.stringify(fixedPointRefusal.message.split('\n')[0])}`,
  );
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    before,
    'a candidate the writer refuses as not its own fixed point wrote nothing to the map',
  );
  console.log(
    `mutant: armed refusal -> ${pinRefusal.message.split('\n')[0]} || ${fixedPointRefusal.message.split('\n')[0]}`,
  );
});

test('the armed run writes only what moved, and a second armed run changes no byte', (t) => {
  if (CAPTURED === null) {
    assert.equal(
      readFileSync(RECORD_PATH, 'utf8'),
      RECORD_AT_LOAD,
      'a default run derives the map and leaves the file exactly as it loaded it',
    );
    t.diagnostic(
      'default run: nothing written; the armed run is the only writer this suite has',
    );
    return;
  }
  assert.equal(
    readFileSync(RECORD_PATH, 'utf8'),
    CAPTURED.after,
    'the bytes the armed run reports are not the bytes on disk',
  );
  const second = capture();
  assert.equal(
    second.wrote,
    false,
    `a second armed run wrote, and nothing had moved: ${second.moved}`,
  );
  assert.equal(
    second.after,
    CAPTURED.after,
    'a second armed run changed the map, so the re-derivation is not idempotent',
  );
  t.diagnostic(
    `armed run: ${CAPTURED.wrote ? CAPTURED.moved : 'nothing moved'} — a second run moved no byte of ${String(CAPTURED.after.length)} (${CAPTURED.after.split('\n').length} line(s))`,
  );
});

test('git was reachable, so the head check above measured something', () => {
  const run = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.match(
    String(run).trim(),
    /^[0-9a-f]{40}$/,
    'git answers with the commit this suite runs at',
  );
});
