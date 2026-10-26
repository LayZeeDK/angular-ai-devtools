---
id: T006
title: Regression gate
wave: 5
deps: [T004]
status: done
agent: owner
base: 7a1c33d752544fa2844e36994aeb38bb57e909d5
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
npx tsc -p tsconfig.json --noEmit && npx nx run angular-ai-devtools:test && npx nx run angular-ai-devtools:build-extension
```

## Intent coverage
- SC6

## Log
- 2026-10-26 created

## Interface contract
None
