---
id: T011
title: Stop the tail-suffix resolution from pinning a path that exists nowhere
wave: 7
deps:
  - T006
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T011 — Stop the tail-suffix resolution from pinning a path that exists nowhere

## Context

Wave 4's cycle-2 review confirmed the four repairs and then found a fifth change nothing asked for.
`scripts/gate-integrity.mjs:1606-1611` resolves any Log token that is a proper tail of a declared path to
that declaration, and `:1626` and `:1645-1650` then judge the pin on the resolved path. With
the app's console module declared, a Log naming it with its first directory levels truncated — a spelling
absent at `19c199c3`, `9f0603c9` and `2fa589b9` — is pinned instead of reported, and a second
variant yields a clean claim naming a path that exists nowhere. With two declarations sharing a tail, the
choice is front-matter order and nothing is reported.

The change is pinned by nothing: deleting the two lines leaves the shipped suite at 44 of 44 passing, while
it moves the record from 91 claims, 2 pins and 84 mentions to 83, 1 and 93. In the gate's own corpus the
branch fires nine times and all nine spellings exist nowhere. This is the defect class the milestone exists
to catch, introduced by the task that repaired it.

Minor, same cause: `--tasks` given a directory named with a markdown suffix now throws `EISDIR` at
`:1412-1418`, the mirror of the `ENOTDIR` crash T006 fixed.

## Approach

- Keep the resolution only where it cannot absolve: a token may resolve to a declaration when the spelling
  the Log used exists in the tree or in a commit the range carries. A spelling that exists nowhere is a
  claim, however it relates to a declaration.
- Never choose silently between two declarations that share a tail. Report the ambiguity, or refuse, naming
  both declarations.
- Refuse a `--tasks` argument that is a directory whatever its name, with a message naming the path.
- Pin each of these with a test that reddens naming its defect, and pin the corpus reading's counts so the
  resolution cannot move 91/2/84 without a red test.

## Acceptance criteria

1. A Log naming a path that is only a tail of a declaration, and that exists nowhere, is a claim and a finding naming the spelling and the range — not a pin.
2. A bare basename that names a file the tree carries still resolves to its declaration, and that resolution is armed by a mutant that reddens naming the rule.
3. Two declarations sharing a tail produce an ambiguity report or a refusal naming both; neither is chosen silently.
4. `--tasks` given a directory whose name ends in the markdown suffix is refused with the path named, not thrown as `EISDIR`.
5. The record's claims, pins and mentions counts are pinned by a test, so the resolution cannot move them without a red test.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.

## Intent coverage

- None

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs && npm run check && npx prettier --check scripts
```

## Log

- Task written at the second repair cycle; not started.
