---
id: T005
title: Re-derive the gate records and run the project verify
wave: 5
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/error-routing-shapes.test.mjs
  - research/raw/m060-record-shapes.json
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m059-record-shapes.json
  - scripts/tutor-answer.test.mjs
  - research/raw/m060-surface.json
  - research/raw/m060-verdict-claims.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
---

# T005 — Re-derive the gate records and run the project verify

## Goal

Re-derive both gate records after every suite edit this milestone makes, so the project verify is green at the head
that lands, and run the project verify itself.

## Context

Every suite edit this milestone makes moves the gate records. M059 met this three times in one milestone and the
stability record embeds the integrity suite's own summary line, so it must be re-armed immediately before landing.

## Approach

Add the reason each changed suite differs to `SUITE_DIFF_REASONS`, then run the integrity capture, then the
stability capture, then the project verify. Each record is derived by its own armed command; none is edited by hand.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5
- SC6

## Acceptance criteria

1. SC5: both gate records are derived by their armed commands and re-derive identically on a second run; a hand
   edit anywhere in either record reddens.
2. SC6: the project verify passes at this head, and every suite named in the census declarations section of
   `PLAN.md` runs in it.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs && npm run check && npm test
```

## Log

- pending.
