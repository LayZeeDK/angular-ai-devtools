---
id: T001
title: Re-prove the M010 Verifies for archived tasks 002 005 011 012 at the current head
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/error-capture.test.mjs
  - .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
  - .project/build/verify-ledger.jsonl
---

# T001 — Re-prove the M010 Verifies for archived tasks 002 005 011 012 at the current head

## Context

Per the owner's ruling "3: Repair first." this milestone's first work re-proves the M010 Verifies for archived tasks 002, 005, 011 and 012 at the current head and records fresh passing ledger entries, so the evidence ledger no longer has those gaps. Their Verify commands are in `.project/archive/010-n4-error-explainer/tasks/`. No N24 code lands until this task passes.

## Approach

- Re-run each archived Verify command at the current head: archived task 002 `node --experimental-strip-types --test scripts/error-capture.test.mjs`; archived task 005 `node --experimental-strip-types --test scripts/docs-correction.test.mjs` (its doc corrections are already landed); archived task 011 `npm run check && node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs`; archived task 012 `node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs && npm run check`.
- Record fresh passing ledger entries for all four commands in `.project/build/verify-ledger.jsonl` with `build_state.py verify-record --repo <root> --command <command> --commit <HEAD> --result pass`.
- Do not edit `.project/STATE.md`: only the pipeline helpers write it. The orchestrator records the ledger entries from this task's recorded Verify output.
- Do not modify product code; this is a verification-and-ledger task only.
- Judgment prohibition N5 (no attribution of an error to a component that did not throw it) is owned by the N4 tasks already shipped; this repair task must not weaken it.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. The archived task 002 Verify (`node --experimental-strip-types --test scripts/error-capture.test.mjs`) exits 0 at the current head.
2. The archived task 005 Verify (`node --experimental-strip-types --test scripts/docs-correction.test.mjs`) exits 0 at the current head.
3. The archived task 011 Verify (`npm run check && node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs`) exits 0 at the current head.
4. The archived task 012 Verify (`node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs && npm run check`) exits 0 at the current head.
5. Fresh passing ledger entries for the four commands (archived tasks 002, 005, 011 and 012) are recorded in `.project/build/verify-ledger.jsonl`.

## Verify

```bash
node --experimental-strip-types --test scripts/error-capture.test.mjs && node --experimental-strip-types --test scripts/docs-correction.test.mjs && npm run check && node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs
```

Heavy: no

## Log

- created by planner