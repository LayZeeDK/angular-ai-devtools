#!/usr/bin/env node
// Control script for control-vitest-browser-angular: up, doctor, info, down.
// Runs the counter fixture's Vitest Browser Mode tests in watch mode, either attached to a per-model instance
// from control-ai-browsers (default) or in Playwright's bundled Chromium (--bundled). Deterministic steps only;
// driving stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-vitest-browser-angular');
const STATE_DIR = path.join(SCRATCH, 'state');
const FIXTURE = path.join(REPO_ROOT, 'spikes', 'ng222-app');
const NG = path.join(FIXTURE, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const AI_CONTROL = path.join(REPO_ROOT, '.claude', 'skills', 'control-ai-browsers', 'scripts', 'control.mjs');
const AI_REGISTRY = path.join(REPO_ROOT, '.claude', 'skills', 'control-ai-browsers', 'instances.json');
const { Cdp, evalIn, frameContexts, writeS1VitestVariant } = await import(pathToFileURL(path.join(REPO_ROOT, 'spikes', 'probes', 'vitest-lib.mjs')).href);

// Vitest's default 63315 is inside a Windows excluded port range on this machine; see vitest-base.config.mts.
const MAIN_VITEST_PORT = 51315;
const MAIN_BUNDLED_CDP_PORT = 9350;
const DEFAULT_INSTANCE = 'chrome-beta-gemma4';

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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

function isWorktree(dir) {
  let d = path.resolve(dir);

  for (;;) {
    const g = path.join(d, '.git');

    if (existsSync(g)) {
      return statSync(g).isFile();
    }

    const up = path.dirname(d);

    if (up === d) {
      return false;
    }

    d = up;
  }
}

function derivePort(main, base, span) {
  if (!isWorktree(FIXTURE)) {
    return main;
  }

  const h = createHash('sha1').update(path.resolve(FIXTURE).toLowerCase()).digest().readUInt32BE(0);
  const p = base + (h % span);

  return p === main ? p + 1 : p;
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

  for (const l of `${r.stdout}\n${r6.stdout}`.split(/\r?\n/)) {
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

function aiControl(args) {
  return spawnSync(process.execPath, [AI_CONTROL, ...args], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });
}

async function cdpVersion(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(3000) });

    return await res.json();
  } catch {
    return null;
  }
}

async function cdpList(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000) });

    return await res.json();
  } catch {
    return [];
  }
}

const orchestratorPrefix = (vitestPort) => `http://127.0.0.1:${vitestPort}/__vitest_test__/`;

// ---------- state ----------
const statePath = (flowId) => path.join(STATE_DIR, `${flowId}.json`);

function stateFiles() {
  return existsSync(STATE_DIR) ? readdirSync(STATE_DIR).filter((f) => f.endsWith('.json')) : [];
}

function readState() {
  const files = stateFiles();

  if (files.length === 0) {
    fail(2, `no state file in ${STATE_DIR}: nothing was started by this skill (run up first)`);
  }

  const p = path.join(STATE_DIR, files[0]);

  return { sp: p, state: JSON.parse(readFileSync(p, 'utf8')) };
}

// ---------- commands ----------
async function up() {
  mkdirSync(STATE_DIR, { recursive: true });

  // One run at a time: one ng test process, and one browser per run (Lars's memory budget).
  if (stateFiles().length > 0) {
    fail(2, `refused: a run is already recorded (${stateFiles().join(', ')}); run down first`);
  }

  if (!existsSync(NG)) {
    fail(2, `cannot find the Angular CLI at ${NG}; run npm ci in spikes/ng222-app first`);
  }

  const bundled = Boolean(flag('bundled'));
  const instance = bundled ? null : typeof flag('instance') === 'string' ? flag('instance') : DEFAULT_INSTANCE;
  const vitestPort = flag('port') && flag('port') !== true ? Number(flag('port')) : derivePort(MAIN_VITEST_PORT, 51400, 500);
  const worktree = isWorktree(FIXTURE);

  if (worktree && vitestPort === MAIN_VITEST_PORT) {
    fail(2, `refused: ${FIXTURE} is in a git worktree and port ${vitestPort} is the main checkout's Vitest port`);
  }

  const owner = listeningPid(vitestPort);

  if (owner) {
    fail(2, `refused: port ${vitestPort} is already in use by PID ${owner}; it may be another Vitest run`, { port: vitestPort, ownerPid: owner });
  }

  let cdpPort;
  let launchedInstance = false;

  if (bundled) {
    cdpPort = derivePort(MAIN_BUNDLED_CDP_PORT, 9400, 100);
    const cdpOwner = listeningPid(cdpPort);

    if (cdpOwner) {
      fail(2, `refused: CDP port ${cdpPort} is already in use by PID ${cdpOwner}`);
    }
  } else {
    const registry = JSON.parse(readFileSync(AI_REGISTRY, 'utf8'));
    const entry = registry.instances[instance];

    if (!entry) {
      fail(2, `unknown instance "${instance}"; pick one from ${AI_REGISTRY}: ${Object.keys(registry.instances).join(', ')}`);
    }

    cdpPort = entry.port;

    if (!(await cdpVersion(cdpPort))) {
      const r = aiControl(['launch', instance]);

      if (r.status !== 0) {
        fail(2, `control-ai-browsers launch ${instance} exited ${r.status}: ${(r.stdout + r.stderr).trim().slice(-400)}`);
      }

      launchedInstance = true;
    }
  }

  const flowId = `${bundled ? 'bundled' : instance}-${vitestPort}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
  mkdirSync(evidenceDir, { recursive: true });
  const state = {
    flowId,
    mode: bundled ? 'bundled' : 'attach',
    instance,
    launchedInstance,
    cdpPort,
    cdpUrl: `http://127.0.0.1:${cdpPort}`,
    vitestPort,
    orchestratorPrefix: orchestratorPrefix(vitestPort),
    worktree,
    session: `control-vitest-${flowId}`,
    evidenceDir,
    startedAt: new Date().toISOString(),
    extension: null,
    userDataDir: bundled ? path.join(SCRATCH, `profile-${flowId}`) : null,
    hold: flag('hold') && flag('hold') !== true ? Number(flag('hold')) : null,
    filter: typeof flag('filter') === 'string' ? flag('filter') : null,
    timingDemo: Boolean(flag('timing-demo')),
    proc: null,
  };
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  const extFlag = flag('extension');

  if (extFlag && extFlag !== true) {
    const dir = extFlag === 's1-vitest' ? writeS1VitestVariant(path.join(evidenceDir, 'extension')) : path.resolve(extFlag);

    if (!existsSync(path.join(dir, 'manifest.json'))) {
      fail(2, `no manifest.json in ${dir}; run down to clear the state`, { state: statePath(flowId) });
    }

    state.extension = { dir, id: null };

    if (!bundled) {
      const v = await cdpVersion(cdpPort);
      const cdp = await Cdp.connect(v.webSocketDebuggerUrl);

      try {
        state.extension.id = (await cdp.send('Extensions.loadUnpacked', { path: dir })).id;
      } finally {
        cdp.ws.close();
      }
    }
  } else if (bundled) {
    fail(2, '--bundled needs --extension <dir> or --extension s1-vitest (vitest-extension.config.mts requires one); run down to clear the state', { state: statePath(flowId) });
  }

  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  const env = { ...process.env, VITEST_BROWSER_PORT: String(vitestPort), NG_CLI_ANALYTICS: 'false' };
  delete env.CI;

  if (state.hold) {
    env.VITE_COUNTER_HOLD_MS = String(state.hold);
  }

  if (state.timingDemo) {
    env.VITE_COUNTER_TIMING_DEMO = '1';
  }

  if (bundled) {
    env.VITEST_EXTENSION_DIR = state.extension.dir;
    env.VITEST_CDP_PORT = String(cdpPort);
    env.VITEST_USER_DATA_DIR = state.userDataDir;
  } else {
    env.VITEST_CDP_URL = state.cdpUrl;
  }

  // --watch explicitly: a spawned process has no TTY, and Angular then defaults to a single run, after which
  // the tab closes.
  const args = [NG, 'test', '-c', bundled ? 'extension' : 'attach', '--watch'];

  if (state.filter) {
    args.push('--filter', state.filter);
  }

  const log = path.join(evidenceDir, 'ng-test.log');
  const fd = openSync(log, 'a');
  const t0 = Date.now();
  const child = spawn(process.execPath, args, { cwd: FIXTURE, env, detached: true, stdio: ['ignore', fd, fd], windowsHide: true });
  child.unref();
  const row = processTable().find((r) => r.ProcessId === child.pid);
  state.proc = { pid: child.pid, start: row?.Start ?? null, commandLine: row?.CommandLine ?? null, log };
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
  const timeoutMs = Number(flag('timeout') ?? 180) * 1000;

  for (;;) {
    const tab = (await cdpList(cdpPort)).find((t) => t.type === 'page' && t.url.startsWith(state.orchestratorPrefix));
    const text = existsSync(log) ? readFileSync(log, 'utf8').replace(/\x1b\[[0-9;]*m/g, '') : '';

    // Ready once Vitest has started a run in the tab; a held test (--hold) keeps that run going.
    // Vitest prints DEV in watch mode and RUN in a single run.
    if (tab && /\b(DEV|RUN|RERUN)\b/.test(text)) {
      state.orchestratorUrl = tab.url;
      break;
    }

    if (/An exception occurred|Unhandled Error|EACCES|already in use/.test(text)) {
      fail(2, `ng test failed to start; see ${log}; run down`, { state: statePath(flowId) });
    }

    if (!processTable().some((r) => r.ProcessId === child.pid)) {
      fail(2, `ng test (PID ${child.pid}) exited before it was ready; see ${log}; run down`, { state: statePath(flowId) });
    }

    if (Date.now() - t0 > timeoutMs) {
      fail(2, `no Vitest tab and DEV or RUN line after ${timeoutMs / 1000}s; see ${log}; run down`, { state: statePath(flowId) });
    }

    await sleep(500);
  }

  if (bundled && state.extension) {
    const sw = (await cdpList(cdpPort)).find((t) => t.type === 'service_worker' && t.url.startsWith('chrome-extension://'));
    state.extension.id = sw ? new URL(sw.url).host : null;
  }

  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
  out({ ok: true, command: 'up', readyInSeconds: Math.round((Date.now() - t0) / 100) / 10, statePath: statePath(flowId), ...state }, 0);
}

async function doctor() {
  const { state } = readState();
  const checks = [];
  const add = (name, status, detail) => checks.push({ name, status, detail });

  if (state.worktree && state.vitestPort === MAIN_VITEST_PORT) {
    fail(2, "refused: worktree run points at the main checkout's Vitest port");
  }

  const table = processTable();
  const row = table.find((r) => r.ProcessId === state.proc?.pid);
  const alive = row && row.Start === state.proc.start;
  add('process-alive', alive ? 'pass' : 'fail', alive ? `ng test PID ${state.proc.pid} running since ${state.proc.start}` : `ng test PID ${state.proc?.pid} is gone or reused`);
  const owner = listeningPid(state.vitestPort);
  const owned = owner && alive && descendants(table, state.proc.pid).has(owner);
  add('port-owned', owned ? 'pass' : 'fail', owner ? `port ${state.vitestPort} listened on by PID ${owner}${owned ? ` (in the tree of ${state.proc.pid})` : ' (NOT ours)'}` : `nothing listens on ${state.vitestPort}`);
  const text = existsSync(state.proc.log) ? readFileSync(state.proc.log, 'utf8').replace(/\x1b\[[0-9;]*m/g, '') : '';
  const summary = text.split(/\r?\n/).filter((l) => /^\s*Tests\s+\d/.test(l)).at(-1)?.trim() ?? null;
  const broken = /An exception occurred|Unhandled Error/.test(text);
  const started = /\b(DEV|RUN|RERUN)\b/.test(text);
  add('test-run', started && !broken ? 'pass' : 'fail', broken ? `the log has "An exception occurred" or "Unhandled Error"; see ${state.proc.log}` : summary ? `last summary: ${summary}` : started ? 'a run is in progress (no summary yet)' : `Vitest has not started a run; see ${state.proc.log}`);

  const version = await cdpVersion(state.cdpPort);
  add('browser-cdp', version ? 'pass' : 'fail', version ? `${version.Browser} on ${state.cdpUrl}${state.instance ? ` (instance ${state.instance})` : ' (bundled Chromium)'}` : `nothing answers on ${state.cdpUrl}`);

  if (!version) {
    return out({ ok: false, command: 'doctor', flowId: state.flowId, checks }, 1);
  }

  const tab = (await cdpList(state.cdpPort)).find((t) => t.type === 'page' && t.url.startsWith(state.orchestratorPrefix));
  add('orchestrator-tab', tab ? 'pass' : 'fail', tab ? tab.url : `no tab starting with ${state.orchestratorPrefix}`);

  if (tab) {
    const cdp = await Cdp.connect(version.webSocketDebuggerUrl);

    try {
      const sid = await cdp.session(tab.id);
      const tree = (await cdp.send('Page.getFrameTree', {}, sid)).frameTree;
      const tester = (tree.childFrames ?? []).find((c) => c.frame.name === 'vitest-iframe');
      add('tester-frame', tester ? 'pass' : 'fail', tester ? tester.frame.url : 'no child frame named vitest-iframe');

      if (tester) {
        const contexts = await frameContexts(cdp, sid);
        const main = contexts.find((c) => c.auxData?.frameId === tester.frame.id && c.auxData?.isDefault);
        const page = await evalIn(
          cdp,
          sid,
          main.id,
          `(async () => ({
            ng: window.ng ? Object.keys(window.ng).length : 0,
            host: document.querySelector('[ng-version]')?.textContent.trim() ?? null,
            runner: typeof window.__vitest_browser_runner__,
            lm: typeof LanguageModel === 'undefined' ? 'undefined' : await LanguageModel.availability().catch((e) => String(e)),
          }))()`,
        );
        add('dev-build', page.ng > 0 ? 'pass' : 'fail', page.ng > 0 ? `window.ng has ${page.ng} functions in the tester iframe` : 'window.ng missing in the tester iframe');
        add('vitest-runner', page.runner === 'object' ? 'pass' : 'fail', `__vitest_browser_runner__ is ${page.runner}`);
        add('mounted-component', page.host ? 'pass' : 'warn', page.host ? `[ng-version] host: "${page.host}"` : 'no [ng-version] host now: no test is running (start with --hold to keep the Counter mounted)');
        add('language-model', page.lm === 'available' ? 'pass' : state.mode === 'bundled' ? 'warn' : 'fail', `LanguageModel.availability() in the tester iframe: ${page.lm}${state.mode === 'bundled' && page.lm !== 'available' ? ' (expected: bundled Chromium has no model)' : ''}`);

        if (state.extension) {
          const extOrigin = `chrome-extension://${state.extension.id}`;
          const world = contexts.find((c) => c.auxData?.frameId === tester.frame.id && c.origin === extOrigin);
          add('extension-content-script', world ? 'pass' : 'fail', world ? `isolated world "${world.name}" in the tester iframe` : `no execution context from ${extOrigin} in the tester iframe`);
        }
      }

      await cdp.send('Target.detachFromTarget', { sessionId: sid }).catch(() => {});
    } finally {
      cdp.ws.close();
    }
  }

  if (state.extension) {
    const sw = (await cdpList(state.cdpPort)).find((t) => t.type === 'service_worker' && t.url.startsWith(`chrome-extension://${state.extension.id}/`));
    add('extension-loaded', sw ? 'pass' : 'fail', sw ? `service worker ${sw.url}` : `no service worker for extension ${state.extension.id}`);
  } else {
    add('extension-loaded', 'skip', 'no --extension given to up');
  }

  const failed = checks.filter((c) => c.status === 'fail');
  out({ ok: failed.length === 0, command: 'doctor', flowId: state.flowId, session: state.session, orchestratorUrl: tab?.url ?? null, checks }, failed.length === 0 ? 0 : 1);
}

function info() {
  const { sp, state } = readState();
  out({ ok: true, command: 'info', statePath: sp, ...state }, 0);
}

async function down() {
  const { sp, state } = readState();
  const table = processTable();
  const notes = [];
  const row = state.proc ? table.find((r) => r.ProcessId === state.proc.pid) : null;

  if (row && (row.Start !== state.proc.start || row.CommandLine !== state.proc.commandLine)) {
    fail(2, `refused: PID ${state.proc.pid} does not match the state file: start-time ${row.Start} vs recorded ${state.proc.start}; command ${row.Start !== state.proc.start ? 'not compared' : `"${row.CommandLine}" vs recorded "${state.proc.commandLine}"`}. Not stopping a process this skill did not start.`, { state: sp });
  }

  // detach, not close: the session is attached to a browser this skill may not own.
  const det = playwrightCli([`-s=${state.session}`, 'detach']);
  notes.push(`session ${state.session}: ${det.status === 0 ? 'detached' : 'was not attached'}`);

  if (row) {
    const r = spawnSync('taskkill', ['/PID', String(state.proc.pid), '/T', '/F'], { encoding: 'utf8', windowsHide: true });
    notes.push(`stopped ng test tree of PID ${state.proc.pid}: ${r.status === 0 ? 'ok' : r.stderr.trim()}`);
  } else if (state.proc) {
    notes.push(`ng test PID ${state.proc.pid} was not running`);
  }

  if (state.mode === 'attach' && (await cdpVersion(state.cdpPort))) {
    for (const t of await cdpList(state.cdpPort)) {
      if (t.type === 'page' && t.url.startsWith(`http://127.0.0.1:${state.vitestPort}/`)) {
        await fetch(`http://127.0.0.1:${state.cdpPort}/json/close/${t.id}`).catch(() => {});
        notes.push(`closed Vitest tab ${t.url}`);
      }
    }

    if (state.extension?.id) {
      const v = await cdpVersion(state.cdpPort);
      const cdp = await Cdp.connect(v.webSocketDebuggerUrl);

      try {
        await cdp.send('Extensions.uninstall', { id: state.extension.id });
        notes.push(`uninstalled extension ${state.extension.id}`);
      } catch (e) {
        notes.push(`extension ${state.extension.id}: ${e.message}`);
      } finally {
        cdp.ws.close();
      }
    }

    if (state.launchedInstance) {
      let r = aiControl(['stop', state.instance]);

      if (r.status !== 0) {
        aiControl(['attach', state.instance]);
        r = aiControl(['stop', state.instance]);
      }

      notes.push(`control-ai-browsers stop ${state.instance}: exit ${r.status}`);
    } else {
      notes.push(`instance ${state.instance} left running: this skill did not start it`);
    }
  }

  if (state.userDataDir) {
    for (let i = 0; i < 10 && existsSync(state.userDataDir); i++) {
      try {
        rmSync(state.userDataDir, { recursive: true, force: true });
      } catch {
        await sleep(500);
      }
    }

    notes.push(`profile ${state.userDataDir}: ${existsSync(state.userDataDir) ? 'could not be removed' : 'removed'}`);
  }

  rmSync(sp, { force: true });
  out({ ok: true, command: 'down', flowId: state.flowId, evidenceDir: state.evidenceDir, notes }, 0);
}

const commands = { up, doctor, info, down };

if (!commands[cmd]) {
  process.stdout.write('usage: control.mjs <up|doctor|info|down> [--instance <name> | --bundled] [--extension <dir>|s1-vitest] [--hold <ms>] [--timing-demo] [--filter <text>] [--port N] [--timeout S] [--json]\n');
  process.exit(2);
}

await commands[cmd]();
