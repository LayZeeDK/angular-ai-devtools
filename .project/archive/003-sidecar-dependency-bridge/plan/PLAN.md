# Plan — angular-ai-devtools

Project verify: `npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Prove the two plan-invalidating risks before any integration work — automatic dependency bridging for verify sidecars (junction reuse, fail-fast, safe teardown) and relocation of git-ignored runtime artifacts with lossless migration/fallback read. If either fails, the milestone scope changes.

Review depth: full

## Wave 2 — walking skeleton

Goal: Integrate the bridge and relocated artifact paths, update AGENTS.md and skill docs, and prove a fresh sidecar runs `npm run check` and `npm test` (296/296) with no manual step plus all control-skill checks.

Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T003 | AC2 |
| SC4 | T002 | AC1 |
| SC5 | T003 | AC3 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T001 | scripts/sidecar-deps-bridge.test.mjs::reuse-if-correct |
| E2 | T001 | scripts/sidecar-deps-bridge.test.mjs::fail-fast-missing-primary |
| E3 | T002 | .claude/skills/control-ai-browsers/scripts/control.test.mjs::fallback-read-old-path |
| E5 | T001 | scripts/sidecar-deps-bridge.test.mjs::rerun-reuses-bridge |

## Dependency notes

- T003 depends on T001 and T002 because it documents and integrates both the dependency bridge and the relocated artifact paths; it also updates `.gitignore` for the new artifact home. No other ordering constraint exists — T001 and T002 are independent (disjoint file scopes).