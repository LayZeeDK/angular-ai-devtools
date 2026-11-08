---
id: T003
title: Narrate the frame's ordered work with measured durations
wave: 3
status: pending
deps:
  - T002
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/performance-narrator.js
  - scripts/performance-narrator.test.mjs
  - research/raw/m040-work-events.json
---

# T003 — Narrate the frame's ordered work with measured durations

## Context

The agent now records the five paired events with a measured receipt time and the
component the profiler named, or no component at all. Turning that frame into the
milestone's answer is a pure join: which components did work, in which order, and how
long each interval the page measured actually took. Nothing else in this milestone is
allowed to invent the answer, because three of its criteria are about not inventing it.

The join is the only place the record's shape is read, and it is the only place the
pairing rule lives, so the panel that follows renders what this module answered rather
than re-deriving anything. That separation is what lets E4 (unnamed), E5 (unmeasured)
and E1 (ordered) be proven without a page and without a browser.

The join also has to survive the case T001 measured rather than the case the intent
hoped for: an interval whose two events carry no identity must answer cannot-tell with
the named absence, and must not reach for the nearest named neighbour, the node index
or the position in the list to fill a name in (N1, N3). A start with no matching end in
the frame is unmeasured, never a duration borrowed from the next event or from a clock
the join reads (N4).

## Approach

One pure function, published the way the sibling join is published, with no imports, no
DOM, no clock, no console and no network. It reads the frame it is handed and answers
intervals; it holds no state between calls.

Walking the frame's events once, in recorded order:

- a start opens an interval for its pair; its matching end closes it, last-in-first-out
  within that pair, so an end belongs to the innermost open start of its own pair and
  can never be paired backwards with an outer one. An end with no open start is not an
  interval: it is reported by kind as unresolved, and the join never walks backwards to
  find it a start.
- an interval is measured exactly when both ends are present; its duration is the end's
  measured receipt time minus its start's, which can be `0` and then is a measured zero
  rather than a missing cost. A start still open when the frame ends is unmeasured and
  carries no duration field at all.
- an interval is named by the identity its own two events carry — its start's component
  name when the start has one, otherwise its matching end's — and by nothing else: no
  node index, no list position, no neighbouring name, no fallback word. Where neither
  of its own events carries one, the interval is cannot-tell with the absence
  `no-component-identity` and carries no name field.
- nothing is sorted: the answer's order is the order the start events were recorded, and
  no cost, name or index is ever a sort key. A frame whose events the record does not
  carry produces no interval, because every interval is built from an entry the frame
  holds and the join invents no entry to fill a row.
- the answer's text is assembled from the same values in the same order every time, so
  the same frame answered twice is byte-identical; the pane copies that text rather
  than recomputing it.

The suite pins each behaviour before mutating it: a mutant answers a duration from the
next event, a mutant names an unnamed interval by its index, a mutant sorts by cost, a
mutant pairs an end backwards with an outer start, and a mutant mints an interval for an
event the frame does not carry. Each reddens a named assertion, and each failure names
the defect by string.

## Interface contract

- Frame record: the page agent publishes `events` on the change-detection record, one entry per recorded profiler event in emission order, each `{ type: number, pair: string, end: boolean, at: number, componentName: string | null }`; `at` is the page's own `performance.now()` reading at receipt, and `componentName` is the name the profiler's instance yielded or `null`.
- Narrator answer: `narrate(frame)` answers `{ state, intervals, unresolved }` where each interval is `{ state: 'measured', pair, componentName, startedAt, endedAt, durationMs }`, `{ state: 'cannot-tell', pair, absence: 'no-component-identity', startedAt }` or `{ state: 'unmeasured', pair, startedAt }`, in the order the start events were recorded; `unresolved` lists an end event with no open start by kind, and nothing else.
- Pane answer: `performancePanel(answer)` answers `{ state, message, lines, text, columns }` where `columns` carries one row per interval with the identity cell and the cost cell apart, and a cell holds the text of its own state or the empty string.

## Files

- `extension/performance-narrator.js`
- `scripts/performance-narrator.test.mjs`
- `research/raw/m040-work-events.json`

## Intent coverage

- SC1
- SC3
- SC4

## Acceptance criteria

1. A frame the record carries produces intervals in the order its start events were recorded, each measured interval carrying the identity its own events carry and the difference between its end's and its start's measured receipt times, with nothing sorted by cost, name or node index — held-out E1.
2. An interval whose own two events carry no identity answers cannot-tell with the named absence `no-component-identity` and names no component — no node index, no list position, no neighbouring name and no fallback word — held-out E4.
3. A start with no matching end in the frame is unmeasured and carries no duration, never a value taken from the next event, a reconstructed time or a clock the join reads — held-out E5.
4. A start and its matching end at the same recorded instant answer a measured zero, not a missing cost — held-out E6.
5. A work event the frame does not carry contributes no interval, and no interval is invented to fill a row — held-out E2.
6. An end event with no open start is reported by kind as unresolved and is never paired backwards with an earlier start of its own pair.
7. Every acceptance is proven non-vacuously: the untouched module pins first, a mutant reddens the pin, and the failure names the defect by string.

## Verify

```bash
node --check extension/performance-narrator.js && node --check scripts/performance-narrator.test.mjs && node --experimental-strip-types --test "scripts/performance-narrator.test.mjs" && npx prettier --check extension/performance-narrator.js scripts/performance-narrator.test.mjs && npm run check
```

## Log

- pending
