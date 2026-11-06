// @ts-check
//
// M034 T001 — what a development build says about a legacy construct, and
// where it says it.
//
// The subject of the measurement is one construct on one fixture page: an
// `NgModule` that sets `id: module.id`
// (`spikes/ng222-app/src/app/legacy-module.ts`), imported by the routed page
// `LegacyModulePage` (`spikes/ng222-app/src/app/legacy-module-page.ts`).
// Nothing is enabled to make it speak: `ng serve` runs with the repository's
// own configuration, and the recording states the compiler options it ran with.
//
// Two places can carry the diagnostic, and the recording keeps them apart: the
// dev server's own output (recorded as `build.output`, with each NG-coded
// diagnostic in it transcribed by extraction, not by hand) and the page's
// console (recorded as `messages`).
//
// Run the checks against the recording. This is everything a default run does,
// and it needs no dev server, no browser and no opt-in, so it reports zero
// skipped tests:
//   node --experimental-strip-types --test scripts/legacy-diagnostic-capture.test.mjs
//
// Re-capture — the part that starts the fixture's dev server and a headless
// Chromium — is the same file, behind an explicit flag, and it is the only path
// that writes `research/raw/m034-legacy-diagnostic.json`:
//   set M034_CAPTURE=1 && node --experimental-strip-types --test scripts/legacy-diagnostic-capture.test.mjs
//
// Point the same checks at another recording — how the mutants are run:
//   set M034_RECORD=<path to a mutant recording> && node --experimental-strip-types --test scripts/legacy-diagnostic-capture.test.mjs
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
const ROUTE_PATH = '/legacy-module';
const RECORD_PATH =
  process.env.M034_RECORD ??
  join(ROOT, 'research', 'raw', 'm034-legacy-diagnostic.json');
const DIGEST_PATH = join(ROOT, 'extension', 'error-digest.json');
const PAGE_PATH = join(APP, 'src', 'app', 'legacy-module-page.ts');
const ROUTES_PATH = join(APP, 'src', 'app', 'app.routes.ts');
const COMPONENT_NAME = 'LegacyModulePage';

// Angular formats a runtime code as `NG0` + the absolute code (`NG0950`) and a
// framework-internal one as `NG0` + a four-digit number (`NG02952`), so the
// code is `NG` followed by four or five digits.
const NG_CODE = /NG\d{4,5}/;

const SCRIPT = 'scripts/legacy-diagnostic-capture.test.mjs';
const CAPTURE_COMMAND = `set M034_CAPTURE=1 && node --experimental-strip-types --test ${SCRIPT}`;
const CHECK_COMMAND = `node --experimental-strip-types --test ${SCRIPT}`;
const MUTANT_COMMAND = `set M034_RECORD=<path to a mutant recording> && node --experimental-strip-types --test ${SCRIPT}`;

const NAMES_DEFINITION =
  'the message body — every character before the first stack frame — naming an ' +
  "element (an HTML tag, or a selector such as 'app-x') or a component class name";

// `extension/error-digest.json` has no field for a modern equivalent: each entry
// carries a code, a title and a body. These are the phrases that make an entry's
// prose name a replacement, and the field name that would carry one if the digest
// ever gained such a field.
const MODERN_EQUIVALENT_MARKERS = [
  'instead',
  'should be used',
  'is preferred',
  'recommended',
  'migrate',
  'replace',
  'alternative',
];
const MODERN_EQUIVALENT_FIELD =
  /modern|equivalent|replacement|migrat|alternative/i;

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

/**
 * The digest's own entry for a code, and whether that entry states a modern
 * equivalent. The digest carries `code`, `title` and `body`; an entry states a
 * modern equivalent only if its prose names a replacement, so the answer is the
 * phrases found in the text, not a field that does not exist.
 *
 * @param {string} code an NG code
 */
function digestEntryFor(code) {
  const digest = JSON.parse(readFileSync(DIGEST_PATH, 'utf8'));
  const entry = (digest.entries ?? []).find((item) => item?.code === code);
  const fields = entry ? Object.keys(entry) : [];
  const text = entry ? `${entry.title ?? ''}\n${entry.body ?? ''}` : '';
  const matched = MODERN_EQUIVALENT_MARKERS.filter((marker) =>
    text.toLowerCase().includes(marker),
  );
  const firstMarked =
    matched.length > 0 ? text.toLowerCase().indexOf(matched[0]) : -1;
  // The evidence, not a paraphrase: the prose around the first phrase that names
  // a replacement. A digest entry with no such phrase records null.
  const context =
    firstMarked === -1
      ? null
      : text
          .slice(Math.max(0, firstMarked - 160), firstMarked + 160)
          .replace(/\s+/g, ' ')
          .trim();
  return {
    code,
    carried: Boolean(entry),
    title: entry?.title ?? null,
    fields,
    // A field dedicated to a modern equivalent would be named as one; the
    // digest has none, and this records that rather than assuming it.
    modernEquivalentField:
      fields.find((field) => MODERN_EQUIVALENT_FIELD.test(field)) ?? null,
    statesAModernEquivalent: matched.length > 0,
    matchedModernEquivalentPhrases: matched,
    modernEquivalentContext: context,
  };
}

/**
 * The NG-coded diagnostics in the dev server's own output, transcribed by
 * extraction from what the server printed, not by hand.
 *
 * @param {string} raw the server's stdout and stderr, ANSI included
 * @param {Array<{code: string | null}>} messages the page console's messages
 * @param {Set<string>} codes the digest's codes
 * @param {string} serveCommand the command that produced `raw`
 */
function buildObservationsFrom(raw, messages, codes, serveCommand) {
  const lines = stripAnsi(raw).replace(/\r\n/g, '\n').split('\n');
  const observations = [];
  const seen = new Set();
  lines.forEach((line, index) => {
    const code = codeOf(line);
    if (code === null) return;
    const body = line.match(/NG\d{4,5}:.*?(?=\s*\[plugin |\s*$)/);
    const text = (body ? body[0] : line).trim();
    if (seen.has(text)) return;
    seen.add(text);
    const sourceLocation =
      lines
        .slice(index + 1, index + 5)
        .map((candidate) => candidate.trim())
        .find((candidate) =>
          // `/path/file.ts:12:16:` — the CLI prints a trailing colon
          /^(?:[A-Za-z]:[\\/]|\/).*:\d+:\d+:?$/.test(candidate),
        ) ?? null;
    const plugin = /\[plugin ([^\]]+)\]/.exec(line)?.[1] ?? null;
    const block = [lines[index].trim()];
    let blanks = 0;
    for (let i = index + 1; i < lines.length && i <= index + 8; i += 1) {
      if (lines[i].trim() === '') {
        blanks += 1;
        if (blanks === 2) break;
        block.push('');
        continue;
      }
      blanks = 0;
      block.push(lines[i].trimEnd());
    }
    while (block.length > 0 && block[block.length - 1] === '') block.pop();
    observations.push({
      attempt:
        '@NgModule({ id: module.id }) on LegacyModule (spikes/ng222-app/src/app/legacy-module.ts)',
      stage: plugin
        ? `ng serve — ${plugin} plugin, printed during the build`
        : 'ng serve — printed during the build',
      command: serveCommand,
      code,
      text,
      sourceLocation,
      rawText: block.join('\n'),
      measuredFrom:
        "the dev server's own stdout/stderr, collected during this capture",
      reachedThePageConsole: messages.some((message) => message.code === code),
      digestCarriesCode: codes.has(code),
    });
  });
  return observations;
}

/** The dev server's output with its terminal colouring removed. */
function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u001b\[[0-9;]*[A-Za-z]/g, '');
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
  if (process.env.M034_PORT) return Number(process.env.M034_PORT);
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
        document.querySelector('#legacy-module-heading')?.textContent ?? null,
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

    const serveCommand = `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${port} --host 127.0.0.1  (cwd spikes/ng222-app)`;
    const buildOutput = stripAnsi(serverOutput)
      .replace(/\r\n/g, '\n')
      .trimEnd();
    const buildObservations = buildObservationsFrom(
      serverOutput,
      messages,
      codes,
      serveCommand,
    );
    const codesInTheBuildOutput = [
      ...new Set(buildObservations.map((observation) => observation.code)),
    ].sort();
    const codesCaptured = [
      ...new Set([...codesOnTheConsole, ...codesInTheBuildOutput]),
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
        serve: serveCommand,
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
        page: 'spikes/ng222-app/src/app/legacy-module-page.ts',
        module: 'spikes/ng222-app/src/app/legacy-module.ts',
        component: COMPONENT_NAME,
        construct:
          '@NgModule({ id: module.id }) — NgModule.id set to module.id anti-pattern',
        whyItReachesTheConsole:
          'the construct is a compile-time anti-pattern (NG6100); whether anything reaches the page console is what this capture measures',
        compilerOptionsChanged: [],
        angularCompilerOptions:
          tsconfig.angularCompilerOptions ?? 'none declared',
        angularCompilerOptionsSource:
          'spikes/ng222-app/tsconfig.json (tsconfig.app.json extends it and adds none)',
        expectedCodes: codesOnTheConsole,
        expectedCodesInTheBuildOutput: ['NG6100'],
      },
      page: {
        pageLoads: 1,
        documentLoads,
        ngVersion: dom.ngVersion,
        headingText: dom.headingText,
        uncaughtPageErrors: pageErrors.length,
      },
      console: {
        total: messages.length,
        withAnNgCode: ngCodedMessages.length,
        withoutAnNgCode: messages.length - ngCodedMessages.length,
      },
      messages,
      ngCodedMessages,
      // The dev server's own output, as it printed it, with the terminal
      // colouring removed. Every build observation below is extracted from this
      // text; the checks refuse an observation that this output does not carry.
      build: {
        command: serveCommand,
        output: buildOutput,
        outputCharacters: buildOutput.length,
        ngCodedLines: buildObservations.length,
      },
      buildObservations,
      digest: {
        path: 'extension/error-digest.json',
        entryCount: new Set(
          (JSON.parse(readFileSync(DIGEST_PATH, 'utf8')).entries ?? []).map(
            (entry) => entry.code,
          ),
        ).size,
        codesOnTheConsole,
        codesInTheBuildOutput,
        codesCaptured,
        codesNotCarried: codesOnTheConsole.filter((code) => !codes.has(code)),
        entries: codesCaptured.map((code) => digestEntryFor(code)),
      },
      // The three questions this recording exists to answer, each one derived
      // from the lists above and recomputed by the checks.
      verdict: {
        question:
          'Does a legacy-construct diagnostic reach the page console in a development build of this fixture?',
        answer: ngCodedMessages.length > 0 ? 'yes' : 'no',
        codesOnThePageConsole: codesOnTheConsole,
        codesInTheDevServerOutput: codesInTheBuildOutput,
        codesOnlyInTheDevServerOutput: codesInTheBuildOutput.filter(
          (code) => !codesOnTheConsole.includes(code),
        ),
        basis: {
          consoleMessages: messages.length,
          ngCodedConsoleMessages: ngCodedMessages.length,
          buildNGCodeLines: buildObservations.length,
          command: serveCommand,
        },
      },
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
  checkBuild(record, codes);
  checkDigestEntries(record);
}

/** The dev server's output, and the diagnostics extracted from it. */
function checkBuild(record, codes) {
  if (!isObject(record.build)) fail('missing the build block');
  checkStrings(record.build, ['command'], 'build');
  if (record.build.command !== record.commands.serve)
    fail('the build block does not name the command that printed it');
  if (typeof record.build.output !== 'string' || record.build.output === '')
    fail('the build block does not carry the output it was read from');
  if (record.build.outputCharacters !== record.build.output.length)
    fail(
      `the build block states ${record.build.outputCharacters} characters of output; it carries ${record.build.output.length}`,
    );
  if (!Array.isArray(record.buildObservations))
    fail('missing the build observations');
  if (record.build.ngCodedLines !== record.buildObservations.length)
    fail(
      `the build block states ${record.build.ngCodedLines} NG-coded line(s); the observations number ${record.buildObservations.length}`,
    );

  const lines = record.build.output.split('\n');
  for (const observation of record.buildObservations) {
    if (!isObject(observation)) fail('a build observation is not an object');
    checkStrings(
      observation,
      ['attempt', 'stage', 'text', 'rawText', 'measuredFrom', 'command'],
      'build observation',
    );
    if (observation.command !== record.commands.serve)
      fail('a build observation does not name the command that printed it');
    if (!NG_CODE.test(observation.text))
      fail('a build observation carries no NG code');
    const code = codeOf(observation.text);
    if (observation.code !== code)
      fail(
        `a build observation states code ${observation.code}; its text carries ${code}`,
      );
    // The observation must be in the output the recording carries: a hand
    // transcription that the server did not print cannot pass as one.
    const printed = observation.rawText.split('\n')[0].trim();
    if (!lines.some((line) => line.trim() === printed)) {
      fail(
        `a build observation quotes ${JSON.stringify(printed)}, which the recorded dev server output does not contain`,
      );
    }
    if (observation.sourceLocation !== null) {
      if (typeof observation.sourceLocation !== 'string')
        fail('a build observation has a malformed source location');
      if (!lines.some((line) => line.trim() === observation.sourceLocation))
        fail(
          `a build observation quotes the source location ${observation.sourceLocation}, which the recorded output does not contain`,
        );
    }
    if (observation.digestCarriesCode !== codes.has(code))
      fail(
        `a build observation states the digest carries its code wrongly: ${code}`,
      );
    // Recompute, do not assert: whether the diagnostic reached the console is a
    // measurement of this capture, and the recording must agree with it.
    const reached = record.messages.some((message) => message.code === code);
    if (observation.reachedThePageConsole !== reached)
      fail(
        `a build observation states ${code} ${reached ? 'did not reach' : 'reached'} the page console; the console list says otherwise`,
      );
  }
}

/** For every code captured, what the digest says about it — and whether it
 * names a modern equivalent, recomputed from the digest's own prose. */
function checkDigestEntries(record) {
  const captured = record.digest.codesCaptured;
  if (!Array.isArray(captured)) fail('missing the digest codesCaptured list');
  const expectedCodes = [
    ...new Set([
      ...record.digest.codesOnTheConsole,
      ...record.buildObservations.map((observation) => observation.code),
    ]),
  ].sort();
  if ([...captured].sort().join(',') !== expectedCodes.join(',')) {
    fail(
      `the digest block states codes [${captured.join(', ')}] were captured; the lists give [${expectedCodes.join(', ')}]`,
    );
  }
  if (!Array.isArray(record.digest.entries)) fail('missing the digest entries');
  if (record.digest.entries.length !== captured.length)
    fail(
      `the digest block carries ${record.digest.entries.length} entry/entries for ${captured.length} captured code(s)`,
    );
  for (const code of captured) {
    const stored = record.digest.entries.find((entry) => entry?.code === code);
    if (!stored) fail(`the digest block carries no entry for ${code}`);
    const observed = digestEntryFor(code);
    for (const key of [
      'carried',
      'title',
      'fields',
      'modernEquivalentField',
      'statesAModernEquivalent',
      'matchedModernEquivalentPhrases',
    ]) {
      if (JSON.stringify(stored[key]) !== JSON.stringify(observed[key])) {
        fail(
          `the digest entry for ${code} states ${key} is ${JSON.stringify(stored[key])}, but extension/error-digest.json gives ${JSON.stringify(observed[key])}`,
        );
      }
    }
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
  if (!Array.isArray(fixture.expectedCodes)) {
    fail('the fixture block does not state the expected codes');
  }
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

  // The fixture names the code it expects the compiler to flag; the dev server
  // output is what says whether the compiler flagged it.
  if (!Array.isArray(fixture.expectedCodesInTheBuildOutput))
    fail('the fixture does not state the codes it expects in the build output');
  const inTheBuildOutput = [
    ...new Set(record.buildObservations.map((observation) => observation.code)),
  ].sort();
  if (
    [...fixture.expectedCodesInTheBuildOutput].sort().join(',') !==
    inTheBuildOutput.join(',')
  ) {
    fail(
      `the fixture claims the build output carries [${fixture.expectedCodesInTheBuildOutput.join(', ')}] and it carries [${inTheBuildOutput.join(', ')}]: ` +
        'a dev server that printed no diagnostic for the construct did not compile it',
    );
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

/**
 * The recording's own answer to the question it exists for, recomputed from the
 * two lists it answers from. This is the fourth answer the digest cannot give:
 * where the diagnostic was printed.
 */
function checkVerdict(record) {
  const verdict = record.verdict;
  if (!isObject(verdict)) fail('missing the verdict block');
  checkStrings(verdict, ['question', 'answer'], 'verdict');
  const onTheConsole = [
    ...new Set(record.ngCodedMessages.map((message) => message.code)),
  ].sort();
  const inTheOutput = [
    ...new Set(record.buildObservations.map((observation) => observation.code)),
  ].sort();
  const observed = {
    answer: record.ngCodedMessages.length > 0 ? 'yes' : 'no',
    codesOnThePageConsole: onTheConsole,
  };
  const observedBuild = {
    codesInTheDevServerOutput: inTheOutput,
    codesOnlyInTheDevServerOutput: inTheOutput.filter(
      (code) => !onTheConsole.includes(code),
    ),
  };
  for (const [key, value] of Object.entries({
    ...observed,
    ...observedBuild,
  })) {
    if (JSON.stringify(verdict[key]) !== JSON.stringify(value)) {
      fail(
        `the verdict states ${key} is ${JSON.stringify(verdict[key])}; the recording's lists give ${JSON.stringify(value)}`,
      );
    }
  }
  if (verdict.basis?.consoleMessages !== record.messages.length)
    fail('the verdict counts a different number of console messages');
  if (verdict.basis?.ngCodedConsoleMessages !== record.ngCodedMessages.length)
    fail('the verdict counts a different number of NG-coded console messages');
  if (verdict.basis?.buildNGCodeLines !== record.buildObservations.length)
    fail('the verdict counts a different number of NG-coded build lines');
  if (verdict.basis?.command !== record.commands.serve)
    fail('the verdict names a different command than the build block');
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
  if (!record.commands.capture.includes('M034_CAPTURE=1'))
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
  checkVerdict(record);
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
  assert.match(record.url, /\/legacy-module$/);
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/);
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('the dev server printed the construct’s diagnostic, and the recording quotes it', () => {
  const record = loadRecord();
  const observation = record.buildObservations.find(
    (item) => item.code === 'NG6100',
  );
  assert.ok(observation, 'the dev server printed no NG6100 for the construct');
  assert.match(
    observation.sourceLocation ?? '',
    /legacy-module\.ts:\d+:\d+:?$/,
    'the diagnostic does not name the module that sets module.id',
  );
  assert.ok(
    record.build.output.includes(observation.rawText.split('\n')[0].trim()),
    'the recorded output does not carry the diagnostic it records',
  );
});

test('no console message carries an NG code (the construct is compile-time only)', () => {
  const record = loadRecord();
  assert.equal(
    record.ngCodedMessages.length,
    0,
    'a legacy construct diagnostic reached the page console',
  );
  assert.deepEqual(record.fixture.expectedCodes, []);
  assert.ok(record.buildObservations.length > 0);
});

test('the digest carries the compile-time code; nothing reaches the page console', () => {
  const record = loadRecord();
  const codes = digestCodes();
  assert.ok(codes.has('NG6100'), 'digest must carry NG6100');
  assert.deepEqual(record.digest.codesOnTheConsole, []);
  assert.deepEqual(record.digest.codesNotCarried, []);
  assert.ok(record.buildObservations.length > 0);
  for (const observation of record.buildObservations) {
    assert.equal(observation.reachedThePageConsole, false);
    assert.equal(observation.digestCarriesCode, true);
  }
});

test('the digest entry for the captured code is recorded, with what it offers instead', () => {
  const record = loadRecord();
  const entry = record.digest.entries.find((item) => item.code === 'NG6100');
  assert.ok(entry, 'the recording holds no digest entry for NG6100');
  assert.equal(entry.carried, true);
  assert.deepEqual(
    entry.fields,
    ['code', 'title', 'body'],
    'the digest entry gained a field the recording does not describe',
  );
  assert.equal(
    entry.modernEquivalentField,
    null,
    'the digest entry grew a dedicated modern-equivalent field',
  );
  assert.equal(entry.statesAModernEquivalent, true);
  assert.ok(
    entry.matchedModernEquivalentPhrases.length > 0,
    'the entry states a modern equivalent with no phrase to show for it',
  );
  assert.ok(
    typeof entry.modernEquivalentContext === 'string' &&
      entry.modernEquivalentContext !== '',
    'the entry states a modern equivalent with no prose to show for it',
  );
});

test('PRECONDITION: app.routes.ts registers the fixture page', () => {
  const routes = readFileSync(ROUTES_PATH, 'utf8');
  assert.ok(existsSync(PAGE_PATH), 'the fixture page is missing');
  assert.match(routes, /LegacyModulePage/);
  assert.ok(
    routes.includes(`path: 'legacy-module'`),
    'the legacy-module route is not in the route table',
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

/**
 * A copy of a recording carrying one fabricated NG-coded console message, so a
 * mutant has a message to falsify whatever the real capture found. The copy
 * validates — each mutation below then flips exactly one thing in it.
 *
 * @param {any} base a recording that validates
 * @param {string} code the code to hang on the fabricated message
 */
function withACodedMessage(base, code = 'NG9999') {
  const mutant = clone(base);
  const text = `${code}: fabricated diagnostic\n    at Object.<anonymous> (legacy-module-page.ts:1:1)`;
  const location = {
    url: mutant.pageUrl,
    lineNumber: 1,
    columnNumber: 1,
  };
  const order = mutant.messages.length;
  mutant.messages.push({ order, type: 'error', code, text, location });
  mutant.ngCodedMessages.push({
    order,
    type: 'error',
    code,
    text,
    location,
    digestCarriesCode: digestCodes().has(code),
    namesElementOrComponent: namesElementOrComponent(text, COMPONENT_NAME),
  });
  const onTheConsole = [
    ...new Set(mutant.ngCodedMessages.map((message) => message.code)),
  ].sort();
  mutant.console.total = mutant.messages.length;
  mutant.console.withAnNgCode = mutant.ngCodedMessages.length;
  mutant.console.withoutAnNgCode =
    mutant.messages.length - mutant.ngCodedMessages.length;
  mutant.fixture.expectedCodes = onTheConsole;
  mutant.digest.codesOnTheConsole = onTheConsole;
  mutant.digest.codesNotCarried = onTheConsole.filter(
    (captured) => !digestCodes().has(captured),
  );
  mutant.digest.codesCaptured = [
    ...new Set([...onTheConsole, ...mutant.digest.codesInTheBuildOutput]),
  ].sort();
  mutant.digest.entries = mutant.digest.codesCaptured.map((captured) =>
    digestEntryFor(captured),
  );
  mutant.verdict.answer = 'yes';
  mutant.verdict.codesOnThePageConsole = onTheConsole;
  mutant.verdict.codesOnlyInTheDevServerOutput =
    mutant.verdict.codesInTheDevServerOutput.filter(
      (captured) => !onTheConsole.includes(captured),
    );
  mutant.verdict.basis.consoleMessages = mutant.messages.length;
  mutant.verdict.basis.ngCodedConsoleMessages = mutant.ngCodedMessages.length;
  return mutant;
}

test('held-out: a recording whose dev server never printed the construct reddens', () => {
  // A route removed from the table, or a module that stopped being compiled:
  // the dev server prints nothing NG-coded while the fixture still claims it
  // should. That recording contradicts itself.
  const base = loadRecord();
  assert.ok(base.buildObservations.length > 0, 'nothing to remove');
  const mutant = clone(base);
  mutant.buildObservations = [];
  mutant.build.ngCodedLines = 0;
  assert.throws(() => validate(mutant), /build output carries/);
});

test('held-out: a build observation the recorded output does not carry reddens', () => {
  const mutant = clone(loadRecord());
  mutant.buildObservations[0].rawText =
    'NG6100: a line the server never printed';
  assert.throws(
    () => validate(mutant),
    /recorded dev server output does not contain/,
  );
});

test('held-out: a message whose text lost its code reddens', () => {
  // The console entry and the NG-coded entry are two lists of one capture: a
  // text rewritten in one of them, or in both, cannot pass as the browser's.
  const mutant = withACodedMessage(loadRecord());
  const message = mutant.ngCodedMessages.at(-1);
  message.text = message.text.replace(/NG\d{4,5}/g, 'NG0000');
  message.code = 'NG0000';
  assert.throws(() => validate(mutant), /disagrees with the console list/);
});

test('held-out: a code the message text does not carry reddens', () => {
  const mutant = withACodedMessage(loadRecord());
  mutant.ngCodedMessages.at(-1).code = 'NG8008';
  assert.throws(() => validate(mutant), /disagrees with the console list/);
});

test('held-out: a message claiming to name a component reddens', () => {
  const mutant = withACodedMessage(loadRecord());
  const names = mutant.ngCodedMessages.at(-1).namesElementOrComponent;
  names.any = true;
  names.component = COMPONENT_NAME;
  assert.throws(
    () => validate(mutant),
    /namesElementOrComponent\.(any|component)/,
  );
});

test('held-out: a message claiming digest coverage it does not have reddens', () => {
  const mutant = withACodedMessage(loadRecord());
  const message = mutant.ngCodedMessages.at(-1);
  message.digestCarriesCode = !message.digestCarriesCode;
  assert.throws(() => validate(mutant), /digest carries/);
});

test('held-out: a message injected into the NG-coded list alone reddens', () => {
  const mutant = withACodedMessage(loadRecord());
  const extra = clone(mutant.ngCodedMessages.at(-1));
  extra.order = mutant.messages.length;
  mutant.ngCodedMessages.push(extra);
  assert.throws(
    () => validate(mutant),
    /NG-coded list holds|not the console's own/,
  );
});

test('held-out: a digest entry claiming a modern equivalent it does not state reddens', () => {
  const mutant = clone(loadRecord());
  const entry = mutant.digest.entries[0];
  entry.statesAModernEquivalent = !entry.statesAModernEquivalent;
  assert.throws(() => validate(mutant), /statesAModernEquivalent/);
});

test('held-out: a verdict claiming the console heard the diagnostic reddens', () => {
  const mutant = clone(loadRecord());
  mutant.verdict.answer = 'yes';
  mutant.verdict.codesOnThePageConsole = ['NG6100'];
  assert.throws(
    () => validate(mutant),
    /the verdict states (answer|codesOnThePageConsole)/,
  );
});

// ---------------------------------------------------------------- opt-in capture ----

if (process.env.M034_CAPTURE === '1') {
  test('capture the page console in headless Chromium', async () => {
    const record = await runCapture();
    writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
    validate(record);
  });
}
