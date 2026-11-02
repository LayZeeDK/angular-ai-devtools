---
id: T006
title: Commit the clone measurement artifact
wave: 2
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/clone-measurement-m019.json
  - apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
---

# T006 — Commit the clone measurement artifact

## Context

One fresh clone per prompt must be measured rather than assumed, with the measurement committed. This task produces a committed artifact recording the observed clone count from a single fresh clone per prompt.

## Approach

- Run one fresh clone per prompt and record the observed count in a committed artifact.
- The artifact holds the observed count, not a number restated in prose.
- A test verifies the committed artifact exists and carries the observed count.
- No cap is raised to fit a measurement.

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. A measurement artifact is committed with the observed clone count.
2. The count is the observed value, not a number restated in prose.
3. A test verifies the artifact carries the observed count.
4. No cap is raised to fit the measurement.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
```

Heavy: no

## Log

- created by planner