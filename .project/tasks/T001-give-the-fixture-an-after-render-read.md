---
id: T001
title: Give the fixture an after-render read
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/after-render-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/after-render-fixture.test.mjs
---

# T001 — Give the fixture an after-render read

## Context

M028 explains why an `afterNextRender` read of `offsetWidth` saw 0, from the ordered profiler after-render
events the page agent already records. The profile exists in the extension; the fixture subject must be
created. See `.project/research/evidence-m028-premise.md`.

## Approach

Add a standalone component on a new fixture route whose `afterNextRender` reads `offsetWidth` from a child element before layout has produced a box. Register the route. Re-pin the panel's route-list assertion in chat-entry.component.spec.ts to include the new route, keeping the full ordered toEqual.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/after-render-page.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `scripts/after-render-fixture.test.mjs`

## Acceptance criteria

1. The component renders on its route and its `afterNextRender` reads `offsetWidth`, proven by the read returning a number (including 0) rather than throwing.
2. No page-side instrumentation is added: no `ɵsetProfiler` call and no profiler subscriber appears in the fixture (held-out E2 depends on this).
3. The panel route-list assertion is re-pinned to include the new route and reddens when the route is removed.
4. The fixture suite passes and the panel spec passes.

## Verify

```bash
npm ci --include=dev; node --test scripts/after-render-fixture.test.mjs
```

## Intent coverage

- SC1

## Log

- dispatched
