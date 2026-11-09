# Synthesis — M042 error-boundary

> **Authored at archive time — no research phase and no decide phase ran for this milestone.**
> M042's intent declares `Lane: standard` (`INTENT.md:3`), but the standard lane's research and decide
> phases were not executed: the `## Log` in `.project/STATE.md` runs inspect → define → plan → build for
> this milestone with **no** `research` and **no** `decide` entry between the inspection that closed on a
> measured delta (`STATE.md:842`, `2026-11-09 — inspect — inspection closed by measured delta: 19 of 152
> audited documents changed since c9451b1, 411 non-audit paths`) and the plan's approval (`STATE.md:846`).
> The five lines after that inspection are `define — definition started` (`:843`), `define — milestone
> intent approved` (`:844`), `plan — planning started` (`:845`), `plan — plan approved` (`:846`) and
> `build — build started` (`:847`). `git ls-tree -r HEAD -- .project/research` lists exactly three files —
> `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `s10-answer.md` — none of them a synthesis and none of them a
> research manifest. This file was not produced by a research or decide phase; it is the one artefact the
> archive requires and no build task before this head could write.
>
> It **synthesises only artefacts that already existed** — `intent/INTENT.md` and its five `## Corrections`,
> `research/DOCS-AUDIT.md`, `research/INSPECT-DELTA.md`, `research/s10-answer.md` (the S10 gate answer),
> `plan/PLAN.md`, the six task files under `.project/tasks/`, the recording `research/raw/m042-error-boundary.json`,
> the claim list `research/raw/m042-verdict-claims.json` and `.project/build/verify-ledger.jsonl` — and
> **claims no independent research**. Nothing below was measured, read or decided by a research or a decide
> phase. The milestone's measurements are the build's own: T001's three readings, T002's drive of the guarded
> epoch map, T003's record and T006's two-subject capture. Where a fact is not in those artefacts, this
> document says so instead of supplying one.
>
> One divergence is reported rather than smoothed over: `PLAN.md:11-12` records `review_panel: off` and
> `finding_skeptics: off`, while the intent asks for `Review panel: full` and `Finding skeptics: 2`
> (`INTENT.md:6-7`). M041's archive carries the same divergence, and it is stated here because a reader of
> the archive will look for a panel's files and find none: the per-wave account below is drawn from the task
> files' own `## Log` entries and the ledger's eight rows, not from a reviewer's reading.

## Settled

The roadmap entry is "Build the error-boundary explainer: why this error reached the boundary that caught it,
and what it replaced", `Depends on: [M020]`, `Programme: core · Batch: 3 · Group: @angular/core`,
`Surfaces: panel`, `Gate: S10` (`ROADMAP.md:1530-1539`). Its three success criteria are the roadmap's
(`ROADMAP.md:1552-1555`) and its own open question is S10's (`ROADMAP.md:1558`). S10 ran before this
milestone and its answer — `.project/research/s10-answer.md`, dated 2026-11-09 — is what the intent is
written against; the intent says so and does not re-derive it (`INTENT.md:12-16`).

The intent settled five things before planning, in `## Corrections` rather than by silently editing the
criteria (`INTENT.md:124-165`). **The roadmap's "subtree it replaced" has no observable** (`INTENT.md:126-133`):
`LBoundary` holds `error` and its host LView only, the primary view is removed (`dom.primary: false`) and no
node record of it survives, so SC4 makes that half cannot-tell with `no-replaced-subtree` while SC1 keeps the
half that *is* reachable — `declarationType: "S10Child"` with `boundaryType: "S10Parent"` in one
`onViewError` call. **The premise the roadmap states is not the subjects' state** (`INTENT.md:135-142`): the
portal checkout declares 0 `provideBrowserGlobalErrorListeners()`, 0 `ErrorHandler` subclasses and 0 boundary
directives, its whole provider list is `apps/insurance-portal/src/app/app.config.ts:23-39`, and the handler it
resolves is the stock `_console`-only class with no `onViewError` — so a `@boundary` in `spikes/ng222-app` is
the only way SC1's positive half has a subject. **A defect in our own instrument** (`INTENT.md:144-150`): the
shipped extension threw `TypeError: Invalid value used as weak map key` at `extension/agent-main.js:1034`
(`prevEpochs.set(instance, next)`) twice per page, landing in the app's `ErrorHandler` and in `window.onerror`,
which SC6 requires absent *together with* the epoch record still doing its work (N6). **The two `details`
shapes bound what a record may assume** (`INTENT.md:161-165`): the construction catch and the
`detectChangesInView` catch pass different fields, so SC1 and SC2 read whichever a record carries and require
neither the union. **The version caveat became an obligation** (`INTENT.md:152-159`): this repository installs
22.1.8 while the targets run 22.2.2, so the surface must declare the version it works against and answer
cannot-tell — never an empty boundary list — on a core that carries none of the machinery.

## What was known before planning

`research/DOCS-AUDIT.md` is the audit in force: 340 verified, 16 stale, 0 aspirational, 217 unverifiable and 1
descriptive document, audited at `c9451b1527ae90753315edacd43a30abd2187c6c` on 2026-11-05 with
`Alignment mode: no` (`DOCS-AUDIT.md:3-15`). `research/INSPECT-DELTA.md` is a measured delta, not a re-audit:
152 audited documents, 574 audit rows in force, 430 paths changed since the base, **19 audited documents
changed**, 411 non-audit paths, +99,140 / −1,448 lines (`INSPECT-DELTA.md:21-29`), and it records its own limit
— the seven documents `302fd62` added are both audited and new, and that is the one cell where "changed"
means "new" (`:31-34`).

`research/s10-answer.md` is the gate's answer and the intent's foundation: the two generic surfaces that carry
a caught error (`onViewError(error, {declarationType, declarationInstance, caughtBy, boundary: {type, reset}})`
on the resolved `ErrorHandler`, and `ng.getContext()` inside the rendered `@error` view answering
`{$error, $reset}`), the `window.ng` key list with 0 error-shaped keys out of 25, the boundary's retained
state, and the instrument's own throw. The recording re-quotes it with anchors and a suite holds each
quotation to the line it cites (`research/raw/m042-error-boundary.json` `hook.quotations`; the pin is
`scripts/error-boundary-measure.test.mjs`, "a quotation whose anchor no longer carries it reddens").

None of that answers the intent's three `[RESEARCH]` questions (`INTENT.md:185-191`): what the
`@boundary`-construction `details` shape carries when a view throws during creation, which fixture path can
declare a `@boundary` and provoke a throw, and whether `instance` at `extension/agent-main.js:1034` is always
an object key. All three were carried into the plan unanswered. Two were settled during build by measurement —
the construction shape by T001's chunk read (`hook.details.paths`, which carries
`declarationInstance`/`declarationType`/`boundary` and no `caughtBy`), and the key question by T001's epoch
drive plus T002's repair, which found the non-object identity in the profiler's *context* argument and not in
a node id. The third — which fixture path declares a boundary *and* throws without editing the fixture's page
components — was not needed for SC1's positive half as built, because the join was pinned against S10's
measured record rather than against a live fixture boundary, and the milestone therefore has no live
`@boundary` subject. That is stated as a limit below rather than as a settled question.

## The shape the plan chose

Six waves, six tasks, one task per wave, `max_review_cycles: 3`, `wave_budget: none` (`PLAN.md:9-12`). Wave 1
measures the three facts the plan depends on *before* any task answers for them, "so that the repair, the
record shape and the version obligation are written against readings rather than against the intent's
quotations" (`PLAN.md:14-20`). Wave 2 is the repair of the instrument's own throw and nothing else
(`PLAN.md:32-48`). Wave 3 carries the hook's record beside the two subscriptions already in the agent
(`PLAN.md:50-66`). Wave 4 is the pure join — one function over the record it is handed, "so the two types, the
error, the absences and the fallback are provable without a page" (`PLAN.md:68-84`). Wave 5 is the surface
(`PLAN.md:86-102`). Wave 6 re-captures behind an opt-in switch, rules the claims and closes the gate
(`PLAN.md:104-120`).

The held-out edges are distributed by criterion and not by convenience: E1, E2, E4, E5, E6, E7 and E8 are
wave 4's (`PLAN.md:84`), E10 is wave 6's (`PLAN.md:120`), and E3 and E11 are `criterion`-disposition rather
than held-out (`INTENT.md:65`, `:73`). E12 and E13 are T002's and every later task is told it must not redden
them (`PLAN.md:30`, `:48`, `:66`, `:120`). The six prohibitions N1–N6 mirror the six criteria one for one
(`INTENT.md:77-86`), and the panel is declared the only surface (`PLAN.md:181`).

## What the build measured, wave by wave

- **Wave 1 (T001)** — three readings, each derived in-realm from the artefacts in the checkout and none quoted
  from memory. The shipped `extension/agent-main.js` was booted and its profiler subscriber driven: a
  `TemplateUpdateStart` (value 2) whose instance is not an object opened a frame and the frame's close threw
  `TypeError: Invalid value used as weak map key` at line 1034, outside `onEvent`'s try/catch because it runs
  from a queued microtask — the page received its `angular-ai:state` and no `angular-ai:record` at all. The
  epoch map was measured in both directions so that a repair which empties or constant-folds it is contradicted
  by a moved pass (`movedOne → ["n0"]`, `movedBoth → ["n0","n1"]`, `held → []`). The hook record was re-read
  from the fixture's installed 22.2.2 and from this repository's 22.1.8: the two `details` shapes, the
  `@error` context keys `["$error","$reset"]`, `class LBoundary`'s own two fields (`hostLView`, `error`) and
  the complete absence of the machinery in 22.1.8. The version question was enumerated rather than assumed: no
  page reports its own core version (`reportedBy: 0`) and exactly one published key separates the two installs
  — 22.2.2 publishes `toggleWatchSignal`, 22.1.8 does not, 25 keys against 24 — so the discriminator is a proxy
  for the build and the surface declares `22.2.2` as a constant instead of reading a version. 29 tests, 16
  named mutants, the Verify verbatim, nothing written (`T001` Log; ledger row 1 at `e7b67d2`).
- **Wave 2 (T002)** — one guard, in the one function that owns the map's write and nowhere else: `diffEpochs`
  computes `keyed` — an object or a function, exactly the identity domain a `WeakMap` accepts — before the entry
  is read or written, and `if (!keyed) return changed;` sits above `prevEpochs.set(instance, next)`, so the map
  gets no entry for a context that cannot be a key: no epoch delta, not an empty one. Both halves of SC6 are
  driven in one suite, because either alone can be reached by trading the other away: a non-object identity
  lands its frame and throws nothing, and an object identity whose epoch moved still names that node. Eight
  suites reported 226/226 with E12 and E13 among them, `agent-main.js` and `agent-main.test.mjs` are one
  `node --check` each, and the eight declared suites are `extension/agent-main.test.mjs`,
  `extension/page-footprint.test.mjs`, `scripts/performance-measure.test.mjs`,
  `scripts/render-phase-measure.test.mjs`, `scripts/performance-capture.test.mjs`,
  `scripts/render-phase-capture.test.mjs`, `scripts/navigation-measure.test.mjs` and
  `scripts/navigation-capture.test.mjs` (`T002` Log; ledger row 5 at `92f92fd`).
- **Wave 3 (T003)** — the record, additively: `extension/agent-main.js` gains one `boundary` section between
  `routerEvents` and `checks` in both the frame record and the initial snapshot, and one hook installed on the
  resolved `ErrorHandler` instance — chained, never replacing the app's own — beside the profiler and router
  subscriptions. One entry shape for every arrival, `route` read off the payload rather than mapped, every
  field the record did not carry `null`, and `cause` present only where the boundary wrapped a value that is not
  Error-like. `globalListeners` is the walk's own answer, `declared` or `no-global-error-listeners`, and `null`
  where the page publishes no reader at all. 241/241 across the eight suites, 15 of them new, with E12 and E13
  still green (`T003` Log; ledger row 6 at `022cdd5`).
- **Wave 4 (T004)** — `extension/error-boundary.js`, the pure join: `readErrorBoundary(record)` answers
  `{ state, absence, findings, absences, version, coreVersion, fallback }` and mints nothing. A finding carries
  nine fields and no tenth — the declaring type from `details.boundaryType`, the throwing type from
  `details.declarationType`, `caughtBy` and the reset as `true`-or-`null`, the error's own name and message,
  its cause only on the wrapper, the route, and `no-replaced-subtree` as the replaced subtree — so no node, tag,
  text or count of the primary view can appear in one. Its suite derives every measured input from the
  recording's own `hook.quotations` instead of restating it. E1, E2, E4, E5, E6, E7 and E8 are pinned there
  (`T004` Log; ledger row 7 at `7ceb997`).
- **Wave 5 (T005)** — `apps/angular-ai-devtools/src/app/panel-error-boundary.ts`, the display half and nothing
  else: `errorBoundaryPanel(answer)` is handed T004's own answer and answers `{ state, kind, message, lines,
  text, cells }`, one line per fact the answer carried and each cell its own state's text or the empty string.
  The registration is one route entry through the shared loader M041 introduced, so no fourteenth copy of the
  closure exists and the lazy boundary stays single. Its suite runs the shipped join in a bare `node:vm`
  context over records built from the recording and feeds the answers into the pane, so the two halves are
  pinned against each other rather than against a copy (`T005` Log; ledger row 8 at `d4bffc9`).
- **Wave 6 (T006)** — this wave, and its own record is this head. Three deliverables and one gate. The claim
  list rules all six criteria and quotes each character for character
  (`research/raw/m042-verdict-claims.json`: 506, 572, 248, 286, 489 and 459 characters, 2,560 quoted
  characters). T001's measurement suite was **re-cut** rather than patched: it anchored
  `var prev = prevEpochs.get(instance);`, which T002's guard had replaced with
  `var prev = keyed ? prevEpochs.get(instance) : null;`, so 22 of its 29 tests reddened on a guard that made
  the milestone's own criterion true. The pin is now the property — the epoch delta is read for a keyed
  identity and skipped for a non-keyed one, measured by driving four non-keyed identities through two passes
  and requiring nothing named, with the keyed identity beside them still naming `n0` — plus a structural anchor
  on the function that owns the map's write, so a future guard rewrite cannot invalidate it again. The
  recording was re-captured in its new canonical form and its new `instrument.repair` section holds both
  halves. The capture suite owns the two-subject half: one raw `TypeError` driven through the shipped agent on
  a subject whose injector carries the global-listeners record and on one whose injector does not, with the
  rendered finding through the handler on the first and `no-global-error-listeners` on the second.

## The measured outcome

The claim list rules every criterion `not-required`: `ruling.required` is 0 and `ruling.notRequired` is 6,
with the reason stated in the file rather than left to silence — "A required row must name the driver a
control-ai-browsers run expression takes to the wave gate, and that driver must return the gate's four
readings … a boundary driver does not exist in this repository and this task may not add one"
(`research/raw/m042-verdict-claims.json`, `ruling.why`). The portal is not lost by that ruling: it is the
subject on which every positive half of this milestone is an absence, and the recording, the join and the pane
are what turn those absences into answers.

- **SC1** — the two component types are two facts, read from the boundary's own field and the declaration the
  catch carried and from nowhere else, reported beside `caughtBy` and a reset that is available only where the
  record carries one; a subject that declares no boundary is cannot-tell with `no-error-boundary-declared`,
  naming no boundary, no declaring component and no reset. Proven by `extension/error-boundary.test.mjs` E1 and
  E2 and by `scripts/panel-error-boundary.test.mjs`, against the two `details` shapes in
  `m042-error-boundary.json` (`hook.details.paths`, `hook.details.measured.keys` =
  `declarationInstance, declarationType, caughtBy, boundary`).
- **SC2** — the error is the thrown value's own `name` and `message`, with `cause` only on the boundary's
  wrapper, and the rendered `@error` text is reported as `fallback` and never as the error. Proven by E4, E5
  and E6 against `hook.wrapped`, `hook.errorView.keys` (`$error`, `$reset`) and `hook.fallback.text`
  (`caught: S10 spike: thrown inside the @boundary primary view`, whose prefix is the probe's own template).
- **SC3** — an arrival with no `ErrorDetails` is cannot-tell with `no-boundary-details`, naming no boundary and
  no caught-by, and it never overwrites a record that also carries a boundary. Proven by E7.
- **SC4** — the substituted subtree is cannot-tell with `no-replaced-subtree`: no node, tag, text or count of
  the primary view appears in a finding, because `class LBoundary` declares two fields
  (`hook.retainedState.fields` = `hostLView`, `error`) and the primary view is removed. Proven by E8.
- **SC5** — the route the subject actually has. On a subject whose injector carries the global-listeners
  record, the raw window error becomes one finding with `route: "handler"` carrying the thrown error's own name
  and message and no declaring component; on a subject that declares none, the answer is cannot-tell carrying
  `no-global-error-listeners`, with no finding and no claim that no raw error occurred. Proven by held-out E10
  in `scripts/error-boundary-capture.test.mjs`, driven through the shipped `boundaryWalk` and the shipped
  `readErrorBoundary` rather than through a record written by hand.
- **SC6** — the extension throws no error of its own and the epoch record still names what it named before the
  repair. Proven by E12 and E13 in `extension/agent-main.test.mjs` and re-derived in
  `scripts/error-boundary-measure.test.mjs`, whose recording now carries `instrument.repair` (the guard, the
  four non-keyed identities and the keyed discriminator) beside `instrument.epochs`
  (`movedOne`, `movedBoth`, `held`, `firstPass`, `afterReset`). The gate itself is `npm run check && npm test`,
  recorded in T006's Log and in `.project/build/verify-ledger.jsonl` rather than claimed here.

The five landed commits before this task's are `e7b67d2`, `92f92fd`, `022cdd5`, `7ceb997` and `d4bffc9`, and
`.project/build/verify-ledger.jsonl` holds a `"result": "pass"` row at each — four at `e7b67d2` (T001 re-ran its
own Verify while its command string was settled) and one at each of the other four.

## What this milestone did not settle

It did not observe a live `@boundary`. Every positive half is pinned against S10's measured record and the
fixture's installed core, not against a boundary mounted on a page during this build: the intent's second open
question — which fixture path can declare a `@boundary` and provoke a throw without editing the fixture's
components — remains a question, and `doesNotSettle` says so in the recording (`m042-error-boundary.json`,
five entries, the first of them "What a live `@boundary` does on this head"). It did not name the boundary's
retained subtree, and cannot: SC4 is that absence.

It did not repair or measure the second half of the handler route. The agent's only arrival point is the
`onViewError` hook it installs; Angular 22.2.2's browser-global listeners call `errorHandler.handleError`, not
`onViewError` (`_debug_node-chunk.mjs:15217-15221` is the boundary's own call; the listeners' delivery is
`handleError`). So on a real page a raw browser error reaches the app's handler and the *record* it produces is
the handler route's shape — a delivery carrying no `ErrorDetails` — while the shipped agent does not itself
observe `handleError`. E10 pins the answer the join gives for that route on a subject that declares the
listeners, and the named absence on one that does not; it does not claim the agent taps `handleError`, and that
is a gap a later milestone may need to close.

It did not measure a production build, a third-party, frozen or sealed `ErrorHandler` (a named absence rather
than a finding), or a later 22.x: the discriminator is `typeof ng.toggleWatchSignal === 'function'`, a proxy
for the build and never a version claim, and the surface declares the version it works against as a constant
(`version.declares.coreVersion` = `22.2.2`, `onAPage: null`) precisely because no page reports one.

Finally, it did not receive a reviewer's reading. The plan turned the review panel and the finding skeptics off
(`PLAN.md:11-12`) against the intent's `full` panel and 2 skeptics (`INTENT.md:6-7`), and the waves' accounts
above are the task files' and the ledger's. A reader who wants a second opinion will not find one in this
archive.
