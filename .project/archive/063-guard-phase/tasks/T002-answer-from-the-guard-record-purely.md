---
id: T002
title: Answer from the guard record, purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: 5eca4467c9084401e5fc3bacf5dc7f19182ef622
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
- Landed paths: `extension/guard-answer.js`, `scripts/guard-answer.test.mjs` — 28 tests.
- `guardAnswer(record)` returns `{ state, phase, guard, verdict, absences }` in all four states and reads only `record.rows` and `record.absences`: not the record's own `state` word, which would be a second opinion about the same rows. It spells no phase word at all, so T001's census of phase producers holds at the source rather than only at the test.
- The `guard-verdict-not-recorded` token is read from `extension/navigation-narrator.js`'s namespace rather than retyped, and the suite asserts the narrator still answers it.
- Five states the contract left open are decided and pinned: a refusal with no phase, a refusal with neither field, a phase-only row outranked by a later refusal, two refusals ordered by arrival, and the record's own state word ignored.
- Eight mutants were measured both ways, each proving the mutated value bit before the pin reddened — including a console fallback, an unstated verdict answered as a pass, an empty record answered as a verdict, an invented phase, a nearest-route attribution and a remedy string.
- `scripts/navigation-blocking.test.mjs` is 8 red at this head with or without these files: it reads `research/raw/m063-verdict-claims.json`, which has never been captured. That record is T004's.
