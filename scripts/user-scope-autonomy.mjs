// @ts-check
// Conformance helpers for the installed user-scope autonomy rules (~/.commandcode).
//
// Resolution: scripts/run-user-scope-tests.mjs exports resolveScanDir(), which
// returns the user-scope SCRIPTS directory (<home>/.commandcode/scripts). The
// rules documents live one level UP, in the rules root (<home>/.commandcode),
// so every rules path is derived from the parent of the resolved scripts dir.
//
// The suite matches named tokens and helper behaviour only — never a
// sentence's wording — and every failure entry names the absolute file (or
// helper) and the rule id.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { resolveScanDir } from './run-user-scope-tests.mjs';

/** The five autonomy rules, each matched by named tokens in its rules file(s)
 * plus (where one exists) the helper command that implements it. */
export const RULES = [
  {
    id: 'R1',
    name: 'milestone-scoped pre-approval',
    helper: 'preapprove',
    fileTokens: [{ file: ['AGENTS.md'], tokens: ['preapprove'] }],
  },
  {
    id: 'R2',
    name: 'handoff bases the next branch at the remote default',
    helper: 'handoff',
    fileTokens: [{ file: ['AGENTS.md'], tokens: ['handoff --apply'] }],
  },
  {
    id: 'R3',
    name: 'free-route zero-token quota signature',
    helper: null,
    fileTokens: [
      { file: ['AGENTS.md'], tokens: ['zero-token run'] },
      {
        file: ['prompts', 'deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md'],
        tokens: ['zero-token run'],
      },
    ],
  },
  {
    id: 'R4',
    name: 'incremental-write and byte-length-proof rules',
    helper: null,
    fileTokens: [
      { file: ['references', 'gsd-path-skill-roster.md'], tokens: ['Add-Content', 'byte-length'] },
      { file: ['references', 'prompting-glyph-cluster.md'], tokens: ['byte-length proof'] },
    ],
  },
  {
    id: 'R5',
    name: 'fragment repair command',
    helper: 'fragment-fix',
    fileTokens: [{ file: ['references', 'gsd-path-orchestrator.md'], tokens: ['fragment-fix'] }],
  },
];

/** The helper commands a healthy install's `gsd.ts --help` must list. */
const HELPER_TOKENS = ['preapprove', 'handoff', 'fragment-fix'];

/** The four helper-regression pins the run that shipped M016 hit by hand. Each
 * row names one installed helper file (`file`, split into segments under the
 * resolved rules root), the tokens that file must still carry (`tokens`), and
 * the public subcommand that proves the same behaviour (`probe`, with `script`
 * relative to the helper directory or the skill scripts directory).
 *
 * Token-vs-wording only: no row quotes a sentence. `args` is the fixed part of
 * the command; a caller appends the fixture arguments it needs. */
export const HELPER_PINS = [
  {
    id: 'P1',
    name: 'brief-check applies the paid effort ladder',
    file: ['scripts', 'gsd', 'lib', 'brief-check.ts'],
    tokens: ['paid-deepseek-v4-1-flash', 'paid-glm-5-3-flash'],
    probe: { tool: 'gsd', script: ['gsd.ts'], args: ['brief-check', '--json'] },
  },
  {
    id: 'P2',
    name: 'plan-lint accepts a path::test_name Held-out Test cell',
    file: ['scripts', 'gsd', 'lib', 'plan-lint.ts'],
    tokens: ['check.test.split("::")[0]'],
    probe: { tool: 'gsd', script: ['gsd.ts'], args: ['plan-lint', '--json'] },
  },
  {
    id: 'P3',
    name: 'check_handoffs reads an Intent-coverage row',
    file: ['skills', 'gsd-path', 'scripts', 'check_handoffs.py'],
    tokens: ['Intent coverage row is unreadable'],
    probe: { tool: 'python', script: ['check_handoffs.py'], args: ['plan'] },
  },
  {
    id: 'P4',
    name: 'a serial retry stays parkable',
    file: ['skills', 'gsd-path', 'scripts', 'dispatch_driver.py'],
    tokens: ['state.get("mode") == "serial"', 'fields.get("task_branch") == "null"'],
    probe: { tool: 'python', script: ['build_state.py'], args: ['ready'] },
  },
];

/** The dispatch-document pins: the user-scope prompts, briefs, templates and
 * worked example the owner named, which decide whether a brief is usable and
 * which an installer re-run can revert. Same row shape as HELPER_PINS — one
 * row per document family, `file` split into segments under the resolved rules
 * root, `tokens` matched literally, and `probe` the public subcommand that
 * enforces the same contract (relative to the helper dir or the skill scripts
 * dir). Token-vs-wording only: no row quotes a sentence, so ordinary rewording
 * of a document still passes and only a removed token fails.
 *
 * Recorded shortfall, M017 T002: the orchestrator prompt carries the paid
 * DeepSeek route token and the dispatch section's `GLM-5.3 Flash` paid-child
 * marker, but it does not carry the paid GLM route token itself, so D1 pins
 * the two markers that are really there. The route token is pinned where it is
 * authoritative, in the paid model plan (D2). */
export const DISPATCH_PINS = [
  {
    id: 'D1',
    name: 'orchestrator prompt keeps its paid route ladder',
    file: ['prompts', 'deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md'],
    tokens: ['paid-deepseek-v4-1-flash-*', 'GLM-5.3 Flash'],
    probe: { tool: 'gsd', script: ['gsd.ts'], args: ['brief-check', '--json'] },
  },
  {
    id: 'D2',
    name: 'paid model plan keeps both paid families and the reviewer row',
    file: ['references', 'paid-model-plan.md'],
    tokens: [
      'paid-deepseek-v4-1-flash-*',
      'paid-glm-5-3-flash-*',
      'paid-deepseek-v4-1-flash-high',
      'paid-glm-5-3-flash-high',
      '`reviewer`, `skeptic`, `review_panel`',
    ],
    probe: { tool: 'python', script: ['path_config.py'], args: ['show'] },
  },
  {
    id: 'D3',
    name: 'subagent brief contract keeps its required fields',
    file: ['references', 'gsd-path-subagent-briefs.md'],
    tokens: [
      'ROLE:',
      'REPO/WORKTREE:',
      'DECLARED FILES',
      'VERIFY (run it yourself and paste the exit code):',
      'INPUTS:',
      '<<<DOC',
      'RULES:',
      'RESULT: ready',
      'RESULT: blocked',
    ],
    probe: { tool: 'gsd', script: ['gsd.ts'], args: ['brief-check', '--json'] },
  },
  {
    id: 'D4',
    name: 'task template keeps its required section headings',
    file: ['skills', 'gsd-path', 'templates', 'task.md'],
    tokens: [
      '## Context',
      '## Approach',
      '## Interface contract',
      '## Intent coverage',
      '## Acceptance criteria',
      '## Verify',
      'Heavy: no',
      '## Log',
    ],
    probe: { tool: 'python', script: ['check_task_briefs.py'], args: ['--repo'] },
  },
  {
    id: 'D5',
    name: 'wave-review template keeps its verdict vocabulary',
    file: ['skills', 'gsd-path', 'templates', 'wave-review.md'],
    tokens: [
      'Wave verdict:',
      '<pass | blocked',
      '<pass | fail>',
      'Warnings (non-blocking):',
      'Contract violations (blocking):',
      '## Intent coverage',
      '## Summary for orchestrator',
    ],
    probe: { tool: 'python', script: ['check_handoffs.py'], args: ['wave'] },
  },
  {
    id: 'D6',
    name: 'final-review template keeps its verdict vocabulary',
    file: ['skills', 'gsd-path', 'templates', 'final-review.md'],
    tokens: [
      'Overall verdict:',
      '## Success criteria',
      '- **Verdict**:',
      '- **Reference**:',
      '- **Fix direction**:',
    ],
    probe: { tool: 'gsd', script: ['gsd.ts'], args: ['final-check'] },
  },
  {
    id: 'D7',
    name: 'coder brief keeps its worked example',
    file: ['references', 'gsd-path-coder-brief.md'],
    tokens: ['## Worked example', 'Result: 22 turns'],
    probe: { tool: 'gsd', script: ['gsd.ts'], args: ['brief-check', '--json'] },
  },
];

/** Both pin tables in one list, so `checkHelpers()` reports the helper and the
 * dispatch-document pins in the same pass and neither can be skipped. */
export const ALL_PINS = [...HELPER_PINS, ...DISPATCH_PINS];

/** Child node processes spawned from inside a test run inherit the runner's
 * NODE_TEST_CONTEXT/NODE_TEST_WORKER_ID, which makes a spawned `node --test`
 * exit 0 immediately without running anything. Strip them. */
function childEnv() {
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  return env;
}

/** Derive the rules root from the user-scope scripts dir resolved by
 * resolveScanDir: the rules files are the PARENT of the scripts dir.
 * Returns { scriptsDir, rulesRoot, gsdDir } with absolute paths. */
export function resolveRulesRoot(input) {
  const scriptsDir = resolve(String(resolveScanDir(input)));
  const rulesRoot = basename(scriptsDir) === 'scripts' ? dirname(scriptsDir) : scriptsDir;
  return { scriptsDir, rulesRoot, gsdDir: join(rulesRoot, 'scripts', 'gsd') };
}

/** Run the installed helper's --help probe; returns { ok, output } or null
 * when the gsd dir is absent (the structural issue already names it). */
export function runGsdHelp(gsdDir) {
  if (!existsSync(gsdDir)) return null;
  const res = spawnSync(process.execPath, ['--experimental-strip-types', 'gsd.ts', '--help'], {
    cwd: gsdDir,
    encoding: 'utf8',
    timeout: 60_000,
    env: childEnv(),
  });
  const output = String(res.stdout || '') + String(res.stderr || '');
  return { ok: res.status === 0, status: res.status, output };
}

/** Every absolute *.test.ts under <gsdDir>/test, enumerated explicitly so the
 * child runner can never match nothing (a relative glob can). */
export function listGsdTestFiles(gsdDir) {
  const testDir = join(gsdDir, 'test');
  if (!existsSync(testDir)) {
    throw new Error(`user-scope-autonomy: helper test dir is absent: ${testDir}`);
  }
  const files = readdirSync(testDir)
    .filter((f) => f.endsWith('.test.ts'))
    .map((f) => join(testDir, f))
    .sort();
  if (files.length === 0) {
    throw new Error(`user-scope-autonomy: no *.test.ts files under ${testDir}`);
  }
  return files;
}

/** Accepts a rules root, the gsd dir itself, or anything resolveScanDir takes. */
export function resolveGsdDir(root) {
  const p = resolve(String(root));
  if (basename(p) === 'gsd' || existsSync(join(p, 'gsd.ts'))) return p;
  return join(p, 'scripts', 'gsd');
}

/** Run the installed helper suite as a child process with the enumerated
 * absolute test files. Returns { gsdDir, files, status, stdout, stderr,
 * failing } where failing holds the failing test names parsed from output. */
export function runGsdTests(root) {
  const gsdDir = resolveGsdDir(root);
  if (!existsSync(gsdDir)) {
    return {
      gsdDir,
      files: [],
      status: 1,
      stdout: '',
      stderr: `user-scope-autonomy: helper dir is absent: ${gsdDir}`,
      failing: [],
    };
  }
  const files = listGsdTestFiles(gsdDir);
  const res = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--test', ...files],
    { cwd: gsdDir, encoding: 'utf8', timeout: 240_000, maxBuffer: 256 * 1024 * 1024, env: childEnv() },
  );
  const output = String(res.stdout || '') + String(res.stderr || '');
  const failing = output
    .split(/\r?\n/)
    .filter((l) => l.includes('✖'))
    .map((l) => l.replace(/^.*✖\s*/, '').replace(/\s*\([\d.]+ms\)\s*$/, '').trim())
    .filter(Boolean);
  return {
    gsdDir,
    files,
    status: res.status ?? (res.signal ? 1 : 0),
    stdout: String(res.stdout || ''),
    stderr: String(res.stderr || ''),
    failing,
  };
}

/** Resolve a pin's static file and its probe script to absolute paths. The
 * static file is under the rules root; the probe script is under the helper
 * directory (`gsd`) or the skill scripts directory, chosen by `probe.tool`. */
export function resolvePinPaths(pin, input) {
  const { rulesRoot, gsdDir } = resolveRulesRoot(input);
  const skillScriptsDir = join(rulesRoot, 'skills', 'gsd-path', 'scripts');
  const scriptDir = pin.probe.tool === 'gsd' ? gsdDir : skillScriptsDir;
  return {
    rulesRoot,
    gsdDir,
    skillScriptsDir,
    file: join(rulesRoot, ...pin.file),
    scriptDir,
    script: join(scriptDir, ...pin.probe.script),
  };
}

/** Static half of every pin: the named tokens in the resolved absolute file,
 * plus the presence of the probe script the pin runs. Returns a list of issues
 * built like `check()`'s, so a reviewer sees every resolved path. Fails loudly
 * (never vacuously) when the rules root or a helper script is absent. Runs both
 * tables — HELPER_PINS and DISPATCH_PINS — so `check()` reports them in one
 * pass and no pin table can be dropped silently. */
export function checkHelpers(input) {
  const issues = [];
  const { rulesRoot, scriptsDir } = resolveRulesRoot(input);
  if (!existsSync(rulesRoot)) {
    issues.push({
      rule: 'INSTALL',
      file: rulesRoot,
      reason: `INSTALL helper pin: rules root ${rulesRoot} does not exist (resolved scripts dir ${scriptsDir})`,
    });
    return issues;
  }
  for (const pin of ALL_PINS) {
    const paths = resolvePinPaths(pin, input);
    for (const token of pin.tokens) {
      checkOneFile(paths.file, pin.id, pin.name, token, issues);
    }
    if (!existsSync(paths.script)) {
      issues.push({
        rule: pin.id,
        file: paths.script,
        reason: `${pin.id} ${pin.name}: probe script ${paths.script} is absent (${pin.probe.tool} ${pin.probe.script.join(' ')})`,
      });
    }
  }
  return issues;
}

/** Run one pin's declared public subcommand with the fixture arguments the
 * caller supplies. Returns { pin, script, status, stdout, stderr } naming the
 * absolute script it ran, so a green run still prints the path it read and the
 * exit status it propagated. */
export function runPinProbe(pin, input, extraArgs = []) {
  const { scriptDir, script } = resolvePinPaths(pin, input);
  if (!existsSync(script)) {
    return {
      pin: pin.id,
      script,
      status: 1,
      stdout: '',
      stderr: `user-scope-autonomy: probe script is absent: ${script}`,
    };
  }
  const args =
    pin.probe.tool === 'gsd'
      ? ['--experimental-strip-types', script, ...pin.probe.args, ...extraArgs]
      : ['-B', script, ...pin.probe.args, ...extraArgs];
  const res = spawnSync(pin.probe.tool === 'gsd' ? process.execPath : 'python', args, {
    cwd: scriptDir,
    encoding: 'utf8',
    timeout: 120_000,
    maxBuffer: 32 * 1024 * 1024,
    env: childEnv(),
  });
  return {
    pin: pin.id,
    script,
    status: res.status ?? (res.signal ? 1 : 0),
    stdout: String(res.stdout || ''),
    stderr: String(res.stderr || ''),
  };
}

function checkOneFile(absFile, ruleId, label, token, issues) {
  let text = null;
  try {
    if (statSync(absFile).isFile()) text = readFileSync(absFile, 'utf8');
  } catch {
    text = null;
  }
  if (text === null) {
    issues.push({
      rule: ruleId,
      file: absFile,
      reason: `${ruleId} ${label}: ${absFile} is absent`,
    });
    return;
  }
  if (!text.includes(token)) {
    issues.push({
      rule: ruleId,
      file: absFile,
      reason: `${ruleId} ${label}: ${absFile} does not contain "${token}"`,
    });
  }
}

/** Check the installed user-scope rules. Returns a list of issues; an empty
 * list means every named token and helper behaviour is present. Fails loudly
 * (never vacuously) when the rules root, AGENTS.md or scripts/gsd is absent. */
export function check(input) {
  const issues = [];
  const { scriptsDir, rulesRoot, gsdDir } = resolveRulesRoot(input);

  if (!existsSync(rulesRoot)) {
    issues.push({
      rule: 'INSTALL',
      file: rulesRoot,
      reason: `INSTALL: rules root ${rulesRoot} does not exist (resolved scripts dir ${scriptsDir})`,
    });
    return issues;
  }
  const agentsPath = join(rulesRoot, 'AGENTS.md');
  if (!existsSync(agentsPath)) {
    issues.push({
      rule: 'INSTALL',
      file: agentsPath,
      reason: `INSTALL: rules file ${agentsPath} is absent (rules root ${rulesRoot})`,
    });
  }
  const gsdPresent = existsSync(gsdDir);
  if (!gsdPresent) {
    issues.push({
      rule: 'INSTALL',
      file: gsdDir,
      reason: `INSTALL: helper dir ${gsdDir} is absent (rules root ${rulesRoot})`,
    });
  }

  const help = gsdPresent ? runGsdHelp(gsdDir) : null;
  if (help && !help.ok) {
    for (const helper of HELPER_TOKENS) {
      const owner = RULES.find((r) => r.helper === helper);
      issues.push({
        rule: owner ? owner.id : 'INSTALL',
        file: gsdDir,
        reason: `${owner ? owner.id : 'INSTALL'} ${helper}: helper probe at ${gsdDir} exited ${help.status}`,
      });
    }
  }

  for (const rule of RULES) {
    for (const entry of rule.fileTokens) {
      const absFile = join(rulesRoot, ...entry.file);
      for (const token of entry.tokens) {
        checkOneFile(absFile, rule.id, rule.helper ?? token, token, issues);
      }
    }
    if (rule.helper && help && help.ok && !help.output.includes(rule.helper)) {
      issues.push({
        rule: rule.id,
        file: gsdDir,
        reason: `${rule.id} ${rule.helper}: ${gsdDir} --help does not mention "${rule.helper}"`,
      });
    }
  }

  issues.push(...checkHelpers(input));

  return issues;
}

export default {
  RULES,
  HELPER_PINS,
  DISPATCH_PINS,
  ALL_PINS,
  resolveRulesRoot,
  runGsdHelp,
  listGsdTestFiles,
  resolveGsdDir,
  runGsdTests,
  resolvePinPaths,
  checkHelpers,
  runPinProbe,
  check,
};
