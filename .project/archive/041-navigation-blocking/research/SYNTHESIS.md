# Synthesis — M041 navigation-blocking

> **Authored at archive time — no research phase and no decide phase ran for this milestone.**
> M041's intent declares `Lane: standard` (`INTENT.md:3`), but the standard lane's research and decide phases
> were not executed: the `## Log` in `.project/STATE.md` runs inspect → define → plan → build for this
> milestone with **no** `research` and **no** `decide` entry between the intent's approval
> (`STATE.md:822`, `2026-11-09 — define — milestone intent approved`) and the plan's (`STATE.md:824`); the two
> lines between them are `plan — planning started` (`:823`) and, after it, `build — build started` (`:825`).
> `git log --oneline -- .project/research/SYNTHESIS.md` names no commit, and `git ls-tree -r HEAD -- .project/research`
> lists exactly three files — `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `m041-navigation-blocking.md` — none of
> them a synthesis. This file was not produced by a research or decide phase; it is the one artefact the
> archive requires and no build task before this head could write.
>
> It **synthesises only artefacts that already existed** — `intent/INTENT.md` and its six `## Corrections`,
> `research/DOCS-AUDIT.md`, `research/INSPECT-DELTA.md`, `research/m041-navigation-blocking.md`,
> `research/raw/m041-navigation.json`, `research/raw/m041-verdict-claims.json`, `plan/PLAN.md`, the eight task
> files under `.project/tasks/` and `.project/build/verify-ledger.jsonl` — and **claims no independent
> research**. Nothing below was measured, read or decided by a research or decide phase; the milestone's only
> measurements are T001's and T005's, taken during build and carried by `research/m041-navigation-blocking.md`
> and the two recordings. Where a fact is not in those artefacts, this document says so instead of supplying
> one.
>
> One artefact the previous milestone's synthesis cites is **absent here, and is reported as absent rather
> than reconstructed**: there is no wave review at this head. `.project/plan/build-recovery-70ebde127a98255cb6278453dc45b03ac31f2aae/review/`
> is empty, and `PLAN.md:11-12` records `review_panel: off` and `finding_skeptics: off` — which is not what
> the intent asked for (`INTENT.md:6-7` declares `Review panel: full` and `Finding skeptics: 2`), and the
> divergence is recorded here because a reader of the archive will look for the panel's files and find none.
> The per-wave account below is therefore drawn from the task files' own `## Log` entries and from the
> ledger's seven rows, not from a reviewer's reading.

## Settled

The roadmap entry is "Build the navigation explainer: what is holding this navigation, and at which stage",
`Depends on: [M020]`, `Programme: core · Batch: 3 · Group: @angular/router`, `Surfaces: panel`
(`ROADMAP.md:1500-1506`). The inspect phase did not re-audit; it measured document churn and stopped there:
145 audited documents in the audit in force, 383 paths changed since the audit base, **12 audited documents
changed**, 371 non-audit paths (`INSPECT-DELTA.md:17-21`), with the explicit refusal that "It does not claim
source was audited. It measures document churn and nothing else" (`:74-76`) and that "It does not
re-audit the unchanged documents" (`:77-79`).

The intent settled six things before planning, in `## Corrections` rather than by silently editing the
criteria (`INTENT.md:163-224`). **"What is holding this navigation" has no observable, so it becomes a named
absence** (`INTENT.md:165-174`): measured on the zoneless portal, a navigation held 2,500 ms recorded two
events whose key sets are `{id, url, type, navigationTrigger, restoredState}` and `{route, type}`, and
`router.currentNavigation()` in that window returned ten fields none of which names a guard, a resolver, a
chunk or a task — so SC3 is a cannot-tell criterion carrying `no-holder-recorded` rather than a restatement
of the roadmap's first clause. **Of the roadmap's four stages only `lazy load` is a measurable hold, and
`redirect` is not a stage at all** (`:176-187`): a redirect is one navigation with **no**
`NavigationCancel`, visible only as `url` differing from `urlAfterRedirects`, so SC2 names the stage the last
event belongs to and SC4 makes the guard verdict and the resolver stage cannot-tell instead of inferred.
**The stage's own events carry no navigation id, which bounds the attribution** (`:189-194`): the abandoned
navigation's `RouteConfigLoadEnd` arrived at +1,530.1 ms, after its own `NavigationCancel` at +302.1 ms and
before its successor's end, so SC5 forbids lending those events an id. **"Merely slow" and "blocked" are
distinguished by the terminal event, not by the stage** (`:196-203`). **The page agent records no navigation,
so the widening is part of this milestone** (`:205-212`): one `ɵsetProfiler` subscription
(`extension/agent-main.js:555-559`) and `@angular/router` entering only as a package-detection name (`:185`).
**Guard rejection is declared by the installed router but was not produced by either target**
(`:214-224`): `NavigationCancellationCode` carries `GuardRejected 3`, servers `code 1` was measured and
`code 3` was not, so SC1 carries whatever `code` a terminal event records and a run that produces `code 3`
stays an open question.

Within that frame the milestone's answer is a measured narration of the stage a navigation reached and the
terminal state it ended in, with three named absences, and its honest content is what the record **does** say
rather than the holder the roadmap asked for.

## What was known before planning

`research/DOCS-AUDIT.md` is the audit in force: 340 verified, 16 stale, 0 aspirational, 217 unverifiable and
1 descriptive document, audited at `c9451b1527ae90753315edacd43a30abd2187c6c` on 2026-11-05 with
`Alignment mode: no` (`DOCS-AUDIT.md:3-15`). `research/INSPECT-DELTA.md` is a measured delta, not a
re-audit, and its own account of what it is not is the whole of its authority (`:72-83`).

Neither document answers the intent's three `[RESEARCH]` questions (`INTENT.md:245-249`) — whether a
refusing `canActivate` produces a cancel with `code 3`, which record shape carries an id-less
`RouteConfigLoadStart`/`End` pair, and what the page records for the unproduced codes. All three were
carried into the plan unanswered and settled, where they were settled at all, by measurement during build:
the id-less pair by T001's measured `route.path` attribution and T003's join, the unproduced codes by
T001's `unproduced` list, the `code 3` question by nothing — it remains open. The plan records no answered
question in advance, which is why T001 exists at all.

## The shape the plan chose

Eight waves, eight tasks, one task per wave, `max_review_cycles: 3`, `wave_budget: none`
(`PLAN.md:9-12`). Wave 1 measures the stream before the plan answers for it and runs alone, because "every
later task quotes one of those" and "a plan that quoted a stale key set would write a record shape the
router does not emit, and no later task could tell" (`PLAN.md:14-20`). Wave 2 widens the one
`ɵsetProfiler` subscription to `Router.events` beside it and never inside it, and is "the design decision
the milestone turns on" (`PLAN.md:30-36`, `:38`). Wave 3 is the pure join — one function over the record it
is handed, "so the stage, the terminals, the absences and the late load end are provable without a page"
(`PLAN.md:50-56`). Wave 4 is the surface, and it "re-cuts every pin the registration moves, including the
suites that enumerate the route table, which is where earlier milestones lost a gate cycle"
(`PLAN.md:68-74`). Waves 5 to 7 are the **repairs the blocked build added**, and wave 8 is where T005 moved:
the build blocked at the first head because "its one outstanding criterion is the project gate, and the gate
was red on three defects no task of the first five owned" (`T005:52-60`), so the plan was repaired into a
bundle repair (T006), a claims-binding repair (T007) and an audit repair (T008) that run **before** T005
rather than beside it, because "no task may depend on a later wave" (`PLAN.md:92`, `:248`).

Held-out edges E1–E9 pin to T003 and are dismissed nowhere but E10, because "the project gate is not a
held-out check; it is the repository's own Verify" (`INTENT.md:127-136`). Six prohibitions N1–N6 mirror the
six criteria one for one (`INTENT.md:140-147`), and the panel is declared the only surface with a six-step
walkthrough (`PLAN.md:218-237`).

## What the build measured, wave by wave

- **Wave 1 (T001)** — sixteen router event classes, each with its own key set read from the installed
  chunk's own declarations and compared with the page's own `Object.keys`, and **all sixteen observed on
  the portal in the run** (`research/m041-navigation-blocking.md:30-34`); the `Router` reachable at
  injector resolution path entry 2 — `Environment Injector`, 90 provider records, found through
  `record.token` while the raw `record.provider.provide` names 33 of the 90 and never `Router`
  (`:35-40`, `:101-114`); a held navigation that is a `NavigationStart` plus a stage and **no** terminal
  event, twice, with `currentNavigation()`'s ten fields naming no holder (`:41-46`, `:147-162`); the three
  terminals verbatim with an error's `target` carried as `undefined` because recognition produced no
  snapshot (`:186-199`); a superseded navigation's own load end arriving 1,192.1 ms after its own cancel and
  314.8 ms before its successor's, attributed by `route.path` and never by arrival (`:171-184`); a refused
  guard measured as structurally identical to an unmatched URL — the same eleven events, the same wildcard
  chain `[null, "**"]`, both `NavigationEnd` (`:56-62`); and both targets measured as declaring **zero**
  resolvers while the portal's guards are anonymous (`:63-66`, `:218-229`). 28 of 28 tests pass, 15 of them
  mutants, and the run writes nothing (`T001` Log; ledger row 1 at `8f7739e`).
- **Wave 2 (T002)** — `extension/agent-main.js` publishes `routerEvents`, one flat list in arrival order,
  one entry shape `{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate,
  matchedPaths }` in which `type` is the event's own class name and every field an event did not carry is
  `null` and borrowed from nothing; the `Router` is reached the measured way and armed from `start()` beside
  the tap, never inside the profiler callback, with `ɵsetProfiler` still called once with the same
  subscriber. agent-main 85/85 with six mutants naming their defect by string, page-footprint 12/12 with its
  bound intact, performance-measure 25/25 and render-phase-measure 28/28 unmoved, and the M040 frame pin
  re-cut for the additive field (`T002` Log; ledger row 2 at `3c7461f`).
- **Wave 3 (T003)** — one pure IIFE `narrateNavigation(record)` on
  `globalThis.angularAiNavigationNarrator` with no import, no DOM, no clock and no state between calls,
  answering `{ state, absence, navigations, unattributed }`; the stage is the class of the last recorded
  event through a class-to-word table so `NavigationStart` and `RoutesRecognized` map to none; a terminal
  reports its own class and only its class's fields, so a cancel or an error names no end route; a
  route-config load is paired by its own `route` path string and attributed to the navigation in flight when
  its start arrived, with the recording's own arrival-paired `routeConfigLoads` table — whose `contract` row
  ends on the abandoned navigation's end — quoted in the suite as the defect E9 forbids (`T003` Log; ledger
  row 3 at `04473d2`).
- **Wave 4 (T004)** — `panel-navigation.ts` reads only the join's answer and mints nothing: each state
  renders its own text and no other state's, a measured zero renders `0`, an unclosed load prints no number,
  and the demo sample fact is the join's own answer for `warm.events` (15.600000000000023 and
  37.60000000000002 ms, unrounded) rather than a value invented for the demo. Red-then-green is recorded
  with the route removed and every failing assertion quoted, the route restored byte-identically, and
  `fixture-explainers-unchanged` proven live by removing `panel-navigation.ts` and restoring it (`T004` Log;
  ledger row 4 at `7c4bca3`).
- **Wave 5 (T006)** — the bundle repair is a number the build prints, not an argument: `build-extension`
  printed `Initial total 535.62 kB` before and `534.93 kB` after, with the built `main.js` carrying thirteen
  copies of the 77-byte `()=>import('./chunk-Bv6fUBh3.js').then(e=>e.PanelDemoComponent)` before and one
  copy after, `panel-bundle-budget.test.mjs:441` and `image-budget.test.mjs:92` red with the exact
  over-baseline message and green at 534,933 B over 9 eager files, 0.51 kB inside the recorded 535.44 kB
  baseline. The lazy boundary stayed single and lazy, and `panel-navigation.ts`/`panel-demo.ts` were not
  edited at all (`T006` Log; ledger row 5 at `36ae150`).
- **Wave 6 (T007)** — the claims-binding repair is proven in both directions: the defect was measured at
  base `36ae150` as `ℹ tests 14 / ℹ pass 13 / ℹ fail 1` with
  `AssertionError: Got unwanted exception. Actual message: "SC1 must quote the INTENT criterion character
  for character"` raised from `scripts/performance-capture.test.mjs:1909` because the constant at `:56`
  read the live intent — M040's claims quote its own archived intent on 6 rows of 6 and the live intent on
  1. After the repair the same suite is 14/14 and the three claims suites together are 40/40, and
  `intentPathForMilestone` refuses rather than falling back (`T007` Log; ledger row 6 at `b106c15`).
- **Wave 7 (T008)** — the audit repair is coverage, not an exemption: seven `## Doc:` sections for the
  spike-record set (20 verified, 4 stale, 12 unverifiable rows), the Summary re-derived to verified 340 /
  stale 16 / aspirational 0 / unverifiable 217 / descriptive 1, 16 queue rows numbered 929-944, and one
  `## User rulings` row recording why the set is audited where it lives. The gate exits 0 with 153
  inventoried = 152 claim sections + 1 descriptive and 573 claims, the seven documents and `check_docs_audit.py`
  are byte-identical, and the disposition suite's pre-re-cut prior and its three mutations still redden by
  name (`T008` Log; ledger row 7 at `302fd62`).
- **Wave 8 (T005)** — this wave, and its own record is this head: the recording is re-capturable behind
  `M041_CAPTURE=1` with an unarmed run that writes nothing and names the one file it would write
  (`research/raw/m041-navigation.json:capture`, whose `remeasured` list names the eleven sections an armed
  run derives); the claim list rules all six criteria and quotes each character for character
  (`research/raw/m041-verdict-claims.json`, 460/265/278/462/399/48 characters, 1,912 quoted characters);
  and the archive's synthesis is this file. Its acceptance criterion 5 is the project gate, and its result
  is recorded in the ledger's eighth row rather than asserted here.

## The measured outcome

The claim list rulings every criterion's answer to CHARTER's portal clause per criterion rather than once,
and **no row is required**: `ruling.required` is 0 and `ruling.notRequired` is 6, with the reason stated in
the file rather than left to silence — "A required row must name the driver a control-ai-browsers run
expression takes to the wave gate, and that driver must return the gate's four readings … a navigation
driver does not exist in this repository and this task may not add one"
(`research/raw/m041-verdict-claims.json`, `ruling.why`). The portal measurements are not lost by that
ruling: they are the recording the criteria are checked against, taken on the zoneless portal at
`http://localhost:4507/` (`claude/ai-devtools-spike` at `92d46ec`) and on the counter fixture at
`http://localhost:4222/`.

- **SC1** — the join reports the terminal class the record carries and only that class's own fields, and
  names no end route a cancel or an error did not carry
  (`m041-navigation.json` `terminals.cancel`/`error`/`skip`/`redirect` and `warm.terminal` →
  `extension/navigation-narrator.js` → `panel-navigation.ts`), proven by
  `scripts/navigation-blocking.test.mjs` E1 and E2 and by `npx nx run angular-ai-devtools:test` holding the
  rendered lines to the recording. Closed at wave 3, re-derived at wave 5.
- **SC2** — an open navigation reports the stage of its last recorded event and never the reason it is open;
  the measured held frame is `NavigationStart` at 198.9 ms then `RouteConfigLoadStart` at 199.4 ms with no
  terminal and `router.url` still `/home`. Proven by E3 and E4 plus `scripts/panel-navigation.test.mjs`.
- **SC3** — the holder answers cannot-tell with `no-holder-recorded`, carrying the ten
  `currentNavigation()` fields at the hold, the two the chunk adds later, and an empty
  `payloadFieldsMatchingAWord`. Proven by E5.
- **SC4** — the guard verdict answers `guard-verdict-not-recorded` on the measured eleven-event
  refused-versus-unmatched comparison, `no-resolver-configured` on 0 resolve keys across 23 portal rows and
  20 fixture rows, and a guard is named only where configuration names it — the fixture's one `canActivate`
  is `redirectGuard`, the portal's twelve `canMatch` are anonymous. Proven by E6 and E7.
- **SC5** — a completed navigation is never reported held: the warm frame's `claim` 15.6 ms and `list`
  37.6 ms loads are rendered with the `NavigationEnd` at 424.9 ms, and the superseded frame's abandoned load
  end is reported on its own navigation, 1,192.1 ms after its cancel and 314.8 ms before its successor's.
  Proven by E8 and E9.
- **SC6** — the project gate, proven by `npm run check && npm test` and recorded in the task's Log and in
  `.project/build/verify-ledger.jsonl` rather than claimed by the claim list.

The seven landed commits before this task's are `8f7739e`, `3c7461f`, `04473d2`, `7c4bca3`, `36ae150`,
`b106c15` and `302fd62`, and `.project/build/verify-ledger.jsonl` holds a `"result": "pass"` row at each of
them, each at its own head. The build also carries two `plan` recovery points and one blocked build, both in
`.project/STATE.md` (`:826-830`): T005 "blocked: the gate is red on three defects outside its declared files",
the repair base `70ebde1`, and the plan re-approved.

## What this milestone did not settle

It did not name what is holding an in-flight navigation, and cannot on this build: no payload and no
`currentNavigation()` field names one (measured, `research/m041-navigation-blocking.md:204-216`,
`:258-263`). It did not produce `NavigationCancel` `code 3` (`GuardRejected`) or `code 4` (`Aborted`), nor
`NavigationSkipped` `code 1`; those remain listed as `unproduced` in the recording and as open questions in
the intent (`INTENT.md:245-249`), which is a question and not a claim. It did not observe a `Scroll` event,
so that key set is derived from the chunk alone. And it settles nothing about a production build: every site
read is in the development bundle.

Two limits are carried forward rather than repaired and are recorded here because they bear on how much the
verdict is worth. First, **four of the intent's pre-planning figures are different at this head** and the
recording is what later tasks quote: `canMatch` is 12 on the portal and not 13, the warm lazy intervals are
15.6 ms and 37.6 ms and not 56.9 ms, `ResolveStart`/`ResolveEnd` **are** emitted on the portal although no
route declares a resolver (which is exactly why SC4's absence is `no-resolver-configured` rather than an
inference from the stage), and `record.provider.provide` names 33 of 90 provider records and not 6
(`research/m041-navigation-blocking.md:231-248`). Second, the milestone carries a measurement outside its
own question because it would otherwise be mistaken for an instrument error: the portal throws
`TypeError: Invalid value used as weak map key` once per page load and once per navigation, a control that
calls no `ng.*` function records the same error, and the counter fixture records none — it is recorded beside
the measurement rather than quietly dropped (`:250-256`).

The one thing this document cannot tell a reader is what a reviewer thought. The plan turned the review
panel and the finding skeptics off (`PLAN.md:11-12`), the recovery tree's `review/` directory is empty, and
there is no `review/FINAL.md` for M041 at this head; the wave account above is the task files' and the
ledger's, and a reader who wants a second opinion will not find one in this archive.
