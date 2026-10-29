---
id: T012
title: Align state message contract between producer and consumer
wave: 5
deps: [T011]
status: pending
agent: null
base: null
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
npm ci && npm run check && node --test apps/angular-ai-devtools/src/app/extension-message.service.spec.ts
```

Heavy: no

## Log

- created by planner