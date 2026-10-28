---
id: T004
title: Panel compares two components resolution paths
wave: 2
deps: [T003]
status: done
agent: build_T004
base: 1d922025c08e440326cf232bab58dca53dc3f22e
worktree: null
task_branch: null
files:
  - src/panel/di-diff-display.ts
---

# T004

## Context
Compare two components' resolution paths. Find first divergent injector. Show providers on each side. Cap at 20 rows.

## Approach
Implement diff display.

## Acceptance criteria
1. Panel shows first divergent injector and providers on each side.

## Verify
```bash
node --experimental-strip-types --test scripts/di-diff-display.test.mjs
```

## Intent coverage
- SC3

## Log
- 2026-10-27 created

## Interface contract
None
- attested: owner
- 2026-10-27 implemented: diffDiPaths reports the first divergence, capped at 20 rows
