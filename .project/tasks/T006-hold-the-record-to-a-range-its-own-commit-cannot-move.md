---
id: T006
title: Hold the record to a range its own commit cannot move
wave: 6
deps:
  - T005
status: done
agent: build_T006
base: 5290d939497448823ca0f5d1ce5c1d777805ddb8
worktree: null
task_branch: null
files:
  - scripts/gate-stability-record.test.mjs
  - research/raw/m056-gate-stability.json
  - scripts/gate-integrity.mjs
  - scripts/gate-integrity.test.mjs
  - research/raw/m044-gate-shapes.json
---

# T006 — Hold the record to a range its own commit cannot move

## Context

Measured at `3d3ccc88`, the T005 landing: four affected suites 64/65, and the single failure is
`the three sections are what this head derives, so the record cannot drift from the tree`.

`workRange` (`scripts/gate-integrity.mjs:1800-1810`) answers `<newest ship>..<HEAD>`. T003 made the **base**
stable; the **head** is still whichever checkout captured the record. The record stores that range string and
the range's changed-path count, so the commit carrying the record moves the head it pins and the derivation
disagrees immediately. A second capture re-pins the previous head and the next commit moves it again.

## Interface contract
`scripts/gate-integrity.mjs` exports the seams the gate drives: `checkArchivePaths({ root, milestone })`,
`checkFixRecord({ root, range, tasks })`, `defaultTaskInput(root, milestone): string` and
`workRange(root, milestone): { range, base, head, mode, error }`. `mode` names the rule that answered and the
stage prints it, so a refusal says which rule failed rather than only that one did.

## Approach

Choose one of these, state why the others were rejected in the Log, and make the derivation load-bearing:

1. derive over the range the work occupied **before** the record existed;
2. derive over `<base>..HEAD` but exclude the record's own path from the changed-path count;
3. hold the range's head to a named commit rather than HEAD, as T003 did for the base.

Whichever is chosen: a mutant that points the range back at HEAD must redden this suite, naming the range it
then derives. Capture once, then prove a default run leaves the record byte-identical, then commit it and prove
the suite is still green **at the head that carries it** - that last check is the whole task.

## Intent coverage

- SC1
- SC3

## Edges

- E5
- E6

## Verify

```bash
node --check scripts/gate-stability-record.test.mjs && node --check scripts/gate-integrity.mjs && node --test scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs && npm run check
```

## Acceptance criteria

1. The record's range is derived at a head its own commit cannot move, and the Log names the rejected alternatives with the reason.
2. A mutant that points the derivation back at HEAD reddens `scripts/gate-stability-record.test.mjs`, and the failure names the range it derived instead.
3. `node --test scripts/gate-stability-record.test.mjs` reports 8 pass armed and 7 pass unarmed, with the record byte-identical across a default run.
4. The suite is green **after** the commit that carries the record, proven by running it at that head and pasting the summary.
5. `scripts/gate-integrity.test.mjs` stays 28/28 and `npm run check` exits 0, so the fix does not move the recording that pins these suites.

## Log

- 2026-11-15 — created from the single failure measured at `3d3ccc88`. No work started.
- 2026-11-15 - chose approach 3: the range's head is a named commit, threaded through a new --head flag, with the record naming the commit that does not carry it. Mutant that drops --head reddens the suite at the committed head, naming the range it derived instead. Armed 8/armed-again-nothing-written/unarmed 7, record byte-identical across default runs, npm run check exit 0. This landing.

Verdict: ready
- 2026-11-15 - rejected alternatives, per AC1. Approach 1 (derive over the range the work occupied before the record existed) was rejected because a head frozen before T003/T005 puts their task logs' claims of this record outside the range, so checkFixRecord refuses claim-absent-from-the-range and the archive and predecessor sections go red; it would also freeze the live gate, judging every later milestone against an old M056 range. Approach 2 (keep base..HEAD and exclude the record path from the changed count) was rejected because the head sha is carried in four recorded strings - archive.detail.range, archive.detail.readingLine, archive.detail.why and predecessor.detail.lines[1] - so excluding one path from an integer leaves four disagreements and makes the gate's changed-path count disagree with git diff for one special case.

