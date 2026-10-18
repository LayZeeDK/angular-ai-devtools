---
id: T002
title: Relocate .browsers/ and tmp/ runtime artifacts under .commandcode/worktrees/ with fallback read
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .claude/skills/control-ai-browsers/scripts/control.mjs
  - .claude/skills/control-ai-browsers/scripts/control.test.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.mjs
  - .commandcode/skills/control-ai-browsers/scripts/control.test.mjs
---

# T002 — Relocate .browsers/ and tmp/ runtime artifacts under .commandcode/worktrees/ with fallback read

## Context

Milestone M003 relocates the git-ignored `.browsers/` (~9k files) and `tmp/` (~5k files) runtime artifacts from the repo root to `.commandcode/worktrees/` (user ruling), with per-worktree profiles and copy (not symlink) semantics so mutable browser profiles do not cross-contaminate. Control-ai-browsers derives `ROOT`, `TMP = ROOT/tmp/control-ai-browsers`, and `PROFILES = ROOT/.browsers` from `SKILL_DIR`; these must point at the new home, with a one-time fallback read from the old location so no artifacts are lost (edge E3, prohibition N5). All existing `.browsers/` and `tmp/` contents must be preserved during migration.

## Approach

- Update the `ROOT`-derived `TMP` and `PROFILES` constants in control-ai-browsers (both `.claude` and `.commandcode` skill copies) to the new `.commandcode/worktrees/` home, with per-worktree profiles.
- Copy (do not symlink) gitignored artifacts so mutable browser profiles do not cross-contaminate between sidecars/checkouts.
- Add a one-time fallback read from the old root location (`.browsers/`, `tmp/`) when the new location is empty/missing, so no artifacts are lost; pin with a test.
- Preserve all existing `.browsers/` and `tmp/` contents during migration (N5).
- Update every `ROOT`-relative path in control scripts and tests that assumes the old roots; grep sweep across both skill trees.
- Byte-copy helpers `proctree.mjs`/`fingerprint.mjs` remain untouched.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. control-ai-browsers resolves `.browsers/` and `tmp/` under `.commandcode/worktrees/` and still passes its tests, with a one-time fallback read from the old location preserving all existing artifacts (edge E3).
2. No existing `.browsers/` or `tmp/` contents are lost during migration (edge E3).

## Verify

```bash
node --test .claude/skills/control-ai-browsers/scripts/control.test.mjs
```

Heavy: no

## Log

- 2026-10-18 — created by planner