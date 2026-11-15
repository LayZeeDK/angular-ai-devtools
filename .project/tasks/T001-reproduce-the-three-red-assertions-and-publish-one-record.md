---
id: T001
title: Reproduce the three red assertions at this head and publish one record
wave: 1
deps: []
status: pending
agent: build_T001
base: null
worktree: null
task_branch: null
files:
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
---

# T001 — Reproduce the three red assertions at this head and publish one record

## Context

M044's check is red on the tree it integrated. Three commands say so, and this task turns them into one
record the later tasks are held to, so neither repair can be written against a memory of the failure.

## Approach

- Run `npm run gate:fix-record` and record its exit code, its refusal class and the counts it printed.
- Run `node --test scripts/gate-integrity.test.mjs` and record the failing test names with the first
  difference each reports for the `fixRecord` section.
- Record the numeric-predecessor failure measured on this branch: the stage cannot derive a range because
  `git log` names no ship commit for M055.
- Publish `research/raw/m056-gate-stability.json` with those three sections, and a suite that re-derives
  them: the two commands are spawned, so the record cannot drift from the tree without failing.

## Intent coverage

- SC1
- SC4

## Edges

- E7

## Verify

```bash
node --check scripts/gate-stability-record.test.mjs && node --test scripts/gate-stability-record.test.mjs && npm run check
```

## Interface contract

`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Acceptance criteria

1. The record names the three commands and their exit codes, and a default run of the suite re-derives them.
2. Removing the `nothing-examined` refusal from the stage reddens the suite naming the section.
3. Two armed runs with nothing moved leave the recording byte-identical.
4. Held-out edges E7 are each exercised by `scripts/gate-stability-record.test.mjs`, and each fails when its repair is reverted.

## Log

- 2026-11-14 — planned; no work started.