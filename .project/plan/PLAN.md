# PLAN — M058 tutor-routing

Milestone: tutor-routing · Branch: gsd-path/M058 · Baseline: 963729316dd33f9ce9b72964706af1b9bc5e1cd3

## Config

Project verify: `npx nx run ai-devtools-companion:build --skip-nx-cache && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html`

The build leads for the reason M054 through M057 stated: `scripts/panel-bundle-budget.test.mjs`
refuses an output older than the newest source, and this milestone edits the route table and the
loader map the artifact is built from, so a stale output is exactly what it would hit. The companion
build leads too: the verify's `npm test` leg runs `scripts/ng-context-dev-build.test.mjs`, whose
first measurement builds `ai-devtools-companion` itself, so the tree the suite measures must already
hold `packages/ai-devtools-companion/dist/index.js` — the primary carries it from its own builds and
a verify sidecar does not. `npm run check` and `npm test` are two separate commands on two separate
legs, never one token, and the trailing `git checkout` discards the working-tree diff of a file that
is a build artifact and never an edit.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Decisions recorded at plan time

These are owner decisions. They are recorded here to be executed, not re-litigated.

- D1 — four tasks in the proven shape: T001 measures what the records and the reach actually state;
  T002 is the pure join; T003 is the panel surface, the demo loader and the route pins; T004
  re-derives the recordings. Every task's `files:` stays minimal and disjoint from its siblings'
  except where a pin closure forces a shared declaration, and a file declared only because a suite
  pins it is the M057 C4 class — declared, not edited. The authored ceiling bounds where the
  records land: the surface record and the copy re-measurement are the surface task's own
  deliverables (T003), the inventory suites read the map beside the earlier ones from the wave that
  writes the map (T001), and T004 re-derives the machine-derived recordings — the verdict-claims
  record and the two gate records — with their own commands.
- D2 — held-out rows are owed for E5, E7 and E9, each naming the test file and title the owning
  task actually creates. The approved INTENT's Edge coverage marks no edge `held-out` (every
  disposition reads `criterion SCn`), and `gsd plan-lint` refuses a `## Held-out checks` table row
  for an edge the intent does not mark, so the rows are recorded as prose below — the named tests,
  titles, owners and Verify runs are all real — and lift into the table unchanged if the owner
  re-dispositions the three edges.
- D3 — `apps/angular-ai-devtools/src/app/app.routes.ts` and every suite that enumerates a route
  table are declared by the task that touches a route table: `app.spec.ts`,
  `scripts/panel-routes.test.mjs`, and the fixture's route-count pin in
  `scripts/after-render-fixture.test.mjs`. Five earlier milestones each lost a gate cycle to this
  omission. Measured at this head, the fixture pin reads the counter fixture's own table —
  `spikes/ng222-app/src/app/app.routes.ts` — so the pin's bytes cannot move when a panel surface is
  registered; it is declared and not edited.
- D4 — every task's `## Verify` runs the task's own tests, `npx prettier --check` over each file the
  task touches, and the project typecheck `npm run check`. No task defers the typecheck to the next
  task.
- D5 — every recording this change re-derives is named with its capture command. A test may read a
  recording; only an explicit armed run (`M058_CAPTURE=1 node --test …`, or the record's own
  `M044_CAPTURE` / `M056_CAPTURE` flag for the records that name those flags) writes one. New
  records are named `research/raw/m058-*.json`.
- D6 — a task's `## Verify` names only paths that exist at the milestone's layer base. Four skill
  checks landed on `main` after this branch was bound from `origin/main`, and the base does not
  move, so their paths do not resolve here; their covered modules are also none this milestone
  changes — `extension/tutor-signals.js`, `extension/tutor-foundations.js`,
  `extension/render-phase.js`, `extension/lint-core.js`, `extension/overlay.js` and
  `agent-main.js`'s `serializeGraph`. So no skill check appears in these Verifies: the rule is the
  base, not the tree at plan time. A milestone whose layer base includes those skills adds the
  skill whose covered module it changes.
- D7 — C1 governs the plan: the two absences are states, never inferences. No task, acceptance
  criterion or check requires a guard verdict or a redirect decision, because no record carries one
  (`research/raw/m041-navigation.json` `absences.guard-verdict-not-recorded`,
  `events.codes.cancellation`, `terminals.redirect.finding`).

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T002 | AC3 |
| SC4 | T002 | AC4 |
| SC5 | T002 | AC5 |
| SC6 | T001 | AC3 |
| SC1 | T001 | AC2 |
| SC1 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC6 | T003 | AC3 |
| SC5 | T004 | AC1 |
| SC6 | T004 | AC2 |

The ordering is load-bearing and not aesthetic. `scripts/navigation-blocking.test.mjs` resolves an
in-scope edge to the suite the *first* coverage row of its criterion names, and refuses a criterion
whose edges resolve to two different suites. Every criterion's first row names T002 except SC6,
whose first row names T001: SC1's edges, SC2's one edge, SC3's two in-scope edges, SC4's one and
SC5's one all resolve to `scripts/tutor-routing.test.mjs`, and SC6's one edge resolves to
`scripts/tutor-routing-shapes.test.mjs` — the same suite the held-out prose above names for E9.

## Held-out checks

D2's rows, recorded as prose because the approved INTENT marks no edge `held-out` (see D2):

- **E5** — T002 — `scripts/tutor-routing.test.mjs` — test title `held-out E5: the two absences
  stay two states on one navigation`. Ruling (SC3): both absences occur on one navigation and stay
  two states — a terminal whose `url` differs from `urlAfterRedirects` beside a stream that carries
  a `GuardsCheckEnd` renders `no-redirect-decision` and `no-guard-verdict` side by side, neither as
  the other, and the pair is never joined into one "no findings" line nor into one absent-field
  list.
- **E7** — T002 — `scripts/tutor-routing.test.mjs` — test title `held-out E7: a reused id keeps two
  decisions apart by id and route.path, never by arrival position`. Ruling (SC5): the abandoned
  `id` 2 was cancelled at 564.2 ms and its own `RouteConfigLoadEnd` arrived 1192.1 ms after that
  cancel and 314.8 ms before the successor's, so attribution is by `id` and `route.path` in each
  event's own payload, never by arrival position.
- **E9** — T001 — `scripts/tutor-routing-shapes.test.mjs` — test title `held-out E9: the Router is
  reachable from the read the agent already produces and no new tap is needed`. Ruling (SC6): entry
  2 of the 5-entry injector path, the entry whose source is `Environment Injector`, resolves to the
  instance `ɵgetRouterInstance` returns, and the record states "No new tap is needed", so the config
  half of every claim is read from a record the agent already produces.

Each named test is created by the named task with exactly that title, the task's Verify runs the
file that carries it, and the task's acceptance criteria state the edge id and this ruling. Final
review cites the recorded result of each test for its edge.

## Surface contract

### panel — T003

Criteria: SC1, SC3

Entry: the panel route `tutor-routing`, rendered through the `tutor-routing` key in `panel-demo.ts`
`LOADERS`, its sample in `FACTS`, and the `PANEL_SURFACES` entry in `app.routes.ts` that the shared
`loadPanelDemo` closure installs lazily.

States: `answered` — the answer names the class of the terminal event that closed the navigation and
the navigation `id` that event carries, and names the route node the config records by the entry's
own `path` and by the `component`, `redirectTo`, `canActivate` or `loadChildren` that entry states,
every claim carrying the event (class and `id`) and the config entry (`path`) it rests on (SC1);
`cannot-tell` — where the stream records a start and no terminal, the last event class recorded for
that `id` and nothing else; `no-guard-verdict` and `no-redirect-decision` — the two absences, each
in its own sentence, side by side where both hold, never folded into one blank answer, with a config
entry's `redirectTo` rendered as a configuration fact and `shouldActivate` never rendered as any
guard's verdict (SC3).

Walkthrough:

1. Open the panel at route `tutor-routing`: the surface answers the demo question from the two
   records the pane is handed — the recorded navigation stream (`research/raw/m041-navigation.json`)
   and the recorded router config (`research/raw/m030-router-config.json`) — by naming the terminal
   event's class and `id`, then the config entry by its own `path` and its stated fields. The
   sample is the shipped join's own answer, derived node-side, not a hand-written object.
2. Read the two absences beside a redirect-shaped navigation: the surface states
   `no-redirect-decision` (the URL change the record holds, `url` differing from
   `urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0) and
   `no-guard-verdict` (`GuardsCheckEnd`'s only guard field is the aggregate `shouldActivate`)
   as two sentences, neither as the other (SC3, E5).
3. Hand the pane a navigation the stream held at its lazy boundary — `NavigationStart` then
   `RouteConfigLoadStart`, no terminal: the surface states `cannot-tell` naming the last recorded
   class and nothing else — no destination, no route node, no cause (SC2 rendered through the same
   pane).
4. Hand it a URL no configured path matches: the surface names the segment unconfigured beside the
   paths that were compared, never resolved to the wildcard or to a `redirectTo` row (SC4 rendered
   through the same pane).

## Risks

- R1 — the line-neutral entry. Every `research/raw/m0*.json` citation into
  `apps/angular-ai-devtools/src/app/app.routes.ts` (52 at the M057 head; re-measured at T003's
  base) must resolve after the `tutor-routing` entry is added, so the entry pays for its own lines
  out of a comment line no record cites, and T003 asserts the post-edit sweep reports zero
  unresolved citations. M057's T004 needed one landing repair here; the sweep is the mechanism that
  catches the drift inside the task rather than at ship.
- R2 — the authored ceiling versus the pin closures. T003's and T004's `files:` lists exceed four
  because the route file's and the records' pin closures reach the two gate suites, the two
  inventory suites and the fixture's route-count pin. The standing repair (M057 C4) is the
  counting rule, not the plan: a suite declared only because it pins a file the task changes is
  declared, not edited, and is not work the task authors. If `gsd verify-weight` reports CHUNK for
  that class, the carve-out applies — no declaration is widened and no pin is dropped.
- R3 — the layer base bounds what a Verify may name (D6). The four skill checks landed on `main`
  after this branch was bound from `origin/main`, so their canonical paths do not resolve at this
  milestone's base, and the modules they cover are none M058 changes. The repair is the removal,
  not a widened Verify and not a moved base: no task here names a skill check. A milestone whose
  base carries those skills names the one whose covered module it changes.
- R4 — T004's ordering. One value `research/raw/m056-gate-stability.json` derives is a function of
  this milestone's own task logs (the mention count M057's C9 recorded), so the stability record is
  re-derived after this milestone's last Log byte and before the project verify, and nothing is
  re-derived after the project verify runs.
- R5 — the held-out `Test` cells use the `path::test title` form. `.project/LESSONS.md` records
  that `gsd plan-lint` strips the node id and that `check_handoffs.py plan` accepts the form; both
  gates are run on this plan before approval, and a blocker in either is fixed here, not by
  dropping the title.

## Wave 1 — measure what the records and the reach state

Goal: the milestone's answer rests on fields the records already hold and on one reach the record
already states. All of it is on disk, with citations, before anything is built on it — and the
measurement states the two absences as the vocabulary the answer will use, because no record
carries a guard verdict or a redirect decision to read (C1, D7).

Review depth: full

T001 measures statically. **The three records**, with `path:line` citations carrying each cited
line's own trimmed text and every citation re-resolved by searching its file for the exact line it
quotes: `research/raw/m041-navigation.json` — the stream's event classes with their fixed key sets
(`events.classes`, `events.enumerated`), the four terminals each carrying its own fields only
(`terminals.cancel`, `terminals.error`, `terminals.skip`, `terminals.redirect`), the held
navigation (`held.inFlight`, `held.stillInFlightLater`, `held.currentNavigation` where `finalUrl`
is absent), the superseded frame's attribution (`superseded.ordering`, `superseded.attribution` —
"by route.path in the event's own payload, never by position"), the guard-verdict absence
(`absences.guard-verdict-not-recorded` with `guardsCheckEndKeys`,
`guardFieldsAreAggregateOnly`, `refusedGuardVersusUnmatchedUrl`, `guardNamesInEitherPayload: []`)
and the reach (`reach.readFrom`, `reach.path`, `reach.note`); `research/raw/m030-router-config.json`
— the 18 configured rows and the five fields they carry (`fieldsPresent`, `config`), the
redirect-shaped rows carrying no component (`redirect`, `loop-a`, `loop-b`), and the one
`canActivate` row whose configured function is named (`gated` → `[fn redirectGuard]`);
`research/raw/m033-router-diagnostic.json` — the diagnostic names the segment it could not match
and no configured route (`ngCodedMessages`, `namesConfiguredRoutePath: false`,
`digestCarriesCode: false`), which is why the join's route half reads the config and never a
captured diagnostic (C2). **The reach**, which is the page's say and no new read:
`extension/agent-main.js:1750-1839` resolves the `Router` token from entry 2 of the 5-entry
injector path to the instance `ɵgetRouterInstance` returns, and `reach.note` states "No new tap is
needed" — recorded as the answer's only Router access (SC6, N6). It records
`research/raw/m058-record-shapes.json` with the field map, the two absences as named states, the
attribution rule and `inventory.outsideTheMap` naming the two records this milestone owes
(the surface record T003 writes, the verdict-claims record T004 writes). Because the map is
what excuses this milestone's records from the two inventories' census, T001 also edits
`scripts/tutor-answer.test.mjs` and `scripts/tutor-record-shapes.test.mjs` to read M058's map
beside M055's and M057's — each milestone's map excuses its own records, a record neither map names
still reddens, and the subtraction stays a recording's statement rather than a suite's filter.
`scripts/tutor-routing-shapes.test.mjs` parses the recording, re-checks each citation at this head,
re-derives the reach reading, and is the record's own armed writer (`M058_CAPTURE=1`, D5).
Nothing is built: no join, no surface, no route, and no page is opened.

## Wave 2 — answer from the two records, purely

Goal: one pure join reads the recorded navigation stream and the recorded router config and returns
exactly the fields the terminal event and the config entry state, the cannot-tell the held
navigation forces, the two absences as two states, and unconfigured for what no configured path
matches — with no page, no clock, no tap and no field the records do not hold, and a suite that
reddens every way the answer could lie.

Review depth: full

T002 builds `extension/tutor-routing.js` on `globalThis.angularAiTutorRouting`: the pure join
`tutorRouting(records)`, where `records` is the two records and nothing else — the recorded
navigation frames for the navigation asked about, and the recorded config rows. The answer is one
object, `{ state, question, terminal, route, absences, unconfigured, claims, detail }`:
`state` is `answered` or `cannot-tell`; on `answered`, `terminal` is the terminal event's class
with its own `id` and only that class's own fields (`url` and `urlAfterRedirects` on
`NavigationEnd`; `code`, `reason` on cancel and skip; `error`, `target` on error), `route` is the
config entry by its own `path` and the fields it states, with a `redirectTo` rendered as a
configuration fact and a `canActivate` name rendered as configuration and never as a verdict;
`absences` states `no-guard-verdict` where the stream carries no per-guard verdict —
`shouldActivate` is the aggregate and is never rendered as any guard's verdict, and a refusal is
never inferred from the terminal class — and `no-redirect-decision` where `url` differs from
`urlAfterRedirects` with zero `NavigationCancel` and no cancellation code 0, the two as separate
states that are never folded into one "no findings" answer (SC3); `unconfigured` names every URL
segment no configured path matches beside the paths that were compared, never resolved to the
wildcard or to a `redirectTo` row (SC4); attribution is by `id` and `route.path` in each event's
own payload, never by arrival position (SC5); `claims` carries one entry per rendered claim with
the artefact path that states it, in M055's answer shape. On `cannot-tell` the answer names the
last event class the stream recorded for that `id` and nothing else (SC2). The join imports
nothing at runtime, touches no filesystem, dispatches no message, holds no clock, starts no tap and
reads no page global: a bare `node:vm` context with nothing in it is enough to run it, which the
suite proves, and an answer is stable across a second read of the same record (SC1 E10).
`scripts/tutor-routing.test.mjs` pins the module and then mutates, each mutant with its own anchor
assertion: an answer with no artefact path; a terminal class the stream did not record; a route
named from the final URL; the held navigation reported as landed; a destination read from the
address bar, from `router.url` or from `currentNavigation()`; the two absences folded into one
answer; `shouldActivate` rendered as a verdict; a config entry's `redirectTo` rendered as the
redirect that decided the navigation; a path the config does not carry; an unmatched segment
resolved to `**` or to a `redirectTo` row; an event attributed to the navigation that arrived
beside it across a reused `id`; and an answer that changes on a second read. This task owns
held-out E5 and E7.

## Wave 3 — render the answer and pin the route tables

Goal: the states render on a panel surface whose sample is the shipped join's own answer over the
records T001 and T002 pin, and every suite that enumerates a route table owns the change before it
is asked, not after a landing refuses (D3).

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-tutor-routing.ts`: the display half, handed the
join's answer and rendering it — `answered` naming the terminal class and the `id` it carries and
the route node by the entry's own `path` and stated fields, each claim beside the event and the
config entry it rests on; `cannot-tell` naming the last recorded class and nothing else;
`no-guard-verdict` and `no-redirect-decision` each in its own sentence, side by side where both
hold, never folded, with `shouldActivate` never rendered as a verdict and `redirectTo` never
rendered as the decision (SC1, SC3); no field composed that the answer does not carry, and no
sentence outside a `PANE_SENTENCES` registry. It adds the `tutor-routing` key to `LOADERS` and the
sample in `FACTS` in `apps/angular-ai-devtools/src/app/panel-demo.ts` — the sample being the
shipped join's own answer over `research/raw/m041-navigation.json`'s redirect frame and
`research/raw/m030-router-config.json`'s config, derived node-side and held field-for-field by
`panel-demo.spec.ts` on every test run — and the `tutor-routing` name to `PANEL_SURFACES` in
`apps/angular-ai-devtools/src/app/app.routes.ts`. The entry costs one line and is line-neutral: it
is paid for out of a comment line no record cites, and the sweep of every `research/raw` citation
into the route file is asserted to resolve at this head after the edit (R1). It updates
`app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts` and
`panel-demo.spec.ts` with the new surface and the route count the table grows to, and it edits
`scripts/panel-routes.test.mjs`: its surface list gains the name in table order, its
surface-to-module map gains the row naming the module and the exported panel symbol, its
negative-call list gains the pane's symbol, and its removed-surface and removed-loader mutants gain
the surface, so a dropped route reddens by name. It declares `scripts/after-render-fixture.test.mjs`
and edits it not at all (D3: the pin reads the counter fixture's own table at
`spikes/ng222-app/src/app/app.routes.ts`, so this change cannot move what it asserts), and declares
`scripts/component-search.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs`,
which pin the route file as a literal and must move with it, plus the two gate suites the route
file's pin closure reaches, `scripts/gate-integrity.test.mjs` and
`scripts/gate-integrity-default-tasks.test.mjs`, editing neither. It lands a freshly built
`extension/panel/index.html` and never edits it by hand. The surface asks nothing of the inspected
page: no DOM, no page-side control, no new observer (SC6, N7). Because the surface record and the
copy re-measurement state what this wave lands, T003 also records `research/raw/m058-surface.json`
— the route, the loader key, each state with the answer field it reads and the two absences with the
sentences they render in, with the join, the display module and the two records the answer is read
from as its sources — re-measures `research/raw/m048-surface-copy.json` over every panel surface on
disk with the counts recomputed by the suite that measures them rather than typed, authors the
digest rows the new pane's sentences need in `extension/copy-digest.json` (one row per distinct
text, none duplicating a text another surface declares), and moves the copy-check fact in
`apps/angular-ai-devtools/src/app/panel-demo.ts` with the digest's count, held field-for-field by
`apps/angular-ai-devtools/src/app/panel-demo.spec.ts` and read by `scripts/copy-check.test.mjs`
with no assertion loosened and no count lowered.

## Wave 4 — repair the stale citation in the surface record

Goal: the record the copy suite re-reads states the lines the demo carries at this head, so that
suite is green at the head the project verify is asked over, and no task in the plan carries more
authored artefacts than the ceiling allows.

Why this wave exists, measured rather than feared: `gsd verify-weight` refused T004 at five authored
artefacts — four recordings and its own Log — against a ceiling of four once the stale-citation
repair was declared there, so the repair moves to T005, where one recording, the three declared
suites its pin closure reaches and the Log sit inside the ceiling, and T004 returns to its three
recordings in wave 5 behind `deps: [T003, T005]` so the project verify still runs last. The repair is
the split — never a widened ceiling and never a dropped recording: the four values T005 corrects are
why its `files:` names the record, the three suites are declared only because the closure from that
record pins them (R2's class, not authored work), and T004's `files:` loses exactly the one entry the
earlier patch added. T005 appears in no `## Intent coverage` row, and the omission is the statement:
it repairs a citation inside a record T002 and T003 read, so it owns no acceptance criterion and
claims none.

Review depth: full

T005 corrects four values in `research/raw/m048-surface.json` — `sampleFact.lineText` and
`sampleFact.holds`, and the two fields of `sampleFactComment` — from the lines
`apps/angular-ai-devtools/src/app/panel-demo.ts` carries at this head (`checked: 206`, not
`checked: 201`), writes nothing else in the record, and runs `node --test scripts/copy-check.test.mjs`
green (30 pass, 0 fail) with no assertion loosened. Its `files:` is that record beside the three
suites its pin closure reaches — `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs` and
`scripts/gate-integrity-default-tasks.test.mjs`, declared and edited not at all, which is R2's class
and not authored work — its Verify is the copy suite, `npx prettier --check` on the record and
`npm run check`, and it owns no criterion of its own: the repair is a citation, so the coverage table
above names no row for it.

## Wave 5 — the wave the repair split left open

Goal: close the one gap the wave reviews named. The repair split moved T005 into wave 4 and T004
into wave 7, which left this wave with no task, and `build_state.py` refuses a `## Wave` heading with
no task file while the same check refuses renumbering five landed task files down by one. T010
therefore does the smallest real work the milestone still owed: it asserts the panel build-output
count the signal-shape record states, which no suite read, and re-derives the two gate records its
own suite edit moves. The wave is recorded openly rather than deleted, so a later reader sees the
structure rather than inferring it.

Review depth: full

## Wave 6 — repair the four measured reds

Goal: the project verify is red at the recovery base in six failing tests across four suites, and
each failure is a state no M058 task owns. This wave repairs that state: three tasks — two greening
their own suite and one pinning the audit coverage the repair lands — each with no assertion
loosened, no expected count lowered and nothing skipped, so the final wave's verify measures a tree
the reds no longer redden.

Why this wave exists, measured rather than feared, red by red at base `50523a7d`:

- The shapes suite reddens twice. M058's join wave added a module under `extension/`, so the
  authored-file census moved 58 → 59, and this milestone's earlier waves landed two more records
  under `research/raw/`, so the recording census moved 142 → 144 (the directory holds 145; the
  recording excludes itself). The record that carries both counts is
  `research/raw/m057-record-shapes.json`, and no M058 task declared it. The repair is the
  M057-T009 remedy — re-derive the record's counts from the tree — never a loosened assertion.
- The docs-audit disposition suite reddens once, on coverage: the gate derives its inventory from
  the tracked tree, and four proof-skill documents landed under `.commandcode/skills/` after the
  audit froze, so the documents the head audit covers are no longer the documents the gate derives.
  The repair is audit rows in the document's existing shape, never an inventory carve-out and
  never a widened suite. Those rows are landed beside this plan, and nothing in the checkout reads
  them: a search of `scripts/`, `tests/`, `extension/` and `apps/` for the four skill directory
  names returns nothing, so the coverage is pinned by no suite `npm test` runs. T007 authors that
  pin.
- The held-out mutant recurses instead of refusing. The plan's `## Held-out checks` carries D2's
  rows as prose because the approved INTENT marks no edge `held-out`, so the mutant helper's
  "seed a row on its own copy" branch has no separator row to seed behind, rewrites the section to
  itself and re-enters until `Maximum call stack size exceeded`. It is red at the plain base too,
  which makes it a pre-existing suite defect this milestone is the first to expose; the repair is
  a loud refusal naming the reason, and the healthy path is proven where a table still exists.
- The budget suite reddens twice on a stale build. The held-out fixture suite T004's first verify
  leg runs rewrites and restores the route file, bumping its mtime, so `extension/panel/index.html`
  is refused as a build older than the newest source. The repair is T004's Verify leading with the
  extension build — the Config verify already performs that build; the task's Verify now does too —
  keeping every existing leg and the trailing checkout.

Review depth: full

T006 re-measures the signal-shape record: it owns `research/raw/m057-record-shapes.json` and
`scripts/tutor-signals-shapes.test.mjs`, corrects exactly the two tree-derived values the suite
re-derives (58 → 59 authored files, 142 → 144 recordings — the needle matches and every other
derived value are measured unchanged), and greens the suite 19/2 → 21/0. T007 pins the proof skills
in the audit: it authors `scripts/prove-skills-audited.test.mjs` — one reader, one coverage check,
three cases — which reads the docs audit and asserts each of the four proof-skill documents
(`.commandcode/skills/prove-join-absence-folding/SKILL.md`,
`.commandcode/skills/prove-console-cannot-tell/SKILL.md`,
`.commandcode/skills/prove-overlay-observer-purity/SKILL.md`,
`.commandcode/skills/prove-graph-serialize-closure/SKILL.md`) is named as a `## Doc:` heading or as
a `## Descriptive docs` entry, and asserts the Summary's descriptive count equals the number of
entries that list carries (5 at this head); its mutant removes one skill from a copy of the audit
held in memory and reddens naming that skill, so the pin is proven able to fail. It is a pin and not
an audit edit: the rows are landed, `check_docs_audit.py` passes over them, the suite opens the
document for reading only, and no task here may declare a `.project` path in `files:` — `approve
--kind plan` refuses that outright. T008 refuses a held-out mutant the plan cannot seed: it owns
`scripts/navigation-blocking.test.mjs`, makes the helper fail loudly naming the reason (the plan's
`## Held-out checks` carries no table seedable row) where it used to recurse, keeps the seeding
branch working where a table exists, and pastes the new message into its Log from the run against
the prose-only plan. One measured dependency is recorded, not silently absorbed: the recording
census is a function of the record set, so the verdict-claims record T004 writes lands one more
recording after this repair and moves the census again — the same one-value re-derivation applies at
the shipping head, the M057-T009 remedy applied where M057 applied it, and T006's task records the
dependency so the landing is not read as drift. Each task also declares the pin closure its change
reaches, edited not at all — the gate suites and the record-reading suites their changed files'
literals name, R2's class. T007's change is one new suite that nothing pins, so its `files:` is that
suite alone and its dependency is the wave's common one, `deps: [T003]`; the closures T006's and
T008's changes reach share the gate suites, so T008 carries `deps: [T003, T006, T007]` — a shared
declared file is serialized by a dependency, never left racing in one wave. T007's suite names one
`.project` path, and the reference that adds is enumerated by the gate-integrity suite into the gate
record T004 re-derives, which is T004's declared row and not a file T007 declares.

## Wave 7 — the records, the gate and the project verify

Goal: every machine-derived record this milestone's suites move is re-derived with its own command
at the head that ships, the inventories already excuse this milestone's records through the map
T001 wrote and the two inventory suites it edited, and the project verify runs last with nothing
re-derived after it.

T004 runs behind the repair wave (`deps: [T003, T005, T006, T007, T008]`), so the four measured
reds are green at the head it measures.

Review depth: full

T004 re-derives, each by its own stated command and no other:
the milestone's verdict-claims record via `set "M044_CAPTURE=1"&& node --experimental-strip-types
--test "scripts/navigation-blocking.test.mjs"` — the command the record itself states;
`research/raw/m044-gate-shapes.json` via its own armed capture; `research/raw/m056-gate-stability.json`
via `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`, **last**, after
this milestone's last Log byte, because one value it derives is a function of this milestone's own
task logs (R4). A second armed run of each changes no byte. It edits
`scripts/gate-integrity.test.mjs` only where its suite-diff reason table demands it — one declared
row per suite this milestone added, written from the suite's own reading — declares its
default-tasks sibling and edits it not at all, and declares `scripts/gate-stability-record.test.mjs`,
the suite whose record it re-derives. The surface record, the copy record, the digest and the two
inventory suites are T003's and T001's landed deliverables and are re-read here, not re-authored.
Then it runs the project verify's remaining legs as the last action and re-derives nothing after
it: `npm run check`, `npm test`, and the checkout that discards the working-tree diff of a build
artifact — the companion and extension builds lead the Config project verify at ship, and this
task's Verify leads with the extension build for the reason the repair wave measured: the held-out
fixture suite its first leg runs rewrites and restores the route file, and the bumped mtime makes
`npm test`'s own budget leg refuse the artifact T003 landed as a stale build, so the build is
re-run here and the artifact it writes is what `npm test` measures, before the checkout discards
the working-tree diff.

## Wave 8 — re-measure the census and run the project verify

Goal: the recording census the shapes record states is a function of the record set, and T004's
capture moves it, so the census is re-derived after that capture and before the project verify, and
the project verify runs last over the head that ships with nothing re-derived after it.

Why this wave exists, measured rather than feared: `research/raw/m057-record-shapes.json` counts
the JSON recordings under `research/raw/` excluding itself — 144 at this head, where the record
still states 142 until T006 re-derives it. T004's capture writes the verdict-claims record, one
more recording, so the census measures 145 at the head T004 leaves and
`scripts/tutor-signals-shapes.test.mjs` reddens again — at the head that ships. T006's
re-derivation runs before T004's capture and cannot see the moved count, and T004 cannot own the
repair: its four recordings plus its own Log are five authored artefacts against `verify-weight`'s
ceiling of four. The ordering is the repair, never a widened ceiling and never a dropped recording:
T004 stays wave 7 and loses the project-verify half — its Verify keeps the nine-suite leg, the
formatting check, the typecheck and the trailing checkout, and drops the build leg and `npm test`,
both of which move here — and the re-derivation becomes this wave's task, T009, behind
`deps: [T004]`, owning the census record, the shapes suite it greens (declared, edited not at all)
and the build artifact the verify rebuilds, with whatever pin closure the lint demands declared and
never edited. T009 is the milestone's last task and the one that proves the tree ships green: it
re-derives the census record after T004's capture, runs the shapes suite green, and then runs the
project verify — the extension build, `npm run check`, `npm test` and the trailing checkout — as
its last action, with nothing re-derived after it.

Review depth: full
