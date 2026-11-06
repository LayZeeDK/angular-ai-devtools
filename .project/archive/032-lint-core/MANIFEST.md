# Archive — 032-lint-core

Milestone: lint-core
Shipped: 2026-11-06
Final verdict: all criteria met; project verify passed
Waves: 3  Tasks: 5 done / 5 total  Review cycles used: 1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a construct the tool can observe produces a finding naming that construct and the diagnostic code when the digest carries one, and nothing the message does not state: the message names no element and no component, so the finding names neither. | met | scripts/lint-core.test.mjs`, `research/raw/m032-lint-observability.json`, `.project/tasks/T002-join-a-diagnostic-to-its-construct.md |
| The finding is produced from observables the agent already collects — dev-mode console messages, `window.ng` reads and the app facts — with no new page-side instrumentation and no build-log scraping. | met | extension/lint-core.js`, `research/raw/m032-lint-observability.json |
| A diagnostic the tool cannot observe from the page reports "cannot tell", with the reason, rather than an invented cause or a construct guessed from proximity. | met | extension/lint-core.js`, `scripts/lint-core.test.mjs |
| The panel renders the construct, the code and its explanation from a short fact list, and shows the "cannot tell" state. | met | apps/angular-ai-devtools/src/app/panel-lint.ts`, `scripts/panel-lint.test.mjs`, `.project/tasks/T003-panel-surface.md |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl`, `.project/review/final-gap-1.md |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- tasks/T001-measure-what-reaches-the-console.md
- tasks/T002-join-a-diagnostic-to-its-construct.md
- tasks/T003-panel-surface.md
- tasks/T004-re-record-what-the-page-stales.md
- tasks/T005-register-the-lint-surface.md

## Notes

- none
