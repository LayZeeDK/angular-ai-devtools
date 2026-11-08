---
id: T001
title: Measure the paired work events and the identity they carry
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/performance-measure.test.mjs
  - research/raw/m040-work-events.json
  - .project/research/m040-performance-narrator.md
---

# T001 — Measure the paired work events and the identity they carry

## Context

The milestone's subject is "which component did the work in this frame, and what it
cost", and the intent rests it on a measurement nobody has taken. M039 enumerated the
26 `ProfilerEvent` values and their numbers from both installed Angular core builds
and recorded them in `research/raw/m039-render-phase.json`, but it measured no
per-event instance and no wall-clock time. So two of the intent's premises are still
hypotheses: whether any of the five paired events carries a component identity (an
instance or a name the profiler itself passes), and whether both ends of a pair are
visible in one recorded frame.

This task takes that measurement at this head, before any later task is allowed to
name a component, and it records the negative where it finds one. SC3 makes the
unnamed bracket a cannot-tell with a named absence, and N3 forbids naming an unnamed
component by its node index, its position in the list or its nearest named neighbour,
so a task that assumed an identity would be manufacturing the evidence the criterion
is written to withhold. Where a pair carries no identity, the record says so and the
milestone reports the absence.

## Approach

One measurement run, recorded once, re-derived by a suite that reads the installed
packages and the recording rather than restating either.

The recording carries four sections and no claim beyond them:

- `pairs` — the five start/end pairs by name and number (`TemplateUpdate` 2/3,
  `LifecycleHook` 4/5, `ChangeDetection` 12/13, `Component` 18/19,
  `HostBindingsUpdate` 24/25), read from the installed builds by the same reader
  M039 used, and shown to be pairs of the enum this head installs rather than a
  quoted list.
- `identity` — for every pair, every emission site in the chunk the page actually
  loads, read as the arguments that call passes: an instance expression, a template
  or hook function, or nothing at all. The reader names the call site and the
  argument list it read; it does not infer an argument from a neighbouring call.
  From this section the record answers, per pair, whether a start carries an identity
  and whether its end does.
- `frames` — whether the two emission sites of a pair sit inside one bracketed call,
  and whether the page agent's own frame boundary (the microtask-delimited cycle it
  closes) can hold both ends. Where the two answers differ, both are recorded and the
  record says which one the narrator must obey, because an event arriving with no
  cycle open is a case the later tasks must handle rather than paper over.
- `witness` — a frame the page produced, with its provenance: the route driven, the
  build, the browser instance and the time, or the negative result with what was
  tried. The agent refuses a zoneful page before it ever subscribes, and the
  verification target is the pinned zoneful portal worktree, so the witness attempt
  names the portal route it tried and the artefact that target lacks (a zoneless
  profiler stream), and then the zoneless fixture carries the evidence as the
  repository's own rule requires. A witness that cannot be taken is recorded as a
  negative with its static substitute named as a substitute, never relabelled as a
  capture.

The sentence the intent most needs is short enough to test: for each pair, does the
profiler pass an identity, and does the agent's record see both ends in one frame. The
test re-derives the enum and every emission site's argument list from the installed
chunk on every run, so a point release that starts or stops passing an instance
reddens rather than leaving the milestone asserting a fact about an older install. The
test reads the recording for the frame and witness sections and names the provenance
each carries.

Nothing here drives a browser on every run: the witness attempt belongs to the
recording's provenance, and its repetition is the capture task's opt-in armed run.
Nothing here writes to the page: no second profiler tap, no page global, no append-only
list beyond the one subscription the agent already holds.

The write-up in `.project/research/m040-performance-narrator.md` states which intent
premises survived, which moved and which could not be measured, and answers the three
[RESEARCH] questions the intent left open — including the matching rule a start and
its end must obey when a cycle interleaves.

## Interface contract

None

## Files

- `scripts/performance-measure.test.mjs`
- `research/raw/m040-work-events.json`
- `.project/research/m040-performance-narrator.md`

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. The five pairs are enumerated from both installed builds by one reader, by name and number, and the reader — not a quoted list — is what derives them.
2. For every pair, every emission site in the chunk the page loads is recorded with the arguments it passes — an instance, a function, or none — and the record names the site it read rather than inferring an argument from a neighbour.
3. For every pair, whether both ends are visible in one recorded frame is answered from the emission sites and from the page agent's own frame boundary, with any disagreement between the two recorded and the rule the narrator must obey named.
4. The record answers, per pair, whether an identity is carried or not; where none is carried the record names that absence as the milestone's answer, so SC3's cannot-tell rests on a measurement rather than on an assumption.
5. Every recorded claim is re-derived by the suite from the installed chunk and the recording rather than transcribed, the run writes nothing, and the page gains no instrumentation.

## Verify

```bash
node --check scripts/performance-measure.test.mjs && node --experimental-strip-types --test "scripts/performance-measure.test.mjs" && npx prettier --check scripts/performance-measure.test.mjs && npm run check
```

## Log

- pending
