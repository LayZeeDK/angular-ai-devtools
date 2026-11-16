---
id: T005
title: Give cannot-tell a closed reason set and prove an invented cause reddens
wave: 4
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/copy-to-agent.js
  - scripts/copy-to-agent.test.mjs
---

# T005 — Give cannot-tell a closed reason set and prove an invented cause reddens

## Context

`cannot-tell` currently accepts any string. A reason vocabulary that is open lets a caller name a cause the
observable does not state, which is the prohibition the milestone carries.

## Approach

Constrain the reasons to a closed set, export it, and pin it: an outside value reddens, and each member
carries the sentence the pane draws for it.

## Intent coverage

- SC3

## Interface contract

None

## Files

  - extension/copy-to-agent.js
  - scripts/copy-to-agent.test.mjs

## Acceptance criteria

1. The reason set is closed and exported, and a value outside it reddens the suite naming the value.
2. Each member's sentence is asserted to the character, so a reworded sentence reddens.

## Verify

```bash
node --test scripts/copy-to-agent.test.mjs
npx prettier --check extension/copy-to-agent.js scripts/copy-to-agent.test.mjs
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
