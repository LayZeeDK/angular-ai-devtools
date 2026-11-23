---
id: T006
title: Re-capture the records the last suites moved
wave: 6
status: pending
deps: [T005]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m063-verdict-claims.json
  - scripts/guard-verdict-claims.test.mjs
  - research/raw/m056-gate-stability.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T006 — Re-capture the records the last suites moved

## Goal

Re-capture the claims record the plan coverage moved and the stability record the gate mention count moved.

## Context

The claims record quotes the plan's coverage table, so a later wave stales it; the stability record counts the gate's mentions, and a task Log that names paths adds one.

## Approach

Capture both armed in that order, read both back unarmed, and stop rather than widen if a capture moves a pinned value.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both records state what this head derives; a mutant that moves one derived value reddens naming the record.
2. SC4: each capture is idempotent — a second armed run writes no byte.

## Verify

```bash
M063_CAPTURE=1 node --test scripts/guard-verdict-claims.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/guard-verdict-claims.test.mjs scripts/gate-stability-record.test.mjs
```

## Log

- pending.
