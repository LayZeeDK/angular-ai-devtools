---
id: T003
title: Pin the token layer with its own suite
wave: 3
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
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
- scripts/ds-tokens.test.mjs
- scripts/gate-integrity.test.mjs
---

# T003 — Pin the token layer with its own suite

## Context

A token layer with no suite of its own is a convention, not a contract: the values could drift back into literals, a token could be declared twice, or a second stylesheet could appear and nothing would notice.

## Approach

One read-only suite reading the stylesheet as text: every token the rules read is declared exactly once, the block precedes its readers, no colour, spacing, type or duration literal is declared outside the block, and the block is the only one holding tokens.

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. A literal declared outside the token block reddens naming the selector, the property and the line; a literal inside a comment or inside the block does not.
2. A token declared twice under one name reddens naming both, while two names for one value are not a duplicate.
3. The token block precedes every rule that reads it, and a mutant that moves a rule above the block reddens naming the rule; the suite carries its `SUITE_DIFF_REASONS` row in the same task.

## Files

Every path this task may touch, and nothing else:

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
- `scripts/ds-tokens.test.mjs`
- `scripts/gate-integrity.test.mjs`

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
node --test scripts/ds-tokens.test.mjs
```

## Log

- pending
