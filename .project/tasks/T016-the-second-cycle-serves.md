---
id: T016
title: The second cycle serves
wave: 5
deps: [T011]
status: done
agent: build_T016
base: 49360bc9507e5c9534dc6f872cb79e46d59949f1
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-rebuild-idempotent.test.mjs
---

# T016 — The second cycle serves

## Context

E7 requires that "a second build **and serve** cycle leaves the same entry served". The suite runs two
production builds and compares their output directories, but nothing is ever served or fetched, so the served
entry is unobserved. Worse, the install-set measurement is taken for both cycles back to back at the end, which
makes the between-cycles assertion a self-repeat: no measurement happens between the cycles at all.

## Approach

1. Name the change that leaves the check green today.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. The suite serves the built entry and fetches it, asserting the same document is served after the second cycle as after the first.
2. The component-package install set is measured **between** the cycles, so a duplicate introduced by the first build is observed by the second measurement rather than compared with itself.
3. A mutant that adds a duplicate component-package entry during the first cycle reddens the suite, with the failure naming the duplicate.
4. The suite fails rather than skips when the install it needs is absent.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-rebuild-idempotent.test.mjs
```

## Log

- opened by orchestrator (final review blocked: the gap reviewers probed three checks that cannot fail)
- T016 coder: both cycles now serve - a node:http static server over each build output binds an ephemeral 127.0.0.1 port, GETs / and the entry's own bundle, and asserts a byte-identical entry (sha256 5b715c2f...) after both cycles; install set measured before, BETWEEN the cycles (after cycle 1, before cycle 2's build) and after cycle 2; mutant (duplicate @angular/cdk installed during cycle 1) reddens at the between-cycles measurement naming 2 occurrences; Verify exit 0 (tests 1, pass 1, fail 0) - ready
