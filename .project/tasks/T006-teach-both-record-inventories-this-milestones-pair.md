---
id: T006
title: Teach both record inventories this milestone's pair
wave: 5
status: pending
deps: [T005]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T006 — Teach both record inventories this milestone's pair

## Context

Both inventory suites count records against M055's map and neither knows this milestone's pair. PLAN
C2 states the measurement: `scripts/tutor-answer.test.mjs` reads every verdict-claims record present
and subtracts the paths `research/raw/m055-record-shapes.json` names outside its map — M055's own two
— then holds the remainder against a recorded count, and `scripts/tutor-record-shapes.test.mjs` holds
the same map in both directions. This milestone's records are neither measured by that map nor named
outside it, so both suites read them as unmeasured, which is the refusal M055's T004 hit twice. The
two suites also carry each other's pins: the answer suite pins the record-shapes suite, and both are
named by `scripts/gate-integrity.test.mjs`, whose own default-tasks sibling names it.

## Approach

Edit the two inventory suites so each reads M057's map beside M055's. Concretely: the subtraction
becomes the union of the paths the two maps name in `inventory.outsideTheMap`, read from the records
themselves, and the count each suite holds is the one the map that measures the records states. The
named-outside set stays pinned per milestone — a record present and named by neither map reddens
naming it — and each suite keeps asserting the subtraction's exact paths, so the exclusion is a
recording's own statement and not a hole opened in a suite. No test is removed, no assertion loosened
and no recorded count edited to fit.

Both suites must survive the records T006 does not own yet: the surface record lands in T007 and the
claims record in T009, so the subtraction is written against the maps rather than against a list of
paths this task can see, and each suite states what it does with a record its map has not measured
yet. The state the suites are left in is asserted: a synthetic record named by neither map reddens,
naming it, and the two records this milestone still owes are the ones its own map names outside
itself.

Declare `scripts/gate-integrity.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs` because
both suites this task edits are named by the gate (PLAN C4), and edit neither: the gate's suite-diff
table refuses a new suite by name, and this task adds none.

## Intent coverage

- SC1
- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs

## Acceptance criteria

1. Both inventory suites read M057's map beside M055's and subtract the paths the two maps name
   outside themselves, so a record this milestone adds reaches the answer path rather than reading as
   unmeasured, and the answer is still produced from the records the agent writes with no count edited
   to fit (SC1, SC5).
2. A record neither map names still reddens each suite, naming it, and each suite pins the
   subtraction to the exact paths its two maps state, so a third record cannot be excused by adding it
   to a suite.
3. Both suites are green at this head with the two records this milestone still owes named outside its
   own map, and each states in its own words what it does with a record its map has not measured yet.

## Verify

```bash
node --test scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs && npx prettier --check scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` — each is read from this tree, ready.
