---
id: T015
title: Type the interop check options so npm run check passes
wave: 3
deps: [T013]
status: done
agent: build_T015
base: 3d5da76b313e155eead166e5d8db4d3f1ad30a3d
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
- Added JSDoc @type annotation to targets in both copies of interop.mjs; copied .commandcode over .claude.
- evidence: Verify passed: 9 interop tests, 2 mirror tests, npm run check (tsc) clean.
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T015): pass, exit 0; output tail:
  ```
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 235.4006
  ✔ .claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers (9.2417ms)
  ✔ .claude/skills/verify-ai-browsers mirrors .commandcode/skills/verify-ai-browsers (2.9333ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 154.9695
  retained .commandcode/skills/verify-ai-browsers/checks/interop.mjs
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
