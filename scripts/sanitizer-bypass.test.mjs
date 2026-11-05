// @ts-check
//
// M029 T004 — the vetted bypass, proved as an absence: one page load of the three-binding fixture
// (`spikes/ng222-app/src/app/trust-bypass-page.ts`) in which the stripped `[innerHTML]` binding warns
// and the `bypassSecurityTrustHtml` binding — carrying the **same value** — does not.
//
//   node --test scripts/sanitizer-bypass.test.mjs
//
// The capture starts the fixture's dev server and a headless Chromium itself, so this suite needs
// `npm --prefix spikes/ng222-app ci --include=dev` and the Playwright browsers once. It runs one page
// load and measures, in that load, every binding's value and rendered markup, the browser's own console
// list (CDP `Runtime.consoleAPICalled`) and the page's own console tap, and the profiler records the
// page agent dispatches. Nothing in the console list is written by hand: the two channels are compared
// message for message, and the checks refuse a capture whose lists disagree.
//
// The recording lives in the run rather than in a committed JSON file — T004's contract declares three
// paths and none of them is under `research/raw/`. Set `M029_BYPASS_RECORD=<path>` to also write the
// capture there, byte for byte as the checks read it.
//
// The pair is what makes the word "deliberate" a measurement. A bypassed binding cannot warn — a
// `SafeValue` short-circuits `ɵɵsanitizeHtml`, so no sanitize call happens — and an absent warning on
// its own is the same absence a production build, a page with nothing to strip and a capture that
// missed the write all leave behind (N3). So the module is handed the page's own declarations beside
// the warnings, and reports `deliberate` only where the absence sits next to a presence: the same
// value, whole in the bypassed binding and stripped in a sanitized one, with a warning captured for the
// load.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const MODULE_PATH = join(ROOT, 'extension', 'sanitizer-triage.js');
const SRC = readFileSync(MODULE_PATH, 'utf8');

const ROUTE_PATH = '/trust-bypass';
async function choosePort() {
  if (process.env.M029_BYPASS_PORT) return Number(process.env.M029_BYPASS_PORT);
  const srv = createServer();
  await new Promise((resolve, reject) => {
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', resolve);
  });
  const port = srv.address().port;
  await new Promise((resolve) => srv.close(resolve));
  return port;
}
const PORT = await choosePort();
const ORIGIN = `http://127.0.0.1:${PORT}`;
const PAGE_URL = `${ORIGIN}${ROUTE_PATH}`;
const RECORD_PATH = process.env.M029_BYPASS_RECORD ?? null;

/** The sanitizer's one signal, matched exactly as T001's capture matched it. */
const SANITIZER_WARNING = /WARNING: sanitizing HTML stripped some content/;
const TEMPLATE_UPDATE_EVENTS = [2, 3]; // TemplateUpdateStart, TemplateUpdateEnd
const TAP_TYPE_TO_CDP = { warn: 'warning', log: 'log', debug: 'debug', info: 'info', error: 'error' };

/** The `bypassSecurityTrust*` family the module reports as a vetted bypass. */
const VETTED_BYPASS = /^bypassSecurityTrust[A-Za-z]+$/;

const CAPTURE_COMMAND = 'node --test scripts/sanitizer-bypass.test.mjs';
const RECORD_COMMAND = 'set M029_BYPASS_RECORD=<path>&& node --test scripts/sanitizer-bypass.test.mjs';
const MUTANT_COMMAND = 'set M029_BYPASS_MUTANT=<name>&& node --test scripts/sanitizer-bypass.test.mjs';
const SERVE_COMMAND = `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${PORT} --host 127.0.0.1  (cwd spikes/ng222-app)`;

// ---------------------------------------------------------------- capture ----------------

// The in-page tap: one clock for the console messages and the page agent's records, so the interleaved
// order is measured and not inferred. It also records when the agent's profiler subscription came up,
// which is what makes the first render's strip unattributable.
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

/**
 * The harness a caller can be sure of: the dev server is this suite's own child and is stopped in the
 * same `finally` that closes the browser, so the port is free whether the capture succeeds or throws.
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
    readFileSync(join(APP, 'node_modules', '@angular', 'core', 'package.json'), 'utf8'),
  ).version;
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
  server.stdout.on('data', (chunk) => {
    serverOutput = (serverOutput + chunk).slice(-4000);
  });
  server.stderr.on('data', (chunk) => {
    serverOutput = (serverOutput + chunk).slice(-4000);
  });

  let browser;
  try {
    await waitForServer(server, () => serverOutput);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    browser = await chromium.launch({ headless: true });
    const browserBuild = browser.version();
    const context = await browser.newContext();
    const page = await context.newPage();

    // One `load` per document: a reload would add a second, and two documents are not one capture.
    const documentLoads = [];
    page.on('load', () => documentLoads.push(page.url()));

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
    // The fixtures' hosts are read off the page — the binding list is measured, not transcribed — and
    // the first render is the moment every host carries a value.
    await page.waitForFunction(
      () => document.querySelectorAll('[data-bound]').length === 3,
      null,
      { timeout: 60000 },
    );
    const hostIds = await page.evaluate(() =>
      [...document.querySelectorAll('[data-bound]')].map((element) => element.id),
    );
    await page.waitForFunction(
      (ids) => ids.every((id) => (document.getElementById(id)?.getAttribute('data-bound') ?? '') !== ''),
      hostIds,
      { timeout: 60000 },
    );
    const first = await readFixtureDom(page, hostIds);
    // The page agent installs its profiler subscription from a poll that lands after this page's first
    // render; wait for it so the second write is measured with the subscription in place.
    await page.waitForFunction(() => !!(window.__ngRecorder && window.__ngRecorder.installed), null, { timeout: 60000 });
    await page.waitForTimeout(900);
    await page.click('#rewrite');
    // The second write is the moment every host's value differs from the one just read.
    await page.waitForFunction(
      (previous) => previous.every((entry) => (document.getElementById(entry.id)?.getAttribute('data-bound') ?? '') !== entry.value),
      first.map((entry) => ({ id: entry.id, value: entry.value })),
      { timeout: 60000 },
    );
    await page.waitForTimeout(600);
    const second = await readFixtureDom(page, hostIds);
    const sentinels = await page.evaluate(() => ({
      // Both bindings carry the same value, whose script sets this flag. A `<script>` inserted through
      // `innerHTML` is inert by specification, so the flag stays false however the markup arrived: the
      // markup is in the DOM without the page having run it.
      scriptRan: window.__m029ScriptRan === true,
    }));

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
      cdpConsole,
      tapDump,
      hostIds,
      first,
      second,
      sentinels,
    });
  } finally {
    if (browser) await browser.close().catch(() => {});
    await stopServer(server);
  }
}

async function readFixtureDom(page, hostIds) {
  return page.evaluate((ids) => {
    const read = (id) => {
      const element = document.getElementById(id);
      if (!element) return null;
      return {
        value: element.getAttribute('data-bound'),
        rendered: element.innerHTML,
        // The page's own declaration of the sanitizer call the binding passes its value through.
        bypass: element.getAttribute('data-bypass'),
      };
    };
    return ids.map((id) => ({ id, ...read(id) }));
  }, hostIds);
}

async function waitForServer(server, output) {
  const started = Date.now();
  let exit = null;
  server.on('exit', (code, signal) => {
    exit = { code, signal };
  });
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

async function killProcessTree(pid) {
  if (process.platform === 'win32') {
    const killer = spawn('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' });
    await new Promise((resolve) => killer.on('exit', resolve).on('error', resolve));
  } else {
    try { process.kill(-pid, 'SIGTERM'); } catch { try { process.kill(pid, 'SIGTERM'); } catch {} }
  }
}

async function waitForPortFree(port, timeout = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const free = await new Promise((resolve) => {
      const srv = createServer();
      srv.once('error', () => resolve(false));
      srv.listen(port, '127.0.0.1', () => { srv.close(() => resolve(true)); });
    });
    if (free) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`port ${port} not free after ${timeout}ms`);
}

async function stopServer(server) {
  if (server.exitCode === null && server.signalCode === null) {
    try { await killProcessTree(server.pid); } catch {}
    server.kill();
    const timer = setTimeout(() => {
      try {
        server.kill('SIGKILL');
      } catch {
        /* gone */
      }
    }, 5000);
    timer.unref?.();
    try {
      await once(server, 'exit');
    } catch {
      /* already gone */
    }
    clearTimeout(timer);
  }
  await waitForPortFree(PORT);
}

/**
 * One write as the page measured it: the value the binding carried, the markup that reached the element,
 * and whether the sanitizer left the value whole. `lostContent` is measured, never inferred from a tag
 * name — a write that lost content is one whose rendered markup is not its value.
 */
function writeOf(entry, version) {
  const value = entry?.value ?? null;
  const rendered = entry?.rendered ?? null;
  return {
    version,
    value,
    rendered,
    keptWhole: value !== null && rendered !== null && rendered === value,
    lostContent: value !== null && rendered !== null && rendered !== value,
    scriptInValue: value !== null && /<script/i.test(value),
    scriptInRendered: rendered !== null && /<script/i.test(rendered),
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

  const snapshots = [
    { when: 'initial render', entries: input.first, version: 1 },
    { when: 'the page’s own rewrite button', entries: input.second, version: 2 },
  ];

  const bypassOf = (id) => input.first.find((entry) => entry.id === id)?.bypass ?? null;

  const bindings = input.hostIds.map((id) => ({
    id,
    // Read off the host's `data-bypass`, so the declaration is the page's and not the harness's.
    bypass: bypassOf(id),
    writes: snapshots.map((snapshot) => ({
      ...writeOf(snapshot.entries.find((entry) => entry.id === id) ?? null, snapshot.version),
      when: snapshot.when,
    })),
  }));

  const warningMessages = consoleMessages.filter(
    (message) => message.type === 'warning' && SANITIZER_WARNING.test(message.text),
  );
  const allWrites = bindings.flatMap((binding) =>
    binding.writes.map((write) => ({ binding: binding.id, bypass: binding.bypass, ...write })),
  );
  const lostWrites = allWrites.filter((write) => write.lostContent);
  const wholeWrites = allWrites.filter((write) => write.keptWhole);

  // The contrast, measured: a write that lost content and a bypassed write of the very same value.
  const strippedWrite = lostWrites[0] ?? null;
  const bypassBinding = bindings.find((binding) => VETTED_BYPASS.test(String(binding.bypass ?? ''))) ?? null;
  const bypassWrite = bypassBinding ? (bypassBinding.writes.find((write) => write.keptWhole) ?? null) : null;
  const sameValue = strippedWrite !== null && bypassWrite !== null && strippedWrite.value === bypassWrite.value;

  const pair = {
    reading:
      'one page load; each binding wrote twice (the initial render and the page’s own rewrite) and the browser’s ' +
      'console list holds one sanitizer warning per write that lost content, and none for the writes that kept their value whole',
    pageLoads: 1,
    documentLoads: input.documentLoads.length,
    sanitizerWarnings: warningMessages.length,
    warningsInThePageTap: tapMessages.filter(
      (message) => message.type === 'warn' && SANITIZER_WARNING.test(message.text),
    ).length,
    writes: allWrites.length,
    writesThatLostContent: lostWrites.length,
    writesThatKeptTheirValueWhole: wholeWrites.length,
    lostWrites: lostWrites.map((write) => `${write.binding}@${write.version}`),
    wholeWrites: wholeWrites.map((write) => `${write.binding}@${write.version}`),
    everyWarningIsAccountedForByALostWrite: warningMessages.length === lostWrites.length,
    bypassBindings: bindings.filter((binding) => VETTED_BYPASS.test(String(binding.bypass ?? ''))).length,
    bypassedKeptItsValueWhole: bypassWrite !== null,
    bypassedValueIsTheValueAStrippedWriteLost: sameValue,
    sameValue: {
      stripped: strippedWrite ? `${strippedWrite.binding}@${strippedWrite.version}` : null,
      bypassed: bypassBinding !== null && bypassWrite !== null ? `${bypassBinding.id}@${bypassWrite.version}` : null,
      identical: sameValue,
    },
    scriptRan: input.sentinels.scriptRan,
  };

  return {
    probe:
      'M029 T004 — one page load of the three-binding sanitizer fixture: the stripped binding’s warning and the ' +
      'bypassed binding’s silence, measured in the same capture',
    milestone: 'M029',
    task: 'T004',
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
      check: CAPTURE_COMMAND,
      record: RECORD_COMMAND,
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
      loads: input.documentLoads,
      hosts: input.hostIds,
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
        'their ProfilerEvent numbers, the signal graph dropped',
      installedAt: input.tapDump.installedAt,
      count: records.length,
      records,
    },
    pair,
    order: {
      clock: 'performance.now() of the measured document; the console tap and the record listener run in that document',
      sequence,
    },
  };
}

/**
 * The one capture this suite measures. Every case below reads it, so the whole file describes one page
 * load — the same load for the warning, for the silence and for the module's answer.
 */
let capturePromise = null;
function captured() {
  capturePromise ??= runCapture();
  return capturePromise;
}

// ---------------------------------------------------------------- module ----------------

/**
 * The mutants, as one textual change each to a copy of the module. `M029_BYPASS_MUTANT` names one for
 * the whole run — that is how the suite is shown reddening — and the cases below apply them in memory
 * as well, so each mutation is pin-pointed by the assertion it breaks. The module on disk is never
 * written.
 */
const MUTANTS = {
  'bypass-as-stripped': [
    '      state: DELIBERATE,\n      binding: bypass,',
    '      state: STRIPPED,\n      binding: bypass,',
  ],
  'no-warning-as-clean': [
    '  return { state: NONE, findings: [] };',
    '  return { state: NONE, findings: [], clean: true };',
  ],
  'deliberate-without-a-bypass': ['    return VETTED_BYPASS.test(named) ? named : null;', '    return named;'],
};

function mutatedSource(name) {
  const mutation = MUTANTS[name];
  if (!mutation) throw new Error(`unknown mutant: ${name}; known: ${Object.keys(MUTANTS).join(', ')}`);
  const source = SRC.replace(mutation[0], mutation[1]);
  assert.notEqual(source, SRC, `the mutation must change the module: ${JSON.stringify(mutation[0])}`);
  return source;
}

/** The module this run reads: the file, unless the run was started to show a mutant reddening. */
const RUN_MUTANT = process.env.M029_BYPASS_MUTANT ?? null;
const MODULE_SOURCE = RUN_MUTANT === null ? SRC : mutatedSource(RUN_MUTANT);

/**
 * The module in a bare `node:vm` context: nothing in the world but the source, so a module that reached
 * for a document, a window, a clock or an import would throw rather than pass (N1).
 */
function loadBare(source = MODULE_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiSanitizerTriage;
  assert.ok(api, 'the module must publish its namespace on the global object of whatever world it runs in');
  return { api, context };
}

/** A mutant, applied to a copy of the module on disk. */
function mutant(name) {
  return loadBare(mutatedSource(name)).api;
}

/** A value built inside the vm context carries that context's prototypes; this copies it into this realm. */
function host(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The failure a pin raises on a mutant; a failing assertion when the mutant slips past it. */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(failure instanceof Error, `${what} passed on the mutant, so the mutation is not caught`);
  return failure;
}

/** The warnings the capture recorded, on the page clock — the clock the profiler records use. */
function warningsOf(record) {
  return record.pageTap.messages
    .filter((message) => message.type === 'warn' && SANITIZER_WARNING.test(message.text))
    .map((message) => ({ t: message.t, type: message.type }));
}

/** The page's own binding declarations, in the shape the module reads. */
function bindingsOf(record) {
  return record.fixture.bindings.map((binding) => ({
    id: binding.id,
    bypass: binding.bypass,
    writes: binding.writes.map((write) => ({
      version: write.version,
      value: write.value,
      rendered: write.rendered,
    })),
  }));
}

/** The record whose template-update window covers `t`, or null — the window predicate the module uses. */
function coveringRecordOf(record, t) {
  return (
    record.profiler.records.find(
      (candidate) =>
        typeof candidate.startedAt === 'number' &&
        candidate.startedAt <= t &&
        t <= candidate.t &&
        candidate.checks.some((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event))),
    ) ?? null
  );
}

// ---------------------------------------------------------------- pins ----------------

/**
 * The deliberate finding's pin, written once so every case and every mutant is run through the very
 * assertion the state has to satisfy. A deliberate finding states the bypass the binding declares, the
 * write whose value it kept beside the write that lost it, and the load's warning count — and nothing
 * else: no component, no cycle, no time, no markup, no cause.
 */
function assertDeliberate(finding, expected) {
  assert.equal(
    finding.state,
    'deliberate',
    'a binding that declares a vetted bypass and kept its value whole, beside a write that lost the same value, is `deliberate`',
  );
  assert.equal(
    finding.binding,
    expected.binding,
    'the finding must name the `bypassSecurityTrust*` call the binding declares',
  );
  assert.match(
    finding.binding,
    VETTED_BYPASS,
    'a deliberate finding can only name a `bypassSecurityTrust*` binding',
  );
  assert.deepEqual(
    finding.contrast,
    expected.contrast,
    'the finding must carry the contrast it was measured on: the losing write, both versions, and the warning count',
  );
  assert.deepEqual(
    Object.keys(finding).sort(),
    ['binding', 'contrast', 'state'],
    'the deliberate finding states the bypass and its contrast, and nothing else',
  );
  assert.deepEqual(
    Object.keys(finding.contrast).sort(),
    ['binding', 'bypassWriteVersion', 'warnings', 'writeVersion'],
    'the contrast names the pair it was measured on and no other claim',
  );
  const text = JSON.stringify(finding).toLowerCase();
  for (const word of ['script', 'innerhtml', 'onerror', '<', '>', 'tag', 'attribute', 'removed', 'cause', 'because']) {
    assert.ok(
      !text.includes(word),
      `the deliberate finding must not say "${word}": it copies neither the markup nor a cause — ${text}`,
    );
  }
  for (const key of ['components', 'cycleIds', 'at', 'reason']) {
    assert.equal(
      key in finding,
      false,
      `the deliberate finding must carry no \`${key}\`: nothing was observed for this binding, so nothing of the kind can be named`,
    );
  }
}

/**
 * N3's pin, for the page that produced no warning at all: the module's answer is `none`, carries no
 * finding, and never reads as clean, safe, ok or as a deliberate bypass.
 */
function assertAbsenceIsNeither(result) {
  assert.equal(result.state, 'none', 'a load with no warning is the `none` state and no other');
  assert.deepEqual(result.findings, [], 'the `none` state carries no finding, deliberate or otherwise');
  const text = JSON.stringify(host(result)).toLowerCase();
  for (const word of ['clean', 'safe', 'ok', 'fine', 'nothing', 'passed', 'unaffected']) {
    assert.ok(
      !text.includes(word),
      `the absence must not be reported as "${word}": a warning that did not appear is not a measurement of the page (N3)`,
    );
  }
  assert.notEqual(result.state, 'deliberate', 'a page with no warning is not a deliberate bypass (N3)');
  assert.notEqual(result.state, 'stripped', 'no warning must never be reported as a strip');
  assert.notEqual(result.state, 'cannot-tell', 'no warning at all is a different absence than no record');
  assert.deepEqual(Object.keys(result).sort(), ['findings', 'state'], 'the absence states the state and the findings');
}

// ---------------------------------------------------------------- the capture ----------------

test('the capture is one page load of the three-binding fixture, and its two console channels agree', async (t) => {
  const record = await captured();
  if (RECORD_PATH !== null) writeFileSync(RECORD_PATH, `${JSON.stringify(record, null, 2)}\n`);

  assert.equal(record.fixture.pageLoads, 1, 'the recording must describe one page load');
  assert.equal(record.fixture.documentLoads, 1, `one document, not ${record.fixture.documentLoads}: ${JSON.stringify(record.fixture.loads)}`);
  assert.equal(record.console.mainWorldContexts, 1, 'a page that reloaded mid-capture is not one page load');

  // Three hosts, read off the page: one stripped, one safe, one bypassed. Nothing here is a hand-written
  // list — the ids are the DOM's and the bypass names are the hosts' own `data-bypass` attributes.
  assert.equal(record.fixture.hosts.length, 3, `the fixture must have three bindings: ${JSON.stringify(record.fixture.hosts)}`);
  const bypassed = record.fixture.bindings.filter((binding) => VETTED_BYPASS.test(String(binding.bypass ?? '')));
  assert.equal(bypassed.length, 1, 'exactly one binding must declare a `bypassSecurityTrust*` call');
  assert.equal(
    record.fixture.bindings.filter((binding) => binding.bypass === null).length,
    2,
    'the other two bindings must declare no bypass, or they are not the sanitized ones',
  );

  // Two independent channels for the same console: a message in one and not the other was not emitted by
  // the page, so no message in this recording is hand-written.
  const browserMessages = record.console.messages;
  const tapMessages = record.pageTap.messages;
  assert.equal(record.console.count, browserMessages.length);
  assert.equal(record.pageTap.count, tapMessages.length);
  assert.equal(
    browserMessages.length,
    tapMessages.length,
    `the browser's list holds ${browserMessages.length} messages and the page's tap ${tapMessages.length}`,
  );
  for (const [index, tap] of tapMessages.entries()) {
    const browser = browserMessages[index];
    assert.equal(TAP_TYPE_TO_CDP[tap.type], browser.type, `message ${index} differs in type between the two channels`);
    assert.equal(tap.text, browser.text, `message ${index} differs between the two channels`);
  }
  for (const message of browserMessages) {
    if (message.type !== 'warning') continue;
    assert.match(message.text, SANITIZER_WARNING, `a warning was recorded that is not the sanitizer's: ${message.text}`);
    for (const name of ['innerHTML', 'data-bound', 'data-bypass', 'TrustBypass', ...record.fixture.hosts]) {
      assert.ok(!message.text.includes(name), `the sanitizer warning names ${name}; it names nothing`);
    }
  }
  t.diagnostic(
    `capture: ${record.console.count} console messages, ${record.profiler.count} profiler records, one document, ` +
      `${record.pair.sanitizerWarnings} sanitizer warning(s), hosts [${record.fixture.hosts.join(', ')}]`,
  );
});

test('provenance names the build, the URL, the time and the exact commands', async () => {
  const record = await captured();
  assert.match(record.browserBuild, /^\d+\.\d+\.\d+\.\d+$/, `browserBuild is not a Chromium build: ${record.browserBuild}`);
  assert.ok(record.browser.includes(record.browserBuild), 'browser must name the build in browserBuild');
  assert.equal(record.instance, 'headless');
  assert.match(record.url, /^http:\/\/127\.0\.0\.1:\d+\/trust-bypass$/, `url is not the fixture route: ${record.url}`);
  assert.equal(record.url, record.pageUrl);
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'capturedAt must be an ISO timestamp');
  assert.match(record.capturedAt, /^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/, 'capturedAt must be the capture time, in UTC');
  for (const key of ['install', 'installApp', 'serve', 'capture', 'check', 'record', 'mutants']) {
    assert.ok(typeof record.commands[key] === 'string' && record.commands[key] !== '', `missing command: ${key}`);
  }
  assert.match(record.commands.capture, /node --test scripts\/sanitizer-bypass\.test\.mjs/);
  assert.match(record.commands.serve, /ng\.js serve/);
  assert.match(record.commands.mutants, /M029_BYPASS_MUTANT/);
  assert.equal(record.environment.node, process.version);
  assert.equal(record.environment.platform, process.platform);
});

// ---------------------------------------------------------------- the pair ----------------

test('the pair: the stripped binding warned and the bypassed binding did not, in one capture', async (t) => {
  const record = await captured();
  const pair = record.pair;

  // The presence: warnings, one per write that lost content, in the same load as the silence.
  assert.ok(pair.sanitizerWarnings > 0, 'the capture holds no sanitizer warning, so there is no presence to contrast');
  assert.equal(
    pair.sanitizerWarnings,
    pair.warningsInThePageTap,
    'the browser list and the page tap must hold the same warnings',
  );
  assert.ok(pair.lostWrites.length > 0, 'no write lost content, so nothing was stripped and there is no presence');
  assert.equal(
    pair.sanitizerWarnings,
    pair.writesThatLostContent,
    `the capture holds ${pair.sanitizerWarnings} warning(s) for ${pair.writesThatLostContent} write(s) that lost content: ` +
      'the warning fires once per sanitize call that strips, so every warning is accounted for and none is left for a write that kept its value',
  );
  for (const id of pair.lostWrites) {
    const binding = record.fixture.bindings.find((candidate) => id.startsWith(`${candidate.id}@`));
    assert.ok(binding, `the recording names a write (${id}) of no binding it holds`);
    assert.equal(binding.bypass, null, `the write that lost content (${id}) must be a sanitized binding, or the contrast is not about a bypass`);
  }

  // The absence, next to it: the bypassed binding wrote the same value, the sanitizer left it whole, and
  // no warning was left over for it.
  assert.equal(pair.bypassBindings, 1, 'exactly one binding must declare a `bypassSecurityTrust*` call');
  assert.equal(pair.bypassedKeptItsValueWhole, true, 'the bypassed write must keep its value whole');
  assert.equal(
    pair.bypassedValueIsTheValueAStrippedWriteLost,
    true,
    `the bypassed value must be the value a stripped write lost, or the sanitizer would not have warned for it: ${JSON.stringify(pair.sameValue)}`,
  );
  const bypassed = record.fixture.bindings.find((binding) => VETTED_BYPASS.test(String(binding.bypass ?? '')));
  assert.ok(bypassed, 'the capture holds no bypassed binding');
  for (const write of bypassed.writes) {
    assert.ok(write.scriptInValue, `the bypassed write ${write.version} must carry the markup the sanitizer would strip`);
    assert.equal(
      write.scriptInRendered,
      true,
      `the bypassed write ${write.version} lost its markup: the bypass was not applied, so the absence is not the bypass's`,
    );
    assert.equal(write.rendered, write.value, `the bypassed write ${write.version} is not its value, byte for byte`);
  }
  // The stripped twin: the same value, the script gone. The sanitizer would have warned for the bypassed
  // value, because it did warn for this one.
  const [strippedId, strippedVersion] = pair.sameValue.stripped.split('@');
  const stripped = record.fixture.bindings.find((binding) => binding.id === strippedId);
  const strippedWrite = stripped.writes.find((write) => write.version === Number(strippedVersion));
  const bypassWrite = bypassed.writes.find((write) => write.keptWhole);
  assert.equal(strippedWrite.value, bypassWrite.value, 'the two values must be identical');
  assert.equal(strippedWrite.scriptInRendered, false, 'the stripped write must have lost its script element');
  assert.equal(
    pair.scriptRan,
    false,
    'a <script> written through innerHTML executed: the payload must stay inert, so the page is safe to measure',
  );

  t.diagnostic(
    `pair: ${pair.sanitizerWarnings} warning(s) for ${pair.lostWrites.join(', ')}; none for ` +
      `${bypassed.id}@${bypassed.writes.map((write) => write.version).join('/')} (${bypassed.bypass}), which wrote the same value whole`,
  );
});

// ---------------------------------------------------------------- the fourth state ----------------

test('the module reports the bypass as deliberate, and the same load still reports the strip', async (t) => {
  const record = await captured();
  const { api } = loadBare();
  const result = host(api.join(warningsOf(record), record.profiler.records, bindingsOf(record)));
  const bypassed = record.fixture.bindings.find((binding) => VETTED_BYPASS.test(String(binding.bypass ?? '')));
  const bypassWrite = bypassed.writes.find((write) => write.keptWhole);
  const [strippedId, strippedVersion] = record.pair.sameValue.stripped.split('@');

  assert.equal(result.state, 'stripped', 'a placed strip outranks the measured bypass, and this load placed one');
  const deliberate = result.findings.filter((finding) => finding.state === 'deliberate');
  assert.equal(deliberate.length, 1, `the load must report exactly one deliberate bypass: ${JSON.stringify(result.findings)}`);
  assertDeliberate(deliberate[0], {
    binding: bypassed.bypass,
    contrast: {
      binding: strippedId,
      writeVersion: Number(strippedVersion),
      bypassWriteVersion: bypassWrite.version,
      warnings: record.pair.sanitizerWarnings,
    },
  });

  // The warning findings are still the warning findings: one per warning, in the recorded order, and the
  // deliberate finding was not folded into one of them.
  const warnings = warningsOf(record);
  assert.equal(result.findings.length, warnings.length + 1, 'one finding per warning, plus one per measured bypass');
  for (const [index, warning] of warnings.entries()) {
    const covering = coveringRecordOf(record, warning.t);
    if (covering === null) {
      assert.equal(result.findings[index].state, 'cannot-tell', `warning ${index} has no covering record`);
      assert.equal(result.findings[index].at, warning.t);
      continue;
    }
    assert.equal(result.findings[index].state, 'stripped', `warning ${index} falls inside cycle ${covering.cycleId}`);
    assert.equal(result.findings[index].at, warning.t);
    assert.deepEqual(
      result.findings[index].components,
      covering.checks
        .filter((check) => TEMPLATE_UPDATE_EVENTS.every((event) => check.events.includes(event)))
        .map((check) => check.componentName),
    );
    assert.equal('binding' in result.findings[index], false, 'the measured record carries no binding, so the finding must name none');
  }

  // The control — the same attribute, no bypass, no strip — is never reported deliberately, and neither is
  // any binding that declares no `bypassSecurityTrust*` call.
  assert.deepEqual(
    result.findings.filter((finding) => finding.state === 'deliberate').map((finding) => finding.binding),
    [bypassed.bypass],
    'only the binding that declares a vetted bypass may be reported deliberate',
  );
  assert.ok(
    record.fixture.bindings.filter((binding) => binding.bypass === null).length === 2,
    'the fixture must hold two sanitized bindings beside the bypassed one',
  );

  t.diagnostic(
    `deliberate: ${JSON.stringify(deliberate[0])} — load state ${result.state}, ` +
      `${result.findings.filter((finding) => finding.state === 'cannot-tell').length} cannot-tell, ` +
      `${result.findings.filter((finding) => finding.state === 'stripped').length} stripped`,
  );
});

test('deliberate is the load’s answer only beside a presence, and the same bindings without a warning are none', async (t) => {
  const record = await captured();
  const { api } = loadBare();
  const bindings = bindingsOf(record);

  // A load whose warnings could not be placed anywhere still reports the measured bypass: the absence is
  // stated as deliberate only where a warning exists in the same lists.
  const unplaced = warningsOf(record).filter((warning) => coveringRecordOf(record, warning.t) === null);
  assert.ok(
    unplaced.length > 0,
    'the capture must hold at least one warning with no covering record — the agent’s subscription lands after the first render',
  );
  const onlyUnplaced = host(api.join(unplaced, record.profiler.records, bindings));
  assert.equal(onlyUnplaced.state, 'deliberate', 'the load’s strongest positive answer is the measured bypass');
  assert.equal(
    onlyUnplaced.findings.filter((finding) => finding.state === 'cannot-tell').length,
    unplaced.length,
    'the unplaceable warnings are still reported, one finding each',
  );
  assert.equal(
    onlyUnplaced.findings.filter((finding) => finding.state === 'deliberate').length,
    1,
    'the measured bypass is reported beside them',
  );

  // N3: the very same page, with the warning list empty. A bypass with no presence to measure it against
  // is not deliberate, not stripped and not clean.
  const silent = host(api.join([], record.profiler.records, bindings));
  assertAbsenceIsNeither(silent);
  t.diagnostic(
    `none: ${JSON.stringify(silent)} for the same ${bindings.length} binding(s) that reported one deliberate bypass beside a warning`,
  );
});

// ---------------------------------------------------------------- mutants ----------------

test('held-out M1: reporting the bypass as stripped reddens the deliberate pin', async (t) => {
  const record = await captured();
  const api = mutant('bypass-as-stripped');
  const result = host(api.join(warningsOf(record), record.profiler.records, bindingsOf(record)));
  const bypassed = result.findings.find(
    (finding) => typeof finding.binding === 'string' && VETTED_BYPASS.test(finding.binding),
  );
  assert.ok(bypassed, 'the mutant must still report the bypass, or it is not the mutation this pin exists to catch');
  assert.equal(bypassed.state, 'stripped', 'the mutant must report the bypassed binding as a strip');
  const failure = reddens(
    () => assertDeliberate(bypassed, { binding: bypassed.binding, contrast: bypassed.contrast ?? {} }),
    'reporting the bypass as stripped',
  );
  t.diagnostic(`M1 bypass-as-stripped: ${failure.message.split('\n')[0]}`);

  // The module on disk was never written, so reloading it restores the pin.
  const reloaded = host(loadBare(SRC).api.join(warningsOf(record), record.profiler.records, bindingsOf(record)));
  assert.equal(
    reloaded.findings.filter((finding) => finding.state === 'deliberate').length,
    1,
    'reloading the untouched module must restore the deliberate finding',
  );
});

test('held-out M2: reporting a page with no warning as clean reddens the N3 pin', async (t) => {
  const record = await captured();
  const api = mutant('no-warning-as-clean');
  const result = host(api.join([], record.profiler.records, bindingsOf(record)));
  assert.match(
    JSON.stringify(result),
    /clean/,
    'the mutant must claim the page is clean, or it is not the mutation N3 exists to catch',
  );
  const failure = reddens(() => assertAbsenceIsNeither(result), 'reporting a page with no warning as clean');
  t.diagnostic(`M2 no-warning-as-clean: ${failure.message.split('\n')[0]}`);

  assertAbsenceIsNeither(host(loadBare(SRC).api.join([], record.profiler.records, bindingsOf(record))));
});

test('held-out M3: reporting deliberate for a non-bypassSecurityTrust* binding reddens', async (t) => {
  const record = await captured();
  // The capture's own bindings, with the bypass binding relabelled as the attribute it is written
  // through: a label that names no `bypassSecurityTrust*` call is not a vetted bypass.
  const relabelled = bindingsOf(record).map((binding) =>
    VETTED_BYPASS.test(String(binding.bypass ?? '')) ? { ...binding, bypass: 'innerHtml' } : binding,
  );
  const pin = (api) => {
    const result = host(api.join(warningsOf(record), record.profiler.records, relabelled));
    assert.equal(
      result.findings.filter((finding) => finding.state === 'deliberate').length,
      0,
      'a binding that declares no `bypassSecurityTrust*` call must never be reported deliberate',
    );
    assert.notEqual(result.state, 'deliberate', 'and the load must not answer deliberate for one');
    return result;
  };

  assert.equal(pin(loadBare(SRC).api).state, 'stripped', 'the strip is still placed for the relabelled page');

  const api = mutant('deliberate-without-a-bypass');
  const result = host(api.join(warningsOf(record), record.profiler.records, relabelled));
  const bypassed = result.findings.find((finding) => finding.state === 'deliberate');
  assert.ok(bypassed, 'the mutant must report the relabelled binding as deliberate');
  assert.equal(bypassed.binding, 'innerHtml', 'the mutant names the label it was handed');
  const failure = reddens(() => pin(api), 'reporting deliberate for a non-bypassSecurityTrust* binding');
  t.diagnostic(`M3 deliberate-without-a-bypass: ${failure.message.split('\n')[0]}`);

  // The run's own module over the same relabelled bindings: green on the file, and the case this suite
  // is red on when it is started with M029_BYPASS_MUTANT=deliberate-without-a-bypass.
  pin(loadBare().api);
});

// ---------------------------------------------------------------- purity ----------------

test('the module answers from the three lists it is given and installs nothing of its own (N1)', async () => {
  const record = await captured();
  const calls = [];
  const spy = (name) => () => {
    calls.push(name);
  };
  const context = createContext({
    console: { log: spy('console.log'), warn: spy('console.warn'), error: spy('console.error'), info: spy('console.info'), debug: spy('console.debug') },
    ng: { ɵsetProfiler: spy('ɵsetProfiler') },
    performance: { now: spy('performance.now') },
  });
  runInContext(SRC, context);
  const api = context.angularAiSanitizerTriage;
  host(api.join(warningsOf(record), record.profiler.records, bindingsOf(record)));
  host(api.join([], record.profiler.records, bindingsOf(record)));
  assert.deepEqual(calls, [], 'joining must not read the console, subscribe to the profiler or read the clock (N1)');
});

test('the three lists it was given are left exactly as they were (N1)', async () => {
  const record = await captured();
  const warnings = warningsOf(record);
  const records = host(record.profiler.records);
  const bindings = bindingsOf(record);
  const before = JSON.stringify([warnings, records, bindings]);
  const { api } = loadBare();
  host(api.join(warnings, records, bindings));
  assert.equal(JSON.stringify([warnings, records, bindings]), before, 'joining must not write to the lists it reads');
});
