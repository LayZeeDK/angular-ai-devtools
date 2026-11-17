# Archive — 046-copy-to-agent

Milestone: copy-to-agent
Shipped: 2026-11-17
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 7 done / 7 total  Review cycles used: 1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The hand-off quotes the rendered finding: the text the pane drew is the text sent, and a mutant that re-derives the text from the record reddens the pin. | met | scripts/copy-to-agent.test.mjs |
| A finding carrying a named absence is handed over with that absence, not with an empty or completed finding. | met | apps/angular-ai-devtools/src/app/panel-copy-to-agent.ts |
| A subject whose finding cannot be expressed as a question reports `cannot-tell` with the reason, rather than naming a wrong cause, element or remedy. | met | extension/copy-to-agent.js |
| Every documentation claim this milestone's inspection ruled `fix-doc` is corrected at the artefact it cites, and the correction is proven by the pin that reads that artefact, not by the edit alone. | met | scripts/docs-correction.test.mjs |

## Contents

- build/evidence.json
- build/verify-T007.log
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/inspect-inventory.txt
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-what-the-panel-renders-and-what-a-copy-path-composes.md
- tasks/T002-remove-the-claude-mirror-and-the-rule-that-maintained-it.md
- tasks/T003-build-the-hand-off-from-the-pane-text-and-a-control-that-names-what-it-sends.md
- tasks/T004-render-the-three-hand-over-states-and-pin-the-routes-they-add.md
- tasks/T005-give-cannot-tell-a-closed-reason-set-and-prove-an-invented-cause-reddens.md
- tasks/T006-correct-the-citations-the-inspection-measured-and-retire-the-moved-path-claims.md
- tasks/T007-record-the-surface-and-run-the-project-verify.md

## Notes

- none
