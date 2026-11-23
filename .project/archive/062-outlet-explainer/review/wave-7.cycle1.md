# Review — wave 7, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: b571adc8f3d01a002c12e113223cf6e41567a19c

## T007 — Re-derive the records the manifest line moved and run the project verify: pass

- ✅ The landing is the work the contract names: `git show --stat b571adc8` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Verify amended before landing: the `m059` capture was dropped from this task's check. It writes `research/raw/m059-record-shapes.json`, which is T008's declared file, and the measurement it stands on (`producible.researchRaw.lines[0].line` 2809 to 2907) is unchanged with or without this task's three records.
- ✅ Landed paths: `research/raw/m042-error-boundary.json`, `research/raw/m043-settle-page.json`, `research/raw/m052-webmcp-api.json`.
- ✅ `m042` was not a manifest citation at all: its 24 failures were one field, `environment.node` pinned to `v24.22.0`, and the re-capture changed that value and nothing else. The attribution in T006 — that five recordings cite the shifted manifest lines — does not hold for it.
- ✅ `m043` has a writer that re-derives `derived` only; its citation was re-derived from the tree the suite derives, then the armed run proved the bytes canonical and unchanged. `m052` has no writer, so its record was re-derived from the tree and read back.
- ✅ Each record was mutated afterwards — one cited line moved, no re-capture — and each reddened with a message that names the citation and what the line now reads.

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T007: the evidence above is the assertion this criterion rests on, read from the landing at `b571adc8` and from the suite runs the Log records.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and its copy record moved in the same task, and the answer carries no remedy, no cause and no identity it was not given.: pass

- ✅ Covered by T007: the evidence above is the assertion this criterion rests on, read from the landing at `b571adc8` and from the suite runs the Log records.
