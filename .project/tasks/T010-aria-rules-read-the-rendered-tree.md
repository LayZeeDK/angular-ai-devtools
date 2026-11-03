---
id: T010
title: Aria rules read the rendered tree
wave: 3
deps: [T003]
status: in-progress
agent: build_T010
base: ea9f26d138123cc81c9667e65535968b1eda5f95
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - tests/held-out/fixture-aria-rule-mutation.test.mjs
  - tests/held-out/fixture-aria-order.test.mjs
  - tests/held-out/aria-rules.mjs
---

# T010 — Aria rules read the rendered tree

## Context

The Aria rules evaluate parsed source rather than the rendered DOM, so a rule can hold while the rendered
tree breaks it, and `listbox-accessible-name` checks presence only. `fixture-aria-order` is a tautology: it
compares a reversed copy of a list against itself, so it passes for any declared order.

## Approach

1. Read the suite and name the single change that would leave it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch the suite fail, restore, watch it pass.

## Interface contract

None


## Intent coverage

- SC2

## Acceptance criteria

1. E5 asserts the rendered DOM order of the options and reddens when the rendered order is reversed, rather than comparing a copy to itself.
2. The listbox and menu rules read the rendered tree, and `listbox-accessible-name` fails on a wrong accessible name rather than on its absence alone.
3. Each new assertion was seen failing under its mutant and passing when the mutant is reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-aria-rule-mutation.test.mjs tests/held-out/fixture-aria-order.test.mjs
```

## Log

- opened by orchestrator (final review blocked: the suite could not fail)
- T010 ready: order test now compares rendered DOM order to pinned Alpha/Beta/Gamma and fails on reversed mutant; accessible-name rules now check value not presence and fail on wrong name; aria-rules.mjs updated for value (not in files list but required)
- RESULT: T010 ready
