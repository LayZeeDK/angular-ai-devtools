---
id: T010
title: Pin the build-output count and re-derive the gate records
wave: 5
status: done
deps: []
agent: build_T010
base: ea9bae02c10ac303ebaed0f733a816bcf657a3f8
worktree: null
task_branch: null
files:
  - scripts/tutor-signals-shapes.test.mjs
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
---

# T010 — Pin the build-output count and re-derive the gate records

## Goal

The one value in the signal-shape record that a build can move — the count of files under
`extension/panel/` — is asserted by a suite instead of only recorded, so the next panel rebuild that
changes it reddens a test rather than drifting the record silently (wave-6 GAP 1, wave-7 GAP 2).
The two gate records are re-derived afterwards, because this task edits a suite the gate counts.

## Context

`research/raw/m057-record-shapes.json` records
`negativeMeasurements.writeRecord.filesExcludedAsBuildOutput` — 50 at this head — and no suite reads
it: the wave-6 review recorded that as the gap that lets the value drift. This task closes it with an
assertion in the suite that already re-derives that record's neighbours, then re-derives the two
records whose derived counts this suite edit moves. It owns no acceptance criterion of its own, and
the plan's `## Intent coverage` names no row for it.

## Approach

Add one assertion to `scripts/tutor-signals-shapes.test.mjs`, in the same reading the suite already
performs for `filesScanned`: walk `extension/panel/` the way the record's own scan does, compare the
count to `negativeMeasurements.writeRecord.filesExcludedAsBuildOutput`, and fail naming the value and
both numbers when they differ. Then re-derive `research/raw/m044-gate-shapes.json` with its armed
command and `research/raw/m056-gate-stability.json` with its own, the latter last, because its mention
count is a function of this milestone's task logs including this task's own.

## Interface contract

T001 publishes the record-shapes field map, whose terminal-class key sets, config five fields,
absence names `no-guard-verdict` and `no-redirect-decision`, attribution rule (by `id` and
`route.path`, never by position) and `reach.readFrom` are the only fields T002's join may read,
and whose `inventory.outsideTheMap` names exactly the surface record T003 writes and the
verdict-claims record T004 writes. T002 publishes the join module T002 creates:
`tutorRouting(records)` on `globalThis.angularAiTutorRouting`, `records` = `{ navigation, config }`,
one object out — `{ state, question, terminal, route, absences, unconfigured, claims, detail }`,
every field present in every state, each `claims[]` entry carrying `artefactPath` — which T003's
pane renders and whose route, loader key and state fields the surface record T003 writes states and
T004's claims record re-derives against. T003 publishes the route `tutor-routing` in
`PANEL_SURFACES` through the shared `loadPanelDemo` closure, the `LOADERS` key `'tutor-routing'`,
the exported `tutorRoutingPanel`, the `PANE_SENTENCES` registry and the digest rows in
`extension/copy-digest.json`.

## Intent coverage

- None

## Acceptance criteria

1. The suite asserts the panel output count against the record, and a mutant that changes the recorded
   number reddens naming the value and both counts.
2. Both gate records are re-derived by their own armed commands and are idempotent on a second run.
3. No assertion is loosened and no count lowered anywhere.

## Verify

```bash
node --test scripts/tutor-signals-shapes.test.mjs && node --test scripts/gate-stability-record.test.mjs && npx prettier --check scripts/tutor-signals-shapes.test.mjs research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json && npm run check
```

## Log

- pending.
- Landed paths: `scripts/tutor-signals-shapes.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`.
- The gap the wave-6 review named is closed: the suite now compares the `extension/panel/` build-output count it walks against `negativeMeasurements.writeRecord.filesExcludedAsBuildOutput`, and a doctored copy of the record reddens naming both numbers — `... is 51 but the extension/panel/ build output this tree carries is 50 file(s)`. The existing `filesScanned` reading is the same walk filtered the other way, so nothing was loosened.
- Measured at this head: `extension/` 109 files, `extension/panel/` 50, authored 59, matching the record's 50 and 59.
- `research/raw/m044-gate-shapes.json` re-derived with its armed command: `suiteDiff.differing[32].addedLines` 568 -> 575, `addedAssertionLines` 83 -> 84, totals 4984 -> 4985, sha256 `ad1e21bb…`, idempotent on a second run. `research/raw/m056-gate-stability.json` re-derived last and reported nothing moved at that moment.
