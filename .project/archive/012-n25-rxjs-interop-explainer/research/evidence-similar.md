# Evidence — similar

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: similar
Questions assigned: Whether the interop keep-list classifier can be recognised by label or by `debuggableFn` source.

## Finding: Angular's `toSignal` stamps its nodes with `toSignal.state` / `toSignal.source` labels in dev mode

- **Claim**: In the installed Angular 22.1.8 bundle, `toSignal` creates its state `signal` and result `computed` with `debugName: "toSignal<#name>.state"` and `"toSignal<#name>.source"` (default name empty), so the graph nodes carry labels `toSignal.state` and `toSignal.source`.
- **Source**: `node_modules/@angular/core/fesm2022/rxjs-interop.mjs` lines 108-124 and 156-168 (`state = signal({...}, { ..., createDebugNameObject(options?.debugName, 'state') })`; computed uses `createDebugNameObject(options?.debugName, 'source')`; `createDebugNameObject` returns `debugName: "toSignal" + (toSignalDebugName ? "#" + toSignalDebugName : "") + "." + internalSignalDebugName`).
- **Confidence**: high
- **Why it matters here**: This is the concrete proof that `toSignal.*` nodes are recognisable by their `label` field, so the keep-list's label rule is grounded in shipped Angular source rather than a guess.

## Finding: `DebugSignalGraphNode.label` is populated from the node's `debugName`

- **Claim**: In Angular's signal-graph serialiser, `label: consumer.debugName` is written for computed, signal, template and fallback nodes, so a node's label equals whatever `debugName` the primitive was created with.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs` lines 12250-12281 (`label: consumer.debugName` in the `isComputedNode`, `isSignalNode`, and `else` branches; `label: consumer.debugName ?? consumer.lView?.[HOST]?.tagName?.toLowerCase?.()` for template nodes).
- **Confidence**: high
- **Why it matters here**: Confirms the label is a first-class, stable field on `DebugSignalGraphNode` (typing: `node_modules/@angular/core/types/core.d.ts:4636` `label?: string`), so matching on label is a supported, no-invocation classification.

## Finding: The installed typings expose the graph shape and `debuggableFn`

- **Claim**: `ɵgetSignalGraph(injector: Injector): DebugSignalGraph` is declared on `ExternalCoreGlobalUtils`, and `DebugSignalGraphNode` carries `kind`, `id`, `epoch`, `label?`, `value?`, `debuggableFn?`; `ProfilerEvent` is a separate enum in the same file.
- **Source**: `node_modules/@angular/core/types/core.d.ts:8784` (`ɵgetSignalGraph(injector: Injector): DebugSignalGraph`); lines 4632-4639 (`interface DebugSignalGraphNode { kind: ReactiveNodeKind; id: string; epoch: number; label?: string; value?: unknown; debuggableFn?: () => unknown; }`); line 4502 (`declare enum ProfilerEvent`); `node_modules/@angular/core/types/_effect-chunk.d.ts:30` (`declare const SIGNAL_NODE: SignalNode<unknown>`).
- **Confidence**: high
- **Why it matters here**: Establishes the exact field names the classifier keys on (`label`, `debuggableFn`) and that `debuggableFn` is optional and function-typed, matching the repo's existing serialization (`extension/agent-main.js`).

## Finding: A measured portal capture shows `toSignal.*` labels present and the effect unlabelled with `subject.error` in its source

- **Claim**: On the portal's `/claim/create`, `toSignal(this.#contracts$)` appears as a `computed` labelled `toSignal.source` (value `array(20)`) with producer `signal` labelled `toSignal.state`, while the facade's `toObservable` appears as an `effect` with an empty label whose `debuggableFn` contains `subject.error` and which reads `computed:contracts -> signal:#state`.
- **Source**: `research/raw/tosignal-node-portal.json` (107 nodes); summarised in `.project/archive/008-tooling/research/evidence-stack.md` lines 29-34 and `docs/feature-proposals.md:804`.
- **Confidence**: high
- **Why it matters here**: This is the strongest available source: it proves both classifier rules fire on real data — label rule for the `toSignal` nodes, `debuggableFn`-source rule for the unlabelled effect — and that the effect has no `toSignal.*` label, so label-only matching would miss it.

## Finding: Angular's own AI signal tool deliberately strips `debuggableFn`, so the repo bypasses it

- **Claim**: Angular's `angular:signal_graph` tool returns the graph with `id` and `debuggableFn` stripped, which is why the repo calls `ng.ɵgetSignalGraph` directly and serialises `debuggableFn` as text in the MAIN-world agent.
- **Source**: `research/02-angular-surface.md` (section 1.5, citing `packages/core/src/debug/ai/signal_graph.ts:14-81`); `extension/agent-main.js` `serializeGraph` (recorded in `.project/archive/005-signal-provenance/research/evidence-domain.md`).
- **Confidence**: high
- **Why it matters here**: Confirms there is no off-the-shelf Angular DevTools panel implementation exposing signal-graph nodes with `debuggableFn` to copy; the repo's own agent is the comparable implementation, and the classifier must run on the serialised text.

## Finding: No installed Angular DevTools extension in the repo exposes a signal-graph panel

- **Claim**: Searches of `extension/`, `src/`, `docs/`, and `research/` for an installed Angular DevTools signal-graph panel found none; the only references are the repo's own agent/panel code and the `control-angular-devtools` skill used to drive an external extension.
- **Source**: grep for `angular-devtools` across the repo (matches limited to skills, docs, tmp cache and `.angular` cache); `research/02-angular-surface.md` lists Angular DevTools only as prior art for the `angular:signal_graph` tool.
- **Confidence**: medium
- **Why it matters here**: There is no comparable implementation to inherit a naming scheme from; the `toSignal.*` / `subject.error` names come from Angular's library source and the measured capture, not from a panel convention.

## Assigned questions — answers

- Whether the interop keep-list classifier can be recognised by label or by `debuggableFn` source. → Both, and they are complementary, not alternatives: `toSignal.source` / `toSignal.state` nodes are recognisable by their `label` (Angular's `toSignal` sets `debugName` to `toSignal.<...>.source`/`.state`, confirmed in the installed 22.1.8 bundle at `node_modules/@angular/core/fesm2022/rxjs-interop.mjs:108-168` and in the measured portal capture `research/raw/tosignal-node-portal.json`), while the feeding effect is recognisable only by `debuggableFn` source containing `subject.error` because its label is empty (measured capture: effect node with empty label). A classifier that used label alone would drop the effect; one that used source alone would still work for both but would be weaker for the `toSignal` nodes. Therefore the keep-list needs both rules, exactly as INTENT SC4/E5 specifies. Source: `node_modules/@angular/core/fesm2022/rxjs-interop.mjs:108-168`, `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12250-12281`, `research/raw/tosignal-node-portal.json`, `.project/archive/008-tooling/research/evidence-stack.md:29-48`.

## Dead ends

- `node_modules/@angular/core/index.d.ts` does not exist in this install — typings live under `node_modules/@angular/core/types/` (searched `types/core.d.ts` and `types/rxjs-interop.d.ts`); the label values are not in the typings at all, only in the compiled bundle.
- Searching `node_modules/@angular` for the literal `toSignal.source` / `toSignal.state` returned no matches in `.d.ts` files; the labels are runtime `debugName` strings, not type-level constants.
- No Angular DevTools browser extension or signal-graph panel source is installed in the repo beyond the `control-angular-devtools` skill and a cached 1.22.0 copy under `tmp/`; no panel code to inherit a naming scheme from.
- Web search was not used; all evidence is static file/git inspection as required by the task.