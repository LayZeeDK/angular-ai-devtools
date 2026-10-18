---
id: T002
title: Check instance/model availability and record blocked preconditions
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/05-spikes.md
  - research/*.md
  - docs/filing-ledger.md
---

# T002 — Check instance/model availability and record blocked preconditions

## Context

Measurements require per-model browser instances (Chrome Beta, Edge Dev, Edge stable) and model downloads; some need Lars's gesture. Automated-first: any spike failing on a missing precondition is recorded blocked with exact precondition, never skipped or counted complete.

## Approach

- Verify each instance via `control-ai-browsers` doctor; record availability for S4, E1-E13, S14-S23, TS1-TS12.
- For blocked spikes, record exact precondition (instance availability, model download, branded-browser access, or permission).
- Prohibition N6: never record blocked spike as measured or skip without precondition. N4: only non-daily profiles/control instances.
- Judgment prohibitions Must not: record a blocked spike as measured or skip it without a precondition; drive Lars's daily `chrome`/`edge` browsers or branded profiles without explicit approval.

## Interface contract

- None

## Intent coverage

- SC4

## Acceptance criteria

1. Every unrun spike is either runnable or recorded blocked with exact precondition.
2. No spike is silently skipped or counted complete without evidence.

## Verify

```bash
git diff --check && grep -q "blocked\|measured" research/05-spikes.md
```

Heavy: no

## Log

- created by planner