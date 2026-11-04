# Archive — 027-image-warning-capture

Milestone: image-warning-capture
Shipped: 2026-11-04
Final verdict: all criteria met; project verify passed
Waves: 1  Tasks: 2 done / 2 total  Review cycles used: 1
Carried forward: 46 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A browser instance loads `/image-budget` on the fixture in development mode, and the console output is committed as evidence naming the profile, the instance and the time of capture. | met | research/raw/m027-image-warning-capture.json`; T001 `2d79317 |
| The captured message is recorded with its text and, if it carries one, its code; a message carrying no `NG` code is recorded as carrying none rather than mapped onto one. | met | research/raw/m027-image-warning-capture.json`; `.project/research/evidence-capture-correction.md |
| The warning sample records `source` as captured, replacing the transcribed provenance, and the COM-1 suite still passes. | met | spikes/ng222-app/src/app/image-budget-warning.json`; T002 `81850a9 |
| If the browser emits no warning, that negative result is recorded and M026's final review is corrected; the sample is never fabricated to look captured. | met | spikes/ng222-app/src/app/image-budget-page.ts`; the capture record |
| `npm run check` and `npm test` pass at the head. | met | .project/build/evidence.json`; `research/raw/m027-verdict-claims.json |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-capture-correction.md
- review/FINAL.md
- review/final-gap-1.md
- review/final-gap-2.md
- review/wave-1.cycle1.md
- tasks/T001-capture-what-the-browser-says-about-an-unbudgeted-image.md
- tasks/T002-point-the-sample-at-the-capture.md

## Notes

- none
