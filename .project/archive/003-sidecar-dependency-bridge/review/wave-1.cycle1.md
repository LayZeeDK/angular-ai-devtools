# Review — wave 1, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: full
Tasks reviewed: 2

## T001 — Add automatic verify-sidecar dependency bridge helper with reuse, fail-fast, and safe teardown: pass

- ✅ A fresh verify sidecar can run `npm run check` after calling the helper to bridge `node_modules`, with no manual junction step (edge E1, E2). — recorded orchestrator Verify T001 pass, exit 0; `node --test scripts/sidecar-deps-bridge.test.mjs` 3/3 pass (`reuse-if-correct`, `fail-fast-missing-primary`, `rerun-reuses-bridge`); commit `ea2f3e9` adds `scripts/sidecar-deps-bridge.mjs`.
- ✅ A fresh verify sidecar can run `npm test` (296/296) after bridging, and re-running reuses the bridge without corrupting results (edge E5). — `rerun-reuses-bridge` passes and teardown `unlinkSidecarDeps` returns `{ removed: true }` without touching primary `node_modules`.
- ✅ Reusing an existing correct bridge is a no-op; a missing/broken primary `node_modules` fails fast with a clear error and triggers no install (edge E1, E2). — `reuse-if-correct` and `fail-fast-missing-primary` pass; `validatePrimary` throws `/missing or broken/` and no install is invoked.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T002 — Relocate .browsers/ and tmp/ runtime artifacts under .commandcode/worktrees/ with fallback read: fail

- ❌ control-ai-browsers resolves `.browsers/` and `tmp/` under `.commandcode/worktrees/` and still passes its tests, with a one-time fallback read from the old location preserving all existing artifacts (edge E3). — found: `resolveArtifactDir`/`fallbackRead` are implemented and exported in both skill copies and the recorded orchestrator Verify T002 passes (47 tests), but the held-out pin test `fallback-read-old-path` is absent from `.claude/skills/control-ai-browsers/scripts/control.test.mjs` and `.commandcode/skills/control-ai-browsers/scripts/control.test.mjs`, and neither recorded Verify output lists it. fix: add a test named `fallback-read-old-path` that exercises copy-migration from the legacy root and fallback read when the new location is empty/missing, in both skill trees.
- ✅ No existing `.browsers/` or `tmp/` contents are lost during migration (edge E3). — `resolveArtifactDir` uses `cpSync(oldDir, newDir, { recursive: true })` only when `newDir` is missing/empty and never deletes the legacy location; prohibition N5 observed satisfied.

Warnings (non-blocking):
- Edge E3 held-out test missing; SC4 blocked.

Contract violations (blocking):
- none

## Intent coverage

### SC1 — A freshly created verify sidecar runs `npm run check` with no manual dependency bridge and exits 0.: pass
- ✅ Recorded orchestrator Verify T001 pass (3/3 tests); commit `ea2f3e9` implements `bridgeSidecarDeps` with junction (`win32`) / `dir` (POSIX) symlink and reuse-if-correct.

### SC2 — A freshly created verify sidecar runs `npm test` with no manual dependency bridge and exits 0 (296/296 tests pass).: pass
- ✅ `rerun-reuses-bridge` passes; re-running reuses the bridge and teardown is non-recursive, so results are not corrupted (edge E5).

### SC4 — `.browsers/` and `tmp/` runtime artifacts are relocated under `.commandcode/worktrees/` (or an equivalent git-ignored path) and all references are updated.: fail
- ❌ Implementation relocates `TMP`/`PROFILES` under `.commandcode/worktrees/` and keeps a fallback read, but edge E3 held-out test `fallback-read-old-path` is missing from both control test files and recorded Verify output. fix: pin the fallback-read/copy-migration behavior with the named test in both skill trees.

## Fixed since last cycle
- none (cycle 1)

## Summary for orchestrator
- blocked findings: T002 AC1 / SC4 — missing held-out edge E3 pin test `fallback-read-old-path` in both `.claude` and `.commandcode` control-ai-browsers test files.
- repeat offenders: none
- warnings worth a human eye: none beyond missing held-out test.