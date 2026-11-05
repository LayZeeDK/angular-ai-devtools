---
id: T002
title: Join the warning to the component that wrote the element
wave: 1
status: done
deps: [T001]
agent: build_T002
base: ed3d532ffc58af2dc8c79860f528a08e4a68edbc
worktree: null
task_branch: null
files:
  - extension/sanitizer-triage.js
  - scripts/sanitizer-triage.test.mjs
---

# T002 — Join the warning to the component that wrote the element

## Context

T001 records what the warning and the profiler's binding events contain and in what order. This task builds
the join against that measurement rather than against an assumed ordering.

## Approach

Pure module. The warning supplies the occurrence and its time; the profiler record supplies the component. T001
measured that the record names no binding and no element, and that a first-render strip has no record at all, so
the module reports a component-level occurrence and **`cannot-tell` is the expected result for a first-render
strip**, not a fallback. It reads the lists it is given and adds no reader of its own (N1). A binding is named
only when the element's record carries it; otherwise the finding says it cannot attribute one (N2). No output
names a tag, attribute or substring (N3).

## Interface contract

None

## Files

- `extension/sanitizer-triage.js`
- `scripts/sanitizer-triage.test.mjs`

## Acceptance criteria

1. A warning inside a profiler record's window yields the component and the time, and names the binding only when the element's record carries it (held-out E1).
2. With the console capture removed, no finding is produced, so nothing else supplied the occurrence (held-out E2).
3. A first-render warning with no profiler record yields `cannot-tell` naming that absence, and never a component or a binding (held-out E3).
4. Mutants redden: naming a stripped tag, guessing the nearest component for a first-render warning, and reporting an absence as clean.

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
- implementation: built extension/sanitizer-triage.js (pure join over the recording: stripped names the covering record's components + the warning's time and the binding only when the record carries one; cannot-tell for a warning no record covers, naming no component; none is an absence, never clean) with scripts/sanitizer-triage.test.mjs run in node:vm over research/raw/m029-sanitizer-warning.json and four mutants (tag name, nearest component, clean absence, uncarried binding) all reddening; Verify: npm ci --include=dev; node --test scripts/sanitizer-triage.test.mjs -> ok 23, fail 0, and npm run check:extension green; no commit
