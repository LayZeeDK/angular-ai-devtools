---
id: T001
title: Measure the three arrival-ordered streams and whether they share an order
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m049-streams.json
  - scripts/interaction-story.test.mjs
---

# T001 — Measure the three arrival-ordered streams and whether they share an order

## Context

The milestone narrates the sequence a page recorded. Three streams exist and nothing records what a
user did: `routerEvents` (`extension/agent-main.js:1474`), `pendingWorkEvents` (`:639`) and
`boundaryEntries` (`:1942`). Whether they can be interleaved honestly is unmeasured, and it decides
the whole shape of the narration.

## Approach

Read the three emitters and their readers. Record, per stream, the entry shape with `path:line` and
the line's own text, the bound and what happens above it, whether the code states an order, and
whether any two entries carry a comparable field (a timestamp, a sequence number, an arrival index).
Answer the intent's open question explicitly: shared clock, or not. Record what the record does not
claim. Pin the record with one suite. Build nothing else.

## Intent coverage

- SC1
- SC3

## Interface contract

None

## Files

  - research/raw/m049-streams.json
  - scripts/interaction-story.test.mjs

## Acceptance criteria

1. The record names each stream's entry shape, bound and stated order with `path:line` and the cited line's own text, and the suite reddens when a citation slides off its line.
2. The record answers whether the streams share a comparable field, and states the consequence the narration must obey, so SC3's refusal is a decision taken from measurement rather than at render time.

## Verify

```bash
node --test scripts/interaction-story.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m049-streams.json','utf8'))" && npx prettier --check scripts/interaction-story.test.mjs research/raw/m049-streams.json
```

## Log

- pending.
