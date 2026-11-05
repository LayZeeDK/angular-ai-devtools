// @ts-check
// Run: node --test .commandcode/skills/verify-ai-browsers/checks/model-init.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, main } from './model-init.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'model-init.mjs');
/** @type {Record<string, import('./state.mjs').RegistryInstance>} */
const REGISTRY = {
  'chrome-beta-nano': { model: { name: 'v3Nano', contextWindow: 9216 } },
};

/**
 * Healthy answers shaped like the live cycle of 2026-10-16; `patch` overrides one command's answer.
 * @param {Record<string, { code: number | null, json: Record<string, unknown> | null }>} [patch]
 * @returns {{ deps: import('./state.mjs').Deps, calls: string[][], files: Map<string, string> }}
 */
function fake(patch = {}) {
  /** @type {string[][]} */
  const calls = [];
  /** @type {Map<string, string>} */
  const files = new Map();
  /** @type {Record<string, { code: number | null, json: Record<string, unknown> | null }>} */
  const healthy = {
    'model init': {
      code: 0,
      json: {
        ok: true,
        firstCreateMs: 4200,
        secondCreateMs: 300,
        contextWindow: 9216,
        answer: 'ok',
      },
    },
    doctor: { code: 0, json: { ok: true, checks: [] } },
    flags: { code: 0, json: { ok: true } },
    'model info': {
      code: 0,
      json: {
        disk: [{ name: 'v3Nano' }],
        serving: 'v3Nano',
        backend: { backendType: 'GPU' },
      },
    },
  };

  return {
    calls,
    files,
    deps: {
      control: (args) => {
        calls.push(args);
        const key = args[0] === 'model' ? `model ${args[1]}` : (args[0] ?? '');
        const answer = patch[key] ?? healthy[key] ?? { code: 2, json: null };

        return { ...answer, text: JSON.stringify(answer.json) };
      },
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

test('passes when init reads the registry contextWindow and the state claim holds; init runs first', () => {
  const f = fake();
  check({ evidence: 'D:\\ev', name: 'chrome-beta-nano' }, REGISTRY, f.deps);
  assert.deepEqual(f.calls[0], ['model', 'init', 'chrome-beta-nano']);
  assert.deepEqual(
    f.calls.slice(1).map((a) => a[0]),
    ['doctor', 'flags', 'model'],
  );
  const saved = JSON.parse(
    f.files.get(join('D:\\ev', 'model-init.json')) ?? '{}',
  );
  assert.equal(saved.init.contextWindow, 9216);
  assert.equal(saved.state.pass, true);
});

test('a wrong contextWindow fails the claim, together with any state failure', () => {
  assert.throws(
    () =>
      check(
        { evidence: 'e', name: 'chrome-beta-nano' },
        REGISTRY,
        fake({ 'model init': { code: 0, json: { contextWindow: 4096 } } }).deps,
      ),
    /^Error: CLAIM: chrome-beta-nano: contextWindow 4096, registry 9216$/,
  );
  assert.throws(
    () =>
      check(
        { evidence: 'e', name: 'chrome-beta-nano' },
        REGISTRY,
        fake({
          'model init': { code: 0, json: {} },
          flags: { code: 1, json: {} },
        }).deps,
      ),
    /CLAIM: chrome-beta-nano: contextWindow null, registry 9216, flags exited 1/,
  );
});

test('init exit 2, init without JSON, or a state step that could not run: could not run', () => {
  /** @type {Record<string, { code: number | null, json: Record<string, unknown> | null }>[]} */
  const patches = [
    { 'model init': { code: 2, json: { reason: 'not running' } } },
    { 'model init': { code: 0, json: null } },
    { doctor: { code: 2, json: { reason: 'gone' } } },
  ];

  for (const patch of patches) {
    assert.throws(
      () =>
        check(
          { evidence: 'e', name: 'chrome-beta-nano' },
          REGISTRY,
          fake(patch).deps,
        ),
      (e) => e instanceof Error && !e.message.startsWith('CLAIM:'),
    );
  }
});

test('main exits 1 with the Error: CLAIM line, 2 for an unknown instance or two names', (t) => {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });
  const deps = fake({
    'model init': { code: 0, json: { contextWindow: 1 } },
  }).deps;
  assert.equal(
    main(
      ['--evidence', 'e', 'chrome-beta-nano'],
      () => deps,
      () => REGISTRY,
    ),
    1,
  );
  assert.match(lines.join('\n'), /^Error: CLAIM: /m);
  assert.equal(
    main(
      ['--evidence', 'e', 'edge-dev-aion'],
      () => fake().deps,
      () => REGISTRY,
    ),
    2,
  );
  assert.equal(
    main(
      ['--evidence', 'e', 'chrome-beta-nano', 'edge-dev-aion'],
      () => fake().deps,
      () => REGISTRY,
    ),
    2,
  );
  assert.equal(
    main(
      ['--evidence', 'e', 'chrome-beta-nano'],
      () => fake().deps,
      () => REGISTRY,
    ),
    0,
  );
});

test('the script exits 2 without an instance', () => {
  const r = spawnSync(process.execPath, [SCRIPT, '--evidence', 'x'], {
    encoding: 'utf8',
  });
  assert.equal(r.status, 2, r.stderr);
});

test('model init exiting 1 fails the claim even with the registry contextWindow, after saving the result', () => {
  const f = fake({ 'model init': { code: 1, json: { contextWindow: 9216 } } });
  assert.throws(
    () => check({ evidence: 'e', name: 'chrome-beta-nano' }, REGISTRY, f.deps),
    /^Error: CLAIM: chrome-beta-nano: model init exited 1$/,
  );
  assert.equal(
    JSON.parse(f.files.get(join('e', 'model-init.json')) ?? '{}').init.exit,
    1,
  );
});
