/**
 * M022 T001 — what a development build and a production build of the fixture actually carry, and
 * what a served page in each configuration reports.
 *
 * The question this file answers was asked wrongly once. SYNTHESIS listed `__ngContext__` semantics
 * as `Still unknown`, and both INTENT and the first plan read Angular's own comment — "dev-only" —
 * as a statement about the property. The emitted bytes say something narrower: `attachPatchData`
 * writes `__ngContext__` in **both** configurations, and what a production build drops is the
 * `window.ng` debug surface (`GLOBAL_PUBLISH_EXPANDO_KEY = "ng"` and the utils published through it).
 * So the differential asserted here is:
 *
 *   development: the `__ngContext__` write  **and**  a `window.ng` surface
 *   production:  the same `__ngContext__` write  **and**  no `window.ng` surface
 *
 * Both halves are read from the emitted bytes, and the second is also read from a served page by
 * `spikes/probes/ng-context.js`; the recording in `research/raw/m022-ng-context.json` is compared
 * with both, so a stale or fabricated recording cannot pass.
 *
 * Five properties decide the shape of this file.
 *
 * 1. **Never a bare `ng build`.** The fixture's `defaultConfiguration` is `production`, so every
 *    command this file composes names its configuration explicitly, and the composer refuses one
 *    that does not (asserted below, without building anything).
 * 2. **The development build needs the companion package.** `--configuration development` replaces
 *    `src/app/app.config.ts` with `app.config.dev.ts`, which imports `ai-devtools-companion`, so the
 *    development build runs `npx nx run ai-devtools-companion:build` first; the production
 *    configuration loads no package.
 * 3. **A missing install fails, never skips.** The root install provides Nx, the fixture's own
 *    install provides `@angular/cli`; both are gated at the top of every measurement test with the
 *    command that provisions them, and this file carries no skip directive (asserted below).
 *    `NODE_ENV` is irrelevant to the emitted bytes — measured: the same build under
 *    `NODE_ENV=production` and `NODE_ENV=development` is byte-identical — so the recorded command
 *    reproduces here without an environment prefix.
 * 4. **The recording is checked against the bytes.** Each recorded build object is compared whole
 *    with the measurement taken at this head, and each recorded served reading is cross-checked
 *    against that measurement, so the two halves of the recording must agree with each other and
 *    with the build.
 * 5. **The ruling is `no-dev-api`.** Because `__ngContext__` is present on a production page, the
 *    named outcome for a pick the tool cannot resolve there is about the missing debug API, not
 *    about a missing context; the recording carries that ruling and what the measurement does not
 *    settle, so no reader treats a bundle search as a runtime guarantee.
 *
 * Nothing is written into the tracked tree: both builds land under the git-ignored `tmp/`, and the
 * package's `dist` is its declared, git-ignored build output.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
const REPO_ROOT = resolve(here, '..');

const FIXTURE_ROOT = join(REPO_ROOT, 'spikes', 'ng222-app');
const FIXTURE_SOURCE_ROOT = join(FIXTURE_ROOT, 'src');
const FIXTURE_ANGULAR_JSON = join(FIXTURE_ROOT, 'angular.json');
const FIXTURE_PACKAGE_JSON = join(FIXTURE_ROOT, 'package.json');
const FIXTURE_NG_CLI = join(FIXTURE_ROOT, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const FIXTURE_PACKAGE_LINK = join(FIXTURE_ROOT, 'node_modules', 'ai-devtools-companion');

const NX_CLI = join(REPO_ROOT, 'node_modules', 'nx', 'dist', 'bin', 'nx.js');
const PACKAGE_DIST_ENTRY = join(REPO_ROOT, 'packages', 'ai-devtools-companion', 'dist', 'index.js');

const RECORDING_PATH = join(REPO_ROOT, 'research', 'raw', 'm022-ng-context.json');
const RESEARCH_RAW = join(REPO_ROOT, 'research', 'raw');
const DRIVER_PATH = join(REPO_ROOT, 'spikes', 'probes', 'ng-context.js');

const PROVISION_ROOT = 'npm ci --include=dev';
const PROVISION_FIXTURE = 'npm --prefix spikes/ng222-app ci --include=dev';

/** The package build, in the form a reader runs, and in the form this file runs it (AGENTS.md: the
 * Nx CLI entry for this install is `node_modules/nx/dist/bin/nx.js`, called through `node`). */
const PACKAGE_BUILD_COMMAND = 'npx nx run ai-devtools-companion:build';
const PACKAGE_BUILD_INVOCATION = 'node node_modules/nx/dist/bin/nx.js run ai-devtools-companion:build';

/** The two configurations this file measures, each with its git-ignored output and the served URL
 * of the static server the driver reads. Nothing else is buildable from here. */
const OUTPUT_DIRECTORIES = {
  development: join(REPO_ROOT, 'tmp', 'ng-context', 'dev'),
  production: join(REPO_ROOT, 'tmp', 'ng-context', 'prod'),
};
const OUTPUT_PATHS = { development: 'tmp/ng-context/dev', production: 'tmp/ng-context/prod' };
const SERVED_URLS = { development: 'http://127.0.0.1:4461/', production: 'http://127.0.0.1:4462/' };
const SERVE_COMMANDS = {
  development: 'python -m http.server 4461 --bind 127.0.0.1 --directory tmp/ng-context/dev/browser',
  production: 'python -m http.server 4462 --bind 127.0.0.1 --directory tmp/ng-context/prod/browser',
};

/**
 * The sites that make up the `window.ng` surface Angular publishes at bootstrap. The first five are
 * the publication mechanism itself, so all five must be present for the surface to be believed; the
 * sixth is the helper the page realm would call, recorded beside them.
 */
const NG_GLOBAL_MARKERS = [
  ['expandKeyIsNg', 'var GLOBAL_PUBLISH_EXPANDO_KEY = "ng";'],
  ['globalTableCreated', 'w[GLOBAL_PUBLISH_EXPANDO_KEY] ??= {};'],
  ['helperWritten', 'w[GLOBAL_PUBLISH_EXPANDO_KEY][name] = fn;'],
  ['devModeGuardedCall', 'ngDevMode && publishDefaultGlobalUtils$1();'],
  ['publishGlobalUtilDefined', 'function publishGlobalUtil('],
  ['getOwningComponentDefined', 'getOwningComponent'],
];
const NG_GLOBAL_REQUIRED = NG_GLOBAL_MARKERS.slice(0, 5).map(([name]) => name);

/** The fixture's declared dependencies, frozen: the measurement may not be bought with a new one. */
const FIXTURE_DEPENDENCIES = [
  '@angular/aria',
  '@angular/cdk',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/material',
  '@angular/platform-browser',
  '@angular/router',
  'ai-devtools-companion',
  'rxjs',
  'tslib',
];
const FIXTURE_DEV_DEPENDENCIES = [
  '@angular/build',
  '@angular/cli',
  '@angular/compiler-cli',
  '@vitest/browser',
  '@vitest/browser-playwright',
  'playwright',
  'prettier',
  'typescript',
  'vitest',
  'vitest-browser-angular',
];

/**
 * The fixture's two build configurations, frozen. The differential only means what it says while
 * these stay as they are: `optimization: false` is what keeps the development bundle unminified and
 * searchable, the one `fileReplacement` is what makes the development build need the package, and
 * the production configuration's `outputHashing` and budgets are the production build's shape.
 */
const FROZEN_DEVELOPMENT_CONFIGURATION = {
  optimization: false,
  extractLicenses: false,
  sourceMap: true,
  preserveSymlinks: true,
  fileReplacements: [{ replace: 'src/app/app.config.ts', with: 'src/app/app.config.dev.ts' }],
};
const FROZEN_PRODUCTION_CONFIGURATION = {
  budgets: [
    { type: 'initial', maximumWarning: '500kB', maximumError: '1MB' },
    { type: 'anyComponentStyle', maximumWarning: '4kB', maximumError: '8kB' },
  ],
  outputHashing: 'all',
};

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

function displayPath(absolutePath) {
  return relative(REPO_ROOT, absolutePath).split(sep).join('/');
}

function posixPath(absolutePath) {
  return absolutePath.split(sep).join('/');
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

/** Runs a command with the current environment; a spawn failure is a test failure, not a skip. */
function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    timeout: 600_000,
    ...options,
  });
  assert.ok(
    !result.error,
    `${command} ${args.join(' ')} must be runnable: ${result.error?.message ?? 'unknown spawn failure'}`,
  );
  return {
    status: result.status,
    output: `${String(result.stdout ?? '')}${String(result.stderr ?? '')}`,
  };
}

/** Every file under a directory, recursively. */
function filesUnder(directory) {
  const found = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...filesUnder(path));
    } else if (entry.isFile()) {
      found.push(path);
    }
  }
  return found.sort();
}

function versionOf(packageJsonPath) {
  return existsSync(packageJsonPath) ? readJson(packageJsonPath).version : null;
}

function fixtureAngularVersion() {
  return versionOf(join(FIXTURE_ROOT, 'node_modules', '@angular', 'core', 'package.json'));
}

// ---------------------------------------------------------------------------
// The two builds and the byte-level analysis
// ---------------------------------------------------------------------------

/** The command a reader runs for one configuration: the fixture's own CLI, configuration named. */
function buildCommand(configuration) {
  return (
    'node node_modules/@angular/cli/bin/ng.js build' +
    ` --configuration ${configuration} --output-path ../../${OUTPUT_PATHS[configuration]}`
  );
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function snippetAround(text, index, before, after) {
  return text.slice(Math.max(0, index - before), index + after);
}

/**
 * Reads the two properties the differential is about out of one emitted browser bundle.
 *
 * The `__ngContext__` write is found through the constant Angular binds the property name to — under
 * its own name in the unminified development bundle, under a minified alias in the production one —
 * and then through at least one assignment whose computed key is that constant. A read of the
 * property is not a write, and a property name in a comment is neither.
 *
 * The `window.ng` surface is found through the five sites that publish it; all five must be present.
 */
function analyseBundle({ configuration, text, bundles }) {
  const lines = text.split('\n');
  const constant = text.match(/var ([A-Za-z0-9_$]+) ?= ?"__ngContext__"/);
  const identifier = constant ? constant[1] : null;
  const writePattern =
    identifier === null
      ? null
      : new RegExp(`\\[${escapeForRegExp(identifier)}\\]\\s*=\\s*(?!=)`, 'g');
  const writes = writePattern === null ? [] : [...text.matchAll(writePattern)];

  return {
    configuration,
    bundles,
    bytes: text.length,
    unminified: lines.length > 1000 && text.length / Math.max(lines.length, 1) < 200,
    ngContextWrite: {
      present: identifier !== null && writes.length > 0,
      binding: constant ? constant[0] : null,
      identifier,
      writeSites: writes.length,
      writeSnippets: writes.map((match) => snippetAround(text, match.index, 40, 60)),
    },
    ngGlobalSurface: {
      present: NG_GLOBAL_REQUIRED.every((name) =>
        text.includes(NG_GLOBAL_MARKERS.find(([markerName]) => markerName === name)[1]),
      ),
      markers: Object.fromEntries(
        NG_GLOBAL_MARKERS.map(([name, marker]) => [name, text.includes(marker)]),
      ),
      evidence: text.includes('var GLOBAL_PUBLISH_EXPANDO_KEY = "ng";')
        ? 'var GLOBAL_PUBLISH_EXPANDO_KEY = "ng"; ... w[GLOBAL_PUBLISH_EXPANDO_KEY][name] = fn;'
        : null,
    },
  };
}

/**
 * Builds the fixture with an explicitly named configuration and returns the analysis of its emitted
 * browser bundle. A configuration that is absent or not one of the two this file measures is refused
 * before anything runs, so there is no way to reach a bare `ng build` from here.
 */
function buildFixture(configuration) {
  assert.ok(
    typeof configuration === 'string' &&
      configuration.length > 0 &&
      Object.hasOwn(OUTPUT_DIRECTORIES, configuration),
    'a configuration must be named explicitly: the fixture defaults to production',
  );
  assert.ok(
    existsSync(FIXTURE_NG_CLI),
    `the fixture must carry its own install for ${displayPath(FIXTURE_NG_CLI)} — run ${PROVISION_FIXTURE}`,
  );

  const outputDirectory = OUTPUT_DIRECTORIES[configuration];
  const result = run(
    process.execPath,
    [
      FIXTURE_NG_CLI,
      'build',
      '--configuration',
      configuration,
      '--output-path',
      posixPath(relative(FIXTURE_ROOT, outputDirectory)),
    ],
    { cwd: FIXTURE_ROOT },
  );
  assert.equal(
    result.status,
    0,
    `ng build --configuration ${configuration} of ${displayPath(FIXTURE_ROOT)} must succeed: ${result.output}`,
  );
  assert.match(
    result.output,
    /Application bundle generation complete/,
    `the build must report a completed bundle: ${result.output}`,
  );

  const browserDirectory = join(outputDirectory, 'browser');
  assert.ok(existsSync(browserDirectory), `the build must emit ${displayPath(browserDirectory)}`);
  const bundles = readdirSync(browserDirectory).filter((name) => name.endsWith('.js')).sort();
  assert.ok(bundles.length > 0, 'the build must emit at least one browser bundle');
  const text = bundles.map((name) => readFileSync(join(browserDirectory, name), 'utf8')).join('\n');

  return {
    ...analyseBundle({ configuration, text, bundles }),
    command: buildCommand(configuration),
    cwd: 'spikes/ng222-app',
    outputPath: OUTPUT_PATHS[configuration],
  };
}

/** Builds the package through its declared target, so the development build resolves its entry. */
function buildPackage() {
  assert.ok(
    existsSync(NX_CLI),
    `the package build runs through ${displayPath(NX_CLI)} — run ${PROVISION_ROOT}`,
  );
  const result = run(process.execPath, [NX_CLI, 'run', 'ai-devtools-companion:build']);
  assert.equal(result.status, 0, `the package's build target must succeed: ${result.output}`);
  assert.ok(
    existsSync(PACKAGE_DIST_ENTRY),
    `the build target must emit ${displayPath(PACKAGE_DIST_ENTRY)}`,
  );
}

// ---------------------------------------------------------------------------
// The measurements, taken once and shared by the assertions and the recording check
// ---------------------------------------------------------------------------

/**
 * Whether this checkout can take the measurements at all. The root install provides the Nx CLI, the
 * fixture's own install provides `@angular/cli` and the linked package. This file's Verify provisions
 * both. A checkout without them **fails** the tests below and names the command that provisions the
 * missing install: a test that carries an acceptance criterion may not pass by not running, so a
 * missing prerequisite is red here, never green-by-skip. The fixture install needs `--include=dev`
 * because this host exports `NODE_ENV=production`, which otherwise drops the fixture's
 * devDependencies and with them `@angular/cli`.
 */
const MISSING_ROOT_INSTALL = existsSync(NX_CLI)
  ? false
  : `the root install is absent (${displayPath(NX_CLI)}); run ${PROVISION_ROOT}`;
const MISSING_FIXTURE_INSTALL =
  existsSync(FIXTURE_NG_CLI) && existsSync(FIXTURE_PACKAGE_LINK)
    ? false
    : `the fixture install is absent (${displayPath(join(FIXTURE_ROOT, 'node_modules'))}); run ${PROVISION_FIXTURE}`;
const MISSING_MEASUREMENT_ENVIRONMENT = MISSING_ROOT_INSTALL || MISSING_FIXTURE_INSTALL;

/** The precondition every measurement test opens with: `false` means the prerequisite is satisfied. */
function requirePrerequisite(missing) {
  assert.equal(missing, false, `the __ngContext__ measurement cannot run: ${missing}`);
}

const measurements = new Map();

/** One configuration's build plus its analysis; the development build builds the package first. */
function measurement(configuration) {
  if (!measurements.has(configuration)) {
    if (configuration === 'development') {
      buildPackage();
    }
    measurements.set(configuration, buildFixture(configuration));
  }
  return measurements.get(configuration);
}

// ---------------------------------------------------------------------------
// AC1 — every composed command names its configuration, and the installs are gated
// ---------------------------------------------------------------------------

test('every composed build names its configuration, and a composer without one is refused (AC1)', () => {
  requirePrerequisite(MISSING_ROOT_INSTALL);
  requirePrerequisite(MISSING_FIXTURE_INSTALL);

  for (const configuration of Object.keys(OUTPUT_DIRECTORIES)) {
    assert.match(
      buildCommand(configuration),
      new RegExp(`build --configuration ${configuration} --output-path`),
      'each composed command must name its configuration explicitly',
    );
    assert.ok(
      OUTPUT_PATHS[configuration].startsWith('tmp/'),
      'both builds must land under the git-ignored tmp/',
    );
  }
  for (const refused of ['', 'test', 'production ']) {
    assert.throws(
      () => buildFixture(refused),
      /a configuration must be named explicitly/,
      `"${refused}" must be refused before anything runs`,
    );
  }

  assert.equal(PACKAGE_BUILD_COMMAND, 'npx nx run ai-devtools-companion:build');
  assert.equal(posixPath(NX_CLI).endsWith('node_modules/nx/dist/bin/nx.js'), true);
  console.log(
    `ng-context-dev-build: root install present, fixture install present at ${fixtureAngularVersion()}; ` +
      `commands ${JSON.stringify(Object.keys(OUTPUT_DIRECTORIES).map(buildCommand))}`,
  );
});

// ---------------------------------------------------------------------------
// AC2 — the differential, from the emitted bytes
// ---------------------------------------------------------------------------

test('the development bundle carries the __ngContext__ write and a window.ng surface (AC2)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  const build = measurement('development');

  assert.equal(build.unminified, true, 'the development bundle must be unminified for a search to mean anything');
  assert.equal(
    build.ngContextWrite.present,
    true,
    `the development bundle must write __ngContext__: ${JSON.stringify(build.ngContextWrite)}`,
  );
  assert.equal(build.ngContextWrite.identifier, 'MONKEY_PATCH_KEY_NAME');
  assert.ok(build.ngContextWrite.writeSites >= 2, 'both branches of attachPatchData must write the property');
  assert.equal(
    build.ngGlobalSurface.present,
    true,
    `the development bundle must publish window.ng: ${JSON.stringify(build.ngGlobalSurface)}`,
  );
  for (const name of NG_GLOBAL_REQUIRED) {
    assert.equal(build.ngGlobalSurface.markers[name], true, `the window.ng marker ${name} must be present`);
  }

  console.log(
    `ng-context-dev-build: development ${JSON.stringify(build.bundles)} ${build.bytes}B unminified, ` +
      `__ngContext__ written ${build.ngContextWrite.writeSites}x via ${build.ngContextWrite.identifier}, ` +
      `window.ng present (${JSON.stringify(build.ngGlobalSurface.markers)})`,
  );
});

test('the production bundle carries the same __ngContext__ write and no window.ng surface (AC2)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  const build = measurement('production');

  assert.equal(build.unminified, false, 'the production bundle must be minified');
  assert.equal(
    build.ngContextWrite.present,
    true,
    `the production bundle must write __ngContext__ too: ${JSON.stringify(build.ngContextWrite)}`,
  );
  assert.match(
    build.ngContextWrite.binding,
    /var [A-Za-z0-9_$]+="__ngContext__"$/,
    'the production bundle binds the same property name to a minified alias',
  );
  assert.notEqual(build.ngContextWrite.identifier, 'MONKEY_PATCH_KEY_NAME', 'the production bundle is minified');
  assert.ok(build.ngContextWrite.writeSites >= 1, 'the production bundle must assign through the alias');
  assert.equal(
    build.ngGlobalSurface.present,
    false,
    `the production bundle must publish no window.ng: ${JSON.stringify(build.ngGlobalSurface)}`,
  );
  for (const name of NG_GLOBAL_REQUIRED) {
    assert.equal(build.ngGlobalSurface.markers[name], false, `the window.ng marker ${name} must be absent`);
  }
  assert.equal(build.ngGlobalSurface.evidence, null);

  console.log(
    `ng-context-dev-build: production ${JSON.stringify(build.bundles)} ${build.bytes}B minified, ` +
      `__ngContext__ written ${build.ngContextWrite.writeSites}x via ${build.ngContextWrite.identifier}, ` +
      `window.ng absent`,
  );
});

// ---------------------------------------------------------------------------
// AC3, AC4 — the recording agrees with the bytes and with itself
// ---------------------------------------------------------------------------

test('the recording is present, names both configurations and matches the bytes measured at this head (AC3, AC4)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  assert.ok(
    existsSync(RECORDING_PATH),
    `the measurement must be recorded at ${displayPath(RECORDING_PATH)}`,
  );
  const recording = readJson(RECORDING_PATH);

  assert.equal(recording.app, 'spikes/ng222-app');
  assert.equal(recording.angular, fixtureAngularVersion(), 'the recording must name the Angular version it measured');
  assert.equal(recording.packageBuild.command, PACKAGE_BUILD_COMMAND);
  assert.equal(recording.packageBuild.equivalentInvocation, PACKAGE_BUILD_INVOCATION);
  assert.match(recording.packageBuild.why, /development configuration|development build/);

  for (const configuration of Object.keys(OUTPUT_DIRECTORIES)) {
    const recorded = recording.builds[configuration];
    assert.ok(recorded, `the recording must name the ${configuration} build`);
    assert.equal(recorded.configuration, configuration, 'a recorded build must name its configuration');
    assert.equal(recorded.command, buildCommand(configuration));
    assert.equal(recorded.cwd, 'spikes/ng222-app');
    assert.equal(recorded.outputPath, OUTPUT_PATHS[configuration]);
    // The build half, compared whole with the bytes this file just produced.
    assert.deepEqual(recorded, measurement(configuration), `the recorded ${configuration} build must match the emitted bytes`);
  }

  assert.equal(recording.builds.development.ngContextWrite.present, true);
  assert.equal(recording.builds.production.ngContextWrite.present, true);
  assert.equal(recording.builds.development.ngGlobalSurface.present, true);
  assert.equal(recording.builds.production.ngGlobalSurface.present, false);
  assert.equal(recording.differential.ngContextWrite, 'present in both configurations');
  assert.equal(recording.differential.ngGlobalSurface, 'development only');
  assert.equal(
    recording.builds.development.ngContextWrite.binding,
    'var MONKEY_PATCH_KEY_NAME = "__ngContext__"',
  );

  console.log(
    `ng-context-dev-build: recording ${displayPath(RECORDING_PATH)} matches both builds — ` +
      `__ngContext__ ${JSON.stringify([recording.builds.development.ngContextWrite.writeSites, recording.builds.production.ngContextWrite.writeSites])} writes, ` +
      `window.ng ${JSON.stringify([recording.builds.development.ngGlobalSurface.present, recording.builds.production.ngGlobalSurface.present])}`,
  );
});

// ---------------------------------------------------------------------------
// AC3, AC6 — the served readings are the driver's own, and they agree with the bytes
// ---------------------------------------------------------------------------

test('the recorded served readings are the driver\'s own, plain data, and agree with the emitted bytes (AC3, AC6)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  const recording = readJson(RECORDING_PATH);
  const served = recording.served;

  assert.equal(served.driver, 'spikes/probes/ng-context.js');
  assert.match(served.command, /control\.mjs run \S+ spikes\/probes\/ng-context\.js$/);
  assert.deepEqual(
    served.reading,
    JSON.parse(JSON.stringify(served.reading)),
    'the driver must return plain data only',
  );

  for (const configuration of Object.keys(SERVED_URLS)) {
    assert.equal(served.servers[configuration].url, SERVED_URLS[configuration]);
    assert.equal(served.servers[configuration].command, SERVE_COMMANDS[configuration]);
    assert.equal(
      served.servers[configuration].directory,
      `${OUTPUT_PATHS[configuration]}/browser`,
      'each server must stand in front of that configuration’s own output',
    );
    assert.equal(served.reading[configuration].url, SERVED_URLS[configuration]);
    assert.equal(
      served.reading[configuration].ngVersionAttribute,
      fixtureAngularVersion(),
      'the served page must report the fixture’s own Angular version',
    );
  }

  const development = served.reading.development;
  const production = served.reading.production;
  assert.equal(development.templateElement.tag, 'button');
  assert.equal(development.templateElement.hasNgContext, true, 'a template element on a development page carries a context');
  assert.equal(production.templateElement.tag, 'button');
  assert.equal(production.templateElement.hasNgContext, true, 'a template element on a production page carries a context too');
  assert.equal(development.componentHost.hasNgContext, true);
  assert.equal(production.componentHost.hasNgContext, true);
  assert.equal(development.ngGlobalType, 'object', 'the development page must publish window.ng');
  assert.equal(production.ngGlobalType, 'undefined', 'the production page must publish no window.ng');
  assert.equal(development.ngOwningComponentType, 'function');
  assert.equal(production.ngOwningComponentType, 'undefined');
  assert.equal(typeof development.appRootComponentName, 'string');
  assert.equal(production.appRootComponentName, null);
  assert.equal(served.reading.differential.contextOnTemplateElement, 'same');
  assert.equal(served.reading.differential.contextOnComponentHost, 'same');
  assert.equal(served.reading.differential.ngGlobal, 'development-only');

  // The served half and the build half may not disagree: what the bytes say about the surface is
  // what the page reports, and what both builds say about the context is what both pages carry.
  const developmentBuild = measurement('development');
  const productionBuild = measurement('production');
  assert.equal(developmentBuild.ngGlobalSurface.present, development.ngGlobalType === 'object');
  assert.equal(productionBuild.ngGlobalSurface.present, production.ngGlobalType === 'object');
  assert.equal(
    developmentBuild.ngContextWrite.present && productionBuild.ngContextWrite.present,
    development.templateElement.hasNgContext && production.templateElement.hasNgContext,
  );

  console.log(
    `ng-context-dev-build: served ${development.url} → __ngContext__ ${development.templateElement.hasNgContext} on <${development.templateElement.tag}>, ` +
      `window.ng ${development.ngGlobalType}; ${production.url} → __ngContext__ ${production.templateElement.hasNgContext} on <${production.templateElement.tag}>, ` +
      `window.ng ${production.ngGlobalType}`,
  );
});

// ---------------------------------------------------------------------------
// AC3, AC5 — the ruling, and what the measurement does not settle
// ---------------------------------------------------------------------------

test('the recording carries the no-dev-api ruling and names what the measurement does not settle (AC3, AC5)', () => {
  const recording = readJson(RECORDING_PATH);
  const ruling = recording.ruling;

  assert.equal(ruling.productionPage, 'no-dev-api');
  assert.equal(ruling.developmentPage, 'debug-api available');
  assert.equal(ruling.contextOnATemplateElement, 'present in both configurations');
  assert.equal(ruling.supersededOutcome, 'no-dev-context');
  assert.match(ruling.statement, /__ngContext__/);
  assert.match(ruling.statement, /no-dev-api/);
  assert.match(ruling.supersededBecause, /production build writes __ngContext__/);

  assert.ok(Array.isArray(recording.doesNotSettle), 'the recording must say what it does not settle');
  assert.ok(recording.doesNotSettle.length > 0);
  for (const entry of recording.doesNotSettle) {
    assert.ok(entry.question.length > 0, 'every open question must be stated');
    assert.ok(entry.stillOpen.length > 0, 'every open question must say what remains open');
    assert.ok(entry.probeThatWouldSettleIt.length > 0, 'every open question must name the probe that would settle it');
  }
  const runtimeElement = recording.doesNotSettle.find((entry) =>
    /inside a component's template/.test(entry.question),
  );
  assert.ok(runtimeElement, 'the recording must name the runtime-element question a bundle search cannot answer');
  assert.match(runtimeElement.question, /a dev context that no bundle search can see/);
  assert.match(runtimeElement.question, /inside a component's template/);
  assert.match(runtimeElement.settledFor, /app-counter button/);
  assert.match(runtimeElement.probeThatWouldSettleIt, /spikes\/probes\/ng-context\.js/);

  console.log(
    `ng-context-dev-build: ruling ${ruling.productionPage}, ${recording.doesNotSettle.length} open question(s) recorded`,
  );
});

// ---------------------------------------------------------------------------
// AC6 — the driver's shape
// ---------------------------------------------------------------------------

test('the driver is a `control-ai-browsers run` probe that only reads and returns plain data (AC6)', () => {
  const source = readFileSync(DRIVER_PATH, 'utf8');
  assert.match(source, /^async page => \{$/m, 'the driver must be a run-driver: async page => { ... }');

  for (const forbidden of [
    'createElement',
    'appendChild',
    'insertBefore',
    'removeChild',
    'setAttribute',
    'innerHTML',
    'outerHTML',
    'classList',
    'textContent =',
    'window.ng =',
    'globalThis.ng =',
    'page.click',
    'page.fill',
  ]) {
    assert.equal(
      source.includes(forbidden),
      false,
      `the driver must touch no page node and write no page global: ${forbidden}`,
    );
  }
  for (const url of Object.values(SERVED_URLS)) {
    assert.ok(source.includes(url), `the driver must read the served page at ${url}`);
  }
  assert.match(source, /return page\.evaluate\(/, 'the reading must be taken in the page realm');
  assert.match(source, /return \{\s*development,\s*production,\s*differential:/);

  console.log(`ng-context-dev-build: driver ${displayPath(DRIVER_PATH)} is read-only and names both servers`);
});

// ---------------------------------------------------------------------------
// AC7 — the fixture and the tree are as this measurement found them
// ---------------------------------------------------------------------------

test('the fixture is untouched: its dependencies and both build configurations are the measured ones (AC7)', () => {
  const fixturePackage = readJson(FIXTURE_PACKAGE_JSON);
  assert.deepEqual(Object.keys(fixturePackage.dependencies).sort(), FIXTURE_DEPENDENCIES);
  assert.deepEqual(Object.keys(fixturePackage.devDependencies).sort(), FIXTURE_DEV_DEPENDENCIES);

  const build = readJson(FIXTURE_ANGULAR_JSON).projects['ng222-app'].architect.build;
  assert.equal(build.defaultConfiguration, 'production', 'the fixture’s default stays production: hence the explicit flag');
  assert.deepEqual(build.configurations.development, FROZEN_DEVELOPMENT_CONFIGURATION);
  assert.deepEqual(build.configurations.production, FROZEN_PRODUCTION_CONFIGURATION);

  // The fixture's own source cannot have been instrumented to produce the reading it is measured for.
  const instrumented = filesUnder(FIXTURE_SOURCE_ROOT)
    .filter((path) => /__ngContext__|window\.ng/.test(readFileSync(path, 'utf8')))
    .map(displayPath);
  assert.deepEqual(instrumented, [], 'the fixture source must not read or write the properties under measurement');

  // AC7's tree-wide half is a property of the diff, which the reviewer reads with git; what a test
  // can hold is that this task's own artifacts are the three declared paths and that none of them is
  // Markdown — the docs-audit gate derives its frozen inventory from the tracked Markdown tree, so a
  // Markdown file beside the measurement would be a new document.
  assert.deepEqual(
    [RECORDING_PATH, DRIVER_PATH, fileURLToPath(import.meta.url)].map(displayPath),
    ['research/raw/m022-ng-context.json', 'spikes/probes/ng-context.js', 'scripts/ng-context-dev-build.test.mjs'],
  );
  assert.deepEqual(
    readdirSync(RESEARCH_RAW).filter((name) => name.endsWith('.md')),
    [],
    'the measurement is a JSON recording: no Markdown document is added beside it',
  );

  console.log('ng-context-dev-build: fixture dependencies, both configurations and the artifact paths are pinned');
});

// ---------------------------------------------------------------------------
// AC1, AC4 — this file cannot pass by not running
// ---------------------------------------------------------------------------

test('this file fails rather than skips when a prerequisite is absent (AC1, AC4)', () => {
  const source = readFileSync(fileURLToPath(import.meta.url), 'utf8');
  assert.equal(/\.skip\s*\(/.test(source), false, 'this file may carry no skip');
  assert.equal(/skip:\s*true/.test(source), false, 'no test may be declared skippable');
  assert.ok(
    (source.match(/requirePrerequisite\(/g) ?? []).length >= 6,
    'every measurement test must open with the install gate',
  );
  assert.ok(MISSING_ROOT_INSTALL === false || /npm ci --include=dev/.test(MISSING_ROOT_INSTALL));
  assert.ok(MISSING_FIXTURE_INSTALL === false || /--include=dev/.test(MISSING_FIXTURE_INSTALL));

  console.log('ng-context-dev-build: no skip directive; the install gate names its provisioning command');
});
