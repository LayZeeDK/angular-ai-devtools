---
id: T005
title: Register the lint surface in the panel demo
wave: 3
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - scripts/panel-routes.test.mjs
---

# T005 — Register the lint surface in the panel demo

## Context

T003 installed a `lint` route that resolves its surface through `PanelDemoComponent`, but
`apps/angular-ai-devtools/src/app/panel-demo.ts` owns the `LOADERS` and `FACTS` maps and has no `lint`
key, so visiting the route hits the demo's `error: no such surface lint` branch. T003 could not fix it:
the file was outside its declared paths, and it said so rather than widening its own contract.

The same gap existed for the four surfaces built before this milestone and was fixed by hand in
`4439190`, which is exactly why it recurred: nothing checks that a declared surface has a loader.

## Approach

Add the `lint` loader and a sample fact list to `panel-demo.ts`, and add a test that compares the
`data.surface` values declared in `app.routes.ts` against the `LOADERS` keys in `panel-demo.ts`, so a
surface with no loader fails a check instead of rendering an error branch.

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `scripts/panel-routes.test.mjs`

## Acceptance criteria

1. `panel-demo.ts` carries a `lint` loader and a sample fact list, so the route renders a real state
   rather than the `no such surface` branch.
2. E4: a test compares every `data.surface` in `app.routes.ts` against the `LOADERS` keys and fails
   naming the surface that has no loader.
3. A mutant reddens: removing the `lint` key from `LOADERS` makes the test fail with a message naming
   `lint`, not merely a count mismatch.
4. Verify passes: `node --test scripts/panel-routes.test.mjs` and the ordered route pins in the app
   suite stay green.

## Verify

```bash
node --test scripts/panel-routes.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
