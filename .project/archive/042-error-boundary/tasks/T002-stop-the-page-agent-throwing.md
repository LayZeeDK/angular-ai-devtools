---
id: T002
title: Stop the page agent throwing into the app's error handler
wave: 2
deps:
  - T001
status: done
agent: commandcode-coder
base: e7b67d2df1fde4dfcd206a07f89342145061d600
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/agent-main.test.mjs
  - extension/page-footprint.test.mjs
  - scripts/performance-measure.test.mjs
  - scripts/render-phase-measure.test.mjs
  - scripts/performance-capture.test.mjs
  - scripts/render-phase-capture.test.mjs
  - scripts/navigation-measure.test.mjs
  - scripts/navigation-capture.test.mjs
  - apps/angular-ai-devtools/src/app/companion.spec.ts
  - apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts
  - research/raw/m042-error-boundary.json
---

# T002 — Stop the page agent throwing into the app's error handler

## Context

The shipped extension throws `TypeError: Invalid value used as weak map key` out of its own epoch bookkeeping, twice per page, on both subjects S10 measured. It lands in the app's `ErrorHandler` because the throw escapes a queued microtask rather than a guarded callback, and in the page's error listener for the same reason. An instrument that throws into the app's error handler is blamed on the app, and this milestone reads its findings from exactly that channel: a `TypeError` arriving at the handler is indistinguishable from an app error unless the reader knows our own file produced it.

T001 measured the emission that carries the non-object identity, the exact error it produces, and what the epoch record holds for a check whose node epochs move and for one whose epoch holds. That measurement is this task's contract in both directions, because the intent's prohibition N6 forbids the cheap repair: reaching the absence of our own error by removing, disabling or emptying the epoch-change record the line protects is not a repair, and a test that only asserts the absence would accept it.

## Approach

A guard on the key, and nothing else. The epoch map is a `WeakMap` keyed by the check's identity, and a `WeakMap` accepts only objects; the profiler hands an embedded view's context, which for some control-flow block views is `null` or `undefined`. So the identity is tested before the record is written or read: an object identity keeps exactly the behaviour it has today, and a non-object identity is recorded as having no epoch entry rather than as having no changes. The distinction matters because the two answer different questions: no entry means this check cannot be diffed at all, while an empty list means it was diffed and nothing moved, and only one of them is true.

The frame record is the thing the defect actually costs. The throw escapes the microtask that closes the frame, so the dispatch never runs and the whole frame is lost — T001 measured whether that is what happens, and the suite asserts the dispatch that follows the guarded path. Nothing in the reset path, the subscriber count, the trigger or the cycle opener moves: the profiler is still installed once, `ɵsetProfiler(null)` is still never called, and the map is still cleared only where it always was.

Both halves are pinned in one place. The suite drives the shipped file through the same boot the reproduction used, asserts that the non-object identity produces no agent-thrown error and no lost frame, and asserts that an object identity whose node epoch moved still names that node id — so an edit that reaches the absence by silencing the record reddens the second assertion, and the two cannot be traded against each other.

Six suites read this file as their own subject and derive anchors or bounds from its text, so they are part of this task rather than a later repair: each is re-cut where the guard moves what it asserts, with the failing assertion quoted, or is proven unmoved by running it. The page footprint bound is a byte budget on the shipped file and is checked to still hold.

## Interface contract

- Record: the page agent publishes a boundary section beside its change-detection and router records, each entry `{ route, error: { name, message, cause }, details: { declarationType, declarationInstanceName, caughtBy, boundaryType, boundaryReset }, at }`, where `route` is `hook` or `handler`, every field the record did not carry is `null`, and `cause` is present only where the boundary wrapped a value that is not Error-like.
- Answer: `readErrorBoundary(record)` answers `{ state, absence, findings, absences, version }` where `state` is `caught`, `cannot-tell` or `idle`, `absence` is one of the named absences or `null`, each finding is `{ declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route, replacedSubtree }`, and `absences` lists one named absence per unanswered question.
- Pane answer: `errorBoundaryPanel(answer)` answers `{ state, message, lines, text, cells }` where each cell holds the text of its own state or the empty string, and `lines` carries one line per fact the answer carried.

## Intent coverage

- SC6

## Edges

None; E12 and E13 are this task's held-out pins, in the shape the intent's edge table names.

## Acceptance criteria

1. The throw cannot happen: for a check whose identity is not an object the agent records no epoch entry and never writes one, and the frame record still reaches the page's dispatch, proven by booting the shipped file through the same subscriber drive that reproduced the throw before the repair.
2. The epoch record still does its work: an object identity whose node epoch moved records that node's id in its own list, a node whose epoch held is not named, and the list is never emptied, skipped or replaced by a constant.
3. Held-out E12: a page load and a reload each record zero agent-thrown TypeErrors, and the epoch record still names every changed epoch id it named before the repair.
4. Held-out E13: two loads captured in one browser session each record zero agent-thrown errors, and no epoch change is attributed to the other page's instance.
5. The repair is a guard and not a silencing: the map is still written for every object identity, cleared only by the reset path, `ɵsetProfiler(null)` is never called, and the agent still installs exactly one profiler subscriber.
6. Every suite that reads this file's source as its own subject is re-cut where the guard moves what it asserts, each with the failing assertion quoted, or is proven unmoved by running it, and the page footprint suite's bound still holds.

## Verify

```bash
node --check extension/agent-main.js && node --check extension/agent-main.test.mjs && node --experimental-strip-types --test "extension/agent-main.test.mjs" "extension/page-footprint.test.mjs" "scripts/performance-measure.test.mjs" "scripts/render-phase-measure.test.mjs" "scripts/performance-capture.test.mjs" "scripts/render-phase-capture.test.mjs" "scripts/navigation-measure.test.mjs" "scripts/navigation-capture.test.mjs" && npx nx run angular-ai-devtools:test && npx prettier --check extension/agent-main.js extension/agent-main.test.mjs scripts/performance-measure.test.mjs scripts/render-phase-measure.test.mjs apps/angular-ai-devtools/src/app/companion.spec.ts apps/angular-ai-devtools/src/app/update-cause-chain.spec.ts && npm run check
```

## Held-out

E12 and E13, both in `extension/agent-main.test.mjs`, each pin proven non-vacuously.

## Log

- pending
- guarded the epoch map's key in `extension/agent-main.js` and nothing else: `diffEpochs` now computes `keyed` — exactly the identity domain a `WeakMap` accepts, an object or a function — before the entry is read or written, and `if (!keyed) return changed;` sits above `prevEpochs.set(instance, next)`. A non-object identity (the `null`/`undefined` an embedded block view's context arrives as at the five sites T001 measured) therefore gets no epoch entry at all rather than an entry under an identity that is not its own, and the delta answers the empty list because there is nothing to diff against. The write is not wrapped in a `catch`, the line is not deleted, the reset path still replaces the map and nothing else does, `ɵsetProfiler` is still called once and never with `null`, and the edit is line-neutral on purpose: `extension/agent-main.js` still ends at 2011 lines, `prevEpochs.set(instance, next);` is still line 1034 and `function closeCycle()` still line 1038, so `research/raw/m040-work-events.json` (`agentFrame.closeFunction: 1038`), `research/raw/m041-navigation.json` (`reach.readFrom.cite: extension/agent-main.js:1750-1839`) and T001's own recording keep every anchor they carry and none of those three files was touched. The frame is no longer lost: a frame carrying `null`, `undefined` and a component instance dispatches `records: 1`, `checks: 3`, and the non-object checks travel the key set a valid check travels. The delta still names: `n0` moved answers `["n0"]`, both moved `["n0","n1"]`, nothing moved `[]`, and the first pass after `reset()` `[]` — T001's measured `movedOne`/`movedBoth` cases. `scripts/navigation-capture.test.mjs` carried two anchors this milestone moved rather than this edit — `M041 must resolve to the live intent, which STATE.md binds to M041` (M041 is archived with its own intent, so the resolver answers `.project/archive/041-navigation-blocking/intent/INTENT.md`) and `M042 must raise rather than answer` (STATE now binds M042, so the live intent answers for it and the refusal is the next milestone's) — and both were re-cut to ask `boundMilestone()` (STATE's branch line, read the way the resolver reads it) instead of a literal that goes stale at every milestone; the refuse-rather-than-fall-back pin is intact and still non-vacuous. `extension/agent-main.test.mjs` gains E12, E13 and an AC5 pin plus three real mutants (M1 drops the non-object check from the record, M2 never writes the map, M3 restores the throw), each reddening with the lost frame, the emptied moved-epoch case and the throw named by string.
- The task's Verify passed verbatim at this head, in its own order and `&&`-joined: `node --check` over `extension/agent-main.js` and `extension/agent-main.test.mjs` silent; the eight declared suites reported `tests 226 / pass 226 / fail 0`, E12 and E13 among them; `npx nx run angular-ai-devtools:test` reported 31 files and 345 tests green; `npx prettier --check` over the six listed files reported every one matched; `npm run check` exited 0 with `verification gate (structure): pass` and the formatting leg green. Measured before the repair and after it, one frame carrying a `null`, an `undefined` and a component instance: before, `TypeError: Invalid value used as weak map key` and `records: 0`; after, no throw and `records: 1` with `checks: 3`. Nothing outside the twelve declared files was written, and `research/raw/m042-error-boundary.json` is untouched: T006 owns its re-capture, and every anchor it and the two earlier recordings carry still holds because this edit is line-neutral. ready.
