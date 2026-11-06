---
id: T002
title: Join a legacy diagnostic to its construct
wave: 1
status: pending
deps: [T001]
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/legacy-diagnostic.js
  - scripts/legacy-diagnostic.test.mjs
  - extension/page-footprint.test.mjs
---

# T002 — Join a legacy diagnostic to its construct

## Context

T001 records which legacy diagnostics the page reports, what each message says, and whether the digest carries the code
and states a modern equivalent. This task turns that recording into a finding: construct, code, and the equivalent only
when the digest itself supplies one.

The failure this must avoid is the one every milestone in this programme has had to police — composing a plausible
cause or remedy the evidence does not contain. Here the temptation is concrete: a developer wants to be told what to
write instead, and an unsourced equivalent would be more useful and less true.

## Approach

A pure function over captured messages and digest entries. It reads the code from the message body, looks the entry up,
and extracts the construct the message names. If the digest states an equivalent it is carried as `equivalent`; if not,
the finding says so with `equivalentSourced: false` rather than going silent or inventing one. Unknown codes and
construct-free messages are `cannot-tell`, each with its own reason.

## Interface contract

`legacyDiagnostic(messages, digest) -> { state: "finding" | "cannot-tell", construct?, code?, equivalent?, equivalentSourced?, reason? }` — pure, no DOM.

## Files

- `extension/legacy-diagnostic.js` — the join
- `scripts/legacy-diagnostic.test.mjs` — its tests and mutants

## Acceptance criteria

1. Held-out E1: no captured diagnostic produces no finding, and the module says so with reason `no-captured-diagnostics` rather than reporting the page as legacy-free.
2. A captured diagnostic whose code the digest carries and whose message names a construct produces a finding naming both, with `equivalentSourced: true` only when the digest entry states an equivalent.
3. Held-out E3: a captured diagnostic whose code the digest does not carry produces `cannot-tell` with reason `code-not-in-digest`, and names no equivalent.
4. Held-out E2: with the console read removed the module produces no finding; it never derives a construct from digest text alone.
5. A message naming no construct produces `cannot-tell` with reason `message-names-no-construct`.
6. Two mutants redden by name, each pinning the unmutated module first: one renders an unsourced equivalent, one drops the construct while keeping the code.
7. The module reads no clock, no console and no DOM, and its tests assert that by construction.

## Verify

```bash
node --experimental-strip-types --test "scripts/legacy-diagnostic.test.mjs"
```

## Intent coverage

- SC1
- SC2
- SC3

## Log

- dispatched
