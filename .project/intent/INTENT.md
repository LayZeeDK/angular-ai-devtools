# INTENT — M057 tutor-signals

Lane: standard
Milestone: M057 · tutor-signals · Generation 3
Branch: gsd-path/M056
Review panel: off
Finding skeptics: off
Surfaces: panel

## Goal

The panel answers why a signal-driven template re-rendered, or failed to, by naming the effect node the
recorded signal graph carries, the label the graph gives it and the upstream nodes its edges state, so the
answer names what the evidence supports rather than a plausible rule. The panel is the only surface: the
answer is read there, and nothing is asked of the inspected page (`.project/ROADMAP.md:2010`,
`.project/ROADMAP.md:2013`).

The roadmap's premise that the agent already captures a write record was measured against `extension/` before
this surface was shaped and does not hold (C1): the graph is captured at `extension/agent-main.js:912` and
carried per check at `:1070`, the render/effect record joins it at `extension/render-phase.js:304`, and no
write-record capture exists in `extension/`. C2 and C3 decide which fields an answer may cite, so the three
criteria below are the question the evidence supports, not the one the roadmap's Goal states: an answer is
read from the graph and the effect record alone, or it is a named absence.

## Verification target

Every claim of this milestone is verified on the Insurance Portal first
(`D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools`, served via
`control-angular-dev-app up --target portal`). The portal's recorded graph carries one labelled effect,
`Resource.loadEffect`, whose producer is the `linkedSignal` labelled `Resource.extRequest`
(`extension/render-phase.js:15-16`), so the labelled-effect half of every claim is reachable there. A fixture
is used only when the portal lacks the recorded shape the claim needs, and a verdict that reaches a fixture
names the portal route tried (for example `/home`) and the artefact the portal lacks: the empty-label effect
node, in place of which the portal's record carries the labelled `Resource.loadEffect` (C3). A verdict that
reaches a fixture without naming both does not count as a verdict.

## Corrections

- C1 2026-11-21: The roadmap's scope premise — "The signal graph, the write record and the render record the agent already captures" (`.project/ROADMAP.md:2005`) — was measured and is false for one of its three members. The graph is captured: `serializeGraph` at `extension/agent-main.js:912` and `graph: serializeGraph(graph)` at `:1070`, inside `serializeCheck`, which is the only place a graph reaches the record. The render/effect record exists: `extension/render-phase.js:13` and `:304` join the graph with an effect node, and `extension/linked-state.js:29` documents the recorded shape as `{ nodes, edges }`. No write record exists: no write-record capture appears anywhere in `extension/` (a search for `writeRecord`, `write_record`, `writeLog`, `writeOrder` and `writes:` finds only `extension/sanitizer-triage.js:37`, a sanitizer binding's `writes` field, and `extension/agent-main.test.mjs:2452`, a test title), and the graph carries no write ordering. The roadmap's Risk says a graph read "cannot tell a write that caused the render from a write that merely happened alongside it" (`.project/ROADMAP.md:2021`); with no write record it cannot tell either case, so the Risk understates the gap instead of describing it. Measured verdict: the goal's "citing ... the write that preceded the render" (`.project/ROADMAP.md:2002`) is not satisfiable and is not restated in the criteria below. The criterion "cites the write that preceded the render" is rewritten in its place: an answer names the effect node, the label the graph gives it and the upstream nodes the graph states (SC1), and where the record carries no ordering it says so as a named absence rather than inferring causation (SC2).
- C2 2026-11-21: What the graph can carry was measured in the join that already reads it. An edge is `{ consumer, producer }` (`DebugSignalGraphEdge`, two members): "a direction of dependency and nothing else — no field, no value, no moment. A write is therefore not representable as an edge, so nothing here names a write, an owner or a cause" (`extension/render-phase.js:17-20`). A node is read for `index`, `kind` and `label` only, and every other field (`id`, `epoch`, `value`, `debuggableFn`, a cause a later capture might add) is ignored, so a fact carrying one changes nothing the reader reports (`extension/render-phase.js:31-35`); the recorded shape is `{ nodes, edges }`, with `index`, `kind`, `label` and `value` on a node (`extension/linked-state.js:29-36`). Measured verdict: the absence of write ordering is structural rather than a capture this milestone could add — an edge has no field to order a write in — so SC2 states the absence as the answer instead of waiting for a record the shape cannot hold.
- C3 2026-11-21: The effect a question is about may carry no label at all. The fixture's counter effect is node 5, id "6", label "", epoch 1, reading `signal:count` through its one edge (`extension/render-phase.js:13-14`), while the portal carries one labelled effect, `Resource.loadEffect`, whose producer is the `linkedSignal` labelled `Resource.extRequest` (`extension/render-phase.js:15-16`). Measured verdict: the empty label is a recorded shape, not a degenerate case, and no identity may be minted from an index, a position, a call site or a source string (`extension/render-phase.js:57-59`) — so the empty-label edge is verified on the fixture, and a verdict that reaches it names the portal route tried and the labelled `Resource.loadEffect` the portal's record carries in its place.

## Success criteria

1. An answer for a signals question names the effect node the record carries by the label the graph gives it
   and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from
   the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record
   that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact
   path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its
   position in the node array, or omits a producer an edge records, reddens the same criterion.

2. Where the record carries no ordering between a write and the render, the answer states that ordering as a
   named absence — no write record, no order — beside the effect and its upstream nodes, and names no write,
   no owner and no cause; a mutant that renders the absence as causation (the write, then the render), a
   mutant that reads an order out of an edge's direction, and a mutant that renders a write the record does
   not carry each redden.

3. A page whose signal graph the agent could not read reports cannot-tell naming the graph and nothing else —
   no effect, no label, no read (`extension/render-phase.js:310-312`) — and the absences stay distinct: a
   page whose record carries no render/effect entry, and a readable graph that holds no effect node
   (`extension/render-phase.js:317-319`), each report their own named absence; a mutant that reports an
   unreadable graph as a page with no effects, and a mutant that folds the three absences into one blank or
   empty answer, redden.

4. No claim cites a node the record does not contain: every node index the answer renders is one the recorded
   graph's own `nodes` array carries, and a producer end or effect reference the graph cannot place is named
   as unplaced rather than numbered, dropped or resolved to the nearest node; a mutant that renders an index
   past the graph's last node, and a mutant that drops a producer the graph does not carry, redden.

5. The answer is produced from the two records the agent already captures — the serialized graph
   (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect join
   (`extension/render-phase.js:304`) — with no new page-side instrumentation, no second profiler tap
   (`.project/ROADMAP.md:1085`), and nothing the record does not hold: no DOM, no clock, no console, no page
   global (`extension/render-phase.js:21-26`), and no field the reader ignores
   (`extension/render-phase.js:33-35`); a mutant that reads a live page value, starts its own profiler tap, or
   answers from a field the record does not carry reddens.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|---|---|---|---|---|
| E1 | SC1 | boundary | criterion SC1 | A graph whose effect node is present and unlabelled — the fixture's counter effect, node 5, label "", reading `signal:count` through its one edge (`extension/render-phase.js:13-14`) — and a graph whose effect node is labelled — the portal's `Resource.loadEffect`, produced by the `linkedSignal` `Resource.extRequest` (`extension/render-phase.js:15-16`) — render through the same read: the answer names the effect's `index` and the label the graph gives it in both, and does not branch on whether a label is present. |
| E2 | SC1 | empty | criterion SC1 | The effect label may be empty (`extension/render-phase.js:13-14`): the answer names the empty label as empty beside the node index and mints no identity from the index, a position, a call site or a source string, which is the rule `extension/render-phase.js:57-59` states for a finding. |
| E3 | SC3 | boundary | criterion SC3 | The agent cannot read the graph: the answer is cannot-tell naming the graph (`extension/render-phase.js:310-312`), with no effect, no label and no read — never an empty finding and never a page reported as having no effects. |
| E4 | SC3 | empty | criterion SC3 | A page whose record carries no render/effect entry, and a readable graph that holds no effect node (`extension/render-phase.js:317-319`), report two distinct named absences; neither is rendered as the other, and neither as an empty answer. |
| E5 | SC4 | precision | criterion SC4 | A claim naming a node index the graph's `nodes` array does not carry — a producer end past the last index, or an effect named by an index the record does not hold — is reported as unplaced, never rendered as a node and never silently dropped. |
| E6 | SC1 | boundary | criterion SC1 | Portal versus fixture: the Insurance Portal is the default target, and a verdict that reaches the fixture names the portal route tried (for example `/home`) and the artefact the portal lacks — the portal's record carries the labelled effect `Resource.loadEffect` (`extension/render-phase.js:15-16`), so the empty-label shape is the fixture's and the labelled effect is what the portal's record offers in its place. |
| E7 | SC2 | ordering | held-out | A recorded fact that carries no ordering renders the ordering as a named absence: the graph's edge is `{ consumer, producer }` and nothing else — no field, no value, no moment — so a write is not representable as an edge and no causal claim can be read from one (`extension/render-phase.js:17-20`). |
| E8 | SC2 | adjacency | held-out | The effect finding and a recorded change-detection message stay two findings in the recorded order and are never joined (`extension/render-phase.js:49-51`, `extension/render-phase.js:336-338`), so the second is never read as the first one's cause. |
| E9 | SC5 | precision | criterion SC5 | A fact carrying a field the reader ignores — `id`, `epoch`, `value`, `debuggableFn`, a cause a later capture might add — changes nothing the answer reports (`extension/render-phase.js:33-35`, `extension/linked-state.js:33-36`), so no answer can be fed a value the record does not state. |
| E10 | SC1 | idempotency | criterion SC1 | A second answer to the same question over the same record names the same effect label, the same node index and the same upstream nodes from the same fields: the answer is stable across runs, not re-derived differently each time. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|---|---|---|---|---|
| N1 | SC1 | answer from a plausible change-detection rule, from Angular's documentation or from the record's prose instead of the fields the recorded graph carries — the effect's label, its node index, its producer ends | criterion SC1 | `.project/ROADMAP.md:2002` asks for "a rule the evidence supports rather than a plausible one"; the reviewer looks for a rule the answer names that the graph's fields do not state. |
| N2 | SC2 | render the recorded absence as causation — infer an order, a cause, an owner or a write the record does not carry, including from an edge's direction (`extension/render-phase.js:17-20`) | criterion SC2 | Grounded in C2; the reviewer looks for any answer that names a write or a "because". |
| N3 | SC3 | fold the three absences — graph unreadable, no render/effect entry, no effect node — into one blank, empty or "no findings" answer | criterion SC3 | The reviewer replays each absence and expects its own named state. |
| N4 | SC4 | invent, renumber or shift a node index, or drop a reference the graph cannot place instead of naming it unplaced — M055's N5 analogue (`.project/archive/055-tutor-foundations/intent/INTENT.md:73`) | criterion SC4 | The reviewer checks every index the answer renders against the record's own `nodes` array. |
| N5 | SC5 | add page-side instrumentation, a second profiler tap or a live page read to answer the question (`.project/ROADMAP.md:1085`, `.project/ROADMAP.md:2017`) | criterion SC5 | The reviewer diffs the capture path and expects only the two records the agent already writes. |
| N6 | SC1 | obtain the answer through a page-side control, input or widget, or add DOM to the inspected page — AR-6 keeps every interaction in the panel and AR-3 makes the overlay the only DOM (`.project/ROADMAP.md:2010`, `.project/ROADMAP.md:2013`) | criterion SC1 | Scope: out says so itself (`.project/ROADMAP.md:2009-2013`). |

## Constraints

- C1 constrains the question: the answer must be answerable from the graph and the effect record alone, or
  answered with a named absence. The write record the roadmap's scope names
  (`.project/ROADMAP.md:2005`) does not exist, so no criterion, task or check may depend on it.
- C2 constrains causation: an edge is a direction of dependency and nothing more, so no rendering, wording or
  test may read an order, a moment or a cause out of it.
- C3 constrains identity: the effect label may be empty, and no identity is minted from an index, so the
  empty-label case is a shape with its own state rather than a fallback to a position.
- The only surface is `panel`: the answer is read there, every claim names an artefact path, and nothing is
  asked of the inspected page (`.project/ROADMAP.md:2009-2013`).
