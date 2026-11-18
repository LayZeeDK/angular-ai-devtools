---
id: T003
title: Render the finding states and pin the route and loader they add
wave: 3
status: done
deps: [T002]
agent: build_T003
base: 21e952511d8cb6ec9bcd9d0e161d06474e6ff422
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-dead-click.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the finding states and pin the route and loader they add

## Context

T002 produces the judgement. This task renders it: a surface at route `dead-click` that names each
event whose consequent never arrived, with the window it was judged over, states `clean` with the
counts compared, and reports `cannot-tell` when the window cannot be bounded.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-dead-click.ts` rendering `findings`, `clean` and
`cannot-tell`, its route, its `dead-click` key in `panel-demo.ts` `LOADERS`, and update every suite
that enumerates the route table. Prove the loader-key mutant reddens naming the surface, then restore
it.

## Intent coverage

- SC1
- SC2

## Interface contract

`deadClick(record)` receives the page record and returns `{ state, findings, considered, reason }`.
`state` is one of `findings`, `clean`, `cannot-tell`; `findings` is an array of
`{ chain, event, window }` where `event` carries the record's own fields for the dangling start and
`window` names the bounds the judgement used; `considered` is the number of events that belong to a
measured chain; `reason` is present only when `state` is `cannot-tell` and is a member of a closed set
exported by the module. No other file implements this function, and no caller reads the page or a
clock.

## Files

  - apps/angular-ai-devtools/src/app/panel-dead-click.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - scripts/component-search.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs

## Acceptance criteria

1. The route renders findings, clean and cannot-tell, and every suite that enumerates the route table names it.
2. Removing the loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and names no cause the finding does not state.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-dead-click.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs scripts/component-search.test.mjs scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs tests/held-out/fixture-explainers-unchanged.test.mjs
```

## Log

- pending.

- **Built the surface, its route, its loader key and the demo fact the suite rebuilds.**
  `apps/angular-ai-devtools/src/app/panel-dead-click.ts` is a line renderer in the shape
  `panel-copy-check.ts` and `panel-interaction-story.ts` established: one `PANE_SENTENCES`
  registry holding the three state sentences and fifteen absence sentences, a state table read off
  that registry, and `deadClickPanel(answer)` answering `{ state, kind, message, lines, text }`. It
  pairs nothing and counts nothing. `findings` prints, per finding, the chain, every field the
  start recorded under `field <name>:`, then the window under `window:` / `window chain:` /
  `window kind:` / `window length:` / `window final:` — the `final: false` read off the answer, so
  no finding reads as settled — plus the pane's own `not-final` sentence saying a later record may
  carry the terminal. `clean` prints the state, its sentence naming the `routerEvents` window the
  judgement read, the same `not-final` sentence, and `considered: N`. `cannot-tell` prints the
  reason word verbatim and, where the answer's own refusals state that reason, the chain it
  concerns. The two chains the judgement refuses are rendered in every state from the answer's own
  `refusals`, which `panel-demo.ts` hands beside the four contract fields exactly as
  `interaction-story` is handed the join's `BOUNDED_STATEMENT`: a panel surface has no runtime
  imports, and a reader who does not see work and boundary named would read their silence as clean.
  The route `dead-click` installs the shared `loadPanelDemo` with its own surface name, and the
  `dead-click` key is the quoted LOADERS key whose import is the only reference to the module. The
  demo fact is `extension/dead-click.js`'s own answer — one finding (a start with id 2 and no
  terminal in the window), `considered: 5`, window length 3, `final: false` — beside the join's
  own `REFUSALS`, for a record `panel-demo.spec.ts` rebuilds from the field lists
  `research/raw/m050-chains.json` measured for each entry builder and then runs the shipped join
  over.
- **The loader-key mutant reddens and was restored byte for byte.** With
  `'dead-click': () => import('./panel-dead-click') as never,` removed from `panel-demo.ts`,
  `node --test scripts/panel-routes.test.mjs` failed as `E4: every declared route surface has a
  panel-demo LOADERS key` with `AssertionError [ERR_ASSERTION]: every app.routes.ts surface must
  have a panel-demo LOADERS key; missing: dead-click` and `actual: [ 'dead-click' ]`. The line was
  put back: the file's sha256 is `485401f64ed6771d6d57aa5ca4fa084bf3263b97fbf144350b14bd4e984dbcdc`
  before the mutation and after the restore, and the same command then passed four of four.
- **Suites updated, and the two declared suites that needed no edit.** `scripts/panel-routes.test.mjs`
  gained `dead-click` in the surface list, in the E2 export map (`panel-dead-click` /
  `deadClickPanel`), in the E3 direct-call guard, and one removed-route mutant in E1 plus one
  dropped-loader mutant in E4. `app.spec.ts` gained the ordered path entry and the
  lazy-component / route-data / own-name block. `chat-entry.component.spec.ts` gained the surface in
  both ordered lists and in the per-surface loop. `page-picker.component.spec.ts` gained it in the
  lazy list, the whole table and the pinned count, twenty-nine to thirty.
  `panel-demo.spec.ts` moved the same table pin to thirty and gained the M050 pin. Two declared
  suites were read and left alone, and run to prove it: `scripts/component-search.test.mjs` passes
  sixteen of sixteen — its route-table reading is the children/components key counts, both still
  zero, and `research/raw/m047-names-and-absences.json` states that the totals must not be
  re-pinned because a sibling task adds a route on purpose — and
  `scripts/gate-integrity-default-tasks.test.mjs` passes nine of nine, because it measures the
  fix-record stage's default task directory and never reads the route table.
- **The pane's sentences: new copy, with the gap recorded rather than the digest widened.** One
  sentence is reused byte for byte — `no-reason`, which `panel-components.ts`, `panel-copy-check.ts`
  and `panel-interaction-story.ts` already declare and the shipped copy digest already explains.
  The other seventeen are new copy. `extension/copy-digest.json` is not a file this task owns, and
  a row written into it from here would be prose about a surface rather than a reading of the copy
  record, so no row was added or widened: the gap is stated in `panel-dead-click.ts`'s header and
  in this entry, and the milestone's fourth task re-measures the copy record over every surface on
  disk and authors those rows from the source.
- **What I could not establish.** `scripts/gate-integrity.test.mjs` is red at this base, and was
  red before any edit of mine: nine of its forty tests fail, every one of them with `Error:
  scripts/dead-click.test.mjs differs from d94502d1 and no reason was read for it, so recording it
  would be a guess rather than a reading of the diff` — T002 added that suite and no entry for it in
  `SUITE_DIFF_REASONS`. I did not edit that file: its `.project` reference rows and its suite-diff
  counts are pinned by line and count in `research/raw/m044-gate-shapes.json`, its reason map sits
  above references the record pins by line, and the armed re-capture that repairs a recording is the
  fourth task's, not this one's. Every suite this task touched already has an entry in that map, so
  a re-capture has a read reason for each. Everything else was measured: no page was read, so the
  pane names no cause and no element by construction rather than by measurement, which is what N1
  asks of a display half.

- **Correction to the first entry above, appended rather than rewritten.** That entry says the
  registry holds three state sentences and fifteen absence sentences, and that seventeen sentences
  are new copy. The count is nineteen: three state sentences and sixteen absences, of which
  eighteen are new copy and one — `no-reason` — is byte-for-byte a row `extension/copy-digest.json`
  already carries. Measured by reading the module's own `id:` and `text:` fields and comparing the
  texts with the digest's: `entries 19`, `state 3`, `absence 16`, `shared 1`. `panel-dead-click.ts`'s
  header was reworded to the same three numbers; the numbers in that Log entry are left as written
  because an existing line is never rewritten.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-dead-click.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs` — each is read from this tree, ready.
