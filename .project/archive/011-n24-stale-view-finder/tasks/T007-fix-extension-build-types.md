---
id: T007
title: Fix the extension-build type errors in the stale-view scan module
wave: 4
deps: [T003]
status: done
agent: build_T007
base: ae89ebb9360b9fa92539d2ac0e5855ad1cee5948
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
- 2026-10-30 - narrowed the RegExpExecArray capture in matchDirectWrites (const field = m[1]; if (field === undefined) continue;); build-extension exits 0 and the four stale-view held-out tests pass; ready
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T007): fail, exit 1; output tail:
  ```
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  
  [7m[1m[31m NX [39m[22m[27m  [31mCould not find Nx modules at "C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T007".[39m
  
  Have you run [1m[37mnpm/yarn install[39m[22m?
  ```
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  ✔ matches this.field = with arbitrary whitespace and newlines (1.8597ms)
  ✔ matches .set( and .update( forms (0.0925ms)
  ✔ identifier is whole, never substring (0.0967ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 181.9301
  npm notice run npx
  npm notice run nx run angular-ai-devtools:build-extension
  
  [7m[1m[33m NX [39m[22m[27m  [33mNx detected a flaky task[39m
  
    angular-ai-devtools:build-extension
  
  Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
  ```
- 2026-10-30 — orchestrator regression Verify of T003 (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  ✔ one callback writing the same field twice yields one finding (1.2571ms)
  ✔ findings follow template-node traversal order (3.2083ms)
  ✔ Angular 22.1.2 or older is unsupported and names the version (1.0002ms)
  ✔ Angular 22.1.3 and newer are supported (0.1489ms)
  ✔ matches this.field = with arbitrary whitespace and newlines (1.9196ms)
  ✔ matches .set( and .update( forms (0.0906ms)
  ✔ identifier is whole, never substring (0.0883ms)
  ℹ tests 7
  ℹ suites 0
  ℹ pass 7
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 399.2172
  ```
