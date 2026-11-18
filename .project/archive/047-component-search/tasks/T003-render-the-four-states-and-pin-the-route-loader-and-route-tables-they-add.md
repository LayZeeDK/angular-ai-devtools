---
id: T003
title: Render the four states and pin the route, loader and route tables they add
wave: 3
status: done
deps: [T002]
agent: build_T003
base: 1cee63a30822ed58d02e8d823ddc165bbcfdc79d
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-components.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Render the four states and pin the route, loader and route tables they add

## Context

T002 produces the join. This task renders it: a panel surface at route `components` that lists the
recorded names, filters them by the typed text, states an empty page as an empty list, and states
`cannot-tell` with its reason when the source could not be read. Adding a route stales every suite
that enumerates the route table, so they are declared here rather than discovered at the gate.

## Approach

Add `apps/angular-ai-devtools/src/app/panel-components.ts` rendering the four states from the join,
a `components` route in `app.routes.ts`, and a `components` key in `panel-demo.ts` `LOADERS`. Update
`app.spec.ts`, `page-picker.component.spec.ts`, `panel-demo.spec.ts` and
`scripts/panel-routes.test.mjs` for the added route, and prove the route-map assertion reddens when
the loader key is removed.

## Intent coverage

- SC1
- SC2

## Interface contract

`componentSearch(record, query)` receives `{ components, source }` and returns
`{ state, rows, matched, reason }`. `state` is one of `listed`, `empty`, `cannot-tell`; `rows` is an
array of `{ name, instanceCount }`; `matched` is the number of rows after filtering; `reason` is
present only when `state` is `cannot-tell`, and is one of a closed set. No other file implements this
function, and no caller reads the DOM to build the list.

## Files

- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
- scripts/gate-integrity.test.mjs
- tests/held-out/fixture-explainers-unchanged.test.mjs
  - apps/angular-ai-devtools/src/app/panel-components.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-routes.test.mjs

## Acceptance criteria

1. The `components` route renders all four states, and every suite that enumerates the route table names the new route.
2. Removing the `components` loader key reddens `scripts/panel-routes.test.mjs` naming the missing surface.
3. The surface adds no DOM to an inspected page and writes only sentences the record supports.

## Verify

```bash
node --test scripts/panel-routes.test.mjs && npm run check && npx prettier --check apps/angular-ai-devtools/src/app/panel-components.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-routes.test.mjs
```

## Log

- pending.
- 2026-11-17 — `apps/angular-ai-devtools/src/app/panel-components.ts` lands as the display half of the T002 join: `componentsPanel(answer)` reads `state`, `rows` (each row's `name` and `instanceCount`), `matched`, `reason` and the typed text in `query`, and renders one flat `lines` list in the shape every panel surface answers. It filters nothing and implements no `componentSearch`: the join stays the one implementation, and the pane reads no element and names no `document`. Its own sentences are enumerated once in `PANE_SENTENCES` (four state sentences, five absences about its own input), so a new sentence is an edit to the registry rather than wording that slips past a matcher, and the state lookup is an own-property one so `constructor` renders as `state: constructor` and nothing else.
- 2026-11-17 — the four states and the four sentences that keep them apart: `listed` (no typed text; one `component:` line per row the record carries, then `instances: <n>` or the pane's `no-instance-count` sentence, then `rows:` and `matched:`), `filtered` (the join's `listed` answer beside non-empty text: same rows, `matched:` states how many survived, and text that matched nothing renders `matched: 0` with no `component:` line), `empty` (the record's own statement that the page rendered no components: its own state word, its own sentence and `rows: 0`, with no `reason:` line and no `matched:` line), and `cannot-tell` (the join's `reason` echoed verbatim from its closed set, with no row count and no cause, element, remedy or rule identity — the pane has no field for the four). A stated count of `0` is never rendered for a row the record states none for: that row renders `no-instance-count`.
- 2026-11-17 — wiring: the `components` route is appended last in `app.routes.ts` through the one shared `loadPanelDemo`, with `data: { surface: 'components' }`; `components` is added to the `LOADERS` map in `panel-demo.ts` (`() => import('./panel-components') as never`); and `FACTS['components']` is the join's own answer for a record of three named components (`app-counter` with 2, `app` with `null`, `router-outlet` with 1) beside the text `app`, which keeps two of the three — `state: 'listed'`, `rows` the two kept, `matched: 2`, `query: 'app'`. The two names are the ones T001 measured (`sources[per-check-host-tag]` yields `app-counter`, `sources[per-check-class-name]` yields `app`); the counts are fixture data, as T002's `notPinned` says, and the `null` row gives the pane a stated absence to render beside a stated count.
- 2026-11-17 — route-table suites updated, each extended rather than weakened: `app.spec.ts` (ordered path list gains `components` after `console-read`, plus its own lazy-component / route-data / own-name block); `page-picker.component.spec.ts` (lazy list and whole-table list gain `components`, count 26 -> 27); `chat-entry.component.spec.ts` (full path list, lazy list and the per-surface demo loop gain `components`); `panel-demo.spec.ts` (whole-table pin gains `components`, count 26 -> 27); `scripts/panel-routes.test.mjs` (E1 surface list gains `components`, E2 export map gains `components: ['panel-components', 'componentsPanel']`, E3's direct-call guard gains `componentsPanel(`, and new mutants delete the route entry and drop the LOADERS key).
- 2026-11-17 — `scripts/gate-integrity.test.mjs` updated where it pins the table indirectly: its `SUITE_DIFF_REASONS` rows for the five suites above now record the M047 `components` addition beside the M045/M046 sentences, appended rather than rewritten. `scripts/gate-integrity-default-tasks.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` were read and left unchanged: neither enumerates the route table, the loaders or the surfaces — the first measures the fix-record stage's default task directory on fixture trees, the second reaches four explainer routes by path and never lists the table.
- 2026-11-17 — the proof that matters, run on the real tree. Green first: `node --test scripts/panel-routes.test.mjs` -> `tests 4`, `pass 4`, `fail 0`. Then the `components` key was removed from `LOADERS` in `panel-demo.ts` and the same command printed `tests 4`, `pass 3`, `fail 1`, with `AssertionError [ERR_ASSERTION]: every app.routes.ts surface must have a panel-demo LOADERS key; missing: components` and `actual: [ 'components' ]` / `expected: []` from `assertAllSurfacesHaveLoaders` at `scripts/panel-routes.test.mjs:486`. The key was restored byte for byte (`fc /b` -> "no differences encountered") and the command printed `tests 4`, `pass 4`, `fail 0` again.
- 2026-11-17 — the panel-side proof: `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` gained one test that evaluates the shipped `extension/component-search.js` with `new Function`, checks `FACTS['components']` equals `componentSearch(record, 'app')` plus `query: 'app'` field for field, and then drives the pane over all four states: `listed` with `matched: 3` and a `router-outlet` row, `filtered` with `matched: 2` / `instances: 2` / `no-instance-count` and the dropped row absent, `filtered` to nothing with `matched: 0` and no invented name, a query for `root` keeping nothing (no `app-root` is completed from framework knowledge), `empty` with `rows: 0` and no reason line, and `cannot-tell` with `reason: enumerate-without-getter` and no row count — beside the same empty list stated as empty, so E4's pair cannot collapse. Every reason of the join's closed set is echoed verbatim, an invented cause answers `unreadable-source` and the invented word is printed nowhere, and the pane's own state word outside its table renders alone.
- 2026-11-17 — sibling suites read and re-run, all unchanged and green: `scripts/component-search.test.mjs` -> `tests 16`, `pass 16`, `fail 0` (its route-table pin reads `/\bcomponents:/g` in `app.routes.ts`, which the new route does not add — the route says `path: 'components'` and `surface: 'components'`, not a `components:` key); `tests/held-out/fixture-explainers-unchanged.test.mjs` -> `tests 10`, `pass 10`, `fail 0`; `scripts/gate-integrity-default-tasks.test.mjs` -> `tests 9`, `pass 9`, `fail 0`.
- 2026-11-17 — commands and their output at this head: the task's Verify line run whole -> `node --test scripts/panel-routes.test.mjs` `tests 4 / pass 4 / fail 0`, then `npm run check` ending `gate-integrity: fix-record clean - examined 13 claim(s) in 4 task log(s) of .project/tasks (logs of M047)` and `All matched files use Prettier code style!`, then `npx prettier --check` over the seven files -> `All matched files use Prettier code style!`; `npm run test:app` -> `Test Files 31 passed (31)`, `Tests 350 passed (350)`, with `panel-demo.spec.ts (14 tests)` green.
- 2026-11-17 — not established, stated rather than glossed. `scripts/gate-integrity.test.mjs` is red at this head before and after this task: `tests 40`, `pass 31`, `fail 9`, every failure the same derivation refusal `scripts/component-search.test.mjs differs from d94502d1 and no reason was read for it` — T002's new suite, whose reason row and whose re-captured `research/raw/m044-gate-shapes.json` are outside this task's files, so the recording cannot be brought current here; the baseline run taken before any edit of this task shows the identical 31/9. No running page was read for this task: the surface is proven over the answers the shipped join gives for records assembled from the names T001 measured, and no browser, build or page was used.
- Landed paths: `apps/angular-ai-devtools/src/app/panel-components.ts`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/app.routes.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/gate-integrity.test.mjs` — each is read from this tree, ready.
- 2026-11-17 — `scripts/gate-integrity-default-tasks.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` are unchanged by this task; both are in the declared file list only as the suites that were read for a route-table enumeration, and neither carries one.
