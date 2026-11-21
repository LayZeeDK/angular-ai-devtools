---
id: T003
title: Render the answer and pin the route tables
wave: 3
status: pending
deps: [T001, T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-tutor-routing.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - scripts/component-search.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/copy-check.test.mjs
  - extension/copy-digest.json
  - extension/panel/index.html
  - research/raw/m058-surface.json
  - research/raw/m048-surface-copy.json
  - .commandcode/skills/prove-overlay-observer-purity/check.mjs
---

# T003 — Render the answer and pin the route tables

## Goal

The join answers and refuses what it cannot read; the surface renders its answer and nothing else,
and every suite that enumerates a route table owns the change before it is asked rather than after
a landing refuses (PLAN D3, the omission that cost five earlier milestones a gate cycle each). The
panel is the only surface and nothing is asked of the inspected page (SC6, N7).

## Context

The display half follows `apps/angular-ai-devtools/src/app/panel-tutor-signals.ts`, one milestone
earlier: a module handed the shipped join's answer that renders its fields under their own labels
and restates none of the join's rules as a computation. The route file's pin closure reaches the
four app specs, `scripts/component-search.test.mjs` and
`tests/held-out/fixture-explainers-unchanged.test.mjs` (which pin the file as a literal), the two
gate suites those name, and — per the standing decision — `scripts/after-render-fixture.test.mjs`,
whose pin reads the counter fixture's own table at `spikes/ng222-app/src/app/app.routes.ts` and so
cannot move when a panel surface is registered: declared, not edited. The route count the table
grows to is pinned by `app.spec.ts`'s ordered path list and by the two specs that state
`expect(appRoutes).toHaveLength(36)`.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-tutor-routing.ts`: handed the join's answer, it renders
`answered` naming the terminal event's class and the navigation `id` that event carries, then the
route node by the entry's own `path` and the `component`, `redirectTo`, `canActivate` or
`loadChildren` that entry states, each claim beside the event (class and `id`) and the config entry
(`path`) it rests on (SC1). `cannot-tell` renders the last event class the stream recorded for that
`id` and nothing else — no destination, no route node, no cause (SC2). `no-guard-verdict` and
`no-redirect-decision` render as two distinct states, each in its own sentence, side by side where
both hold, never folded into one blank answer, with `shouldActivate` never rendered as any guard's
verdict and a config entry's `redirectTo` never rendered as the redirect that decided the
navigation (SC3, E5). No field is composed that the answer does not carry: an unconfigured segment
prints as unconfigured beside the paths compared, a `redirectTo` prints as a configuration fact,
and a state word the pane was not written for renders as the bare word it was given. The pane's own
sentences are enumerated once in a `PANE_SENTENCES` registry, so a new sentence is a deliberate edit
rather than a wording that slips past a matcher.

Add the `tutor-routing` key to `LOADERS` and a `FACTS` sample in
`apps/angular-ai-devtools/src/app/panel-demo.ts`, and the `tutor-routing` name to the
`PANEL_SURFACES` list in `apps/angular-ai-devtools/src/app/app.routes.ts`. The fact is the shipped
join's own answer over `research/raw/m041-navigation.json`'s redirect frame beside
`research/raw/m030-router-config.json`'s `config` — the two records T001 pins and T002's join reads
— derived node-side, so both absences render on the demo question and the walkthrough's step 2 is
walkable without a page. It is a different answer over those records than the `navigation` and
`router` panes render, so the three panes stay three answers over their own records.

The entry costs one line, and the list has no blank line to pay with: the entry is paid for by
folding a comment line no `research/raw` record cites into the list's paragraph and deleting that
line, so every cited line keeps its number. The mechanism is measured, not assumed: sweep every
`research/raw/m0*.json` citation into `app.routes.ts` before the edit and after it, and the
post-edit sweep must report zero unresolved citations (PLAN R1; M057's T004 repair is the
precedent). The count paragraph in `app.spec.ts`'s comment and the two `toHaveLength(36)` pins move
to the count the table grows to.

Update `app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and
`panel-demo.spec.ts` with the new surface — `panel-demo.spec.ts` also re-derives the sample fact
node-side with the shipped join and holds the fact to it field for field. Edit
`scripts/panel-routes.test.mjs` in exactly the places its own pins demand: the surface list gains
`tutor-routing` in table order (one more name, the `deepEqual` still pinning the whole order), the
surface-to-module map gains the row naming the module and the exported panel symbol, the
negative-call list gains the pane's symbol so the demo still calls no surface directly, and the
removed-surface and removed-loader mutants gain the surface so a dropped route reddens by name. No
assertion is loosened, no expected count is lowered, nothing is skipped.

Declare `scripts/after-render-fixture.test.mjs` and edit it not at all (PLAN D3): its route-count
pin is the counter fixture's own table read from `spikes/ng222-app/src/app/app.routes.ts`, so this
milestone's change cannot move what it asserts, and the declaration is the standing rule that every
suite enumerating a route table is declared by the task that touches one. Declare
`scripts/component-search.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs`,
which pin the route file as a literal, and the two gate suites the route file's pin closure
reaches, `scripts/gate-integrity.test.mjs` and `scripts/gate-integrity-default-tasks.test.mjs`,
editing neither (the M057 C4 class).

Record the surface's own record and re-measure the copy, because they are the deliverables that
state what this wave lands. `research/raw/m058-surface.json` states the route `tutor-routing`, its
`LOADERS` key, each state with the answer field it reads, the two absences with the sentences they
render in, and the join (`extension/tutor-routing.js`), the display module
(`apps/angular-ai-devtools/src/app/panel-tutor-routing.ts`) and the two records the answer is read
from (`research/raw/m041-navigation.json`, `research/raw/m030-router-config.json`) as its sources —
every citation a `path:line` carrying the cited line's own text, re-resolved by search at this head,
with no page read and no capture beyond what the record states (PLAN D5). Re-measure
`research/raw/m048-surface-copy.json` over every panel surface on disk, its counts recomputed by the
suite that measures them rather than typed; author the digest rows the new pane's sentences need in
`extension/copy-digest.json` — one row per distinct text, none duplicating a text another surface
declares — and move the copy-check fact in `apps/angular-ai-devtools/src/app/panel-demo.ts` with
the digest's count, held field-for-field by `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`.
`scripts/copy-check.test.mjs` runs green with no assertion loosened and no count lowered.

Run the app suite in this task's Verify, and leave the direct-suite leg — the two route-file suites
this task edits, the copy suite and the two literal pins — to T004, which depends on this task and
runs them over the head it leaves (the M057 C6 pattern): the build, the app suite, the formatting
check, the skill check and the typecheck already fill this task's Verify, and the route the wave
lands is proven green at the head the wave leaves rather than unrun. The pane changes no module
under `.commandcode/skills/prove-overlay-observer-purity/check.mjs`'s covered page-side files, and
the skill's check runs in the Verify to prove the surface adds no observer, no page-side DOM and no
new instrumentation (PLAN D6, SC6, N6, N7).

`extension/panel/index.html` is a build artifact: land a freshly built copy and never edit it by
hand.

## Interface contract

T001 publishes `research/raw/m058-record-shapes.json`: the field map whose terminal-class key sets,
config five fields, absence names `no-guard-verdict` and `no-redirect-decision`, attribution rule
(by `id` and `route.path`, never by position) and `reach.readFrom` are the only fields T002's join
may read, and whose `inventory.outsideTheMap` names exactly `research/raw/m058-surface.json` and
`research/raw/m058-verdict-claims.json`. T002 publishes `extension/tutor-routing.js`:
`tutorRouting(records)` on `globalThis.angularAiTutorRouting`, `records` = `{ navigation, config }`,
one object out — `{ state, question, terminal, route, absences, unconfigured, claims, detail }`,
every field present in every state, each `claims[]` entry carrying `artefactPath` — which T003's
pane renders and whose route, loader key and state fields T003's `research/raw/m058-surface.json`
states and T004's claims record re-derives against. T003 publishes the route `tutor-routing` in
`PANEL_SURFACES` through the shared `loadPanelDemo` closure, the `LOADERS` key `'tutor-routing'`,
the exported `tutorRoutingPanel`, the `PANE_SENTENCES` registry and the digest rows in
`extension/copy-digest.json`.

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; the project verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the
built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension
--skip-nx-cache`, never through an edit.

## Intent coverage

- SC1
- SC3
- SC6

## Files

- apps/angular-ai-devtools/src/app/panel-tutor-routing.ts
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/app.routes.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- scripts/panel-routes.test.mjs
- scripts/after-render-fixture.test.mjs
- scripts/component-search.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/copy-check.test.mjs
- extension/copy-digest.json
- extension/panel/index.html
- research/raw/m058-surface.json
- research/raw/m048-surface-copy.json

## Acceptance criteria

1. The route `tutor-routing`, its `LOADERS` key and its `FACTS` sample exist, the sample is the
   shipped join's own answer over the two records T001 pins held field-for-field by
   `panel-demo.spec.ts`, and the surface renders `answered` naming the terminal class and `id` and
   the route node by the entry's own `path` and stated fields, each claim beside the event and the
   config entry it rests on, with no field rendered that the answer does not carry (SC1).
2. `cannot-tell`, `no-guard-verdict` and `no-redirect-decision` render as distinct states, each in
   its own sentence — the two absences side by side where both hold and never folded, `shouldActivate`
   never rendered as a verdict, `redirectTo` never rendered as the decision, and the held navigation
   never rendered as landed (SC3, E5; SC2 through the same pane).
3. The entry is line-neutral — the post-edit sweep of every `research/raw` citation into
   `app.routes.ts` reports zero unresolved — the app suite is green at this head, and every suite
   that enumerates a route table is declared: `app.spec.ts` and `scripts/panel-routes.test.mjs`
   edited, `scripts/after-render-fixture.test.mjs` declared and not edited, the direct-suite leg
   left to T004 which depends on this task and runs it over the head this task leaves (SC6, N6, N7).
4. `research/raw/m058-surface.json` states the route, the loader key, each state with the answer
   field it reads and the two absences with their sentences, every citation re-resolved by search at
   this head; `research/raw/m048-surface-copy.json` is re-measured over every surface with its
   counts recomputed by the suite that measures them; `extension/copy-digest.json` carries the
   pane's sentence rows and the copy-check fact moves with the digest's count;
   `scripts/copy-check.test.mjs` is green with no assertion loosened and no count lowered.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npx nx run angular-ai-devtools:test --skip-nx-cache && node .commandcode/skills/prove-overlay-observer-purity/check.mjs && npx prettier --check apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/panel-tutor-routing.ts scripts/panel-routes.test.mjs research/raw/m058-surface.json research/raw/m048-surface-copy.json extension/copy-digest.json && npm run check && git checkout -- extension/panel/index.html
```

## Log

- pending.
