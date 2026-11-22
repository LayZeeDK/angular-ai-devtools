---
id: T007
title: Re-derive the gate records at the ship head
wave: 7
status: done
deps: [T006]
agent: build_T007
base: 44b7a85bd2d113cf1bbd0465a7726d485256d720
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
---

# T007 — Re-derive the gate records at the ship head

## Goal

Two recordings pin values this head derives, and both moved when T006 edited a suite after T005 captured them:
`suiteDiff.differing[15].addedLines: 394 -> 427` in the gate-shapes record and `fixRecord.exitCode: 0 -> 1` in the
stability record, because the suite that derives it now fails on the stale shapes record. Both are re-derived here,
as the last commit before the final review, so the ship head's derivation is the one the records state.

## Context

The rule is the one this project already paid for once: a recording that derives from the tree must be re-derived as
the last commit before a landing, because the values it pins move with every later suite edit, and the record's own
commit does not touch any suite file. T005 re-derived both at its own head; T006 then added 33 lines to
`scripts/error-routing-shapes.test.mjs`, which is `differing[15]` in the shapes record, and the stability record's
`fixRecord` section runs the gate-integrity suite, which now fails for the same reason.

## Approach

Capture both records with their own armed flags — `M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` and
`M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs` — then read them back with the same suites in
their default, read-only mode. No suite source changes: this task rewrites two recordings and nothing else.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. SC5: both records re-derive at this head — each suite's default run reads the record it just produced and finds no
   differing value, proved by running each suite a second time without its capture flag.
2. Only `research/raw/m044-gate-shapes.json` and `research/raw/m056-gate-stability.json` change; no suite source is
   edited.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs && npx prettier --check research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json && npm run check
```

## Log

- pending.
- Landed paths: `research/raw/m044-gate-shapes.json` (the only recording that moved).
- `M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` exited 0 and re-derived the shapes record at this head: `suiteDiff.differing[15].addedLines` is now 427, the count T006's 33 added suite lines produce.
- `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs` exited 0 and left its recording byte-identical, because the `fixRecord` section that had gone red derives by running the gate-integrity suite — repairing the shapes record returned it to green, so no second edit was needed.
- Both suites then read their records without a capture flag and found no differing value, which is the acceptance criterion's proof.
- No suite source changed: this task rewrote one recording and nothing else.
