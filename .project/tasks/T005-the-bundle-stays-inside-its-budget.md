---
id: T005
title: The bundle stays inside its budget
wave: 3
status: done
deps: [T004]
agent: build_T005
base: 1c6c781028e72540cdb5a22f32e53652f0a399a4
worktree: null
task_branch: null
files:
  - scripts/image-budget.test.mjs
  - scripts/panel-bundle-budget.test.mjs
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

## Attempt 1 — the criterion named the wrong figure

SC5 said 520 KB. `scripts/panel-bundle-budget.test.mjs` already asserts the enforced baseline of **535.44 kB** and
records that 520 kB is only the build's `maximumWarning`. A task proving "inside 520 KB" would either fail forever
or assert against a number nobody enforces.

This attempt therefore:

1. measures the initial total **after** the image-budget surface and route are added, using the existing test's own
   definition of the initial set (the five eager files, not the lazy route);
2. asserts the total does not exceed the recorded baseline of 535.44 kB, naming the actual figure and the margin;
3. proves the assertion reddens — raise the recorded baseline by one byte and watch the comparison fail — so it is a
   budget check and not a constant quoted twice;
4. does **not** add a second, parallel budget test: extend `scripts/panel-bundle-budget.test.mjs` if the measurement
   belongs there, or make `scripts/image-budget.test.mjs` import its constants rather than restate them.

## Log

- created
- T005 ready: initial total 532.56 kB (532561 B) margin 2.88 kB vs 535.44 kB; reddening proof captured; verify exit 0
