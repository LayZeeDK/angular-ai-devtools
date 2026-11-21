---
id: T003
title: Read the graph record the answer comes from
wave: 3
status: done
deps: [T001, T002]
agent: build_T003
base: beb69b97acad146fcb96bcc1cf6e0b7bb2e9b481
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
route and page URL it was read on, the element and component it was read off, the build and browser
instance it was read in, and the time it was read at — and asserts those fields are the ones the record
carries, so the graph is the record's own statement and not one this milestone composes.

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
pins that absence the way it pins the shape: it reads its own import list and asserts it names only
node builtins — no capture flag, no browser driver, no page-side probe and no profiler module — and it
asserts the record this task would have captured (`m057-signal-graph.json`) exists nowhere under
`research/raw/`.

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
3. No capture leg exists: the suite opens no page, builds nothing, starts no profiler tap and registers
   no page-side listener, its own import list names only node builtins so no browser driver, page-side
   probe or profiler module can be reached, and the record this task would have captured is absent from
   `research/raw/` — because the serializer writes `id` and never `index`, so a capture could not supply
   the field the answer reads (SC5).
4. The record's provenance is pinned rather than restated — the `capture` block's command, route, page
   URL, element, component, build, browser instance and time are the ones the record carries — and the
   task states that no page was opened, naming the portal's labelled `Resource.loadEffect` as the shape
   a portal read would offer in place of this record's empty-label effect (SC5, E6).

## Verify

```bash
node --test scripts/tutor-signals-graph.test.mjs && npx prettier --check scripts/tutor-signals-graph.test.mjs
```

## Log

- pending.
- Landed paths: `scripts/tutor-signals-graph.test.mjs` — read from this tree, ready. The capture leg is deleted by PLAN C8: this task reads `research/raw/m039-render-phase.json`'s `/effect/freshRead` and writes no record of its own.
- 2026-11-21: built at `beb69b97` as `build_T003`. `scripts/tutor-signals-graph.test.mjs` (one file, 976 lines) reads the record and moves nothing else; no capture, no page, no browser, no build, no listener, no record written.
- The pinned shape, from the suite's own output: `research/raw/m039-render-phase.json` `/effect/freshRead` at line `399` — **6 nodes**, indices `[0,1,2,3,4,5]`, every one numeric; **6 edges**, every one with numeric `consumer`/`producer` ends; **one** node of kind `effect` at `index 5` with `label ""`; its **one** consumer edge `5 -> 2` reaching the signal labelled `"count"`.
- The pinned provenance, from `capture`: command `set "M039_CAPTURE=1"&& node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs"`; route `"/"`; page `"http://localhost:4222/"`; element `"app-counter"`; component `"_Counter"`; build `{"app":"spikes/ng222-app","angular":"22.2.2","configuration":"development"}`; instance `{"name":"chrome-beta-gemma4","cdp":9334}`; at `"2026-11-08T07:19:56.846Z"`; **`head`: absent** — the block's own key set is pinned, so a field this milestone would compose has nowhere to sit. The graph's `url`/`element`/`component` are held equal to the capture block's, so the graph is the record's own statement.
- The join's answer over that record, run in a bare `node:vm` context: `{"state":"answered","effect":{"label":"","index":5,"namedBy":"recorded-edge"},"reads":[{"index":2,"label":"count"}],"unplaced":[],"ordering":{"state":"absent","absence":"no-write-record-no-order"}}`; claims `["effect","read","ordering"]`, the two graph-side claims citing `research/raw/m039-render-phase.json:399` and the ordering claim `extension/render-phase.js:18`. The same node is placed by the label `""` (`namedBy: "label"`), and the record's own nodes reversed still answer `index 5` with `index 2` upstream — the answer reads an `index`, never a position.
- No capture leg, proved: imports are `["node:assert/strict","node:fs","node:path","node:test","node:url","node:vm"]` and nothing else (6 of 6 node builtins); the bare context holds `document`, `window`, `fetch`, `XMLHttpRequest`, `WebSocket`, `process`, `location`, `navigator`, `chrome` all `undefined` (9 of 9); `research/raw/m057-signal-graph.json` does not exist (an `existsSync` on the path PLAN C8 names is false, and the suite enumerates no directory). The suite names the portal's labelled `Resource.loadEffect` as the shape a portal read would offer in its place (`extension/render-phase.js:15-16`) and claims no portal read: the record's effect label is `""` and no answer field carries `Resource.loadEffect`, `Resource.extRequest`, `localhost`, `http://` or `/home`.
- The three mutants each redden their pin and name the defect: `effect-by-position` → "the effect sits at position 0 of this list and the record states index 5 for it: a position in the nodes array is not an index the record states, and the answer rendered 0"; `portal-read-claimed` → "no page was opened for this task, so the answer does not claim a portal read: "Resource.loadEffect" appears in …"; `provenance-invented` → "a claim carries artefactPath, claim, line, values and nothing else, so no provenance field the record does not carry is invented beside it — no head, no route and no clock: this claim rendered {"head":"beb69b97…","claim":"effect",…}".
- Verify, run exactly: `node --test scripts/tutor-signals-graph.test.mjs` → `tests 9`, `pass 9`, `fail 0`; `npx prettier --check scripts/tutor-signals-graph.test.mjs` → "All matched files use Prettier code style!". Exit 0.
- Verdict: the record is the one graph the answer needs, the answer is proved from it rather than assumed, no capture leg exists and both Verify legs are green — ready.
