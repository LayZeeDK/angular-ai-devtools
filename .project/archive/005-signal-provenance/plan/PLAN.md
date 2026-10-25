# Plan — angular-ai-devtools (feature N2: Signal provenance and reactive anti-pattern finder)

Project verify: `npm ci && npm run check && npm test && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npx nx test angular-ai-devtools --skip-nx-cache`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: prove the plan-invalidating risks before any panel UI lands: component enumeration + per-component graph aggregation without `angular:di_graph`/`getViewContainerRef`, id-resolved edge serialization, profiler-node-order traversal (E6), the four anti-pattern rules on recorded graph data, two-snapshot false-positive mitigation, and graph-unavailable handling. If any fails, the tracer or detector is redesigned before Wave 2.

Review depth: full

## Wave 2 — walking skeleton

Goal: a running end-to-end slice: the MAIN-world tracer feeds per-component graphs to the panel, the panel lists signals/components, shows the provenance chain (kind, label, edge direction) for a selection, runs the four anti-pattern rules, and explains via the panel-local Prompt API fact list (disabled with reason when unavailable). Browser test on `spikes/ng222-app` proves the chain and ≥3 anti-patterns.

Review depth: full

## Wave 3 — regression and hardening

Goal: verify no regression to N1 change-detection causality, extension messaging, tab filtering, or panel-local Prompt API security; confirm the full gate (npm run check, npm test, build-extension) passes.

Review depth: verify-only

## Surface contract

### DevTools panel — T004

Criteria: SC2, SC3, SC4
Entry: open Chrome DevTools on the inspected tab, select the "Angular AI" panel (`extension/devtools.html` → `devtools.js` → panel at `panel/index.html`); use the signal/component picker.
States:
- empty: "no components recorded" until a change-detection cycle has checked a component since recording started (page reload resets recording)
- loading: "checking…" while `LanguageModel.availability()` is being read
- error: availability reason string shown; explain button disabled; deterministic chain and anti-patterns still render
- success: picker lists checked components; selected component shows its provenance chain (kind, label, edge direction) and anti-pattern findings with node labels and positions; explain button returns an answer
Walkthrough:
1. Load `spikes/ng222-app`, open the Angular AI panel; confirm recording starts and "no components recorded" shows before interaction.
2. Click the counter button; confirm the picker lists `app-counter` and selecting it shows the provenance chain with at least one producer and one consumer edge.
3. Confirm at least three anti-pattern findings render with node labels and graph positions.
4. Click Explain; confirm a single model call occurs and the answer renders; repeat on an unchanged selection and confirm no second model call (cache).
5. Run on a profile where Prompt API is unavailable; confirm chain and findings render and the explain button shows the availability reason.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC1 | T002 | AC2 |
| SC2 | T002 | AC3 |
| SC2 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC3 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC3 | T003 | AC3 |
| SC3 | T004 | AC3 |
| SC4 | T004 | AC4 |
| SC4 | T004 | AC5 |
| SC5 | T002 | AC4 |
| SC5 | T003 | AC4 |
| SC5 | T005 | AC1 |
| SC6 | T006 | AC1 |
| SC6 | T006 | AC2 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E6 | T002 | apps/angular-ai-devtools/src/app/signal-provenance.spec.ts |

## Dependency notes

- T002 depends on T001: it consumes the serialized per-component graph shape (nodes with global string `id`, edges resolved to node ids) defined in T001's Interface contract.
- T003 depends on T001: it consumes the same serialized graph shape and the graph-unavailable (missing `template` node) distinction.
- T004 depends on T001/T002/T003: the panel consumes the recorded cycle shape (T001), the provenance traversal function (T002), and the anti-pattern detector (T003).
- T005 depends on T004: the browser test drives the panel UI delivered by T004.
- T006 depends on T001/T002/T003/T004/T005: the regression gate runs after all feature tasks land.