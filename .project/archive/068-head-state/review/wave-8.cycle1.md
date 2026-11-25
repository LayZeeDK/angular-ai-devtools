# Review — wave 8, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: d7241b9e

## T008 — Re-derive the shape maps and the edge vocabulary the eight edges moved: pass

- ✅ The vocabulary pin now derives its expected delta from the intent's own `## Edge coverage` table through `intentPathForMilestone`, so the expectation is the intent's and not the capture's; it asserts the record's rows are exactly the intent's ids and that each field gained exactly that many against the union with the record removed.
- ✅ Intent and capture agreed with nothing to reconcile: 8 rows, `edge` 38 to 46 and each row field 32 to 40. A mutant reddens on a record that drops rows, on one that lands a row twice, and on a union one row short.
- ✅ Three maps re-derived: `m057` (46 and 40, conclusion corrected from four carriers to five), `m059` (head, `recordsSearched` 168 to 169, `filesSearched` 167 to 168), `m055` (head only). `m057` has no armed capture in any suite, so it was re-derived by the suite's own union walk and that absence is recorded rather than described as an armed capture.

## Intent coverage

### SC4 — The panel renders exactly what the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer names no remedy, no cause and no route the record did not carry.: pass

- ✅ T008 carries it: the acceptance criteria the plan assigns to this task for SC4 are the ones it proved, and the run is recorded in the verify ledger at this head.
