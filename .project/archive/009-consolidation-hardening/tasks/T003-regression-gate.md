---
id: T003
title: Remove vacuous regression spec and land non-vacuous regression gate
wave: 2
deps: []
status: done
agent: build_T003
base: c165b14deb963191f5e2aa08e825200237c8bff2
worktree: null
task_branch: null
files:
  - src/regression.spec.ts
  - tests/held-out/e3-zero-skipped.test.mjs
  - tests/held-out/e4-idempotent-checks.test.mjs
---

# T003 — Remove vacuous regression spec and land non-vacuous regression gate

## Context

`src/regression.spec.ts` contains a single vacuous test (`expect(true).toBe(true)`). INTENT.md Corrections (2026-10-28) require removing it rather than repairing it. SC2 requires `npm run check` and `npm test` to pass with zero skipped and zero todo tests and the skills-mirror parity test to pass. E3: zero skipped/todo tests; E4: running `npm run check` and `npm test` twice yields the same pass counts and leaves tracked files unchanged.

## Approach

- Delete `src/regression.spec.ts`; do not replace it with another vacuous placeholder. Removal is recorded with the accepted reason (Correction 2026-10-28).
- N1 (SC2): do not make the suite green by deleting, skipping, or weakening a test. The only removal is the vacuous placeholder named in the Correction, with its reason recorded in the Log.
- Add held-out tests `tests/held-out/e3-zero-skipped.test.mjs` (asserts `npm test` reports 0 skipped and 0 todo) and `tests/held-out/e4-idempotent-checks.test.mjs` (asserts two consecutive `npm run check` + `npm test` runs yield identical pass counts and no tracked-file changes).
- Verify the full project gate passes in a fresh sidecar.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. `src/regression.spec.ts` is deleted and no reference to it remains.
2. `npm run check` exits 0 and `npm test` passes with 0 skipped and 0 todo.
3. The skills-mirror parity test passes.
4. The held-out E3 test proves `npm test` reports 0 skipped and 0 todo, and the held-out E4 test proves two consecutive `npm run check` + `npm test` runs yield the same pass counts and leave tracked files unchanged.
5. Two consecutive full runs leave tracked files unchanged (E4).

## Verify

```bash
npm ci && npm test && node --test tests/held-out/e3-zero-skipped.test.mjs tests/held-out/e4-idempotent-checks.test.mjs
```

Heavy: yes

## Log

- created by planner
- reference grep for `regression.spec`: only `.project/*`, `.project/archive/*`, research, review, INTENT, scratchpad entries; no src/test code references. Deleted `src/regression.spec.ts`.
- e3 tail: ✔ E3: npm test reports 0 skipped and 0 todo (2920ms); ℹ pass 1, fail 0, skipped 0, todo 0.
- e4 syntax check: `node --check tests/held-out/e4-idempotent-checks.test.mjs` exit 0.
- ready
- retry: scrubbed NODE_TEST_CONTEXT/NODE_TEST_WORKER_ID in both held-out tests; e3 before 2.9s (degenerate) -> after 12.1s (real run); e4 tail: ✔ E4: two consecutive npm run check + npm test are idempotent (45004.8071ms); ℹ pass 1, fail 0, skipped 0, todo 0; ℹ duration_ms 45161.3756
- ready
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): fail, exit 1; output tail:
  ```
    AssertionError [ERR_ASSERTION]: E4: first npm run check failed
    
    1 !== 0
    
        at TestContext.<anonymous> (file:///C:/Users/LarsGyrupBrinkNielse/.gsd-path/projects/d10fb97cec6c7ac7/8919d4cefeb4a7e5/verify/task-t003-verify/tests/held-out/e4-idempotent-checks.test.mjs:40:10)
        at Test.runInAsyncScope (node:async_hooks:227:14)
        at Test.run (node:internal/test_runner/test:1402:25)
        at Test.start (node:internal/test_runner/test:1262:17)
        at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
      generatedMessage: false,
      code: 'ERR_ASSERTION',
      actual: 1,
      expected: 0,
      operator: 'strictEqual',
      diff: 'simple'
    }
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  ```
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): fail, exit 1; output tail:
  ```
    AssertionError [ERR_ASSERTION]: E4: first npm run check failed
    
    1 !== 0
    
        at TestContext.<anonymous> (file:///C:/Users/LarsGyrupBrinkNielse/.gsd-path/projects/d10fb97cec6c7ac7/8919d4cefeb4a7e5/verify/task-t003-verify/tests/held-out/e4-idempotent-checks.test.mjs:40:10)
        at Test.runInAsyncScope (node:async_hooks:227:14)
        at Test.run (node:internal/test_runner/test:1402:25)
        at Test.start (node:internal/test_runner/test:1262:17)
        at startSubtestAfterBootstrap (node:internal/test_runner/harness:387:17) {
      generatedMessage: false,
      code: 'ERR_ASSERTION',
      actual: 1,
      expected: 0,
      operator: 'strictEqual',
      diff: 'simple'
    }
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  ```
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 52973.8213
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run test
  npm notice run node --experimental-strip-types --test "scripts/**/*.test.mjs" "extension/**/*.test.mjs" && node scripts/run-user-scope-tests.mjs && npm run test:skills
  npm notice run test:skills
  npm notice run node --experimental-strip-types --test ".claude/skills/**/*.test.mjs" ".commandcode/skills/**/*.test.mjs"
  ```
