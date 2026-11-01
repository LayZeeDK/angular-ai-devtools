---
id: T002
title: Pin the dispatch documents the owner named against the same conformance suite
wave: 2
deps: [T001]
status: pending
agent: null
base: null
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
