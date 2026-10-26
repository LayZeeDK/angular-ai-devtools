---
id: T005
title: Browser test counter fixture
wave: 4
deps: [T004]
status: pending
agent: null
base: null
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
npm test -- e2e/provenance.spec.ts
```

## Intent coverage
- SC5

## Log
- 2026-10-26 created

## Interface contract
None
