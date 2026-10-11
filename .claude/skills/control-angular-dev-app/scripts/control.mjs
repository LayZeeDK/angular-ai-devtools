#!/usr/bin/env node
// Control script for control-angular-dev-app: up, doctor, info, down.
// Deterministic steps only; driving stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-angular-dev-app');
const STATE_DIR = path.join(SCRATCH, 'state');
const INSPECT_JS = path.join(SKILL_DIR, 'scripts', 'ng-inspect.js');
const PORTAL_DEFAULT_DIR = 'D:\\projects\\github\\LayZeeDK\\HaasStefan__ng-journal-insurance-portal-ai-devtools';
const PORTAL_API_PORT = 3000; // ponytail: fixed by the portal's BaseUrl token (http://localhost:3000/api/); not isolatable

const TARGETS = {
  counter: {
    dir: path.join(REPO_ROOT, 'spikes', 'ng222-app'),
    documentedPort: 4222,
    marker: 'app-root',
    procs: (dir, port) => [
      { name: 'app', bin: binOf(dir, '@angular/cli', 'ng'), args: ['serve', '--port', String(port)], env: {}, port, readyPath: '/' },
    ],
  },
  portal: {
    dir: process.env.CONTROL_NG_PORTAL_DIR || PORTAL_DEFAULT_DIR,
    documentedPort: 4200,
    marker: 'ng-journal-root',
    procs: (dir, port) => [
      { name: 'api', bin: binOf(dir, 'nx', 'nx'), args: ['run', 'api:serve'], env: { PORT: String(PORTAL_API_PORT) }, port: PORTAL_API_PORT, readyPath: '/api/customers' },
      { name: 'app', bin: binOf(dir, 'nx', 'nx'), args: ['run', 'insurance-portal:serve', `--port=${port}`], env: {}, port, readyPath: '/' },
    ],
  },
};

// ---------- small helpers ----------
const argv = process.argv.slice(2);
const cmd = argv[0];
const flag = (name) => {
  const i = argv.indexOf(`--${name}`);

  if (i === -1) {
    return undefined;
  }

  const v = argv[i + 1];

  return v === undefined || v.startsWith('--') ? true : v;
};
const JSON_OUT = argv.includes('--json');

function out(result, code) {
  if (JSON_OUT) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    for (const c of result.checks ?? []) {
      const tag = c.status === 'pass' ? '[OK]' : c.status === 'skip' ? '[SKIP]' : c.status === 'warn' ? '[WARN]' : '[ERROR]';
      process.stdout.write(`${tag} ${c.name}: ${c.detail}\n`);
    }

    const { checks, ...rest } = result;
    process.stdout.write(`${code === 0 ? '[OK]' : '[ERROR]'} ${JSON.stringify(rest)}\n`);
  }

  process.exit(code);
}

function fail(code, reason, extra = {}) {
  out({ ok: false, command: cmd, reason, ...extra }, code);
}

function binOf(dir, pkg, binName) {
  const pj = path.join(dir, 'node_modules', pkg, 'package.json');

  if (!existsSync(pj)) {
    return null;
  }

  const bin = JSON.parse(readFileSync(pj, 'utf8')).bin;

  return path.join(dir, 'node_modules', pkg, typeof bin === 'string' ? bin : bin[binName]);
}

function isWorktree(dir) {
  let d = path.resolve(dir);

  for (;;) {
    const g = path.join(d, '.git');

    if (existsSync(g)) {
      return statSync(g).isFile();
    }

    const up = path.dirname(d);

    if (up === d) {
      return false; // no git at all: treat as a main checkout
    }

    d = up;
  }
}

function derivePort(dir, documented) {
  if (!isWorktree(dir)) {
    return documented;
  }

  const h = createHash('sha1').update(path.resolve(dir).toLowerCase()).digest().readUInt32BE(0);
  const p = 4300 + (h % 500);

  return p === documented ? p + 1 : p;
}

function processTable() {
  const ps = "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,@{n='Start';e={$_.CreationDate.ToUniversalTime().ToString('o')}},CommandLine | ConvertTo-Json -Compress";
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });

  if (r.status !== 0) {
    throw new Error(`process table query failed: ${r.stderr}`);
  }

  return JSON.parse(r.stdout);
}

function descendants(table, pid) {
  const set = new Set([pid]);
  let grew = true;

  while (grew) {
    grew = false;

    for (const p of table) {
      if (set.has(p.ParentProcessId) && !set.has(p.ProcessId)) {
        set.add(p.ProcessId);
        grew = true;
      }
    }
  }

  return set;
}

function listeningPid(port) {
  const r = spawnSync('netstat', ['-ano', '-p', 'TCP'], { encoding: 'utf8', windowsHide: true });
  const r6 = spawnSync('netstat', ['-ano', '-p', 'TCPv6'], { encoding: 'utf8', windowsHide: true });
  const lines = `${r.stdout}\n${r6.stdout}`.split(/\r?\n/);

  for (const l of lines) {
    const m = l.trim().split(/\s+/);

    if (m[0] === 'TCP' && m[3] === 'LISTENING' && m[1].endsWith(`:${port}`)) {
      return Number(m[4]);
    }
  }

  return null;
}

function playwrightCli(args) {
  const shimDir = (process.env.PATH ?? '').split(path.delimiter).find((d) => d && existsSync(path.join(d, 'playwright-cli.cmd')));
  const js = shimDir && path.join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  if (!js || !existsSync(js)) {
    return { status: 127, stdout: '', stderr: 'playwright-cli not found on PATH' };
  }

  return spawnSync(process.execPath, [js, ...args], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchText(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });

    return { status: res.status, body: await res.text() };
  } catch (e) {
    return { status: 0, body: String(e.cause?.code ?? e.message) };
  }
}

// ---------- state ----------
function statePath(flowId) {
  return path.join(STATE_DIR, `${flowId}.json`);
}

function resolveFlow() {
  const url = flag('url');
  const target = flag('target');

  if (url && url !== true) {
    return `url-${new URL(url).port || 80}`;
  }

  if (target && target !== true) {
    if (!TARGETS[target]) {
      fail(2, `unknown target "${target}"; use counter or portal`);
    }

    const t = TARGETS[target];
    const dir = typeof flag('dir') === 'string' ? flag('dir') : t.dir;
    const port = flag('port') && flag('port') !== true ? Number(flag('port')) : derivePort(dir, t.documentedPort);

    return `${target}-${port}`;
  }

  const files = existsSync(STATE_DIR) ? readdirSync(STATE_DIR).filter((f) => f.endsWith('.json')) : [];

  if (files.length === 1) {
    return files[0].slice(0, -5);
  }

  fail(2, files.length === 0 ? 'no state file: nothing was started by this skill (run up first)' : `several flows are running (${files.join(', ')}); pass --target or --url`);
}

function readState(flowId) {
  const p = statePath(flowId);

  if (!existsSync(p)) {
    fail(2, `no state file for flow ${flowId} at ${p}: nothing to act on (run up first)`);
  }

  return JSON.parse(readFileSync(p, 'utf8'));
}

// ---------- commands ----------
async function up() {
  const url = flag('url');
  mkdirSync(STATE_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');

  if (url && url !== true) {
    const flowId = resolveFlow();

    if (existsSync(statePath(flowId))) {
      fail(2, `flow ${flowId} already has a state file; run down first`, { state: statePath(flowId) });
    }

    const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
    mkdirSync(evidenceDir, { recursive: true });
    const res = await fetchText(url);

    if (res.status === 0) {
      fail(2, `nothing answers at ${url} (${res.body})`);
    }

    const state = { flowId, mode: 'attach', url, session: `control-ngdev-${flowId}`, evidenceDir, startedAt: new Date().toISOString(), procs: [] };
    writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
    out({ ok: true, command: 'up', ...state }, 0);
  }

  const targetName = flag('target');

  if (!TARGETS[targetName]) {
    fail(2, 'up needs --target counter|portal, or --url <dev-server URL> to attach to a running app');
  }

  const t = TARGETS[targetName];
  const dir = typeof flag('dir') === 'string' ? flag('dir') : t.dir;
  const worktree = isWorktree(dir);
  const port = flag('port') && flag('port') !== true ? Number(flag('port')) : derivePort(dir, t.documentedPort);

  if (worktree && port === t.documentedPort) {
    fail(2, `refused: ${dir} is a git worktree and port ${port} is the main checkout's documented port; use the derived port or --url on purpose`);
  }

  const flowId = `${targetName}-${port}`;

  if (existsSync(statePath(flowId))) {
    fail(2, `flow ${flowId} already has a state file; run down first`, { state: statePath(flowId) });
  }

  const procs = t.procs(dir, port);

  for (const p of procs) {
    if (!p.bin || !existsSync(p.bin)) {
      fail(2, `cannot find the CLI for ${p.name} under ${dir}/node_modules (install dependencies first)`);
    }

    const owner = listeningPid(p.port);

    if (owner) {
      fail(2, `refused: port ${p.port} (${p.name}) is already in use by PID ${owner}; it may be Lars's own server`, { port: p.port, ownerPid: owner });
    }
  }

  const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
  mkdirSync(evidenceDir, { recursive: true });
  const t0 = Date.now();
  const started = [];

  for (const p of procs) {
    const env = { ...process.env, NX_DAEMON: 'false', NX_TUI: 'false', NG_CLI_ANALYTICS: 'false', ...p.env };

    if (!('PORT' in p.env)) {
      delete env.PORT; // measured: the Angular dev server serves on $PORT and ignores --port when PORT is set
    }

    const log = path.join(evidenceDir, `${p.name}.log`);
    const fd = openSync(log, 'a');
    const child = spawn(process.execPath, [p.bin, ...p.args], { cwd: dir, env, detached: true, stdio: ['ignore', fd, fd], windowsHide: true });
    child.unref();
    started.push({ name: p.name, pid: child.pid, port: p.port, readyUrl: `http://localhost:${p.port}${p.readyPath}`, log });
  }

  const table = processTable();

  for (const s of started) {
    const row = table.find((r) => r.ProcessId === s.pid);
    s.start = row?.Start ?? null;
    s.commandLine = row?.CommandLine ?? null;
  }

  const state = { flowId, mode: 'launch', target: targetName, dir, worktree, url: `http://localhost:${port}/`, port, session: `control-ngdev-${flowId}`, evidenceDir, startedAt: new Date().toISOString(), procs: started };
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  const timeoutMs = Number(flag('timeout') ?? 240) * 1000;

  for (const s of started) {
    for (;;) {
      const r = await fetchText(s.readyUrl);
      const pageOk = s.name !== 'app' || (r.status === 200 && r.body.includes(`<${t.marker}`));

      if (r.status >= 200 && r.status < 500 && pageOk) {
        break;
      }

      if (!processTable().some((row) => row.ProcessId === s.pid)) {
        fail(2, `${s.name} (PID ${s.pid}) exited before it was ready; see ${s.log}; run down to clear the state`, { state: statePath(flowId) });
      }

      if (Date.now() - t0 > timeoutMs) {
        fail(2, `${s.name} not ready after ${timeoutMs / 1000}s at ${s.readyUrl}; see ${s.log}; run down`, { state: statePath(flowId) });
      }

      await sleep(500);
    }
  }

  out({ ok: true, command: 'up', readyInSeconds: Math.round((Date.now() - t0) / 100) / 10, ...state }, 0);
}

async function doctor() {
  const flowId = resolveFlow();
  const state = readState(flowId);
  const checks = [];
  const add = (name, status, detail) => checks.push({ name, status, detail });

  if (state.mode === 'attach') {
    add('process-alive', 'skip', 'attached with --url; this skill did not start the server');
    add('port-owned', 'skip', 'attached with --url');
    add('build-log', 'skip', 'attached with --url; no build log');
  } else {
    if (state.worktree && state.port === TARGETS[state.target].documentedPort) {
      fail(2, 'refused: worktree flow points at the main checkout port');
    }

    const table = processTable();

    for (const p of state.procs) {
      const row = table.find((r) => r.ProcessId === p.pid);
      const alive = row && row.Start === p.start;
      add(`process-alive:${p.name}`, alive ? 'pass' : 'fail', alive ? `PID ${p.pid} running since ${p.start}` : `PID ${p.pid} is gone or reused`);
      const owner = listeningPid(p.port);
      const owned = owner && descendants(table, p.pid).has(owner);
      add(`port-owned:${p.name}`, owned ? 'pass' : 'fail', owner ? `port ${p.port} listened on by PID ${owner}${owned ? ` (in the tree of ${p.pid})` : ' (NOT ours)'}` : `nothing listens on ${p.port}`);
      const log = existsSync(p.log) ? readFileSync(p.log, 'utf8') : '';
      const errLines = log.split(/\r?\n/).filter((l) => /\[ERROR\]|ERROR in|Error:|error TS\d+|NG\d{4}/.test(l));
      add(`build-log:${p.name}`, errLines.length === 0 ? 'pass' : 'fail', errLines.length === 0 ? 'no error lines in the server log' : errLines.slice(0, 3).join(' | '));
    }
  }

  // Page checks through the run's own playwright-cli session.
  const s = state.session;
  let r = playwrightCli([`-s=${s}`, 'goto', state.url]);

  if (r.status !== 0 || /not open|is not running|No browser/i.test(r.stdout + r.stderr)) {
    r = playwrightCli([`-s=${s}`, 'open', state.url]);
  }

  if (r.status !== 0) {
    add('browser-session', 'fail', `could not open playwright-cli session ${s}: ${(r.stderr || r.stdout).slice(0, 300)}`);

    return out({ ok: false, command: 'doctor', flowId, checks }, 2);
  }

  add('browser-session', 'pass', `session ${s} on ${state.url}`);
  r = playwrightCli([`-s=${s}`, '--raw', 'run-code', `--filename=${INSPECT_JS}`]);
  let page;

  try {
    page = JSON.parse(r.stdout.trim());
  } catch {
    add('page-probe', 'fail', `inspect helper did not return JSON: ${(r.stdout + r.stderr).slice(0, 300)}`);

    return out({ ok: false, command: 'doctor', flowId, checks }, 1);
  }

  add('angular-root', page.ngVersion ? 'pass' : 'fail', page.ngVersion ? `[ng-version="${page.ngVersion}"] on <${page.roots.join('>, <')}>` : 'no [ng-version] element: not an Angular app or not bootstrapped');

  if (state.target && page.roots.length && !page.roots.includes(TARGETS[state.target].marker)) {
    add('app-marker', 'fail', `expected root <${TARGETS[state.target].marker}>, found <${page.roots.join('>, <')}>`);
  } else if (state.target) {
    add('app-marker', 'pass', `root <${TARGETS[state.target].marker}> present`);
  }

  add('dev-build', page.devMode ? 'pass' : 'fail', page.devMode ? `window.ng has ${page.ngFunctions.length} functions` : 'window.ng missing: production build (or ngDevMode=false); ng.* recipes will not work');

  if (page.devMode) {
    add('ng-core-functions', page.missingCore.length === 0 ? 'pass' : 'warn', page.missingCore.length === 0 ? 'all public and injector/signal functions present' : `missing: ${page.missingCore.join(', ')}`);
    add('router-globals', page.router ? 'pass' : 'warn', page.router ? 'ɵgetRouterInstance, ɵgetLoadedRoutes, ɵnavigateByUrl present (provideRouter)' : 'router globals absent (no provideRouter, or RouterModule.forRoot): router recipes unavailable');
  }

  add('change-detection-mode', 'pass', `${page.zoneLoaded ? 'zone.js loaded (zone-based CD)' : 'zone.js not loaded (zoneless)'}; mark_feature_usage: ${page.featureMarks.join(', ') || 'none'}`);
  r = playwrightCli([`-s=${s}`, 'console', 'error']);
  const errorCount = Number(/Errors: (\d+)/.exec(r.stdout)?.[1] ?? NaN);
  add('console-errors', errorCount === 0 ? 'pass' : 'fail', errorCount === 0 ? 'no console errors since load' : Number.isNaN(errorCount) ? `could not read the console: ${r.stdout.slice(0, 200)}` : `${errorCount} console error(s); run playwright-cli -s=${s} console error`);

  const failed = checks.filter((c) => c.status === 'fail');
  out({ ok: failed.length === 0, command: 'doctor', flowId, url: state.url, session: s, ngVersion: page.ngVersion, checks }, failed.length === 0 ? 0 : 1);
}

function info() {
  const flowId = resolveFlow();
  const state = readState(flowId);
  out({ ok: true, command: 'info', statePath: statePath(flowId), ...state }, 0);
}

function down() {
  const flowId = resolveFlow();
  const sp = statePath(flowId);
  const state = readState(flowId);
  const table = processTable();
  const toStop = [];
  const notes = [];

  for (const p of state.procs) {
    const row = table.find((r) => r.ProcessId === p.pid);

    if (!row) {
      notes.push(`${p.name} PID ${p.pid} is not running`);
      continue;
    }

    if (row.Start !== p.start || row.CommandLine !== p.commandLine) {
      fail(2, `refused: PID ${p.pid} (${p.name}) does not match the state file: start-time ${row.Start} vs recorded ${p.start}; command ${row.Start !== p.start ? 'not compared' : `"${row.CommandLine}" vs recorded "${p.commandLine}"`}. Not stopping a process this skill did not start.`, { state: sp });
    }

    toStop.push(p);
  }

  const close = playwrightCli([`-s=${state.session}`, 'close']);
  notes.push(`session ${state.session}: ${close.status === 0 ? 'closed' : 'was not open'}`);

  for (const p of toStop) {
    const r = spawnSync('taskkill', ['/PID', String(p.pid), '/T', '/F'], { encoding: 'utf8', windowsHide: true });
    notes.push(`stopped ${p.name} tree of PID ${p.pid}: ${r.status === 0 ? 'ok' : r.stderr.trim()}`);
  }

  rmSync(sp, { force: true });
  out({ ok: true, command: 'down', flowId, evidenceDir: state.evidenceDir, notes }, 0);
}

const commands = { up, doctor, info, down };

if (!commands[cmd]) {
  process.stdout.write('usage: control.mjs <up|doctor|info|down> [--target counter|portal] [--url <url>] [--port N] [--dir <path>] [--timeout S] [--json]\n');
  process.exit(2);
}

await commands[cmd]();
