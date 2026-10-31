---
id: T015
title: Type the interop check options so npm run check passes
wave: 3
deps: [T013]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/interop.mjs
  - .claude/skills/verify-ai-browsers/checks/interop.mjs
---

# T015 — Type the interop check options so npm run check passes

## Context

T013 added `--extension` by assigning a property after the object literal was created:
`const targets = { evidence, url: ..., names: ... }; if (values.extension) targets.extension = ...`.
TypeScript infers that literal without an `extension` property, so `npm run check` fails with
`TS2339: Property 'extension' does not exist` in both copies of the check. Measured 2026-10-31 by
the T014 coder's Verify.

## Approach

Annotate the literal with a JSDoc `@type` that includes `extension?: string`, so the conditional
assignment type-checks. Keep the runtime behaviour identical and keep the two copies byte-identical.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `npm run check` passes with no `TS2339` in either copy of the check.
2. The check's own tests still pass.
3. The `.claude` copy stays byte-identical to the `.commandcode` copy.

## Verify

```bash
node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs && node --test scripts/skills-mirror.test.mjs && npm run check && echo retained .commandcode/skills/verify-ai-browsers/checks/interop.mjs
```

Heavy: none
Held-out: none

## Log

- pending
