# Synthesis — M043 stability-explainer

> **Authored at archive time — no research phase and no decide phase ran for this milestone.**
> M043's intent declares `Lane: standard` (`INTENT.md:3`), but the standard lane's research and decide
> phases were not executed: the `## Log` in `.project/STATE.md` runs inspect → define → plan → build for
> this milestone with **no** `research` and **no** `decide` entry between the inspection that closed on a
> measured delta (`STATE.md:851` `inspect — router bound next milestone`, `:852` `inspect — inspection
> complete; intent next`) and the plan's approval (`STATE.md:857` `plan — plan approved`). The seven lines
> after that inspection are `:853` `define — inspection complete; intent next`, `:854` `define —
> pre-approval: {"kinds": ["intent", "plan", "rulings", "ship"]}`, `:855` `define — milestone intent
> approved`, `:856` `plan — planning started`, `:857` `plan — plan approved` and `:858` `build — build
> started`. `git ls-tree -r HEAD -- .project/research` lists exactly two files — `DOCS-AUDIT.md` and
> `INSPECT-DELTA.md` — none of them a synthesis and none of them a research manifest. This file was not
> produced by a research or decide phase: it is the one artefact the archive requires
> (`PLAN.md` wave 4, `T004` AC8) and no build task before this head could write.
>
> It **synthesises only artefacts that already existed** — `.project/intent/INTENT.md` and its six
> `## Corrections`, `research/INSPECT-DELTA.md`, `research/DOCS-AUDIT.md`, `.project/plan/PLAN.md`, the
> four task files under `.project/tasks/`, the recording `research/raw/m043-stability.json`, the claim
> list `research/raw/m043-verdict-claims.json`, the three landed suites
> (`extension/stability-narrator.test.mjs`, `scripts/panel-stability.test.mjs`,
> `scripts/stability-measure.test.mjs`) and `.project/build/verify-ledger.jsonl` — and **claims no
> independent research**. Nothing below was measured, read or decided by a research or a decide phase.
> The milestone's measurements are the build's own: T001's four readings, T002's join, T003's pane and
> T004's two-page session. Where a fact is not in those artefacts, this document says so instead of
> supplying one.
>
> Two things a reader should know before reading the per-wave account. `.project/review/` does not exist
> at this head, so no reviewer's reading is quoted below: the account is drawn from the four task files'
> own `## Log` entries and the ledger's three rows. And the roadmap entry's `Open questions: none`
> (`ROADMAP.md:1588`) is not this milestone's state: the intent carries three `[RESEARCH]` questions
> (`INTENT.md:245-256`) and the plan carried all three into build unanswered (`PLAN.md` wave 1). The
> plan's config (`PLAN.md:9-12`: `max_review_cycles: 3`, `wave_budget: none`, `review_panel: full`,
> `finding_skeptics: on`) matches the intent's `Review panel: full` and `Finding skeptics: 2`
> (`INTENT.md:6-7`) in kind, so there is no divergence to report here — only the absence of the reviews
> themselves.

## Settled

The roadmap entry is "Build the stability explainer: why the app is not stable, and what is still
outstanding" (`ROADMAP.md:1563`), `Depends on: [M020]`, `Programme: core · Batch: 3 · Group:
@angular/core`, `Surfaces: panel` (`:1564-1566`), with three scope-in bullets — "pending tasks, in-flight
requests and unsettled resources" (`:1572`), "each outstanding item joined to the component or service
that owns it" (`:1573`), "the panel surface rendering what is outstanding and the first item to settle"
(`:1574`) — and three success criteria (`:1583-1585`). Its risk line is one sentence: "stability read
from a quiet interval is not stability; the observable must come from the reported work" (`:1587`).

Gate inspection measured what a running page can answer before any plan was written
(`research/INSPECT-DELTA.md:129-352`), and the intent is written against its ruling rather than against
the roadmap's sentence (`INTENT.md:12-18`). The ruling, in the intent's own summary
(`INSPECT-DELTA.md:346-352` as the intent quotes it, `INTENT.md:170-172`): **whether** the app is stable
is observable, **when** it settled is observable and has never been read, **why** it is not and **what is
outstanding** are not. Four measurements carry that:

- `ApplicationRef.isStable` is `hasPendingTasksObservable.pipe(map(pending => !pending))`
  (`_debug_node-chunk.mjs:13221-13222`), backed by a `BehaviorSubject` that flips on the first `add()`
  and the last `remove()` (`_pending_tasks-chunk.mjs:2296-2322`), and it is reachable through the injector
  walk the agent already performs for `Router` (`extension/agent-main.js:1765-1784,1808-1819` before this
  milestone's own edits).
- `isStable` carries no reason: 24 debug keys on the 22.1.8 install and 25 on 22.2.2, the whole delta
  being `toggleWatchSignal`, with `getDirtyComponents` absent from both (`INTENT.md:30-34`).
- `PendingTasksInternal.pendingTasks` is a `Set<number>`, `add()` takes no descriptor, and the public
  surface holds no count, list, kind or owner (`INTENT.md:35-42`). The one ownership surface is the
  application's own opt-in, `provideStabilityDebugging()` (`core.mjs:686-724`), which console-debugs a
  creation stack after `APPLICATION_IS_STABLE_TIMEOUT - 1_000` ms and only for an app that asks.
- No insertion timestamp crosses any API and no settle-time field exists anywhere, so a per-item order
  cannot be read (`INTENT.md:43-45`).

The intent therefore narrowed the roadmap's sentence to **whether** the app is stable, **when** it
settled and **which work ran** (`INTENT.md:65-68`, `159-172`), and settled six things in `## Corrections`
rather than by silently editing the criteria: the narrowing itself (`:159-172`); that "what is still
outstanding" becomes the named absence `no-outstanding-inventory` (`:174-184`); that "the first item to
settle" becomes `no-settle-order` while the application's own settle time stays observable (`:186-191`);
that "unsettled resources" is M036's and per-frame work read as cost is M040's, so neither is re-scoped
(`:193-200`); that the premise's positive half is already installed — `LoadingResource`'s loader returns
`new Promise<never>(() => {})` (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`), so
`/resource-states` is unstable for the page's lifetime with no fixture change (`:202-211`); and that the
roadmap's risk line is a measurement of the shipped agent's own shape, which is why SC6 is its own
criterion rather than a clause of SC1 (`:213-219`).

## What was known before planning

`research/DOCS-AUDIT.md` is the audit in force, and `research/INSPECT-DELTA.md` is the measured delta the
inspection closed on: 152 audited documents, 19 of them changed since `c9451b1`, 411 non-audit paths, and
the delta records its own limit at `:31-34` (`STATE.md:842`; `INTENT.md:14-18`). Both are inspection
artefacts; neither is a research manifest.

The three `[RESEARCH]` questions the intent carried (`INTENT.md:245-256`) were not answered before
planning and were not answered by a research phase at all:

1. is the Insurance Portal's zoneless target permanently stable, so that SC1's unstable half is only ever
   measured on the counter fixture;
2. does one subscription taken through the `isStable` getter stay current through later `add()`/`remove()`
   flips, given the getter builds a new `map` pipe per access;
3. which fixture route can produce an unstable-to-stable transition without a fixture change, and if none
   can, does SC2's positive half need one.

Two of the three were settled during build by measurement and one was not. The currency question was
answered by T001 driving the installed 22.2.2 `PendingTasksInternal`: one subscription read `true` at
subscribe, `false` across two adds and `true` again after the last remove, twice over, because the stream
underneath is a `BehaviorSubject`. The reach question was answered the same way, on a subject whose
provider records carry `ApplicationRef` and on one whose records do not. The transition question was
answered negatively and is the milestone's first non-settlement, below. The first question — the portal's
own stability — is still open at archive time and is the second non-settlement.

## The shape the plan chose

Four waves, four tasks, one task per wave, `max_review_cycles: 3`, `wave_budget: none`, and the full review
panel with finding skeptics on (`PLAN.md:9-12`). Wave 1 measures the four facts the plan depends on
*before* anything answers for them, and publishes the read on the record the agent already dispatches, so
"every later task quotes a reading rather than the intent's sentence" (`PLAN.md` wave 1). Wave 2 is one
pure function over that record — "that is what makes the eight held-out pins provable against recorded
frames instead of against a page, and what keeps the pane a view" (`PLAN.md` wave 2). Wave 3 is the panel
surface plus every pin a route registration moves, declared up front because "registering the route is
where earlier milestones lost a gate cycle" (`PLAN.md` wave 3). Wave 4 re-captures behind an opt-in switch,
adds the claim list the overlay suite resolves this milestone through, drives the two-page half and closes
the gate (`PLAN.md` wave 4).

The held-out edges are distributed by criterion: E1, E2, E3, E5, E6, E7, E8 and E10 are wave 2's, E9 is
wave 3's, E11 is wave 4's, and E4 and E12 are `criterion`/`dismissed` dispositions rather than held-out
(`INTENT.md:91-102`). The six prohibitions N1–N6 mirror the six criteria one for one
(`INTENT.md:106-113`), and the panel is the only surface (`INTENT.md:7`).

## What the build measured, wave by wave

- **Wave 1 (T001)** — four readings, each derived in-realm from the artefacts in the checkout and none
  quoted from memory. The reach: the shipped `extension/agent-main.js` was booted and its own five-step
  walk driven on a subject whose provider records carry `ApplicationRef` (answering
  `reachedBy: "ApplicationRef"`, one getter read, one subscription) and on one whose records do not
  (answering `reachedBy: null`, `absence: "no-stability-observable"`, `state: "cannot-tell"`, and `null`
  for the attach reading it never took). The currency: driving the installed 22.2.2 tracker showed one
  subscription staying current, `true → false → false → false → true` across subscribe, two adds, one
  remove and the last remove, and again on a second flip. The page: `/resource-states` is unstable for
  its lifetime, quoted from the fixture's own loader (`resource-states.ts:61`) and from the resource
  class's `add()`/`remove()` sites (`_resource-chunk.mjs:404`, `:463`). The record: a `stability` section
  of seven fields sits after `boundary` and before `checks` in both the frame record and the initial
  snapshot, armed from `start()`'s install path and never from inside the profiler callback, and removed
  by `reset()` with its subscription. 14 tests in `scripts/stability-measure.test.mjs`, four named
  mutants, 327 node tests across the twelve declared suites, `npx nx run angular-ai-devtools:test` at 31
  files / 346 tests, and a default run writing nothing (`T001` Log; ledger row at `113d692c`).
- **Wave 2 (T002)** — `extension/stability-narrator.js`, the pure join: `stability(record)` answers
  `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` and reads no clock, no
  DOM, no page and no second tap. The state is the recorded emission's own value, the record's own absence
  word decides `cannot-tell`, and a record that published no emission is `idle` rather than `stable`. The
  settle interval is `settle.at` minus `attachAt`, both of which the page published, so the recording's
  transition frame answers `settled at 1008 ms, 7 ms after attach` and a page already stable at attach
  answers `0` — a number, never the absence. The repeated work is one pass per start/end pair in the
  frame's own `events`: `TemplateUpdate app-root: 2 passes` from one `checks` row holding `[2,3,2,3]`,
  and `ChangeDetection no component: 2 passes` from four entries carrying `componentName: null`. 13 tests,
  15 mutants, each reddening its pin by string (`T002` Log; ledger row at `e4421832`).
- **Wave 3 (T003)** — `apps/angular-ai-devtools/src/app/panel-stability.ts`, the display half: three
  blocks in one order (the state and its emission, the settle reading or its absence, one line per pass),
  each named absence in its own block and its own sentence, and `no-stability-observable` rather than an
  empty table or an em dash for a page with no answer. The `/stability` route appends to
  `apps/angular-ai-devtools/src/app/app.routes.ts` through the shared `loadPanelDemo` loader, and the
  demo's sample fact is the join's own answer for the recording. Initial total measured after the entry:
  535.067 kB against the recorded 535.44 kB baseline. Seven suites at 75 tests, `npx nx run
  angular-ai-devtools:test` at 347 passing, nine real mutants in `scripts/panel-stability.test.mjs` and
  held-out E9 proven non-vacuously in `panel-demo.spec.ts` (`T003` Log; ledger row at `ddb91a1a`).
- **Wave 4 (T004)** — this wave, and its own record is this head. Three deliverables and one gate. The
  claim list rules all six criteria and quotes each character for character (754, 604, 566, 685, 540 and
  656 characters, 3,805 quoted characters), and the quotation is produced by
  `scripts/overlay-verdict-claims.test.mjs`'s own `intentCriteria` routine — extracted from that file and
  run over the intent, so no criterion is retyped and the two suites cannot drift apart. The capture suite
  is opt-in behind `M043_CAPTURE=1`; a default run prints the recording's sha256 at load
  (`3b0cfc3a69778cfd6e361eb729130a63c7220f7c95bfd400caa40082c0d8fdfa`, 24,652 bytes) and after the run,
  asserts they are equal, names the one file an armed run would write and proves from its own source that
  it spawns nothing, writes nothing and names no browser or port. Armed, T001's derivation — which owns
  every section — is run twice at this head and produced the same bytes both times. E11 is the suite's
  own: two pages in one session, one whose last pending task ends after attach and one whose never does,
  each answering through the shipped join with its own state and its own settle reading, and the mutant
  that shares the two pages' listener list reddens the attribution pin by name.

## The measured outcome

The claim list rules every criterion `not-required`: `ruling.required` is 0 and `ruling.notRequired` is 6,
with the reason stated in the file rather than left to silence — a required row must name the driver a
`control-ai-browsers run` expression takes to the wave gate, and that driver must return the overlay's four
readings (`toolElements`, `drawnRect`, `descriptor`, `noDevContext`) with the rows together citing three of
them, because that is the reading set the one driver in this repository produces
(`research/raw/m043-verdict-claims.json`, `ruling.why`). None of a stability claim's facts is an element's
rect or dev context, and a stability driver does not exist in this repository; naming the overlay driver
would make the gate return overlay measurements for stability criteria, which is the re-cut N6 forbids.

- **SC1** (754 characters) — the state is reported from the page's own `isStable` emission, reached by the
  agent's own injector walk and from nothing else, with `no-stability-observable` for a page that exposes
  no reachable `ApplicationRef`. Proven by `node --experimental-strip-types --test
  "extension/stability-narrator.test.mjs"` (E1, E2) against `research/raw/m043-stability.json`'s
  `reach.walk` and `reach.subjects`, and by `node --experimental-strip-types --test
  "scripts/stability-measure.test.mjs"`.
- **SC2** (604 characters) — the settle time is the difference of two readings the page published or the
  named absence `no-settle-observed`, with a measured `0` kept as `0`. Proven by the narrator's E3 and by
  `node --experimental-strip-types --test "scripts/stability-capture.test.mjs"` (E11), against the
  recording's three settle shapes (`transition.subjects`, `transition.alreadyStableAtAttach`,
  `transition.answer`).
- **SC3** (566 characters) — the repeated work is the frame's own `events` list: two passes over one
  component from two `TemplateUpdate` pairs in one `checks` row, and a second `ChangeDetection` pass
  attributed to no component, with no cycle and no outstanding-work count anywhere. Proven by the
  narrator's E5 and E6 and by `scripts/panel-stability.test.mjs` against `repeats.templateUpdate` and
  `repeats.changeDetection`.
- **SC4** (685 characters) — the cause, the outstanding inventory and the settle order are
  `no-cause-reported`, `no-outstanding-inventory` and `no-settle-order`, each its own name and its own
  sentence, and nothing is filled from a task id, an epoch delta, a signal-graph label, a component name
  or an opted-in creation stack. Proven by the narrator's E7 and E8 against the recording's `absences`
  block and the chunk anchors it quotes.
- **SC5** (540 characters) — the pane renders the three readings in three blocks and each named absence in
  its own sentence, registered at `apps/angular-ai-devtools/src/app/app.routes.ts:167` through the shared
  loader, and renders nothing else. Proven by `node --experimental-strip-types --test
  "scripts/panel-stability.test.mjs"`, `scripts/panel-routes.test.mjs` and `npx nx run
  angular-ai-devtools:test` (held-out E9 in `panel-demo.spec.ts`).
- **SC6** (656 characters) — stability is a measurement and never the absence of a report: `idle` and
  `cannot-tell` are states of their own, `stable` is reachable only from an emission whose value is `true`,
  and two pages in one session each keep their own answer. Proven by the narrator's E10 and by
  `node --experimental-strip-types --test "scripts/stability-capture.test.mjs"` (E11).

The three landed commits before this task's are `113d692c`, `e4421832` and `ddb91a1a`, and
`.project/build/verify-ledger.jsonl` holds a `"result": "pass"` row at each. The project gate itself is
`npm run check && npm test`, recorded in T004's Log and in the same ledger rather than claimed here.

## What this milestone did not settle

**`transitionProducible: false`.** No inspected subject ends its last pending task after attach. The
recording answers `no-transition-observed` and `producedOnAnInspectedPage: false`
(`research/raw/m043-stability.json`, `transition.answer`), so **SC2's positive half is unproven on a page**:
what is measured is the mechanism, not a transition. The mechanism is real and driven — one subscription,
working the installed tracker through `true → false → true` — and a page that released its last task while
the read was attached would produce the change. What no page in this checkout does is release one:
`/resource-states` cannot (its loader returns a promise nothing resolves), and it is the only page-shaped
subject here. The three drives the recording names would settle it (`transition.wouldNeed`), and the
fixture change that would be easiest is the one the task's acceptance criteria forbid. A page already
stable at attach settles *at* attach — `sinceAttachMs: 0` — which is a reading and never a transition, and
the join says so out loud instead of presenting the zero as one.

**The Insurance Portal's zoneless target may be permanently stable, and nobody has read it.** The intent's
first `[RESEARCH]` question is unanswered at archive time (`INTENT.md:247-249`). M040 measured the portal's
zoneless checkout as the one place a profiler stream exists (`m040-work-events.json`,
`witness.portalZonelessAttempt`); this milestone never drove it, and no row of the claim list claims it did.
If that target is permanently stable, the unstable half of SC1 is only ever measured on the counter fixture
and a portal drive would return `no-settle-observed` where SC2 wants a transition — which is an answer, but
not the one the criterion's positive half needs. What this milestone can say is what the surface says on
such a page: `stable` from its own emission, and `no-settle-observed` beside it.

**The two-page session is two realms, not two browser tabs.** E11 asks for "two pages in one browser
session". `scripts/stability-capture.test.mjs` drives two `node:vm` contexts in one process — each with its
own `ng`, `document`, clock and record list — because that is the two-page session this repository can drive
with no browser, no server and no port, and because the fact the criterion is about (no emission of one
page attributed to another) is a property of two page realms rather than of two tabs. The suite says so in
its own header, its gate pin proves it names no browser driver, and the difference is named here rather
than hidden behind the word "session". A browser-tab drive of the same two subjects is not proven.

**The absence the surface cannot fill.** Three of the milestone's answers are permanent by construction,
and no later task in this milestone can turn them into readings: `no-cause-reported` (the getter is a
boolean map), `no-outstanding-inventory` (`PendingTasksInternal` holds a `Set<number>` whose `add()` takes
no descriptor) and `no-settle-order` (no timestamp and no settle time crosses any API). An application can
opt into `provideStabilityDebugging()` and get a creation stack on the console; this milestone neither
recommends it nor reads it, and the surface stays `no-outstanding-inventory` on such an app (E8). A fourth,
`no-stability-observable`, is filled only by a page that exposes a reachable, subscribable
`ApplicationRef` — and never by a zero count.

**A live page was never driven.** The recording's own `doesNotSettle` names four things this build did not
settle: what a live `/resource-states` emits (the state is read from the fixture's loader and the installed
resource class and the record the agent answers for it is derived, not observed); which task id that page
holds open; whether a later 22.x keeps `hasPendingTasksObservable` a `BehaviorSubject`, which is what makes
one subscription sufficient; and what the read answers on a page that destroys its application. The panel
surface is registered, measured against its bundle budget and pinned against the recording, but this
milestone produced no `lars-verify` verdict for it and drove no browser, so the route is proven by suites
and not by a live panel session.
