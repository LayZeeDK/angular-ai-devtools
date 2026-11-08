---
id: T005
title: Re-cut the check-chain pin for the verification gate
wave: 5
status: done
deps: []
agent: orchestrator
base: 75a62bcf968104be2cb702fae950469663d9f35c
worktree: null
task_branch: null
files:
  - scripts/panel-typecheck-scope.test.mjs
---

# T005 — Re-cut the check-chain pin for the verification gate

## Context

`npm run check` gained `npm run gate:verification` in 08a8418, and the check-chain pin in
`scripts/panel-typecheck-scope.test.mjs` still names the list from before that stage. The pin is a
deliberate deep-equal over the whole ordered chain, so the extra stage fails the assertion at
`panel-typecheck-scope.test.mjs:351`: the chain `check` runs ends `check:companion`,
`gate:verification`, `format:check`, while `CHECK_STAGES` ends `check:companion`, `format:check`.
That single assertion is what makes `npm test` red at the reviewed head (SC6's finding P002).

The comment above `CHECK_STAGES` already states the rule the repair follows: the pin is meant to be
re-cut, never widened. A stage added on purpose is added to the list in position, in the change that
moves the chain — the pin follows the chain, never the reverse.

## Approach

Add one entry to `CHECK_STAGES`, between `'npm run check:companion'` and the Prettier comment:

```js
  // Added with the verification gate (08a8418): a milestone may not ship without working
  // verification skills, and the gate runs inside `npm run check` so the chain cannot pass
  // around it. The pin predated the stage; the pin follows the chain, never the reverse.
  'npm run gate:verification',
```

Change nothing else in the file: the assertion, its message and the six red-half cases stay byte
identical, and `package.json` keeps the stage. The alternative the finding also names — removing the
stage from `check` — is refused: the gate is the control, and deleting it to satisfy its own pin is
the narrowed check N6 forbids.

## Interface contract

None

## Files

- `scripts/panel-typecheck-scope.test.mjs`

## Acceptance criteria

1. `CHECK_STAGES` names `npm run gate:verification` in position, between `npm run check:companion` and `npm run format:check`, with the comment that records 08a8418.
2. The assertion, its message and the six red-half cases in the same file are unchanged byte for byte.
3. `package.json` still runs `npm run gate:verification` inside `check`: the chain was not edited to match the pin.
4. `node --test scripts/panel-typecheck-scope.test.mjs` passes 7 of 7 at the landing commit, and fails 1 of 7 at the task's base.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-typecheck-scope.test.mjs"
```

## Intent coverage

- SC6 — AC4

## Log

- dispatched
- 2026-11-08 - ready - `CHECK_STAGES` now names `npm run gate:verification` in position between `npm run check:companion` and `npm run format:check`, with the comment that records 08a8418; nothing else in the file changed, so the assertion, its message and the six red-half cases are byte identical, and `package.json` still runs the stage. `node --test scripts/panel-typecheck-scope.test.mjs` is 7 of 7 green at this commit; at the base the same command failed 1 of 7 with the pin refusing the extra stage. `npm run check` is green at this commit. No tolerance widened and no assertion relaxed.
