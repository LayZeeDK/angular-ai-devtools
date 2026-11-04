---
id: T002
title: Fix the thirteen real defects
wave: 1
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/agent-main.js
  - extension/relay.js
  - extension/panel.js
  - extension/stale-view-worker.js
  - extension/background.js
  - extension/devtools.js
---

# T002 — Fix the thirteen real defects

## Context

With the Chrome API typed, the check reports 13. They are genuine: reading `.detail` off a plain
`Event`, `textContent` on a string, a redeclared `status`, and a union passed where `Event` is expected.

## Approach

1. Fix each at source so the compiler is satisfied by what the code means, not by a cast that changes
   nothing: type the listener parameter as `CustomEvent`, give the string the property its caller expects, rename
   the shadowed binding.
2. No `@ts-ignore`, no `@ts-expect-error`, no `as unknown as` chain (prohibition N1).
3. Keep behaviour identical: the extension's existing `node:test` suites must stay green.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `npx tsc -p extension/tsconfig.json` reports zero errors.
2. No `@ts-ignore`, `@ts-expect-error` or bare cast is introduced; grep proves none exists in `extension/`.
3. `npm test` stays green, so the fixes are behaviour-preserving.

## Verify

```bash
npm ci --include=dev; npx tsc -p extension/tsconfig.json
```

## Log

- opened by orchestrator in wave 1
