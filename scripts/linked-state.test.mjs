// Tests for extension/linked-state.js — the join between one linked signal, the source it follows
// and the two values the graph holds.
//
// The module is evaluated in a bare `node:vm` context; the checkout is never written. Two pins guard
// purity: the context carries no DOM, clock, console or network, and the join is run again in a
// context where every one of those names is a trap, so a module that reached for one is caught
// rather than answered exactly as the clean module is.
//
// The facts are the recording's (`research/raw/m038-linked-state.json`, measured by T001): two
// linked signals labelled `agreeing` and `differing`, holding 7 and 8, and a shared source of kind
// `signal`, labelled `source`, holding 7. A fact is the recorded graph plus the label of the linked
// signal to report. The one fact the recording does not measure is the equal-value case for the
// `differing` label (E3): T001's differing subject was written to 8, so the test sets its recorded
// node's value to the source's 7 and says so where it builds it. That fact is a constructed caller
// input, and the finding built from it is pinned as what the two values state, never as a
// measurement.
//
// The states this module can produce are pinned exactly:
//
//   finding / matching    the linked signal and its source, both values, and the word `matching`,
//                         from the measured agreeing subject (AC1).
//   finding / differing   the same fields and the word `differing`, from the measured differing
//                         subject, and never the same answer as the matching one (AC2).
//   cannot-tell           one of four reasons and nothing else: `no-linked-signal` (E1),
//                         `signal-unreadable`, `value-unreadable`, and `source-unreadable` (E2).
//
// Every criterion is proven non-vacuously in four phases: the pin is run against the untouched
// module first, then against a mutually exclusive mutant of the module source which is asserted to
// exhibit the defect the pin hunts, then the pin is asserted to redden on it with a failure message
// that names the defect by string, then the untouched module is pinned again. A mutant that
// survives its pin, or reddens with a message that does not name the defect, fails this suite.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { createContext, runInContext } from 'node:vm';

const SRC = readFileSync(
  new URL('../extension/linked-state.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m038-linked-state.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------ measured facts ----

/** The value the source signal holds in the recording. */
const SOURCE_VALUE = RECORDING.source.instanceValue;
/** The value the agreeing linked signal holds; T001 measured it equal to the source. */
const AGREEING_VALUE = RECORDING.subjects.agreeing.instanceValue;
/** The value the differing linked signal was written to; T001 measured it unequal to the source. */
const DIFFERING_VALUE = RECORDING.subjects.differing.instanceValue;

const AGREEING_INDEX = RECORDING.subjects.agreeing.node.index;
const DIFFERING_INDEX = RECORDING.subjects.differing.node.index;
const SOURCE_INDEX = RECORDING.source.node.index;

/** The six fields the contract names, and the whole of what a finding may carry. */
const CONTRACT_KEYS = [
  'reason',
  'signal',
  'source',
  'sourceValue',
  'state',
  'value',
];

// ---------------------------------------------------------------- plumbing ----

/**
 * The standalone module: a bare context holding the source and whatever the caller puts in it. A
 * bare `node:vm` context installs no DOM and no network; the two names it does install in every
 * realm (`Date`, `console`) are handled by the guarded run below.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const api = context.angularAiLinkedState;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(
    typeof api.linkedState,
    'function',
    'the module publishes the join',
  );
  return { api, context };
}

function pristineApi() {
  return standalone().api;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into this
 * realm before a structural assertion reads it. It is also how every fact is cloned, so a test can
 * never mutate the parsed recording for the next one.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/** The graph the recording measured, as its own object: `{ nodes, edges, nodeCount, edgeCount }`. */
function graphClone() {
  return clone(RECORDING.graph);
}

/** A fact: the recorded graph plus the label of the linked signal to report. */
function measuredFact(subject, graph = graphClone()) {
  return { graph, signal: subject };
}

/** A graph edited by `change`, cloned first so the recording is never touched. */
function editedGraph(change) {
  const graph = graphClone();
  change(graph);
  return graph;
}

/**
 * The recording's graph with both linked signals and every edge that touches them removed. What is
 * left is the template consumer, the source signal and the plain computed: a record that carries no
 * linked signal, which E1 says yields no finding.
 */
function graphWithoutLinkedSignals() {
  const graph = graphClone();
  const linked = new Set(
    graph.nodes
      .filter((node) => node.kind === 'linkedSignal')
      .map((node) => node.index),
  );
  graph.nodes = graph.nodes.filter((node) => !linked.has(node.index));
  graph.edges = graph.edges.filter(
    (edge) => !linked.has(edge.consumer) && !linked.has(edge.producer),
  );
  graph.nodeCount = graph.nodes.length;
  graph.edgeCount = graph.edges.length;
  return graph;
}

/** The recording's graph with the named linked signal's stored value replaced. */
function graphWithSignalValue(subject, value) {
  const graph = graphClone();
  const node = graph.nodes.find(
    (entry) => entry.kind === 'linkedSignal' && entry.label === subject,
  );
  assert.ok(
    node,
    `the recording must carry a linked signal labelled ${subject}`,
  );
  node.value = value;
  return graph;
}

/**
 * The six ways the source of the agreeing signal is unreadable, each edited from the measured graph:
 * no producer edge, a producer the graph does not hold, a source with no readable value, a source of
 * another kind, a source with no name, and two signal producers. E2 requires each to be
 * cannot-tell/source-unreadable.
 */
function unreadableSourceGraphs() {
  return [
    [
      'no producer edge',
      editedGraph((graph) => {
        graph.edges = graph.edges.filter(
          (edge) => edge.consumer !== AGREEING_INDEX,
        );
        graph.edgeCount = graph.edges.length;
      }),
    ],
    [
      'a producer the graph does not hold',
      editedGraph((graph) => {
        graph.nodes = graph.nodes.filter((node) => node.index !== SOURCE_INDEX);
        graph.nodeCount = graph.nodes.length;
      }),
    ],
    [
      'a source with no readable value',
      editedGraph((graph) => {
        graph.nodes.find((node) => node.index === SOURCE_INDEX).value = null;
      }),
    ],
    [
      'a source of another kind',
      editedGraph((graph) => {
        graph.nodes.find((node) => node.index === SOURCE_INDEX).kind =
          'computed';
      }),
    ],
    [
      'a source with no name',
      editedGraph((graph) => {
        graph.nodes.find((node) => node.index === SOURCE_INDEX).label = null;
      }),
    ],
    [
      'two signal producers',
      editedGraph((graph) => {
        graph.nodes.push({
          index: 99,
          kind: 'signal',
          label: 'second-source',
          value: 9,
        });
        graph.edges.push({ consumer: AGREEING_INDEX, producer: 99 });
        graph.nodeCount = graph.nodes.length;
        graph.edgeCount = graph.edges.length;
      }),
    ],
  ];
}

/**
 * A fact carrying a field the join does not read, for E7. Every recorded node gains `fn`, `epoch`,
 * `cause`, `owner` and `written`; every edge gains `reason` and `owner`; the fact carries top-level
 * `value`, `sourceValue`, `source`, `cause`, `owner`, `written`, `note`, `reset` and a decoy `extra`
 * object holding a whole linked-signal node. None of it may change what the join reports.
 */
function withExtraFields(graph, subject) {
  for (const node of graph.nodes) {
    node.fn = 'function () { return 0; }';
    node.epoch = 99;
    node.cause = 'a cause the graph does not carry';
    node.owner = 'nobody';
    node.written = true;
  }
  for (const edge of graph.edges) {
    edge.reason = 'because';
    edge.owner = 'nobody';
  }
  return {
    graph,
    signal: subject,
    value: 99,
    sourceValue: 99,
    source: 'not-the-source',
    cause: 'written by the owner',
    owner: 'the caller',
    written: true,
    note: 'ignore me',
    reset: 'a recomputation',
    extra: {
      nodes: [{ index: 42, kind: 'linkedSignal', label: subject, value: 99 }],
      edges: [],
    },
  };
}

function extraFieldFact(subject) {
  return withExtraFields(graphClone(), subject);
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
    `mutation anchor not found in extension/linked-state.js — restate the bite: ${JSON.stringify(anchor)}`,
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

// ---------------------------------------------------------------- the pins ----

/**
 * AC1. A signal whose value agrees with its source produces a finding naming the signal, the source
 * and both values. The agreeing subject is the recording's own: label `agreeing`, value 7, source
 * `source`, value 7.
 */
function pinAgreement(api) {
  const result = clone(api.linkedState(measuredFact('agreeing')));
  assert.equal(result.state, 'finding', 'AC1 state pin');
  assert.equal(result.signal, 'agreeing', 'AC1 signal names the linked signal');
  assert.equal(result.source, 'source', 'AC1 source names the source signal');
  assert.equal(result.value, AGREEING_VALUE, 'AC1 value pin');
  assert.equal(result.sourceValue, SOURCE_VALUE, 'AC1 source-value pin');
  assert.equal(result.reason, 'matching', 'AC1 agreement pin');
  assert.deepEqual(
    Object.keys(result).sort(),
    CONTRACT_KEYS,
    'AC1 finding carries exactly the six fields the contract names',
  );
  return result;
}

/**
 * AC2 and E3. The differing subject produces a distinct finding naming its own value and its
 * source's, and the two states are never merged: the agreement words differ, and the two findings
 * are not the same answer.
 */
function pinDiffering(api) {
  const matching = clone(api.linkedState(measuredFact('agreeing')));
  const differing = clone(api.linkedState(measuredFact('differing')));
  assert.equal(differing.state, 'finding', 'AC2 state pin');
  assert.equal(
    differing.signal,
    'differing',
    'AC2 signal names the differing linked signal',
  );
  assert.equal(
    differing.source,
    'source',
    'AC2 source names the source signal',
  );
  assert.equal(differing.value, DIFFERING_VALUE, 'AC2 value pin');
  assert.equal(differing.sourceValue, SOURCE_VALUE, 'AC2 source-value pin');
  assert.notEqual(
    differing.value,
    differing.sourceValue,
    'AC2 the two values differ pin',
  );
  assert.equal(differing.reason, 'differing', 'AC2 differing reason pin');
  assert.notEqual(
    differing.reason,
    matching.reason,
    'AC2 the two states are never merged pin',
  );
  assert.notDeepEqual(
    differing,
    matching,
    'AC2 the two findings are distinct pin',
  );
  return { matching, differing };
}

/**
 * E3, held out. The agreement is computed from the two values, never from the label or the type of
 * the values: the `differing` label holding the source's value states `matching`, and the
 * `differing` label holding 8 states `differing`. Equal and unequal values are never merged.
 */
function pinEqualAndUnequalNeverMerged(api) {
  // Constructed, and said so here: T001's differing subject holds 8. This fact gives the same
  // measured node the source's value, so the two facts differ in the value alone.
  const equalValue = measuredFact(
    'differing',
    graphWithSignalValue('differing', SOURCE_VALUE),
  );
  const matching = clone(api.linkedState(equalValue));
  const differing = clone(api.linkedState(measuredFact('differing')));

  assert.equal(matching.state, 'finding', 'E3 equal-values-are-matching pin');
  assert.equal(matching.reason, 'matching', 'E3 equal-values-are-matching pin');
  assert.equal(
    matching.value,
    matching.sourceValue,
    'E3 equal-values-are-matching pin',
  );

  assert.equal(
    differing.state,
    'finding',
    'E3 unequal-values-are-differing pin',
  );
  assert.equal(
    differing.reason,
    'differing',
    'E3 unequal-values-are-differing pin',
  );
  assert.notEqual(
    differing.value,
    differing.sourceValue,
    'E3 unequal-values-are-differing pin',
  );

  assert.notEqual(matching.reason, differing.reason, 'E3 never-merged pin');
  assert.notDeepEqual(matching, differing, 'E3 never-merged pin');
  return { matching, differing };
}

/**
 * E1, held out. A record with no linked signal yields no finding — and the plain computed, which
 * carries the field-name label a linked signal also carries, is not a linked signal: the node kind
 * is what identifies one (T001's measurement).
 */
function pinNoFindingWithoutLinkedSignal(api) {
  const noLinked = graphWithoutLinkedSignals();

  // The computed alone: labelled `plainComputed`, of kind `computed`, and not a linked signal.
  const computedOnly = clone(
    api.linkedState({ graph: noLinked, signal: 'plainComputed' }),
  );
  assert.equal(
    computedOnly.state,
    'cannot-tell',
    'E1 no-finding pin (the plain computed alone)',
  );
  assert.equal(
    computedOnly.reason,
    'no-linked-signal',
    'E1 named-reason pin (the plain computed alone)',
  );

  for (const [what, fact] of [
    [
      'a record with no linked signal',
      { graph: graphWithoutLinkedSignals(), signal: 'agreeing' },
    ],
    ['an empty fact', {}],
    ['a null fact', null],
    [
      'a graph with no nodes',
      { graph: { nodes: [], edges: [] }, signal: 'agreeing' },
    ],
  ]) {
    const result = clone(api.linkedState(fact));
    assert.equal(result.state, 'cannot-tell', `E1 no-finding pin (${what})`);
    assert.equal(
      result.reason,
      'no-linked-signal',
      `E1 named-reason pin (${what})`,
    );
    for (const key of ['signal', 'source', 'value', 'sourceValue']) {
      assert.equal(key in result, false, `E1 no finding field pin (${what})`);
    }
  }
  return computedOnly;
}

/**
 * E2, held out. A signal whose source is unreadable yields cannot-tell with the named reason, for
 * every measured way a source can be unreadable, and carries no finding field.
 */
function pinUnreadableSource(api) {
  const answers = [];
  for (const [what, graph] of unreadableSourceGraphs()) {
    const result = clone(api.linkedState({ graph, signal: 'agreeing' }));
    assert.equal(result.state, 'cannot-tell', `E2 state pin (${what})`);
    assert.equal(result.reason, 'source-unreadable', `E2 reason pin (${what})`);
    for (const key of ['signal', 'source', 'value', 'sourceValue']) {
      assert.equal(key in result, false, `E2 no finding field pin (${what})`);
    }
    answers.push(result);
  }
  return answers;
}

// ------------------------------------------------------- the claim vocabulary ----

/**
 * What no output may name: a write, an owner, a cause, or a recomputation standing in for one. The
 * graph records values, so every one of these would be a claim it does not carry (E4, N1, N2).
 */
const FORBIDDEN_CLAIMS = [
  ['a write', /\b(writ(?:e|es|ten|ing)|wrote|set\s+by|assigned)\b/i],
  ['an owner', /\b(own(?:er|ers|ed|s))\b/i],
  ['a cause', /\b(cause|causes|caused|causal|because|why)\b/i],
  [
    'a recomputation',
    /\b(recomput(?:e|ed|es|ation)|recalculat(?:e|ed|es|ion)|reset|resets)\b/i,
  ],
];

/** Every string a result carries, in key order — keys are not strings a caller renders. */
function stringsIn(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) stringsIn(item, out);
  else if (value && typeof value === 'object')
    for (const key of Object.keys(value)) stringsIn(value[key], out);
  return out;
}

/**
 * E4. No string this module emits names a write, an owner or a cause, and no field beyond the six
 * the contract names appears at all — the stricter half of "no output names what the graph does not
 * carry".
 */
function assertNoClaim(result, what) {
  const text = JSON.stringify(result);
  for (const [claim, pattern] of FORBIDDEN_CLAIMS) {
    assert.equal(
      pattern.test(text),
      false,
      `E4 no write, owner or cause (${claim}): ${what} emitted ${text}`,
    );
  }
  for (const key of Object.keys(result)) {
    assert.equal(
      CONTRACT_KEYS.includes(key),
      true,
      `E4 no field beyond the contract: ${what} emitted ${JSON.stringify(key)}`,
    );
  }
}

/**
 * E4's pin: both findings and all four absences are scanned, and each absence is checked to be the
 * absence its fact was built for, so the scan cannot pass by never running.
 */
function pinNoWriteOwnerOrCause(api) {
  for (const subject of ['agreeing', 'differing']) {
    const result = clone(api.linkedState(measuredFact(subject)));
    assert.equal(
      result.state,
      'finding',
      `E4 the ${subject} fact is a finding`,
    );
    assertNoClaim(result, `the ${subject} finding`);
  }

  for (const [reason, fact] of [
    [
      'no-linked-signal',
      { graph: graphWithoutLinkedSignals(), signal: 'agreeing' },
    ],
    ['signal-unreadable', measuredFact('no-such-signal')],
    [
      'value-unreadable',
      { graph: graphWithSignalValue('agreeing', null), signal: 'agreeing' },
    ],
    [
      'source-unreadable',
      { graph: unreadableSourceGraphs()[0][1], signal: 'agreeing' },
    ],
  ]) {
    const result = clone(api.linkedState(fact));
    assert.equal(
      result.state,
      'cannot-tell',
      `E4 the ${reason} fact must be an absence`,
    );
    assert.equal(
      result.reason,
      reason,
      `E4 the ${reason} fact must be named ${reason}`,
    );
    assertNoClaim(result, `the ${reason} answer`);
  }
}

/**
 * E7, held out. A fact carrying fields the join does not read — at the fact, on every node, on
 * every edge, even a whole decoy graph under another key — changes nothing it reports.
 */
function pinExtraFieldsIgnored(api) {
  for (const subject of ['agreeing', 'differing']) {
    const baseline = clone(api.linkedState(measuredFact(subject)));
    const extra = clone(api.linkedState(extraFieldFact(subject)));
    assert.equal(
      extra.signal,
      baseline.signal,
      'E7 extra fields change nothing the join reads (signal)',
    );
    assert.equal(
      extra.source,
      baseline.source,
      'E7 extra fields change nothing the join reads (source)',
    );
    assert.equal(
      extra.value,
      baseline.value,
      'E7 extra fields change nothing the join reads (value)',
    );
    assert.equal(
      extra.sourceValue,
      baseline.sourceValue,
      'E7 extra fields change nothing the join reads (sourceValue)',
    );
    assert.equal(
      extra.reason,
      baseline.reason,
      'E7 extra fields change nothing the join reads (reason)',
    );
    assert.deepEqual(
      extra,
      baseline,
      'E7 extra fields change nothing the join reads',
    );
    assertNoClaim(extra, `the extras on ${subject}`);
  }

  const baselineAbsence = clone(
    api.linkedState({ graph: graphWithoutLinkedSignals(), signal: 'agreeing' }),
  );
  const extraAbsence = clone(
    api.linkedState(withExtraFields(graphWithoutLinkedSignals(), 'agreeing')),
  );
  assert.deepEqual(
    extraAbsence,
    baselineAbsence,
    'E7 extra fields change nothing the join reads (absence)',
  );
  return baselineAbsence;
}

// -------------------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('the recording measures two linked signals, their labels, their values and their source', () => {
    const linked = RECORDING.graph.nodes.filter(
      (node) => node.kind === 'linkedSignal',
    );
    assert.deepEqual(
      linked.map((node) => node.label),
      ['agreeing', 'differing'],
      'the two linked signals carry the field names as labels',
    );
    assert.deepEqual(
      linked.map((node) => node.value),
      [7, 8],
      'the linked signals hold 7 and 8',
    );
    assert.equal(RECORDING.source.node.kind, 'signal');
    assert.equal(RECORDING.source.node.label, 'source');
    assert.equal(RECORDING.source.node.value, 7);

    // The measured fixture values this suite pins. A moved value reddens here, naming the move; a
    // pin is re-cut from a fresh capture, never hand-edited to fit.
    assert.equal(SOURCE_VALUE, 7);
    assert.equal(AGREEING_VALUE, 7);
    assert.equal(DIFFERING_VALUE, 8);

    // The label identifies nothing by itself: the plain computed carries its field name too, and
    // the node kind is what separates the two.
    const computed = RECORDING.graph.nodes.filter(
      (node) => node.kind === 'computed',
    );
    assert.deepEqual(
      computed.map((node) => node.label),
      ['plainComputed'],
    );
    assert.equal(RECORDING.labels.labelIsTheFieldName, true);
    assert.equal(RECORDING.labels.labelIdentifiesALinkedSignal, false);
    assert.equal(RECORDING.labels.theNodeKindIdentifiesALinkedSignal, true);
    console.log(
      `linked-state measurement: labels ${JSON.stringify(linked.map((node) => node.label))}, values ${JSON.stringify(linked.map((node) => node.value))}, source ${JSON.stringify(RECORDING.source.node)}`,
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
  const sandbox = { __fact: fact };
  for (const name of HOST_GLOBALS) sandbox[name] = tripwire(name);
  const { context } = standalone(source, sandbox);
  return clone(
    runInContext('angularAiLinkedState.linkedState(__fact)', context),
  );
}

describe('purity', () => {
  it('loads bare, publishes the join and reaches for no host global', () => {
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
    assert.equal(api.FINDING, 'finding');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.MATCHING, 'matching');
    assert.equal(api.DIFFERING, 'differing');
    assert.equal(api.NO_LINKED_SIGNAL, 'no-linked-signal');
    assert.equal(api.SIGNAL_UNREADABLE, 'signal-unreadable');
    assert.equal(api.VALUE_UNREADABLE, 'value-unreadable');
    assert.equal(api.SOURCE_UNREADABLE, 'source-unreadable');

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

    const answered = guarded(SRC, measuredFact('agreeing'));
    assert.equal(
      answered.state,
      'finding',
      'the join answers a measured fact while every host global in scope is a trap',
    );
    console.log(`linked-state guarded: ${JSON.stringify(answered)}`);
  });
});

// ------------------------------------------------------------------- AC1: a finding ----

describe('AC1 — an agreeing value produces a finding', () => {
  it('names the signal, the source and both values, and names neither by a constant', () => {
    const caught = proveNonVacuous(pinAgreement, [
      {
        what: "M1 finding reports 'linked-signal' instead of the label the graph gave it",
        anchor: '      signal: label,',
        replacement: "      signal: 'linked-signal',",
        message: /AC1 signal names the linked signal/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('agreeing')));
          assert.equal(
            result.signal,
            'linked-signal',
            'the mutant stops naming the linked signal',
          );
        },
      },
      {
        what: 'M2 finding reports the signal as its own source',
        anchor: '      source: source.label,',
        replacement: '      source: label,',
        message: /AC1 source names the source signal/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('agreeing')));
          assert.equal(
            result.source,
            'agreeing',
            'the mutant stops naming the source the graph gave it',
          );
        },
      },
    ]);
    console.log(`AC1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E1 a record with no linked signal yields no finding, and kind — not label — identifies one', () => {
    const caught = proveNonVacuous(pinNoFindingWithoutLinkedSignal, [
      {
        what: 'M3 the empty record is no longer refused',
        anchor:
          '    if (linked.length === 0) return cannotTell(NO_LINKED_SIGNAL);',
        replacement: '    if (false) return cannotTell(NO_LINKED_SIGNAL);',
        message: /E1 named-reason pin/,
        defect(api) {
          const result = clone(
            api.linkedState({
              graph: graphWithoutLinkedSignals(),
              signal: 'agreeing',
            }),
          );
          assert.equal(
            result.reason,
            'signal-unreadable',
            'the mutant answers a record with no linked signal with the subject reason',
          );
        },
      },
      {
        what: 'M4 a linked signal is identified by label instead of node kind',
        anchor:
          '      if (kindOf(nodes[i]) === LINKED_SIGNAL_KIND) found.push(nodes[i]);',
        replacement:
          '      if (labelOf(nodes[i]) !== null) found.push(nodes[i]);',
        message: /E1 no-finding pin \(the plain computed alone\)/,
        defect(api) {
          const result = clone(
            api.linkedState({
              graph: graphWithoutLinkedSignals(),
              signal: 'plainComputed',
            }),
          );
          assert.equal(
            result.state,
            'finding',
            'the mutant treats the plain computed as a linked signal because its label looks like one',
          );
        },
      },
    ]);
    console.log(`E1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------- AC2 and E3: two states ----

describe('AC2 — a differing value produces a distinct finding', () => {
  it('reports the differing value and the source value, never the matching answer', () => {
    const caught = proveNonVacuous(pinDiffering, [
      {
        what: 'M5 the differing agreement is flattened into the matching one',
        anchor:
          '    const agreement = value === source.value ? MATCHING : DIFFERING;',
        replacement: '    const agreement = MATCHING;',
        message: /AC2 differing reason pin/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('differing')));
          assert.equal(
            result.reason,
            'matching',
            'the mutant reports the differing value as matching',
          );
        },
      },
      {
        what: 'M6 the differing value is replaced by the source value',
        anchor: '      value: value,',
        replacement: '      value: source.value,',
        message: /AC2 value pin/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('differing')));
          assert.equal(
            result.value,
            result.sourceValue,
            'the mutant merges the two values into one',
          );
        },
      },
    ]);
    console.log(`AC2 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E3 equal and unequal values are never merged into one state', () => {
    const caught = proveNonVacuous(pinEqualAndUnequalNeverMerged, [
      {
        what: 'M7 the agreement is decided by the label, not by the values',
        anchor:
          '    const agreement = value === source.value ? MATCHING : DIFFERING;',
        replacement:
          '    const agreement = labelOf(signal) === DIFFERING ? DIFFERING : MATCHING;',
        message: /E3 equal-values-are-matching pin/,
        defect(api) {
          const result = clone(
            api.linkedState(
              measuredFact(
                'differing',
                graphWithSignalValue('differing', SOURCE_VALUE),
              ),
            ),
          );
          assert.equal(
            result.reason,
            'differing',
            'the mutant calls an equal pair differing because of the label it carries',
          );
        },
      },
      {
        what: 'M8 the agreement is decided by the values\u2019 type, not their equality',
        anchor:
          '    const agreement = value === source.value ? MATCHING : DIFFERING;',
        replacement:
          '    const agreement = typeof value === typeof source.value ? MATCHING : DIFFERING;',
        message: /E3 unequal-values-are-differing pin/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('differing')));
          assert.equal(
            result.reason,
            'matching',
            'the mutant calls two different numbers matching because both are numbers',
          );
        },
      },
    ]);
    console.log(`E3 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------------------------------- AC3/E2: no source ----

describe('AC3 — an unreadable source yields cannot-tell with a named reason', () => {
  it('answers every measured way a source can be unreadable', () => {
    const caught = proveNonVacuous(pinUnreadableSource, [
      {
        what: 'M9 an unreadable source is named as another absence',
        anchor:
          '    if (source === null) return cannotTell(SOURCE_UNREADABLE);',
        replacement:
          '    if (source === null) return cannotTell(NO_LINKED_SIGNAL);',
        message: /E2 reason pin/,
        defect(api) {
          const result = clone(
            api.linkedState({
              graph: unreadableSourceGraphs()[0][1],
              signal: 'agreeing',
            }),
          );
          assert.equal(
            result.reason,
            'no-linked-signal',
            'the mutant names the wrong absence for an unreadable source',
          );
        },
      },
      {
        what: 'M10 a source holding no readable value is accepted as a source',
        anchor:
          '    const value = scalarOf(source.value);\n' +
          '    if (label === null || value === null) return null;',
        replacement:
          '    const value = source.value;\n' +
          '    if (label === null) return null;',
        message: /E2 state pin/,
        defect(api) {
          const result = clone(
            api.linkedState({
              graph: graphWithSignalValue('agreeing', AGREEING_VALUE),
              signal: 'agreeing',
            }),
          );
          assert.equal(
            result.state,
            'finding',
            'the readable control is a finding',
          );
          const unreadable = clone(
            api.linkedState({
              graph: editedGraph((graph) => {
                graph.nodes.find((node) => node.index === SOURCE_INDEX).value =
                  null;
              }),
              signal: 'agreeing',
            }),
          );
          assert.equal(
            unreadable.state,
            'finding',
            'the mutant builds a finding from a source whose value is not readable',
          );
          assert.equal(unreadable.sourceValue, null);
        },
      },
    ]);
    console.log(`E2 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------------- AC4/E4: no claim ----

describe('AC4 — no output names a write, an owner or a cause', () => {
  it('scans both findings and all four absences, and refuses a seventh field', () => {
    const caught = proveNonVacuous(pinNoWriteOwnerOrCause, [
      {
        what: 'M11 a finding carries a note saying the value was written by its owner',
        anchor: '      reason: agreement,',
        replacement:
          '      reason: agreement,\n' +
          "      note: 'this value was written by the owner',",
        message: /E4 no write, owner or cause/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('agreeing')));
          assert.equal(
            result.note,
            'this value was written by the owner',
            'the mutant attaches the claim the pin hunts',
          );
        },
      },
      {
        what: 'M12 a finding carries a seventh field the contract does not name',
        anchor: '      reason: agreement,',
        replacement:
          '      reason: agreement,\n' + "      agreement: 'matching',",
        message: /E4 no field beyond the contract/,
        defect(api) {
          const result = clone(api.linkedState(measuredFact('agreeing')));
          assert.equal(
            result.agreement,
            'matching',
            'the mutant adds a field the contract does not name',
          );
        },
      },
      {
        what: 'M13 an absence carries a cause',
        anchor: '    return { state: CANNOT_TELL, reason: reason };',
        replacement:
          '    return {\n' +
          '      state: CANNOT_TELL,\n' +
          '      reason: reason,\n' +
          "      cause: 'a cause the graph does not carry',\n" +
          '    };',
        message: /E4 no write, owner or cause/,
        defect(api) {
          const result = clone(
            api.linkedState({
              graph: graphWithoutLinkedSignals(),
              signal: 'agreeing',
            }),
          );
          assert.equal(
            result.cause,
            'a cause the graph does not carry',
            'the mutant attaches a cause to an absence',
          );
        },
      },
    ]);
    console.log(`E4 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// --------------------------------------------------------------- E7: extra fields ----

describe('E7 — a fact carrying a field the join does not read changes nothing', () => {
  it('ignores extras on the fact, on every node and on every edge', () => {
    const caught = proveNonVacuous(pinExtraFieldsIgnored, [
      {
        what: 'M14 the join reads a value off the fact instead of the node',
        anchor: '    const value = scalarOf(signal.value);',
        replacement:
          '    const value = scalarOf(read.value !== undefined ? read.value : signal.value);',
        message: /E7 extra fields change nothing the join reads/,
        defect(api) {
          const result = clone(api.linkedState(extraFieldFact('agreeing')));
          assert.equal(
            result.value,
            99,
            'the mutant reports the fact\u2019s decoy value',
          );
        },
      },
      {
        what: 'M15 the join reads a cause off the source node instead of its value',
        anchor: '    const value = scalarOf(source.value);',
        replacement:
          '    const value = scalarOf(source.cause !== undefined ? source.cause : source.value);',
        message: /E7 extra fields change nothing the join reads/,
        defect(api) {
          const result = clone(api.linkedState(extraFieldFact('agreeing')));
          assert.equal(
            result.sourceValue,
            'a cause the graph does not carry',
            'the mutant reports the source node\u2019s decoy cause as the source value',
          );
        },
      },
    ]);
    console.log(`E7 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------------------------------- the vocabulary ----

describe('vocabulary', () => {
  it('uses only the four reasons and the two agreements the contract names, and reaches all six', () => {
    const api = pristineApi();
    const reasons = new Set();
    const agreements = new Set();
    for (const fact of [
      measuredFact('agreeing'),
      measuredFact('differing'),
      { graph: graphWithoutLinkedSignals(), signal: 'agreeing' },
      measuredFact('no-such-signal'),
      { graph: graphWithSignalValue('agreeing', null), signal: 'agreeing' },
      { graph: unreadableSourceGraphs()[0][1], signal: 'agreeing' },
    ]) {
      const result = clone(api.linkedState(fact));
      if (result.state === 'cannot-tell') reasons.add(result.reason);
      else agreements.add(result.reason);
    }
    assert.deepEqual([...reasons].sort(), [
      'no-linked-signal',
      'signal-unreadable',
      'source-unreadable',
      'value-unreadable',
    ]);
    assert.deepEqual([...agreements].sort(), ['differing', 'matching']);
    console.log(
      `linked-state vocabulary: reasons ${JSON.stringify([...reasons].sort())}, agreements ${JSON.stringify([...agreements].sort())}`,
    );
  });

  it('a fact naming no readable subject is cannot-tell/signal-unreadable', () => {
    const api = pristineApi();
    for (const [what, fact] of [
      ['no signal named', { graph: graphClone() }],
      ['a blank signal', { graph: graphClone(), signal: '   ' }],
      ['a non-string signal', { graph: graphClone(), signal: 7 }],
      ['a label no linked signal carries', measuredFact('plainComputed')],
    ]) {
      const result = clone(api.linkedState(fact));
      assert.equal(result.state, 'cannot-tell', `signal-unreadable (${what})`);
      assert.equal(
        result.reason,
        'signal-unreadable',
        `signal-unreadable (${what})`,
      );
      assert.equal('signal' in result, false, `no finding field (${what})`);
    }
    console.log(
      'linked-state signal-unreadable: {"state":"cannot-tell","reason":"signal-unreadable"}',
    );
  });
});
