# Intent — angular-ai-devtools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: standard

Review panel: off

Finding skeptics: off

Surfaces: DevTools panel (Angular AI tab)

## Summary

Build feature N3, "DI doctor", in the existing Nx Angular workspace and
MV3 extension. The DI doctor answers "why do these two components get
different service instances?" and "where would this token resolve from
here?" by tracing dependency-injection resolution paths with
`ng.ɵgetInjector*` tools, diffing two paths, and asking the panel-local
on-device model to explain. Done means: DI path tracing works on the
counter fixture; the panel renders resolution paths and model explanations
in all four supported browsers; N1 and N2 features remain intact.

## Problem

Angular's existing panel (N1 change-detection causality, N2 signal
provenance) does not trace the DI resolution path from a component to the
injector that provides a token, nor compare two components' paths. A
developer asking "why does this component get a different
CartService instance than that one?" or "where would AUTH_CONFIG resolve
from here?" gets no answer. N3 adds deterministic DI path tracing plus
on-device LLM explanation, reusing the same architecture as N1 and N2:
MAIN-world reads, panel-local Prompt API, deterministic diff, short fact
list to the model.

## Users

Angular developers debugging DI scope issues in the DevTools panel;
technical. They use the existing "Angular AI" panel today for
change-detection causality (N1) and signal provenance (N2).

## Success criteria

1. The MAIN-world script computes DI resolution paths for selected
   components via `ng.ɵgetInjector*` APIs, recording each injector
   boundary and provider record.
2. The panel displays the resolution path for a selected component,
   showing injector boundaries and the provider record for the queried
   token.
3. The panel compares two components' resolution paths and shows where
   they diverge (the first injector holding a different provider for the
   token).
4. The panel asks the panel-local Prompt API to explain the resolution
   path or the divergence, sending only a short fact list (no tool
   calling in the core loop).
5. Unit tests for DI path computation on recorded data; browser test on
   `spikes/ng222-app`.
6. `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension`
   pass with no regressions to N1 or N2.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | empty | criterion SC1 | no `ng.ɵgetInjector*` available -> panel shows "not supported" with reason; no model call |
| E2 | SC1 | boundary | criterion SC1 | component not found -> "not found"; no model call |
| E3 | SC2 | boundary | criterion SC2 | token not found on the path -> panel shows the full resolution path but marks the token as "no provider record on this path"; no model call |
| E4 | SC3 | boundary | criterion SC3 | paths identical -> panel shows "same resolution path" and no divergence marker; explain button still available for the shared path |
| E5 | SC4 | boundary | criterion SC4 | Prompt API unavailable -> deterministic paths and diff still render; explain button disabled with availability reason |
| E6 | SC6 | idempotency | criterion SC6 | no regressions to N1 or N2; all existing checks pass |
| E7 | SC5 | boundary | criterion SC5 | test fixture has at least two injector levels (component-level + root providers) so the path trace and diff have a divergence point; a single-injector fixture cannot prove the diff |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC4 | send provider lists or full DI trees in the prompt | judgment | final reviewer checks only the diff (~200 tokens) is sent |
| N2 | SC4 | auto-explain or trigger a model call without explicit user action | judgment | final reviewer checks explain button is the only trigger |
| N3 | SC6 | break existing N1 or N2 features | criterion SC6 | regression tests pass |
| N4 | SC1 | change the app while tracing | judgment | final reviewer checks read-only `ɵgetInjector*` calls only, no writes to page state |
| N5 | SC3 | omit divergence point or show incomplete path | criterion SC3 | panel shows all injectors and the first divergence |
| N6 | SC2 | omit any injector boundary in the resolution path display | criterion SC2 | panel shows all injectors from the component to root |
| N7 | SC5 | use mocked DI data instead of real recorded graph data in tests | criterion SC5 | tests run against real `ng.ɵgetInjector*` recordings on `spikes/ng222-app` |

## Scope: in

- MAIN-world DI path tracer via `ng.ɵgetInjector*` producing resolution
  paths with injector boundaries and provider records.
- DI lookup for a specific token on a path.
- Path diff comparison for two components (first divergence point).
- Panel UI: component picker + path display + diff view + explain button
  + model answer.
- Panel-local Prompt API call (no tool calling in the core loop).
- Unit tests for DI path computation on recorded data; browser test on
  `spikes/ng222-app`.

## Scope: out (vetoes)

- No Prompt API in page, content scripts or service worker (panel only).
- No worker in this milestone.
- No download flow for `downloadable` models (deferred).
- Do not break existing panel features (N1, N2, version explain,
  extension messaging, tab filtering).
- No new Tier 2 (app opt-in) features.
- Does not support injection flags (@Self/@SkipSelf/@Host/@Optional) or
  viewProviders visibility (accepted drift; proposals §4.6).
- Does not support `providedIn: 'any'` tokens (accepted drift; proposals §4.6).

## Constraints

- Modern Angular: zoneless, standalone, signals, signal inputs, `inject()`.
- TypeScript 6.0.x, Nx 23.3, Angular ~22.1, MV3 Chrome extension.
- Panel Prompt API uses the panel's own `LanguageModel.availability()`.
- `npm run check`, `npm test`, build-extension and extension-panel check
  must pass.
- Tier 0 (`getInjector`) + 1 (injector functions) allowed, labelled and
  feature-detected per Decision 1.
- No code generation (Lars's ruling, 2026-10-12).
- Edge pinned to Aion model/runtime 2026.10.2.1.

## Current state (brownfield only)

- **What exists**: Nx monorepo with one Angular app emitted as the
  extension panel; MV3 messaging; Prompt API session in panel; N1
  (change-detection causality) shipped in M004; N2 (signal provenance)
  shipped in M005/M006; `di_path`/`di_lookup` tools specified in
  proposals but not yet implemented.
- **Must not break**: N1 change-detection causality, N2 signal provenance,
  version explanation, extension messaging, tab filtering, panel-local
  Prompt API security model, sidecar deps bridge.
- **Doc-vs-code rulings**:
  - AGANTS.md line 59 says `npm ci` is required for TypeScript pinning
    verification but task instructions say "run `npm ci`" without when.
    Ruling: **fix-doc** — use `npm ci` for clean installs and when
    `node_modules/typescript` reports 7.x (stale install); `npm install`
    when adding new dependencies.
  - AGANTS.md line 85 says manual `mklink /J` junction is needed for
    legacy sidecars. Ruling: **accept-drift** — the automated bridge
    (`scripts/sidecar-deps-bridge.mjs`) covers all modern sidecars; the
    manual junction mention stays as legacy-only fallback documentation.
- **Ground truth**: `.project/research/evidence-codebase.md`,
  `.project/research/DOCS-AUDIT.md`

## Risks

- Exact shape of `ng.ɵgetInjector*` APIs and how to map injectors to
  provider records.
- Which DI questions are answerable from the tools alone vs. needing
  additional page-agent data.
- Injection flags (@Self, @SkipSelf, etc.) and viewProviders visibility
  not supported (proposals §4.6).
- Model may produce unusable output on smaller models (Gemini Nano);
  prompt must stay a short fact list.

## Open questions

- [RESEARCH] Exact shape of `ng.ɵgetInjector*` APIs and what data they return per injector.
- [RESEARCH] Which DI questions are answerable from the tools alone vs. needing additional page-agent data.
- [NEEDS-USER] Confirm final set of DI questions to support (path trace, two-component diff, token lookup, NullInjectorError recovery).

## Corrections

- 2026-10-27: M007 scope is N3 (DI doctor), not N1. N1 was shipped in
  M004 per M006 INTENT.md Current state and M004 MANIFEST. Next in
  priority order: N4 (error explainer), then N24 and N25.
