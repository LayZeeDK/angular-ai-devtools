---
id: T009
title: Make the error-explainer panel module compile in the extension build
wave: 2
deps: [T008]
status: pending
agent: null
base: null
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
