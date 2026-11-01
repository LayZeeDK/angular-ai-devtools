---
id: T001
title: Add user-scope autonomy conformance suite
wave: 1
deps: []
status: in-progress
agent: build_T001
base: 6525e3b35bc364812191426519abe057382d561f
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - scripts/user-scope-autonomy.mjs
  - scripts/user-scope-autonomy.test.mjs
---
# T001 — Add user-scope autonomy conformance suite

## Context

M016 makes five autonomy rules regress-proof inside this repository: milestone-scoped pre-approval, handoff branch creation at the remote default, the free-route zero-token quota signature, incremental-write and byte-length-proof rules, and the fragment repair command. These live in the installed user-scope bundle (~/.commandcode) where an installer re-run can revert them; nothing currently notices. The repo already runs a user-scope leg via `scripts/run-user-scope-tests.mjs` (exports `resolveScanDir`) and `npm test` picks up `scripts/**/*.test.mjs`. The installed gsd helper suite is `~/.commandcode/scripts/gsd` with `npm test` = `node --test "test/**/*.test.ts"` (273 tests at this head). This task adds one conformance suite under scripts/ (module + tests) that reads the installed tooling and fails when rules regress.

## Approach

- Create `scripts/user-scope-autonomy.mjs` (implementation/helpers) and `scripts/user-scope-autonomy.test.mjs` (tests). Both files are declared in `files` and exhaustive.
- (a) Resolve user-scope install via `scripts/run-user-scope-tests.mjs`'s exported `resolveScanDir` (do not reimplement resolution). If resolved path or `gsd/` is absent, fail naming the resolved absolute path (never pass vacuously). Satisfy E1.
- (b) Run installed helper suite as child process: `node --test "test/**/*.test.ts"` from `<user-scope>/gsd` (or equivalent). On non-zero exit, fail with the exit status and the failing test name. Satisfy E2.
- (c) Assert each of FIVE rules by a named token in its installed rules file plus the helper command that implements it:
  1. milestone-scoped pre-approval — AGENTS.md + `gsd preapprove`
  2. handoff bases the next branch at the remote default — AGENTS.md + `gsd handoff`
  3. free-route zero-token quota signature — AGENTS.md + the DeepSeek orchestrator prompt
  4. incremental-write and byte-length proof — gsd-path-skill-roster.md / prompting-glyph-cluster.md
  5. fragment repair command — gsd-path-orchestrator.md + `gsd fragment-fix`
  Every failure message names the absolute file and the rule id.
- (d) Write nothing into the user-scope tree or the checkout. Satisfy E3 (idempotent; `git status --porcelain` unchanged after runs).
- Token-vs-wording: match named tokens and helper behavior, not paragraph wording (satisfy E4; rewording with token kept must pass, removing token must fail naming that file).
- Do not edit `scripts/run-user-scope-tests.mjs`. Do not touch `.project/archive/**`. Do not weaken existing tests. The new test must be runnable as `node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` (declared Verify). All five rules must be asserted; missing rules reported as that file with the missing rule named (E5 style).
- Prohibitions (judgment): N1 - never pass vacuously when install/helper suite missing (print resolved path and exit status). N2 - assertions use named tokens or helper behavior, never literal multi-sentence quotes. N3 - no weakening/skipping/deleting existing checks/tests outside this task's files. N4 - project Verify must remain green at ship (task does not change project Verify command).

## Interface contract

None

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. AC1 (SC1): `scripts/user-scope-autonomy.test.mjs` exists and is discovered by `npm test`'s first leg (`scripts/**/*.test.mjs`); the suite resolves via `resolveScanDir` from `scripts/run-user-scope-tests.mjs`, fails naming the resolved absolute path if user-scope install or `gsd/` is absent (E1). 
2. AC2 (SC1): Suite runs `node --test "test/**/*.test.ts"` in `<user-scope>/gsd` as child process and fails with exit status and failing test name if helper suite fails (E2). 
3. AC3 (SC1): Suite asserts all five rules by named token in installed rules file plus helper command implementing it: (1) milestone-scoped pre-approval — AGENTS.md + `gsd preapprove`, (2) handoff at remote default — AGENTS.md + `gsd handoff`, (3) free-route zero-token quota signature — AGENTS.md + DeepSeek orchestrator prompt, (4) incremental-write and byte-length proof — gsd-path-skill-roster.md / prompting-glyph-cluster.md, (5) fragment repair — gsd-path-orchestrator.md + `gsd fragment-fix`. Every failure names absolute file and rule id.
4. AC4 (SC2): Token-vs-wording enforced (E4); removing a rule's token from a copy fails naming that file, rewording around token kept still passes. Suite writes nothing to user-scope tree or checkout; idempotent with unchanged `git status --porcelain` (E3).
5. AC5 (SC3): Project Verify command unchanged and must pass at ship: `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` all green.

## Verify

```bash
node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — build_T001 rejected (attempt 1): the child errored with no `RESULT:` after 148 turns and 6 685 224 tokens. Rejected path set: `scripts/user-scope-autonomy.mjs`, `scripts/user-scope-autonomy.test.mjs`, plus undeclared `check-now.mjs`, `quick.mjs`, `run.ps1`, `scripts/test-gsd.mjs` (removed before the retry). Verify at that state: 5 tests, 3 pass, 2 fail, exit 1. Exact problem lines:
  - `AssertionError [ERR_ASSERTION]: Expected "actual" to be strictly unequal to: 0` at `scripts/user-scope-autonomy.test.mjs:34:10`
  - `Error: ENOENT: no such file or directory, lstat 'C:\Users\LarsGyrupBrinkNielse\.commandcode\scripts\AGENTS.md'` at `cpSync (file:///D:/projects/sandbox/angular-ai-devtools/scripts/user-scope-autonomy.test.mjs:57:3)`
- 2026-11-01 — orchestrator fix brief for attempt 2: (a) `resolveScanDir()` returns `<home>/.commandcode/scripts`; the rules files live one level up at `<home>/.commandcode`, so the library must derive the rules root from the scripts directory instead of joining `AGENTS.md` onto it; (b) the suite must assert `check()` on the real install returns zero issues and `runGsdTests()` on the real install exits 0, so a green suite cannot mean "all five rules missing"; (c) `runGsdTests` returned exit 0 for a copied suite with an injected failing test in 241 ms, so the relative `test/**/*.test.ts` pattern matched nothing — resolve the test files explicitly; (d) E4 must remove every occurrence of the token, not the first.
