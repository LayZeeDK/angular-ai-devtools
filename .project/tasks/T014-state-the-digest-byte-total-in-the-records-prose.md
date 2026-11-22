---
id: T014
title: State the digest byte total in the record's prose
wave: 14
status: pending
deps: [T013]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m059-record-shapes.json
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/navigation-blocking.test.mjs
---

# T014 — State the digest byte total in the record's prose

## Goal

`scripts/recording-consistency.test.mjs` refuses a recording that records a byte total and states none in
prose — "the scan examined nothing in it, so its silence proves nothing". M059's record records
`digest.bytes` and its verdict said nothing about it, so the project verify could not be green.

## Context

The verdict is built by `verdictOf()` in `scripts/teardown-leak-shapes.test.mjs`, so a sentence added to the
JSON by hand would be dropped by the next armed run. The fix belongs in the derivation, and it is one clause
on the first verdict sentence.

## Approach

Open the verdict with the byte total the record already measures — "the digest is ${digest.bytes} bytes and
carries …" — then re-arm the record and re-derive both gate records, because this task edits a suite they
count, stability last.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. The record's prose states the byte total it records, and the statement comes from the derivation rather
   than from the JSON.
2. `scripts/recording-consistency.test.mjs` and `scripts/teardown-leak-shapes.test.mjs` are green at the
   landed head, on default and armed runs, and the record is idempotent on a second armed run.
3. Both gate records are re-derived in this task and are green.

## Verify

```bash
node --test scripts/recording-consistency.test.mjs scripts/teardown-leak-shapes.test.mjs && node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs && npx prettier --check scripts/teardown-leak-shapes.test.mjs research/raw/m059-record-shapes.json && npm run check
```

## Log

- pending.
