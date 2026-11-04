---
id: T015
title: Controls resolves to its element
wave: 5
deps: [T014]
status: done
agent: build_T015
base: 4d17542623351babc1880bedcb30ea8ef038a486
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
- built: tests/held-out/aria-rules.mjs — menu-trigger-controls no longer accepts any id the file contains: new controlledMenu() reads the trigger's [menu]="..." binding, follows it to the element declaring #ref, and requires aria-controls to equal that panel's own id; the failure now names both ids. tests/held-out/fixture-aria-rule-mutation.test.mjs — new case "pointing the trigger at the listbox reddens the controls rule": control (unmutated green) → mutant (aria-controls="components-listbox") → siblings green → restore green.
- mutant red BEFORE the fix, observed (4 pass / 1 fail): AssertionError [ERR_ASSERTION]: fixture-aria-rule-mutation.test.mjs: mutant (aria-controls="components-listbox" on the ngMenuTrigger in spikes/ng222-app/src/app/components/aria-surfaces.ts) — menu-trigger-controls should redden when the trigger's aria-controls names the listbox instead of the menu it controls, but it passed: aria-controls="components-listbox" resolves
- mutant red AFTER the fix, verdict observed: {"pass":false,"detail":"aria-controls=\"components-listbox\" is not the menu this trigger controls: expected \"components-menu\" (the id of its #menu panel), got \"components-listbox\""} — the four sibling rules (listbox-accessible-name, listbox-focus-mode, menu-trigger-accessible-name, listbox-option-order) stayed green; removing aria-controls now yields "missing aria-controls; the trigger's [menu]=\"menu\" controls the panel id=\"components-menu\"".
- Verify: npm ci --include=dev && node --test tests/held-out/fixture-aria-rule-mutation.test.mjs — exit 0, tests 5, pass 5, fail 0; regression node --test tests/held-out/fixture-aria-order.test.mjs — 3/3 green. Files: tests/held-out/aria-rules.mjs, tests/held-out/fixture-aria-rule-mutation.test.mjs — ready
- Verify re-run after the final source tidy (control-only rename, no behaviour change): npm ci --include=dev && node --test tests/held-out/fixture-aria-rule-mutation.test.mjs — exit 0, tests 5, pass 5, fail 0; node --test tests/held-out/fixture-aria-order.test.mjs — 3 pass, 0 fail. No commits, tags or pushes; no scratch files left in the repo — ready
