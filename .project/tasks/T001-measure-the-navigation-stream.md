---
id: T001
title: Measure the navigation stream, its stages and the three absences
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/navigation-measure.test.mjs
  - research/raw/m041-navigation.json
  - .project/research/m041-navigation-blocking.md
---

# T001 — Measure the navigation stream, its stages and the three absences

## Context

The page agent records no navigation at all today: it holds one profiler subscription
and the router package enters it only as a package-detection name. Every task after this
one therefore rests on facts nobody has re-measured at this head — which event classes
the router's stream carries and what each one's payload holds, whether the Router is
reachable through the injector path without a new tap, and whether the three absences
this milestone must report were measured or merely hoped for.

The milestone is written on absences, so the measurement is what stands behind them. A
`cannot-tell` nobody measured is a guess pointing the other way: if a payload did name a
holder, SC3 would be a restatement of a wrong claim; if the portal declared a resolver,
`no-resolver-configured` would be a lie about a configuration. The same is true of the
one bounding SC5 depends on — the two route-config events carry no navigation id, so
their attribution is by arrival and nothing else.

Two targets are used, each for a reason the other cannot supply. The insurance portal's
zoneless checkout is where INTENT.md's numbers were taken and where a navigation can be
held at a lazy boundary on demand, and its route configuration is the one that declares
zero `canActivate` and zero resolvers — which is what makes `no-resolver-configured` a
measurement rather than an assumption. The counter fixture is used only for the artefact
the portal lacks: one `canActivate` whose configured function carries a name, which is
the only way SC4's "a guard is named only when the function carries a name" can be
measured at all, because the portal declares no `canActivate` whatsoever.

## Approach

One measurement, recorded once, re-derived by its own suite, and quoted by every later
task. Nothing here is instrumented for the milestone: the stream is read from the page's
own global in a browser driven by the project's existing browser-control skill, and the
recording is the only artefact the plan keeps.

The recording `research/raw/m041-navigation.json` carries:

- `events.classes`: every class the installed router emits on its stream, with each
  class's own recorded key set, sorted, verbatim from the page's own object keys — the
  same enumeration for `NavigationStart`, `RouteConfigLoadStart`, `RouteConfigLoadEnd`,
  `RoutesRecognized`, `GuardsCheckStart`, `GuardsCheckEnd`, `ResolveStart`, `ResolveEnd`,
  `ChildActivationStart`, `ActivationStart`, `ActivationEnd`, `ChildActivationEnd`,
  `NavigationEnd`, `NavigationCancel`, `NavigationError` and `NavigationSkipped`.
- `events.codes`: the cancellation codes the installed router declares, with the value a
  measured run produced, so a code a run did not produce stays an open question rather
  than a claim.
- `reach`: the injector path read from the agent's own call — `getInjector` on the host
  element, then `ɵgetInjectorResolutionPath`, then per entry the metadata source and the
  provider count — with the index of the entry that holds the `Router` token and the
  token read as `record.token`. The app injector is not the first entry, and the
  recording says which entry is.
- `held`: the delayed-chunk run — every script request delayed, the events recorded at
  their own receipt times, `router.url` at that instant, and the absence of a terminal
  event; then the same navigation's completion with its terminal event.
- `warm`: a lazy navigation that completed, with the measured interval between the two
  route-config events and the terminal event that followed it.
- `superseded`: a navigation cancelled by a later one, with its cancellation, its own
  late route-config load end and the successor's load end, each at its measured time.
- `absences`: for each of the three, the payload read and the field list that does not
  contain it — the holder fields of `currentNavigation()`, the aggregate-only guard field
  of `GuardsCheckEnd`, and both targets' resolver declarations.
- `guards`: the portal's declared `canActivate` count and the fixture's one named
  `canActivate`, with the name read from the configured function.

The suite `scripts/navigation-measure.test.mjs` re-derives what the repository can prove
at this head and refuses to let the recording stand on prose:

- the event classes and each class's key set, read from the installed router's own
  bundled source — the class declarations and their constructor assignments — so a moved
  or renamed class reddens the derivation naming it, never silently;
- the cancellation codes, read from the same installed source;
- the reach path's shape, read from the agent's own `handleDiQuery` body: the resolution
  call, the per-entry provider walk and the `token` field, so the recorded reach cannot
  drift from the code that will perform it;
- the fixture's one `canActivate` name, read from `spikes/ng222-app/src/app/redirect-guard.ts`;
- the recorded frames' internal consistency: the held navigation carries no terminal
  event, the superseded navigation's load end arrives after its own cancellation and
  before the successor's, and the two route-config events carry no `id` key at all.

Anything the repository cannot re-derive is quoted as the recording's own measurement,
with the recorder named beside it, so a reader can tell a fact checked here from a fact
checked in the browser once. The suite writes nothing: the recording is read, and a
derivation that disagrees with it fails by name.

## Interface contract

- Measurement record: `research/raw/m041-navigation.json` carries `events.classes` (per class, its own recorded key set), `events.codes`, `reach` (the per-entry injector path with the `Router` token's entry index, the metadata source and the provider count), `held`, `warm`, `superseded`, `absences` and `guards`; every time is the page's own `performance.now()` reading at receipt, and every quoted payload keeps the keys the event carried and no others.

## Intent coverage

- SC3
- SC4
- SC5

## Acceptance criteria

1. Every router event class the stream can carry is enumerated from the installed router's own source at this head, with each class's recorded key set and the cancellation codes, and the recording's rows are held to that enumeration by name.
2. The reach path is recorded from the agent's own read — `getInjector` on the host element, then the resolution path — with the third path entry holding the `Router` token as `record.token` and the provider count beside it, and the app injector is not the first entry.
3. The three named absences are measured rather than assumed: no event payload and no `currentNavigation()` field names a guard, a resolver, a chunk or a task, and `GuardsCheckEnd` carries only the aggregate `shouldActivate`.
4. The portal's route configuration declares zero `canActivate` and zero resolvers while the fixture's one `canActivate` carries the function name `redirectGuard`, so a resolver stage is `no-resolver-configured` and a guard name is available only from configuration.
5. A held navigation records a start and a stage and no terminal event, a completed one records a terminal event with its own fields, and both render the same stage sequence — so the terminal event is the discriminator and not the stage.
6. `RouteConfigLoadStart` and `RouteConfigLoadEnd` carry `route` and `type` and no navigation id, and a superseded navigation's load end arrives after its own cancellation and before the successor's load end, each at its measured time.
7. Every claim is either re-derived by the suite from the installed router's source, the agent's own read path or the fixture's guard file, or quoted as the recording's own measurement with the recorder named; the run writes nothing and the page gains no instrumentation.

## Verify

```bash
node --check scripts/navigation-measure.test.mjs && node --experimental-strip-types --test "scripts/navigation-measure.test.mjs" && npx prettier --check scripts/navigation-measure.test.mjs && npm run check
```

## Log

- pending
