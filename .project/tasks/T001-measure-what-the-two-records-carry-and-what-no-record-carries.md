---
id: T001
title: Measure what the two records carry and what no record carries
wave: 1
status: done
deps: []
agent: build_T001
base: e5feffb8f64f6436fa34833e5db0110a27a09bd5
worktree: null
task_branch: null
files:
  - research/raw/m057-record-shapes.json
  - scripts/tutor-signals-shapes.test.mjs
---

# T001 — Measure what the two records carry and what no record carries

## Context

The milestone answers a signals question from two records the agent already writes: the serialized
graph (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect entry the
join answers at `extension/render-phase.js:304`. The intent's C1 measured that the third member the
roadmap's scope names — a write record — does not exist, so this milestone's first reading is of
fields that do exist and of one absence that has to be stated rather than inferred. The second
reading is a negative this plan's C1 already found and no record states: no file under
`research/raw/` carries a node of kind `effect`, and the closest one,
`research/raw/m039-render-phase.json`, holds the graph only as a derived reading whose nodes carry
`kind` and `label` and no `index`.

## Approach

Measure statically and record `research/raw/m057-record-shapes.json` with `path:line` citations
carrying each cited line's own trimmed text, every citation re-resolved by searching its file for the
exact line it quotes rather than by trusting a typed number. No page is opened, no build is run, no
browser is started.

**The field map, one side per record.** The graph side: `serializeGraph` at
`extension/agent-main.js:912` and the per-check carry at `:1070` are the only place a graph reaches a
record; the recorded shape is `{ nodes, edges }` (`extension/linked-state.js:29-36`); a node is read
for `index`, `kind` and `label` and every other field is ignored (`extension/render-phase.js:31-35`);
an edge is two members, `{ consumer, producer }`, a direction of dependency and nothing else
(`extension/render-phase.js:17-20`). The render/effect side: `renderPhase` at
`extension/render-phase.js:304`, its three published absences at `:310-312`, `:317-319` and`:331`,
the effect finding's four fields at `:265-272`, its read list at `:247-260`, and the rule that the
two findings never merge at `:336-338`.

**The first negative measurement, which is the intent's C1.** No write record exists anywhere in
`extension/`: the five searches the intent records (`writeRecord`, `write_record`, `writeLog`,
`writeOrder`, `writes:`) find a sanitizer binding's `writes` field and a test title and nothing else,
and no edge has a field to order a write in. The recording states this as the answer's named absence
— `no write record, no order` — rather than as a gap to be filled later.

**The second negative measurement, which decides this milestone's shape.** No record under
`research/raw/` carries a node of kind `effect`; `research/raw/m039-render-phase.json` holds the
graph only as `effect.fromRecording`, whose nodes carry `kind` and `label` and no `index`, and whose
edges are `kind:label` strings rather than the two index ends the recorded shape holds. The
recording states the consequence: the one graph the surface answers from is a capture (T003), and no
later wave reads a graph from a record that carries none.

`scripts/tutor-signals-shapes.test.mjs` parses the recording and re-checks each citation at this
head, and re-runs both negative measurements over the tree rather than trusting the recording's own
prose about them. Nothing is built: no join, no capture, no surface, no route.

## Intent coverage

- SC1
- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m057-record-shapes.json
- scripts/tutor-signals-shapes.test.mjs

## Acceptance criteria

1. `research/raw/m057-record-shapes.json` exists with `path:line` citations carrying each cited
   line's own trimmed text, every citation re-resolved by searching its file for the exact line it
   quotes, and `scripts/tutor-signals-shapes.test.mjs` parses the recording and re-checks every
   citation at this head.
2. The recording states, for the two sides an answer may cite, which field names each: the graph's
   node by `index`, `kind` and `label` with every other node field ignored, the edge by its two ends
   and nothing else, and the render/effect entry by the effect finding's own fields and its read
   list — so no later wave names a field the recording does not declare (SC1).
3. The recording states the first negative measurement as the answer's vocabulary: no write record
   exists anywhere in `extension/`, no edge carries a field to order a write in, and the ordering is
   therefore a named absence (`no write record, no order`) and not a capture this milestone could
   add (SC2).
4. The recording states the second negative measurement: no record under `research/raw/` carries a
   node of kind `effect`, and the closest one holds no `index` on its nodes and no index ends on its
   edges — so the graph this milestone reads is a capture, and the suite re-runs that scan over the
   tree rather than trusting the recording's prose.
5. Nothing is built: no join, no capture, no surface, no route, and no recording beyond the shape
   record.

## Verify

```bash
node --test scripts/tutor-signals-shapes.test.mjs && npx prettier --check scripts/tutor-signals-shapes.test.mjs research/raw/m057-record-shapes.json
```

## Log

- pending.
- Landed paths: `research/raw/m057-record-shapes.json`, `scripts/tutor-signals-shapes.test.mjs` — each is read from this tree, ready.
- Measured statically at base `e5feffb8f64f6436fa34833e5db0110a27a09bd5`. No page opened, no build
  run, no browser started. `research/raw/m057-record-shapes.json` carries 54 `path:line` citations,
  each holding the cited line's own trimmed text; every one is re-resolved by searching its file for
  that exact text, and all 54 resolve to the line recorded. Recorded by
  `node <scratch>/m057-build-record.mjs`, which prints:
  `authored extension files 57 excluded build output 48`, `write matches 5`,
  `json files 140 graph objects 8 effect objects anywhere 16 effect nodes in nodes arrays 10`,
  `recorded-shape objects 2 with effect 1`, `orderish edge keys []`.
- **AC3 holds, measured.** `writeRecord`, `write_record`, `writeLog`, `writeOrder` match nothing
  under `extension/`; `writes:` matches 5 lines — `extension/sanitizer-triage.js:37` (a sanitizer
  binding's documented field), `extension/agent-main.test.mjs:2452` (a test title) and three
  `matchDirectWrites:` identifiers in `extension/stale-view-worker.js:212,221,234`. The union of
  every edge key over every graph object under `research/raw/` is
  `consumer 13, producer 13, edge 6, consumerLabel 1, producerLabel 1` and no order-ish key, so
  `no write record, no order` is stated as the answer's named absence. Two further `writes:` hits
  sit inside the gitignored build bundle `extension/panel/`, excluded as build output.
- **AC4 does not hold as written, and the recording states the measured opposite.** The premise —
  "no record under `research/raw/` carries a node of kind `effect`" — is false. Measured:
  `16` objects carry `kind: "effect"` across these six records: `effect-writes.json`,
  `m036-resource-graph.json`, `m039-render-phase.json`, `vitest-attach-gemma4-newcontext.json`,
  `vitest-attach-gemma4.json`, `vitest-chromium-bundled.json`; `10` of them sit inside a `nodes`
  array. The premise that "the closest one holds no `index` on its nodes" is true only of
  `m039-render-phase.json`'s `/effect/fromRecording` (nodes carry `kind` and `label` only). The same
  file also holds `/effect/freshRead`: `6` nodes all carrying a numeric `index`, `6` `allEdges` with
  numeric `consumer`/`producer` ends, and the effect at `index 5`, `label ""`, one consumer edge to
  producer index `2`. That is the recorded shape exactly, and exactly one record holds an effect node
  in it. The existing reader answers from it: running `extension/render-phase.js` in a bare
  `node:vm` context over `{ nodes: freshRead.nodes, edges: freshRead.allEdges }` returns
  `{"findings":[{"state":"effect","effect":null,"namedBy":"recorded-edge","reads":["count"]}],"phase":{"state":"cannot-tell","absence":"no-effect-event"}}`.
- **What no record carries instead, which is the sharper absence.** `serializeGraph` never writes an
  `index`: it pushes `id: String(n.id)` and resolves each edge end to the consumer/producer node id,
  so a graph the agent's own serializer wrote cannot feed a reader that reads `index`. The milestone's
  operative conclusion — the graph it reads is a capture (T003) — stands, but not for the reason the
  plan gave. `research/raw/m057-record-shapes.json`'s `premiseCorrections` states all four
  corrections, and `## Acceptance criteria` 4 as written is refuted by measurement rather than met.
- Verify, exactly as written: `node --test scripts/tutor-signals-shapes.test.mjs && npx prettier
  --check scripts/tutor-signals-shapes.test.mjs research/raw/m057-record-shapes.json` — exit `0`,
  `tests 21`, `pass 21`, `fail 0`, and `All matched files use Prettier code style!`
- Verdict: blocked — the measurement is complete and its Verify passes, but AC4 as written is a claim
  the tree refutes, and T003's "no record holds the graph, so capture it" premise rests on that claim,
  so the next wave needs an owner ruling before it runs: blocked.
