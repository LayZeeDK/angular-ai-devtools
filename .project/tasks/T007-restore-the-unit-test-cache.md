---
id: T007
title: Restore the unit-test cache the held-out inner runs depend on
wave: 5
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - nx.json
  - .project/research/SYNTHESIS.md
---

# T007 — Restore the unit-test cache the held-out inner runs depend on

## Context

T006 set `"cache": false` for `@angular/build:unit-test` so the gate could not replay app-test results. That change is
correct in isolation and wrong in this repo, and the measurement says why:

- `tests/held-out/e3-zero-skipped.test.mjs:13` and `tests/held-out/e4-idempotent-checks.test.mjs:13` each spawn
  `npm test` with `timeout: 20 * 60 * 1000`.
- `npm test` includes `test:held-out`, which runs those same two suites — so the gate re-enters itself. E4 does it twice.
- With the cache on, the inner runs fit inside 20 minutes because the app suite is replayed. With the cache off they do
  not: the inner run is killed at 20 minutes, returns partial output, and E3 fails at its `passMatches.length >= 3`
  assertion — which reads as "too few pass blocks", not "the inner gate timed out".

Observed on head `f404eee`: `Cache: 0/1 hit (0%)` on two consecutive `npx nx run angular-ai-devtools:test` runs — the
cache was genuinely off — and E3 failed anyway, which disproved the cache being the cause of E3's earlier failure.

So the cache was masking a **quadratic gate design**: two held-out suites re-run the entire gate, and they only fit inside
their own timeout because part of that gate is replayed rather than executed.

## Approach

Restore `"cache": true` so the inner runs fit their budget again, and record the compounding as the defect to fix properly:
the inner runs must be bounded (a marker the corpus honours so a nested run does not re-enter the held-out stage), after
which the cache can be disabled safely. Reverting is not a retreat from "a gate must measure": it is the honest state until
the re-entrant runs are bounded, because a gate that cannot finish inside its own timeout measures nothing either.

## Interface contract

None

## Files

- `nx.json` — `@angular/build:unit-test` caches again, with a comment in `SYNTHESIS.md` explaining why the revert exists.
- `.project/research/SYNTHESIS.md` — records the finding, the measurement that disproved the cache hypothesis, and the
  bounded-inner-run remedy.

## Acceptance criteria

1. `nx.json` restores `"cache": true` for `@angular/build:unit-test`.
2. Two consecutive `npx nx run angular-ai-devtools:test` runs report `Cache: 1/1 hit (100%)` on the second.
3. `SYNTHESIS.md` states the compounding defect and the remedy, so the next milestone does not re-litigate the cache.

## Verify

```bash
npx nx run angular-ai-devtools:test && npx nx run angular-ai-devtools:test && git status --porcelain nx.json
```

## Intent coverage

- SC5

## Log

- dispatched
