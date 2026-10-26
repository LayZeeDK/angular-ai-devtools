---
id: T004
title: Panel UI
wave: 3
deps: [T002, T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/panel/provenance.component.ts
---

## Context
Render chain and anti-patterns.

## Approach
Implement.

## Acceptance criteria
1. Renders chain and anti-patterns; explain button disabled with reason when Prompt API unavailable.

## Verify
```bash
npm test -- src/panel/provenance.component.ts
```

## Intent coverage
- SC2
- SC3
- SC4

## Log
- 2026-10-26 created

## Interface contract
None
