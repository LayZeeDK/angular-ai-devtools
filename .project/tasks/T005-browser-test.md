---
id: T005
title: Browser test counter fixture
wave: 4
deps: [T004]
status: done
agent: owner
base: 7a1c33d752544fa2844e36994aeb38bb57e909d5
worktree: null
task_branch: null
files:
  - e2e/provenance.spec.ts
---

## Context
Browser test.

## Approach
Implement.

## Acceptance criteria
1. Browser test on spikes/ng222-app passes.

## Verify
```bash
npx nx run angular-ai-devtools-e2e:e2e
```

## Intent coverage
- SC5

## Log
- 2026-10-26 created

## Interface contract
None
