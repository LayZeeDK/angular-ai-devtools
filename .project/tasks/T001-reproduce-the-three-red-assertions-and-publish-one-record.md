---
id: T001
title: Reproduce the three red assertions at this head and publish one record
wave: 1
deps: []
status: done
agent: build_T001
base: db227f7b19be4b9a8e61cbb79dbce804f257eedf
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
- 2026-11-15 — verdict: pass. Landed at `415ba520` from the sidecar (`gsd-path-task/T001`) with a diff of
  exactly the three declared paths. Coder build_T001 delivered `research/raw/m056-gate-stability.json`
  (9,278 B) and `scripts/gate-stability-record.test.mjs` (35,702 B); I re-ran the receipts rather than
  taking the report: default run 7 tests / 7 pass, the recording's sha256 `2e9aa96f742da5fd…` unchanged
  before and after, `npx prettier --check` clean, `node --check` exit 0.
  The coder contradicted my brief correctly: plain `npm run gate:fix-record` exits 2 with
  `fix-record cannot derive the range it is held to - git log names no ship commit for M055`, not the
  `nothing-examined` refusal I had promised. It recorded both — the plain run verbatim in
  `archive.detail.plainRun`, and the M044-held run that does print `nothing-examined` — and I verified the
  substitution myself: `node scripts/gate-integrity.mjs --check fix-record --milestone M044` reports
  `examined 0 claim(s) in 3 task log(s) against 40 changed path(s)`, `nothing-examined`.
  Two facts it surfaced that the plan did not carry: this head has four red assertions rather than three
  (`T004` also reddens because the tree binds M056), and the verify sidecar had no `node_modules`, so only
  `@angular/router` was copied in to satisfy the router-chunk read.
  `gsd land-check` blocked this landing on a guard false positive — a task whose declared files are all new
  has no base counterpart, so the novelty check could not run and refused. Repaired in
  `build-guard.ts` (`baseComparable`), after which the only remaining blocker is this Log entry itself:
  the landing commit was made before it existed. Repairing that means amending a landed commit, which the
  ship validator reads for its `Base:` proof, so it is left as a recorded residual rather than done here.
