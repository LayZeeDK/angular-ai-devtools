# Intent — M038 linked-state-reset

Lane: quick
Milestone: linked-state-reset
Branch: gsd-path/M038
Review panel: off
Finding skeptics: off
Surfaces: panel

## Problem

A linked signal follows a source and resets when the source changes. When a value
reverts, the developer asks which write did it. Measured before planning:

- **the fixture has no `linkedSignal` at all** — `Select-String` over
  `spikes/ng222-app/src/app/*.ts` returns nothing, so every state this milestone
  must explain has to be authored;
- **the extension has no `linkedSignal` reference either**;
- **the graph records values, not history** — nodes carry
  `{kind, label, value, fn}`, so "the write that caused the reset" has no
  observable behind it.

So the roadmap's second scope line exceeds the oracle. What the page can support
is the current pairing: this signal's value, the source it follows, and whether
they agree.

## Users

A developer whose value reverted and who cannot tell whether they wrote it, or
whether a recomputation did.

## Success criteria

1. On the fixture, a linked signal whose value agrees with its source produces a finding naming the signal and the source it follows, and saying the value currently matches.
2. A linked signal whose value differs from its source is reported as differing, and the two values are shown.
3. Both are produced from what the page already exposes through the signal graph, with no new page-side instrumentation, no build-output and no dev-server dependency.
4. Where the record cannot say whether a value came from a write or a recomputation, it reports cannot tell with that reason, and names no write, owner or cause.
5. The panel renders the signal, the source, the two values and the agreement, and renders nothing it was not given.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC1 | empty | held-out | a record with no linked signal yields no finding |
| E2 | SC1 | boundary | held-out | a signal whose source is unreadable yields cannot-tell |
| E3 | SC2 | boundary | held-out | equal and unequal values are never merged into one state |
| E4 | SC4 | precision | held-out | no rendered string names a write, an owner or a cause |
| E5 | SC5 | encoding | held-out | each state renders its own text and nothing else |
| E6 | SC6 | none | dismissed | the project gate is not a held-out check |
| E7 | SC3 | boundary | held-out | a fact carrying a field the join does not read changes nothing it reports |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name a write, an owner or a cause the graph does not carry | criterion SC1 | the graph records values only |
| N2 | SC2 | infer that a value was recomputed from equality alone | criterion SC2 | equality is a state, not an origin |
| N3 | SC3 | read a build log, patch the compiler or add a page-side tap | criterion SC3 | the graph is the existing observable |
| N4 | SC4 | widen the agreement into a verdict about correctness | criterion SC4 | agreement is not validity |
| N5 | SC5 | render a value, source or state the fact list does not carry | criterion SC5 | the pane prints what it is given |
| N6 | SC6 | weaken an assertion to reach the gate | criterion SC6 | a red test is evidence |

## Scope

In: the linked state the fixture exposes, its source, both values, and the
agreement between them.

Out: any claim about which write or recomputation produced a value; any
build-output or dev-server observation; any correctness judgement about the
values themselves.

## Corrections

2026-11-08 — the roadmap's "the write that caused the reset, distinguished from a
recomputation" is **not observable**. The graph carries `{kind, label, value, fn}`
per node and no history, so SC4 requires cannot-tell rather than a fabricated
origin. Recorded with the measurement above, and the scope line above quotes the
roadmap wording it replaces.

2026-11-08 — the roadmap assumes a subject: there is **no `linkedSignal`** in the
fixture. T001 must author the linked states before any criterion can be met.

## Risks

The graph's node labels for linked signals may not distinguish a linked signal
from a plain computed. If so, SC1's subject is unreadable and the milestone's
honest answer is cannot-tell throughout, which T001 must say rather than assume
away.

## Open questions

- [RESEARCH] Which node label does a linked signal carry in the graph on this build?
- [RESEARCH] Does the graph expose the source a linked signal follows, or only its value?
- [RESEARCH] Can the fixture express a write that differs from its source, and what does the graph show then?
