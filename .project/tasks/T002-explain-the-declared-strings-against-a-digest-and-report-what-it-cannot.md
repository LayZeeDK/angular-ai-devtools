---
id: T002
title: Explain the declared strings against a digest and report what it cannot
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/copy-digest.json
  - extension/copy-check.js
  - scripts/copy-check.test.mjs
  - research/raw/m048-surface-copy.json
---

# T002 — Explain the declared strings against a digest and report what it cannot

## Context

T001 records the copy each surface declares. This task authors the digest of sanctioned strings and
the pure join that explains one against the other, reporting every string the digest does not
explain rather than passing it as clean. A missing digest or a surface with no strings is
`cannot-tell` with a reason from a closed set, never a clean result.

## Approach

Author `extension/copy-digest.json` from T001's measured list: one entry per sanctioned string, each
carrying the surface that renders it. Build `extension/copy-check.js` exporting
`copyCheck(surfaces, digest)`, returning `{state, unexplained, checked, reason}`. Extend
`scripts/copy-check.test.mjs`: pin the untouched module first, then mutate it four ways — a digest
entry removed, a match by similarity rather than by text, an invented row, and a missing digest
reported as clean. Each mutant must redden with the defect named by string.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`copyCheck(surfaces, digest)` receives a surfaces record (the shape T001 measured) and a digest
object, and returns `{ state, unexplained, checked, reason }`. `state` is one of `clean`,
`unexplained`, `cannot-tell`; `unexplained` is an array of `{ string, surface }`; `checked` is the
number of strings compared; `reason` is present only when `state` is `cannot-tell` and is one of a
closed set. No other file implements this function, and no caller reads the page to decide what the
copy says.

## Files

  - extension/copy-digest.json
  - extension/copy-check.js
  - scripts/copy-check.test.mjs
  - research/raw/m048-surface-copy.json

## Acceptance criteria

1. `copyCheck` returns `clean` when every declared string has a digest entry, `unexplained` naming each string the digest lacks with its surface, and `cannot-tell` with a closed reason when either side is missing.
2. Held-out E4: a surface with strings but no digest yields `cannot-tell`, and the same suite asserts the `unexplained` case beside it, so "nothing to compare" cannot collapse into "nothing wrong".
3. The suite pins the untouched module, and each of the four mutants reddens naming the defect by string.
4. Checking the same record and digest twice returns identical rows in identical order.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npx prettier --check extension/copy-check.js extension/copy-digest.json scripts/copy-check.test.mjs
```

## Log

- pending.
