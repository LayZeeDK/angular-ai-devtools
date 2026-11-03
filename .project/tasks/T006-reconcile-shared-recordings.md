---
id: T006
title: Reconcile the shared recordings M023 invalidated
wave: 2
deps: [T001, T003, T004]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - research/raw/m022-ng-context.json
  - scripts/overlay-verdict-claims.test.mjs
  - research/raw/m022-verdict-claims.json
---

# T006 — Reconcile the shared recordings M023 invalidated

## Context

T005's gate found the whole red while every part was green. Three shared recordings were invalidated by
earlier tasks and no task owned their reconciliation: T001 installed three component packages and T003
consumed them, so the recorded development bytes no longer match the emitted ones; T004 regenerated the
docs audit from fresh fragments, which dropped `docs/autonomy-gaps.md` from the descriptive list the
repository pins; and `scripts/overlay-verdict-claims.test.mjs` compares M022's recorded criterion against
whatever `.project/intent/INTENT.md` holds **now**, so it fails by construction once a new milestone is
defined.

## Approach

1. Add `docs/autonomy-gaps.md` back to the audit's `## Descriptive docs` with a tally that agrees with the
   document, then re-run `scripts/autonomy-gaps.test.mjs`. Do not edit that test.
2. Re-record `research/raw/m022-ng-context.json` from the builds emitted at this head — the command,
   the bundle names, the byte counts, the `__ngContext__` write sites and the `window.ng` surface for
   both configurations. Do not edit `scripts/ng-context-dev-build.test.mjs`; it is the pin.
3. Point `scripts/overlay-verdict-claims.test.mjs` at the intent that produced the recording — the
   archived `.project/archive/022-in-page-overlay/intent/INTENT.md` — so a later milestone's criteria
   cannot redden it. The recorded rows in `research/raw/m022-verdict-claims.json` stay as they are.
4. Re-run the docs-audit gate and the disposition suite; they must stay green while the audit changes.

## Interface contract

None

## Intent coverage

- SC4 — `npm run check` and `npm test` pass at the head.

## Acceptance criteria

1. The audit's descriptive list names `docs/autonomy-gaps.md` and its tally agrees, so `scripts/autonomy-gaps.test.mjs` passes.
2. `research/raw/m022-ng-context.json` records the development and production bundles measured at this head, and `scripts/ng-context-dev-build.test.mjs` passes with that test unchanged.
3. `scripts/overlay-verdict-claims.test.mjs` reads the archived M022 intent rather than the current one, and its four assertions pass.
4. `scripts/docs-audit-disposition.test.mjs` still passes, so the audit's coverage, tallies, queue, exemptions and rulings order all still hold.

## Verify

```powershell
npm ci --include=dev; node --test scripts/autonomy-gaps.test.mjs scripts/ng-context-dev-build.test.mjs scripts/overlay-verdict-claims.test.mjs scripts/docs-audit-disposition.test.mjs
```

## Log

- created by orchestrator (T005 gate: three shared recordings invalidated)
