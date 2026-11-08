# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: df142d42d0988360240239fd2043aa1162a761bd
Wave scope: T003, landed at `357507abff6555cb2f290632c7ccd2a28ebdb31a` — the pure join over a recorded frame.

## T003 — Narrate the frame's ordered work with measured durations: pass

- ✅ `node --experimental-strip-types --test scripts/performance-narrator.test.mjs`, run in this session at df142d4: `ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`, `ℹ duration_ms 479.9555`. The same suite inside the four-suite run reports `ℹ pass 74`, `ℹ fail 0` overall.
- ✅ The join is one pure function that reads the frame it is handed and nothing else: `extension/performance-narrator.js:257` (`function narrate(frame)`), `:140-144` (`eventsOf`), `:151-164` (`readEntry` reads `pair`, `end`, `at`, `componentName` and nothing else), with no import, no DOM and no clock (`:35-39`, pinned by `scripts/performance-narrator.test.mjs:1310` and by the bare-`node:vm` purity case at `:995`).
- ✅ Ordering is the recorded start order and nothing is sorted: starts are appended in frame order (`extension/performance-narrator.js:278-286`), each answer slot is keyed by that position (`:264-269`, `:297-298`), and the answer is assembled by walking those positions (`:303-309`). `scripts/performance-narrator.test.mjs:1054` (E1) passes, and its M2 (`:1090`) sorts a copy by cost and reddens with "E1 the intervals are in the order the start events were recorded".
- ✅ The duration is the difference between the two measured receipt times: `extension/performance-narrator.js:188-197` writes `durationMs: endedAt - startedAt` from the entry's `at` (`:157-162`), and no other field can supply one. M1 (`scripts/performance-narrator.test.mjs:1070`) takes an end from the next event and reddens with "E1 the end is the recorded receipt time"; the run above prints both non-vacuous lines.
- ✅ A measured zero stays a measured cost: `durationMs` is `endedAt - startedAt` with no truthiness test (`extension/performance-narrator.js:188-197`), pinned by `scripts/performance-narrator.test.mjs:1102` (E6) and by M8 (`:1115`), which replaces the zero with a missing cost and reddens with "E6 the difference between the two readings is a measured zero".
- ✅ An unnamed interval is cannot-tell with the named absence: `extension/performance-narrator.js:180-183` (`identityOf` reads only the interval's own two names) and `:202-209` (the answer carries `state: cannot-tell`, `absence: no-component-identity`, and no name field and no duration). `scripts/performance-narrator.test.mjs:1159` (E4) passes, with three mutants reddening it — position (`:1181`), nearest named neighbour (`:1211`) and the `component` fallback word (`:1228`).
- ✅ An unclosed start is unmeasured and carries no duration: `extension/performance-narrator.js:213-215` (`{ state, pair, startedAt }` — no `durationMs`, no `endedAt`, no name) is what `:303-309` substitutes for a position no end closed. `scripts/performance-narrator.test.mjs:1240` (E5) passes; M7 (`:1263`) turns it into a measured interval and reddens with "E5 a frame with an open start is unmeasured".
- ✅ Matching is last-in-first-out within the pair, and an end with no open start is unresolved rather than walked backwards: `extension/performance-narrator.js:289-299` pops the innermost open slot of the entry's own pair and pushes `{ pair, type }` when the stack is empty. `scripts/performance-narrator.test.mjs:1280` (AC6) passes and its M9 (`:1293`) closes the outer start instead, reddening with "AC6 the end that arrives last closes the outer start, not the inner one".
- ✅ An entry the frame does not carry contributes nothing: `extension/performance-narrator.js:274-276` skips an unreadable entry instead of minting a row, and a frame with no readable list answers `frame-unreadable` (`:258-261`). `scripts/performance-narrator.test.mjs:1127` (E2) passes; M3 (`:1142`) mints an interval for a frame with no start and reddens with "E2 an empty frame carries no interval".

## Intent coverage

### SC1 — Widened onto the fixture's recorded work, the page agent carries the five paired profiler events (`TemplateUpdate` 2/3, `LifecycleHook` 4/5, `ChangeDetection` 12/13, `Component` 18/19, `HostBindingsUpdate` 24/25), and a recorded frame with that work produces a finding listing the components in the order the profiler recorded their start events, each with the duration the page measured between its start and its matching end — and naming no component the recording does not carry.: pass

- ✅ The five paired events are carried by the record wave 2 landed (`extension/agent-main.js:24-37`, twelve values, `extension/performance-narrator.js:41-44` documents that entry shape) and this wave turns that frame into the finding: `extension/performance-narrator.js:257` answers `{ state, intervals, unresolved }` with one interval per recorded start.
- ✅ "Listing the components in the order the profiler recorded their start events" is `extension/performance-narrator.js:278-286` plus `:303-309` and is pinned by the E1 case (`scripts/performance-narrator.test.mjs:1054`), with M2 (`:1090`) proving order is not cost-sorted.
- ✅ "Each with the duration the page measured between its start and its matching end" is `:195` (`durationMs: endedAt - startedAt`) over the page's own receipt times, pinned by E1 and E6 (`scripts/performance-narrator.test.mjs:1102`) with M1 (`:1070`) and M8 (`:1115`) reddening.
- ✅ "Naming no component the recording does not carry" is `:180-183` with `:202-209`: an interval is named only by its own two events, and an interval whose events name nobody answers the absence. E4 (`:1159`) with three mutants (`:1181`, `:1211`, `:1228`) holds it.
- ✅ The suite that proves all of it is green in this session (`ℹ tests 10`, `ℹ pass 10`, `ℹ fail 0`), so the criterion is closed at this wave rather than inherited.

### SC3 — When a work interval is bracketed by a `ComponentStart`/`ComponentEnd` pair but the profiler passes no component identity for it, the finding reports cannot-tell with a named absence — that the profiler bracketed work but named no component — and never names the component by its node index, its position in the list, or its nearest named neighbour.: pass

- ✅ "Reports cannot-tell with a named absence — that the profiler bracketed work but named no component" is `extension/performance-narrator.js:202-209` (`absence: NO_COMPONENT_IDENTITY`) applied wherever neither of an interval's own events carries a name (`:219-223`), and the frame-level statement of it at `:228-241`.
- ✅ "Never names the component by its node index, its position in the list, or its nearest named neighbour" is three separate mutants rather than one assertion: `scripts/performance-narrator.test.mjs:1181` (position), `:1211` (nearest named neighbour) and `:1228` (the fallback word) each redden "E4 a cannot-tell interval carries the four contract fields and no name and no cost" against an untouched pin taken first (`:1159`).
- ✅ The absence is the one T001 measured, not a placeholder for it: the `ChangeDetection` bracket T001 found null at both ends (`research/raw/m040-work-events.json:2140-2147`) answers `cannot-tell` with `no-component-identity`, and `Component`'s end-only identity (`:1987`) is why an interval can be named from its end and an unclosed `ComponentStart` cannot (`extension/performance-narrator.js:180-183`).
- ✅ The green run above (`10` pass) is this session's.

### SC4 — Every reported cost is a duration the page measured: the difference between a start event and its matching end event as recorded. A start with no matching end in the frame is reported as unmeasured, never given a duration from the next event, a reconstructed timestamp, or a clock the panel read.: pass

- ✅ "Every reported cost is a duration the page measured: the difference between a start event and its matching end event as recorded" is `extension/performance-narrator.js:188-197`: `durationMs` is computed from the two entries' `at` readings and from nothing else, and `readEntry` (`:151-164`) rejects an entry whose `at` is not a finite number, so a cost can only come from a measured receipt time.
- ✅ "A start with no matching end in the frame is reported as unmeasured" is `:213-215` with `:303-309`; M7 (`scripts/performance-narrator.test.mjs:1263`) gives it a duration from the frame's last event and reddens with "E5 a frame with an open start is unmeasured".
- ✅ "Never given a duration from the next event, a reconstructed timestamp, or a clock the panel read" is held three ways: M1 (`:1070`) takes the next event's time and reddens, the module reads no clock at all (`:1310`, "carries no import, no DOM, no clock, no console and no network", plus the trap-every-global purity case at `:995`), and a start and its end at one instant stay a measured `0` (E6 at `:1102`, M8 at `:1115`).
- ✅ The suite's `10` passing tests above are this session's run.

Artifact size: 9054 bytes.
