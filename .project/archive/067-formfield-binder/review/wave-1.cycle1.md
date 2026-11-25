# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4150bf7565ac8a1736d1ed602208601e58373f74

## T001 — Isolate the missing reason row so one assertion fails instead of nine: pass

- ✅ T001 landed and its own Verify is recorded in the verify ledger. 2026-11-23: measured before the change at this base: one throw in deriveSuiteDiff reddened nine assertions, and four sections that share the derivation never ran. 2026-11-23: a missing row is now collected beside the record (let suiteDiffUnexplained) rather than thrown, and the one assertion that owns the diff prints the Object.assign block to paste. The state is held beside the section, not inside it, because a new key in the returned object makes the committed record stale for a reason unrelated to the tree. 2026-11-23: M044_CAPTURE=1 node --experimental-strip-types --test scripts/gate-integrity.test.mjs reports pass 40 fail 1; the default run reports pass 39 fail 1. The remaining failure is T003 E5, E7 — the

## Intent coverage

### SC3 — The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice.: pass

- ✅ T001 carries it: the acceptance criteria the plan assigns to this task for SC3 are the ones it proved, and the run is recorded in the verify ledger at this head.
