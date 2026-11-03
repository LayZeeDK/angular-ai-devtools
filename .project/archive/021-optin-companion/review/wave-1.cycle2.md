# Review — wave 1, cycle 2

Reviewed HEAD: ac400a7944e17f0ed29d9d0ae9c576577f784e16
Wave verdict: pass
Cycle: 2
Depth: full
Tasks reviewed: 4

## T001 — Repair the regenerated docs audit so both documentation pins are green at the base: pass

- ✅ Verify `npm ci --include=dev && node --test scripts/docs-audit-disposition.test.mjs scripts/autonomy-gaps.test.mjs` exited 0 at b940979: 18 tests, 18 pass, 0 fail, 0 skipped (verify ledger `.project/build/verify-ledger.jsonl`, T001 entry; task Log tail shows E6 and E7 green).
- ✅ AC7 the two pins keep their base bytes — `git show b940979 --stat` touches neither `scripts/docs-audit-disposition.test.mjs` nor `scripts/autonomy-gaps.test.mjs`; the diff is the audit, the 17 ruled documents, both skills-mirror trees and the task file, all inside the task's `files` list.
- ✅ AC2/AC5 — the recorded Verify output shows E5, E6 and E7 green with the seven exemptions and the head gate passing, so every remaining `unverifiable` row names a shipped command and the inventory gate exits 0 over the head audit.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T002 — Create the companion package and prove the facade survives a development build of the fixture: pass

- ✅ AC2 — the write shape is exactly as pinned: `src/index.ts` calls `installFacade(facade)` only inside `provideAiDevTools()` under `if (isDevMode())`; `src/facade.ts` `installFacade` is first-write-wins property assignment and the module's only global statement; no `forwardRef`, no `defineProperty`, no module-scope write anywhere in the package sources.
- ✅ AC3 — `packages/ai-devtools-companion/test/facade.test.mjs` snapshots own string and own symbol key names separately before and after, compares the two installs with `Object.is`, and rejects three deliberately broken writers (second string key, symbol key, replacement), so E4 and E5 cannot pass on a mutant; its 8 tests ran green in the recorded Verify at 6724919 (ledger: 14 tests, 10 pass, 0 fail).
- ✅ SC4 evidence restored at HEAD — the four dev-build tests cycle 1 recorded as skipped (AC5, AC6, the `--preserve-symlinks false` negative control, AC7) now carry checked green evidence: T006's restored Verify at ac400a7 reports 7 tests, 7 pass, 0 skipped (T006 Log), and the fail-not-skip change makes a missing install red, so the vacuous pass cannot be reproduced.
- ✅ AC7 — `research/raw/companion-dev-build.json` records `configuration: "development"` and a build command naming `--configuration development`; the AC7 test at `scripts/facade-dev-build.test.mjs:582-656` cross-checks every recorded field against the build and installs it re-derives, and it is green at ac400a7.
- ✅ AC5 — `spikes/ng222-app/angular.json` gains `preserveSymlinks: true` only in the `development` configuration; the AC5 test asserts symlink-anchored resolution lands inside the fixture's install, the real-path anchor is the root 22.1.8, and no new `@angular/*` dependency is declared.

Warnings (non-blocking):
- The task's `## Verify` still provisions the fixture with `npm --prefix spikes/ng222-app ci` without `--include=dev`, and the Log keeps the cycle-1 vacuous orchestrator Verify record (10 pass / 4 skipped). On this host (`NODE_ENV=production`) that line now drops the fixture devDependencies and — after T006 — fails instead of passing vacuously, so the stale record is no longer reproducible as a pass. Actionable: open — amend the Verify line to `npm --prefix spikes/ng222-app ci --include=dev` (as PLAN.md's project verify and T006's Verify already do) or record the plan's project verify line as the authoritative provisioning. Not blocking: the root cause is fixed and the SC3/SC4 evidence exists at HEAD.

Contract violations (blocking):
- none — the commit touches only files in its `files` list plus its own task file.

## T003 — Add the companion package's type check to the check chain as an authorised re-pin: pass

- ✅ AC1 — the `package.json` diff adds exactly one script, `check:companion` = `tsc -p packages/ai-devtools-companion/tsconfig.json`, appended last to the chain; `CHECK_STAGES` in `scripts/panel-typecheck-scope.test.mjs` names all five stages with no wildcard, and the recorded Verify log shows the chain running green through `check:companion` at e640292 (ledger line 3: pin suite 7 tests, 7 pass, 0 skipped).
- ✅ AC3 — the pin still bites: the red half replays the same `assert.deepEqual` over four mutated lists (companion dropped, panel dropped, panel and companion swapped, an extra stage appended) and asserts each refusal, so the re-cut list cannot pass unconditionally (N6).

- ✅ AC4 — the companion probe extends the real config from a `mkdtempSync` directory under git-ignored `tmp/` with exactly one restated option (`rootDir`, because no single rootDir spans a probe on another drive), asserts exactly one `TS2322` naming `deliberate-type-error.ts(1,14)`, and passes once the probe is fixed; the fixture is removed in a `finally` in the test source. The cycle-1 acceptance of the `tmp/`-hosted probe as not a weakening is re-affirmed: it extends the real config, so strictness and module resolution are the package's own.
- ✅ AC2/AC5 — the panel config include/exclude assertion, the `check:panel` script assertion and the root `tsconfig.json` three-entry assertion keep their base bytes (the diff leaves them untouched), and the Log records `npm test` green at this head (176/176 scripts+extension, 60/60 user-scope, 590/590 skills, 277 app tests).

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T006 — Fail the development-build proof when the fixture install is absent, instead of skipping it: pass

- ✅ AC1 — `git show ac400a7` removes every skip option: the five skip-guarded tests (AC1, AC5, AC6, the negative control, AC7) now open with `requirePrerequisite(...)`, an `assert.equal` that fails, and no `skip` token remains anywhere in `scripts/facade-dev-build.test.mjs`.
- ✅ AC3 — the failure actually fires: the Log's AC3 probe (fixture install moved aside) exited 1 with tests 7 / pass 3 / fail 4 / skipped 0 and the line `AssertionError … the development-build proof cannot run: the fixture install is absent (spikes/ng222-app/node_modules); run npm --prefix spikes/ng222-app ci --include=dev` — byte-consistent with `requirePrerequisite` at `scripts/facade-dev-build.test.mjs:305-307` and with exactly the four tests that open with `requirePrerequisite(MISSING_MEASUREMENT_ENVIRONMENT)` failing while AC1, AC4 and the N5 test (which need no fixture install) pass.
- ✅ AC2 — the restored Verify at ac400a7 exits 0 with 7 tests, 7 pass, 0 skipped.
- ✅ AC4 — the diff changes only skip options and three failure-message wordings; every assertion body — entry name and unminified check, dev-mode guard, single Router binding, one-Angular-banner check, the two-copy counterexample, and the full AC7 recording cross-check — is untouched.

The "restored in a finally" claim: credible. The probe itself is untracked scratch, so the `finally` is not visible in any tracked artifact, but the recorded failure output matches the test source's exact wording, the 3-pass/4-fail split matches exactly which tests carry the precondition, the tracked tree is clean at ac400a7, and the subsequent restored Verify requires the install present.

Warnings (non-blocking):
- The AC3 probe's `finally` restore is corroborated only by the Log's recorded outputs and the clean tree at ac400a7, not by a tracked artifact. Actionable: accepted — the recorded evidence is internally consistent.
- T006 has no orchestrator-recorded Verify entry in `.project/build/verify-ledger.jsonl` (the ledger ends at T003); its 7/7 and probe-failure evidence is the build Log's record. Actionable: open — the ship-time project Verify in PLAN.md runs the dev-build suite explicitly and should be the closing run.

Contract violations (blocking):
- none — the commit touches only `scripts/facade-dev-build.test.mjs` and its own task file.

## Intent coverage

### SC3 — The package adds nothing to `globalThis` beyond its table entry.: pass

- ✅ E4/E5 proven by `packages/ai-devtools-companion/test/facade.test.mjs`, green in the recorded Verify at 6724919 (ledger: 14 tests, 10 pass, 0 fail): the own string key delta is exactly `ngAiDevTools`, own symbol keys are unchanged, the second install is `Object.is`-identical and throws nothing, and the same probe rejects a second string key, an own symbol key and a replacement, so a mutant cannot pass (N6).
- ✅ The served reading recorded in `research/raw/companion-dev-build.json` (`ownStringKeyDelta: ["ngAiDevTools"]`, `ownSymbolKeysChanged: false`, `ownStringKeysRemoved: []`) is cross-checked field by field by the AC7 test, green at ac400a7 with 0 skipped (T006 Log restored Verify).

### SC4 — The facade survives a development build's tree-shaking, proven on the fixture rather than on `buildOptimizer`.: pass

- ✅ At ac400a7 the development-build suite runs 7 tests, 7 pass, 0 skipped (T006 Log restored Verify): the development configuration build is unminified and keeps the entry name `ngAiDevTools`, the `isDevMode()` guard, one Router class binding and exactly one Angular banner `22.2.2` (AC6), while the same build with `--preserve-symlinks false` carries both banners and the suffixed root-owned class — the negative control that shows the option is load-bearing (N5).
- ✅ The proof runs on the fixture, never on the removed option: `buildFixture` requires an explicitly named configuration, the N5 test refuses the option's name in every file the task writes, and the recording is refused unless it names `--configuration development`.

### SC5 — `npm run check` and `npm test` pass at the head.: pass

- ✅ `npm run check` — five stages ending in the new `check:companion` — is recorded green at e640292 (T003 Log and ledger line 3, 7/7 pin tests); T006 changed only `scripts/facade-dev-build.test.mjs`, which no check stage reads, so the chain and its inputs are unchanged at ac400a7.
- ✅ `npm test` is recorded green at e640292 (176/176 scripts+extension, 60/60 user-scope, 590/590 skills, 277 app tests); at ac400a7 the only file under its `scripts/**` glob that changed is `scripts/facade-dev-build.test.mjs`, and the restored Verify runs it green at ac400a7 (7 tests, 7 pass, 0 skipped). The ship-time project Verify in PLAN.md re-runs the full line with the fixture provisioned `--include=dev`.

## Fixed since last cycle

- T002's vacuous pass (its Verify exited 0 while the four SC4-carrying tests reported skipped) — confirmed fixed: T006 removed every skip option (`git show ac400a7`), the missing install now fails naming `npm --prefix spikes/ng222-app ci --include=dev` (Log probe: exit 1, 4 fail, 0 skipped), and the suite is 7 tests, 7 pass, 0 skipped at ac400a7 (restored Verify). No regression found in the conversion: assertion bodies are byte-unchanged, and PLAN.md's project verify line now provisions the fixture with `--include=dev`.

## Summary for orchestrator

- blocked findings: none — the wave passes; the cycle-1 block on T002 is resolved at HEAD by T006's fail-not-skip change plus the repaired project verify line.
- repeat offenders: none.
- warnings worth a human eye:
  - T002's `## Verify` still omits `--include=dev` on the fixture install, and its Log keeps the vacuous 10-pass/4-skip orchestrator Verify record; on this host the stale line now fails rather than passing vacuously, so the defect is inert but the record is stale. Actionable: open — amend the Verify line or record PLAN.md's project verify line as the authoritative provisioning.
  - T006 has no orchestrator-recorded Verify entry in the verify ledger; its 7/7 and probe-failure evidence is the build Log's record. Actionable: open — the ship-time project Verify should be the closing run.
  - The brief's stub `wave-1.cycle2.stub.md` was absent at its stated path; the SC headings above were taken from INTENT.md `## Success criteria`, which is what the wave gate compares against.

