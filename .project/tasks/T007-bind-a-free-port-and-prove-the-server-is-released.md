---
id: T007
title: Bind a free port and prove the server is released
wave: 5
status: pending
deps: [T001, T006]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/router-config-capture.test.mjs
  - scripts/sanitizer-bypass.test.mjs
---

# T007 — Bind a free port and prove the server is released

## Context

The ship Verify has now failed three times, each on a different cause, and the third is the one this task takes:

```
✖ E4: two consecutive npm run check + npm test are idempotent
AssertionError: E4: first npm test failed
```

That failure is **not reproducible in isolation**. Reproduced by hand in a verify sidecar with the same chain —
`npm ci`, the fixture install, the companion build, then `npm test` — the suite passes, and it passes again after
`npm run check`. Two consecutive `npm test` runs in the primary pass too, with an identical working tree.

What differs inside E4 is that it runs the whole suite **nested**: a `npm test` whose inner run executes the same
capture suites. Each capture suite binds a fixed port default (`router-config-capture` uses `4273`, override
`M030_ROUTER_PORT`), and a server that outlives its suite leaves that port occupied for the next nested run. That is the
leading hypothesis, and it is also a real weakness on its own: a suite that cannot run twice, or run beside another
suite, is not a reliable gate.

## Approach

1. Choose a **free port at run time** — bind port 0, read the assigned port, close, and hand that number to the dev
   server. Keep the env override working for a caller that wants a fixed port.
2. Guarantee teardown: kill the server's process tree in a `finally`, and wait until the port is actually free before
   the suite ends.
3. Prove it: run the suite twice back to back and assert both pass, and that the port is free after each run.

## Interface contract

None

## Files

- `scripts/router-config-capture.test.mjs`
- `scripts/sanitizer-bypass.test.mjs`

## Acceptance criteria

1. Both suites bind a free port at run time instead of a fixed default, and the env override still works.
2. Each suite stops its server in a `finally` and exits only after the port is free.
3. Running either suite twice back to back passes both times.
4. A mutant reddens: skipping the teardown leaves the port bound and the second run fails, which the suite must report as a failure rather than hang.

## Verify

```bash
node --test scripts/router-config-capture.test.mjs scripts/sanitizer-bypass.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
