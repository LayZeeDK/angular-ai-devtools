---
id: T002
title: Build the archive-path and fix-record checks
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T002 — Build the archive-path and fix-record checks

## Context

Wave one publishes which references exist and what class each belongs to; this task turns that into the two checks. Both decide from state rather than from an assumption: the archive-path check derives the live paths a milestone's archive move deletes from `.project/STATE.md` and the archive directory, and the fix-record check compares each task log's claimed paths against the range's own `--name-status`, where a rename contributes both names. The failure mode this milestone exists to remove is a check that passes over nothing, so an empty scan must return a finding rather than a pass.

## Approach

- Write `scripts/gate-integrity.mjs` exporting both checks through one seam: each returns findings carrying the file, the line where known, the claim and the class, plus `examined`.
- Drive both checks from the wave-one record's classifications so the two halves — a live reference reported and an archived reference ignored — are asserted in one suite.
- Add one mutant per check: drop the archive classification so a live reference reads clean, and treat a rename as absent so the rename case fails.

## Interface contract

`checkArchivePaths({root, milestone})` and `checkFixRecord({root, range, tasks})` each return `{examined, findings[]}`; a finding carries `file`, `line`, `claim`, `class`. Neither throws on empty input: `examined: 0` returns with a finding of class `nothing-examined`.

## Intent coverage

- SC1
- SC2
- SC5

## Edges

- E1
- E2
- E3
- E4
- E5
- E9
- E11

## Acceptance criteria

1. held-out E1 and E2 — AC1 the archive-path check names the file, the line and the path for a suite resolving a live path the move deletes, and reports a suite reading an archived path as clean — both halves in one suite.
2. held-out E4 and E5 — AC2 the fix-record check names the task id and the file for a claim absent from the range, and does not report a claim matching the new name of a rename; the M035 `nx.json` instance is the fixture.
3. held-out E3 and E11 — AC3 both checks report `examined: 0` as a finding rather than a pass, proven by pointing each at an empty input and observing the refusal.
4. held-out E9 — AC4 each check carries a mutant that reddens it, with the failure string quoted in the Log.

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --check scripts/gate-integrity.test.mjs && node --experimental-strip-types --test "scripts/gate-integrity.test.mjs" && npx prettier --check scripts/gate-integrity.mjs scripts/gate-integrity.test.mjs && npm run check
```

## Held-out

E1, E2, E3, E4, E5, E9, E11

## Log

- (no entries yet)