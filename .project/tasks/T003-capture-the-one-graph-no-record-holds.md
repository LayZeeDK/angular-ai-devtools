---
id: T003
title: Capture the one graph no record holds
wave: 3
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m057-signal-graph.json
  - scripts/tutor-signals-capture.test.mjs
---

# T003 — Capture the one graph no record holds

## Context

T001's recording states the negative that decides this task: no file under `research/raw/` carries a
node of kind `effect`, and the closest record, `research/raw/m039-render-phase.json`, holds the graph
only as a derived reading whose nodes carry `kind` and `label` and no `index`. SC1 requires the
answer to name the effect node's own `index`, so the graph the surface answers from has to be a
record this milestone writes — captured from the read the agent already performs, on the Insurance
Portal first, with the artefact the portal lacks named where the counter fixture is used instead.

## Approach

Add `scripts/tutor-signals-capture.test.mjs`: one suite, armed by its own environment flag, that
captures `research/raw/m057-signal-graph.json` and otherwise reads the record back and re-checks it.
The capture calls the read `serializeGraph` already performs at `extension/agent-main.js:912` and
writes what it returned — the graph the per-check carry at `:1070` puts on the record — with
`capture.command`, `capture.head` and the environment it was read in. No page value is composed, no
field the reader ignores is added, and nothing is written by hand: the unarmed run compares the
record to the tree and changes no byte, so a second run is the idempotence pin.

**Insurance Portal first.** The capture is taken with `control-angular-dev-app up --target portal`,
the portal route tried named (`/home` first), and the record states the route tried beside the
graph. The portal's record carries one labelled effect, `Resource.loadEffect`, whose producer is the
`linkedSignal` labelled `Resource.extRequest` (`extension/render-phase.js:15-16`), so the labelled
half of E1 and E6 is reachable there. The empty-label shape is the counter fixture's — node 5, label
`""`, reading `signal:count` through its one edge (`extension/render-phase.js:13-14`) — so a capture
that reaches the fixture names both the route tried and the artefact the portal lacks: the
empty-label effect node, in place of which the portal's record carries the labelled
`Resource.loadEffect`. A record that reaches the fixture without naming both is not a capture this
suite accepts.

**No new instrumentation** (SC5). The capture starts no profiler tap of its own, adds no listener to
the inspected page and reads no DOM, no clock, no console and no page global beyond the one read the
agent already makes for the graph. The suite pins the two counts that would move if it did — the
profiler taps the capture path starts and the page-side listeners it registers — against the counts
the existing capture path carries, and writes neither into the record as a composed value.

The record carries the graph's own `nodes` and `edges` as the agent serialized them — each node's
`index`, `kind`, `label`, and each edge's two ends — and nothing the join will not read.

## Intent coverage

- SC1
- SC5

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m057-signal-graph.json
- scripts/tutor-signals-capture.test.mjs

## Acceptance criteria

1. `research/raw/m057-signal-graph.json` exists, was written by the suite's own capture command, and
   carries `capture.command`, the route the capture was taken on and the head it was taken at; a
   second unarmed run changes no byte.
2. The record carries the graph the agent serialized — each node's `index`, `kind` and `label` and
   each edge's two ends — and no field the reader ignores, so SC1's answer can be read from this
   record without composing one (SC1).
3. The capture is Insurance Portal first: the portal route tried is named, the labelled
   `Resource.loadEffect` the portal's record carries is stated, and where the counter fixture is
   used the record names both that route and the empty-label effect node the portal lacks (SC5, E6).
4. The capture adds no page-side instrumentation: it starts no profiler tap of its own, registers no
   listener on the inspected page and reads no DOM, clock, console or page global beyond the read the
   agent already makes for the graph, and the suite pins both counts against the existing capture
   path (SC5).

## Verify

```bash
node --test scripts/tutor-signals-capture.test.mjs && npx prettier --check scripts/tutor-signals-capture.test.mjs research/raw/m057-signal-graph.json
```

## Log

- pending.
- Landed paths: `research/raw/m057-signal-graph.json`, `scripts/tutor-signals-capture.test.mjs` — each is read from this tree, ready.
