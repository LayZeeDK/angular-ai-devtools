# Evidence — domain

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: domain
Questions assigned: Which reactive anti-patterns are detectable from the signal graph alone and how to classify them.; How to map signal graph nodes to components for the provenance chain (reuse N1's mapping or new).

## Finding: Angular signal graph node kinds are a fixed enum

- **Claim**: `ng.ɵgetSignalGraph` returns nodes whose `kind` is one of `signal`, `computed`, `effect`, `template`, `linkedSignal`, `afterRenderEffectPhase`, `childSignalProp`, or `unknown`; each node carries `id`, `epoch`, optional `label`, optional `value`, and optional `debuggableFn`.
- **Source**: `node_modules/@angular/core/types/_formatter-chunk.d.ts` (local, Angular ~22.1) line `type ReactiveNodeKind = 'signal' | 'computed' | 'effect' | 'template' | 'linkedSignal' | 'afterRenderEffectPhase' | 'childSignalProp' | 'unknown'`; `node_modules/@angular/core/types/core.d.ts` `DebugSignalGraphNode`.
- **Confidence**: high
- **Why it matters here**: defines the complete vocabulary of node kinds the anti-pattern detector and provenance tracer can branch on (INTENT SC1, SC3); no other kinds exist in this Angular version.

## Finding: Edges encode producer/consumer direction only

- **Claim**: `DebugSignalGraphEdge` has `consumer` and `producer` indices into the `nodes` array; an edge means the consumer node reads the producer node. There are no write, cleanup, or untracked-read metadata fields.
- **Source**: `node_modules/@angular/core/types/core.d.ts` `DebugSignalGraphEdge` (local, Angular ~22.1).
- **Confidence**: high
- **Why it matters here**: every anti-pattern rule must be expressible purely in terms of node kinds plus the consumer→producer edge relation (and epochs); anything needing write/untracked/cleanup data is out of scope for graph-only detection.

## Finding: Component mapping is already solved by N1 and reusable as-is

- **Claim**: A component's signal graph is obtained by `instance -> host element -> NodeInjector -> ng.ɵgetSignalGraph(injector)`; the component node inside that graph is the `template` node whose `debuggableFn === instance.constructor`. No new mapping is needed for N2.
- **Source**: `.project/archive/004-nx-angular-workspace/research/evidence-domain.md` finding "Component to signal-graph node mapping"; `node_modules/@angular/core/types/core.d.ts` `DebugSignalGraphNode.debuggableFn`.
- **Confidence**: high
- **Why it matters here**: answers INTENT open question 2 directly — reuse N1's mapping (INTENT N3 also forbids `getViewContainerRef`/`angular:di_graph`, which this path avoids).

## Finding: Angular's own Signal Graph tool flags infinite loops and failed updates

- **Claim**: Angular's third-party developer tool "Signal Graph" exposes state-to-view dependencies and is described as helping identify dependencies that cause infinite loops or failed updates.
- **Source**: Chrome for Developers blog "Unlock runtime insights: Introducing third-party developer tools for Chrome DevTools for agents" (2026-06-18), https://developer.chrome.com/blog/devtools-for-agents-3p-tools; mirrored daily.dev summary.
- **Confidence**: high
- **Why it matters here**: validates that "infinite loop" (graph cycle) and "failed update" (stale consumer) are the two anti-pattern classes Angular itself targets from the signal graph, so N2 should at minimum ship those two plus a third structural rule.

## Finding: Detectable anti-pattern — circular dependency (infinite-loop risk)

- **Claim**: A directed cycle in the consumer→producer edge relation (a node reachable from itself) is detectable from the graph alone and indicates a potential infinite update loop.
- **Source**: Chrome blog above (infinite loops); graph edge semantics from `core.d.ts` `DebugSignalGraphEdge`.
- **Confidence**: high
- **Why it matters here**: this is the highest-value, fully-graph-detectable rule; classification: severity high, evidence = the cycle's node labels and indices.

## Finding: Detectable anti-pattern — effect with no tracked producers

- **Claim**: An `effect` (or `afterRenderEffectPhase`) node with out-degree 0 (no outgoing consumer→producer edges) runs once and never re-runs; detectable from the graph alone.
- **Source**: Angular effect guide — effects track only signals read in the most recent execution (https://angular.dev/guide/signals/effect); node kinds from `_formatter-chunk.d.ts`.
- **Confidence**: medium
- **Why it matters here**: flags "effect that does not actually react to anything" / possibly missing tracked reads; classification: severity medium, evidence = node label + index. Must be reported as a candidate, not a definite bug, because a one-shot effect can be intentional.

## Finding: Detectable anti-pattern — unused reactive node (dead state)

- **Claim**: A `signal`, `computed`, or `linkedSignal` node with in-degree 0 (no consumer edges) and not the selected component's `template` node is unused reactive state; detectable from the graph alone.
- **Source**: graph edge semantics `DebugSignalGraphEdge`; Angular DevTools signal graph docs (https://angular.dev/tools/devtools/signals) describe producer/consumer edges.
- **Confidence**: medium
- **Why it matters here**: surfaces dead state and wasted reactivity; classification: severity low/medium, evidence = node label + index.

## Finding: Detectable anti-pattern — stale consumer / failed update (epoch diff)

- **Claim**: When a producer's `epoch` changes between two recorded graph snapshots but a downstream consumer's `epoch` does not change, the consumer failed to propagate the update; detectable by combining graph structure with the epoch-diff logic already in `agent-main.js` (`diffEpochs`).
- **Source**: `extension/agent-main.js` `diffEpochs`/`serializeGraph` (local); Chrome blog (failed updates).
- **Confidence**: medium
- **Why it matters here**: matches Angular's own "failed updates" class; classification: severity high, evidence = producer and consumer labels plus indices. Requires recorded graph data (runtime), not a single static graph.

## Finding: Not detectable from the graph alone

- **Claim**: Untracked signal reads in effects, write-after-read in the same effect, side effects inside `computed`, and missing effect cleanup cannot be detected from node kinds/edges/labels alone — they require source code or runtime instrumentation (untracked reads produce no edge but are indistinguishable from "never read"; computed purity and writes/cleanup are not represented in `DebugSignalGraphNode`).
- **Source**: `DebugSignalGraphNode`/`DebugSignalGraphEdge` fields (local); Angular effect guide (untracked, `allowSignalWrites`, cleanup) https://angular.dev/guide/signals/effect; Preact signals docs on computed purity https://dartsignals.dev/packages/preact_signals/core/computed/.
- **Confidence**: high
- **Why it matters here**: prevents over-promising in SC3; these anti-patterns should be surfaced to the Prompt API as "not detectable deterministically" or deferred, while the three structural rules above satisfy the "at least three" bar.

## Finding: Angular guidance on effect anti-patterns

- **Claim**: Angular's official guidance says effects should not propagate state (use `computed`/`linkedSignal` instead), warns against reading a signal and writing it in the same effect (infinite loop), and against using effects to sync derived state.
- **Source**: https://angular.dev/guide/signals/effect ("When not to use effects", "Use cases for effects"); https://angular.dev/guide/signals.
- **Confidence**: high
- **Why it matters here**: supplies the authoritative anti-pattern names the Prompt API explanation layer should use, even where detection is source-level rather than graph-level.

## Assigned questions — answers

- Which reactive anti-patterns are detectable from the signal graph alone and how to classify them. → Four graph-detectable classes: (1) circular dependency in consumer→producer edges → "infinite-loop risk", high; (2) `effect`/`afterRenderEffectPhase` node with zero tracked producers → "effect with no tracked dependencies", medium; (3) `signal`/`computed`/`linkedSignal` node with zero consumers → "unused reactive node", low/medium; (4) producer epoch changed but consumer epoch did not → "stale consumer / failed update", high (needs recorded snapshots). Source-level patterns (untracked reads, write-after-read, computed side effects, missing cleanup) are not graph-detectable. Classification by node kinds + edge relation (+ epochs for #4).
- How to map signal graph nodes to components for the provenance chain (reuse N1's mapping or new). → Reuse N1's mapping unchanged: instance → host element → NodeInjector → `ng.ɵgetSignalGraph(injector)`; the owning component is the `template` node whose `debuggableFn === instance.constructor`. No new mapping or `getViewContainerRef`/`angular:di_graph` usage. Source: archived M004 evidence-domain + `DebugSignalGraphNode.debuggableFn`.

## Dead ends

- Detecting untracked reads / computed side effects / missing cleanup purely from node kinds and edges — not possible; `DebugSignalGraphNode` carries no purity, write, or cleanup metadata. These require source or runtime instrumentation.
- Locating Angular's `signal_graph` third-party tool implementation in `node_modules/@angular` (22.1) — absent; the tool is registered at runtime by newer Angular dev-mode core, so its internals cannot be reused directly from this workspace.
- Looking for a separate "resource" node kind — none exists; resources are grouped clusters in DevTools but `ReactiveNodeKind` has no `resource` value (use `signal`/`unknown` nodes).