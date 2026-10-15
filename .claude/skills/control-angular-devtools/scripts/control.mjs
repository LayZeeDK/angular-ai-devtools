#!/usr/bin/env node
// Angular DevTools control script. Run with --help for commands.

import { spawn, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const EXT_ID = 'ienfalfjdbdpebioblfackkekamfmbnh';
const PANEL_ID = `chrome-extension://${EXT_ID}Angular`;
const STORE_URL = `https://chromewebstore.google.com/detail/${EXT_ID}`;
const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(SKILL_DIR, '..', '..', '..');
const TMP = join(ROOT, 'tmp', 'control-angular-devtools');
const LOCAL = process.env.LOCALAPPDATA;
const BROWSERS = {
  chrome: { exe: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', userData: join(LOCAL, 'Google', 'Chrome', 'User Data'), scheme: 'chrome' },
  'chrome-beta': { exe: 'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe', userData: join(LOCAL, 'Google', 'Chrome Beta', 'User Data'), scheme: 'chrome' },
  edge: { exe: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', userData: join(LOCAL, 'Microsoft', 'Edge', 'User Data'), scheme: 'edge' },
  'edge-dev': { exe: 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe', userData: join(LOCAL, 'Microsoft', 'Edge Dev', 'User Data'), scheme: 'edge' },
};

// ---------- args ----------
const [cmd, ...rest] = process.argv.slice(2);
const VALUE_FLAGS = ['browser', 'from', 'profile', 'timeout', 'app-url', 'cdp-port', 'component', 'click', 'file'];
const BOOL_FLAGS = ['json', 'di-graph'];
const BROWSER_VALUES = ['test', 'chrome', 'chrome-beta', 'edge', 'edge-dev'];
const opts = {};
const pos = [];

function usageError(msg) {
  console.log(`[ERROR] refused: ${msg}`);
  process.exit(2);
}

for (let i = 0; i < rest.length; i++) {
  const m = rest[i].match(/^--([^=]+)(?:=(.*))?$/s);

  if (!m) {
    pos.push(rest[i]);
    continue;
  }

  const [, name, inline] = m;

  if (BOOL_FLAGS.includes(name)) {
    if (inline !== undefined) {
      usageError(`--${name} takes no value`);
    }

    opts[name] = true;
  } else if (VALUE_FLAGS.includes(name)) {
    const value = inline ?? (rest[i + 1] !== undefined && !rest[i + 1].startsWith('--') ? rest[++i] : undefined);

    if (value === undefined || value === '') {
      usageError(`--${name} needs a value (--${name} <value> or --${name}=<value>)`);
    }

    opts[name] = value;
  } else {
    usageError(`unknown flag --${name}; flags: ${[...VALUE_FLAGS, ...BOOL_FLAGS].map((f) => '--' + f).join(', ')}`);
  }
}

if (opts.browser !== undefined && !BROWSER_VALUES.includes(opts.browser)) {
  usageError(`--browser ${opts.browser} is not one of ${BROWSER_VALUES.join(', ')}`);
}

for (const n of ['timeout', 'cdp-port']) {
  if (opts[n] !== undefined && !/^\d+$/.test(opts[n])) {
    usageError(`--${n} must be a whole number, got "${opts[n]}"`);
  }
}

class Refusal extends Error {}
class Unhealthy extends Error {}

function refuse(msg) {
  throw new Refusal(msg);
}

function log(marker, msg) {
  if (!opts.json) {
    console.log(`[${marker}] ${msg}`);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitFor(fn, timeoutMs, everyMs = 500) {
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

// ---------- worktree, session, ports ----------
const isWorktree = existsSync(join(ROOT, '.git')) && !readdirSync(ROOT, { withFileTypes: true }).find((d) => d.name === '.git')?.isDirectory();
const flowId = isWorktree ? `wt-${createHash('sha1').update(ROOT.toLowerCase()).digest('hex').slice(0, 6)}` : 'main';
const SESSION = flowId === 'main' ? 'ngdt' : `ngdt-${flowId}`;
const MAIN_CDP_PORT = 9420;
const cdpPortDefault = flowId === 'main' ? MAIN_CDP_PORT : 9421 + (parseInt(flowId.slice(3), 16) % 79);
const STATE = join(TMP, 'state', `${flowId}.json`);
const PROFILE = join(TMP, 'profile', flowId);
const EXT_COPY = join(TMP, 'extension');

function portFree(port) {
  return new Promise((r) => {
    const s = createServer();
    s.once('error', () => r(false));
    s.once('listening', () => s.close(() => r(true)));
    s.listen(port, '127.0.0.1');
  });
}

function portOwner(port) {
  const r = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
  const line = r.stdout.split('\n').find((l) => new RegExp(`:${port}\\s.*LISTENING`).test(l));

  return line ? Number(line.trim().split(/\s+/).pop()) : null;
}

// ---------- processes ----------
function processById(pid) {
  const r = spawnSync('pwsh', ['-NoProfile', '-NonInteractive', '-Command', `Get-CimInstance Win32_Process -Filter "ProcessId=${Number(pid)}" | Select-Object ProcessId,CommandLine,@{n='Created';e={$_.CreationDate.ToString('o')}} | ConvertTo-Json -Compress`], { encoding: 'utf8' });
  const text = r.stdout.trim();

  return text ? JSON.parse(text) : null;
}

// ---------- state ----------
function readState() {
  return existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : null;
}

function requireState() {
  const st = readState();

  if (!st) {
    refuse(`no state file at ${STATE}; run "up" first`);
  }

  return st;
}

function checkIdentity(st) {
  const live = processById(st.pid);

  if (!live) {
    return null;
  }

  if (live.Created !== st.created) {
    refuse(`PID ${st.pid} start-time mismatch: live ${live.Created}, recorded ${st.created}; not the browser this run started`);
  }

  if (live.CommandLine !== st.commandLine) {
    refuse(`PID ${st.pid} command-line mismatch: live "${(live.CommandLine ?? '').slice(0, 120)}", recorded "${st.commandLine.slice(0, 120)}"`);
  }

  return live;
}

// ---------- playwright-cli ----------
function pw(args, { raw = false } = {}) {
  const full = [...(raw ? ['--raw'] : []), `-s=${SESSION}`, ...args];
  const r = spawnSync(['playwright-cli', ...full].map((a) => (/[s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a)).join(' '), { cwd: ROOT, encoding: 'utf8', shell: true, maxBuffer: 64 * 1024 * 1024 });

  return { code: r.status, out: (r.stdout ?? '') + (r.stderr ?? '') };
}

// Runs a playwright-cli run-code function; `src` is the source of `async page => ...` returning JSON-able data.
function runCode(src, dir = join(TMP, 'run')) {
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `code-${process.pid}-${Date.now()}.js`);
  writeFileSync(file, `async page => JSON.stringify(await (${src})(page))`);
  const r = pw(['run-code', `--filename=${file}`], { raw: true });
  rmSync(file, { force: true });

  if (r.code !== 0) {
    throw new Error(`run-code failed (${r.code}): ${r.out.slice(0, 600)}`);
  }

  let v = JSON.parse(r.out.trim());

  return typeof v === 'string' ? JSON.parse(v) : v;
}

// ---------- raw CDP (DevTools window and the Angular panel) ----------
async function targets(port) {
  return (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
}

async function cdp(port, match, method, params = {}) {
  const list = await targets(port);
  const t = list.find(match);

  if (!t) {
    throw new Error(`no CDP target matched; targets: ${list.map((x) => `${x.type} ${x.url.slice(0, 80)}`).join(' ; ')}`);
  }

  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => {
    ws.addEventListener('open', r);
    ws.addEventListener('error', j);
  });

  try {
    return await new Promise((r) => {
      ws.addEventListener('message', (ev) => {
        const m = JSON.parse(ev.data);

        if (m.id === 1) {
          r(m);
        }
      });
      ws.send(JSON.stringify({ id: 1, method, params }));
    });
  } finally {
    ws.close();
  }
}

async function evalIn(port, match, fnSource) {
  const r = await cdp(port, match, 'Runtime.evaluate', { expression: `(${fnSource})()`, awaitPromise: true, returnByValue: true });

  if (r.result?.exceptionDetails) {
    throw new Error(`evaluate threw: ${r.result.exceptionDetails.exception?.description ?? r.result.exceptionDetails.text}`);
  }

  return r.result?.result?.value;
}

const isDevtools = (t) => t.url.startsWith('devtools://devtools/bundled/devtools_app.html');
const isPanel = (t) => t.url === `chrome-extension://${EXT_ID}/index.html`;

async function showPanel(port) {
  const ok = await waitFor(async () => (await targets(port)).some(isDevtools), 15000);

  if (!ok) {
    throw new Error('no DevTools window target; was the browser started by "up" (it opens DevTools for each tab)?');
  }

  const registered = await waitFor(() => evalIn(port, isDevtools, `async () => Object.keys(UI.panels).includes(${JSON.stringify(PANEL_ID)})`), 15000);

  if (!registered) {
    throw new Error(`DevTools has no panel ${PANEL_ID}; the extension did not register its panel`);
  }

  await evalIn(port, isDevtools, `async () => Extensions.extensionServer.onShowPanel({ command: 'showPanel', id: ${JSON.stringify(PANEL_ID)} })`);
  const ready = await waitFor(async () => (await targets(port)).some(isPanel) && evalIn(port, isPanel, `async () => document.body.innerText.includes('Components')`), 15000);

  if (!ready) {
    throw new Error('Angular panel target index.html did not render its tabs');
  }
}

// Functions evaluated inside the panel (chrome-extension://<id>/index.html).
const PANEL = {
  tab: (name) => `async () => { const t = [...document.querySelectorAll('a,button,[role=tab]')].find((b) => b.textContent.trim() === ${JSON.stringify(name)}); if (!t) return false; t.click(); return true; }`,
  selectComponent: (name) => `async () => {
    const leaf = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && e.textContent.trim() === ${JSON.stringify(name)} && e.closest('.node-name'));
    if (!leaf) return false;
    leaf.closest('.node-name').click();
    return true;
  }`,
  showSignalGraph: `async () => { const b = [...document.querySelectorAll('button')].find((x) => x.textContent.includes('Show Signal Graph')); if (!b) return false; b.click(); return true; }`,
  readSignalGraph: `async () => [...document.querySelectorAll('ng-signal-graph-pane .node-cont')].map((n) => ({ kind: [...n.classList].find((c) => c.startsWith('kind-'))?.slice(5) ?? null, text: n.innerText.split('\\n').map((s) => s.trim()).filter(Boolean) }))`,
  recordButton: `async () => { const b = [...document.querySelectorAll('button')].find((x) => /^(Start|Stop) recording$/.test(x.getAttribute('aria-label') ?? '')); if (!b) return null; const l = b.getAttribute('aria-label'); b.click(); return l; }`,
  profilerSummary: `async () => { const t = document.body.innerText; const m = t.match(/Change detection cycles[\\s\\S]*?(\\d+)\\s*\\/\\s*(\\d+)/); return { cycles: m ? Number(m[2]) : null, text: t.replace(/\\n+/g, ' | ').slice(0, 400) }; }`,
  text: `async () => document.body.innerText.replace(/\\n+/g, ' | ').slice(0, 1500)`,
};

async function panelSignalGraph(port, component) {
  await evalIn(port, isPanel, PANEL.tab('Components'));

  if (!(await waitFor(() => evalIn(port, isPanel, PANEL.selectComponent(component)), 10000))) {
    throw new Error(`component ${component} not found in the panel's component tree`);
  }

  if (!(await waitFor(() => evalIn(port, isPanel, PANEL.showSignalGraph), 10000))) {
    throw new Error('no "Show Signal Graph" button after selecting the component');
  }

  return waitFor(async () => {
    const nodes = await evalIn(port, isPanel, PANEL.readSignalGraph);

    return nodes.length ? nodes : null;
  }, 10000);
}

async function screenshotTarget(port, match, file) {
  const r = await cdp(port, match, 'Page.captureScreenshot', { format: 'png' });

  if (!r.result?.data) {
    throw new Error(`screenshot failed: ${JSON.stringify(r.error ?? r).slice(0, 200)}`);
  }

  writeFileSync(file, Buffer.from(r.result.data, 'base64'));

  return file;
}

// ---------- page-side probes (run through playwright-cli run-code) ----------
const ATTACH_PROBE = `async (page) => {
  await page.addInitScript(() => {
    if (window.__ngdtProbe) return;
    const p = (window.__ngdtProbe = { flagSetAt: null, messages: [] });
    let flag;
    Object.defineProperty(window, '__NG_DEVTOOLS_CONNECTED__', { configurable: true, get: () => flag, set: (v) => { flag = v; p.flagSetAt = Math.round(performance.now()); } });
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (d && (d.__NG_DEVTOOLS_EVENT__ || d.isAngularDevTools)) {
        p.messages.push({ t: Math.round(performance.now()), source: typeof d.source === 'string' ? d.source.replace(/-https?:.*$/, '') : null, topic: d.topic ?? (d.isAngularDevTools ? '(detection)' : null), detection: d.isAngularDevTools ? d : d.topic === 'detectAngular' ? d.args?.[0] : undefined });
      }
    });
  });
  await page.reload();
  await page.waitForFunction(() => window.__ngdtProbe?.messages.some((m) => m.topic === 'backendReady'), null, { timeout: 20000 }).catch(() => {});
  return page.evaluate(() => {
    const p = window.__ngdtProbe;
    const firstOf = (topic) => p.messages.find((m) => m.topic === topic) ?? null;
    return {
      flag: window.__NG_DEVTOOLS_CONNECTED__ === true,
      flagSetAt: p.flagSetAt,
      detection: firstOf('detectAngular')?.detection ?? null,
      backendInstalled: !!firstOf('backendInstalled'),
      handshake: !!firstOf('handshake'),
      backendReady: firstOf('backendReady')?.t ?? null,
      ngVersion: document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null,
      ngGlobal: typeof window.ng === 'object' && typeof window.ng.getComponent === 'function',
      topics: [...new Set(p.messages.map((m) => (m.source ? m.source + ':' : '') + m.topic))],
    };
  });
}`;

const EXT_INFO = `async (page) => {
  const sw = page.context().serviceWorkers().map((w) => w.url()).filter((u) => u.startsWith('chrome-extension://${EXT_ID}/'));
  const p = await page.context().newPage();
  try {
    await p.goto('chrome://extensions/?id=${EXT_ID}');
    await p.waitForFunction(() => typeof chrome?.developerPrivate?.getExtensionInfo === 'function');
    const info = await p.evaluate(() => new Promise((r) => chrome.developerPrivate.getExtensionInfo('${EXT_ID}', (i) => r(i ? { name: i.name, version: i.version, state: i.state, location: i.location, path: i.prettifiedPath, runtimeErrors: i.runtimeErrors?.length ?? 0, manifestErrors: i.manifestErrors?.length ?? 0 } : null))));
    return { serviceWorkers: sw, info };
  } finally {
    await p.close();
  }
}`;

// ---------- branded profiles (read-only) ----------
function brandedStatus(name, profile = 'Default') {
  const b = BROWSERS[name];

  if (!b) {
    refuse(`unknown --browser ${name}; use ${Object.keys(BROWSERS).join(', ')} (or test for the isolated Chromium harness)`);
  }

  const dir = join(b.userData, profile, 'Extensions', EXT_ID);
  const versions = existsSync(dir) ? readdirSync(dir).filter((v) => /^\d/.test(v)) : [];
  let settings = null;

  for (const f of ['Secure Preferences', 'Preferences']) {
    const p = join(b.userData, profile, f);

    if (!settings && existsSync(p)) {
      const s = JSON.parse(readFileSync(p, 'utf8')).extensions?.settings?.[EXT_ID];

      if (s) {
        settings = { file: f, version: s.manifest?.version ?? null, disableReasons: s.disable_reasons ?? [], state: s.state ?? null, fromWebstore: s.from_webstore ?? null, path: s.path ?? null };
      }
    }
  }

  const installed = !!settings && versions.length > 0;
  const enabled = installed && settings.disableReasons.length === 0 && settings.state !== 0;

  return { browser: name, profile, extensionsDir: dir, versionsOnDisk: versions, settings, installed, enabled, extensionsPage: `${b.scheme}://extensions/?id=${EXT_ID}` };
}

function openInBrowser(name, url, profile = 'Default') {
  spawn(BROWSERS[name].exe, [`--profile-directory=${profile}`, url], { detached: true, stdio: 'ignore' }).unref();
}

// ---------- commands ----------
function newestCopy() {
  if (!existsSync(EXT_COPY)) {
    return null;
  }

  const v = readdirSync(EXT_COPY).filter((d) => existsSync(join(EXT_COPY, d, 'manifest.json'))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();

  return v ? { version: v, dir: join(EXT_COPY, v) } : null;
}

async function cmdInstall() {
  const browser = opts.browser ?? 'test';

  if (browser !== 'test') {
    const before = brandedStatus(browser, opts.profile);

    if (before.installed) {
      log('OK', `${browser}: Angular DevTools ${before.settings.version} already installed (enabled: ${before.enabled})`);

      return { ok: true, already: true, status: before };
    }

    openInBrowser(browser, STORE_URL, opts.profile);
    log('INFO', `opened ${STORE_URL} in ${browser}. Lars clicks "Add to ${browser.startsWith('edge') ? 'Edge' : 'Chrome'}"${browser.startsWith('edge') ? ' (after "Allow extensions from other stores" if Edge asks)' : ''} and confirms "Add extension"; polling the profile for ${opts.timeout ?? 180} s`);
    const after = await waitFor(() => {
      const s = brandedStatus(browser, opts.profile);

      return s.installed ? s : null;
    }, Number(opts.timeout ?? 180) * 1000, 2000);

    if (!after) {
      throw new Unhealthy(`${browser}: not installed after ${opts.timeout ?? 180} s; profile has no ${EXT_ID} entry`);
    }

    log('OK', `${browser}: installed ${after.settings.version ?? after.versionsOnDisk.at(-1)?.replace(/_\d+$/, '')}, enabled ${after.enabled}`);

    return { ok: true, status: after };
  }

  const from = opts.from ?? 'edge-dev';
  const srcRoot = BROWSERS[from] ? join(BROWSERS[from].userData, opts.profile ?? 'Default', 'Extensions', EXT_ID) : resolve(from);

  if (!existsSync(srcRoot)) {
    refuse(`no Angular DevTools in ${srcRoot}; install it in ${from} first or pass --from <dir>`);
  }

  const srcVersion = readdirSync(srcRoot).filter((v) => existsSync(join(srcRoot, v, 'manifest.json'))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();
  const src = srcVersion ? join(srcRoot, srcVersion) : srcRoot;
  const version = JSON.parse(readFileSync(join(src, 'manifest.json'), 'utf8')).version;
  const dest = join(EXT_COPY, version);

  if (existsSync(join(dest, 'manifest.json'))) {
    log('OK', `copy of ${version} already at ${dest}`);

    return { ok: true, already: true, version, dir: dest, source: src };
  }

  mkdirSync(EXT_COPY, { recursive: true });
  cpSync(src, dest, { recursive: true });
  log('OK', `copied Angular DevTools ${version} from ${src} (read only) to ${dest}`);

  return { ok: true, version, dir: dest, source: src };
}

async function cmdUninstall() {
  const browser = opts.browser ?? 'test';

  if (browser !== 'test') {
    const before = brandedStatus(browser, opts.profile);

    if (!before.installed) {
      log('OK', `${browser}: Angular DevTools not installed`);

      return { ok: true, already: true, status: before };
    }

    openInBrowser(browser, STORE_URL, opts.profile);
    log('INFO', `opened ${STORE_URL} in ${browser} (a browser will not open ${before.extensionsPage} from the command line). Lars clicks "Remove from ${browser.startsWith('edge') ? 'Edge' : 'Chrome'}" there, or opens ${before.extensionsPage} himself and clicks Remove; polling the profile for ${opts.timeout ?? 180} s`);
    const after = await waitFor(() => {
      const s = brandedStatus(browser, opts.profile);

      return s.settings ? null : s;
    }, Number(opts.timeout ?? 180) * 1000, 2000);

    if (!after) {
      throw new Unhealthy(`${browser}: still registered in the profile after ${opts.timeout ?? 180} s`);
    }

    log('OK', `${browser}: removed (folder versions left on disk: ${after.versionsOnDisk.join(', ') || 'none'})`);

    return { ok: true, status: after };
  }

  if (readState()) {
    refuse('the test browser is up; run "down" first');
  }

  rmSync(EXT_COPY, { recursive: true, force: true });
  rmSync(join(TMP, 'profile'), { recursive: true, force: true });
  log('OK', `removed ${EXT_COPY} and the test profiles`);

  return { ok: true };
}

async function cmdStatus() {
  const browser = opts.browser ?? 'test';

  if (browser === 'test') {
    const copy = newestCopy();
    const st = readState();
    log(copy ? 'OK' : 'INFO', `test: copy ${copy ? `${copy.version} at ${copy.dir}` : 'none (run install)'}; up ${!!st}`);

    return { ok: !!copy, browser, copy, up: !!st };
  }

  const s = brandedStatus(browser, opts.profile);
  log(s.installed ? 'OK' : 'INFO', `${browser}/${s.profile}: installed ${s.installed}${s.installed ? `, version ${s.settings.version}, enabled ${s.enabled}, disable_reasons ${JSON.stringify(s.settings.disableReasons)}` : ''}`);

  return { ok: true, ...s };
}

async function cmdUp() {
  if (readState()) {
    refuse(`state file exists at ${STATE}; run "down" first`);
  }

  const appUrl = opts['app-url'];

  if (!appUrl) {
    refuse('--app-url <url of a dev-mode Angular app> is required');
  }

  const copy = newestCopy();

  if (!copy) {
    refuse('no extension copy; run "install" first');
  }

  const port = Number(opts['cdp-port'] ?? cdpPortDefault);

  if (isWorktree && port === MAIN_CDP_PORT) {
    refuse(`port ${MAIN_CDP_PORT} belongs to the main checkout's flow`);
  }

  if (!(await portFree(port))) {
    refuse(`CDP port ${port} is in use by PID ${portOwner(port)}; pass --cdp-port or stop your own instance`);
  }

  const evidenceDir = join(TMP, 'evidence', new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-'));
  mkdirSync(evidenceDir, { recursive: true });
  const ext = copy.dir.replace(/\\/g, '/');
  const config = {
    browser: {
      browserName: 'chromium',
      userDataDir: PROFILE.replace(/\\/g, '/'),
      launchOptions: {
        channel: 'chromium',
        headless: false,
        args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`, '--auto-open-devtools-for-tabs', `--remote-debugging-port=${port}`],
      },
    },
  };
  const configPath = join(TMP, 'state', `${flowId}.cli.config.json`);
  mkdirSync(dirname(configPath), { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2));
  const t0 = Date.now();
  const r = pw([`--config=${configPath}`, 'open', appUrl]);
  const pid = Number(r.out.match(/opened with pid (\d+)/)?.[1]);

  if (r.code !== 0 || !pid) {
    throw new Error(`playwright-cli open failed (${r.code}): ${r.out.slice(0, 600)}`);
  }

  const live = processById(pid);
  const st = { flowId, session: SESSION, pid, created: live.Created, commandLine: live.CommandLine, cdpPort: port, appUrl, extensionVersion: copy.version, extensionDir: copy.dir, profile: PROFILE, configPath, evidenceDir, startedAt: new Date().toISOString() };
  writeFileSync(STATE, JSON.stringify(st, null, 2));
  const ready = await waitFor(async () => {
    try {
      return (await targets(port)).some((t) => t.type === 'service_worker' && t.url.startsWith(`chrome-extension://${EXT_ID}/`));
    } catch {
      return false;
    }
  }, 20000);

  if (!ready) {
    throw new Unhealthy(`browser PID ${pid} up but no Angular DevTools service worker on CDP port ${port}; run doctor`);
  }

  st.readyInSeconds = Math.round((Date.now() - t0) / 100) / 10;
  st.browserPid = portOwner(port);
  writeFileSync(STATE, JSON.stringify(st, null, 2));
  log('OK', `session ${SESSION} (playwright-cli PID ${pid}), browser PID ${st.browserPid}, CDP ${port}, Angular DevTools ${copy.version}, ready in ${st.readyInSeconds} s`);

  return { ok: true, ...st };
}

async function cmdDoctor() {
  const st = requireState();
  const checks = [];
  const add = (name, ok, detail) => {
    checks.push({ name, ok, detail });
    log(ok ? 'OK' : 'ERROR', `${name}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
  };
  const live = checkIdentity(st);
  add('process', !!live, live ? `PID ${st.pid} alive, start time and command line match` : `PID ${st.pid} not running`);

  if (!live) {
    return { ok: false, checks };
  }

  let version = null;

  try {
    version = await (await fetch(`http://127.0.0.1:${st.cdpPort}/json/version`)).json();
  } catch {}

  add('cdp-port', !!version && portOwner(st.cdpPort) === st.browserPid, version ? `${st.cdpPort} answers (${version.Browser}), owner PID ${portOwner(st.cdpPort)} (recorded browser PID ${st.browserPid}, child of session PID ${st.pid})` : `${st.cdpPort} does not answer`);
  const ext = runCode(EXT_INFO);
  add('extension', ext.info?.state === 'ENABLED' && ext.serviceWorkers.length > 0, ext.info ? `${ext.info.name} ${ext.info.version} ${ext.info.state} (${ext.info.location}, ${ext.info.path}); service worker ${ext.serviceWorkers.length ? 'running' : 'absent'}; errors ${ext.info.runtimeErrors}/${ext.info.manifestErrors}` : 'not registered');
  const page = runCode(`async (page) => ({ url: page.url(), ngVersion: await page.evaluate(() => document.querySelector('[ng-version]')?.getAttribute('ng-version') ?? null), devBuild: await page.evaluate(() => typeof window.ng === 'object' && typeof window.ng.getComponent === 'function'), flag: await page.evaluate(() => window.__NG_DEVTOOLS_CONNECTED__ === true) })`);
  add('app', !!page.ngVersion && page.devBuild, `${page.url}: ng-version ${page.ngVersion}, window.ng ${page.devBuild ? 'present (development build)' : 'absent (production build or not Angular)'}`);
  add('connected-flag', page.flag, `window.__NG_DEVTOOLS_CONNECTED__ ${page.flag}`);
  const devtools = (await targets(st.cdpPort)).some(isDevtools);
  add('devtools-window', devtools, devtools ? 'DevTools window target present' : 'no devtools:// target');

  return { ok: checks.every((c) => c.ok), checks };
}

async function cmdAttach() {
  requireState();
  const r = runCode(ATTACH_PROBE);
  const d = r.detection ?? {};
  const ok = r.flag && d.isAngular && d.isDebugMode && r.backendInstalled && !!r.backendReady;
  log(ok ? 'OK' : 'ERROR', `flag ${r.flag} (set at ${r.flagSetAt} ms); detection ${JSON.stringify(d)}; backendInstalled ${r.backendInstalled}; backendReady at ${r.backendReady} ms; Angular ${r.ngVersion}`);

  if (!ok) {
    throw new Unhealthy(`not attached: ${JSON.stringify(r)}`);
  }

  return { ok, ...r };
}

async function cmdPanel() {
  const st = requireState();
  const sub = pos[0] ?? 'show';
  await showPanel(st.cdpPort);

  if (sub === 'show') {
    const text = await evalIn(st.cdpPort, isPanel, PANEL.text);
    log('OK', `Angular panel: ${text}`);

    return { ok: true, text };
  }

  if (sub === 'signal-graph') {
    const nodes = await panelSignalGraph(st.cdpPort, opts.component ?? 'app-counter');
    log(nodes ? 'OK' : 'ERROR', `signal graph pane: ${(nodes ?? []).map((n) => `${n.kind}:${n.text[0]}`).join(', ')}`);

    return { ok: !!nodes, nodes };
  }

  if (sub === 'screenshot') {
    const file = resolve(opts.file ?? join(st.evidenceDir, `devtools-${Date.now()}.png`));
    await screenshotTarget(st.cdpPort, isDevtools, file);
    log('OK', `DevTools window screenshot ${file}`);

    return { ok: true, file };
  }

  refuse(`unknown panel subcommand ${sub}; use show, signal-graph, screenshot`);
}

// Coexistence checks an in-page AI extension shares with Angular DevTools.
async function cmdCoexist() {
  const st = requireState();
  const component = opts.component ?? 'app-counter';
  const click = opts.click ?? "getByRole('button', { name: 'Increment' })";
  const results = {};
  await showPanel(st.cdpPort);

  // 1. Profiler: two extra subscribers, removing one leaves the other and the DevTools recording running.
  await evalIn(st.cdpPort, isPanel, PANEL.tab('Profiler'));
  await waitFor(() => evalIn(st.cdpPort, isPanel, `async () => !!document.querySelector('button[aria-label="Start recording"]')`), 10000);
  const started = await evalIn(st.cdpPort, isPanel, PANEL.recordButton);
  const prof = runCode(`async (page) => {
    const text = () => page.locator(${JSON.stringify(component)}).innerText();
    const clickAndSettle = async () => { const before = await text(); await page.${click}.click(); await page.waitForFunction(([sel, b]) => document.querySelector(sel)?.innerText !== b, [${JSON.stringify(component)}, before]); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 50)))); };
    await page.evaluate(() => { window.__ngdtCoexist = { a: 0, b: 0 }; window.__ngdtRemoveA = ng.ɵsetProfiler(() => window.__ngdtCoexist.a++); window.__ngdtRemoveB = ng.ɵsetProfiler(() => window.__ngdtCoexist.b++); });
    await clickAndSettle();
    const bothOn = await page.evaluate(() => { const s = { ...window.__ngdtCoexist }; window.__ngdtRemoveA(); return s; });
    await clickAndSettle();
    const afterRemoveA = await page.evaluate(() => { const s = { ...window.__ngdtCoexist }; window.__ngdtRemoveB(); return s; });
    return { bothOn, afterRemoveA };
  }`);
  const stopped = await evalIn(st.cdpPort, isPanel, PANEL.recordButton);
  const summary = await waitFor(async () => {
    const s = await evalIn(st.cdpPort, isPanel, PANEL.profilerSummary);

    return s.cycles !== null ? s : null;
  }, 10000);
  results.profiler = {
    ok: prof.bothOn.a > 0 && prof.bothOn.b > 0 && prof.afterRemoveA.a === prof.bothOn.a && prof.afterRemoveA.b > prof.bothOn.b && (summary?.cycles ?? 0) >= 2,
    recording: [started, stopped],
    subscribers: prof,
    devtoolsCycles: summary?.cycles ?? null,
  };
  log(results.profiler.ok ? 'OK' : 'ERROR', `profiler: own subscribers ${JSON.stringify(prof)}; DevTools recorded ${summary?.cycles} change detection cycles`);

  // 2. Connected flag: present and true; Angular reads it, an AI extension must not overwrite it.
  const flag = runCode(`async (page) => page.evaluate(() => ({ value: window.__NG_DEVTOOLS_CONNECTED__ }))`);
  results.flag = { ok: flag.value === true, ...flag };
  log(results.flag.ok ? 'OK' : 'ERROR', `connected flag ${JSON.stringify(flag)}`);

  // 3. Signal graph: ng.ɵgetSignalGraph and the DevTools pane agree.
  const readNg = `async (page) => page.evaluate((sel) => ng.ɵgetSignalGraph(ng.getInjector(document.querySelector(sel))).nodes.map((n) => n.kind + ':' + (n.label ?? '')), ${JSON.stringify(component)})`;
  const ngBefore = runCode(readNg);
  const paneBefore = await panelSignalGraph(st.cdpPort, component);
  results.signalGraph = { ok: !!paneBefore && paneBefore.length === ngBefore.length, ng: ngBefore, pane: paneBefore?.map((n) => `${n.kind}:${n.text[0]}`) };
  log(results.signalGraph.ok ? 'OK' : 'ERROR', `signal graph: ng ${ngBefore.length} nodes, pane ${paneBefore?.length ?? 0} nodes`);
  results.screenshotBefore = await screenshotTarget(st.cdpPort, isDevtools, join(st.evidenceDir, 'signal-graph-before.png'));

  // 4. Angular's angular:di_graph tool versus the signal graph (changes the page until reload).
  if (opts['di-graph']) {
    runCode(`async (page) => page.evaluate(async () => { let g = null; const ev = new CustomEvent('devtoolstooldiscovery'); ev.respondWith = (x) => { g = x; }; window.dispatchEvent(ev); await g.tools.find((t) => t.name === 'angular:di_graph').execute({}); return true; })`);
    const ngAfter = runCode(readNg);
    runCode(`async (page) => { const sel = ${JSON.stringify(component)}; const before = await page.locator(sel).innerText(); await page.${click}.click(); await page.waitForFunction(([s, b]) => document.querySelector(s)?.innerText !== b, [sel, before]); return true; }`);
    const paneAfter = await waitFor(async () => {
      const n = await evalIn(st.cdpPort, isPanel, PANEL.readSignalGraph);

      return n.length && n.length !== paneBefore.length ? n : null;
    }, 8000) ?? (await panelSignalGraph(st.cdpPort, component));
    results.diGraph = {
      templateLostInNg: ngBefore.some((n) => n.startsWith('template:')) && !ngAfter.some((n) => n.startsWith('template:')),
      templateLostInPane: paneBefore.some((n) => n.kind === 'template') && !paneAfter.some((n) => n.kind === 'template'),
      ngAfter,
      paneAfter: paneAfter.map((n) => `${n.kind}:${n.text[0]}`),
    };
    results.screenshotAfter = await screenshotTarget(st.cdpPort, isDevtools, join(st.evidenceDir, 'signal-graph-after-di-graph.png'));
    log(results.diGraph.templateLostInPane ? 'WARN' : 'OK', `after angular:di_graph: ng ${JSON.stringify(ngAfter)}; pane ${JSON.stringify(results.diGraph.paneAfter)}`);
  }

  writeFileSync(join(st.evidenceDir, 'coexist.json'), JSON.stringify(results, null, 2));
  const ok = results.profiler.ok && results.flag.ok && results.signalGraph.ok;

  return { ok, evidence: join(st.evidenceDir, 'coexist.json'), ...results };
}

async function cmdInfo() {
  const st = requireState();
  log('INFO', `flow ${st.flowId}, session ${st.session}, app ${st.appUrl}, playwright-cli PID ${st.pid}, browser PID ${st.browserPid}, CDP ${st.cdpPort}, Angular DevTools ${st.extensionVersion}, evidence ${st.evidenceDir}, state ${STATE}`);

  return { ok: true, statePath: STATE, ...st };
}

async function cmdDown() {
  const st = requireState();
  const live = checkIdentity(st);
  const notes = [];

  if (live) {
    const r = pw(['close']);
    notes.push(`playwright-cli close: ${r.out.trim().split('\n')[0]}`);

    if (!(await waitFor(() => !processById(st.pid) && !(st.browserPid && processById(st.browserPid)), 10000))) {
      spawnSync('taskkill', ['/PID', String(st.pid), '/T', '/F'], { encoding: 'utf8' });
      notes.push(`taskkill /T /F ${st.pid}`);
    }
  } else {
    notes.push(`PID ${st.pid} already gone`);
    pw(['close']);
  }

  rmSync(STATE, { force: true });
  rmSync(st.configPath ?? join(TMP, 'state', `${flowId}.cli.config.json`), { force: true });
  rmSync(st.profile, { recursive: true, force: true });
  notes.push(`removed state, config and profile; evidence kept in ${st.evidenceDir}`);
  notes.forEach((n) => log('OK', n));

  return { ok: true, notes, evidenceDir: st.evidenceDir, pid: st.pid, browserPid: st.browserPid, cdpPort: st.cdpPort, session: st.session };
}

const HELP = `control.mjs <command> [options] [--json]
  install   [--browser test|chrome|chrome-beta|edge|edge-dev] [--from edge-dev|edge|chrome|chrome-beta|<dir>] [--profile Default] [--timeout S]
  uninstall [--browser ...] [--profile Default] [--timeout S]
  status    [--browser ...] [--profile Default]
  up        --app-url <url> [--cdp-port N]       (test harness only)
  doctor | attach | info | down
  panel     show | signal-graph [--component app-counter] | screenshot [--file f.png]
  coexist   [--component app-counter] [--click "getByRole('button', { name: 'Increment' })"] [--di-graph]`;

const COMMANDS = { install: cmdInstall, uninstall: cmdUninstall, status: cmdStatus, up: cmdUp, doctor: cmdDoctor, attach: cmdAttach, panel: cmdPanel, coexist: cmdCoexist, info: cmdInfo, down: cmdDown };

if (!COMMANDS[cmd]) {
  console.log(HELP);
  process.exit(cmd ? 2 : 0);
}

try {
  const result = await COMMANDS[cmd]();

  if (opts.json) {
    console.log(JSON.stringify(result, null, 2));
  }

  process.exit(result.ok ? 0 : 1);
} catch (e) {
  const code = e instanceof Unhealthy ? 1 : 2;
  const reason = e instanceof Refusal ? `refused: ${e.message}` : e.message;

  if (opts.json) {
    console.log(JSON.stringify({ ok: false, exit: code, reason }, null, 2));
  } else {
    console.log(`[ERROR] ${reason}`);
  }

  process.exit(code);
}
