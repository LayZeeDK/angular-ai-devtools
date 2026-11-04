# Plan — M024 `proof-corpus-repair`

## Summary

Catalogue the corpus, remove the ten suites that cannot pass, and put the rest behind a script the project gate
runs — serially, because a parallel run collides on the fixture build and on ports.

## Measurement

See `MEASUREMENT.md`. Ten of thirty-two are red at every head; twenty-two are unmeasured.

## Waves

### Wave 1 — the corpus becomes a gate

| Task | Change |
|---|---|
| T001 | Remove the ten suites that cannot pass, recording each claim and where it now lives |
| T002 | Add `test:held-out`, running the corpus serially, and make `npm test` reach it |
| T003 | Prove the gate bites: a red suite fails it, and the corpus runs with `.project/` absent |

Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
|---|---|---|
| SC1 | T002 | AC1 |
| SC2 | T003 | AC1 |
| SC3 | T003 | AC2 |
| SC4 | T001 | AC1 |

## Ordering

T001 before T002, because the script must not be written against a corpus that still contains ten known red
suites; T003 last, because it proves what T002 built.
