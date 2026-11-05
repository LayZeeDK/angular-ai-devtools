---
id: T002
title: Join a captured diagnostic to the construct it names
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/lint-core.js
  - scripts/lint-core.test.mjs
---

# T002 — Join a captured diagnostic to the construct it names

## Context

T001 records what reaches the console. This task builds the pure join the panel consumes: a captured message plus the app facts, producing a finding that names the construct and the code only when the message states them.

## Approach

One pure module taking the captured messages and the app facts, returning either a finding or a named absence. It carries `construct`, `code` and `message` only when the message states them, and returns `cannot-tell` with a reason when it does not. No compiler access, no build subscription.

## Interface contract

`lintCore(messages, facts) -> { state: "finding" | "cannot-tell", construct?: string, code?: string, message?: string, reason?: string }` — pure, no DOM, no `window`; T003 renders exactly these fields and adds none.

## Files

- `extension/lint-core.js`
- `scripts/lint-core.test.mjs`

## Acceptance criteria

1. E3: a captured message whose code the digest does not carry produces "cannot tell" carrying the reason and no construct.
2. E1: an empty set of captured messages produces no finding — the absence is reported, not rendered as "nothing was wrong".
3. E2: with the captured messages withheld, the module produces no finding; it reads no console of its own.
4. No finding names a cause the message does not state; a message saying only "unused import" produces no cause beyond that.
5. A mutant reddens: matching a diagnostic to the nearest element instead of the one it names fails the attribution pin.

## Verify

```bash
node --test scripts/lint-core.test.mjs
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
