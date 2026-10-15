#!/usr/bin/env node
// Deterministic control of the per-model browser instances in instances.json, through playwright-cli and raw CDP.
// Usage: node control.mjs <command> [sub] <instance> [--json] [--evidence=<dir>]  (see SKILL.md, Helpers)
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, statfsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(SKILL_DIR, '..', '..', '..');
const TMP = join(ROOT, 'tmp', 'control-ai-browsers');
const REGISTRY = JSON.parse(readFileSync(join(SKILL_DIR, 'instances.json'), 'utf8'));
const PROFILES = resolve(ROOT, REGISTRY.profilesRoot);
const PROBE_ORIGIN = 'https://example.org/';
const STEP_TIMEOUT_MS = 180000;
const EXIT = { OK: 0, UNHEALTHY: 1, REFUSED: 2 };

// ---------- args ----------
const opts = {};
const pos = [];

for (const a of process.argv.slice(2)) {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);

  if (m) {
    opts[m[1]] = m[2] ?? true;
  } else {
    pos.push(a);
  }
}

const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
const evidenceDir = resolve(ROOT, typeof opts.evidence === 'string' ? opts.evidence : join('tmp', 'control-ai-browsers', 'evidence', runId));

class Refusal extends Error {}

function refuse(msg) {
  throw new Refusal(msg);
}

function log(marker, msg) {
  if (!opts.json) {
    console.log(`[${marker}] ${msg}`);
  }
}

// ---------- registry ----------
function instance(name) {
  const i = REGISTRY.instances[name] ?? refuse(`unknown instance "${name}"; known: ${Object.keys(REGISTRY.instances).join(', ')}`);
  const b = REGISTRY.browsers[i.browser];
  const dir = join(PROFILES, name);

  return { name, ...i, ...b, dir, session: `ai-${name}`, cdp: `http://127.0.0.1:${i.port}` };
}

function featuresFor(inst, backend) {
  const extra = inst.backend[backend];

  if (extra === undefined) {
    refuse(`--backend must be gpu or cpu`);
  }

  if (extra === null) {
    refuse(`${inst.name} refuses --backend=${backend}: forcing CPU on Edge deletes the installed model (measured twice); Edge offers WebGPU variants only`);
  }

  return [...inst.features, ...extra];
}

// ---------- processes ----------
function pwshJson(command) {
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', `${command} | ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' });
  const text = (r.stdout ?? '').trim();

  if (!text) {
    return [];
  }

  const v = JSON.parse(text);

  return Array.isArray(v) ? v : [v];
}

const PROC_FIELDS = "Select-Object ProcessId,ExecutablePath,CommandLine,@{n='Created';e={$_.CreationDate.ToString('o')}}";

function parseCommandLine(commandLine) {
  const cl = commandLine ?? '';
  const udd = cl.match(/--user-data-dir=(?:"([^"]+)"|(\S+))/);

  return {
    userDataDir: udd ? (udd[1] ?? udd[2]) : null,
    port: Number(cl.match(/--remote-debugging-port=(\d+)/)?.[1] ?? NaN),
    features: (cl.match(/--enable-features=(?:"([^"]+)"|(\S+))/)?.slice(1).find(Boolean) ?? '').split(',').filter(Boolean),
    args: REGISTRY.commonArgs.filter((a) => cl.includes(a)),
  };
}

const sameDir = (a, b) => !!a && !!b && resolve(a).toLowerCase() === resolve(b).toLowerCase();

// The instance's browser processes are the ones whose --user-data-dir is its profile; Lars's own browsers never match.
function instanceProcesses(inst) {
  const exeName = inst.exe.split('\\').pop();

  return pwshJson(`Get-CimInstance Win32_Process -Filter "Name='${exeName}'" | ${PROC_FIELDS}`).filter((p) => sameDir(parseCommandLine(p.CommandLine).userDataDir, inst.dir));
}

function mainProcess(inst) {
  const main = instanceProcesses(inst).filter((p) => !/--type=/.test(p.CommandLine ?? ''));

  return main.length === 1 ? main[0] : main.length === 0 ? null : refuse(`${main.length} main processes use ${inst.dir}`);
}

function processById(pid) {
  return pwshJson(`Get-CimInstance Win32_Process -Filter "ProcessId=${Number(pid)}" | ${PROC_FIELDS}`)[0] ?? null;
}

function portOwner(port) {
  return pwshJson(`Get-NetTCPConnection -LocalPort ${Number(port)} -State Listen -ErrorAction SilentlyContinue | Select-Object OwningProcess`).map((c) => c.OwningProcess)[0] ?? null;
}

// Which registry backend a command line matches, or null when it matches none (drift).
function drift(inst, proc) {
  const cl = parseCommandLine(proc.CommandLine);
  const have = [...cl.features].sort().join(',');
  const backend = ['gpu', 'cpu'].find((k) => Array.isArray(inst.backend[k]) && [...inst.features, ...inst.backend[k]].sort().join(',') === have) ?? null;
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

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

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

async function cdpJson(inst, path) {
  try {
    const r = await fetch(`${inst.cdp}${path}`, { signal: AbortSignal.timeout(3000) });

    return r.ok ? await r.json() : null;
  } catch {
    return null;
  }
}

async function pageTabs(inst) {
  return ((await cdpJson(inst, '/json/list')) ?? []).filter((t) => t.type === 'page').map((t) => t.url);
}

// ---------- state ----------
function statePath(name) {
  return join(TMP, `state-${name}.json`);
}

function readState(name) {
  return existsSync(statePath(name)) ? JSON.parse(readFileSync(statePath(name), 'utf8')) : null;
}

function writeState(inst, proc) {
  mkdirSync(TMP, { recursive: true });
  const st = { instance: inst.name, pid: proc.ProcessId, created: proc.Created, exe: proc.ExecutablePath, commandLine: proc.CommandLine, port: inst.port, cdp: inst.cdp, session: inst.session, profile: inst.dir, backend: drift(inst, proc).backend, at: new Date().toISOString() };
  writeFileSync(statePath(inst.name), JSON.stringify(st, null, 2));

  return st;
}

// ---------- playwright-cli ----------
let attachedHere = null;

function pw(inst, args, { raw = false, timeoutMs = 120000 } = {}) {
  const full = [...(raw ? ['--raw'] : []), `-s=${inst.session}`, ...args];
  const line = ['playwright-cli', ...full].map((a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
  const r = spawnSync(line, { cwd: ROOT, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs });

  if (r.error?.code === 'ETIMEDOUT') {
    return { code: -1, out: `playwright-cli ${args[0]} timed out after ${timeoutMs} ms; a tab renderer may be hung (see Gotchas)` };
  }

  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

function isAttached(inst) {
  const r = pw(inst, ['tab-list']);

  return r.code === 0 && !/is not open|not connected/i.test(r.out);
}

// Attaches the instance's session when it is not attached; a session this command attached is detached when it ends.
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

// Runs `async (p, args) => {...}` in a tab the command opens and always closes. Tabs carry ?ai-browsers=<purpose>.
async function inTab(inst, body, { args = {}, url = PROBE_ORIGIN, purpose = 'probe' } = {}) {
  const target = url && url.startsWith('https://') ? `${url}${url.includes('?') ? '&' : '?'}ai-browsers=${purpose}` : url;
  const src = `async page => {
  const p = await page.context().newPage();
  try {
    ${target ? `await p.goto(${JSON.stringify(target)});` : ''}
    return await (${body})(p, ${JSON.stringify(args)});
  } finally {
    await p.close().catch(() => {});
  }
}`;

  return runCode(inst, src);
}

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
        calls.push({ name: c.name, callID: c.callID, arguments: c.arguments });
        const result = impl[c.name]?.(c.arguments ?? {});
        return { type: 'tool-response', value: result
          ? new LanguageModelToolSuccess({ callID: c.callID, name: c.name, result: [{ type: 'object', value: result }] })
          : new LanguageModelToolError({ callID: c.callID, name: c.name, errorMessage: 'unknown tool' }) };
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
function readLocalState(inst) {
  const f = join(inst.dir, 'Local State');

  return existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null;
}

function perfClass(inst) {
  return readLocalState(inst)?.optimization_guide?.on_device?.performance_class ?? null;
}

function freeSpace(inst) {
  const st = statfsSync(existsSync(inst.dir) ? inst.dir : PROFILES);
  const bytes = Number(st.bavail) * Number(st.bsize);

  return { bytes, mib: Math.floor(bytes / 1048576), minMib: inst.minFreeMib, volume: inst.dir.slice(0, 2) };
}

function dirSize(dir) {
  let total = 0;

  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    total += e.isDirectory() ? dirSize(f) : statSync(f).size;
  }

  return total;
}

function diskModels(inst) {
  const out = [];
  const visit = (dir, depth) => {
    if (!existsSync(dir) || depth > 3) {
      return;
    }

    const manifest = join(dir, 'manifest.json');

    if (existsSync(manifest)) {
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

function parseBroker(text) {
  const assets = [...text.matchAll(/([a-z0-9_]+) \| (\d{4}\.[\d.]+) \| (Ready|Not Installed|Registering|Background Installing|Foreground Installing|Uninstalling|Unknown) \| (\d+)%/g)].map((m) => ({ name: m[1], version: m[2], state: m[3], progress: Number(m[4]) }));
  const useCases = Object.fromEntries([...text.matchAll(/\| ([a-z][a-z0-9_]+) \| (Available|Not Supported|Pending Usage|Pending Assets|[A-Z][A-Za-z ]+?) (?=\|)/g)].filter((m) => !/^(true|false)$/.test(m[2])).map((m) => [m[1], m[2].trim()]));
  const models = [...text.matchAll(/([a-z0-9_]+) \| ([\d,.]+) \| MiB \| (?:([A-Z]:\\[^|]+?) \| )?(GPU[^|]*?|CPU)(?= \||$)/g)].map((m) => ({ name: m[1], mib: Number(m[2].replace(/,/g, '')), weights: m[3] ?? null, backend: m[4].trim() }));
  const pick = (label) => text.match(new RegExp(`${label} \\| ([^|]+?) \\|`))?.[1] ?? null;

  return { manifestPath: pick('Manifest Path'), manifestLoaded: pick('Manifest Loaded'), perfClass: pick('Performance Class'), diskInstall: pick('Enough disk space to install'), assets, useCases, models };
}

async function brokerState(inst) {
  const text = await inTab(inst, BROKER, { url: null, args: { scheme: inst.scheme } });

  if (text === 'DEBUG-PAGES-DISABLED') {
    return { disabled: true, error: `internal debugging pages are off in ${inst.name}; "launch ${inst.name}" turns them on (chrome://chrome-urls)` };
  }

  return parseBroker(text);
}

// The backend that serves this instance's model: the Broker State model row whose weights sit in the model's folder.
function servingBackend(inst, broker, disk) {
  const mine = disk.filter((d) => d.name === inst.model.name);
  const row = broker.models?.find((m) => m.weights && mine.some((d) => m.weights.toLowerCase().startsWith(d.dir.toLowerCase())));

  return row ? { kind: row.backend.startsWith('GPU') ? 'gpu' : 'cpu', row: row.name, backendType: row.backend, weights: row.weights } : { kind: null, row: null };
}

async function modelInfo(inst) {
  const disk = diskModels(inst);
  const proc = mainProcess(inst);
  const out = { instance: inst.name, expected: inst.model.name, running: !!proc, disk, performanceClass: perfClass(inst), free: freeSpace(inst) };

  if (!proc) {
    return out;
  }

  out.requestedBackend = drift(inst, proc).backend;
  out.broker = await brokerState(inst);

  if (!out.broker.disabled) {
    out.backend = servingBackend(inst, out.broker, disk);
    out.asset = out.broker.assets.find((a) => new RegExp(inst.model.asset).test(a.name)) ?? null;
    out.serving = out.backend.row ? disk.find((d) => out.backend.weights.toLowerCase().startsWith(d.dir.toLowerCase()))?.name ?? null : null;
  }

  return out;
}

function cpuLoad() {
  const load = pwshJson("Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object Average")[0]?.Average ?? null;
  const top = pwshJson("Get-CimInstance Win32_PerfFormattedData_PerfProc_Process | Where-Object { $_.Name -notin '_Total','Idle' } | Sort-Object PercentProcessorTime -Descending | Select-Object -First 5 Name,PercentProcessorTime");

  return { at: new Date().toISOString(), loadPercent: load, top: top.map((p) => `${p.Name} ${p.PercentProcessorTime}%`) };
}

// ---------- commands ----------
async function cmdInstances() {
  const rows = [];

  for (const name of Object.keys(REGISTRY.instances)) {
    const inst = instance(name);
    const proc = mainProcess(inst);
    const d = proc ? drift(inst, proc) : null;
    const tabs = proc ? await pageTabs(inst) : [];
    const row = { name, browser: inst.browser, port: inst.port, model: inst.model.name, defaultBackend: inst.backend.default, profileExists: existsSync(inst.dir), pid: proc?.ProcessId ?? null, backend: d?.backend ?? null, drift: d?.problems ?? null, tabs: tabs.length, stateFile: existsSync(statePath(name)) };
    rows.push(row);
    log(proc ? (d.problems.length ? 'WARN' : 'OK') : 'INFO', `${name} :${inst.port} ${inst.model.name}: ${proc ? `PID ${proc.ProcessId}, backend ${d.backend ?? '?'}${d.problems.length ? `, drift: ${d.problems.join('; ')}` : ''}, ${tabs.length} tab(s)` : 'stopped'}`);
  }

  return { ok: true, instances: rows };
}

async function cmdLaunch(inst) {
  const backend = typeof opts.backend === 'string' ? opts.backend : inst.backend.default;
  const features = featuresFor(inst, backend);
  const running = mainProcess(inst);

  if (running) {
    const d = drift(inst, running);

    if (d.backend === backend && d.problems.length === 0) {
      log('OK', `${inst.name} already runs as PID ${running.ProcessId} with backend ${backend}`);

      return { ok: true, alreadyRunning: true, state: writeState(inst, running) };
    }

    refuse(`${inst.name} runs as PID ${running.ProcessId} with ${d.backend ?? 'a drifted'} configuration (${d.problems.join('; ') || `backend ${d.backend}`}); run "stop ${inst.name}" first`);
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

  const args = [`--user-data-dir=${inst.dir}`, `--remote-debugging-port=${inst.port}`, ...REGISTRY.commonArgs, `--enable-features=${features.join(',')}`, 'about:blank'];
  const t0 = Date.now();
  spawn(inst.exe, args, { detached: true, stdio: 'ignore' }).unref();
  const version = await waitFor(() => cdpJson(inst, '/json/version'), 60000, 500);

  if (!version) {
    refuse(`${inst.name} did not answer on ${inst.cdp}/json/version within 60 s`);
  }

  const proc = await waitFor(() => mainProcess(inst), 10000, 500);
  const st = writeState(inst, proc);
  const readyMs = Date.now() - t0;

  // Edge restores the last session's tabs; leave the instance on the one blank tab it was started with.
  await sleep(2000);
  const pages = ((await cdpJson(inst, '/json/list')) ?? []).filter((t) => t.type === 'page');
  const keep = pages.find((t) => t.url === 'about:blank') ?? pages[0];
  const restored = pages.filter((t) => t !== keep);

  for (const t of restored) {
    await fetch(`${inst.cdp}/json/close/${t.id}`).catch(() => {});
  }
  let debugPages = null;

  if (inst.scheme === 'chrome') {
    debugPages = await inTab(inst, ENABLE_DEBUG_PAGES, { url: null });
  }

  log('OK', `${inst.name} launched as PID ${proc.ProcessId} on ${inst.cdp} (${version.Browser}), backend ${backend}, ready in ${readyMs} ms${firstUse ? ', new profile' : ''}${restored.length ? `; closed ${restored.length} restored tab(s)` : ''}${debugPages ? `; internal debugging pages ${debugPages}` : ''}`);

  return { ok: true, backend, firstUse, readyMs, browserVersion: version.Browser, closedRestoredTabs: restored.map((t) => t.url), debugPages, state: st, tabs: await pageTabs(inst) };
}

async function cmdAttach(inst) {
  const proc = mainProcess(inst) ?? refuse(`${inst.name} is not running; run "launch ${inst.name}"`);
  const st = writeState(inst, proc);
  await ensureAttached(inst);
  attachedHere = null;
  log('OK', `${inst.session} attached to ${inst.name} PID ${proc.ProcessId}; it stays attached for ad hoc playwright-cli commands until "detach ${inst.name}" or "stop ${inst.name}"`);

  return { ok: true, state: st };
}

async function cmdDetach(inst) {
  pw(inst, ['detach']);
  log('OK', `${inst.session} detached; ${inst.name} left running`);

  return { ok: true };
}

async function cmdStop(inst) {
  const st = readState(inst.name) ?? refuse(`no state file at ${statePath(inst.name)}; run "attach ${inst.name}" or "launch ${inst.name}" first`);
  const live = processById(st.pid);

  if (!live) {
    rmSync(statePath(inst.name), { force: true });
    log('OK', `PID ${st.pid} is not running any more; removed the state file`);

    return { ok: true, alreadyStopped: true, pid: st.pid };
  }

  if (live.ExecutablePath !== st.exe || live.CommandLine !== st.commandLine) {
    refuse(`PID ${st.pid} command line mismatch: running "${live.ExecutablePath}" ${String(live.CommandLine).slice(0, 120)}, recorded ${st.exe}`);
  }

  if (live.Created !== st.created) {
    refuse(`PID ${st.pid} start-time mismatch: live ${live.Created}, recorded ${st.created}`);
  }

  if (portOwner(inst.port) !== st.pid) {
    refuse(`port ${inst.port} is not owned by PID ${st.pid}; not sending Browser.close to it`);
  }

  pw(inst, ['detach']);
  const version = (await cdpJson(inst, '/json/version')) ?? refuse(`${inst.cdp} does not answer`);
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

async function cmdFlags(inst) {
  const proc = mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const page = parseCommandLine(await inTab(inst, VERSION_CMDLINE, { url: null, args: { scheme: inst.scheme } }));
  const d = drift(inst, proc);
  const want = d.backend ? featuresFor(inst, d.backend) : inst.features;
  const missing = want.filter((f) => !page.features.includes(f));
  const extra = page.features.filter((f) => !want.includes(f));
  const ok = d.problems.length === 0 && missing.length === 0 && extra.length === 0;
  log(ok ? 'OK' : 'ERROR', `${inst.scheme}://version features (${d.backend ?? 'no matching'} backend): ${page.features.join(', ')}${missing.length ? `; missing ${missing.join(', ')}` : ''}${extra.length ? `; not in registry ${extra.join(', ')}` : ''}${d.problems.length ? `; drift: ${d.problems.join('; ')}` : ''}`);

  return { ok, backend: d.backend, effective: page.features, registry: want, missing, extra, drift: d.problems };
}

async function cmdDoctor(inst) {
  const checks = [];
  const add = (id, pass, detail, warn = false) => {
    checks.push({ id, pass, warn, detail });
    log(pass === null ? 'SKIP' : !pass ? 'ERROR' : warn ? 'WARN' : 'OK', `${id}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  };

  const proc = mainProcess(inst);
  add('process', !!proc, proc ? `PID ${proc.ProcessId} ${proc.ExecutablePath} --user-data-dir=${inst.dir}` : `no process uses ${inst.dir}`);

  if (!proc) {
    return { ok: false, couldNotRun: true, checks };
  }

  const d = drift(inst, proc);
  add('commandLine', d.problems.length === 0, d.problems.length ? { drift: d.problems } : `matches the registry, backend ${d.backend}`);

  const version = await cdpJson(inst, '/json/version');
  const owner = portOwner(inst.port);
  add('port', !!version && new RegExp(inst.product).test(version.Browser) && owner === proc.ProcessId, { cdp: inst.cdp, browser: version?.Browser ?? 'no answer', owner });

  const tabs = await pageTabs(inst);
  add('tabs', true, { count: tabs.length, urls: tabs }, tabs.length > 1);

  const disk = diskModels(inst);
  const hit = disk.find((x) => x.name === inst.model.name);
  add('model.disk', !!hit, hit ? `${hit.name} ${hit.modelVersion} (${hit.mib} MiB) at ${hit.dir}` : { expected: inst.model.name, found: disk.map((x) => x.name) });
  const others = disk.filter((x) => x.name !== inst.model.name);

  if (others.length) {
    checks.at(-1).warn = true;
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

  const avail = await inTab(inst, AVAILABILITY, { purpose: 'availability' });
  add('api.availability', avail.LanguageModel === 'available', avail);

  // create() on a model that is not available waits for (and can start) a download; doctor stays read-only.
  if (avail.LanguageModel !== 'available') {
    for (const id of ['model.contextWindow', 'canary.structured', 'canary.tools', 'canary.webmcp']) {
      add(id, null, `skipped: LanguageModel is ${avail.LanguageModel}; run "model download ${inst.name}"`);
    }

    return { ok: false, backend: d.backend, checks };
  }

  const canary = await inTab(inst, CANARY, { purpose: 'canary', args: { toolCanary: inst.model.toolCanary } });
  add('model.contextWindow', canary.contextWindow === inst.model.contextWindow, `contextWindow ${canary.contextWindow}, expected ${inst.model.contextWindow}`);
  add('canary.structured', canary.structured?.pass === true, canary.structured);
  // "report": the model's native tool calling is too unreliable to gate health on (Phi-4-mini); the result is kept.
  add('canary.tools', inst.model.toolCanary === 'report' ? null : canary.tools?.pass ?? null, inst.model.toolCanary === 'report' ? { reportedOnly: true, ...canary.tools } : canary.tools);
  add('canary.webmcp', canary.webmcp?.pass === true, canary.webmcp);

  return { ok: checks.every((c) => c.pass !== false), backend: d.backend, checks };
}

async function cmdModel(inst, sub) {
  if (sub === 'info') {
    const info = await modelInfo(inst);

    for (const x of info.disk) {
      log('INFO', `disk: ${x.name} ${x.modelVersion} component ${x.componentVersion} hints ${JSON.stringify(x.performanceHints)} ${x.mib} MiB ${x.dir}`);
    }

    if (info.broker?.assets) {
      for (const a of info.broker.assets.filter((a) => a.state !== 'Not Installed')) {
        log('INFO', `broker asset: ${a.name} ${a.version} ${a.state} ${a.progress}%`);
      }

      log('INFO', `serving ${info.serving ?? 'none'}; backend ${info.backend.backendType ?? '?'} (requested ${info.requestedBackend}); performance class ${info.performanceClass} (Broker State ${info.broker.perfClass})`);
    } else {
      log('INFO', info.running ? info.broker.error : `${inst.name} is stopped; disk only. performance class ${info.performanceClass}`);
    }

    return { ok: true, ...info };
  }

  if (sub === 'init') {
    mainProcess(inst) ?? refuse(`${inst.name} is not running`);
    const r = await inTab(inst, INIT, { purpose: 'init' });
    log('OK', `first create ${r.firstCreateMs} ms, second create ${r.secondCreateMs} ms, contextWindow ${r.contextWindow}, prompt ${r.promptMs} ms: ${String(r.answer).slice(0, 80)}`);

    return { ok: true, ...r };
  }

  if (sub === 'download') {
    return modelDownload(inst);
  }

  if (sub === 'clear') {
    return modelClear(inst);
  }

  refuse('usage: model info|init|download|clear <instance> [--confirm=<model name>]');
}

async function modelDownload(inst) {
  mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const before = await inTab(inst, AVAILABILITY, { purpose: 'availability' });
  const diskBefore = diskModels(inst);

  if (before.LanguageModel === 'available') {
    log('OK', 'LanguageModel already available; nothing to download');

    return { ok: true, alreadyAvailable: true, before };
  }

  if (before.LanguageModel !== 'downloadable' && before.LanguageModel !== 'downloading') {
    return { ok: false, reason: `LanguageModel.availability() is ${before.LanguageModel}`, before };
  }

  const free = freeSpace(inst);

  if (free.mib - inst.model.downloadMib < free.minMib) {
    refuse(`download refused: ${free.mib} MiB free on ${free.volume} minus about ${inst.model.downloadMib} MiB for ${inst.model.name} leaves ${free.mib - inst.model.downloadMib} MiB, under the browser minimum of ${free.minMib} MiB`);
  }

  const broker = await brokerState(inst);

  if (broker.diskInstall?.startsWith('false')) {
    return { ok: false, reason: `Broker State: not enough disk space to install: ${broker.diskInstall}`, before, broker };
  }

  let components = null;

  if (inst.modelComponents) {
    components = await inTab(inst, EDGE_COMPONENTS, { url: null, args: { names: inst.modelComponents } });
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
  const run = await inTab(inst, START, { purpose: 'download' });
  const after = await waitFor(async () => {
    const a = await inTab(inst, AVAILABILITY, { purpose: 'availability' });

    return a.LanguageModel === 'available' ? a : null;
  }, 120000, 5000);
  const diskAfter = diskModels(inst);
  const added = diskAfter.filter((x) => !diskBefore.some((y) => y.dir === x.dir && y.bytes === x.bytes));
  const durationMs = run.readyAt && run.clickAt ? run.readyAt - run.clickAt : null;
  const ok = run.state === 'ready' && !!after;
  log(ok ? 'OK' : 'ERROR', `download ${run.state} (gesture ${run.gesture}) in ${durationMs ?? Date.now() - t0} ms; new on disk: ${added.map((x) => `${x.name} ${x.componentVersion} ${x.mib} MiB`).join(', ') || 'none'}`);

  return { ok, state: run.state, gesture: run.gesture, durationMs, contextWindow: run.contextWindow, progressEvents: run.samples, polls: run.polls, components, added, diskBefore, diskAfter, availabilityAfter: after };
}

async function modelClear(inst) {
  const confirm = opts.confirm;

  if (typeof confirm !== 'string') {
    refuse('model clear needs --confirm=<model name from its manifest.json>, e.g. --confirm=v3Nano');
  }

  if (instanceProcesses(inst).length) {
    refuse(`${inst.name} is running; run "stop ${inst.name}" first (files are never deleted under a running browser)`);
  }

  const disk = diskModels(inst);
  const victims = disk.filter((x) => x.name === confirm);

  if (victims.length === 0) {
    refuse(`no model named ${confirm} in ${inst.dir}; installed: ${disk.map((x) => x.name).join(', ') || 'none'}`);
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

async function cmdRun(inst) {
  const file = pos[2];

  if (!file || !existsSync(file)) {
    refuse('usage: run <instance> <script.js> (a file holding "async page => {...}"; it runs in a new tab that is closed afterwards)');
  }

  mainProcess(inst) ?? refuse(`${inst.name} is not running`);
  const body = readFileSync(file, 'utf8').trim().replace(/;\s*$/, '');

  return { ok: true, result: await inTab(inst, body, { url: null, purpose: 'run' }) };
}

async function cmdBench() {
  const names = pos.slice(1).length ? pos.slice(1) : Object.keys(REGISTRY.instances);
  const bench = join(ROOT, 'spikes', 'probes', 'bench.js');
  const fixture = await fetch('http://localhost:4222/', { signal: AbortSignal.timeout(3000) }).then((r) => r.ok, () => false);

  if (!fixture) {
    refuse('bench needs the counter fixture on http://localhost:4222 (bench.js hard-codes it); start it with control-angular-dev-app');
  }

  const results = [];

  for (const name of names) {
    const inst = instance(name);
    mainProcess(inst) ?? refuse(`${name} is not running`);
    const info = await modelInfo(inst);
    const record = { instance: name, model: info.serving, backend: info.backend?.backendType ?? null, requestedBackend: info.requestedBackend, performanceClass: info.performanceClass, cpuBefore: cpuLoad() };
    const t0 = Date.now();

    try {
      record.result = await inTab(inst, readFileSync(bench, 'utf8').trim().replace(/;\s*$/, ''), { url: null, purpose: 'bench' });
    } catch (e) {
      record.error = e.message;
    }

    record.ms = Date.now() - t0;
    record.cpuAfter = cpuLoad();
    results.push(record);
    log(record.error ? 'ERROR' : 'OK', `${name}: ${record.model} on ${record.backend}, CPU ${record.cpuBefore.loadPercent}% -> ${record.cpuAfter.loadPercent}%, ${record.ms} ms${record.error ? `: ${record.error}` : ''}`);

    if (attachedHere === inst) {
      pw(inst, ['detach']);
      attachedHere = null;
    }
  }

  return { ok: results.every((r) => !r.error), results, summarize: 'node spikes/probes/bench-summary.mjs takes bench.js return values; pass each results[i].result' };
}

async function cmdInfo(inst) {
  const st = readState(inst.name);
  const result = { ok: true, instance: inst.name, port: inst.port, cdp: inst.cdp, session: inst.session, profile: inst.dir, statePath: statePath(inst.name), state: st, evidenceDir };
  log('INFO', JSON.stringify(result));

  return result;
}

// ---------- main ----------
const COMMANDS = {
  instances: () => cmdInstances(),
  launch: (i) => cmdLaunch(i),
  up: (i) => cmdLaunch(i),
  attach: (i) => cmdAttach(i),
  detach: (i) => cmdDetach(i),
  doctor: (i) => cmdDoctor(i),
  flags: (i) => cmdFlags(i),
  model: (i, sub) => cmdModel(i, sub),
  run: (i) => cmdRun(i),
  stop: (i) => cmdStop(i),
  down: (i) => cmdStop(i),
  bench: () => cmdBench(),
  info: (i) => cmdInfo(i),
};

async function main() {
  const cmd = pos[0];

  if (!cmd || !(cmd in COMMANDS)) {
    refuse(`usage: control.mjs <${Object.keys(COMMANDS).join('|')}> ... (see SKILL.md, Helpers)`);
  }

  if (cmd === 'instances' || cmd === 'bench') {
    return { cmd, at: new Date().toISOString(), ...(await COMMANDS[cmd]()) };
  }

  const sub = cmd === 'model' ? pos[1] : undefined;
  const name = cmd === 'model' ? pos[2] : pos[1];

  if (cmd === 'model') {
    pos.splice(1, 1);
  }

  const inst = instance(name);

  return { cmd: [cmd, sub].filter(Boolean).join(' '), instance: inst.name, at: new Date().toISOString(), ...(await COMMANDS[cmd](inst, sub)) };
}

function save(result) {
  mkdirSync(evidenceDir, { recursive: true });
  const file = join(evidenceDir, `${result.instance ?? 'all'}-${(result.cmd ?? 'error').replace(/[^A-Za-z0-9.]+/g, '-').slice(0, 60)}-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(result, null, 2));

  return file;
}

// process.exit() while a socket or child handle is still closing trips a libuv assertion on Windows (seen on launch).
function exitWith(code) {
  process.exitCode = code;
  setTimeout(() => process.exit(code), 10000).unref();
}

function finish() {
  if (attachedHere) {
    pw(attachedHere, ['detach']);
  }
}

main().then(
  (result) => {
    finish();
    const file = save(result);
    const code = result.couldNotRun ? EXIT.REFUSED : result.ok ? EXIT.OK : EXIT.UNHEALTHY;

    if (opts.json) {
      console.log(JSON.stringify({ ...result, evidence: file, exit: code }));
    } else {
      console.log(`[${code === 0 ? 'OK' : 'ERROR'}] exit ${code}; evidence ${file}`);
    }

    exitWith(code);
  },
  (err) => {
    finish();
    const refused = err instanceof Refusal;
    const result = { cmd: pos.join(' '), instance: pos.find((p) => p in REGISTRY.instances), ok: false, refused, reason: err.message };
    const file = save(result);

    if (opts.json) {
      console.log(JSON.stringify({ ...result, evidence: file, exit: EXIT.REFUSED }));
    } else {
      console.log(`[ERROR] ${refused ? 'refused' : 'could not run'}: ${err.message}\n[ERROR] exit 2; evidence ${file}`);
    }

    exitWith(EXIT.REFUSED);
  },
);
