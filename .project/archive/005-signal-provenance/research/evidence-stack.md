# Evidence — stack

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: stack
Questions assigned: How to map signal graph nodes to components for the provenance chain (reuse N1's mapping or new).

## Finding: N1's per-component capture can be inverted for node→component attribution

- **Claim**: N1 already maps a component to its signal graph via `ng.getHostElement(instance)` → `ng.getInjector(host)`/`ng.ɵgetInjectorFromNode` → `ng.ɵgetSignalGraph(injector)` (`extension/agent-main.js:231-243`). The graph's `template` node carries `debuggableFn` = the component class constructor (`_debug_node-chunk.mjs:12267-12273`), which is exactly how `templateNode()` in `update-cause-chain.ts:60-64` joins a graph to a component. For N2, capture each component's graph the same way and invert: build a map from node `id` to the owning component, seeding each component's template node with its constructor name and attributing all other nodes in that graph to that component when first seen. No new Angular API and no `angular:di_graph`/`getViewContainerRef()` (forbidden by INTENT N3).
- **Source**: `extension/agent-main.js:200-243`; `apps/angular-ai-devtools/src/app/update-cause-chain.ts:60-64`; `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12225-12338` (installed 22.1.8).
- **Confidence**: high
- **Why it matters here**: reusing N1's mapping keeps the migration cost low and avoids the di_graph mutation trap; the inversion is the only new piece needed for provenance.

## Finding: Node ids are globally unique, enabling cross-graph correlation

- **Claim**: Angular assigns each reactive node a stable string `id` through a module-level `WeakMap` (`signalDebugMap`) with a global counter (`_debug_node-chunk.mjs:12244-12248`); the same reactive node object therefore keeps the same id across every `getSignalGraph` call. Edges, by contrast, are indices into that single graph's `nodes` array (`consumer`/`producer` are positions, not ids) (`_debug_node-chunk.mjs:12283-12288`). So cross-component provenance must key on node `id` for identity but resolve edges against each graph's local node array.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12236-12294` (installed 22.1.8).
- **Confidence**: high
- **Why it matters here**: provenance chains can stitch a signal node that appears in several component graphs (shared signals) without ambiguity, but the tracer must not treat edge consumer/producer numbers as node ids.

## Finding: getSignalGraph is scoped to one injector (component), not the whole app

- **Claim**: `getSignalGraph(injector)` seeds traversal from the component's template consumer (via `getTemplateConsumer(injector)`) plus effects registered on that injector (`extractEffectsFromInjector`), then walks producer links (`extractSignalNodesAndEdgesFromRoots`); it does not descend into child injectors. Thus one call yields one component's subgraph; full-app provenance requires calling it per component and joining on the global node id.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12326-12338` (installed 22.1.8).
- **Confidence**: high
- **Why it matters here**: confirms N2 must enumerate components and aggregate per-component graphs; a single root-injector call would miss most of the app.

## Finding: ReactiveNodeKind enumerates all node kinds N2 must render

- **Claim**: `ReactiveNodeKind` (in `@angular/core/primitives/signals`, surfaced via `_formatter-chunk.d.ts:48`) is the union `'signal' | 'computed' | 'effect' | 'template' | 'linkedSignal' | 'afterRenderEffectPhase' | 'childSignalProp' | 'unknown'`. `DebugSignalGraphNode` adds `id`, `epoch`, optional `label`, `value`, and `debuggableFn` (`core.d.ts:4632-4639`). The official DevTools signal pane documents the same kinds (Signal, Computed, Effect, Linked signal, Template, plus Resource clusters) (`angular.dev/tools/devtools/signals`).
- **Source**: `node_modules/@angular/core/types/_formatter-chunk.d.ts:48`; `node_modules/@angular/core/types/core.d.ts:4632-4639`; https://angular.dev/tools/devtools/signals
- **Confidence**: high
- **Why it matters here**: N2's chain display and anti-pattern detector can branch on these kinds directly; no undocumented values need handling beyond `unknown`.

## Finding: Component enumeration is available via ng global utils without di_graph

- **Claim**: `window.ng` (dev mode) exposes `getRootComponents(element)`, `getOwningComponent(elementOrDir)`, `getComponent(element)`, `getHostElement(instance)`, and `getInjector`/`ɵgetInjectorFromNode` (`_debug_node-chunk.mjs:1872-1911`). These can enumerate component instances and their hosts/injectors without `angular:di_graph` or `getViewContainerRef()`, satisfying INTENT N3.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:1872-1911` (installed 22.1.8); `extension/agent-main.js:58-73` (feature detection).
- **Confidence**: high
- **Why it matters here**: provides the enumeration step N2 needs to drive per-component `getSignalGraph` calls while respecting the prohibition.

## Finding: Serialization currently drops id-level edge resolution

- **Claim**: `agent-main.js` `serializeGraph` copies `consumer`/`producer` as raw numbers (`extension/agent-main.js:258-263`), i.e. indices into that graph's node array, not node ids. For provenance/anti-pattern reporting that needs stable cross-graph references, the tracer should resolve each edge to the corresponding node's `id` (or store both index and id) at serialization time.
- **Source**: `extension/agent-main.js:245-264`; `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12283-12288`.
- **Confidence**: high
- **Why it matters here**: required for the panel to report edges by node label/id and for unit tests on recorded graph data to assert provenance deterministically.

## Assigned questions — answers

- How to map signal graph nodes to components for the provenance chain (reuse N1's mapping or new). → Reuse N1's per-component capture (`host element → injector → getSignalGraph`) and invert it into a node-id → component map, seeding component identity from each graph's `template` node (`debuggableFn` = component constructor). Node ids are globally unique across graphs, so shared signals can be correlated without a new API; no `di_graph`/`getViewContainerRef()`. Component enumeration uses `ng.getRootComponents`/`getOwningComponent`/`getComponent`. Edges need id resolution at serialization (currently indices).

## Dead ends

- Using `angular:di_graph` or `getViewContainerRef()` on hosts — mutates/removes the `template` node (forbidden by INTENT N3; docs/filing-ledger item 1).
- Treating edge `consumer`/`producer` as node ids — they are array indices; would misattribute provenance.
- Single root-injector `getSignalGraph` call — returns only that injector's subgraph, missing nested components.
- Relying on a node carrying a component reference — only the `template` node has `debuggableFn`; other nodes must be attributed via their containing graph.