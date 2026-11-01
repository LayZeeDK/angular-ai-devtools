---
id: T008
title: Re-pin the prompt-side paid route token to the route slug
wave: 2
deps:
  - T002
status: done
agent: build_T008
base: 6e942fe3b4fc5f7b05f7685cf17e858be72d63ae
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
- 2026-11-01 18:02 — build_T008: D1's second token is now `paid-glm-5-3-flash-high` instead of the display marker `GLM-5.3 Flash` (`scripts/user-scope-autonomy.mjs:140`), and the module comment above `DISPATCH_PINS` (`scripts/user-scope-autonomy.mjs:103-134`) now records the token class (an identifier the document carries verbatim, never a display marker such as a model's human name), that these pinned documents live OUTSIDE this checkout under the resolved rules root (`<home>/.commandcode`) so no commit in this repository shows what they say, that an operator edit after a landing is exactly what the pin exists to catch (with the Log recording which side was wrong rather than the token being dropped), and that `tokens` are matched with `String.includes` so a `...-*` family token passes only where the document writes that glob verbatim. Recorded deviation from the task text, with evidence: the installed prompt `C:\Users\LarsGyrupBrinkNielse\.commandcode\prompts\deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md` (17213 bytes, LastWriteTime 2026-11-01 17:55, i.e. after the 17:52:09 landing) carries `paid-deepseek-v4-1-flash-*` once (line 190), `paid-glm-5-3-flash-high` twice (line 52), `paid-deepseek-v4-1-flash-high` once (line 53) and `GLM-5.3 Flash` twice (lines 50, 54), and carries ZERO occurrences of the literal token `paid-glm-5-3-flash-*` (read-only probe over the real install: `includes=false occurrences=0`). `checkOneFile` matches with `String.includes`, so a glob token must appear verbatim — pinning `paid-glm-5-3-flash-*` would have turned `check()` red over the real install (`health`, D0 and D1 all fail) and D1's pristine-fixture assertion would fail too. The concrete route slug is the identifier the prompt carries and the one the wave-2 review's fix direction accepted (`paid-glm-5-3-flash-*` or the concrete `paid-glm-5-3-flash-high`); widening the pin to the family glob requires the installed prompt to carry the glob first, which is an out-of-checkout edit this task may not make (N5). `scripts/user-scope-autonomy.test.mjs` needed no change: D1's two-mutation loop already removes every occurrence of every token of every row and re-checks the reworded copy, no case was added, and no assertion, matcher or case was weakened, skipped or deleted. No new `runGsdTests()` call; the installed suite is still spawned exactly twice. Verify `node --experimental-strip-types --test scripts/user-scope-autonomy.test.mjs`: exit 0, tests 18, pass 18, fail 0, cancelled 0, skipped 0, todo 0, duration_ms 83271.9964, wall 83.4 s; the D1 two-mutation lines name both tokens (`"paid-deepseek-v4-1-flash-*" removed was named D1, reworded was clean`; `"paid-glm-5-3-flash-high" removed was named D1, reworded was clean`) and D0 prints the absolute path it read for all seven dispatch rows.
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t008-verify): pass, exit 0; output tail:
  ```
  ✔ E3: repeated runs give the same verdict and write nothing into the checkout (680.3179ms)
  ✔ P1 brief-check pin: a paid route yields no missing-effort warning and a bare brief yields it (408.4256ms)
  ✔ P2 plan-lint pin: a :: held-out Test cell yields ok and no held-out finding (285.7894ms)
  ✔ P3 check_handoffs pin: a readable coverage row exits 0 and a three-cell row is unreadable (557.2705ms)
  ✔ P4 serial-retry pin: a parked serial task is ready and a pending task retaining metadata fails (3260.1269ms)
  ✔ E1 helper pin: a removed token fails naming the absolute file and the rule id, and a reworded copy passes (518.8444ms)
  ✔ E2 helper pin: an absent install or helper dir fails naming the resolved absolute path (127.6355ms)
  ✔ E3 helper pin: two runs agree and write nothing into the checkout (1039.8314ms)
  ✔ D0 dispatch pin: every dispatch document resolves under the rules root and carries its named tokens (1.6159ms)
  ✔ D1 dispatch pin: removing any named token fails naming the absolute file and the pin id, and a reworded copy passes (1263.3722ms)
  ✔ D2 dispatch pin: an absent install or a missing dispatch document fails naming the resolved absolute path (124.4928ms)
  ✔ D3 dispatch pin: brief-check names the missing brief-contract field and stops naming it once the field is present (401.5515ms)
  ℹ tests 18
  ℹ suites 0
  ℹ pass 18
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 72159.8212
  ```
