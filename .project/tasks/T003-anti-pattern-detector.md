---
id: T003
title: Anti-pattern detector
wave: 2
deps: [T001]
status: done
agent: owner
base: 4417ad12a64dbf89505f93d326e3596866544f6b
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
