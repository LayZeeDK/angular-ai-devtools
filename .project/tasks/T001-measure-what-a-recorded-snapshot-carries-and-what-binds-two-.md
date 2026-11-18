---
id: T001
title: Measure what a recorded snapshot carries and what binds two of them
wave: 1
status: done
deps: []
agent: build_T001
base: 7c34b8e090e8840aa4c2a6416b874aa9f9de7b22
worktree: null
task_branch: null
files:
  - research/raw/m051-snapshots.json
  - scripts/what-changed.test.mjs
---

# T001 — Measure what a recorded snapshot carries and what binds two of them

## Context

The intent's correction records that `snapshot` in the record means a router state snapshot
(`extension/agent-main.js:1439-1541`), not a page snapshot at two moments. Before any comparison is
written, the fields the record actually publishes must be measured, and so must the question of which
field, if any, binds two snapshots to one page.

## Approach

Read the recorders and the published record. Record, at `path:line` with the cited line's own text: every
structure that could stand for a page snapshot, every field that could bind two of them, whether any such
field is stable across two records, and what the record states about fields it does not carry. Pin the record
with one suite. Build nothing else.

## Intent coverage

- SC1
- SC2

## Interface contract

None

## Files

  - research/raw/m051-snapshots.json
  - scripts/what-changed.test.mjs

## Acceptance criteria

1. Each candidate snapshot structure and binding field is recorded with `path:line` and the cited line's own text, and the suite reddens when a citation slides off its line.
2. The record states whether any field binds two snapshots to one page, so SC2's refusal and SC1's comparison are decisions taken from measurement.

## Verify

```bash
node --test scripts/what-changed.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m051-snapshots.json','utf8'))" && npx prettier --check scripts/what-changed.test.mjs
```

## Log

- pending.
- Landed paths: `research/raw/m051-snapshots.json`, `scripts/what-changed.test.mjs` — each is read from this tree, ready.
