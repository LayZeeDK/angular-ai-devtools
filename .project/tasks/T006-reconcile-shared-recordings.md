---
id: T006
title: Reconcile the shared recordings M023 invalidated
wave: 2
deps: [T001, T003, T004]
status: in-progress
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
  - research/raw/m022-ng-context.json
  - scripts/overlay-verdict-claims.test.mjs
  - research/raw/m022-verdict-claims.json
---

# T006 — Reconcile the shared recordings M023 invalidated

## Context

T005's gate found the whole red while every part was green. Three shared recordings were invalidated by
earlier tasks and no task owned their reconciliation: T001 installed three component packages and T003
consumed them, so the recorded development bytes no longer match the emitted ones; T004 regenerated the
docs audit from fresh fragments, which dropped `docs/autonomy-gaps.md` from the descriptive list the
repository pins; and `scripts/overlay-verdict-claims.test.mjs` compares M022's recorded criterion against
whatever `.project/intent/INTENT.md` holds **now**, so it fails by construction once a new milestone is
defined.

## Approach

1. Add `docs/autonomy-gaps.md` back to the audit's `## Descriptive docs` with a tally that agrees with the
   document, then re-run `scripts/autonomy-gaps.test.mjs`. Do not edit that test.
2. Re-record `research/raw/m022-ng-context.json` from the builds emitted at this head — the command,
   the bundle names, the byte counts, the `__ngContext__` write sites and the `window.ng` surface for
   both configurations. Do not edit `scripts/ng-context-dev-build.test.mjs`; it is the pin.
3. Point `scripts/overlay-verdict-claims.test.mjs` at the intent that produced the recording — the
   archived `.project/archive/022-in-page-overlay/intent/INTENT.md` — so a later milestone's criteria
   cannot redden it. The recorded rows in `research/raw/m022-verdict-claims.json` stay as they are.
4. Re-run the docs-audit gate and the disposition suite; they must stay green while the audit changes.

## Interface contract

None

## Intent coverage

- SC4 — `npm run check` and `npm test` pass at the head.

## Acceptance criteria

1. The audit's descriptive list names `docs/autonomy-gaps.md` and its tally agrees, so `scripts/autonomy-gaps.test.mjs` passes.
2. `research/raw/m022-ng-context.json` records the development and production bundles measured at this head, and `scripts/ng-context-dev-build.test.mjs` passes with that test unchanged.
3. `scripts/overlay-verdict-claims.test.mjs` reads the archived M022 intent rather than the current one, and its four assertions pass.
4. `scripts/docs-audit-disposition.test.mjs` still passes, so the audit's coverage, tallies, queue, exemptions and rulings order all still hold.

## Verify

```bash
npm ci --include=dev; npm --prefix spikes/ng222-app ci --include=dev; node --test scripts/autonomy-gaps.test.mjs scripts/ng-context-dev-build.test.mjs scripts/overlay-verdict-claims.test.mjs scripts/docs-audit-disposition.test.mjs
```

## Log

- created by orchestrator (T005 gate: three shared recordings invalidated)
- T006 ready: autonomy-gaps, ng-context, overlay, docs-audit-disposition green; dev 1899687 B, prod 383132 B
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): fail, exit 1; output tail:
  ```
        at Test.postRun (node:internal/test_runner/test:1542:19)
        at Test.run (node:internal/test_runner/test:1467:12)
        at async Test.processPendingSubtests (node:internal/test_runner/test:974:7) {
      generatedMessage: false,
      code: 'ERR_ASSERTION',
      actual: 'the fixture install is absent (spikes/ng222-app/node_modules); run npm --prefix spikes/ng222-app ci --include=dev',
      expected: false,
      operator: 'strictEqual',
      diff: 'simple'
    }
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
  ```
- 2026-11-03 — orchestrator Verify (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 21933.9154
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
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  ```
- 2026-11-03 — orchestrator regression Verify of T001 (sidecar gsd-path-verify/task-t006-verify): pass, exit 0; output tail:
  ```
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 22984.3866
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
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  ```
