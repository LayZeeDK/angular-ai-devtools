# Review — wave 17, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 72aaedafa74760ae9b5812933acd2976f75623ac

This file replaces `wave-17.cycle2.md`, which returned `fail` and was correct at the head it measured. The two recordings T024 re-derives had gone stale behind T020, T022, T023, T025, T026 and T027, so the census and the stability record disagreed with the tree. Both were re-derived by their own capture commands after the final landing, which is the repair this wave requires; nothing in T024's own acceptance criteria changed.

## T024 — Re-derive the two gate recordings our waves moved: pass

- ✅ `node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs` at this head: 48 tests, 48 pass, 0 fail, exit 0.
- ✅ The armed runs named what they moved: `suiteDiff.differing[6].addedLines` 3428 to 3493 in `research/raw/m044-gate-shapes.json`, and the stability record's mention count; each default run afterwards asserted that it wrote no byte.
- ✅ `git hash-object research/raw/m056-gate-stability.json` equals the blob `research/raw/m056-gate-stability.json` in the tree, so the record is what this head derives and not what a run blessed.
- ✅ The cycle-2 defect was ordering, not T024: the re-derivation landed at a commit later tasks overtook. That is now a written rule, so a future milestone derives after its final landing.

## Intent coverage

- ✅ yes — the recordings this milestone ships are derived at the head it ships: 48 of 48 gate tests pass with both records current, and each armed run named the values it moved.
- ❌ no — no criterion this wave does not own is claimed; T024 declares `- None` for intent coverage, and its evidence sits inside the milestone's gate integrity rather than inside a surface criterion.
