---
id: T009
title: Re-capture the two records the repair waves moved and run the project verify
wave: 9
status: pending
deps: [T008]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m062-verdict-claims.json
  - research/raw/m056-gate-stability.json
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T009 — Re-capture the two records the repair waves moved and run the project verify

## Goal

Re-capture the two recordings that the repair waves invalidated, then run the project verify at this head and record it, so
the milestone can reach the final review with a green ledger.

## Context

T008's verify measured both, and each is a derived value that moved when the tree moved around it:

- `m062-verdict-claims.json` derives its quotes from `.project/plan/PLAN.md`'s coverage table. Waves 7 and 8 added
  `| SC4 | T007 | AC2 |` and `| SC4 | T008 | AC2 |` after its last capture, so it now states SC4 is assigned to
  T003/T005/T006 where this head assigns it to five tasks.
- `m056-gate-stability.json` records the gate's mention count. It reads 15; the gate now prints 16, and the sixteenth is
  T007's own note that `research/raw/m059-record-shapes.json` belongs to T008.

Neither is a product defect. Both are recordings that name a tree which has since changed.

## Approach

Run each record's own armed flag — `M062_CAPTURE=1` on `scripts/outlet-verdict-claims.test.mjs`, `M056_CAPTURE=1` on
`scripts/gate-stability-record.test.mjs` — read both back unarmed, and then run the project verify. If a capture moves
another record's pinned value, name it and stop rather than widening anything.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both records state what this head derives — each is read back unarmed with no differing value, and a mutant that moves one derived value without re-capturing reddens naming the record.
2. SC4: the project verify builds before it measures, exits 0, and is recorded in the ledger with its command verbatim; no cache or daemon workaround appears in the command.

## Verify

```bash
M062_CAPTURE=1 node --test scripts/outlet-verdict-claims.test.mjs && node --test scripts/gate-stability-record.test.mjs
```

## Log

- pending.
