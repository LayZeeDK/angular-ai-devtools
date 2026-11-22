---
id: T004
title: Write the verdict claims the census derives
wave: 4
status: pending
deps: [T003]
agent: null
base: null
worktree: null
task_branch: null
files:
  - research/raw/m062-verdict-claims.json
  - scripts/navigation-blocking.test.mjs
  - scripts/outlet-verdict-claims.test.mjs
  - scripts/panel-copy.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/tutor-record-shapes.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/teardown-leak-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
---

# T004 — Write the verdict claims the census derives

## Goal

Record what each criterion claims and which suite proves it, so a verdict is a read rather than a narrative.

## Context

The claims census reads the intent at capture time, so a criterion edited afterwards makes the record stale and the suite names the field that moved.

## Approach

Extend the census the way M061 did, capture with its own armed flag, and read it back unarmed. Every claim cites a suite and a test name that exists at this head.

## Interface contract

`outletAnswer(record)` is a pure function of the record it is given. It returns, in every state, one object with five fields: `state`, `requested`, `matched`, `path`, `absences`. `state` is one of `outlet-matched`, `outlet-unnamed-primary`, `outlet-absent`, `cannot-tell`. `requested` and `matched` are filled only from fields the record carries and are otherwise `null`, except that an absent `requested` is reported as `primary`, because an unnamed outlet and `primary` are the same outlet. No field is derived from the rendered tree, from a component name, from a position in an outlet list, or from a neighbouring record. The function throws on no input. It is observed through `globalThis.angularAiOutletAnswer(outletAnswer)`.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. SC1: the record states each criterion verbatim and names the suite and test that proves it; a mutant that quotes a criterion in its own words reddens.
2. SC2: a claim whose test does not exist at this head reddens naming the missing test.

## Verify

```bash
M062_CAPTURE=1 node --test scripts/outlet-verdict-claims.test.mjs && node --test scripts/outlet-verdict-claims.test.mjs scripts/panel-copy.test.mjs && npx prettier --check research/raw/m062-verdict-claims.json
```

## Log

- pending.
