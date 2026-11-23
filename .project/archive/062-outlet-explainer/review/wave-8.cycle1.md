# Review — wave 8, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 50144f615f63cace12e887ebce527e72353f9e50

## T008 — Re-derive the records the manifest line moved and run the project verify: pass

- ✅ The landing is the work the contract names: `git show --stat 50144f61` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `research/raw/m054-style-read.json`, `research/raw/m057-record-shapes.json`, `research/raw/m059-record-shapes.json`.
- ✅ `m054` moved one cited line (`"world": "MAIN"` 37 to 38) and `m059` moved its quote of `m044` (2809 to 2907). `m057` was **not** manifest drift: its red was the `research/raw` edge-key union, which grew because the claims record carries the intent's edge table as a list. That is the third mis-attribution of this repair wave, after `m042`.
- ✅ Each record was mutated afterwards — a cited line moved, no re-capture — and each reddened naming the citation and what the line now reads; the armed runs then wrote nothing twice.
- ✅ **Acceptance criterion 2 is unmet and is why the coder reported blocked.** The verify exits 1 at `npm test` leg 1 on six failures whose only repair writes two records outside this task's paths: `m062-verdict-claims.json` derives from the plan's coverage table, which waves 7 and 8 extended after its last capture, and `m056-gate-stability.json` counts a sixth mention that is literally T007's note saying `m059` belongs here.
- ✅ The build and `npm run check` both pass inside the verify; the node-version trap did not fire (the verify ran under v26.13.0, which is what `m042` now pins).

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T008: the evidence above is the assertion this criterion rests on, read from the landing at `50144f61` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T008: the evidence above is the assertion this criterion rests on, read from the landing at `50144f61` and from the suite runs the Log records.
