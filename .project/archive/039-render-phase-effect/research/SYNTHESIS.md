# Synthesis — M039 render-phase-effect

> **Authored at archive time — no research phase and no decide phase ran for this milestone.**
> M039's intent declares `Lane: standard`, but the standard lane's research and decide phases were not
> executed: the `## Log` in `.project/STATE.md` goes inspect → define → plan → build → ship for this
> milestone with **no** `research` and **no** `decide` entry between the intent's approval and the plan's,
> and `git log --all -- .project/research/SYNTHESIS.md` names no commit for this path (the only history
> at a path of that name belongs to M008 and M023, whose archives carry it). This file was written when
> the archive refused for the missing canonical artefact.
>
> It **synthesises only artefacts that already existed** — `intent/INTENT.md`,
> `research/DOCS-AUDIT.md`, `research/INSPECT-DELTA.md`, `research/m039-render-phase.md`,
> `research/raw/m039-render-phase.json`, `plan/PLAN.md`, the five task files, the five wave reviews and
> `review/FINAL.md` — and **claims no independent research**. Nothing below was measured, read or decided
> by a research or decide phase; the milestone's only measurement is T001's, taken during build and
> recorded in `research/m039-render-phase.md` and its JSON recording. Where a fact is not in those
> artefacts, this document says so instead of supplying it.

## Settled

The roadmap entry is `M039 — render-phase-effect`: "why this effect ran during rendering, and what it
touched", `Surfaces: panel`, `Depends on: [M020]` (`INSPECT-DELTA.md:29-31`). The inspect phase
recorded the one thing it insisted on before planning — that "whether an effect that ran during
rendering is observable from the page, or whether the diagnostic is compile-time only and the milestone
collapses to a `cannot-tell` deliverable" still had to be falsified by measurement (`INSPECT-DELTA.md:31-32`).

The intent measured most of that premise away before planning, and its four Corrections say so
(`INTENT.md:84-129`). Angular's `ProfilerEvent` enum declares 26 values and **none is an effect event**,
so the roadmap's "the phase" has no observable behind it; `DebugSignalGraphEdge` is a
producer/consumer index pair with no write member, so "what it touched" narrows to what the effect
*reads*; the digest carries one `NG0100` entry, not three, because the other two hits belong to
`NG01002`; and the nearest thing to a phase the page exposes, the `ReactiveNodeKind`
`afterRenderEffectPhase`, is **declared, not observed**. SC2 is therefore a cannot-tell criterion
written in place of the roadmap's phase-naming one, and that replacement sits in `INTENT.md` Corrections
rather than being absorbed silently.

Within that frame the answer is a `cannot-tell` with a measured absence, and the milestone's honest
content is what the graph *does* say: an effect, the signals its edges name, and the change-detection
message kept beside it.

## What was known before planning

`research/DOCS-AUDIT.md` is the audit in force: 320 verified, 12 stale, 0 aspirational and 205
unverifiable claims plus 1 descriptive document, audited at `c9451b1` on 2026-11-05
(`DOCS-AUDIT.md:3-16`). `research/INSPECT-DELTA.md` is a measured delta, not a re-audit: 309 paths
changed since the audit base, of which 4 changed `.md` files are audited documents
(`INSPECT-DELTA.md:6-19`), and it "does not claim that any code was audited" (`:21-25`).

Neither document answers the intent's three `[RESEARCH]` questions; they were carried into the plan
unanswered and settled by measurement during build. T001 answered two of the three:
the fixture's effect labels are empty and the portal labels exactly one effect `Resource.loadEffect`
(`m039-render-phase.md:18`); and `afterRenderEffectPhase` is declared by `ReactiveNodeKind` and observed
nowhere, with no node carrying a phase field (`:20`). The second question — what an NG0100 message names
— is recorded `unresolved` for the measured reason that no target produced one (`:19`, `:137-176`).

## The shape the plan chose

Five waves, five tasks (`PLAN.md:9-140`). Wave 1 measures the page before the plan asserts anything
about it, and is one task "because every later task quotes what it found" (`:11-13`). Wave 2 is the
pure join, provable without a page (`:28-31`). Wave 3 is the surface, following `panel-linked-state.ts`
and `panel-lint.ts` and re-cutting every route-count pin, "which is where the last two milestones lost a
gate cycle" (`:46-52`). Wave 4 adds the opt-in re-capture and the one recording the project gate itself
reads — without `research/raw/m039-verdict-claims.json` the claim-list suite fails by construction
(`:75-83`). Wave 5 is independent of the other four and last "because its measurement is the built
output" (`:99-103`). Held-out edges E1–E8 pin to the join and the pane; E9 is dismissed because "the
project gate is not a held-out check" (`INTENT.md:58`). Review panel and finding skeptics were off
(`INTENT.md:6-7`, `PLAN.md:12-15`).

## What the review found, wave by wave

- **Wave 1 (T001)** — 26 `ProfilerEvent` values in both installs, identical lists, zero names containing
  `effect`, re-derived from the two debug chunks on every run; the effect-shaped name is a node kind
  (`profiler.effectIsCarriedAs`). The counter effect is node 5, label empty, one edge to `signal:count`;
  the probe recording holds no epoch, so the record says `holdsEpoch: false` rather than inventing one.
  115 fixture nodes and a 9-route portal sweep carry **no** `afterRenderEffectPhase` node and no phase
  field. No page produced an NG0100 over 17 fixture routes and 66 clicks or 9 portal routes, so the
  negative is recorded and the digest's single entry is carried as `notACapture: true`. 28 of 28 tests
  pass, and the recording is byte-unchanged after the run (`wave-1.cycle1.md`).
- **Wave 2 (T002)** — one pure join, `renderPhase(fact) -> { findings, phase }`, with the phase built in
  one function outside every finding so SC2's "no finding carries a phase" is structural rather than
  checked (`extension/render-phase.js:293`); three named absences, the words "no effects" nowhere; 13 of
  13 tests pass with one-anchor mutants that redden naming their defect (`wave-2.cycle1.md`).
- **Wave 3 (T003)** — the pane is a view: four block kinds plus a given-state block, each holding its own
  text, assembled in the join's order (`apps/angular-ai-devtools/src/app/panel-render-phase.ts:86-134`,
  `:400`); the route is appended last and lazy (`app.routes.ts:129-132`) and the demo's sample answer is
  the join's answer for the recording (`panel-demo.ts:181-198`); 31 of 31 tests pass across the pane,
  route and fixture suites, and the fixture's own route table is untouched while the panel's grew
  (`wave-3.cycle1.md`).
- **Wave 4 (T004)** — the re-capture is armed only by `M039_CAPTURE=1` and writes nothing by default; the
  six-row claim list quotes each criterion character for character (294/245/222/180/158/48) with a reason
  answering CHARTER's portal clause; 34 of 34 tests pass. **Its gate half failed**: `npm run check` and
  `npm test` were red at `a81780f` for three causes outside its declared files, so the task returned
  `blocked` (`wave-4.cycle1.md`).
- **Wave 5 (T005)** — the panel's baseline stylesheet is real and measured: 4,461 source bytes emitted as
  1,955, with computed `padding`, `border` and `background` read off a heading, a row, the surface and a
  control, and `font-family` deliberately excluded because Chrome injects one; 15 of 15 tests pass. The
  emitted sheet fits the recorded budget at 535,369 of 535,440 bytes — **71 bytes of headroom**
  (`wave-5.cycle1.md`).

## What the repair `7408212` closed

T004's `blocked` verdict named three causes, each measured and none of them in its own files
(`.project/tasks/T004-re-capture-behind-an-opt-in-switch.md`, Log): `check:extension` failed with
`extension/render-phase.js(314,45): error TS2345`; `gate:verification` failed with
`contract:control-angular-dev-app` → `proven-manifest: features/.proven.json names features with no
feature file: portal-zoneful-worktree`; and `format:check` named `AGENTS.md` and
`extension/panel/index.html`. Repair `7408212` fixed exactly those three sites — the findings list typed
as the three-shape union (`extension/render-phase.js:113-134`, `:333`), the **contract guard** repaired
by writing `features/portal-zoneful-worktree.md` and its README row, and the two formatting sites
formatted — and changed `.project/research/DOCS-AUDIT.md` with the guard row. T002, T003 and T004 then
had their verifies re-recorded against `7408212`, and T005's Verify recorded at `e5a3822`
(`.project/build/verify-ledger.jsonl`). No gate was widened, no budget raised, no assertion relaxed and
no test skipped to reach the verdict (`review/FINAL.md`, Remediation sequence).

## The measured outcome

`review/FINAL.md` records overall `pass`, `Met: SC1, SC2, SC3, SC4, SC5, SC6`, reviewed head
`e5a3822`. Every task's Verify was re-run at that head and the project Verify was run there too.

- **SC1** — `scripts/render-phase.test.mjs` 13 of 13; the finding names the effect by its graph label or
  by the recorded edge, and the reads are the producer labels of its consumer edges
  (`extension/render-phase.js:207-260`, `FINAL.md`, SC1 block).
- **SC2** — the phase is one published constant outside every finding, and the absence behind it is a
  measurement: 26 profiler events, none an effect event (`FINAL.md`, SC2 block).
- **SC3** — the change-detection finding is its own finding with the three values it was handed, and the
  only message-shaped artefact is the digest's entry marked as a substitute (`FINAL.md`, SC3 block).
- **SC4** — three named absences, `graph-unreadable` distinct from `no-effect-node`, and the words "no
  effects" nowhere (`FINAL.md`, SC4 block).
- **SC5** — four block kinds plus a given-state block, each rendering its own text and nothing else
  (`FINAL.md`, SC5 block).
- **SC6** — `npm run check` exit 0 stage by stage; `npm test` 996/996 over 153 suites, 60/60 user-scope,
  628/628 skills, 343 app tests in 31 files, 85 held-out tests in 22 suites, 0 failures
  (`FINAL.md`, SC6 block).

## What this milestone did not settle

It settled nothing about which phase an effect ran in, and says so in the module, the pane and the
record: the page carries no event that reports an effect. It did not capture an NG0100 message — the
digest entry stands in as a named substitute, never as a capture. It did not observe a node of kind
`afterRenderEffectPhase`, because neither target calls `afterRenderEffect`. And two gaps are carried
forward rather than repaired: the emitted `extension/panel/styles.css` is git-ignored and measured only
in a working tree, and the initial bundle has 71 bytes of headroom against its recorded baseline
(`FINAL.md`, Deferred advisories). No portal route produced the facts this milestone reports, which is
why every claim-list row is `not-required` with a reason that names the portal attempt it made.
