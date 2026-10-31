# Plan — Angular AI DevTools (M013 — docs-audit-closure)

Project verify: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --test scripts/skills-mirror.test.mjs`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: prove the re-derived verdicts for the 45 settleable and 92 not-settleable unverifiable rows can be recorded from static repository evidence alone without touching product behaviour; if any row requires a product change, SC1/SC3 fail and the plan changes.
Review depth: full

## Wave 2 — correction slice

Goal: correct every stale and aspirational claim in its own document, leaving verified sentences byte-identical (E4), in three independent per-document tasks.
Review depth: verify-only

## Wave 3 — alignment queue closure

Goal: apply the eleven ruled fix-doc alignment-queue rows that were never worked, plus record the re-derive/not-settleable verdicts already established in wave 1.
Review depth: verify-only

## Wave 4 — audit regeneration and ship gate

Goal: regenerate the docs audit at the shipped head with the delta rule, run the audit gate, and run the project Verify plus the skills-mirror test.
Review depth: verify-only

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T007 | AC1 |
| SC1 | T009 | AC1 |
| SC2 | T002 | AC1 |
| SC2 | T003 | AC1 |
| SC2 | T004 | AC1 |
| SC3 | T001 | AC1 |
| SC3 | T006 | AC1 |
| SC3 | T005 | AC1 |
| SC3 | T009 | AC3 |
| SC4 | T008 | AC1 |

## Dependency notes

- T001 has no deps; it is the wave-1 risk burn-down.
- T002, T003, T004 are independent (disjoint files) and share no data.
- T005 depends on T001 (consumes the re-derived verdict classification for the alignment rows).
- T007 depends on T002, T003, T004, T005 (all corrections must land before regeneration).
- T008 depends on T007 (project Verify runs after the audit gate passes).