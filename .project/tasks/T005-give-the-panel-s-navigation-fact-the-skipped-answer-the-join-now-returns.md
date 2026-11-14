---
id: T005
title: Give the panel's navigation fact the skipped answer the join now returns
wave: 5
deps:
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T005 — Give the panel's navigation fact the skipped answer the join now returns

## Context

T003 gave `narrateNavigation` a fifth answer field, `skipped`, and documented it at
`extension/navigation-narrator.js:59` as `{ state, absence, navigations, unattributed, skipped }`.
The sample fact the panel renders lives in `apps/angular-ai-devtools/src/app/panel-demo.ts:257` and
still carries four fields, so `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1334` fails its
`toEqual` against the join's own answer and `npm test` is red cache-cold. T003 declared the spec but
not the fact source, which is the file that had to move with the shape.

## Approach

- Read the recorded stream `research/raw/m041-navigation.json`, run the join over it, and write the
  fact's `skipped` from that output — the measured list, not an empty array assumed correct.
- Keep the edit to the one field: no other fact, and no assertion, changes.

## Interface contract

The gate surfaces `checkArchivePaths({ root, milestone })` and `checkFixRecord({ root, range, tasks })`, each returning `{ examined, findings[] }` where a finding carries `file`, `line`, `claim` and `class`, and `nothing-examined` is a finding rather than a pass. T001's record carries the same shapes as data: `archiveReferences[]`, `fixRecord` and `skippedNavigations[]`, each with `examined` and `command`. The narrator's finding for an ended id carries the navigation id, the url and the word the record uses for the skip, and names no cause, owner or intent the entry does not carry; its answer carries `{ state, absence, navigations, unattributed, skipped }` in that order. The panel fact is the join's own answer for the recorded stream, so `FACTS['navigation']` deep-equals `narrateNavigation(<record>)` and every field the answer carries, `skipped` included, is present with the value the join derived. The claims file cites one artefact per criterion, each artefact a path plus the reading it carries.

## Intent coverage

- SC4

## Edges

- E7

## Acceptance criteria

1. held-out E7 — AC1 `FACTS['navigation'].skipped` equals what the join derives from
   `research/raw/m041-navigation.json`, quoted from a command whose output is pasted, and
   `panel-demo.spec.ts` passes with no change to its assertions.
2. held-out E7 — AC2 `npm test` is green cache-cold after `npx nx reset`, with the app stage's own
   counts recorded, so the pass is a run rather than a cache replay.
3. held-out E7 — AC3 the only change is the added field: no other fact, spec assertion or source file
   moves, proven by the diff naming exactly two files.

## Verify

```bash
node --check apps/angular-ai-devtools/src/app/panel-demo.ts && npx prettier --check apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts && npm run check && npx nx run angular-ai-devtools:test --skip-nx-cache && npm test
```

## Held-out

E7

## Log

- (no entries yet)
