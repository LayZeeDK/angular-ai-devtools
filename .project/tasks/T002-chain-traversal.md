---
id: T002
title: Chain traversal
wave: 2
deps: [T001]
status: done
agent: owner
base: 4417ad12a64dbf89505f93d326e3596866544f6b
worktree: null
task_branch: null
files:
  - src/panel/chain.ts
---

## Context
Traverse producers->consumers.

## Approach
Implement.

## Acceptance criteria
1. Chain renders with node kind, label, edge direction.

## Verify
```bash
npm test -- src/panel/chain.ts
```

## Intent coverage
- SC2

## Log
- 2026-10-26 created

## Interface contract
None
