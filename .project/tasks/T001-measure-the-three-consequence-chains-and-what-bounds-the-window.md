---
id: T001
title: Measure the three consequence chains and what bounds the window
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m050-chains.json
  - scripts/dead-click.test.mjs
---

# T001 — Measure the three consequence chains and what bounds the window

## Context

The milestone reports a recorded event whose consequent never arrived. Three chains exist — the
profiler work pairs (`extension/agent-main.js:25-38`), the router's `NavigationStart`→`NavigationEnd`
(`:1474`) and a boundary arrival with `boundaryReset` (`:2069`) — and none has been measured for
pairing, ambiguity, survival of a dangling start, or the window a finding is judged over.

## Approach

Read the recorders and their readers. Record, per chain, the start marker, the consequent, the field
that pairs them with `path:line` and the cited line's own text, whether two open starts of one kind
are distinguishable, whether a start without its consequent survives into the published record, and
what bounds the window a finding may be judged over. Record what the record does not claim and pin the
record with one suite. Build nothing else.

## Intent coverage

- SC1
- SC3

## Interface contract

None

## Files

  - research/raw/m050-chains.json
  - scripts/dead-click.test.mjs

## Acceptance criteria

1. Each chain's start, consequent and pairing field is recorded with `path:line` and the cited line's own text, and the suite reddens when a citation slides off its line.
2. The record states what bounds the window and whether a dangling start survives into the published record, so SC2's refusal and SC3's considered-only case are decisions taken from measurement.

## Verify

```bash
node --test scripts/dead-click.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m050-chains.json','utf8'))" && npx prettier --check scripts/dead-click.test.mjs
```

## Log

- pending.
