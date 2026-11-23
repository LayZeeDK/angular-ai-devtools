# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 96108b190f1977bfddfedfc17b66101b170a6961

## T006 — Re-capture the records the last suites moved: pass

- ✅ The landing is the work the contract names: `git show --stat 96108b19` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Contract amended after the first dispatch, with the measurement it produced: the stability record derives the gate suite's own exit code, so it can only be stable **after** the gate record is re-captured. The capture order is now gate, then stability, then claims, and `research/raw/m044-gate-shapes.json` is declared here rather than left to the next wave. M062 captured both gate records in one task for exactly this reason.
- ✅ Re-captured in the order the amended contract names — the gate record first, then the stability record it feeds, then the claims record — and all three read back unarmed. `research/raw/m044-gate-shapes.json` had moved furthest: 354 listed files and 184 suites (346 and 179 before), 201 references (198), 62 archived milestones (61), the counts 17 archived-by-the-move / 29 deliberate-archive-read / 155 undecided, and the rows `scripts/guard-verdict-claims.test.mjs` added at this head.
- ✅ `research/raw/m056-gate-stability.json` moved only what its own live run derives: the bound milestone is M063 rather than M062, and the mention count is 18 rather than 19 because the amended contract declares `research/raw/m044-gate-shapes.json` in this task's own file list, so the token this Log names is judged as a declared path rather than counted as an undeclared mention.
- ✅ `research/raw/m063-verdict-claims.json` moved one field: `evidence.records` now lists the record-shapes record T005 wrote in the same directory.
- ✅ Nothing was widened: the stage held to M044 at 5290d939 still exits 0 over the five archived M044 task logs, the gate suite is green with all three watched assertions in the runner's own passing roster, and every capture is idempotent — a second armed run of each suite wrote no byte.

## Intent coverage

### SC1 — A cancelled navigation whose guard ran a side effect produces a finding naming the guard, the phase it ran in and the verdict that cancelled; a mutant that cancels before the guard runs reddens it, and the red names the phase field.: pass

- ✅ Covered by T006: the evidence above is the assertion this criterion rests on, read from the landing at `96108b19` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T006: the evidence above is the assertion this criterion rests on, read from the landing at `96108b19` and from the suite runs the Log records.
