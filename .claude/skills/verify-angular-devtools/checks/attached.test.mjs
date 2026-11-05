// @ts-check
// Run: node --test .claude/skills/verify-angular-devtools/checks/attached.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, main } from './attached.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'attached.mjs');
/** The attach result of the live run of 2026-10-16. */
const LIVE = {
  ok: true,
  flag: true,
  flagSetAt: 45,
  detection: {
    isIvy: true,
    isAngular: true,
    isDebugMode: true,
    isSupportedAngularVersion: true,
    isAngularDevTools: true,
  },
  backendInstalled: true,
  handshake: true,
  backendReady: 818,
  ngVersion: '22.2.2',
};

/**
 * Fake deps answering attach with the given exit and JSON.
 * @param {number | null} code
 * @param {Record<string, unknown> | null} json
 * @returns {{ deps: import('./attached.mjs').Deps, files: Map<string, string>, calls: string[][] }}
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

        return { code, json, text: 'attach output' };
      },
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

test('passes on the live attach result and saves it', () => {
  const f = fake(0, LIVE);
  check({ out: 'D:\\ev' }, f.deps);
  assert.deepEqual(f.calls, [['attach']]);
  assert.deepEqual(
    JSON.parse(f.files.get(join('D:\\ev', 'attach.json')) ?? '').result,
    LIVE,
  );
});

test('an attach that is not ok throws its CLAIM error with the facts control.mjs put in its reason, after saving them', () => {
  const facts = {
    ...LIVE,
    backendReady: null,
    detection: { isAngular: true, isDebugMode: false },
  };
  // control-angular-devtools throws Unhealthy and prints only ok, exit and reason (control.mjs cmdAttach).
  const f = fake(1, {
    ok: false,
    exit: 1,
    reason: `not attached: ${JSON.stringify(facts)}`,
  });
  assert.throws(
    () => check({ out: 'o' }, f.deps),
    /^Error: CLAIM: attach exited 1: not attached: \{"ok":true,"flag":true,.*"isDebugMode":false\}/,
  );
  assert.ok(f.files.has(join('o', 'attach.json')));
});

test('main: 1 with the Error: CLAIM line; 2 when attach is refused or prints no JSON', (t) => {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });
  assert.equal(main(['--out', 'o'], fake(1, { ok: false }).deps), 1);
  assert.match(lines.join('\n'), /^Error: CLAIM: /m);
  lines.length = 0;
  assert.equal(
    main(
      ['--out', 'o'],
      fake(2, { ok: false, reason: 'refused: no state' }).deps,
    ),
    2,
  );
  assert.equal(main(['--out', 'o'], fake(0, null).deps), 2);
  assert.doesNotMatch(lines.join('\n'), /CLAIM:/);
});

test('the script exits 2 on an unknown flag', () => {
  assert.equal(
    spawnSync(process.execPath, [SCRIPT, '--out', 'o', '--di-graph'], {
      encoding: 'utf8',
    }).status,
    2,
  );
});
