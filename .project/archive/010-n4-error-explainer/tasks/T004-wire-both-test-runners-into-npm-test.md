---
id: T004
title: Wire both test runners into npm test
wave: 3
deps: []
status: done
agent: build_T004
base: 5183252a1a204248caf811a3356b609f40e2c979
worktree: null
task_branch: null
files:
  - package.json
  - scripts/npm-test-guard.test.mjs
---

# T004 — Wire both test runners into npm test

## Context

SC7 requires the declared verification gate to name and run both test runners: `npm test` must execute the app's `*.spec.ts` suite through the Nx unit-test target (`angular-ai-devtools:test`) as well as the `node:test` suites. Today `npm test` globs only `scripts/` and `extension/` plus user-scope and skill tests and never runs the Angular app specs, so a green `npm test` does not cover them. Add a `test:app` script for the Nx unit-test target and invoke it from `npm test`. N9 judgment prohibition: do not claim both runners ran when only one ran; the evidence must name each runner and its own exit status or parsed count.

## Approach

- Add a `test:app` npm script invoking `npx nx run angular-ai-devtools:test`.
- Chain it into the `test` script so `npm test` runs the `node:test` suites and then the app specs.
- Ensure the combined command exits non-zero if either runner fails.
- N9 judgment prohibition: the claim record (FINAL.md) must name each runner and its own exit status or parsed count; a check output is never cited as a verdict.

## Interface contract

None

## Intent coverage

- SC7

## Acceptance criteria

1. `npm test` executes the app's `*.spec.ts` suite through `npx nx run angular-ai-devtools:test` in addition to the `node:test` suites (SC7).
2. A failure in either runner makes `npm test` exit non-zero.
3. The evidence for the gate names each runner and its own exit status or parsed count (N9).

## Verify

```bash
node --experimental-strip-types --test scripts/npm-test-guard.test.mjs
```

Heavy: no

## Log

- created by planner
- implemented package.json test:app + chained into test; guard test passed exit 0 — ready
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T004): pass, exit 0; output tail:
  ```
  ✔ test script invokes test:app (0.9489ms)
  ✔ test:app script invokes the Nx unit-test target for angular-ai-devtools (0.153ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 115.961
  ```
