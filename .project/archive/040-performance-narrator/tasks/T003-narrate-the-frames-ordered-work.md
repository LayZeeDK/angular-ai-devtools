---
id: T003
title: Narrate the frame's ordered work with measured durations
wave: 3
status: done
deps:
  - T002
agent: commandcode-coder
base: 110d9fc59083186f52613da836073e57999091b2
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
- 2026-11-08 — built `extension/performance-narrator.js` as the milestone's one pure join: it reads the change-detection record T002 publishes and walks its `events` list (`{ type, pair, end, at, componentName }`) once, in recorded order, answering `narrate(frame) -> { state, intervals, unresolved }` (plus `absence` where `state` is `cannot-tell`). Matching rule as implemented, the one `research/raw/m040-work-events.json` `frames.rule` states: a start opens an interval in the order the frame recorded it; its matching end closes it last-in-first-out within its own pair, so an end belongs to the innermost open start of its own pair and can never be paired backwards with an outer one; an end with no open start of its own pair is reported by kind as `{ pair, type }` and builds no interval; a start the frame never closes is `unmeasured` with no `durationMs`, no `endedAt` and no name; a start and end that arrived before the frame's opener are already in the list T002 adopts, so the join never moves an event between frames and never reads a clock. A closed interval is `measured` with the identity its own two events carry (the start's name, otherwise its matching end's) and `durationMs = endedAt - startedAt`, where a `0` stays a measured zero; an interval whose own two events carry no identity is `cannot-tell` with the named absence `no-component-identity` and carries no name field at all — no node index, no list position, no neighbour's name and no fallback word. Nothing is sorted; no index, cost or name is a sort key; the answer is byte-identical on a second read.
- 2026-11-08 — `scripts/performance-narrator.test.mjs`: 10 tests (held-out E1, E2, E4, E5, E6, plus AC6, purity in a bare `node:vm` context with every host global a trap, the recording's own measured facts, and the module's own shape) with 9 real mutants, each pinning the untouched module first, mutating a copy, asserting the copy exhibits the defect, and reddening with a failure that names the defect by string: M1 an interval takes its end from the next event in the frame (E1, duration from the next event), M2 the interval list is rebuilt as a copy sorted by cost (E1, order is the recorded start order), M3 an interval is minted for a frame that carries no start (E2), M4 an unnamed interval is named by its position in the list (E4), M5 an unnamed interval borrows the nearest named neighbour (E4), M6 an unnamed interval is named with the `component` fallback word (E4), M7 an unclosed start takes a duration from the frame's last event (E5), M8 a measured zero is reported as a missing cost (E6), M9 an end closes the outermost open start of its pair (AC6). The `ChangeDetection` bracket the recording measured as `null` at both ends is pinned as `cannot-tell` with the absence, never a named interval; a start whose end lives in a later frame is pinned unmeasured in its own frame while that frame reports the end unresolved.
- 2026-11-08 — fixed the red T002 left: `research/raw/m040-work-events.json`'s `frames.agentFrame` line pin re-derived through its own canonical serialisation, so the recorded line is the line `extension/agent-main.js` yields for that anchor — `openBranch` 587→599, `openCall` 588→600, `openFunction` 604→738, `closeQueue` 616→747, `closeFunction` 892→1038, `tapLine` 547→558, `profilerTaps` still 1, every other byte of the recording unchanged and the file still the canonical serialisation of its record. `scripts/performance-measure.test.mjs`: 25/25 pass (28/28 with the two pins and the held-out mutant below), so the red is closed and `npm run check` is green behind it. The suite's own half of the pin was prepared and passes, and could not be landed: the base task declares three files and `land` refuses any other path (`landing allow-list differs from the base task: extra scripts/performance-measure.test.mjs`), and widening the contract mid-task is exactly what the declared-files rule forbids. The prepared, unlanded half — one `AGENT_ANCHORS` table naming each anchor text, the reader deriving each line from it (failing by name when an anchor disappears, as it already does), `validateFrames` reading the source at the recorded number back as that anchor, two pins that every anchor is still exactly one line of the agent and that each recorded line carries its anchor, and a held-out mutant that moves `tapLine` reddening while naming the anchor — is left with T005, which declares both `scripts/performance-measure.test.mjs` and `research/raw/m040-work-events.json` and whose AC3 is that no reported value is pinned as a literal but each is re-derived.
- 2026-11-08 — Verify (verbatim): `node --check extension/performance-narrator.js` clean; `node --check scripts/performance-narrator.test.mjs` clean; `node --experimental-strip-types --test "scripts/performance-narrator.test.mjs"` -> 10 tests, 10 pass, 0 fail (E1 non-vacuous M1/M2, E2 M3, E4 M4/M5/M6, E5 M7, E6 M8, AC6 M9 each naming its defect); `npx prettier --check extension/performance-narrator.js scripts/performance-narrator.test.mjs` -> "All matched files use Prettier code style!"; `npm run check` -> skill-lint, skills-registered, 15 verify-* check/test gates, 5 control-* contracts, scripts-in-step, tsc over scripts/skills/panel/extension/companion, verification gate (structure): pass, and format:check pass.
- 2026-11-08 — `npm test`: the node legs are green apart from two failures that are T005's by plan, not this task's — `scripts/overlay-verdict-claims.test.mjs` resolves M040 from `.project/STATE.md`'s branch and refuses the missing `research/raw/m040-verdict-claims.json` (ENOENT; 8/10 of its tests pass, and the file is absent from HEAD too), which is the same absence `PLAN.md:84` and T005's own Context name as failing by construction until T005 lands it; the two held-out suites that spawn `npm test` (`e3-zero-skipped`, `e4-idempotent-checks`) fail for that one reason. Measured: 1041/1043 node tests pass (the two failures are the claim-list pair), `run-user-scope-tests` pass, `test:skills` 628/628, `test:held-out` 20/22. No failure anywhere names this task's files, and `npm run check` is green at this head — ready
