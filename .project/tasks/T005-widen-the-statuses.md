---
id: T005
title: Widen the statuses and close the echoed identity
wave: 3
status: in-progress
deps: []
agent: paid-deepseek-v4-1-flash-high
base: a17f6a093b0e46a08baa6084cfb4edb5f700e7c4
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - extension/resource-lifecycle.js
  - scripts/resource-lifecycle.test.mjs
  - research/08-recent-angular-features.md
  - scripts/docs-correction.test.mjs
---

# T005 — Widen the statuses and close the echoed identity

## Context

Wave 1 shipped a resource join that answers honestly, and the three-member panel found five gaps in *coverage* and
*evidence* rather than in honesty. The largest is a status the module cannot name: `_resource-chunk.mjs:504` computes
`return state.extRequest.reload === 0 ? 'loading' : 'reloading'`, so a resource **stuck mid-reload** reports `reloading`,
which is absent from `STATUSES` at `extension/resource-lifecycle.js:44` and therefore answers `cannot-tell`. A reload is
the commonest *"why is this spinner still spinning"* case, so the milestone currently declines its own headline question.

The second is the one unguarded field: `resource` is echoed verbatim (`resource-lifecycle.js:90-91`), so a caller can put a
cause, a loader name or a verdict into the identity slot. `params` and `status` are both gated to the graph's values; the
identity is not.

The remaining three are documentation and test-hygiene defects: `research/08-recent-angular-features.md:137` still says
status comes from reading the `state` node (the measurement says `.status` computed nodes carry it), line 170's field list
omits `.status`, the purity suite's `Date`/`console` assertions are vacuous because reading a vm sandbox from outside never
forwards intrinsics, and the tests' `params: 'resolved'` is a value the recording never measured.

## Approach

Add `reloading` as a fifth status with its own finding text that names the reload rather than the load, extend the params
gate to the same five values, and gate the identity on the shape the graph actually emits — `Resource#<name>` — refusing
anything else with a new `resource-unnamed` reason. Then correct the two research lines and repair the two test defects,
including making the params input either measured or explicitly `params-unavailable`.

## Interface contract

`resourceLifecycle(fact)` returns `{ state: "finding" | "cannot-tell", resource?, status?, params?, reason? }`, where
`reason` is one of `no-resource`, `labels-unreadable`, `params-unavailable`, `status-unavailable`. T003 consumes the same
shape; both tasks must carry this line unchanged.

## Files

- `extension/resource-lifecycle.js`
- `scripts/resource-lifecycle.test.mjs`
- `research/08-recent-angular-features.md`
- `scripts/docs-correction.test.mjs`

## Acceptance criteria

1. `reloading` produces a finding naming the reload, distinct from `loading`, and `params: reloading` is accepted rather than refused.
2. An identity that does not begin `Resource#` yields `cannot-tell` with reason `resource-unnamed`; a cause in the identity slot cannot reach a finding.
3. `research/08-recent-angular-features.md:137` attributes status to the `.status` nodes, and the field list at `:170` names `.status`.
4. The purity suite's assertions hold when evaluated inside the sandbox, and a module that used `Date` or `console` reddens.
5. The tests no longer assert a params value the recording did not measure; an unmeasured params read yields `params-unavailable`.

## Verify

```bash
node --experimental-strip-types --test "scripts/resource-lifecycle.test.mjs" && node --experimental-strip-types --test "scripts/docs-correction.test.mjs" && npx prettier --check extension/resource-lifecycle.js scripts/resource-lifecycle.test.mjs research/08-recent-angular-features.md
```

## Intent coverage

- SC1 — the reloading status is named, and the identity cannot carry a cause
- SC3 — a caller-supplied value outside the graph's vocabulary is refused rather than echoed

## Log

- dispatched
