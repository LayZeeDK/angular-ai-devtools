---
id: T006
title: Capture the milestone verdict claims and run the project verify
wave: 6
status: in-progress
deps: []
agent: build_T006
base: 0d2b05cf305bf5533adc2e5c011e11813a7afa65
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
- scripts/m068-verdict-claims.test.mjs
- research/raw/m068-verdict-claims.json
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
---

# T006 — Capture the milestone verdict claims and run the project verify

## Context

Every milestone in this programme owes a verdict-claims record; M067 shipped without one and seven suites were red until it was captured. The census also needs a reason row for the new suite, and the project verify is the only run that can prove the milestone did not break the build it measures.

## Approach

Write the claims suite behind its own arm, derive the record from this milestone's own intent and plan, add the `SUITE_DIFF_REASONS` row in the same landing, then run the project verify and record its exit and counts.

## Intent coverage

- SC4

## Acceptance criteria

1. The record names one claim per intent criterion, quoting each verbatim, and a default run reproduces it byte for byte.
2. The new suite carries its `SUITE_DIFF_REASONS` row, and the census reports zero findings at this head.
3. The project verify runs at the final head and its exit code and counts are recorded in this task's Log with the command that produced them.

## Files

Every path this task may touch, and nothing else:

- `scripts/m068-verdict-claims.test.mjs`
- `research/raw/m068-verdict-claims.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`

## Interface contract

Byte-identical across the tasks that share it:

```ts
// extension/head-state.js — the only reader of a document head entry's state
export function headState(record, facts) {
  return { state, entry, present, writtenBy, reason, observed }
}
```

`state` is one of `current`, `stale`, `duplicate`, `cannot-tell`. `present` and `writtenBy` are present only when the record
carries them; `reason` names why the comparison could not be made.

## Verify

```bash
node --test scripts/m068-verdict-claims.test.mjs && npm run check && npm test
```

## Log

- pending
- 2026-11-25: `research/raw/m068-verdict-claims.json` captured behind `M068_CAPTURE=1 node --test scripts/m068-verdict-claims.test.mjs` - 46 345 characters, sha256 28dbbf78…a7; 4 claims (one per intent criterion, each quoting it verbatim with its length: SC1 190, SC2 229, SC3 187, SC4 233 characters), 8 edge claims (one per row of the intent's five-column table, cells verbatim), 17 test-declaration citations and 35 further line citations over 4 suites, every citation opened and read at the line it states; the two measured absences recorded under `absence` on E2 (`duplicate.read: false`) and E4 (`writtenBy.read: false`) with what was searched and what was found. A second armed run moved no byte (sha256 identical); the unarmed run is 15/15 pass.
- 2026-11-25: `SUITE_DIFF_REASONS` gained its row for `scripts/m068-verdict-claims.test.mjs`, appended after the last line the M044 recording pins.
- 2026-11-25: `scripts/m067-verdict-claims.test.mjs` now stands down for a record another census owns - it holds `research/raw/m068-verdict-claims.json` to the ownership chain (record → owner → record → flag) and skips only the pins its own plan table would answer - 13/13 pass, its own-milestone branch unchanged; `scripts/tutor-answer.test.mjs` excuses the new claim list in its stated census list and is green again.
- 2026-11-25: the census at this head: `scripts/overlay-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs` and `scripts/m068-verdict-claims.test.mjs` all exit 0, and the gate's own stages report zero findings: `node scripts/gate-integrity.mjs --check archive` exit 0, "examined 24 live path reference(s) of 237 reference(s) in 199 suite(s), across 6 relocated subtree(s) … pass - 0 finding(s)"; `node scripts/gate-integrity.mjs --check fix-record` exit 0, "examined 28 claim(s) in 6 task log(s) … pass - 0 finding(s), 5 mention(s)".
- 2026-11-25: project verify, run as the plan's four stages at head 0d2b05cf with this landing's working tree (the harness caps one command at ten minutes, so the chain the plan states was run stage by stage, same order, stopping as `&&` does): `node scripts/ensure-sidecar-deps.mjs` exit 0; `npx nx run angular-ai-devtools:build-extension` exit 0; `npm run check` exit 0 (every stage green, `format:check` included: "All matched files use Prettier code style!"); `npm test` **exit 1** - its node stage ran 2341 tests in 319 suites, 2331 pass, 10 fail, and the `&&` chain stopped there, so `npx nx run angular-ai-devtools:test` was run on its own and exits 0 (8.0 s), while `node scripts/run-user-scope-tests.mjs` and `npm run test:held-out` did not run.
- 2026-11-25: the ten failing tests, named: `scripts/gate-integrity.test.mjs` "the recording still re-derives from the tree, the range and the stream this head carries" (archiveReferences.filesExamined 382 -> 383, suitesExamined 198 -> 199, and a `scripts/m067-verdict-claims.test.mjs` reference whose line moved - 15 values in all), "AC1: every class the record decided is the class the check derives, and no row diverges" (the same reference at the line it moved to) and "T004: the three new sections are what this head derives, so a default run is a read" (suiteDiff.examined 228 -> 229, wholeTree 228 -> 229 suites and 3008 -> 3024 test declarations); `scripts/gate-stability-record.test.mjs` "the three sections are what this head derives…" (fixRecord.exitCode 0 -> 1, a consequence of the gate suite above) and "the fixRecord section records the green suite its three repairs produced"; `scripts/teardown-leak-shapes.test.mjs` four tests (its map: recordsSearched 168 -> 169, scripts.filesSearched 167 -> 168, and the verdict sentence that states both); `scripts/tutor-signals-shapes.test.mjs` "no edge carries a field to order a write in" (the edge vocabulary: edge 38 -> 46, category/detail/disposition/suite 32 -> 40).
- 2026-11-25: those ten are three recordings outside this task's files list, each measured rather than guessed: `research/raw/m044-gate-shapes.json` (a new suite is one more file and one more differing suite, so its tree counts and its reference lines move; re-capture `set "M044_CAPTURE=1"&& node --experimental-strip-types --test scripts/gate-integrity.test.mjs`), `research/raw/m057-record-shapes.json` (the edge vocabulary this record adds 8 rows to; `scripts/tutor-signals-shapes.test.mjs`, its reader, is outside this task's list too) and `research/raw/m059-record-shapes.json` (one more record and one more suite under its scans; re-capture `M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs`), and `research/raw/m056-gate-stability.json` moves only because the gate suite above exits 1 (`M056_CAPTURE=1`). Nothing was retuned, skipped or deleted to make any of them pass, and no tolerance was widened.
- 2026-11-25: `npx prettier --check` on every file this task touched is clean, and `npm run check`'s own `format:check` says the same of the whole tree.
- 2026-11-25: re-captured once, because two phrasings in the suite's own absence table still read `the record own`: the armed run moved exactly one value (`claims[0].citations[3].holds`), a third armed run moved no byte, and the record now stands at 46 379 characters, sha256 9edf875f…43; the unarmed run is still 15/15 pass and `npx prettier --check` is clean on the suite.
- 2026-11-25: the whole verify re-run after that final capture, unchanged: `node scripts/ensure-sidecar-deps.mjs` exit 0, `npx nx run angular-ai-devtools:build-extension` exit 0, `npm run check` exit 0, `npm test` exit 1 with its node stage at 2341 tests in 319 suites, 2331 pass and the same ten failing tests named above, and `npx nx run angular-ai-devtools:test` exit 0.

