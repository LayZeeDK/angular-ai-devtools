---
id: T005
title: Re-derive the two gate records and the census
wave: 5
status: done
deps: [T004]
agent: build_T005
base: 56291be51a320fa50b8a46312f66f8ca24f74a5d
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T005 — Re-derive the two gate records and the census

## Goal

Re-derive the two gate records this milestone's suites and Logs move, with each record's own armed
command, stability last — so that the recordings the ship gate reads describe the tree that ships.

## Context

`research/raw/m044-gate-shapes.json` derives suite counts and assertion lines from the tree and moves when
a suite is added or edited; `research/raw/m056-gate-stability.json` derives its mention count from the task
Logs and moves when a Log is written, which is why it is re-derived last and by a task that adds nothing
else. `scripts/gate-stability-record.test.mjs` reads the stability record and is declared because the
record it pins is the file this task changes.

## Approach

Run `M044_CAPTURE=1 node --experimental-strip-types --test scripts/gate-integrity.test.mjs`, then
`M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`. Confirm each is idempotent on a second
armed run, and record the moved values with the command that produced them.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. SC5: both gate records are re-derived by their own armed commands, stability last, and each is
   idempotent on a second armed run.
2. No assertion is loosened and no recorded count is lowered to make a red green.
3. The moved values are recorded in the Log with the command that produced each.

## Verify

```bash
node --test scripts/gate-stability-record.test.mjs && npx prettier --check research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json && npm run check
```

## Log

- pending.
- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`.
- Both records are re-derived by their own armed commands: `M044_CAPTURE=1` then `M056_CAPTURE=1`, stability last. `scripts/gate-integrity.test.mjs` is 40 pass / 0 fail on a default run and 41 armed; `scripts/gate-stability-record.test.mjs` is 8 pass / 0 fail and 9 armed, and a second armed run changes no byte.
- The gate's own rule earned two entries rather than one: `SUITE_DIFF_REASONS` refuses to record a suite that differs from the measured head without a reason read for it, so the two suites this milestone adds — `scripts/teardown-leak-shapes.test.mjs` (T006's exclusion repair and the head self-consistency fix) and `scripts/teardown-leak.test.mjs` (the join's eighteen tests and seven mutants) — are each recorded with the reason they moved, in the same commit that re-derives the record.
- Moved values, all measured after the last T005 landing: `archiveReferences.filesExamined` 323 → 327, `archiveReferences.suitesExamined` 165 → 167, and the five further counts the armed run reported when the records were re-derived at this head.
- No assertion was loosened and no count lowered; the only edits to a suite are the two reason entries and the formatting of the same table.
