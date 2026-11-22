# Archive — 059-teardown-leak

Milestone: teardown-leak
Shipped: 2026-11-22
Final verdict: all criteria met; project verify passed
Waves: 14  Tasks: 14 done / 14 total  Review cycles used: 2/1/1/1/1/1/1/1/1/1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A component that touches its injector after teardown produces a finding naming the code `NG0205` and the message body the record carries, and naming the owning component only where the record attributes one — where it does not, the answer reports the named absence `owner-not-in-the-message` beside the code instead of guessing the element or the component (`.project/ROADMAP.md:2096`, `extension/error-digest.json` `NG0205`); a mutant that suppresses the code match, and a mutant that attributes the message to the most recent component, redden. | met | .project/review/wave-3.cycle1.md` and `scripts/teardown-leak.test.mjs |
| The answer is produced from the observables the agent already holds — the console record it subscribes to, and the element/component record it already keeps — with no new page-side instrumentation, no second tap and nothing the record does not carry (`.project/ROADMAP.md:2099`); a mutant that starts its own subscription, hooks `setTimeout` or reads a live page value reddens. | met | .project/review/wave-2.cycle1.md` and `extension/teardown-leak.js |
| An unsubscribe that ran before the write it was meant to prevent reports no leak rather than a wrong cause (`.project/ROADMAP.md:2102`): where the record shows the handle was released and the diagnostic still arrives, the answer names the sequence it read and the code, and names no handle as the cause; a mutant that renders "leaked subscription" for a released handle reddens. | met | .project/review/wave-2.cycle1.md` and `scripts/teardown-leak.test.mjs |
| The answer never names a subscription, effect or timer identity: it names the code, the message body, and the absence `handle-record-not-held` — a mutant that renders any handle name, or that infers one from the message body, reddens (C1, C2). | met | .project/review/wave-7.cycle1.md` and `extension/teardown-leak.js |
| The panel grows by exactly one surface, one ordered path, one `LOADERS` key and its digest rows, and every suite that enumerates those tables is updated in the same task: `app.spec.ts`, `page-picker.component.spec.ts`, `scripts/panel-routes.test.mjs`, `scripts/after-render-fixture.test.mjs`, `scripts/panel-copy.test.mjs` and `research/raw/m059-surface.json` (`.project/ROADMAP.md:2097`); a mutant that adds the route without a loader key reddens naming the surface. | met | .project/review/wave-4.cycle1.md` and `scripts/panel-routes.test.mjs |
| The answer is read on the panel only, and the panel asks nothing of the inspected page: no DOM added to the page, no page-side control, no input and no widget (AR-6, `.project/ROADMAP.md:2101`); a mutant that installs a page-side hook for this answer reddens. | met | .project/review/wave-1.cycle2.md` and `apps/angular-ai-devtools/src/app/panel-teardown-leak.ts |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-T005.log
- build/verify-T006.log
- build/verify-T007.log
- build/verify-T008.log
- build/verify-T009.log
- build/verify-T010.log
- build/verify-T011.log
- build/verify-T012.log
- build/verify-T013.log
- build/verify-T014.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/FINAL.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/final-gap-1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-1.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-1.cycle2.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-2.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-3.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-4.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-5.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-6.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-7.cycle1.md
- plan/build-recovery-232b9929f15209bd2eac8f776cafbf5707045e03/review/wave-8.cycle1.md
- plan/build-recovery-944115b2bcbb23970be4f921f71dc2f254264074/review/wave-1.cycle1.md
- plan/build-recovery-944115b2bcbb23970be4f921f71dc2f254264074/review/wave-2.cycle1.md
- plan/build-recovery-944115b2bcbb23970be4f921f71dc2f254264074/review/wave-3.cycle1.md
- plan/build-recovery-944115b2bcbb23970be4f921f71dc2f254264074/review/wave-4.cycle1.md
- plan/build-recovery-944115b2bcbb23970be4f921f71dc2f254264074/review/wave-5.cycle1.md
- plan/build-recovery-944115b2bcbb23970be4f921f71dc2f254264074/review/wave-6.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/FINAL.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/final-gap-1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-1.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-1.cycle2.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-10.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-11.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-12.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-2.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-3.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-4.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-5.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-6.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-7.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-8.cycle1.md
- plan/build-recovery-c4505ff091bc33c0c859b3ac2a3cf72f8b7d1c3c/review/wave-9.cycle1.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-1.cycle2.md
- review/wave-10.cycle1.md
- review/wave-11.cycle1.md
- review/wave-12.cycle1.md
- review/wave-13.cycle1.md
- review/wave-14.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- review/wave-8.cycle1.md
- review/wave-9.cycle1.md
- tasks/T001-measure-what-the-console-record-and-the-digest-state.md
- tasks/T002-answer-from-the-console-record-purely.md
- tasks/T003-render-the-answer-and-pin-every-route-table.md
- tasks/T004-re-derive-the-recordings-and-run-the-project-verify.md
- tasks/T005-re-derive-the-two-gate-records-and-the-census.md
- tasks/T006-repair-the-shape-suite-the-milestones-own-artefacts-moved.md
- tasks/T007-count-a-quotation-as-a-quotation-not-as-a-page-hit.md
- tasks/T008-re-derive-the-gate-records-the-last-landing-moved.md
- tasks/T009-stop-freezing-a-scope-count-as-a-measurement.md
- tasks/T010-give-m059-the-claims-map-the-census-reads.md
- tasks/T011-re-derive-the-gate-records-the-maps-landing-moved.md
- tasks/T012-give-the-build-output-count-the-same-floor-as-the-other-two.md
- tasks/T013-give-the-claims-record-the-quotes-and-ruling-the-census-derives.md
- tasks/T014-state-the-digest-byte-total-in-the-records-prose.md

## Notes

- none
