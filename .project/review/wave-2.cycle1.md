# Wave 2 — T002: Join the record into four states, purely

Task: `.project/tasks/T002-join-the-record-into-four-states-purely.md`
Commit: `9e1e2159` · HEAD under review: `4d4474fff6ee25f59e7fec245cf75871d68bf097`

## Intent coverage

### SC1 — A stubbed import failure produces a finding naming the import specifier, the owning route path and the response status; a mutant that resolves the import turns it off, and the red names the field that moved.: pass

The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

- ✅ The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

### SC2 — A request that never completed reports `cannot-tell` with its reason, and the answer never names a version drift, a cause or a remedy it did not measure; a mutant that infers a drift from a status reddens it.: pass

The task states its own numbered criteria for SC2 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

- ✅ The task states its own numbered criteria for SC2 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

### Gap E1 — E1: pass

Held out by `scripts/chunk-failure.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

### Gap E2 — E2: pass

Held out by `scripts/chunk-failure.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

### Gap E3 — E3: pass

Held out by `scripts/chunk-failure.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

### Gap E4 — E4: pass

Held out by `scripts/chunk-failure.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

### Gap E7 — E7: pass

Held out by `scripts/chunk-failure.test.mjs`: the suite names the edge and reddens when the behaviour it describes is removed.

## Surface contract

No surface is declared for this wave.

## Verification observed

`lars-gsd land` ran this task's `## Verify` and recorded it in `.project/build/verify-ledger.jsonl`. The Ledger row for `9e1e2159` is the receipt; the numbers quoted below come from that run.

Depth: full
Tasks reviewed: 1

## T002 — Join the record into four states, purely: pass

- ✅ The task landed at the commit this review names, its `## Verify` ran under `lars-gsd land` and the ledger row reads `verify: pass`, and the project verify at `4d4474ff` reports `npm run check` green with 2,167 tests, `fail 0` and `skipped 0`.
