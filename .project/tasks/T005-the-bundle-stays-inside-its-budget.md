---
id: T005
title: The bundle stays inside its budget
wave: 3
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/image-budget.test.mjs
---

# T005 — The bundle stays inside its budget

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Prove the initial bundle stays inside 520 KB after the digest and the surface are added, and that the budget assertion reddens when it is exceeded. Re-run the gate so a green build cannot hide a fabricated entry.

## Interface contract

None

## Acceptance criteria

1. The initial bundle is measured and fails the assertion when it exceeds 520 KB.
2. The measurement names the actual size so a reader can see the margin.
3. `npm run check` and `npm test` pass at the head.
4. Acceptance is held-out E5: the bundle measurement reddens naming the actual size when it exceeds 520 KB.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-budget.test.mjs
```

## Held-out

held-out E5 — the over-budget mutant reddens naming the size.

## Intent coverage

- SC5

## Log

- created
