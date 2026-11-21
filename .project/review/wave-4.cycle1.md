# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: 2eedd6855b32ff08088bd5718c7ee805de595484

## T004 — Render the answer and land the route: pass

- ✅ The pane is the display half and renders only what the answer carries, under two tables that make
  composition impossible: every sentence it writes for itself is enumerated once in `PANE_SENTENCES`
  — the four state sentences, the ordering sentence that states the named absence, and
  `no-tutor-signals-answer` for an answer nobody handed over
  (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts:173-204`), and every other line is a
  field of the answer under its own path from the fifteen-entry `LABELS` table (`:132-148`), printed
  as `<path>: <value>` with the value read out of the answer (`:281-284`, the line builders at
  `:297-390`). The spec holds every line of the rendered pane to exactly those two tables
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5921-5933`), so every line the pane writes is
  a registered sentence or an answer field path, and a state word the pane was not written for
  renders as the bare word borrowing no field
  (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts:403-409`).
- ✅ The sample fact is the shipped join's own answer over `research/raw/m039-render-phase.json`'s
  `/effect/freshRead`, not a hand-written object: `FACTS['tutor-signals']` is entered after the
  component with the reason stated (`apps/angular-ai-devtools/src/app/panel-demo.ts:805-827`), and
  the spec re-derives it on every run — it evaluates `extension/tutor-signals.js` from its own
  committed text (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5700-5721`), locates the
  graph's line by searching the record's bytes for `"freshRead": {` (`:5727-5737`), runs the join
  over the record's own `nodes` and `allEdges` (`:5748-5769`, `:5773-5777`), and holds the fact to
  that answer field for field (`:5856-5857`). The effect renders the record's own index 5 with the
  empty label beside it, the read the record's own edge states, and the ordering as the named absence
  (`:5799-5834`); the empty label prints as an empty `effect.label:` line directly above
  `effect.index: 5` and the spec refuses a quoted or minted name there (`:5884-5892`).
- ✅ The route is landed and pinned: the entry `'tutor-signals',` sits in `PANEL_SURFACES` at
  `apps/angular-ai-devtools/src/app/app.routes.ts:84` between `tutor-foundations` and
  `webmcp-rehearsal`, the three lines the M047–M055 surface records cite still read what they read —
  `:113` `export const appRoutes: Route[] = [`, `:146` `loadComponent: loadPanelDemo,`, `:147`
  `data: { surface },` (`apps/angular-ai-devtools/src/app/app.routes.ts:113,146,147`) — the spec
  proves the route loads lazily through the demo with `data.surface === 'tutor-signals'` and exactly
  one route at the path (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5859-5871`), and the
  loader key `'tutor-signals': () => import('./panel-tutor-signals') as never,` is in the map
  (`apps/angular-ai-devtools/src/app/panel-demo.ts:65`).
- ✅ The line-neutrality C3 requires is earned by a measured repair, recorded with the before and after
  rather than papered over: the first landing (`f1c602d2`) paid for the entry by deleting the M028
  comment's line, and the sweep of every `app.routes.ts` citation across `research/raw/m0*.json` —
  52 citations — reported 2 unresolved, the M054 and M055 route-path citations that the deletion
  shifted; the repair restored the M028 comment exactly as the base carries it and paid for the entry
  by folding the M053 note's two lines into one, and the same sweep then reports
  `citations 52, unresolved 0` with `:21, :81, :83, :86, :93, :97, :110, :111, :113, :146` and `:147`
  each reading what the base read
  (`.project/tasks/T004-render-the-answer-and-land-the-route.md:153`). The verify re-ran after the
  repair and is green — build `534.51 kB` with the lazy `panel-tutor-signals` chunk, app suite 31
  files / 359 tests, prettier clean, artifact restore last (`:154-155`).
- ✅ The three absences render as three distinct renderings through the shipped join with a real
  record: the spec drives `graph-unreadable`, `no-render-entry` and `no-effect-node` through the join
  and holds each to its own state, its own sentence and its own rendered lines
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5935-5967`), with the reference no node can
  place named under `unplaced` by end and the value the record states (`:5958-5961`).
- ⚠ Declared limit, not a defect: the pane's six sentences are not in `extension/copy-digest.json` at
  this commit — the digest is not this task's file — and the gap is recorded in the module's header
  and the Log for T007, which re-measures the copy
  (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts:86-88`,
  `.project/tasks/T004-render-the-answer-and-land-the-route.md:151`). T007 closes it (wave 5).

## T005 — Pin the route table and the loader map: pass

- ✅ The pin owns the change before it is asked: the suite's surface list gains `'tutor-signals'`
  between `tutor-foundations` and `webmcp-rehearsal`
  (`scripts/panel-routes.test.mjs:39`), the surface-to-module map gains
  `'tutor-signals': ['panel-tutor-signals', 'tutorSignalsPanel']` — the module the `LOADERS` key
  imports and the symbol the pane exports (`scripts/panel-routes.test.mjs:640`) — and the
  no-direct-call list gains `tutorSignalsPanel(` (`scripts/panel-routes.test.mjs:690`). No assertion
  was loosened and no expected count lowered: the list grew by one name and the `deepEqual` still
  pins the whole order, and the suite went from `tests 4, pass 3, fail 1` before the pin to
  `tests 4, pass 4, fail 0` after
  (`.project/tasks/T005-pin-the-route-table-and-the-loader-map.md:95`).
- ✅ Both mutants are carried in the file and redden naming the surface, so the pin proves itself on
  every run: dropping `'tutor-signals',` from `PANEL_SURFACES` fails with `route tutor-signals must
  exist exactly once in PANEL_SURFACES`
  (`scripts/panel-routes.test.mjs:595-611`), and dropping the `LOADERS` key fails with `every
  app.routes.ts surface must have a panel-demo LOADERS key; missing: tutor-signals`
  (`scripts/panel-routes.test.mjs:1190-1214`).
- ✅ The three line numbers C3's entry rests on are read from the file, and the citation sweep is
  re-run independently of T004: line 113, line 146 and line 147 hold
  (`.project/tasks/T005-pin-the-route-table-and-the-loader-map.md:100`), and the sweep of every
  `research/raw` citation naming `app.routes.ts` with a line and its text reports
  `citations 52, unresolved 0` (`:100`) — the same measured result T004's repair bullet states
  (`.project/tasks/T004-render-the-answer-and-land-the-route.md:153`), from the task that owns
  running the route-file suites (C6).
- ✅ The route the wave lands is proven green at the head the wave leaves: T005's single `node --test`
  leg runs its own suite plus `after-render-fixture`, `component-search` and the held-out
  explainer-unchanged suite — `tests 36, pass 36, fail 0`, prettier clean, exit 0
  (`.project/tasks/T005-pin-the-route-table-and-the-loader-map.md:101`) — and the two gate suites its
  file's closure reaches are declared and edited neither (`:102`), with the eleven gate-integrity
  failures each naming a path this task did not touch, left to T008
  (`.project/tasks/T005-pin-the-route-table-and-the-loader-map.md:102`).

## Intent coverage

### SC1 — An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion.: pass

- ✅ Covered by T004: the pane names the effect the way the join answered — the empty label printed as
  the record spells it directly above `effect.index: 5`, the read by index and label, and every
  claim's artefact path on the pane
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5884-5919`) — over the fact that is the
  join's own answer, held field for field on every test run
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5856-5857`). T005's mutants keep the surface
  reachable: a dropped route or a dropped loader key reddens naming `tutor-signals`
  (`scripts/panel-routes.test.mjs:595-611`, `:1190-1214`).

### SC3 — A page whose signal graph the agent could not read reports cannot-tell naming the graph and nothing else — no effect, no label, no read (`extension/render-phase.js:310-312`) — and the absences stay distinct: a page whose record carries no render/effect entry, and a readable graph that holds no effect node (`extension/render-phase.js:317-319`), each report their own named absence; a mutant that reports an unreadable graph as a page with no effects, and a mutant that folds the three absences into one blank or empty answer, redden.: pass

- ✅ Covered by T004: the three absences are driven through the shipped join with the real record and
  rendered as three states with three distinct first sentences, never one blank answer, each naming
  its own absence and stating nothing the answer lacks
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5935-5967`); an answer nobody handed over is
  the pane's own named absence `no-tutor-signals-answer`, the sixth registered sentence and not a
  synonym for any of the three
  (`apps/angular-ai-devtools/src/app/panel-tutor-signals.ts:199-203`).
