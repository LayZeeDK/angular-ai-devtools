---
id: T004
title: Write the verdict claims the census derives
wave: 4
status: done
deps: [T003]
agent: build_T004
base: cdb5c61a4a1e4c1e9439724041a95f6621d3b6cc
worktree: null
task_branch: null
files:
  - research/raw/m063-verdict-claims.json
  - scripts/guard-verdict-claims.test.mjs
  - scripts/navigation-blocking.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/outlet-record-shapes.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T004 — Write the verdict claims the census derives

## Goal

Record what each criterion claims and which suite proves it, so a verdict is a read rather than a narrative.

## Context

The census reads the intent at capture time; a criterion edited afterwards makes the record stale and the suite names the field that moved. Its quotes also follow the plan's coverage table.

## Approach

Copy the M062 census shape: quote each criterion character for character with its length, name a suite and a test this head declares, and read the edges from the plan's held-out table. Capture armed, read back unarmed.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. SC1: the record states each criterion verbatim and names the suite and test that proves it; a mutant that quotes a criterion in its own words reddens.
2. SC2: a claim whose test does not exist at this head reddens naming the missing test.

## Verify

```bash
M063_CAPTURE=1 node --test scripts/guard-verdict-claims.test.mjs && node --test scripts/guard-verdict-claims.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/guard-verdict-claims.test.mjs`, `research/raw/m063-verdict-claims.json` (24,821 bytes), `scripts/outlet-verdict-claims.test.mjs`, `scripts/tutor-answer.test.mjs`, and this milestone's `SUITE_DIFF_REASONS` rows in `scripts/gate-integrity.test.mjs`.
- The record names its own census in `capture.command`, so `navigation-blocking`'s ownership branch stands down with **no edit to that file** — its eight red tests became 27/27 by the record existing, which is the mechanism speaking rather than an exemption being carved.
- `outlet-verdict-claims` (M062's census) now reads the owner from the record and, when owned elsewhere, holds it to the ownership chain and every table-free rule; only the two M062-table applications are left to the owner. The new block sits at the end of the file because the gate record pins archive references at lines 213 and 219 — an insertion above them staled both, measured as 9 to 7 disagreements after moving it.
- The plan's `## Held-out checks` assigns E7 (SC1) and E8 (SC4) to `panel-routes.test.mjs`, which declares only E1-E4. The record states the disagreement under `evidence.plan.disagreements`, cites the plan's suite per edge **and** the suite whose test proves it, and both directions are asserted.
- Two reds remain and neither is repairable inside these paths: the gate record `m044` (seven disagreements, T007 owns it) and the teardown census `m059` (now a fourth red from this record's arrival; `M059_CAPTURE=1` is outside this task). No exclusion list was widened to fit.
- Five suites reddened at HEAD, not the three the brief predicted; two of the extra were `overlay-verdict-claims` and, for missing reason rows, `gate-integrity`.
