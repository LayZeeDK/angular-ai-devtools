---
id: T004
title: The check chain and the recording the gate needs
wave: 2
deps: [T003]
status: done
agent: build_T004
base: 80f915db2217f44a438ddce13e3c67503dda8a4a
worktree: null
task_branch: null
files:
  - package.json
  - research/raw/m025-verdict-claims.json
  - scripts/overlay-verdict-claims.test.mjs
  - scripts/panel-typecheck-scope.test.mjs
---

# T004 — The check chain and the recording the gate needs

## Context

The project Verify failed at `8d01c1e` for two reasons, both contract omissions:

1. `scripts/overlay-verdict-claims.test.mjs` resolves the current milestone from `STATE.md`'s branch
   (the M025 branch) and requires `research/raw/m025-verdict-claims.json`. It fails rather than skips, so
   `npm test` is red. M024's T002 hit the identical gap.
2. The check-chain suite asserts the `check` script's stage order and that it **ends** with
   `check:companion`. T001 appended `check:extension` after it, so three assertions fail.

## Approach

1. Add `research/raw/m025-verdict-claims.json`: `milestone: "M025"`, four rows, all `ruling: "not-required"`,
   each `criterionText` verbatim from `.project/intent/INTENT.md`, each `reason` at least 60 characters naming why
   no portal route produces the fact. Omit `driver`, `instance` and `gateReadings` — no claim is required.
   Read `scripts/overlay-verdict-claims.test.mjs` first and satisfy the validator as written.
2. Move `check:extension` before `check:companion` in the `check` chain, so the chain still ends with the
   companion stage and the existing assertions hold unchanged.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. `node --test scripts/overlay-verdict-claims.test.mjs` passes with the M025 row set, quoting each criterion verbatim.
2. The chain assertion the Verify runs passes with `check:extension` in the chain and `check:companion` still last.
3. No assertion in either existing suite is weakened to reach green — prove by showing the two suites unmodified in the diff.
4. Acceptance is held-out E5: the chain runs every stage it ran before and ends with the companion stage.

## Verify

```bash
npm ci --include=dev; node --test scripts/overlay-verdict-claims.test.mjs
```

## Attempt 2 — the guard pins five stages

Attempt 1 blocked, correctly. `scripts/panel-typecheck-scope.test.mjs:294` deep-equals the `check` script's
`&&`-split against a five-entry `CHECK_STAGES` list, described as *"check must run its five stages in order … and
nothing else"*. A sixth stage fails on count, not position, so moving `check:extension` cannot help.

That pin is a guard against accidental drift, and adding a stage on purpose is exactly the change it must be told
about. So this attempt extends its scope to that suite:

- re-pin `CHECK_STAGES` to the six stages in order, with `check:extension` before `check:companion`;
- keep the assertion's strength — still a deep equal against the whole ordered list, still "and nothing else";
- record in the suite's comment why the sixth stage was added, so the next reader sees a deliberate pin rather than
  a loosened one.

## Log

- opened by orchestrator after the ship Verify failed at `8d01c1e` on the recording and the chain order
- implemented research/raw/m025-verdict-claims.json (M025, SC1-SC4, all ruling not-required, each criterionText verbatim from .project/intent/INTENT.md, each reason >=60 chars naming the charter's portal clause and why no insurance-portal route produces the fact; driver, instance and gateReadings omitted because no claim is required) and moved check:extension before check:companion in package.json's check chain; verify: npm ci --include=dev then node --test scripts/overlay-verdict-claims.test.mjs exit 0, tests 10 pass 10 fail 0 (before: 2 fail on the absent m025-verdict-claims.json), and npm run check exit 0 through all six stages ending at check:companion
- BLOCKED on the exact assertion at scripts/panel-typecheck-scope.test.mjs:294 (assertStageChain): 'check must run its five stages in order ... and nothing else' — deepStrictEqual of check.split('&&') against the five-entry CHECK_STAGES list at lines 88-94, so the moved chain still fails with actual [node scripts/ensure-sidecar-deps.mjs, tsc -p tsconfig.json, npm run check:skills, npm run check:panel, npm run check:extension, npm run check:companion] vs expected [... npm run check:panel, npm run check:companion] (6 vs 5, 1 of 7 tests red); the suite asserts the whole list, not that the chain ends with check:companion, so no ordering of a sixth stage can satisfy AC2 and the fix needs an authorised re-pin of CHECK_STAGES in that file (add 'npm run check:extension' after 'npm run check:panel', plus the 'five stages' doc prose at lines 13-17 and 84-87, the line 297 message and the red-half indices at lines 327-335), a path outside this task's files:; no assertion relaxed and neither test file modified (git diff --stat: package.json, research/raw/m025-verdict-claims.json only) — blocked
- attempt 2: re-pinned scripts/panel-typecheck-scope.test.mjs to the six-stage check chain (CHECK_STAGES gains 'npm run check:extension' after 'npm run check:panel', before 'npm run check:companion'); assertion strength unchanged — still assert.deepEqual(checkStages(script), expected, 'check must run its six stages in order ... and nothing else'), no includes/some/wildcard — with the pin comment recording why M025 added the sixth stage and that the list is a deliberate pin to re-cut, never widen, and the red half re-cut to six entries (dropped extension, dropped panel with extension+companion present, extension/companion swapped, panel/extension swapped, extra appended) so the insertion is pinned too; verify: npm ci --include=dev then node --test scripts/overlay-verdict-claims.test.mjs 10/10 pass, node --test scripts/panel-typecheck-scope.test.mjs 7/7 pass, npm run check exit 0 through all six stages ending at check:companion, npm test's node --test stage 359/359 and vitest 331/331 green (held-out corpus still running when my 10-minute cap hit, no failures reported); diff touches only package.json, research/raw/m025-verdict-claims.json and scripts/panel-typecheck-scope.test.mjs, overlay-verdict-claims.test.mjs unmodified; ready
