---
id: T002
title: Answer from the guard record, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/guard-answer.js
  - scripts/guard-answer.test.mjs
---

# T002 — Answer from the guard record, purely

## Goal

Join the record into four states, with no read of the page and no attribution the record does not carry.

## Context

The record exists after T001; this task is the join only.

## Approach

One exported function and one global observer. Four states; a phase-only verdict stays phase-only; a missing verdict is `cannot-tell` with the reason. Mutants: a console fallback, a remedy string, a nearest-route attribution.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. SC1: a record naming a cancelling guard yields `guard-cancelled` with phase, guard and verdict; a mutant that reorders the rows reddens naming the phase.
2. SC2: a record with no verdict yields `cannot-tell` with the reason; a mutant that fills it from the console reddens.
3. SC3: the function reads no argument but the record — its suite asserts the module mentions no DOM or console API.

## Verify

```bash
node --test scripts/guard-answer.test.mjs && npx prettier --check extension/guard-answer.js scripts/guard-answer.test.mjs
```

## Log

- pending.
