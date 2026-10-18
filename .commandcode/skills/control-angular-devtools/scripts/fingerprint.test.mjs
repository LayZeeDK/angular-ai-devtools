// @ts-check
// Run: node --test <this folder>/fingerprint.test.mjs
// fingerprint.mjs here is a byte copy of lars-create-verification's, whose own tests cover it in depth. This test
// runs this copy, as the control skill ships it, in a throwaway checkout: record, check, a changed file, a new feature.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const copy = join(dirname(fileURLToPath(import.meta.url)), 'fingerprint.mjs');

/**
 * @param {string} root
 * @param {Record<string, string>} files
 */
function put(root, files) {
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
}

test('this copy records a feature, reports it fresh, then stale after its file changes, and a new one unproven', (t) => {
  const root = realpathSync.native(mkdtempSync(join(tmpdir(), 'fingerprint-copy-')));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const skill = join(root, '.claude', 'skills', 'control-demo');
  mkdirSync(join(root, '.git'));
  put(root, {
    '.claude/skills/control-demo/features/README.md': '# Map\n',
    '.claude/skills/control-demo/features/counter.md': '# Counter\n',
    'src/main.ts': 'export const main = 1;\n',
  });
  mkdirSync(join(skill, 'scripts'));
  copyFileSync(copy, join(skill, 'scripts', 'fingerprint.mjs'));
  /** @param {string[]} args */
  const run = (...args) => spawnSync(process.execPath, [join(skill, 'scripts', 'fingerprint.mjs'), ...args, '--json'], { cwd: root, encoding: 'utf8' });

  const recorded = run('record', '--feature', 'counter', '--entries', 'src/main.ts');
  assert.equal(recorded.status, 0, recorded.stdout + recorded.stderr);
  const manifest = JSON.parse(readFileSync(join(skill, 'features', '.proven.json'), 'utf8'));
  assert.deepEqual(Object.keys(manifest.features), ['counter']);
  const blob = spawnSync('git', ['hash-object', '--no-filters', join(root, 'src', 'main.ts')], { encoding: 'utf8' });
  assert.equal(manifest.features.counter.files['src/main.ts'], blob.stdout.trim(), 'the hash git prints for the file');
  assert.equal(run('check').status, 0);

  writeFileSync(join(root, 'src', 'main.ts'), 'export const main = 2;\n');
  const stale = run('check', '--feature', 'counter');
  assert.equal(stale.status, 1);
  assert.equal(JSON.parse(stale.stdout).features[0].status, 'stale');

  put(root, { '.claude/skills/control-demo/features/other.md': '# Other\n' });
  const unproven = JSON.parse(run('check').stdout).features.find((/** @type {{ id: string }} */ f) => f.id === 'other');
  assert.equal(unproven.status, 'unproven');
});
