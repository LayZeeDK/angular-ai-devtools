// linked-state.js — the join behind M038: one linked signal, the source it follows, and whether the
// two stored values currently agree.
//
// T001 measured, on the fixture's development build, the three things this module is built to
// (`research/raw/m038-linked-state.json`):
//
//   - a linked signal is identified by its node kind, `kind === 'linkedSignal'`, and never by its
//     label: the compiler rewrites each `linkedSignal(...)` initializer to pass the field name as
//     the `debugName` option, the public wrapper copies that option onto the node, and the graph
//     reads `label: consumer.debugName` (`_debug_node-chunk.mjs:12521`). A plain `computed(...)` is
//     labelled with its own field name the same way, so a label says nothing about the kind;
//   - the label a linked signal carries is the field name: `agreeing` and `differing`;
//   - the source a linked signal follows is reachable from the graph as a producer of kind
//     `signal`: node 2, label `source`, value 7, recorded as a producer of both linked signals.
//
// What the fixture holds: the agreeing signal holds 7 and its source holds 7; the differing signal
// was written once to 8 and no longer equals its source. The graph records values, not history:
// nothing here can say which write or recomputation produced either value, and the module never
// tries. It compares the two values it was handed and states what that comparison shows.
//
// This module is a reader of the graph it is given and of nothing else: it has no DOM (no
// `document`, no `window`, no `getComputedStyle`), no clock, no console, no network, no imports and
// no page global beyond the one namespace below. A bare `node:vm` context with nothing in it is
// enough to run it, which is what the suite proves.
//
// Input shapes, read as they are recorded:
//
//   fact    what the caller read: `{ graph, signal }`
//             graph   the signal graph as the page exposes it, recorded: `{ nodes: [{ index, kind,
//                     label, value }, …], edges: [{ consumer, producer }, …] }`. The recording's
//                     `graph` object is exactly this shape, so `{ graph: <recording>.graph }` is
//                     accepted, and so is the graph object itself in that slot. Only `index`,
//                     `kind`, `label` and `value` of a node, and the two ends of an edge, are
//                     read; every other field (`id`, `epoch`, `fn`, a cause a later capture might
//                     add) is ignored, so a fact carrying one changes nothing this module reports
//                     (E7).
//             signal  the label the graph gives the linked signal to report — the field name, as
//                     T001 measured it (`agreeing`, `differing`). The caller names the subject;
//                     the module never picks one, because two linked signals in one graph are two
//                     subjects and "the first one" would be a guess.
//
// The answer is one object with exactly the six fields the contract names (T002 and T003 share the
// line `linkedState(fact) -> { state, signal?, source?, value?, sourceValue?, reason? }`):
//
//   { state: "finding",     signal, source, value, sourceValue, reason: "matching" | "differing" }
//   { state: "cannot-tell", reason }
//
// A finding names the linked signal and the source it follows by the labels the graph gives them,
// carries both stored values exactly as the graph reports them, and states which agreement those
// values show. The contract fixes `state` to `finding` or `cannot-tell`, so for a finding the
// agreement itself is carried in `reason`: `matching` when the two values are strictly equal and
// `differing` when they are not. That word is a statement about the two values the graph holds now
// — not an origin, not a verdict about correctness and not a cause (N1, N2, N4). Equality is not
// provenance: nothing here says the differing value was written, recomputed or reset, and nothing
// says the matching pair was not.
//
// A "cannot tell" names the absence it found and nothing else — no signal, no source, no value:
//
//   no-linked-signal     the graph holds no node of kind `linkedSignal` at all (E1).
//   signal-unreadable    the fact names no linked signal the graph holds, names none at all, or
//                        names one the graph holds more than once. A label is the only identifier
//                        read; a kind, a value or an index is never used to guess a subject.
//   value-unreadable     the named linked signal's own value is not a scalar the recording could
//                        carry. `null` is the capture's own marker for "no readable value"
//                        (`scripts/linked-state-capture.test.mjs`'s `scalar()`), so it is treated
//                        as an absence here rather than as a value.
//   source-unreadable    the named linked signal has no single readable source: no producer edge,
//                        a producer the graph does not hold, no producer of kind `signal`, more
//                        than one such producer, a source whose label cannot be named, or a source
//                        whose value is not a scalar (E2).
//
// Nothing here names a write, an owner or a cause, because the graph carries none (E4): a node has
// a kind, a label and a value, and an edge has two ends.
(function () {
  'use strict';

  const FINDING = 'finding';
  const CANNOT_TELL = 'cannot-tell';

  // The two agreements a finding can state, and the reason for each. They are the words the surface
  // is written for, so the join and the pane never drift apart.
  const MATCHING = 'matching';
  const DIFFERING = 'differing';

  // The absences this module can name. A caller compares a constant instead of prose.
  const NO_LINKED_SIGNAL = 'no-linked-signal';
  const SIGNAL_UNREADABLE = 'signal-unreadable';
  const VALUE_UNREADABLE = 'value-unreadable';
  const SOURCE_UNREADABLE = 'source-unreadable';

  // The two node kinds T001 measured: the kind that says "linked signal" and the kind that says
  // "the source it follows". The label is never consulted for either.
  const LINKED_SIGNAL_KIND = 'linkedSignal';
  const SIGNAL_KIND = 'signal';

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  // A string that says something, or null. Labels are compared trimmed; a blank label names nothing.
  function nonEmptyString(value) {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  // The scalar the graph reports for a node, or null when it reports none. The capture records a
  // node's value with `scalar()`, which keeps null, string, number and boolean and answers null for
  // anything else, so null is the recording's own marker for an unread value.
  function scalarOf(value) {
    if (
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      return value;
    }
    return null;
  }

  // The graph the caller handed over: the recording's `graph` object, or the graph itself in that
  // slot. Anything else is an empty graph, so a fact with no graph at all is the empty read (E1).
  function graphOf(fact) {
    if (!isObject(fact)) return {};
    if (isObject(fact.graph)) return fact.graph;
    return fact;
  }

  function nodesOf(graph) {
    return Array.isArray(graph.nodes) ? graph.nodes : [];
  }

  function edgesOf(graph) {
    return Array.isArray(graph.edges) ? graph.edges : [];
  }

  function kindOf(node) {
    return isObject(node) ? node.kind : null;
  }

  function labelOf(node) {
    return nonEmptyString(isObject(node) ? node.label : null);
  }

  function indexOf(node) {
    return isObject(node) ? node.index : null;
  }

  // Every node whose kind says "linked signal" — never a node whose label merely looks like one.
  function linkedSignalsIn(nodes) {
    const found = [];
    for (let i = 0; i < nodes.length; i += 1) {
      if (kindOf(nodes[i]) === LINKED_SIGNAL_KIND) found.push(nodes[i]);
    }
    return found;
  }

  // The node an edge names as a producer, or null when the graph holds no node with that index. A
  // producer the graph does not hold is an absence, not a value to be guessed.
  function nodeAtIndex(nodes, index) {
    for (let i = 0; i < nodes.length; i += 1) {
      if (indexOf(nodes[i]) === index) return nodes[i];
    }
    return null;
  }

  // The producers of one node, as the edges state them.
  function producersOf(nodes, edges, consumer) {
    const producers = [];
    for (let i = 0; i < edges.length; i += 1) {
      const edge = edges[i];
      if (!isObject(edge)) continue;
      if (edge.consumer !== consumer) continue;
      const producer = nodeAtIndex(nodes, edge.producer);
      if (producer !== null) producers.push(producer);
    }
    return producers;
  }

  // The one source the reported linked signal follows, or null. T001 measured the source as a
  // producer of kind `signal`; for the one signal being reported, that source is among its own
  // producers, which is where this module reads it. A graph that names none, names more than one,
  // or names one whose label or value cannot be read has not said which source the signal follows.
  function sourceOf(nodes, edges, signal) {
    const producers = producersOf(nodes, edges, indexOf(signal));
    const signals = [];
    for (let i = 0; i < producers.length; i += 1) {
      if (kindOf(producers[i]) === SIGNAL_KIND) signals.push(producers[i]);
    }
    if (signals.length !== 1) return null;
    const source = signals[0];
    const label = labelOf(source);
    const value = scalarOf(source.value);
    if (label === null || value === null) return null;
    return { label: label, value: value };
  }

  // One finding, built in one place so a pin on its shape is a pin on every finding. It carries
  // exactly the six fields the contract names, and no branch in this file can add a seventh: this
  // object literal is the whole vocabulary a finding has.
  function finding(label, source, value, agreement) {
    return {
      state: FINDING,
      signal: label,
      source: source.label,
      value: value,
      sourceValue: source.value,
      reason: agreement,
    };
  }

  // One absence, with its reason and nothing else: no signal, no source and no value, so a caller
  // cannot render a finding out of what was not read.
  function cannotTell(reason) {
    return { state: CANNOT_TELL, reason: reason };
  }

  // The join. `fact` is what the caller read: the recorded signal graph and the label of the linked
  // signal to report. Anything else on the fact is ignored, so a caller cannot smuggle a cause, an
  // owner or a written value into the finding through this function (E4, E7).
  function linkedState(fact) {
    const read = isObject(fact) ? fact : {};
    const graph = graphOf(read);
    const nodes = nodesOf(graph);
    const edges = edgesOf(graph);

    // No linked signal in the graph: the read found nothing to report (E1).
    const linked = linkedSignalsIn(nodes);
    if (linked.length === 0) return cannotTell(NO_LINKED_SIGNAL);

    // Which linked signal was meant: the caller's label, and exactly one node carrying it. A
    // missing label, a label no linked signal carries and a label two of them carry are all the
    // same absence — the join will not choose a subject.
    const subject = nonEmptyString(read.signal);
    if (subject === null) return cannotTell(SIGNAL_UNREADABLE);
    const matches = [];
    for (let i = 0; i < linked.length; i += 1) {
      if (labelOf(linked[i]) === subject) matches.push(linked[i]);
    }
    if (matches.length !== 1) return cannotTell(SIGNAL_UNREADABLE);

    // The signal's own stored value, or the absence of one.
    const signal = matches[0];
    const value = scalarOf(signal.value);
    if (value === null) return cannotTell(VALUE_UNREADABLE);

    // The source it follows, or the absence of one (E2).
    const source = sourceOf(nodes, edges, signal);
    if (source === null) return cannotTell(SOURCE_UNREADABLE);

    // The one comparison this module makes. It states the agreement the two stored values show and
    // nothing about where either came from (N1, N2).
    const agreement = value === source.value ? MATCHING : DIFFERING;

    return finding(labelOf(signal), source, value, agreement);
  }

  const namespace = {
    linkedState: linkedState,
    FINDING: FINDING,
    CANNOT_TELL: CANNOT_TELL,
    MATCHING: MATCHING,
    DIFFERING: DIFFERING,
    NO_LINKED_SIGNAL: NO_LINKED_SIGNAL,
    SIGNAL_UNREADABLE: SIGNAL_UNREADABLE,
    VALUE_UNREADABLE: VALUE_UNREADABLE,
    SOURCE_UNREADABLE: SOURCE_UNREADABLE,
  };

  if (globalThis.angularAiLinkedState) {
    // A second run in the same world republishes in place, so a caller's reference stays valid.
    Object.assign(globalThis.angularAiLinkedState, namespace);
  } else {
    globalThis.angularAiLinkedState = namespace;
  }
})();
