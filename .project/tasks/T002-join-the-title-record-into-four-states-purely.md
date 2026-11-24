---
id: T002
title: Join the title record into four states, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
- extension/title-input.js
- scripts/title-input.test.mjs
---

# T002 — Join the title record into four states, purely

## Context

T001 writes the title record this task joins. The shape is fixed by that
recording: per navigation, a strategy class name, the route's `data`, the titles observed, and the observation start.

The join's four states are the same four M064 used for its own record, so a reader learns one vocabulary rather than
two: `finding`, `agrees`, `cannot-tell` and `no-record`.

## Approach

A pure module, `extension/title-input.js`, exporting `titleInput(record, facts)`:

- `agrees` when the title the document carried equals the title the route implies and a strategy resolved.
- `finding` when the two differ, naming `strategy`, `documentTitle`, `impliedTitle` and `observedWrites`.
- `cannot-tell` with a reason when the difference cannot be attributed: `no-strategy`, `no-implied-title`,
  `observation-started-after-the-write`, `route-binds-nothing`.
- `no-record` when nothing was captured.

It reads nothing from the page, the clock or the console. The answer never names a writer, a cause or a remedy.

## Interface contract

`titleInput(record: object, facts: object) -> { state, strategy?, documentTitle?, impliedTitle?, observedWrites?, reason? }`

## Files

Every path this task may touch, and nothing else:

- `extension/title-input.js`
- `scripts/title-input.test.mjs`

## Acceptance criteria

1. A record whose document title differs from the route's implied title produces a `finding` naming both values
   and the strategy; a mutant that copies the route's title over the document's reddens it by name.
2. A record whose observation started after the last write reports `cannot-tell`/`observation-started-after-the-write`,
   and never promotes the current title to an observed write; a mutant that does reddens it.
3. A record for a route that binds nothing reports `cannot-tell`/`route-binds-nothing` rather than an empty object; the
   module's purity suite passes with `document`, `window` and `performance` undefined.

## Verify

```bash
node --test scripts/title-input.test.mjs && npx prettier --check extension/title-input.js scripts/title-input.test.mjs
```

## Intent coverage

- SC1, SC2, SC3

## Log

- scaffolded
