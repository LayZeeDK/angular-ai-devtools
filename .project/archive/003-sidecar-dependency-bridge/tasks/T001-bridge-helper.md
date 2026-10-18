---
id: T001
title: Add automatic verify-sidecar dependency bridge helper with reuse, fail-fast, and safe teardown
wave: 1
deps: []
status: done
agent: build_T001
base: 119a4ab2d13cc10cb48c22ef2c375aa818af70ab
worktree: null
task_branch: null
files:
  - scripts/sidecar-deps-bridge.mjs
  - scripts/sidecar-deps-bridge.test.mjs
---

# T001 — Add automatic verify-sidecar dependency bridge helper with reuse, fail-fast, and safe teardown

## Context

Milestone M003 removes the manual `mklink /J` dependency bridge for verify sidecars. Verify sidecars are pinned to the primary worktree's base commit, so a shared `node_modules` link is valid, but only for verify sidecars (task sidecars that may change package.json must not reuse it). The bridge must be created automatically in the sidecar creation path, reused when it already points at the correct primary `node_modules`, fail fast with a clear error when the primary tree is missing or broken (no `npm install`), and be unlinked non-recursively before retire so the primary `node_modules` is never damaged. Junction on Windows (`fs.symlinkSync(target, path, 'junction')` with an absolute target) and a directory symlink on POSIX (`'dir'`), with recorded linked paths. Trailing separators must never be appended to the bridge path.

## Approach

- Implement a small Node helper that creates/verifies/unlinks the bridge given a sidecar path and primary worktree path.
- Windows uses `fs.symlinkSync(absPrimaryNodeModules, sidecarNodeModules, 'junction')`; POSIX uses `'dir'`. Target must be resolved to an absolute path.
- Reuse-if-correct (E1): if `sidecar/node_modules` already exists and resolves to the same absolute primary path, do nothing. Fail fast (E2): if primary `node_modules` is missing or broken (no package.json/node types), throw a clear error and do not attempt install.
- Teardown: unlink with a non-recursive directory delete; never append a trailing separator; record linked paths. Must precede any recursive delete or `git worktree remove`.
- Prohibitions: N1 (never delete/damage primary node_modules during retire/cleanup), N2 (no npm install in sidecar), N4 (re-running must not corrupt/partially overwrite results).
- Tests pin reuse, fail-fast, and re-run idempotency. Byte-copy helpers untouched.

## Interface contract

- None

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. A fresh verify sidecar can run `npm run check` after calling the helper to bridge `node_modules`, with no manual junction step (edge E1, E2).
2. A fresh verify sidecar can run `npm test` (296/296) after bridging, and re-running reuses the bridge without corrupting results (edge E5).
3. Reusing an existing correct bridge is a no-op; a missing/broken primary `node_modules` fails fast with a clear error and triggers no install (edge E1, E2).

## Verify

```bash
node --test scripts/sidecar-deps-bridge.test.mjs
```

Heavy: no

## Log

- 2026-10-18 — created by planner
- Implemented scripts/sidecar-deps-bridge.mjs and tests; Verify: node --test scripts/sidecar-deps-bridge.test.mjs (3/3 pass)
- 2026-10-18 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
  ✔ reuse-if-correct (5.6261ms)
  ✔ fail-fast-missing-primary (1.955ms)
  ✔ rerun-reuses-bridge (3.5855ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 150.4839
  ```
