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
 * Five properties, each one a way the scope could quietly shrink:
 *
 * 1. The `check` chain still runs every stage it ran before — `ensure-sidecar-deps`, the root
 *    `tsc -p tsconfig.json`, `check:skills` — and ends with `check:panel`. A dropped stage is a
 *    narrowed check even when the new stage is present.
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
 *
 * Then the stage is made to bite: a temp config under `os.tmpdir()` that extends the real one and
 * adds a single file holding a deliberate type error must exit non-zero, and the same config with
 * that file fixed must exit zero. Without that pair, every assertion above could be satisfied by
 * a compile that reports nothing. Nothing is ever written into the checkout: the temp config and
 * its probe file live in a `mkdtempSync` directory removed in a `finally`, and the repository
 * files are only read.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
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

/** The panel config, relative to the panel project — the form `check:panel` must name. */
const PANEL_CHECK_CONFIG_RELATIVE = 'apps/angular-ai-devtools/tsconfig.check.json';

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
  return absolutePath.split(sep).join('/').replace(`${REPO_ROOT.split(sep).join('/')}/`, '');
}

/** A path in the forward-slash form a tsconfig can carry anywhere. */
function posixPath(absolutePath) {
  return absolutePath.split(sep).join('/');
}

// ---------------------------------------------------------------------------
// Walking and driving TypeScript
// ---------------------------------------------------------------------------

/** Every `.ts` file under a directory, sorted, with the `node:test` shapes dropped — the set the
 * panel config promises to cover. */
function panelSourceFiles(directory = PANEL_SOURCE_ROOT) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...panelSourceFiles(path));
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
  const result = spawnSync(process.execPath, [TSC, '-p', configPath, ...extraArgs], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 300_000,
  });
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
  assert.ok(files.length > 0, 'tsc --listFiles must report the program it built');
  return files;
}

// ---------------------------------------------------------------------------
// The package scripts — the stage exists, runs last and names the panel config
// ---------------------------------------------------------------------------

test('the check chain runs every stage it ran before and ends with the panel stage', () => {
  const pkg = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
  const script = pkg.scripts?.check;
  assert.equal(typeof script, 'string', 'package.json must carry a check script');

  // N4 in one assertion: the three pre-existing stages, in order, and the new stage last. A
  // dropped stage fails here even though `check:panel` is present.
  const stages = script.split('&&').map((stage) => stage.trim());
  assert.deepEqual(
    stages,
    [
      'node scripts/ensure-sidecar-deps.mjs',
      'tsc -p tsconfig.json',
      'npm run check:skills',
      'npm run check:panel',
    ],
    'check must keep its three pre-existing stages and end with check:panel',
  );

  assert.equal(
    pkg.scripts['check:panel'],
    `tsc -p ${PANEL_CHECK_CONFIG_RELATIVE}`,
    'check:panel must run tsc against the panel check config and nothing else',
  );
  console.log(`panel-typecheck-scope: check chain is ${JSON.stringify(stages)}`);
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
  assert.equal(include.length, 3, 'the root tsconfig must list exactly its three entries');
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
  console.log(`panel-typecheck-scope: root tsconfig entries are ${JSON.stringify(include)}`);
});

// ---------------------------------------------------------------------------
// The program — the registry and the milestone's modules are inside it
// ---------------------------------------------------------------------------

test('the panel program contains every panel source, the registry and the milestone modules', () => {
  const program = programFiles(PANEL_CHECK_CONFIG_PATH);
  const inProgram = (relativeToRoot) =>
    program.includes(posixPath(join(REPO_ROOT, relativeToRoot.split('/').join(sep))));

  // Breadth over the source tree: every `.ts` the panel owns is in the program, so a file added
  // later is covered without editing this list.
  const sources = panelSourceFiles();
  assert.ok(sources.length > 0, 'the panel source walk must find at least one file');
  const uncovered = sources.filter((file) => !program.includes(posixPath(file)));
  assert.deepEqual(
    uncovered.map((file) => displayPath(file)),
    [],
    'every panel source file must be in the program the check builds',
  );

  // The milestone's modules: a registry outside the program could not appear in `--listFiles`.
  const expected = [...MILESTONE_MODULES, ...MILESTONE_SPECS];
  const missing = expected.filter((relativeToRoot) => !inProgram(relativeToRoot));
  assert.deepEqual(
    missing,
    [],
    `the panel check must type-check the milestone's modules; missing from the program: ${JSON.stringify(missing)}`,
  );
  assert.ok(
    inProgram('src/main-world/error-digest.ts') && inProgram('src/panel/error-explainer-view.ts'),
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
    assert.ok(temp.startsWith(tmpdir()), `the fixture must live under os.tmpdir(): ${temp}`);
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

    const redSource = "export const deliberateTypeError: number = 'not a number';\n";
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
    const errorLines = red.output.split(/\r?\n/).filter((line) => /error TS\d+/.test(line));
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
    writeFileSync(probePath, 'export const deliberateTypeError: number = 42;\n', 'utf8');
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
