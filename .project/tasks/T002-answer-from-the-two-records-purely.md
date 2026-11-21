---
id: T002
title: Answer from the two records, purely
wave: 2
status: done
deps: [T001]
agent: build_T002
base: cd79bfd355fa0e28db4f42206c09604607db0deb
worktree: null
task_branch: null
files:
  - extension/tutor-signals.js
  - scripts/tutor-signals.test.mjs
  - research/raw/m057-record-shapes.json
  - scripts/tutor-signals-shapes.test.mjs
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
`tutorSignals(records)`, where `records` is the two records and nothing else — the signal graph as the
page agent serialized it, and the render/effect entry the join answers at
`extension/render-phase.js:304`. Anything else on `records` is ignored, so a caller cannot smuggle a
page value, a clock or a cause into the answer.

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
  — the graph record's path for the graph, the join's path for the entry — in M055's answer shape, so
  an answer with no path is not an answer this module can produce (SC1).
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
answer that changes on a second read of the same fact. It also runs a real-record leg: the indexed
graph T003 pins is not read here, so the leg reads `research/raw/m039-render-phase.json`'s derived
reading (`effect.fromRecording`), whose nodes carry `kind` and `label` and no `index`, and asserts the
join's answer for it is an answer with `unplaced` rather than a numbered node — the honest reading of a
graph that carries no index, and the leg that keeps that record's two readings apart (PLAN C8). This
task owns held-out E7 and E8.

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
- scripts/tutor-signals-shapes.test.mjs

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
- Built at base `cd79bfd355fa0e28db4f42206c09604607db0deb` (branch `gsd-path/M056`). `extension/tutor-signals.js`
  (684 lines) is the pure join `tutorSignals(records)` on `globalThis.angularAiTutorSignals`: one object out,
  `{ state, question, effect, reads, unplaced, ordering, claims, detail }`, with every field present in every
  state. `records` is the two records and nothing else: `graph` is `{ path, line, graph: { nodes, edges } }` —
  the per-check record's own `graph` field (`extension/agent-main.js:1070`) with the provenance every claim
  must cite — and `effect` is `{ label }` or `{ edge: { consumer, producer } }`, plus the optional recorded
  `error` message and the entry record's own `question`. Anything else on `records` is ignored, so a caller
  cannot smuggle a page value, a clock or a cause into the answer.
- The state vocabulary, as the contract states it: `state` ∈ `answered` | `graph-unreadable` |
  `no-render-entry` | `no-effect-node`; `effect` on `answered` is `{ label, index, namedBy }` with `namedBy`
  ∈ `label` | `recorded-edge` (the existing join's two words, `extension/render-phase.js:56-59`) and `index`
  the node's own index or `null` where the record carries none; `reads` is `{ index, label }` per producer
  end in edge order, never sorted, never de-duplicated; `unplaced` is `{ end, value }` per producer end or
  effect reference the graph cannot place; `ordering` is always
  `{ state: 'absent', absence: 'no-write-record-no-order' }`; `claims` is `{ claim, values, artefactPath,
  line }` per rendered claim, graph-side claims citing the record's own path and line and entry-side claims
  citing `extension/render-phase.js:18` and `:336`; `detail` is the join's own sentence.
- **The brief's premise about a claim's line is wrong, and the answer says so.** A claim "carries the
  artefact path and line that states it", but a JSON record states no line for itself and a pure join touches
  no filesystem, so neither the graph record's path nor its line can be read out of the record's bytes. Both
  are handed over with the graph record (`records.graph.path`, `records.graph.line`), exactly as every other
  field the answer renders is; a graph slot missing either is `graph-unreadable` with its own sentence, so
  "an answer with no artefact path is not an answer this module can produce" still holds.
- **AC2's `namedBy` holds where the record carries an index, and the C8 leg shows the other word.** Named by
  the edge the record holds (`{ edge: { consumer: 5 } }`), the fixture's unlabelled effect renders
  `{ label: "", index: 5, namedBy: "recorded-edge" }`. Named by label — the only handle
  `/effect/fromRecording` offers — the answer renders `{ label: "", index: null, namedBy: "label" }`, measured
  in the C8 leg below. The read does not branch on whether a label is present (E1): the empty label is
  compared as the string the record spells.
- **The ordering claim cites `extension/render-phase.js:18`, not `:17`.** Measured at this head: `:17` reads
  "an edge is `{ consumer, producer }` … a direction of" and `:18` carries "no field, no value, no moment".
  The suite re-reads both cited lines and the two serializer citations on every run, so a citation that
  slides off its line reddens here rather than in a later wave.
- Held-out **E7** and **E8** are pinned in `scripts/tutor-signals.test.mjs`: the ordering is the one named
  absence on all four states and no field of the answer carries a write, an owner or a cause; the recorded
  change-detection message is a claim of its own rendered after the effect, carrying its three values, with
  the effect claim's keys exactly `index, label, namedBy`.
- The C8 leg, measured rather than assumed: `research/raw/m039-render-phase.json`'s `/effect/fromRecording`
  (line 330, re-resolved by reading the file) holds 6 nodes carrying `kind` and `label` and no `index`, and
  the join answers `answered`, `effect { label: "", index: null, namedBy: "label" }`,
  `unplaced [{ end: "effect", value: "" }]`, `reads []` — an answer with `unplaced` rather than a numbered
  node, `5` being the node's position and `6` the serializer's id. The graph T003 pins is not read here.
- Verify, exactly as written: `node --test scripts/tutor-signals.test.mjs && npx prettier --check
  extension/tutor-signals.js scripts/tutor-signals.test.mjs` — exit `0`, `tests 11`, `pass 11`, `fail 0`,
  `duration_ms 209`, and `All matched files use Prettier code style!`
- The mutant battery is 13 blocks, each an anchored single edit applied in memory, each reddening its own pin
  with the defect named by string: `no-artefact-path` (`artefact path`), `effect-by-position` (`position` —
  it rendered 3 where the record states 5), `producer-omitted` (`omitting a producer`),
  `index-past-the-graph` (`past the graph`), `unplaceable-dropped` (`dropped`), `absence-as-causation`
  (`causation`), `order-from-edge-direction` (`direction`), `write-recorded` (`write`), `absences-folded`
  (`three absences`), `unreadable-as-no-effects` (`graph with no effects`), `ignored-field-read` (`ignored`,
  from `id` and `epoch`), `second-call-differs` (`purity`), `message-joined-to-effect` (`joined`). Every
  anchor is asserted to occur exactly once in the shipped module and to change it.
- Also run outside the Verify, both clean: `npx tsc -p extension/tsconfig.json` and `npx tsc -p tsconfig.json`
  (`npm run check` runs them at T009, and a new `extension/*.js` file is type-checked).
- `git status --porcelain` after the build: `?? extension/tutor-signals.js`,
  `?? scripts/tutor-signals.test.mjs` and the task file this activation wrote;
  `research/raw/m057-record-shapes.json` and `scripts/tutor-signals-shapes.test.mjs` are declared, read and
  untouched.
