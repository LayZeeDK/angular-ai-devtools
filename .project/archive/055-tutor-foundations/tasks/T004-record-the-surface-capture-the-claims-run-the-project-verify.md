---
id: T004
title: Record the surface, capture the claims, run the project verify
wave: 4
status: done
deps: [T003]
agent: build_T004
base: 31bc2c6a1b626b885b68b42a34946576247711b7
worktree: null
task_branch: null
files:
  - research/raw/m055-surface.json
  - research/raw/m055-record-shapes.json
  - scripts/tutor-record-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/interaction-story.test.mjs
  - research/raw/m055-verdict-claims.json
  - research/raw/m054-surface.json
  - research/raw/m053-surface.json
  - research/raw/m052-surface.json
  - research/raw/m051-surface.json
  - research/raw/m050-surface.json
  - research/raw/m049-surface.json
  - research/raw/m048-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
  - extension/panel/index.html
---

# T004 — Record the surface, capture the claims, run the project verify

## Context

The surface ships in wave 3, and its landing moved the route table and the loader map — the lines
eight surface recordings pin — and added sentences `extension/copy-digest.json` does not carry. The
milestone's verdict is a traceability claim about this repository's own records, so the portal rule
binds hardest here: the Insurance Portal is tried first and the verdict names the route tried and
the artefact the portal itself does not render — the records and the files they name. The pre-flight
`gsd land` runs refuses a declared recording whose `capture.head` is not HEAD and runs the repo's
pre-commit hook over the paths committed, both before the Verify — so every recording this task
re-derives is re-derived at the head it lands, as its last action before the Verify, not before a
later edit.

## Approach

Append the Log after the last recording byte. Record the route, the loader key and each state with
the answer field it reads into `research/raw/m055-surface.json`. Re-cite the surface records whose
`app.routes.ts` and `panel-demo.ts` line numbers the twenty-eighth surface moves —
`research/raw/m054-surface.json`, `research/raw/m053-surface.json`, `research/raw/m052-surface.json`,
`research/raw/m051-surface.json`, `research/raw/m050-surface.json`, `research/raw/m049-surface.json`,
`research/raw/m048-surface.json` and `research/raw/m048-surface-copy.json` — re-derive
`research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json` and
`extension/copy-digest.json`, authoring the digest rows the new surface's sentences need, and move
`apps/angular-ai-devtools/src/app/panel-demo.ts`'s copy-check fact with the digest's count — that
file declared in this task's `files:` this time, the lesson M054's T004 recorded — each
re-derivation with its own capture command, never by hand. Declare every suite that enumerates a
table or pins a recording re-derived here rather than discovering them by refusal:
`panel-demo.spec.ts` (holds each `FACTS` entry field-for-field to the shipped join),
`scripts/copy-check.test.mjs` (pins `extension/copy-digest.json` and the re-cited copy surface
records), `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs` and
`scripts/gate-stability-record.test.mjs` (pin the gate recordings) — declared, not edited.

Capture `research/raw/m055-verdict-claims.json` with its own capture command, **Insurance Portal
first**: `control-angular-devapp up --target portal`, the portal route tried named (`/home` first),
the panel route `tutor-foundations` opened against the portal's inspected tab, and the verdict
naming the artefact the portal itself does not render — this repository's records and the files
they name; no route of any page produces a traceability answer about this repository's own gate.
SC1's answer carries the three fields read from the record's own fields; SC2's three absences and
the missing-artefact state are captured as four distinct renderings; SC3's presence read is captured
at answer time. A fixture is a fallback only for the named gap that the portal could not be served,
and a verdict that reaches a fixture without naming both the route tried and the missing artefact
does not count as a verdict.

Rebuild `extension/panel/index.html` with the project verify's own build and discard the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact (the interface contract). Run the project verify as the last action,
re-deriving nothing after it.

## Intent coverage

- SC1
- SC2
- SC3

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T003 lands a freshly
built copy that serves the new panel surface; T004's verify rebuilds it and discards the
working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds
the built artifact. The file changes only through
`npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

  - research/raw/m055-surface.json
  - research/raw/m055-record-shapes.json
  - scripts/tutor-record-shapes.test.mjs
  - scripts/tutor-answer.test.mjs
  - scripts/interaction-story.test.mjs
  - research/raw/m055-verdict-claims.json
  - research/raw/m054-surface.json
  - research/raw/m053-surface.json
  - research/raw/m052-surface.json
  - research/raw/m051-surface.json
  - research/raw/m050-surface.json
  - research/raw/m049-surface.json
  - research/raw/m048-surface.json
  - research/raw/m048-surface-copy.json
  - research/raw/m056-gate-stability.json
  - research/raw/m044-gate-shapes.json
  - extension/copy-digest.json
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - scripts/gate-stability-record.test.mjs
  - extension/panel/index.html

## Acceptance criteria

1. `research/raw/m055-surface.json` and `research/raw/m055-verdict-claims.json` exist with their own
   capture commands and `capture.head` at the landed head; the verdict names the portal route tried
   and the artefact the portal lacks — this repository's records and the files they name — and any
   fixture use names both.
2. The eight re-cited surface records, `research/raw/m056-gate-stability.json`,
   `research/raw/m044-gate-shapes.json` and `extension/copy-digest.json` are re-derived with their
   own capture commands at the landed head, the digest carries the new surface's sentences, and
   `apps/angular-ai-devtools/src/app/panel-demo.ts`'s copy-check fact moves with the digest's count.
3. The project verify (`npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run
   check && npm test`) passes as the last action of the task, with nothing re-derived after it.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test && git checkout -- extension/panel/index.html
```

## Log

- **Returned `blocked` with two measured causes, both outside this task's `files:`.** Nothing was landed
  and the project verify was not run as the last action, because two of its inputs cannot be produced
  from this task's allow-list. Everything else this task owes is measured in the working tree at
  `aa90dcd0b344d0a7bdd3b1a4d7ae87f5fd772030`; the two refusals are named below with their minimal fix,
  so a re-dispatch after the fix starts from these readings rather than from a red suite.

- **Blocker 1 — `research/raw/m055-verdict-claims.json` cannot be captured.** Its own capture command
  `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"`
  refuses inside `derivedClaimsFrom` (`scripts/navigation-blocking.test.mjs:2938-:2945`):
  `SC2 carries one citation, so every edge the intent assigns it must be held by the same suite, and they
  are held by ["scripts/tutor-record-shapes.test.mjs","scripts/tutor-answer.test.mjs"]`. Cause, measured:
  `suiteForEdge` (same file, :2868-:2888) sends a held-out edge to the plan's `## Held-out checks` row and
  an in-scope edge to `suiteAddedByTask` of the first task the plan's `## Intent coverage` table assigns
  the criterion. SC2's edges are E3 and E4; E4 is held out to `scripts/tutor-answer.test.mjs`
  (`.project/plan/PLAN.md:73`), and E3 is in scope, so it resolves through SC2's first coverage row
  `| SC2 | T001 | AC3 |` (`.project/plan/PLAN.md:61`) to `scripts/tutor-record-shapes.test.mjs` — T001's
  added suite. Two suites for one criterion is the refusal. M054's plan avoided exactly this by giving
  SC2 no T001 row at all (`.project/archive/054-visual-qa/plan/PLAN.md`, `## Intent coverage`).
  **Minimal fix, one line, same meaning:** move `| SC2 | T002 | AC4 |` above `| SC2 | T001 | AC3 |` in
  `.project/plan/PLAN.md`'s `## Intent coverage`, so E3 resolves to `scripts/tutor-answer.test.mjs` and
  both of SC2's edges cite one suite. `PLAN.md` is not in this task's `files:`, so this task may not
  make it. Until it is made, `scripts/navigation-blocking.test.mjs` (6 red) and
  `scripts/overlay-verdict-claims.test.mjs` (2 red) both fail on the missing file, and the record is not
  hand-authored: the file is capture-owned and a transcribed list is what the suite exists to refuse.

- **Blocker 2 — `research/raw/m055-surface.json` reddens T001's suite, whose record this task may not
  touch.** `scripts/tutor-record-shapes.test.mjs:480-:513` compares `inventory.surface.paths` (9 records)
  with every `research/raw/*-surface.json` present (10, now that this task's own declared record exists):
  `the map measures every surface record present: the tree holds 10` — 7 red of 13
  (`node --experimental-strip-types --test scripts/tutor-record-shapes.test.mjs`). The recording already
  names the two records this task captures under `inventory.outsideTheMap` with a `why` that says "T004"
  (`research/raw/m055-record-shapes.json`), and the doc comment at `:473-:478` states the intent —
  "named outside the map on purpose, so T004 landing them cannot silently outgrow a map that was measured
  before they existed" — but `validateInventory` only checks that each `outsideTheMap` entry has a `why`;
  it never subtracts those paths from the comparison. **Minimal fix, either side, neither in this task's
  `files:`:** subtract `outsideTheMap` from `presentRecords()`/`validateInventory`, or list
  `research/raw/m055-surface.json` in `inventory.surface.paths` with `count: 10`. The record's own
  `inventory.surface` is `m055-record-shapes.json`, which is T001's/T002's, not this task's.

- **Landed in the working tree (uncommitted, `git add -N` on the new record):** `research/raw/m055-surface.json`
  (new — the route, the loader key, the join's five states and the pane's own `no-tutor-answer`, each with
  the answer field it reads, `capture`-free and `head` at HEAD); `research/raw/m048-surface-copy.json`
  re-measured over the twenty-seventh surface; `extension/copy-digest.json`; `scripts/copy-check.test.mjs`;
  `apps/angular-ai-devtools/src/app/panel-demo.ts` and `panel-demo.spec.ts`;
  `research/raw/m048-surface.json`·`m049`·`m050`·`m051`·`m052`·`m053`·`m054`-`surface.json` re-cited at this
  head.

- **Measured totals, each by its own command.**
  `node --test scripts/copy-check.test.mjs` → `tests 30`, `pass 30`, `fail 0` (was 29/1: the record did not
  measure `panel-tutor-foundations.ts`). The record now states `surfaces: 27`, `surfacesWithMap: 14`,
  `declaredSentences: 161`, `inlineSentences: 34`, `declaredLabels: 7`, `inlineLabels: 191`,
  `inlineWords: 7`, `citations: 487` (was 26 / 13 / 155 / 34 / 5 / 185 / 7 / 470); its counts are recomputed
  from its own entries by the suite, never typed. `extension/copy-digest.json` is `187` rows for `195`
  sentences (`181` / `189` before): six new rows, one per distinct text, none of them a text another
  surface already declares, `version: m055+t004`. `panel-demo.ts`'s copy-check fact moved `checked: 189` →
  `checked: 195`, and `panel-demo.spec.ts`'s two pins moved with it (`checked: 195`,
  `counts.surfaces: 27`) — `npx nx run angular-ai-devtools:test --skip-nx-cache` → `31` files, `358` tests,
  all pass. `node --experimental-strip-types --test scripts/tutor-answer.test.mjs` → `tests 11`, `pass 11`,
  `fail 0`. Re-citation was by search, not by number: `research/raw/m054-surface.json`'s `visual-qa`
  route entry `83` → `81` (the only citation the new entry moved, because M055's `app.routes.ts` entry
  pays for its two lines out of the paragraph above it, so `console-read` `:80` → `:78` and every entry
  from `webmcp-rehearsal` down keeps its number); `m048-surface.json`'s `checked`/`187`/`twenty-seven`
  readings and the `panel-demo.ts:450` / `:444` citations re-read; all eight records' `head` set to this
  head. `m048`-`m055`-`surface.json` and `m048-surface-copy.json` re-audited: **0 citations moved, 0
  missing** at this head.

- **The build artifact.** `npx nx run angular-ai-devtools:build-extension --skip-nx-cache` exits 0 and
  `extension/panel/index.html` hashes `b840cad0dd023ed2e6bb695c807b38263f4dfd688fe93c14881c9a73aba450bd`
  (SHA256) both before and after — the committed artifact is the build's own output at this head, so
  `git checkout -- extension/panel/index.html` had nothing to discard.

- **Not re-derived, deliberately:** `research/raw/m044-gate-shapes.json` and
  `research/raw/m056-gate-stability.json` are still stale (`M044_CAPTURE=1` / `M056_CAPTURE=1` would
  move them), because both blockers' fixes are edits to suites under `scripts/`, which is exactly what
  `m044-gate-shapes.json`'s `suiteDiff` section measures — a capture taken before those fixes would be
  invalidated by them. `m056-gate-stability.json` must be the last capture, after this Log and with no
  commit between it and the landing, so it belongs to the attempt that can land.

- **Facts ship must carry.**
  (1) C4: `claims[].artefactPath` is carried by **12 of the 34** verdict-claims records, so the other
  **22** (M022–M043, in four different shapes) carry no artefact path at all — the surface renders
  `no-artefact-named` for them, exactly and in its own sentence, and that is the reason the surface must
  name what it cannot read rather than a defect of the surface.
  (2) The authored index `extension/tutor-index.js` holds **two facts per row** — the question text to the
  criterion id and the milestone — and must not acquire a third to paper over a record that cannot answer;
  the criterion-to-artefact side is read from the records at answer time.
  (3) E4's `missing-artefact` state has **no live instance** at this head: all 44 `claims[].artefactPath`
  values resolve where the records say they live, so the state is pinned by a **constructed input** in
  `scripts/tutor-answer.test.mjs` and the recording says so rather than manufacturing a dead path.

- **Not established:** the AC1 verdict record, the two gate captures, and therefore the project verify —
  all four wait on the two fixes named above.

- **Second pass, re-dispatched at `7a056be6` with both fixes in place.** The map's `outsideTheMap` is now
  honoured rather than only checked, the claims record exists and was written by its own command, and one
  blocker remains — measured here for the first time, because it could only appear once the 35th record
  existed.

- **The suite fix, at blocker 2's cause.** `validateInventory` in `scripts/tutor-record-shapes.test.mjs`
  held `inventory.surface.paths` and `inventory.verdictClaims.paths` against every record present and
  never subtracted the paths the recording itself names in `inventory.outsideTheMap`. It now does, through
  one `mappedRecords(candidate, present = presentRecords())` helper that `validateFindings` reads too, so
  the negative measurement and the C3 trap are held over the same 34 + 9 records the map measured. The
  named-outside set is pinned to exactly the two records this milestone captures
  (`m055-surface.json`, `m055-verdict-claims.json`), so a later record cannot be excused by naming it
  there, and every other path is strict in both directions: a present record the table does not measure,
  and a table entry for a record that is not there. New mutant: a record present and not named outside the
  map is passed in a synthetic present list and must redden naming it —
  `mutant: new unlisted record -> the map measures every surface record present, the records named outside
  it excepted: the tree holds 11, and 2 are named outside the map`. Totals:
  `node --experimental-strip-types --test scripts/tutor-record-shapes.test.mjs` → `tests 13`, `pass 6`,
  `fail 7` before the fix; `tests 14`, `pass 14`, `fail 0` after; and `14 / 14 / 0` again after the claims
  record landed, when the tree holds 35 verdict-claims and 10 surface records of which 34 and 9 are the
  map's.

- **The claims capture.** `set "M044_CAPTURE=1"&& node --experimental-strip-types --test
  "scripts/navigation-blocking.test.mjs"` → `tests 25`, `pass 25`, `fail 0`,
  `armed run wrote research/raw/m055-verdict-claims.json (the list had not been written)`. The record
  carries 3 claim rows (SC1, SC2, SC3), each with `claims[].artefactPath` — `scripts/tutor-record-shapes.test.mjs`
  for SC1, `scripts/tutor-answer.test.mjs` for SC2 and SC3 — beside `capture.command`, `.check`, `.records`
  and `.criteria`; it carries no `capture.head`, so the landing's contract split reads it as a record
  without a full contract rather than as a stale one. `scripts/overlay-verdict-claims.test.mjs` is green
  again (was 2 red on the missing file), and SC2's two edges both resolve to `scripts/tutor-answer.test.mjs`
  through the moved plan row (`.project/plan/PLAN.md:61` before `:62`; the old `| SC2 | T002 | AC4 |` row
  remains at `:63`, which the derivation never reaches because the first row already names a suite).

- **The gate shapes, re-derived after the suite fix.** `set "M044_CAPTURE=1"&& node
  --experimental-strip-types --test "scripts/gate-integrity.test.mjs"` → `tests 41`, `pass 41`, `fail 0`;
  the armed run wrote the record and a second armed run changed no byte (`139461` bytes, sha256
  `c0668a50b15e534fd93a412b9e86c39be9f3023dfdca7e4a4dde0beeac3ebbf1`). Old → new:
  `archiveReferences.filesExamined` 308 → 313, `.suitesExamined` 157 → 159, `.examined` 183 → 185,
  `.counts.undecided` 139 → 141, `.sites.pattern` 5 → 7, `.movedSubtreesDerivedFrom.archivesExamined`
  54 → 55; `wholeTree.suites.scripts|total` 112|187 → 114|189, `.filesListed` 475 → 480,
  `.declarations.tests` 2379 → 2405, `.describes` 325 → 326; `suiteDiff.counts.differing` 34 → 36,
  `.added` 18 → 20, `.addedAssertionLines` 3812 → 4155; `fixRecord.claims.5.resolvesTo` 52 → 54.
  `suiteDiff.differing` now carries this pass's `scripts/tutor-record-shapes.test.mjs` reading
  (+1678/−0 lines, +167/−0 assertion lines) beside M055 T002's `scripts/tutor-answer.test.mjs`. The
  record was re-derived a second time after the suite was put through `prettier --write` (the first
  capture's `+1676` line count was the unformatted edit; the second armed run moved exactly
  `suiteDiff.differing[27].addedLines` 1676 → 1678 and nothing else).

- **Blocker 3 — `scripts/tutor-answer.test.mjs:885-:898`, and it is not in this task's `files:`.** The
  record blocker 1 held now exists as the 35th verdict-claims record, and T002's suite holds the tree to
  the map's own count: `assert.equal(realRecords.length, RECORDING_DATA.inventory.verdictClaims.count,
  'the suite reads every verdict-claims record T001 measured')` → `35 !== 34`. `realRecords`
  (`scripts/tutor-answer.test.mjs:156-:162`) is every `*-verdict-claims.json` on disk; the map measured 34
  at `b450c28` and names T004's two records outside it for exactly this reason, and this suite is the one
  place that does not subtract them. **Minimal fix, two lines, the same class as the inventory fix:**
  filter `realRecords` through `RECORDING_DATA.inventory.outsideTheMap` before the count is taken, leaving
  every other pin — the 44 claims that carry the field, the 22 records that carry none, E4's constructed
  absence — untouched. `scripts/tutor-answer.test.mjs` is T002's suite and this task's `files:` does not
  declare it, so this task may not make it; the landing refuses any changed path the list does not
  declare, before the Verify. The alternative the previous pass named — re-measuring
  `research/raw/m055-record-shapes.json` to 35 records — is inside `files:` but would replace the map T001
  measured with a hand transcription at a different head, move `claims[].artefactPath` to 47 claims of 13
  records, and stale the `34 verdict-claims records … 12 of the 34 … 22 records` readings that
  `scripts/gate-integrity.test.mjs:5690` and the gate record carry.

- **The three facts ship must carry, re-confirmed at this head.** (1) C4 holds: `claims[].artefactPath` is
  carried by 12 of the 34 records the map measured, and the other 22 (M022–M043, in four shapes) carry no
  artefact path, which is why the surface renders `no-artefact-named` in its own sentence. (2) The
  authored index `extension/tutor-index.js` holds two facts per row — the question text to the criterion
  id and the milestone — and gained no third. (3) E4's `missing-artefact` state has no live instance: all
  44 `artefactPath` values the map names resolve, so the state is pinned by a constructed input in
  `scripts/tutor-answer.test.mjs`, and the recording says so.

- **The gate stability, re-derived last.** `set "M056_CAPTURE=1"&& node --test
  "scripts/gate-stability-record.test.mjs"` → `tests 9`, `pass 9`, `fail 0`; the armed run wrote the record
  and a second armed run changed no byte. Old → new: `archive.detail.plainRun.milestone` `M054` → `M055`;
  `predecessor.detail.lines.1` `624 changed path(s) of b3a9cfe3…` → `655 changed path(s) of 049e92c8…`
  (the newest ship commit it derives from moved `ship: M053 — webmcp-rehearsal` → `ship: M054 —
  visual-qa`). The three gate runs stay green (`archive` 0, `fixRecord` 0, `predecessor` 0, no refusal
  line, no finding), and `capture.head` stays the pinned `5290d939…` by the record's own design rather
  than tracking HEAD. `archive.detail.plainRun.summary` reads `0 finding(s), 32 mention(s)` at this
  capture (was 24): the mention count is a function of this Log's own text, which is why the suite pins
  its shape (`0 finding(s), N mention(s)`) and the exit code, and not N.

- **The project verify, measured leg by leg at this head.** `npx nx run angular-ai-devtools:build-extension
  --skip-nx-cache` exits **0** (`Successfully ran target build-extension`; `extension/panel/index.html` is
  the build's own output). `npm run check` exits **0** once the suite fix is formatted — the first run
  exited 1 with `[warn] scripts/tutor-record-shapes.test.mjs` from `format:check` and every other stage
  green (tsc ×4, skills, `gate:verification`, `gate:archive-paths`, `gate:fix-record` — `0 finding(s),
  30 mention(s)`). `npm test` exits **1**: `tests 1787`, `pass 1785`, `fail 2`, and the two failures are
  named below.

- **Blocker 4 — `scripts/interaction-story.test.mjs:811-:844` is red at the base commit itself, before
  any byte this task wrote.** `node --experimental-strip-types --test scripts/interaction-story.test.mjs`
  → `tests 17`, `pass 16`, `fail 1`, `the 35 extension/*.js recorder files record no interaction …
  1 !== 0`. The occurrence is `extension/tutor-index.js:72`, the authored index row
  `'does every step of the interaction story quote an event the record carries, in the order it
  arrived?'` — introduced by `f5f70284` (M055 T002) and carried unchanged into this task's base. Proven
  pre-existing rather than caused here: a `git worktree` at `7a056be6` runs the same suite to the same
  `tests 17 / pass 16 / fail 1`, and this task neither writes `extension/tutor-index.js` nor that suite.
  **Minimal fix, either side:** exclude the authored index from the recorder word count beside the
  existing `NARRATION` exclusion (`extension/tutor-index.js` is an authored mapping, not a recorder), or
  reword that one question — the first is the honest one, because the pin's subject is a recorder writing
  an `interaction` event and an index question naming one is neither. Neither path is in this task's
  `files:`.

- **Not established:** the landing, held by blockers 3 and 4 — both outside this task's `files:`, one of
  them red before this task began. Nothing was committed.
- Landed paths: `research/raw/m055-surface.json`, `research/raw/m055-record-shapes.json`, `scripts/tutor-record-shapes.test.mjs`, `research/raw/m055-verdict-claims.json`, `research/raw/m054-surface.json`, `research/raw/m053-surface.json`, `research/raw/m052-surface.json`, `research/raw/m051-surface.json`, `research/raw/m050-surface.json`, `research/raw/m049-surface.json`, `research/raw/m048-surface.json`, `research/raw/m048-surface-copy.json`, `research/raw/m056-gate-stability.json`, `research/raw/m044-gate-shapes.json`, `extension/copy-digest.json`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts`, `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/gate-stability-record.test.mjs`, `extension/panel/index.html` — each is read from this tree, ready.

- **Third pass, re-dispatched at `9c490812` with both reds inside this task's `files:`.** Both are closed
  by a subtraction each suite's own recording already states, and each is proved narrow by a mutant.
  Totals, before → after, each by its own command: `node --experimental-strip-types --test
  scripts/tutor-answer.test.mjs` `tests 11`, `pass 10`, `fail 1` → `tests 12`, `pass 12`, `fail 0`; `node
  --experimental-strip-types --test scripts/interaction-story.test.mjs` `tests 17`, `pass 16`, `fail 1` →
  `tests 18`, `pass 18`, `fail 0`.

- **Red 1 — `scripts/tutor-answer.test.mjs:885-:898`, `35 !== 34` — closed.** `realRecords` was every
  `research/raw/*-verdict-claims.json` on disk, 35 at this head, and the pin held that count against
  `research/raw/m055-record-shapes.json`'s measured `inventory.verdictClaims.count` of 34. T001's map
  names T004's `research/raw/m055-verdict-claims.json` in `inventory.outsideTheMap` for exactly this
  reason — the record was captured after the map was measured — and
  `scripts/tutor-record-shapes.test.mjs` subtracts that set through its `mappedRecords`, which the
  previous pass landed; this suite was the one place that did not. Cause, not symptom: the suite read the
  directory and the map counted a set, so a record the map had already named outside itself read as an
  unmeasured 35th. **Fix:** the suite now reads its records through its own `mappedRecords(present,
  recording)` — every verdict-claims record present except the paths the recording names outside the map —
  and `realRecords` is that call with its defaults, so the join's C4 pin, the index pins and E4's
  no-live-instance pin all answer over the same 34 records T001 measured. The count is not the only hold:
  `pinRecordCensus` also asserts every measured record's path is one the map lists and every path the map
  lists is measured, so `34` cannot be satisfied by the wrong 34; the original `assert.equal(measured
  length, count)` and its sentence are unchanged. The pins the recording states are unmoved: `T002
  records: 34 verdict-claims records, 44 claim(s) answered with their own claims[].artefactPath, 22
  record(s) rendered as no-artefact-named`.
  **Mutant, a synthetic present list:** a 35th record that is *not* named outside the map —
  `research/raw/m901-verdict-claims.json`, which no file on disk carries — is passed in and reddens
  naming it: `research/raw/m901-verdict-claims.json is present and is not named outside the map, so the
  map must measure it: T001 measured 34 verdict-claims record(s) and 2 are named outside the map
  (research/raw/m055-verdict-claims.json, research/raw/m055-surface.json)`. The same test asserts the
  subtraction is exactly the one verdict-claims path the map names outside itself, so the exclusion is
  the recording's own and not a hole opened in the suite.

- **Red 2 — `scripts/interaction-story.test.mjs:811-:844`, `1 !== 0` — closed, and it predates this
  task.** The one occurrence is `extension/tutor-index.js:72`, the authored index row `'does every step
  of the interaction story quote an event the record carries, in the order it arrived?'`, authored by M055
  T002 (`f5f70284`). The word is in a data file: the index records no interaction, and that question is
  an authored question, not a recording. **Fix:** the authored index is excluded from the recorder word
  count beside the existing `NARRATION` exclusion, with the comment saying why — an authored question is
  not a recording — and the two readers are named constants the census is held to, so a third exclusion
  cannot be granted silently. The pin now reads `recorderCensus(sources)`, a census over a `Map` of every
  `extension/*.js` file's text, so a mutant can hand it a tree that is not the one on disk; it still
  measures `34` recorder files (`36` files on disk, `2` readers), every file is still held to the
  listener count, and a failure now names the offending file instead of printing `1 !== 0`.
  **Pre-existing, measured.** A detached `git worktree` at this task's base `9c490812` —
  `git worktree add … --detach 9c4908122bf…` — runs `node --experimental-strip-types --test
  scripts/interaction-story.test.mjs` to `tests 17`, `pass 16`, `fail 1` with the identical `the 35
  extension/*.js recorder files record no interaction` message, before any byte of this pass; and `git
  diff --stat 7a056be6 9c490812 -- extension/tutor-index.js scripts/interaction-story.test.mjs` is empty,
  so the previous pass's `7a056be6` reading — `tests 17 / pass 16 / fail 1` in a worktree of its own — is
  the same two files' bytes as this base. The red was there before the task moved, not made here.
  **Mutant, a recorder that gains the word:** the word is written into `extension/agent-main.js`'s text in
  memory and the pin reddens naming it: `the 34 extension/*.js recorder files record no interaction, and
  the file(s) writing the word are: agent-main.js (interaction-story.js is a reader and tutor-index.js is
  the authored index — an authored question is not a recording — so both are excluded from the word
  count, and no third file is)`. The same test writes the word into both readers and stays green, so the
  exclusion is by file and not by text.

- **Re-derived, each with its own capture command.** `set "M044_CAPTURE=1"&& node
  --experimental-strip-types --test "scripts/gate-integrity.test.mjs"` → `tests 41`, `pass 41`, `fail 0`
  armed (`40 / 40 / 0` on the default read-back that follows it). Old → new: `archiveReferences
  .references[179].line` `388` → `420` — the one code reference the `scripts/tutor-answer.test.mjs` edit
  moved, and nothing else in that section; `suiteDiff.differing[18]` (`scripts/interaction-story.test.mjs`)
  `2079` → `2188` added lines and `226` → `231` added assertion lines; `suiteDiff.differing[26]`
  (`scripts/tutor-answer.test.mjs`) `1503` → `1598` added lines and `103` → `110` added assertion lines;
  `suiteDiff.counts.addedAssertionLines` `4155` → `4167`; `wholeTree.declarations.tests` `2405` → `2407`
  and `.total` `2731` → `2733` — the two tests the mutants add, and no third. Checked and unmoved:
  `wholeTree.examined` `189`, `.filesListed` `480`, `.suites` `114 | 11 | 34 | 2 | 28 = 189`,
  `.describes` `326`; `archiveReferences.counts` `16 | 28 | 141`, `.filesExamined` `313`,
  `.suitesExamined` `159`; `scripts/tutor-record-shapes.test.mjs`'s `1678`/`167` entry. The claims record
  is re-derived too, because it carries the count: `set "M044_CAPTURE=1"&& node
  --experimental-strip-types --test "scripts/navigation-blocking.test.mjs"` → `tests 25`, `pass 25`,
  `fail 0`, `armed run wrote research/raw/m055-verdict-claims.json (the list moved:
  "evidence.suites[1].tests: 11 -> 12")`; the two `claims[].artefact` sentences that quote the count
  moved with it (`the suite carries 12 test declaration(s) in 0 group(s)`), no other byte did, and a
  second armed run changed no byte (`14023` bytes, sha256 `4312afdd…`).

- **The gate stability, re-derived last.** `set "M056_CAPTURE=1"&& node --test
  scripts/gate-stability-record.test.mjs` → `tests 9`, `pass 9`, `fail 0`, a second armed run changing no
  byte. It is captured after this Log's last edit and after the gate shapes, with no commit between it and
  the landing, because the one value it moves is a function of this Log's own text:
  `archive.detail.plainRun.summary`'s `0 finding(s), N mention(s)` — the archive stage counts the mentions
  the milestone's task logs carry, so every bullet above moves N. The suite pins the shape and the exit
  code rather than N, and the count the record lands with is the count this Log produces; the other two
  sections stay green through this pass (archive `0`, fixRecord `0`, predecessor `0`, no refusal, no
  finding).

- **The project verify.** `npm run check` exits **0**: `tsc` ×4, skills (18 files, none unregistered),
  `verification-gate` 3 copies in step, `gate-integrity: pass - 0 finding(s)` for `archive-paths`,
  `0 finding(s), N mention(s)` for `fix-record`, and `prettier --check .` clean — the first run after the
  edits exited 1 on `[warn] scripts/interaction-story.test.mjs` and was settled with `prettier --write`,
  not by hand. `npm test` exits **0** after the re-derivations: `tests 1789`, `pass 1789`, `fail 0` in the
  node-suite half (was `1787 / 1785 / 2` at the base, the two reds), and the app, skills and held-out
  halves green.

- **Landed paths re-read at this head:** every path in `files:` is the one this pass read, plus the two
  suites this pass edits — `scripts/tutor-answer.test.mjs` and `scripts/interaction-story.test.mjs` — both
  declared in `files:` this time. Nothing outside `files:` was written.

- **Fourth pass, resumed at `9c490812` on a tree the killed pass had already written most of.** The
  previous pass died **after** it wrote both suite fixes and **after** it took the two gate captures, so
  the records on disk — `research/raw/m044-gate-shapes.json` and
  `research/raw/m056-gate-stability.json` — predate the end of this task's own work and were re-derived
  again below, in order, as the last action before the landing, with nothing committed between them. This
  pass measured rather than re-typed: Red 1 needed no byte it did not already have, and neither suite fix
  was retyped by it.

- **The four readings this pass started from, each by its own command, each green at this head.**
  `node --test scripts/interaction-story.test.mjs` → `tests 18`, `pass 18`, `fail 0`;
  `node --test scripts/gate-integrity.test.mjs` → `tests 40`, `pass 40`, `fail 0` (the default read-back —
  one fewer than the armed run, because the write is behind `M044_CAPTURE=1`);
  `node --test scripts/gate-stability-record.test.mjs` → `tests 8`, `pass 8`, `fail 0` (same reason);
  `node --test scripts/navigation-blocking.test.mjs` → `tests 24`, `pass 24`, `fail 0`. The claims record
  `research/raw/m055-verdict-claims.json` still holds at this head — the suite that re-derives it is green
  — so it needed no re-capture here.

- **Red 1, verified closed: cause, fix and the shared way.** Cause: `realRecords` read the **directory**
  (`readdirSync` over every `*-verdict-claims.json`) while the map counted a **set**, so
  `research/raw/m055-verdict-claims.json` — which `research/raw/m055-record-shapes.json` names in
  `inventory.outsideTheMap`, because T001 measured the map before T004 captured it — read as an unmeasured
  35th and the pin printed `35 !== 34`. Fix, the same class as the inventory fix and not a second private
  filter: the directory read is `presentRecords`, and both it and the map go through one helper —
  `mappedRecords(present = presentRecords, recording = RECORDING_DATA)`, "every verdict-claims record
  present except the paths the recording names in `inventory.outsideTheMap`" — which is the shape
  `scripts/tutor-record-shapes.test.mjs` already subtracts through its own `mappedRecords(candidate,
  present)`; `realRecords` is that call with its defaults, so the join's C4 pin, the index pins and E4's
  no-live-instance pin all answer over the same 34 records T001 measured. The subtraction is the
  recording's, never the suite's: `outsideTheMap` is read from the record, and only the named paths are
  excused. The count is not the only hold — `pinRecordCensus` also asserts every measured record's path is
  one the map lists **and** every path the map lists is measured, so `34` cannot be satisfied by the wrong
  34; the original `assert.equal(measured length, count)` and its sentence `the suite reads every
  verdict-claims record T001 measured` are unchanged, so the assertion stays strict for any record **not**
  named outside the map. `node --test scripts/tutor-answer.test.mjs` → `tests 12`, `pass 12`, `fail 0`.
  **The mutant, printed by the runner in the same run:**
  `research/raw/m901-verdict-claims.json is present and is not named outside the map, so the map must
  measure it: T001 measured 34 verdict-claims record(s) and 2 are named outside the map
  (research/raw/m055-verdict-claims.json, research/raw/m055-surface.json)` — a 35th record that is not
  named outside still reddens, and the same test pins the subtraction to exactly the one verdict-claims
  path the map names outside itself.

- **One path this task does not declare had been written by the killed pass, and was put back.**
  `apps/angular-ai-devtools/src/app/app.routes.ts` carried an uncommitted deletion of
  `{ path: 'di-doctor', component: N3DiDoctorComponent }` — no part of this task asks for it, the route is
  the documented mutant of `tests/held-out/fixture-explainers-unchanged.test.mjs` and is listed as an
  expected route by `app.spec.ts`, and an undeclared changed path is exactly what the landing refuses
  before the Verify. It was restored with `git checkout --
  apps/angular-ai-devtools/src/app/app.routes.ts`, so the tree again carries only paths this task declares;
  the restore is a read of HEAD and not a write of this task's.

- **Totals.** `npm run check` exits **0**: `tsc` ×4, skills, `gate:verification`, `gate:archive-paths`,
  `gate:fix-record` `0 finding(s), 26 mention(s)`, and `prettier --check .` — `All matched files use
  Prettier code style!`, so no `--write` was needed. `npm test` reads `tests 1789`, `pass 1789`,
  `fail 0` in the node-suite half, with the app and skills halves green and the held-out corpus
  `22 suite(s), 22 passed, 0 failed — 85 test(s), 85 passed`; its process exit code was lost to a botched
  redirect in this pass, and the landing's own Verify re-runs the whole chain, so that run's exit is the
  one recorded here rather than a guessed number. The first `npm test` of this pass exited **1** on
  `scripts/panel-bundle-budget.test.mjs:541` — `extension/panel/index.html is a stale build` — and that is
  the Verify's own ordering, not a defect: the `git checkout` above moved `app.routes.ts`'s mtime past the
  artifact's, and the Verify's first leg is the build. `npx nx run
  angular-ai-devtools:build-extension --skip-nx-cache` exits 0 and reproduces the shipped bytes exactly
  (sha256 `b840cad0dd023ed2e6bb695c807b38263f4dfd688fe93c14881c9a73aba450bd`, `778` bytes, no
  `git status` entry for `extension/panel/index.html`), after which the suite is green and its
  `git checkout -- extension/panel/index.html` had nothing to discard.

- **Re-derived last, in this order, with nothing committed between them and the landing.**
  `set "M044_CAPTURE=1"&& node --experimental-strip-types --test "scripts/gate-integrity.test.mjs"`, then
  `set "M056_CAPTURE=1"&& node --test scripts/gate-stability-record.test.mjs`. The stability record is
  last because the one value it moves is a function of **this Log's own text** —
  `archive.detail.plainRun.summary`'s `0 finding(s), N mention(s)`, where the mention count is what the
  archive stage reads in this milestone's task logs — which is why every bullet above was written before
  it and why the suite pins that field's shape and the exit code rather than N. The numbers each armed run
  printed are the runs' own; what they wrote is in the two records, and each record's own idempotence pin
  is green in the same run.
