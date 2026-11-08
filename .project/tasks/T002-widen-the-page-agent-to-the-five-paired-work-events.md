---
id: T002
title: Widen the page agent to the five paired work events
wave: 2
status: pending
deps:
  - T001
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
  - extension/page-footprint.test.mjs
  - research/raw/m039-render-phase.json
  - scripts/render-phase-measure.test.mjs
  - scripts/render-phase-capture.test.mjs
  - scripts/render-phase.test.mjs
  - scripts/panel-render-phase.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/companion.spec.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
---

# T002 — Widen the page agent to the five paired work events

## Context

`extension/agent-main.js` hard-codes four of the 26 `ProfilerEvent` values and drops
the rest: `TemplateUpdateStart` 2, `TemplateUpdateEnd` 3, `OutputStart` 6 and
`OutputEnd` 7 (`extension/agent-main.js:21-26`), and `onEvent` acts on those four and
returns for every other value. None of the five paired work events therefore reaches a
record today, so there is no duration to report and no component to order.

T001 measured, at this head, whether each of the five pairs carries a component
identity and whether both ends land inside one frame. This task is the widening that
measurement licenses: the same one `ɵsetProfiler` subscription the agent already
holds gains the five pairs, and the record gains one measured receipt time per event,
so a difference between a start and its matching end is a duration the page measured
rather than one the panel reconstructs from event order.

Two of the four existing events are load-bearing and must not be re-cut: `OutputStart`
sets the cycle trigger and `TemplateUpdateStart` opens the cycle, and the
change-detection chain reads that trigger. SC2 carries that; N2 forbids breaking it.
The widened record must therefore be additive: the four keep their recorded shape and
their meaning, the added events travel a shape every event travels, and no surface has
to know an event's number to read a value out of it.

Three suites pin the agent beyond its own: the page-footprint suite boots the module
and measures what it adds to the page, the two M039 suites that derive the agent's
`ProfilerEvent` literal and hold it against `research/raw/m039-render-phase.json`, and
three panel specs that name the module's record shape in their contract comments. All
of them are declared here because the change moves what they assert or was measured to
have cost this repository a gate cycle when omitted.

## Approach

One record, one subscription, no second tap.

The agent's `ProfilerEvent` literal grows to the twelve values the five pairs need
(TemplateUpdate 2/3, LifecycleHook 4/5, OutputStart 6/7, ChangeDetection 12/13,
Component 18/19, HostBindingsUpdate 24/25), in value order, and `onEvent` records each
of them in a frame-level list in emission order:

- each entry carries the event type, the pair it belongs to and whether it starts or
  ends it, the page's own `performance.now()` reading taken at receipt, and the
  component name the profiler's instance yielded — or `null` when the profiler passed
  no instance. Nothing derives a name from a node index, a position, a neighbour or the
  recorder's existing `'component'` fallback: an event with no instance is recorded
  with no name, which is what lets the narrator answer cannot-tell honestly.
- the existing per-check `events` list keeps exactly what it carries today — the four
  bare event numbers in emission order — and `OutputStart` still sets the pending
  trigger while `TemplateUpdateStart` still opens the cycle. The added events do not
  create a check, do not open a cycle and do not touch the trigger.
- an added event that arrives with no cycle open is still recorded in the frame-level
  list, because the record's frame boundary is the microtask the agent closes, not the
  template update. T001 measured whether that case occurs; the recorder handles it
  either way and says which it saw.

The frame-level list is the same per-event shape for all twelve values, and no surface
reads an event by number: the pair name and the start/end bit travel with the entry, so
a view reads fields rather than comparing integers.

The M039 recording's `profiler.agent` block is a derivation of the agent's literal and
its `onEvent` citation; widening the literal moves it. It is re-cut through the
recording's own writer — the opt-in armed run of the M039 capture suite, which owns
that file — or, where the writer cannot run, by hand in the recording's canonical
serialisation, with every other section byte-identical. No assertion in either M039
suite is weakened: the pins that hold the recording against the shipped source stay
exactly as strong, and they are the proof that the re-cut is honest.

The agent's own suite gains the non-vacuous half: the untouched module pins first, a
mutant that drops an added end event and a mutant that records an added event in a
second shape each redden a named assertion, and each failure names the defect by
string.

## Interface contract

- Frame record: the page agent publishes `events` on the change-detection record, one entry per recorded profiler event in emission order, each `{ type: number, pair: string, end: boolean, at: number, componentName: string | null }`; `at` is the page's own `performance.now()` reading at receipt, and `componentName` is the name the profiler's instance yielded or `null`.
- Narrator answer: `narrate(frame)` answers `{ state, intervals, unresolved }` where each interval is `{ state: 'measured', pair, componentName, startedAt, endedAt, durationMs }`, `{ state: 'cannot-tell', pair, absence: 'no-component-identity', startedAt }` or `{ state: 'unmeasured', pair, startedAt }`, in the order the start events were recorded; `unresolved` lists an end event with no open start by kind, and nothing else.
- Pane answer: `performancePanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per interval with the identity cell and the cost cell apart, and a cell holds the text of its own state or the empty string.

## Files

- `extension/agent-main.js`
- `extension/agent-main.test.mjs`
- `extension/page-footprint.test.mjs`
- `research/raw/m039-render-phase.json`
- `scripts/render-phase-measure.test.mjs`
- `scripts/render-phase-capture.test.mjs`
- `scripts/render-phase.test.mjs`
- `scripts/panel-render-phase.test.mjs`
- `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`
- `apps/angular-ai-devtools/src/app/companion.spec.ts`
- `apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts`

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. The agent records the five pairs — TemplateUpdate 2/3, LifecycleHook 4/5, ChangeDetection 12/13, Component 18/19, HostBindingsUpdate 24/25 — in one frame-level list in emission order, each entry carrying its type, its pair, whether it starts or ends, a measured receipt time from the page's own clock, and the component name the profiler's instance yielded or `null`.
2. Recording stays additive: `OutputStart` still sets the cycle trigger, `TemplateUpdateStart` still opens the cycle, and the per-check `events` list still carries the four bare event numbers in emission order, while the frame-level list uses one shape for all twelve recorded events.
3. An event the profiler passes no instance for is recorded with `componentName: null`, never with a name derived from a node index, a list position, a neighbour or the recorder's `'component'` fallback.
4. **held-out E3:** an added event reaches a surface through the same per-event record shape as the existing four, and `OutputStart` still sets the cycle trigger, proven in `extension/agent-main.test.mjs`.
5. The M039 recording's derived agent block is re-cut through its own writer so every value still holds — the widened `actsOn`, and citations that still bracket the literal and the `onEvent` function — and neither M039 suite's assertions were weakened to get there.
6. A mutant that drops an added pair's end event, and a mutant that records an added event in a second shape, each redden a named assertion, and each failure names the defect by string.

## Verify

```bash
node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --check scripts/render-phase-measure.test.mjs && node --check scripts/render-phase-capture.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/render-phase.test.mjs" "scripts/panel-render-phase.test.mjs" && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/render-phase-measure.test.mjs scripts/render-phase-capture.test.mjs && npm run check
```

## Log

- pending
