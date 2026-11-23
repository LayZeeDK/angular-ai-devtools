---
id: T005
title: Re-derive this milestone's own records
wave: 5
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m063-record-shapes.json
  - scripts/guard-record-shapes.test.mjs
  - research/raw/m059-record-shapes.json
  - scripts/teardown-leak-shapes.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/navigation-blocking.test.mjs
---

# T005 — Re-derive this milestone's own records

## Goal

Write the map this milestone owes and re-derive the census that counts it, then read both back unarmed.

## Context

D6: a recording that derives from the tree moves with every later edit, so the capture is a task, not a step.

## Approach

Derive the map from the two extension modules in a bare context, never typed. The record-count census moves with it; capture both armed and read both back.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both records state what this head derives — each is read back unarmed with no differing value; a mutant that moves one counted field reddens naming the record.
2. SC4: a record captured at a head this checkout does not carry refuses to land, naming both heads.

## Verify

```bash
M063_CAPTURE=1 node --test scripts/guard-record-shapes.test.mjs && M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/guard-record-shapes.test.mjs scripts/teardown-leak-shapes.test.mjs
```

## Log

- pending.
