# PLAN — M063 guard-phase

Milestone: M063 — guard-phase · Branch: gsd-path/M063 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 2

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

Seven waves, seven tasks. T001 records the guard verdicts with their phases, T002 is the pure join, T003 the panel surface with every pin declared, T004 the verdict claims, T005 writes and re-derives this milestone's own records, T006 re-captures the records the last suites moved, and T007 re-derives the gate record and runs the project verify, reporting which of its legs actually ran.

Two amendments this plan carries from M062: every recording a task's Verify writes is declared, including the census that writes it; and the project verify is accepted only when it reaches `test:app` and the held-out corpus, because every earlier run in M062 stopped in the first leg and hid a one-line defect for six waves.

## Waves

## Wave 1 — T001: record the ordered guard verdicts and the phase each ran in

Goal: Record each guard verdict with the phase it ran in, so a cancelled navigation names its guard rather than the nearest console line.
Review depth: full

## Wave 2 — T002: answer from the guard record, purely

Goal: Join the record into four states, with no read of the page and no attribution the record does not carry.
Review depth: full

## Wave 3 — T003: render the answer and pin every route table

Goal: One new panel surface rendering exactly the join object, with every list that enumerates the route table moved in the same commit.
Review depth: full

## Wave 4 — T004: write the verdict claims the census derives

Goal: Record what each criterion claims and which suite proves it, so a verdict is a read rather than a narrative.
Review depth: full

## Wave 5 — T005: re-derive this milestone's own records

Goal: Write the map this milestone owes and re-derive the census that counts it, then read both back unarmed.
Review depth: full

## Wave 6 — T006: re-capture the records the last suites moved

Goal: Re-capture the claims record the plan coverage moved and the stability record the gate mention count moved.
Review depth: full

## Wave 7 — T007: re-derive the gate records and run the project verify

Goal: Capture the tree-derived gate record at this head, then run the project verify and observe it reach its last leg.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T001 | AC3 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC1 | T005 | AC1 |
| SC4 | T005 | AC2 |
| SC1 | T006 | AC1 |
| SC4 | T006 | AC2 |
| SC1 | T007 | AC1 |
| SC4 | T007 | AC2 |

## Held-out checks

- E1 → T002 → `scripts/guard-answer.test.mjs`
- E2 → T002 → `scripts/guard-answer.test.mjs`
- E3 → T002 → `scripts/guard-answer.test.mjs`
- E4 → T002 → `scripts/guard-answer.test.mjs`
- E5 → T002 → `scripts/guard-answer.test.mjs`
- E6 → T003 → `scripts/panel-routes.test.mjs`
- E7 → T003 → `scripts/panel-routes.test.mjs`
- E8 → T003 → `scripts/panel-routes.test.mjs`

## Surface contract

### panel — T003

One new surface, `apps/angular-ai-devtools/src/app/panel-guard-phase.ts`, rendering exactly the five fields the join returns (`state`, `phase`, `guard`, `verdict`, `absences`), one `label: value-the-answer-carries` line per field and one line per absence, with no line for a `null` and no sentence anywhere. It is declared in `app.routes.ts`, has a key in `panel-demo.ts`'s `LOADERS`, a sample fact in `FACTS`, a row in the copy records and a spec. Every list that enumerates the route table moves in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, all three lists in `chat-entry.component.spec.ts`, `panel-routes.test.mjs` and the copy records.
