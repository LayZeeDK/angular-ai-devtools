---
id: T013
title: Predicate and action suites learn to fail
wave: 4
deps: [T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-harness-predicate.test.mjs
  - tests/held-out/fixture-harness-action.test.mjs
---

# T013 — Predicate and action suites learn to fail

## Context

The wave-3 review made `advance()` a no-op — removing the action's effect entirely — and both action tests
stayed green, because the suite asserts a string in the page source rather than the effect. The predicate suite
has no predicate subject at all: it counts source occurrences, so a predicate that silently passes an empty
result cannot redden it. T009 changed the failure messages, not the assertions. This is the repeat-offender
pattern the review named: a receipt that says "repaired" over an unchanged check.

## Approach

1. Read the suite and name the change that leaves it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch it fail, restore, watch it pass.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. Making the fixture action's `advance()` a no-op reddens the action suite, and the failure names the effect that did not happen.
2. The predicate suite drives a real predicate against the fixture, asserts the named no-match a non-matching predicate reports, and reddens when the predicate silently passes an empty result.
3. Neither suite counts occurrences in source text as its primary assertion; each names the rendered or executed behaviour it checks.
4. Each new assertion was seen failing under its mutant and passing when the mutant was reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs
```

## Log

- opened by orchestrator (wave-3 review blocked: the repair restated the assertions without changing them)
