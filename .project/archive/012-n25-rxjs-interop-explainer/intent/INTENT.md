# Intent — Angular AI DevTools (M012)

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel

## Summary

Build the RxJS interop explainer (N25) in the Angular AI DevTools panel: identify the interop call behind a `toSignal` source and the effects the signal graph cannot label, slice their direct producers and consumers out of `ng.ɵgetSignalGraph`, and explain that chain with the panel-local on-device model. The panel must say plainly that it cannot name the feeding Observable, the operator chain, or emission timing, because no edge crosses the Observable. Panel-side attribution of a field to a graph node is value-based and ships only as "inferred, untested". Derived from ROADMAP.md entry M012 in program flow, with the program charter's vetoes and constraints inherited unchanged.

## Problem

A developer reading a `toSignal()` source in a zoneless Angular app sees a signal with no useful provenance: `ng.ɵgetSignalGraph` labels the interop node (`toSignal.source`, `toSignal.state`) but cannot see through the Observable, and an effect fed by a `Subject` arrives unlabelled. Today N2 (signal provenance) explains signal-to-signal chains but stops at exactly this boundary, so the most common RxJS-to-signal bridge in a modern Angular app is the one place the panel has nothing to say.

## Users

Lars, working in the DevTools panel against a dev-mode Angular 22.2 app (the counter fixture, and the insurance portal where its routes can produce the facts). One technical user; no multi-user concerns.

## Success criteria

1. On the counter fixture's dev-only interop route, the panel identifies a `toSignal` source/state node and an unlabelled effect whose `debuggableFn` contains `subject.error`, and slices their direct producers/consumers.
2. The panel states that it cannot name the feeding Observable, the operator chain, or emission timing.
3. Field-to-node attribution is worded "inferred, untested".
4. The interop keep-list keeps `toSignal.*` nodes on top of the existing library-internal filter.
5. The panel explains the slice using the panel-local Prompt API, sending only a short fact list.
6. lars-verify verdict of verified for the interop claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | criterion SC1 | A page with no `toSignal` node, or no unlabelled effect, renders the panel's existing explicit empty state instead of a slice; SC1 covers the negative case the same way N24's stale-view route does |
| E2 | SC1 | adjacency | held-out | Two `toSignal` nodes in one page produce two independent slices, never merged into one; a named test pins that the slice list has one entry per source node and that two nodes with equal labels stay separate |
| E3 | SC2 | boundary | criterion SC2 | The limitation wording is present on every interop explanation, including when the slice is empty or truncated to one producer/consumer |
| E4 | SC3 | precision | held-out | When two fields hold the same value, attribution must not claim a single match: the row stays "inferred, untested" and lists every candidate; a named test pins that wording and the multi-candidate case |
| E5 | SC4 | boundary | held-out | A node whose label is absent but whose `debuggableFn` source contains `subject.error` is still kept, and a library-internal node that matches neither rule is still filtered; a named test pins both directions of the classifier |
| E6 | SC5 | concurrency | criterion SC5 | A model pair that cannot answer records its own could-not-run result; the verdict is `verified` only when all four pairs answer, so a partial run cannot be read as proof |
| E7 | SC6 | boundary | criterion SC6 | A check that names a portal route which does not resolve fails the coverage test rather than silently passing |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC2 | name a feeding Observable, an operator, or an emission time it inferred from field names or ordering | criterion SC2 | The limitation wording is the check: an explanation that names any of the three contradicts SC2 |
| N2 | SC5 | report a model pair as verified without a retained `verdict.json` for that pair | judgment | The final reviewer looks for one retained verdict per pair and reads each one's recorded result rather than trusting the summary line |
| N3 | SC4 | widen the keep-list to arbitrary library-internal nodes to make a fixture pass | judgment | The reviewer reads the classifier's two rules (label, `debuggableFn` source) and checks that no third, fixture-shaped exception was added |
| N4 | SC6 | change insurance-portal source beyond the dev-only provider file and the dev build configuration that loads it | criterion SC6 | SC6's diff assertion covers it: the portal diff contains no other file |
| N5 | SC1 | present the unlabelled effect as the Observable that feeds the signal, or otherwise let the user read the slice as an Observable-level explanation | judgment | The reviewer reads the rendered slice and its explanation for any claim that crosses the Observable boundary; the slice must end at the interop node |
| N6 | SC3 | drop the "inferred, untested" wording once a single attribution candidate is found | criterion SC3 | SC3 states the wording unconditionally, so a confident single-candidate label is a contradiction of SC3 rather than a stronger result |

## Scope: in

- Identification of `toSignal.source` / `toSignal.state` nodes and the unlabelled effect whose `debuggableFn` contains `subject.error`.
- Slicing direct producers/consumers from `ng.ɵgetSignalGraph`.
- An explicit keep-list keyed on label (`toSignal.source`, `toSignal.state`) and on `debuggableFn` source containing `subject.error`, on top of the existing library-internal filter.
- Field-to-node attribution by value comparison, shipped as "inferred, untested" wording.
- Panel UI rendering the interop node slice and model explanation.
- The counter fixture's dev-only route: extend the existing `stale-view-fixture.ts` component with `toSignal(this.updates)` and one effect calling `this.updates.error(...)`, so a `toSignal` source/state node and an unlabelled effect whose `debuggableFn` contains `subject.error` both exist on a served page.

## Scope: out (vetoes)

- Naming the feeding Observable, the operator chain, or emission timing — no edge crosses the Observable; this is an intrinsic limit of `ng.ɵgetSignalGraph`.
- Confident claims about field-to-node attribution; the wording stays "inferred, untested".
- No Tier 2 (app opt-in) re-export of RxJS internals.
- No code generation of app code — findings may name a modern Angular pattern and an official schematic only.
- No regression of the shipped N1, N2, N3, N4 or N24 panel flows; their behavior is protected.
- No page or user data beyond the shaped fact list in prompts; no automatic model call.
- No insurance-portal source change of any kind in this milestone; the portal half of the original SC1 is recorded as no-source, because the measured portal checkout has no `Subject` and no `subject.error` in `libs` or `apps`.
- No Firefox or Safari; no NgModule, Zone.js, or Reactive Forms support.

## Constraints

- Stack: TypeScript 6.0.x, Nx 23.3, Angular ~22.1 workspace; inspected apps are Angular 22.2 dev builds (standing guard: 22.1.3+ for the stale-view gate, per N24).
- Architecture: deterministic code computes the facts; the panel-local Prompt API explains a short fact list with no tool calling. The panel uses its own `LanguageModel.availability()`.
- Verification: `control-ai-browsers` drives `chrome-stable-nano`, `chrome-beta-gemma4`, `edge-phi4mini` and `edge-dev-aion`; `verify-ai-browsers` supplies the interop check (already prepared and currently exits 2 until the panel ships `/panel/interop`); `lars-verify` turns the claim into one verdict, and only `verified` counts.
- Portal: the insurance-portal checkout at `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` is used where meaningful; never change its source beyond a dev-only provider file and the dev build configuration that loads it.
- Codebase gates: `npm run check`, `npm test`, and `npx nx run angular-ai-devtools:build-extension` must pass; sidecar dependency bridge for worktree checks.
- Model policy: free routes only; coders run `reflection/beam:free`.
- Delivery surface: the extension panel is the only product surface; the standalone app target stays a developer/test surface.

## Current state (brownfield only)

- **What exists**: an MV3 extension with four execution contexts (service worker, isolated relay, MAIN-world `agent-main.js`, DevTools panel) whose panel is the Nx Angular app built into `extension/panel` by `build-extension`. The MAIN-world agent reads `window.ng` / `ng.ɵgetSignalGraph` and hard-codes Angular 22.x `ProfilerEvent` values; N24 already ships a dedicated `stale-view-worker.js` and a dev-only `stale-view` route in `spikes/ng222-app`. Root `tsconfig.json` type-checks only the pstack installer and plugin template, so a clean root `tsc` does not cover extension or app code.
- **Must not break**: the N1 change-detection chain, N2 provenance chain and anti-patterns, N3 DI path/diff, N4 error explainer, and N24 stale-view finding, all in the panel; `.commandcode`↔`.claude` skill mirror parity; `npm run check`, `npm test`, `build-extension`.
- **Doc-vs-code rulings** (owner delegated by the 2026-10-30 autonomy grant): `accept-drift` for the three interop rows (379, 414, 415) because this milestone makes them true; `fix-doc` for the `control.mjs` line number (386) and the Reactive-Forms claim superseded by Signal Forms (540). All five are recorded in `DOCS-AUDIT.md` `## User rulings`.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- The interop keep-list classifier is unspecified until measured: whether `toSignal.*` is recognisable by label or only by `debuggableFn` source decides the whole detection path.
- Field-to-node attribution by value comparison is inferred and untested; equal values across two fields make it ambiguous.
- N25 shares the MAIN-world page agent and source scan with N2 and N24, so a classifier change can regress them.
- Whether any measured portal route can produce a `subject.error` effect is unresolved: the 2026-10-30 measurement found no `Subject` and no `subject.error` in the portal's `libs` or `apps`.

## Open questions

- [RESEARCH] Whether the interop keep-list classifier can be recognised by label or by `debuggableFn` source.
- [RESEARCH] Which N25 detections beyond the measured direct cases need new instrumentation.

## Corrections

<!-- Verbatim user corrections from playback and later phases. Append-only. -->
- 2026-10-30: "You have full autonomy to make decisions for this milestone."
- 2026-10-30 (rulings exercised under that grant):
  - SC1 is witnessed on the counter fixture's dev-only route, which gains `toSignal(this.updates)` and an effect calling `this.updates.error(...)` inside the existing `stale-view-fixture.ts`; the insurance portal is untouched and the original portal half of SC1 is recorded as no-source.
  - The 7 edge rows and 6 prohibition rows above are accepted as written: E2/E4/E5 are held-out tests, E1/E3/E6/E7 are stated in their criteria, N2/N3/N5 are final-review judgments.
  - Audit rulings: `accept-drift` for rows 379, 414, 415; `fix-doc` for rows 386 and 540.
