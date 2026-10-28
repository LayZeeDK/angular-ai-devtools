---
id: T002
title: DI token lookup by name
wave: 1
deps: [T001]
status: done
agent: build_T002
base: 1d922025c08e440326cf232bab58dca53dc3f22e
worktree: null
task_branch: null
files:
  - src/main-world/di-lookup.ts
---

# T002

## Context
Token lookup by name on Tier 1. `ɵgetInjectorProviders` returns `ProviderRecord[] = {token, isViewProvider, provider, importPath?}`. Token name matching only.

## Approach
Implement lookup matching by token name.

## Acceptance criteria
1. Lookup returns provider record for queried token name on path.

## Verify
```bash
node --experimental-strip-types --test scripts/di-lookup.test.mjs
```

## Intent coverage
- SC2

## Log
- 2026-10-27 created

## Interface contract
None
- attested: owner
- 2026-10-27 implemented: findProviderInjector matches a token name along the resolution path
