---
id: T007
title: Re-derive the records the gate capture moved and run the project verify
wave: 7
status: pending
deps: [T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m059-record-shapes.json
  - research/raw/m057-record-shapes.json
  - research/raw/m054-style-read.json
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-signals-shapes.test.mjs
  - scripts/visual-qa-style-read.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-signals.test.mjs
  - scripts/visual-qa-style.test.mjs
---

# T007 — Re-derive the records the gate capture moved and run the project verify

## Goal

Re-derive the three recordings the gate capture and this milestone's own edits staled, then run the project verify at
this head and record it, so the milestone reaches the final review with a green ledger.

## Context

T006 re-derived `research/raw/m044-gate-shapes.json`, which moved a `scripts/teardown-leak-shapes.test.mjs` reason row
from line 2747 to 2809 — the value `research/raw/m059-record-shapes.json` pins. T002's
`extension/locale-correctness.js` entered the write-record scan `research/raw/m057-record-shapes.json` states, and the
cache-policy commit's `apps/angular-ai-devtools/project.json` edit moved the line
`research/raw/m054-style-read.json` cites. All three are cascades of work already landed, and none could be repaired
inside the task that caused them.

## Approach

Capture each with its own armed flag — `M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs`, `M057_CAPTURE=1
node --test scripts/tutor-signals-shapes.test.mjs`, `M054_CAPTURE=1 node --test scripts/visual-qa-style-read.test.mjs` —
then read each back unarmed. Then run the project verify and record it with `lars-gsd verify-final`. If a capture moves a
line another record pins, say which, and re-derive that record too rather than loosening the pin.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: each of the three records states what this head derives — the suite that owns it reads it back unarmed and finds no differing value; a mutant that moves one cited line without re-capturing reddens naming the record.
2. SC4: the project verify builds before it measures, exits 0, and is recorded in the ledger with its command verbatim; no cache or daemon workaround appears in the command.

## Verify

```bash
M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/tutor-signals-shapes.test.mjs scripts/visual-qa-style-read.test.mjs
```

## Log

- pending.
