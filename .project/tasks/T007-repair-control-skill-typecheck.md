---
id: T007
title: Repair the type-check break in the control skill's tests
wave: 2
deps: [T004]
status: in-progress
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
  - .claude/skills/control-angular-dev-app/scripts/control.test.mjs
  - .claude/skills/control-angular-dev-app/scripts/control.mjs
---

# T007 — Repair the type-check break in the control skill's tests

## Context

`npm run check` is red at this head with six TypeScript errors in
`.commandcode/skills/control-angular-dev-app/scripts/control.test.mjs`: a `string` passed where
`TargetName` is wanted, a `number | undefined` passed where `number` is wanted, three
possibly-undefined reads, and `.at(...)` read on a `PortRow`. T004 added the `components` target and its
port tests to that file and never ran the type-check chain, so the break landed four tasks ago and only
surfaced at the final gate.

The `.claude` copy is byte-identical by rule, so both trees must end up the same.

## Approach

1. Read the reported errors from `npm run check` rather than guessing, and fix each at its source: narrow
   the target with the file's own `TargetName` union, default or assert the optional number, and replace
   `.at(...)` with the indexing the `PortRow` shape actually supports.
2. Keep every assertion that was already there — this is a typing repair, not a test rewrite.
3. Mirror the change into `.claude/skills/control-angular-dev-app/scripts/control.test.mjs` so
   `scripts/skills-mirror.test.mjs` still passes.
4. Re-run `npm run check` until all five stages pass.

## Interface contract

None

## Intent coverage

- SC4 — `npm run check` and `npm test` pass at the head.

## Acceptance criteria

1. `npm run check` passes all five stages at this head, with no error suppressed by a cast that widens the type to `any`.
2. The two skill trees hold byte-identical copies of `control.test.mjs`, so the mirror test passes.
3. No assertion is deleted or weakened: the test count for that file is the same before and after.

## Verify

```bash
npm ci --include=dev && npm run check && node --test .commandcode/skills/control-angular-dev-app/scripts/control.test.mjs
```

## Log

- created by orchestrator (T005 gate: T004 landed a type-check break that only the head gate saw)
