// @ts-check
// Run: node --test scripts/sync-verification-scripts.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'sync-verification-scripts.mjs');
const MARKER = '// A control skill carries a byte copy at scripts/';

/**
 * Two folders, each holding the named scripts, so one run never touches the real skill folder.
 * @param {Record<string, string>} canonical
 * @param {Record<string, string>} skill
 * @returns {{ canonical: string, skill: string, run: (...args: string[]) => { status: number | null, out: string } }}
 */
function world(canonical, skill) {
  const root = mkdtempSync(join(tmpdir(), 'sync-scripts-'));

  for (const [side, files] of [
    ['canonical', canonical],
    ['skill', skill],
  ]) {
    const dir = join(root, side);
    mkdirSync(dir);

    for (const [name, text] of Object.entries(files)) {
      writeFileSync(join(dir, name), text);
    }
  }

  return {
    canonical: join(root, 'canonical'),
    skill: join(root, 'skill'),
    run: (...args) => {
      const result = spawnSync(
        process.execPath,
        [
          SCRIPT,
          '--canonical',
          join(root, 'canonical'),
          '--skill',
          join(root, 'skill'),
          ...args,
        ],
        { encoding: 'utf8' },
      );

      return {
        status: result.status,
        out: `${result.stdout ?? ''}${result.stderr ?? ''}`,
      };
    },
  };
}

test('copies in step exit 0 and say so', (t) => {
  const w = world(
    { 'text.mjs': `${MARKER}text.mjs\n` },
    { 'text.mjs': `${MARKER}text.mjs\n` },
  );
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run('--check');
  assert.equal(result.status, 0, result.out);
  assert.match(result.out, /text\.mjs: identical/);
  assert.match(result.out, /1 copies in step/);
});

test('a difference exits 1 and names the file', (t) => {
  const w = world(
    { 'text.mjs': 'canonical copy\n' },
    { 'text.mjs': 'edited here\n' },
  );
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run('--check');
  assert.equal(result.status, 1, result.out);
  assert.match(result.out, /text\.mjs: differs/);
});

test('a name in both folders is a copy even without the header marker', (t) => {
  const w = world({ 'proctree.mjs': 'a\n' }, { 'proctree.mjs': 'b\n' });
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  assert.equal(w.run('--check').status, 1);
});

test('a canonical script with no counterpart and no marker is not a copy', (t) => {
  const w = world(
    { 'check-skill.mjs': 'only canonical\n', 'text.mjs': 'same\n' },
    { 'text.mjs': 'same\n', 'panel.mjs': 'only here\n' },
  );
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run('--check');
  assert.equal(result.status, 0, result.out);
  assert.doesNotMatch(result.out, /check-skill/);
  assert.doesNotMatch(result.out, /panel\.mjs/);
});

test('a declared copy missing from the skill folder is drift', (t) => {
  const w = world({ 'text.mjs': `${MARKER}text.mjs\n` }, {});
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run('--check');
  assert.equal(result.status, 1, result.out);
  assert.match(result.out, /absent here/);
});

test('the default direction writes canonical over the skill copy', (t) => {
  const w = world(
    { 'text.mjs': 'canonical\n' },
    { 'text.mjs': 'stale here\n' },
  );
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run();
  assert.equal(result.status, 0, result.out);
  assert.equal(readFileSync(join(w.skill, 'text.mjs'), 'utf8'), 'canonical\n');
  assert.equal(w.run('--check').status, 0);
});

test('--up writes the skill copy over canonical', (t) => {
  const w = world({ 'proctree.mjs': 'older\n' }, { 'proctree.mjs': 'newer\n' });
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run('--up');
  assert.equal(result.status, 0, result.out);
  assert.match(result.out, /repo -> canonical/);
  assert.equal(
    readFileSync(join(w.canonical, 'proctree.mjs'), 'utf8'),
    'newer\n',
  );
});

test('nothing to do is a clean exit', (t) => {
  const w = world({ 'text.mjs': 'same\n' }, { 'text.mjs': 'same\n' });
  t.after(() => rmSync(dirname(w.canonical), { recursive: true, force: true }));

  const result = w.run();
  assert.equal(result.status, 0, result.out);
  assert.match(result.out, /already in step/);
});

test('a missing canonical folder is refused, not guessed', () => {
  const result = spawnSync(
    process.execPath,
    [
      SCRIPT,
      '--canonical',
      join(tmpdir(), 'no-such-canonical-folder'),
      '--check',
    ],
    { encoding: 'utf8' },
  );

  assert.equal(result.status, 2);
  assert.match(result.stderr, /no canonical folder/);
});
