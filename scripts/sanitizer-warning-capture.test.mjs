// @ts-check
//
// M029 T001 — record what the sanitizer warning and the page agent's profiler events actually contain,
// in one page load of the two-binding fixture (`spikes/ng222-app/src/app/trust-bypass-page.ts`).
//
// Run the checks against the recording:
//   node --test scripts/sanitizer-warning-capture.test.mjs
//
// Re-capture (starts the fixture's dev server and a headless Chromium itself; needs
// `npm --prefix spikes/ng222-app ci --include=dev` and the Playwright browsers):
//   M029_CAPTURE=1 node --test scripts/sanitizer-warning-capture.test.mjs
//
// Point the same checks at another recording — how the mutants are run:
//   set M029_RECORD=<path to a mutant capture>& node --test scripts/sanitizer-warning-capture.test.mjs
//
// Nothing in the recording's console list is written by hand: the capture stores the browser's own
// console messages twice, from two independent channels (CDP `Runtime.consoleAPICalled` and an
// in-page tap at document_start), and the checks below refuse a recording whose two lists disagree.
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
const RECORD_PATH = process.env.M029_RECORD ?? join(ROOT, 'research', 'raw', 'm029-sanitizer-warning.json');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const ROUTE_PATH = '/trust-bypass';
const PORT = Number(process.env.M029_PORT ?? 4271);
const ORIGIN = `http://127.0.0.1:${PORT}`;
const PAGE_URL = `${ORIGIN}${ROUTE_PATH}`;

const SANITIZER_WARNING = /WARNING: sanitizing HTML stripped some content/;
const PROFILER_EVENTS = new Set([2, 3, 6, 7]); // TemplateUpdateStart, TemplateUpdateEnd, OutputStart, OutputEnd
const TEMPLATE_UPDATE_EVENTS = [2, 3];
const TAP_TYPE_TO_CDP = { warn: 'warning', log: 'log', debug: 'debug', info: 'info', error: 'error' };

const CAPTURE_COMMAND = 'set M029_CAPTURE=1&& node --test scripts/sanitizer-warning-capture.test.mjs';
const CHECK_COMMAND = 'node --test scripts/sanitizer-warning-capture.test.mjs';
const MUTANT_COMMAND = 'set M029_RECORD=<path to a mutant recording>& node --test scripts/sanitizer-warning-capture.test.mjs';
const SERVE_COMMAND = `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${PORT} --host 127.0.0.1  (cwd spikes/ng222-app)`;

// The in-page tap: one clock for the console messages and the page agent's records, so the interleaved
// order is measured and not inferred. It also records when the agent's profiler subscription came up.
const TAP_SOURCE = `(() => {
  const tap = { t0: performance.now(), log: [], installedAt: null };
  window.__m029tap = tap;
  for (const name of ['log', 'debug', 'info', 'warn', 'error']) {
    const original = console[name];
    console[name] = function (...args) {
      let text;
      try { text = args.map((a) => (typeof a === 'string' ? a : String(a))).join(' '); } catch (e) { text = '<unstringifiable>'; }
      tap.log.push({ kind: 'console', t: performance.now(), type: name, text });
      return original.apply(this, args);
    };
  }
  window.addEventListener('angular-ai:record', (event) => {
    tap.log.push({ kind: 'record', t: performance.now(), detail: event.detail });
  });
  const poll = setInterval(() => {
    if (window.__ngRecorder && window.__ngRecorder.installed && tap.installedAt === null) {
      tap.installedAt = performance.now();
      clearInterval(poll);
    }
  }, 1);
})();`;

// ---------------------------------------------------------------- capture ----------------

async function runCapture() {
  const requireApp = createRequire(join(APP, 'package.json'));
  let chromium;
  try {
    ({ chromium } = requireApp('playwright'));
  } catch (error) {
    throw new Error(`playwright is not installed for the fixture (${APP}); run: npm --prefix spikes/ng222-app ci --include=dev. ${error}`);
  }
  const playwrightVersion = requireApp('playwright/package.json').version;
  const angularVersion = JSON.parse(readFileSync(join(APP, 'node_modules', '@angular', 'core', 'package.json'), 'utf8')).version;
  if (!existsSync(AGENT_PATH)) throw new Error(`the page agent is missing at ${AGENT_PATH}`);
  if (!existsSync(join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'))) {
    throw new Error('the fixture’s Angular CLI is not installed; run: npm --prefix spikes/ng222-app ci --include=dev');
  }

  const server = spawn(
    process.execPath,
    [join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'serve', '--port', String(PORT), '--host', '127.0.0.1'],
    { cwd: APP, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-4000); });
  server.stderr.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-4000); });

  let browser;
  try {
    await waitForServer(server, () => serverOutput);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();

    // One `load` per document: a reload would add a second. `framenavigated` is recorded beside it but
    // not counted, because the router's own same-document history entry fires it too.
    const documentLoads = [];
    page.on('load', () => documentLoads.push(page.url()));
    const navigations = [];
    page.on('framenavigated', (frame) => { if (frame === page.mainFrame()) navigations.push(frame.url()); });

    const cdp = await context.newCDPSession(page);
    const cdpConsole = [];
    cdp.on('Runtime.consoleAPICalled', (event) => {
      const text = (event.args ?? [])
        .map((arg) => ('value' in arg && arg.value !== undefined ? arg.value : (arg.description ?? arg.unserializableValue ?? '')))
        .join(' ');
      cdpConsole.push({
        type: String(event.type),
        text: String(text),
        timestamp: Number(event.timestamp),
        executionContextId: event.executionContextId ?? null,
      });
    });
    await cdp.send('Runtime.enable');

    await page.addInitScript(TAP_SOURCE);
    await page.addInitScript({ path: AGENT_PATH });

    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    // The fixture's first write: the unsafe host carries the value the sanitizer strips.
    await page.waitForFunction(() => (document.getElementById('unsafe')?.getAttribute('data-bound') ?? '').includes('kept paragraph 1'), null, { timeout: 60000 });
    const firstDom = await readFixtureDom(page);
    // The page agent installs its profiler subscription from a poll; the first write is already done by
    // then. Wait for it so the second write is measured with the subscription in place.
    await page.waitForFunction(() => !!(window.__ngRecorder && window.__ngRecorder.installed), null, { timeout: 60000 });
    await page.waitForTimeout(900);
    await page.click('#rewrite');
    await page.waitForFunction(() => (document.getElementById('unsafe')?.getAttribute('data-bound') ?? '').includes('kept paragraph 2'), null, { timeout: 60000 });
    await page.waitForTimeout(600);
    const secondDom = await readFixtureDom(page);
    const scriptRan = await page.evaluate(() => window.__m029StrippedScriptRan === true);

    const tapDump = await page.evaluate(() => {
      const trim = (detail) => ({
        cycleId: detail?.cycleId ?? null,
        startedAt: typeof detail?.startedAt === 'number' ? detail.startedAt : null,
        trigger: detail?.trigger ?? null,
        zoneMode: detail?.zoneMode ?? null,
        checks: (detail?.checks ?? []).map((check) => ({
          componentName: check?.componentName ?? null,
          className: check?.className ?? null,
          changeDetection: check?.changeDetection ?? null,
          events: Array.isArray(check?.events) ? check.events.slice() : [],
          changedNodeIds: Array.isArray(check?.changedNodeIds) ? check.changedNodeIds.slice() : [],
          graphNodeCount: Array.isArray(check?.graph?.nodes) ? check.graph.nodes.length : null,
        })),
      });
      const tap = window.__m029tap ?? { log: [], installedAt: null };
      return {
        installedAt: typeof tap.installedAt === 'number' ? tap.installedAt : null,
        log: (tap.log ?? []).map((entry) =>
          entry.kind === 'record'
            ? { kind: 'record', t: entry.t, detail: trim(entry.detail) }
            : { kind: entry.kind, t: entry.t, type: entry.type, text: entry.text },
        ),
      };
    });

    await browser.close();
    browser = undefined;

    return buildRecording({
      browserBuild,
      playwrightVersion,
      angularVersion,
      documentLoads,
      navigations,
      cdpConsole,
      tapDump,
      firstDom,
      secondDom,
      scriptRan,
    });
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopServer(server);
  }
}

async function readFixtureDom(page) {
  return page.evaluate(() => {
    const read = (id) => {
      const element = document.getElementById(id);
      if (!element) return null;
      return { bound: element.getAttribute('data-bound'), rendered: element.innerHTML };
    };
    return { unsafe: read('unsafe'), safe: read('safe') };
  });
}

async function waitForServer(server, output) {
  const started = Date.now();
  let exit = null;
  server.on('exit', (code, signal) => { exit = { code, signal }; });
  while (Date.now() - started < 180000) {
    if (exit) throw new Error(`the fixture dev server exited (${JSON.stringify(exit)}):\n${output()}`);
    try {
      const response = await fetch(`${ORIGIN}/`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      /* not listening yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`the fixture dev server did not answer on ${ORIGIN} within 180s:\n${output()}`);
}

async function stopServer(server) {
  if (server.exitCode !== null || server.signalCode !== null) return;
  server.kill();
  const timer = setTimeout(() => { try { server.kill('SIGKILL'); } catch { /* gone */ } }, 5000);
  timer.unref?.();
  try { await once(server, 'exit'); } catch { /* already gone */ }
  clearTimeout(timer);
}

function writeOf(entry, version) {
  const value = entry?.bound ?? null;
  const rendered = entry?.rendered ?? null;
  const scriptInValue = value !== null && /<script/i.test(value);
  const scriptInRendered = rendered !== null && /<script/i.test(rendered);
  // What the write should leave behind if the sanitizer removes exactly the <script> elements and
  // nothing else. A write counts as stripped when the rendered markup is that, with no script left:
  // a value that was bound but never written (empty markup) is not a strip.
  const expectedRender = scriptInValue ? value.replace(/<script[\s\S]*?<\/script>/gi, '') : value;
  return {
    version,
    value,
    rendered,
    expectedRender,
    scriptInValue,
    scriptInRendered,
    stripped: scriptInValue && !scriptInRendered && rendered === expectedRender,
  };
}

function buildRecording(input) {
  const consoleMessages = input.cdpConsole.map((message, order) => ({
    order,
    type: message.type,
    text: message.text,
    code: /NG0\d{3,}/.test(message.text) ? (message.text.match(/NG0\d{3,}/) ?? [null])[0] : null,
    timestamp: message.timestamp,
    executionContextId: message.executionContextId,
  }));

  const tapMessages = [];
  const records = [];
  const sequence = [];
  for (const entry of input.tapDump.log) {
    if (entry.kind === 'console') {
      const order = tapMessages.length;
      tapMessages.push({ order, t: entry.t, type: entry.type, text: entry.text });
      sequence.push({ order: sequence.length, source: 'console', ref: order, t: entry.t, name: `console:${entry.type}` });
    } else if (entry.kind === 'record') {
      const order = records.length;
      records.push({
        order,
        t: entry.t,
        cycleId: entry.detail.cycleId,
        startedAt: entry.detail.startedAt,
        trigger: entry.detail.trigger,
        zoneMode: entry.detail.zoneMode,
        checks: entry.detail.checks,
      });
      sequence.push({
        order: sequence.length,
        source: 'profiler',
        ref: order,
        t: entry.t,
        name: `record:cycle-${entry.detail.cycleId}`,
      });
    }
  }

  const writes = [
    { binding: 'unsafe', version: 1, when: 'initial render', entry: input.firstDom.unsafe },
    { binding: 'safe', version: 1, when: 'initial render', entry: input.firstDom.safe },
    { binding: 'unsafe', version: 2, when: 'the page’s own rewrite button', entry: input.secondDom.unsafe },
    { binding: 'safe', version: 2, when: 'the page’s own rewrite button', entry: input.secondDom.safe },
  ];

  const bindings = ['unsafe', 'safe'].map((id) => ({
    id,
    host: `#${id}`,
    attribute: '[innerHTML]',
    writes: writes
      .filter((write) => write.binding === id)
      .map((write) => ({ ...writeOf(write.entry, write.version), when: write.when })),
  }));

  const warningMessages = consoleMessages.filter((message) => message.type === 'warning' && SANITIZER_WARNING.test(message.text));
  const strippedWrites = writes.filter((write) => writeOf(write.entry, write.version).stripped);

  const occurrences = warningMessages.map((message, index) => {
    // The two console channels carry the same messages in the same order, so the browser message's
    // order is also its index in the page tap.
    const tapIndex = message.order;
    const tapEntry = tapMessages[tapIndex];
    const sequenceIndex = sequence.findIndex((entry) => entry.source === 'console' && entry.ref === tapIndex);
    const covering = records.findIndex(
      (record) =>
        record.startedAt !== null &&
        record.startedAt <= tapEntry.t &&
        tapEntry.t <= record.t &&
        record.checks.some((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))),
    );
    const coveringRecord = covering === -1 ? null : records[covering];
    const recordSequenceIndex = coveringRecord ? sequence.findIndex((entry) => entry.source === 'profiler' && entry.ref === covering) : -1;
    const positionsBetween = coveringRecord ? recordSequenceIndex - sequenceIndex - 1 : null;
    const shares = Boolean(coveringRecord) && positionsBetween === 0;
    const write = strippedWrites[index] ?? null;

    let reading;
    if (coveringRecord) {
      const named = coveringRecord.checks
        .map((check) => `${check.componentName} events [${check.events.join(',')}]`)
        .join(', ');
      reading =
        `the warning at page-clock ${tapEntry.t} falls inside cycle ${coveringRecord.cycleId}'s template-update window ` +
        `[${coveringRecord.startedAt}, ${coveringRecord.t}], which records ${named} and names no binding, so the warning ` +
        'shares a position with the record and with no single event';
    } else {
      const nearest = records[0] ?? null;
      reading =
        `the warning at page-clock ${tapEntry.t} has no covering profiler record in this load: the agent's profiler ` +
        `subscription came up at ${input.tapDump.installedAt}, after this write; ` +
        (nearest
          ? `the first record of the load is cycle ${nearest.cycleId} with events [${nearest.checks.map((check) => check.events.join(',')).join('] [')}]`
          : 'no record was dispatched in this load at all');
    }

    return {
      id: write ? `${write.binding}-write-${write.version}` : `warning-${index + 1}`,
      binding: write ? write.binding : null,
      writeVersion: write ? write.version : null,
      warningConsole: message.order,
      warningTap: tapIndex,
      warningTapTime: tapEntry.t,
      coveringRecord: coveringRecord ? coveringRecord.order : null,
      coveringCycleId: coveringRecord ? coveringRecord.cycleId : null,
      coveringRecordTapTime: coveringRecord ? coveringRecord.t : null,
      insideTemplateUpdateWindow: Boolean(coveringRecord),
      positionsBetween,
      sharesPositionWithBindingEvent: shares,
      reading,
    };
  });

  const contains = {
    console: {
      messages: consoleMessages.length,
      warnings: consoleMessages.filter((message) => message.type === 'warning').length,
      sanitizerWarnings: warningMessages.length,
      messagesCarryingAnNgCode: consoleMessages.filter((message) => message.code !== null).length,
      distinctSanitizerWarningTexts: [...new Set(warningMessages.map((message) => message.text))],
    },
    pageTap: {
      messages: tapMessages.length,
      warnings: tapMessages.filter((message) => message.type === 'warn').length,
    },
    profiler: {
      records: records.length,
      recordsCarryingTemplateUpdateEvents: records.filter((record) =>
        record.checks.some((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))),
      ).length,
      checksCarryingTemplateUpdateEvents: records.reduce(
        (total, record) =>
          total + record.checks.filter((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))).length,
        0,
      ),
      eventNumbers: [...new Set(records.flatMap((record) => record.checks.flatMap((check) => check.events)))].sort((a, b) => a - b),
      checkFields: [...new Set(records.flatMap((record) => record.checks.flatMap((check) => Object.keys(check))))],
      namesTheBinding: records.some((record) => JSON.stringify(record.checks).includes('innerHTML')),
      identifiesTheWrittenElement: records.some((record) => /unsafe|#safe/.test(JSON.stringify(record.checks))),
      syntheticRecords: records.filter((record) =>
        record.checks.every((check) => check.events.length === 0),
      ).length,
    },
    ordering: {
      occurrences: occurrences.length,
      occurrencesWithACoveringRecord: occurrences.filter((occurrence) => occurrence.coveringRecord !== null).length,
      occurrencesWithoutACoveringRecord: occurrences.filter((occurrence) => occurrence.coveringRecord === null).length,
      firstWritePrecededTheSubscription: occurrences.length > 0 && occurrences[0].warningTapTime < (input.tapDump.installedAt ?? Infinity),
      sharesPosition: occurrences.some((occurrence) => occurrence.sharesPositionWithBindingEvent),
    },
  };

  return {
    probe:
      'M029 T001 — one page load of the two-binding sanitizer fixture: the browser console list, the profiler events ' +
      'the page agent records, and the relative order of the strip warning against those events',
    milestone: 'M029',
    task: 'T001',
    capturedAt: new Date().toISOString(),
    browser: `headless Playwright Chromium (build ${input.browserBuild})`,
    browserBuild: input.browserBuild,
    instance: 'headless',
    playwright: input.playwrightVersion,
    angularVersion: input.angularVersion,
    url: PAGE_URL,
    pageUrl: PAGE_URL,
    commands: {
      install: 'npm ci --include=dev',
      installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
      serve: SERVE_COMMAND,
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
      source: 'spikes/ng222-app/src/app/trust-bypass-page.ts',
      routeTable: 'spikes/ng222-app/src/app/app.routes.ts',
      pageLoads: 1,
      documentLoads: input.documentLoads.length,
      documentLoadsNote: 'one `load` event per document; a reload inside the measurement would add a second',
      loads: input.documentLoads,
      framenavigated: input.navigations,
      framenavigatedNote:
        'framenavigated also fires for the router’s own same-document history write, so two identical URLs here are one document',
      strippedScriptRan: input.scriptRan,
      bindings,
    },
    console: {
      channel: 'CDP Runtime.consoleAPICalled on the measured page load, one event per console call, arguments joined with a space',
      mainWorldContexts: new Set(input.cdpConsole.map((message) => message.executionContextId)).size,
      count: consoleMessages.length,
      messages: consoleMessages,
    },
    pageTap: {
      channel: 'in-page tap on console.* at document_start, same page clock (performance.now) as the profiler records',
      count: tapMessages.length,
      messages: tapMessages,
    },
    profiler: {
      channel:
        'the page agent’s own records: extension/agent-main.js injected as a MAIN-world init script at document_start, ' +
        'subscribing ng.ɵsetProfiler and dispatching angular-ai:record; each record kept with its component checks and ' +
        'their ProfilerEvent numbers (2 TemplateUpdateStart, 3 TemplateUpdateEnd, 6 OutputStart, 7 OutputEnd), the signal ' +
        'graph dropped',
      installedAt: input.tapDump.installedAt,
      count: records.length,
      records,
    },
    contains,
    ordering: {
      clock:
        'performance.now() of the measured document; the console tap and the record listener run in that document, so the ' +
        'interleaved sequence is measured on one clock rather than compared across two',
      definition:
        'An occurrence shares a position with a profiler event when (a) its page-clock time falls inside the ' +
        'template-update window [record.startedAt, record.t] of a record carrying TemplateUpdateStart (2) and ' +
        'TemplateUpdateEnd (3), and (b) no other console message or record was observed between the warning and that ' +
        'record’s dispatch. A record carries component checks and event numbers only, so a shared position is with the ' +
        'record, never with a single binding.',
      sequence,
      occurrences,
      sharesPosition: {
        any: occurrences.some((occurrence) => occurrence.sharesPositionWithBindingEvent),
        occurrences: occurrences.filter((occurrence) => occurrence.sharesPositionWithBindingEvent).map((occurrence) => occurrence.id),
      },
    },
  };
}

// ---------------------------------------------------------------- checks ----------------

function fail(message) {
  throw new Error(message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkProvenance(record) {
  if (!isObject(record)) fail('the recording is not a JSON object');
  for (const key of ['browser', 'browserBuild', 'instance', 'playwright', 'angularVersion', 'url', 'pageUrl', 'capturedAt']) {
    if (typeof record[key] !== 'string' || record[key] === '') fail(`missing provenance field: ${key}`);
  }
  if (record.instance !== 'headless') fail(`instance is ${record.instance}, not the headless capture this record claims`);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(record.capturedAt)) fail('capturedAt is not an ISO timestamp');
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(record.browserBuild)) fail('browserBuild is not a Chromium build string');
  if (!record.browser.includes(record.browserBuild)) fail('browser does not name the build in browserBuild');
  if (record.url !== record.pageUrl) fail('url and pageUrl disagree');
  if (!/^http:\/\/127\.0\.0\.1:\d+\/trust-bypass$/.test(record.url)) fail(`url is not the fixture route: ${record.url}`);
  if (!isObject(record.commands)) fail('missing commands');
  for (const key of ['install', 'installApp', 'serve', 'capture', 'check', 'mutants']) {
    if (typeof record.commands[key] !== 'string' || record.commands[key] === '') fail(`missing command: ${key}`);
  }
  if (!isObject(record.environment)) fail('missing the environment the capture ran in');
  for (const key of ['platform', 'shell', 'node']) {
    if (typeof record.environment[key] !== 'string' || record.environment[key] === '') fail(`missing environment field: ${key}`);
  }
}

function checkConsoleLists(record) {
  if (!isObject(record.console) || !Array.isArray(record.console.messages)) fail('missing console list');
  if (!isObject(record.pageTap) || !Array.isArray(record.pageTap.messages)) fail('missing the page tap list');
  const browserMessages = record.console.messages;
  const tapMessages = record.pageTap.messages;
  if (record.console.count !== browserMessages.length) fail('console.count disagrees with the console list');
  if (record.pageTap.count !== tapMessages.length) fail('pageTap.count disagrees with the page tap list');
  if (record.console.mainWorldContexts !== 1) {
    fail(`the console list spans ${record.console.mainWorldContexts} execution contexts; a page that reloaded mid-capture is not one page load`);
  }
  if (browserMessages.length !== tapMessages.length) {
    fail(
      `the console list holds ${browserMessages.length} messages and the page's own tap holds ${tapMessages.length}: ` +
        'a message in one list and not the other was not emitted by the page',
    );
  }
  for (const message of browserMessages) {
    if (typeof message.text !== 'string') fail('console message without text');
    if (typeof message.type !== 'string') fail('console message without a type');
    if (message.code !== null && !message.text.includes(message.code)) fail(`invented code: ${message.code} not present in the message text`);
    if (!('timestamp' in message)) fail('console message without the browser timestamp');
  }
  for (const [index, tap] of tapMessages.entries()) {
    const browser = browserMessages[index];
    if (tap.order !== index) fail(`page tap message ${index} carries order ${tap.order}`);
    if (browser.order !== index) fail(`console message ${index} carries order ${browser.order}`);
    if (TAP_TYPE_TO_CDP[tap.type] !== browser.type) {
      fail(`console message ${index} is ${browser.type} in the browser and ${tap.type} in the page's own tap`);
    }
    if (typeof tap.text !== 'string') fail(`page tap message ${index} has no text`);
    if (tap.text !== browser.text) {
      fail(`message ${index} differs between the two channels: ${JSON.stringify(browser.text)} vs ${JSON.stringify(tap.text)}`);
    }
    if (index > 0 && tap.t < tapMessages[index - 1].t) fail(`the page tap clock goes backwards at message ${index}`);
  }
}

function checkFixture(record) {
  if (!isObject(record.fixture) || !Array.isArray(record.fixture.bindings)) fail('missing the fixture block');
  const ids = record.fixture.bindings.map((binding) => binding.id);
  if (ids.join(',') !== 'unsafe,safe') {
    fail(
      `the recording is not a capture of the two-binding fixture: it holds ${ids.length} binding(s) [${ids.join(', ')}] — ` +
        'the fixture is one stripping [innerHTML] binding and one safe one',
    );
  }
  const unsafe = record.fixture.bindings[0];
  const safe = record.fixture.bindings[1];
  if (unsafe.attribute !== '[innerHTML]' || safe.attribute !== '[innerHTML]') fail('the fixture bindings are not [innerHTML] bindings');
  if (!Array.isArray(unsafe.writes) || unsafe.writes.length === 0) fail('the unsafe binding records no write');
  if (!Array.isArray(safe.writes) || safe.writes.length === 0) fail('the safe binding records no write');
  for (const write of unsafe.writes) {
    if (write.value === null) fail(`the unsafe binding's write ${write.version} recorded no value`);
    if (!write.scriptInValue) fail(`the unsafe binding's write ${write.version} carries no <script> element to strip`);
    if (write.rendered === null) fail(`the unsafe binding's write ${write.version} recorded no rendered markup`);
    if (write.scriptInRendered) fail(`the unsafe binding's write ${write.version} kept its <script> element: nothing was stripped`);
  }
  for (const write of safe.writes) {
    if (write.value === null) fail(`the safe binding's write ${write.version} recorded no value`);
    if (write.scriptInValue) fail(`the safe binding's write ${write.version} is not safe markup`);
    if (write.stripped) fail(`the safe binding's write ${write.version} was changed by the sanitizer; it is the control`);
    if (write.rendered !== write.value) fail(`the safe binding's write ${write.version} rendered differently from its value`);
  }
  if (record.fixture.pageLoads !== 1) fail('the recording does not describe one page load');
  if (record.fixture.documentLoads !== 1) {
    fail(
      `the measured page load loaded ${record.fixture.documentLoads} documents, not one: ` +
        JSON.stringify(record.fixture.loads),
    );
  }
  if (record.fixture.strippedScriptRan !== false) fail('the stripped <script> executed: the sanitizer did not remove it');
}

function checkWarnings(record) {
  const warnings = record.console.messages.filter(
    (message) => message.type === 'warning' && SANITIZER_WARNING.test(message.text),
  );
  const strippedWrites = record.fixture.bindings
    .flatMap((binding) => binding.writes)
    .filter((write) => write.stripped);
  if (strippedWrites.length === 0) {
    fail(
      `the recording holds no stripped write — no [innerHTML] write lost content — and ${warnings.length} sanitizer ` +
        'warning(s): a capture of this fixture with neither is not a recording of the warning',
    );
  }
  if (warnings.length === 0) {
    fail(
      `the recording holds no sanitizer warning, though its own fixture block records ${strippedWrites.length} ` +
        'stripped write(s): a capture with no warning is not a recording of the warning',
    );
  }
  if (warnings.length !== strippedWrites.length) {
    fail(
      `the recording holds ${warnings.length} sanitizer warning(s) for ${strippedWrites.length} stripped write(s): ` +
        'the warning fires once per sanitize call that strips, so the counts must agree',
    );
  }
  for (const message of record.console.messages) {
    if (message.type !== 'warning') continue;
    if (!SANITIZER_WARNING.test(message.text)) fail(`a warning was recorded that is not the sanitizer's: ${message.text}`);
  }
  for (const message of warnings) {
    if (message.code !== null) fail(`the sanitizer warning carries a code (${message.code}); it carries none`);
    if (/NG0\d{3,}/.test(message.text)) fail('the sanitizer warning text carries an NG code');
    for (const name of ['innerHTML', 'data-bound', 'TrustBypass', '#unsafe', '#safe', 'unsafe', 'kept paragraph']) {
      if (message.text.includes(name)) fail(`the sanitizer warning names ${name}; it names nothing`);
    }
  }
  return warnings;
}

function checkContains(record) {
  if (!isObject(record.contains)) fail('missing the summary of what each list holds');
  const contains = record.contains;
  const warningMessages = record.console.messages.filter(
    (message) => message.type === 'warning' && SANITIZER_WARNING.test(message.text),
  );

  const expected = {
    console: {
      messages: record.console.count,
      warnings: record.console.messages.filter((message) => message.type === 'warning').length,
      sanitizerWarnings: warningMessages.length,
      messagesCarryingAnNgCode: record.console.messages.filter((message) => message.code !== null).length,
      distinctSanitizerWarningTexts: [...new Set(warningMessages.map((message) => message.text))],
    },
    pageTap: {
      messages: record.pageTap.count,
      warnings: record.pageTap.messages.filter((message) => message.type === 'warn').length,
    },
    profiler: {
      records: record.profiler.count,
      recordsCarryingTemplateUpdateEvents: record.profiler.records.filter((profilerRecord) =>
        profilerRecord.checks.some((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))),
      ).length,
      checksCarryingTemplateUpdateEvents: record.profiler.records.reduce(
        (total, profilerRecord) =>
          total +
          profilerRecord.checks.filter((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))).length,
        0,
      ),
      eventNumbers: [
        ...new Set(record.profiler.records.flatMap((profilerRecord) => profilerRecord.checks.flatMap((check) => check.events))),
      ].sort((a, b) => a - b),
      checkFields: [
        ...new Set(record.profiler.records.flatMap((profilerRecord) => profilerRecord.checks.flatMap((check) => Object.keys(check)))),
      ],
      namesTheBinding: record.profiler.records.some((profilerRecord) => JSON.stringify(profilerRecord.checks).includes('innerHTML')),
      identifiesTheWrittenElement: record.profiler.records.some((profilerRecord) => /unsafe|#safe/.test(JSON.stringify(profilerRecord.checks))),
      syntheticRecords: record.profiler.records.filter((profilerRecord) =>
        profilerRecord.checks.every((check) => check.events.length === 0),
      ).length,
    },
    ordering: {
      occurrences: record.ordering.occurrences.length,
      occurrencesWithACoveringRecord: record.ordering.occurrences.filter((occurrence) => occurrence.coveringRecord !== null).length,
      occurrencesWithoutACoveringRecord: record.ordering.occurrences.filter((occurrence) => occurrence.coveringRecord === null).length,
      firstWritePrecededTheSubscription:
        record.ordering.occurrences.length > 0 &&
        record.ordering.occurrences[0].warningTapTime < record.profiler.installedAt,
      sharesPosition: record.ordering.occurrences.some((occurrence) => occurrence.sharesPositionWithBindingEvent),
    },
  };

  for (const [section, values] of Object.entries(expected)) {
    if (!isObject(contains[section])) fail(`the summary of what each list holds has no ${section} section`);
    for (const [key, value] of Object.entries(values)) {
      const stated = contains[section][key];
      if (JSON.stringify(stated) !== JSON.stringify(value)) {
        fail(
          `the recording's ${section}.${key} states ${JSON.stringify(stated)} but its own lists give ${JSON.stringify(value)}`,
        );
      }
    }
  }
}

function sequenceIndex(sequence, source, ref) {
  return sequence.findIndex((entry) => entry.source === source && entry.ref === ref);
}

function checkOrdering(record) {
  if (!isObject(record.ordering)) fail('missing the ordering block');
  const { sequence, occurrences } = record.ordering;
  if (!Array.isArray(sequence) || !Array.isArray(occurrences)) fail('missing the ordering sequence or occurrences');
  if (typeof record.ordering.definition !== 'string' || record.ordering.definition === '') fail('the shared-position definition is missing');

  sequence.forEach((entry, index) => {
    if (entry.order !== index) fail(`sequence entry ${index} carries order ${entry.order}`);
    if (index > 0 && entry.t < sequence[index - 1].t) fail(`the sequence clock goes backwards at entry ${index}`);
    if (entry.source === 'console') {
      const message = record.pageTap.messages[entry.ref];
      if (!message) fail(`sequence entry ${index} points past the console list`);
      if (message.t !== entry.t) fail(`sequence entry ${index} disagrees with the console tap's clock`);
      if (entry.name !== `console:${message.type}`) fail(`sequence entry ${index} mislabels a console message`);
    } else if (entry.source === 'profiler') {
      const profilerRecord = record.profiler.records[entry.ref];
      if (!profilerRecord) fail(`sequence entry ${index} points past the profiler list`);
      if (profilerRecord.t !== entry.t) fail(`sequence entry ${index} disagrees with the profiler record's clock`);
      if (entry.name !== `record:cycle-${profilerRecord.cycleId}`) fail(`sequence entry ${index} mislabels a profiler record`);
    } else {
      fail(`sequence entry ${index} has an unknown source: ${entry.source}`);
    }
  });

  const consoleRefs = sequence.filter((entry) => entry.source === 'console').map((entry) => entry.ref);
  if (consoleRefs.join(',') !== record.pageTap.messages.map((_, index) => index).join(',')) {
    fail('the sequence does not carry every console message once, in the console list’s order');
  }
  const profilerRefs = sequence.filter((entry) => entry.source === 'profiler').map((entry) => entry.ref);
  if (profilerRefs.join(',') !== record.profiler.records.map((_, index) => index).join(',')) {
    fail('the sequence does not carry every profiler record once, in the profiler list’s order');
  }

  if (!isObject(record.profiler) || !Array.isArray(record.profiler.records)) fail('missing the profiler list');
  if (record.profiler.count !== record.profiler.records.length) fail('profiler.count disagrees with the profiler list');
  if (typeof record.profiler.installedAt !== 'number') fail('the profiler list does not record when the agent’s subscription came up');
  record.profiler.records.forEach((profilerRecord, index) => {
    if (profilerRecord.order !== index) fail(`profiler record ${index} carries order ${profilerRecord.order}`);
    if (typeof profilerRecord.cycleId !== 'number') fail(`profiler record ${index} carries no cycleId`);
    if (typeof profilerRecord.startedAt !== 'number') fail(`profiler record ${index} carries no startedAt`);
    if (!Array.isArray(profilerRecord.checks)) fail(`profiler record ${index} carries no checks`);
    for (const check of profilerRecord.checks) {
      if (!Array.isArray(check.events)) fail(`a check in profiler record ${index} carries no event list`);
      for (const event of check.events) {
        if (!PROFILER_EVENTS.has(event)) fail(`profiler record ${index} carries event ${event}, outside the profiler's own enum`);
      }
    }
  });

  const warnings = record.console.messages.filter(
    (message) => message.type === 'warning' && SANITIZER_WARNING.test(message.text),
  );
  if (occurrences.length !== warnings.length) {
    fail(`the recording states ${occurrences.length} warning occurrence(s) for ${warnings.length} warning(s)`);
  }

  for (const occurrence of occurrences) {
    const tapMessage = record.pageTap.messages[occurrence.warningTap];
    if (!tapMessage) fail(`${occurrence.id}: points past the console tap list`);
    if (!SANITIZER_WARNING.test(tapMessage.text)) fail(`${occurrence.id}: does not point at the sanitizer warning`);
    if (tapMessage.t !== occurrence.warningTapTime) fail(`${occurrence.id}: warningTapTime disagrees with the page tap's clock`);
    const browserMessage = record.console.messages[occurrence.warningConsole];
    if (!browserMessage || browserMessage.text !== tapMessage.text) {
      fail(`${occurrence.id}: the console list and the page tap disagree about which message the occurrence is`);
    }

    const covering = record.profiler.records.findIndex(
      (profilerRecord) =>
        profilerRecord.startedAt <= tapMessage.t &&
        tapMessage.t <= profilerRecord.t &&
        profilerRecord.checks.some((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))),
    );
    const claimed = occurrence.coveringRecord;
    if (covering === -1) {
      if (claimed !== null) fail(`${occurrence.id}: the recording claims covering record ${claimed}, but no record’s window covers the warning`);
      if (occurrence.insideTemplateUpdateWindow) fail(`${occurrence.id}: claims to be inside a template-update window with no covering record`);
      if (occurrence.positionsBetween !== null) fail(`${occurrence.id}: claims a distance to a record that does not cover it`);
      if (occurrence.sharesPositionWithBindingEvent) fail(`${occurrence.id}: claims a shared position with no covering record`);
    } else {
      if (claimed !== covering) {
        fail(`${occurrence.id}: the recording claims covering record ${claimed}, but record ${covering} is the one whose window covers it`);
      }
      const warningAt = sequenceIndex(sequence, 'console', occurrence.warningTap);
      const recordAt = sequenceIndex(sequence, 'profiler', covering);
      const between = recordAt - warningAt - 1;
      if (between < 0) fail(`${occurrence.id}: the record is dispatched before the warning that its window covers`);
      if (occurrence.positionsBetween !== between) {
        fail(`${occurrence.id}: the recording states ${occurrence.positionsBetween} message(s) between the warning and the record; ${between} were observed`);
      }
      if (occurrence.insideTemplateUpdateWindow !== true) fail(`${occurrence.id}: a covering record exists but the occurrence is not marked inside its window`);
      if (occurrence.sharesPositionWithBindingEvent !== (between === 0)) {
        fail(`${occurrence.id}: sharesPositionWithBindingEvent disagrees with the observed distance (${between})`);
      }
    }
    if (typeof occurrence.reading !== 'string' || occurrence.reading === '') fail(`${occurrence.id}: carries no reading`);
  }

  const claimedShares = occurrences.filter((occurrence) => occurrence.sharesPositionWithBindingEvent).map((occurrence) => occurrence.id);
  if (!isObject(record.ordering.sharesPosition)) fail('missing the sharesPosition summary');
  if (record.ordering.sharesPosition.any !== claimedShares.length > 0) fail('sharesPosition.any disagrees with the occurrences');
  if (record.ordering.sharesPosition.occurrences.join(',') !== claimedShares.join(',')) {
    fail('sharesPosition.occurrences disagrees with the occurrences');
  }
}

function validate(record) {
  checkProvenance(record);
  checkConsoleLists(record);
  checkFixture(record);
  checkWarnings(record);
  checkOrdering(record);
  checkContains(record);
  return true;
}

function loadRecord(path = RECORD_PATH) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function clone(record) {
  return JSON.parse(JSON.stringify(record));
}

// ---------------------------------------------------------------- tests ----------------

test(
  'capture the fixture in one headless page load',
  { skip: process.env.M029_CAPTURE === '1' ? false : 'set M029_CAPTURE=1 to re-capture (starts the dev server and a headless Chromium)' },
  async () => {
    const record = await runCapture();
    // Written before it is checked, so a capture the checks refuse is still on disk to be read and
    // reported rather than quietly dropped.
    writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);
    validate(record);
  },
);

test('the recording validates against its own fixture and clocks', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => validate(record));
});

test('the recording holds the console list and the profiler list from one page load', () => {
  const record = loadRecord();
  assert.ok(record.console.count > 0, 'the console list is empty');
  assert.equal(record.fixture.pageLoads, 1);
  assert.equal(record.fixture.documentLoads, 1);
  assert.equal(record.console.mainWorldContexts, 1);
  assert.ok(Array.isArray(record.profiler.records));
  assert.equal(record.profiler.count, record.profiler.records.length);
  assert.ok(typeof record.profiler.installedAt === 'number');
});

test('the strip warning is recorded once per stripped write and the safe binding produced none', () => {
  const record = loadRecord();
  const warnings = checkWarnings(record);
  const stripped = record.fixture.bindings[0].writes.length;
  assert.equal(warnings.length, stripped);
  assert.ok(record.fixture.bindings[1].writes.every((write) => write.stripped === false));
  assert.ok(record.console.messages.some((message) => SANITIZER_WARNING.test(message.text)));
});

test('the two console channels agree, so no message in the recording is hand-written', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => checkConsoleLists(record));
});

test('provenance names the build, the URL, the time and the commands', () => {
  const record = loadRecord();
  assert.match(record.url, /\/trust-bypass$/);
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/);
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.match(record.commands.capture, /M029_CAPTURE=1/);
  assert.match(record.commands.serve, /ng\.js serve/);
});

test('app.routes.ts registers the fixture page', () => {
  const source = readFileSync(join(APP, 'src', 'app', 'app.routes.ts'), 'utf8');
  assert.match(source, /TrustBypassPage/);
  assert.match(source, /path:\s*'trust-bypass'/);
  assert.ok(existsSync(join(APP, 'src', 'app', 'trust-bypass-page.ts')));
});

test('the ordering claims are recomputed from the two lists and match', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => checkOrdering(record));
  assert.ok(record.ordering.sequence.length >= record.pageTap.count);
});

test('the recording states what each list holds, and those counts are the lists’ own', () => {
  const record = loadRecord();
  assert.doesNotThrow(() => checkContains(record));
  assert.equal(record.contains.console.sanitizerWarnings, 2);
  assert.equal(record.contains.profiler.records, record.profiler.count);
});

test('held-out: a hand-edited summary of the profiler list reddens', () => {
  const mutant = clone(loadRecord());
  mutant.contains.profiler.namesTheBinding = true;
  assert.throws(() => validate(mutant), /namesTheBinding states true/);
});

test('held-out E3: a recording with no warning in it reddens', () => {
  // What a capture of a page that logged nothing looks like: the same lists with the warning gone,
  // renumbered, the occurrences it backed withdrawn. The fixture block still records the two writes
  // whose content the sanitizer removed, so the recording now contradicts itself.
  const base = loadRecord();
  const mutant = clone(base);
  const isWarning = (message) => SANITIZER_WARNING.test(message.text);

  const renumbered = new Map();
  mutant.pageTap.messages = base.pageTap.messages
    .filter((message) => !isWarning(message))
    .map((message, index) => {
      renumbered.set(base.pageTap.messages.indexOf(message), index);
      return { ...message, order: index };
    });
  mutant.pageTap.count = mutant.pageTap.messages.length;
  mutant.console.messages = base.console.messages
    .filter((message) => !isWarning(message))
    .map((message, index) => ({ ...message, order: index }));
  mutant.console.count = mutant.console.messages.length;
  mutant.ordering.sequence = base.ordering.sequence
    .filter((entry) => entry.source !== 'console' || renumbered.has(entry.ref))
    .map((entry, index) => ({
      ...entry,
      order: index,
      ref: entry.source === 'console' ? renumbered.get(entry.ref) : entry.ref,
    }));
  mutant.ordering.occurrences = [];
  mutant.ordering.sharesPosition = { any: false, occurrences: [] };

  assert.ok(base.console.messages.some(isWarning), 'the recording holds no sanitizer warning to remove');
  assert.throws(() => validate(mutant), /no sanitizer warning|no stripped write/i);
});

test('held-out: a warning injected by hand into the recording reddens', () => {
  const mutant = clone(loadRecord());
  mutant.console.messages.push({
    order: mutant.console.messages.length,
    type: 'warning',
    code: null,
    timestamp: mutant.console.messages.at(-1).timestamp + 1,
    text: 'WARNING: sanitizing HTML stripped some content, see https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss',
  });
  mutant.console.count = mutant.console.messages.length;
  assert.throws(() => validate(mutant), /page's own tap|not emitted by the page/i);
});

test('held-out: a warning naming the stripped element reddens', () => {
  const mutant = clone(loadRecord());
  const warning = mutant.console.messages.find((message) => SANITIZER_WARNING.test(message.text));
  const tap = mutant.pageTap.messages[warning.order];
  warning.text += ' (stripped <script> in [innerHTML] of #unsafe)';
  tap.text = warning.text;
  assert.throws(() => validate(mutant), /names/);
});
