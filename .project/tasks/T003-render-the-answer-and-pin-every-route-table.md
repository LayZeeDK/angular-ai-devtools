---
id: T003
title: Render the answer and pin every route table
wave: 3
status: pending
deps: [T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-locale-correctness.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/panel-copy.test.mjs
  - scripts/copy-check.test.mjs
  - research/raw/m061-surface.json
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/component-search.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T003 — Render the answer and pin every route table

## Goal

Render the join object on a new panel route, moving the loader key, the route table, the digest row count and the copy record in the same task.

## Context

Five occurrences of a route-table pin left out of `files:` have blocked this programme; the two spec files and the three script suites are declared here for that reason. The copy record grows by the sentences this surface states and by no others.

## Approach

Add `panel-locale-correctness.ts` rendering the six fields, one line per state and one per absence. Add the surface to `PANEL_SURFACES`, a `LOADERS` key and a `FACTS` sample, then move `app.spec.ts`, `page-picker.component.spec.ts` and the route/copy pins in the same commit.

## Interface contract

`localeCorrectness(records)` is a pure function of the records it is given. It returns, in every state, one object with six fields: `state`, `token`, `provider`, `importPath`, `absences`, `claims`. `state` is one of `locale-provider-entry`, `locale-token-absent`, `formatted-outside-i18n`, `cannot-tell`. `token` and `provider` are filled only from fields the record carries and are otherwise `null`. `absences` always includes `locale-value-not-recorded` whenever `provider` is not `null`. No field is derived from the rendered text, from `navigator.language`, from a position in the provider list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiLocaleCorrectness(localeCorrectness)`.

## Intent coverage

- SC4
- SC2

## Acceptance criteria

1. SC4: the surface renders exactly the six fields of the join and adds no remedy, cause or identity; a mutant that renders a sentence the join did not produce reddens `scripts/panel-copy.test.mjs`.
2. SC2: the rendered answer for a record with no formatter is the absence line, never a locale read from the page; a mutant that renders the page text reddens.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/panel-copy.test.mjs scripts/copy-check.test.mjs && npx prettier --check apps/angular-ai-devtools/src/app/panel-locale-correctness.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts research/raw/m061-surface.json
```

## Log

- pending.
