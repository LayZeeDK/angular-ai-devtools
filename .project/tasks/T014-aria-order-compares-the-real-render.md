---
id: T014
title: Aria order compares the real render
wave: 4
deps: [T010]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-aria-order.test.mjs
---

# T014 — Aria order compares the real render

## Context

The wave-3 review found that the "rendered" DOM in `fixture-aria-order.test.mjs` is built from the same
declared array it is then compared against, so the assertion is a tautology wearing a jsdom wrapper. Reversing
the actual rendered iteration in the fixture (`aria-surfaces.ts`) left both order tests green, and no Aria rule
reads option order at all. E5 requires that options are asserted in DOM order *and* that the rule reads that
order, so reordering changes the verdict.

## Approach

1. Read the suite and name the change that leaves it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch it fail, restore, watch it pass.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. The expected order is not derived from the same array the assertion reads: reversing the fixture's real rendered iteration reddens the suite, and the failure names the rendered order it saw.
2. At least one Aria rule reads the option order from the rendered tree, and reordering the rendered options changes that rule's verdict.
3. The suite no longer compares a list to a transformed copy of itself.
4. Each new assertion was seen failing under its mutant and passing when the mutant was reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-aria-rule-mutation.test.mjs
```

## Log

- opened by orchestrator (wave-3 review blocked: the repair restated the assertions without changing them)
