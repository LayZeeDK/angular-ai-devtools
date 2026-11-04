# Intent — M024 `proof-corpus-repair`

## Summary

Make the held-out proof corpus load-bearing: every suite either passes in a fresh checkout under a script that
the project gate runs, or it does not exist.

## Problem

Thirty-two held-out suites sit in `tests/held-out/`. No npm script runs any of them, and ten are red in a fresh
checkout because they read `.project/review/rounds/` and `.project/review/specs/`, which were never tracked.

A corpus outside the gate cannot catch a weakening proof — the failure M023 spent nine review cycles chasing by
hand. It also teaches readers that a red suite is normal.

## Users

The maintainer running `npm test` and expecting it to mean something about the product's proofs; the reviewer
who cites a held-out suite as evidence; the next milestone's coder, who needs a corpus whose green is real.

## Success criteria

1. A named script runs every suite under `tests/held-out/`, and it is reachable from the project gate so a red suite fails the build.
2. Every suite in `tests/held-out/` passes under that script in a fresh checkout with no `.project/` directory present.
3. No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside.
4. The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries.

## Edge coverage

| Edge | Criterion | Category | Disposition | Test |
| --- | --- | --- | --- | --- |
| E1 | SC2 | boundary | held-out | `scripts/held-out-corpus.test.mjs` — a suite whose prerequisite is absent fails naming the prerequisite, never skips |
| E2 | SC1 | adjacency | held-out | `scripts/held-out-corpus.test.mjs` — a suite that needs a browser or a served page is excluded by a named condition in the gate, not by an inner return that reports pass |
| E3 | SC3 | empty | held-out | `scripts/held-out-corpus.test.mjs` — deleting the subject a suite cites reddens that suite rather than leaving it green on a stale path |
| E4 | SC2 | empty | held-out | `scripts/held-out-corpus.test.mjs` — the corpus runs and passes with no `.project/` directory present, and an empty corpus is an error |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Why |
| --- | --- | --- | --- | --- |
| N1 | SC3 | Read any path under `.project/` from a suite in `tests/held-out/` | held-out | `.project/` is moved into the archive by the ship flow, so such a suite is red exactly when the milestone ships |
| N2 | SC1 | Exclude a suite from the corpus by a mechanism that also hides its failure | held-out | a skip that reports pass is the defect this milestone exists to repair |
| N3 | SC4 | Delete a suite to reach green without recording the claim it made | judgment | the claim is the asset; deleting it silently loses the reason the suite existed |

## Scope

In: `tests/held-out/`, the npm scripts, and whatever the ten dead suites need to become honest.

Out: adding new held-out suites for new features; changing the product to satisfy a suite.

## Constraints

- The corpus must run from a fresh checkout after `npm ci --include=dev`, with no prior build.
- `.project/` is moved into the archive by the ship flow, so nothing under it is a stable dependency.
- A suite that needs `jsdom` or the fixture's `node_modules` must say so in its failure, not fail opaquely.

## Current state

`npm test` runs 60 + 594 tests and passes. `tests/held-out/` is not reached by any script. Ten of its 32 suites
fail with `ENOENT` on `.project/review/rounds|specs/`.

## Risks

- Wiring the corpus into `npm test` may expose more red suites than the ten known ones; the milestone must find
  them all before planning, or the plan will under-count.
- Some dead suites may encode a claim worth keeping; deleting them loses the claim unless it is recorded first.

## Open questions

- Should the corpus be part of `npm test` or its own gate that CI runs beside it? The criteria say reachable from
  the gate; the plan decides the mechanism.

## Corrections
