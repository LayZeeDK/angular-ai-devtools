---
id: T006
title: Record honest missing-evidence wording for the 92 not-settleable rows
wave: 1
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T006 — Record honest missing-evidence wording for the 92 not-settleable rows

## Context

The 92 not-settleable rows depend on a browser/on-device model run, the external insurance-portal checkout, an upstream project, or a dated historical measurement. This milestone cannot produce that evidence under its static-only constraint, so each row must carry honest missing-evidence wording (portal checkout, browser/on-device runtime, upstream source, or dated measurement) and "no reliable source found" where applicable, rather than being reclassified as stale or aspirational (SC1 counts only stale 2 and aspirational 4).

## Approach

- For each of the 92 not-settleable rows, record the missing evidence by category, applying `accept-drift` rulings to the dated-measurement subset following the 649/650 pattern.
- Retire a document only where nothing replaced the capability and no live instruction depends on it, naming the retired path in this task (N5).
- Do not widen a delegated ruling past its quoted words (N5).

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. Every not-settleable row in `.project/research/DOCS-AUDIT.md` names the missing evidence (portal checkout, browser/on-device runtime, upstream source, or dated measurement).
2. Dated-measurement rows carry an `accept-drift` ruling with the dated head, following the 649/650 pattern.
3. No not-settleable row is misclassified as stale or aspirational (SC1).

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert 'no reliable source found' in t or 'not-settleable' in t or 'not settleable' in t; print('ok')" .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- created by planner