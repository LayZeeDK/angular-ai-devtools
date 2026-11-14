# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 46abef82eef789433557af1868bc7abdf6778870
Wave task: T003 (landed `ddb91a1a`)

Wave 3 is the display half and the registration: three blocks, each named absence in its own sentence,
one route entry through the shared loader, and every pin the registration moves re-cut rather than
repaired later. It carries SC5 and only SC5, and it closes it: the criterion is stated of the surface,
and the surface is what this wave renders.

## T003 — Panel surface for the stability state, the settle reading and the repeated work: pass

- ✅ One surface, one route entry, and the pins the entry moves — no other product path:
  `git show --stat ddb91a1a` reports `apps/angular-ai-devtools/src/app/panel-stability.ts` +451,
  `apps/angular-ai-devtools/src/app/panel-demo.ts` +28,
  `apps/angular-ai-devtools/src/app/app.routes.ts` +10, `app.spec.ts` +14/−2,
  `chat-entry.component.spec.ts` +3, `page-picker.component.spec.ts` +2,
  `panel-demo.spec.ts` +397, `scripts/panel-stability.test.mjs` +1,328,
  `scripts/panel-routes.test.mjs` +45 and the task file +12/−4.
- ✅ Three blocks and nothing else: `apps/angular-ai-devtools/src/app/panel-stability.ts:423-427`
  assembles `stateBlock`, `settleBlock` and `repeatsBlock` in that order, `:129` declares
  `READING_BLOCKS = ['state', 'settle', 'repeats']`, and the three renderers are `:218` (`stateBlock`,
  the word plus the emission it was read from and no reason), `:251` (`settleBlock`) and `:291`
  (`repeatsBlock`). No block carries a cause, an outstanding item, an owner or an order.
- ✅ Each named absence renders in its own block and its own sentence:
  `apps/angular-ai-devtools/src/app/panel-stability.ts:440-444` pushes one `absenceBlock` per carried
  absence, the four sentences are at `:94-104`, and the cells are filled by name at `:441-443` — never
  one absence's text in another's cell.
- ✅ `no-stability-observable` is never an empty table and never an em dash:
  `apps/angular-ai-devtools/src/app/panel-stability.ts:390-396` (`noStabilityObservable()`) assembles a
  pane from one absence block, `:409` returns it whenever the answer is not an answer
  (`if (read === null) return noStabilityObservable();`), `:126` binds it to the absence's own
  sentence, and `:386-389` states the property the code enforces.
- ✅ A measured `0` prints as `0` and an absent settle prints the absence with no time and no
  duration: `apps/angular-ai-devtools/src/app/panel-stability.ts:276-277` prints
  `settle: settled at <at> ms, <since> ms after attach` — a measured `0` stays `0` because the value is
  printed, not tested for truthiness — while `:251-264` returns `settle: no-settle-observed` with `NO_SETTLE_TEXT`
  and no number at all.
- ✅ One line per repeated pass the answer carried, and the reading the frame has where it recorded
  none: `apps/angular-ai-devtools/src/app/panel-stability.ts:291-305` prints
  `<pair> <component>: <passes> pass|passes` per repeat with `no component` for a null name (`:299`)
  and `NO_PAIRED_WORK_TEXT` where the answer carried no repeat (`:119`, `:293-296`) — no per-view cycle
  count and no outstanding-work count is printed anywhere in the file.
- ✅ The route is registered through the shared loader, with no second copy of the dynamic import:
  `apps/angular-ai-devtools/src/app/app.routes.ts:14` defines `loadPanelDemo` once, `:167-169` is the
  new entry (`path: 'stability'`, `loadComponent: loadPanelDemo`, `data: { surface: 'stability' }`) and
  `:161-166` states what the entry renders. The demo's loader key is
  `apps/angular-ai-devtools/src/app/panel-demo.ts:53` and its sample fact is
  `apps/angular-ai-devtools/src/app/panel-demo.ts:341-351` — the join's own answer for
  `research/raw/m043-stability.json`'s `record.frame`, not a value invented for the demo.
- ✅ Six pins the registration moves were re-cut and each was proven to bite by removing the entry and
  running it red, with the failing assertion quoted at
  `.project/tasks/T003-panel-surface-for-the-stability-state.md:89`: the app suite's ordered path list
  (`apps/angular-ai-devtools/src/app/app.spec.ts:60`) and its lazy-loader pin (`:168-174`), the
  chat-entry suite's ordered and lazy lists (`chat-entry.component.spec.ts:716`, `:742`, `:788`), the
  picker's lazy list (`page-picker.component.spec.ts:425`, `:445`), the demo suite's route, loader key
  and sample fact (`panel-demo.spec.ts:1520-1535`) and `scripts/panel-routes.test.mjs`'s surfaces
  (`:34`), route pin and removal mutant (`:330-343`), export map (`:361`), direct-call list (`:400`)
  and loader-removal mutant (`:633-651`).
- ✅ Three guards were proven unmoved rather than claimed as pins: `scripts/panel-styles.test.mjs`
  enumerates no route and stayed green with the entry removed, `tests/held-out/fixture-explainers-unchanged.test.mjs`
  stayed green with its own `di-doctor` mutant as the proof it bites, and
  `scripts/after-render-fixture.test.mjs` measured the fixture's table with no byte moved
  (`.project/tasks/T003-panel-surface-for-the-stability-state.md:89`).
- ✅ The panel's initial total is inside the recorded baseline after the entry:
  **535.067 kB measured** (535,067 B over 9 eager files) against the **535.44 kB** baseline
  (`.project/tasks/T003-panel-surface-for-the-stability-state.md:88`), 0.373 kB left where 0.435 kB
  remained before it. The baseline is the named constant `PRE_MILESTONE_INITIAL_KB = 535.44` at
  `scripts/panel-bundle-budget.test.mjs:81` with its test at `:441`, and the second budget suite at
  `scripts/image-budget.test.mjs:92`.
- ✅ Held-out E9 is non-vacuous: `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1567` holds the
  demo's lines to `stabilityPanel(FACTS['stability']).lines`, `:1652` holds the cells, and the mutant
  that answered `no-outstanding-inventory` with "the outstanding item is task 7, owned by AppComponent"
  reddened it as `expected … not to match /\btask\s+\d/i`
  (`.project/tasks/T003-panel-surface-for-the-stability-state.md:90`). Nine further real mutants in
  `scripts/panel-stability.test.mjs` redden the pane's own pins by string (same line).
- ✅ The wave's Verify is recorded passing at its own landing:
  `.project/build/verify-ledger.jsonl:3` — `"result": "pass"` at
  `ddb91a1abbb46d899a1e0ce64b8d591426307405` — and the project gate is re-read at this head:
  `npm run check` → exit 0, `verification gate (structure): pass`.

## Intent coverage

### SC5 — The panel surface renders the state, the settle time or its named absence, and the repeated-work reading, each in its own block, and renders nothing else: no sentence names a cause, no list names an outstanding item or its owner, no column orders work by settle time, the surface is registered in the route table that carries no stability route today (`apps/angular-ai-devtools/src/app/app.routes.ts:17-160`), and asked for a page it has no stability answer for it renders `no-stability-observable` rather than an empty table or an em dash.: pass

- ✅ "Each in its own block" is closed at the assembly: three blocks, one order, one block per reading
  (`apps/angular-ai-devtools/src/app/panel-stability.ts:423-427`, `:129`), with the pane reachable as
  `stabilityPanel(answer)` at `:404` (exported at `:449-451`).
- ✅ "Renders nothing else" is closed in the negative and pinned in the negative: no cause, no
  outstanding item, no owner and no order anywhere in the file's lines (`:218`, `:251`, `:291` are the
  only line producers, and the absence block `:315-325` renders a name and its own sentence), with the
  prose mutant that named a cause and the one that listed "task 7, owned by AppComponent" reddening
  the pins by string (`.project/tasks/T003-panel-surface-for-the-stability-state.md:90`).
- ✅ "Registered in the route table that carries no stability route today" is closed:
  `apps/angular-ai-devtools/src/app/app.routes.ts:167-169` is the entry, it uses the shared
  `loadPanelDemo` defined at `:14`, and the table carried no `stability` path before this landing
  (`git show ddb91a1a -- apps/angular-ai-devtools/src/app/app.routes.ts` adds the entry and the
  comment above it, and changes no other route).
- ✅ "Asked for a page it has no stability answer for it renders `no-stability-observable` rather than
  an empty table or an em dash" is closed by construction and by pin: the no-answer pane is
  `apps/angular-ai-devtools/src/app/panel-stability.ts:390-396`, reached at `:409`, and E9's own cell
  assertions are `apps/angular-ai-devtools/src/app/panel-demo.spec.ts:1652`.
- ✅ The criterion's boundary cases are the pane's own: a settle of `0` prints `0`
  (`apps/angular-ai-devtools/src/app/panel-stability.ts:276-277`), a named-absent settle prints no
  time and no duration (`:251-264`), a frame with no repeated work prints the reading it has rather
  than a zero (`:293-296`), and a state word the pane was not written for renders as that word and
  nothing else (`:414-419`).
