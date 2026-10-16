#!/usr/bin/env node
// @ts-check
// Control script for control-vitest-browser-angular: up, doctor, info, down.
// Runs the counter fixture's Vitest Browser Mode tests in watch mode, either attached to a per-model instance
// from control-ai-browsers (default) or in Playwright's bundled Chromium (--bundled). Deterministic steps only;
// driving stays in playwright-cli.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mapFresh } from './fingerprint.mjs';

/** @typedef {{ ProcessId: number, ParentProcessId: number, Start: string | null, CommandLine: string | null }} ProcessRow */
/** @typedef {{ pid: number, start: string | null, commandLine: string | null, log: string }} ProcState */
/** @typedef {{ name: string, status: 'pass' | 'fail' | 'warn' | 'skip', detail: string }} Check */
/** @typedef {{ status: number | null, stdout: string, stderr: string }} Run */
/** @typedef {{ Browser: string, webSocketDebuggerUrl: string }} CdpVersion */
/** @typedef {{ id: string, type: string, url: string }} CdpTarget */
/** @typedef {{ frame: { id: string, name?: string, url: string }, childFrames?: FrameTree[] }} FrameTree */
/** @typedef {{ id: number, origin: string, name: string, auxData?: { frameId?: string, isDefault?: boolean } }} ExecutionContext */

/**
 * The part of spikes/probes/vitest-lib.mjs this script uses.
 * @typedef {object} CdpClient
 * @property {(method: string, params?: Record<string, unknown>, sessionId?: string) => Promise<unknown>} send
 * @property {(targetId: string) => Promise<string>} session
 * @property {{ close: () => void }} ws
 */

/**
 * @typedef {object} VitestLib
 * @property {{ connect: (wsUrl: string) => Promise<CdpClient> }} Cdp
 * @property {(cdp: CdpClient, sid: string, contextId: number, expression: string) => Promise<unknown>} evalIn
 * @property {(cdp: CdpClient, sid: string) => Promise<ExecutionContext[]>} frameContexts
 * @property {(dir: string) => string} writeS1VitestVariant
 */

/**
 * @typedef {object} State
 * @property {string} flowId
 * @property {'bundled' | 'attach'} mode
 * @property {string | null} instance
 * @property {boolean} launchedInstance
 * @property {number} cdpPort
 * @property {string} cdpUrl
 * @property {number} vitestPort
 * @property {string} orchestratorPrefix
 * @property {boolean} worktree
 * @property {string} session
 * @property {string} evidenceDir
 * @property {string} startedAt
 * @property {{ dir: string, id: string | null } | null} extension
 * @property {string | null} userDataDir
 * @property {number | null} hold
 * @property {string | null} filter
 * @property {boolean} timingDemo
 * @property {ProcState | null} proc
 * @property {string} [orchestratorUrl]
 */

/**
 * @typedef {object} UpOptions
 * @property {boolean} bundled
 * @property {string} instance  the --instance value or the default; attach mode only
 * @property {number | null} port  null: derive it
 * @property {number | null} hold
 * @property {string | null} filter
 * @property {boolean} timingDemo
 * @property {string | null} extension
 * @property {number} timeoutMs
 */

const SKILL_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = path.resolve(SKILL_DIR, '../../..');
const SCRATCH = path.join(REPO_ROOT, 'tmp', 'control-vitest-browser-angular');
const STATE_DIR = path.join(SCRATCH, 'state');
const FIXTURE = path.join(REPO_ROOT, 'spikes', 'ng222-app');
const NG = path.join(FIXTURE, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
const AI_CONTROL = path.join(REPO_ROOT, '.claude', 'skills', 'control-ai-browsers', 'scripts', 'control.mjs');
const AI_REGISTRY = path.join(REPO_ROOT, '.claude', 'skills', 'control-ai-browsers', 'instances.json');
const SYSTEM32 = path.join(process.env['SystemRoot'] ?? 'C:\\Windows', 'System32');
// Windows reads this from this process when Node looks up a bare program name (pwsh): it then skips the current directory.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';
const { Cdp, evalIn, frameContexts, writeS1VitestVariant } = /** @type {VitestLib} */ (await import(pathToFileURL(path.join(REPO_ROOT, 'spikes', 'probes', 'vitest-lib.mjs')).href));

// Vitest's default 63315 is inside a Windows excluded port range on this machine; see vitest-base.config.mts.
const MAIN_VITEST_PORT = 51315;
const MAIN_BUNDLED_CDP_PORT = 9350;
const DEFAULT_INSTANCE = 'chrome-beta-gemma4';

// ---------- pure helpers (exported for the tests) ----------

/**
 * The value after `--<name>`: a string, true when the flag has no value, undefined when it is absent.
 * @param {string[]} args
 * @param {string} name
 * @returns {string | true | undefined}
 */
export function flagIn(args, name) {
  const i = args.indexOf(`--${name}`);

  if (i === -1) {
    return undefined;
  }

  const v = args[i + 1];

  return v === undefined || v.startsWith('--') ? true : v;
}

/**
 * The options `up` reads from its arguments.
 * @param {string[]} args
 * @returns {UpOptions}
 */
export function upOptions(args) {
  /** @param {string} name */
  const text = (name) => {
    const v = flagIn(args, name);

    return typeof v === 'string' ? v : null;
  };
  /** @param {string} name */
  const nonEmpty = (name) => text(name) || null;
  const port = nonEmpty('port');
  const hold = nonEmpty('hold');

  return {
    bundled: Boolean(flagIn(args, 'bundled')),
    instance: text('instance') ?? DEFAULT_INSTANCE,
    port: port === null ? null : Number(port),
    hold: hold === null ? null : Number(hold),
    filter: text('filter'),
    timingDemo: Boolean(flagIn(args, 'timing-demo')),
    extension: nonEmpty('extension'),
    timeoutMs: Number(flagIn(args, 'timeout') ?? 180) * 1000,
  };
}

/**
 * Whether `dir` lies in a git worktree: the nearest `.git` is a file. No git at all counts as a main checkout.
 * @param {string} dir
 * @returns {boolean}
 */
export function isWorktree(dir) {
  for (let d = path.resolve(dir); ; d = path.dirname(d)) {
    const g = path.join(d, '.git');

    if (existsSync(g)) {
      return statSync(g).isFile();
    }

    if (path.dirname(d) === d) {
      return false;
    }
  }
}

/**
 * `main` in a main checkout; in a worktree a port in `base` to `base + span` from a hash of `dir`, never `main`.
 * @param {string} dir
 * @param {number} main
 * @param {number} base
 * @param {number} span
 * @param {boolean} worktree
 * @returns {number}
 */
export function derivePort(dir, main, base, span, worktree) {
  if (!worktree) {
    return main;
  }

  const p = base + (createHash('sha1').update(path.resolve(dir).toLowerCase()).digest().readUInt32BE(0) % span);

  return p === main ? p + 1 : p;
}

/**
 * `pid` and every process below it in `table`.
 * @param {ProcessRow[]} table
 * @param {number} pid
 * @returns {Set<number>}
 */
export function descendants(table, pid) {
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

/**
 * The PID listening on `port` in `netstat -ano` output, or null.
 * @param {string} text
 * @param {number} port
 * @returns {number | null}
 */
export function parseListeningPid(text, port) {
  for (const l of text.split(/\r?\n/)) {
    const m = l.trim().split(/\s+/);

    if (m[0] === 'TCP' && m[3] === 'LISTENING' && (m[1] ?? '').endsWith(`:${port}`)) {
      return Number(m[4]);
    }
  }

  return null;
}

/**
 * playwright-cli's entry script next to its npm shim, from the first absolute PATH entry that has the shim.
 * @param {string} pathEnv
 * @returns {string | null}
 */
export function playwrightCliJs(pathEnv) {
  const shimDir = pathEnv.split(path.delimiter).find((d) => path.isAbsolute(d) && existsSync(path.join(d, 'playwright-cli.cmd')));
  const js = shimDir && path.join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  return js && existsSync(js) ? js : null;
}

/** @param {string} text */
const stripAnsi = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');

// Vitest prints DEV in watch mode and RUN in a single run.
const RUN_STARTED = /\b(DEV|RUN|RERUN)\b/;

/**
 * Whether the ng test log shows a run started, or a start failure.
 * @param {string} log
 * @returns {{ started: boolean, failed: boolean }}
 */
export function logStart(log) {
  const text = stripAnsi(log);

  return { started: RUN_STARTED.test(text), failed: /An exception occurred|Unhandled Error|EACCES|already in use/.test(text) };
}

/**
 * The doctor's test-run check from the ng test log.
 * @param {string} log  the log's content
 * @param {string} logPath
 * @returns {{ status: 'pass' | 'fail', detail: string }}
 */
export function testRunCheck(log, logPath) {
  const text = stripAnsi(log);
  const summary = text.split(/\r?\n/).filter((l) => /^\s*Tests\s+\d/.test(l)).at(-1)?.trim() ?? null;
  const broken = /An exception occurred|Unhandled Error/.test(text);
  const started = RUN_STARTED.test(text);
  const detail = broken ? `the log has "An exception occurred" or "Unhandled Error"; see ${logPath}` : summary ? `last summary: ${summary}` : started ? 'a run is in progress (no summary yet)' : `Vitest has not started a run; see ${logPath}`;

  return { status: started && !broken ? 'pass' : 'fail', detail };
}

/**
 * The doctor's language-model check: bundled Chromium has no model, so there a missing one is a warning.
 * @param {string} lm  what LanguageModel.availability() returned, or 'undefined'
 * @param {State['mode']} mode
 * @returns {{ status: 'pass' | 'fail' | 'warn', detail: string }}
 */
export function languageModelCheck(lm, mode) {
  const bundled = mode === 'bundled';

  return {
    status: lm === 'available' ? 'pass' : bundled ? 'warn' : 'fail',
    detail: `LanguageModel.availability() in the tester iframe: ${lm}${bundled && lm !== 'available' ? ' (expected: bundled Chromium has no model)' : ''}`,
  };
}

/**
 * The Vitest orchestrator page among the CDP targets.
 * @param {CdpTarget[]} targets
 * @param {string} prefix
 * @returns {CdpTarget | undefined}
 */
export function orchestratorTab(targets, prefix) {
  return targets.find((t) => t.type === 'page' && t.url.startsWith(prefix));
}

/**
 * The id of the first extension with a service worker among the CDP targets, or null.
 * @param {CdpTarget[]} targets
 * @returns {string | null}
 */
export function extensionIdIn(targets) {
  const sw = targets.find((t) => t.type === 'service_worker' && t.url.startsWith('chrome-extension://'));

  return sw ? new URL(sw.url).host : null;
}

/**
 * The environment for `ng test`.
 * @param {NodeJS.ProcessEnv} base
 * @param {State} state
 * @returns {NodeJS.ProcessEnv}
 */
export function testEnv(base, state) {
  /** @type {NodeJS.ProcessEnv} */
  const env = { ...base, VITEST_BROWSER_PORT: String(state.vitestPort), NG_CLI_ANALYTICS: 'false' };
  delete env['CI'];

  if (state.hold) {
    env['VITE_COUNTER_HOLD_MS'] = String(state.hold);
  }

  if (state.timingDemo) {
    env['VITE_COUNTER_TIMING_DEMO'] = '1';
  }

  if (state.mode === 'bundled') {
    env['VITEST_EXTENSION_DIR'] = state.extension?.dir;
    env['VITEST_CDP_PORT'] = String(state.cdpPort);
    env['VITEST_USER_DATA_DIR'] = state.userDataDir ?? undefined;
  } else {
    env['VITEST_CDP_URL'] = state.cdpUrl;
  }

  return env;
}

/**
 * The arguments after node for `ng test`. --watch explicitly: a spawned process has no TTY, and Angular then
 * defaults to a single run, after which the tab closes.
 * @param {string} ng
 * @param {State} state
 * @returns {string[]}
 */
export function testArgs(ng, state) {
  const args = [ng, 'test', '-c', state.mode === 'bundled' ? 'extension' : 'attach', '--watch'];

  if (state.filter) {
    args.push('--filter', state.filter);
  }

  return args;
}

/**
 * Why `down` must not stop the recorded process, or null when the live row matches the state file.
 * @param {ProcessRow} row
 * @param {ProcState} proc
 * @returns {string | null}
 */
export function pidMismatch(row, proc) {
  if (row.Start === proc.start && row.CommandLine === proc.commandLine) {
    return null;
  }

  return `refused: PID ${proc.pid} does not match the state file: start-time ${row.Start} vs recorded ${proc.start}; command ${row.Start !== proc.start ? 'not compared' : `"${row.CommandLine}" vs recorded "${proc.commandLine}"`}. Not stopping a process this skill did not start.`;
}

/**
 * Why `down` must not delete the recorded bundled profile, or null when it lies strictly below `scratch`.
 * @param {string} dir
 * @param {string} scratch
 * @returns {string | null}
 */
export function profileOutside(dir, scratch) {
  const rel = path.relative(path.resolve(scratch), path.resolve(dir));

  if (rel !== '' && rel !== '..' && !rel.startsWith(`..${path.sep}`) && !path.isAbsolute(rel)) {
    return null;
  }

  return `refused: the recorded profile ${dir} is not below ${scratch}. Not deleting a folder this skill did not create.`;
}

// ---------- process and tool access ----------

/** @returns {ProcessRow[]} */
function processTable() {
  const ps = "Get-CimInstance Win32_Process | Select-Object ProcessId,ParentProcessId,@{n='Start';e={$_.CreationDate.ToUniversalTime().ToString('o')}},CommandLine | ConvertTo-Json -Compress";
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });

  if (r.status !== 0) {
    throw new Error(`process table query failed: ${r.stderr}`);
  }

  return /** @type {ProcessRow[]} */ (JSON.parse(r.stdout));
}

/**
 * @param {number} port
 * @returns {number | null}
 */
function listeningPid(port) {
  const netstat = path.join(SYSTEM32, 'netstat.exe');
  const text = ['TCP', 'TCPv6'].map((proto) => spawnSync(netstat, ['-ano', '-p', proto], { encoding: 'utf8', windowsHide: true }).stdout).join('\n');

  return parseListeningPid(text, port);
}

/**
 * @param {string[]} args
 * @returns {Run}
 */
function playwrightCli(args) {
  const js = playwrightCliJs(process.env['PATH'] ?? '');

  if (!js) {
    return { status: 127, stdout: '', stderr: 'playwright-cli not found on PATH' };
  }

  const r = spawnSync(process.execPath, [js, ...args], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024 });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * @param {string[]} args
 * @returns {Run}
 */
function aiControl(args) {
  const r = spawnSync(process.execPath, [AI_CONTROL, ...args], { cwd: REPO_ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024 });

  return { status: r.status, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * @param {number} port
 * @returns {Promise<CdpVersion | null>}
 */
async function cdpVersion(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(3000) });

    return /** @type {CdpVersion} */ (await res.json());
  } catch {
    return null;
  }
}

/**
 * @param {number} port
 * @returns {Promise<CdpTarget[]>}
 */
async function cdpList(port) {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000) });

    return /** @type {CdpTarget[]} */ (await res.json());
  } catch {
    return [];
  }
}

/** @param {number} ms */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** @param {number} vitestPort */
const orchestratorPrefix = (vitestPort) => `http://127.0.0.1:${vitestPort}/__vitest_test__/`;

// ---------- CLI ----------

const argv = process.argv.slice(2);
const cmd = argv[0];
const JSON_OUT = argv.includes('--json');

/**
 * @param {{ checks?: Check[] } & Record<string, unknown>} result
 * @param {number} code
 * @returns {never}
 */
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

/**
 * @param {number} code
 * @param {string} reason
 * @param {Record<string, unknown>} [extra]
 * @returns {never}
 */
function fail(code, reason, extra = {}) {
  return out({ ok: false, command: cmd, reason, ...extra }, code);
}

/** @param {string} flowId */
const statePath = (flowId) => path.join(STATE_DIR, `${flowId}.json`);

function stateFiles() {
  return existsSync(STATE_DIR) ? readdirSync(STATE_DIR).filter((f) => f.endsWith('.json')) : [];
}

/** @returns {{ sp: string, state: State }} */
function readState() {
  const first = stateFiles()[0];

  if (first === undefined) {
    return fail(2, `no state file in ${STATE_DIR}: nothing was started by this skill (run up first)`);
  }

  const p = path.join(STATE_DIR, first);

  return { sp: p, state: /** @type {State} */ (JSON.parse(readFileSync(p, 'utf8'))) };
}

async function up() {
  mkdirSync(STATE_DIR, { recursive: true });

  // One run at a time: one ng test process, and one browser per run (Lars's memory budget).
  if (stateFiles().length > 0) {
    fail(2, `refused: a run is already recorded (${stateFiles().join(', ')}); run down first`);
  }

  if (!existsSync(NG)) {
    fail(2, `cannot find the Angular CLI at ${NG}; run npm ci in spikes/ng222-app first`);
  }

  const opts = upOptions(argv);
  const bundled = opts.bundled;
  const instance = bundled ? null : opts.instance;
  const worktree = isWorktree(FIXTURE);
  const vitestPort = opts.port ?? derivePort(FIXTURE, MAIN_VITEST_PORT, 51400, 500, worktree);

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
    cdpPort = derivePort(FIXTURE, MAIN_BUNDLED_CDP_PORT, 9400, 100, worktree);
    const cdpOwner = listeningPid(cdpPort);

    if (cdpOwner) {
      fail(2, `refused: CDP port ${cdpPort} is already in use by PID ${cdpOwner}`);
    }
  } else {
    const registry = /** @type {{ instances: Record<string, { port: number }> }} */ (JSON.parse(readFileSync(AI_REGISTRY, 'utf8')));
    const entry = registry.instances[opts.instance];

    if (!entry) {
      return fail(2, `unknown instance "${opts.instance}"; pick one from ${AI_REGISTRY}: ${Object.keys(registry.instances).join(', ')}`);
    }

    cdpPort = entry.port;

    if (!(await cdpVersion(cdpPort))) {
      const r = aiControl(['up', opts.instance]);

      if (r.status !== 0) {
        fail(2, `control-ai-browsers up ${opts.instance} exited ${r.status}: ${(r.stdout + r.stderr).trim().slice(-400)}`);
      }

      launchedInstance = true;
    }
  }

  const flowId = `${bundled ? 'bundled' : instance}-${vitestPort}`;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const evidenceDir = path.join(SCRATCH, `${flowId}-${stamp}`);
  mkdirSync(evidenceDir, { recursive: true });
  /** @type {State} */
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
    hold: opts.hold,
    filter: opts.filter,
    timingDemo: opts.timingDemo,
    proc: null,
  };
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  if (opts.extension !== null) {
    const dir = opts.extension === 's1-vitest' ? writeS1VitestVariant(path.join(evidenceDir, 'extension')) : path.resolve(opts.extension);

    if (!existsSync(path.join(dir, 'manifest.json'))) {
      fail(2, `no manifest.json in ${dir}; run down to clear the state`, { state: statePath(flowId) });
    }

    state.extension = { dir, id: null };

    if (!bundled) {
      const v = await cdpVersion(cdpPort);

      if (!v) {
        throw new Error(`nothing answers on ${state.cdpUrl}`);
      }

      const cdp = await Cdp.connect(v.webSocketDebuggerUrl);

      try {
        state.extension.id = /** @type {{ id: string }} */ (await cdp.send('Extensions.loadUnpacked', { path: dir })).id;
      } finally {
        cdp.ws.close();
      }
    }
  } else if (bundled) {
    fail(2, '--bundled needs --extension <dir> or --extension s1-vitest (vitest-extension.config.mts requires one); run down to clear the state', { state: statePath(flowId) });
  }

  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  const log = path.join(evidenceDir, 'ng-test.log');
  const fd = openSync(log, 'a');
  const t0 = Date.now();
  const child = spawn(process.execPath, testArgs(NG, state), { cwd: FIXTURE, env: testEnv(process.env, state), detached: true, stdio: ['ignore', fd, fd], windowsHide: true });
  child.unref();
  const pid = child.pid;

  if (pid === undefined) {
    fail(2, `ng test did not start; see ${log}; run down`, { state: statePath(flowId) });
  }

  const row = processTable().find((r) => r.ProcessId === pid);
  state.proc = { pid, start: row?.Start ?? null, commandLine: row?.CommandLine ?? null, log };
  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));

  for (;;) {
    const tab = orchestratorTab(await cdpList(cdpPort), state.orchestratorPrefix);
    const status = logStart(existsSync(log) ? readFileSync(log, 'utf8') : '');

    // Ready once Vitest has started a run in the tab; a held test (--hold) keeps that run going.
    if (tab && status.started) {
      state.orchestratorUrl = tab.url;
      break;
    }

    if (status.failed) {
      fail(2, `ng test failed to start; see ${log}; run down`, { state: statePath(flowId) });
    }

    if (!processTable().some((r) => r.ProcessId === pid)) {
      fail(2, `ng test (PID ${pid}) exited before it was ready; see ${log}; run down`, { state: statePath(flowId) });
    }

    if (Date.now() - t0 > opts.timeoutMs) {
      fail(2, `no Vitest tab and DEV or RUN line after ${opts.timeoutMs / 1000}s; see ${log}; run down`, { state: statePath(flowId) });
    }

    await sleep(500);
  }

  if (bundled && state.extension) {
    state.extension.id = extensionIdIn(await cdpList(cdpPort));
  }

  writeFileSync(statePath(flowId), JSON.stringify(state, null, 2));
  out({ ok: true, command: 'up', readyInSeconds: Math.round((Date.now() - t0) / 100) / 10, statePath: statePath(flowId), ...state }, 0);
}

async function doctor() {
  const { state } = readState();
  /** @type {Check[]} */
  const checks = [];
  /** @type {(name: string, status: Check['status'], detail: string) => void} */
  const add = (name, status, detail) => {
    checks.push({ name, status, detail });
  };
  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', fresh.status, fresh.detail);

  if (state.worktree && state.vitestPort === MAIN_VITEST_PORT) {
    fail(2, "refused: worktree run points at the main checkout's Vitest port");
  }

  const proc = state.proc;
  const table = processTable();
  const row = proc ? table.find((r) => r.ProcessId === proc.pid) : undefined;
  const alive = proc !== null && row !== undefined && row.Start === proc.start;
  add('process-alive', alive ? 'pass' : 'fail', alive ? `ng test PID ${proc.pid} running since ${proc.start}` : `ng test PID ${proc?.pid} is gone or reused`);
  const owner = listeningPid(state.vitestPort);
  const owned = !!owner && alive && descendants(table, proc.pid).has(owner);
  add('port-owned', owned ? 'pass' : 'fail', owner ? `port ${state.vitestPort} listened on by PID ${owner}${owned ? ` (in the tree of ${proc?.pid})` : ' (NOT ours)'}` : `nothing listens on ${state.vitestPort}`);
  const logPath = proc?.log ?? '';
  const run = testRunCheck(logPath && existsSync(logPath) ? readFileSync(logPath, 'utf8') : '', logPath);
  add('test-run', run.status, run.detail);

  const version = await cdpVersion(state.cdpPort);
  add('browser-cdp', version ? 'pass' : 'fail', version ? `${version.Browser} on ${state.cdpUrl}${state.instance ? ` (instance ${state.instance})` : ' (bundled Chromium)'}` : `nothing answers on ${state.cdpUrl}`);

  if (!version) {
    return out({ ok: false, command: 'doctor', flowId: state.flowId, checks }, 1);
  }

  const tab = orchestratorTab(await cdpList(state.cdpPort), state.orchestratorPrefix);
  add('orchestrator-tab', tab ? 'pass' : 'fail', tab ? tab.url : `no tab starting with ${state.orchestratorPrefix}`);

  if (tab) {
    const cdp = await Cdp.connect(version.webSocketDebuggerUrl);

    try {
      const sid = await cdp.session(tab.id);
      const tree = /** @type {{ frameTree: FrameTree }} */ (await cdp.send('Page.getFrameTree', {}, sid)).frameTree;
      const tester = (tree.childFrames ?? []).find((c) => c.frame.name === 'vitest-iframe');
      add('tester-frame', tester ? 'pass' : 'fail', tester ? tester.frame.url : 'no child frame named vitest-iframe');

      if (tester) {
        const contexts = await frameContexts(cdp, sid);
        const main = contexts.find((c) => c.auxData?.frameId === tester.frame.id && c.auxData?.isDefault);

        if (!main) {
          throw new Error('no default execution context for the tester iframe');
        }

        const page = /** @type {{ ng: number, host: string | null, runner: string, lm: string }} */ (
          await evalIn(
            cdp,
            sid,
            main.id,
            `(async () => ({
            ng: window.ng ? Object.keys(window.ng).length : 0,
            host: document.querySelector('[ng-version]')?.textContent.trim() ?? null,
            runner: typeof window.__vitest_browser_runner__,
            lm: typeof LanguageModel === 'undefined' ? 'undefined' : await LanguageModel.availability().catch((e) => String(e)),
          }))()`,
          )
        );
        add('dev-build', page.ng > 0 ? 'pass' : 'fail', page.ng > 0 ? `window.ng has ${page.ng} functions in the tester iframe` : 'window.ng missing in the tester iframe');
        add('vitest-runner', page.runner === 'object' ? 'pass' : 'fail', `__vitest_browser_runner__ is ${page.runner}`);
        add('mounted-component', page.host ? 'pass' : 'warn', page.host ? `[ng-version] host: "${page.host}"` : 'no [ng-version] host now: no test is running (start with --hold to keep the Counter mounted)');
        const lm = languageModelCheck(page.lm, state.mode);
        add('language-model', lm.status, lm.detail);

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
    const prefix = `chrome-extension://${state.extension.id}/`;
    const sw = (await cdpList(state.cdpPort)).find((t) => t.type === 'service_worker' && t.url.startsWith(prefix));
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
  /** @type {string[]} */
  const notes = [];
  const proc = state.proc;
  const row = proc ? table.find((r) => r.ProcessId === proc.pid) : undefined;
  const refusal = row && proc ? pidMismatch(row, proc) : null;

  if (refusal !== null) {
    fail(2, refusal, { state: sp });
  }

  const profileRefusal = state.userDataDir ? profileOutside(state.userDataDir, SCRATCH) : null;

  if (profileRefusal !== null) {
    fail(2, profileRefusal, { state: sp });
  }

  // detach, not close: the session is attached to a browser this skill may not own.
  const det = playwrightCli([`-s=${state.session}`, 'detach']);
  notes.push(`session ${state.session}: ${det.status === 0 ? 'detached' : 'was not attached'}`);

  if (row && proc) {
    const r = spawnSync(path.join(SYSTEM32, 'taskkill.exe'), ['/PID', String(proc.pid), '/T', '/F'], { encoding: 'utf8', windowsHide: true });
    notes.push(`stopped ng test tree of PID ${proc.pid}: ${r.status === 0 ? 'ok' : r.stderr.trim()}`);
  } else if (proc) {
    notes.push(`ng test PID ${proc.pid} was not running`);
  }

  const version = state.mode === 'attach' ? await cdpVersion(state.cdpPort) : null;

  if (version) {
    for (const t of await cdpList(state.cdpPort)) {
      if (t.type === 'page' && t.url.startsWith(`http://127.0.0.1:${state.vitestPort}/`)) {
        await fetch(`http://127.0.0.1:${state.cdpPort}/json/close/${t.id}`).catch(() => {});
        notes.push(`closed Vitest tab ${t.url}`);
      }
    }

    if (state.extension?.id) {
      const cdp = await Cdp.connect(version.webSocketDebuggerUrl);

      try {
        await cdp.send('Extensions.uninstall', { id: state.extension.id });
        notes.push(`uninstalled extension ${state.extension.id}`);
      } catch (e) {
        notes.push(`extension ${state.extension.id}: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        cdp.ws.close();
      }
    }

    if (state.launchedInstance && state.instance !== null) {
      let r = aiControl(['down', state.instance]);

      if (r.status !== 0) {
        aiControl(['attach', state.instance]);
        r = aiControl(['down', state.instance]);
      }

      notes.push(`control-ai-browsers down ${state.instance}: exit ${r.status}`);
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
  // process.exit while fetch's sockets to the CDP port are still closing aborts Node on Windows
  // ("Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)", exit 127; measured after attach-mode down).
  await sleep(250);
  out({ ok: true, command: 'down', flowId: state.flowId, evidenceDir: state.evidenceDir, notes }, 0);
}

/** @type {Record<string, () => void | Promise<void>>} */
const commands = { up, doctor, info, down };

// import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
if (process.argv[1] && realpathSync.native(path.resolve(process.argv[1])) === realpathSync.native(fileURLToPath(import.meta.url))) {
  const run = cmd !== undefined && Object.hasOwn(commands, cmd) ? commands[cmd] : undefined;

  if (run === undefined) {
    process.stdout.write('usage: control.mjs <up|doctor|info|down> [--instance <name> | --bundled] [--extension <dir>|s1-vitest] [--hold <ms>] [--timing-demo] [--filter <text>] [--port N] [--timeout S] [--json]\n');
    process.exit(2);
  }

  await run();
}
