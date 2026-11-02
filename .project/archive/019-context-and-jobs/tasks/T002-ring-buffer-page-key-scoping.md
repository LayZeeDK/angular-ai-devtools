---
id: T002
title: Add the 200-message ring buffer keyed by pageKey
wave: 1
deps: []
status: done
agent: build_T002
base: f8a93e80245d14d724842f389522252adb062a01
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/message-ring-buffer.ts
  - apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
---

# T002 — Add the 200-message ring buffer keyed by pageKey

## Context

The panel has no history array or ring buffer today. This task adds an Angular store/service holding up to 200 messages, tagged with pageKey = tabId:navigationId, with a live currentPageKey that updates on navigation. The oldest entry stays readable by position after navigation, but an entry is only served as a current-page fact when its pageKey equals currentPageKey.

## Approach

- Location is the panel (an Angular store/service), not a worker, so it outlives an inspected-page navigation.
- Each entry is tagged with the page it was filled from; the store tracks a live currentPageKey that updates on navigation.
- Eviction is FIFO at capacity 200; stale-key entries are pruned lazily on the next write rather than on navigation.
- An empty buffer and a buffer with exactly one entry answer without inventing a missing neighbour.
- A stale page identity must never answer for the live panel after navigation.

## Interface contract

None

## Intent coverage

- SC1

## Acceptance criteria

1. The buffer holds at most 200 entries and evicts the oldest on overflow (FIFO).
2. After navigation the oldest surviving entry remains readable by position.
3. An entry is served as a current-page fact only when its pageKey equals the live currentPageKey.
4. An empty buffer and a single-entry buffer answer without inventing a missing neighbour.
5. No stale page identity answers for the live panel after navigation.

## Verify

```bash
npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts
```

Heavy: no

## Log

- created by planner
- Implemented `MessageRingBuffer` (`apps/angular-ai-devtools/src/app/message-ring-buffer.ts`): `RING_BUFFER_CAPACITY` 200, `pageKeyFor(tabId, navigationId)` = `tabId:navigationId`, one live `currentPageKey` moved only by `navigate`, signal reads `entries` / `size` / `oldest` / `newest` / `currentPageEntries`, and `push` (FIFO eviction, 1-based stable write positions), `at(position)`, `factAt(position)`, `neighbours`, `factNeighbours`. Stale-key entries are pruned on the next write, never on navigation, and only `factAt` / `currentPageEntries` may serve a live fact, so a stale page identity answers `null` after navigation (AC3, AC5/N3). Empty and single-entry buffers answer `null` neighbours rather than inventing one (AC4). `@angular/core` only; no dependency added (AR-1).
- `apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts` pins AC1–AC5 in 12 tests, including the 200+5 FIFO overflow, the post-navigation position read-back, the prune-on-write rule, stale-key fact scoping and the empty/single-entry answers.
- Verify: `npm ci --include=dev && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/message-ring-buffer.spec.ts` — run at the recorded worktree `C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\task\T002`, exit code 0, 12/12 tests passed. Also green there: `npm run test:app` (18 files, 164 tests) and `npm run check:panel`.
- Environment note for later waves: the junction alias `C:\Users\LarsGyrupBrinkNielse\.gsd-path\wt\M019-T002` cannot run this target at all. `@angular/build` resolves real paths, so with a cold Nx cache the run fails with `File '..\..\projects\...\message-ring-buffer.spec.ts' not found in TypeScript compilation`; the pre-existing `extension-message.service.spec.ts` fails identically through the junction, so this is isolation, not this task. Run Verify through the canonical worktree path above. The alias and the real path also share one Nx daemon socket: a daemon started from one path refuses the other until `npx nx daemon --stop`.
- ready
- 2026-11-02 — orchestrator Verify (isolate gsd-path-task/T002): pass, exit 0; output tail:
  ```
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
  
  [7m[1m[33m NX [39m[22m[27m  [33mNx detected a flaky task[39m
  
    angular-ai-devtools:test
  
  Flaky tasks can disrupt your CI pipeline. Automatically retry them with Nx Cloud. Learn more at https://nx.dev/ci/features/flaky-tasks
  ```
