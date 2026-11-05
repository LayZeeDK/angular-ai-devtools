// @ts-check
// Shape and pin suite for the owner-directed autonomy analysis — M017 T007.
//
// `docs/autonomy-gaps.md` narrates one run: what stopped M017, what changed in
// the installed user-scope material, and what proves it. A document like that
// rots in two ways — a section loses a field, or a `Pin:` cites a case title the
// suite no longer has — and neither reads as a defect in prose. This suite is
// the guard, in the shape scripts/docs-correction.test.mjs already uses for
// document claims: every case reads the document or the audit, and a failure
// names the file, the section and the field.
//
// Two halves:
//   S1-S6  the shape: the scope note and the closing section, ten `## Gap — `
//          sections each carrying the five fixed fields, every `Pin:` resolving
//          to a case title the named test file defines, every `Verified:` either
//          an exit status with an output tail or a `not-run` with its reason, no
//          model route slug, e-mail address or web domain, and the docs audit
//          listing the document as descriptive with the tally agreeing.
//   G1-G9  the pins the document cites: named tokens in the installed
//          orchestrator prompt and autonomy playbook (token, never wording), the
//          mechanism behind the interpreter-visible-path rule, and the recorded
//          chromium reading that survives an install-free checkout.
//
// The user-scope documents live outside this checkout and are read through the
// same bridge the conformance suite uses (`resolveRulesRoot` from
// scripts/user-scope-autonomy.mjs), so an absent install or a missing file fails
// naming the resolved absolute path instead of passing vacuously. Nothing here
// writes into the user-scope tree or leaves a file in the checkout.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { resolveRulesRoot } from './user-scope-autonomy.mjs';

const repoRoot = join(fileURLToPath(new URL('..', import.meta.url)));
const DOC_PATH = join(repoRoot, 'docs', 'autonomy-gaps.md');
const AUDIT_PATH = join(repoRoot, '.project', 'research', 'DOCS-AUDIT.md');
const CORRECTION_SUITE = join('scripts', 'docs-correction.test.mjs');

/** The installed orchestrator prompt, split into segments under the resolved
 * rules root. The prompt's file name is the route-named one the install ships;
 * the document itself never spells it, so no route slug reaches the analysis. */
const PROMPT_FILE = [
  'prompts',
  'deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md',
];

/** The installed autonomy playbook: the reference the orchestrator prompt's
 * Resume map tells the orchestrator to load before rerunning a helper. */
const PLAYBOOK_FILE = ['references', 'gsd-path-autonomy-playbook.md'];

/** The five fixed fields every `## Gap — ` section carries, in order. */
const FIELDS = [
  'Met:',
  'User-scope change:',
  'Pin:',
  'Verified:',
  'Remaining:',
];

/** How many gaps M017 recorded first-hand. A new gap is a deliberate edit here
 * as well as in the document, so the count cannot drift silently. */
const GAP_COUNT = 10;

/** Resolve one installed file; an absent install or file is a failure that
 * names the absolute path, never a skip. */
function rulesFile(segments) {
  const root = resolveRulesRoot().rulesRoot;
  const file = join(root, ...segments);
  assert.ok(
    existsSync(file),
    `the user-scope file must exist at the resolved absolute path ${file} (rules root ${root}); ` +
      'an absent install or a removed document is a failure, never a pass',
  );
  return file;
}

/** Assert every named token is present in the resolved absolute file and print
 * the path that was read, so a green run names what it looked at. The file text
 * is whitespace-normalised first: a prose document wraps its lines, and a pin
 * must match the rule's token, never the width of the paragraph it sits in. */
function assertTokens(id, segments, tokens) {
  const file = rulesFile(segments);
  const text = readFileSync(file, 'utf8').replace(/\s+/g, ' ');
  for (const token of tokens) {
    assert.ok(
      text.includes(token),
      `${id} ${file} must contain "${token}"; the rule this repository pins was removed or ` +
        'reworded past its token, so the pin is red rather than quietly passing',
    );
  }
  console.log(`${id} pin: read ${file} (${tokens.length} token(s))`);
  return file;
}

// ---------------------------------------------------------------------------
// G1-G7 — the installed prompt and playbook carry the rule the gap produced
// ---------------------------------------------------------------------------

test('G1 prompt pin: the orchestrator prompt forbids reading %ERRORLEVEL% and names the helper JSON and $LASTEXITCODE', () => {
  assertTokens('G1', PROMPT_FILE, [
    'Read helper JSON from a file, never from `%ERRORLEVEL%`',
    '`$LASTEXITCODE` read immediately after the call',
    'expanded when the whole line is parsed',
  ]);
});

test('G2 prompt pin: the orchestrator prompt names the milestone event and the pre-authorized approval transition', () => {
  assertTokens('G2', PROMPT_FILE, [
    '`milestone intent approved`',
    'illegal STATE.milestone transition',
    '`pre-authorized approval: intent`',
  ]);
});

test('G3 prompt pin: the orchestrator prompt states the DOCS-AUDIT ruling numbering and the escaped pipe trap', () => {
  assertTokens('G3', PROMPT_FILE, [
    "whose `Queue #` equals that row's own `#`",
    'a claim containing an escaped `\\|`',
    'is one cell to the helper',
  ]);
});

test('G4 prompt pin: the orchestrator prompt forbids wrapping a RESEARCH question and names the refusal', () => {
  assertTokens('G4', PROMPT_FILE, [
    'matched one line at a time, so never wrap it',
    'question assignments do not match the intent source',
  ]);
});

test('G5 prompt pin: the orchestrator prompt states the research evidence H1, dimension, question, confidence and BOM rules', () => {
  assertTokens('G5', PROMPT_FILE, [
    '`# Evidence — <dimension>`',
    '`Dimension: custom (<slug>)`',
    '`Questions assigned:`',
    'on `Confidence:`',
    'no UTF-8 BOM before the H1',
  ]);
});

test('G6 prompt pin: the orchestrator prompt limits a prohibition criterion of all to the dismissed row', () => {
  assertTokens('G6', PROMPT_FILE, [
    'A prohibition whose Criterion cell is `all` is legal only on the single dismissed row',
    'Prohibitions N3 criterion all must be dismissed',
    'point it at the SCn it actually protects',
  ]);
});

test('G7 playbook pin: the playbook records the duplicated section heading and the one-replacement rewrite', () => {
  assertTokens('G7', PLAYBOOK_FILE, [
    'Duplicating a section heading',
    '`section_body` matches the first and returns an empty body',
    're-run the gate afterwards',
  ]);
});

// ---------------------------------------------------------------------------
// G8 — the mechanism behind the interpreter-visible-path rule
// ---------------------------------------------------------------------------

test('G8 Verify pin: a shell variable is not interpreter-visible while an absolute path is', () => {
  const tmp = mkdtempSync(join(tmpdir(), 'autonomy-gaps-g8-'));
  try {
    const absolute = join(tmp, 'probe.txt');
    writeFileSync(absolute, 'probe\n');

    /** Hand one argument to a child interpreter with no shell, the way the
     * authoritative isolate hands a Verify command to its interpreter, and
     * report whether the child sees the file plus the literal text it received. */
    const probe = (argument) => {
      const res = spawnSync(
        process.execPath,
        [
          '-e',
          "process.stdout.write(JSON.stringify([process.argv[1], require('node:fs').existsSync(process.argv[1])]))",
          argument,
        ],
        { encoding: 'utf8' },
      );
      assert.equal(
        res.status,
        0,
        `the probe interpreter must exit 0 for ${argument}: ${res.stderr}`,
      );
      const [received, exists] = JSON.parse(res.stdout);
      return { received, exists };
    };

    const visible = probe(absolute);
    assert.equal(
      visible.exists,
      true,
      `an absolute path must be visible to the interpreter: ${absolute}`,
    );

    for (const variable of ['%USERPROFILE%\\probe.txt', '$HOME/probe.txt']) {
      const result = probe(variable);
      assert.equal(
        result.received,
        variable,
        `the interpreter must receive ${variable} as literal text; a shell would have expanded it`,
      );
      assert.equal(
        result.exists,
        false,
        `${variable} must not resolve inside ${tmp}: with no shell the path is resolved relative to the ` +
          'working directory, so the file the command names is never reached',
      );
    }
    console.log(
      `G8 probe: ${absolute} was visible to ${process.execPath}; %USERPROFILE% and $HOME arrived literally ` +
        'and resolved to nothing, which is the failure an absolute Verify path avoids',
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// G9 — the recorded reading that survives a checkout with no install
// ---------------------------------------------------------------------------

test('G9 static pin: the chromium reading survives a checkout with no playwright install', () => {
  const file = join(repoRoot, CORRECTION_SUITE);
  assert.ok(existsSync(file), `the correction suite must exist at ${file}`);
  const text = readFileSync(file, 'utf8').replace(/\s+/g, ' ');
  for (const token of [
    'RECORDED_CHROMIUM',
    'no such install in this worktree',
    'this checkout does not carry that install',
  ]) {
    assert.ok(
      text.includes(token),
      `${file} must contain "${token}"; without the recorded reading and its absent-install branch the ` +
        'case cannot pass in a clean sidecar that carries no node_modules',
    );
  }
  console.log(
    `G9 static: read ${file} — the recorded reading and its absent-install branch are present`,
  );
});

// ---------------------------------------------------------------------------
// Reading the document
// ---------------------------------------------------------------------------

function docText() {
  assert.ok(
    existsSync(DOC_PATH),
    `the analysis document must exist at ${DOC_PATH}; this suite pins its shape and cannot pass without it`,
  );
  return readFileSync(DOC_PATH, 'utf8');
}

/** Split a Markdown file into `## ` chunks, preamble first. */
function splitSections(text) {
  const chunks = [{ title: null, lines: [] }];
  for (const line of text.split(/\r?\n/)) {
    const heading = /^## (.+?)\s*$/.exec(line);
    if (heading) chunks.push({ title: heading[1].trim(), lines: [] });
    else chunks[chunks.length - 1].lines.push(line);
  }
  return chunks;
}

function gapSections(chunks) {
  return chunks.filter(
    (chunk) => chunk.title !== null && chunk.title.startsWith('Gap — '),
  );
}

/** One field of a gap section: exactly one line, and a non-empty value. */
function field(section, label) {
  const hits = section.lines.filter((line) => line.startsWith(label));
  assert.equal(
    hits.length,
    1,
    `## ${section.title} must carry exactly one "${label}" line, found ${hits.length}: ` +
      `${JSON.stringify(section.lines.filter((line) => line.trim().length > 0).slice(0, 8))}`,
  );
  const value = hits[0].slice(label.length).trim();
  assert.ok(
    value.length > 0,
    `## ${section.title} "${label}" must carry a value, found an empty one`,
  );
  return value;
}

// ---------------------------------------------------------------------------
// S1 — the scope note and the closing section
// ---------------------------------------------------------------------------

test('S1 shape: the document carries the scope note and the closing section', () => {
  const chunks = splitSections(docText());
  const preamble = chunks[0].lines.join('\n');
  for (const token of [
    'M017',
    'only the gaps this milestone',
    'outside this checkout',
    'the pin, not the fix',
  ]) {
    assert.ok(
      preamble.includes(token),
      `the scope note must state "${token}"; the preamble is what tells the next orchestrator what this ` +
        'document covers and where the fix lives',
    );
  }

  const closing = chunks.find(
    (chunk) => chunk.title === 'What this document does not prove',
  );
  assert.ok(
    closing,
    'the document must close with a `## What this document does not prove` section: ' +
      `${JSON.stringify(chunks.map((chunk) => chunk.title).filter(Boolean))}`,
  );
  const body = closing.lines.join('\n');
  for (const token of [
    'no run',
    'not a behavioural verification',
    'no user-scope change',
    'no model name',
    'no domain',
  ]) {
    assert.ok(
      body.includes(token),
      `the closing section must state "${token}"`,
    );
  }
  console.log(
    `S1 shape: scope note and closing section present; ${gapSections(chunks).length} gap section(s)`,
  );
});

// ---------------------------------------------------------------------------
// S2 — ten gap sections, each with the five fields
// ---------------------------------------------------------------------------

test('S2 shape: every gap section carries the five fields with non-empty values', () => {
  const gaps = gapSections(splitSections(docText()));
  assert.equal(
    gaps.length,
    GAP_COUNT,
    `the document must record exactly ${GAP_COUNT} gaps this milestone met: ` +
      `${JSON.stringify(gaps.map((gap) => gap.title))}`,
  );
  const titles = gaps.map((gap) => gap.title);
  assert.equal(
    new Set(titles).size,
    titles.length,
    `gap titles must be unique: ${JSON.stringify(titles)}`,
  );
  for (const gap of gaps) {
    for (const label of FIELDS) field(gap, label);
  }
  console.log(
    `S2 shape: ${gaps.length} gap section(s), each with ${FIELDS.length} non-empty fields`,
  );
});

// ---------------------------------------------------------------------------
// S3 — every Pin resolves to a case title its file defines
// ---------------------------------------------------------------------------

/** One citation: a repository-relative file, a rule id and a case title. */
const CITATION = /^`([^`]+)` rule `([^`]+)` — `([^`]+)`$/;

test('S3 shape: every Pin names a test file, a rule id and a case title that file defines', () => {
  const gaps = gapSections(splitSections(docText()));
  let citations = 0;
  for (const gap of gaps) {
    const value = field(gap, 'Pin:');
    for (const part of value.split(' ; ')) {
      const match = CITATION.exec(part.trim());
      assert.ok(
        match,
        `## ${gap.title} "Pin:" citation must read \`<file>\` rule \`<id>\` — \`<case title>\`, found ` +
          `${JSON.stringify(part)}`,
      );
      const [, relative, ruleId, title] = match;
      const file = join(repoRoot, relative);
      assert.ok(
        existsSync(file),
        `## ${gap.title} "Pin:" names ${relative}, which does not exist at ${file}`,
      );
      const text = readFileSync(file, 'utf8');
      assert.ok(
        new RegExp(`^${ruleId}\\b`).test(title),
        `## ${gap.title} "Pin:" rule id ${ruleId} must be the case title's own id, found ${JSON.stringify(title)}`,
      );
      assert.ok(
        text.includes(`test('${title}'`),
        `## ${gap.title} "Pin:" names the case ${JSON.stringify(title)}, which ${relative} does not define: ` +
          'a cited title that does not exist is a defect, not an empty pass',
      );
      assert.ok(
        text.includes(ruleId),
        `## ${gap.title} "Pin:" rule id ${ruleId} must appear in ${relative}`,
      );
      citations += 1;
    }
  }
  console.log(
    `S3 shape: ${citations} pin citation(s) across ${gaps.length} gap section(s) all resolve`,
  );
});

// ---------------------------------------------------------------------------
// S4 — every Verified is a run with an exit status and a tail, or a reasoned not-run
// ---------------------------------------------------------------------------

test('S4 shape: every Verified carries an exit status with a tail or a reasoned not-run', () => {
  const gaps = gapSections(splitSections(docText()));
  const RAN = /^`[^`]+` exit [0-9]+ — \S[\s\S]{9,}$/;
  const NOT_RUN = /^not-run — \S[\s\S]{14,}$/;
  for (const gap of gaps) {
    const value = field(gap, 'Verified:');
    const ran = RAN.test(value);
    const notRun = NOT_RUN.test(value);
    assert.ok(
      ran || notRun,
      `## ${gap.title} "Verified:" must be \`<command>\` exit <status> — <output tail> or ` +
        `not-run — <reason>; found ${JSON.stringify(value)}`,
    );
    if (notRun) {
      assert.ok(
        !value.includes('exit 0'),
        `## ${gap.title} "Verified:" reads not-run and may not also claim a run`,
      );
    }
  }
  const ranCount = gaps.filter((gap) =>
    RAN.test(field(gap, 'Verified:')),
  ).length;
  console.log(
    `S4 shape: ${ranCount} gap(s) carry a run with its exit status, ${gaps.length - ranCount} read not-run`,
  );
});

// ---------------------------------------------------------------------------
// S5 — no model route slug, e-mail address or web domain
// ---------------------------------------------------------------------------

test('S5 shape: the document names no model route slug, e-mail address or web domain', () => {
  const text = docText();
  const forbidden = [
    {
      name: 'a model route slug',
      pattern: /(?:^|[^\w-])(?:paid|free)-[a-z0-9]/i,
    },
    { name: 'a web URL', pattern: /https?:\/\//i },
    { name: 'a web host prefix', pattern: /\bwww\./i },
    { name: 'an e-mail address', pattern: /\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b/i },
    {
      name: 'a model family name',
      pattern:
        /\b(?:deepseek|glm|qwen|llama|gemini|claude|gpt|laguna|ling|ornith|minimax|poolside|beam|glyph|phi)\b/i,
    },
  ];
  for (const { name, pattern } of forbidden) {
    const hit = pattern.exec(text);
    assert.equal(
      hit,
      null,
      `${DOC_PATH} must not name ${name}: found ${JSON.stringify(hit?.[0])} in ` +
        `${JSON.stringify(text.slice(Math.max(0, (hit?.index ?? 0) - 60), (hit?.index ?? 0) + 60))}`,
    );
  }
  console.log(
    'S5 shape: no route slug, URL, e-mail address or model family name in the document',
  );
});

// ---------------------------------------------------------------------------
// S6 — the docs audit lists the document as descriptive and the tally agrees
// ---------------------------------------------------------------------------

test('S6 shape: the audit lists the document as descriptive and the tally agrees', () => {
  assert.ok(
    existsSync(AUDIT_PATH),
    `the docs audit must exist at ${AUDIT_PATH}`,
  );
  const audit = readFileSync(AUDIT_PATH, 'utf8');
  const chunks = splitSections(audit);

  const descriptive = chunks.find(
    (chunk) => chunk.title === 'Descriptive docs',
  );
  assert.ok(
    descriptive,
    `the audit must carry a \`## Descriptive docs\` section at ${AUDIT_PATH}`,
  );
  const entries = descriptive.lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim());
  assert.ok(
    entries.includes('docs/autonomy-gaps.md'),
    `the audit's descriptive list must name docs/autonomy-gaps.md; it narrates one run and the pins that ` +
      `guard it rather than asserting repository behaviour, so it is descriptive and not a claim section: ` +
      `${JSON.stringify(entries)}`,
  );
  assert.ok(
    !chunks.some((chunk) => chunk.title === 'Doc: docs/autonomy-gaps.md'),
    'the document must not also carry a ## Doc: claim section: it asserts no repository claim of its own',
  );

  const summary = chunks.find((chunk) => chunk.title === 'Summary');
  assert.ok(summary, 'the audit must carry a ## Summary section');
  const rows = new Map();
  for (const line of summary.lines) {
    const cells = /^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/.exec(line.trim());
    if (cells === null) continue;
    rows.set(cells[1], cells[2]);
  }
  const tally = Number(rows.get('descriptive docs (no testable claims)'));
  assert.equal(
    tally,
    entries.length,
    `the Summary's descriptive tally must equal the number of descriptive entries: ` +
      `${rows.get('descriptive docs (no testable claims)')} versus ${entries.length}`,
  );

  const claimDocs = chunks.filter(
    (chunk) => chunk.title !== null && chunk.title.startsWith('Doc: '),
  ).length;
  const flat = audit.replace(/\s+/g, ' ');
  const prose =
    /Claim rows audited: (\d+) across (\d+) documents; with the (\d+) descriptive documents, the (\d+) frozen inventory paths/.exec(
      flat,
    );
  assert.ok(
    prose,
    'the audit must state its claim rows, its document count and its frozen inventory total',
  );
  assert.equal(
    Number(prose[2]),
    claimDocs,
    `the audit states ${prose[2]} documents but carries ${claimDocs} claim sections`,
  );
  assert.equal(
    Number(prose[3]),
    entries.length,
    `the audit states ${prose[3]} descriptive documents but lists ${entries.length}`,
  );
  assert.equal(
    Number(prose[4]),
    claimDocs + entries.length,
    `the frozen inventory total must be the claim sections plus the descriptive list: ${prose[4]} versus ` +
      `${claimDocs + entries.length}`,
  );
  console.log(
    `S6 shape: audit lists docs/autonomy-gaps.md as descriptive; tally ${tally}, claim sections ${claimDocs}, ` +
      `frozen inventory ${prose[4]}`,
  );
});
