---
id: T006
title: Land the census chain the new suite and record moved
wave: 6
status: done
deps: []
agent: build_T006
base: cba8c636a9ab1806d62beff4f4f1e8ee8e8ed238
worktree: null
task_branch: null
files:
- scripts/tutor-record-shapes.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/m069-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/recordings.json
- scripts/navigation-blocking.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-signals-shapes.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/ds-tokens.test.mjs
- scripts/token-baseline.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- research/raw/m044-gate-shapes.json
- research/raw/m056-gate-stability.json
---
# T006 — Land the census chain the new suite and record moved

## Intent coverage

- SC4
- E7
- E8

## Context

This task exists because T005's project verify is red and this contract is the repair it owes. Read `.project/tasks/T005-run-the-project-verify-at-the-final-head.md`'s Log for the classification of every red it answers, and the plan's latest patch note for why the work is split rather than combined.

## Acceptance criteria

1. `scripts/gate-integrity.test.mjs` carries a `SUITE_DIFF_REASONS` row for `scripts/m069-verdict-claims.test.mjs`, appended after the last block the M044 recording pins, and `scripts/recordings.json` names both records this milestone writes.
2. `scripts/navigation-blocking.test.mjs` resolves an edge to the suite the bound milestone's own claim census states, and falls back to the task-file rule only when no record exists — so SC1 resolves to `scripts/ds-tokens.test.mjs` rather than to whichever suite a task happens to declare first.
3. `scripts/tutor-answer.test.mjs` and `scripts/tutor-signals-shapes.test.mjs` admit `research/raw/m069-verdict-claims.json` on their own terms, and `scripts/m068-verdict-claims.test.mjs` stands down the way the older censuses do when a later record owns the list.
4. Both recordings re-derive and are idempotent: `research/raw/m044-gate-shapes.json` and `research/raw/m056-gate-stability.json`, captured after this task's Log exists.
5. `node --test` on every suite named in this contract passes, and no assertion was widened, retuned or deleted to make it pass.

## Approach

Five reds in `npm test` come from one new suite and one new record: the census counters, the missing reason row, and the knock-on `fixRecord.exitCode 0 to 1`. Three more are suites whose rules the record should satisfy rather than bypass. Each is repaired where it lives, in this order:

1. the `SUITE_DIFF_REASONS` row, because the census counts it;
2. `scripts/navigation-blocking.test.mjs`'s edge resolution, because it currently resolves SC1 to a suite for M059 that proves nothing about tokens;
3. the two allow-lists and the older census's stand-down, which are the same class of rule;
4. then the Log, then both captures.

**The ordering is enforced, not conventional.** `scripts/gate-integrity.test.mjs` refuses an armed capture written before the task's Log exists ("a capture taken before the Log is written cannot agree with the verify that follows it"), and `scripts/gate-stability-record.test.mjs` spawns the census and records its exit, so M056 is captured last. Append the Log, then `M044_CAPTURE=1`, then `M056_CAPTURE=1`, then a default run of each to prove idempotence, then land.

## Files

Every path this task may touch, and nothing else:

- `scripts/tutor-record-shapes.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/m069-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/recordings.json`
- `scripts/navigation-blocking.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/tutor-signals-shapes.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/ds-tokens.test.mjs`
- `scripts/token-baseline.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-stability-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `research/raw/m044-gate-shapes.json`
- `research/raw/m056-gate-stability.json`

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
node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/navigation-blocking.test.mjs && node --test scripts/tutor-answer.test.mjs && node --test scripts/gate-stability-record.test.mjs
```

## Log

- 2026-11-25: created by the plan patch that pays T005's reds.
- 2026-11-25: the branch is proved before anything moved — `git rev-parse --abbrev-ref HEAD` prints `gsd-path/M069`. Three of the reds this task owns are its own; the fourth was diagnosed rather than matched, and the measurement below says why.
- 2026-11-25: the census row. `scripts/gate-integrity.test.mjs` gains its `SUITE_DIFF_REASONS` row for `scripts/m069-verdict-claims.test.mjs`, appended after the last `Object.assign` in the file (the image-budget block) because a row added above a pinned reference moves it. Before: `T004 AC4` red with `scripts/m069-verdict-claims.test.mjs differs from d94502d1 and SUITE_DIFF_REASONS has no row for it`. The row is a reading of that suite's own diff — the criteria quoted with their lengths, one claim per edge of the intent's five-column table, the edge-suite table it states and writes into `evidence.plan.edgeSuites`, every citation opened at the line it states, `refuseUnlessOwn` on the bound branch, the seven mutants and the one armed write. `scripts/recordings.json` names `research/raw/m069-verdict-claims.json` with `scripts/m069-verdict-claims.test.mjs` and `M069_CAPTURE=1`, beside the token-baseline row.
- 2026-11-25: the edge resolution. Before: `SC1 is held by the plan at scripts/teardown-leak-shapes.test.mjs, and research/raw/m069-verdict-claims.json cites ["scripts/ds-tokens.test.mjs",...]: the suite the milestone assigned the criterion must be cited` — the task-file rule resolved SC1 to the first suite T002's `files:` list declares, a record-shape suite for M059 that proves nothing about tokens. `suiteForEdge` now asks the plan's own held-out row first, then the suite the bound milestone's claim census states and pins (`evidence.plan.edgeSuites`, read with `claimJson(CLAIMS_PATH, ...)` like this file's other records), then the task-file rule, which answers only the bootstrap case where no record states the table. After: `E1 -> scripts/ds-tokens.test.mjs, E2 -> scripts/ds-tokens.test.mjs, E3 -> scripts/token-baseline.test.mjs, E4 -> scripts/token-baseline.test.mjs, E5 -> scripts/panel-styles.test.mjs, E6 -> scripts/ds-tokens.test.mjs, E7 -> scripts/panel-bundle-budget.test.mjs, E8 -> scripts/ds-tokens.test.mjs`; SC1 resolves to `scripts/ds-tokens.test.mjs`; 27/27.
- 2026-11-25: one assertion in that file moved because the resolution it measures moved, and it is stated rather than quieted. The deleted-E5-row case read `the drifted SC3 claim cites the one suite the fallback resolved`; with the census resolving the deleted edge, SC3 now cites two suites — the census's for E5 and E6's own — so it reads `sc3.suites` against one suite per suite SC3's own edges resolve to, which is the stronger statement that the deleted row moves no citation at all. No tolerance was widened and no assertion was dropped: the suite-diff census derives 203 removed assertion lines, 203 re-cut and 0 dropped.
- 2026-11-25: the two allow-lists. `scripts/tutor-answer.test.mjs` admits `research/raw/m069-verdict-claims.json` to the list of claim lists held by their own census (M062, M063, M064, M067, M068, M069), 15/15. `scripts/tutor-signals-shapes.test.mjs` admits it as the one census that landed after M057's shape map was last re-derived, and derives the expected key counts from the recording plus that census's own `## Edge coverage` rows — 8 rows, the same intent-derived delta M068's T008 established — rather than reading the union back: `edge` 46 + 8 = 54 and each row field 40 + 8 = 48, 23/23.
- 2026-11-25: the stand-down, and the diagnosis under it. Before: `research/raw/m068-verdict-claims.json is not what this head derives: quotes.edges: ".project/intent/INTENT.md" -> ".project/archive/068-head-state/intent/INTENT.md"`. The record was not stale: `recordedSpelling` recognised its archive prefix as `/.project/archive/`, a leading slash `shown()` never yields, so the rebasing was a no-op and the record was compared at the archived location the ship moved its documents to instead of the live one it states. One character removed, and the record derives byte for byte again. The stand-down `scripts/guard-verdict-claims.test.mjs` applies was then added in its own shape: the owner is read from the record's own `capture.command`, the ownership chain is asserted — the owner names the record and reads the flag it arms — and the derivation, the quotes, the plan resolution and the two document paths stand down for a record another census owns. It does not fire at this head, because `research/raw/m068-verdict-claims.json` names `scripts/m068-verdict-claims.test.mjs`: all 15 pins still derive, and a 16th test plants a foreign census's command and proves the chain reddens naming it. Standing the derivation down instead would have deleted a pin that passes; nothing was widened, retuned or removed, 16/16.
- 2026-11-25: the ordering. Every edit and every recording re-derivation ran as a run first — `research/raw/m044-gate-shapes.json` red at `archiveReferences.filesExamined 385 -> 386`, `suitesExamined 201 -> 202`, the two comment lines this task's `navigation-blocking` insertion moved, `suiteDiff.examined 231 -> 232` and `fixRecord.exitCode 0 -> 1`; `research/raw/m056-gate-stability.json` red at that exit and at its `plainRun.summary`. Then this Log, then `M044_CAPTURE=1`, then `M056_CAPTURE=1`, then a default run of each to prove idempotence.
- 2026-11-25: the recordings before the capture — `research/raw/m044-gate-shapes.json` 238140 bytes, sha256 `8b97777b561c3044d313ef4d6ed3c666d00e89abf0accc7cd85a25c2a54b0b76`; `research/raw/m056-gate-stability.json` 6567 bytes, sha256 `d80fc09436e3f01d3ce59407cf58d1b6cd472b7395edf64b20bb0bf3b9583043`.
- 2026-11-25: the suites at this head: navigation-blocking 27/27, tutor-answer 15/15, tutor-signals-shapes 23/23, m068-verdict-claims 16/16, m069-verdict-claims 18/18, m067-verdict-claims 13/13, guard-verdict-claims 8/8, outlet-verdict-claims 8/8, chunk-failure-claims 14/14, guard-record-shapes 10/10, outlet-record-shapes 7/7, tutor-record-shapes 19/19, ds-tokens 21/21, token-baseline 38/38, head-record 17/17, gate-integrity-default-tasks 9/9. `teardown-leak-shapes` is 9/13 — the four reds T005 measured and T008 pays, untouched here.
- 2026-11-25: one file this task cannot touch is where the M057 vocabulary count lives, `research/raw/m057-record-shapes.json`, so `tutor-signals-shapes` states the delta in its own pin — the list it holds — rather than re-deriving a recording outside this task's contract. `prettier --write` then `--check` is clean on all six files this task edited.
- Landed paths: `scripts/tutor-record-shapes.test.mjs`, `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/m069-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/recordings.json`, `scripts/navigation-blocking.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/tutor-signals-shapes.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/ds-tokens.test.mjs`, `scripts/token-baseline.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json` — each is read from this tree, ready.
