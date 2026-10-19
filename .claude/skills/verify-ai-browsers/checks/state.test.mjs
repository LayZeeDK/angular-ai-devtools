// @ts-check
// Run: node --test .commandcode/skills/verify-ai-browsers/checks/state.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { check, decide, instanceState, jsonOf, main, records, registryOf } from './state.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'state.mjs');
/** @type {Record<string, import('./state.mjs').RegistryInstance>} */
const REGISTRY = {
  'chrome-beta-nano': { model: { name: 'v3Nano', contextWindow: 9216 } },
  'edge-dev-aion': { model: { name: 'Aion-1.1-Instruct', contextWindow: 7168 } },
};

/**
 * Healthy answers per command, shaped like the live run of 2026-10-16; `patch` overrides one command's answer.
 * @param {string} model
 * @param {Record<string, { code: number | null, json: Record<string, unknown> | null }>} [patch]
 * @returns {{ deps: import('./state.mjs').Deps, calls: string[][], files: Map<string, string> }}
 */
function fake(model, patch = {}) {
  /** @type {string[][]} */
  const calls = [];
  /** @type {Map<string, string>} */
  const files = new Map();
  /** @type {Record<string, { code: number | null, json: Record<string, unknown> | null }>} */
  const healthy = {
    doctor: { code: 0, json: { ok: true, checks: [{ id: 'process', pass: true }, { id: 'canary.tools', pass: null }] } },
    flags: { code: 0, json: { ok: true } },
    'model info': {
      code: 0,
      json: { ok: true, disk: [{ name: model, mib: 4072 }], serving: model, backend: { backendType: 'GPU (fastest inference)' }, requestedBackend: 'gpu', performanceClass: 3 },
    },
  };

  return {
    calls,
    files,
    deps: {
      control: (args) => {
        calls.push(args);
        const key = args[0] === 'model' ? `model ${args[1]}` : (args[0] ?? '');
        const answer = patch[key] ?? healthy[key] ?? { code: 2, json: { ok: false, reason: 'unknown' } };

        return { ...answer, text: JSON.stringify(answer.json) };
      },
      write: (file, data) => {
        files.set(file, data);
      },
    },
  };
}

/**
 * Runs `main` with console.error captured and the fake deps.
 * @param {import('node:test').TestContext} t
 * @param {string[]} argv
 * @param {import('./state.mjs').Deps} deps
 * @returns {{ code: number, stderr: string }}
 */
function runMain(t, argv, deps) {
  /** @type {string[]} */
  const lines = [];
  t.mock.method(console, 'error', (/** @type {unknown} */ line) => {
    lines.push(String(line));
  });

  return { code: main(argv, () => deps, () => REGISTRY), stderr: lines.join('\n') };
}

test('jsonOf takes the last JSON line and ignores log lines', () => {
  assert.deepEqual(jsonOf('[OK] doctor\n{"ok":true,"exit":0}\n'), { ok: true, exit: 0 });
  assert.equal(jsonOf('[ERROR] crashed'), null);
  assert.equal(jsonOf('{"cut'), null);
  assert.deepEqual(records([{ a: 1 }, 2, null]), [{ a: 1 }]);
});

test('registryOf reads the repository registry and refuses one without instances', () => {
  const real = registryOf(readFileSync(join(HERE, '..', '..', 'control-ai-browsers', 'instances.json'), 'utf8'));
  assert.equal(real['chrome-beta-nano']?.model.name, 'v3Nano');
  assert.throws(() => registryOf('{"profilesRoot":".browsers"}'), /no instances object/);
});

test('a healthy instance passes with its readings; doctor, flags and model info each run once', () => {
  const f = fake('v3Nano');
  const s = instanceState('chrome-beta-nano', { model: { name: 'v3Nano', contextWindow: 9216 } }, f.deps);
  assert.equal(s.pass, true);
  assert.equal(s.couldNotRun, null);
  assert.deepEqual(s.readings, { expected: 'v3Nano', disk: true, serving: 'v3Nano', backend: 'GPU (fastest inference)', requestedBackend: 'gpu', performanceClass: 3 });
  assert.deepEqual(f.calls, [['doctor', 'chrome-beta-nano'], ['flags', 'chrome-beta-nano'], ['model', 'info', 'chrome-beta-nano']]);
});

test('each part of the claim fails on its own', () => {
  const want = { model: { name: 'v3Nano', contextWindow: 9216 } };
  /** @type {[Record<string, { code: number | null, json: Record<string, unknown> | null }>, RegExp][]} */
  const cases = [
    [{ doctor: { code: 1, json: { ok: false, checks: [{ id: 'canary.structured', pass: false }] } } }, /doctor exited 1 \(failed: canary.structured\)/],
    [{ flags: { code: 1, json: { ok: false } } }, /flags exited 1/],
    [{ 'model info': { code: 0, json: { disk: [{ name: 'gemma4-2b-it' }], serving: 'v3Nano' } } }, /no v3Nano manifest on disk/],
    [{ 'model info': { code: 0, json: { disk: [{ name: 'v3Nano' }], serving: null } } }, /Broker State serves null, not v3Nano/],
  ];

  for (const [patch, message] of cases) {
    const s = instanceState('chrome-beta-nano', want, fake('v3Nano', patch).deps);
    assert.equal(s.pass, false);
    assert.equal(s.couldNotRun, null);
    assert.match(s.failed.join('; '), message);
  }
});

test('a step that exits 2 or prints no JSON could not run', () => {
  const want = { model: { name: 'v3Nano', contextWindow: 9216 } };
  const stopped = instanceState('chrome-beta-nano', want, fake('v3Nano', { doctor: { code: 2, json: { ok: false, reason: 'not running' } } }).deps);
  assert.match(stopped.couldNotRun ?? '', /^doctor chrome-beta-nano exited 2: not running$/);
  assert.notEqual(instanceState('chrome-beta-nano', want, fake('v3Nano', { flags: { code: 0, json: null } }).deps).couldNotRun, null);
});

test('decide: could-not-run wins over a failure, and a failure throws CLAIM', () => {
  const ok = { instance: 'a', pass: true, failed: [], couldNotRun: null, readings: {} };
  const bad = { instance: 'b', pass: false, failed: ['flags exited 1'], couldNotRun: null, readings: {} };
  const stuck = { instance: 'c', pass: false, failed: [], couldNotRun: 'doctor c exited 2: not running', readings: {} };
  assert.doesNotThrow(() => decide([ok]));
  assert.throws(() => decide([ok, bad]), /^Error: CLAIM: b: flags exited 1$/);
  assert.throws(() => decide([bad, stuck]), (e) => e instanceof Error && e.message === 'c: doctor c exited 2: not running');
});

test('check runs every registry instance when none is named and writes state.json before deciding', () => {
  const f = fake('v3Nano');
  assert.throws(() => check({ evidence: 'D:\\ev', names: [] }, REGISTRY, f.deps), /CLAIM: edge-dev-aion: no Aion-1.1-Instruct manifest on disk/);
  const saved = JSON.parse(f.files.get(join('D:\\ev', 'state.json')) ?? '[]');
  assert.deepEqual(saved.map((/** @type {{ instance: string }} */ s) => s.instance), ['chrome-beta-nano', 'edge-dev-aion']);
});

test('main: exit 0 pass, 1 with the Error: CLAIM line, 2 for an unknown instance or missing --evidence', (t) => {
  assert.equal(runMain(t, ['--evidence', 'ev', 'chrome-beta-nano'], fake('v3Nano').deps).code, 0);
  const failed = runMain(t, ['--evidence', 'ev', 'chrome-beta-nano'], fake('v3Nano', { flags: { code: 1, json: {} } }).deps);
  assert.equal(failed.code, 1);
  assert.match(failed.stderr, /^Error: CLAIM: chrome-beta-nano: flags exited 1$/m);
  const unknown = runMain(t, ['--evidence', 'ev', 'nope'], fake('v3Nano').deps);
  assert.equal(unknown.code, 2);
  assert.doesNotMatch(unknown.stderr, /CLAIM:/);
  assert.equal(runMain(t, ['chrome-beta-nano'], fake('v3Nano').deps).code, 2);
});

test('main escapes control characters a control step put in its reason', (t) => {
  const r = runMain(t, ['--evidence', 'ev', 'chrome-beta-nano'], fake('v3Nano', { flags: { code: 2, json: { ok: false, reason: 'page said \u001b]0;pwned\u0007' } } }).deps);
  assert.equal(r.code, 2);
  assert.ok(r.stderr.includes(String.raw`page said \u001b]0;pwned\u0007`), r.stderr);
  assert.doesNotMatch(r.stderr, /\u001b/);
});

test('the script exits 2 on bad arguments before it runs a control step', () => {
  for (const args of [[], ['--evidence'], ['--evidence', 'x', '--bogus']]) {
    const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
    assert.equal(r.status, 2, `args ${JSON.stringify(args)}: ${r.stderr}`);
  }
});

test('model info exiting 1 fails the claim even when its JSON names the right model', () => {
  const healthyInfo = { disk: [{ name: 'v3Nano' }], serving: 'v3Nano' };
  const s = instanceState('chrome-beta-nano', { model: { name: 'v3Nano', contextWindow: 9216 } }, fake('v3Nano', { 'model info': { code: 1, json: healthyInfo } }).deps);
  assert.deepEqual(s.failed, ['model info exited 1']);
});

test('registryOf refuses an entry without model.name and model.contextWindow', () => {
  assert.throws(() => registryOf('{"instances":{"x":{"model":{"name":"m"}}}}'), /entry x has no model.name and model.contextWindow/);
  assert.throws(() => registryOf('{"instances":{"x":null}}'), /entry x/);
});
