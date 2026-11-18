# M049 — interaction-story

## Problem

A page's behaviour is a sequence: a route changed, work was scheduled for the next frame, a boundary
caught an error. The agent records all three in arrival order, and no surface narrates them together,
so an agent reading the panel sees three separate lists and has to reconstruct the order itself.

The roadmap's sentence is that the panel narrates the interaction sequence, each step naming what the
user did and what the app emitted. Measured at `4901d74b`, the first half does not exist: nothing in
`extension/` records a user action. See `## Corrections`.

## Users

The agent reading the panel, and the developer waiting on its answer. Both need the sequence as it
happened — step 1 before step 2, each step quoting the event it came from — rather than three streams
counted separately.

## Success criteria

1. Every step the story renders quotes an event the record carries, in the record's arrival order; a mutant that reorders or invents a step reddens the pin.
2. A page whose recorded streams are all empty reports cannot-tell naming the absence, never an empty story.
3. A record whose streams do not share an order reports cannot-tell rather than inventing one.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
| E1 | SC1 | boundary | criterion SC1 | Each step names the stream it came from and the event's own recorded fields, never a paraphrase. |
| E2 | SC1 | precision | criterion SC1 | Two events recorded out of order render out of order: the story never sorts by stream, by type or by a guessed cause. |
| E3 | SC2 | empty | criterion SC2 | A record with three empty streams reports cannot-tell with its reason, never a zero-step story presented as quiet. |
| E4 | SC2 | boundary | held-out | One empty stream beside two populated ones renders a story of the two, and the empty stream is named as empty; "nothing happened anywhere" cannot collapse into "nothing happened here". |
| E5 | SC3 | boundary | criterion SC3 | A record whose events carry no comparable order reports the mismatch it observed, not a sequence. |
| E6 | SC1 | idempotency | criterion SC1 | Narrating the same record twice returns the same steps in the same order. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
| N1 | SC1 | a step | criterion SC1 | name a cause, an intent, a user action or a component the record does not state |
| N2 | SC2 | an absence | criterion SC2 | render an empty stream as quiet, clean, healthy or ok |
| N3 | SC3 | an order | criterion SC3 | invent a total order the records do not share, or borrow one stream's clock for another |
| N4 | SC1 | the inspected page | criterion SC1 | add DOM to a page, or move any interaction out of the panel (AR-3, AR-6) |
| N5 | SC1 | the record | criterion SC1 | read the page at narration time; the story is computed from the record alone |

## Scope

In: the three arrival-ordered streams the agent already records — `routerEvents`
(`extension/agent-main.js:1474`), `pendingWorkEvents` (`:639`) and `boundaryEntries` (`:1942`) — a
pure narration that renders them as steps in arrival order, each quoting its event, and the absence
reported when a stream is empty or the streams share no order.

Out: any record of what the user did, which this repository does not produce; a page-side control or
widget; app code generation; `@angular/animations`, Angular SSR and `angular/components` (A5); DOM
added to the inspected page (AR-3).

Surfaces: panel

## Corrections

**The roadmap's premise is falsified in its first half, and the milestone is re-pointed at the
arrival-ordered streams that exist.** Measured at `4901d74b`:

- `interaction` occurs **0** times in `extension/agent-main.js` and **0** times across
  `extension/*.js`.
- No extension file registers a `click`, `pointer*`, `mouse*` or `key*` listener. The only
  document-level listeners are `error` (`extension/agent-main.js:2550`) and `unhandledrejection`
  (`:2557`), and both record failures, not actions.
- There is no picked-element, user-action or intent record of any kind.

So SC1 and its edge table are stated over what a step can quote — the event's own fields and its
arrival position — and never over what a user did. A story that narrates an action the record does
not carry would be an invention, which is the defect N1 exists to refuse. The goal sentence is kept
for the half that is measurable: a sequence of measured steps, each naming what the app emitted.

T001 measures all three streams' shapes, bounds and cross-stream comparability before any narration
is written, as every milestone's first task has done since M046.

## Risks

- The three streams may not share a comparable clock: `routerEvents` and `boundaryEntries` say they
  are in arrival order, while `pendingWorkEvents` is bounded as a page-health guard. If they cannot be
  interleaved honestly, SC3's cannot-tell is the honest answer and the story is per-stream rather
  than merged — T001 measures this, and the plan must be allowed to choose the narrower shape.
- The demo's facts are hand-written for each surface; a story fact must be derived from a record the
  suite can rebuild, or the pin proves only that a literal is a literal.

## Open questions

- Whether the streams carry a timestamp at all, and whether any two of them share one. T001 answers by
  reading the emitters; if none do, the merged order is the arrival order within each stream and the
  merge is refused rather than guessed.
