---
id: T001
title: Re-derive the 45 settleable unverifiable audit rows
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T001 — Re-derive the 45 settleable unverifiable audit rows

## Context

The audit at 14729ba marks 137 rows unverifiable. Of these, 45 are settleable by a repository path read or a shipped command (file existence, grep for message strings/EXT_ID, `npx nx show project`, `git status`); 92 are not-settleable. INTENT.md N3 forbids recording a claim as unverifiable when the repository holds the evidence to settle it, so these 45 rows must be re-derived with a concrete verdict and evidence rather than carried forward.

## Approach

- For each of the 45 settleable rows in `.project/research/DOCS-AUDIT.md`, run the settling check named in `evidence-audit-verifiability.md` (Select-String/Test-Path/git status/nx config read) and record the resulting verdict and evidence.
- Update the Remediation queue suggested action and the row verdict where the claim is settled; leave verified sentences in the underlying documents untouched (N2, E4).
- Do not touch product code under `apps/`, `src/`, `extension/` or any skill script; documentation/audit text only (N2).

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. Each of the 45 settleable rows in `.project/research/DOCS-AUDIT.md` carries a concrete verdict and evidence string instead of "unverifiable".
2. No settleable row retains a suggested action that names no code path while a shipped command could settle it (N3).
3. No product file under `apps/`, `src/`, `extension/` or a skill script is changed.

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert t.count('settleable')>=45 or 'unverifiable' in t; print('ok')" .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- created by planner