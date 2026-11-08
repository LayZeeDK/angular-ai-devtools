// Tests for extension/render-phase.js — the join between one effect, the signals the graph's edges
// say it reads, and the phase the page cannot report.
//
// The module is evaluated in a bare `node:vm` context; the checkout is never written. Two pins guard
// purity: the context carries no DOM, clock, console or network, and the join is run again in a
// context where every one of those names is a trap, so a module that reached for one is caught
// rather than answered exactly as the clean module is.
//
// The facts are T001's measurements (`research/raw/m039-render-phase.json`): the counter read's six
// nodes and six edges with the effect at node 5, id "6", label "", epoch 1 and one edge to
// `signal:count` (node 2); the `/stale-view` effect, node 0, an effect whose graph records no edge at
// all; and the portal's one labelled effect, `Resource.loadEffect`, reading the `linkedSignal`
// labelled `Resource.extRequest`. The 26 `ProfilerEvent` values are re-read too, because the phase
// answer is only honest while none of them is an effect event.
//
// Three facts are constructed from measured parts, and each says so where it is built: the portal
// graph (T001 recorded the labelled effect, its producer and the label set, but not the whole portal
// node list), the two-read graph (the recording's effect has one edge, and the ordering pin needs an
// edge order that is not the order the labels sort in), and the change-detection message (T001
// captured none — its own record says `messages: []` — so the digest's single NG0100 entry stands in,
// as the recording names it: a digest entry, never a capture).
//
// The states this module can produce are pinned exactly:
//
//   effect                 the effect named by the label the graph gives it, or by nothing when the
//                          graph gives none, with the signals its consumer edges name (AC1, E2).
//   effect / empty read    an effect whose edges name no producer still produces a finding naming the
//                          effect and reporting an empty read (E3).
//   change-detection       the recorded message beside the effect, never joined to it (E5, E6).
//   cannot-tell            one of three reasons and nothing else: `graph-unreadable`, `no-effect-node`
//                          (E1) and `effect-unreadable`, and never the words "no effects".
//   phase                  always cannot-tell with the named absence `no-effect-event`, outside every
//                          finding (E4), and byte-identical on a second read (E8).
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
  new URL('../extension/render-phase.js', import.meta.url),
  'utf8',
);
const RECORDING = JSON.parse(
  readFileSync(
    new URL('../research/raw/m039-render-phase.json', import.meta.url),
    'utf8',
  ),
);

// ------------------------------------------------------------ measured facts ----

/** The counter read: node 5, id "6", label "", epoch 1, one edge to `signal:count`. */
const COUNTER = RECORDING.effect.freshRead;
const COUNTER_NODES = COUNTER.nodes;
const COUNTER_EDGES = COUNTER.allEdges;
const COUNTER_INDEX = COUNTER.nodeIndex;
/** `signal:count` — the effect's one recorded producer. */
const COUNT_INDEX = COUNTER.edges[0].producer;
/** `signal:title`, measured node 1: the second signal of the constructed two-read graph (E8). */
const TITLE_INDEX = 1;
/** `/stale-view`: one effect node, node 0, and a graph with no edge at all (E3's measured fixture). */
const STALE_VIEW = RECORDING.effect.effectNodesOnTheFixturePagesRead.find(
  (page) => page.route === '/stale-view',
);
/** The portal's one labelled effect, node 15, `Resource.loadEffect`. */
const PORTAL = RECORDING.effect.portalRead.labelledEffectNodes[0];
/** The digest's NG0100 entry: T001 captured no message, and recorded that it captured none. */
const SUBSTITUTE = RECORDING.changeDetection.substitute;
/** The panel package's profiler read: 26 values, none of them an effect event. */
const PROFILER = RECORDING.profiler.sources[0];

/** The phase: one object, one state, one named absence. */
const PHASE = { state: 'cannot-tell', absence: 'no-effect-event' };

/** The four fields an effect finding may carry, and the whole of what one may carry. */
const EFFECT_KEYS = ['effect', 'namedBy', 'reads', 'state'];
/** The four fields a change-detection finding may carry, and the whole of what one may carry. */
const CHANGE_KEYS = ['code', 'message', 'provenance', 'state'];
/** The two fields an absence may carry. */
const ABSENCE_KEYS = ['reason', 'state'];

// ---------------------------------------------------------------- plumbing ----

/**
 * The standalone module: a bare context holding the source and whatever the caller puts in it. A
 * bare `node:vm` context installs no DOM and no network; the two names it does install in every realm
 * (`Date`, `console`) are handled by the guarded run below.
 */
function standalone(source = SRC, sandbox = {}) {
  const context = createContext(sandbox);
  runInContext(source, context);
  const api = context.angularAiRenderPhase;
  assert.ok(
    api,
    'the module must publish its namespace on the global object of whatever world it runs in',
  );
  assert.equal(
    typeof api.renderPhase,
    'function',
    'the module publishes the join',
  );
  return { api, context };
}

function pristineApi() {
  return standalone().api;
}

/**
 * A value from the vm context carries that context's own prototypes, so it is copied into this realm
 * before a structural assertion reads it. It is also how every fact is cloned, so a test can never
 * mutate the parsed recording for the next one.
 */
function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nodeAt(graph, index) {
  return graph.nodes.find((node) => node.index === index);
}

/** The counter graph the recording measured: six nodes, six edges, no field edited. */
function counterGraph() {
  return { nodes: clone(COUNTER_NODES), edges: clone(COUNTER_EDGES) };
}

/** The effect's one recorded edge, as the graph records it: `{ consumer, producer }` and nothing else. */
function counterEdge() {
  return { consumer: COUNTER_INDEX, producer: COUNT_INDEX };
}

/** A fact for the counter read: the measured graph and the effect named by its recorded edge. */
function counterFact(overrides = {}) {
  return {
    graph: counterGraph(),
    effect: { edge: counterEdge() },
    ...overrides,
  };
}

/** `/stale-view` as a graph: the one effect node T001 measured, and no edge at all. */
function edgelessGraph() {
  return {
    nodes: [
      {
        index: STALE_VIEW.nodeIndex,
        id: STALE_VIEW.id,
        kind: STALE_VIEW.kind,
        label: STALE_VIEW.label,
        epoch: STALE_VIEW.epoch,
      },
    ],
    edges: [],
  };
}

/**
 * The counter graph with the effect's consumer edges removed. The named signals stay in the node
 * list, so a module that borrowed a signal for a readless effect would have one to borrow.
 */
function counterGraphWithoutReads() {
  const graph = counterGraph();
  graph.edges = graph.edges.filter((edge) => edge.consumer !== COUNTER_INDEX);
  return graph;
}

/**
 * Constructed from measured parts: the counter graph with the effect reading `signal:title` (node 1)
 * as well as `signal:count` (node 2), the title edge recorded first. T001's effect has one edge, and
 * the ordering pin (E8) needs a recorded edge order that is not the order the labels sort in.
 */
function twoReadGraph() {
  const graph = counterGraph();
  graph.edges.unshift({ consumer: COUNTER_INDEX, producer: TITLE_INDEX });
  return graph;
}

/**
 * Constructed from the recorded parts of the portal read: the labelled effect node 15, the
 * `linkedSignal` labelled `Resource.extRequest` at index 3, and the edge between them. T001 recorded
 * this effect, its producer and the portal's whole label set, but not the portal's node list.
 */
function portalGraph() {
  const producer = PORTAL.producers[0];
  return {
    nodes: [
      {
        index: producer.index,
        kind: producer.kind,
        label: producer.label,
        epoch: 1,
      },
      {
        index: PORTAL.nodeIndex,
        id: PORTAL.id,
        kind: 'effect',
        label: PORTAL.label,
        epoch: PORTAL.epoch,
      },
    ],
    edges: [{ consumer: PORTAL.nodeIndex, producer: producer.index }],
  };
}

/** The counter graph with its effect node and its edges removed: readable, and holding no effect. */
function graphWithoutEffect() {
  const graph = counterGraph();
  graph.nodes = graph.nodes.filter((node) => node.index !== COUNTER_INDEX);
  graph.edges = graph.edges.filter((edge) => edge.consumer !== COUNTER_INDEX);
  return graph;
}

/**
 * The recorded change-detection message. T001 captured none (`messages: []`) and recorded the digest's
 * single NG0100 entry as its stand-in; this fact carries that entry's own words and names the
 * provenance as the digest entry it is, so the suite can never mistake a substitute for a capture.
 */
function digestMessage() {
  return {
    code: SUBSTITUTE.code,
    message: SUBSTITUTE.title,
    provenance: `${SUBSTITUTE.kind}:${SUBSTITUTE.source}`,
  };
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
    `mutation anchor not found in extension/render-phase.js — restate the bite: ${JSON.stringify(anchor)}`,
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

// ------------------------------------------------------- the claim vocabulary ----

/**
 * What no output may name: a write, an owner or a cause. The graph records a kind, a label and an
 * edge; a write is source text, and none of the three is in the fact (N1, N4).
 */
const FORBIDDEN_CLAIMS = [
  ['a write', /\b(writ(?:e|es|ten|ing)|wrote|set\s+by|assigned)\b/i],
  ['an owner', /\b(own(?:er|ers|ed|s))\b/i],
  ['a cause', /\b(cause|causes|caused|causal|because|why)\b/i],
];

/**
 * The words SC2 forbids as a phase: no string this module emits may call rendering or after-render
 * the phase an effect ran in (`change-detection` is a state name, not a phase, and is not scanned).
 */
const PHASE_WORDS =
  /\b(?:render|renders|rendered|rendering|after-?renders?|after-?rendered|after-?rendering|afterRender\w*)\b/i;

/** The words SC4 forbids: the absence names the node the graph lacks, never the page's effects. */
const NO_EFFECTS_WORDS = /\bno\s+effects?\b/i;

/** Every string a result carries, in key order — keys are not strings a caller renders. */
function stringsIn(value, out = []) {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) for (const item of value) stringsIn(item, out);
  else if (value && typeof value === 'object')
    for (const key of Object.keys(value)) stringsIn(value[key], out);
  return out;
}

/** No string in `result` names a write, an owner or a cause (N1). */
function assertNoClaim(result, what) {
  const text = JSON.stringify(result);
  for (const [claim, pattern] of FORBIDDEN_CLAIMS) {
    assert.equal(
      pattern.test(text),
      false,
      `N1 no write, owner or cause (${claim}): ${what} emitted ${text}`,
    );
  }
}

// ---------------------------------------------------------------- the pins ----

/**
 * AC1. An effect the graph labels produces one finding naming that label and the signals its consumer
 * edges name, and nothing the graph does not carry. The subject is the portal's one labelled effect.
 */
function pinLabelledEffect(api) {
  const answer = clone(
    api.renderPhase({
      graph: portalGraph(),
      effect: { label: PORTAL.label },
    }),
  );
  assert.equal(
    answer.findings.length,
    1,
    'AC1 one finding for one labelled effect',
  );
  const finding = answer.findings[0];
  assert.equal(finding.state, 'effect', 'AC1 state pin');
  assert.equal(
    finding.effect,
    PORTAL.label,
    'AC1 the effect is named by the label the graph gives it',
  );
  assert.equal(finding.namedBy, 'label', 'AC1 namedBy says the label named it');
  assert.deepEqual(
    finding.reads,
    [PORTAL.producers[0].label],
    'AC1 reads names the signal the effect\u2019s edge names',
  );
  assert.deepEqual(
    Object.keys(finding).sort(),
    EFFECT_KEYS,
    'AC1 the effect finding carries exactly the four fields the contract names',
  );
  assertNoClaim(answer, 'the labelled portal effect');
  return answer;
}

/**
 * E2, held out. An unlabelled effect is named by the edge the graph records for it: `namedBy` reads
 * `recorded-edge`, and no name is invented from a position, an index or a source string.
 */
function pinUnlabelledEffectNamedByItsEdge(api) {
  const findings = [];
  for (const [what, fact] of [
    ['the whole recorded edge', counterFact()],
    [
      'the consumer end alone',
      { graph: counterGraph(), effect: { edge: { consumer: COUNTER_INDEX } } },
    ],
  ]) {
    const answer = clone(api.renderPhase(fact));
    assert.equal(answer.findings.length, 1, `E2 one finding (${what})`);
    const finding = answer.findings[0];
    assert.equal(finding.state, 'effect', `E2 state pin (${what})`);
    assert.equal(
      finding.namedBy,
      'recorded-edge',
      `E2 namedBy reads recorded-edge (${what})`,
    );
    assert.equal(
      finding.effect,
      null,
      `E2 no name is invented for an effect the graph does not label (${what})`,
    );
    assert.deepEqual(
      finding.reads,
      ['count'],
      `E2 the recorded edge names the signal the effect reads (${what})`,
    );
    assert.deepEqual(
      Object.keys(finding).sort(),
      EFFECT_KEYS,
      `E2 the effect finding carries exactly the four contract fields (${what})`,
    );

    // Nothing the answer carries is the node's index, its id or a source string, so no name was
    // minted from a position: the label is the only name this module has, and the graph gave none.
    const text = JSON.stringify(answer);
    assert.equal(
      new RegExp(`\\b${COUNTER_INDEX}\\b`).test(text),
      false,
      `E2 the answer carries no node index (${what}): ${text}`,
    );
    assert.equal(
      text.includes(`"${COUNTER.id}"`),
      false,
      `E2 the answer carries no node id (${what}): ${text}`,
    );
    findings.push(finding);
  }
  return findings;
}

/**
 * E3, held out. An effect whose edges name no producer still produces a finding naming the effect and
 * reporting an empty read — never a borrowed signal and never an absence finding.
 */
function pinEffectWithEmptyRead(api) {
  const answers = [];
  for (const [what, graph, consumer] of [
    [
      'the /stale-view effect, whose graph records no edge at all',
      edgelessGraph(),
      STALE_VIEW.nodeIndex,
    ],
    [
      'the counter read with its consumer edges removed, beside a named signal',
      counterGraphWithoutReads(),
      COUNTER_INDEX,
    ],
  ]) {
    const answer = clone(
      api.renderPhase({ graph, effect: { edge: { consumer } } }),
    );
    assert.equal(answer.findings.length, 1, `E3 still one finding (${what})`);
    const finding = answer.findings[0];
    assert.equal(
      finding.state,
      'effect',
      `E3 an effect with no named read is a finding, never an absence (${what})`,
    );
    assert.deepEqual(
      finding.reads,
      [],
      `E3 the read is empty rather than borrowed (${what})`,
    );
    assert.equal(finding.namedBy, 'recorded-edge', `E3 namedBy pin (${what})`);
    assert.deepEqual(
      Object.keys(finding).sort(),
      EFFECT_KEYS,
      `E3 the effect finding carries exactly the four contract fields (${what})`,
    );
    answers.push(answer);
  }

  // The second fact really does hold a named signal, so a module that borrowed one would be caught.
  assert.ok(
    counterGraphWithoutReads().nodes.some(
      (node) => node.kind === 'signal' && node.label === 'count',
    ),
    'the readless counter graph must still hold the named signal, or the borrowing check is decoration',
  );
  assert.equal(
    nodeAt(edgelessGraph(), STALE_VIEW.nodeIndex).kind,
    'effect',
    'the /stale-view graph must hold its effect node, or the empty-read pin is decoration',
  );
  return answers;
}

/** Every fact the phase pin walks: each state of answer this module can give. */
function phaseFacts() {
  return [
    [
      'a labelled effect',
      { graph: portalGraph(), effect: { label: PORTAL.label } },
    ],
    ['an unlabelled effect', counterFact()],
    [
      'an empty read',
      {
        graph: edgelessGraph(),
        effect: { edge: { consumer: STALE_VIEW.nodeIndex } },
      },
    ],
    [
      'a recorded message beside the effect',
      counterFact({ error: digestMessage() }),
    ],
    [
      'a graph with no effect node',
      { graph: graphWithoutEffect(), effect: { label: PORTAL.label } },
    ],
    ['an unreadable graph', {}],
    [
      'an effect the graph does not hold',
      counterFact({ effect: { label: 'no-such-effect' } }),
    ],
  ];
}

/**
 * E4, held out. No finding carries a phase, and no output names rendering or after-render as the phase
 * an effect ran in: the phase is cannot-tell with the named absence, and it sits outside every finding,
 * on every state of answer this module can give.
 */
function pinPhaseIsTheNamedAbsence(api) {
  const answers = [];
  for (const [what, fact] of phaseFacts()) {
    const answer = clone(api.renderPhase(fact));
    assert.deepEqual(
      Object.keys(answer.phase).sort(),
      ['absence', 'state'],
      `E4 the phase carries nothing else (${what})`,
    );
    assert.deepEqual(
      answer.phase,
      PHASE,
      `E4 the phase is cannot-tell with the named absence (${what})`,
    );
    assert.equal(
      answer.phase.absence,
      api.NO_EFFECT_EVENT,
      `E4 the absence is the constant the module publishes (${what})`,
    );
    for (const finding of answer.findings) {
      assert.equal(
        'phase' in finding,
        false,
        `E4 no finding carries a phase (${what})`,
      );
      assert.equal(
        'absence' in finding,
        false,
        `E4 no finding carries an absence (${what})`,
      );
    }
    const text = JSON.stringify(answer);
    assert.equal(
      PHASE_WORDS.test(text),
      false,
      `E4 no output names rendering or after-render as a phase (${what}): ${text}`,
    );
    answers.push(answer);
  }
  return answers;
}

/**
 * E5, held out. A recorded message and the effect it arrived with stay two findings, never one: the
 * effect finding gains no code, no message and no provenance, and the message finding gains no effect,
 * no namedBy and no read.
 */
function pinTwoFindingsNeverOne(api) {
  const message = digestMessage();
  const answer = clone(api.renderPhase(counterFact({ error: message })));
  assert.equal(
    answer.findings.length,
    2,
    'E5 the effect and the recorded message stay two findings',
  );
  assert.deepEqual(
    answer.findings.map((finding) => finding.state),
    ['effect', 'change-detection'],
    'E5 the effect finding comes first and the message second, and the two are never merged',
  );

  const effect = answer.findings[0];
  const change = answer.findings[1];
  for (const key of ['code', 'message', 'provenance']) {
    assert.equal(
      key in effect,
      false,
      `E5 the effect finding carries no ${key}`,
    );
  }
  assert.deepEqual(
    Object.keys(effect).sort(),
    EFFECT_KEYS,
    'E5 the effect finding gains no field from the message',
  );

  for (const key of ['effect', 'namedBy', 'reads']) {
    assert.equal(
      key in change,
      false,
      `E5 the message finding names no ${key}`,
    );
  }
  assert.deepEqual(
    Object.keys(change).sort(),
    CHANGE_KEYS,
    'E5 the message finding carries exactly the four fields the contract names',
  );
  assert.equal(
    change.code,
    message.code,
    'E5 the code is the one the fact carried',
  );
  assert.equal(
    change.message,
    message.message,
    'E5 the message is the one the fact carried',
  );
  assert.equal(
    change.provenance,
    message.provenance,
    'E5 the provenance is the one the fact carried',
  );
  assert.notDeepEqual(change, effect, 'E5 the two findings are never merged');
  return answer;
}

/**
 * E6, held out. A recorded message that names no effect produces a change-detection finding that names
 * no effect and no cause. T001 captured no message, so the stand-in is the digest's entry, whose words
 * name no effect — asserted here, so the pin cannot pass on a message that would fail it anyway.
 */
function pinMessageNamesNoEffectOrCause(api) {
  const message = digestMessage();
  assert.equal(
    /effect/i.test(message.message),
    false,
    'the recorded stand-in message must name no effect, or this pin is decoration',
  );
  assert.equal(
    SUBSTITUTE.notACapture,
    true,
    'the stand-in must be recorded as a digest entry and not as a capture',
  );

  const answer = clone(api.renderPhase(counterFact({ error: message })));
  const change = answer.findings.find(
    (finding) => finding.state === 'change-detection',
  );
  assert.ok(
    change,
    'E6 the recorded message produces a change-detection finding',
  );
  assert.equal('effect' in change, false, 'E6 the finding names no effect');
  assert.equal('cause' in change, false, 'E6 the finding names no cause');
  assert.equal('owner' in change, false, 'E6 the finding names no owner');
  assert.deepEqual(
    Object.keys(change).sort(),
    CHANGE_KEYS,
    'E6 the message finding carries exactly the four contract fields',
  );

  const text = JSON.stringify(change);
  assert.equal(
    /effect/i.test(text),
    false,
    `E6 the finding names no effect: ${text}`,
  );
  assert.equal(
    FORBIDDEN_CLAIMS[2][1].test(text),
    false,
    `E6 the finding names no cause: ${text}`,
  );
  assertNoClaim(change, 'the change-detection finding');
  return change;
}

/**
 * E1, held out, first half. A readable graph with no effect node yields the absence state naming the
 * missing node — and never the words "no effects", which would be a claim about the page.
 */
function pinNoEffectNodeNamesTheMissingNode(api) {
  const answers = [];
  for (const [what, graph] of [
    ['the counter graph with its effect node removed', graphWithoutEffect()],
    ['an empty but readable graph', { nodes: [], edges: [] }],
  ]) {
    const answer = clone(
      api.renderPhase({ graph, effect: { label: PORTAL.label } }),
    );
    assert.equal(answer.findings.length, 1, `E1 one absence (${what})`);
    const finding = answer.findings[0];
    assert.equal(
      finding.state,
      'cannot-tell',
      `E1 the absence state (${what})`,
    );
    const text = JSON.stringify(answer);
    assert.equal(
      NO_EFFECTS_WORDS.test(text),
      false,
      `E1 the answer never says the page has no effects: ${text}`,
    );
    assert.equal(
      finding.reason,
      'no-effect-node',
      `E1 the absence names the missing node the graph lacks (${what})`,
    );
    assert.deepEqual(
      Object.keys(finding).sort(),
      ABSENCE_KEYS,
      `E1 the absence carries nothing else (${what})`,
    );
    answers.push(answer);
  }
  return answers;
}

/** Every fact that names no readable graph, each for its own reason. */
function unreadableGraphFacts() {
  return [
    ['no fact at all', null],
    ['no graph on the fact', {}],
    ['a null graph', { graph: null }],
    ['a graph that is an array', { graph: [] }],
    ['a graph with no node list', { graph: { edges: [] } }],
    ['a graph with no edge list', { graph: { nodes: [] } }],
    [
      'a graph whose node list is not a list',
      { graph: { nodes: {}, edges: [] } },
    ],
    ['a fact that is not an object', 'a graph'],
  ];
}

/**
 * E1, held out, second half. An unread graph is never reported as an empty one: the absence names the
 * graph, and a readable empty graph is still the missing node.
 */
function pinUnreadableGraphIsNotAnEmptyOne(api) {
  const readableEmpty = clone(
    api.renderPhase({
      graph: { nodes: [], edges: [] },
      effect: { label: 'x' },
    }),
  );
  assert.equal(
    readableEmpty.findings[0].reason,
    'no-effect-node',
    'E1 a readable empty graph is the missing node and not an unread graph',
  );

  const answers = [];
  for (const [what, fact] of unreadableGraphFacts()) {
    const answer = clone(api.renderPhase(fact));
    assert.equal(answer.findings.length, 1, `E1 one absence (${what})`);
    assert.equal(
      answer.findings[0].state,
      'cannot-tell',
      `E1 the absence state (${what})`,
    );
    const text = JSON.stringify(answer);
    assert.equal(
      NO_EFFECTS_WORDS.test(text),
      false,
      `E1 an unread graph is never reported as a page with no effects: ${text}`,
    );
    assert.equal(
      answer.findings[0].reason,
      'graph-unreadable',
      `E1 an unread graph is never reported as an empty one (${what})`,
    );
    assert.deepEqual(
      Object.keys(answer.findings[0]).sort(),
      ABSENCE_KEYS,
      `E1 the absence carries nothing else (${what})`,
    );
    answers.push(answer);
  }
  return answers;
}

/** Every way the named subject can fail to be one the graph holds. */
function unreadableSubjectFacts() {
  const twoEffectsWithOneLabel = counterGraph();
  twoEffectsWithOneLabel.nodes.push(
    { index: 8, kind: 'effect', label: 'twice' },
    { index: 9, kind: 'effect', label: 'twice' },
  );
  return [
    ['no subject named', counterFact({ effect: undefined })],
    ['a blank label', { graph: counterGraph(), effect: { label: '   ' } }],
    ['a subject that is a string', { graph: counterGraph(), effect: 'count' }],
    [
      'a label no effect carries',
      { graph: counterGraph(), effect: { label: 'no-such-effect' } },
    ],
    [
      'a label two effects carry',
      { graph: twoEffectsWithOneLabel, effect: { label: 'twice' } },
    ],
    [
      'an edge the graph does not record',
      {
        graph: counterGraph(),
        effect: { edge: { consumer: COUNTER_INDEX, producer: TITLE_INDEX } },
      },
    ],
    [
      'an edge whose consumer is not an effect',
      { graph: counterGraph(), effect: { edge: { consumer: 0 } } },
    ],
    [
      'an edge with no consumer end',
      { graph: counterGraph(), effect: { edge: { producer: COUNT_INDEX } } },
    ],
  ];
}

/**
 * The third absence: the named subject is not one the graph holds. It is `effect-unreadable` and not
 * an absence about the graph, because the graph answered — it just does not hold that subject.
 */
function pinUnreadableSubject(api) {
  const answers = [];
  for (const [what, fact] of unreadableSubjectFacts()) {
    const answer = clone(api.renderPhase(fact));
    assert.equal(answer.findings.length, 1, `E2 one absence (${what})`);
    const finding = answer.findings[0];
    assert.equal(
      finding.reason,
      'effect-unreadable',
      `E2 the graph does not hold that subject (${what})`,
    );
    assert.equal(
      finding.state,
      'cannot-tell',
      `E2 the absence state (${what})`,
    );
    assert.deepEqual(
      Object.keys(finding).sort(),
      ABSENCE_KEYS,
      `E2 the absence carries nothing else (${what})`,
    );
    answers.push(answer);
  }
  return answers;
}

/**
 * E8, held out. The same graph read twice produces byte-identical text, including the order of `reads`
 * and of `findings` — which is the recorded order, never a sorted one.
 */
function pinDeterminism(api) {
  const fact = {
    graph: twoReadGraph(),
    effect: { edge: counterEdge() },
    error: digestMessage(),
  };
  const first = clone(api.renderPhase(fact));
  const second = clone(api.renderPhase(fact));
  const third = clone(
    api.renderPhase({
      graph: twoReadGraph(),
      effect: { edge: counterEdge() },
      error: digestMessage(),
    }),
  );

  const effect = first.findings[0];
  assert.deepEqual(
    effect.reads,
    ['title', 'count'],
    'E8 the order of reads is the recorded edge order, never a sorted one',
  );
  assert.notDeepEqual(
    effect.reads,
    effect.reads.slice().sort(),
    'E8 the recorded order is not the sorted order, so a sort would be visible',
  );
  assert.deepEqual(
    first.findings.map((finding) => finding.state),
    ['effect', 'change-detection'],
    'E8 the order of findings is the declared one',
  );

  const text = JSON.stringify(first);
  assert.equal(
    JSON.stringify(second),
    text,
    'E8 the same graph read twice is byte-identical text',
  );
  assert.equal(
    JSON.stringify(third),
    text,
    'E8 a freshly built graph of the same read is byte-identical text',
  );
  assert.equal(
    JSON.stringify(clone(api.renderPhase(fact))),
    text,
    'E8 a third read of the same fact is byte-identical text',
  );
  return first;
}

// -------------------------------------------------------------------------- measurement ----

describe('measurement', () => {
  it('the recording measures 26 profiler events with no effect event, the effect node and its edge, and the digest stand-in', () => {
    // The profiler: 26 values, numbered 0 to 25, and no value name contains `effect`. The phase
    // answer is only honest while this holds.
    assert.equal(
      PROFILER.count,
      26,
      'the panel package declares 26 profiler events',
    );
    assert.deepEqual(
      PROFILER.values.map((value) => value.value),
      Array.from({ length: 26 }, (unused, index) => index),
      'the events are numbered 0 through 25',
    );
    assert.deepEqual(
      PROFILER.values.filter((value) => /effect/i.test(value.name)),
      [],
      'no profiler event is an effect event',
    );
    assert.equal(RECORDING.profiler.effectEvent.absent, true);
    assert.equal(RECORDING.profiler.effectEvent.count, 0);

    // The counter effect: node 5, id "6", an empty label, epoch 1, one edge to `signal:count`.
    assert.equal(COUNTER.kind, 'effect');
    assert.equal(COUNTER.nodeIndex, 5);
    assert.equal(COUNTER.id, '6');
    assert.equal(COUNTER.label, '');
    assert.equal(COUNTER.epoch, 1);
    assert.deepEqual(
      COUNTER.edges.map((edge) => [edge.consumer, edge.producer]),
      [[5, 2]],
      'the effect has exactly one edge, consumer 5 to producer 2',
    );
    assert.deepEqual(
      COUNTER_EDGES.map((edge) => [edge.consumer, edge.producer]),
      [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [3, 2],
        [5, 2],
      ],
      'the recorded graph holds six edges, the effect\u2019s last',
    );
    assert.equal(nodeAt(counterGraph(), COUNT_INDEX).label, 'count');
    assert.equal(nodeAt(counterGraph(), COUNT_INDEX).kind, 'signal');
    assert.equal(nodeAt(counterGraph(), TITLE_INDEX).label, 'title');
    assert.equal(nodeAt(counterGraph(), TITLE_INDEX).kind, 'signal');

    // `/stale-view`: an effect whose graph records no producer at all — E3's measured fixture.
    assert.equal(STALE_VIEW.kind, 'effect');
    assert.equal(STALE_VIEW.label, '');
    assert.equal(STALE_VIEW.nodeIndex, 0);
    assert.deepEqual(STALE_VIEW.producers, []);
    assert.equal(STALE_VIEW.edgeCount, 0);

    // The portal labels exactly one effect, and its producer is a `linkedSignal`.
    assert.deepEqual(RECORDING.effect.portalRead.effectLabelSet, [
      '',
      'Resource.loadEffect',
    ]);
    assert.equal(PORTAL.label, 'Resource.loadEffect');
    assert.equal(PORTAL.nodeIndex, 15);
    assert.deepEqual(
      PORTAL.producers.map((producer) => [producer.kind, producer.label]),
      [['linkedSignal', 'Resource.extRequest']],
    );

    // The change-detection half is a negative plus a digest stand-in, never a capture.
    assert.deepEqual(RECORDING.changeDetection.messages, []);
    assert.equal(RECORDING.changeDetection.result, 'negative');
    assert.equal(SUBSTITUTE.notACapture, true);
    assert.equal(SUBSTITUTE.code, 'NG0100');

    console.log(
      `render-phase measurement: ${PROFILER.count} profiler events, 0 effect events; effect node ${COUNTER.nodeIndex} id "${COUNTER.id}" label ${JSON.stringify(COUNTER.label)} -> ${JSON.stringify(COUNTER.signalsTheEdgesName)}; portal label ${JSON.stringify(PORTAL.label)} -> ${JSON.stringify(PORTAL.producers[0].label)}; change detection ${RECORDING.changeDetection.result} with ${RECORDING.changeDetection.messages.length} message(s), stand-in ${SUBSTITUTE.code} notACapture`,
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
    runInContext('angularAiRenderPhase.renderPhase(__fact)', context),
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
    // not prose — and the phase absence is one of them (SC2).
    assert.equal(api.EFFECT, 'effect');
    assert.equal(api.CHANGE_DETECTION, 'change-detection');
    assert.equal(api.CANNOT_TELL, 'cannot-tell');
    assert.equal(api.NAMED_BY_LABEL, 'label');
    assert.equal(api.NAMED_BY_RECORDED_EDGE, 'recorded-edge');
    assert.equal(api.GRAPH_UNREADABLE, 'graph-unreadable');
    assert.equal(api.NO_EFFECT_NODE, 'no-effect-node');
    assert.equal(api.EFFECT_UNREADABLE, 'effect-unreadable');
    assert.equal(api.NO_EFFECT_EVENT, 'no-effect-event');

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

    const answered = guarded(SRC, counterFact({ error: digestMessage() }));
    assert.equal(
      answered.findings.length,
      2,
      'the join answers a measured fact while every host global in scope is a trap',
    );
    assert.deepEqual(
      answered.phase,
      PHASE,
      'the phase is answered under the traps too',
    );
    console.log(`render-phase guarded: ${JSON.stringify(answered)}`);
  });
});

// ------------------------------------------------- AC1: an effect the graph labels ----

describe('AC1 — an effect the graph labels produces its own finding', () => {
  it('names the label, the signal its edge names, and nothing the graph does not carry', () => {
    const caught = proveNonVacuous(pinLabelledEffect, [
      {
        what: 'M1 the effect reports how it was named instead of the label it carries',
        anchor: '      effect: name,',
        replacement: '      effect: namedBy,',
        message: /AC1 the effect is named by the label the graph gives it/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: portalGraph(),
              effect: { label: PORTAL.label },
            }),
          );
          assert.equal(
            answer.findings[0].effect,
            'label',
            'the mutant reports the naming mode in the effect field',
          );
        },
      },
      {
        what: 'M2 the read is taken from the consumer end of the edge instead of the producer',
        anchor: '      const producer = nodeAtIndex(nodes, edge.producer);',
        replacement:
          '      const producer = nodeAtIndex(nodes, edge.consumer);',
        message: /AC1 reads names the signal the effect\u2019s edge names/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: portalGraph(),
              effect: { label: PORTAL.label },
            }),
          );
          assert.deepEqual(
            answer.findings[0].reads,
            [PORTAL.label],
            'the mutant reads the effect itself instead of its producer',
          );
        },
      },
    ]);
    console.log(`AC1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E2 an unlabelled effect is named by its recorded edge, and no name is invented', () => {
    const caught = proveNonVacuous(pinUnlabelledEffectNamedByItsEdge, [
      {
        what: 'M3 the effect is named by its node index',
        anchor: '      labelOf(subject.node),',
        replacement:
          '      subject.namedBy === NAMED_BY_LABEL\n' +
          '        ? labelOf(subject.node)\n' +
          '        : String(indexOfNode(subject.node)),',
        message:
          /E2 no name is invented for an effect the graph does not label/,
        defect(api) {
          const answer = clone(api.renderPhase(counterFact()));
          assert.equal(
            answer.findings[0].effect,
            String(COUNTER_INDEX),
            'the mutant mints a name out of the node index',
          );
        },
      },
      {
        what: 'M4 an edge-named effect says the graph labelled it',
        anchor:
          '    return { namedBy: NAMED_BY_RECORDED_EDGE, node: named[0] };',
        replacement: '    return { namedBy: NAMED_BY_LABEL, node: named[0] };',
        message: /E2 namedBy reads recorded-edge/,
        defect(api) {
          const answer = clone(api.renderPhase(counterFact()));
          assert.equal(
            answer.findings[0].namedBy,
            'label',
            'the mutant claims a label named an unlabelled effect',
          );
        },
      },
    ]);
    console.log(`E2 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E3 an effect whose edges name no producer still produces its finding, with an empty read', () => {
    const caught = proveNonVacuous(pinEffectWithEmptyRead, [
      {
        what: 'M5 an empty read borrows a named signal from elsewhere in the graph',
        anchor: '    return reads;',
        replacement:
          '    if (reads.length === 0) {\n' +
          '      for (let i = 0; i < nodes.length; i += 1) {\n' +
          "        if (kindOf(nodes[i]) !== 'signal') continue;\n" +
          '        const label = labelOf(nodes[i]);\n' +
          '        if (label !== null) reads.push(label);\n' +
          '      }\n' +
          '    }\n' +
          '    return reads;',
        message: /E3 the read is empty rather than borrowed/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: counterGraphWithoutReads(),
              effect: { edge: { consumer: COUNTER_INDEX } },
            }),
          );
          assert.deepEqual(
            answer.findings[0].reads,
            ['title', 'count', 'items'],
            'the mutant reports signals the effect\u2019s edges do not name',
          );
        },
      },
      {
        what: 'M6 an empty read is reported as an absence instead of a finding',
        anchor:
          '    const effect = effectFinding(\n' +
          '      labelOf(subject.node),\n' +
          '      subject.namedBy,\n' +
          '      readsOf(nodes, edges, indexOfNode(subject.node)),\n' +
          '    );',
        replacement:
          '    const reads = readsOf(nodes, edges, indexOfNode(subject.node));\n' +
          '    const effect =\n' +
          '      reads.length === 0\n' +
          '        ? cannotTell(EFFECT_UNREADABLE)\n' +
          '        : effectFinding(labelOf(subject.node), subject.namedBy, reads);',
        message:
          /E3 an effect with no named read is a finding, never an absence/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: edgelessGraph(),
              effect: { edge: { consumer: STALE_VIEW.nodeIndex } },
            }),
          );
          assert.equal(
            answer.findings[0].state,
            'cannot-tell',
            'the mutant turns a readless effect into an absence',
          );
        },
      },
    ]);
    console.log(`E3 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ----------------------------------------------- AC2: the phase is the named absence ----

describe('AC2 — the phase is the named absence, outside every finding', () => {
  it('E4 no finding carries a phase, and no output names rendering or after-render as one', () => {
    const caught = proveNonVacuous(pinPhaseIsTheNamedAbsence, [
      {
        what: 'M7 the phase carries a phase word of its own',
        anchor: '    return { state: CANNOT_TELL, absence: NO_EFFECT_EVENT };',
        replacement:
          "    return { state: CANNOT_TELL, absence: NO_EFFECT_EVENT, phase: 'after-render' };",
        message: /E4 the phase carries nothing else/,
        defect(api) {
          assert.equal(
            api.renderPhase({}).phase.phase,
            'after-render',
            'the mutant puts a phase word on the phase object',
          );
        },
      },
      {
        what: 'M8 the effect finding carries a phase of its own',
        anchor: '      reads: reads,',
        replacement: "      reads: reads,\n      phase: 'rendering',",
        message: /E4 no finding carries a phase/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: portalGraph(),
              effect: { label: PORTAL.label },
            }),
          );
          assert.equal(
            answer.findings[0].phase,
            'rendering',
            'the mutant smuggles a phase into the effect finding',
          );
        },
      },
      {
        what: 'M9 the named absence becomes a phase word',
        anchor: "  const NO_EFFECT_EVENT = 'no-effect-event';",
        replacement: "  const NO_EFFECT_EVENT = 'rendering';",
        message: /E4 the phase is cannot-tell with the named absence/,
        defect(api) {
          assert.equal(
            api.NO_EFFECT_EVENT,
            'rendering',
            'the mutant publishes a phase word as the absence',
          );
        },
      },
    ]);
    console.log(`E4 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// --------------------------------------- AC3: the change-detection message beside it ----

describe('AC3 — the recorded message is a finding of its own', () => {
  it('E5 the message and the effect stay two findings, never one', () => {
    const caught = proveNonVacuous(pinTwoFindingsNeverOne, [
      {
        what: 'M10 the message is folded into the effect finding',
        anchor:
          '    if (isObject(read.error)) findings.push(changeDetectionFinding(read.error));',
        replacement:
          '    if (isObject(read.error)) {\n' +
          '      Object.assign(findings[0], {\n' +
          '        code: read.error.code,\n' +
          '        message: read.error.message,\n' +
          '      });\n' +
          '    }',
        message: /E5 the effect and the recorded message stay two findings/,
        defect(api) {
          const answer = clone(
            api.renderPhase(counterFact({ error: digestMessage() })),
          );
          assert.equal(
            answer.findings.length,
            1,
            'the mutant answers one finding',
          );
          assert.equal(
            answer.findings[0].code,
            SUBSTITUTE.code,
            'the mutant attaches the message to the effect finding',
          );
        },
      },
      {
        what: 'M11 the message is dropped, leaving the effect finding alone',
        anchor:
          '    if (isObject(read.error)) findings.push(changeDetectionFinding(read.error));',
        replacement:
          '    if (false) findings.push(changeDetectionFinding(read.error));',
        message: /E5 the effect and the recorded message stay two findings/,
        defect(api) {
          const answer = clone(
            api.renderPhase(counterFact({ error: digestMessage() })),
          );
          assert.equal(
            answer.findings.length,
            1,
            'the mutant answers one finding',
          );
          assert.equal(
            answer.findings[0].state,
            'effect',
            'the mutant drops the recorded message entirely',
          );
        },
      },
    ]);
    console.log(`E5 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E6 a message that names no effect produces a finding that names no effect and no cause', () => {
    const caught = proveNonVacuous(pinMessageNamesNoEffectOrCause, [
      {
        what: 'M12 the message finding names a cause',
        anchor: '      provenance: textOf(error.provenance),',
        replacement:
          '      provenance: textOf(error.provenance),\n' +
          "      cause: 'a cause the graph does not carry',",
        message: /E6 the finding names no cause/,
        defect(api) {
          const answer = clone(
            api.renderPhase(counterFact({ error: digestMessage() })),
          );
          assert.equal(
            answer.findings[1].cause,
            'a cause the graph does not carry',
            'the mutant attaches a cause to the message finding',
          );
        },
      },
      {
        what: 'M13 the message finding names an effect it was not given',
        anchor: '      code: textOf(error.code),',
        replacement:
          "      code: textOf(error.code),\n      effect: 'Resource.loadEffect',",
        message: /E6 the finding names no effect/,
        defect(api) {
          const answer = clone(
            api.renderPhase(counterFact({ error: digestMessage() })),
          );
          assert.equal(
            answer.findings[1].effect,
            'Resource.loadEffect',
            'the mutant joins the message to an effect',
          );
        },
      },
    ]);
    console.log(`E6 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------- AC4: the absences the graph can force ----

describe('AC4 — the graph\u2019s absences, each named', () => {
  it('E1 a graph with no effect node names the missing node, and never the words "no effects"', () => {
    const caught = proveNonVacuous(pinNoEffectNodeNamesTheMissingNode, [
      {
        what: 'M14 the effectless graph is no longer refused as missing its effect node',
        anchor:
          '    if (effects.length === 0) return answer([cannotTell(NO_EFFECT_NODE)]);',
        replacement:
          '    if (false) return answer([cannotTell(NO_EFFECT_NODE)]);',
        message: /E1 the absence names the missing node the graph lacks/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: graphWithoutEffect(),
              effect: { label: PORTAL.label },
            }),
          );
          assert.equal(
            answer.findings[0].reason,
            'effect-unreadable',
            'the mutant answers an effectless graph with the subject reason',
          );
        },
      },
      {
        what: 'M15 the reason becomes a claim about the page instead of about the node',
        anchor: "  const NO_EFFECT_NODE = 'no-effect-node';",
        replacement: "  const NO_EFFECT_NODE = 'the page has no effects';",
        message: /E1 the answer never says the page has no effects/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: graphWithoutEffect(),
              effect: { label: PORTAL.label },
            }),
          );
          assert.equal(
            answer.findings[0].reason,
            'the page has no effects',
            'the mutant publishes the forbidden sentence as its reason',
          );
        },
      },
    ]);
    console.log(`E1 non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('E1 an unreadable graph is never reported as an empty one', () => {
    const caught = proveNonVacuous(pinUnreadableGraphIsNotAnEmptyOne, [
      {
        what: 'M16 a fact naming no graph is reported as a graph with no effect node',
        anchor:
          '    if (graph === null) return answer([cannotTell(GRAPH_UNREADABLE)]);',
        replacement:
          '    if (graph === null) return answer([cannotTell(NO_EFFECT_NODE)]);',
        message: /E1 an unread graph is never reported as an empty one/,
        defect(api) {
          const answer = clone(api.renderPhase({}));
          assert.equal(
            answer.findings[0].reason,
            'no-effect-node',
            'the mutant calls an unread graph empty',
          );
        },
      },
    ]);
    console.log(`E1 unreadable non-vacuous:\n  ${caught.join('\n  ')}`);
  });

  it('the third absence: a subject the graph does not hold', () => {
    const caught = proveNonVacuous(pinUnreadableSubject, [
      {
        what: 'M17 a label two effects carry is resolved by taking the first',
        anchor:
          '        if (labelOf(effectNodes[i]) === label) named.push(effectNodes[i]);\n' +
          '      }\n' +
          '      if (named.length !== 1) return null;',
        replacement:
          '        if (labelOf(effectNodes[i]) === label) named.push(effectNodes[i]);\n' +
          '      }\n' +
          '      if (named.length === 0) return null;',
        message:
          /E2 the graph does not hold that subject \(a label two effects carry\)/,
        defect(api) {
          const graph = counterGraph();
          graph.nodes.push(
            { index: 8, kind: 'effect', label: 'twice' },
            { index: 9, kind: 'effect', label: 'twice' },
          );
          const answer = clone(
            api.renderPhase({ graph, effect: { label: 'twice' } }),
          );
          assert.equal(
            answer.findings[0].state,
            'effect',
            'the mutant picks one of two effects instead of refusing',
          );
        },
      },
    ]);
    console.log(`E2 subject non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ------------------------------------------------------- E8: the same read twice ----

describe('E8 — the same graph read twice produces byte-identical text', () => {
  it('keeps the recorded order of reads and findings, and repeats the answer exactly', () => {
    const caught = proveNonVacuous(pinDeterminism, [
      {
        what: 'M18 the reads are sorted instead of kept in the recorded edge order',
        anchor: '    return reads;',
        replacement:
          '    return reads\n' +
          '      .slice()\n' +
          '      .sort((left, right) => (left < right ? -1 : right < left ? 1 : 0));',
        message: /E8 the order of reads is the recorded edge order/,
        defect(api) {
          const answer = clone(
            api.renderPhase({
              graph: twoReadGraph(),
              effect: { edge: counterEdge() },
            }),
          );
          assert.deepEqual(
            answer.findings[0].reads,
            ['count', 'title'],
            'the mutant orders the reads by label instead of by edge',
          );
        },
      },
      {
        what: 'M19 the effect finding carries a value that changes on every read',
        anchor: '      effect: name,',
        replacement:
          '      effect: name === null ? String(Math.random()) : name,',
        message: /E8 the same graph read twice is byte-identical text/,
        defect(api) {
          const fact = {
            graph: twoReadGraph(),
            effect: { edge: counterEdge() },
            error: digestMessage(),
          };
          assert.notEqual(
            JSON.stringify(clone(api.renderPhase(fact))),
            JSON.stringify(clone(api.renderPhase(fact))),
            'the mutant answers the same fact differently on every read',
          );
        },
      },
    ]);
    console.log(`E8 non-vacuous:\n  ${caught.join('\n  ')}`);
  });
});

// ---------------------------------------------------------------- the vocabulary ----

describe('vocabulary', () => {
  it('reaches all three states, all three absences and the one phase answer, and no others', () => {
    const api = pristineApi();
    const states = new Set();
    const reasons = new Set();
    const phases = new Set();

    const facts = [
      ...phaseFacts(),
      ...unreadableSubjectFacts(),
      ...unreadableGraphFacts(),
    ];
    for (const [what, fact] of facts) {
      const answer = clone(api.renderPhase(fact));
      phases.add(JSON.stringify(answer.phase));
      assert.ok(
        answer.findings.length >= 1,
        `every fact gets at least one finding (${what})`,
      );
      for (const finding of answer.findings) {
        states.add(finding.state);
        if (finding.state === 'cannot-tell') reasons.add(finding.reason);
      }
    }

    assert.deepEqual([...states].sort(), [
      'cannot-tell',
      'change-detection',
      'effect',
    ]);
    assert.deepEqual([...reasons].sort(), [
      'effect-unreadable',
      'graph-unreadable',
      'no-effect-node',
    ]);
    assert.deepEqual(
      [...phases],
      [JSON.stringify(PHASE)],
      'the phase is one answer on every fact this module can be given',
    );

    // Every string the module can emit that is not the graph's own data or the fact's own message is
    // a published constant, so a caller never compares prose.
    const vocabulary = new Set([
      api.EFFECT,
      api.CHANGE_DETECTION,
      api.CANNOT_TELL,
      api.NAMED_BY_LABEL,
      api.NAMED_BY_RECORDED_EDGE,
      api.GRAPH_UNREADABLE,
      api.NO_EFFECT_NODE,
      api.EFFECT_UNREADABLE,
      api.NO_EFFECT_EVENT,
    ]);
    for (const word of [
      'effect',
      'change-detection',
      'cannot-tell',
      'label',
      'recorded-edge',
      'graph-unreadable',
      'no-effect-node',
      'effect-unreadable',
      'no-effect-event',
    ]) {
      assert.equal(
        vocabulary.has(word),
        true,
        `the vocabulary must publish ${word}`,
      );
    }

    const emitted = new Set();
    for (const entry of facts) {
      for (const string of stringsIn(clone(api.renderPhase(entry[1])))) {
        emitted.add(string);
      }
    }
    const unexpected = [...emitted].filter(
      (string) =>
        !vocabulary.has(string) &&
        !Object.values(api).includes(string) &&
        string !== PORTAL.label &&
        string !== PORTAL.producers[0].label &&
        string !== 'count' &&
        string !== 'title' &&
        string !== SUBSTITUTE.code &&
        string !== SUBSTITUTE.title &&
        string !== digestMessage().provenance,
    );
    assert.deepEqual(
      unexpected,
      [],
      'every emitted string is a published constant or a value the fact carried',
    );

    console.log(
      `render-phase vocabulary: states ${JSON.stringify([...states].sort())}, reasons ${JSON.stringify([...reasons].sort())}, phase ${JSON.stringify([...phases])}`,
    );
  });
});
