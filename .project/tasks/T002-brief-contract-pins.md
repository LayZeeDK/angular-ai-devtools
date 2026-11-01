---
id: T002
title: Pin the dispatch documents the owner named against the same conformance suite
wave: 2
deps: [T001]
status: done
agent: build_T002
base: 7a996f8b71615cd031c04261fef9d6dfdc8628cf
worktree: null
task_branch: null
files:
  - scripts/user-scope-autonomy.mjs
  - scripts/user-scope-autonomy.test.mjs
---

# T002 — Pin the dispatch documents the owner named against the same conformance suite

## Context

The owner put a second deliverable on this milestone: "User-scope prompts, briefs, templates, and
few shot examples for GSD Path subagents." The dispatch documents that decide whether a brief is
usable are all outside the checkout and all revertible by an installer re-run — the orchestrator
prompt's route ladder, the paid model plan's per-role table, the subagent brief contract, the task
and reviewer templates, and the worked example a coder brief is modelled on. Wave 1 proved the
shape: a pin table plus a `checkHelpers()` entry point that names the absolute file and the rule id.
This task extends that table to the dispatch documents rather than adding a second suite, which the
synthesis settles and which keeps `npm test` inside its timing budget.

## Approach

- Extend the `HELPER_PINS` table and the exported entry point T001 landed — same row shape, same
  absolute-path and rule-id failure text, same fixture and cleanup discipline. A second module or a
  second suite is ruled out: one suite, one entry point, one `npm test` leg.
- Pin these document families, resolving each under the rules root that `resolveRulesRoot()` already
  returns, and name each pin's rule id so a failure reads as a rule, not a file:
  - the orchestrator prompt's paid-route ladder: both paid route tokens the dispatch policy names,
    asserted in the prompt file the repository's `AGENTS.md` points a fresh session at;
  - the paid model plan's per-role table: the two paid route family tokens and the reviewer row;
  - the subagent brief contract reference: the field tokens a brief must carry, which the prompt's
    brief-check step enforces;
  - the task template and the wave-review and final-review templates: the required section headings
    and the verdict vocabulary, each matched by its literal token;
  - the coder-brief reference: the worked-example marker, so deleting the example from a copy fails
    the pin.
- Read the candidate files at this head before writing a token down. A token the file does not
  contain today is a defect in the pin, not in the file; record the token you actually asserted in
  the Log, one line per document, so a later reader can re-read the same line.
- Two-mutation every pin, exactly as wave 1's E1 case does: copy the document into a temp directory,
  remove every occurrence of the token, assert the pin fails naming the absolute file and the rule
  id, then reword around the token with the token kept and assert it passes. A pin that survives the
  rewording half is a change-detector and is a defect (INTENT.md `## Prohibitions` N2 explains why no
  second prohibition exists for this).
- Exactly one behavioural probe in this task, and it must not duplicate wave 1's: run the helper's
  brief-check subcommand over a temp fixture brief that omits one required contract field and assert
  the parsed warnings name that field, then add the field and assert the warning is gone. Assert the
  warning's field name and the exit code, never its sentence.
- N1: must not pass vacuously when the install or a pinned document is missing. Every pin prints the
  resolved absolute path it read, each failure names the rule id, and a green run that names no path
  is a defect.
- N3: must not weaken, skip or delete an existing check, test or assertion — including wave 1's four
  pins — to reach green. This task adds rows and cases and changes none of the existing ones.
- N5: must not edit any user-scope document from this task or commit a user-scope change into this
  checkout. The documents stay outside the milestone; the landing diff may only add or change the two
  declared repository files.
- Timing: add no `runGsdTests()` call and no full-suite spawn. Pins are file reads plus at most one
  short helper spawn for the behavioural probe.
- `npm run check` is not a type gate for the new `.mjs` code; hold the work with `node --test` alone
  and do not touch `tsconfig.json`.
- Write nothing outside the two declared files and nothing into the user-scope tree.

## Interface contract

- An issue is `{ rule: string, file: string, reason: string }` with `file` the resolved absolute
  path and `reason` beginning with the rule id; `checkHelpers(input?)` returns that array and
  `check(input?)` returns its RULES issues followed by its `checkHelpers` issues.
- A pin row is `{ id: string, name: string, file: string[], tokens: string[], probe: { tool: 'gsd' | 'python', script: string[], args: string[] } }`, where `file` is the path split into segments under the resolved rules root and `probe.script` is relative to the resolved helper directory or the skill scripts directory.
- A pin's citable identity is the repository path of the test file, then `::`, then the exact node:test case title, and the same identity is what the autonomy-gaps analysis document cites in its `Pin:` field.

## Intent coverage

- SC1

## Acceptance criteria

1. A second pin table (one row per document family) extends the module T001 landed, shares its row shape and its absolute-path plus rule-id failure text, and `check()` runs it in the same pass.
2. The paid-route pin asserts both paid route tokens in the orchestrator prompt and in the paid model plan, and a copy with either token removed fails naming the absolute file and the rule id while a reworded copy passes.
3. The brief-contract pin asserts the required-field tokens of the subagent brief reference, and a copy missing one required field fails naming that file and the rule id.
4. The template pins assert the required section headings of the task template and the verdict vocabulary of the wave-review and final-review templates by literal token, and fail naming the file when a heading is removed from a copy.
5. The worked-example pin asserts the marker the coder-brief reference carries, so a copy without the example fails naming that file and the rule id.
6. One behavioural probe through the helper's brief-check subcommand asserts the field name in the warnings for a fixture brief missing a required contract field and asserts the warning is gone once the field is present; it does not repeat wave 1's paid-effort-ladder pin.
7. The suite adds no `runGsdTests()` call, every new pin is token or parsed-field based and two-mutation tested, and `node --test scripts/user-scope-autonomy.test.mjs` is green with its wall time recorded in the Log.

## Verify

```bash
node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- build_T002: added a second pin table `DISPATCH_PINS` (exported with `ALL_PINS`) and ran `checkHelpers()` over both tables, seven rows, each two-mutation tested per token on a `makeFixtureInstall()` copy (that fixture now also copies the dispatch documents); tokens asserted per document — D1 `prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`: `paid-deepseek-v4-1-flash-*`, `GLM-5.3 Flash` (shortfall recorded: the prompt carries no `paid-glm-5-3-flash` route token at this head, so its dispatch-section paid-child marker is pinned instead and the GLM route token is pinned where it is authoritative, D2); D2 `references/paid-model-plan.md`: `paid-deepseek-v4-1-flash-*`, `paid-glm-5-3-flash-*`, `paid-deepseek-v4-1-flash-high`, `paid-glm-5-3-flash-high`, `` `reviewer`, `skeptic`, `review_panel` ``; D3 `references/gsd-path-subagent-briefs.md`: `ROLE:`, `REPO/WORKTREE:`, `DECLARED FILES`, `VERIFY (run it yourself and paste the exit code):`, `INPUTS:`, `<<<DOC`, `RULES:`, `RESULT: ready`, `RESULT: blocked`; D4 `skills/gsd-path/templates/task.md`: `## Context`, `## Approach`, `## Interface contract`, `## Intent coverage`, `## Acceptance criteria`, `## Verify`, `Heavy: no`, `## Log`; D5 `skills/gsd-path/templates/wave-review.md`: `Wave verdict:`, `<pass | blocked`, `<pass | fail>`, `Warnings (non-blocking):`, `Contract violations (blocking):`, `## Intent coverage`, `## Summary for orchestrator`; D6 `skills/gsd-path/templates/final-review.md`: `Overall verdict:`, `## Success criteria`, `- **Verdict**:`, `- **Reference**:`, `- **Fix direction**:`; D7 `references/gsd-path-coder-brief.md`: `## Worked example`, `Result: 22 turns`; one behavioural probe, not wave 1's, via `gsd brief-check --json --max-lines 5` on a temp fixture brief — the parsed warning names `<<<DOC` and the run exits 0, and no warning names it once the INPUTS marker is added, still exit 0; new cases D0 (paths named on green), D1 (two-mutation per token), D2 (absent install and absent document), D3 (the probe), with nothing existing removed or weakened except the fixture builder's file list, which grew; no `runGsdTests()` added, the installed 273-test suite still spawns exactly twice; Verify `node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exit 0 — tests 18, pass 18, fail 0, skipped 0, duration_ms 82723.3027, wall 82.8 s — ready
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t002-verify): pass, exit 0; output tail:
  ```
  ✔ E3: repeated runs give the same verdict and write nothing into the checkout (501.3302ms)
  ✔ P1 brief-check pin: a paid route yields no missing-effort warning and a bare brief yields it (419.7211ms)
  ✔ P2 plan-lint pin: a :: held-out Test cell yields ok and no held-out finding (292.8647ms)
  ✔ P3 check_handoffs pin: a readable coverage row exits 0 and a three-cell row is unreadable (552.5191ms)
  ✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails (3282.8025ms)
  ✔ E1 helper pin: a removed token fails naming the absolute file and the rule id, and a reworded copy passes (561.3616ms)
  ✔ E2 helper pin: an absent install or helper dir fails naming the resolved absolute path (118.2255ms)
  ✔ E3 helper pin: two runs agree and write nothing into the checkout (1043.6638ms)
  ✔ D0 dispatch pin: every dispatch document resolves under the rules root and carries its named tokens (1.9234ms)
  ✔ D1 dispatch pin: removing any named token fails naming the absolute file and the pin id, and a reworded copy passes (1293.7517ms)
  ✔ D2 dispatch pin: an absent install or a missing dispatch document fails naming the resolved absolute path (128.0541ms)
  ✔ D3 dispatch pin: brief-check names the missing brief-contract field and stops naming it once the field is present (406.8662ms)
  ℹ tests 18
  ℹ suites 0
  ℹ pass 18
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 71370.1095
  ```
