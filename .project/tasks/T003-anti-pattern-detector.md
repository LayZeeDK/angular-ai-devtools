---
id: T003
title: Anti-pattern detector
wave: 2
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/panel/anti-patterns.ts
---

## Context
Detect three patterns.

## Approach
Implement classifiers.

## Acceptance criteria
1. Three anti-patterns reported with evidence.

## Verify
```bash
npm test -- src/panel/anti-patterns.ts
```

## Intent coverage
- SC3

## Log
- 2026-10-26 created

## Interface contract
None
