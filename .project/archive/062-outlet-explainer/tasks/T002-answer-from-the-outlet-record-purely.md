---
id: T002
title: Answer from the outlet record, purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 95dc4af16721100e55c68b41d50fc6c8f077e3a9
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
- Landed paths: `extension/outlet-answer.js`, `scripts/outlet-answer.test.mjs`.
- `outletAnswer(record)` is a pure function of the record T001 writes, published at `globalThis.angularAiOutletAnswer` the way M061's join is published. Every answer is one object of the five contract fields built in one place, so a pin on its keys is a pin on every state.
- The one normalisation is written once: an absent `requested` is reported as `primary`. The record keeps `null`, because an unnamed outlet and `primary` are the same outlet while a configuration that states nothing is still a distinct fact.
- `outlet-absent` is the state where both names are recorded and differ; a missing `matched` is `cannot-tell` with the record's own reason. E7 and E2 pin the boundaries that the four state names leave open: a route the state never reached is not a mismatch, and two outlets declared in order name the first rather than the last read.
- Nine mutants were measured both ways — each drives the mutated value first and asserts it bit, then asserts the pin reddens — including a DOM fallback, a remedy string, a component-name fallback, a dropped normalisation, a last-name selection, dropped chain-level absences and a template-derived name.
- `scripts/gate-integrity.test.mjs` is red at this head because the new suite has no `SUITE_DIFF_REASONS` row; the coder recorded that instead of editing a path outside its contract, and the re-derivation task owns the row.
- Recorded tension, not silently resolved: AC2 makes a missing name `cannot-tell`, which leaves `outlet-absent` to mean only that the two recorded names differ. If that is not the intended reading, AC2's wording is what moves.
