#!/usr/bin/env node
// Verdicts for the built-in AI in Chrome Beta and Edge Dev, built on control-ai-browsers/scripts/control.mjs.
// Usage: node verify.mjs state|cycle --browser=chrome-beta|msedge-dev [--to=<profile>] [--run=<probe.js> --out=<json>] [--evidence=<dir>]
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..', '..', '..');
const CONTROL = resolve(HERE, '..', '..', 'control-ai-browsers', 'scripts', 'control.mjs');
const HOME = { 'chrome-beta': 'gemma4', 'msedge-dev': 'aion' };
const PROTECTED = ['gemma4-2b-it', 'Aion-1.1-Instruct'];
const EXPECT = {
  gemma4: { model: /^gemma4-/, contextWindow: 9216 },
  nano: { model: /^v3Nano$/ },
  aion: { model: /^Aion-1\.1-Instruct$/, contextWindow: 7168 },
  default: { model: /phi-?4-?mini/i },
};

const opts = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, ...v] = a.slice(2).split('=');

  return [k, v.length ? v.join('=') : true];
}));
const [mode = 'state'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const browser = opts.browser;
const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
const evidence = resolve(ROOT, typeof opts.evidence === 'string' ? opts.evidence : join('tmp', 'verify-ai-browsers', `${runId}-${browser}-${mode}`));
const steps = [];

function control(...args) {
  const t = Date.now();
  const r = spawnSync(process.execPath, [CONTROL, ...args, `--browser=${browser}`, `--evidence=${evidence}`, '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const line = r.stdout.trim().split('\n').pop();
  let json = null;

  try {
    json = JSON.parse(line);
  } catch {
    json = { ok: false, reason: (r.stdout + r.stderr).slice(-600) };
  }

  const step = { cmd: args.join(' '), exit: r.status, ms: Date.now() - t, ok: json.ok, evidence: json.evidence, reason: json.reason };
  steps.push(step);
  console.log(`[${r.status === 0 ? 'OK' : 'ERROR'}] ${step.cmd} -> exit ${r.status} (${step.ms} ms)${json.reason ? ` ${json.reason}` : ''}`);

  return { ...json, exit: r.status };
}

function modelMatches(info, profile) {
  const want = EXPECT[profile];
  const disk = info.disk?.find((d) => want.model.test(d.name));

  return { pass: !!info.serving?.name && want.model.test(info.serving.name) && !!disk, serving: info.serving?.name ?? null, disk: disk ? `${disk.name} ${disk.mib} MiB` : null };
}

// Doctor twice: a pass counts only when it repeats.
function state(profile) {
  const d1 = control('doctor', `--expect=${profile}`);
  const d2 = control('doctor', `--expect=${profile}`);
  const flags = control('flags', 'get');
  const info = control('model', 'info');
  const m = modelMatches(info, profile);
  const failed = [...(d1.checks ?? []), ...(d2.checks ?? [])].filter((c) => c.pass === false).map((c) => c.id);

  return { profile, doctor: [d1.exit, d2.exit], failedChecks: [...new Set(failed)], localState: flags.localState, model: m, pass: d1.exit === 0 && d2.exit === 0 && m.pass };
}

function downloadIfNeeded() {
  const dl = control('model', 'download');

  return { alreadyAvailable: !!dl.alreadyAvailable, ok: dl.ok, reason: dl.reason, durationMs: dl.durationMs, added: dl.added?.map((a) => `${a.name} ${a.mib} MiB (${a.bytes} bytes)`), exit: dl.exit };
}

function switchAndCheck(profile) {
  const sw = control('model', 'switch', profile);
  const dl = sw.ok || sw.exit === 1 ? downloadIfNeeded() : null;

  // A refused or failed download ends this leg; nothing else is deleted to make room.
  if (dl && !dl.ok) {
    return { profile, switchExit: sw.exit, download: dl, model: { pass: false, serving: null }, pass: false };
  }

  const init = control('model', 'init');
  const info = control('model', 'info');
  const m = modelMatches(info, profile);
  const cw = EXPECT[profile].contextWindow;

  return { profile, switchExit: sw.exit, profileAfter: sw.profile, download: dl, init: { exit: init.exit, firstCreateMs: init.firstCreateMs, secondCreateMs: init.secondCreateMs, contextWindow: init.contextWindow, answer: init.answer }, model: m, pass: sw.exit === 0 && init.exit === 0 && m.pass && (!cw || init.contextWindow === cw) };
}

function verdict(result) {
  if (steps.some((s) => s.exit === 2)) {
    return 'inconclusive';
  }

  return result.pass ? 'verified' : 'not verified';
}

let result;

if (!HOME[browser]) {
  console.log('[ERROR] --browser must be chrome-beta or msedge-dev');
  process.exit(2);
}

const home = HOME[browser];

if (control('attach').exit !== 0) {
  mkdirSync(evidence, { recursive: true });
  const file = join(evidence, 'verdict.json');
  writeFileSync(file, JSON.stringify({ browser, mode, verdict: 'inconclusive', reason: steps[0].reason, steps }, null, 2));
  console.log(`[ERROR] ${browser} ${mode}: inconclusive (attach refused; Lars must allow remote debugging); evidence ${file}`);
  process.exit(2);
}

if (mode === 'state') {
  result = state(typeof opts.expect === 'string' ? opts.expect : home);
} else if (mode === 'cycle') {
  const to = opts.to;

  if (!EXPECT[to] || to === home) {
    console.log(`[ERROR] cycle needs --to=<profile other than ${home}>`);
    process.exit(2);
  }

  const freeStart = control('doctor').checks?.find((c) => c.id === 'disk.free')?.detail;
  const before = state(home);
  const away = switchAndCheck(to);
  // The comparison model's name, read from disk while it is loaded; it is cleared after the switch back.
  const comparison = away.model.serving && !PROTECTED.includes(away.model.serving) ? away.model.serving : null;
  let probe = null;

  if (away.pass && typeof opts.run === 'string') {
    const r = control('run', opts.run, `--timeout-min=${opts['timeout-min'] ?? 40}`);
    probe = { exit: r.exit, saved: null };

    if (r.exit === 0 && typeof opts.out === 'string') {
      const out = resolve(ROOT, opts.out);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, JSON.stringify(r.result, null, 2));
      probe.saved = out;
    }
  }

  const back = switchAndCheck(home);
  let clear = { skipped: 'no comparison model on disk' };

  if (comparison) {
    const c = control('model', 'clear', `--confirm=${comparison}`);
    clear = { exit: c.exit, model: comparison, method: c.method, bytesFreed: c.bytesFreed, freeBeforeMib: c.freeBefore?.mib, freeAfterMib: c.freeAfter?.mib, left: c.diskAfter?.map((d) => d.name) };
  }

  const after = state(home);
  const info = control('model', 'info');
  const onlyStanding = info.disk?.length === 1 && EXPECT[home].model.test(info.disk[0].name);
  result = {
    freeStartMib: freeStart?.mib, before, away, probe, back, clear, after, onlyStandingModelOnDisk: onlyStanding,
    pass: before.pass && away.pass && back.pass && after.pass && onlyStanding && (probe === null || probe.exit === 0) && JSON.stringify(before.localState) === JSON.stringify(after.localState),
  };
} else {
  console.log('[ERROR] mode must be state or cycle');
  process.exit(2);
}

control('cleanup');
const v = verdict(result);
mkdirSync(evidence, { recursive: true });
const file = join(evidence, 'verdict.json');
writeFileSync(file, JSON.stringify({ browser, mode, verdict: v, result, steps }, null, 2));
console.log(`[${v === 'verified' ? 'OK' : 'ERROR'}] ${browser} ${mode}: ${v}; evidence ${file}`);
process.exit(v === 'verified' ? 0 : v === 'not verified' ? 1 : 2);
