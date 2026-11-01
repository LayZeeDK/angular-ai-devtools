---
id: T001
title: Add a deferred-error stale-view fixture route in spikes/ng222-app
wave: 1
deps: []
status: done
agent: build_T001
base: 6a2bf18b3a0ee6a34b339283965c662a144f6d38
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/stale-view-deferred-fixture.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - spikes/ng222-app/src/app/app.routes.test.mjs
---

# T001 — Add a deferred-error stale-view fixture route in spikes/ng222-app

## Context

M014 proves the RxJS interop claim on this repository's own dev-only `/stale-view` fixture. The existing `stale-view-fixture.ts` fires `subject.error` from a constructor `effect`, so by panel-attach time the Subject is already errored and no slice is captured (edge E3). The standing grant permits one more dev-only fixture route that keeps the Subject alive and defers `subject.error` until after the panel attaches, while keep-list Rule 2 (`subject.error` in the effect's debuggableFn source) still matches. No product behaviour changes; no portal source changes.

## Approach

- Add a new component file under `spikes/ng222-app/src/app/` that keeps a `Subject` alive, wires it through `toSignal`, and defers `subject.error` until after the panel attaches. The deferral must not remove the literal `subject.error` token from the effect's debuggable source, because `src/main-world/interop-keep-list.ts` Rule 2 matches on that token.
- Register the new component as one additional dev-only route in `spikes/ng222-app/src/app/app.routes.ts`; do not remove or alter the existing `/stale-view` route.
- Add a small node test at `spikes/ng222-app/src/app/app.routes.test.mjs` that reads `app.routes.ts` and asserts the new route is registered and the existing `/stale-view` route is retained.
- Do not modify `interop.component.ts`, `interop.service.ts`, or any panel behaviour.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `spikes/ng222-app/src/app/app.routes.ts` registers the new deferred fixture route in addition to the existing `/stale-view` route.
2. The new fixture keeps the `subject.error` token inside the effect's debuggable source so `isInteropNode` Rule 2 still matches.
3. The Subject is not errored before the panel attaches (deferral via a signal, timer, or explicit trigger), so a slice can be captured.
4. `spikes/ng222-app/src/app/app.routes.test.mjs` exists and asserts both routes are present.

## Verify

```bash
node --experimental-strip-types --test spikes/ng222-app/src/app/app.routes.test.mjs
```

Heavy: no

## Log

- created by planner
- 2026-10-31 — T001 — touched: spikes/ng222-app/src/app/stale-view-deferred-fixture.ts, spikes/ng222-app/src/app/app.routes.ts, spikes/ng222-app/src/app/app.routes.test.mjs — Verify: `node --experimental-strip-types --test spikes/ng222-app/src/app/app.routes.test.mjs` → 3 tests, 3 pass, 0 fail — RESULT: ready
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t001-verify): pass, exit 0; output tail:
  ```
  ✔ app.routes.ts registers the deferred stale-view fixture route (1.5141ms)
  ✔ app.routes.ts retains the existing /stale-view route (0.2669ms)
  ✔ app.routes.ts exports routes (0.1727ms)
  ℹ tests 3
  ℹ suites 0
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 297.7925
  ```
