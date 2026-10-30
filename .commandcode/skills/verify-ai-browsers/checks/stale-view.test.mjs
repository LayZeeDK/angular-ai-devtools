// @ts-check
// Run: node --test .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { test } from 'node:test';
import { mkdtempSync, realpathSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { CHECKOUT_EXTENSION, check, main, samePath } from './stale-view.mjs';

/** @type {Record<string, import('./state.mjs').RegistryInstance>} */
const REGISTRY = {
  'chrome-stable-nano': { model: { name: 'v3Nano', contextWindow: 9216 } },
  'chrome-beta-gemma4': { model: { name: 'gemma4-2b-it', contextWindow: 9216 } },
  'edge-phi4mini': { model: { name: 'Phi-4-mini-instruct', contextWindow: 9216 } },
  'edge-dev-aion': { model: { name: 'Aion-1.1-Instruct', contextWindow: 7168 } },
};
const URL = 'http://localhost:4222/stale-view';
const EXT = CHECKOUT_EXTENSION;

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
        panel: { code: 0, json: { ok: true, feature: 'stale-view', answer: 'model answer', field: 'lastLogged', component: '_Counter', hedged: 'the template may show a stale value', answerMs: 9000, ngVersion: '22.2.2', extensionId: 'mgkfgkdgobahfcgkdlokpoehblpbkfok' } },
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
  assert.deepEqual(f.calls.filter((a) => a[0] === 'panel').map((a) => a[1]), Object.keys(REGISTRY));
  const saved = JSON.parse(f.files.get(join('D:\\ev', 'stale-view.json')) ?? '{}');
  assert.equal(saved.results['chrome-stable-nano'].panel.field, 'lastLogged');
  assert.equal(saved.results['chrome-stable-nano'].panel.answer, 'model answer');
  assert.equal(saved.portal.exercised, false);
});

test('a panel error, an empty answer or a state failure fails the claim and names the instance', () => {
  assert.throws(
    () => check({ evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT }, REGISTRY, fake({ 'edge-phi4mini': { panel: { code: 1, json: { ok: false, answer: null, error: 'Prompt API unavailable', field: null, hedged: null } } } }).deps),
    /CLAIM: edge-phi4mini/,
  );
  assert.throws(() => check({ evidence: 'e', url: URL, names: ['chrome-beta-gemma4'], extension: EXT }, REGISTRY, fake({ 'chrome-beta-gemma4': { panel: { code: 0, json: { answer: '  ', field: 'lastLogged', hedged: 'the template may show a stale value' } } } }).deps), /CLAIM: chrome-beta-gemma4: the panel showed no answer/);
  assert.throws(() => check({ evidence: 'e', url: URL, names: ['chrome-beta-gemma4'], extension: EXT }, REGISTRY, fake({ 'chrome-beta-gemma4': { doctor: { code: 1, json: { ok: false } } } }).deps), /CLAIM: chrome-beta-gemma4: doctor/);
});

test('panel exit 2 or no JSON is could-not-run, not a failed claim', () => {
  for (const panel of [{ code: 2, json: { reason: 'not running' } }, { code: 0, json: null }]) {
    assert.throws(() => check({ evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT }, REGISTRY, fake({ 'edge-phi4mini': { panel } }).deps), (e) => e instanceof Error && !e.message.startsWith('CLAIM:'));
  }
});

test('an instance that serves the build of another checkout is could-not-run, and no panel runs on it', () => {
  const f = fake({ 'edge-phi4mini': { info: { code: 0, json: { extensionDir: 'D:/primary/extension' } } } });
  assert.throws(() => check({ evidence: 'e', url: URL, names: ['edge-phi4mini'], extension: EXT }, REGISTRY, f.deps), /edge-phi4mini serves the extension from D:\/primary\/extension/);
  assert.equal(f.calls.filter((a) => a[0] === 'panel').length, 0);
});

test('main: all instances by default, 1 on a failed claim, 2 without --url or for an unknown instance', (t) => {
  t.mock.method(console, 'error', () => {});
  const f = fake();
  assert.equal(main(['--evidence', 'e', '--url', URL], () => f.deps, () => REGISTRY), 0);
  assert.equal(f.calls.filter((a) => a[0] === 'panel').length, 4);
  assert.equal(main(['--evidence', 'e', '--url', URL, 'edge-phi4mini'], () => fake({ 'edge-phi4mini': { panel: { code: 1, json: { error: 'x', field: null, hedged: null } } } }).deps, () => REGISTRY), 1);
  assert.equal(main(['--evidence', 'e', 'edge-phi4mini'], () => fake().deps, () => REGISTRY), 2);
  // unknown instance
  assert.equal(main(['--evidence', 'e', '--url', URL, 'nope'], () => fake().deps, () => REGISTRY), 2);
});

test('samePath matches a folder across its short and long spellings and the case of the drive letter', (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'ext-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const long = realpathSync.native(dir);
  assert.equal(samePath(dir, long), true);
  assert.equal(samePath(long.replace(/^[A-Z]:/, (d) => d.toLowerCase()), long), true);
  assert.equal(samePath(join(long, '..'), long), false);
  assert.equal(samePath(null, long), false);
});