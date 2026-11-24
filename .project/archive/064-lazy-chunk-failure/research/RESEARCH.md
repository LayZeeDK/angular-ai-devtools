# RESEARCH — M064 lazy-chunk-failure

Phase: research
Status: complete
Intent: `.project/intent/INTENT.md`
Milestone: M064 — lazy-chunk-failure

Measured at `gsd-path/M064` before planning. Every claim below is a command's output or a quoted line of source.

## Dispatch

No subagent was dispatched: the roadmap entry lists **no open questions**, and this phase's questions are all answerable
by one file read each.

- `domain` — skipped → none — R1: no chunk is recorded, and the narrator says why in its own comment.
- `stack` — skipped → none — R2: the router's dynamic import is reachable from the place the content script already
  observes navigation.
- `pitfalls` — skipped → none — R3: `agent-main.js` carries no chunk field, so a join written first would join nothing.
- `similar` — skipped → none — M063 wrote a record before joining it; this plan keeps that shape.

## Question assignments

## R1 — no import failure is recorded

`grep -c "chunk" extension/agent-main.js` returns **0**. `extension/navigation-narrator.js:26` states the reason: the
navigation payloads carry `{ route, type }`, and no key of either names a guard, a resolver, a chunk or a task. Lines 96
and 348 repeat it for the sections they describe.

Consequence: the milestone writes the record before it joins it, and the join's inputs are the record's fields.

## R2 — the record's shape is set by the roadmap's own risk

A chunk replaced after deploy and a network failure look the same from the router. So the record must carry the response
status and the content hash, and a request that never completed must be `never-completed` with a reason — never a version
drift inferred from a status. That is edge E3 and prohibition N1 in the intent.

## R3 — the surface lists that must move together

A new panel surface is enumerated by: `app.routes.ts` (the route), `panel-demo.ts` (`LOADERS`), `app.spec.ts` (the route
table pin), `scripts/panel-routes.test.mjs` (every `data.surface` has a loader), the copy record suite, and
`scripts/after-render-fixture.test.mjs` (the fixture's full route table). M032 shipped a surface without the last of these
and M033 without the second, and both cost a gate cycle.

## R4 — the recordings that read the tree, not just the files

Six suites census `research/raw/`: `tutor-signals-shapes`, `teardown-leak-shapes`, `visual-qa-style-read`,
`webmcp-api`, `gate-integrity` and `gate-stability-record`, with records `m057`, `m059`, `m054`, `m052`, `m044` and
`m056`. M063's plan declared only the records it pinned and needed three dispatch rounds because of it. This plan declares
all six in both of the tasks that run them, and derives the two gate records last in gate-then-stability order.

## R5 — the verify's own side effects

The verify line builds the extension, which rewrites `extension/panel/index.html` with a non-deterministic
`modulepreload` order, and its held-out leg takes 23 minutes because `e3` spawns a full `npm test` and `e4` spawns
check-and-test twice. So the verify runs detached and the built file is restored afterwards; both facts are named in the
task that runs it.
