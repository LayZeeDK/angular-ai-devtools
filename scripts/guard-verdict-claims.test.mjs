// M063 T004 — the claims census: what each success criterion claims, and the suite and test that
// prove it at this head.
//
// The census this milestone follows is M062's (`scripts/outlet-verdict-claims.test.mjs`), which reads
// the bound intent at capture time. This milestone needs a census of its own for the same two reasons
// M062 did, both of them measurable in `.project/plan/PLAN.md`:
//
//   1. The plan's `## Held-out checks` resolves one criterion's edges to two suites. E1 and E2 are
//      TS002's `scripts/guard-answer.test.mjs` and E7 is T003's `scripts/panel-routes.test.mjs`, so SC1
//      is held by both. The older census in `scripts/navigation-blocking.test.mjs` derives one artefact
//      path per criterion and refuses that; it reads this record's own `capture.command`, sees another
//      suite named there, and stands down to the shape rules it can hold without deriving.
//   2. The plan's two tables disagree. `## Held-out checks` holds E7 out at T003, and `## Intent
//      coverage` assigns T003 to SC4 and never to SC1 — so E7 is filed under a task the coverage table
//      gives a different criterion. That is recorded under `evidence.plan.disagreements` rather than
//      refused: a reader needs the citation and the disagreement in one place.
//
// Four rules, and none of them reads a fact the tree does not carry:
//
//   1. Each criterion, quoted. Every criterion `INTENT.md` declares is ruled exactly once, and its
//      `criterionText` is the intent's own text, parsed with the routine
//      `scripts/overlay-verdict-claims.test.mjs` uses, so `criterionText` is compared character for
//      character by that suite as well as by this one. `criterionCharacters` states the length it
//      quoted, so a quote that slid by one word is reported by claim id and by field.
//   2. Each claim's edges, read from the intent. The five columns the owner's ruling makes
//      authoritative (`Edge | Criterion | Category | Disposition | Detail`) give each criterion the
//      edges it is held by, with the detail cell verbatim.
//   3. Each edge's suite, read from the plan. The plan's `## Held-out checks` is the one place the
//      test-to-edge mapping lives, and every claim names every suite the plan resolves one of its
//      edges to — a suite the plan never assigns an edge of that criterion would be a citation the
//      milestone did not make.
//   4. Each claim's suite and test, read from this checkout. A claim names a test, and the suite it
//      names must declare that test at this head: the declaration is the title `it(`/`test(` is
//      handed, read from the file. A claim whose test does not exist reddens naming the missing test
//      and the suite that should carry it — the rule AC2 states, proven below against a planted name.
//
// `M063_CAPTURE=1` arms the one write. It re-derives, compares, and writes only when a value moved, so
// two armed runs leave the file byte-identical; a default run reads the file, asserts it is exactly
// what this head derives, and asserts its own bytes did not move. The command the record states is
// this task's Verify, spelled as the task states it:
//
//   M063_CAPTURE=1 node --test scripts/guard-verdict-claims.test.mjs
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { intentPathForMilestone } from './verdict-claims-intent.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUITE_REL = 'scripts/guard-verdict-claims.test.mjs';
const RAW = 'research/raw';

/** The milestone this census is the census of, read from the branch the state file binds. */
const MILESTONE = boundMilestone();
const CLAIMS_REL = `${RAW}/${MILESTONE.toLowerCase()}-verdict-claims.json`;
const CLAIMS_PATH = join(ROOT, CLAIMS_REL);

/**
 * The record this file writes, named as a literal as well as derived. The literal is what the readers
 * that subtract a record its own census holds open — `scripts/tutor-record-shapes.test.mjs` and
 * `scripts/tutor-answer.test.mjs` read the owner from the record's own `capture.command` and then
 * require that owner to name the record's path — and the assertion below keeps the two spellings one:
 * a branch that binds another milestone reddens here, naming both paths, rather than writing a record
 * this file does not name.
 */
const CLAIMS_NAMED = 'research/raw/m063-verdict-claims.json';

/** The commands this record is held to, recorded in it so a reader runs what produced it. */
const CHECK_COMMAND = `node --test ${SUITE_REL}`;
const CAPTURE_COMMAND = `${MILESTONE}_CAPTURE=1 ${CHECK_COMMAND}`;
const CAPTURE_ENV = `${MILESTONE}_CAPTURE`;
const ARMED = String(process.env[CAPTURE_ENV] ?? '').trim() === '1';

/** The pane this milestone's one surface is rendered by, and its spec. */
const PANEL_PANE = 'apps/angular-ai-devtools/src/app/panel-guard-phase.ts';
const PANEL_SPEC = 'apps/angular-ai-devtools/src/app/panel-guard-phase.spec.ts';

/**
 * What proves each criterion, in the order a reader should read it: the first citation is the one the
 * row's `suite` and `test` fields name, and every further citation holds a part of the same criterion.
 * Each `suite` must be a file this checkout carries, each `test` a title that file declares at this
 * head, and every suite the plan resolves one of the criterion's edges to must be here — including
 * `scripts/panel-routes.test.mjs` for SC1, because the plan holds E7 out at T003 and that suite is the
 * one the row names: the assertion that actually proves E7's precision is
 * `scripts/guard-answer.test.mjs`'s own E7 test, cited beside it, and the disagreement between the two
 * tables is recorded under `evidence.plan.disagreements`.
 */
const PROOFS = Object.freeze({
  SC1: Object.freeze([
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'SC1 — a record naming a cancelling guard names its phase, its guard and the verdict',
      holds:
        'the finding names the guard, the phase it ran in and the verdict that cancelled',
    },
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'E7 — the guard that allowed the navigation is not reported as the one that cancelled it',
      holds:
        'a guard that ran and allowed the navigation is never reported as the one that cancelled it',
    },
    {
      suite: 'scripts/guard-phase.test.mjs',
      test: 'SC1 — a cancelled navigation names its guard, the phase it ran in and the verdict',
      holds:
        'the record itself carries the guard, the phase it ran in and the verdict for the cancellation',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name',
      holds:
        'the route-table pin the same task moved, so the surface that renders the phase keeps its own path and its own name',
    },
  ]),
  SC2: Object.freeze([
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'SC2 — a row whose guard is unknown keeps guard null, with the absence, and no logged name',
      holds:
        'a verdict the record does not carry is cannot-tell with the reason, and the answer names no logged guard',
    },
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'E3 — a verdict the record does not carry is reported as not emitted, never as a pass',
      holds: 'a verdict the record does not carry is reported not emitted',
    },
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'M4 — a verdict the record does not carry answered as a pass reddens E3',
      holds:
        'the mutant that fills the gap from a pass reddens the absence pin',
    },
    {
      suite: 'scripts/guard-phase.test.mjs',
      test: 'SC2 — a row whose guard is unknown keeps guard null, with an absence, and no logged name',
      holds:
        'the record keeps an unknown guard null with its own absence rather than the last guard logged',
    },
  ]),
  SC3: Object.freeze([
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'SC3 — the record’s row fields and the join’s inputs are one list, and its holes are the record’s',
      holds:
        "the record's shape and the join's inputs are the same list, asserted in one place",
    },
    {
      suite: 'scripts/guard-answer.test.mjs',
      test: 'is the only module under extension/ that produces one, and a second reader reddens it',
      holds:
        'the guard phase is read from one record this milestone writes, with no second read of the page',
    },
    {
      suite: 'scripts/guard-phase.test.mjs',
      test: 'SC3 — the record’s row fields and the reducer’s inputs are one exported list',
      holds:
        "the record's fields and the reducer's inputs are one exported list rather than two",
    },
    {
      suite: 'scripts/guard-phase.test.mjs',
      test: 'is the only module under extension/ that produces one, and a second reader reddens it',
      holds:
        'a second page-side reader reddens the scan and is named, so one record is one read',
    },
  ]),
  SC4: Object.freeze([
    {
      suite: PANEL_SPEC,
      test: 'renders the state and the three row fields the answer carries (SC4)',
      holds: 'the panel renders exactly the object the join returns',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E4: every declared route surface has a panel-demo LOADERS key',
      holds: 'its loader key, so the surface is reached by its own name',
    },
    {
      suite: 'scripts/panel-routes.test.mjs',
      test: 'E1: the panel routes are one list mapped over one literal, and every surface keeps its path and its own name',
      holds: 'its route-table pin, moved in the same task as the surface',
    },
    {
      suite: PANEL_SPEC,
      test: 'renders nothing a sixth field carries, and no remedy, cause or schematic',
      holds:
        'the answer carries no remedy, no cause and no identity it was not given',
    },
    {
      suite: PANEL_SPEC,
      test: 'writes no sentence, reads no page and imports nothing at runtime',
      holds:
        'the pane reads no page and renders no sentence the answer did not carry',
    },
  ]),
});

/** The command that proves a suite, for each citing suite: a node suite runs under `node --test`. */
function commandFor(suite) {
  if (/\.test\.mjs$/.test(suite)) return `node --test ${suite}`;
  return 'npx nx run angular-ai-devtools:test';
}

/** @param {Buffer | string} bytes @returns {string} */
function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

/** @param {string} path @returns {string} */
function shown(path) {
  return relative(ROOT, path).split(sep).join('/');
}

/** @param {string} text @returns {string} */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/** @param {string} path @param {string} why @returns {string} */
function claimText(path, why) {
  assert.ok(existsSync(path), `${shown(path)} is missing - ${why}`);
  return stripBom(readFileSync(path, 'utf8'));
}

/** @param {string} path @param {string} why @returns {any} */
function claimJson(path, why) {
  return JSON.parse(claimText(path, why));
}

/**
 * The milestone `.project/STATE.md` binds, read as its branch line, so the file this census writes is
 * the file the bound milestone's own readers open.
 *
 * @returns {string}
 */
function boundMilestone() {
  const state = join(ROOT, '.project', 'STATE.md');
  const text = claimText(
    state,
    'the state file is part of this repository, and it is what binds the milestone',
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
 * The numbered success criteria of an intent, parsed with the same routine
 * `scripts/overlay-verdict-claims.test.mjs` uses, so a row quotes the criterion that suite compares
 * it to and not this file's paraphrase of it.
 *
 * @param {string} source
 * @returns {Record<string, string>}
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
 *
 * @param {string} source
 * @param {string} heading
 * @returns {string}
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
 * width is refused by name rather than skipped, so a table that grows a column is a failure here
 * instead of a silently empty list.
 *
 * @param {string} section
 * @param {number} columns
 * @param {string} what
 * @returns {string[][]}
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

/** The five column names the owner's ruling makes authoritative, in the order it names them. */
const EDGE_COLUMNS = ['Edge', 'Criterion', 'Category', 'Disposition', 'Detail'];

/**
 * The edges the bound intent's own five-column edge-coverage table binds to each criterion, with the
 * header read as written so a table headed differently is refused rather than read as though its
 * cells were the ruling's.
 *
 * @param {string} source
 * @returns {Array<{ edge: string, criterion: string, category: string, disposition: string, detail: string }>}
 */
function intentEdges(source) {
  const cells = tableRows(
    sectionOf(source, '## Edge coverage'),
    5,
    "the intent's edge-coverage table",
  );
  assert.ok(
    cells.length > 1,
    'the intent must list its edge coverage as a five-column table, so a criterion has an edge it is held by',
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
    'the intent must list its edge coverage as a five-column table, so a criterion has an edge it is held by',
  );
  return rows;
}

/**
 * The plan's `## Held-out checks`, `Edge | Task | Test`, in both forms the plans in this repository
 * write it: the three-column table and the bullet `- E1 → T002 → \`scripts/x.test.mjs\``.
 */
const HELD_OUT_BULLET =
  /^\s*[-*]\s*(E\d+)\s*(?:→|->|—)\s*(T\d+)\s*(?:→|->|—)\s*`([^`]+)`\s*$/;

/**
 * How many rows the plan's `## Held-out checks` section writes, counted by shape rather than by the
 * reader's own pattern: a table data row naming an edge, or a bullet whose first token is an edge id.
 * The count is deliberately wider than {@link planHeldOut}, so a reader that silently skips a form is
 * caught by a count rather than by the section reading as empty.
 *
 * @param {string} source
 * @returns {number}
 */
function heldOutRowsWritten(source) {
  const section = sectionOf(source, '## Held-out checks');
  let count = 0;
  for (const line of section.split(/\r?\n/)) {
    if (/^\s*\|\s*E\d+\s*\|/.test(line) || /^\s*[-*]\s*E\d+\b/.test(line)) {
      count += 1;
    }
  }
  return count;
}

/**
 * The plan's held-out mapping: one row per edge, naming the task that holds it and the suite that
 * carries it. For a plan that holds an edge out, the mapping is the one place the test-to-edge rule
 * lives, so a claim's suite is read from here rather than chosen by this file.
 *
 * A plan may hold nothing out, and M065's does: it states that every edge is proved by the suite of
 * the task that owns it and that the task's own Verify runs, which the owning census resolves through
 * the plan's `## Intent coverage` table. Requiring a row per edge would refuse that plan for being
 * honest, so the rule here is the one the section's own shape supports in both cases: the reader must
 * return every row the section writes (a row it drops is named by the two counts), and the section
 * must either write a row or sit beside an `## Intent coverage` table that answers instead. What must
 * not happen is an empty mapping over an empty coverage table, which would leave every edge with no
 * citation at all.
 *
 * @param {string} source
 * @returns {Map<string, { task: string, test: string }>}
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
  const written = heldOutRowsWritten(source);
  assert.equal(
    held.size,
    written,
    `the plan's ## Held-out checks writes ${String(written)} row(s) and the reader returned ${String(held.size)}: a row it does not read is an edge that falls back to the suite a task happened to add, not to the suite the plan assigned`,
  );
  assert.ok(
    written > 0 || planCoverage(source).length > 0,
    'the plan must write its held-out mapping as rows, or assign its criteria in ## Intent coverage, or no claim can read the suite that proves its criterion',
  );
  return held;
}

/**
 * The plan's `## Intent coverage` table, `Criterion | Task | Acceptance`.
 *
 * @param {string} source
 * @returns {Array<{ criterion: string, task: string, acceptance: string }>}
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
 * states the list so a disagreement is visible where the citation is, rather than being a derivation
 * that refuses and says only that it refused.
 *
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
 * it declares — the string `it(` or `test(` is handed. A title is read from the one line that
 * declares it; a declaration whose title spans lines is not read, which is a limit this file states
 * rather than a silent skip, because every suite it cites writes its titles on one line.
 *
 * @param {string} source
 * @returns {{ tests: number, groups: number, titles: string[] }}
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
 * The first place two values differ, as `path: recorded -> derived`, so a stale value is named rather
 * than reported as a mismatch somewhere in a 400-line record.
 *
 * @param {any} left
 * @param {any} right
 * @param {string} at
 * @returns {string}
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
 * than the wrapper a `doesNotThrow` puts around it. A pin that survives its mutant is a vacuous pin,
 * and that is a failure here rather than a silent pass.
 *
 * @param {() => void} pin
 * @param {string} what
 * @returns {Error}
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
  return failure;
}

/**
 * The citations one criterion's claim carries: the suite and test that prove it, read from this
 * file's own table and verified against the tree.
 *
 * @param {string} criterion
 * @returns {readonly { suite: string, test: string, holds: string }[]}
 */
function proofOf(criterion) {
  const proofs = PROOFS[criterion];
  assert.ok(
    Array.isArray(proofs) && proofs.length > 0,
    `this census names no proof for ${criterion}, so the criterion would cite no test at all`,
  );
  return proofs;
}

/**
 * The record, derived. Every value below is interpolated from a file this checkout carries, so a
 * citation that moves makes the record stale rather than quietly wrong, and the one judgement this
 * census makes — which test proves a criterion — is held to the tree by
 * {@link assertProofsResolve} rather than taken on trust.
 *
 * @param {string} intentSource
 * @param {string} planSource
 * @param {string} intentPath
 * @param {string} planPath
 * @returns {Record<string, any>}
 */
function derivedClaims(intentSource, planSource, intentPath, planPath) {
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
  const packageText = claimText(
    join(ROOT, 'package.json'),
    'the check chain is part of this repository',
  );
  const stages = String(JSON.parse(packageText).scripts?.check ?? '')
    .split(' && ')
    .map((stage) => stage.trim());
  const missingStage = edges.filter((edge) => !heldOut.has(edge.edge));
  assert.equal(
    missingStage.length,
    0,
    `the plan holds no row out for ${missingStage.map((edge) => edge.edge).join(', ')}, so a claim of the criterion it belongs to would cite a suite the plan never assigned`,
  );

  const claims = Object.entries(criteria).map(([criterion, criterionText]) => {
    const held = edges.filter((edge) => edge.criterion === criterion);
    assert.ok(
      held.length > 0,
      `the intent's edge coverage names no edge for ${criterion}, so its claim cites no test`,
    );
    const rows = held.map((edge) => ({
      edge: edge.edge,
      category: edge.category,
      disposition: edge.disposition,
      detail: edge.detail,
      suite: heldOut.get(edge.edge)?.test ?? '',
    }));
    for (const row of rows) {
      assert.ok(
        row.detail !== '',
        `${row.edge} must carry the detail the intent's five-column table names`,
      );
      assert.ok(
        row.suite !== '',
        `${row.edge} must name the suite the plan assigns it`,
      );
      assert.ok(
        existsSync(join(ROOT, row.suite)),
        `${row.edge} is assigned by the plan to ${row.suite}, and this checkout must carry it`,
      );
    }
    const proofs = proofOf(criterion);
    const primary = proofs[0];
    const suites = [...new Set(proofs.map((proof) => proof.suite))];
    const named = JSON.stringify(rows.map((row) => row.edge));
    const varied = rows
      .map(
        (row) =>
          `${row.edge} ${row.category} ${row.disposition}: ${row.detail}`,
      )
      .join('; ');
    const suiteText = claimText(
      join(ROOT, primary.suite),
      `${criterion}'s claim names it as the suite that proves the criterion`,
    );
    const { tests, groups } = declarationsIn(suiteText);
    const assignedSuites = [
      ...new Set(rows.map((row) => row.suite).filter((suite) => suite !== '')),
    ];
    const freed = disagreements.filter((one) => one.criterion === criterion);
    return {
      criterion,
      criterionText,
      criterionCharacters: criterionText.length,
      ruling: 'not-required',
      reason: `The charter's portal clause makes a verdict required where an insurance-portal route can produce a criterion's facts. ${criterion} is ${JSON.stringify(criterionText)} - a fact about this repository's own record, its joins and the tests that hold them, which no route of any page produces: it is proved by the suite and test this claim names, at this head, and the gate's one \`control-ai-browsers run\` driver returns an element's toolElements, drawnRect, descriptor and noDevContext readings, none of which can say what a test reddens, so a portal-backed row would name a driver that cannot carry the answer. The portal is named because the clause is answered rather than dodged: the evidence is the edge row(s) ${named} the intent itself assigns the criterion, held by the plan at ${JSON.stringify(assignedSuites)}, and the ${String(proofs.length)} citation(s) below name the tests that carry them.${freed.length === 0 ? '' : ` The plan's two tables disagree about ${freed.map((one) => `${one.edge}, held out at ${one.heldBy} while the coverage table assigns ${one.criterion} to ${one.assignedByCoverage.join('/') || 'no task'}`).join('; ')}, which this record states under evidence.plan.disagreements rather than refusing to cite it.`}`,
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
      reading: `${String(proofs.length)} citation(s) over ${String(suites.length)} suite(s) hold ${criterion} through the edge row(s) ${named} the intent assigns it: every one is a test this checkout declares at this head, read from the file that declares it, so the criterion is proved by a test this repository runs rather than by a drive no driver here performs`,
      proves: [
        CHECK_COMMAND,
        ...suites.map((suite) => commandFor(suite)),
        'npm run check',
      ],
    };
  });

  return {
    schema: `${MILESTONE.toLowerCase()}-verdict-claims/v1`,
    milestone: MILESTONE,
    quotes: {
      from: `scripts/verdict-claims-intent.mjs (intentPathForMilestone(ROOT, ${JSON.stringify(MILESTONE)}))`,
      how: `parsed with the same routine scripts/overlay-verdict-claims.test.mjs uses, extracted into this file and run over the resolved intent, so every criterionText is the intent's own text: the ${String(Object.keys(criteria).length)} criteria it declares are ${JSON.stringify(Object.keys(criteria))} and scripts/overlay-verdict-claims.test.mjs compares them character for character`,
      proofs: `every claim's suite and test are read from this checkout at capture: ${String(claims.reduce((sum, claim) => sum + claim.citations.length, 0))} citation(s) over ${JSON.stringify([...new Set(claims.flatMap((claim) => claim.citations.map((citation) => citation.suite)))])}, each checked to declare the test title it names on the line that declares it, and each claim names every suite the plan resolves one of its criterion's edges to`,
      edges: `read from ${shown(intentPath)}'s own five-column edge-coverage table (Edge | Criterion | Category | Disposition | Detail) for the edge-to-criterion rows, and the test-to-edge mapping from ${shown(planPath)}'s ## Held-out checks section, which this path reads as ${String(heldOut.size)} row(s) of edge -> task -> test in either form a plan writes it - the three-column Edge | Task | Test table, or the bullet '- E.. -> T.. -> test' - so a claim cites the suite the milestone's own plan assigns its edges rather than one this file chose: ${String(edges.length)} edge row(s) over the criteria ${JSON.stringify([...new Set(edges.map((edge) => edge.criterion))])} and the suites ${JSON.stringify([...new Set(claims.flatMap((claim) => claim.citations.map((citation) => citation.suite)))])}. The plan's ## Held-out checks and its ## Intent coverage table disagree at ${String(disagreements.length)} row(s) ${JSON.stringify(disagreements.map((one) => `${one.edge} is held by ${one.heldBy} and ${one.criterion} is assigned to ${one.assignedByCoverage.join('/') || 'no task'}`))}, recorded under evidence.plan.disagreements rather than refused, because a reader needs the citation and the disagreement in one place`,
    },
    ruling: {
      required: 0,
      notRequired: claims.length,
      why: [
        'No row is required, and the record therefore names no driver, no instance and no verdict path: scripts/overlay-verdict-claims.test.mjs refuses a list with no required row that names a driver, so naming one would be the opposite defect.',
        `The reason is not convenience. A required row must name the driver a control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four readings - toolElements, drawnRect, descriptor and noDevContext. Every fact the ${String(claims.length)} criteria this milestone declares is written about is a fact about this repository's own guard record, the join that reads it and the tests that hold them, against ${String(stages.length)} stage(s) of the check chain; none of them is an element's rect or a dev context, so naming a driver would make the gate return a page reading for a claim about the gate.`,
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
        disagreements,
      },
      edges: {
        rows: edges.length,
        criteria: [...new Set(edges.map((edge) => edge.criterion))],
      },
      suites: [
        ...new Set(
          claims.flatMap((claim) =>
            claim.citations.map((citation) => citation.suite),
          ),
        ),
      ]
        .sort()
        .map((suite) => ({
          path: suite,
          ...(() => {
            const { tests, groups } = declarationsIn(
              claimText(
                join(ROOT, suite),
                'the suite a claim names as the test that proves it',
              ),
            );
            return { tests, groups };
          })(),
        })),
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
        'an armed run re-derives the list from the intent this checkout binds, its five-column edge coverage, the suites the plan assigns each edge and the tests this checkout declares, and writes it only when a value moved; a default run reads the file and asserts it is exactly what this head derives, naming the field that moved when it is not.',
    },
    claims,
  };
}

/** The list the bound milestone's own two documents derive, so every caller reads one derivation. */
function derivedList() {
  const intentPath = intentPathForMilestone(ROOT, MILESTONE);
  const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
  return derivedClaims(
    claimText(intentPath, `the intent ${MILESTONE} binds`),
    claimText(planPath, `the plan ${MILESTONE} binds`),
    intentPath,
    planPath,
  );
}

/**
 * Every criterion is ruled exactly once, in the intent's order, quoting the intent's own text, and
 * states the number of characters it quoted. Each failure names the criterion and the field, so a
 * quote that slid is reported by claim id rather than as a mismatch in the file.
 *
 * @param {any} recording
 * @param {Record<string, string>} criteria
 * @returns {void}
 */
function assertQuotedCriteria(recording, criteria) {
  assert.deepEqual(
    recording.claims.map((/** @type {any} */ row) => row.criterion),
    Object.keys(criteria),
    `every criterion the intent declares is ruled exactly once: ${JSON.stringify(recording.claims.map((/** @type {any} */ row) => row.criterion))} against ${JSON.stringify(Object.keys(criteria))}`,
  );
  for (const row of recording.claims) {
    assert.equal(
      row.criterionText,
      criteria[row.criterion],
      `${row.criterion} must quote the intent character for character: claims[${String(recording.claims.indexOf(row))}].criterionText is ${JSON.stringify(row.criterionText)} and the intent states ${JSON.stringify(criteria[row.criterion])}`,
    );
    assert.equal(
      row.criterionCharacters,
      row.criterionText.length,
      `${row.criterion} states ${String(row.criterionCharacters)} character(s) for a quote of ${String(row.criterionText.length)}`,
    );
  }
}

/**
 * Every citation a claim carries resolves at this head: the suite is a file this checkout carries,
 * and that file declares the test title the citation names. A citation naming a test the suite does
 * not declare is refused by naming both the test and the suite — the rule AC2 states.
 *
 * @param {any} recording
 * @returns {void}
 */
function assertProofsResolve(recording) {
  assert.ok(
    Array.isArray(recording?.claims) && recording.claims.length > 0,
    'the claim list must carry its rows',
  );
  for (const row of recording.claims) {
    const where = row?.criterion ?? 'a row';
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
    const first = row.citations[0];
    assert.equal(
      row.suite,
      first.suite,
      `${where}'s suite is the first citation's suite`,
    );
    assert.equal(
      row.test,
      first.test,
      `${where}'s test is the first citation's test`,
    );
    for (const citation of row.citations) {
      const suite = String(citation.suite ?? '');
      assert.ok(
        suite !== '',
        `${where} carries a citation that names no suite`,
      );
      assert.ok(
        existsSync(join(ROOT, suite)),
        `${where} cites ${suite}, which this checkout does not carry`,
      );
      const { titles } = declarationsIn(
        readFileSync(join(ROOT, suite), 'utf8'),
      );
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
      typeof row.artefact === 'string' &&
        row.artefact.includes(row.artefactPath),
      `${where} names its artefact path but does not say what that artefact carries`,
    );
    assert.ok(
      existsSync(join(ROOT, row.artefactPath)),
      `${where} cites ${row.artefactPath}, which this checkout does not carry`,
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
      row.reason.length >= 60 && /portal/i.test(row.reason),
      `${where} must answer the charter's portal clause by name`,
    );
  }
}

/**
 * Whether the bound record's rows carry this census's citation shape — `suite`, `test` and a
 * `citations` list — which is what {@link assertProofsResolve} reads.
 *
 * There are two row shapes among the records this file can be bound to. M062's, M063's and M064's
 * censuses each make the judgement this file makes, and their rows name one suite, one test title and
 * the citation list that title sits in. The census M044 introduced,
 * `scripts/navigation-blocking.test.mjs` — which recorded every milestone from M044 to M061, and which
 * M065 names again — makes a different judgement: its row names the suites it is held by (`suites`),
 * the artefact it cites (`artefactPath`), the edge rows of the intent's own table and no test title at
 * all, because it reads the test-to-edge mapping from the plan rather than from a title. A row of that
 * shape cannot be held to a rule about a `test` field it does not carry, so the shape is read here
 * rather than assumed.
 *
 * @param {any} recording
 * @returns {boolean}
 */
function carriesCitations(recording) {
  const rows = Array.isArray(recording?.claims) ? recording.claims : [];
  return rows.length > 0 && rows.every((row) => Array.isArray(row?.citations));
}

/**
 * The proof rules this file can hold a bound record to without owning its derivation. A record in this
 * census's citation shape is held to {@link assertProofsResolve}. A record in the M044 census's shape is
 * held to the rules its own fields carry — the same rules that census states for its own rows: a
 * carried artefact path that the artefact string names, a reading of at least forty characters, the
 * commands that prove the row, a ruling from the enum, and the charter's portal clause answered by name
 * — and the test-title rule is the owning census's, which is where the test title is read from.
 *
 * @param {any} recording
 * @returns {void}
 */
function assertBoundProofs(recording) {
  if (carriesCitations(recording)) {
    assertProofsResolve(recording);
    return;
  }
  assert.ok(
    Array.isArray(recording?.claims) && recording.claims.length > 0,
    'the claim list must carry its rows',
  );
  for (const row of recording.claims) {
    const where = row?.criterion ?? 'a row';
    assert.ok(
      typeof row.artefactPath === 'string' && row.artefactPath !== '',
      `${where} cites no artefact path`,
    );
    assert.ok(
      existsSync(join(ROOT, row.artefactPath)),
      `${where} cites ${row.artefactPath}, which this checkout does not carry`,
    );
    assert.ok(
      typeof row.artefact === 'string' &&
        row.artefact.includes(row.artefactPath),
      `${where} names its artefact path but does not say what that artefact carries`,
    );
    assert.ok(
      Array.isArray(row.suites) && row.suites.length > 0,
      `${where} names no suite, so nothing in this checkout is held to hold it`,
    );
    for (const suite of row.suites) {
      assert.ok(
        typeof suite === 'string' && suite !== '',
        `${where} names an empty suite`,
      );
      assert.ok(
        existsSync(join(ROOT, suite)),
        `${where} names ${suite} as a suite that holds it, which this checkout does not carry`,
      );
    }
    assert.ok(
      typeof row.reading === 'string' && row.reading.trim().length >= 40,
      `${where} does not state the reading its artefact carries: ${JSON.stringify(row.reading)}`,
    );
    assert.ok(
      Array.isArray(row.proves) &&
        row.proves.length > 0 &&
        row.proves.every(
          (/** @type {any} */ command) =>
            typeof command === 'string' && command.trim() !== '',
        ),
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
 * Every suite the plan resolves one of a criterion's edges to is a suite that criterion's claim
 * cites. A claim that cites a suite the milestone never assigned an edge of that criterion is refused
 * too, in the other direction: a citation is a claim of proof, and neither direction may be invented.
 *
 * @param {any} recording
 * @param {Array<{ edge: string, criterion: string }>} edges
 * @param {Map<string, { task: string, test: string }>} heldOut
 * @returns {void}
 */
function assertCitationsFollowThePlan(recording, edges, heldOut) {
  for (const row of recording.claims) {
    const where = row.criterion;
    const assigned = [
      ...new Set(
        edges
          .filter((edge) => edge.criterion === where)
          .map((edge) => heldOut.get(edge.edge)?.test ?? ''),
      ),
    ].filter((suite) => suite !== '');
    const cited = row.citations.map(
      (/** @type {any} */ citation) => citation.suite,
    );
    for (const suite of assigned) {
      assert.ok(
        cited.includes(suite),
        `${where} is held by the plan at ${suite}, and the claim cites ${JSON.stringify(cited)}: the suite the milestone assigned the criterion must be among its citations`,
      );
    }
    for (const suite of cited) {
      assert.ok(
        assigned.includes(suite) ||
          PROOFS[where].some(
            (proof) =>
              proof.suite === suite &&
              typeof proof.holds === 'string' &&
              proof.holds.trim().length > 0,
          ),
        `${where} cites ${suite}, which neither the plan assigns an edge of ${where} to nor this census names a part of ${where} for`,
      );
    }
  }
}

/** The bytes the read-only pin holds the list to; an armed run re-bases it after its own write. */
const claimsAtLoad = existsSync(CLAIMS_PATH)
  ? digest(readFileSync(CLAIMS_PATH))
  : null;
let claimsBaseline = claimsAtLoad;

/**
 * The armed capture: derive, compare, write only when a value moved, so two armed runs leave the file
 * byte-identical and a default run never writes at all.
 *
 * @param {string} path
 * @returns {{ wrote: boolean, before: string | null, after: string, moved: string }}
 */
function captureClaims(path) {
  const present = existsSync(path);
  const text = present ? readFileSync(path, 'utf8') : '';
  const before = present ? digest(text) : null;
  const record = derivedList();
  const candidate = `${JSON.stringify(record, null, 2)}\n`;
  let moved = 'the list had not been written';
  if (present && text === candidate) {
    moved = '';
  } else if (present) {
    moved = `the list moved: ${JSON.stringify(
      firstDifference(JSON.parse(text), record, ''),
    )}`;
  }
  if (moved === '') return { wrote: false, before, after: before ?? '', moved };
  // Never write a list that would fail its own citation check.
  assert.doesNotThrow(() => assertProofsResolve(record));
  writeFileSync(path, candidate);
  return { wrote: true, before, after: digest(readFileSync(path)), moved };
}

// Declared first among the claim-list tests, so an armed run writes before the read-only pins read
// the file back: the same pins then prove the freshly written list is still the one this head
// derives.
if (ARMED) {
  describe('the claim list, armed', () => {
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
        'a second armed run changed the list, so the re-capture is not idempotent',
      );
      console.log(
        `armed idempotence: ${String(readFileSync(CLAIMS_PATH).length)} characters, sha256 ${second.after} before and after the second run`,
      );
      claimsBaseline = digest(readFileSync(CLAIMS_PATH));
    });
  });
}

// ------------------------------------------------------------------ measurement ----

describe('measurement', () => {
  it('the intent, the plan and this checkout carry the criteria, edges, suites and tests the claims rest on', () => {
    const intentPath = intentPathForMilestone(ROOT, MILESTONE);
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    const intentSource = claimText(intentPath, `the intent ${MILESTONE} binds`);
    const planSource = claimText(planPath, `the plan ${MILESTONE} binds`);
    const criteria = intentCriteria(intentSource);
    const edges = intentEdges(intentSource);

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
    const heldOut = planHeldOut(planSource);
    if (!CLAIMS_OWNED_ELSEWHERE) {
      assert.equal(
        heldOut.size,
        8,
        `the plan holds out one row per edge, and it holds out ${String(heldOut.size)}`,
      );
    }

    // Every edge a criterion is held by resolves to a suite this checkout carries, so the derivation
    // below cannot cite a file the tree lacks. An edge the plan holds out names its suite in that row;
    // an edge it does not is resolved by the census that owns the bound record, so the row is held to
    // the suites it does name rather than to a row this head's plan does not write.
    for (const edge of edges) {
      const suite = heldOut.get(edge.edge)?.test ?? '';
      if (suite === '' && CLAIMS_OWNED_ELSEWHERE) continue;
      assert.ok(
        suite !== '',
        `${edge.edge} is held out by no row, so ${edge.criterion} would cite no suite for it`,
      );
      assert.ok(
        existsSync(join(ROOT, suite)),
        `${edge.edge} is assigned to ${suite}, which this checkout does not carry`,
      );
    }

    // Every citation this census makes names a test its suite declares, and every suite the plan
    // assigns a criterion's edge to is cited for that criterion.
    for (const criterion of Object.keys(criteria)) {
      for (const proof of proofOf(criterion)) {
        assert.ok(
          existsSync(join(ROOT, proof.suite)),
          `${criterion} cites ${proof.suite}, which this checkout does not carry`,
        );
        const { titles } = declarationsIn(
          readFileSync(join(ROOT, proof.suite), 'utf8'),
        );
        assert.ok(
          titles.includes(proof.test),
          `${criterion} cites ${proof.suite} for ${JSON.stringify(proof.test)}, and that suite declares no such test: ${JSON.stringify(titles)}`,
        );
      }
      const assigned = edges
        .filter((edge) => edge.criterion === criterion)
        .map((edge) => heldOut.get(edge.edge)?.test ?? '')
        .filter((suite) => suite !== '');
      if (CLAIMS_OWNED_ELSEWHERE) {
        // The pen is another census's, so the citations this direction is held to are the bound
        // record's own: every suite the plan resolves one of the criterion's edges to must be among
        // the citations the record states for it. `PROOFS` above is M063's table and is applied only
        // to M063's record.
        const cited = citationsOf(criterion);
        for (const suite of assigned) {
          assert.ok(
            cited.includes(suite),
            `${criterion} is held by the plan at ${suite} and ${CLAIMS_REL} cites ${JSON.stringify(cited)}: the suite the plan assigns the criterion must be cited`,
          );
        }
      } else {
        const cited = proofOf(criterion).map((proof) => proof.suite);
        for (const suite of assigned) {
          assert.ok(
            cited.includes(suite),
            `${criterion} is held by the plan at ${suite} and this census cites ${JSON.stringify(cited)}: the suite the plan assigns the criterion must be cited`,
          );
        }
      }
    }

    // The plan's two tables are measured rather than trusted: the disagreements are a derived list.
    const coverage = planCoverage(planSource);
    const disagreements = coverageDisagreements(edges, heldOut, coverage);
    const agreements = edges.length - disagreements.length;
    assert.ok(
      agreements > 0,
      'the plan must agree with the intent about at least one edge, or the reading of the two tables is broken',
    );
    if (!CLAIMS_OWNED_ELSEWHERE) {
      // The requirement is this file's own head's: M063's plan held E7 out at T003 while its coverage
      // table assigned T003 no SC1. The bound record is another census's, so whether *its* head carries
      // a disagreement is stated by the record and pinned by the test below; this file asserts the
      // requirement only over the record it derives itself.
      assert.ok(
        disagreements.length > 0,
        `the plan's ## Held-out checks holds E7 out at T003 while its ## Intent coverage table assigns T003 to ${JSON.stringify(
          coverage
            .filter((row) => row.criterion === 'SC1')
            .map((row) => row.task),
        )} and not to SC1, so this head carries at least one disagreement and the record must state it`,
      );
    }
    console.log(
      `${MILESTONE}: ${String(Object.keys(criteria).length)} criteria, ${String(edges.length)} edge row(s), ${String(heldOut.size)} held-out row(s), ${String(agreements)} agreeing, ${String(disagreements.length)} disagreement(s) ${JSON.stringify(disagreements.map((one) => `${one.edge}: held by ${one.heldBy}, coverage assigns ${one.assignedByCoverage.join('/') || 'no task'}`))}`,
    );
  });
});

// ------------------------------------------------------------------- the claims ----

describe('the claim list', () => {
  it('is a read: a default run hashes the list the same before and after', () => {
    assert.ok(
      existsSync(CLAIMS_PATH),
      `${CLAIMS_REL} is missing - the list has never been captured`,
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

  it('is exactly the list this head derives, and a value that moved is named', () => {
    const recorded = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    if (CLAIMS_OWNED_ELSEWHERE) {
      // The pen is the owner's, so the comparison this file can make without it is the ownership
      // chain: the record names the suite that captured it, that suite carries this record's own path
      // and reads the armed flag the record states, and the record states the milestone its file is
      // numbered for. The list's equality with its derivation is asserted by that suite, which the
      // project runs, rather than guessed at here — this file's derivation is M063's table and would
      // compare M064's record to M063's proofs.
      const command = String(recorded.capture?.command ?? '');
      const flag = /M\d{3}_CAPTURE/.exec(command)?.[0];
      assert.ok(
        command.includes(CLAIMS_OWNER),
        `${CLAIMS_REL} names the command that captured it, and that command must name the suite that owns it (${CLAIMS_OWNER}): ${JSON.stringify(command)}`,
      );
      assert.ok(
        flag !== undefined,
        `${CLAIMS_REL}'s capture command must arm an M0NN_CAPTURE flag of its own, and it names none: ${JSON.stringify(command)}`,
      );
      const ownerPath = join(ROOT, CLAIMS_OWNER);
      assert.ok(
        existsSync(ownerPath),
        `${CLAIMS_REL} names ${CLAIMS_OWNER} as its census, and this checkout does not carry that suite`,
      );
      const ownerSource = readFileSync(ownerPath, 'utf8');
      assert.ok(
        namesThisRecord(ownerSource, CLAIMS_REL),
        `${CLAIMS_OWNER} owns ${CLAIMS_REL} and must name that record — literally, or as the research/raw/<milestone>-verdict-claims.json template keyed on the bound milestone — and it names neither`,
      );
      assert.ok(
        ownerSource.includes(flag),
        `${CLAIMS_OWNER} owns ${CLAIMS_REL} and must read the flag the record states (${flag}); it does not`,
      );
      console.log(
        `${CLAIMS_REL} is owned by ${CLAIMS_OWNER} (${flag}), so this file holds it to the ownership chain and not to a second derivation`,
      );
      return;
    }
    const derived = derivedList();
    assert.deepEqual(
      recorded,
      derived,
      `${CLAIMS_REL} is not what this head derives: ${firstDifference(recorded, derived, '')} - re-capture with ${CAPTURE_COMMAND}`,
    );
  });

  it('rules every criterion the intent declares, quotes it verbatim, and names the suite and test that prove it', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    const intentPath = intentPathForMilestone(ROOT, recording.milestone);
    const intentSource = claimText(
      intentPath,
      'the intent belongs to the milestone the list is numbered for',
    );
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    const planSource = claimText(planPath, `the plan ${MILESTONE} binds`);

    assert.equal(
      recording.milestone,
      MILESTONE,
      'the list names the milestone its file is numbered for',
    );
    assert.doesNotThrow(() =>
      assertQuotedCriteria(recording, intentCriteria(intentSource)),
    );
    assert.doesNotThrow(() => assertBoundProofs(recording));
    const edges = intentEdges(intentSource);
    const heldOut = planHeldOut(planSource);
    if (CLAIMS_OWNED_ELSEWHERE) {
      // The direction this file can hold without a proof table of its own: every suite the plan
      // resolves one of the criterion's edges to is cited. The reverse direction — that no citation
      // is a suite the plan never assigned — is read through `PROOFS`, which is M063's table, so the
      // census the record names asserts it there with its own table. A record in the M044 census's
      // shape cites the suites it names under `suites` rather than under a `citations` list, and the
      // suites a plan with no held-out row assigns an edge to are read from `## Intent coverage` by
      // that census, so the reading follows the record's own field here too.
      for (const row of recording.claims) {
        const assigned = [
          ...new Set(
            edges
              .filter((edge) => edge.criterion === row.criterion)
              .map((edge) => heldOut.get(edge.edge)?.test ?? ''),
          ),
        ].filter((suite) => suite !== '');
        const cited = Array.isArray(row.citations)
          ? row.citations.map((/** @type {any} */ citation) => citation.suite)
          : (row.suites ?? []);
        for (const suite of assigned) {
          assert.ok(
            cited.includes(suite),
            `${row.criterion} is held by the plan at ${suite}, and ${CLAIMS_REL} cites ${JSON.stringify(cited)}: the suite the milestone assigned the criterion must be cited`,
          );
        }
      }
    } else {
      assert.doesNotThrow(() =>
        assertCitationsFollowThePlan(recording, edges, heldOut),
      );
    }
    if (CLAIMS_OWNED_ELSEWHERE) {
      // The command that captured it is the owner's, so the command this file can hold is the one the
      // record states to read it with: it must name the suite the record names as its census.
      assert.ok(
        String(recording.capture?.check ?? '').includes(CLAIMS_OWNER),
        `${CLAIMS_REL} states the command that reads it, and that command must name the suite that owns it (${CLAIMS_OWNER}): ${JSON.stringify(recording.capture?.check)}`,
      );
    } else {
      assert.equal(
        recording.capture?.command,
        CAPTURE_COMMAND,
        'the list names the command that captured it, armed by its own flag',
      );
    }
    assert.equal(
      recording.capture?.records,
      CLAIMS_REL,
      'the list names the file it is',
    );
    assert.equal(
      recording.driver ?? null,
      null,
      'a list with no required row must not name a driver',
    );
    const required = recording.claims.filter(
      (/** @type {any} */ row) => row.ruling === 'required',
    ).length;
    assert.equal(
      required,
      recording.ruling.required,
      `the list states ${String(recording.ruling.required)} required row(s) and carries ${String(required)}`,
    );
    console.log(
      `${CLAIMS_REL}: ${String(recording.claims.length)} criterion(a) ruled, ${String(required)} required; suites ${JSON.stringify(recording.claims.map((/** @type {any} */ row) => row.suite))}; tests ${JSON.stringify(recording.claims.map((/** @type {any} */ row) => row.test))}`,
    );
  });

  it('reddens by claim id when a row quotes its criterion in its own words', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    const intentPath = intentPathForMilestone(ROOT, recording.milestone);
    const criteria = intentCriteria(
      claimText(
        intentPath,
        'the intent belongs to the milestone the list is numbered for',
      ),
    );
    const planted = structuredClone(recording);
    const live = planted.claims[0];
    // The word the row states is added to, not a phrase M063's criterion happens to carry: the mutant
    // has to move whichever milestone's record is bound, or it would be a no-op for every record but
    // the one this file was written for.
    live.criterionText = `${live.criterionText} (reworded here)`;
    live.criterionCharacters = live.criterionText.length;
    assert.notEqual(
      live.criterionText,
      criteria.SC1,
      'the planted quote must be a different text from the intent, or the mutant is a no-op',
    );

    const failure = reddens(
      () => assertQuotedCriteria(planted, criteria),
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

    // The same row with the intent's own text back: the check that bit above is the check that passes
    // here, so the mutant reddens the quote and not the row.
    assert.doesNotThrow(() => assertQuotedCriteria(recording, criteria));
    console.log(`quote mutant: ${failure.message.split('\n')[0]}`);
  });

  it('reddens naming the field that moved when the intent is edited after the capture', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    const intentPath = intentPathForMilestone(ROOT, recording.milestone);
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    const intentSource = claimText(
      intentPath,
      'the intent belongs to the milestone the list is numbered for',
    );
    const planSource = claimText(planPath, `the plan ${MILESTONE} binds`);
    if (CLAIMS_OWNED_ELSEWHERE) {
      // The derivation half of this property is the owning census's: it derives the bound milestone's
      // list by editing the intent in memory and names the field `claims[0].criterionText` from
      // `firstDifference`. This file's derivation is M063's, so what it proves here is the same
      // property from the record's side: a criterion edited after the capture no longer matches the
      // quote the record states, and the refusal names the criterion and the field it moved.
      const criteria = intentCriteria(intentSource);
      const edited = {
        ...criteria,
        SC1: `${criteria.SC1} (edited after the capture)`,
      };
      assert.notEqual(
        edited.SC1,
        criteria.SC1,
        'the edited criterion must be a different text, so the record it stales is a different record',
      );
      const failure = reddens(
        () => assertQuotedCriteria(recording, edited),
        'a criterion edited after the capture',
      );
      assert.match(
        failure.message,
        /SC1 must quote the intent character for character/,
        `an edited criterion must redden by claim id; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
      );
      assert.match(
        failure.message,
        /claims\[0\]\.criterionText/,
        `the refusal must name the field that moved; it produced ${JSON.stringify(failure.message.slice(0, 240))}`,
      );
      assert.doesNotThrow(
        () => assertQuotedCriteria(recording, criteria),
        'the committed record quotes the intent as it stands, so the red above is the mutation',
      );
      console.log(
        `stale-criterion mutant (record side; the derivation is ${CLAIMS_OWNER}'s): ${failure.message.split('\n')[0]}`,
      );
      return;
    }
    const edited = intentSource.replace(
      'produces a finding naming the guard, the phase it ran in',
      'produces a finding naming the guard and the phase',
    );
    assert.notEqual(
      edited,
      intentSource,
      'the edited intent must differ from the one on disk, or the mutant is a no-op',
    );
    assert.notEqual(
      intentCriteria(edited).SC1,
      intentCriteria(intentSource).SC1,
      'the edited criterion must be a different text, so the record it stales is a different record',
    );

    const derived = derivedClaims(edited, planSource, intentPath, planPath);
    const difference = firstDifference(recording, derived, '');
    assert.match(
      difference,
      /^claims\[0\]\.criterionText/,
      `a criterion edited after the capture must redden naming the field that moved, and the derivation names ${JSON.stringify(difference)}`,
    );

    // And the record as it stands is still the one the unedited intent derives, so the red above is
    // the mutation and not a record that had already drifted.
    assert.equal(
      firstDifference(recording, derivedList(), ''),
      '',
      'the committed list is exactly what this head derives',
    );
    console.log(`stale-criterion mutant: ${difference}`);
  });

  it('reddens naming the missing test when a claim names a test this head does not declare', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    assert.doesNotThrow(() => assertBoundProofs(recording));

    // The proof a row states must resolve at this head. Which field carries it depends on the census
    // that wrote the record: a citation-shaped row names a test title, and the M044 census's row names
    // the suites it is held by. The mutant is planted on the field the record carries, so the rule is
    // exercised against whichever record is bound rather than skipped for the one it does not fit.
    let failure;
    let suiteFailure;
    if (carriesCitations(recording)) {
      const absent = 'a test no suite in this checkout declares';
      const planted = structuredClone(recording);
      planted.claims[0].test = absent;
      planted.claims[0].citations[0].test = absent;
      failure = reddens(
        () => assertBoundProofs(planted),
        'a claim whose test this checkout does not declare',
      );
      assert.ok(
        failure.message.includes(absent),
        `a claim whose test does not exist must redden naming the missing test; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
      );
      assert.ok(
        failure.message.includes(recording.claims[0].suite),
        `the refusal must name the suite that should carry the missing test; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
      );
      assert.match(
        failure.message,
        /declares no such test at this head/,
        `the refusal must say what is missing rather than that something differs; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
      );

      // The other direction: a claim naming a suite this checkout does not carry.
      const elsewhere = structuredClone(recording);
      elsewhere.claims[1].suite = 'scripts/absent-claims-suite.test.mjs';
      elsewhere.claims[1].citations[0].suite =
        'scripts/absent-claims-suite.test.mjs';
      suiteFailure = reddens(
        () => assertBoundProofs(elsewhere),
        'a claim citing a suite this checkout does not carry',
      );
    } else {
      // The same two directions read from the fields this record carries: the artefact the row cites,
      // and the suite it names as one that holds it.
      const absentSuite = 'scripts/absent-claims-suite.test.mjs';
      const planted = structuredClone(recording);
      planted.claims[0].artefactPath = absentSuite;
      planted.claims[0].suites = [absentSuite];
      failure = reddens(
        () => assertBoundProofs(planted),
        'a claim whose artefact this checkout does not carry',
      );
      assert.ok(
        failure.message.includes(absentSuite),
        `a claim whose artefact does not exist must redden naming the missing path; it produced ${JSON.stringify(failure.message.slice(0, 320))}`,
      );
      const elsewhere = structuredClone(recording);
      elsewhere.claims[1].suites = [absentSuite];
      suiteFailure = reddens(
        () => assertBoundProofs(elsewhere),
        'a claim naming a suite this checkout does not carry',
      );
    }
    assert.match(
      suiteFailure.message,
      /which this checkout does not carry/,
      `a claim citing an absent suite must redden naming the path; it produced ${JSON.stringify(suiteFailure.message.slice(0, 320))}`,
    );

    // The same record with the proofs it names: the check that bit above passes here.
    assert.doesNotThrow(() => assertBoundProofs(recording));
    console.log(
      `missing-test mutant: ${failure.message.split('\n')[0]} | absent suite: ${suiteFailure.message.split('\n')[0]}`,
    );
  });

  it('records the plan’s cross-table disagreements rather than refusing to derive', () => {
    const recording = claimJson(
      CLAIMS_PATH,
      'the list is part of this repository',
    );
    const intentPath = intentPathForMilestone(ROOT, recording.milestone);
    const planPath = join(dirname(intentPath), '..', 'plan', 'PLAN.md');
    const intentSource = claimText(
      intentPath,
      'the intent belongs to the milestone the list is numbered for',
    );
    const planSource = claimText(planPath, `the plan ${MILESTONE} binds`);
    const edges = intentEdges(intentSource);
    const heldOut = planHeldOut(planSource);
    const coverage = planCoverage(planSource);
    const derived = coverageDisagreements(edges, heldOut, coverage);

    // Which field states the disagreements depends on the census that wrote the record. A
    // citation-shaped census states them under `evidence.plan.disagreements` and says so in
    // `quotes.edges`. The M044 census states the held-out keys it read under `evidence.plan.heldOut`
    // and nothing else, because it refuses to derive across the two tables at all, so a record of that
    // shape is held to the mapping it does state — and, this head's plan writing no held-out row, that
    // mapping is the empty list, which the derivation must agree with.
    if (Array.isArray(recording.evidence?.plan?.disagreements)) {
      assert.deepEqual(
        recording.evidence.plan.disagreements,
        derived,
        `the record states the plan's cross-table disagreements as this head measures them: it states ${JSON.stringify(recording.evidence.plan.disagreements)} and this head derives ${JSON.stringify(derived)}`,
      );
      assert.ok(
        String(recording.quotes?.edges ?? '').includes(
          `disagree at ${String(derived.length)} row(s)`,
        ),
        'the record states the disagreement count in the sentence that reads the tables',
      );
    } else {
      assert.deepEqual(
        recording.evidence?.plan?.heldOut,
        [...heldOut.keys()].sort(),
        `the record states the held-out keys it read as this head reads them: it states ${JSON.stringify(recording.evidence?.plan?.heldOut)} and this head reads ${JSON.stringify([...heldOut.keys()].sort())}`,
      );
      assert.deepEqual(
        derived,
        [],
        `a record that states no disagreement and a plan whose mapping this head reads as ${JSON.stringify([...heldOut.keys()])} must derive none, and this head derives ${JSON.stringify(derived)}`,
      );
    }
    // Both directions: the disagreement this head derives is the one the record states, and a record
    // that dropped one or invented another is refused above rather than tolerated. The head this file
    // was written for carried one (E7 held out at T003 under SC1); this head's plan gives every
    // held-out row's task the criterion its coverage table assigns that edge, so the derivation is the
    // empty list and the moved-row check below proves the reading is not vacuous.
    assert.deepEqual(
      derived.map((one) => `${one.edge} ${one.criterion} ${one.heldBy}`),
      [],
      `this head's plan holds out no edge under a task its coverage table gives another criterion; it derives ${JSON.stringify(derived)}`,
    );

    // The reading is non-vacuous. Where the plan writes a held-out row, that row is moved to a task the
    // coverage table does not assign its edge's criterion. Where it writes none — this head's plan
    // states that no edge is held out — the mapping the check reads is built here instead, so the check
    // is exercised against this plan rather than skipped because the plan holds nothing out.
    let moved;
    if (heldOut.size > 0) {
      const movedRow = planSource.replace(
        /^(\s*[-*]\s*E\d+\s*(?:→|->|—)\s*)(T\d+)/m,
        '$1T999',
      );
      assert.notEqual(
        movedRow,
        planSource,
        'the mutant must move a held-out row it found, or the reading is unchecked',
      );
      moved = coverageDisagreements(
        edges,
        planHeldOut(movedRow),
        planCoverage(movedRow),
      );
    } else {
      const first = edges[0];
      assert.ok(first, 'the intent must declare at least one edge');
      moved = coverageDisagreements(
        edges,
        new Map([
          [
            first.edge,
            { task: 'T999', test: 'scripts/navigation-blocking.test.mjs' },
          ],
        ]),
        coverage,
      );
    }
    assert.equal(
      moved.length,
      derived.length + 1,
      `moving a held-out row to another task must add exactly one disagreement, and the mutated mapping derives ${JSON.stringify(moved)}`,
    );
    console.log(
      `plan disagreements: ${String(derived.length)} at this head (${JSON.stringify(derived)}); the moved-row check derives ${String(moved.length)}`,
    );
  });
});

// ------------------------------------------------------- whose census this is ----
//
// One milestone later this file is the predecessor rather than the census. M064's plan resolves its
// criteria's edges to suites of its own (`scripts/chunk-failure.test.mjs`,
// `scripts/import-failure.test.mjs` and `scripts/panel-routes.test.mjs`) and its record names a census
// of its own (`scripts/chunk-failure-claims.test.mjs`). When the bound milestone's record says so in
// its own `capture.command`, this file stands down the way `scripts/outlet-verdict-claims.test.mjs`
// already stands down for M063's record: it holds that record to the ownership chain and to every rule
// that needs no proof table of its own — the quotes against the intent, each citation resolving, the
// plan's own disagreements, the missing-test and reworded-quote mutants — and leaves the derivation and
// the reverse direction of the citation rule to the suite the record names. `PROOFS` above is M063's
// table and is applied only to M063's record.
//
// This block sits after the last line the M044 recording's archive-reference census pins in this file,
// for the same reason `scripts/outlet-verdict-claims.test.mjs` appends its own block at the end: a row
// added above a pinned line would stale the recorded line number by moving it. A `const` declared here
// is initialized when this module finishes evaluating and before any test callback runs, so the tests
// above read it exactly as they would read one declared at the top.

/**
 * The suite that owns the bound milestone's claim list, read from the record's own `capture.command`.
 *
 * This file is M063's census: its `PROOFS` table and its `CLAIMS_NAMED` literal are M063's, and it can
 * derive the list only for the milestone it names. A later milestone whose record names a different
 * census in its own `capture.command` (`research/raw/m064-verdict-claims.json` names
 * `scripts/chunk-failure-claims.test.mjs`) is therefore owned elsewhere — the same rule
 * `scripts/outlet-verdict-claims.test.mjs` already applies to a record another census writes. A record
 * that names this file is derived and pinned here exactly as before.
 *
 * @param {any} recording the claim list, or null when it has never been captured
 * @returns {string} the repository path of the suite that captures it
 */
function owningCensus(recording) {
  const command = String(recording?.capture?.command ?? '');
  const named = /scripts\/[a-z0-9-]+\.test\.mjs/.exec(command)?.[0];
  return named ?? SUITE_REL;
}

/**
 * Whether the suite a record names as its census names that record. Two spellings count, and they are
 * not interchangeable in strength: a census may write the path literally, or it may derive it from the
 * milestone the state file binds, so that the file it writes is the file that milestone's own readers
 * open. The derived form is the stronger statement — a literal is what left the older census describing
 * M044 on every milestone after it — so a suite that carries the `-verdict-claims.json` template under
 * a `research/raw/` root, reads the milestone from the bound branch and arms an `M0NN_CAPTURE` flag of
 * its own names this record as surely as a literal does.
 *
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

/**
 * The suites the bound record cites for one criterion, de-duplicated and in record order: the citations
 * a criterion's rows carry, which is the reading this file can hold another census's record to.
 *
 * @param {string} criterion `SC1` to `SC4`
 * @returns {string[]}
 */
function citationsOf(criterion) {
  const recording = claimJson(
    CLAIMS_PATH,
    'the list is part of this repository',
  );
  const rows = (recording.claims ?? []).filter(
    (/** @type {any} */ row) => row.criterion === criterion,
  );
  return [
    ...new Set(
      rows.flatMap((/** @type {any} */ row) =>
        (row.citations ?? []).map(
          (/** @type {any} */ citation) => citation.suite,
        ),
      ),
    ),
  ];
}

const CLAIMS_OWNER = existsSync(CLAIMS_PATH)
  ? owningCensus(claimJson(CLAIMS_PATH, 'the list is part of this repository'))
  : SUITE_REL;
const CLAIMS_OWNED_ELSEWHERE = CLAIMS_OWNER !== SUITE_REL;
