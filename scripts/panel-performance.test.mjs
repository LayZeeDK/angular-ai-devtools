// Tests for apps/angular-ai-devtools/src/app/panel-performance.ts — the display half of M040 T004
// (INTENT.md SC5, held-out E7 and E8; prohibitions N1, N5). The join itself is
// `extension/performance-narrator.js` (T003), already landed: this suite runs that join over frames
// built from T001's recording (`research/raw/m040-work-events.json`) inside a bare `node:vm` context
// and feeds its answers straight into the pane, so the two halves are pinned against each other
// rather than against a hand-written copy of an answer.
//
// The fixture is the recording, and it is read, never written: the five pair names and their event
// numbers are the ones the installed `ProfilerEvent` derives, the component names are the instances
// the per-pair witness rows measured on `/` (`_App`, `_Counter`, `RouterOutlet`), and the
// `ChangeDetection` bracket is the pair the recording answers as carrying no identity at all — the
// source of the one absence the pane renders. What no measurement carries is a frame-level receipt
// time (`at`), so every frame's readings are constructed here and only ever compared with the two
// readings that produced them.
//
// The pane's job is separation (SC5). Each interval becomes one row, in the answer's order and no
// other, with two cells apart:
//
//   identity   the component name the interval's own two events carried, or the absence word the
//              answer named — never a cost, never a name the answer did not carry (N5, E7).
//   cost       the duration the page measured, a measured `0` included, or the unmeasured word the
//              answer carries for an interval no end closed — never a name, never a number nobody
//              measured (E7).
//
// A cell holding nothing prints nothing, so an unnamed interval renders no cost line and an
// unmeasured one renders no identity line — "nothing it was not given". `idle` is the pane's own
// state for nothing having arrived, and a state word this pane was not written for is still rendered
// as the word it was given.
//
// Every criterion is proven non-vacuously: the pin runs against the untouched module first, then the
// same pin runs against a copy of the module source carrying one anchored mutation which is asserted
// to exhibit the defect the pin hunts, and it must redden with a failure message that names the
// defect by string. A mutant that survives its pin, or reddens with a message that does not name the
// defect, fails this suite.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-performance.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/performance-narrator.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m040-work-events.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ measured fixture ----

/** The five pairs, by the numbers the recording derived from the installed `ProfilerEvent`. */
const PAIRS = new Map(
  RECORDING.pairs.sources[1].pairs.map((pair) => [pair.label, pair]),
);

/** The page whose per-pair witness rows name the identity each end of each pair carried. */
const PAGE = RECORDING.witness.pages[0];

/** One pair's witness row on that page. */
function witnessed(label) {
  const row = PAGE.pairs.find((pair) => pair.label === label);
  assert.ok(row, `the recording witnesses no ${label} pair on ${PAGE.url}`);
  return row;
}

/** `_App` and `_Counter`: the two component names a `TemplateUpdate` bracket measured. */
const APP = witnessed('TemplateUpdate').startInstance[0];
const COUNTER = witnessed('TemplateUpdate').startInstance[1];
/** `RouterOutlet`: the directive name a `LifecycleHook` bracket measured. */
const ROUTER_OUTLET = witnessed('LifecycleHook').startInstance[0];
/** `null`: what the `ChangeDetection` bracket carries at both ends, which is no identity at all. */
const NOBODY = witnessed('ChangeDetection').startInstance[0];

/** One recorded work event: T002's entry shape, with the numbers and names the recording measured. */
function event(label, end, at, componentName) {
  const pair = PAIRS.get(label);
  assert.ok(pair, `the recording derives no ${label} pair`);
  return {
    type: end ? pair.end.value : pair.start.value,
    pair: label,
    end: end,
    at: at,
    componentName: componentName === undefined ? null : componentName,
  };
}

/**
 * One frame, shaped like the change-detection record T002 publishes: the `events` list is the work,
 * and every other field is one the join ignores and the pane must never read.
 */
function frame(events) {
  return {
    cycleId: 7,
    startedAt: 0,
    trigger: { kind: 'unknown', listenerName: null },
    zoneMode: 'zoneless',
    events: events,
    checks: [],
  };
}

/**
 * A frame whose work is the recording's: two template updates and a lifecycle hook, all closed, and
 * one `ChangeDetection` bracket whose own two events name nobody. In the order the frame recorded the
 * starts, the answer holds a measured interval, a measured interval, a `cannot-tell` one and a
 * measured one — the mixed answer the pane's separation is written for.
 */
function recordedFrame() {
  return frame([
    event('TemplateUpdate', false, 100, APP),
    event('LifecycleHook', false, 100.5, ROUTER_OUTLET),
    event('ChangeDetection', false, 101),
    event('TemplateUpdate', false, 102, COUNTER),
    event('ChangeDetection', true, 103),
    event('TemplateUpdate', true, 104),
    event('LifecycleHook', true, 105.5, ROUTER_OUTLET),
    event('TemplateUpdate', true, 106),
  ]);
}

/** A frame holding two starts and one end: the first start is never closed, the second is measured. */
function openFrame() {
  return frame([
    event('TemplateUpdate', false, 0, APP),
    event('LifecycleHook', false, 1, ROUTER_OUTLET),
    event('LifecycleHook', true, 2, ROUTER_OUTLET),
  ]);
}

/** A frame whose only end has no start of its own: the join reports it unresolved and mints no row. */
function unresolvedFrame() {
  return frame([
    event('TemplateUpdate', false, 0, APP),
    event('ChangeDetection', true, 5),
  ]);
}

/** A start and its end at the same measured instant: a measured zero, not a missing cost. */
function zeroFrame() {
  return frame([
    event('TemplateUpdate', false, 7, APP),
    event('TemplateUpdate', true, 7, APP),
  ]);
}

/** One `ChangeDetection` bracket and nothing else: the answer's one unnamed interval. */
function unnamedOnlyFrame() {
  return frame([
    event('ChangeDetection', false, 3),
    event('ChangeDetection', true, 4),
  ]);
}

/** One start the frame never closes, which is the only interval the answer holds. */
function unmeasuredOnlyFrame() {
  return frame([event('TemplateUpdate', false, 9, APP)]);
}

/** A frame with no work at all: readable, empty, and not the same as a frame the join cannot read. */
function emptyFrame() {
  return frame([]);
}

/** A frame the join cannot read, because it carries no `events` list to walk. */
function unreadableFact() {
  return { cycleId: 3, checks: [] };
}

// --------------------------------------------------------------------------- the join ----

/** `extension/performance-narrator.js` run in a bare context, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiPerformanceNarrator;
  assert.ok(
    api,
    'extension/performance-narrator.js must publish its namespace',
  );
  assert.equal(typeof api.narrate, 'function');
  return api;
}

const JOIN = joinApi();

/** A value from the vm context carries that context's own prototypes, so it is copied here first. */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The join's own answer for one frame, copied into this realm. */
function answerOf(fact) {
  return clone(JOIN.narrate(fact));
}

/** The words the join publishes, read from the join rather than restated here. */
const MEASURED = JOIN.MEASURED;
const CANNOT_TELL = JOIN.CANNOT_TELL;
const UNMEASURED = JOIN.UNMEASURED;
const NO_COMPONENT_IDENTITY = JOIN.NO_COMPONENT_IDENTITY;

// ---------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface source with one anchored replacement applied, and the source beside it. The
 * anchor must occur exactly once, so a mutation cannot silently rewrite a different branch, and the
 * result must differ from the source, so a no-op mutation is a failure rather than a green mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-performance.ts: ${JSON.stringify(anchor)}`,
  );
  assert.equal(
    SURFACE_SRC.split(anchor).length - 1,
    1,
    `mutation anchor must occur exactly once: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `the mutation must change the source: ${JSON.stringify(anchor)}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-performance-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return { module: await import(pathToFileURL(file).href), source };
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * Three phases of a non-vacuous pin, with the untouched module's pass asserted by the caller: the
 * mutated copy is run through the same pin, the pin reddens, and the failure names the defect.
 */
function reddens(name, render) {
  let failure = null;
  try {
    render();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${name}: the mutated copy must redden the pin`,
  );
  assert.match(
    failure.message,
    new RegExp(name),
    `${name}: the pin must fail by name, got: ${failure.message}`,
  );
  // The whole failure, flattened: the defect's name and the text the mutant rendered beside the text
  // the pin expected, so the log quotes what named the defect rather than only its title.
  console.log(
    `mutant ${name} reddens: ${failure.message.replace(/\s+/g, ' ').trim()}`,
  );
  return failure;
}

// ------------------------------------------------------------- the pane's own answer ----

/**
 * The two cells one interval renders, per the rule the pane documents: the identity cell holds the
 * name the interval's own two events carried, or the absence word the answer named, or nothing; the
 * cost cell holds the duration the answer measured, or the state word the answer gave an interval it
 * measured nothing for — and nothing at all where the interval already named an absence.
 *
 * This is the expectation the pins compare the pane against; it is written from the interface
 * contract rather than from the module's own code, and the module is never asked for it.
 */
function cellsOf(interval) {
  const name =
    typeof interval.componentName === 'string' && interval.componentName !== ''
      ? interval.componentName
      : null;
  const absence =
    typeof interval.absence === 'string' && interval.absence !== ''
      ? interval.absence
      : null;
  const duration =
    typeof interval.durationMs === 'number' &&
    Number.isFinite(interval.durationMs)
      ? interval.durationMs
      : null;
  const identity = name ?? absence ?? '';
  let cost = '';
  if (duration !== null) cost = String(duration);
  else if (absence === null) cost = interval.state;
  return { identity, cost };
}

/** The lines one row renders, per the rule the pane documents, written from the row's own cells. */
function linesOfRows(columns) {
  const lines = [];
  for (const row of columns) {
    lines.push(`state: ${row.state}`);
    if (row.identity !== '') lines.push(`identity: ${row.identity}`);
    if (row.cost !== '') lines.push(`cost: ${row.cost}`);
  }
  return lines;
}

/** The lines one answer is expected to render, in the answer's order and no other. */
function expectedLines(answer) {
  const lines = [];
  if (typeof answer.absence === 'string')
    lines.push(`absence: ${answer.absence}`);
  for (const interval of answer.intervals) {
    const { identity, cost } = cellsOf(interval);
    lines.push(`state: ${interval.state}`);
    if (identity !== '') lines.push(`identity: ${identity}`);
    if (cost !== '') lines.push(`cost: ${cost}`);
  }
  if (lines.length === 0) lines.push(SURFACE.NO_INTERVAL_LINE);
  return lines;
}

// --------------------------------------------------------------------------- the pins ----

/** SC5/AC1: one row per interval, in the answer's order, and the answer's own state word. */
function pinRecordedOrder(surface, answer) {
  assert.equal(
    surface.state,
    answer.state,
    `recorded-order: the pane reports the state the answer carried (${answer.state}); it reported ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    answer.state,
    'recorded-order: the kind is the word',
  );
  assert.equal(
    surface.columns.length,
    answer.intervals.length,
    `recorded-order: one row per interval the answer carried — the answer carried ${answer.intervals.length}, the pane rendered ${surface.columns.length}: ${JSON.stringify(surface.columns)}`,
  );
  for (let index = 0; index < answer.intervals.length; index += 1) {
    const interval = answer.intervals[index];
    const row = surface.columns[index];
    assert.ok(
      row,
      `recorded-order: the pane must render a row for every interval; row ${index} is missing`,
    );
    assert.equal(
      row.state,
      interval.state,
      `recorded-order: row ${index} must keep the state and place of its interval (${interval.state}); it held ${row.state}`,
    );
    assert.equal(
      row.pair,
      interval.pair,
      `recorded-order: row ${index} must keep the pair of its interval (${interval.pair}); it held ${row.pair}`,
    );
  }
}

/** AC1/AC3: a measured interval's two cells are the name and the duration the answer carried. */
function pinMeasuredRows(surface, answer) {
  answer.intervals.forEach((interval, index) => {
    if (interval.state !== MEASURED) return;
    const row = surface.columns[index];
    assert.ok(row, `measured-row-own-text: row ${index} is missing`);
    assert.equal(
      row.identity,
      interval.componentName,
      `measured-row-own-text: row ${index} must hold the component the answer carried (${JSON.stringify(interval.componentName)}); it held ${JSON.stringify(row.identity)}`,
    );
    assert.equal(
      row.cost,
      String(interval.durationMs),
      `measured-row-own-text: row ${index} must hold the duration the page measured (${interval.durationMs}); it held ${JSON.stringify(row.cost)}`,
    );
    assert.ok(
      surface.text.includes(`identity: ${interval.componentName}`),
      `measured-row-own-text: row ${index} must print its identity line; it printed: ${surface.text}`,
    );
    assert.ok(
      surface.text.includes(`cost: ${interval.durationMs}`),
      `measured-row-own-text: row ${index} must print its cost line; it printed: ${surface.text}`,
    );
    // No other state's text reaches a measured row.
    assert.equal(
      row.identity.includes(NO_COMPONENT_IDENTITY),
      false,
      `measured-row-own-text: a measured identity is a component, not an absence; it held ${row.identity}`,
    );
    assert.equal(
      row.cost.includes(UNMEASURED),
      false,
      `measured-row-own-text: a measured cost is a duration, not the unmeasured word; it held ${row.cost}`,
    );
  });
}

/** AC2: a measured zero renders `0`, never a blank and never the state word. */
function pinMeasuredZero(surface, answer) {
  let zeros = 0;
  answer.intervals.forEach((interval, index) => {
    if (interval.state !== MEASURED || interval.durationMs !== 0) return;
    zeros += 1;
    const row = surface.columns[index];
    assert.ok(row, 'measured-zero-renders-zero: the zero row is missing');
    assert.equal(
      row.cost,
      '0',
      `measured-zero-renders-zero: a measured zero is a measurement and renders 0; row ${index} rendered ${JSON.stringify(row.cost)}`,
    );
    assert.ok(
      surface.lines.includes('cost: 0'),
      `measured-zero-renders-zero: the pane must print cost: 0; it printed: ${surface.text}`,
    );
  });
  assert.ok(
    zeros > 0,
    'measured-zero-renders-zero: the fixture must carry a measured zero to pin',
  );
}

/** AC2/AC3: an interval nobody named renders the absence the answer named, and no cost of its own. */
function pinUnnamedRows(surface, answer) {
  let unnamed = 0;
  answer.intervals.forEach((interval, index) => {
    if (interval.state !== CANNOT_TELL && interval.absence === undefined)
      return;
    unnamed += 1;
    const row = surface.columns[index];
    assert.ok(row, 'unnamed-interval-names-no-component: the row is missing');
    assert.equal(
      row.identity,
      interval.absence,
      `unnamed-interval-names-no-component: the identity cell must hold the absence word the answer named (${JSON.stringify(interval.absence)}); it held ${JSON.stringify(row.identity)}`,
    );
    assert.equal(
      row.cost,
      '',
      `unnamed-interval-names-no-component: an unnamed interval's cost cell holds nothing the answer did not measure; it held ${JSON.stringify(row.cost)}`,
    );
    assert.equal(
      surface.text.includes(`cost: ${interval.absence}`),
      false,
      `unnamed-interval-names-no-component: the pane must not print the absence as a cost; it printed: ${surface.text}`,
    );
  });
  assert.ok(
    unnamed > 0,
    'unnamed-interval-names-no-component: the fixture must carry an unnamed interval to pin',
  );
}

/** AC2: an interval no end closed renders its unmeasured word, no name and no number. */
function pinUnmeasuredRows(surface, answer) {
  let unmeasured = 0;
  answer.intervals.forEach((interval, index) => {
    if (interval.state !== UNMEASURED) return;
    unmeasured += 1;
    const row = surface.columns[index];
    assert.ok(row, 'unmeasured-interval-prints-no-cost: the row is missing');
    assert.equal(
      row.identity,
      '',
      `unmeasured-interval-prints-no-cost: an unmeasured interval has no component, and the pane may not borrow its bracket's name; it held ${JSON.stringify(row.identity)}`,
    );
    assert.equal(
      row.cost,
      UNMEASURED,
      `unmeasured-interval-prints-no-cost: the cost cell holds the unmeasured word the answer carries (${UNMEASURED}); it held ${JSON.stringify(row.cost)}`,
    );
    assert.equal(
      /\d/.test(`${row.identity}${row.cost}`),
      false,
      `unmeasured-interval-prints-no-cost: no number may be rendered for an interval the page did not measure; the row held ${JSON.stringify(row)}`,
    );
    assert.equal(
      surface.text.includes('identity:'),
      false,
      `unmeasured-interval-prints-no-cost: the unmeasured row prints no identity line; the pane printed: ${surface.text}`,
    );
  });
  assert.ok(
    unmeasured > 0,
    'unmeasured-interval-prints-no-cost: the fixture must carry an unmeasured interval to pin',
  );
}

/** AC1/SC5: exactly two columns, and a row's two cells never repeat one another's text. */
function pinCellsApart(surface) {
  const identities = [];
  for (const row of surface.columns) {
    const keys = Object.keys(row).sort();
    assert.deepEqual(
      keys,
      ['cost', 'identity', 'pair', 'state'],
      `rows-separate: a row is the state, the pair and its two cells; it carried ${JSON.stringify(keys)}`,
    );
    assert.notEqual(
      row.identity,
      row.cost,
      `rows-separate: a row's two cells must not repeat one another's text; the row held ${JSON.stringify(row.identity)} in both`,
    );
    if (row.identity !== '') identities.push(row.identity);
  }
  assert.equal(
    new Set(identities).size,
    identities.length,
    `rows-separate: no two rows may share an identity cell, so no row can render another row's text; the pane rendered ${JSON.stringify(identities)}`,
  );
  if (surface.columns.length > 0) {
    // The printed lines are each row's own cells and no other's: no row prints another row's text,
    // and no cell prints its neighbour's. The frame's own absence line is not a row's line.
    const rendered = surface.lines.filter(
      (line) => !line.startsWith('absence: '),
    );
    assert.deepEqual(
      [...rendered],
      linesOfRows(surface.columns),
      `rows-separate: each row must print its own two cells and no other row's; the pane printed ${JSON.stringify(surface.lines)} for the rows ${JSON.stringify(surface.columns)}`,
    );
  }
}

/** SC5: the pair identifies the work but is never printed as a third column. */
function pinTwoColumns(surface, answer) {
  for (const interval of answer.intervals) {
    assert.equal(
      surface.text.includes(interval.pair),
      false,
      `two-columns: the pair ${interval.pair} identifies the work and is not a column; the pane printed: ${surface.text}`,
    );
  }
}

/**
 * E7: each state renders its own text and no other state's. An answer that named no absence prints
 * no absence word, one that measured nothing prints no cost line with a number in it, and one that
 * left nothing unmeasured never claims the unmeasured word.
 */
function pinStatesExclusive(surface, answer) {
  const states = answer.intervals.map((interval) => interval.state);
  const absences = answer.intervals
    .map((interval) => interval.absence)
    .filter((absence) => typeof absence === 'string');
  const costLines = surface.lines.filter((line) => line.startsWith('cost: '));

  if (!states.includes(CANNOT_TELL) && absences.length === 0) {
    assert.equal(
      surface.text.includes(NO_COMPONENT_IDENTITY),
      false,
      `states-exclusive: this answer named no absence, so the pane may not print one; it printed: ${surface.text}`,
    );
  }
  if (!states.includes(UNMEASURED)) {
    assert.equal(
      costLines.includes(`cost: ${UNMEASURED}`),
      false,
      `states-exclusive: no interval was left unmeasured, so the unmeasured word is no state here; the pane printed: ${surface.text}`,
    );
  }
  if (!states.includes(MEASURED)) {
    assert.equal(
      costLines.some((line) => /\d/.test(line)),
      false,
      `states-exclusive: no interval was measured, so the pane may print no cost line with a number in it; it printed: ${surface.text}`,
    );
    assert.equal(
      surface.text.includes('identity: ') && absences.length === 0,
      false,
      `states-exclusive: no interval carried a name, so the pane may print no identity line; it printed: ${surface.text}`,
    );
  }
}

/** SC5/AC3: nothing the answer did not carry is rendered — the exact lines, and nothing else. */
function pinRendersNothingElse(surface, answer) {
  const expected = expectedLines(answer);
  assert.deepEqual(
    [...surface.lines],
    expected,
    `renders-nothing-it-was-not-given: the pane must render the answer's own values in the answer's order; it rendered: ${JSON.stringify(surface.lines)}`,
  );
  assert.equal(
    surface.text,
    expected.join('\n'),
    'renders-nothing-it-was-not-given: the text is the lines',
  );
  assert.ok(
    surface.text.trim() !== '',
    'renders-nothing-it-was-not-given: never a blank pane',
  );
}

/** AC4: the pane starts idle, renders no row, and states nothing about any interval. */
function pinIdle(surface) {
  assert.equal(surface.state, 'idle', 'idle-own-text: state');
  assert.equal(surface.kind, 'idle', 'idle-own-text: kind');
  assert.deepEqual(
    surface.columns,
    [],
    'idle-own-text: no row while nothing arrived',
  );
  assert.ok(surface.lines.length > 0, 'idle-own-text: never a blank pane');
  assert.ok(surface.text.includes('idle'), 'idle-own-text: says idle');
  for (const marker of ['state: ', 'identity: ', 'cost: ', 'absence: ']) {
    assert.equal(
      surface.text.includes(marker),
      false,
      `idle-own-text: nothing has arrived, so it renders no ${marker.trim()} line; it rendered: ${surface.text}`,
    );
  }
}

/** AC1: a state word the pane was not written for is rendered as the word it was given. */
function pinGivenState(surface, word) {
  assert.equal(
    surface.state,
    word,
    `given-state-rendered: the word the answer carried, got ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    word,
    'given-state-rendered: the kind is the word',
  );
  const row = surface.columns[0];
  assert.ok(
    row,
    `given-state-rendered: the interval naming ${word} still renders a row; the pane rendered ${JSON.stringify(surface.columns)}`,
  );
  assert.equal(
    row.state,
    word,
    `given-state-rendered: the row's state is the word it was given, got ${row.state}`,
  );
  assert.ok(
    surface.lines.includes(`state: ${word}`),
    `given-state-rendered: the row prints the word it was given; it printed: ${surface.text}`,
  );
  // No relabelling: the words this pane knows are not printed for a word it was not written for.
  for (const other of [MEASURED, UNMEASURED, CANNOT_TELL]) {
    assert.equal(
      surface.lines.includes(`state: ${other}`),
      false,
      `given-state-rendered: the pane must not relabel ${word} as ${other}; it printed: ${surface.text}`,
    );
  }
}

/** E8: the same answer rendered twice is byte-identical. */
function pinByteIdentical(render) {
  const once = render();
  const twice = render();
  assert.equal(once.text, twice.text, 'byte-identical: the text of two reads');
  assert.deepEqual(
    [...once.lines],
    [...twice.lines],
    'byte-identical: the lines of two reads',
  );
  assert.deepEqual(
    [...once.columns],
    [...twice.columns],
    'byte-identical: the rows of two reads',
  );
}

/** SC5/N1: the pane reads no clock, derives nothing and joins nothing — measured in its source. */
function pinDerivesNothing(source) {
  const forbidden = [
    ["the answer's startedAt receipt time", "['startedAt']"],
    ["the answer's endedAt receipt time", "['endedAt']"],
    ['the ends the answer could not place', "['unresolved']"],
    ["the frame's event list", "['events']"],
    ['a wall clock', 'Date.now('],
    ["the page's clock", 'performance.now('],
    ['a fresh date', 'new Date('],
  ];
  for (const [what, needle] of forbidden) {
    assert.equal(
      source.includes(needle),
      false,
      `reads-no-derived-value: the pane must not read ${what}; its source names ${needle}`,
    );
  }
  assert.equal(
    /^import\s/m.test(source),
    false,
    'reads-no-derived-value: the pane imports nothing at runtime, so its suite executes it',
  );
}

// -------------------------------------------------------------------------- the cases ----

describe('the measurement this pane renders', () => {
  it('the recording measures the pairs, the instances and the one bracket that names nobody', () => {
    assert.deepEqual([...PAIRS.keys()].sort(), [
      'ChangeDetection',
      'Component',
      'HostBindingsUpdate',
      'LifecycleHook',
      'TemplateUpdate',
    ]);
    assert.equal(PAGE.url, 'http://localhost:4222/');
    assert.equal(APP, '_App');
    assert.equal(COUNTER, '_Counter');
    assert.equal(ROUTER_OUTLET, 'RouterOutlet');
    // The `ChangeDetection` bracket measured no instance at either end, which is the one absence
    // the pane can be handed; the recording's own identity section says so in as many words.
    assert.equal(NOBODY, 'null');
    assert.equal(witnessed('ChangeDetection').endInstance[0], 'null');
    assert.equal(RECORDING.identity.namedAbsence.carriesIdentity, 'none');
    console.log(
      `performance fixture: pairs ${[...PAIRS.keys()].join(', ')}, instances ${APP}/${COUNTER}/${ROUTER_OUTLET}, absent ${NOBODY}`,
    );
  });

  it('the join answers the frame this pane is written for', () => {
    const answer = answerOf(recordedFrame());
    assert.deepEqual(
      answer.intervals.map((interval) => interval.state),
      [MEASURED, MEASURED, CANNOT_TELL, MEASURED],
    );
    assert.deepEqual(
      answer.intervals.map((interval) => interval.componentName ?? null),
      [APP, ROUTER_OUTLET, null, COUNTER],
    );
    assert.deepEqual(
      answer.intervals.map((interval) => interval.durationMs ?? null),
      [6, 5, null, 2],
    );
    assert.equal(answer.state, CANNOT_TELL);
    assert.equal(answer.absence, NO_COMPONENT_IDENTITY);
    assert.deepEqual([...answer.unresolved], []);
  });
});

describe('the pane renders the join’s answer (SC5, E7)', () => {
  it('AC1: one row per interval, in the answer’s order, with its two cells apart', () => {
    const answer = answerOf(recordedFrame());
    const surface = SURFACE.performancePanel(answer);

    pinRecordedOrder(surface, answer);
    pinMeasuredRows(surface, answer);
    pinUnnamedRows(surface, answer);
    pinCellsApart(surface);
    pinTwoColumns(surface, answer);
    pinStatesExclusive(surface, answer);
    pinRendersNothingElse(surface, answer);

    // The rows the fixture pins, spelled out, so a reader sees the panel the demo shows.
    assert.deepEqual(
      surface.columns.map((row) => [row.state, row.identity, row.cost]),
      [
        [MEASURED, APP, '6'],
        [MEASURED, ROUTER_OUTLET, '5'],
        [CANNOT_TELL, NO_COMPONENT_IDENTITY, ''],
        [MEASURED, COUNTER, '2'],
      ],
    );
    console.log(`performance columns: ${JSON.stringify(surface.columns)}`);
  });

  it('AC2: an unnamed interval renders the absence word, an empty cost cell and no name', () => {
    const answer = answerOf(unnamedOnlyFrame());
    assert.equal(answer.intervals.length, 1);
    assert.equal(answer.intervals[0].state, CANNOT_TELL);
    assert.equal(answer.intervals[0].absence, NO_COMPONENT_IDENTITY);

    const surface = SURFACE.performancePanel(answer);
    pinRecordedOrder(surface, answer);
    pinUnnamedRows(surface, answer);
    pinCellsApart(surface);
    pinStatesExclusive(surface, answer);
    pinRendersNothingElse(surface, answer);

    const row = surface.columns[0];
    assert.equal(row.identity, NO_COMPONENT_IDENTITY);
    assert.equal(row.cost, '');
    // No node index, no list position, no neighbour's name and no fallback word fills the gap.
    assert.equal(/unknown|node|\d/.test(`${row.identity}${row.cost}`), false);
    assert.ok(!surface.text.includes(`cost: ${NO_COMPONENT_IDENTITY}`));
  });

  it('AC2: an unmeasured interval renders its word, no component and no number', () => {
    const answer = answerOf(unmeasuredOnlyFrame());
    assert.equal(answer.intervals.length, 1);
    assert.equal(answer.intervals[0].state, UNMEASURED);
    assert.equal('durationMs' in answer.intervals[0], false);

    const surface = SURFACE.performancePanel(answer);
    pinRecordedOrder(surface, answer);
    pinUnmeasuredRows(surface, answer);
    pinCellsApart(surface);
    pinStatesExclusive(surface, answer);
    pinRendersNothingElse(surface, answer);

    // The component the recording does measure for that pair is nowhere in the pane: an interval
    // the frame never closed has no identity to borrow.
    assert.equal(surface.text.includes(APP), false);
    assert.equal(surface.text.includes(COUNTER), false);
    assert.deepEqual(
      [...surface.lines],
      [`state: ${UNMEASURED}`, `cost: ${UNMEASURED}`],
    );
  });

  it('AC2: a measured zero renders 0 in the cost cell, never a blank', () => {
    const answer = answerOf(zeroFrame());
    assert.equal(answer.intervals[0].durationMs, 0);
    const surface = SURFACE.performancePanel(answer);
    pinMeasuredZero(surface, answer);
    pinMeasuredRows(surface, answer);
    pinRendersNothingElse(surface, answer);
    assert.deepEqual(
      [...surface.lines],
      [`state: ${MEASURED}`, `identity: ${APP}`, 'cost: 0'],
    );
  });

  it('AC3: the pane derives nothing — no duration from the receipt times, no name from elsewhere', () => {
    pinDerivesNothing(SURFACE_SRC);

    // A measured interval the answer left unnamed: the pane renders no component rather than
    // completing it from the pair, the position or a neighbour.
    const unnamed = {
      state: CANNOT_TELL,
      intervals: [
        { state: MEASURED, pair: 'TemplateUpdate', durationMs: 4 },
        { state: MEASURED, pair: 'TemplateUpdate', durationMs: 1 },
      ],
      unresolved: [],
    };
    const surface = SURFACE.performancePanel(unnamed);
    assert.deepEqual(
      surface.columns.map((row) => row.identity),
      ['', ''],
    );
    assert.deepEqual(
      surface.columns.map((row) => row.cost),
      ['4', '1'],
    );
    assert.equal(surface.text.includes('identity:'), false);

    // The pane never joins: handed the frame the join reads, it answers idle, because a frame is not
    // an answer and the pane will not become the join.
    pinIdle(SURFACE.performancePanel(recordedFrame()));
    pinIdle(SURFACE.performancePanel(unreadableFact()));
  });

  it('AC3: an interval poisoned with every field the answer never carries renders none of them', () => {
    const poisoned = {
      state: MEASURED,
      intervals: [
        {
          state: MEASURED,
          pair: 'TemplateUpdate',
          componentName: APP,
          startedAt: 12,
          endedAt: 14,
          durationMs: 2,
          nodeIndex: 5,
          position: 1,
          percentage: 0.4,
          description: 'template update',
          source: 'app.component.ts',
          children: [COUNTER],
        },
        {
          state: CANNOT_TELL,
          pair: 'ChangeDetection',
          absence: NO_COMPONENT_IDENTITY,
          startedAt: 15,
          neighbour: COUNTER,
          fallback: 'unknown-component',
          estimate: 1.5,
        },
        {
          state: UNMEASURED,
          pair: 'TemplateUpdate',
          startedAt: 17,
          nodeIndex: 7,
          estimate: 1.5,
        },
      ],
      unresolved: [{ pair: 'ChangeDetection', type: 13 }],
    };
    const surface = SURFACE.performancePanel(poisoned);
    for (const leaked of [
      'nodeIndex',
      'position',
      'percentage',
      'description',
      'app.component.ts',
      'neighbour',
      'fallback',
      'unknown-component',
      'estimate',
      COUNTER,
      '1.5',
      '0.4',
    ]) {
      assert.equal(
        surface.text.includes(leaked),
        false,
        `renders-nothing-it-was-not-given: the pane must not render ${leaked}; it rendered: ${surface.text}`,
      );
    }
    // The pane still renders what the poisoned answer really carried.
    assert.deepEqual(
      surface.columns.map((row) => [row.state, row.identity, row.cost]),
      [
        [MEASURED, APP, '2'],
        [CANNOT_TELL, NO_COMPONENT_IDENTITY, ''],
        [UNMEASURED, '', UNMEASURED],
      ],
    );
    pinRendersNothingElse(surface, poisoned);
  });

  it('AC6: an end the answer could not place mints no row', () => {
    const answer = answerOf(unresolvedFrame());
    assert.equal(answer.intervals.length, 1);
    assert.deepEqual(
      [...answer.unresolved],
      [{ pair: 'ChangeDetection', type: 13 }],
    );
    const surface = SURFACE.performancePanel(answer);
    pinRecordedOrder(surface, answer);
    pinUnmeasuredRows(surface, answer);
    pinTwoColumns(surface, answer);
    assert.equal(surface.columns.length, 1);
    assert.equal(surface.text.includes('ChangeDetection'), false);
    assert.equal(/type|\b13\b/.test(surface.text), false);
  });

  it('AC4/E7: each state renders its own text and no other state’s', () => {
    const cases = [
      [recordedFrame(), [MEASURED, MEASURED, CANNOT_TELL, MEASURED]],
      [openFrame(), [UNMEASURED, MEASURED]],
      [unnamedOnlyFrame(), [CANNOT_TELL]],
      [unmeasuredOnlyFrame(), [UNMEASURED]],
      [zeroFrame(), [MEASURED]],
    ];
    for (const [fact, states] of cases) {
      const answer = answerOf(fact);
      assert.deepEqual(
        answer.intervals.map((interval) => interval.state),
        states,
        'the fixture must answer the states this pin describes',
      );
      const surface = SURFACE.performancePanel(answer);
      pinStatesExclusive(surface, answer);
      pinCellsApart(surface);
      pinRendersNothingElse(surface, answer);
    }
  });

  it('AC4: a frame that holds no work states its own absence, and never a blank pane', () => {
    const empty = answerOf(emptyFrame());
    assert.deepEqual([...empty.intervals], []);
    assert.equal(empty.absence, JOIN.NO_START_EVENTS);
    const emptySurface = SURFACE.performancePanel(empty);
    assert.equal(emptySurface.state, CANNOT_TELL);
    assert.deepEqual(emptySurface.columns, []);
    assert.deepEqual(
      [...emptySurface.lines],
      [`absence: ${JOIN.NO_START_EVENTS}`],
    );

    const unreadable = answerOf(unreadableFact());
    assert.equal(unreadable.absence, JOIN.FRAME_UNREADABLE);
    const unreadableSurface = SURFACE.performancePanel(unreadable);
    assert.deepEqual(
      [...unreadableSurface.lines],
      [`absence: ${JOIN.FRAME_UNREADABLE}`],
    );

    // An answer carrying neither an interval nor an absence still says something.
    const bare = SURFACE.performancePanel({ state: MEASURED, intervals: [] });
    assert.deepEqual([...bare.lines], [SURFACE.NO_INTERVAL_LINE]);
  });

  it('AC4: a state the pane was not written for still renders the word it was given', () => {
    const given = {
      state: 'wedged',
      intervals: [{ state: 'wedged', pair: 'TemplateUpdate', startedAt: 0 }],
      unresolved: [],
    };
    pinGivenState(SURFACE.performancePanel(given), 'wedged');
    // A second word, so the pass-through is a rule rather than one string that happens to work.
    pinGivenState(
      SURFACE.performancePanel({
        state: 'not-yet-named',
        intervals: [{ state: 'not-yet-named', pair: 'LifecycleHook' }],
      }),
      'not-yet-named',
    );
    // The words the join does answer stay themselves beside it.
    const mixed = SURFACE.performancePanel({
      state: 'wedged',
      intervals: [
        { state: 'wedged', pair: 'TemplateUpdate', startedAt: 0 },
        {
          state: MEASURED,
          pair: 'LifecycleHook',
          componentName: ROUTER_OUTLET,
          durationMs: 3,
        },
      ],
    });
    assert.equal(mixed.columns.length, 2);
    assert.equal(mixed.columns[0].state, 'wedged');
    assert.equal(mixed.columns[1].identity, ROUTER_OUTLET);
  });

  it('AC4: idle renders its own text for every way of having nothing to render', () => {
    for (const input of [
      undefined,
      null,
      {},
      [],
      'performance',
      7,
      { loading: true },
      { assembling: true },
      { state: JOIN.CANNOT_TELL, loading: true },
      { intervals: [] },
    ]) {
      pinIdle(SURFACE.performancePanel(input));
    }
  });

  it('AC4: the pane’s own messages and states are four different texts of their own', () => {
    const surfaces = [
      SURFACE.performancePanel(answerOf(zeroFrame())),
      SURFACE.performancePanel(answerOf(unmeasuredOnlyFrame())),
      SURFACE.performancePanel(answerOf(unnamedOnlyFrame())),
      SURFACE.performancePanel(undefined),
    ];
    assert.deepEqual(
      surfaces.map((surface) => surface.state),
      [MEASURED, UNMEASURED, CANNOT_TELL, 'idle'],
    );
    assert.equal(new Set(surfaces.map((surface) => surface.text)).size, 4);
    assert.equal(new Set(surfaces.map((surface) => surface.message)).size, 4);
  });

  it('E8: the same answer rendered twice is byte-identical', () => {
    const answer = answerOf(recordedFrame());
    pinByteIdentical(() => SURFACE.performancePanel(answer));

    // The same values, inserted in a different key order, render the same bytes: nothing here reads
    // an object's own order, and nothing is accumulated between reads.
    const reordered = {
      unresolved: [],
      intervals: answer.intervals.map((interval) => {
        const copy = {};
        for (const key of Object.keys(interval).reverse())
          copy[key] = interval[key];
        return copy;
      }),
      state: answer.state,
      absence: answer.absence,
    };
    assert.deepEqual(
      [...SURFACE.performancePanel(reordered).lines],
      expectedLines(answer),
    );
    pinByteIdentical(() => SURFACE.performancePanel(answer));
  });
});

describe('panel-performance mutants', () => {
  it('M1: an unmeasured interval that gains a cost reddens the unmeasured pin, naming it', async () => {
    const mutant = await loadMutant(
      '  else if (absence === null) cost = state;',
      "  else if (absence === null) cost = '0';",
    );
    const answer = answerOf(unmeasuredOnlyFrame());
    // The untouched module holds the word the answer carries and no number at all.
    pinUnmeasuredRows(SURFACE.performancePanel(answer), answer);
    const failure = reddens('unmeasured-interval-prints-no-cost', () =>
      pinUnmeasuredRows(mutant.module.performancePanel(answer), answer),
    );
    assert.match(failure.message, /unmeasured/);
    assert.equal(
      mutant.module.performancePanel(answer).columns[0].cost,
      '0',
      'the mutant really mints the cost the page never measured',
    );
  });

  it('M2: an unnamed interval that gains a name reddens the unnamed pin, naming it', async () => {
    const mutant = await loadMutant(
      "  const identity = name ?? absence ?? '';",
      "  const identity = name ?? 'unknown-component';",
    );
    const answer = answerOf(unnamedOnlyFrame());
    pinUnnamedRows(SURFACE.performancePanel(answer), answer);
    const failure = reddens('unnamed-interval-names-no-component', () =>
      pinUnnamedRows(mutant.module.performancePanel(answer), answer),
    );
    assert.match(failure.message, /unknown-component/);
    assert.equal(
      mutant.module.performancePanel(answer).columns[0].identity,
      'unknown-component',
      'the mutant really names the component the answer refused to',
    );
  });

  it('M3: a row that renders another row’s text reddens the separation pin, naming it', async () => {
    const mutant = await loadMutant(
      '  for (const row of columns) for (const line of rowLines(row)) lines.push(line);',
      [
        '  for (const row of columns) {',
        '    const borrow = columns[0];',
        '    const shown = borrow === undefined ? row : { ...row, identity: borrow.identity };',
        '    for (const line of rowLines(shown)) lines.push(line);',
        '  }',
      ].join('\n'),
    );
    const answer = answerOf(recordedFrame());
    pinCellsApart(SURFACE.performancePanel(answer));
    const failure = reddens('rows-separate', () =>
      pinCellsApart(mutant.module.performancePanel(answer)),
    );
    assert.match(failure.message, new RegExp(APP));
    // The row's own pin sees it too: the second measured row no longer holds its own component.
    assert.throws(
      () => pinMeasuredRows(mutant.module.performancePanel(answer), answer),
      (error) =>
        error instanceof assert.AssertionError &&
        String(error.message).includes('measured-row-own-text'),
      'a borrowed identity must redden the row’s own pin as well',
    );
  });

  it('M4: blanking a measured zero reddens the zero pin, naming it', async () => {
    const mutant = await loadMutant(
      '  if (duration !== null) cost = String(duration);',
      '  if (duration !== null && duration !== 0) cost = String(duration);',
    );
    const answer = answerOf(zeroFrame());
    pinMeasuredZero(SURFACE.performancePanel(answer), answer);
    const failure = reddens('measured-zero-renders-zero', () =>
      pinMeasuredZero(mutant.module.performancePanel(answer), answer),
    );
    assert.match(failure.message, /renders 0/);
  });

  it('M5: reordering the rows reddens the recorded-order pin, naming it', async () => {
    const mutant = await loadMutant(
      '  const lines: string[] = [];',
      '  columns.reverse();\n  const lines: string[] = [];',
    );
    const answer = answerOf(recordedFrame());
    pinRecordedOrder(SURFACE.performancePanel(answer), answer);
    const failure = reddens('recorded-order', () =>
      pinRecordedOrder(mutant.module.performancePanel(answer), answer),
    );
    assert.match(failure.message, /must keep the state and place/);
  });

  it('M6: minting a row for an end the answer could not place reddens the order pin, naming it', async () => {
    const mutant = await loadMutant(
      [
        '  for (const raw of read.intervals) {',
        '    const row = rowOf(raw);',
        '    if (row !== null) columns.push(row);',
        '  }',
      ].join('\n'),
      [
        '  for (const raw of read.intervals) {',
        '    const row = rowOf(raw);',
        '    if (row !== null) columns.push(row);',
        '  }',
        '  const ends = isObject(answer) ? answer["unresolved"] : undefined;',
        '  if (Array.isArray(ends)) {',
        '    for (const end of ends) {',
        '      columns.push({',
        "        state: 'measured',",
        '        pair: nonEmptyString(end["pair"]),',
        "        identity: '',",
        "        cost: '0',",
        '      });',
        '    }',
        '  }',
      ].join('\n'),
    );
    const answer = answerOf(unresolvedFrame());
    pinRecordedOrder(SURFACE.performancePanel(answer), answer);
    const failure = reddens('recorded-order', () =>
      pinRecordedOrder(mutant.module.performancePanel(answer), answer),
    );
    assert.match(failure.message, /one row per interval/);
    assert.equal(
      mutant.module.performancePanel(answer).columns.length,
      2,
      'the mutant really mints the row the answer never carried',
    );
  });

  it('M7: dropping a state the pane was not written for reddens the given-state pin, naming it', async () => {
    const mutant = await loadMutant(
      "  const state = nonEmptyString(raw['state']);\n  if (state === null) return null;",
      "  const state = nonEmptyString(raw['state']);\n  if (state === null || state === 'wedged') return null;",
    );
    const given = {
      state: 'wedged',
      intervals: [{ state: 'wedged', pair: 'TemplateUpdate', startedAt: 0 }],
      unresolved: [],
    };
    pinGivenState(SURFACE.performancePanel(given), 'wedged');
    const failure = reddens('given-state-rendered', () =>
      pinGivenState(mutant.module.performancePanel(given), 'wedged'),
    );
    assert.match(failure.message, /wedged/);
    assert.deepEqual(mutant.module.performancePanel(given).columns, []);
  });

  it('M8: deriving a cost from the receipt time reddens the derived-value pin, naming it', async () => {
    const mutant = await loadMutant(
      "  const duration = measurementOf(raw['durationMs']);",
      [
        '  const duration =',
        "    measurementOf(raw['durationMs']) ?? measurementOf(raw['startedAt']);",
      ].join('\n'),
    );
    pinDerivesNothing(SURFACE_SRC);
    const failure = reddens('reads-no-derived-value', () =>
      pinDerivesNothing(mutant.source),
    );
    assert.match(failure.message, /startedAt/);
    // And the pane's own pin: the interval the page never measured now carries a number.
    const answer = answerOf(unmeasuredOnlyFrame());
    assert.throws(
      () => pinUnmeasuredRows(mutant.module.performancePanel(answer), answer),
      (error) =>
        error instanceof assert.AssertionError &&
        String(error.message).includes('unmeasured-interval-prints-no-cost'),
      'a derived cost must redden the unmeasured pin as well',
    );
  });

  it('M9: a repeated read that is not byte-identical reddens the determinism pin, naming it', async () => {
    const mutant = await loadMutant(
      "    text: lines.join('\\n'),",
      "    text: `${lines.join('\\n')}${(globalThis.__paneReads = (globalThis.__paneReads ?? 0) + 1)}`,",
    );
    const answer = answerOf(recordedFrame());
    pinByteIdentical(() => SURFACE.performancePanel(answer));
    const failure = reddens('byte-identical', () =>
      pinByteIdentical(() => mutant.module.performancePanel(answer)),
    );
    assert.match(failure.message, /text of two reads/);
  });

  it('M10: one cell repeating the other’s text reddens the separation pin, naming it', async () => {
    const mutant = await loadMutant(
      "  if (row.cost !== '') lines.push(`cost: ${row.cost}`);",
      "  if (row.cost !== '') lines.push(`cost: ${row.identity || row.cost}`);",
    );
    const answer = answerOf(recordedFrame());
    pinCellsApart(SURFACE.performancePanel(answer));
    const failure = reddens('rows-separate', () =>
      pinCellsApart(mutant.module.performancePanel(answer)),
    );
    // The row's cost line now holds the component its identity line already holds.
    assert.match(failure.message, /each row must print its own two cells/);
    assert.match(failure.message, new RegExp(`cost: ${APP}`));
  });
});
