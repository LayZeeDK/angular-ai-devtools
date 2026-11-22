---
id: T012
title: Give the build-output count the same floor as the other two
wave: 12
status: done
deps: [T011]
agent: build_T012
base: 7d59b49a6fda86ab1efcf40866142ea412f10019
worktree: null
task_branch: null
files:
  - scripts/tutor-signals-shapes.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
---

# T012 — Give the build-output count the same floor as the other two

## Goal

`scripts/tutor-signals-shapes.test.mjs:280` still asserts `buildOutput.length === 50`, and M059's new panel
surface made the build emit 51. It is the third frozen scope count in that suite, so it takes the same
treatment the other two already have.

## Context

T009 turned the record count and the authored-module count into floors with messages that name both
numbers. The build-output count was left as a strict equality and is now the last red standing between
M059 and its project verify — `prepare-final` ran 4m 55s and failed on `actual: 51, expected: 50`. The
defect class is one sentence: a count that describes how much there is is not a measurement of what the
record says.

## Approach

Assert `buildOutput.length >= stated.filesExcludedAsBuildOutput`, with a message naming the captured number
and this head's, and stating that the excluded set grows whenever a surface lands while a shrink is the
state worth reddening. Then re-derive both gate records, because this task edits a suite they count —
stability last.

## Interface contract

T001 publishes the record-shapes record: its digest section names the NG0205 entry verbatim with the digest hash, its message section names the fields a console message carries after the join, its producible section states whether a post-teardown touch emitted the diagnostic and names the route tried, and its absences section states the handle record absence with its counts. T002 publishes teardownLeak(records) on globalThis.angularAiTeardownLeak, taking { console, digest } and returning { state, code, message, owner, absences, claims, detail } with every field present in every state and each claims entry carrying an artefactPath. T003 publishes the route teardown-leak in PANEL_SURFACES, the LOADERS key teardown-leak, the exported teardownLeakPanel, the digest rows and the surface record. T004 publishes the verdict-claims record, whose claims cite those artefacts by artefactPath and re-derive each against the tree. T005 publishes the re-derived gate shapes and gate stability records.

## Intent coverage

- SC5

## Acceptance criteria

1. The build-output pin is a floor naming both numbers, on the same rule as the other two in the suite.
2. `scripts/tutor-signals-shapes.test.mjs`, `scripts/gate-integrity.test.mjs` and
   `scripts/gate-stability-record.test.mjs` are green at the landed head, and both gate records are
   re-derived here rather than by a later task.
3. No assertion is loosened beyond the floor rule and no count lowered.

## Verify

```bash
node --test scripts/tutor-signals-shapes.test.mjs && node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs && npx prettier --check scripts/tutor-signals-shapes.test.mjs && npm run check
```

## Log

- pending.
- Landed paths: `scripts/tutor-signals-shapes.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`.
- `buildOutput.length` was the third strict count in the suite — `50` captured at M057, `51` after M059's panel surface — and the last red standing between the milestone and its project verify. It now reads `>=` with a message naming both numbers and saying that the excluded set grows whenever a surface lands, which is the same rule T009 gave the record count and the authored-module count.
- Both gate records were re-derived in this task rather than by a later one, because this task edits a suite they count: `M044_CAPTURE=1` then `M056_CAPTURE=1`, stability last. `scripts/gate-integrity.test.mjs` 41 armed / 40 default, `scripts/gate-stability-record.test.mjs` 9 armed / 8 default, `scripts/tutor-signals-shapes.test.mjs` 21 pass.
- Three frozen scope counts in one suite, all the same defect: a number that describes how much there is, written as an equality. The rule should live in one helper next time rather than in three inline messages.
