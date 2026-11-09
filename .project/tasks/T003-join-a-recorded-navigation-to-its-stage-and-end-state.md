---
id: T003
title: Join a recorded navigation into its stage, endpoint and absences
wave: 3
deps:
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/navigation-narrator.js
  - scripts/navigation-blocking.test.mjs
  - research/raw/m041-navigation.json
---

# T003 — Join a recorded navigation into its stage, endpoint and absences

## Context

The agent now records the router's stream: one entry per emission in arrival order, each
carrying its own class name, its own receipt time and the fields it carried. Turning that
stream into the milestone's answer is a pure join — which navigation ended and how, which
one is still open and at which stage, what is holding it and what is not recorded — and
nothing else in this milestone is allowed to invent the answer, because four of its
criteria are about not inventing it.

The join is the only place the record's shape is read, so the stage, the terminals, the
three absences and the late load end can be proven without a page and without a browser.
That separation is what lets all nine held-out edges live in one suite against recorded
frames, and it is what keeps the panel a view of an answer rather than a second opinion
about the stream.

The record is also the case the intent measured rather than the case a reader would hope
for: an open navigation's holder is in no payload, a guard's verdict is an aggregate the
stream never attributes, both targets declare no resolver, and a superseded navigation's
load end arrives after its own cancellation — so the join must survive an interleaving
that arrival-order pairing alone would misattribute.

## Approach

One pure function, published the way the sibling join is published, with no imports, no
DOM, no clock, no console and no network. It reads the record it is handed, holds no state
between calls, and answers the same text for the same record twice.

Walking the recorded list once, in arrival order:

- a navigation opens at the event whose payload carries its id and whose class is a start;
  it is `ended` at the first terminal event carrying that id, and it is `open` when the
  record ends with no terminal event for it. A navigation is identified by its own
  recorded id and never by its position in the list.
- the terminal answer names the route the navigation was heading for from its own start
  event's `url`, the terminal class the record carries, and only the fields that class
  carries: `code` and `reason` where the event recorded them, the error's own name and
  message where it recorded an error, and `urlAfterRedirects` only where the event carried
  it. A cancel or an error therefore names no end route at all, and no terminal answer
  names a cause beyond the fields its own event recorded.
- the open answer names the stage of its last recorded event from that event's own class
  through a table from class name to stage word — route-config load for the two
  route-config classes, guards check for the two guard classes, resolve for the two resolve
  classes, activation for the four activation classes. The stage is never presented as the
  reason the navigation is open, and a last event that maps to no stage answers the stage
  as absent with a named absence and still names that event's own class. No stage word is
  ever produced that an event in the record did not name.
- the holder is `cannot-tell` with `no-holder-recorded`, for every open navigation, because
  no payload field names a guard, a resolver, a chunk or a task. The join never reads the
  router's current navigation for it and never names one.
- a guard's verdict is `cannot-tell` with `guard-verdict-not-recorded`, and the aggregate
  field the guard-end event carries is reported as the aggregate it is, never attributed to
  a named guard. A guard is named only where the configured function carries a name, and
  an anonymous function yields no name rather than a placeholder.
- a resolve stage on a record whose configuration declares no resolver answers
  `no-resolver-configured`. The join does not infer a resolver from a resolve class: it
  reports the absence the configuration supports.
- a matched path is reported from the recorded route chain and nothing else: where the
  chain the record carries contains the wildcard route, the answer names the wildcard
  match and never a guard refusal, because the stream cannot tell those two apart.
- the two route-config events are paired with each other, never with a navigation id: a
  start opens a load, and its own end closes it in arrival order, so a load end that
  arrives after its navigation's terminal event still closes the load its own start opened.
  The load is attributed to the navigation that was in flight when its start arrived — not
  when its end arrived — so a superseded navigation's late load end belongs to the
  superseded navigation and never to its successor. A load start with no end is reported
  open, at the route-config-load stage, with no duration and no id.
- a completed navigation's load interval is the difference between the two recorded
  receipt times, which can be `0` and then is a measured zero rather than a missing cost. A
  navigation with a terminal event is never reported open, however long its load interval
  is: the terminal event is the discriminator, and an interval is not.

The suite `scripts/navigation-blocking.test.mjs` pins each behaviour before mutating it,
and every pin is proven non-vacuously: the untouched module is asserted first, a copy with
one anchored mutation is then asserted to exhibit the defect, and the failure names the
defect by string. The recorded frames the suite reads are the ones T001 recorded, so the
pins are held to a measurement rather than to a fixture invented for the test.

## Interface contract

- Router record: the page agent publishes `routerEvents` beside the change-detection record, one entry per `Router.events` emission in arrival order, each `{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate, matchedPaths }` where `type` is the event's own class name, `at` is the page's own `performance.now()` reading at receipt, every field the event did not carry is `null`, and `matchedPaths` holds the primary route chain's own config paths in order for an event whose payload carried a route-tree snapshot and is empty otherwise.
- Navigation answer: `narrateNavigation(record)` answers `{ state, absence, navigations, unattributed }` where each navigation is `{ id, state, url, urlAfterRedirects, terminal, code, reason, error, stage, lastEvent, holder, absence, matched, loads }`, `state` is `ended` or `open`, `stage` is one of the four stage words or `null`, `loads` holds one entry per route-config load `{ route, startedAt, endedAt, durationMs, open }`, and `unattributed` lists an id-less load by kind and route.
- Pane answer: `navigationPanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per navigation with the route, the end route, the terminal or the stage, the holder and each load apart, and a cell holds the text of its own state or the empty string.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5

## Acceptance criteria

1. A navigation that recorded a terminal event answers ended, naming the route it was heading for from that event's own `url`, the terminal class it recorded and only that class's own fields, and no other cause — held-out E1.
2. The end route is named only where the terminal event carried `urlAfterRedirects`, so a cancel or an error record names none — held-out E2.
3. A navigation that recorded a start and no terminal event answers open at the stage of its last recorded event and never as the reason it is open, and a record carrying no navigation answers the absence rather than zero navigations — held-out E3.
4. Every stage word the join answers is derived from an event the record contains and no other stage word appears — held-out E4.
5. An open navigation's holder answers cannot-tell with `no-holder-recorded` and carries no guard, chunk, task or resolver name — held-out E5.
6. A navigation whose recorded route chain contains the wildcard reports the wildcard match and never a guard refusal, an anonymous guard yields no name, the guard-end aggregate is reported as the aggregate field it is and never attributed to a named guard, and a resolve stage on a configuration declaring no resolver answers `no-resolver-configured` — held-out E6 and held-out E7.
7. A completed navigation with a measured route-config load interval answers ended with that interval, including a measured zero, and is never reported open or held — held-out E8.
8. A route-config load start with no id never acquires one, and a load end is attributed to the navigation in flight when its start arrived and never to its successor, with every acceptance proven non-vacuously by a mutant that names its defect by string — held-out E9.

## Verify

```bash
node --check extension/navigation-narrator.js && node --check scripts/navigation-blocking.test.mjs && node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs" && npx prettier --check extension/navigation-narrator.js scripts/navigation-blocking.test.mjs && npm run check
```

## Log

- pending
