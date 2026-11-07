// @ts-check
//
// M033 T001 — does any router diagnostic reach a page's console, and does its
// message name a configured route path.
//
// Run checks (read-only, no server, no browser):
//   node --test scripts/router-diagnostic-capture.test.mjs
//
// Re-capture:
//   set M033_CAPTURE=1 && node --test scripts/router-diagnostic-capture.test.mjs
//
// Point checks at another recording:
//   set M033_RECORD=<path> && node --test scripts/router-diagnostic-capture.test.mjs
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const ROUTE_PATH = '/router-lint';
const RECORD_PATH =
  process.env.M033_RECORD ??
  join(ROOT, 'research', 'raw', 'm033-router-diagnostic.json');
const DIGEST_PATH = join(ROOT, 'extension', 'error-digest.json');
const PAGE_PATH = join(APP, 'src', 'app', 'router-lint-page.ts');
const ROUTES_PATH = join(APP, 'src', 'app', 'app.routes.ts');
const COMPONENT_NAME = 'RouterLintPage';
const UNMATCHED = '/this-route-does-not-exist';

const NG_CODE = /NG\d{4,5}/;

const CAPTURE_COMMAND =
  'set M033_CAPTURE=1 && node --test scripts/router-diagnostic-capture.test.mjs';
const CHECK_COMMAND = 'node --test scripts/router-diagnostic-capture.test.mjs';

const FIVE_FIELDS = [
  'canActivate',
  'component',
  'loadChildren',
  'path',
  'redirectTo',
];

function readTsconfig() {
  const text = readFileSync(join(APP, 'tsconfig.json'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(text);
}

function digestCodes() {
  const digest = JSON.parse(readFileSync(DIGEST_PATH, 'utf8'));
  const codes = new Set();
  for (const entry of digest.entries ?? []) {
    if (entry && typeof entry.code === 'string') codes.add(entry.code);
  }
  return codes;
}

function bodyOf(text) {
  const at = text.search(/\n\s+at\s/);
  return at === -1 ? text : text.slice(0, at);
}

function codeOf(text) {
  const match = text.match(NG_CODE);
  return match ? match[0] : null;
}

function choosePort() {
  if (process.env.M033_PORT) return Number(process.env.M033_PORT);
  const srv = createServer();
  return new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
  });
}

/** Quoted single-quoted tokens in a console message. */
function quotedTokens(text) {
  return [...text.matchAll(/'([^']+)'/g)].map((m) => m[1]);
}

/** Whether the message names one of the configured route paths. */
function namesConfiguredRoutePath(text, configPaths) {
  const set = new Set(configPaths);
  const tokens = quotedTokens(text);
  if (tokens.some((t) => set.has(t))) return true;
  // also direct path equality without quotes
  return configPaths.some(
    (p) =>
      p !== '' &&
      new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(
        text,
      ),
  );
}

function isObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function checkStrings(record, keys, where) {
  if (!isObject(record)) throw new Error(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '')
      throw new Error(`missing ${where}.${key}`);
  }
}

// ---------------------------------------------------------------- capture ----

async function runCapture() {
  const requireApp = createRequire(join(APP, 'package.json'));
  let chromium;
  try {
    ({ chromium } = requireApp('playwright'));
  } catch (error) {
    throw new Error(
      `playwright is not installed for the fixture (${APP}); run: npm --prefix spikes/ng222-app ci --include=dev. ${error}`,
    );
  }
  const playwrightVersion = requireApp('playwright/package.json').version;
  const angularVersion = JSON.parse(
    readFileSync(
      join(APP, 'node_modules', '@angular', 'core', 'package.json'),
      'utf8',
    ),
  ).version;
  const tsconfig = readTsconfig();

  const port = await choosePort();
  const origin = `http://127.0.0.1:${port}`;
  const pageUrl = `${origin}${ROUTE_PATH}`;

  const server = spawn(
    process.execPath,
    [
      join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'),
      'serve',
      '--port',
      String(port),
      '--host',
      '127.0.0.1',
    ],
    { cwd: APP, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  const serverPid = server.pid;
  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput = (serverOutput + chunk).slice(-8000);
  });
  server.stderr.on('data', (chunk) => {
    serverOutput = (serverOutput + chunk).slice(-8000);
  });

  let browser;
  try {
    await waitForServer(server, origin, () => serverOutput);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();

    const raw = [];
    page.on('console', (message) => {
      raw.push({
        type: message.type(),
        text: message.text(),
        location: message.location(),
      });
    });
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push({ name: error.name, message: error.message });
    });
    let documentLoads = 0;
    page.on('load', () => {
      documentLoads += 1;
    });

    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(
      () => document.querySelectorAll('[ng-version]').length > 0,
      null,
      { timeout: 90000 },
    );
    await page.waitForTimeout(2000);

    const domAndConfig = await page.evaluate(() => {
      const ng = window.ng;
      const hosts = [...document.querySelectorAll('*')].filter((el) => {
        try {
          return !!ng.getComponent(el);
        } catch {
          return false;
        }
      });
      const routedEl = hosts.length
        ? hosts[hosts.length - 1]
        : document.querySelector('[ng-version]');
      let injectorResolved = false;
      let injectorError = null;
      let routerInstance = null;
      try {
        const inj = ng.getInjector(routedEl);
        injectorResolved = true;
        routerInstance =
          typeof ng.ɵgetRouterInstance === 'function'
            ? ng.ɵgetRouterInstance(inj)
            : null;
      } catch (e) {
        injectorError = String(e);
      }
      if (!routerInstance) {
        try {
          const rootEl = document.querySelector('[ng-version]');
          const inj = ng.getInjector(rootEl);
          if (!injectorResolved) injectorResolved = true;
          routerInstance =
            typeof ng.ɵgetRouterInstance === 'function'
              ? ng.ɵgetRouterInstance(inj)
              : null;
        } catch (e) {
          if (!injectorError) injectorError = String(e);
        }
      }
      const config =
        routerInstance && Array.isArray(routerInstance.config)
          ? routerInstance.config.map((entry) => {
              const out = {};
              for (const k of Object.keys(entry ?? {})) {
                const v = entry[k];
                if (typeof v === 'function')
                  out[k] = `[fn ${v.name || 'anonymous'}]`;
                else if (Array.isArray(v))
                  out[k] = v.map((x) =>
                    typeof x === 'function'
                      ? `[fn ${x.name || 'anonymous'}]`
                      : x && typeof x === 'object'
                        ? x.name || x.constructor?.name || String(x)
                        : x,
                  );
                else if (v && typeof v === 'object')
                  out[k] = v.name || v.constructor?.name || String(v);
                else out[k] = v;
              }
              return out;
            })
          : null;
      const fieldsPresent = config
        ? [...new Set(config.flatMap((e) => Object.keys(e)))]
        : [];
      return {
        ngVersion:
          document.querySelector('[ng-version]')?.getAttribute('ng-version') ??
          null,
        headingText:
          document.querySelector('#router-lint-heading')?.textContent ?? null,
        injectorResolvedOnRoutedElement: injectorResolved,
        injectorError,
        routedElementTag: routedEl ? routedEl.tagName.toLowerCase() : null,
        routerUrl: routerInstance ? routerInstance.url : null,
        hasRouterInstance: !!routerInstance,
        config,
        fieldsPresent,
      };
    });

    await browser.close();
    browser = undefined;

    const codes = digestCodes();
    const messages = raw.map((m, order) => ({
      order,
      type: m.type,
      code: codeOf(m.text),
      text: m.text,
      location: m.location,
    }));
    const configPaths = (domAndConfig.config ?? [])
      .map((e) => e.path)
      .filter((p) => typeof p === 'string');
    const ngCodedMessages = messages
      .filter((m) => m.code !== null)
      .map((m) => ({
        order: m.order,
        type: m.type,
        code: m.code,
        text: m.text,
        location: m.location,
        digestCarriesCode: codes.has(/** @type {string} */ (m.code)),
        namesConfiguredRoutePath: namesConfiguredRoutePath(m.text, configPaths),
      }));

    for (const m of ngCodedMessages) {
      if (!m.text.includes(m.code))
        throw new Error(`message ${m.order} carries ${m.code} not in text`);
    }

    const codesOnTheConsole = [
      ...new Set(ngCodedMessages.map((m) => m.code)),
    ].sort();

    return {
      capturedAt: new Date().toISOString(),
      browser: `headless Playwright Chromium (build ${browserBuild})`,
      browserBuild,
      instance: 'headless',
      playwright: playwrightVersion,
      angularVersion,
      url: pageUrl,
      pageUrl,
      commands: {
        install: 'npm ci --include=dev',
        installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
        serve: `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${port} --host 127.0.0.1  (cwd spikes/ng222-app)`,
        capture: CAPTURE_COMMAND,
        check: CHECK_COMMAND,
      },
      environment: {
        platform: process.platform,
        shell: 'cmd.exe',
        node: process.version,
      },
      fixture: {
        route: ROUTE_PATH,
        routeTable: 'spikes/ng222-app/src/app/app.routes.ts',
        page: 'spikes/ng222-app/src/app/router-lint-page.ts',
        component: COMPONENT_NAME,
        construct:
          "routed page that navigates on init to an unmatched path, provoking the router's runtime diagnostic",
        whyItReachesTheConsole:
          'the router cannot match the requested URL and reports NG04002 to the page console',
        compilerOptionsChanged: [],
        angularCompilerOptions:
          tsconfig.angularCompilerOptions ?? 'none declared',
        angularCompilerOptionsSource:
          'spikes/ng222-app/tsconfig.json (tsconfig.app.json extends it and adds none)',
        expectedCodes: codesOnTheConsole,
      },
      page: {
        pageLoads: 1,
        documentLoads,
        ngVersion: domAndConfig.ngVersion,
        headingText: domAndConfig.headingText,
        uncaughtPageErrors: pageErrors.length,
      },
      console: {
        total: messages.length,
        withAnNgCode: ngCodedMessages.length,
        withoutAnNgCode: messages.length - ngCodedMessages.length,
      },
      messages,
      ngCodedMessages,
      digest: {
        path: 'extension/error-digest.json',
        entryCount: new Set(
          (JSON.parse(readFileSync(DIGEST_PATH, 'utf8')).entries ?? []).map(
            (e) => e.code,
          ),
        ).size,
        codesOnTheConsole,
        codesNotCarried: codesOnTheConsole.filter((code) => !codes.has(code)),
      },
      // router configuration read at the same instant
      injectorResolvedOnRoutedElement:
        domAndConfig.injectorResolvedOnRoutedElement,
      injectorError: domAndConfig.injectorError,
      routedElementTag: domAndConfig.routedElementTag,
      routerUrl: domAndConfig.routerUrl,
      hasRouterInstance: domAndConfig.hasRouterInstance,
      fieldsPresent: domAndConfig.fieldsPresent,
      config: domAndConfig.config,
    };
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopServer(server, port);
    assertTeardownClean(serverPid);
  }
}

async function waitForServer(server, origin, output) {
  const started = Date.now();
  let exit = null;
  server.on('exit', (code, signal) => {
    exit = { code, signal };
  });
  while (Date.now() - started < 240000) {
    if (exit)
      throw new Error(`server exited: ${JSON.stringify(exit)}\n${output()}`);
    try {
      const res = await fetch(`${origin}/`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`server not answering: ${output()}`);
}

async function killProcessTree(pid) {
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], {
      stdio: 'ignore',
    });
    await new Promise((resolve) =>
      killer.on('exit', resolve).on('error', resolve),
    );
  } else {
    try {
      process.kill(-pid, 'SIGTERM');
    } catch {
      try {
        process.kill(pid, 'SIGTERM');
      } catch {}
    }
  }
}

async function waitForPortFree(port, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const free = await new Promise((resolve) => {
      const srv = createServer();
      srv.once('error', () => resolve(false));
      srv.listen(port, '127.0.0.1', () => srv.close(() => resolve(true)));
    });
    if (free) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`port ${port} not free after ${timeout}ms`);
}

async function stopServer(server, port) {
  if (server.exitCode === null && server.signalCode === null) {
    try {
      await killProcessTree(server.pid);
    } catch {}
    server.kill();
    const timer = setTimeout(() => {
      try {
        server.kill('SIGKILL');
      } catch {}
    }, 5000);
    timer.unref?.();
    try {
      await once(server, 'exit');
    } catch {}
    clearTimeout(timer);
  }
  await waitForPortFree(port);
}

function isPidAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !!(error && error.code === 'EPERM');
  }
}

function assertTeardownClean(pid) {
  if (isPidAlive(pid)) throw new Error(`server PID ${pid} survived teardown`);
}

// ---------------------------------------------------------------- checks ----

function fail(message) {
  throw new Error(message);
}

function validate(record) {
  // provenance
  checkStrings(
    record,
    [
      'browser',
      'browserBuild',
      'instance',
      'playwright',
      'angularVersion',
      'url',
      'pageUrl',
      'capturedAt',
    ],
    'the recording',
  );
  if (record.instance !== 'headless') fail(`instance is ${record.instance}`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record.capturedAt))
    fail('bad capturedAt');
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(record.browserBuild))
    fail('bad browserBuild');
  if (!record.browser.includes(record.browserBuild))
    fail('browser missing build');
  if (record.url !== record.pageUrl) fail('url/pageUrl disagree');
  if (!record.url.endsWith(ROUTE_PATH)) fail(`url not route: ${record.url}`);
  checkStrings(
    record.commands,
    ['install', 'installApp', 'serve', 'capture', 'check'],
    'commands',
  );
  if (!record.commands.serve.includes('ng.js serve')) fail('serve command');
  if (!record.commands.capture.includes('M033_CAPTURE=1'))
    fail('capture command flag');
  checkStrings(
    record.environment,
    ['platform', 'shell', 'node'],
    'environment',
  );

  // messages
  if (!Array.isArray(record.messages)) fail('missing messages');
  if (!Array.isArray(record.ngCodedMessages)) fail('missing ngCodedMessages');
  record.messages.forEach((m, index) => {
    if (m.order !== index) fail(`order ${m.order} vs ${index}`);
    if (typeof m.type !== 'string' || m.type === '') fail(`no type ${index}`);
    if (typeof m.text !== 'string' || m.text === '') fail(`no text ${index}`);
    if (!isObject(m.location)) fail(`no location ${index}`);
    const code = codeOf(m.text);
    if (m.code !== code) fail(`code mismatch ${index}`);
  });
  const derived = record.messages.filter((m) => m.code !== null);
  if (derived.length !== record.ngCodedMessages.length)
    fail('ngCoded count mismatch');
  const configPaths = (record.config ?? [])
    .map((e) => e.path)
    .filter((p) => typeof p === 'string');
  record.ngCodedMessages.forEach((m, index) => {
    const same = derived[index];
    if (!same || m.order !== same.order) fail(`ngcoded ${index} order`);
    if (m.text !== same.text || m.code !== same.code)
      fail(`ngcoded ${index} disagree`);
    if (!NG_CODE.test(m.code)) fail(`ngcoded ${index} not code`);
    if (!m.text.includes(m.code)) fail(`ngcoded ${index} code not in text`);
    if (typeof m.digestCarriesCode !== 'boolean')
      fail(`ngcoded ${index} digestCarriesCode`);
    const codes = digestCodes();
    if (m.digestCarriesCode !== codes.has(m.code))
      fail(`digest carries ${m.code}`);
    if (typeof m.namesConfiguredRoutePath !== 'boolean')
      fail(`ngcoded ${index} namesConfiguredRoutePath`);
    const observed = namesConfiguredRoutePath(m.text, configPaths);
    if (m.namesConfiguredRoutePath !== observed)
      fail(
        `namesConfiguredRoutePath ${m.order} stated ${m.namesConfiguredRoutePath} but text gives ${observed}`,
      );
  });
  if (!isObject(record.console)) fail('missing console');
  const summary = {
    total: record.messages.length,
    withAnNgCode: derived.length,
    withoutAnNgCode: record.messages.length - derived.length,
  };
  for (const [k, v] of Object.entries(summary)) {
    if (record.console[k] !== v) fail(`console ${k}`);
  }

  // fixture
  const fixture = record.fixture;
  if (!isObject(fixture)) fail('missing fixture');
  checkStrings(
    fixture,
    [
      'route',
      'routeTable',
      'page',
      'component',
      'construct',
      'angularCompilerOptionsSource',
    ],
    'fixture',
  );
  if (fixture.route !== ROUTE_PATH) fail('route');
  if (
    !Array.isArray(fixture.expectedCodes) ||
    fixture.expectedCodes.length === 0
  )
    fail('expectedCodes empty');
  const recorded = [
    ...new Set(record.ngCodedMessages.map((m) => m.code)),
  ].sort();
  if (recorded.join(',') !== [...fixture.expectedCodes].sort().join(','))
    fail('expectedCodes mismatch');
  if (!Array.isArray(fixture.compilerOptionsChanged))
    fail('compilerOptionsChanged');
  if (fixture.compilerOptionsChanged.length !== 0)
    fail('compiler options changed');
  if (!isObject(fixture.angularCompilerOptions)) fail('angularCompilerOptions');
  for (const flag of ['strictTemplates', 'extendedDiagnostics']) {
    if (fixture.angularCompilerOptions[flag] === true) fail(`${flag} on`);
  }

  // page
  if (!isObject(record.page)) fail('missing page');
  if (record.page.pageLoads !== 1) fail('pageLoads');
  if (record.page.documentLoads !== 1) fail('documentLoads');
  if (record.page.ngVersion !== record.angularVersion) fail('ngVersion');
  if (typeof record.page.headingText !== 'string') fail('headingText');

  // digest
  if (!isObject(record.digest)) fail('missing digest');
  if (record.digest.path !== 'extension/error-digest.json') fail('digest path');
  const onTheConsole = [
    ...new Set(record.ngCodedMessages.map((m) => m.code)),
  ].sort();
  if (record.digest.codesOnTheConsole.join(',') !== onTheConsole.join(','))
    fail('digest codesOnTheConsole');
  const notCarried = onTheConsole.filter((code) => !digestCodes().has(code));
  if (record.digest.codesNotCarried.join(',') !== notCarried.join(','))
    fail('digest codesNotCarried');

  // config
  if (!record.injectorResolvedOnRoutedElement) fail('injector not resolved');
  if (!Array.isArray(record.config)) fail('config not array');
  if (record.config.length !== 17)
    fail(`config length ${record.config.length}`);
  const fields = [
    ...new Set(record.config.flatMap((e) => Object.keys(e))),
  ].sort();
  if (JSON.stringify(fields) !== JSON.stringify(FIVE_FIELDS)) fail('fields');
  if (
    JSON.stringify([...record.fieldsPresent].sort()) !==
    JSON.stringify(FIVE_FIELDS)
  )
    fail('fieldsPresent');
  const redirectEntry = record.config.find((e) => e.path === 'redirect');
  if (!redirectEntry || redirectEntry.redirectTo !== 'landing')
    fail('redirect entry');
  const loopA = record.config.find((e) => e.path === 'loop-a');
  const loopB = record.config.find((e) => e.path === 'loop-b');
  if (!loopA || loopA.redirectTo !== 'loop-b') fail('loop-a');
  if (!loopB || loopB.redirectTo !== 'loop-a') fail('loop-b');
  // router-lint route present
  const rl = record.config.find((e) => e.path === 'router-lint');
  if (!rl) fail('router-lint route missing from config');
  // M035 T001 added the onpush-ready measurement page to the same table, which
  // is why the entry count moved from sixteen to seventeen.
  const onpushReady = record.config.find((e) => e.path === 'onpush-ready');
  if (!onpushReady) fail('onpush-ready route missing from config');
  if (
    typeof onpushReady.component !== 'string' ||
    !onpushReady.component.includes('OnPushReadyPage')
  )
    fail('onpush-ready is not routed to its page');

  return true;
}

function loadRecord(path = RECORD_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

// ---------------------------------------------------------------- read-only checks ----

test('the recording validates against its own lists, its fixture and the digest', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => validate(record));
});

test('the recording holds one page load and the page it recorded rendered', () => {
  const record = loadRecord();
  assert.equal(record.page.pageLoads, 1);
  assert.equal(record.page.documentLoads, 1);
  assert.equal(record.page.ngVersion, record.angularVersion);
  assert.match(record.url, /\/router-lint$/);
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/);
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('a console message carries an NG code, and it is the construct’s', () => {
  const record = loadRecord();
  assert.ok(record.ngCodedMessages.length > 0, 'no NG-coded console message');
  assert.deepEqual(
    [...new Set(record.ngCodedMessages.map((m) => m.code))].sort(),
    [...record.fixture.expectedCodes].sort(),
  );
  assert.ok(record.console.withoutAnNgCode > 0, 'all messages carried a code');
});

test('the config is recorded with 17 entries', () => {
  const record = loadRecord();
  assert.equal(record.config.length, 17);
});

test('PRECONDITION: app.routes.ts registers the fixture page', () => {
  const routes = readFileSync(ROUTES_PATH, 'utf8');
  assert.ok(existsSync(PAGE_PATH), 'the fixture page is missing');
  assert.match(routes, /RouterLintPage/);
  assert.ok(
    routes.includes(`path: 'router-lint'`),
    'the router-lint route is not in the route table',
  );
});

test('PRECONDITION: the fixture changes no compiler option', () => {
  const tsconfig = readTsconfig();
  const options = tsconfig.angularCompilerOptions ?? {};
  assert.notEqual(options['strictTemplates'], true);
  assert.notEqual(options['extendedDiagnostics'], true);
  const record = loadRecord();
  assert.deepEqual(record.fixture.compilerOptionsChanged, []);
});

test('held-out: a recording with the captured messages removed reddens', () => {
  const base = loadRecord();
  assert.ok(base.ngCodedMessages.length > 0, 'nothing to remove');
  const mutant = clone(base);
  mutant.messages = base.messages
    .filter((message) => message.code === null)
    .map((message, index) => ({ ...message, order: index }));
  mutant.console.total = mutant.messages.length;
  mutant.console.withAnNgCode = 0;
  mutant.console.withoutAnNgCode = mutant.messages.length;
  mutant.ngCodedMessages = [];
  mutant.digest.codesOnTheConsole = [];
  mutant.digest.codesNotCarried = [];
  mutant.fixture.expectedCodes = base.fixture.expectedCodes;
  assert.throws(
    () => validate(mutant),
    /expectedCodes mismatch|claims no code|not a recording/,
  );
});

test('held-out: a message whose text lost its code reddens', () => {
  const mutant = clone(loadRecord());
  const message = mutant.ngCodedMessages[0];
  message.text = message.text.replace(/NG\d{4,5}/g, 'NG0000');
  message.code = 'NG0000';
  assert.throws(
    () => validate(mutant),
    /disagree|code mismatch|code not in text/,
  );
});

test('held-out: a code the message text does not carry reddens', () => {
  const mutant = clone(loadRecord());
  const message = mutant.ngCodedMessages[0];
  message.code = 'NG8008';
  assert.throws(() => validate(mutant), /disagree|code mismatch/);
});

test('held-out: a message claiming digest coverage it does not have reddens', () => {
  const mutant = clone(loadRecord());
  mutant.ngCodedMessages[0].digestCarriesCode =
    !mutant.ngCodedMessages[0].digestCarriesCode;
  assert.throws(() => validate(mutant), /digest carries/);
});

test('held-out: a message with a wrong namesConfiguredRoutePath reddens', () => {
  const mutant = clone(loadRecord());
  mutant.ngCodedMessages[0].namesConfiguredRoutePath =
    !mutant.ngCodedMessages[0].namesConfiguredRoutePath;
  assert.throws(() => validate(mutant), /namesConfiguredRoutePath/);
});

// ---------------------------------------------------------------- opt-in capture ----

if (process.env.M033_CAPTURE === '1') {
  test('capture the page console in headless Chromium', async () => {
    const record = await runCapture();
    writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
    validate(record);
    assert.ok(
      record.ngCodedMessages.length > 0,
      'the capture reached no NG-coded console message',
    );
  });
}
