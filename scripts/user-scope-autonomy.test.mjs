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
  existsSync,
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

import {
  HELPER_PINS,
  RULES,
  check,
  checkHelpers,
  resolvePinPaths,
  resolveRulesRoot,
  runGsdTests,
  runPinProbe,
} from './user-scope-autonomy.mjs';

const repoRoot = join(fileURLToPath(new URL('..', import.meta.url)));

const RULE_FILES = [
  'AGENTS.md',
  join('prompts', 'deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md'),
  join('references', 'gsd-path-skill-roster.md'),
  join('references', 'prompting-glyph-cluster.md'),
  join('references', 'gsd-path-orchestrator.md'),
];

/** The skill-owned helper scripts under the rules root; a pin's probe script and
 * the two python pins' static files live here. */
const SKILL_SCRIPTS_REL = join('skills', 'gsd-path', 'scripts');

/** Copy the rules files plus scripts/gsd (minus node_modules) into a temp
 * install shaped like the real one: <tmp>/.commandcode/{AGENTS.md, prompts,
 * references, scripts/gsd}. The skill-owned helper scripts are copied too, so a
 * check over the copy resolves every helper pin's script the way the real
 * install does. Returns the fixture install root. */
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
  const skillScripts = join(rulesRoot, SKILL_SCRIPTS_REL);
  if (existsSync(skillScripts)) {
    const dstSkills = join(dst, SKILL_SCRIPTS_REL);
    mkdirSync(dstSkills, { recursive: true });
    for (const e of readdirSync(skillScripts, { withFileTypes: true })) {
      if (e.isDirectory()) continue;
      cpSync(join(skillScripts, e.name), join(dstSkills, e.name));
    }
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

// ---------------------------------------------------------------------------
// Helper-regression pins — M017 T001
//
// One pin per installed-helper defect the M016 run worked around by hand:
// brief-check's paid effort ladder, plan-lint's `path::test_name` Held-out
// cell, check_handoffs' Intent-coverage row, and the serial retry's parkable
// `pending` state. Each case asserts a named token in the resolved absolute
// file (token, never wording) and then runs the public subcommand the pin
// declares. Nothing here spawns the installed helper suite a third time.
// ---------------------------------------------------------------------------

/** Find a pin row by id; a missing row is a defect, not an empty pass. */
function pin(id) {
  const row = HELPER_PINS.find((entry) => entry.id === id);
  assert.ok(row, `HELPER_PINS must declare ${id}: ${JSON.stringify(HELPER_PINS.map((p) => p.id))}`);
  return row;
}

/** Assert every declared token is present in the pin's resolved absolute file
 * and print the path that was read, so a green run names what it looked at. */
function assertPinTokens(row) {
  const paths = resolvePinPaths(row);
  assert.ok(
    existsSync(paths.file),
    `${row.id} static file must exist at ${paths.file} (probe script ${paths.script})`,
  );
  const text = readFileSync(paths.file, 'utf8');
  for (const token of row.tokens) {
    assert.ok(
      text.includes(token),
      `${row.id} ${row.name}: ${paths.file} must contain "${token}"`,
    );
  }
  console.log(
    `${row.id} static: read ${paths.file} (${row.tokens.length} token(s)); probe script ${paths.script}`,
  );
  return paths;
}

/** Write the `.project` tree both public plan subcommands answer over: STATE.md
 * at plan/active, a one-criterion INTENT.md, one wave in PLAN.md and one task
 * file whose Held-out Test cell is a `::` node id. `options.coverageRow`
 * replaces the readable Intent-coverage row; `options.phase` and
 * `options.taskMeta` shape STATE.md and the task frontmatter. */
function writeProjectFixture(root, options = {}) {
  const phase = options.phase ?? 'plan';
  const coverageRow = options.coverageRow ?? '| SC1 | T001 | AC1 |';
  const meta = {
    agent: 'null',
    base: 'null',
    worktree: 'null',
    task_branch: 'null',
    ...(options.taskMeta ?? {}),
  };
  const write = (rel, lines) => {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, `${lines.join('\n')}\n`);
  };
  write(join('.project', 'STATE.md'), [
    '---',
    'pipeline: gsd-path/v2',
    'project: fixture',
    'milestone: m001',
    `phase: ${phase}`,
    'status: active',
    'branch: gsd-path/M001',
    'archive: null',
    'integration_default: direct',
    'integration: direct',
    'integration_source: default',
    '---',
    '',
    '# State',
    '',
    '## Log',
    '',
    '- created by the user-scope-autonomy fixture',
  ]);
  write(join('.project', 'intent', 'INTENT.md'), [
    '# Intent — fixture',
    '',
    'Lane: milestone',
    '',
    'Surfaces: none',
    '',
    '## Summary',
    '',
    'A fixture intent with one criterion.',
    '',
    '## Success criteria',
    '',
    '1. The fixture plans.',
    '',
    '## Edge coverage',
    '',
    '| Edge | Criterion | Category | Disposition | Detail |',
    '|------|-----------|----------|-------------|--------|',
    '| E1 | SC1 | encoding | held-out | pinned by the fixture test |',
    '',
    '## Prohibitions',
    '',
    '| Prohibition | Criterion | Must not | Disposition | Detail |',
    '|-------------|-----------|----------|-------------|--------|',
    '| N1 | SC1 | pass vacuously | judgment | read the run |',
  ]);
  write(join('.project', 'plan', 'PLAN.md'), [
    '# Plan — fixture',
    '',
    'Project verify: node --test fixtures/project-verify.test.mjs',
    '',
    '## Config',
    '',
    '- review_panel: off',
    '- finding_skeptics: off',
    '- max_review_cycles: 1',
    '',
    '## Wave 1 — fixture wave',
    '',
    'Goal: prove the fixture plans',
    '',
    'Review depth: full',
    '',
    '- T001 — fixture task',
    '',
    '## Held-out checks',
    '',
    '| Edge | Task | Test |',
    '|------|------|------|',
    '| E1 | T001 | scripts/plan-lint-fixture.test.mjs::the held out case |',
    '',
    '## Intent coverage',
    '',
    '| Criterion | Task | Acceptance |',
    '|-----------|------|------------|',
    coverageRow,
  ]);
  write(join('.project', 'tasks', 'T001-fixture.md'), [
    '---',
    'id: T001',
    'title: fixture task',
    'wave: 1',
    'status: pending',
    `agent: ${meta.agent}`,
    `base: ${meta.base}`,
    `worktree: ${meta.worktree}`,
    `task_branch: ${meta.task_branch}`,
    'deps: []',
    'files:',
    '  - scripts/plan-lint-fixture.test.mjs',
    '---',
    '',
    '# T001 — fixture task',
    '',
    '## Context',
    '',
    'The fixture task pins one held-out case.',
    '',
    '## Approach',
    '',
    'Run the fixture test.',
    '',
    '## Interface contract',
    '',
    'None.',
    '',
    '## Intent coverage',
    '',
    '- SC1',
    '',
    '## Acceptance criteria',
    '',
    '1. The held-out E1 case is pinned.',
    '',
    '## Verify',
    '',
    '```bash',
    'node --experimental-strip-types --test scripts/plan-lint-fixture.test.mjs',
    '```',
    '',
    '## Log',
    '',
    '- created by the user-scope-autonomy fixture',
  ]);
  return root;
}

/** Write a task file plus a subagent brief; `route` is the only part that
 * differs between the two directions of the brief-check pin. */
function writeBriefFixture(root, route) {
  mkdirSync(root, { recursive: true });
  const taskFile = join(root, 'T001-brief-fixture.md');
  const briefFile = join(root, 'brief.md');
  writeFileSync(
    taskFile,
    [
      '---',
      'id: T001',
      'title: brief fixture task',
      'wave: 1',
      'status: pending',
      'deps: []',
      'files:',
      '  - scripts/brief-fixture.mjs',
      '---',
      '',
      '# T001 — brief fixture task',
      '',
      '## Verify',
      '',
      '```bash',
      'node --experimental-strip-types --test scripts/brief-fixture.mjs',
      '```',
      '',
    ].join('\n'),
  );
  writeFileSync(
    briefFile,
    [
      'Fixture subagent brief for T001.',
      '',
      'Read scripts/brief-fixture.mjs and change nothing else.',
      '',
      'The task Verify is:',
      'node --experimental-strip-types --test scripts/brief-fixture.mjs',
      '',
      `Route: ${route}`,
      '',
      'Finish with exactly one tail line:',
      'RESULT: ready',
      'or',
      'RESULT: blocked',
      '',
    ].join('\n'),
  );
  return { taskFile, briefFile };
}

/** Create a temp git repository on the branch STATE.md binds, so build_state's
 * primary-worktree checks have something real to read. */
function initReadyRepo() {
  const root = mkdtempSync(join(tmpdir(), 'usa-ready-'));
  const git = (...args) =>
    spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  const init = git('init', '-b', 'gsd-path/M001');
  assert.equal(init.status, 0, `git init must succeed in ${root}: ${init.stderr}`);
  const commit = (...extra) =>
    git(
      '-c',
      'user.email=fixture@example.invalid',
      '-c',
      'user.name=fixture',
      'commit',
      '-m',
      'fixture',
      ...extra,
    );
  writeProjectFixture(root, { phase: 'build' });
  assert.equal(git('add', '-A').status, 0, `git add must succeed in ${root}`);
  const first = commit();
  assert.equal(first.status, 0, `git commit must succeed in ${root}: ${first.stderr}`);
  const head = git('rev-parse', 'HEAD').stdout.trim();
  return { root, git, commit, head };
}

test('P1 brief-check pin: a paid route yields no missing-effort warning and a bare brief yields it', () => {
  const row = pin('P1');
  const paths = assertPinTokens(row);
  const tmp = mkdtempSync(join(tmpdir(), 'usa-pin-p1-'));
  try {
    const paid = writeBriefFixture(join(tmp, 'paid'), 'paid-glm-5-3-flash');
    mkdirSync(dirname(paid.taskFile), { recursive: true });
    const bare = writeBriefFixture(join(tmp, 'bare'), 'a route that is not on the ladder');

    const runBrief = (fixture) =>
      runPinProbe(row, undefined, [
        '--repo',
        tmp,
        '--task-file',
        fixture.taskFile,
        '--brief',
        fixture.briefFile,
      ]);

    const withPaid = runBrief(paid);
    console.log(`P1 probe: ${withPaid.script} exited ${withPaid.status} (run 1: paid route)`);
    const paidResult = JSON.parse(withPaid.stdout);
    assert.ok(
      !paidResult.warnings.some((w) => w.includes('missing effort ladder mention')),
      `a brief carrying a paid route must not warn about the effort ladder: ${JSON.stringify(paidResult.warnings)}`,
    );

    const withoutPaid = runBrief(bare);
    console.log(`P1 probe: ${withoutPaid.script} exited ${withoutPaid.status} (run 2: no route token)`);
    const bareResult = JSON.parse(withoutPaid.stdout);
    assert.ok(
      bareResult.warnings.some((w) => w.includes('missing effort ladder mention')),
      `a brief carrying no route token must warn about the effort ladder: ${JSON.stringify(bareResult.warnings)}`,
    );
    for (const token of row.tokens) {
      assert.ok(
        readFileSync(paths.file, 'utf8').includes(token),
        `${paths.file} must carry the paid route token "${token}"`,
      );
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('P2 plan-lint pin: a :: held-out Test cell yields ok and no held-out finding', () => {
  const row = pin('P2');
  assertPinTokens(row);
  const tmp = mkdtempSync(join(tmpdir(), 'usa-pin-p2-'));
  try {
    const repo = writeProjectFixture(tmp);
    const result = runPinProbe(row, undefined, ['--repo', repo]);
    console.log(`P2 probe: ${result.script} exited ${result.status} over ${repo}`);
    assert.equal(
      result.status,
      0,
      `plan-lint must exit 0 over ${repo}; stderr: ${result.stderr}`,
    );
    const report = JSON.parse(result.stdout);
    assert.equal(
      report.ok,
      true,
      `plan-lint must report ok over ${repo}: ${JSON.stringify(report.summary)}`,
    );
    const heldOut = (report.findings ?? []).filter(
      (f) => f.check === 'held-out-test' || f.check === 'held-out-verify',
    );
    assert.deepEqual(
      heldOut,
      [],
      `a "::" Held-out Test cell must not be a held-out finding over ${repo}: ${JSON.stringify(heldOut)}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('P3 check_handoffs pin: a readable coverage row exits 0 and a three-cell row is unreadable', () => {
  const row = pin('P3');
  assertPinTokens(row);
  const tmp = mkdtempSync(join(tmpdir(), 'usa-pin-p3-'));
  try {
    const readable = writeProjectFixture(join(tmp, 'readable'));
    const ok = runPinProbe(row, undefined, ['--repo', readable]);
    console.log(`P3 probe: ${ok.script} exited ${ok.status} over ${readable}`);
    assert.equal(
      ok.status,
      0,
      `check_handoffs plan must exit 0 over ${readable}; stderr: ${ok.stderr}`,
    );
    assert.ok(
      ok.stdout.includes('SC1'),
      `the readable fixture must list the criterion it owns: ${ok.stdout}`,
    );

    const threeCell = writeProjectFixture(join(tmp, 'three-cell'), {
      coverageRow: '| SC1 | T001 | AC1, AC2 |',
    });
    const bad = runPinProbe(row, undefined, ['--repo', threeCell]);
    const badOutput = `${bad.stdout}${bad.stderr}`;
    console.log(`P3 probe: ${bad.script} exited ${bad.status} over ${threeCell}`);
    assert.notEqual(bad.status, 0, `a three-cell coverage row must fail over ${threeCell}`);
    assert.ok(
      badOutput.includes('Intent coverage row is unreadable'),
      `the run must print the unreadable-row reason; got ${badOutput}`,
    );
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails', () => {
  const row = pin('P4');
  assertPinTokens(row);
  const { root, git, commit, head } = initReadyRepo();
  try {
    const parked = runPinProbe(row, undefined, ['--repo', root]);
    console.log(`P4 probe: ${parked.script} exited ${parked.status} over ${root} (parked task)`);
    assert.equal(
      parked.status,
      0,
      `a parked serial task must be ready over ${root}; stderr: ${parked.stderr}`,
    );
    const ready = JSON.parse(parked.stdout);
    const listed = (ready.ready ?? []).find((task) => task.id === 'T001');
    assert.ok(
      listed,
      `the parked serial task must be listed as ready over ${root}: ${parked.stdout}`,
    );
    assert.equal(listed.status, 'pending', `a parked serial task is pending: ${listed.status}`);

    // The same task file, now retaining every dispatch-metadata field a rejected
    // attempt would leave behind: `ready` must refuse it, never pass it.
    writeProjectFixture(root, {
      phase: 'build',
      taskMeta: {
        agent: 'build_T001',
        base: head,
        worktree: root,
        task_branch: 'gsd-path-task/T001',
      },
    });
    assert.equal(git('add', '-A').status, 0, `git add must succeed in ${root}`);
    const rewrite = commit();
    assert.equal(rewrite.status, 0, `git commit must succeed in ${root}: ${rewrite.stderr}`);

    const retained = runPinProbe(row, undefined, ['--repo', root]);
    console.log(
      `P4 probe: ${retained.script} exited ${retained.status} over ${root} (metadata retained)`,
    );
    assert.notEqual(retained.status, 0, `a pending task retaining metadata must fail over ${root}`);
    const refused = JSON.parse(retained.stdout);
    assert.equal(
      refused.error?.code,
      'invalid-task-state',
      `the refusal must be an invalid-task-state over ${root}: ${retained.stdout}`,
    );
    assert.match(
      String(refused.error?.message ?? ''),
      /T001: pending task retains dispatch metadata/,
      `the refusal must name the task and the retained metadata: ${retained.stdout}`,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('E1 helper pin: a removed token fails naming the absolute file and the rule id, and a reworded copy passes', () => {
  for (const row of HELPER_PINS) {
    const { tmp, installRoot } = makeFixtureInstall();
    try {
      const target = resolvePinPaths(row, installRoot).file;
      const original = readFileSync(target, 'utf8');

      assert.deepEqual(
        checkHelpers(installRoot),
        [],
        `fixture before mutation should be clean: ${JSON.stringify(checkHelpers(installRoot))}`,
      );

      // Remove EVERY occurrence of the pin's first token -> fails naming file+rule.
      const token = row.tokens[0];
      writeFileSync(target, removeToken(original, token));
      const removed = checkHelpers(installRoot);
      const removedHit = removed.find(
        (i) => i.rule === row.id && i.file === target && i.reason.includes(`"${token}"`),
      );
      assert.ok(
        removedHit,
        `removing "${token}" from ${target} must fail that file+rule; got ${JSON.stringify(removed)}`,
      );

      // Reword around the token, token kept -> no issue for that rule+file.
      writeFileSync(target, rewordAroundToken(original, token));
      const reworded = checkHelpers(installRoot);
      const rewordedHit = reworded.find((i) => i.rule === row.id && i.file === target);
      assert.ok(
        !rewordedHit,
        `rewording around "${token}" in ${target} must still pass; got ${JSON.stringify(reworded)}`,
      );
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  }
});

test('E2 helper pin: an absent install or helper dir fails naming the resolved absolute path', () => {
  const empty = mkdtempSync(join(tmpdir(), 'usa-pin-empty-'));
  try {
    const issues = checkHelpers(empty);
    assert.ok(issues.length > 0, 'an absent install must not pass with zero assertions');
    for (const row of HELPER_PINS) {
      const expected = resolvePinPaths(row, empty).file;
      const hit = issues.find((i) => i.rule === row.id && i.file === expected);
      assert.ok(
        hit,
        `an absent install must fail naming ${expected} under ${row.id}: ${JSON.stringify(issues)}`,
      );
    }
    assert.ok(check(empty).length > 0, 'check() must never exit zero over an absent install');
    console.log(
      `E2 absent install: resolved ${resolveRulesRoot(empty).rulesRoot}; named ${JSON.stringify([
        ...new Set(issues.map((i) => i.file)),
      ])}`,
    );
  } finally {
    rmSync(empty, { recursive: true, force: true });
  }

  const { tmp, installRoot } = makeFixtureInstall();
  try {
    const row = pin('P2');
    const paths = resolvePinPaths(row, installRoot);
    rmSync(paths.gsdDir, { recursive: true, force: true });
    const issues = checkHelpers(installRoot);
    assert.ok(issues.length > 0, 'an absent helper dir must not pass with zero assertions');
    const named = issues.find(
      (i) => i.rule === row.id && i.file === paths.script && String(i.reason).includes(paths.script),
    );
    assert.ok(
      named,
      `an absent helper dir must fail naming ${paths.script}: ${JSON.stringify(issues)}`,
    );
    console.log(`E2 absent helper dir: ${paths.script} named by ${row.id}`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});

test('E3 helper pin: two runs agree and write nothing into the checkout', () => {
  const git = () =>
    spawnSync('git', ['status', '--porcelain'], { encoding: 'utf8', cwd: repoRoot }).stdout;
  const before = git();
  const firstCheck = check();
  const secondCheck = check();
  assert.deepEqual(firstCheck, secondCheck, 'two pin runs must yield the same issue list');

  const tmp = mkdtempSync(join(tmpdir(), 'usa-pin-e3-'));
  try {
    assert.ok(tmp.startsWith(tmpdir()), `the fixture must live under os.tmpdir(): ${tmp}`);
    const repo = writeProjectFixture(tmp);
    const row = pin('P2');
    const first = runPinProbe(row, undefined, ['--repo', repo]);
    const second = runPinProbe(row, undefined, ['--repo', repo]);
    console.log(`E3 probe: ${first.script} exited ${first.status} then ${second.status} over ${repo}`);
    assert.equal(first.status, second.status, 'two consecutive probe runs must exit alike');
    assert.equal(first.stdout, second.stdout, 'two consecutive probe runs must report alike');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  const after = git();
  assert.equal(after, before, 'the pins must leave git status --porcelain unchanged');
});
