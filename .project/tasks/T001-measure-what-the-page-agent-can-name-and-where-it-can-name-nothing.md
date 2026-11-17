---
id: T001
title: Measure what the page agent can name and where it can name nothing
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m047-names-and-absences.json
  - scripts/component-search.test.mjs
---

# T001 — Measure what the page agent can name and where it can name nothing

## Context

The roadmap says the panel reads a component tree the page agent already captures. Measured at
`9aa6e960`, no such tree exists: `extension/agent-main.js` reads a component per element through
`el.__ngContext__` and `ng.getComponent`, and its profiler events record `componentName: null` when
the profiler passed no instance. This task records what the agent can actually name, and where it
can name nothing, so the milestone's criteria rest on a reading rather than on the roadmap sentence.

## Approach

Record, for each source the agent has, the name it yields and the line that yields it, plus the
absence cases: an element with no `__ngContext__`, a production build that carries none, and a
profiler event that passed no instance. Write the record to
`research/raw/m047-names-and-absences.json` and pin it with one suite that reads the record and
asserts at least one source yields no name. Build nothing; the filter is T002's.

## Intent coverage

- SC1
- SC2

## Interface contract

None

## Files

  - research/raw/m047-names-and-absences.json
  - scripts/component-search.test.mjs

## Acceptance criteria

1. The record names, per source, the text the agent yields and the path and line that produces it, and names the absence cases it found with the same precision.
2. The suite fails when the record claims a source yields a name for a case in which the measured code yields none.

## Verify

```bash
node --test scripts/component-search.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m047-names-and-absences.json','utf8'))" && npx prettier --check scripts/component-search.test.mjs research/raw/m047-names-and-absences.json
```

## Log

- pending.
