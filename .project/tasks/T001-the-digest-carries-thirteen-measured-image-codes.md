---
id: T001
title: The digest carries thirteen measured image codes
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/image-digest.mjs
  - scripts/image-digest.test.mjs
---

# T001 — The digest carries thirteen measured image codes

## Context

See `.project/intent/INTENT.md` and `.project/research/evidence-image-codes.md`. The measured image code set is
thirteen codes: `NG0913` plus `NG2952` through `NG2967`. The roadmap's `NG02200` through `NG02800` range does not
exist in Angular 22.2.

## Approach

Generate `scripts/image-digest.mjs` at extension build time: one entry per code in the measured set `NG0913`, `NG2952`, `NG2955`, `NG2956`, `NG2959`, `NG2960`, `NG2961`, `NG2962`, `NG2963`, `NG2964`, `NG2965`, `NG2966`, `NG2967` — thirteen entries and no others. Each entry carries the code, a one-line meaning and a one-line fix, and is at most 150 tokens measured by a token counter rather than estimated. A code outside the set is reported as unknown rather than given invented text.

## Interface contract

None

## Acceptance criteria

1. The digest has exactly thirteen entries and their codes equal the measured set.
2. Every entry is at most 150 tokens measured by the counter, and the counter reddens on a 151-token entry.
3. A code outside the measured set is reported as unknown and never given an invented entry.
4. The digest is produced by the build, so deleting the generator leaves it stale or absent rather than silently unchanged.
5. Acceptance is held-out E1 and held-out E2: a digest missing a measured code, carrying an unmeasured one, or with an entry over 150 tokens is named by the suite.

## Verify

```bash
npm ci --include=dev; node --test scripts/image-digest.test.mjs
```

## Held-out

held-out E1 and held-out E2 — the missing-code, extra-code and over-cap mutants are named.

## Intent coverage

- SC1
- SC2

## Log

- created
