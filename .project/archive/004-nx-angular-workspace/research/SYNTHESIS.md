# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

<!-- One line each; choices already closed by an INTENT constraint or the brownfield codebase. No runner-ups invented here. -->
- Recorder world — a MAIN-world script records change-detection cycles via `ng.ɵsetProfiler` + `ng.ɵgetSignalGraph` (INTENT Summary, Scope: in; Constraints)
- Prompt API surface — the session lives in the DevTools panel, the prompt is a short fact list only (no signal values / page data, no tool calling), and the prompt and answer never leave the panel; no Prompt API in the page, content scripts, or service worker (INTENT N1, N2, Scope: out; evidence-codebase "Prompt API session lives in the DevTools panel")
- No worker this milestone; no download flow; content.js is deleted never revived (INTENT Scope: out; evidence-codebase "Dead content.js is not wired into the manifest")
- Recording lifecycle — recording starts when the panel opens on the inspected tab and a page reload resets the recording (INTENT SC1, Corrections)
- Deletions — remove the dead prompt bridge (agent-main.js LanguageModel code, relay.js PROMPT_API_REQUEST forwarding/request(), background.js PROMPT_API_REQUEST stub), content.js, page-script.js and nx-welcome.ts with no dangling file, manifest, or import references (INTENT SC6, N6; evidence-codebase "content.js defines __ANGULAR_AI_PROMPT_API__ that is never consumed", "Two content-script worlds coexist")
- Explain trigger — the explain button is the only trigger for a model call; the browser test exercises the real recorder against spikes/ng222-app with no mocked Prompt API or fabricated chain (INTENT N4, N5)
- Stack pinning — zoneless, standalone, signals, signal inputs, inject(); TypeScript 6.0.x, Nx 23.3, Angular ~22.1, MV3 Chrome extension; `npm run check`, `npm test`, build-extension and the extension-panel check must pass (INTENT Constraints; evidence-codebase stack)
- Preserved surface — keep the Angular version explain, extension messaging, tab filtering and the sidecar-deps bridge intact; do not break existing panel features (INTENT Scope: out; evidence-codebase "Panel filters detection by inspected tab id", "Sidecar verify worktrees ship without node_modules")

## Decisions

### Cycle and component-check contract

- **Decision**: A component check is `TemplateUpdateStart`/`TemplateUpdateEnd` carrying the component instance; the profiler callback is signed `(event, instance?, eventFn?)`; one cycle is the window opened by the first `TemplateUpdateStart` and closed by a queued microtask.
- **Runner-up**: delimit cycles with `ChangeDetectionStart`/`ChangeDetectionEnd` and treat those as the check events — loses because the shipped Angular DevTools backend leaves every `ChangeDetection*` / `Component*` profiler event as a `// todo: implement` stub that does not carry the component instance, and those events are not the cycle boundary the comparable product uses.
- **Evidence**: evidence-stack § "Finding: `ng.ɵsetProfiler` callback shape"; evidence-similar § "Finding: Angular DevTools' own profiler consumer treats `TemplateUpdateStart`/`TemplateUpdateEnd` as the component check..."; evidence-similar § "Finding: A 'cycle' in Angular DevTools is a microtask-delimited window..."; evidence-domain § "Finding: Profiler callback and component-check event"
- **Confidence**: high

### Component-to-signal-graph-node mapping

- **Decision**: obtain the graph with `ng.ɵgetSignalGraph(ng.ɵgetInjectorFromNode(hostElement))` and join the component to its node by `template.debuggableFn === instance.constructor`; if the `template` node is absent, report "signal graph unavailable" rather than "no signal cause".
- **Runner-up**: use Angular's own `angular:signal_graph` command as the graph source — loses because it strips both `id` and `debuggableFn` from every node, making the class-constructor join impossible, and invoking `angular:di_graph`/`getViewContainerRef` is forbidden by INTENT N3.
- **Evidence**: evidence-domain § "Finding: Component to signal-graph node mapping"; evidence-stack § "Finding: `ɵgetSignalGraph` entry point"; evidence-stack § "Finding: Component → signal-graph node mapping"; evidence-pitfalls § "Finding: The `ViewContainerRef` trap..."; evidence-domain § "Dead ends: Using angular:di_graph or getViewContainerRef() on hosts"
- **Confidence**: medium — the `debuggableFn` join is N1's own and unproven prior art per evidence-stack; validate on `spikes/ng222-app` in wave 1.

### Trigger attribution

- **Decision**: only `OutputStart` names a trigger (its `eventFn` is the listener function, covering DOM/host listeners and `@Output`/template listeners); signal writes are inferred by epoch diff across the graph nodes a component's template reads; "checked because Eager" reads `getDirectiveMetadata(instance).changeDetection === 1`; zone/timer/`markForCheck`/`applyChanges` have no profiler event and are only inferable as "checked without an `OutputStart`".
- **Runner-up**: name the cycle trigger from `Zone.currentTask.source` as Angular DevTools does — loses because that source is the empty string in zoneless apps, which is the target surface per INTENT Constraints.
- **Evidence**: evidence-pitfalls § "Finding: Only `OutputStart` names a trigger..."; evidence-pitfalls § "Finding: 'Checked because Eager' is a metadata read, not a profiler event..."; evidence-pitfalls § "Finding: Zone.js vs zoneless is a `NgZone` question..."; evidence-stack § "Finding: Zoneless default in Angular 22"; evidence-stack § "Finding: Eager detection"; evidence-domain § "Finding: Eager attribution"
- **Confidence**: high

### Zone-mode detection

- **Decision**: detect zone mode from the root injector's `NgZone` — `NoopNgZone` (including a zoneless app that still loads the zone.js polyfill) is supported; a real `ZoneNgZone` reports "not supported" per INTENT E7.
- **Runner-up**: gate on `typeof Zone !== 'undefined'` — loses because a zoneless app that loads the zone.js polyfill would be falsely denied, and polyfill presence is not a change-detection trigger.
- **Evidence**: evidence-pitfalls § "Finding: Zone.js vs zoneless is a `NgZone` question, not a `typeof Zone` question — and a zone-loaded app makes Angular DevTools' own 'Source' column misleading"; INTENT E7
- **Confidence**: high

### Prompt API availability and `downloadable` handling

- **Decision**: treat `downloadable` and `downloading` as unavailable in this milestone (defer any download), surface the raw `availability()` value as the panel's reason string, handle a `create()` rejection as an explainable outcome, and fix `ExtensionPromptService.checkAvailability()` so it no longer labels `downloadable`/`downloading` as `ready`.
- **Runner-up**: keep the brownfield behavior of mapping `downloadable`/`downloading` to `ready` — loses because a click would call `create()` and start a multi-GB download (or hang), violating INTENT E5 and N2.
- **Evidence**: evidence-pitfalls § "Finding: `availability()` can legitimately be `downloadable`/`downloading`, and `create()` then blocks on a multi-GB download..."; evidence-pitfalls § "Finding: A `downloadable` model on a *fresh* profile is the common case in a `--no-ai-features` run..."; evidence-pitfalls § "Finding: `availability()` is not a promise that `create()` will succeed..."; evidence-codebase § "Finding: Prompt API session lives in the DevTools panel"; INTENT E5, SC5
- **Confidence**: high

### Missing-template-node vs no-signal-cause distinction

- **Decision**: a component whose graph is missing its `template` node (broken by a real `ViewContainerRef` on the host) is reported as "signal graph unavailable"; a component with an intact graph but no changed epoch is reported as "no signal cause".
- **Runner-up**: collapse both states into "no signal cause" — loses because it hides `ViewContainerRef` damage and conflates an unavailable graph with an unchanged signal, contrary to the honest-reporting intent of E3/E3b.
- **Evidence**: evidence-pitfalls § "Finding: The `ViewContainerRef` trap is not only about Angular's own `angular:di_graph` tool..."; INTENT N3, E3/E3b
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: (1) validate the `template.debuggableFn === instance.constructor` join on `spikes/ng222-app` and assert the exact chain `click -> count -> double -> app-counter template` (medium confidence; INTENT SC4); (2) confirm the microtask-bounded cycle window holds one `OutputStart` per cycle and keeps the profiler's event order (INTENT E4); (3) confirm panel-local `LanguageModel.availability()` is `available` and `create()` answers in all four instances with and without feature flags and that `downloadable` is surfaced as unavailable, not `ready` (INTENT SC5/E9/E5).
- **Walking skeleton**: a MAIN-world `agent-main.js` installs one `ng.ɵsetProfiler` subscriber whose microtask-bounded cycle buffer records `TemplateUpdateStart`/`End` with the component instance; on a component pick the panel walks `ng.ɵgetSignalGraph(ng.ɵgetInjectorFromNode(hostElement))`, joins the node by `debuggableFn === instance.constructor`, diffs the `epoch` of the signals the template reads to attribute the signal write, reads `getDirectiveMetadata(instance).changeDetection === 1` for "checked because Eager" and reports "no signal cause" / "signal graph unavailable" accordingly; the panel renders the component picker, chain, and explain button and calls the panel-local `LanguageModel.create()` gated by `availability()` with a fact-list prompt (no tool calling), caching the explanation keyed by node ids + epochs so an unchanged slice re-uses the cached answer with no prompt; the dead prompt bridge, `content.js`, `page-script.js` and `nx-welcome.ts` are deleted with no dangling references; unit tests assert the chain walk on recorded data and a browser test asserts the chain on `spikes/ng222-app`.
- **Pitfalls → tasks**: each known trap below is mapped to a future task the planner must assign.
  - The `angular:di_graph` / `getViewContainerRef` trap strips the template node → a reviewer-lint task must ban `ViewContainerRef|di_graph|devtoolstooldiscovery` from the recorder (`agent-main.js`); (evidence-pitfalls "The `ViewContainerRef` trap..."; INTENT N3)
  - The page can read/forge the chain sent over `window` CustomEvents → a task must make the panel treat the chain as untrusted page data and never route the prompt/reply through `relay.js`/`background.js`; (evidence-pitfalls "The page can read *and* forge..."; INTENT N1)
  - `LanguageDetector`/`Translator` in a worker crashes the renderer → a task must keep all model work in the panel document and forbid reviving a worker this milestone; (evidence-pitfalls "The spec exposes `LanguageModel` to `Window` only... worker crashes"; worker veto)
  - `ng.ɵsetProfiler(null)` clears Angular DevTools' subscriber → a task must make the recorder's stop path call the function returned by `ng.ɵsetProfiler`, never pass `null`; (evidence-pitfalls "ng.ɵsetProfiler(null) would silently break Angular DevTools"; feature-proposals §2.2)
  - Edge page/service-worker have no `LanguageModel` without flags and the hidden `devtools_page` is permission-policy-denied → a task must keep the session panel-local and make the explain button handle `create()` rejection while showing the availability reason; (evidence-pitfalls "The panel is the only context..."; "The hidden devtools_page is denied..."; INTENT E5/E9; AGENTS shared instances)
  - Cold `--no-ai-features` profiles have no model (`availability()` reads `unavailable`) → the extension-panel check must run on the warm shared instances and assert the availability reason string, not merely a clean exit; (evidence-pitfalls "The panel's acceptance check needs a *warm* profile"; AGENTS shared instances)
  - `Default` and `Eager` share value 1 → a task must label the effective strategy "Eager" and never claim which literal the app wrote; (evidence-pitfalls "'Checked because Eager' is a metadata read..."; evidence-pitfalls "Eager detection")

## User rulings

- Confirmed "no signal cause" as the final wording for the panel's no-signal-cause chain display (AFK override: chose the intent-specified phrase per INTENT SC4/E3, evidence-domain "Intact graph + unchanged epoch → 'no signal cause'"); no runner-up wording evaluated, as this was a pure values call with no evidence to prefer an alternative.

## Still unknown

- None (the "no signal cause" wording was confirmed during decide via AFK override).
