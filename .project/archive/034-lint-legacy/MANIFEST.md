# Archive — 034-lint-legacy

Milestone: lint-legacy
Shipped: 2026-11-06
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 4 done / 4 total  Review cycles used: 1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a component the page shows as NgModule-declared produces a finding naming the component and stating that it is NgModule-declared, carrying the modern form and its source only from the cited equivalents table. | met | extension/legacy-structure.js:109-133,148-166`; `research/raw/m034-equivalents.json:24-33`; `research/raw/m034-legacy-diagnostic.json:23-29`; `scripts/legacy-structure.test.mjs:338-389,590-616`. |
| The finding is produced from observables the agent already collects - the component's `ɵcmp.standalone` read through the `ng` hooks - with no new page-side instrumentation, no build-log scraping and no dev-server dependency. | met | extension/legacy-structure.js:17-30,57-58,88-94,148-166,168-183`; `scripts/legacy-structure.test.mjs:264-315,373-388,462-477,483-515`; `scripts/legacy-equivalents-capture.test.mjs:519-540`. |
| A diagnostic whose code the digest does not carry, or which names no construct, reports "cannot tell" with the reason, rather than naming a modern equivalent it cannot source. | met | extension/legacy-structure.js:63-68,153-163`; `scripts/legacy-structure.test.mjs:394-575,590-616`; `scripts/legacy-equivalents-capture.test.mjs:544-619`; `research/raw/m034-legacy-diagnostic.json:128-146`. |
| The panel renders the construct, the code and the modern equivalent from a short fact list, and shows the "cannot tell" state, inventing neither a construct nor an equivalent. | met | apps/angular-ai-devtools/src/app/panel-legacy.ts:55,159-203,258-270`; `apps/angular-ai-devtools/src/app/panel-demo.ts:27,81-92`; `research/raw/m034-equivalents.json:24-33`; `scripts/panel-legacy.test.mjs:283-409,411-487`. |
| `npm run check` and `npm test` pass at the head. | met | .project/build/verify-ledger.jsonl:1`; `plans/angular-ai-devtools-program-backlog.md:28`; `scripts/overlay-verdict-claims.test.mjs:78,109`; `git show 578cc51 --stat`; `git diff -w 578cc51..HEAD -- plans/angular-ai-devtools-program-backlog.md`; `.project/review/final-gap-1.md:3,16`. |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- tasks/T001-measure-what-the-page-says.md
- tasks/T002-join-a-legacy-diagnostic.md
- tasks/T003-panel-surface-for-the-legacy-finding.md
- tasks/T004-re-record-everything-the-fixture-change-stales.md

## Notes

- none
