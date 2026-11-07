# Research Handoff

<!-- Written by the research orchestrator and consumed by decide. -->

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`

## Dispatch

- `stack` — dispatched → `.project/research/evidence-stack.md` — where the `Resource#<name>.<field>` labels come from, which fields they carry, and whether `rxResource` and `httpResource` agree
- `domain` — dispatched → `.project/research/evidence-domain.md` — whether the fixture has a resource in each state the explainer must show
- `pitfalls` — dispatched → `.project/research/evidence-pitfalls.md` — whether the existing signal-graph record already carries the labels, and which hook actually surfaces them
- `similar` — dispatched → `.project/research/evidence-similar.md` — how the two shipped explainers shape a read-and-judge contract this one can inherit

## Question assignments

- `[RESEARCH] Which resource fields does the graph label on this fixture's build, and are they present for resource, rxResource and httpResource alike?` → `stack`, `domain`
- `[RESEARCH] Does the fixture already contain a resource on each state, or does one need adding?` → `domain`
- `[RESEARCH] Does the panel's existing signal-graph record already carry the resource labels, making this a join rather than a new read?` → `pitfalls`, `similar`

## What the research changed

Three answers contradict the intent's assumptions, and each one moves work:

1. **The fixture has no resource at all.** All four states need subjects; the idle-by-design case additionally needs a params expression that can produce nothing, which exists nowhere in the repository.
2. **Reading the graph is a new read, not a join.** The captured graph records node identity (`kind`, `label`, `value`, `fn`) and no resource status, so the resource fields have never been recorded before.
3. **The labels come from `ɵgetSignalGraph`, not `ɵsetProfiler`.** `research/08-recent-angular-features.md:170` attributes them to the profiler; that sentence is wrong and an implementer following it would find no labels at all.

Two facts support the plan rather than change it: the eight labelled fields include `state`, `status`, `error`, `isLoading` and `extRequest`; and `rxResource` and `httpResource` delegate to the same base, so one read covers all three constructors.
