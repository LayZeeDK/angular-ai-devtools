// @ts-check
//
// M029 T007 — the live capture behind `research/raw/m029-sanitizer-warning.json`.
//
// This file is deliberately *not* named `*.test.mjs`. `npm test` collects `scripts/**/*.test.mjs`, and a
// capture that starts a dev server and a headless Chromium must never be collected by a run that does not
// want it. T001 ran the capture from inside the check suite behind a `skip`, so every `npm test` reported
// one skipped test and the milestone's own SC5 gate (held-out E3: 0 skipped, 0 todo) went red. The checks
// that read and police the recording live at `scripts/sanitizer-warning-capture.test.mjs` and always run;
// this file only produces what they read.
//
// Re-capture (needs `npm --prefix spikes/ng222-app ci --include=dev` and the Playwright browsers):
//   node scripts/capture/sanitizer-warning.live.mjs
//
// Then check what it wrote:
//   node --test scripts/sanitizer-warning-capture.test.mjs
//
// Options:
//   --out <path>        where to write the recording (default research/raw/m029-sanitizer-warning.json;
//                       M029_RECORD does the same)
//   --port <number>     the fixture's dev server port (default 4271; M029_PORT does the same)
//   --help
//
// The recording is written before anything checks it, so a capture the checks would refuse is still on
// disk to be read and reported rather than quietly dropped.
//
// Nothing in the recording's console list is written by hand: the capture stores the browser's own console
// messages twice, from two independent channels (CDP `Runtime.consoleAPICalled` and an in-page tap at
// document_start), so the checks can refuse a recording whose two lists disagree.
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const AGENT_PATH = join(ROOT, 'extension', 'agent-main.js');
const ROUTE_PATH = '/trust-bypass';
const DEFAULT_RECORD_PATH = join(ROOT, 'research', 'raw', 'm029-sanitizer-warning.json');
const DEFAULT_PORT = 4271;

const SANITIZER_WARNING = /WARNING: sanitizing HTML stripped some content/;
const TEMPLATE_UPDATE_EVENTS = [2, 3];

// The command lines a fresh recording writes into its own `commands` block. The served port is the only
// part that varies between captures, so the serve line is built from it.
const CAPTURE_COMMAND = 'node scripts/capture/sanitizer-warning.live.mjs';
const CHECK_COMMAND = 'node --test scripts/sanitizer-warning-capture.test.mjs';
const MUTANT_COMMAND = 'set M029_RECORD=<path to a mutant recording>& node --test scripts/sanitizer-warning-capture.test.mjs';

const USAGE = `the M029 sanitizer-warning capture: one headless page load of the two-binding fixture

  node scripts/capture/sanitizer-warning.live.mjs [--out <path>] [--port <number>]

  --out <path>      the recording to write (default research/raw/m029-sanitizer-warning.json; M029_RECORD)
  --port <number>   the fixture dev server's port (default 4271; M029_PORT)
  --help            this text

The circle is: this capture writes the recording, then

  node --test scripts/sanitizer-warning-capture.test.mjs

proves it. Nothing here is collected by the default test glob (\`scripts/**/*.test.mjs\`), so no test run that
does not ask for a capture starts a dev server or a browser.`;

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

/**
 * Start the fixture's dev server, load the page once in headless Chromium, and return the recording.
 *
 * @param {{ port?: number }} [options]
 * @returns {Promise<object>} the recording the checks read
 */
export async function capture(options = {}) {
  const port = options.port ?? DEFAULT_PORT;
  const origin = `http://127.0.0.1:${port}`;
  const pageUrl = `${origin}${ROUTE_PATH}`;

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
    [join(APP, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), 'serve', '--port', String(port), '--host', '127.0.0.1'],
    { cwd: APP, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let serverOutput = '';
  server.stdout.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-4000); });
  server.stderr.on('data', (chunk) => { serverOutput = (serverOutput + chunk).slice(-4000); });

  let browser;
  try {
    await waitForServer(server, () => serverOutput, origin);
    await new Promise((thatResolves) => setTimeout(thatResolves, 1200));

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

    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
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
      port,
      pageUrl,
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

async function waitForServer(server, output, origin) {
  const started = Date.now();
  let exit = null;
  server.on('exit', (code, signal) => { exit = { code, signal }; });
  while (Date.now() - started < 180000) {
    if (exit) throw new Error(`the fixture dev server exited (${JSON.stringify(exit)}):\n${output()}`);
    try {
      const response = await fetch(`${origin}/`, { signal: AbortSignal.timeout(2000) });
      if (response.ok) return;
    } catch {
      /* not listening yet */
    }
    await new Promise((thatResolves) => setTimeout(thatResolves, 500));
  }
  throw new Error(`the fixture dev server did not answer on ${origin} within 180s:\n${output()}`);
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

/**
 * Assemble the recording the checks read. Kept here rather than in the suite so the suite holds only what
 * it proves: a recording assembled by the checks it is checked against would prove nothing.
 *
 * @param {any} input
 * @returns {object}
 */
export function buildRecording(input) {
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
    url: input.pageUrl,
    pageUrl: input.pageUrl,
    commands: {
      install: 'npm ci --include=dev',
      installApp: 'npm --prefix spikes/ng222-app ci --include=dev',
      serve: `node spikes/ng222-app/node_modules/@angular/cli/bin/ng.js serve --port ${input.port} --host 127.0.0.1  (cwd spikes/ng222-app)`,
      capture: CAPTURE_COMMAND,
      check: CHECK_COMMAND,
      mutants: MUTANT_COMMAND,
    },
    environment: {
      platform: process.platform,
      shell: process.platform === 'win32' ? 'cmd.exe' : (process.env.SHELL ?? 'sh'),
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

// ---------------------------------------------------------------- command line ----------------

/**
 * The options `main` runs with: `--out`/`--port`, then `--help`, over the environment's defaults.
 *
 * @param {readonly string[]} argv
 * @returns {{ out: string, port: number, help: boolean }}
 */
export function parseArgs(argv = []) {
  /** @type {{ out: string, port: number, help: boolean }} */
  const options = {
    out: process.env.M029_RECORD || DEFAULT_RECORD_PATH,
    port: Number(process.env.M029_PORT || DEFAULT_PORT),
    help: false,
  };
  const args = Array.isArray(argv) ? [...argv] : [];
  for (let index = 0; index < args.length; index += 1) {
    const arg = String(args[index]);
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--out') {
      options.out = args[index + 1] ?? options.out;
      index += 1;
    } else if (arg.startsWith('--out=')) {
      options.out = arg.slice('--out='.length);
    } else if (arg === '--port') {
      options.port = Number(args[index + 1]);
      index += 1;
    } else if (arg.startsWith('--port=')) {
      options.port = Number(arg.slice('--port='.length));
    } else {
      throw new Error(`unknown argument: ${arg} (try --help)`);
    }
  }
  if (!Number.isInteger(options.port) || options.port <= 0 || options.port > 65535) {
    throw new Error(`the port must be a port number, got ${JSON.stringify(options.port)}`);
  }
  if (typeof options.out !== 'string' || options.out === '') {
    throw new Error('--out names no path');
  }
  return options;
}

/**
 * Run the capture, write the recording, and say what to run next.
 *
 * @param {readonly string[]} [argv]
 * @returns {Promise<number>} process exit code
 */
export async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  const out = resolve(options.out);
  try {
    const record = await capture({ port: options.port });
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, `${JSON.stringify(record, null, 2)}\n`);
    console.log(
      `captured ${record.url} in one headless page load: ${record.console.count} console message(s), ` +
        `${record.contains.console.sanitizerWarnings} sanitizer warning(s), ${record.profiler.count} profiler record(s)`,
    );
    console.log(`wrote ${out}`);
    console.log(`now prove it: ${CHECK_COMMAND}`);
    return 0;
  } catch (error) {
    console.error(`capture failed: ${error instanceof Error ? error.message : String(error)}`);
    return 1;
  }
}

const self = fileURLToPath(import.meta.url);
let argvEntry = process.argv[1];
try {
  if (argvEntry) argvEntry = resolve(argvEntry);
} catch {
  /* not a path: not this file */
}
if (argvEntry && argvEntry === resolve(self)) {
  process.exitCode = await main();
}

export default { capture, buildRecording, parseArgs, main };
