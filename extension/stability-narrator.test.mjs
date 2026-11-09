// Tests for extension/stability-narrator.js — the join that turns one record's `stability` section
// and one frame's `events` list into whether the app is stable, when it settled, what work it
// repeated, and the absences this milestone answers with.
//
// The module is evaluated in a bare `node:vm` context; the checkout is never written. Two pins guard
// purity: the context carries no DOM, clock, console or network, and the join is run again in a
// context where every one of those names is a trap, so a module that reached for one is caught
// rather than answered exactly as the clean module is.
//
// The facts are T001's measurements (`research/raw/m043-stability.json`). Every record section, every
// reading, every pair name and every component name a fixture below carries is read from that
// recording:
//
//   - the record's own sections — `record.frame` (the frame record's section), `record.snapshot` (the
//     initial snapshot's), `record.settledFrame`, `record.silentFrame`, `record.absentFrame` and
//     `record.afterReset` — are quoted as the recording measured them, so no reading in this file is
//     written by hand.
//   - the repeated work is `repeats.templateUpdate` and `repeats.changeDetection`: one `checks` row
//     holding `[2,3,2,3]` is two `TemplateUpdate` pairs, the same frame carries two
//     `ChangeDetection` pairs, and every one of that pair's four entries recorded
//     `componentName: null` and reached no `checks` row (`inAnyCheckRow: false`). The pair's event
//     numbers are the recording's; a pair whose numbers the recording does not carry is written here
//     with a `null` type, because this join reads no `type` at all and no number is invented for it.
//   - the settle readings are the recording's two: `record.frame` settles at 1008 with an attach
//     reading of 1001 (7 ms), and `transition.subjects['stable-at-attach']` settles *at* attach with
//     `sinceAttachMs: 0` and answers `no-transition-observed`. That last pair of facts is why a page
//     already stable at attach is a settle reading here and never a transition: the recording says so
//     (`transition.alreadyStableAtAttach`), and a reader holding no clock could not say otherwise.
//   - the four absences are the recording's `absences` list and the milestone's `SC4` answer:
//     `no-stability-observable`, `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order`.
//
// The answers this module can produce are pinned exactly:
//
//   stable        the recorded emission's value is `true`, and the presence or absence of a frame
//                 beside it changes nothing (E1).
//   unstable      the recorded emission's value is `false` — and never because a record or a frame
//                 fell silent (E1, E10).
//   cannot-tell   the record names `no-stability-observable`: the token was unreachable, so there is
//                 one named absence and no state word and no zero in its place (E2).
//   idle          no emission was read, or no stability section at all: not a verdict either way
//                 (E10), and a state word the pane was not written for travels through as itself.
//   settle        the record's own `settle.at` minus its `attachAt`, a measured `0` included, or the
//                 named absence with no time field and no interval at all (E3).
//   repeats       one pass per start/end pair the frame's `events` hold, per component, with a
//                 `ChangeDetection` pass attributed to no component and no pass where the frame
//                 recorded none — never a per-view cycle count and never an outstanding-work count
//                 (E5, E6).
//   absences      four distinct named absences, one per unanswered question, none of them a zero
//                 outstanding item, a component name, a call site or a task id (E7, E8).
//
// Every held-out pin is proven non-vacuously in four phases: the pin is run against the untouched
// module first, then against a mutant of the module source which is asserted to exhibit the defect
// the pin hunts, then the pin is asserted to redden on it with a failure message that names the
// defect by string, then the untouched module is pinned again. A mutant that survives its pin, or
// reddens with a message that does not name the defect, fails this suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/stability-narrator.js', import.meta.url),
  'utf8',
);
const AGENT = readFileSync(
  new URL('../extension/agent-main.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m043-stability.json', import.meta.url),
    'utf8',
  ),
);

// ---------------------------------------------------------- measured facts ----

/** The record's own field names, in the order the agent publishes them (T001's `record.keys`). */
const SECTION_KEYS = RECORDING.record.keys;

/** The frame's own field names (T001's `record.frameKeys`), which this join's fixtures reproduce. */
const FRAME_KEYS = RECORDING.record.frameKeys;

/** The record's sections, as the recording measured each of them. */
const SECTIONS = {
  frame: RECORDING.record.frame,
  snapshot: RECORDING.record.snapshot,
  settled: RECORDING.record.settledFrame,
  silent: RECORDING.record.silentFrame,
  absent: RECORDING.record.absentFrame,
  afterReset: RECORDING.record.afterReset,
};

/** The two pairs the recording re-derived from a driven frame's own `events` list. */
const TEMPLATE = RECORDING.repeats.templateUpdate;
const CHANGE = RECORDING.repeats.changeDetection;

/** The order the recording's frame recorded its four `ChangeDetection` and four `TemplateUpdate`. */
const RECORDED_PAIRS = RECORDING.repeats.frameKeys;

/** A page already stable at attach: a settle reading at attach and no transition (T001's subject). */
const AT_ATTACH = RECORDING.transition.subjects['stable-at-attach'];

/** The measured component name the `TemplateUpdate` pairs carry, and the one a `Component` row names. */
const COMPONENT = TEMPLATE.componentNames[0];

/** A creation stack and a task id an app that opted into `provideStabilityDebugging()` would publish. */
const STACK_LINE = 'at _App_Template (app.html:1:1)';
const TASK_ID = 900001;

/** Every named absence the answer can carry, in this milestone's order. */
const ABSENCES = [
  'no-stability-observable',
  'no-cause-reported',
  'no-outstanding-inventory',
  'no-settle-order',
];

/** The three every answer carries, because the page publishes nothing that could fill them. */
const PERMANENT = [
  'no-cause-reported',
  'no-outstanding-inventory',
  'no-settle-order',
];

/** The key sets an answer, a settle reading and a repeat may carry — and the whole of what one may. */
const ANSWER_KEYS = [
  'absence',
  'absences',
  'coreVersion',
  'reading',
  'repeats',
  'settle',
  'state',
  'version',
];
const SETTLE_KEYS = ['at', 'sinceAttachMs', 'state'];
const REPEAT_KEYS = ['componentName', 'pair', 'passes'];
const PANEL_KEYS = [
  'blocks',
  'cells',
  'kind',
  'lines',
  'message',
  'state',
  'text',
];

/**
 * The event numbers each pair's two ends carry. `TemplateUpdate`'s are the recording's own
 * `checkRowEvents` (`[2,3,2,3]` is start, end, start, end); the recording carries no numbers for
 * `ChangeDetection`, and this join reads no `type`, so that pair's are `null` rather than invented.
 */
const TYPES = new Map([
  [
    TEMPLATE.pair,
    { start: TEMPLATE.checkRowEvents[0], end: TEMPLATE.checkRowEvents[1] },
  ],
  [CHANGE.pair, { start: null, end: null }],
]);

// ----------------------------------------------------------------- fixtures ----

/** One recorded work event: the entry shape T002 publishes, with the recording's pair numbers. */
function event(pair, end, at, componentName) {
  const type = TYPES.get(pair);
  assert.ok(type, `the recording derives no ${pair} pair`);
  return {
    type: end ? type.end : type.start,
    pair: pair,
    end: end,
    at: at,
    componentName: componentName === undefined ? null : componentName,
  };
}

/**
 * One frame, shaped like the record the page agent dispatches: the `stability` section and the
 * `events` list are what this join reads, and every other field is one the record carries and the
 * join must ignore.
 */
function frame(section, events, checks) {
  return {
    cycleId: 3,
    startedAt: 0,
    trigger: { kind: 'unknown', listenerName: null },
    zoneMode: 'zoneless',
    events: events === undefined ? [] : events,
    routerEvents: [],
    boundary: {},
    stability: section,
    checks: checks === undefined ? [] : checks,
  };
}

/** One `TemplateUpdate` start/end pair over the component the recording measured. */
function templatePair(at) {
  return [
    event(TEMPLATE.pair, false, at, COMPONENT),
    event(TEMPLATE.pair, true, at + 1, COMPONENT),
  ];
}

/** One `ChangeDetection` pair: every recorded entry of that pair carries a null component. */
function changePair(at) {
  return [
    event(CHANGE.pair, false, at, null),
    event(CHANGE.pair, true, at + 1, null),
  ];
}

/** Two `TemplateUpdate` pairs, as the recording's single `checks` row holds them. */
function twoTemplatePairs() {
  return [...templatePair(10), ...templatePair(12)];
}

/** The frame the recording's own `frameKeys` order describes: two `ChangeDetection`, two `TemplateUpdate`. */
function measuredWork() {
  return [
    ...changePair(20),
    ...changePair(22),
    ...templatePair(10),
    ...templatePair(12),
  ];
}

/** Work the frame recorded long after attach: no settle time may ever be taken from it. */
function lateWork() {
  return templatePair(4000);
}

/** The `checks` row the recording measured: one row carrying two `TemplateUpdate` pairs. */
function measuredChecksRow() {
  return { componentName: COMPONENT, events: TEMPLATE.checkRowEvents.slice() };
}

/** The section a page already stable at attach publishes, built from the recording's own subject. */
function atAttachSection() {
  return {
    reachedBy: SECTIONS.frame.reachedBy,
    absence: null,
    attachAt: AT_ATTACH.settle.at,
    reading: AT_ATTACH.reading,
    settle: { state: AT_ATTACH.settle.state, at: AT_ATTACH.settle.at },
    version: SECTIONS.frame.version,
    coreVersion: SECTIONS.frame.coreVersion,
  };
}

// ---------------------------------------------------------------- plumbing ----

/** The module with its comments removed, so a token scan reads code and not prose. */
function code(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

const CODE = code(SRC);

/**
 * The standalone module: a bare context holding the source and whatever the caller puts in it. A
 * bare `node:vm` context installs no DOM and no network; the two names it does install in every realm
 * (`Date`, `console`) are handled by the guarded run below.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const api = context.angularAiStabilityNarrator;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(
    typeof api.stability,
    'function',
    'the module publishes the join',
  );
  assert.equal(
    typeof api.stabilityPanel,
    'function',
    'the module publishes the pane',
  );
  return { api, context };
}

function pristineApi() {
  return standalone().api;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into this realm
 * before a structural assertion reads it. It is also how every fixture is cloned, so a test can never
 * mutate one for the next.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One answer, copied into this realm. */
function answerOf(api, record) {
  return clone(api.stability(record));
}

/** One pane answer, copied into this realm. */
function panelOf(api, answer) {
  return clone(api.stabilityPanel(answer));
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
    `mutation anchor not found in extension/stability-narrator.js — restate the bite: ${JSON.stringify(anchor)}`,
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

/**
 * The mutation that makes a frame's silence the verdict: a record that recorded no work is answered
 * `stable` whatever its emission said. It serves E1 (the verdict must not move with the frame beside
 * it) and E10 (silence alone must never become stability), each with its own pin and message.
 */
function frameSilenceDecides(what, message) {
  return {
    what: what,
    anchor: '    const state = stateOf(section, reading);',
    replacement:
      '    const state =\n' +
      '      eventsOf(record).length === 0\n' +
      '        ? { state: STABLE, absence: null }\n' +
      '        : stateOf(section, reading);',
    message: message,
    defect(api) {
      const answer = answerOf(api, frame(SECTIONS.snapshot, []));
      assert.equal(
        answer.state,
        'stable',
        'the mutant answers a frame with no recorded work as stable, whatever the emission said',
      );
    },
  };
}

// ------------------------------------------------------------------- the pins ----

/**
 * E1, held out. The state is the recorded emission's value and nothing else: an emission of `false`
 * is unstable and one of `true` is stable, with a frame carrying work beside it or with no frame at
 * all, and the answer names the emission it read and the page's own reading of it.
 */
function pinTheEmissionDecidesTheState(api) {
  const unstable = answerOf(api, frame(SECTIONS.snapshot, twoTemplatePairs()));
  assert.deepEqual(
    keysOf(unstable),
    ANSWER_KEYS,
    'E1 the answer carries exactly the contract fields',
  );
  assert.equal(
    unstable.state,
    api.UNSTABLE,
    'E1 an emission of false is unstable',
  );
  assert.deepEqual(
    unstable.reading,
    SECTIONS.snapshot.reading,
    'E1 the answer names the emission it read and the page’s own reading',
  );
  assert.equal(
    unstable.absence,
    null,
    'E1 a state read from an emission carries no absence of its own',
  );

  // The same emission with no frame beside it: the same verdict and the same reading.
  const bare = answerOf(api, { stability: SECTIONS.snapshot });
  assert.equal(
    bare.state,
    api.UNSTABLE,
    'E1 an emission of false is unstable whatever the frame beside it',
  );
  assert.deepEqual(
    bare.reading,
    unstable.reading,
    'E1 the reading is the record’s own, with or without a frame',
  );

  // An emission of true, with no work recorded at all beside it: stable.
  const stable = answerOf(api, frame(SECTIONS.frame, []));
  assert.equal(stable.state, api.STABLE, 'E1 an emission of true is stable');
  assert.equal(
    stable.reading.value,
    true,
    'E1 the value the answer names is the emission’s own',
  );
  const stableBare = answerOf(api, { stability: SECTIONS.frame });
  assert.equal(
    stableBare.state,
    api.STABLE,
    'E1 an emission of true is stable whatever the frame beside it',
  );

  // The same record answered twice is byte-identical: no clock, no state between calls.
  assert.equal(
    JSON.stringify(answerOf(api, frame(SECTIONS.snapshot, twoTemplatePairs()))),
    JSON.stringify(unstable),
    'E1 the same record answered twice is byte-identical text',
  );
  return [unstable, stable];
}

/**
 * E2, held out. A page with no reachable `ApplicationRef` and a page whose `isStable` could not be
 * subscribed each answer `cannot-tell` with the single named absence `no-stability-observable`: no
 * state word beside it, no zero standing in for it, and the two causes are one absence rather than a
 * count.
 */
function pinUnreachableTokenIsOneAbsence(api) {
  const answers = [];
  for (const [what, section] of [
    ['a page with no reachable ApplicationRef', SECTIONS.absent],
    ['a page whose isStable could not be subscribed', SECTIONS.afterReset],
  ]) {
    const answer = answerOf(api, frame(section, twoTemplatePairs()));
    assert.equal(
      answer.state,
      api.CANNOT_TELL,
      `E2 ${what} is cannot-tell and never unstable`,
    );
    assert.equal(
      answer.absence,
      api.NO_STABILITY_OBSERVABLE,
      `E2 ${what} names the absence the record carries`,
    );
    assert.deepEqual(
      answer.absences,
      [api.NO_STABILITY_OBSERVABLE, ...PERMANENT],
      `E2 ${what} carries the one absence once, with no zero standing in for it`,
    );
    assert.deepEqual(answer.reading, null, `E2 ${what} carries no reading`);
    assert.equal(
      answer.absences.filter((name) => name === api.NO_STABILITY_OBSERVABLE)
        .length,
      1,
      `E2 ${what} names the one absence once rather than counting the two causes`,
    );
    answers.push(answer);
  }

  // The two causes are one absence, and the work the frame recorded does not move with the read.
  assert.deepEqual(
    answers[1].absences,
    answers[0].absences,
    'E2 the two causes are one absence rather than a count',
  );
  assert.deepEqual(
    answers[0].repeats,
    answers[1].repeats,
    'E2 the repeated work is the frame’s own and does not move with the read',
  );

  // The pane renders the absence and no state word beside it.
  const panel = panelOf(api, answers[0]);
  assert.equal(
    panel.cells[api.STABLE],
    '',
    'E2 no state word stands beside the absence: the stable cell is empty',
  );
  assert.equal(
    panel.cells[api.UNSTABLE],
    '',
    'E2 no state word stands beside it: the unstable cell is empty',
  );
  assert.equal(
    panel.cells[api.NO_STABILITY_OBSERVABLE],
    api.ABSENCE_TEXTS[api.NO_STABILITY_OBSERVABLE],
    'E2 the absence renders in its own cell',
  );
  assert.equal(
    panel.text.includes('unstable'),
    false,
    'E2 the rendered absence carries no state word beside it',
  );
  return answers[0];
}

/**
 * E3, held out. The settle time is the difference of two readings the page published — the record's
 * `settle.at` minus its `attachAt` — and of nothing else: a record that never settled answers
 * `no-settle-observed` carrying no time field and no interval, a page already stable at attach
 * answers a settle reading at attach with a measured `0` (a reading, never a transition), and no time
 * in the frame beside it is ever substituted for either.
 */
function pinSettleIsTheRecordsOwnReadings(api) {
  // A record that never settled: the named absence, no time field, no interval.
  const never = answerOf(api, frame(SECTIONS.snapshot, lateWork()));
  assert.deepEqual(
    keysOf(never.settle),
    ['state'],
    'E3 a record that never settled answers no time field and no duration',
  );
  assert.equal(
    never.settle.state,
    api.NO_SETTLE_OBSERVED,
    'E3 the absence is the record’s own word',
  );
  assert.equal(
    'at' in never.settle,
    false,
    'E3 the absence carries no time at all',
  );
  assert.equal(
    'sinceAttachMs' in never.settle,
    false,
    'E3 the absence carries no interval at all',
  );
  assert.equal(
    JSON.stringify(never.settle),
    '{"state":"no-settle-observed"}',
    'E3 the absence is one word and nothing beside it',
  );
  assert.equal(
    never.state,
    api.UNSTABLE,
    'E3 a record with no settle reading still carries the state its emission gave',
  );

  // A page already stable at attach: a settle reading at attach, a measured zero, never the absence.
  const atAttach = answerOf(api, frame(atAttachSection(), lateWork()));
  assert.deepEqual(
    keysOf(atAttach.settle),
    SETTLE_KEYS,
    'E3 a settled reading carries its three fields',
  );
  assert.equal(
    atAttach.settle.state,
    api.SETTLED,
    'E3 a page already stable at attach has a settle reading',
  );
  assert.equal(
    atAttach.settle.at,
    AT_ATTACH.settle.at,
    'E3 the settle time is the record’s own reading',
  );
  assert.equal(
    atAttach.settle.at,
    atAttachSection().attachAt,
    'E3 the settle reading is the attach reading, not a later time taken from the frame',
  );
  assert.equal(
    atAttach.settle.sinceAttachMs,
    0,
    'E3 the interval of a settle at attach is a measured zero',
  );
  assert.equal(
    typeof atAttach.settle.sinceAttachMs,
    'number',
    'E3 the zero is a number, never the absence',
  );
  assert.notEqual(
    atAttach.settle.state,
    api.NO_SETTLE_OBSERVED,
    'E3 a measured zero is never the absence',
  );

  // A settle after attach: the interval is those two readings and nothing else.
  const later = answerOf(api, frame(SECTIONS.settled, lateWork()));
  assert.equal(
    later.settle.at,
    SECTIONS.settled.settle.at,
    'E3 the settle time is the reading the page published',
  );
  assert.equal(
    later.settle.sinceAttachMs,
    SECTIONS.settled.settle.at - SECTIONS.settled.attachAt,
    'E3 the interval is the settle reading minus the attach reading and nothing else',
  );
  assert.equal(
    lateWork()
      .map((entry) => entry.at)
      .includes(later.settle.at),
    false,
    'E3 the settle time is not any time the frame itself recorded',
  );
  return [never, atAttach, later];
}

/**
 * E5, held out. One pass per start/end pair the frame's `events` hold, per component: two
 * `TemplateUpdate` start/end pairs in one row are two passes over that component, one pair is one,
 * and a `ChangeDetection` pair — whose every recorded entry carries `componentName: null` — is a pass
 * attributed to no component.
 */
function pinRepeatedWorkPerComponent(api) {
  const answer = answerOf(
    api,
    frame(SECTIONS.snapshot, measuredWork(), [measuredChecksRow()]),
  );
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'E5 the repeated work is one field of the contract and no count beside it',
  );

  const template = answer.repeats.find(
    (repeat) => repeat.pair === TEMPLATE.pair,
  );
  assert.deepEqual(
    template,
    {
      pair: TEMPLATE.pair,
      componentName: COMPONENT,
      passes: TEMPLATE.starts,
    },
    'E5 two TemplateUpdate start/end pairs in one row are two passes over that component',
  );
  assert.equal(
    template.passes,
    TEMPLATE.inOneCheckRow,
    'E5 the row the recording measured holds two pairs and answers two passes',
  );
  assert.deepEqual(
    keysOf(template),
    REPEAT_KEYS,
    'E5 a repeat carries the pair, the component and the passes and nothing else',
  );

  const change = answer.repeats.find((repeat) => repeat.pair === CHANGE.pair);
  assert.ok(
    change,
    'E5 two ChangeDetection pairs are two passes attributed to no component',
  );
  assert.equal(
    change.passes,
    CHANGE.starts,
    'E5 the ChangeDetection passes are the pair count the recording measured',
  );
  assert.equal(
    change.componentName,
    null,
    'E5 a ChangeDetection pass is attributed to no component',
  );
  assert.equal(
    'componentName' in change,
    true,
    'E5 the absence of a component is recorded, not dropped',
  );

  assert.deepEqual(
    answer.repeats.map((repeat) => repeat.pair),
    [CHANGE.pair, TEMPLATE.pair],
    'E5 the repeats are in the order the frame completed its pairs',
  );

  // One pair is one pass, in the same shape.
  const one = answerOf(
    api,
    frame(SECTIONS.snapshot, templatePair(10), [measuredChecksRow()]),
  );
  assert.deepEqual(
    one.repeats,
    [{ pair: TEMPLATE.pair, componentName: COMPONENT, passes: 1 }],
    'E5 one TemplateUpdate pair is one pass over that component',
  );

  // No per-view cycle count and no outstanding-work count exists anywhere in the answer.
  for (const repeat of answer.repeats) {
    assert.deepEqual(
      keysOf(repeat),
      REPEAT_KEYS,
      'E5 a repeat carries no per-view cycle count',
    );
  }
  assertNoneOf(
    answer,
    [
      ['a per-view cycle count', '"cycles"'],
      ['an outstanding-work count', '"outstanding"'],
    ],
    'E5 the answer',
  );
  return answer;
}

/**
 * E6, held out. A frame that recorded no paired work reports no pass at all: no row is invented for
 * an empty frame, a `checks` row is not a pass count, a start with no end and an end with no start
 * are each no pass, and the absence of a frame never becomes a pass count or an outstanding count.
 */
function pinNoPairedWork(api) {
  const empty = answerOf(api, frame(SECTIONS.snapshot, []));
  assert.deepEqual(
    empty.repeats,
    [],
    'E6 a frame that recorded no paired work reports no pass at all',
  );
  assert.deepEqual(
    keysOf(empty),
    ANSWER_KEYS,
    'E6 an empty frame still answers the whole contract',
  );

  const checksOnly = answerOf(
    api,
    frame(SECTIONS.snapshot, [], [measuredChecksRow()]),
  );
  assert.deepEqual(
    checksOnly.repeats,
    [],
    'E6 a checks row is not a pass count: the work is read from the frame’s events',
  );

  const halfOpen = answerOf(
    api,
    frame(SECTIONS.snapshot, [event(TEMPLATE.pair, false, 10, COMPONENT)]),
  );
  assert.deepEqual(
    halfOpen.repeats,
    [],
    'E6 a start with no end in the frame is no pass',
  );

  const orphan = answerOf(
    api,
    frame(SECTIONS.snapshot, [event(TEMPLATE.pair, true, 11, COMPONENT)]),
  );
  assert.deepEqual(
    orphan.repeats,
    [],
    'E6 an end with no start in the frame is no pass',
  );

  const unreadable = answerOf(
    api,
    frame(SECTIONS.snapshot, [{}, null, { pair: '' }, { pair: 'X' }]),
  );
  assert.deepEqual(
    unreadable.repeats,
    [],
    'E6 an entry the join cannot read contributes no pass',
  );

  assertNoneOf(
    empty,
    [
      ['an outstanding-work count', '"outstanding"'],
      ['a per-view cycle count', '"cycles"'],
      ['a pass total', '"total"'],
    ],
    'E6 the answer',
  );
  return empty;
}

/**
 * E7, held out. `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order` and
 * `no-stability-observable` stay four distinct absences, one per unanswered question, each rendering
 * in its own cell under its own name, and none of them ever answers zero outstanding items.
 */
function pinTheFourAbsencesStayDistinct(api) {
  const answer = answerOf(api, frame(SECTIONS.absent, []));
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'E7 the answer carries exactly the contract fields and no cause',
  );
  assert.deepEqual(
    answer.absences,
    ABSENCES,
    'E7 the four absences are four distinct names in one order',
  );
  for (const name of ABSENCES) {
    assert.equal(
      answer.absences.filter((listed) => listed === name).length,
      1,
      `E7 ${name} is named once rather than counted`,
    );
  }

  const panel = panelOf(api, answer);
  for (const name of ABSENCES) {
    assert.equal(
      panel.cells[name],
      api.ABSENCE_TEXTS[name],
      `E7 ${name} renders in its own cell under its own name`,
    );
    for (const other of ABSENCES) {
      if (other === name) continue;
      assert.equal(
        api.ABSENCE_TEXTS[name].includes(other),
        false,
        `E7 the ${name} sentence carries no other absence’s name`,
      );
    }
  }
  const sentences = ABSENCES.map((name) => api.ABSENCE_TEXTS[name]);
  assert.equal(
    new Set(sentences).size,
    sentences.length,
    'E7 no two absences share one sentence',
  );
  assert.equal(
    /0 outstanding|zero outstanding|outstanding: 0|items: 0|an empty list/.test(
      panel.text,
    ),
    false,
    'E7 no absence renders as zero outstanding items or an empty list',
  );
  assert.equal(
    /^cause: /m.test(panel.text),
    false,
    'E7 no absence renders a cause in its place',
  );

  // The permanent three are named on every answer; the fourth only where the read was unreachable.
  const stable = answerOf(api, frame(SECTIONS.frame, []));
  assert.deepEqual(
    stable.absences,
    PERMANENT,
    'E7 the permanent three are named on every answer',
  );
  const stablePanel = panelOf(api, stable);
  assert.equal(
    stablePanel.cells[api.NO_STABILITY_OBSERVABLE],
    '',
    'E7 an absence the read did not force renders as the empty string',
  );
  return answer;
}

/**
 * E8, held out. An app that opted into `provideStabilityDebugging()` publishes a creation stack to
 * the console and a task id to no API: the answer takes no component name, no call site and no task
 * id from either, and it stays `no-outstanding-inventory` rather than listing what it was given.
 */
function pinNoCauseFromANeighbouringField(api) {
  const record = frame(SECTIONS.snapshot, measuredWork(), [
    measuredChecksRow(),
  ]);
  record.stabilityDebugging = {
    optedIn: true,
    thresholdMs: 9000,
    creationStack: [STACK_LINE],
    taskIds: [TASK_ID],
  };

  const answer = answerOf(api, record);
  assert.deepEqual(
    keysOf(answer),
    ANSWER_KEYS,
    'E8 the answer carries no cause, no owner, no call site and no task id',
  );
  assert.equal(
    answer.absences.includes(api.NO_OUTSTANDING_INVENTORY),
    true,
    'E8 an opted-in app’s answer stays no-outstanding-inventory',
  );
  assert.deepEqual(
    answer.absences,
    PERMANENT,
    'E8 the opted-in fields fill no absence and add none',
  );

  const text = JSON.stringify(answer);
  assert.equal(
    text.includes(STACK_LINE),
    false,
    'E8 no call site from the opted-in creation stack',
  );
  assert.equal(
    text.includes(String(TASK_ID)),
    false,
    'E8 no task id and no count of them',
  );
  assert.equal(
    text.includes('9000'),
    false,
    'E8 no threshold and no epoch delta stands in for a cause',
  );
  const withoutWork = JSON.stringify({ ...answer, repeats: [] });
  assert.equal(
    withoutWork.includes(COMPONENT),
    false,
    'E8 no component name outside the repeated work the frame itself recorded',
  );

  const panel = panelOf(api, answer);
  assert.equal(
    panel.cells[api.NO_CAUSE_REPORTED],
    api.ABSENCE_TEXTS[api.NO_CAUSE_REPORTED],
    'E8 the pane renders no-cause-reported in its own cell',
  );
  assert.equal(
    panel.text.includes(STACK_LINE),
    false,
    'E8 the pane prints no creation stack',
  );
  assert.equal(
    /^owner: |^cause: /.test(panel.text),
    false,
    'E8 the pane prints no owner line and no cause line',
  );
  assert.equal(
    panel.text.includes(String(TASK_ID)),
    false,
    'E8 the pane prints no task id',
  );
  return answer;
}

/**
 * E10, held out. The same silent record read twice answers the same state and the same measurement,
 * silence alone never turns a `cannot-tell` into `stable` and never turns a record that recorded
 * nothing into `unstable`, and a state word the pane was not written for travels through as itself.
 */
function pinSilenceIsNotStability(api) {
  const record = frame(SECTIONS.absent, []);
  const first = answerOf(api, record);
  assert.equal(
    first.state,
    api.CANNOT_TELL,
    'E10 silence never turns cannot-tell into stable',
  );
  assert.equal(
    first.absence,
    api.NO_STABILITY_OBSERVABLE,
    'E10 the record’s own absence is the answer’s',
  );
  assert.deepEqual(
    first.reading,
    null,
    'E10 no reading is invented for a record that published none',
  );
  assert.deepEqual(
    first.repeats,
    [],
    'E10 no work is invented for a frame that recorded none',
  );

  const second = answerOf(api, record);
  assert.equal(
    JSON.stringify(second),
    JSON.stringify(first),
    'E10 the same silent record read twice is byte-identical text',
  );

  // A record whose stream never emitted is idle: not stable and not unstable.
  const silent = answerOf(api, frame(SECTIONS.silent, []));
  assert.equal(
    silent.state,
    api.IDLE,
    'E10 a record that recorded nothing is not unstable',
  );
  assert.deepEqual(
    silent.reading,
    null,
    'E10 a silent record carries no reading',
  );
  assert.deepEqual(
    silent.settle,
    { state: api.NO_SETTLE_OBSERVED },
    'E10 a silent record measures no settle time',
  );

  // A record with no stability section at all is idle rather than stable.
  const none = answerOf(api, frame(null, []));
  assert.equal(
    none.state,
    api.IDLE,
    'E10 a record with no stability section is idle rather than stable',
  );
  assert.deepEqual(
    none.absences,
    PERMANENT,
    'E10 a record with no stability read still carries the three permanent absences',
  );
  assert.equal(
    JSON.stringify(answerOf(api, frame(null, []))),
    JSON.stringify(none),
    'E10 a record with no stability section read twice is byte-identical text',
  );

  // A state word the pane was not written for travels through rather than being coerced.
  const panel = panelOf(api, { ...first, state: 'hibernating' });
  assert.deepEqual(
    keysOf(panel),
    PANEL_KEYS,
    'E10 the pane always answers the seven contract fields',
  );
  assert.equal(
    panel.state,
    'hibernating',
    'E10 a state word the reader was not written for travels through',
  );
  assert.deepEqual(
    panel.lines,
    ['state: hibernating'],
    'E10 and it renders that word and nothing else',
  );
  assert.equal(
    panel.text.includes('stable'),
    false,
    'E10 the unknown word is never coerced into a neighbouring one',
  );
  return [first, silent, none];
}

// ----------------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('the recording carries the record’s field names, the readings and the repeated work this join reads', () => {
    // The record's own field names are T001's, and the shipped agent publishes the section under
    // them — a reader written against a section the agent does not write reddens here, not in a
    // browser.
    assert.deepEqual(SECTION_KEYS, [
      'reachedBy',
      'absence',
      'attachAt',
      'reading',
      'settle',
      'version',
      'coreVersion',
    ]);
    for (const key of SECTION_KEYS) {
      assert.ok(
        AGENT.includes(`${key}:`),
        `extension/agent-main.js publishes no ${key} on its stability section`,
      );
    }
    assert.equal(
      AGENT.includes('stability: stabilityField(),'),
      true,
      'the agent publishes the stability section beside its other record fields',
    );

    // The frame this suite builds is the record's own shape, in the record's own order.
    assert.deepEqual(
      Object.keys(frame(SECTIONS.snapshot, [])),
      FRAME_KEYS,
      'the fixture frame carries exactly the record’s keys, in the record’s order',
    );
    assert.ok(
      FRAME_KEYS.includes('events'),
      'the frame carries the events list this join reads',
    );
    assert.ok(
      FRAME_KEYS.includes('checks'),
      'the frame carries the checks rows this join never reads',
    );

    // The readings are the recording's: one emission of false at attach, one settle after it.
    assert.equal(SECTIONS.snapshot.reading.value, false);
    assert.equal(SECTIONS.snapshot.settle.state, 'no-settle-observed');
    assert.equal(SECTIONS.frame.reading.value, true);
    assert.equal(SECTIONS.frame.attachAt, 1001);
    assert.equal(SECTIONS.frame.settle.at, 1008);
    assert.equal(SECTIONS.settled.reading.at, SECTIONS.settled.settle.at);

    // The transition the recording could not produce, and the reading it did measure instead.
    assert.equal(RECORDING.transition.answer, 'no-transition-observed');
    assert.equal(RECORDING.transition.producedOnAnInspectedPage, false);
    assert.equal(AT_ATTACH.settle.sinceAttachMs, 0);
    assert.equal(AT_ATTACH.answer, 'no-transition-observed');
    assert.equal(
      RECORDING.transition.alreadyStableAtAttach.settle.sinceAttachMs,
      0,
    );

    // The repeated work is the recording's: two pairs in one row, and two pairs in no row at all.
    assert.deepEqual(TEMPLATE.checkRowEvents, [2, 3, 2, 3]);
    assert.equal(TEMPLATE.starts, 2);
    assert.equal(TEMPLATE.ends, 2);
    assert.equal(TEMPLATE.inOneCheckRow, 2);
    assert.deepEqual(TEMPLATE.componentNames, [COMPONENT]);
    assert.equal(CHANGE.starts, 2);
    assert.equal(CHANGE.ends, 2);
    assert.equal(CHANGE.nullComponentNames, 4);
    assert.equal(CHANGE.carriesNoInstance, true);
    assert.equal(CHANGE.inAnyCheckRow, false);
    assert.deepEqual(
      measuredWork().map((entry) => entry.pair),
      RECORDED_PAIRS,
      'the fixture frame records four ChangeDetection entries and four TemplateUpdate entries, in the recording’s order',
    );

    // The four absences are this milestone's, and each of them is named by the recording.
    const recording = RECORDING.absences.join('\n');
    assert.match(recording, /carries no reason/);
    assert.match(recording, /Set<number>/);
    assert.match(recording, /per-item order/);
    assert.deepEqual(ABSENCES.slice(0, 1), ['no-stability-observable']);
    assert.deepEqual(PERMANENT, [
      'no-cause-reported',
      'no-outstanding-inventory',
      'no-settle-order',
    ]);

    const api = pristineApi();
    assert.deepEqual(clone(api.ABSENCE_ORDER), ABSENCES);
    assert.deepEqual(clone(api.CELL_NAMES), [
      'unstable',
      'stable',
      'cannot-tell',
      'idle',
      'settled',
      'no-settle-observed',
      'no-stability-observable',
      'no-cause-reported',
      'no-outstanding-inventory',
      'no-settle-order',
    ]);

    console.log(
      `stability-narrator measurement: record keys ${SECTION_KEYS.join(
        ', ',
      )}; frame keys ${FRAME_KEYS.join(', ')}; attach ${SECTIONS.frame.attachAt} settle ${
        SECTIONS.frame.settle.at
      } (${AT_ATTACH.settle.sinceAttachMs} ms at attach); ${TEMPLATE.starts} TemplateUpdate and ${
        CHANGE.starts
      } ChangeDetection pairs, ${CHANGE.nullComponentNames} null component names`,
    );
  });
});

// ----------------------------------------------------------------------- purity ----

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

/** Runs the join and the pane inside a context where every host global is a trap. */
function guarded(source, record) {
  const sandbox = { __record: record };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context } = standalone(source, sandbox);
  return clone(
    runInContext(
      'angularAiStabilityNarrator.stabilityPanel(angularAiStabilityNarrator.stability(__record))',
      context,
    ),
  );
}

describe('purity', () => {
  it('loads bare, publishes the join and the pane, and answers with every host global a trap', () => {
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
    assert.equal(api.UNSTABLE, 'unstable');
    assert.equal(api.STABLE, 'stable');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.IDLE, 'idle');
    assert.equal(api.SETTLED, 'settled');
    assert.equal(api.NO_SETTLE_OBSERVED, 'no-settle-observed');
    assert.equal(api.NO_STABILITY_OBSERVABLE, 'no-stability-observable');
    assert.equal(api.NO_CAUSE_REPORTED, 'no-cause-reported');
    assert.equal(api.NO_OUTSTANDING_INVENTORY, 'no-outstanding-inventory');
    assert.equal(api.NO_SETTLE_ORDER, 'no-settle-order');
    assert.equal(api.VERSION, SECTIONS.frame.version);

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
    assert.throws(
      () => runInContext('performance.now()', traps),
      /the module reached for performance/,
      'the performance trap must bite, or the guard is decoration',
    );

    const record = frame(SECTIONS.frame, measuredWork(), [measuredChecksRow()]);
    const answered = guarded(SRC, record);
    assert.equal(
      answered.state,
      'stable',
      'the join answers a settled record while every host global in scope is a trap',
    );
    assert.equal(
      answered.blocks[1].lines[0],
      `settle: settled at ${SECTIONS.frame.settle.at} ms, ${
        SECTIONS.frame.settle.at - SECTIONS.frame.attachAt
      } ms after attach`,
      'the pane measures that record while every host global in scope is a trap',
    );
    console.log(`stability-narrator guarded: ${JSON.stringify(answered)}`);
  });
});

// ------------------------------------------------ E1: the emission decides the state ----

describe('E1 — the state is the recorded emission and nothing else', () => {
  it('answers unstable for false and stable for true, whichever frame is beside the record', () => {
    const caught = proveNonVacuous(pinTheEmissionDecidesTheState, [
      frameSilenceDecides(
        'M1 the verdict is decided by the frame beside the emission',
        /E1 an emission of false is unstable whatever the frame beside it/,
      ),
    ]);
    console.log(`E1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------- E2: the one named absence ----

describe('E2 — an unreachable stability read is one named absence', () => {
  it('answers cannot-tell with no-stability-observable once, and never a zero or a state word', () => {
    const caught = proveNonVacuous(pinUnreachableTokenIsOneAbsence, [
      {
        what: 'M3 the absence the record named is dropped from the answer’s list',
        anchor: '    return ordered(names);',
        replacement: '    return [];',
        message:
          /E2 a page with no reachable ApplicationRef carries the one absence once/,
        defect(api) {
          const answer = answerOf(api, frame(SECTIONS.absent, []));
          assert.deepEqual(
            answer.absences,
            [],
            'the mutant answers an empty list where the record named an absence',
          );
        },
      },
    ]);
    console.log(`E2 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// --------------------------------------------------- E3: the record’s own readings ----

describe('E3 — the settle time is the difference of two published readings', () => {
  it('answers the record’s own settle reading, a measured zero included, and no time where it named none', () => {
    const caught = proveNonVacuous(pinSettleIsTheRecordsOwnReadings, [
      {
        what: 'M4 a settle time is fabricated from the attach reading',
        anchor:
          '    if (!isObject(settle) || settle.state !== SETTLED) {\n' +
          '      return { state: NO_SETTLE_OBSERVED };\n' +
          '    }',
        replacement:
          '    if (!isObject(settle) || settle.state !== SETTLED) {\n' +
          '      const fabricated = isMeasurement(section.attachAt)\n' +
          '        ? section.attachAt\n' +
          '        : null;\n' +
          '      return {\n' +
          '        state: SETTLED,\n' +
          '        at: fabricated,\n' +
          '        sinceAttachMs: fabricated === null ? null : 0,\n' +
          '      };\n' +
          '    }',
        message:
          /E3 a record that never settled answers no time field and no duration/,
        defect(api) {
          const answer = answerOf(api, frame(SECTIONS.snapshot, []));
          assert.equal(
            answer.settle.state,
            'settled',
            'the mutant mints a settle reading out of the attach reading',
          );
          assert.equal(
            answer.settle.at,
            SECTIONS.snapshot.attachAt,
            'the fabricated settle time is the attach reading',
          );
        },
      },
      {
        what: 'M5 a page already stable at attach is presented as a transition after it',
        anchor:
          '    const attachAt = isMeasurement(section.attachAt) ? section.attachAt : null;',
        replacement:
          '    const attachAt = isMeasurement(section.attachAt) ? section.attachAt : null;\n' +
          '    if (attachAt !== null && settle.at === attachAt) {\n' +
          '      return { state: SETTLED, at: attachAt + 7, sinceAttachMs: 7 };\n' +
          '    }',
        message: /E3 the settle time is the record’s own reading/,
        defect(api) {
          const answer = answerOf(api, frame(atAttachSection(), []));
          assert.equal(
            answer.settle.at,
            AT_ATTACH.settle.at + 7,
            'the mutant moves a settle at attach seven milliseconds later',
          );
        },
      },
    ]);
    console.log(`E3 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// -------------------------------------------------------------- E5: repeated work ----

describe('E5 — the repeated work is one pass per recorded pair', () => {
  it('counts two pairs as two passes over that component and a ChangeDetection pair as none', () => {
    const caught = proveNonVacuous(pinRepeatedWorkPerComponent, [
      {
        what: 'M6 every recorded entry is counted as a pass of its own',
        anchor: '      group.passes += 1;',
        replacement: '      group.passes += 2;',
        message:
          /E5 two TemplateUpdate start\/end pairs in one row are two passes over that component/,
        defect(api) {
          const answer = answerOf(
            api,
            frame(SECTIONS.snapshot, measuredWork()),
          );
          const template = answer.repeats.find(
            (repeat) => repeat.pair === TEMPLATE.pair,
          );
          assert.equal(
            template.passes,
            4,
            'the mutant counts both ends of both pairs as passes of their own',
          );
        },
      },
      {
        what: 'M7 the passes are counted from the frame’s checks rows, not its events',
        anchor: '    const events = eventsOf(record);',
        replacement:
          '    const events = [];\n' +
          '    if (isObject(record) && Array.isArray(record.checks)) {\n' +
          '      for (let c = 0; c < record.checks.length; c += 1) {\n' +
          '        const row = record.checks[c];\n' +
          '        const numbers =\n' +
          '          row && Array.isArray(row.events) ? row.events : [];\n' +
          '        for (let n = 0; n < numbers.length; n += 1) {\n' +
          '          events.push({\n' +
          '            pair: "TemplateUpdate",\n' +
          '            end: n % 2 === 1,\n' +
          '            componentName: row ? row.componentName : null,\n' +
          '          });\n' +
          '        }\n' +
          '      }\n' +
          '    }',
        message:
          /E5 two ChangeDetection pairs are two passes attributed to no component/,
        defect(api) {
          const answer = answerOf(
            api,
            frame(SECTIONS.snapshot, measuredWork(), [measuredChecksRow()]),
          );
          assert.deepEqual(
            answer.repeats.map((repeat) => repeat.pair),
            [TEMPLATE.pair],
            'the mutant counts a per-view cycle row and drops the pair no row carries',
          );
        },
      },
    ]);
    console.log(`E5 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// -------------------------------------------------------- E6: no paired work, no pass ----

describe('E6 — a frame that recorded no paired work reports no pass', () => {
  it('answers no pass for an empty frame, a checks-only frame, a start without an end and an end without a start', () => {
    const caught = proveNonVacuous(pinNoPairedWork, [
      {
        what: 'M8 a frame with no paired work is given a pass it did not record',
        anchor: '    const events = eventsOf(record);',
        replacement:
          '    const events = eventsOf(record);\n' +
          '    if (events.length === 0) {\n' +
          '      return [{ pair: "TemplateUpdate", componentName: null, passes: 1 }];\n' +
          '    }',
        message:
          /E6 a frame that recorded no paired work reports no pass at all/,
        defect(api) {
          const answer = answerOf(api, frame(SECTIONS.snapshot, []));
          assert.equal(
            answer.repeats.length,
            1,
            'the mutant invents a pass for a frame that recorded none',
          );
        },
      },
      {
        what: 'M9 an end with no start of its own pair is counted as a pass',
        anchor:
          '      if (stack === undefined || stack.length === 0) continue;',
        replacement:
          '      if (stack === undefined || stack.length === 0) {\n' +
          '        repeats.push({\n' +
          '          pair: entry.pair,\n' +
          '          componentName: entry.componentName,\n' +
          '          passes: 1,\n' +
          '        });\n' +
          '        continue;\n' +
          '      }',
        message: /E6 an end with no start in the frame is no pass/,
        defect(api) {
          const answer = answerOf(
            api,
            frame(SECTIONS.snapshot, [
              event(TEMPLATE.pair, true, 11, COMPONENT),
            ]),
          );
          assert.equal(
            answer.repeats.length,
            1,
            'the mutant counts an unpaired end as a pass',
          );
        },
      },
    ]);
    console.log(`E6 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------------- E7: four absences ----

describe('E7 — the four absences stay four distinct names', () => {
  it('names each absence once, renders each alone, and never renders zero outstanding items', () => {
    const caught = proveNonVacuous(pinTheFourAbsencesStayDistinct, [
      {
        what: 'M10 a cause is filled in from the component name the frame recorded',
        anchor: '      absences: absencesOf(state),',
        replacement:
          '      absences: absencesOf(state).filter(function (name) {\n' +
          '        return name !== NO_CAUSE_REPORTED;\n' +
          '      }),\n' +
          '      cause: repeatsOf(record).length > 0\n' +
          '        ? repeatsOf(record)[0].componentName\n' +
          '        : null,',
        message:
          /E7 the answer carries exactly the contract fields and no cause/,
        defect(api) {
          const answer = answerOf(
            api,
            frame(SECTIONS.snapshot, measuredWork()),
          );
          assert.equal(
            answer.cause,
            null,
            'the mutant fills a cause field from the frame’s own component name',
          );
          assert.equal(
            answer.absences.includes('no-cause-reported'),
            false,
            'and drops the absence the cause would have answered',
          );
        },
      },
      {
        what: 'M11 an absence the read did not force is rendered as another absence’s sentence',
        anchor: '      cells[name] = ABSENCE_TEXTS[name];',
        replacement: '      cells[name] = ABSENCE_TEXTS[NO_SETTLE_ORDER];',
        message:
          /E7 no-stability-observable renders in its own cell under its own name/,
        defect(api) {
          const answer = answerOf(api, frame(SECTIONS.absent, []));
          const panel = panelOf(api, answer);
          assert.equal(
            panel.cells['no-stability-observable'],
            api.ABSENCE_TEXTS['no-settle-order'],
            'the mutant renders one absence’s sentence in another’s cell',
          );
        },
      },
    ]);
    console.log(`E7 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------ E8: nothing from a neighbouring field ----

describe('E8 — no cause, call site or task id from a neighbouring field', () => {
  it('takes nothing from the opted-in debugging surface and stays no-outstanding-inventory', () => {
    const caught = proveNonVacuous(pinNoCauseFromANeighbouringField, [
      {
        what: 'M12 an owner is filled in from the component name the frame recorded',
        anchor: '      repeats: repeatsOf(record),',
        replacement:
          '      repeats: repeatsOf(record),\n' +
          '      owner: repeatsOf(record).length > 0\n' +
          '        ? repeatsOf(record)[1].componentName\n' +
          '        : null,',
        message:
          /E8 the answer carries no cause, no owner, no call site and no task id/,
        defect(api) {
          const answer = answerOf(
            api,
            frame(SECTIONS.snapshot, measuredWork()),
          );
          assert.equal(
            answer.owner,
            COMPONENT,
            'the mutant mints an owner out of the component the frame happened to name',
          );
        },
      },
      {
        what: 'M13 an opted-in creation stack is carried as an outstanding inventory',
        anchor: '  function absencesOf(state) {\n    const names = [];',
        replacement:
          '  function absencesOf(state) {\n' +
          '    const names = [\n' +
          '      "no-outstanding-inventory: at _App_Template (app.html:1:1)",\n' +
          '    ];',
        message: /E8 the opted-in fields fill no absence and add none/,
        defect(api) {
          const answer = answerOf(api, frame(SECTIONS.snapshot, []));
          assert.equal(
            answer.absences.some((name) => name.includes('app.html')),
            true,
            'the mutant carries a creation stack where an absence was named',
          );
        },
      },
    ]);
    console.log(`E8 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// -------------------------------------------------------------- E10: idempotency ----

describe('E10 — silence is not stability, and the same record answers the same thing', () => {
  it('answers the same record twice identically, and never reads a verdict out of silence', () => {
    const caught = proveNonVacuous(pinSilenceIsNotStability, [
      {
        what: 'M14 instability is inferred from a record that emitted nothing',
        anchor:
          '    if (reading === null) return { state: IDLE, absence: null };',
        replacement:
          '    if (reading === null) return { state: UNSTABLE, absence: null };',
        message: /E10 a record that recorded nothing is not unstable/,
        defect(api) {
          const answer = answerOf(api, frame(SECTIONS.silent, []));
          assert.equal(
            answer.state,
            'unstable',
            'the mutant reads instability out of a stream that emitted nothing',
          );
        },
      },
      frameSilenceDecides(
        'M15 the verdict is read out of the frame’s silence rather than the emission',
        /E10 silence never turns cannot-tell into stable/,
      ),
    ]);
    console.log(`E10 non-vacuous:\n  ${caught.join('\n  ')}`);
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
      ['perform', 'ance.'].join(''),
      ['fe', 'tch('].join(''),
      ['XMLHttp', 'Request'].join(''),
      ['localSto', 'rage'].join(''),
    ]) {
      assert.equal(
        CODE.includes(needle),
        false,
        `the module carries ${JSON.stringify(needle)}, and it must read the record it is handed and nothing else`,
      );
    }
  });

  it('reads only the stability section and the events list of the record it is handed', () => {
    for (const field of [
      'checks',
      'routerEvents',
      'boundary',
      'startedAt',
      'cycleId',
      'trigger',
    ]) {
      assert.equal(
        CODE.includes(`record.${field}`),
        false,
        `the module reads record.${field}, and the repeated work and the state come from its own two fields`,
      );
    }
    assert.equal(
      CODE.includes('record.stability'),
      true,
      'the module reads the stability section the agent publishes',
    );
    assert.equal(
      CODE.includes('record.events'),
      true,
      'the module reads the frame’s own events list',
    );
  });

  it('republishes in place on a second run in the same world', () => {
    const context = createContext({});
    runInContext(SRC, context);
    const first = context.angularAiStabilityNarrator;
    runInContext(SRC, context);
    const second = context.angularAiStabilityNarrator;
    assert.equal(
      first,
      second,
      'a second run must republish the same namespace, so a caller’s reference stays valid',
    );
    assert.equal(typeof second.stability, 'function');
    assert.equal(typeof second.stabilityPanel, 'function');
  });
});
