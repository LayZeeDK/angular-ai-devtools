// Spike S1 runner: launches a fresh browser (or attaches to a running one with --attach), loads this extension
// unpacked over CDP, reaches every context, runs one tool round trip per context where the model is available
// (one context at a time), and writes research/s1-results/<browser>-<model>.json.
//
// node run-s1.mjs --browser chrome|edge --port 9341 [--model fresh] [--attach] [--keep-profile]
import { spawn } from 'node:child_process';
import { copyFileSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const EXT_DIR = HERE;
const EXT_NAME = 'S1 Prompt API context probe';
const TEST_URL = 'https://example.com/';
const STANDING_PORTS = [9333, 9334, 9335, 9337];
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

const opts = {};

for (let i = 2; i < process.argv.length; i++) {
  const [k, v] = process.argv[i].replace(/^--/, '').split('=');

  if (v !== undefined) {
    opts[k] = v;
  } else if (process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) {
    opts[k] = process.argv[++i];
  } else {
    opts[k] = true;
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

if (!attach && STANDING_PORTS.includes(port)) {
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
    c.listeners = new Set();
    c.ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);

      if (!m.id) {
        c.listeners.forEach((l) => l(m));

        return;
      }

      const p = c.pending.get(m.id);

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

  send(method, params = {}, sessionId, timeoutMs = 30000) {
    const id = this.nextId++;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) {
          reject(new Error(`${method}: timeout`));
        }
      }, timeoutMs);
      const done = (fn) => (v) => {
        clearTimeout(timer);
        fn(v);
      };
      this.pending.set(id, { resolve: done(resolve), reject: done(reject), method });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }

  async session(targetId) {
    return (await this.send('Target.attachToTarget', { targetId, flatten: true })).sessionId;
  }

  // isolatedWorld: evaluate in this extension's isolated content-script world instead of the default world.
  async evaluate(targetId, expression, { timeoutMs = 30000, isolatedWorld = false } = {}) {
    const sid = await this.session(targetId);
    const contexts = [];
    const listener = (m) => {
      if (m.sessionId === sid && m.method === 'Runtime.executionContextCreated') {
        contexts.push(m.params.context);
      }
    };
    this.listeners.add(listener);

    try {
      const params = { expression, awaitPromise: true, returnByValue: true };

      if (isolatedWorld) {
        await this.send('Runtime.enable', {}, sid);
        const ctx = contexts.find((c) => c.auxData?.type === 'isolated' && c.name === EXT_NAME);

        if (!ctx) {
          throw new Error(`no isolated world named "${EXT_NAME}"; contexts: ${contexts.map((c) => `${c.auxData?.type}:${c.name}`).join(', ')}`);
        }

        params.contextId = ctx.id;
      }

      const r = await this.send('Runtime.evaluate', params, sid, timeoutMs);

      if (r.exceptionDetails) {
        throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
      }

      return r.result.value;
    } finally {
      this.listeners.delete(listener);
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
let cdp;
const created = [];

try {
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

  // 2. Test tab: content scripts run here. DevTools for it runs devtools_page: auto-opened in launch mode,
  // Target.openDevTools otherwise.
  const before = new Set((await cdp.targets()).filter((t) => t.url.startsWith('devtools://')).map((t) => t.targetId));
  const { targetId: testTab } = await cdp.send('Target.createTarget', { url: TEST_URL });
  created.push(testTab);
  const newDevtools = async () => (await cdp.targets()).find((t) => t.url.startsWith('devtools://') && !before.has(t.targetId));
  let devtools = await waitFor(newDevtools, attach ? 3000 : 15000);

  if (devtools) {
    evidence.steps.devtoolsOpen = `--auto-open-devtools-for-tabs: ${devtools.url.split('?')[0]}`;
  } else {
    try {
      const r = await cdp.send('Target.openDevTools', { targetId: testTab });
      devtools = await waitFor(newDevtools, 15000);
      evidence.steps.devtoolsOpen = `Target.openDevTools (returned ${JSON.stringify(r)}): ${devtools ? devtools.url.split('?')[0] : 'no DevTools target seen'}`;

      if (devtools) {
        created.push(devtools.targetId);
      }
    } catch (e) {
      evidence.steps.devtoolsOpen = `Target.openDevTools failed: ${e.message}`;
    }
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

  // 5. Collect the load-time (exposure) results.
  const { targetId: resultsTab } = await cdp.send('Target.createTarget', { url: `${ext}/results.html` });
  created.push(resultsTab);
  const readResults = async () => JSON.parse(await cdp.evaluate(resultsTab, `chrome.storage.local.get(null).then((a) => JSON.stringify(a))`));
  await waitFor(async () => {
    const r = await readResults();

    return CONTEXTS.every((c) => c in r);
  }, 30000, 1000);
  evidence.loadTime = await readResults();
  evidence.missingContexts = CONTEXTS.filter((c) => !(c in evidence.loadTime));

  // 6. One tool round trip per context where the model is available, one context at a time.
  const targets = await cdp.targets();
  const byUrl = (u) => targets.find((t) => t.url === u);
  const reach = {
    extension_tab: { target: extTab },
    side_panel: { target: byUrl(`${ext}/sidepanel.html`)?.targetId },
    devtools_panel: { target: byUrl(`${ext}/panel.html`)?.targetId },
    devtools_page: { target: byUrl(`${ext}/devtools.html`)?.targetId },
    service_worker: { target: targets.find((t) => t.type === 'service_worker' && t.url === `${ext}/sw.js`)?.targetId },
    offscreen: { target: byUrl(`${ext}/offscreen.html`)?.targetId },
    content_isolated: { target: testTab, isolatedWorld: true },
    content_main: { target: testTab },
  };
  evidence.roundTrips = {};

  for (const ctx of CONTEXTS) {
    const { target, isolatedWorld } = reach[ctx];

    if (!['available', 'unavailable'].includes(evidence.loadTime[ctx]?.availability) || !attach) {
      evidence.roundTrips[ctx] = `skipped: load-time availability ${evidence.loadTime[ctx]?.availability ?? 'none'}`;
      continue;
    }

    if (!target) {
      evidence.roundTrips[ctx] = 'skipped: no target';
      continue;
    }

    log('round trip', ctx);
    const t0 = Date.now();
    evidence.roundTrips[ctx] = await cdp
      .evaluate(target, `s1RunRoundTrip(${JSON.stringify(ctx)})`, { timeoutMs: 240000, isolatedWorld })
      .catch((e) => ({ runnerError: e.message }));
    log('  done', ctx, `${Date.now() - t0} ms`, evidence.roundTrips[ctx]?.roundTripError ?? evidence.roundTrips[ctx]?.runnerError ?? evidence.roundTrips[ctx]?.roundTrip?.answer?.slice(0, 80));
  }

  // results.html shows the store, which now holds the round-trip results the contexts saved.
  await sleep(1000);
  evidence.results = await readResults();
  evidence.resultsHtmlKeys = Object.keys(evidence.results);
  evidence.targets = targets.map((t) => ({ type: t.type, url: t.url.slice(0, 120) }));
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
    for (const t of created.reverse()) {
      await cdp.send('Target.closeTarget', { targetId: t }).catch(() => {});
    }

    if (evidence.extensionId) {
      await cdp
        .send('Extensions.uninstall', { id: evidence.extensionId })
        .then(() => log('extension unloaded'))
        .catch((e) => log('uninstall failed', e.message));
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
}
