---
id: T003
title: Panel renders DI resolution path
wave: 1
deps: [T001, T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/panel/di-path-display.ts
---

# T003

## Context
Panel renders resolution path: list of injectors with metadata ({type, source}) + provider record for queried token.

## Approach
Implement panel path display.

## Acceptance criteria
1. Panel displays injector boundaries and provider record for queried token.

## Verify
```bash
node --experimental-strip-types --test scripts/di-path-display.test.mjs
```

## Intent coverage
- SC2

## Log
- 2026-10-27 created

## Interface contract
None
- attested: owner