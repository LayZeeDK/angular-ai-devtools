---
id: T021
title: Verify N1/N2/N3 panel flows on edge-phi4mini
wave: 6
deps: [T006, T008, T011, T012, T016]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/review/rounds/panel-edge-phi4mini.md
  - tests/held-out/edge-phi4mini-panel.test.mjs
---

# T021 — Verify N1/N2/N3 panel flows on edge-phi4mini

## Context

SC3: the N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs, each with a `lars-verify` verdict of `verified`. This task owns the `edge-phi4mini` pair (port 9337): it drives N1 (change-detection causality), N2 (signal provenance) and N3 (DI doctor) on that single instance and records one `lars-verify` verdict per flow. E5: when a model pair cannot run, its claim records `unverifiable` with the reason; it is never reported as `verified`, and SC3 is not met until all four pairs answer. N3 (SC3): do not send page data to a cloud model or change the panel security model to make a check pass; the panel stays panel-local Prompt API. Coverage for N2/N3 now exists (T008). Apply the documented budgets of 600 s per control call and 1800 s per check, plus the idle-blank-tab recovery, one instance at a time. When the pair still cannot answer, record the verdict as `unverifiable` with the route and budget used — never `verified`.

## Approach

- Build the extension (`npx nx run angular-ai-devtools:build-extension`), run `control-ai-browsers up edge-phi4mini`, and drive the app with `control-angular-dev-app up --target counter`.
- Run the three checks (extension panel, signal provenance, DI doctor) through `verdict.mjs` into `.commandcode/worktrees/tmp/`, one verdict per flow.
- Lint each resulting `verdict.json` with `verdict.mjs lint`.
- Stop only what this task started.
- Budgets and recovery: 600 s per control call, 1800 s per check, plus the idle-blank-tab recovery; record `unverifiable` with the route and budget when the pair still cannot answer.
- Write the fragment `.project/review/rounds/panel-edge-phi4mini.md` with one heading per flow (N1, N2, N3): the verdict path, the verdict, the claim, and for anything not `verified` the reason, the recovery applied, the budget used and the route tried.
- Write `tests/held-out/edge-phi4mini-panel.test.mjs` proving each of the three verdict files exists, parses, records `verified`, and that the fragment cites it; no tautologies.

## Interface contract

- Fragment shape, identical in every producer and the consumer: one `## <Flow>` heading per flow (`N1`, `N2`, `N3`) carrying (a) the location of that flow's `verdict.json`, (b) the verdict word, (c) the claim as restated, and (d) for any verdict that is not `verified`: the reason, the recovery applied, the budget used and the route tried. The consumer merges the four fragments verbatim, without altering a verdict word or location, and adds the insurance-portal row.
## Intent coverage

- SC3

## Acceptance criteria

1. Three `lars-verify` verdicts are produced for `edge-phi4mini`, one each for N1, N2 and N3, each backed by a real `verdict.json` under `.commandcode/worktrees/tmp/` (E5).
2. Each verdict is `verified` only when `verdict.mjs lint` exits 0 on that `verdict.json`; otherwise it is recorded `unverifiable` or `inconclusive` with its reason.
3. The fragment `.project/review/rounds/panel-edge-phi4mini.md` cites each verdict path and verdict word.
4. The held-out test proves each of the three verdict files exists, parses, records `verified`, and is cited by the fragment, with no tautologies.
5. No page data is sent to a cloud model and no panel security model change is introduced (N3).

## Verify

```bash
npm ci && node --test tests/held-out/edge-phi4mini-panel.test.mjs
```

Heavy: yes

## Log

- created by planner