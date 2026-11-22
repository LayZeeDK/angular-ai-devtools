---
id: T001
title: Measure the two error records and the join's shape
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m060-record-shapes.json
  - scripts/error-routing-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/recording-consistency.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
---

# T001 — Measure the two error records and the join's shape

## Goal

Measure what the global error listener record, M042's boundary entries and the injector walk actually state, and
record it in one file that is also the census map: it carries `records[]` and `inventory.outsideTheMap`, so the
record-shapes census reads this file rather than a second one.

## Context

`extension/agent-main.js:2550-2561` installs the two global listeners and reduces an arrival to `{ text, code,
component }`; `:1904-1944` resolves the `ErrorHandler` and records boundary arrivals. No record in this tree names
the phase an uncaught error was thrown in, which is why criterion 4 is a named absence. The record must state its
own byte total in prose, because `scripts/recording-consistency.test.mjs:275` scans for one.

## Approach

Write `research/raw/m060-record-shapes.json` from an armed capture (`M060_CAPTURE=1`), never typed: the record, the
producer, the absence and the map sections are all produced by the capture function so a re-run cannot drop them.
The suite `scripts/error-routing-shapes.test.mjs` pins each section and excludes this milestone's own files from its
own scans.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1
- SC5

## Acceptance criteria

1. SC6: the record names the surface this milestone will add and the states it will render, taken from the
   intent's surface contract rather than written here.
2. SC1: the producer section names the global error listener with its two event names and the boundary entries with
   their limit, each read from the source at the captured head; a mutant that omits the listener reddens naming it.
3. SC5: the record states that no listener was added by this milestone and the count it read; a mutant that records
   two listeners reddens.
4. The record states its own byte total in prose, so the byte-consistency scan has something to compare.

## Verify

```bash
M060_CAPTURE=1 node --test scripts/error-routing-shapes.test.mjs && node --test scripts/error-routing-shapes.test.mjs scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs scripts/recording-consistency.test.mjs && npx prettier --check research/raw/m060-record-shapes.json scripts/error-routing-shapes.test.mjs && npm run check
```

## Log

- pending.
