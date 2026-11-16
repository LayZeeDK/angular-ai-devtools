---
id: T001
title: Measure what the panel renders and what a copy path composes today
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m046-pane-and-copy.json
  - scripts/copy-to-agent.test.mjs
---

# T001 — Measure what the panel renders and what a copy path composes today

## Context

The roadmap says a finding can be handed to the agent as a question about itself, and that what the agent
receives is the finding the panel rendered. Nothing in the tree does that yet: the panel renders a finding through
`apps/angular-ai-devtools/src/app/panel-console.ts`, and every existing copy path composes its own string from the
fact list instead of reading the pane. This task measures both halves and records them, so the milestone's premise
is falsified by a reading rather than by my inference from the ledger.

## Approach

Record, for two subjects, the text the pane draws and the text each copy path would compose, at the line
each is produced. Write the record to `research/raw/m046-pane-and-copy.json` and pin it with one suite that reads
the record and asserts the two differ for at least one subject. Build nothing; the join is T003's.

## Intent coverage

- SC1
- SC4

## Interface contract

None

## Files

  - research/raw/m046-pane-and-copy.json
  - scripts/copy-to-agent.test.mjs

## Acceptance criteria

1. The record names, per subject, the pane's rendered text and the copy path's composed text, each with the path and line that produces it.
2. The suite fails when the record claims the two agree for a subject whose pane text and composed text differ.

## Verify

```bash
node --test scripts/copy-to-agent.test.mjs
node -e "JSON.parse(require('fs').readFileSync('research/raw/m046-pane-and-copy.json','utf8'))"
npx prettier --check scripts/copy-to-agent.test.mjs research/raw/m046-pane-and-copy.json
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
