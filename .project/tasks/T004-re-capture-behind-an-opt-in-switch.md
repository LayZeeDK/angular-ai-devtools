---
id: T004
title: Re-capture behind an opt-in switch and record the milestone's verdict claims
wave: 4
status: pending
deps:
  - T003
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/render-phase-capture.test.mjs
  - research/raw/m039-render-phase.json
  - research/raw/m039-verdict-claims.json
---

# T004 — Re-capture behind an opt-in switch and record the milestone's verdict claims

## Context

T001 measured once. A measurement that can only be taken once goes stale the first time
the page or the Angular install moves, and a measurement that re-runs on every test run
writes into a tracked file as a side effect of `npm test`. This task makes the re-capture
a switch: armed by `M039_CAPTURE=1`, read-only otherwise, and it adds the one recording
the project gate itself reads.

That second recording is not optional. The claim-list suite resolves the milestone from
`STATE.md`'s branch and fails, rather than skipping, when
`research/raw/m039-verdict-claims.json` is absent — so `npm test` cannot be green at this
head without it, and SC6 is unreachable until it exists. Its rows rule each of SC1-SC6
against CHARTER's portal clause, quoting each criterion character for character, the way
the previous milestones' recordings do.

The capture re-records the same file T001 wrote, in a later wave and behind a dependency,
so the two tasks cannot race on it: T004 rewrites what T001 established and adds the
claim list beside it.

## Approach

An armed capture and an unarmed proof, in one suite.

Unarmed, the suite proves the discipline instead of driving anything: it names every file
it would write, asserts that none of them changed during the run, and asserts that the
recording on disk still re-derives the claims T001 recorded — so an unarmed run is a
freshness check rather than a no-op. Armed, it takes the measurement again through the
existing capture path for the effect graph and the change-detection message, and rewrites
the recording with a fresh provenance block (route, build, instance, time).

No derived value is pinned as a literal in either half: the suite reads the recording and
compares field by field, and where it must name a shape it names the join's own published
constant rather than a hand-written copy of the answer. A second armed run must change no
byte, which is how idempotence is proven rather than assumed.

The claim list is authored from the intent at this head: one row per criterion, each with
the ruling the portal clause supports, a reason that names the portal route tried or the
artefact the target lacks, and the reading that produces the criterion's facts. Ruling a
criterion `not-required` is a claim too, so each such reason says why the portal clause
does not reach it.

The gate itself is run once at the end of this task and its result recorded in the Log:
`npm run check` and `npm test` at the head.

## Interface contract

None.

## Files

- `scripts/render-phase-capture.test.mjs`
- `research/raw/m039-render-phase.json`
- `research/raw/m039-verdict-claims.json`

## Intent coverage

- SC6

## Acceptance criteria

1. The capture writes nothing by default, names every file it would write, and rewrites the recording only when `M039_CAPTURE=1`.
2. Every value the join and the pane report is derived from the recording, never pinned as a literal in the capture or in its suite, and the suite fails when the recording and the derivation disagree.
3. The claim list rules each of SC1-SC6 with a reason that answers the portal clause, quotes each criterion character for character, and names the source page, route, readings and verdict path for every row it rules required.
4. The project gate is green at the head: `npm run check` and `npm test`, with the claim-list suite no longer failing for a missing recording.
5. A second armed run changes no byte of the recording, so the re-capture is idempotent rather than merely repeatable.

## Verify

```bash
node --check scripts/render-phase-capture.test.mjs && node --experimental-strip-types --test "scripts/render-phase-capture.test.mjs" "scripts/render-phase.test.mjs" "scripts/overlay-verdict-claims.test.mjs" && npx prettier --check scripts/render-phase-capture.test.mjs
```

## Log

- dispatched
