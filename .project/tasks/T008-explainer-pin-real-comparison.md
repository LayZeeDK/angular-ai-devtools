---
id: T008
title: Make the explainer-unchanged pin a real comparison
wave: 2
deps: [T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T008 — Make the explainer-unchanged pin a real comparison

## Context

T005's held-out suite is 50 lines. It imports `createHash`, defines a `PINS` table, computes
`sha256(readFileSync(p))` into a variable called `actual`, then asserts that a mutated copy differs from the
original (a tautology), that a copy equals the original (also a tautology), and finishes with
`assert.ok(true)`. **It never compares `actual` to `PINS`.** Its own receipt claimed a SHA-256 pin with a
one-byte falsifiability check; the file does not implement it. Deleting an explainer, or rewriting one, leaves
the suite green — which is precisely what INTENT N2 forbids and what SC3 exists to prevent.

## Approach

1. Enumerate **all four** shipped explainer components explicitly in `PINS`, each entry a repository-relative
   path and its expected digest.
2. For each entry: read the file, compute the digest, and assert equality **naming the file and both digests**
   in the failure message. A missing file is a failure, not a skip.
3. Prove the pin is live, in the same suite:
   - delete (or rename) one explainer inside a `try/finally` that restores it, and assert the suite's own
     comparison function throws naming that file;
   - flip one byte in one explainer inside the same guard and assert the comparison throws naming that file.
4. Remove the closing `assert.ok(true)` and any comparison that only relates a value to itself.

## Interface contract

None

## Intent coverage

- SC3 — the fixture builds and serves, and the four shipped explainers still answer on it.
- N2 — a shipped explainer's question, answer or selector is unchanged.

## Acceptance criteria

1. `PINS` holds one entry for each of the four shipped explainer components, and each entry's digest is compared against that file's current bytes, with the file path in the failure message.
2. With one explainer temporarily removed, the suite **fails** and names that file; the file is restored before the test ends whatever happens.
3. With one explainer's source altered by a single byte, the suite **fails** and names that file.
4. On the unmodified tree the suite passes, and no assertion in it compares a value only to itself.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- created by orchestrator (wave-2 review: T005's pin never compares its digests to its table)
