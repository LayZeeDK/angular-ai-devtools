---
id: T003
title: Read the graph record the answer comes from
wave: 3
status: pending
deps: [T001, T002]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/tutor-signals-graph.test.mjs
---

# T003 — Read the graph record the answer comes from

## Context

T001's measurement refuted the premise this task was planned on, and PLAN C8 carries the ruling. It is
not true that no record under `research/raw/` carries a node of kind `effect`: 16 objects carry that
kind across six records, and exactly one of them sits in the shape an answer can read —
`research/raw/m039-render-phase.json`'s `/effect/freshRead`, whose 6 nodes each carry a numeric
`index`, whose 6 `allEdges` each carry numeric `consumer`/`producer` ends, and whose effect sits at
`index 5` with `label ""` and one consumer edge to producer index `2`, the node the graph labels
`count`. That is the recorded shape `extension/linked-state.js:29-36` documents and the shape the
existing join reads an `index` out of at `extension/render-phase.js:159`.

What no record carries is an `index` in the serializer's own output: `serializeGraph` pushes
`id: String(n.id)` and resolves each edge end to a node id, so a capture through it writes no `index`
at all. A capture would therefore reproduce the defect instead of curing it, and this task's capture
leg is deleted. The brief keeps its plan-time filename because a build checkpoint may not rename a task
brief; the premise in the filename is the one refuted above.

## Approach

Add `scripts/tutor-signals-graph.test.mjs`: one suite that reads `research/raw/m039-render-phase.json`
at this head and pins the graph the answer is read from, so a re-derivation of that record reddens here
rather than in a later wave.

**The pin is the shape, not a copy.** The suite reads `/effect/freshRead` and asserts: 6 nodes, every
one carrying a numeric `index`; 6 `allEdges`, every one carrying numeric `consumer` and `producer`
ends; one node of kind `effect`, at `index 5`, carrying an empty `label`; and that node's one consumer
edge reaching producer index `2`, whose node is the `signal` the graph labels `count`. It reads the
record's own `capture` block for the provenance the record states — the command that wrote it, the
route and URL it was read on, the element and component it was read off, and the head it was recorded
at — and asserts those fields are the ones the record carries, so the graph is the record's own
statement and not one this milestone composes.

**The answer is proved from that record, not assumed.** The suite loads the join T002 ships in a bare
`node:vm` context, hands it the record's own `nodes` and `allEdges` and asserts the answer names the
effect at `index 5` by its empty label beside that index, names the upstream node at `index 2` by the
label the graph gives it, carries the record's path and pointer on its claims, and states the ordering
as the named absence `no-write-record-no-order` — never a write, an owner or a cause (SC1, SC2).

**No capture leg, and the suite says so.** Nothing is opened, built or started: no page, no browser,
no build, no profiler tap, no page-side listener and no serialization call. Every field the answer
reads — `index`, `kind`, `label` and the two edge ends — is one the record already holds, and a fresh
serialized capture cannot supply the field that matters, because the serializer writes `id` where the
reader reads `index`; so there is no field a live read would add, and none is taken (SC5). The suite
pins that absence the way it pins the shape: it reads its own source and asserts it arms no capture
flag, names no serialization entry point and writes no file, and it asserts the record this task would
have captured (`m057-signal-graph.json`) exists nowhere under `research/raw/`.

**What the record is not.** The record's own `capture` block says it was read on the counter fixture,
so the labelled `Resource.loadEffect` the portal's record carries is not in it, and no record carries
that labelled effect with an `index` for the reason above. The task therefore names the portal's
labelled effect as the shape a portal read would offer in place of this record's empty-label effect
(`extension/render-phase.js:13-16`) and claims no portal read it did not take: no page was opened for
this task at all (SC5, E6).

## Intent coverage

- SC1
- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- scripts/tutor-signals-graph.test.mjs

## Acceptance criteria

1. `scripts/tutor-signals-graph.test.mjs` reads `research/raw/m039-render-phase.json`'s
   `/effect/freshRead` at this head and pins the indexed shape the answer needs — 6 nodes each carrying
   a numeric `index`, 6 edges each carrying numeric `consumer`/`producer` ends, the effect at `index 5`
   with an empty label, and its one consumer edge reaching producer index `2` — so a re-derivation of
   that record reddens here rather than in a later wave.
2. The same suite hands the record's own node and edge lists to the join T002 ships, in a bare
   `node:vm` context, and asserts the answer names the effect at `index 5` by its empty label beside
   that index, names the upstream node at `index 2` by the label the graph gives it, carries the
   record's path and pointer on its claims, and states the ordering as the named absence
   `no-write-record-no-order` — never a write, an owner or a cause (SC1).
3. No capture leg exists: the suite opens no page, builds nothing, starts no profiler tap, registers no
   page-side listener and calls no serialization entry point, it pins that in its own source, and the
   record this task would have captured is absent from `research/raw/` — because the serializer writes
   `id` and never `index`, so a capture could not supply the field the answer reads (SC5).
4. The record's provenance is pinned rather than restated — the `capture` block's command, route, URL,
   element, component and head are the ones the record carries — and the task states that no page was
   opened, naming the portal's labelled `Resource.loadEffect` as the shape a portal read would offer in
   place of this record's empty-label effect (SC5, E6).

## Verify

```bash
node --test scripts/tutor-signals-graph.test.mjs && npx prettier --check scripts/tutor-signals-graph.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/tutor-signals-graph.test.mjs` — read from this tree, ready. The capture leg is deleted by PLAN C8: this task reads `research/raw/m039-render-phase.json`'s `/effect/freshRead` and writes no record of its own.
