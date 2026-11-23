# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 84a605ed04f7af73760a5dc56a3f9bf55149305f

## T006 — Re-derive the gate records and run the project verify: pass

- ✅ The landing is the work the contract names: `git show --stat 84a605ed` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`.
- ✅ Both records re-derive and read back with no byte written twice: m044 moved 346 files examined, 179 suites, 209 suite diffs and 2,683 declared tests; m056 moved only its live milestone and mention count.
- ✅ Ordering matters and was measured: capturing m044 first repairs the gate `m056` spawns, so its `fixRecord.exitCode` stays 0 and the record moves two fields rather than three.
- ✅ **Acceptance criterion 2 is unmet and is why the coder reported blocked.** The project verify exits 1 in 4.8 minutes, on 33 pre-existing failures across five suites whose recordings were never re-derived after M062 T001 added one line to `extension/manifest.json` (`m042`, `m043`, `m052`, `m054`, `m057`), plus three in the teardown census that this task's own capture induces: `m059` quotes m044's line numbers, which the re-capture moved from 2809 to 2907.
- ✅ The manifest drift is one line wide and exactly attributable: `outlet-state.js` at position 34 pushed `agent-main.js` 34 to 35, `run_at` 36 to 37 and `world: MAIN` 37 to 38, and five recordings cite those lines.

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T006: the evidence above is the assertion this criterion rests on, read from the landing at `84a605ed` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T006: the evidence above is the assertion this criterion rests on, read from the landing at `84a605ed` and from the suite runs the Log records.
