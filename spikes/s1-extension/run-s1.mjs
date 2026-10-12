// Spike S1 runner: launches a fresh browser (or attaches with --attach), loads this extension unpacked over CDP,
// reaches every context, and writes research/s1-results/<browser>-<model>.json.
//
// node run-s1.mjs --browser chrome|edge --port 9341 [--model fresh] [--attach] [--keep-profile]
import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const EXT_DIR = HERE;
const FORBIDDEN_LAUNCH_PORTS = [9333, 9334, 9335, 9337];
const CONTEXTS = ['devtools_page', 'devtools_panel', 'side_panel', 'service_worker', 'offscreen', 'content_isolated', 'content_main', 'extension_tab'];
const BROWSERS = {
  chrome: {
    exe: 'C:\\Program Files\\Google\\Chrome Beta\\Application\\chrome.exe',
    features: 'AIPromptAPI,AIPromptAPIToolUse,OnDeviceModelConversationBackend,AIApiFoundationalModel:model_version/v4,OptimizationGuideManifestBroker,AISummarizationAPI,AIWriterAPI,AIRewriterAPI,WebMCP',
  },
  edge: {
    exe: 'C:\\Program Files (x86)\\Microsoft\\Edge Dev\\Application\\msedge.exe',
    features: 'AIPromptAPI,AIPromptAPIStructuredOutput,AIPromptAPIToolUse,AIRewriterAPI,AISummarizationAPI,AIWriterAPI,WebMCP,msEdgeLLMOnDeviceModelMuffinToolUseWorkaround,msEdgeLLMOnDeviceModelPrerelease',
  },
};

const opts = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');

    return [k, v ?? true];
  }),
);

for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];

  if (a.startsWith('--') && !a.includes('=') && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    opts[a.slice(2)] = process.argv[++i];
  }
}

const browserName = opts.browser;
const port = Number(opts.port);
const model = opts.model ?? 'fresh';
const attach = Boolean(opts.attach);

if (!BROWSERS[browserName] || !port) {
  console.error('usage: node run-s1.mjs --browser chrome|edge --port <n> [--model <label>] [--attach] [--keep-profile]');
  process.exit(2);
}

if (!attach && FORBIDDEN_LAUNCH_PORTS.includes(port)) {
  console.error(`port ${port} belongs to a standing instance; launch mode refuses it`);
  process.exit(2);
}

// Chrome injects a file once per frame even when two content-script entries in different worlds list it,
// so the MAIN-world entry needs its own file name. Regenerated from probe.js on every run.
copyFileSync(join(EXT_DIR, 'probe.js'), join(EXT_DIR, 'probe-main.js'));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

async function waitFor(fn, timeoutMs, everyMs = 500) {
  const end = Date.now() + timeoutMs;

  while (Date.now() < end) {
    try {
      const v = await fn();

      if (v) {
        return v;
      }
    } catch {
      // keep polling
    }

    await sleep(everyMs);
  }

  return null;
}

// Minimal CDP client over the browser WebSocket with flattened target sessions.
class Cdp {
  static async connect(wsUrl) {
    const c = new Cdp();
    c.ws = new WebSocket(wsUrl);
    c.nextId = 1;
    c.pending = new Map();
    c.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      const p = m.id && c.pending.get(m.id);

      if (p) {
        c.pending.delete(m.id);
        m.error ? p.reject(new Error(`${p.method}: ${m.error.message}`)) : p.resolve(m.result);
      }
    });
    await new Promise((r, j) => {
      c.ws.addEventListener('open', r);
      c.ws.addEventListener('error', j);
    });

    return c;
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject, method });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      setTimeout(() => {
        if (this.pending.delete(id)) {
          reject(new Error(`${method}: timeout`));
        }
      }, 30000);
    });
  }

  async session(targetId) {
    return (await this.send('Target.attachToTarget', { targetId, flatten: true })).sessionId;
  }

  async evaluate(targetId, expression) {
    const sid = await this.session(targetId);

    try {
      const r = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }, sid);

      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      }

      return r.result.value;
    } finally {
      await this.send('Target.detachFromTarget', { sessionId: sid }).catch(() => {});
    }
  }

  async targets() {
    return (await this.send('Target.getTargets')).targetInfos;
  }
}

const evidence = { browser: browserName, model, port, mode: attach ? 'attach' : 'launch', startedAt: new Date().toISOString(), steps: {} };
const profile = join(ROOT, '.browsers', `s1-${browserName}-${port}`);
let child;
let server;
let cdp;
const created = [];

try {
  // Test page for the content scripts. localhost is a potentially trustworthy origin, so it is a secure context.
  server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><title>S1 test page</title><h1>S1 test page</h1>');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const testUrl = `http://localhost:${server.address().port}/s1-test`;

  if (!attach) {
    rmSync(profile, { recursive: true, force: true });
    const args = [
      `--user-data-dir=${profile}`,
      `--remote-debugging-port=${port}`,
      '--no-first-run',
      '--no-default-browser-check',
      `--enable-features=${BROWSERS[browserName].features}`,
      '--enable-unsafe-extension-debugging',
      '--auto-open-devtools-for-tabs',
      '--window-size=1800,1100',
      'about:blank',
    ];
    evidence.launchArgs = args;
    child = spawn(BROWSERS[browserName].exe, args, { stdio: 'ignore' });
  }

  const version = await waitFor(async () => (await fetch(`http://127.0.0.1:${port}/json/version`)).json(), 20000);

  if (!version) {
    throw new Error(`no CDP endpoint on port ${port}`);
  }

  evidence.version = version.Browser;
  cdp = await Cdp.connect(version.webSocketDebuggerUrl);
  log('connected', version.Browser);

  // 1. Load the extension unpacked over the CDP port.
  const { id: extId } = await cdp.send('Extensions.loadUnpacked', { path: EXT_DIR });
  evidence.extensionId = extId;
  evidence.steps.loadUnpacked = 'Extensions.loadUnpacked over --remote-debugging-port';
  const ext = `chrome-extension://${extId}`;
  const swUp = await waitFor(async () => (await cdp.targets()).find((t) => t.type === 'service_worker' && t.url.startsWith(ext)), 15000);
  evidence.steps.serviceWorkerTarget = swUp ? swUp.url : 'not seen';
  log('extension', extId, 'sw', Boolean(swUp));

  // 2. Test tab: content scripts run here; --auto-open-devtools-for-tabs opens DevTools for it, which runs devtools_page.
  const before = new Set((await cdp.targets()).filter((t) => t.url.startsWith('devtools://')).map((t) => t.targetId));
  const { targetId: testTab } = await cdp.send('Target.createTarget', { url: testUrl });
  created.push(testTab);
  let devtools = await waitFor(async () => (await cdp.targets()).find((t) => t.url.startsWith('devtools://') && !before.has(t.targetId)), 15000);

  if (!devtools) {
    // Fallback for attach mode or when auto-open is off: open DevTools for the tab through the frontend URL.
    evidence.steps.devtoolsOpen = 'no auto-opened DevTools window seen';
  } else {
    evidence.steps.devtoolsOpen = `--auto-open-devtools-for-tabs: ${devtools.url.split('?')[0]}`;
  }

  log('devtools', Boolean(devtools));

  // 3. Show the S1 panel so panel.html loads.
  if (devtools) {
    const panelId = JSON.stringify(`${ext}S1`);
    const registered = await waitFor(
      () => cdp.evaluate(devtools.targetId, `(async () => typeof UI !== 'undefined' && Object.keys(UI.panels ?? {}).includes(${panelId}))()`),
      15000,
    );
    evidence.steps.panelRegistered = Boolean(registered);

    try {
      await cdp.evaluate(devtools.targetId, `(async () => { Extensions.extensionServer.onShowPanel({ command: 'showPanel', id: ${panelId} }); return true; })()`);
      evidence.steps.panelShow = 'Extensions.extensionServer.onShowPanel';
    } catch (e) {
      evidence.steps.panelShowError = String(e.message);
    }

    let panelTarget = await waitFor(async () => (await cdp.targets()).find((t) => t.url === `${ext}/panel.html`), 8000);

    if (!panelTarget) {
      // Fallback: click the DevTools tab titled S1.
      const clicked = await cdp
        .evaluate(
          devtools.targetId,
          `(async () => { const walk = (n, out) => { if (n.shadowRoot) walk(n.shadowRoot, out); for (const c of n.children ?? []) { if (c.classList?.contains('tabbed-pane-header-tab') && c.textContent.trim() === 'S1') out.push(c); walk(c, out); } return out; }; const t = walk(document.body, [])[0]; if (!t) return false; t.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); t.click(); return true; })()`,
        )
        .catch((e) => String(e.message));
      evidence.steps.panelTabClick = clicked;
      panelTarget = await waitFor(async () => (await cdp.targets()).find((t) => t.url === `${ext}/panel.html`), 8000);
    }

    evidence.steps.panelTarget = panelTarget ? panelTarget.type : 'not seen';
  }

  // 4. Extension page in a tab (control), and the side panel opened from it with a keyboard gesture.
  const { targetId: extTab } = await cdp.send('Target.createTarget', { url: `${ext}/tab.html` });
  created.push(extTab);
  await waitFor(() => cdp.evaluate(extTab, `document.readyState === 'complete' && document.activeElement?.id === 'side'`), 10000);
  await cdp.send('Target.activateTarget', { targetId: extTab });
  const sid = await cdp.session(extTab);
  await cdp.send('Page.bringToFront', {}, sid).catch(() => {});
  await cdp.send('Runtime.evaluate', { expression: `document.getElementById('side').focus()` }, sid);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' }, sid);
  await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }, sid);
  await cdp.send('Target.detachFromTarget', { sessionId: sid }).catch(() => {});
  const side = await waitFor(async () => (await cdp.targets()).find((t) => t.url === `${ext}/sidepanel.html`), 10000);
  evidence.steps.sidePanel = side ? `chrome.sidePanel.open from tab.html on CDP Enter key: target ${side.type}` : 'sidepanel.html target not seen';
  log('side panel', Boolean(side));

  // 5. Collect.
  const { targetId: resultsTab } = await cdp.send('Target.createTarget', { url: `${ext}/results.html` });
  created.push(resultsTab);
  const readResults = async () => JSON.parse(await cdp.evaluate(resultsTab, `chrome.storage.local.get(null).then((a) => JSON.stringify(a))`));
  await waitFor(async () => {
    const r = await readResults();

    return CONTEXTS.every((c) => c in r);
  }, 30000, 1000);
  evidence.results = await readResults();
  evidence.missingContexts = CONTEXTS.filter((c) => !(c in evidence.results));
  await cdp.evaluate(resultsTab, 'location.reload()').catch(() => {});
  await sleep(1500);
  evidence.resultsHtmlKeys = Object.keys(JSON.parse(await cdp.evaluate(resultsTab, "document.getElementById('out').textContent")));
  evidence.mainWorldDiag = await cdp.evaluate(testTab, `(async () => { const step = async (name, p) => { try { return await Promise.race([p, new Promise((r) => setTimeout(() => r('timeout 8s'), 8000))]); } catch (e) { return 'ERR ' + e.name + ': ' + e.message; } }; return JSON.stringify({ typeofProbe: typeof s1Probe, availability: await step('a', LanguageModel.availability()), typeofErr: typeof s1Err, typeofOptions: typeof S1_TOOL_OPTIONS }); })()`).catch((e) => `ERR ${e.message}`);
  evidence.mainWorldMarker = await cdp.evaluate(testTab, 'JSON.stringify(window.__s1Main ?? null)').catch((e) => `ERR ${e.message}`);

  // 6. Late availability reading in every reachable target, 20 s on, to separate "API absent" from "model not known yet".
  await sleep(20000);
  evidence.lateReadAt = new Date().toISOString();
  evidence.late = {};
  const targets = await cdp.targets();
  evidence.targets = targets.map((t) => ({ type: t.type, url: t.url.slice(0, 120) }));

  for (const t of targets.filter((x) => x.url.startsWith(ext) || x.url === testUrl)) {
    const key = `${t.type} ${t.url.replace(ext, '')}`;
    evidence.late[key] = await cdp
      .evaluate(t.targetId, `(async () => typeof LanguageModel === 'undefined' ? 'LanguageModel undefined' : await LanguageModel.availability())()`)
      .catch((e) => `ERR ${e.message}`);
  }

  log('missing', evidence.missingContexts);
} catch (e) {
  evidence.fatal = String(e.stack ?? e);
  console.error(e);
} finally {
  evidence.finishedAt = new Date().toISOString();
  const outFile = join(ROOT, 'research', 's1-results', `${browserName}-${model}.json`);
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, JSON.stringify(evidence, null, 2));
  log('wrote', outFile);

  if (attach && cdp) {
    for (const t of created) {
      await cdp.send('Target.closeTarget', { targetId: t }).catch(() => {});
    }

    if (evidence.extensionId) {
      await cdp.send('Extensions.uninstall', { id: evidence.extensionId }).catch((e) => log('uninstall failed', e.message));
    }
  }

  if (!attach) {
    await cdp?.send('Browser.close').catch(() => {});
    await sleep(3000);
    child?.kill();

    if (!opts['keep-profile']) {
      const gone = await waitFor(() => {
        try {
          rmSync(profile, { recursive: true, force: true });

          return true;
        } catch {
          return false;
        }
      }, 20000, 1000);
      log('profile removed', Boolean(gone));
    }
  }

  cdp?.ws.close();
  server?.close();
}
