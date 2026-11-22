import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

const REPO_ROOT = new URL('..', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1',
);

function readJson(relative) {
  return JSON.parse(readFileSync(join(REPO_ROOT, relative), 'utf8'));
}

const nx = readJson('nx.json');
const app = readJson('apps/angular-ai-devtools/project.json');
const targets = app.targets ?? {};

/**
 * The cache policy these assertions hold, and why each one is a correctness rule rather than a preference.
 *
 * `build-extension` writes `extension/panel/**`, which is a tracked directory. A cache restore leaves those files
 * with the mtime they had when the tree was checked out while their bytes are the cached build, so every consumer
 * that judges freshness by time — `panel-bundle-budget.test.mjs:assertBuildIsCurrent` and `panel-styles.test.mjs` —
 * either refuses a current build or accepts a stale one. Measured in M060: `prepare-final` refused twice with
 * `extension/panel/index.html is a stale build` and passed only when the build ran with `--skip-nx-cache`.
 *
 * The app's unit-test target reads git history (`gate-integrity`, landing proofs), the built panel and companion
 * bundle, `.project` bookkeeping, and spawns `npm test` from inside itself. None of that fits a cache key derived
 * from the project's own files, so a cached verdict is replayed for a tree whose inputs changed — a false green.
 * M035 recorded this as fixed; the tree kept `"cache": true` until now, which is why the claim is now a check.
 *
 * `generate-error-digest` writes `extension/error-digest.json`. Without a declared output, no downstream input set
 * can see the digest and `dependsOn` re-runs it on every build.
 */
test('build-extension never serves from the cache: its output is a tracked directory judged by mtime', () => {
  assert.equal(
    targets['build-extension']?.cache,
    false,
    'build-extension must set "cache": false — a cache restore leaves extension/panel/** at its checkout mtime, which the panel budget and style suites read as a stale build',
  );
});

test('the app unit-test target never serves from the cache: it reads git state and the built bundles', () => {
  assert.equal(
    targets.test?.cache,
    false,
    'the app test target must set "cache": false — a cached verdict is replayed for a tree whose git state and built bundles changed',
  );
  assert.equal(
    nx.targetDefaults?.['@angular/build:unit-test']?.cache,
    false,
    'targetDefaults["@angular/build:unit-test"] must set "cache": false, so a later test target does not inherit a cacheable verdict',
  );
});

test('the unit-test inputs name the artifacts those tests read, so a re-cached target still has an honest key', () => {
  const inputs = nx.targetDefaults?.['@angular/build:unit-test']?.inputs ?? [];
  for (const name of ['extensionArtifacts', 'projectBookkeeping']) {
    assert.ok(
      inputs.includes(name),
      `unit-test inputs must include the "${name}" named input — a key built only from a project\'s own files cannot see the artifacts and bookkeeping the suites read`,
    );
    assert.ok(
      nx.namedInputs?.[name],
      `nx.json must define the "${name}" named input that the unit-test inputs reference`,
    );
  }
});

test('generate-error-digest declares the digest it writes, so the output is in the graph', () => {
  const outputs = targets['generate-error-digest']?.outputs ?? [];
  assert.deepEqual(
    outputs,
    ['{workspaceRoot}/extension/error-digest.json'],
    'generate-error-digest must declare the file it writes, or no downstream input set can see the digest',
  );
});

test('no live source asks a reader to skip the cache or disable the daemon', () => {
  for (const relative of ['scripts/panel-bundle-budget.test.mjs']) {
    const text = readFileSync(join(REPO_ROOT, relative), 'utf8');
    assert.ok(
      !text.includes('--skip-nx-cache'),
      `${relative} must not instruct a reader to skip the cache: the build target is uncacheable, so a plain rebuild is what produces a measurable output`,
    );
    assert.ok(
      !text.includes('NX_DAEMON'),
      `${relative} must not ask for the daemon to be disabled: the cache policy is what makes the daemon's graph trustworthy`,
    );
  }
});
