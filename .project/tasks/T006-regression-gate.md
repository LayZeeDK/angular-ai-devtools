---
id: T006
title: Regression gate
wave: 5
deps: [T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/regression.spec.ts
---

## Context
Regression.

## Approach
Run checks.

## Acceptance criteria
1. npm run check, npm test, build-extension pass.

## Verify
```bash
npm test -- src/regression.spec.ts
```

## Intent coverage
- SC6

## Log
- 2026-10-26 created

## Interface contract
None
