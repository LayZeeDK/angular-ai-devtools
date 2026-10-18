# Intent — angular-ai-devtools

Lane: quick

Review panel: off

Finding skeptics: off

Surfaces: none

## Summary

Milestone M002 hardens the GSD Path verify-sidecar workflow that M001 exposed: sidecars ship without node_modules so `npm run check` fails unless a junction is created, and aborted runs leave stale sidecar directories that block re-runs. This milestone documents the dependency-bridge procedure, makes sidecar retirement recover from leftovers, and keeps the baseline green. No product skill or control surface changes.

## Problem

Verify sidecars created by `isolation.py isolate-verify` contain no `node_modules`, so `npm run check` fails with TS2688 unless dependencies are bridged from the primary worktree. Aborted or interrupted runs leave stale sidecar directories that cause `isolate-verify` to fail with "worktree path already exists", requiring manual cleanup. Both friction points surfaced during M001's inspect/ship work.

## Users

The orchestrator and any agent running GSD Path verify sidecars in this repo. Technical users comfortable with git worktrees and junctions.

## Success criteria

1. AGENTS.md documents a repeatable, one-command dependency-bridge procedure for verify sidecars, including cleanup, and `npm run check` succeeds in a fresh sidecar after bridging.
2. `isolation.py retire` removes a leftover/dirty sidecar without manual filesystem cleanup (force path), verified by running it against a stale sidecar and confirming the worktree and branch are gone.
3. Baseline remains green: `npm run check` exits 0 and `npm test` passes (296 tests) after all changes.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | none | dismissed | No data shape; documentation-only change. |
| E2 | SC2 | idempotency | dismissed | Retire is one-shot per sidecar; re-running on a missing path is a no-op at the OS level and not required. |
| E3 | SC3 | none | dismissed | No data shape; baseline command. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | all | none | dismissed | Work affects no person directly (internals only). |

## Scope: in

- Add a documented dependency-bridge procedure to AGENTS.md (junction command + cleanup).
- Verify and document that `isolation.py retire --force` clears stale sidecars (already supported; confirm via command).
- Re-run `npm run check` and `npm test` to confirm baseline green.

## Scope: out (vetoes)

- No changes to control/verify skills or their byte-copied helpers.
- No browser automation or new product features.
- No changes to GSD Path helper scripts beyond verification.

## Constraints

- TypeScript 6.0.3 pinned; node:test for scripts.
- Sidecar node_modules absent by design; bridge is temporary and cleaned up after checks.
- Keep changes minimal and confined to docs + verification evidence.

## Current state (brownfield only)

- **What exists**: Node/npm + TypeScript 6.0.3 skill/control-script sandbox; 296 tests passing; M001 shipped and integrated. No Angular runtime in root.
- **Must not break**: existing test counts (49 root + 247 skills), `npm run check` green, control skill helpers unchanged.
- **Doc-vs-code rulings**: AGENTS.md toolchain claims verified against package.json (no conflicts); DOCS-AUDIT shows 22 verified claims, 0 stale.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Bridge procedure may differ across Windows junction semantics; document Windows-specific commands.
- Stale sidecar cleanup could delete unintended directories if path is wrong; require exact path from isolation.py output.

## Open questions

- [RESEARCH] Whether a helper script should automate the bridge; deferred to a future milestone if needed.

## Corrections

- 2026-10-18: "AFK mode: complete and ship M002 without deferring decisions."