## Map
- **Stack**: package.json (line 1): name angular-ai-devtools-workspace, type module; scripts: check/test wired (lines 6-16); test runner node --experimental-strip-types --test (line 11). DevDeps include @nx/* ^23.3.0, @angular/* ~22.1.0, @playwright/test ^1.37.0, vitest ^4.0.8, typescript 6.0.3.
- **Entry points**: scripts/ lists 24 files (scripts/ run 2026-10-30). scripts/run-user-scope-tests.mjs:1-80 resolves user-scope dir via os.homedir()/.commandcode/scripts or env USER_SCOPE_SCRIPTS_DIR/ROOT (lines 11-46), finds **/*.test.mjs (48-65), spawns node --test (67-79). 
pm test (package.json:11) runs repo tests then 
ode scripts/run-user-scope-tests.mjs then test:skills then test:app. scripts/sidecar-deps-bridge.mjs:1-120 bridges sidecar node_modules to primary via junction/symlink with fail-fast validation. scripts/skills-mirror.test.mjs:1-53 asserts .claude/skills mirror .commandcode/skills bytewise.

- **Architecture**: 
pm run check (package.json:7) runs ensure-sidecar-deps.mjs then tsc -p tsconfig.json then check:skills (tsconfig per skills tree). 
pm test (11) chains repo *.test.mjs + extension/*.test.mjs + scripts/run-user-scope-tests.mjs + test:skills (.claude/.commandcode skills) + test:app (nx). scripts/run-user-scope-tests.test.mjs:15-62 shows injectable root via env and recursion.

- **Conventions**: *.test.mjs use import assert from 'node:assert/strict' (run-user-scope-tests.test.mjs:1, sidecar-deps-bridge.test.mjs:1, skills-mirror.test.mjs:6), import { test } from 'node:test' (1,7), spawnSync to invoke CLI-like mjs (run-user-scope-tests.test.mjs:2,26), mkdtempSync+rmSync fixtures (22-29), locate repo via ileURLToPath(new URL('..', import.meta.url)) (skills-mirror.test.mjs:12). Naming *.test.mjs colocated under scripts/ and trees.

- **Maturity**: scripts/run-user-scope-tests.mjs:70-73 exits 1 with 'No user-scope tests found...' when empty/missing (no repo fallback per test:39-44). It reads outside repo via homedir() or env (11-46) without hardcoded absolute paths; no other existing test reads arbitrary external path without fixture/env guard visible. scripts/sidecar-deps-bridge.mjs:74-91 guards missing/broken primary node_modules.

## Findings
- **F1 Hook in npm test chain** — Claim / Source (package.json:11) / Confidence / Why it matters: npm test already calls 
ode scripts/run-user-scope-tests.mjs between repo tests and skills tests, so a conformance suite can plug into user-scope scan.
- **F2 Reuse resolver logic** — Claim / Source (scripts/run-user-scope-tests.mjs:29-46) / Confidence / Why it matters: resolveScanDir/env keys provide safe external path resolution without tilde literals; conformance can reuse or extend these env keys.
- **F3 Expect .test.mjs recursion** — Claim / Source (scripts/run-user-scope-tests.mjs:48-65, run-user-scope-tests.test.mjs:21-29) / Confidence / Why it matters: recursive walk skipping node_modules/.git means conformance suite must be discoverable as **/*.test.mjs.
- **F4 Guard absent install** — Claim / Source (scripts/run-user-scope-tests.mjs:70-73, run-user-scope-tests.test.mjs:31-44) / Confidence / Why it matters: runner fails fast if no tests found and forbids repo fallback; conformance must handle missing user-scope install explicitly.
- **F5 Mirror/bridge patterns** — Claim / Source (scripts/skills-mirror.test.mjs:6-53, scripts/sidecar-deps-bridge.mjs:69-91) / Confidence / Why it matters: tests assert external/cross-tree state with strict asserts and fail-fast validation, reusable patterns for conformance checks.
- **F6 Skill trees wired separately** — Claim / Source (package.json:8,12) / Confidence / Why it matters: check:skills/test:skills cover .claude/.commandcode; user-scope (.commandcode/scripts or ~/.commandcode/scripts) is separate channel needing its own conformance hooks.
