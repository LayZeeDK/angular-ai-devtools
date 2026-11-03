---
id: T015
title: Controls resolves to its element
wave: 5
deps: [T014]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/aria-rules.mjs
  - tests/held-out/fixture-aria-rule-mutation.test.mjs
---

# T015 — Controls resolves to its element

## Context

`menu-trigger-controls` passes whenever `aria-controls` equals **any** id present in the surface file. A gap
reviewer probed it: a trigger whose `aria-controls` names the listbox instead of the menu returns
`{"pass": true, "detail": "aria-controls=\"components-listbox\" resolves"}`. That is the N5-class defect SC2
exists to prevent, sitting one rule to the left of the one the mutation suite exercises.

## Approach

1. Name the change that leaves the check green today.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `menu-trigger-controls` fails when `aria-controls` names an element other than the menu it controls, and the failure names the id it resolved and the id it should have resolved.
2. The rule reads the controlled element from the surface rather than accepting any id the file contains.
3. The mutation suite gains that case and it reddens: point the trigger at the listbox, watch this rule fail and its siblings stay green.
4. Restoring the trigger returns the suite to green.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-aria-rule-mutation.test.mjs
```

## Log

- opened by orchestrator (final review blocked: the gap reviewers probed three checks that cannot fail)
