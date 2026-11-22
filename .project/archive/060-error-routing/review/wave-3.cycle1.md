# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 54c23abd2a732c5f9ffc9298882d44a771cb8234

## T003 — Render the answer and pin every route table: pass

- ✅ The landing is the surface, its pins and the enumerating suites, and nothing else:
  `git show --stat 8909e00a` reads 15 files — the new pane `panel-error-routing.ts | 340 +++`, the
  route entry in `app.routes.ts | 8 +-`, the loader key and sample fact in `panel-demo.ts | 59 +-`,
  the route-table and loader mutants in `scripts/panel-routes.test.mjs | 28 ++`, the copy-record
  move in `research/raw/m048-surface-copy.json | 74 +-` / `m048-surface.json | 10 +-` /
  `m060-surface.json | 514 +++`, the spec updates in `app.spec.ts`, `page-picker.component.spec.ts`,
  `chat-entry.component.spec.ts`, `panel-demo.spec.ts`, and the gate additions in
  `scripts/gate-integrity.test.mjs | 12 +`. The suites are green at the reviewed head:
  `node --test scripts/panel-routes.test.mjs scripts/copy-check.test.mjs scripts/after-render-fixture.test.mjs`
  prints `ℹ tests 40 / ℹ pass 40 / ℹ fail 0` (run by this review).
- ✅ The route, the loader key and the lazy install are real and pinned three ways. The
  `PANEL_SURFACES` list gains `'error-routing'` between `interaction-story` and `dead-click`
  (`apps/angular-ai-devtools/src/app/app.routes.ts:104`, read at HEAD), `LOADERS` gains
  `'error-routing': () => import('./panel-error-routing') as never,`
  (`apps/angular-ai-devtools/src/app/panel-demo.ts:68`), and the route-table suite pins both:
  `scripts/panel-routes.test.mjs:47` adds the surface to the ordered list, `:655` requires the
  exported pair `['panel-error-routing', 'errorRoutingPanel']`, and E4's mutant removes the loader
  key and asserts the check fails naming `missing: error-routing`
  (`scripts/panel-routes.test.mjs:1294-1320`) — green in this review's run (`E4: every declared
  route surface has a panel-demo LOADERS key`).
- ✅ The pane renders the object and only the object. `errorRoutingPanel`
  (`apps/angular-ai-devtools/src/app/panel-error-routing.ts:298-336`) writes every line from
  `LABELS` paths over the answer's own fields — state, the one registered `no-reason` sentence on
  `cannot-tell` (`:320`, the only sentence the pane writes for itself, `:140-146`), message, code,
  the owner line always rendered with `owner-not-in-the-message` where the record named none
  (`:326`, `:252-257`), phase, one absence line per absence (`:260-270`, never folded), one
  claim/artefactPath group per claim (`:277-290`) — and no ninth field exists in the renderer. The
  spec holds the demo's fact to the shipped join field for field: `panel-demo.spec.ts:7396-7532`
  rebuilds the record in T001's measured shape, evaluates `extension/error-routing.js` from its own
  committed text (`:7303-7326`) and asserts `expect(FACTS['error-routing']).toEqual(answer)`
  (`:7419`), then asserts the pane's whole line list (`:7464-7476`) — the fact cannot drift from
  the join without reddening.
- ✅ No remedy, no cause, no handler identity the object did not carry: the pane's own
  `speaksOfCauseOrRemedyOrSchematic` filter is asserted empty over the finding, the reached pane and
  every rendered state (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:7386-7393`, `:7487-7488`,
  `:7557`), the no-handler pane's text does not contain the handler name the record carried
  elsewhere (`:7569`), and the cannot-tell pane renders no message or code line at all
  (`:7591-7596`) — the join's nulls render as absence, never as blanks or inventions.
- ✅ The route-table and digest pins moved in the same task, as SC6 requires: the copy record's
  sentence count moves 212 → 213 in the same commit (`panel-demo.ts:447` comment and `:451`
  `'copy-check': { state: 'clean', unexplained: [], checked: 213 }`, with
  `research/raw/m048-surface.json:113-133` re-pinned to the new count and line text), the copy-check
  suite's run reports `error-routing: clean, 1 sentences` per surface and `T002 record: clean, 213
  sentences compared, 0 unexplained`, and the surface record `research/raw/m060-surface.json` pins
  the route line (`:67`, `'error-routing',`), the loader line (`:122`), the module and the fact
  entry (`:161`), with every citation re-resolved in the copy-check run
  (`T001 citations: 574 lines re-read`).
- ✅ The cited-line economy held: the M060 entry's one line in `app.routes.ts` is paid for by folding
  two lines of the M050 note into one (visible in the T003 diff, `dead-click` comment 3 lines → 1),
  and `app.spec.ts:52-57` states the count moving thirty-eight → thirty-nine without moving a cited
  line; the copy-check run's `every cited path and line is the one the record read` is green, so no
  citation slid.
- ⚠ One scope note, not a defect: `extension/panel/index.html`'s modulepreload order changed in the
  same commit (chunk reorder only, `git show 8909e00a -- extension/panel/index.html`) — a build
  artefact of the new lazy chunk, carrying no surface of its own.
- Files the wave touched, read or not read: `apps/angular-ai-devtools/src/app/panel-error-routing.ts`
  — read (whole file, 340 lines), 100%; `apps/angular-ai-devtools/src/app/app.routes.ts` and
  `apps/angular-ai-devtools/src/app/panel-demo.ts` — read at the cited lines plus the T003 diff;
  `scripts/panel-routes.test.mjs` — read at the three changed sites (`:44-47`, `:651-655`,
  `:1291-1320`); `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:7295-7616` — read (the
  error-routing surface describe); `research/raw/m060-surface.json` — read at the route/loader/fact
  pins; `research/raw/m048-surface.json` — read via the diff; `scripts/copy-check.test.mjs`,
  `scripts/gate-integrity.test.mjs`, `app.spec.ts`, `page-picker.component.spec.ts`,
  `chat-entry.component.spec.ts` — read via the T003 diff and targeted greps; `app.spec.ts:90-108`
  and `:390-409` read at HEAD.

## Intent coverage

### SC6 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no handler identity it was not given.: pass

- ✅ One new surface, its loader key, its route table: the `PANEL_SURFACES` entry
  (`apps/angular-ai-devtools/src/app/app.routes.ts:104`), the `LOADERS` key
  (`apps/angular-ai-devtools/src/app/panel-demo.ts:68`) and the lazy `loadPanelDemo` install are all
  in this one commit, pinned by `scripts/panel-routes.test.mjs:47`, `:655` and the E4
  missing-loader mutant (`:1294-1320`) that reddens naming `missing: error-routing` — the E7 edge's
  "a surface without a loader key reddens" held by a real mutant, green in this review's run
  (40/40). `app.spec.ts:393-408` additionally pins the route lazy, resolving to
  `PanelDemoComponent`, `data.surface === 'error-routing'`, and exactly one route at that path.
- ✅ The panel renders exactly the object the join returns: the demo fact is the shipped join's own
  answer over a record rebuilt in T001's measured shape, held field for field
  (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:7419`), and the pane's line list is held
  line for line against that answer including the owner-absence word, the phase-absence line, one
  absence line per absence and one claim group per cited record (`:7464-7476`). The four states
  render apart (`:7534-7615`), each from the same object.
- ✅ No remedy, no cause, no handler identity: the cause/remedy/schematic filter is empty on every
  rendered state (`panel-demo.spec.ts:7487-7488`, `:7557`), the no-handler pane names no handler
  (`:7569`), the cannot-tell pane renders no message/code line (`:7591-7596`), and the pane's one
  self-written sentence is the digest's shared `no-reason` text
  (`apps/angular-ai-devtools/src/app/panel-error-routing.ts:140-146`) — nothing else is composed at
  render time (the renderer's only values come from `LABELS` paths over the answer's fields,
  `:298-336`).
- ✅ The digest pins moved in the same task: the copy sentence count 212 → 213 and the
  `checked: 213` fact with its re-pinned comment and record citations
  (`research/raw/m048-surface.json:113-133`), the new surface's sentence explained in the digest
  (copy-check run: `error-routing: clean, 1 sentences`; `T002 record: clean, 213 sentences compared,
  0 unexplained`), and the surface record `research/raw/m060-surface.json` captured in the same
  commit pinning route, loader, module and fact lines — E7's "the route table, the loader map, the
  digest row count and the copy record move together" held in one landing.
