# Wave 3 — T003: Render the answer and pin every route table

Task: `.project/tasks/T003-render-the-answer-and-pin-every-route-table.md`
Commit: `ded7a63a` · HEAD under review: `4d4474fff6ee25f59e7fec245cf75871d68bf097`

## Intent coverage

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

The task states its own numbered criteria for SC4 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

- ✅ The task states its own numbered criteria for SC4 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

### Gap E6 — E6: pass

Held out by `scripts/panel-routes.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

### Gap E8 — E8: pass

Held out by `scripts/chunk-failure-copy.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

## Surface contract

The panel surface was walked in the wave-3 review against the plan's `## Surface contract`: the route loads through its `LOADERS` key, the four states render, and no state renders a remedy, a cause or a drift.

## Verification observed

`lars-gsd land` ran this task's `## Verify` and recorded it in `.project/build/verify-ledger.jsonl`. The Ledger row for `ded7a63a` is the receipt; the numbers quoted below come from that run.

Depth: full
Tasks reviewed: 1

## T003 — Render the answer and pin every route table: pass

- ✅ The task landed at the commit this review names, its `## Verify` ran under `lars-gsd land` and the ledger row reads `verify: pass`, and the project verify at `4d4474ff` reports `npm run check` green with 2,167 tests, `fail 0` and `skipped 0`.

Re-landed under the patch: the contract declared `scripts/page-picker.component.spec.mjs`, a name that has never
existed, beside the `.ts` that does. The phantom entry is gone, so this wave's files are the ones the landing
carries: `apps/angular-ai-devtools/src/app/panel-chunk-failure.ts`, `panel-demo.ts`, `app.routes.ts` and the four
route-table pins. `land` now refuses a declaration that neither exists at the base nor appears in the diff, which
is the check that would have refused this one before its Verify ran.
