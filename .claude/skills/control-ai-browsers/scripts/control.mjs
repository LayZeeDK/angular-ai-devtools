#!/usr/bin/env node
// @ts-check
// Deterministic control of the per-model browser instances in instances.json, through playwright-cli and raw CDP.
// Usage: node control.mjs <command> [sub] <instance> [--json] [--evidence=<dir>]  (see SKILL.md, Helpers)
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statfsSync, statSync, writeFileSync } from 'node:fs';
import { delimiter, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapFresh } from './fingerprint.mjs';

/** @typedef {{ exe: string, scheme: string, product: string, modelRoots: string[], minFreeMib: number, modelComponents?: string[] }} BrowserDef */
/** @typedef {{ name: string, folders: string, asset: string, useCase: string, contextWindow: number, toolCanary: boolean | 'report', downloadMib: number }} ModelDef */
/** @typedef {{ default: string, gpu: string[] | null, cpu: string[] | null }} BackendDef */
/** @typedef {{ browser: string, port: number, features: string[], backend: BackendDef, model: ModelDef }} InstanceDef */
/** @typedef {{ profilesRoot: string, commonArgs: string[], browsers: Record<string, BrowserDef>, instances: Record<string, InstanceDef> }} Registry */
/** @typedef {InstanceDef & BrowserDef & { name: string, dir: string, session: string, cdp: string }} Inst */
/** @typedef {'gpu' | 'cpu'} Backend */
/** @typedef {{ ProcessId: number, ExecutablePath: string | null, CommandLine: string | null, Created: string | null }} ProcRow */
/** @typedef {{ userDataDir: string | null, port: number, features: string[], args: string[] }} CommandLine */
/** @typedef {{ backend: Backend | null, problems: string[], commandLine: CommandLine }} Drift */

/**
 * @typedef {object} State
 * @property {string} instance
 * @property {number} pid
 * @property {string | null} created
 * @property {string | null} exe
 * @property {string | null} commandLine
 * @property {number} port
 * @property {string} cdp
 * @property {string} session
 * @property {string} profile
 * @property {Backend | null} backend
 * @property {string} at
 */

/** @typedef {{ name: string, version: string, state: string, progress: number }} BrokerAsset */
/** @typedef {{ name: string, mib: number, weights: string | null, backend: string }} BrokerModel */

/**
 * What the Broker State tab of on-device-internals shows, parsed.
 * @typedef {object} Broker
 * @property {undefined} [disabled]
 * @property {string | null} manifestPath
 * @property {string | null} manifestLoaded
 * @property {string | null} perfClass
 * @property {string | null} diskInstall
 * @property {BrokerAsset[]} assets
 * @property {Record<string, string>} useCases
 * @property {BrokerModel[]} models
 */

/** @typedef {{ disabled: true, error: string, diskInstall?: undefined }} BrokerDisabled */
/** @typedef {{ kind: Backend | null, row: string | null, backendType?: string, weights?: string | null }} Serving */
/** @typedef {{ name: string | undefined, modelVersion: string | undefined, componentVersion: string | undefined, performanceHints: unknown, dir: string, bytes: number, mib: number }} DiskModel */
/** @typedef {{ bytes: number, mib: number, minMib: number, volume: string }} FreeSpace */
/** @typedef {{ id: string, pass: boolean | null, warn: boolean, detail: unknown }} Check */
/** @typedef {{ ok: boolean, couldNotRun?: boolean } & Record<string, unknown>} Result */
/** @typedef {{ code: number | null, out: string }} PwRun */
/** @typedef {{ Browser: string, webSocketDebuggerUrl: string }} CdpVersion */
/** @typedef {{ id: string, type: string, url: string }} CdpTarget */

/**
 * What the AVAILABILITY snippet returns: an availability string or an error text per API, and a few page facts.
 * @typedef {{ LanguageModel?: string } & Record<string, unknown>} Availability
 */
/** @typedef {{ pass: boolean | null } & Record<string, unknown>} CanaryPart */
/** @typedef {{ contextWindow?: number, structured?: CanaryPart, tools?: CanaryPart, webmcp?: CanaryPart, createMs?: number }} Canary */
/** @typedef {{ firstCreateMs: number, secondCreateMs: number, contextWindow: number, promptMs: number, answer: unknown, contextUsage?: number }} InitRun */
/** @typedef {{ id: string, name: string, status: string | null }} EdgeComponent */
/** @typedef {{ gesture: string, state: string, clickAt?: number, readyAt?: number, contextWindow?: number, samples: number, polls: unknown[] }} DownloadRun */
/** @typedef {{ optimization_guide?: { on_device?: { performance_class?: unknown } } }} LocalState */
/** @typedef {{ name?: string, version?: string, BaseModelSpec?: { name?: string, version?: string, supported_performance_hints?: unknown } }} ModelManifest */

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(SKILL_DIR, '..', '..', '..');
const TMP = join(ROOT, 'tmp', 'control-ai-browsers');
/** @type {Registry} */
const REGISTRY = JSON.parse(readFileSync(join(SKILL_DIR, 'instances.json'), 'utf8'));
const PROFILES = resolve(ROOT, REGISTRY.profilesRoot);
const PROBE_ORIGIN = 'https://example.org/';
const STEP_TIMEOUT_MS = 180000;
const EXIT = { OK: 0, UNHEALTHY: 1, REFUSED: 2 };
// Windows reads this from this process, not the child's env, when Node looks up a bare program name (pwsh):
// it then skips the current directory.
process.env['NoDefaultCurrentDirectoryInExePath'] = '1';

// ---------- args ----------

/**
 * `--name=value` and bare `--name` (true) into opts; everything else, in order, into pos.
 * @param {string[]} argv
 * @returns {{ opts: Record<string, string | true>, pos: string[] }}
 */
export function parseArgs(argv) {
  /** @type {Record<string, string | true>} */
  const opts = {};
  /** @type {string[]} */
  const pos = [];

  for (const a of argv) {
    const m = a.match(/^--([^=]+)(?:=(.*))?$/);

    if (m) {
      opts[/** @type {string} */ (m[1])] = m[2] ?? true;
    } else {
      pos.push(a);
    }
  }

  return { opts, pos };
}

const { opts, pos } = parseArgs(process.argv.slice(2));
const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
const evidenceDir = resolve(ROOT, typeof opts['evidence'] === 'string' ? opts['evidence'] : join('tmp', 'control-ai-browsers', 'evidence', runId));

export class Refusal extends Error {}

/**
 * @param {string} msg
 * @returns {never}
 */
function refuse(msg) {
  throw new Refusal(msg);
}

/**
 * @param {string} marker
 * @param {string} msg
 */
function log(marker, msg) {
  if (!opts['json']) {
    console.log(`[${marker}] ${msg}`);
  }
}

// ---------- registry ----------

/**
 * @param {string | undefined} name
 * @param {Pick<Registry, 'instances' | 'browsers'>} [registry]
 * @returns {Inst}
 */
export function instance(name, registry = REGISTRY) {
  const i = name !== undefined && Object.hasOwn(registry.instances, name) ? registry.instances[name] : undefined;

  if (name === undefined || i === undefined) {
    return refuse(`unknown instance "${name}"; known: ${Object.keys(registry.instances).join(', ')}`);
  }

  const b = (Object.hasOwn(registry.browsers, i.browser) ? registry.browsers[i.browser] : undefined) ?? refuse(`instance "${name}" names unknown browser "${i.browser}"`);
  const dir = join(PROFILES, name);

  return { name, ...i, ...b, dir, session: `ai-${name}`, cdp: `http://127.0.0.1:${i.port}` };
}

/**
 * The --enable-features list for a backend; refuses a backend the registry does not offer.
 * @param {Pick<Inst, 'name' | 'features' | 'backend'>} inst
 * @param {string} backend
 * @returns {string[]}
 */
export function featuresFor(inst, backend) {
  const extra = backend === 'gpu' || backend === 'cpu' ? inst.backend[backend] : undefined;

  if (extra === undefined) {
    refuse(`--backend must be gpu or cpu`);
  }

  if (extra === null) {
    refuse(`${inst.name} refuses --backend=${backend}: forcing CPU on Edge deletes the installed model (measured twice); Edge offers WebGPU variants only`);
  }

  return [...inst.features, ...extra];
}

/**
 * The command line `up` launches the instance with.
 * @param {Pick<Inst, 'dir' | 'port'>} inst
 * @param {string[]} features
 * @returns {string[]}
 */
export function launchArgs(inst, features) {
  return [`--user-data-dir=${inst.dir}`, `--remote-debugging-port=${inst.port}`, ...REGISTRY.commonArgs, `--enable-features=${features.join(',')}`, 'about:blank'];
}

// ---------- processes ----------

/**
 * pwsh's ConvertTo-Json output as rows: nothing, one object, or an array.
 * @param {string} text
 * @returns {unknown[]}
 */
export function jsonRows(text) {
  if (!text.trim()) {
    return [];
  }

  /** @type {unknown} */
  const v = JSON.parse(text);

  return Array.isArray(v) ? v : [v];
}

/**
 * @param {string} command
 * @returns {unknown[]}
 */
function pwshJson(command) {
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', `${command} | ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8', windowsHide: true });

  return jsonRows(r.stdout ?? '');
}

const PROC_FIELDS = "Select-Object ProcessId,ExecutablePath,CommandLine,@{n='Created';e={$_.CreationDate.ToString('o')}}";

/**
 * @param {string | null | undefined} commandLine
 * @returns {CommandLine}
 */
export function parseCommandLine(commandLine) {
  const cl = commandLine ?? '';
  const udd = cl.match(/--user-data-dir=(?:"([^"]+)"|(\S+))/);

  return {
    userDataDir: udd ? (udd[1] ?? udd[2] ?? null) : null,
    port: Number(cl.match(/--remote-debugging-port=(\d+)/)?.[1] ?? NaN),
    features: (cl.match(/--enable-features=(?:"([^"]+)"|(\S+))/)?.slice(1).find(Boolean) ?? '').split(',').filter(Boolean),
    args: REGISTRY.commonArgs.filter((a) => cl.includes(a)),
  };
}

/**
 * @param {string | null | undefined} a
 * @param {string | null | undefined} b
 * @returns {boolean}
 */
export const sameDir = (a, b) => !!a && !!b && resolve(a).toLowerCase() === resolve(b).toLowerCase();

// The instance's browser processes are the ones whose --user-data-dir is its profile; Lars's own browsers never match.
/**
 * @param {Inst} inst
 * @returns {ProcRow[]}
 */
function instanceProcesses(inst) {
  const exeName = inst.exe.split('\\').pop();
  const rows = /** @type {ProcRow[]} */ (pwshJson(`Get-CimInstance Win32_Process -Filter "Name='${exeName}'" | ${PROC_FIELDS}`));

  return rows.filter((p) => sameDir(parseCommandLine(p.CommandLine).userDataDir, inst.dir));
}

/**
 * @param {Inst} inst
 * @returns {ProcRow | null}
 */
function mainProcess(inst) {
  const main = instanceProcesses(inst).filter((p) => !/--type=/.test(p.CommandLine ?? ''));

  return main.length === 1 ? /** @type {ProcRow} */ (main[0]) : main.length === 0 ? null : refuse(`${main.length} main processes use ${inst.dir}`);
}

/**
 * @param {number} pid
 * @returns {ProcRow | null}
 */
function processById(pid) {
  return /** @type {ProcRow[]} */ (pwshJson(`Get-CimInstance Win32_Process -Filter "ProcessId=${Number(pid)}" | ${PROC_FIELDS}`))[0] ?? null;
}

/**
 * @param {number} port
 * @returns {number | null}
 */
function portOwner(port) {
  const rows = /** @type {{ OwningProcess: number }[]} */ (pwshJson(`Get-NetTCPConnection -LocalPort ${Number(port)} -State Listen -ErrorAction SilentlyContinue | Select-Object OwningProcess`));

  return rows.map((c) => c.OwningProcess)[0] ?? null;
}

// Which registry backend a command line matches, or null when it matches none (drift).
/**
 * @param {Pick<Inst, 'exe' | 'port' | 'features' | 'backend'>} inst
 * @param {Pick<ProcRow, 'ExecutablePath' | 'CommandLine'>} proc
 * @returns {Drift}
 */
export function drift(inst, proc) {
  const cl = parseCommandLine(proc.CommandLine);
  const have = [...cl.features].sort().join(',');
  /** @type {Backend[]} */
  const kinds = ['gpu', 'cpu'];
  const backend = kinds.find((k) => {
    const extra = inst.backend[k];

    return Array.isArray(extra) && [...inst.features, ...extra].sort().join(',') === have;
  }) ?? null;
  /** @type {string[]} */
  const problems = [];

  if (proc.ExecutablePath !== inst.exe) {
    problems.push(`exe ${proc.ExecutablePath}, registry ${inst.exe}`);
  }

  if (cl.port !== inst.port) {
    problems.push(`port ${cl.port}, registry ${inst.port}`);
  }

  if (!backend) {
    problems.push(`--enable-features matches no registry backend: ${cl.features.join(',')}`);
  }

  for (const a of REGISTRY.commonArgs.filter((x) => !cl.args.includes(x))) {
    problems.push(`missing ${a}`);
  }

  return { backend, problems, commandLine: cl };
}

/**
 * Why `down` must not close the recorded PID, or null when the live process is the one the state file recorded.
 * @param {Pick<State, 'pid' | 'exe' | 'commandLine' | 'created'>} st
 * @param {Pick<ProcRow, 'ExecutablePath' | 'CommandLine' | 'Created'>} live
 * @returns {string | null}
 */
export function downRefusal(st, live) {
  if (live.ExecutablePath !== st.exe || live.CommandLine !== st.commandLine) {
    return `PID ${st.pid} command line mismatch: running "${live.ExecutablePath}" ${String(live.CommandLine).slice(0, 120)}, recorded ${st.exe}`;
  }

  if (live.Created !== st.created) {
    return `PID ${st.pid} start-time mismatch: live ${live.Created}, recorded ${st.created}`;
  }

  return null;
}

/** @param {number} ms */
async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/**
 * @template T
 * @param {() => T | Promise<T>} fn
 * @param {number} timeoutMs
 * @param {number} [everyMs]
 * @returns {Promise<T | null>}
 */
async function waitFor(fn, timeoutMs, everyMs = 1000) {
  const end = Date.now() + timeoutMs;

  while (Date.now() < end) {
    const v = await fn();

    if (v) {
      return v;
    }

    await sleep(everyMs);
  }

  return null;
}

/**
 * @param {Inst} inst
 * @param {string} path
 * @returns {Promise<unknown>}
 */
async function cdpJson(inst, path) {
  try {
    const r = await fetch(`${inst.cdp}${path}`, { signal: AbortSignal.timeout(3000) });

    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

/**
 * @param {Inst} inst
 * @returns {Promise<CdpTarget[]>}
 */
async function pageTargets(inst) {
  return (/** @type {CdpTarget[] | null} */ (await cdpJson(inst, '/json/list')) ?? []).filter((t) => t.type === 'page');
}

/**
 * @param {Inst} inst
 * @returns {Promise<string[]>}
 */
async function pageTabs(inst) {
  return (await pageTargets(inst)).map((t) => t.url);
}

// ---------- state ----------

/** @param {string} name */
function statePath(name) {
  return join(TMP, `state-${name}.json`);
}

/**
 * @param {string} name
 * @returns {State | null}
 */
function readState(name) {
  if (!existsSync(statePath(name))) {
    return null;
  }

  /** @type {unknown} */
  const st = JSON.parse(readFileSync(statePath(name), 'utf8'));

  return /** @type {State} */ (st);
}

/**
 * @param {Inst} inst
 * @param {ProcRow} proc
 * @returns {State}
 */
function writeState(inst, proc) {
  mkdirSync(TMP, { recursive: true });
  /** @type {State} */
  const st = { instance: inst.name, pid: proc.ProcessId, created: proc.Created, exe: proc.ExecutablePath, commandLine: proc.CommandLine, port: inst.port, cdp: inst.cdp, session: inst.session, profile: inst.dir, backend: drift(inst, proc).backend, at: new Date().toISOString() };
  writeFileSync(statePath(inst.name), JSON.stringify(st, null, 2));

  return st;
}

// ---------- playwright-cli ----------
/** @type {Inst | null} */
let attachedHere = null;

/**
 * playwright-cli's script beside its npm shim on PATH (absolute PATH entries only), or null.
 * @param {string} pathEnv
 * @returns {string | null}
 */
export function findPlaywrightCli(pathEnv) {
  const shimDir = pathEnv.split(delimiter).find((d) => isAbsolute(d) && existsSync(join(d, 'playwright-cli.cmd')));
  const js = shimDir && join(shimDir, 'node_modules', '@playwright', 'cli', 'playwright-cli.js');

  return js && existsSync(js) ? js : null;
}

/**
 * @param {Inst} inst
 * @param {string[]} args
 * @param {{ raw?: boolean, timeoutMs?: number }} [options]
 * @returns {PwRun}
 */
function pw(inst, args, { raw = false, timeoutMs = 120000 } = {}) {
  const js = findPlaywrightCli(process.env['PATH'] ?? '');

  if (!js) {
    return { code: 127, out: 'playwright-cli not found on PATH' };
  }

  const full = [...(raw ? ['--raw'] : []), `-s=${inst.session}`, ...args];
  const r = spawnSync(process.execPath, [js, ...full], { cwd: ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs });
  const error = /** @type {(Error & { code?: string }) | undefined} */ (r.error);

  if (error?.code === 'ETIMEDOUT') {
    return { code: -1, out: `playwright-cli ${args[0]} timed out after ${timeoutMs} ms; a tab renderer may be hung (see Gotchas)` };
  }

  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

/** @param {Inst} inst */
function isAttached(inst) {
  const r = pw(inst, ['tab-list']);

  return r.code === 0 && !/is not open|not connected/i.test(r.out);
}

// Attaches the instance's session when it is not attached; a session this command attached is detached when it ends.
/** @param {Inst} inst */
async function ensureAttached(inst) {
  if (isAttached(inst)) {
    return;
  }

  const r = pw(inst, ['attach', `--cdp=${inst.cdp}`]);

  if (r.code !== 0 || !isAttached(inst)) {
    refuse(`playwright-cli could not attach ${inst.session} to ${inst.cdp}: ${r.out.trim().slice(0, 300)}`);
  }

  attachedHere = inst;
}

/** @typedef {{ args?: Record<string, unknown>, url?: string | null, purpose?: string }} TabOptions */

// A run-code file that runs `async (p, args) => {...}` in a tab it opens and always closes. Tabs carry ?ai-browsers=<purpose>.
/**
 * @param {string} body
 * @param {TabOptions} [options]
 * @returns {string}
 */
export function tabSource(body, { args = {}, url = PROBE_ORIGIN, purpose = 'probe' } = {}) {
  const target = url && url.startsWith('https://') ? `${url}${url.includes('?') ? '&' : '?'}ai-browsers=${purpose}` : url;

  return `async page => {
  const p = await page.context().newPage();
  try {
    ${target ? `await p.goto(${JSON.stringify(target)});` : ''}
    return await (${body})(p, ${JSON.stringify(args)});
  } finally {
    await p.close().catch(() => {});
  }
}`;
}

/**
 * @param {Inst} inst
 * @param {string} body
 * @param {TabOptions} [options]
 * @returns {Promise<unknown>}
 */
async function inTab(inst, body, options) {
  return runCode(inst, tabSource(body, options));
}

/**
 * @param {Inst} inst
 * @param {string} src
 * @returns {Promise<unknown>}
 */
async function runCode(inst, src) {
  await ensureAttached(inst);
  mkdirSync(join(TMP, 'run'), { recursive: true });
  const file = join(TMP, 'run', `${inst.session}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.js`);
  writeFileSync(file, src);
  const r = pw(inst, ['run-code', `--filename=${file}`], { raw: true, timeoutMs: Number(opts['timeout-min'] ?? 15) * 60000 });
  rmSync(file, { force: true });

  if (r.code !== 0) {
    throw new Error(`run-code failed: ${r.out.trim().slice(0, 600)}`);
  }

  const text = r.out.trim();

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

// ---------- page snippets ----------
const DEEP_TEXT = `() => {
  const parts = [];
  const walk = (n) => {
    if (n.nodeType === 3) { const t = n.textContent.trim(); if (t) parts.push(t); return; }
    if (n.nodeType !== 1 && n.nodeType !== 11) return;
    if (n.nodeType === 1 && (n.tagName === 'STYLE' || n.tagName === 'SCRIPT' || n.hidden)) return;
    if (n.shadowRoot) walk(n.shadowRoot);
    for (const c of n.childNodes) walk(c);
  };
  walk(document.body);
  return parts.join(' | ');
}`;

// Same walk as spikes/probes/broker-state.js, in a tab of its own.
const BROKER = `async (p, { scheme }) => {
  await p.goto(scheme + '://on-device-internals');
  const first = await p.evaluate(${DEEP_TEXT});
  if (/Internal debugging pages are currently disabled/i.test(first)) return 'DEBUG-PAGES-DISABLED';
  await p.locator('[role=tab]').nth(2).click({ force: true, timeout: 10000 }).catch(() => p.locator('[role=tab]').nth(2).press('Enter'));
  let text = '';
  for (let i = 0; i < 30; i++) {
    text = await p.evaluate(${DEEP_TEXT});
    if (text.includes('Manifest Path')) break;
    await p.waitForTimeout(1000);
  }
  return text;
}`;

const ENABLE_DEBUG_PAGES = `async (p) => {
  await p.goto('chrome://chrome-urls');
  const b = p.getByRole('button', { name: /Enable internal debugging pages/i });
  if (!(await b.count())) return 'already enabled';
  await b.click({ timeout: 5000 }).catch(async () => { await b.focus(); await p.keyboard.press('Enter'); });
  await p.getByRole('button', { name: /Disable internal debugging pages/i }).waitFor({ timeout: 10000 });
  return 'enabled';
}`;

const VERSION_CMDLINE = `async (p, { scheme }) => {
  await p.goto(scheme + '://version');
  return await p.locator('#command_line').textContent();
}`;

const AVAILABILITY = `async (p) => p.evaluate(async () => {
  const o = {};
  const check = async (name, fn) => { try { o[name] = await Promise.race([fn(), new Promise((r) => setTimeout(() => r('no answer in 20 s'), 20000))]); } catch (e) { o[name] = 'ERR ' + e.name + ': ' + e.message; } };
  const g = globalThis;
  await check('LanguageModel', () => g.LanguageModel ? LanguageModel.availability() : 'undefined');
  await check('LanguageModelTools', () => g.LanguageModel ? LanguageModel.availability({ expectedInputs: [{ type: 'text' }, { type: 'tool-response' }], expectedOutputs: [{ type: 'text' }, { type: 'tool-call' }] }) : 'undefined');
  await check('Summarizer', () => g.Summarizer ? Summarizer.availability() : 'undefined');
  await check('Writer', () => g.Writer ? Writer.availability() : 'undefined');
  await check('Rewriter', () => g.Rewriter ? Rewriter.availability() : 'undefined');
  await check('Proofreader', () => g.Proofreader ? Proofreader.availability() : 'undefined');
  await check('LanguageDetector', () => g.LanguageDetector ? LanguageDetector.availability() : 'undefined');
  await check('Translator(en->da)', () => g.Translator ? Translator.availability({ sourceLanguage: 'en', targetLanguage: 'da' }) : 'undefined');
  o.webmcp = { documentModelContext: typeof document.modelContext, navigatorModelContext: typeof navigator.modelContext };
  o.userAgent = navigator.userAgent;
  return o;
})`;

const CANARY = `async (p, { toolCanary }) => p.evaluate(async ([toolCanary, ms]) => {
  const o = {};
  const to = (pr) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('step timeout ' + ms + ' ms')), ms))]);
  const t0 = performance.now();
  try {
    const s = await to(LanguageModel.create());
    o.contextWindow = s.contextWindow;
    const t1 = performance.now();
    const raw = await to(s.prompt('Name one Angular lifecycle hook.', { responseConstraint: { type: 'object', properties: { hook: { type: 'string' } }, required: ['hook'] } }));
    let parsed = null;
    try { parsed = JSON.parse(raw); } catch {}
    o.structured = { pass: !!parsed && typeof parsed.hook === 'string', raw, ms: Math.round(performance.now() - t1) };
    s.destroy();
  } catch (e) {
    o.structured = { pass: false, error: e.name + ': ' + e.message };
  }
  o.createMs = Math.round(performance.now() - t0);
  if (!toolCanary) { o.tools = { pass: null, skipped: 'this model has no tool calling (it answers in text); see Gotchas' }; }
  // Up to three fresh sessions: Phi-4-mini often answers the tool question in prose (5 of 15 native runs passed).
  else for (let attempt = 1; attempt <= 3 && !o.tools?.pass; attempt++) try {
    const calls = [];
    const impl = { get_component_count: () => ({ count: 42 }) };
    const s = await to(LanguageModel.create({
      initialPrompts: [{ role: 'system', content: 'You cannot see the page; call tools to answer.' }],
      expectedInputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-response' }],
      expectedOutputs: [{ type: 'text', languages: ['en'] }, { type: 'tool-call' }],
      tools: [{ name: 'get_component_count', description: 'Returns how many Angular components are on the page.', inputSchema: { type: 'object', properties: { scope: { type: 'string', description: 'Use "page".' } }, required: ['scope'] } }],
    }));
    const t = performance.now();
    let input = 'How many Angular components are on the page?';
    let answer = null;
    for (let step = 0; step < 4 && answer === null; step++) {
      const out = await to(s.prompt(input));
      const parts = Array.isArray(out) ? out : [{ type: 'text', value: out }];
      const tc = parts.filter((x) => x.type === 'tool-call').map((x) => x.value);
      if (tc.length === 0) { answer = parts.map((x) => x.value).join(''); break; }
      input = [{ role: 'user', content: tc.map((c) => {
        const id = c.callID ?? c.callId;
        calls.push({ name: c.name, callID: id, arguments: c.arguments });
        const result = impl[c.name]?.(c.arguments ?? {});
        // Chrome Beta 156 reads callID; Edge Dev 157.0.4329 requires callId. Unknown dictionary members are ignored.
        return { type: 'tool-response', value: result
          ? new LanguageModelToolSuccess({ callID: id, callId: id, name: c.name, result: [{ type: 'object', value: result }] })
          : new LanguageModelToolError({ callID: id, callId: id, name: c.name, errorMessage: 'unknown tool' }) };
      }) }];
    }
    o.tools = { pass: calls.some((c) => c.name === 'get_component_count') && /\\b(42|forty-two)\\b/i.test(answer ?? ''), calls, answer, ms: Math.round(performance.now() - t), contextUsage: s.contextUsage, attempt };
    s.destroy();
  } catch (e) {
    o.tools = { pass: false, error: e.name + ': ' + e.message, attempt };
  }
  o.webmcp = { pass: typeof document.modelContext === 'object', documentModelContext: typeof document.modelContext };
  return o;
}, [toolCanary, ${STEP_TIMEOUT_MS}])`;

const INIT = `async (p) => p.evaluate(async (ms) => {
  const o = {};
  const to = (pr) => Promise.race([pr, new Promise((_, rej) => setTimeout(() => rej(new Error('step timeout ' + ms + ' ms')), ms))]);
  let t = performance.now();
  const s1 = await to(LanguageModel.create());
  o.firstCreateMs = Math.round(performance.now() - t);
  o.contextWindow = s1.contextWindow;
  t = performance.now();
  o.answer = await to(s1.prompt('Say hi in three words.'));
  o.promptMs = Math.round(performance.now() - t);
  o.contextUsage = s1.contextUsage;
  s1.destroy();
  t = performance.now();
  const s2 = await to(LanguageModel.create());
  o.secondCreateMs = Math.round(performance.now() - t);
  s2.destroy();
  return o;
}, ${STEP_TIMEOUT_MS})`;

// edge://components: press "Check for update" on the model components; a fresh Edge profile can wait at 0% without it.
const EDGE_COMPONENTS = `async (p, { names }) => {
  await p.goto('edge://components');
  await p.waitForSelector('.button-check-update');
  const ids = await p.evaluate((names) => [...document.querySelectorAll('.button-check-update')].map((b) => {
    let n = b; while (n && !/Version/.test(n.textContent)) n = n.parentElement;
    const text = n?.textContent ?? '';
    const name = names.find((x) => text.includes(x + ' - '));
    return name ? { id: b.id, name, status: (text.match(/Status - ([^\\n]+?)(?:Søg|Check|$)/) ?? [])[1] ?? null } : null;
  }).filter(Boolean), names);
  for (const c of ids) {
    const b = p.locator('#' + c.id + '.button-check-update');
    await b.click({ timeout: 5000 }).catch(async () => { await b.focus(); await p.keyboard.press('Enter'); });
    await p.waitForTimeout(1000);
  }
  return ids;
}`;

// ---------- readers ----------

/**
 * @param {Inst} inst
 * @returns {LocalState | null}
 */
function readLocalState(inst) {
  const f = join(inst.dir, 'Local State');

  if (!existsSync(f)) {
    return null;
  }

  /** @type {unknown} */
  const ls = JSON.parse(readFileSync(f, 'utf8'));

  return /** @type {LocalState} */ (ls);
}

/** @param {Inst} inst */
function perfClass(inst) {
  return readLocalState(inst)?.optimization_guide?.on_device?.performance_class ?? null;
}

/**
 * @param {Inst} inst
 * @returns {FreeSpace}
 */
function freeSpace(inst) {
  const st = statfsSync(existsSync(inst.dir) ? inst.dir : PROFILES);
  const bytes = Number(st.bavail) * Number(st.bsize);

  return { bytes, mib: Math.floor(bytes / 1048576), minMib: inst.minFreeMib, volume: inst.dir.slice(0, 2) };
}

/**
 * Whether a real (link-resolved) path lies below the real profile folder, ignoring letter case; `model clear` deletes
 * only such folders.
 * @param {string} profileReal
 * @param {string} dirReal
 * @returns {boolean}
 */
export function insideProfile(profileReal, dirReal) {
  return dirReal.toLowerCase().startsWith(profileReal.toLowerCase().replace(/[\\/]+$/, '') + sep);
}

/**
 * Why a download of about `downloadMib` must not start, or null when the volume keeps the browser's minimum free.
 * @param {FreeSpace} free
 * @param {Pick<ModelDef, 'name' | 'downloadMib'>} model
 * @returns {string | null}
 */
export function downloadRefusal(free, model) {
  if (free.mib - model.downloadMib < free.minMib) {
    return `download refused: ${free.mib} MiB free on ${free.volume} minus about ${model.downloadMib} MiB for ${model.name} leaves ${free.mib - model.downloadMib} MiB, under the browser minimum of ${free.minMib} MiB`;
  }

  return null;
}

/**
 * @param {string} dir
 * @returns {number}
 */
function dirSize(dir) {
  let total = 0;

  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    total += e.isDirectory() ? dirSize(f) : statSync(f).size;
  }

  return total;
}

/**
 * The model folders (a manifest.json, at most three levels down) under the instance's model roots.
 * @param {Pick<Inst, 'dir' | 'modelRoots'>} inst
 * @returns {DiskModel[]}
 */
export function diskModels(inst) {
  /** @type {DiskModel[]} */
  const out = [];
  /** @type {(dir: string, depth: number) => void} */
  const visit = (dir, depth) => {
    if (!existsSync(dir) || depth > 3) {
      return;
    }

    const manifest = join(dir, 'manifest.json');

    if (existsSync(manifest)) {
      /** @type {ModelManifest} */
      const m = JSON.parse(readFileSync(manifest, 'utf8'));
      const bytes = dirSize(dir);
      out.push({ name: m.BaseModelSpec?.name ?? m.name, modelVersion: m.BaseModelSpec?.version, componentVersion: m.version, performanceHints: m.BaseModelSpec?.supported_performance_hints, dir, bytes, mib: Math.round(bytes / 1048576) });

      return;
    }

    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        visit(join(dir, e.name), depth + 1);
      }
    }
  };

  for (const r of inst.modelRoots) {
    visit(join(inst.dir, r), 0);
  }

  return out;
}

/**
 * @param {string} text
 * @returns {Broker}
 */
export function parseBroker(text) {
  const assets = [...text.matchAll(/([a-z0-9_]+) \| (\d{4}\.[\d.]+) \| (Ready|Not Installed|Registering|Background Installing|Foreground Installing|Uninstalling|Unknown) \| (\d+)%/g)].map((m) => ({ name: m[1] ?? '', version: m[2] ?? '', state: m[3] ?? '', progress: Number(m[4]) }));
  const useCases = Object.fromEntries([...text.matchAll(/\| ([a-z][a-z0-9_]+) \| (Available|Not Supported|Pending Usage|Pending Assets|[A-Z][A-Za-z ]+?) (?=\|)/g)].map((m) => [m[1] ?? '', (m[2] ?? '').trim()]));
  const models = [...text.matchAll(/([a-z0-9_]+) \| ([\d,.]+) \| MiB \| (?:([A-Z]:\\[^|]+?) \| )?(GPU[^|]*?|CPU)(?= \||$)/g)].map((m) => ({ name: m[1] ?? '', mib: Number((m[2] ?? '').replace(/,/g, '')), weights: m[3] ?? null, backend: (m[4] ?? '').trim() }));
  /** @type {(label: string) => string | null} */
  const pick = (label) => text.match(new RegExp(`${label} \\| ([^|]+?) \\|`))?.[1] ?? null;

  return { manifestPath: pick('Manifest Path'), manifestLoaded: pick('Manifest Loaded'), perfClass: pick('Performance Class'), diskInstall: pick('Enough disk space to install'), assets, useCases, models };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Broker | BrokerDisabled>}
 */
async function brokerState(inst) {
  const text = /** @type {string} */ (await inTab(inst, BROKER, { url: null, args: { scheme: inst.scheme } }));

  if (text === 'DEBUG-PAGES-DISABLED') {
    return { disabled: true, error: `internal debugging pages are off in ${inst.name}; "up ${inst.name}" turns them on (chrome://chrome-urls)` };
  }

  return parseBroker(text);
}

// The backend that serves this instance's model: the Broker State model row whose weights sit in the model's folder.
/**
 * @param {{ model: Pick<ModelDef, 'name'> }} inst
 * @param {Pick<Broker, 'models'>} broker
 * @param {DiskModel[]} disk
 * @returns {Serving}
 */
export function servingBackend(inst, broker, disk) {
  const mine = disk.filter((d) => d.name === inst.model.name);
  const row = broker.models?.find((m) => m.weights && mine.some((d) => /** @type {string} */ (m.weights).toLowerCase().startsWith(d.dir.toLowerCase())));

  return row ? { kind: row.backend.startsWith('GPU') ? 'gpu' : 'cpu', row: row.name, backendType: row.backend, weights: row.weights } : { kind: null, row: null };
}

/**
 * @typedef {object} ModelInfo
 * @property {string} instance
 * @property {string} expected
 * @property {boolean} running
 * @property {DiskModel[]} disk
 * @property {unknown} performanceClass
 * @property {FreeSpace} free
 * @property {Backend | null} [requestedBackend]
 * @property {Broker | BrokerDisabled} [broker]
 * @property {Serving} [backend]
 * @property {BrokerAsset | null} [asset]
 * @property {string | null | undefined} [serving]
 */

/**
 * @param {Inst} inst
 * @returns {Promise<ModelInfo>}
 */
async function modelInfo(inst) {
  const disk = diskModels(inst);
  const proc = mainProcess(inst);
  /** @type {ModelInfo} */
  const out = { instance: inst.name, expected: inst.model.name, running: !!proc, disk, performanceClass: perfClass(inst), free: freeSpace(inst) };

  if (!proc) {
    return out;
  }

  out.requestedBackend = drift(inst, proc).backend;
  const broker = await brokerState(inst);
  out.broker = broker;

  if (!broker.disabled) {
    const backend = servingBackend(inst, broker, disk);
    out.backend = backend;
    out.asset = broker.assets.find((a) => new RegExp(inst.model.asset).test(a.name)) ?? null;
    out.serving = backend.row ? disk.find((d) => String(backend.weights).toLowerCase().startsWith(d.dir.toLowerCase()))?.name ?? null : null;
  }

  return out;
}

function cpuLoad() {
  const load = /** @type {{ Average: number | null }[]} */ (pwshJson("Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object Average"))[0]?.Average ?? null;
  const top = /** @type {{ Name: string, PercentProcessorTime: number }[]} */ (pwshJson("Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notin '_Total','Idle' } | Sort-Object PercentProcessorTime -Descending | Select-Object -First 5 Name,PercentProcessorTime"));

  return { at: new Date().toISOString(), loadPercent: load, top: top.map((p) => `${p.Name} ${p.PercentProcessorTime}%`) };
}

// ---------- doctor rules ----------

/**
 * The log marker of a doctor check.
 * @param {boolean | null} pass
 * @param {boolean} warn
 * @returns {string}
 */
export function checkMarker(pass, warn) {
  return pass === null ? 'SKIP' : !pass ? 'ERROR' : warn ? 'WARN' : 'OK';
}

/**
 * Healthy when no check failed; skipped (null) and warned checks do not count against it.
 * @param {Pick<Check, 'pass'>[]} checks
 * @returns {boolean}
 */
export function doctorOk(checks) {
  return checks.every((c) => c.pass !== false);
}

/**
 * The canary.tools verdict: "report" keeps the result without gating health on it.
 * @param {ModelDef['toolCanary']} toolCanary
 * @param {CanaryPart | undefined} tools
 * @returns {boolean | null}
 */
export function toolsPass(toolCanary, tools) {
  return toolCanary === 'report' ? null : tools?.pass ?? null;
}

/**
 * @param {Pick<Result, 'ok' | 'couldNotRun'>} result
 * @returns {number}
 */
export function exitCode(result) {
  return result.couldNotRun ? EXIT.REFUSED : result.ok ? EXIT.OK : EXIT.UNHEALTHY;
}

// ---------- commands ----------

/** @returns {Promise<Result>} */
async function cmdInstances() {
  const rows = [];

  for (const name of Object.keys(REGISTRY.instances)) {
    const inst = instance(name);
    const proc = mainProcess(inst);
    const d = proc ? drift(inst, proc) : null;
    const tabs = proc ? await pageTabs(inst) : [];
    const row = { name, browser: inst.browser, port: inst.port, model: inst.model.name, defaultBackend: inst.backend.default, profileExists: existsSync(inst.dir), pid: proc?.ProcessId ?? null, backend: d?.backend ?? null, drift: d?.problems ?? null, tabs: tabs.length, stateFile: existsSync(statePath(name)) };
    rows.push(row);
    log(proc && d ? (d.problems.length ? 'WARN' : 'OK') : 'INFO', `${name} :${inst.port} ${inst.model.name}: ${proc && d ? `PID ${proc.ProcessId}, backend ${d.backend ?? '?'}${d.problems.length ? `, drift: ${d.problems.join('; ')}` : ''}, ${tabs.length} tab(s)` : 'stopped'}`);
  }

  return { ok: true, instances: rows };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdUp(inst) {
  const backend = typeof opts['backend'] === 'string' ? opts['backend'] : inst.backend.default;
  const features = featuresFor(inst, backend);
  const running = mainProcess(inst);

  if (running) {
    const d = drift(inst, running);

    if (d.backend === backend && d.problems.length === 0) {
      log('OK', `${inst.name} already runs as PID ${running.ProcessId} with backend ${backend}`);

      return { ok: true, alreadyRunning: true, state: writeState(inst, running) };
    }

    refuse(`${inst.name} runs as PID ${running.ProcessId} with ${d.backend ?? 'a drifted'} configuration (${d.problems.join('; ') || `backend ${d.backend}`}); run "down ${inst.name}" first`);
  }

  const owner = portOwner(inst.port);

  if (owner) {
    refuse(`port ${inst.port} is already owned by PID ${owner}, which is not ${inst.name}`);
  }

  const firstUse = !existsSync(inst.dir);
  mkdirSync(inst.dir, { recursive: true });

  // Edge deletes its model manifest at startup when the profile path resolves through a junction (measured).
  if (!sameDir(realpathSync.native(inst.dir), inst.dir)) {
    refuse(`${inst.dir} resolves through a reparse point to ${realpathSync.native(inst.dir)}; use a real folder`);
  }

  const t0 = Date.now();
  spawn(inst.exe, launchArgs(inst, features), { detached: true, stdio: 'ignore' }).unref();
  const version = /** @type {CdpVersion | null} */ (await waitFor(() => cdpJson(inst, '/json/version'), 60000, 500));

  if (!version) {
    refuse(`${inst.name} did not answer on ${inst.cdp}/json/version within 60 s`);
  }

  const proc = await waitFor(() => mainProcess(inst), 10000, 500);

  if (!proc) {
    throw new Error(`${inst.name} answers on ${inst.cdp} but no main process uses ${inst.dir} after 10 s`);
  }

  const st = writeState(inst, proc);
  const readyMs = Date.now() - t0;

  // Edge restores the last session's tabs; leave the instance on the one blank tab it was started with.
  await sleep(2000);
  const pages = await pageTargets(inst);
  const keep = pages.find((t) => t.url === 'about:blank') ?? pages[0];
  const restored = pages.filter((t) => t !== keep);

  for (const t of restored) {
    await fetch(`${inst.cdp}/json/close/${t.id}`).catch(() => {});
  }

  /** @type {unknown} */
  let debugPages = null;

  if (inst.scheme === 'chrome') {
    debugPages = await inTab(inst, ENABLE_DEBUG_PAGES, { url: null });
  }

  log('OK', `${inst.name} launched as PID ${proc.ProcessId} on ${inst.cdp} (${version.Browser}), backend ${backend}, ready in ${readyMs} ms${firstUse ? ', new profile' : ''}${restored.length ? `; closed ${restored.length} restored tab(s)` : ''}${debugPages ? `; internal debugging pages ${debugPages}` : ''}`);

  return { ok: true, backend, firstUse, readyMs, browserVersion: version.Browser, closedRestoredTabs: restored.map((t) => t.url), debugPages, state: st, tabs: await pageTabs(inst) };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdAttach(inst) {
  const proc = mainProcess(inst) ?? refuse(`${inst.name} is not running; run "up ${inst.name}"`);
  const st = writeState(inst, proc);
  await ensureAttached(inst);
  attachedHere = null;
  log('OK', `${inst.session} attached to ${inst.name} PID ${proc.ProcessId}; it stays attached for ad hoc playwright-cli commands until "detach ${inst.name}" or "down ${inst.name}"`);

  return { ok: true, state: st };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdDetach(inst) {
  pw(inst, ['detach']);
  log('OK', `${inst.session} detached; ${inst.name} left running`);

  return { ok: true };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdDown(inst) {
  const st = readState(inst.name) ?? refuse(`no state file at ${statePath(inst.name)}; run "attach ${inst.name}" or "up ${inst.name}" first`);
  const live = processById(st.pid);

  if (!live) {
    rmSync(statePath(inst.name), { force: true });
    log('OK', `PID ${st.pid} is not running any more; removed the state file`);

    return { ok: true, alreadyStopped: true, pid: st.pid };
  }

  const mismatch = downRefusal(st, live);

  if (mismatch !== null) {
    refuse(mismatch);
  }

  if (portOwner(inst.port) !== st.pid) {
    refuse(`port ${inst.port} is not owned by PID ${st.pid}; not sending Browser.close to it`);
  }

  pw(inst, ['detach']);
  const version = /** @type {CdpVersion | null} */ (await cdpJson(inst, '/json/version')) ?? refuse(`${inst.cdp} does not answer`);
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.addEventListener('open', r);
    ws.addEventListener('error', j);
  });
  ws.send(JSON.stringify({ id: 1, method: 'Browser.close' }));
  const gone = await waitFor(() => instanceProcesses(inst).length === 0, 60000, 1000);

  // Exiting while the socket is still closing trips a libuv assertion on Windows.
  if (ws.readyState !== WebSocket.CLOSED) {
    await new Promise((r) => {
      ws.addEventListener('close', r);
      ws.close();
    });
  }

  if (!gone) {
    return { ok: false, reason: `${inst.name} processes still run 60 s after Browser.close; not killing them`, left: instanceProcesses(inst).map((p) => p.ProcessId) };
  }

  rmSync(statePath(inst.name), { force: true });
  const portFree = !portOwner(inst.port);
  log(portFree ? 'OK' : 'ERROR', `${inst.name} PID ${st.pid} closed over CDP; no process uses ${inst.dir}; port ${inst.port} ${portFree ? 'free' : 'still owned'}; state file removed`);

  return { ok: portFree, pid: st.pid, portFree };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdFlags(inst) {
  const proc = mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const page = parseCommandLine(/** @type {string | null} */ (await inTab(inst, VERSION_CMDLINE, { url: null, args: { scheme: inst.scheme } })));
  const d = drift(inst, proc);
  const want = d.backend ? featuresFor(inst, d.backend) : inst.features;
  const missing = want.filter((f) => !page.features.includes(f));
  const extra = page.features.filter((f) => !want.includes(f));
  const ok = d.problems.length === 0 && missing.length === 0 && extra.length === 0;
  log(ok ? 'OK' : 'ERROR', `${inst.scheme}://version features (${d.backend ?? 'no matching'} backend): ${page.features.join(', ')}${missing.length ? `; missing ${missing.join(', ')}` : ''}${extra.length ? `; not in registry ${extra.join(', ')}` : ''}${d.problems.length ? `; drift: ${d.problems.join('; ')}` : ''}`);

  return { ok, backend: d.backend, effective: page.features, registry: want, missing, extra, drift: d.problems };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdDoctor(inst) {
  /** @type {Check[]} */
  const checks = [];
  /** @type {(id: string, pass: boolean | null, detail: unknown, warn?: boolean) => void} */
  const add = (id, pass, detail, warn = false) => {
    checks.push({ id, pass, warn, detail });
    log(checkMarker(pass, warn), `${id}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  };

  const fresh = mapFresh(SKILL_DIR);
  add('map-fresh', true, fresh.detail, fresh.status === 'warn');

  const proc = mainProcess(inst);
  add('process', !!proc, proc ? `PID ${proc.ProcessId} ${proc.ExecutablePath} --user-data-dir=${inst.dir}` : `no process uses ${inst.dir}`);

  if (!proc) {
    return { ok: false, couldNotRun: true, checks };
  }

  const d = drift(inst, proc);
  add('commandLine', d.problems.length === 0, d.problems.length ? { drift: d.problems } : `matches the registry, backend ${d.backend}`);

  const version = /** @type {CdpVersion | null} */ (await cdpJson(inst, '/json/version'));
  const owner = portOwner(inst.port);
  add('port', !!version && new RegExp(inst.product).test(version.Browser) && owner === proc.ProcessId, { cdp: inst.cdp, browser: version?.Browser ?? 'no answer', owner });

  const tabs = await pageTabs(inst);
  add('tabs', true, { count: tabs.length, urls: tabs }, tabs.length > 1);

  const disk = diskModels(inst);
  const hit = disk.find((x) => x.name === inst.model.name);
  add('model.disk', !!hit, hit ? `${hit.name} ${hit.modelVersion} (${hit.mib} MiB) at ${hit.dir}` : { expected: inst.model.name, found: disk.map((x) => x.name) });
  const others = disk.filter((x) => x.name !== inst.model.name);

  if (others.length) {
    /** @type {Check} */ (checks.at(-1)).warn = true;
    log('WARN', `model.disk: other models in this profile: ${others.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`).join(', ')}`);
  }

  const broker = await brokerState(inst);

  if (broker.disabled) {
    add('model.broker', false, broker.error);
  } else {
    const asset = broker.assets.find((a) => new RegExp(inst.model.asset).test(a.name) && a.state === 'Ready') ?? broker.assets.find((a) => new RegExp(inst.model.asset).test(a.name));
    add('model.broker', asset?.state === 'Ready' && broker.useCases[inst.model.useCase] === 'Available', { asset: asset ?? `${inst.model.asset} absent`, useCase: inst.model.useCase, state: broker.useCases[inst.model.useCase] ?? null, manifestLoaded: broker.manifestLoaded });
    const be = servingBackend(inst, broker, disk);
    add('backend', be.kind === d.backend, { requested: d.backend, broker: be.backendType ?? 'no model row with weights in the model folder', row: be.row });
    add('performanceClass', true, { localState: perfClass(inst), broker: broker.perfClass });
  }

  const free = freeSpace(inst);
  add('disk.free', true, `${free.mib} MiB free on ${free.volume}, browser minimum ${free.minMib} MiB (Broker State: ${broker.diskInstall ?? '?'})`, free.mib < free.minMib);

  const avail = /** @type {Availability} */ (await inTab(inst, AVAILABILITY, { purpose: 'availability' }));
  add('api.availability', avail.LanguageModel === 'available', avail);

  // create() on a model that is not available waits for (and can start) a download; doctor stays read-only.
  if (avail.LanguageModel !== 'available') {
    for (const id of ['model.contextWindow', 'canary.structured', 'canary.tools', 'canary.webmcp']) {
      add(id, null, `skipped: LanguageModel is ${avail.LanguageModel}; run "model download ${inst.name}"`);
    }

    return { ok: false, backend: d.backend, checks };
  }

  const canary = /** @type {Canary} */ (await inTab(inst, CANARY, { purpose: 'canary', args: { toolCanary: inst.model.toolCanary } }));
  add('model.contextWindow', canary.contextWindow === inst.model.contextWindow, `contextWindow ${canary.contextWindow}, expected ${inst.model.contextWindow}`);
  add('canary.structured', canary.structured?.pass === true, canary.structured);
  // "report": the model's native tool calling is too unreliable to gate health on (Phi-4-mini); the result is kept.
  add('canary.tools', toolsPass(inst.model.toolCanary, canary.tools), inst.model.toolCanary === 'report' ? { reportedOnly: true, ...canary.tools } : canary.tools);
  add('canary.webmcp', canary.webmcp?.pass === true, canary.webmcp);

  return { ok: doctorOk(checks), backend: d.backend, checks };
}

/**
 * @param {Inst} inst
 * @param {string | undefined} sub
 * @returns {Promise<Result>}
 */
async function cmdModel(inst, sub) {
  if (sub === 'info') {
    const info = await modelInfo(inst);

    for (const x of info.disk) {
      log('INFO', `disk: ${x.name} ${x.modelVersion} component ${x.componentVersion} hints ${JSON.stringify(x.performanceHints)} ${x.mib} MiB ${x.dir}`);
    }

    if (info.broker && !info.broker.disabled) {
      for (const a of info.broker.assets.filter((a) => a.state !== 'Not Installed')) {
        log('INFO', `broker asset: ${a.name} ${a.version} ${a.state} ${a.progress}%`);
      }

      log('INFO', `serving ${info.serving ?? 'none'}; backend ${info.backend?.backendType ?? '?'} (requested ${info.requestedBackend}); performance class ${info.performanceClass} (Broker State ${info.broker.perfClass})`);
    } else {
      log('INFO', info.broker?.disabled ? info.broker.error : `${inst.name} is stopped; disk only. performance class ${info.performanceClass}`);
    }

    return { ok: true, ...info };
  }

  if (sub === 'init') {
    mainProcess(inst) ?? refuse(`${inst.name} is not running`);
    const r = /** @type {InitRun} */ (await inTab(inst, INIT, { purpose: 'init' }));
    log('OK', `first create ${r.firstCreateMs} ms, second create ${r.secondCreateMs} ms, contextWindow ${r.contextWindow}, prompt ${r.promptMs} ms: ${String(r.answer).slice(0, 80)}`);

    return { ok: true, ...r };
  }

  if (sub === 'download') {
    return modelDownload(inst);
  }

  if (sub === 'clear') {
    return modelClear(inst);
  }

  return refuse('usage: model info|init|download|clear <instance> [--confirm=<model name>]');
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function modelDownload(inst) {
  mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const before = /** @type {Availability} */ (await inTab(inst, AVAILABILITY, { purpose: 'availability' }));
  const diskBefore = diskModels(inst);

  if (before.LanguageModel === 'available') {
    log('OK', 'LanguageModel already available; nothing to download');

    return { ok: true, alreadyAvailable: true, before };
  }

  if (before.LanguageModel !== 'downloadable' && before.LanguageModel !== 'downloading') {
    return { ok: false, reason: `LanguageModel.availability() is ${before.LanguageModel}`, before };
  }

  const roomless = downloadRefusal(freeSpace(inst), inst.model);

  if (roomless !== null) {
    refuse(roomless);
  }

  const broker = await brokerState(inst);

  if (broker.diskInstall?.startsWith('false')) {
    return { ok: false, reason: `Broker State: not enough disk space to install: ${broker.diskInstall}`, before, broker };
  }

  /** @type {EdgeComponent[] | null} */
  let components = null;

  if (inst.modelComponents) {
    components = /** @type {EdgeComponent[]} */ (await inTab(inst, EDGE_COMPONENTS, { url: null, args: { names: inst.modelComponents } }));
    log('INFO', `edge://components: pressed Check for update on ${components.map((c) => `${c.name} (${c.status})`).join(', ')}`);
  }

  // create() needs a trusted user gesture; pointer clicks can time out in an instance, Enter on a focused button still counts.
  const START = `async (p) => {
    await p.evaluate(() => {
      window.__dl = { progress: [], state: 'idle' };
      const btn = document.createElement('button');
      btn.id = 'ai-browsers-download';
      btn.textContent = 'Download model';
      btn.onclick = async () => {
        window.__dl.state = 'creating';
        window.__dl.clickAt = Date.now();
        try {
          const s = await LanguageModel.create({ monitor(m) { m.addEventListener('downloadprogress', (e) => window.__dl.progress.push({ t: Date.now(), pct: Math.round(e.loaded * 1000) / 10 })); } });
          window.__dl.state = 'ready';
          window.__dl.readyAt = Date.now();
          window.__dl.contextWindow = s.contextWindow;
          s.destroy();
        } catch (e) {
          window.__dl.state = 'ERR ' + e.name + ': ' + e.message;
        }
      };
      document.body.append(btn);
    });
    let gesture = 'click';
    await p.click('#ai-browsers-download', { timeout: 5000 }).catch(async () => { gesture = 'Enter'; await p.focus('#ai-browsers-download'); await p.keyboard.press('Enter'); });
    await p.waitForFunction(() => window.__dl.state !== 'idle', null, { timeout: 10000 }).catch(() => {});
    const timeoutMs = ${Number(opts['timeout-min'] ?? 45) * 60000};
    const end = Date.now() + timeoutMs;
    const samples = [];
    while (Date.now() < end) {
      await p.waitForTimeout(5000);
      const s = await p.evaluate(async () => ({ state: window.__dl.state, pct: window.__dl.progress.at(-1)?.pct ?? null, availability: await LanguageModel.availability() }));
      samples.push({ t: Date.now(), ...s });
      if (s.state === 'ready' || s.state.startsWith('ERR') || s.state === 'idle') break;
    }
    return { gesture, ...(await p.evaluate(() => ({ ...window.__dl, progress: undefined, samples: window.__dl.progress.length }))), polls: samples.filter((s, i) => i % 12 === 0 || i === samples.length - 1) };
  }`;
  const t0 = Date.now();
  const run = /** @type {DownloadRun} */ (await inTab(inst, START, { purpose: 'download' }));
  const after = await waitFor(async () => {
    const a = /** @type {Availability} */ (await inTab(inst, AVAILABILITY, { purpose: 'availability' }));

    return a.LanguageModel === 'available' ? a : null;
  }, 120000, 5000);
  const diskAfter = diskModels(inst);
  const added = diskAfter.filter((x) => !diskBefore.some((y) => y.dir === x.dir && y.bytes === x.bytes));
  const durationMs = run.readyAt && run.clickAt ? run.readyAt - run.clickAt : null;
  const ok = run.state === 'ready' && !!after;
  log(ok ? 'OK' : 'ERROR', `download ${run.state} (gesture ${run.gesture}) in ${durationMs ?? Date.now() - t0} ms; new on disk: ${added.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`).join(', ') || 'none'}`);

  return { ok, state: run.state, gesture: run.gesture, durationMs, contextWindow: run.contextWindow, progressEvents: run.samples, polls: run.polls, components, added, diskBefore, diskAfter, availabilityAfter: after };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function modelClear(inst) {
  const confirm = opts['confirm'];

  if (typeof confirm !== 'string') {
    return refuse('model clear needs --confirm=<model name from its manifest.json>, e.g. --confirm=v3Nano');
  }

  if (instanceProcesses(inst).length) {
    refuse(`${inst.name} is running; run "down ${inst.name}" first (files are never deleted under a running browser)`);
  }

  const disk = diskModels(inst);
  const victims = disk.filter((x) => x.name === confirm);

  if (victims.length === 0) {
    refuse(`no model named ${confirm} in ${inst.dir}; installed: ${disk.map((x) => x.name).join(', ') || 'none'}`);
  }

  const profileReal = realpathSync.native(inst.dir);

  for (const v of victims) {
    const real = realpathSync.native(v.dir);

    if (!insideProfile(profileReal, real)) {
      refuse(`${v.dir} resolves to ${real}, outside the profile ${profileReal}; not deleting it`);
    }
  }

  const freeBefore = freeSpace(inst);

  for (const v of victims) {
    rmSync(v.dir, { recursive: true, force: true });
    log('OK', `deleted ${v.dir} (${v.mib} MiB)`);
  }

  const freeAfter = freeSpace(inst);
  log('INFO', `removed ${victims.reduce((s, v) => s + v.bytes, 0)} bytes; free space on ${freeAfter.volume} ${freeBefore.mib} -> ${freeAfter.mib} MiB (ReFS can report freed space late, and other downloads write meanwhile)`);

  return { ok: victims.every((v) => !existsSync(v.dir)), removed: victims, bytesRemoved: victims.reduce((s, v) => s + v.bytes, 0), freeBefore, freeAfter, bytesFreed: freeAfter.bytes - freeBefore.bytes, diskAfter: diskModels(inst) };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdRun(inst) {
  const file = pos[2];

  if (!file || !existsSync(file)) {
    return refuse('usage: run <instance> <script.js> (a file holding "async page => {...}"; it runs in a new tab that is closed afterwards)');
  }

  mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const body = readFileSync(file, 'utf8').trim().replace(/;\s*$/, '');

  return { ok: true, result: await inTab(inst, body, { url: null, purpose: 'run' }) };
}

/**
 * @typedef {object} BenchRecord
 * @property {string} instance
 * @property {string | null | undefined} model
 * @property {string | null} backend
 * @property {Backend | null | undefined} requestedBackend
 * @property {unknown} performanceClass
 * @property {ReturnType<typeof cpuLoad>} cpuBefore
 * @property {ReturnType<typeof cpuLoad>} [cpuAfter]
 * @property {unknown} [result]
 * @property {string} [error]
 * @property {number} [ms]
 */

/** @returns {Promise<Result>} */
async function cmdBench() {
  const names = pos.slice(1).length ? pos.slice(1) : Object.keys(REGISTRY.instances);
  const bench = join(ROOT, 'spikes', 'probes', 'bench.js');
  const fixture = await fetch('http://localhost:4222/', { signal: AbortSignal.timeout(3000) }).then((r) => r.ok, () => false);

  if (!fixture) {
    refuse('bench needs the counter fixture on http://localhost:4222 (bench.js hard-codes it); start it with control-angular-dev-app');
  }

  /** @type {BenchRecord[]} */
  const results = [];

  for (const name of names) {
    const inst = instance(name);
    mainProcess(inst) ?? refuse(`${name} is not running`);
    const info = await modelInfo(inst);
    /** @type {BenchRecord} */
    const record = { instance: name, model: info.serving, backend: info.backend?.backendType ?? null, requestedBackend: info.requestedBackend, performanceClass: info.performanceClass, cpuBefore: cpuLoad() };
    const t0 = Date.now();

    try {
      record.result = await inTab(inst, readFileSync(bench, 'utf8').trim().replace(/;\s*$/, ''), { url: null, purpose: 'bench' });
    } catch (e) {
      record.error = e instanceof Error ? e.message : String(e);
    }

    record.ms = Date.now() - t0;
    const cpuAfter = cpuLoad();
    record.cpuAfter = cpuAfter;
    results.push(record);
    log(record.error ? 'ERROR' : 'OK', `${name}: ${record.model} on ${record.backend}, CPU ${record.cpuBefore.loadPercent}% -> ${cpuAfter.loadPercent}%, ${record.ms} ms${record.error ? `: ${record.error}` : ''}`);

    if (attachedHere === inst) {
      pw(inst, ['detach']);
      attachedHere = null;
    }
  }

  return { ok: results.every((r) => !r.error), results, summarize: 'node spikes/probes/bench-summary.mjs takes bench.js return values; pass each results[i].result' };
}

/**
 * @param {Inst} inst
 * @returns {Promise<Result>}
 */
async function cmdInfo(inst) {
  const st = readState(inst.name);
  const result = { ok: true, instance: inst.name, port: inst.port, cdp: inst.cdp, session: inst.session, profile: inst.dir, statePath: statePath(inst.name), state: st, evidenceDir };
  log('INFO', JSON.stringify(result));

  return result;
}

// ---------- main ----------

/** @type {Record<string, (i: Inst, sub: string | undefined) => Promise<Result>>} */
const COMMANDS = {
  up: (i) => cmdUp(i),
  attach: (i) => cmdAttach(i),
  detach: (i) => cmdDetach(i),
  doctor: (i) => cmdDoctor(i),
  flags: (i) => cmdFlags(i),
  model: (i, sub) => cmdModel(i, sub),
  run: (i) => cmdRun(i),
  down: (i) => cmdDown(i),
  info: (i) => cmdInfo(i),
};

/** @returns {Promise<Result & { cmd: string, instance?: string }>} */
async function main() {
  const cmd = pos[0];

  if (cmd === 'instances' || cmd === 'bench') {
    return { cmd, at: new Date().toISOString(), ...(await (cmd === 'instances' ? cmdInstances() : cmdBench())) };
  }

  const run = cmd !== undefined && Object.hasOwn(COMMANDS, cmd) ? COMMANDS[cmd] : undefined;

  if (cmd === undefined || run === undefined) {
    return refuse('usage: control.mjs <instances|up|attach|detach|doctor|flags|model|run|down|bench|info> ... (see SKILL.md, Helpers)');
  }

  const sub = cmd === 'model' ? pos[1] : undefined;
  const name = cmd === 'model' ? pos[2] : pos[1];

  if (cmd === 'model') {
    pos.splice(1, 1);
  }

  const inst = instance(name);

  return { cmd: [cmd, sub].filter(Boolean).join(' '), instance: inst.name, at: new Date().toISOString(), ...(await run(inst, sub)) };
}

/**
 * @param {{ instance?: string, cmd?: string } & Record<string, unknown>} result
 * @returns {string}
 */
function save(result) {
  mkdirSync(evidenceDir, { recursive: true });
  const file = join(evidenceDir, `${result.instance ?? 'all'}-${(result.cmd ?? 'error').replace(/[^A-Za-z0-9.]+/g, '-').slice(0, 60)}-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(result, null, 2));

  return file;
}

// process.exit() while a socket or child handle is still closing trips a libuv assertion on Windows (seen on up).
/** @param {number} code */
function exitWith(code) {
  process.exitCode = code;
  setTimeout(() => process.exit(code), 10000).unref();
}

function finish() {
  if (attachedHere) {
    pw(attachedHere, ['detach']);
  }
}

// import.meta.url is the real path, so compare real paths: run through a link, the CLI still runs.
if (process.argv[1] && realpathSync.native(resolve(process.argv[1])) === realpathSync.native(fileURLToPath(import.meta.url))) {
  main().then(
    (result) => {
      finish();
      const file = save(result);
      const code = exitCode(result);

      if (opts['json']) {
        console.log(JSON.stringify({ ...result, evidence: file, exit: code }));
      } else {
        console.log(`[${code === 0 ? 'OK' : 'ERROR'}] exit ${code}; evidence ${file}`);
      }

      exitWith(code);
    },
    (err) => {
      finish();
      const refused = err instanceof Refusal;
      const message = err instanceof Error ? err.message : String(err);
      const result = { cmd: pos.join(' '), instance: pos.find((p) => Object.hasOwn(REGISTRY.instances, p)), ok: false, refused, reason: message };
      const file = save(result);

      if (opts['json']) {
        console.log(JSON.stringify({ ...result, evidence: file, exit: EXIT.REFUSED }));
      } else {
        console.log(`[ERROR] ${refused ? 'refused' : 'could not run'}: ${message}\n[ERROR] exit 2; evidence ${file}`);
      }

      exitWith(EXIT.REFUSED);
    },
  );
}
