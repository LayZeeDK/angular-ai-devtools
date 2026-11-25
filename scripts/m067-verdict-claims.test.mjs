// M067 T008 — the claims census: one claim per success criterion, citing the suite and the test that
// prove it at this head.
//
// The gate reads a claim list for every milestone (`scripts/guard-verdict-claims.test.mjs`,
// `scripts/outlet-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`), and M067 was planned
// without one: every one of those suites reported `research/raw/m067-verdict-claims.json is missing - the
// list has never been captured` and their other assertions reported a delta of zero, because the record
// they subtract never existed. This suite is the census that writes it.
//
// Five rules, and none of them reads a fact the tree does not carry:
//
//   1. Each criterion, quoted. Every numbered criterion `.project/intent/INTENT.md` declares is ruled
//      exactly once, and its `criterionText` is the intent's own text, parsed with the routine
//      `scripts/overlay-verdict-claims.test.mjs` uses, so the quote is compared character for character
//      by the suites that read it as well as by this one. `criterionCharacters` states the length quoted.
//   2. Each claim's edges, read from the intent. The five columns the owner's ruling makes authoritative
//      (`Edge | Criterion | Category | Disposition | Detail`) give each criterion the edges it is held by,
//      with the detail cell verbatim.
//   3. Each criterion's suite, read from the plan and the task it assigns. This milestone's plan holds
//      nothing out — its `## Held-out checks` states that every edge is proved by the suite of the task
//      that owns it — so the suite is resolved the way `scripts/navigation-blocking.test.mjs` resolves it:
//      the plan's `## Intent coverage` rows for the criterion, in order, and the first suite the owning
//      task's own `files:` list declares that the task's base commit does not carry. The resolution is
//      derived here and the table below must name what it derives, so a plan or a task whose files list
//      moves reddens naming both rather than citing the suite a task happened to add.
//   4. Each citation, read from this checkout. A claim names a suite and a test title, and that suite must
//      declare that title on the line that declares it at this head; a citation whose test does not exist
//      reddens naming the test and the suite that should carry it.
//   5. Each claim's artefact. A row names the artefact path it cites (the suite its first citation names),
//      says what that artefact carries, and states the edge ids it is ruled on as `edge ["E1","E2"]`, the
//      shape the censuses before this one read.
//
// Which documents these claims are held to. `intentPathForMilestone` resolves the bound milestone to its
// own intent — the live one while a milestone is bound, its archive after the ship moves it — and the
// plan beside it, so the criteria, the edge table and the plan's mapping are always this milestone's.
// The record was captured while those documents sat at `.project/intent/INTENT.md` and
// `.project/plan/PLAN.md`, so it spells their paths that way; the ship moves both, and the two spellings
// name one document, so the record is compared in its own words at the locations it states
// (`atRecordedDocumentLocations`) and a stated location that does not name the file this head resolved is
// refused. Every other field is still compared byte for byte against the derivation.
//
// `M067_CAPTURE=1` arms the one write. It re-derives, compares, and writes only when a value moved, so two
// armed runs leave the file byte-identical; a default run reads the file, asserts it is exactly what this
// head derives, and asserts its own bytes did not move. The armed writer derives through the recorded
// document and refuses to write a candidate that is not the fixed point of its own pin, so a re-capture
// can never write bytes the default run would refuse:
//
//   M067_CAPTURE=1 node --test scripts/m067-verdict-claims.test.mjs
//
// The arm is also accepted under its long spelling, `M067_CLAIMS_CAPTURE=1`, which is what the task brief
// names; the record states the `M067_CAPTURE` arm because that is the flag the censuses that read it
// derive (`/M\d{3}_CAPTURE/`) and the flag `.project/intent/INTENT.md` names.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/m067-verdict-claims.test.mjs';
const RAW = 'research/raw';

/** The milestone this record is numbered for, read from the bound branch. */
const MILESTONE = boundMilestone();
const CLAIMS_REL = `${RAW}/${MILESTONE.toLowerCase()}-verdict-claims.json`;
const CLAIMS_PATH = join(ROOT, ...CLAIMS_REL.split('/'));

/**
 * The record this file writes, named as a literal as well as derived. The literal is what the readers
 * that subtract a record its own census hold open — `scripts/guard-verdict-claims.test.mjs`,
 * `scripts/outlet-verdict-claims.test.mjs` and `scripts/navigation-blocking.test.mjs` read the owner from
 * the record's own `capture.command` and then require that owner to name the record's path — and the
 * assertion below keeps the two spellings one.
 */
const CLAIMS_NAMED = 'research/raw/m067-verdict-claims.json';

/**
 * The milestone this census owns: the file it writes, not whichever milestone happens to be bound. One
 * milestone later this suite is the predecessor rather than the census — the bound branch resolves a
 * later milestone's record, which another suite derives with its own proof table — so a record this file
 * does not own is held to the ownership chain and the derivation stands down. That is the same rule
 * `scripts/outlet-verdict-claims.test.mjs` and `scripts/navigation-blocking.test.mjs` already apply to a
 * record another census writes.
 */
const OWN_MILESTONE = 'M067';
const OWNS_THE_BOUND_RECORD = MILESTONE === OWN_MILESTONE;

/**
 * The suite the bound milestone's record names as the census that captured it, read from the record's
 * own `capture.command`.
 * @param {any} recording the claim list, or null when it has never been captured
 * @returns {string} the repository path of the suite that captures it
 */
function owningCensus(recording) {
  const command = String(recording?.capture?.command ?? '');
  const named = /scripts\/[a-z0-9-]+\.test\.mjs/.exec(command)?.[0];
  return named ?? SUITE_REL;
}

/**
 * Whether the suite a record names as its census names that record. Two spellings count: the path
 * written literally, and the `research/raw/<milestone>-verdict-claims.json` template keyed on the
 * milestone the state file binds.
 * @param {string} source the owning census's text
 * @param {string} record the repository path of the record it owns
 * @returns {boolean}
 */
function namesThisRecord(source, record) {
  if (source.includes(record)) return true;
  return (
    source.includes('-verdict-claims.json') &&
    /`research\/raw\/\$\{/.test(source) &&
    /boundMilestone\s*\(/.test(source)
  );
}

/** The record this milestone measures, and the join and surface this milestone ships. */
const MEASURED_REL = 'research/raw/m067-field-binder.json';
const JOIN_REL = 'extension/field-binder.js';
const PANEL_REL = 'apps/angular-ai-devtools/src/app/panel-field-binder.ts';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CAPTURE_ENV = 'M067_CAPTURE';
/** The same arm under the long spelling the task brief names; the record states `M067_CAPTURE`. */
const CAPTURE_ALIAS = 'M067_CLAIMS_CAPTURE';
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${CAPTURE_ENV}=1 ${CHECK_COMMAND}`;
const ARMED = [CAPTURE_ENV, CAPTURE_ALIAS].some(
  (name) => String(process.env[name] ?? '').trim() === '1',
);

/** The five column names the owner's ruling makes authoritative, in the order it names them. */
const EDGE_COLUMNS = ['Edge', 'Criterion', 'Category', 'Disposition', 'Detail'];

/**
 * What proves each criterion, in the order a reader should read it: the first citation is the one the
 * row's `suite` and `test` fields name and the one the row's artefact is, and every further citation holds
 * a part of the same criterion. `holds` states the part. The last citation of each row is the suite this
 * milestone's own plan resolves the criterion to (`planSuite`), stated rather than left to a reader's
 * fallback — the plan implements the resolution rather than choosing it, and a plan or task whose files
 * list moves makes this table stale, which the derivation reports naming both suites.
 */
const PROOFS = Object.freeze({
  SC1: Object.freeze([
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'AC1: a field hosting another control is mismatch, and the answer names both controls',
      holds:
        'a field that hosts a control other than the one its record expects answers `mismatch` naming both the hosted control and the expected one, in one answer and one place',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'a field hosting the control its record expects is bound',
      holds:
        'a field that hosts the expected control answers `bound` and produces no finding, rather than a finding with an empty comparison in it',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'AC1 mutant: a mismatch reporting only the hosted control reddens the pin, naming hosted without expected',
      holds:
        'the mutant that reports only the hosted control reddens the pin by name, so the comparison is measured rather than stated',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'reads the same answer from the document, from its fields list and from one row',
      holds:
        'the suite the plan’s own `## Intent coverage` row assigns SC1 to through T005, cited as the plan resolves it: the loop reads the committed record’s own document, its fields list and one row as one answer, so the mismatch this criterion names is the record’s own rather than one this suite invented',
    },
  ]),
  SC2: Object.freeze([
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'AC2: a field that is not a components field is no-host, with that reason and no inferred control',
      holds:
        'a plain input, and an element with no hosting field, answer `no-host` with that reason and name no control, so no host is inferred from a label or a class',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'a row carrying no hosted fact at all is cannot-tell naming that fact, not no-host',
      holds:
        'a field whose host was never read answers `cannot-tell` naming the absent reading, and never a control inferred from the field’s own label',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'AC2 mutant: a join that infers a host from a label reddens the pin, naming the inference',
      holds:
        'the mutant that infers a host from a label reddens the pin by name, so the absence is measured rather than asserted',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'AC2: answers no-host for the field that hosts nothing, with that reason and no control',
      holds:
        'the suite the plan’s own `## Intent coverage` row assigns SC2 to through T005, cited as the plan resolves it: over the committed record it answers no-host for the one field that hosts nothing, with that reason and no control named in its place',
    },
  ]),
  SC3: Object.freeze([
    {
      suite: 'scripts/field-binder-record.test.mjs',
      test: 'AC3: the identity this record carries is the one extension/field-state.js produces',
      holds:
        'the field identity the record carries is the one `extension/field-state.js` produces, asserted against that producer rather than derived a second time here',
    },
    {
      suite: 'scripts/field-binder-record.test.mjs',
      test: 'a second identity reddens the identity pin, naming the field and what the producer produces',
      holds:
        'a field identity the producer does not produce reddens the pin by name, so a second identity cannot be introduced quietly',
    },
    {
      suite: 'scripts/field-binder.test.mjs',
      test: 'writes no recording: the committed record is read into memory and never re-captured',
      holds:
        'the join reads the one record this milestone writes and re-captures nothing, so the hosted control has one source rather than a second reader',
    },
    {
      suite: 'scripts/field-binder-record.test.mjs',
      test: 'AC1: names each field’s identity, hosted element and expected control, or which of the three was not read and why',
      holds:
        'the suite the plan’s own `## Intent coverage` row assigns SC3 to through T004, cited as the plan resolves it: for every field read it names the identity, the hosted element and the expected control, or states which of the three was not read and why',
    },
  ]),
  SC4: Object.freeze([
    {
      suite: 'apps/angular-ai-devtools/src/app/panel-demo.spec.ts',
      test: 'is the join’s own answer over T004’s record, reached by the route and loader key the table carries',
      holds:
        'the pane renders exactly the object the join returns over the committed record, reached through its own route and its own loader key rather than a copy of the answer',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E4: every declared route surface has a panel-demo LOADERS key',
      holds:
        'every declared route surface has a loader key, so the surface this milestone adds is reached by its own name and a dropped key reddens naming it',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name',
      holds:
        'the route table is one list mapped over one literal and the surface keeps its own path, which is the pin this milestone moved in the same task',
    },
    {
      suite: 'apps/angular-ai-devtools/src/app/panel-demo.spec.ts',
      test: 'enumerates the five keys it renders and the join’s four states, and reddens naming the surface and the remedy a pane invents',
      holds:
        'the pane enumerates the join’s own keys and states and renders no sixth line, so no remedy, no cause and no control it was not given can appear',
    },
    {
      suite: 'apps/angular-ai-devtools/src/app/app.spec.ts',
      test: 'appends the panel surfaces last and installs each through the demo component',
      holds:
        'the suite the plan’s own `## Intent coverage` row assigns SC4 to, cited as the plan resolves it: it holds the route table’s own enumeration of the surface at this head',
    },
  ]),
});

/** The suite the plan resolves for each criterion, named here and held to the derivation below. */
const PLAN_SUITES = Object.freeze({
  SC1: 'scripts/field-binder.test.mjs',
  SC2: 'scripts/field-binder.test.mjs',
  SC3: 'scripts/field-binder-record.test.mjs',
  SC4: 'apps/angular-ai-devtools/src/app/app.spec.ts',
});

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

/**
 * The numbered success criteria of an intent, parsed with the routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so a row quotes the criterion that suite compares it to
 * and not this file's paraphrase of it.
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
 * The plan's `## Held-out checks` mapping, as the plan writes it: rows of `Edge | Task | Test`, and the
 * bullet form. A plan may hold nothing out — this milestone's does, and states so — in which case the
 * suite a criterion is held by is resolved through `## Intent coverage` and the owning task.
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
 * criterion. A plan whose two tables agree carries none, and the record states the list so a reader sees
 * where the plan and the intent part company.
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
 * The declarations a suite carries, counted the way the whole-tree count counts them, and the titles it
 * declares — the string `it(` or `test(` is handed. A title is read from the one line that declares it;
 * every suite this file cites writes its titles on one line.
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
 * The suites one task file's `files:` list declares, in the order it declares them.
 * @param {string} text @returns {string[]}
 */
function declaredSuites(text) {
  const front = /^---\r?\n([\s\S]*?)\r?\n---/.exec(stripBom(text))?.[1] ?? '';
  const block =
    /^files:[ \t]*\r?\n((?:[ \t]*-[ \t]*\S.*\r?\n?)*)/m.exec(front)?.[1] ?? '';
  /** @type {string[]} */
  const suites = [];
  for (const match of block.matchAll(/^[ \t]*-[ \t]*(\S+)[ \t]*$/gm)) {
    const named = (match[1] ?? '').replace(/^['"]|['"]$/g, '');
    if (/\.(test|spec)\.(mjs|cjs|js|mts|ts)$/.test(named)) suites.push(named);
  }
  return suites;
}

/**
 * The task file one plan row names, in the directory the plan sits beside.
 * @param {string} tasksDir @param {string} task @returns {string | null}
 */
function taskFileAt(tasksDir, task) {
  if (!existsSync(tasksDir)) return null;
  const name = readdirSync(tasksDir)
    .filter(
      (entry) =>
        entry.endsWith('.md') &&
        (entry === `${task}.md` || entry.startsWith(`${task}-`)),
    )
    .sort()[0];
  return name === undefined ? null : join(tasksDir, name);
}

/**
 * The suite one task added: the first suite its `files:` list declares that its own `base` commit does not
 * carry, and its first declared suite where its base carries every one, which is a fallback stated rather
 * than hidden.
 * @param {string} text @returns {string | null}
 */
function suiteAddedByTask(text) {
  const suites = declaredSuites(text);
  if (suites.length === 0) return null;
  const base =
    /^base:\s*([0-9a-f]{7,64})\s*$/im.exec(stripBom(text))?.[1] ?? '';
  if (base !== '') {
    for (const suite of suites) {
      const read = spawnSync('git', ['cat-file', '-e', `${base}:${suite}`], {
        cwd: ROOT,
        encoding: 'utf8',
      });
      if (read.error || read.status !== 0) return suite;
    }
  }
  return suites[0] ?? null;
}

/**
 * The suite the plan resolves one criterion to: the plan's `## Intent coverage` rows for it, in order,
 * and the suite the task that row names added. This milestone holds no edge out, so this is the only
 * mapping the plan states, and it is read rather than chosen. Resolved once per run, because the answer
 * is a reading of two committed documents and no step of this suite edits them.
 * @type {Map<string, { task: string, suite: string }>}
 */
const PLAN_RESOLVED = new Map();

/**
 * @param {string} criterion
 * @param {string} planSource
 * @param {string} tasksDir
 * @returns {{ task: string, suite: string }}
 */
function planSuiteFor(criterion, planSource, tasksDir) {
  const cached = PLAN_RESOLVED.get(criterion);
  if (cached !== undefined) return cached;
  for (const row of planCoverage(planSource).filter(
    (one) => one.criterion === criterion,
  )) {
    const taskFile = taskFileAt(tasksDir, row.task);
    if (taskFile === null) continue;
    const suite = suiteAddedByTask(
      readText(
        shown(taskFile),
        `${row.task} is the task the plan assigns ${criterion}`,
      ),
    );
    if (suite !== null) {
      const resolved = { task: row.task, suite };
      PLAN_RESOLVED.set(criterion, resolved);
      return resolved;
    }
  }
  assert.fail(
    `the plan assigns ${criterion} to no task whose files list declares a suite, so the criterion would cite no test at all`,
  );
  return { task: '', suite: '' };
}

/**
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather than
 * reported as a mismatch somewhere in a record of several hundred lines.
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
 * The failure a pin raises on a value, so a mutant's evidence is the assertion's own message rather than
 * the wrapper a `doesNotThrow` puts around it. A pin that survives its mutant is a vacuous pin, and that is
 * a failure here rather than a silent pass.
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

/** The intent and plan of this milestone, read once per run. */
let SOURCES = null;

function sources() {
  if (SOURCES === null) {
    const intentPath = intentPathForMilestone(ROOT, MILESTONE);
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    const tasksDir = join(dirname(intentPath), '..', 'tasks');
    SOURCES = {
      intentPath,
      planPath,
      tasksDir,
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
 * The location a document was spelled at when the record was captured, derived from where this head reads
 * it, never from the record. A milestone that has shipped reads its intent and plan under
 * `.project/archive/<NNN>-<slug>/`; the record was captured while they sat at `.project/intent/INTENT.md`
 * and `.project/plan/PLAN.md`, so the capture-time spelling follows from the resolved path and owes
 * nothing to the record it judges.
 * @param {string} resolved @returns {string}
 */
function recordedSpelling(resolved) {
  const archived =
    /^\.project\/archive\/\d{3}-[^/]+\/((?:intent|plan)\/(?:INTENT|PLAN)\.md)$/.exec(
      resolved,
    );
  return archived ? `.project/${archived[1]}` : resolved;
}

/**
 * The derivation, with its two document locations spelled where they sat when the record was captured and
 * every other field the derivation's own, byte for byte.
 * @param {any} derivedRecord @returns {any}
 */
function atRecordedDocumentLocations(derivedRecord) {
  const resolvedIntent = shown(sources().intentPath);
  const resolvedPlan = shown(sources().planPath);
  const capturedIntent = recordedSpelling(resolvedIntent);
  const capturedPlan = recordedSpelling(resolvedPlan);
  const rebased = clone(derivedRecord);
  rebased.evidence.intent.path = capturedIntent;
  rebased.evidence.plan.path = capturedPlan;
  rebased.quotes.edges = rebased.quotes.edges
    .split(resolvedIntent)
    .join(capturedIntent)
    .split(resolvedPlan)
    .join(capturedPlan);
  return rebased;
}

// ----------------------------------------------------------------- derivation ----

/**
 * The record, derived. Every value below is interpolated from a file this checkout carries or from the
 * tables above, so a citation that moves makes the record stale rather than quietly wrong.
 * @param {string} intentSource @param {string} planSource
 * @param {string} intentPath @param {string} planPath
 * @returns {Record<string, any>}
 */
function derive(intentSource, planSource, intentPath, planPath) {
  assert.equal(
    CLAIMS_REL,
    CLAIMS_NAMED,
    `this census writes ${CLAIMS_NAMED} and the bound branch derives ${CLAIMS_REL}: the two spellings of one record must be one, or the suite would write a record it does not name`,
  );
  const criteria = intentCriteria(intentSource);
  const edges = intentEdges(intentSource);
  const heldOut = planHeldOut(planSource);
  const coverage = planCoverage(planSource);
  const disagreements = coverageDisagreements(edges, heldOut, coverage);
  const tasksDir = join(dirname(planPath), '..', 'tasks');

  // This plan holds nothing out and states so: every edge is proved by the suite of the task that owns
  // it. A row added to `## Held-out checks` is a mapping this census must read instead, so it is refused
  // by name rather than quietly resolved through the coverage table a second time.
  assert.equal(
    heldOut.size,
    0,
    `this plan's ## Held-out checks writes no row, and it writes ${JSON.stringify([...heldOut.keys()])}: a held-out row is a mapping this census must read rather than fall back to ## Intent coverage`,
  );

  // One claim per criterion the intent declares, in the intent's order, and no other.
  assert.deepEqual(
    Object.keys(PROOFS),
    Object.keys(criteria),
    `the claims must be one per criterion the intent declares: the proofs name ${JSON.stringify(Object.keys(PROOFS))} and the intent declares ${JSON.stringify(Object.keys(criteria))}`,
  );

  // The suites the plan resolves, derived once and held to the table above: a plan or a task whose files
  // list moves makes the table stale, and the refusal names both suites.
  /** @type {Record<string, string>} */
  const planSuites = {};
  for (const criterion of Object.keys(criteria)) {
    const resolved = planSuiteFor(criterion, planSource, tasksDir);
    assert.ok(
      existsSync(absPath(resolved.suite)),
      `the plan resolves ${criterion} to ${resolved.suite} through ${resolved.task}, and this checkout does not carry it`,
    );
    assert.equal(
      resolved.suite,
      PLAN_SUITES[criterion],
      `the plan resolves ${criterion} to ${resolved.suite} through ${resolved.task}, and this table names ${JSON.stringify(PLAN_SUITES[criterion])}: the suite a claim cites as the plan's own assignment must be the one the plan resolves at this head`,
    );
    planSuites[criterion] = resolved.suite;
  }

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
      `the intent's edge coverage names no edge for ${criterion}, so its claim cites no test`,
    );
    const proofs = PROOFS[criterion];
    assert.ok(
      Array.isArray(proofs) && proofs.length > 0,
      `${criterion} carries no proof, so its claim cites nothing`,
    );
    // Every citation resolves at capture: the suite is a file this checkout carries, and it declares the
    // test title the citation names on the line that declares it.
    for (const proof of proofs) {
      const suiteText = readText(
        proof.suite,
        `${criterion} cites it as a suite that proves the criterion`,
      );
      const { titles } = declarationsIn(suiteText);
      assert.ok(
        titles.includes(proof.test),
        `${criterion} cites ${proof.suite} for ${JSON.stringify(proof.test)}, and that suite declares no such test at this head: it declares ${JSON.stringify(titles)}`,
      );
    }
    const primary = proofs[0];
    const suites = [...new Set(proofs.map((proof) => proof.suite))];
    assert.ok(
      suites.includes(planSuites[criterion]),
      `${criterion}'s citations must include ${planSuites[criterion]}, the suite the plan resolves the criterion to, and they name ${JSON.stringify(suites)}`,
    );
    const rows = held.map((edge) => ({
      edge: edge.edge,
      category: edge.category,
      disposition: edge.disposition,
      detail: edge.detail,
      suite: planSuites[criterion],
    }));
    const named = JSON.stringify(rows.map((row) => row.edge));
    const varied = rows
      .map(
        (row) =>
          `${row.edge} ${row.category} ${row.disposition}: ${row.detail}`,
      )
      .join('; ');
    const { tests, groups } = declarationsIn(
      readText(
        primary.suite,
        `${criterion} names it as the suite that proves it`,
      ),
    );
    const freed = disagreements.filter((one) => one.criterion === criterion);
    return {
      criterion,
      criterionText,
      criterionCharacters: criterionText.length,
      ruling: 'not-required',
      reason: `The charter's portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts. ${criterion} is ${JSON.stringify(criterionText)} - a fact about this repository's own field record, the join that reads it and the tests that hold them, which no route of any page produces: it is proved by the suite and test this claim names, at this head, and the gate's one \`control-ai-browsers run\` driver returns an element's toolElements, drawnRect, descriptor and noDevContext readings, none of which can say what a test reddens, so a portal-backed row would name a driver that cannot carry the answer. The portal is named because the clause is answered rather than dodged: the evidence is the edge row(s) ${named} the intent itself assigns the criterion, held by the plan at ${JSON.stringify([planSuites[criterion]])}, and the ${String(proofs.length)} citation(s) below name the tests that carry them.${freed.length === 0 ? '' : ` The plan's two tables disagree about ${freed.map((one) => `${one.edge}, held out at ${one.heldBy} while the coverage table assigns ${one.criterion} to ${one.assignedByCoverage.join('/') || 'no task'}`).join('; ')}, which this record states under evidence.plan.disagreements rather than refusing to cite it.`}`,
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
      reading: `${String(proofs.length)} citation(s) over ${String(suites.length)} suite(s) hold ${criterion} through the edge row(s) ${named} the intent assigns it: every one is a test this checkout declares at this head, read from the file that declares it, and the last is the suite this milestone's own plan resolves the criterion to, so the criterion is proved by a test this repository runs rather than by a drive no driver here performs`,
      proves: [
        CHECK_COMMAND,
        ...[...new Set(proofs.map((proof) => proof.suite))].map(commandFor),
        'npm run check',
      ].filter((command) => typeof command === 'string'),
    };
  });

  return {
    schema: `${MILESTONE.toLowerCase()}-verdict-claims/v1`,
    milestone: MILESTONE,
    quotes: {
      from: `scripts/verdict-claims-intent.mjs (intentPathForMilestone(ROOT, ${JSON.stringify(MILESTONE)}))`,
      how: `parsed with the same routine scripts/overlay-verdict-claims.test.mjs uses, extracted into this file and run over the resolved intent, so every criterionText is the intent's own text: the ${String(Object.keys(criteria).length)} criteria it declares are ${JSON.stringify(Object.keys(criteria))} and scripts/overlay-verdict-claims.test.mjs compares them character for character`,
      proofs: `every claim's suite and test are read from this checkout at capture: ${String(claims.reduce((sum, claim) => sum + claim.citations.length, 0))} citation(s) over ${JSON.stringify([...new Set(claims.flatMap((claim) => claim.citations.map((citation) => citation.suite)))])}, each checked to declare the test title it names on the line that declares it, and each claim names every suite the plan resolves one of its criterion's edges to`,
      edges: `read from ${shown(intentPath)}'s own five-column edge-coverage table (Edge | Criterion | Category | Disposition | Detail) for the edge-to-criterion rows, and the test-to-criterion mapping from ${shown(planPath)}'s ## Intent coverage table and the tasks it names, because this plan's ## Held-out checks section holds nothing out: it reads ${String(heldOut.size)} row(s) of edge -> task -> test there and resolves each criterion through the plan's coverage rows and the first suite the owning task's files list declares that the task's base does not carry - ${JSON.stringify(Object.entries(planSuites).map(([criterion, suite]) => `${criterion} -> ${suite}`))} - so a claim cites the suite the milestone's own plan assigns its criterion rather than one this file chose: ${String(edges.length)} edge row(s) over the criteria ${JSON.stringify([...new Set(edges.map((edge) => edge.criterion))])} and the suites ${JSON.stringify([...new Set(claims.flatMap((claim) => claim.citations.map((citation) => citation.suite)))])}. The plan's ## Held-out checks and its ## Intent coverage table disagree at ${String(disagreements.length)} row(s) ${JSON.stringify(disagreements.map((one) => `${one.edge} is held by ${one.heldBy} and ${one.criterion} is assigned to ${one.assignedByCoverage.join('/') || 'no task'}`))}, recorded under evidence.plan.disagreements rather than refused, because a reader needs the citation and the disagreement in one place`,
    },
    ruling: {
      required: 0,
      notRequired: claims.length,
      why: [
        'No row is required, and the record therefore names no driver, no instance and no verdict path: scripts/overlay-verdict-claims.test.mjs refuses a list with no required row that names a driver, so naming one would be the opposite defect.',
        `The reason is not convenience. A required row must name the driver a control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four readings - toolElements, drawnRect, descriptor and noDevContext. Every fact the ${String(claims.length)} criteria this milestone declares is written about is a fact about this repository's own field record, the join that reads it and the tests that hold them, against ${String(stages.length)} stage(s) of the check chain; none of them is an element's rect or a dev context, so naming a driver would make the gate return a page reading for a claim about the gate.`,
        'The portal is not lost by that ruling: each reason names the clause that would have made a row required, and each claim names the suite, the test and the commands that prove it.',
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
        resolved: Object.entries(planSuites).map(
          ([criterion, suite]) => `${criterion} ${suite}`,
        ),
        disagreements,
      },
      edges: {
        rows: edges.length,
        criteria: [...new Set(edges.map((edge) => edge.criterion))],
        columns: EDGE_COLUMNS,
      },
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
            readText(suite, 'the suite a claim names as a test proving it'),
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
        'an armed run re-derives the list from the intent this checkout binds, its five-column edge coverage, the suites the plan resolves each criterion to and the tests this checkout declares, and writes it only when a value moved; a default run reads the file and asserts it is exactly what this head derives, naming the field that moved when it is not, and the writer refuses a candidate that is not the fixed point of this pin.',
    },
    claims,
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

/** The command that proves one cited suite. @param {string} suite @returns {string | null} */
function commandFor(suite) {
  if (/\.test\.mjs$/.test(suite)) return `node --test ${suite}`;
  if (/\.spec\.ts$/.test(suite)) return 'npx nx run angular-ai-devtools:test';
  return null;
}

// ---------------------------------------------------------------------- pins ----

/** @param {any} record @returns {any[]} */
function claimsOf(record) {
  assert.ok(
    Array.isArray(record?.claims) && record.claims.length > 0,
    'the claim list must carry its rows',
  );
  return record.claims;
}

/**
 * Every criterion the intent declares is ruled exactly once, in the intent's order, quoting the intent's
 * own text and stating the number of characters it quoted.
 * @param {any} record @returns {void}
 */
function assertCriteriaQuoted(record) {
  const criteria = intentCriteria(sources().intentSource);
  assert.deepEqual(
    claimsOf(record).map((row) => row.criterion),
    Object.keys(criteria),
    `every criterion the intent declares is ruled exactly once: the record rules ${JSON.stringify(claimsOf(record).map((row) => row.criterion))} against ${JSON.stringify(Object.keys(criteria))}`,
  );
  for (const row of claimsOf(record)) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} must quote the intent character for character: claims[${String(claimsOf(record).indexOf(row))}].criterionText is ${JSON.stringify(row.criterionText)} and the intent states ${JSON.stringify(criteria[row.criterion])}`,
    );
    assert.equal(
      row.criterionCharacters,
      row.criterionText.length,
      `${row.criterion} states ${String(row.criterionCharacters)} character(s) for a quote of ${String(row.criterionText.length)}`,
    );
  }
}

/**
 * Each criterion's claim carries the edges the intent assigns it, in the intent's order, with the four
 * cells the five-column table states and the suite the plan resolves for that criterion. A claim missing
 * an edge, or one whose cells are not the table's, reddens by criterion and by edge.
 * @param {any} record @returns {void}
 */
function assertClaimsCarryEdges(record) {
  const edges = intentEdges(sources().intentSource);
  for (const row of claimsOf(record)) {
    const where = row.criterion;
    const held = edges.filter((edge) => edge.criterion === where);
    assert.ok(
      held.length > 0,
      `the intent's edge coverage names no edge for ${where}, so its claim cites no test`,
    );
    assert.deepEqual(
      row.edges.map((/** @type {any} */ edge) => edge.edge),
      held.map((edge) => edge.edge),
      `${where} must carry one row per edge the intent assigns it: it carries ${JSON.stringify(row.edges.map((/** @type {any} */ edge) => edge.edge))} and the intent assigns ${JSON.stringify(held.map((edge) => edge.edge))}`,
    );
    for (const [index, edge] of held.entries()) {
      const stated = row.edges[index] ?? {};
      for (const cell of ['category', 'disposition', 'detail']) {
        assert.equal(
          stated[cell],
          edge[cell],
          `${where}'s ${edge.edge} must carry the ${cell} the intent's edge row states: it carries ${JSON.stringify(stated[cell])} and the intent states ${JSON.stringify(edge[cell])}`,
        );
      }
      assert.ok(
        typeof stated.suite === 'string' && stated.suite !== '',
        `${where}'s ${edge.edge} names no suite, so the plan resolves no suite for it`,
      );
    }
  }
}

/**
 * Every citation resolves at this head: the suite is a file this checkout carries, and it declares the
 * test title the citation names on the line that declares it. A citation naming a test its suite does not
 * declare is refused by naming both.
 * @param {any} record @returns {void}
 */
function assertCitationsResolve(record) {
  for (const row of claimsOf(record)) {
    const where = row.criterion ?? 'a row';
    assert.ok(
      typeof row.suite === 'string' && row.suite !== '',
      `${where} names no suite, so no test proves it`,
    );
    assert.ok(
      typeof row.test === 'string' && row.test !== '',
      `${where} names no test in ${row.suite}, so the claim cites a file rather than a test`,
    );
    assert.ok(
      Array.isArray(row.citations) && row.citations.length > 0,
      `${where} carries no citation list`,
    );
    assert.equal(
      row.suite,
      row.citations[0].suite,
      `${where}'s suite is the first citation's suite`,
    );
    assert.equal(
      row.test,
      row.citations[0].test,
      `${where}'s test is the first citation's test`,
    );
    for (const citation of row.citations) {
      const suite = String(citation.suite ?? '');
      assert.ok(
        suite !== '',
        `${where} carries a citation that names no suite`,
      );
      assert.ok(
        existsSync(absPath(suite)),
        `${where} cites ${suite}, which this checkout does not carry`,
      );
      const { titles } = declarationsIn(readFileSync(absPath(suite), 'utf8'));
      assert.ok(
        titles.includes(citation.test),
        `${where} cites ${suite} for the test ${JSON.stringify(citation.test)}, and that suite declares no such test at this head: it declares ${JSON.stringify(titles)}`,
      );
      assert.ok(
        typeof citation.holds === 'string' &&
          citation.holds.trim().length >= 30,
        `${where} does not state which part of the criterion ${JSON.stringify(citation.test)} holds`,
      );
    }
    assert.ok(
      typeof row.artefactPath === 'string' &&
        row.artefactPath !== '' &&
        row.artefactPath === row.suite,
      `${where} must name the suite its first citation names as its artefact path, and it names ${JSON.stringify(row.artefactPath)} against ${JSON.stringify(row.suite)}`,
    );
    assert.ok(
      typeof row.artefact === 'string' &&
        row.artefact.includes(row.artefactPath),
      `${where} names its artefact path but does not say what that artefact carries`,
    );
    assert.match(
      String(row.artefact),
      /edge (\[[^\]]*\])/,
      `${where} must state the edge ids its artefact is ruled on as edge ["E1"], and it states ${JSON.stringify(String(row.artefact).slice(0, 160))}`,
    );
    assert.ok(
      typeof row.reading === 'string' && row.reading.trim().length >= 40,
      `${where} does not state the reading its citations carry`,
    );
    assert.ok(
      Array.isArray(row.proves) && row.proves.length > 0,
      `${where} names no command that proves it`,
    );
    assert.ok(
      ['required', 'not-required'].includes(row.ruling),
      `${where} rules ${JSON.stringify(row.ruling)}`,
    );
    assert.ok(
      typeof row.reason === 'string' &&
        row.reason.length >= 60 &&
        /portal/i.test(row.reason),
      `${where} must answer the charter's portal clause by name`,
    );
  }
}

/**
 * Every suite the plan resolves one of a criterion's edges to is a suite that criterion's claim cites,
 * and every edge's `suite` is the suite the plan resolves for its criterion. A citation the plan never
 * assigned is refused in the other direction, one suite over at a time.
 * @param {any} record @returns {void}
 */
function assertCitationsFollowThePlan(record) {
  if (!OWNS_THE_BOUND_RECORD) return;
  const { planSource, tasksDir } = sources();
  for (const row of claimsOf(record)) {
    const where = row.criterion;
    const resolved = planSuiteFor(where, planSource, tasksDir).suite;
    assert.ok(
      existsSync(absPath(resolved)),
      `${where} is resolved by the plan to ${resolved}, which this checkout does not carry`,
    );
    const cited = row.citations.map(
      (/** @type {any} */ citation) => citation.suite,
    );
    assert.ok(
      cited.includes(resolved),
      `${where} is resolved by the plan to ${resolved}, and the claim cites ${JSON.stringify(cited)}: the suite the milestone's own plan assigns the criterion must be among its citations`,
    );
    for (const edge of row.edges) {
      assert.equal(
        edge.suite,
        resolved,
        `${where}'s ${edge.edge} names ${JSON.stringify(edge.suite)} as its suite, and the plan resolves ${where} to ${resolved}: one criterion has one suite, or the row names evidence it cannot open in one place`,
      );
    }
  }
}

/**
 * The record's own chain: the milestone it is numbered for, the commands that captured and read it, the
 * file it is, and a ruling whose counts agree with its rows.
 * @param {any} record @returns {void}
 */
function assertCaptureChain(record) {
  assert.equal(
    record.milestone,
    MILESTONE,
    'the record names the milestone its file is numbered for',
  );
  // The command is the owning census's when another one owns the record; what this file can hold is that
  // the record states a command at all, and the chain above names the suite it arms.
  if (OWNS_THE_BOUND_RECORD) {
    assert.equal(
      record.capture?.command,
      CAPTURE_COMMAND,
      'the record names the command that captured it, armed by its own flag',
    );
  } else {
    assert.match(
      String(record.capture?.command ?? ''),
      /M\d{3}_CAPTURE=1 node --test scripts\/[a-z0-9-]+\.test\.mjs/,
      `the record names the command that captured it, armed by its own flag, and it names ${JSON.stringify(record.capture?.command)}`,
    );
  }
  assert.equal(
    record.capture?.check,
    OWNS_THE_BOUND_RECORD
      ? CHECK_COMMAND
      : `node --test ${owningCensus(record)}`,
    "the record names the command that reads it, and that command is the owning census's",
  );
  assert.equal(
    record.capture?.records,
    CLAIMS_REL,
    'the record names the file it is',
  );
  assert.equal(
    record.driver ?? null,
    null,
    'a list with no required row must not name a driver',
  );
  const required = claimsOf(record).filter(
    (/** @type {any} */ row) => row.ruling === 'required',
  ).length;
  assert.equal(
    required,
    record.ruling.required,
    `the record states ${String(record.ruling.required)} required row(s) and carries ${String(required)}`,
  );
  assert.equal(
    record.ruling.notRequired,
    claimsOf(record).length - required,
    `the record states ${String(record.ruling.notRequired)} not-required row(s) and carries ${String(claimsOf(record).length - required)}`,
  );
}

/**
 * The plan evidence the record states: the held-out keys it read, the coverage rows it read, the suites it
 * resolved, and the cross-table disagreements as this head measures them. The sentence that reads the
 * tables must state the count, so a reader sees the measurement rather than a silent empty list.
 * @param {any} record @returns {void}
 */
function assertPlanEvidence(record) {
  if (!OWNS_THE_BOUND_RECORD) return;
  const { planSource } = sources();
  const edges = intentEdges(sources().intentSource);
  const heldOut = planHeldOut(planSource);
  const coverage = planCoverage(planSource);
  const derivedDisagreements = coverageDisagreements(edges, heldOut, coverage);
  assert.deepEqual(
    record.evidence?.plan?.heldOut,
    [...heldOut.keys()].sort(),
    `the record states the held-out keys it read as this head reads them: it states ${JSON.stringify(record.evidence?.plan?.heldOut)} and this head reads ${JSON.stringify([...heldOut.keys()].sort())}`,
  );
  assert.deepEqual(
    record.evidence?.plan?.coverage,
    coverage.map((row) => `${row.criterion} ${row.task} ${row.acceptance}`),
    `the record states the plan's coverage rows as this head reads them: it states ${JSON.stringify(record.evidence?.plan?.coverage)}`,
  );
  assert.deepEqual(
    record.evidence?.plan?.disagreements,
    derivedDisagreements,
    `the record states the plan's cross-table disagreements as this head measures them: it states ${JSON.stringify(record.evidence?.plan?.disagreements)} and this head derives ${JSON.stringify(derivedDisagreements)}`,
  );
  assert.ok(
    String(record.quotes?.edges ?? '').includes(
      `disagree at ${String(derivedDisagreements.length)} row(s)`,
    ),
    'the record states the disagreement count in the sentence that reads the two tables',
  );
  assert.deepEqual(
    Object.fromEntries(
      (record.evidence?.plan?.resolved ?? []).map((/** @type {string} */ one) =>
        one.split(' '),
      ),
    ),
    PLAN_SUITES,
    `the record states the suites the plan resolves as this head resolves them: it states ${JSON.stringify(record.evidence?.plan?.resolved)}`,
  );
}

/**
 * The chain a record this file does not own is held to: the record names the suite that captured it,
 * that suite names the record, and it reads the armed flag the record states. The list's equality with
 * its own derivation is the owning census's to assert, and that suite is one the project runs.
 * @param {any} record @returns {void}
 */
function assertOwnershipChain(record) {
  const command = String(record?.capture?.command ?? '');
  const flag = /M\d{3}_CAPTURE/.exec(command)?.[0];
  const owner = owningCensus(record);
  assert.ok(
    command.includes(owner),
    `${CLAIMS_REL} names the command that captured it, and that command must name the suite that owns it (${owner}): ${JSON.stringify(command)}`,
  );
  assert.ok(
    flag !== undefined,
    `${CLAIMS_REL}'s capture command must arm an M0NN_CAPTURE flag of its own, and it names none: ${JSON.stringify(command)}`,
  );
  const ownerPath = join(ROOT, owner);
  assert.ok(
    existsSync(ownerPath),
    `${CLAIMS_REL} names ${owner} as its census, and this checkout does not carry that suite`,
  );
  const ownerSource = readFileSync(ownerPath, 'utf8');
  assert.ok(
    namesThisRecord(ownerSource, CLAIMS_REL),
    `${owner} owns ${CLAIMS_REL} and must name that record — literally, or as the research/raw/<milestone>-verdict-claims.json template keyed on the bound milestone — and it names neither`,
  );
  assert.ok(
    ownerSource.includes(flag),
    `${owner} owns ${CLAIMS_REL} and must read the flag the record states (${flag}); it does not`,
  );
  assert.equal(
    record.capture?.records,
    CLAIMS_REL,
    'the record names the file it is',
  );
}

/**
 * Whether this suite stands down from the derivation for a record another census owns, applying the
 * ownership chain instead. Every pin that needs M067's proof table asks this first, so another
 * milestone's record is never compared to the wrong criteria — and, while M067 is bound, every pin runs
 * exactly as it did when this record was captured.
 * @param {any} record @returns {boolean}
 */
function standsDown(record) {
  if (OWNS_THE_BOUND_RECORD) return false;
  assertOwnershipChain(record);
  return true;
}

/**
 * The artefact each claim publishes resolves, and the whole record is what this head derives.
 * @param {any} record @returns {void}
 */
function assertDerivesAtThisHead(record) {
  if (standsDown(record)) return;
  const expected = atRecordedDocumentLocations(derived());
  assert.deepEqual(
    record,
    expected,
    `${CLAIMS_REL} is not what this head derives: ${firstDifference(record, expected, '')} - re-capture with ${CAPTURE_COMMAND}`,
  );
  assert.equal(
    canonical(record),
    canonical(expected),
    `${CLAIMS_REL} must be serialized as the capture writes it, so a re-capture would move no byte`,
  );
}

/**
 * Every pin above, over one record: what the armed writer refuses to write and what a default run holds
 * the committed bytes to.
 * @param {any} record @returns {void}
 */
function assertRecordPins(record) {
  if (standsDown(record)) return;
  assertCriteriaQuoted(record);
  assertClaimsCarryEdges(record);
  assertCitationsResolve(record);
  assertCitationsFollowThePlan(record);
  assertCaptureChain(record);
  assertPlanEvidence(record);
}

// -------------------------------------------------------------------- capture ----

/** The bytes the read-only pin holds the record to; an armed run re-bases it after its own write. */
const claimsAtLoad = existsSync(CLAIMS_PATH)
  ? digest(readFileSync(CLAIMS_PATH))
  : null;
let claimsBaseline = claimsAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 *
 * The writer derives through the recorded document — the record states the locations its two documents
 * sat at when it was captured, and the derivation is re-spelled into those locations before it is
 * compared with the bytes on disk. It then refuses to write unless the candidate is the fixed point of
 * the pin this suite's default run holds: the candidate is re-derived from the documents and must
 * serialize to the same bytes, so a capture can never write a record the reader then calls wrong.
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureClaims(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  const record = atRecordedDocumentLocations(derived());
  const candidate = canonical(record);
  let moved = 'the record had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the record moved: ${JSON.stringify(firstDifference(JSON.parse(text), record, ''))}`;
  }
  if (moved === '') return { wrote: false, before, after: before ?? '', moved };
  // Never write a record that would fail its own pins.
  assert.doesNotThrow(() => assertRecordPins(record));
  // Nor one its own default pin would refuse: the candidate must be the fixed point of the pin, so a
  // capture cannot write bytes the read-only run then calls wrong.
  assert.equal(
    canonical(atRecordedDocumentLocations(derived())),
    candidate,
    "armed capture refused: the bytes it would write fail this suite's default pin, so the capture does not derive through the pin its reader holds. Nothing was written.",
  );
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the record's tests, so an armed run writes before the read-only pins read the file
// back: the same pins then prove the freshly written record is the one this head derives.
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
      console.log(
        `armed idempotence: ${String(readFileSync(CLAIMS_PATH).length)} characters, sha256 ${second.after} before and after the second run`,
      );
      claimsBaseline = digest(readFileSync(CLAIMS_PATH));
    });
  });
}

// ----------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('reads the criteria, the edge rows, the plan’s coverage and the suites the plan resolves, and every cited file is here', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    // The suites the plan resolves are this milestone's reading; a later milestone's record is another
    // census's to derive, so the table below is held to M067's own plan and the chain stands in here.
    if (standsDown(recorded)) {
      console.log(
        `${CLAIMS_REL} is ${owningCensus(recorded)}'s to derive, so the plan resolution stands down at this head`,
      );
      return;
    }
    const { intentSource, planSource, tasksDir } = sources();
    const criteria = intentCriteria(intentSource);
    const edges = intentEdges(intentSource);
    const coverage = planCoverage(planSource);
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
    // This plan states that nothing is held out, so the mapping the census reads is its coverage table
    // and the tasks it names. The count is measured rather than assumed in either direction.
    assert.equal(
      heldOut.size,
      0,
      `this plan's ## Held-out checks writes no row, and it writes ${String(heldOut.size)}: a row added there is a mapping this census must read instead`,
    );
    assert.ok(
      coverage.length > 0,
      'the plan must assign its criteria in ## Intent coverage, or no claim can read the suite that proves its criterion',
    );
    for (const criterion of Object.keys(criteria)) {
      const resolved = planSuiteFor(criterion, planSource, tasksDir);
      assert.equal(
        resolved.suite,
        PLAN_SUITES[criterion],
        `the plan resolves ${criterion} to ${resolved.suite} through ${resolved.task}, and this table names ${JSON.stringify(PLAN_SUITES[criterion])}`,
      );
      assert.ok(
        existsSync(absPath(resolved.suite)),
        `${criterion} is resolved to ${resolved.suite}, which this checkout does not carry`,
      );
    }
    for (const claim of claimsOf(derived())) {
      for (const citation of claim.citations) {
        assert.ok(
          existsSync(absPath(citation.suite)),
          `${claim.criterion} cites ${citation.suite}, which this checkout does not carry`,
        );
      }
    }
    console.log(
      `${MILESTONE}: ${String(Object.keys(criteria).length)} criteria, ${String(edges.length)} edge row(s), ${String(heldOut.size)} held-out row(s), ${String(coverage.length)} coverage row(s), suites ${JSON.stringify(PLAN_SUITES)}`,
    );
  });

  it('the documents this census reads belong to the milestone the branch binds', () => {
    const { intentPath, planPath } = sources();
    assert.equal(
      shown(intentPath),
      '.project/intent/INTENT.md',
      `the live milestone's intent is .project/intent/INTENT.md, and this head resolves ${shown(intentPath)}`,
    );
    assert.equal(
      shown(planPath),
      '.project/plan/PLAN.md',
      `the live milestone's plan is .project/plan/PLAN.md, and this head resolves ${shown(planPath)}`,
    );
    assert.equal(
      basename(dirname(dirname(intentPath))),
      '.project',
      `the intent must sit under .project, and it resolves to ${shown(intentPath)}`,
    );
    assert.ok(
      existsSync(absPath(JOIN_REL)),
      `the join this milestone ships, ${JOIN_REL}, must be present before its claims are captured`,
    );
    assert.ok(
      existsSync(absPath(PANEL_REL)),
      `the surface this milestone ships, ${PANEL_REL}, must be present before its claims are captured`,
    );
    assert.ok(
      existsSync(absPath(MEASURED_REL)),
      `the record this milestone measures, ${MEASURED_REL}, must be present before its claims are captured`,
    );
    console.log(
      `${MILESTONE}: held to ${shown(intentPath)} and ${shown(planPath)}; the join ${JOIN_REL}, the surface ${PANEL_REL} and the record ${MEASURED_REL} are here`,
    );
  });
});

// ------------------------------------------------------------------ the record ----

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
    assert.doesNotThrow(() => assertDerivesAtThisHead(recorded));
    console.log(
      `${CLAIMS_REL} is exactly what this head derives: ${String(recorded.claims.length)} claim(s) over ${String(recorded.evidence.suites.length)} suite(s)`,
    );
  });

  it('rules every criterion the intent declares, quotes it verbatim, and carries the edges it is held by', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCriteriaQuoted(recorded));
    assert.doesNotThrow(() => assertClaimsCarryEdges(recorded));
    console.log(
      `${CLAIMS_REL}: ${JSON.stringify(recorded.claims.map((/** @type {any} */ row) => [row.criterion, row.criterionCharacters, row.edges.map((/** @type {any} */ edge) => edge.edge)]))}`,
    );
  });

  it('names a suite and a test this head declares for every citation, and refuses a claim whose test is missing', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(
      `${CLAIMS_REL}: tests ${JSON.stringify(recorded.claims.map((/** @type {any} */ row) => row.test))}`,
    );
  });

  it('cites the suite the plan resolves for every criterion, and states the plan evidence it read', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsFollowThePlan(recorded));
    assert.doesNotThrow(() => assertPlanEvidence(recorded));
    assert.doesNotThrow(() => assertCaptureChain(recorded));
    console.log(
      `${CLAIMS_REL}: plan disagreements ${JSON.stringify(recorded.evidence.plan.disagreements)}; resolved ${JSON.stringify(recorded.evidence.plan.resolved)}`,
    );
  });
});

// -------------------------------------------------------------------- mutants ----

describe('the mutants', () => {
  it('a claim quoting its criterion in its own words reddens naming the claim and the field', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCriteriaQuoted(recorded));

    const planted = clone(recorded);
    const live = planted.claims[0];
    live.criterionText = `${live.criterionText} (reworded here)`;
    live.criterionCharacters = live.criterionText.length;
    assert.notEqual(
      live.criterionText,
      intentCriteria(sources().intentSource).SC1,
      'the planted quote must be a different text from the intent, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertCriteriaQuoted(planted),
      'a row that quotes its criterion in its own words',
    );
    assert.match(
      failure.message,
      /SC1 must quote the intent character for character/,
      `a row whose quote is no longer the intent's must redden by claim id; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );
    assert.match(
      failure.message,
      /claims\[0\]\.criterionText/,
      `the refusal must name the field that moved; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
    );

    // The same row with the intent's own text back: the check that bit above passes here.
    assert.doesNotThrow(() => assertCriteriaQuoted(recorded));
    console.log(`quote mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a claim naming a test this head does not declare reddens naming the test and the suite', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertCitationsResolve(recorded));

    const absent = 'a test no suite in this checkout declares';
    const planted = clone(recorded);
    planted.claims[0].test = absent;
    planted.claims[0].citations[0].test = absent;
    const failure = reddens(
      () => assertCitationsResolve(planted),
      'a claim whose test this checkout does not declare',
    );
    assert.ok(
      failure.message.includes(absent),
      `a claim whose test does not exist must redden naming the missing test; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(recorded.claims[0].suite),
      `the refusal must name the suite that should carry the missing test; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /declares no such test at this head/,
      `the refusal must say what is missing rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    // The other direction: a claim citing a suite this checkout does not carry.
    const elsewhere = clone(recorded);
    elsewhere.claims[1].suite = 'scripts/absent-claims-suite.test.mjs';
    elsewhere.claims[1].citations[0].suite =
      'scripts/absent-claims-suite.test.mjs';
    const suiteFailure = reddens(
      () => assertCitationsResolve(elsewhere),
      'a claim citing a suite this checkout does not carry',
    );
    assert.match(
      suiteFailure.message,
      /which this checkout does not carry/,
      `a claim citing an absent suite must redden naming the path; it produced ${JSON.stringify(suiteFailure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertCitationsResolve(recorded));
    console.log(
      `missing-test mutant: ${failure.message.split('\n')[0]} | absent suite: ${suiteFailure.message.split('\n')[0]}`,
    );
  });

  it('a claim that drops the suite the plan resolves reddens naming the criterion and both suites', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    // The suite the plan resolves is this milestone's table; the mutant stands down with the pin it
    // exercises when another census owns the record, and the chain is what this file checks instead.
    if (standsDown(recorded)) return;
    assert.doesNotThrow(() => assertCitationsFollowThePlan(recorded));

    const planted = clone(recorded);
    const row = planted.claims[0];
    assert.ok(
      row.citations.length > 1,
      'the first claim must carry more than the plan-resolved citation, or dropping it is a no-op',
    );
    row.citations = row.citations.filter(
      (/** @type {any} */ citation) =>
        citation.suite !== PLAN_SUITES[row.criterion],
    );
    assert.ok(
      !row.citations.some(
        (/** @type {any} */ citation) =>
          citation.suite === PLAN_SUITES[row.criterion],
      ),
      'the planted claim must no longer cite the suite the plan resolves',
    );

    const failure = reddens(
      () => assertCitationsFollowThePlan(planted),
      'a claim that drops the suite the plan resolves',
    );
    assert.ok(
      failure.message.includes(row.criterion),
      `the refusal must name the criterion; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(PLAN_SUITES[row.criterion]),
      `the refusal must name the suite the plan resolves; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.match(
      failure.message,
      /must be among its citations/,
      `the refusal must state the rule; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    assert.doesNotThrow(() => assertCitationsFollowThePlan(recorded));
    console.log(`dropped-plan-suite mutant: ${failure.message.split('\n')[0]}`);
  });

  it('a claim whose edge cells are not the intent’s reddens naming the criterion and the edge', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    assert.doesNotThrow(() => assertClaimsCarryEdges(recorded));

    const planted = clone(recorded);
    const row = planted.claims[0];
    row.edges[0].detail = 'a detail this record wrote for itself';
    assert.notEqual(
      row.edges[0].detail,
      recorded.claims[0].edges[0].detail,
      'the planted detail must differ from the intent’s, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertClaimsCarryEdges(planted),
      'a claim whose edge detail is not the intent’s',
    );
    assert.ok(
      failure.message.includes(row.criterion),
      `the refusal must name the criterion; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );
    assert.ok(
      failure.message.includes(row.edges[0].edge),
      `the refusal must name the edge; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
    );

    // And the record with the intent's cells back: the check that bit above passes here.
    assert.doesNotThrow(() => assertClaimsCarryEdges(recorded));
    console.log(`edge-detail mutant: ${failure.message.split('\n')[0]}`);
  });

  it('the four mutants are four different defects, and each is proved against the same record', () => {
    const recorded = JSON.parse(readFileSync(CLAIMS_PATH, 'utf8'));
    const pins = [
      () => assertCriteriaQuoted(recorded),
      () => assertClaimsCarryEdges(recorded),
      () => assertCitationsResolve(recorded),
      () => assertCitationsFollowThePlan(recorded),
      () => assertPlanEvidence(recorded),
      () => assertCaptureChain(recorded),
    ];
    for (const pin of pins) assert.doesNotThrow(pin);
    assert.equal(
      new Set(pins.map((pin) => pin.toString())).size,
      pins.length,
      'the pins must be different checks rather than one check listed twice',
    );
    console.log(
      `${CLAIMS_REL}: ${String(pins.length)} pins hold the committed record at once`,
    );
  });
});

// ------------------------------------------------------------------- the writer ----

describe('the writer', () => {
  it('writes only behind its own arm, and derives the candidate through the recorded document', () => {
    const source = readText(SUITE_REL, 'this suite is what is being measured');
    const armed = /if \(ARMED\) \{/.test(source);
    assert.ok(
      armed,
      'the armed capture must sit behind a single `if (ARMED)` gate, so a default run cannot write',
    );
    assert.equal(
      (source.match(/^\s*writeFileSync\(/gm) ?? []).length,
      1,
      'exactly one writeFileSync call may exist, and it must be the armed capture',
    );
    const at = source.indexOf('function captureClaims(');
    assert.ok(at >= 0, 'the capture must be one function');
    const body = source.slice(at, source.indexOf('\n}\n', at));
    for (const required of [
      'atRecordedDocumentLocations(derived())',
      'assertRecordPins(record)',
      'armed capture refused',
    ]) {
      assert.ok(
        body.includes(required),
        `the writer must derive through the recorded document and refuse a candidate that fails its own pin, and it does not name ${JSON.stringify(required)}`,
      );
    }
    assert.ok(
      body.indexOf('assertRecordPins(record)') < body.indexOf('writeFileSync('),
      'the writer must refuse before it writes, not after',
    );
    // The flag the record states is the one the writers that read it derive, and the record names it.
    assert.ok(
      source.includes(CAPTURE_ENV),
      `this suite must read the flag the record states (${CAPTURE_ENV})`,
    );
    assert.ok(
      CAPTURE_COMMAND.includes(CAPTURE_ENV),
      'the capture command the record states must arm the flag this suite reads',
    );
    console.log(
      `writer: one write behind ${CAPTURE_ENV}, deriving through the recorded document and the pin`,
    );
  });
});
