# PLAN — M065 title-input-binding

Milestone: M065 — title-input-binding · Branch: gsd-path/M065 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

## Waves

## Wave 1 — T001: measure the title strategy and the route-bound data on the portal

Goal: Write the observable — one record per navigation, carrying the strategy class the injector resolved, the activated route's data, the titles observed and when the observation began.
Review depth: full

## Wave 2 — T002: join the title record into four states, purely

Goal: Join the record into `finding`, `agrees`, `cannot-tell` and `no-record`, with no read of the page and no attribution of a write the record did not observe.
Review depth: full

## Wave 3 — T003: render the answer and pin every route table

Goal: Render exactly the join's object in one new panel surface, and move every list that enumerates a surface in the same task.
Review depth: full

## Wave 4 — T004: re-derive the recordings, then run the project verify

Goal: Re-derive the two recordings whose range this milestone moves, then run the project verify until it reaches its last stage.
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
| SC1 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC4 | T003 | AC3 |
| SC2 | T004 | AC1 |
| SC3 | T004 | AC2 |
| SC4 | T004 | AC3 |

## Held-out checks

Every edge this milestone carries is proved by the suite of the task that owns it, and that task's Verify runs that
suite. Nothing is held out: an edge whose proof sits outside the owning task's Verify would need a row here naming the
edge, the task and the test, and there is none.

## Surface contract

### panel — T003

Criteria: SC4

Entry: the panel route 	itle-input, rendered through the 	itle-input key in panel-demo.ts LOADERS, its sample in
FACTS (the join's own answer over 
esearch/raw/m065-title-record.json, re-derived node-side by
panel-demo.spec.ts), and the PANEL_SURFACES entry in pp.routes.ts.

States: inding — the answer names the strategy the injector resolved, the title the document carried and the title the
route implies, and nothing else; grees — the two titles match, rendered as agreement rather than an empty finding (E1);
cannot-tell — the record does not state what the answer asked, naming the reason it states and no cause (E3, E7);

o-record — nothing was captured. No answer names a remedy, a cause, a writer or a strategy the record did not carry
(E4, E8).

## Risks

- The portal may expose no route that binds data, in which case C3's claim narrows and T002's `route-binds-nothing` state
  becomes the whole answer. T001 measures it; the plan is corrected there rather than argued here.
- A title write can happen before the agent attaches on a cold navigation, which is why `cannot-tell` carries a reason
  rather than a default.
- The route-table lists are five, not one; the fourth omission in this programme would be a defect of this plan, so T003
  declares all of them.
- Measured in T002: scripts/chunk-failure-claims.test.mjs fails 2 of 14 at this head because it reads the live
  .project/intent/INTENT.md and .project/plan/PLAN.md, which M064 archived before M065 wrote its own. The suite is
  declared in T003, and T003 carries the repair: reader and document must be re-pointed at the archived milestone, or the
  project verify in T004 cannot be green.

## Rollback

Each task lands its own commit; a defective task is reverted by resetting it to `pending` and re-landing, never by
rewriting a landed commit.
