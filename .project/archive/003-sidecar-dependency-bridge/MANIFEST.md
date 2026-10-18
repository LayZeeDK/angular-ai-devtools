# Archive — 003-sidecar-dependency-bridge

Milestone: sidecar-dependency-bridge
Shipped: 2026-10-18
Final verdict: all criteria met; project verify passed
Waves: 2  Tasks: 4 done / 4 total  Review cycles used: 2/1
Carried forward: none

## Success criteria at ship

| Criterion | Verdict | Evidence |
|-----------|---------|----------|
| A freshly created verify sidecar runs `npm run check` with no manual dependency bridge and exits 0. | met | T001 commit ea2f3e9 (edges E1, E2 cited via `reuse-if-correct`, `fail-fast-missing-primary` tests). |
| A freshly created verify sidecar runs `npm test` with no manual dependency bridge and exits 0 (296/296 tests pass). | met | T001 commit ea2f3e9 (edge E5 cited via `rerun-reuses-bridge` test). |
| Every control skill's documented check command runs in its verify sidecar without manual dependency bridging. | met | T003 commit 1746b9b (judgment prohibition N3: manual junction procedure retained in AGENTS.md). |
| `.browsers/` and `tmp/` runtime artifacts are relocated under `.commandcode/worktrees/` (or an equivalent git-ignored path) and all references are updated. | met | T002 commit eeae369, T004 commit 1b070ad (edge E3 cited via `fallback-read-old-path` test). |
| Existing behavior is preserved: `npm run check` and the full test suite still pass on the primary worktree (no regression in the 296 tests or typecheck). | met | primary run 2026-10-18. |

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
- research/evidence-similar.md
- research/evidence-stack.md
- review/FINAL.md
- review/final-gap-1.md
- review/wave-1.cycle1.md
- review/wave-1.cycle2.md
- review/wave-2.cycle1.md
- tasks/T001-bridge-helper.md
- tasks/T002-artifact-relocation.md
- tasks/T003-docs-integration-verify.md
- tasks/T004-fix-fallback-test.md

## Notes

- none
