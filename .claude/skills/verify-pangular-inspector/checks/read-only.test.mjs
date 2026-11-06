// @ts-check
// Run: node --test .claude/skills/verify-pangular-inspector/checks/read-only.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, main } from './read-only.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'read-only.mjs');

/**
 * Fake deps: `tools` answers with `actions` as its action tools, `call navigate` exits `navigateCode`.
 * @param {{ toolsCode?: number, actions?: unknown, navigateCode?: number | null, reason?: string }} [o]
 * @returns {{ deps: import('./read-only.mjs').Deps, files: Map<string, string>, calls: string[][] }}
 */
function fake(o = {}) {
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

        if (args[0] === 'tools') {
          return {
            code: o.toolsCode ?? 0,
            json: { ok: true, count: 46, actionToolsPresent: o.actions ?? [] },
            text: '',
          };
        }

        const code = o.navigateCode === undefined ? 2 : o.navigateCode;

        return {
          code,
          json: {
            ok: code === 0,
            reason:
              o.reason ??
              'refused: navigate acts on the app; pass --confirm to run it',
          },
          text: `exit ${code}`,
        };
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
 * @param {import('./read-only.mjs').Deps} deps
 * @returns {{ code: number, stderr: string }}
 */
function runMain(t, deps) {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });

  return { code: main(['--out', 'o'], deps), stderr: lines.join('\n') };
}

test('passes when tools/list has no action tool and navigate without --confirm is refused', () => {
  const f = fake();
  check({ out: 'D:\\ev' }, f.deps);
  assert.deepEqual(f.calls, [
    ['tools'],
    ['call', 'navigate', '--args', '{"action":"navigate","url":"/home"}'],
  ]);
  assert.ok(!f.calls[1]?.includes('--confirm'));
  assert.ok(
    f.files.has(join('D:\\ev', 'tools-list.json')) &&
      f.files.has(join('D:\\ev', 'navigate-refused.json')),
  );
});

test('an action tool on offer fails the claim and main exits 1 with the Error: CLAIM line', (t) => {
  assert.throws(
    () =>
      check({ out: 'o' }, fake({ actions: ['navigate', 'highlight'] }).deps),
    /^Error: CLAIM: tools\/list offers action tools: navigate, highlight$/,
  );
  const r = runMain(t, fake({ actions: ['navigate'] }).deps);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /^Error: CLAIM: /m);
});

test('navigate that runs (exit 0) or fails as a tool (exit 1) fails the claim', () => {
  assert.throws(
    () => check({ out: 'o' }, fake({ navigateCode: 0 }).deps),
    /CLAIM: call navigate without --confirm exited 0, not 2/,
  );
  assert.throws(
    () => check({ out: 'o' }, fake({ navigateCode: 1 }).deps),
    /CLAIM: call navigate without --confirm exited 1/,
  );
});

test('tools that cannot answer could not run: exit 2, no CLAIM line', (t) => {
  const r = runMain(t, fake({ toolsCode: 2 }).deps);
  assert.equal(r.code, 2);
  assert.doesNotMatch(r.stderr, /CLAIM:/);
  assert.equal(runMain(t, fake({ actions: 'not a list' }).deps).code, 2);
  assert.equal(runMain(t, fake({ navigateCode: null }).deps).code, 2);
});

test('the script exits 2 without --out', () => {
  const r = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(r.status, 2);
});

test('an exit 2 that is not the --confirm refusal (the server lacks the tool) fails the claim, after saving both answers', () => {
  const f = fake({
    reason:
      'no tool navigate on http://localhost:9999/__mcp (the server runs --read-only)',
  });
  assert.throws(
    () => check({ out: 'o' }, f.deps),
    /^Error: CLAIM: call navigate without --confirm exited 2, not 2 with its --confirm refusal: no tool navigate/,
  );
  assert.ok(
    f.files.has(join('o', 'tools-list.json')) &&
      f.files.has(join('o', 'navigate-refused.json')),
  );
});
