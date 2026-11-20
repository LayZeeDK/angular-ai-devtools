# Review — wave 4, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 2feba85e1111f9d5b1b3fd0e6d0d79a0a72e56dd

## T004 — Record the surface, capture the claims, run the project verify: pass

- ✅ T004/AC1 — the surface and verdict-claims records exist with their own capture commands at the
  landed head, and the verdict names the artefact the portal itself does not render: the claims
  record states its capture command, check, written record and criteria
  (`research/raw/m055-verdict-claims.json:58-67` — command `set "M044_CAPTURE=1"&& node
  --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`, records
  `research/raw/m055-verdict-claims.json`), and its ruling answers the portal clause rather than
  dodging it: a required row would name a driver whose four readings — toolElements, drawnRect,
  descriptor, noDevContext — cannot carry a claim about this repository's own gate, so all three
  rows are `not-required` and each cites the suite the plan assigns its criterion
  (`research/raw/m055-verdict-claims.json:12-16`, the per-row reasons at `:75`, `:90`, `:105`).
  Each row carries its own `claims[].artefactPath` (`:76` SC1 →
  `scripts/tutor-record-shapes.test.mjs`; `:89` SC2 and `:104` SC3 →
  `scripts/tutor-answer.test.mjs`), and the record is re-derived by its own armed command, not
  transcribed — the Log's re-capture moved exactly the count the suites changed and no other byte
  (`.project/tasks/T004-…md:425-430`: "the list moved: `evidence.suites[1].tests: 11 -> 12`", a
  second armed run changing no byte).
- ✅ The three shipped facts are carried in the Log, re-confirmed at this head, and each is pinned
  by a suite rather than asserted: (1) `claims[].artefactPath` is carried by 12 of the 34 records
  the map measured and the other 22 (M022–M043, four shapes) carry none, "which is why the surface
  renders `no-artefact-named` in its own sentence" — pinned by the C4 leg that renders 44 claims as
  answers and 22 records as the absence, observed: "T002 records: 34 verdict-claims records, 44
  claim(s) answered with their own claims[].artefactPath, 22 record(s) rendered as
  no-artefact-named" (`scripts/tutor-answer.test.mjs:950-1078`); (2) the authored index holds two
  facts per row and gained no third — pinned by the byte-level refusal and the frozen rows
  (`extension/tutor-index.js:31-94`, reviewed in wave 2; the Log's restatement at
  `.project/tasks/T004-…md:236-238`); (3) E4's `missing-artefact` state has no live instance — all
  44 `artefactPath` values resolve — so the state is pinned by a constructed input, and the
  recording says so rather than manufacturing a dead path
  (`extension/tutor-foundations.js:73-76`; the constructed-input test at
  `scripts/tutor-answer.test.mjs:1115-1152`). `no-artefact-named` for the 22 is therefore the
  correct answer for them, not a defect.
- ✅ AC2's re-derivations are real captures with before/after values, not re-types:
  `research/raw/m044-gate-shapes.json` was re-derived by its own armed command and a second armed
  run changed no byte (`.project/tasks/T004-…md:279-292`), the diff moving exactly the suite-diff
  and declaration counts the two M055 suites and their mutant tests added —
  `archiveReferences.references[179].line` 388 → 420,
  `suiteDiff.differing[18]` (`scripts/interaction-story.test.mjs`) 2079 → 2188 added lines,
  `differing[26]` (`scripts/tutor-answer.test.mjs`) 1503 → 1598,
  `counts.addedAssertionLines` 4155 → 4167, `declarations.tests` 2405 → 2407 — and no third
  (`research/raw/m044-gate-shapes.json:1589`, `:2501-2510`, `:2612-2621`, `:2746`, `:2763-2766`;
  the hunk-level diff confirms these are the record's only moved values). The claims record's
  `evidence.suites` moved 11 → 12 with the mutant test T004 added
  (`research/raw/m055-verdict-claims.json:48-50`), and `research/raw/m056-gate-stability.json`'s
  one moved value is the mention count that is a function of the Log's own text —
  `archive.detail.plainRun.summary` `0 finding(s), 32 mention(s)` → `0 finding(s), 30 mention(s)`
  — with the suite pinning the field's shape and the exit code rather than N
  (`research/raw/m056-gate-stability.json:33`; the design reason at
  `.project/tasks/T004-…md:519-527`). The gate stability capture is last, with no commit between it
  and the landing, as the Log requires (`.project/tasks/T004-…md:432-440`).
- ✅ AC3 — the project verify ran as the last action and nothing was re-derived after it:
  `npm run check` exits 0 (tsc ×4, skills, `gate:verification`, `gate:archive-paths`, `gate:fix-record`,
  `prettier --check .` clean) and `npm test` exits 0 — `tests 1789`, `pass 1789`, `fail 0` in the
  node-suite half, the app, skills and held-out halves green, the corpus
  `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed`
  (`.project/tasks/T004-…md:442-448`, `:504-508`), recorded `result: "pass"` in
  `.project/build/verify-ledger.jsonl` at `9c4908122bf8cf59c698caa4a541684f034d4d16` and re-read
  green at this head by the landing verify. The first verify attempt's failure is recorded in the
  same ledger as `fail` at `7a056be6` — the record of a gate that gates, not a hidden red.
- ✅ The two blockers the earlier passes returned are closed at their cause, each by a subtraction
  the recording itself states, and each is proved narrow by a mutant. Blocker 3's cause —
  `realRecords` read the directory while the map counted a set, so
  `research/raw/m055-verdict-claims.json` (named in `inventory.outsideTheMap`) read as an
  unmeasured 35th (`scripts/tutor-answer.test.mjs:885-898` at `9c490812`, quoted in the Log at
  `.project/tasks/T004-…md:471-493`) — is fixed by one shared helper:
  `outsideTheMap` reads the recording's own named paths (`scripts/tutor-answer.test.mjs:170-181`)
  and `mappedRecords` subtracts exactly them from the records present
  (`scripts/tutor-answer.test.mjs:188-196`, doc comment: "Only the named paths are subtracted, so a
  record that is present and not named outside the map is still measured and still reddens the
  census below"), with `pinRecordCensus` strict in both directions so 34 cannot be satisfied by the
  wrong 34 (`scripts/tutor-answer.test.mjs:917-949`) and the census mutant reddening naming the
  unlisted record (observed: "research/raw/m901-verdict-claims.json is present and is not named
  outside the map, so the map must measure it: T001 measured 34 verdict-claims record(s) and 2 are
  named outside the map", `scripts/tutor-answer.test.mjs:1082-1110`), plus the pin that the
  subtraction is exactly the one verdict-claims path the map names outside itself
  (`scripts/tutor-answer.test.mjs:1100-1107`). Blocker 4's cause — M049's recorder census counted
  the word `interaction` in `extension/tutor-index.js:72`, an authored question that is not a
  recording, red at the base commit itself before any byte of this task — is fixed by excluding the
  authored index beside the existing narration exclusion, by file and not by text, with the census
  held to exactly those two names (`scripts/interaction-story.test.mjs:821-836`, the constant
  `READERS` at `:838`) and the failure now naming the offending file instead of printing an
  anonymous `1 !== 0` (`scripts/interaction-story.test.mjs:880-901`). Both files are declared in
  this task's `files:` (`.project/tasks/T004-…md:15-16`).
- ✅ The census exclusion is narrow and proved so: the mutant writes the word into a recorder
  (`extension/agent-main.js`) in memory and the pin reddens naming it
  (`scripts/interaction-story.test.mjs:929-972`, observed in the landing's run), the same test
  writes the word into both readers and stays green — the exclusion is by file, so no third file
  can be excused silently — and the pin still asserts every file's listener count and that the
  census reads every `extension/*.js` file on disk, so a file added later is measured rather than
  skipped (`scripts/interaction-story.test.mjs:886-889`, `:938-947`).
- ✅ `app.routes.ts`'s `di-doctor` entry was restored by T004 after an interrupted pass removed it:
  the killed pass had written an uncommitted deletion of
  `{ path: 'di-doctor', component: N3DiDoctorComponent }` — a route no part of the task asks for,
  listed as an expected route by `app.spec.ts` and the documented mutant of
  `tests/held-out/fixture-explainers-unchanged.test.mjs` — and it was restored with
  `git checkout -- apps/angular-ai-devtools/src/app/app.routes.ts` before the landing, so the tree
  carries only paths the task declares (`.project/tasks/T004-…md:495-502`). The entry is present at
  this reviewed head (`apps/angular-ai-devtools/src/app/app.routes.ts:116`).
- ✅ The build artifact is the build's own output at this head: the verify's first leg rebuilds and
  reproduces the shipped bytes exactly — sha256 `b840cad0…`, 778 bytes, no `git status` entry for
  `extension/panel/index.html` — so the interface contract's `git checkout --` had nothing to
  discard (`.project/tasks/T004-…md:510-517`).
- ✅ Observed at the reviewed head: `node --experimental-strip-types --test
  scripts/tutor-record-shapes.test.mjs scripts/tutor-answer.test.mjs` — tests 26, pass 26, fail 0;
  `node --experimental-strip-types --test scripts/panel-routes.test.mjs
  scripts/component-search.test.mjs` — tests 20, pass 20, fail 0.
- ⚠ Declared limit, not a defect: `research/raw/m055-surface.json` and the eight re-cited surface
  records landed at `9c490812` (the third pass) rather than in this commit's own diff, because the
  fourth pass resumed a tree the killed pass had already written most of and this commit re-derives
  the two gate captures the resume invalidated (`.project/tasks/T004-…md:454-468`). The surface
  record's `capture.head` is at the head it recorded, and the landing's own verify re-ran the whole
  chain at this head — the run recorded here is the landing's, not a guessed number
  (`.project/tasks/T004-…md:508-510`).
- ⚠ Declared limit, not a defect: one `npm test` in the fourth pass lost its exit code to a botched
  redirect; the Log records it as exactly that and defers to the landing's own Verify for the exit,
  which re-runs the whole chain (`.project/tasks/T004-…md:507-510`). The ledger's `pass` row is the
  landing's run.

## Intent coverage

### SC1 — The panel, for a question whose answer a record contains, names the artefact file, the milestone the record belongs to and the criterion the artefact answers, each of the three read from the record's own fields — the milestone from the record's `milestone` field, the criterion from its criterion field, the file from its artefact-path field — and none of the three composed from a filename, a path convention or the record's prose fields; a mutant that assembles an answer by file naming or copies the derivation's prose as the answer reddens.: pass

- ✅ Covered by T004: `research/raw/m055-verdict-claims.json` derives its three rows from the intent
  and the plan's own tables, not from a transcription — the record's `quotes` section states the
  extraction routine and that the 3 criteria are compared character for character by
  `scripts/overlay-verdict-claims.test.mjs` (`research/raw/m055-verdict-claims.json:4-8`) — and its
  capture command, check and criteria are stated (`:58-67`). The surface record and the eight
  re-citations are re-derived at the head they record (`.project/tasks/T004-…md:211-217`).

### SC2 — A question no record answers is reported as unanswered, naming which absence holds — no criterion in any readable record matches the question, a matched criterion names no artefact path, or the records cannot be read — and that state is rendered as its own, distinct from an answer whose named artefact file is absent where the record says it lives, which names the record and the missing path beside the absence; a mutant that renders an unanswered question as an answer, or a missing artefact as unanswered, reddens.: pass

- ✅ Covered by T004: the C4 leg renders 44 claims as answers and 22 records as the absence, and the
  Log carries the fact with the reason — "the surface renders `no-artefact-named` for them, exactly
  and in its own sentence, and that is the reason the surface must name what it cannot read rather
  than a defect of the surface" (`.project/tasks/T004-…md:232-235`), re-confirmed at this head
  (`:311-317`).

### SC3 — Nothing is cited that a record does not contain: every artefact path the panel renders is one the named record states and a file that exists where the record says it lives at the time the answer is served — inside the milestone's archive (`.project/archive/05*/`) when the record names archived evidence, at the repo-root path the record names otherwise — and every criterion id rendered appears among the named record's own criterion fields; a mutant that renders a path no record states, a file that is not there, or a criterion id the record does not carry reddens.: pass

- ✅ Covered by T004: the gate shapes and gate stability records are re-derived by their own armed
  commands with a second armed run changing no byte each (`.project/tasks/T004-…md:279-292`,
  `:432-440`, `:519-527`), the stability capture is last with nothing committed between it and the
  landing, the digest and the copy-check fact move together with the file declared in `files:`
  (`.project/tasks/T004-…md:44-65`), and the project verify passes as the last action with nothing
  re-derived after it (`.project/build/verify-ledger.jsonl`, `result: "pass"`).

## Held-out edges

- E4 stays owned by `scripts/tutor-answer.test.mjs` (`research/raw/m055-verdict-claims.json:29-31`)
  and its no-live-instance status is restated by the Log at this head — the state is pinned by a
  constructed input, and the recording says so
  (`.project/tasks/T004-…md:239-241`).
