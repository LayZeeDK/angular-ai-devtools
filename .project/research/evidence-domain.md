# Evidence — domain

Dimension: domain
Questions assigned: Which N24 detections beyond the measured direct `this.field =` in subscribe case need new instrumentation?

## Finding: `ng.ɵgetSignalGraph` exposes `debuggableFn` only for computed and template nodes

- **Claim**: In Angular 22, `DebugSignalGraphNode.debuggableFn` is populated only for `computed` nodes (set to `consumer.computation`) and `template` nodes (set to `consumer.lView[CONTEXT].constructor`); `signal`, `effect`, `linkedSignal`, `afterRenderEffectPhase`, `childSignalProp` and `unknown` nodes carry no `debuggableFn`.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs` lines 12250-12282 (`isComputedNode` branch assigns `debuggableFn: consumer.computation`; `isTemplateEffectNode` branch assigns `debuggableFn: consumer.lView?.[CONTEXT]?.constructor`; other branches assign none).
- **Confidence**: high
- **Why it matters here**: Only two function bodies are scannable, so a subscribe callback must be inlined in a component constructor or a computed derivation to be reachable by the N24 source scan at all.

## Finding: The shipped agent serializes only `debuggableFn.name`, not the body

- **Claim**: `extension/agent-main.js` `serializeGraph` records `debuggableFn: n.debuggableFn && n.debuggableFn.name ? n.debuggableFn.name : null`, so function source never crosses the MAIN-world/panel boundary; any source scan must run in the existing agent (or extend this serialization) without adding a page global.
- **Source**: `extension/agent-main.js` lines 260-272 (`serializeGraph`, `debuggableFn` field).
- **Confidence**: high
- **Why it matters here**: Even the measured direct case cannot be scanned in the panel alone; the agent must read `.toString()` and match, which is an extension of the existing contract rather than new instrumentation.

## Finding: `ReactiveNodeKind` has no entry for plain (non-signal) fields or template reads

- **Claim**: `ReactiveNodeKind` is `'signal' | 'computed' | 'effect' | 'template' | 'linkedSignal' | 'afterRenderEffectPhase' | 'childSignalProp' | 'unknown'`; plain component fields are not nodes, and the graph records signal reads/writes only, never which template expressions read a plain field.
- **Source**: `node_modules/@angular/core/types/_formatter-chunk.d.ts` line 48 (type alias) and `DebugSignalGraph` interface in `node_modules/@angular/core/types/core.d.ts` lines 4632-4656.
- **Confidence**: high
- **Why it matters here**: Confirming that the template actually reads the written field (upgrading "may show a stale value" to a confirmed stale render) is impossible from this surface; the "may" hedging in N1 is structurally required.

## Finding: Effect callbacks carry no `debuggableFn`, so writes inside them are unscannable

- **Claim**: Nodes of kind `effect` and `afterRenderEffectPhase` are serialized in `getNodesAndEdgesFromSignalMap` without a `debuggableFn`, so a plain-field write performed inside an `effect`/`afterRenderEffect` callback cannot be detected by a `debuggableFn` source scan.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs` lines 12275-12282 (the `else` branch for non-computed/non-signal/non-template nodes assigns no `debuggableFn`).
- **Confidence**: high
- **Why it matters here**: Detecting stale writes inside effects would require new instrumentation beyond the measured subscribe case and is out of scope per INTENT.

## Finding: Determining whether a field is a non-signal plain field needs instance inspection

- **Claim**: The graph carries no metadata distinguishing a signal from a plain property of the component instance; deciding that `this.field` is a non-signal plain field requires runtime inspection of the component instance (available on template nodes via `lView[CONTEXT]`), not the graph alone.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs` lines 12267-12274 (template node exposes constructor only, not property descriptors); `extension/agent-main.js` `captureGraph`/`serializeGraph` (no instance properties serialized).
- **Confidence**: medium
- **Why it matters here**: The "non-signal" part of the measured case already depends on reading the instance at scan time in the agent; extending it to arbitrary objects needs new instrumentation.

## Finding: INTENT vetoes exactly the generalizations that need new instrumentation

- **Claim**: INTENT.md Scope-out and Prohibition N5 forbid generalization beyond direct `this.field =` in subscribe (helper methods, other objects, minified code), adding page-side instrumentation, supporting production/minified builds, and checking whether the template reads the field.
- **Source**: `D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md` Scope: out (vetoes) rows and Prohibitions N5 (judgment), lines 75-85 and 59.
- **Confidence**: high
- **Why it matters here**: The only detection that fits the available surfaces and the vetoes is the direct inlined write; every broader detection is both unprovable from `getSignalGraph`/`debuggableFn` and explicitly out of scope.

## Assigned questions — answers

- Which N24 detections beyond the measured direct `this.field =` in subscribe case need new instrumentation? → Every detection beyond the measured direct inlined write needs new instrumentation (or is impossible on the available surfaces) and is out of scope under the vetoes; the candidates and their costs follow.

## Detection candidates (instrumentation cost)

  1. Writes performed through a helper/indirect call inside the subscribe callback (e.g. `this.update()`), because the regex never sees `this.field =` in the callback text — needs call tracing/instrumentation.
  2. Writes to non-`this` targets (`obj.field =`, `this.service.x =`, array elements, bracket notation) — needs object/property tracking beyond the component constructor source.
  3. Writes in other async contexts (Promise `.then`, `setTimeout`, RxJS `tap`/`map`, async pipe, `toSignal`) — needs callback-context identification beyond subscribe.
  4. Writes inside `effect`/`afterRenderEffect` callbacks — effect nodes expose no `debuggableFn`.
  5. Writes inside computed derivations that are not inlined in the scannable function — only the computation function is exposed.
  6. Confirming the template actually reads the field (upgrading "may show stale" to confirmed stale) — plain fields are not graph nodes and template reads of plain fields are not recorded.
  7. Deep mutations of objects held in signals (`this.state().field = x`) — property writes are not represented in the graph.
  8. Compound/destructured/indirect assignments (`this.field +=`, `Object.assign(this, …)`) — not matched by the direct-write regex.
  9. Minified/production builds — `debuggableFn` absent or mangled; needs source maps or instrumentation (also vetoed).
  10. Determining signal-vs-plain for arbitrary objects — requires instance inspection not currently serialized.
  The only detection provable without new instrumentation is a direct `this.field =` / `.set(`/`.update(` whose write site textually appears inside an inline subscribe callback within a scannable `debuggableFn` (component constructor or computed computation) on a dev build with a 22.1.3+ Angular. Everything else is recorded as needing new instrumentation and is out of scope per INTENT.

## Dead ends

- `node_modules/@angular/core` search for `debuggableFn` assignment beyond `_debug_node-chunk.mjs` — no other population sites; only computed and template nodes carry it.
- Web search for official Angular 22 `debuggableFn` documentation — only generic signal-graph DevTools docs found; no spec-level contract beyond the bundled typings and `_debug_node-chunk.mjs` source (treated as lead, not primary).
- `spikes/ng222-app` — no subscribe-based stale-write fixture present yet; the measured case is specified by INTENT, not by existing spike code.
- `agent-main.js` for any existing source-scan or `.toString()` usage — none; the agent only records `debuggableFn.name`.