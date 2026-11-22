# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 54c23abd2a732c5f9ffc9298882d44a771cb8234

## T005 — Re-derive the gate records and run the project verify: pass

- ✅ The landing is the re-derived gate records, the census wiring and the verify ledger, and nothing
  else: `git show --stat 54c23abd` reads the task file, `research/raw/m044-gate-shapes.json | 103 +-`,
  `research/raw/m056-gate-stability.json | 4 +-`, `research/raw/m059-record-shapes.json | 18 +-`,
  `research/raw/m060-record-shapes.json | 4 +-`, `scripts/tutor-answer.test.mjs | 26 ++`,
  `6 files changed, 113 insertions(+), 53 deletions(-)`. Every number the re-derivation moved is a
  count of the tree this head actually carries, checked by this review against the landings: the
  M044 record's suite denominators move `filesExamined 327 → 331` and `suitesExamined 167 → 169`
  (exactly the two suites M060 added, `scripts/error-routing-shapes.test.mjs` and
  `scripts/error-routing.test.mjs`, both present in the tree), `archivesExamined 58 → 59` (the M059
  archive landed mid-milestone), `differing 44 → 46` with `added 28 → 30` — the two new entries are
  the M060 suites themselves, each carrying its own `reason` prose
  (`research/raw/m044-gate-shapes.json`, the `scripts/error-routing-shapes.test.mjs` and
  `scripts/error-routing.test.mjs` differing entries, `addedAssertionLines 5316 → 5500`), and the
  M059 record's absence-scan denominators move `38 → 39` extension modules, `136 → 138` suites and
  `148 → 151` records with the own-file exclusions unchanged.
- ✅ The project verify is real, recorded, and this review read its output: the ledger's final entry
  (`M044_CAPTURE=1 node --test scripts/gate-integrity.test.mjs && M056_CAPTURE=1 node --test
  scripts/gate-stability-record.test.mjs && node --test scripts/gate-integrity.test.mjs
  scripts/gate-stability-record.test.mjs && npm run check && npm test`, commit `32b384b0`, result
  `pass` — after one earlier `fail` at the same commit, honestly recorded at
  `.project/build/verify-ledger.jsonl`) has its full output in `.project/build/verify-T005.log`
  (612,672 bytes), which this review read at the tails: the script-test run prints
  `ℹ tests 1924 / ℹ pass 1924 / ℹ fail 0`, the skills run `ℹ tests 60 / ℹ pass 60 / ℹ fail 0`, the
  app suite `ℹ tests 320 / ℹ pass 320 / ℹ fail 0` (the 320/320 the build guard cites), the held-out
  corpus `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed`, and the `check` chain's twelve
  stages (tsc, lint/verify/check skills, check:panel/extension/companion, the three gates,
  `format:check`) all invoked in the log.
- ✅ The gate-stability record's re-derivation is a fresh gate run, not a copied verdict:
  `research/raw/m056-gate-stability.json`'s `plainRun` moves `milestone M059 → M060` and
  `gate-integrity: pass - 0 finding(s), 16 mention(s) → 0 finding(s), 1 mention(s)` — the mention
  count fell because M059's tasks are now archived and only the current milestone's log is examined,
  which is what `npm run gate:fix-record` returning 0 findings at this head means
  (`git show 54c23abd -- research/raw/m056-gate-stability.json`).
- ✅ The head pins were re-derived, not hand-edited: `research/raw/m060-record-shapes.json`'s
  `head`/`commands[0].output` move `8166b8b4 → 32b384b0` and `m059-record-shapes.json`'s
  `head`, `headCommand` output and `capture.head` move `0314cac2 → 32b384b0` — the commit the verify
  ran at — while the measurement sections change only where the tree changed (the M059 scan
  denominators quoted above, and `m044-gate-shapes.json`'s citation of
  `scripts/tutor-answer.test.mjs` moving `line 161 → 183`, `567 → 589`, exactly the lines T005's own
  census edit shifted).
- ✅ The census wiring is derived from the map's own words: `scripts/tutor-answer.test.mjs` adds
  `THIRD_BESIDE_MAP = 'research/raw/m060-record-shapes.json'` to `MAPS` (`:97-104`) and
  `PINNED_OUTSIDE.M060` (`:138-141`), so M060's two owed records leave the census because the map
  names them, and the run's own refusal text proves the subtraction is load-bearing:
  `the tree holds 15, and the maps name 10 outside themselves (…, research/raw/m060-surface.json,
  research/raw/m060-verdict-claims.json)` — without the wiring, M060's surface and claims records
  would be unmeasured records and the census would redden.
- ⚠ One known staleness, stated in wave 1 and unchanged here: the M060 record-shapes suite pins its
  record's `head` by equality with `git rev-parse HEAD`, so `node --test
  scripts/error-routing-shapes.test.mjs` reddens its two head-pin assertions at the landing commit
  `54c23abd` (the record was recaptured at the verify commit `32b384b0`); the verify's own pass is
  valid at `32b384b0`, where HEAD matched. The head-pin delta is the two head fields alone — every
  measured section is byte-identical at the reviewed head (wave 1's run).
- Files the wave touched, read or not read: `research/raw/m044-gate-shapes.json`,
  `research/raw/m056-gate-stability.json`, `research/raw/m059-record-shapes.json`,
  `research/raw/m060-record-shapes.json` — read via the T005 diffs (whole changed hunks);
  `scripts/tutor-answer.test.mjs` — read via the T005 diff at all four changed sites;
  `.project/build/verify-ledger.jsonl` — read (whole file); `.project/build/verify-T005.log` — not
  read whole (612 KB), read at the four test-total tails and the check-stage listing;
  `scripts/gate-integrity.test.mjs`, `scripts/gate-stability-record.test.mjs` — not read, consumed
  through the verify command and the ledger.

## Intent coverage

### SC5 — The finding is produced from observables the agent already holds — the global listener record, M042's boundary entries and the injector walk — with no new page-side instrumentation, no second tap and no second global listener.: pass

- ✅ Covered by T005: the re-derived gate records recount the whole tree and find no new capture
  surface — `wholeTree.suites` moves `scripts 122 → 124` for exactly the two M060 test files and
  `total 197 → 199` with `tests 2526 → 2553` (the M060 suites' own declarations), and nothing under
  `extension/` grew a listener: the M060 record T005 re-pinned still states `listeners added: 0`
  with the producer's two-name list, and `git show 54c23abd --stat` touches no extension file at
  all. The E6 edge's count-assertion (`research/raw/m060-record-shapes.json`'s
  `absences.phaseNotRecorded.count === 2`, held by
  `scripts/error-routing-shapes.test.mjs:276-300`, run green in wave 1) survives the re-derivation
  unchanged.
- ✅ The project verify is the enforcement: `npm test` (in the verify command) runs every suite in
  `scripts/**/*.test.mjs` — including `scripts/error-routing-shapes.test.mjs`,
  `scripts/error-routing.test.mjs`, `scripts/tutor-record-shapes.test.mjs` and
  `scripts/tutor-answer.test.mjs`, the four suites that between them pin the listener count, the
  join's purity and the census — and the log's `ℹ tests 1924 / ℹ pass 1924 / ℹ fail 0` plus the app
  suite's `ℹ tests 320 / ℹ pass 320 / ℹ fail 0` is that enforcement passing at the verify commit.

### SC6 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table and digest pins moved in the same task, and the answer contains no remedy, no cause and no handler identity it was not given.: pass

- ✅ Covered by T005: the re-derived records pin the M060 surface's place in the tree's counts rather
  than restating the render — `research/raw/m044-gate-shapes.json`'s `wholeTree.suites.apps 34`
  and the two new `differing` entries' reasons name the M060 surface work (`panel-demo.spec.ts`
  `addedLines 6202 → 6623` with the pane's assertions among them, `panel-routes.test.mjs`
  `addedLines 728 → 756`), the M056 gate-stability record's fresh `npm run gate:fix-record` run
  answers `pass - 0 finding(s)` at this head, so the route-table/digest/copy pins T003 moved are
  gate-clean as re-measured, and the copy-count chain (213 sentences, `checked: 213`,
  `error-routing: clean, 1 sentences`) that wave 3 ran green is part of the `npm test` body the
  verify ran (1924/1924).
- ✅ The census subtracts M060's two records by the map's own words, so the surface and claims
  records cannot silently drop out of the gate: `scripts/tutor-answer.test.mjs`'s
  `PINNED_OUTSIDE.M060` and `THIRD_BESIDE_MAP` wiring (`:97-104`, `:138-141`, `:323`,
  `:1287-1289`) was run green in this review (`ℹ tests 41 / ℹ pass 41 / ℹ fail 0` over
  `scripts/tutor-record-shapes.test.mjs`, the census that reads the same maps), and the verify
  ledger's pass at `32b384b0` includes the same census in `npm test` — the surface/claims records
  the SC6 pin cites are held present and measured at the shipped head.
