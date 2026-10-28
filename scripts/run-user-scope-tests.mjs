// @ts-check
// Repo-resident runner for the relocated user-scope tests.
// Resolves <home>/.commandcode/scripts/ at runtime via os.homedir() (never a literal ~).
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

const ENV_KEYS = [
  'USER_SCOPE_SCRIPTS_DIR',
  'USER_SCOPE_SCRIPTS_ROOT',
  'USER_SCOPE_ROOT',
  'RUN_USER_SCOPE_TESTS_ROOT',
  'RUN_USER_SCOPE_TESTS_DIR',
  'RUN_USER_SCOPE_ROOT',
];

function resolveCandidate(input) {
  if (input == null || input === '') return null;
  if (typeof input === 'object') {
    const v = input.root ?? input.dir ?? input.path ?? input.home ?? input.base;
    return resolveCandidate(v);
  }
  return String(input);
}

export function resolveScanDir(input) {
  const fromArg = resolveCandidate(input);
  let candidate = fromArg;
  if (!candidate) {
    for (const key of ENV_KEYS) {
      if (process.env[key]) { candidate = process.env[key]; break; }
    }
  }
  if (candidate) {
    const p = resolve(String(candidate));
    const nested = join(p, '.commandcode', 'scripts');
    try {
      if (statSync(nested).isDirectory()) return nested;
    } catch {}
    return p;
  }
  return join(homedir(), '.commandcode', 'scripts');
}

export function findTestFiles(root) {
  const out = [];
  function walk(dir) {
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const full = join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
        walk(full);
      } else if (e.isFile() && e.name.endsWith('.test.mjs')) {
        out.push(full);
      }
    }
  }
  walk(root);
  return out.sort();
}

export function run(options) {
  const scanDir = resolveScanDir(options);
  const files = findTestFiles(scanDir);
  if (files.length === 0) {
    console.error(`No user-scope tests found under ${scanDir} (expected **/*.test.mjs).`);
    return 1;
  }
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  const res = spawnSync(process.execPath, ['--experimental-strip-types', '--test', ...files], { stdio: 'inherit', env });
  return res.status ?? (res.signal ? 1 : 0);
}

export async function main(argv = process.argv.slice(2)) {
  // parse args
  let root;
  const args = Array.isArray(argv) ? argv : [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--root' || a === '--dir' || a === '--scripts-dir' || a === '--path' || a === '--home' || a === '--base') {
      root = args[++i];
    } else if (a.startsWith('--root=') || a.startsWith('--dir=') || a.startsWith('--scripts-dir=') || a.startsWith('--path=') || a.startsWith('--home=') || a.startsWith('--base=')) {
      root = a.slice(a.indexOf('=') + 1);
    } else if (!a.startsWith('-') && root == null) {
      root = a;
    }
  }
  const code = run(root ?? null);
  process.exitCode = code;
  return code;
}

const self = fileURLToPath(import.meta.url);
let argvEntry = process.argv[1];
try { if (argvEntry) argvEntry = realpathSync(resolve(argvEntry)); } catch {}
let selfResolved = self;
try { selfResolved = realpathSync(self); } catch {}
if (argvEntry && (argvEntry === self || argvEntry === selfResolved)) {
  main().then((code) => { process.exitCode = code ?? process.exitCode; });
}

export default { resolveScanDir, findTestFiles, run, main, resolveUserScopeDir: resolveScanDir };
