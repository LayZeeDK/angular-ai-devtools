---
id: T007
title: Verify held-out edges E1-E6
wave: 3
deps: [T001, T002, T003, T004, T005, T006]
status: done
agent: build_T007
base: f39830ea5b71f13c72e3e1fda5abd309cffc2ba8
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/context-budget.spec.ts
  - apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts
  - apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
---

# T007 — Verify held-out edges E1-E6

## Context

This task owns the held-out edges E1-E6 end to end and nothing else. The SC5 gates (npm run check, npm test, the bundle-budget policy) belong to T008. It does not modify the pinned tool registry module.

## Approach

- Write the E1-E6 tests into the five declared spec files, one edge per test, and record their results.
- E1 and E2 live in `message-ring-buffer.spec.ts`; E3 and E4 in `job-handles.spec.ts` and `chunked-fact-list-job.spec.ts`; E5 in `clone-measurement.spec.ts`; E6 in `chunked-fact-list-job.spec.ts`.
- Keep every existing test green; add tests, do not rewrite the ones the feature tasks already proved.
- Do not modify the pinned tool registry module.
- Do not weaken any check or test to reach green.

## Interface contract

None

## Intent coverage

- SC1
- SC2
- SC3
- SC4

## Acceptance criteria

1. E1: the 200-message buffer is filled, the panel navigates, and the oldest surviving entry is read back and compared to the entry written first.
2. E2: a buffer that has never filled and a buffer with exactly one entry both answer without inventing a missing neighbour.
3. E3: cancelling the same job twice reports one cancellation and leaves no partial fact list in the panel's store.
4. E4: cancellation lands between two chunks, and the last completed chunk is not presented as a complete list.
5. E5: the clone measurement is a committed artifact with the observed count, not a number restated in prose.
6. E6: a fact list over the cap is chunked, and the chunk count the panel receives equals the number of chunks the job emitted.
7. The pinned tool registry module is unchanged.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
```

Heavy: yes

## Log

- created by planner
- 2026-11-02 — plan repair: the SC5 gate criteria (npm run check, npm test, extension build, registry) moved to the new T008 because verify-weight returned CHUNK for this task at ten acceptance criteria. This task now owns E1-E6 only. Recorded in STATE at build/blocked before the repair.
- 2026-11-02 — E1-E6 added, one test per edge, each title verbatim, each asserting a real observable; every pre-existing test left as it was. E1 and E2 in message-ring-buffer.spec.ts: a buffer filled to the cap reads its oldest surviving entry back by position after `navigate` and compares it to the entry written first (`toBe` the same entry, history-only under `factAt`), plus an overflowing buffer where that first entry is evicted so the same comparison separates rather than equates; E2 reads both ends of a buffer that never filled and of a single-entry buffer and finds no invented neighbour. E3 in jobs/job-handles.spec.ts: the real ChunkedFactListJob is cancelled twice mid-flight through the registry — one abort event, the same progress signal (the panel store) carries one cancellation, the payload has no `chunks` key and the fact list the panel would keep stays empty. E4 in jobs/chunked-fact-list-job.spec.ts: the cancel lands at chunksDone 1 of 3 (strictly between the first and the last chunk), the cancelled payload carries no list at all (no fact text in it) and a later macrotask shows no further chunk emitted. E5 in jobs/clone-measurement.spec.ts: re-measures the fresh-session count through the real service and checks the committed artifact's raw bytes (`"observed": 1`, samples equal to the spies, method/command/measuredAt/base attributable and reproducible). E6 in jobs/chunked-fact-list-job.spec.ts: two over-cap list sizes where chunkCount == chunks.length == the registry total == the plan's count, and the second count differs from the first. context-budget.spec.ts needed no change: no edge is assigned to it and CHUNK_TOKEN_CAP is untouched.
- 2026-11-02 — type check: `npx tsc -p apps/angular-ai-devtools/tsconfig.check.json` exit 0.
- 2026-11-02 — Verify (cwd = the recorded worktree realpath, NX_DAEMON=false, `npm ci --include=dev && npx nx run angular-ai-devtools:test --include=...` over the five declared specs): exit 0. 5 test files passed, 43 tests passed — message-ring-buffer 14, context-budget 12, clone-measurement 2, job-handles 7, chunked-fact-list-job 8.
- 2026-11-02 — result: E1-E6 present with verbatim titles, no test weakened, Verify exit 0, ready
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  [2mNx read the output from the cache instead of running the command for 1 out of 1 tasks.[22m
  
    Run duration:      45ms
    Cache:             1/1 hit (100%)
    Critical path:     1ms (1 task)
    Recoverable time:  <1ms
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
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
  ```
- 2026-11-02 — orchestrator regression Verify of T001 (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      5.0s
    Cache:             0/1 hit (0%)
    Critical path:     4.7s (1 task)
    Recoverable time:  <1ms
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
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/context-budget.spec.ts
  ```
- 2026-11-02 — orchestrator regression Verify of T002 (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      4.6s
    Cache:             0/1 hit (0%)
    Critical path:     4.5s (1 task)
    Recoverable time:  <1ms
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
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
  ```
- 2026-11-02 — orchestrator regression Verify of T004 (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      5.2s
    Cache:             0/1 hit (0%)
    Critical path:     4.9s (1 task)
    Recoverable time:  <1ms
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
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/job-handles.spec.ts --include=apps/angular-ai-devtools/src/app/jobs/chunked-fact-list-job.spec.ts
  ```
- 2026-11-02 — orchestrator regression Verify of T006 (isolate gsd-path-task/T007): pass, exit 0; output tail:
  ```
  
  [7m[1m[32m NX [39m[22m[27m  [32mSuccessfully ran target [1mtest[22m for project angular-ai-devtools[39m
  
  
    Run duration:      5.0s
    Cache:             0/1 hit (0%)
    Critical path:     4.8s (1 task)
    Recoverable time:  <1ms
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
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/jobs/clone-measurement.spec.ts
  ```
