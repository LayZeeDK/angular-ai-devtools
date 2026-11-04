# Gap Review — 1: a success criterion of INTENT.md does not hold at d88e658b

Reviewed HEAD: d88e658be14e03ab71f56a69dd5521106c4f6eee
Gap verdict: pass
Risk: a success criterion of INTENT.md does not hold at d88e658b
Waves checked: 1, 2

## Checked evidence

- **Check**: Re-read INTENT.md, PLAN.md, MEASUREMENT.md and the T004 delegated ruling at this head; re-ran `node --test scripts/held-out-corpus.test.mjs` (10/10 pass after `npm ci --include=dev` and the fixture install) and `node --test scripts/retired-suites.test.mjs` (4/4 pass); read `scripts/held-out-corpus.mjs`, `scripts/held-out-corpus.test.mjs`, `package.json`, `.project/plan/RETIRED-SUITES.md` and grepped every suite under `tests/held-out/` for `.project` paths.
- **Observed**: `package.json` line 11 reaches `test:held-out` (`node scripts/held-out-corpus.mjs`) from `npm test`, and the script enumerates all 22 `*.test.mjs` under `tests/held-out/` with no exclusion mechanism — a failing, skipped, todo, zero-test or renamed-away suite reddens it. The real-corpus proof runs the corpus with no `.project/` directory anywhere under its root and asserts a `PASS` line per suite plus a ≥18-suite floor. No suite under `tests/held-out/` reads a `.project` path (only provenance comments in `e7-archive-order.test.mjs`). All ten retirement rows in RETIRED-SUITES.md are specific (named commits, named verdict pairs, named failure modes), and both sampled successors exist: `gsd review-check`/`final-check` in `%USERPROFILE%\.commandcode\scripts\gsd\gsd.ts` and the `extension-panel` check in `.commandcode/skills/verify-ai-browsers/SKILL.md`.
- **Reference**: scripts/held-out-corpus.mjs:150-191,237-267; scripts/held-out-corpus.test.mjs:361-364,458-505; package.json:11-14; .project/plan/RETIRED-SUITES.md:16-25; .project/tasks/T004-the-corpus-runs-with-no-project-directory.md:58-69

## Intent coverage

### SC1 — A named script runs every suite under `tests/held-out/`, and it is reachable from the project gate so a red suite fails the build.: pass

- ✅ `scripts/held-out-corpus.mjs` finds all 22 `*.test.mjs` suites (edge E1); `npm test` reaches it through `test:held-out` (package.json:11,14). The runSuite judge (held-out-corpus.mjs:180-188) fails non-zero exits, zero-test suites, skipped and todo tests, so no exclusion mechanism can hide a red suite (N2, N4); the corpus test proves each of these reddens (4 of its 10 tests).

### SC2 — Every suite in `tests/held-out/` passes under that script in a fresh checkout with no `.project/` directory present.: pass

- ✅ The real-corpus test (held-out-corpus.test.mjs:458-505) runs the corpus in a fixture clone with `.project/` asserted absent and 19 of 22 suites green, each named, plus the `e7-archive-order` PASS line. The three not run there are named in `NOT_RUN_HERE` with reasons (lines 361-364): `e3`/`e4` drive `npm test`, whose project gate reads `.project/`, and `fixture-rebuild-idempotent` needs the fixture's nested install — this is the scope the delegated T004 ruling on AC1 restated, and those three still run and pass in the corpus proper under `npm test` (Verify exit 0 at this head). Pass under the recorded ruling; the letter of SC2 alone would count `e3`/`e4` red in the `.project`-absent state.
- ✅ Edge E4: the corpus test proves a suite whose prerequisite is absent fails naming it and an empty corpus (and a root with no corpus directory) is an error, never a pass.

### SC3 — No suite under `tests/held-out/` reads any path under `.project/`, demonstrated by running the corpus with that directory moved aside.: pass

- ✅ Grep over `tests/held-out/` finds no `.project` read — only provenance comments in `e7-archive-order.test.mjs:11,15,26` and unrelated `projected` matches. The corpus-level proof (edge E3) runs the real corpus with `projectDirectories(root)` asserted `[]` before and after, exit 0, and the companion test reintroduces the old `existsSync` read as `e7-archive-order-restored-read.test.mjs` and shows that run redden naming the file, the exit and the assertion message (held-out-corpus.test.mjs:507-539).

### SC4 — The ten suites that read `.project/review/rounds/` or `.project/review/specs/` are either deleted with their claim recorded, or re-homed so their claim is asserted from data the suite carries.: pass

- ✅ All ten are deleted with per-row claims in `.project/plan/RETIRED-SUITES.md` (six eN rows name the exact files, sections and commit ranges they lost; four panel rows name the instance, flows and the `extension-panel` + `state` successor). `node --test scripts/retired-suites.test.mjs` passes 4/4: one row per retired suite and no others, every cell filled, no retired file under `tests/held-out/`, no repository file naming a retired basename outside the record (edge E5). Spot-checked rows `e10-spec-present` and `chrome-beta-nano-panel`: both successors exist — `gsd review-check`/`gsd final-check` in gsd.ts and `.commandcode/skills/verify-ai-browsers/SKILL.md` check `extension-panel` (lines 18, 48-49).

## Finding

- **Found**: All four criteria hold at this head, with one recorded narrowing: SC2's `.project`-absent state leaves `e3-zero-skipped` and `e4-idempotent-checks` red because those two suites drive the project gate by design; the delegated T004 ruling restates the acceptance so every failure there must be a gate-driving suite named as such, and the artifact (`NOT_RUN_HERE` with reasons plus per-name `PASS` assertions and the ≥18 floor) implements exactly that. The floor tolerates one suite silently vanishing from the corpus pattern (19 expected − 1 = 18); see final-gap-2 for the attack detail.
- **Fix direction**: none
