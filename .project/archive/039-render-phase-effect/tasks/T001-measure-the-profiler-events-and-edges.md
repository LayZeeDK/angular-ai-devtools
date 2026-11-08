---
id: T001
title: Measure the profiler events, the NG0100 message and the effect's edges
wave: 1
status: done
deps: []
agent: build_t001
base: b114e5fb1eacfb4bad05af7eccc77dd22498c776
worktree: null
task_branch: null
files:
  - scripts/render-phase-measure.test.mjs
  - research/raw/m039-render-phase.json
  - .project/research/m039-render-phase.md
---

# T001 — Measure the profiler events, the NG0100 message and the effect's edges

## Context

The intent is written over three measurements it inherited rather than took: Angular's
`ProfilerEvent` enum declares no effect event, the error digest carries one `NG0100`
entry, and the one recording that holds an effect node shows an empty label with a
single edge. Two of the three are quoted from files that this head may already have
moved, and the third is a probe from 2026-10-12. This task takes all three again at
this head and records what it finds, because SC2 is a cannot-tell criterion and a
cannot-tell that nobody measured is a guess in the other direction.

The enumeration is read from the installed panel package's debug chunk and from the
fixture's own copy, so the count the intent quotes is the count this install carries.
The effect's edges are read from the recording the fixture already produced
(`research/raw/effect-writes.json`, spike probe 2026-10-12, Angular 22.2.2) and, where
the page can be driven, from a fresh read of the same page; the signals an effect reads
are the producers of its consumer edges, and nothing else in this milestone may claim
more than that.

The NG0100 half is a live attempt, not a transcription. The page agent refuses a
zoneful page outright (`extension/agent-main.js:536-542`), the Insurance Portal is
mid-migration and is verified through a pinned zoneful worktree, and the digest's own
entry says Angular throws NG0100 only in development mode — so the attempt is made, its
result is recorded, and if no message is produced the record says so. The honest
substitute is the digest's single `NG0100` entry (`extension/error-digest.json`),
recorded with its provenance as a digest entry, never relabelled as a capture.

## Approach

One measurement run, recorded once, re-derived by a test that reads the installed package
and the recording rather than restating either.

The recording carries four sections and no claim beyond them:

- `profiler` — every value of the enum, by name and number, read from both packages'
  debug chunks by the same reader, plus the answer to "is any of them an effect event".
- `effect` — the node the graph carries: its kind, its label (empty is a finding, not a
  gap), its epoch, its edges and the signals those edges name, recorded from the
  existing probe recording and, where a page read is possible, from a fresh read of the
  same page with the read's own provenance.
- `phase` — whether any node of kind `afterRenderEffectPhase` exists on a page that uses
  `afterRenderEffect`, and whether any node carries a phase field at all. Declared is not
  observed, and this section says which it is.
- `changeDetection` — the live attempt: the route, the build, the browser instance, the
  time, and either the message with its code and its full text, or the negative result
  with what was tried and the digest substitute named as a substitute.

The write-up in `.project/research/m039-render-phase.md` states which of the intent's
premises survived, which moved, and which could not be measured — including the answer
to the three [RESEARCH] questions the intent left open.

The test re-derives the enum claim from the installed package, so a point release that
adds an effect event reddens it rather than leaving the milestone asserting a fact about
an older install. It reads the recording for the effect and change-detection sections and
names the provenance each section carries. Nothing here drives a browser on every run:
the live attempt belongs to the recording's provenance, and its repetition is T004's
armed capture.

## Interface contract

None.

## Files

- `scripts/render-phase-measure.test.mjs`
- `research/raw/m039-render-phase.json`
- `.project/research/m039-render-phase.md`

## Intent coverage

- SC3

## Acceptance criteria

1. Every `ProfilerEvent` value this Angular declares is enumerated by name and number, from the installed panel package and from the fixture's copy, and the enumeration shows no effect event among them — with the reader in the test being the thing that derives it, not a quoted list.
2. A live NG0100 attempt is recorded with its provenance: the route driven, the build, the instance and the time. Where the page produces a message it is recorded with its code and its full text; where it produces none, the negative result is recorded with what was tried, and the digest's single `NG0100` entry is named as the substitute it is — a capture is never fabricated.
3. The effect node the graph carries is recorded — kind, label or the measured fact that the label is empty, epoch, its edges, and the signals those edges name — together with whether a node of kind `afterRenderEffectPhase` exists on a page using `afterRenderEffect`, and whether any node carries a phase field.
4. Every recorded claim is re-derived by a test from the installed package and the recording rather than transcribed, and the test reddens when the package's enum moves or a recorded claim loses the evidence it cites.
5. The record carries no write, no owner and no cause, and the page gains no instrumentation: no second profiler tap, no second append-only list and no new page global.

## Verify

```bash
node --check scripts/render-phase-measure.test.mjs && node --experimental-strip-types --test "scripts/render-phase-measure.test.mjs" && npx prettier --check scripts/render-phase-measure.test.mjs
```

## Log

- dispatched
- 2026-11-08 - measured on the gemma4 instance (Chrome 158.0.8127.18): 26 ProfilerEvent values in both installs (panel 22.1.8, fixture 22.2.2), zero of them an effect event, and afterRenderEffectPhase is a ReactiveNodeKind; no node carries a phase field and no page is of that kind (115 fixture nodes, 1421 portal node occurrences); the counter effect is node 5, label "", epoch 1, one edge to signal:count; the portal labels one effect Resource.loadEffect. No page produced an NG0100 over 17 fixture routes and 66 clicks plus 9 portal routes, so the negative is recorded and the digest's single NG0100 entry is recorded as a substitute (notACapture). Verify: node --check, 28/28 tests pass, prettier clean. Instance and both dev servers stopped; check-teardown clean (browser artifact = the run json, both servers --no-artifact). ready
