# PLAN — M053 webmcp-rehearsal

Milestone: webmcp-rehearsal · Branch: gsd-path/M053 · Baseline: 900f1c83

## Config

Project verify: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`

The build leads because `scripts/panel-bundle-budget.test.mjs` refuses an output older than the newest
source: without a fresh build every project verify would compare a stale artifact, which would read as a
defect this milestone did not make. `--skip-nx-cache` because a cached replay restores its recorded output
without refreshing the timestamp that assertion reads.

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: on

## Corrections

1. The milestone reports a rehearsal through the panel's own model, not a working agent loop: the model
   is asked to choose among the tools the awaited call answered, and what the chosen tool answered is
   reported as the tool returned it. Whether `executeTool` can be invoked in a controlled way on the
   measured API is T001's measurement, and the refusal states below are written to pass if it cannot.
2. "The panel's own model" is real, not prose: the tool registry M020 shipped (the `provideTool` files)
   and the panel's Prompt API service are in this tree, so a model turn is something the panel can
   actually make — and a turn it did not make is exactly what prohibition 2 forbids rendering.
3. The awaited caller is inherited work, not a fresh feature: M052 measured `getTools()` answering a
   Promise that resolves to `[]` (`research/raw/m052-webmcp-observation.json`) and recorded the awaited
   caller as carried residual C3, because its synchronous `readTools` answers the measured API
   `cannot-tell`/`unreadable-list`. Wiring that await into a caller that hands the resolved list to the
   shipped reader is part of T002's scope, stated here rather than re-derived or widened after landing.

- C4 2026-11-19: T001 measured `executeTool` in Chrome/159.0.8154.13 (`research/raw/m053-execute-tool.json`): it needs one argument of type `Tool`, refuses `parameter 1 is not of type 'Tool'` otherwise, and `Tool` is a global with an illegal constructor, so a handle cannot be fabricated. On a page declaring no tool the call is therefore unreachable, and a rehearsal cannot run. Two consequences: the surface keys its refusal on the absent handle, not on a missing model (`document.modelContext` vanished under `--no-ai-features` while `LanguageModel.availability()` still read `available`, so the no-model state is unmeasured and must not be rendered as if observed); and T003 must ship a page that actually registers a tool, since without one SC2's success path cannot exist. Registering a tool in a page the demo owns is not prohibited by N4, which forbids registering a tool to observe a list.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T002 | AC1, AC2 |
| SC1 | T003 | AC1 |
| SC2 | T002 | AC3 |
| SC2 | T003 | AC2 |
| SC3 | T002 | AC4 |
| SC3 | T003 | AC3 |

## Held-out checks

| Edge | Task | Test |
| ---- | ---- | ---- |
| E4 | T002 | scripts/webmcp-rehearsal.test.mjs |

E4 is held-out: a page whose awaited call resolves with tool descriptors that carry a name but no
description must yield each tool with its API name and no invented description, and the same suite
asserts the fully-described case, so "the list was read" cannot collapse into "descriptions were
invented".

## Surface contract

### panel — T003

Entry: the panel route `webmcp-rehearsal`, rendered through the `webmcp-rehearsal` key in
`panel-demo.ts` `LOADERS` and the `PANEL_SURFACES` entry in `app.routes.ts`, lazy through the shared
`loadPanelDemo` closure.

States: `rehearsed` — the tool the model chose, named by the name the awaited list reported for it, and
the result the tool returned, carried through as the tool returned it and nothing the tool did not
return; `no-model` — no model was available to make the choice, stated in its own sentence naming why
(the caller's own measured availability answer), with no choice, no result and no tool block beside it,
and the same absence on a second run, because absence is stable and not a placeholder for a later
success; `refused` — the tool refused the invocation or answered an error, stated with the refusal's own
reason and no result rendered in its place, not even a paraphrase; `unavailable` — the awaited tool list
could not be read, stated with the reading's own reason echoed, and no rehearsal attempted from a list
nobody read.

Walkthrough:
1. Open the panel at route `webmcp-rehearsal` with a record of a rehearsal that ran; the surface names
   the tool the model chose by the name the awaited list reported and the result the tool returned,
   exactly as returned.
2. Open a record whose model answer is absent because no model was available; the surface states
   `no-model` and names why, with no choice, no result and no tool block, and renders the same absence
   again on a second run (E5).
3. Open a record whose tool refused the invocation; the surface states `refused` with the refusal's own
   reason and renders no result and no paraphrase of one (N3).
4. Open a record whose awaited list could not be read; the surface states `unavailable` with the
   reading's own reason and attempts no rehearsal.

Criteria: SC1, SC2, SC3

## Wave 1 — measure what executeTool answers

Goal: the milestone rests on an API nothing in this tree has ever called, so what `executeTool` needs,
what it answers, and what it does where no model is available are measured before anything is built on
them.

Review depth: full

T001 measures `document.modelContext.executeTool` — statically, from the prototype record M052 shipped
(`research/raw/m052-webmcp-api.json`, which lists it beside `getTools` and `registerTool`) and live, in
the same controlled Chrome Beta instance M052 used, on a page that declares no tools: with what
arguments it is called, what it answers and through which shape, and what it answers where no model is
available. It records the measurement in `research/raw/m052-webmcp-observation.json`'s successor,
`research/raw/m053-execute-tool.json`, with `path:line` citations for every static claim and instrument
metadata for every live one, and states what the recording does not claim — no browser claim it did not
make. `scripts/webmcp-execute-tool.test.mjs` parses it and re-checks each citation. Nothing is built:
no caller, no join, no surface, no route.

## Wave 2 — await the list, join the rehearsal

Goal: the awaited caller M052 carried hands the resolved list to the shipped reader, and a pure join
turns a reading, a model choice and a tool answer into one record a surface can render — or refuses,
naming why.

Review depth: full

T002 builds `extension/webmcp-rehearsal.js`: an awaited caller `readToolsAwaited(source)` that calls
`document.modelContext.getTools()` once, awaits the answer, and hands the resolved value to the shipped
`readTools` (`globalThis.angularAiWebmcpAudit.readTools`, unchanged) so SC1's `tools` and `empty` states
become reachable — the carried residual C3, finished, with the M052 reader neither edited nor widened;
and a pure join `rehearse(answer)` that takes the awaited reading, the model's choice and the tool's
answer and returns `{ state, choice, result, reason }`, where `state` is `rehearsed`, `no-model`,
`refused` or `unavailable`. The join renders no result the tool did not return, invents no model turn,
and never registers a tool. `scripts/webmcp-rehearsal.test.mjs` pins the module, then mutates: a name
taken from a fixture list, a result rendered for a rehearsal that never ran, a model turn invented, a
re-registration used to observe, an un-awaited synchronous return judged as a list, and a join that
refuses every input — a surface that always refuses is not a surface. This task owns held-out E4.

## Wave 3 — render the rehearsal and pin the route

Goal: the rehearsal states render on a panel surface and every suite that enumerates the route table
names the route before it is asked, not after a landing refuses.

Review depth: full

T003 adds `apps/angular-ai-devtools/src/app/panel-webmcp-rehearsal.ts`, rendering the four states the
join answers — the chosen tool and the returned result, the no-model refusal, the tool's refusal, the
unreadable list — each in its own sentence, plus a `LOADERS` key and a `FACTS` sample in
`apps/angular-ai-devtools/src/app/panel-demo.ts` and a `PANEL_SURFACES` entry and route in
`apps/angular-ai-devtools/src/app/app.routes.ts`. It updates the four app specs
(`app.spec.ts`, `page-picker.component.spec.ts`, `chat-entry.component.spec.ts`, `panel-demo.spec.ts`)
and declares the route-table suites (`scripts/panel-routes.test.mjs`,
`scripts/component-search.test.mjs`, `scripts/gate-integrity.test.mjs`,
`scripts/gate-integrity-default-tasks.test.mjs`,
`tests/held-out/fixture-explainers-unchanged.test.mjs`) before starting — read for the four, but
`scripts/gate-integrity.test.mjs` is also edited: its suite-diff reason table is an allow-list that
refuses a new suite by name, so the two suites waves 1 and 2 added get their two declared rows here
rather than a landing refusal, the answer M044's lesson asked for. The pane's own sentences are not
entered in `extension/copy-digest.json`, which this task does not own; the gap is recorded for T004,
which re-measures the copy record over every surface on disk.

## Wave 4 — record the surface, capture the claims and run the project verify

Goal: the surface is recorded, the claims record and every recording this milestone stales are
re-derived with their own capture commands, and the project verify runs at the head that ships.

Review depth: full

T004 appends the Log after the last recording byte, records the route, the loader key and each state
with the report field it reads into `research/raw/m053-surface.json`, re-cites the surface records whose
app.routes.ts and panel-demo.ts line numbers the twenty-fifth surface moved
(`research/raw/m052-surface.json` among them, alongside `research/raw/m048-surface-copy.json`,
`research/raw/m048-surface.json`, `research/raw/m049-surface.json`, `research/raw/m050-surface.json`,
`research/raw/m051-surface.json`), re-derives `research/raw/m056-gate-stability.json`,
`research/raw/m044-gate-shapes.json` and `extension/copy-digest.json` — authoring the digest rows the
new surface's sentences need — each with its own capture command, never by hand, and captures
`research/raw/m053-verdict-claims.json` with its own capture command. It declares every suite that
enumerates a table or pins a recording it re-derives here rather than discovering them by refusal, and
runs the project verify as its last action, re-deriving nothing after it.
