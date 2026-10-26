---
id: T004
title: Panel UI
wave: 3
deps: [T002, T003]
status: done
agent: owner
base: 7a1c33d752544fa2844e36994aeb38bb57e909d5
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
npx tsc -p tsconfig.json --noEmit && npx nx run angular-ai-devtools:test && npx nx run angular-ai-devtools:build-extension
```

## Intent coverage
- SC2
- SC3
- SC4

## Log
- 2026-10-26 created

## Interface contract
None
