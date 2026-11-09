# Intent — M043 stability-explainer

Lane: standard
Milestone: stability-explainer
Branch: gsd-path/M043
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A developer whose page never stops working asks why the app is not stable, and what
is still outstanding. The roadmap says this milestone builds exactly that
(`.project/ROADMAP.md:1563`). Gate inspection measured what a running page can answer
before any plan was written (`.project/research/INSPECT-DELTA.md:129-352`), and the
answer is smaller than the sentence: one of its three clauses is observable, two are
not, and the question the sentence does not ask — when it settled — is observable and
has never been read.

- **That** the app is not stable *is* observable, with no application cooperation.
  `ApplicationRef.isStable` is `hasPendingTasksObservable.pipe(map(pending => !pending))`
  (`spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:13221-13222`,
  `whenStable` at `:13229`), backed by `PendingTasksInternal`, whose subject flips on the
  first `add()` and the last `remove()` (`_pending_tasks-chunk.mjs:2296-2322`). It is
  reachable by the read the agent already performs for `Router` —
  `ng.getInjector(host)` → `ɵgetInjectorResolutionPath` → `ɵgetInjectorProviders` → the
  provider record whose `token.name` matches → `injector.get(token)`
  (`extension/agent-main.js:1765-1784,1808-1819`) — so the state needs no new
  instrumentation path, only a second token name and a subscription.
- **Why** the app is not stable is not observable. `isStable` is a boolean stream and
  carries no reason, and no published debug key answers it: 24 keys on the 22.1.8
  install and 25 on 22.2.2, the whole delta between the two versions being
  `toggleWatchSignal` (`_debug_node-chunk.mjs:12907-12909`), with `getDirtyComponents`
  absent from both installs.
- **What is still outstanding** is not observable. `PendingTasksInternal.pendingTasks`
  is a `Set<number>` and `add()` takes no descriptor
  (`_pending_tasks-chunk.mjs:2304-2312`); the public surface is `add()` and `run(fn)`
  and holds no count, no list, no kind and no owner. The one ownership surface is an
  application opt-in — `provideStabilityDebugging()` (`core.mjs:686-724`) — which
  console-debugs each open task's creation *stack*, not a component, only after
  `APPLICATION_IS_STABLE_TIMEOUT - 1_000` ms, and only for an app that asks for it; the
  fixture does not, and the portal does not.
- **The first item to settle, and any per-item order, are not observable.** The tasks
  live in an unordered `Set` of integers with no insertion timestamp crossing any API
  and no settle-time field anywhere (`_pending_tasks-chunk.mjs:2304-2322`).
- **Which work ran is observable, as repeated work.** A second `TemplateUpdate`
  start/end pair lands inside the same `checks` row, and a second change-detection pass
  is a second `ChangeDetection` pair carrying `componentName: null`
  (`_debug_node-chunk.mjs:155,13300,13328`; `extension/agent-main.js:573-614,738-748,1038-1060`).
  The frame's record carries `cycleId`, `trigger`, `zoneMode`, `events`, `routerEvents`,
  `boundary` and `checks` and no stability field, so this is the work that happened and
  never the app's state.
- **The fixture is already permanently unstable, with no fixture change.**
  `LoadingResource`'s loader returns a promise nothing resolves
  (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`), and a loading `resource()`
  takes a pending task for the duration of its load
  (`_resource-chunk.mjs:331,404`) — so `/resource-states` is unstable for the life of
  the page. The positive half of the premise is installed already.
- **Two of the roadmap's three scope-in bullets belong to milestones that shipped.**
  Unsettled resources are M036's (`ROADMAP.md:1349-1352,1371`), which reports a
  resource's status and last lifecycle event; per-frame work read as cost is M040's
  (`extension/performance-narrator.js:1-70`). Re-scoping either would ship a second
  surface for a question that already has one.

So the subject is not "why the app is not stable, and what is still outstanding" in the
abstract. It is **whether** the app is stable, **when** it settled, and **which work ran**
while it was unstable — each measured from the page — together with the named absences
for the clauses the roadmap asks and no page can answer.

## Users

A developer whose page never stops ticking and who needs to know whether that is the
app's own state, how long it has been that way, and what ran meanwhile — and a reviewer
checking that the panel never fills a cause, an outstanding item, an owner or a first
item to settle with a guess, and never reports stability on the strength of a page that
reported nothing.

## Success criteria

1. The stability state is reported for each inspected page from that page's own `ApplicationRef.isStable`, reached by the injector read the agent already performs for `Router` and from nothing else: on the counter fixture's `/resource-states`, whose never-settling `resource()` takes a pending task for the page's lifetime (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`; `_resource-chunk.mjs:404`), the finding reports the app unstable and names the emission it read; on a page whose `isStable` has emitted `true` it reports stable from that emission; and a page exposing no reachable `ApplicationRef`, or an `isStable` that cannot be subscribed, is cannot-tell with the named absence `no-stability-observable`, never stable and never a zero count.
2. The settle time is a reading the page published or a named absence, never an inference: when the stability read emits a change from unstable to stable while the surface is attached, the finding reports the time between the page's own `performance.now()` reading at attach and its reading when `true` arrived, and reports a measured `0` as `0`; a page already stable at attach, a page whose transition happened before attach, and a page that never settles each render the absence `no-settle-observed` with no time and no duration, and no interval taken from the record's quiet tail ever stands in for one.
3. The work that ran while the app was unstable is reported as the frames the page recorded, and repetition is read from the frame's own `events` list and nothing else: two `TemplateUpdate` start/end pairs inside one `checks` row are reported as two passes over that component, a second `ChangeDetection` pair carrying `componentName: null` is reported as a second change-detection pass attributed to no component, and a frame holding one pair reports one; no per-view cycle count, no outstanding-work count and no pass the `events` list does not hold is ever reported.
4. Every question the page cannot answer is cannot-tell with its own named absence and no guessed value: the cause is `no-cause-reported`, because `isStable` is a boolean stream (`_debug_node-chunk.mjs:13221-13222`); the outstanding items, their count, their kind and their owner are `no-outstanding-inventory`, because `PendingTasksInternal` holds a `Set<number>` whose `add()` takes no descriptor (`_pending_tasks-chunk.mjs:2304-2312`); the first item to settle and any per-item order are `no-settle-order`, because no timestamp and no settle time crosses any API; and no absence is ever filled from a task id, an epoch delta, a signal-graph label, a component name or a creation stack.
5. The panel surface renders the state, the settle time or its named absence, and the repeated-work reading, each in its own block, and renders nothing else: no sentence names a cause, no list names an outstanding item or its owner, no column orders work by settle time, the surface is registered in the route table that carries no stability route today (`apps/angular-ai-devtools/src/app/app.routes.ts:17-160`), and asked for a page it has no stability answer for it renders `no-stability-observable` rather than an empty table or an em dash.
6. Stability is reported as a measurement and never as the absence of a report: a page whose change-detection record has gone silent but whose `isStable` reads `true` reports stable with the reading that says so, a page whose record is silent and whose stability was never read reports `no-stability-observable`, and no surface renders stable on the strength of a quiet interval, an empty finding set or the record's silence — the failure mode the roadmap's own risk line names (`.project/ROADMAP.md:1587`), measured in the agent's shape, which dispatches one snapshot at install and thereafter only frames (`extension/agent-main.js:566,1418-1448,1038-1060`).

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | precision | held-out | extension/stability-narrator.test.mjs — a read whose `isStable` emitted `false` renders unstable and one whose `isStable` emitted `true` renders stable, and neither verdict is decided by the presence or absence of a record frame |
| E2 | SC1 | empty | held-out | extension/stability-narrator.test.mjs — a page with no reachable `ApplicationRef` and a page whose `isStable` is not subscribable each render `no-stability-observable` with no state word beside it, and the two absences are one absence rather than a zero |
| E3 | SC2 | boundary | held-out | extension/stability-narrator.test.mjs — a page already stable at attach and a page that never settles each render `no-settle-observed` carrying no time field, while a measured zero renders as `0` and is never that absence |
| E4 | SC2 | precision | criterion SC2 | the time is the difference of two readings the page itself published, so a reader holding no clock cannot produce one and a quiet gap cannot be substituted for it |
| E5 | SC3 | precision | held-out | extension/stability-narrator.test.mjs — a frame with two `TemplateUpdate` start/end pairs in one row reports two passes over that component, a frame with one reports one, and a second `ChangeDetection` pair with `componentName: null` reports a second tick attributed to no component |
| E6 | SC3 | empty | held-out | extension/stability-narrator.test.mjs — a frame that recorded no paired work reports no pass at all, and the absence of a frame never becomes a pass count or an outstanding count |
| E7 | SC4 | empty | held-out | extension/stability-narrator.test.mjs — `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order` and `no-stability-observable` stay four distinct absences, each renders alone, and none renders as zero outstanding items |
| E8 | SC4 | encoding | held-out | extension/stability-narrator.test.mjs — an app that opted into `provideStabilityDebugging()` (`core.mjs:686-724`) publishes a creation stack to the console and a task id to no API; the reader takes no component name, no call site and no task id from either, and the answer stays `no-outstanding-inventory` |
| E9 | SC5 | boundary | held-out | apps/angular-ai-devtools/src/app/panel-demo.spec.ts — the surface renders its three blocks and every named absence, and a surface asked for a cause, an outstanding item, an owner or an order renders that absence in its own sentence rather than an empty list or a dash |
| E10 | SC6 | idempotency | held-out | extension/stability-narrator.test.mjs — the same silent record read twice reports the same state and the same measurement, and silence alone never turns a cannot-tell into stable |
| E11 | SC6 | concurrency | held-out | scripts/stability-capture.test.mjs — two pages in one browser session each report their own state and their own settle time, and no stability emission from one page is attributed to the other |
| E12 | SC1 | ordering | dismissed | `isStable` is a subject-backed stream that carries its current value and no history (`_pending_tasks-chunk.mjs:2284-2302`), so no earlier transition can be ordered, counted or replayed, and nothing here claims one |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|-------------|-----------|----------|-------------|-----|
| N1 | SC1 | report stable because the record fell silent, or a state the page's own `isStable` did not emit | judgment | the reviewer looks for a state word that traces to one emission of `isStable`, and for `no-stability-observable` wherever that stream was never reached |
| N2 | SC2 | present a settle time taken from a quiet interval, from the record's last frame, or from a clock the reader reads itself | criterion SC2 | the time is the difference of two readings the page published; a duration derived from anything else is the defect this criterion exists to prevent |
| N3 | SC3 | report a per-view cycle count, an outstanding-work count, or a repeated pass the frame's `events` list does not hold | judgment | the reviewer looks for passes that trace one for one to recorded start/end pairs, and for no count that a field of the frame cannot be pointed at |
| N4 | SC4 | answer why, what is outstanding, who owns it, or what settles first — from a task id, an epoch delta, a signal-graph label, an opted-in stack or a component name | criterion SC4 | the finding carries the named absence and nothing beside it; a plausible cause assembled from a neighbouring field is the defect this criterion exists to prevent |
| N5 | SC5 | add a block, chip or sentence to the panel surface for a fact this milestone answers cannot-tell | judgment | the reviewer looks for a surface whose every block is one of the three answers or one of the four named absences, with no editorial sentence about the app's health |
| N6 | SC6 | reach a stability answer by patching `isStable`, by adding a task to `PendingTasks`, by injecting a value into the page, or by any page-side change at all | criterion SC6 | the state is read, never asserted: a page made stable or unstable by the tool is the tool measuring itself, and no inspected page receives DOM or script for it |

## Scope

In:

- a stability subscription inside the existing page agent, taken from the `ApplicationRef`
  the injector read already resolves, beside the profiler, router and boundary
  subscriptions (`extension/agent-main.js:1765-1784,1808-1819`);
- the state, the settle reading and the repeated-work reading, carried on the record the
  agent already dispatches (`extension/agent-main.js:1038-1060`);
- a reader module of that record, beside `extension/performance-narrator.js`, which mints
  the three answers and the four named absences and reads no clock, no DOM and no page
  global of its own;
- the named absences `no-stability-observable`, `no-settle-observed`,
  `no-cause-reported`, `no-outstanding-inventory` and `no-settle-order`;
- the panel surface rendering the three answers and the five absences, registered beside
  the routes already in `apps/angular-ai-devtools/src/app/app.routes.ts`;
- a capture on the counter fixture, whose `/resource-states` is unstable today with no
  fixture change (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`), and — for the
  stable half — whichever page the measurement shows reaches `true`, which may be the
  same route after its load, the panel's own page, or the portal.

Out:

- a page-side control, input or widget (AR-6): every interaction stays in the panel;
- code generation of app code; a finding may name a modern Angular pattern and an
  official schematic only;
- `@angular/animations`, Angular SSR and `angular/components` (A5);
- DOM added to an inspected page (AR-3): the overlay stays the only DOM the tool adds;
- re-scoping M036's resources: a resource that has not settled is already reported with
  its status and last lifecycle event, and this milestone neither repeats it nor reads
  the signal graph to explain stability;
- the cause, the outstanding inventory, an owner, a first-to-settle and any per-item
  order, as anything but the named absences above — `PendingTasks` exposes a
  `Set<number>` and `add()` takes no descriptor
  (`_pending_tasks-chunk.mjs:2304-2312`), and nothing in this milestone may infer past
  that;
- a patch of `isStable`, a synthetic pending task, or any edit to an inspected page's
  scripts — the state is read, never asserted;
- an opt-in companion in the inspected app; `provideStabilityDebugging()`
  (`core.mjs:686-724`) stays an application's own choice and is never recommended from
  the surface as the way to make these absences go away.

## Corrections

**2026-11-09 — the roadmap's sentence needs narrowing to what a page observes, because
two of its three clauses have no observable.** The roadmap says, verbatim:
"Goal: Build the stability explainer: why the app is not stable, and what is still
outstanding." (`.project/ROADMAP.md:1563`), and its scope-in names "pending tasks,
in-flight requests and unsettled resources" (`:1572`), "each outstanding item joined to
the component or service that owns it" (`:1573`) and "the first item to settle"
(`:1574`). Gate inspection ruled clause by clause
(`.project/research/INSPECT-DELTA.md:334-344`): whether the app is stable is observable
through the injector read the agent already performs; why it is not, and what is
outstanding, are not. The ruling's own summary
(`.project/research/INSPECT-DELTA.md:346-352`) is the sentence this intent is written
against: **whether** the app is stable, **when** it settled, and **which work ran** —
with a repeated pass over the same view read as repeated work. SC1 to SC6 claim exactly
that and nothing the ruling refused.

**2026-11-09 — "what is still outstanding" has no inventory to report, so it becomes a
named absence.** `PendingTasksInternal.pendingTasks` is a `Set<number>`; `add()` takes no
descriptor and returns the id it minted (`_pending_tasks-chunk.mjs:2304-2312`); the
public `PendingTasks` surface is `add()` and `run(fn)`, with no count, list, kind or
owner; `hasPendingTasks` is the boolean behind `isStable`. The only ownership surface,
`provideStabilityDebugging()` (`core.mjs:686-724`), console-debugs a *creation stack*
only after `STABILITY_WARNING_THRESHOLD` — `APPLICATION_IS_STABLE_TIMEOUT - 1_000`, so
9 000 ms (`core.mjs:676,707-724`) — and only for an application that opts in. So SC4
answers `no-outstanding-inventory`, and the fixture's own instability stays a fact of one
resource (`spikes/ng222-app/src/app/resource-states.ts:61,67-71`) that M036 already
explains.

**2026-11-09 — "the first item to settle" has no observable either, and neither does any
per-item order.** No insertion timestamp crosses any API and no settle time is recorded
anywhere in `PendingTasksInternal` (`_pending_tasks-chunk.mjs:2304-2322`), so a
"first to settle" can only be a named absence: SC4's `no-settle-order`. The settle
*time* of the application is a different fact and is observable — SC2 reports it from
two readings the page published, or names `no-settle-observed`.

**2026-11-09 — one scope-in bullet and one success criterion are already shipped
elsewhere, so this milestone does not re-scope them.** "Unsettled resources" is M036
(`.project/ROADMAP.md:1349-1352,1371`), which reports a resource's status and its last
lifecycle event; the per-frame work M040 reads as cost is
`extension/performance-narrator.js:1-70`. What is left of M043's own ground is the
stability state and its settle reading, which no shipped surface reads: `isStable`,
`whenStable`, `PendingTasks` and `ApplicationRef` are absent from every authored script
under `extension/` (`.project/research/INSPECT-DELTA.md:320-325`).

**2026-11-09 — the premise's positive half is already installed in the fixture, so no
fixture change is required to satisfy SC1.** `LoadingResource`'s loader returns
`new Promise<never>(() => {})` (`spikes/ng222-app/src/app/resource-states.ts:61`) and its
`resource()` carries `params` and that loader (`:67-71`); a loading resource takes a
pending task for the duration of its load
(`_resource-chunk.mjs:331,404`), resolved only when the loader settles. `/resource-states`
is therefore unstable for the page's lifetime today. What the fixture cannot produce is
the unstable-to-stable *transition* — a task that starts and ends — so SC2's positive
half may have to come from a subject other than that route, and SC2's absence is the
honest answer until a measurement finds one.

**2026-11-09 — the roadmap's risk line is not a caution but a measurement: silence is not
stability, in the shipped code.** The agent dispatches one snapshot at install
(`extension/agent-main.js:566,1418-1448`) and thereafter only frames
(`:1038-1060`), so a stable page and an uninstrumented page produce the same number of
records — none. That is `.project/ROADMAP.md:1587`'s "stability read from a quiet interval
is not stability" read in the code, and it is why SC6 exists as its own criterion rather
than as a clause of SC1.

## Risks

- An unstable page and a slow one produce the same record: both show repeated
  `TemplateUpdate` pairs, and only the stability reading separates a page held open by a
  pending task from a page that simply did a lot of work — so the state must be read from
  `isStable` and never inferred from how much work the frames carry.
- The fixture's instability is M036's never-settling resource. The two explainers read
  the same page, and a stability surface that contradicted the resource surface's
  "unsettled" would be the visible defect, so the new surface must name the state and
  leave the resource to its own explanation.
- The stable half has no fixture page today. If no inspected page reaches `true` during a
  capture, SC1's and SC6's positive readings rest on a page that was already stable at
  attach, which is a weaker subject than a transition.
- The settle reading is attach-time dependent: a subscription taken after the app settled
  can never observe the transition, and the absence it renders is indistinguishable from
  a page that never settled unless the surface says which of the two it is looking at.
- Gate inspection measured `isStable` as a getter that builds a fresh `map` pipe per
  access. Whether a subscription taken from one access stays current through later
  `add()`/`remove()` flips is unmeasured here; a reader that re-reads the getter per poll
  would measure a different thing from one that subscribes once.
- The record's shape is shared: `events`, `routerEvents` and `boundary` were added to it
  by three earlier milestones, and a fourth field must not change any of them — a
  reviewer reading M040's narrator against the same record will notice.

## Open questions

- [RESEARCH] Is the Insurance Portal's zoneless target permanently stable, so that the
  unstable half of SC1 is only ever measured on the counter fixture — and if so, must the
  stable positive case come from the fixture too, or does the portal serve it?
- [RESEARCH] Does one subscription taken through the `isStable` getter stay current
  through later `add()`/`remove()` flips, given the getter builds a new `map` pipe per
  access (`_debug_node-chunk.mjs:13221-13222`), or must the agent subscribe to
  `hasPendingTasksObservable` itself?
- [RESEARCH] Which fixture route can produce an unstable-to-stable transition — a task
  that starts and ends inside one page's lifetime — without a fixture change, and if none
  can, does SC2's positive half need one?
