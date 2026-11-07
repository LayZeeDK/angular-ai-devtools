---
id: T010
title: Repair the copied fixture links
wave: 8
status: done
deps: [T008]
agent: orchestrator-serial
base: 34c0cd61fb2cd4207dc7c152cc87ae3d5d37ab19
worktree: null
task_branch: null
files:
  - scripts/ensure-sidecar-deps.mjs
  - scripts/sidecar-deps-bridge.test.mjs
---

# T010 — Repair the copied fixture links

## Context

`ensure-sidecar-deps.mjs` copies the fixture install into a verify sidecar (T008) because the fixture's dependency
resolution is part of what `facade-dev-build` measures. `fs.cpSync` with `dereference: false` preserves a symlink
but **rewrites its target to an absolute path**: measured in a scratch directory, `../../packages/ai-devtools-companion`
became `C:\Users\...\AppData\Local\Temp\packages\ai-devtools-companion`, which does not exist. The copied
install therefore carries a broken link, and three assertions fail in the sidecar: the lock entry, the two-copy
Router classes and the real-path anchor.

## Approach

After the copy, walk the copied install's top level; for every entry that is a symlink in the **source**, read the
source's link target verbatim and recreate the same relative link at the destination. Never resolve it and never
convert it to a directory: the relative target is the property under test.

## Interface contract

None

## Acceptance criteria

1. held-out E1: after the copy, every symlink in the copied fixture install resolves, and its target string equals
   the source's, character for character -- proven on a scratch directory where the target cannot resolve by luck.
2. A sidecar with a broken link is repaired on the next run rather than left broken.
3. The facade suite passes in a verify sidecar without any skip beyond T009's three.

## Verify

```bash
node --experimental-strip-types --test "scripts/sidecar-deps-bridge.test.mjs" && npx prettier --check scripts/ensure-sidecar-deps.mjs
```

## Intent coverage

- SC6: AC1

## Log

- dispatched
- 2026-11-08 - implemented; cpSync rewrote each copied symlink to an absolute target, so every link is now recreated from the source's own string. Prettier clean, node --check clean. Verdict: ready.
