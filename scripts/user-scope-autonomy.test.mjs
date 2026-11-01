// @ts-check
// Conformance tests for the installed user-scope autonomy rules (~/.commandcode).
// Every fixture lives in os.tmpdir() and is removed; nothing is written into
// the user-scope tree or this checkout. The copied-suite fixture skips
// node_modules: the injected failing test needs no third-party modules and
// gsd.ts --help runs without them.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { RULES, check, resolveRulesRoot, runGsdTests } from './user-scope-autonomy.mjs';

const repoRoot = join(fileURLToPath(new URL('..', import.meta.url)));

const RULE_FILES = [
  'AGENTS.md',
  join('prompts', 'deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md'),
  join('references', 'gsd-path-skill-roster.md'),
  join('references', 'prompting-glyph-cluster.md'),
  join('references', 'gsd-path-orchestrator.md'),
];

/** Copy the rules files plus scripts/gsd (minus node_modules) into a temp
 * install shaped like the real one: <tmp>/.commandcode/{AGENTS.md, prompts,
 * references, scripts/gsd}. Returns the fixture install root. */
function makeFixtureInstall() {
  const { rulesRoot, gsdDir } = resolveRulesRoot();
  assert.ok(readdirSync(join(gsdDir, 'test')).length > 0, 'source gsd test dir must not be empty');
  const tmp = mkdtempSync(join(tmpdir(), 'usa-fixture-'));
  const dst = join(tmp, '.commandcode');
  for (const rel of RULE_FILES) {
    const src = join(rulesRoot, rel);
    const out = join(dst, rel);
    mkdirSync(dirname(out), { recursive: true });
    cpSync(src, out);
  }
  mkdirSync(join(dst, 'scripts'), { recursive: true });
  const dstGsd = join(dst, 'scripts', 'gsd');
  for (const e of readdirSync(gsdDir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    if (e.isDirectory()) cpSync(join(gsdDir, e.name), join(dstGsd, e.name), { recursive: true });
    else cpSync(join(gsdDir, e.name), join(dstGsd, e.name));
  }
  return { tmp, installRoot: tmp };
}

/** Remove EVERY occurrence of a token (split/join), never just the first. */
function removeToken(content, token) {
  return content.split(token).join('');
}

/** Reword around the token while keeping the token itself. */
function rewordAroundToken(content, token) {
  return content.split(token).join(`${token} (wording around the rule changed, token kept)`);
}

test('E1: an absent install fails naming the resolved directory, never vacuously', () => {
  const empty = mkdtempSync(join(tmpdir(), 'usa-empty-'));
  try {
    const issues = check(empty);
    assert.ok(issues.length > 0, 'must not pass with zero assertions');
    const named = issues.some(
      (i) => String(i.file).includes(empty) || String(i.reason).includes(empty),
    );
    assert.ok(named, `issues must name the resolved directory ${empty}: ${JSON.stringify(issues)}`);
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }
});

test('health: check() on the real resolved install reports no issues', () => {
  const { rulesRoot } = resolveRulesRoot();
  const issues = check();
  assert.deepEqual(
    issues,
    [],
    `real install at ${rulesRoot} must satisfy all five rules: ${JSON.stringify(issues, null, 2)}`,
  );
});

test('health: the real installed helper suite exits 0', () => {
  const { rulesRoot } = resolveRulesRoot();
  const res = runGsdTests(rulesRoot);
  assert.ok(res.files.length > 0, `must enumerate test files under ${res.gsdDir}`);
  assert.equal(
    res.status,
    0,
    `helper suite at ${res.gsdDir} exited ${res.status}; failing: ${res.failing.join(', ')}`,
  );
});

test('E2: a copied suite with one injected failing test exits non-zero naming that test', () => {
  const { gsdDir } = resolveRulesRoot();
  const tmp = mkdtempSync(join(tmpdir(), 'usa-e2-'));
  try {
    const dstGsd = join(tmp, 'gsd');
    mkdirSync(dstGsd, { recursive: true });
    for (const e of readdirSync(gsdDir, { withFileTypes: true })) {
      if (e.name === 'node_modules') continue;
      if (e.isDirectory()) cpSync(join(gsdDir, e.name), join(dstGsd, e.name), { recursive: true });
      else cpSync(join(gsdDir, e.name), join(dstGsd, e.name));
    }
    writeFileSync(
      join(dstGsd, 'test', 'usa-injected-fail.test.ts'),
      [
        "import { test } from 'node:test';",
        "import assert from 'node:assert/strict';",
        "test('usa-injected-fail', () => { assert.equal(1, 2); });",
        '',
      ].join('\n'),
    );
    const res = runGsdTests(dstGsd);
    assert.notEqual(res.status, 0, 'a suite holding a failing test must exit non-zero');
    const output = res.stdout + res.stderr;
    assert.match(
      output,
      /usa-injected-fail/,
      `the run must name the failing test; status ${res.status}`,
    );
    assert.ok(
      res.failing.some((f) => f.includes('usa-injected-fail')),
      `failing names must include the injected test: ${JSON.stringify(res.failing)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('E4: removing a rule token fails naming that file; rewording with the token kept passes', () => {
  // One row per rule: the file whose copy is mutated and the token that must
  // gate it. Token-vs-wording only — no sentence is quoted.
  const rows = [
    { rule: 'R1', rel: 'AGENTS.md', token: 'preapprove' },
    { rule: 'R2', rel: 'AGENTS.md', token: 'handoff --apply' },
    {
      rule: 'R3',
      rel: join('prompts', 'deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md'),
      token: 'zero-token run',
    },
    { rule: 'R4', rel: join('references', 'gsd-path-skill-roster.md'), token: 'Add-Content' },
    {
      rule: 'R4',
      rel: join('references', 'prompting-glyph-cluster.md'),
      token: 'byte-length proof',
    },
    { rule: 'R5', rel: join('references', 'gsd-path-orchestrator.md'), token: 'fragment-fix' },
  ];
  const abs = (root, rel) => join(root, '.commandcode', rel);

  for (const row of rows) {
    const { tmp, installRoot } = makeFixtureInstall();
    try {
      const filePath = abs(installRoot, row.rel);
      const original = readFileSync(filePath, 'utf8');

      // The pristine fixture itself must be green.
      assert.deepEqual(
        check(installRoot),
        [],
        `fixture before mutation should be clean: ${JSON.stringify(check(installRoot))}`,
      );

      // Remove EVERY occurrence of the token -> fails naming that file.
      writeFileSync(filePath, removeToken(original, row.token));
      const removed = check(installRoot);
      const removedHit = removed.find(
        (i) => i.rule === row.rule && i.file === filePath && i.reason.includes(`"${row.token}"`),
      );
      assert.ok(
        removedHit,
        `removing "${row.token}" from ${filePath} must fail that file+rule; got ${JSON.stringify(removed)}`,
      );

      // Reword around the token, token kept -> no issue for that rule+file.
      writeFileSync(filePath, rewordAroundToken(original, row.token));
      const reworded = check(installRoot);
      const rewordedHit = reworded.find((i) => i.rule === row.rule && i.file === filePath);
      assert.ok(
        !rewordedHit,
        `rewording around "${row.token}" in ${filePath} must still pass; got ${JSON.stringify(reworded)}`,
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
});

test('E5: a rules file holding none of the five rules is reported per file and rule', () => {
  const { rulesRoot, gsdDir } = resolveRulesRoot();
  const tmp = mkdtempSync(join(tmpdir(), 'usa-e5-'));
  try {
    const dst = join(tmp, '.commandcode');
    for (const rel of RULE_FILES) {
      mkdirSync(dirname(join(dst, rel)), { recursive: true });
      writeFileSync(join(dst, rel), '# no rules here\n');
    }
    mkdirSync(join(dst, 'scripts'), { recursive: true });
    cpSync(gsdDir, join(dst, 'scripts', 'gsd'), {
      recursive: true,
      filter: (src) => !src.includes('node_modules'),
    });
    const issues = check(tmp);
    assert.ok(issues.length > 0, 'an install with no rules must not pass');
    for (const rule of RULES) {
      const hit = issues.find(
        (i) => i.rule === rule.id && i.file.startsWith(dst) && i.reason.includes('does not contain'),
      );
      assert.ok(
        hit,
        `rule ${rule.id} (${rule.name}) must be reported naming its file: ${JSON.stringify(issues)}`,
      );
    }
    assert.ok(
      issues.every((i) => resolveRulesRoot(tmp).rulesRoot !== rulesRoot),
      'fixture issues must name fixture paths, never the real install',
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('E3: repeated runs give the same verdict and write nothing into the checkout', () => {
  const git = () =>
    spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8', cwd: repoRoot }).stdout;
  const before = git();
  const first = check();
  const second = check();
  assert.deepEqual(first, second, 'two runs must yield the same verdict');
  const after = git();
  assert.equal(after, before, 'a run must leave git status --porcelain unchanged');
});
