---
id: T005
title: Re-derive the two gate records and the census
wave: 5
status: pending
deps: [T004]
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

T001 publishes `research/raw/m059-record-shapes.json`, whose `digest` section names the `NG0205` entry
verbatim with the digest's hash, whose `message` section names the fields a console message carries after
the join, whose `producible` section states whether a post-teardown touch emitted the diagnostic and names
the route tried, and whose `absences` section states the handle record's absence with its counts. T002
publishes `teardownLeak(records)` on `globalThis.angularAiTeardownLeak`, taking `{ console, digest }` and
returning `{ state, code, message, owner, absences, claims, detail }` with every field present in every
state and each `claims[]` entry carrying `artefactPath`. T003 publishes the route `teardown-leak` in
`PANEL_SURFACES`, the `LOADERS` key `'teardown-leak'`, the exported `teardownLeakPanel` and the surface
record `research/raw/m059-surface.json`. T004 publishes `research/raw/m059-verdict-claims.json`, whose
`claims[]` cite those artefacts by `artefactPath` and re-derive each against the tree. T005 publishes the
re-derived `research/raw/m044-gate-shapes.json` and `research/raw/m056-gate-stability.json`.

## Intent coverage

- SC5 — AC1: the records the gate reads are re-derived from this tree and are idempotent on a second run.

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
