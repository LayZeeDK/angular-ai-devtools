---
id: T011
title: Rebuild idempotency, for real
wave: 3
deps: [T005]
status: done
agent: build_T011
base: 200a014ff2e75753319218b2a307184f8ddc02e4
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-rebuild-idempotent.test.mjs
---

# T011 — Rebuild idempotency, for real

## Context

E7 is unimplemented behind a passing test. The file checks only that the fixture root and the Angular core package directory exist
and ends `assert.ok(true)`; it never performs a second build or serve, never compares the entry the second
cycle serves against the first, and never asserts that no duplicate component-package install was added.

## Approach

1. Read the suite and name the single change that would leave it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch the suite fail, restore, watch it pass.

## Interface contract

None


## Intent coverage

- SC3

## Acceptance criteria

1. The suite runs two build and serve cycles and asserts the same entry is served by both, comparing the recorded output of each rather than asserting a constant.
2. It asserts the component-package install set is identical after the second cycle, reddening when a duplicate is added.
3. It no longer contains `assert.ok(true)` or any assertion that relates a value only to itself.
4. A named mutant (a second build that appends a duplicate dependency entry) was seen reddening it, and the unmodified tree passes.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-rebuild-idempotent.test.mjs
```

## Log

- opened by orchestrator (final review blocked: the suite could not fail)
- implemented two production build cycles, byte-compared served entry documents, and asserted component-package install set unchanged; mutant (nested duplicate @angular/cdk) failed with '@angular/cdk must be installed exactly once before the first build, found 2'; unmodified tree passes (1/1)
- T011 ready
