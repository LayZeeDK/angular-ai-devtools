---
id: T007
title: Re-derive the gate records and run the project verify
wave: 7
status: pending
deps: [T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T007 — Re-derive the gate records and run the project verify

## Goal

Capture the tree-derived gate record at this head, then run the project verify and observe it reach its last leg.

## Context

The gate record derives from the whole tree, so it is captured last. Every verify from wave 4 onward in M062 stopped in `npm test` leg 1, and a one-line defect in the app suite sat unnoticed for six waves.

## Approach

Capture with `M044_CAPTURE=1`, read it back, then run the project verify line verbatim. Report which legs ran: `npm run check`, `npm test` leg 1, user-scope tests, skills, `test:app` and the held-out corpus. A run that stops early is a finding, not a pass.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: the gate record re-derives at this head; a mutant that changes one counted denominator reddens by field name.
2. SC4: the project verify builds before it measures, exits 0, reaches `test:app` and the held-out corpus, and its command is recorded verbatim.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs
```

## Log

- pending.
