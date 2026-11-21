---
id: T004
title: Render the answer and land the route
wave: 4
status: pending
deps: [T002, T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-tutor-signals.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/component-search.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - extension/panel/index.html
---

# T004 — Render the answer and land the route

## Context

The join answers and refuses what it cannot read; the surface renders its answer and nothing else.
The display half follows `apps/angular-ai-devtools/src/app/panel-tutor-foundations.ts`, one milestone
earlier: a module handed the shipped join's answer that renders its fields under their own labels and
restates none of the join's rules as a computation. The route file's pin closure is four suites wide
(PLAN C4): the four app specs and `scripts/component-search.test.mjs` name the route file, the four
specs and that suite name `scripts/gate-integrity.test.mjs`, and that suite names its default-tasks
sibling — so all four are declared here before the first edit rather than discovered by a landing
refusal, which is what cost five earlier milestones a cycle each. The Verify carries the build, the
app suite, the formatting check and the artifact restore — three heavy steps — and leaves the two
route-file suites to T005, which depends on this task and runs them over the head it leaves (PLAN
C6).

## Approach

Add `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`: handed the join's answer, it renders
`answered` naming the effect node by the label the graph gives it and by its own `index`, then each
upstream node the graph's edges state for it by index and label, then the sentence that states the
ordering as the named absence `no-write-record-no-order` — and it names no write, no owner and no
cause anywhere (SC1, SC2). `graph-unreadable`, `no-render-entry` and `no-effect-node` render as three
distinct states, each in its own sentence, never folded into one blank answer (SC3). Nothing is
composed that the answer does not carry: an empty label prints as empty beside the index, an
`unplaced` end prints as unplaced rather than as a number, and a state word the pane was not written
for renders as the bare word it was given. The pane's own sentences are enumerated once in a
registry, so a new sentence is a deliberate edit rather than a wording that slips past a matcher.

Add the `tutor-signals` key to `LOADERS` and a `FACTS` sample in
`apps/angular-ai-devtools/src/app/panel-demo.ts`, and the `tutor-signals` name to the
`PANEL_SURFACES` list in `apps/angular-ai-devtools/src/app/app.routes.ts`. The fact is the shipped
join's own answer over the captured graph record, entered after the component rather than inside the
`FACTS` literal. The entry costs one line, and the list has no blank line to pay with: the M028
entry's own comment is folded into the list's paragraph and deleted, so `appRoutes` stays the cited
line and the mapped literal's `loadComponent` and `data: { surface }` lines stay where the M047 to
M055 surface records say they are (PLAN C3). That is a constraint, not a style choice: the copy suite
re-reads three of those records on every run, and a moved line reddens it against a record nothing
would have re-cited. No sentence is lost with the comment — it is appended to the paragraph, which
carries the list's own note.

Update `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and
`panel-demo.spec.ts` with the new surface — `panel-demo.spec.ts` also re-derives the sample fact
node-side over the record with the shipped join and holds the fact to it field for field — and
declare `scripts/component-search.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs`, which pin the route file as a literal and
must move with it. Both are declared here because this task's route change moves what they assert,
and both are run by T005, which depends on this task: the build, the app suite, the formatting check
and the artifact restore already fill this task's three heavy verify steps, and the ceiling is three
(PLAN C6). A suite that reads the same route table therefore reads it one task later, at the head
this task leaves, rather than unrun. Declare `scripts/gate-integrity.test.mjs` and
`scripts/gate-integrity-default-tasks.test.mjs` and edit neither: they are the oracle and its
default-tasks sibling, and the suite-diff table the gate carries gains no row here because this task
adds no suite.

`extension/panel/index.html` is a build artifact: land a freshly built copy and never edit it by
hand.

## Intent coverage

- SC1
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- apps/angular-ai-devtools/src/app/panel-tutor-signals.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/component-search.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- extension/panel/index.html

## Acceptance criteria

1. The surface renders `answered` naming the effect node by the label the graph gives it and by its
   own `index`, each upstream node the graph's edges state for it by index and label, and each claim
   with the artefact path the answer carries; the empty label prints as empty beside the index and no
   identity is minted from a position; no field is rendered that the answer does not carry (SC1).
2. `graph-unreadable`, `no-render-entry` and `no-effect-node` render as three distinct states, each in
   its own sentence, and none of them renders as a page with no effects or as one blank answer (SC3).
3. The route `tutor-signals`, its `LOADERS` key and its `FACTS` sample exist, the sample is the shipped
   join's own answer over the captured graph record held field-for-field by `panel-demo.spec.ts`, the
   four app specs are green at this head through the project's unit-test target, and the two route-file
   suites that pin the route table are green at the head this task leaves — they are declared here and
   run by T005, which depends on this task (PLAN C6).
4. The entry is line-neutral: `appRoutes`, `loadComponent: loadPanelDemo,` and `data: { surface },`
   are the lines the earlier surface records cite, and the declaration line
   `scripts/component-search.test.mjs` pins is the one this entry leaves — green in T005, which runs
   that suite at this head (PLAN C6).

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npx nx run angular-ai-devtools:test --skip-nx-cache && npx prettier --check apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/panel-tutor-signals.ts && git checkout -- extension/panel/index.html
```

## Log

- pending.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/component-search.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
