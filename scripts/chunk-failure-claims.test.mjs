// M064 T004 — the claims census: the intent's five-column edge table recorded as one claim per edge
// row, each with a citation that names a file, a line and the exact text that line carries.
//
// The census this milestone follows is M063's (`scripts/guard-verdict-claims.test.mjs`), which rules
// one claim per success criterion and cites a suite and a test title. This milestone's plan holds one
// edge per task and the task contract asks for a claim per edge row, so the record carries both:
//
//   `claims`      one row per criterion, quoting the intent and citing the suites the plan resolves
//                 its edges to — the shape `scripts/overlay-verdict-claims.test.mjs` and
//                 `scripts/navigation-blocking.test.mjs` read, so this milestone is still counted by
//                 the censuses that came before it.
//   `edgeClaims`  one row per edge of the intent's own `## Edge Coverage` table: E1 to E8, each with
//                 the claim it makes, the answer fields it is held to, and the citations below.
//
// A citation is a line, not a title. `{file, line, lineText, holds}` is re-resolved on every run by
// opening the file and reading that line: a citation whose line moved, or whose text no longer reads
// as the record states, reddens naming the claim and the citation. The `line` and `lineText` are
// derived at capture from an anchor that occurs exactly once in the file, so a citation cannot be
// typed at a line the tree does not carry.
//
// Five rules, and none of them reads a fact the tree does not hold:
//
//   1. Each edge, quoted. The eight rows of `## Edge Coverage` are read as the five columns the
//      owner's ruling makes authoritative (`Edge | Criterion | Category | Disposition | Detail`), and
//      the claim for each one carries that row's own cells.
//   2. Each claim's fields, read from the join. `extension/chunk-failure.js` is run in a bare
//      `node:vm` context and its `FIELDS` read back, so a claim that names a field the join does not
//      return is refused rather than believed.
//   3. Each citation, read from this checkout. The file exists, the line is inside it, and the text
//      at that line is the text the citation states.
//   4. Each claim's test, read from this checkout. A claim names the suite and the test title that
//      proves it, and the suite must declare that title at this head.
//   5. No claim names a repair. The eight claims, their citations' `holds` and their absences are
//      scanned for the words a remedy, a cause or a version drift is written with, so a claim that
//      offers one reddens by claim id.
//
// A part of an edge no line in this checkout carries is recorded as an absence with its reason
// under `absence`, never softened into prose: two edges carry one this head measures (E4's truncated
// hash and E6's three chat-entry lists).
//
// `M064_CAPTURE=1` arms the one write. It re-derives, compares, and writes only when a value moved, so
// two armed runs leave the file byte-identical; a default run reads the file, asserts it is exactly
// what this head derives, and asserts its own bytes did not move:
//
//   M064_CAPTURE=1 node --test scripts/chunk-failure-claims.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/chunk-failure-claims.test.mjs';
const RAW = 'research/raw';

/** The milestone this record is numbered for, named as a literal and read from the bound branch. */
const MILESTONE = 'M064';

/**
 * The record this file writes, named as a literal as well as derived. The literal is what the readers
 * that subtract a record its own census hold open — `scripts/tutor-record-shapes.test.mjs` reads the
 * owner from the record's own `capture.command` and then requires that owner to name the record's
 * path — and the assertion below keeps the two spellings one.
 */
const CLAIMS_REL = 'research/raw/m064-verdict-claims.json';
const CLAIMS_PATH = join(ROOT, ...CLAIMS_REL.split('/'));

/** The three artefacts this milestone's claims cite by name, as repository paths. */
const JOIN_REL = 'extension/chunk-failure.js';
const PANEL_REL = 'apps/angular-ai-devtools/src/app/panel-chunk-failure.ts';
const RECORD_REL = 'extension/import-failure.js';
const IMPORT_RECORDING_REL = 'research/raw/m064-import-failure.json';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M064_CAPTURE';
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${CAPTURE_ENV}=1 ${CHECK_COMMAND}`;
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** The five column names the owner's ruling makes authoritative, in the order it names them. */
const EDGE_COLUMNS = ['Edge', 'Criterion', 'Category', 'Disposition', 'Detail'];

/**
 * The words a claim that offers a repair, a cause or a drift is written with. A claim states what a
 * record carries; these are the words it may not use to say what should happen next or why.
 */
const FORBIDDEN = [
  'cause',
  'because',
  'fix',
  'remedy',
  'should',
  'drift',
  'mismatch',
  'version',
  'hypothesis',
  'expected',
];

/**
 * The eight edge claims, one per row of the intent's `## Edge Coverage` table. `claim` is what the
 * edge asserts at this head, `fields` is the answer fields it is held to (read against the join's own
 * `FIELDS`), `suite` and `test` name the test this checkout declares to prove it, and `citations` name
 * the line each part of the claim rests on by an anchor that occurs exactly once in that file. Every
 * judgement this census makes is in this table; everything else in the record is interpolated from a
 * file this checkout carries.
 */
const EDGE_PROOFS = [
  {
    edge: 'E1',
    claim:
      'A lazy route whose import resolved answers `resolved` with the specifier the record carried, and never an absence that reads as a clean stream.',
    fields: ['state', 'specifier'],
    suite: 'scripts/chunk-failure.test.mjs',
    test: 'SC1 - a resolved import reports no failure, and the absence of a hash as absent',
    citations: [
      {
        file: 'scripts/chunk-failure.test.mjs',
        anchor:
          "test('SC1 - a resolved import reports no failure, and the absence of a hash as absent'",
        holds:
          'the resolved answer is a resolution and not an empty absence that reads as a clean stream',
      },
      {
        file: JOIN_REL,
        anchor: 'if (entry.outcome === LOADED) return RESOLVED;',
        holds:
          'the state is read from the outcome the record carried, so a loaded import answers resolved',
      },
      {
        file: PANEL_REL,
        anchor: "export const RESOLVED = 'resolved';",
        holds:
          'the surface enumerates the resolved state it renders for that answer, and no other word',
      },
    ],
    absence: null,
  },
  {
    edge: 'E2',
    claim:
      'Two failed imports in one record answer two rows in the order the record holds them, each with its own specifier, route path and count, and the last never stands in for the first.',
    fields: ['state', 'specifier', 'routePath', 'consideredCount'],
    suite: 'scripts/chunk-failure.test.mjs',
    test: 'SC1 - both failures of one navigation are named, in the order the router attempted them',
    citations: [
      {
        file: 'scripts/chunk-failure.test.mjs',
        anchor:
          "test('SC1 - both failures of one navigation are named, in the order the router attempted them'",
        holds:
          'two failed imports of one navigation stay two answers, in the order the record holds them',
      },
      {
        file: JOIN_REL,
        anchor: 'for (let i = 0; i < attempts.length; i += 1) {',
        holds:
          'the join walks every attempt in the order the list holds them and answers each one',
      },
      {
        file: PANEL_REL,
        anchor: 'const rows = answer.map((entry) =>',
        holds:
          'the pane keeps one row per answer, in the order the join answered them, and drops none',
      },
    ],
    absence: null,
  },
  {
    edge: 'E3',
    claim:
      'A failed attempt whose request produced no status answers `never-completed` with `no-response`, carries no `status`, and is never written as a 404.',
    fields: ['state', 'reason', 'status'],
    suite: 'scripts/chunk-failure.test.mjs',
    test: 'SC2 - a request that produced no status is never-completed, and is never written as a 404',
    citations: [
      {
        file: 'scripts/chunk-failure.test.mjs',
        anchor:
          "test('SC2 - a request that produced no status is never-completed, and is never written as a 404'",
        holds:
          'a request that produced no status answers never-completed and names no 404 anywhere',
      },
      {
        file: JOIN_REL,
        anchor:
          'return entry.status === null ? NEVER_COMPLETED : MISSING_IMPORT;',
        holds:
          'the missing status decides the state rather than a number the join would have to invent',
      },
      {
        file: 'scripts/import-failure.test.mjs',
        anchor:
          "test('an attempt with no response is never-completed, names no-response and carries no status'",
        holds:
          'the record itself states no status where no response arrived, and names the absence',
      },
    ],
    absence: null,
  },
  {
    edge: 'E4',
    claim:
      'A hash is answered character for character as the record carried it, and is never completed from the chunk filename the specifier names.',
    fields: ['hash', 'specifier'],
    suite: 'scripts/chunk-failure.test.mjs',
    test: 'SC1 - a failed import answers the status it produced, and a truncated hash stays truncated',
    citations: [
      {
        file: 'scripts/chunk-failure.test.mjs',
        anchor:
          "test('SC1 - a failed import answers the status it produced, and a truncated hash stays truncated'",
        holds:
          'the hash is the record own value, and never the chunk filename the specifier ends with',
      },
      {
        file: JOIN_REL,
        anchor: "put(written, 'hash', entry.hash);",
        holds:
          'the hash is copied from the record and from nowhere else, so no branch completes it',
      },
      {
        file: PANEL_REL,
        anchor:
          'A truncated hash is printed exactly as the record carried it: this reader never pads, completes or',
        holds:
          'the surface pads and completes nothing, so a short hash renders as short as it arrived',
      },
      {
        file: 'scripts/chunk-failure-copy.test.mjs',
        anchor: 'const completed = mutatedPane(',
        holds:
          'the mutant that completes a hash reddens the line pin, so the rule is measured and not stated',
      },
    ],
    absence: {
      part: 'a sample whose hash the record marks as truncated',
      reason:
        'no attempt sample in this checkout marks its hash as truncated: the join has no truncation branch, so what the tree holds is that a hash is carried character for character and never completed from a filename. The edge own words - a hash the record truncates - are recorded as this absence rather than cited from a line that does not exist.',
    },
  },
  {
    edge: 'E5',
    claim:
      'The import-failure record is the only producer of an import specifier under `extension/`, the join is its single reader, and a third module naming that vocabulary is refused by the census.',
    fields: ['specifier'],
    suite: 'scripts/import-failure.test.mjs',
    test: 'SC3 - the record is the only producer of an import specifier under extension/, and one join reads it',
    citations: [
      {
        file: 'scripts/import-failure.test.mjs',
        anchor:
          "test('SC3 - the record is the only producer of an import specifier under extension/, and one join reads it'",
        holds:
          'the census names one producer and one reader, and a third module naming the word reddens it',
      },
      {
        file: 'scripts/chunk-failure.test.mjs',
        anchor:
          "test('the join and the record read one list of fields, and the record module publishes it'",
        holds:
          'the fields the join reads are the fields the record publishes, asserted as one list',
      },
      {
        file: JOIN_REL,
        anchor: 'const ATTEMPT_FIELDS = [',
        holds:
          'the join names the attempt fields it reads, so its inputs and the record are one list',
      },
      {
        file: IMPORT_RECORDING_REL,
        anchor: '"producer": "extension/import-failure.js",',
        holds:
          'the recording states the one module that produces an import specifier for this milestone',
      },
    ],
    absence: null,
  },
  {
    edge: 'E6',
    claim:
      'The surface is one entry of `PANEL_SURFACES`, one key of `LOADERS`, one fact of `FACTS` and one row of the specs that enumerate the panel, so a surface dropped from any of them reddens naming it.',
    fields: ['state'],
    suite: 'scripts/panel-routes.test.mjs',
    test: 'E4: every declared route surface has a panel-demo LOADERS key',
    citations: [
      {
        file: 'scripts/panel-routes.test.mjs',
        anchor:
          "test('E4: every declared route surface has a panel-demo LOADERS key'",
        holds:
          'every declared surface has a loader key, and a dropped key reddens naming the surface',
      },
      {
        file: 'scripts/panel-routes.test.mjs',
        anchor:
          "test('E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name'",
        holds:
          'the route table is one list mapped over one literal, and every surface keeps its own path',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/panel-demo.ts',
        anchor:
          "  'chunk-failure': () => import('./panel-chunk-failure') as never,",
        holds:
          'the demo loader map carries the key that reaches this surface and no second importer',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/app.spec.ts',
        anchor:
          "'chunk-failure', // M064 SC4 surface: the specifier the router could not load",
        holds:
          'the app spec enumerates the surface in the route order the table installs it in',
      },
      {
        file: 'apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts',
        anchor:
          "'chunk-failure', // M064 SC4 surface: the specifier the router could not load",
        holds:
          'the chat-entry spec enumerates the surface in the first of the three lists it carries',
      },
    ],
    absence: {
      part: 'one assertion that the three chat-entry lists and app.spec.ts move together',
      reason:
        'no node suite in this checkout asserts the three chat-entry lists and app.spec.ts as one statement: each list is pinned by the TypeScript spec that carries it and run by `npx nx run angular-ai-devtools:test`, so the citations below name the line each list carries the surface at, and this record states no assertion it cannot cite.',
    },
  },
  {
    edge: 'E7',
    claim:
      'A failure the record attributes to a route path the router never attempted answers without that path, rather than naming a route no load reached.',
    fields: ['state', 'routePath'],
    suite: 'scripts/chunk-failure.test.mjs',
    test: 'SC1 - a failure attributed to a route the router never attempted is refused',
    citations: [
      {
        file: 'scripts/chunk-failure.test.mjs',
        anchor:
          "test('SC1 - a failure attributed to a route the router never attempted is refused'",
        holds:
          'a route path the router never attempted is refused, and the answer keeps the failure',
      },
      {
        file: JOIN_REL,
        anchor:
          'return attempted.indexOf(routePath) === -1 ? null : routePath;',
        holds:
          'the attribution is written only where the router stream names that path as one it tried',
      },
    ],
    absence: null,
  },
  {
    edge: 'E8',
    claim:
      'No line of the pane prints a value the answer did not carry, and no literal the pane declares is a sentence-shaped repair, a schematic or an identity the answer was not given.',
    fields: ['state', 'specifier', 'routePath', 'status', 'hash', 'reason'],
    suite: 'scripts/chunk-failure-copy.test.mjs',
    test: 'mutants redden by name: a remedy sentence, two rows collapsed, a hash completed, a loader key dropped',
    citations: [
      {
        file: 'scripts/chunk-failure-copy.test.mjs',
        anchor:
          "test('mutants redden by name: a remedy sentence, two rows collapsed, a hash completed, a loader key dropped'",
        holds:
          'a sentence the pane would print reddens the scan, so the no-sentence rule is measured',
      },
      {
        file: 'scripts/chunk-failure-copy.test.mjs',
        anchor: "test('the pane declares no sentence and reads no page'",
        holds:
          'the pane declares no sentence of its own and reads no page, and the scan is not vacuous',
      },
      {
        file: PANEL_REL,
        anchor:
          ' * - No remedy, no cause and no schematic. The answer carries none of the three, so no line of this',
        holds:
          'the pane states that it offers no repair and no schematic, and it carries none of the three',
      },
    ],
    absence: null,
  },
];

// ------------------------------------------------------------------- reading ----

/** @param {Buffer | string} bytes @returns {string} */
function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} path @returns {string} */
function shown(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** @param {string} rel @returns {string} */
function absPath(rel) {
  return join(ROOT, ...rel.split('/'));
}

/**
 * One committed file, as text. A missing file is named with the path a reader can open.
 * @param {string} rel @param {string} why @returns {string}
 */
function readText(rel, why) {
  const path = absPath(rel);
  assert.ok(existsSync(path), `${rel} is missing - ${why}`);
  return stripBom(readFileSync(path, 'utf8'));
}

/** The milestone `.project/STATE.md` binds, read as its branch line. @returns {string} */
function boundMilestone() {
  const text = readText(
    '.project/STATE.md',
    'the state file is part of this repository and it binds the milestone',
  );
  const branch = /^branch:\s*(\S+)\s*$/m.exec(text)?.[1] ?? '';
  const number = /^gsd-path\/M(\d{3})$/.exec(branch)?.[1];
  assert.ok(
    number,
    `STATE.md must name the milestone under work by branch, and it names ${JSON.stringify(branch)}`,
  );
  return `M${number}`;
}

/** The intent and plan of this milestone, read once per run. */
let SOURCES = null;

function sources() {
  if (SOURCES === null) {
    const intentPath = intentPathForMilestone(ROOT, MILESTONE);
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    SOURCES = {
      intentPath,
      planPath,
      intentSource: readText(
        shown(intentPath),
        `the intent ${MILESTONE} binds`,
      ),
      planSource: readText(shown(planPath), `the plan ${MILESTONE} binds`),
    };
  }
  return SOURCES;
}

/**
 * The numbered success criteria of an intent, parsed with the routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so a row quotes the criterion that suite compares it
 * to and not this file's paraphrase of it.
 * @param {string} source @returns {Record<string, string>}
 */
function intentCriteria(source) {
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
 * The text of one `##` section, up to the next `##` heading.
 * @param {string} source @param {string} heading @returns {string}
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
 * The data cells of every row of one pipe-delimited table, with the header included. A row of another
 * width is refused by name rather than skipped.
 * @param {string} section @param {number} columns @param {string} what @returns {string[][]}
 */
function tableRows(section, columns, what) {
  /** @type {string[][]} */
  const rows = [];
  for (const line of section.split(/\r?\n/)) {
    if (!/^\s*\|/.test(line)) continue;
    const cells = line.split('|').map((cell) => cell.trim());
    const data = cells.slice(1, -1);
    if (data.length === 0) continue;
    assert.equal(
      data.length,
      columns,
      `${what} carries ${String(data.length)} column(s); the grammar this reading holds is ${String(columns)}, so a row of another width is a different shape`,
    );
    rows.push(data);
  }
  return rows;
}

/**
 * The edges the bound intent's own five-column edge-coverage table binds to each criterion, with the
 * header read as written so a table headed differently is refused.
 * @param {string} source
 * @returns {Array<{ edge: string, criterion: string, category: string, disposition: string, detail: string }>}
 */
function intentEdges(source) {
  const cells = tableRows(
    sectionOf(source, '## Edge coverage'),
    5,
    "the intent's edge-coverage table",
  );
  assert.deepEqual(
    cells[0],
    EDGE_COLUMNS,
    `the intent's edge-coverage table must be headed exactly ${EDGE_COLUMNS.join(' | ')}, and it is headed ${JSON.stringify(cells[0])}`,
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
    'the intent must list its edge coverage as a five-column table, so each claim has an edge it holds',
  );
  return rows;
}

/** The plan's held-out row, in both forms the plans in this repository write it. */
const HELD_OUT_BULLET =
  /^\s*[-*]\s*(E\d+)\s*(?:→|->|—)\s*(T\d+)\s*(?:→|->|—)\s*`([^`]+)`\s*$/;

/**
 * The plan's `## Held-out checks`: one row per edge, naming the task that holds it and the suite that
 * carries it. A claim's suite is read from here rather than chosen by this file.
 * @param {string} source @returns {Map<string, { task: string, test: string }>}
 */
function planHeldOut(source) {
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
  assert.ok(
    held.size > 0,
    'the plan must write its held-out mapping as rows, or no claim can read the suite that proves its edge',
  );
  return held;
}

/**
 * The plan's `## Intent coverage` table, `Criterion | Task | Acceptance`.
 * @param {string} source @returns {Array<{ criterion: string, task: string, acceptance: string }>}
 */
function planCoverage(source) {
  /** @type {Array<{ criterion: string, task: string, acceptance: string }>} */
  const rows = [];
  const cells = tableRows(
    sectionOf(source, '## Intent coverage'),
    3,
    "the plan's intent-coverage table",
  );
  for (const data of cells) {
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
 * Every held-out row whose task the plan's `## Intent coverage` table does not assign that edge's
 * criterion. A plan whose two tables agree carries none, and that is the ordinary case: the record
 * states the list so a disagreement is visible where the citation is.
 * @param {Array<{ edge: string, criterion: string }>} edges
 * @param {Map<string, { task: string, test: string }>} heldOut
 * @param {Array<{ criterion: string, task: string, acceptance: string }>} coverage
 * @returns {Array<{ edge: string, criterion: string, heldBy: string, assignedByCoverage: string[] }>}
 */
function coverageDisagreements(edges, heldOut, coverage) {
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

/**
 * The declarations a suite carries, counted the way the whole-tree count counts them, and the titles
 * it declares. A title is read from the one line that declares it; every suite this file cites writes
 * its titles on one line.
 * @param {string} source @returns {{ tests: number, groups: number, titles: string[] }}
 */
function declarationsIn(source) {
  /** @type {string[]} */
  const titles = [];
  for (const line of source.split(/\r?\n/)) {
    const declared = /^[ \t]*(?:it|test)\(\s*(['"`])(.*?)\1/.exec(line);
    if (declared !== null) titles.push(declared[2] ?? '');
  }
  return {
    tests: (source.match(/^[ \t]*(?:test|it)\(/gm) ?? []).length,
    groups: (source.match(/^[ \t]*describe\(/gm) ?? []).length,
    titles,
  };
}

/**
 * The seven fields the join returns, read from the shipped module in a bare `node:vm` context: the
 * world holds nothing but the source, so the list read back is the one the join publishes.
 * @returns {string[]}
 */
function joinFields() {
  const source = readText(
    JOIN_REL,
    'the join this milestone renders is the evidence of its own interface',
  );
  const context = createContext({});
  runInContext(source, context, { filename: JOIN_REL });
  const api = context.angularAiChunkFailure;
  assert.ok(
    api,
    `${JOIN_REL} must publish angularAiChunkFailure on the global object of whatever world it runs in`,
  );
  const fields = JSON.parse(JSON.stringify(api.FIELDS));
  assert.ok(
    Array.isArray(fields) && fields.length > 0,
    `${JOIN_REL} must publish its field list`,
  );
  return fields;
}

/** One file's code with its comments removed, so a scan measures code and not prose. */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/**
 * The modules directly under `extension/` whose code names an import specifier: the census E5 is
 * written about. One walk of the tree, each module read once.
 * @param {string[]} [names] the modules to read, by default the tree's own
 * @returns {string[]}
 */
function specifierSources(names = null) {
  const files =
    names ??
    readdirSync(join(ROOT, 'extension'))
      .filter((name) => name.endsWith('.js'))
      .sort();
  return files
    .filter((name) =>
      codeOf(
        readText(`extension/${name}`, 'the census reads every module'),
      ).includes('specifier'),
    )
    .map((name) => `extension/${name}`);
}

/**
 * The pin the census is: exactly the producer and its one reader name an import specifier, and a
 * third module naming it is refused by name rather than counted.
 * @param {string[]} sources
 * @returns {string[]}
 */
function assertOneProducerOneReader(sources) {
  const expected = [RECORD_REL, JOIN_REL].sort();
  assert.deepEqual(
    [...sources].sort(),
    expected,
    `exactly ${expected.join(' and ')} must name an import specifier under extension/, and these do: ${JSON.stringify([...sources].sort())} - a third module is the second source this census refuses`,
  );
  return [...sources].sort();
}

/**
 * One line of a file, by the anchor that sits on it. The anchor must occur exactly once, so a
 * citation names one place rather than the first of several, and the text is the trimmed line the
 * house records state.
 * @param {string} file @param {string} anchor @param {string} where
 * @returns {{ file: string, line: number, lineText: string }}
 */
function citedLine(file, anchor, where) {
  const lines = readText(file, `${where} cites it`).split(/\r?\n/);
  const found = lines.filter((line) => line.includes(anchor));
  assert.equal(
    found.length,
    1,
    `${where} anchors ${JSON.stringify(anchor)} and ${file} carries it ${String(found.length)} time(s), so the citation would not name one line`,
  );
  return {
    file,
    line: lines.indexOf(found[0]) + 1,
    lineText: found[0].trim(),
  };
}

/** The command that proves one cited file, or null where the file is not run by a command. */
function commandFor(file) {
  if (/\.test\.mjs$/.test(file)) return `node --test ${file}`;
  if (file.endsWith('.spec.ts')) return 'npx nx run angular-ai-devtools:test';
  return null;
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather
 * than reported as a mismatch somewhere in a record of several hundred lines.
 * @param {any} left @param {any} right @param {string} at @returns {string}
 */
function firstDifference(left, right, at) {
  if (JSON.stringify(left) === JSON.stringify(right)) return '';
  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${at}: ${String(left.length)} row(s) -> ${String(right.length)} row(s)`;
    }
    for (let index = 0; index < left.length; index += 1) {
      const found = firstDifference(
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
 * The failure a pin raises on a value, so a mutant's evidence is the assertion's own message rather
 * than the wrapper a `doesNotThrow` puts around it.
 * @param {() => void} pin @param {string} what @returns {Error}
 */
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
  return /** @type {Error} */ (failure);
}

/**
 * A deep copy of a record, so a mutant is planted on a copy and the file on disk is never touched.
 * @param {any} value @returns {any}
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// ----------------------------------------------------------------- derivation ----

/**
 * The record, derived. Every value below is interpolated from a file this checkout carries or from
 * `EDGE_PROOFS` above, so a citation that moves makes the record stale rather than quietly wrong.
 * @param {string} intentSource @param {string} planSource
 * @param {string} intentPath @param {string} planPath
 * @returns {Record<string, any>}
 */
function derive(intentSource, planSource, intentPath, planPath) {
  const criteria = intentCriteria(intentSource);
  const edges = intentEdges(intentSource);
  const heldOut = planHeldOut(planSource);
  const coverage = planCoverage(planSource);
  const disagreements = coverageDisagreements(edges, heldOut, coverage);
  const fields = joinFields();

  // Every edge row has exactly one claim and every claim an edge row, so the table and the record
  // cannot describe two different lists.
  assert.deepEqual(
    EDGE_PROOFS.map((proof) => proof.edge),
    edges.map((edge) => edge.edge),
    `the claims must be one per edge row, in the intent's order: the proofs name ${JSON.stringify(EDGE_PROOFS.map((proof) => proof.edge))} and the intent states ${JSON.stringify(edges.map((edge) => edge.edge))}`,
  );
  const missingHeldOut = edges.filter((edge) => !heldOut.has(edge.edge));
  assert.equal(
    missingHeldOut.length,
    0,
    `the plan holds out no row for ${missingHeldOut.map((edge) => edge.edge).join(', ')}, so a claim would cite a suite the plan never assigned`,
  );

  const edgeClaims = edges.map((edge, index) => {
    const proof = EDGE_PROOFS[index];
    const where = `the claim for ${edge.edge}`;
    assert.equal(
      proof.suite,
      heldOut.get(edge.edge)?.test ?? '',
      `${where} names ${proof.suite} and the plan holds ${edge.edge} out at ${String(heldOut.get(edge.edge)?.test)}, so the claim cites the suite the milestone itself assigned`,
    );
    const titles = declarationsIn(
      readText(proof.suite, `${where} names it`),
    ).titles;
    assert.ok(
      titles.includes(proof.test),
      `${where} names ${JSON.stringify(proof.test)} as the test that proves it, and ${proof.suite} declares no such test at this head: it declares ${JSON.stringify(titles)}`,
    );
    for (const field of proof.fields) {
      assert.ok(
        fields.includes(field),
        `${where} names the field ${JSON.stringify(field)} and the join returns ${JSON.stringify(fields)}, so the claim would name a field no answer carries`,
      );
    }
    const citations = proof.citations.map((citation) => ({
      ...citedLine(citation.file, citation.anchor, where),
      holds: citation.holds,
    }));
    const commands = [
      CHECK_COMMAND,
      commandFor(proof.suite) ?? 'npm run check',
      ...citations.map((citation) => commandFor(citation.file)),
    ].filter((command) => typeof command === 'string');
    return {
      edge: edge.edge,
      criterion: edge.criterion,
      category: edge.category,
      disposition: edge.disposition,
      detail: edge.detail,
      claim: proof.claim,
      fields: proof.fields,
      suite: proof.suite,
      test: proof.test,
      citations,
      absence: proof.absence,
      proves: [...new Set([...commands, 'npm run check'])],
    };
  });

  // Every field the join returns is named by some claim, so a field the interface gained and no claim
  // measured would be a hole rather than a claim.
  const claimed = [
    ...new Set(edgeClaims.flatMap((claim) => claim.fields)),
  ].sort();
  assert.deepEqual(
    claimed,
    [...fields].sort(),
    `the eight claims must name every field the join returns and no other: they name ${JSON.stringify(claimed)} and the join returns ${JSON.stringify(fields)}`,
  );

  const packageText = readText(
    'package.json',
    'the check chain is part of this repository',
  );
  const stages = String(JSON.parse(packageText).scripts?.check ?? '')
    .split(' && ')
    .map((stage) => stage.trim());

  const claims = Object.entries(criteria).map(([criterion, criterionText]) => {
    const held = edges.filter((edge) => edge.criterion === criterion);
    assert.ok(
      held.length > 0,
      `the intent's edge coverage names no edge for ${criterion}, so its claim cites no line`,
    );
    const rows = held.map((edge) => {
      const proof = EDGE_PROOFS[edges.indexOf(edge)];
      return {
        edge: edge.edge,
        category: edge.category,
        disposition: edge.disposition,
        detail: edge.detail,
        suite: proof?.suite ?? '',
      };
    });
    const proofs = held.map((edge) => {
      const claim = edgeClaims[edges.indexOf(edge)];
      return {
        suite: claim.suite,
        test: claim.test,
        holds: claim.claim,
        citations: claim.citations.length,
      };
    });
    const primary = proofs[0];
    assert.ok(
      primary,
      `${criterion} carries no proof, so its row cites nothing`,
    );
    const suites = [...new Set(proofs.map((proof) => proof.suite))];
    const assignedSuites = [...new Set(rows.map((row) => row.suite))];
    assert.deepEqual(
      suites,
      assignedSuites,
      `${criterion} must cite every suite the plan resolves one of its edges to: it cites ${JSON.stringify(suites)} against ${JSON.stringify(assignedSuites)}`,
    );
    const named = JSON.stringify(rows.map((row) => row.edge));
    const varied = rows
      .map(
        (row) =>
          `${row.edge} ${row.category} ${row.disposition}: ${row.detail}`,
      )
      .join('; ');
    const suiteText = readText(
      primary.suite,
      `${criterion} names it as the suite that proves it`,
    );
    const { tests, groups } = declarationsIn(suiteText);
    const lines = proofs.reduce((sum, proof) => sum + proof.citations, 0);
    const freed = disagreements.filter((one) => one.criterion === criterion);
    return {
      criterion,
      criterionText,
      criterionCharacters: criterionText.length,
      ruling: 'not-required',
      reason: `The charter's portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts. ${criterion} is ${JSON.stringify(criterionText)} - a fact about this repository's own failure record, the join that reads it and the lines that hold them, which no route of any page produces: it is proved by the citations this claim names, at this head, and the gate's one \`control-ai-browsers run\` driver returns an element's toolElements, drawnRect, descriptor and noDevContext readings, none of which can say which line of a suite holds a claim, so a portal-backed row would name a driver that cannot carry the answer. The portal is named because the clause is answered rather than dodged: the evidence is the edge row(s) ${named} the intent itself assigns the criterion, held by the plan at ${JSON.stringify(assignedSuites)}, and the ${String(lines)} line citation(s) below name the file and the line that carry each part of them.${freed.length === 0 ? '' : ` The plan's two tables disagree about ${freed.map((one) => `${one.edge}, held out at ${one.heldBy} while the coverage table assigns ${one.criterion} to ${one.assignedByCoverage.join('/') || 'no task'}`).join('; ')}, which this record states under evidence.plan.disagreements rather than refusing to cite it.`}`,
      suite: primary.suite,
      test: primary.test,
      citations: proofs.map((proof) => ({
        suite: proof.suite,
        test: proof.test,
        holds: proof.holds,
      })),
      edges: rows,
      artefactPath: primary.suite,
      artefact: `${primary.suite} (test ${JSON.stringify(primary.test)}; edge ${named} of the intent's own coverage: ${varied}; the suite carries ${String(tests)} test declaration(s) in ${String(groups)} group(s)) -> package.json ("check": ${String(stages.length)} stage(s), ${JSON.stringify(stages.slice(-2))} last)`,
      reading: `${String(proofs.length)} edge claim(s) over ${String(suites.length)} suite(s) and ${String(lines)} line citation(s) hold ${criterion} through the edge row(s) ${named} the intent assigns it: every citation is a line this checkout carries at this head, opened and read back by this suite, so the criterion is proved by a line a reader can open rather than by a drive no driver here performs`,
      proves: [
        CHECK_COMMAND,
        ...suites
          .map((suite) => commandFor(suite))
          .filter((command) => typeof command === 'string'),
        'npm run check',
      ],
    };
  });

  const citedFiles = [
    ...new Set(
      edgeClaims.flatMap((claim) =>
        claim.citations.map((citation) => citation.file),
      ),
    ),
  ].sort();
  const lineCitations = edgeClaims.reduce(
    (sum, claim) => sum + claim.citations.length,
    0,
  );
  const absences = edgeClaims.filter((claim) => claim.absence !== null).length;

  return {
    schema: `${MILESTONE.toLowerCase()}-verdict-claims/v1`,
    milestone: MILESTONE,
    quotes: {
      from: `scripts/verdict-claims-intent.mjs (intentPathForMilestone(ROOT, ${JSON.stringify(MILESTONE)}))`,
      how: `parsed with the same routine scripts/overlay-verdict-claims.test.mjs uses, extracted into this file and run over the resolved intent, so every criterionText is the intent's own text: the ${String(Object.keys(criteria).length)} criteria it declares are ${JSON.stringify(Object.keys(criteria))} and scripts/overlay-verdict-claims.test.mjs compares them character for character`,
      proofs: `every citation in this record is a line read from this checkout at capture: ${String(lineCitations)} citation(s) over ${JSON.stringify(citedFiles)}, each resolved by searching its file for the exact text it states rather than by trusting a typed number, and each claim names the suite and the test title the suite declares at this head`,
      edges: `read from ${shown(intentPath)}'s own five-column edge-coverage table (Edge | Criterion | Category | Disposition | Detail) for the edge-to-criterion rows, and the test-to-edge mapping from ${shown(planPath)}'s ## Held-out checks section, which this path reads as ${String(heldOut.size)} row(s) of edge -> task -> test in either form a plan writes it - the three-column Edge | Task | Test table, or the bullet '- E.. -> T.. -> test' - so a claim cites the suite the milestone's own plan assigns its edges rather than one this file chose: ${String(edges.length)} edge row(s) over the criteria ${JSON.stringify([...new Set(edges.map((edge) => edge.criterion))])} and the suites ${JSON.stringify([...new Set(edgeClaims.map((claim) => claim.suite))])}. The plan's ## Held-out checks and its ## Intent coverage table disagree at ${String(disagreements.length)} row(s) ${JSON.stringify(disagreements.map((one) => `${one.edge} is held by ${one.heldBy} and ${one.criterion} is assigned to ${one.assignedByCoverage.join('/') || 'no task'}`))}, recorded under evidence.plan.disagreements rather than refused, because a reader needs the citation and the disagreement in one place. ${String(absences)} edge claim(s) state an absence for a part of the edge no line in this checkout carries`,
    },
    ruling: {
      required: 0,
      notRequired: claims.length,
      why: [
        'No row is required, and the record therefore names no driver, no instance and no verdict path: scripts/overlay-verdict-claims.test.mjs refuses a list with no required row that names a driver, so naming one would be the opposite defect.',
        `The reason is not convenience. A required row must name the driver a control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four readings - toolElements, drawnRect, descriptor and noDevContext. Every fact the ${String(claims.length)} criteria this milestone declares is written about is a fact about this repository's own failure record, the join that reads it and the lines that hold them, against ${String(stages.length)} stage(s) of the check chain; none of them is an element's rect or a dev context, so naming a driver would make the gate return a page reading for a claim about the gate.`,
        'The portal is not lost by that ruling: each reason names the clause that would have made a row required, and each claim names the line, the suite, the test and the commands that prove it.',
      ],
    },
    evidence: {
      intent: { path: shown(intentPath), criteria: Object.keys(criteria) },
      plan: {
        path: shown(planPath),
        heldOut: [...heldOut.keys()].sort(),
        coverage: coverage.map(
          (row) => `${row.criterion} ${row.task} ${row.acceptance}`,
        ),
        disagreements,
      },
      edges: {
        rows: edges.length,
        criteria: [...new Set(edges.map((edge) => edge.criterion))],
        columns: EDGE_COLUMNS,
      },
      answerFields: fields,
      specifierSources: assertOneProducerOneReader(specifierSources()),
      suites: [
        ...new Set(
          claims.flatMap((claim) =>
            claim.citations.map((citation) => citation.suite),
          ),
        ),
      ]
        .sort()
        .map((suite) => {
          const { tests, groups } = declarationsIn(
            readText(
              suite,
              'the suite a claim names as the test that proves it',
            ),
          );
          return { path: suite, tests, groups };
        }),
      records: readdirSync(join(ROOT, RAW))
        .filter(
          (name) =>
            name.startsWith(`${MILESTONE.toLowerCase()}-`) &&
            `${RAW}/${name}` !== CLAIMS_REL,
        )
        .sort()
        .map((name) => `${RAW}/${name}`),
    },
    capture: {
      command: CAPTURE_COMMAND,
      check: CHECK_COMMAND,
      records: CLAIMS_REL,
      criteria: claims.map((claim) => claim.criterion),
      reading:
        'an armed run re-derives the list from the intent this checkout binds, its five-column edge coverage, the plan that holds each edge out, the join module whose fields it states and the lines each citation names, and writes it only when a value moved; a default run reads the file and asserts it is exactly what this head derives, naming the field that moved when it is not.',
    },
    claims,
    edgeClaims,
  };
}

/** The record this head derives, read once per run. */
let DERIVED = null;

function derived() {
  if (DERIVED === null) {
    const { intentSource, planSource, intentPath, planPath } = sources();
    DERIVED = derive(intentSource, planSource, intentPath, planPath);
  }
  return DERIVED;
}

/** @param {any} record @returns {string} */
function canonical(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

// --------------------------------------------------------------------- pins ----

/** @param {any} record @returns {any[]} */
function claimsOf(record) {
  assert.ok(
    Array.isArray(record?.edgeClaims) && record.edgeClaims.length > 0,
    'the record must carry its edge claims, or no edge of the intent is claimed at all',
  );
  return record.edgeClaims;
}

/**
 * One claim per edge row, in the intent's order, each quoting the row it holds and each naming a
 * suite that declares the test it cites. A claim missing from the list, or a claim whose cells are not
 * the table's, reddens by claim id.
 * @param {any} record @returns {void}
 */
function assertOneClaimPerEdge(record) {
  const edges = intentEdges(sources().intentSource);
  const claims = claimsOf(record);
  assert.deepEqual(
    claims.map((claim) => claim?.edge),
    edges.map((edge) => edge.edge),
    `the record must carry one claim per edge row, in the intent's order: it carries ${JSON.stringify(claims.map((claim) => claim?.edge))} and the intent states ${JSON.stringify(edges.map((edge) => edge.edge))}`,
  );
  for (const [index, claim] of claims.entries()) {
    const edge = edges[index];
    const where = `the claim for ${String(claim?.edge ?? `edgeClaims[${index}]`)}`;
    for (const cell of ['criterion', 'category', 'disposition', 'detail']) {
      assert.equal(
        claim[cell],
        edge[cell],
        `${where} must carry the ${cell} the intent's edge row states: it carries ${JSON.stringify(claim[cell])} and the intent states ${JSON.stringify(edge[cell])}`,
      );
    }
    assert.ok(
      typeof claim.claim === 'string' && claim.claim.trim().length >= 40,
      `${where} states no claim, so the row is a citation with nothing asserted`,
    );
    assert.ok(
      Array.isArray(claim.fields) && claim.fields.length > 0,
      `${where} names no answer field, so it is held to nothing the join returns`,
    );
    assert.ok(
      Array.isArray(claim.citations) && claim.citations.length > 0,
      `${where} carries no citation: a claim with no citation is held by no line of this checkout, and the task's own words make the citation the claim`,
    );
    assert.ok(
      typeof claim.suite === 'string' && claim.suite !== '',
      `${where} names no suite, so no test proves it`,
    );
    assert.ok(
      typeof claim.test === 'string' && claim.test !== '',
      `${where} names no test in ${claim.suite}, so the claim cites a file rather than a test`,
    );
    const titles = declarationsIn(
      readText(
        String(claim.suite),
        `${where} cites it as the suite that proves the claim`,
      ),
    ).titles;
    assert.ok(
      titles.includes(claim.test),
      `${where} names ${JSON.stringify(claim.test)} as the test that proves it, and ${claim.suite} declares no such test at this head: it declares ${JSON.stringify(titles)}`,
    );
    if (claim.absence === null) continue;
    assert.equal(
      typeof claim.absence,
      'object',
      `${where} carries an absence that is neither a statement nor null`,
    );
    assert.ok(
      typeof claim.absence.part === 'string' &&
        claim.absence.part.trim().length >= 15,
      `${where} must state the part of the edge it cannot cite`,
    );
    assert.ok(
      typeof claim.absence.reason === 'string' &&
        claim.absence.reason.trim().length >= 60,
      `${where} must state why the part is an absence rather than cite it`,
    );
  }
}

/**
 * Every citation resolves: the file is one this checkout carries, the line is inside it, and the text
 * at that line is the text the citation states. A citation whose line moved, or whose text no longer
 * reads as the record says, reddens naming the claim and the citation.
 * @param {any} record @returns {void}
 */
function assertCitationsResolve(record) {
  for (const claim of claimsOf(record)) {
    const where = `the claim for ${String(claim?.edge ?? 'an edge')}`;
    assert.ok(
      Array.isArray(claim.citations) && claim.citations.length > 0,
      `${where} carries no citation: a claim with no citation is held by no line of this checkout`,
    );
    for (const citation of claim.citations) {
      const file = String(citation?.file ?? '');
      assert.ok(file !== '', `${where} carries a citation that names no file`);
      const path = absPath(file);
      assert.ok(
        existsSync(path),
        `${where} cites ${file}, which this checkout does not carry`,
      );
      const lines = readFileSync(path, 'utf8').split(/\r?\n/);
      assert.ok(
        Number.isInteger(citation.line) &&
          citation.line >= 1 &&
          citation.line <= lines.length,
        `${where} cites ${file}:${String(citation.line)}, and that file carries ${String(lines.length)} line(s), so the number names no line`,
      );
      const actual = (lines[citation.line - 1] ?? '').trim();
      assert.equal(
        actual,
        citation.lineText,
        `${where} cites ${file}:${String(citation.line)} and that line reads ${JSON.stringify(actual)} at this head, not the ${JSON.stringify(citation.lineText)} the citation states`,
      );
      assert.ok(
        typeof citation.holds === 'string' &&
          citation.holds.trim().length >= 30,
        `${where} does not state which part of the edge ${JSON.stringify(`${file}:${String(citation.line)}`)} holds`,
      );
    }
  }
}

/**
 * Every field a claim names is a field the join returns, and the eight claims name the join's whole
 * list and no more. A claim naming a field no answer carries is refused by claim id and by field.
 * @param {any} record @returns {void}
 */
function assertClaimedFields(record) {
  const fields = joinFields();
  for (const claim of claimsOf(record)) {
    const where = `the claim for ${String(claim?.edge ?? 'an edge')}`;
    assert.ok(
      Array.isArray(claim.fields) && claim.fields.length > 0,
      `${where} names no answer field, so it is held to nothing the join returns`,
    );
    for (const field of claim.fields) {
      assert.ok(
        fields.includes(field),
        `${where} names the field ${JSON.stringify(field)}, and the join returns ${JSON.stringify(fields)}: a claim may name only a field an answer carries`,
      );
    }
  }
  const claimed = [
    ...new Set(claimsOf(record).flatMap((claim) => claim.fields)),
  ].sort();
  assert.deepEqual(
    claimed,
    [...fields].sort(),
    `the claims must name every field the join returns and no other: they name ${JSON.stringify(claimed)} and the join returns ${JSON.stringify(fields)}`,
  );
}

/**
 * No claim offers a repair, a cause or a drift. The claim's own text, every citation's `holds` and the
 * absence it states are scanned for the words such a claim is written with, and the refusal names the
 * claim and the word.
 * @param {any} record @returns {void}
 */
function assertNamesNoRepair(record) {
  for (const claim of claimsOf(record)) {
    const where = `the claim for ${String(claim?.edge ?? 'an edge')}`;
    const stated = [
      String(claim.claim ?? ''),
      ...(claim.citations ?? []).map((citation) =>
        String(citation?.holds ?? ''),
      ),
      String(claim.absence?.part ?? ''),
      String(claim.absence?.reason ?? ''),
    ]
      .join(' ')
      .toLowerCase();
    for (const word of FORBIDDEN) {
      assert.ok(
        !stated.includes(word),
        `${where} states ${JSON.stringify(word)}, and a claim states what the record carries: no claim may name a cause, a repair or a drift it did not measure - ${JSON.stringify(stated.slice(0, 200))}`,
      );
    }
  }
}

/**
 * The criterion rows quote the intent character for character, rule not-required, and cite every suite
 * the plan resolves one of their edges to: the shape the two censuses before this one read.
 * @param {any} record @returns {void}
 */
function assertCriterionRows(record) {
  const criteria = intentCriteria(sources().intentSource);
  assert.deepEqual(
    record.claims.map((/** @type {any} */ row) => row.criterion),
    Object.keys(criteria),
    `every criterion the intent declares is ruled exactly once: the record rules ${JSON.stringify(record.claims.map((/** @type {any} */ row) => row.criterion))} against ${JSON.stringify(Object.keys(criteria))}`,
  );
  for (const row of record.claims) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} must quote the intent character for character: claims[${String(record.claims.indexOf(row))}].criterionText is ${JSON.stringify(row.criterionText)} and the intent states ${JSON.stringify(criteria[row.criterion])}`,
    );
    assert.equal(
      row.criterionCharacters,
      row.criterionText.length,
      `${row.criterion} states ${String(row.criterionCharacters)} character(s) for a quote of ${String(row.criterionText.length)}`,
    );
    assert.equal(
      row.ruling,
      'not-required',
      `${row.criterion} rules ${JSON.stringify(row.ruling)}, and this milestone owes no portal-backed verdict`,
    );
    assert.match(
      row.reason,
      /portal/i,
      `${row.criterion} must answer the charter's portal clause by name`,
    );
    assert.ok(
      row.reason.trim().length >= 60,
      `${row.criterion} must state why the portal clause does not reach it`,
    );
    assert.ok(
      Array.isArray(row.citations) && row.citations.length > 0,
      `${row.criterion} carries no citation`,
    );
    assert.deepEqual(
      [
        ...new Set(
          row.citations.map((/** @type {any} */ citation) => citation.suite),
        ),
      ].sort(),
      [
        ...new Set(row.edges.map((/** @type {any} */ edge) => edge.suite)),
      ].sort(),
      `${row.criterion} must cite every suite the plan resolves one of its edges to`,
    );
    assert.ok(
      String(row.artefact ?? '').includes(
        `edge ${JSON.stringify(row.edges.map((/** @type {any} */ edge) => edge.edge))}`,
      ),
      `${row.criterion} must state the edge ids its artefact carries, as edge ["E.."], and it states ${JSON.stringify(String(row.artefact ?? '').slice(0, 160))}`,
    );
  }
  assert.equal(
    record.driver ?? null,
    null,
    'a list with no required row must not name a driver',
  );
  assert.equal(
    record.claims.filter((/** @type {any} */ row) => row.ruling === 'required')
      .length,
    record.ruling.required,
    `the record states ${String(record.ruling.required)} required row(s) and carries ${String(record.claims.filter((/** @type {any} */ row) => row.ruling === 'required').length)}`,
  );
}

// The bytes the read-only pin holds the record to; an armed run re-bases it after its own write.
const claimsAtLoad = existsSync(CLAIMS_PATH)
  ? digest(readFileSync(CLAIMS_PATH))
  : null;
let claimsBaseline = claimsAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureClaims(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  const record = derived();
  const candidate = canonical(record);
  let moved = 'the record had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the record moved: ${JSON.stringify(firstDifference(JSON.parse(text), record, ''))}`;
  }
  if (moved === '') return { wrote: false, before, after: before ?? '', moved };
  // Never write a record that would fail its own citation, field and repair checks.
  assert.doesNotThrow(() => assertCitationsResolve(record));
  assert.doesNotThrow(() => assertClaimedFields(record));
  assert.doesNotThrow(() => assertNamesNoRepair(record));
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the record's tests, so an armed run writes before the read-only pins read the
// file back: the same pins then prove the freshly written record is the one this head derives.
if (ARMED) {
  describe('the claim record, armed', () => {
    it('re-derives, writes only what moved, and a second run changes no byte', () => {
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
        'a second armed run changed the record, so the re-capture is not idempotent',
      );
      claimsBaseline = digest(readFileSync(CLAIMS_PATH));
    });
  });
}

// ------------------------------------------------------------------ measurement ----

describe('measurement', () => {
  it('reads four criteria, eight edge rows and eight held-out rows, and every cited file is here', () => {
    const { intentSource, planSource } = sources();
    const criteria = intentCriteria(intentSource);
    const edges = intentEdges(intentSource);
    const heldOut = planHeldOut(planSource);

    assert.deepEqual(
      Object.keys(criteria),
      ['SC1', 'SC2', 'SC3', 'SC4'],
      'the intent declares four criteria, and every one of them is ruled',
    );
    assert.equal(
      edges.length,
      8,
      `the intent declares eight edge rows, and it declares ${String(edges.length)}`,
    );
    assert.deepEqual(
      edges.map((edge) => edge.edge),
      ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'],
      `the edge rows are E1 to E8, and they are ${JSON.stringify(edges.map((edge) => edge.edge))}`,
    );
    assert.equal(
      heldOut.size,
      8,
      `the plan holds out one row per edge, and it holds out ${String(heldOut.size)}`,
    );
    for (const edge of edges) {
      const suite = heldOut.get(edge.edge)?.test ?? '';
      assert.ok(
        suite !== '',
        `${edge.edge} is held out by no plan row, so ${edge.criterion} would cite no suite for it`,
      );
      assert.ok(
        existsSync(absPath(suite)),
        `${edge.edge} is assigned to ${suite}, which this checkout does not carry`,
      );
    }
    for (const claim of claimsOf(derived())) {
      for (const citation of claim.citations) {
        assert.ok(
          existsSync(absPath(citation.file)),
          `${claim.edge} cites ${citation.file}, which this checkout does not carry`,
        );
      }
    }
    console.log(
      `${MILESTONE}: ${String(Object.keys(criteria).length)} criteria, ${String(edges.length)} edge row(s), ${String(heldOut.size)} held-out row(s), ${String(derived().edgeClaims.reduce((sum, claim) => sum + claim.citations.length, 0))} line citation(s)`,
    );
  });

  it('the join returns the fields the claims name, and a claim may not name another', () => {
    assert.doesNotThrow(() => assertClaimedFields(derived()));
    const fields = joinFields();
    assert.deepEqual(
      fields,
      [
        'state',
        'specifier',
        'routePath',
        'status',
        'hash',
        'consideredCount',
        'reason',
      ],
      `the join returns the interface's seven fields, and it returns ${JSON.stringify(fields)}`,
    );
    console.log(`the join's fields: ${JSON.stringify(fields)}`);
  });

  it('the import-failure record is the only producer of an import specifier, and the join its one reader', () => {
    const sources = specifierSources();
    assert.deepEqual(
      assertOneProducerOneReader(sources),
      [JOIN_REL, RECORD_REL],
      'the census names exactly the record and the join, in the order it walks them',
    );
    assert.ok(
      sources.includes(RECORD_REL),
      `the census must reach ${RECORD_REL}, or it measured nothing`,
    );
    assert.ok(
      sources.length >= 2,
      `the census must find the producer and its reader, and it found ${String(sources.length)}`,
    );
    // The mutant: a third module naming an import specifier is the second source this census refuses,
    // and the refusal names it rather than reporting a count.
    const third = [...sources, 'extension/panel.js'];
    const failure = reddens(
      () => assertOneProducerOneReader(third),
      'a third module naming an import specifier',
    );
    assert.match(
      failure.message,
      /extension\/panel\.js/,
      `the refusal must name the third module; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );
    console.log(
      `specifier census: ${JSON.stringify(assertOneProducerOneReader(sources))} | ${failure.message.split('\n')[0]}`,
    );
  });
});

// ------------------------------------------------------------------- the record ----

describe('the claim record', () => {
  it('is a read: a default run hashes the record the same before and after', () => {
    assert.ok(
      existsSync(CLAIMS_PATH),
      `${CLAIMS_REL} is missing - the record has never been captured`,
    );
    const now = digest(readFileSync(CLAIMS_PATH));
    assert.equal(
      now,
      claimsBaseline,
      `${CLAIMS_REL} changed during this run, so the suite is not read-only`,
    );
    console.log(
      `${CLAIMS_REL} at load and after the run: ${String(readFileSync(CLAIMS_PATH).length)} characters, sha256 ${now}`,
    );
  });

  it('is exactly what this head derives, and a value that moved is named', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.deepEqual(
      recorded,
      derived(),
      `${CLAIMS_REL} is not what this head derives: ${firstDifference(recorded, derived(), '')} - re-capture with ${CAPTURE_COMMAND}`,
    );
    assert.equal(
      readFileSync(CLAIMS_PATH, 'utf8'),
      canonical(recorded),
      `${CLAIMS_REL} must be serialized as the capture writes it, so a re-capture would move no byte`,
    );
  });

  it('carries one claim per edge row, each with a citation, a suite and a test this head declares', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertOneClaimPerEdge(recorded));
    const claims = claimsOf(recorded);
    assert.equal(
      claims.length,
      8,
      `the record carries ${String(claims.length)} edge claim(s) for eight edge rows`,
    );
    assert.ok(
      claims.some((claim) => claim.edge === 'E3' && claim.criterion === 'SC2'),
      'the never-completed claim of SC2 is present, by edge and by criterion',
    );
    assert.ok(
      claims.filter((claim) => claim.absence !== null).length >= 1,
      'the record states at least one absence, or every part of every edge was citable and a reader cannot tell which was not',
    );
    console.log(
      `${CLAIMS_REL}: edge claims ${JSON.stringify(claims.map((claim) => claim.edge))}; citations ${JSON.stringify(claims.map((claim) => claim.citations.length))}; absences ${JSON.stringify(claims.filter((claim) => claim.absence !== null).map((claim) => claim.edge))}`,
    );
  });

  it('resolves every citation to the file and the line it names, and every citation names one line', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    for (const claim of claimsOf(recorded)) {
      for (const citation of claim.citations) {
        assert.equal(
          typeof citation.lineText,
          'string',
          `${claim.edge} cites ${citation.file}:${String(citation.line)} and states no line text`,
        );
        assert.ok(
          citation.lineText.trim() !== '',
          `${claim.edge} cites ${citation.file}:${String(citation.line)}, which is blank, so the citation names a place with nothing to read`,
        );
      }
    }
    const lines = claimsOf(recorded).reduce(
      (sum, claim) => sum + claim.citations.length,
      0,
    );
    assert.ok(
      lines >= 24,
      `the record must rest on a body of lines rather than a handful, and it cites ${String(lines)}`,
    );
    console.log(
      `${CLAIMS_REL}: ${String(lines)} citation(s) re-resolved line by line`,
    );
  });

  it('quotes each criterion, cites the suites the plan assigns, and names no repair', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.equal(
      recorded.milestone,
      MILESTONE,
      'the record names the milestone its file is numbered for',
    );
    assert.equal(
      recorded.milestone,
      boundMilestone(),
      'the record names the milestone the state file binds',
    );
    assert.doesNotThrow(() => assertCriterionRows(recorded));
    assert.doesNotThrow(() => assertNamesNoRepair(recorded));
    assert.equal(
      recorded.capture?.command,
      CAPTURE_COMMAND,
      'the record names the command that captured it, armed by its own flag',
    );
    assert.equal(
      recorded.capture?.records,
      CLAIMS_REL,
      'the record names the file it is',
    );
    assert.deepEqual(
      recorded.evidence?.plan?.disagreements,
      coverageDisagreements(
        intentEdges(sources().intentSource),
        planHeldOut(sources().planSource),
        planCoverage(sources().planSource),
      ),
      "the record states the plan's cross-table disagreements as this head measures them",
    );
    assert.deepEqual(
      recorded.evidence?.specifierSources,
      specifierSources(),
      'the record states the specifier sources this head measures',
    );
    console.log(
      `${CLAIMS_REL}: ${String(recorded.claims.length)} criterion row(s), ${String(recorded.edgeClaims.length)} edge claim(s), ${String(recorded.edgeClaims.filter((claim) => claim.absence !== null).length)} absence(s), plan disagreements ${JSON.stringify(recorded.evidence.plan.disagreements)}`,
    );
  });

  it('records each absence with its reason rather than softening it into prose', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    for (const claim of claimsOf(recorded)) {
      if (claim.absence === null) continue;
      assert.equal(
        typeof claim.absence.part,
        'string',
        `${claim.edge} states an absence and does not name the part of the edge it could not cite`,
      );
      assert.ok(
        claim.absence.reason.trim().length >= 60,
        `${claim.edge} states an absence and does not say why`,
      );
      assert.ok(
        !Object.hasOwn(claim.absence.reason, 'citations'),
        `${claim.edge} states an absence and carries a citation for it`,
      );
      assert.ok(
        claim.citations.every(
          (citation) =>
            !citation.holds
              .toLowerCase()
              .includes(claim.absence.part.toLowerCase().slice(0, 20)),
        ),
        `${claim.edge} states an absence for a part it also claims to cite, so the absence is not stated`,
      );
    }
    const absences = claimsOf(recorded).filter(
      (claim) => claim.absence !== null,
    );
    assert.deepEqual(
      absences.map((claim) => claim.edge),
      ['E4', 'E6'],
      `this head measures two absences, at ${JSON.stringify(absences.map((claim) => claim.edge))}`,
    );
    console.log(
      `absences: ${absences.map((claim) => `${claim.edge} (${claim.absence.part})`).join('; ')}`,
    );
  });
});

// -------------------------------------------------------------------- mutants ----

describe('the mutants', () => {
  it('a deleted citation reddens naming the claim, and the never-completed claim is the one planted on', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertOneClaimPerEdge(recorded));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));

    const planted = clone(recorded);
    const neverCompleted = planted.edgeClaims.find(
      (/** @type {any} */ claim) => claim.edge === 'E3',
    );
    assert.ok(
      neverCompleted,
      'the record must carry the never-completed claim at E3, or the deletion is planted on another claim',
    );
    assert.ok(
      neverCompleted.citations.length > 0,
      'the never-completed claim must carry a citation before one can be deleted',
    );
    neverCompleted.citations = [];

    const failure = reddens(
      () => assertCitationsResolve(planted),
      'a claim with its citations deleted',
    );
    assert.match(
      failure.message,
      /the claim for E3 carries no citation/,
      `a deleted citation must redden naming the claim; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );
    assert.match(
      failure.message,
      /held by no line of this checkout/,
      `the refusal must say what is missing rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );

    // The same record with its citation back: the check that bit above passes here, so the mutant
    // reddens the citation and not the claim.
    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(`deleted-citation mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a citation whose line text no longer matches its line reddens naming the claim and the citation', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));

    const planted = clone(recorded);
    const claim = planted.edgeClaims[0];
    const citation = claim.citations[0];
    const moved = `${citation.lineText} (reworded here)`;
    citation.lineText = moved;
    assert.notEqual(
      citation.lineText,
      recorded.edgeClaims[0].citations[0].lineText,
      'the planted line text must differ from the one the file carries, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertCitationsResolve(planted),
      'a citation whose line text no longer matches its line',
    );
    assert.ok(
      failure.message.includes(claim.edge),
      `the refusal must name the claim; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(`${citation.file}:${String(citation.line)}`),
      `the refusal must name the citation by file and line; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /that line reads/,
      `the refusal must say what the line reads rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    // The other direction: the line number moved but the text stayed, which is the same defect one
    // field over.
    const renumbered = clone(recorded);
    renumbered.edgeClaims[1].citations[0].line += 1;
    const lineFailure = reddens(
      () => assertCitationsResolve(renumbered),
      'a citation whose line number names another line',
    );
    assert.match(
      lineFailure.message,
      /that line reads/,
      `a moved line number must redden by the text it now reads; it produced ${JSON.stringify(lineFailure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(
      `line-text mutant: ${failure.message.split('\n')[0]} | moved line: ${lineFailure.message.split('\n')[0]}`,
    );
  });

  it('a claim naming a field the join does not return reddens naming the claim and the field', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertClaimedFields(recorded));

    const planted = clone(recorded);
    const invented = 'cause';
    assert.ok(
      !joinFields().includes(invented),
      `the field ${JSON.stringify(invented)} must not be one the join returns, or the mutant is a no-op`,
    );
    planted.edgeClaims[0].fields.push(invented);

    const failure = reddens(
      () => assertClaimedFields(planted),
      'a claim naming a field the join does not return',
    );
    assert.ok(
      failure.message.includes(planted.edgeClaims[0].edge),
      `the refusal must name the claim; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(invented),
      `the refusal must name the field; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /a claim may name only a field an answer carries/,
      `the refusal must state the rule; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertClaimedFields(recorded));
    console.log(`invented-field mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a claim that asserts a remedy reddens naming the claim and the word', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertNamesNoRepair(recorded));

    const planted = clone(recorded);
    const claim = planted.edgeClaims.find(
      (/** @type {any} */ one) => one.edge === 'E8',
    );
    assert.ok(
      claim,
      'the record must carry the E8 claim, or the remedy is planted nowhere',
    );
    const remedy =
      ' The fix is to redeploy the chunk and clear the service worker cache.';
    claim.claim = `${claim.claim}${remedy}`;
    assert.notEqual(
      claim.claim,
      recorded.edgeClaims.find((/** @type {any} */ one) => one.edge === 'E8')
        .claim,
      'the planted claim must differ from the recorded one, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertNamesNoRepair(planted),
      'a claim that asserts a remedy',
    );
    assert.ok(
      failure.message.includes('E8'),
      `the refusal must name the claim; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /states "fix"/,
      `the refusal must name the word the claim offered; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertNamesNoRepair(recorded));
    console.log(`remedy-claim mutant: ${failure.message.split('\n')[0]}`);
  });

  it('the four mutants are four different defects, and each is proved against the same record', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    const pins = [
      () => assertCitationsResolve(recorded),
      () => assertOneClaimPerEdge(recorded),
      () => assertClaimedFields(recorded),
      () => assertNamesNoRepair(recorded),
      () => assertCriterionRows(recorded),
    ];
    for (const pin of pins) assert.doesNotThrow(pin);
    assert.equal(
      pins.length,
      5,
      'the record is held by five pins, and each mutant above reddens one of them',
    );
  });
});
