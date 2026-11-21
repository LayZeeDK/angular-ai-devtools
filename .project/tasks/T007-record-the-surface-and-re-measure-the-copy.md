---
id: T007
title: Record the surface and re-measure the copy
wave: 5
status: in-progress
deps: [T006]
agent: build_T007
base: 7f0033332ffc87f8d9817e692fb74466123f0584
worktree: D:\projects\sandbox\angular-ai-devtools
task_branch: null
files:
  - research/raw/m057-surface.json
  - research/raw/m048-surface-copy.json
  - extension/copy-digest.json
  - scripts/copy-check.test.mjs
  - scripts/gate-integrity.test.mjs
  - scripts/gate-integrity-default-tasks.test.mjs
  - apps/angular-ai-devtools/src/app/panel-demo.ts
  - apps/angular-ai-devtools/src/app/panel-demo.spec.ts
  - apps/angular-ai-devtools/src/app/app.spec.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
---

# T007 — Record the surface and re-measure the copy

## Context

The surface ships in wave 4, and two records answer for it: the milestone's own surface record,
stating what the route, the loader key and each state read, and the copy record, stating which
sentences each surface declares and where. `scripts/copy-check.test.mjs` re-reads both halves on every
run — the copy record's citations, the three surface records T004's line-neutral entry kept true, and
the digest's row count — so the digest, the demo's copy-check fact and the record move together or
the suite reddens on a number rather than on a sentence. The three app specs that pin
`panel-demo.ts` are declared with it (PLAN C4), and so are the two gate suites that name
`scripts/copy-check.test.mjs`.

## Approach

Record `research/raw/m057-surface.json`: the route `tutor-signals`, its `LOADERS` key, the five states
the pane renders, each with the answer field it reads, and the named absence
`no-write-record-no-order` with the sentence it is rendered in. Every citation is a `path:line`
carrying the cited line's own text, re-resolved by search at this head, and the record names the
join, the display module and the graph record the answer is read from —
`research/raw/m039-render-phase.json`'s `/effect/freshRead`, the record T003 pins (PLAN C8) — as its
sources. Nothing is captured from a page and this milestone takes no capture at all: the answer the
surface renders is the join's own, derived node-side over that record, and the record says so.

Re-derive `research/raw/m048-surface-copy.json` with its own capture command over every panel surface
on disk, so it measures the new pane's sentences and its own counts are recomputed by its suite rather
than typed. Then author the digest rows the new pane's sentences need in `extension/copy-digest.json`
— one row per distinct text, none of them a text another surface already declares — and move the
copy-check fact in `apps/angular-ai-devtools/src/app/panel-demo.ts` with the digest's count, which is
why that file and `panel-demo.spec.ts` are declared here rather than moved outside the list.

Edit `scripts/copy-check.test.mjs` only where a count it holds must follow the record it measures,
never to loosen a check: a surface the suite cannot see is a surface whose copy is unmeasured, and
this milestone adds one. Run it as the task's check, because the three surface records it re-reads are
the ones T004's entry kept in place and a drifted citation reddens here.

## Intent coverage

- SC1

## Interface contract

`extension/panel/index.html` is a build artifact and is never edited by hand. T004 lands a freshly built copy that serves the new panel surface; T009's verify rebuilds it and discards the working-tree diff with `git checkout -- extension/panel/index.html` so the head that ships holds the built artifact. The file changes only through `npx nx run angular-ai-devtools:build-extension --skip-nx-cache`, never through an edit.

## Files

- research/raw/m057-surface.json
- research/raw/m048-surface-copy.json
- extension/copy-digest.json
- scripts/copy-check.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- apps/angular-ai-devtools/src/app/panel-demo.ts
- apps/angular-ai-devtools/src/app/panel-demo.spec.ts
- apps/angular-ai-devtools/src/app/app.spec.ts
- apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts

## Acceptance criteria

1. `research/raw/m057-surface.json` exists and states the route, the loader key, the five states with
   the answer field each reads, and the named absence with its sentence, every citation a `path:line`
   carrying the cited line's own text re-resolved by search at this head — so the answer the surface
   renders is stated as the join's own and not as a page read (SC1).
2. `research/raw/m048-surface-copy.json` is re-derived by its own capture command over every surface
   on disk, and its counts are recomputed by the suite that measures them rather than typed.
3. `extension/copy-digest.json` carries the rows the new pane's sentences need — one row per distinct
   text, none duplicating a text another surface declares — and the copy-check fact in
   `apps/angular-ai-devtools/src/app/panel-demo.ts` moves with the digest's count, held by
   `panel-demo.spec.ts`.
4. `scripts/copy-check.test.mjs` is green at this head with no assertion loosened and no count
   lowered, and it re-reads the three surface records T004's entry left in place.

## Verify

```bash
node --test scripts/copy-check.test.mjs && npx prettier --check extension/copy-digest.json apps/angular-ai-devtools/src/app/panel-demo.ts research/raw/m057-surface.json research/raw/m048-surface-copy.json
```

## Log

- pending.
- Landed paths: `research/raw/m057-surface.json`, `research/raw/m048-surface-copy.json`, `extension/copy-digest.json`, `scripts/copy-check.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `apps/angular-ai-devtools/src/app/panel-demo.ts`, `apps/angular-ai-devtools/src/app/panel-demo.spec.ts`, `apps/angular-ai-devtools/src/app/app.spec.ts`, `apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts` — each is read from this tree, ready.
- 2026-11-21: built at 7f003333 as build_T007. Branch gsd-path/M056; the taste dirt (.commandcode/taste/workflow/taste.md) was parked first with gsd.bat taste-park --force (status parked, paths [.commandcode/taste/workflow/taste.md]), so gsd.bat activate --task-file .project/tasks/T007-record-the-surface-and-re-measure-the-copy.md printed activated T007 at 7f003333 as build_T007, the base was pinned to 7f0033332ffc87f8d9817e692fb74466123f0584, and git rev-parse HEAD read the same sha before the first edit. No product path is dirty but a named one, and the parked taste copy was left parked: nothing landed, so there was nothing to restore it for.
- research/raw/m057-surface.json is written by its own measurement script (kept in the session scratchpad, not checked in) and holds 84 citations, every one re-resolved by searching its file for the exact line it quotes: the route ('tutor-signals' at app.routes.ts:84, loadComponent :146, data { surface } :147, the table :113, the shared closure :14/:15), the loader key (LOADERS :35, the 'tutor-signals' entry :65, the resolution :717/:723/:724/:725/:726, the sample fact :827 with its answer lines and its comment), the five states the pane renders (answered, graph-unreadable, no-render-entry, no-effect-node and the pane's own no-tutor-signals-answer) each with the sentences it is rendered in and the answer field each reads (state, question, effect.label, effect.index, effect.namedBy, reads[], unplaced[], ordering, claims[], detail), and the named absence no-write-record-no-order with the sentence it is rendered in (:196) and the one place the join builds it (extension/tutor-signals.js:446). The record's own measurement command re-runs to the identical output: the shipped join, evaluated in a bare node:vm context over research/raw/m039-render-phase.json's /effect/freshRead, answers {"state":"answered","line":399,"effect":{"label":"","index":5,"namedBy":"recorded-edge"},"reads":[{"index":2,"label":"count"}],"unplaced":[],"ordering":{"state":"absent","absence":"no-write-record-no-order"},"claims":3,"detail":"the graph record research/raw/m039-render-phase.json:399 states the effect node labelled \"\" at index 5, reached by the edge the record holds, and 1 upstream node in the order its edges appear; the record carries no write record, so the ordering is the named absence no-write-record-no-order and this answer names no write, no owner and no cause"} — the same answer panel-demo.spec.ts re-derives on every test run, stated as the join's own over a record and not as a page read (no capture, no browser, no serializeGraph call).
- research/raw/m048-surface-copy.json is re-measured by its own script over all twenty-eight panel-*.ts surfaces on disk: every citation it already made was re-resolved by search (none had to move — see the line-neutral repair below), the twenty-eighth surface panel-tutor-signals.ts was measured from its own registry and its own LABELS map, and every count it states was recomputed from its own entries by the same function scripts/copy-check.test.mjs measures with. Old -> new, measured: surfaces 27 -> 28, surfacesWithMap 14 -> 15, surfacesWithConstantsOnly 11 -> 11, surfacesWithInlineOnly 1 -> 1, surfacesWithNothing 1 -> 1, declaredSentences 161 -> 167, declaredLabels 7 -> 22, declaredWordsAndFragments 8 -> 8, inlineSentences 34 -> 34, inlineLabels 191 -> 192, inlineWords 7 -> 7, citations 487 -> 511. The new surface entry carries its declaration (PANE_SENTENCES :173), LABELS in alsoDeclares (:132), its six registry sentences, its fifteen label constants and its one inline label ("\${label}: \${value}" at :283) — and its notes name what is deliberately not enumerated: the four state words and the ABSENCES list (value words, not sentences), the Error message sentenceText throws (:224) and the doc comment. The record's head is 7f003333, a revision[] remeasuredBy entry names this task and what it moved, and its own two `measurements` commands were re-run rather than trusted: the second printed sentences 176, explainedByADigest 1 at this base (the recorded 168 was already stale against its own entries) and now prints sentences 197, explainedByADigest 2 — the second hit is the one-word label `state`, which occurs inside a digest body and explains no rendered line, so the verdict's clause was rewritten from that measurement to name both hits.
- extension/copy-digest.json gains the six rows the new pane's sentences need — one row per distinct text, filed under tutor-signals/state-answered, state-graph-unreadable, state-no-render-entry, state-no-effect-node, ordering-absent and no-tutor-signals-answer — read out of the record rather than typed, so 187 -> 193 rows for 201 sentences (8 repeats, unchanged: no row duplicates a text another surface declares and none of the six is a text any other surface already declares). Its version moves m055+t004 -> m057+t007, and its bytes 36787 -> 39312 against the record's 219228 -> 233382. apps/angular-ai-devtools/src/app/panel-demo.ts's copy-check fact moves with that count, 'checked: 195' -> 'checked: 201', and the comment above it ('all 195 compared strings are explained') -> 201; panel-demo.spec.ts's two pins move with it ('checked: 195' -> 201, 'counts.surfaces: 27' -> 28) and so does the prose beside them (195/187 -> 201/193). npx nx run angular-ai-devtools:test --skip-nx-cache reads Test Files 31 passed (31) and Tests 359 passed (359), so the fact, the spec, the record and the digest agree with the join on the app side.
- The line-neutral repair this task had to make inside panel-demo.ts, measured rather than guessed: M057 T004's 'tutor-signals' LOADERS key (:65) added one line above every cited line below the map, so 128 citations in eight records (m047-, m048-, m049-, m050-, m051-, m052-, m053-, m054- and m055-surface.json) plus the three panel-demo.ts citations in m048-surface-copy.json all pointed one line above the text they quote — scripts/copy-check.test.mjs was 23 of 30 at this base for exactly that reason (7 red). T007 pays for that key the way the route table pays for its own entry: the blank line that stood between the LOADERS literal and the FACTS comment is gone and the reason is recorded in the tutor-signals fact's own comment block below the component, so panel-demo.ts is line-neutral again, those 128 citations re-resolve at their recorded numbers, and no record outside this task's files: was edited to follow them. Measured after the repair: m048-surface.json's loader.resolvedBy block and m049-surface.json's and m050-surface.json's whole citation sets pass again (the suite re-reads 72 citations of the interaction-story record and 97 of the dead-click record), and the only two citations left red anywhere are named in the blocker below.
- The T006 tripwire fired, exactly as T006's Log predicted, and it is outside this task's files: — recorded here for T009 rather than edited. Writing research/raw/m057-surface.json obliges research/raw/m057-record-shapes.json to name it, and that recording carries no inventory block at all (its top-level keys are milestone, task, title, base, method, citations, graphSide, renderEffectSide, negativeMeasurements, premiseCorrections, builtNothing). Measured, before -> after: node --test scripts/tutor-record-shapes.test.mjs 16 tests / 16 pass / 0 fail -> 16 tests / 7 pass / 9 fail, every new failure reddening with 'research/raw/m057-surface.json is this milestone's record and is present, and research/raw/m057-record-shapes.json measures it nowhere and names it nowhere outside itself: the two inventories would read it as an unmeasured record, which is the refusal M055's T004 hit twice — the recording names what it measured, so name research/raw/m057-surface.json in its inventory.outsideTheMap or measure it'. node --test scripts/tutor-answer.test.mjs is unmoved at 14 / 14 / 0 (it counts *-verdict-claims records, and M057's claims record lands in T009). The minimal fix is T001's recording, not a suite: add an inventory block whose outsideTheMap names research/raw/m057-surface.json — and, once T009 writes it, research/raw/m057-verdict-claims.json — with a `why` that contains the string T004, because scripts/tutor-record-shapes.test.mjs requires that substring of every outsideTheMap entry. research/raw/m057-record-shapes.json is outside every remaining task's files: (T008 re-derives m044-gate-shapes.json, T009 re-derives m056-gate-stability.json and m057-verdict-claims.json), so the map needs an owner ruling before T009 can run the project verify green.
- The two declared gate suites were read and edited neither (PLAN C4), and neither moved: node --test scripts/gate-integrity.test.mjs reads 40 tests / 28 pass / 12 fail at this head, the same 40 / 28 / 12 T006 measured and the same twelve names (the re-derivation, the .project reference classes, the T035/M035 nx.json claims, the NavigationSkipped entries, the planted misclassification, AC1's row, T004 AC4, T004 AC3, T004's three new sections, T003 E5/E7 and T003 E8) — no failing assertion names a path this task changed, and T008 re-derives research/raw/m044-gate-shapes.json with its own command. node --test scripts/gate-integrity-default-tasks.test.mjs reads 9 / 9 / 0. gsd.bat records-guard is unchanged before and after: suites 117, enumerations of research/raw 4, routed through a recording's inventory 2, offenders 2 — scripts/tutor-signals-shapes.test.mjs:303 and :371 — result BLOCKED (2 offenders), which is T001's landed suite and outside this task's files:; the repair needs the M057 map's inventory block above and the suite's readdirSync replaced by a read of it.
- The blocker, and it is one file outside this task's files:. The Verify, run exactly as the task gives it — node --test scripts/copy-check.test.mjs && npx prettier --check extension/copy-digest.json apps/angular-ai-devtools/src/app/panel-demo.ts research/raw/m057-surface.json research/raw/m048-surface-copy.json — exits 1: tests 30, pass 29, fail 1, and the one failure is 'T004 — the route record names the route, the loader key, the three states and what each reads' with 'AssertionError [ERR_ASSERTION]: research/raw/m048-surface.json:loader.sampleFact quotes the line as "'copy-check': { state: 'clean', unexplained: [], checked: 195 }," and the file reads "'copy-check': { state: 'clean', unexplained: [], checked: 201 },"'. The prettier leg is green ('All matched files use Prettier code style!'). The suite is 30 / 29 / 1 against 30 / 23 / 7 at the base, and the ten it won are this task's; the one it lost is a record that pins the demo's copy-check fact by exact text, and AC3 of this task requires that fact to move with the digest's count while AC4 requires the suite green with no assertion loosened — both cannot hold while research/raw/m048-surface.json is undeclared. The minimal fix, two values and one sentence, all inside research/raw/m048-surface.json: its loader.sampleFact lineText 'copy-check': { state: 'clean', unexplained: [], checked: 195 }, -> 201 and its holds 'checked: 195' -> 'checked: 201'; its loader.sampleFactComment[1] lineText '// (`extension/copy-digest.json`): all 195 compared strings are explained, so the record reads' -> 201; and its loader.statement prose ('the 187-row digest ... 195') -> 193-row/201. Declaring research/raw/m048-surface.json in this task's files: is the whole fix; nothing else in the tree is red, and git status --porcelain lists only declared paths.
- Verdict: the surface record, the copy re-measure, the digest rows and the demo's count are measured and agree — research/raw/m057-surface.json states the route, the loader key, the five states with the field each reads and the named absence with its sentence, 84 of 84 citations re-resolved by search, its own measurement command re-running identically to the join's answer over research/raw/m039-render-phase.json's /effect/freshRead; research/raw/m048-surface-copy.json measures all 28 surfaces with its counts recomputed by its suite, extension/copy-digest.json carries 193 rows for 201 sentences, and the app suite is 31 files / 359 tests green — but the task's Verify exits 1 on the one assertion quoted above, which pins research/raw/m048-surface.json's copy of the demo's copy-check fact at 195 against the 201 T007's own AC3 requires, and that record is outside this task's files:, so nothing was staged and nothing was committed and the m048 edit is left to the owner ruling that declares it — blocked, not ready.
