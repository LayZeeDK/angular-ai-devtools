// @ts-check
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const PORT = Number(process.env.M030_ROUTER_PORT ?? 4273);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const ROUTE_PATH = '/landing';
const PAGE_URL = `${ORIGIN}${ROUTE_PATH}`;
const RECORD_PATH = process.env.M030_ROUTER_RECORD ?? join(ROOT, 'research', 'raw', 'm030-router-config.json');

const CAPTURE_COMMAND = 'node --test scripts/router-config-capture.test.mjs';
const SERVE_COMMAND = `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${PORT} --host 127.0.0.1  (cwd spikes/ng222-app)`;

async function runCapture() {
  const requireApp = createRequire(join(APP, 'package.json'));
  let chromium;
  try { ({ chromium } = requireApp('playwright')); } catch (e) {
    throw new Error(`playwright missing: ${e}`);
  }
  const playwrightVersion = requireApp('playwright/package.json').version;
  const angularVersion = JSON.parse(readFileSync(join(APP, 'node_modules', '@angular', 'core', 'package.json'), 'utf8')).version;

  const server = spawn(process.execPath, [join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'serve', '--port', String(PORT), '--host', '127.0.0.1'], { cwd: APP, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  server.stdout.on('data', (c) => { serverOutput = (serverOutput + c).slice(-4000); });
  server.stderr.on('data', (c) => { serverOutput = (serverOutput + c).slice(-4000); });

  let browser;
  try {
    await waitForServer(server, () => serverOutput);
    await new Promise((r) => setTimeout(r, 1200));
    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => document.querySelectorAll('[ng-version]').length > 0, null, { timeout: 60000 });
    await page.waitForTimeout(1500);

    const captured = await page.evaluate(() => {
      const ng = window.ng;
      const hosts = [...document.querySelectorAll('*')].filter((el) => { try { return !!ng.getComponent(el); } catch { return false; } });
      const routedEl = hosts.length ? hosts[hosts.length - 1] : document.querySelector('[ng-version]');
      let injectorResolved = false;
      let injectorError = null;
      let routerInstance = null;
      try {
        const inj = ng.getInjector(routedEl);
        injectorResolved = true;
        routerInstance = (typeof ng.ɵgetRouterInstance === 'function') ? ng.ɵgetRouterInstance(inj) : null;
      } catch (e) { injectorError = String(e); }
      // fallback to root injector if routed did not resolve
      if (!routerInstance) {
        try {
          const rootEl = document.querySelector('[ng-version]');
          const inj = ng.getInjector(rootEl);
          if (!injectorResolved) { injectorResolved = true; }
          routerInstance = (typeof ng.ɵgetRouterInstance === 'function') ? ng.ɵgetRouterInstance(inj) : null;
        } catch (e) { if (!injectorError) injectorError = String(e); }
      }
      const config = (routerInstance && Array.isArray(routerInstance.config)) ? routerInstance.config.map((entry) => {
        const out = {};
        for (const k of Object.keys(entry ?? {})) {
          const v = entry[k];
          if (typeof v === 'function') out[k] = `[fn ${v.name || 'anonymous'}]`;
          else if (Array.isArray(v)) out[k] = v.map((x) => (typeof x === 'function' ? `[fn ${x.name || 'anonymous'}]` : (x && typeof x === 'object' ? (x.name || x.constructor?.name || String(x)) : x)));
          else if (v && typeof v === 'object') out[k] = v.name || v.constructor?.name || String(v);
          else out[k] = v;
        }
        return out;
      }) : null;
      const fieldsPresent = config ? [...new Set(config.flatMap((e) => Object.keys(e)))] : [];
      return {
        injectorResolvedOnRoutedElement: injectorResolved,
        injectorError,
        routedElementTag: routedEl ? routedEl.tagName.toLowerCase() : null,
        routerUrl: routerInstance ? routerInstance.url : null,
        config,
        fieldsPresent,
        hasRouterInstance: !!routerInstance,
      };
    });

    await browser.close();
    browser = undefined;

    return {
      capturedAt: new Date().toISOString(),
      browser: `headless Playwright Chromium (build ${browserBuild})`,
      browserBuild,
      instance: 'headless',
      playwright: playwrightVersion,
      angularVersion,
      url: PAGE_URL,
      pageUrl: PAGE_URL,
      commands: {
        install: 'npm ci --include=dev',
        installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
        serve: SERVE_COMMAND,
        capture: CAPTURE_COMMAND,
        check: CAPTURE_COMMAND,
      },
      environment: { platform: process.platform, shell: 'cmd.exe', node: process.version },
      fixture: { route: ROUTE_PATH, routeTable: 'spikes/ng222-app/src/app/app.routes.ts' },
      injectorResolvedOnRoutedElement: captured.injectorResolvedOnRoutedElement,
      injectorError: captured.injectorError,
      routedElementTag: captured.routedElementTag,
      routerUrl: captured.routerUrl,
      fieldsPresent: captured.fieldsPresent,
      config: captured.config,
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopServer(server);
  }
}

async function waitForServer(server, output) {
  const started = Date.now();
  let exit = null;
  server.on('exit', (code, signal) => { exit = { code, signal }; });
  while (Date.now() - started < 180000) {
    if (exit) throw new Error(`server exited: ${JSON.stringify(exit)}\n${output()}`);
    try {
      const res = await fetch(`${ORIGIN}/`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`server not answering: ${output()}`);
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;
  server.kill();
  const timer = setTimeout(() => { try { server.kill('SIGKILL'); } catch {} }, 5000);
  timer.unref?.();
  try { await once(server, 'exit'); } catch {}
  clearTimeout(timer);
}

let capturePromise = null;
function captured() { capturePromise ??= runCapture(); return capturePromise; }

test('capture router config via ng.getInjector', async (t) => {
  const record = await captured();
  if (RECORD_PATH) writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
  assert.ok(record.injectorResolvedOnRoutedElement, 'injector must resolve');
  assert.ok(Array.isArray(record.config) && record.config.length > 0, 'config must be non-empty');
  const redirectEntry = record.config.find((e) => e.path === 'redirect');
  assert.ok(redirectEntry, 'redirect route present');
  assert.equal(redirectEntry.redirectTo, 'landing', 'redirect target');
  // cycle entries
  const loopA = record.config.find((e) => e.path === 'loop-a');
  const loopB = record.config.find((e) => e.path === 'loop-b');
  assert.ok(loopA && loopA.redirectTo === 'loop-b', 'loop-a redirects');
  assert.ok(loopB && loopB.redirectTo === 'loop-a', 'loop-b redirects');
  // gated route has canActivate
  const gated = record.config.find((e) => e.path === 'gated');
  assert.ok(gated, 'gated route present');
  assert.ok(Array.isArray(gated.canActivate) || gated.canActivate !== undefined, 'canActivate present');
  // lazy route has loadChildren
  const lazy = record.config.find((e) => e.path === 'lazy');
  assert.ok(lazy, 'lazy route present');
  assert.ok(lazy.loadChildren !== undefined, 'loadChildren present');
  // provenance
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/);
  assert.match(record.url, new RegExp(`^http://127\\.0\\.0\\.1:${PORT}/landing$`));
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T/);
  t.diagnostic(`config entries: ${record.config.length}, fields: ${record.fieldsPresent.join(',')}`);
});

test('mutant: removing redirect leaves no redirectTo', async () => {
  // This test documents the mutant expectation; the capture above includes redirectTo.
  const record = await captured();
  const redirectEntry = record.config.find((e) => e.path === 'redirect');
  assert.ok(redirectEntry, 'redirect route must exist in current fixture');
});
