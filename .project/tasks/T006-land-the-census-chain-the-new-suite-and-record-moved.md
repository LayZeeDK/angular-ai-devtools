---
id: T006
title: Land the census chain the new suite and record moved
wave: 6
status: pending
deps: []
agent: null
base: null
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
