---
id: T004
title: Add held-out edge E3 pin test fallback-read-old-path to control-ai-browsers
wave: 1
deps: [T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .claude/skills/control-ai-browsers/scripts/control.test.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.test.mjs
---

# T004 — Add held-out edge E3 pin test fallback-read-old-path

## Context

Wave 1 review (cycle 1) blocked: SC4 held-out edge E3 pin test `fallback-read-old-path` missing from both control test files, despite implementation adding fallback read. Fix per review findings.

## Approach

- Add a test named `fallback-read-old-path` to both skill-tree control test files exercising copy-migration from the legacy root and fallback read when the new location is empty/missing.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. Test `fallback-read-old-path` exists and passes in both skill trees (edge E3).

## Review findings

### sc4
Criterion: `.browsers/` and `tmp/` runtime artifacts are relocated under `.commandcode/worktrees/` (or an equivalent git-ignored path) and all references are updated.
- Implementation relocates `TMP`/`PROFILES` under `.commandcode/worktrees/` and keeps a fallback read, but edge E3 held-out test `fallback-read-old-path` is missing from both control test files.

### t002_ac1
Criterion: control-ai-browsers resolves `.browsers/` and `tmp/` under `.commandcode/worktrees/` and still passes its tests, with a one-time fallback read from the old location preserving all existing artifacts (edge E3).
- Held-out pin test `fallback-read-old-path` absent from both skill trees.

## Verify

```bash
node --test .claude/skills/control-ai-browsers/scripts/control.test.mjs
```

Heavy: no

## Log

- 2026-10-18 — created by build fix-task
