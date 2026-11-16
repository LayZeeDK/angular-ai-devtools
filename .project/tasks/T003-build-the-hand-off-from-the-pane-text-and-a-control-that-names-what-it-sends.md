---
id: T003
title: Build the hand-off from the pane text and a control that names what it sends
wave: 3
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/copy-to-agent.js
  - scripts/copy-to-agent.test.mjs
---

# T003 — Build the hand-off from the pane text and a control that names what it sends

## Context

T001 records that the pane's text and a copy path's composed text differ for at least one subject, which
is the reason this milestone exists. The join must therefore take the pane's rendered text as its input rather than
recomposing from the record.

## Approach

Add a pure join that accepts the rendered text and the finding's identifiers and returns the hand-off,
plus a control description naming what will be sent before it sends. The join never reads the fact list for its
text. The suite pins the pane text as the source and reddens when a mutant recomposes from the record.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - extension/copy-to-agent.js
  - scripts/copy-to-agent.test.mjs

## Acceptance criteria

1. The hand-off returns the pane's rendered text unchanged, and a mutant that recomposes it from the record reddens the pin naming the difference.
2. The control description states what will be sent, and states no cause, element, remedy or rule identity the finding does not carry.

## Verify

```bash
node --test scripts/copy-to-agent.test.mjs && npx prettier --check extension/copy-to-agent.js scripts/copy-to-agent.test.mjs
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
