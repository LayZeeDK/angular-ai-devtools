---
id: T006
title: Repair the shape suite the milestone's own artefacts moved
wave: 6
status: done
deps: [T003]
agent: build_T006
base: cf5d56edb14e8b1113569cf130c8c8971823bb4b
worktree: null
task_branch: null
files:
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m059-record-shapes.json
  - scripts/teardown-leak.test.mjs
---

# T006 — Repair the shape suite the milestone's own artefacts moved

## Goal

Make T001's shape suite count the tree it is meant to count. Its scan walks `extension/*.js` and
`scripts/*.mjs` on disk and excludes only the two files T001 added, so T002's landing moved
`filesSearched` 38 → 39 and 136 → 137 and three of its tests fail, while its occurrence counts stay 0 —
the milestone's central claim is untouched and only the denominators drifted.

## Context

Recorded at the moment it appeared: T002's Log names the drift and the values, and T003's surface record
repeats it under `knownDrift` with a second consequence — the record for the surface names the code, so
the shapes suite's `research/raw` scan would read 147 records instead of 146 and 20 occurrences instead of
2, flipping its derived `producible` verdict from `not-produced` to `produced` with 18 page hits. That
would be a false measurement produced by a record that only quotes the code, so the repair is to exclude
the milestone's own artefacts from the scan, not to re-capture a verdict.

## Approach

Give the suite one explicit list of the artefacts this milestone adds — the record-shapes record, the shape
suite itself, the surface record and the join and its suite — and exclude all of them from both scans,
stating why in the same sentence the current exclusion states. Then re-derive the record's counts with its
own armed command so the numbers in the record match the tree, and confirm the `producible` verdict stays
`not-produced` with 0 page hits.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC1

## Acceptance criteria

1. The shape suite's scans exclude every artefact this milestone adds, named explicitly, and its
   `filesSearched` counts match the tree at this head.
2. The record is re-derived by its own armed command, its occurrence counts stay 0 for all three needles,
   and its `producible` verdict stays `not-produced` with zero page hits.
3. No assertion is loosened and no count lowered: the repair changes what is counted, never what is
   claimed.

## Verify

```bash
node --test scripts/teardown-leak-shapes.test.mjs && npx prettier --check scripts/teardown-leak-shapes.test.mjs research/raw/m059-record-shapes.json && npm run check
```

## Log

- pending.
- Landed paths: `scripts/teardown-leak-shapes.test.mjs`, `research/raw/m059-record-shapes.json`.
- The suite now excludes four of this milestone's own files rather than two: its own source, the record,
  `extension/teardown-leak.js` and `scripts/teardown-leak.test.mjs`. The denominators are again 38 modules
  and 136 suites measured against the tree this milestone found, and the occurrence counts stay 0 / 0 / 0.
- Re-armed with `M059_CAPTURE=1`: the `producible` verdict stays `not-produced` and no page hit appears,
  which is the point of the repair — a record that merely quotes the code must not turn the measurement
  into `produced`.
- One self-consistency defect was fixed in the same task: the `commands` block carried a typed
  `git rev-parse HEAD` output from an earlier capture, so the record could state one head and print
  another. That entry is now derived from the capture's own head and the suite asserts they agree.
- `node --test scripts/teardown-leak-shapes.test.mjs` is 13 pass / 0 fail on a default run and 14 pass /
  0 fail armed; a second armed run is byte-identical.
