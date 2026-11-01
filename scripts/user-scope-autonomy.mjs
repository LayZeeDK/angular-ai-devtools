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

  return issues;
}

export default { RULES, resolveRulesRoot, runGsdHelp, listGsdTestFiles, resolveGsdDir, runGsdTests, check };
