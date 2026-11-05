// @ts-check
// Run: node --test .claude/skills/verify-angular-devtools/checks/coexist.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, field, main } from './coexist.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'coexist.mjs');
/** The coexist --di-graph result of the live run of 2026-10-16, cut down. */
const LIVE = {
  ok: true,
  profiler: {
    ok: true,
    subscribers: { bothOn: { a: 16, b: 16 }, afterRemoveA: { a: 16, b: 32 } },
    devtoolsCycles: 2,
  },
  flag: { ok: true, value: true },
  signalGraph: {
    ok: true,
    ng: ['template:app-counter', 'signal:count'],
    pane: ['template:app-counter', 'signal:count'],
  },
  diGraph: { templateLostInNg: true, templateLostInPane: true },
};

/**
 * Fake deps answering coexist with the given exit and JSON.
 * @param {number | null} code
 * @param {Record<string, unknown> | null} json
 * @returns {{ deps: import('./coexist.mjs').Deps, files: Map<string, string>, calls: string[][] }}
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

        return { code, json, text: 'coexist output' };
      },
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

test('field reads an object key and gives undefined for anything else', () => {
  assert.equal(field({ a: 1 }, 'a'), 1);
  assert.equal(field(null, 'a'), undefined);
  assert.equal(field('x', 'length'), undefined);
});

test('passes on the live result; --di-graph is passed on and its template loss is recorded, not judged', () => {
  const f = fake(0, LIVE);
  check({ out: 'D:\\ev', diGraph: true }, f.deps);
  assert.deepEqual(f.calls, [['coexist', '--di-graph']]);
  const saved = JSON.parse(
    f.files.get(join('D:\\ev', 'coexist-result.json')) ?? '{}',
  );
  assert.deepEqual(saved.parts, {
    profiler: true,
    flag: true,
    signalGraph: true,
  });
  assert.deepEqual(saved.diGraph, {
    templateLostInPane: true,
    templateLostInNg: true,
  });
  const plain = fake(0, { ...LIVE, diGraph: undefined });
  check({ out: 'o', diGraph: false }, plain.deps);
  assert.deepEqual(plain.calls, [['coexist']]);
});

test('each failing part throws the CLAIM error by name', () => {
  for (const part of ['profiler', 'flag', 'signalGraph']) {
    const json = { ...LIVE, ok: false, [part]: { ok: false } };
    assert.throws(
      () => check({ out: 'o', diGraph: false }, fake(1, json).deps),
      new RegExp(
        `^Error: CLAIM: coexist exited 1; failed ${part} \\{"ok":false\\}$`,
      ),
    );
  }

  assert.throws(
    () => check({ out: 'o', diGraph: false }, fake(0, { ok: true }).deps),
    /CLAIM: coexist exited 0; failed profiler null; flag null; signalGraph null/,
  );
});

test('main: 1 with the Error: CLAIM line; 2 when coexist is refused or prints no JSON', (t) => {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });
  assert.equal(
    main(['--out', 'o'], fake(1, { ...LIVE, flag: { ok: false } }).deps),
    1,
  );
  assert.match(lines.join('\n'), /^Error: CLAIM: /m);
  lines.length = 0;
  assert.equal(
    main(
      ['--out', 'o', '--di-graph'],
      fake(2, {
        ok: false,
        reason: 'refused: the recorded browser does not own the CDP port',
      }).deps,
    ),
    2,
  );
  assert.equal(main(['--out', 'o'], fake(0, null).deps), 2);
  assert.doesNotMatch(lines.join('\n'), /CLAIM:/);
});

test('the script exits 2 when --di-graph carries a value', () => {
  assert.equal(
    spawnSync(process.execPath, [SCRIPT, '--out', 'o', '--di-graph=yes'], {
      encoding: 'utf8',
    }).status,
    2,
  );
});

test('the result is saved before a failing part throws', () => {
  const f = fake(1, { ...LIVE, flag: { ok: false } });
  assert.throws(() => check({ out: 'o', diGraph: false }, f.deps), /CLAIM:/);
  assert.equal(
    JSON.parse(f.files.get(join('o', 'coexist-result.json')) ?? '{}').parts
      .flag,
    false,
  );
});
