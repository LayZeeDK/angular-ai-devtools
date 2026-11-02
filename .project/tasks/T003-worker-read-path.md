---
id: T003
title: Add a reusable worker read path
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/worker-read.service.ts
  - apps/angular-ai-devtools/src/app/worker-read.service.spec.ts
  - apps/angular-ai-devtools/src/worker-read.worker.ts
---

# T003 — Add a reusable worker read path

## Context

The only worker precedent is the hand-written, untested extension/stale-view-worker.js. This task adds a reusable worker read path the panel can use, reusing the token/supersession precedent, without blocking the panel while a read resolves and without growing the initial bundle.

## Approach

- Reuse the token/supersession precedent from extension/stale-view-worker.js.
- The worker runs reads off the main thread and returns results to the panel; the panel must not block while a read resolves.
- No new dependency is added; the panel initial bundle is already 535.44 kB against a 520 kB maximum warning, so this task must not make it worse and must say so.
- Reads must not drop the module-level injector capture documented for the page-read port.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. A read can be issued through the worker boundary and resolves off the main thread.
2. Supersession cancels a stale read when a newer one is issued.
3. No new dependency is added and the panel initial bundle does not grow.
4. The page-read injector capture is preserved.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/worker-read.service.spec.ts
```

Heavy: no

## Log

- created by planner