# Archive — 002-sidecar-hardening

Milestone: sidecar-hardening
Shipped: 2026-10-18
Final verdict: all criteria met; project verify passed
Waves: 1  Tasks: 1 done / 1 total  Review cycles used: 1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| AGENTS.md documents a repeatable, one-command dependency-bridge procedure for verify sidecars, including cleanup, and `npm run check` succeeds in a fresh sidecar after bridging. | met | AGENTS.md:12-19; .project/review/final-gap-1.md; .project/tasks/T001-sidecar-bridge.md Log (final verify pass, exit 0) |
| `isolation.py retire` removes a leftover/dirty sidecar without manual filesystem cleanup (force path), verified by running it against a stale sidecar and confirming the worktree and branch are gone. | met | .project/tasks/T001-sidecar-bridge.md Log ("isolation.py retire --force clears stale sidecars (verified during M002 setup)"); AGENTS.md:18-19 |
| Baseline remains green: `npm run check` exits 0 and `npm test` passes (296 tests) after all changes. | met | .project/tasks/T001-sidecar-bridge.md Log; .project/review/final-gap-1.md; INTENT.md current state (296 tests) |

## Contents

- build/evidence.json
- build/verify-ledger.jsonl
- intent/INTENT.md
- plan/PLAN.md
- research/DOCS-AUDIT.md
- research/SYNTHESIS.md
- research/evidence-codebase.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- tasks/T001-sidecar-bridge.md

## Notes

- none
