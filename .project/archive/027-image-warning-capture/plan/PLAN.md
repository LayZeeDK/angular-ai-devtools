# Plan — M027 image-warning-capture

<!-- Written by the orchestrator. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the sample is captured or the absence is recorded

Goal: M026 shipped a COM-1 sample whose `source` says it was transcribed from the clone's emitter. T001 runs the
fixture's `/image-budget` page in a real browser, captures what the console actually says, and commits that as
evidence naming the profile, instance and time. T002 then replaces the sample's provenance and proves COM-1 still
produces its finding. If the browser emits nothing, T001 records that negative result and T002 leaves the sample
alone — the one thing neither task may do is make a transcription look captured.
Review depth: full

## Held-out checks

| Edge | Task | Test |
| --- | --- | --- |
| E1 | T001 | scripts/image-warning-capture.test.mjs |
| E2 | T001 | scripts/image-warning-capture.test.mjs |
| E4 | T001 | scripts/image-warning-capture.test.mjs |
| E3 | T002 | scripts/image-finding.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T001 | AC1 |
| SC2 | T001 | AC2 |
| SC4 | T001 | AC4 |
| SC3 | T002 | AC1 |
| SC5 | T002 | AC3 |

## Ordering

T001 before T002: the provenance T002 writes must come from a capture T001 produced or a negative result T001
recorded.
