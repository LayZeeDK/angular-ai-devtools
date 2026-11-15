---
id: T005
title: Derive the claims record path from the milestone it describes
wave: 5
deps:
  - T004
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/navigation-blocking.test.mjs
  - research/raw/m056-verdict-claims.json
  - scripts/gate-stability-record.test.mjs
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
---

# T005 — Derive the claims record path from the milestone it describes

## Context

Measured on this branch at `7af74f06` with `npm run check` green and `npm test` at 1415/1419. Four failures, one
class:

- `scripts/navigation-blocking.test.mjs:2440` pins `CLAIMS_REL = 'research/raw/m044-verdict-claims.json'`, while
  `derivedClaims()` resolves the milestone with `boundMilestone()`. On any branch past M044 the suite compares a
  M044 record against this milestone's derivation and reports `milestone: "M044" -> "M056"`.
- `scripts/overlay-verdict-claims.test.mjs:69` derives the path from `STATE.md`'s branch and throws
  `research/raw/m056-verdict-claims.json cannot be read (ENOENT)`. That file has never been written, because the
  producer is `navigation-blocking.test.mjs`'s armed capture, which writes the pinned literal instead.
- `scripts/gate-stability-record.test.mjs:799` reports the record disagreeing at two values. One is the claims
  artefact string; the other is a count that depends on untracked files.

## Interface contract

`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Approach

- Replace the pinned literal with a path derived from the same milestone `derivedClaims()` uses, so the writer and
  both readers name one file.
- Capture that file in the primary worktree, at the head that will hold it, with everything it counts already
  tracked.
- Re-capture `research/raw/m056-gate-stability.json` in the same worktree after the claims file is tracked, so the
  two recordings are taken against one tree.
- Re-run both derivations against the captured files and prove a default run moves neither.

## Intent coverage

- SC1
- SC3

## Edges

- E5
- E6

## Verify

```bash
node --check scripts/navigation-blocking.test.mjs && node --test scripts/overlay-verdict-claims.test.mjs && node --test scripts/navigation-blocking.test.mjs && node --test scripts/gate-stability-record.test.mjs && npm run check && npm test
```

## Acceptance criteria

1. `CLAIMS_REL` is computed from the milestone under work, not written as a literal, and one armed capture writes the file both suites read.
2. `research/raw/m056-verdict-claims.json` exists, is tracked, and equals `derivedClaims()` for this head.
3. A default run of every affected suite leaves both recordings byte-identical, so only the armed capture writes.
4. `npm test` reports 1419 pass, 0 fail on this branch; `npm run check` exits 0.
5. Cross-check E5 holds: a mutation that points the derived path back at the M044 literal reddens `overlay-verdict-claims.test.mjs` naming the missing file, so the derivation is load-bearing rather than decorative.

## Log

- 2026-11-15 — created from the four failures measured at `7af74f06`. No work started.

- 2026-11-15 - contract extended: editing `scripts/navigation-blocking.test.mjs` moves two values in `research/raw/m044-gate-shapes.json` (archiveReferences.references and suiteDiff), which reddens three assertions in `scripts/gate-integrity.test.mjs` and, through it, the stability record's green pin. T003 declares that file for the same reason. Repair order: M044_CAPTURE=1 on gate-integrity, then M056_CAPTURE=1 on the stability record, then npm test in a worktree with fixture installs (a verify sidecar cannot reach the baseline).
