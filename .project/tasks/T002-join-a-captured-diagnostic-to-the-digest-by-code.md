---
id: T002
title: Join a captured diagnostic to the digest by code
wave: 2
deps:
  - T001
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
---

# T002 — Join a captured diagnostic to the digest by code

## Context

The panel must say, per captured diagnostic, what the digest says about the code it carries, and must distinguish 'no entry for this code' from 'the page captured nothing'. Both are absences and they are not the same absence.

## Approach

- Add `consoleJoin(diagnostics, digest)` returning `{ state, findings }`, keyed only on the code a message carries.
- Report a message with no code as such, and a code with no entry by name, never as a count.
- Report an empty capture as `captured-nothing`, distinct from `no-diagnostics`.
- Arm three mutants: body matching, absence-as-count, and a collapsed empty capture; each must redden a test that names its defect.

## Acceptance criteria

1. A message carrying a digest code yields one finding naming the digest title, and the join is proven against the shipped digest file rather than a fixture.
2. A message whose code the digest lacks reports that code by name, and a mutant that swaps it for a count reddens a test naming the count.
3. A message with no code reports that it carried no code; a mutant that invents one reddens naming the invention.
4. Two diagnostics sharing a code yield two findings and one match, in capture order; a mutant that dedupes reddens naming the collapse.

## Interface contract

`extension/console-join.js` exports `consoleJoin(diagnostics, digest)` returning `{ state, findings[] }`; `state` is `joined | captured-nothing | no-diagnostics`; each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code.

## Intent coverage

- SC1
- SC2
- SC3

## Verify

```bash
node --check extension/console-join.js && node --test scripts/console-join.test.mjs && npx prettier --check extension/console-join.js scripts/console-join.test.mjs
```

## Log

- Task written at plan approval; not started.
