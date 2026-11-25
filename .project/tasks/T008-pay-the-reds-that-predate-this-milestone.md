---
id: T008
title: Pay the reds that predate this milestone
wave: 8
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/teardown-leak.test.mjs
- scripts/m069-verdict-claims.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/ds-tokens.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/teardown-leak-shapes.test.mjs
- scripts/token-baseline.test.mjs
- research/raw/m059-record-shapes.json
- research/raw/m069-token-baseline.json
---
# T008 — Pay the reds that predate this milestone

## Intent coverage

- SC4
- E7

## Context

This task exists because T005's project verify is red and this contract is the repair it owes. Read `.project/tasks/T005-run-the-project-verify-at-the-final-head.md`'s Log for the classification of every red it answers, and the plan's latest patch note for why the work is split rather than combined.

## Acceptance criteria

1. `research/raw/m059-record-shapes.json` is re-derived so its suite and record counts match this head, and `scripts/teardown-leak-shapes.test.mjs` passes including its held-out E9 read-only pin.
2. `research/raw/m069-token-baseline.json` states a byte total in prose, which is what the recording-consistency rule requires of a recording that carries one, and the record is re-captured only through its own armed run.
3. The prose is appended as the last top-level field of the record so the line `scripts/m069-verdict-claims.test.mjs` cites for it does not move; if it moves anyway, the claim census is re-captured with `M069_CAPTURE=1` and the move is stated.
4. Every suite this contract names passes, and the reason these pre-existing reds are paid for here rather than deferred is written into the plan's patch note.

## Approach

T005's acceptance criterion is that the project verify exits 0, and five suites were red before this milestone touched anything, so the criterion cannot be met while they stay red. That is why they are paid for here rather than deferred, and the plan says so in a patch note so M070 does not read the absence as clean.

Each has one cause: a record whose counts were taken at an older head, and a recording that carries a byte total the consistency rule requires it to state in prose. Fix the cause, re-derive through the artefact's own armed path, and re-run the suite. Do not relax the consistency rule — a recording with a byte count and no prose is an empty scan, and an empty scan passing is the failure mode the rule exists to catch.

## Files

Every path this task may touch, and nothing else:

- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/teardown-leak.test.mjs`
- `scripts/m069-verdict-claims.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/ds-tokens.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/token-baseline.test.mjs`
- `research/raw/m059-record-shapes.json`
- `research/raw/m069-token-baseline.json`

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
node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/token-baseline.test.mjs && node --test scripts/m069-verdict-claims.test.mjs
```

## Log

- 2026-11-25: created by the plan patch that pays T005's reds.
