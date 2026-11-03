---
id: T018
title: Derive the browser slot instead of pinning it
wave: 6
deps: [T013]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs
  - .claude/skills/control-vitest-browser-angular/scripts/control.test.mjs
---

# T018 — Derive the browser slot instead of pinning it

## Context

`prepare-final` at head `f1115f6` failed on `control.test.mjs`: six assertions expecting `slot: 1` received
`slot: 0`, and a `busyPorts` case received `undefined` instead of `[12912]`. They reproduce standalone.

`slotOf` gives slot 0 to a main checkout and hashes a worktree path into 1-99. The suite pins one computed
instance of that value rather than asserting the property, so when the project Verify runs from the sidecar
worktree — a different absolute path — the derived slot changes and the pinned expectations fail. The first
`busyPorts` failure was a genuine transient (port 50657 briefly held); the six `slot` failures are not.

This is the inverse of the defect this milestone spent five waves repairing: not a test that cannot fail, but
a test that fails for its own environment.

## Approach

1. Replace every pinned slot literal with an assertion about the property: a main checkout is slot 0, a worktree
   lands in 1-99, and the same path yields the same slot across calls.
2. Replace the pinned holder PID with an assertion that `busyPorts` names the holder it actually observes, and
   that it reports nothing when the port is free. A test may not depend on a specific PID or on a port being
   held by something outside it.
3. Keep the `.claude` byte copy in step — `scripts/skills-mirror.test.mjs` fails otherwise.

## Interface contract

None

## Intent coverage

- SC4

## Acceptance criteria

1. No assertion in the file pins a slot number that depends on the checkout's absolute path; each asserts the property instead.
2. The suite passes from the primary checkout and from a sidecar worktree, demonstrated by running it in both.
3. `busyPorts` is asserted against a listener the test owns, and the assertion does not name a PID.
4. The `.claude` copy is byte-identical to the `.commandcode` one and `scripts/skills-mirror.test.mjs` passes.

## Verify

```bash
npm ci --include=dev; node --test .commandcode/skills/control-vitest-browser-angular/scripts/control.test.mjs scripts/skills-mirror.test.mjs
```

## Log

- opened by orchestrator (the ship gate at f1115f6 failed on path-dependent slot expectations)
