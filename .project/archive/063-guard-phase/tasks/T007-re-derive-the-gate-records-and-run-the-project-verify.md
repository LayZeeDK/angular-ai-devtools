---
id: T007
title: Re-derive the gate records and run the project verify
wave: 7
status: done
deps: [T006]
agent: build_T007
base: bb16ac5d6fad20271915d915a240ad14150caf71
worktree: null
task_branch: null
files:
  - research/raw/m044-gate-shapes.json
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m057-record-shapes.json
  - scripts/tutor-signals-shapes.test.mjs
  - research/raw/m056-gate-stability.json
  - research/raw/m059-record-shapes.json
  - scripts/teardown-leak-shapes.test.mjs
  - research/raw/m054-style-read.json
  - scripts/visual-qa-style-read.test.mjs
  - research/raw/m052-webmcp-api.json
  - scripts/webmcp-api.test.mjs
---

# T007 — Re-derive the gate records and run the project verify

## Goal

Capture the tree-derived gate record at this head, then run the project verify and observe it reach its last leg.

## Context

The gate record derives from the whole tree, so it is captured last. Every verify from wave 4 onward in M062 stopped in `npm test` leg 1, and a one-line defect in the app suite sat unnoticed for six waves.

## Approach

Capture with `M044_CAPTURE=1`, read it back, then run the project verify line verbatim. Report which legs ran: `npm run check`, `npm test` leg 1, user-scope tests, skills, `test:app` and the held-out corpus. A run that stops early is a finding, not a pass.

## Interface contract

`guardAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `phase`, `guard`, `verdict`, `absences`. `state` is one of `guard-cancelled`, `guard-phase-only`, `guard-allowed`, `cannot-tell`. `phase` and `guard` are filled only from fields the record carries and are otherwise `null`, and a verdict that names a phase but no guard is reported as `guard-phase-only` rather than attributed to a route. No field is derived from the DOM, from the console, from the nearest route, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiGuardAnswer(guardAnswer)`.

## Intent coverage

- SC1
- SC4

## Acceptance criteria

1. SC1: the gate record re-derives at this head; a mutant that changes one counted denominator reddens by field name.
2. SC4: the project verify builds before it measures, exits 0, reaches `test:app` and the held-out corpus, and its command is recorded verbatim.

## Verify

```bash
M059_CAPTURE=1 node --test scripts/teardown-leak-shapes.test.mjs && node --test scripts/teardown-leak-shapes.test.mjs scripts/visual-qa-style-read.test.mjs scripts/webmcp-api.test.mjs scripts/tutor-signals-shapes.test.mjs
```

## Log

- pending.
- Contract amended a second time, with the measurement the previous dispatch produced: three recordings the milestone's own edits moved are now declared. `m059` pins a line inside the gate record T006 grew (2907 to 3010) and has a writer; `m054` and `m052` quote `extension/manifest.json:38` as `"world": "MAIN"`, which T001's inserted line pushed to 39, and neither has a writer, so both are re-derived from the tree their suites derive.
- Contract amended before the wave opened: `research/raw/m057-record-shapes.json` and `scripts/tutor-signals-shapes.test.mjs` are declared. That suite is a read-only pin with no writer, and it reddens because T004's claims record added eight edge rows to the vocabulary it counts — so the record must be re-derived from the tree the suite derives, and the `node --version` of the run recorded beside it.
- `research/raw/m056-gate-stability.json` is declared because this task's Log will name paths, and a Log that names an undeclared path moves the gate's mention count again.

- Landed paths: `research/raw/m059-record-shapes.json`, `research/raw/m054-style-read.json`, `research/raw/m052-webmcp-api.json`, `research/raw/m057-record-shapes.json`.
- The three stale records were each moved by this milestone's own edits, and none was declared the first two times this task was dispatched: `m059` pins a line inside the gate record T006 grew (2907 to 3010), and `m054` and `m052` quoted `extension/manifest.json:38` as `"world": "MAIN"` where T001's inserted line pushed it to 39. Two of the three have no writer, so they were corrected from the tree their suites derive — which is what "re-derive" can mean when there is no armed flag.
- **The project verify reached its last leg for the first time in this milestone**, and every leg passed: `npm run check` exit 0, `npm test` leg 1 2,103/2,103, user-scope 60/60, skills 320/320, `test:app` 398/398, and the held-out corpus 22 suites and 85 tests, all green in 32m 01s.
- The held-out leg is 23 minutes of that on its own: `e3` spawns a full `npm test` and `e4` spawns check-and-test twice. Two foreground attempts were killed at a 600-second tool ceiling, which is an environment bound rather than a tree failure — the run was moved to a detached process and finished.
- The verify rewrites `extension/panel/index.html` with a non-deterministic modulepreload order, so the file was restored after the run; M058's and M059's verify lines end with that restore and M063's does not. That is a plan gap worth fixing at the template.
- The exit-code line the wrapper printed was lost to a `0>>` redirection in cmd, so the exit code is inferred from every leg running under `&&` and from the held-out corpus's own summary. The ledger row is recorded by the orchestrator, which is the only place `lars-gsd verify-final` runs on this host.
