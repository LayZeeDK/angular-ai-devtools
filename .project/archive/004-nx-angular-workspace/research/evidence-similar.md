# Evidence — similar

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: similar
Questions assigned: Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check.; How to map a profiled component to its node in the signal graph for the trigger walk.; Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers?

Primary sources opened for this dimension (all read in this run, 2026-10-20):

- Angular DevTools backend, `angular/angular` branch `22.2.x` (raw files):
  - `devtools/projects/ng-devtools-backend/src/lib/profiling/profiler/native.ts` — the shipped `ɵsetProfiler` consumer
  - `devtools/projects/ng-devtools-backend/src/lib/profiling/profiler/shared.ts` — the `Profiler` base class and its hook surface
  - `devtools/projects/ng-devtools-backend/src/lib/profiling/capture.ts` — the recording pipeline (`ProfilerFrame`, `source`, per-directive timings)
  - `devtools/projects/ng-devtools-backend/src/lib/profiling/cd-analyzer/analyzer.ts` + `analyzer.spec.ts` + `data-stream.ts` + `highlighting.ts` — per-component CD cycle accounting
  - `devtools/projects/ng-devtools-backend/src/lib/profiling/performance-track.ts` — the Performance-panel track
  - `devtools/projects/ng-devtools-backend/src/lib/directive-forest/identity-tracker/identity-tracker.ts` — component identity
  - `devtools/projects/ng-devtools-backend/src/lib/directive-forest/component-tree/component-tree.ts` — `getDirectiveCdStrategy` (OnPush/Eager labelling)
  - `devtools/projects/ng-devtools-backend/src/lib/client-event-subscribers.ts` — the Signals pane: host element → injector → `ɵgetSignalGraph`, node `id` correlation, graph caching
  - `devtools/projects/protocol/src/lib/messages.ts` — `ProfilerFrame`, `DebugSignalGraphNode`, `ChangeDetection = 'ng-on-push' | 'ng-eager' | …`
  - `packages/core/src/debug/ai/signal_graph.ts` — Angular's own `angular:signal_graph` tool (strips `debuggableFn` and `id`)
- https://angular.dev/tools/devtools/profiler — official Profiler-tab docs (bar chart, flame graph, the "Change detection" filter)
- React DevTools, `facebook/react` `main`:
  - `packages/react-devtools-shared/src/backend/fiber/renderer.js` — `getChangeDescription`, `recordChangeDescriptions`, `CommitProfilingData.updaters`
  - `packages/react-devtools-shared/src/backend/fiber/shared/DevToolsFiberChangeDetection.js` — `getChangedKeys`, `getChangedHooksIndices`, `getContextChanged`, `didFiberRender`
  - `packages/react-reconciler/src/ReactFiberRoot.js`, `packages/react-reconciler/src/ReactFiberLane.js`, `packages/react-reconciler/src/ReactFiberWorkLoop.js` — `memoizedUpdaters` / `addFiberToLanesMap` / `movePendingFibersToMemoized`
  - https://react.dev/reference/react/Profiler, https://react.dev/reference/dev-tools/react-performance-tracks — official docs (phases, changed props)
- Vue:
  - `vuejs/core` `main`: `packages/runtime-core/src/devtools.ts` (`devtoolsPerfStart/End`, `devtoolsComponentUpdated`, `component:emit`), `packages/reactivity/src/effect.ts` (`onTrack`/`onTrigger`, `DebuggerEvent`), `packages/reactivity/src/constants.ts` (`TriggerOpTypes`), `packages/reactivity/src/watch.ts`
  - `vuejs/devtools` `main`: `packages/kit/src/runtime/timeline.ts`, `update-highlight.ts`, `packages/client/src/pages/timeline.vue`
  - https://devtools.vuejs.org/getting-started/features.html — official feature list (Timeline, Graph)
- Project prior art in this repo (read): `research/03-prior-art.md` (Pangular, React DevTools, React Scan), `research/14-ai-devtools-prior-art.md`, `research/15-deterministic-and-ai.md`, `research/19-languagemodel-in-extension-contexts.md`, `research/20-built-in-ai-without-flags.md`, `docs/feature-proposals.md` (N1), and the sibling `evidence-domain.md`.

---

## Finding: Angular DevTools' own profiler consumer treats `TemplateUpdateStart`/`TemplateUpdateEnd` as the component check, and leaves every other CD/component event unimplemented

- **Claim**: The shipped Angular DevTools backend installs one `ɵsetProfiler` subscriber whose callback signature is `(event: ɵProfilerEvent, instanceOrLView: {} | null = null, eventFn: any) => void` and fans out to its own callbacks. Only `TemplateUpdateStart`, `TemplateUpdateEnd`, `LifecycleHookStart/End` and `OutputStart/End` have implementations; `ChangeDetectionStart/End`, `ChangeDetectionSyncStart/End`, `ComponentStart/End`, `AfterRenderHooks*`, `HostBindings*`, `DeferBlockState*` and `DynamicComponent*` are all `// todo: implement` stubs that return immediately. The component check is therefore identified by `TemplateUpdateStart`/`TemplateUpdateEnd` with `instance` = the component instance.
- **Source**: `devtools/projects/ng-devtools-backend/src/lib/profiling/profiler/native.ts` (fetched from `raw.githubusercontent.com/angular/angular/22.2.x`): `type ProfilerCallback = (event: ɵProfilerEvent, instanceOrLView: {} | null, eventFn: any) => void;`, `NgProfiler._initialize()` calling `ngDebugClient().ɵsetProfiler!(...)`, and the per-event handler methods.
- **Confidence**: high
- **Why it matters here**: It is the strongest available corroboration for Q1 from a comparable product: the only profiler events a shipping devtools treats as "this component was checked" are the template-update pair. It also fixes the callback's usable shape for N1: `(event, instance, eventFn)`, with `instance` being the component instance and `eventFn` the template or listener function.

## Finding: Angular DevTools identifies the checked component by an identity-tracker id and an element position, never by a name

- **Claim**: The DevTools backend keeps a `Map<DirectiveInstance, number>` (component id) and a `Map<DirectiveInstance, ElementPosition>` (position in the component tree). A profiled instance is resolved to its id/position by `IdentityTracker.getInstance().getDirectiveId(directive)` and `getDirectivePosition(directive)`; a component is identified as such by `isComponent.get(directive)`. The tracking is per directive instance, and during recording the tracker switches to a `'preservation'` mode so removed directives keep their ids.
- **Source**: `devtools/projects/ng-devtools-backend/src/lib/directive-forest/identity-tracker/identity-tracker.ts` (`currentDirectiveId`, `currentDirectivePosition`, `isComponent`, `selectMode('preservation')`); `native.ts` uses these in `TemplateUpdateStart`/`TemplateUpdateEnd`/`OutputStart`; `capture.ts` `start()`/`stop()` toggles `'preservation'` around the recording.
- **Confidence**: high
- **Why it matters here**: It gives N1 a proven identity recipe for the "components the recorded cycles checked" list (INTENT SC2) and, by contrast, says nothing about the *signal-graph* node. It also confirms the comparable product never keys anything by component name — matching INTENT edge E4's "no name-based tie-break".

## Finding: A "cycle" in Angular DevTools is a microtask-delimited window opened by the first `TemplateUpdateStart`, not a `ChangeDetectionStart`/`End` pair

- **Claim**: Both the DevTools recorder and its CD analyzer end a cycle with a queued microtask rather than with the framework's own CD events. `native.ts` sets `_inChangeDetection = true` on the first `TemplateUpdateStart` and emits `changeDetection$` in `Promise.resolve().then(...)`; `capture.ts` flushes the buffered frame in the same microtask, passing a `source` string; `cd-analyzer/analyzer.ts` opens a cycle on the first `onChangeDetectionStart` and closes it in `queueMicrotask(...)` with the comment "The queued microtask quarantees that it will be executed right after the current synchronous CD cycle completes, marking its end."
- **Source**: `native.ts` (`changeDetection$` emission), `capture.ts` (`onChangeDetectionStart` → `Promise.resolve().then(() => onFrame(flushBuffer(..., source)))`), `cd-analyzer/analyzer.ts` (`inCd` flag + `queueMicrotask`).
- **Confidence**: high
- **Why it matters here**: N1 needs a deterministic "one cycle = one group of checks" rule (INTENT E4: one trigger per cycle, keep the profiler's event order). The comparable product's rule — first template-update opens the cycle, a microtask closes it — is directly portable and does not depend on the `ChangeDetection*` events, which DevTools itself never implements.

## Finding: Angular DevTools names a cycle's trigger from `Zone.currentTask.source`, so it has no trigger name in a zoneless app

- **Claim**: The DevTools recorder fills a frame's `source` field with the *Zone.js task source*: `const zone = (window as any).Zone; if (!zone || !zone.currentTask) { return ''; } return zone.currentTask.source;`. `ProfilerFrame.source` is a `string`, and the frame is the unit the Profiler tab shows. With zone.js absent (a zoneless app) the source is the empty string, so the shipped profiler shows a cycle with no cause; the "Source" it can show is a zone task name (e.g. a timer), not a signal write.
- **Source**: `devtools/projects/ng-devtools-backend/src/lib/profiling/capture.ts` (`getChangeDetectionSource()`, called in `onChangeDetectionStart` and passed to `flushBuffer`); `devtools/projects/protocol/src/lib/messages.ts` (`export interface ProfilerFrame { source: string; duration: number; directives: ElementProfile[]; }`).
- **Confidence**: high
- **Why it matters here**: This is the direct answer to Q3 from the comparable product, and it is a negative result for N1's target: INTENT's supported apps are zoneless, so the "name the cycle's trigger" trick the shipped Angular DevTools uses does not apply. It confirms N1 must derive the trigger from profiler events and the signal graph (i.e. `OutputStart` plus an epoch diff) rather than from a zone task, and it explains why the shipped product has no "why did this update" for zoneless apps.

## Finding: The shipped Angular profiler stops at "was checked" and "how long" — it has no causality, and it distinguishes checked from not-checked components with a filter, not a reason

- **Claim**: The Profiler tab's data model is per-frame, per-element, per-directive timings (`ElementProfile.directives[].changeDetection`, `lifecycle`, `outputs`). The official docs describe a "Change detection" checkbox in the flame graph that "highlights all the components that went through change detection and displays those that did not in gray, such as `OnPush` components that did not re-render". The product records *that* a component was checked and *what it cost*; it never records *why* it was checked. `outputs` in the profile are per-output-name durations, i.e. the listener identity is preserved but not used as a cause.
- **Source**: https://angular.dev/tools/devtools/profiler (sections "Understand your application's execution", "Understand component execution", "Debug change detection and `OnPush` components"); `devtools/projects/protocol/src/lib/messages.ts` (`DirectiveProfile {name, isElement, isComponent, lifecycle, outputs, changeDetection?}`, `ElementProfile`); `capture.ts` (`insertOrMerge` accumulating `outputs[name] += duration`).
- **Confidence**: high
- **Why it matters here**: It bounds the comparable product's capability: the "checked vs not checked" distinction Angular DevTools offers is exactly the distinction N1 must go beyond ("checked, but no signal cause" / "checked because Eager"). N1's added value is a *cause*, not a check log — and the filter UX (grey = not checked) is a proven presentation for the check/no-check half.

## Finding: Angular DevTools labels a component's change-detection strategy `ng-eager` / `ng-on-push` in the component tree — the vocabulary precedent for "checked because Eager"

- **Claim**: The DevTools protocol defines `export type ChangeDetection = 'ng-on-push' | 'ng-eager' | 'acx-on-push' | 'acx-default'`, and `getDirectiveCdStrategy(dir)` maps `getDirectiveMetadata(dir.instance).changeDetection` to `'ng-on-push'` for `ChangeDetectionStrategy.OnPush` and `'ng-eager'` for `ChangeDetectionStrategy.Eager`. The value is sent per component node in the component-explorer view (`changeDetection: node.component ? getDirectiveCdStrategy(node.component) : undefined`).
- **Source**: `devtools/projects/protocol/src/lib/messages.ts` (`ChangeDetection` type, `DevToolsNode.changeDetection`); `devtools/projects/ng-devtools-backend/src/lib/directive-forest/component-tree/component-tree.ts` (`getDirectiveCdStrategy`); `client-event-subscribers.ts` (`prepareForestForSerialization`).
- **Confidence**: high
- **Why it matters here**: It is the closest shipping precedent for the exact phrase INTENT E3 asks for ("`Eager`: 'checked because Eager'"), and it shows the flag is a *component property* read from `getDirectiveMetadata`, not a profiler event — consistent with the domain finding and usable as a deterministic read for the "no signal cause" case.

## Finding: React DevTools' "Why did this render?" is a deterministic diff of the previous and current render, not an event-based cause

- **Claim**: React computes a render reason by comparing the previous and the next fiber at commit time. `getChangeDescription(prevFiber, nextFiber)` returns `{context, didHooksChange, isFirstMount, props, state, hooks}` where `props` = `getChangedKeys(prev.memoizedProps, next.memoizedProps)` (the list of changed prop *keys*), `state` = changed state keys for class components, `hooks` = `getChangedHooksIndices(prevHooks, nextHooks)` (indices of stateful hooks whose value changed), and `context` = `getContextChanged(...)`. The result is stored per element id in the commit's `changeDescriptions` map, and the whole mechanism is gated behind the flag `recordChangeDescriptions` (set by `startProfiling(shouldRecordChangeDescriptions)`), i.e. it is an opt-in recording mode, not always-on.
- **Source**: `packages/react-devtools-shared/src/backend/fiber/renderer.js` (`getChangeDescription`, `if (recordChangeDescriptions) { … metadata.changeDescriptions.set(id, changeDescription) }`, `startProfiling(shouldRecordChangeDescriptions)`, `stopProfiling()` resetting the flag); `packages/react-devtools-shared/src/backend/fiber/shared/DevToolsFiberChangeDetection.js` (`getChangedKeys`, `getChangedHooksIndices`, `getContextChanged`, `didStatefulHookChange`).
- **Confidence**: high
- **Why it matters here**: This is the product N1 is explicitly the Angular analogue of (research/03 §2.1). Two reusable lessons: (1) the reason is a *diff between two states*, computed in code — the same shape as N1's epoch diff on the signal graph, and equally model-free; (2) the recording of reasons is opt-in because it costs memory and time, which argues for N1's "recording starts when the panel opens" scope rather than an always-on recorder.

## Finding: React tracks, per commit, which components *scheduled* an update — the direct analogue of "which signal was written"

- **Claim**: React's commit profiling metadata carries an `updaters: Array<SerializedElement> | null` field: the set of fibers whose `setState`-style update scheduled that commit. React tracks this in the reconciler itself: `FiberRoot.memoizedUpdaters` is a `Set` of fibers, filled by moving "pending updaters" into it when a render starts (`movePendingFibersToMemoized(root, lanes)`) and restored on bailout (`restorePendingUpdaters`); the DevTools backend reads `fiberRoot.memoizedUpdaters` after each commit and records the matching instances in `metadata.updaters`.
- **Source**: `packages/react-reconciler/src/ReactFiberRoot.js` (`this.memoizedUpdaters = new Set()` under `enableUpdaterTracking`); `packages/react-reconciler/src/ReactFiberLane.js` (`addFiberToLanesMap` puts the scheduling fiber into `root.pendingUpdatersLaneMap[index]`; `movePendingFibersToMemoized` moves it into `root.memoizedUpdaters`); `packages/react-reconciler/src/ReactFiberWorkLoop.js` (calls `movePendingFibersToMemoized(root, lanes)` when a render starts, `restorePendingUpdaters` on bailout, `root.memoizedUpdaters.clear()`); `packages/react-devtools-shared/src/backend/fiber/renderer.js` (`const updaters = fiberRoot.memoizedUpdaters; … metadata.updaters.push(instanceToSerializedElement(fiberInstance))`).
- **Confidence**: high
- **Why it matters here**: It shows the shape a "cause list" takes in a comparable product: per cycle, the *writers* are listed explicitly, not inferred after the fact. N1's analogue is the set of signal-graph nodes whose `epoch` changed in that cycle — the same per-cycle list, produced by a different mechanism (React hooks the scheduler; Angular exposes no scheduler hook, so the epoch diff is the substitute).

## Finding: Vue's devtools hook records per-component render/update timing and emits, but names no cause; Vue's reactivity has a per-effect `onTrigger` hook that Angular has no equivalent of

- **Claim**: Vue core emits `perf:start`/`perf:end` (with `type` `'mount'` or `'patch'`) and `component:updated` for every component update, and `component:emit` for every emitted event; the Vue DevTools runtime turns these into Timeline entries with a title (component name) and a subtitle (phase), plus duration, and highlights the updated component's DOM box. Vue's reactivity package additionally exposes a *per-effect* dev-only debugger hook: `onTrigger?: (event: DebuggerEvent) => void` where `DebuggerEvent` carries `{effect, target, type, key, newValue?, oldValue?}` and `type` is one of `TrackOpTypes`/`TriggerOpTypes` (`'get'|'has'|'iterate'` / `'set'|'add'|'delete'|'clear'`). It is enabled only where the application passes `onTrigger` in a watcher's options, so there is no global "which reactive value changed" feed.
- **Source**: `vuejs/core` `packages/runtime-core/src/devtools.ts` (`DevtoolsHooks.PERFORMANCE_START/END`, `COMPONENT_UPDATED`, `COMPONENT_EMIT`; `createDevtoolsComponentHook`); `packages/reactivity/src/effect.ts` (`DebuggerEvent`, `DebuggerOptions.onTrack/onTrigger`); `packages/reactivity/src/constants.ts` (`TriggerOpTypes`); `packages/reactivity/src/watch.ts` (`effect.onTrack = options.onTrack; effect.onTrigger = options.onTrigger;` in `__DEV__`); `vuejs/devtools` `packages/kit/src/runtime/timeline.ts` and `update-highlight.ts`; https://devtools.vuejs.org/getting-started/features.html (Timeline tab, Graph tab).
- **Confidence**: high
- **Why it matters here**: Two lessons. (1) Vue's "Graph" tab shows the reactive dependencies of the selected component and its Timeline shows render/update events — the same two-panel split N1 has (component list + chain), and Vue's is *also* not causal: it shows what updated and how long, never why. (2) Vue can name a changed reactive value only because the framework exposes a trigger hook; Angular exposes none, which is precisely why N1 must derive "which signal changed" from the graph's `epoch` — a difference worth stating in the panel so the chain is not over-claimed.

## Finding: No shipped product computes a trigger → signal → component chain; each comparable stops at one hop

- **Claim**: Angular DevTools: per-component check + duration, plus a Zone task source (empty in zoneless apps); React DevTools: a per-component diff of props/state/hooks plus a per-commit list of state updaters; Vue DevTools: per-component mount/patch timings, a dependency graph, and a timeline of events, with no cause; Pangular Inspector: a change-detection recorder listing the most recent cycles with the triggering output listener and per-row check counts (capped at 200 cycles). In none of them does a single answer connect "a user action wrote signal X" to "component Y was checked because it reads X".
- **Source**: Angular DevTools `capture.ts` + `ProfilerFrame` (above); React `renderer.js` `CommitProfilingData` (durations, `changeDescriptions`, `updaters`); Vue `packages/kit/src/runtime/timeline.ts` (timeline event shape) and `devtools.vuejs.org/getting-started/features.html`; Pangular: `research/03-prior-art.md` §1.3 Components row ("Change detection recorder (slowest components by self time, latest cycles with trigger output listener, per-row check counts, 200 cycles)"), and `research/03` §1.4 for the `ng.*` API set Pangular reads.
- **Confidence**: medium
- **Why it matters here**: It is the honest positioning of N1: the chain is the novel part, and the reusable parts are the *shapes* — Angular's per-cycle frame plus element positions, React's per-commit "updaters" list and diff-based reasons, Pangular's "latest cycles with the triggering output listener" list. It also means no comparable product offers a ready-made algorithm for the chain; the epoch-diff + OutputStart approach in the domain evidence has no prior implementation to copy.

## Finding: Pangular's change-detection recorder is the closest shipped UI precedent for N1's panel, and it reads the same `ng.*` surface

- **Claim**: The Pangular Inspector's Components tab contains a "Change detection recorder" with the slowest components by self time, the latest cycles *with the triggering output listener*, per-row check counts, and a 200-cycle cap; it is fed by `ng.ɵsetProfiler` alongside `ng.getComponent`, `getDirectives`, `getDirectiveMetadata`, `getListeners`, `getInjector`, `ɵgetSignalGraph` — i.e. exactly the Tier-0/Tier-1 surface N1 is allowed to use, read from the page by an overlay (an in-app script) rather than by an extension. Its Signals tab renders one component's graph with node cards by kind (signal, computed, linkedSignal, effect, template) carrying value, epoch, producer/consumer counts and an "N changes" badge, from `ng.ɵgetSignalGraph(injector)`.
- **Source**: `research/03-prior-art.md` §1.3 (feature-inventory table, Components and Signals rows, measured from the local clone at `76c09d0`) and §1.4 (the `ng` API list; exact signal write history unavailable to an extension because it needs `setPostSignalSetFn` from the app bundle).
- **Confidence**: medium
- **Why it matters here**: It is the closest existing product to N1's *shape* (recorder + per-component graph + epoch), it confirms the epoch is the currency both products use to say "this signal changed", and it confirms the gap N1 fills: Pangular names the output listener that triggered a cycle but does not follow the signal chain to the components that were checked.

## Finding: The in-repo prior art already fixes the two reusable rules N1's walk needs — epoch-keyed caching, and the panel-local Prompt API context

- **Claim**: (a) `research/15` §2.8 records that every `ɵgetSignalGraph` node carries an `epoch` and that code should "key a slice, a finding or a model explanation by component id, node ids and their epochs; when no epoch changed, the cached answer is shown with no prompt", with the caveat that a plain field is not a graph node so it moves no epoch. (b) `research/19` and `research/20` record, measured, that `LanguageModel` is `available` and answers in the DevTools panel in Chrome 156, Chrome Beta 157, Edge 155 and Edge Dev 157 **without** feature flags, and that a dedicated worker started by the panel also has all seven built-in AI globals in all four browsers, while the extension service worker loses `LanguageModel` on Edge.
- **Source**: `research/15-deterministic-and-ai.md` §2.8 ("Caching keyed by graph epoch") and §2.1/2.2 (deterministic pre-computation; the one-hop slice around a template node measured at 230 characters against 13,878-25,838 characters for a whole component graph); `research/19-languagemodel-in-extension-contexts.md` (measured table: DevTools panel works in all five browser/model pairs) and `research/20-built-in-ai-without-flags.md` (measured without `--enable-features`: panel `available` in all four browsers; a worker started by the panel has all seven globals).
- **Confidence**: high
- **Why it matters here**: These are the two cross-cutting lessons a "similar" dimension must carry into the design: the walk's output can be cached against the epochs it already reads (so the panel's explain step costs nothing when nothing changed), and the deterministic walk can live in a panel-started worker (all four browsers) while the prompt stays in the panel (all four browsers) — the context split that research/15 §1.1 argues for and research/19/20 measure.

---

## Assigned questions — answers

- Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check. → See findings in this file.
- How to map a profiled component to its node in the signal graph for the trigger walk. → See findings in this file.
- Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers? → See findings in this file.

## Dead ends

- `packages/react-devtools-shared/src/backend/renderer.js` and `.../src/backend/profiler/*` on `facebook/react` `main` — 404; the backend was reorganised into `src/backend/fiber/renderer.js` (the reasons logic lives there). Also `src/frontend/components/ProfilerTab/*` no longer exists in that path, so the *UI copy* of React's reasons ("Record why each component rendered") could not be read from primary source; only the backend mechanism was.
- `api.github.com/search/code` for `recordChangeDescriptions` — 401 (needs authentication); the flag was located instead by reading `src/backend/fiber/renderer.js` and its import list, and `src/backend/fiber/shared/DevToolsFiberChangeDetection.js`.
- `devtools/projects/ng-devtools-frontend/**` in `angular/angular` `22.2.x` — 404 (the frontend is not in that tree on that branch), so the flame-graph "Change detection" filter was read from the official docs page instead of from the frontend source.
- `vuejs/devtools` `packages/api/src/index.ts` — 404 (the API package was replaced by `packages/devtools-api` + `packages/kit`); the Vue DevTools v9 runtime was read from `packages/kit/src/runtime/*` instead. Vue DevTools v9's Timeline client page (`packages/client/src/pages/timeline.vue`) shows no per-component "why updated" attribution — the older Component-Events timeline with prev/next props was not found in the v9 source.
- `devtools.vuejs.org/guide/features` and `/guide/component-events.html` — 404; used `https://devtools.vuejs.org/getting-started/features.html` instead.
- Pangular Inspector source (`D:\projects\github\pangular-inspector`, commit `76c09d0`) — outside this workspace; not re-read. Its change-detection recorder and Signals-tab details are quoted from `research/03-prior-art.md` and are therefore secondary here.
- Repository-root files `react-profiler-commit.js`, `react-profiler-flamegraph.js`, `react-profiler-reasons.js`, `react-changelog.md`, `vue-devtools-performance.md`, `vue-devtools-timeline.md` — every one of them contains only the text `404: Not Found`; they are failed earlier fetches, not sources.
- `legacy.reactjs.org/blog/2022/09/22/introducing-the-react-profiler.html` — 404 (site retired); the equivalent current primary sources are `react.dev/reference/react/Profiler` and `react.dev/reference/dev-tools/react-performance-tracks`, both read.
- Angular's own `angular:signal_graph` AI tool — confirmed to strip `id` and `debuggableFn` from every node, so it cannot serve as the graph source for a join that needs the class constructor; not pursued further (the domain evidence already ruled it out).
