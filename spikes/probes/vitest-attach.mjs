// Spike: does an extension (the S1 probe extension) reach the Vitest Browser Mode tester iframe, and what do
// window.ng, the signal graph, the profiler, the injector and LanguageModel report from there?
//
// Route "attach":   the counter's tests run in an already running per-model instance (CDP port --cdp-port),
//                   through vitest-attach.config.mts; the extension is loaded with Extensions.loadUnpacked.
// Route "chromium": the tests run in Playwright's bundled Chromium with a persistent context and
//                   --load-extension, through vitest-extension.config.mts; a CDP port is opened for this runner.
//
// node spikes/probes/vitest-attach.mjs --route attach --cdp-port 9334 --label gemma4 [--vitest-port 51316] [--hold 24000]
// node spikes/probes/vitest-attach.mjs --route chromium --cdp-port 9350 --label chromium
//
// Writes research/raw/vitest-<route>-<label>.json. Runs one `ng test` process and waits for it to exit.
import { spawn } from 'node:child_process';
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Cdp, evalIn, frameContexts, sleep, writeS1VitestVariant } from './vitest-lib.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..', '..');
const FIXTURE = join(ROOT, 'spikes', 'ng222-app');
const IFRAME_PROBE = readFileSync(join(HERE, 'vitest-iframe-probe.js'), 'utf8').replace(/^\/\/.*\n/gm, '');

const opts = {};

for (let i = 2; i < process.argv.length; i++) {
  const [k, v] = process.argv[i].replace(/^--/, '').split('=');
  opts[k] = v ?? (process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true);
}

const route = opts.route;
const cdpPort = Number(opts['cdp-port']);
const vitestPort = Number(opts['vitest-port'] ?? 51316);
const holdMs = Number(opts.hold ?? 24000);
const label = opts.label ?? route;

if (!['attach', 'chromium'].includes(route) || !cdpPort) {
  console.error('usage: node vitest-attach.mjs --route attach|chromium --cdp-port <n> [--label <name>] [--vitest-port <n>] [--hold <ms>]');
  process.exit(2);
}

const log = (...a) => console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);

async function waitFor(fn, timeoutMs, everyMs = 250) {
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

// Test extension: the S1 extension variant whose content scripts reach the Vitest tester iframe.
const EXT_DIR = writeS1VitestVariant(join(ROOT, 'tmp', 'vitest-ext', label));

const evidence = { route, label, cdpPort, vitestPort, holdMs, startedAt: new Date().toISOString(), steps: {} };
const OUT = join(ROOT, 'research', 'raw', `vitest-${route}-${label}.json`);
let cdp;
let extId;
let ngTest;
const created = [];
const userDataDir = join(ROOT, 'tmp', 'vitest-ext', `${label}-profile`);

try {
  const env = {
    ...process.env,
    VITEST_BROWSER_PORT: String(vitestPort),
    VITE_COUNTER_HOLD_MS: String(holdMs),
  };

  if (route === 'attach') {
    const version = await (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json();
    evidence.browser = version.Browser;
    cdp = await Cdp.connect(version.webSocketDebuggerUrl);
    extId = (await cdp.send('Extensions.loadUnpacked', { path: EXT_DIR })).id;
    evidence.steps.extension = `Extensions.loadUnpacked: ${extId}`;
    env.VITEST_CDP_URL = `http://127.0.0.1:${cdpPort}`;
  } else {
    rmSync(userDataDir, { recursive: true, force: true });
    env.VITEST_EXTENSION_DIR = EXT_DIR;
    env.VITEST_CDP_PORT = String(cdpPort);
    env.VITEST_USER_DATA_DIR = userDataDir;
  }

  const config = route === 'attach' ? 'attach' : 'extension';
  evidence.command = `ng test -c ${config} --watch=false --filter "keeps the counter mounted" (VITEST_BROWSER_PORT=${vitestPort}, VITE_COUNTER_HOLD_MS=${holdMs})`;
  const output = [];
  ngTest = spawn(process.execPath, ['node_modules/@angular/cli/bin/ng.js', 'test', '-c', config, '--watch=false', '--filter', 'keeps the counter mounted'], { cwd: FIXTURE, env, stdio: ['ignore', 'pipe', 'pipe'] });
  ngTest.stdout.on('data', (d) => output.push(String(d)));
  ngTest.stderr.on('data', (d) => output.push(String(d)));
  const exited = new Promise((r) => ngTest.on('exit', (code) => r(code)));
  log('ng test started', ngTest.pid);

  if (route === 'chromium') {
    const version = await waitFor(async () => (await fetch(`http://127.0.0.1:${cdpPort}/json/version`)).json(), 60000);

    if (!version) {
      throw new Error(`no CDP endpoint on ${cdpPort}`);
    }

    evidence.browser = version.Browser;
    cdp = await Cdp.connect(version.webSocketDebuggerUrl);
    const sw = await waitFor(async () => (await cdp.targets()).find((t) => t.type === 'service_worker' && t.url.startsWith('chrome-extension://')), 15000);
    extId = sw ? new URL(sw.url).host : null;
    evidence.steps.extension = sw ? `--load-extension: ${extId}` : 'extension service worker not seen';
  }

  const ext = `chrome-extension://${extId}`;
  const orchestrator = await waitFor(async () => (await cdp.targets()).find((t) => t.type === 'page' && t.url.includes(`:${vitestPort}/`)), 60000);

  if (!orchestrator) {
    throw new Error('no Vitest orchestrator page appeared');
  }

  evidence.orchestratorUrl = orchestrator.url;
  evidence.targetsDuringRun = (await cdp.targets()).map((t) => `${t.type} ${t.url}`);
  log('orchestrator', orchestrator.url);
  const sid = await cdp.session(orchestrator.targetId);
  await cdp.send('Page.enable', {}, sid);

  // The tester iframe and its main-world context, once the Counter is mounted.
  let tester;
  let lastPoll;
  const found = await waitFor(async () => {
    const tree = (await cdp.send('Page.getFrameTree', {}, sid)).frameTree;
    const kids = tree.childFrames ?? [];
    const contexts = await frameContexts(cdp, sid);
    lastPoll = { top: tree.frame.url, kids: kids.map((k) => k.frame.url), contexts: contexts.map((c) => ({ frameId: c.auxData?.frameId, isDefault: c.auxData?.isDefault, type: c.auxData?.type, name: c.name })), checks: [] };

    for (const k of kids) {
      const ctx = contexts.find((c) => c.auxData?.frameId === k.frame.id && c.auxData?.isDefault);

      const check = ctx ? await evalIn(cdp, sid, ctx.id, `({ ng: typeof window.ng, counter: Boolean(document.querySelector('[ng-version]')), body: document.body?.innerHTML.slice(0, 200) ?? null })`) : 'no default context';
      lastPoll.checks.push({ url: k.frame.url, frameId: k.frame.id, check });

      if (check?.ng === 'object' && check.counter) {
        tester = { frame: k.frame, contextId: ctx.id, contexts, tree };

        return true;
      }
    }

    return false;
  }, 60000, 500);

  if (!found) {
    evidence.lastPoll = lastPoll;
    throw new Error('the tester iframe never showed a mounted Counter with window.ng');
  }

  evidence.frameTree = {
    top: tester.tree.frame.url,
    children: (tester.tree.childFrames ?? []).map((c) => ({ url: c.frame.url, name: c.frame.name, securityOrigin: c.frame.securityOrigin })),
  };
  evidence.executionContexts = tester.contexts.map((c) => ({ frameId: c.auxData?.frameId === tester.frame.id ? 'tester' : c.auxData?.frameId === tester.tree.frame.id ? 'top' : 'other', type: c.auxData?.type, isDefault: c.auxData?.isDefault, name: c.name, origin: c.origin }));
  const testerUrl = tester.frame.url;
  log('tester', testerUrl);

  evidence.iframeMount = await evalIn(cdp, sid, tester.contextId, `(${IFRAME_PROBE})('mount')`);
  const topCtx = tester.contexts.find((c) => c.auxData?.frameId === tester.tree.frame.id && c.auxData?.isDefault);
  evidence.orchestratorReach = await evalIn(
    cdp,
    sid,
    topCtx.id,
    `(() => {
      const frames = [...document.querySelectorAll('iframe')];
      return frames.map((f) => {
        const out = { src: f.src, dataVitest: f.getAttribute('data-vitest'), name: f.name };
        try {
          const w = f.contentWindow;
          out.sameOrigin = w.location.origin === location.origin;
          out.typeofNg = typeof w.ng;
          out.counterText = w.document.querySelector('[ng-version]')?.textContent.trim() ?? null;
          out.getComponentName = w.ng?.getComponent(w.document.querySelector('[ng-version]'))?.constructor?.name ?? null;
        } catch (e) {
          out.error = String(e);
        }
        return out;
      });
    })()`,
  );
  evidence.orchestratorGlobals = await evalIn(cdp, sid, topCtx.id, `({ href: location.href, vitestBrowserRunner: typeof window.__vitest_browser_runner__, vitestBrowserRunnerKeys: window.__vitest_browser_runner__ ? Object.keys(window.__vitest_browser_runner__).sort() : [], typeofNg: typeof window.ng })`);

  // DevTools for the orchestrator tab, the S1 panel, and inspectedWindow.eval into the tester frame.
  if (extId) {
    const before = new Set((await cdp.targets()).filter((t) => t.url.startsWith('devtools://')).map((t) => t.targetId));
    await cdp.send('Target.openDevTools', { targetId: orchestrator.targetId }).catch((e) => (evidence.steps.openDevToolsError = e.message));
    const devtools = await waitFor(async () => (await cdp.targets()).find((t) => t.url.startsWith('devtools://') && !before.has(t.targetId)), 15000);

    if (devtools) {
      created.push(devtools.targetId);
      const panelId = JSON.stringify(`${ext}S1`);
      evidence.steps.panelRegistered = Boolean(
        await waitFor(() => cdp.evaluate(devtools.targetId, `typeof UI !== 'undefined' && Object.keys(UI.panels ?? {}).includes(${panelId})`), 15000),
      );
      await cdp.evaluate(devtools.targetId, `(() => { Extensions.extensionServer.onShowPanel({ command: 'showPanel', id: ${panelId} }); return true; })()`).catch((e) => (evidence.steps.panelShowError = e.message));
      const panel = await waitFor(async () => (await cdp.targets()).find((t) => t.url === `${ext}/panel.html`), 15000);
      evidence.steps.panelTarget = panel ? panel.type : 'not seen';

      if (panel) {
        const inspected = (frameURL) =>
          `new Promise((res) => chrome.devtools.inspectedWindow.eval(
            "JSON.stringify({ href: location.href, typeofNg: typeof window.ng, counterText: document.querySelector('[ng-version]')?.textContent.trim() ?? null, getComponentName: window.ng?.getComponent(document.querySelector('[ng-version]'))?.constructor?.name ?? null })",
            ${frameURL ? `{ frameURL: ${JSON.stringify(frameURL)} }` : '{}'},
            (result, exceptionInfo) => res({ result: result ? JSON.parse(result) : null, exceptionInfo: exceptionInfo ?? null })))`;
        evidence.panelInspectedWindowTop = await cdp.evaluate(panel.targetId, inspected(null)).catch((e) => ({ error: e.message }));
        evidence.panelInspectedWindowTester = await cdp.evaluate(panel.targetId, inspected(testerUrl)).catch((e) => ({ error: e.message }));
      }
    } else {
      evidence.steps.devtools = 'no DevTools target appeared';
    }
  }

  // LanguageModel answering in the tester iframe (main world).
  evidence.iframePrompt = await evalIn(cdp, sid, tester.contextId, `(${IFRAME_PROBE})('prompt')`, 120000).catch((e) => ({ error: e.message }));

  // Profiler events from the test's own click, which happens at holdMs / 2 after mount.
  await waitFor(() => evalIn(cdp, sid, tester.contextId, `document.querySelector('[ng-version]')?.textContent.includes('Clicks: 4') ?? false`), holdMs, 250);
  evidence.iframeAfterClick = await evalIn(cdp, sid, tester.contextId, `(${IFRAME_PROBE})('after')`).catch((e) => ({ error: e.message }));

  // What the extension's own contexts recorded.
  if (extId) {
    const sw = (await cdp.targets()).find((t) => t.type === 'service_worker' && t.url.startsWith(ext));
    evidence.extensionStorage = sw ? await cdp.evaluate(sw.targetId, 'chrome.storage.local.get(null)') : 'service worker target not found';
  }

  await cdp.send('Target.detachFromTarget', { sessionId: sid }).catch(() => {});
  evidence.ngTestExitCode = await exited;
  evidence.ngTestOutputTail = output.join('').replace(/\x1b\[[0-9;]*m/g, '').split('\n').filter((l) => l.trim()).slice(-14);
  ngTest = null;
  log('ng test exited', evidence.ngTestExitCode);
} catch (e) {
  evidence.error = e.stack ?? String(e);
  log('error', e.message);
} finally {
  if (ngTest) {
    ngTest.kill();
    evidence.steps.ngTestKilled = true;
  }

  for (const id of created) {
    await cdp?.send('Target.closeTarget', { targetId: id }, undefined, 3000).catch(() => {});
  }

  if (route === 'attach' && extId) {
    await cdp.send('Extensions.uninstall', { id: extId }).catch((e) => (evidence.steps.uninstallError = e.message));
    evidence.steps.uninstalled = true;
  }

  cdp?.ws.close();
  evidence.finishedAt = new Date().toISOString();
  writeFileSync(OUT, JSON.stringify(evidence, null, 2));
  log('wrote', OUT);
}
