---
id: T001
title: Document verify-sidecar dependency bridge and confirm baseline
wave: 1
deps: []
status: done
agent: build_T001
base: 5c9ea9c18d395a0bad51146b1828193e6d354ef2
worktree: null
task_branch: null
files:
  - AGENTS.md
---

# T001 — Document verify-sidecar dependency bridge and confirm baseline

## Context

Milestone M002 hardens the verify-sidecar workflow. Verify sidecars created by `isolation.py isolate-verify` ship without `node_modules`, so `npm run check` fails with TS2688 unless dependencies are bridged from the primary worktree. Aborted runs leave stale sidecar directories that block re-runs. This task documents the bridge procedure in AGENTS.md and confirms the baseline stays green. `isolation.py retire --force` already clears stale sidecars (verified during M002 setup).

## Approach

- Add a short "Verify sidecar dependencies" subsection to AGENTS.md (under Browsers or Toolchain) documenting: create a directory junction from the sidecar to the primary `node_modules`, run `npm run check`, remove the junction afterwards. Windows command: `mklink /J <sidecar>\node_modules <primary>\node_modules`. Note that the junction must be removed before retiring the sidecar.
- Confirm `isolation.py retire --force` removes a stale sidecar (worktree + branch) — already exercised; record evidence in Log.
- Run `npm run check` and `npm test` to confirm baseline green (296 tests).

## Interface contract

- None

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. AGENTS.md contains a documented dependency-bridge procedure naming the junction command and cleanup step.
2. `npm run check` exits 0 and `npm test` reports 296 passing after the change.

## Verify

```bash
grep -q "Verify sidecar" AGENTS.md && npm run check
```

Heavy: no

## Log

- 2026-10-18 — created by planner (AFK mode)
- 2026-10-18 — implemented: added "Verify sidecar dependencies" subsection to AGENTS.md under Toolchain, documenting junction bridge command and cleanup. `isolation.py retire --force` clears stale sidecars (verified during M002 setup).
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): fail, exit 1; output tail:
  ```
  
  > check
  > tsc -p tsconfig.json && npm run check:skills
  
  error TS2688: Cannot find type definition file for 'node'.
    The file is in the program because:
      Entry point of type library 'node' specified in compilerOptions
  ```
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): fail, exit 1; output tail:
  ```
  Microsoft Windows [Version 10.0.26200.9550]
  (c) Microsoft Corporation. Alle rettigheder forbeholdes.
  
  C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\task-t001-verify>
  > check
  > tsc -p tsconfig.json && npm run check:skills
  
  error TS2688: Cannot find type definition file for 'node'.
    The file is in the program because:
      Entry point of type library 'node' specified in compilerOptions
  ```
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0
