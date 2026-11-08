# M040 T001 — the paired work events and the identity they carry

Task: `T001` (wave 1). Recording: `research/raw/m040-work-events.json`.
Suite: `scripts/performance-measure.test.mjs` (25 tests, re-derives every
claim on each run).

## Question

The intent rests on two premises nobody had measured at this head:

1. does either end of the five paired profiler work events — `TemplateUpdate`
   2/3, `LifecycleHook` 4/5, `ChangeDetection` 12/13, `Component` 18/19,
   `HostBindingsUpdate` 24/25 — pass a component identity, and
2. are both ends of a pair visible in one recorded frame, so the difference
   between them is a measured duration rather than an inference.

M039 (`research/raw/m039-render-phase.json`) enumerated the 26 `ProfilerEvent`
values from both installed `@angular/core` builds and measured no per-event
instance and no wall-clock time. This task takes that measurement, and it
records the negative where it finds one, because SC3 makes the unnamed bracket
a cannot-tell and N3 forbids minting a name from a node index, a list position
or a nearest named neighbour.

## Verdict

**answered.**

- **Identity is carried by four of the five pairs, and not by the fifth.**
  `TemplateUpdate`, `LifecycleHook` and `HostBindingsUpdate` pass an instance on
  both ends. `Component` passes nothing on its start and the component instance
  on its end. `ChangeDetection` passes nothing at all — that is the milestone's
  named absence, measured, not assumed.
- **Both ends of every pair except `ChangeDetection` sit in one bracketed
  call.** `ChangeDetection`'s start is emitted in `ApplicationRef._tick` and its
  end in `tickImpl`'s `finally`, two different calls; the pair is matched by
  arrival order, not by nesting.
- **The page agent's microtask frame holds both ends for three pairs, only the
  inner brackets of `Component`, and never the start of `ChangeDetection`.** The
  disagreement between the bracketed call and the agent frame is recorded per
  pair, with the matching rule the narrator must obey.

## Commands

```bash
# the fixture, and the browser instance
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs up --target counter --json
node .commandcode/skills/control-ai-browsers/scripts/control.mjs up chrome-beta-gemma4 --json

# one throwaway profiler callback per page, on a tab `run` closes
node .commandcode/skills/control-ai-browsers/scripts/control.mjs run chrome-beta-gemma4 <witness-probe.js> --json

# the suite: read-only, no browser, no write
node --experimental-strip-types --test "scripts/performance-measure.test.mjs"

# teardown
node .commandcode/skills/control-ai-browsers/scripts/control.mjs down chrome-beta-gemma4
node .commandcode/skills/control-angular-dev-app/scripts/control.mjs down --target counter
```

Provenance: `chrome-beta-gemma4` (Chrome/158.0.8127.18, CDP 9334), the counter
fixture `spikes/ng222-app` on `http://localhost:4222/` (Angular 22.2.2,
zoneless — `typeof Zone === 'undefined'`), witness at
`2026-11-08T13:31:26.761Z`, evidence
`.commandcode/worktrees/tmp/control-ai-browsers/evidence/20261108-133126/chrome-beta-gemma4-run-1794144694979.json`.

## Raw output

The suite's derivation, printed as the record holds it. Emission sites are
`chunk:line` and the argument list after the event argument, as written in the
chunk (two chunks: the panel's `@angular/core` 22.1.8 and the fixture's 22.2.2;
both declare the same 26 values and the same 29 emission sites, so the numbers
below are identical in both).

### The five pairs, derived from both installed chunks

| Pair | Start | End |
| --- | --- | --- |
| `TemplateUpdate` | 2 | 3 |
| `LifecycleHook` | 4 | 5 |
| `ChangeDetection` | 12 | 13 |
| `Component` | 18 | 19 |
| `HostBindingsUpdate` | 24 | 25 |

The enum is read out of the shipped IIFE (`var ProfilerEvent;` … `})(ProfilerEvent ||`)
by one reader applied to both packages; the pair numbers are looked up in that
derived list, never quoted.

### Emission sites and the arguments they pass

| Pair | Start site | Start passes | End site | End passes |
| --- | --- | --- | --- | --- |
| `TemplateUpdate` | `_debug_node-chunk.mjs:5359` in `executeTemplate` (`profiler(preHookType, context, templateFn)`) | `context`, `templateFn` | `:5364` in `executeTemplate` (`profiler(postHookType, context, templateFn)`) | `context`, `templateFn` |
| `LifecycleHook` | `:259` `callHookInternal`; `:4880`, `:4888` `executeOnDestroys` | `directive, hook` / `callContext, hook` / `context, toCall` | `:265`, `:4884`, `:4892` | the same three pairs |
| `ChangeDetection` | `:12934` `_tick()` | **nothing** — `profiler(ProfilerEvent.ChangeDetectionStart)` | `:12944`, `:12962` in `tickImpl` | **nothing** — `profiler(ProfilerEvent.ChangeDetectionEnd)` |
| `Component` | `:5740` `renderComponent`, `:6166` `detectChangesInComponent` | **nothing** | `:5744`, `:6171` | `componentView[CONTEXT]` |
| `HostBindingsUpdate` | `:6234` `processHostBindingOpCodes` | `context` (`lView[directiveIdx]`) | `:6238` | `context` |

`TemplateUpdate`'s `preHookType`/`postHookType` are resolved from their own
`const preHookType = isUpdatePhase ? ProfilerEvent.TemplateUpdateStart : …`
lines (`:5358`, `:5363`) — the reader reads the constant, it does not guess from
the neighbouring call. Fixture line numbers differ (`:5497`, `:5502`, …) and the
argument lists do not.

### Per-pair identity, derived from the sites and measured on the page

| Pair | Identity | Start passes | End passes | Witness (start → end) |
| --- | --- | --- | --- | --- |
| `TemplateUpdate` | both | instance | instance | `_App`, `_Counter` → `_App`, `_Counter` (plus `App_Template` / `Counter_Template`) |
| `LifecycleHook` | both | instance | instance | `RouterOutlet` → `RouterOutlet` (`rememberChangeHistoryAndInvokeOnChangesHook`) |
| `ChangeDetection` | **none** | nothing | nothing | `null` → `null`, `eventFn` `undefined` → `undefined` |
| `Component` | end-only | nothing | instance | `null` → `_Counter`, `_App` |
| `HostBindingsUpdate` | both | instance | instance | `FormRoot` → `FormRoot` (0 events on `/`, 3 on `/field-form`) |

The page's profiler callback receives `(event, instance, eventFn)`; the shipped
call is `const profiler = function (event, instance = null, eventFn)`, so a site
that passes only the event hands the subscriber `instance = null` and
`eventFn = undefined`. Measured, not read off the signature: every
`ChangeDetection` event on both pages carried a null instance and an undefined
`eventFn`, and every `ComponentStart` did the same while every `ComponentEnd`
carried a component instance.

### Frames: the bracketed call, and the agent's own frame

`sites` = do the two emission sites sit in one bracketed call; `frame` = does
the agent's microtask-delimited cycle hold both ends (measured over three ticks
per page).

| Pair | Sites | Bracketing | Agent frame |
| --- | --- | --- | --- |
| `TemplateUpdate` | one `try`/`finally` in `executeTemplate` (start inside the `try`, end in its `finally`) | holds both | holds both — 6 of 6 brackets share a frame; the opener arrives before the frame it opens |
| `LifecycleHook` | start then `try`/`finally` (three site pairs) | holds both | holds both — 3 of 3 |
| `ChangeDetection` | **two calls**: `_tick()` emits the start, `tickImpl`'s `finally` emits the end | no single call | **never** — 3 of 3 starts arrive with no frame open, 3 of 3 ends inside one; 0 of 3 brackets share a frame |
| `Component` | start then `try`/`finally` (`renderComponent`, `detectChangesInComponent`) | holds both | **partly** — the outermost start of a task precedes the frame opener: 3 of 6 starts on `/` and 3 of 9 on `/field-form` arrive with no frame open; 3 of 6 brackets share a frame |
| `HostBindingsUpdate` | start then `try`/`finally` (`processHostBindingOpCodes`) | holds both | holds both — 3 of 3 on `/field-form` |

The agent's frame is exactly: opened by the first `TemplateUpdateStart` of a
task (`extension/agent-main.js:587-589`, `openCycle` at `:604`), closed from a
queued microtask (`:616`, `closeCycle` at `:892`), one `setProfiler` subscription
(`:547`). One observed frame order per page, identical across all three ticks:

```
/            [2, 3, 4, 5, 18, 2, 3, 19, 19, 15, 13]
/field-form  [2, 3, 4, 5, 18, 2, 3, 24, 25, 19, 18, 19, 19, 15, 13]
```

`OutputStart` 6 / `OutputEnd` 7 also arrive with no frame open (they precede the
tick, in the click handler) — the same class of case as `ChangeDetection`, and
the reason the later tasks must handle an event that arrives with no cycle open
rather than assuming one.

### The rule the narrator must obey

> The agent frame is not the profiler bracket. A start and its end must be
> matched by recorded arrival order and the measured nesting — a pair's end is
> emitted inside the same synchronous call as its start — and a start that
> arrives with no frame open belongs to the frame the same task opens later or
> is reported unmeasured. A duration is never taken from the agent's cycle
> alone.

Nesting is measured, not assumed: at each event the profiler was inside 3 or 4
open brackets (`TemplateUpdateStart` at depth 3–4, `ComponentStart` at 2–3,
`HostBindingsUpdateStart` at 4), so a LIFO stack over the recorded order is a
measured matching rule rather than a guess.

## What SC3 gets from this

SC3's cannot-tell now rests on a measurement:

- `ChangeDetection` 12/13 carries **no identity on either end**. An interval
  bracketed by that pair names no component, ever, on this build — the finding
  reports cannot-tell with the named absence "the profiler bracketed change
  detection and named nothing", and names no component from a node index, a
  position, a neighbour or the `eventFn` (which is `undefined` here anyway).
- `Component` 18/19 carries the identity **on its end only**. A `ComponentStart`
  with a matching end is nameable — from the end event, never from the start's
  position. A `ComponentStart` with no end in the frame is unnamed, and takes
  the same absence. This is the asymmetry the intent's risk line anticipated and
  can now state exactly.

## What it does not settle

- Whether a component can be named from anything other than the identity the
  profiler passes. The sites pass no name and the profiler publishes no
  component index; the extension's own `componentNameFor` reads the host element
  or the constructor, which is the agent's reading and not the profiler's.
- What a production build emits. Every site read here is in the development
  bundle the fixture serves; the agent already refuses a page without
  `ng.ɵsetProfiler`.
- How often a bracket arrives with no matching end. Three ticks per page were
  driven and every start seen was matched, so the unmatched case is T003's
  fixture, not this measurement. The profiler's own unmatched-end path exists
  (a recursive `ApplicationRef.tick` emits `ChangeDetectionEnd` before throwing
  and the outer `tickImpl` emits another), but it was not provoked here.
- Whether the sites move between point releases. The record cites the two
  versions this head installs (panel 22.1.8, fixture 22.2.2) and the suite
  re-derives every site and argument list on each run, so a point release that
  changes one reddens rather than leaving the milestone quoting an older
  install.
- What the portal page emits. The pinned zoneful worktree was **named and
  refused, not driven** — see below.

## The portal clause

`AGENTS.md` `## Verification target` pins verification to the zoneful Insurance
Portal worktree. The attempt, per the repository's rule, names what was tried:

- Target: `D:/projects/github/LayZeeDK/HaasStefan__ng-journal-insurance-portal-ai-devtools-zoneful`,
  pinned at `976752389c22bb563d2278c2d78f423cb2505669`, Angular **20.3.35**
  (`@angular/core ^20.3.29` installed as 20.3.35, `zone.js ^0.16.2`), route
  tried `/home`.
- Result: **negative.** The page agent refuses that target before it subscribes:
  `extension/agent-main.js:500` refuses any Angular older than 22.1.3, and
  `:536-542` refuses a zoneful page outright ("Zone.js change detection is not
  supported; use zoneless Angular 22"). The artefact the target lacks is a
  zoneless profiler stream at a supported version.
- The zoneless fixture (`spikes/ng222-app`, Angular 22.2.2, no `Zone` global)
  therefore carries the evidence, as `AGENTS.md` allows once the lacking
  artefact is named. This is recorded as a negative, never as a capture.

## What was tested, and how the suite keeps it honest

`scripts/performance-measure.test.mjs` re-derives on every run:

- the 26 enum values and the five pair numbers from **both** installed chunks
  (`pairs.sources`, `pairs.identical`);
- every one of the 29 emission sites in each chunk — line, call text, event
  argument, resolved constant, argument list, enclosing function — and deep-equals
  them against `identity.sites`, so a changed argument reddens;
- the per-pair identity answer and the bracketing from those sites;
- the agent's frame boundary (opener branch, opener call, closer queue, the one
  `setProfiler` tap, and the line numbers) from `extension/agent-main.js`;
- the frame counts and the disagreement set from the recording's own witness,
  cross-checked against the witness's per-event rows, its frame orders and its
  per-pair identity names;
- that the run wrote nothing (SHA-256 of the recording before and after) and that
  the suite itself carries no browser and no write.

Mutants prove the pins are not vacuous — each reddens naming its defect: a site
that lost its instance argument, a hidden emission site, a rewritten argument
list, a moved pair number, a `ChangeDetection` identity claim, a witness that
names a component for the unnamed pair, a second profiler tap, an opener moved
off `TemplateUpdateStart`, a dropped disagreement, a frame order that hides an
end, a portal negative relabelled as a capture, a non-zoneless page claimed as a
witness, and a per-event row that does not add up.
