---
id: T021
title: E2 reads bindings, not only literals
wave: 8
deps: [T009]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - tests/held-out/fixture-harness-ambiguity.test.mjs
---

# T021 — E2 reads bindings, not only literals

## Context

A gap reviewer proved both halves of the defect. `readAttrs` sees only `name="value"` literals, so
`[attr.data-slot]` on one host and `'two'` on the other — a live N1 violation, since it makes the ambiguous
case resolvable — passes unseen. The same reader reddens on a harmless literal attribute added to one host, so
it is blind where it must see and brittle where it must not care.

## Approach

1. Name the change that leaves the check green today — the gap review already named it.
2. Make that change redden it.
3. Prove the mutant, restore, prove green.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. Adding `[attr.data-slot]` to one host — a binding that distinguishes them — reddens the suite, and the failure names the binding it found.
2. Adding a literal attribute the harness does not match on leaves the suite green, so the check covers the attributes the harness reads rather than every attribute present.
3. The `id` exclusion is asserted from the harness's declared match set rather than assumed, or the assumption is recorded as a ruling with its reason.
4. Each new assertion was seen failing under its mutant and passing when reverted.

## Verify

```bash
npm ci --include=dev; node --test tests/held-out/fixture-harness-ambiguity.test.mjs
```

## Log

- opened by orchestrator (final review blocked on two high-severity proof holes)
