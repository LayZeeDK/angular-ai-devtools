---
id: T012
title: Align state message contract between producer and consumer
wave: 5
deps: [T011]
status: done
agent: build_T012
base: 45528b5cf77b969bd62043062e6cd3c0ecc01400
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/extension-message.service.ts
  - apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
---

# T012 — Align state message contract between producer and consumer

## Context

M004 F2 = M005 F1 (blocking, one defect): `apps/angular-ai-devtools/src/app/extension-message.service.ts:51` keys off `msg.notSupported` while `extension/agent-main.js:116-123` emits `supported`/`reason`. Remedy: treat `msg.supported === false` and read `msg.reason`. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix. N3 (SC3): panel stays panel-local Prompt API.

## Approach

- Change the state handling in `extension-message.service.ts` to key off `msg.supported === false` and surface `msg.reason`, matching the producer's `supported`/`reason` emission.
- Keep the panel marking the page unsupported when `supported === false` (M005 F1) so unsupported pages are reported.
- Coordinate the exact seam with T011 via the shared Interface contract; no other files change.

## Interface contract

State message: producer emits `{ supported: boolean, reason?: string }`; consumer treats `msg.supported === false` and reads `msg.reason`. Field name `supported` (not `notSupported`).

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. `extension-message.service.ts` treats `msg.supported === false` and reads `msg.reason`; no reference to `msg.notSupported` remains.
2. The panel marks the page unsupported with the reason when `supported === false`.
3. Type check and the service's tests pass.

## Verify

```bash
npm ci && npm run check && npx nx test angular-ai-devtools
```

Heavy: no

## Log

- created by planner
- build_T012: aligned consumer to supported/reason; tests pass (nx test 44/44, npm run check ok)
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t012-verify): fail, exit 1; output tail:
  ```
  
  ✖ failing tests:
  
  test at apps\angular-ai-devtools\src\app\extension-message.service.spec.ts:1:1
  ✖ apps\angular-ai-devtools\src\app\extension-message.service.spec.ts (473.3417ms)
    'test failed'
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
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t012-verify): pass, exit 0; output tail:
  ```
    Run duration:      279ms
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
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run npx
  npm notice run nx test angular-ai-devtools
  ```
- 2026-10-29 — orchestrator plan-defect repair: the Verify named `node --test apps/angular-ai-devtools/src/app/extension-message.service.spec.ts`, but that file is a Vitest spec served by the app's `@angular/build:unit-test` target and cannot run under `node --test` (ERR_MODULE_NOT_FOUND). The real runner was confirmed in the primary: `npx nx test angular-ai-devtools` → 10 files, 44 tests pass. Verify repaired to `npm ci && npm run check && npx nx test angular-ai-devtools`. Attempt 1's source change was reverted because the task body is append-only and a landed attempt cannot absorb a Verify edit; the task is re-dispatched from a clean base.
- 2026-10-29 — build_T012 attempt 2: aligned consumer to supported/reason; added state spec case; Verify `npm ci && npm run check && npx nx test angular-ai-devtools` pass (43 tests)
- 2026-10-29 — orchestrator Verify (sidecar gsd-path-verify/task-t012-verify): pass, exit 0; output tail:
  ```
    Run duration:      278ms
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
  npm notice run check
  npm notice run tsc -p tsconfig.json && npm run check:skills
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run npx
  npm notice run nx test angular-ai-devtools
  ```
