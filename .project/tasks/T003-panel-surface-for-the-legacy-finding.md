---
id: T003
title: Panel surface for the legacy finding
wave: 2
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-legacy.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/panel-legacy.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/router-diagnostic.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the legacy finding

## Context

T002 produces the finding. The panel must render it without adding anything the fact list did not carry, and the route
must be reachable through the demo's loader map — the gap that cost M032 an extra task and M033 a contract amendment.

Three route-table pins enumerate routes and will be staled by adding this one: `app.spec.ts`, `chat-entry.component.spec.ts`
and `page-picker.component.spec.ts`. They are declared here so the landing cannot be refused for an undeclared file.

## Approach

A surface function that takes a short fact list and returns a state, its lines and its text, plus a lazy route registered
in the demo's loader map with a sample fact. Every fact list is normalised first, and the pane renders only `construct`,
`code` and `equivalent` — a remedy, a deprecation verdict or an element in the facts is dropped rather than shown.

## Interface contract

`legacyStructure(fact, equivalents) -> { state: "finding" | "cannot-tell", component?, structure?, modernForm?, source?, reason? }` — pure, no DOM.

## Files

- `apps/angular-ai-devtools/src/app/panel-legacy.ts` — the surface
- `apps/angular-ai-devtools/src/app/panel-demo.ts` — the loader and a sample fact
- `apps/angular-ai-devtools/src/app/app.routes.ts` — the `/legacy` route
- the three route-table pins — re-cut
- `scripts/panel-legacy.test.mjs`, `scripts/panel-routes.test.mjs` — the surface and the surfaces-versus-loaders check

## Acceptance criteria

1. Held-out E4: the surface renders the construct, the code and the modern equivalent from a short fact list, and renders the cannot-tell state with its reason and no equivalent.
2. A finding with `equivalentSourced: false` renders the construct and the code and states that no equivalent is recorded, rather than rendering an empty equivalent.
3. A fact list carrying a remedy, a deprecation verdict or an element renders none of the three.
4. The `/legacy` route is registered in the demo's loader map with a sample fact, and the surfaces-versus-loaders check names it when the loader is removed.
5. Every route-table pin this route stales is re-cut, and `npx tsc -p apps/angular-ai-devtools/tsconfig.check.json` exits 0.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-legacy.test.mjs" "scripts/panel-routes.test.mjs" && npx tsc -p apps/angular-ai-devtools/tsconfig.check.json
```

## Intent coverage

- SC4

## Log

- dispatched
