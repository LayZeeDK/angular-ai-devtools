# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 1d3aa1d5acadc350c89dd3a1c1304efe8607928e

## T003 — Render the answer and pin the route tables: pass

- ✅ The landing is the panel surface and its pins, and nothing else: `git show --stat 9508740e`
  reads 13 files — `panel-tutor-routing.ts | 532 +++` (new), `panel-demo.ts | 132 +-`,
  `app.routes.ts | 4 +-`, the four specs (`panel-demo.spec.ts | 634 +-`, `app.spec.ts | 22 +-`,
  `page-picker.component.spec.ts | 7 +-`, `chat-entry.component.spec.ts | 3 +-`),
  `scripts/panel-routes.test.mjs | 47 ++`, `scripts/copy-check.test.mjs | 25 +-`,
  `extension/copy-digest.json | 27 +-`, `research/raw/m058-surface.json | 843 +++` (new),
  `research/raw/m048-surface-copy.json | 369 +-` and the task file — closing at
  `13 files changed, 2615 insertions(+), 41 deletions(-)`. No join module, no page-side file and no
  suite outside the route and copy pin closures is touched.
- ✅ The pane is the display half and nothing else, and the demo's sample is the join's own answer,
  not a hand-written object. The module reads no record and composes no field: every line it writes
  is either a `PANE_SENTENCES` entry (`panel-tutor-routing.ts:193-219`, five entries) or a field of
  the answer under its own path from `LABELS` (`:138-170`), assembled by `tutorRoutingPanel`
  (`:503-528`) whose only input is the `answer` argument. The spec proves the sample's provenance:
  it inlines `research/raw/m041-navigation.json`, `research/raw/m030-router-config.json` and
  `extension/tutor-routing.js` from disk, evaluates the join from its own committed text
  (`new Function(text)()` at `panel-demo.spec.ts:6196`, inside `tutorRoutingJoin` at `:6181`), and
  holds the demo fact to that answer field for field — `expect(FACTS['tutor-routing']).toEqual(answer)`
  (`:6343`). This review re-ran the surface record's own measurement command over the two records at
  this head and it printed byte-identically to the record's own `output`
  (`research/raw/m058-surface.json:14`): `{"state":"answered","terminal":{"class":"NavigationEnd",
  "id":2,...,"url":"/redirect","urlAfterRedirects":"/landing"},"route":{"path":"redirect",
  "redirectTo":"landing"},"absences":["no-guard-verdict","no-redirect-decision"],...,"claims":5,...}`.
- ✅ The two absences render side by side and no guard verdict is composed — read off the rendered
  pane, not only off the tests. This review executed `panel-tutor-routing.ts` directly over the
  demo's shipped fact (`tutorRoutingPanel(FACTS['tutor-routing'])`) and read the 62 rendered lines:
  `absence.state: no-guard-verdict` sits at pane line 29 followed by the registry's own
  `no-guard-verdict:` sentence, and `absence.state: no-redirect-decision` sits at pane line 39
  followed by the registry's own `no-redirect-decision:` sentence — two groups built per absence by
  one loop (`absenceLines`, `panel-tutor-routing.ts:414-460`, the per-entry `absence.state` push at
  `:432` and the per-absence sentence at `:433-436`). The rendered text carries no `no-findings` and
  no `absentFields`; the one line naming both words is `detail:` — the join's own `detail` field
  echoed unchanged (`:492-495`), a field the answer carries, not a fold the pane composed. The
  aggregate is never a verdict: `shouldActivate` renders only as `absence.guardFields: shouldActivate`
  (the aggregate named as the aggregate), no `shouldActivate: true/false` line exists, and
  `route.redirectTo: landing` renders once as the entry's configuration field with no decision field
  beside it. The spec holds the same reading (`panel-demo.spec.ts:6410-6435` — `guardAt` before
  `redirectAt`, two distinct sentences, neither shared — and the verdict/redirectTo pins at
  `:6473-6505`), and the registry carries one sentence per absence in the join's order (`:6565-6572`).
- ✅ Every route pin moved and no count was lowered. `PANEL_SURFACES` grew 27→28 (counted at
  `app.routes.ts:20-112` — 28 entries, `'tutor-routing'` at `:85` between `tutor-signals` and
  `webmcp-rehearsal`, paid for by folding the M053 note into the paragraph and deleting its line, so
  `visual-qa` through `what-changed` keep their numbers), and the ordered table grew 36→37 (9 base
  routes at `:113-140` + 28 spread at `:144-148`). The ordered-path lists gained the name in table
  order in `app.spec.ts:84`, `chat-entry.component.spec.ts:722/:761/:827`,
  `page-picker.component.spec.ts:438/:471/:515` and `panel-demo.spec.ts:2994`; the two
  `toHaveLength` pins both read 37 (`page-picker.component.spec.ts:524`,
  `panel-demo.spec.ts:3003`) and neither was lowered. `scripts/panel-routes.test.mjs` was edited in
  exactly the four places its pins demand — the surface list (`:40`), the surface-to-module map
  (`'tutor-routing': ['panel-tutor-routing', 'tutorRoutingPanel']` at `:660`), the negative-call
  list (`:711`) and the two new mutants naming the dropped route and the dropped loader (`:614-631`,
  `:1237-1262`) — and `node --test scripts/panel-routes.test.mjs` reports `ℹ tests 4 / ℹ pass 4 /
  ℹ fail 0` at this head. The copy pins were raised, never lowered: `copy-check.test.mjs` 28→29
  surfaces (`:2341`), 193→198 digest rows (`:2415-2418`), 201→206 sentences (`:2425-2428`),
  167→172 declared (`:2430`), 201→206 checked (`:2876`); `panel-demo.spec.ts` 28→29 (`:3519`) and
  201/193→206/198 (`:3507-3510`); `research/raw/m048-surface-copy.json` `counts` raised to
  surfaces 29 / declaredSentences 172 / citations 550 (`:16-29`); the digest gained exactly the
  pane's five registry rows (`extension/copy-digest.json:970-993`). The entry is line-neutral as
  claimed: this review re-swept every `research/raw/m0*.json` citation into `app.routes.ts` at this
  head and printed `citations into app.routes.ts: 64, unresolved: 0` — the same 64/0 the surface
  record states (`research/raw/m058-surface.json:66`), and every citation inside
  `research/raw/m058-surface.json` itself re-resolves at this head (this review's walk: 0 unresolved).
- ✅ Nothing is asked of the inspected page (SC6, N6, N7) — read from the code, not from a test
  name: `panel-tutor-routing.ts` contains zero `import` statements and no `document`, `window`,
  `postMessage`, `MutationObserver` or `addEventListener` token anywhere in its 532 lines (this
  review grepped and read all of them); its one export of consequence,
  `tutorRoutingPanel(answer?: unknown)` (`:503`), is a pure function of its argument returning a
  plain `{ state, kind, message, lines, text }` (`:264-270`, `:305-308`) — no DOM is built, no
  observer is started, no message is dispatched, and the state it renders it takes from the answer
  it was handed (`:505-506`), falling back to the pane's own named absence
  `no-tutor-routing-answer` (`:125`, `:311-313`) rather than asking anything. The route reaches it
  lazily through the shared `loadPanelDemo` closure with no component of its own
  (`app.routes.ts:14-15`, `:144-148`; pinned at `app.spec.ts:370-375` and
  `panel-demo.spec.ts:6350-6353`), the sample fact is derived node-side by the spec (the `:6343`
  pin above), and the pane's text adds no markup (`expect(pane.text).not.toMatch(/<\/?[a-z]/i)`,
  `panel-demo.spec.ts:6643`). The extension build shows the surface as its own lazy chunk
  (`panel-tutor-routing | 6.99 kB`, `.project/build/verify-T003.log:32`).
- ✅ **The copy suite is red at this head, and the red is exactly the known one — nothing else in
  wave 3 is red.** `node --test scripts/copy-check.test.mjs` reports `ℹ tests 30 / ℹ pass 29 /
  ℹ fail 1`. The one failing test is `T004 — the route record names the route, the loader key, the
  three states and what each reads` (`scripts/copy-check.test.mjs:2925`), and the failing assertion
  is the citation re-read at `:3000-3004`:
  `AssertionError [ERR_ASSERTION]: research/raw/m048-surface.json:loader.sampleFact quotes the line
  as "'copy-check': { state: 'clean', unexplained: [], checked: 201 }," and the file reads
  "'copy-check': { state: 'clean', unexplained: [], checked: 206 },"`. The cause is the record, not
  the wave: `research/raw/m048-surface.json:112-114` still cites `panel-demo.ts:450` with
  `"lineText": "'copy-check': { state: 'clean', unexplained: [], checked: 201 },"` and
  `"holds": "checked: 201"`, and `:126-127` still quotes the pre-M058 comment
  `"all 201 compared strings are explained"` — while the moved fact now reads `checked: 206`
  (`panel-demo.ts:450` in the T003 diff). T003's own Log discloses this measured state, including
  the 30/29/1 count and the probe-and-revert (`.project/tasks/T003-render-the-answer-and-pin-the-route-tables.md:214`).
  The plan repair the review brief describes as a new task T005 landed, measured, as an amendment
  to **T004** (wave 4): commit `1d3aa1d5` adds `research/raw/m048-surface.json` to T004's `files:`
  and a paragraph directing it to correct the record's four values (`sampleFact.lineText` and
  `.holds`, and the two fields of `sampleFactComment` — exactly the four stale values at `:113-114`
  and `:126-127`) and re-run the suite green; no T005 exists in `.project/tasks/`. Everything else
  at this head is green: `npx nx run angular-ai-devtools:test --skip-nx-cache` reports
  `Test Files 31 passed (31) / Tests 360 passed (360)` including `panel-demo.spec.ts (24 tests)`,
  `node --test scripts/panel-routes.test.mjs` is 4/4, and the task's own Verify is recorded in
  `.project/build/verify-T003.log` (head `5da063c2`, the pre-commit working tree; `Tests 360
  passed (360)` at `:98`, `All matched files use Prettier code style!` at `:112`, the `npm run
  check` gates pass at `:149-177`).
- ✅ The surface record and the copy re-measurement state what the wave lands. `research/raw/
  m058-surface.json` states the route (`tutor-routing`, `app.routes.ts:85`), the loader key
  (`'tutor-routing': () => import('./panel-tutor-routing') as never,`, `panel-demo.ts:66`),
  the two states with the answer fields each reads (`states`, `:420-676`), the two absences with
  the sentences they render in (`absences`, `:677-…`), the join, the display module and the two
  records as sources (`sources`, `:17-25`), and a `measurement` block whose command and output
  this review reproduced byte-identically (`:10-15`). `research/raw/m048-surface-copy.json` was
  re-measured over 29 surfaces with the counts the suite recomputes on every run (the copy-check
  run prints `T001 surfaces: 29 surfaces, 172 declared sentences, 34 inline sentences, 1 absence`
  and `T001 citations: 550 lines re-read`), and the digest's five new rows are the registry's five
  texts verbatim, none duplicating another surface's row (spot-compared against
  `panel-tutor-routing.ts:193-219`).
- Files the wave touched, read or not read, with the diff covered: `panel-tutor-routing.ts` — read,
  100% (532/532 lines) and executed; `.project/tasks/T003-…-route-tables.md` — read, 100% (216
  lines); `app.routes.ts` — read, 100% (149 lines) plus the landing diff; `panel-demo.ts` — the
  landing diff read in full (3 hunks, ≈130 of 132 changed lines), whole file not read, ≈diff 100%;
  `panel-demo.spec.ts` — the landing diff read in full (all four hunks, 613 added lines), ≈diff
  100% of 634; `app.spec.ts`, `chat-entry.component.spec.ts`, `page-picker.component.spec.ts`,
  `scripts/panel-routes.test.mjs`, `scripts/copy-check.test.mjs`, `extension/copy-digest.json` —
  landing diffs read in full, 100% of each diff; `research/raw/m058-surface.json` — part read
  (`:1-70` header/route, the states/absences structure, the loader block), ≈15% line-read, 100% of
  its citations re-resolved by this review's walk; `research/raw/m048-surface-copy.json` — part
  read (`:16-29` counts), ≈1% line-read, 100% executed by the copy-check run; `research/raw/
  m048-surface.json` — part read (`:100-139`), the four stale values confirmed. Also read:
  `.project/plan/PLAN.md`, `.project/intent/INTENT.md`, `.project/tasks/T004-…verify.md`,
  `.project/build/verify-T003.log` (209 lines, 100%), the wave-1/wave-2 reviews and the archived
  M057 wave-3 review (grammar template). Not read: no file the commit touches was left wholly
  unread.

## Intent coverage

### SC1 — An answer for a navigation the stream records names the class of the terminal event that closed it and the navigation `id` that event carries, and names the route node the router config records for it by the entry's own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states, every field read from the recorded stream and the recorded config; each claim carries the event it rests on (class and `id`) and the config entry it rests on (`path`), in M055's answer shape (`.project/ROADMAP.md:2038`); a mutant that answers with no artefact path reddens the pin M055 shipped, a mutant that names a terminal class the stream did not record reddens, and a mutant that names the route from the final URL reddens.: pass

- ✅ Covered by T003: the pane renders every field the answer carries under the answer's own path —
  `terminal.class`/`terminal.id` then the class's own fields, `route.path` then the stated fields,
  one `claim.claim`/`claim.values.<key>`/`claim.artefactPath` group per claim
  (`panel-tutor-routing.ts:336-386`, `:468-489`; rendered output quoted above), with a claim
  carried without an artefact path rendered by no one (`:476`). The demo fact is the join's own
  answer held field for field by `panel-demo.spec.ts:6343`, and the spec additionally pins the
  terminal claim to the event (`values {class, id}`, artefact the navigation record) and the route
  claim to the config entry (`values {path}`, artefact the config record) at `:6328-6339` of the
  diff (`panel-demo.spec.ts` new section). The join-side mutants T003's AC1 leans on are T002's and
  stay green — the app suite that re-evaluates the join over the records is 360/360 at this head.

### SC3 — The two absences are two states, each with its own fields and never folded. `no-guard-verdict` is stated where the stream carries no per-guard verdict: `GuardsCheckEnd`'s only guard field is the aggregate `shouldActivate`, which the answer may not render as any guard's verdict, and a refusal is indistinguishable from an unmatched URL (`absences.guard-verdict-not-recorded`). `no-redirect-decision` is stated where `url` differs from `urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0 (`terminals.redirect`, `events.codes`). A guard's name may be read from the config entry that declares it (`research/raw/m030-router-config.json` `config`, `gated` → `canActivate: ["[fn redirectGuard]"]`) and never its verdict; a mutant that folds the two into one absence or one "no findings" answer, a mutant that renders `shouldActivate: true` as a guard's verdict, and a mutant that renders a config entry's `redirectTo` as the redirect that decided the navigation each redden.: pass

- ✅ Covered by T003, from the rendered pane and not only the pins: the two absences render as two
  groups, each `absence.state` line followed by its own registry sentence, 10 lines apart on the
  demo pane (lines 29 and 39 of this review's render), never folded — no `no-findings`, no
  `absentFields`, and the only line naming both words is the answer's own `detail` field echoed
  (`panel-tutor-routing.ts:492-495`). `shouldActivate` renders only as the aggregate list
  `absence.guardFields`, never as a verdict (no `shouldActivate: true/false` anywhere in the pane's
  text; `LABELS` carries no `terminal.shouldActivate`), and `route.redirectTo: landing` renders
  once as configuration with no decision beside it. The spec holds all of it
  (`panel-demo.spec.ts:6410-6435`, `:6473-6505`) and the registry holds one sentence per absence in
  the join's order (`:6565-6572`). The word-level closure also holds where the pane is not written
  for the word: an unknown state renders as the bare word (`tutorRoutingPanel({state:
  'mystery-state'})` renders exactly `state: mystery-state` — this review's run), and a missing
  answer renders the pane's own fifth state `no-tutor-routing-answer`, so five distinct words and
  five distinct sentences exist (`panel-demo.spec.ts:6601-6627`).

### SC6 — The answer is produced from the two observables the agent already holds — the recorded navigation stream and the router config it reads through the `Router` token its own injector walk resolves (`research/raw/m041-navigation.json` `reach.readFrom`: `routerTokenFrom` at `extension/agent-main.js:1750-1839` finds the token in entry 2 of a 5-entry path, resolving to the instance `ɵgetRouterInstance` returns, and the record states "No new tap is needed") — with no new page-side instrumentation, no second tap (`.project/ROADMAP.md:2049`) and nothing the record does not hold: no DOM, no console, no page global, no live page read (`extension/router-diagnostic.js:11-14`); a mutant that reads a live page value, starts its own tap, or answers from a field the record does not carry reddens.: pass

- ✅ Covered by T003 by code reading, since the page leg was removed from this wave's Verify: the
  display module asks the inspected page for nothing — no runtime import, no DOM read or write, no
  observer, no message dispatch, no page global (the byte-level scan quoted in the task bullet
  above; `tutorRoutingPanel` is a pure function of the answer handed to it, `:503-528`). The answer
  itself is produced node-side from the two records: the demo sample is the shipped join evaluated
  from its own committed text over the two inlined records (`panel-demo.spec.ts:6181-6201`,
  `:6343`), the route installs lazily through the one shared closure with no eager surface function
  (`app.routes.ts:144-148`), and the record T003 writes states the same shape — "No browser was
  opened for this record, no page was read, no capture was taken and no build or test of the app
  was run" (`research/raw/m058-surface.json:9`). The build output confirms the surface adds one
  lazy chunk and nothing page-side (`.project/build/verify-T003.log:32`).

## Notes

- **Plan-repair shape (measured, two states):** at the reviewed HEAD `1d3aa1d5` the repair is an
  amendment to **T004** — that commit adds `research/raw/m048-surface.json` to T004's `files:` and
  a paragraph assigning it the four-value correction and the green re-run. While this review was
  running, the plan repair the cycle asked for was applied in the working tree, uncommitted:
  a new `.project/tasks/T005-repair-the-stale-citation-in-the-surface-record.md` (wave 4, deps
  `[T003]`, `files: research/raw/m048-surface.json` only) now owns the four-value correction, and
  T004 moves to wave 5 with `deps: [T003, T005]` and the m048 paragraph removed
  (`git diff .project/tasks/T004-…verify.md` at this tree). The owner is wave 4 either way, so
  wave 3's verdict is unaffected; recorded so the wave-4 review cites T005 for the record repair
  and T004 for the recordings and project verify. One dangling reference inside the in-flight
  T005 text: its Context cites "the authored ceiling is four (PLAN R6)" and no R6 exists in the
  plan's `## Risks` (R1–R5) at this tree — severity: low, plan-side, not wave 3's.
- **`extension/panel/index.html` is not in the landing commit.** `git show --stat 9508740e` lists
  13 files and the artifact is none of them, and `git show HEAD:extension/panel/index.html`
  contains no `tutor-routing` reference. The task Log discloses why: a fresh build reproduces the
  same seven eager preload links in a different order, so the Verify's own `git checkout --
  extension/panel/index.html` leg discarded it (task Log `:216`). The plan's wave-3 prose ("lands
  a freshly built `extension/panel/index.html`") is met in letter only through that discard; the
  artifact that serves the surface is re-proven by T004's project-verify builds. Severity: low —
  disclosed in the Log, no hand edit occurred, and the budget leg that polices freshness
  (`panel-bundle-budget`) runs in T004's `npm test`.
- **Unverified in this review:** the direct-suite leg is deliberately T004's, so
  `scripts/component-search.test.mjs`, `tests/held-out/fixture-explainers-unchanged.test.mjs`,
  `scripts/after-render-fixture.test.mjs`, the two gate suites and `npm run check`/`npm test` were
  not run here — the last two's most recent recorded run is the task Verify at head `5da063c2`
  (`.project/build/verify-T003.log`), not this reviewed head `1d3aa1d5`; the app-suite leg was
  re-run at this head and is green. The task Log's "panel-bundle-budget is green either way" and
  the "already unresolved at the base" claims for `research/raw/m047-surface.json` and
  `research/raw/m055-surface.json` rest on the Log's own verification; this review did confirm the
  m047 half — the record's citations into `panel-demo.ts:427/:488/:495/:496` no longer resolve at
  this head (measured: the cited lines read different text) — and noted they are no task's repair
  here beyond T004's m048 paragraph, whose scope statement explicitly leaves them untouched.
- **Pre-existing working-tree state:** `.project/plan/PLAN.md` carries an uncommitted edit
  correcting wave 1's GAP 1 (`reach.note` → `reach.finding`); it predates this review and is not
  this review's change.
