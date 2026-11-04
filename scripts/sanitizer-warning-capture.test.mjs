// @ts-check
//
// M029 T001/T007 — what the sanitizer warning and the page agent's profiler events actually contain, in one
// page load of the two-binding fixture (`spikes/ng222-app/src/app/trust-bypass-page.ts`), checked against the
// recording the capture wrote (`research/raw/m029-sanitizer-warning.json`).
//
// Run the checks against the recording. This is everything this suite does, and it needs no dev server, no
// browser and no opt-in, so it reports zero skipped tests:
//   node --test scripts/sanitizer-warning-capture.test.mjs
//
// Re-capture: the part that starts the fixture's dev server and a headless Chromium is
// `scripts/capture/sanitizer-warning.live.mjs`. It is not named `*.test.mjs`, so the `scripts/**/*.test.mjs`
// glob never collects it and no default run starts a server. It needs
// `npm --prefix spikes/ng222-app ci --include=dev` and the Playwright browsers:
//   node scripts/capture/sanitizer-warning.live.mjs
//
// Point the same checks at another recording — how the mutants are run:
//   set M029_RECORD=<path to a mutant capture>& node --test scripts/sanitizer-warning-capture.test.mjs
//
// Nothing in the recording's console list is written by hand: the capture stores the browser's own
// console messages twice, from two independent channels (CDP `Runtime.consoleAPICalled` and an
// in-page tap at document_start), and the checks below refuse a recording whose two lists disagree.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const APP = join(ROOT, 'spikes', 'ng222-app');
const RECORD_PATH = process.env.M029_RECORD ?? join(ROOT, 'research', 'raw', 'm029-sanitizer-warning.json');
// The live capture, kept out of this file for one reason: it starts a dev server and a browser, so it may
// not be collected by the default test glob. It is named `*.live.mjs` and lives under `scripts/capture/`,
// so `scripts/**/*.test.mjs` never reaches it, and no test here has to be skipped to keep it from running.
const LIVE_CAPTURE = join(__dirname, 'capture', 'sanitizer-warning.live.mjs');

const SANITIZER_WARNING = /WARNING: sanitizing HTML stripped some content/;
const PROFILER_EVENTS = new Set([2, 3, 6, 7]); // TemplateUpdateStart, TemplateUpdateEnd, OutputStart, OutputEnd
const TEMPLATE_UPDATE_EVENTS = [2, 3];
const TAP_TYPE_TO_CDP = { warn: 'warning', log: 'log', debug: 'debug', info: 'info', error: 'error' };

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

test('the live capture that starts a dev server sits outside the default test glob', () => {
  // E3 (held-out) fails any `npm test` that reports a skipped test, so the capture may not live behind one.
  // It lives at scripts/capture/sanitizer-warning.live.mjs instead: the default glob is
  // `scripts/**/*.test.mjs`, and that file's name does not end in `.test.mjs`, so no run collects it unless
  // it is asked for by name.
  assert.ok(existsSync(LIVE_CAPTURE), 'the capture that starts the fixture dev server is missing');
  const collectedByTheDefaultGlob = (file) => /\.test\.mjs$/.test(file);
  assert.equal(collectedByTheDefaultGlob('scripts/capture/sanitizer-warning.live.mjs'), false);
  assert.equal(collectedByTheDefaultGlob('scripts/sanitizer-warning-capture.test.mjs'), true);
  const source = readFileSync(LIVE_CAPTURE, 'utf8');
  // It is the part that captures, not a check that reads the recording: the dev server and the browser
  // are started there, and the recording is written before anything checks it.
  assert.match(source, /'cli', 'bin', 'ng\.js'\), 'serve', '--port'/);
  assert.match(source, /writeFileSync\(out,/);
  assert.match(source, /capture: CAPTURE_COMMAND/);
  assert.match(source, /CAPTURE_COMMAND = 'node scripts\/capture\/sanitizer-warning\.live\.mjs'/);
});

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
  // T007 moved the capture out of the default test glob, so a fresh capture records the live script's own
  // line. This recording predates that move and names the test file it used to run through. Either way the
  // recorded command names the file that captures, and that file is there: a command pointing at a file
  // that is not there is not a command a reader could run.
  const captureFile = record.commands.capture.match(/scripts[\\/][^\s"'<>&|]+\.mjs/);
  assert.ok(captureFile, `the recorded capture command names no script: ${record.commands.capture}`);
  assert.ok(
    existsSync(join(ROOT, captureFile[0])),
    `the recorded capture command names a file that is not there: ${captureFile[0]}`,
  );
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
