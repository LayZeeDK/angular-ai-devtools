# Plan — M024 proof-corpus-repair

<!-- Written by the orchestrator. Executed wave-by-wave by /gsd-path-build. -->

Project verify: `npm ci --include=dev && npm run check && npm test`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — the corpus becomes a gate

Goal: Ten of thirty-two held-out suites fail in every fresh checkout, and no npm script reaches any of
them, so the corpus has never gated anything. T001 removes the ten that cannot pass and records each
claim it made, because deleting to reach green without the record loses the only thing the suite owned.
T002 puts the remaining twenty-two behind `scripts/held-out-corpus.mjs`, run serially — a parallel
`node --test` collides on the fixture build and on the ports two suites bind — and makes `npm test`
reach it, which is the change that turns the corpus into a gate. T003 proves the gate bites: a
corpus with one failing suite exits non-zero naming that file, an empty corpus is an error rather than
a pass, and the script runs with no `.project/` directory anywhere under its root, which is the
condition the ship flow creates.
Review depth: full

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E1 | T002 | scripts/held-out-corpus.mjs |
| E2 | T003 | scripts/held-out-corpus.test.mjs |
| E3 | T003 | scripts/held-out-corpus.test.mjs |
| E4 | T003 | scripts/held-out-corpus.test.mjs |
| E5 | T001 | scripts/retired-suites.test.mjs |

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T002 | AC1 |
| SC2 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC4 | T001 | AC1 |

## Ordering

T001 before T002, because the script must not be written against a corpus that still contains ten known
red suites; T003 last, because it proves what T002 built.
