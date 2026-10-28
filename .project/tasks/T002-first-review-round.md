---
id: T002
title: Run first lars-review round over M001-M007
wave: 1
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/review/rounds/round-1.md
---

# T002 — Run first lars-review round over M001-M007

## Context

The first review round produces the findings artifact that fix work is planned from. `lars-review` is read-only, requires a clean product worktree (E12), and runs only on a clean worktree; `.project/` bookkeeping may be dirty. E1 (SC1): a spec may yield zero defects, recorded as "no defects found" with the reviewed range and HEAD; that is not evidence for SC7/SC8 by itself.

## Approach

- Run `lars-review` against each of the seven specs (or the combined range set) on a clean product worktree; freeze the HEAD SHA and record it in every artifact.
- Produce a single findings report at `.project/review/rounds/round-1.md` with verified findings (severity, file:line, evidence, remedy), false positives with reasons, and a remediation sequence.
- Never edit product code in this task. Review-sourced fixes arrive later through plan patch mode.
- Zero-defect specs are recorded as "no defects found" with range and HEAD (E1).
- N5 (SC1): each finding row names its fix commit or its acceptance reason and who accepted it.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `.project/review/rounds/round-1.md` exists and records the frozen HEAD SHA and the reviewed ranges.
2. Every verified blocking finding is listed with severity, file:line, evidence, and remedy.
3. Zero-defect specs are recorded as "no defects found" with range and HEAD.
4. No product code was changed.

## Verify

```bash
node -e "const fs=require('fs');const p=process.argv[1];const s=fs.readFileSync(p,'utf8');if(!s.includes('HEAD')||!s.includes('..')){console.error('round-1.md missing HEAD or range');process.exit(1);}" .project/review/rounds/round-1.md
```

Heavy: no

## Log

- created by planner
- 2026-10-28 — orchestrator: Verify rewritten so the declared report path is a standalone token the plan gate can match (mechanical gate repair, no contract change)