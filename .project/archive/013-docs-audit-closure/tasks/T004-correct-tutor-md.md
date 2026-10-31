---
id: T004
title: Correct docs/design/tutor.md (rows 645-647)
wave: 2
deps: []
status: done
agent: build_T004
base: 1444d1e44b20313732458349adbd4b5c90079026
worktree: null
task_branch: null
files:
  - docs/design/tutor.md
---

# T004 — Correct docs/design/tutor.md (rows 645-647)

## Context

Rows 645-647 are aspirational: "The tutor works with no model", "27 lessons in five phases", "Storage shapes in `chrome.storage.local`" describe a tutor that does not exist. The correction updates these claims to current behaviour or retires them under the recorded retirement ruling, naming the path.

## Approach

- Correct or retire the three aspirational claims per the ruling (retire only where nothing replaced the capability and no live instruction depends on it).
- Touch only the sentences the audit marks; leave verified sentences byte-identical (E4). No product behaviour change (N2).

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `docs/design/tutor.md` no longer asserts "The tutor works with no model", "27 lessons in five phases", or "Storage shapes in `chrome.storage.local`" (rows 645-647).
2. Any retired claim names the retired path in this task.
3. Verified sentences in the document stay byte-identical (E4).

## Verify

```bash
python -c "import sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(); assert 'The tutor works with no model' not in t; assert '27 lessons in five phases' not in t; assert 'Storage shapes in `chrome.storage.local`' not in t; print('ok')" docs/design/tutor.md
```

Heavy: no

## Log

- created by planner
- 2026-10-31 — implementation: marked the tutor document a proposal and reworded the three aspirational claims; Verify: python -c ... docs/design/tutor.md -> exit 0
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T004): pass, exit 0; output tail:
  ```
  ok
  /usr/bin/bash: line 1: chrome.storage.local: command not found
  ```
