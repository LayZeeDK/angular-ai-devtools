---
id: T006
title: Browser regression gate for N3
wave: 3
deps: [T005]
status: done
agent: build_T006
base: 1d922025c08e440326cf232bab58dca53dc3f22e
worktree: null
task_branch: null
files:
  - tests/browser/di-regression.spec.ts
---

# T006

## Context
Playwright regression gate for the panel across the four supported browsers: Google Chrome Stable, Google Chrome Beta, Microsoft Edge Stable and Microsoft Edge Dev. Firefox and Safari are out of scope because they ship no Prompt API. No regressions to N1 or N2.

## Approach
Implement browser regression test.

## Acceptance criteria
1. The Playwright DI gate passes on Chrome Stable, Chrome Beta, Edge Stable and Edge Dev, and the N1/N2 regression checks still pass.

## Verify
```bash
npx playwright test --project=chrome-stable --project=chrome-beta --project=edge-stable --project=edge-dev
```

## Intent coverage
- SC6

## Log
- 2026-10-27 created

## Interface contract
None
- attested: owner

- 2026-10-27 implemented: Playwright DI regression gate on the four supported browsers
