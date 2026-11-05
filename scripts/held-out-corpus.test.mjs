/**
 * The corpus runner's own proof, driven against fixture corpora under the temp directory.
 *
 * `scripts/held-out-corpus.mjs` accepts `--root <dir>`, so the runner is never pointed at the repository it
 * ships in: every corpus it judges is built fresh under the temp directory and removed in `finally`. Eight of
 * the tests below build their corpus from the fixture texts in this file, so each behaviour is falsifiable
 * with a one-line change to one fixture. The last two build their corpus from copies of the *real* suites —
 * the repository's history and working tree with `.project` taken out — because INTENT SC3 is a claim about
 * `tests/held-out/` itself, and a claim about the real corpus may only be judged on the real corpus.
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
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
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
  const root = mkdtempSync(
    join(process.env.TEMP ?? tmpdir(), `held-out-corpus-${label}-`),
  );
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
 *
 * `budgetMs` bounds the whole run. The hand-written corpora below are one or two suites and finish in well
 * under the default; a corpus of the real suites runs each of them in its own process and needs more.
 * @param {string} root
 * @param {number} [budgetMs]
 * @returns {{ status: number, output: string }}
 */
function runCorpus(root, budgetMs = 3 * 60 * 1000) {
  /** @type {NodeJS.ProcessEnv} */
  const env = { ...process.env };
  for (const key of INHERITED) {
    delete env[key];
  }

  const result = spawnSync(process.execPath, [CORPUS, '--root', root], {
    cwd: root,
    encoding: 'utf8',
    timeout: budgetMs,
    maxBuffer: 64 * 1024 * 1024,
    env,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;

  assert.equal(
    result.error,
    undefined,
    `the corpus script could not be run against ${root}: ${result.error?.message ?? ''}\n${output}`,
  );
  assert.notEqual(
    result.status,
    null,
    `the corpus script was killed by ${result.signal ?? 'an unknown signal'} against ${root}\n${output}`,
  );

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
    assert.match(
      run.output,
      /held-out corpus: 2 suite\(s\)/,
      `the run must find both fixture suites\n${run.output}`,
    );
    assert.match(
      run.output,
      /PASS tests\/held-out\/alpha\.test\.mjs/,
      `a passing suite must be reported as passing\n${run.output}`,
    );
    assert.match(
      run.output,
      /PASS tests\/held-out\/nested\/beta\.test\.mjs/,
      `a suite in a subdirectory must be found and reported\n${run.output}`,
    );
    assert.match(
      run.output,
      /2 suite\(s\), 2 passed, 0 failed/,
      `the total must count both suites as passing\n${run.output}`,
    );
    assert.equal(
      run.status,
      0,
      `a corpus of passing suites must exit 0\n${run.output}`,
    );
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

    assert.notEqual(
      run.status,
      0,
      `a corpus with a failing suite must not exit 0\n${run.output}`,
    );
    assert.ok(
      run.output.includes(named),
      `the failing suite must be named as ${named}\n${run.output}`,
    );
    assert.match(
      run.output,
      /FAIL tests\/held-out\/fixture-fails\.test\.mjs — exited 1/,
      `the per-suite line must name the file and why it failed\n${run.output}`,
    );
    assert.match(
      run.output,
      /held-out corpus: FAILED tests\/held-out\/fixture-fails\.test\.mjs/,
      `the closing summary must name the failing file\n${run.output}`,
    );
    assert.match(
      run.output,
      /2 suite\(s\), 1 passed, 1 failed/,
      `the total must count the failure\n${run.output}`,
    );
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

    assert.notEqual(
      run.status,
      0,
      `a suite that proves nothing must not count as a pass\n${run.output}`,
    );
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

    assert.notEqual(
      run.status,
      0,
      `a skipped test must not count as a pass\n${run.output}`,
    );
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

    assert.notEqual(
      run.status,
      0,
      `a todo test must not count as a pass\n${run.output}`,
    );
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

    assert.notEqual(
      run.status,
      0,
      `an empty corpus must not exit 0\n${run.output}`,
    );
    assert.match(
      run.output,
      /no suite matched .*tests[\\/]held-out/,
      `the error must name the corpus it found empty\n${run.output}`,
    );
    assert.match(
      run.output,
      /an empty corpus is an error, not a pass/,
      `the error must say an empty corpus is not a pass\n${run.output}`,
    );
    assert.ok(
      !/0 passed, 0 failed/.test(run.output),
      `an empty corpus must not print a passing total\n${run.output}`,
    );
  });
});

test('a root with no corpus directory at all is an error, never a pass', () => {
  withTempRoot('missing', (root) => {
    // Nothing is written: the root holds no `tests/held-out/`, which is the state of a fresh checkout before
    // the corpus lands. It is an absence to report, not a run that found everything already green.
    const run = runCorpus(root);

    assert.notEqual(
      run.status,
      0,
      `an absent corpus must not exit 0\n${run.output}`,
    );
    assert.match(
      run.output,
      /no suite matched/,
      `the error must say no suite matched\n${run.output}`,
    );
    assert.match(
      run.output,
      /an empty corpus is an error, not a pass/,
      `the error must say an empty corpus is not a pass\n${run.output}`,
    );
  });
});

test('the corpus exits 0 with no .project directory anywhere under its root', () => {
  withTempRoot('no-project', (root) => {
    writeCorpus(root, {
      'alpha.test.mjs': PASSING_SUITE,
      [join('nested', 'beta.test.mjs')]: PASSING_SUITE,
    });

    assert.deepEqual(
      projectDirectories(root),
      [],
      `the fixture root must carry no .project directory, so this run is the ship flow's state`,
    );

    const run = runCorpus(root);

    assert.equal(
      run.status,
      0,
      `the corpus must run green with no .project directory present\n${run.output}`,
    );
    assert.match(
      run.output,
      /2 suite\(s\), 2 passed, 0 failed/,
      `both suites must have run, not been excused\n${run.output}`,
    );
    assert.deepEqual(
      projectDirectories(root),
      [],
      `the corpus run must not create a .project directory under its root`,
    );
  });
});

/* ================================================================================================
 * The real corpus, in the state the ship flow leaves the tree: no `.project` directory.
 *
 * Every test above judges the runner against suites written by hand in this file. INTENT SC3 is a claim
 * about `tests/held-out/` itself — no suite under it reads any path under `.project` — and a claim about the
 * real corpus can only be judged on the real corpus. So the two tests below build a root that is this
 * repository: its history, its working tree, and copies of its real held-out suites, with `.project` taken
 * out. That is the state `ship` leaves behind, and the state in which a suite that reached for `.project`
 * must fail.
 * ==============================================================================================*/

/** The repository this suite ships in: `scripts/` is one level below its root, and the separator it ends on is not part of the name. */
const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url)).replace(
  /[\\/]$/,
  '',
);

/** Where the real corpus lives: the directory SC3 is written about. */
const REAL_CORPUS = join(REPO_ROOT, 'tests', 'held-out');

/**
 * The held-out suites this proof does not run, and why. Nothing else under `tests/held-out/` is excused:
 * the test below asserts a PASS line for every other suite in the real corpus.
 *
 * - `e3-zero-skipped` and `e4-idempotent-checks` drive `npm test` by design. `npm test` runs the project
 *   gate, and three root script suites (`docs-audit-disposition`, `overlay-verdict-claims`,
 *   `retired-suites`) read `.project/` legitimately, so these two are red with `.project/` absent through
 *   the gate rather than through a read of their own. T004's ruling on AC1 excludes exactly these two.
 * - `fixture-rebuild-idempotent` drives `ng build` over `spikes/ng222-app` from that fixture's own nested
 *   install, which a copy of this repository does not carry; it is a build-idempotence proof, not a read of
 *   `.project`, and it runs in the corpus proper.
 */
const NOT_RUN_HERE = new Map([
  [
    'e3-zero-skipped.test.mjs',
    'drives `npm test`, and the project gate reads `.project/` — excluded by the AC1 ruling',
  ],
  [
    'e4-idempotent-checks.test.mjs',
    'drives `npm test`, and the project gate reads `.project/` — excluded by the AC1 ruling',
  ],
  [
    'fixture-rebuild-idempotent.test.mjs',
    "drives `ng build` from `spikes/ng222-app`'s own nested install, which a copy does not carry",
  ],
]);

/**
 * The read the wave-1 review caught, restored: until T004 `e7-archive-order` asserted that the archived
 * milestone record was on disk at `.project/archive/001-run-unrun-spikes`, so it was red exactly when the
 * ship flow moved that directory out of the tree. Appended to a copy of the suite, in the fixture root only,
 * this is the mutation that must redden the corpus-level proof — otherwise SC3 is only true today.
 */
const RESTORED_PROJECT_READ = [
  '',
  'test("E7 mutant: the archive record is present on disk", () => {',
  '  assert.ok(existsSync(resolve(ROOT, ".project", "archive", "001-run-unrun-spikes")), "E7: archive path missing");',
  '});',
  '',
].join('\n');

/**
 * Build, under `root`, the corpus the ship flow leaves behind: this repository's history and working tree
 * with no `.project` directory, and `tests/held-out/` holding copies of the real suites.
 * @param {string} root an existing empty directory
 * @param {{ only?: readonly string[] | null, extraSuites?: Record<string, string> }} [options] `only` limits
 *   the copied suites to the names given (helpers are always copied); `extraSuites` adds suites the fixture
 *   carries and the repository does not
 * @returns {string} the fixture's corpus directory
 */
function buildRealCorpusRoot(root, options = {}) {
  const only = options.only ?? null;
  const extraSuites = options.extraSuites ?? {};

  // History first. `e7-archive-order` asks git about two commits rather than about a path, and a root with
  // no repository behind it would fail that suite for the wrong reason — the fixture must be able to judge
  // what the suite actually claims. A clone reads this repository and writes nothing into it.
  const clone = spawnSync('git', ['clone', '--quiet', REPO_ROOT, root], {
    encoding: 'utf8',
  });
  assert.equal(
    clone.status,
    0,
    `the fixture root must carry this repository's history, or a suite that asks git would fail for the wrong reason (git clone exited ${clone.status})\n${clone.stderr ?? ''}`,
  );

  // The ship flow's state. `.project` is tracked, so the clone checks it out; removing it is what makes
  // this root the state AC1 is about, and `projectDirectories` below proves the removal took.
  rmSync(join(root, '.project'), { recursive: true, force: true });

  // The working tree, not just HEAD: a suite must be judged against the sources as they are on disk, or an
  // uncommitted change would redden this proof for a reason it does not describe. `.project` stays out.
  const listed = spawnSync('git', ['-C', REPO_ROOT, 'ls-files', '-z'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  assert.equal(
    listed.status,
    0,
    `the working tree's file list must be readable (git ls-files exited ${listed.status})\n${listed.stderr ?? ''}`,
  );
  for (const path of listed.stdout.split('\0')) {
    if (path === '' || path === '.project' || path.startsWith(`.project/`))
      continue;
    const from = join(REPO_ROOT, path);
    if (!existsSync(from)) continue; // a tracked file deleted in the working tree is not part of it
    const to = join(root, path);
    mkdirSync(dirname(to), { recursive: true });
    copyFileSync(from, to);
  }

  // Dependencies are installed for this repository, not for a copy of it. Linking them keeps the fixture's
  // jsdom and typescript suites resolvable without a second install, and the link carries no project data.
  const installed = join(REPO_ROOT, 'node_modules');
  assert.ok(
    existsSync(installed),
    `the fixture root links this repository's installed dependencies, so they must be installed first: run npm ci --include=dev\n(root: ${root})`,
  );
  symlinkSync(installed, join(root, 'node_modules'), 'junction');

  // The corpus: copies of the real suites, the helpers beside them, minus the suites named above. The clone
  // checked out HEAD's corpus, so it is cleared first: what this root runs is exactly what was copied from
  // the working tree, and nothing else survives in it by inheritance.
  const corpus = join(root, 'tests', 'held-out');
  rmSync(corpus, { recursive: true, force: true });
  mkdirSync(corpus, { recursive: true });
  for (const entry of readdirSync(REAL_CORPUS, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (
      only !== null &&
      entry.name.endsWith('.test.mjs') &&
      !only.includes(entry.name)
    )
      continue;
    copyFileSync(join(REAL_CORPUS, entry.name), join(corpus, entry.name));
  }
  for (const name of NOT_RUN_HERE.keys()) {
    rmSync(join(corpus, name), { force: true });
  }
  for (const [name, text] of Object.entries(extraSuites)) {
    writeFileSync(join(corpus, name), text);
  }

  assert.deepEqual(
    projectDirectories(root),
    [],
    `the fixture root must carry no .project directory anywhere, or nothing it proves is about the ship flow's state\n(root: ${root})`,
  );
  return corpus;
}

/** Escape a file name so it may be matched literally inside a regular expression. */
function escapeForRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('the real corpus exits 0 with no .project directory anywhere under its root', () => {
  withTempRoot('real-corpus-no-project', (root) => {
    buildRealCorpusRoot(root);

    // Every suite the real corpus holds, except the two the AC1 ruling excludes and the build suite named
    // above. The proof is only worth its runtime if it ran the corpus, not a token entry from it.
    const expected = readdirSync(REAL_CORPUS)
      .filter((name) => name.endsWith('.test.mjs') && !NOT_RUN_HERE.has(name))
      .sort((left, right) => left.localeCompare(right, 'en'));
    assert.ok(
      expected.length >= 18,
      `the fixture must carry the real corpus, not a handful of suites — found ${expected.length}: ${expected.join(', ')}`,
    );

    const run = runCorpus(root, 10 * 60 * 1000);

    assert.equal(
      run.status,
      0,
      `every held-out suite but the two that drive the project gate must pass with the project directory gone\n${run.output}`,
    );
    for (const name of expected) {
      assert.match(
        run.output,
        new RegExp(`PASS tests/held-out/${escapeForRegExp(name)}`),
        `${name} must have run and passed with no .project directory present\n${run.output}`,
      );
    }
    assert.ok(
      !/^FAIL /m.test(run.output),
      `no suite may fail in the ship flow's state — a failure here is a suite reading .project\n${run.output}`,
    );
    assert.match(
      run.output,
      new RegExp(
        `held-out corpus: ${expected.length} suite\\(s\\), ${expected.length} passed, 0 failed`,
      ),
      `the total must count every real suite as passing\n${run.output}`,
    );

    // The suite the wave-1 review caught, named on its own line: it now asks git about the ordering of two
    // commits rather than reading `.project`, so the tree without a project directory is where it passes.
    assert.match(
      run.output,
      /PASS tests\/held-out\/e7-archive-order\.test\.mjs — 1 test\(s\), 1 passed/,
      `e7-archive-order must pass with no .project directory, on data it carries\n${run.output}`,
    );
    assert.deepEqual(
      projectDirectories(root),
      [],
      `the corpus run must not create a .project directory under its root`,
    );
  });
});

test('a held-out suite that reads .project reddens the corpus and is named', () => {
  withTempRoot('restored-project-read', (root) => {
    // `e7-archive-order` with its old read put back, in the fixture root and nowhere else. This is the
    // mutation AC3 asks for: a held-out suite reaching for `.project` must redden the run that judges it.
    const restored = `${readFileSync(join(REAL_CORPUS, 'e7-archive-order.test.mjs'), 'utf8')}\n${RESTORED_PROJECT_READ}\n`;
    buildRealCorpusRoot(root, {
      only: [
        'stale-view-ordering.test.mjs',
        'stale-view-version-gate.test.mjs',
      ],
      extraSuites: { 'e7-archive-order-restored-read.test.mjs': restored },
    });

    const run = runCorpus(root);
    const named = 'tests/held-out/e7-archive-order-restored-read.test.mjs';

    assert.notEqual(
      run.status,
      0,
      `a suite that reads .project must not pass in a root without one\n${run.output}`,
    );
    assert.match(
      run.output,
      new RegExp(`FAIL ${escapeForRegExp(named)} — exited 1`),
      `the per-suite line must name ${named} and why it failed\n${run.output}`,
    );
    assert.ok(
      run.output.includes('E7: archive path missing'),
      `the failure must echo the read that could not be made, so the reason is the read and not the runner\n${run.output}`,
    );
    assert.match(
      run.output,
      new RegExp(`held-out corpus: FAILED ${escapeForRegExp(named)}`),
      `the closing summary must name the suite that read .project\n${run.output}`,
    );
    // One reading suite reddens the run and is named; the clean suites beside it are not blamed.
    assert.match(
      run.output,
      /PASS tests\/held-out\/stale-view-ordering\.test\.mjs/,
      `the clean suites must still pass\n${run.output}`,
    );
    assert.match(
      run.output,
      /PASS tests\/held-out\/stale-view-version-gate\.test\.mjs/,
      `the clean suites must still pass\n${run.output}`,
    );
    assert.match(
      run.output,
      /3 suite\(s\), 2 passed, 1 failed/,
      `the total must count exactly one failure\n${run.output}`,
    );
  });
});
