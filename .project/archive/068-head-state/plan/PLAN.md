# PLAN — M068 head-state

Milestone: M068 — head-state · Branch: gsd-path/M068 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 3

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

Plan patch 2026-11-25: the project verify moved from T006 to T009, because T006 writes the claims record and that record moves the census, the stability record and three shape maps — ten tests went red at the first project verify for exactly that reason. Three tasks re-derive what it moved before the verify runs.

Plan patch 2026-11-25 (second): the census moved again because T008 edited a pinned suite after T007 captured it — four tests red at the project verify, `suiteDiff.differing[67].addedLines` 576 to 816. The tail is re-cut so the census is captured after the last suite edit and the stability record after the census: T009 the census, T010 the stability record, T011 the project verify.

## Waves

## Wave 1 — T001: measure the head entries and the navigations beside them

Goal: Write the record this milestone joins, from the portal, with the default run read-only and the writer refusing a
candidate its own pin rejects.
Review depth: full

## Wave 2 — T002: join the observed entry against the entry still present

Goal: One pure join that tells a current entry from a duplicated or stale one and refuses to name a writing navigation it
was not given.
Review depth: full

## Wave 3 — T003: one panel surface, every pin moved with it

Goal: Render exactly what the join returns on one route, with the route table, loader map, surface record and ordered pins
in the same landing.
Review depth: full

## Wave 4 — T004: re-derive the census and stability recordings

Goal: Re-derive the two recordings that count the tree and the range, each through its own arm.
Review depth: full

## Wave 5 — T005: re-derive the shape maps

Goal: Re-derive the two maps that count the records and the edge vocabulary the new files move.
Review depth: full

## Wave 6 — T006: the milestone verdict claims

Goal: Capture this milestone's claim record and give the new suite its reason row.
Review depth: full

## Wave 7 — T007: re-derive the census and the stability record

Goal: Re-derive the two recordings the claims record moved, each through its own arm.
Review depth: full

## Wave 8 — T008: re-derive the shape maps and the edge vocabulary

Goal: Re-derive the shape maps and move the vocabulary pin the eight edges move.
Review depth: full

## Wave 9 — T009: re-derive the census after the last suite edit

Goal: Capture the census after the last landing that edits a pinned suite, and default-run it.
Review depth: full

## Wave 10 — T010: re-derive the stability record

Goal: Capture the record that pins each gate's exit code, after the census it reads is green.
Review depth: full

## Wave 11 — T011: the project verify at the final head

Goal: Run the plan's project verify from a landing that changes nothing the recordings count.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T001 | AC1 |
| SC3 | T001 | AC3 |
| SC4 | T003 | AC1 |
| SC4 | T003 | AC2 |
| SC4 | T004 | AC1 |
| SC4 | T005 | AC1 |
| SC4 | T006 | AC3 |
| SC4 | T007 | AC1 |
| SC4 | T008 | AC1 |
| SC4 | T009 | AC1 |
| SC4 | T010 | AC1 |
| SC4 | T011 | AC1 |

## Surface contract

### panel — T003

Entry: the panel's `head` route, reached from the pane picker like every other surface, under
`apps/angular-ai-devtools/src/app/app.routes.ts`.

States: the four states the join returns, rendered as it returns them.

Criteria: SC4

Walkthrough:

1. Open the `head` route from the pane picker on a page whose head the app wrote.
2. The pane names the state the record reports, the entry it observed and the entry still present.
3. When the record carries a writing navigation, the pane names it; when it does not, the pane states that absence and
   names no route.

## Held-out checks

Nothing is held out: every edge the intent declares is proved by the suite of the task that owns it, and that task's
Verify runs that suite. `plan-lint` refuses a row here for an edge a task already proves, so the absence is the
requirement rather than an omission.
