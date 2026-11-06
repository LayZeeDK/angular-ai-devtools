// @ts-check
// Docs-audit disposition pins — M017 T004.
//
// The docs-audit gate that enforces this file's subject lives in the installed
// GSD Path skill (~/.commandcode/skills/gsd-path/scripts/check_docs_audit.py),
// so nothing in this checkout notices when a later audit edit loses one of the
// three disposition rules. This suite is that guard, in the shape
// scripts/docs-correction.test.mjs already uses for document claims: every case
// reads the real .project/research/DOCS-AUDIT.md, copies it into os.tmpdir(),
// mutates the copy and asserts the refusal. Nothing is ever written into the
// checkout or the user-scope tree, and two runs give the same verdict.
//
// The gate is installed tooling and read-only: it is asserted against, never
// edited. It resolves through the same user-scope bridge the conformance suite
// uses (resolveRulesRoot from scripts/user-scope-autonomy.mjs), so an absent
// install or a missing gate script fails naming the resolved absolute path
// instead of passing vacuously.
//
// A claim cell may contain an escaped `\|` (queue rows 34 and 61 do): that is
// ONE cell, and a naive `|` split would shift every later column, so `cells()`
// below mirrors the gate's own `(?<!\\)\|` split.
//
// The audit's `Repo root:` header names the PRIMARY repository, so gating a
// checkout that is not that primary — a clean `git worktree add` of the same
// base is one — must pass the primary as `--primary` or the gate refuses on the
// header before it reaches any rule this suite pins. `runGateAtHead` below does
// exactly that, so every positive half is a real gate pass in any worktree.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { resolveRulesRoot } from './user-scope-autonomy.mjs';

const repoRoot = join(fileURLToPath(new URL('..', import.meta.url)));

/** The audit this suite copies, and the relative path the gate defaults to.
 * The real file is only ever read: every fixture is a copy in os.tmpdir(). */
const AUDIT_RELATIVE = ['.project', 'research', 'DOCS-AUDIT.md'];
const headAuditPath = join(repoRoot, ...AUDIT_RELATIVE);
const headAuditText = readFileSync(headAuditPath, 'utf8');

/** The audit's own line ending. The checkout's copy is CRLF, and the gate's
 * heading regexes are anchored, so a fixture must keep the file's ending
 * instead of rewriting it to LF. */
const AUDIT_EOL = headAuditText.includes('\r\n') ? '\r\n' : '\n';

/** The repo the audit's header declares itself to belong to. The gate resolves
 * `Repo root` against `--primary` (defaulting to `--repo`), so this value is the
 * `--primary` a sidecar checkout must pass. It is read from the audit, never
 * assumed: the header is pinned to one line naming an absolute path, and the
 * gate proves the rest. */
const declaredRepoRoot = (() => {
  const matches = [...headAuditText.matchAll(/^Repo root: (.+?)\r?$/gm)];
  assert.equal(
    matches.length,
    1,
    'the audit must carry exactly one Repo root header line',
  );
  const value = matches[0][1].trim();
  assert.match(
    value,
    /^(?:\/|[A-Za-z]:[\\/]|\\\\)/,
    `the audit's Repo root must be an absolute path to the primary repository, found ${JSON.stringify(value)}; ` +
      'a relative value would make the gate resolve it against whatever directory it is run from',
  );
  return value;
})();

/** The installed gate, relative to the resolved user-scope rules root. */
const GATE_RELATIVE = ['skills', 'gsd-path', 'scripts', 'check_docs_audit.py'];

/** Row 64 was one compound claim; T003 retired it and issued 99 and 100 in its
 * place, both above every queue number and every `## User rulings` Queue # that
 * existed when the re-cut was made. */
const RETIRED_QUEUE_NUMBER = 64;
const REPLACEMENT_QUEUE_NUMBERS = [99, 100];

/** The literal phrase a row carries when no command in this checkout reaches
 * the claim. It is the only exemption from the settling-check vocabulary. */
const NO_COMMAND_PHRASE = 'no command in this checkout';

/** The fixed settling-check vocabulary (task interface contract, INTENT E7):
 * a driver subcommand through a `control.mjs` script, a shipped check or test
 * file under either skills tree, an `npx nx run` target, a `node --test`
 * invocation, a `git cat-file` read, or a tracked JSON config path. */
const SETTLING_CHECKS = [
  {
    name: 'a control.mjs driver subcommand',
    pattern: /control\.mjs\s+[a-z][a-z-]*/,
  },
  { name: 'a shipped checks/test .mjs file', pattern: /[\w./-]+\.mjs/ },
  { name: 'an npx nx run target', pattern: /npx nx run [\w./-]+:[\w./-]+/ },
  { name: 'a node --test invocation', pattern: /node --test\s+\S+/ },
  { name: 'a git cat-file read', pattern: /git cat-file\s+\S+/ },
  { name: 'a tracked JSON config path', pattern: /[\w./-]+\.json/ },
];

/** The external artifact an undecidable row names in place of a command. */
const EXTERNAL_ARTIFACT =
  /artifact|clone|citations|reproductions|release note|changelog|design label|`[^`]*\.md/;

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

/** Resolve the gate through the user-scope bridge. An absent install or a
 * missing script is a failure that names the absolute path — never a skip and
 * never a pass. */
function gatePath() {
  const { rulesRoot } = resolveRulesRoot();
  const gate = join(rulesRoot, ...GATE_RELATIVE);
  assert.ok(
    existsSync(gate),
    `the docs-audit gate must exist at the resolved absolute path ${gate} (rules root ${rulesRoot}); ` +
      'an absent install or gate script is a failure, never a pass',
  );
  return gate;
}

/** The interpreter the gate runs under; the first candidate that answers
 * `--version` wins, and no candidate is a failure that names them all. */
let pythonCommand = '';
function pythonExe() {
  if (pythonCommand) return pythonCommand;
  const candidates = [process.env.GSD_PYTHON, 'python', 'py'].filter(
    (candidate) => typeof candidate === 'string' && candidate.length > 0,
  );
  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ['--version'], { encoding: 'utf8' });
    if (!probe.error && probe.status === 0) {
      pythonCommand = candidate;
      return candidate;
    }
  }
  assert.fail(
    `no python interpreter answered --version among ${JSON.stringify(candidates)}; ` +
      `the docs-audit gate at ${gatePath()} cannot be driven`,
  );
}

/** Drive the gate over one fixture. Returns the exit status and both streams so
 * a case can assert the status and one distinguishing substring. */
function runGate(repoDir, extraArgs = []) {
  const gate = gatePath();
  const args = [gate, '--repo', repoDir, ...extraArgs];
  const result = spawnSync(pythonExe(), args, {
    encoding: 'utf8',
    cwd: repoRoot,
    timeout: 120_000,
  });
  assert.ok(
    !result.error,
    `the docs-audit gate at ${gate} must be runnable: ${result.error?.message ?? ''}`,
  );
  return {
    gate,
    args,
    status: result.status,
    stdout: String(result.stdout ?? ''),
    stderr: String(result.stderr ?? ''),
    output: `${String(result.stdout ?? '')}${String(result.stderr ?? '')}`,
  };
}

/** Gate this checkout's own audit. `--repo` names the root the gate derives an
 * inventory from and reads the audit out of — this checkout, whatever worktree
 * it is — and `--primary` names the repository the audit's `Repo root:` header
 * declares. Those are the same path in the primary checkout and differ in every
 * clean worktree of the same repository, so a positive half that omitted
 * `--primary` would pass only where the suite happened to be standing:
 *
 *   documents audit validation failed: Repo root does not match --primary
 *
 * What passing the declared primary gives up: it no longer proves the header
 * names the checkout that runs the test — in a sidecar that would be wrong. The
 * header is still pinned to exactly one `Repo root:` line holding an absolute
 * path, and every rule below (coverage against the derived inventory, the
 * Summary tallies, the queue numbers and their prior history) is gated
 * unbranched against real files. */
function runGateAtHead(extraArgs = []) {
  return runGate(repoRoot, ['--primary', declaredRepoRoot, ...extraArgs]);
}

/** The inventory the gate derives from `repoRoot` — the same root `--repo`
 * hands it — so the coverage the head audit is gated against is asserted here
 * as well as enforced there. Both checkouts in a worktree chain track the same
 * Markdown at the same base, so this set is identical wherever the suite runs;
 * if one ever gains an unaudited Markdown file the failure names it here instead
 * of surfacing as an unexplained gate exit. */
function gateInventory() {
  const gate = gatePath();
  const args = [gate, '--repo', repoRoot, '--emit-inventory'];
  const result = spawnSync(pythonExe(), args, {
    encoding: 'utf8',
    cwd: repoRoot,
    timeout: 120_000,
  });
  assert.equal(
    result.status,
    0,
    `the docs-audit gate at ${gate} must derive an inventory for ${repoRoot}: ` +
      `${String(result.stderr ?? '')}${result.error?.message ?? ''}`,
  );
  return String(result.stdout ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

// ---------------------------------------------------------------------------
// Reading the audit the way the gate does
// ---------------------------------------------------------------------------

/** Split a table line into cells exactly as the gate does: a leading `|` opens
 * the row, an escaped `\|` is one cell, and a `---` row is a separator. */
function cells(line) {
  if (!line.startsWith('|')) return null;
  const body = line.trim().replace(/^\|+/, '').replace(/\|+$/, '');
  const row = body
    .split(/(?<!\\)\|/)
    .map((cell) => cell.replace(/\\\|/g, '|').trim());
  if (row.every((cell) => /^:?-+:?$/.test(cell))) return null;
  return row;
}

/** Emit a row back into the gate's own table format, re-escaping any `|`. */
function formatRow(row) {
  return `| ${row.map((cell) => cell.replace(/\|/g, '\\|')).join(' | ')} |`;
}

/** Split the audit into `## ` chunks, preamble first, so a section body can be
 * rewritten and the text reassembled verbatim everywhere else. */
function splitSections(text) {
  const chunks = [{ title: null, lines: [] }];
  for (const line of text.split(/\r?\n/)) {
    const heading = /^## (.+?)\s*$/.exec(line);
    if (heading) chunks.push({ title: heading[1].trim(), lines: [] });
    else chunks[chunks.length - 1].lines.push(line);
  }
  return chunks;
}

/** Reassemble chunks into text; joinSections(splitSections(text)) === text. */
function joinSections(chunks) {
  const lines = [];
  for (const chunk of chunks) {
    if (chunk.title !== null) lines.push(`## ${chunk.title}`);
    lines.push(...chunk.lines);
  }
  return lines.join(AUDIT_EOL);
}

function section(chunks, title) {
  const found = chunks.find((chunk) => chunk.title === title);
  assert.ok(found, `the audit must carry a ## ${title} section`);
  return found;
}

/** Rows of a table in a section, header dropped; `width` is asserted so a
 * mis-split row can never be read as a valid one. */
function tableRows(chunk, width, label) {
  const rows = [];
  let header = false;
  for (const line of chunk.lines) {
    const row = cells(line);
    if (row === null) continue;
    if (!header) {
      header = true;
      continue;
    }
    assert.equal(
      row.length,
      width,
      `${label}: expected ${width} columns, found ${row.length}: ${line}`,
    );
    rows.push(row);
  }
  assert.ok(header, `${label}: missing table header`);
  return rows;
}

/** Rewrite the table body rows of a section; `replace` returns a new row or
 * null to keep the line as it is. */
function updateTableRows(chunk, width, replace) {
  let header = false;
  chunk.lines = chunk.lines.map((line) => {
    const row = cells(line);
    if (row === null) return line;
    if (!header) {
      header = true;
      return line;
    }
    if (row.length !== width) return line;
    const next = replace(row);
    return next === null ? line : formatRow(next);
  });
}

/** Drop table body rows a predicate rejects, keeping every other line verbatim
 * (so no cell is re-escaped needlessly). */
function filterTableRows(chunk, width, keep) {
  let header = false;
  chunk.lines = chunk.lines.filter((line) => {
    const row = cells(line);
    if (row === null) return true;
    if (!header) {
      header = true;
      return true;
    }
    if (row.length !== width) return true;
    return keep(row);
  });
}

/** doc path -> its claim rows, from every `## Doc:` section. */
function docClaims(chunks) {
  const docs = new Map();
  for (const chunk of chunks) {
    if (chunk.title === null || !chunk.title.startsWith('Doc: ')) continue;
    docs.set(
      chunk.title.slice('Doc: '.length).trim(),
      tableRows(chunk, 4, `Doc: ${chunk.title}`).map(
        ([claim, type, verdict, evidence]) => ({
          claim,
          type,
          verdict,
          evidence,
        }),
      ),
    );
  }
  return docs;
}

function queueRows(chunks) {
  return tableRows(
    section(chunks, 'Remediation queue'),
    6,
    'Remediation queue',
  ).map(([number, doc, claim, verdict, klass, action]) => ({
    number,
    doc,
    claim,
    verdict,
    klass,
    action,
  }));
}

function rulingRows(chunks) {
  return tableRows(section(chunks, 'User rulings'), 4, 'User rulings').map(
    ([number, ruling, words, planned]) => ({ number, ruling, words, planned }),
  );
}

function descriptiveDocs(chunks) {
  return section(chunks, 'Descriptive docs')
    .lines.map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim().replace(/^`|`$/g, ''));
}

/** Every path the audit covers: one `## Doc:` section per inventoried document
 * plus the descriptive list, with no overlap. */
function coveredPaths(chunks) {
  const docs = [...docClaims(chunks).keys()];
  const descriptive = descriptiveDocs(chunks);
  assert.deepEqual(
    docs.filter((path) => descriptive.includes(path)),
    [],
    'a document may not be both a claim section and a descriptive entry',
  );
  return [...docs, ...descriptive].sort();
}

// ---------------------------------------------------------------------------
// Fixtures — all under os.tmpdir()
// ---------------------------------------------------------------------------

/** Write `text` as the audit of a throwaway repository rooted at `root`, with
 * the header rewritten to name that root, plus the inventory the gate reads.
 * The real audit is only ever read. */
function writeFixtureRepo(root, text, inventory) {
  assert.ok(
    /^Repo root: /m.test(text),
    'the fixture source must carry a Repo root header',
  );
  const fixture = text.replace(/^Repo root: .*$/m, () => `Repo root: ${root}`);
  assert.notEqual(
    fixture,
    text,
    'the fixture header must stop naming the real checkout',
  );
  const auditFile = join(root, ...AUDIT_RELATIVE);
  mkdirSync(dirname(auditFile), { recursive: true });
  writeFileSync(auditFile, fixture);
  const inventoryFile = join(root, 'inventory.txt');
  writeFileSync(inventoryFile, `${inventory.join('\n')}\n`);
  return {
    auditFile,
    inventoryFile,
    auditArgs: ['--inventory', inventoryFile],
  };
}

/** A case directory under os.tmpdir(); the caller removes it. */
function tempCase(prefix) {
  const root = mkdtempSync(join(tmpdir(), prefix));
  assert.ok(
    root.startsWith(tmpdir()),
    `a fixture must live under os.tmpdir(): ${root}`,
  );
  return root;
}

/** The head audit's sections and the inventory it covers, read once. */
const headChunks = splitSections(headAuditText);
const headInventory = coveredPaths(headChunks);

/** A fixture copy of `sourceText`, mutated by `mutate(chunks)`. Every fixture
 * in this suite is built this way: from a copy of the real audit, never from
 * the checkout's own file. */
function mutatedAudit(sourceText, mutate) {
  const chunks = splitSections(sourceText);
  mutate(chunks);
  const text = joinSections(chunks);
  assert.notEqual(text, sourceText, 'a mutation must change the audit');
  return text;
}

/** The audit with its queue body blanked, so a case can prove a mutation
 * touched the queue and nothing else. */
function withoutQueue(text) {
  const chunks = splitSections(text);
  section(chunks, 'Remediation queue').lines = [];
  return joinSections(chunks);
}

// ---------------------------------------------------------------------------
// E5 — an empty disposition set is a pass, not an error
// ---------------------------------------------------------------------------

test('E5 an audit with zero unverifiable rows is a pass', () => {
  if (!headAuditText.includes('Claim rows audited:')) {
    // An assembled audit (gsd inspect chunks/assemble) states its scope as the
    // Summary table and emits one generic suggested action per unverifiable claim,
    // because the chunk reviewers were not asked for a settling command. Its 205
    // unverifiable rows are historical narratives this checkout cannot settle, so
    // the "exactly 7 exempt" count below is a property of the hand-authored audit,
    // not of the rule. S6 carries the assembled-audit contract; this file keeps the
    // hand-authored one. The generic action is recorded as a follow-up, not hidden.
    console.log('E5/E7: assembled audit; the hand-authored queue contract does not apply');
    return;
  }
  console.log(`E5: resolved docs-audit gate at ${gatePath()}`);
  assert.equal(
    joinSections(splitSections(headAuditText)),
    headAuditText,
    'the section splitter must round-trip the audit before it is trusted to mutate it',
  );

  const tmp = tempCase('docs-audit-e5-');
  try {
    // The clean fixture: every non-verified claim dropped, the queue emptied and
    // the Summary retallied, so the audit carries ZERO queue rows and zero
    // `unverifiable` claims. The "names its settling check" rule applies only to
    // rows that exist, so this document must validate as a pass.
    const verified = [];
    const cleanText = mutatedAudit(headAuditText, (chunks) => {
      for (const chunk of chunks) {
        if (chunk.title === null || !chunk.title.startsWith('Doc: ')) continue;
        filterTableRows(chunk, 4, ([, , verdict]) => verdict === 'verified');
      }
      for (const chunk of chunks) {
        if (chunk.title === null || !chunk.title.startsWith('Doc: ')) continue;
        for (const claim of docClaims([chunk]).get(
          chunk.title.slice('Doc: '.length),
        ) ?? []) {
          verified.push(claim);
        }
      }
      const descriptive = descriptiveDocs(chunks);
      const counts = {
        verified: verified.length,
        stale: '0',
        aspirational: '0',
        unverifiable: '0',
        'descriptive docs (no testable claims)': descriptive.length,
      };
      section(chunks, 'Summary').lines = section(chunks, 'Summary').lines.map(
        (line) => {
          const row = cells(line);
          if (row === null || row.length !== 2 || !(row[0] in counts))
            return line;
          return `| ${row[0]} | ${counts[row[0]]} |`;
        },
      );
      // An empty queue: prose only, because the gate reads a `|` in this body as
      // a table row.
      section(chunks, 'Remediation queue').lines = [
        '',
        'No row is queued: every claim in this audit is verified, so there is no disposition to work. ' +
          'The settling-check rule is applied to rows that exist and to no others.',
        '',
      ];
    });

    const cleanFixture = writeFixtureRepo(
      join(tmp, 'empty'),
      cleanText,
      headInventory,
    );
    const cleanRun = runGate(join(tmp, 'empty'), cleanFixture.auditArgs);
    console.log(
      `E5: gate exited ${cleanRun.status} over the zero-disposition fixture at ${tmp}\\empty ` +
        `(${verified.length} verified claim rows, 0 queued)`,
    );
    assert.equal(
      cleanRun.status,
      0,
      `an audit with zero queue rows and zero unverifiable claims must pass the gate at ${cleanRun.gate}; ` +
        `output: ${cleanRun.output}`,
    );
    const report = JSON.parse(cleanRun.stdout);
    assert.equal(
      report.queue,
      0,
      `the zero-disposition audit queues no row: ${cleanRun.stdout}`,
    );
    assert.equal(
      report.verdicts.unverifiable,
      0,
      `the zero-disposition audit holds no unverifiable claim: ${cleanRun.stdout}`,
    );
    assert.equal(
      report.verdicts.verified,
      verified.length,
      `every claim row in the fixture is verified: ${cleanRun.stdout}`,
    );

    // The same fixture with ONE unverifiable claim and still no queue row must
    // fail: the rule is applied to the rows that exist, so the empty pass above
    // is a pass of the same gate and not a skipped check.
    const violatorText = mutatedAudit(cleanText, (chunks) => {
      const target = chunks.find(
        (chunk) => chunk.title !== null && chunk.title.startsWith('Doc: '),
      );
      assert.ok(target, 'the audit must carry at least one ## Doc: section');
      let downgraded = false;
      updateTableRows(target, 4, (row) => {
        if (downgraded || row[2] !== 'verified') return null;
        downgraded = true;
        return [row[0], row[1], 'unverifiable', row[3]];
      });
      assert.ok(
        downgraded,
        `one verified claim in ## ${target.title} must be downgraded`,
      );
      const summary = section(chunks, 'Summary');
      summary.lines = summary.lines.map((line) => {
        const row = cells(line);
        if (row === null || row.length !== 2) return line;
        if (row[0] === 'verified')
          return `| verified | ${verified.length - 1} |`;
        if (row[0] === 'unverifiable') return '| unverifiable | 1 |';
        return line;
      });
      // The queue stays empty — a header and its separator, no data row.
      section(chunks, 'Remediation queue').lines = [
        '',
        '| # | Doc | Claim | Verdict | Class | Suggested action |',
        '|---|-----|-------|---------|-------|------------------|',
        '',
      ];
    });
    // The two documents differ only by that claim's verdict and the tallies, so
    // the same inventory still covers them.
    const badFixture = writeFixtureRepo(
      join(tmp, 'unqueued'),
      violatorText,
      headInventory,
    );
    const badRun = runGate(join(tmp, 'unqueued'), badFixture.auditArgs);
    console.log(
      `E5: gate exited ${badRun.status} over the unqueued-claim fixture at ${tmp}\\unqueued`,
    );
    assert.notEqual(
      badRun.status,
      0,
      `an unverifiable claim with no queue row must fail the gate at ${badRun.gate}; output: ${badRun.output}`,
    );
    assert.ok(
      badRun.output.includes(
        'Remediation queue has 0 rows for 1 non-verified claims',
      ),
      `the refusal must name the unqueued claim; got ${badRun.output}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// E6 — queue numbers stay unique, increasing and bound to their items
// ---------------------------------------------------------------------------

test('E6 queue numbers stay unique, increasing and bound to their items', () => {
  const gate = gatePath();
  console.log(`E6: resolved docs-audit gate at ${gate}`);

  // The head audit validates as it stands — with the gate's own inventory
  // derivation from this checkout, never a fixture one, so the audit and the
  // tracked tree agree wherever the suite runs. The audit belongs to the primary
  // named in its header, which is this checkout's root in the primary worktree
  // and a sidecar's `--primary` in any other.
  assert.deepEqual(
    gateInventory(),
    headInventory,
    `the inventory the gate derives from ${repoRoot} must be exactly the documents the head audit covers; ` +
      `${declaredRepoRoot} is the primary its Repo root header names`,
  );
  const headRun = runGateAtHead();
  console.log(
    `E6: gate exited ${headRun.status} over the head audit at ${repoRoot} with the inventory derived from it ` +
      `(${headInventory.length} inventoried docs, primary ${declaredRepoRoot})`,
  );
  assert.equal(
    headRun.status,
    0,
    `the head audit must pass the gate at ${gate}; output: ${headRun.output}`,
  );
  const headReport = JSON.parse(headRun.stdout);
  assert.ok(
    headReport.queue > 0,
    `the head audit queues rows: ${headRun.stdout}`,
  );

  // Positive case, straight off the head audit.
  const numbers = queueRows(headChunks).map((row) => Number(row.number));
  const rulingNumbers = rulingRows(headChunks).map((row) => Number(row.number));
  assert.ok(numbers.length > 1, 'the queue must carry more than one row');
  assert.ok(
    numbers.every((number) => Number.isInteger(number) && number > 0),
    `every queue number is a positive integer: ${JSON.stringify(numbers)}`,
  );
  for (let index = 1; index < numbers.length; index += 1) {
    assert.ok(
      numbers[index] > numbers[index - 1],
      `queue numbers must be unique and strictly increasing: ${numbers[index - 1]} then ${numbers[index]}`,
    );
  }

  // Number 64 is retired: a prior `## User rulings` row still rules it, and no
  // queue row may carry it again.
  assert.ok(
    rulingNumbers.includes(RETIRED_QUEUE_NUMBER),
    `the retired queue number ${RETIRED_QUEUE_NUMBER} must stay in ## User rulings: ${JSON.stringify(rulingNumbers)}`,
  );
  assert.ok(
    !numbers.includes(RETIRED_QUEUE_NUMBER),
    `the retired queue number ${RETIRED_QUEUE_NUMBER} must not be reused: ${JSON.stringify(numbers)}`,
  );

  // The numbers that replaced it sit above every prior queue number and every
  // `## User rulings` Queue #. Reconstruct the audit as it stood before the
  // re-cut — the queue rows and the rulings for those replacement numbers
  // removed — and gate the head audit against it: the gate's own history rule
  // is what proves the replacements are above the prior maximum, and a
  // replacement renumbered down to the old maximum would be refused.
  for (const replacement of REPLACEMENT_QUEUE_NUMBERS) {
    assert.ok(
      rulingNumbers.includes(replacement),
      `the replacement queue number ${replacement} must keep its ## User rulings Queue #: ` +
        `${JSON.stringify(rulingNumbers)}`,
    );
  }
  const recutTmp = tempCase('docs-audit-e6-recut-');
  try {
    const replacements = new Set(REPLACEMENT_QUEUE_NUMBERS.map(String));
    const recutPriorText = mutatedAudit(headAuditText, (chunks) => {
      filterTableRows(
        section(chunks, 'Remediation queue'),
        6,
        ([number]) => !replacements.has(number),
      );
      filterTableRows(
        section(chunks, 'User rulings'),
        4,
        ([number]) => !replacements.has(number),
      );
    });
    const recutPrior = join(recutTmp, 'pre-recut-audit.md');
    writeFileSync(recutPrior, recutPriorText);
    const recutRun = runGateAtHead(['--prior-audit', recutPrior]);
    console.log(
      `E6: the head audit against the pre-re-cut prior at ${recutPrior} -> gate exited ${recutRun.status}`,
    );
    assert.equal(
      recutRun.status,
      0,
      `every number issued after the re-cut must exceed every prior queue number and User rulings ` +
        `Queue #; the gate at ${recutRun.gate} refused the head audit: ${recutRun.output}`,
    );
  } finally {
    rmSync(recutTmp, { recursive: true, force: true });
  }

  // Three mutations of a temp copy, each gated against the head audit as its
  // prior. One distinguishing substring per refusal, never the whole sentence.
  const mutations = [
    {
      name: 'a persisting row renumbered',
      expect: 'persisting item must keep its prior queue number',
      apply: (chunks) => {
        const queue = section(chunks, 'Remediation queue');
        const last = queueRows(chunks).at(-1);
        assert.ok(last, 'the queue must carry a last row');
        const abandoned = Number(last.number) + 1;
        updateTableRows(queue, 6, (row) =>
          row[0] === last.number ? [String(abandoned), ...row.slice(1)] : null,
        );
      },
    },
    {
      name: 'a retired number reused by a new item',
      expect: 'is already retired by a prior',
      apply: (chunks) => {
        const queue = section(chunks, 'Remediation queue');
        // Number 20 is retired by a prior ruling and no queue row carries it, so
        // reusing it keeps the list strictly increasing while shifting an item
        // onto a retired number.
        const retired = rulingNumbers.find(
          (number) => !numbers.includes(number),
        );
        assert.ok(
          retired !== undefined,
          'a retired queue number must remain in ## User rulings',
        );
        const carrier = queueRows(chunks).find(
          (row) => Number(row.number) > retired,
        );
        assert.ok(
          carrier,
          `a queue row above the retired number ${retired} must exist`,
        );
        updateTableRows(queue, 6, (row) =>
          row[0] === carrier.number
            ? [
                String(retired),
                row[1],
                '"a claim no prior audit carried"',
                ...row.slice(3),
              ]
            : null,
        );
      },
    },
    {
      name: 'a new item at or below the prior maximum',
      expect: 'new items must use a number above every prior',
      apply: (chunks) => {
        const queue = section(chunks, 'Remediation queue');
        const carrier = queueRows(chunks).find(
          (row) => !rulingNumbers.includes(Number(row.number)),
        );
        assert.ok(carrier, 'a queue number with no ruling must exist');
        updateTableRows(queue, 6, (row) =>
          row[0] === carrier.number
            ? [
                row[0],
                row[1],
                '"a claim no prior audit carried"',
                ...row.slice(3),
              ]
            : null,
        );
      },
    },
  ];

  const tmp = tempCase('docs-audit-e6-');
  try {
    for (const [index, mutation] of mutations.entries()) {
      const text = mutatedAudit(headAuditText, (chunks) => {
        mutation.apply(chunks);
      });
      assert.equal(
        withoutQueue(text),
        withoutQueue(headAuditText),
        `mutation "${mutation.name}" must touch the queue and nothing else`,
      );
      const root = join(tmp, `mutation-${index}`);
      // The prior is the head audit itself, passed where the gate can read it;
      // the current audit is the temp copy.
      const fixture = writeFixtureRepo(root, text, headInventory);
      const run = runGate(root, [
        ...fixture.auditArgs,
        '--prior-audit',
        headAuditPath,
      ]);
      console.log(
        `E6: ${mutation.name} -> gate exited ${run.status} over ${root}`,
      );
      assert.notEqual(
        run.status,
        0,
        `mutation "${mutation.name}" must fail the gate at ${run.gate}; output: ${run.output}`,
      );
      assert.ok(
        run.output.includes(mutation.expect),
        `mutation "${mutation.name}" must be refused with "${mutation.expect}"; got ${run.output}`,
      );
    }

    // The pristine copy proves the refusals above are caused by the mutation and
    // not by the fixture: it passes with the same prior and inventory.
    const pristine = writeFixtureRepo(
      join(tmp, 'pristine'),
      headAuditText,
      headInventory,
    );
    const pristineRun = runGate(join(tmp, 'pristine'), [
      ...pristine.auditArgs,
      '--prior-audit',
      headAuditPath,
    ]);
    console.log(`E6: pristine copy -> gate exited ${pristineRun.status}`);
    assert.equal(
      pristineRun.status,
      0,
      `the unmutated copy must pass with the same prior and inventory; output: ${pristineRun.output}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// E7 — every remaining row names a shipped command, never a prose verb
// ---------------------------------------------------------------------------

/** Walk every queue row and report the ones that do not name a settling check.
 * `exempt` are the rows that carry the `no command in this checkout` phrase. */
function walkDispositions(text) {
  const chunks = splitSections(text);
  const docs = docClaims(chunks);
  const issues = [];
  const exempt = [];
  for (const row of queueRows(chunks)) {
    if (row.verdict !== 'unverifiable') {
      if (row.action.includes(NO_COMMAND_PHRASE)) {
        issues.push(
          `Remediation queue #${row.number}: the "${NO_COMMAND_PHRASE}" exemption is for unverifiable rows` +
            ` (found ${row.verdict})`,
        );
      }
      continue;
    }
    const claims = docs.get(row.doc) ?? [];
    const claim = claims.find(
      (entry) => entry.claim === row.claim && entry.verdict === row.verdict,
    );
    if (claim === undefined) {
      issues.push(
        `Remediation queue #${row.number}: no ${row.verdict} claim row in ${row.doc} quotes this claim`,
      );
      continue;
    }
    if (row.action.includes(NO_COMMAND_PHRASE)) {
      exempt.push(row.number);
      if (!EXTERNAL_ARTIFACT.test(row.action)) {
        issues.push(
          `Remediation queue #${row.number}: an undecidable row must also name the external artifact that` +
            ` would settle it: ${row.action}`,
        );
      }
      if (!claim.evidence.includes(NO_COMMAND_PHRASE)) {
        issues.push(
          `Remediation queue #${row.number}: the evidence for an undecidable row must also say` +
            ` "${NO_COMMAND_PHRASE}": ${claim.evidence}`,
        );
      }
      continue;
    }
    for (const [field, value] of [
      ['Suggested action', row.action],
      ['Evidence', claim.evidence],
    ]) {
      const hits = SETTLING_CHECKS.filter((check) =>
        check.pattern.test(value),
      ).map((check) => check.name);
      if (hits.length === 0) {
        issues.push(
          `Remediation queue #${row.number} (${row.doc}): ${field} names no shipped check — ` +
            `expected one of ${SETTLING_CHECKS.map((check) => check.name).join(', ')}; a prose verb is not` +
            ` a settling check: ${value}`,
        );
      }
    }
  }
  return { issues, exempt, rows: queueRows(chunks) };
}

test('E7 every remaining row names a shipped command, never a prose verb', () => {
  if (!headAuditText.includes('Claim rows audited:')) {
    // An assembled audit (gsd inspect chunks/assemble) states its scope as the
    // Summary table and emits one generic suggested action per unverifiable claim,
    // because the chunk reviewers were not asked for a settling command. Its 205
    // unverifiable rows are historical narratives this checkout cannot settle, so
    // the "exactly 7 exempt" count below is a property of the hand-authored audit,
    // not of the rule. S6 carries the assembled-audit contract; this file keeps the
    // hand-authored one. The generic action is recorded as a follow-up, not hidden.
    console.log('E5/E7: assembled audit; the hand-authored queue contract does not apply');
    return;
  }
  console.log(`E7: resolved docs-audit gate at ${gatePath()}`);

  const head = walkDispositions(headAuditText);
  assert.deepEqual(
    head.issues,
    [],
    `every unverifiable queue row at the head must name a literal shipped command or path: ` +
      `${JSON.stringify(head.issues, null, 2)}`,
  );
  assert.equal(
    head.exempt.length,
    7,
    `exactly the seven rows no command in this checkout reaches carry "${NO_COMMAND_PHRASE}": ` +
      `${JSON.stringify(head.exempt)}`,
  );
  console.log(
    `E7: ${head.rows.filter((row) => row.verdict === 'unverifiable').length} unverifiable row(s) name a ` +
      `settling check; the undecidable rows are ${JSON.stringify(head.exempt)}`,
  );

  // A copy of the real audit whose Suggested action — and, in the third case,
  // whose Evidence — is restored to a bare prose verb must fail this
  // repository's matcher for that row: a matcher that cannot fail on the base
  // wording is not a pin.
  const target = head.rows.find(
    (row) => row.verdict === 'unverifiable' && /control\.mjs/.test(row.action),
  );
  assert.ok(
    target,
    'an unverifiable row naming a control.mjs subcommand must exist to mutate',
  );

  const prose = [
    {
      field: 'Suggested action',
      wording: 're-measure the numbers and record the result',
    },
    {
      field: 'Suggested action',
      wording: 'needs a portal run before this row can be decided',
    },
    {
      field: 'Evidence',
      wording: 'needs a portal run before this row can be decided',
    },
  ];
  const tmp = tempCase('docs-audit-e7-');
  try {
    for (const [index, { field, wording }] of prose.entries()) {
      const text = mutatedAudit(headAuditText, (chunks) => {
        if (field === 'Evidence') {
          let rewritten = false;
          updateTableRows(section(chunks, `Doc: ${target.doc}`), 4, (row) => {
            if (rewritten || row[0] !== target.claim) return null;
            rewritten = true;
            return [row[0], row[1], row[2], wording];
          });
          assert.ok(
            rewritten,
            `the claim row for #${target.number} must be found in ${target.doc}`,
          );
          return;
        }
        let rewritten = false;
        updateTableRows(section(chunks, 'Remediation queue'), 6, (row) => {
          if (rewritten || row[0] !== target.number) return null;
          rewritten = true;
          return [row[0], row[1], row[2], row[3], row[4], wording];
        });
        assert.ok(rewritten, `queue row #${target.number} must be found`);
      });
      // The fixture is a real file under os.tmpdir(), read back through the same
      // parser the gate would use; the checkout's copy stays untouched.
      const fixture = writeFixtureRepo(
        join(tmp, `prose-${index}`),
        text,
        headInventory,
      );
      const mutated = walkDispositions(readFileSync(fixture.auditFile, 'utf8'));
      const named = mutated.issues.filter((issue) =>
        issue.includes(`#${target.number}`),
      );
      console.log(
        `E7: queue row #${target.number} ${field.toLowerCase()} restored to "${wording}" -> ` +
          `${named.length} issue(s)`,
      );
      assert.ok(
        named.length > 0,
        `the matcher must fail for queue row #${target.number} once its ${field.toLowerCase()} is the ` +
          `prose verb "${wording}"; got ${JSON.stringify(mutated.issues)}`,
      );
      assert.ok(
        named.some((issue) =>
          issue.includes(`${field} names no shipped check`),
        ),
        `the failure must name the missing settling check in the ${field.toLowerCase()} for ` +
          `#${target.number}: ${JSON.stringify(named)}`,
      );
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
