---
id: T006
title: Fail the development-build proof when the fixture install is absent, instead of skipping it
wave: 1
deps: [T002]
status: done
agent: build_T006b
base: 00aac43187669f0defb7dfa74f8408afb5ccfd83
worktree: null
task_branch: null
files:
  - scripts/facade-dev-build.test.mjs
---

# T006 — Fail the development-build proof when the fixture install is absent, instead of skipping it

## Context

The wave-1 canonical review blocked T002 on a vacuous pass: its landing Verify exited 0 while the four
tests carrying SC4 (AC5, AC6, AC7) reported `skipped` with "the fixture install is absent
(spikes/ng222-app/node_modules)". The cause is structural: this host exports `NODE_ENV=production`, so an
`npm ci` without `--include=dev` drops the fixture's devDependencies, and the test file turns that missing
install into a green skip instead of a failure. A test that carries an acceptance criterion must not be
able to pass by not running.

## Approach

Replace every skip option in `scripts/facade-dev-build.test.mjs` with a precondition that fails and names
the command that provisions it: `npm --prefix spikes/ng222-app ci --include=dev`. Keep every assertion
exactly as it is: the same seven tests, the same evidence, and no production-build shortcut. Where a skip
currently guards several cases, hoist the precondition so the failure names the missing install once
instead of repeating per case.

## Acceptance criteria

1. `scripts/facade-dev-build.test.mjs` carries no skip option on a test that carries AC5, AC6 or AC7.
2. With the fixture install present, the suite reports 7 tests, 7 pass, 0 skipped.
3. With the fixture install absent, the suite fails, and the failure message names
`npm --prefix spikes/ng222-app ci --include=dev`.
4. No assertion is weakened: the entry-name check, the single-Angular-copy check and the two-copy negative
control with `preserveSymlinks` off assert what they asserted before.

## Intent coverage

- SC4 — AC2 and AC3 keep the development-build proof executable and make a missing prerequisite visible.

## Interface contract

None

## Verify

```powershell
npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && node --test scripts/facade-dev-build.test.mjs
```

## Log

- 2026-11-02 — created from the wave-1 review finding (T002 vacuous pass)
- build_T006: replaced every skip option in scripts/facade-dev-build.test.mjs with a failing precondition (requirePrerequisite); the four AC5/AC6/AC7 tests and AC1 now fail and name the provisioning command instead of passing by not running. AC3 proof, with spikes/ng222-app/node_modules moved aside and restored in finally: exit 1, tests 7 / pass 3 / fail 4 / skipped 0, failure line: AssertionError [ERR_ASSERTION]: the development-build proof cannot run: the fixture install is absent (spikes/ng222-app/node_modules); run npm --prefix spikes/ng222-app ci --include=dev. Restored Verify npm ci --include=dev && npm --prefix spikes/ng222-app ci --include=dev && node --test scripts/facade-dev-build.test.mjs: exit 0, tests 7 / pass 7 / fail 0 / skipped 0.
- build_T006: ready
