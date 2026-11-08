// render-phase.js — the join behind M039: one effect, the signals the graph's edges say it reads,
// and the phase reported as the named absence the page leaves where a phase would go.
//
// T001 measured, at this head, the three things this module is built on
// (`research/raw/m039-render-phase.json`):
//
//   - the page records no effect event. Angular's `ProfilerEvent` enum declares 26 values, identical
//     in the panel's 22.1.8 and the fixture's 22.2.2, and no value name contains `effect`; the
//     effect-shaped name in both packages, `afterRenderEffectPhase`, is a `ReactiveNodeKind` and not a
//     profiler event. A node kind says nothing about when an effect ran, so no read of any page can
//     place an effect in a phase. That is why the phase below is one answer, published as a named
//     constant, and not a comparison whose other branch might be reached later (SC2).
//   - the effect is carried by the signal graph as a node of kind `effect`. Its label may be empty:
//     the fixture's counter effect is node 5, id "6", label "", epoch 1, reading `signal:count`
//     through its one edge. Or the graph may name it: the portal carries one labelled effect,
//     `Resource.loadEffect`, whose producer is the `linkedSignal` labelled `Resource.extRequest`.
//   - an edge is `{ consumer, producer }` (`DebugSignalGraphEdge`, two members): a direction of
//     dependency and nothing else — no field, no value, no moment. A write is therefore not
//     representable as an edge, so nothing here names a write, an owner or a cause (N1). The signals
//     an effect reads are the producer ends of its consumer edges, and that is all the graph says.
//
// This module is a reader of what it is given and of nothing else: no DOM (no `document`, no
// `window`, no `getComputedStyle`), no clock, no console, no network, no imports and no page global
// beyond the one namespace below. A bare `node:vm` context with nothing in it is enough to run it,
// which is what the suite proves. It is a pure join, so it cannot reach a page even if it wanted to:
// the capture belongs to a caller, and this module only says what the captured fact supports.
//
// Input shapes, read as they are recorded:
//
//   fact    what the caller read: `{ graph, effect, error }`
//             graph   `{ nodes: [{ index, kind, label, epoch }, …], edges: [{ consumer, producer },
//                     …] }`, the shape the recordings carry. Only `index`, `kind` and `label` of a
//                     node, and the two ends of an edge, are read; every other field (`id`, `epoch`,
//                     `value`, `debuggableFn`, a cause a later capture might add) is ignored, so a
//                     fact carrying one changes nothing this module reports.
//             effect  the subject, named by the caller and never picked: two effect nodes in one
//                     graph are two subjects, and "the first one" would be a guess. `{ label }` names
//                     a labelled effect; `{ edge }` names one by the edge the graph records for it, as
//                     `{ consumer }` (an effect whose edges name no producer still has its consumer
//                     end recorded by the caller) or `{ consumer, producer }` (the whole recorded
//                     edge, which must be an edge the graph holds).
//             error   an optional recorded change-detection message: `{ code, message, provenance }`.
//
// The answer is one object with exactly the two fields the contract names (T002 and T003 share the
// line `renderPhase(fact) -> { findings, phase }`):
//
//   { findings, phase }
//
// `findings` holds the effect finding and, where the fact carries a recorded message, the
// change-detection finding — in that order and never merged (SC3, E5):
//
//   { state: "effect",            effect, namedBy, reads }
//   { state: "change-detection",  code, message, provenance }
//   { state: "cannot-tell",       reason }
//
// An effect finding names the effect by the label the graph gives it, and by nothing when the graph
// gives none: an unlabelled effect reports `effect: null` and says how the caller reached it in
// `namedBy` (`label` or `recorded-edge`). No identity is minted from an index, a position, a call
// site or a source string (E2, N1). `reads` is the list of signals the effect's consumer edges name,
// in the order the edges appear; an effect whose edges name no producer keeps its finding and
// reports an empty read rather than borrowing a signal (E3).
//
// A change-detection finding carries exactly the three values the fact carried and nothing else: not
// an effect, not an owner, not a cause. A message that names no effect produces a finding that names
// no effect (E6), and it is never joined to the effect beside it (E5, N4).
//
// `phase` sits outside every finding on purpose and is always the same answer (SC2, E4):
//
//   { state: "cannot-tell", absence: "no-effect-event" }
//
// No finding has a field a phase could be smuggled into, and no branch of this file can produce one:
// the page records no effect event, so there is nothing to compare and nothing to infer.
//
// Where the graph cannot support an effect finding, the answer is one `cannot-tell` finding with
// exactly one published reason and no field a finding would carry:
//
//   graph-unreadable     the fact names no graph, or names one that is not an object with node and
//                        edge lists. Distinct from an empty graph on purpose: an unread graph is not
//                        an empty one (SC4, N5).
//   no-effect-node       the graph is readable and holds no node of kind `effect`. The absence names
//                        the node the graph lacks; "no effects" is not a claim this module makes.
//   effect-unreadable    the named subject is not a subject the graph holds: no such label, no such
//                        edge, or a subject the graph holds more than once.
//
// Determinism is structural: no clock, no ordering over a set, no locale-dependent sort, so the same
// graph read twice yields byte-identical text, including the order of `reads` and of `findings` (E8).
(function () {
  'use strict';

  // The two states of answer, and the one absence state every refusal is published as.
  const EFFECT = 'effect';
  const CHANGE_DETECTION = 'change-detection';
  const CANNOT_TELL = 'cannot-tell';

  // How an effect finding says its subject was identified. `label` means the graph supplied a name;
  // `recorded-edge` means it supplied none and the edge the graph records is what the caller named.
  const NAMED_BY_LABEL = 'label';
  const NAMED_BY_RECORDED_EDGE = 'recorded-edge';

  // The three absences the graph can force. A caller compares a constant instead of prose.
  const GRAPH_UNREADABLE = 'graph-unreadable';
  const NO_EFFECT_NODE = 'no-effect-node';
  const EFFECT_UNREADABLE = 'effect-unreadable';

  // The one absence the page cannot answer, published as a name rather than as a sentence: Angular's
  // profiler declares 26 events and none is an effect event (T001), so no phase is observable.
  const NO_EFFECT_EVENT = 'no-effect-event';

  // The node kind that says "effect". T001 measured it on the fixture and on the portal; a label is
  // never consulted to decide what kind of node one is.
  const EFFECT_KIND = 'effect';

  // The finding shapes this module publishes. The three share one field, `state`, and nothing else, so the
  // list that carries them carries the union: a list inferred from the first shape pushed into it would
  // refuse the second, and the refusal would be about the list's declared element type, not the findings.
  /**
   * @typedef {object} EffectFinding
   * @property {string} state
   * @property {string | null} effect
   * @property {string} namedBy
   * @property {string[]} reads
   *
   * @typedef {object} ChangeDetectionFinding
   * @property {string} state
   * @property {string | null} code
   * @property {string | null} message
   * @property {string | null} provenance
   *
   * @typedef {object} CannotTellFinding
   * @property {string} state
   * @property {string} reason
   *
   * @typedef {EffectFinding | ChangeDetectionFinding | CannotTellFinding} Finding
   */

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A graph index: the numbers the recordings carry as `index`, `consumer` and `producer`.
  function isIndex(value) {
    return typeof value === 'number' && Number.isFinite(value);
  }

  // A string that says something, or null. Labels are compared trimmed; a blank label names nothing.
  function nonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // The text the fact carried for a field, or null when it carried none. The module copies what it
  // was handed and fills nothing in.
  function textOf(value) {
    return typeof value === 'string' ? value : null;
  }

  function indexOfNode(node) {
    return isObject(node) && isIndex(node.index) ? node.index : null;
  }

  function kindOf(node) {
    return isObject(node) ? node.kind : null;
  }

  function labelOf(node) {
    return nonEmptyString(isObject(node) ? node.label : null);
  }

  // The graph the fact names, or null when it names none this module can read. A fact that names
  // nothing, a graph that is not an object, and an object missing either list are all the same
  // absence — and all of them are distinct from a graph with no nodes (SC4).
  function graphOf(fact) {
    if (!isObject(fact)) return null;
    const graph = fact.graph;
    if (!isObject(graph)) return null;
    if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return null;
    return graph;
  }

  // Every node whose kind says "effect" — never a node whose label merely looks like one (E1).
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
    for (let i = 0; i < nodes.length; i += 1) {
      if (indexOfNode(nodes[i]) === index) return nodes[i];
    }
    return null;
  }

  // The effect the caller named, or null when the graph does not hold exactly one such subject. A
  // label must be carried by exactly one effect node; an edge subject's consumer end must be exactly
  // one effect node, and a producer end the caller also names must be an edge the graph records.
  // Nothing here reads a position in an array: an index is only ever compared with an index the
  // graph or the caller recorded.
  function effectSubject(effectNodes, edges, effect) {
    if (!isObject(effect)) return null;

    const label = nonEmptyString(effect.label);
    if (label !== null) {
      const named = [];
      for (let i = 0; i < effectNodes.length; i += 1) {
        if (labelOf(effectNodes[i]) === label) named.push(effectNodes[i]);
      }
      if (named.length !== 1) return null;
      return { namedBy: NAMED_BY_LABEL, node: named[0] };
    }

    const edge = effect.edge;
    if (!isObject(edge) || !isIndex(edge.consumer)) return null;
    const named = [];
    for (let i = 0; i < effectNodes.length; i += 1) {
      if (indexOfNode(effectNodes[i]) === edge.consumer)
        named.push(effectNodes[i]);
    }
    if (named.length !== 1) return null;

    // The caller named the whole edge rather than one of its ends: then the graph must record that
    // edge, exactly once, or the subject is not one the graph holds.
    if (edge.producer !== undefined) {
      let recorded = 0;
      for (let i = 0; i < edges.length; i += 1) {
        const candidate = edges[i];
        if (!isObject(candidate)) continue;
        if (candidate.consumer !== edge.consumer) continue;
        if (candidate.producer !== edge.producer) continue;
        recorded += 1;
      }
      if (recorded !== 1) return null;
    }

    return { namedBy: NAMED_BY_RECORDED_EDGE, node: named[0] };
  }

  // The signals the effect's consumer edges name, in the order the edges appear. A producer the graph
  // does not hold, and a producer whose label is empty, name nothing and are therefore not reported:
  // the edge names no signal there, and a blank string is not a name. No fallback, no borrowing and
  // no sort — the recorded order is the only order this module has (E3, E8).
  function readsOf(nodes, edges, consumer) {
    const reads = [];
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      if (!isObject(edge)) continue;
      if (edge.consumer !== consumer) continue;
      const producer = nodeAtIndex(nodes, edge.producer);
      if (producer === null) continue;
      const label = labelOf(producer);
      if (label === null) continue;
      reads.push(label);
    }
    return reads;
  }

  // One effect finding, built in one place so a pin on its shape is a pin on every effect finding.
  // Its four fields are the whole vocabulary this finding has: no phase, no write, no owner, no
  // cause, and no code — the change-detection message is a finding of its own (E4, E5, N6).
  function effectFinding(name, namedBy, reads) {
    return {
      state: EFFECT,
      effect: name,
      namedBy: namedBy,
      reads: reads,
    };
  }

  // One change-detection finding: the three values the fact carried, copied and nothing else. It
  // names no effect and no cause, because the message it was built from named none (E6, N4).
  function changeDetectionFinding(error) {
    return {
      state: CHANGE_DETECTION,
      code: textOf(error.code),
      message: textOf(error.message),
      provenance: textOf(error.provenance),
    };
  }

  // One absence, with its reason and nothing else: no effect, no read, no namedBy, so a caller
  // cannot build a finding out of what was not read.
  function cannotTell(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  // The phase: one object, one state, one named absence, on every answer this module gives. It is
  // built here and nowhere else, so no branch can vary it and no finding can carry it (SC2).
  function phaseState() {
    return { state: CANNOT_TELL, absence: NO_EFFECT_EVENT };
  }

  // The answer: the findings the fact supported, and the phase it could not report. `phase` is never
  // a finding, on purpose — SC2 says no finding carries a phase, so there is no field to smuggle one
  // into.
  function answer(findings) {
    return { findings: findings, phase: phaseState() };
  }

  // The join. `fact` is what the caller read: the signal graph, the effect to report and, where the
  // page emitted one, the change-detection message. Anything else on the fact is ignored, so a caller
  // cannot smuggle a phase, a write, a cause or an owner into a finding through this function.
  function renderPhase(fact) {
    const read = isObject(fact) ? fact : {};

    // No graph to read: the absence names the graph, not the page's effects (SC4, N5).
    const graph = graphOf(read);
    if (graph === null) return answer([cannotTell(GRAPH_UNREADABLE)]);

    const nodes = graph.nodes;
    const edges = graph.edges;

    // A readable graph with no effect node: the absence names the node the graph lacks (E1).
    const effects = effectNodesIn(nodes);
    if (effects.length === 0) return answer([cannotTell(NO_EFFECT_NODE)]);

    // The subject the caller named, and only that one (E2).
    const subject = effectSubject(effects, edges, read.effect);
    if (subject === null) return answer([cannotTell(EFFECT_UNREADABLE)]);

    // The finding names the effect by the label the graph gives it, and by nothing otherwise. An
    // unlabelled effect keeps its finding and reports the reads its edges name, even where they name
    // none (E2, E3).
    const effect = effectFinding(
      labelOf(subject.node),
      subject.namedBy,
      readsOf(nodes, edges, indexOfNode(subject.node)),
    );
    /** @type {Finding[]} */
    const findings = [effect];

    // A recorded change-detection message is a finding of its own, after the effect and never joined
    // to it (E5).
    if (isObject(read.error)) findings.push(changeDetectionFinding(read.error));

    return answer(findings);
  }

  const namespace = {
    renderPhase: renderPhase,
    EFFECT: EFFECT,
    CHANGE_DETECTION: CHANGE_DETECTION,
    CANNOT_TELL: CANNOT_TELL,
    NAMED_BY_LABEL: NAMED_BY_LABEL,
    NAMED_BY_RECORDED_EDGE: NAMED_BY_RECORDED_EDGE,
    GRAPH_UNREADABLE: GRAPH_UNREADABLE,
    NO_EFFECT_NODE: NO_EFFECT_NODE,
    EFFECT_UNREADABLE: EFFECT_UNREADABLE,
    NO_EFFECT_EVENT: NO_EFFECT_EVENT,
  };

  if (globalThis.angularAiRenderPhase) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiRenderPhase, namespace);
  } else {
    globalThis.angularAiRenderPhase = namespace;
  }
})();
