#!/usr/bin/env node
// Verdicts for the per-model browser instances, built on control-ai-browsers/scripts/control.mjs.
// Usage: node verify.mjs state [<instance>...] | cycle <instance> [--evidence=<dir>] [--timeout-min=45]
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL_DIR = resolve(HERE, '..', '..', 'control-ai-browsers');
const CONTROL = join(CONTROL_DIR, 'scripts', 'control.mjs');
const REGISTRY = JSON.parse(readFileSync(join(CONTROL_DIR, 'instances.json'), 'utf8'));

const args = process.argv.slice(2);
const opts = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => {
  const [k, ...v] = a.slice(2).split('=');

  return [k, v.length ? v.join('=') : true];
}));
const [mode = 'state', ...named] = args.filter((a) => !a.startsWith('--'));
const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
const evidence = resolve(ROOT, typeof opts.evidence === 'string' ? opts.evidence : join('tmp', 'verify-ai-browsers', `${runId}-${mode}`));
const steps = [];

function control(...a) {
  const t = Date.now();
  const r = spawnSync(process.execPath, [CONTROL, ...a, `--evidence=${evidence}`, '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let json;

  try {
    json = JSON.parse(r.stdout.trim().split('\n').pop());
  } catch {
    json = { ok: false, reason: (r.stdout + r.stderr).slice(-600) };
  }

  const step = { cmd: a.join(' '), exit: r.status, ms: Date.now() - t, ok: json.ok, evidence: json.evidence, reason: json.reason };
  steps.push(step);
  console.log(`[${r.status === 0 ? 'OK' : 'ERROR'}] ${step.cmd} -> exit ${r.status} (${step.ms} ms)${json.reason ? ` ${json.reason}` : ''}`);

  return { ...json, exit: r.status };
}

// Doctor twice (a pass counts only when it repeats), effective features, and the model read three ways.
function state(name) {
  const want = REGISTRY.instances[name];
  const d1 = control('doctor', name);
  const d2 = control('doctor', name);
  const flags = control('flags', name);
  const info = control('model', 'info', name);
  const failed = [...new Set([...(d1.checks ?? []), ...(d2.checks ?? [])].filter((c) => c.pass === false).map((c) => c.id))];
  const model = { expected: want.model.name, disk: info.disk?.some((x) => x.name === want.model.name) ?? false, serving: info.serving ?? null, backend: info.backend?.backendType ?? null, requestedBackend: info.requestedBackend ?? null, performanceClass: info.performanceClass ?? null };
  const pass = d1.exit === 0 && d2.exit === 0 && flags.exit === 0 && model.disk && model.serving === want.model.name;

  return { instance: name, pass, doctor: [d1.exit, d2.exit], failedChecks: failed, flagsExit: flags.exit, model };
}

// Clear the instance's own model and get it back: stop, clear, launch, download, init, state.
function cycle(name) {
  const want = REGISTRY.instances[name];
  const before = control('model', 'info', name);
  const backend = before.requestedBackend ?? want.backend.default;
  control('attach', name);
  const stop = control('stop', name);
  const clear = stop.exit === 0 ? control('model', 'clear', name, `--confirm=${want.model.name}`) : null;
  const launch = control('launch', name, `--backend=${backend}`);
  const download = launch.exit === 0 ? control('model', 'download', name, `--timeout-min=${opts['timeout-min'] ?? 45}`) : null;
  const init = download?.exit === 0 ? control('model', 'init', name) : null;
  const after = state(name);
  control('detach', name);
  const pass = stop.exit === 0 && clear?.exit === 0 && launch.exit === 0 && download?.exit === 0 && init?.exit === 0 && init.contextWindow === want.model.contextWindow && after.pass;

  return {
    instance: name, pass, backend,
    clear: clear && { exit: clear.exit, bytesRemoved: clear.bytesRemoved, removed: clear.removed?.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`) },
    download: download && { exit: download.exit, gesture: download.gesture, durationMs: download.durationMs, alreadyAvailable: !!download.alreadyAvailable, added: download.added?.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`) },
    init: init && { exit: init.exit, firstCreateMs: init.firstCreateMs, secondCreateMs: init.secondCreateMs, contextWindow: init.contextWindow, answer: init.answer },
    after,
  };
}

function finish(result) {
  const verdict = steps.some((s) => s.exit === 2) ? 'inconclusive' : result.pass ? 'verified' : 'not verified';
  mkdirSync(evidence, { recursive: true });
  const file = join(evidence, 'verdict.json');
  writeFileSync(file, JSON.stringify({ mode, verdict, result, steps }, null, 2));
  console.log(`[${verdict === 'verified' ? 'OK' : 'ERROR'}] ${mode}: ${verdict}; evidence ${file}`);
  process.exit(verdict === 'verified' ? 0 : verdict === 'not verified' ? 1 : 2);
}

const unknown = named.filter((n) => !REGISTRY.instances[n]);

if (unknown.length || !['state', 'cycle'].includes(mode) || (mode === 'cycle' && named.length !== 1)) {
  console.log(`[ERROR] usage: verify.mjs state [<instance>...] | cycle <instance>; instances: ${Object.keys(REGISTRY.instances).join(', ')}`);
  process.exit(2);
}

if (mode === 'state') {
  const results = (named.length ? named : Object.keys(REGISTRY.instances)).map(state);
  finish({ pass: results.every((r) => r.pass), instances: results });
} else {
  finish(cycle(named[0]));
}
