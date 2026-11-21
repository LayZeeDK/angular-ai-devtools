---
id: T002
title: Answer from the two records, purely
wave: 2
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/tutor-signals.js
  - scripts/tutor-signals.test.mjs
  - research/raw/m057-record-shapes.json
---

# T002 — Answer from the two records, purely

## Context

T001's recording (`research/raw/m057-record-shapes.json`) declares which fields an answer may cite
and which two negatives bound it: the graph's node is read for `index`, `kind` and `label`, an edge
is its two ends, and no write record exists — so the ordering is a named absence, never an
inference. The join is pure so node-side mutants can redden every way the answer could lie, and so
the surface (T004) renders it without restating its rules as a computation. This is the one place
the milestone's evidence becomes a sentence: a claim with no artefact path, an effect named by its
position, or a producer dropped because it could not be placed are the failures this task exists to
refuse.

## Approach

Build `extension/tutor-signals.js` on `globalThis.angularAiTutorSignals`: the pure join
`tutorSignals(records)`, where `records` is the two captured records and nothing else — the
serialized graph, and the render/effect entry the join answers at `extension/render-phase.js:304`.
Anything else on `records` is ignored, so a caller cannot smuggle a page value, a clock or a cause
into the answer.

The answer is one object: `{ state, question, effect, reads, unplaced, ordering, claims, detail }`.

- `state` is `answered`, `graph-unreadable`, `no-render-entry` or `no-effect-node`. The three
  absences are distinct states, each naming which one holds, and an unread graph is never rendered
  as a graph with no effects (SC3).
- `effect` on `answered` is `{ label, index, namedBy }`: the label exactly as the graph spells it,
  the node's own `index` as the graph carries it, and `namedBy` saying whether the caller reached the
  node by a label or by the edge the record holds. An empty label is rendered as empty beside the
  index and mints no identity from the index, a position, a call site or a source string (SC1).
- `reads` is the upstream nodes the graph's edges state for that effect, each as `{ index, label }`,
  in the order the edges appear — never sorted, never de-duplicated by a set, never read from a
  producer the graph does not hold (SC1).
- `unplaced` names every producer end or effect reference the graph cannot place, by end and value,
  rather than numbering it, dropping it or resolving it to the nearest node (SC4).
- `ordering` is always the one object `{ state: 'absent', absence: 'no-write-record-no-order' }` and
  is never a finding, so there is no field a cause could be smuggled into (SC2).
- `claims` carries one entry per rendered claim, each with the artefact path and line that states it
  — the capture path for the graph, the join path for the entry — in M055's answer shape, so an
  answer with no path is not an answer this module can produce (SC1).
- `detail` is the join's own sentence about what it read or which absence holds, never a record
  field.

The join imports nothing at runtime, touches no filesystem, dispatches no message, performs no
network call, holds no clock, reads no page global and consults no field the recording says the
reader ignores (SC5). A bare `node:vm` context with nothing in it is enough to run it, which the
suite proves rather than assuming.

`scripts/tutor-signals.test.mjs` pins the module and then mutates, each mutant with its own anchor
assertion: an answer with no artefact path; an effect named by its position in the node array; a
producer an edge records that the answer omits; an index past the graph's last node; a producer the
graph does not carry that is numbered or dropped instead of named unplaced; the absence rendered as
causation; an order read out of an edge's direction; a write the record does not carry; the three
absences folded into one blank answer; an unreadable graph reported as a page with no effects; an
answer that changes when the fact gains `id`, `epoch`, `value`, `debuggableFn` or a cause; and an
answer that changes on a second read of the same fact. It also runs a real-record leg: the captured
graph record T003 lands is not read here, so the leg reads `research/raw/m039-render-phase.json`'s
own node and edge lists — the recorded shape without indices — and asserts the join's answer for it
is an answer with `unplaced` rather than a numbered node, which is the honest reading of a record
that carries no index. This task owns held-out E7 and E8.

## Intent coverage

- SC1
- SC2
- SC3
- SC4
- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- extension/tutor-signals.js
- scripts/tutor-signals.test.mjs
- research/raw/m057-record-shapes.json

## Acceptance criteria

1. `tutorSignals(records)` answers `answered` from the graph's own `nodes` and `edges`: the effect by
   the label the graph gives it and by its own `index`, each upstream node by index and label in the
   order the edges appear, and each claim carrying the artefact path and line that states it; a
   mutant that answers with no artefact path, names the effect by its position in the node array, or
   omits a producer an edge records reddens (SC1, E1, E2, E6, E10).
2. The empty label is a shape with its own state and not a fallback: an unlabelled effect renders
   `label` as an empty string beside its `index`, and `namedBy` says the node was reached by the edge
   the record holds — no identity is minted from an index, a position, a call site or a source
   string (SC1).
3. Held-out E7 is pinned in `scripts/tutor-signals.test.mjs`, which the Verify runs: `ordering` is
   the named absence `no-write-record-no-order` on every answer and is never a finding, and a mutant
   that renders the absence as causation, reads an order out of an edge's direction, or renders a
   write the record does not carry reddens (SC2, E7).
4. Held-out E8 is pinned in the same suite: the effect finding and a recorded change-detection
   message stay two findings in the recorded order and are never joined, so the second is never read
   as the first one's cause (SC2, E8).
5. Every node index the answer renders is one the recorded graph's own `nodes` array carries; a
   producer end or effect reference the graph cannot place is named in `unplaced` and never
   numbered, dropped or resolved to the nearest node, and a mutant that renders an index past the
   graph's last node or drops an unplaceable producer reddens (SC4, E5).
6. `graph-unreadable`, `no-render-entry` and `no-effect-node` are three distinct states, each in its
   own sentence, and a mutant that reports an unreadable graph as a page with no effects or folds
   the three into one blank answer reddens; the join reads no page, starts no profiler tap, holds no
   clock and ignores `id`, `epoch`, `value`, `debuggableFn` and any cause a later capture might add,
   so a fact carrying one changes nothing the module reports (SC3, SC5, E3, E4, E9).

## Verify

```bash
node --test scripts/tutor-signals.test.mjs && npx prettier --check extension/tutor-signals.js scripts/tutor-signals.test.mjs
```

## Log

- pending.
- Landed paths: `extension/tutor-signals.js`, `scripts/tutor-signals.test.mjs`, `research/raw/m057-record-shapes.json` — each is read from this tree, ready.
