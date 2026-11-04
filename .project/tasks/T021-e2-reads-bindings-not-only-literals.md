---
id: T021
title: E2 reads bindings, not only literals
wave: 8
deps: [T009]
status: done
agent: build_T021
base: d48b10b74b441cb9448ca0e59c9a9be083de319f
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
- T021: baseline reproduced before the change — [attr.data-slot]='one' on probe-a and [attr.data-slot]='two' on probe-b (a live N1 violation) left the old suite green (2 pass, 0 fail); aria-label='probe a' on probe-a only reddened it with 'mutant (distinguishing attribute added to one host) — matched attribute key sets differ'.
- T021: the literal-only readAttrs is gone — a jsdom reader (readAttributes / matchedOf / describe) reads literal, [attr.x], [x] and [class.x] bindings and compares only the declared match set (class + data-*); the binding mutant now fails with 'matched attribute data-slot differs: <app-harness-probe id=probe-a> writes [attr.data-slot]='one' and <app-harness-probe id=probe-b> writes [attr.data-slot]='two', so a HAR-3 predicate on data-slot tells the hosts apart (prohibition N1)'.
- T021: every mutant applied, its failure captured, reverted, then green — binding [attr.data-slot] one/two -> 'matched attribute data-slot differs ...'; literal data-slot='extra' on probe-a only -> 'data-slot='extra' on <app-harness-probe id=probe-a> only'; both hosts id=probe-a -> 'the hosts share an id'; data-probe removed from both hosts -> 'reader blind to data-probe on a host'; reader reverted to literals only -> 'reader blind to [attr.x] bindings'; reader silently skipping aria-label -> 'returned 7 of the 8 attributes written on the host'; match set widened to include id -> 'id inside the declared match set'; contract path moved -> 'the declared match set lost its declaration'; id sentence removed -> 'the id exclusion lost its declaration'.
- T021: the harmless literal stays green — aria-label='probe a' on probe-a only gives 4 pass / 0 fail on the new suite (the old suite failed that same fixture); the declared match set is class + data-*, aria-label is outside it, and the reader still *sees* it: the drop-guard counts 8 of 8 attributes and the matched-name assertions pin that only matched names are compared.
- T021: the id exclusion is now BOTH asserted and ruled — asserted: the suite reads the fixture's authoring contract (.project/tasks/T002-harness-target-page.md:48-54, 'same class list and the same data attributes ... an id is not an attribute a harness matches on'), fails if that declaration moves, pins !isMatchedName(id), and asserts the reader sees id on both hosts with differing values (so the exclusion is the declaration's, not the reader's blindness); ruled: the suite header records what a declaration cannot pin — HAR-3 does not exist, the A8 ruling defers it — with its reason and its re-derivation condition, because this task's files declare only the suite itself.
- T021: Verify — npm ci --include=dev; node --test tests/held-out/fixture-harness-ambiguity.test.mjs -> 4 pass / 0 fail (exit 0); T009's harness-family Verify over the same file still 16 pass / 0 fail; the fixture is byte-identical to HEAD (git status shows only this suite and the task frontmatter) — ready
