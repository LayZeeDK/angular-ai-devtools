---
id: T009
title: Harness family proofs
wave: 3
deps: [T002]
status: in-progress
agent: build_T009
base: de2912dc3d5e35c82cec4cdfb71fcab76ff255b7
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - tests/held-out/fixture-harness-root-boundary.test.mjs
  - tests/held-out/fixture-harness-ambiguity.test.mjs
  - tests/held-out/fixture-harness-predicate.test.mjs
  - tests/held-out/fixture-harness-action.test.mjs
---

# T009 — Harness family proofs

## Context

Four suites guard the harness family and three of them cannot fail. `fixture-harness-root-boundary`
asserts source text (the string `<ng-content` and a count of "projected content") and never renders the
boundary. `fixture-harness-ambiguity` never excludes `id` from the attributes the harness matches on, so
giving one host a distinguishing `id` — prohibition N1 exactly — leaves it green. `fixture-harness-predicate`
never drives a non-matching predicate to its named no-match. `fixture-harness-action` asserts `signal()` and
`count()` implementation state, which prohibition N7 forbids; the observable effect is unverified.

## Approach

1. Read the suite and name the single change that would leave it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch the suite fail, restore, watch it pass.

## Interface contract

None


## Intent coverage

- SC1

## Acceptance criteria

1. E1 renders the fixture and asserts that content inside the component root is included and content outside is excluded, with the projection point moved as the mutant that reddens it.
2. E2 asserts the two hosts are identical in every attribute the harness matches on, with `id` named as excluded, and reddens when a distinguishing attribute is added to one host.
3. E3 drives a predicate that matches nothing and asserts the named no-match it reports, reddening when the predicate silently passes an empty result.
4. E4 asserts the observable effect of the fixture action, not `signal()` or `count()` state, and reddens when the effect is removed.
5. Each of the four assertions names its file and its mutant in the failure message, and each was seen failing before it was seen passing.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-root-boundary.test.mjs tests/held-out/fixture-harness-ambiguity.test.mjs tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs
```

## Log

- opened by orchestrator (final review blocked: the suite could not fail)
