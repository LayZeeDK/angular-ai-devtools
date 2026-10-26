# Plan — angular-ai-devtools (signal-provenance)

Project verify: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Validate exact `ng.ɵgetSignalGraph` output shape on spikes/ng222-app and confirm Prompt API availability gating.
Review depth: full

## Wave 2 — walking skeleton
Goal: Walking skeleton.
Review depth: full

## Wave 3 — panel integration
Goal: Panel UI.
Review depth: full

## Wave 4 — browser test
Goal: Browser test.
Review depth: full

## Wave 5 — regression
Goal: Regression gate.
Review depth: full

Goal: MAIN-world tracer returns provenance chain for a selected signal on the counter fixture -> panel renders chain + anti-pattern list -> explain button calls panel Prompt API with fact list and shows answer.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC2 | T002 | AC1 |
| SC3 | T003 | AC1 |
| SC4 | T004 | AC1 |
| SC5 | T005 | AC1 |
| SC6 | T006 | AC1 |

## Dependency notes

T001 (tracer) precedes T002 (chain traversal) and T003 (anti-pattern detector); T004 (panel UI) depends on T002/T003; T005 (browser test) depends on T004; T006 (regression gate) depends on all.