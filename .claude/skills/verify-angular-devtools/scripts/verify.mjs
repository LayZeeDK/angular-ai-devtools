#!/usr/bin/env node
// One-shot proof that Angular DevTools is installed, enabled, attached and coexists. Run with --help.

import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const CONTROL = join(ROOT, '.claude', 'skills', 'control-angular-devtools', 'scripts', 'control.mjs');
const USAGE = 'verify.mjs [--browser test|chrome|chrome-beta|edge|edge-dev] [--app-url <url>] [--di-graph] [--keep]';
const VALUE_FLAGS = ['browser', 'app-url'];
const BOOL_FLAGS = ['di-graph', 'keep', 'help'];
const BROWSER_VALUES = ['test', 'chrome', 'chrome-beta', 'edge', 'edge-dev'];
const opts = {};

function usageError(msg) {
  console.log(`[ERROR] ${msg}\n${USAGE}`);
  process.exit(2);
}

for (let i = 2, argv = process.argv; i < argv.length; i++) {
  const m = argv[i].match(/^--([^=]+)(?:=(.*))?$/s);

  if (!m) {
    usageError(`unexpected argument "${argv[i]}"`);
  }

  const [, name, inline] = m;

  if (BOOL_FLAGS.includes(name)) {
    if (inline !== undefined) {
      usageError(`--${name} takes no value`);
    }

    opts[name] = true;
  } else if (VALUE_FLAGS.includes(name)) {
    const value = inline ?? (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[++i] : undefined);

    if (value === undefined || value === '') {
      usageError(`--${name} needs a value (--${name} <value> or --${name}=<value>)`);
    }

    opts[name] = value;
  } else {
    usageError(`unknown flag --${name}`);
  }
}

if (opts.help) {
  console.log(USAGE);
  process.exit(0);
}

if (opts.browser !== undefined && !BROWSER_VALUES.includes(opts.browser)) {
  usageError(`--browser ${opts.browser} is not one of ${BROWSER_VALUES.join(', ')}`);
}

const browser = opts.browser ?? 'test';
const runDir = join(ROOT, 'tmp', 'verify-angular-devtools', new Date().toISOString().replace(/[-:]/g, '').replace('Z', '').replace('T', '-'));
mkdirSync(runDir, { recursive: true });
const steps = [];

function control(...args) {
  const r = spawnSync(process.execPath, [CONTROL, ...args, '--json'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let out;

  try {
    out = JSON.parse(r.stdout.slice(r.stdout.indexOf('{')));
  } catch {
    out = { ok: false, raw: (r.stdout + r.stderr).slice(0, 800) };
  }

  steps.push({ step: args.join(' '), exit: r.status, ok: r.status === 0, result: out });
  console.log(`[${r.status === 0 ? 'OK' : 'ERROR'}] ${args.join(' ')} -> exit ${r.status}`);

  return { code: r.status, out };
}

const checks = {};
let verdict;

if (browser !== 'test') {
  const s = control('status', `--browser=${browser}`).out;
  checks.installed = s.installed;
  checks.version = s.settings?.version ?? null;
  checks.enabledFromProfile = s.enabled;
  checks.notCovered = ['attach, panel and coexist in a branded browser: not scripted; use the test harness or the manual steps in SKILL.md'];
  checks.disableReasons = s.settings?.disableReasons ?? null;
  verdict = !s.installed
    ? 'not verified (not installed)'
    : s.enabled
      ? 'verified (installed and enabled in the profile)'
      : `inconclusive (installed; profile reads disable_reasons ${JSON.stringify(checks.disableReasons)}, meaning inferred; confirm on ${s.extensionsPage})`;
} else {
  if (!opts['app-url']) {
    console.log('[ERROR] --app-url <dev-mode Angular app> is required for the test harness');
    process.exit(2);
  }

  let up = { code: 2 };

  try {
    if (control('install').code !== 0) {
      throw new Error('install failed');
    }

    up = control('up', `--app-url=${opts['app-url']}`);

    if (up.code !== 0) {
      throw new Error('up failed');
    }

    const doctor = control('doctor').out;
    const ext = doctor.checks?.find((c) => c.name === 'extension');
    checks.loadedEnabled = !!ext?.ok;
    checks.extension = ext?.detail ?? null;
    const attach = control('attach').out;
    checks.attached = !!attach.ok;
    checks.detection = attach.detection ?? null;
    checks.angularVersion = attach.ngVersion ?? null;
    const coexist = opts['di-graph'] ? control('coexist', '--di-graph').out : control('coexist').out;
    checks.coexist = { profiler: coexist.profiler?.ok ?? false, flag: coexist.flag?.ok ?? false, signalGraph: coexist.signalGraph?.ok ?? false };

    if (coexist.diGraph) {
      checks.diGraphTemplateLostInPane = coexist.diGraph.templateLostInPane;
      checks.diGraphTemplateLostInNg = coexist.diGraph.templateLostInNg;
    }

    const evidence = up.out.evidenceDir;

    if (evidence && existsSync(evidence)) {
      cpSync(evidence, join(runDir, 'control-evidence'), { recursive: true });
    }
  } catch (e) {
    checks.error = e.message;
  } finally {
    if (up.code !== 2 && !opts.keep) {
      control('down');
    }
  }

  const pass = checks.loadedEnabled && checks.attached && checks.coexist?.profiler && checks.coexist?.flag && checks.coexist?.signalGraph;
  verdict = pass ? 'verified' : checks.error ? 'inconclusive' : 'not verified';
}

writeFileSync(join(runDir, 'verdict.json'), JSON.stringify({ browser, verdict, checks, steps }, null, 2));
console.log(`[${verdict.startsWith('verified') ? 'OK' : 'ERROR'}] ${verdict}; ${JSON.stringify(checks)}`);
console.log(`[INFO] evidence ${runDir}`);
process.exit(verdict.startsWith('verified') ? 0 : verdict.startsWith('inconclusive') ? 2 : 1);
