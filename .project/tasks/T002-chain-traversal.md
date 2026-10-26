---
id: T002
title: Chain traversal
wave: 2
deps: [T001]
status: done
agent: owner
base: 4417ad1231786fe2c5e8888158f3b06eb8459deb
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
npx tsc -p tsconfig.json --noEmit && npx nx run angular-ai-devtools:test && npx nx run angular-ai-devtools:build-extension
```

## Intent coverage
- SC2

## Log
- 2026-10-26 created

## Interface contract
None
