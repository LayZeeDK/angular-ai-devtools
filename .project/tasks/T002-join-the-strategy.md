---
id: T002
title: Join the strategy and the readiness facts
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/onpush-readiness.js
  - scripts/onpush-readiness.test.mjs
---

# T002 — Join the strategy and the readiness facts

## Context

T001 records what the metadata reports on the shipped version. The synthesis decided four things: read `onPush`, treat
an unreadable read as `cannot-tell`, give the fixture a real OnPush subject, and carry signal-input facts but never
signal-output facts. The panel's existing read fails open at `extension/agent-main.js:660-671`, returning `onpush` when
nothing was read.

## Approach

A pure function over a fact list: the strategy and whichever readiness facts the caller read. It emits the facts it was
given and never a blocker, and three distinct absence states replace the fail-open default.

## Interface contract

`onpushReadiness(fact) -> { state: "finding" | "cannot-tell", component?, strategy?, facts?, reason? }` — pure, no DOM.

## Files

- `extension/onpush-readiness.js` — the join
- `scripts/onpush-readiness.test.mjs` — its tests and mutants

## Acceptance criteria

1. Held-out E1: a component whose `onPush` is false produces a finding naming the component, the strategy and each readiness fact supplied, and naming no blocker.
2. Held-out E2: with the metadata read withheld the module produces no finding; it never infers a strategy from a component name, file or selector.
3. Held-out E3: a component already on OnPush produces `cannot-tell` with reason `already-onpush`, naming no facts and no blocker.
4. An unreadable strategy produces `cannot-tell` with reason `strategy-unreadable`, never `onpush`.
5. A fact list carrying no signal-input evidence produces no input claim; an input claim appears only when the fact says the input is signal-based.
6. Two mutants redden by name, each pinning the unmutated module first: one reports a blocker, one returns `onpush` for an unreadable read.
7. The module reads no clock, no console and no DOM.

## Verify

```bash
node --experimental-strip-types --test "scripts/onpush-readiness.test.mjs"
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
