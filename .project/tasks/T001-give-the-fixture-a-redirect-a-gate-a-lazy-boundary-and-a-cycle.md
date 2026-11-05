---
id: T001
title: Give the fixture a redirect, a gate, a lazy boundary and a cycle
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - spikes/ng222-app/src/app/redirect-page.ts
  - spikes/ng222-app/src/app/redirect-guard.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/router-config-capture.test.mjs
  - research/raw/m030-router-config.json
---

# T001 — Give the fixture a redirect, a gate, a lazy boundary and a cycle

## Context

M030 walks `Router.config` to explain why a path lands where it does. The fixture has six routes and none of
them redirects, guards or loads lazily (`.project/research/m030-router-evidence.md`), so the subject must be
created before the walk can be tested.

## Approach

Add a redirect route (`redirectTo`), a gated route (`canActivate`), a lazy route (`loadChildren`), and a pair of
routes that redirect to each other. Then record what `Router.config` actually yields when read through
`ng.getInjector(element).get(Router)`: the shape of each entry, which fields survive, and whether the injector
resolves on a routed element. The recording, not this task's prose, decides T002's input.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/redirect-page.ts`
- `spikes/ng222-app/src/app/redirect-guard.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `scripts/router-config-capture.test.mjs`
- `research/raw/m030-router-config.json`

## Acceptance criteria

1. The fixture has a redirect, a gated route, a lazy route and a redirect cycle, all reachable and listed in the route table.
2. The recording captures `Router.config` as read through `ng.getInjector`, with the entry shape and the fields each entry carries.
3. The recording states whether the injector resolved on a routed element, and if it did not, says so plainly rather than working around it.
4. A mutant reddens: removing the redirect route from the fixture leaves no redirect entry in the recording.

## Verify

```bash
npm ci --include=dev; node --test scripts/router-config-capture.test.mjs
```

## Intent coverage

- SC1

## Log

- dispatched
