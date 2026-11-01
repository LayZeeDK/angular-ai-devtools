---
id: T008
title: Re-pin the prompt-side paid route token to the route slug
wave: 2
deps:
  - T002
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/user-scope-autonomy.mjs
  - scripts/user-scope-autonomy.test.mjs
---

# T008 — Re-pin the prompt-side paid route token to the route slug

## Context

Wave 2's canonical review blocked on two locators that name the same defect. The `DISPATCH_PINS` D1
row asserts `paid-deepseek-v4-1-flash-*` and the display marker `GLM-5.3 Flash` in the installed
orchestrator prompt, so it never asserts the paid GLM *route* token there — the route token is pinned
only in D2 against the paid model plan. The task Log's recorded shortfall ("the prompt carries no
`paid-glm-5-3-flash` route token at this head") was contradicted by the installed file when the review
ran, because the prompt was edited outside the checkout after the landing commit: at 17:52:49, forty
seconds after `4e4c8df`, the display marker was replaced by the route slug. That edit made D1 red at
the reviewed head, which INTENT.md `## Risks` requires to be recorded rather than discovered. The
prompt now carries BOTH the display marker and the route slug, so D1 can assert the route slug as the
review's fix direction asks and the AC2 sentence becomes literally true.

Evidence: `.project/review/wave-2.cycle1.md`, locators `sc1` and `t002_ac2`; `scripts/user-scope-autonomy.mjs:109-123`.

## Approach

- Change D1's second token from `GLM-5.3 Flash` to `paid-glm-5-3-flash-*` in the `DISPATCH_PINS`
  prompt row, so the prompt-side pin asserts both paid route families by slug, which is what T002
  AC2's criterion sentence says.
- Keep the display marker out of the pin: a marker is prose, a route slug is an identifier, and the
  pin must survive rewording of the surrounding sentence (INTENT.md edge E1).
- Correct the module comment at `scripts/user-scope-autonomy.mjs:109-115` so it no longer claims the
  prompt carries no route token; state that the prompt is edited outside the checkout and that a
  post-landing edit is what the pin exists to catch.
- No new case: D1's two-mutation loop iterates every token of every row, so the changed token
  inherits the remove-every-occurrence and reword-keep-token halves unchanged.
- N1: keep printing the resolved absolute path for every pinned document on a green run.
- N3: do not weaken, skip or delete an existing case, assertion or matcher; this task changes one
  string in a table and one comment.
- N5: do not edit anything under `~/.commandcode`; the prompt change is already made outside this
  checkout and this task only makes the pin assert it.
- Timing: add no `runGsdTests()` call; the installed suite still spawns exactly twice.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. D1's token list contains `paid-deepseek-v4-1-flash-*` and `paid-glm-5-3-flash-*` and no longer contains `GLM-5.3 Flash`.
2. D1's two-mutation case removes every occurrence of each of those tokens from a copied prompt and the pin fails naming the absolute file and `D1`; rewording around the token with it kept still passes.
3. The module comment no longer asserts that the prompt lacks a route token, and it records that the installed documents are edited outside the checkout.
4. `node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs` exits 0 with every case passing, and the Log records the wall time and the summary counts.

## Verify

```bash
node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs
```

Heavy: no

## Review findings

### sc1

Criterion: `npm test` runs a check that fails when the installed `gsd` helper regresses on paid-type brief effort, the `path::test_name` Held-out form, an unreadable Intent-coverage row, or the serial retry path, and it passes at the shipped head.

- the check does not pass at the head this review covers: the landed dispatch-pin table's D1 row pins `GLM-5.3 Flash` in `~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`, a token the installed file no longer carries (zero occurrences; it carries the route slug `paid-glm-5-3-flash-high` at lines 50 and 52 instead), so `checkHelpers()` over the real install returns exactly one D1 issue naming that absolute file — a red `npm test` leg at the current head. found: the four wave-1 regressions (paid-type brief effort, the `path::test_name` Held-out form, an unreadable Intent-coverage row, the serial retry path) remain pinned and green per T001's recorded Verify, and wave 2's two-mutation machinery is sound, but the shipped-head clause fails on the D1 token choice (`scripts/user-scope-autonomy.mjs:122`). fix: as the T002 AC2 finding above — re-pin D1's second token to `paid-glm-5-3-flash-*` (present in the prompt today), correct the Log, re-run the Verify; wave 1's criteria are not re-judged here.

### t002_ac2

Criterion: The paid-route pin asserts both paid route tokens in the orchestrator prompt and in the paid model plan, and a copy with either token removed fails naming the absolute file and the rule id while a reworded copy passes.

- The paid-route pin asserts both paid route tokens in the orchestrator prompt and in the paid model plan, and a copy with either token removed fails naming the absolute file and the rule id while a reworded copy passes. — found: the prompt-side row D1 (`scripts/user-scope-autonomy.mjs:119-123`) asserts `paid-deepseek-v4-1-flash-*` and the display marker `GLM-5.3 Flash`; it does not assert the paid GLM route token in the orchestrator prompt (the route token is pinned only in D2, `user-scope-autonomy.mjs:126-137`). The recorded shortfall behind that choice — "the prompt carries no `paid-glm-5-3-flash` route token at this head" (task Log, build_T002 entry; module comment `user-scope-autonomy.mjs:109-115`) — is contradicted by the installed file as it stands: `~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` carries the GLM paid route slug `paid-glm-5-3-flash-high` at lines 50 and 52 and the DeepSeek family token at line 188, and carries zero occurrences of `GLM-5.3 Flash`. The prompt's LastWriteTime is 2026-11-01 17:52:49, forty seconds after the landing commit (17:52:09), and the recorded Verify's green D0 run proves the pinned marker was present at verify time, so the installed document changed after landing without a Log entry recording which side was wrong (INTENT.md Risks requires exactly that). I probed the landed module read-only (`checkHelpers()` over the real install, not the task Verify): it returns exactly one issue — `D1 | ...orchestrator.prompt.md | does not contain "GLM-5.3 Flash"` — so the landed check is red against the tree it pins at this review's head, and neither the positive half nor the two-mutation half of this AC can hold over the real document. The mutation machinery itself is sound (see AC7 below); the defect is the chosen token, not the test. fix: change D1's second token in `scripts/user-scope-autonomy.mjs:122` to the route slug the prompt actually carries — `paid-glm-5-3-flash-*` (or the concrete `paid-glm-5-3-flash-high`), which makes this AC's "both paid route tokens in the orchestrator prompt" literally true and dissolves the recorded shortfall; correct the module comment at `user-scope-autonomy.mjs:109-115` and append a Log entry recording the corrected reading and the 17:52:49 prompt edit, then re-run the task Verify.

## Log

- 2026-11-01 — created by the build orchestrator from `review_findings.py collect --wave 2 --cycle 1`
