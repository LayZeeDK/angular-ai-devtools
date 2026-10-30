---
id: T006
title: Verify the stale-view claim across all four model instances and the portal
wave: 4
deps: [T005, T007, T008, T009, T010]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs
  - .claude/skills/verify-ai-browsers/checks/stale-view.test.mjs
  - .project/plan/PLAN.md
---

# T006 — Verify the stale-view claim across all four model instances and the portal

## Context

SC5 requires a `lars-verify` verdict of `verified` for the stale-view claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct; instances that cannot answer are recorded as could-not-run with their instance name and the claim is not `verified` while any named pair is could-not-run (Edge E9). SC6 requires the stale-view finding to be verified on the insurance-portal fixture where a route can produce a subscribe write, otherwise the claim records that the external dependency was not exercised and why (Edge E10). The panel uses its own `LanguageModel.availability()`, never the page's.

## Approach

- Add a `verify-ai-browsers` check (`stale-view.test.mjs`) driving the stale-view finding end-to-end on `spikes/ng222-app` across all four supported model instances, recording `verified`/could-not-run per instance.
- Run the portal check when a portal route can produce a subscribe write; otherwise record the external dependency as not exercised and why.
- Read-only phases never drive browsers; browser driving happens only in this task's verification phase.
- Judgment prohibitions N7 (do not count a could-not-run instance as a passing pair) and N8 (do not state the portal dependency was exercised when it was not) are recorded here.

## Interface contract

None

## Intent coverage

- SC5
- SC6

## Acceptance criteria

1. A `lars-verify` verdict of `verified` exists for the stale-view claim, with end-to-end coverage across chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini and edge-dev-aion (SC5).
2. Any instance that cannot answer is recorded as could-not-run with its instance name, and the claim is not `verified` while any named pair is could-not-run (Edge E9, Prohibition N7).
3. Where a portal route can produce a subscribe write, the finding is verified on the insurance-portal fixture and the claim records that external dependency; otherwise the claim records that the dependency was not exercised and why (SC6, Edge E10, Prohibition N8).

## Verify

```bash
node --test .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs
```

Heavy: no

## Log

- created by planner
- 2026-10-30 rejected attempt (superseded by the T007 build repair): stale-view check created and `node --test` passed 6/6; chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini and edge-dev-aion each could-not-run because `build-extension` fails TS2345 in `src/main-world/stale-view-scan.ts`; portal not exercised (extension build blocked); claim not verified.
- 2026-10-30 rerun after T007: build-extension succeeds (extension/panel/ written). All four instances could-not-run for one reason: the control-ai-browsers `panel` driver implements only `version` and `error-explainer`, so no `stale-view` drive exists. Portal not exercised (the panel driver cannot drive stale-view). Claim verdict: not verified (E9, N7). Superseded by T008, which adds the drive.
- 2026-10-30 third attempt after T008: check written and 6/6 unit tests pass; all four instances recorded could-not-run for "fixture could not be served". Orchestrator correction, measured: `spikes/ng222-app/node_modules/.bin/ng` exists and its `package.json` defines `start: ng serve`, so the fixture is servable from its own folder (`npm start -- --port 4222`). The next attempt must serve it that way before recording could-not-run; only a genuine driver or model failure may be recorded that way.