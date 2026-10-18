---
id: T002
title: Relocate .browsers/ and tmp/ runtime artifacts under .commandcode/worktrees/ with fallback read
wave: 1
deps: []
status: done
agent: build_T002
base: 119a4ab2d13cc10cb48c22ef2c375aa818af70ab
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
- 2026-10-18 — implemented: relocated TMP/PROFILES to .commandcode/worktrees/ with copy-migration and fallback read; updated evidenceDir; both skill copies; tests pass
- 2026-10-18 — orchestrator Verify (isolate gsd-path-task/T002): pass, exit 0; output tail:
  ```
  ✔ downOutcome refuses a reused main PID and a survivor with exit 2, and only notes a reused child or a shared helper (0.2053ms)
  ✔ assetVerdict reads the measured Edge update states: in flight, then a model past its manifest (0.3163ms)
  ✔ pinPlan removes every other version and adds the pinned one; describePlan names both (0.2388ms)
  ✔ listing records files and sizes by relative path and lists links without following them (7.1746ms)
  ✔ pinPlan replaces a pinned folder whose contents differ (0.1177ms)
  ✔ applyPin restores the pinned folders in a profile and leaves everything else alone (11.3955ms)
  ✔ applyPin replaces a truncated pinned folder, and deletes nothing when the pin itself is damaged (12.7543ms)
  ✔ applyPin refuses a component root that is a junction and a pinned source that holds a link (7.2233ms)
  ✔ pinProblems accepts a pin of the registry roots only, with version names and plain relative file paths (0.49ms)
  ✔ drift compares an args entry with a value by switch name and whole entry (0.1777ms)
  ✔ an instance's own args are launched after the common ones, and drift requires them (0.1246ms)
  ✔ restoreSwap puts back a pin left at .old only when no current pin exists (1.9993ms)
  ℹ tests 47
  ℹ suites 0
  ℹ pass 47
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 1577.3078
  ```
