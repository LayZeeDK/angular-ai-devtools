/**
 * The corpus runner's own proof, driven against fixture corpora under the temp directory.
 *
 * `scripts/held-out-corpus.mjs` accepts `--root <dir>`, so this suite never runs the repository's own
 * `tests/held-out/`: every corpus it judges is built fresh from the fixture texts below, and removed in
 * `finally`. That keeps the proof cheap and makes each behaviour falsifiable — the mutant that reddens a
 * test is a one-line change to one fixture.
 *
 * A runner that reports pass after running nothing is the defect this milestone exists to repair (INTENT
 * prohibition N2: a skip that reports pass is the silence the corpus may not accept), so every test judges
 * the run's exit code together with the output that explains it. A green exit that enumerated nothing, or a
 * red exit that does not name the file it refused, is only half the claim.
 *
 * The fixtures also give INTENT SC3 its run: the fixture roots carry no `.project` directory anywhere, which
 * is the state the ship flow leaves the working tree in.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

/** The script under test, resolved beside this file rather than from the working directory. */
const CORPUS = fileURLToPath(new URL('./held-out-corpus.mjs', import.meta.url));

/** A suite that passes, and therefore a corpus entry that must not fail. */
const PASSING_SUITE = [
  "import assert from 'node:assert/strict';",
  "import { test } from 'node:test';",
  '',
  "test('fixture assertion holds', () => {",
  '  assert.equal(1, 1);',
  '});',
  '',
].join('\n');

/** A suite that fails, and therefore an entry the corpus must refuse and name. */
const FAILING_SUITE = [
  "import assert from 'node:assert/strict';",
  "import { test } from 'node:test';",
  '',
  "test('fixture assertion does not hold', () => {",
  '  assert.equal(1, 2);',
  '});',
  '',
].join('\n');

/**
 * A suite that declares a group and registers no test in it. `node --test` exits 0 and reports
 * `tests 0` for this file, so the corpus is the only thing that can refuse it.
 */
const NO_TESTS_SUITE = [
  "import { describe } from 'node:test';",
  '',
  "describe('fixture group with nothing in it', () => {});",
  '',
].join('\n');

/** A suite that skips its only test: exit 0, `skipped 1` — the shape N2 forbids accepting. */
const SKIPPED_SUITE = [
  "import { test } from 'node:test';",
  '',
  "test('fixture needs a browser', { skip: 'no browser instance in this fixture' }, () => {});",
  '',
].join('\n');

/** A suite that defers its only test: exit 0, `todo 1`. */
const TODO_SUITE = [
  "import { test } from 'node:test';",
  '',
  "test.todo('fixture deferred until someone writes it');",
  '',
].join('\n');

/** Environment the corpus run must not inherit: a nested-run marker, a foreign root, a test-runner context. */
const INHERITED = [
  'NODE_TEST_CONTEXT',
  'NODE_TEST_WORKER_ID',
  'HELD_OUT_CORPUS_DEPTH',
  'HELD_OUT_CORPUS_ROOT',
  'RUN_HELD_OUT_CORPUS_ROOT',
  'HELD_OUT_ROOT',
];

/**
 * A fresh directory under the temp directory, removed however the body returns.
 * @template T
 * @param {string} label included in the directory name so a leftover names its own test
 * @param {(root: string) => T} body
 * @returns {T}
 */
function withTempRoot(label, body) {
  const root = mkdtempSync(join(process.env.TEMP ?? tmpdir(), `held-out-corpus-${label}-`));
  try {
    return body(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/**
 * Write fixture suites into `<root>/tests/held-out/`, the location the corpus enumerates. A name may carry
 * subdirectories, so the walk is exercised as well.
 * @param {string} root
 * @param {Record<string, string>} suites fixture name (relative to the corpus) to file text
 */
function writeCorpus(root, suites) {
  const corpus = join(root, 'tests', 'held-out');
  mkdirSync(corpus, { recursive: true });
  for (const [name, text] of Object.entries(suites)) {
    const path = join(corpus, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);
  }
}

/**
 * Run the corpus script against `root` and return its exit code with the output it printed. The child gets
 * a clean environment: this test runs under `node --test`, and an inherited nested-run marker would make the
 * script report a nested run instead of judging the fixture corpus.
 * @param {string} root
 * @returns {{ status: number, output: string }}
 */
function runCorpus(root) {
  /** @type {NodeJS.ProcessEnv} */
  const env = { ...process.env };
  for (const key of INHERITED) {
    delete env[key];
  }

  const result = spawnSync(process.execPath, [CORPUS, '--root', root], {
    cwd: root,
    encoding: 'utf8',
    timeout: 3 * 60 * 1000,
    maxBuffer: 64 * 1024 * 1024,
    env,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  assert.equal(result.error, undefined, `the corpus script could not be run against ${root}: ${result.error?.message ?? ''}\n${output}`);
  assert.notEqual(result.status, null, `the corpus script was killed by ${result.signal ?? 'an unknown signal'} against ${root}\n${output}`);

  return { status: /** @type {number} */ (result.status), output };
}

/**
 * The corpus directory this run must have enumerated, in the form the script prints it (a Windows fixture
 * root prints backslashes). A run of the repository's own corpus would not carry this string.
 * @param {string} root
 * @returns {string}
 */
function corpusDirOf(root) {
  return join(root, 'tests', 'held-out');
}

/**
 * Every `.project` directory under `root`, as a root-relative path. Fixture roots carry none: the ship flow
 * moves that directory out of the working tree, so a corpus that needed one would be red exactly then.
 * @param {string} root
 * @param {string} [directory]
 * @param {string[]} [found]
 * @returns {string[]}
 */
function projectDirectories(root, directory = root, found = []) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }
    const path = join(directory, entry.name);
    if (entry.name === '.project') {
      found.push(relative(root, path).split(sep).join('/'));
    }
    projectDirectories(root, path, found);
  }

  return found;
}

test('a corpus of passing suites exits 0', () => {
  withTempRoot('passing', (root) => {
    writeCorpus(root, {
      'alpha.test.mjs': PASSING_SUITE,
      [join('nested', 'beta.test.mjs')]: PASSING_SUITE,
    });

    const run = runCorpus(root);

    assert.ok(
      run.output.includes(corpusDirOf(root)),
      `the run must enumerate the fixture corpus at ${corpusDirOf(root)}, not another root\n${run.output}`,
    );
    assert.match(run.output, /held-out corpus: 2 suite\(s\)/, `the run must find both fixture suites\n${run.output}`);
    assert.match(run.output, /PASS tests\/held-out\/alpha\.test\.mjs/, `a passing suite must be reported as passing\n${run.output}`);
    assert.match(run.output, /PASS tests\/held-out\/nested\/beta\.test\.mjs/, `a suite in a subdirectory must be found and reported\n${run.output}`);
    assert.match(run.output, /2 suite\(s\), 2 passed, 0 failed/, `the total must count both suites as passing\n${run.output}`);
    assert.equal(run.status, 0, `a corpus of passing suites must exit 0\n${run.output}`);
  });
});

test('a corpus containing one failing suite exits non-zero and names that file', () => {
  withTempRoot('failing', (root) => {
    writeCorpus(root, {
      'alpha-passes.test.mjs': PASSING_SUITE,
      'fixture-fails.test.mjs': FAILING_SUITE,
    });

    const run = runCorpus(root);
    const named = 'tests/held-out/fixture-fails.test.mjs';

    assert.notEqual(run.status, 0, `a corpus with a failing suite must not exit 0\n${run.output}`);
    assert.ok(run.output.includes(named), `the failing suite must be named as ${named}\n${run.output}`);
    assert.match(run.output, /FAIL tests\/held-out\/fixture-fails\.test\.mjs — exited 1/, `the per-suite line must name the file and why it failed\n${run.output}`);
    assert.match(run.output, /held-out corpus: FAILED tests\/held-out\/fixture-fails\.test\.mjs/, `the closing summary must name the failing file\n${run.output}`);
    assert.match(run.output, /2 suite\(s\), 1 passed, 1 failed/, `the total must count the failure\n${run.output}`);
    assert.ok(
      !run.output.includes('FAIL tests/held-out/alpha-passes.test.mjs'),
      `the passing suite must not be blamed for the failure\n${run.output}`,
    );
  });
});

test('a suite that reports zero tests fails the corpus', () => {
  withTempRoot('no-tests', (root) => {
    writeCorpus(root, { 'fixture-declares-nothing.test.mjs': NO_TESTS_SUITE });

    const run = runCorpus(root);

    assert.notEqual(run.status, 0, `a suite that proves nothing must not count as a pass\n${run.output}`);
    assert.match(
      run.output,
      /FAIL tests\/held-out\/fixture-declares-nothing\.test\.mjs — reported no tests/,
      `the corpus must name the suite and the reason it proved nothing\n${run.output}`,
    );
    assert.match(
      run.output,
      /reported no tests — a suite that proves nothing may not pass/,
      `the failure must say that zero tests is not a pass\n${run.output}`,
    );
  });
});

test('a suite that skips a test fails the corpus', () => {
  withTempRoot('skipped', (root) => {
    writeCorpus(root, { 'fixture-skips.test.mjs': SKIPPED_SUITE });

    const run = runCorpus(root);

    assert.notEqual(run.status, 0, `a skipped test must not count as a pass\n${run.output}`);
    assert.match(
      run.output,
      /FAIL tests\/held-out\/fixture-skips\.test\.mjs — reported 1 skipped test\(s\)/,
      `the corpus must name the suite and the skip it refuses\n${run.output}`,
    );
    assert.match(
      run.output,
      /a held-out suite may not skip: its prerequisite must fail and be named/,
      `the failure must say a skip is not acceptable, and why\n${run.output}`,
    );
  });
});

test('a suite that defers a test as todo fails the corpus', () => {
  withTempRoot('todo', (root) => {
    writeCorpus(root, { 'fixture-defers.test.mjs': TODO_SUITE });

    const run = runCorpus(root);

    assert.notEqual(run.status, 0, `a todo test must not count as a pass\n${run.output}`);
    assert.match(
      run.output,
      /FAIL tests\/held-out\/fixture-defers\.test\.mjs — reported 1 todo test\(s\)/,
      `the corpus must name the suite and the deferral it refuses\n${run.output}`,
    );
    assert.match(
      run.output,
      /a held-out suite may not defer a test it is counted for/,
      `the failure must say a deferred test is not acceptable\n${run.output}`,
    );
  });
});

test('a corpus directory with no suite is an error, never a pass', () => {
  withTempRoot('empty', (root) => {
    writeCorpus(root, {});

    const run = runCorpus(root);

    assert.notEqual(run.status, 0, `an empty corpus must not exit 0\n${run.output}`);
    assert.match(run.output, /no suite matched .*tests[\\/]held-out/, `the error must name the corpus it found empty\n${run.output}`);
    assert.match(run.output, /an empty corpus is an error, not a pass/, `the error must say an empty corpus is not a pass\n${run.output}`);
    assert.ok(!/0 passed, 0 failed/.test(run.output), `an empty corpus must not print a passing total\n${run.output}`);
  });
});

test('a root with no corpus directory at all is an error, never a pass', () => {
  withTempRoot('missing', (root) => {
    // Nothing is written: the root holds no `tests/held-out/`, which is the state of a fresh checkout before
    // the corpus lands. It is an absence to report, not a run that found everything already green.
    const run = runCorpus(root);

    assert.notEqual(run.status, 0, `an absent corpus must not exit 0\n${run.output}`);
    assert.match(run.output, /no suite matched/, `the error must say no suite matched\n${run.output}`);
    assert.match(run.output, /an empty corpus is an error, not a pass/, `the error must say an empty corpus is not a pass\n${run.output}`);
  });
});

test('the corpus exits 0 with no .project directory anywhere under its root', () => {
  withTempRoot('no-project', (root) => {
    writeCorpus(root, {
      'alpha.test.mjs': PASSING_SUITE,
      [join('nested', 'beta.test.mjs')]: PASSING_SUITE,
    });

    assert.deepEqual(projectDirectories(root), [], `the fixture root must carry no .project directory, so this run is the ship flow's state`);

    const run = runCorpus(root);

    assert.equal(run.status, 0, `the corpus must run green with no .project directory present\n${run.output}`);
    assert.match(run.output, /2 suite\(s\), 2 passed, 0 failed/, `both suites must have run, not been excused\n${run.output}`);
    assert.deepEqual(projectDirectories(root), [], `the corpus run must not create a .project directory under its root`);
  });
});
