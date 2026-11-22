---
id: T005
title: Re-derive the gate records and run the project verify
wave: 5
status: pending
deps: [T004]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/tutor-record-shapes.test.mjs
  - scripts/recording-consistency.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T005 — Re-derive the gate records and run the project verify

## Goal

Re-derive both gate records after every suite edit this milestone makes, then run the project verify at this head.

## Context

D6: a recording that derives from the tree moves with every later suite edit, and M060 needed a seventh task because a repair wave edited a suite after the capture. This milestone re-derives once, after the last suite edit, and records the verify.

## Approach

Run `M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` and `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`, then read both records back with the same suites unarmed. Record the project verify with `lars-gsd verify-final`.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both records re-derive at this head — each suite reads the record it produced and finds no differing value.
2. SC4: the project verify builds before it measures and passes without any cache or daemon workaround.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs
M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs
node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs
npx prettier --check research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json
```

## Log

- pending.
