---
id: T003
title: Render only the reason the pane was given
wave: 3
status: done
deps: [T002]
agent: orchestrator-serial
base: 66a7e9c10c16f3b7499e465093225d08c3d5c9dd
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-fields.ts
  - scripts/panel-fields.test.mjs
---

# T003 — Render only the reason the pane was given

## Context

`panel-fields.ts:166-167` renders one fixed sentence for every cannot-tell result: "the form root is invalid and
carries no error kind". Since M037 the module can answer cannot-tell for a second reason,
`submit-state-unreadable`, so that sentence now asserts a cause the module did not give. The comment above it
records the same defect being fixed once before for a different claim, which is why this needs a pin rather than a
rewording.

## Approach

Map the reasons the module can name to their own sentences, and for any other reason render only that the pane
cannot tell plus the reason it was given -- never a cause it was not told. Add a regression test that a
submit-state-unreadable result does not contain the root sentence.

## Interface contract

None

## Acceptance criteria

1. A `root-invalid-without-error-kind` result renders the root sentence it renders today, unchanged.
2. held-out E5: a `submit-state-unreadable` result renders a sentence about the submit state and does not contain the phrase
   "root is invalid".
3. An unrecognised reason renders a generic sentence and the reason it was given, asserting no cause.
4. The existing panel-fields suite passes unchanged, and the new cases are proven non-vacuous by a mutant that
   restores the fixed sentence.

## Verify

```bash
node --experimental-strip-types --test "scripts/panel-fields.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/app/panel-fields.ts scripts/panel-fields.test.mjs
```

## Intent coverage

- SC5: AC2

## Log

- dispatched
- 2026-11-08 - implemented. The pane renders one sentence per reason the module can name and a generic
  sentence for any other, so it never asserts the root for a submit-state-unreadable result.
  Four tests; the mutant restores the fixed sentence and reddens. 14/14. Verdict: ready.
