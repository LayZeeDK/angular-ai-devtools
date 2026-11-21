# SYNTHESIS — M058 tutor-routing

What this milestone established, in the order the evidence established it. Every number here is one a
record or a suite re-derives; nothing is asserted from memory.

## The roadmap's sentence did not survive measurement

The entry promised an answer naming "the route node, the redirect and the guard verdict that decided
it". Measured against the records the agent actually holds (INTENT C1): `m041-navigation` carries a
navigation stream with no guard field and no redirect field, `m030-router-config` carries 18 configured
rows over five fields with one named guard, and `m033-router-diagnostic` names no configured route
(`namesConfiguredRoutePath: false`). No record carries a guard verdict, and none records a redirect as
a decision, so `no-guard-verdict` and `no-redirect-decision` are states the answer renders rather than
gaps it fills (`research/raw/m058-record-shapes.json`, the `absences.notGaps` section).

## What the join answers

`extension/tutor-routing.js` is a pure function of two observables: the recorded navigation stream and
the router config. It returns one object in every state — `{ state, question, terminal, route,
absences, unconfigured, claims, detail }` — and its `claims[]` entries carry `artefactPath` so every
sentence points at the record that states it. A held navigation is `cannot-tell`, naming the last
recorded event class and nothing else: the address bar, `router.url` and `currentNavigation()` are all
refused as destinations by mutants.

Attribution is by `id` and `route.path`, never by arrival: the abandoned load end sits 1192.1 ms after
its own cancel and 314.8 ms before its successor's, re-derived from the events' own `t`.

## The surface

`panel-tutor-routing.ts` renders the answer on the panel only, and the panel asks nothing of the
inspected page (SC6, N6, N7). The route table grew 27 → 28 surfaces and 36 → 37 ordered paths, the
copy digest 193 → 198 rows and 201 → 206 sentences, and every pin that enumerates those tables moved
with them.

## The repairs, and why they were not avoidable

Three repair waves were needed, each opened by a measurement rather than a suspicion:

1. **Wave 4** — `research/raw/m048-surface.json` still quoted the pre-M058 copy-check fact, so the
   copy suite was 30/29/1 at the T003 head. The fix was four values in that record, and it needed its
   own task because no M058 task declared it.
2. **Wave 6** — the project verify was red in four suites across files no task owned: the
   signal-shape census, the docs audit's coverage of the four proof skills, and a held-out mutant that
   recursed forever when the plan's `## Held-out checks` carried prose instead of a table.
3. **Wave 5, then 7** — re-derivation ordering. The census moves when a new recording lands, and the
   stability record's mention count moves when a task Log is written. T009 exists because the first
   is positional and the last task is the only place to observe it.

## What the milestone does not claim

- No portal-side redirect frame. The fixture's `/redirect` → `/landing` frame is the artefact, and the
  portal route tried is named in the intent.
- No guard-verdict inference, in any state.
- No project verify pass recorded at the shipping head itself: the pass is at `12cc196c`, and the
  commits after it add census values the verify had already measured plus the wave-review artifacts.

## Residuals carried forward

The wave reviews recorded four low-severity gaps that this milestone does not close: the stale prose
in `m048-surface.json`'s own `statement` fields, the panel-output count's dependence on untracked
build output (now pinned by T010, still rebuild-dependent), positional census ownership, and wave
numbering that carries a deliberately small task in wave 5 because an empty wave is refused.
