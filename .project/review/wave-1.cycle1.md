# Wave 1 — T001: Record the import failures the router produces

Task: `.project/tasks/T001-record-the-import-failures-the-router-produces.md`
Commit: `537aed5e` · HEAD under review: `4d4474fff6ee25f59e7fec245cf75871d68bf097`

## Intent coverage

### SC1 — A stubbed import failure produces a finding naming the import specifier, the owning route path and the response status; a mutant that resolves the import turns it off, and the red names the field that moved.: pass

The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

- ✅ The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

### SC3 — The failure is read from a record this milestone writes, with no new page-side instrumentation and no second read of the network; the record's fields and the join's inputs are the same list, asserted in one place.: pass

The task states its own numbered criteria for SC3 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

- ✅ The task states its own numbered criteria for SC3 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

### Gap E5 — E5: pass

Held out by `scripts/import-failure.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

## Surface contract

No surface is declared for this wave.

## Verification observed

`lars-gsd land` ran this task's `## Verify` and recorded it in `.project/build/verify-ledger.jsonl`. The Ledger row for `537aed5e` is the receipt; the numbers quoted below come from that run.

Depth: full
Tasks reviewed: 1

## T001 — Record the import failures the router produces: pass

- ✅ The task landed at the commit this review names, its `## Verify` ran under `lars-gsd land` and the ledger row reads `verify: pass`, and the project verify at `4d4474ff` reports `npm run check` green with 2,167 tests, `fail 0` and `skipped 0`.
