# PLAN — M062 outlet-explainer

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 2

## Goal

The panel answers why routed content appeared in the wrong outlet, or in none, naming the outlet the route requested,
the name the router state matched and the route path — or stating the absence the state cannot fill. Six waves, six
tasks: T001 records the outlet names the router state carries, T002 is the pure join, T003 the panel surface and its
pins, T004 the verdict claims, T005 re-derives this milestone's own records, T006 re-derives the two gate records, and T007 re-derives the six recordings the manifest line moved and runs the
project verify last.

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

## Wave 1 — T001: record the outlet each route requests and the name the state matched

Goal: write the record this milestone joins against, from the router state the agent already reads, so that a name is a
recorded field rather than an inference.
Review depth: full

## Wave 2 — T002: answer from the outlet record, purely

Goal: join the record into four states — `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`,
`cannot-tell` — with no read of the rendered tree and no remedy.
Review depth: full

## Wave 3 — T003: render the answer and pin every route table

Goal: one new panel surface rendering exactly the join's object, with its loader key, route-table pin and copy record
moved in the same task.
Review depth: full

## Wave 4 — T004: write the verdict claims the census derives

Goal: record what each criterion claims and the suite that proves it, so a verdict is a read rather than a narrative.
Review depth: full

## Wave 5 — T005: re-derive this milestone's own records

Goal: re-capture the records this milestone writes, after the last suite edit it makes.
Review depth: full

## Wave 6 — T006: re-derive the gate records and run the project verify

Goal: capture both gate records at this head, read them back, and run the project verify so no stale derivation can
reach the final review.
Review depth: full

## Wave 7 — T007: re-derive the records the manifest line moved and run the project verify

Goal: re-derive the six recordings that cite `extension/manifest.json` at or below the line T001 added, including
the teardown census whose citations point into the gate record, then run the project verify and record it.
Review depth: full

## Wave 8 — T008: re-derive the remaining records and run the project verify

Goal: re-derive the three recordings left after wave 7 — including the teardown census whose citations point into
the gate record — then run the project verify and record it.
Review depth: full

## Wave 9 — T009: re-capture the two records the repair waves moved and run the project verify

Goal: re-capture the claims record whose quotes follow the plan's coverage table and the stability record whose
mention count follows the gate, then run the project verify and record it.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T001 | AC3 |
| SC2 | T002 | AC2 |
| SC3 | T001 | AC1 |
| SC3 | T002 | AC3 |
| SC4 | T003 | AC1 |
| SC4 | T003 | AC2 |
| SC1 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC1 | T005 | AC1 |
| SC4 | T005 | AC2 |
| SC1 | T006 | AC1 |
| SC4 | T006 | AC2 |
| SC1 | T007 | AC1 |
| SC4 | T007 | AC2 |
| SC1 | T008 | AC1 |
| SC4 | T008 | AC2 |
| SC1 | T009 | AC1 |
| SC4 | T009 | AC2 |

## Held-out checks

- E1 → T002 → `scripts/outlet-answer.test.mjs`
- E2 → T002 → `scripts/outlet-answer.test.mjs`
- E3 → T002 → `scripts/outlet-answer.test.mjs`
- E4 → T002 → `scripts/outlet-answer.test.mjs`
- E5 → T001 → `scripts/outlet-state.test.mjs`
- E6 → T003 → `scripts/panel-routes.test.mjs`
- E7 → T002 → `scripts/outlet-answer.test.mjs`
- E8 → T002 → `scripts/outlet-answer.test.mjs`
