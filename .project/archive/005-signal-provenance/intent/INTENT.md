# Intent — angular-ai-devtools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: standard   <!-- standard | quick | milestone — quick: at most two
                      deliverable-sized tasks in one wave, no RESEARCH or
                      NEEDS-USER items, no cross-wave risk; set by define at
                      approval. Quick skips research and decide. Milestone:
                      derived from an approved ROADMAP.md entry in a program;
                      research/decide run only when the entry has open
                      questions. -->

Review panel: off   <!-- off | detected | claude,gpt,grok,composer,gemini,deepseek,kimi,qwen — this
                      milestone's panel setting. In program flow, copy
                      CHARTER.md's durable default and override only when
                      the user says so. off is the default. detected uses
                      advertised host families except the parent, at most 3.
                      Named families are an assertion, at most 3. Quick
                      lane stays off. -->

Finding skeptics: off   <!-- off | on — build spawns one read-only skeptic
                      per blocking deep-review finding before fix tasks
                      are opened; a refuted finding spawns no fix task unless
                      the user explicitly overrides all cycle refutations.
                      off is the default. Quick lane stays off. -->

Surfaces: DevTools panel   <!-- none | comma-separated list of the human-facing
                      surfaces this milestone delivers: a web app, a CLI, an
                      HTTP API. Anything a person opens, sees, or types into
                      is a surface. Use none only when nobody touches this
                      work directly — a library, a migration, internals.
                      Every named surface needs a success criterion
                      observable there and a PLAN.md Surface contract. -->

## Summary

Build feature N2, "Signal provenance and reactive anti-pattern finder", in the existing Nx Angular workspace and MV3 extension. The signal graph pane draws nodes but does not trace or judge them; N2 traces the reactive provenance of a selected signal or component through the signal graph and flags reactive anti-patterns (e.g., reading a signal inside an effect without tracking, untracked writes, missing cleanup). The DevTools panel shows the provenance chain and asks the panel-local Prompt API to explain anti-patterns, sending a short fact list (no tool calling). Done means: provenance tracing works on the counter fixture; at least three anti-patterns are detected and reported with evidence; the panel renders the chain and explanation in all four supported browsers.

## Problem

Angular's signal graph pane (angular:signal_graph) draws nodes but does not trace provenance or judge reactive patterns. A developer asking "why does this computed recompute?" or "is this effect's dependency tracked?" gets no answer. N2 adds deterministic provenance tracing through the signal graph plus on-device LLM explanation of anti-patterns, all running locally in the panel.

## Users

Angular developers debugging reactive data flow in the DevTools panel; technical. They use the existing "Angular AI" panel today for change-detection causality (N1) and version explanation.

## Success criteria

1. The MAIN-world script traces the reactive provenance of a selected signal or component through `ng.ɵgetSignalGraph`, computing the dependency chain (producers -> consumers) deterministically.
2. The panel displays the provenance chain for a user-selected signal or component, showing each node's kind, label, and edge direction.
3. The panel detects at least three reactive anti-patterns (e.g., untracked signal reads in effects, write-after-read in the same effect, computed with side effects) and reports them with evidence (node labels and graph positions).
4. The panel asks the panel-local Prompt API to explain the provenance chain and detected anti-patterns, sending only a short fact list (no tool calling).
5. Unit tests for provenance tracing on recorded graph data; browser test on `spikes/ng222-app`.
6. `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` pass.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | criterion SC1 | no signal graph on the page (production build, non-Angular page) -> panel shows "not supported" with reason; no tracing, no model call |
| E2 | SC2 | empty | criterion SC2 | signal or component not found on the page -> "not found"; no model call |
| E3 | SC1 | boundary | criterion SC1 | selected node has no producers or consumers -> chain shows single node with "no dependencies" |
| E4 | SC3 | empty | criterion SC3 | no anti-patterns detected -> panel shows "no anti-patterns found" and still displays the provenance chain |
| E5 | SC4 | boundary | criterion SC4 | Prompt API unavailable -> deterministic provenance and anti-patterns still show; explain button disabled with availability reason |
| E6 | SC1 | ordering | held-out | graph traversal order follows the profiler's node order (sequential); no name-based tie-break |
| E7 | SC3 | boundary | criterion SC3 | a node that appears in multiple chains is reported once per chain (not deduplicated across selections) |
| E8 | SC5 | boundary | criterion SC5 | browser/instance where Prompt API is unavailable -> panel shows availability reason and disables explain; deterministic provenance and anti-patterns still render |
| E9 | SC6 | idempotency | criterion SC6 | npm run check, npm test, build-extension pass with no regressions to N1 or existing panel features |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC4 | send signal values or any page/user data in the prompt; the prompt carries only the shaped fact list (node kinds, labels, edge directions, anti-pattern names); the prompt and the answer never leave the extension | judgment | final reviewer checks no page/content/SW messaging of prompt or answer |
| N2 | SC4 | auto-explain or trigger a model call without an explicit user selection of a signal or component | judgment | final reviewer checks the explain button is the only trigger for a model call |
| N3 | SC1 | change the app while tracing: must not run Angular's `angular:di_graph` tool or call `getViewContainerRef()` on component hosts | judgment | final reviewer checks no `getViewContainerRef` / di_graph usage in the tracer |
| N4 | SC6 | break existing panel features (N1 change-detection causality, Angular version explain, extension messaging, tab filtering) | criterion SC6 | regression tests pass |
| N5 | SC2 | omit provenance edges or show incomplete chain | criterion SC2 | panel shows all producers and consumers for the selected node |
| N6 | SC3 | report anti-pattern without evidence | criterion SC3 | each reported anti-pattern includes node labels and graph positions |
| N7 | SC5 | trigger model call without explicit user action | criterion SC5 | explain button is the only trigger for a model call |

## Scope: in

- MAIN-world provenance tracer via `ng.ɵgetSignalGraph` producing per-signal/component dependency chain.
- Anti-pattern detector operating on the signal graph (at least 3 patterns).
- Panel UI: signal/component picker + provenance chain display + anti-pattern list + explain button + answer.
- Panel-local Prompt API call (no tool calling).
- Unit tests for provenance tracing on recorded graph data; browser test on `spikes/ng222-app`.

## Scope: out (vetoes)

- No Prompt API in page, content scripts or service worker (panel only).
- No worker in this milestone.
- No download flow for `downloadable` models (deferred).
- Do not break existing panel features (N1, version explain, extension messaging, tab filtering).
- No new Tier 2 (app opt-in) features; N9 WebMCP stretch deferred.

## Constraints

- Modern Angular: zoneless, standalone, signals, signal inputs, `inject()`.
- TypeScript 6.0.x, Nx 23.3, Angular ~22.1, MV3 Chrome extension.
- Panel Prompt API uses the panel's own `LanguageModel.availability()`.
- `npm run check`, `npm test`, build-extension and extension-panel check must pass.
- Tier 1 (`ng.ɵ*`) allowed, labelled and feature-detected per Decision 1.

## Current state (brownfield only)

- **What exists**: Nx monorepo with one Angular app emitted as the extension panel; MV3 messaging (relay.js isolated + agent-main.js MAIN); Prompt API session in panel; N1 change-detection causality (recorder + chain walk + panel UI) shipped in M004; `UpdateCauseService` has callers.
- **Must not break**: N1 change-detection causality, extension messaging, tab filtering, panel-local Prompt API security model, sidecar deps bridge.
- **Doc-vs-code rulings**: none pending (docs audit: 5 verified, 0 stale).
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Exact shape of `ng.ɵgetSignalGraph` output and how to map nodes to components (researched in N1).
- Which anti-patterns are detectable from the signal graph alone (needs research).
- Availability/downloadability behavior of `LanguageModel` across supported browsers (researched in N1).
- Model may produce unusable output on smaller models (Gemini Nano); prompt must stay a short fact list.

## Open questions

- [RESEARCH] Which reactive anti-patterns are detectable from the signal graph alone and how to classify them.
- [RESEARCH] How to map signal graph nodes to components for the provenance chain (reuse N1's mapping or new).
- [RESEARCH] Prompt shape for anti-pattern explanation on small models.
- [NEEDS-USER] Confirm final set of anti-patterns to detect.

## Corrections

- 2026-10-23: AFK mode — define M005 as N2 (Signal provenance and reactive anti-pattern finder), next feature in the first-release priority order after N1.



