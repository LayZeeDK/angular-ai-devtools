---
id: T010
title: Assemble lars-verify claim record for the interop claim
wave: 4
deps: [T006, T007, T008, T009]
status: done
agent: build_T010
base: bf26258ae5b05b43209f9929f819e1b5a60d25b2
worktree: null
task_branch: null
files:
  - .project/plan/CLAIM.md
  - .project/plan/evidence/T006/interop.json
  - .project/plan/evidence/T007/interop.json
  - .project/plan/evidence/T008/interop.json
  - .project/plan/evidence/T009/interop.json
---

# T010 — Assemble lars-verify claim record for the interop claim

## Context

SC6 is the `lars-verify` verdict of verified for the interop claim, end-to-end across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct. This task owns that claim record: it cites all four retained per-pair results (T006-T009) and records the verdict. The verdict is `verified` only when all four pairs answer; a partial run cannot be read as proof (E6).

## Approach

- Read the four retained per-pair results (T006-T009).
- Run `lars-verify` over the four per-pair results to produce one verdict.
- Write the claim record citing every retained per-pair result and the recorded verdict.
- Do not re-drive any model instance; this task assembles rather than re-verifies.
- Keep the N2 prohibition: one retained verdict per pair, read from the recorded result rather than the summary line.

## Interface contract

- Each pair task retains a per-pair result at `<evidence>/interop.json` produced by `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` for its single instance.
- The assembler cites all four retained per-pair results and writes the `lars-verify` claim record.

## Intent coverage

- SC6

## Acceptance criteria

1. The claim record cites all four retained per-pair results (T006-T009) (SC6).
2. The verdict is `verified` only when all four pairs answer; a partial run is recorded as not verified (E6).
3. One retained result is cited per pair (Prohibition N2).
4. `.project/plan/CLAIM.md` is written.

## Verify

```bash
node -e "require('fs').readFileSync(process.argv[1])" .project/plan/CLAIM.md
```

Heavy: no

## Log

- pending
- Read the four retained per-pair results (T006-T009).
- Run `lars-verify` over the four per-pair results to produce one verdict.
- Write the claim record citing every retained per-pair result and the recorded verdict.
- Do not re-drive any model instance; this task assembles rather than re-verifies.
- Keep the N2 prohibition: one retained verdict per pair, read from the recorded result rather than the summary line.
- Each pair task retains a per-pair result at `<evidence>/interop.json` produced by `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` for its single instance.
- The assembler cites all four retained per-pair results and writes the `lars-verify` claim record.
- SC6
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T010): pass, exit 0
- 2026-10-31 — orchestrator regression Verify of T006 (isolate gsd-path-task/T010): fail, exit 2; output tail:
- 2026-10-31 — orchestrator regression Verify of T007 (isolate gsd-path-task/T010): fail, exit 2; output tail:
- 2026-10-31 — orchestrator regression Verify of T008 (isolate gsd-path-task/T010): fail, exit 2; output tail:
- 2026-10-31 — orchestrator regression Verify of T009 (isolate gsd-path-task/T010): fail, exit 2; output tail:
