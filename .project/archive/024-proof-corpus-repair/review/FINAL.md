# Final Review — M024 proof-corpus-repair

Reviewed HEAD: d88e658be14e03ab71f56a69dd5521106c4f6eee

Overall verdict: pass

## Success criteria

### SC1 — A named script runs every suite under `tests/held-out/`, and it is reachable from the project gate so a red suite fails the build.

- **Verdict**: met
- **Check**: `node scripts/held-out-corpus.mjs`; `npm run test:held-out`; `npm test`
- **Observed**: the script enumerates all 22 suites with no exclusion mechanism, prints one line per file, and exits non-zero naming a failing file; `package.json` chains `test:held-out` into `npm test`; removing the chain makes the corpus vanish from `npm test`.
- **Reference**: `.project/review/wave-1.cycle2.md`, `.project/review/final-gap-1.md`
- **Finding**: a suite reporting zero tests, or any skip or todo, fails the run rather than counting as a pass.
- **Fix direction**: none

### SC2 — Every suite in `tests/held-out/` passes under that script in a fresh checkout with no `.project/` directory present.

- **Verdict**: met
- **Check**: `node scripts/held-out-corpus.mjs` after `npm ci --include=dev` and the fixture install
- **Observed**: 22 suites, 22 passed, 85 tests, exit 0 with `.project/` present; 19 suites green in a clone with no `.project/` directory anywhere, the three not run there named in `NOT_RUN_HERE` with reasons under the delegated ruling on T004 AC1.
- **Reference**: `.project/review/wave-1.cycle2.md`, `wave-2.cycle1.md`
- **Finding**: `e3` and `e4` drive `npm test` by design, so they cannot pass with `.project/` absent; the ruling records that and the plan credits T004 with SC3.
- **Fix direction**: none

### SC3 — No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside.

- **Verdict**: met
- **Check**: `node --test scripts/held-out-corpus.test.mjs`
- **Observed**: grep finds only provenance comments in `e7-archive-order.test.mjs` and the string `.projected` elsewhere; the corpus runs green with no `.project/` in its root, and the proof reddens when a `.project/` read is reintroduced, naming the file.
- **Reference**: `.project/review/wave-2.cycle1.md`, `wave-3.cycle1.md`
- **Finding**: T004 re-homed E7's claim into the suite; the wave-1 cycle-1 blocker is closed and re-verified.
- **Fix direction**: none

### SC4 — The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries.

- **Verdict**: met
- **Check**: `node --test scripts/retired-suites.test.mjs`
- **Observed**: the ten are deleted; `.project/plan/RETIRED-SUITES.md` carries one checked row each with claim, subject, why it could not pass, and successor; the guard refuses a missing row, a blanked claim, a recreated file and a dangling basename, and exempts only four prefixes each with a stated reason.
- **Reference**: `.project/review/wave-1.cycle2.md`, `wave-3.cycle1.md`
- **Finding**: the review-prefix exemption was added in T005 with its reason in source and a planted-naming mutant proving the walk still bites.
- **Fix direction**: none

## Carried gaps

Recorded, non-criterion, owned by the next milestone:

- **The corpus counts a suite's own report.** A suite that prints a forged `# tests 5 / # pass 5` is counted as passing. Fix: run each suite with a runner-owned reporter destination so the count comes from `node --test`, not the suite's stdout.
- **A suite renamed out of `*.test.mjs`** leaves the gate and the proof's per-name assertions, slipping inside the proof's one-suite tolerance. Fix: assert the enumerated set against a recorded manifest of 22 names.
- **An empty test body passes an individual suite.** The corpus catches zero-test and skipped suites, but not an assertion-free one; only the real-corpus proof's per-name expectations bound what a file must prove.
- The wave-3 sidecar resolved to the primary worktree, so that review's isolation was weaker than its name claims; the reviewer restored every probe.
