# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: a11eff35c7a4f36381c1f9fafd5a11266a223e86

## T006 — Re-derive the gate records and run the project verify: pass

- ✅ The landing is the work the contract names: `git show --stat a11eff35` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`.
- ✅ The record was not merely stale but underivable: four suites added since `d94502d1` had no `SUITE_DIFF_REASONS` row, so `deriveSuiteDiff()` refused before any value was derived and no armed capture could write. Four reasons were added, each read from its own diff; `droppedAssertionLines` is 0 for all 50 differing suites.
- ✅ AC7's premise was falsified by this milestone: M061's cache-policy commit edited `nx.json`, so the claim M044 recorded is carried by the range `gate()` derives to HEAD. Every assertion was kept; both runs are now held to M044's own range, where declared mode is clean and log mode refuses five claims including `nx.json`.
- ✅ Both records re-derive and read back clean: 48/48 with stable hashes. m044 moved 46 to 50 differing suites, 199 to 203 examined, 2553 to 2611 declared tests; m056 moved only its live milestone and mention count.
- ✅ Acceptance criterion 2 is unmet at this head and is why the coder reported blocked rather than ready: the project verify exits 1 with 8 failures in three suites, none of which any T006 path reaches. Three are the D6 cascade (re-capturing m044 moved the line `research/raw/m059-record-shapes.json` pins), one is T002's `extension/locale-correctness.js` entering the write-record scan, four are M061's `project.json` edit against `research/raw/m054-style-read.json`'s citation of line 74. T007 owns them.

## Intent coverage

### SC1 — A fixture route that provides a non-default `LOCALE_ID` produces a finding naming the provider entry that carries the token, its kind and its import path, and reports the value as `locale-value-not-recorded`; a mutant that matches the entry by position rather than by token reddens the suite by name.: pass

- ✅ Covered by T006: the evidence above is the assertion this criterion rests on, read from the landing at `a11eff35` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T006: the evidence above is the assertion this criterion rests on, read from the landing at `a11eff35` and from the suite runs the Log records.
