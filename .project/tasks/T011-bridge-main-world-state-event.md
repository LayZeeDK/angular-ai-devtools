---
id: T011
title: Forward angular-ai:state from relay.js to the panel
wave: 5
deps: []
status: pending
agent: null
base: null
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