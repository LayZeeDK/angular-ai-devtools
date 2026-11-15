---
id: T003
title: Hold the recording to a range that does not move when the ship commit appears
wave: 3
deps:
  - T002
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

# T003 — Hold the recording to a range that does not move when the ship commit appears

## Context

`workRange` prefers the milestone's own ship commit, so the recording's `fixRecord` section re-derives
differently the moment that commit exists: three assertions that were green before the shipment are red
after it. A recording valid only before the thing that ships it is not a record. The same function stops
outright when the numerically previous milestone is unshipped.

## Approach

- Derive the range from the base recorded in the recording itself, so a re-run compares against the same
  base the capture used rather than against whatever HEAD now prefers.
- When the numerically previous milestone has no ship commit, fall back to the newest ship commit
  `git log` carries and print the base it used, instead of stopping.
- Re-capture once, and state in the task log which section moved and why.

## Intent coverage

- SC3
- SC4
- SC5

## Edges

- E5
- E6
- E8

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs && npm run check && npm test
```

## Interface contract

`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Acceptance criteria

1. `node --test scripts/gate-integrity.test.mjs` reports 0 failures at this head, with the ship commit present.
2. A default run leaves the recording's bytes unchanged; the capture diff names only the section it moved.
3. A milestone whose numerically previous id is unshipped derives a range and prints the base it used.
4. Restoring the numeric-predecessor rule reddens a test that names it.
5. Held-out edges E5, E6, E8 are each exercised by `scripts/gate-integrity.test.mjs`, and each fails when its repair is reverted.

## Log

- 2026-11-14 — planned; no work started.