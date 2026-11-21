---
id: T001
title: Measure what the records and the reach state
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m058-record-shapes.json
  - scripts/tutor-routing-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
---

# T001 — Measure what the records and the reach state

## Goal

The milestone's answer names the terminal event the recorded navigation stream carries and the route
node the recorded config states, or it states one of the two absences — and every one of those
members is on disk before anything is built. This task measures the three records the intent cites
and the one reach the record states, writes the field map that binds every later wave to the fields
the records declare, states the two absences as the answer's vocabulary (no record carries a guard
verdict or a redirect decision to read — INTENT C1, PLAN D7), and teaches the two record
inventories this milestone's map so the records the later waves land are excused by the map rather
than read as unmeasured.

## Context

`research/raw/m041-navigation.json` carries the stream's shape: sixteen event classes besides
`Scroll`, each with a fixed key set, four terminals each carrying its own fields only, the held
navigation whose `currentNavigation()` carries no `finalUrl`, the superseded frame whose attribution
is "by route.path in the event's own payload, never by position", the guard-verdict absence whose
`GuardsCheckEnd` carries the aggregate `shouldActivate` and whose refused-guard and unmatched-URL
frames are the same eleven events, and the reach that resolves the `Router` token from entry 2 of a
5-entry injector path with "No new tap is needed" as its note. `research/raw/m030-router-config.json`
carries 18 configured rows over five fields. `research/raw/m033-router-diagnostic.json` carries the
one coded console message that names no configured route. Nothing here is captured from a page: the
reach the record states is the page's say, and the panel is the only surface. The two inventories
(`scripts/tutor-answer.test.mjs`, `scripts/tutor-record-shapes.test.mjs`) currently read M055's and
M057's maps; a third milestone's records would be unmeasured rows to them until both suites read
this milestone's map beside the two.

## Approach

Measure statically and record `research/raw/m058-record-shapes.json` with `path:line` citations
carrying each cited line's own trimmed text, every citation re-resolved by searching its file for
the exact line it quotes rather than by trusting a typed number. No page is opened, no build is run,
no browser is started.

**The field map, one side per record.** The stream side: each terminal class with its own key set —
`NavigationEnd` `{id, type, url, urlAfterRedirects}`, `NavigationCancel` and `NavigationSkipped`
`{code, id, reason, type, url}`, `NavigationError` `{error, id, target, type, url}` — and the
non-terminal classes the held frame records, read from `events.classes` and `events.enumerated`;
the attribution rule from `superseded.ordering` and `superseded.attribution`; the reach from
`reach.readFrom`, `reach.path` and `reach.note`, crossed against `extension/agent-main.js:1750-1839`
(`routerTokenFrom`, entry 2 of the 5-entry path, the entry whose source is `Environment Injector`).
The config side: the five fields `path`, `component`, `redirectTo`, `canActivate`, `loadChildren`
(`fieldsPresent`, `config`), the redirect-shaped rows carrying no component, and the one named
`canActivate`. The diagnostic side: the message names the segment it could not match and no
configured route, so the join's route half reads the config and never a captured diagnostic (C2).

**The two absences, as the answer's vocabulary and not as gaps.** `no-guard-verdict`:
`GuardsCheckEnd` adds exactly one field over `GuardsCheckStart` — the aggregate `shouldActivate` —
`guardFieldsAreAggregateOnly: true`, and a refused `canMatch` and an unmatched URL are the same
eleven events with the same key sets and `guardNamesInEitherPayload: []`.
`no-redirect-decision`: `NavigationCancellationCode.Redirect` has value 0 and
`producedByARun: false`, the redirect frame emitted eleven events with `cancelCount: 0`, and the
redirect is only `url` differing from `urlAfterRedirects`. Both are recorded as named states the
later join renders, never as something a capture could add (D7).

**The record's inventory.** The recording carries `inventory.outsideTheMap` naming exactly the two
records this milestone owes — the surface record T003 writes and the verdict-claims record T004
writes — from the start, so no later wave has to touch the map to have its records excused.

**The two inventories read the map beside the earlier ones.** Edit `scripts/tutor-answer.test.mjs`
and `scripts/tutor-record-shapes.test.mjs` so each reads M058's map beside M055's and M057's: each
milestone's map excuses its own records, a record neither map names still reddens, and the
subtraction stays a recording's statement (`inventory.outsideTheMap`, read from the records
themselves) rather than a suite's filter. No assertion is loosened, no count lowered, nothing
skipped; both suites are green at this head with the two named records still absent, which is the
state M057's suites already hold for its own owed records. Declaring the inventory suites brings
the gate suite that pins them with it (the M057 C4 class): `scripts/gate-integrity.test.mjs` names
both as literals, and names its default-tasks sibling — declare both and edit neither.

`scripts/tutor-routing-shapes.test.mjs` is the record's own writer and reader: unarmed it parses the
recording, re-checks every citation at this head, re-derives both negative measurements over the
records rather than trusting the recording's prose, and re-derives the reach reading — the
held-out E9 pin, whose title is `held-out E9: the Router is reachable from the read the agent
already produces and no new tap is needed`, refusing a reach that names a new tap, a second
observable or a live page read; armed with `M058_CAPTURE=1` it is the only thing that writes the
recording (D5), and a second armed run changes no byte. Nothing is built: no join, no surface, no
route.

## Interface contract

T001 publishes the record-shapes field map, whose terminal-class key sets, config five fields,
absence names `no-guard-verdict` and `no-redirect-decision`, attribution rule (by `id` and
`route.path`, never by position) and `reach.readFrom` are the only fields T002's join may read,
and whose `inventory.outsideTheMap` names exactly the surface record T003 writes and the
verdict-claims record T004 writes. T002 publishes the join module T002 creates:
`tutorRouting(records)` on `globalThis.angularAiTutorRouting`, `records` = `{ navigation, config }`,
one object out — `{ state, question, terminal, route, absences, unconfigured, claims, detail }`,
every field present in every state, each `claims[]` entry carrying `artefactPath` — which T003's
pane renders and whose route, loader key and state fields the surface record T003 writes states and
T004's claims record re-derives against. T003 publishes the route `tutor-routing` in
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
- SC6

## Files

- research/raw/m058-record-shapes.json
- scripts/tutor-routing-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/tutor-record-shapes.test.mjs

## Acceptance criteria

1. `research/raw/m058-record-shapes.json` exists, written only by its own armed capture
   (`set "M058_CAPTURE=1"&& node --test scripts/tutor-routing-shapes.test.mjs`), a second armed run
   changes no byte, and `scripts/tutor-routing-shapes.test.mjs` in read mode parses the recording
   and re-checks every citation at this head.
2. The recording states, for each side an answer may cite, which field names each: every terminal
   class with its own key set and nothing beside it, the config's five fields with the shapes of its
   redirect-shaped and guard-carrying rows, and the attribution rule by `id` and `route.path` — so
   no later wave names a field the records do not declare (SC1).
3. Held-out E9 is pinned in `scripts/tutor-routing-shapes.test.mjs`, which the Verify runs: the
   recording states the reach — entry 2 of the 5-entry injector path holds the `Router` token and
   resolves to the instance `ɵgetRouterInstance` returns, with `reach.note`'s "No new tap is
   needed" — and the suite re-derives that reading from `research/raw/m041-navigation.json`'s
   `reach` section and reddens on a reach that names a new tap, a second observable or a live page
   read (SC6, E9).
4. The two absences are recorded as named states with the shapes that force them —
   `no-guard-verdict` from `guardFieldsAreAggregateOnly` and `guardNamesInEitherPayload: []`,
   `no-redirect-decision` from `producedByARun: false` and `cancelCount: 0` — and neither is stated
   as a gap a capture could fill (SC3's vocabulary, INTENT C1).
5. The two inventory suites read M058's map beside M055's and M057's, are green at this head with
   the two named records still absent, and a record neither map names still reddens — no assertion
   loosened, no count lowered, nothing skipped.

## Verify

```bash
node --test scripts/tutor-routing-shapes.test.mjs scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs && npx prettier --check scripts/tutor-routing-shapes.test.mjs research/raw/m058-record-shapes.json scripts/tutor-answer.test.mjs scripts/tutor-record-shapes.test.mjs && npm run check
```

## Log

- pending.
