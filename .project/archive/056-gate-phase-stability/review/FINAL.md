# FINAL — M056 gate-phase-stability

Reviewed HEAD: 75b597c527285cd9b0bb82e12938f12150013c96

Overall verdict: pass

## What this milestone set out to do

Make the gate able to derive the range it is held to for a milestone whose numerically previous id is unshipped,
and make that derivation stable under the very commit that ships it. M044 shipped with a gate that was red on the
tree it integrated; this milestone exists so that failure cannot recur silently.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | `415ba520` | measured three red assertions at one head and published one record |
| 2 | T002 | `6d450aa7` | archived task logs became readable, and a zero-claim run still refuses |
| 3 | T003 | `afe7bcd3` | the range's base is held to a rule that does not move with the ship commit |
| 4 | T004 | `7af74f06` | the record and its pins moved onto the repaired state, with derived prose |
| 5 | T005 | `3d3ccc88` | the claims record path derives from the milestone both suites read |
| 6 | T006 | `9ad2079a` | the range's head is a named commit, so its own commit cannot move it |
| 7 | T007 | `051784e2` | the gate answers for the milestone it was asked about, and each record proves what it claims |

## Verification

- `npm run check` exit 0 at every landing, twelve stages, including `gate:archive-paths`, `gate:fix-record` and
  `format:check`.
- `npm test` in the primary worktree: 1423 pass, 0 fail; the held-out corpus passes, including `e3-zero-skipped`.
- Seven wave reviews pass `gsd review-check`.

## Success criteria

### SC1 — `npm run gate:fix-record` exits 0 on a tree whose `.project/tasks` is empty because its milestone archived, examining that milestone's archived task logs and printing how many it examined.

- **Observed**: `node scripts/gate-integrity.mjs --check fix-record --milestone M044` exits 0 and opens M044's archived logs; `node --test scripts/gate-integrity-default-tasks.test.mjs` reports 9 pass, 0 fail.
- **Reference**: `scripts/gate-integrity-default-tasks.test.mjs`
- **Finding**: The review found the gate answering for the wrong milestone: `--milestone M044` read M056's live logs and printed clean.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head
- **Fix direction**: T007 prefers an explicit milestone's archive and prints whose logs they are; measured before and after on the real command.

### SC2 — A tree with no task file in either the live or the archived directory still refuses with `nothing-examined`, so the repair does not trade the refusal away for a green stage.

- **Observed**: `node --test scripts/gate-stability-record.test.mjs` reports 8 pass unarmed and 9 armed, the record byte-identical across a default run and the armed run writing nothing the second time.
- **Reference**: `scripts/gate-stability-record.test.mjs`
- **Finding**: The review found the record's pins proved absence only, so a deleted watched test read as green.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head
- **Fix direction**: T007 derives presence from the passing roster and pins `counts.green === WATCHED.length`; renaming a watched test reddens with the missing name.

### SC3 — `node --test scripts/gate-integrity.test.mjs` passes at a head where this milestone's own ship commit exists, and the committed recording's bytes are unchanged by that run.

- **Observed**: `node --test scripts/gate-integrity.test.mjs` reports 28 pass, 0 fail at a head carrying this milestone's own work, and its recording is unchanged by the run.
- **Reference**: `scripts/gate-integrity.test.mjs`
- **Finding**: The review found the record's pinned head compared against a constant rather than against the record's carrier.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head
- **Fix direction**: T007 compares the pinned head with `record.capture.head` and asserts the carrier is ahead of it on a default run.

### SC4 — The stage derives a range for a milestone whose numerically previous id is unshipped, naming the base it used, instead of stopping with "names no ship commit for M055".

- **Observed**: `node --test scripts/navigation-blocking.test.mjs` reports 21 pass, 0 fail, and the claims list equals what this head derives.
- **Reference**: `scripts/navigation-blocking.test.mjs`
- **Finding**: The review found the SC5 row citing a suite whose titles carry no `E8`.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head
- **Fix direction**: T007 re-pointed the row at `scripts/gate-integrity.test.mjs` and added a pin that reddens when a cited suite's titles lack the edge id.

### SC5 — A mutant that reverts the archived-task branch, a mutant that makes the recording's range unconditional, and a mutant that restores the numeric-predecessor rule each redden a test that names the defect.

- **Observed**: `npm run check` exits 0 across twelve stages and `npm test` reports 1423 pass, 0 fail in the primary worktree.
- **Reference**: `package.json`
- **Finding**: No finding against this criterion; the repairs added four tests, which is why the count is 1423 rather than 1419.
- **Verdict**: met
- **Check**: the observed command above, run at the reviewed head
- **Fix direction**: None needed; the criterion held at every landing.

## Open questions

None that block shipment. LOW findings are carried into the next milestone's backlog: `shipRange` is dead in
production with three divergent milestone-id parsers; T003's `recorded`/`--base` rule has no test; `headMode` is
documented as load-bearing and read by nothing; `--range` silently wins over `--head`; `CLAIM_CAPTURE` still says
`M044_CAPTURE`; `evidence.recordings` enumerates the working tree including untracked files.

## Why this milestone is shippable

The code has been green since T006. T007 exists because the reviews showed that green tests and truthful records
are different achievements: three of the findings were defects in what the artefacts claimed, not in what the code
did. With T007 landed, each record names the command that proves it, each pin reddens when its defect returns, and
the gate answers for the milestone it was asked about.
