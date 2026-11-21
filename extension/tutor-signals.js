// tutor-signals.js — the pure join behind M057's tutor surface: one signals question answered from
// the two records the agent already keeps, the effect node the graph carries named by the label the
// graph gives it and by its own node `index`, the signals its edges say it reads, and the write
// ordering published as the named absence no record on disk can fill.
//
// The inputs are the two records, and nothing else (SC5):
//
//   the graph record   the signal graph as the page agent serialized it — `serializeGraph` at
//                      `extension/agent-main.js:912`, carried per check as `graph:
//                      serializeGraph(graph)` at `:1070`. Its recorded shape is
//                      `{ nodes: [{ index, kind, label, … }], edges: [{ consumer, producer }] }`
//                      (`extension/linked-state.js:29-36`), and a node is read for `index`, `kind`
//                      and `label` only: every other field (`id`, `epoch`, `value`,
//                      `debuggableFn`, a cause a later capture might add) is ignored, so a fact
//                      carrying one changes nothing this module reports
//                      (`extension/render-phase.js:31-35`, E9). The record also states where it is
//                      written — a `path` and a `line` — because every claim this module renders
//                      carries the artefact path and line that states it, and a record's own bytes
//                      are not something a pure join may read (SC1).
//   the render/effect the entry the existing join answers at `extension/render-phase.js:304`: the
//     entry             subject `{ label }` or `{ edge: { consumer, producer } }` that names the
//                      effect node, the optional recorded change-detection message `error`, and the
//                      entry record's own `question`. An edge names a direction of dependency and
//                      nothing else — no field, no value, no moment — so a write is not
//                      representable as an edge (`extension/render-phase.js:17-20`, E7).
//
// Why the record is the input and not a capture: `serializeGraph` pushes `id: String(n.id)` and
// never an `index` (`extension/agent-main.js:957-960`, `:1003`), so a fresh serialized graph
// reproduces the missing-`index` defect instead of curing it. The one record on disk that carries
// the indexed shape is `research/raw/m039-render-phase.json`'s `/effect/freshRead`, and the one
// shape on disk that carries the graph without an `index` is the same file's
// `/effect/fromRecording` — read here for what it is: an effect reachable by the label the record
// spells and by no index at all (PLAN C8). What no record carries is an `index` in the
// serializer's own output, which is why `index` is named wherever the graph gives none and is
// never minted from a position in the nodes array, a call site or a source string (E2).
//
// The answer is one object with eight fields, every one present in every state:
//
//   { state, question, effect, reads, unplaced, ordering, claims, detail }
//
//   state      answered            the graph record is readable, the entry names an effect node the
//                                  graph holds, and the answer renders what the record states.
//              graph-unreadable    no graph record could be read: none was supplied, it names no
//                                  path or no line, or it holds no node and edge lists. The absence
//                                  names the graph and nothing else — never the page's effects, and
//                                  never a graph with no effects (SC3, E3).
//              no-render-entry     the graph record is readable but the record carries no
//                                  render/effect entry: nothing names an effect node. Distinct from
//                                  the graph absence and from the empty-effect absence (SC3, E4).
//              no-effect-node      the entry names an effect node and the readable graph holds
//                                  none it can place: either the graph carries no node of kind
//                                  `effect`, or none of the effect nodes it carries is the one the
//                                  entry names. The entry's reference is named in `unplaced`
//                                  rather than resolved to the nearest node (SC3, SC4, E4, E5).
//   question   the entry record's own `question` field, verbatim, or the empty string where the
//              record states none. Never composed, never paraphrased, echoed into every state.
//   effect     on `answered`, `{ label, index, namedBy }` and on every absence `null`:
//                label     the label exactly as the graph spells it — the empty string where the
//                          graph spells an empty label, which is a recorded shape and not a
//                          degenerate case (E1, E2) — never a name minted from an index, a
//                          position, a call site or a source string.
//                index     the node's own `index` as the graph carries it, or `null` where the
//                          graph carries none for that node. A null index is reported as the
//                          absence it is: the effect reference is named in `unplaced`, and no
//                          number is invented for it (SC4, PLAN C8).
//                namedBy   `label` where the caller reached the node by a label — the empty label
//                          included — and `recorded-edge` where it reached it by the edge the
//                          record holds. The vocabulary is the existing join's
//                          (`extension/render-phase.js:56-59`).
//   reads      on `answered`, the upstream nodes the graph's edges state for that effect, each as
//              `{ index, label }`, in the order the edges appear: never sorted, never
//              de-duplicated by a set, never read from a producer the graph does not hold (SC1,
//              E10). A producer end the graph cannot place is not rendered as a read; it is named
//              in `unplaced` and the read is omitted, because a number no node carries is not a
//              node (SC4, E5). Empty on every absence.
//   unplaced   every producer end and every effect reference the graph cannot place, each as
//              `{ end, value }` — `end` is `effect` or `producer`, `value` is the end the record
//              states or the reference the caller named, verbatim. Named by end and value, never
//              numbered, never dropped and never resolved to the nearest node (SC4, E5), and never
//              de-duplicated: two edges stating one unplaceable end state it twice because the
//              record states it twice.
//   ordering   always the one object `{ state: 'absent', absence: 'no-write-record-no-order' }`, on
//              every answer including the three absences. No write record exists anywhere in
//              `extension/` (T001 measured it, `research/raw/m057-record-shapes.json`), an edge
//              carries no field to order a write in, so the ordering is a named absence and never
//              a finding: there is no field here a cause could be smuggled into (SC2, E7). It is
//              built in exactly one place, so no branch of this file can vary it.
//   claims     one entry per rendered claim, each as `{ claim, values, artefactPath, line }` in
//              M055's answer shape — a claim carries the artefact that states it or it is not a
//              claim this module produces (SC1). `claim` is one of `effect`, `read`, `unplaced`,
//              `ordering`, `change-detection`; `values` is what that claim renders, and every
//              graph-side claim cites the graph record's own `path` and `line` while every
//              entry-side claim cites the join that states it (`extension/render-phase.js`, at the
//              line that states it). No path is composed and none is invented. An absence renders
//              the ordering claim and no graph claim, because it names no effect and no read.
//   detail     this join's own sentence about what it read or which absence holds. Never a record
//              field and never a record's prose: where it quotes a value it quotes the value.
//
// The three absences are three states with three sentences, decided in the order the contract lists
// them — the graph record, then the entry, then the effect node — and never folded into one blank
// answer. Each case answers before the next is asked, so an unread graph is never reported as a page
// with no effects and a record with no entry never borrows the empty-effect sentence (SC3, E3, E4).
//
// The effect finding and a recorded change-detection message stay two findings in the recorded
// order, the effect first: the message is a claim of its own after the effect's claims, it carries
// the three values the record carried and nothing else, and it is never joined to the effect — so
// the second is never read as the first one's cause (`extension/render-phase.js:49-51`, `:336-338`,
// E8). The empty label is reached by the same read as a labelled one: this module does not branch
// on whether a label is present (E1). The portal's record carries one labelled effect,
// `Resource.loadEffect`, whose producer is the `linkedSignal` labelled `Resource.extRequest`
// (`extension/render-phase.js:15-16`); the empty-label effect is the fixture's shape, and this
// milestone read no page to reach either of them, so no answer here claims a page read, a route or
// a live value it did not take (E6, SC5).
//
// This module imports nothing at runtime, touches no filesystem, dispatches no message, performs no
// network call, holds no clock, reads no page global and consults no field the recording says the
// reader ignores (SC5). It is a pure join, so it cannot reach a page even if it wanted to: the
// capture belongs to a caller, and this module only says what the captured records support. A bare
// `node:vm` context with nothing in it is enough to run it, which the suite proves rather than
// assuming, and a second answer to the same question over the same records names the same effect
// label, the same node index and the same upstream nodes from the same fields (E10).
(function () {
  'use strict';

  // The four states the join can answer, in the order the contract lists them, as data a surface can
  // enumerate rather than as four string comparisons scattered through a renderer.
  const ANSWERED = 'answered';
  const GRAPH_UNREADABLE = 'graph-unreadable';
  const NO_RENDER_ENTRY = 'no-render-entry';
  const NO_EFFECT_NODE = 'no-effect-node';

  const STATES = Object.freeze([
    ANSWERED,
    GRAPH_UNREADABLE,
    NO_RENDER_ENTRY,
    NO_EFFECT_NODE,
  ]);

  // The three absences SC3 requires stated distinctly, in the order this module decides them.
  const ABSENCES = Object.freeze([
    GRAPH_UNREADABLE,
    NO_RENDER_ENTRY,
    NO_EFFECT_NODE,
  ]);

  // How the answer says the effect node was reached. The existing join's two words, reused so a
  // surface renders one vocabulary and not two (`extension/render-phase.js:56-59`).
  const NAMED_BY_LABEL = 'label';
  const NAMED_BY_RECORDED_EDGE = 'recorded-edge';

  // The ordering, as data: one state, one named absence, on every answer this module gives.
  const ABSENT = 'absent';
  const NO_WRITE_RECORD_NO_ORDER = 'no-write-record-no-order';

  // The node kind that says "effect". A label is never consulted to decide what kind of node one is.
  const EFFECT_KIND = 'effect';

  // The claim names an answer renders, one per statement it makes.
  const CLAIM_EFFECT = 'effect';
  const CLAIM_READ = 'read';
  const CLAIM_UNPLACED = 'unplaced';
  const CLAIM_ORDERING = 'ordering';
  const CLAIM_CHANGE_DETECTION = 'change-detection';

  // The two ends an unplaced entry can name: a producer end of an edge, or the effect reference the
  // entry itself named.
  const END_EFFECT = 'effect';
  const END_PRODUCER = 'producer';

  // The artefact that states the entry-side claims, and the lines in it that state them: an edge is
  // `{ consumer, producer }` and nothing else, so no order can be read out of one
  // (`extension/render-phase.js:18`), and a recorded change-detection message is a finding of its
  // own, after the effect and never joined to it (`extension/render-phase.js:336`). Both lines are
  // re-checked by the suite at this head, because a citation that slid off its line is a claim with
  // no artefact.
  const ENTRY_PATH = 'extension/render-phase.js';
  const ENTRY_LINE_ORDERING = 18;
  const ENTRY_LINE_CHANGE_DETECTION = 336;

  // The fields an answer reads, named once so a surface can say which field it rendered from and so
  // the suite can hold this list to the recording's own field map.
  const READS = Object.freeze({
    graph: 'graph',
    graphPath: 'graph.path',
    graphLine: 'graph.line',
    nodes: 'graph.graph.nodes',
    edges: 'graph.graph.edges',
    effectLabel: 'effect.label',
    effectEdge: 'effect.edge',
    error: 'error',
    question: 'question',
  });

  // The node fields T001 measured as ignored (`research/raw/m057-record-shapes.json`), declared here
  // so a pin can hold this module to reading none of them and to naming the absence rather than a
  // value a later capture might add (E9).
  const IGNORED = Object.freeze([
    'id',
    'epoch',
    'value',
    'debuggableFn',
    'a cause a later capture might add',
  ]);

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A graph index: the numbers the recordings carry as `index`, `consumer` and `producer`.
  function isIndex(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // The index a node carries, or null where it carries none: `index` is read and nothing stands in
  // for it.
  function indexOfNode(node) {
    return isObject(node) && isIndex(node.index) ? node.index : null;
  }

  function kindOf(node) {
    return isObject(node) ? node.kind : null;
  }

  // A node's label exactly as the graph spells it. The empty string is a spelling and not a
  // missing value: an unlabelled effect is a recorded shape (E1, E2).
  function labelOf(node) {
    const label = isObject(node) ? node.label : null;
    return typeof label === 'string' ? label : '';
  }

  // A quoted value, for this join's own sentences. The value is quoted as the record spells it.
  function quote(value) {
    return '"' + String(value) + '"';
  }

  function countOf(count, one, many) {
    return count + ' ' + (count === 1 ? one : many);
  }

  // The record states where the graph is written: the path, and the line the graph sits at. Both are
  // required, because every claim this module renders carries the artefact that states it and a
  // claim with no path is not a claim this module produces (SC1).
  function graphRecordOf(records) {
    const record = isObject(records) ? records.graph : null;
    if (!isObject(record)) {
      return {
        problem:
          'no graph record could be read: no graph record was supplied, and the absence names the graph rather than the page\u2019s effects',
        path: null,
        line: null,
        nodes: null,
        edges: null,
      };
    }
    if (typeof record.path !== 'string' || record.path === '') {
      return {
        problem:
          'no graph record could be read: the graph record names no path, so no claim could carry the artefact that states it',
        path: null,
        line: null,
        nodes: null,
        edges: null,
      };
    }
    if (!isIndex(record.line) || record.line < 1) {
      return {
        problem:
          'no graph record could be read: the graph record ' +
          record.path +
          ' names no line, so no claim could carry where in that artefact the graph is stated',
        path: record.path,
        line: null,
        nodes: null,
        edges: null,
      };
    }
    const graph = record.graph;
    if (
      !isObject(graph) ||
      !Array.isArray(graph.nodes) ||
      !Array.isArray(graph.edges)
    ) {
      return {
        problem:
          'no graph record could be read: the graph record ' +
          record.path +
          ':' +
          record.line +
          ' holds no node and edge lists, so there is no graph to read \u2014 which is never a page with no effects',
        path: record.path,
        line: record.line,
        nodes: null,
        edges: null,
      };
    }
    return {
      problem: null,
      path: record.path,
      line: record.line,
      nodes: graph.nodes,
      edges: graph.edges,
    };
  }

  // The render/effect entry: the subject the caller read, or null where the record carries none this
  // module can read. A label is a string — the empty label included, because the empty label is a
  // recorded shape — and an edge names the consumer end the record holds, which is an index. No
  // other field of the entry decides anything.
  function entryOf(records) {
    const entry = isObject(records) ? records.effect : null;
    if (!isObject(entry)) return null;
    if (typeof entry.label === 'string') {
      return { namedBy: NAMED_BY_LABEL, value: entry.label, edge: null };
    }
    if (isObject(entry.edge) && isIndex(entry.edge.consumer)) {
      return {
        namedBy: NAMED_BY_RECORDED_EDGE,
        value: entry.edge.consumer,
        edge: entry.edge,
      };
    }
    return null;
  }

  // Every node whose kind says "effect" — never a node whose label merely looks like one.
  function effectNodesIn(nodes) {
    const found = [];
    for (let i = 0; i < nodes.length; i += 1) {
      if (kindOf(nodes[i]) === EFFECT_KIND) found.push(nodes[i]);
    }
    return found;
  }

  // The node a graph index points at, or null when the graph holds no node with that index. An index
  // the graph does not hold is an absence, not a value to be guessed.
  function nodeAtIndex(nodes, index) {
    if (!isIndex(index)) return null;
    for (let i = 0; i < nodes.length; i += 1) {
      if (indexOfNode(nodes[i]) === index) return nodes[i];
    }
    return null;
  }

  // Whether the graph records an edge with exactly these two ends.
  function edgeRecorded(edges, consumer, producer) {
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      if (!isObject(edge)) continue;
      if (edge.consumer !== consumer) continue;
      if (edge.producer !== producer) continue;
      return true;
    }
    return false;
  }

  // One unplaced reference, by its end and the value the record states. Nothing else goes in: a
  // number here would be a claim the graph does not support (SC4).
  function unplacedOf(end, value) {
    return { end: end, value: value };
  }

  // The effect node the entry names, and the references it could not place. A label names an effect
  // node carrying that label — the empty label included — and an edge names one whose own `index` is
  // the consumer end the record holds. Exactly one node must match; zero matches is the effect the
  // graph does not hold, and the reference is named unplaced rather than resolved to the nearest
  // node (E5).
  function subjectOf(effectNodes, entry) {
    const named = [];
    for (let i = 0; i < effectNodes.length; i += 1) {
      const node = effectNodes[i];
      const value =
        entry.namedBy === NAMED_BY_LABEL ? labelOf(node) : indexOfNode(node);
      if (value === entry.value) named.push(node);
    }
    if (named.length === 1) {
      return { node: named[0], unplaced: [] };
    }
    return {
      node: null,
      unplaced: [unplacedOf(END_EFFECT, entry.value)],
    };
  }

  // The effect finding, built in one place so a pin on its shape is a pin on every answer. Its three
  // fields are the whole vocabulary it has: no phase, no write, no owner, no cause, and no field a
  // later capture could fill (SC2).
  function effectOf(node, namedBy) {
    return {
      label: labelOf(node),
      index: indexOfNode(node),
      namedBy: namedBy,
    };
  }

  // The upstream nodes the effect's consumer edges state, each as `{ index, label }`, in the order
  // the edges appear. No sort, no set, no de-duplication: two edges to one producer are two reads
  // because the record states two. A producer end the graph cannot place is named unplaced and
  // contributes no read, because a number no node carries is not a node (E5, E10). An effect whose
  // own node carries no index has no attributive edge at all, so it reports no read and claims none:
  // an edge cannot be placed for a node the graph cannot place.
  function readsOf(nodes, edges, consumer, unplaced) {
    const reads = [];
    if (consumer === null) return reads;
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      if (!isObject(edge)) continue;
      if (edge.consumer !== consumer) continue;
      const producer = nodeAtIndex(nodes, edge.producer);
      if (producer === null) {
        unplaced.push(unplacedOf(END_PRODUCER, edge.producer));
        continue;
      }
      reads.push({ index: indexOfNode(producer), label: labelOf(producer) });
    }
    return reads;
  }

  // The recorded change-detection message as the record carried it: three text values and nothing
  // else. It names no effect, no owner and no cause, because the message it was built from named
  // none (E8).
  function changeDetectionOf(records) {
    const error = isObject(records) ? records.error : null;
    if (!isObject(error)) return null;
    return {
      code: typeof error.code === 'string' ? error.code : null,
      message: typeof error.message === 'string' ? error.message : null,
      provenance:
        typeof error.provenance === 'string' ? error.provenance : null,
    };
  }

  // One claim: what it renders, and the artefact path and line that states it. A claim with no
  // artefact path is not a claim this module can build, because the path is an argument here.
  function claimOf(claim, values, artefactPath, line) {
    return {
      claim: claim,
      values: values,
      artefactPath: artefactPath,
      line: line,
    };
  }

  // The ordering: one object, one state, one named absence, built here and nowhere else, so no
  // branch of this file can vary it and no field can carry a cause (SC2, E7).
  function orderingState() {
    return { state: ABSENT, absence: NO_WRITE_RECORD_NO_ORDER };
  }

  // The claims an answer renders, in the order it renders them: the effect, its reads, what the
  // record could not place, the ordering, and — last, after the effect and never joined to it — the
  // recorded change-detection message (E8). Every graph-side claim cites the graph record's own
  // path and line; every entry-side claim cites the join that states it.
  function claimsOf(graph, effect, reads, unplaced, changeDetection) {
    const claims = [];
    if (effect !== null && graph.path !== null) {
      claims.push(claimOf(CLAIM_EFFECT, effect, graph.path, graph.line));
      for (let i = 0; i < reads.length; i += 1) {
        claims.push(claimOf(CLAIM_READ, reads[i], graph.path, graph.line));
      }
    }
    if (graph.path !== null) {
      for (let i = 0; i < unplaced.length; i += 1) {
        claims.push(
          claimOf(CLAIM_UNPLACED, unplaced[i], graph.path, graph.line),
        );
      }
    }
    claims.push(
      claimOf(CLAIM_ORDERING, orderingState(), ENTRY_PATH, ENTRY_LINE_ORDERING),
    );
    if (changeDetection !== null) {
      claims.push(
        claimOf(
          CLAIM_CHANGE_DETECTION,
          changeDetection,
          ENTRY_PATH,
          ENTRY_LINE_CHANGE_DETECTION,
        ),
      );
    }
    return claims;
  }

  // One answer, with every field present in every state, so a renderer reads eight fields and not
  // seven sometimes. `ordering` is built here and only here.
  function answerOf(state, question, effect, reads, unplaced, claims, detail) {
    return {
      state: state,
      question: question,
      effect: effect,
      reads: reads,
      unplaced: unplaced,
      ordering: orderingState(),
      claims: claims,
      detail: detail,
    };
  }

  // The sentence an `answered` answer states: what was read, where it is written, and the absence
  // that stands beside it.
  function answeredDetail(graph, effect, reads, unplaced, changeDetection) {
    let detail =
      'the graph record ' +
      graph.path +
      ':' +
      graph.line +
      ' states the effect node labelled ' +
      quote(effect.label) +
      (effect.index === null
        ? ' and carries no index for it'
        : ' at index ' +
          effect.index +
          ', reached by the ' +
          (effect.namedBy === NAMED_BY_LABEL
            ? 'label the graph spells'
            : 'edge the record holds')) +
      ', and ' +
      countOf(reads.length, 'upstream node', 'upstream nodes') +
      ' in the order its edges appear';
    if (effect.index === null) {
      detail +=
        '; no index is minted for that node from a position in the nodes array, a call site or a source string, so the effect reference is named unplaced rather than numbered';
    }
    if (unplaced.length > 0) {
      detail +=
        '; the graph record cannot place ' +
        countOf(unplaced.length, 'reference', 'references') +
        ', each named by its end and the value the record states rather than numbered, dropped or resolved to the nearest node';
    }
    detail +=
      '; the record carries no write record, so the ordering is the named absence ' +
      NO_WRITE_RECORD_NO_ORDER +
      ' and this answer names no write, no owner and no cause';
    if (changeDetection !== null) {
      detail +=
        '; a recorded change-detection message is a finding of its own, rendered after the effect and never joined to it';
    }
    return detail;
  }

  // The sentence a `no-render-entry` answer states, naming the entry and not the graph's effects.
  function noRenderEntryDetail(records, graph) {
    const entry = isObject(records) ? records.effect : null;
    const supplied = isObject(entry)
      ? 'the entry supplied names neither a label nor a recorded edge with an index consumer'
      : 'no render/effect entry was supplied';
    return (
      'the graph record ' +
      graph.path +
      ':' +
      graph.line +
      ' is readable, but the record carries no render/effect entry this module can read: ' +
      supplied +
      ', so no effect node is named and no read is claimed \u2014 a page whose record carries no entry, which is not a graph with no effects'
    );
  }

  // The sentence a `no-effect-node` answer states: the absence names the effect node the graph
  // lacks, and the reference the entry named if it named one.
  function noEffectNodeDetail(graph, effects, entry) {
    const where = graph.path + ':' + graph.line;
    if (effects.length === 0) {
      return (
        'the graph record ' +
        where +
        ' is readable and holds no node of kind ' +
        EFFECT_KIND +
        ': the absence names the effect node the graph lacks, and no effect, no label and no read is rendered beside it'
      );
    }
    return (
      'the graph record ' +
      where +
      ' is readable and holds ' +
      countOf(effects.length, 'node', 'nodes') +
      ' of kind ' +
      EFFECT_KIND +
      ', and none of them is the one the entry names by ' +
      (entry.namedBy === NAMED_BY_LABEL
        ? 'label ' + quote(entry.value)
        : 'consumer index ' + entry.value) +
      ': the reference is named unplaced rather than resolved to the nearest effect node'
    );
  }

  // The join. `records` is the two records and nothing else — the graph record and the render/effect
  // entry — so a caller cannot smuggle a page value, a clock or a cause into the answer through this
  // function. Anything else on `records` is ignored.
  function tutorSignals(records) {
    const read = isObject(records) ? records : {};
    const asked = typeof read.question === 'string' ? read.question : '';

    // 1. The graph record. No graph to read is an absence that names the graph and never the page's
    // effects (SC3, E3).
    const graph = graphRecordOf(read);
    if (graph.problem !== null) {
      return answerOf(
        GRAPH_UNREADABLE,
        asked,
        null,
        [],
        [],
        claimsOf(graph, null, [], [], null),
        graph.problem,
      );
    }

    // 2. The render/effect entry. A record that carries none is its own absence (SC3, E4).
    const entry = entryOf(read);
    if (entry === null) {
      return answerOf(
        NO_RENDER_ENTRY,
        asked,
        null,
        [],
        [],
        claimsOf(graph, null, [], [], null),
        noRenderEntryDetail(read, graph),
      );
    }

    // 3. The effect node the entry names, and the references no node can place (SC4, E5).
    const effects = effectNodesIn(graph.nodes);
    const subject = subjectOf(effects, entry);
    if (subject.node === null) {
      return answerOf(
        NO_EFFECT_NODE,
        asked,
        null,
        [],
        subject.unplaced,
        claimsOf(graph, null, [], subject.unplaced, null),
        noEffectNodeDetail(graph, effects, entry),
      );
    }

    // 4. The effect, its reads, and what the record could not place. An effect whose node carries no
    // index keeps its answer and reports that absence, rather than an index nothing in the record
    // states (PLAN C8).
    const effect = effectOf(subject.node, entry.namedBy);
    const unplaced = subject.unplaced.slice();
    if (effect.index === null) {
      unplaced.push(unplacedOf(END_EFFECT, entry.value));
    } else if (
      entry.namedBy === NAMED_BY_RECORDED_EDGE &&
      entry.edge !== null &&
      entry.edge.producer !== undefined &&
      !edgeRecorded(graph.edges, entry.edge.consumer, entry.edge.producer)
    ) {
      // The caller named the whole edge, not one of its ends: a producer end the graph does not
      // record is a reference the record cannot place, and it is never read from a node the graph
      // merely happens to hold.
      unplaced.push(unplacedOf(END_PRODUCER, entry.edge.producer));
    }
    const reads = readsOf(graph.nodes, graph.edges, effect.index, unplaced);
    const changeDetection = changeDetectionOf(read);

    return answerOf(
      ANSWERED,
      asked,
      effect,
      reads,
      unplaced,
      claimsOf(graph, effect, reads, unplaced, changeDetection),
      answeredDetail(graph, effect, reads, unplaced, changeDetection),
    );
  }

  const namespace = {
    tutorSignals: tutorSignals,
    STATES: STATES,
    ABSENCES: ABSENCES,
    READS: READS,
    IGNORED: IGNORED,
  };

  if (globalThis.angularAiTutorSignals) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiTutorSignals, namespace);
  } else {
    globalThis.angularAiTutorSignals = namespace;
  }
})();
