---
id: T007
title: Record the surface and run the project verify
wave: 5
status: in-progress
deps: [T002, T004, T005, T006]
agent: build_T007
base: 988dc89adb5c53bc285076ce7c4ccdd05e29e7c9
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - research/raw/m046-surface.json
  - research/raw/m046-verdict-claims.json
  - scripts/copy-to-agent.test.mjs
  - .project/research/DOCS-AUDIT.md
---

# T007 — Record the surface and run the project verify

## Context

A milestone ships what it recorded and verified at the head it ships, and the earlier tasks each proved one
piece. This task derives the surface record and runs the project verify last, so a red build cannot reach ship.

## Approach

Derive `research/raw/m046-surface.json` from the shipped tree, pin it, and run the project verify
(`npm run check && npm test`) at the head that ships.

## Intent coverage

- SC1

## Interface contract

None

## Files

  - research/raw/m046-surface.json
  - scripts/copy-to-agent.test.mjs

## Acceptance criteria

1. The record is derived from this tree, and a default run writes no byte.
2. The docs audit covers the single tree: `check_docs_audit.py` passes, so its frozen inventory no longer names the 41 documents the mirror deletion removed and its summary tallies equal the claim rows it keeps.
3. The project verify passes at the head this task lands.

## Verify

```bash
node --test scripts/copy-to-agent.test.mjs && npm run check && npm test
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
- Landed paths: `research/raw/m046-surface.json`, `research/raw/m046-verdict-claims.json`, `scripts/copy-to-agent.test.mjs`, `.project/research/DOCS-AUDIT.md` — each is read from this tree, ready.
