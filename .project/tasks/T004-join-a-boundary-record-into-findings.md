---
id: T004
title: Join a boundary record into its identity, the error and the named absences
wave: 4
deps:
  - T003
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/error-boundary.js
  - extension/error-boundary.test.mjs
  - research/raw/m042-error-boundary.json
---

# T004 — Join a boundary record into its identity, the error and the named absences

## Context

The record carries what the page observed: for each arrival, the route it came by, the error's own name, message and cause, and the details fields the boundary's catch carried. Turning that into findings is this task, and it is the only place the record's shape is read — which is what keeps the pane a view and what makes every precision claim in this milestone provable against a recorded frame instead of against a browser.

Four answers have to be exactly right. The two component types are different facts: the declaring component comes from the boundary's own type, the throwing component from the declaration the catch carried, and a reader that renders one as the other names a boundary that never declared anything. The error is the thrown value: its own name and message, its cause only where the boundary wrapped something that is not Error-like, and never the text the boundary's fallback rendered — an error whose message and whose fallback disagree is an ordinary case, not a trap. An error that arrived with no details has no boundary at all, and saying so is different from saying the app kept no error. And the substituted subtree is recorded nowhere: the boundary holds its error and its host view only, the primary view is removed, and no record of its nodes survives, so a finding that produced a node, a tag, a text or a count for it would be inventing evidence.

## Approach

One pure function over the record it is handed. It reads no clock, no DOM, no page and no second tap, so every answer is a function of the argument and the suite can drive recorded frames directly. Each answer names its own state and its own absence, one absence per unanswered question, and a state the reader was not written for travels through rather than being coerced into a neighbouring one.

The absences are the substance of the task, so each is a value rather than a missing field: no boundary declared, no boundary details, no error caught, no error view rendered, no replaced subtree, no global error listeners, and the machinery absence a page could not answer. A record that also carried a boundary is never overwritten by an absence another shape would have produced, and an absence never borrows a boundary, a caught-by mechanism or a reset from the record around it.

The version half is stated rather than inferred. The answer carries the version the surface works against, taken from the constant T001 measured, and the reported version the record carried — `null` where the page reported none, because the record may not invent one. Where the record says the machinery could not be confirmed, the answer is cannot-tell with that absence and never an empty boundary list.

Non-vacuity is the discipline: each of the seven held-out pins is proven by a mutant that names its defect by string, so a pin that cannot fail is visible as one.

## Interface contract

- Record: the page agent publishes a boundary section beside its change-detection and router records, each entry `{ route, error: { name, message, cause }, details: { declarationType, declarationInstanceName, caughtBy, boundaryType, boundaryReset }, at }`, where `route` is `hook` or `handler`, every field the record did not carry is `null`, and `cause` is present only where the boundary wrapped a value that is not Error-like.
- Answer: `readErrorBoundary(record)` answers `{ state, absence, findings, absences, version }` where `state` is `caught`, `cannot-tell` or `idle`, `absence` is one of the named absences or `null`, each finding is `{ declaringType, throwingType, caughtBy, reset, errorName, errorMessage, cause, route, replacedSubtree }`, and `absences` lists one named absence per unanswered question.
- Pane answer: `errorBoundaryPanel(answer)` answers `{ state, message, lines, text, cells }` where each cell holds the text of its own state or the empty string, and `lines` carries one line per fact the answer carried.

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Edges

E1, E2, E4, E5, E6, E7 and E8, all seven held-out and all seven in this task's own suite.

## Acceptance criteria

1. A caught record names the component whose template threw from the declaration the catch carried and the component that declares the boundary from the boundary's own type as separate facts, with the caught-by mechanism beside them and a reset reported as available only where the record carries one, and a record whose two types are the same type renders it once with no invented parent — held-out E1.
2. A subject record with no boundary answers cannot-tell with `no-error-boundary-declared`, naming no boundary, no declaring component and no reset, and never an empty string standing in for a boundary — held-out E2.
3. The finding reports the thrown value's own name and message, and its cause only where the boundary wrapped a value that is not Error-like, while a fallback whose text differs from the thrown message is reported as fallback content and the rendered text appears in no field of the finding — held-out E4 and E6.
4. An installed hook that caught nothing in the window answers `no-error-caught`, a view reader holding an error with no rendered error view answers `no-error-view-rendered`, and the two absences stay distinct with neither rendered as zero errors — held-out E5.
5. An error delivered with no details answers `no-boundary-details` with no boundary and no caught-by mechanism, and a record that also carries a boundary is not overwritten by that absence — held-out E7.
6. The substituted subtree answers cannot-tell with `no-replaced-subtree`, and no node, tag, text or count from the replaced primary view appears in any field of the finding — held-out E8.
7. Every absence the plan carries is answered from the record alone, one absence per answer with its own name, a state the reader was not written for is passed through rather than coerced, and the reader reads only the record it is handed — no clock, no DOM, no page read and no second tap.
8. Each of the seven held-out pins is proven non-vacuously by a mutant that names its defect by string.

## Verify

```bash
node --check extension/error-boundary.js && node --check extension/error-boundary.test.mjs && node --experimental-strip-types --test "extension/error-boundary.test.mjs" && npx prettier --check extension/error-boundary.js extension/error-boundary.test.mjs && npm run check
```

## Held-out

E1, E2, E4, E5, E6, E7 and E8, all seven in `extension/error-boundary.test.mjs`, each pin proven non-vacuously.

## Log

- pending
