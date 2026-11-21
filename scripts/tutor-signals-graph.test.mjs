// @ts-check
// Run: node --test scripts/tutor-signals-graph.test.mjs
//
// M057 T003 reads the graph record the answer comes from. PLAN C8 retargeted this task at T001's
// measurement (`05c2f022`): the premise that no record under `research/raw/` carries a node of kind
// `effect` is false, and exactly one record carries the effect in the shape an answer can read —
// `research/raw/m039-render-phase.json`'s `/effect/freshRead`, whose six nodes each carry a numeric
// `index` and whose effect sits at `index` 5 with `label` `""`. What no record carries is an `index`
// in the serializer's own output — `serializeGraph` pushes `id: String(n.id)` and resolves each edge
// end to a node id (`extension/agent-main.js:958`) — so a fresh capture would reproduce the missing
// `index` defect rather than cure it. The capture leg is deleted: this task writes no record.
//
// So this suite is a read, four ways:
//
//   the shape       six nodes, every one carrying a numeric `index`; six `allEdges`, every one
//                   carrying numeric `consumer`/`producer` ends; one node of kind `effect`, at
//                   `index` 5, carrying the empty label; its one consumer edge reaching producer
//                   `index` 2, the node the graph labels `count` (SC1). A re-derivation of the
//                   record reddens here rather than in a later wave.
//   the provenance  the record's own `capture` block — the command that wrote it, the route, the
//                   page URL, the element and component it was read off, the build, the browser
//                   instance and the time — pinned as the record states it, so the graph is the
//                   record's own statement and not one this milestone composes. The record states no
//                   `head`, and none is claimed (SC5, E6).
//   the answer      the join T002 ships (`extension/tutor-signals.js`, landed `beb69b97`) is loaded
//                   in a bare `node:vm` context and handed the record's own node and edge lists: it
//                   names the effect at `index` 5 by its empty label beside that index, names
//                   `index` 2 by the label the graph gives it, carries the record's path and the
//                   line the graph sits at on its claims, and states the ordering as the named
//                   absence `no-write-record-no-order` — never a write, an owner or a cause (SC1,
//                   SC2).
//   no capture      nothing is opened, built or started: the suite's own import list names node
//                   builtins only, the record a capture would have written
//                   (`research/raw/m057-signal-graph.json`) exists nowhere under `research/raw/`,
//                   and the bare context the join runs in holds no page global at all (SC5, E6).
//
// The three defects the task names are applied to T002's join in memory, one at a time: an answer
// that reads a position instead of `index`, an answer that claims a portal read this task did not
// take, and a claim that invents a provenance field the record does not carry. Each reddens the pin
// that names it, and the failure says which defect it is.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

/** The record this task reads, the join it reads it through, and the suite that reads it. */
const RECORD = 'research/raw/m039-render-phase.json';
const RAW = 'research/raw';
const JOIN = 'extension/tutor-signals.js';
const ENTRY = 'extension/render-phase.js';
const SELF = 'scripts/tutor-signals-graph.test.mjs';

/** The record a capture would have written, and which this task does not create (PLAN C8). */
const WOULD_BE_CAPTURED = 'm057-signal-graph.json';

const RECORDING = JSON.parse(readFileSync(join(ROOT, RECORD), 'utf8'));
const JOIN_SOURCE = readFileSync(join(ROOT, JOIN), 'utf8');

/** The recorded graph, and the provenance the record states for it. */
const FRESH = RECORDING.effect.freshRead;
const CAPTURE = RECORDING.capture;

/** The line the record states its indexed graph at, re-resolved against the file's own bytes below. */
const FRESH_READ_LINE = 399;

/** The effect the record carries: `index` 5, the empty label, produced by the signal `count` at 2. */
const EFFECT_INDEX = 5;
const PRODUCER_INDEX = 2;
const EFFECT_LABEL = 'count';
const NODE_COUNT = 6;
const EDGE_COUNT = 6;

/** The answer's vocabulary, as T002's join publishes it. */
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
const CLAIM_FIELDS = ['artefactPath', 'claim', 'line', 'values'];
const ORDERING = { state: 'absent', absence: 'no-write-record-no-order' };

/** The node builtins this suite may name: nothing else is importable from it. */
const BUILTINS = [
  'node:assert/strict',
  'node:fs',
  'node:path',
  'node:test',
  'node:url',
  'node:vm',
];

/**
 * Tokens no read-only suite reaches a page, a browser driver or a capture through. Each is spelled
 * from parts, so the scan's own word list is never the thing it finds in this file's code.
 */
const CAPTURE_TOKENS = [
  ['child_', 'process'],
  ['spawn', 'Sync', '('],
  ['exec', 'FileSync', '('],
  ['exec', 'Sync', '('],
  ['process', '.env'],
  ['puppet', 'eer'],
  ['play', 'wright'],
  ['chrome-remote', '-interface'],
  ['fetch', '('],
].map((parts) => parts.join(''));

/** The page globals a bare `node:vm` context does not hold, and which no answer may read. */
const PAGE_GLOBALS = [
  'document',
  'window',
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'process',
  'location',
  'navigator',
  'chrome',
];

// ------------------------------------------------------------------------------------------------
// Reading: the record as it sits on disk, and the join as it sits on disk or as this file mutates it
// in memory.
// ------------------------------------------------------------------------------------------------

/** A vm-realm value as a plain value, so a deepEqual compares data and not two realms' prototypes. */
/** @param {any} value */
function copyOf(value) {
  return JSON.parse(JSON.stringify(value));
}

/** One file's lines, for the pointer and citation checks. @param {string} path */
function linesOf(path) {
  return readFileSync(join(ROOT, path), 'utf8').split(/\r?\n/);
}

/** One file's code with its comments removed: the doc comments are prose and decide nothing. */
/** @param {string} source */
function codeOf(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

/** The specifier of every `import … from '<specifier>'` in a file. @param {string} source */
function importSpecifiers(source) {
  const specifiers = [];
  for (const line of source.split(/\r?\n/)) {
    const found = /^\s*import\s+(?:[^'"]*?\sfrom\s+)?'([^']+)'/.exec(line);
    if (found !== null) specifiers.push(found[1]);
  }
  return specifiers;
}

/** `extension/tutor-signals.js` in a bare context with nothing in it. */
/** @param {string} [source] */
function loadJoin(source = JOIN_SOURCE) {
  const context = createContext({});
  runInContext(source, context);
  assert.ok(
    context.angularAiTutorSignals,
    `${JOIN} publishes angularAiTutorSignals`,
  );
  assert.equal(
    typeof context.angularAiTutorSignals.tutorSignals,
    'function',
    `${JOIN} exports tutorSignals`,
  );
  return context.angularAiTutorSignals;
}

/** One answer, as plain data. */
/** @param {any} api @param {any} records */
function ask(api, records) {
  const answer = api.tutorSignals(records);
  assert.ok(
    answer && typeof answer === 'object',
    'the join answers an object for the records it was handed',
  );
  return copyOf(answer);
}

/**
 * The record's own graph, handed over as it sits: its `nodes` and `allEdges`, and the path and the
 * line the record states the graph at. `nodes` and `edges` default to the record's own lists.
 * @param {any[]} [nodes] @param {any[]} [edges]
 */
function recordedGraph(nodes = FRESH.nodes, edges = FRESH.allEdges) {
  return { path: RECORD, line: FRESH_READ_LINE, graph: { nodes, edges } };
}

/** The two records T002's join takes: the graph record and the render/effect entry. */
/** @param {any} graph @param {any} effect @param {any} [extra] */
function recordsOf(graph, effect, extra = {}) {
  return { graph: graph, effect: effect, ...extra };
}

// ------------------------------------------------------------------------------------------------
// The pins. Each is green on the record and the join as they sit on disk, and reddens on the
// mutation it names.
// ------------------------------------------------------------------------------------------------

/**
 * SC1: the record carries the indexed shape the answer needs — six nodes each with a numeric
 * `index`, six `allEdges` each with numeric ends, the effect at `index` 5 with the empty label, and
 * its one consumer edge reaching producer `index` 2, the node the graph labels `count`.
 */
function pinFreshReadShape() {
  const line = linesOf(RECORD)[FRESH_READ_LINE - 1].trim();
  assert.equal(
    line,
    '"freshRead": {',
    `the record states its indexed graph at line ${FRESH_READ_LINE} of ${RECORD}, re-resolved by reading the file rather than trusting the number: that line says ${JSON.stringify(line)}`,
  );
  assert.equal(
    FRESH.target,
    'counter fixture',
    `the record says which page it was read on, and this graph is the counter fixture's: it says ${JSON.stringify(FRESH.target)}`,
  );
  assert.equal(
    FRESH.nodeCount,
    NODE_COUNT,
    'the record states its own node count',
  );
  assert.equal(
    FRESH.edgeCount,
    EDGE_COUNT,
    'the record states its own edge count',
  );
  assert.equal(
    FRESH.nodes.length,
    NODE_COUNT,
    `the recorded graph carries ${NODE_COUNT} nodes, and this read found ${FRESH.nodes.length} — a re-derivation of the record reddens here rather than in a later wave`,
  );
  assert.equal(
    FRESH.allEdges.length,
    EDGE_COUNT,
    `the recorded graph carries ${EDGE_COUNT} edges, and this read found ${FRESH.allEdges.length}`,
  );

  for (const node of FRESH.nodes) {
    assert.equal(
      typeof node.index,
      'number',
      `every node the record carries has a numeric index, because the answer reads an index and a position is not one: the node labelled ${JSON.stringify(node.label)} carries ${JSON.stringify(node.index)}`,
    );
    assert.equal(
      Number.isFinite(node.index),
      true,
      `the index is a finite number, and the node labelled ${JSON.stringify(node.label)} carries ${JSON.stringify(node.index)}`,
    );
  }
  assert.deepEqual(
    FRESH.nodes.map((node) => node.index),
    [0, 1, 2, 3, 4, 5],
    `the recorded indices are 0 through 5 in the order the record states them, and this read found ${JSON.stringify(FRESH.nodes.map((node) => node.index))}`,
  );

  for (const edge of FRESH.allEdges) {
    assert.equal(
      typeof edge.consumer,
      'number',
      `every edge carries a numeric consumer end, and this one carries ${JSON.stringify(edge.consumer)}`,
    );
    assert.equal(
      typeof edge.producer,
      'number',
      `every edge carries a numeric producer end, and this one carries ${JSON.stringify(edge.producer)}`,
    );
  }

  const effects = FRESH.nodes.filter((node) => node.kind === 'effect');
  assert.equal(
    effects.length,
    1,
    `exactly one node the record carries is of kind effect, and this read found ${effects.length}`,
  );
  const effect = effects[0];
  assert.equal(
    effect.index,
    EFFECT_INDEX,
    `the effect sits at index ${EFFECT_INDEX} in the record, because the answer names it by that index: the node carries ${JSON.stringify(effect.index)}`,
  );
  assert.equal(
    effect.label,
    '',
    `the effect's label is the empty string, which is a recorded shape and not a degenerate case: the record spells ${JSON.stringify(effect.label)}`,
  );
  assert.equal(
    FRESH.nodeIndex,
    EFFECT_INDEX,
    `the record states the effect's index beside its graph, and it states ${JSON.stringify(FRESH.nodeIndex)}`,
  );
  assert.equal(
    FRESH.kind,
    'effect',
    'the record states the effect kind beside its graph',
  );
  assert.equal(
    FRESH.label,
    '',
    `the record states the effect's label beside its graph, and it states ${JSON.stringify(FRESH.label)}`,
  );
  assert.equal(
    FRESH.labelEmpty,
    true,
    'the record states that the label is empty, so no reader has to guess it',
  );

  const fromEffect = FRESH.allEdges.filter(
    (edge) => edge.consumer === EFFECT_INDEX,
  );
  assert.equal(
    fromEffect.length,
    1,
    `the effect's one consumer edge is the only edge leaving index ${EFFECT_INDEX}, and this read found ${fromEffect.length}`,
  );
  assert.equal(
    fromEffect[0].producer,
    PRODUCER_INDEX,
    `the effect's one consumer edge reaches producer index ${PRODUCER_INDEX}, and this edge reaches ${JSON.stringify(fromEffect[0].producer)}`,
  );
  const producer = FRESH.nodes.find((node) => node.index === PRODUCER_INDEX);
  assert.ok(
    producer,
    `the graph carries the node at index ${PRODUCER_INDEX} the effect's edge reaches`,
  );
  assert.equal(
    producer.kind,
    'signal',
    `the upstream node is the signal the graph labels ${JSON.stringify(EFFECT_LABEL)}, and the record calls it ${JSON.stringify(producer.kind)}`,
  );
  assert.equal(
    producer.label,
    EFFECT_LABEL,
    `the upstream node is the signal the graph labels ${JSON.stringify(EFFECT_LABEL)}, and the record spells ${JSON.stringify(producer.label)}`,
  );
  assert.deepEqual(
    FRESH.signalsTheEdgesName,
    [EFFECT_LABEL],
    `the record names the one signal its effect's edges reach, and it names ${JSON.stringify(FRESH.signalsTheEdgesName)}`,
  );
  const effectNode = FRESH.nodes.find((node) => node.index === EFFECT_INDEX);
  assert.equal(
    FRESH.nodes.indexOf(effectNode),
    EFFECT_INDEX,
    `in the record's own order the effect's position and its index agree (${EFFECT_INDEX}), which is why the position pin below hands the join the record's own nodes reordered`,
  );
}

/**
 * SC5, E6: the record's provenance is the `capture` block's own statement — command, route, page
 * URL, element, component, build, browser instance and time — and the record states no `head`.
 */
function pinProvenance() {
  assert.deepEqual(
    Object.keys(CAPTURE).sort(),
    [
      'at',
      'build',
      'check',
      'command',
      'component',
      'element',
      'instance',
      'page',
      'reading',
      'records',
      'remeasured',
      'route',
      'task',
    ],
    `the capture block states the provenance this suite pins and nothing else, so a field a milestone composes — a head, a route it did not read, a clock it did not hold — has nowhere to sit: the block carries ${JSON.stringify(Object.keys(CAPTURE).sort())}`,
  );
  assert.equal(
    'head' in CAPTURE,
    false,
    `the record states no head field, and this suite claims none: the capture block carries ${JSON.stringify(Object.keys(CAPTURE).sort())}`,
  );
  assert.equal(
    CAPTURE.task,
    'T004',
    'the capture block says which task wrote it',
  );
  assert.equal(
    CAPTURE.command,
    'set "M039_CAPTURE=1"&& node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs"',
    `the record states the command that wrote it, and it states ${JSON.stringify(CAPTURE.command)}`,
  );
  assert.equal(
    CAPTURE.route,
    '/',
    `the record states the route it was read on, and it states ${JSON.stringify(CAPTURE.route)}`,
  );
  assert.equal(
    CAPTURE.page,
    'http://localhost:4222/',
    `the record states the page URL it was read on, and it states ${JSON.stringify(CAPTURE.page)}`,
  );
  assert.equal(
    CAPTURE.element,
    'app-counter',
    `the record states the element it was read off, and it states ${JSON.stringify(CAPTURE.element)}`,
  );
  assert.equal(
    CAPTURE.component,
    '_Counter',
    `the record states the component it was read off, and it states ${JSON.stringify(CAPTURE.component)}`,
  );
  assert.deepEqual(
    CAPTURE.build,
    {
      app: 'spikes/ng222-app',
      angular: '22.2.2',
      configuration: 'development',
    },
    `the record states the build it was read in — the app, the Angular version and the configuration — and it states ${JSON.stringify(CAPTURE.build)}`,
  );
  assert.deepEqual(
    CAPTURE.instance,
    { name: 'chrome-beta-gemma4', cdp: 9334 },
    `the record states the browser instance it was read in — its name and its CDP port — and it states ${JSON.stringify(CAPTURE.instance)}`,
  );
  assert.equal(
    CAPTURE.at,
    '2026-11-08T07:19:56.846Z',
    `the record states the time it was read at, and it states ${JSON.stringify(CAPTURE.at)}`,
  );
  assert.equal(
    CAPTURE.records,
    RECORD,
    `the capture block names the record it wrote, and it names ${JSON.stringify(CAPTURE.records)}`,
  );

  // The graph is the page the capture block names, so the provenance pinned above is the graph's own.
  assert.equal(
    FRESH.url,
    CAPTURE.page,
    `the graph was read on the page the capture block names: the graph says ${JSON.stringify(FRESH.url)} and the capture block says ${JSON.stringify(CAPTURE.page)}`,
  );
  assert.equal(
    FRESH.element,
    CAPTURE.element,
    `the graph was read off the element the capture block names: ${JSON.stringify(FRESH.element)} against ${JSON.stringify(CAPTURE.element)}`,
  );
  assert.equal(
    FRESH.component,
    CAPTURE.component,
    `the graph was read off the component the capture block names: ${JSON.stringify(FRESH.component)} against ${JSON.stringify(CAPTURE.component)}`,
  );
}

/**
 * SC1, SC2: the answer over the record's own `nodes` and `allEdges` names the effect at `index` 5 by
 * its empty label beside that index, names the upstream node at `index` 2 by the label the graph
 * gives it, echoes the record's question, and states the ordering as the named absence.
 * @param {any} api
 */
function pinAnswerFromRecord(api) {
  const question = RECORDING.effect.question;
  const records = recordsOf(
    recordedGraph(),
    { edge: { consumer: EFFECT_INDEX } },
    { question: question },
  );
  const answer = ask(api, records);

  assert.equal(
    answer.state,
    'answered',
    `a readable record with a placed effect node answers answered, and the join said ${JSON.stringify(answer.state)}`,
  );
  assert.deepEqual(
    Object.keys(answer).sort(),
    ANSWER_FIELDS,
    'an answer carries the contract eight fields and nothing else',
  );
  assert.deepEqual(
    answer.effect,
    { label: '', index: EFFECT_INDEX, namedBy: 'recorded-edge' },
    `the answer names the effect at index ${EFFECT_INDEX} by the label the record spells — the empty string — beside that index, reached by the edge the record holds: it rendered ${JSON.stringify(answer.effect)}`,
  );
  assert.deepEqual(
    answer.reads,
    [{ index: PRODUCER_INDEX, label: EFFECT_LABEL }],
    `the answer names the upstream node the record's edge states, at index ${PRODUCER_INDEX} by the label the graph gives it — ${JSON.stringify(EFFECT_LABEL)} — and it rendered ${JSON.stringify(answer.reads)}`,
  );
  assert.deepEqual(
    answer.unplaced,
    [],
    'every end the record states is placeable in this graph, so nothing is named unplaced',
  );
  assert.deepEqual(
    answer.ordering,
    ORDERING,
    `the ordering is the named absence no-write-record-no-order beside the effect and its upstream node — never a write, an owner or a cause — and the answer rendered ${JSON.stringify(answer.ordering)}`,
  );
  assert.equal(
    answer.question,
    question,
    `the question is the record's own field, verbatim: the record says ${JSON.stringify(question)} and the answer said ${JSON.stringify(answer.question)}`,
  );
  assert.deepEqual(
    answer.claims.map((claim) => claim.claim),
    ['effect', 'read', 'ordering'],
    `the answer renders one claim per statement it makes — the effect, its read and the ordering — and it rendered ${JSON.stringify(answer.claims.map((claim) => claim.claim))}`,
  );
  assert.equal(
    answer.detail.includes(RECORD + ':' + FRESH_READ_LINE),
    true,
    `the answer's own sentence states the record and the line it read, as ${RECORD}:${FRESH_READ_LINE}: ${answer.detail}`,
  );
  const besideDetail = JSON.stringify({ ...answer, detail: '' });
  for (const forbidden of ['preceded', 'owner', 'cause']) {
    assert.equal(
      besideDetail.includes(forbidden),
      false,
      `no write record exists, so the answer names no ${forbidden} anywhere beside the effect: ${besideDetail}`,
    );
  }

  // The empty label is reached by the same read as a labelled one: naming the effect by the label the
  // record spells places the same node, at the same index, with the same upstream node.
  const byLabel = ask(
    api,
    recordsOf(recordedGraph(), { label: '' }, { question: question }),
  );
  assert.deepEqual(
    byLabel.effect,
    { label: '', index: EFFECT_INDEX, namedBy: 'label' },
    `the empty label is a spelling and not a missing value, so naming the effect by it places the node at index ${EFFECT_INDEX}: the answer rendered ${JSON.stringify(byLabel.effect)}`,
  );
  assert.deepEqual(
    byLabel.reads,
    [{ index: PRODUCER_INDEX, label: EFFECT_LABEL }],
    'the same upstream node is read through the same edge, whichever way the effect was named',
  );
  assert.equal(
    JSON.stringify(ask(api, records)),
    JSON.stringify(answer),
    'a second answer over the same records is the first, byte for byte (E10)',
  );
}

/**
 * SC1: every claim carries the record's own path and the line the graph sits at, and no provenance
 * field the record does not carry — the record states no `head`.
 * @param {any} api
 */
function pinClaimProvenance(api) {
  const answer = ask(
    api,
    recordsOf(recordedGraph(), { edge: { consumer: EFFECT_INDEX } }),
  );
  const lines = linesOf(RECORD);

  for (const claim of answer.claims) {
    assert.deepEqual(
      Object.keys(claim).sort(),
      CLAIM_FIELDS,
      `a claim carries ${CLAIM_FIELDS.join(', ')} and nothing else, so no provenance field the record does not carry is invented beside it — no head, no route and no clock: this claim rendered ${JSON.stringify(claim)}`,
    );
    assert.equal(
      typeof claim.artefactPath,
      'string',
      'every claim carries an artefact path, because a claim with no artefact is not an answer this module produces',
    );
  }

  const graphSide = answer.claims.filter(
    (claim) => claim.claim === 'effect' || claim.claim === 'read',
  );
  assert.equal(
    graphSide.length,
    2,
    `the effect and its one read are the two graph-side claims, and this answer rendered ${graphSide.length}`,
  );
  for (const claim of graphSide) {
    assert.equal(
      claim.artefactPath,
      CAPTURE.records,
      `every graph-side claim cites the record the capture block says it was written to — ${CAPTURE.records} — and this claim cited ${JSON.stringify(claim.artefactPath)}`,
    );
    assert.equal(
      claim.line,
      FRESH_READ_LINE,
      `every graph-side claim cites the line the graph sits at, ${FRESH_READ_LINE}, and this claim cited ${JSON.stringify(claim.line)}`,
    );
    assert.equal(
      lines[claim.line - 1].trim(),
      '"freshRead": {',
      `that line really states the graph in the record's own bytes, and line ${claim.line} says ${JSON.stringify(lines[claim.line - 1].trim())}`,
    );
  }

  const ordering = answer.claims.find((claim) => claim.claim === 'ordering');
  assert.ok(ordering, 'the ordering is rendered as its own claim');
  assert.deepEqual(
    ordering.values,
    ORDERING,
    'the ordering claim carries the named absence and no second field',
  );
  assert.deepEqual(
    Object.keys(ordering.values).sort(),
    ['absence', 'state'],
    `the ordering states a state and a named absence and no third field a cause could be smuggled into: it rendered ${JSON.stringify(ordering.values)}`,
  );
  assert.equal(
    ordering.artefactPath,
    ENTRY,
    'the ordering claim cites the join that states an edge is a direction and no field, no value, no moment',
  );
  assert.equal(
    ordering.line,
    18,
    `the ordering claim cites the line that states it at this head, and it cited ${JSON.stringify(ordering.line)}`,
  );
}

/**
 * SC1, E2: the answer reads a node's own `index`, never its position in the nodes array. In the
 * record's own order the two agree, so the pin hands the join the record's own six nodes reversed:
 * the effect now sits at position 0 and the record still states `index` 5 for it.
 * @param {any} api
 */
function pinIndexNotPosition(api) {
  const reordered = FRESH.nodes.slice().reverse();
  const answer = ask(
    api,
    recordsOf(recordedGraph(reordered), { edge: { consumer: EFFECT_INDEX } }),
  );

  assert.equal(
    answer.state,
    'answered',
    `the record's own nodes reordered are still the record's graph, so the answer is answered and the join said ${JSON.stringify(answer.state)}`,
  );
  assert.equal(
    answer.effect.index,
    EFFECT_INDEX,
    `the effect sits at position 0 of this list and the record states index ${EFFECT_INDEX} for it: a position in the nodes array is not an index the record states, and the answer rendered ${JSON.stringify(answer.effect.index)}`,
  );
  assert.equal(
    answer.effect.label,
    '',
    'the label is the record spelling and not a name minted from a position',
  );
  assert.deepEqual(
    answer.reads,
    [{ index: PRODUCER_INDEX, label: EFFECT_LABEL }],
    `the upstream node is the one the record states at index ${PRODUCER_INDEX}, not the node one position before it: the answer rendered ${JSON.stringify(answer.reads)}`,
  );
}

/** SC5: the suite's own imports are node builtins, and the record a capture would have written is absent. */
function pinNoCaptureLeg() {
  const source = readFileSync(join(ROOT, SELF), 'utf8');
  const specifiers = importSpecifiers(source);

  assert.deepEqual(
    [...specifiers].sort(),
    BUILTINS,
    `the suite's own import list names node builtins only — ${BUILTINS.join(', ')} — so no capture flag, no browser driver, no page-side probe and no profiler module can be reached from it: it names ${JSON.stringify(specifiers)}`,
  );
  for (const specifier of specifiers) {
    assert.match(
      specifier,
      /^node:/,
      `every import is a node builtin, and ${JSON.stringify(specifier)} is not one`,
    );
  }
  const code = codeOf(source);
  for (const token of CAPTURE_TOKENS) {
    assert.equal(
      code.includes(token),
      false,
      `nothing is opened, built or started for this task, so the suite holds no ${token}: no child process, no browser driver, no network call and no page-side probe`,
    );
  }

  assert.equal(
    existsSync(join(ROOT, RAW, WOULD_BE_CAPTURED)),
    false,
    `the record this task would have captured — ${RAW}/${WOULD_BE_CAPTURED} — is nowhere under ${RAW}: PLAN C8 deleted the capture leg, because the serializer writes id where the reader reads index, so a capture could not supply the field the answer reads`,
  );
}

/**
 * SC5, E6: no page was opened, so no answer claims one — and the suite names the portal's labelled
 * `Resource.loadEffect` as the shape a portal read would offer in place of this record's empty-label
 * effect, without claiming it.
 * @param {any} api
 */
function pinNoPortalReadClaim(api) {
  const answer = ask(
    api,
    recordsOf(recordedGraph(), { edge: { consumer: EFFECT_INDEX } }),
  );

  assert.equal(
    answer.effect.label,
    '',
    `the effect label is what this record spells — the empty string — and the portal's labelled Resource.loadEffect is the shape a portal read would offer in its place, not a value this answer may render: the answer rendered ${JSON.stringify(answer.effect.label)}`,
  );
  const rendered = JSON.stringify({
    effect: answer.effect,
    reads: answer.reads,
    unplaced: answer.unplaced,
    ordering: answer.ordering,
    claims: answer.claims,
  });
  for (const pageValue of [
    'Resource.loadEffect',
    'Resource.extRequest',
    'localhost',
    'http://',
    '/home',
  ]) {
    assert.equal(
      rendered.includes(pageValue),
      false,
      `no page was opened for this task, so the answer does not claim a portal read: ${JSON.stringify(pageValue)} appears in ${rendered}`,
    );
  }
  const paths = [...new Set(answer.claims.map((claim) => claim.artefactPath))];
  assert.deepEqual(
    paths.sort(),
    [ENTRY, RECORD].sort(),
    `the answer's claims cite the two artefacts it read — the record and the join — and no third one a page would state: it cited ${JSON.stringify(paths)}`,
  );

  // The record is the counter fixture's, and its own page read carried no labelled effect.
  const labels = FRESH.nodes.map((node) => node.label);
  assert.equal(
    labels.includes('Resource.loadEffect'),
    false,
    `the record this task reads carries no labelled Resource.loadEffect: the labels it carries are ${JSON.stringify(labels)}`,
  );
  // The suite names that shape in its own words, and names where the join states it.
  assert.match(
    readFileSync(join(ROOT, SELF), 'utf8'),
    /Resource\.loadEffect/,
    `the suite names the portal's labelled effect as the shape a portal read would offer in place of this record's empty-label effect, without claiming a page it did not open`,
  );
  const lines = linesOf(ENTRY);
  assert.match(
    lines[12],
    /label may be empty/,
    `extension/render-phase.js:13 states that the effect's label may be empty, which is the shape this record carries: the line says ${JSON.stringify(lines[12].trim())}`,
  );
  assert.match(
    lines[13],
    /node 5, id "6", label ""/,
    `extension/render-phase.js:14 names the fixture effect as node 5 with the empty label — the node this record states at index ${EFFECT_INDEX} — and the line says ${JSON.stringify(lines[13].trim())}`,
  );
  assert.match(
    lines[14],
    /portal carries one labelled effect/,
    `extension/render-phase.js:15 states that the portal carries one labelled effect: the line says ${JSON.stringify(lines[14].trim())}`,
  );
  assert.match(
    lines[15],
    /Resource\.loadEffect/,
    `extension/render-phase.js:16 names it, and states its producer is the linkedSignal labelled Resource.extRequest — the shape a portal read would offer in place of this record's empty-label effect: the line says ${JSON.stringify(lines[15].trim())}`,
  );
}

// ------------------------------------------------------------------------------------------------
// The record, its provenance and the answer, before any mutation.
// ------------------------------------------------------------------------------------------------

test('T003 — the record carries the indexed graph the answer reads (SC1)', () => {
  pinFreshReadShape();
  console.log(
    `T003 shape: ${RECORD}/effect/freshRead at line ${FRESH_READ_LINE} — ${FRESH.nodes.length} nodes, indices ${JSON.stringify(FRESH.nodes.map((node) => node.index))}; ${FRESH.allEdges.length} edges, every one with numeric consumer/producer ends; one node of kind effect at index ${EFFECT_INDEX} with label ""; its one consumer edge ${EFFECT_INDEX} -> ${PRODUCER_INDEX} reaching the signal labelled ${JSON.stringify(EFFECT_LABEL)}`,
  );
});

test('T003 — the record states its own provenance, and states no head (SC5, E6)', () => {
  pinProvenance();
  console.log(
    `T003 provenance: command ${JSON.stringify(CAPTURE.command)}; route ${JSON.stringify(CAPTURE.route)}; page ${JSON.stringify(CAPTURE.page)}; element ${JSON.stringify(CAPTURE.element)}; component ${JSON.stringify(CAPTURE.component)}; build ${JSON.stringify(CAPTURE.build)}; instance ${JSON.stringify(CAPTURE.instance)}; at ${JSON.stringify(CAPTURE.at)}; head: absent`,
  );
});

test('T003 — the join answers from the record and names the effect at 5 and the signal at 2 (SC1)', () => {
  const api = loadJoin();
  pinAnswerFromRecord(api);
  const answer = ask(
    api,
    recordsOf(
      recordedGraph(),
      { edge: { consumer: EFFECT_INDEX } },
      {
        question: RECORDING.effect.question,
      },
    ),
  );
  console.log(
    `T003 answer over the record: ${JSON.stringify({ state: answer.state, effect: answer.effect, reads: answer.reads, unplaced: answer.unplaced, ordering: answer.ordering })}; claims ${JSON.stringify(answer.claims.map((claim) => claim.claim))}`,
  );
});

test('T003 — the answer carries the record path and pointer on every claim, and invents no field (SC1)', () => {
  const api = loadJoin();
  pinClaimProvenance(api);
});

test('T003 — the answer reads a node\u2019s own index and never its position (SC1, E2)', () => {
  const api = loadJoin();
  pinIndexNotPosition(api);
  console.log(
    `T003 index not position: the record's own nodes reversed put the effect at position 0, and the answer still names index ${EFFECT_INDEX} reading ${JSON.stringify([{ index: PRODUCER_INDEX, label: EFFECT_LABEL }])}`,
  );
});

test('T003 — no capture leg: node builtins only and no m057-signal-graph.json (SC5)', () => {
  pinNoCaptureLeg();
  const specifiers = importSpecifiers(readFileSync(join(ROOT, SELF), 'utf8'));
  const context = createContext({});
  runInContext(JOIN_SOURCE, context);
  for (const global of PAGE_GLOBALS) {
    assert.equal(
      typeof context[global],
      'undefined',
      `the join runs in a bare context, so no answer can read the page global ${global}: the context holds it as ${typeof context[global]}`,
    );
  }
  console.log(
    `T003 no capture: imports ${JSON.stringify(specifiers)}; page globals in the bare context ${JSON.stringify(PAGE_GLOBALS.map((global) => `${global}=${typeof context[global]}`))}; ${RAW}/${WOULD_BE_CAPTURED} absent`,
  );
});

test('T003 — no page was opened, and the portal\u2019s labelled effect is named, not claimed (SC5, E6)', () => {
  const api = loadJoin();
  pinNoPortalReadClaim(api);
  console.log(
    'T003 portal: the record\u2019s effect label is ""; Resource.loadEffect is named as the shape a portal read would offer in its place (extension/render-phase.js:15-16); no page was opened for this task',
  );
});

// ------------------------------------------------------------------------------------------------
// The mutants. Each is one edit of T002's join, applied in memory. `defect` is the word the failing
// pin must be shown to name and `names` the string in its failure text: a mutant that reddens with a
// stack and no sentence would prove nothing about the answer.
// ------------------------------------------------------------------------------------------------

const MUTATIONS = [
  {
    id: 'effect-by-position',
    // E2 backwards: the effect named by its position in the nodes array instead of its own index.
    defect: 'position',
    names: 'index the record states',
    anchor: '    const effect = effectOf(subject.node, entry.namedBy);',
    replacement:
      '    const effect = effectOf(subject.node, entry.namedBy);\n' +
      '    effect.index = graph.nodes.indexOf(subject.node);',
    pin: pinIndexNotPosition,
  },
  {
    id: 'portal-read-claimed',
    // SC5 backwards: the answer claims a portal read this task did not take.
    defect: 'portal read',
    names: 'no page was opened',
    anchor:
      '    claims.push(\n' +
      '      claimOf(CLAIM_ORDERING, orderingState(), ENTRY_PATH, ENTRY_LINE_ORDERING),\n' +
      '    );',
    replacement:
      '    claims.push(\n' +
      '      claimOf(\n' +
      '        CLAIM_EFFECT,\n' +
      "        { route: '/home', page: 'http://localhost:4222/', label: 'Resource.loadEffect' },\n" +
      '        ENTRY_PATH,\n' +
      '        ENTRY_LINE_ORDERING,\n' +
      '      ),\n' +
      '    );\n' +
      '    claims.push(\n' +
      '      claimOf(CLAIM_ORDERING, orderingState(), ENTRY_PATH, ENTRY_LINE_ORDERING),\n' +
      '    );',
    pin: pinNoPortalReadClaim,
  },
  {
    id: 'provenance-invented',
    // SC1 backwards: a provenance field the record does not carry, invented on every claim.
    defect: 'invented',
    names: 'provenance field',
    anchor:
      '  function claimOf(claim, values, artefactPath, line) {\n    return {\n      claim: claim,',
    replacement:
      '  function claimOf(claim, values, artefactPath, line) {\n' +
      '    return {\n' +
      "      head: 'beb69b97acad146fcb96bcc1cf6e0b7bb2e9b481',\n" +
      '      claim: claim,',
    pin: pinClaimProvenance,
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

test('T003 mutants — every anchor is one place in the join and really changes it', () => {
  assert.equal(
    MUTATIONS.length,
    3,
    'the battery carries the three defects the task names',
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

test('T003 mutants — each defect reddens its pin, and the failure names the defect by string', () => {
  const lines = [];
  for (const mutation of MUTATIONS) {
    const source = mutated(JOIN_SOURCE, mutation);

    // The pin is green on the join as it sits on disk first, so a failure below is the mutation's and
    // not a pin that was already red.
    mutation.pin(loadJoin());

    const failure = failureOf(() => mutation.pin(loadJoin(source)));
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
  console.log(`T003 mutants: ${lines.join(' || ')}`);
});
