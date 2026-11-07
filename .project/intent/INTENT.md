# Intent — M036 resource-lifecycle

Lane: core
Milestone: resource-lifecycle
Branch: gsd-path/M036
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

The roadmap says: *"Build the resource explainer: why this resource is still loading, errored, or never settled."*

A developer looking at a spinner has three questions and the panel answers none of them: is this resource still working, did
it fail, or was it never asked to start? Angular 22 makes `resource`, `rxResource` and `httpResource` stable, and
`research/08-recent-angular-features.md:167-172` already specifies this exact feature as F1, *"why is this spinner still
spinning?"*, with its data source named: graph nodes labelled `Resource#<name>.*` carrying `state`, `isLoading`, `extRequest`
and `value`, sampled per change-detection cycle through `ɵsetProfiler`.

Three facts shape what is buildable, and the first is the one that decides the milestone:

- **"Never settled" has two different answers, and only one is a fault.** F1 names them:
  `ResourceParamsStatus.IDLE` means the params produced nothing, so the resource is idle **by design**; a resource whose
  loader never resolves is a different thing entirely. A panel that conflated them would tell a developer to hunt a bug
  that is not there.
- **The loader's own promise is not readable.** The page exposes the resource's state machine, not the function inside it,
  so "the loader never resolves" is not a claim the panel can make from what it collects.
- **The node labels require ngtsc and Angular 20.1+**, and the panel must confirm they exist on the fixture's build rather
  than assume them.

So the honest scope is the state machine and its params status, with `cannot-tell` where the cause lies inside a loader. T001
measures what the fixture's graph actually labels before any criterion is trusted.

## Users

A developer watching a spinner who needs to know whether to wait, to fix an error, or to look at their params.

## Success criteria

1. On the fixture, a resource whose state is `loading` produces a finding naming the resource, its current state, and the
   status of its params, and naming no cause that lives inside the loader.
2. A resource whose params are `IDLE` produces a finding that says it is idle by design rather than still loading, and does
   not name an error.
3. The finding is produced from observables the graph already collects — the per-cycle labels — with no new page-side
   instrumentation, no build-log scraping and no dev-server dependency.
4. Where the answer would require the loader's own promise or an HTTP outcome the page does not carry, the module reports
   "cannot tell" with that reason rather than naming a stuck request.
5. The panel renders the resource, the state and the params status from a short fact list, shows the "cannot tell" state, and
   invents neither a cause nor a verdict.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | empty | held-out | `scripts/resource-lifecycle.test.mjs` — no resource on the page yields no finding |
| E2 | SC3 | boundary | held-out | `scripts/resource-lifecycle.test.mjs` — with the label read withheld, no finding is produced |
| E3 | SC2 | ordering | held-out | `scripts/resource-lifecycle.test.mjs` — idle params yield idle-by-design, never loading |
| E4 | SC4 | boundary | held-out | `scripts/resource-lifecycle.test.mjs` — an unresolved loader yields cannot-tell, not a stuck request |
| E5 | SC5 | encoding | held-out | `scripts/panel-resource.test.mjs` — the surface renders state and params, and no cause |
| E6 | SC6 | none | held-out | the project gate at the head |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a cause that lives inside the loader | criterion SC1 | the loader's promise is not observable |
| N2 | SC2 | report an idle-by-design resource as loading | criterion SC2 | conflating them sends a developer hunting a non-bug |
| N3 | SC3 | correlate with network timing to infer a stall | criterion SC3 | that is a different source than the graph |
| N4 | SC4 | name a stuck request without an observed unresolved state | criterion SC4 | a guess about the network is still a guess |
| N5 | SC5 | render a cause, a verdict or an error the fact does not carry | criterion SC5 | the surface reports what it was handed |
| N6 | SC6 | weaken a test or widen a tolerance to pass the gate | criterion SC6 | a gate that was moved is not a gate |

## Scope

In: the resource state machine as the signal graph labels it; params status; the four-state surface; the recordings.

Out: the loader's own promise; network timing correlation (a different observable, and `research/08` F1 pairs it with the
graph only as an optional second source); SSR resource behaviour, which `research/16` owns.

## Corrections

None yet. The roadmap's sentence asks "why", and the measurement above says the page carries *what*, not *why*; if T001
finds the labels richer than F1 describes, the criteria may widen, and the widening is recorded here rather than assumed.

## Risks

- The labels may not exist on this fixture's build, in which case the milestone has no oracle and says so in T001.
- `httpResource` state and `PerformanceResourceTiming` may disagree; the criteria deliberately read only the former.
- A resource inside a signal graph may be named by minified identifiers, so the finding must name the resource as the graph
  names it and never invent a friendlier name.

## Open questions

- Which resource fields does the graph label on this fixture's build, and are they present for `resource`, `rxResource` and
  `httpResource` alike?
- Does the fixture already contain a resource on each state, or does one need adding?
- Does the panel's existing signal-graph record already carry the resource labels, making this a join rather than a new read?
