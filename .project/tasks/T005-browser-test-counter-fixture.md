---
id: T005
title: Browser test on spikes/ng222-app for signal provenance
wave: 2
deps: [T004]
status: done
agent: build_t005
base: b365bfdc8294e4e5bfdde9d369a782d6da626d6e
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - apps/angular-ai-devtools-e2e/src/signal-provenance.spec.ts
---

# T005 — Browser test on spikes/ng222-app for signal provenance

## Context

Prove the walking skeleton end-to-end on the counter fixture: provenance tracing works on the counter fixture; at least three anti-patterns detected and reported with evidence; panel renders chain and explanation in supported browsers. Reuse the control-ai-browsers skill; build the extension first. Edge E8: where Prompt API is unavailable, deterministic provenance and anti-patterns still render with the availability reason. Prohibition N7: no model call without explicit user action.

## Approach

- Add a Playwright spec that drives the Angular AI panel against `spikes/ng222-app`: recording starts, component picker lists `app-counter` after a click, the provenance chain renders with node kinds/labels/edge directions, at least three anti-pattern findings render with labels and positions, Explain triggers exactly one model call and renders an answer, and an unavailable-Prompt-API profile keeps deterministic results with the reason.
- Build the extension before running (`npx nx run angular-ai-devtools:build-extension`).
- Drive browsers only through `control-ai-browsers`; do not start/stop profiles by hand.

## Interface contract

- None

## Intent coverage

- SC5

## Acceptance criteria

1. On `spikes/ng222-app`, clicking the counter button makes the picker list `app-counter` and selecting it renders a provenance chain with producers and consumers.
2. At least three anti-pattern findings render with node labels and graph positions.
3. Explain triggers exactly one model call and renders an answer; a repeat on an unchanged selection makes no second call.
4. On a Prompt-API-unavailable profile, chain and findings render and the explain button shows the availability reason.
5. The spec passes in the supported browser matrix.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npx playwright test apps/angular-ai-devtools-e2e/src/signal-provenance.spec.ts
```

Heavy: yes

## Log

- created by planner
