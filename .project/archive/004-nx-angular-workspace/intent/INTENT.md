# Intent — angular-ai-devtools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: standard   <!-- standard | quick | milestone -->

Review panel: off   <!-- off | detected | claude,gpt,grok,composer,gemini,deepseek,kimi,qwen -->

Finding skeptics: off   <!-- off | on -->

Surfaces: DevTools panel   <!-- the "Angular AI" panel in Chrome DevTools -->

## Summary

Build feature N1, "Why did this update?" change-detection causality, in the existing Nx Angular workspace and MV3 extension, in modern Angular (zoneless, standalone, signals, signal inputs, inject()), replacing today's stub (`UpdateCauseService.record()` has no callers). A MAIN-world script records change-detection cycles through `ng.ɵsetProfiler` and walks the signal graph to compute the per-component trigger chain deterministically. The DevTools panel shows that chain and asks the Prompt API in the panel itself to explain it, sending the chain as a short fact list in the prompt (no tool calling, so Gemini Nano works too). Done means: the chain is correct on the counter fixture (`spikes/ng222-app`) in unit and browser tests; the panel answers in all four browsers (Chrome 156 Gemini Nano, Chrome Beta 157 Gemini Nano, Edge 155 Phi-4-mini, Edge Dev 157 Aion-1.1), with chrome-beta-gemma4 as a fifth instance, through `control-ai-browsers` and the `verify-ai-browsers` extension-panel check, both with the instances' feature flags and without them (`control-ai-browsers up <name> --no-ai-features`); and the dead prompt bridge, `content.js`, `page-script.js` and `nx-welcome.ts` are removed.

## Problem

There is no causality tooling for Angular change detection today: `UpdateCauseService.record()` has no callers, so a developer asking "why did this component update?" gets nothing. The extension only explains the detected Angular version. N1 adds a deterministic trigger chain (signal/zone/event/`markForCheck`/`Eager`) plus an on-device LLM explanation, all running locally in the panel.

## Users

Angular developers debugging change detection in the DevTools panel; technical. They use the existing "Angular AI" panel today for version explanation only.

## Success criteria

1. The MAIN-world script records change-detection cycles via `ng.ɵsetProfiler` and computes the per-component trigger chain deterministically. Recording starts when the panel opens on the inspected tab; a page reload resets the recording.
2. The DevTools panel lists the components the recorded cycles checked; the user picks one, and the panel shows the chain of the last cycle that checked it.
3. The panel asks the panel-local Prompt API to explain the chain and shows the answer; the prompt carries only a short fact list (no tool calling).
4. On `spikes/ng222-app`: a click that writes `count` gives the chain `click -> count -> double -> app-counter template`; a component checked with no signal change is reported as "no signal cause". Unit tests for the chain walk on recorded data; a browser test on the fixture.
5. The panel answers in all four browsers (Chrome 156 Gemini Nano, Chrome Beta 157 Gemini Nano, Edge 155 Phi-4-mini, Edge Dev 157 Aion-1.1), plus chrome-beta-gemma4 as a fifth, through `control-ai-browsers` and the `verify-ai-browsers` extension-panel check, both with the instances' feature flags and without them (`control-ai-browsers up <name> --no-ai-features`).
6. The dead prompt bridge (`agent-main.js` LanguageModel code, `relay.js` `PROMPT_API_REQUEST` forwarding and `request()`, `background.js` `PROMPT_API_REQUEST` stub), `content.js`, `page-script.js` and `nx-welcome.ts` are removed: no file, manifest entry or import references them, and `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` and the extension-panel check pass.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC2 | empty | criterion SC2 | no cycle has checked the component since recording started -> the panel says so; no model call |
| E2 | SC2 | empty | criterion SC2 | component not on the page -> "not found" |
| E3 | SC2 | empty | criterion SC2 | component checked but no signal cause (plain fields, decorator `@Input()`, `Eager`) -> chain names the trigger and says "no signal cause" (`Eager`: "checked because Eager"), per feature-proposals N1 |
| E4 | SC1 | ordering | held-out | a cycle has one trigger; when it checks several components, keep the profiler's event order (sequential, no ties); no name-based tie-break |
| E5 | SC3 | boundary | criterion SC3 | Prompt API unavailable -> deterministic chain still shows; explain button disabled with the availability reason; `downloadable` counts as unavailable in this milestone; download from the panel is deferred |
| E6 | SC6 | idempotency | criterion SC6 | no file, manifest entry or import references the removed files, and `npm run check`, `npm test`, build-extension and the extension-panel check pass |
| E7 | SC2 | boundary | criterion SC2 | no `ng.ɵsetProfiler` on the page (production build, non-Angular page, or Zone.js app) -> panel shows "not supported" with the reason; no recording, no model call |
| E8 | SC4 | empty | criterion SC4 | no recorded cycles on the fixture -> browser test asserts the panel reports "no cycles recorded" |
| E9 | SC5 | boundary | criterion SC5 | a browser/instance where Prompt API is unavailable -> panel shows the availability reason and disables explain; the deterministic chain still renders |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC3 | send signal values or any page/user data in the prompt; the prompt carries only the shaped fact list (component names, signal labels, trigger kinds); the prompt and the answer never leave the extension (no page, content-script or service-worker messaging of either) | judgment | final reviewer checks no page/content/SW messaging of prompt or answer |
| N2 | SC5 | require feature flags for the panel's own Prompt API in the four supported browsers | criterion SC5 | runs must pass with `--no-ai-features` |
| N3 | SC1 | change the app while recording: must not run Angular's `angular:di_graph` tool or call `getViewContainerRef()`/`ViewContainerRef` on component hosts, which removes the template node from the signal graph (docs/filing-ledger.md item 1) | judgment | final reviewer checks no `getViewContainerRef` / di_graph usage in the recorder |
| N4 | SC2 | auto-explain or trigger a model call without an explicit user pick of a component | judgment | final reviewer checks the explain button is the only trigger for a model call |
| N5 | SC4 | substitute a mocked Prompt API or fabricated chain data in the browser test on the fixture | judgment | browser test must exercise the real recorder against `spikes/ng222-app` |
| N6 | SC6 | leave any file, manifest entry or import referencing the removed files | criterion SC6 | grep for `content.js`, `page-script.js`, `nx-welcome`, `PROMPT_API_REQUEST` returns no references |

## Scope: in

- MAIN-world recorder via `ng.ɵsetProfiler` + signal-graph walk producing per-component trigger chain.
- Panel UI: component picker + chain display + explain button + answer.
- Panel-local Prompt API call (no tool calling).
- Removal of dead prompt bridge, `content.js`, `page-script.js`, `nx-welcome.ts`.
- Unit tests for chain walk on recorded data; browser test on `spikes/ng222-app`.

## Scope: out (vetoes)

- No Prompt API in page, content scripts or service worker (panel or a Worker the panel starts only).
- No worker in this milestone (N1 uses none); worker rules stay in feature-proposals §3.7.
- No download flow for `downloadable` models (deferred).
- No `content.js` revival; delete only.
- Do not break existing panel features (Angular version explain, extension messaging, tab filtering).

## Constraints

- Modern Angular: zoneless, standalone, signals, signal inputs, `inject()`.
- TypeScript 6.0.x, Nx 23.3, Angular ~22.1, MV3 Chrome extension.
- Panel Prompt API uses the panel's own `LanguageModel.availability()`, not the page's.
- `npm run check`, `npm test`, build-extension and extension-panel check must pass.

## Current state (brownfield only)

- **What exists**: Nx monorepo, one Angular app emitted as the extension panel; MV3 messaging (relay.js isolated + agent-main.js MAIN); Prompt API session in panel; `UpdateCauseService.record()` has no callers (stub).
- **Must not break**: extension messaging, tab filtering, panel-local Prompt API security model, sidecar deps bridge.
- **Doc-vs-code rulings**: none pending (docs audit: 2 verified, 0 stale).
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check (researched).
- How to map a profiled component to its node in the signal graph for the trigger walk (researched).
- Availability/downloadability behavior of `LanguageModel` across the four supported browsers with and without feature flags (researched).
- Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers (researched).
- Model may produce unusable output on smaller models (Gemini Nano); prompt must stay a short fact list.

## Open questions

- [RESEARCH] Exact shape of the `ng.ɵsetProfiler` callback and which profiler events identify a component check.
- [RESEARCH] How to map a profiled component to its node in the signal graph for the trigger walk.
- [RESEARCH] Availability/downloadability behavior of `LanguageModel` across the four supported browsers with and without feature flags.
- [RESEARCH] Which profiler events correspond to "checked because Eager" vs. signal/zone/event triggers?
- [NEEDS-USER] Confirm final wording of the "no signal cause" chain in the panel.

## Corrections

- 2026-10-19: user approved define with adjustments (SC1 recording starts on panel open / resets on reload; SC2 component picker; SC4 exact chain + no-signal-cause; E1–E6; N1/N3/N4; deletions deferred to build).