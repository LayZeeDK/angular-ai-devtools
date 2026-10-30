---
id: T007
title: Fix the extension-build type errors in the stale-view scan module
wave: 5
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/main-world/stale-view-scan.ts
  - tests/held-out/stale-view-write-regex.test.mjs
---

# T007 — Fix the extension-build type errors in the stale-view scan module

## Context

`npx nx run angular-ai-devtools:build-extension` fails with three `TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'` errors in `src/main-world/stale-view-scan.ts`, the module T003 landed. `npm run check` passes because the root tsconfig does not enable `noUncheckedIndexedAccess` for this path, but the application build does, so the milestone's project Verify (`npm run check && npm test && npx nx run angular-ai-devtools:build-extension`) fails. T006's end-to-end browser verification could not run because the extension cannot be built, so all four model instances were recorded as could-not-run. This task removes the build blocker without changing the scan's behavior.

## Approach

- Reproduce with `npx nx run angular-ai-devtools:build-extension` and read every `TS2345` it reports.
- Fix each at its source (for example, narrow the `RegExpExecArray` capture before use: `const field = m[1]; if (field === undefined) continue;`), keeping the existing exported names and semantics intact.
- Do not weaken the regex, drop a validation, or add `as` casts that hide an undefined. Keep whole-identifier matching, whitespace/newline tolerance, dedup and ordering exactly as T003's held-out tests assert them.
- Do not touch `extension/agent-main.js` or any other module; this is a type-correctness repair in one file.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `npx nx run angular-ai-devtools:build-extension` exits 0 with no `TS2345` error.
2. The four stale-view held-out tests still pass: `stale-view-version-gate`, `stale-view-write-regex`, `stale-view-ordering` and `stale-view-dedup`.
3. The exported API and matching semantics of `src/main-world/stale-view-scan.ts` are unchanged: no regex weakening and no cast that hides a possibly-undefined capture.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension && node --experimental-strip-types --test tests/held-out/stale-view-write-regex.test.mjs
```

Heavy: no

## Log

- created by build repair (2026-10-30): the extension build fails with three TS2345 errors in the T003 module, blocking T006's browser verification and the project Verify
