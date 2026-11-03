import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(here, '..', '..');
const FIXTURE_ROOT = join(REPO_ROOT, 'spikes', 'ng222-app');
const FIXTURE_NG_CLI = join(FIXTURE_ROOT, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const FIXTURE_PACKAGE_JSON = join(FIXTURE_ROOT, 'package.json');

const CYCLE_ONE_OUTPUT = join(REPO_ROOT, 'tmp', 'rebuild-idempotent-cycle-1');
const CYCLE_TWO_OUTPUT = join(REPO_ROOT, 'tmp', 'rebuild-idempotent-cycle-2');

const COMPONENT_PACKAGES = [
  '@angular/aria',
  '@angular/cdk',
  '@angular/material',
  '@angular/core',
];

function displayPath(absolutePath) {
  return relative(REPO_ROOT, absolutePath).split(sep).join('/');
}

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

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
}

/** Collect every install occurrence of each component package under the fixture's node_modules. */
function componentInstallOccurrences() {
  const occurrences = [];
  const nodeModules = join(FIXTURE_ROOT, 'node_modules');
  if (!existsSync(nodeModules)) return occurrences;
  const wanted = new Set(COMPONENT_PACKAGES);
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (!entry.isDirectory()) continue;
      const packageJsonPath = join(path, 'package.json');
      if (existsSync(packageJsonPath)) {
        try {
          const pkg = readJson(packageJsonPath);
          if (typeof pkg.name === 'string' && wanted.has(pkg.name)) {
            occurrences.push({
              name: pkg.name,
              version: pkg.version,
              path: displayPath(path),
            });
          }
        } catch {
          // ignore unreadable package.json
        }
      }
      walk(path);
    }
  }
  walk(nodeModules);
  return occurrences.sort((a, b) => a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
}

function componentInstallSet() {
  const grouped = {};
  for (const name of COMPONENT_PACKAGES) grouped[name] = [];
  for (const occurrence of componentInstallOccurrences()) {
    grouped[occurrence.name].push({ version: occurrence.version, path: occurrence.path });
  }
  for (const name of COMPONENT_PACKAGES) {
    grouped[name].sort((a, b) => a.path.localeCompare(b.path));
  }
  return grouped;
}

function buildCycle(outputDirectory) {
  rmSync(outputDirectory, { recursive: true, force: true });
  const result = run(
    process.execPath,
    [
      FIXTURE_NG_CLI,
      'build',
      '--configuration',
      'production',
      '--output-path',
      relative(FIXTURE_ROOT, outputDirectory).split(sep).join('/'),
    ],
    { cwd: FIXTURE_ROOT },
  );
  assert.equal(
    result.status,
    0,
    `ng build --configuration production of ${displayPath(FIXTURE_ROOT)} must succeed: ${result.output}`,
  );
  assert.match(
    result.output,
    /Application bundle generation complete/,
    `the build must report a completed bundle: ${result.output}`,
  );
  const browserDirectory = join(outputDirectory, 'browser');
  assert.ok(existsSync(browserDirectory), `the build must emit ${displayPath(browserDirectory)}`);
  const entryDocumentPath = join(browserDirectory, 'index.html');
  assert.ok(existsSync(entryDocumentPath), `the served entry document must exist: ${displayPath(entryDocumentPath)}`);
  const entryDocument = readFileSync(entryDocumentPath);
  const browserFiles = readdirSync(browserDirectory).filter((name) => name.endsWith('.js')).sort();
  assert.ok(browserFiles.length > 0, 'the build must emit at least one browser bundle');
  return { browserDirectory, entryDocument, browserFiles };
}

const MISSING_FIXTURE_INSTALL = existsSync(FIXTURE_NG_CLI) &&
  COMPONENT_PACKAGES.every((name) => existsSync(join(FIXTURE_ROOT, 'node_modules', ...name.split('/'))))
  ? false
  : `the fixture install is absent (${displayPath(join(FIXTURE_ROOT, 'node_modules'))}); run npm --prefix spikes/ng222-app ci --include=dev`;

function requirePrerequisite(missing) {
  assert.equal(missing, false, `the rebuild-idempotency proof cannot run: ${missing}`);
}

test('fixture rebuild idempotent: same entry served and no duplicate component-package install', () => {
  requirePrerequisite(MISSING_FIXTURE_INSTALL);

  // No duplicate component-package entry in the manifest's raw text.
  const manifestText = readFileSync(FIXTURE_PACKAGE_JSON, 'utf8');
  for (const name of COMPONENT_PACKAGES) {
    const key = `"${name}"`;
    const count = manifestText.split(key).length - 1;
    assert.equal(
      count,
      1,
      `${displayPath(FIXTURE_PACKAGE_JSON)} must declare ${name} exactly once, found ${count}`,
    );
  }

  // Each component package must be installed exactly once before the first cycle.
  const beforeOccurrences = componentInstallOccurrences();
  for (const name of COMPONENT_PACKAGES) {
    const count = beforeOccurrences.filter((occurrence) => occurrence.name === name).length;
    assert.equal(
      count,
      1,
      `${name} must be installed exactly once before the first build, found ${count}: ${JSON.stringify(beforeOccurrences)}`,
    );
  }
  const installSetBefore = componentInstallSet();

  // First build and serve cycle.
  const cycleOne = buildCycle(CYCLE_ONE_OUTPUT);

  // Second build and serve cycle.
  const cycleTwo = buildCycle(CYCLE_TWO_OUTPUT);

  // The served entry document must be byte-identical across both cycles.
  assert.equal(
    cycleOne.entryDocument.length,
    cycleTwo.entryDocument.length,
    'the served entry document length must match across cycles',
  );
  assert.equal(
    cycleOne.entryDocument.toString('base64'),
    cycleTwo.entryDocument.toString('base64'),
    'the served entry document must be byte-identical across the two build and serve cycles',
  );
  assert.deepEqual(
    cycleOne.browserFiles,
    cycleTwo.browserFiles,
    'the served browser bundle set must be identical across the two build and serve cycles',
  );

  // The component-package install set must be identical after the second cycle.
  const installSetAfterOne = componentInstallSet();
  const installSetAfterTwo = componentInstallSet();
  assert.deepEqual(
    installSetAfterOne,
    installSetBefore,
    'the component-package install set must be unchanged after the first build and serve cycle',
  );
  assert.deepEqual(
    installSetAfterTwo,
    installSetBefore,
    'the component-package install set must be unchanged after the second build and serve cycle',
  );
  assert.deepEqual(
    installSetAfterTwo,
    installSetAfterOne,
    'the component-package install set must be identical after the second build and serve cycle',
  );

  // Still exactly one install of each component package after the second cycle.
  const afterOccurrences = componentInstallOccurrences();
  for (const name of COMPONENT_PACKAGES) {
    const count = afterOccurrences.filter((occurrence) => occurrence.name === name).length;
    assert.equal(
      count,
      1,
      `${name} must be installed exactly once after the second build and serve cycle, found ${count}: ${JSON.stringify(afterOccurrences)}`,
    );
  }

  console.log(
    `rebuild-idempotent: two cycles served identical entry (${cycleOne.entryDocument.length} bytes), ` +
      `component install set unchanged (${JSON.stringify(installSetAfterTwo)})`,
  );
});