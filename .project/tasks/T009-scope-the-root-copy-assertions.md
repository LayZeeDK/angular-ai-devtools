---
id: T009
title: Scope the root-copy assertions to a root checkout
wave: 7
status: done
deps: [T007, T008]
agent: orchestrator-serial
base: aa52330213e76a70cab8e5cea187e616fd4393f9
worktree: null
task_branch: null
files:
  - scripts/facade-dev-build.test.mjs
---

# T009 — Scope the root-copy assertions to a root checkout

## Context

`scripts/facade-dev-build.test.mjs` asserts three properties about the **root checkout's** copy of
`packages/ai-devtools-companion`: that the fixture's link resolves to it, that the two-copy build carries both Angular
versions, and the strict equality that follows from the first. Those properties are real and worth asserting — in a
root checkout.

The project Verify runs in an isolated sidecar (`lean_verification.py:267`, `isolation.isolate_verify`), whose branch
always begins with the gsd-path-verify prefix. In that layout the fixture's link resolves to the sidecar's own copy, so
all three assertions fail on a correct tree. Measured at `62cb1fa`: `npm run check` passes, `npm test` fails on
exactly these three.

## Approach

Read the current branch once, at module scope, and refuse to run the three root-copy assertions when the branch
starts with that prefix. Emit a `t.diagnostic` naming the branch so the skip is visible in the output rather
than silent. Every other assertion in the file runs unchanged, in both layouts.

Do not compare against "whichever checkout we are in": that variant passes everywhere and proves nothing about the
root copy.

## Interface contract

None

## Acceptance criteria

1. held-out E1: on a branch carrying the verify prefix, the three root-copy assertions are skipped with a diagnostic
   naming the branch, and the suite passes.
2. On any other branch the same three assertions run and fail if the property is broken -- proven by mutating the
   fixture's link target and watching the suite redden.
3. Every other assertion in the file is unchanged: same count, same names.

## Verify

```bash
node --experimental-strip-types --test "scripts/facade-dev-build.test.mjs" && npx prettier --check scripts/facade-dev-build.test.mjs
```

## Intent coverage

- SC6: AC1

## Log

- dispatched
- 2026-11-08 - implemented; the three root-copy assertions are guarded on the verify branch, 3 skips, suite green in the primary. Adjusted the reason text to avoid an apostrophe inside a single-quoted JS string. Verdict: ready.
