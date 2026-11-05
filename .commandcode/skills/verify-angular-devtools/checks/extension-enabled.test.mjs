// @ts-check
// Run: node --test .commandcode/skills/verify-angular-devtools/checks/extension-enabled.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, jsonOf, main } from './extension-enabled.mjs';

const SCRIPT = join(
  dirname(fileURLToPath(import.meta.url)),
  'extension-enabled.mjs',
);
const ENABLED =
  'Angular DevTools 1.22.0 ENABLED (UNPACKED, D:\\x\\1.22.0); service worker running; errors 0/0';

/**
 * Fake deps answering doctor with the given exit and checks.
 * @param {number | null} code
 * @param {unknown} checks
 * @returns {{ deps: import('./extension-enabled.mjs').Deps, files: Map<string, string> }}
 */
function fake(code, checks) {
  /** @type {Map<string, string>} */
  const files = new Map();

  return {
    files,
    deps: {
      control: () => ({
        code,
        json: checks === undefined ? null : { ok: code === 0, checks },
        text: 'doctor output',
      }),
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

test('jsonOf reads the pretty object after log lines', () => {
  assert.deepEqual(jsonOf('[OK] x\n{\n  "ok": false\n}'), { ok: false });
  assert.equal(jsonOf('none'), null);
});

test('passes on the extension line of the live doctor, even when another doctor line fails', () => {
  const f = fake(1, [
    { name: 'map-fresh', ok: true },
    { name: 'extension', ok: true, detail: ENABLED },
    { name: 'app', ok: false, detail: 'no window.ng' },
  ]);
  check({ out: 'D:\\ev' }, f.deps);
  assert.ok(f.files.has(join('D:\\ev', 'extension.json')));
});

test('a failed extension line throws its CLAIM error', () => {
  assert.throws(
    () =>
      check(
        { out: 'o' },
        fake(1, [{ name: 'extension', ok: false, detail: 'DISABLED' }]).deps,
      ),
    /^Error: CLAIM: doctor's extension line failed: DISABLED$/,
  );
});

test('a missing extension line (the harness process is gone) is could not run, not a failed claim', (t) => {
  const dead = fake(1, [
    { name: 'map-fresh', ok: true },
    { name: 'process', ok: false, detail: 'PID 7 not running' },
  ]);
  assert.throws(
    () => check({ out: 'o' }, dead.deps),
    (e) =>
      e instanceof Error &&
      !e.message.startsWith('CLAIM:') &&
      e.message.includes('no extension line (failing: process)'),
  );
  t.mock.method(console, 'error', () => {});
  assert.equal(main(['--out', 'o'], dead.deps), 2);
});

test('main: 1 with the Error: CLAIM line; 2 for no state (exit 2), no JSON or no checks list', (t) => {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });
  assert.equal(
    main(['--out', 'o'], fake(1, [{ name: 'extension', ok: false }]).deps),
    1,
  );
  assert.match(lines.join('\n'), /^Error: CLAIM: /m);
  lines.length = 0;
  assert.equal(main(['--out', 'o'], fake(2, []).deps), 2);
  assert.equal(main(['--out', 'o'], fake(0, undefined).deps), 2);
  assert.equal(main(['--out', 'o'], fake(0, 'not a list').deps), 2);
  assert.doesNotMatch(lines.join('\n'), /CLAIM:/);
});

test('the script exits 2 without --out', () => {
  assert.equal(
    spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' }).status,
    2,
  );
});

test('the answer is saved before a failing extension line throws', () => {
  const f = fake(1, [{ name: 'extension', ok: false, detail: 'DISABLED' }]);
  assert.throws(() => check({ out: 'o' }, f.deps), /CLAIM:/);
  assert.ok(f.files.has(join('o', 'extension.json')));
});
