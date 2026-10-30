---
id: T004
title: Per-page scan worker with supersession of in-flight scans
wave: 2
deps: [T003]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/stale-view-worker.js
  - apps/angular-ai-devtools/src/app/stale-view-scan.service.ts
  - tests/held-out/stale-view-worker-supersession.test.mjs
---

# T004 — Per-page scan worker with supersession of in-flight scans

## Context

The per-page stale-view scan runs in a dedicated worker owned by the panel/extension, not the page, so the UI is not blocked and two scans cannot interleave (Synthesis decision "Scan worker and supersession"). Starting a rescan while a scan is in flight supersedes the earlier scan: only the newest result renders, the superseded scan's result is discarded, and a superseded scan's result never interleaves with the newer one (Edge E6). The worker terminates on panel close and tab teardown, leaving no live worker (Prohibition N6).

## Approach

- Implement the per-page scan in a dedicated worker (`extension/stale-view-worker.js`) that consumes the scan result shape from T003 and returns an ordered `StaleViewFinding[]`.
- Each scan carries a cancellation token so a newer rescan supersedes the in-flight one and discards its result; only the newest result renders.
- The panel/extension owns the worker; the worker is terminated on panel close and tab teardown, leaving no live worker.
- Judgment prohibitions: never keep reading page source after the panel is closed or the inspected tab goes away (N6); never add page-side instrumentation (N5, inherited from T003).
- Low-confidence item (worker API and supersession token design) is exercised by the held-out test in this task's files.

## Interface contract

Shared N24 shapes (identical in every task that exchanges them):
- Scan finding: `{ nodeLabel: string; field: string; component: string | null; pattern: "direct write in subscribe callback" }` (`component` is the owning component name resolved via `lView[CONTEXT]`, or null reported as "no owning component").
- Angular version gate result: `{ supported: boolean; version: string }` (`supported` is false on 22.1.2 or older; `version` names the detected version).
- Plain-field confirmation: a write is accepted only when `ng.isSignal(instance[field]) === false`; otherwise it is skipped.
- Worker scan request: `{ token: string; graph: unknown }` where `graph` is the serialized signal graph captured by the agent.
- Worker scan result: `{ token: string; findings: StaleViewFinding[] }`; a result whose `token` does not match the latest issued token is discarded by the caller.
- Panel fact list sent to the Prompt API: `{ field: string; component: string | null; pattern: "direct write in subscribe callback" }`, where `component` is the owning component name or null (reported as "no owning component" in the UI), and all three values are plain text with escaping-safe shape.

## Intent coverage

- SC3

## Acceptance criteria

1. The per-page scan runs in a worker, not on the panel main thread and not in the page (SC3).
2. Starting a rescan while a scan is in flight supersedes the earlier scan: only the newest result renders, never an interleaving of two scans, and the superseded scan's result is discarded (Edge E6, held-out).
3. The worker terminates on panel close and tab teardown, leaving no live worker (Prohibition N6).

## Verify

```bash
node --experimental-strip-types --test tests/held-out/stale-view-worker-supersession.test.mjs
```

Heavy: no

## Log

- created by planner