# Evidence — stack

<!-- Written by the research orchestrator (synthesized from domain/pitfalls/similar evidence after the stack researcher hit its turn limit). Consumed by the decider. -->

Dimension: stack
Questions assigned: Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check.; How to map a profiled component to its node in the signal graph for the trigger walk.; Availability/downloadability behavior of `LanguageModel` across the four supported browsers with and without feature flags.

## Finding: `ng.ɵsetProfiler` callback shape

- **Claim**: `ng.ɵsetProfiler(callback)` registers a function invoked as `callback(eventName: ProfilerEvent, instanceOrLView, eventFn?)`. The one shipping consumer (Angular DevTools backend `native.ts`) implements only `TemplateUpdateStart/End`, `LifecycleHookStart/End`, `OutputStart/End`; every `ChangeDetection*`/`Component*` event is a `// todo: implement` stub. A "cycle" is not an event pair — it is the window opened by the first `TemplateUpdateStart` and closed by a queued microtask (identical rule in Angular DevTools `capture.ts` and `cd-analyzer/analyzer.ts`).
- **Source**: Angular DevTools backend `native.ts` (raw, 22.2.x): https://raw.githubusercontent.com/angular/angular/22.2.x/devtools/projects/ng-devtools-backend/src/lib/profiling/profiler/native.ts ; `capture.ts`: https://raw.githubusercontent.com/angular/angular/22.2.x/devtools/projects/ng-devtools-backend/src/lib/profiling/capture.ts
- **Confidence**: high
- **Why it matters here**: defines the recorder's input contract and the cycle-boundary rule N1 must replicate.

## Finding: Component → signal-graph node mapping

- **Claim**: No shipped product joins a profiled component to its signal-graph node. Angular DevTools reaches the graph from the *element* (host → `getInjector` → `ɵgetSignalGraph`) and correlates nodes by the stable string `id`, never by `debuggableFn`. The class-constructor join (`instance.constructor` matches the graph node's `template` field) is N1's own and unproven prior art; `angular:signal_graph` strips both `id` and `debuggableFn`, so the join must be validated on `spikes/ng222-app`.
- **Source**: Angular DevTools `client-event-subscribers.ts` and `protocol/messages.ts` (raw, 22.2.x); INTENT.md E7 / E2.
- **Confidence**: medium
- **Why it matters here**: the trigger walk depends on this join; if it fails, N1 cannot attribute a signal write to a component.

## Finding: `ɵgetSignalGraph` entry point

- **Claim**: `ng.ɵgetSignalGraph(rootInjector)` returns a graph of nodes with `id`, `debuggableFn`, `template`, `epoch`, and (signal nodes) `value`; `rootInjector` is obtained via `ng.ɵgetInjectorFromNode(hostElement)` or the application root injector. Calling `angular:di_graph` or `getViewContainerRef()` on hosts mutates/removes the `template` node (docs/filing-ledger.md item 1) — forbidden by INTENT N4.
- **Source**: Angular source `@angular/core` 22.1.8 (installed); docs/filing-ledger.md item 1.
- **Confidence**: high
- **Why it matters here**: the only safe way to obtain the graph for the epoch-diff trigger walk.

## Finding: `window.ng` is dev-mode only

- **Claim**: `window.ng` (including `ɵsetProfiler`, `ɵgetSignalGraph`) is published only when `ngDevMode` is truthy (`publishDefaultGlobalUtils()` gated by `ngDevMode`). The repo's production bundle contains no `ɵsetProfiler`/`ɵgetSignalGraph`. This is the mechanism behind INTENT E7 ("no `ng.ɵsetProfiler` on the page").
- **Source**: `@angular/core` 22.1.8 source (`publishDefaultGlobalUtils`); repo production bundle grep.
- **Confidence**: high
- **Why it matters here**: explains why production/non-Angular/Zone.js pages report "not supported".

## Finding: Prompt API availability across browsers

- **Claim**: `LanguageModel.availability()` returns `'available'` in the DevTools panel in all four supported browsers without feature flags; in Edge it is `undefined` in the page and service worker; the hidden `devtools_page` is denied by the `language-model` permissions policy in all five instance pairs. `availability()` can also return `'downloadable'`/`'downloading'`, and `create()` then starts a multi-GB model download.
- **Source**: research/19 (languagemodel-in-extension-contexts), research/20 (measured); `control-ai-browsers` doctor output; `extension-prompt.service.ts:57`.
- **Confidence**: high
- **Why it matters here**: confirms panel-local Prompt API (INTENT §2) and that `ExtensionPromptService.checkAvailability()` currently mislabels `downloadable` as `ready` (contradicts INTENT E5).

## Finding: Zoneless default in Angular 22

- **Claim**: Angular 22 defaults to zoneless change detection (`provideZonelessChangeDetection`); `NgZone`/`NoopNgZone` presence determines zone mode. The profiler has no event for a zone tick, a timer, or `markForCheck` — those are inferred as "a `ChangeDetectionStart` with no preceding `OutputStart`".
- **Source**: Angular 22 docs; domain evidence (ProfilerEvent enum); pitfalls evidence.
- **Confidence**: high
- **Why it matters here**: the zone-mode check must read `NgZone`/`NoopNgZone`, never `typeof Zone`; and "Eager"/signal/zone attribution relies on absence of `OutputStart`.

## Finding: Eager detection

- **Claim**: "Checked because Eager" is detected by reading `getDirectiveMetadata(instance).changeDetection === 1` (Eager/Default share value 1); there is no profiler event for it. Angular DevTools renders the shipping labels `'ng-eager'`/`'ng-on-push'` — the closest precedent for INTENT E3's wording.
- **Source**: Angular source `change_detection/constants.ts`, `discovery_utils.ts`; Angular DevTools `capture.ts`.
- **Confidence**: high
- **Why it matters here**: the recorder must read component metadata, never rely on a profiler event, for Eager attribution.

## Finding: Viable approach summary

- **Claim**: The viable stack for N1 is: (a) MAIN-world script using `ng.ɵsetProfiler` + `ng.ɵgetSignalGraph` with feature detection (`typeof ng[name] === 'function'`), (b) a microtask-bounded cycle window, (c) an epoch-diff over signal-graph nodes to attribute signal writes, (d) panel-local `LanguageModel` call with `availability()` gating, (e) no worker in this milestone. Migration cost is low because the extension already runs a MAIN-world script (`agent-main.js`) and a panel Prompt API service.
- **Source**: INTENT.md; evidence-domain.md; evidence-pitfalls.md; evidence-codebase.md.
- **Confidence**: high
- **Why it matters here**: consolidates the stack decision space for `/gsd-path-decide`.

## Assigned questions — answers

- Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check. → See findings in this file.
- How to map a profiled component to its node in the signal graph for the trigger walk. → See findings in this file.
- Availability/downloadability behavior of `LanguageModel` across the four supported browsers with and without feature flags. → See findings in this file.

## Dead ends

- Using `angular:di_graph` or `getViewContainerRef()` on hosts — mutates the `template` node (forbidden by INTENT N4).
- Relying on a profiler event for Eager/zone/timer/`markForCheck` — none exists; must infer.
- Calling `LanguageDetector`/`Translator` in a Worker — renderer crash (pitfalls).
- Assuming `window.ng` exists in production — dev-mode only.