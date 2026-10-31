# Final Review — angular-ai-devtools

Reviewed HEAD: e240d4a5f53656507d7605d0b1f5bdf600f39cfa
Overall verdict: pass

## Success criteria

### SC1 — On the counter fixture's dev-only interop route, the panel identifies a `toSignal` source/state node and an unlabelled effect whose `debuggableFn` contains `subject.error`, and slices their direct producers/consumers.

- **Verdict**: met
- **Check**: read `src/main-world/interop-keep-list.ts` `isInteropNode`/`keepInteropNodes` and `apps/angular-ai-devtools/src/app/interop.service.ts` `processGraph` (wave-3 T002, T012); drove `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` against `http://localhost:4222/stale-view` on chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini and edge-dev-aion (T006-T009) and read each retained `interop.json`.
- **Observed**: every retained result records `nodes: 1` with the slice's source node and its direct producers/consumers; the fixture names its Subject `subject` and its effect's serialised source contains `subject.error` (T011), which is the token the keep-list's source rule matches (T002). The panel obtains the graph through the extension message path rather than the profiler cycles (T012), which is what made the slice non-empty.
- **Reference**: `.project/review/wave-3.cycle1.md`; `.project/plan/evidence/T006/interop.json`; `T007`, `T008`, `T009`; `src/main-world/interop-keep-list.ts`; `apps/angular-ai-devtools/src/app/interop.service.ts`; `spikes/ng222-app/src/app/stale-view-fixture.ts`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E2, E5 — `interop-slice.spec.ts` and the classifier spec pass (T004, T002).
- **Prohibition**: N2, N3 — the assertion reads the retained per-pair result, not a summary line, and the library cover never blocks the app node.

### SC2 — The panel states that it cannot name the feeding Observable, the operator chain, or emission timing.

- **Verdict**: met
- **Check**: read the rendered template in `apps/angular-ai-devtools/src/app/interop.component.ts` (T014) and the `limits` field of each of the four retained results.
- **Observed**: each slice renders `limit: Cannot name the feeding Observable, the operator chain, or emission timing.` as its own labelled block; all four retained results record the same sentence, and the model answer in each of the four names all three limits.
- **Reference**: `.project/review/wave-3.cycle1.md`; `apps/angular-ai-devtools/src/app/interop.component.ts`; `.project/plan/evidence/T006/interop.json`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: none
- **Prohibition**: N1 — the sentence never claims the Observable, the operator chain or emission timing.

### SC3 — Field-to-node attribution is worded "inferred, untested".

- **Verdict**: met
- **Check**: read the attribution branch in `interop.service.ts` and the rendered `interop-inferred` block (T004, T014); `interop-attribution.spec.ts` covers the case where two fields carry the same value and both are listed as candidates, never one as a match.
- **Observed**: every slice renders `attribution: inferred, untested`, and all four retained results record that exact wording.
- **Reference**: `.project/review/wave-3.cycle1.md`; `apps/angular-ai-devtools/src/app/interop-attribution.spec.ts`; `.project/plan/evidence/T009/interop.json`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E4 — attribution spec passes, including the same-value tie.
- **Prohibition**: none

### SC4 — The interop keep-list keeps `toSignal.*` nodes on top of the existing library-internal filter.

- **Verdict**: met
- **Check**: read `src/main-world/interop-keep-list.ts` and `src/main-world/value-field.ts` (T001, T002); ran the classifier spec, which asserts both directions of the rule (8/8).
- **Observed**: the label rule keeps `toSignal.source` and `toSignal.state`; the source rule keeps an effect only when its serialised text contains the whole token `subject.error`, and rejects `subject.errorHandler` and `xsubject.error`; the library-internal filter still applies first, and an app node is never dropped because a library node was filtered.
- **Reference**: `.project/review/wave-3.cycle1.md`; `src/main-world/interop-keep-list.ts`; `apps/angular-ai-devtools/src/app/interop-slice.spec.ts`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E5 — the classifier spec passes in both directions.
- **Prohibition**: N3 — the library cover never blocks an app node.

### SC5 — The panel explains the slice using the panel-local Prompt API, sending only a short fact list.

- **Verdict**: met
- **Check**: read `explain` in `interop.component.ts` and `shapeInteropFactList` in `interop.service.ts` (T004); each of the four retained results records a non-empty model answer.
- **Observed**: the fact list carries the node id, the source label, the producer/consumer ids, and the limit sentence; the answers arrived in 7167 ms (chrome-stable-nano), 8663 ms (chrome-beta-gemma4), 8694 ms (edge-phi4mini) and 2536 ms (edge-dev-aion).
- **Reference**: `.project/review/wave-3.cycle1.md`; `.project/plan/evidence/T006/interop.json`; `.project/plan/evidence/T009/interop.json`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: none
- **Prohibition**: N5 — the explanation comes from the panel-local Prompt API, with no page-side model call.

### SC6 — lars-verify verdict of verified for the interop claim, with end-to-end coverage across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

- **Verdict**: met
- **Check**: read `.project/plan/CLAIM.md` and the four retained per-pair results it cites (T010); `wave-4.cycle1.md` re-read all four panel records.
- **Observed**: all four pairs record `nodes: 1`, the limit sentence, the `inferred, untested` wording and a non-empty answer, under extension id `mgkfgkdgobahfcgkdlokpoehblpbkfok` on Angular 22.2.2; the claim record states the rule that a partial run is not verified.
- **Reference**: `.project/review/wave-4.cycle1.md`; `.project/plan/CLAIM.md`; `.project/plan/evidence/T006/interop.json`; `T007`; `T008`; `T009`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: none
- **Prohibition**: N2 — one retained result is cited per pair.

## Wave findings

- T008's task Log records its readings as missing. That line was written by an orchestrator helper that read the wrong JSON key; the retained evidence and `wave-3.cycle1.md` carry the true readings (edge-phi4mini, Angular 22.2.2, nodes=1, limits stated, attribution stated, 8694 ms). The landed body is left untouched so the landing proof holds.
- Wave 2 noted that the panel renders the attribution wording but not the candidate list; `interop-attribution.spec.ts` covers the candidates in the service, and SC3 is about wording. No criterion is affected.
- T016 split the node:test suites from the Angular unit-test pattern: the project Verify was red at 42de761 because the unit-test builder compiled them (TS2591), and T016 renamed both to `*.node.test.ts`, pinned the builder to `**/*.spec.ts` and excluded them from the test compilation unit. Gap 1 re-ran the project Verify at the shipped head and it exits 0.
