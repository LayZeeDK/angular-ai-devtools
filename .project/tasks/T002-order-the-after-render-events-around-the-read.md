---
id: T002
title: Order the after-render events around the read
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/after-render.js
  - scripts/after-render-ordering.test.mjs
---

# T002 — Order the after-render events around the read

## Context

M028 explains why an `afterNextRender` read of `offsetWidth` saw 0, from the ordered profiler after-render
events the page agent already records. The profile exists in the extension; the fixture subject must be
created. See `.project/research/evidence-m028-premise.md`.

## Approach

Pure module that joins a read with the profiler after-render events recorded for it and reports the phase and the events around it in emission order. It consumes the list the page agent already records; it must not subscribe, tap or add instrumentation (N1). When the list carries no after-render event for the read it returns the `cannot-tell` state naming the absence, never a layout attribution (N2).

## Interface contract

None

## Files

- `extension/after-render.js`
- `scripts/after-render-ordering.test.mjs`

## Acceptance criteria

1. A read with events around it yields a finding naming the read, its phase and the ordered events (held-out E1).
2. With the extension's subscriber removed, no finding is produced, so nothing else supplied the events (held-out E2).
3. An empty event list yields `cannot-tell` naming the absence, and never attributes the zero to layout (held-out E3).
4. Mutants redden: reversing the event order, dropping the phase, and replacing the empty case with a layout attribution.

## Verify

```bash
npm ci --include=dev; node --test scripts/after-render-ordering.test.mjs
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
