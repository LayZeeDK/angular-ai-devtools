# M050 — dead-click

## Problem

An interaction that produced nothing is the hardest thing to see in a page's record: a work item that
started and never ended, a navigation that started and never completed, a boundary that caught an
error and never reset. Each is a recorded event whose consequent is absent, and today nothing names
them, so an agent reading the panel sees a list of events and cannot tell which one stopped halfway.

The roadmap calls this a dead click and assumes the page records clicks. Measured at `74d00e63`, it
does not — see `## Corrections`.

## Users

The agent driving the panel, and the developer waiting on its answer. Both need the event that has no
consequence, named with the window it was judged over, rather than a guess about the handler.

## Success criteria

1. A recorded event whose consequent is absent from the record is named with the event's own fields and the window it was judged over; a mutant that reports a paired event reddens the pin.
2. A record that cannot bound the window reports cannot-tell naming the absence, never a dangling event.
3. A record whose events belong to none of the measured consequence chains reports cannot-tell rather than treating every event as dangling.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
| E1 | SC1 | boundary | criterion SC1 | A `*Start` with its matching `*End` is paired and never reported; the pair is matched on the record's own fields, not on adjacency. |
| E2 | SC1 | precision | criterion SC1 | A `*Start` whose `*End` is absent within the window is reported with its own fields and the window bounds. |
| E3 | SC2 | empty | criterion SC2 | A record carrying no window bound reports cannot-tell with its reason, never a list of dangling events. |
| E4 | SC2 | boundary | held-out | A record with one dangling event and one paired event renders exactly one finding, and the same suite asserts the all-paired case, so "nothing is dangling" cannot collapse into "nothing was compared". |
| E5 | SC3 | boundary | criterion SC3 | An event belonging to no measured chain is counted as considered and never reported as dangling. |
| E6 | SC1 | idempotency | criterion SC1 | Judging the same record twice returns the same findings in the same order. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
| N1 | SC1 | a cause | criterion SC1 | name a handler, a component, an intent or a remedy the record does not state |
| N2 | SC2 | an absence | criterion SC2 | render an unbounded record as clean, quiet or ok |
| N3 | SC3 | a chain | criterion SC3 | invent a pairing the record does not define, or pair by adjacency alone |
| N4 | SC1 | the inspected page | criterion SC1 | add DOM to a page, or move any interaction out of the panel (AR-3, AR-6) |
| N5 | SC1 | the record | criterion SC1 | read the page, or a clock, at judgement time; the finding is computed from the record alone |

## Scope

In: the three consequence chains the agent already records — the profiler work pairs
(`extension/agent-main.js:25-38`), the router's `NavigationStart`→`NavigationEnd` (`:1474`), and a
boundary arrival with its `boundaryReset` (`:2069`) — a pure judgement that reports an event whose
consequent is absent within the window, naming the event and the window, and the absence reported when
the window cannot be bounded.

Out: any record of a click or of what the user did, which this repository does not produce; a
page-side control or widget; app code generation; `@angular/animations`, Angular SSR and
`angular/components` (A5); DOM added to the inspected page (AR-3).

Surfaces: panel

## Corrections

**The roadmap's premise is falsified on its own subject, and the milestone is re-pointed at the
consequence chains the record defines.** Measured at `74d00e63`:

- The page records no click: `interaction` occurs 0 times in `extension/agent-main.js`. Across
  `extension/*.js` it now occurs 7 times, all of them in `extension/interaction-story.js` — M049's
  narration, which reads the record rather than recording anything. Measured by T001, which
  corrected this line: the earlier 0-across-every-file count was taken before that module existed.
- The only click listener in `extension/` is the panel's own element picker: `attachInput(window,
  'click', onClick, true)` at `extension/overlay.js:507`, through `attachInput` at `:440`; `onClick`
  (`:356`) returns unless `armed`, then calls `preventDefault` and locks the element. It selects what
  to inspect and suppresses the page's handling, so it cannot observe a dead click and does not record
  one.
- What the record does define is three consequence chains: the profiler's `TemplateUpdate`,
  `LifecycleHook`, `Output`, `ChangeDetection`, `Component` and `HostBindingsUpdate` `Start`/`End`
  pairs (`extension/agent-main.js:25-38`), the router's `NavigationStart`→`NavigationEnd`
  (`routerEvents`, `:1474`), and a boundary arrival carrying `boundaryReset` (`:2069`).

So "the absence of a following event" is kept — it is the milestone's real subject — and the event
that precedes it is a recorded one rather than a click. SC1 and its edges are stated over those
chains, and T001 measures them before any judgement is written.

A second correction, of the previous milestone's evidence: M049's record claimed no extension file
registers a UI listener, because its search looked for `addEventListener('click'` and the overlay
attaches through a wrapper. That is corrected in `research/raw/m049-streams.json` at `74d00e63`; the
conclusion stands, the evidence did not.

**T001 narrowed the judgeable chain, and the plan follows the measurement.** Only the router's chain
pairs a start with its consequent on an identity field: `NavigationStart` and its terminal carry the
navigation's own `id` (`extension/agent-main.js:1639`). The work chain is refused — `pair`/`end`
(`:697`, `:698`) name a family and a side and identify no particular start, the file says so itself at
`:637`, and `ComponentStart` carries no identity (`:620`), so pairing two open starts would be pairing
by position (N3). The boundary chain is refused because the record keeps no reset at all: the twelve
`boundaryReset`-related lines are the agent's own teardown, so the consequent cannot be absent.

Survival was measured and did not narrow anything: a dangling start **does** survive into the published
record (`events: c.events.slice(),` `:1048`, dispatched `:1059`), because the frame's close is what
publishes it. My hypothesis in `## Open questions` was that dangling work events are dropped; the
measurement says otherwise, so the refusal rests on pairing rather than survival.

## Risks

- Pairing on the record's fields may be ambiguous when two `*Start` events of the same kind are open:
  a `*End` closes the most recent `*Start` unless the record says otherwise. T001 measures whether the
  record distinguishes them; if it does not, the judgement reports the ambiguity rather than choosing.
- The window may be the frame for work events and the whole record for router events. If the two
  differ, the judgement takes the narrower one and says so — a finding judged over the wrong window is
  a false positive.

## Open questions

- Whether a `*Start` without its `*End` survives into the published record at all, or is dropped when
  the frame closes. T001 answers by reading the recorder; if dangling work events are dropped, the
  chain that remains judgeable is the router's, and the plan narrows to it.
