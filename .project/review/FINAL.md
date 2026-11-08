# Final Review — M038 linked-state-reset

Milestone: M038 linked-state-reset (archive slug 038-linked-state-reset)

Reviewed HEAD: 65c7f03ac04b953427b0ed1462395b8a89e3d59a
Overall verdict: pass
Met: SC1, SC2, SC3, SC4, SC5, SC6

The milestone the intent was corrected to is real and works: a linked signal is identified by its
node kind, the join names the signal, the source it follows and both stored values, and the pane
renders what the join handed it. The one criterion that was not met at the previous reviewed head,
SC6, is met here: the check-chain pin was re-cut to the chain `npm run check` actually runs (P002,
T005) and the four skill tests that the pin's failure had masked were repaired by copying the module
their own copy imports (P003, T006). No product module changed to reach this verdict — the diff from
9f8deed to this head is the two patch tasks' files and `.project` bookkeeping only — and no check was
relaxed, skipped or narrowed.

## Success criteria

### SC1 — On the fixture, a linked signal whose value agrees with its source produces a finding naming the signal and the source it follows, and saying the value currently matches.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/linked-state.test.mjs"` at this head (11 tests, 11 pass, 0 fail), and the join driven over the recording's own graph: `join({ graph: recording.graph, signal: "agreeing" })`
- **Observed**: answers `{"state":"finding","signal":"agreeing","source":"source","value":7,"sourceValue":7,"reason":"matching"}` — the signal and the source it follows named from their own labels, and the agreement stated as `matching`. Held-out E1 (a record with no linked signal yields no finding) and E2 (a signal whose source is unreadable yields cannot-tell) are pinned in the suite and redden under mutants M3, M4, M9 and M10
- **Reference**: `extension/linked-state.js:253` (the single comparison), `.project/intent/INTENT.md` measured state in `research/raw/m038-linked-state.json` (`subjects.agreeing`)
- **Finding**: none
- **Fix direction**: none

### SC2 — A linked signal whose value differs from its source is reported as differing, and the two values are shown.

- **Verdict**: met
- **Check**: the same suite at this head (11 tests, 11 pass, 0 fail), plus `join({ graph: recording.graph, signal: "differing" })` over the recorded graph
- **Observed**: answers `{"state":"finding","signal":"differing","source":"source","value":8,"sourceValue":7,"reason":"differing"}` — both stored values shown and the state its own word. Held-out E3 (equal and unequal values are never merged into one state) is pinned and reddens under M7 and M8, which flatten the differing agreement into the matching one and replace the value with the source value
- **Reference**: `extension/linked-state.js:253`, `research/raw/m038-linked-state.json` (`subjects.differing`)
- **Finding**: none
- **Fix direction**: none

### SC3 — Both are produced from what the page already exposes through the signal graph, with no new page-side instrumentation, no build-output and no dev-server dependency.

- **Verdict**: met
- **Check**: `node --experimental-strip-types --test "scripts/linked-state-capture.test.mjs" "scripts/after-render-fixture.test.mjs" "scripts/router-config-capture.test.mjs" "scripts/router-diagnostic-capture.test.mjs"` at this head — 41 tests, 41 pass, 0 fail; the recording hashed the same before and after, so the run wrote nothing
- **Observed**: the capture reads the graph through the page's own hook, `ng.ɵgetSignalGraph(ng.getInjector(...))` (`scripts/linked-state-capture.test.mjs:677`), and the join consumes only `index`, `kind`, `label` and `value` of a node and the two ends of an edge — it carries no import, no DOM, no clock, no build log and no dev-server read. Held-out E7 (a fact carrying a field the join does not read changes nothing it reports) is pinned by M14 and M15
- **Reference**: `extension/linked-state.js:221`, `spikes/ng222-app/src/app/linked-state-page.ts:32`
- **Finding**: none
- **Fix direction**: none

### SC4 — Where the record cannot say whether a value came from a write or a recomputation, it reports cannot tell with that reason, and names no write, owner or cause.

- **Verdict**: met
- **Check**: the AC3 and AC4 blocks of `scripts/linked-state.test.mjs` at this head (11 tests, 11 pass, 0 fail), plus every absence driven through the join by hand: a missing subject and a graph with no linked signal
- **Observed**: the four absences answer `state: "cannot-tell"` with their own reason and nothing else — `signal-unreadable` and `no-linked-signal` returned no signal, no source and no value. Held-out E4 (no rendered string names a write, an owner or a cause) is pinned and reddens under M11, M12 and M13, which add a note, a seventh field and a cause to an answer
- **Reference**: `extension/linked-state.js:249`, `scripts/linked-state.test.mjs` (AC4 block)
- **Finding**: none
- **Fix direction**: none

### SC5 — The panel renders the signal, the source, the two values and the agreement, and renders nothing it was not given.

- **Verdict**: met
- **Surface**: panel
- **Check**: walked the panel surface at this head — the demo loader key `linked-state` (`apps/angular-ai-devtools/src/app/panel-demo.ts:30`) hands the join's fact to the pane's default export, and each state was rendered in turn: the recorded agreeing subject, the recorded differing subject, an unreadable subject, a graph with no linked signal, an empty fact list, and one state the pane was not written for
- **Observed**: `matching` printed `signal: agreeing`, `source: source`, `value: 7`, `sourceValue: 7`, `reason: matching`; `differing` printed `value: 8` beside `sourceValue: 7` and `reason: differing`; `cannot-tell` printed `reason: signal-unreadable` with no signal, source or value line; an empty fact list printed `idle: no linked-state fact has arrived yet`; the state `recomputed` printed `state: recomputed` and borrowed no field. Held-out E5 (each state renders its own text and nothing else) is pinned in `scripts/panel-linked-state.test.mjs`, which passes 34 of 34 together with the route and router-diagnostic suites at this head, and the pane reads the join's `reason` word rather than re-deriving the agreement from the two values
- **Reference**: `apps/angular-ai-devtools/src/app/panel-linked-state.ts:333`
- **Finding**: none
- **Fix direction**: none

### SC6 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` at this head — every stage exits 0, including `check:panel`, `check:extension`, `check:companion`, `gate:verification` and `format:check` — and `npm test` at this head: primary 908 tests / 908 pass / 0 fail, user-scope 60 / 60 / 0, skills 628 / 628 / 0, app 342 passed, held-out corpus 22 suites / 85 tests / 0 failed; `node --test scripts/panel-typecheck-scope.test.mjs` is 7 of 7
- **Observed**: both commands are green at this head with nothing skipped and no stage removed. The stage that had failed — the chain pin at `scripts/panel-typecheck-scope.test.mjs:351` — now names `npm run gate:verification` in position between `check:companion` and `format:check`, and the four skill tests that stopped the run once the pin was re-cut (628 tests, 624 pass, 4 fail with `ERR_MODULE_NOT_FOUND` naming `scripts/text.mjs`) pass 628 of 628 after each copies `text.mjs` beside `fingerprint.mjs`. Both repairs were proven against their own base: the pin's suite failed 1 of 7 at 75a62bc and the four skill tests failed 4 of 4 at 414a199, under `gsd verify-probe`
- **Reference**: `package.json` (`scripts.check`), `scripts/panel-typecheck-scope.test.mjs:113`, `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs:47`, `.project/tasks/T005-re-cut-the-check-chain-pin.md`, `.project/tasks/T006-copy-the-escaper-beside-every-fingerprint-copy.md`, `.project/build/verify-ledger.jsonl`
- **Finding**: none
- **Fix direction**: none

## Verified findings by wave

- Wave 1 (T001, `wave-1.cycle1.md`): a linked signal carries its field name as its label and is identified only by the node kind `linkedSignal` — `research/raw/m038-linked-state.json` (`labels.labelIsTheFieldName`, `labels.labelIdentifiesALinkedSignal`), with the label traced to `label: consumer.debugName` in the installed runtime. The source is reachable only as the producer both linked signals share (node index 2, kind `signal`, label `source`, value 7) because the template never reads it — `spikes/ng222-app/src/app/linked-state-page.ts:38`. The differing state is authored by one write, `this.differing.set(this.source() + 1)` — `linked-state-page.ts:42`. The capture is armed by `M038_CAPTURE` and two unarmed runs leave the recording byte-identical (sha256 `b7bd843a…`), which the re-run at this head confirmed.
- Wave 2 (T002, `wave-2.cycle1.md`): one comparison, `value === source.value` at `extension/linked-state.js:253`, separates `matching` from `differing`; a refusal names its reason at `extension/linked-state.js:249`. The suite proves 15 mutants non-vacuous, including M11 to M13 (a note, a seventh field, a cause) and M14 to M15 (extra fields on the fact and on a node).
- Wave 3 (T003, `wave-3.cycle1.md`): the pane reads the join's `reason` word and never re-derives the agreement — `apps/angular-ai-devtools/src/app/panel-linked-state.ts:214`; a state it was not written for is rendered under its own name at `panel-linked-state.ts:253`; `cannot-tell` carries its reason and no finding field at `panel-linked-state.ts:238`. M1 to M5 redden the no-claim, reads-reason, given-state and cannot-tell pins.
- Wave 4 (T004, `wave-4.cycle1.md`): the gate passed at the wave's own reviewed head, c09b299, where the check chain did not yet carry the verification gate stage. At the reviewed head 9f8deed the chain pin still named the older list, which is the SC6 finding P002 the patch wave repaired.
- Wave 5 (T005, T006, `wave-5.cycle1.md`): the pin was re-cut to the chain `check` runs, and the four skill tests each copy the module their own `fingerprint.mjs` imports. T005's suite is 7 of 7 at 414a199 and 1 of 7 red at its base; T006's four tests are 4 of 4 at 65c7f03 and 4 of 4 red at their base. Neither task changed an assertion, skipped a test or touched `package.json`.

## Remediation sequence actually followed

1. The ledger recorded three failed project-verify runs at aa86b57f, 8341fa71 and ea9ad162; those runs are what identified the check-chain pin as stale. They were committed as bookkeeping (`state: record the project-verify runs the gate chain produced`).
2. `gsd review-emit` was tried first for waves 1 to 3; it emitted a `TODO` evidence line for T001 because the ledger stores T001's command unquoted while the task quotes its globs, so its output would have been a placeholder. The three wave artifacts were therefore written from the ledger entries and re-runs at this head instead, and wave 4 was left as the build recorded it at its own head.
3. Each wave suite was re-run at this head: 41 pass for T001's four suites, 11 pass for the join, 34 pass across the pane, route and router-diagnostic suites.
4. The panel surface was walked from the recorded graph through the join to the pane, state by state, which is the evidence SC5 cites.
5. At the first reviewed head the project Verify was red; the review recorded it as `.project/review/PATCH-FINDINGS.md` (P001 to P003) rather than repairing it, which is what routed the pipeline into plan patch.
6. The patch wave landed T005 (the chain pin) and T006 (the four skill tests), each proven red at its own base and green at its landing commit. Both repairs are test-side: the diff from the previous reviewed head to this one contains no change under `extension/`, `apps/` or `src/`.
7. `npm run check` and `npm test` were then run at this head and are green stage by stage; `npm run gate:verification:ship` passes.
8. No product file was edited, no test was skipped, and no assertion was relaxed to reach this verdict.

## Deferred advisories

- The chain-pin repair P002 landed as T005 and the four skill-test repairs of P003 landed as T006. Neither needed an owner ruling: the gate stage stays in `check` and the pin follows it, because removing the stage to satisfy its own pin would be the narrowed check N6 forbids.
- Two uncommitted product changes were already in the worktree when this review began — a new "Verification target: the Insurance Portal first" section in `AGENTS.md` and a rebuilt `extension/panel/index.html`. Neither belongs to any M038 task, neither is in this milestone's declared files, and both are unformatted, so they fail `format:check` in the primary checkout. They were parked so the project Verify could run on the reviewed tree and restored afterwards; they still need an owner decision, and they are the reason `prepare-final` refuses a dirty primary.
- The `gsd report` warning list carries historic branches (`backup/m038-*`, `task/T001-*`, `gsd-path/M035` to `M037`) that the ship phase does not delete; `gsd cleanup` does.

## Provenance of the review set

Wave 4 was written by the build at c09b299 and records the gate passing there. Waves 1 to 3 were
written at the previous reviewed head from the verify ledger entries that prove each task's Verify
(fdcbc3f8 for T001 and T002, 8cb05446 for T003) together with the re-runs listed above; every
criterion cites a command, its output and a file reference that this review checked at the reviewed
head. Wave 5 was written at this head from the two landing commits and the verify probes of their
bases. The review is not independent of the build: no criterion rests on the wave artifacts alone.
