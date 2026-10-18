---
id: T003
title: Run offline spikes S17-S19
wave: 2
deps: [T001]
status: done
agent: build_T003
base: 9f2dc23ba06dfcc8c4cb211230a6c76b9bcdb5f1
worktree: null
task_branch: null
files:
  - research/raw
  - research/05-spikes.md
  - research/*.md
---

# T003 — Run offline spikes S17-S19

## Context

Offline spikes (S17-S19) need no model browser and follow handoff next-work order after S16. Each run creates a new timestamped evidence file; no overwrite; notes point at latest measured run.

## Approach

- Run S17, S18, S19 in handoff order against fixtures/control scripts.
- Create new timestamped evidence files under `research/raw/`; never overwrite prior evidence.
- Update matching research notes from pending to measured.
- Prohibition N1/N2: no 'measured' without artifact; no overwrite/delete prior evidence.

## Interface contract

- None

## Intent coverage

- SC1

## Acceptance criteria

1. S17, S18, S19 each leave a committed timestamped evidence artifact under `research/raw/`.
2. Matching research notes updated from pending to measured with evidence reference.

## Verify

```bash
grep -q "measured\|blocked" research/05-spikes.md
```

Heavy: no

## Log

- created by planner
- 2026-10-18 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0
- 2026-10-18 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t003-verify): pass, exit 0
- 2026-10-18 — orchestrator regression Verify of T002 (sidecar gsd-path-verify/task-t003-verify): pass, exit 0
