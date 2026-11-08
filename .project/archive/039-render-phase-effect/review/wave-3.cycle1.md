# Review — wave 3, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e5a382249d90cb2f9aa9a131313935b6c5504238

Provenance: written at the reviewed head by the ship-phase reviewer. The three node suites were
**re-run** at `e5a3822` (output below) and the pane, the route table and the demo loader were read for
this artifact. The Angular app suite (`npx nx run angular-ai-devtools:test`) was **not** re-run here —
it is part of `npm test`, which `prepare-final` executes in isolation at this head, and the re-cut
count pins it holds are cited from the task and read in the sources. The pane was not walked in a
browser: the surface's behaviour is pinned by `scripts/panel-render-phase.test.mjs`, which executes the
module, and that suite is green at this head.

## T003 — Panel surface for the render-phase findings: pass

- ✅ `node --check scripts/panel-render-phase.test.mjs` clean, `node --check scripts/panel-routes.test.mjs` clean, `node --experimental-strip-types --test "scripts/panel-render-phase.test.mjs" "scripts/panel-routes.test.mjs" "scripts/after-render-fixture.test.mjs"` — **31 tests, 31 pass, 0 fail, 0 skipped** at `e5a3822` (T003's Verify; recorded `pass` at `7408212` in `.project/build/verify-ledger.jsonl`)
- ✅ **AC1** the pane renders the effect's name and one line per signal its edges name, and nothing it was not given — `effectBlock` at `apps/angular-ai-devtools/src/app/panel-render-phase.ts:221-243` prints `effect: <name>` or `NO_LABEL_LINE` (`:157`), then `namedBy: <mode>`, then one `read: <signal>` per read or `NO_READ_LINE` (`:160`). Lines are built from the answer's own `effect`, `namedBy` and `reads` and from nothing else
- ✅ **AC2** the phase renders as its own block, says it cannot tell and names the absence the join published, and never sits inside an effect finding — `phaseBlock` at `:249-258` copies `phase.state` and `phase.absence` out of the answer (`:363-368`) and prints `phase: <state>` then `absence: <absence>`; it is appended after the findings at `:438-439`, never merged into a finding block. Mutant M3 ("merges the phase's absence into the effect block") reddens two pins: `effect-block-own-text` and `blocks-separate: the effect block must render no phase absence: line`
- ✅ **AC3** the change-detection finding renders as its own block carrying the code, the message and the provenance it was handed, and is never rendered as an effect's cause — `changeDetectionBlock` at `:265-282` pushes `code:`, `message:` and `provenance:` only for fields it was handed, and prints `NO_FIELD_LINE` when the answer carried none; it has no effect or cause line. Mutant M4 reddens `change-detection-block-own-text`
- ✅ **held-out E7** each state renders its own text and nothing else, and a state the pane was not written for still renders the state it was given — `asBlock` at `:325-356` dispatches on the state word alone and falls through to `givenBlock` at `:302-305`, which prints `state: <the word it was given>` and nothing more; `combined` at `:400-419` keeps every block's own `lines` and concatenates them only for the flat `text`. Mutants M1, M2, M5, M6 redden `renders-no-phase`, `effect-block-own-text`, `given-state-rendered` and `idle-own-text`
- ✅ **AC5** the route, the demo loader and every count pin were re-cut, with the failing assertion quoted — `apps/angular-ai-devtools/src/app/app.routes.ts:129-132` appends `render-phase` last, lazily, through `PanelDemoComponent` with `data: { surface: 'render-phase' }`; the loader key is `apps/angular-ai-devtools/src/app/panel-demo.ts:49` and its sample fact is `:181-198`; the pins are `app.spec.ts:54` (ordered path list) and `:119-126` (loaded lazily, `data.surface === 'render-phase'`), `chat-entry.component.spec.ts:712`, `:734`, `:776`, `page-picker.component.spec.ts:421` and `:437`, `panel-demo.spec.ts:480-528`. T003's Log quotes each failing assertion as seen red with the route removed
- ✅ the fixture's own nineteen-route table is left alone while the panel's grew — `scripts/after-render-fixture.test.mjs` and `tests/held-out/fixture-explainers-unchanged.test.mjs` are in this Verify and pass untouched at this head, which is exactly what AC5's last clause asks
- ✅ **AC6** a mutant that renders a claim the fact list does not carry reddens, naming the defect — six mutants in `scripts/panel-render-phase.test.mjs`, each a copy of the surface with one anchored edit: M1 a phase word in the effect block, M2 a code the block was not given, M3 the absence merged into the effect block, M4 the effect's text in the change-detection block, M5 a given state dropped, M6 idle rendering a finding claim. Each reddens after the untouched module passes its pin first
- ✅ the pane derives nothing and holds no constant of its own for a phase — `:19-23` and `:249-258`: `cannot-tell` and `no-effect-event` are printed because the answer carried them, and an answer with no phase renders no phase block rather than this milestone's expected absence (`:358-368`)

Residual, recorded rather than glossed: the `npx nx run angular-ai-devtools:test` run T003 cites
(31 files / 343 tests) is the task's measurement at its own head, not this artifact's; the app suites
are covered here by reading the re-cut pins and by `npm test` under `prepare-final`.

## Intent coverage

### SC1 — On the fixture, an effect the signal graph carries produces a finding naming that effect — by its graph label when the graph supplies one, and otherwise by the edge the graph records for it — together with the signals the graph's edges say it reads, and naming nothing the graph does not carry.: pass

- ✅ the pane renders the effect the join named and the reads the join reported, and mints nothing of its own — it prints `NO_LABEL_LINE` where the answer carried no name (`apps/angular-ai-devtools/src/app/panel-render-phase.ts:157`, `:226-228`) and one `read:` line per reported signal (`:230-234`); it never reads a graph, so it cannot name an effect, a read or a write the graph does not carry
- ✅ the demo's sample fact is the join's own answer for the recording rather than an invented one — `apps/angular-ai-devtools/src/app/panel-demo.ts:181-198`: `effect: null`, `namedBy: 'recorded-edge'`, `reads: ['count']`, matching `research/raw/m039-render-phase.json` (`effect.fromRecording.signalsTheEdgesName`), and `panel-demo.spec.ts:448-528` holds it to the recording

### SC2 — The phase an effect ran in is reported as cannot-tell with a named absence, because the page records no effect event: no finding carries a phase for an effect, and no rendered string names rendering or after-render as the phase an effect ran in.: pass

- ✅ the phase renders in its own block from the answer's own two fields (`panel-render-phase.ts:249-258`, `:363-368`), and the pane holds no phase word of its own — an answer with no phase renders no phase block
- ✅ no rendered string names rendering or after-render as a phase an effect ran in: the pane's phase vocabulary is `phase:` plus whatever `state` arrived and `absence:` plus whatever `absence` arrived, and mutant M1 (`phase: rendering` in the effect block) reddens with `renders-no-phase: the pane must render nothing the answer did not carry; it rendered ["a phase"]`

### SC3 — A captured NG0100 message produces its own change-detection finding carrying the code and the message the page emitted, and is never joined to an effect, and never presented as evidence that an effect ran during rendering.: pass

- ✅ the message renders as its own block with its own code, message and provenance lines (`panel-render-phase.ts:265-282`), appended after the findings and never beside the effect as a cause; mutant M4 (the effect's text inside the change-detection block) reddens
- ✅ the demo's provenance string is the substitute's own — `panel-demo.ts:194` renders `provenance: 'digest entry, not a capture'`, which is the recording's `changeDetection.substitute.notACapture` stated in words, so the pane cannot present a digest entry as the capture that was not taken

### SC5 — The panel renders the effect, the signals it reads, the phase state and the change-detection finding as separate things, and renders nothing it was not given.: pass

- ✅ four kinds of block, kept apart: `EffectBlock`, `PhaseBlock`, `ChangeDetectionBlock`, `AbsenceBlock` plus `GivenBlock` (`panel-render-phase.ts:86-134`), each carrying its own `message`, `lines` and `text`, assembled by `combined` at `:400-419` into one flat list plus the structured `blocks`
- ✅ nothing is rendered that was not given — every rendered value comes from the answer through `nonEmptyString`/`textOf`/`stringList` at `:177-203`, and a state the pane was not written for renders its own word and borrows no field (`:302-305`). E7's pin and M5/M6 redden together
