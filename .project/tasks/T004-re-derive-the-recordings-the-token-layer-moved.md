---
id: T004
title: Re-derive the recordings the token layer moved
wave: 4
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/panel-styles.test.mjs
- scripts/nx-config-policy.test.mjs
- scripts/image-budget.test.mjs
- scripts/panel-bundle-budget.test.mjs
- scripts/token-baseline.test.mjs
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- research/raw/m044-gate-shapes.json
- research/raw/m056-gate-stability.json
- scripts/gate-integrity.test.mjs
- scripts/gate-stability-record.test.mjs
---

# T004 — Re-derive the recordings the token layer moved

## Context

The token block costs 3,580 emitted bytes: the panel bundle measured 534.67 kB at this milestone's base and 538.25 kB
after the tokens landed, against a pin of 535.44 kB. That overrun is declared here and paid for deliberately, with its
reason and the next milestone's projection, rather than absorbed by widening the pin quietly.

## Approach

The bundle pin is not edited; the **historical** number stays the fact it is. `PRE_MILESTONE_INITIAL_KB` keeps 535.44
and the test that calls it the pre-milestone measurement keeps asserting exactly that. Beside it, a declared ceiling:
`MILESTONE_INITIAL_KB`, with `MILESTONE_BUDGET_MOVE_REASON` naming the milestone, the byte cost and what it bought.
`assertWithinBaseline` compares against the ceiling, so both suites that measure the total follow it, and a reason that
does not name the milestone or the cost fails, so the next move cannot be quiet.

## Context (recordings)

Two suites and a stylesheet moved, so the census counts different files and the stability record pins a suite whose exit it must now describe. M068 paid three refusals for capturing these in the wrong order; the census is captured after the last suite edit and the stability record after the census.

## Approach

Re-derive the census through its own arm, then the stability record through its arm, each default-run afterwards, and capture immediately before the landing so the head does not move between capture and commit.

## Intent coverage

- SC4

## Acceptance criteria

1. Both recordings are re-derived at this head and their default runs report zero failures.
2. Every value that moved is named with what moved it: the two suites and the stylesheet this milestone changed, and the bundle pin records the token block's measured cost with the reason it is declared rather than a widened tolerance.
3. A second armed run of each writes nothing, and a default run writes nothing.

## Files

Every path this task may touch, and nothing else:

- `scripts/panel-styles.test.mjs`
- `scripts/nx-config-policy.test.mjs`
- `scripts/image-budget.test.mjs`
- `scripts/panel-bundle-budget.test.mjs`
- `scripts/token-baseline.test.mjs`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `research/raw/m044-gate-shapes.json`
- `research/raw/m056-gate-stability.json`
- `scripts/gate-integrity.test.mjs`
- `scripts/gate-stability-record.test.mjs`

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
node --experimental-strip-types --test scripts/gate-integrity.test.mjs && node --test scripts/gate-stability-record.test.mjs
```

## Log

- pending
