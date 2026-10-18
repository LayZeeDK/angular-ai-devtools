---
id: T007
title: Fold measured results into research notes and filing ledger
wave: 6
deps: [T001, T003, T004, T005, T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/05-spikes.md
  - research/*.md
  - docs/filing-ledger.md
  - docs/feature-proposals.md
---

# T007 — Fold measured results into research notes and filing ledger

## Context

Update `docs/filing-ledger.md` and relevant `research/*.md` from pending/unrun to measured for every completed spike. Rerunning update must not duplicate rows.

## Approach

- For each measured spike, update status pending→measured with evidence reference.
- For blocked spikes, record blocked with precondition.
- Idempotent: re-run overwrites status, no duplicate measured rows (E5).
- Prohibition N5: never mark measured without evidence reference.

## Interface contract

- None

## Intent coverage

- SC3

## Acceptance criteria

1. `docs/filing-ledger.md` and relevant `research/*.md` updated from pending/unrun to measured for every completed spike.
2. Re-running update does not duplicate rows.
3. Every measured row links to an artifact path.

## Verify

```bash
grep -q "measured\|blocked" research/05-spikes.md
```

Heavy: no

## Log

- created by planner