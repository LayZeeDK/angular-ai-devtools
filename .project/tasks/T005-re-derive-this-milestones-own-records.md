---
id: T005
title: Re-derive this milestone's own records
wave: 5
status: done
deps: [T004]
agent: build_T005
base: 0984904aa27d8c1ea028b4b959eb88eedb7c8490
worktree: null
task_branch: null
files:
  - research/raw/m063-record-shapes.json
  - scripts/guard-record-shapes.test.mjs
  - research/raw/m059-record-shapes.json
  - scripts/teardown-leak-shapes.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/teardown-leak.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/navigation-blocking.test.mjs
---

# T005 — Re-derive this milestone's own records

## Goal

Write the map this milestone owes and re-derive the census that counts it, then read both back unarmed.

## Context

D6: a recording that derives from the tree moves with every later edit, so the capture is a task, not a step.

## Approach

Derive the map from the two extension modules in a bare context, never typed. The record-count census moves with it; capture both armed and read both back.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: both records state what this head derives — each is read back unarmed with no differing value; a mutant that moves one counted field reddens naming the record.
2. SC4: a record captured at a head this checkout does not carry refuses to land, naming both heads.

## Verify

```bash
M063_CAPTURE=1 node --test scripts/guard-record-shapes.test.mjs && M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/guard-record-shapes.test.mjs scripts/teardown-leak-shapes.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/guard-record-shapes.test.mjs`, `research/raw/m063-record-shapes.json` (12,228 bytes, sha256 `ce9e9ce7…`), `research/raw/m059-record-shapes.json` (re-captured), and end-of-file additions to `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs` and `scripts/gate-integrity.test.mjs`.
- Every value in the map is derived by running both extension modules in a bare context: 3 record fields, 4 row fields, 7 absence reasons **each produced by a record**, 4 phases, 2 verdicts, a 4-observation sample, and the two empty-record cases. The join's two input fields are proved by removing each.
- `m059` was redder than the brief predicted — it recorded 156/42/147 where this head already derived 157/44/150 — and now states 158/44/151/158 with the new record and suite counted rather than excluded.
- The map could not be wired into `tutor-answer` through `MAPS`/`PINNED_OUTSIDE`: the gate recording pins that file's archive references by line, and inserting 24 lines above them produced a new `gate-integrity` failure at `tutor-answer.test.mjs:206`. The wiring went at the end of the file as a test that proves each of this milestone's two records is held by its own `capture.command`.
- A record named by a map is now excused twice (by name and by its own census), so the census assertion distinguishes the two: every subtraction is either named outside a map or self-held, and the named-only set is pinned.
- A new red this task caused and could not repair inside its paths: `scripts/guard-verdict-claims.test.mjs` is 6/8 because that census derives `evidence.records` from the `research/raw/m063-*` files. The claims record is T006's declared path, measured with the map moved aside as 8/8 green.
- Two pre-existing reds remain unchanged in kind: the gate record `m044` (T007's) and `scripts/tutor-signals-shapes.test.mjs`, whose edge-vocabulary census reads the claims record's `edges` arrays. No task in this milestone declares that suite.
