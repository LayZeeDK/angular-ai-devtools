---
id: T003
title: Rule which SC1 and SC2 claims need a lars-verify verdict and leave the driver that produces it
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m022-verdict-claims.json
  - spikes/probes/overlay-pick.js
  - scripts/overlay-verdict-claims.test.mjs
---

# T003 — Rule which SC1 and SC2 claims need a lars-verify verdict and leave the driver that produces it

## Context

`CHARTER.md` requires a portal-backed `lars-verify` verdict for every feature whose facts an insurance-portal route can produce, and this milestone ships the only programme-1 code an inspected page can observe, so the question "which of SC1 and SC2 needs a verdict, and which page produces its facts" is a milestone decision rather than a formality. SYNTHESIS leaves it as `Still unknown` and says the artifact that settles it is the verdict's `verdict.json`; what the plan can settle first is the claim list itself, so the wave gate runs a named list instead of deciding what to verify while it reviews. Nothing in the current check set evaluates an inspected page for tool-owned nodes: the eight shipped claims read panel text and instance state, so a picker claim needs its own driver.

## Approach

- **One row per claim, and no row without a ruling.** `research/raw/m022-verdict-claims.json` carries one row for each of SC1 and SC2: the criterion, whether a `lars-verify` verdict is required (`required` or `not-required`) with the reason drawn from the charter's portal clause and from where the facts are producible, the page or route that produces them, the driver file that drives it, the instance it is driven on, and the verdict path the gate will cite.
- **The driver is written here and run at the gate.** `spikes/probes/overlay-pick.js` is a `control-ai-browsers run` driver (`async page => { … }`) returning one JSON-able reading per run: the count of tool-created elements, the rect the overlay drew for a chosen element, the descriptor the page realm answered for that pick, and the named outcome a page without a dev context reports. It reads the page only and writes nothing: no page global, no storage, no second element.
- **A claim whose driver does not exist is a plan defect, not a gate surprise.** The check requires every `required` row to name a driver file that exists and to be shaped as the driver above, so the list cannot name a mechanism the milestone does not have. A row may be `not-required`, but then it must say why the charter's clause does not reach that criterion — a reason, not a blank.
- **Both criteria are walked, and the recording says which page is the source.** The portal is used where it is possible and meaningful; the counter fixture is used where the claim is producible only there. Each row names which one it is, so a reviewer reading `verdict.json` later knows which page the claim was observed on rather than inferring it.
- **The check is cheap and it fails loudly.** `scripts/overlay-verdict-claims.test.mjs` reads the recording, requires exactly one row per SC1/SC2, requires every required row's driver to exist with the driver shape, requires every row to name a source page and a verdict path, and fails — never skips — when the file or a field is missing. It does not drive a browser: the gate does that, from the list this task leaves.
- **Nothing else changes.** No product file, no fixture file and no Markdown document: the docs-audit gate derives its frozen inventory from the tracked Markdown tree, so the ruling lives in JSON and in the check beside it.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `research/raw/m022-verdict-claims.json` carries exactly one row for SC1 and one for SC2, and no row for a criterion this milestone does not declare.
2. Every row rules `required` or `not-required`, and a `not-required` row states why the charter's portal clause does not reach that criterion rather than leaving the cell empty.
3. Every `required` row names the page or route that produces the facts, the driver file, the instance it is driven on, and the verdict path the wave gate will cite.
4. Every named driver exists and is a `control-ai-browsers run` driver shaped `async page => { … }` that reads the page only and returns plain data.
5. `spikes/probes/overlay-pick.js` returns the four readings the claim list needs — tool-element count, the drawn rect for a chosen element, the descriptor for that pick, and the named outcome for a page without a dev context — and writes nothing into the page.
6. `scripts/overlay-verdict-claims.test.mjs` enforces criteria 1 to 5 and fails, never skips, when the recording is absent or a required field is missing.
7. The recording names, for each criterion, whether the insurance portal or the counter fixture is the source page, so a later reader of a verdict knows where the claim was observed.
8. No product file, fixture file or Markdown document changes anywhere in the tree.

## Verify

```bash
npm ci --include=dev && node --test scripts/overlay-verdict-claims.test.mjs
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The driver is executed at the wave gate; this check proves the
     claim list is complete and that the driver it names exists. -->

Heavy: no

## Log

- 2026-11-03 — created by planner
