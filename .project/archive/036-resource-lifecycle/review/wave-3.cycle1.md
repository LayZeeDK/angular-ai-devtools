# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 8ce92ae7db1ebb037292e65b80096ef81ba7baf2

## T005 — Widen the statuses and close the echoed identity: pass

- ✅ `node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs" && node --experimental-strip-types --test "scripts/docs-correction.test.mjs" && npx prettier --check extension/resource-lifecycle.js scripts/resource-lifecycle.test.mjs research/08-recent-angular-features.md` passed at 29864ca6 (verify ledger)
- ✅ `reloading` is a named finding answered before the params gate, worded from Angular's own `ResourceStatus` text; mutants M3 and M4 redden if it is dropped or answered as a first load (`extension/resource-lifecycle.js`).
- ✅ The identity is gated on `Resource#<name>` and a cause in that slot yields `resource-unnamed` (M5 reddens).
- ✅ The vm purity assertions moved inside the sandbox and are proven by M6 (`Date`) and M7 (`console`), each also showing the old outside-the-sandbox assertions could not have caught them.
- ✅ `research/08-recent-angular-features.md` lines 137, 169 and 170 now agree that status lives on the `.status` nodes.
- ✅ Finding 5 answered by asserting `params-unavailable` for measured fields and labelling every constructed params input as an echo, never a measurement.
- ✅ 30/30 join, 16/16 docs, `tsc` 0, prettier clean; the docs case fails by name on the base commit.


## Intent coverage

### SC1 — On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the status of its params, and naming no cause that lives inside the loader.: pass

- ✅ Covered by T005; evidence recorded above and in the verify ledger.

### SC3 — The finding is produced from observables the graph already collects — the per-cycle labels — with no new page-side instrumentation, no build-log scraping and no dev-server dependency.: pass

- ✅ Covered by T005; evidence recorded above and in the verify ledger.
