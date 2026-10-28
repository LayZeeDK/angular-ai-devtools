---
id: T007
title: Verify N1/N2/N3 panel flows on all four model pairs and portal
wave: 3
deps: [T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/review/rounds/panel-verification.md
  - tests/held-out/e5-unverifiable-recorded.test.mjs
  - tests/held-out/e6-portal-dependency.test.mjs
---

# T007 — Verify N1/N2/N3 panel flows on all four model pairs and portal

## Context

SC3: the N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs, each with a `lars-verify` verdict of `verified`. SC4: where meaningful, the same claims are also verified on the insurance-portal fixture, and the claim records that external dependency. E5: when a model pair cannot run, its claim records `unverifiable` with the reason; it is never reported as `verified`, and SC3 is not met until all four pairs answer. E6: when the insurance-portal checkout is absent, the claim records the external dependency and stays `unverifiable` here; it never silently counts as verified. N3 (SC3): do not send page data to a cloud model or change the panel security model to make a check pass; the panel stays panel-local Prompt API. N6 (SC4): do not report a portal claim as verified when the portal checkout was absent.

## Approach

- Build the extension and drive each of the four supported model instances (`chrome-beta-nano`, `chrome-beta-gemma4`, `edge-dev-aion`, `edge-phi4mini`) against `spikes/ng222-app` using the control/verify skills.
- Produce one `lars-verify` verdict per pair for each of N1, N2, N3; only `verified` counts. Record each `verdict.json` path in `.project/review/rounds/panel-verification.md`.
- If a pair cannot run, record `unverifiable` with the reason; never report it as `verified` (E5). SC3 is not met until all four pairs answer.
- Run on the insurance-portal checkout where meaningful and record the external dependency in the claim; if the checkout is absent, record `unverifiable` with the dependency (E6, N6).
- Keep the panel panel-local Prompt API; no page/content-script Prompt API and no new host permission (N3).
- Held-out E5/E6 tests assert the unverifiable recording and the portal dependency recording.

## Interface contract

None

## Intent coverage

- SC3
- SC4

## Acceptance criteria

1. `lars-verify` verdict of `verified` for N1, N2, N3 on all four supported model pairs.
2. Each verdict's `verdict.json` is cited in `.project/review/rounds/panel-verification.md`.
3. Any non-running pair is recorded `unverifiable` with a reason, never `verified`.
4. Portal claims record the checkout path and stay `unverifiable` when it is absent.
5. No page data is sent to a cloud model and no panel security model change is introduced.
6. The held-out E5 test proves a pair that cannot run is recorded `unverifiable` with its reason and never `verified`; the held-out E6 test proves the insurance-portal checkout dependency is recorded and the claim stays `unverifiable` when the checkout is absent.

## Verify

```bash
npm ci && npm run check && npm test && npx nx run angular-ai-devtools:build-extension && node --test tests/held-out/e5-unverifiable-recorded.test.mjs tests/held-out/e6-portal-dependency.test.mjs
```

Heavy: yes

## Log

- created by planner
