---
id: T009
title: Add the dev-only stale-view route to the counter fixture
wave: 4
deps: []
status: done
agent: build_T009
base: bbeac7b56b2aa466af04fc5f25c3761b05b43431
worktree: null
task_branch: null
files:
  - spikes/ng222-app/src/app/stale-view-fixture.ts
  - spikes/ng222-app/src/app/app.routes.ts
  - spikes/ng222-app/src/app/stale-view-fixture.spec.ts
  - scripts/stale-view-fixture.test.mjs
---

# T009 — Add the dev-only stale-view route to the counter fixture

## Context

SC1 needs a page where a plain field is written in a subscribe callback, and the counter fixture has no `subscribe(` anywhere in `spikes/ng222-app/src`, so the scratch was never producible there and T006 could only record could-not-run. The owner's ruling of 2026-10-30 ("Option 1 but don't change insurance-portal … Prefer a new small app or route in the app with the counter") authorizes exactly one dev-only route in the counter app that exhibits the pattern. The route exists only to make the stale-view behaviour observable; it must not become a product feature, and the insurance portal stays untouched apart from runtime providers.

## Approach

- Add `spikes/ng222-app/src/app/stale-view-fixture.ts`: a zoneless standalone component, same style as `counter.ts`, that renders the field's current value and subscribes to a small observable in its constructor, writing the plain (non-signal) field inside the subscribe callback.
- Register it in `spikes/ng222-app/src/app/app.routes.ts` at path `stale-view`, following the existing route entries; leave every existing route untouched.
- Keep the write unambiguous for the scan: `this.<plainField> = <value>` inside `subscribe(...)`, on a field that is not a signal, with a template that renders it.
- Add `spikes/ng222-app/src/app/stale-view-fixture.spec.ts`: a Vitest spec proving the component writes the plain field when its observable emits and that the field is not a signal.
- Add `scripts/stale-view-fixture.test.mjs`: a dependency-free node:test check asserting the component source contains a `this.<field> =` write inside a `subscribe(` callback on a non-signal field, and that `app.routes.ts` still declares its original entries plus `stale-view`.
- Do not touch `counter.ts`, `app.ts`, `app.config.ts`, any existing spec, or the insurance portal.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `spikes/ng222-app/src/app/stale-view-fixture.ts` exists and writes a plain, non-signal field inside a `subscribe(...)` callback in its constructor.
2. `spikes/ng222-app/src/app/app.routes.ts` serves that component at path `stale-view`, and every pre-existing route entry is unchanged.
3. `spikes/ng222-app/src/app/stale-view-fixture.spec.ts` passes and asserts both the write on emission and that the field is not a signal.
4. No other file in `spikes/ng222-app` and nothing in the insurance portal changes.

## Verify

```bash
node --experimental-strip-types --test scripts/stale-view-fixture.test.mjs
```

Heavy: no

## Log

- created by build repair (2026-10-30): the counter fixture has no subscribe write, so SC1 could not be produced; the owner authorized one dev-only route
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T009): pass, exit 0; output tail:
  ```
  ✔ component contains a this.<field> = write inside a subscribe callback on a non-signal field (1.0545ms)
  ✔ app.routes.ts declares original routes plus stale-view (0.1648ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 116.0737
  ```
