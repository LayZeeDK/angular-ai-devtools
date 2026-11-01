---
id: T001
title: Extend the user-scope conformance suite with the four helper-regression pins
wave: 1
deps: []
status: done
agent: build_T001
base: c7d82a4f4e74e571222a54bdaee950885a85a6a0
worktree: null
task_branch: null
files:
  - scripts/user-scope-autonomy.mjs
  - scripts/user-scope-autonomy.test.mjs
---

# T001 — Extend the user-scope conformance suite with the four helper-regression pins

## Context

M016 shipped `scripts/user-scope-autonomy.mjs` and its test as the repository's conformance suite for
the installed user-scope rules, and its own run then hit four installed-helper defects that nothing
in the checkout notices: `brief-check` never applies the paid effort ladder, `plan-lint` rejects a
legal `::` Held-out test form, `check_handoffs` cannot read an Intent-coverage row, and a serial
retry leaves a rejected attempt unparkable. Each defect cost an operator a hand workaround, and each
one is invisible to the suite today, so a re-run of the installer can revert the fix with nothing
going red. This task adds the four pins that close that hole, inside the timing budget the suite
already spends: the installed helper suite is 273 tests at roughly 53 s per spawn and is already
spawned twice by this file. The synthesis settles the shape — one new pin table plus one
`checkHelpers()` entry point, every pin probing a helper directly, never through `runGsdTests()`.

## Approach

- Read `scripts/user-scope-autonomy.mjs` first. It holds `RULES`, `resolveRulesRoot()` (which derives
  the rules root from `resolveScanDir()` exported by scripts/run-user-scope-tests.mjs), `check()`,
  `runGsdHelp()`, `runGsdTests()` and `HELPER_TOKENS`. Add a `HELPER_PINS` table of the same shape and
  a `checkHelpers(input)` entry point that `check()` calls after its RULES loop, and add both to the
  default export. Keep every existing case in `scripts/user-scope-autonomy.test.mjs` untouched.
- Fixture feasibility comes first, before any pin is authored (the synthesis names it a wave-1
  blocker). Build a synthetic `.project` tree under `os.tmpdir()` — `STATE.md` at `plan/active`, a
  one-criterion `INTENT.md`, one wave in `PLAN.md`, one task file — and show that the public
  subcommands answer over it in seconds: the installed helper's `plan-lint --repo <fixture> --json`,
  and `check_handoffs.py plan --repo <fixture>` run through `python -B` with the script resolved
  under the rules root of the user-scope tree. Record the measured wall time in the Log. If the
  coverage fixture proves to need more of the plan contract than the regression needs, drop that
  half to a module-level `_coverage_rows` call over the two fixture strings: same assertions, same
  failure condition, and the shortfall recorded.
- The serial-retry seam is the second blocker: read the installed sources at this head and write
  down the exact file and line range for the serial branch of `isolate_live` (the `mode == "serial"`
  and `task_branch == "null"` guards that keep a blocked serial attempt reportable) and for the
  metadata-clearing reset that returns a rejected attempt to `pending` without retaining `agent`,
  `base`, `worktree` or `task_branch`. Record that pair in the Log before authoring the pin. If no
  static token pair is nameable, degrade the pin to the `build_state.py ready` contract probe and
  record the shortfall — never invent a token, and never claim a behavioural proof the pin does not
  make.
- `brief-check` pin: static paid route tokens inside the installed effort-ladder alternation, plus
  one behavioural run of the helper's brief-check subcommand with a task-file and a brief fixture,
  asserted on the parsed `warnings` array in both directions — a brief carrying a paid route yields
  no missing-effort-ladder warning, and a brief carrying no route token yields it. Do not assert
  `status`: a warning never blocks, and the exit code is the wrong oracle.
- `plan-lint` pin: behavioural, over a fixture whose Held-out checks table gives the Test cell as a
  `::` node id and whose task file declares the test path and runs it in `## Verify`. Assert the run
  reports ok and no held-out-test or held-out-verify finding, and anchor the static half on the `::`
  split that precedes the files comparison so a failure names the file.
- `check_handoffs` pin: two runs of the public subcommand. The readable fixture exits 0 and lists
  the criteria it owns; the three-cell row fixture exits non-zero and prints `Intent coverage row is
  unreadable`. Assert the exit code and that substring only, never the surrounding sentence.
- E1 (two-mutation, one case): copy the installed file into a temp directory, remove every
  occurrence of the named token, assert the pin fails naming the absolute file and the rule id, then
  reword around the token with the token kept and assert it passes. Every pin asserts a token, an
  exit code or a parsed field — a pin on a sentence's wording fails this mutation and is a defect.
- E2 and N1: when the user-scope install, its `gsd` directory or the resolved helper script is
  absent, the check fails naming the resolved absolute path it looked for and never exits zero. Reuse
  the absent-install fixture the suite already has; do not replace it. Must not pass vacuously when
  the install or the helper suite is missing: the reviewer reads a run's output, every check prints
  the resolved path it read and the exit status it propagated, and a green run that names no path is
  a defect.
- E3: the new pins write only under `os.tmpdir()`; two consecutive runs give the same verdict and
  `git status --porcelain` is unchanged.
- Timing: add no `runGsdTests()` call. The suite already spawns the installed 273-test suite twice
  (the health case and the copied-suite case) and must keep doing exactly that; the four new pins
  spawn at most three helpers, one to two seconds each.
- N3: must not weaken, skip or delete an existing check, test or assertion to reach green. The
  reviewer reads the diff for a removed assertion, a skipped test or a loosened matcher; this task
  adds cases and changes no existing one.
- N5: must not edit installed user-scope tooling from this task, or commit an installed-tooling
  change into this checkout. The user-scope fix is made outside the milestone and is proven only by
  the pin that fails without it; the landing diff may only add or change the two declared repository
  files, and a wrong user-scope fix reads like a bad test, so run the pin against the unfixed copy
  first and record which side was wrong in the Log.
- `npm run check` type-checks three files, two of them outside the checkout; it is not a type gate
  for the new `.mjs` file. Do not add it to `tsconfig.json`. Hold the work with `node --test` alone.
- Child node processes inherit `NODE_TEST_CONTEXT` and `NODE_TEST_WORKER_ID`, which makes a spawned
  `node --test` exit 0 without running anything; reuse the module's existing `childEnv()` for every
  spawn.
- Write nothing outside the two declared files. No scratch file in the repository root, no write
  into the user-scope tree.

## Interface contract

- An issue is `{ rule: string, file: string, reason: string }` with `file` the resolved absolute
  path and `reason` beginning with the rule id; `checkHelpers(input?)` returns that array and
  `check(input?)` returns its RULES issues followed by its `checkHelpers` issues.
- A pin row is `{ id: string, name: string, file: string[], tokens: string[], probe: { tool: 'gsd' | 'python', script: string[], args: string[] } }`, where `file` is the path split into segments under the resolved rules root and `probe.script` is relative to the resolved helper directory or the skill scripts directory.
- A pin's citable identity is the repository path of the test file, then `::`, then the exact node:test case title, and the same identity is what the autonomy-gaps analysis document cites in its `Pin:` field.

## Intent coverage

- SC1

## Acceptance criteria

1. `scripts/user-scope-autonomy.mjs` exports a `HELPER_PINS` table and a `checkHelpers()` entry point that `check()` runs after its RULES loop, and every issue it returns names the resolved absolute helper file and its pin rule id.
2. The brief-check pin asserts both paid route tokens inside the installed effort-ladder alternation and, behaviourally, one brief-check run over a temp fixture in both directions: a brief carrying a paid route yields no missing-effort-ladder warning and a brief carrying no route token yields that warning.
3. The plan-lint pin runs the helper's plan-lint subcommand over a temp fixture tree whose Held-out Test cell is a `::` node id and asserts no held-out-test or held-out-verify finding, with the fixture feasibility measurement recorded in the Log.
4. The check_handoffs pin runs `check_handoffs.py plan` twice over temp fixtures: the readable fixture exits 0 and lists the owned criteria, and the three-cell row fixture exits non-zero printing `Intent coverage row is unreadable`.
5. The serial-retry pin records the installed static token pair it asserts, with file and line range in the Log, and proves the ready-contract over a temp git repository: a parked serial task is ready and a pending task that retains dispatch metadata exits non-zero naming the retained field.
6. The suite adds no `runGsdTests()` call — the installed helper suite is spawned the same two times it is today, the new pins spawn at most three helpers, and `node --test scripts/user-scope-autonomy.test.mjs` is green with its wall time recorded in the Log.
7. E1: removing the named token from an installed copy makes the pin fail naming the absolute file and the rule id, and rewording the surrounding sentence with the token kept still passes; this is one two-mutation case titled `E1 helper pin: a removed token fails naming the absolute file and the rule id, and a reworded copy passes`.
8. E2 and E3: the absent-install path fails naming the resolved absolute path it looked for and never exits zero (case titled `E2 helper pin: an absent install or helper dir fails naming the resolved absolute path`), and two consecutive runs agree with `git status --porcelain` unchanged and nothing written outside `os.tmpdir()` (case titled `E3 helper pin: two runs agree and write nothing into the checkout`).

## Verify

```bash
node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- build_T001: added a `HELPER_PINS` table (P1 brief-check paid effort ladder, P2 plan-lint `path::test_name` Held-out cell, P3 check_handoffs Intent-coverage row, P4 serial-retry parkable) plus `checkHelpers()`, `resolvePinPaths()` and `runPinProbe()` to `scripts/user-scope-autonomy.mjs`, called `checkHelpers()` after `check()`'s RULES loop and exported all of them, and added seven cases to `scripts/user-scope-autonomy.test.mjs` (one per pin plus the E1/E2/E3 hardening cases). Measured before authoring: the shared temp `.project` fixture (STATE at plan/active, one-criterion INTENT, one wave, one task) answers `gsd plan-lint --repo <fixture> --json` in 319 ms with `ok: true` and 0 blockers/0 warns/1 info, and `python -B check_handoffs.py plan --repo <fixture>` exits 0 in 295 ms once the fixture carries the full plan contract — the successive demands that proved it were STATE `integration_default` and `integration` appearing together, `pipeline: gsd-path/v2`, a slug `milestone`, a `branch` matching `gsd-path/M<NNN>`, `## Wave N — <title>` with `Goal:` and `Review depth:`, explicit `agent/base/worktree/task_branch: null` on the task, and INTENT `Surfaces:` plus a PLAN `Project verify:` line — so the Approach's module-level `_coverage_rows` fallback was not needed and AC4's two public-subcommand runs stand as written. The serial-retry static token pair is `skills/gsd-path/scripts/dispatch_driver.py` lines 1042-1058 (`def isolate_live`), serial branch at 1052-1058: `state.get("mode") == "serial"` at 1053, `fields.get("status") == "blocked"` at 1054, `fields.get("task_branch") == "null"` at 1057; the metadata-clearing side is `build_state.py` `_validate_ready_metadata` lines 433-445 (a `pending` task retaining any of `agent`/`base`/`worktree`/`task_branch` is `invalid-task-state`) with `isolation.py` `_activated_task_text` lines 2039-2046 requiring exactly those four cleared before activation. Behaviour at this head: P1 two brief-check runs (paid route yields no `missing effort ladder mention`, no route token yields it), P2 one plan-lint run reporting `ok: true` and no `held-out-test`/`held-out-verify` finding over the `::` cell, P3 check_handoffs exit 0 listing SC1 then exit 1 printing `Intent coverage row is unreadable`, P4 `build_state.py ready` exit 0 listing the parked serial task then exit 1 with `invalid-task-state` for the same task retaining dispatch metadata. Shortfalls recorded rather than papered over: (a) the installed refusal reads `T001: pending task retains dispatch metadata` and names no individual retained field, so AC5's "naming the retained field" is only partly provable — the pin asserts the exit code, the error code, the task id and that clause, and claims nothing more; (b) `makeFixtureInstall()` now also copies `skills/gsd-path/scripts`, because `check()` runs `checkHelpers()` and the existing E4 pristine-fixture assertion `deepEqual(check(installRoot), [])` needs those pin files present — no existing case, assertion or matcher was changed; (c) all four installed helpers already carry the fix at this head, so the red side was proven by mutation instead — the new E1 case removes each pin's token from a copied install, gets a failure naming the absolute file and the pin id, then rewords around the kept token and goes green — and no user-scope edit was made or claimed (nothing under `~/.commandcode` was written: the newest file mtime there is 14:56, before this session's runs). Timing: no `runGsdTests()` call was added (still exactly the two at lines 120 and 149), the pins spawn three helper programs (gsd.ts for P1/P2, check_handoffs.py, build_state.py) in nine child processes costing about 7.3 s, and the seven new cases alone ran in 7323 ms. Verify `node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exits 0 with tests 14, pass 14, fail 0, duration_ms 79605.95 (79.6 s wall) — ready
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0; output tail:
  ```
  ✔ health: the real installed helper suite exits 0 (28858.5165ms)
  ✔ E2: a copied suite with one injected failing test exits non-zero naming that test (29342.9917ms)
  ✔ E4: removing a rule token fails naming that file; rewording with the token kept passes (5600.936ms)
  ✔ E5: a rules file holding none of the five rules is reported per file and rule (234.7257ms)
  ✔ E3: repeated runs give the same verdict and write nothing into the checkout (495.4617ms)
  ✔ P1 brief-check pin: a paid route yields no missing-effort warning and a bare brief yields it (601.0861ms)
  ✔ P2 plan-lint pin: a :: held-out Test cell yields ok and no held-out finding (288.8009ms)
  ✔ P3 check_handoffs pin: a readable coverage row exits 0 and a three-cell row is unreadable (558.3634ms)
  ✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails (3281.926ms)
  ✔ E1 helper pin: a removed token fails naming the absolute file and the rule id, and a reworded copy passes (498.6561ms)
  ✔ E2 helper pin: an absent install or helper dir fails naming the resolved absolute path (123.9181ms)
  ✔ E3 helper pin: two runs agree and write nothing into the checkout (1045.309ms)
  ℹ tests 14
  ℹ suites 0
  ℹ pass 14
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 71274.9621
  ```
