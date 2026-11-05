---
id: T001
title: Give the fixture a form and record what its field state exposes
wave: 1
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/field-form-page.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - scripts/field-state-capture.test.mjs
  - research/raw/m031-field-state.json
---

# T001 — Give the fixture a form and record what its field state exposes

## Context

M031 explains a disabled submit. The fixture has no form at all and the page agent reads no field state
(`.project/research/m031-forms-evidence.md`). Signal Forms ships in the fixture's Angular version, so both the
subject and the read have to be created and measured.

## Approach

Add a form with two validatable fields (a required one and a numeric-range one), one cross-field rule, and a
submit whose `disabled` is bound to the form's validity. Then measure what is reachable without a second
instrumentation path: record whether `ng.getComponent(element)` exposes the form's field tree, and the shape of
each field's validity and errors. The recording decides T002's input.

## Interface contract

None

## Files

- `spikes/ng222-app/src/app/field-form-page.ts`
- `spikes/ng222-app/src/app/app.routes.ts`
- `scripts/field-state-capture.test.mjs`
- `research/raw/m031-field-state.json`

## Acceptance criteria

1. The fixture has a form with two validatable fields, one cross-field rule and a submit bound to validity, reachable at its own route.
2. The recording states whether `ng.getComponent` exposed the field tree, and if it did not, says so plainly rather than working around it.
3. The recording captures each field's validity and its own errors, with provenance (browser build, URL, timestamp, commands).
4. The capture runs only on request: a default run of the suite reads the recording and leaves the working tree unchanged.
5. A mutant reddens: removing the required field from the form leaves no entry for it in the recording.

## Verify

```bash
npm ci --include=dev; node --test scripts/field-state-capture.test.mjs
```

## Intent coverage

- SC1

## Log

- dispatched
