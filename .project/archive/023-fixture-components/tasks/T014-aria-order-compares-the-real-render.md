---
id: T014
title: Aria order compares the real render
wave: 4
deps: [T010]
status: done
agent: build_T014
base: 96c4c64082db5ef2f371e40cc272aa4ba23ad274
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-aria-order.test.mjs
  - tests/held-out/aria-rules.mjs
  - tests/held-out/fixture-aria-rule-mutation.test.mjs
---

# T014 — Aria order compares the real render

## Context

The wave-3 review found that the "rendered" DOM in `fixture-aria-order.test.mjs` is built from the same
declared array it is then compared against, so the assertion is a tautology wearing a jsdom wrapper. Reversing
the actual rendered iteration in the fixture (`aria-surfaces.ts`) left both order tests green, and no Aria rule
reads option order at all. E5 requires that options are asserted in DOM order *and* that the rule reads that
order, so reordering changes the verdict.

## Approach

1. Read the suite and name the change that leaves it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch it fail, restore, watch it pass.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. The expected order is not derived from the same array the assertion reads: reversing the fixture's real rendered iteration reddens the suite, and the failure names the rendered order it saw.
2. At least one Aria rule reads the option order from the rendered tree, and reordering the rendered options changes that rule's verdict.
3. The suite no longer compares a list to a transformed copy of itself.
4. Each new assertion was seen failing under its mutant and passing when the mutant was reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-aria-rule-mutation.test.mjs
```

## Attempt 2 — the contract was too narrow, and attempt 1 said so

Attempt 1 rewrote `fixture-aria-order.test.mjs` so it expands the fixture's `@for` control-flow blocks against
the scope the component actually binds, mounts the expansion in jsdom, and reads the options back in DOM order
against literals pinned in the test. Two mutants reddened it (`["Gamma","Beta","Alpha"]` against the contract
order `["Alpha","Beta","Gamma"]`, and the menu equivalent). That work stands.

It then stopped, correctly, on criterion 2: a rule that reads option order from the rendered tree needs
`tests/held-out/aria-rules.mjs` and `tests/held-out/fixture-aria-rule-mutation.test.mjs`, which the contract did
not name. Both are declared above now.

The shape attempt 1 named, to be followed: `aria-rules.mjs` exports `renderSurface(templateSrc, scope)` (the
`@for` expansion plus jsdom mount, returning elements in document order) and gains a fifth rule
`listbox-option-order` (`surface: 'listbox'`, no removable attribute) whose `evaluate` reads the rendered order
and fails when it is reversed; the mutation suite skips attribute-less rules in its removal loop and adds the
order-reversal case, requiring `listbox-option-order` to redden while its siblings stay green.

## Log

- opened by orchestrator (wave-3 review blocked: the repair restated the assertions without changing them)
- T014: fixture-aria-order.test.mjs now renders aria-surfaces.ts (real @for control-flow expansion against the component scope + jsdom mount, option text read back in DOM order) and compares it to literals pinned in the test (Alpha,Beta,Gamma / Open,Save,Close); nothing in the suite derives its expectation from the declared array, and the old declared-array copy is gone.
- T014 mutant 1 applied to spikes/ng222-app/src/app/components/aria-surfaces.ts line 27 (@for (item of [...listboxItems].reverse(); track item)): node --test failed 1/3 with 'fixture-aria-order.test.mjs: mutant (@for (item of [...listboxItems].reverse(); track item) in spikes/ng222-app/src/app/components/aria-surfaces.ts) - the listbox rendered its options in DOM order (Gamma,Beta,Alpha), not the contract order (Alpha,Beta,Gamma)'; reverted, 3/3 green.
- T014 mutant 2 applied to aria-surfaces.ts line 47 (@for (item of [...menuItems].reverse(); track item)): node --test failed 2/3 with 'fixture-aria-order.test.mjs: mutant (@for (item of [...menuItems].reverse(); track item) in spikes/ng222-app/src/app/components/aria-surfaces.ts) - the menu rendered its items in DOM order (Close,Save,Open), not the contract order (Open,Save,Close)'; reverted, 3/3 green (plus npm ci --include=dev and npm --prefix spikes/ng222-app ci --include=dev run first, both exit 0).
- T014 Verify passed at head: npm ci --include=dev exit 0; node --test tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-aria-rule-mutation.test.mjs exit 0, 6/6 pass, 0 fail.
- T014 blocked: acceptance criterion 2 needs tests/held-out/aria-rules.mjs and tests/held-out/fixture-aria-rule-mutation.test.mjs, neither in files:. aria-rules.mjs needs a renderSurface(templateSrc, scope) export - the @for expansion plus jsdom mount the order suite now uses - returning elements in document order, and a fifth rule id listbox-option-order (surface listbox, no removable attribute) whose evaluate reads the rendered option order and fails when it is reversed; fixture-aria-rule-mutation.test.mjs needs its removing-one-rule-attribute loop to skip attribute-less rules and a new case that reverses the listbox @for in memory and requires listbox-option-order to redden while its siblings stay green.
- RESULT: T014 blocked
- T014 attempt 2: tests/held-out/aria-rules.mjs now exports renderSurface(templateSrc, scope) - the @for control-flow expansion against the component scope mounted in jsdom, returning elements in document order - plus readTemplate/readScope/readForBlock/reverseIteration/buildSurface, and a fifth rule listbox-option-order (surface listbox, no attribute) whose evaluate compares the rendered option order with the order the component declares; fixture-aria-rule-mutation.test.mjs skips attribute-less rules in its removal loop and adds the order-reversal case; fixture-aria-order.test.mjs dropped its private expansion onto renderSurface and its differential assertion now pins the reversed order (Gamma,Beta,Alpha).
- T014 attempt 2 mutant 1 (the criterion-2 mutant) applied to spikes/ng222-app/src/app/components/aria-surfaces.ts line 27 (@for (item of [...listboxItems].reverse(); track item)), aria-items.ts untouched: node --test exit 1, 2/7 pass 5/7 fail - 'fixture-aria-order.test.mjs: mutant (@for (item of [...listboxItems].reverse(); track item) in spikes/ng222-app/src/app/components/aria-surfaces.ts) - the listbox rendered its options in DOM order ["Gamma","Beta","Alpha"], not the contract order ["Alpha","Beta","Gamma"]' and 'fixture-aria-rule-mutation.test.mjs: listbox-option-order should pass on spikes/ng222-app/src/app/components/aria-surfaces.ts: listbox rendered its options in DOM order (Gamma,Beta,Alpha), not the order the component declares (Alpha,Beta,Gamma)'; reverted via the same edit, 7/7 green.
- T014 attempt 2 mutant 2 applied to aria-surfaces.ts line 47 (@for (item of [...menuItems].reverse(); track item)): node --test exit 1, 6/7 pass 1/7 fail - 'fixture-aria-order.test.mjs: mutant (@for (item of [...menuItems].reverse(); track item) in spikes/ng222-app/src/app/components/aria-surfaces.ts) - the menu rendered its items in DOM order ["Close","Save","Open"], not the contract order ["Open","Save","Close"]', while listbox-option-order stayed green, so the order rule judges only the surface it names; reverted, 7/7 green.
- T014 attempt 2 Verify passed: npm ci --include=dev exit 0; npm --prefix spikes/ng222-app ci --include=dev exit 0; node --test tests/held-out/fixture-aria-order.test.mjs tests/held-out/fixture-aria-rule-mutation.test.mjs exit 0 with tests 7, pass 7, fail 0 (order 3/3, mutation 4/4); git status shows only the three declared files plus this task file, spikes/ng222-app byte-identical to HEAD.
- RESULT: T014 ready
