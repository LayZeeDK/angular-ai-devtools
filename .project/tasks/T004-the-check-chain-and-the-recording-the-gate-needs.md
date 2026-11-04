---
id: T004
title: The check chain and the recording the gate needs
wave: 2
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - package.json
  - research/raw/m025-verdict-claims.json
  - scripts/overlay-verdict-claims.test.mjs
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

## Log

- opened by orchestrator after the ship Verify failed at `8d01c1e` on the recording and the chain order
