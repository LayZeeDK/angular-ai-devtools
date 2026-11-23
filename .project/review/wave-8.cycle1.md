# Wave 8 — T008: Re-derive the gate record, then run the project verify

Task: `.project/tasks/T008-re-derive-the-gate-record-then-run-the-project-verify.md`
Commit: `4d4474ff` · HEAD under review: `4d4474fff6ee25f59e7fec245cf75871d68bf097`

## Intent coverage

### SC1 — SC1: pass

The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

### SC4 — SC4: pass

The task states its own numbered criteria for SC4 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

## Surface contract

No surface is declared for this wave.

## Verification observed

`lars-gsd land` ran this task's `## Verify` and recorded it in `.project/build/verify-ledger.jsonl`; the row for `4d4474ff` reads `verify: pass`. The project verify itself reported `npm run check` green with `gate:fix-record` clean over 35 claims in 8 task logs, 2,167 tests with 0 failures and 0 skips, 60/60 user-scope, 320/320 skills, 400/400 app, and the held-out corpus 22 suites and 85 tests passing — which is the evidence SC4 rests on: the new surface is enumerated by every list, and the whole suite that enumerates them is green.

