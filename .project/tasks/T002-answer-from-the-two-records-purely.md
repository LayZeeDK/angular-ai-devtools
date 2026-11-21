---
id: T002
title: Answer from the two records, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/tutor-routing.js
  - scripts/tutor-routing.test.mjs
---

# T002 — Answer from the two records, purely

## Goal

One pure join reads the recorded navigation stream and the recorded router config and returns
exactly the fields the terminal event and the config entry state, the cannot-tell the held
navigation forces, and the two absences as two states that are never folded — with no page, no
clock, no tap and no field the records do not hold. This is the one place the milestone's evidence
becomes a sentence: an answer with no artefact path, a destination read from the address bar, or a
`shouldActivate` rendered as a guard's verdict are the failures this task exists to refuse.

## Context

T001's recording — the field map the first wave wrote — declares which fields an answer may cite:
each terminal class with its own key set, the config's five fields, the two absence names with the
shapes that force them, the attribution rule by `id` and `route.path`, and the reach that says the
config half arrives through a record the agent already produces. The join is pure so node-side
mutants can redden every way the answer could lie, and so the surface (T003) renders it without
restating its rules as a computation. The two absences are states, never inferences (INTENT C1): no
verdict, no decision, and nothing derived from the address bar, `router.url` or `currentNavigation()`.

## Approach

Build `extension/tutor-routing.js` on `globalThis.angularAiTutorRouting`: the pure join
`tutorRouting(records)`, where `records` is the two records and nothing else — `navigation`, the
recorded frames and events for the navigation asked about, and `config`, the recorded config rows.
Anything else on `records` is ignored, so a caller cannot smuggle a page value, a clock or a cause
into the answer.

The answer is one object: `{ state, question, terminal, route, absences, unconfigured, claims,
detail }`.

- `state` is `answered` or `cannot-tell`. On `cannot-tell` the answer names the last event class the
  stream recorded for the `id` asked about and nothing else — no destination, no route node, no
  cause (SC2, E2).
- `terminal` on `answered` is the terminal event's class with its own `id` and only that class's own
  fields: `url` and `urlAfterRedirects` on `NavigationEnd`; `code`, `id`, `reason`, `type`, `url` on
  `NavigationCancel` and `NavigationSkipped`; `error`, `id`, `target`, `type`, `url` on
  `NavigationError`. The class is read from the terminal event, never from whether the navigation is
  thought to have succeeded (SC1, E1).
- `route` is the config entry by its own `path` and by the `component`, `redirectTo`, `canActivate`
  or `loadChildren` that entry states. A `redirectTo` renders as a configuration fact and never as
  the redirect that decided the navigation; a `canActivate` name renders as configuration and never
  as a verdict (SC1, SC3).
- `absences` states the two, each as its own state and never folded: `no-guard-verdict` where the
  stream carries no per-guard verdict — `GuardsCheckEnd`'s only guard field is the aggregate
  `shouldActivate`, which is never rendered as any guard's verdict, and a refusal is never inferred
  from the terminal class — and `no-redirect-decision` where `url` differs from `urlAfterRedirects`
  with zero `NavigationCancel` and no cancellation code 0. Where both hold on one navigation they
  render side by side, never joined into one "no findings" answer nor into one absent-field list
  (SC3, E5 — held-out).
- `unconfigured` names every URL segment no configured path matches beside the paths that were
  compared, never resolved to the wildcard or to a `redirectTo` row, and no `path` is rendered that
  the config does not carry (SC4, E6).
- Attribution is by `id` and `route.path` in each event's own payload, never by arrival position, so
  a reused `id` keeps two decisions apart and a route-config event is never given to the navigation
  that arrived beside it (SC5, E7 — held-out).
- `claims` carries one entry per rendered claim with the artefact path that states it — the
  navigation record's path for the stream, the config record's path for the config — in M055's
  answer shape, so an answer with no artefact path is not an answer this module can produce (SC1).
- `detail` is the join's own sentence about what it read or which absence holds, never a record
  field.

The join imports nothing at runtime, touches no filesystem, dispatches no message, holds no clock,
starts no tap and reads no page global: a bare `node:vm` context with nothing in it is enough to run
it, which the suite proves rather than assuming, and an answer is stable across a second read of the
same record (SC6, SC1 E10).

`scripts/tutor-routing.test.mjs` pins the module and then mutates, each mutant with its own anchor
assertion: an answer with no artefact path; a terminal class the stream did not record; a route
named from the final URL; the held navigation reported as landed; a destination read from the
address bar, from `router.url` or from `currentNavigation()`; the two absences folded into one
blank answer; `shouldActivate` rendered as a verdict; a config entry's `redirectTo` rendered as the
redirect that decided the navigation; a path the config does not carry; an unmatched segment
resolved to `**` or to a `redirectTo` row; an event attributed to the navigation that arrived beside
it across a reused `id`; and an answer that changes on a second read. It also runs a real-record
leg over the frames `research/raw/m041-navigation.json` records (`warm`, `held.inFlight`,
`terminals.redirect`, `superseded.ordering`) beside `research/raw/m030-router-config.json`'s
`config`, so the answer SC1 asks for is proved from the records rather than assumed. Two held-out
pins carry their own titles: `held-out E5: the two absences stay two states on one navigation` and
`held-out E7: a reused id keeps two decisions apart by id and route.path, never by arrival
position`.

## Interface contract

T001 publishes `research/raw/m058-record-shapes.json`: the field map whose terminal-class key sets,
config five fields, absence names `no-guard-verdict` and `no-redirect-decision`, attribution rule
(by `id` and `route.path`, never by position) and `reach.readFrom` are the only fields T002's join
may read, and whose `inventory.outsideTheMap` names exactly `the milestones surface record (produced by T003, listed in its files:)` and
`the milestones verdict-claims record (produced by T004, listed in its files:)`. T002 publishes `extension/tutor-routing.js`:
`tutorRouting(records)` on `globalThis.angularAiTutorRouting`, `records` = `{ navigation, config }`,
one object out — `{ state, question, terminal, route, absences, unconfigured, claims, detail }`,
every field present in every state, each `claims[]` entry carrying `artefactPath` — which T003's
pane renders and whose route, loader key and state fields T003's `the milestones surface record (produced by T003, listed in its files:)`
states and T004's claims record re-derives against. T003 publishes the route `tutor-routing` in
`PANEL_SURFACES` through the shared `loadPanelDemo` closure, the `LOADERS` key `'tutor-routing'`,
the exported `tutorRoutingPanel`, the `PANE_SENTENCES` registry and the digest rows in
`extension/copy-digest.json`.

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; the project verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the
built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension
--skip-nx-cache`, never through an edit.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5

## Files

- extension/tutor-routing.js
- scripts/tutor-routing.test.mjs

## Acceptance criteria

1. `tutorRouting(records)` answers `answered` from the recorded stream and the recorded config
   alone: the terminal by its class and its own `id` and that class's own fields, the route by the
   entry's own `path` and the fields it states, and each claim carrying the event (class and `id`)
   and the config entry (`path`) it rests on; a mutant that answers with no artefact path, names a
   terminal class the stream did not record, or names the route from the final URL reddens (SC1,
   E1, E10).
2. Where the stream records a start and no terminal for the `id` asked about, the answer is
   `cannot-tell` naming the last event class the stream recorded for that `id` and nothing else; a
   mutant that reports the held navigation as landed, or names a destination from the address bar,
   from `router.url` or from `currentNavigation()`'s fields, reddens (SC2, E2).
3. `no-guard-verdict` and `no-redirect-decision` are two distinct states, each naming which one
   holds: `shouldActivate` is never rendered as any guard's verdict, a refusal is never inferred
   from the terminal class, and a config entry's `redirectTo` is rendered as a configuration fact
   and never as the redirect that decided the navigation; a mutant that folds the two absences into
   one answer, renders `shouldActivate` as a verdict, or renders `redirectTo` as the decision
   reddens (SC3, E3, E4).
4. Every `path` the answer renders is one the config records, and a URL segment no configured path
   matches is named unconfigured beside the paths that were compared; a mutant that renders a path
   the config does not carry, or resolves an unmatched segment to `**` or to a `redirectTo` row,
   reddens (SC4, E6).
5. Held-out E7 is pinned in `scripts/tutor-routing.test.mjs`, which the Verify runs: attribution is
   by `id` and `route.path` in each event's own payload and never by arrival position, so across a
   reused `id` the abandoned navigation's own `RouteConfigLoadEnd` is never given to the successor;
   a mutant that attributes a route-config event to the navigation that arrived beside it reddens
   (SC5, E7).
6. The join imports nothing at runtime, touches no filesystem, holds no clock, starts no tap and
   reads no page global — a bare `node:vm` context with nothing in it runs it — and an answer is
   stable across a second read of the same record; a mutant that answers from a field the record
   does not carry or that differs on a second read reddens (SC6, SC1 E10).
7. Held-out E5 is pinned in the same suite: where both absences hold on one navigation they render
   side by side as two states, and a mutant that joins the pair into one "no findings" line or one
   absent-field list reddens (SC3, E5).

## Verify

```bash
node --test scripts/tutor-routing.test.mjs && npx prettier --check extension/tutor-routing.js scripts/tutor-routing.test.mjs && npm run check
```

## Log

- pending.
