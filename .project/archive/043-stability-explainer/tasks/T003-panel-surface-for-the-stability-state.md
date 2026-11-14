---
id: T003
title: Panel surface for the stability state, the settle reading and the repeated work
wave: 3
deps:
  - T002
status: done
agent: build_T003
base: e4421832197e77e58c52746106db26ca3e999c74
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-stability.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-stability.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/panel-styles.test.mjs
  - scripts/panel-bundle-budget.test.mjs
  - scripts/image-budget.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T003 — Panel surface for the stability state, the settle reading and the repeated work

## Context

The join answers with three readings and the absences beside them: the state and the emission it was read from, the settle time or its named absence, and the repeated work the frame recorded. The panel's job is to render that answer and nothing beyond it, so a reader looking at a page that never settles cannot mistake silence for stability, a measured zero for a missing reading, or an absence for a count.

The surface follows the panel family: one exported function answering state, kind, message, lines, text, cells and blocks, no runtime imports, handed the join's answer and rendering only the fields the answer carried. It reads no record, joins nothing and reads no clock, it adds no DOM to any inspected page and no global CSS, and it uses the baseline stylesheet's hooks — the ones `apps/angular-ai-devtools/src/app/panel-error-boundary.ts` and its neighbours already emit — so the demo's own markup renders it unchanged.

The route is lazy for the same reason every route above it is: the panel's initial total is measured from the eager references in the built index, and it stands at 535.00 kB against the recorded 535.44 kB baseline, so 0.44 kB of headroom is all one entry has. The entry therefore references the shared `loadPanelDemo` loader that `apps/angular-ai-devtools/src/app/app.routes.ts` already defines once, and adds no second copy of the dynamic import. Registering it appends to a table several suites enumerate, so every one of those pins is part of this task rather than a later repair: the app suite's ordered path list, the chat-entry suite's two ordered lists, the picker's lazy list, the route-table suite's surfaces, export map and loader mutant, and the demo suite's loader key and sample fact. `scripts/panel-styles.test.mjs` enumerates no route, so it is declared as a guard that must be proven unmoved rather than claimed as a pin the registration cuts, and `tests/held-out/fixture-explainers-unchanged.test.mjs` pins the same table from outside the app and is declared with them. The fixture's own table stays byte-identical, the two budget suites are declared with the entry, and the after-render fixture guard is declared because the demo's markup is what it measures.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders its readings apart. Each of the three readings is its own block with its own lines: the state and the emission it was read from, the settle interval as its own number — a measured `0` printed as `0` — or the absence with no time and no duration beside it, and one line per repeated pass the answer carried. Every named absence renders in its own cell with its own name, and no cell renders an empty string, a zero outstanding count, a cause, an owner or a stack. A state word the pane was not written for renders as that word and nothing else, and a page the answer has no stability reading for renders `no-stability-observable` rather than an empty table or an em dash.

The demo loader gains its own key and its own sample fact, and the sample fact is the join's own answer for the recording rather than a value invented for the demo, so the demo suite can hold the fact to the recording it came from and hold the pane to the fact.

The pins are re-cut to the measured values with each failing assertion quoted in the log, and each guard is run to show it did not move — the stylesheet measurement, the fixture's byte-identical table, the held-out explainer suite and the two budgets. A mutant that renders a claim the answer did not carry — a settle time the answer named absent, a pass the frame did not record, a cause where the answer names `no-cause-reported` — reddens the pane's own pin and names the defect by string.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.
- Answer: `stability(frame)` answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `settle` is `{ state: "settled", at, sinceAttachMs }` or `{ state: "no-settle-observed" }`, each repeat is `{ pair, componentName, passes }` read from the frame's own `events`, and `absences` lists one named absence per unanswered question.
- Pane answer: `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }` where each cell holds the text of its own state or the empty string, `lines` carries one line per fact the answer carried, and `blocks` carries one block per reading — the state, the settle reading and the repeated work — each holding its own lines.

## Intent coverage

- SC5

## Edges

E9, held-out and in this task's own demo suite.

## Acceptance criteria

1. Held-out E9: the pane renders its three blocks and every named absence, and asked for a cause, an outstanding item, an owner or an order it renders that absence in its own sentence rather than an empty list or a dash.
2. Each state renders its own text and no other's, a state word the pane was not written for renders as that word and nothing else, and a page it has no stability answer for renders `no-stability-observable` rather than an empty table or an em dash.
3. A settle measured as `0` renders `0`, a settle the answer named absent renders that absence with no time and no duration, and the pane prints no interval the answer did not carry.
4. The repeated-work block prints one line per repeated pass the answer carried and nothing beside it — no per-view cycle count, no outstanding-work count and no pass the frame's events do not hold — and a frame with no repeated work prints the reading it has rather than a zero.
5. The route, the demo loader key and the sample fact are added, the sample fact being the join's own answer for the recording rather than a value invented for the demo, the route installs the shared `loadPanelDemo` loader with no second copy of the dynamic import, and the pane uses the baseline stylesheet's hooks only, adding no global CSS and no DOM to any inspected page.
6. Every pin the registration moves is re-cut with the failing assertion quoted — the app suite's ordered path list, the chat-entry suite's two ordered lists, the picker's lazy list, the route-table suite's surfaces, export map and loader mutant, and the demo suite's loader key and fact — while `scripts/panel-styles.test.mjs`, which enumerates no route, is proven unmoved by running it and is recorded as a guard rather than as a pin the registration cuts.
7. The fixture's own table stays byte-identical, the held-out explainer suite stays green, and the panel's measured initial total stays at or below the recorded 535.44 kB baseline, of which 0.44 kB remained before this entry.
8. A mutant that renders a claim the answer did not carry reddens the pane's pin and names the defect by string.

## Verify

```bash
node --check apps/angular-ai-devtools/src/app/panel-stability.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --check scripts/panel-stability.test.mjs && node --check scripts/panel-routes.test.mjs && node --experimental-strip-types --test "scripts/panel-stability.test.mjs" "scripts/panel-routes.test.mjs" "scripts/panel-styles.test.mjs" "scripts/panel-bundle-budget.test.mjs" "scripts/image-budget.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-stability.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-stability.test.mjs scripts/panel-routes.test.mjs && npm run check
```

## Held-out

E9 in `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, proven non-vacuously; E1 to E8 and E10 are T002's and the route registration must not redden them.

## Log

- pending
- 2026-11-09 — build — the pane is `stabilityPanel(answer) -> { state, kind, message, lines, text, cells, blocks }` in `apps/angular-ai-devtools/src/app/panel-stability.ts`, with no runtime imports, no clock, no subtraction and no DOM: it renders the answer's own three readings as three blocks in that order — `state: <word>` with the word's sentence and `emission: isStable <value> at <at> ms` where the answer carried one; the settle reading as `settle: settled at 1008 ms, 7 ms after attach` or `settle: no-settle-observed` with no time and no duration; and one `TemplateUpdate app-root: 2 passes` line per pass the answer carried, or `repeated work: the frame recorded no paired work` where the frame held none. Each of the answer's named absences renders in a block of its own and a sentence of its own, and a page the pane has no stability answer for renders `no-stability-observable` in one block — never an empty table, never an em dash.
- 2026-11-09 — build — the `/stability` route appends to `app.routes.ts` and installs the shared `loadPanelDemo` loader, so the demo module is still imported in exactly one place; `panel-demo.ts` gains its `stability` loader key and its sample fact, which is the join's own answer for `research/raw/m043-stability.json`'s `record.frame` beside the frame's own `events` list (two `TemplateUpdate` passes over `app-root`, two `ChangeDetection` passes over no component). Measured after the entry: initial total 535.067 kB (535,067 B over 9 eager files) against the recorded 535.44 kB baseline — 0.373 kB left, against 0.435 kB before it — and both budget suites pass unchanged.
- 2026-11-09 — build — every pin the registration moves was re-cut and proven by removing the `stability` entry and running it red, then green: `app.spec.ts` (`expected [ '', 'signal-provenance', …(21) ] to deeply equal [ …(22) ]`, `-   "stability",`), `chat-entry.component.spec.ts` (the same ordered path list and its lazy list), `page-picker.component.spec.ts` (`expected [ 'interop', 'chat', 'picker', …(15) ] to include 'stability'`), `panel-demo.spec.ts` (`the stability surface must exist and load lazily`) and `scripts/panel-routes.test.mjs` (`route stability must exist`, plus the loader mutant that stops biting without the route). `scripts/panel-styles.test.mjs` enumerates no route and stayed green with the route removed — a guard, not a pin the registration cuts — and so did `tests/held-out/fixture-explainers-unchanged.test.mjs`, whose own `di-doctor` mutant is the proof it bites; `scripts/after-render-fixture.test.mjs` measures the fixture's table and no byte of it moved.
- 2026-11-09 — build — `scripts/panel-stability.test.mjs` executes the pane under type stripping and feeds it the join's answers for the recording's own sections; its nine real mutants redden the pins by string: another state's text in a cell (`cells-own-text`), a cause named in prose (`absences-own-sentence`), an outstanding item listed with its owner (`absences-own-sentence`), the settle absence rendered as an empty field (`settle-absence`), the repeated-work block omitted (`three-blocks`), a wall clock read for the interval (`reads-no-derived-value`), an interval taken from the settle time itself (`settle-own-reading`), an empty pane for a page nobody read and stable claimed for one (`no-stability-observable`). Held-out E9 in `panel-demo.spec.ts` was proven non-vacuously too: a pane that answered `no-outstanding-inventory` with `the outstanding item is task 7, owned by AppComponent` reddened it as `expected 'state: stable\\nstable: the page’s isS…' not to match /\\btask\\s+\\d/i`.
- 2026-11-09 — build — landing verdict: the declared fourteen paths carry the work (two added, six edited, six run to prove they did not move, nose outside the declaration and none missing), the Log is append-only above this line, the Verify line passed verbatim at the recorded base e4421832 — `node --check` on the nine files, the seven suites at 75 tests all passing, `npx nx run angular-ai-devtools:test` at 347 passing, `npx prettier --check` on the nine, and `npm run check` end to end — and `gsd land-check` reports no blocker — ready
- 2026-11-09 — build — correction to the verdict above: read \`none outside the declaration\` where it reads \`nose outside the declaration\`; nothing else in the record changes, the declared fourteen paths are the two added and six edited files with the other six run to prove they did not move, and the verdict stands — ready
