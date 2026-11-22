---
id: T002
title: Answer from the outlet record, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/outlet-answer.js
  - scripts/outlet-answer.test.mjs
---

# T002 — Answer from the outlet record, purely

## Goal

Join the record into four states, with no read of the rendered tree and no remedy in the answer.

## Context

The record exists after T001. This task is the join only: it must be a pure function of that record, so a reader can see that the answer was not decorated with a cause or a fix.

## Approach

One exported function plus one global observer, following the shape the other explainers use. Four states; an absent `requested` reported as `primary`; an outlet the record does not carry is `cannot-tell` with the reason. Mutants: a DOM fallback, a remedy string, a name taken from a component.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. SC1: a record naming a second outlet yields `outlet-matched` with both names and the path; a mutant that renames the outlet reddens naming the field.
2. SC2: a record with no `matched` yields `cannot-tell` carrying the reason, never a nearby name; a mutant that falls back to a rendered name reddens.
3. SC3: the function reads no argument but the record — its suite asserts the module mentions no DOM API and no second record.

## Verify

```bash
node --test scripts/outlet-answer.test.mjs && npx prettier --check extension/outlet-answer.js scripts/outlet-answer.test.mjs
```

## Log

- pending.
