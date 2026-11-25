---
id: T005
title: Run the project verify at the final head
wave: 5
status: in-progress
deps: []
agent: build_T005
base: 6c9750b20bc7fd50689e2cbbdca3c816c2ce9d85
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
- scripts/m069-verdict-claims.test.mjs
- research/raw/m069-verdict-claims.json
---

# T005 — Run the project verify at the final head

## Context

The project verify is the only run that proves the milestone did not break the build it measures, and it must run from a landing that changes nothing the recordings count. Every milestone that skipped that ordering paid a red verify for it.

## Approach

The census is **per milestone**, which measurement settled after a wrong guess: the previous milestone's census suite
refuses at this head rather than writing M069's record — it is M063's census and says so — and the milestones beside it
each own one (`m067-verdict-claims.test.mjs`, `m068-verdict-claims.test.mjs`). So this task writes
`scripts/m069-verdict-claims.test.mjs` on the previous milestone's shape: one claim per intent criterion quoting it
verbatim, one row per edge of the held-out table, the milestone derived from the branch STATE binds so the suite cannot
be captured against another milestone, and `M069_CAPTURE=1` as the only write. Then the record, then the project verify.

## Approach (the earlier draft)

Capture this milestone's verdict claims, run the plan's project verify unchanged, and record its exit and counts. This landing adds no suite and changes no stylesheet, so the recordings T004 re-derived stay true.

## Intent coverage

- SC4

## Acceptance criteria

1. The record names one claim per intent criterion quoting each verbatim, and one row per edge of the intent's table, with every citation re-resolved at this head.
2. The project verify runs at this head and exits 0, and its stage-by-stage outcome and test counts are recorded in this task's Log with the command that produced them.
3. This landing adds no suite and changes no stylesheet, so the census and the stability record stay true at this head.

## Files

Every path this task may touch, and nothing else:

- `scripts/m069-verdict-claims.test.mjs`
- `research/raw/m069-verdict-claims.json`

## Interface contract

Byte-identical across the tasks that share it:

```css
/* apps/angular-ai-devtools/src/styles.css — one token block, before every rule */
:root {
  --ds-density-*: ...;
  --ds-color-*: ...;
  --ds-type-*: ...;
  --ds-motion-*: ...;
}
```

Every rule that renders a panel value reads a token; the token block precedes the rules that read it.

## Verify

```bash
M069_CAPTURE=1 node --test scripts/m069-verdict-claims.test.mjs && node --test scripts/m069-verdict-claims.test.mjs && node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test
```

## Log

- pending
- 2026-11-25: the census is per milestone, measured rather than assumed. `scripts/m069-verdict-claims.test.mjs` derives the milestone from the branch STATE binds and refuses at any other, so it cannot capture another milestone's record; `guard-verdict-claims` and `chunk-failure-claims` stand down once M069's record exists, which is how the shared-census reading was refuted.
- 2026-11-25: the record is 43,842 bytes, sha256 `0b85d1a2...c4b3e434`, 4 claims quoting their criteria verbatim (232, 156, 230, 139 characters), 8 edge rows, 15 test-declaration citations, 32 line citations, 0 absences. Armed re-run writes nothing; unarmed run is 18/18 and the armed run 19/19.
- 2026-11-25: `npm run check` exit 0 across twelve stages, the extension building at 538.25 kB against the 538.25 kB declared ceiling. `npm test` is red: 2,422 tests, 2,404 pass, 18 fail.
- 2026-11-25: the eighteen reds, by who caused them. **This landing**: the census counters (`suiteDiff.examined` 231 to 232, `archiveReferences.filesExamined` 385 to 386, `suitesExamined` 201 to 202), the missing `SUITE_DIFF_REASONS` row for the new suite, and the knock-on `fixRecord.exitCode 0 to 1` in the stability record — all in `scripts/gate-integrity.test.mjs`, `research/raw/m044-gate-shapes.json` and `research/raw/m056-gate-stability.json`, none of which this task may touch.
- 2026-11-25: **T002's collateral**: `visual-qa-style-read.test.mjs` quotes `apps/angular-ai-devtools/src/styles.css:42/55/64/89` for declarations the token block moved, and its three mutants redden by the same lines. The recording must be re-derived against the rewritten sheet, not relaxed.
- 2026-11-25: **pre-existing at this base**: `teardown-leak-shapes` (four tests, record counts 168/169 against 170/170), `m068-verdict-claims` (the older-census class), `navigation-blocking`, `tutor-answer` and `tutor-signals-shapes` (M069's claim list is not yet in their allow-lists), `recording-consistency` (no byte total stated in prose in the baseline record).
- 2026-11-25: one rule was refused rather than satisfied. `navigation-blocking` resolved SC1 to `scripts/teardown-leak-shapes.test.mjs` because that is the first suite T002 declares — a record-shape suite for M059 that proves nothing about the token layer. Citing it would have been an invented citation, so the assertion stays red and the assignment needs making honest in a task, not matching in a record.
- 2026-11-25: this task is activated and unlanded with its Verify red. Every path it dirtied is inside its own contract: the census suite and its record, both untracked.
