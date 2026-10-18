# Archive — 001-run-unrun-spikes

Milestone: run-unrun-spikes
Shipped: 2026-10-18
Final verdict: all criteria met; project verify passed
Waves: 7  Tasks: 8 done / 8 total  Review cycles used: 1/1/1/1/1/1/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| Each unrun spike named in `research/05-spikes.md` (S4, S14-S23, E1-E13, TS1-TS12) runs once and leaves a committed, timestamped evidence artifact under `research/raw/` (or the documented spike output path) plus a note in its matching research file, marking prior pending status updated. Every run creates a new timestamped evidence file (no overwrite), runs do not overlap on the same per-model instance, and follow `plans/angular-ai-devtools-proposals.handoff.md` next-work order. | met | research/raw/, research/05-spikes.md (E1, E3, E4, N1, N2, N4) |
| S16's companion-package Meta-class lookup records exactly one of `works` / `works-with-degradation` / `fails`, with the measured evidence reference; with no evidence it stays blocked (never assumed from the lookup's theoretical argument). | met | research/raw/s16-meta-lookup.json (E6, N3) |
| `docs/filing-ledger.md` and the relevant `research/*.md` notes are updated from pending/unrun to measured for every completed spike, and rerunning an update does not duplicate rows. | met | docs/filing-ledger.md, research/05-spikes.md (E5, N5) |
| Any spike that cannot run is recorded as blocked with the exact precondition (instance availability, model download, branded-browser access, or permission), not silently skipped or counted complete. | met | research/05-spikes.md, docs/filing-ledger.md (E2, N6) |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/RESEARCH.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- research/evidence-domain.md
- research/evidence-pitfalls.md
- research/evidence-stack.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-2.cycle1.md
- review/wave-3.cycle1.md
- review/wave-4.cycle1.md
- review/wave-5.cycle1.md
- review/wave-6.cycle1.md
- review/wave-7.cycle1.md
- tasks/T001-s16-spike.md
- tasks/T002-instance-availability.md
- tasks/T003-offline-spikes-s17-s19.md
- tasks/T004-model-browser-spikes.md
- tasks/T005-tutor-spikes.md
- tasks/T006-edge-and-s4-spikes.md
- tasks/T007-fold-and-ledger.md
- tasks/T008-closed-findings-check.md

## Notes

- none
