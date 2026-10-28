---
id: T002
title: Add repo-resident user-scope test runner and update package test glob
wave: 1
deps: [T003]
status: pending
agent: null
base: null
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