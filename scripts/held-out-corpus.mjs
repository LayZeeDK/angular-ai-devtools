// @ts-check
// Runs the held-out corpus one suite at a time and reports a per-file line plus a total.
//
// Why serial: a parallel `node --test` over `tests/held-out/` collides. The rebuild suite builds
// `spikes/ng222-app` and two other suites bind a port, so two suites sharing one process tree either
// fight over the fixture build or fail to listen. One suite at a time is the only ordering that lets
// the whole corpus pass in one run.
//
// Root selection: the corpus lives under `<root>/tests/held-out/`. The root defaults to this
// repository and is overridable so a proof can point the runner at a temporary fixture directory:
//
//   node scripts/held-out-corpus.mjs [--root <dir>]        (argv, `--root=<dir>` also accepted)
//   HELD_OUT_CORPUS_ROOT=<dir> node scripts/held-out-corpus.mjs    (env, argv wins)
//
// Exit codes: 0 every suite passed; 1 at least one suite failed or the corpus is empty. An empty
// corpus is an error, never a pass: a runner that reports success after finding nothing to run is the
// defect this script exists to remove.
import { spawnSync } from 'node:child_process';
import { readdirSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Corpus location, relative to the selected root. */
const CORPUS_SEGMENTS = ['tests', 'held-out'];
const SUITE_SUFFIX = '.test.mjs';
/** Directories under the corpus that never carry a suite worth running. */
const SKIPPED_DIRECTORIES = new Set(['node_modules', '.git']);

/** Roots named by the environment, in priority order. */
const ROOT_ENV_KEYS = [
  'HELD_OUT_CORPUS_ROOT',
  'RUN_HELD_OUT_CORPUS_ROOT',
  'HELD_OUT_ROOT',
];
/**
 * Nesting marker. `npm test` runs this corpus, and two corpus suites (`e3`, `e4`) drive `npm test`,
 * so an unguarded corpus would recurse forever. A nested run reports the marker and returns 0: the
 * outer run owns every suite and reports them; no suite is skipped, because the same suites run in
 * the outer invocation's own loop.
 */
const DEPTH_ENV = 'HELD_OUT_CORPUS_DEPTH';

/** One suite gets the same budget the corpus' own npm invocations allow each other. */
const SUITE_TIMEOUT_MS = 30 * 60 * 1000;
const MAX_BUFFER = 256 * 1024 * 1024;
/** How much of a failing suite's own output to echo. */
const MAX_FAILURE_LINES = 200;

/**
 * The root to enumerate, from argv then environment then the repository this script ships in.
 * @param {readonly string[]} [argv]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {string}
 */
export function resolveRoot(argv = [], env = process.env) {
  const args = Array.isArray(argv) ? [...argv] : [];
  /** @type {string | null} */
  let chosen = null;
  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index]);
    if (arg === '--root' || arg === '-r') {
      chosen = args[index + 1] ?? null;
      index += 1;
    } else if (arg.startsWith('--root=')) {
      chosen = arg.slice('--root='.length);
    } else if (!arg.startsWith('-') && chosen === null) {
      chosen = arg;
    }
  }
  if (chosen === null) {
    for (const key of ROOT_ENV_KEYS) {
      const value = env[key];
      if (typeof value === 'string' && value !== '') {
        chosen = value;
        break;
      }
    }
  }
  if (chosen === null || chosen === '') return REPO_ROOT;
  return resolve(String(chosen));
}

/**
 * Every suite file under `<root>/tests/held-out/`, deepest directory first, in a stable order.
 * A missing corpus directory yields an empty list, which `main` reports as an error.
 * @param {string} root
 * @returns {string[]}
 */
export function findSuites(root) {
  /** @type {string[]} */
  const found = [];
  /** @param {string} directory */
  const walk = (directory) => {
    /** @type {import('node:fs').Dirent[]} */
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch {
      return; // an absent corpus directory is reported by the caller as an empty corpus
    }
    for (const entry of entries) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
      const full = join(directory, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && entry.name.endsWith(SUITE_SUFFIX))
        found.push(full);
    }
  };
  walk(join(root, ...CORPUS_SEGMENTS));
  return found.sort((left, right) => left.localeCompare(right, 'en'));
}

/**
 * One count out of a node:test summary block. Both reporters are accepted: the spec reporter writes
 * `ℹ pass 3` and the TAP reporter writes `# pass 3`.
 * @param {string} output
 * @param {string} key
 * @returns {number | null} the count, or null when the suite printed no summary at all
 */
export function summaryCount(output, key) {
  const pattern = new RegExp(`^\\s*(?:ℹ|#)?\\s*${key}\\s+(\\d+)\\s*$`, 'gm');
  /** @type {number | null} */
  let total = null;
  for (const match of output.matchAll(pattern)) {
    total = (total ?? 0) + Number(match[1]);
  }
  return total;
}

/**
 * The last `limit` lines of a suite's output, with a marker when earlier lines were dropped.
 * @param {string} output
 * @param {number} [limit]
 * @returns {string}
 */
export function tailLines(output, limit = MAX_FAILURE_LINES) {
  const lines = output.replace(/\r\n/g, '\n').split('\n');
  if (lines.length <= limit) return lines.join('\n');
  const dropped = lines.length - limit;
  return `... ${dropped} earlier line(s) omitted ...\n${lines.slice(-limit).join('\n')}`;
}

/**
 * Run one suite in its own `node --test` process and judge the result.
 *
 * A non-zero exit fails. So does a suite that reports zero tests, or any skipped or todo test: a
 * held-out suite whose prerequisite is missing must fail naming that prerequisite, and a skip
 * reported as pass is exactly the silence this runner may not accept.
 * @param {string} suite absolute path to the suite file
 * @param {{ root: string, env: NodeJS.ProcessEnv, depth: number }} options
 * @returns {{ ok: boolean, reason: string | null, output: string, ms: number, tests: number, pass: number }}
 */
export function runSuite(suite, options) {
  const env = { ...options.env };
  // A suite that shells out to `node --test` (or to npm, which does) must run as a top-level runner.
  delete env.NODE_TEST_CONTEXT;
  delete env.NODE_TEST_WORKER_ID;
  env[DEPTH_ENV] = String(options.depth + 1);

  const started = Date.now();
  const result = spawnSync(
    process.execPath,
    ['--experimental-strip-types', '--test', suite],
    {
      cwd: options.root,
      encoding: 'utf8',
      timeout: SUITE_TIMEOUT_MS,
      maxBuffer: MAX_BUFFER,
      env,
    },
  );
  const ms = Date.now() - started;
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const tests = summaryCount(output, 'tests') ?? 0;
  const pass = summaryCount(output, 'pass') ?? 0;
  const skipped = summaryCount(output, 'skipped') ?? 0;
  const todo = summaryCount(output, 'todo') ?? 0;

  /** @type {string | null} */
  let reason = null;
  if (result.error) {
    const error = /** @type {NodeJS.ErrnoException} */ (result.error);
    reason =
      error.code === 'ETIMEDOUT'
        ? `did not finish within ${Math.round(SUITE_TIMEOUT_MS / 1000)}s`
        : `could not be run: ${error.message}`;
  } else if (result.status !== 0) {
    reason = result.signal
      ? `exited on signal ${result.signal}`
      : `exited ${result.status}`;
  } else if (tests === 0) {
    reason = 'reported no tests — a suite that proves nothing may not pass';
  } else if (skipped > 0) {
    reason = `reported ${skipped} skipped test(s) — a held-out suite may not skip: its prerequisite must fail and be named`;
  } else if (todo > 0) {
    reason = `reported ${todo} todo test(s) — a held-out suite may not defer a test it is counted for`;
  }

  return { ok: reason === null, reason, output, ms, tests, pass };
}

/**
 * Format a duration as `1.2s` or `3m 4s`.
 * @param {number} ms
 * @returns {string}
 */
export function formatDuration(ms) {
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
  const seconds = Math.round(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds % 60}s`;
}

/**
 * Run the corpus and return the process exit code.
 * @param {readonly string[]} [argv]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {number}
 */
export function main(argv = process.argv.slice(2), env = process.env) {
  const depth = Number.parseInt(env[DEPTH_ENV] ?? '0', 10) || 0;
  if (depth > 0) {
    console.log(
      `held-out corpus: nested run (${DEPTH_ENV}=${depth}) — the outer corpus run owns and reports these suites, so nothing is re-run here`,
    );
    return 0;
  }

  const root = resolveRoot(argv, env);
  const corpusDir = join(root, ...CORPUS_SEGMENTS);
  const suites = findSuites(root);
  if (suites.length === 0) {
    console.error(
      `held-out corpus: no suite matched ${join(corpusDir, '**', SUITE_SUFFIX)} — an empty corpus is an error, not a pass`,
    );
    return 1;
  }

  console.log(
    `held-out corpus: ${suites.length} suite(s) under ${corpusDir}, one at a time`,
  );
  const started = Date.now();
  /** @type {{ file: string, reason: string }[]} */
  const failures = [];
  let tests = 0;
  let passed = 0;

  for (const suite of suites) {
    const file = relative(root, suite).split(sep).join('/');
    const result = runSuite(suite, { root, env, depth });
    tests += result.tests;
    passed += result.pass;
    if (result.ok) {
      console.log(
        `PASS ${file} — ${result.tests} test(s), ${result.pass} passed (${formatDuration(result.ms)})`,
      );
      continue;
    }
    const reason = result.reason ?? 'failed';
    failures.push({ file, reason });
    console.log(`FAIL ${file} — ${reason} (${formatDuration(result.ms)})`);
    console.log(`----- ${file} output -----`);
    console.log(tailLines(result.output).trimEnd());
    console.log(`----- end ${file} -----`);
  }

  const duration = formatDuration(Date.now() - started);
  const allPassed = failures.length === 0;
  const total =
    `held-out corpus: ${suites.length} suite(s), ${suites.length - failures.length} passed, ` +
    `${failures.length} failed — ${tests} test(s), ${passed} passed (${duration})`;
  if (allPassed) {
    console.log(total);
    return 0;
  }
  console.error(total);
  for (const failure of failures) {
    console.error(
      `held-out corpus: FAILED ${failure.file} — ${failure.reason}`,
    );
  }
  return 1;
}

const self = fileURLToPath(import.meta.url);
let argvEntry = process.argv[1];
try {
  if (argvEntry) argvEntry = realpathSync(resolve(argvEntry));
} catch {}
let selfResolved = self;
try {
  selfResolved = realpathSync(self);
} catch {}
if (argvEntry && (argvEntry === self || argvEntry === selfResolved)) {
  process.exitCode = main();
}

export default {
  resolveRoot,
  findSuites,
  summaryCount,
  tailLines,
  runSuite,
  formatDuration,
  main,
};
