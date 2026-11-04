---
id: T002
title: No licence text reaches a prompt
wave: 1
status: done
deps: [T001]
agent: build_T002
base: 95fa7dd8fc342aeb3172fdd9776de2cd1a93e979
worktree: null
task_branch: null
files:
  - scripts/image-digest.mjs
  - scripts/image-digest.test.mjs
---

# T002 — No licence text reaches a prompt

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Apply the licence and copyright strip to every digest entry before any text can reach a prompt: a source comment carrying the Angular licence must not survive into the generated entry. Prove it by putting a licence string into the source and watching the guard redden, then removing it.

## Interface contract

None

## Acceptance criteria

1. A licence or copyright string present in a source does not appear in any generated entry.
2. The guard reddens when the strip is disabled, naming the code whose entry carried the text.
3. The strip runs before the token counter, so a stripped entry is measured as it will be sent.
4. Acceptance is held-out E4: a licence string in the source reddens the guard and names the code whose entry carried it.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-digest.test.mjs
```

## Held-out

held-out E4 — the licence-string mutant names the code whose entry carried it.

## Intent coverage

- SC4

## Log

- created
- implemented licence tests (11 total pass); mutants verified
- RESULT: T002 ready
