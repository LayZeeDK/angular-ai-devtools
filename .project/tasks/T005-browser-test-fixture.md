---
id: T005
title: Browser test of the chain on spikes/ng222-app
wave: 2
deps: [T004]
status: pending
agent: null
base: null
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
