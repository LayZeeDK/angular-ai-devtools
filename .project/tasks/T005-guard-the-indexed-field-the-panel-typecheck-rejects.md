---
id: T005
title: Guard the indexed field the panel typecheck rejects
wave: 3
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-fields.ts
---

# T005 — Guard the indexed field the panel typecheck rejects

## Context

The ship Verify failed on the panel typecheck:

```
apps/angular-ai-devtools/src/app/panel-fields.ts(119,28): error TS18048: 'field' is possibly 'undefined'.
apps/angular-ai-devtools/src/app/panel-fields.ts(120,23): error TS18048: 'field' is possibly 'undefined'.
apps/angular-ai-devtools/src/app/panel-fields.ts(121,7): error TS18048: 'field' is possibly 'undefined'.
```

T003's task verified with `node --test scripts/panel-fields.test.mjs` only, which does not run `check:panel`. Under the
project's `noUncheckedIndexedAccess`, `fields[name]` is `FieldState | undefined`, so the loop must handle the absent case
rather than assume every key resolves.

## Approach

Guard the indexed lookup and skip an absent entry, so the surface renders only fields it actually received. No behaviour
changes for a well-formed fact list, and no assertion is relaxed.

## Interface contract

None

## Files

- `apps/angular-ai-devtools/src/app/panel-fields.ts`

## Acceptance criteria

1. `npm run check:panel` passes with no TS18048.
2. `node --test scripts/panel-fields.test.mjs` still passes, unchanged.
3. A fact list with a hole in it renders the fields that are present and does not throw.
4. No assertion in the suite is weakened to accommodate the guard.

## Verify

```bash
npm run check:panel && node --test scripts/panel-fields.test.mjs
```

## Intent coverage

- SC4

## Log

- dispatched
