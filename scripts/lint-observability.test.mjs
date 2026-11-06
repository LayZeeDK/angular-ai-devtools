// @ts-check
//
// M032 T001 — which NG-coded diagnostics reach a page's console.
//
// The subject of the measurement is one construct on one fixture page: a
// `input.required()` declared on the *routed* component, left unbound, and read
// by that component's own template
// (`spikes/ng222-app/src/app/lint-observability-page.ts`). Nothing is enabled to
// make it speak: `ng serve` runs with the repository's own configuration, and
// the recording states the compiler options it ran with.
//
// Run the checks against the recording. This is everything a default run does,
// and it needs no dev server, no browser and no opt-in, so it reports zero
// skipped tests:
//   node --test scripts/lint-observability.test.mjs
//
// Re-capture — the part that starts the fixture's dev server and a headless
// Chromium — is the same file, behind an explicit flag, and it is the only path
// that writes `research/raw/m032-console-diagnostics.json`:
//   set M032_CAPTURE=1 && node --test scripts/lint-observability.test.mjs
//
// Point the same checks at another recording — how the mutants are run:
//   set M032_RECORD=<path to a mutant recording> && node --test scripts/lint-observability.test.mjs
//
// The recording is read-only by default: no check here writes a file, so an
// ordinary run leaves `git status --porcelain` exactly as it found it.
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
const ROUTE_PATH = '/lint-observability';
const RECORD_PATH =
  process.env.M032_RECORD ??
  join(ROOT, 'research', 'raw', 'm032-console-diagnostics.json');
const DIGEST_PATH = join(ROOT, 'extension', 'error-digest.json');
const PAGE_PATH = join(APP, 'src', 'app', 'lint-observability-page.ts');
const ROUTES_PATH = join(APP, 'src', 'app', 'app.routes.ts');
const COMPONENT_NAME = 'LintObservabilityPage';

// Angular formats a runtime code as `NG0` + the absolute code (`NG0950`) and a
// framework-internal one as `NG0` + a four-digit number (`NG02952`), so the
// code is `NG` followed by four or five digits.
const NG_CODE = /NG\d{4,5}/;

const CAPTURE_COMMAND =
  'set M032_CAPTURE=1 && node --test scripts/lint-observability.test.mjs';
const CHECK_COMMAND = 'node --test scripts/lint-observability.test.mjs';
const MUTANT_COMMAND =
  'set M032_RECORD=<path to a mutant recording> && node --test scripts/lint-observability.test.mjs';

const NAMES_DEFINITION =
  'the message body — every character before the first stack frame — naming an ' +
  "element (an HTML tag, or a selector such as 'app-x') or a component class name";

// ---------------------------------------------------------------- shared analysis ----
// One implementation, used by the capture to describe a message and by the
// checks to recompute that description from the message text, so a recording
// cannot claim a name its own text does not carry.

/** The text before the first `    at ...` stack frame. */
function bodyOf(text) {
  const at = text.search(/\n\s+at\s/);
  return at === -1 ? text : text.slice(0, at);
}

/** The stack frames of a console message, or '' when it carries none. */
function stackOf(text) {
  const at = text.search(/\n\s+at\s/);
  return at === -1 ? '' : text.slice(at);
}

function codeOf(text) {
  const match = text.match(NG_CODE);
  return match ? match[0] : null;
}

function elementSelectorsIn(text) {
  return [...text.matchAll(/<([a-z][a-z0-9]*(?:-[a-z0-9]+)*)/g)].map(
    (match) => match[1],
  );
}

/**
 * What a console message's own text names, as observed.
 *
 * @param {string} text the message text the browser reported, stack included
 * @param {string} componentName the fixture's component class name
 */
function namesElementOrComponent(text, componentName) {
  const body = bodyOf(text);
  const stack = stackOf(text);
  const selectors = elementSelectorsIn(body);
  const componentInBody = body.includes(componentName) ? componentName : null;
  const componentInStack = stack.includes(componentName) ? componentName : null;
  const frameInStack = stack
    .split('\n')
    .find((line) => line.includes(`${componentName}_Template`));
  const quoted = [...body.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  return {
    definition: NAMES_DEFINITION,
    any: selectors.length > 0 || componentInBody !== null,
    elementSelector: selectors.length > 0 ? selectors.join(', ') : null,
    component: componentInBody,
    matchedTokens: [
      ...selectors,
      ...(componentInBody ? [componentInBody] : []),
    ],
    namesTheInputInstead: quoted.length > 0 ? quoted[0] : null,
    stackNamesTheComponent: componentInStack,
    stackFrame: frameInStack ? frameInStack.trim() : null,
    stackCountsAsTheMessageNamingIt: false,
  };
}

/** The codes `extension/error-digest.json` carries, read fresh from the file. */
function digestCodes() {
  const digest = JSON.parse(readFileSync(DIGEST_PATH, 'utf8'));
  const codes = new Set();
  for (const entry of digest.entries ?? []) {
    if (entry && typeof entry.code === 'string') codes.add(entry.code);
  }
  return codes;
}

/** The fixture's tsconfig.json is JSON with comments, as the CLI writes it. */
function readTsconfig() {
  const text = readFileSync(join(APP, 'tsconfig.json'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  return JSON.parse(text);
}

// ---------------------------------------------------------------- capture ----

async function choosePort() {
  if (process.env.M032_PORT) return Number(process.env.M032_PORT);
  const srv = createServer();
  await new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', resolve);
  });
  const port = srv.address().port;
  await new Promise((resolve) => srv.close(resolve));
  return port;
}

/**
 * Load the fixture page once in headless Chromium and return the recording:
 * every console message the page's own window produced, each carrying the code
 * the browser printed and what that text names.
 */
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
    // The dev server answers before the first build is done; the page bundle is
    // only served once it completes.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();

    /** @type {Array<{type: string, text: string, location: object}>} */
    const raw = [];
    page.on('console', (message) => {
      raw.push({
        type: message.type(),
        text: message.text(),
        location: message.location(),
      });
    });
    /** @type {Array<{name: string, message: string}>} */
    const pageErrors = [];
    page.on('pageerror', (error) => {
      pageErrors.push({ name: error.name, message: error.message });
    });
    // The router's first navigation is a same-document one, so `framenavigated`
    // fires for it too; the document loads are the `load` events.
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
    // Long enough for the routed component's first change detection to run and
    // Angular's error handler to report what it threw.
    await page.waitForTimeout(2000);

    const dom = await page.evaluate(() => ({
      ngVersion:
        document.querySelector('[ng-version]')?.getAttribute('ng-version') ??
        null,
      headingText:
        document.querySelector('#lint-observability-heading')?.textContent ??
        null,
      unboundInputSpanRendered: !!document.querySelector(
        '#unbound-required-input',
      ),
    }));

    await browser.close();
    browser = undefined;

    const codes = digestCodes();
    const messages = raw.map((message, order) => ({
      order,
      type: message.type,
      code: codeOf(message.text),
      text: message.text,
      location: message.location,
    }));
    const ngCodedMessages = messages
      .filter((message) => message.code !== null)
      .map((message) => ({
        order: message.order,
        type: message.type,
        code: message.code,
        text: message.text,
        location: message.location,
        digestCarriesCode: codes.has(/** @type {string} */ (message.code)),
        namesElementOrComponent: namesElementOrComponent(
          message.text,
          COMPONENT_NAME,
        ),
      }));

    for (const message of ngCodedMessages) {
      if (!message.text.includes(message.code)) {
        throw new Error(
          `the browser's message ${message.order} carries ${message.code} in the recording but not in its text`,
        );
      }
    }

    const codesOnTheConsole = [
      ...new Set(ngCodedMessages.map((message) => message.code)),
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
        mutants: MUTANT_COMMAND,
      },
      environment: {
        platform: process.platform,
        shell: 'cmd.exe',
        node: process.version,
      },
      fixture: {
        route: ROUTE_PATH,
        routeTable: 'spikes/ng222-app/src/app/app.routes.ts',
        page: 'spikes/ng222-app/src/app/lint-observability-page.ts',
        component: COMPONENT_NAME,
        construct:
          "input.required() on the routed component, left unbound, read by that component's own template",
        whyItReachesTheConsole:
          'the router creates the component, so no template writes it and the compiler checks no required input on it; the template read of the unset signal throws RuntimeError(-950) in @angular/core, whose message is built under ngDevMode',
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
        ngVersion: dom.ngVersion,
        headingText: dom.headingText,
        unboundInputSpanRendered: dom.unboundInputSpanRendered,
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
            (entry) => entry.code,
          ),
        ).size,
        codesOnTheConsole,
        codesNotCarried: codesOnTheConsole.filter((code) => !codes.has(code)),
      },
      // Recorded from the dev server's own output, not from a console: the same
      // construct spelled inside a template instead of on a routed component.
      buildObservations: [
        {
          attempt:
            'input.required() left unbound on a child component written in the page template',
          stage:
            'ng serve — angular-compiler plugin (AOT template type checking)',
          text: "NG8008: Required input 'label' from component LintObservabilityChild must be specified.",
          reachedThePageConsole: false,
          handTranscribedFromABuildLog: true,
          detail:
            'the dev server reported "Application bundle generation failed" and served no page, so nothing reached a console',
          digestCarriesCode: codes.has('NG8008'),
        },
      ],
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

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkStrings(record, keys, where) {
  if (!isObject(record)) fail(`missing ${where}`);
  for (const key of keys) {
    if (typeof record[key] !== 'string' || record[key] === '')
      fail(`missing ${where}.${key}`);
  }
}

/** Recompute what each NG-coded message names from its own text. */
function checkNames(message) {
  const names = message.namesElementOrComponent;
  if (!isObject(names))
    fail(`message ${message.order} carries no namesElementOrComponent block`);
  if (typeof names.definition !== 'string' || names.definition === '')
    fail(`message ${message.order} carries no naming definition`);
  const observed = namesElementOrComponent(message.text, COMPONENT_NAME);
  for (const key of [
    'any',
    'elementSelector',
    'component',
    'matchedTokens',
    'namesTheInputInstead',
    'stackNamesTheComponent',
    'stackFrame',
  ]) {
    if (JSON.stringify(names[key]) !== JSON.stringify(observed[key])) {
      fail(
        `message ${message.order} states namesElementOrComponent.${key} is ${JSON.stringify(names[key])}, but its own text gives ${JSON.stringify(observed[key])}`,
      );
    }
  }
  if (
    names.stackNamesTheComponent !== null &&
    names.stackCountsAsTheMessageNamingIt !== false
  ) {
    fail(
      `message ${message.order} counts a stack frame as the message naming a component`,
    );
  }
}

function checkDigest(record) {
  const codes = digestCodes();
  if (!isObject(record.digest)) fail('missing the digest block');
  if (record.digest.path !== 'extension/error-digest.json')
    fail(`the digest block names ${record.digest.path}`);
  const onTheConsole = [
    ...new Set(record.ngCodedMessages.map((message) => message.code)),
  ].sort();
  if (record.digest.codesOnTheConsole.join(',') !== onTheConsole.join(',')) {
    fail(
      `the digest block states codes [${record.digest.codesOnTheConsole.join(', ')}] on the console; the messages give [${onTheConsole.join(', ')}]`,
    );
  }
  const notCarried = onTheConsole.filter((code) => !codes.has(code));
  if (record.digest.codesNotCarried.join(',') !== notCarried.join(',')) {
    fail(
      `the digest block states codes [${record.digest.codesNotCarried.join(', ')}] outside the digest; the file gives [${notCarried.join(', ')}]`,
    );
  }
  for (const message of record.ngCodedMessages) {
    const carried = codes.has(message.code);
    if (message.digestCarriesCode !== carried) {
      fail(
        `message ${message.order} states the digest carries ${message.code} is ${message.digestCarriesCode}; extension/error-digest.json says ${carried}`,
      );
    }
  }
  if (!Array.isArray(record.buildObservations))
    fail('missing the build observations');
  for (const observation of record.buildObservations) {
    if (!isObject(observation)) fail('a build observation is not an object');
    if (observation.reachedThePageConsole !== false)
      fail(
        'a build observation claims to be a console message; only messages in `messages` are',
      );
    checkStrings(
      observation,
      ['attempt', 'stage', 'text', 'detail'],
      'build observation',
    );
    if (!NG_CODE.test(observation.text))
      fail('a build observation carries no NG code');
    if (observation.digestCarriesCode !== codes.has(codeOf(observation.text)))
      fail(
        `a build observation states the digest carries its code wrongly: ${codeOf(observation.text)}`,
      );
  }
}

function checkMessages(record) {
  if (!Array.isArray(record.messages)) fail('missing the console messages');
  if (!Array.isArray(record.ngCodedMessages))
    fail('missing the NG-coded message list');
  record.messages.forEach((message, index) => {
    if (message.order !== index)
      fail(`console message ${index} carries order ${message.order}`);
    if (typeof message.type !== 'string' || message.type === '')
      fail(`console message ${index} carries no type`);
    if (typeof message.text !== 'string' || message.text === '')
      fail(`console message ${index} carries no text`);
    if (!isObject(message.location))
      fail(`console message ${index} carries no location`);
    const code = codeOf(message.text);
    if (message.code !== code)
      fail(
        `console message ${index} states code ${message.code}; its text carries ${code}`,
      );
  });

  const derived = record.messages.filter((message) => message.code !== null);
  if (derived.length !== record.ngCodedMessages.length) {
    fail(
      `the console holds ${derived.length} message(s) carrying an NG code and the NG-coded list holds ${record.ngCodedMessages.length}`,
    );
  }
  record.ngCodedMessages.forEach((message, index) => {
    const same = derived[index];
    if (!same || message.order !== same.order)
      fail(`NG-coded message ${index} is not the console's own ${index}th one`);
    if (message.text !== same.text || message.code !== same.code)
      fail(`NG-coded message ${index} disagrees with the console list`);
    if (!NG_CODE.test(/** @type {string} */ (message.code)))
      fail(`NG-coded message ${index} carries a code that is not one`);
    if (!message.text.includes(/** @type {string} */ (message.code)))
      fail(`NG-coded message ${index} carries a code its text does not`);
    checkNames(message);
  });

  if (!isObject(record.console)) fail('missing the console summary');
  const summary = {
    total: record.messages.length,
    withAnNgCode: derived.length,
    withoutAnNgCode: record.messages.length - derived.length,
  };
  for (const [key, value] of Object.entries(summary)) {
    if (record.console[key] !== value) {
      fail(
        `the console summary states ${key} is ${record.console[key]}; the list gives ${value}`,
      );
    }
  }
}

function checkFixture(record) {
  const fixture = record.fixture;
  if (!isObject(fixture)) fail('missing the fixture block');
  checkStrings(
    fixture,
    [
      'route',
      'routeTable',
      'page',
      'component',
      'construct',
      'whyItReachesTheConsole',
      'angularCompilerOptionsSource',
    ],
    'fixture',
  );
  if (fixture.route !== ROUTE_PATH)
    fail(`the recording is not a capture of ${ROUTE_PATH}`);
  if (
    !Array.isArray(fixture.expectedCodes) ||
    fixture.expectedCodes.length === 0
  )
    fail('the fixture block claims no code, so it claims no diagnostic');
  const recorded = [
    ...new Set(record.ngCodedMessages.map((m) => m.code)),
  ].sort();
  if (recorded.join(',') !== [...fixture.expectedCodes].sort().join(',')) {
    fail(
      `the fixture claims the construct produces [${fixture.expectedCodes.join(', ')}] and the console list holds [${recorded.join(', ')}]: ` +
        'a capture with no NG-coded message for the construct is not a recording of the diagnostic — ' +
        'the page was removed from the route table, or the construct stopped being read',
    );
  }
  if (!Array.isArray(fixture.compilerOptionsChanged))
    fail('the fixture does not state which compiler options were changed');
  if (fixture.compilerOptionsChanged.length !== 0)
    fail(
      `the capture changed compiler options (${fixture.compilerOptionsChanged.join(', ')}); a diagnostic produced by a flag is not observable by default`,
    );
  if (!isObject(fixture.angularCompilerOptions))
    fail(
      'the fixture does not record the angularCompilerOptions it built with',
    );
  for (const flag of ['strictTemplates', 'extendedDiagnostics']) {
    if (fixture.angularCompilerOptions[flag] === true)
      fail(`the fixture built with ${flag} on`);
  }

  if (!isObject(record.page)) fail('missing the page block');
  if (record.page.pageLoads !== 1)
    fail('the recording does not describe one page load');
  if (record.page.documentLoads !== 1)
    fail(
      `the page loaded ${record.page.documentLoads} documents, not one: a page that navigated mid-capture is not one page load`,
    );
  if (record.page.ngVersion !== record.angularVersion)
    fail('the page block names a build the recording does not');
  if (typeof record.page.headingText !== 'string')
    fail('the page block does not record what rendered');
}

function checkProvenance(record) {
  if (!isObject(record)) fail('the recording is not a JSON object');
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
  if (record.instance !== 'headless')
    fail(`instance is ${record.instance}, not the headless capture it claims`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record.capturedAt))
    fail('capturedAt is not an ISO timestamp');
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(record.browserBuild))
    fail('browserBuild is not a Chromium build string');
  if (!record.browser.includes(record.browserBuild))
    fail('browser does not name the build in browserBuild');
  if (record.url !== record.pageUrl) fail('url and pageUrl disagree');
  if (!record.url.endsWith(ROUTE_PATH))
    fail(`url is not the fixture route: ${record.url}`);
  checkStrings(
    record.commands,
    ['install', 'installApp', 'serve', 'capture', 'check', 'mutants'],
    'commands',
  );
  if (!record.commands.serve.includes('ng.js serve'))
    fail('the recorded serve command is not the fixture dev server');
  if (!record.commands.capture.includes('M032_CAPTURE=1'))
    fail('the recorded capture command does not carry the capture flag');
  checkStrings(
    record.environment,
    ['platform', 'shell', 'node'],
    'environment',
  );
}

function validate(record) {
  checkProvenance(record);
  checkMessages(record);
  checkFixture(record);
  checkDigest(record);
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
  assert.match(record.url, /\/lint-observability$/);
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/);
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('a console message carries an NG code, and it is the construct’s', () => {
  const record = loadRecord();
  assert.ok(
    record.ngCodedMessages.length > 0,
    'no console message in the recording carries an NG code',
  );
  assert.deepEqual(
    [...new Set(record.ngCodedMessages.map((m) => m.code))].sort(),
    [...record.fixture.expectedCodes].sort(),
  );
  assert.ok(
    record.console.withoutAnNgCode > 0,
    'the recording claims every console message carried a code',
  );
});

test('the message names no element and no component; its stack names the component', () => {
  const record = loadRecord();
  const [message] = record.ngCodedMessages;
  assert.equal(message.namesElementOrComponent.any, false);
  assert.equal(message.namesElementOrComponent.elementSelector, null);
  assert.equal(message.namesElementOrComponent.component, null);
  assert.equal(
    message.namesElementOrComponent.stackNamesTheComponent,
    COMPONENT_NAME,
  );
  assert.ok(
    message.text.includes(message.namesElementOrComponent.namesTheInputInstead),
  );
});

test('the digest carries the console code; the build-time code is recorded as outside it', () => {
  const record = loadRecord();
  const codes = digestCodes();
  for (const message of record.ngCodedMessages) {
    assert.equal(message.digestCarriesCode, codes.has(message.code));
  }
  assert.deepEqual(record.digest.codesNotCarried, []);
  assert.ok(record.buildObservations.length > 0);
  for (const observation of record.buildObservations) {
    assert.equal(observation.reachedThePageConsole, false);
    assert.equal(observation.digestCarriesCode, false);
  }
});

test('PRECONDITION: app.routes.ts registers the fixture page', () => {
  const routes = readFileSync(ROUTES_PATH, 'utf8');
  assert.ok(existsSync(PAGE_PATH), 'the fixture page is missing');
  assert.match(routes, /LintObservabilityPage/);
  assert.ok(
    routes.includes(`path: 'lint-observability'`),
    'the lint-observability route is not in the route table',
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

test('held-out: a recording with the page removed from the route table reddens', () => {
  // What a capture of the fixture without this route holds: the same console
  // with no NG-coded message in it, renumbered, and the fixture block still
  // claiming the construct. That recording contradicts itself.
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
  assert.throws(
    () => validate(mutant),
    /not a recording of the diagnostic|claims no code/,
  );
});

test('held-out: a message whose text lost its code reddens', () => {
  // The console entry and the NG-coded entry are two lists of one capture: a
  // text rewritten in one of them, or in both, cannot pass as the browser's.
  const mutant = clone(loadRecord());
  const message = mutant.ngCodedMessages[0];
  message.text = message.text.replace(/NG\d{4,5}/g, 'NG0000');
  message.code = 'NG0000';
  assert.throws(() => validate(mutant), /disagrees with the console list/);
});

test('held-out: a code the message text does not carry reddens', () => {
  const mutant = clone(loadRecord());
  const message = mutant.ngCodedMessages[0];
  message.code = 'NG8008';
  assert.throws(() => validate(mutant), /disagrees with the console list/);
});

test('held-out: a message claiming to name a component reddens', () => {
  const mutant = clone(loadRecord());
  mutant.ngCodedMessages[0].namesElementOrComponent.any = true;
  mutant.ngCodedMessages[0].namesElementOrComponent.component = COMPONENT_NAME;
  assert.throws(
    () => validate(mutant),
    /namesElementOrComponent\.(any|component)/,
  );
});

test('held-out: a message claiming digest coverage it does not have reddens', () => {
  const mutant = clone(loadRecord());
  mutant.ngCodedMessages[0].digestCarriesCode = false;
  assert.throws(() => validate(mutant), /digest carries/);
});

test('held-out: a message injected into the NG-coded list alone reddens', () => {
  const mutant = clone(loadRecord());
  const extra = clone(mutant.ngCodedMessages[0]);
  extra.order = mutant.messages.length;
  mutant.ngCodedMessages.push(extra);
  assert.throws(
    () => validate(mutant),
    /NG-coded list holds|not the console's own/,
  );
});

// ---------------------------------------------------------------- opt-in capture ----

if (process.env.M032_CAPTURE === '1') {
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
