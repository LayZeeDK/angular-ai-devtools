---
id: T004
title: Write the verdict claims the census derives
wave: 4
status: done
deps: [T003]
agent: build_T004
base: a3d8e07b09753e8156261e3f644b29e5e64a89ab
worktree: null
task_branch: null
files:
  - scripts/tutor-record-shapes.test.mjs
  - scripts/error-routing-shapes.test.mjs
  - research/raw/m060-record-shapes.json
  - scripts/copy-check.test.mjs
  - research/raw/m048-surface.json
  - research/raw/m060-verdict-claims.json
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T004 — Write the verdict claims the census derives

## Goal

Write the milestone's verdict-claims record in the shape `scripts/navigation-blocking.test.mjs` derives, with the
quotes and ruling sections it compares, so the census reads this milestone's record rather than failing on a shape.

## Context

M059 discovered at the ship gate that this census derives the record it compares — quotes, ruling
`{notRequired, required, why[]}` and evidence — rather than reading whatever the milestone wrote. The record must
therefore be produced in that shape by its own capture, not typed.

## Approach

Extend the capture with a claims section whose `quotes` carry the intent path, the six criteria and the nine edge
rows, whose `ruling` states the required and not-required sets with a reason each, and whose `evidence` names the
suites and recordings per criterion. Re-arm, then compare character for character.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. SC6: the record's `quotes` carry the intent path and the six criteria verbatim, and the census compares them
   character for character; a mutant that paraphrases a criterion reddens.
2. SC1: every claim re-derives against the tree, with `mismatches` empty; a mutant that changes a recorded value
   without re-deriving reddens.

## Verify

```bash
node --test scripts/navigation-blocking.test.mjs scripts/tutor-record-shapes.test.mjs && npx prettier --check research/raw/m060-verdict-claims.json && npm run check
```

## Log

- pending.
- Landed paths: `research/raw/m060-verdict-claims.json`, `scripts/tutor-record-shapes.test.mjs`, `scripts/error-routing-shapes.test.mjs`, `research/raw/m060-record-shapes.json`.
- The claims record is written by the census's own armed capture, so it is the derivation rather than a typed copy; `scripts/navigation-blocking.test.mjs` compares it with `assert.deepEqual` and passes 25/25.
- M060 is registered in the record-shapes census: `LATER`, `PINNED_OUTSIDE` (its two records), all three milestone casts, and the counts stay 34 verdict-claims and 9 surface because the map now names its own records outside itself.
- `buildRecord`'s `inventory.outsideTheMap` now holds exactly the two records M060 owes, each `{ path, why }` citing T003 and T004; the four descriptive strings it held are preserved as `inventory.measured`.
- Recaptured record: head 8166b8b4, verdict states 4170 bytes. `error-routing-shapes` 9/9 and `tutor-record-shapes` 16/16.
- No assertion was weakened, no test deleted, no count relaxed — the census's own failure named the exact derive() line to fix, and the fix was made there.
