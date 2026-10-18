---
id: T006
title: Run S4 and E1-E13 spikes
wave: 5
deps: [T005]
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

# T006 — Run S4 and E1-E13 spikes

## Context

S4 and E1-E13 touch extension identity/routing and edge behaviors; may require browser setup. Run or record blocked with exact precondition.

## Approach

- Attempt each spike in automated mode first.
- Record blocked with exact precondition when unavailable; never silently skip or count complete.
- Each successful run creates new timestamped evidence file; update notes.

## Interface contract

- None

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. S4 and E1-E13 each are measured with evidence or explicitly blocked with precondition.
2. No spike silently skipped.

## Verify

```bash
grep -q "measured\|blocked" research/05-spikes.md
```

Heavy: no

## Log

- created by planner