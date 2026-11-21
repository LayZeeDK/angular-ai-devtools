---
id: T010
title: Wave 5 contiguity placeholder
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/prove-skills-audited.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T010 — Wave 5 contiguity placeholder

## Goal

Hold wave 5 open with a task file, so the plan's numbering stays contiguous and every `## Wave`
heading carries a task, without editing the five landed task files that renumbering would touch.

## Context

The repair split moved T005's stale-citation repair into wave 4 and T004's recordings into wave 7,
which left wave 5 with no task. An empty wave is refused by `verify-landed` (`PLAN.md waves without
task files: 5`), and renumbering waves 6–8 down by one would edit five landed task files, which the
same check refuses (`current done task differs from its landing commit`). This task therefore
carries no work of its own: it exists so the wave exists. It owns no acceptance criterion, and the
plan's `## Intent coverage` names no row for it.

## Approach

Nothing is written. The one path in `files:` is the pin suite the Verify runs, chosen because it
already exists and passes at this head, so the placeholder proves nothing beyond the structure it
exists to hold.

## Interface contract

Irrelevant to a placeholder: it publishes nothing and consumes nothing. The milestone's contract is
the one T001, T002 and T003 state, and this task neither adds to it nor reads it.

## Interface contract placeholder

The plan's task linter requires the heading above; its content is the shared contract's shape and no
task depends on it here.

## Intent coverage

- None

## Acceptance criteria

1. The plan's wave numbering is contiguous and every wave carries at least one task file.
2. No product file changes at this task's hand.
3. The placeholder is named as such, so a later reader does not mistake it for unbuilt work.

## Verify

```bash
node --test scripts/prove-skills-audited.test.mjs
```

## Log

- pending.
