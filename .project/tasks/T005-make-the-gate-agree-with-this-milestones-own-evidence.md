---
id: T005
title: Make the gate agree with this milestone's own evidence
wave: 4
deps:
  - T003
status: pending
agent: build_T005
base: null
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/navigation-blocking.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - research/raw/m057-verdict-claims.json
---

# T005 â€” Make the gate agree with this milestone's own evidence

## Context

At `3c7bf3a8` the project verify refuses for three reasons, none of which is product logic.

`gate:fix-record` reads every path a task Log mentions as a claim that the milestone range changed. Because
the plan tells coders to declare suites that pin a file they change, T002's Log names
`scripts/recording-consistency.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs`, which T002
declared and left byte-identical. Those two names are read as unsatisfiable claims.

`scripts/navigation-blocking.test.mjs` reads the intent's edge table as six columns and takes the sixth cell
as a suite path, and separately demands that a cited suite's own test titles carry the edge id. The intent
grammar accepts five columns, and the owner has ruled the five-column form authoritative with the
test-to-edge mapping held once, in the plan's `## Held-out checks` table.

`research/raw/m056-gate-shapes.json` records `fixRecord` exiting 0; it exits 1 for the claims above, so the
stability record disagrees with what the head derives.

## Approach

- In `scripts/gate-integrity.mjs`, make a declared path a claim only when the range actually changed it: a
  path the task declares and leaves byte-identical is a pin, and a pin is satisfied by the file being
  unchanged. Do not stop reading undeclared mentions â€” an undeclared path is the defect that rule exists for.
- In `scripts/navigation-blocking.test.mjs`, read the intent's five-column edge table, and take the
  test-to-edge mapping from the plan's `## Held-out checks` (`Edge | Task | Test`) instead of requiring edge
  ids in suite titles. Keep the refusal for a cited suite that does not exist.
- Re-arm `research/raw/m044-gate-shapes.json` and `research/raw/m056-gate-shapes.json` with their own armed
  captures, naming in the Log which values moved and why.
- Update `research/raw/m057-verdict-claims.json` so each claim cites an artifact this head carries, in the
  shape the consuming suites demand after the two changes above.

## Acceptance criteria

1. `npm run check` exits 0 at this head, and `gate:fix-record` reports zero findings while still refusing an
   undeclared path â€” prove the refusal with a temporary undeclared mention that is then removed.
2. `scripts/navigation-blocking.test.mjs` passes against the five-column intent and the plan's held-out
   table, and a mutant that restores the six-column read reddens naming the column count.
3. Both shape records are re-armed and an unarmed run leaves each byte-identical; the Log names every value
   that moved.
4. `npm test` reports no failure attributable to the three causes above, and any remaining failure is named
   as pre-existing with its evidence.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/navigation-blocking.test.mjs && npm run check && npx prettier --check scripts research
```

---
## Log

- Task written at plan approval; not started.
