# Intent — M040 performance-narrator

Lane: standard
Milestone: performance-narrator
Branch: gsd-path/M040
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A developer watches a frame that dropped and asks which component did the work in
it, and what it cost. Measured before planning, from the recording M039 took
(`research/raw/m039-render-phase.json`) and the page agent this checkout ships:

- **the events that bracket a component's work exist upstream.** The installed
  `@angular/core` declares **26** `ProfilerEvent` values, numbered 0 through 25,
  and the panel's 22.1.8 and the fixture's 22.2.2 declare the same list
  (`profiler.sources`, `profiler.identical: true`). Five of them are a start and an
  end that bracket one unit of work: `TemplateUpdateStart` **2** /
  `TemplateUpdateEnd` **3**, `LifecycleHookStart` **4** / `LifecycleHookEnd` **5**,
  `ChangeDetectionStart` **12** / `ChangeDetectionEnd` **13**, `ComponentStart`
  **18** / `ComponentEnd` **19**, `HostBindingsUpdateStart` **24** /
  `HostBindingsUpdateEnd` **25**. Between a start and its matching end the page has
  measured an interval; the difference is a duration, not an inference.
- **the page agent records four of the 26 and drops the rest.**
  `extension/agent-main.js:21-26` hard-codes `TemplateUpdateStart` 2,
  `TemplateUpdateEnd` 3, `OutputStart` 6 and `OutputEnd` 7, and `onEvent`
  (`extension/agent-main.js:562-602`) acts on those four and drops every other
  value. So none of the five paired work events above reaches a panel surface
  today: `ComponentStart`/`ComponentEnd` and `HostBindingsUpdateStart`/
  `HostBindingsUpdateEnd` are never recorded, and the events that would bracket a
  component are silently discarded.
- **the observable exists upstream; the gap is ours.** Because the 26 values are
  declared and delivered to the subscriber (`agent-main.js:544-546` passes
  `(event, instance, eventFn)` straight to `onEvent`), M040 is buildable rather
  than a `cannot-tell` deliverable — but only once the recording is widened to
  carry the paired start and end. That widening is the design decision this
  milestone turns on, and it is inside this milestone's scope.
- **what the recording does not settle.** M039 enumerated the values and their
  numbers; it did not measure, per value, whether the profiler passes a non-null
  `instance` or any name, and it measured no wall-clock time. So "which component
  did the work" is answerable only as far as the profiler names one, and "what it
  cost" is answerable only as the difference between a start and its matching end.

## Users

A developer whose page stuttered on a frame and who needs to know which component
did the work and how long the page measured it taking — and a reviewer checking
that the panel does not answer that question with a duration reconstructed from
event order, or a component named by its index in the list.

## Success criteria

1. Widened onto the fixture's recorded work, the page agent carries the five paired profiler events (`TemplateUpdate` 2/3, `LifecycleHook` 4/5, `ChangeDetection` 12/13, `Component` 18/19, `HostBindingsUpdate` 24/25), and a recorded frame with that work produces a finding listing the components in the order the profiler recorded their start events, each with the duration the page measured between its start and its matching end — and naming no component the recording does not carry.
2. Recording stays additive: the four events the page agent already records keep the meaning they have today — `OutputStart` still sets the cycle trigger and `TemplateUpdateStart` still opens the cycle — and every added event travels the same per-event record shape as those four, so no surface branches on a specific event number to read one.
3. When a work interval is bracketed by a `ComponentStart`/`ComponentEnd` pair but the profiler passes no component identity for it, the finding reports cannot-tell with a named absence — that the profiler bracketed work but named no component — and never names the component by its node index, its position in the list, or its nearest named neighbour.
4. Every reported cost is a duration the page measured: the difference between a start event and its matching end event as recorded. A start with no matching end in the frame is reported as unmeasured, never given a duration from the next event, a reconstructed timestamp, or a clock the panel read.
5. The panel renders the frame's ordered work with the component identity and the measured cost in separate columns, and renders nothing it was not given: no cost for an unmeasured interval, no component for an unnamed one.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | ordering | held-out | the components appear in the order their start events recorded, never sorted by cost, name, or node index |
| E2 | SC1 | precision | held-out | a work event the recording does not carry contributes no component, and no component is invented to fill a column |
| E3 | SC2 | encoding | held-out | an added event reaches a surface through the same record shape as the existing four, and `OutputStart` still sets the cycle trigger |
| E4 | SC3 | empty | held-out | a `ComponentStart`/`ComponentEnd` bracket with no identity yields the cannot-tell state naming the absence, and never a name minted from the node index |
| E5 | SC4 | precision | held-out | a start with no matching end in the frame reports the interval unmeasured, never a duration taken from the next event |
| E6 | SC4 | boundary | held-out | a start and its matching end at the same recorded instant report zero cost, not a missing cost |
| E7 | SC5 | encoding | held-out | each column renders only its own state, and an unmeasured interval renders no number |
| E8 | SC5 | idempotency | held-out | the same recorded frame rendered twice is byte-identical |
| E9 | SC6 | none | dismissed | the project gate is not a held-out check; it is the repository's own Verify |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a component the profiler did not name | criterion SC1 | the recording carries a start and an end and, per event, whatever identity the profiler passed; a component the recording does not carry has no place in the list |
| N2 | SC2 | change the meaning of the four events the agent already records, or record an added event in a different shape | criterion SC2 | `OutputStart` still sets the trigger and `TemplateUpdateStart` still opens the cycle; a surface that special-cases an event number is the branch this milestone forbids |
| N3 | SC3 | name an unnamed component by its node index, its position, or its nearest named neighbour | criterion SC3 | a node index is not a component name, and proximity is not evidence |
| N4 | SC4 | report a cost that is not the difference between a start and its matching end | criterion SC4 | a duration reconstructed from ordering or a panel clock is not a measurement |
| N5 | SC5 | render a cost or a component the recorded frame does not carry | criterion SC5 | the pane prints what it is given |
| N6 | SC6 | weaken an assertion, skip a case or re-cut a pin to reach green | criterion SC6 | a moved pin is evidence |

## Scope

In: the five paired profiler work events widened onto the page agent, the ordered
work per component, the duration measured between a start and its matching end, the
named absence that stands where a component identity is missing, and the panel
surface rendering the ordered work and its cost.

Out: any cost inferred from event order, a reconstructed timestamp, or a panel-side
clock; any component named by node index, list position, or proximity; any second
profiler tap or second append-only list beyond widening the one `ɵsetProfiler`
subscription the agent already holds; code generation; `@angular/animations`,
Angular SSR and `angular/components` (A5); DOM added to an inspected page (AR-3).

## Corrections

**2026-11-08 — M040 is buildable, and the widening is part of it.** The roadmap's
Risks line says "the profile records events, not durations; a cost inferred from
ordering is not a measurement", which reads as though no duration were available.
Measured in `research/raw/m039-render-phase.json`: the installed `@angular/core`
declares 26 `ProfilerEvent` values, identical in the panel's 22.1.8 and the
fixture's 22.2.2 (`profiler.sources`, `profiler.identical: true`), and five of them
are a start and an end that bracket one unit of work — `TemplateUpdate` **2/3**,
`LifecycleHook` **4/5**, `ChangeDetection` **12/13**, `Component` **18/19**,
`HostBindingsUpdate` **24/25**. Between a start and its matching end the page has
measured an interval, so a duration is available once both are recorded. The page
agent hard-codes four values (`extension/agent-main.js:21-26`: `TemplateUpdateStart`
2, `TemplateUpdateEnd` 3, `OutputStart` 6, `OutputEnd` 7) and `onEvent` drops the
rest (`extension/agent-main.js:562-602`), so none of the five paired work events
reaches a surface today. Widening `agent-main.js` to record those pairs is therefore
part of this milestone — it is the design decision the milestone turns on — and SC1
carries the measured duration while N4 forbids any duration that is not a
start-to-matching-end difference.

**2026-11-08 — the recording proves the events, not their identity.**
`research/raw/m039-render-phase.json` enumerated the 26 values and their numbers from
both installed packages; it did not measure, per value, whether the profiler passes a
non-null `instance` or any name. So "which component" is answerable only as far as the
profiler names one, SC3 makes the unnamed bracket a cannot-tell with a named absence,
and N3 forbids minting an identity from the node index. A first task must measure which
of the paired events carries an identity before SC1 can be met, and record the negative
if none does.

**2026-11-08 — the four existing events are load-bearing and must not be re-cut.**
`OutputStart` 6 sets the cycle trigger and `TemplateUpdateStart` 2 opens the cycle
(`extension/agent-main.js:562-598`), and the change-detection chain N1 reads that
trigger. Widening the record must leave them meaning what they mean today and record
an added event in the same shape, which SC2 carries and N2 forbids breaking.

## Risks

- **The verification target is the pinned zoneful portal worktree, and the agent
  refuses a zoneful page outright.** `AGENTS.md` `## Verification target` pins
  verification to the zoneful portal worktree while the portal migrates to zoneless,
  but the page agent refuses a zoneful page with "Zone.js change detection is not
  supported; use zoneless Angular 22" (`extension/agent-main.js:536-542`) before it
  ever subscribes to the profiler. A profiler recording therefore cannot be taken on
  the zoneful target at all. A verdict must name the portal route it tried and the
  artefact that target lacks — a zoneless profiler stream — and the fixture fallback
  (`spikes/ng222-app`, zoneless) then carries the evidence, as `AGENTS.md` requires.
- **The five paired events may not carry a component identity on this build.** If
  the profiler passes no instance for `ComponentStart`/`ComponentEnd`, SC1's subject
  reduces to SC3's absence for those intervals, and a task must record that rather
  than label by index.
- **The `ɵsetProfiler` subscription is single and shared** with the change-detection
  chain, so a second tap anywhere would corrupt both; the widening must extend the
  one subscriber the agent already holds.
- **The profiler callback's shape is internal API**, so a point release can change
  it; this recording cites the 22.1.8 and 22.2.2 values this head installs.
- **A duration measured across a frame boundary can pair a start with the wrong
  end** if a cycle interleaves; the matching rule is what SC4 rests on, and an
  unmatched start must report unmeasured rather than guess.
- **A frame that did the work quickly can read as "nothing was slow"** unless the
  fixture produces repeated work; SC5 and E7 keep an unmeasured or empty frame
  honest.

## Open questions

- [RESEARCH] Which of the five paired profiler events carry a non-null `instance` or any component name on the zoneless fixture at this head, and what does `ComponentStart`/`ComponentEnd` pass?
- [RESEARCH] What matching rule pairs a start event with its end when a cycle interleaves, and does the profiler guarantee nesting?
- [RESEARCH] What does the zoneful portal worktree report when the agent refuses it, and which portal route is the honest one for a verdict to name before the fixture fallback?
