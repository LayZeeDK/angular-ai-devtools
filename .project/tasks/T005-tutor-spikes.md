---
id: T005
title: Run tutor spikes TS1-TS12
wave: 4
deps: [T004]
status: pending
agent: null
base: null
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