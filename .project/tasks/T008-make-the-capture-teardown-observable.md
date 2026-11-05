---
id: T008
title: Make the capture teardown observable
wave: 6
status: pending
deps: [T007]
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/router-config-capture.test.mjs
---

# T008 — Make the capture teardown observable

## Context

T007's fourth acceptance criterion asked for a mutant proving that **skipping the teardown** leaves the port bound and
the second run fails. The wave-5 reviewer built exactly that mutant — `finally` disabled, no kill, no port wait — and ran
the suite twice:

```
tests 7, pass 7, fail 0
✔ capture router config via ng.getInjector
```

**It passed anyway, with no orphaned process and no hang.** So the port is freed by the child exiting on its own, not by
the teardown, and nothing in the suite would notice if the teardown were removed. The behaviour we depend on is real; the
guarantee that we still do it is not enforced.

A teardown no test can observe is a comment, not a mechanism.

## Approach

1. After each capture, assert explicitly that no process from that run survives: the spawned server's PID is gone, and a
   bind on the port it used succeeds.
2. Keep the kill and the wait — they are correct; they simply need to be checked.
3. Mutant: disable the teardown, force the server to outlive the run (for example by detaching it from the parent), and
   confirm the new assertion **reddens** rather than the suite passing quietly.

If a surviving server genuinely cannot be produced on this platform, say so and make the assertion a documented
observation instead of pretending it is enforced — but state that plainly in the suite.

## Interface contract

None

## Files

- `scripts/router-config-capture.test.mjs`

## Acceptance criteria

1. The suite asserts, after the capture, that the server's PID is gone and the port can be bound again.
2. Disabling the teardown makes that assertion fail, and the failure names what survived.
3. The suite still passes twice in a row with the teardown in place.
4. If a surviving server cannot be produced, the suite says so in a comment and in the test name rather than claiming enforcement.

## Verify

```bash
node --test scripts/router-config-capture.test.mjs
```

## Intent coverage

- SC5

## Log

- dispatched
