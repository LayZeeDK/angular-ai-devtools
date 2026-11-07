# Synthesis — M036 resource-lifecycle

## Settled

The resource state machine is observable and needs no new hook. Eight internal signals carry `Resource#<name>.<field>`
debug names, including `state`, `status`, `error`, `isLoading` and `extRequest`
(`_resource-chunk.mjs:514-517,168,238,279,317-337`), and `resource`, `rxResource` and `httpResource` all produce that same
set because the last two delegate to the first (`rxjs-interop.mjs:210-214`; `http.mjs:430,528`).

The fixture has no resource of any kind, so every state the explainer must show needs a subject authored, and the
idle-by-design case needs a params expression that can produce nothing — nothing in the repository does that today.

The existing signal-graph capture records node identity only (`kind`, `label`, `value`, `fn`) and no resource status, so the
resource fields have never been recorded.

## Decisions

### Read the resource through `ɵgetSignalGraph`, not `ɵsetProfiler`

- **Decision**: the page agent reads the labelled resource signals through `ɵgetSignalGraph`, which is the hook that exposes
  `debugName`s; `ɵsetProfiler` stays what it is — a change-detection timing subscriber.
- **Runner-up**: subscribe to `ɵsetProfiler` per change-detection cycle, as `research/08-recent-angular-features.md:170`
  describes, and read resource fields from the callback's instance.
- **Evidence**: `_debug_node-chunk.mjs:12252,12261,12277` build node labels from `consumer.debugName`;
  `:12563-12564` export both hooks; `:144-159` show `ɵsetProfiler`'s callback signature `(event, instance?, eventFn?)`.
- **Confidence**: high

### Give the fixture one resource per state, including an idle-by-design one

- **Decision**: T001 adds four resources to `spikes/ng222-app` — loading, resolved, errored, and idle-by-design whose params
  expression can return nothing — so each state has a real subject on the page the panel inspects.
- **Runner-up**: use `spikes/ng222-ssr/src/app/data-list.ts`'s `httpResource` as the subject.
- **Evidence**: no `resource(`/`rxResource(`/`httpResource(` call exists in `spikes/ng222-app`; the SSR one always returns a
  request descriptor, so `ResourceParamsStatus.IDLE` is unreachable from it (`spikes/ng222-ssr/src/app/data-list.ts:22`).
- **Confidence**: high

### Name the resource as the graph names it, and report state and params status only

- **Decision**: the finding carries the resource's `Resource#<name>` identity, its `status`, and its params status; it names
  no cause that lives inside the loader, and it distinguishes idle-by-design from still-loading in its own words.
- **Runner-up**: correlate with `PerformanceResourceTiming` to infer a stalled request, as `research/08` F1 suggests as a
  second source.
- **Evidence**: `research/08-recent-angular-features.md:169` names `ResourceParamsStatus.IDLE` as idle by design; the loader's
  promise is not among the labelled fields (`_resource-chunk.mjs:168-337`); intent SC4 forbids naming a stuck request.
- **Confidence**: high

### Correct `research/08`'s hook attribution in this milestone

- **Decision**: T001 also corrects the sentence at `research/08-recent-angular-features.md:170` that attributes the labels to
  `ɵsetProfiler`, and records that the version floor in the next sentence is unverified.
- **Runner-up**: leave the document and note the correction only in this synthesis.
- **Evidence**: the stack dimension's findings; the document is read by future implementers and a wrong hook sends them to a
  callback with no labels in it.
- **Confidence**: medium

### Treat the read as new data under an existing hook, not new instrumentation

- **Decision**: SC3's "no new page-side instrumentation" is satisfied by reading an existing hook and an existing debug name;
  what is new is the data the panel records, and the milestone says so explicitly rather than stretching the criterion.
- **Runner-up**: widen SC3 to admit a new hook.
- **Evidence**: `ɵgetSignalGraph` is already exported and used by the graph feature; the resource fields have simply never
  been recorded (`research/raw/tosignal-node-portal.json` has no `Resource#`).
- **Confidence**: medium

## For the planner

- **Wave-1 blockers**: the fixture has no resource at all; `ɵgetSignalGraph` must be confirmed present on both installed
  versions before the read is written; adding fixture routes moves the route-count pins in three recordings and three specs.
- **Walking skeleton**: T001 measures the graph hook on both versions, adds four fixture resources and corrects the research
  sentence; T002 builds the join with four states; T003 renders the surface and re-cuts every moved pin; T004 re-records and
  runs the gate.
- **Pitfalls → tasks**: the profiler misattribution becomes a one-line correction inside T001; the idle-versus-loading
  confusion becomes T002's second state; the fact-versus-verdict wording becomes T003's mutant.

## User rulings

The owner's standing instruction for this programme applies and is quoted verbatim: "A fresh session should be able to run
`/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` to complete the next milestone
end-to-end without a human-in-the-loop, with full milestone decision authority." It was recorded at this milestone's first
legal boundary with `gsd preapprove --grant intent,plan,rulings,ship`, so these decisions are taken under it and marked
delegated.

## Still unknown

- The true minimum version for the `Resource#…` labels: neither installed package ships a CHANGELOG, and the document's
  "20.1+" claim cannot be verified from the dependency.
- Whether `ngDevMode` gating removes the labels in a production build. Out of scope, because the panel supports development
  builds only, but it means the milestone must not claim the read works in production.
