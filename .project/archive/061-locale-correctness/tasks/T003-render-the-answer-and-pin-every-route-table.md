---
id: T003
title: Render the answer and pin every route table
wave: 3
status: done
deps: [T002]
agent: build_T003
base: 3fa47a6eef988dc0e374b0085aa8540b3ff547a9
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
- Landed paths: `apps/angular-ai-devtools/src/app/panel-locale-correctness.ts` (new), `panel-demo.ts`, `app.routes.ts`, `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`, `panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/panel-copy.test.mjs` (new), `scripts/copy-check.test.mjs`, `research/raw/m061-surface.json`.
- Counts moved: panel surfaces 30 → 31, loader keys 30 → 31, ordered route paths 39 → 40. Digest rows and the M048 copy record stay at 204 and 31/213, because this pane declares no sentence — no row was invented.
- `scripts/panel-copy.test.mjs` did not exist; the plan named it as a surface pin and it is created here, with eight tests including three mutants.
- The copy coverage pin previously demanded an M048 row for every `panel-*.ts`; it now reads the union of that record and this milestone's own surface record, and the assertion is stronger (one record per surface, no double rows, no file off the tree) with two mutants that redden by name.
- Pre-existing red, measured and not caused here: `scripts/gate-integrity.test.mjs` is 30/40 both in the working tree and in a pristine `git worktree` at HEAD, because its `MEASURED_HEAD` is `d94502d1` and suites added after that head have no `SUITE_DIFF_REASONS` row. T005 re-derives `research/raw/m044-gate-shapes.json` and is where that is repaired.
- `npx tsc -p apps/angular-ai-devtools/tsconfig.app.json --noEmit` exits 2 on five pre-existing `TS6059` `rootDir` errors that predate this task; the project's own `tsconfig.check.json` and the root `tsconfig.json` both exit 0.
