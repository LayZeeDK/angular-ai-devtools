---
id: T003
title: Correct .commandcode/skills/nx-import/references/TURBOREPO.md (row 465)
wave: 2
deps: []
status: done
agent: build_T003
base: 1444d1e44b20313732458349adbd4b5c90079026
worktree: null
task_branch: null
files:
  - .commandcode/skills/nx-import/references/TURBOREPO.md
---

# T003 — Correct .commandcode/skills/nx-import/references/TURBOREPO.md (row 465)

## Context

Row 465 is aspirational: "Nx replaces Turborepo task orchestration" presents an unbuilt outcome as fact. The correction updates the document to describe current behaviour only.

## Approach

- Replace the aspirational sentence with the current behaviour.
- Touch only the sentence the audit marks; leave verified sentences byte-identical (E4). No product behaviour change (N2).

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `.commandcode/skills/nx-import/references/TURBOREPO.md` no longer asserts "Nx replaces Turborepo task orchestration" (row 465).
2. Verified sentences in the document stay byte-identical (E4).

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert 'Nx replaces Turborepo task orchestration' not in t; print('ok')" .commandcode/skills/nx-import/references/TURBOREPO.md
```

Heavy: no

## Log

- created by planner
- 2026-10-31 — implementation: restated the Turborepo claim as what the migration does; Verify: python -c ... → exit 0
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T003): pass, exit 0; output tail:
  ```
  ok
  ```
