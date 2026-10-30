---
id: T001
title: Re-prove the M010 Verifies for archived tasks 002 005 011 012 at the current head
wave: 1
deps: []
status: done
agent: build_T001
base: 5ad6e019eaa9ea60e4f8b1b6e11b6a95aaeb82e1
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
- 2026-10-30 — command: `node --experimental-strip-types --test scripts/error-capture.test.mjs` — exit 0 — tail: tests 7, suites 4, pass 7, fail 0, duration_ms 181.7118
- 2026-10-30 — command: `node --experimental-strip-types --test scripts/docs-correction.test.mjs` — exit 0 — tail: tests 3, suites 0, pass 3, fail 0, duration_ms 105.5527
- 2026-10-30 — command: `npm run check && node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs` — exit 0 — tail: tests 6, suites 0, pass 6, fail 0, duration_ms 123.5844
- 2026-10-30 — command: `node --test .commandcode/skills/verify-ai-browsers/checks/error-explainer.test.mjs && npm run check` — exit 0 — tail: tests 6, suites 0, pass 6, fail 0, duration_ms 127.6099
- 2026-10-30 — all four archived Verifies pass at current head; ready
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
  ℹ todo 0
  ℹ duration_ms 141.3772
  ✔ passes when every named instance answers in the panel and passes the state claim (2.4272ms)
  ✔ a panel error, an empty answer or a state failure fails the claim and names the instance (1.0366ms)
  ✔ panel exit 2 or no JSON is could-not-run, not a failed claim (0.4692ms)
  ✔ an instance that serves the build of another checkout is could-not-run, and no panel runs on it (0.2974ms)
  ✔ main: all instances by default, 1 on a failed claim, 2 without --url or for an unknown instance (1.6877ms)
  ✔ samePath matches a folder across its short and long spellings and the case of the drive letter (1.9923ms)
  ℹ tests 6
  ℹ suites 0
  ℹ pass 6
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 129.0415
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
