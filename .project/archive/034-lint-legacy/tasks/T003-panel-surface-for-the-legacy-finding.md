---
id: T003
title: Panel surface for the legacy finding
wave: 2
status: done
deps: [T002]
agent: paid-deepseek-v4-1-flash-high
base: 0077279324a48f933ffe36c6f38b064f0543b00e
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
- 2026-11-06 — dispatched paid-deepseek-v4-1-flash-high (serial isolation, primary checkout). Built
  `panel-legacy.ts` on the sibling surfaces' pattern, registered `/legacy` with `data.surface` in the demo loader,
  and re-cut the pins the route genuinely moves: `app.spec.ts` 15 -> 16, `chat-entry.component.spec.ts` 15 -> 16,
  10 -> 11 and the surface loop 6 -> 7, `panel-routes.test.mjs` surfaces 4 -> 5 with a second mutant that must fail
  naming `legacy`. It corrected two premises of the plan by measurement: `scripts/router-diagnostic.test.mjs` pins
  the m033 recording and not `app.routes.ts` (re-cut to 17, saw `16 !== 17` redden, restored byte-identically), and
  `page-picker.component.spec.ts` asserts no count (18/18 with and without the route). 27/27 task tests,
  333/333 app tests, 10/10 held-out, `tsc` exit 0, prettier clean.
  Verdict: ready.
