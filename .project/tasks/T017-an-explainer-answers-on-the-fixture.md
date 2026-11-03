---
id: T017
title: An explainer answers on the fixture
wave: 5
deps: [T008]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T017 — An explainer answers on the fixture

## Context

SC3 says "the four shipped explainers still answer on it". What exists is an anti-tamper guard: four source
files hash to four pins. No suite asks an explainer a question. Deleting an explainer from the panel's tool
registry, its route or its imports leaves all four pins matching, so the criterion has no behavioural
evidence at all.

## Approach

1. Name the change that leaves the check green today.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. The suite asks each of the four shipped explainers a question and asserts the answer it gives, through the surface a user reaches them by rather than by reading their source.
2. Removing one explainer from the panel's tool registry or route reddens the suite, and the failure names the explainer that no longer answers.
3. The existing hash pins remain and still fail on a source change; this task adds behaviour rather than replacing the guard.
4. The suite fails rather than skips when the panel build it needs is absent.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- opened by orchestrator (final review blocked: the gap reviewers probed three checks that cannot fail)
