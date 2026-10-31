---
id: T007
title: Regenerate the docs audit at shipped head with the delta rule and run the audit gate
wave: 4
deps: [T002, T003, T004, T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T007 — Regenerate the docs audit at shipped head with the delta rule and run the audit gate

## Context

The final audit must be regenerated at the shipped head using the delta rule: carry unchanged verified rows forward with an `unchanged:` prefix and re-derive only corrected/changed rows, so a second run reproduces the Summary counts and never resurfaces a corrected claim (E2). Audit rulings carry forward verbatim (N1, INTENT.md Constraints). The audit gate is `check_docs_audit.py` with `--repo` the sidecar, `--primary` the primary worktree, `--inventory` the frozen inventory and `--prior-audit` the prior copy.

## Approach

- Regenerate the audit over every document the frozen inventory covers, preserving `## User rulings` verbatim and keeping persisting queue rows numbered.
- Run the audit gate to prove zero stale/aspirational and frozen-inventory equality.

```bash
python check_docs_audit.py --repo <sidecar> --primary <primary> --inventory <frozen-inventory> --prior-audit <prior-audit>
```

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. The regenerated audit records zero stale and zero aspirational claims (SC1, E1).
2. Re-running the audit reproduces the same Summary counts (E2).
3. The audit gate passes: frozen inventory equality and zero stale/aspirational (N1).

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert '| stale | 0 |' in t; assert '| aspirational | 0 |' in t; print('ok')" .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- created by planner