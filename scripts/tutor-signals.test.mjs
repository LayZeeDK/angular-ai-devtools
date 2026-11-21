// @ts-check
// Run: node --test scripts/tutor-signals.test.mjs
//
// M057 T002 builds `extension/tutor-signals.js` — the pure join `tutorSignals(records)` — and then
// mutates it in memory, one defect at a time, because a pin nobody has watched fail is a comment with
// an assertion around it. The join reads exactly the two records T001 measured
// (`research/raw/m057-record-shapes.json`): the signal graph's own `nodes` and `edges`, and the
// render/effect entry the existing join answers at `extension/render-phase.js:304`. Every field it
// renders is a field a record states — the effect node's label, the node's own `index`, the two ends
// of an edge — and every claim it renders carries the artefact path and line that states it.
//
// The suite proves, rather than assumes, the four things the answer can lie about:
//
//   SC1  the effect is named by the label the graph gives it and by its own `index` — never by its
//        position in the nodes array, never by a number minted from an id, a call site or a source
//        string — and every claim carries an artefact path and line. The fixture graphs put the
//        effect at index 5 in the fourth slot of the array, so a position-based answer renders 3
//        where the record states 5.
//   SC2  the ordering is always the named absence `no-write-record-no-order` and never a finding: no
//        write, no owner and no cause appears anywhere in an answer, and a recorded
//        change-detection message stays a second claim after the effect and is never joined to it
//        (held out E7 and E8).
//   SC3  `graph-unreadable`, `no-render-entry` and `no-effect-node` are three states with three
//        sentences, and an unread graph is never rendered as a page with no effects.
//   SC4  every index the answer renders is one the recorded graph's own `nodes` array carries, and
//        every producer end or effect reference the graph cannot place is named in `unplaced` by end
//        and value — never numbered, dropped or resolved to the nearest node.
//
// The real-record leg is the honest reading of a record that carries no index, and it is why this
// task does not read the graph T003 pins (PLAN C8): `research/raw/m039-render-phase.json`'s
// `/effect/fromRecording` states the graph with `kind` and `label` on every node and no `index`
// anywhere, so the join answers `answered` with the effect's label as the record spells it — the
// empty string — and with `index: null`, naming the effect reference in `unplaced` rather than
// numbering it from its position (5) or from the serializer's `id`. `scripts/tutor-signals-shapes`
// already pins that a fresh `serializeGraph` writes `id: String(n.id)` and never an `index`, which is
// the absence this leg reports.
//
// Purity is proved by running the module in a bare `node:vm` context with nothing in it, and by a
// scan of its bytes for every reach a pure join must not have: no import, no filesystem, no network,
// no DOM, no clock, no page global, no namespace of another join.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The module this task authors, and the records it is read against. */
const JOIN = 'extension/tutor-signals.js';
const ENTRY = 'extension/render-phase.js';
const RECORD_SHAPES = 'research/raw/m057-record-shapes.json';
const RENDER_PHASE = 'research/raw/m039-render-phase.json';
const SERIALIZER = 'extension/agent-main.js';

const JOIN_SOURCE = readFileSync(join(ROOT, JOIN), 'utf8');
const SHAPES = JSON.parse(readFileSync(join(ROOT, RECORD_SHAPES), 'utf8'));
const RENDER_RECORD = JSON.parse(
  readFileSync(join(ROOT, RENDER_PHASE), 'utf8'),
);

/** The four states, and the three absences among them, exactly as the contract lists them. */
const STATES = [
  'answered',
  'graph-unreadable',
  'no-render-entry',
  'no-effect-node',
];
const ABSENCES = ['graph-unreadable', 'no-render-entry', 'no-effect-node'];

/** The eight fields every answer carries, and the three every effect finding carries. */
const ANSWER_FIELDS = [
  'claims',
  'detail',
  'effect',
  'ordering',
  'question',
  'reads',
  'state',
  'unplaced',
];
const EFFECT_FIELDS = ['index', 'label', 'namedBy'];

/** The one ordering the answer is allowed to state, and the two ends `unplaced` may name. */
const ORDERING = { state: 'absent', absence: 'no-write-record-no-order' };

/** The fields the join reads, as the recording declares them (T001). */
const READ_FIELDS = {
  graph: 'graph',
  graphPath: 'graph.path',
  graphLine: 'graph.line',
  nodes: 'graph.graph.nodes',
  edges: 'graph.graph.edges',
  effectLabel: 'effect.label',
  effectEdge: 'effect.edge',
  error: 'error',
  question: 'question',
};

/** The node fields the recording declares ignored: a fact carrying one changes nothing (E9). */
const IGNORED = ['id', 'epoch', 'value', 'debuggableFn'];

/** The fixture graph record's own provenance: what every graph-side claim must cite. */
const GRAPH_PATH = 'research/raw/fixture-signal-graph.json';
const GRAPH_LINE = 12;

/** The line `research/raw/m039-render-phase.json` states its derived reading at. */
const FROM_RECORDING_LINE = 330;

/** The recorded change-detection message the E8 leg hands over. */
const RECORDED_ERROR = {
  code: 'NG0100',
  message: 'ExpressionChangedAfterItHasBeenCheckedError',
  provenance: 'console',
};

// ------------------------------------------------------------------------------------------------
// Loading: the module as it sits on disk, or as this file mutates it in memory.
// ------------------------------------------------------------------------------------------------

/** A vm-realm value as a plain value, so a deepEqual compares data and not two realms' prototypes. */
/** @param {any} value */
function copyOf(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One file's code with its comments removed: the doc comments are prose and decide nothing. */
/** @param {string} source */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** A file's lines, for the citation checks. @param {string} path */
function linesOf(path) {
  return readFileSync(join(ROOT, path), 'utf8').split(/\r?\n/);
}

/** `extension/tutor-signals.js` in a bare context with nothing in it. */
/** @param {string} [source] */
function loadJoin(source = JOIN_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  const api = context.angularAiTutorSignals;
  assert.ok(api, `${JOIN} publishes angularAiTutorSignals`);
  assert.equal(
    typeof api.tutorSignals,
    'function',
    `${JOIN} exports tutorSignals`,
  );
  return api;
}

/** One answer, or `null` where the join refused the records entirely. */
/** @param {any} api @param {any} records */
function ask(api, records) {
  const answer = api.tutorSignals(records);
  assert.ok(
    answer && typeof answer === 'object',
    'the join answers an object for the records it was handed',
  );
  return copyOf(answer);
}

// ------------------------------------------------------------------------------------------------
// The fixtures. Each patterns the recorded shape `{ nodes, edges }` with numeric `index` and edge
// ends, and each carries a provenance the graph-side claims must cite.
// ------------------------------------------------------------------------------------------------

/** A graph record: the graph the record holds, and where the record states it. */
/** @param {any[]} nodes @param {any[]} edges */
function graphRecord(nodes, edges) {
  return { path: GRAPH_PATH, line: GRAPH_LINE, graph: { nodes, edges } };
}

/**
 * The fixture graph. The effect sits at `index` 5 in the fourth slot of the array, so its position
 * and its index disagree — a position-based answer renders 3 where the record states 5. Every node
 * carries `index`, `kind` and `label` and no other field, which is the whole of what a reader may
 * cite (T001).
 */
function unlabelledGraph() {
  return graphRecord(
    [
      { index: 0, kind: 'template', label: 'app-counter' },
      { index: 1, kind: 'signal', label: 'title' },
      { index: 2, kind: 'signal', label: 'count' },
      { index: 5, kind: 'effect', label: '' },
    ],
    [
      { consumer: 0, producer: 1 },
      { consumer: 5, producer: 2 },
    ],
  );
}

/**
 * The same graph with an id and a source string on the effect node: the two identities the answer
 * must not mint a name from (E2).
 */
function identifiableGraph() {
  const graph = unlabelledGraph();
  const nodes = graph.graph.nodes.map((node) =>
    node.kind === 'effect'
      ? { ...node, id: 'node-6', debuggableFn: 'function () { return 1; }' }
      : node,
  );
  return graphRecord(nodes, graph.graph.edges);
}

/** The portal's shape: one labelled effect, produced by a `linkedSignal` (E6). */
function labelledGraph() {
  return graphRecord(
    [
      { index: 0, kind: 'signal', label: 'Resource.extRequest' },
      { index: 3, kind: 'effect', label: 'Resource.loadEffect' },
    ],
    [{ consumer: 3, producer: 0 }],
  );
}

/** Two producers, stated out of index order and one of them twice: reads keep the edge order (E10). */
function manyProducersGraph() {
  return graphRecord(
    [
      { index: 0, kind: 'signal', label: 'items' },
      { index: 1, kind: 'signal', label: 'count' },
      { index: 2, kind: 'signal', label: 'title' },
      { index: 6, kind: 'effect', label: '' },
    ],
    [
      { consumer: 6, producer: 2 },
      { consumer: 6, producer: 1 },
      { consumer: 6, producer: 1 },
    ],
  );
}

/** An effect reading a producer past the graph's last index (E5). */
function producerPastTheGraph() {
  return graphRecord(
    [
      { index: 0, kind: 'signal', label: 'count' },
      { index: 1, kind: 'effect', label: '' },
    ],
    [
      { consumer: 1, producer: 0 },
      { consumer: 1, producer: 99 },
    ],
  );
}

/** A readable graph holding no node of kind `effect`: the third absence (E4). */
function withoutEffectNode() {
  return graphRecord(
    [
      { index: 0, kind: 'signal', label: 'count' },
      { index: 1, kind: 'computed', label: 'double' },
    ],
    [{ consumer: 1, producer: 0 }],
  );
}

/** The same graph with every field the recording says the reader ignores filled in (E9). */
function decoratedGraph() {
  const graph = unlabelledGraph();
  const nodes = graph.graph.nodes.map((node, position) => ({
    ...node,
    id: `node-${position}`,
    epoch: position + 1,
    value: position * 2,
    debuggableFn: 'function () { return 1; }',
  }));
  return graphRecord(nodes, graph.graph.edges);
}

/** The records a fixture graph is answered with. */
/** @param {any} graph @param {any} effect @param {any} [extra] */
function recordsOf(graph, effect, extra = {}) {
  return { graph: graph, effect: effect, ...extra };
}

// ------------------------------------------------------------------------------------------------
// The pins. Each is green on the module as it sits on disk and reddens on the mutation it names.
// ------------------------------------------------------------------------------------------------

/**
 * SC1, E1, E2, E10: the effect is named by the label the graph gives it and by its own `index`, the
 * upstream nodes are rendered in the order the edges appear, and every claim carries an artefact path
 * and line.
 * @param {any} api
 * @param {string} [source]
 */
function pinEffectFromRecord(api, source = JOIN_SOURCE) {
  const answer = ask(
    api,
    recordsOf(unlabelledGraph(), { edge: { consumer: 5 } }),
  );

  assert.equal(
    answer.state,
    'answered',
    `a readable graph, an entry naming the effect by the edge the record holds, and a placed effect node render answered — and the join said "${answer.state}"`,
  );
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_FIELDS,
    'an answer carries the contract\u2019s eight fields and nothing else',
  );
  assert.deepEqual(
    Object.keys(answer.effect || {}).sort(),
    EFFECT_FIELDS,
    `an effect finding carries ${EFFECT_FIELDS.join(', ')} and nothing else, so no phase, write, owner or cause can be smuggled into it`,
  );
  assert.equal(
    answer.effect.label,
    '',
    `the label is exactly as the graph spells it \u2014 the empty string for the unlabelled effect, and never a name minted from an index, a position, a call site or a source string: the record spells "" and the answer rendered ${JSON.stringify(answer.effect.label)}`,
  );
  assert.equal(
    answer.effect.index,
    5,
    `the effect renders the node's own index, the index the graph carries: the record states 5 and the answer rendered ${JSON.stringify(answer.effect.index)} \u2014 a position in the nodes array (3) or a number minted from an id, a call site or a source string is not an index the record states`,
  );
  assert.equal(
    answer.effect.namedBy,
    'recorded-edge',
    'the answer says the node was reached by the edge the record holds',
  );

  const effectClaim = answer.claims.filter((claim) => claim.claim === 'effect');
  assert.equal(
    effectClaim.length,
    1,
    'the effect is one rendered claim and it carries its own artefact',
  );
  assert.equal(
    effectClaim[0].artefactPath,
    GRAPH_PATH,
    `a claim carries the artefact path that states it \u2014 the graph record's own path \u2014 and this claim rendered ${JSON.stringify(effectClaim[0].artefactPath)} where the record states ${JSON.stringify(GRAPH_PATH)}`,
  );
  assert.equal(
    effectClaim[0].line,
    GRAPH_LINE,
    `a claim carries the line that states it: the graph record states the graph at line ${GRAPH_LINE} and the claim rendered ${JSON.stringify(effectClaim[0].line)}`,
  );
  for (const claim of answer.claims) {
    assert.equal(
      typeof claim.artefactPath,
      'string',
      `every rendered claim carries an artefact path \u2014 a claim with no artefact path is not an answer this module produces \u2014 and this one rendered ${JSON.stringify(claim)}`,
    );
    assert.ok(
      claim.artefactPath.length > 0,
      'no claim renders an empty artefact path',
    );
    assert.equal(
      typeof claim.line,
      'number',
      'every rendered claim carries the line that states it',
    );
  }
  assert.equal(
    codeOf(source).includes('artefactPath: artefactPath'),
    true,
    'the shipfeed claim builder takes the path as an argument, so no claim can be built without one',
  );
}

/**
 * SC1, E10: the upstream nodes are the producer ends of the effect's consumer edges, in the order
 * the edges appear, and a producer the graph does not hold is named unplaced rather than read.
 * @param {any} api
 */
function pinReads(api) {
  const answer = ask(
    api,
    recordsOf(manyProducersGraph(), { edge: { consumer: 6 } }),
  );

  assert.equal(
    answer.state,
    'answered',
    `a graph whose effect reads three edges answers answered, and the join said "${answer.state}"`,
  );
  assert.deepEqual(
    answer.reads,
    [
      { index: 2, label: 'title' },
      { index: 1, label: 'count' },
      { index: 1, label: 'count' },
    ],
    `reads are the upstream nodes the edges state, each by its own index and label, in the order the edges appear \u2014 never sorted, never de-duplicated by a set, and never omitting a producer an edge records: the record states title then count then count again, and the answer rendered ${JSON.stringify(answer.reads)}`,
  );
  assert.equal(
    answer.claims.filter((claim) => claim.claim === 'read').length,
    3,
    'one claim per rendered read, so a read with no artefact is not renderable',
  );
}

/**
 * SC1, E2, E9: the empty label is a shape with its own answer and not a fallback, and a node field
 * the recording declares ignored changes nothing.
 * @param {any} api
 */
function pinEmptyLabel(api) {
  const answer = ask(
    api,
    recordsOf(identifiableGraph(), { edge: { consumer: 5 } }),
  );

  assert.equal(
    answer.effect.label,
    '',
    `an unlabelled effect renders the label as an empty string beside its index \u2014 never a fallback such as "effect", "node 5" or the source string: the record spells "" and the answer rendered ${JSON.stringify(answer.effect.label)}`,
  );
  assert.equal(
    answer.effect.index,
    5,
    'the index stands beside the empty label, read from the node and from nothing else',
  );
  const rendered = JSON.stringify({
    effect: answer.effect,
    claims: answer.claims,
  });
  for (const minted of ['node-6', 'function () { return 1; }']) {
    assert.equal(
      rendered.includes(minted),
      false,
      `no identity is minted from an id or a source string: the node carries it, the answer must not render it, and ${JSON.stringify(minted)} appears in ${rendered}`,
    );
  }
}

/**
 * SC2, E7: the ordering is always the one named absence, on every state, and no field of the answer
 * carries a write, an owner or a cause.
 * @param {any} api
 * @param {string} [source]
 */
function pinOrderingAbsent(api, source = JOIN_SOURCE) {
  const cases = [
    ['answered', recordsOf(unlabelledGraph(), { edge: { consumer: 5 } })],
    [
      'answered with a recorded message',
      recordsOf(
        unlabelledGraph(),
        { edge: { consumer: 5 } },
        {
          error: RECORDED_ERROR,
        },
      ),
    ],
    ['graph-unreadable', { effect: { label: 'x' } }],
    ['no-render-entry', recordsOf(unlabelledGraph(), {})],
    ['no-effect-node', recordsOf(withoutEffectNode(), { label: 'anything' })],
  ];

  for (const [id, records] of cases) {
    const answer = ask(api, records);
    assert.deepEqual(
      answer.ordering,
      ORDERING,
      `the ordering is the named absence no-write-record-no-order beside the effect and its upstream nodes \u2014 never a causation (the write, then the render), never an order read out of an edge's direction, and never a write the record does not carry: on ${id} the answer rendered ${JSON.stringify(answer.ordering)}`,
    );
    assert.deepEqual(
      Object.keys(answer).sort(),
      ANSWER_FIELDS,
      `an answer carries the contract's eight fields and nothing else, so no field of the answer carries a write, an owner or a cause: on ${id} the answer rendered ${JSON.stringify(Object.keys(answer).sort())}`,
    );
    const orderingClaims = answer.claims.filter(
      (claim) => claim.claim === 'ordering',
    );
    assert.equal(
      orderingClaims.length,
      1,
      `the ordering is rendered as one claim on every answer, including ${id}`,
    );
    assert.deepEqual(
      orderingClaims[0].values,
      ORDERING,
      'the ordering claim carries the same named absence and no second field',
    );
    assert.equal(
      orderingClaims[0].artefactPath,
      ENTRY,
      'the ordering claim cites the join that states it \u2014 an edge is two members and nothing else',
    );
    assert.equal(
      orderingClaims[0].line,
      18,
      'the ordering claim cites the line of the join that states it',
    );
    const besideDetail = JSON.stringify({ ...answer, detail: '' });
    for (const forbidden of ['preceded', 'owner', 'cause']) {
      assert.equal(
        besideDetail.includes(forbidden),
        false,
        `no write record exists and an edge has no field to order one in, so the answer names no ${forbidden} anywhere beside the effect: ${besideDetail}`,
      );
    }
  }

  // The absence is not a finding: `ordering` never joins `claims` as an effect-shaped entry, and the
  // shipped module builds it in exactly one place, so no branch can vary it.
  assert.equal(
    codeOf(source).split('absence: NO_WRITE_RECORD_NO_ORDER').length - 1,
    1,
    'the ordering is built in exactly one place in the shipped module',
  );
}

/**
 * SC2, E8 (held out): the effect finding and a recorded change-detection message stay two findings
 * in the recorded order and are never joined, so the second is never read as the first one's cause.
 * @param {any} api
 * @param {string} [source]
 */
function pinTwoFindings(api, source = JOIN_SOURCE) {
  const answer = ask(
    api,
    recordsOf(
      unlabelledGraph(),
      { edge: { consumer: 5 } },
      {
        error: RECORDED_ERROR,
      },
    ),
  );

  const effectAt = answer.claims.findIndex((claim) => claim.claim === 'effect');
  const messageAt = answer.claims.findIndex(
    (claim) => claim.claim === 'change-detection',
  );
  assert.ok(effectAt !== -1, 'the effect claim is rendered');
  assert.ok(
    messageAt > effectAt,
    `the recorded change-detection message is a second finding, rendered after the effect in the recorded order and never joined to it: the effect claim is at ${effectAt} and the message claim at ${messageAt}`,
  );
  assert.deepEqual(
    answer.claims[messageAt].values,
    RECORDED_ERROR,
    'the message finding carries the three values the record carried and nothing else',
  );
  assert.deepEqual(
    Object.keys(answer.claims[effectAt].values).sort(),
    EFFECT_FIELDS,
    `the effect finding is never joined to the message: it carries ${EFFECT_FIELDS.join(', ')} and no code, no message and no cause, and it rendered ${JSON.stringify(answer.claims[effectAt].values)}`,
  );
  assert.equal(
    JSON.stringify(answer.effect).includes(RECORDED_ERROR.code),
    false,
    'the message never reaches the effect finding through a shared field',
  );
  assert.equal(
    answer.claims.filter((claim) => claim.claim === 'change-detection').length,
    1,
    'the message is one finding of its own, not a second copy of the effect',
  );
  assert.equal(
    answer.claims[messageAt].artefactPath,
    ENTRY,
    'the message claim cites the join that states the two are never joined',
  );
  assert.equal(
    answer.claims[messageAt].line,
    336,
    'the message claim cites the line that states it, at this head',
  );
  assert.deepEqual(
    answer.ordering,
    ORDERING,
    'the second finding is never the first one\u2019s cause: the ordering stays the named absence',
  );
  assert.equal(
    codeOf(source).includes('CLAIM_CHANGE_DETECTION'),
    true,
    'the message is a claim of its own in the shipped module',
  );
}

/**
 * SC4, E5: every index the answer renders is one the recorded graph's own `nodes` array carries, and
 * a producer end or effect reference the graph cannot place is named in `unplaced` rather than
 * numbered, dropped or resolved to the nearest node.
 * @param {any} api
 * @param {string} [source]
 */
function pinNoIndexOutsideTheGraph(api, source = JOIN_SOURCE) {
  // A producer end past the graph's last index: index 99 on an edge leaving the placed effect.
  const past = ask(
    api,
    recordsOf(producerPastTheGraph(), { edge: { consumer: 1 } }),
  );
  assert.equal(
    past.state,
    'answered',
    'the effect node is placed, so the answer is answered and the unplaceable producer is named beside it',
  );
  assert.deepEqual(
    past.reads,
    [{ index: 0, label: 'count' }],
    `a producer end the graph cannot place is not read: the graph states index 0 and index 99, so the answer renders one read and names the other unplaced \u2014 a number no node carries is never rendered past the graph's last node and is not a node`,
  );
  const carried = new Set(
    producerPastTheGraph().graph.nodes.map((node) => node.index),
  );
  for (const read of past.reads) {
    assert.ok(
      carried.has(read.index),
      `every node index the answer renders is one the graph's own nodes array carries, and ${read.index} is past the graph's last node`,
    );
  }
  assert.equal(
    codeOf(source).includes('unplaced.push'),
    true,
    'the shipped module has a place to name what it cannot place, rather than dropping it',
  );
}

/**
 * SC4, E5: a producer end or effect reference the graph cannot place is named in `unplaced` by end
 * and value — never numbered, dropped or resolved to the nearest node.
 * @param {any} api
 */
function pinUnplaceableNamed(api) {
  const past = ask(
    api,
    recordsOf(producerPastTheGraph(), {
      edge: { consumer: 1 },
    }),
  );
  assert.deepEqual(
    past.unplaced,
    [{ end: 'producer', value: 99 }],
    `a producer the graph does not carry is named in unplaced by end and value \u2014 never numbered, never dropped and never resolved to the nearest node: the answer rendered ${JSON.stringify(past.unplaced)}`,
  );

  // An effect named by an index the record does not hold.
  const named = ask(
    api,
    recordsOf(unlabelledGraph(), { edge: { consumer: 99 } }),
  );
  assert.equal(
    named.state,
    'no-effect-node',
    `an effect named by an index the record does not hold names the node the graph lacks, and the join said "${named.state}"`,
  );
  assert.equal(
    named.effect,
    null,
    'the answer renders no effect at all rather than numbering the reference',
  );
  assert.deepEqual(
    named.reads,
    [],
    'no read is claimed for an effect the graph cannot place',
  );
  assert.deepEqual(
    named.unplaced,
    [{ end: 'effect', value: 99 }],
    `an effect reference the graph cannot place is named unplaced by end and value: the answer rendered ${JSON.stringify(named.unplaced)}`,
  );
  assert.equal(
    JSON.stringify(named).includes('"index":99'),
    false,
    'the unplaceable reference is never rendered as a node index',
  );

  // A producer end the entry names on an edge the graph does not record.
  const unmatched = ask(
    api,
    recordsOf(unlabelledGraph(), {
      edge: { consumer: 5, producer: 77 },
    }),
  );
  assert.deepEqual(
    unmatched.unplaced,
    [{ end: 'producer', value: 77 }],
    `a producer end the graph does not record is named unplaced and never read from a node the graph merely happens to hold: the answer rendered ${JSON.stringify(unmatched.unplaced)}`,
  );
}

/**
 * SC3, E3, E4: the three absences are three distinct states, each in its own sentence, and an unread
 * graph is never rendered as a page with no effects.
 * @param {any} api
 * @param {string} [source]
 */
function pinDistinctAbsences(api, source = JOIN_SOURCE) {
  const noPath = {
    line: GRAPH_LINE,
    graph: { nodes: [], edges: [] },
  };
  const noLists = { path: GRAPH_PATH, line: GRAPH_LINE, graph: { nodes: [] } };

  const cases = [
    {
      id: 'no graph record was supplied',
      records: { effect: { label: 'Resource.loadEffect' } },
      state: 'graph-unreadable',
      names: 'no graph record was supplied',
    },
    {
      id: 'the graph record names no path',
      records: recordsOf(noPath, { label: 'Resource.loadEffect' }),
      state: 'graph-unreadable',
      names: 'names no path',
    },
    {
      id: 'the graph record holds no node and edge lists',
      records: recordsOf(noLists, { label: 'Resource.loadEffect' }),
      state: 'graph-unreadable',
      names: 'holds no node and edge lists',
    },
    {
      id: 'the record carries no render/effect entry',
      records: { graph: unlabelledGraph() },
      state: 'no-render-entry',
      names: 'carries no render/effect entry this module can read',
    },
    {
      id: 'the entry names neither a label nor an indexed edge',
      records: recordsOf(unlabelledGraph(), { label: 7, edge: {} }),
      state: 'no-render-entry',
      names: 'names neither a label nor a recorded edge',
    },
    {
      id: 'the readable graph holds no effect node',
      records: recordsOf(withoutEffectNode(), { label: 'Resource.loadEffect' }),
      state: 'no-effect-node',
      names: 'holds no node of kind effect',
    },
    {
      id: 'the graph holds no effect node the entry names',
      records: recordsOf(unlabelledGraph(), {
        edge: { consumer: 99 },
      }),
      state: 'no-effect-node',
      names: 'none of them is the one the entry names',
    },
  ];

  for (const one of cases) {
    const answer = ask(api, one.records);
    assert.equal(
      answer.state,
      one.state,
      `the absence "${one.id}" is its own state among the three absences, which are three distinct states and never one blank unanswered answer; and an unreadable graph is never rendered as a graph with no effects, because the absence names the graph and nothing else: expected "${one.state}" and the join said "${answer.state}"`,
    );
    assert.ok(
      answer.detail.includes(one.names),
      `the absence "${one.id}" names which absence holds in its own sentence: ${answer.detail}`,
    );
    assert.equal(
      answer.effect,
      null,
      `the absence "${one.id}" renders no effect, no label and no read`,
    );
    assert.deepEqual(
      answer.reads,
      [],
      `the absence "${one.id}" claims no read`,
    );
  }

  const states = cases.map((one) => ask(api, one.records).state);
  assert.deepEqual(
    [...new Set(states)].sort(),
    [...ABSENCES].sort(),
    `the three absences are three distinct states and never one blank unanswered answer: the join answered ${JSON.stringify(states)}`,
  );
  const details = cases.map((one) => ask(api, one.records).detail);
  assert.equal(
    new Set(details).size,
    details.length,
    `each absence case states its own sentence, and ${details.length} cases produced ${new Set(details).size} distinct sentence(s)`,
  );
  const onePerState = ABSENCES.map(
    (state) => details[cases.findIndex((one) => one.state === state)],
  );
  assert.equal(
    new Set(onePerState).size,
    ABSENCES.length,
    `the three absences are three sentences and never one blank unanswered answer: ${JSON.stringify(onePerState)}`,
  );

  // An unreadable graph never borrows the empty-effect sentence and never renders its claims.
  for (const one of cases.filter((c) => c.state === 'graph-unreadable')) {
    const answer = ask(api, one.records);
    assert.equal(
      answer.detail.includes('no node of kind effect'),
      false,
      'an unreadable graph is never described as a graph with no effects',
    );
    assert.deepEqual(
      answer.claims.map((claim) => claim.claim),
      ['ordering'],
      'an unread graph renders the ordering claim and no graph claim, because it names no effect and no read',
    );
  }

  assert.equal(
    codeOf(source).includes('never a page with no effects'),
    true,
    'the shipped module says the graph absence is never a page with no effects',
  );
}

/**
 * SC5, E9: a fact carrying a field the reader ignores changes nothing the answer reports.
 * @param {any} api
 * @param {string} [source]
 */
function pinIgnoredFields(api, source = JOIN_SOURCE) {
  const plain = ask(
    api,
    recordsOf(unlabelledGraph(), { edge: { consumer: 5 } }),
  );
  const decorated = ask(
    api,
    recordsOf(
      decoratedGraph(),
      { edge: { consumer: 5 } },
      {
        cause: 'a write that preceded the render',
        id: 'a-later-capture',
        epoch: 9,
        value: 'a live value',
        debuggableFn: 'function () {}',
      },
    ),
  );

  assert.deepEqual(
    decorated,
    plain,
    `the join reads no field the recording declares ignored, so a fact carrying id, epoch, value, debuggableFn or a cause changes nothing this module reports \u2014 and the decorated answer differs: ${JSON.stringify(decorated)}`,
  );

  const code = codeOf(source);
  for (const field of IGNORED) {
    assert.equal(
      code.includes('node.' + field),
      false,
      `the join reads no node's \`${field}\`: it is a field the recording declares ignored, and a fact carrying one changes nothing`,
    );
  }
  assert.equal(
    /\.cause\b/.test(code),
    false,
    'the join reads no cause from any record',
  );
}

/**
 * SC1, E10: a second answer to the same question over the same records names the same effect label,
 * the same node index and the same upstream nodes.
 * @param {any} api
 */
function pinStableSecondAnswer(api) {
  const records = recordsOf(manyProducersGraph(), { edge: { consumer: 6 } });
  const first = ask(api, records);
  const second = ask(api, records);

  assert.deepEqual(
    second,
    first,
    `a second answer to the same question over the same records names the same effect label, the same node index and the same upstream nodes from the same fields \u2014 purity, and the answer is stable across calls \u2014 and the second answer differs: first ${JSON.stringify(first.effect)} / ${JSON.stringify(first.reads)}, second ${JSON.stringify(second.effect)} / ${JSON.stringify(second.reads)}`,
  );
  assert.equal(
    JSON.stringify(second),
    JSON.stringify(first),
    'the two answers are byte-identical, so no clock, no counter and no set decides their order',
  );
}

/**
 * SC1, E6: the portal's labelled effect and the fixture's empty-label effect render through the same
 * read — no branch on whether a label is present — and no answer claims a page read, a route or a
 * live value it did not take.
 * @param {any} api
 * @param {string} [source]
 */
function pinPortalAndFixtureShapes(api, source = JOIN_SOURCE) {
  const fixture = ask(
    api,
    recordsOf(unlabelledGraph(), { edge: { consumer: 5 } }),
  );
  const portal = ask(
    api,
    recordsOf(labelledGraph(), { edge: { consumer: 3 } }),
  );

  assert.equal(
    fixture.effect.label,
    '',
    'the fixture shape names the empty label as the graph spells it',
  );
  assert.equal(
    portal.effect.label,
    'Resource.loadEffect',
    'the portal shape names the label the portal record carries',
  );
  assert.deepEqual(
    Object.keys(fixture).sort(),
    Object.keys(portal).sort(),
    'both shapes answer with the same fields, because the read does not branch on whether a label is present',
  );
  assert.deepEqual(
    fixture.claims.map((claim) => claim.claim),
    portal.claims.map((claim) => claim.claim),
    'both shapes render the same claim vocabulary from the same read',
  );
  assert.equal(
    portal.reads.length === 1 &&
      portal.reads[0].label === 'Resource.extRequest',
    true,
    `the portal shape names the linkedSignal its edge states, and the answer rendered ${JSON.stringify(portal.reads)}`,
  );
  const rendered = JSON.stringify({
    fixture: fixture.effect,
    portal: portal.effect,
  });
  for (const pageValue of ['localhost', 'http', '/home']) {
    assert.equal(
      rendered.includes(pageValue),
      false,
      `no answer claims a page value this milestone did not read: ${JSON.stringify(pageValue)} appears in ${rendered}`,
    );
  }
  assert.match(
    source,
    /Resource\.loadEffect/,
    'the module names the portal\u2019s labelled effect as the shape its record carries, without claiming a page it did not open',
  );
}

/**
 * PLAN C8: the derived reading of `research/raw/m039-render-phase.json` carries no node `index`, so
 * the join answers with `unplaced` rather than a numbered node. The graph T003 pins is not read here.
 * @param {any} api
 */
function pinRealRecordDerivedReading(api) {
  const fromRecording = RENDER_RECORD.effect.fromRecording;

  // The record's shape first, so this leg is measured and not assumed.
  for (const node of fromRecording.nodes) {
    assert.deepEqual(
      Object.keys(node).sort(),
      ['kind', 'label'],
      'the derived reading carries kind and label and no other node field',
    );
    assert.equal(
      'index' in node,
      false,
      'the derived reading carries no index on any node, which is the absence this leg reports',
    );
  }
  assert.equal(fromRecording.label, '');
  assert.equal(
    linesOf(RENDER_PHASE)[FROM_RECORDING_LINE - 1].trim(),
    '"fromRecording": {',
    `the record states its derived reading at line ${FROM_RECORDING_LINE}, re-resolved by reading the file rather than trusting the number`,
  );

  const answer = ask(api, {
    graph: {
      path: RENDER_PHASE,
      line: FROM_RECORDING_LINE,
      graph: { nodes: fromRecording.nodes, edges: fromRecording.edges },
    },
    effect: { label: fromRecording.label },
    question: RENDER_RECORD.effect.question,
  });

  assert.equal(
    answer.state,
    'answered',
    `the derived reading holds an effect node, so the answer is answered and the absence is the index: the join said "${answer.state}"`,
  );
  assert.equal(
    answer.effect.label,
    '',
    'the effect label is what the record spells: the empty string',
  );
  assert.equal(
    answer.effect.index,
    null,
    `the record carries no index for the effect node, so the answer renders an answer with unplaced rather than a numbered node: 5 is the node's position in the array (and the id is "6"), and the answer rendered ${JSON.stringify(answer.effect.index)}`,
  );
  assert.deepEqual(
    answer.unplaced,
    [{ end: 'effect', value: '' }],
    `the effect reference the graph cannot place is named unplaced by end and the value the record spells: the answer rendered ${JSON.stringify(answer.unplaced)}`,
  );
  assert.deepEqual(
    answer.reads,
    [],
    'no edge can be attributed to an effect the graph cannot place, so the answer claims no read rather than reading a graph with no index as a graph with no reads',
  );
  assert.equal(
    JSON.stringify(answer).includes('"index":5'),
    false,
    'no index is minted from the position in the nodes array',
  );
  assert.equal(
    answer.question,
    RENDER_RECORD.effect.question,
    'the question is the entry record\u2019s own field, verbatim',
  );
  assert.equal(
    answer.claims[0].artefactPath,
    RENDER_PHASE,
    'the graph-side claim cites the record it was read from',
  );
  assert.equal(
    answer.claims[0].line,
    FROM_RECORDING_LINE,
    'the graph-side claim cites the line the graph is stated at',
  );
}

// ------------------------------------------------------------------------------------------------
// The module, its vocabulary and its citations, before any mutation.
// ------------------------------------------------------------------------------------------------

test('T002 — the join is a bare-context module with the contract\u2019s four states and three absences', () => {
  const source = codeOf(JOIN_SOURCE);
  const api = loadJoin();

  assert.deepEqual(
    Object.keys(api).sort(),
    ['ABSENCES', 'IGNORED', 'READS', 'STATES', 'tutorSignals'],
    'the join publishes the answer, the four states, the three absences, the fields it reads and the fields it ignores, and nothing else',
  );
  assert.deepEqual(
    copyOf(api.STATES),
    STATES,
    'the four states are the contract\u2019s',
  );
  assert.deepEqual(
    copyOf(api.ABSENCES),
    ABSENCES,
    'the three absences are the contract\u2019s',
  );
  assert.deepEqual(
    copyOf(api.READS),
    READ_FIELDS,
    'the fields an answer reads are the record\u2019s own',
  );
  assert.deepEqual(
    copyOf(api.IGNORED),
    [...IGNORED, 'a cause a later capture might add'],
    'the fields the join ignores are the recording\u2019s own list (T001, E9)',
  );

  for (const needle of [
    'require(',
    'import ',
    'fetch(',
    'XMLHttpRequest',
    'new Date',
    'Date.now',
    'Math.random',
    'performance.now',
    'localStorage',
    'document.',
    'window.',
    'chrome.',
    'process.',
    'setTimeout',
    'setInterval',
    'readFileSync',
    'angularAiRenderPhase',
    'angularAiTutorFoundations',
  ]) {
    assert.equal(
      source.includes(needle),
      false,
      `the join is pure: it holds no ${needle} \u2014 it imports nothing, touches no filesystem, dispatches no message, performs no network call, holds no clock and reads no page global`,
    );
  }

  // The only artefact path the module spells is the one whose lines state the entry-side claims; a
  // record path is never composed here, it is handed over.
  assert.equal(
    /research\/|scripts\/|\.project\//.test(source),
    false,
    'the join spells no record path: the graph record\u2019s path is read from the record, never composed',
  );
  assert.equal(
    source.split(ENTRY).length - 1,
    1,
    'the join spells the entry\u2019s artefact path exactly once',
  );

  // The recording this milestone measured is what binds the join to the two records and no others.
  assert.deepEqual(
    SHAPES.graphSide.node.read,
    ['index', 'kind', 'label'],
    'the recording declares index, kind and label as the node fields a reader may cite',
  );
  assert.deepEqual(
    SHAPES.graphSide.node.ignored.slice(0, IGNORED.length),
    IGNORED,
    'the recording declares id, epoch, value and debuggableFn ignored, which is the join\u2019s own list',
  );
  assert.deepEqual(
    SHAPES.graphSide.edge.read,
    ['consumer', 'producer'],
    'the recording declares the two edge ends as the whole edge',
  );
  assert.deepEqual(
    SHAPES.graphSide.whatTheSerializerItselfWrites.nodeFieldsNotWritten,
    ['index'],
    'the recording states the absence this join names: the serializer writes an id and never an index',
  );
});

test('T002 — the entry-side claims cite lines that state what they claim, at this head', () => {
  const lines = linesOf(ENTRY);

  assert.match(
    lines[17],
    /no field, no value, no moment/,
    'extension/render-phase.js:18 states that an edge is a direction and no field, no value, no moment \u2014 the line the ordering claim cites',
  );
  assert.match(
    lines[335],
    /finding of its own/,
    'extension/render-phase.js:336 states that a recorded change-detection message is a finding of its own and never joined \u2014 the line the message claim cites',
  );
  assert.match(
    lines[303],
    /The join\./,
    'extension/render-phase.js:304 is the entry the join answers',
  );
  assert.match(
    linesOf(SERIALIZER)[957],
    /id: String\(n\.id\)/,
    'extension/agent-main.js:958 states the serializer writes an id where the reader reads an index',
  );
});

test('T002 — SC1, E1, E2, E6, E10: the effect, its reads and its claims come from the record', () => {
  const api = loadJoin();
  pinEffectFromRecord(api);
  pinReads(api);
  pinEmptyLabel(api);
  pinPortalAndFixtureShapes(api);
  pinStableSecondAnswer(api);
  console.log(
    'T002 answered: effect label "" at index 5 in the fourth slot of a 4-node fixture, 3 reads in edge order (title, count, count), 3 claims on the empty-label answer',
  );
});

test('T002 — SC2, E7, E8: the ordering is the named absence and the message is a second finding', () => {
  const api = loadJoin();
  pinOrderingAbsent(api);
  pinTwoFindings(api);
  const answer = ask(
    api,
    recordsOf(
      unlabelledGraph(),
      { edge: { consumer: 5 } },
      {
        error: RECORDED_ERROR,
      },
    ),
  );
  console.log(
    `T002 ordering: ${JSON.stringify(answer.ordering)} on every state; claims ${JSON.stringify(answer.claims.map((claim) => claim.claim))}`,
  );
});

test('T002 — SC3: the three absences are distinct states with their own sentences', () => {
  const api = loadJoin();
  pinDistinctAbsences(api);
  const states = [
    ask(api, { effect: { label: 'x' } }).state,
    ask(api, recordsOf(unlabelledGraph(), {})).state,
    ask(api, recordsOf(withoutEffectNode(), { label: 'x' })).state,
  ];
  console.log(`T002 absences: ${states.join(' / ')}`);
});

test('T002 — SC4, E5: unplaced names what no node can place', () => {
  const api = loadJoin();
  pinNoIndexOutsideTheGraph(api);
  pinUnplaceableNamed(api);
});

test('T002 — SC5, E9: the join is pure and ignores the fields the recording declares ignored', () => {
  const api = loadJoin();
  pinIgnoredFields(api);
});

test('T002 — PLAN C8: the derived reading answers with unplaced, not with a numbered node', () => {
  const api = loadJoin();
  pinRealRecordDerivedReading(api);
  console.log(
    'T002 real record: m039 /effect/fromRecording -> answered, effect { label: "", index: null, namedBy: "label" }, unplaced [{ end: "effect", value: "" }], reads []',
  );
});

// ------------------------------------------------------------------------------------------------
// The mutants. Each is one edit of the shipped module, applied in memory. `defect` is the word the
// failing pin must be shown to name and `names` the string in its failure text: a mutant that reddens
// with a stack and no sentence would prove nothing about the answer.
// ------------------------------------------------------------------------------------------------

const MUTATIONS = [
  {
    id: 'no-artefact-path',
    // SC1 itself: a claim rendered with no artefact path is not an answer this module produces.
    defect: 'artefact path',
    names: 'artefact path',
    anchor: '      artefactPath: artefactPath,',
    replacement: "      artefactPath: '',",
    pin: pinEffectFromRecord,
  },
  {
    id: 'effect-by-position',
    // E2 backwards: the effect named by its position in the nodes array instead of its own index.
    defect: 'position',
    names: 'index the record states',
    anchor: '    const effect = effectOf(subject.node, entry.namedBy);',
    replacement:
      '    const effect = effectOf(subject.node, entry.namedBy);\n' +
      '    effect.index = graph.nodes.indexOf(subject.node);',
    pin: pinEffectFromRecord,
  },
  {
    id: 'producer-omitted',
    // SC1 backwards: a producer an edge records that the answer omits.
    defect: 'omitting',
    names: 'omitting a producer',
    anchor:
      '      reads.push({ index: indexOfNode(producer), label: labelOf(producer) });',
    replacement:
      '      if (reads.length < 1)\n        reads.push({ index: indexOfNode(producer), label: labelOf(producer) });',
    pin: pinReads,
  },
  {
    id: 'index-past-the-graph',
    // SC4 backwards: a producer end past the last index rendered as a node.
    defect: 'past the graph',
    names: 'past the graph',
    anchor:
      '      if (producer === null) {\n' +
      '        unplaced.push(unplacedOf(END_PRODUCER, edge.producer));\n' +
      '        continue;\n' +
      '      }',
    replacement:
      "      if (producer === null) {\n        reads.push({ index: edge.producer, label: '' });\n        continue;\n      }",
    pin: pinNoIndexOutsideTheGraph,
  },
  {
    id: 'unplaceable-dropped',
    // SC4 backwards: a producer the graph does not carry dropped instead of named unplaced.
    defect: 'dropped',
    names: 'unplaced',
    anchor: '        unplaced.push(unplacedOf(END_PRODUCER, edge.producer));',
    replacement: '        // a producer the graph does not hold names nothing',
    pin: pinUnplaceableNamed,
  },
  {
    id: 'absence-as-causation',
    // SC2 backwards: the absence rendered as causation — the write, then the render.
    defect: 'causation',
    names: 'named absence',
    anchor: '    return { state: ABSENT, absence: NO_WRITE_RECORD_NO_ORDER };',
    replacement:
      "    return {\n      state: 'recorded',\n      absence: null,\n      cause: 'the write preceded the render',\n    };",
    pin: pinOrderingAbsent,
  },
  {
    id: 'order-from-edge-direction',
    // SC2 backwards: an order read out of an edge's direction.
    defect: 'direction',
    names: 'named absence',
    anchor: '    return { state: ABSENT, absence: NO_WRITE_RECORD_NO_ORDER };',
    replacement:
      "    return {\n      state: 'recorded',\n      absence: null,\n      order: 'before the effect, because the producer points at the consumer',\n    };",
    pin: pinOrderingAbsent,
  },
  {
    id: 'write-recorded',
    // SC2 backwards: a write the record does not carry, rendered as a field beside the answer.
    defect: 'write',
    names: 'eight fields',
    anchor: '    return {\n      state: state,\n      question: question,',
    replacement:
      "    return {\n      state: state,\n      write: 'the write that preceded the render',\n      question: question,",
    pin: pinOrderingAbsent,
  },
  {
    id: 'absences-folded',
    // SC3 backwards: the three absences folded into one blank answer.
    defect: 'three absences',
    names: 'distinct',
    anchor:
      "  const GRAPH_UNREADABLE = 'graph-unreadable';\n" +
      "  const NO_RENDER_ENTRY = 'no-render-entry';\n" +
      "  const NO_EFFECT_NODE = 'no-effect-node';",
    replacement:
      "  const GRAPH_UNREADABLE = 'cannot-tell';\n" +
      "  const NO_RENDER_ENTRY = 'cannot-tell';\n" +
      "  const NO_EFFECT_NODE = 'cannot-tell';",
    pin: pinDistinctAbsences,
  },
  {
    id: 'unreadable-as-no-effects',
    // SC3 backwards: an unreadable graph reported as a page with no effects.
    defect: 'graph with no effects',
    names: 'names the graph',
    anchor: '    if (graph.problem !== null) {',
    replacement:
      '    if (graph.problem !== null) {\n' +
      '      return answerOf(\n' +
      '        NO_EFFECT_NODE,\n' +
      '        asked,\n' +
      '        null,\n' +
      '        [],\n' +
      '        [],\n' +
      '        [],\n' +
      "        'the page has no effects to report',\n" +
      '      );\n' +
      '    }\n' +
      '    if (graph.problem !== null) {',
    pin: pinDistinctAbsences,
  },
  {
    id: 'ignored-field-read',
    // E9 backwards: an answer that changes when the fact gains a field the reader ignores.
    defect: 'ignored',
    names: 'changes nothing',
    anchor: '      label: labelOf(node),',
    replacement:
      "      label:\n        labelOf(node) +\n        (isIndex(node.epoch) ? ' epoch' : '') +\n        (typeof node.id === 'string' ? ' id' : ''),",
    pin: pinIgnoredFields,
  },
  {
    id: 'second-call-differs',
    // Purity backwards: the second answer over the same records is not the first.
    defect: 'purity',
    names: 'second answer',
    anchor: '      label: labelOf(node),',
    replacement:
      '      label:\n' +
      '        labelOf(node) +\n' +
      '        ((globalThis.__tutorSignalsReads =\n' +
      '          (globalThis.__tutorSignalsReads || 0) + 1) > 1\n' +
      "          ? ' (second read)'\n" +
      "          : ''),",
    pin: pinStableSecondAnswer,
  },
  {
    id: 'message-joined-to-effect',
    // E8 backwards: the recorded message joined into the effect finding as its cause.
    defect: 'joined',
    names: 'never joined',
    anchor: '    if (changeDetection !== null) {\n      claims.push(',
    replacement:
      '    if (changeDetection !== null && effect !== null && claims.length > 0) {\n' +
      '      claims[0] = claimOf(\n' +
      '        CLAIM_EFFECT,\n' +
      '        {\n' +
      '          label: effect.label,\n' +
      '          index: effect.index,\n' +
      '          namedBy: effect.namedBy,\n' +
      '          cause: changeDetection.message,\n' +
      '        },\n' +
      '        graph.path,\n' +
      '        graph.line,\n' +
      '      );\n' +
      '    }\n' +
      '    if (changeDetection !== null) {\n      claims.push(',
    pin: pinTwoFindings,
  },
];

/** One mutation, written into the source on disk's bytes — and asserted to have changed them. */
/** @param {string} source @param {{anchor: string, replacement: string}} mutation */
function mutated(source, mutation) {
  const changed = source.replace(mutation.anchor, mutation.replacement);
  assert.notEqual(
    changed,
    source,
    `mutation ${mutation.anchor} must change the source it is applied to`,
  );
  return changed;
}

/** The failure a pin raises on a mutated source, or `null` where it stayed green. */
/** @param {() => void} pin */
function failureOf(pin) {
  try {
    pin();
  } catch (error) {
    return /** @type {Error} */ (error);
  }
  return null;
}

test('T002 mutants — every anchor is one place in the shipped module and really changes it', () => {
  assert.ok(
    MUTATIONS.length >= 12,
    'the battery carries the defects the contract names',
  );
  for (const mutation of MUTATIONS) {
    assert.equal(
      JOIN_SOURCE.split(mutation.anchor).length - 1,
      1,
      `mutation ${mutation.id} anchors on exactly one place in ${JOIN}`,
    );
    mutated(JOIN_SOURCE, mutation);
    assert.equal(
      typeof mutation.pin,
      'function',
      `mutation ${mutation.id} has a pin`,
    );
  }
});

test('T002 mutants — each defect reddens its pin, and the failure names the defect by string', () => {
  const lines = [];
  for (const mutation of MUTATIONS) {
    const source = mutated(JOIN_SOURCE, mutation);

    // The pin is green on the module as it sits on disk first, so a failure below is the mutation's
    // and not a pin that was already red.
    mutation.pin(loadJoin(), JOIN_SOURCE);

    const failure = failureOf(() => mutation.pin(loadJoin(source), source));
    assert.ok(
      failure !== null,
      `mutation ${mutation.id} must redden the pin that names it, and it reddened nothing`,
    );
    assert.match(
      failure.message,
      new RegExp(mutation.defect),
      `mutation ${mutation.id} must redden a pin naming "${mutation.defect}", and it said: ${failure.message.split('\n')[0]}`,
    );
    assert.ok(
      failure.message.includes(mutation.names),
      `mutation ${mutation.id} must redden naming "${mutation.names}", and it said: ${failure.message.split('\n')[0]}`,
    );
    lines.push(`${mutation.id}: ${failure.message.split('\n')[0]}`);
  }
  console.log(`T002 mutants: ${lines.join(' || ')}`);
});

test('T002 — the three absences are three states, and a fold reddens naming each sentence', () => {
  // The distinction is not only declared: each absence answers with its own sentence, and no two
  // sentences are the same length, text or state — the pin that holds SC3 to it is above.
  const api = loadJoin();
  const answers = [
    ask(api, { effect: { label: 'x' } }),
    ask(api, recordsOf(unlabelledGraph(), {})),
    ask(api, recordsOf(withoutEffectNode(), { label: 'x' })),
  ];
  assert.deepEqual(
    answers.map((answer) => answer.state),
    ABSENCES,
    'each absence answers with its own state, in the order this module decides them',
  );
  assert.equal(
    new Set(answers.map((answer) => answer.detail)).size,
    3,
    'three absences, three sentences',
  );
  console.log(
    `T002 absence sentences: ${answers.map((a) => a.detail).join(' || ')}`,
  );
});
