# Evidence — domain

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: domain
Questions assigned: Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check.; How to map a profiled component to its node in the signal graph for the trigger walk.; Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers?

## Finding: Profiler callback and component-check event

- **Claim**: `ng.ɵsetProfiler(profiler: Profiler | null): () => void` appends `profiler` to a module-private multi-subscriber array and returns a remover; `null` clears all subscribers. A component check is identified by `TemplateUpdateStart`/`TemplateUpdateEnd` carrying the component instance. The `ProfilerEvent` enum has 26 events and none for signal/zone/tick/markForCheck/applyChanges/Eager.
- **Source**: Angular source `render3/profiler.ts` and `primitives/devtools/src/profiler_types.ts` (22.2.x); fetched raw.
- **Confidence**: high
- **Why it matters here**: defines the recorder's input contract (INTENT SC1, E3, E6).

## Finding: Component to signal-graph node mapping

- **Claim**: instance -> host element -> `ng.getInjector(host)` (NodeInjector) -> `ng.ɵgetSignalGraph(inj)`; the component's node is the `template` node whose `debuggableFn === instance.constructor`. `angular:di_graph`/`getViewContainerRef` destroys this node (forbidden by INTENT N4).
- **Source**: Angular source `signal_debug.ts`, `reactive_lview_consumer.ts`; docs/filing-ledger.md item 1.
- **Confidence**: high
- **Why it matters here**: the trigger walk depends on this join (INTENT SC1, SC4).

## Finding: Eager attribution

- **Claim**: "Checked because Eager" is not a profiler event; it is read from `getDirectiveMetadata(instance).changeDetection === 1` (Eager/Default share value 1). Only `OutputStart` names a trigger (listener function with `.name`). Signal writes are inferred by epoch diff across graph nodes.
- **Source**: Angular source `change_detection/constants.ts`, `discovery_utils.ts`; Angular DevTools `capture.ts`.
- **Confidence**: high
- **Why it matters here**: drives INTENT E2b and the "no signal cause" reporting.

## Assigned questions — answers

- Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check. → `ng.ɵsetProfiler(profiler: Profiler | null): () => void` appends to a multi-subscriber array and returns a remover; null clears all. A component check is `TemplateUpdateStart`/`TemplateUpdateEnd` with the component instance.
- How to map a profiled component to its node in the signal graph for the trigger walk. → instance -> host element -> NodeInjector -> `ng.ɵgetSignalGraph(inj)`; component node is the `template` node whose `debuggableFn === instance.constructor`.
- Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers? → No profiler event for Eager/zone/timer/markForCheck; Eager read from `getDirectiveMetadata(instance).changeDetection === 1`; signal writes by epoch diff; only `OutputStart` names a trigger.

## Dead ends

- Using `angular:di_graph` or `getViewContainerRef()` on hosts — mutates the `template` node (forbidden by INTENT N4).
- Relying on a profiler event for Eager/zone/timer/`markForCheck` — none exists; must infer.