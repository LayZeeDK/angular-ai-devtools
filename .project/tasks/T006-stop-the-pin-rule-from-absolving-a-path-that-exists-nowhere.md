---
id: T006
title: Stop the pin rule from absolving a path that exists nowhere
wave: 6
deps:
  - T005
status: in-progress
agent: build_T006
base: c98d6ee625d53e984a6352dff480451903abc97c
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T006 — Stop the pin rule from absolving a path that exists nowhere

## Context

Wave 4's review proved the pin branch disarms the exists-nowhere refusal for the two path
shapes tasks actually declare. `isPinnable` (`scripts/gate-integrity.mjs:209-215`) tests a declared path by
*spelling* — `SUITE_PATH`, `RECORDING_PATH` or `existsSync` — and the pin branch (`:1545-1550`) accepts two
absences as equal (`:1295-1297`). A task declaring a suite-shaped name and a recording-shaped name, both carried by no commit and no tree,
printed as `pin … not judged as a change`, while only a declaration shaped like neither was refused. The rule's
own text (`:96-98`) demands the opposite, and the shipped tests cannot see it: AC7 pins a recording the tree
carries (`scripts/gate-integrity.test.mjs:3295`) and the default-tasks fixture's absent case is deliberately
not suite-shaped (`scripts/gate-integrity-default-tasks.test.mjs:80`).

Two smaller defects in the same reading. The declaration match strips a leading a dot-slash prefix (`:1509`) but the range
match does not (`:1536-1538`), so a Log naming that path with a leading dot-slash is refused
claim-absent-from-the-range while the bare spelling passes. And `rangeEnds` promises null for a range it
cannot split (`:1256-1259`) yet returns `{ base: 'a', head: '.b' }` for a three-dot range (`:1264-1271`), so a
three-dot range is read one way by the pin and another by `nameStatus`. Separately (pre-existing), --tasks
pointing at a single markdown file crashes with ENOTDIR: fromPath calls readdirSync (line 1351)
before testing whether the argument ends in the markdown suffix (line 1352).

## Approach

- - Require existence, not spelling: a path is pinnable only when some commit in the range or the tree
  carries it. Two absences are equal only for a path that exists somewhere; a declared path that exists
  nowhere is a claim and a finding, whatever its shape.
- Normalise the token once, before both the declaration test and the range test, so the dot-slash spelling and the bare spelling read
  identically in the pin branch and the claim branch.
- Make `rangeEnds` refuse a range it cannot split exactly as its docstring says, so a three-dot range is
  reported rather than guessed; do not silently reinterpret it.
- Read the single-file --tasks argument before any directory listing.
- Add a test per defect that reddens naming it: an absent suite-shaped path refused, an absent
  recording-shaped path refused, dot-slash and bare spellings agreeing, a three-dot range refusing with its form
  named, and a single-file --tasks reading one file. Mutants for the first two.

## Acceptance criteria

1. A declared path carried by no commit and no tree is refused as a claim, proven for a suite-shaped and a recording-shaped name, with the message naming the path and the range.
2. A Log naming a path with a leading dot-slash and one naming it bare produce the same verdict at the same head, proven by running both.
3. A three-dot range is refused with the range form named rather than read as a two-dot range; the refusal does not guess a head.
4. --tasks given a single markdown file reads that file's task and exits 0; a directory still reads every task file.
5. The two behaviour changes are each armed by a mutant that reddens naming its defect, and the armed re-capture of `research/raw/m044-gate-shapes.json` leaves it byte-identical on an unarmed run.

## Interface contract

The join returns `{ state, findings[] }`, where `state` is exactly one of `joined`, `captured-nothing` or `no-diagnostics`, and each finding is `{ text, code?, title?, reason? }` with `reason` present only when the digest lacks the code the message carried and `code` absent only when the message carried none. The panel renders `state` and `findings` and nothing else: no cause, element, remedy or unattributed wording. The capture and digest shapes are recorded as data, and the surface's per-case `{ state, findings[] }` is recorded the same way, so a suite can assert either without re-deriving it.


## Intent coverage

- None

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-integrity.test.mjs scripts/gate-integrity-default-tasks.test.mjs && npm run check
```

## Log

- Task written at the repair cycle; not started.
