---
id: T002
title: Join a stability record into the state, the settle reading and the repeated work
wave: 2
deps:
  - T001
status: done
agent: build_T002
base: 113d692c847ce6eb37bbaf915a494f6ffddaa358
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
- 2026-11-09 — build — the join answers `{ state, absence, reading, settle, repeats, absences, version, coreVersion }` from `record.stability` and `record.events` and from nothing else: `state` is the recorded emission's own value (`true` → `stable`, `false` → `unstable`), the record's own `absence` word decides `cannot-tell`, a record that published no emission is `idle`, and a record with no stability section at all is `idle` rather than `stable`. `reading` is the record's own `{ value, at }` copied as published or `null`; `version` is the constant `22.2.2` and `coreVersion` what the page reported, `null` where it reported none.
- 2026-11-09 — build — the settle reading is `settle.at` minus `attachAt`, both of which the page published: `record.frame` answers `settled at 1008 ms, 7 ms after attach`, a record whose `settle` is `no-settle-observed` answers `{"state":"no-settle-observed"}` with no `at` and no `sinceAttachMs`, and a page already stable at attach answers `settled at 1001 ms, 0 ms after attach` — a measured `0` that is a number and never the absence. The interval is never taken from the frame's quiet tail (a settle of 1001 is not any time the frame's own `events` recorded at 4000/4001), and `T001`'s `record.subjects['stable-at-attach']` plus `transition.alreadyStableAtAttach` measure the same pair (`sinceAttachMs: 0`, `no-transition-observed`), which is why a settle at attach is reported as a reading and presented as no transition: the answer carries no transition field to fill in and no later time is minted for it.
- 2026-11-09 — build — the repeated work is one pass per start/end pair in the frame's own `events`, grouped per pair and per component: the measured frame answers `ChangeDetection no component: 2 passes` (all four of that pair's recorded entries carry `componentName: null` and reach no `checks` row) and `TemplateUpdate app-root: 2 passes` (one `checks` row holding `[2,3,2,3]` is two pairs), one pair answers one pass, a start with no end and an end with no start answer no pass, and a frame with a `checks` row but no `events` answers `repeated work: the frame recorded no paired work`. No per-view cycle count and no outstanding-work count exists in the answer.
- 2026-11-09 — build — the absences are rendered as their own names: `no-stability-observable: the page published no isStable stream this reader could reach, so no state and no reading are reported` (carried only where the token was unreachable, state `cannot-tell`, never `unstable`), `no-cause-reported: isStable is a boolean stream and carries no reason, so no cause is reported`, `no-outstanding-inventory: the pending-task set holds bare task ids with no owner, no kind and no count, so no outstanding item is listed`, `no-settle-order: the pending-task set records no per-item order and no per-item settle time, so no first item to settle is reported`. Each occupies its own cell, no sentence carries another absence's name, and none renders as a zero, an owner, a call site or a task id.
- 2026-11-09 — build — held-out coverage in `extension/stability-narrator.test.mjs` (13 tests, 11 suites): E1 the emission decides the state with or without a frame beside it; E2 one named absence for both unreachable causes; E3 the record's own settle reading, the measured zero and the absence with no time field; E5 two pairs per component and a `ChangeDetection` pass attributed to no component; E6 no pass for an empty frame, a checks-only frame, a half-open pair or an unreadable entry; E7 four distinct absences each rendering alone; E8 nothing from the opted-in debugging surface, the answer staying `no-outstanding-inventory`; E10 the same record twice byte-identical, silence never a verdict and an unwritten state word travelling through; plus a purity pin with every host global a trap and a source scan proving no import, DOM, clock, console or network.
- 2026-11-09 — build — 15 mutants, each applied to a copy of the module and each proven to redden its pin by name: M1 the verdict decided by the frame beside the emission, M3 the named absence dropped from the list, M4 a settle time fabricated from the attach reading, M5 a page already stable at attach presented as a transition after it, M6 every recorded entry counted as a pass, M7 the passes counted from the frame's `checks` rows, M8 a frame with no paired work given a pass, M9 an unpaired end counted as a pass, M10 a cause filled from the component name, M11 one absence rendered in another's cell, M12 an owner filled from the component name, M13 an opted-in creation stack carried as an absence, M14 instability inferred from a record that emitted nothing, M15 the verdict read out of the frame's silence.
- 2026-11-09 — build — Verify pass at 113d692c847ce6eb37bbaf915a494f6ffddaa358: the task's Verify line ran verbatim to exit 0 — `node --check` clean on both files, 13 node tests pass / 0 fail in `extension/stability-narrator.test.mjs`, `prettier --check` clean on both, and `npm run check` clean (tsc, skill lint, panel/extension/companion checks, verification gate: pass, format:check clean).
- 2026-11-09 — build — landing verdict: the declared two paths carry the work (both added, none outside the declaration), the Log is append-only above this line, the Verify line passed verbatim at the recorded base, and `gsd land-check` reports no blocker — ready
