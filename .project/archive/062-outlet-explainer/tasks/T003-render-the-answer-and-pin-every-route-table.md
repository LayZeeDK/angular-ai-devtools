---
id: T003
title: Render the answer and pin every route table
wave: 3
status: done
deps: [T002]
agent: build_T003
base: d287b975695fcf0f2b8c355c7250467ec1901611
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-outlet.ts
  - apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/panel-copy.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - research/raw/m048-surface-copy.json
  - research/raw/m061-surface.json
---

# T003 — Render the answer and pin every route table

## Goal

One new panel surface rendering exactly the join object, with every route table and the copy record moved together.

## Context

Five milestones have paid for a route-table pin declared too late: the spec, the fixture route count, the panel-routes census and the copy record all enumerate the table, so this task declares all four up front.

## Approach

Add the surface and its loader key, the route entry, the spec expectation, the fixture route count and the copy record in one commit. Mutant: add the route without a loader key and require the panel-routes census to redden naming the key.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC4

## Acceptance criteria

1. SC4: the surface renders the join object and nothing else; a mutant that renders a remedy reddens.
2. SC4: the route table, loader map, fixture route count and copy record move together; a mutant that adds the route without a loader reddens naming the key.

## Verify

```bash
node --test scripts/panel-routes.test.mjs scripts/after-render-fixture.test.mjs scripts/panel-copy.test.mjs && npx prettier --check apps/angular-ai-devtools/src/app/panel-outlet.ts apps/angular-ai-devtools/src/app/panel-outlet.spec.ts
```

## Log

- Contract amended before this task ran, at the orchestrator's hand: the copy records that carry the surface and its
  spec (`research/raw/m048-surface-copy.json`) and the counts the panel-copy suite pins
  (`research/raw/m061-surface.json`) are now declared, because the first dispatch measured that writing the surface
  without them reddens two suites the contract does not own.
- Landed paths: the pane and its spec, the route entry, the loader key and the sample fact, plus the records the surface is measured in.
- `panel-outlet.ts` renders one `label: value-the-answer-carries` line per field, one line per absence, no line for a `null`, and the empty path as `""` so a componentless route does not lose it. The remedy mutant reddens on the sentence scan, naming the sentence.
- The route table, the loader map, `m061-surface.json`'s surface row and its counts (32/32/41/204), and the spec's `excluded` row moved in one commit. The loader mutant reddens as `every app.routes.ts surface must have a panel-demo LOADERS key; missing: outlet`.
- The surface row went into `m061-surface.json`, not a new `m048` row: `m048` deliberately carries no sentence-less surface and its own pins redden if one is added — its mechanism for later surfaces is `LATER_COPY_RECORDS`. Only the spec's `excluded` row belongs in `m048`, and that is what was added.
- Line pins were paid for rather than re-cited: the route entry sits in the uncited 16-80 region and the demo's `fields` note was folded, so all 310 citations into the two files hold except four pre-existing stale ones in `m047-surface.json`, proven pre-existing at HEAD.
- `scripts/panel-bundle-budget.test.mjs` is red because the built bundle predates the new pane; the project verify rebuilds first, which is where that pin resolves.
- The gate record needed `SUITE_DIFF_REASONS` rows for this milestone's suites to derive at all; they were added, and the two remaining reds are the armed re-capture the re-derivation task owns.
- The app suites (`app.spec.ts`, the picker, the demo) run only through `nx run ...:test`; they were edited by pattern and held by `tsc -p tsconfig.check.json` plus the held-out corpus, which compiles the real route table and answers through four routes.
