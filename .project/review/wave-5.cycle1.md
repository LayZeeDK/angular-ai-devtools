# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 4
Reviewed HEAD: 53c6a77a96447bb4c8bd58adb63f67dd4c0f0ee9

## T006 — Teach both record inventories this milestone's pair: pass

- ✅ Both inventory suites read this milestone's map beside M055's, by one code path rather than two
  rules (C2): `scripts/tutor-answer.test.mjs` reads `research/raw/m057-record-shapes.json` beside
  M055's on every run (`scripts/tutor-answer.test.mjs:65-84`), the named-outside subtraction is the
  union of the paths the two recordings state in `inventory.outsideTheMap` — read from the records
  themselves, never a list the suite holds (`scripts/tutor-answer.test.mjs:215-223`) — and
  `pinNamedOutside` applies the same three rules to both maps: a map may name outside itself only a
  record its own milestone owes, a present record of its own that it measures nowhere must be named
  outside it, and the refusal names the record rather than a bare count
  (`scripts/tutor-answer.test.mjs:261-311`). `scripts/tutor-record-shapes.test.mjs` holds M057's map
  by the same rules in the same code path that validates M055's
  (`scripts/tutor-record-shapes.test.mjs:513-618`, the validation call wired into
  `validateInventory` at `:619-640`).
- ✅ The teeth are proved, not asserted: a map naming a third path its milestone does not owe reddens
  naming `research/raw/m901-verdict-claims.json`
  (`scripts/tutor-answer.test.mjs:1246-1265`, the record-shapes twin with `m901-surface.json` at
  `scripts/tutor-record-shapes.test.mjs:1791-1818`), and the record this milestone owes — present and
  neither measured nor named — reddens naming itself
  (`scripts/tutor-answer.test.mjs:1267-1282`, `scripts/tutor-record-shapes.test.mjs:1820-1848`), with
  the subtraction still pinned to exactly the two recordings' own statements
  (`scripts/tutor-answer.test.mjs:1232-1241`,
  `scripts/tutor-record-shapes.test.mjs:1758-1790`).
- ✅ The tripwire T006 armed fired as designed and was satisfied by the owner, not silenced: T006
  landed with M057's map carrying no inventory, so the first own-record to land would redden naming
  itself — T007's Verify reddened exactly there, and the repair was the map's own `inventory` block
  naming `research/raw/m057-surface.json` with a `T004`-bearing `why`
  (`.project/tasks/T007-record-the-surface-and-re-measure-the-copy.md:115,118`;
  `research/raw/m057-record-shapes.json:793-805`), moving
  `scripts/tutor-record-shapes.test.mjs` from 16/7/9 to 16/15/1 with the one red being T001's stale
  mutant, recorded for the owner ruling rather than edited outside `files:`
  (`.project/tasks/T007-record-the-surface-and-re-measure-the-copy.md:118-119`). T009 then extended
  the same list with `research/raw/m057-verdict-claims.json`
  (`research/raw/m057-record-shapes.json:800-803`) and measured the census unchanged — M055's 34
  measured verdict-claims records still 34, nothing re-counted to fit
  (`.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:100`).

## T007 — Record the surface and re-measure the copy: pass

- ✅ The surface record exists with its own measurement command and is a reading, not a transcription:
  `research/raw/m057-surface.json` states its head and that every citation was re-resolved by search
  (`research/raw/m057-surface.json:7-9`), its `measurement.command` re-derives the shipped join's own
  answer node-side in a bare vm context over the record T003 pins and records the output
  (`:10-15`) — `effect { label '', index 5, namedBy 'recorded-edge' }`, one read `{ index 2, label
  'count' }`, the ordering absence, three claims citing `research/raw/m039-render-phase.json:399` and
  `extension/render-phase.js:18` — the same answer field for field that `panel-demo.spec.ts` holds
  `FACTS['tutor-signals']` to (`apps/angular-ai-devtools/src/app/panel-demo.spec.ts:5856-5857`,
  reviewed in wave 4). The route, loader key and pinned lines it records resolve at this head:
  `apps/angular-ai-devtools/src/app/app.routes.ts:84`, `:113`, `:146`, `:147` (`research/raw/m057-surface.json:26-51`).
- ✅ The copy re-measure is a re-derivation with every moved value read at the line it names, and the
  digest moved with it: `research/raw/m048-surface.json`'s copy of the demo's copy-check fact moved
  195 → 201 in the quoted line and its `holds` (`research/raw/m048-surface.json:113-114`), the
  comment's count moved with it as a substring the suite re-reads (`:126-129`), and the statement's
  prose moved inside the sentence it already was — 201 over twenty-eight surfaces and a 193-row
  digest (`:130`); the digest itself carries 193 rows for 201 sentences with the new pane's rows
  authored (`extension/copy-digest.json`,
  `.project/tasks/T007-record-the-surface-and-re-measure-the-copy.md:113`), and `panel-demo.ts`'s
  copy-check fact moved with the count, that file and its pinning specs declared.
- ✅ The blocked state is recorded as a blocker, not smoothed into a pass: the first Verify exited 1 on
  one assertion — `research/raw/m048-surface.json:loader.sampleFact` quoting `checked: 195` against
  the 201 the task's own AC3 requires, a record outside `files:` — and nothing was staged or
  committed until the two paths the blocker named were declared and the minimal repair made
  (`.project/tasks/T007-record-the-surface-and-re-measure-the-copy.md:113-116`); after the repair the
  Verify exits 0 at 30 of 30 with prettier green (`:120`).

## T008 — Re-derive the gate shapes the landing staled: pass

- ✅ The gate's oracle record is this head's and a default run is still a read: the re-derived
  `research/raw/m044-gate-shapes.json` hashes
  `61943e374e550ae025dabfc0fa304a2f885bcc927edd9e3ac0de45bc58d4db6e` (144680 bytes) both at load and
  after the run, so the suite's still-derives assertion holds and no armed capture was needed
  (`.project/tasks/T008-re-derive-the-gate-shapes-the-landing-staled.md:178-181`); `node --test
  scripts/gate-integrity.test.mjs` reads 40 of 40 (exit 0), with both former T003 failures cleared by
  the derivation plus T009's landing and not by editing a declared file in that Log entry
  (`:161-172`), and `scripts/tutor-record-shapes.test.mjs` is 16/16/0 with T001's stale mutant
  repaired to run against a map copy with the inventory emptied — no assertion deleted, loosened or
  re-homed (`:173-176`, measured in T009's Log at
  `.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:105`).
- ⚠ Declared limit, not a defect: the re-derived record's bytes landed in `d6ffafb6` — the carry
  commit T009's checkout made of T008's dirty work, stated in both Logs
  (`.project/tasks/T008-re-derive-the-gate-shapes-the-landing-staled.md:161`;
  `.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:95`) — so
  T008's own landed commit (`53c6a77a`) touches only its task file, and the landed tree at this
  reviewed head is where the record and its four suites are read green
  (`.project/tasks/T008-re-derive-the-gate-shapes-the-landing-staled.md:186-188`). The bytes are
  T008's, measured green at `cbca600c` by T008's own Verify (`:182-185`).

## T009 — Re-derive the stability record and run the project verify: pass

- ✅ The two gate tests the milestone's own binding broke are re-pointed to a derived unshipped
  predecessor, not to a new constant: `UNSHIPPED_MILESTONE` is read from `git log --grep=^ship: M`
  the way the shipped list already was — `SHIPPED_MILESTONES` newest-first
  (`scripts/gate-integrity.test.mjs:4525-4536`), `UNSHIPPED_PREDECESSOR` the lowest id the log
  records no shipment for (`:4537-4545`), `UNSHIPPED_MILESTONE` that id plus one (`:4546`) — so at
  this head, where M057 carries no ship commit, the tests instantiate M058 and E7 prints the derived
  range by the `newest-ship` rule (`:4562-4567`, `:4667`), and E8's refusal spellings interpolate
  `${UNSHIPPED_PREDECESSOR}` so they name the id the log actually lacks
  (`:4580`, `:4675-4708`).
- ✅ The re-point is proved to still bite by a mutant of the derivation itself: with
  `UNSHIPPED_PREDECESSOR` forced to `M054` — a shipped id, so `workRange` answers by the ship rule —
  the suite is 40 tests / 38 pass / 2 fail and both failures name the defect, the rule that answered
  not being the fallback, with the second test's own title reading `... and the refusal names M054`;
  restoring the derivation returns 40 / 40 / 0
  (`.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:102`).
- ✅ The stability record was re-derived last through its own command and every moved value is the
  stage's own printed line: `research/raw/m056-gate-stability.json`'s plain-run milestone is
  `M057` (`research/raw/m056-gate-stability.json:30`) with the summary's mention count moved with
  this milestone's logs (`:33`), the predecessor stage held to M056 now examines that archive's seven
  task logs against 686 changed paths of `1aff7555..5290d939` by M055's ship rule (`:74`), and
  `capture.head` stays `5290d939` with `capture.at` staying `2026-11-15T01:09:35.719Z`, so the record
  still pins the commit it was measured at rather than HEAD
  (`research/raw/m056-gate-stability.json:87,113`); the claims record
  `research/raw/m057-verdict-claims.json` was landed by its own armed command, idempotent on a second
  run (same sha256), with the five criteria derived from the live intent character for character and
  the ten edge rows assigning every criterion's suite
  (`.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:98,103`;
  `research/raw/m057-verdict-claims.json:6-7,46-51`).
- ✅ The project verify ran as the last action and nothing was re-derived after it: the build first
  (`build-extension`, cache skipped), then `npm run check` exit 0 with the fix-record stage
  `gate-integrity: pass - 0 finding(s)`, then `npm test` exit 0 — 1834 node-side tests / 1834 pass,
  the app suite 320 / 320, skills 60 / 60, the held-out corpus 22 suites / 85 tests all passing —
  then the artifact checkout (`extension/panel/index.html`) discarding the working-tree diff of a
  build artifact (`extension/panel/index.html` carries no tracked diff at this head, `git status`
  clean for it), with the four tests the first full run had red named and repaired before the green
  run (`.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:105-107`).
- ⚠ Tooling defect, not a task defect — the nine `[ledger]` blockers: `gsd report` lists one
  `[ledger]` blocker for every task in this milestone, nine in all. The cause is measured, and it is
  `gsd land`'s own sequence: each landing writes the verify-ledger row into
  `.project/build/verify-ledger.jsonl` and then runs `git clean -f -- .project/build/`, deleting the
  entry it just wrote. The tree shows the result and not a task failure: `.project/build/` holds all
  nine per-task verify logs (`verify-T001.log` … `verify-T009.log`) and no `verify-ledger.jsonl`, and
  `git ls-files .project/build` is empty on this branch — the ledger was last tracked at M055's ship
  (`git log -- .project/build/verify-ledger.jsonl` names `1aff7555 ship: M055`). Every task's verify
  is otherwise evidenced: each `verify-T00N.log` exists, and T009's Log records the project verify's
  legs with their exit codes. The repair belongs to `gsd land`'s clean step, not to any task here.

## Intent coverage

### SC1 — An answer for a signals question names the effect node the record carries by the label the graph gives it and by its node `index`, and names the upstream nodes the graph's edges state for it, every field read from the recorded graph's own `nodes` and `edges`; each claim carries at least one artefact path of the record that states it, in M055's answer shape (`.project/ROADMAP.md:2006`); a mutant that answers with no artefact path reddens the pin M055 shipped (`.project/ROADMAP.md:2016`), and a mutant that names the effect by its position in the node array, or omits a producer an edge records, reddens the same criterion.: pass

- ✅ Covered by T006 and T007: the surface record T007 landed states the route, the loader key, each
  state with the answer field it reads and the named absence with its sentence, every citation
  re-resolved by search at the head it names
  (`research/raw/m057-surface.json:7-9,26-66,331`; the states table at `:331`), and its measurement
  command re-runs the shipped join over the record T003 pins to the same answer the demo's fact is
  held to (`research/raw/m057-surface.json:10-15`). T006's inventories keep every record this
  milestone landed measured or named-on-purpose, so the claims the surface record's route rests on
  are never an unmeasured record
  (`scripts/tutor-answer.test.mjs:1217-1244`,
  `scripts/tutor-record-shapes.test.mjs:1758-1790`).

### SC2 — Where the record carries no ordering between a write and the render, the answer states that ordering as a named absence — no write record, no order — beside the effect and its upstream nodes, and names no write, no owner and no cause; a mutant that renders the absence as causation (the write, then the render), a mutant that reads an order out of an edge's direction, and a mutant that renders a write the record does not carry each redden.: pass

- ✅ Covered by T009: the claims record T009 landed derives SC2's criterion text from the intent this
  milestone binds, character for character, and assigns SC2's two held-out edges E7 and E8 to
  `scripts/tutor-signals.test.mjs` — the suite whose ordering, causation, edge-direction and
  write-recorded mutants are the absence's proof, reviewed green in wave 2
  (`research/raw/m057-verdict-claims.json:6-7`, the suite assignment at `:46-51`, the held-out rows
  at `:29-35`) — and the surface record states the absence in its own sentence with the field each
  state reads (`research/raw/m057-surface.json:331,715-753`).

### SC5 — The answer is produced from the two records the agent already captures — the serialized graph (`extension/agent-main.js:912`, carried per check at `:1070`) and the render/effect join (`extension/render-phase.js:304`) — with no new page-side instrumentation, no second profiler tap (`.project/ROADMAP.md:1085`), and nothing the record does not hold: no DOM, no clock, no console, no page global (`extension/render-phase.js:21-26`), and no field the reader ignores (`extension/render-phase.js:33-35`); a mutant that reads a live page value, starts its own profiler tap, or answers from a field the record does not carry reddens.: pass

- ✅ Covered by T006 and T008: every record this milestone's surface moves is re-derived with its own
  command at the head that ships and is idempotent — the gate shapes record hashing identically at
  load and after a default run
  (`.project/tasks/T008-re-derive-the-gate-shapes-the-landing-staled.md:178-181`), the claims record
  changing no byte on a second armed run, and the stability record re-derived last with nothing
  re-derived after it
  (`.project/tasks/T009-re-derive-the-stability-record-and-run-the-project-verify.md:98,103`) — and
  the two inventories that count records excuse this milestone's own pair by the recordings' own
  statements, with a record neither map named still reddening
  (`scripts/tutor-answer.test.mjs:261-311`,
  `scripts/tutor-record-shapes.test.mjs:584-618`).
