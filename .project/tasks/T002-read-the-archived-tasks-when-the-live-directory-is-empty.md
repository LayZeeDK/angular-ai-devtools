---
id: T002
title: Read the archived tasks when the live directory is empty
wave: 2
deps:
  - T001
status: pending
agent: build_T002
base: null
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T002 — Read the archived tasks when the live directory is empty

## Context

The shipment moves the live tasks directory into `.project/archive/<NNN>-<slug>/tasks/`, and the stage's default
input still reads the emptied live directory, so `npm run gate:fix-record` refuses `nothing-examined` on
every integrated tree. The refusal is right; the default is wrong.

## Approach

- Add `defaultTaskInput(root, milestone)` to `scripts/gate-integrity.mjs`: the live the live tasks directory when
  it holds task files, otherwise the milestone's own archived `tasks/`, otherwise the live path so the
  refusal still fires.
- Use it where the stage currently joins the live tasks directory, keeping an explicit `--tasks` authoritative.
- Put the fixture suite in its own file: `scripts/gate-integrity.test.mjs` permits exactly one
  `writeFileSync` inside its armed capture gate and a fixture test must write.

## Intent coverage

- SC1
- SC2
- SC5

## Edges

- E1
- E2
- E3
- E4
- E9

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity-default-tasks.test.mjs && npm run gate:fix-record && npm run check
```

## Interface contract

`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Acceptance criteria

1. `npm run gate:fix-record` exits 0 on this tree, printing the number of archived task logs it examined.
2. A fixture with no task file in either directory still yields `nothing-examined`.
3. Removing the archived-directory branch reddens the fixture suite naming the empty-live case.
4. Held-out edges E1, E2, E3, E4, E9 are each exercised by `scripts/gate-integrity-default-tasks.test.mjs`, and each fails when its repair is reverted.

## Log

- 2026-11-14 — planned; no work started.