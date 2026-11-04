---
id: T003
title: The fixture provokes a real image warning
wave: 2
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/image-budget-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/image-finding.test.mjs
---

# T003 — The fixture provokes a real image warning

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Add one fixture page that uses `NgOptimizedImage` in a way that provokes a real runtime warning in dev mode — `NG2955` or `NG2952` — and make COM-1 report the image, the code and the binding that produced the offending attribute. Removing the offending attribute must leave no finding, so the test asserts the specific code rather than any warning.

## Interface contract

None

## Acceptance criteria

1. Loading the page in dev mode produces a finding naming the image, the code and the binding.
2. Removing the offending attribute leaves no finding for that image.
3. The test asserts the specific expected code, so a different warning does not pass as a match.
4. No DOM is added to the inspected page (AR-3); the page is the fixture's own.
5. Acceptance is held-out E3: removing the offending binding leaves no finding for that image.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-finding.test.mjs
```

## Held-out

held-out E3 — removing the offending binding leaves no finding.

## Intent coverage

- SC3

## Log

- created
