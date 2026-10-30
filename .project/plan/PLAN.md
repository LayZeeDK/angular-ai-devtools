# Plan — angular-ai-devtools (M011 n24-stale-view-finder)

Project verify: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Re-prove the M010 ledger entries (T002, T005, T011, T012) at the current head and apply the accepted doc-fix alignment rows before any N24 code; if the repair fails, the milestone stops here.
Review depth: full

## Wave 2 — stale-view detection core

Goal: Agent-side `debuggableFn` source scan with the Angular 22.1.3 gate, plain-field confirmation, and the superseding scan worker produce a deterministic ordered finding list; if detection fails, the panel has nothing to render.
Review depth: full

## Wave 3 — panel surface

Goal: The DevTools panel renders the hedged finding and explains it from the three-fact list via the panel-local Prompt API.
Review depth: full

## Wave 4 — verification

Goal: The stale-view claim carries `lars-verify` verdicts across all four model instances and the portal check, over an extension that builds.
Review depth: verify-only

## Surface contract

### DevTools panel — T005

Criteria: SC4
Entry: Open the Angular AI DevTools panel on an inspected page, select the stale-view finder surface.
States: empty ("no stale-view findings"), unsupported (Angular version named), unavailable (graph destroyed), loading (scan in progress), success (one hedged finding row plus Explain button), error (named missing fact, no Prompt API call).
Walkthrough:
1. Load `spikes/ng222-app` with a plain field written in a subscribe callback and open the panel.
2. Confirm the finding reads "the template may show a stale value" and names the field and owning component.
3. Click Explain and confirm the model answer completes using only the three-fact list.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T003 | AC1 |
| SC2 | T003 | AC2 |
| SC3 | T004 | AC1 |
| SC4 | T005 | AC1 |
| SC5 | T006 | AC1 |
| SC6 | T006 | AC2 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T003 | tests/held-out/stale-view-version-gate.test.mjs |
| E3 | T003 | tests/held-out/stale-view-write-regex.test.mjs |
| E4 | T003 | tests/held-out/stale-view-ordering.test.mjs |
| E5 | T003 | tests/held-out/stale-view-dedup.test.mjs |
| E6 | T004 | tests/held-out/stale-view-worker-supersession.test.mjs |
| E8 | T005 | tests/held-out/stale-view-fact-list-escaping.test.mjs |

## Dependency notes

- T004 depends on T003: the worker consumes the scan result shape (`StaleViewFinding[]`) and the Angular-version gate outcome defined by T003; no worker work can start before that seam is settled.
- T005 depends on T003 and T004: the panel renders findings from the worker output and shapes the three-fact list from `StaleViewFinding`, so both upstream seams must land first.
- T006 depends on T005 and T007: verification walks the panel surface delivered by T005, and the browser drive needs an extension that builds — T007 removes the `TS2345` errors that made `build-extension` fail, so T006 cannot produce a verdict before T007 lands.
- T007 depends on T003: it repairs the type errors in the module T003 landed, so it starts from a tree that contains that module.
- T008 depends on T005 and T006 depends on T008: the panel driver must expose a `stale-view` feature before the four-instance verification can drive it; without that path every pair is could-not-run.
- T002 (doc fixes) is independent of the N24 chain and runs in wave 1 alongside the ledger repair.