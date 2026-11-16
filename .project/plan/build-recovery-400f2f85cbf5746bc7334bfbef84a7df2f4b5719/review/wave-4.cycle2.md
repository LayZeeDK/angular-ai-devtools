# Review — wave 4, cycle 2

Cycle: 2
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 2fa589b978cff3f0a6ec37f4d9e1b3a2c5d8e7f6

## T005 — Make the gate agree with this milestone's own evidence: fail

- ✅ The cycle-1 defect is fixed. A task declaring a suite-shaped path, a recording-shaped path and a plain
  one, all absent from every tree, now reads `claimsExamined 3`, `pins []` and three findings, each
  `claim-absent-from-the-range` naming the path and the range. Before the repair it read `claimsExamined 1`
  with two pins.
- ✅ The three smaller defects are fixed: a dot-slash spelling and a bare spelling produce byte-identical
  verdict objects; a three-dot range is refused `nothing-examined` with its form named; `--tasks` on a single
  markdown file exits 0 reading that task.
- ❌ **A fifth change, unasked and unpinned, re-opens the defect class.** `scripts/gate-integrity.mjs:1606-1611`
  resolves any Log token that is a proper tail of a declared path, and `:1626`/`:1645-1650` judge the pin on the
  resolved path. With `apps/angular-ai-devtools/src/app/panel-console.ts` declared, a Log naming
  `src/app/panel-console.ts` — absent at `19c199c3`, `9f0603c9` and `2fa589b9` — is pinned rather than
  reported; a second variant yields a clean claim naming a path that exists nowhere; and two declarations
  sharing a tail are separated by front-matter order with no finding. Deleting the two lines leaves the suite
  at **44/44 passing** while the record moves from 91 claims, 2 pins, 84 mentions to 83, 1, 93 — so nothing
  pins the behaviour. In the gate's own corpus the branch fires nine times and all nine spellings exist
  nowhere.
- ❌ Minor, same cause: `--tasks` given a *directory* whose name ends in the markdown suffix throws `EISDIR`
  (`:1412-1418`), the mirror of the crash it fixed. Carried into T011.

## Intent coverage

- None owned: T005's task declares no intent coverage. The reading it repairs judges the record reviewed under T001.

## Held-out

### E6 — A diagnostic whose code matches a digest entry only after case folding is reported as the digest carries it, and the row names the case difference.: fail

- The recorded counts move (91/2/84 to 83/1/93) with no red test, because the resolution is an unpinned branch
  rather than a rule. A recorded count that a silent branch can move is not a recording.
