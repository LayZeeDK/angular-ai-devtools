/**
 * SC4's two halves, on the fixture and on the development configuration only (N5).
 *
 * The build half builds `spikes/ng222-app` with `ng build --configuration development` into a
 * git-ignored `tmp/` output path and searches the emitted *unminified* browser bundle for the
 * entry name and for the class the entry carries. The serve half is the recorded reading in
 * `research/raw/companion-dev-build.json`, which this file reads; a missing recording, a field
 * that disagrees with the build just made, or a recording that names a non-development
 * configuration fails the test.
 *
 * Four properties decide the shape of this file.
 *
 * 1. **Never a bare `ng build`.** The fixture's `defaultConfiguration` is `production`, so the only
 *    command this file composes names `--configuration development`; the helper refuses to build
 *    without a named configuration, so the reflexive command is unreachable from here.
 * 2. **The peer-resolution question is measured, not assumed.** npm installs the fixture's
 *    directory `file:` specifier as a symlink, so the builder's default realpath resolution would
 *    anchor the package's `@angular/*` imports at the package root — the root checkout's 22.1.8 —
 *    and put two Angular copies in one bundle. This file measures both anchors, asserts the
 *    fixture's development configuration selects the symlink anchor with `preserveSymlinks: true`,
 *    and then proves the option is load-bearing by building the same fixture once with it turned
 *    off and reading the two-copy signature out of that bundle too.
 * 3. **One Angular copy is a property of the emitted bundle.** The duplicate is visible as the root
 *    checkout's `@license Angular v…` banner beside the fixture's, and as a second
 *    `var Router = class` binding that the facade literal actually points at (`Router2`). Both are
 *    asserted, so "the classes are the app's classes" is checked rather than reasoned about.
 * 4. **The recording must agree with the measurements.** Every recorded measurement — the build
 *    half, the peer resolutions, the counterexample and the served page's key arithmetic — is
 *    compared with what this file measured, so a stale or fabricated recording cannot pass.
 *
 * Nothing is written into the tracked tree: the package's `dist` is its declared, git-ignored build
 * output, and both fixture builds land under the repository's git-ignored `tmp/`.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, realpathSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/** The repository root, resolved from this file — never a host-absolute path. */
const REPO_ROOT = resolve(here, '..');

const FIXTURE_ROOT = join(REPO_ROOT, 'spikes', 'ng222-app');
const FIXTURE_ANGULAR_JSON = join(FIXTURE_ROOT, 'angular.json');
const FIXTURE_PACKAGE_JSON = join(FIXTURE_ROOT, 'package.json');
const FIXTURE_LOCK = join(FIXTURE_ROOT, 'package-lock.json');
const FIXTURE_SOURCE_ROOT = join(FIXTURE_ROOT, 'src');
const BASE_APP_CONFIG = join(FIXTURE_SOURCE_ROOT, 'app', 'app.config.ts');
const DEV_APP_CONFIG = join(FIXTURE_SOURCE_ROOT, 'app', 'app.config.dev.ts');
const MAIN_TS = join(FIXTURE_SOURCE_ROOT, 'main.ts');

const PACKAGE_ROOT = join(REPO_ROOT, 'packages', 'ai-devtools-companion');
const PACKAGE_JSON = join(PACKAGE_ROOT, 'package.json');
const PACKAGE_PROJECT_JSON = join(PACKAGE_ROOT, 'project.json');
const PACKAGE_TSCONFIG = join(PACKAGE_ROOT, 'tsconfig.json');
const PACKAGE_DIST_ENTRY = join(PACKAGE_ROOT, 'dist', 'index.js');

const RECORDING_PATH = join(REPO_ROOT, 'research', 'raw', 'companion-dev-build.json');

/** The git-ignored output paths the two builds write; the recording names the first. */
const OUTPUT_DIR = join(REPO_ROOT, 'tmp', 'facade-dev-build');
const COUNTER_EXAMPLE_DIR = join(REPO_ROOT, 'tmp', 'facade-dev-build-two-copies');

const NX_CLI = join(REPO_ROOT, 'node_modules', 'nx', 'dist', 'bin', 'nx.js');
const FIXTURE_NG_CLI = join(FIXTURE_ROOT, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');

/** The entry name, the two vetted symbols, and the peers this milestone fixes. */
const ENTRY_NAME = 'ngAiDevTools';
const VETTED_SYMBOLS = ['@angular/platform-browser#Meta', '@angular/router#Router'];
const PEER_SPECIFIERS = ['@angular/router', '@angular/platform-browser'];

/** The fixture's declared @angular packages at the base, frozen: the resolution may not be bought
 * with a new dependency (AC5). */
const FIXTURE_ANGULAR_DEPENDENCIES = [
  '@angular/aria',
  '@angular/cdk',
  '@angular/common',
  '@angular/compiler',
  '@angular/core',
  '@angular/forms',
  '@angular/material',
  '@angular/platform-browser',
  '@angular/router',
];
const FIXTURE_ANGULAR_DEV_DEPENDENCIES = ['@angular/build', '@angular/cli', '@angular/compiler-cli'];

/** The base `app.config.ts`, frozen: the fixture's own configuration must keep these bytes, so the
 * only way the package reaches the app is the development replacement (AC4). */
const BASE_APP_CONFIG_SOURCE = `import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
`;

/**
 * The option this project must not name (N5). It is assembled from two halves on purpose: no file
 * this task writes spells the identifier, and the assertions below still refuse it anywhere in the
 * files that build the fixture.
 */
const FORBIDDEN_BUILD_OPTION = ['build', 'Optimizer'].join('');

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
  assert.ok(!result.error, `${command} ${args.join(' ')} must be runnable: ${result.error?.message ?? 'unknown spawn failure'}`);
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

/** The provider expressions of an `ApplicationConfig` literal, in order. */
function providersOf(text) {
  const body = text.match(/providers:\s*\[([\s\S]*?)\]/)?.[1] ?? '';
  return body
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

/** The ancestor `node_modules` walk a bundler performs for a package specifier from `from`. */
function resolveFromAncestors(from, specifier) {
  let directory = from;
  for (;;) {
    const candidate = join(directory, 'node_modules', ...specifier.split('/'), 'package.json');
    if (existsSync(candidate)) {
      return candidate;
    }
    const parent = dirname(directory);
    if (parent === directory) {
      return null;
    }
    directory = parent;
  }
}

/** The package directory that owns a resolved entry file. */
function packageDirectoryOf(resolvedFile) {
  const parts = resolvedFile.split(sep);
  const index = parts.lastIndexOf('node_modules');
  if (index === -1) {
    return dirname(resolvedFile);
  }
  const end = parts[index + 1]?.startsWith('@') ? index + 3 : index + 2;
  return parts.slice(0, end).join(sep);
}

function versionOf(packageJsonPath) {
  return packageJsonPath && existsSync(packageJsonPath) ? readJson(packageJsonPath).version : null;
}

/** The version of a package as the given root installs it. */
function installedVersion(requireFrom, specifier) {
  return versionOf(join(packageDirectoryOf(requireFrom.resolve(specifier)), 'package.json'));
}

// ---------------------------------------------------------------------------
// The two builds and the bundle analysis
// ---------------------------------------------------------------------------

/**
 * Builds the fixture with an explicitly named configuration and returns the emitted browser
 * bundle. `configuration` is required: there is no way to reach a bare `ng build` from here.
 */
function buildFixture({ configuration, outputDirectory, extraArguments = [] }) {
  assert.ok(
    typeof configuration === 'string' && configuration.length > 0,
    'a configuration must be named explicitly: the fixture defaults to production',
  );
  assert.ok(
    existsSync(FIXTURE_NG_CLI),
    `the fixture must carry its own install for ${displayPath(FIXTURE_NG_CLI)} — run npm --prefix spikes/ng222-app ci --include=dev`,
  );

  rmSync(outputDirectory, { recursive: true, force: true });
  const args = [
    FIXTURE_NG_CLI,
    'build',
    '--configuration',
    configuration,
    '--output-path',
    posixPath(relative(FIXTURE_ROOT, outputDirectory)),
    ...extraArguments,
  ];
  const result = run(process.execPath, args, { cwd: FIXTURE_ROOT });
  assert.equal(
    result.status,
    0,
    `ng build --configuration ${configuration} of ${displayPath(FIXTURE_ROOT)} must succeed: ${result.output}`,
  );
  assert.match(result.output, /Application bundle generation complete/, `the build must report a completed bundle: ${result.output}`);

  const browserDirectory = join(outputDirectory, 'browser');
  assert.ok(existsSync(browserDirectory), `the build must emit ${displayPath(browserDirectory)}`);
  const bundles = readdirSync(browserDirectory)
    .filter((name) => name.endsWith('.js'))
    .sort();
  assert.ok(bundles.length > 0, 'the build must emit at least one browser bundle');

  const text = bundles.map((name) => readFileSync(join(browserDirectory, name), 'utf8')).join('\n');
  return { browserDirectory, bundles, text, bytes: text.length };
}

/** Reads the properties SC4 needs out of one emitted development bundle. */
function analyseBundle({ text, bundles, bytes }) {
  const lines = text.split('\n');
  const averageLineLength = text.length / Math.max(lines.length, 1);

  const facadeRouter = text.match(/"@angular\/router":\s*\{\s*Router(?:\s*:\s*([A-Za-z0-9_$]+))?\s*\}/);
  assert.ok(facadeRouter, 'the emitted bundle must carry the facade literal the package builds');
  const routerClassBindingName = facadeRouter[1] ?? 'Router';

  const routerBindings = [...text.matchAll(/(?:var|let|const)\s+Router\d*\s*=\s*class/g)].map((match) => match[0]);
  const ownBinding = `var ${routerClassBindingName} = class`;
  const angularVersionBanners = [...new Set([...text.matchAll(/@license Angular v(\d+\.\d+\.\d+)/g)].map((match) => match[1]))].sort();

  return {
    bundles,
    bytes,
    unminified: lines.length > 1000 && averageLineLength < 200,
    entryPresent: text.includes(ENTRY_NAME),
    devModeGuardPresent: /if \(isDevMode\(\)\)/.test(text) && /installFacade\(facade/.test(text),
    routerClassBindingName,
    routerClassBoundOnce: routerBindings.filter((binding) => binding === ownBinding).length === 1,
    routerClassBindings: routerBindings.length,
    angularVersionBanners,
  };
}

/** Builds the package through its declared target, so the fixture resolves the entry the package
 * publishes. The target writes the package's own git-ignored `dist`. */
function buildPackage() {
  assert.ok(existsSync(NX_CLI), `the package build runs through ${displayPath(NX_CLI)}`);
  const result = run(process.execPath, [NX_CLI, 'run', 'ai-devtools-companion:build']);
  assert.equal(result.status, 0, `the package's build target must succeed: ${result.output}`);
  assert.ok(existsSync(PACKAGE_DIST_ENTRY), `the build target must emit ${displayPath(PACKAGE_DIST_ENTRY)}`);
}

// ---------------------------------------------------------------------------
// The measurements, taken once and shared by the assertions and the recording check
// ---------------------------------------------------------------------------

/**
 * Whether this checkout can take the measurements at all. The root install provides the Nx CLI, the
 * fixture's own install provides `@angular/cli` and the linked package. This file's Verify
 * provisions both. A checkout without them **fails** the tests below and names the command that
 * provisions the missing install: a test that carries an acceptance criterion may not pass by not
 * running, so a missing prerequisite is red here, never green-by-skip. The fixture install needs
 * `--include=dev` because this host exports `NODE_ENV=production`, which otherwise drops the
 * fixture's devDependencies and with them `@angular/cli`.
 */
const MISSING_ROOT_INSTALL = existsSync(NX_CLI) ? false : `the root install is absent (${displayPath(NX_CLI)}); run npm ci --include=dev`;
const MISSING_FIXTURE_INSTALL =
  existsSync(FIXTURE_NG_CLI) && existsSync(join(FIXTURE_ROOT, 'node_modules', 'ai-devtools-companion'))
    ? false
    : `the fixture install is absent (${displayPath(join(FIXTURE_ROOT, 'node_modules'))}); run npm --prefix spikes/ng222-app ci --include=dev`;
const MISSING_MEASUREMENT_ENVIRONMENT = MISSING_ROOT_INSTALL || MISSING_FIXTURE_INSTALL;

/**
 * The precondition every measurement test opens with: `false` means the prerequisite is satisfied.
 * One definition, so the missing install is named once, in one wording, and the test fails
 * visibly instead of being skipped.
 */
function requirePrerequisite(missing) {
  assert.equal(missing, false, `the development-build proof cannot run: ${missing}`);
}

let developmentBuildCache = null;

/** The configured development build: the proof's build half. */
function developmentBuild() {
  if (developmentBuildCache === null) {
    buildPackage();
    developmentBuildCache = analyseBundle(buildFixture({ configuration: 'development', outputDirectory: OUTPUT_DIR }));
  }
  return developmentBuildCache;
}

let counterExampleCache = null;

/** The same build with the symlink anchor turned off: the counterexample that shows why the option
 * is there. */
function counterExampleBuild() {
  if (counterExampleCache === null) {
    buildPackage();
    counterExampleCache = analyseBundle(
      buildFixture({
        configuration: 'development',
        outputDirectory: COUNTER_EXAMPLE_DIR,
        extraArguments: ['--preserve-symlinks', 'false'],
      }),
    );
  }
  return counterExampleCache;
}

let peerResolutionCache = null;

/** The peer-resolution measurement: where each anchor lands, and what the fixture and this
 * checkout each install. */
function peerResolution() {
  if (peerResolutionCache !== null) {
    return peerResolutionCache;
  }

  const installedLink = join(FIXTURE_ROOT, 'node_modules', 'ai-devtools-companion');
  assert.ok(
    existsSync(installedLink),
    `the fixture must install the package; missing ${displayPath(installedLink)} — run npm --prefix spikes/ng222-app ci --include=dev`,
  );

  const installedRealPath = realpathSync(installedLink);
  const isSymlink = posixPath(installedRealPath) !== posixPath(installedLink);
  const fixtureRequire = createRequire(join(FIXTURE_ROOT, 'package.json'));
  const rootRequire = createRequire(join(REPO_ROOT, 'package.json'));

  const symlinkAnchoredVersions = {};
  const realPathAnchoredVersions = {};
  const fixtureOwnVersions = {};
  const rootOwnVersions = {};
  for (const specifier of PEER_SPECIFIERS) {
    symlinkAnchoredVersions[specifier] = versionOf(resolveFromAncestors(installedLink, specifier));
    realPathAnchoredVersions[specifier] = versionOf(resolveFromAncestors(installedRealPath, specifier));
    fixtureOwnVersions[specifier] = installedVersion(fixtureRequire, specifier);
    rootOwnVersions[specifier] = installedVersion(rootRequire, specifier);
  }

  peerResolutionCache = {
    installedLink,
    installedRealPath,
    installedRealPathRelativeToFixture: posixPath(relative(FIXTURE_ROOT, installedRealPath)),
    isSymlink,
    symlinkAnchoredVersions,
    realPathAnchoredVersions,
    fixtureOwnVersions,
    rootOwnVersions,
  };
  return peerResolutionCache;
}

function fixtureAngularVersion() {
  return installedVersion(createRequire(join(FIXTURE_ROOT, 'package.json')), '@angular/core');
}

function rootAngularVersion() {
  return installedVersion(createRequire(join(REPO_ROOT, 'package.json')), '@angular/core');
}

// ---------------------------------------------------------------------------
// AC1 — the project exists beside the panel's project
// ---------------------------------------------------------------------------

test('nx lists the companion project beside the panel project (AC1)', () => {
  requirePrerequisite(MISSING_ROOT_INSTALL);

  const result = run(process.execPath, [NX_CLI, 'show', 'projects', '--json']);
  assert.equal(result.status, 0, `nx show projects must succeed: ${result.output}`);
  const json = result.output.slice(result.output.indexOf('['), result.output.lastIndexOf(']') + 1);
  const projects = JSON.parse(json);
  assert.ok(Array.isArray(projects), `nx show projects --json must print an array: ${result.output}`);
  assert.ok(projects.includes('ai-devtools-companion'), `the new project must be inferred from its project.json: ${JSON.stringify(projects)}`);
  assert.ok(projects.includes('angular-ai-devtools'), `the panel's project must stay listed: ${JSON.stringify(projects)}`);
  console.log(`facade-dev-build: nx projects ${JSON.stringify(projects)}`);
});

// ---------------------------------------------------------------------------
// AC4 — one dev-only provider file, one replacement, base bytes intact
// ---------------------------------------------------------------------------

test('the fixture loads the package only through the dev-only provider and exactly one replacement (AC4)', () => {
  const base = readFileSync(BASE_APP_CONFIG, 'utf8').replace(/\r\n/g, '\n');
  assert.equal(base, BASE_APP_CONFIG_SOURCE, 'the fixture base configuration must keep its bytes: the package may not be wired into it');

  const dev = readFileSync(DEV_APP_CONFIG, 'utf8').replace(/\r\n/g, '\n');
  assert.match(dev, /import \{ provideAiDevTools \} from 'ai-devtools-companion';/, 'the dev-only file imports the package provider');
  assert.match(dev, /export const appConfig: ApplicationConfig/, 'the dev-only file exports the symbol the app bootstraps with');
  assert.deepEqual(
    providersOf(dev),
    [...providersOf(base), 'provideAiDevTools()'],
    'the dev-only file must restate the base providers in order and append the companion provider',
  );

  const angularJson = readJson(FIXTURE_ANGULAR_JSON);
  const project = angularJson.projects['ng222-app'];
  const build = project.architect.build;
  assert.deepEqual(
    build.configurations.development.fileReplacements,
    [{ replace: 'src/app/app.config.ts', with: 'src/app/app.config.dev.ts' }],
    'the development configuration carries exactly the one replacement',
  );

  // No second replacement anywhere: not in production, not in the test target's configurations.
  const replacements = [];
  for (const [targetName, target] of Object.entries(project.architect)) {
    for (const [configurationName, configuration] of Object.entries(target.configurations ?? {})) {
      for (const replacement of configuration.fileReplacements ?? []) {
        replacements.push({ targetName, configurationName, replacement });
      }
    }
  }
  assert.deepEqual(
    replacements,
    [
      {
        targetName: 'build',
        configurationName: 'development',
        replacement: { replace: 'src/app/app.config.ts', with: 'src/app/app.config.dev.ts' },
      },
    ],
    'exactly one replacement, in the development build configuration',
  );
  for (const configurationName of Object.keys(project.architect.test.configurations ?? {})) {
    assert.equal(
      (project.architect.test.configurations[configurationName].fileReplacements ?? []).length,
      0,
      `the test configuration ${configurationName} must not load the provider`,
    );
  }

  // main.ts still bootstraps from './app/app.config', so the replacement is the only wiring.
  assert.match(readFileSync(MAIN_TS, 'utf8'), /import \{ appConfig \} from '\.\/app\/app\.config';/);

  // The package's name occurs in the fixture's source exactly once: the dev-only provider file.
  const importers = filesUnder(FIXTURE_SOURCE_ROOT)
    .filter((path) => readFileSync(path, 'utf8').includes('ai-devtools-companion'))
    .map(displayPath);
  assert.deepEqual(importers, [displayPath(DEV_APP_CONFIG)], 'the dev-only provider file is the fixture source that names the package');

  console.log(`facade-dev-build: one replacement in development, base bytes intact, importers ${JSON.stringify(importers)}`);
});

// ---------------------------------------------------------------------------
// AC5 — the package resolves the fixture's own Angular copy
// ---------------------------------------------------------------------------

test("the package's peers resolve to the fixture's own copy, and preserveSymlinks is what buys it (AC5)", () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  const peers = peerResolution();

  // The outcome AC5 asks for: anchored where the builder resolves from, the peers are the files the
  // fixture itself resolves.
  assert.deepEqual(peers.symlinkAnchoredVersions, peers.fixtureOwnVersions, 'the package must resolve the same Angular files the fixture resolves');
  for (const specifier of PEER_SPECIFIERS) {
    assert.equal(
      posixPath(resolveFromAncestors(peers.installedLink, specifier) ?? ''),
      posixPath(join(packageDirectoryOf(createRequire(join(FIXTURE_ROOT, 'package.json')).resolve(specifier)), 'package.json')),
      `${specifier} must resolve to the fixture's own installed copy`,
    );
  }

  // The anchor is the whole question: resolved at the package's real path, the same specifiers land
  // in the root checkout's install.
  assert.deepEqual(peers.realPathAnchoredVersions, peers.rootOwnVersions, "the real path anchor is the root checkout's copy");
  if (peers.isSymlink) {
    assert.equal(
      posixPath(resolveFromAncestors(peers.installedLink, '@angular/router') ?? '').startsWith(posixPath(join(FIXTURE_ROOT, 'node_modules'))),
      true,
      'a symlinked install is acceptable only because the resolution still lands inside the fixture install',
    );
  }

  // No new @angular/* dependency is declared to reach it.
  const fixturePackage = readJson(FIXTURE_PACKAGE_JSON);
  assert.deepEqual(
    Object.keys(fixturePackage.dependencies).filter((name) => name.startsWith('@angular/')).sort(),
    FIXTURE_ANGULAR_DEPENDENCIES,
    'the fixture declares no new @angular/* dependency',
  );
  assert.deepEqual(
    Object.keys(fixturePackage.devDependencies).filter((name) => name.startsWith('@angular/')).sort(),
    FIXTURE_ANGULAR_DEV_DEPENDENCIES,
    'the fixture declares no new @angular/* dev dependency',
  );
  assert.equal(fixturePackage.dependencies['ai-devtools-companion'], 'file:../../packages/ai-devtools-companion');

  // The mechanism the development configuration selects, and only there.
  const build = readJson(FIXTURE_ANGULAR_JSON).projects['ng222-app'].architect.build;
  assert.equal(build.configurations.development.preserveSymlinks, true, 'the development configuration must keep the symlink anchor');
  assert.equal('preserveSymlinks' in build.configurations.production, false, 'the production configuration keeps default resolution: it loads no package');

  const lockEntry = readJson(FIXTURE_LOCK).packages['node_modules/ai-devtools-companion'];
  assert.ok(lockEntry, 'the fixture lock must carry the new entry');
  assert.equal(lockEntry.link ?? undefined, peers.isSymlink ? true : undefined, 'the lock must record how npm installed the package');

  console.log(
    `facade-dev-build: installed as ${peers.isSymlink ? 'symlink' : 'copy'}; symlink-anchored ${JSON.stringify(peers.symlinkAnchoredVersions)}, ` +
      `realpath-anchored ${JSON.stringify(peers.realPathAnchoredVersions)}, fixture ${JSON.stringify(peers.fixtureOwnVersions)}, ` +
      `root ${JSON.stringify(peers.rootOwnVersions)}`,
  );
});

// ---------------------------------------------------------------------------
// AC6 — the development build keeps the entry and the class it carries
// ---------------------------------------------------------------------------

test('the development build keeps the entry name and the Router class, and it is one Angular copy (AC6)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  const build = developmentBuild();

  assert.equal(build.unminified, true, 'the development bundle must be unminified for the search to mean anything');
  assert.equal(build.entryPresent, true, `the emitted bundle must contain the entry name ${ENTRY_NAME}`);
  assert.equal(build.devModeGuardPresent, true, 'the emitted bundle must keep the isDevMode() guard and the write');
  assert.equal(build.routerClassBoundOnce, true, `the Router class the entry carries must be declared exactly once: ${JSON.stringify(build)}`);
  assert.equal(build.routerClassBindingName, 'Router');
  assert.deepEqual(build.angularVersionBanners, [fixtureAngularVersion()], `the bundle must carry one Angular copy, the fixture's ${fixtureAngularVersion()}`);
  if (rootAngularVersion() !== fixtureAngularVersion()) {
    assert.equal(build.angularVersionBanners.includes(rootAngularVersion()), false, `the root checkout's ${rootAngularVersion()} must not appear in the fixture's bundle`);
  }

  console.log(
    `facade-dev-build: ${JSON.stringify(build.bundles)} ${build.bytes}B unminified, entry present, devMode guard present, ` +
      `Router bound once as ${build.routerClassBindingName}, Angular banners ${JSON.stringify(build.angularVersionBanners)}`,
  );
});

test('with preserveSymlinks off the same build carries two Angular copies, so the option is load-bearing (AC5, AC6)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  const build = counterExampleBuild();

  // The entry survives either way — the write is not what the option changes — but the class it
  // carries is the root checkout's copy, so the identity comparison could not hold.
  assert.equal(build.entryPresent, true, 'the entry is still written in the two-copy build');
  assert.deepEqual(
    build.angularVersionBanners,
    [rootAngularVersion(), fixtureAngularVersion()].sort(),
    'the two-copy build must carry both Angular versions',
  );
  assert.equal(build.routerClassBindings, 2, 'the two-copy build must declare the Router class twice');
  assert.notEqual(build.routerClassBindingName, 'Router', "the two-copy build's entry must point at the suffixed, root-owned class");

  console.log(
    `facade-dev-build: counterexample banners ${JSON.stringify(build.angularVersionBanners)}, ` +
      `Router bindings ${build.routerClassBindings}, entry points at ${build.routerClassBindingName}`,
  );
});

// ---------------------------------------------------------------------------
// AC7 — the recording agrees with the measurements and with itself
// ---------------------------------------------------------------------------

test('the served development-build recording is present, development-only and consistent (AC7)', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  assert.ok(existsSync(RECORDING_PATH), `the served reading must be recorded at ${displayPath(RECORDING_PATH)}`);
  const recording = readJson(RECORDING_PATH);

  // The configuration the recording names, and the command that produced its build half.
  assert.equal(recording.configuration, 'development', 'the recording must name the development configuration');
  assert.match(recording.buildCommand, /build\s+--configuration\s+development/, 'the recorded command must name the development configuration explicitly');
  assert.equal(/--configuration\s+(production|test)\b/.test(recording.buildCommand), false, 'the recorded command must name no other configuration');
  assert.equal(posixPath(recording.outputPath), posixPath(relative(REPO_ROOT, OUTPUT_DIR)), 'the recording must name the build output this file produces');

  // The build half: compared with the build this file just made.
  const build = developmentBuild();
  assert.equal(recording.build.entry, 'main.js', 'the recorded development entry must be main.js');
  const chunkPattern = new RegExp(recording.build.chunkPattern);
  const actualEntry = build.bundles.find((name) => name === recording.build.entry);
  assert.equal(actualEntry, recording.build.entry, `the development entry must be ${recording.build.entry}`);
  const actualLazyChunks = build.bundles.filter((name) => name !== recording.build.entry);
  assert.equal(
    actualLazyChunks.length,
    recording.build.lazyChunkCount,
    `the development lazy chunk count must match: ${actualLazyChunks.length} vs ${recording.build.lazyChunkCount}`,
  );
  for (const name of actualLazyChunks) {
    assert.match(name, chunkPattern, `${name} must match chunkPattern ${recording.build.chunkPattern}`);
  }
  assert.equal(recording.build.entryName, ENTRY_NAME);
  assert.equal(recording.build.entryPresent, build.entryPresent);
  assert.equal(recording.build.unminified, build.unminified);
  assert.equal(recording.build.devModeGuardPresent, build.devModeGuardPresent);
  assert.equal(recording.build.routerClassBindingName, build.routerClassBindingName);
  assert.equal(recording.build.routerClassBoundOnce, build.routerClassBoundOnce);
  assert.deepEqual(recording.build.angularVersionBanners, build.angularVersionBanners);
  assert.equal(recording.build.angularCopies, build.angularVersionBanners.length, 'the recorded copy count must match the banners the build emitted');

  // The peer-resolution half: compared with this checkout's installs.
  const peers = peerResolution();
  assert.equal(recording.peerResolution.installedAs, peers.isSymlink ? 'symlink' : 'copy');
  assert.equal(recording.peerResolution.lockfileLinkEntry, peers.isSymlink);
  assert.equal(posixPath(recording.peerResolution.installedRealPath), peers.installedRealPathRelativeToFixture);
  assert.deepEqual(recording.peerResolution.symlinkAnchoredVersions, peers.symlinkAnchoredVersions);
  assert.deepEqual(recording.peerResolution.realPathAnchoredVersions, peers.realPathAnchoredVersions);
  assert.deepEqual(recording.peerResolution.fixtureOwnVersions, peers.fixtureOwnVersions);
  assert.deepEqual(recording.peerResolution.rootOwnVersions, peers.rootOwnVersions);
  assert.match(recording.peerResolution.chosenMechanism, /preserveSymlinks: true/);

  // The counterexample half: compared with the build this file made without the option.
  const counterExample = counterExampleBuild();
  assert.deepEqual(recording.counterExample.angularVersionBanners, counterExample.angularVersionBanners);
  assert.equal(recording.counterExample.routerClassBindingName, counterExample.routerClassBindingName);
  assert.equal(recording.counterExample.routerClassBindings, counterExample.routerClassBindings);

  // The served half: the four observations AC7 names.
  const served = recording.served;
  assert.equal(served.isDevMode, true, 'the served page must be a development build');
  assert.equal(served.ngGlobal, true, 'the served page must expose window.ng');
  assert.equal(served.identity, true, 'the identity comparison must hold on the served page');
  assert.deepEqual(served.ownKeys.ownStringKeyDelta, [ENTRY_NAME], 'the own string key difference must be exactly the entry name');
  assert.deepEqual(served.ownKeys.ownStringKeysRemoved, []);
  assert.equal(served.ownKeys.ownSymbolKeysChanged, false, 'the own symbol keys must be unchanged');
  assert.equal(served.ownKeys.entryRestoredAfterSnapshot, true, 'the probe must leave the entry in place');
  assert.equal(
    served.ownKeys.ownStringKeysWithEntry - served.ownKeys.ownStringKeysWithoutEntry,
    served.ownKeys.ownStringKeyDelta.length,
    'the recorded key counts must differ by exactly the reported difference',
  );
  assert.ok(served.ownKeys.addedByBootstrap.includes(ENTRY_NAME), 'the entry must be one of the keys the page gained at bootstrap');

  // The symbols: exactly the vetted vocabulary, with declared and resolved counted apart.
  assert.deepEqual(served.symbols.map((symbol) => `${symbol.pkg}#${symbol.name}`).sort(), [...VETTED_SYMBOLS].sort());
  for (const symbol of served.symbols) {
    assert.equal(symbol.declared, 1, `${symbol.pkg}#${symbol.name} must be declared once`);
    assert.equal(symbol.resolved, symbol.matchedRecords > 0 ? 1 : 0, `${symbol.pkg}#${symbol.name} resolved must follow its matched records`);
  }
  const router = served.symbols.find((symbol) => symbol.name === 'Router');
  const meta = served.symbols.find((symbol) => symbol.name === 'Meta');
  assert.equal(router.resolved, 1, 'the router class the entry carries must match a provider record by identity');
  assert.ok(router.matchedRecords >= 1);
  assert.equal(meta.resolved, 0, 'Meta is expected provided but not created yet (S16)');
  assert.equal(meta.matchedRecords, 0, 'no provider record may match Meta');
  assert.equal(served.identity, router.resolved === 1, 'the identity comparison and the Router count must agree');

  // The package's own vocabulary and the Angular copy the page reports.
  assert.equal(served.entry.version, readJson(PACKAGE_JSON).version);
  assert.deepEqual(served.entry.ownKeys, [...PEER_SPECIFIERS, 'version'].sort());
  assert.equal(served.ngVersionAttribute, fixtureAngularVersion(), "the page's ng-version must be the fixture's own Angular version");
  assert.equal(recording.angular, fixtureAngularVersion());

  console.log(
    `facade-dev-build: recorded served reading — isDevMode ${served.isDevMode}, identity ${served.identity}, ` +
      `own-key delta ${JSON.stringify(served.ownKeys.ownStringKeyDelta)}, ` +
      `symbols ${JSON.stringify(served.symbols.map((symbol) => `${symbol.pkg}#${symbol.name} declared ${symbol.declared} resolved ${symbol.resolved}`))}`,
  );
});

// ---------------------------------------------------------------------------
// Stability — two builds at the same output path emit identical bundle name lists
// ---------------------------------------------------------------------------
test('the development build is name-stable across two builds at the same output path', () => {
  requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT);
  buildPackage();
  const first = buildFixture({ configuration: 'development', outputDirectory: OUTPUT_DIR });
  const second = buildFixture({ configuration: 'development', outputDirectory: OUTPUT_DIR });
  assert.deepEqual(first.bundles, second.bundles, 'two builds at the same output path must emit identical bundle name lists');
  console.log(`facade-dev-build: stability ${JSON.stringify(first.bundles)} === ${JSON.stringify(second.bundles)}`);
});

// ---------------------------------------------------------------------------
// N5 — no file this task writes names the removed build option
// ---------------------------------------------------------------------------

test('no file this task writes names the removed bundle-optimizer option (N5)', () => {
  const files = [
    RECORDING_PATH,
    PACKAGE_JSON,
    PACKAGE_PROJECT_JSON,
    PACKAGE_TSCONFIG,
    ...filesUnder(join(PACKAGE_ROOT, 'src')),
    join(PACKAGE_ROOT, 'test', 'facade.test.mjs'),
    FIXTURE_ANGULAR_JSON,
    FIXTURE_PACKAGE_JSON,
    BASE_APP_CONFIG,
    DEV_APP_CONFIG,
  ];
  for (const file of files) {
    assert.equal(
      readFileSync(file, 'utf8').includes(FORBIDDEN_BUILD_OPTION),
      false,
      `${displayPath(file)} must not name the option this project no longer carries`,
    );
  }
  console.log(`facade-dev-build: ${files.length} written files name no removed build option`);
});
