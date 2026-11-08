# Synthesis — M040 performance-narrator

> **Authored at archive time — no research phase and no decide phase ran for this milestone.**
> M040's intent declares `Lane: standard`, but the standard lane's research and decide phases were
> not executed: the `## Log` in `.project/STATE.md` runs inspect → define → plan → build → ship for
> this milestone with **no** `research` and **no** `decide` entry between the intent's approval and
> the plan's, `git log --oneline df142d4 --not main -- .project/research/SYNTHESIS.md` names no
> commit, and `git ls-tree -r HEAD -- .project/research` lists exactly three files —
> `DOCS-AUDIT.md`, `INSPECT-DELTA.md` and `m040-performance-narrator.md` — none of them a synthesis.
> This file was written when the archive refused for the missing canonical artefact.
>
> It **synthesises only artefacts that already existed** — `intent/INTENT.md`,
> `research/DOCS-AUDIT.md`, `research/INSPECT-DELTA.md`, `research/m040-performance-narrator.md`,
> `research/raw/m040-work-events.json`, `research/raw/m040-verdict-claims.json`, `plan/PLAN.md`,
> the five task files, the five wave reviews and `review/FINAL.md` — and **claims no independent
> research**. Nothing below was measured, read or decided by a research or decide phase; the
> milestone's only measurements are T001's and T005's, taken during build and recorded in
> `research/m040-performance-narrator.md` and the two recordings. Where a fact is not in those
> artefacts, this document says so instead of supplying it.

## Settled

The roadmap entry is "which component did the work in this frame, and what it cost", `Surfaces:
panel`, `Depends on: [M020]` (`INSPECT-DELTA.md:23`). The inspect phase did not re-audit; it measured
document churn and turned the roadmap line into a falsifiable question — "does a widened recording of
`ComponentStart/End` on the portal attribute the work to a component name, with a cost that is a
measured duration rather than an inferred one" (`INSPECT-DELTA.md:30-34`) — after first measuring that
"the observable exists", because M039 had already enumerated 26 `ProfilerEvent` values including the
five pairs (`INSPECT-DELTA.md:25-28`).

The intent settled three things before planning, in `## Corrections` rather than by editing the
criteria silently (`INTENT.md:100-133`). **The milestone is buildable and the widening is part of it**
(`INTENT.md:102`): the installed `@angular/core` declares 26 `ProfilerEvent` values identical in the
panel's 22.1.8 and the fixture's 22.2.2, five of them a start and an end bracketing one unit of work,
while the agent hard-codes four (`extension/agent-main.js:21-26`) and `onEvent` drops the rest
(`extension/agent-main.js:562-602`), so widening the agent is the design decision the milestone turns
on. **The existing recording proves the events, not their identity** (`INTENT.md:120`): M039 measured
no per-value instance and no wall-clock time, so "which component" is answerable only as far as the
profiler names one, SC3 makes the unnamed bracket a cannot-tell, and a first task must measure which
pair carries an identity. **The four existing events are load-bearing and must not be re-cut**
(`INTENT.md:129`): `OutputStart` 6 sets the cycle trigger and `TemplateUpdateStart` 2 opens the cycle,
so the widening is additive or it is a regression.

Within that frame the milestone's answer is a measured narration with two measured absences, and its
honest content is what the record *does* say rather than what order would let it infer.

## What was known before planning

`research/DOCS-AUDIT.md` is the audit in force: 320 verified, 12 stale, 0 aspirational and 205
unverifiable claims plus 1 descriptive document, audited at `c9451b1` on 2026-11-05
(`DOCS-AUDIT.md:3-15`). `research/INSPECT-DELTA.md` is a measured delta, not a re-audit: 346 paths
changed since the audit base, of which 6 changed `.md` files are audited documents
(`INSPECT-DELTA.md:10-12`), and it "does not claim source was audited. It measures document churn
only" (`:19`).

Neither document answers the intent's three `[RESEARCH]` questions (`INTENT.md:164-166`). All three
were carried into the plan unanswered and settled by measurement during build: the first (which pairs
carry an identity) by T001; the second (the matching rule when a cycle interleaves) by T001's measured
nesting and the rule it hands the narrator; the third (what the zoneful portal reports) by T001's
named refusal and T005's zoneless portal attempt. The plan records no answered question in advance,
which is why T001 exists at all.

## The shape the plan chose

Five waves, five tasks, one task per wave, review panel off and finding skeptics off
(`PLAN.md:7-12`). Wave 1 measures the identity question before the plan answers it, and runs alone
"because every later task quotes what it found" (`PLAN.md:14-20`). Wave 2 widens the one
`ɵsetProfiler` subscription to the five pairs, and is "the design decision the milestone turns on"
because the four existing events are load-bearing (`PLAN.md:30-36`). Wave 3 is the pure join — "one
pure function over the frame it is handed, so ordering, absence and the unmatched start are provable
without a page" (`PLAN.md:46-52`). Wave 4 is the surface, which "re-cuts every pin the registration
moves — including the suites that enumerate the route table, which is where earlier milestones lost a
gate cycle" (`PLAN.md:62-68`). Wave 5 adds the opt-in re-capture and the two recordings the gate
itself reads: "without `research/raw/m040-verdict-claims.json` the claim-list suite fails by
construction" (`PLAN.md:78-84`).

Held-out edges E1–E8 pin to T002, T003 and T004 (`PLAN.md:94-105`), and E9 is dismissed because "the
project gate is not a held-out check; it is the repository's own Verify" (`INTENT.md:74`). Six
prohibitions N1–N6 mirror the six criteria one for one (`INTENT.md:76-86`), and the panel is declared
the only surface with a five-step walkthrough (`PLAN.md:139-157`).

## What the review found, wave by wave

- **Wave 1 (T001)** — 26 enum values and the same five pairs from **both** installed builds, with
  `"identical": true` (`research/raw/m040-work-events.json:377-379`); a per-pair identity table
  (`:1564`) whose summary is that "three pairs carry an identity on both ends … one carries it on its
  end only (`Component`), and one carries none at all (`ChangeDetection`)" (`:2148`); `ChangeDetection`
  null at both ends as a measurement rather than a reading off the signature (`:1885`, witness rows
  `:1892-1903`, named absence `:2145`); `Component` end-only (`:1987`); and the frame-bracketing
  disagreement recorded with the rule the narrator must obey (`:2403-2414`) instead of smoothed over.
  25 of 25 tests pass and the run writes nothing (`wave-1.cycle1.md`).
- **Wave 2 (T002)** — 4 events became 12 on the shipped literal (`extension/agent-main.js:24-37`), all
  twelve travelling one shape `{ type, pair, end, at, componentName }` built from one data table
  through one value-free builder (`:644-701`), so no surface branches on an event number. The
  additive proof is on the load-bearing four (`:576-585`, `:599-600`) and an added start creates no
  check and opens no cycle (`extension/agent-main.test.mjs:2460`). Held-out E3 lands non-vacuously
  (`:2386-2427`) and five mutants each redden naming their defect. 68 of 68 tests pass
  (`wave-2.cycle1.md`).
- **Wave 3 (T003)** — one pure function `narrate(frame)` (`extension/performance-narrator.js:257`) that
  reads only the frame it is handed (`:140-164`) with no import, DOM or clock; ordering is recorded
  start order and nothing is sorted (`:278-286`, `:303-309`); the duration is `endedAt - startedAt`
  over the page's own receipt times (`:195`); an unnamed interval answers `cannot-tell` with
  `no-component-identity` and carries no name and no cost (`:202-209`); an unclosed start answers
  `unmeasured` with no duration (`:213-215`); matching is last-in-first-out within the pair
  (`:289-299`). Ten of ten tests pass, with mutants reddening position, nearest named neighbour, the
  fallback word, an end taken from the next event, and an outer start closed instead of the inner one
  (`wave-3.cycle1.md`).
- **Wave 4 (T004)** — the pane is a view: one row `{ state, pair, identity, cost }` with the identity
  from `componentName` or `absence` only and the cost from `durationMs` only
  (`apps/angular-ai-devtools/src/app/panel-performance.ts:142-158`), each cell printed only when it
  has text (`:165-170`), rendered in the answer's order (`:216-238`), reading no `startedAt`,
  `endedAt`, `unresolved` or `events` (`:99-104`). The route is registered lazily
  (`app.routes.ts:138-141`) and every route-table pin it moved was quoted in the wave's own land.
  Twenty-five of twenty-five tests pass with ten mutants each naming its defect, plus 31 files / 344
  tests in the app suite (`wave-4.cycle1.md`).
- **Wave 5 (T005)** — the capture is armed only by `M040_CAPTURE=1` and writes nothing by default,
  proved by hashing the recording either side of an armed run (`188feb91…` before and after); the
  six-row claim list quotes each criterion character for character at 482/340/349/296/220/48
  characters (`research/raw/m040-verdict-claims.json:8-50`); and the portal clause is ruled rather
  than glossed — the pinned zoneful worktree stays a recorded negative
  (`research/raw/m040-work-events.json:3235-3244`, `countedAs: "negative, not a capture"`), the
  zoneless portal on `92d46ec` yields the profiler and all five pairs at both ends (`:3246-3364`), and
  `:3367` rules what that is not: "a positive measurement that the stream is available on a portal
  route, not a frame this milestone narrates". Fourteen of fourteen pass unarmed, fifteen of fifteen
  armed (`wave-5.cycle1.md`).

## The measured outcome

`review/FINAL.md` records overall `pass` (`FINAL.md:3`), reviewed head
`df142d42d0988360240239fd2043aa1162a761bd` (`FINAL.md:5`), and `Met: SC1, SC2, SC3, SC4, SC5, SC6`
with each criterion given its own verdict (`FINAL.md:46`, `:55`, `:64`, `:73`, `:82`, `:91`). The five
landed commits are `d671bd5`, `110d9fc`, `357507a`, `cff7896` and `df142d4` (`FINAL.md:26-40`), and
`.project/build/verify-ledger.jsonl` holds exactly five rows, each `"result": "pass"` at its own head.

- **SC1** — the join lists components in recorded start order and takes each cost only from the
  difference of the two receipt times the page wrote (`extension/performance-narrator.js:257`,
  `:278-286`, `:303-309`, `:195`), with E1 reddened by two mutants. Closed at wave 3, re-derived at
  wave 5.
- **SC2** — recording stayed additive and one shape serves all twelve values, with no surface
  comparing an integer (`extension/agent-main.js:576-585`, `:599-600`, `:644-701`, `:744`). Closed at
  wave 2, completed at wave 4 for the surface half.
- **SC3** — the absence is measured rather than assumed, and where the criterion's wording and the
  measurement part company the review says so: the pair with no identity at either end is
  `ChangeDetection`, not `Component`, whose end carries `componentView[CONTEXT]`; both states are
  honest and neither borrows a name from an index, a position or a neighbour.
- **SC4** — a measured zero stays a measured cost because `durationMs` is a plain subtraction with no
  truthiness test; an unclosed start carries no cost field at all; an end with no open start is
  unresolved rather than walked backwards (`extension/performance-narrator.js:151-164`, `:188-197`,
  `:213-215`, `:289-299`).
- **SC5** — the pane prints only what the answer carried, and the same answer rendered twice is
  byte-identical (`panel-performance.ts:152-170`, `:216-238`), with E7 and E8 pinned.
- **SC6** — `npm run check` and `npm test` green at the head, with the honesty about how they were
  obtained stated in the review rather than elided.

## What this milestone did not settle

It did not name the component for a change-detection bracket, and cannot on this build: 12/13 carries
no identity at either end (measured, `research/raw/m040-work-events.json:1885`, `:1892-1903`). It did
not observe an *unmatched* start on any target it drove — three ticks per page produced a match every
time, so the unmatched case is T003's fixture rather than T001's measurement
(`research/m040-performance-narrator.md:180-201`). It says nothing about a production build: every
site read is in the development bundle, and the agent already refuses a page without `ɵsetProfiler`.

Two limits are carried forward rather than repaired and are recorded here because they bear on how
much the verdict is worth. First, the final review could not watch the tail of the held-out corpus —
its harness limit cut the run after the corpus had begun — so the 85/85 rests on T005's own reading
corroborated by the ledger row, and the reviewer reports that tail as not observed rather than as
passed on its own authority (`FINAL.md:89-97`); the fix named there is in the harness, not the head:
run the corpus as its own bounded leg. Second, `.project/build/` and `.project/review/` are untracked
in the working tree, so the ledger, the five wave reviews and `review/FINAL.md` are evidence on disk
rather than history that travels with the branch (`FINAL.md:153-178`), and `in-flight.json` carries a
hand-written `"status": "landed"` that no tool produced. A reader should prefer the ledger row to it.

The portal line is ruled as what it is and not more: a zoneless portal route proved that the profiler
stream is available there, but the frame this milestone narrates is the counter fixture's, and no
portal route produced a duration this surface reports.
