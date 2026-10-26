---
id: T001
title: Provenance tracer MAIN-world
wave: 1
deps: []
status: done
agent: owner
base: 1be902d2a64dbf89505f93d326e3596866544f6b
worktree: null
task_branch: null
files:
  - src/main-world/provenance-tracer.ts
---

# T001

## Context
Validate exact ng.ɵgetSignalGraph output shape.

## Approach
Implement tracer.

## Acceptance criteria
1. Tracer returns provenance chain for selected signal.

## Verify
```bash
npx tsc -p tsconfig.json --noEmit && npx nx run angular-ai-devtools:test && npx nx run angular-ai-devtools:build-extension
```

## Intent coverage
- SC1

## Log
- 2026-10-26 created
## Interface contract
None
