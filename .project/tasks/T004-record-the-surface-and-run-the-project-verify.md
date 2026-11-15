---
id: T004
title: Record the surface and run the project verify
wave: 4
deps:
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m045-console-panel.json
  - scripts/console-panel-record.test.mjs
  - research/raw/m057-verdict-claims.json
---

# T004 — Record the surface and run the project verify

## Context

The surface's behaviour is recorded so a later change cannot drift silently, and the shipped head is proven by the project verify rather than by a task's own suite.

## Approach

- Capture `research/raw/m045-console-panel.json` behind `M045_CAPTURE=1`; a default run must leave it byte-identical.
- Pin the recording with a suite that reads it and asserts the findings it carries.
- Run the project verify at this head and paste the stage that reports the totals.

## Acceptance criteria

1. A default run leaves the recording byte-identical; only the armed capture may write it.
2. The pinned suite asserts what the recording states and reddens when the surface stops reporting an absence by name.
3. `npm run check` exits 0 and `npm test` reports its totals at this head, both quoted in the Log.
4. No source is recorded that a second run at the same path would not reproduce.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- SC5

## Verify

```bash
node --test scripts/console-panel-record.test.mjs && npm run check && npm test
```

## Log

- Task written at plan approval; not started.
