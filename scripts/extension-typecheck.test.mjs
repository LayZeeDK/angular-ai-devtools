/**
 * The extension type check bites — SC3 and SC4, held-out E1-E4 (M025 T003).
 *
 * T001 added `extension/tsconfig.json` and chained `check:extension` into `npm run check`; T002 made it
 * green. A check that cannot fail is the defect M023 spent a milestone repairing, so this suite proves
 * that the check fails for the right reason and only for it:
 *
 * 1. E1 — a wrong property (`element.noSuchProperty`) in an authored source makes the check exit
 *    non-zero and name that file.
 * 2. E2 — the same wrong property inside `extension/panel/` leaves the check green, because that
 *    directory is the generated bundle output and is the config's only exclusion. The exclusion is
 *    also read positively: the program `--listFiles` reports holds every authored `.js` and no file
 *    under `extension/panel/`, so the exclusion is that directory and nothing wider.
 * 3. E3 — a tree whose `extension/` holds no JavaScript reports no errors rather than failing to
 *    start. TypeScript refuses a program with zero inputs: the measured answer is exit 2 with
 *    `TS18003 No inputs were found`, and no config can change it (`files: []` answers `TS18002`, also
 *    measured). So the edge pins what *is* achievable and what the criterion is about: the check
 *    starts and reads its config, reports no error in any file, and names the no-inputs state
 *    instead of the driver falling over on an empty fixture.
 * 4. E4 — the config's `strict` is `false`, and its header states the strict gap (the reason:
 *    implicit-any throughout hand-written JavaScript) and the `panel/**` exclusion. Both are
 *    asserted from the file text, not from this comment.
 *
 * Every run is against a temporary copy of the tree under `os.tmpdir()`; the checkout's `extension/`
 * is never written, and its digest is compared at the end, so "the proof never touched the repo" is
 * an assertion rather than a promise. The copy needs `@types/chrome` for the config's
 * `types: ["chrome"]`, so each fixture gets a `node_modules` junction to the checkout's install;
 * junctions are removed in a `finally` before the fixture directory, and never recursively.
 *
 * The driver runs the same binary `npx tsc` resolves (`node_modules/typescript/bin/tsc`) through
 * `process.execPath`, so the test needs no shell, no PATH and no `npx` install step.
 *
 * Each of the four behaviours is paired with a mutated fixture fed through the same assertion: a
 * mutant that does not redden its assertion would prove the assertion vacuous, so every mutant's
 * failure text is printed and matched against the assertion it must hit.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
const REPO_ROOT = resolve(here, '..');

const EXTENSION_ROOT = join(REPO_ROOT, 'extension');
const CONFIG_PATH = join(EXTENSION_ROOT, 'tsconfig.json');
const NODE_MODULES = join(REPO_ROOT, 'node_modules');

/** The TypeScript entry point `npx tsc` resolves through `node_modules/.bin`. Driving the package
 * directly keeps the test independent of PATH, of the shell and of an `npx` install. */
const TSC = join(NODE_MODULES, 'typescript', 'bin', 'tsc');

/** The wrong property every probe carries. It is a real diagnostic on a real DOM type
 * (`HTMLDivElement`), not a parse error: `TS2339 Property 'noSuchProperty' does not exist`. The
 * access sits inside an IIFE so the probe can be appended to any script — these are classic
 * content scripts sharing one global scope, and a second top-level `const element` would answer
 * `TS2451 Cannot redeclare` and cloud the diagnostic the probe is meant to produce. */
const WRONG_PROPERTY =
  "(() => {\n  const element = document.createElement('div');\n  element.noSuchProperty;\n})();\n";

/** The authored source E1 appends the probe to, in the copy. It is small, self-contained and has a
 * `document` in scope, so the probe is a property error and nothing else. */
const AUTHORED_PROBE_TARGET = 'panel.js';

/** The probe that lives inside the generated bundle directory in E2. */
const PANEL_PROBE_NAME = 'probe-wrong-property.js';

/** The phrases the config header must carry for E4. Each one is a sentence of the recorded gap, not
 * a paraphrase: `strict: false` is stated as deliberate, the reason is named, the gap is recorded
 * rather than hidden, and the panel exclusion is stated as the only one and as build output. */
const HEADER_STATEMENTS = [
  ['`strict: false` is deliberate', 'the header must state that strict: false is deliberate'],
  ['implicit-any', 'the header must name implicit-any as the reason the gap exists'],
  ['hand-written JavaScript', 'the header must name hand-written JavaScript as the source of the gap'],
  ['`strict: true` over the same sources', 'the header must not claim the extension is strict-clean'],
  ['gap is recorded here rather than hidden', 'the header must say the gap is recorded rather than hidden'],
  ['exclude: ["panel/**"]', 'the header must state the panel/** exclusion'],
  ['only exclusion', 'the header must state that the panel exclusion is the only one'],
  ['build output', 'the header must say extension/panel/ is generated build output'],
];

/** The checkout's `extension/` at the moment this module loaded: the state every run below must
 * leave untouched. `treeDigest` is a list of `path sha256` entries, sorted. */
const EXTENSION_TREE_AT_START = treeDigest(EXTENSION_ROOT);

// ---------------------------------------------------------------------------
// The checkout, read-only
// ---------------------------------------------------------------------------

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

/** Every file under a directory, as `<relative/path> <sha256>`, sorted — a digest that changes when
 * one byte of any file changes or a file is added or removed. */
function treeDigest(directory) {
  const entries = [];
  const walk = (current) => {
    const names = readdirSync(current, { withFileTypes: true }).sort((left, right) =>
      left.name.localeCompare(right.name, 'en'),
    );
    for (const entry of names) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (!entry.isFile()) {
        continue;
      }
      entries.push(`${relative(directory, path).split(sep).join('/')} ${sha256(readFileSync(path))}`);
    }
  };
  walk(directory);
  return entries;
}

/** The authored JavaScript the config's glob include covers: every `.js` at the top of `extension/`,
 * which is where the content scripts, the overlay, the relay and the agent live. */
function authoredSources() {
  return readdirSync(EXTENSION_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.js'))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'en'));
}

/** Every `.js` under a directory, recursive — used to prove the E3 fixture really is empty. */
function javaScriptFilesUnder(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...javaScriptFilesUnder(path));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      found.push(path);
    }
  }
  return found.sort((left, right) => left.localeCompare(right, 'en'));
}

// ---------------------------------------------------------------------------
// JSON with comments, the way TypeScript reads it
// ---------------------------------------------------------------------------

/**
 * Drops `//` and block comments while leaving string contents verbatim, so the config's header can
 * be read as prose and its settings as JSON without the one satisfying the other.
 */
function stripJsonComments(text) {
  let output = '';
  let index = 0;
  let quote = null;
  while (index < text.length) {
    const character = text[index];
    const next = text[index + 1];
    if (quote !== null) {
      output += character;
      if (character === '\\') {
        output += next ?? '';
        index += 2;
        continue;
      }
      if (character === quote) {
        quote = null;
      }
      index += 1;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      output += character;
      index += 1;
      continue;
    }
    if (character === '/' && next === '/') {
      while (index < text.length && text[index] !== '\n') {
        index += 1;
      }
      continue;
    }
    if (character === '/' && next === '*') {
      index += 2;
      while (index < text.length && !(text[index] === '*' && text[index + 1] === '/')) {
        index += 1;
      }
      index += 2;
      continue;
    }
    output += character;
    index += 1;
  }
  return output;
}

function readJsonc(path) {
  return JSON.parse(stripJsonComments(readFileSync(path, 'utf8')).replace(/^\uFEFF/, ''));
}

// ---------------------------------------------------------------------------
// The fixture: a temporary copy of the tree, never the checkout
// ---------------------------------------------------------------------------

/** The config path inside a fixture. */
function fixtureConfig(fixtureRoot) {
  return join(fixtureRoot, 'extension', 'tsconfig.json');
}

/** A path in the forward-slash form `--listFiles` prints. */
function posix(path) {
  return path.split(sep).join('/');
}

/**
 * Builds a fixture root under `os.tmpdir()` holding `extension/tsconfig.json` copied byte-for-byte
 * from the checkout, a `node_modules` junction so the config's `types: ["chrome"]` resolves, and
 * optionally the authored sources and an empty `extension/panel/` directory.
 *
 * Nothing is read from the fixture's parent, so no stray `tsconfig.json` or `node_modules` above
 * `os.tmpdir()` can change what the check sees.
 */
function createFixture(label, { sources = true, panel = false } = {}) {
  const fixtureRoot = resolve(mkdtempSync(join(tmpdir(), `extension-typecheck-${label}-`)));
  assert.ok(
    fixtureRoot.startsWith(resolve(tmpdir())),
    `the fixture must live under os.tmpdir(), never the checkout: ${fixtureRoot}`,
  );
  assert.ok(
    !`${fixtureRoot}${sep}`.startsWith(`${resolve(REPO_ROOT)}${sep}`),
    `the fixture must never be inside the checkout: ${fixtureRoot}`,
  );
  assert.ok(
    existsSync(TSC),
    `the check drives ${TSC}; a missing TypeScript would make every assertion below vacuous`,
  );

  const extensionDir = join(fixtureRoot, 'extension');
  mkdirSync(extensionDir, { recursive: true });
  copyFileSync(CONFIG_PATH, join(extensionDir, 'tsconfig.json'));
  // `types: ["chrome"]` is resolved against `<config dir>/node_modules` upward, and `os.tmpdir()`
  // has no install of its own. A junction gives the copy the checkout's `@types/chrome` without
  // copying it, and without the copy reaching into the checkout for the config.
  symlinkSync(NODE_MODULES, join(fixtureRoot, 'node_modules'), 'junction');
  if (sources) {
    for (const name of authoredSources()) {
      copyFileSync(join(EXTENSION_ROOT, name), join(extensionDir, name));
    }
  }
  if (panel) {
    mkdirSync(join(extensionDir, 'panel'), { recursive: true });
  }
  return fixtureRoot;
}

/**
 * Removes a fixture. The junction goes first and non-recursively — a recursive removal that followed
 * it would walk the checkout's install — and the root follows. The checkout's `node_modules` is
 * asserted intact afterwards, so a destructive cleanup can never pass silently.
 */
function removeFixture(fixtureRoot) {
  const junction = join(fixtureRoot, 'node_modules');
  try {
    rmdirSync(junction);
  } catch {
    // A junction `rmdir` refuses (already gone, or held open) is unlinked, never recursed into.
    rmSync(junction, { force: true });
  }
  assert.ok(!existsSync(junction), `the fixture's node_modules junction must be removed: ${junction}`);
  rmSync(fixtureRoot, { recursive: true, force: true });
  assert.ok(
    existsSync(join(NODE_MODULES, 'typescript')) && existsSync(join(NODE_MODULES, '@types', 'chrome')),
    'removing a fixture must never disturb the checkout\'s node_modules',
  );
}

/** Runs one fixture body with its fixture, and removes the fixture whatever the body does. */
function withFixture(label, options, body) {
  const fixtureRoot = createFixture(label, options);
  try {
    body(fixtureRoot);
  } finally {
    removeFixture(fixtureRoot);
  }
}

// ---------------------------------------------------------------------------
// Driving the check
// ---------------------------------------------------------------------------

/** One diagnostic line, parsed. `file` is null for a diagnostic that names no file — a config
 * condition such as `TS18003 No inputs were found`, which is exactly what E3 is about. */
function parseDiagnostics(output) {
  const found = [];
  for (const rawLine of output.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0) {
      continue;
    }
    const withFile = /^(.+?)\((\d+),(\d+)\): error (TS\d+):/.exec(line);
    if (withFile) {
      found.push({
        file: withFile[1].split('\\').join('/'),
        line: Number(withFile[2]),
        column: Number(withFile[3]),
        code: withFile[4],
        text: line,
      });
      continue;
    }
    const withoutFile = /^error (TS\d+):/.exec(line);
    if (withoutFile) {
      found.push({ file: null, line: null, column: null, code: withoutFile[1], text: line });
    }
  }
  return found;
}

/**
 * Runs the check — `tsc -p <config>` — against a fixture, with the fixture root as the working
 * directory so every reported path is relative to it. Returns the status, both streams and the
 * parsed diagnostics. A spawn that cannot happen at all is a test failure, not a check result.
 */
function runCheck(fixtureRoot, configPath, extraArgs = []) {
  const result = spawnSync(process.execPath, [TSC, '-p', configPath, ...extraArgs], {
    cwd: fixtureRoot,
    encoding: 'utf8',
    timeout: 300_000,
    // A generous buffer: the config header measures 7308 errors with strict on over the same
    // sources, so a probe that ever compiles them strict must not have its output cut off.
    maxBuffer: 16 * 1024 * 1024,
  });
  assert.ok(
    !result.error,
    `tsc -p ${configPath} must be runnable: ${result.error?.message ?? 'unknown spawn failure'}`,
  );
  assert.equal(
    typeof result.status,
    'number',
    `tsc -p ${configPath} must exit with a status, not be killed: signal ${String(result.signal)}`,
  );
  const stdout = String(result.stdout ?? '');
  const stderr = String(result.stderr ?? '');
  const output = `${stdout}${stderr}`;
  const diagnostics = parseDiagnostics(output);
  return {
    status: result.status,
    stdout,
    stderr,
    output,
    diagnostics,
    fileErrors: diagnostics.filter((diagnostic) => diagnostic.file !== null),
  };
}

// ---------------------------------------------------------------------------
// The assertions, each callable with a mutated run so its mutant can prove it bites
// ---------------------------------------------------------------------------

/** E1's assertion: non-zero exit, and the failure names that one file with the deliberate code. */
function assertReddensAndNamesTheFile(run, expectedFile) {
  assert.notEqual(
    run.status,
    0,
    `a wrong property in an authored source must exit non-zero; got exit ${run.status} with: ${run.output}`,
  );
  assert.deepEqual(
    run.fileErrors.map((diagnostic) => diagnostic.file),
    [expectedFile],
    `the failure must name ${expectedFile} and no other file: ${JSON.stringify(run.fileErrors.map((diagnostic) => diagnostic.text))}`,
  );
  assert.equal(
    run.fileErrors[0].code,
    'TS2339',
    `the deliberate failure must be the wrong property (TS2339), not a parse or config error: ${run.fileErrors[0].text}`,
  );
  assert.ok(
    run.fileErrors[0].text.includes('noSuchProperty'),
    `the failure must name the property the probe wrote: ${run.fileErrors[0].text}`,
  );
}

/** E2's and E1's premise: exit 0 and nothing reported at all. */
function assertGreen(run, what) {
  assert.equal(
    run.status,
    0,
    `${what} must exit 0; got exit ${run.status} with: ${run.output}`,
  );
  assert.deepEqual(
    run.diagnostics,
    [],
    `${what} must report no errors at all: ${JSON.stringify(run.diagnostics.map((diagnostic) => diagnostic.text))}`,
  );
}

/**
 * E2's breadth assertion: the program the config builds is the authored tree, whole, and holds no
 * file under the generated `extension/panel/` directory. An exclusion that swallowed an authored
 * file would show up here as a missing name; the exclusion being wider than the bundle is what this
 * half rules out, just as E1 rules out the check not biting.
 */
function assertProgramIsTheAuthoredTree(program, extensionDir) {
  assert.equal(
    program.status,
    0,
    `--listFiles must compile the same green program: ${program.output}`,
  );
  const extensionPrefix = `${posix(extensionDir)}/`;
  const listed = program.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(posix)
    .filter((path) => path.startsWith(extensionPrefix))
    .map((path) => path.slice(extensionPrefix.length))
    .sort((left, right) => left.localeCompare(right, 'en'));
  assert.deepEqual(
    listed,
    authoredSources(),
    'the program must be the authored tree, whole: every authored source in, the panel probe out',
  );
  assert.ok(
    !listed.some((name) => name.startsWith('panel/')),
    `no file under extension/panel/ may enter the program the check builds: ${JSON.stringify(listed)}`,
  );
  return listed;
}

/**
 * E3's assertion, in the two halves the edge is about. First, the check reports no errors: no
 * diagnostic is attributed to a file, because there are no files to report on. Second, it started
 * rather than failing to start: it found and read the config (no `TS5058`), and the one thing it
 * says about the tree is the no-inputs condition (`TS18003`), named — not a silent exit, and not a
 * diagnostic attributed to a file that does not exist. A driver handed a missing config would pass
 * the first half and must fail the second.
 */
function assertNoErrorsRatherThanFailingToStart(run, configPath) {
  assert.deepEqual(
    run.fileErrors,
    [],
    `a tree with no JavaScript must report no errors; it reported: ${JSON.stringify(run.fileErrors.map((diagnostic) => diagnostic.text))}`,
  );
  assert.ok(
    !/TS5058/.test(run.output),
    `the check must start and read its config, not fail before reading it: ${run.output}`,
  );
  assert.deepEqual(
    run.diagnostics.map((diagnostic) => diagnostic.code),
    ['TS18003'],
    `the empty tree must be explained by the no-inputs diagnostic (TS18003) and nothing else, so "no errors" is a named state rather than a silent pass: ${run.output}`,
  );
  assert.ok(
    run.output.split('\\').join('/').includes(posix(configPath)),
    `the no-inputs diagnostic must name the fixture's config, proving that config was the one read: ${run.output}`,
  );
}

/**
 * E4's assertion: the config is read as text, its settings as JSON, and its header as the comment
 * block before `compilerOptions` — so a header sentence cannot satisfy the strict setting and the
 * setting cannot satisfy the header.
 */
function assertConfigRecordsTheGap(text) {
  const config = JSON.parse(stripJsonComments(text).replace(/^\uFEFF/, ''));
  const options = config.compilerOptions ?? {};

  assert.equal(
    options.strict,
    false,
    'the config must run at strict: false — SC4 records the gap; it does not claim the extension is strict-clean',
  );
  assert.deepEqual(
    config.exclude,
    ['panel/**'],
    'panel/** must be the config\'s only exclusion: the generated bundle is the only tree that cannot be fixed at source',
  );

  const headerEnd = text.indexOf('"compilerOptions"');
  assert.ok(
    headerEnd > 0,
    'the config must carry a header before compilerOptions, where the gap is recorded',
  );
  const header = text.slice(0, headerEnd);
  for (const line of header.split(/\r?\n/)) {
    const trimmed = line.trim();
    assert.ok(
      trimmed === '' || trimmed === '{' || trimmed.startsWith('//'),
      `the header may hold only comments before compilerOptions, so each statement below is prose and not a setting: ${JSON.stringify(line)}`,
    );
  }
  for (const [statement, message] of HEADER_STATEMENTS) {
    assert.ok(
      header.includes(statement),
      `the header must state the strict gap and the panel exclusion; ${message} — missing: ${statement}`,
    );
  }
}

/**
 * Feeds a mutated fixture through an assertion and returns the failure text. `assert.fail` when the
 * mutant passes: an assertion that survives its mutant is the vacuous check M023 was about.
 */
function captureFailure(assertion, what) {
  try {
    assertion();
  } catch (error) {
    return error.message;
  }
  assert.fail(`${what}: the mutated fixture must redden the assertion, but it passed`);
}

// ---------------------------------------------------------------------------
// E1 — a wrong property in an authored source reddens the check and names that file
// ---------------------------------------------------------------------------

test('E1 — a wrong property in an authored source reddens the check and names that file', () => {
  withFixture('e1', {}, (fixtureRoot) => {
    const configPath = fixtureConfig(fixtureRoot);
    const target = join(fixtureRoot, 'extension', AUTHORED_PROBE_TARGET);
    assert.ok(
      existsSync(target),
      `the fixture must carry a copy of the authored ${AUTHORED_PROBE_TARGET}, or the probe would prove nothing about an authored source`,
    );

    // Premise: the copied real sources are green, so the probe is the only cause of the red run
    // below. Without this, a fixture that was already red would satisfy E1 for the wrong reason.
    const baseline = runCheck(fixtureRoot, configPath);
    assertGreen(baseline, `the copied authored sources (${authoredSources().length} files) before the probe`);

    const withoutProbe = readFileSync(target, 'utf8');
    writeFileSync(
      target,
      `${withoutProbe}\n// T003 E1 probe: a property access no DOM element has.\n${WRONG_PROPERTY}`,
      'utf8',
    );

    const red = runCheck(fixtureRoot, configPath);
    assertReddensAndNamesTheFile(red, `extension/${AUTHORED_PROBE_TARGET}`);

    // The mutant: the same fixture with the probe removed. The red assertion must fail here, or it
    // would pass on any tree — including one where the check never ran.
    writeFileSync(target, withoutProbe, 'utf8');
    const fixed = runCheck(fixtureRoot, configPath);
    const mutant = captureFailure(
      () => assertReddensAndNamesTheFile(fixed, `extension/${AUTHORED_PROBE_TARGET}`),
      'E1 mutant (probe removed)',
    );
    assert.match(
      mutant,
      /must exit non-zero/,
      `the E1 mutant must redden the exit-status assertion, not an unrelated one: ${mutant}`,
    );

    // The second mutant: the probe is back, and a second authored source carries the same wrong
    // property. The "and names that file" half must redden on the extra file, which is what makes
    // it a claim about the named file rather than about "something failed".
    writeFileSync(
      target,
      `${withoutProbe}\n// T003 E1 probe: a property access no DOM element has.\n${WRONG_PROPERTY}`,
      'utf8',
    );
    writeFileSync(join(fixtureRoot, 'extension', 'overlay.js'), WRONG_PROPERTY, 'utf8');
    const twoFiles = runCheck(fixtureRoot, configPath);
    const namingMutant = captureFailure(
      () => assertReddensAndNamesTheFile(twoFiles, `extension/${AUTHORED_PROBE_TARGET}`),
      'E1 mutant (a second authored source broken)',
    );
    assert.match(
      namingMutant,
      /and no other file/,
      `the second E1 mutant must redden the file-name assertion: ${namingMutant}`,
    );

    console.log(
      `extension-typecheck E1: baseline exit ${baseline.status}; probe in ${AUTHORED_PROBE_TARGET} -> ` +
        `exit ${red.status}, ${red.fileErrors[0].text}\n` +
        `  E1 mutant (probe removed) -> exit ${fixed.status}, red: ${mutant}\n` +
        `  E1 mutant (second authored source broken) -> red: ${namingMutant}`,
    );
  });
});

// ---------------------------------------------------------------------------
// E2 — the same wrong property inside extension/panel/ leaves the check green
// ---------------------------------------------------------------------------

test('E2 — the same wrong property inside extension/panel/ leaves the check green', () => {
  withFixture('e2', { panel: true }, (fixtureRoot) => {
    const configPath = fixtureConfig(fixtureRoot);
    const extensionDir = join(fixtureRoot, 'extension');
    const probePath = join(extensionDir, 'panel', PANEL_PROBE_NAME);
    writeFileSync(
      probePath,
      `// T003 E2 probe: the same wrong property, in generated bundle territory.\n${WRONG_PROPERTY}`,
      'utf8',
    );
    assert.ok(existsSync(probePath), `the panel probe must exist in the fixture: ${probePath}`);

    const green = runCheck(fixtureRoot, configPath);
    assertGreen(green, 'a tree whose only error is inside extension/panel/');

    // Excluded means outside the program, not merely quiet: `--listFiles` must hold every authored
    // source and no file under extension/panel/. The exclusion is the generated directory and
    // nothing wider — an exclusion that swallowed an authored file would show up here as a missing
    // name, and E1 proves the names listed really do bite.
    const configText = readFileSync(configPath, 'utf8');
    assert.ok(
      configText.includes('"exclude": ["panel/**"]'),
      'the fixture config must be the checkout config, exclusion intact, before the mutations',
    );
    const listed = assertProgramIsTheAuthoredTree(
      runCheck(fixtureRoot, configPath, ['--listFiles']),
      extensionDir,
    );

    // The mutant for the "and nothing wider" half: the same fixture with one authored file added to
    // the exclusion. The program assertion must redden on the missing name, so "the panel is the
    // only exclusion" is held by a test rather than by the header's prose alone.
    writeFileSync(
      configPath,
      configText.replace('"exclude": ["panel/**"]', '"exclude": ["panel/**", "overlay.js"]'),
      'utf8',
    );
    const widened = runCheck(fixtureRoot, configPath, ['--listFiles']);
    const wideningMutant = captureFailure(
      () => assertProgramIsTheAuthoredTree(widened, extensionDir),
      'E2 mutant (exclusion widened to an authored file)',
    );
    assert.match(
      wideningMutant,
      /authored tree, whole/,
      `the E2 widening mutant must redden the program assertion: ${wideningMutant}`,
    );
    assert.ok(
      widened.status === 0,
      `the widened fixture must still be green, or the red would come from the exclusion drawing blood rather than from a missing name: ${widened.output}`,
    );

    // The mutant for the green itself: the exclusion dropped. The green assertion must fail, and the
    // panel probe must be named — which is what proves the exclusion, not luck, is what keeps the
    // tree green.
    writeFileSync(configPath, configText.replace('"exclude": ["panel/**"]', '"exclude": []'), 'utf8');
    const red = runCheck(fixtureRoot, configPath);
    assert.ok(
      red.fileErrors.some((diagnostic) => diagnostic.file === `extension/panel/${PANEL_PROBE_NAME}`),
      `with the exclusion dropped the panel probe must be named, or the green run above proved nothing: ${JSON.stringify(red.fileErrors.slice(0, 3).map((diagnostic) => diagnostic.text))}`,
    );
    const mutant = captureFailure(
      () => assertGreen(red, 'a tree whose only error is inside extension/panel/ (exclusion dropped)'),
      'E2 mutant (exclusion dropped)',
    );
    assert.match(
      mutant,
      /must exit 0/,
      `the E2 mutant must redden the green assertion, not an unrelated one: ${mutant}`,
    );

    console.log(
      `extension-typecheck E2: panel probe -> exit ${green.status}, 0 diagnostics, ${listed.length} authored files in the program, 0 panel files\n` +
        `  E2 mutant (exclusion widened to an authored file) -> green exit ${widened.status}, red: ${wideningMutant}\n` +
        `  E2 mutant (exclusion dropped) -> exit ${red.status}, ${red.fileErrors.length} file errors, red: ${mutant}`,
    );
  });
});

// ---------------------------------------------------------------------------
// E3 — a tree with no JavaScript reports no errors rather than failing to start
// ---------------------------------------------------------------------------

test('E3 — a tree with no JavaScript reports no errors rather than failing to start', () => {
  withFixture('e3', { sources: false }, (fixtureRoot) => {
    const configPath = fixtureConfig(fixtureRoot);
    const extensionDir = join(fixtureRoot, 'extension');
    assert.deepEqual(
      javaScriptFilesUnder(extensionDir),
      [],
      `the fixture tree must hold no JavaScript, so this run is the empty tree: ${extensionDir}`,
    );

    // TypeScript cannot be talked out of a program with zero inputs: `tsc -p` answers exit 2 with
    // TS18003, and `files: []` answers TS18002 (both measured on this install). So E3's "no errors"
    // is the report's: no error in any file, with the no-inputs state named — and the run starts
    // and reads its own config rather than the driver falling over on an empty fixture.
    const run = runCheck(fixtureRoot, configPath);
    assertNoErrorsRatherThanFailingToStart(run, configPath);

    // The mutant: one authored file carrying the wrong property. The report gains a file error, so
    // "reports no errors" must fail with that file named.
    const added = join(extensionDir, 'overlay.js');
    writeFileSync(added, WRONG_PROPERTY, 'utf8');
    const red = runCheck(fixtureRoot, configPath);
    const mutant = captureFailure(
      () => assertNoErrorsRatherThanFailingToStart(red, configPath),
      'E3 mutant (one JavaScript file added)',
    );
    assert.match(
      mutant,
      /must report no errors/,
      `the E3 mutant must redden the no-errors assertion, not the start-up one: ${mutant}`,
    );

    // The other half of the assertion, so "rather than failing to start" is held by a test and not
    // only by prose: the same driver pointed at a config that is not there answers TS5058, and the
    // "started and read the config" assertion must fail on it while the no-errors one passes.
    const absentConfig = join(extensionDir, 'tsconfig.absent.json');
    const startupFailure = runCheck(fixtureRoot, absentConfig);
    const startupMutant = captureFailure(
      () => assertNoErrorsRatherThanFailingToStart(startupFailure, absentConfig),
      'E3 mutant (config absent)',
    );
    assert.match(
      startupMutant,
      /must start and read its config/,
      `the E3 start-up half must redden on a missing config, or it is decoration: ${startupMutant}`,
    );

    console.log(
      `extension-typecheck E3: empty tree -> exit ${run.status}, ${run.fileErrors.length} file errors, ` +
        `${run.diagnostics.length} diagnostic (${run.diagnostics.map((diagnostic) => diagnostic.code).join(', ')})\n` +
        `  E3 mutant (one JavaScript file added) -> red: ${mutant}\n` +
        `  E3 mutant (config absent) -> red: ${startupMutant}`,
    );
  });
});

// ---------------------------------------------------------------------------
// E4 — the config records strict: false and states the gap in its header
// ---------------------------------------------------------------------------

test('E4 — the config records strict: false and its header states the gap and the panel exclusion', () => {
  const text = readFileSync(CONFIG_PATH, 'utf8');
  assertConfigRecordsTheGap(text);

  // The mutant that flips the setting: the header may still say all of it, but a strict config is
  // not the recorded gap SC4 claims, and the assertion must fail on the setting rather than prose.
  const strictFlipped = text.replace('"strict": false', '"strict": true');
  assert.notEqual(strictFlipped, text, 'the E4 mutant must find the strict setting to flip');
  const strictMutant = captureFailure(
    () => assertConfigRecordsTheGap(strictFlipped),
    'E4 mutant (strict flipped)',
  );
  assert.match(
    strictMutant,
    /strict: false/,
    `the E4 strict mutant must redden the strict assertion: ${strictMutant}`,
  );

  // The mutant that removes the record: a config identical in behaviour but with no header. The
  // setting stays false and the header assertions must fail, which proves the header is asserted.
  const headerStripped = text.replace(/^[ \t]*\/\/.*(?:\r?\n|$)/gm, '');
  assert.notEqual(headerStripped, text, 'the E4 mutant must find the header to strip');
  const headerMutant = captureFailure(
    () => assertConfigRecordsTheGap(headerStripped),
    'E4 mutant (header stripped)',
  );
  assert.match(
    headerMutant,
    /header must state the strict gap/,
    `the E4 header mutant must redden a header assertion: ${headerMutant}`,
  );

  // The mutant that removes one header statement, leaving the rest intact: it proves the header
  // check reaches every statement in the list, not only the first one that a stripped header hits.
  const statementDropped = text.replace('is the only exclusion', 'is an exclusion');
  assert.notEqual(statementDropped, text, 'the E4 mutant must find the only-exclusion sentence');
  const statementMutant = captureFailure(
    () => assertConfigRecordsTheGap(statementDropped),
    'E4 mutant (only-exclusion statement dropped)',
  );
  assert.match(
    statementMutant,
    /the only one/,
    `the E4 statement mutant must redden that statement's assertion: ${statementMutant}`,
  );

  // The mutant that widens the exclusion: an authored file dropped from the check. The header still
  // says "only exclusion"; the executable config must disagree nowhere, and the assertion is on the
  // executable list, not the prose.
  const widerExclude = text.replace('"exclude": ["panel/**"]', '"exclude": ["panel/**", "overlay.js"]');
  assert.notEqual(widerExclude, text, 'the E4 mutant must find the exclusion to widen');
  const excludeMutant = captureFailure(
    () => assertConfigRecordsTheGap(widerExclude),
    'E4 mutant (exclusion widened)',
  );
  assert.match(
    excludeMutant,
    /only exclusion/,
    `the E4 exclusion mutant must redden the exclusion assertion: ${excludeMutant}`,
  );

  console.log(
    `extension-typecheck E4: strict false and ${HEADER_STATEMENTS.length} header statements asserted from the config text\n` +
      `  E4 mutant (strict flipped) -> red: ${strictMutant}\n` +
      `  E4 mutant (header stripped) -> red: ${headerMutant}\n` +
      `  E4 mutant (only-exclusion statement dropped) -> red: ${statementMutant}\n` +
      `  E4 mutant (exclusion widened) -> red: ${excludeMutant}`,
  );
});

// ---------------------------------------------------------------------------
// The proof never touched the checkout
// ---------------------------------------------------------------------------

test('the checkout is byte-identical to the state the suite started in', () => {
  assert.deepEqual(
    treeDigest(EXTENSION_ROOT),
    EXTENSION_TREE_AT_START,
    'every run above must be against a copy under os.tmpdir(): the checkout extension/ tree must be byte-identical afterwards',
  );
  assert.ok(
    existsSync(CONFIG_PATH) && existsSync(TSC),
    'the config and the TypeScript install must both still be where the suite found them',
  );
  console.log(
    `extension-typecheck: checkout extension/ untouched — ${EXTENSION_TREE_AT_START.length} files hashed before and after`,
  );
});
