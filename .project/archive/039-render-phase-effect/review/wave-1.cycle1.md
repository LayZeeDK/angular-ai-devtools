# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e5a382249d90cb2f9aa9a131313935b6c5504238

Provenance: this artifact was written at the reviewed head by the ship-phase reviewer, not by the
build. What it records is a **re-run** of T001's Verify at `e5a3822` plus a fresh reading of the
recording, the write-up and the suite — not a fresh browser drive. The page reads T001 took
(`chrome-beta-gemma4`, CDP 9334, Chrome 158.0.8127.18, counter fixture on `:4222`, portal on
`:4507`) are quoted from the recording's own provenance block and were **not** repeated here; no
browser instance was started for this review. Where a claim is re-derived by the suite at this head,
the command and its output are given; where it rests on T001's provenance, that is said.

## T001 — Measure the profiler events, the NG0100 message and the effect's edges: pass

- ✅ `node --check scripts/render-phase-measure.test.mjs` clean, `node --experimental-strip-types --test "scripts/render-phase-measure.test.mjs"` — **28 tests, 28 pass, 0 fail, 0 skipped** at `e5a3822`, `npx prettier --check scripts/render-phase-measure.test.mjs` — "All matched files use Prettier code style!" (T001's Verify, re-run at this head; the same command is recorded `pass` at `6211a32` in `.project/build/verify-ledger.jsonl`)
- ✅ every `ProfilerEvent` value is enumerated by name and number **from the two installed packages by one reader**, not from a quoted list — `research/raw/m039-render-phase.json` (`profiler.sources`): panel `node_modules/@angular/core/package.json` at 22.1.8 from `fesm2022/_debug_node-chunk.mjs`, count 26; fixture `spikes/ng222-app/node_modules/@angular/core/package.json` at 22.2.2, count 26; `profiler.numbers` `{first: 0, last: 25, contiguous: true}`; `profiler.identical` `true`
- ✅ the enumeration shows **no effect event among the 26** — `profiler.effectEvent` `{search: "does any value name contain \`effect\`, case-insensitively, in either package", matchingNames: [], absent: true, count: 0}`; the effect-shaped name in both packages is a node kind, not an event — `profiler.effectIsCarriedAs` `{symbol: "afterRenderEffectPhase", carrier: "ReactiveNodeKind", declaration: "node_modules/@angular/core/types/_formatter-chunk.d.ts", kindsIdentical: true, isProfilerEvent: false}`. The suite re-derives this from the installed chunks on every run ("no ProfilerEvent value denotes an effect, derived from both installed chunks")
- ✅ a live NG0100 attempt is recorded with its provenance, and where the page produced none the negative is recorded with what was tried — `changeDetection.result` `"negative"`, `changeDetection.messages` `[]`, and `changeDetection.substitute` `{kind: "digest-entry", notACapture: true, source: "extension/error-digest.json", digestVersion: "22.2.x", entryIndex: 0, code: "NG0100", title: "Expression Changed After Checked"}`. `.project/research/m039-render-phase.md:143-161` records the sweep (17 fixture routes / 66 clicks / 0 NG0100; 9 portal routes / 0 NG0100) and the codes that did appear (NG0950, NG02952, NG04002, NG0913), so "no NG0100" is not confused with "no console output"
- ✅ the digest's `NG0100` entry is named **as a substitute, never relabelled a capture** — `substitute.notACapture` is `true` and its reading says so verbatim; the suite's "the live attempt produced no NG0100, and the digest entry is a substitute" pin passes at this head, and its mutant "a fabricated capture reddens" / "a digest entry relabelled as a capture reddens" both bite
- ✅ the effect node the graph carries is recorded — its kind, the **measured fact that its label is empty**, its edges and the signals those edges name — `effect.fromRecording` `{kind: "effect", label: "", labelEmpty: true, epoch: null, holdsEpoch: false, signalsTheEdgesName: ["count"]}`, with six nodes and six edges recorded and the one effect edge `"effect: -> signal:count"`. `holdsEpoch: false` is the honest half: the 2026-10-12 probe recorded no epoch, so this record cannot state one
- ✅ whether a node of kind `afterRenderEffectPhase` exists, and whether any node carries a phase field — `phase.verdict` `"declared-not-observed"`, `phase.nodesRead` **115**, `phase.nodesWithPhaseField` **0**, `phase.afterRenderEffectPhaseNodes` **0**, over the fixture pages and the portal route sweep
- ✅ every recorded claim is re-derived by a test from the installed package and the recording rather than transcribed — the suite's `held-out:` block (11 cases at this head) mutates the record one anchor at a time and reddens, naming the defect: an added enum value upstream, a recording that claims an effect event, a dropped profiler value, a moved agent citation, a labelled fixture effect, a renamed signal, changed probe evidence, an epoch the probe cannot hold, a claimed observed phase node, a moved phase verdict, a relabelled digest entry, a fabricated capture, a stripped provenance, a dropped portal attempt, a smuggled write claim, an edge said to carry a write
- ✅ the record carries no write, no owner and no cause, and the page gained no instrumentation — the suite's "the record carries no write, no owner and no cause" passes, and `doesNotSettle` names what the record refuses to settle (which phase an effect ran in; whether an `afterRenderEffectPhase` node exists anywhere the run could reach; whether a value was written by an effect)
- ✅ nothing was driven on every run and nothing was written by this run — "this suite drives no browser and writes nothing" and "this run wrote nothing: the recording is unchanged after the run" both pass; `research/raw/m039-render-phase.json` is byte-unchanged at 38,792 bytes after this review's re-run

Residual, recorded rather than glossed: the browser half of AC2 and AC3 is T001's provenance, not this
review's. The negative NG0100 record and the portal's `Resource.loadEffect` label are re-read from the
recording, and the suite proves the recording still matches the installed packages and the probe
recording — but no page was opened for this artifact, and the review does not claim one was.

## Intent coverage

### SC3 — A captured NG0100 message produces its own change-detection finding carrying the code and the message the page emitted, and is never joined to an effect, and never presented as evidence that an effect ran during rendering.: pass

- ✅ the change-detection half of this criterion rests on a capture that **does not exist**, and the record says so instead of filling the gap — `changeDetection.result` `"negative"` with an empty `messages` array, and the only message-shaped artefact is `extension/error-digest.json`'s single `NG0100` entry marked `notACapture: true`
- ✅ the substitute is never presented as evidence that an effect ran during rendering — `substitute.reading` states "no message was captured … a digest entry, never a capture", and the suite reddens if the marker is dropped ("a digest entry relabelled as a capture reddens") or a write is smuggled in ("a write claim smuggled into the record reddens")
- ✅ what T001 owes the criterion is a measured substitute with provenance, and it is measured: the two attempts' route counts, click counts, instance and build are in `changeDetection` and in `.project/research/m039-render-phase.md:143-176`
