# Archive — 039-render-phase-effect

Milestone: render-phase-effect
Shipped: 2026-11-08
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 5 done / 5 total  Review cycles used: 1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, an effect the signal graph carries produces a finding naming that effect — by its graph label when the graph supplies one, and otherwise by the edge the graph records for it — together with the signals the graph's edges say it reads, and naming nothing the graph does not carry. | met | extension/render-phase.js:207`, `:217`, `:247`, `:265`, `:328`; `research/raw/m039-render-phase.json` (`profiler`, `effect.fromRecording`); `scripts/render-phase.test.mjs:1100` (AC1 block). Held-out E2 and E3 and prohibition N1 are ruled in that same suite: E2 at `:397` (an unlabelled effect is named by the recorded edge and no name is invented), E3 at `:460` (an effect whose edges name no producer is still a finding, with an empty read), N1 at `:331` (no string names a write, an owner or a cause) |
| The phase an effect ran in is reported as cannot-tell with a named absence, because the page records no effect event: no finding carries a phase for an effect, and no rendered string names rendering or after-render as the phase an effect ran in. | met | extension/render-phase.js:293`, `:300`; `apps/angular-ai-devtools/src/app/panel-render-phase.ts:249`, `:363`; `research/raw/m039-render-phase.json` (`profiler.effectEvent`, `phase.verdict`). Held-out E4 and E8 and prohibition N2 are ruled beside them: E4 at `scripts/render-phase.test.mjs:528` (no finding carries a phase and no output names rendering or after-render as one), E8 at `:1515` (the same graph read twice is byte-identical), N2 at `scripts/panel-render-phase.test.mjs:538` (no rendered string names a phase other than the cannot-tell the answer carried) |
| A captured NG0100 message produces its own change-detection finding carrying the code and the message the page emitted, and is never joined to an effect, and never presented as evidence that an effect ran during rendering. | met | extension/render-phase.js:276`, `:336`; `apps/angular-ai-devtools/src/app/panel-render-phase.ts:265`; `apps/angular-ai-devtools/src/app/panel-demo.ts:194`; `research/raw/m039-render-phase.json` (`changeDetection.result`, `changeDetection.substitute`). Held-out E5 and E6 and prohibitions N3 and N4 are ruled in the same suite: E5 at `scripts/render-phase.test.mjs:575` (a message and the effect it arrived with stay two findings, never one), E6 at `:640` (a message that names no effect produces a change-detection finding naming no effect), N3 and N4 at `:304` and `:599` (no finding carries a cause or an effect field borrowed from the message, so the message is never evidence that an effect ran during rendering) |
| Where the graph carries no effect node, or cannot be read at all, the module reports cannot-tell naming which of the two it was, rather than reporting that the page has no effects. | met | extension/render-phase.js:101`, `:287`, `:311`, `:318`, `:322`; `scripts/render-phase.test.mjs:1409` (AC4 block). Held-out E1 and prohibition N5 are ruled there: E1's first half at `:690` (a readable graph with no effect node yields the absence state naming the missing node) and second half at `:748` (an unread graph is never reported as an empty one), and N5 is the same pair's assertion at `:713` that the answer never says the page has no effects |
| The panel renders the effect, the signals it reads, the phase state and the change-detection finding as separate things, and renders nothing it was not given. | met | apps/angular-ai-devtools/src/app/panel-render-phase.ts:221`, `:249`, `:265`, `:302`, `:400`, `:427`; `apps/angular-ai-devtools/src/app/app.routes.ts:129`; `apps/angular-ai-devtools/src/app/panel-demo.ts:49`, `:181`. Held-out E7 and prohibition N6 are ruled in the pane's own suite: E7 at `scripts/panel-render-phase.test.mjs:652` (the pane keeps the four things apart, each block rendering its own text and no other's at `:749`), N6 at `:835` (nothing rendered names a write, an owner, a cause or a code the answer lacked) |
| `npm run check` and `npm test` pass at the head. | met | scripts/panel-styles.test.mjs:594` (the absent-build branch that prints and returns), `:613` (the byte floor), `:617` (the computed readings); `scripts/panel-bundle-budget.test.mjs:441`; `tests/held-out/e3-zero-skipped.test.mjs:42`; `.gitignore:33`; `.project/build/verify-ledger.jsonl` (the `79bbdc2` project-Verify entry, `result: pass`); `.project/review/final-gap-1.md`; `.project/review/PATCH-FINDINGS.md` (P001 and P002, both resolved). Prohibition N7 is held by construction, not by promise: `tests/held-out/e3-zero-skipped.test.mjs` is unmodified and its `deepStrictEqual(bad, [])` at `:42` still reads `skipped 0`, no built artefact was forced into git, no `npm test` exception exists, and `BUILT_BYTE_FLOOR` is still a 1,024-byte floor rather than an exact size |

## Contents

- build/in-flight.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- research/m039-render-phase.md
- review/FINAL.md
- review/PATCH-FINDINGS.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-the-profiler-events-and-edges.md
- tasks/T002-join-an-effect-to-the-signals-its-edges-name.md
- tasks/T003-panel-surface-for-the-render-phase-findings.md
- tasks/T004-re-capture-behind-an-opt-in-switch.md
- tasks/T005-give-the-panel-a-baseline-stylesheet.md

## Notes

- none
