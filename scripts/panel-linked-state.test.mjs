// Tests for apps/angular-ai-devtools/src/app/panel-linked-state.ts — the display half of M038 T003
// (INTENT.md SC4). The join itself is `extension/linked-state.js` (T002), already landed; this
// suite renders the fact that join answers, from the measurement T001 recorded.
//
// The fixture is the recording and it is read, never written: `research/raw/m038-linked-state.json`
// measures two linked signals labelled `agreeing` and `differing`, holding 7 and 8, and one source
// of kind `signal` labelled `source`, holding 7. One `describe` below runs the landed join over the
// recorded graph inside a bare `node:vm` context and feeds its answer straight into the pane, so the
// two halves are pinned against each other rather than against a hand-written copy of the answer.
// The recording's own `subjects.*.agreesWithItsSource` is the precomputed field the pane may never
// read; it is carried on a fact below on purpose, saying the opposite of that fact's `reason`.
//
// The states the pane can produce are pinned exactly:
//
//   matching      the signal, the source, both stored values and the join's `matching` word, which
//                 is also the pane's state (AC1).
//   differing     the same five fields and the join's `differing` word, never the matching pane
//                 (AC1). The word is read from `reason`, never re-derived from the two values and
//                 never taken from the recording's precomputed agreement.
//   cannot-tell   one of the four reasons the join can name and nothing else: no signal, no source
//                 and no value, because it has none (AC1).
//   idle          nothing has arrived: no fact, an empty list, or a read still running. Never a
//                 blank pane and never an agreement (AC1).
//   <as given>    a state this pane was not written for is rendered as the state it was given, and
//                 never dropped (AC1's second half).
//
// Every pin is proven non-vacuously the way `scripts/panel-legacy.test.mjs` does it: the pin runs
// against the untouched module first, then against a copy of the module source carrying one
// anchored mutation, and the pin must redden with a failure message that names the defect. A mutant
// that survives its pin, or that cannot fail at all, fails this suite.
import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { pathToFileURL } from 'node:url';

const SURFACE_URL = new URL(
  '../apps/angular-ai-devtools/src/app/panel-linked-state.ts',
  import.meta.url,
);
const SURFACE_SRC = readFileSync(SURFACE_URL, 'utf8');
const SURFACE = await import(SURFACE_URL.href);

const JOIN_SRC = readFileSync(
  new URL('../extension/linked-state.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m038-linked-state.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------------ measured fixture ----

/** The label the graph gives the source signal, and the value it holds. */
const SOURCE_LABEL = RECORDING.source.node.label;
const SOURCE_VALUE = RECORDING.source.node.value;

/** The two linked signals the recording measured: the label each carries and the value it holds. */
const AGREEING_LABEL = RECORDING.subjects.agreeing.node.label;
const AGREEING_VALUE = RECORDING.subjects.agreeing.node.value;
const DIFFERING_LABEL = RECORDING.subjects.differing.node.label;
const DIFFERING_VALUE = RECORDING.subjects.differing.node.value;

/** The four reasons the join can name for an absence, as the join itself publishes them. */
const JOIN_REASONS = [
  'no-linked-signal',
  'signal-unreadable',
  'value-unreadable',
  'source-unreadable',
];

// ------------------------------------------------------------------------ the facts ----

/**
 * The join's answer for the recorded agreeing subject, field for field as
 * `extension/linked-state.js` builds it, plus the fields the pane must never render: the
 * recording's own precomputed agreement — set to the opposite of this fact's `reason`, so a pane
 * that reads it prints `differing` — and a cause, an owner, a write flag and an element.
 */
const MATCHING = {
  state: 'finding',
  signal: AGREEING_LABEL,
  source: SOURCE_LABEL,
  value: AGREEING_VALUE,
  sourceValue: SOURCE_VALUE,
  reason: 'matching',
  agreesWithItsSource: false,
  cause: 'the differing value was written by its owner',
  owner: 'LinkedStatePage',
  written: true,
  element: '#linked-state-agreeing',
};

/** The same, for the recorded differing subject: the value the page wrote away from its source. */
const DIFFERING_FACT = {
  state: 'finding',
  signal: DIFFERING_LABEL,
  source: SOURCE_LABEL,
  value: DIFFERING_VALUE,
  sourceValue: SOURCE_VALUE,
  reason: 'differing',
  agreesWithItsSource: true,
};

/**
 * A fact whose two values are the differing ones (`8` and `7`) and whose join word is `matching`:
 * a pane that recomputed `value === sourceValue` instead of reading `reason` prints `differing`.
 */
const MATCHING_WITH_UNEQUAL_VALUES = {
  state: 'finding',
  signal: DIFFERING_LABEL,
  source: SOURCE_LABEL,
  value: DIFFERING_VALUE,
  sourceValue: SOURCE_VALUE,
  reason: 'matching',
};

/**
 * A fact whose two values are equal (`7` and `7`) and whose join word is `differing`, with the
 * recording's precomputed agreement set the other way: only `reason` may decide the pane.
 */
const DIFFERING_WITH_EQUAL_VALUES = {
  state: 'finding',
  signal: AGREEING_LABEL,
  source: SOURCE_LABEL,
  value: AGREEING_VALUE,
  sourceValue: SOURCE_VALUE,
  reason: 'differing',
  agreesWithItsSource: true,
};

/** Every fact whose pane is decided by the join's `reason` word alone. */
const REASON_FACTS = [
  ['the recorded agreeing subject', MATCHING, 'matching'],
  ['the recorded differing subject', DIFFERING_FACT, 'differing'],
  [
    'unequal values carrying matching',
    MATCHING_WITH_UNEQUAL_VALUES,
    'matching',
  ],
  ['equal values carrying differing', DIFFERING_WITH_EQUAL_VALUES, 'differing'],
];

/** A finding too thin to render: the pane keeps the state it was given and borrows no field. */
const THIN_FINDING = {
  state: 'finding',
  signal: AGREEING_LABEL,
  reason: 'matching',
};

/** A state this pane was not written for: no join today answers it, and it is still rendered. */
const UNWRITTEN = 'wedged';

/** What no rendered pane may name: a write, an owner, a cause or a recomputation standing in. */
const FORBIDDEN_CLAIMS = [
  ['a write', /\b(writ(?:e|es|ten|ing)|wrote|set\s+by|assigned)\b/i],
  ['an owner', /\b(own(?:er|ers|ed|s))\b/i],
  ['a cause', /\b(cause|causes|caused|causal|because|why)\b/i],
  [
    'a recomputation',
    /\b(recomput(?:e|ed|es|ation)|recalculat(?:e|ed|es|ion)|reset|resets)\b/i,
  ],
];

function list(...facts) {
  return { facts };
}

// ------------------------------------------------------------------------ the join ----

/** `extension/linked-state.js` run in a bare context, publishing its own namespace. */
function joinApi() {
  const context = createContext({});
  runInContext(JOIN_SRC, context);
  const api = context.angularAiLinkedState;
  assert.ok(api, 'extension/linked-state.js must publish its namespace');
  assert.equal(typeof api.linkedState, 'function');
  return api;
}

/** The recorded graph, cloned so a case can never edit the parsed recording for the next one. */
function recordedGraph() {
  return JSON.parse(JSON.stringify(RECORDING.graph));
}

/** The fact a caller hands the join: the recorded graph and the label of the subject to report. */
function measuredFact(label) {
  return { graph: recordedGraph(), signal: label };
}

// ------------------------------------------------------------------- mutant plumbing ----

let mutantDir = null;
let mutantCount = 0;

/**
 * A copy of the surface source with one anchored replacement applied. The anchor must occur, and
 * the mutation must change the source: a mutation that rewrites nothing is a decorative mutant.
 */
async function loadMutant(anchor, replacement) {
  assert.ok(
    SURFACE_SRC.includes(anchor),
    `mutation anchor not found in panel-linked-state.ts: ${JSON.stringify(anchor)}`,
  );
  const source = SURFACE_SRC.replace(anchor, replacement);
  assert.notEqual(
    source,
    SURFACE_SRC,
    `mutation must change source: ${anchor}`,
  );
  mutantDir ??= mkdtempSync(join(tmpdir(), 'panel-linked-state-'));
  mutantCount += 1;
  const file = join(mutantDir, `mutant-${mutantCount}.ts`);
  writeFileSync(file, source, 'utf8');
  return import(pathToFileURL(file).href);
}

after(() => {
  if (mutantDir) rmSync(mutantDir, { recursive: true, force: true });
});

/**
 * The four phases of a non-vacuous pin: the untouched module passes it, the mutated copy is run
 * through the same pin, the pin reddens, and the failure names the defect by name.
 */
function mutantReddens(name, mutant, input, pin) {
  // The unmutated module pins first: the mutant is only the change under test.
  pin(SURFACE.linkedStatePanel(input));
  let failure = null;
  try {
    pin(mutant.linkedStatePanel(input));
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
  console.log(`mutant ${name} reddens: ${failure.message.split('\n')[0]}`);
  return failure;
}

// ------------------------------------------------------------------------- the pins ----

/** AC1: `matching` is its own pane, carrying the join's five fields and its own word. */
function pinMatchingComplete(surface) {
  assert.equal(surface.kind, 'matching', 'matching-own-text: kind is the word');
  assert.equal(
    surface.state,
    'matching',
    'matching-own-text: state is the word',
  );
  assert.equal(
    surface.reason,
    'matching',
    'matching-own-text: the join reason is carried',
  );
  assert.equal(
    surface.signal,
    AGREEING_LABEL,
    'matching-own-text: signal is named',
  );
  assert.equal(
    surface.source,
    SOURCE_LABEL,
    'matching-own-text: source is named',
  );
  assert.equal(
    surface.value,
    AGREEING_VALUE,
    'matching-own-text: value is carried',
  );
  assert.equal(
    surface.sourceValue,
    SOURCE_VALUE,
    'matching-own-text: source value is carried',
  );
  assert.deepEqual(
    [...surface.lines],
    [
      `signal: ${AGREEING_LABEL}`,
      `source: ${SOURCE_LABEL}`,
      `value: ${AGREEING_VALUE}`,
      `sourceValue: ${SOURCE_VALUE}`,
      'reason: matching',
    ],
    'matching-own-text: the five lines, in order',
  );
  assert.equal(surface.text, surface.lines.join('\n'));
  assert.equal(surface.message, 'matching');
}

/** AC1: `differing` is its own pane, and never the matching one. */
function pinDifferingComplete(surface) {
  assert.equal(
    surface.kind,
    'differing',
    'differing-own-text: kind is the word',
  );
  assert.equal(
    surface.state,
    'differing',
    'differing-own-text: state is the word',
  );
  assert.equal(
    surface.reason,
    'differing',
    'differing-own-text: the join reason is carried',
  );
  assert.equal(
    surface.signal,
    DIFFERING_LABEL,
    'differing-own-text: signal is named',
  );
  assert.equal(
    surface.value,
    DIFFERING_VALUE,
    'differing-own-text: value is carried',
  );
  assert.equal(
    surface.sourceValue,
    SOURCE_VALUE,
    'differing-own-text: source value is carried',
  );
  assert.deepEqual(
    [...surface.lines],
    [
      `signal: ${DIFFERING_LABEL}`,
      `source: ${SOURCE_LABEL}`,
      `value: ${DIFFERING_VALUE}`,
      `sourceValue: ${SOURCE_VALUE}`,
      'reason: differing',
    ],
    'differing-own-text: the five lines, in order',
  );
  assert.ok(
    !surface.text.includes('reason: matching'),
    'differing-own-text: never the matching reason',
  );
}

/** AC2: the reason is read from the fact, never re-derived from the two values. */
function pinReasonIsRead(surface, expected) {
  assert.equal(
    surface.kind,
    expected,
    `reads-reason: the fact's own word is the pane's state, got ${surface.kind}`,
  );
  assert.equal(
    surface.state,
    expected,
    `reads-reason: the fact's own word is the pane's state, got ${surface.state}`,
  );
  assert.equal(
    surface.reason,
    expected,
    `reads-reason: the join reason is carried, got ${surface.reason}`,
  );
  assert.ok(
    surface.text.includes(`reason: ${expected}`),
    `reads-reason: the word is rendered, got ${surface.text}`,
  );
  const other = expected === 'matching' ? 'differing' : 'matching';
  assert.ok(
    !surface.text.includes(`reason: ${other}`),
    `reads-reason: the other word is not rendered, got ${surface.text}`,
  );
}

/** AC1: an absence carries its reason and no finding field at all. */
function pinCannotTellNoFinding(surface) {
  assert.equal(
    surface.state,
    'cannot-tell',
    'cannot-tell-no-finding-fields: state',
  );
  assert.equal(
    surface.kind,
    'cannot-tell',
    'cannot-tell-no-finding-fields: kind',
  );
  assert.equal(
    surface.reason,
    JOIN_REASONS.find((reason) => reason === surface.reason),
    'cannot-tell-no-finding-fields: a reason the join can name',
  );
  assert.ok(
    JOIN_REASONS.includes(surface.reason),
    `cannot-tell-no-finding-fields: ${surface.reason} is not a reason the join publishes`,
  );
  assert.ok(
    surface.text.includes(`reason: ${surface.reason}`),
    'cannot-tell-no-finding-fields: the reason is named',
  );
  assert.ok(
    surface.text.includes('cannot tell'),
    'cannot-tell-no-finding-fields: says it cannot tell',
  );
  for (const field of ['signal', 'source', 'value', 'sourceValue']) {
    assert.equal(
      field in surface,
      false,
      `cannot-tell-no-finding-fields: no ${field} field may be carried`,
    );
    assert.ok(
      !surface.text.includes(`${field}:`),
      `cannot-tell-no-finding-fields: no ${field} line may be rendered`,
    );
  }
  // The two linked signals may not be named either. The source's own label is left to the pin above:
  // the join's `source-unreadable` reason carries the word `source`, and that reason is rendered.
  for (const label of [AGREEING_LABEL, DIFFERING_LABEL]) {
    assert.ok(
      !surface.text.includes(label),
      `cannot-tell-no-finding-fields: must not name ${label}`,
    );
  }
}

/** AC1: idle says so, and never reads as an agreement. */
function pinIdleNeverAgreement(surface) {
  assert.equal(surface.state, 'idle', 'idle-own-text: state');
  assert.equal(surface.kind, 'idle', 'idle-own-text: kind');
  assert.ok(surface.lines.length > 0, 'idle-own-text: never a blank pane');
  assert.ok(surface.text.includes('idle'), 'idle-own-text: says idle');
  assert.ok(
    !/matching|differing/.test(surface.text),
    'idle-own-text: must not read as an agreement',
  );
  for (const field of ['signal:', 'source:', 'value:', 'reason:']) {
    assert.ok(
      !surface.text.includes(field),
      `idle-own-text: no ${field} line while nothing has arrived`,
    );
  }
}

/**
 * AC1's second half: a state this pane was not written for is rendered as the state it was given.
 * The pane prints that word and no other state's fields.
 */
function pinGivenStateRendered(surface, given) {
  assert.equal(
    surface.state,
    given,
    `given-state-rendered: the word the fact named, got ${surface.state}`,
  );
  assert.equal(
    surface.kind,
    given,
    `given-state-rendered: the kind is the word, got ${surface.kind}`,
  );
  assert.ok(
    surface.text.includes(`state: ${given}`),
    `given-state-rendered: the state line, got ${surface.text}`,
  );
  assert.ok(
    surface.lines.length > 0,
    'given-state-rendered: never a blank pane',
  );
  for (const field of ['signal:', 'source:', 'value:', 'reason:']) {
    assert.ok(
      !surface.text.includes(field),
      `given-state-rendered: it borrows no ${field} line`,
    );
  }
}

/** AC2: no rendered pane names a write, an owner or a cause. */
function pinNoClaim(surface) {
  const rendered = `${surface.text}\n${JSON.stringify(surface)}`;
  // Every claim the rendered pane makes, named one by one: a failure that reported only the first
  // would hide the second, and a page that names a cause usually names what wrote it too.
  const named = FORBIDDEN_CLAIMS.filter(([, pattern]) =>
    pattern.test(rendered),
  ).map(([claim]) => claim);
  assert.deepEqual(
    named,
    [],
    `no-claim: the pane must render no claim the fact list does not carry; it rendered ${JSON.stringify(named)} in: ${surface.text}`,
  );
}

// ------------------------------------------------------------------------ the cases ----

describe('measurement', () => {
  it('the recording measures the two linked signals, their values and the shared source', () => {
    assert.deepEqual(
      RECORDING.graph.nodes
        .filter((node) => node.kind === 'linkedSignal')
        .map((node) => node.label),
      [AGREEING_LABEL, DIFFERING_LABEL],
      'the two linked signals carry the field names as labels',
    );
    assert.deepEqual(
      [AGREEING_VALUE, DIFFERING_VALUE],
      [7, 8],
      'the linked signals hold 7 and 8',
    );
    assert.equal(SOURCE_LABEL, 'source');
    assert.equal(SOURCE_VALUE, 7);
    // The recording's precomputed agreement, which is the one field the pane may never read.
    assert.equal(RECORDING.subjects.agreeing.agreesWithItsSource, true);
    assert.equal(RECORDING.subjects.differing.agreesWithItsSource, false);
    console.log(
      `linked-state fixture: labels ${JSON.stringify([AGREEING_LABEL, DIFFERING_LABEL])}, ` +
        `values ${JSON.stringify([AGREEING_VALUE, DIFFERING_VALUE])}, source ${SOURCE_LABEL}=${SOURCE_VALUE}`,
    );
  });
});

describe('the join this pane renders', () => {
  it('renders the landed join’s answer for the recorded agreeing subject as matching', () => {
    const api = joinApi();
    const answer = api.linkedState(measuredFact(AGREEING_LABEL));
    assert.equal(answer.state, 'finding', 'the join answers a finding');
    assert.equal(answer.reason, 'matching', 'the join names the agreement');

    const surface = SURFACE.linkedStatePanel(list(answer));
    pinMatchingComplete(surface);
    // Every field is the join's own, not a value this suite wrote beside it.
    assert.equal(surface.signal, answer.signal);
    assert.equal(surface.source, answer.source);
    assert.equal(surface.value, answer.value);
    assert.equal(surface.sourceValue, answer.sourceValue);
    assert.equal(surface.reason, answer.reason);
    assert.equal(surface.state, answer.reason);
  });

  it('renders the landed join’s answer for the recorded differing subject as differing', () => {
    const api = joinApi();
    const answer = api.linkedState(measuredFact(DIFFERING_LABEL));
    assert.equal(answer.state, 'finding', 'the join answers a finding');
    assert.equal(answer.reason, 'differing', 'the join names the disagreement');
    assert.notEqual(answer.value, answer.sourceValue, 'the two values differ');

    const surface = SURFACE.linkedStatePanel(list(answer));
    pinDifferingComplete(surface);
    assert.equal(surface.value, answer.value);
    assert.equal(surface.sourceValue, answer.sourceValue);
    assert.equal(surface.state, answer.reason);
  });

  it('names exactly the four absences the join publishes, and nothing else', () => {
    const api = joinApi();
    const published = [
      api.NO_LINKED_SIGNAL,
      api.SIGNAL_UNREADABLE,
      api.VALUE_UNREADABLE,
      api.SOURCE_UNREADABLE,
    ];
    assert.deepEqual([...published].sort(), [...JOIN_REASONS].sort());
    for (const reason of published) {
      pinCannotTellNoFinding(
        SURFACE.linkedStatePanel(list({ state: 'cannot-tell', reason })),
      );
    }
    console.log(
      `join absences rendered: ${JSON.stringify([...published].sort())}`,
    );
  });
});

describe('panel-linked-state states', () => {
  it('AC1: matching renders the signal, the source, both values and its own word', () => {
    const surface = SURFACE.linkedStatePanel(list(MATCHING));
    pinMatchingComplete(surface);
  });

  it('AC1: differing renders its own text and never the matching one', () => {
    const matching = SURFACE.linkedStatePanel(list(MATCHING));
    const differing = SURFACE.linkedStatePanel(list(DIFFERING_FACT));
    pinDifferingComplete(differing);
    assert.notEqual(differing.text, matching.text);
    assert.notEqual(differing.message, matching.message);
    assert.notDeepEqual(
      differing.lines,
      matching.lines,
      'the two agreements are two different panes',
    );
  });

  it('AC1: cannot-tell renders its reason and no finding field', () => {
    for (const reason of JOIN_REASONS) {
      pinCannotTellNoFinding(
        SURFACE.linkedStatePanel(list({ state: 'cannot-tell', reason })),
      );
    }
    // A fact that names no reason still names the absence, and never invents one of the join's.
    const unnamed = SURFACE.linkedStatePanel(list({ state: 'cannot-tell' }));
    assert.equal(unnamed.state, 'cannot-tell');
    assert.equal(unnamed.reason, SURFACE.UNKNOWN_REASON);
  });

  it('AC1: idle renders its own text for every way of having nothing to render', () => {
    for (const input of [
      undefined,
      null,
      [],
      list(),
      { facts: [] },
      { loading: true },
      { assembling: true },
      { state: 'loading' },
      list({ state: 'loading' }),
    ]) {
      pinIdleNeverAgreement(SURFACE.linkedStatePanel(input));
    }
  });

  it('AC1: the four states render four different texts of their own', () => {
    const states = [
      SURFACE.linkedStatePanel(list(MATCHING)),
      SURFACE.linkedStatePanel(list(DIFFERING_FACT)),
      SURFACE.linkedStatePanel(
        list({ state: 'cannot-tell', reason: JOIN_REASONS[0] }),
      ),
      SURFACE.linkedStatePanel(list()),
    ];

    pinMatchingComplete(states[0]);
    pinDifferingComplete(states[1]);
    pinCannotTellNoFinding(states[2]);
    pinIdleNeverAgreement(states[3]);

    assert.deepEqual(
      states.map((surface) => surface.state),
      ['matching', 'differing', 'cannot-tell', 'idle'],
      'states-distinct: the four states keep their own names',
    );
    assert.deepEqual(
      states.map((surface) => surface.kind),
      ['matching', 'differing', 'cannot-tell', 'idle'],
      'states-distinct: the kind is the state it renders',
    );
    assert.equal(
      new Set(states.map((surface) => surface.text)).size,
      4,
      'states-distinct: no two states share a text',
    );
    assert.equal(
      new Set(states.map((surface) => surface.message)).size,
      4,
      'states-distinct: no two states share a message',
    );
  });

  it('AC1: a state this pane was not written for still renders the state it was given', () => {
    // The word no join of this milestone answers: it is rendered, never folded into idle, error or
    // an agreement.
    pinGivenStateRendered(
      SURFACE.linkedStatePanel(list({ state: UNWRITTEN })),
      UNWRITTEN,
    );
    pinGivenStateRendered(
      SURFACE.linkedStatePanel({ state: UNWRITTEN }),
      UNWRITTEN,
    );
    // A second one, so the pass-through is a rule and not one string that happens to work.
    pinGivenStateRendered(
      SURFACE.linkedStatePanel(list({ state: 'newly-named-agreement' })),
      'newly-named-agreement',
    );
    // And a finding whose reason is a word this pane was not written for: the join owns the
    // vocabulary, so the word it carried is the state the pane renders.
    pinReasonIsRead(
      SURFACE.linkedStatePanel(
        list({ ...MATCHING, reason: 'newly-named-agreement' }),
      ),
      'newly-named-agreement',
    );
  });

  it('AC1: a finding too thin to render keeps its own state and borrows no field', () => {
    pinGivenStateRendered(
      SURFACE.linkedStatePanel(list(THIN_FINDING)),
      'finding',
    );
    pinGivenStateRendered(
      SURFACE.linkedStatePanel(list({ state: 'finding', value: 7 })),
      'finding',
    );
    // A stored `0`, `false` or `''` is a value the join reports, not an absence: the pane renders a
    // full finding for it rather than reading a falsy value as "no value".
    for (const value of [0, false, '']) {
      const surface = SURFACE.linkedStatePanel(list({ ...MATCHING, value }));
      assert.equal(
        surface.state,
        'matching',
        `a stored ${JSON.stringify(value)} is a value, not an absence`,
      );
      assert.equal(surface.value, value);
      assert.ok(surface.text.includes(`value: ${value}`));
    }
  });

  it('AC2: nothing rendered names a write, an owner or a cause', () => {
    for (const fact of [
      MATCHING,
      DIFFERING_FACT,
      MATCHING_WITH_UNEQUAL_VALUES,
      DIFFERING_WITH_EQUAL_VALUES,
      ...JOIN_REASONS.map((reason) => ({ state: 'cannot-tell', reason })),
      { state: UNWRITTEN },
    ]) {
      pinNoClaim(SURFACE.linkedStatePanel(list(fact)));
    }
    pinNoClaim(SURFACE.linkedStatePanel(list()));
    pinNoClaim(SURFACE.linkedStatePanel(undefined));
    // The extras the poisoned finding carries are the words the scan hunts, so a pane that echoed
    // any of them reddens here rather than passing on a finding that carried none.
    for (const leaked of [MATCHING.cause, MATCHING.owner]) {
      assert.ok(
        !SURFACE.linkedStatePanel(list(MATCHING)).text.includes(leaked),
        `no-claim: the pane must not render ${leaked}`,
      );
    }
  });

  it('AC2: the reason is read, never re-derived from the two stored values', () => {
    for (const [what, fact, expected] of REASON_FACTS) {
      pinReasonIsRead(SURFACE.linkedStatePanel(list(fact)), expected);
      console.log(
        `reads-reason: ${what} -> ${expected} (value ${fact.value}, sourceValue ${fact.sourceValue})`,
      );
    }
  });

  it('AC2: the recording’s precomputed agreement is never read', () => {
    // `agreesWithItsSource` says the opposite of `reason` on both facts, so reading it flips them.
    const matching = SURFACE.linkedStatePanel(list(MATCHING));
    const differing = SURFACE.linkedStatePanel(
      list(DIFFERING_WITH_EQUAL_VALUES),
    );
    assert.equal(matching.state, 'matching');
    assert.equal(differing.state, 'differing');
    assert.ok(
      !('agreesWithItsSource' in matching),
      'the precomputed field must not reach the pane',
    );
    for (const fact of [MATCHING, DIFFERING_FACT]) {
      assert.equal(
        typeof fact.agreesWithItsSource,
        'boolean',
        'the fact carries the precomputed field, so the pin is live',
      );
    }
  });

  it('a finding outranks cannot-tell, and both outrank a state as given', () => {
    const absence = { state: 'cannot-tell', reason: JOIN_REASONS[1] };
    const withFinding = SURFACE.linkedStatePanel(
      list(absence, { state: UNWRITTEN }, DIFFERING_FACT),
    );
    assert.equal(withFinding.state, 'differing');

    const withAbsence = SURFACE.linkedStatePanel(
      list({ state: UNWRITTEN }, absence),
    );
    assert.equal(withAbsence.state, 'cannot-tell');
    assert.equal(withAbsence.reason, JOIN_REASONS[1]);
  });

  it('accepts a single fact as a list of one', () => {
    const surface = SURFACE.linkedStatePanel(DIFFERING_FACT);
    pinDifferingComplete(surface);
  });
});

describe('panel-linked-state mutants', () => {
  it('M1: rendering a cause the fact list does not carry reddens the no-claim pin', async () => {
    // The fact carries no cause of its own: `MATCHING`'s extras are dropped by the pane, and the
    // recording's differing subject was written away by the fixture page, not by anything the
    // pane may name. This mutation invents that cause in the pane's own source.
    const mutant = await loadMutant(
      '    `reason: ${reason}`,\n  ];',
      "    `reason: ${reason}`,\n    'cause: the differing value was written by its owner',\n  ];",
    );
    const failure = mutantReddens(
      'no-claim',
      mutant,
      list(MATCHING),
      pinNoClaim,
    );
    // The failure names the defect: the claim that leaked, and the words it used.
    assert.match(failure.message, /a cause/);
    assert.match(failure.message, /written by its owner/);
    assert.match(failure.message, /no-claim/);
    // The mutant really renders it, so the pin is not failing for some other line.
    assert.ok(
      mutant
        .linkedStatePanel(list(MATCHING))
        .text.includes('cause: the differing value was written by its owner'),
    );
  });

  it('M2: re-deriving the agreement from the two values reddens the reads-reason pin', async () => {
    const mutant = await loadMutant(
      '    state: reason,',
      "    state: value === sourceValue ? 'matching' : 'differing',",
    );
    const failure = mutantReddens(
      'reads-reason',
      mutant,
      list(MATCHING_WITH_UNEQUAL_VALUES),
      (surface) => pinReasonIsRead(surface, 'matching'),
    );
    assert.match(failure.message, /the fact's own word is the pane's state/);
    assert.equal(
      mutant.linkedStatePanel(list(MATCHING_WITH_UNEQUAL_VALUES)).state,
      'differing',
      'the mutant recomputed the word from the values instead of reading it',
    );
  });

  it('M3: reading the precomputed agreement reddens the reads-reason pin', async () => {
    const mutant = await loadMutant(
      "    const reason = nonEmptyString(raw['reason']);",
      "    const reason = raw['agreesWithItsSource'] === false ? 'differing' : 'matching';",
    );
    const failure = mutantReddens(
      'reads-reason',
      mutant,
      list(MATCHING),
      (surface) => pinReasonIsRead(surface, 'matching'),
    );
    assert.match(failure.message, /the fact's own word is the pane's state/);
    assert.equal(
      mutant.linkedStatePanel(list(MATCHING)).state,
      'differing',
      'the mutant read the recording’s precomputed field instead of the join’s reason',
    );
  });

  it('M4: dropping a state the pane was not written for reddens the given-state pin', async () => {
    const mutant = await loadMutant(
      '  // Any other word is a state this pane was not written for. It is rendered, never dropped.\n' +
        "  return { state: 'given', given: state };",
      '  // Any other word is a state this pane was not written for.\n  return null;',
    );
    const failure = mutantReddens(
      'given-state-rendered',
      mutant,
      list({ state: UNWRITTEN }),
      (surface) => pinGivenStateRendered(surface, UNWRITTEN),
    );
    assert.match(failure.message, /the word the fact named/);
    // The mutant answers an unwritten state with the idle pane: the drop the pin hunts.
    assert.equal(
      mutant.linkedStatePanel(list({ state: UNWRITTEN })).state,
      'idle',
    );
  });

  it('M5: borrowing a signal into cannot-tell reddens its pin', async () => {
    const mutant = await loadMutant(
      '    ...pane(message, [message, `reason: ${reason}`]),',
      '    ...pane(message, [message, `reason: ${reason}`, `signal: ' +
        AGREEING_LABEL +
        '`]),',
    );
    const failure = mutantReddens(
      'cannot-tell-no-finding-fields',
      mutant,
      list({ state: 'cannot-tell', reason: JOIN_REASONS[0] }),
      pinCannotTellNoFinding,
    );
    assert.match(failure.message, /no signal line may be rendered/);
  });
});
