# Review — wave 6, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 3
Reviewed HEAD: 5b71032601c15f0a830f365c350c46262b63326b

## T006 — Re-measure the signal-shape record: pass

- ✅ The landing is exactly the two tree-derived values and nothing else: `git show --stat 5649a8d6`
  reads `.project/tasks/T006-re-measure-the-signal-shape-record.md | 12 +-, research/raw/m057-record-shapes.json | 4 ++-, 2 files changed, 11 insertions(+), 5 deletions(-)`, and the recording diff is
  precisely two lines — `"filesScanned": 58,` → `"filesScanned": 59,` and `"jsonFilesScanned": 142,`
  → `"jsonFilesScanned": 144,` — at the two hunks `@@ -508,7` and `@@ -568,7`. No needle list, no
  `command` text, no graph count and no other derived value moved, so the contract's "change fixed at
  two values" holds byte for byte.
- ✅ The two values are the tree's, re-derived by this review and not read back off the record. At the
  reviewed HEAD `5b710326`, `powershell` over the working tree measures 59 authored files under
  `extension/` excluding `extension/panel/`, 50 files under `extension/panel/`, and 146 top-level
  `*.json` under `research/raw/` — 145 scanned once the recording excludes itself — matching the
  recording as it now stands (`research/raw/m057-record-shapes.json:511` `"filesScanned": 59,`,
  `:512` `"filesExcludedAsBuildOutput": 50,`, `:571` `"jsonFilesScanned": 145,`). At T006's own head
  `5649a8d6`, `git ls-tree -r` counts 145 top-level JSONs under `research/raw/` — 144 scanned
  excluding the recording itself, the value T006 wrote. The two added recordings are the ones the Log
  names (`m058-record-shapes.json` T001, `m058-surface.json` T003) and the one added authored file is
  `extension/tutor-routing.js` (T002), both present in the tree at `5649a8d6`.
- ✅ The suite is green with no assertion loosened and the suite file edited not at all:
  `node --test scripts/tutor-signals-shapes.test.mjs` at this head prints `ℹ tests 21 / ℹ pass 21 /
  ℹ fail 0`, including the two tests that re-derive the recording rather than read it back —
  `✔ no write record exists anywhere in extension/` and `✔ the second measurement is re-run over the
  tree, not read back` — so the two corrected counts are re-derived from the tree on every run and a
  future drift reddens here, not in a review.
- ✅ The third drifted value is reported, not hidden: the Log states
  `negativeMeasurements.writeRecord.filesExcludedAsBuildOutput` records 49 while the tree measures 50,
  "one more panel output than M057's T009 measured, because this head carries T003's rebuilt panel"
  (`.project/tasks/T006-re-measure-the-signal-shape-record.md:141`), with the reason it was left
  unwritten — no suite asserts it and the contract fixes the change at two values. T009 later landed
  the 50 (`git show 5b710326`: `"filesExcludedAsBuildOutput": 49,` → `50,`) and T009's Log records the
  same state ("a count no suite asserts and T006 measured but could not write",
  `.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:139`). Whether the
  deferral was honest is taken up under GAP 1 below — the verdict here is that the wave's own
  accounting of it is complete: measured, reported with cause, and closed inside the same wave.
- ⚠ unverified in this review: that the tree at T006's head measured exactly 50 excluded panel
  outputs. The measurement rests on the two Logs quoted above; this review measured 50 at the
  reviewed HEAD only, because `extension/panel/` is gitignored build output — `git ls-tree -r
  5649a8d6 --name-only extension/panel/` tracks 2 files — so the head's on-disk panel is not
  reconstructible from git, and re-running a build would write the tree under review.
- Files the wave touched, read or not read, with the diff covered:
  `.project/tasks/T006-re-measure-the-signal-shape-record.md` — read (whole file, 143 lines; diff
  9+/3-), 100%; `research/raw/m057-record-shapes.json` — read in slices (`:505-518` write-record
  block, `:565-575` effect block), ≈28 of 810 lines, ≈3% line-read, and 100% of the 4 changed diff
  lines via `git show 5649a8d6`; `scripts/tutor-signals-shapes.test.mjs` — not read, declared
  edited-not-at-all, confirmed untouched by the commit stat, and 100% executed by the green 21/21
  run. Not read otherwise: none — the commit touches no other file.

## T007 — Pin the proof skills in the audit: pass

- ✅ The landing is one new suite and its task file, nothing else: `git show --stat 568ffbb7` reads
  `.project/tasks/T007-pin-the-proof-skills-in-the-audit.md | 11 +-, scripts/prove-skills-audited.test.mjs | 390 +++ (new), 2 files changed, 398 insertions(+), 3 deletions(-)` — no audit row, no
  gate suite, no recording, exactly as AC3 demands ("the suite is the only path this task lands").
- ✅ The coverage is re-derived from the audit's own text, not read back from the prose: the run
  prints `T007 coverage: 4/4 proof skills covered, 4 of them as ## Descriptive docs entries, of 5
  entries and 113 ## Doc: sections` and `T007 count: the Summary says 5 descriptive docs and the list
  carries 5`, and the suite is 3/3 — `node --test scripts/prove-skills-audited.test.mjs` reports
  `ℹ tests 3 / ℹ pass 3 / ℹ fail 0`. The list's size is counted from the bullets
  (`descriptiveEntries`, `scripts/prove-skills-audited.test.mjs:179-192`) and held to the Summary's
  own tally (`assert.equal(audit.descriptiveCount, audit.descriptive.length, …)` at `:327-332`), so
  the two halves of the count cannot drift apart silently — the drift AC1 names.
- ✅ The mutant proves un-coverage, not count movement — this is the question this review was asked,
  and the answer is yes, by construction and by measurement. The mutant case first drives the
  unmutated text through the same check (`scripts/prove-skills-audited.test.mjs:341`
  `assertAuditCoversProofSkills(auditText);`), so the failure below is the mutation's and not a pin
  that was already red. It then removes exactly one bullet and its indented continuations
  (`withoutDescriptiveEntry`, `:276-298`), and measures the mutation before believing it: the skill
  is gone from the copy (`:348-351` `!mutated.includes(MUTATED_SKILL)`), the Summary's tally is
  untouched (`:353-356`), and the list shrank by exactly one (`:358-361` "the mutant removes exactly
  one bullet … so the list and the untouched tally disagree"). Only then does it assert the refusal's
  message equals, exactly, the skill-naming sentence (`:375-378`):
  `the docs audit must cover .commandcode/skills/prove-join-absence-folding/SKILL.md: neither a ## Doc: heading nor a ## Descriptive docs entry names it` — the run prints it (`T007 mutant: the docs
  audit must cover …`). A count-drift proof would have asserted the Summary assertion fired; this one
  deliberately leaves the tally disagreeing and asserts the coverage sentence instead, so the pin's
  demonstrated failure mode is "removing the bullet un-covers the skill", with the count move proven
  present and proven not to be what reddened. The count drift is separately held by case 2, so the
  two drifts each have their own red.
- ✅ The audit is opened for reading only, and the suite proves it rather than promising it: the
  mutation is a string join (`:297`), and the last assertion re-reads the document's bytes and holds
  them to the bytes the run started with (`:383-386` `assert.equal(readFileSync(auditPath, 'utf8'),
  auditText, …)`).
- Files the wave touched, read or not read, with the diff covered:
  `.project/tasks/T007-pin-the-proof-skills-in-the-audit.md` — read (whole file, 149 lines; diff
  8+/3-), 100%; `scripts/prove-skills-audited.test.mjs` — the landing diff read in full (390 of 390
  new lines via `git show 568ffbb7`, the whole file), 100%, with targeted re-reads at `:245-260`,
  `:276-300` and `:338-390`. Not read: none — the commit touches no other file.

## T008 — Refuse a held-out mutant the plan cannot seed: pass

- ✅ The fix is the root cause, not the symptom — the second question this review was asked, and the
  answer is root cause. The defect was identity replacement: a prose-only `## Held-out checks`
  section has no separator row to seed behind, so `source.replace(section, seeded)` returned a copy
  equal to its source and the helper re-entered on it unconditionally until `RangeError: Maximum call
  stack size exceeded`. The repair removes the re-entry on an unchanged copy:
  `scripts/navigation-blocking.test.mjs:3221` `const seededCopy = source.replace(section, seeded);`
  followed by `:3226-3230` `if (seededCopy === source) { assert.fail(…) }` before the recursion at
  `:3231`. There is no `RangeError` catch anywhere in the file — the only mentions of
  `Maximum call stack size exceeded` are the two comments that describe the old defect (`:3196`,
  `:3616`) — so the crash class is gone rather than caught, and the refusal names the reason (the
  section, the missing `| E… |` row and the missing separator) instead of the stack. The helper's
  docstring states the three outcomes (`:3190-3198`), as AC1 asks.
- ✅ The refusal is proven against the plan as it stands and the healthy seed against a table, both
  green at this head. `node --test --test-name-pattern "held-out" scripts/navigation-blocking.test.mjs`
  prints `held-out refusal: the plan's "## Held-out checks" section carries no | E… | row and no
  separator row to seed one behind, so it carries no seedable table row: …` and `held-out seed: SC1
  carries one citation, so every edge the intent assigns it must be held by the same suite…`, with
  `ℹ tests 3 / ℹ pass 3 / ℹ fail 0`. The full suite run confirms the Log's whole-file state:
  `node --test scripts/navigation-blocking.test.mjs` reports `ℹ tests 25 / ℹ pass 25 / ℹ fail 0` at
  this reviewed head — the Log records the move as 24 tests / 17 pass / 7 fail → 25 / 19 / 6 with the
  six remaining reds the missing verdict-claims record (`.project/tasks/T008-refuse-a-held-out-mutant-the-plan-cannot-seed.md:142`), and those six are green here because T004's capture landed at
  `6ba3a011` — the same six, no new red, none of them T008's.
- ✅ The healthy path is proven where a table still exists, on a copy in memory: the new test builds
  `withTable` by replacing the prose section with the three-column header and separator
  (`scripts/navigation-blocking.test.mjs:3644-3657` region), asserts the replacement changed
  something and `heldOutChecks(withTable).size === 0`, then asserts the seed plants
  `| E1 | T000 | scripts/absent-held-out-suite.test.mjs |` and that `heldOutChecks(broken)` reads it
  back, and finally that the derivation refuses naming the absent suite (`:3673-3700` region; the
  `existsSync` guard at `:3691-3695` proves the wildcard names a suite this checkout does not carry).
  No assertion was loosened: the six-column mutant still refuses by column count (run output:
  `six-column mutant: the intent's edge-coverage table carries 6 column(s); …`), and every other
  record-independent reading is untouched by the diff.
- ✅ The Log's "one site to cover" claim holds: `replaceFirstHeldOutTest` is declared at
  `scripts/navigation-blocking.test.mjs:3203` and called at exactly three places — its own recursion
  `:3231` (now guarded) and the two tests `:3619`, `:3673`, neither of which re-enters — so the
  identity-replacement pattern had one site and the guard covers it.
- Files the wave touched, read or not read, with the diff covered:
  `.project/tasks/T008-refuse-a-held-out-mutant-the-plan-cannot-seed.md` — read (whole file, 144
  lines; diff 5+/2-), 100%; `scripts/navigation-blocking.test.mjs` — the landing diff read in full
  (113+/7- via `git show e7442525`), targeted reads at `:3203-3232` and the new-test region
  `:3609-3712`, ≈130 of 3739 lines, ≈3% line-read, 100% of the diff, and 100% executed by the green
  25/25 run; the four declared pin-closure suites — not read, declared edited-not-at-all, confirmed
  untouched by the commit stat. Not read otherwise: none — the commit touches no other file.

## Intent coverage

None advanced. Each of the three tasks records `## Intent coverage` → `- None`
(`.project/tasks/T006-re-measure-the-signal-shape-record.md:103-105`,
`.project/tasks/T007-pin-the-proof-skills-in-the-audit.md:108-110`,
`.project/tasks/T008-refuse-a-held-out-mutant-the-plan-cannot-seed.md:105-107`), and the plan's
wave-6 prose assigns no criterion row to them — it records the repairs as owning no acceptance
criterion of their own: T006 "repairs the tree-consistency of a recording earlier waves read",
T007 "pins a document's coverage rather than a criterion's reading", T008 "repairs the suite's own
mutant machinery, not a criterion's reading" (`PLAN.md:397-427`). No `### SCn` section appears
because the wave advances no criterion; the wave verdict rests on the three task sections above.

### GAP 1 — the recording's `filesExcludedAsBuildOutput` rode stale from T006 to T009 and still has no suite to redden it: T006 measured the tree at 50 excluded panel outputs against the recording's 49 and left the recording unwritten (reported at `.project/tasks/T006-re-measure-the-signal-shape-record.md:141`), T009 wrote the 50 two hours later (`research/raw/m057-record-shapes.json:512` at HEAD), and no suite asserts that value either at T006's head or at this reviewed HEAD — T009's own Log calls it "a count no suite asserts" (`.project/tasks/T009-re-measure-the-census-and-run-the-project-verify.md:139`). The deferral was honest, not a gap in the wave's accounting: the reason is stated in the Log, the task's interface contract fixed the change at exactly two values, the two asserted counts were repaired and are suite-held at every run, and the correction landed inside the same wave so no head shipped with the stale value. The gap that remains is a pin that does not exist: the wave built re-derivation pins for `filesScanned` and `jsonFilesScanned` (the shapes suite re-derives both on every run) but none for `filesExcludedAsBuildOutput`, so the next panel rebuild that changes the build-output file count drifts the recording silently again, reddening nothing until a human re-measures.
Risk: low — the value counts gitignored build output the suites deliberately do not derive, the drift
direction is always "panel rebuild changes the count", T009's same-wave re-derivation caught this
instance, and the two suite-held counts bound the damage: a future drift cannot move the recording's
asserted values without reddening `scripts/tutor-signals-shapes.test.mjs` immediately.
