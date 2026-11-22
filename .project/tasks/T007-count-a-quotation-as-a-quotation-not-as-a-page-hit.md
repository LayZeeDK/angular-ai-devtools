---
id: T007
title: Count a quotation as a quotation, not as a page hit
wave: 7
status: pending
deps: [T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m059-record-shapes.json
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T007 — Count a quotation as a quotation, not as a page hit

## Goal

Make the shape suite's page-hit count mean what it says. At this head it reads every record under
`research/raw/` that names `NG0205` as evidence that a page emitted it, so the milestone's own surface
record and claims record — which quote the code a dozen times — turned `producible` from
`not-produced` into `produced` with fifteen "page hits" nobody observed, and took four of the suite's
tests red.

## Context

The wave-1 review found it at `fce943d5`: `tests 13, pass 9, fail 4`, and the failing message reads
`the record disagrees with this head at 3 value(s)`. The cause is the classifier in
`ng0205InResearchRaw`: it tells the digest's enumeration apart from a capture by matching two literal
line shapes, so any other line naming the code counts as a page hit. T006 widened the exclusion list,
but an exclusion list cannot fix this — the next record to quote the code re-opens it.

## Approach

Classify by the record's own capacity to state an observation, not by the shape of the line: a record
carries a `producible` section when it can record what a page emitted, and every other record that
names the code is quoting it — a claim, a citation, a reason string. Count page hits only inside
records that could carry one, report the quotations as their own number, and state the rule in the
record's `finding`. A quotation rendered as evidence is the defect the milestone exists to prevent.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1

## Acceptance criteria

1. The page-hit count counts only records that can carry an observation, and the quotations are reported
   as their own number with the rule stated in the record's `finding`.
2. The record re-derives to `producible: not-produced`, `produced: 0`, and `onAPage: 0` at this head.
3. The suite is green on a default run and byte-identical on a second armed run, and no assertion is
   loosened.

## Verify

```bash
node --test scripts/teardown-leak-shapes.test.mjs && npx prettier --check scripts/teardown-leak-shapes.test.mjs research/raw/m059-record-shapes.json && npm run check
```

## Log

- pending.
