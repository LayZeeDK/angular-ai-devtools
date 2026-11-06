# Archive — 033-lint-router

Milestone: lint-router
Shipped: 2026-11-06
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 4 done / 4 total  Review cycles used: 1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a navigation failure the page console reports produces a finding naming the unmatched URL segment and stating that none of the configured routes matches it, recording the code the message stated even when the digest does not carry that code. | met | extension/router-diagnostic.js`, `scripts/router-diagnostic.test.mjs`, `research/raw/m033-router-diagnostic.json`. |
| The finding is produced from observables the agent already collects — the `Router` configuration through `ng.getInjector` and dev-mode console messages — with no new page-side instrumentation and no build-log scraping. | met | research/raw/m033-router-diagnostic.json`, `extension/router-diagnostic.js:1-40`. |
| A finding that cannot be attributed to exactly one configured route reports "cannot tell" with the reason, rather than picking the nearest route or naming a guard verdict the configuration does not record. | met | scripts/router-diagnostic.test.mjs`, `extension/router-diagnostic.js`. |
| The panel renders the unmatched segment, the code the message stated and how many configured routes were considered, from a short fact list, and shows the "cannot tell" state: it names no route as the owner and no remedy, because the message states neither. | met | apps/angular-ai-devtools/src/app/panel-router.ts`, `scripts/panel-router.test.mjs`, `scripts/panel-routes.test.mjs`. |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl`, `scripts/after-render-fixture.test.mjs:127`. |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- tasks/T001-measure-what-the-router-says.md
- tasks/T002-join-a-diagnostic-to-one-route.md
- tasks/T003-panel-surface.md
- tasks/T004-re-record-what-the-change-stales.md

## Notes

- none
