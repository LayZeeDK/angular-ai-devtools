---
id: T004
title: Run model-browser spikes S14 S15 S20 S23
wave: 3
deps: [T001, T003]
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

# T004 — Run model-browser spikes S14 S15 S20 S23

## Context

Model-browser spikes (S14, S15, S20, S23) run on per-model instances 9334/9335/9337. Serialize per instance; queue/reset between batches; never run two spikes on same instance concurrently.

## Approach

- S14/S15 on 9334/9335; S20/S23 on 9335/9337.
- Queue/reset between batches; close all browsers/tabs/dev servers after runs.
- Each run creates new timestamped evidence file; update notes.
- Prohibition N4: only non-daily profiles/control instances.

## Interface contract

- None

## Intent coverage

- SC1

## Acceptance criteria

1. S14, S15, S20, S23 each leave committed timestamped evidence under `research/raw/`.
2. No two spikes ran concurrently on same per-model instance.

## Verify

```bash
grep -q "measured\|blocked" research/05-spikes.md
```

Heavy: no

## Log

- created by planner