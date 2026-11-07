---
id: T003
title: Panel surface for the resource finding
wave: 2
status: pending
deps: [T002, T005]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-resource.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/panel-resource.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/router-diagnostic.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
---

# T003 — Panel surface for the resource finding

## Context

The join answers with a resource identity, a status and a params status, or a `cannot-tell` reason. The surface renders
that and nothing else. Every sibling surface in the panel already has this shape, so this task follows them rather than
inventing a pattern, and the route it adds moves the route-table pins that three suites assert.

## Approach

Copy the four-state shape from `panel-onpush.ts`, register the route and a demo loader, add the surface mutant, and re-cut
every moved pin to its measured value.

## Interface contract

`resourceLifecycle(fact)` returns `{ state: "finding" | "cannot-tell", resource?, status?, params?, reason? }`, where
`reason` is one of `no-resource`, `labels-unreadable`, `params-unavailable`, `status-unavailable`. T003 consumes the same
shape; both tasks must carry this line unchanged.

## Files

- `apps/angular-ai-devtools/src/app/panel-resource.ts` — the surface.
- `apps/angular-ai-devtools/src/app/panel-demo.ts` — the loader and a sample fact.
- `apps/angular-ai-devtools/src/app/app.routes.ts` — the route with `data.surface`.
- The three route specs, `scripts/panel-routes.test.mjs` and `scripts/router-diagnostic.test.mjs` — pins.
- `scripts/panel-resource.test.mjs` — the surface tests and mutants.

## Acceptance criteria

1. held-out E5: the surface renders `resource`, `state` and `params` for a finding, only `reason` for cannot-tell, and its
   four states match the siblings; a mutant that renders a cause reddens by name.
2. Every route pin the new route moves is re-cut to its measured value, and a pin whose values do not move is left
   byte-identical and reported.
3. `scripts/panel-routes.test.mjs` fails naming `resource` when its loader is removed.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-resource.test.mjs" "scripts/panel-routes.test.mjs" "scripts/router-diagnostic.test.mjs"
```

## Intent coverage

- SC5

## Log

- dispatched
