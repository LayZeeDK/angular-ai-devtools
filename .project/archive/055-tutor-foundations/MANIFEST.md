# Archive — 055-tutor-foundations

Milestone: tutor-foundations
Shipped: 2026-11-20
Final verdict: all criteria met; project verify passed
Waves: 4  Tasks: 4 done / 4 total  Review cycles used: 1/1/1/1
Carried forward: 47 DOCS-AUDIT ruling(s)

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| The panel, for a question whose answer a record contains, names the artefact file, the milestone the record belongs to and the criterion the artefact answers, each of the three read from the record's own fields — the milestone from the record's `milestone` field, the criterion from its criterion field, the file from its artefact-path field — and none of the three composed from a filename, a path convention or the record's prose fields; a mutant that assembles an answer by file naming or copies the derivation's prose as the answer reddens. | met | .project/build/verify-ledger.jsonl — project verify pass at a35b40c6236a7d5daa3acf9e63a9e52edb083aca; research/raw/m055-record-shapes.json:520-580 (the field map the join reads); .project/review/wave-1.cycle1.md, wave-2.cycle1.md |
| A question no record answers is reported as unanswered, naming which absence holds — no criterion in any readable record matches the question, a matched criterion names no artefact path, or the records cannot be read — and that state is rendered as its own, distinct from an answer whose named artefact file is absent where the record says it lives, which names the record and the missing path beside the absence; a mutant that renders an unanswered question as an answer, or a missing artefact as unanswered, reddens. | met | .project/build/verify-ledger.jsonl — project verify pass at a35b40c6236a7d5daa3acf9e63a9e52edb083aca; scripts/tutor-answer.test.mjs:1115-1152 (the constructed E4 pin); .project/review/wave-2.cycle1.md |
| Nothing is cited that a record does not contain: every artefact path the panel renders is one the named record states and a file that exists where the record says it lives at the time the answer is served — inside the milestone's archive (`.project/archive/05*/`) when the record names archived evidence, at the repo-root path the record names otherwise — and every criterion id rendered appears among the named record's own criterion fields; a mutant that renders a path no record states, a file that is not there, or a criterion id the record does not carry reddens. | met | .project/build/verify-ledger.jsonl — project verify pass at a35b40c6236a7d5daa3acf9e63a9e52edb083aca; research/raw/m055-verdict-claims.json:69-83 (each SC row's own `claims[].artefactPath`); .project/review/wave-3.cycle1.md |

## Contents

- build/verify-T001.log
- build/verify-T002.log
- build/verify-T003.log
- build/verify-T004.log
- build/verify-ledger.jsonl
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
- tasks/T001-measure-what-the-records-carry-and-what-only-a-mapping-can-answer.md
- tasks/T002-author-the-one-mapping-and-join-it-to-the-records-pure.md
- tasks/T003-render-the-answer-surface-and-pin-the-route.md
- tasks/T004-record-the-surface-capture-the-claims-run-the-project-verify.md

## Notes

- none
