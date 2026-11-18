---
id: T001
title: Measure the copy each panel surface declares and where it declares none
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m048-surface-copy.json
  - scripts/copy-check.test.mjs
---

# T001 — Measure the copy each panel surface declares and where it declares none

## Context

The roadmap says the panel compares a page's rendered strings against its own digest. Neither side
exists: `extension/agent-main.js` reads no page text, and the only digests are for errors and images.
What does exist is the copy each surface declares for itself. This task records that copy, and the
surfaces that declare none, so the milestone rests on a reading rather than on the roadmap sentence.

## Approach

Read every `apps/angular-ai-devtools/src/app/panel-*.ts` surface. Record, per surface, the map or
location where it declares its rendered sentences, with `path:line` and the line's own text; record
which surfaces declare no such map and how they interpolate instead; record every inline sentence you
find so the digest in T002 can be authored against a measured list. Write the record to
`research/raw/m048-surface-copy.json` and pin it with one suite. Build nothing else.

## Intent coverage

- SC1
- SC2

## Interface contract

None

## Files

  - research/raw/m048-surface-copy.json
  - scripts/copy-check.test.mjs

## Acceptance criteria

1. The record names, per surface, the location and text of every declared sentence with `path:line`, and names each surface that declares none with the same precision.
2. The suite fails when the record claims a location holds a sentence that the cited line does not contain.

## Verify

```bash
node --test scripts/copy-check.test.mjs && node -e "JSON.parse(require('fs').readFileSync('research/raw/m048-surface-copy.json','utf8'))" && npx prettier --check scripts/copy-check.test.mjs research/raw/m048-surface-copy.json
```

## Log

- pending.
