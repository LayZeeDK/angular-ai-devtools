# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 051784e2b838dda7d1372f9209a044b7e43f5d3e

## T003 — Hold the recording to a range that does not move when the ship commit appears: pass

- ✅ `node --test scripts/gate-integrity.test.mjs` — 28 pass, 0 fail, including `T003 E8: restoring the numeric-predecessor rule refuses`.
- ✅ The range's base is held to a rule that does not move when the ship commit appears; `research/raw/m044-gate-shapes.json` was re-captured to the new derivations.
- ✅ Review correction, later on this branch: the base was stabilised but the head stayed `HEAD`, so the range still moved. T006 added the named-head rule, and T006's report states the defect verbatim.

## Intent coverage

### SC3 — `node --test scripts/gate-integrity.test.mjs` passes at a head where this milestone's own ship commit exists, and the committed recording's bytes are unchanged by that run.: pass

- ✅ Covered by T003 at `afe7bcd3`; the evidence above names the commands and their results.

### SC4 — The stage derives a range for a milestone whose numerically previous id is unshipped, naming the base it used, instead of stopping with "names no ship commit for M055".: pass

- ✅ Covered by T003 at `afe7bcd3`; the evidence above names the commands and their results.

### SC5 — A mutant that reverts the archived-task branch, a mutant that makes the recording's range unconditional, and a mutant that restores the numeric-predecessor rule each redden a test that names the defect.: pass

- ✅ Covered by T003 at `afe7bcd3`; the evidence above names the commands and their results.
