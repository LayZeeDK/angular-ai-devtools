---
id: T004
title: Panel surface for the frame's ordered work and its cost
wave: 4
status: done
deps:
  - T003
agent: commandcode-coder
base: 357507abff6555cb2f290632c7ccd2a28ebdb31a
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-performance.ts
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/page-picker.component.spec.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - scripts/panel-performance.test.mjs
  - scripts/panel-routes.test.mjs
  - scripts/after-render-fixture.test.mjs
  - tests/held-out/fixture-explainers-unchanged.test.mjs
---

# T004 — Panel surface for the frame's ordered work and its cost

## Context

The narrator answers with ordered intervals, each measured with the identity its own
two events carried and the duration the page measured between them — or with the named
absence that stands where the profiler named nobody, or the unmeasured state where a
start never found its end. The panel's job is to render that answer and nothing beyond
it, in the one shape SC5 requires: the component identity and the cost in separate
columns, so a reader cannot mistake a name for a number or read a duration that was
never measured.

The surface follows `panel-render-phase.ts` and `panel-linked-state.ts`: one exported
panel function answering `{ state, message, lines, text, columns }`, no runtime imports,
handed the narrator's answer and rendering only fields the answer carried. It reads no
clock, joins nothing and never names a component the answer did not name (N5) — an
interval the answer calls cannot-tell renders its absence in the identity cell, and an
unmeasured interval renders no number at all.

The route is lazy for the same reason the fourteen above it are: the panel's initial
bundle is measured, and a route that imports its surface eagerly moves a budget a
surface has no business moving. Registering it appends one entry to the table that five
suites enumerate and one loader key to the demo, so every one of those pins is part of
this task rather than a later repair: the app suite's ordered path list, the chat-entry
suite's two ordered lists and its lazy-path list, the picker's lazy list, the route-table
suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo
spec's loader key and sample fact. The fixture's own route table is not this table and
must not move; the held-out explainer suite compiles the panel's whole route graph, so it
is the regression proof that a new lazy route changes nothing an explainer answers.

## Approach

One pure surface function plus the registration, then every pin the registration moves.

The pane renders one row per interval the answer carried, in the answer's order and no
other, with exactly two named columns:

- the identity column holds the component name the answer carried, or the absence word
  the answer named for an unnamed interval. It never holds a cost and never invents a
  name, a node index or a position.
- the cost column holds the duration the answer measured, including a measured `0`, or
  the unmeasured word the answer carried for an interval with no matching end. It never
  holds a name and never a number the answer did not carry.
- a row's two cells never repeat one another's text; the state words the answer uses are
  copied, never compared, so a state the pane was not written for still renders as the
  state it was given.
- the pane's own text is assembled from the same values in the same order every time, so
  the same answer rendered twice is byte-identical.

The demo loader gains its own key and its own sample fact, and the sample fact is the
narrator's own answer for the frame the measurement recorded — the demo never invents a
value the recording does not carry, and the demo spec holds the fact to the recording.

The pins are re-cut to the measured values, with the failing assertion quoted in the Log
for each, and the fixture's own route table is checked to be untouched. A mutant that
renders a claim the answer did not carry — a component the answer never named, a
duration it never measured — reddens the pane's own pin and names the defect by string.

## Interface contract

- Frame record: the page agent publishes `events` on the change-detection record, one entry per recorded profiler event in emission order, each `{ type: number, pair: string, end: boolean, at: number, componentName: string | null }`; `at` is the page's own `performance.now()` reading at receipt, and `componentName` is the name the profiler's instance yielded or `null`.
- Narrator answer: `narrate(frame)` answers `{ state, intervals, unresolved }` where each interval is `{ state: 'measured', pair, componentName, startedAt, endedAt, durationMs }`, `{ state: 'cannot-tell', pair, absence: 'no-component-identity', startedAt }` or `{ state: 'unmeasured', pair, startedAt }`, in the order the start events were recorded; `unresolved` lists an end event with no open start by kind, and nothing else.
- Pane answer: `performancePanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per interval with the identity cell and the cost cell apart, and a cell holds the text of its own state or the empty string.

## Files

- `apps/angular-ai-devtools/src/app/panel-performance.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.ts`
- `apps/angular-ai-devtools/src/app/app.routes.ts`
- `apps/angular-ai-devtools/src/app/app.spec.ts`
- `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`
- `apps/angular-ai-devtools/src/app/page-picker.component.spec.ts`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `scripts/panel-performance.test.mjs`
- `scripts/panel-routes.test.mjs`
- `scripts/after-render-fixture.test.mjs`
- `tests/held-out/fixture-explainers-unchanged.test.mjs`

## Intent coverage

- SC2
- SC3
- SC5

## Acceptance criteria

1. The pane renders one row per interval the answer carried, in the answer's order, with the component identity in one column and the measured cost in another, each column rendering only its own state and neither repeating the other's text — held-out E7.
2. An unnamed interval renders the absence the answer named in its identity cell and an empty cost cell; an unmeasured interval renders its unmeasured word and no number; a measured zero renders `0`, never a blank — held-out E7.
3. The pane prints no component the answer did not carry and no duration the answer did not carry: it derives nothing, joins nothing and reads no clock.
4. The same answer rendered twice is byte-identical — held-out E8.
5. The route, the demo loader key and the sample fact are added, and the sample fact is the narrator's own answer for the recorded frame rather than a value invented for the demo.
6. Every route-table pin is re-cut with the failing assertion quoted: the app suite's ordered path list, the chat-entry suite's ordered lists, the picker's lazy list, the route-table suite's surfaces, export map, direct-call list and loader-removal mutant, and the demo spec's loader key; the fixture's own route table is unchanged and the held-out explainer suite stays green.
7. A mutant that renders a claim the answer did not carry reddens the pane's pin, naming the defect by string.

## Verify

```bash
node --check scripts/panel-performance.test.mjs && node --check scripts/panel-routes.test.mjs && node --check apps/angular-ai-devtools/src/app/panel-performance.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.ts && node --check apps/angular-ai-devtools/src/app/app.routes.ts && node --check apps/angular-ai-devtools/src/app/app.spec.ts && node --check apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts && node --check apps/angular-ai-devtools/src/app/page-picker.component.spec.ts && node --check apps/angular-ai-devtools/src/app/panel-demo.spec.ts && node --experimental-strip-types --test "scripts/panel-performance.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check apps/angular-ai-devtools/src/app/panel-performance.ts apps/angular-ai-devtools/src/app/panel-demo.ts apps/angular-ai-devtools/src/app/app.routes.ts apps/angular-ai-devtools/src/app/app.spec.ts apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts apps/angular-ai-devtools/src/app/page-picker.component.spec.ts apps/angular-ai-devtools/src/app/panel-demo.spec.ts scripts/panel-performance.test.mjs scripts/panel-routes.test.mjs && npm run check
```

## Log

- pending
- 2026-11-08 — built `apps/angular-ai-devtools/src/app/panel-performance.ts` as the display half of the milestone's join and nothing else: `performancePanel(answer) -> { state, message, lines, text, columns }`, no runtime imports, no state between calls. It is handed `extension/performance-narrator.js`'s own answer (`narrate(frame) -> { state, intervals, unresolved }`, T003) and reads only `state`, `absence`, `intervals[].state`, `intervals[].componentName`, `intervals[].absence`, `intervals[].durationMs` and `intervals[].pair` — never `startedAt`, `endedAt`, `unresolved` or the frame's `events`, so it joins nothing, matches nothing and reads no clock (N1). One row per interval in the answer's order, with exactly two cells: the **identity** cell holds the component name the interval's own two events carried, or the absence word the answer named, or nothing at all — no node index, no list position, no neighbour's name, no fallback word (N5); the **cost** cell holds the duration the page measured as its own number (a measured `0` is `0`), or the unmeasured word the answer carries for a start no end closed, or nothing — and nothing at all where the interval already named an absence in the identity cell. A cell holding nothing prints nothing, which is SC5's "render nothing it was not given": no cost line for an unnamed interval, no identity line for an unmeasured one. Each row's first line is the state word the answer gave that interval (copied, never compared), so a word this pane was not written for is rendered as the word it was given rather than dropped or relabelled; the frame's own `absence` is stated once, above the rows, and a frame with no interval and no absence renders `intervals: (the answer carried no interval)` rather than a blank pane. The emitted states and their exact text for the demo's recorded answer: **measured** → `state: measured` / `identity: _App` / `cost: 2` (and `identity: RouterOutlet` / `cost: 0` for the measured zero), **cannot-tell** → `state: cannot-tell` / `identity: no-component-identity` with no cost line, **unmeasured** → `state: unmeasured` / `cost: unmeasured` with no identity line, **idle** → `idle: no performance answer has arrived yet` with `columns: []`, and any word given → `state: <word>`. `state`/`kind` are the answer's own frame word (`measured` / `cannot-tell` / `unmeasured`), `message` is `state: <word>`, and `columns` carries `{ state, pair, identity, cost }` per row — the pair is kept for a caller and never printed as a third column.
- 2026-11-08 — **styling**: no new CSS and no new hook. The pane answers `lines` like every other surface, so `panel-demo.ts` renders it through the baseline `apps/angular-ai-devtools/src/styles.css` shipped by M039 T005 unchanged — `section.panel-demo[data-surface][data-state]`, `h2`, `p.state`, and one `p.line` per line for the rows (`section.panel-block[data-block-kind][data-block-state]` / `p.block-state` are the block hooks, and this surface keeps its parts apart in `columns` rather than in blocks, exactly as `linked-state` does). No `styles` block was added to any component and `styles.css` is byte-identical, so `scripts/panel-styles.test.mjs` and the `anyComponentStyle` budget are untouched. `columns` is the programmatic separation and needs no styling of its own; if a future task wants the two cells side by side as table columns rather than labelled lines, that is a new global hook (`section.panel-demo` grid) and it would have to be added to `styles.css` with the `panel-styles` suite re-cut — it is deliberately not smuggled in here.
- 2026-11-08 — route and demo registration: `app.routes.ts` appends `{ path: 'performance', loadComponent: ./panel-demo → PanelDemoComponent, data: { surface: 'performance' } }` after `render-phase` (lazy, for the measured initial bundle); `panel-demo.ts` gains its own `LOADERS.performance` key and its own `FACTS.performance` sample — the narrator's own answer shape (`{ state, intervals, unresolved }`) for the frame T001's recording measured: a measured `TemplateUpdate` naming `_App`, a measured `LifecycleHook` naming `RouterOutlet` with a measured zero, the `ChangeDetection` bracket as `cannot-tell` with the absence `no-component-identity` (the pair the recording answers as carrying no identity), and a `TemplateUpdate` start the frame never closed as `unmeasured`. Every name, pair and absence is the recording's own (`research/raw/m040-work-events.json` witness rows on `/`, `identity.namedAbsence`); the recording carries no frame-level `at`, so the two receipt times are constructed and every `durationMs` is its own `endedAt - startedAt`, which is what `panel-demo.spec.ts` holds the fact to — no duration is written beside the measurements and the `_Counter` instance the recording measured for the unclosed pair is printed nowhere.
- 2026-11-08 — `scripts/panel-performance.test.mjs`: 25 tests (held-out E7 and E8, plus AC1–AC4 and AC6) with 10 real mutants, each pinning the untouched module first, then running the same pin against a copy of the module source carrying one anchored mutation, and reddening with a failure that names the defect by string: **M1** an unmeasured interval gains a cost (`cost = '0'`) → `unmeasured-interval-prints-no-cost` (named in the failure), **M2** an unnamed interval gains a name (`'unknown-component'`) → `unnamed-interval-names-no-component`, **M3** every row renders the first row's identity text → `rows-separate` (naming `_App`) and `measured-row-own-text`, **M4** a measured zero is blanked → `measured-zero-renders-zero`, **M5** the rows are reordered (`columns.reverse()`) → `recorded-order`, **M6** a row is minted for an end the answer could not place → `recorded-order` (`one row per interval`), **M7** an interval naming a word the pane was not written for is dropped → `given-state-rendered` (naming `wedged`), **M8** the cost is derived from `startedAt` → `reads-no-derived-value` (naming `['startedAt']`) and `unmeasured-interval-prints-no-cost`, **M9** the text is not byte-identical on a second read → `byte-identical`, **M10** a row's cost line repeats its identity text → `rows-separate` (naming `cost: _App`). The fixture is the recording read, never written: the pair names and event numbers come from the installed `ProfilerEvent` list the recording derived, the component names from the `/` witness rows, and the `ChangeDetection` absence from the pair the recording measured as carrying no identity; the join itself is run in a bare `node:vm` context and its answers are fed straight into the pane, so the two halves are pinned against each other. Pins: one row per interval in the answer's order, the two cells apart and never repeating one another, the pair never printed as a third column, each state rendering its own text and no other's, no number for an unmeasured interval, no component for an unnamed one, `0` for a measured zero, nothing the answer did not carry (exact lines), idle for every way of having nothing (including a raw frame handed to the pane, which is not an answer), byte-identical on a second read and under a re-ordered key set, and a source pin that the module names no clock, no `startedAt`/`endedAt`, no `unresolved` and no `events`, and carries no runtime import.
- 2026-11-08 — the route pins, each seen **red with the route removed and green restored**: `app.spec.ts`'s ordered path list and its own lazy/`PanelDemoComponent`/`data.surface` block (red: `expected [ '', 'signal-provenance', …(18) ] to deeply equal [ …(19) ]`, `- "performance"`), `chat-entry.component.spec.ts`'s two ordered lists and its panel-surface loop (same red), `page-picker.component.spec.ts`'s lazy list and its `toContain` (red: `expected [ 'interop', 'chat', 'picker', …(12) ] to include 'performance'` at line 422), and `scripts/panel-routes.test.mjs`'s surfaces list, export map, direct-call list and loader-removal mutant (red: `route performance must exist`, and `Missing expected exception: removing the performance loader must fail naming the missing surface performance`) — all four green again once the route was restored. `apps/angular-ai-devtools/src/app/panel-demo.spec.ts` is the demo's own pin rather than a route-table pin — it stays **green** with the route removed, which is the correct behaviour and was measured — so its red proof is the demo registration it actually pins: removing `performance` from `LOADERS` reddens it (`expected 'error' to be 'unmeasured'`, the demo's `no such surface` state) and reddens `panel-routes`' first check (`every app.routes.ts LOADERS key; missing: performance`), both green restored. `scripts/after-render-fixture.test.mjs` pins the **fixture's** table (`spikes/ng222-app/src/app/app.routes.ts`), which this task does not touch and may not grow: it is byte-identical, its nineteen-row pin passes unchanged (`✔ PRECONDITION: the route table declares all nineteen routes in order`), and its bite was proven where it lives — temporarily removing the fixture's `linked-state` route line reddens it (`- 'linked-state'`) and restoring the file greens it. `tests/held-out/fixture-explainers-unchanged.test.mjs` is byte-identical and green (10/10): it compiles the panel's whole route graph, so the new lazy route is the regression proof that no explainer answer moved.
- 2026-11-08 — Verify (verbatim, exit 0): the nine `node --check` lines clean (the five `.ts` subjects included, under node 24's type stripping); `node --experimental-strip-types --test "scripts/panel-performance.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs" "tests/held-out/fixture-explainers-unchanged.test.mjs"` → 45 tests, 45 pass, 0 fail (25 of them this task's, with the ten mutants each reddening by name); `npx nx run angular-ai-devtools:test` → 31 files, 344 tests, all pass (`panel-demo.spec.ts` 8, `app.spec.ts` 2, `chat-entry.component.spec.ts` 18, `page-picker.component.spec.ts` 18); `npx prettier --check` over the nine touched files → "All matched files use Prettier code style!"; `npm run check` → skill-lint, skills-registered, the four tsc stages (panel included), the verification gate (structure) and `format:check` all pass.
- 2026-11-08 — the four working-tree edits that are not this task's (`AGENTS.md`, `.project/STATE.md`, `plans/angular-ai-devtools-program-backlog.md`, `.commandcode/taste/workflow/taste.md`) were parked byte-for-byte before Verify — they break `format:check` and are not this task's to land — and restored afterwards with their sha256 re-checked against the record; `extension/panel/index.html` was never written (no build stage rewrites it in this task's Verify), so there is nothing to restore there.
- 2026-11-08 — eleven declared paths, nine of them touched: the new surface and its suite, the demo's loader key and sample fact, the route, the four route-table pins and `scripts/panel-routes.test.mjs`; `scripts/after-render-fixture.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` are byte-identical, because the table the first pins is the fixture's own and this task must not move it, and the second is the regression proof that the new lazy route leaves every explainer answer alone. No new global CSS and no new hook. Every route pin was seen red with the route removed and green restored, the demo's own pin red with its loader key removed, and the fixture pin red with a fixture route removed — each quoted above. Verify is green at this head (45/45 node tests, 344/344 app tests, prettier clean, `npm run check` clean) — ready
