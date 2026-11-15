---
id: T004
title: Move the milestone record and its pins onto the repaired state
wave: 4
deps:
  - T002
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
---

# T004 — Move the milestone record and its pins onto the repaired state

## Context

T001 recorded three failures: `nothing-examined`, a red suite, and `no-ship-commit-for-M055`. T002 and T003
removed all three, so the record is stale and — measured at `afe7bcd3` — the suite pins the red state itself:
`refusal === 'nothing-examined'` at `:823`, `exitCode !== 0` at `:828` and `:864`, `exitCode === 2` at `:900`,
plus hard-coded `verdict` and `why` prose. A capture alone cannot pass; a previous attempt proved it by leaving
this suite byte-identical and reporting the three failures.

## Approach

- Re-capture the recording once with `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`.
- Rewrite the four pins as assertions about the repaired state, each keeping its subject: the three sections
  now record `exitCode: 0`, `refusal: null`, and a passing summary line the record carries.
- Replace the hard-coded `verdict`/`why` prose with values the capture writes, so the record cannot claim a
  state the tree does not have.
- Fix the `predecessor.refusal` fallback that reports `range-not-derivable` on a clean pass: a passing run has
  no refusal class, and the record must say `null`.
- Name every changed assertion in the Log with what it asserted before and after. An assertion may move; it may
  not become weaker than the property it guards.

## Interface contract

`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Intent coverage

- SC1
- SC3

## Edges

- E5
- E6

## Verify

```bash
node --check scripts/gate-stability-record.test.mjs && node --test scripts/gate-stability-record.test.mjs && npm run check && npm test
```

## Acceptance criteria

1. `node --test scripts/gate-stability-record.test.mjs` reports 0 failures, with the three exit codes recording 0 and every refusal recording `null`.
2. A default run after the capture leaves the recording byte-identical, so the armed write is the only writer.
3. Each of the four former red-state pins is named in the Log with its before and after, and none is deleted without a replacement that guards the same property.
4. `npm test` passes on this branch, which is the evidence M044 lacked: the record and the gate agree at the head that carries the milestone's own work.
5. Held-out edges E5 and E6 are each exercised by `scripts/gate-stability-record.test.mjs`, and each fails when its repair is reverted.

## Log

- 2026-11-15 — re-specified; the first attempt proved the capture alone cannot pass. No work started.
