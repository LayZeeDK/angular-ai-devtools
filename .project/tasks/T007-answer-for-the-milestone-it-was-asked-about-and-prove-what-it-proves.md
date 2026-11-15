---
id: T007
title: Answer for the milestone it was asked about and prove what it proves
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
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-stability-record.test.mjs
  - scripts/navigation-blocking.test.mjs
  - research/raw/m044-gate-shapes.json
  - research/raw/m056-gate-stability.json
  - research/raw/m056-verdict-claims.json
---

# T007 — Answer for the milestone it was asked about and prove what it proves

## Context

Four independent reviews at `9ad2079a` produced one HIGH and three MEDIUM findings, all checked against the tree
before acceptance (`.commandcode` notes section 29 holds the evidence).

- HIGH: `scripts/gate-integrity.mjs:1615` `defaultTaskInput(root, milestone)` discards `milestone` whenever one
  `.md` sits in `.project/tasks`, so `--milestone M044` examines **M056's** live logs against M044's range and
  prints `fix-record clean - examined 4 claim(s) in 6 task log(s) of .project/tasks`; M044's five archived logs
  are never opened. `scripts/gate-integrity-default-tasks.test.mjs:181` specifies that behaviour, so the fix
  changes a specified expectation, not a bug in passing code.
- MEDIUM: `scripts/gate-stability-record.test.mjs:885` `assert.ok(found === undefined)` proves absence only -
  deleting a watched test leaves the child suite green, `watched` empty, `counts.watched` the constant 3, and the
  record asserting none of the three is red.
- MEDIUM: `research/raw/m056-verdict-claims.json:135-137` says SC5 is proved by
  `scripts/gate-integrity-default-tasks.test.mjs`, which contains zero `E8`; `scripts/gate-integrity.test.mjs`
  contains five.
- MEDIUM: `scripts/gate-stability-record.test.mjs:867-871` compares the range tail to the `MEASURED_AT`
  constant rather than to the record's carrier, so an armed capture with `MEASURED_AT = HEAD` is green and goes
  red on the next commit.

## Interface contract
{contract}

## Approach

- Make the task input answer for the milestone it was asked about: an explicit `--milestone` prefers that
  milestone's archive, and the printed line names which milestone the examined logs belong to so a reader cannot
  read `of .project/tasks` as that milestone's own logs. Update the specified expectation and its reason; do not
  delete the live-directory rule for a milestone with no archive.
- Derive presence, not just absence: take the watched names from the passing roster (`titleOf` already parses
  `✔ name (Nms)`), record `counts.green`, and pin `counts.green === WATCHED.length` so a deleted test reddens.
- Correct the SC5 citation so the row cites a suite that holds an `E8` test, and add a check that each cited
  suite contains the edge id in a test title - otherwise the next record can make the same false claim.
- Assert that the record's carrier is ahead of its pinned head: `git log <capture.head>..HEAD -- <record path>`
  must be non-empty on a default run. An armed run legitimately produces an empty list, so this assertion is
  default-run only.
- Add the four per-pin lines to T004's Log that its own AC3 required, naming `:824->:812`, `:828->:813`,
  `:864->:858`, `:900->:895`.

## Intent coverage

- SC1
- SC3

## Edges

- E5
- E6

## Verify

```bash
node --check scripts/gate-integrity.mjs && node --test scripts/gate-stability-record.test.mjs && npm run check
```

## Acceptance criteria

1. `node scripts/gate-integrity.mjs --check fix-record --milestone M044` examines M044's archived logs and the line says which milestone they belong to; a milestone with no archive still reads the live directory.
2. Deleting or renaming any of the three watched tests in `scripts/gate-integrity.test.mjs` reddens `scripts/gate-stability-record.test.mjs`, naming the missing name; with the tests present it is green.
3. The SC5 row cites a suite whose test titles contain `E8`, and a mutation that points it at a suite without one reddens the claims check.
4. A default run reddens if the record's pinned head is not behind its carrier, and stays green at this head; the armed capture still writes nothing twice.
5. T004's Log names all four pins with their before and after, and `npm test` reports 1419 pass, 0 fail, with `npm run check` exiting 0.

## Log

- 2026-11-15 — created from the four-review panel at `9ad2079a`. No work started.
