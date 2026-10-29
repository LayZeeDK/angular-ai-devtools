---
id: T011
title: Forward angular-ai:state from relay.js to the panel
wave: 5
deps: []
status: done
agent: build_T011
base: eec3c0f8f90259aed91e9b63e91bb2920fce0772
worktree: null
task_branch: null
files:
  - extension/relay.js
  - extension/relay.test.mjs
---

# T011 — Forward angular-ai:state from relay.js to the panel

## Context

M004 F1 (blocking): `extension/relay.js:6` never forwards `angular-ai:state`, so the panel never receives supported/not-supported state. Remedy: add a `window.addEventListener('angular-ai:state', ...)` forwarding `e.detail`. SC1: every defect found by the hardening review is fixed or explicitly accepted with a written reason. SC6: no new feature or public behavior change. N2 (SC6): no public behavior change under a fix. N3 (SC3): panel stays panel-local Prompt API.

## Approach

- Add a listener in `extension/relay.js` that forwards the `angular-ai:state` window event (its `detail`) into the extension messaging path the panel consumes.
- Align with the state contract consumed by `apps/angular-ai-devtools/src/app/extension-message.service.ts` (see T012); the forwarded payload carries `supported`/`reason`.
- No new host permission and no page/content-script Prompt API (N3).

## Interface contract

State message: producer emits `{ supported: boolean, reason?: string }`; consumer treats `msg.supported === false` and reads `msg.reason`. Field name `supported` (not `notSupported`).

## Intent coverage

- SC1
- SC6

## Acceptance criteria

1. `extension/relay.js` forwards `angular-ai:state` events, carrying `e.detail`, to the panel-facing message channel.
2. The forwarded payload uses the `supported`/`reason` shape.
3. No new host permission or page/content-script Prompt API is introduced (N3).

## Verify

```bash
npm ci && node --test extension/relay.test.mjs
```

Heavy: no

## Log

- created by planner
- implemented: added angular-ai:state listener in extension/relay.js forwarding e.detail; added extension/relay.test.mjs; verify pass (npm ci && node --test extension/relay.test.mjs)
- 2026-10-29 — orchestrator Verify (isolate gsd-path-task/T011): pass, exit 0; output tail:
  ```
    ✔ forwards supported=true state (0.6514ms)
  ✔ relay.js (3.3404ms)
  ℹ tests 2
  ℹ suites 1
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 162.3375
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
