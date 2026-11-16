# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: 72f5c7765f6b6b0a2e9b7f4c5d1a3e8f9b2c6d4a

## T005 — Make the gate agree with this milestone's own evidence: fail

- ❌ **The pin rule disarms the exists-nowhere refusal for exactly the path shapes tasks declare.**
  `isPinnable` (`scripts/gate-integrity.mjs:209-215`) tests a declared path by *spelling* — `SUITE_PATH`,
  `RECORDING_PATH` or `existsSync` — and the pin branch (`:1545-1550`) accepts two absences as equal
  (`:1295-1297`). Proved live with a task declaring `scripts/absent-probe-suite.test.mjs` and
  `research/raw/m999-absent-recording.json`, neither of which any commit or tree carries: both were printed
  as `pin … declared and byte-identical … not judged as a change`, while only the non-suite-shaped
  `src/absent-probe.ts` was refused. The rule's own text (`:96-98`) demands that a path which exists nowhere
  stay a claim, and the shipped tests cannot catch this: the AC7 pin test pins a recording the tree carries
  (`scripts/gate-integrity.test.mjs:3295`) and the default-tasks fixture's absent case is `changed.ts`,
  deliberately not suite-shaped (`scripts/gate-integrity-default-tasks.test.mjs:80`).
- ❌ **Normalisation asymmetry false-refuses a healthy tree.** The declaration match strips a leading `./`
  (`scripts/gate-integrity.mjs:1509`), the range match does not (`:1536-1538`). A Log that names
  `./research/raw/m044-gate-shapes.json` is refused `claim-absent-from-the-range` while the same sentence
  without `./` passes. The new pin branch sits inside the inconsistency: the `./` spelling is pinned when
  unchanged and refused when changed.
- ❌ **`rangeEnds` guesses on a range it cannot split.** Its docstring promises `null` for a string it cannot
  split (`:1256-1259`), but `"a...b".split('..')` yields `["a", ".b"]` and it returns a head that does not
  exist (`:1264-1271`), while `nameStatus` reads the same string as a valid git three-dot range. Measured:
  the identical task pins cleanly on `b8d3341c..72f5c776` and is refused `claim-absent-from-the-range` on
  `b8d3341c...72f5c776`.
- ❌ **Pre-existing, untouched by this wave: a single `.md` `--tasks` argument crashes.** `fromPath` calls
  `readdirSync(absolute)` (`:1351`) before testing `.endsWith('.md')` (`:1352`), so the documented
  "one file" input throws an uncaught `ENOTDIR` instead of a coded refusal.
- ✅ What holds: the log-mode refusals are intact (an undeclared mention is still refused); a declared path
  the range changed stays a judged claim with zero pins; both shape records are byte-identical on an unarmed
  run (`m044` `aa74f81d…`, `m056` `22a8c8d6…`); 54/54 gate and navigation tests and 8/8 stability tests
  pass; the six-column mutant reddens naming both counts; the test-to-edge mapping is read from the plan and
  hard-coded nowhere (the only literal occurrence in the test file is the mutant's filler cell, `:3163`).

## Intent coverage

None — T005 is a repair task and the plan assigns it no success criterion.
