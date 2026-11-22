---
id: T002
title: Answer from the two error records, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/error-routing.js
  - scripts/error-routing.test.mjs
---

# T002 — Answer from the two error records, purely

## Goal

The join that answers whether an error the page reported was ever offered to the ErrorHandler in force, as a pure
function of the records T001 measured: it names the message, the code the message carries and the handler state, and
states `phase-not-recorded` and `no-boundary-entry` as its own absences.

## Context

The three input records exist and are recorded: the global listener's `{ text, code, component }` arrivals, M042's
`boundaryEntries`, and whether an `ErrorHandler` resolved. The join compares texts to decide `reached-handler`; it
must never decide from arrival order, because two identical messages are indistinguishable in the record (edge E2).

## Approach

`extension/error-routing.js` exports `errorRouting(records)` on `globalThis.angularAiErrorRouting`, taking
`{ errors, boundaries, handler }` and returning `{ state, message, code, owner, phase, absences, claims, detail }`
with every field present in every state. `state` is `uncaught-with-handler`, `reached-handler`,
`no-handler-provided` or `cannot-tell`. `phase` is `phase-not-recorded` unless a record states one. `owner` is
filled only from a field the record carries. Each `claims[]` entry carries `artefactPath`.

## Interface contract

T001 publishes the record-shapes record: its records section lists the artefacts it measured and its inventory names the records outside the map with a why that cites the task; its producer section names the global error listener and the boundary entries with their limits; its absence section names phase-not-recorded with its counts. T002 publishes errorRouting(records) on globalThis.angularAiErrorRouting, taking { errors, boundaries, handler } and returning { state, message, code, owner, phase, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route error-routing in PANEL_SURFACES, the LOADERS key error-routing, the exported errorRoutingPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree, with the quotes and ruling sections the navigation census derives. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5

## Acceptance criteria

1. SC1: an error with no matching boundary text and a resolved handler yields `uncaught-with-handler`, naming the
   message, the code and the handler state; a mutant that drops the boundary comparison reports `cannot-tell` and
   reddens naming the defect.
2. SC2: an error whose text a boundary entry carries yields `reached-handler` and no finding; a mutant that treats
   every global error as uncaught reddens.
3. SC3: an error recorded while no handler resolved yields `no-handler-provided`, never a handler name; a mutant
   that names any handler reddens.
4. SC4: every answer carries `phase-not-recorded` unless the record states a phase; a mutant that derives a phase
   from the message reddens.
5. SC5: the join reads only its argument and touches no global, no page and no clock; a mutant that reads a live
   page value reddens.

## Verify

```bash
node --test scripts/error-routing.test.mjs && npx prettier --check extension/error-routing.js scripts/error-routing.test.mjs && npm run check
```

## Log

- pending.
