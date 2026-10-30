---
id: T011
title: Narrow the stale-view panel driver types
wave: 4
deps: [T008]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/panel.mjs
  - .claude/skills/control-ai-browsers/scripts/panel.mjs
---

# T011 — Narrow the stale-view panel driver types

## Intent coverage

- None

## Context

T008 added the `stale-view` feature to the panel driver, but its Verify was
only a `node --test` run, so `npm run check` never covered it. T010's landing
turned that up: the type check reports three TS2345 errors at
`.claude/skills/control-ai-browsers/scripts/panel.mjs:289-291`, where a
`string | undefined` argument is passed where `string` is required. That
failure blocks every task whose regression Verify includes T005's, and it
would fail the ship's project Verify.

## Approach

- Make the narrowest possible change: give each of the three arguments a
  defined value at the point of use (a fallback, a guard, or a narrowed local),
  keeping the driver's runtime behaviour identical.
- Keep the two skill trees byte-identical — that is what the mirror test
  asserts.
- Its Verify includes the repository type check, so a driver change cannot
  land again without one.

## Interface contract

None

## Acceptance criteria

1. `npm run check` exits 0, with no TS2345 in either `panel.mjs` copy.
2. The `stale-view` driver behaviour is unchanged: the feature still declares its claim fields and the escaping test still passes.
3. The two `panel.mjs` copies are byte-identical.
4. Nothing outside the two declared files changed.

## Verify

```bash
node --check .commandcode/skills/control-ai-browsers/scripts/panel.mjs && npm run check
```

Heavy: no

## Log

- created by build repair (2026-10-30): T010's landing surfaced three TS2345 errors in the T008 driver that its own Verify never ran
