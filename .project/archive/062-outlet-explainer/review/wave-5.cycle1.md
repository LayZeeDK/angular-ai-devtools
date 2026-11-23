# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: c37eabdf80322b91ee333bef6b19c6b068fd7367

## T005 — Re-derive this milestone's own records: pass

- ✅ The landing is the work the contract names: `git show --stat c37eabdf` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Contract amended a second time before this task ran: `scripts/outlet-verdict-claims.test.mjs` is declared. The record it writes was already declared, but the census that writes it was not, so the measured cascade — writing the map moves that record's `evidence.records` from 0 rows to 1 — could be seen and not repaired.
- ✅ Contract amended before this task ran: `research/raw/m059-record-shapes.json` is declared and `scripts/teardown-leak.test.mjs` dropped, because T004 measured that adding a record to `research/raw/` moves that record's census (`recordsSearched` 154 -> 155) and the suite alone cannot repair it.
- ✅ Landed paths: `scripts/outlet-record-shapes.test.mjs`, `research/raw/m062-record-shapes.json`, `research/raw/m059-record-shapes.json`, `research/raw/m062-verdict-claims.json`, and one `SUITE_DIFF_REASONS` row in `scripts/gate-integrity.test.mjs`.
- ✅ The map this milestone owed did not exist and no earlier task wrote it: it is derived by running both extension modules in a bare context, never typed. The claims record then moved `evidence.records` from 0 rows to 1, which is why the census that writes it had to be declared before this task could finish.
- ✅ `m059` was stale by four values rather than two (`recordsSearched` 154 to 156, `extension` 40 to 42, `scripts` 142 to 147), and its own failure text names the repair command.

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T005: the evidence above is the assertion this criterion rests on, read from the landing at `c37eabdf` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T005: the evidence above is the assertion this criterion rests on, read from the landing at `c37eabdf` and from the suite runs the Log records.
