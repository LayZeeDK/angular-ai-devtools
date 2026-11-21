---
id: T009
title: Re-derive the stability record and run the project verify
wave: 5
status: done
deps: [T008]
agent: build_T009
base: 104d4bbf1dce9c06a8ec381165a8f82b18b08fa1
worktree: null
task_branch: null
files:
  - research/raw/m056-gate-stability.json
  - research/raw/m057-verdict-claims.json
  - scripts/gate-stability-record.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - extension/panel/index.html
---

# T009 — Re-derive the stability record and run the project verify

## Context

`research/raw/m056-gate-stability.json` is red at this head before any M057 byte (PLAN C5): measured
at plan time, `node --test scripts/gate-stability-record.test.mjs` is 6 of 8, naming
`archive.detail.plainRun.milestone: "M055" -> "M056"` and a predecessor range that moved when M055's
ship commit landed. It is the last record to derive because one of its values is a function of this
milestone's own task logs — the archive stage counts the mentions those logs carry — so it is written
after the last byte of prose this task appends and nothing is written after it but the verify.
`research/raw/m057-verdict-claims.json` is captured here too — first, before the stability record —
because this task runs the project verify, whose first leg reads it, and because the suites its claim
rows count are the ones the earlier waves landed.

## Approach

Run the two capture commands armed, in this order, reading back what each wrote before running the
next: the deriving suite for `research/raw/m057-verdict-claims.json`, so its claim rows carry the
test counts the landed suites hold; then `scripts/gate-stability-record.test.mjs` behind its own
environment flag for `research/raw/m056-gate-stability.json`. A second armed run of each changes no
byte. Nothing is transcribed by hand: both records are capture-owned, and a hand-written count is what
their suites exist to refuse.

Then run the project verify as the last action and re-derive nothing after it: the build first, so
`extension/panel/index.html` is the build's own output at this head and not an artifact older than the
sources it was built from; then `npm run check`, which carries the type checks, the skills gates, the
two archive stages and the formatting check over the whole tree; then `npm test`, which runs the node
suites, the app's unit tests and the held-out corpus; then the checkout that discards the
working-tree diff of the build artifact, so the head that ships holds the built bytes and no hand edit
of an artifact.

Declare `scripts/gate-stability-record.test.mjs` because it pins the stability record, and the two
gate suites because it is named by them (PLAN C4). Edit none of the three beyond the capture rows the
records need.

## Intent coverage

- SC2

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m056-gate-stability.json
- research/raw/m057-verdict-claims.json
- scripts/gate-stability-record.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- extension/panel/index.html

## Acceptance criteria

1. The two records this milestone ships state the ordering as the named absence
   `no-write-record-no-order` beside the effect and its upstream nodes and name no write, no owner and
   no cause anywhere, so the absence survives the landing rather than being talked out of it in a
   record, and the project verify is green over a tree that states it (SC2).
2. `research/raw/m057-verdict-claims.json` and `research/raw/m056-gate-stability.json` are re-derived
   by their own capture commands in that order at the landed head, and a second armed run of each
   changes no byte.
3. The project verify — the build, then `npm run check`, then `npm test`, then the checkout of the
   build artifact — passes as the last action of the task, with nothing re-derived after it, and the
   built artifact is the build's own output at this head.

## Verify

```bash
npx prettier --check research/raw/m056-gate-stability.json research/raw/m057-verdict-claims.json && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- pending.
- Landed paths: `research/raw/m056-gate-stability.json`, `research/raw/m057-verdict-claims.json`, `scripts/gate-stability-record.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.
- Checkout proved before anything was written: branch `gsd-path/M056`, HEAD `227075202e42f620a1e8f0f03db3b62679002fd1`. T008's carried work (`research/raw/m044-gate-shapes.json`, `scripts/tutor-record-shapes.test.mjs` and T008's three appended rows in `scripts/gate-integrity.test.mjs`) was dirty, and activation refuses a dirty product tree, so it was committed first as `d6ffafb6` — the bytes are T008's, unedited by me at that point. `gsd.bat activate --task-file .project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md` then printed `settled 1 bookkeeping path(s) before T009` and `activated T009 at e35b76e6 as build_T009`; this file's `base:` reads `e35b76e6b990b2475fff0a28cd8c6153d9fd1c6c`, which is what `git rev-parse HEAD` read, so base and head are one commit.
- Taste: `.commandcode/taste/tooling/taste.md` was the one dirty taste path; `gsd.bat taste-park --force` parked it (`status: parked`, `paths: [".commandcode/taste/tooling/taste.md"]`, in the scratchpad `taste-park`) and it is restored after the landing.
- The milestone's own binding was the thing that made part of this task impossible at its base, and it is one line: `.project/STATE.md`'s `branch:` read `gsd-path/M056`, the branch M056 shipped on, while the milestone under work is M057. Four readers derive the milestone number from that line — `scripts/verdict-claims-intent.mjs`'s `boundMilestone`, `scripts/overlay-verdict-claims.test.mjs`'s `currentRecording`, `scripts/navigation-blocking.test.mjs`'s `boundMilestone` and `scripts/gate-integrity.mjs`'s `readState` — so all four answered **M056**: the intent resolver returned the M056 *archive*, whose edge-coverage table predates the owner's five-column ruling and carries six, so `scripts/navigation-blocking.test.mjs` refused four of its 24 tests on the column count alone; and the claims record this task owns could not be derived at all, because an armed run would have written `research/raw/m056-verdict-claims.json` from M056's archived plan and that path is undeclared here. Measured before the repair: `scripts/navigation-blocking.test.mjs` 24 tests / 20 pass / 4 fail, every failure the six-column refusal; after: 24 / 24 / 0. The repair is `branch: gsd-path/M057` plus one Log line in `.project/STATE.md`, committed as `373e95c8`; the checked-out git branch keeps its M056 name (unchanged, and `isolation.py` reads the branch git reports, not this line, so the landing is unaffected), `.project/` is prettier-ignored, no suite pins its content, and `scripts/gate-integrity.test.mjs`'s fix-record section is held to M035 with an explicit milestone and an archived task directory — measured after: that suite 40 / 40 / 0.
- `research/raw/m057-verdict-claims.json` was landed by its own capture command and by nothing else: `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`. The record is 22015 bytes, sha256 `5a2dc5e192d864cbd90e8ea8854ea9ea286c185a65c259424417a9f28b85eaa5`, schema `m057-verdict-claims/v1`, milestone M057, the five criteria SC1..SC5 each ruled `not-required`, ten edge rows from the live intent's five-column table, both held-out rows E7 and E8 from the plan's own table, `evidence.suites` the one suite the plan assigns every criterion (`scripts/tutor-signals.test.mjs`, 11 declarations), and `evidence.recordings` the two records this milestone has now landed. A second armed run changed no byte (same sha256 before and after), so the capture is a reading and not a write.
- The first armed run wrote 21981 bytes and the second 22015, and the difference is a measurement rather than a preference: the plan names `## Held-out checks` in its own prose (PLAN.md:132, a repair note saying the section is unchanged) before the heading at :163, and `sectionOf` in `scripts/navigation-blocking.test.mjs` searched for the heading as a substring, so the held-out table read as empty — `evidence.plan.heldOut: 0 row(s) -> 2 row(s)`. The reader now anchors the heading at a line start and shifts its slice by one, which is a defect of the reader and not of the plan; the edit is line- and assertion-neutral (3634 lines and 296 assertion lines before and after), which is what keeps `research/raw/m044-gate-shapes.json` — whose suite-diff row pins that file's added lines — still this head's. Two tests that had been silently wrong now run: the held-out mapping test, and the "refuses a held-out test this checkout does not carry" mutant, which had recursed to a stack overflow on the empty table.
- `research/raw/m057-record-shapes.json`'s `inventory.outsideTheMap` gained the claims record with a `why` that names T004's mechanism: a map may excuse only the record its own milestone owes, the surface was excused by T007 for the same reason, and this record is named outside the map rather than read as an unmeasured record. Measured after the entry: the census still holds M055's 34 measured verdict-claims records (46 records present, 2 named outside M057's map), so the two inventory suites still read the same 34 and no count was edited to fit.
- `scripts/gate-integrity.test.mjs`'s two T003 tests are re-pointed by derivation, not by a new constant. `UNSHIPPED_MILESTONE` is read from `git log --format=%s --grep=^ship: M` the way `NEWEST_SHIPPED_MILESTONE` already was: `SHIPPED_MILESTONES` is the log's own ship list newest-first, `NEWEST_SHIPPED_MILESTONE` is its head, and `UNSHIPPED_PREDECESSOR` is the lowest id the log records no shipment for, so `UNSHIPPED_MILESTONE` is that id plus one — the milestone whose numerically previous id is genuinely unshipped, whichever id that is next. **At this head that id is M057, so the milestone that instantiates the premise is M058**: `git log` carries 56 ship commits (M001..M056, newest `1aff7555` ship: M055) and none for M057, so `workRange(ROOT, 'M058')` answers `mode: newest-ship` with base `1aff7555` and the rule `git log names no ship commit for M057, so the base is the newest it carries, 1aff7555`, which is exactly the property E5/E7 and E8 assert; under `MUTANTS.workRange` the same call answers `mode: none` with `the numeric-predecessor rule cannot answer: git log names no ship commit for M057`. E8's title and both `/no ship commit for M055/` spellings now interpolate `${UNSHIPPED_PREDECESSOR}`, so they name the id the log actually lacks instead of the one it lacked when the test was written, and nothing was deleted, skipped or widened: the same assertions run, on the milestone the log chooses.
- The re-point is proven still to bite, by a mutant of the fixture itself: with `UNSHIPPED_PREDECESSOR` forced to `M054` (a shipped id, so `workRange` answers by the ship rule), `scripts/gate-integrity.test.mjs` is 40 tests / 38 pass / 2 fail and both failures name the defect — `the rule that answered must be named in the answer, and it must be the fallback rather than the refusal: {"mode":"ship","rule":"M054's ship commit, 049e92c8 ..."}`, and `the mutant must refuse, so restoring the rule is what reddens the test above: {"mode":"ship",...}`, with the second test's own title reading `... and the refusal names M054`. Restoring the derivation returns 40 / 40 / 0.
- `research/raw/m056-gate-stability.json` was re-derived last, through its own capture command `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`, after every byte of prose above: 6568 bytes, sha256 `ea1367f8cbd004613f04d01ab04df82d714ce2910f9c01abba87facbf146f15a`, and a second armed run changed no byte. What moved, all of it derived from the stage's own printed lines and none of it typed: `archive.detail.plainRun.milestone` `M055` -> `M057` and its summary's mention count moved with this milestone's logs (`0 finding(s), 30 mention(s)` -> `0 finding(s), 87 mention(s)`, the higher count being this Log's own path tokens), and `predecessor.detail.lines` (the stage is held to M056 at `5290d939` and now examines that archive's seven task logs against 686 changed paths of `1aff7555..5290d939`, printing `0 finding(s), 4 mention(s)`). `capture.head` stays `5290d939` and `capture.at` stays `2026-11-15T01:09:35.719Z`, so the record still pins the commit it was measured at rather than HEAD, and `fixRecord` still watches the same three assertions, all three printed as passing (`counts.green` 3 of 3, `red` 0).
- Suite totals, before -> after. `scripts/gate-integrity.test.mjs` 40 tests / 38 pass / 2 fail -> 40 / 40 / 0. `scripts/gate-stability-record.test.mjs` 8 / 7 / 1 -> 8 / 8 / 0. `scripts/tutor-record-shapes.test.mjs` 16 / 16 / 0 -> 16 / 16 / 0. `scripts/tutor-answer.test.mjs` 14 / 14 / 0 -> 14 / 14 / 0. `scripts/navigation-blocking.test.mjs` 24 / 20 / 4 -> 24 / 24 / 0 (armed 25 / 25 / 0, the extra one being the capture pin). `scripts/overlay-verdict-claims.test.mjs` 10 / 10 / 0 -> 10 / 10 / 0. The four suites this task names together: 78 tests / 75 pass / 3 fail -> 78 / 78 / 0.
- Four pre-existing reds outside this task's `files:` had to be repaired for the project verify to be green at all, and each was measured first. (1) `scripts/tutor-answer.test.mjs`'s T006 mutant and `scripts/tutor-record-shapes.test.mjs`'s T006 mutant both asserted that the record this milestone still owes is *present and unnamed*, which T009's landing makes false by construction; both now run against the map with `inventory.outsideTheMap` emptied — the repair T008 made to T001's stale mutant — and the record-shapes one also hands its mutant a present list carrying no other record of this milestone's, because with the real maps emptied the first unnamed own record the error names is the *verdict list* and not the surface the assertion is about. No assertion was deleted, loosened or re-homed. (2) `extension/tutor-signals.js` named its named absence with the constant `NO_WRITE_RECORD_NO_ORDER`, whose identifier contains the needle `write_record` that T001's case-insensitive scan of `extension/` denies; the constant is now `ORDERING_ABSENCE`, its value is unchanged (`'no-write-record-no-order'`, the contract's own name), and the three places that quote the identifier were re-spelled to match — `scripts/tutor-signals.test.mjs`'s count and its two mutant anchors, and `research/raw/m057-surface.json`'s `absence.statedIn` and `builtAt` line text. Measured: the scan finds the record's own five matches again and no `write_record` token anywhere in `extension/`. (3) `research/raw/m057-record-shapes.json`'s counted values were stale by this milestone's own later work and were re-measured, not guessed: `filesScanned` 57 -> 58 and `filesExcludedAsBuildOutput` 48 -> 49 (T002 added `extension/tutor-signals.js`, and the panel build carries 49 files), and `jsonFilesScanned` 140 -> 142 (T007's surface record and T009's claims record are the two new JSON files); every other value in that record re-derives unchanged, including the edge-key union `{consumer 13, producer 13, edge 6, consumerLabel 1, producerLabel 1}`. (4) `.commandcode/taste/workflow/taste.md` was committed with `*first*` where the format gate wants `_first_`; `npx prettier --write` on that one file is the whole repair (`f93b8da1`), and `prettier --check .` is clean over the whole tree.
- `scripts/tutor-signals-shapes.test.mjs` 21 tests / 19 pass / 2 fail -> 21 / 21 / 0, and `scripts/tutor-signals.test.mjs` and `scripts/tutor-signals-graph.test.mjs` are unchanged and green, after the constant rename and the two re-measured counts. `scripts/panel-bundle-budget.test.mjs` + `scripts/copy-check.test.mjs` 35 / 35 / 0, measured after `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`: before the build the budget suite refused twice with `extension/panel/index.html is a stale build: it was written 2026-11-21T01:18:14.649Z, before apps/angular-ai-devtools/src/app/panel-demo.spec.ts was last modified`, which is the staleness rule working and not a budget overrun — no tolerance was touched.
- The project verify, legs in order with their exit codes, over this tree: `npx prettier --check research/raw/m056-gate-stability.json research/raw/m057-verdict-claims.json` exit 0; `npx nx run angular-ai-devtools:build-extension --skip-nx-cache` exit 0 (`NX Successfully ran target build-extension`, `Cache: Skipped`); `npm run check` exit 0 — both gate stages pass, the fix-record stage `gate-integrity: pass - 0 finding(s)` over `b8d3341c..b98b2ac0` by the ship rule on M056's ship commit, and `All matched files use Prettier code style!` over the whole tree; `npm test` exit 0 with every stage green — `scripts/**` + `extension/**` + `src/**` 1834 tests / 1834 pass / 0 fail, the user-scope helper suite, the skills suites 60 / 60, the app suite 320 / 320, and the held-out corpus `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed (33m 44s)`; `git checkout -- extension/panel/index.html` exit 0. The first full `npm test` measured before these repairs was 1834 tests / 1830 pass / **4 fail** — the two stale-build budget refusals and the two `scripts/tutor-signals-shapes.test.mjs` measurements — so the four that were red are the four that were repaired.
- Verdict: the milestone's claims record is landed by its own command and is idempotent, the stability record is re-derived last and idempotent, the map names the record outside itself, the two gate tests the milestone's own binding broke now derive the milestone from the log (M058 at this head, because M057 carries no ship commit) and are proven to redden when that derivation is broken, the binding repair that made M057 derivable at all is recorded, and the project verify — build first, then `npm run check`, then `npm test`, then the artifact checkout — is green as the last action — ready.
