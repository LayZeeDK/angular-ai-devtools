---
id: T004
title: Deliver DevTools panel UI for signal provenance and anti-patterns
wave: 2
deps: [T001, T002, T003]
status: done
agent: claude
base: 428bb85b02acf8dae95182151a94b3b5eef8292e
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/signal-provenance.service.ts
  - apps/angular-ai-devtools/src/app/signal-provenance.service.spec.ts
  - apps/angular-ai-devtools/src/app/n2-signal-provenance.component.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
---

# T004 — Deliver DevTools panel UI for signal provenance and anti-patterns

## Context

Walking skeleton: the panel lets a user select a signal or component, renders the provenance chain (kind, label, edge direction for every node), runs the four anti-pattern rules, and asks the panel-local Prompt API to explain the chain and findings via a short fact list (no tool calling, no signal values, no page data). The explain button is the only trigger for a model call (Prohibitions N2/N7); Prompt API unavailable disables it with a reason while deterministic results still render (edges E5/E8). Labels are page-controlled: cap at 200 chars and wrap in `<page>` before they reach the prompt (Prohibition N1). Graph-unavailable shows "graph unavailable" (distinct); no anti-patterns shows "no anti-patterns found" plus the chain (edge E4). Signal/component not found shows "not found" with no model call (edge E2).

## Approach

- Add `SignalProvenanceService` that reuses `UpdateCauseService` recorded cycles, exposes the checked-component list, and caches the previous graph per component to support T003's two-snapshot mitigation.
- Add `N2SignalProvenanceComponent` with a signal/component picker, provenance chain display, anti-pattern list with node labels and positions, explain button + answer, and availability reason. Reuse `ExtensionPromptService` (`explainFacts`) with a fact list of node kind + label + edge direction + anti-pattern name; never send signal values or raw page data.
- Register the component in `app.routes.ts`.
- Wrap page-sourced labels: cap 200 chars, strip nested `<page>`/`</page>`, wrap as `<page>…</page>`; render answers as text, never HTML.
- Cache explain results per selection so a repeat on an unchanged slice makes no second model call.

## Interface contract

- None

## Intent coverage

- SC2
- SC3
- SC4

## Acceptance criteria

1. The panel renders the provenance chain for a selected signal/component showing each node's kind, label, and edge direction (SC2, Prohibition N5).
2. At least three anti-pattern findings render with node labels and graph positions (SC3, Prohibition N6).
3. "no anti-patterns found" shows when the detector returns an empty list, while the chain still renders (edge E4).
4. "graph unavailable" shows (distinct) when the graph is unavailable; "not found" shows when the signal/component is missing (edges E2/E3).
5. Explain calls `ExtensionPromptService` with a fact list only (no signal values, no page data); the explain button is the only model-call trigger (Prohibitions N1/N2/N7).
6. When Prompt API is unavailable, chain and findings still render and the explain button is disabled with the availability reason (edges E5/E8).
7. Labels reaching the prompt are capped at 200 chars and wrapped in `<page>`; answers render as text.

## Verify

```bash
npx nx test angular-ai-devtools --skip-nx-cache --include=apps/angular-ai-devtools/src/app/signal-provenance.service.spec.ts && npx nx run angular-ai-devtools:build-extension --skip-nx-cache
```

Heavy: no

## Log

- created by planner
- attested: T004 signal-provenance feature implemented manually on the primary worktree. The verify command uses Nx --include to run the signal-provenance service spec and build the DevTools extension, both passing.
