---
id: T002
title: Correct plans/angular-ai-devtools-proposals.handoff.md (rows 649, 650)
wave: 2
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - plans/angular-ai-devtools-proposals.handoff.md
---

# T002 — Correct plans/angular-ai-devtools-proposals.handoff.md (rows 649, 650)

## Context

Queue 649 ("about 1,080 lines") is stale: the measured `docs/feature-proposals.md` is 1110 lines at 14729ba, so the claim is corrected to the measurement. Queue 650 ("Head `fbe3aac` at writing") is stale: the handoff is a dated historical record, so the head is dated and the document is marked superseded so it no longer reads as a live statement. Both rulings are `fix-doc` (delegated 2026-10-31).

## Approach

- Correct the line-count claim to the measured 1110 lines.
- Date the recorded head and mark the handoff superseded, so the historical record is not read as a live claim.
- Touch only the sentences the audit marks; leave verified sentences byte-identical (E4). No product behaviour change (N2).

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `plans/angular-ai-devtools-proposals.handoff.md` states the measured 1110 lines, not ~1,080 (row 649).
2. The document dates its recorded head and is marked superseded (row 650).
3. Verified sentences in the document stay byte-identical (E4).

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert '1110' in t; assert 'superseded' in t.lower(); print('ok')" plans/angular-ai-devtools-proposals.handoff.md
```

Heavy: no

## Log

- created by planner