---
id: T002
title: Join a stability record into the state, the settle reading and the repeated work
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/stability-narrator.js
  - extension/stability-narrator.test.mjs
---

# T002 — Join a stability record into the state, the settle reading and the repeated work

## Context

The record carries what the page observed: the `isStable` emission the state was read from, the page's own reading at attach and at that emission, the settle reading or its named absence, and the frame's `events` list, which carries the work that happened. Turning that into the milestone's answer is this task, and it is the only place the record's shape is read — which is what keeps the pane a view and what makes every precision claim in this milestone provable against a recorded frame instead of against a browser.

Four answers have to be exactly right. The state is the emission: `isStable` is a boolean stream that carries no reason, so a cause filled from a neighbouring field — a task id, an epoch delta, a signal-graph label, a component name — is the defect SC4 exists to prevent. The settle time is the difference of two readings the page published, and a reader holding no clock cannot produce one: a duration taken from the record's quiet tail or from the interval between two frames is exactly what SC2 forbids, and a measured `0` has to survive as `0`. The repeated work is the `events` list and nothing else — the record the shipped agent already dispatches holds one entry per profiler event, so two `TemplateUpdate` start/end pairs in one row are two passes over that component and a second `ChangeDetection` pair is a second pass attributed to no component, never a per-view cycle count and never an outstanding-work count. And the absences are values rather than missing fields: `no-cause-reported`, `no-outstanding-inventory` and `no-settle-order` are this milestone's permanent answers, `no-stability-observable` is the one a page without the read produces, and none of them may be read as zero outstanding items.

The shapes are the shipped family's. `extension/performance-narrator.js` is the precedent for a reader of this record: it takes one argument, reads only the fields it names, and answers a state, a list of readings and the absences it could not fill, with no import and no global beyond its own namespace. This module does the same for stability, one function on one namespace, so its suite can run it in a bare context and every held-out pin can be driven from a recorded frame.

## Approach

One pure function over the record it is handed. It reads no clock, no DOM, no page and no second tap, so every answer is a function of the argument and the suite can drive recorded frames directly. Each answer names its own state and its own absence, one absence per unanswered question, and a state word the reader was not written for travels through rather than being coerced into a neighbouring one — which is also the reason a record that carries no stability section at all answers `idle` rather than stable.

The state and the settle reading are read, never derived. The state word comes from the recorded emission's value alone, so a frame that carries no `events` still answers a state and a frame that carries a thousand changes none. The settle interval is the recorded reading at `true` minus the recorded attach reading, both of which the page published: a measured `0` is `0`, and a record whose settle names the absence answers no time and no duration at all. Nothing in the record's quiet tail, its last frame or its timestamps is ever a substitute for either reading.

The repeated work is counted one for one from the frame's `events` list. Each pair is matched start to end in the order the frame recorded it, and each component the frame recorded work for gets its passes; a `ChangeDetection` pair carries no component and is attributed to none. A frame that recorded no paired work answers no pass at all, so the absence of a frame never becomes a count, and no outstanding-work count exists anywhere in the answer because the page publishes nothing to count.

Non-vacuity is the discipline: each held-out pin is proven by a mutant that names its defect by string, so a pin that cannot fail is visible as one.

## Interface contract

- Record: the page agent publishes a `stability` section beside its `events`, `routerEvents`, `boundary` and `checks` fields — `{ reachedBy, absence, attachAt, reading, settle, version, coreVersion }` — where `reachedBy` is the token the injector walk resolved or `null`, `absence` is `null` or `no-stability-observable`, `attachAt` is the page's own `performance.now()` at attach, `reading` is `{ value, at }` — the `isStable` emission the state was read from and the page's own reading when it arrived — or `null`, `settle` is `{ state: "settled", at }` or `{ state: "no-settle-observed" }`, `version` is the constant the surface works against, and `coreVersion` is what the page reported, `null` where it reported none.
- Answer: `stability(frame)` answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` where `state` is `unstable`, `stable`, `cannot-tell` or `idle`, `settle` is `{ state: "settled", at, sinceAttachMs }` or `{ state: "no-settle-observed" }`, each repeat is `{ pair, componentName, passes }` read from the frame's own `events`, and `absences` lists one named absence per unanswered question.
- Pane answer: `stabilityPanel(answer)` answers `{ state, kind, message, lines, text, cells, blocks }` where each cell holds the text of its own state or the empty string, `lines` carries one line per fact the answer carried, and `blocks` carries one block per reading — the state, the settle reading and the repeated work — each holding its own lines.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC6

## Edges

E1, E2, E3, E5, E6, E7, E8 and E10, all eight held-out and all eight in this task's own suite.

## Acceptance criteria

1. Held-out E1: a record whose `isStable` emitted `false` answers unstable and one whose emission was `true` answers stable, both decided by the emission alone, and neither verdict moves with the presence or absence of a record frame; the answer names the emission it read, its value and the page's own reading.
2. Held-out E2: a record with no reachable `ApplicationRef` and one whose `isStable` could not be subscribed both answer cannot-tell with the single named absence `no-stability-observable`, with no state word beside it and no zero standing in for it, the two causes being one absence rather than a count.
3. Held-out E3: a page already stable at attach, a transition that happened before attach and a page that never settles each answer `no-settle-observed` carrying no time field, while a settle whose interval is `0` answers a settled reading with `sinceAttachMs: 0` and is never that absence, the interval being the difference of the two readings the record carries and of nothing else.
4. Held-out E5 and E6: two `TemplateUpdate` start/end pairs in one frame answer two passes over that component, one pair answers one, a second `ChangeDetection` pair carrying `componentName: null` answers a second pass attributed to no component, and a frame that recorded no paired work answers no pass at all, the absence of a frame never becoming a pass count or an outstanding count.
5. Held-out E7: `no-cause-reported`, `no-outstanding-inventory`, `no-settle-order` and `no-stability-observable` stay four distinct absences, one per unanswered question, each with its own name, and none of them ever answers zero outstanding items.
6. Held-out E8: a record from an app that opted into `provideStabilityDebugging()` contributes no component name, no call site and no task id, and its answer stays `no-outstanding-inventory`.
7. Held-out E10 and the reader's purity: the same silent record read twice answers the same state and the same measurement, silence alone never turns cannot-tell into stable, a state word the reader was not written for is passed through rather than coerced, and the module reads no clock, no DOM, no page and no second tap, proven from inside a context where each of those is a trap that throws naming itself.
8. Each held-out pin is proven non-vacuously by a mutant that names its defect by string.

## Verify

```bash
node --check extension/stability-narrator.js && node --check extension/stability-narrator.test.mjs && node --experimental-strip-types --test "extension/stability-narrator.test.mjs" && npx prettier --check extension/stability-narrator.js extension/stability-narrator.test.mjs && npm run check
```

## Held-out

E1, E2, E3, E5, E6, E7, E8 and E10, all eight in `extension/stability-narrator.test.mjs`, each pin proven non-vacuously.

## Log

- pending
