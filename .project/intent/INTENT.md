# Intent — M039 render-phase-effect

Lane: standard
Milestone: render-phase-effect
Branch: gsd-path/M039
Review panel: full
Finding skeptics: 2
Surfaces: panel

## Problem

A developer sees an expression change after Angular checked it and asks which
effect wrote the value while the view was rendering. Measured before planning:

- **no page event reports that an effect ran.** Angular's `ProfilerEvent` enum —
  the only event stream the page agent subscribes to — declares 26 values
  (`TemplateCreateStart` 0 through `HostBindingsUpdateEnd` 25), and **none of them
  is an effect event**: counted in the panel's `@angular/core` 22.1.8
  (`node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs`) and in the
  fixture's 22.2.2, whose enums are the same 26 values. The agent acts on four of
  them (`extension/agent-main.js:21-26`: `TemplateUpdateStart` 2,
  `TemplateUpdateEnd` 3, `OutputStart` 6, `OutputEnd` 7) and `onEvent` drops every
  other value (`agent-main.js:562-602`), so even the render-phase hooks the enum
  does carry — `AfterRenderHooksStart` 16, `AfterRenderHooksEnd` 17,
  `ChangeDetectionStart` 12, `ChangeDetectionEnd` 13 — reach no panel surface
  today.
- **the digest carries the change-detection error and no phase.**
  `extension/error-digest.json` is 61,450 characters (61,577 bytes on disk) in 64
  entries. It carries `NG0100` (Expression Changed After Checked,
  `ExpressionChangedAfterItHasBeenChecked`), and 12 occurrences of `effect` across
  six entries (NG0504, NG0600, NG0602, NG0913, NG0950, NG6100), and **zero**
  occurrences of `afterRender`. `afterNextRender` and `afterEveryRender` appear
  twice each, both inside NG0602's body, where they are named as calls banned
  inside a reactive context — not as phase names.
- **the effect is observable; its phase is not.** `ɵgetSignalGraph` reports nodes
  of `kind: 'effect'` (`ReactiveNodeKind`,
  `node_modules/@angular/core/types/_formatter-chunk.d.ts:48`) carrying
  `{kind, id, epoch, label?, value?, debuggableFn?}` (`types/core.d.ts:4632-4639`)
  with producer/consumer edges (4640-4649). The one recording that holds an effect
  node, `research/raw/effect-writes.json` (spike probe 2026-10-12, Angular 22.2.2,
  `app-counter`), shows `kind: "effect"`, an **empty label**, `writes:
  ["lastLogged.set"]`, `source: "() => this.lastLogged.set(this.count())"`, and the
  edge `effect: -> signal:count`. It carries no phase, no run count and no run
  time.
- **a write is not a graph edge.** That recording's `writes` is a regex over the
  node's dev-mode source (`spikes/probes/effect-writes.js:16`,
  `/\.(\w+)\.(set|update)\(/g`), not an observed write. `extension/resource-lifecycle.js:16`
  names `.loadEffect` the same way: a name, not a phase.

So the roadmap's "an effect that writes during rendering produces a finding naming
the effect and the phase" has no observable behind its second half. What the page
supports is the effect, the signals its edges say it reads, and the
change-detection error that made the developer ask in the first place.

## Users

A developer whose view settled on a value they did not write, who has an NG0100 in
the console and needs to know which effect could have moved it — and a reviewer
checking that the panel does not answer that question with a phase it never
observed.

## Success criteria

1. On the fixture, an effect the signal graph carries produces a finding naming that effect — by its graph label when the graph supplies one, and otherwise by the edge the graph records for it — together with the signals the graph's edges say it reads, and naming nothing the graph does not carry.
2. The phase an effect ran in is reported as cannot-tell with a named absence, because the page records no effect event: no finding carries a phase for an effect, and no rendered string names rendering or after-render as the phase an effect ran in.
3. A captured NG0100 message produces its own change-detection finding carrying the code and the message the page emitted, and is never joined to an effect, and never presented as evidence that an effect ran during rendering.
4. Where the graph carries no effect node, or cannot be read at all, the module reports cannot-tell naming which of the two it was, rather than reporting that the page has no effects.
5. The panel renders the effect, the signals it reads, the phase state and the change-detection finding as separate things, and renders nothing it was not given.
6. `npm run check` and `npm test` pass at the head.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
|---|---|---|---|---|
| E1 | SC4 | empty | held-out | a graph with no effect node yields the absence state, and never the words "no effects" |
| E2 | SC1 | precision | held-out | an unlabelled effect is named by its recorded edge, and no name is invented |
| E3 | SC1 | boundary | held-out | an effect whose edges name no producer still produces a finding naming the effect and reporting no read |
| E4 | SC2 | precision | held-out | no rendered string names a phase other than the cannot-tell state |
| E5 | SC3 | adjacency | held-out | an NG0100 capture and an effect node from the same read stay two findings, never one |
| E6 | SC3 | boundary | held-out | an NG0100 message that names no effect produces a change-detection finding naming no effect |
| E7 | SC5 | encoding | held-out | each state renders its own text and nothing else |
| E8 | SC2 | ordering | held-out | the same graph read twice produces byte-identical text |
| E9 | SC6 | none | dismissed | the project gate is not a held-out check |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
|---|---|---|---|---|
| N1 | SC1 | name an effect, a read or a write the graph does not carry | criterion SC1 | the graph carries kind, label, epoch, value and edges; a write is not among them |
| N2 | SC2 | name a phase for an effect, or infer one from where the effect sits in the graph | criterion SC2 | the profiler enum carries no effect event, so any phase would be invented |
| N3 | SC3 | infer that an effect ran during rendering from an NG0100 alone | criterion SC3 | the error says a value changed after a check, not which phase produced it |
| N4 | SC3 | join a captured NG0100 to the nearest effect, or report it as that effect's cause | criterion SC3 | proximity is not evidence |
| N5 | SC4 | report that the page has no effects where the graph could not be read | criterion SC4 | an unread graph is not an empty one |
| N6 | SC5 | render a phase, a read or a code the fact list does not carry | criterion SC5 | the pane prints what it is given |
| N7 | SC6 | weaken an assertion, skip a case or re-cut a pin to reach green | criterion SC6 | a moved pin is evidence |

## Scope

In: the effect the graph carries, the signals its edges say it reads, the named
absence that stands where a phase would go, the NG0100 finding kept beside it, and
the panel surface rendering those four states.

Out: any claim about which phase an effect ran in; any claim that an effect wrote a
value, since a write is source text and not an observed edge; a second profiler
tap, a second append-only list or any new page-side instrumentation; code
generation; `@angular/animations`, Angular SSR and `angular/components` (A5); DOM
added to an inspected page (AR-3).

## Corrections

**2026-11-08 — the roadmap's second clause is not observable.** The entry says
"an effect that writes during rendering produces a finding naming the effect and
the phase", and its scope adds "the values the effect wrote, joined to the phase
that observed them". Measured: the page records no effect event at all. Angular's
`ProfilerEvent` enum carries 26 values in both the panel's 22.1.8 and the fixture's
22.2.2 and none of them is an effect event; the page agent hard-codes four of them
and drops the rest (`extension/agent-main.js:21-26`, `562-602`); and
`extension/error-digest.json` carries zero occurrences of `afterRender`. SC2 is
therefore a cannot-tell criterion, and it replaces the roadmap's phase-naming one
rather than restating it.

**2026-11-08 — a write is not a graph edge, so "what it touched" narrows to what
the effect reads.** `DebugSignalGraphEdge` is a producer/consumer index pair
(`types/core.d.ts:4640-4649`); there is no write edge. The only write signal in
`research/raw/effect-writes.json` is a regex over `String(debuggableFn)`
(`spikes/probes/effect-writes.js:16`), so it names a call in the dev-mode source
and cannot support a claim that a value was written at a moment. SC1 carries the
edges and N1 forbids the write.

**2026-11-08 — the digest's three `NG0100` hits are one entry.** `NG0100` occurs
three times as a substring of `extension/error-digest.json` but only once as an
entry's code (`"code": "NG0100"`); the other two hits belong to the next entry,
`NG01002` (Missing Control Value), whose code and body both contain that prefix. So the digest offers one
change-detection entry, not three, and no reprieve from the absence above.

**2026-11-08 — the nearest thing to a phase the page exposes is a node kind, not a
run.** `ReactiveNodeKind` also declares `afterRenderEffectPhase`
(`types/_formatter-chunk.d.ts:48`), a node kind a page using `afterRenderEffect`
would produce. It is declared, not observed: neither
`research/raw/effect-writes.json` nor `research/raw/m038-linked-state.json` holds
one, and a node kind still says nothing about when an effect ran. An early task
must measure it rather than treat the declaration as an observable.

## Risks

- **The verification target is zone-sensitive in two directions.** The Insurance
  Portal is mid-migration to zoneless, so `AGENTS.md` `## Verification target` pins
  verification to the zoneful worktree until the migration completes; but NG0100's
  own digest entry says Angular "only throws this error in development mode", and
  the page agent additionally refuses a zoneful page outright with "Zone.js change
  detection is not supported; use zoneless Angular 22"
  (`extension/agent-main.js:536-542`). A verdict taken on the zoneful worktree must
  therefore name the portal route it tried and the artefact that target lacks, and
  the fixture fallback then carries the evidence, as `AGENTS.md` requires.
- **The effect's label may be empty everywhere.** It is empty in the one recording
  that holds an effect node, so SC1's subject may reduce to the recorded edge. If
  the graph names an effect nowhere, the honest answer is cannot-tell for the name
  as well, and a task must say so rather than label it by position.
- **The subject sits on a different page than the last recording.** The fixture's
  effects are `counter.ts:23`, `stale-view-fixture.ts:21` and
  `stale-view-deferred-fixture.ts:23`, while the M038 recording
  (`/linked-state`) holds no effect node at all. A capture that misses the effect
  reports SC4's absence, never "no effects".
- **The profiler list is the M028 reader's input.** Ordering an effect against it
  would join two different recordings; the effect has no position in that list,
  which is why SC2 is an absence rather than a computed phase.

## Open questions

- [RESEARCH] Does the signal graph label an effect on the fixture or the portal, or is the label empty for every effect node?
- [RESEARCH] What does the NG0100 message the portal emits name — a binding, a component, an effect, or nothing?
- [RESEARCH] Does `ɵgetSignalGraph` carry a node of kind `afterRenderEffectPhase` on a page that uses `afterRenderEffect`, and does any node carry a phase field?
