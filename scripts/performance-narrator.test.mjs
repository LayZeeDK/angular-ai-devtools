// Tests for extension/performance-narrator.js — the join that turns one frame's recorded work into
// intervals in the order the page recorded them, each with the duration the page measured between
// its start and its matching end, and the two answers it refuses to invent.
//
// The module is evaluated in a bare `node:vm` context; the checkout is never written. Two pins guard
// purity: the context carries no DOM, clock, console or network, and the join is run again in a
// context where every one of those names is a trap, so a module that reached for one is caught
// rather than answered exactly as the clean module is.
//
// The facts are T001's measurements (`research/raw/m040-work-events.json`). Every pair name, every
// event number and every component name a frame below carries is read from that recording — the
// five pair numbers from the installed enum, `_App`/`_Counter`/`RouterOutlet` from the identity
// rows the witness measured, and the two `null`s of a `ChangeDetection` bracket from the pair the
// recording answers as carrying no identity at all. What the recording does not carry is that
// frame-level `at` readings no measurement captured, so each frame's receipt times are constructed
// and only ever compared with themselves (an interval's duration is its end's `at` minus its
// start's).
//
// The states this module can produce are pinned exactly:
//
//   measured       in the order the start events were recorded, named by its own two events, with
//                  the end's measured receipt time minus the start's (E1), including a measured
//                  zero that stays a number (E6).
//   cannot-tell    for an interval whose own two events carry no identity: the named absence
//                  `no-component-identity` and no name — no node index, no list position, no
//                  neighbour's name and no fallback word (E4).
//   unmeasured     for a start the frame never closed: no duration, no endedAt, no name, and never
//                  a value taken from the next event, another frame or a clock (E5).
//   no interval    for a frame the record does not carry: no row is invented to fill one (E2).
//   unresolved     an end with no open start of its own pair, reported by kind, never paired
//                  backwards onto an earlier start (AC6).
//
// Every criterion is proven non-vacuously in four phases: the pin is run against the untouched module
// first, then against a mutually exclusive mutant of the module source which is asserted to exhibit
// the defect the pin hunts, then the pin is asserted to redden on it with a failure message that
// names the defect by string, then the untouched module is pinned again. A mutant that survives its
// pin, or reddens with a message that does not name the defect, fails this suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/performance-narrator.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m040-work-events.json', import.meta.url),
    'utf8',
  ),
);

// ---------------------------------------------------------- measured facts ----

/** The five pairs, by the numbers the recording derived from the installed `ProfilerEvent`. */
const PAIRS = new Map(
  RECORDING.pairs.sources[1].pairs.map((pair) => [pair.label, pair]),
);

/** The page whose per-pair witness rows name the identity each end of each pair carried. */
const WITNESSED = RECORDING.witness.pages[0].url;

/** One pair's identity row, as the recording measured it. */
function identity(label) {
  return RECORDING.identity.perPair.find((pair) => pair.label === label);
}

/** The instance names one side of one pair carried on the witnessed page. */
function instances(label, side) {
  return identity(label).witness[WITNESSED][side];
}

/** `_App` and `_Counter`: the two component names a `TemplateUpdate` bracket measured. */
const APP = instances('TemplateUpdate', 'startInstance')[0];
const COUNTER = instances('TemplateUpdate', 'startInstance')[1];
/** `RouterOutlet`: the directive name a `LifecycleHook` bracket measured. */
const ROUTER_OUTLET = instances('LifecycleHook', 'startInstance')[0];
/** `_Counter`: the name a `ComponentEnd` measured, which is where a Component bracket is named. */
const COMPONENT_END = instances('Component', 'endInstance')[0];

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
 * and every other field is one the join must ignore.
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

/** The key sets an answer, and each kind of interval, may carry — and the whole of what one may. */
const ANSWER_KEYS = ['intervals', 'state', 'unresolved'];
const ANSWER_WITH_ABSENCE_KEYS = [
  'absence',
  'intervals',
  'state',
  'unresolved',
];
const MEASURED_KEYS = [
  'componentName',
  'durationMs',
  'endedAt',
  'pair',
  'startedAt',
  'state',
];
const CANNOT_TELL_KEYS = ['absence', 'pair', 'startedAt', 'state'];
const UNMEASURED_KEYS = ['pair', 'startedAt', 'state'];

// ---------------------------------------------------------------- plumbing ----

/**
 * The standalone module: a bare context holding the source and whatever the caller puts in it. A
 * bare `node:vm` context installs no DOM and no network; the two names it does install in every realm
 * (`Date`, `console`) are handled by the guarded run below.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const api = context.angularAiPerformanceNarrator;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(typeof api.narrate, 'function', 'the module publishes the join');
  return { api, context };
}

function pristineApi() {
  return standalone().api;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into this realm
 * before a structural assertion reads it. It is also how every frame is cloned, so a test can never
 * mutate a fixture for the next one.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One answer, copied into this realm. */
function answerOf(api, fact) {
  return clone(api.narrate(fact));
}

/** The keys an object carries, in the one order an assertion can compare. */
function keysOf(value) {
  return Object.keys(value).sort();
}

/** No string in `value` is one of `forbidden`, and the failure names which one was found. */
function assertNoneOf(value, forbidden, what) {
  const text = JSON.stringify(value);
  for (const [name, needle] of forbidden) {
    assert.equal(
      text.includes(needle),
      false,
      `${what} carries ${name} (${JSON.stringify(needle)}), which it must not: ${text}`,
    );
  }
}

// ------------------------------------------------------------- mutant tools ----

/**
 * A copy of the module with one anchored replacement applied. The anchor must occur exactly once, so
 * a mutation cannot silently rewrite a different branch, and the result must differ from the source,
 * so a no-op mutation is a failure rather than a green mutant.
 */
function mutant(anchor, replacement) {
  assert.ok(
    SRC.includes(anchor),
    `mutation anchor not found in extension/performance-narrator.js — restate the bite: ${JSON.stringify(anchor)}`,
  );
  const occurrences = SRC.split(anchor).length - 1;
  assert.equal(
    occurrences,
    1,
    `mutation anchor must occur exactly once, found ${occurrences}: ${JSON.stringify(anchor)}`,
  );
  const mutated = SRC.replace(anchor, replacement);
  assert.notEqual(mutated, SRC, 'the mutation must change the module source');
  return standalone(mutated).api;
}

/** A pin that a value reddens: returns the failure the pin raises on it. */
function reddens(pin, what) {
  let failure = null;
  try {
    pin();
  } catch (error) {
    failure = error;
  }
  assert.ok(
    failure instanceof Error,
    `${what} passed on the mutant, so the mutation is not caught`,
  );
  return failure;
}

/**
 * The four phases, per criterion. `pin` is the same function for the untouched module and for every
 * mutant; a mutation that survives it, or that reddens with a message not naming its defect, fails.
 * Returns one `mutant -> failure` line per mutation so the run prints its own evidence.
 */
function proveNonVacuous(pin, mutations) {
  // 1. Pin the untouched module on the behaviour claimed.
  pin(pristineApi());

  const caught = [];
  for (const mutation of mutations) {
    // 2. Mutate a copy of the module source and prove the copy exhibits the defect.
    const api = mutant(mutation.anchor, mutation.replacement);
    mutation.defect(api);

    // 3. Assert the pin reddens, and that the failure names the defect by string.
    const failure = reddens(() => pin(api), mutation.what);
    assert.match(
      failure.message,
      mutation.message,
      `${mutation.what} must redden naming the defect ${mutation.message}: ${failure.message}`,
    );
    caught.push(`${mutation.what} -> ${failure.message.split('\n')[0]}`);
  }

  // 4. Restore: the untouched module still satisfies the pin.
  pin(pristineApi());
  return caught;
}

// ----------------------------------------------------------------- fixtures ----

/**
 * Four measured brackets inside one frame, recorded in an arrival order that is not the order any
 * sort would produce: the costs are 1, 0.25 and 0.5 ms and the names are `_App`, `RouterOutlet` and
 * `_Counter`, so sorting by either is visibly different from the recorded order. `Component`'s start
 * carries the `null` the recording measured for it, so its end is the event that names it.
 */
function workFrame() {
  return frame([
    event('TemplateUpdate', false, 10, APP),
    event('LifecycleHook', false, 10.5, ROUTER_OUTLET),
    event('LifecycleHook', true, 10.75, ROUTER_OUTLET),
    event('TemplateUpdate', true, 11, APP),
    event('Component', false, 12, null),
    event('Component', true, 12.5, COMPONENT_END),
  ]);
}

/** A `ChangeDetection` bracket: T001 measured a `null` instance at both of its ends. */
function unnamedFrame() {
  return frame([
    event('TemplateUpdate', false, 10, APP),
    event('TemplateUpdate', true, 11, APP),
    event('ChangeDetection', false, 20, null),
    event('ChangeDetection', true, 21, null),
  ]);
}

/**
 * Two `Component` starts nested inside one synchronous call, closed inner-first: the outer start at
 * 12 is closed by the end at 13.5, and the inner start at 12.25 by the end at 12.5. The recording
 * measured `null` on `ComponentStart` and a name on `ComponentEnd`, so each interval's own events
 * must supply the name.
 */
function nestedFrame() {
  return frame([
    event('Component', false, 12, null),
    event('Component', false, 12.25, null),
    event('Component', true, 12.5, COMPONENT_END),
    event('Component', true, 13.5, APP),
  ]);
}

/** Two starts and no end at all: the frame opened them and closed neither. */
function startsOnlyFrame() {
  return frame([
    event('Component', false, 12, null),
    event('TemplateUpdate', false, 9, APP),
  ]);
}

/** One bracket whose two receipt times are the same reading: a measured zero. */
function sameInstantFrame() {
  return frame([
    event('TemplateUpdate', false, 5, APP),
    event('TemplateUpdate', true, 5, APP),
  ]);
}

// ------------------------------------------------------------------- the pins ----

/**
 * E1, held out. A frame the record carries produces intervals in the order its start events were
 * recorded, each measured interval carrying the identity its own events carry and the difference
 * between its end's and its start's measured receipt times — with nothing sorted by cost, name or
 * node index.
 */
function pinRecordedOrderAndMeasuredDurations(api) {
  const answer = answerOf(api, workFrame());
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'E1 the answer carries the three fields',
  );
  assert.equal(
    answer.state,
    'measured',
    'E1 every interval the frame opened was closed and named',
  );
  assert.deepEqual(
    answer.unresolved,
    [],
    'E1 nothing in this frame is unresolved',
  );

  const recorded = answer.intervals.map((interval) => interval.pair);
  assert.deepEqual(
    recorded,
    ['TemplateUpdate', 'LifecycleHook', 'Component'],
    'E1 the intervals are in the order the start events were recorded',
  );

  // The recorded order is not the order of any sort this module could have applied, so a list
  // rebuilt from a sorted copy would be visible rather than plausible.
  const byCost = answer.intervals
    .slice()
    .sort((left, right) => left.durationMs - right.durationMs)
    .map((interval) => interval.pair);
  assert.notDeepEqual(
    recorded,
    byCost,
    'E1 the recorded order is not the cost order, so a sort by cost would be visible',
  );
  const byName = answer.intervals
    .slice()
    .sort((left, right) =>
      left.componentName.localeCompare(right.componentName),
    )
    .map((interval) => interval.pair);
  assert.notDeepEqual(
    recorded,
    byName,
    'E1 the recorded order is not the name order, so a sort by name would be visible',
  );

  const [template, lifecycle, component] = answer.intervals;

  assert.deepEqual(
    keysOf(template),
    MEASURED_KEYS,
    'E1 a measured interval carries exactly the six contract fields',
  );
  assert.equal(template.state, 'measured', 'E1 the state of a closed interval');
  assert.equal(
    template.componentName,
    APP,
    'E1 an interval is named by the component name its own start event carried',
  );
  assert.equal(
    template.startedAt,
    10,
    'E1 the start is the recorded receipt time',
  );
  assert.equal(template.endedAt, 11, 'E1 the end is the recorded receipt time');
  assert.equal(
    template.durationMs,
    template.endedAt - template.startedAt,
    'E1 the duration is the end’s measured receipt time minus its start’s',
  );

  assert.deepEqual(
    keysOf(lifecycle),
    MEASURED_KEYS,
    'E1 every measured interval carries the same six fields',
  );
  assert.equal(
    lifecycle.componentName,
    ROUTER_OUTLET,
    'E1 the second bracket’s own name',
  );
  assert.equal(
    lifecycle.durationMs,
    10.75 - 10.5,
    'E1 the second bracket’s own measured difference',
  );

  assert.equal(
    component.componentName,
    COMPONENT_END,
    'E1 a Component interval is named by its end, because its start measured no component',
  );
  assert.equal(
    component.durationMs,
    12.5 - 12,
    'E1 a Component bracket’s own measured difference',
  );

  // The same frame answered twice is byte-identical: no clock, no sort over a set, no state.
  assert.equal(
    JSON.stringify(answerOf(api, workFrame())),
    JSON.stringify(answer),
    'E1 the same frame answered twice is byte-identical text',
  );
  return answer;
}

/**
 * E2, held out. A work event the frame does not carry contributes no interval, and no interval is
 * invented to fill a row: an empty frame, a frame whose events list the module cannot read and a
 * frame holding one pair all answer only what they hold.
 */
function pinNoInventedInterval(api) {
  const empty = answerOf(api, frame([]));
  assert.deepEqual(
    empty.intervals,
    [],
    'E2 an empty frame carries no interval',
  );
  assert.deepEqual(empty.unresolved, [], 'E2 an empty frame resolves nothing');
  assert.deepEqual(
    keysOf(empty),
    ANSWER_WITH_ABSENCE_KEYS,
    'E2 an empty frame answers the three fields and the absence it names',
  );
  assert.equal(
    empty.state,
    api.CANNOT_TELL,
    'E2 an empty frame is cannot-tell',
  );
  assert.equal(
    empty.absence,
    'no-start-events',
    'E2 the absence names what the frame lacks: a start event',
  );

  // A frame carrying one bracket reports that bracket and no other pair.
  const one = answerOf(
    api,
    frame([
      event('TemplateUpdate', false, 10, APP),
      event('TemplateUpdate', true, 11, APP),
    ]),
  );
  assert.deepEqual(
    one.intervals.map((interval) => interval.pair),
    ['TemplateUpdate'],
    'E2 a frame carrying one pair reports one interval and invents no row for the other four',
  );

  // A frame the module cannot read is cannot-tell with a named absence, which is not an empty frame.
  for (const [what, unreadable] of [
    ['no frame at all', null],
    ['a frame that is not an object', 'frame'],
    ['a frame with no events list', { cycleId: 1 }],
    ['a frame whose events list is not a list', { events: 'work' }],
  ]) {
    const answer = answerOf(api, unreadable);
    assert.deepEqual(answer.intervals, [], `E2 ${what} produces no interval`);
    assert.equal(
      answer.state,
      api.CANNOT_TELL,
      `E2 ${what} is cannot-tell rather than a measured empty answer`,
    );
    assert.equal(
      answer.absence,
      'frame-unreadable',
      `E2 ${what} names the absence the frame forced`,
    );
  }

  // An entry the join cannot read contributes nothing: neither an interval nor an unresolved end.
  const unreadableEntries = answerOf(
    api,
    frame([
      {},
      null,
      'TemplateUpdateStart',
      { pair: 'TemplateUpdate', end: false, at: '10', componentName: APP },
      { pair: '', end: true, at: 11, componentName: APP },
    ]),
  );
  assert.deepEqual(
    unreadableEntries.intervals,
    [],
    'E2 an entry with no pair, no end bit or no measured receipt time is not minted into a row',
  );
  assert.deepEqual(
    unreadableEntries.unresolved,
    [],
    'E2 an unreadable entry is not reported as an unresolved end either',
  );
  return [empty, one];
}

/**
 * E4, held out. An interval whose own two events carry no identity answers cannot-tell with the
 * named absence `no-component-identity` and names no component — no node index, no list position, no
 * neighbouring name and no fallback word.
 */
function pinUnnamedIntervalIsCannotTell(api) {
  const answer = answerOf(api, unnamedFrame());
  assert.equal(
    answer.intervals.length,
    2,
    'E4 one interval per recorded start',
  );
  const unnamed = answer.intervals[1];
  assert.deepEqual(
    keysOf(unnamed),
    CANNOT_TELL_KEYS,
    'E4 a cannot-tell interval carries the four contract fields and no name and no cost',
  );
  assert.equal(
    unnamed.state,
    api.CANNOT_TELL,
    'E4 the state of an unnamed interval',
  );
  assert.equal(
    unnamed.absence,
    'no-component-identity',
    'E4 the absence is the named one the page measured',
  );
  assert.equal(
    unnamed.pair,
    'ChangeDetection',
    'E4 the interval still names the pair it brackets',
  );
  assert.equal(
    unnamed.startedAt,
    20,
    'E4 the start is the recorded receipt time',
  );

  // Nothing in the unnamed interval is a name, a position, a neighbour or a fallback word: not the
  // component names this very frame carries elsewhere, and no other string at all.
  assertNoneOf(
    unnamed,
    [
      ['a neighbouring name', APP],
      ['a neighbouring name', COUNTER],
      ['a neighbouring name', ROUTER_OUTLET],
    ],
    'E4 the unnamed interval',
  );
  assert.deepEqual(
    Object.keys(unnamed)
      .filter((key) => key !== 'pair' && key !== 'absence')
      .map((key) => unnamed[key])
      .filter(
        (value) =>
          typeof value === 'string' &&
          value !== api.MEASURED &&
          value !== api.CANNOT_TELL &&
          value !== api.UNMEASURED &&
          value !== api.NO_COMPONENT_IDENTITY,
      ),
    [],
    'E4 an unnamed interval carries no string a caller could read as a name — no list position, no neighbour’s name and no fallback word',
  );
  assert.equal(
    'componentName' in unnamed,
    false,
    'E4 an unnamed interval carries no componentName field at all',
  );
  assert.equal(
    'durationMs' in unnamed,
    false,
    'E4 an unnamed interval carries no cost a caller could read as measured',
  );

  // A frame whose only interval is unnamed says so at its own level too.
  const onlyUnnamed = answerOf(
    api,
    frame([
      event('ChangeDetection', false, 20, null),
      event('ChangeDetection', true, 21, null),
    ]),
  );
  assert.equal(
    onlyUnnamed.state,
    api.CANNOT_TELL,
    'E4 a frame holding only unnamed work is cannot-tell',
  );
  assert.equal(
    onlyUnnamed.absence,
    'no-component-identity',
    'E4 the frame names the same absence the interval names',
  );
  return answer;
}

/**
 * E5, held out. A start with no matching end in the frame is unmeasured and carries no duration,
 * never a value taken from the next event, a reconstructed time or a clock the join reads — and a
 * start whose end lives in another frame is unmeasured in its own frame, never paired across.
 */
function pinUnclosedStartIsUnmeasured(api) {
  // Both starts, in the order the frame recorded them — which is not their order in time.
  const open = answerOf(api, startsOnlyFrame());
  assert.equal(
    open.state,
    api.UNMEASURED,
    'E5 a frame with an open start is unmeasured',
  );
  assert.deepEqual(
    open.intervals.map((interval) => interval.pair),
    ['Component', 'TemplateUpdate'],
    'E5 the intervals are in recorded start order, not in time order',
  );
  for (const interval of open.intervals) {
    assert.deepEqual(
      keysOf(interval),
      UNMEASURED_KEYS,
      'E5 an unmeasured interval carries the three contract fields and nothing else',
    );
    assert.equal(
      interval.state,
      api.UNMEASURED,
      'E5 the state of a start the frame never closed',
    );
    assert.equal(
      'durationMs' in interval,
      false,
      'E5 an unmeasured interval carries no duration at all',
    );
    assert.equal(
      'endedAt' in interval,
      false,
      'E5 an unmeasured interval carries no end time',
    );
    assert.equal(
      'componentName' in interval,
      false,
      'E5 an unmeasured interval names no component, not even the one its start carried',
    );
  }
  assert.equal(
    open.intervals[1].startedAt,
    9,
    'E5 the unmeasured interval keeps the receipt time its start carried',
  );

  // The frame that carries only the end is not the frame that carries the start: the end is
  // unresolved, and the start stays unmeasured rather than being paired with it from afar.
  const startFrame = api.narrate(
    frame([event('TemplateUpdate', false, 10, APP)]),
  );
  const endFrame = answerOf(
    api,
    frame([event('TemplateUpdate', true, 11, APP)]),
  );
  assert.equal(
    clone(startFrame).intervals[0].state,
    api.UNMEASURED,
    'E5 a start whose end arrives in a later frame is unmeasured in its own frame',
  );
  assert.deepEqual(
    endFrame.intervals,
    [],
    'E5 the frame holding only the end builds no interval from a start it does not carry',
  );
  assert.deepEqual(
    endFrame.unresolved,
    [{ pair: 'TemplateUpdate', type: PAIRS.get('TemplateUpdate').end.value }],
    'E5 the end is reported by kind as unresolved',
  );
  assert.equal(
    endFrame.state,
    api.CANNOT_TELL,
    'E5 a frame holding no start cannot answer a frame state',
  );
  assert.equal(
    endFrame.absence,
    'no-start-events',
    'E5 the absence names what the frame lacks',
  );
  return [open, endFrame];
}

/**
 * E6, held out. A start and its matching end at the same recorded instant answer a measured zero,
 * not a missing cost.
 */
function pinMeasuredZero(api) {
  const answer = answerOf(api, sameInstantFrame());
  assert.equal(answer.state, 'measured', 'E6 the bracket was closed and named');
  assert.equal(answer.intervals.length, 1, 'E6 one interval for one bracket');
  const interval = answer.intervals[0];
  assert.deepEqual(
    keysOf(interval),
    MEASURED_KEYS,
    'E6 a zero-cost interval is a measured interval, with the six fields',
  );
  assert.equal(
    interval.durationMs,
    0,
    'E6 the difference between the two readings is a measured zero',
  );
  assert.equal(
    typeof interval.durationMs,
    'number',
    'E6 the zero is a number, never a missing cost',
  );
  assert.equal(
    interval.startedAt,
    interval.endedAt,
    'E6 both ends at one instant',
  );
  return answer;
}

/**
 * AC6. An end with no open start is reported by kind as unresolved and is never paired backwards
 * with an earlier start of its own pair; an end belongs to the innermost open start of its pair.
 */
function pinNestingAndUnresolvedEnds(api) {
  // Nested starts of one pair, closed inner-first: last-in-first-out within the pair.
  const nested = answerOf(api, nestedFrame());
  assert.equal(
    nested.state,
    'measured',
    'AC6 both nested brackets were closed',
  );
  const [outer, inner] = nested.intervals;
  assert.equal(
    outer.startedAt,
    12,
    'AC6 the outer start keeps the place it was recorded in',
  );
  assert.equal(
    outer.endedAt,
    13.5,
    'AC6 the end that arrives last closes the outer start, not the inner one',
  );
  assert.equal(
    inner.startedAt,
    12.25,
    'AC6 the inner start keeps the second place',
  );
  assert.equal(
    inner.endedAt,
    12.5,
    'AC6 the first end closes the innermost open start of its own pair',
  );
  assert.equal(
    inner.componentName,
    COMPONENT_END,
    'AC6 the inner interval is named by the end that closed it',
  );
  assert.equal(
    outer.componentName,
    APP,
    'AC6 the outer interval is named by its own end',
  );

  // An end with no open start is unresolved, and a second end is never walked backwards.
  const extra = answerOf(
    api,
    frame([
      event('Component', false, 1, null),
      event('Component', true, 2, COMPONENT_END),
      event('Component', true, 3, APP),
    ]),
  );
  assert.equal(extra.intervals.length, 1, 'AC6 one start builds one interval');
  assert.deepEqual(
    extra.intervals.map((interval) => interval.endedAt),
    [2],
    'AC6 the end that had an open start closed it',
  );
  assert.deepEqual(
    extra.unresolved,
    [{ pair: 'Component', type: PAIRS.get('Component').end.value }],
    'AC6 the end with no open start is reported by kind and by nothing else',
  );

  // An end that precedes every start of its pair is unresolved too, and the start that follows it
  // stays unmeasured rather than being paired backwards.
  const backwards = answerOf(
    api,
    frame([
      event('ChangeDetection', true, 4, null),
      event('ChangeDetection', false, 5, null),
    ]),
  );
  assert.deepEqual(
    backwards.unresolved,
    [{ pair: 'ChangeDetection', type: PAIRS.get('ChangeDetection').end.value }],
    'AC6 an end arriving before its pair’s start is unresolved',
  );
  assert.equal(
    backwards.intervals.length,
    1,
    'AC6 the later start is still one interval',
  );
  assert.equal(
    backwards.intervals[0].state,
    api.UNMEASURED,
    'AC6 the later start is never paired backwards with the earlier end',
  );
  return nested;
}

// -------------------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('the recording derives the five pairs, the identity each end carries and the rule the join obeys', () => {
    // The five pairs and their numbers come from the installed enum, not from this file.
    assert.deepEqual(
      [...PAIRS.keys()],
      [
        'TemplateUpdate',
        'LifecycleHook',
        'ChangeDetection',
        'Component',
        'HostBindingsUpdate',
      ],
    );
    assert.deepEqual(PAIRS.get('ChangeDetection').start, {
      name: 'ChangeDetectionStart',
      value: 12,
    });
    assert.deepEqual(PAIRS.get('ChangeDetection').end, {
      name: 'ChangeDetectionEnd',
      value: 13,
    });

    // What each pair's two ends carry: three carry an instance on both ends, `Component` on its end
    // only, and `ChangeDetection` on neither.
    assert.deepEqual(
      RECORDING.identity.perPair.map((pair) => [
        pair.label,
        pair.carriesIdentity,
      ]),
      [
        ['TemplateUpdate', 'both'],
        ['LifecycleHook', 'both'],
        ['ChangeDetection', 'none'],
        ['Component', 'end-only'],
        ['HostBindingsUpdate', 'both'],
      ],
    );

    // The names this suite's frames carry are the ones the witness measured.
    assert.deepEqual(instances('TemplateUpdate', 'startInstance'), [
      '_App',
      '_Counter',
    ]);
    assert.deepEqual(instances('LifecycleHook', 'startInstance'), [
      'RouterOutlet',
    ]);
    assert.deepEqual(instances('Component', 'endInstance'), [
      '_Counter',
      '_App',
    ]);

    // A `ChangeDetection` bracket measured a null instance at both of its ends, on every witnessed
    // page, which is the absence E4 answers.
    for (const page of RECORDING.witness.pages) {
      const measured = page.pairs.find(
        (pair) => pair.label === 'ChangeDetection',
      );
      assert.deepEqual(measured.startInstance, ['null']);
      assert.deepEqual(measured.endInstance, ['null']);
      assert.ok(
        measured.startCount > 0,
        `the witness saw no ChangeDetection start on ${page.url}`,
      );
    }
    assert.match(
      RECORDING.identity.namedAbsence.evidence,
      /instance = null/,
      'the named absence is the null instance the page measured',
    );
    assert.match(
      RECORDING.identity.namedAbsence.consequence,
      /cannot-tell/,
      'the recording names cannot-tell as the answer for the unnamed pair',
    );

    // The matching rule the join implements is the one the recording states.
    assert.match(
      RECORDING.frames.rule,
      /arrival order/,
      'the recorded rule matches a start and its end by recorded arrival order',
    );
    assert.match(
      RECORDING.frames.rule,
      /measured nesting/,
      'the recorded rule matches by the measured nesting of the two events',
    );
    assert.match(
      RECORDING.frames.rule,
      /unmeasured/,
      'the recorded rule says what a start with no end reports',
    );
    assert.match(
      RECORDING.frames.rule,
      /A duration is never taken from/,
      'the recorded rule forbids a duration taken from anything but the two measured events',
    );

    // The frame the join narrates is the one the agent opens after the task's work began: a start
    // that arrived with no frame open belongs to the frame the task opens later.
    const noFrame = RECORDING.frames.startsWithNoFrame.map(
      (entry) => entry.label,
    );
    assert.ok(
      noFrame.includes('ChangeDetection'),
      'the recording measured a pair whose start arrived with no frame open',
    );
    assert.deepEqual(
      RECORDING.frames.disagreements.map((entry) => entry.label),
      ['Component'],
      'the bracketed call and the agent frame disagree for exactly one pair',
    );
    assert.match(
      RECORDING.frames.disagreements[0].narratorObeys,
      /never paired with an end from another frame/,
      'the recorded disagreement forbids pairing a start with another frame’s end',
    );

    console.log(
      `performance-narrator measurement: ${PAIRS.size} pairs ${[
        ...PAIRS.values(),
      ]
        .map((pair) => `${pair.label} ${pair.start.value}/${pair.end.value}`)
        .join(
          ', ',
        )}; named ${APP}, ${COUNTER}, ${ROUTER_OUTLET}; ChangeDetection both ends null; rule names arrival order, measured nesting and unmeasured`,
    );
  });
});

// -------------------------------------------------------------------------- purity ----

const HOST_GLOBALS = [
  'document',
  'window',
  'console',
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'fetch',
  'XMLHttpRequest',
];

/** A global that throws when read, called or constructed, naming itself in the error. */
function tripwire(name) {
  const reached = () => {
    throw new Error(`the module reached for ${name}`);
  };
  return new Proxy(function tripwire() {}, {
    get: reached,
    set: reached,
    has: reached,
    apply: reached,
    construct: reached,
  });
}

/** Runs the join inside a context where every host global is a trap. */
function guarded(source, fact) {
  const sandbox = { __frame: fact };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context } = standalone(source, sandbox);
  return clone(
    runInContext('angularAiPerformanceNarrator.narrate(__frame)', context),
  );
}

describe('purity', () => {
  it('loads bare, publishes the join and the vocabulary, and answers with every host global a trap', () => {
    const { api, context } = standalone();
    for (const name of [
      'document',
      'window',
      'performance',
      'setTimeout',
      'setInterval',
      'fetch',
      'XMLHttpRequest',
    ]) {
      assert.equal(
        runInContext(`typeof ${name}`, context),
        'undefined',
        `the module must not run with a ${name} in scope`,
      );
    }

    // The published constants are the vocabulary the module emits, so a caller compares words and
    // not prose.
    assert.equal(api.MEASURED, 'measured');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.UNMEASURED, 'unmeasured');
    assert.equal(api.NO_COMPONENT_IDENTITY, 'no-component-identity');
    assert.equal(api.NO_START_EVENTS, 'no-start-events');
    assert.equal(api.FRAME_UNREADABLE, 'frame-unreadable');

    // The traps are armed, and proven armed before anything is asserted through them.
    const traps = createContext({});
    for (const name of HOST_GLOBALS) traps[name] = tripwire(name);
    assert.throws(
      () => runInContext('Date.now()', traps),
      /the module reached for Date/,
      'the Date trap must bite, or the guard is decoration',
    );
    assert.throws(
      () => runInContext('console.log("x")', traps),
      /the module reached for console/,
      'the console trap must bite, or the guard is decoration',
    );

    const answered = guarded(SRC, workFrame());
    assert.equal(
      answered.intervals.length,
      3,
      'the join answers a measured frame while every host global in scope is a trap',
    );
    assert.equal(
      answered.intervals[0].durationMs,
      1,
      'the duration under the traps is the one the frame measured',
    );
    console.log(`performance-narrator guarded: ${JSON.stringify(answered)}`);
  });
});

// ------------------------------------------------ E1: recorded order and durations ----

describe('E1 — the frame’s work in recorded start order with measured durations', () => {
  it('orders by the recorded start events, names each interval by its own events and measures each duration', () => {
    const caught = proveNonVacuous(pinRecordedOrderAndMeasuredDurations, [
      {
        what: 'M1 an interval takes its end from the next event in the frame',
        anchor: '      closed[slot] = closedInterval(starts[slot], entry);',
        replacement:
          '      closed[slot] = closedInterval(\n' +
          '        starts[slot],\n' +
          '        readEntry(events[i + 1]) || entry,\n' +
          '      );',
        message: /E1 the end is the recorded receipt time/,
        defect(api) {
          const answer = answerOf(api, workFrame());
          assert.equal(
            answer.intervals[0].endedAt,
            12,
            'the mutant ends the first interval at the next event instead of at its own end',
          );
          assert.equal(
            answer.intervals[0].durationMs,
            12 - 10,
            'the mutant’s duration is measured from the next event’s receipt time',
          );
        },
      },
      {
        what: 'M2 the list is rebuilt from a copy sorted by cost',
        anchor: '    const frameState = stateOf(intervals);',
        replacement:
          '    intervals.sort(function (left, right) {\n' +
          '      return (left.durationMs || 0) - (right.durationMs || 0);\n' +
          '    });\n' +
          '    const frameState = stateOf(intervals);',
        message:
          /E1 the intervals are in the order the start events were recorded/,
        defect(api) {
          const answer = answerOf(api, workFrame());
          assert.deepEqual(
            answer.intervals.map((interval) => interval.pair),
            ['LifecycleHook', 'Component', 'TemplateUpdate'],
            'the mutant answers the cost order instead of the recorded order',
          );
        },
      },
    ]);
    console.log(`E1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E6 a measured zero stays a measured cost', () => {
    const caught = proveNonVacuous(pinMeasuredZero, [
      {
        what: 'M8 a measured zero is reported as a missing cost',
        anchor: '      durationMs: endedAt - startedAt,',
        replacement: '      durationMs: endedAt - startedAt || null,',
        message:
          /E6 the difference between the two readings is a measured zero/,
        defect(api) {
          const answer = answerOf(api, sameInstantFrame());
          assert.equal(
            answer.intervals[0].durationMs,
            null,
            'the mutant reads the measured zero as falsy and drops the cost',
          );
        },
      },
    ]);
    console.log(`E6 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------ E2: no invented interval ----

describe('E2 — a work event the frame does not carry contributes no interval', () => {
  it('answers only the frame’s own work, and names the absence a frame without work forces', () => {
    const caught = proveNonVacuous(pinNoInventedInterval, [
      {
        what: 'M3 an interval is minted for a frame that carries no start',
        anchor: '    const starts = [];',
        replacement:
          '    const starts = [\n' +
          '      { pair: "TemplateUpdate", startedAt: 0, componentName: null },\n' +
          '    ];',
        message: /E2 an empty frame carries no interval/,
        defect(api) {
          const answer = answerOf(api, frame([]));
          assert.equal(
            answer.intervals.length,
            1,
            'the mutant invents a row for a frame the record does not carry',
          );
          assert.equal(
            answer.intervals[0].pair,
            'TemplateUpdate',
            'the invented row is a pair the frame never recorded',
          );
        },
      },
    ]);
    console.log(`E2 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------ E4: cannot-tell with the absence ----

describe('E4 — an interval with no identity of its own is cannot-tell', () => {
  it('names the absence and never a component, a position, a neighbour or a fallback word', () => {
    const caught = proveNonVacuous(pinUnnamedIntervalIsCannotTell, [
      {
        what: 'M4 an unnamed interval is named by its position in the list',
        anchor: '      closed[slot] = closedInterval(starts[slot], entry);',
        replacement:
          '      const named = closedInterval(starts[slot], entry);\n' +
          '      closed[slot] =\n' +
          '        named.state === CANNOT_TELL\n' +
          '          ? measuredInterval(\n' +
          '              starts[slot].pair,\n' +
          '              "interval " + slot,\n' +
          '              starts[slot].startedAt,\n' +
          '              entry.at,\n' +
          '            )\n' +
          '          : named;',
        message: /E4 a cannot-tell interval carries the four contract fields/,
        defect(api) {
          const answer = answerOf(api, unnamedFrame());
          assert.equal(
            answer.intervals[1].componentName,
            'interval 1',
            'the mutant mints a name out of the interval’s position in the list',
          );
        },
      },
      {
        what: 'M5 an unnamed interval borrows the nearest named neighbour',
        anchor: '      closed[slot] = closedInterval(starts[slot], entry);',
        replacement:
          '      const named = closedInterval(starts[slot], entry);\n' +
          '      closed[slot] = named;\n' +
          '      if (named.state === CANNOT_TELL) {\n' +
          '        for (let back = slot - 1; back >= 0; back -= 1) {\n' +
          '          const earlier = closed[back];\n' +
          '          if (earlier !== undefined && earlier.componentName) {\n' +
          '            closed[slot] = measuredInterval(\n' +
          '              starts[slot].pair,\n' +
          '              earlier.componentName,\n' +
          '              starts[slot].startedAt,\n' +
          '              entry.at,\n' +
          '            );\n' +
          '            break;\n' +
          '          }\n' +
          '        }\n' +
          '      }',
        message: /E4 a cannot-tell interval carries the four contract fields/,
        defect(api) {
          const answer = answerOf(api, unnamedFrame());
          assert.equal(
            answer.intervals[1].componentName,
            APP,
            'the mutant names the unnamed interval after its nearest named neighbour',
          );
        },
      },
      {
        what: 'M6 an unnamed interval is named with the fallback word',
        anchor:
          '    if (name === null) return cannotTellInterval(start.pair, start.startedAt);',
        replacement:
          '    if (name === null)\n' +
          '      return measuredInterval(start.pair, "component", start.startedAt, end.at);',
        message: /E4 a cannot-tell interval carries the four contract fields/,
        defect(api) {
          const answer = answerOf(api, unnamedFrame());
          assert.equal(
            answer.intervals[1].componentName,
            'component',
            'the mutant names the interval with the fallback word the agent refuses to record',
          );
        },
      },
    ]);
    console.log(`E4 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------------------------- E5: unmeasured starts ----

describe('E5 — a start with no matching end is unmeasured', () => {
  it('carries no duration, no end and no name, and is never paired with another frame’s end', () => {
    const caught = proveNonVacuous(pinUnclosedStartIsUnmeasured, [
      {
        what: 'M7 an unclosed start takes a duration from the frame’s last event',
        anchor:
          '        interval === undefined ? unmeasuredInterval(starts[i]) : interval,',
        replacement:
          '        interval === undefined\n' +
          '          ? measuredInterval(\n' +
          '              starts[i].pair,\n' +
          '              null,\n' +
          '              starts[i].startedAt,\n' +
          '              events.length > 0\n' +
          '                ? events[events.length - 1].at\n' +
          '                : starts[i].startedAt,\n' +
          '            )\n' +
          '          : interval,',
        message: /E5 a frame with an open start is unmeasured/,
        defect(api) {
          const answer = answerOf(api, startsOnlyFrame());
          assert.equal(
            answer.intervals[0].state,
            'measured',
            'the mutant answers an unclosed start as a measured interval',
          );
          assert.equal(
            typeof answer.intervals[0].durationMs,
            'number',
            'the mutant gives the unclosed start a duration the frame never measured',
          );
        },
      },
    ]);
    console.log(`E5 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------------------------- AC6: nesting and kinds ----

describe('AC6 — an end closes the innermost open start of its own pair', () => {
  it('never pairs an end backwards, and reports an end with no open start by kind', () => {
    const caught = proveNonVacuous(pinNestingAndUnresolvedEnds, [
      {
        what: 'M9 an end closes the outermost open start of its pair',
        anchor: '      const slot = stack.pop();',
        replacement: '      const slot = stack.shift();',
        message:
          /AC6 the end that arrives last closes the outer start, not the inner one/,
        defect(api) {
          const answer = answerOf(api, nestedFrame());
          assert.equal(
            answer.intervals[0].endedAt,
            12.5,
            'the mutant closes the outer start with the inner bracket’s end',
          );
          assert.equal(
            answer.intervals[1].endedAt,
            13.5,
            'the mutant closes the inner start with the outer bracket’s end',
          );
        },
      },
    ]);
    console.log(`AC6 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ----------------------------------------------------------------- the module itself ----

describe('the module', () => {
  it('carries no import, no DOM, no clock, no console and no network', () => {
    for (const needle of [
      ['im', 'port '].join(''),
      ['req', 'uire('].join(''),
      ['docu', 'ment'].join(''),
      ['win', 'dow.'].join(''),
      ['cons', 'ole.'].join(''),
      ['Date', '.now'].join(''),
      ['fe', 'tch('].join(''),
      ['XMLHttp', 'Request'].join(''),
    ]) {
      assert.equal(
        SRC.includes(needle),
        false,
        `the module carries ${JSON.stringify(needle)}, and it must read the frame it is handed and nothing else`,
      );
    }
  });

  it('republishes in place on a second run in the same world', () => {
    const context = createContext({});
    runInContext(SRC, context);
    const first = context.angularAiPerformanceNarrator;
    runInContext(SRC, context);
    const second = context.angularAiPerformanceNarrator;
    assert.equal(
      first,
      second,
      'a second run must republish the same namespace, so a caller’s reference stays valid',
    );
    assert.equal(typeof second.narrate, 'function');
  });
});
