# Wave 6 — T006: Re-derive the navigation and teardown recordings

Task: `.project/tasks/T006-re-derive-the-navigation-and-teardown-recordings.md`
Commit: `f2ac1903` · HEAD under review: `4d4474fff6ee25f59e7fec245cf75871d68bf097`

## Intent coverage

### SC1 — A stubbed import failure produces a finding naming the import specifier, the owning route path and the response status; a mutant that resolves the import turns it off, and the red names the field that moved.: pass

The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

- ✅ The task states its own numbered criteria for SC1 and its suite proves them at the commit above. Read against the archived task file, whose `## Log` records which suite and which mutant established each line.

## Surface contract

No surface is declared for this wave.

## Verification observed

`lars-gsd land` ran this task's `## Verify` and recorded it in `.project/build/verify-ledger.jsonl`. The Ledger row for `f2ac1903` is the receipt; the numbers quoted below come from that run.

Depth: full
Tasks reviewed: 1

## T006 — Re-derive the navigation and teardown recordings: pass

- ✅ The task landed at the commit this review names, its `## Verify` ran under `lars-gsd land` and the ledger row reads `verify: pass`, and the project verify at `4d4474ff` reports `npm run check` green with 2,167 tests, `fail 0` and `skipped 0`.
