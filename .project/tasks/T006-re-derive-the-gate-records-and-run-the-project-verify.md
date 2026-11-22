---
id: T006
title: Re-derive the gate records and run the project verify
wave: 6
status: pending
deps: [T005]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/panel-copy.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/teardown-leak.test.mjs
---

# T006 — Re-derive the gate records and run the project verify

## Goal

Re-derive both gate records after the last suite edit this milestone makes, then run the project verify at this head so
no stale derivation can reach the final review.

## Context

D6: a recording that derives from the tree moves with every later suite edit, and M060 needed a seventh task because a
repair wave edited a suite after the capture. This task is last for exactly that reason: it captures the two gate
records, reads them back unarmed, and only then runs the project verify, which builds before it measures and uses no
cache or daemon workaround.

## Approach

`M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs` and `M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs`, each followed by an unarmed run that must find no differing value. Then run the project verify exactly as the plan states it and record it with `lars-gsd verify-final`.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both gate records re-derive at this head — each suite reads the record it produced and finds no differing value; a mutant that changes one counted denominator without re-capturing reddens by field name.
2. SC4: the project verify builds before it measures and passes with no cache or daemon workaround; its command is the plan's line verbatim and its output is recorded in the ledger.

## Verify

```bash
M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs
```

## Log

- Landed paths: `research/raw/m044-gate-shapes.json`, `research/raw/m056-gate-stability.json`, `scripts/gate-integrity.test.mjs`.
- The record was not merely stale but underivable: four suites added since `d94502d1` had no `SUITE_DIFF_REASONS` row, so `deriveSuiteDiff()` refused before any value was derived and no armed capture could write. Four reasons were added, each read from its own diff; `droppedAssertionLines` is 0 for all 50 differing suites.
- AC7's premise was falsified by this milestone: M061's cache-policy commit edited `nx.json`, so the claim M044 recorded is carried by the range `gate()` derives to HEAD. Every assertion was kept; both runs are now held to M044's own range, where declared mode is clean and log mode refuses five claims including `nx.json`.
- Both records re-derive and read back clean: 48/48 with stable hashes. m044 moved 46 to 50 differing suites, 199 to 203 examined, 2553 to 2611 declared tests; m056 moved only its live milestone and mention count.
- Acceptance criterion 2 is unmet at this head and is why the coder reported blocked rather than ready: the project verify exits 1 with 8 failures in three suites, none of which any T006 path reaches. Three are the D6 cascade (re-capturing m044 moved the line `research/raw/m059-record-shapes.json` pins), one is T002's `extension/locale-correctness.js` entering the write-record scan, four are M061's `project.json` edit against `research/raw/m054-style-read.json`'s citation of line 74. T007 owns them.
- `research/raw/m061-record-shapes.json`'s `inventory.measured` is now false (it credits the gate records to T005). The lines that fix it are `scripts/locale-correctness-shapes.test.mjs:827` and `:829`; the record then needs `M061_CAPTURE=1`. Neither file is declared here.
