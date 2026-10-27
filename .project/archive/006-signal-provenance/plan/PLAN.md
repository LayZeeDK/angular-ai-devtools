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

Goal: Tracer returns chain for selected signal on counter fixture -> panel renders single-node chain with "no dependencies" -> explain button disabled with reason when Prompt API unavailable.
Review depth: full

## Wave 3 — panel integration

Goal: Panel renders provenance chain and anti-pattern list; explain button calls panel Prompt API with fact list and shows answer.
Review depth: full

## Wave 4 — browser test

Goal: Browser test on spikes/ng222-app passes in supported browsers.
Review depth: full

## Wave 5 — regression gate

Goal: npm run check, npm test, build-extension pass with no regressions.
Review depth: full

## Surface contract

### DevTools panel — T004

Criteria: SC2, SC3, SC4
Entry: Open Angular AI DevTools panel on spikes/ng222-app
States: empty shows "not supported"/"not found"/"no dependencies"/"no anti-patterns found"; loading shows spinner; error shows reason; success shows chain and anti-patterns
Walkthrough:
1. Select a signal in the panel and observe provenance chain renders with node kind, label, edge direction.
2. Observe anti-pattern list with evidence; click Explain and see answer when Prompt API available.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC2 | T002 | AC1 |
| SC2 | T004 | AC1 |
| SC3 | T003 | AC1 |
| SC3 | T004 | AC1 |
| SC4 | T004 | AC1 |
| SC5 | T005 | AC1 |
| SC6 | T006 | AC1 |

## Dependency notes

T001 (tracer) precedes T002 (chain traversal) and T003 (anti-pattern detector); T004 (panel UI) depends on T002/T003; T005 (browser test) depends on T004; T006 (regression gate) depends on T004.