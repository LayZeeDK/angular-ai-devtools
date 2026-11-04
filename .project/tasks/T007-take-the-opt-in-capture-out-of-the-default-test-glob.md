---
id: T007
title: Take the opt-in capture out of the default test glob
wave: 3
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/sanitizer-warning-capture.test.mjs
  - scripts/capture/sanitizer-warning.live.mjs
---

# T007 — Take the opt-in capture out of the default test glob

## Context

T001's capture suite skips its live case unless `M029_CAPTURE=1`, and the held-out edge E3 fails any `npm test` run that
reports a non-zero skip count:

```
E3: npm test reports 0 skipped and 0 todo
```

Measured at `f82c801`: `node scripts/held-out-corpus.mjs` fails `tests/held-out/e3-zero-skipped.test.mjs` after 2m39s.
So M029's own SC5 gate is red, for a reason no edit to T006's recording could affect. The skip is not a defect in the
capture — it is a defect in where the capture lives.

## Approach

Split by what each part needs:

- **`scripts/capture/sanitizer-warning.live.mjs`** — the part that starts a dev server and captures. It is not named
  `*.test.mjs`, so the default glob never collects it; it runs explicitly when a new recording is wanted, and the
  recording's own `commands` block keeps the exact line. No skip, because it is never collected in a run that does not
  want it.
- **`scripts/sanitizer-warning-capture.test.mjs`** — keeps every check that reads the existing recording and proves its
  internal consistency. Those need no server, so they always run, and the suite reports zero skips.

## Interface contract

None

## Files

- `scripts/sanitizer-warning-capture.test.mjs`
- `scripts/capture/sanitizer-warning.live.mjs`

## Acceptance criteria

1. The default glob collects no skipped case: `node --test scripts/sanitizer-warning-capture.test.mjs` reports 0 skipped.
2. The always-run checks still prove the recording's consistency: counts, ordering, and the safe binding's absence.
3. `node scripts/held-out-corpus.mjs` passes, including `tests/held-out/e3-zero-skipped.test.mjs`.
4. A mutant reddens the always-run suite: a fabricated warning injected into a copy of the recording is refused.

## Verify

```bash
node scripts/held-out-corpus.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
