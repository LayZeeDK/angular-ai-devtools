---
id: T009
title: Make the error-explainer panel module compile in the extension build
wave: 2
deps: [T008]
status: done
agent: build_T009
base: 075e54b47bf8705fe1193cd79274ffba8c5402d8
worktree: null
task_branch: null
files:
  - src/panel/error-explainer-view.ts
  - apps/angular-ai-devtools/src/app/error-explainer.component.ts
  - scripts/error-explainer.test.mjs
---

# T009 — Make the error-explainer panel module compile in the extension build

## Context

`npx nx run angular-ai-devtools:build-extension` now regenerates the digest (the T007 wiring works), then fails
compiling the panel module that T003 and T008 landed: two imports end in `.ts`, which the Angular app tsconfig
does not allow, and a `findEntry ? …` test is always true. The module also carries speculative aliases and a
ternary with identical branches, which the unit slice never exercises because it runs under
`--experimental-strip-types` where the `.ts` extension is legal.

## Approach

- Import the main-world modules the way the existing panel code does, without a `.ts` extension.
- Replace the always-true function test with the real lookup, and collapse the identical-branch ternary.
- Delete the speculative alias exports and keep one clear API that the component and the unit slice use.
- Keep the component's behaviour: resolve the entry for the captured code, render it, call the model only on
  an explicit Explain action, and keep the explicit no-digest branch.
- Prove it by the extension build succeeding, not only by the unit slice.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. `npx nx run angular-ai-devtools:build-extension` completes with no TypeScript error from the panel module (SC4).
2. The module has no `.ts` import extension, no always-true condition, no identical-branch ternary and no speculative alias exports.
3. The panel still resolves and renders the digest entry, explains only on an explicit action, and keeps the explicit no-digest branch; the node:test slice passes and covers the resolved-entry and explicit-answer paths.

## Verify

```bash
node --experimental-strip-types --test scripts/error-explainer.test.mjs
```

Heavy: no

## Log

- created by build repair after the gate build failed on the panel module
- T009 implemented: imports without .ts, real lookup, collapsed ternary, removed aliases/default export; verify node test exit 0 and build exit 0. ready
- 2026-10-30 — orchestrator Verify (sidecar gsd-path-verify/task-t009-verify): pass, exit 0; output tail:
  ```
  ✔ buildErrorExplainFacts produces fact list (0.6479ms)
  ✔ empty state text (0.0759ms)
  ✔ no digest entry marker (0.0569ms)
  ✔ resolved digest entry path (0.1104ms)
  ✔ explicit answer path only calls model when a digest entry exists (0.06ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 182.9765
  ```
