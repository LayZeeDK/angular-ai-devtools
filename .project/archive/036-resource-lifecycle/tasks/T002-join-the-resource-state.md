---
id: T002
title: Join the resource state machine to a finding
wave: 2
status: done
deps: [T001]
agent: paid-deepseek-v4-1-flash-high
base: 4c82a601b154cfa2d6963f83560e7b5ed18fe02d
worktree: null
task_branch: null
files:
  - extension/resource-lifecycle.js
  - scripts/resource-lifecycle.test.mjs
---

# T002 — Join the resource state machine to a finding

## Context

T001 records what the graph reports for each resource state. The join turns one resource's labelled signals into one
finding or one `cannot-tell`, and its hardest requirement is to keep two things apart that look alike: a resource whose
params produced nothing is **idle by design**, and a resource whose loader has not answered is **still loading**. Naming the
second when the first is true sends a developer hunting a bug that is not there.

The loader's own promise is not among the labelled fields, so "the loader never resolves" is not a claim this module may
make. That is the `cannot-tell` case.

## Approach

One pure function over one fact: the resource identity as the graph names it, its status, its params status, and the reason
a read was unavailable. Emit a finding only when a status was actually read, and four absence states with distinct reasons.

## Interface contract

`resourceLifecycle(fact)` returns `{ state: "finding" | "cannot-tell", resource?, status?, params?, reason? }`, where
`reason` is one of `no-resource`, `labels-unreadable`, `params-unavailable`, `status-unavailable`. T003 consumes the same
shape; both tasks must carry this line unchanged.

## Files

- `extension/resource-lifecycle.js` — the join.
- `scripts/resource-lifecycle.test.mjs` — the four states plus mutants.

## Acceptance criteria

1. held-out E1: a fact naming a resource whose status is `loading` yields a finding carrying the `Resource#<name>` identity,
   the status and the params status, and no cause.
2. held-out E3: a fact whose params status is idle yields a finding that says idle by design, never loading and never an
   error.
3. held-out E2 and held-out E4: with the label read withheld no finding is produced, and a fact whose status could not be read yields `cannot-tell` with reason `status-unavailable`, and the module
   never names a stuck request.
4. The module emits no string naming a loader, a promise, a network stall or a verdict; a source scan proves it, and a
   mutant that emits a blocker reddens by name.

## Verify

```bash
node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs"
```

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Log

- dispatched
- 2026-11-07 — dispatched paid-deepseek-v4-1-flash-high (serial). Four statuses produce findings (loading / resolved / error / idle), idle states 'idle (by design)' and never loading or an error, and four absence reasons cover no-resource, labels-unreadable, status-unavailable and params-unavailable. A params status outside the graph's four values is refused, so a cause cannot ride in through it. Mutants M1 (names a cause inside the loader) and M2 (reports idle as loading) redden by name. 16/16, prettier clean, `tsc -p extension` exit 0. Verdict: ready.
