// @ts-check
// Run: node --test .claude/skills/verify-pangular-inspector/checks/setup.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, jsonOf, main, records } from './setup.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'setup.mjs');
const PASS = {
  ok: true,
  command: 'check',
  checks: [
    { name: 'declared-exact', status: 'pass', detail: 'declares 0.0.7' },
    { name: 'installed', status: 'pass', detail: 'has 0.0.7' },
  ],
};

/**
 * Fake deps: `control` answers with the given exit code and JSON; writes are kept in `files`.
 * @param {number | null} code
 * @param {Record<string, unknown> | null} json
 * @returns {{ deps: import('./setup.mjs').Deps, files: Map<string, string>, calls: string[][] }}
 */
function fake(code, json) {
  /** @type {Map<string, string>} */
  const files = new Map();
  /** @type {string[][]} */
  const calls = [];

  return {
    files,
    calls,
    deps: {
      control: (args) => {
        calls.push(args);

        return { code, json, text: json ? JSON.stringify(json) : 'not json' };
      },
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

/**
 * Runs `main` with console.error captured.
 * @param {import('node:test').TestContext} t
 * @param {string[]} argv
 * @param {import('./setup.mjs').Deps} deps
 * @returns {{ code: number, stderr: string }}
 */
function runMain(t, argv, deps) {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });
  const code = main(argv, deps);

  return { code, stderr: lines.join('\n') };
}

test('jsonOf reads pretty JSON after log lines and refuses anything else', () => {
  assert.deepEqual(jsonOf('[OK] x\n{\n  "ok": true\n}\n'), { ok: true });
  assert.equal(jsonOf('[ERROR] no json'), null);
  assert.equal(jsonOf('{ broken'), null);
  assert.equal(jsonOf('[1, 2]'), null);
});

test('records keeps only the object items of an array', () => {
  assert.deepEqual(records([{ a: 1 }, null, 3, [1], 'x']), [{ a: 1 }]);
  assert.deepEqual(records('nope'), []);
});

test('passes when check exits 0 with every fact passing, and saves the answer', () => {
  const f = fake(0, PASS);
  check({ out: 'D:\\out' }, f.deps);
  assert.deepEqual(f.calls, [['check']]);
  assert.deepEqual(
    JSON.parse(f.files.get(join('D:\\out', 'setup-check.json')) ?? ''),
    { exit: 0, result: PASS },
  );
});

test('a failed setup fact throws its CLAIM error and main exits 1 with the Error: CLAIM line', (t) => {
  const failing = {
    ok: false,
    checks: [
      { name: 'installed', status: 'fail', detail: 'node_modules has 0.0.6' },
    ],
  };
  assert.throws(
    () => check({ out: 'o' }, fake(1, failing).deps),
    /^Error: CLAIM: check exited 1; failed setup facts: installed: node_modules has 0\.0\.6$/,
  );
  const r = runMain(t, ['--out', 'o'], fake(1, failing).deps);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /^Error: CLAIM: /m);
});

test('a fact that fails while check exits 0 still fails the claim', () => {
  assert.throws(
    () =>
      check(
        { out: 'o' },
        fake(0, {
          checks: [{ name: 'dev-guard', status: 'fail', detail: 'x' }],
        }).deps,
      ),
    /CLAIM: .*dev-guard: x/,
  );
});

test('exit 2 or output that is not JSON could not run: main exits 2 without a CLAIM line', (t) => {
  const refused = runMain(
    t,
    ['--out', 'o'],
    fake(2, { ok: false, reason: 'refused' }).deps,
  );
  assert.equal(refused.code, 2);
  assert.doesNotMatch(refused.stderr, /CLAIM:/);
  assert.equal(runMain(t, ['--out', 'o'], fake(0, null).deps).code, 2);
});

test('the script exits 2 on a missing --out or an unknown flag, before it runs anything', () => {
  for (const args of [[], ['--out'], ['--bogus', 'x']]) {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], {
      encoding: 'utf8',
    });
    assert.equal(r.status, 2, `args ${JSON.stringify(args)}: ${r.stderr}`);
    assert.match(r.stderr, /could not run/);
  }
});

test('the answer is saved before a failing setup fact throws', () => {
  const f = fake(1, {
    checks: [{ name: 'installed', status: 'fail', detail: 'x' }],
  });
  assert.throws(() => check({ out: 'o' }, f.deps), /CLAIM:/);
  assert.ok(f.files.has(join('o', 'setup-check.json')));
});
