---
id: T003
title: Update AGENTS.md, skill docs, and .gitignore; prove sidecar checks and no regression
wave: 2
deps: [T001, T002]
status: done
agent: build_T003
base: 2d42aa14126d6052a2fd33310b1bf86e7d0cfa1f
worktree: null
task_branch: null
files:
  - AGENTS.md
  - .gitignore
  - .claude/skills/control-ai-browsers/SKILL.md
  - .commandcode/skills/control-ai-browsers/SKILL.md
---

# T003 — Update AGENTS.md, skill docs, and .gitignore; prove sidecar checks and no regression

## Context

Milestone M003 completes when a brand-new sidecar passes typecheck and the full test suite with no human intervention and all control-skill checks pass in their sidecars. The manual junction procedure must keep working for legacy sidecars (prohibition N3), runtime artifacts stay git-ignored at the new home, and the primary worktree typecheck/tests stay green (N6, SC5). This task integrates the T001 bridge and T002 relocation into documentation and ignore rules, then verifies the end-to-end outcome.

## Approach

- Update AGENTS.md "Verify sidecar dependencies" section to describe the automatic bridge while retaining the manual junction procedure for legacy sidecars (N3).
- Update `.gitignore` to ignore the new `.commandcode/worktrees/` runtime home (and keep existing entries working) — git-ignored artifacts remain git-ignored.
- Update control-skill SKILL.md docs (both skill trees) for any changed artifact paths and bridge notes.
- Run all control skills' documented check commands (`doctor`, `fingerprint.mjs check`, and `control-pangular-inspector check`) in a verify sidecar to confirm SC3.
- Confirm `npm run check` and `npm test` (296/296) pass on the primary worktree (SC5, N6) and in a fresh sidecar with the automatic bridge (SC1, SC2).
- Byte-copy helpers untouched; no Angular runtime or spike fixture changes.

## Interface contract

- None

## Intent coverage

- SC3
- SC5

## Acceptance criteria

1. Every control skill's documented check command runs in its verify sidecar without manual dependency bridging.
2. AGENTS.md documents the automatic bridge and retains the working manual junction procedure for legacy sidecars.
3. `npm run check` exits 0 and `npm test` reports 296 passing on the primary worktree, with no regression.

## Verify

```bash
grep -q "automatic bridge" AGENTS.md
```

Heavy: yes

## Log

- 2026-10-18 — created by planner
- 2026-10-18 — AGENTS.md documents automatic bridge; .gitignore ignores .commandcode/worktrees/; control skill docs reviewed for artifact paths
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0
