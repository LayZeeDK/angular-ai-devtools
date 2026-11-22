---
id: T008
title: Re-derive the gate records the last landing moved
wave: 8
status: pending
deps: [T007]
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

# T008 — Re-derive the gate records the last landing moved

## Goal

Both gate records are stale at HEAD because T007 landed after T005 captured them: `gate-integrity` reports
`suiteDiff.differing[27].addedLines: 2689 -> 2717` and `gate-stability-record` reports
`fixRecord.exitCode: 0 -> 1`. This task re-derives them at the head that ships.

## Context

The wave-5 review found it and named it as debt rather than a T005 defect: T005's capture was exact at
`fce943d5`, and T007's twenty-eight added lines moved the suite the record counts. The rule the milestone
learned in M058 holds again — the record re-derivation is owned by the task that lands last, not by the
task that first measured it.

## Approach

Run `M044_CAPTURE=1 node --experimental-strip-types --test scripts/gate-integrity.test.mjs`, then
`M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`, stability last. Confirm each is
idempotent on a second armed run and that both suites are green on a default run.

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
