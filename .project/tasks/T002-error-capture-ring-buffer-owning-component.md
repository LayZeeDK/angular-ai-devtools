---
id: T002
title: Capture errors, map to owning component, bounded ring buffer
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - src/main-world/error-capture.ts
  - scripts/error-capture.test.mjs
  - extension/agent-main.js
---

# T002 — Capture errors, map to owning component, bounded ring buffer

## Context

M010 (N4) must capture `NG0xxx` and uncaught console errors from a supported dev-mode Angular app and resolve each to its owning component through `ng.getOwningComponent`. Capture runs through the shared MAIN-world page agent (`extension/agent-main.js`), which also serves N1/N2/N3, so a defect here can regress those flows. `ng.getOwningComponent` is Tier 0 and only present in dev mode. The ring buffer is bounded and drops oldest first (E3, held-out). An uncaught error with no owning component reports "no owning component" and is never attributed to an unrelated component (E1). With zero captured errors the panel renders an explicit empty state (E2).

## Approach

- Add `src/main-world/error-capture.ts` (pure, unit-testable logic) implementing: hooks for `console.error`, `window.onerror` and `unhandledrejection` feeding a bounded ring buffer; owning-component resolution via `ng.getOwningComponent`; the no-owner case reporting "no owning component".
- Wire the hooks at `document_start` through `extension/agent-main.js` without widening the existing message contract in a way that breaks N1/N2/N3 (regression protection is an explicit acceptance criterion).
- Ring buffer is bounded with a fixed capacity and drops oldest first; a named test pins capacity and retained order (E3, held-out).
- N5 judgment prohibition: never attribute an error to a component that did not throw it; the reviewer checks the mapping path from `ng.getOwningComponent` to the displayed component. Document this path in the implementation and tests.
- E1/E2 boundary/empty behaviour is covered by unit tests.

## Interface contract

Shared N4 shapes (identical in every task that exchanges them):
- Digest entry: `{ code: string; title: string; body: string }` (`code` is the error code; `body` is the trimmed explanation, at most 150 tokens, license/copyright removed; a trimmed entry ends with a marker).
- Top-level digest: `{ version: string; entries: DigestEntry[] }`.
- Captured error: `{ code: string | null; message: string; component: string | null; timestamp: number }` (`code` is the extracted `NG0xxx` code or null; `component` is the owning component name via `ng.getOwningComponent`, or null reported as "no owning component").
- Ring buffer: fixed capacity `CAPACITY` exported by the error-capture module; retains the most recent `CAPACITY` entries in insertion order, dropping oldest first.
- Panel fact list sent to the Prompt API: `{ code: string; component: string | null; digest: string }`, where `digest` is the matching digest entry's `body` or the explicit "no digest entry" marker when absent.

## Intent coverage

- SC1

## Acceptance criteria

1. The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent` (SC1).
2. An uncaught error with no owning component reports "no owning component" and is never attributed to an unrelated component (E1).
3. With zero captured errors the panel renders an explicit empty state, not a blank or stale list (E2).
4. The ring buffer is bounded and drops oldest first; capacity and retained order are pinned by a named test (E3, held-out).
5. N1/N2/N3 panel flows, the Angular-version explainer, extension messaging and tab filtering remain unbroken.

## Verify

```bash
node --experimental-strip-types --test scripts/error-capture.test.mjs
```

Heavy: no

## Log

- created by planner