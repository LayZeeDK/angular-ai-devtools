# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 6e552159c98cec00419a247e35ef6e31224ed7ab

## T005 — Re-derive this milestone's own records: pass

- ✅ The landing is the work the contract names: `git show --stat 6e552159` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `scripts/guard-record-shapes.test.mjs`, `research/raw/m063-record-shapes.json` (12,228 bytes, sha256 `ce9e9ce7…`), `research/raw/m059-record-shapes.json` (re-captured), and end-of-file additions to `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs` and `scripts/gate-integrity.test.mjs`.
- ✅ Every value in the map is derived by running both extension modules in a bare context: 3 record fields, 4 row fields, 7 absence reasons **each produced by a record**, 4 phases, 2 verdicts, a 4-observation sample, and the two empty-record cases. The join's two input fields are proved by removing each.
- ✅ `m059` was redder than the brief predicted — it recorded 156/42/147 where this head already derived 157/44/150 — and now states 158/44/151/158 with the new record and suite counted rather than excluded.
- ✅ The map could not be wired into `tutor-answer` through `MAPS`/`PINNED_OUTSIDE`: the gate recording pins that file's archive references by line, and inserting 24 lines above them produced a new `gate-integrity` failure at `tutor-answer.test.mjs:206`. The wiring went at the end of the file as a test that proves each of this milestone's two records is held by its own `capture.command`.
- ✅ A record named by a map is now excused twice (by name and by its own census), so the census assertion distinguishes the two: every subtraction is either named outside a map or self-held, and the named-only set is pinned.

## Intent coverage

### SC1 — A cancelled navigation whose guard ran a side effect produces a finding naming the guard, the phase it ran in and the verdict that cancelled; a mutant that cancels before the guard runs reddens it, and the red names the phase field.: pass

- ✅ Covered by T005: the evidence above is the assertion this criterion rests on, read from the landing at `6e552159` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T005: the evidence above is the assertion this criterion rests on, read from the landing at `6e552159` and from the suite runs the Log records.
