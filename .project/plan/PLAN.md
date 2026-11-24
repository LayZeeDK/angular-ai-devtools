# PLAN — M066 schema-disabled-hidden

Milestone: M066 — schema-disabled-hidden · Branch: gsd-path/M066 · Baseline: `main` at binding (`9e1139c3`)

## Config

review_panel: off
finding_skeptics: off

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

## Waves

## Wave 0 — T005: re-measure the shape map

Goal: Re-measure 
esearch/raw/m055-record-shapes.json for the verdict-claims record the M066 rebind un-excused, and
restate the two pins that encode the same measurement, so the project verify has a true reading to compare against.
Review depth: full

## Wave 1 — T001: measure a schema-disabled field on the portal and record what the page states

Goal: Write the observable — one record carrying the disabled and hidden field states the page reports, the schema holder
the injector resolved or its absence with a reason, and the input each node read — before any criterion claims it is
provable.
Review depth: full

## Wave 2 — T002: join the schema record into four attribution states, purely

Goal: Join the record into `declared`, `no-node`, `no-record` and `cannot-tell`, with no read of the page and no
attribution the record does not carry, and one list of fields asserted through a proxy that throws on a write.
Review depth: full

## Wave 3 — T003: render the attribution and pin every enumerating list

Goal: Render exactly the join's object in one new panel surface, and move the route, the loader key, the ordered path
pins, the surface record and the fixture census in the same task.
Review depth: full

## Wave 4 — T004: re-derive the recordings, then run the project verify

Goal: Re-derive the three recordings whose range this milestone moves, then run the project verify until its last stage
is green, so a red build cannot reach ship.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T001 | AC1 |
| SC2 | T005 | AC1 |
| SC3 | T005 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC2 | T003 | AC2 |
| SC3 | T001 | AC2 |
| SC3 | T003 | AC1 |
| SC4 | T003 | AC3 |
| SC4 | T004 | AC1 |
| SC2 | T004 | AC2 |

## Held-out checks

Every edge this milestone carries is proved by the suite of the task that owns it, and that task's Verify runs that
suite. Nothing is held out: an edge whose proof sits outside the owning task's Verify would need a row here naming the
edge, the task and the test, and there is none.

## Project verify

`node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test` —
run by the last task to land.
