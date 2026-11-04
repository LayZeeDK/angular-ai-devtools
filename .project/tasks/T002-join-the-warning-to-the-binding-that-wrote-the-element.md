---
id: T002
title: Join the warning to the binding that wrote the element
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/sanitizer-triage.js
  - scripts/sanitizer-triage.test.mjs
---

# T002 — Join the warning to the binding that wrote the element

## Context

T001 records what the warning and the profiler's binding events contain and in what order. This task builds
the join against that measurement rather than against an assumed ordering.

## Approach

Pure module. The warning supplies the occurrence and its time; the profiler's binding and template events
supply the element and the binding. It reads the lists it is given and adds no reader of its own (N1). A
warning with no binding record inside its window yields `cannot-tell` naming the absence, never a guessed
binding (N2, N3). No output names a tag, attribute or substring.

## Interface contract

None

## Files

- `extension/sanitizer-triage.js`
- `scripts/sanitizer-triage.test.mjs`

## Acceptance criteria

1. A warning inside a binding's write window yields the element, the binding and the time (held-out E1).
2. With the console capture removed, no finding is produced, so nothing else supplied the occurrence (held-out E2).
3. A warning with no adjacent binding record yields `cannot-tell` and never a binding (held-out E3).
4. Mutants redden: naming a stripped tag, guessing the nearest binding across a window boundary, and reporting an absence as clean.

## Verify

```bash
npm ci --include=dev; node --test scripts/sanitizer-triage.test.mjs
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
