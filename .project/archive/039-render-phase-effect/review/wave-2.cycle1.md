# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e5a382249d90cb2f9aa9a131313935b6c5504238

Provenance: written at the reviewed head by the ship-phase reviewer. The suite was **re-run** at
`e5a3822` (output below) and `extension/render-phase.js` was read line by line for this artifact. The
mutant block inside the suite is the suite's own: each case replaces one anchored span, asserts the
failure names the defect, then re-pins the untouched module. No page was opened, because this wave
owns a pure function and its absences.

## T002 — Join an effect to the signals its edges say it reads: pass

- ✅ `node --check extension/render-phase.js` clean, `node --check scripts/render-phase.test.mjs` clean, `node --experimental-strip-types --test "scripts/render-phase.test.mjs"` — **13 tests, 13 pass, 0 fail, 0 skipped** at `e5a3822`, `npx prettier --check extension/render-phase.js scripts/render-phase.test.mjs` — "All matched files use Prettier code style!" (T002's Verify; the same command is recorded `pass` at `7408212` in `.project/build/verify-ledger.jsonl`, which is the repair commit that re-recorded it after the base-commit TS2345)
- ✅ **AC1** an effect the graph labels produces exactly one finding naming that label and the signals its consumer edges name, and nothing the graph does not carry — `renderPhase` builds one effect finding at `extension/render-phase.js:328` through `effectFinding` at `:265`, whose four fields are `state`, `effect`, `namedBy`, `reads` and nothing else; the labelled path is `effectSubject` at `:207-215` and the reads come from `readsOf` at `:247-260`. Suite block "AC1 — an effect the graph labels produces its own finding"
- ✅ **held-out E2** an unlabelled effect is named by the edge the graph records for it (`namedBy: "recorded-edge"`), and no name is invented — `extension/render-phase.js:97-98` (`NAMED_BY_LABEL` / `NAMED_BY_RECORDED_EDGE`), `:217-241` (the edge subject: the consumer end must be exactly one effect node, and a producer end the caller also names must be an edge the graph records exactly once), `:328-332` (`labelOf(subject.node)` answers `null` for an empty label, so `effect: null` and no minted name). The three E2 mutants — "the mutant mints a name out of the node index", "the mutant claims a label named an unlabelled effect", "the mutant reports the naming mode in the effect field" — each redden and name their defect
- ✅ **held-out E3** an effect whose edges name no producer still produces a finding naming the effect and reporting an empty read — `readsOf` at `:249-258` pushes only producers the graph holds with a non-blank label, so a readless effect answers `reads: []` and keeps its finding; the fixture case is `/stale-view`, whose effect node has zero producers (`.project/research/m039-render-phase.md:107`). Mutant "the mutant turns a readless effect into an absence" reddens
- ✅ **held-out E4** no finding carries a phase, and the phase is `cannot-tell` with the named absence `no-effect-event` — the phase is built by one function, `phaseState()` at `:293-295`, and attached only by `answer()` at `:300-302`, outside `findings`; no finding shape has a phase field (`:265-272`, `:276-283`, `:287-289`). Mutants "the mutant puts a phase word on the phase object", "the mutant smuggles a phase into the effect finding", "the mutant publishes a phase word as the absence" all redden
- ✅ **held-out E1** a graph with no effect node yields the absence naming the missing node and never the words "no effects"; a fact naming no readable graph yields `graph-unreadable` instead — `:311-312` (`graphOf` null → `GRAPH_UNREADABLE`), `:318-319` (`effects.length === 0` → `NO_EFFECT_NODE`), `:101-103` (the three constants). Mutants "the mutant answers an effectless graph with the subject reason", "the mutant publishes the forbidden sentence as its reason", "the mutant calls an unread graph empty" redden
- ✅ **held-out E5** a captured message and an effect from the same read stay two findings — `:334-338`: the effect finding is pushed first and the change-detection finding is pushed after it, never merged. Mutants "the mutant answers one finding", "the mutant attaches the message to the effect finding", "the mutant joins the message to an effect" redden
- ✅ **held-out E6** a captured message that names no effect produces a change-detection finding naming no effect and no cause — `changeDetectionFinding` at `:276-283` copies exactly `code`, `message` and `provenance` from the fact and has no effect or cause field. Mutants "the mutant attaches a cause to the message finding", "the mutant drops the recorded message entirely" redden
- ✅ **held-out E8** the same graph read twice produces byte-identical text — determinism is structural (`:85-86`): no clock, no set iteration, no locale sort, and `readsOf` walks `edges` in recorded order; suite block "E8 — the same graph read twice produces byte-identical text". Mutants "the mutant orders the reads by label instead of by edge" and "the mutant answers the same fact differently on every read" redden
- ✅ **AC8** every acceptance is proven non-vacuously — the suite's helper at `scripts/render-phase.test.mjs:239` and `:273-282` asserts the untouched module passes the pin first, a one-anchor mutant reddens it, and the failure message names the defect by string; a surviving mutant fails the suite. The task logged 19 anchored mutants (E1 ×3, E2 ×3, E3 ×2, E4 ×3, E5 ×2, E6 ×2, E8 ×2, AC1 ×2), consistent with the mutant blocks at `scripts/render-phase.test.mjs:1118-1555`
- ✅ the module is a reader and nothing else — no DOM, no clock, no console, no network, no imports; suite block "purity" at `scripts/render-phase.test.mjs:1038` runs it in a bare `node:vm` context. The only host touch is the `globalThis.angularAiRenderPhase` republication at `extension/render-phase.js:356-361`, which the purity block covers

Residual, recorded rather than glossed: `namedBy` on a labelled effect is `label`, which is the fact
that the *label* was the naming mode. The task's AC2 wording ("an unlabelled effect is named by the
edge the graph records for it") is the one the code implements; a reader should take `effect: null`
plus `namedBy: "recorded-edge"` as the whole of that naming, not as a missing field.

## Intent coverage

### SC1 — On the fixture, an effect the signal graph carries produces a finding naming that effect — by its graph label when the graph supplies one, and otherwise by the edge the graph records for it — together with the signals the graph's edges say it reads, and naming nothing the graph does not carry.: pass

- ✅ the finding names the effect by its label when the graph supplies one (`extension/render-phase.js:207-215`, `:328`) and otherwise by the recorded edge (`:217-241`, `:330`), with the reads taken from the consumer edges' producer labels in recorded order (`:247-260`)
- ✅ nothing the graph does not carry is named: the finding has exactly four fields (`:265-272`), there is no write, owner or cause field and no code field, and the fixture's own effect (node 5, label `""`, one edge to `signal:count`) answers `namedBy: "recorded-edge"` with `reads: ["count"]` — `research/raw/m039-render-phase.json` (`effect.fromRecording`)

### SC2 — The phase an effect ran in is reported as cannot-tell with a named absence, because the page records no effect event: no finding carries a phase for an effect, and no rendered string names rendering or after-render as the phase an effect ran in.: pass

- ✅ the phase is one constant object outside every finding — `extension/render-phase.js:293-295` builds `{state: "cannot-tell", absence: "no-effect-event"}` and `:300-302` is the only place it is attached; no finding shape has a field a phase could occupy
- ✅ the absence has an observable behind it, and wave 1 is that observable: 26 `ProfilerEvent` values in both installed packages and none an effect event (`research/raw/m039-render-phase.json`: `profiler.effectEvent`, `profiler.identical`)
- ✅ no string the module emits names rendering or after-render as a phase, and the words "no effects" appear nowhere — the module's only phase vocabulary is the two constants at `:101-107`, and the suite's forbidden-phrase mutant ("the mutant publishes the forbidden sentence as its reason") reddens

### SC3 — A captured NG0100 message produces its own change-detection finding carrying the code and the message the page emitted, and is never joined to an effect, and never presented as evidence that an effect ran during rendering.: pass

- ✅ a recorded message becomes its own finding carrying the code, the message and the provenance it was handed and nothing else — `extension/render-phase.js:276-283` copies exactly three fields through `textOf`, and `:336-338` pushes it after the effect finding, so the two are two entries in one list
- ✅ it is never joined to an effect and never carries a cause — the change-detection finding has no `effect`, `namedBy`, `reads` or `cause` field (`:123-127`), and the effect finding has no `code` or `message` field (`:116-121`); mutants "the mutant joins the message to an effect", "the mutant attaches a cause to the message finding" and "the mutant attaches the message to the effect finding" all redden
- ✅ the capture this milestone actually holds is the digest's entry marked `notACapture: true` (`research/raw/m039-render-phase.json`: `changeDetection.substitute`), and the join copies whatever provenance string the fact carries (`:281`) rather than asserting one, so a digest entry cannot be rendered as the capture that was never taken

### SC4 — Where the graph carries no effect node, or cannot be read at all, the module reports cannot-tell naming which of the two it was, rather than reporting that the page has no effects.: pass

- ✅ two distinct absences, each named: `graph-unreadable` at `:311-312` for a fact naming no object with node and edge lists, `no-effect-node` at `:318-319` for a readable graph holding no `kind: "effect"` node, plus `effect-unreadable` at `:322-323` for a subject the graph does not hold
- ✅ an unread graph is never reported as an empty one — the two branches are separate returns before the subject is resolved, and `nonEmptyString`/`kindOf` at `:146-168` never coalesce "no label" into "no node". Mutant "the mutant calls an unread graph empty" reddens
