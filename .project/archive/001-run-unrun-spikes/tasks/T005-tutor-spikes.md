---
id: T005
title: Run tutor spikes TS1-TS12
wave: 4
deps: [T004]
status: done
agent: build_T005
base: 3134e96286a3fa67c5a6358650cb8e0496efba47
worktree: null
task_branch: null
files:
  - research/raw
  - research/05-spikes.md
  - research/*.md
---

# T005 — Run tutor spikes TS1-TS12

## Context

Tutor-card measurements TS1-TS12 follow model-browser spikes per handoff ordering. Each creates new timestamped evidence; no overwrite.

## Approach

- Run TS1-TS12 in handoff order; reset browser state after residue-prone failures before rerun.
- Create new timestamped evidence files; update notes pending→measured.

## Interface contract

- None

## Intent coverage

- SC1

## Acceptance criteria

1. TS1-TS12 each leave committed timestamped evidence under `research/raw/`.
2. Matching notes updated.

## Verify

```bash
grep -q "measured\|blocked" research/05-spikes.md
```

Heavy: no

## Log

- created by planner
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t005-verify): pass, exit 0
- 2026-10-18 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t005-verify): pass, exit 0
- 2026-10-18 — orchestrator regression Verify of T002 (sidecar gsd-path-verify/task-t005-verify): pass, exit 0
