---
id: T002
title: Read the archived tasks when the live directory is empty
wave: 2
deps:
  - T001
status: done
agent: build_T002
base: 68936d1ded5ef9f4d4477faf9ed96cef51d13efd
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
- 2026-11-15 - verdict: pass. Landed at `6d450aa7` from `gsd-path-task/T002`; diff is the two declared paths.
  `defaultTaskInput(root, milestone)` reads the live tasks directory when it holds `.md` files, else the
  milestone's archived `tasks/`, else the live path so `nothing-examined` still fires; an explicit `--tasks`
  wins (asserted through `gate()`), and the stage now prints the directory it read.
  Fixture suite 7/7: E1 live wins, E2 archived answers when live is emptied, E3 no task file anywhere refuses,
  E4 five spellings of 44 reach one archive and M999 borrows nothing, E9 an archived `tasks/` holding no `.md`
  counts as empty, plus an end-to-end SC1 case - exit 0 over 1 claim in 1 archived task log.
  `npm run gate:fix-record` does NOT exit 0 at this head, and cannot from these files: milestone M056 and no
  `ship: M055` in `git log`, so `workRange` refuses before the task directory is consulted. That is SC4/wave 3.
  `npm run check` is red only at that same step; every earlier stage is green.
  Deviation 4 recorded: no third mutant, because the interface contract fixes `defaultTaskInput(root, milestone)`
  with no mutant parameter; the two existing mutants are unchanged.
  The new suite adds 20 `.project` references to the archive-path scan (143 suites / 178 references / 17 live),
  all namings or comments, 0 findings; the check's code and classification are untouched.
