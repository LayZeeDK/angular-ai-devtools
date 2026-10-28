---
id: T001
title: DI path tracer MAIN-world
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/main-world/di-path-tracer.ts
---

# T001

## Context
MAIN-world tracer reads `getInjector(el)` → walks `ɵgetInjectorResolutionPath` + `ɵgetInjectorMetadata` per injector → calls `ɵgetInjectorProviders` per injector → records resolution array. Feature-detect API availability. Read-only.

## Approach
Implement read-only tracer using ɵgetInjector* APIs only.

## Acceptance criteria
1. Tracer returns resolution path for selected component.

## Verify
```bash
node --experimental-strip-types --test scripts/di-path-tracer.test.mjs
```

## Intent coverage
- SC1
- SC5

## Log
- 2026-10-27 created

## Interface contract
None
- attested: owner