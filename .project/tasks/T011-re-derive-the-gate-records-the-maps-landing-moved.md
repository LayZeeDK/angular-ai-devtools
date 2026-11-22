---
id: T011
title: Re-derive the gate records the map's landing moved
wave: 11
status: pending
deps: [T010]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
---

# T011 — Re-derive the gate records the map's landing moved

## Goal

T010 edited four suites, so `scripts/gate-integrity.test.mjs` is red at its head — 37 pass / 3 fail, with
`suiteDiff.differing[27].addedLines: 2717 -> 2810` and a stale `tutor-signals-shapes` row. This task
re-derives the two gate records at the head that ships.

## Context

The same rule as T008: the record re-derivation belongs to the task that lands last, not the one that first
measured. The repair is the armed runs themselves — `M044_CAPTURE=1` then `M056_CAPTURE=1`, stability last
because its count follows the task Logs.

## Approach

Run the two armed commands, confirm each is idempotent on a second armed run and that both suites are green
on a default run at the landed head.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. Both records are re-derived at this head by their own armed commands, stability last.
2. `gate-integrity` and `gate-stability-record` are green on a default run at the landed head.
3. Each record is idempotent on a second armed run, and no assertion is loosened nor any count lowered.

## Verify

```bash
node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs && npx prettier --check research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json && npm run check
```

## Log

- pending.
