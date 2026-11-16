# Review — wave 17, cycle 2

Cycle: 2
Depth: full
Wave verdict: fail
Tasks reviewed: 1
Reviewed HEAD: be00283afe1578b5eeb7e9053538e0f90f4094f1

This file replaces `wave-17.cycle1.md`, which failed this wave and is deleted with this write. Cycle 1
found the two recordings stale at `cd319fa9`; they were re-derived at `fc9b3057` and both suites were green
against that tree. Two repairs landed afterwards — T025 (`58690aa4`) and T026 (`be00283a`) — and moved the
same values again, so at this head both suites are red for the same reason as in cycle 1, with different
numbers.

## T024 — Re-derive the two gate recordings our waves moved: fail

- ❌ **AC1 — the census suite does not exit 0 unarmed at this head.** `node --test scripts/gate-integrity.test.mjs`
  prints `ℹ tests 40` / `ℹ suites 0` / `ℹ pass 39` / `ℹ fail 1`, exit 1, and the failing test is
  `T004: the three new sections are what this head derives, so a default run is a read`
  (`scripts/gate-integrity.test.mjs:4445`) with
  `AssertionError [ERR_ASSERTION]: suiteDiff in the recording is not what this head derives: "suiteDiff.differing[6].addedLines: 3428 -> 3493"`.
  The record and the derivation differ on four recorded values, the first argument being
  `record.suiteDiff` and the second what this head derives: `addedAssertionLines: 1146 -> 1166`,
  `scripts/console-panel-record.test.mjs` `addedLines: 3428 -> 3493`, and
  `scripts/console-panel-render.test.mjs` `addedLines: 3204 -> 3442`, `addedAssertionLines: 207 -> 227`.
  T024's AC1 asks for exactly `exits 0 unarmed at this head`, and this head derives different bytes.
- ❌ **AC3 — the stability record does not exit 0 unarmed either.** `node --test scripts/gate-stability-record.test.mjs`
  prints `ℹ tests 8` / `ℹ suites 0` / `ℹ pass 7` / `ℹ fail 1`, exit 1, with
  `Error: the recording disagrees with this run's derivation at 4 value(s) (re-capture with M056_CAPTURE=1 after naming what moved): archive.detail.plainRun.summary: "gate-integrity: pass - 0 finding(s), 145 mention(s)" -> "gate-integrity: pass - 0 finding(s), 146 mention(s)"; fixRecord.exitCode: 0 -> 1; predecessor.summary: "gate-integrity: pass - 0 finding(s), 145 mention(s)" -> "gate-integrity: pass - 0 finding(s), 146 mention(s)"; verdict: "all 3 measurements pass at this head: …" -> "1 of the 3 measurements does not pass at this head: … the gate-integrity suite exits 1 with no refusal …"`.
  The same four values cycle 1 named have moved again, with new figures: both summaries now read 145 against
  146, the verdict is again the failing one, and `fixRecord.exitCode` again reads 0 against a derivation of
  1 — the record's own section says `fixRecord.exitCode=0` while this head derives 1, because the census
  suite it records exits 1, which is the coupling the two records share.
- ❌ **AC5 — the task's fenced Verify does not pass at this head.** Its first command,
  `node --test scripts/gate-integrity.test.mjs scripts/gate-stability-record.test.mjs`, exits 1 on both
  halves for the reasons above, so the chain stops before `npm run check` and the Prettier stage. Run on
  their own outside the fence, both pass: `npm run check` exits 0 (`verification gate (structure): pass`,
  `gate-integrity: pass - 0 finding(s), 146 mention(s)`, `All matched files use Prettier code style!`) and
  `npx prettier --check research/raw .project/tasks/T001-measure-the-capture-and-the-digest.md` prints
  `All matched files use Prettier code style!`.
- ✅ **AC2 — the accounting is exact, and the drift is exactly the two later repairs.** The record's census
  counts, read out of `research/raw/m044-gate-shapes.json`, are
  `{"differing":16,"edited":10,"added":6,"removedAssertionLines":1,"recutAssertionLines":1,"droppedAssertionLines":0,"addedAssertionLines":1146}`
  with the two console rows `{"file":"scripts/console-panel-record.test.mjs","addedLines":3428,"addedAssertionLines":224}`
  and `{"file":"scripts/console-panel-render.test.mjs","addedLines":3204,"addedAssertionLines":207}` — the
  numbers T024's 16-row Log table accounts for row for row, and the record has not moved since cycle 1 read
  that table against it. The delta to this head is T025's alone:
  `git diff --numstat fc9b3057..HEAD -- scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs`
  prints `91 26 scripts/console-panel-record.test.mjs` and `246 8 scripts/console-panel-render.test.mjs`,
  i.e. net +65 and +238 lines, which are precisely the `3428 -> 3493` and `3204 -> 3442` the failing
  assertion reports. `git diff --numstat fc9b3057..HEAD -- research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json`
  prints nothing, so neither recording was touched after the re-derivation.
- ✅ **AC4, read half — an unarmed run of each suite writes no byte.** The census run reports
  `research/raw/m044-gate-shapes.json at load: 108672 bytes, sha256 6ed0c1c7c1312f5ee29e09e56c6ef59466dd86d5d07c45cb93ec5de19570ed15`
  and `after the run: sha256 6ed0c1c7…`, and the stability run reports `at load: 68045 bytes, sha256 09895a47…`
  and `after the run: sha256 09895a47…`; both suites are read-only even when they fail. The armed halves this
  criterion also states — one armed run writes, a second writes nothing — were not run in this review,
  because writing either record is the repair and not the review.
- Note — the cause is ordering, not workmanship, and it is the same cause cycle 1 named. The re-derivation
  landed at `fc9b3057` ("review(M057): cycle reviews for all 17 waves; re-derive the two stale recordings"),
  which is an ancestor of T025's landing commit (`git merge-base --is-ancestor fc9b3057 58690aa4` exits 0),
  and `git log --oneline fc9b3057..HEAD -- scripts/console-panel-record.test.mjs scripts/console-panel-render.test.mjs`
  names that one commit and no other. The mention count moved the same way after the re-derivation: the
  records pin 145 and this head derives 146, which `npm run check` prints as
  `gate-integrity: pass - 0 finding(s), 146 mention(s)` — the task-Log text the fix-record stage counts grew
  by one mention in the entries appended after `fc9b3057` (`53909d69` appends 30 lines to T001's Log, and
  T025's and T026's own task files follow it).
- Note — the repair is the mechanism T024 documents, run once more at this head, and no newer re-derivation
  exists anywhere to inherit: `git log --all --oneline -- research/raw/m044-gate-shapes.json research/raw/m056-gate-stability.json`
  names `fc9b3057` newest. The two documented armed commands are the ones both records carry in their own
  `capture.command` fields — `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`
  then `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs` — and the values that
  must be named in the Log as moved are the ones both failures name: `addedLines 3428 -> 3493` and
  `addedAssertionLines 1146 -> 1166` for the census, `addedLines 3204 -> 3442` with
  `addedAssertionLines 207 -> 227` for the render suite, and the mention count `145 -> 146` with the
  `fixRecord.exitCode 0 -> 1` and the derived verdict it produces.
- Note — this failure blocks the milestone's project verify: `npm test` runs
  `node --experimental-strip-types --test "scripts/**/*.test.mjs"`, which includes both of the suites shown
  red above, so the gate that judges SC1–SC5 cannot go green until the two records are re-derived at this
  head. Wave 10 and wave 14 are not the cause: their repairs are verified in `wave-10.cycle2.md` and
  `wave-14.cycle2.md`, and T025's suite lines are the largest single movement these two records have to
  absorb.

## Intent coverage

This wave's task declares no criterion — `.project/tasks/T024-re-derive-the-two-gate-recordings-our-waves-moved.md`
`## Intent coverage` reads `- None` — so `gsd review-check` requires exactly zero `### SCn` blocks here
(`ownedCriteria` returns the empty list and `checkWave` fails any heading that is not in it). The five
criteria the milestone owns are recorded here as non-regression: this wave writes two gate records and no
product file, so the evidence for each sits in the wave that owns it and none of them moved.

- ✅ yes — SC1 "The panel reports one finding per captured console diagnostic, naming the diagnostic's own text and the code it carries, without inventing a code for a message that has none." Neither recording is read by the join or the pane: `extension/console-join.js` hashes to `b54f8dec3af99b1beba8b59326d5aa67d1db49ba` (14,235 bytes) and `apps/angular-ai-devtools/src/app/panel-console.ts` to `790a72c72d2a762fc3dc1b9063a19e53c38f4db2` (24,968 bytes), each identical to the `HEAD` blob, and `node --test scripts/console-join.test.mjs scripts/console-panel-render.test.mjs scripts/recording-consistency.test.mjs` prints `ℹ pass 87` / `ℹ fail 0`.
- ✅ yes — SC2 "A diagnostic whose code the digest carries is reported with that entry's title, and the join is proven against the shipped `extension/error-digest.json` rather than a fixture." The digest is untouched by this wave and the join's shipped-digest answer is quoted in `wave-10.cycle2.md`; the record suite that pins the pane's rendering of it passes 38 of 38 at this head.
- ✅ yes — SC3 "A diagnostic whose code the digest does not carry reports the absence by name — the code, or the fact that the message carried no code — instead of a count, an empty cell, or a remedy." `AC2: a code the digest lacks renders by name, and a count instead reddens` passes in the same run, and this wave writes no join and no pane line.
- ✅ yes — SC4 "A page that captured nothing reports that it captured nothing, distinguished from a capture that produced diagnostics the digest has no entries for." `AC1: captured-nothing is that statement, never an empty list, and never a claim of silence` passes; no recorded case in `research/raw/m045-console-panel.json` is edited by this wave.
- ✅ yes — SC5 "The surface renders only what the capture states: no cause, no element, no fix, and no "angular" attribution that the message text does not carry." `panel-console.ts` is byte-identical to `HEAD`'s blob as quoted above and the prohibition mutants (`no-cause`, `no-element`, `no-remedy`, `no-unattributed-wording`) all redden naming their defect in the render suite's 41 of 41 passing tests.
- Note — no criterion is harmed by this wave, but the wave's own criterion — its AC1, AC3 and AC5 — is red, so the wave verdict is `fail` and this file must not be read as a clearance of the milestone's verify.
