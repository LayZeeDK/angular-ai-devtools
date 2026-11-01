---
id: T001
title: Tighten the /stale-view route assertion against its prefix-sibling
wave: 1
deps: []
status: done
agent: build_T001
base: 67ef91215ce98c1fa3c972fccebb49f25b96aa72
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/app.routes.test.mjs
---

# T001 — Tighten the /stale-view route assertion against its prefix-sibling

## Context

`spikes/ng222-app/src/app/app.routes.ts` registers both `stale-view` and `stale-view-deferred`. Commit `2c97f69` narrowed one assertion to `/['"]stale-view['"]/`, which no longer matches the deferred name, but nothing proves that narrowing: if a later edit loosened the pattern back to `/stale-view/`, the test would still pass and the deferred route would satisfy the retained-route assertion again. INTENT SC3 requires the test to fail when the `/stale-view` assertion is given the deferred route's name and to pass as written. Held-out edge E6 records the adjacency: `stale-view-deferred` is a prefix-sibling of `stale-view`, so a substring match cannot distinguish them.

The test file is plain `node:test` reading the route source as text; it needs no package dependencies, which is why its Verify is a bare `node --test`.

## Approach

- Keep the existing assertion that the real route is registered, then add one assertion that the pattern the test relies on does **not** match the deferred route name. The cleanest shape is to hoist the pattern into a constant, assert it matches `'stale-view'`, and assert it does not match `'stale-view-deferred'`.
- Make the negative direction a real test case, not a comment: a test named for the adjacency that would fail if the pattern were loosened to `/stale-view/`.
- Do not touch `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` (prohibition N3) and do not change any route or fixture source; this task edits the test only.
- Do not weaken the test to accept both names (prohibition N4).

## Interface contract

- None

## Intent coverage

- SC3

## Acceptance criteria

1. The test file asserts the `/stale-view` pattern matches `'stale-view'` and does **not** match `'stale-view-deferred'`, so E6 holds in both directions.
2. A test case exists whose name states the adjacency, and it fails if the pattern is loosened to `/stale-view/`.
3. The existing assertions about the registered routes still pass unchanged, and no route or fixture source file is modified (N4).

## Verify

```bash
node --check spikes/ng222-app/src/app/app.routes.test.mjs && node --test spikes/ng222-app/src/app/app.routes.test.mjs
```

Heavy: no

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — orchestrator plan repair: rewrote the task so the held-out edge E6 is owned here (SC3) with a fenced, runnable Verify; the planner's round-two output had mangled the code fence to a single backtick and had wired E6 to a task that did not exist.
- 2026-11-01 — Hoisted `/['"]stale-view['"]/` into `staleViewRoutePattern`, asserted it matches `'stale-view'`, added test "app.routes.ts /stale-view is adjacent to /stale-view-deferred and does not match the deferred route" asserting no match for `'stale-view-deferred'`; all existing assertions unchanged, no route/fixture sources modified. Verify: exit code 0 — `node --check spikes/ng222-app/src/app/app.routes.test.mjs && node --test spikes/ng222-app/src/app/app.routes.test.mjs` passed (4/4). If loosened to `/stale-view/`, the adjacency test asserting `assert.doesNotMatch("'stale-view-deferred'", /stale-view/)` would fail (substring match would accept the prefix-sibling). ready
- 2026-11-01 — orchestrator Verify (isolate gsd-path-task/T001): pass, exit 0; output tail:
  ```
  ✔ app.routes.ts registers the deferred stale-view fixture route (1.0995ms)
  ✔ app.routes.ts retains the existing /stale-view route (0.2188ms)
  ✔ app.routes.ts /stale-view is adjacent to /stale-view-deferred and does not match the deferred route (0.0725ms)
  ✔ app.routes.ts exports routes (0.116ms)
  ℹ tests 4
  ℹ suites 0
  ℹ pass 4
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 133.0918
  ```
