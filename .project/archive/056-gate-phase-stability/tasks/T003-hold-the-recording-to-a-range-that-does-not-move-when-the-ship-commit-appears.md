---
id: T003
title: Hold the recording to a range that does not move when the ship commit appears
wave: 3
deps:
  - T002
status: done
agent: build_T003
base: 647382779b7483a9f7b39295028cb2a21e0e3a7c
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
- 2026-11-15 - verdict: pass. Landed at `afe7bcd3` from `gsd-path-task/T003`; diff is the three declared
  files (703 insertions, 87 deletions). `workRange` now answers by a named rule (`recorded`, `ship`,
  `newest-ship`, `none`), always heads at this tree's HEAD, and prints the rule plus the base it used, so the
  range is identical before and after the milestone's own ship commit - defect B's cause. Measured:
  `npm run gate:fix-record` exits 0 with `rule newest-ship: git log names no ship commit for M055, so the base
  is the newest it carries, 53f93bb5`, examining 3 task logs; `node --test scripts/gate-integrity.test.mjs`
  reports 28 tests / 28 pass, and a default run leaves the recording at `sha256 64cc5501b5af0b6b...`.
  The E8 mutant was proven in place: restoring the numeric-predecessor rule reddened two tests by name, then
  the file was restored byte-identically (`61899f4da330...`).
  One capture, 748 moved leaves across six sections, each named with its cause: archiveReferences (two suites
  added at this head, and M044's own archive entering the subtree derivation), fixRecord (one tracked
  `SYNTHESIS.md` from M044's archive), drivenChecks (the two fixture runs now name `--milestone M044` instead
  of inheriting a STATE that changes every ship), suiteDiff and wholeTree (the two new suites and this file's
  own two tests), capture.at (the only volatile field).
  Deviations stated, not hidden: AC7 now names M044's archived task directory, which is what those five
  assertions are about, with nothing weakened or deleted; a `--base`/`recorded` path is reachable and verified
  by hand but not driven by a test, because a further test would have forced a second capture, which N2
  forbids; the `none` refusal is unreachable on a repository with 49 ship commits and is untested; and
  `research/raw/m056-gate-stability.json` (T001's record) is now stale by three exit codes, which is its own
  task named T004 rather than work folded in here.
  verdict: ready
