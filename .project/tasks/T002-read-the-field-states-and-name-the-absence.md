---
id: T002
title: Read the field states and name the absence
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/field-state.js
  - scripts/field-state.test.mjs
---

# T002 — Read the field states and name the absence

## Context

T001 records what the field state actually exposes. This task builds the read against that recording rather than
against an assumed shape, and against what `ng.getComponent` did or did not give.

## Approach

Pure module. Given a form's field state it reports each field's validity and its own errors, and the submit state.
It reads what it is given and adds no reader of its own (N1), never echoes a value (N3), and never names the
cross-field rule's function (N2). T001 measured that the form's **root** carries the cross-field error itself
(`{ kind: 'name-too-short-for-age' }`) while both fields stay individually valid, so the module reports that kind when
the root carries one, and returns `cannot-tell` only when the root is invalid and carries no error.

## Interface contract

None

## Files

- `extension/field-state.js`
- `scripts/field-state.test.mjs`

## Acceptance criteria

1. Each field's validity and its own errors are reported beside the submit state (held-out E1).
2. With the read removed, no finding is produced, so nothing else supplied the state (held-out E2).
3. All fields valid with submit disabled reports the root's own error kind when present, and `cannot-tell` when the root carries none (held-out E3).
4. Mutants redden: naming the cross-field rule, echoing a field value, and reporting the all-valid case as an empty success.

## Verify

```bash
npm ci --include=dev; node --test scripts/field-state.test.mjs
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
