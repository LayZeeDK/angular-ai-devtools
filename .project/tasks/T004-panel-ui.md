---
id: T004
title: Deliver DevTools panel UI for component picker, chain, and explain
wave: 2
deps: [T001, T002, T003]
status: done
agent: free-beam-medium
base: 80b2c298eee64480122ee0a23462bcbe3b535bfd
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/n1-update-cause.component.ts
  - apps/angular-ai-devtools/src/app/n1-update-cause.component.spec.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
---

# T004 — Deliver DevTools panel UI for component picker, chain, and explain

## Context

The panel must list the components recorded cycles checked; the user picks one; the panel shows the chain of the last cycle that checked it; and asks the panel-local Prompt API to explain the chain, sending only a short fact list (no tool calling). Recording starts on panel open and resets on page reload. Empty (no cycle has checked the component), not-found ("not found"), and not-supported ("not supported" with reason, E7) states must be handled. The explain button is the only trigger for a model call (N4).

## Approach

- Rework `N1UpdateCauseComponent` to show a component picker (from recorded cycles), a chain view for the selected component, and an Explain button that calls `ExtensionPromptService` with a fact-list prompt built from the chain (component names, signal labels, trigger kinds only; no signal values/page data).
- Build the prompt as a short fact list and delimit it as data, not instructions; never route prompt or answer through `relay.js`/`background.js`.
- Handle empty/not-found/not-supported states without a model call.
- Gate Explain on availability from T003; disable with the availability reason when unavailable (E5/E9); keep the chain visible.
- Cache explanations keyed by component id + node ids + epochs so an unchanged slice reuses the cached answer with no prompt.
- Preserve existing panel features (Angular version explain, messaging, tab filtering).
- `ExtensionMessageService` forwards recorded cycles from the page to `UpdateCauseService` without changing tab filtering.

## Interface contract

- Recorded cycle:
```
{
  cycleId: number,
  startedAt: number,
  trigger: { kind: 'output' | 'unknown', listenerName: string | null },
  checks: Array<{ instance: object, componentName: string, events: number[] }>
}
```
One `checks` entry per `TemplateUpdateStart`/`End` pair in profiler event order; `cycleId` increments per microtask-delimited cycle.

- Chain result:
```
type ChainResult = {
  componentName: string;
  trigger: 'output' | 'signal' | 'eager' | 'unknown';
  triggerLabel: string;        // e.g. "click"
  signalLabels: string[];      // signals whose epoch changed
  chain: string;              // e.g. "click -> count -> double -> app-counter template"
  noSignalCause: boolean;
  graphUnavailable: boolean;
};
```

- Availability result:
```
status: 'ready' only when availability === 'available';
availability: string; // raw value from LanguageModel.availability()
```

## Intent coverage

- SC2
- SC3
- SC5

## Acceptance criteria

1. Panel lists components checked by recorded cycles; picking one shows the last cycle's chain.
2. Empty state: no cycle has checked the component since recording started -> panel says so; no model call.
3. Not-found state: component not on the page -> "not found".
4. Not-supported state: no `ng.ɵsetProfiler` -> "not supported" with reason; no recording, no model call.
5. Explain button is the only trigger for a model call; prompt carries only the shaped fact list (no tool calling).
6. Availability reason is shown and Explain disabled when Prompt API is unavailable; chain still renders.
7. Existing panel features (version explain, messaging, tab filtering) remain intact.

## Verify

```bash
npx nx test angular-ai-devtools --skip-nx-cache --testPathPattern=apps/angular-ai-devtools/src/app/n1-update-cause.component.spec.ts
```

Heavy: no
- 2026-10-19 — created by planner

## Log

- 2026-10-19 — created by planner
- 2026-10-21 — orchestrator dispatch: T004 dispatched as free-beam-medium
- 2026-10-21 — subagent produced: apps/angular-ai-devtools/src/app/n1-update-cause.component.ts, apps/angular-ai-devtools/src/app/n1-update-cause.component.spec.ts, apps/angular-ai-devtools/src/app/extension-message.service.ts, apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
- 2026-10-21 — orchestrator Verify (isolate gsd-path-task/T004): pass, exit 0; full suite 19 tests passed (5 files). Official T004 verify: 1 test passed.
