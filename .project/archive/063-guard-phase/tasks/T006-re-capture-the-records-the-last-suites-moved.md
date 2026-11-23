---
id: T006
title: Re-capture the records the last suites moved
wave: 6
status: done
deps: [T005]
agent: build_T006
base: 0395c5859423ff63698b0977dfe4a3749bef7338
worktree: null
task_branch: null
files:
  - research/raw/m063-verdict-claims.json
  - scripts/guard-verdict-claims.test.mjs
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T006 — Re-capture the records the last suites moved

## Goal

Re-capture the claims record the plan coverage moved and the stability record the gate mention count moved.

## Context

The claims record quotes the plan's coverage table, so a later wave stales it; the stability record counts the gate's mentions, and a task Log that names paths adds one.

## Approach

Capture both armed in that order, read both back unarmed, and stop rather than widen if a capture moves a pinned value.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both records state what this head derives; a mutant that moves one derived value reddens naming the record.
2. SC4: each capture is idempotent — a second armed run writes no byte.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && M063_CAPTURE=1 node --test scripts/guard-verdict-claims.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs scripts/guard-verdict-claims.test.mjs
```

## Log

- pending.
- Contract amended after the first dispatch, with the measurement it produced: the stability record derives the gate suite's own exit code, so it can only be stable **after** the gate record is re-captured. The capture order is now gate, then stability, then claims, and `research/raw/m044-gate-shapes.json` is declared here rather than left to the next wave. M062 captured both gate records in one task for exactly this reason.
- Re-captured in the order the amended contract names — the gate record first, then the stability record it feeds, then the claims record — and all three read back unarmed. `research/raw/m044-gate-shapes.json` had moved furthest: 354 listed files and 184 suites (346 and 179 before), 201 references (198), 62 archived milestones (61), the counts 17 archived-by-the-move / 29 deliberate-archive-read / 155 undecided, and the rows `scripts/guard-verdict-claims.test.mjs` added at this head.
- `research/raw/m056-gate-stability.json` moved only what its own live run derives: the bound milestone is M063 rather than M062, and the mention count is 18 rather than 19 because the amended contract declares `research/raw/m044-gate-shapes.json` in this task's own file list, so the token this Log names is judged as a declared path rather than counted as an undeclared mention.
- `research/raw/m063-verdict-claims.json` moved one field: `evidence.records` now lists the record-shapes record T005 wrote in the same directory.
- Nothing was widened: the stage held to M044 at 5290d939 still exits 0 over the five archived M044 task logs, the gate suite is green with all three watched assertions in the runner's own passing roster, and every capture is idempotent — a second armed run of each suite wrote no byte.
- A planted derived value reddens each record's unarmed read rather than passing silently. Emptying `evidence.records` in `research/raw/m063-verdict-claims.json` reddens naming the file and the field that moved (`evidence.records: 0 row(s) -> 1 row(s)`, with the re-capture command), and adding one to the archive mention count in `research/raw/m056-gate-stability.json` reddens the test that holds the three sections to this head, naming the section and field (`archive.counts.mentions: 8 -> 7`) and the flag to re-capture with. Both plants were restored and the bytes matched what the captures wrote; no suite was edited to make either redden.
- The whole Verify block was then run again end to end on the restored tree — gate, stability, claims, then the three read back unarmed — and the three records hashed identically before and after it: 56 test(s) pass, 0 fail.
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `research/raw/m063-verdict-claims.json`.
- **The order was the defect, not the records.** The stability record derives the gate suite's own exit code, so a stability capture taken before the gate capture records a red gate. The contract now declares the gate record and captures gate, then stability, then claims; M062 captured both gate records in one task for the same reason.
- The full block was run twice: the second pass wrote nothing, and the three records hashed identically before and after. Idempotence measured, not asserted.
- The gate record moved 346 to 354 files, 179 to 184 suites, 209 to 214 suite diffs and 2,683 to 2,765 declared tests, with 9 reference rows added and none removed. The claims record moved one field: `evidence.records` gained T005's map.
- The stability record's mention count fell 19 to 18 for a reason worth recording: the gate record is now a **declared** path in this task, so the token its Log names is judged a declared pin rather than an undeclared mention.
- A mutant was planted in each record and each reddened naming the record and field, then restored byte-identically; no suite was edited to achieve it.
- Still red and outside this task: `scripts/tutor-signals-shapes.test.mjs` (20/21) wants `research/raw/m056-tutor-signals.json`'s edge-key counts re-measured — 8 more rows, from T004's claims record carrying the intent's edge table. Neither that record nor that suite is declared by any task in this milestone. That is a plan gap, recorded here so the next milestone declares record-reading suites up front.
