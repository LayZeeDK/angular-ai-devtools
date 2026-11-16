---
id: T018
title: Pin the fold's exactness behaviourally
wave: 11
deps:
  - T015
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - extension/console-join.js
  - scripts/console-join.test.mjs
---

# T018 — Pin the fold's exactness behaviourally

## Context

Wave 2's cycle-2 review found the join's own claim — that a folded match is exact equality after
lowercasing, and is never a prefix, a substring or a fuzzy rule — unenforced. Six fold mutants were built: five
survived every behavioural pin (an entry-prefix rule, a substring rule, trimming the entry, trimming the
carried code, trimming both), and the sixth reddened only because the shipped digest happens to carry `NG0100`
as a prefix of `NG01002`. Their only reds were the suite's anchor-uniqueness check, which is structural.

This is the same shape as the text rule that earlier work had to pin: a rule stated in a comment that no
behavioural test holds.

## Approach

- - Add behavioural pins that fail for a prefix rule, a substring rule and any trimming, using inputs where
  the wrong rule gives a different answer than the right one — chosen from the shipped digest rather than
  invented, and stated in the test so a reader sees why the input distinguishes them.
- Pin the other two properties the review found unpinned: two digest codes differing only in case (which
  currently collapse to the first listed, silently), and a fold that goes beyond ASCII.
- Where the honest answer is "this cannot be distinguished at this head", say so in the test's message rather
  than asserting a property the code does not have.
- Arm each new pin with the mutant it exists to refuse, restore, and verify sha256.

## Acceptance criteria

1. A prefix rule, a substring rule, and a trimming rule each redden a behavioural test that names which wrong rule it caught, chosen so the correct rule gives a different answer.
2. Two digest codes differing only in case are handled as the join's contract says, and a test states that behaviour rather than leaving it silent.
3. A non-ASCII fold is either refused or reported, and the test says which, so the pane cannot assert a case difference between characters that are not a case pair.
4. Every new pin is armed by the mutant it exists to refuse, with the failure message quoted.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --test scripts/console-join.test.mjs && npm run check && npx prettier --check extension scripts
```

## Log

- Task written at the fourth repair cycle; not started.
