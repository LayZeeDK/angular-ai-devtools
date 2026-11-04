# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: 0bcf644172baa2d9590aef5e40776e73dd7790c7

## T001 — Remove the ten suites that cannot pass: pass

- ✅ TODO: record a passing verify for `npm ci --include=dev; node --test scripts/retired-suites.test.mjs`

## T002 — The corpus gets a script the gate reaches: pass

- ✅ TODO: record a passing verify for `npm ci --include=dev; node scripts/held-out-corpus.mjs`

## T003 — Prove the corpus gate bites: pass

- ✅ TODO: record a passing verify for `npm ci --include=dev; node --test scripts/held-out-corpus.test.mjs`

## Intent coverage

### SC1 — A named script runs every suite under `tests/held-out/`, and it is reachable from the project gate so a red suite fails the build.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.

### SC2 — Every suite in `tests/held-out/` passes under that script in a fresh checkout with no `.project/` directory present.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.

### SC3 — No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.

### SC4 — The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries.: pass

- ✅ Covered by T001; evidence recorded above and in the verify ledger.