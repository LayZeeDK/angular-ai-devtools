---
id: T002
title: Join a router diagnostic to exactly one configured route
wave: 1
status: pending
deps:
  - T001
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/router-diagnostic.js
  - scripts/router-diagnostic.test.mjs
---

# T002 — Join a router diagnostic to exactly one configured route

## Context

T001's recording says which router diagnostics reach the page console and what each message names, and records the
router configuration read at the same instant. This task builds the join against that recording rather than against
an assumption about what a router message contains.

## Approach

A pure module that takes the captured messages and the configuration and answers per message. Attribution is by
configured path only. When more than one configured route explains a message, the answer is `cannot-tell` with the
reason and no route — never the nearest, never the only near one.

The module reads no clock, no console and no DOM, so a test can drive it from the recording alone.

## Interface contract

`routerDiagnostic(messages, facts) -> { state: "finding" | "cannot-tell", route?, construct?, code?, message?, reason? }` — pure, no DOM.

## Files

- `extension/router-diagnostic.js` — the module.
- `scripts/router-diagnostic.test.mjs` — its suite, driven by T001's recording.

## Acceptance criteria

1. A message that matches exactly one configured route produces a finding naming that route and the message text, and
   carrying the code the message states (E1).
2. Held-out E3: a message matching two or more configured routes produces `cannot-tell` with reason
   `several-configured-routes` and **no** `route` key.
3. A message matching no configured route produces `cannot-tell` with reason `no-configured-route`.
4. A message whose code the digest does not carry records the code it saw and explains nothing about it (E2).
5. The module names no guard verdict, resolver outcome or redirect decision, and no element the message does not state.
6. A mutant that attributes to the nearest route reddens AC2's pin by name; a mutant that omits the code reddens AC1's.

## Verify

```bash
node --experimental-strip-types --test "scripts/router-diagnostic.test.mjs"
```

## Intent coverage

- SC2
- SC3

## Log

- dispatched
