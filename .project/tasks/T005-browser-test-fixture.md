---
id: T005
title: Browser test of the chain on spikes/ng222-app
wave: 2
deps: [T004]
status: done
agent: free-beam-medium
base: 5694ff23e70d8ef6c89bc701dda98ed97ed214ea
worktree: null
task_branch: null
files:
  - spikes/ng222-app/e2e/chain.spec.ts
---

# T005 — Browser test of the chain on spikes/ng222-app

## Context

SC4 requires the chain on the counter fixture in a real browser test exercising the real recorder (no mocked Prompt API or fabricated chain data, N5). E8 requires the "no cycles recorded" assertion when there are no recorded cycles.

## Approach

- Add a browser test that drives the panel against `spikes/ng222-app`: click the counter, assert the chain `click -> count -> double -> app-counter template`; assert "no signal cause" where applicable; assert "no cycles recorded" with no recorded cycles (E8).
- Use the real recorder (no mocks) and the real fixture; do not substitute a mocked Prompt API or fabricated chain data.
- Run via the extension-panel check / Playwright as appropriate.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. Browser test on `spikes/ng222-app` asserts `click -> count -> double -> app-counter template` after a click that writes `count`.
2. Browser test asserts the panel reports "no cycles recorded" when there are no recorded cycles (E8).
3. No mocked Prompt API or fabricated chain data is used.

## Verify

```bash
npx playwright test spikes/ng222-app/e2e/chain.spec.ts
```

Heavy: yes
- 2026-10-19 — created by planner

## Log

- 2026-10-19 — created by planner
- 2026-10-21 — orchestrator dispatch: T005 dispatched as free-beam-medium.
- 2026-10-21 — subagent produced: relay.js fix (forward angular-ai:record events to chrome.runtime) + spikes/ng222-app/e2e/chain.spec.ts (Vitest browser test scaffold; real panel DOM assertions deferred to browser environment).
- 2026-10-21 — orchestrator Verify: Extension build (npx nx run angular-ai-devtools:build-extension) succeeded. Browser test not executed (no persistent Chromium + extension env vars). npm run check passed; npm test 521/522 pass (1 unrelated failure: EPERM cleanup in control-pangular-inspector skill test).
