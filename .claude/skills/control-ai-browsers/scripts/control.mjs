#!/usr/bin/env node
// Deterministic control of Chrome Beta and Edge Dev built-in AI through playwright-cli.
// Usage: node control.mjs <command> [sub] --browser=chrome-beta|msedge-dev [--json] [--evidence=<dir>]
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statfsSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(SKILL_DIR, '..', '..', '..');
const TMP = join(ROOT, 'tmp', 'control-ai-browsers');
const LOCAL = process.env.LOCALAPPDATA;

const BROWSERS = {
  'chrome-beta': {
    session: 'ai-cb',
    cdp: 'chrome-beta',
    scheme: 'chrome',
    exe: 'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe',
    userData: join(LOCAL, 'Google', 'Chrome Beta', 'User Data'),
    modelRoots: ['OptGuideManifestModel', 'OptGuideOnDeviceModel'],
    baseFlags: ['enable-webmcp-testing@1', 'prompt-api-multimodal-input@1', 'prompt-api@1', 'rewriter-api@1', 'summarizer-api@1', 'writer-api@1'],
    minFreeMib: 22 * 1024,
    home: 'gemma4',
    profiles: {
      gemma4: { flags: { 'gemma4-for-built-in-ai': 'Enabled', 'prompt-api-tool-use': 'Enabled' }, model: /^gemma4-/, asset: 'gemma4_component', useCase: 'prompt_api_gemma4', contextWindow: 9216, toolUse: true, downloadMib: 2374 },
      nano: { flags: { 'gemma4-for-built-in-ai': 'Default', 'prompt-api-tool-use': 'Default' }, model: /^v3Nano$/, asset: 'nano_v3_gpu_component', useCase: 'prompt_api', releaseUseCases: ['prompt_api', 'summarizer_api', 'writing_assistance_api'], contextWindow: 9216, toolUse: false, downloadMib: 4072 },
    },
  },
  'msedge-dev': {
    session: 'ai-ed',
    cdp: 'msedge-dev',
    scheme: 'edge',
    exe: 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe',
    userData: join(LOCAL, 'Microsoft', 'Edge Dev', 'User Data'),
    modelRoots: ['EdgeLLMOnDeviceModel'],
    baseFlags: [
      'edge-llm-on-device-model-prerelease-tool-use-workaround@1',
      'edge-llm-prompt-api-for-default@1',
      'edge-llm-prompt-api-tool-use@1',
      'edge-llm-rewriter-api-for-default@1',
      'edge-llm-summarization-api-for-default@1',
      'edge-llm-writer-api-for-default@1',
      'enable-webmcp-testing@1',
    ],
    minFreeMib: 20 * 1024,
    home: 'aion',
    profiles: {
      aion: { flags: { 'edge-llm-on-device-model-prerelease': 'Enabled' }, model: /^Aion-/, asset: 'edge_base_model', useCase: 'prompt_api', contextWindow: 7168, toolUse: true, downloadMib: 1248 },
      default: { flags: { 'edge-llm-on-device-model-prerelease': 'Default' }, model: /phi-?4-?mini/i, asset: 'edge_base_model', useCase: 'prompt_api', contextWindow: null, toolUse: true, downloadMib: 4096 },
    },
  },
};
const PROBE_ORIGIN = 'https://example.org/';
const HOME_URL = `${PROBE_ORIGIN}?ai-browsers=home`;
const STEP_TIMEOUT_MS = 180000;
const PROTECTED_MODELS = ['gemma4-2b-it', 'Aion-1.1-Instruct'];
const EXIT = { OK: 0, UNHEALTHY: 1, REFUSED: 2 };

// ---------- args ----------
const argv = process.argv.slice(2);
const opts = {};
const pos = [];

for (const a of argv) {
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

// ---------- processes ----------
function pwshJson(command) {
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', `${command} | ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' });
  const text = r.stdout.trim();

  if (!text) {
    return [];
  }

  const v = JSON.parse(text);

  return Array.isArray(v) ? v : [v];
}

const PROC_FIELDS = "Select-Object ProcessId,ExecutablePath,CommandLine,@{n='Created';e={$_.CreationDate.ToString('o')}}";

function mainProcesses(b) {
  const name = b.exe.split('\\').pop();

  return pwshJson(`Get-CimInstance Win32_Process -Filter "Name='${name}'" | Where-Object { $_.ExecutablePath -eq '${b.exe}' -and $_.CommandLine -notmatch '--type=' } | ${PROC_FIELDS}`);
}

function processById(pid) {
  return pwshJson(`Get-CimInstance Win32_Process -Filter "ProcessId=${Number(pid)}" | ${PROC_FIELDS}`)[0] ?? null;
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

function startBrowser(b) {
  spawn(b.exe, ['--restore-last-session'], { detached: true, stdio: 'ignore' }).unref();
}

// ---------- state ----------
function statePath(name) {
  return join(TMP, `state-${name}.json`);
}

function readState(name) {
  return existsSync(statePath(name)) ? JSON.parse(readFileSync(statePath(name), 'utf8')) : null;
}

function writeState(name, b, proc) {
  mkdirSync(TMP, { recursive: true });
  writeFileSync(statePath(name), JSON.stringify({ browser: name, session: b.session, pid: proc.ProcessId, created: proc.Created, exe: proc.ExecutablePath, commandLine: proc.CommandLine, attachedAt: new Date().toISOString() }, null, 2));
}

// The recorded PID must still be this browser's main process: same exe, same start time.
function verifyState(name, b) {
  const st = readState(name);

  if (!st) {
    refuse(`no state file at ${statePath(name)}; run "attach --browser=${name}" first`);
  }

  const live = processById(st.pid);

  if (!live) {
    return { st, live: null };
  }

  if (live.ExecutablePath !== b.exe || /--type=/.test(live.CommandLine ?? '')) {
    refuse(`PID ${st.pid} command line mismatch: running "${live.ExecutablePath}", expected the ${name} main process "${b.exe}"`);
  }

  if (live.Created !== st.created) {
    refuse(`PID ${st.pid} start-time mismatch: live ${live.Created}, recorded ${st.created}`);
  }

  return { st, live };
}

// ---------- playwright-cli ----------
function pw(b, args, { raw = false, timeoutMs = 120000 } = {}) {
  const full = [...(raw ? ['--raw'] : []), `-s=${b.session}`, ...args];
  const line = ['playwright-cli', ...full].map((a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' ');
  const r = spawnSync(line, { cwd: ROOT, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024, timeout: timeoutMs });

  if (r.error?.code === 'ETIMEDOUT') {
    return { code: -1, out: `playwright-cli ${args[0]} timed out after ${timeoutMs} ms; a tab renderer may be hung (see Gotchas)` };
  }

  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

function isAttached(b) {
  const r = pw(b, ['tab-list']);

  return r.code === 0 && !/is not open/.test(r.out);
}

async function ensureAttached(b) {
  if (isAttached(b)) {
    ensureHome(b);

    return;
  }

  const ok = await waitFor(() => {
    const r = pw(b, ['attach', `--cdp=${b.cdp}`]);

    return r.code === 0 && /attached to/.test(r.out);
  }, 30000, 2000);

  if (!ok) {
    refuse(`playwright-cli could not attach to ${b.cdp}; check that remote debugging is allowed at ${b.scheme}://inspect/#remote-debugging (Lars approves this)`);
  }

  ensureHome(b);
}

// run-code acts on the session's current tab, and hangs when that tab's renderer is busy. Keep the skill's own
// home tab current, on an origin Lars's tabs do not use, so a hung probe never blocks his tabs or the next command.
function ensureHome(b) {
  const list = pw(b, ['tab-list']).out.replace(/\r/g, '');
  const tabs = [...list.matchAll(/^- (\d+): (\(current\) )?\[.*?\]\((.*)\)$/gm)].map((m) => ({ i: Number(m[1]), current: !!m[2], url: m[3] }));
  const home = tabs.find((t) => t.url.includes('ai-browsers=home'));

  if (!home) {
    pw(b, ['tab-new', HOME_URL]);
  } else if (!home.current) {
    pw(b, ['tab-select', String(home.i)]);
  }
}

// Runs `async (p, args) => {...}` in a tab the skill opens and closes. Tabs carry ?ai-browsers=<purpose> so cleanup finds them.
async function inTab(b, body, { args = {}, url = PROBE_ORIGIN, purpose = 'probe', keep = false } = {}) {
  const target = url && url.startsWith('https://') ? `${url}${url.includes('?') ? '&' : '?'}ai-browsers=${purpose}` : url;
  const src = `async page => {
  const p = await page.context().newPage();
  let done = false;
  try {
    ${target ? `await p.goto(${JSON.stringify(target)});` : ''}
    const r = await (${body})(p, ${JSON.stringify(args)});
    done = true;
    return r;
  } finally {
    if (!${keep} || !done) await p.close().catch(() => {});
  }
}`;

  return runCode(b, src);
}

async function runCode(b, src) {
  await ensureAttached(b);
  mkdirSync(join(TMP, 'run'), { recursive: true });
  const file = join(TMP, 'run', `${b.session}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.js`);
  writeFileSync(file, src);
  const r = pw(b, ['run-code', `--filename=${file}`], { raw: true, timeoutMs: Number(opts['timeout-min'] ?? 15) * 60000 });
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

const FLAGS_READ = `async (p, { scheme, ids }) => {
  await p.goto(scheme + '://flags');
  await p.waitForFunction(() => document.querySelector('flags-app')?.shadowRoot?.querySelector('flags-experiment'));
  return await p.evaluate((ids) => {
    const root = document.querySelector('flags-app').shadowRoot;
    return Object.fromEntries(ids.map((id) => {
      const e = root.querySelector('flags-experiment#' + CSS.escape(id));
      const sel = e && (e.shadowRoot || e).querySelector('select');
      return [id, sel ? sel.value.trim() : (e ? 'no-select' : 'not-found')];
    }));
  }, ids);
}`;

const FLAGS_SET = `async (p, { scheme, values }) => {
  await p.goto(scheme + '://flags');
  await p.waitForFunction(() => document.querySelector('flags-app')?.shadowRoot?.querySelector('flags-experiment'));
  const applied = await p.evaluate((values) => {
    const root = document.querySelector('flags-app').shadowRoot;
    const out = {};
    for (const [id, want] of Object.entries(values)) {
      const e = root.querySelector('flags-experiment#' + CSS.escape(id));
      const sel = e && (e.shadowRoot || e).querySelector('select');
      if (!sel) { out[id] = 'not-found'; continue; }
      const opt = [...sel.options].find((o) => o.value.trim() === want || o.textContent.trim() === want);
      if (!opt) { out[id] = 'no-option:' + want; continue; }
      sel.value = opt.value;
      sel.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      out[id] = 'set';
    }
    return out;
  }, values);
  await p.waitForTimeout(500);
  await p.reload();
  await p.waitForFunction(() => document.querySelector('flags-app')?.shadowRoot?.querySelector('flags-experiment'));
  const readBack = await p.evaluate((ids) => {
    const root = document.querySelector('flags-app').shadowRoot;
    return Object.fromEntries(ids.map((id) => {
      const e = root.querySelector('flags-experiment#' + CSS.escape(id));
      const sel = e && (e.shadowRoot || e).querySelector('select');
      return [id, sel ? sel.value.trim() : 'not-found'];
    }));
  }, Object.keys(values));
  return { applied, readBack };
}`;

const BROKER = `async (p, { scheme }) => {
  await p.goto(scheme + '://on-device-internals');
  await p.locator('[role=tab]').nth(2).click({ force: true });
  let text = '';
  for (let i = 0; i < 30; i++) {
    text = await p.evaluate(${DEEP_TEXT});
    if (text.includes('Manifest Path')) break;
    await p.waitForTimeout(1000);
  }
  return text;
}`;

const UNREQUEST = `async (p, { scheme, useCases }) => {
  await p.goto(scheme + '://on-device-internals');
  await p.locator('[role=tab]').nth(2).click({ force: true });
  await p.getByText('Manifest Path').waitFor({ state: 'attached', timeout: 30000 });
  await p.waitForTimeout(500);
  const done = [];
  for (const uc of useCases) {
    const box = p.locator('input[type=checkbox][data-use-case="' + uc + '"]');
    if (await box.count() && await box.isChecked()) { await box.click({ force: true }); await p.waitForTimeout(500); done.push(uc); }
  }
  return done;
}`;

const AVAILABILITY = `async (p) => {
  const w = p.evaluate(async () => {
    const o = {};
    const check = async (name, fn) => { try { o[name] = await fn(); } catch (e) { o[name] = 'ERR ' + e.name + ': ' + e.message; } };
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
  });
  return await w;
}`;

const CANARY = `async (p, { toolUse }) => p.evaluate(async ([toolUse, ms]) => {
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
  if (!toolUse) { o.tools = { pass: null, skipped: 'tool use not enabled in this profile' }; }
  else try {
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
    o.tools = { pass: calls.some((c) => c.name === 'get_component_count') && /\\b(42|forty-two)\\b/i.test(answer ?? ''), calls, answer, ms: Math.round(performance.now() - t), contextUsage: s.contextUsage };
    s.destroy();
  } catch (e) {
    o.tools = { pass: false, error: e.name + ': ' + e.message };
  }
  o.webmcp = { pass: typeof document.modelContext === 'object', documentModelContext: typeof document.modelContext };
  return o;
}, [toolUse, ${STEP_TIMEOUT_MS}])`;

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

// ---------- readers ----------
function localStateFlags(b) {
  const st = JSON.parse(readFileSync(join(b.userData, 'Local State'), 'utf8'));

  return (st.browser?.enabled_labs_experiments ?? []).slice().sort();
}

function freeSpace(b) {
  const st = statfsSync(b.userData);
  const bytes = Number(st.bavail) * Number(st.bsize);

  return { bytes, mib: Math.floor(bytes / 1048576), minMib: b.minFreeMib, volume: b.userData.slice(0, 2) };
}

function dirSize(dir) {
  let total = 0;

  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const f = join(dir, e.name);
    total += e.isDirectory() ? dirSize(f) : statSync(f).size;
  }

  return total;
}

function diskModels(b) {
  const out = [];
  const visit = (dir, depth) => {
    if (!existsSync(dir) || depth > 3) {
      return;
    }

    const manifest = join(dir, 'manifest.json');

    if (existsSync(manifest)) {
      const m = JSON.parse(readFileSync(manifest, 'utf8'));
      const bytes = dirSize(dir);
      out.push({ name: m.BaseModelSpec?.name ?? m.name, modelVersion: m.BaseModelSpec?.version, componentVersion: m.version, dir, bytes, mib: Math.round(bytes / 1048576) });

      return;
    }

    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.isDirectory()) {
        visit(join(dir, e.name), depth + 1);
      }
    }
  };

  for (const r of b.modelRoots) {
    visit(join(b.userData, r), 0);
  }

  return out;
}

function parseBroker(text) {
  const assets = [...text.matchAll(/([a-z0-9_]+) \| (\d{4}\.[\d.]+) \| (Ready|Not Installed|Registering|Background Installing|Foreground Installing|Uninstalling|Unknown) \| (\d+)%/g)].map((m) => ({ name: m[1], version: m[2], state: m[3], progress: Number(m[4]) }));
  const useCases = Object.fromEntries([...text.matchAll(/\| (prompt_api(?:_[a-z0-9]+)?|summarizer_api(?:_[a-z0-9]+)?|writing_assistance_api(?:_[a-z0-9]+)?|proofreader_api) \| ([A-Z][A-Za-z ]+?) (?=\|)/g)].map((m) => [m[1], m[2].trim()]));
  const models = [...text.matchAll(/([a-z0-9_]+) \| ([\d,.]+) \| MiB \| (?:([A-Z]:\\[^|]+?) \| )?(GPU[^|]*?|CPU)(?= \||$)/g)].map((m) => ({ name: m[1], mib: Number(m[2].replace(/,/g, '')), weights: m[3] ?? null, backend: m[4].trim() }));
  const manifestPath = text.match(/Manifest Path \| ([^|]+?) \|/)?.[1] ?? null;
  const perfClass = text.match(/Performance Class \| ([^|]+?) \|/)?.[1] ?? null;
  const diskInstall = text.match(/Enough disk space to install \| ([^|]+?) \|/)?.[1] ?? null;

  return { manifestPath, perfClass, diskInstall, assets, useCases, models };
}

async function brokerState(b) {
  return parseBroker(await inTab(b, BROKER, { url: null, args: { scheme: b.scheme } }));
}

function profileFromFlags(b, flags) {
  for (const [name, prof] of Object.entries(b.profiles)) {
    const match = Object.entries(prof.flags).every(([id, v]) => {
      const on = flags.some((f) => f.startsWith(`${id}@`));

      return v === 'Default' ? !on : flags.includes(`${id}@1`);
    });

    if (match) {
      return name;
    }
  }

  return 'unknown';
}

// Which installed model folder backs the Prompt API now.
function servingModel(b, profileName, broker, disk) {
  if (b.scheme === 'edge') {
    const row = broker.models.find((m) => m.weights);
    const m = row && disk.find((d) => row.weights.toLowerCase().startsWith(d.dir.toLowerCase()));

    return { name: m?.name ?? null, basis: 'Broker State weights path -> manifest.json in that folder', weights: row?.weights ?? null };
  }

  const prof = b.profiles[profileName];
  const asset = prof && broker.assets.find((a) => a.name === prof.asset);
  const m = disk.find((d) => prof?.model.test(d.name));

  return { name: asset?.state === 'Ready' ? (m?.name ?? null) : null, basis: `flag profile "${profileName}" selects asset ${prof?.asset} (state ${asset?.state ?? 'absent'}); name from its manifest.json`, dir: m?.dir ?? null };
}

async function modelInfo(name, b) {
  const flags = localStateFlags(b);
  const profile = profileFromFlags(b, flags);
  const disk = diskModels(b);
  const broker = await brokerState(b);

  return { browser: name, profile, disk, broker, serving: servingModel(b, profile, broker, disk) };
}

// ---------- commands ----------
async function cmdAttach(name, b) {
  let procs = mainProcesses(b);

  if (procs.length === 0) {
    log('INFO', `${name} not running; starting it`);
    startBrowser(b);
    procs = (await waitFor(() => {
      const p = mainProcesses(b);

      return p.length ? p : null;
    }, 30000)) ?? [];
  }

  if (procs.length !== 1) {
    refuse(`expected one ${name} main process, found ${procs.length}`);
  }

  await ensureAttached(b);
  writeState(name, b, procs[0]);
  log('OK', `attached ${b.session} to ${name} PID ${procs[0].ProcessId}`);

  return { ok: true, state: readState(name) };
}

async function cmdRestart(name, b) {
  const { st, live } = verifyState(name, b);

  if (live) {
    await ensureAttached(b);

    try {
      await runCode(b, `async page => { const s = await page.context().newCDPSession(page); s.send('Browser.close').catch(() => {}); return 'closing'; }`);
    } catch {
      // The connection drops while the browser closes.
    }

    const gone = await waitFor(() => !processById(st.pid), 60000);

    if (!gone) {
      refuse(`${name} PID ${st.pid} did not exit within 60 s after Browser.close; not killing it`);
    }
  }

  pw(b, ['detach']);
  const t0 = Date.now();
  startBrowser(b);
  const procs = await waitFor(() => {
    const p = mainProcesses(b);

    return p.length ? p : null;
  }, 30000);

  if (!procs) {
    refuse(`${name} did not start`);
  }

  await sleep(3000);
  await ensureAttached(b);
  writeState(name, b, procs[0]);
  log('OK', `${name} restarted: PID ${st.pid} -> ${procs[0].ProcessId} in ${Date.now() - t0} ms, ${b.session} re-attached`);

  return { ok: true, oldPid: st.pid, newPid: procs[0].ProcessId, ms: Date.now() - t0 };
}

async function cmdFlags(name, b, sub) {
  const ids = pos.slice(2).length ? pos.slice(2) : [...new Set([...b.baseFlags.map((f) => f.split('@')[0]), ...Object.values(b.profiles).flatMap((p) => Object.keys(p.flags))])];

  if (sub === 'get') {
    const page = await inTab(b, FLAGS_READ, { url: null, args: { scheme: b.scheme, ids } });
    const localState = localStateFlags(b);
    log('INFO', `Local State: ${localState.join(', ')}`);

    for (const [id, v] of Object.entries(page)) {
      log('INFO', `flags page ${id} = ${v}`);
    }

    return { ok: true, localState, page, profile: profileFromFlags(b, localState) };
  }

  if (sub === 'set') {
    const [, , id, value] = pos;

    if (!id || !['Default', 'Enabled', 'Disabled'].includes(value)) {
      refuse('usage: flags set <flag-id> Default|Enabled|Disabled [--restart]');
    }

    const r = await inTab(b, FLAGS_SET, { url: null, args: { scheme: b.scheme, values: { [id]: value } } });
    const ok = r.readBack[id] === value;
    log(ok ? 'OK' : 'ERROR', `${id}: applied ${r.applied[id]}, flags page now reads ${r.readBack[id]}`);
    const out = { ok, ...r };

    if (ok && opts.restart) {
      out.restart = await cmdRestart(name, b);
      out.localStateAfter = localStateFlags(b);
    }

    return out;
  }

  refuse('usage: flags get [ids...] | flags set <id> <value>');
}

async function cmdDoctor(name, b) {
  const checks = [];
  const add = (id, pass, detail) => {
    checks.push({ id, pass, detail });
    log(pass === null ? 'SKIP' : pass ? 'OK' : 'ERROR', `${id}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  };
  const expect = typeof opts.expect === 'string' ? opts.expect : b.home;
  const prof = b.profiles[expect] ?? refuse(`unknown profile ${expect}; known: ${Object.keys(b.profiles).join(', ')}`);

  const procs = mainProcesses(b);
  add('process', procs.length === 1, procs.map((p) => `PID ${p.ProcessId} ${p.ExecutablePath}`).join('; ') || 'not running');

  if (procs.length !== 1) {
    return { ok: false, couldNotRun: true, checks };
  }

  await ensureAttached(b);
  add('attach', true, `${b.session} attached over CDP (${b.cdp})`);

  const ls = localStateFlags(b);
  const wanted = [...b.baseFlags, ...Object.entries(prof.flags).filter(([, v]) => v === 'Enabled').map(([id]) => `${id}@1`)];
  const unwanted = Object.entries(prof.flags).filter(([, v]) => v === 'Default').map(([id]) => id);
  const missing = wanted.filter((f) => !ls.includes(f));
  const extra = ls.filter((f) => unwanted.includes(f.split('@')[0]));
  add('flags.localState', missing.length === 0 && extra.length === 0, { profile: expect, missing, unexpected: extra, enabled: ls });

  const ids = [...new Set([...wanted.map((f) => f.split('@')[0]), ...unwanted])];
  const page = await inTab(b, FLAGS_READ, { url: null, args: { scheme: b.scheme, ids } });
  const notOnPage = ids.filter((id) => page[id] === 'not-found');
  const pageBad = ids.filter((id) => page[id] !== 'not-found' && page[id] !== (unwanted.includes(id) ? 'Default' : 'Enabled'));
  add('flags.page', pageBad.length === 0, { differs: Object.fromEntries(pageBad.map((id) => [id, page[id]])), notOnPage });

  const disk = diskModels(b);
  const diskHit = disk.find((d) => prof.model.test(d.name));
  add('model.disk', !!diskHit, diskHit ? `${diskHit.name} ${diskHit.modelVersion} (${diskHit.mib} MiB) at ${diskHit.dir}` : { expected: String(prof.model), found: disk.map((d) => d.name) });

  const broker = await brokerState(b);
  const asset = broker.assets.find((a) => a.name === prof.asset);
  add('model.broker', asset?.state === 'Ready' && broker.useCases[prof.useCase] === 'Available', { asset: asset ?? prof.asset + ' absent', useCase: prof.useCase, state: broker.useCases[prof.useCase], useCases: broker.useCases, diskInstall: broker.diskInstall });

  const serving = servingModel(b, expect, broker, disk);
  add('model.serving', !!serving.name && prof.model.test(serving.name), serving);

  const avail = await inTab(b, AVAILABILITY, { purpose: 'availability' });
  add('api.availability', avail.LanguageModel === 'available', avail);

  const free = freeSpace(b);
  const low = free.mib < free.minMib;
  checks.push({ id: 'disk.free', pass: true, warn: low, detail: free });
  log(low ? 'WARN' : 'OK', `disk.free: ${free.mib} MiB free on ${free.volume}, browser minimum ${free.minMib} MiB${low ? '; downloads will be refused and the browser may evict a model' : ''} (Broker State says: ${broker.diskInstall})`);

  const canary = await inTab(b, CANARY, { purpose: 'canary', args: { toolUse: prof.toolUse } });
  add('model.contextWindow', prof.contextWindow ? canary.contextWindow === prof.contextWindow : null, `contextWindow ${canary.contextWindow}${prof.contextWindow ? `, expected ${prof.contextWindow}` : ', no expected value for this profile'}`);
  add('canary.structured', canary.structured?.pass === true, canary.structured);
  add('canary.tools', canary.tools?.pass, canary.tools);
  add('canary.webmcp', canary.webmcp?.pass === true, canary.webmcp);

  return { ok: checks.every((c) => c.pass !== false), expect, checks };
}

async function cmdModel(name, b, sub) {
  if (sub === 'info') {
    const info = await modelInfo(name, b);

    for (const d of info.disk) {
      log('INFO', `disk: ${d.name} ${d.modelVersion} component ${d.componentVersion} ${d.mib} MiB ${d.dir}`);
    }

    for (const a of info.broker.assets) {
      log('INFO', `broker asset: ${a.name} ${a.version} ${a.state} ${a.progress}%`);
    }

    log('INFO', `profile ${info.profile}; serving: ${info.serving.name ?? 'none'} (${info.serving.basis})`);

    return { ok: true, ...info };
  }

  if (sub === 'init') {
    const r = await inTab(b, INIT, { purpose: 'init' });
    log('OK', `first create ${r.firstCreateMs} ms, second create ${r.secondCreateMs} ms, contextWindow ${r.contextWindow}, prompt ${r.promptMs} ms: ${String(r.answer).slice(0, 80)}`);

    return { ok: true, ...r };
  }

  if (sub === 'download') {
    return modelDownload(name, b);
  }

  if (sub === 'clear') {
    return modelClear(name, b);
  }

  if (sub === 'switch') {
    return modelSwitch(name, b, pos[2]);
  }

  refuse('usage: model info|init|download|clear --confirm=<name>|switch <profile>');
}

async function modelDownload(name, b) {
  const before = await inTab(b, AVAILABILITY, { purpose: 'availability' });
  const diskBefore = diskModels(b);

  if (before.LanguageModel === 'available') {
    log('OK', 'LanguageModel already available; nothing to download');

    return { ok: true, alreadyAvailable: true, before };
  }

  if (before.LanguageModel !== 'downloadable' && before.LanguageModel !== 'downloading') {
    return { ok: false, reason: `LanguageModel.availability() is ${before.LanguageModel}`, before };
  }

  const free = freeSpace(b);
  const prof = b.profiles[profileFromFlags(b, localStateFlags(b))];
  const needMib = prof?.downloadMib ?? 4096;

  if (free.mib < free.minMib) {
    refuse(`not enough disk space to download: ${free.mib} MiB free on ${free.volume}, the browser needs ${free.minMib} MiB`);
  }

  if (free.mib - needMib < free.minMib) {
    refuse(`download refused: ${free.mib} MiB free on ${free.volume} minus about ${needMib} MiB for the model leaves ${free.mib - needMib} MiB, under the browser minimum of ${free.minMib} MiB`);
  }

  // The broker refuses to install below its free-space threshold and availability() still says downloadable.
  const broker = await brokerState(b);

  if (broker.diskInstall?.startsWith('false')) {
    log('ERROR', `Broker State: Enough disk space to install = ${broker.diskInstall}; free space on the profile drive first (Lars decides what to delete)`);

    return { ok: false, reason: `not enough disk space to install: ${broker.diskInstall}`, before, broker };
  }

  // A real click on a page button is the user gesture create() needs to start a download.
  const START = `async (p) => {
    await p.evaluate(() => {
      window.__dl = { progress: [], state: 'idle', t0: Date.now() };
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
    await p.click('#ai-browsers-download');
    await p.waitForTimeout(2000);
    return p.evaluate(() => window.__dl);
  }`;
  const POLL = `async page => {
    const p = page.context().pages().find((x) => x.url().includes('ai-browsers=download'));
    if (!p) return { state: 'tab-gone' };
    const d = await p.evaluate(() => ({ ...window.__dl, last: window.__dl.progress.at(-1), progress: undefined, samples: window.__dl.progress.length }));
    d.availability = await p.evaluate(() => LanguageModel.availability());
    return d;
  }`;
  const CLOSE = `async page => { for (const p of page.context().pages()) if (p.url().includes('ai-browsers=download')) await p.close(); return 'closed'; }`;

  const start = await inTab(b, START, { purpose: 'download', keep: true });
  log('INFO', `download started (${start.state}), polling`);
  const timeoutMs = Number(opts['timeout-min'] ?? 45) * 60000;
  const samples = [];
  let last = start;
  const end = Date.now() + timeoutMs;
  let lastLogged = -1;

  while (Date.now() < end) {
    await sleep(5000);
    last = await runCode(b, POLL);
    samples.push({ t: Date.now(), pct: last.last?.pct ?? null, state: last.state, availability: last.availability });

    if (last.last && Math.floor(last.last.pct / 10) !== lastLogged) {
      lastLogged = Math.floor(last.last.pct / 10);
      log('INFO', `progress ${last.last.pct}% (${last.state}, availability ${last.availability})`);
    }

    if (last.state === 'ready' || last.state.startsWith('ERR') || last.state === 'tab-gone') {
      break;
    }
  }

  await runCode(b, CLOSE);
  const after = await waitFor(async () => {
    const a = await inTab(b, AVAILABILITY, { purpose: 'availability' });

    return a.LanguageModel === 'available' ? a : null;
  }, 120000, 5000);
  const diskAfter = diskModels(b);
  const added = diskAfter.filter((d) => !diskBefore.some((x) => x.dir === d.dir && x.bytes === d.bytes));
  const durationMs = last.readyAt && last.clickAt ? last.readyAt - last.clickAt : null;
  const ok = last.state === 'ready' && !!after;
  log(ok ? 'OK' : 'ERROR', `download ${last.state} in ${durationMs ?? '?'} ms; new on disk: ${added.map((d) => `${d.name} ${d.mib} MiB`).join(', ') || 'none'}`);

  return { ok, state: last.state, durationMs, contextWindow: last.contextWindow, added, diskBefore, diskAfter, samples, availabilityAfter: after };
}

async function modelClear(name, b) {
  const confirm = opts.confirm;

  if (typeof confirm !== 'string') {
    refuse('model clear needs --confirm=<model name from its manifest.json>, e.g. --confirm=v3Nano');
  }

  if (PROTECTED_MODELS.includes(confirm)) {
    refuse(`${confirm} is protected; this skill never clears it`);
  }

  const freeBefore = freeSpace(b);
  const disk = diskModels(b);
  const victims = disk.filter((d) => d.name === confirm);

  if (victims.length === 0) {
    refuse(`no installed model named ${confirm}; installed: ${disk.map((d) => d.name).join(', ') || 'none'}`);
  }

  const others = disk.filter((d) => d.name !== confirm);

  if (b.scheme === 'edge' && others.length === 0) {
    // Edge holds one model; the browser's own all-models uninstall removes exactly that one.
    const r = await inTab(b, `async (p) => { await p.goto('edge://on-device-internals'); await p.locator('[role=tab]').nth(2).click({ force: true }); await p.getByText('Uninstall Models').click({ force: true }); await p.waitForTimeout(3000); return 'clicked'; }`, { url: null });
    const left = await waitFor(() => !diskModels(b).some((d) => d.name === confirm), 60000, 2000);
    log(left ? 'OK' : 'ERROR', `Uninstall Models ${r}; ${confirm} ${left ? 'gone from disk' : 'still on disk'}`);

    const freeAfter = freeSpace(b);
    log('INFO', `free space ${freeBefore.mib} -> ${freeAfter.mib} MiB (${freeAfter.bytes - freeBefore.bytes} bytes freed)`);

    return { ok: !!left, method: 'edge://on-device-internals Uninstall Models', removed: victims, freeBefore, freeAfter, bytesFreed: freeAfter.bytes - freeBefore.bytes };
  }

  // Fallback: Uninstall Models takes no argument and would remove protected models too, so delete the folder with the browser closed.
  const { st } = verifyState(name, b);
  await ensureAttached(b);

  // A use case left "Requested" in Broker State makes the browser download the deleted model again within minutes.
  const release = Object.values(b.profiles).find((p) => p.model.test(confirm))?.releaseUseCases ?? [];
  const released = release.length ? await inTab(b, UNREQUEST, { url: null, args: { scheme: b.scheme, useCases: release } }) : [];

  if (released.length) {
    log('OK', `Broker State: unchecked Requested for ${released.join(', ')}`);
  }

  try {
    await runCode(b, `async page => { const s = await page.context().newCDPSession(page); s.send('Browser.close').catch(() => {}); return 'closing'; }`);
  } catch {
    // The connection drops while the browser closes.
  }

  if (!(await waitFor(() => !processById(st.pid), 60000))) {
    refuse(`${name} did not exit; not deleting files under a running browser`);
  }

  for (const v of victims) {
    rmSync(v.dir, { recursive: true, force: true });
    log('OK', `deleted ${v.dir} (${v.mib} MiB)`);
  }

  pw(b, ['detach']);
  startBrowser(b);
  const procs = await waitFor(() => {
    const p = mainProcesses(b);

    return p.length ? p : null;
  }, 30000);
  await sleep(3000);
  writeState(name, b, procs[0]);
  let broker = { assets: null };
  let reattach = 'ok';

  try {
    await ensureAttached(b);
    broker = await brokerState(b);
  } catch (e) {
    // The files are gone either way; report the deletion even when the browser refuses the new connection.
    reattach = e.message;
    log('WARN', `deleted, but could not read Broker State afterwards: ${e.message}`);
  }

  const freeAfter = freeSpace(b);
  log('INFO', `free space ${freeBefore.mib} -> ${freeAfter.mib} MiB (${freeAfter.bytes - freeBefore.bytes} bytes freed)`);

  return { ok: true, method: 'folder delete with browser closed (fallback)', removed: victims, freeBefore, freeAfter, bytesFreed: freeAfter.bytes - freeBefore.bytes, releasedUseCases: released, reattach, brokerAfter: broker.assets, diskAfter: diskModels(b) };
}

async function modelSwitch(name, b, target) {
  const prof = b.profiles[target] ?? refuse(`unknown profile "${target}"; known: ${Object.keys(b.profiles).join(', ')}`);
  verifyState(name, b);
  const set = await inTab(b, FLAGS_SET, { url: null, args: { scheme: b.scheme, values: prof.flags } });
  const bad = Object.entries(prof.flags).filter(([id, v]) => set.readBack[id] !== v);

  if (bad.length) {
    return { ok: false, reason: 'flags page did not take the values', set };
  }

  log('OK', `flags set for ${target}: ${JSON.stringify(set.readBack)}`);
  const restart = await cmdRestart(name, b);
  const ls = localStateFlags(b);
  const profile = profileFromFlags(b, ls);
  const info = await modelInfo(name, b);
  const avail = await inTab(b, AVAILABILITY, { purpose: 'availability' });
  const matches = info.serving.name ? prof.model.test(info.serving.name) : null;
  log(profile === target ? 'OK' : 'ERROR', `Local State profile now ${profile}; LanguageModel ${avail.LanguageModel}; serving ${info.serving.name ?? 'none yet'}${matches === false ? ` (expected ${prof.model})` : ''}`);

  return { ok: profile === target && matches !== false, target, set, restart, localState: ls, profile, availability: avail, info, servingMatchesExpected: matches };
}

async function cmdRun(name, b) {
  const file = pos[1];

  if (!file || !existsSync(file)) {
    refuse('usage: run <script.js> (a file holding "async page => {...}"; it runs in a new tab the skill closes)');
  }

  const body = readFileSync(file, 'utf8').trim().replace(/;\s*$/, '');

  return { ok: true, result: await inTab(b, body, { url: null, purpose: 'run' }) };
}

async function cmdCleanup(name, b) {
  const st = readState(name);
  let closed = 0;
  const attached = isAttached(b);

  if (attached) {
    closed = await runCode(b, `async page => { let n = 0; for (const p of page.context().pages()) if (p.url().includes('ai-browsers=')) { await p.close(); n++; } return n; }`);
    pw(b, ['detach']);
  }

  if (st) {
    rmSync(statePath(name), { force: true });
  }

  log('OK', `${attached ? `closed ${closed} skill tab(s), detached ${b.session}` : `${b.session} was not attached; skill tabs not checked`}, ${st ? 'removed state file' : 'no state file'}; ${name} left running`);

  return { ok: true, attached, closedTabs: attached ? closed : null, browserRunning: mainProcesses(b).length === 1 };
}

// ---------- main ----------
const COMMANDS = { attach: cmdAttach, doctor: cmdDoctor, flags: cmdFlags, model: cmdModel, restart: cmdRestart, canary: null, run: cmdRun, cleanup: cmdCleanup, info: null };

async function main() {
  const cmd = pos[0];

  if (!cmd || !(cmd in COMMANDS)) {
    refuse(`usage: control.mjs <${Object.keys(COMMANDS).join('|')}> --browser=chrome-beta|msedge-dev [--json] [--evidence=<dir>]`);
  }

  const name = opts.browser;
  const b = BROWSERS[name] ?? refuse(`--browser must be one of ${Object.keys(BROWSERS).join(', ')} (Chrome and Edge stable are never driven)`);
  let result;

  if (cmd === 'canary') {
    const prof = b.profiles[profileFromFlags(b, localStateFlags(b))] ?? b.profiles[b.home];
    result = await inTab(b, CANARY, { purpose: 'canary', args: { toolUse: prof.toolUse } });
    result.ok = result.structured?.pass === true && result.tools?.pass !== false && result.webmcp?.pass === true;
    log(result.ok ? 'OK' : 'ERROR', JSON.stringify(result));
  } else if (cmd === 'info') {
    result = { ok: true, state: readState(name), statePath: statePath(name), session: b.session, evidenceDir };
    log('INFO', JSON.stringify(result));
  } else {
    result = await COMMANDS[cmd](name, b, pos[1]);
  }

  return { cmd: [cmd, pos[1]].filter(Boolean).join(' '), browser: name, at: new Date().toISOString(), ...result };
}

function save(result) {
  mkdirSync(evidenceDir, { recursive: true });
  const file = join(evidenceDir, `${result.browser ?? 'none'}-${(result.cmd ?? 'error').replace(/[^A-Za-z0-9.]+/g, '-').slice(0, 60)}-${Date.now()}.json`);
  writeFileSync(file, JSON.stringify(result, null, 2));

  return file;
}

main().then(
  (result) => {
    const file = save(result);
    const code = result.couldNotRun ? EXIT.REFUSED : result.ok ? EXIT.OK : EXIT.UNHEALTHY;

    if (opts.json) {
      console.log(JSON.stringify({ ...result, evidence: file, exit: code }));
    } else {
      console.log(`[${code === 0 ? 'OK' : 'ERROR'}] exit ${code}; evidence ${file}`);
    }

    process.exit(code);
  },
  (err) => {
    const refused = err instanceof Refusal;
    const result = { cmd: pos.join(' '), browser: opts.browser, ok: false, refused, reason: err.message };
    const file = save(result);

    if (opts.json) {
      console.log(JSON.stringify({ ...result, evidence: file, exit: EXIT.REFUSED }));
    } else {
      console.log(`[ERROR] ${refused ? 'refused' : 'could not run'}: ${err.message}\n[ERROR] exit 2; evidence ${file}`);
    }

    process.exit(EXIT.REFUSED);
  },
);
