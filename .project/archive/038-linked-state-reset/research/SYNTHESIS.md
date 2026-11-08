# Synthesis — M038 linked-state-reset

> **Authored at archive time — no research and no decide phase ran for this milestone.**
> M038 executed the **quick lane**: its STATE log goes inspect, define, plan, build, ship, with no
> research and no decide entry, and `git log --all -- .project/research/SYNTHESIS.md` is empty — the
> file has never existed on any branch. It was written when the archive refused for the missing
> canonical artifact. It **synthesises only artifacts that already existed** (`intent/INTENT.md`,
> `research/DOCS-AUDIT.md`, `research/INSPECT-DELTA.md`, `plan/PLAN.md`, the five wave reviews,
> `review/PATCH-FINDINGS.md`, `review/FINAL.md`, the two gap reviews) and **claims no independent
> research**: nothing below was measured, read or decided by a research or decide phase, and no source
> outside that record was consulted. Where a fact is not in those artifacts, this document says so
> instead of supplying it.

## Settled

The roadmap asked for an explainer of state that resets itself — "why this linked signal or state
value returned to its source value" (`ROADMAP.md:1412`) — with the scope line "the write that caused
the reset, distinguished from a recomputation" (`:1422`) and the criterion "a linked value that
returned to its source produces a finding naming the write that reset it" (`:1432`).

The intent measured that premise away before planning (`INTENT.md:10-25`): the fixture had no
`linkedSignal`, the extension had no reference to one either, and the graph carries
`{kind, label, value, fn}` per node with no history (`:15-21`). The correction (`:75-79`) replaces "the
write that caused the reset" with a cannot-tell requirement; the second (`:81-82`) records that there
was no subject, so T001 had to author the linked states first. What shipped is narrower than the
roadmap line, and the narrowing sits in `INTENT.md` Corrections rather than being absorbed silently.

Within that frame the answer is positive: a linked signal **is** distinguishable — by its node kind
`linkedSignal`, never by its label — and its source is reachable as the producer both linked signals
share (`wave-1.cycle1.md:15-16`). The intent's risk, that labels might not separate a linked signal
from a plain computed (`INTENT.md:86-89`), did not materialise.

## What was known before planning

`research/DOCS-AUDIT.md` is the audit in force: 144 documents, 533 claims at `c9451b1`
(`INSPECT-DELTA.md:7`) — 316 verified, 12 stale, 0 aspirational, 205 unverifiable, 1 descriptive
(`DOCS-AUDIT.md:9-15`). `research/INSPECT-DELTA.md` is a measured delta, not a re-audit: no document
under `docs/**` or `references/**` moved, one planning record did (`:11-17`), and 221 non-audit paths
changed, 136 of them `.project` bookkeeping (`:20-26`). It "does not claim that any changed code was
audited" (`:28-32`). It also answers none of the intent's three open questions (`INTENT.md:93-95`: the
node label of a linked signal, whether the graph exposes its source, whether the fixture can express a
differing write); they were carried into the plan unanswered and settled by measurement, not research.

## The shape the plan chose

Five waves, six tasks, ordered by dependency: measure and author (T001), join (T002), render (T003),
re-record and run the gate (T004), then two gate repairs (T005, T006) (`PLAN.md:14-88`). Wave 1 is one
task "because the label decides whether the rest of the milestone is buildable" (`:20`) — the open
question is a wave-1 blocker, not a research appendix. Held-out edges pin to the join and the pane
(`:90-99`), every criterion has a task and an acceptance-criterion cell (`:101-113`), and the panel is
the only surface, with four states including `cannot-tell` and `idle` (`:126-142`). Wave 5 exists only
because wave 4's gate was red at the reviewed head; it is shared because the repairs "are independent
repairs to the gate itself … touch disjoint files" and neither edits `package.json`, widens a
tolerance or skips a test (`:74`). Review panel and finding skeptics were off (`INTENT.md:6-7`).

## What the review found, wave by wave

- **Wave 1 (T001)** — a linked signal is identified by node kind and carries its field name as its
  label (`agreeing`, `differing`); the source is node index 2, kind `signal`, label `source`, value 7,
  reachable only as the shared producer because the template never reads it
  (`spikes/ng222-app/src/app/linked-state-page.ts:38`); the differing state is one write,
  `this.differing.set(this.source() + 1)` (`:42`); the capture is armed by `M038_CAPTURE`, two unarmed
  runs leave the recording byte-identical, and the route pin moved to 19 (`wave-1.cycle1.md:14-20`).
- **Wave 2 (T002)** — one comparison, `value === source.value` at `extension/linked-state.js:253`,
  separates `matching` from `differing`; an unreadable source refuses at `:249` with
  `SOURCE_UNREADABLE`; a finding carries exactly six fields; fifteen mutants are non-vacuous
  (`wave-2.cycle1.md:14-19`).
- **Wave 3 (T003)** — the pane reads the join's `reason` and never re-derives the agreement
  (`apps/angular-ai-devtools/src/app/panel-linked-state.ts:214`), renders four states (`:190`, `:238`),
  renders an unwritten state under its own name (`:253`), and loads lazily from `panel-demo.ts:30`
  (`wave-3.cycle1.md:14-19`).
- **Wave 4 (T004)** — the gate passed at the wave's own head `c09b299`, where the chain did not yet
  carry the verification stage; at the reviewed head `9f8deed` the pin still named the older list
  (`wave-4.cycle1.md:11`; `FINAL.md:94`) — one evidence line, nothing more (`wave-4.cycle1.md:9-16`).
- **Wave 5 (T005, T006)** — the pin was re-cut to the chain `check` runs (7 of 7 at `414a199`, 1 of 7
  red at base `75a62bc`); the four skill tests each copy the module their own `fingerprint.mjs`
  imports (4 of 4 at `65c7f03`, 4 of 4 red at base `414a199`, `ERR_MODULE_NOT_FOUND` naming
  `text.mjs`); no assertion changed, no test skipped, `package.json` untouched
  (`wave-5.cycle1.md:11-15`).

## What P001–P003 repaired

`review/PATCH-FINDINGS.md` recorded `ship/blocked` at `9f8deed` with three findings (`:3-4`).
**P001**: project Verify red at the reviewed head (source `final-gap-1.md`), closed by the Verify
passing at `861d35be` (`final-gap-1.md:3-12`). **P002**: chain and pin disagreed — `08a8418` added
`npm run gate:verification` while the pin named the older list (`:19-20`) — repaired test-side by T005;
`FINAL.md:110` records the choice, the stage stays and the pin follows it, since removing the stage to
satisfy its own pin is the narrowed check N6 forbids. **P003**: four skill tests could not resolve the
module their own copy imports, because `24fe740` made each `control-*/scripts/fingerprint.mjs` a byte
copy importing `./text.mjs` while those tests copied only `fingerprint.mjs` (`:26`); T006 copies
`text.mjs` beside it and changes nothing else, proven red at `414a199` (`final-gap-2.md:9-11`). Both
repairs are test-side — no change under `extension/`, `apps/` or `src/`, no check relaxed or skipped,
no product code written to reach the verdict (`FINAL.md:25-30`, `:106`).

## The measured outcome

`review/FINAL.md` records overall `pass`, `Met: SC1, SC2, SC3, SC4, SC5, SC6`, reviewed head
`861d35be` (`:3-7`). It is a bookkeeping head: the code review was made at `65c7f03` and re-recorded
unchanged, and the two commits between them touch no path under `extension/`, `apps/`, `src/`,
`scripts/`, `.commandcode/skills/` or `package.json` (`:9-21`).

- **SC1** — `scripts/linked-state.test.mjs` 11 of 11; the join over the recording's graph answers
  `{"state":"finding","signal":"agreeing","source":"source","value":7,"sourceValue":7,"reason":"matching"}`
  (`:37-38`).
- **SC2** — the differing subject answers `value: 8` beside `sourceValue: 7`, `reason: "differing"`
  (`:46-47`).
- **SC3** — 41 tests, 41 pass across the four capture suites, the recording hashing the same before
  and after so the run wrote nothing; read through `ng.ɵgetSignalGraph(ng.getInjector(...))`
  (`scripts/linked-state-capture.test.mjs:677`, `FINAL.md:55-56`).
- **SC4** — the four absences each answer `state: "cannot-tell"` with their reason and nothing else
  (`:64-65`, `extension/linked-state.js:249`).
- **SC5** — the pane was walked state by state, including an unwritten state; E5 is pinned in
  `scripts/panel-linked-state.test.mjs`, 34 of 34 with the route and router-diagnostic suites
  (`:74-76`).
- **SC6** — `npm run check` exits 0 at every stage including `gate:verification`; `npm test` is primary
  908 of 908, user-scope 60 of 60, skills 628 of 628, app 342 passed, held-out 22 suites and 85 tests;
  `scripts/panel-typecheck-scope.test.mjs` is 7 of 7 (`:83-84`).

`review/final-gap-1.md` is the project-verify gap at the same head and passes — check
`npm run check && npm test`, "Exit 0", the ledger entry as reference (`:3-12`);
`review/VERIFICATION.json` records ship-mode verification passing with no blockers (`:1-5`).

## User rulings

No separate ruling artifact exists: the intent corrections sit in `INTENT.md:75-82` and name no ruler,
and `FINAL.md:110` records only that neither patch repair needed an owner ruling. Nothing records who
authorised the corrections, and this document does not invent one.

## What this does not settle

- **Waves 1–3 were reconstructed, not independently reviewed.** `gsd review-emit` emitted a `TODO`
  evidence line for T001 because the ledger stores T001's command unquoted while the task quotes its
  globs, so those artifacts were written at the reviewed head from the ledger entries proving each
  task's Verify (`fdcbc3f8`, `8cb05446`) plus re-runs there (`FINAL.md:100`, `:116-121`) — their
  provenance lines say so (`wave-1.cycle1.md:9-10`, `wave-2.cycle1.md:9-10`, `wave-3.cycle1.md:9-10`).
  The review states it "is not independent of the build" (`FINAL.md:121`), and with panel and skeptics
  off (`INTENT.md:6-7`) no independent reviewer saw this work.
- **`AGENTS.md` still carries uncommitted policy rules.** The working tree holds a new "Verification
  target: the Insurance Portal first" section in `AGENTS.md` and a rebuilt `extension/panel/index.html`;
  neither belongs to any M038 task, both are unformatted, and they "still need an owner decision"
  (`FINAL.md:111`). Under that rule the portal is the default target and a fixture is a fallback that
  must name the portal route it tried; the section also records that 15 of 23 existing verdict specs
  drove the counter fixture. M038's evidence is fixture evidence (`spikes/ng222-app`), and no artifact
  states whether it survives that rule once committed. A third path,
  `.commandcode/skills/control-angular-dev-app/features/.proven.json`, is also modified; no review or
  gap artifact names it, so its provenance is not recorded.
- **The roadmap entry is not closed** — `ROADMAP.md:1416-1418` still reads `Status: pending`,
  `Archive: null`, `Integrated: null`.
- **The roadmap's criteria were not the ones met.** M038 shipped against rewritten SC1–SC6
  (`INTENT.md:34-39`), not roadmap criteria 1–3 (`ROADMAP.md:1432-1434`); criterion 2, "a recomputation
  is not reported as a reset", has no counterpart claiming it — the milestone reports agreement and
  refuses when it cannot tell.
- **The audit in force is not repaired** — its 12 stale and 205 unverifiable claims
  (`DOCS-AUDIT.md:9-15`) carry forward; M038 repaired no documentation claim.
- **Criterion and gate evidence are at different heads** — SC1–SC5 rest on the review at `65c7f03`;
  only the project Verify was re-run at `861d35be` (`FINAL.md:17-21`), and nothing re-ran the wave
  suites at the archive head.
- **Historic branches remain** — `gsd report` warns about `backup/m034-*`, `backup/m038-*`,
  `task/T001-*` and `gsd-path/M038`; the ship phase does not delete them and `gsd cleanup` does
  (`FINAL.md:112`).
