---
id: T001
title: Record the ordered guard verdicts and the phase each ran in
wave: 1
status: done
deps: []
agent: build_T001
base: 895e4867ee3eb855840019fa177fec301404688f
worktree: null
task_branch: null
files:
  - extension/guard-phase.js
  - scripts/guard-phase.test.mjs
  - extension/manifest.json
  - extension/manifest.test.mjs
  - extension/overlay.test.mjs
  - extension/page-footprint.test.mjs
  - scripts/docs-correction.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T001 — Record the ordered guard verdicts and the phase each ran in

## Goal

Record each guard verdict with the phase it ran in, so a cancelled navigation names its guard rather than the nearest console line.

## Context

The narrator's `guards` section is a fixed absence (`cannot-tell`, `guard-verdict-not-recorded`) because the router payload carries `{ route, type }` and no guard name. `grep -c "canActivate\|canMatch" extension/agent-main.js` returns 0, so this task writes the record the milestone joins against.

## Approach

Reduce the navigation the agent already observes to `{ phase, guard, verdict, path }` rows in arrival order, with `phase` from `canMatch`/`canActivate`/`canDeactivate`/`resolve`. Expose a pure reducer and one reader registered in the manifest. A row with a phase and no guard keeps `guard: null` and an absence.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. SC3: the record is the only source of a guard phase — its suite asserts no other module under `extension/` produces one, and a second reader reddens it.
2. SC1: a row records its phase and guard in arrival order; a mutant that reorders two rows reddens naming the phase.
3. SC2: a row whose guard is unknown keeps `guard: null` with an absence, and a mutant that fills it from the console reddens.

## Verify

```bash
node --test scripts/guard-phase.test.mjs && npx prettier --check extension/guard-phase.js scripts/guard-phase.test.mjs extension/manifest.json
```

## Log

- pending.
- Landed paths: `extension/guard-phase.js`, `scripts/guard-phase.test.mjs`, `extension/manifest.json`, `extension/manifest.test.mjs`, and two `SUITE_DIFF_REASONS` rows in `scripts/gate-integrity.test.mjs`.
- The record is `{ rows: [{ phase, guard, verdict, path }], absences }`, in arrival order, on `globalThis.angularAiGuardPhase`. A row whose guard the navigation does not name keeps `guard: null` with an absence, and a record carrying no verdict still answers the narrator's own `guard-verdict-not-recorded` rather than an empty list that would read as "a guard ran".
- `canMatch` ordering is pinned by a mutant, and five mutants were measured both ways, including a console fallback and a second module producing a phase.
- **The navigation the agent records cannot yield a guard name**: `agent-main.js` carries `{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate, matchedPaths }` and nothing else, so the reducer's input is the ordered guard observations the caller hands over. No page-side read was added, which is what SC3 and N3 require literally.
- The manifest line drift is one line wide and deliberate: `guard-phase.js` was placed *after* `agent-main.js` so `agent-main.js` stays at line 35 where `research/raw/m043-settle-page.json` cites it. Three recordings still cite `run_at` and `world` one line lower (`m054`, `m052`, `m059`); waves 5 and 7 re-derive them.
- The plan's Interface contract on this task is T002's join, the same generator defect M062 T001 recorded. The reducer was built from the Goal and acceptance criteria, and the record carries what the join needs.
