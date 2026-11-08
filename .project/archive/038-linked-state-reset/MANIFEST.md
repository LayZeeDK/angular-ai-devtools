# Archive — 038-linked-state-reset

Milestone: linked-state-reset
Shipped: 2026-11-08
Final verdict: all criteria met; project verify passed
Waves: 5  Tasks: 6 done / 6 total  Review cycles used: 1/1/1/1/1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| On the fixture, a linked signal whose value agrees with its source produces a finding naming the signal and the source it follows, and saying the value currently matches. | met | extension/linked-state.js:253` (the single comparison), `.project/intent/INTENT.md` measured state in `research/raw/m038-linked-state.json` (`subjects.agreeing`) |
| A linked signal whose value differs from its source is reported as differing, and the two values are shown. | met | extension/linked-state.js:253`, `research/raw/m038-linked-state.json` (`subjects.differing`) |
| Both are produced from what the page already exposes through the signal graph, with no new page-side instrumentation, no build-output and no dev-server dependency. | met | extension/linked-state.js:221`, `spikes/ng222-app/src/app/linked-state-page.ts:32 |
| Where the record cannot say whether a value came from a write or a recomputation, it reports cannot tell with that reason, and names no write, owner or cause. | met | extension/linked-state.js:249`, `scripts/linked-state.test.mjs` (AC4 block) |
| The panel renders the signal, the source, the two values and the agreement, and renders nothing it was not given. | met | apps/angular-ai-devtools/src/app/panel-linked-state.ts:333 |
| `npm run check` and `npm test` pass at the head. | met | package.json` (`scripts.check`), `scripts/panel-typecheck-scope.test.mjs:113`, `.commandcode/skills/control-angular-dev-app/scripts/fingerprint.test.mjs:47`, `.project/tasks/T005-re-cut-the-check-chain-pin.md`, `.project/tasks/T006-copy-the-escaper-beside-every-fingerprint-copy.md`, `.project/build/verify-ledger.jsonl |

## Contents

- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/INSPECT-DELTA.md
- research/SYNTHESIS.md
- review/FINAL.md
- review/PATCH-FINDINGS.md
- review/VERIFICATION.json
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- tasks/T001-measure-the-linked-signal-label.md
- tasks/T002-join-a-linked-value-to-its-source.md
- tasks/T003-panel-surface-for-the-linked-state-finding.md
- tasks/T004-re-record-what-the-fixture-change-stales.md
- tasks/T005-re-cut-the-check-chain-pin.md
- tasks/T006-copy-the-escaper-beside-every-fingerprint-copy.md

## Notes

- none
