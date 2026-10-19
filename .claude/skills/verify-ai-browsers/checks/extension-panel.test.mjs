// @ts-check
// Run: node --test .commandcode/skills/verify-ai-browsers/checks/extension-panel.test.mjs
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { CHECKOUT_EXTENSION, check, main } from './extension-panel.mjs';

/** @type {Record<string, import('./state.mjs').RegistryInstance>} */
const REGISTRY = { 'chrome-beta-gemma4': { model: { name: 'gemma4-2b-it', contextWindow: 9216 } }, 'edge-phi4mini': { model: { name: 'Phi-4-mini-instruct', contextWindow: 9216 } } };
const URL = 'http://localhost:4222/';
const EXT = CHECKOUT_EXTENSION;

/**
 * Healthy answers shaped like the live runs of 2026-10-19; `patch` overrides one command's answer per instance.
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
        panel: { code: 0, json: { ok: true, answer: 'Angular 22.2.2 is ...', answerMs: 9000, ngVersion: '22.2.2', extensionId: 'mgkfgkdgobahfcgkdlokpoehblpbkfok' } },
        doctor: { code: 0, json: { ok: true, checks: [] } },
        flags: { code: 0, json: { ok: true } },
        'model info': { code: 0, json: { disk: [{ name: model }], serving: model, backend: { backendType: 'GPU' } } },
      };
      const answer = patch[name]?.[key] ?? healthy[key] ?? { code: 2, json: null };

      return { ...answer, text: JSON.stringify(answer.json) };
    },
    write: (file, data) => {
      files.set(file, data);
    },
  };

  return { deps, calls, files };
}

test('passes when every named instance answers in the panel and passes the state claim', () => {
  const f = fake();
  check({ evidence: 'D:\\ev', url: URL, names: Object.keys(REGISTRY), extension: EXT }, REGISTRY, f.deps);
  assert.deepEqual(f.calls.filter((a) => a[0] === 'panel'), [['panel', 'chrome-beta-gemma4', `--url=${URL}`], ['panel', 'edge-phi4mini', `--url=${URL}`]]);
  const saved = JSON.parse(f.files.get(join('D:\\ev', 'extension-panel.json')) ?? '{}');
  assert.equal(saved.results['edge-phi4mini'].panel.answer, 'Angular 22.2.2 is ...');
});

test('a panel error, an empty answer or a state failure fails the claim and names the instance', () => {
  assert.throws(
    () => check({ evidence: 'e', url: URL, names: Object.keys(REGISTRY), extension: EXT }, REGISTRY, fake({ 'edge-phi4mini': { panel: { code: 1, json: { ok: false, answer: null, error: 'Prompt API unavailable on this page (availability: unavailable)' } } } }).deps),
    /^Error: CLAIM: edge-phi4mini: the panel showed no answer \(Prompt API unavailable on this page \(availability: unavailable\)\)$/,
  );
  assert.throws(() => check({ evidence: 'e', url: URL, names: ['chrome-beta-gemma4'], extension: EXT }, REGISTRY, fake({ 'chrome-beta-gemma4': { panel: { code: 0, json: { answer: '  ' } } } }).deps), /CLAIM: chrome-beta-gemma4: the panel showed no answer/);
  assert.throws(() => check({ evidence: 'e', url: URL, names: ['chrome-beta-gemma4'], extension: EXT }, REGISTRY, fake({ 'chrome-beta-gemma4': { doctor: { code: 1, json: { ok: false } } } }).deps), /CLAIM: chrome-beta-gemma4: doctor/);
});

test('panel exit 2 or no JSON is could-not-run, not a failed claim', () => {
  for (const panel of [{ code: 2, json: { reason: 'not running' } }, { code: 0, json: null }]) {
    assert.throws(() => check({ evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT }, REGISTRY, fake({ 'edge-phi4mini': { panel } }).deps), (e) => e instanceof Error && !e.message.startsWith('CLAIM:'));
  }
});

test('an instance that serves the build of another checkout is could-not-run, and no panel runs on it', () => {
  const f = fake({ 'edge-phi4mini': { info: { code: 0, json: { extensionDir: 'D:/primary/extension' } } } });
  assert.throws(() => check({ evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT }, REGISTRY, f.deps), /edge-phi4mini serves the extension from D:\/primary\/extension, not this checkout's .*: run "down edge-phi4mini", then "up edge-phi4mini --extension=extension" here/);
  assert.equal(f.calls.filter((a) => a[0] === 'panel').length, 0);
});

test('main: all instances by default, 1 on a failed claim, 2 without --url or for an unknown instance', (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fake();
  assert.equal(main(['--evidence', 'e', '--url', URL], () => f.deps, () => REGISTRY), 0);
  assert.equal(f.calls.filter((a) => a[0] === 'panel').length, 2);
  assert.equal(main(['--evidence', 'e', '--url', URL, 'edge-phi4mini'], () => fake({ 'edge-phi4mini': { panel: { code: 1, json: { error: 'x' } } } }).deps, () => REGISTRY), 1);
  assert.equal(main(['--evidence', 'e', 'edge-phi4mini'], () => fake().deps, () => REGISTRY), 2);
  assert.equal(main(['--evidence', 'e', '--url', URL, 'edge-dev-aion'], () => fake().deps, () => REGISTRY), 2);
});
