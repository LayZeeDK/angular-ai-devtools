---
id: T002
title: Widen the page agent to Router.events beside the profiler subscription
wave: 2
deps:
  - T001
status: done
agent: commandcode-coder
base: 8f7739e817139cb9c5ab715ef0600f3476b84c2d
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
  - extension/page-footprint.test.mjs
  - scripts/render-phase-measure.test.mjs
  - scripts/performance-measure.test.mjs
  - apps/angular-ai-devtools/src/app/companion.spec.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - research/raw/m041-navigation.json
---

# T002 — Widen the page agent to Router.events beside the profiler subscription

## Context

The one page agent records change detection and nothing else: it holds a single profiler
subscription, and the router appears in it only as a name in the package-detection list.
A navigation is visible to the panel today only as the router's current URL, which is a
value from the last navigation rather than a record of it, and the stream a reader would
want has no replay — a reader attached after the fact sees nothing at all.

T001 measured what that widening has to carry: the classes the stream emits, each class's
own key set, the reach path that finds the `Router` without a new tap, and the two
route-config events that carry no navigation id. This task records the stream in that
shape and nothing more, because the four profiler events are load-bearing: the trigger and
the cycle opener are set from two of them, and a widening that moved either would be a
regression the milestone never intended.

The record is plain data by construction. The message boundary is serialized, so an
instance, an element, a function, a `UrlTree` or a snapshot object cannot cross it, and an
event that carried no navigation id is recorded with `id: null` rather than with the id of
the last navigation seen — the mistake that would let a later join attribute one
navigation's work to another.

## Approach

Add, never alter. The router subscription is created beside the profiler subscription in
the install path, resolved through the same debug API the agent already reads, and removed
by the same reset path; the profiler callback keeps its single subscriber and its four
meanings, and the profiler is never cleared with `null` because that would take every
callback with it, this agent's included.

One flat list, one entry per emission, in arrival order:

- the entry is built from the event alone: the class name the runtime reports for it, the
  page's own clock read at receipt, and each payload field the event carried. A field the
  event did not carry is `null`, so a reader never has to guess whether an absent key
  means "unknown" or "not applicable".
- `id` is `null` wherever the event carries none. It is never filled from the previous
  entry, from the open navigation, or from the router's current navigation, because those
  two route-config events are the ones SC5 forbids lending an id to.
- a routed snapshot contributes its own route-config path strings, in order, and nothing
  else: no snapshot object, no URL tree, no component reference. An event without such a
  snapshot contributes an empty list.
- an error payload contributes its own name and message only. The error object itself
  does not cross the boundary.
- nothing is coalesced, sorted or dropped. The list is what arrived, in the order it
  arrived, and the pairing rule belongs to the join that reads it.

The list is published the way the record already travels: one more field on the agent's
own plain-data record, read through the same debug handle and the same dispatch path, so
the panel needs no second instrumentation path and the page gains no DOM, no control and
no widget.

The two mutants the suite carries are the two defects this shape invites: an entry that
borrows the last navigation id, and a router subscription installed inside the profiler
callback so the profiler callback's own contract changes. Each reddens a named assertion
and names its defect by string.

Four suites already read this file's source as their own subject — the two measure suites
that derive their anchors from it, and the two panel specs that pin what the page agent's
record means — so the added code moves what they assert and they are part of this task
rather than a later repair. Each is re-cut with the failing assertion quoted, and the page
footprint suite's bound still holds after the widening.

## Interface contract

- Router record: the page agent publishes `routerEvents` beside the change-detection record, one entry per `Router.events` emission in arrival order, each `{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate, matchedPaths }` where `type` is the event's own class name, `at` is the page's own `performance.now()` reading at receipt, every field the event did not carry is `null`, and `matchedPaths` holds the primary route chain's own config paths in order for an event whose payload carried a route-tree snapshot and is empty otherwise.
- Navigation answer: `narrateNavigation(record)` answers `{ state, absence, navigations, unattributed }` where each navigation is `{ id, state, url, urlAfterRedirects, terminal, code, reason, error, stage, lastEvent, holder, absence, matched, loads }`, `state` is `ended` or `open`, `stage` is one of the four stage words or `null`, `loads` holds one entry per route-config load `{ route, startedAt, endedAt, durationMs, open }`, and `unattributed` lists an id-less load by kind and route.
- Pane answer: `navigationPanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per navigation with the route, the end route, the terminal or the stage, the holder and each load apart, and a cell holds the text of its own state or the empty string.

## Intent coverage

- SC1
- SC2
- SC5

## Acceptance criteria

1. The router subscription is added beside the profiler subscription and never inside it: the profiler is still called once with the same subscriber, the trigger and the cycle opener keep their meanings, the reset path removes both subscriptions, and the profiler is never cleared with `null`.
2. Every stream emission is recorded in one flat list in arrival order, one entry per emission, carrying the event's own class name, the page's own receipt time and only the fields that event carried, with nothing dropped, coalesced or reordered.
3. An event that carries no navigation id is recorded with `id: null`, never with the id of the last event seen or of the open navigation.
4. The record is plain data: no instance, element, function, URL tree or snapshot object crosses the boundary, a routed snapshot contributes only its own route-config path strings, and an error contributes only its own name and message.
5. An added recorded event travels the same entry shape as every other recorded event, so no surface has to know an event number to read one.
6. Two mutants redden named assertions naming their defects: one borrows the last navigation id, and one installs the router subscription inside the profiler callback.
7. The four suites that read this file's source as their own subject are re-cut where the added code moves what they assert, each with the failing assertion quoted, and the page footprint suite's bound still holds after the widening.

## Verify

```bash
node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-measure.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/render-phase-measure.test.mjs scripts/performance-measure.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts && npm run check
```

## Log

- pending
- widened \`extension/agent-main.js\` to \`Router.events\` beside the one \`ɵsetProfiler\` subscription: every record now publishes \`routerEvents\`, one flat list in arrival order, one entry shape \`{ type, at, id, url, urlAfterRedirects, route, reason, code, error, shouldActivate, matchedPaths }\` where \`type\` is the event's own class name and \`at\` the page's own receipt reading. Every field an event did not carry is \`null\` and nothing is borrowed: the two route-config classes keep \`id: null\` and never receive the id of the navigation in flight; \`matchedPaths\` carries only the snapshot's own config paths (\`[null, 'contract', '', 'list']\` on the measured frame); an error carries only its own name and message, with no \`target\` field at all for the value T001 measured as \`undefined\`. The \`Router\` is reached the measured way - \`getInjector\` on the host element, \`ɵgetInjectorResolutionPath\`, then the provider record whose \`token\` names it (the environment injector, never entry 0 and never \`provider.provide\`) - armed from \`start()\` beside the tap, never inside the profiler callback, and removed with the list by \`reset()\`; \`ɵsetProfiler\` is still called once with the same subscriber. agent-main suite 85/85 with six mutants naming their defect by string (synthesised route-load id, a second entry shape, the event number as \`type\`, the subscription installed inside the profiler callback, the raw error object, \`provider.provide\` instead of \`record.token\`); page-footprint 12/12 with its bound intact; performance-measure 25/25 and render-phase-measure 28/28 unmoved, their anchors (literal 24-37, \`setProfiler(\` 558, \`onEvent\` 573, opener 599/600, \`openCycle\` 738, \`queueMicrotask\` 747, \`closeCycle\` 1038) still holding; \`companion.spec.ts\` and \`update-cause-chain.spec.ts\` unmoved, both pinning a model the added field does not reach; the M040 frame pin re-cut for the additive \`routerEvents\` field and T001's \`reach.readFrom.cite\` re-cut to \`1075-1253\`; Verify green including \`npm run check\`: ready
