---
id: T002
title: Add repo-resident user-scope test runner and update package test glob
wave: 1
deps: [T003]
status: done
agent: build_T002
base: ddb710abcffda06176201397a3c230b42d370350
worktree: null
task_branch: null
files:
  - package.json
  - scripts/run-user-scope-tests.mjs
  - scripts/run-user-scope-tests.test.mjs
---

# T002 — Add repo-resident user-scope test runner and update package test glob

## Context

After the move, the relocated tests live under the user-scope scripts directory (`<home>/.commandcode/scripts/`), outside the repository, so the npm `--test` glob cannot reach them by a literal `scripts/**/*.test.mjs`. Neither the npm glob nor `tsconfig.json` expands `~`. The dedicated test glob must not fall back to the repository `scripts/**/*.test.mjs`, and the command must exit non-zero when no user-scope tests exist (edges E4, E5). `package.json` is not a test, so this needs a real, failing-when-skipped test.

## Approach

- Add a small repo-resident runner `scripts/run-user-scope-tests.mjs` that resolves the home directory at runtime via `os.homedir()` (never a literal `~`), globs `<home>/.commandcode/scripts/**/*.test.mjs`, and exits non-zero with a clear message when the match is empty. When matches exist, it invokes the Node test runner on them and propagates the exit code.
- Update `package.json` `"test"` to keep the repository `scripts/**/*.test.mjs` and `extension/**/*.test.mjs` globs unchanged, and add the user-scope runner for the relocated tests, keeping `npm run test:skills`. No literal `~` may appear in `package.json`.
- Add `scripts/run-user-scope-tests.test.mjs` asserting: the runner resolves the home directory (not `~`), returns/fails on an empty match, and does not fall back to repository `scripts/**/*.test.mjs`. This test is the held-out E5 proof.
- Preserve E2: a test run leaves no generated files.

## Interface contract

User-scope directory produced by T003 and consumed by T002:
- Path: `<home>/.commandcode/scripts/` (resolved at runtime via `os.homedir()`; never a literal `~`).
- Contents: the nine relocated install scripts and their tests, including `install-gsd-path-command-code.test.mjs` and `install-pstack-opencode.test.mjs`.
- Test discovery pattern: `**/*.test.mjs` applied under `<home>/.commandcode/scripts/`.

## Intent coverage

- SC2
- SC4

## Acceptance criteria

1. `npm test` runs the remaining repository `scripts/` tests (including `skills-mirror.test.mjs`, `sidecar-deps-bridge.test.mjs`, and the `di-*.test.mjs` files) as well as the relocated user-scope tests; dropping either set is a failure.
2. The dedicated user-scope glob does not fall back to repository `scripts/**/*.test.mjs`; with no user-scope tests present the command exits non-zero (edges E4, E5).
3. No generated files are left behind by a test run.

## Verify

```bash
node --experimental-strip-types --test scripts/run-user-scope-tests.test.mjs
```

Heavy: no

## Log

- created by planner
- build_T002: added scripts/run-user-scope-tests.mjs (os.homedir() resolution, recursive *.test.mjs discovery, non-zero on empty, no fallback, child exit propagation, injectable root via arg/env) and scripts/run-user-scope-tests.test.mjs (6 tests); updated package.json test script to invoke runner between repo glob and test:skills. Verify `node --experimental-strip-types --test scripts/run-user-scope-tests.test.mjs` passed (6/6). npm test run1 pass 522, run2 pass 522, no new untracked files. E5: dedicated glob exits non-zero when no user-scope tests exist (no fallback to repository scripts/**/*.test.mjs).
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  ✔ resolves home directory without tilde (1.1938ms)
  ✔ recurses over a fixture tree (326.6778ms)
  ✔ returns non-zero on empty match (94.0631ms)
  ✔ does not fall back to repository glob (96.9698ms)
  ✔ propagates child failure (317.7434ms)
  ✔ injectable root via environment variable (337.8003ms)
  ℹ tests 6
  ℹ suites 0
  ℹ pass 6
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 1300.8015
  ```
