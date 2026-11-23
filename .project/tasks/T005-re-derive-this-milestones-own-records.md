---
id: T005
title: Re-derive this milestone's own records
wave: 5
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m062-record-shapes.json
  - research/raw/m062-verdict-claims.json
  - scripts/outlet-record-shapes.test.mjs
  - scripts/recording-consistency.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m059-record-shapes.json
---

# T005 — Re-derive this milestone's own records

## Goal

Re-capture the records this milestone writes after the last suite edit it makes, and read each back unarmed.

## Context

D6: a recording that derives from the tree moves with every later suite edit. M060 needed a seventh task for this and M061 a cascade repair, so the capture is a task, not a step.

## Approach

Capture each with its own armed flag, then re-run unarmed and require no differing value. If a capture moves a line another record pins, re-derive that record rather than loosening the pin.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: every record states what this head derives — its suite reads it back unarmed and finds no differing value; a mutant that moves one counted field without re-capturing reddens naming the record.
2. SC4: a record captured at a head other than this one refuses to land, and the refusal names both heads.

## Verify

```bash
M062_CAPTURE=1 node --test scripts/outlet-record-shapes.test.mjs && M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/outlet-record-shapes.test.mjs scripts/teardown-leak-shapes.test.mjs scripts/recording-consistency.test.mjs
```

## Log

- pending.
- Contract amended before this task ran: `research/raw/m059-record-shapes.json` is declared and `scripts/teardown-leak.test.mjs` dropped, because T004 measured that adding a record to `research/raw/` moves that record's census (`recordsSearched` 154 -> 155) and the suite alone cannot repair it.
