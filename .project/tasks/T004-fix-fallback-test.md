---
id: T004
title: Add held-out edge E3 pin test fallback-read-old-path to control-ai-browsers
wave: 1
deps: [T002]
status: done
agent: build_T004
base: 4a085616bd4ae877a09e4aa0d4830cc450fc4f81
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
- 2026-10-18 — added `fallback-read-old-path` test to both `.claude` and `.commandcode` control.test.mjs, exercising copy-migration from the legacy root via `artifactDir` and fallback read when the new location is empty/missing via `fallbackRead`; imports added: `existsSync` (node:fs), `artifactDir` and `fallbackRead` (./control.mjs); Verify pass: `node --test .claude/.../control.test.mjs` → 48/48 (incl. fallback-read-old-path); `.commandcode/.../control.test.mjs` → 48/48.
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  ✔ assetVerdict reads the measured Edge update states: in flight, then a model past its manifest (0.2813ms)
  ✔ pinPlan removes every other version and adds the pinned one; describePlan names both (0.2371ms)
  ✔ listing records files and sizes by relative path and lists links without following them (5.2564ms)
  ✔ pinPlan replaces a pinned folder whose contents differ (0.082ms)
  ✔ applyPin restores the pinned folders in a profile and leaves everything else alone (10.6591ms)
  ✔ applyPin replaces a truncated pinned folder, and deletes nothing when the pin itself is damaged (13.0577ms)
  ✔ applyPin refuses a component root that is a junction and a pinned source that holds a link (6.0297ms)
  ✔ pinProblems accepts a pin of the registry roots only, with version names and plain relative file paths (0.4214ms)
  ✔ drift compares an args entry with a value by switch name and whole entry (0.1535ms)
  ✔ an instance's own args are launched after the common ones, and drift requires them (0.0985ms)
  ✔ restoreSwap puts back a pin left at .old only when no current pin exists (1.8283ms)
  ✔ fallback-read-old-path (4.9584ms)
  ℹ tests 48
  ℹ suites 0
  ℹ pass 48
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 914.3866
  ```
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
  ✔ assetVerdict reads the measured Edge update states: in flight, then a model past its manifest (0.3123ms)
  ✔ pinPlan removes every other version and adds the pinned one; describePlan names both (0.2247ms)
  ✔ listing records files and sizes by relative path and lists links without following them (5.9923ms)
  ✔ pinPlan replaces a pinned folder whose contents differ (0.1693ms)
  ✔ applyPin restores the pinned folders in a profile and leaves everything else alone (10.4434ms)
  ✔ applyPin replaces a truncated pinned folder, and deletes nothing when the pin itself is damaged (11.6564ms)
  ✔ applyPin refuses a component root that is a junction and a pinned source that holds a link (5.6991ms)
  ✔ pinProblems accepts a pin of the registry roots only, with version names and plain relative file paths (0.4011ms)
  ✔ drift compares an args entry with a value by switch name and whole entry (0.1553ms)
  ✔ an instance's own args are launched after the common ones, and drift requires them (0.098ms)
  ✔ restoreSwap puts back a pin left at .old only when no current pin exists (1.7467ms)
  ✔ fallback-read-old-path (4.6125ms)
  ℹ tests 48
  ℹ suites 0
  ℹ pass 48
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 935.9839
  ```
