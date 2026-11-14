# Archive — 044-gate-integrity

Milestone: gate-integrity
Shipped: 2026-11-14
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 5 done / 5 total  Review cycles used: 1/1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A committed test that resolves a `.project/` path the milestone's own archive move deletes fails the ship gate, naming the file and the path; a milestone whose tests reference no such path passes the same check. | met | scripts/gate-integrity.mjs:974` (the check), `scripts/gate-integrity.test.mjs` AC1/AC6, `research/raw/m044-gate-shapes.json:archiveReferences`. |
| A task log claiming a file change absent from the milestone's range fails the ship gate, naming the task and the file. | met | scripts/gate-integrity.mjs:1303` (the check), `research/raw/m044-gate-shapes.json:fixRecord`. |
| The archive-path and fix-record checks run inside the gate rather than as advisory output, so neither defect can reach `ship/done` while the check is red. | met | package.json:24-25`, `scripts/panel-typecheck-scope.test.mjs:113-135` and its red half. |
| A navigation terminal for an already-ended navigation id produces a finding naming the skipped navigation, proven by a pin fed from `research/raw/m041-navigation.json` rather than from a hand-built event list. | met | extension/navigation-narrator.js:482`, `scripts/navigation-blocking.test.mjs:2177`. |
| Each check reddens a synthetic regression that reproduces its measured instance, and the failure names the file and the claim — proven by removing the synthetic regression and observing the check green again. | met | scripts/gate-integrity.mjs:112` (`MUTANTS`), `scripts/gate-integrity.test.mjs` AC4 tests. |
| No existing assertion is weakened to make a check pass: the change to the shipped suites is limited to replacing the one probe-shaped navigation pin with one fed from the recording. | met | research/raw/m044-gate-shapes.json:suiteDiff`, `research/raw/m044-verdict-claims.json`. |

## Contents

- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-the-three-gate-shapes-and-publish-one-record.md
- tasks/T002-build-the-archive-path-and-fix-record-checks.md
- tasks/T003-wire-the-checks-into-the-gate-and-repair-the-ended-navigation-terminal.md
- tasks/T004-record-the-checks-behaviour-rule-the-claims-and-run-the-project-verify.md
- tasks/T005-give-the-panel-s-navigation-fact-the-skipped-answer-the-join-now-returns.md

## Notes

- none
