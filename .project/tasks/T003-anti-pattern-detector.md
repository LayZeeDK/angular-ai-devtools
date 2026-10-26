---
id: T003
title: Anti-pattern detector
wave: 2
deps: [T001]
status: done
agent: owner
base: 4417ad1231786fe2c5e8888158f3b06eb8459deb
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
npx tsc -p tsconfig.json --noEmit && npx nx run angular-ai-devtools:test && npx nx run angular-ai-devtools:build-extension
```

## Intent coverage
- SC3

## Log
- 2026-10-26 created

## Interface contract
None
