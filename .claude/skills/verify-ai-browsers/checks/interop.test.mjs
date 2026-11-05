// @ts-check
// Run: node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  CHECKOUT_EXTENSION,
  LIMIT_TERMS,
  check,
  main,
  missingLimitTerms,
} from './interop.mjs';

/** @type {Record<string, import('./state.mjs').RegistryInstance>} */
const REGISTRY = {
  'chrome-stable-nano': { model: { name: 'v3Nano', contextWindow: 9216 } },
  'chrome-beta-gemma4': {
    model: { name: 'gemma4-2b-it', contextWindow: 9216 },
  },
  'edge-phi4mini': {
    model: { name: 'Phi-4-mini-instruct', contextWindow: 9216 },
  },
  'edge-dev-aion': {
    model: { name: 'Aion-1.1-Instruct', contextWindow: 7168 },
  },
};
const URL = 'http://localhost:4222/stale-view-deferred';
const EXT = CHECKOUT_EXTENSION;
const LIMITS =
  'it cannot name the feeding Observable, the operator chain or emission timing';

/**
 * @param {Record<string, Record<string, { code: number | null, json: Record<string, unknown> | null }>>} [patch]  instance -> command -> answer
 */
function fake(patch = {}) {
  /** @type {string[][]} */
  const calls = [];
  /** @type {Map<string, string>} */
  const files = new Map();
  /** @type {import('./state.mjs').Deps} */
  const deps = {
    control: (args) => {
      calls.push(args);
      const key = args[0] === 'model' ? `model ${args[1]}` : (args[0] ?? '');
      const name = args[0] === 'model' ? (args[2] ?? '') : (args[1] ?? '');
      const model = REGISTRY[name]?.model.name;
      /** @type {Record<string, { code: number | null, json: Record<string, unknown> | null }>} */
      const healthy = {
        info: { code: 0, json: { ok: true, extensionDir: EXT } },
        panel: {
          code: 0,
          json: {
            ok: true,
            feature: 'interop',
            route: '/panel/interop',
            answer: 'model answer',
            nodes: 3,
            limits: LIMITS,
            inferred: 'inferred, untested',
            component: '_Portal',
            answerMs: 11000,
            ngVersion: '22.2.2',
            extensionId: 'mgkfgkdgobahfcgkdlokpoehblpbkfok',
          },
        },
        doctor: { code: 0, json: { ok: true, checks: [] } },
        flags: { code: 0, json: { ok: true } },
        'model info': {
          code: 0,
          json: {
            disk: [{ name: model }],
            serving: model,
            backend: { backendType: 'GPU' },
          },
        },
      };
      const answer = patch[name]?.[key] ??
        healthy[key] ?? { code: 2, json: null };
      return { ...answer, text: JSON.stringify(answer.json) };
    },
    write: (file, data) => {
      files.set(file, data);
    },
  };
  return { deps, calls, files };
}

test('passes when every named instance renders a slice, states the limits and explains', () => {
  const f = fake();
  check(
    {
      evidence: 'D:\\ev',
      url: URL,
      names: Object.keys(REGISTRY),
      extension: EXT,
    },
    REGISTRY,
    f.deps,
  );
  assert.deepEqual(
    f.calls.filter((a) => a[0] === 'panel').map((a) => a[1]),
    Object.keys(REGISTRY),
  );
  assert.ok(
    f.calls
      .filter((a) => a[0] === 'panel')
      .every((a) => a.includes('--feature=interop')),
  );
  const saved = JSON.parse(f.files.get(join('D:\\ev', 'interop.json')) ?? '{}');
  assert.equal(saved.results['chrome-stable-nano'].panel.nodes, 3);
  assert.equal(
    saved.results['chrome-stable-nano'].panel.answer,
    'model answer',
  );
});

test('an empty slice, a missing limit or an unhedged attribution fails the claim and names the instance', () => {
  /** @param {Record<string, unknown>} panel */
  const one = (panel) =>
    fake({
      'edge-phi4mini': {
        panel: {
          code: 0,
          json: {
            ok: true,
            answer: 'a',
            nodes: 3,
            limits: LIMITS,
            inferred: 'inferred, untested',
            ...panel,
          },
        },
      },
    }).deps;
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        one({ nodes: 0 }),
      ),
    /CLAIM: edge-phi4mini: the panel rendered no interop slice node/,
  );
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        one({ limits: 'it cannot name the feeding Observable' }),
      ),
    /CLAIM: edge-phi4mini: the panel did not state the limits operator, emission/,
  );
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        one({ inferred: 'certain' }),
      ),
    /CLAIM: edge-phi4mini: the panel did not word the attribution/,
  );
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        one({ answer: '  ' }),
      ),
    /CLAIM: edge-phi4mini: the panel showed no answer/,
  );
});

test('a state failure is a failed claim, and panel exit 2 is could-not-run', () => {
  assert.throws(
    () =>
      check(
        {
          evidence: 'e',
          url: URL,
          names: ['chrome-beta-gemma4'],
          extension: EXT,
        },
        REGISTRY,
        fake({
          'chrome-beta-gemma4': { doctor: { code: 1, json: { ok: false } } },
        }).deps,
      ),
    /CLAIM: chrome-beta-gemma4: doctor/,
  );
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        fake({
          'edge-phi4mini': {
            panel: {
              code: 2,
              json: {
                reason: 'the panel shows no [data-testid="interop-slice"]',
              },
            },
          },
        }).deps,
      ),
    (e) =>
      e instanceof Error &&
      !e.message.startsWith('CLAIM:') &&
      /interop-slice/.test(e.message),
  );
});

test('a panel without the interop tab is could-not-run, so a prepared check reads honestly', () => {
  const panel = {
    code: 1,
    json: {
      ok: false,
      feature: 'interop',
      error:
        'the panel shows no [data-testid="interop-slice"] within 30 s: no Angular detection was recorded',
    },
  };
  assert.throws(
    () =>
      check(
        {
          evidence: 'e',
          url: URL,
          names: ['chrome-stable-nano'],
          extension: EXT,
        },
        REGISTRY,
        fake({ 'chrome-stable-nano': { panel } }).deps,
      ),
    (e) =>
      e instanceof Error &&
      !e.message.startsWith('CLAIM:') &&
      /has no interop slice yet/.test(e.message),
  );
});

test('an app without the interop route is could-not-run and names the panel it served instead', () => {
  const panel = {
    code: 1,
    json: {
      ok: false,
      feature: 'interop',
      route: '/panel/',
      error: 'the panel shows no [data-testid="explain"] within 30 s',
    },
  };
  assert.throws(
    () =>
      check(
        {
          evidence: 'e',
          url: URL,
          names: ['chrome-stable-nano'],
          extension: EXT,
        },
        REGISTRY,
        fake({ 'chrome-stable-nano': { panel } }).deps,
      ),
    (e) =>
      e instanceof Error &&
      !e.message.startsWith('CLAIM:') &&
      /has no interop panel route yet \(served \/panel\/\)/.test(e.message),
  );
  // A trailing slash on the real route is still the interop panel.
  const ok = {
    code: 0,
    json: {
      ok: true,
      feature: 'interop',
      route: '/panel/interop/',
      answer: 'a',
      nodes: 1,
      limits: LIMITS,
      inferred: 'inferred, untested',
    },
  };
  assert.doesNotThrow(() =>
    check(
      {
        evidence: 'e',
        url: URL,
        names: ['chrome-stable-nano'],
        extension: EXT,
      },
      REGISTRY,
      fake({ 'chrome-stable-nano': { panel: ok } }).deps,
    ),
  );
});

test('an instance built from another checkout is could-not-run and is never driven', () => {
  const f = fake({
    'edge-phi4mini': {
      info: { code: 0, json: { extensionDir: 'D:/primary/extension' } },
    },
  });
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        f.deps,
      ),
    /edge-phi4mini serves the extension from/,
  );
  assert.equal(f.calls.filter((a) => a[0] === 'panel').length, 0);
});

test('main: all instances by default, 1 on a failed claim, 2 without --url or for an unknown instance', (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fake();
  assert.equal(
    main(
      ['--evidence', 'e', '--url', URL],
      () => f.deps,
      () => REGISTRY,
    ),
    0,
  );
  assert.equal(f.calls.filter((a) => a[0] === 'panel').length, 4);
  assert.equal(
    main(
      ['--evidence', 'e', '--url', URL, 'edge-phi4mini'],
      () =>
        fake({
          'edge-phi4mini': {
            panel: { code: 1, json: { error: 'x', nodes: 0 } },
          },
        }).deps,
      () => REGISTRY,
    ),
    1,
  );
  assert.equal(
    main(
      ['--evidence', 'e', 'edge-phi4mini'],
      () => fake().deps,
      () => REGISTRY,
    ),
    2,
  );
  assert.equal(
    main(
      ['--evidence', 'e', '--url', URL, 'nope'],
      () => fake().deps,
      () => REGISTRY,
    ),
    2,
  );
});

test('--extension names the checkout an instance must serve, so a sidecar can verify it', (t) => {
  t.mock.method(console, 'error', () => {});
  // A verify sidecar is a different directory than the instance's checkout; without the flag the
  // guard refuses the run (exit 2), and with it the same instance passes.
  const elsewhere = join('D:\\elsewhere', 'checkout', 'extension');
  const patch = {
    'chrome-stable-nano': {
      info: { code: 0, json: { ok: true, extensionDir: EXT } },
    },
  };
  assert.equal(
    main(
      [
        '--evidence',
        'e',
        '--url',
        URL,
        '--extension',
        elsewhere,
        'chrome-stable-nano',
      ],
      () => fake(patch).deps,
      () => REGISTRY,
    ),
    2,
  );
  assert.equal(
    main(
      [
        '--evidence',
        'e',
        '--url',
        URL,
        '--extension',
        EXT,
        'chrome-stable-nano',
      ],
      () => fake(patch).deps,
      () => REGISTRY,
    ),
    0,
  );
});

test('an empty slice (nodes: 0) is a CLAIM failure, never a pass (held-out E1)', () => {
  const deps = fake({
    'edge-phi4mini': {
      panel: {
        code: 0,
        json: {
          ok: true,
          feature: 'interop',
          route: '/panel/interop',
          answer: 'model answer',
          nodes: 0,
          limits: LIMITS,
          inferred: 'inferred, untested',
        },
      },
    },
  }).deps;
  assert.throws(
    () =>
      check(
        { evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT },
        REGISTRY,
        deps,
      ),
    (e) =>
      e instanceof Error &&
      e.message.startsWith('CLAIM:') &&
      /the panel rendered no interop slice node/.test(e.message),
  );
});

test('missingLimitTerms names every limit the panel left out, case-insensitively', () => {
  assert.deepEqual(missingLimitTerms(LIMITS), []);
  assert.deepEqual(missingLimitTerms('CANNOT NAME THE OBSERVABLE'), [
    'operator',
    'emission',
  ]);
  assert.deepEqual(missingLimitTerms(null), LIMIT_TERMS);
  assert.deepEqual(missingLimitTerms(''), LIMIT_TERMS);
});
