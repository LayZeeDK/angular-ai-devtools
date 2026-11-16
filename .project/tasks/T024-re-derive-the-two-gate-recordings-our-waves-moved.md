---
id: T024
title: Re-derive the two gate recordings our waves moved
wave: 17
deps:
  - T021
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
---

# T024 — Re-derive the two gate recordings our waves moved

## Context

Re-running every done task's own Verify at this head (the ledger backfill the gate demands) found five
verifies stale, and the chain behind them is one cause. The suite census recorded in
`research/raw/m044-gate-shapes.json` was measured at `5290d939` and this tree now carries sixteen suites that
differ from it — ten edited, six added, one assertion line re-cut with the same call and the same subject, and
zero dropped. Because the census is asserted inside `scripts/gate-integrity.test.mjs`, that suite now exits 1,
which is the `fixRecord.exitCode: 0 -> 1` the stability record pins. The other three stability values are the
same cause seen twice: the fix-record summary's mention count moved 102 -> 139 as T016-T021 appended claims to
their Logs.

None of this is a defect in the code those suites test, and the census's own counts prove nothing was removed:
`droppedAssertionLines: 0`. But a re-capture that does not name what moved would launder exactly the difference
the census exists to force a reader to account for, so the naming is the task, not a formality around it.

## Approach

- Run the census's documented armed command and let it re-derive:
  `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`.
  Do not hand-edit the record.
- Read the re-derived record and account for every differing suite against the wave that changed it: T016
  through T021 added pins to the join, pane and record suites, and T003's registry work edited the pane suite.
  The Log lists the suites with their +N/-N and assertion counts, and names the wave for each.
- Confirm explicitly that the census reports zero dropped assertion lines and one re-cut, and say what the
  re-cut one is. A dropped assertion stops this task: report `blocked` rather than capture over it.
- Only after that suite exits 0 unarmed, run the stability record's armed command:
  `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`.
- Name all four moved values in the Log: the two mention counts 102 -> 139 and why, the exit code 1 -> 0 and
  why, and the verdict, which the suite derives rather than takes typed.
- Prove both records are stable: an unarmed run of each suite writes no byte and exits 0, and a second armed
  run writes nothing.

## Acceptance criteria

1. `node --test scripts/gate-integrity.test.mjs` exits 0 unarmed at this head, with the census re-derived by its documented `M044_CAPTURE=1` command rather than hand-edited.
2. Every differing suite in the re-derived census is accounted for in the Log by the wave that changed it, with its added, edited and re-cut assertion lines stated, and the census itself reports zero dropped assertion lines.
3. `node --test scripts/gate-stability-record.test.mjs` exits 0 unarmed, with all four moved values named in the Log: both mention counts, the exit code, and the derived verdict.
4. Both records are byte-stable: an unarmed run of each writes nothing, and a second armed run of each writes nothing.
5. The task's fenced Verify passes, and no record is edited by hand — each carries the bytes its own armed command wrote.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs && npm run check && npx prettier --check research/raw
```

## Log

- Task written after the ledger backfill found five verifies stale behind one cause; not started.
