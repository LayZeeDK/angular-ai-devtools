---
id: T004
title: Re-capture the milestone record its own repairs invalidated
wave: 4
deps:
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

# T004 — Re-capture the milestone record its own repairs invalidated

## Context

`research/raw/m056-gate-stability.json` recorded the three failures this milestone set out to remove, so
T002 and T003 turned its own subject green and left the record stale. Measured at `afe7bcd3`, its suite
reports:

```
the recording disagrees with this run's derivation at 3 value(s) (re-capture with M056_CAPTURE=1 after naming what moved):
archive.exitCode: 1 -> 0; fixRecord.exitCode: 1 -> 0; predecessor.exitCode: 2 -> 0
```

That message names its own remedy. This task takes it, and states which fields moved and why, because a
re-capture that silently follows the code records nothing.

## Approach

- Run `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs` once.
- In the Log, name every moved field with its cause: each exit code moved because the repair removed the
  refusal the field recorded, and any field that moved for another reason must say so.
- Leave the suite's assertions untouched: the sections keep their shape and their commands, and only the
  recorded values follow the tree.

## Interface contract

`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Intent coverage

- SC1
- SC3

## Edges

None. This task re-records measurements T001 owns; it adds no edge of its own.

## Verify

```bash
node --check scripts/gate-stability-record.test.mjs && node --test scripts/gate-stability-record.test.mjs && npm run check
```

## Acceptance criteria

1. `node --test scripts/gate-stability-record.test.mjs` reports 0 failures at this head, with the three exit codes recording 0.
2. A default run after the capture leaves the recording byte-identical, so the armed write is the only writer.
3. The Log names each moved field and its cause, and no assertion, command or section shape was changed to make the capture agree.

## Log

- 2026-11-15 — planned; no work started.
