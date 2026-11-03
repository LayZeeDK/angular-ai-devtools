---
id: T013
title: Predicate and action suites learn to fail
wave: 4
deps: [T009]
status: done
agent: build_T013
base: e102307d5d378c52b9b70508668f6938d4fe23ae
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-harness-predicate.test.mjs
  - tests/held-out/fixture-harness-action.test.mjs
---

# T013 — Predicate and action suites learn to fail

## Context

The wave-3 review made `advance()` a no-op — removing the action's effect entirely — and both action tests
stayed green, because the suite asserts a string in the page source rather than the effect. The predicate suite
has no predicate subject at all: it counts source occurrences, so a predicate that silently passes an empty
result cannot redden it. T009 changed the failure messages, not the assertions. This is the repeat-offender
pattern the review named: a receipt that says "repaired" over an unchanged check.

## Approach

1. Read the suite and name the change that leaves it green today.
2. Replace the assertion so that change reddens it, naming the file and the mutant in the failure.
3. Prove the mutant: make the change, watch it fail, restore, watch it pass.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. Making the fixture action's `advance()` a no-op reddens the action suite, and the failure names the effect that did not happen.
2. The predicate suite drives a real predicate against the fixture, asserts the named no-match a non-matching predicate reports, and reddens when the predicate silently passes an empty result.
3. Neither suite counts occurrences in source text as its primary assertion; each names the rendered or executed behaviour it checks.
4. Each new assertion was seen failing under its mutant and passing when the mutant was reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs
```

## Log

- opened by orchestrator (wave-3 review blocked: the repair restated the assertions without changing them)
- T013: action suite compiles the real HarnessProbe out of spikes/ng222-app/src/app/components/harness-probe.ts, mounts the component's own template in jsdom, binds its (click) and {{ }} nodes to that instance, and asserts the rendered text before and after a click (N7: count() is never read). Mutant advance(): void {} reddened it with: fixture-harness-action.test.mjs: mutant (advance() made a no-op) — clicking [data-action="advance"] did not change the text [data-state="count"] renders: it stayed "0", so the action's effect never landed. Reverted: 3/3 pass.
- T013: second action mutant this.count.set(1) (advance sets a constant) reddened it with: fixture-harness-action.test.mjs: mutant (advance() sets a constant instead of advancing) — the second click on [data-action="advance"] left [data-state="count"] at "1", so the action does not advance on every click. Reverted: 3/3 pass.
- T013: predicate suite parses the probe template's [data-kind] items into jsdom and drives the planned harness match semantics over them, so data-kind=absent must report a named no-match. Silent-empty-pass mutant (matchItems returns { matched, noMatch: null }) reddened it with: fixture-harness-predicate.test.mjs: mutant (silent empty pass) — a non-matching predicate must report a named no-match naming the selector and the items examined, got null. Reverted: 3/3 pass.
- T013: predicate mutant items.filter(() => true) (selector ignored) reddened all three with: fixture-harness-predicate.test.mjs: mutant (predicate ignores its selector) — [data-kind="absent"] must match no item, matched 3; and (deepEqual) matched ["li:alpha item","li:beta item","li:gamma item"]. Reverted: 3/3 pass.
- T013: Verify npm ci --include=dev; node --test tests/held-out/fixture-harness-predicate.test.mjs tests/held-out/fixture-harness-action.test.mjs exited 0 with 6/6 pass, 0 fail; only tests/held-out/fixture-harness-action.test.mjs and tests/held-out/fixture-harness-predicate.test.mjs changed, harness-probe.ts restored byte-identical to HEAD after each mutant — ready
