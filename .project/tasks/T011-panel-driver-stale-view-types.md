---
id: T011
title: Narrow the stale-view panel driver types
wave: 4
deps: [T008]
status: done
agent: build_T011
base: cb7c70ce3d2664fdde54d2902f0c6ee99b697fd6
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
- fixed (2026-10-30): `selectors` is annotated `Record<string, string>` and the root tsconfig sets `noUncheckedIndexedAccess`, so `selectors.field`/`.component`/`.hedged` read as `string | undefined` at panel.mjs:289-291; restored `field`'s JSDoc to `@param {string} sel` and narrowed at the point of use — `const { field: staleField = '[data-testid="field-name"]', component: staleComponent = '[data-testid="owning-component"]', hedged: staleHedged = '[data-testid="hedged"]' } = selectors;` then passed those three locals (defaults equal the literals already in `selectors`, so runtime behaviour is unchanged); mirrored to `.claude` with `copy /y` (byte-identical, `fc /b` clean); `node --check ... && npm run check` exit 0; `node --experimental-strip-types --test tests/held-out/stale-view-fact-list-escaping.test.mjs` pass 2 / fail 0
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T011): pass, exit 0; output tail:
  ```
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
