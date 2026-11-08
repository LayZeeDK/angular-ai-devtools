/**
 * The breadth pin for the panel type-check — SC5 / N4 (M018 T008).
 *
 * SC5 says "`npm run check` type-checks the registry and the extension sources". Until this task
 * it did not: the root `tsconfig.json` compiles three files and nothing under `apps/`, `src/` or
 * `extension/`, and `@angular/build:application` erases types, so a panel type error never failed
 * any command. N4 is the reason this file exists rather than a comment in the plan: "a narrowed
 * check is the defect restated", so the breadth must be an assertion that fails when the scope
 * regresses.
 *
 * Seven properties, each one a way the scope could quietly shrink:
 *
 * 1. The `check` chain still runs every stage it ran before — `ensure-sidecar-deps`, the root
 *    `tsc -p tsconfig.json`, `check:skills` — then `check:panel`, then `check:extension` (M025's
 *    insertion) and last `check:companion` (M021's authorised re-pin). The list is asserted by
 *    deep equality and every stage is named exactly, never matched by a wildcard, so a dropped,
 *    reordered or extra stage fails; the red half replays the same comparison over mutated stage
 *    lists to prove the re-pin still bites. Each new stage is added to that ordered list in the
 *    change that adds it — the pin is meant to be re-cut, never widened.
 * 2. `check:panel` names the panel config, so the stage cannot be pointed at a file that happens
 *    to type-check.
 * 3. That config's `include` is the panel's whole source tree (`src/**\/*.ts`), its only
 *    `exclude` are the two `node:test` shapes the root `tsconfig.json` cannot compile, and it
 *    carries no `skipLibCheck` of its own — an include list of files that already pass, or a
 *    widened `skipLibCheck`, would be the defect restated.
 * 4. The root `tsconfig.json` still lists its three entries, two of them absolute, so `tsc -p
 *    tsconfig.json` keeps checking the installed `install-pstack-opencode*.mjs` scripts and the
 *    plugin template.
 * 5. The program TypeScript actually builds covers the panel: every `.ts` under
 *    `apps/angular-ai-devtools/src` except the `node:test` files, the M018 registry and its tool
 *    modules, the page-read port, and the modules the panel imports from `src/main-world/` and
 *    `src/panel/`. This is measured by running the real config with `--listFiles`, not by
 *    trusting the config's prose — a registry outside the program cannot appear in that list.
 * 6. The companion config `check:companion` names emits nothing and carries no suppression of its
 *    own, and every `.ts` under the package's source root appears in the program `--listFiles`
 *    reports for it. A stage over a path that does not resolve is a check over nothing, which is
 *    the defect the M018 pin's own comment forbids.
 * 7. The companion stage bites too: a temp config that extends the real companion config and also
 *    carries one deliberately broken file exits non-zero on that file alone, and passes once the
 *    file is fixed — the same pair the panel stage is put through below.
 *
 * Both pairs are what keep the assertions above from being vacuous: without them a compile that
 * reports nothing would satisfy every one. The panel fixture's config and probe live in an
 * `os.tmpdir()` `mkdtempSync` directory; the companion fixture's live under this checkout's
 * git-ignored `tmp/`, because the companion config sets a `rootDir` and no single `rootDir` spans
 * a probe on another drive. Both directories are removed in a `finally`, and no tracked file is
 * ever written.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
const REPO_ROOT = resolve(here, '..');

const PACKAGE_PATH = join(REPO_ROOT, 'package.json');
const ROOT_TSCONFIG_PATH = join(REPO_ROOT, 'tsconfig.json');
const PANEL_PROJECT_ROOT = join(REPO_ROOT, 'apps', 'angular-ai-devtools');
const PANEL_CHECK_CONFIG_PATH = join(PANEL_PROJECT_ROOT, 'tsconfig.check.json');
const PANEL_SOURCE_ROOT = join(PANEL_PROJECT_ROOT, 'src');
const COMPANION_PROJECT_ROOT = join(
  REPO_ROOT,
  'packages',
  'ai-devtools-companion',
);
const COMPANION_CONFIG_PATH = join(COMPANION_PROJECT_ROOT, 'tsconfig.json');
const COMPANION_SOURCE_ROOT = join(COMPANION_PROJECT_ROOT, 'src');

/** The repository's git-ignored scratch root (`tmp/` in `.gitignore`), which is already the output
 * root of `facade-dev-build.test.mjs`. The companion fixture lives here rather than under
 * `os.tmpdir()` for one reason: the companion config sets a `rootDir`, and on a host whose temp
 * directory sits on a different drive from the checkout no single `rootDir` contains both the
 * package's sources and a probe outside them — TypeScript answers TS6059 instead of the deliberate
 * error. Inside `tmp/` both are under the checkout, so the fixture proves the real stage's
 * options rather than the drive layout. */
const SCRATCH_ROOT = join(REPO_ROOT, 'tmp');

/** The panel config, relative to the panel project — the form `check:panel` must name. */
const PANEL_CHECK_CONFIG_RELATIVE =
  'apps/angular-ai-devtools/tsconfig.check.json';

/** The companion config, relative to the repository root — the form `check:companion` must name. */
const COMPANION_CONFIG_RELATIVE =
  'packages/ai-devtools-companion/tsconfig.json';

/** The `check` chain, re-pinned stage by stage: the three stages that predate M018, the panel stage
 * M018 added, the extension stage M025 adds, and the companion stage M021 added last, in that
 * order. Every entry is spelled out.
 *
 * This ordered list is a deliberate pin, and adding a stage to `check` on purpose is exactly the
 * change it has to be told about. M025's SC1 extends `npm run check` to `extension/`, so T004 added
 * the sixth entry — `npm run check:extension`, before `check:companion` — here, in the same change
 * that moved the chain; the list and the chain are re-cut together.
 *
 * What did *not* change is the strength: still a deep equal against the whole ordered list, still
 * "and nothing else". A wildcard, a `some(...)` or an `includes` here would accept a chain that
 * dropped or reordered a stage, which is exactly the narrowed check N4 and N6 forbid. So the next
 * stage is added by naming it in position, not by loosening the comparison. */
const CHECK_STAGES = [
  'node scripts/ensure-sidecar-deps.mjs',
  'tsc -p tsconfig.json',
  // Added after `control-ai-browsers` was found to have shipped with invalid YAML frontmatter:
  // it never registered, and nothing reported it. The lint runs before the type checks so a
  // dead skill fails the gate in the first stage rather than after them.
  'npm run lint:skills',
  // The lint checks the manifest against the spec; only Command Code's loader decides whether the
  // skill actually loads. It skipped `control-ai-browsers` at 1253 characters while the lint passed,
  // so the loader's own report is a gate stage. It is a no-op where the CLI is absent.
  'npm run verify:skills',
  'npm run check:skills',
  'npm run check:panel',
  'npm run check:extension',
  'npm run check:companion',
  // Added with the verification gate (08a8418): a milestone may not ship without working
  // verification skills, and the gate runs inside `npm run check` so the chain cannot pass
  // around it. The pin predated the stage; the pin follows the chain, never the reverse.
  'npm run gate:verification',
  // Added when the repository adopted Prettier: the tree is formatted, so an unformatted
  // commit is a failing check rather than a later surprise. Named in position, not loosened.
  'npm run format:check',
];

/** The TypeScript entry point the npm scripts resolve through `node_modules/.bin`. Driving the
 * same package directly keeps the test independent of PATH and of the shell. */
const TSC = join(REPO_ROOT, 'node_modules', 'typescript', 'bin', 'tsc');

/** The three entries the root `tsconfig.json` carried before this task, by basename. The first
 * two are absolute paths into the installed user-scope scripts tree; the third is the plugin
 * template in this checkout. N4 says none of them is dropped. */
const ROOT_TSCONFIG_ENTRIES = [
  'install-pstack-opencode.mjs',
  'install-pstack-opencode.test.mjs',
  'opencode-pstack-plugin.ts',
];

/** The `exclude` the panel config may carry: the two `node:test` shapes, and nothing else. A
 * third entry would be panel code dropped from the program. */
const PANEL_CHECK_EXCLUDES = ['src/**/*.node.test.ts', 'src/**/*.node.spec.ts'];

/** The modules M018 added, relative to the repository root. Each one is the milestone's evidence
 * that the check now covers what it did not: the registry envelope, the tools registered through
 * it, the page-read port, and the panel/main-world modules the panel imports. The last two live
 * in the repository-level `src/`: that is where the panel reaches for them. */
const MILESTONE_MODULES = [
  'apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/role-name.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/error-digest.tool.ts',
  'apps/angular-ai-devtools/src/app/page-reads.ts',
  'src/panel/error-explainer-view.ts',
  'src/main-world/error-digest.ts',
];

/** The specs `npm test` runs through Vitest; the check stage covers them too. */
const MILESTONE_SPECS = [
  'apps/angular-ai-devtools/src/app/tool-registry/tool-registry.spec.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/app-facts.spec.ts',
  'apps/angular-ai-devtools/src/app/tool-registry/role-name.spec.ts',
];

/** Files a panel walk never treats as sources. */
const NON_PROGRAM_SUFFIXES = ['.node.test.ts', '.node.spec.ts'];

// ---------------------------------------------------------------------------
// Reading JSON with comments the way TypeScript does
// ---------------------------------------------------------------------------

/**
 * Drops `//` and block comments while leaving string contents verbatim, so a config with the
 * comments every tsconfig in this repository carries still parses. Trailing commas are left
 * alone: none of the configs read here uses them.
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
      while (
        index < text.length &&
        !(text[index] === '*' && text[index + 1] === '/')
      ) {
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
  const text = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(stripJsonComments(text));
}

/** A file's executable content — comments dropped — so a config's own prose cannot satisfy or
 * violate a rule about its settings. */
function executableText(path) {
  return stripJsonComments(readFileSync(path, 'utf8'));
}

/** Repo-relative, forward-slash form — the form a failure message names. */
function displayPath(absolutePath) {
  return absolutePath
    .split(sep)
    .join('/')
    .replace(`${REPO_ROOT.split(sep).join('/')}/`, '');
}

/** A path in the forward-slash form a tsconfig can carry anywhere. */
function posixPath(absolutePath) {
  return absolutePath.split(sep).join('/');
}

// ---------------------------------------------------------------------------
// Walking and driving TypeScript
// ---------------------------------------------------------------------------

/** Every `.ts` file under a directory, sorted, with the `node:test` shapes dropped — the set a
 * check config promises to cover. Used for the panel's source tree and for the companion
 * package's. */
function sourceFilesUnder(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...sourceFilesUnder(path));
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.ts')) {
      continue;
    }
    if (NON_PROGRAM_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) {
      continue;
    }
    found.push(path);
  }
  return found.sort();
}

/** Runs the real TypeScript against one config. Returns the status and both streams. */
function runTsc(configPath, extraArgs = []) {
  assert.ok(
    existsSync(TSC),
    `the panel check drives ${TSC}; a missing TypeScript would make every assertion below vacuous`,
  );
  const result = spawnSync(
    process.execPath,
    [TSC, '-p', configPath, ...extraArgs],
    {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      timeout: 300_000,
    },
  );
  assert.ok(
    !result.error,
    `tsc -p ${configPath} must be runnable: ${result.error?.message ?? 'unknown spawn failure'}`,
  );
  return {
    status: result.status,
    stdout: String(result.stdout ?? ''),
    stderr: String(result.stderr ?? ''),
    output: `${String(result.stdout ?? '')}${String(result.stderr ?? '')}`,
  };
}

/** The absolute paths in the program the panel config builds, normalised for comparison. */
function programFiles(configPath) {
  const run = runTsc(configPath, ['--listFiles']);
  assert.equal(
    run.status,
    0,
    `the panel config must compile before its breadth can be asserted: ${run.output}`,
  );
  const files = run.output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(posixPath);
  assert.ok(
    files.length > 0,
    'tsc --listFiles must report the program it built',
  );
  return files;
}

// ---------------------------------------------------------------------------
// The package scripts — the stage exists, runs last and names its own config
// ---------------------------------------------------------------------------

/** Splits a `check` script into the stages it runs, in order. */
function checkStages(script) {
  return script.split('&&').map((stage) => stage.trim());
}

/** The pin itself, callable with a mutated stage list so the red half below can prove the re-cut
 * expectation list still refuses a dropped or reordered stage. */
function assertStageChain(script, expected = CHECK_STAGES) {
  assert.deepEqual(
    checkStages(script),
    expected,
    'check must run its six stages in order — the root type check, the skills stage, the panel stage, the extension stage and then the companion stage — and nothing else',
  );
}

test('the check chain runs every stage it ran before and ends with the companion stage', () => {
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
  const script = pkg.scripts?.check;
  assert.equal(
    typeof script,
    'string',
    'package.json must carry a check script',
  );

  // The pin in one assertion: the three pre-existing stages, the panel stage, the extension stage
  // and the companion stage, named exactly and in order. A dropped, reordered or extra stage fails
  // here even though every named stage script is present.
  assertStageChain(script);

  assert.equal(
    pkg.scripts['check:panel'],
    `tsc -p ${PANEL_CHECK_CONFIG_RELATIVE}`,
    'check:panel must run tsc against the panel check config and nothing else',
  );
  assert.equal(
    pkg.scripts['check:companion'],
    `tsc -p ${COMPANION_CONFIG_RELATIVE}`,
    'check:companion must run tsc against the companion package config and nothing else',
  );

  // The red half, re-cut to the six-stage list: the same comparison must still fail when a stage is
  // dropped, reordered or added — including the extension stage M025 inserted, so the insertion is
  // pinned rather than tolerated. Without this half the re-pin could have been widened into a list
  // that passes unconditionally, which is the weakened pin N6 forbids.
  const refused = {
    'a dropped companion stage': CHECK_STAGES.slice(0, -1),
    'a dropped extension stage with the companion stage still present': [
      ...CHECK_STAGES.slice(0, 4),
      CHECK_STAGES[5],
    ],
    'a dropped panel stage with the extension and companion stages still present':
      [...CHECK_STAGES.slice(0, 3), CHECK_STAGES[4], CHECK_STAGES[5]],
    'the extension and companion stages swapped': [
      ...CHECK_STAGES.slice(0, 4),
      CHECK_STAGES[5],
      CHECK_STAGES[4],
    ],
    'the panel and extension stages swapped': [
      ...CHECK_STAGES.slice(0, 3),
      CHECK_STAGES[4],
      CHECK_STAGES[3],
      CHECK_STAGES[5],
    ],
    'an extra stage appended after the companion stage': [
      ...CHECK_STAGES,
      'npm run check:extra',
    ],
  };
  for (const [what, stages] of Object.entries(refused)) {
    assert.throws(
      () => assertStageChain(stages.join(' && ')),
      /check must run/,
      `${what} must fail the pin: ${JSON.stringify(stages)}`,
    );
  }

  console.log(
    `panel-typecheck-scope: check chain is ${JSON.stringify(checkStages(script))}`,
  );
});

// ---------------------------------------------------------------------------
// The panel config — the panel's whole source tree, narrowed by nothing
// ---------------------------------------------------------------------------

test('the panel config covers src/**/*.ts and narrows nothing', () => {
  const config = readJsonc(PANEL_CHECK_CONFIG_PATH);
  const options = config.compilerOptions ?? {};

  // Breadth: the whole source tree, with the `.d.ts` shape alongside it, and no allow-list of
  // files that happen to pass.
  assert.deepEqual(
    config.include,
    ['src/**/*.ts', 'src/**/*.d.ts'],
    'the panel config must include the panel source tree, not a hand-picked list',
  );
  // The only exclusions are the two `node:test` shapes — the root tsconfig cannot compile them
  // and `npm test` does not run them. Any other entry would be panel code dropped from the check.
  assert.deepEqual(
    config.exclude,
    PANEL_CHECK_EXCLUDES,
    'the panel config may exclude only the node:test shapes',
  );

  // The settings that make `-p` compile rather than emit, without TypeScript inferring a rootDir
  // from an inherited outDir (the five pre-existing TS6059s a plain `-p tsconfig.app.json` hits).
  assert.equal(options.noEmit, true, 'the panel check must not emit');
  assert.equal(
    options.outDir ?? null,
    null,
    'the panel check must carry no outDir: an outDir is what infers the rootDir TS6059 complains about',
  );

  // N4's other half: no suppression in this config of its own.
  assert.ok(
    !('skipLibCheck' in options),
    'the panel config must not set skipLibCheck; inheriting the root config is already a widening, and setting it here would widen further',
  );
  const code = executableText(PANEL_CHECK_CONFIG_PATH);
  assert.ok(
    !/@ts-ignore|@ts-expect-error/.test(code),
    'the panel config must not carry a @ts-ignore or @ts-expect-error',
  );

  console.log(
    `panel-typecheck-scope: panel config include ${JSON.stringify(config.include)}, ` +
      `exclude ${JSON.stringify(config.exclude)}, noEmit ${String(options.noEmit)}, outDir ${String(options.outDir ?? null)}`,
  );
});

// ---------------------------------------------------------------------------
// The root tsconfig — untouched, still type-checking its three entries
// ---------------------------------------------------------------------------

test('the root tsconfig still lists its three entries, two of them absolute', () => {
  const config = readJsonc(ROOT_TSCONFIG_PATH);
  const include = config.include ?? [];

  assert.deepEqual(
    include.map((entry) => basename(entry.split('/').join(sep))).sort(),
    [...ROOT_TSCONFIG_ENTRIES].sort(),
    'the root tsconfig must keep the installed installer scripts and the plugin template',
  );
  assert.equal(
    include.length,
    3,
    'the root tsconfig must list exactly its three entries',
  );
  assert.equal(
    include.filter((entry) => isAbsolute(entry)).length,
    2,
    'the two install-pstack-opencode scripts must stay absolute: the root check resolves them outside this checkout',
  );
  // The entries TypeScript will actually read: an include that names a missing file is a check
  // over nothing, so each one exists.
  for (const entry of include) {
    const path = isAbsolute(entry) ? entry : join(REPO_ROOT, entry);
    assert.ok(
      readFileSync(path, 'utf8').length > 0,
      `the root tsconfig entry ${entry} must resolve to a readable file at ${path}`,
    );
  }
  console.log(
    `panel-typecheck-scope: root tsconfig entries are ${JSON.stringify(include)}`,
  );
});

// ---------------------------------------------------------------------------
// The program — the registry and the milestone's modules are inside it
// ---------------------------------------------------------------------------

test('the panel program contains every panel source, the registry and the milestone modules', () => {
  const program = programFiles(PANEL_CHECK_CONFIG_PATH);
  const inProgram = (relativeToRoot) =>
    program.includes(
      posixPath(join(REPO_ROOT, relativeToRoot.split('/').join(sep))),
    );

  // Breadth over the source tree: every `.ts` the panel owns is in the program, so a file added
  // later is covered without editing this list.
  const sources = sourceFilesUnder(PANEL_SOURCE_ROOT);
  assert.ok(
    sources.length > 0,
    'the panel source walk must find at least one file',
  );
  const uncovered = sources.filter(
    (file) => !program.includes(posixPath(file)),
  );
  assert.deepEqual(
    uncovered.map((file) => displayPath(file)),
    [],
    'every panel source file must be in the program the check builds',
  );

  // The milestone's modules: a registry outside the program could not appear in `--listFiles`.
  const expected = [...MILESTONE_MODULES, ...MILESTONE_SPECS];
  const missing = expected.filter(
    (relativeToRoot) => !inProgram(relativeToRoot),
  );
  assert.deepEqual(
    missing,
    [],
    `the panel check must type-check the milestone's modules; missing from the program: ${JSON.stringify(missing)}`,
  );
  assert.ok(
    inProgram('src/main-world/error-digest.ts') &&
      inProgram('src/panel/error-explainer-view.ts'),
    'the panel imports src/main-world and src/panel modules, so the check must follow it there',
  );

  console.log(
    `panel-typecheck-scope: ${program.length} files in the program, ${sources.length} panel sources covered, ` +
      `${expected.length} milestone modules proven inside it`,
  );
});

// ---------------------------------------------------------------------------
// The stage bites — a deliberate error fails it, the same file fixed passes it
// ---------------------------------------------------------------------------

test('the panel stage fails on a deliberate type error and passes once the file is fixed', () => {
  const temp = mkdtempSync(join(tmpdir(), 'panel-typecheck-scope-'));
  try {
    assert.ok(
      temp.startsWith(tmpdir()),
      `the fixture must live under os.tmpdir(): ${temp}`,
    );
    const probePath = join(temp, 'deliberate-type-error.ts');
    // Extending the real config is what makes this a proof about the real stage: the compiler
    // options that can fail a file — `strict`, the lib set, module resolution, `noEmit` — are the
    // panel's own, inherited from it.
    //
    // Two things are restated here because they are resolved from the config's own directory and
    // the fixture lives outside the checkout:
    //
    // - `types: []` replaces the inherited `vitest/globals`. A `types` entry is resolved against
    //   `<configDir>/node_modules`, which `os.tmpdir()` does not have; with the panel's own type
    //   globals left in, the probe would fail on TS2688 before it reached the probe's file.
    // - the specs are excluded for the same reason: they are what needs those globals. Their
    //   coverage is not claimed here — the `--listFiles` test above proves the real stage compiles
    //   them, which it does with the panel config's `types` intact.
    const configPath = join(temp, 'tsconfig.probe.json');
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          extends: posixPath(PANEL_CHECK_CONFIG_PATH),
          compilerOptions: { types: [] },
          include: [
            posixPath(join(PANEL_SOURCE_ROOT, '**', '*.ts')),
            posixPath(join(PANEL_SOURCE_ROOT, '**', '*.d.ts')),
            posixPath(probePath),
          ],
          exclude: [
            posixPath(join(PANEL_SOURCE_ROOT, '**', '*.node.test.ts')),
            posixPath(join(PANEL_SOURCE_ROOT, '**', '*.node.spec.ts')),
            posixPath(join(PANEL_SOURCE_ROOT, '**', '*.spec.ts')),
          ],
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    const redSource =
      "export const deliberateTypeError: number = 'not a number';\n";
    writeFileSync(probePath, redSource, 'utf8');
    const red = runTsc(configPath);
    assert.notEqual(
      red.status,
      0,
      `a file carrying a deliberate type error must fail the panel stage; got exit ${red.status} with: ${red.output}`,
    );
    assert.ok(
      red.output.includes('TS2322'),
      `the failure must be the deliberate assignment error (TS2322): ${red.output}`,
    );
    const errorLines = red.output
      .split(/\r?\n/)
      .filter((line) => /error TS\d+/.test(line));
    assert.equal(
      errorLines.length,
      1,
      `the deliberate error must be the only error the stage reports, and the panel itself must stay clean: ${JSON.stringify(errorLines)}`,
    );
    assert.ok(
      errorLines[0].includes('deliberate-type-error.ts'),
      `the failure must name the probe file, proving it was compiled and not skipped: ${errorLines[0]}`,
    );

    // The same config, one character class of the probe fixed: now it must pass. Without this the
    // red half would prove only that the temp config is broken.
    writeFileSync(
      probePath,
      'export const deliberateTypeError: number = 42;\n',
      'utf8',
    );
    const green = runTsc(configPath);
    assert.equal(
      green.status,
      0,
      `the fixed file must pass the same config; the stage fails for the error alone: ${green.output}`,
    );

    console.log(
      `panel-typecheck-scope: temp config ${displayPath(configPath)} exited ${red.status} with the deliberate ` +
        `error and ${green.status} once fixed`,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// The companion stage — the package's own program, not a check over nothing
// ---------------------------------------------------------------------------

test('the companion config emits nothing and its program holds the package source tree', () => {
  // A stage over a path that does not resolve is a check over nothing: the config `check:companion`
  // names (asserted above) must exist, and it is the one the program below is read from.
  assert.ok(
    existsSync(COMPANION_CONFIG_PATH),
    `check:companion names ${COMPANION_CONFIG_RELATIVE}, which must resolve inside the checkout`,
  );
  const config = readJsonc(COMPANION_CONFIG_PATH);
  const options = config.compilerOptions ?? {};

  // The stage writes no build output: `noEmit` is the config's own state, and the package's build
  // target is what turns emit back on. Without this, a verify sidecar would gain a `dist/`.
  assert.equal(
    options.noEmit,
    true,
    'the companion config must not emit: the check stage writes no build output',
  );
  // And no suppression of its own, the same rule the panel config is held to.
  assert.ok(
    !/@ts-ignore|@ts-expect-error/.test(executableText(COMPANION_CONFIG_PATH)),
    'the companion config must not carry a @ts-ignore or @ts-expect-error',
  );

  // Breadth, measured rather than trusted: every `.ts` under the package's source root appears in
  // the program `--listFiles` reports. A package outside the program cannot appear there, and an
  // `include` that resolves to nothing leaves the expected list empty below.
  const sources = sourceFilesUnder(COMPANION_SOURCE_ROOT);
  assert.ok(
    sources.length > 0,
    'the companion source walk must find at least one file',
  );
  const program = programFiles(COMPANION_CONFIG_PATH);
  const uncovered = sources.filter(
    (file) => !program.includes(posixPath(file)),
  );
  assert.deepEqual(
    uncovered.map((file) => displayPath(file)),
    [],
    'every companion source file must be in the program the companion stage builds',
  );
  assert.ok(
    program.includes(posixPath(join(COMPANION_SOURCE_ROOT, 'index.ts'))),
    'the companion program must contain the package entry point that calls the app-side provider',
  );

  console.log(
    `panel-typecheck-scope: companion program holds ${program.length} files and covers ` +
      `${sources.length} package sources`,
  );
});

// ---------------------------------------------------------------------------
// The companion stage bites — a deliberate error in its program fails it
// ---------------------------------------------------------------------------

test('the companion stage fails on a deliberate type error in its program and passes once fixed', () => {
  mkdirSync(SCRATCH_ROOT, { recursive: true });
  const temp = mkdtempSync(join(SCRATCH_ROOT, 'companion-typecheck-scope-'));
  try {
    assert.ok(
      temp.startsWith(SCRATCH_ROOT),
      `the fixture must live under the git-ignored ${displayPath(SCRATCH_ROOT)}: ${temp}`,
    );
    const probePath = join(temp, 'deliberate-type-error.ts');
    // Extending the real config is what makes this a proof about the real stage: `strict`,
    // `noUncheckedIndexedAccess`, `isolatedModules`, `verbatimModuleSyntax` and module resolution
    // are the package's own, inherited from it, and the package's real sources are in the program.
    //
    // One thing is restated, because the probe lives outside the package's `rootDir`: `rootDir`
    // itself, widened to the checkout so both the package's sources and the probe are inside it.
    // The alternative — copying the sources to a directory whose `rootDir` holds them — would move
    // the `@angular/*` imports away from the install that resolves them, and a `paths` mapping is
    // exactly the bridge this task may not add.
    const configPath = join(temp, 'tsconfig.probe.json');
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          extends: posixPath(COMPANION_CONFIG_PATH),
          compilerOptions: { rootDir: posixPath(REPO_ROOT) },
          include: [
            posixPath(join(COMPANION_SOURCE_ROOT, '**', '*.ts')),
            posixPath(probePath),
          ],
        },
        null,
        2,
      )}\n`,
      'utf8',
    );

    writeFileSync(
      probePath,
      "export const deliberateTypeError: number = 'not a number';\n",
      'utf8',
    );
    const red = runTsc(configPath);
    assert.notEqual(
      red.status,
      0,
      `a file carrying a deliberate type error must fail the companion stage; got exit ${red.status} with: ${red.output}`,
    );
    const errorLines = red.output
      .split(/\r?\n/)
      .filter((line) => /error TS\d+/.test(line));
    assert.equal(
      errorLines.length,
      1,
      `the deliberate error must be the only error the stage reports, so the package's own sources stay clean in the same program: ${JSON.stringify(errorLines)}`,
    );
    assert.ok(
      errorLines[0].includes('TS2322'),
      `the failure must be the deliberate assignment error (TS2322): ${errorLines[0]}`,
    );
    // The message names the file and the line, which is what proves the file was compiled rather
    // than skipped by an `include` that resolved to nothing.
    assert.ok(
      errorLines[0].includes('deliberate-type-error.ts(1,14)'),
      `the failure must name the probe file and its line: ${errorLines[0]}`,
    );

    // The same config, the probe fixed: now it must pass. Without this the red half would prove
    // only that the temp config is broken.
    writeFileSync(
      probePath,
      'export const deliberateTypeError: number = 42;\n',
      'utf8',
    );
    const green = runTsc(configPath);
    assert.equal(
      green.status,
      0,
      `the fixed file must pass the same config; the stage fails for the error alone: ${green.output}`,
    );

    console.log(
      `panel-typecheck-scope: companion probe ${displayPath(probePath)} exited ${red.status} with the ` +
        `deliberate error on line 1 and ${green.status} once fixed`,
    );
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
