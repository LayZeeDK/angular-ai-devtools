# Intent — angular-ai-devtools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: standard

Review panel: off

Finding skeptics: off

Surfaces: none

## Summary

Milestone M003 removes the manual dependency bridge for verify sidecars so every control and verify skill's documented checks run in a freshly created sidecar with zero manual steps, and relocates the git-ignored `.browsers/` and `tmp/` runtime artifacts under `.commandcode/worktrees/` with auto-migration. The problem today is that sidecars ship without `node_modules`, forcing a manual `mklink /J` junction before `npm run check` or `npm test` will run, and runtime artifacts live at the repo root where they are easy to confuse with source. The first release is complete when a brand-new sidecar passes typecheck and the full test suite with no human intervention and all control-skill checks pass in their sidecars.

## Problem

Verify sidecars created by `isolation.py isolate-verify` contain no `node_modules`, so `npm run check` fails with TS2688 unless a developer manually creates a directory junction from the sidecar to the primary worktree's `node_modules`. The AGENTS.md documents this workaround, but it is friction, error-prone, and undocumented for skills that drive browser checks. Separately, `.browsers/` (~9k files) and `tmp/` (~5k files) sit at the repo root as git-ignored runtime artifacts, making the working tree noisy and easy to mistake for source. For whom: maintainers and verification agents running control/verify skills. How badly: every verification run requires a manual step and a cleanup step; forgetting either breaks checks or leaks artifacts.

## Users

Maintainers and automated verification agents running the control/verify skill pairs. Small number (one primary maintainer plus spawned agents), highly technical, currently rely on the documented junction workaround and manual cleanup.

## Success criteria

1. A freshly created verify sidecar runs `npm run check` with no manual dependency bridge and exits 0.
2. A freshly created verify sidecar runs `npm test` with no manual dependency bridge and exits 0 (296/296 tests pass).
3. Every control skill's documented check command runs in its verify sidecar without manual dependency bridging.
4. `.browsers/` and `tmp/` runtime artifacts are relocated under `.commandcode/worktrees/` (or an equivalent git-ignored path) and all references are updated.
5. Existing behavior is preserved: `npm run check` and the full test suite still pass on the primary worktree (no regression in the 296 tests or typecheck).

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | idempotency | held-out | Reuse the dependency bridge if it already exists and points at the correct primary node_modules; only create when missing. Pin with a test. |
| E2 | SC1 | concurrency | held-out | If the primary worktree's node_modules is missing or broken, fail fast with a clear error; do not attempt npm install. Pin with a test. |
| E3 | SC4 | idempotency | held-out | Auto-migrate existing artifacts to the new location with a one-time fallback read from the old path. Pin with a test. |
| E4 | SC3 | empty | dismissed | Every control skill already has a documented check command; an empty skill set cannot occur. |
| E5 | SC2 | idempotency | held-out | Re-running npm test in the same sidecar must reuse the bridge and not corrupt results. Pin with a test. |
| E6 | SC5 | idempotency | dismissed | Primary worktree checks are read-only verification; re-running does not mutate source. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | delete or damage the primary worktree's node_modules during sidecar retire/cleanup | criterion SC5 | Retire must only remove the sidecar-local bridge, never the source. |
| N2 | SC1 | trigger npm install inside a sidecar | criterion SC1 | Sidecar creation must not perform network installs; fail fast instead. |
| N3 | SC3 | break the documented manual junction workflow in AGENTS.md | judgment | Final reviewer confirms the manual junction procedure still works for legacy sidecars. |
| N4 | SC2 | corrupt or partially overwrite test results on re-run | criterion SC2 | Re-running npm test must produce a clean, complete result; no partial writes. |
| N5 | SC4 | lose or delete existing runtime artifacts during migration | criterion SC4 | Migration must preserve all existing .browsers/ and tmp/ contents. |
| N6 | SC5 | break the primary worktree typecheck or tests | criterion SC5 | Primary npm run check and npm test must remain green. |

## Scope: in

- Modify `isolation.py` (or the verify-sidecar creation path) to bridge dependencies automatically.
- Update AGENTS.md and skill docs to reflect the automatic bridge and the new artifact location.
- Relocate `.browsers/` and `tmp/` references to the new location and migrate existing artifacts.
- Keep the manual junction procedure working for backward compatibility.

## Scope: out (vetoes)

- No auto-running `npm install` in sidecars — user's ruling (costly, network-dependent).
- No deletion of the primary `node_modules` — user's ruling.
- No changes to Angular runtime or spike fixtures — out of scope.

## Constraints

- Stack: Node/npm, TypeScript 6.0.3 pinned, ES modules, NodeNext. Must remain green: `npm run check` (root + skills) and `npm test` (296 tests).
- Git-ignored runtime artifacts must stay git-ignored.
- Preserve the byte-copy helper rule: do not edit `proctree.mjs`/`fingerprint.mjs` in place.

## Current state (brownfield only)

- **What exists**: Node/npm + TS 6.0.3 ESM monorepo of agent skills and installers; 296 tests pass; typecheck passes; verify sidecars lack node_modules and require a manual junction.
- **Must not break**: typecheck (root + skills), full test suite (296), manual junction workflow, byte-copy helpers.
- **Doc-vs-code rulings**: AGENTS.md sidecar-bridge doc is verified (matches code); no contradictions found in M002 scope.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- Relocating `.browsers/` may break skills that hardcode the root path; need a grep sweep.
- Automatic bridging must not leave dangling junctions after retire.
- Windows junction semantics differ from POSIX symlinks; cross-platform handling needed.

## Open questions

- [RESEARCH] Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting?
- [RESEARCH] Which exact control-skill check commands exist and where are they documented?
- [NEEDS-USER] Confirm the final location for relocated artifacts (`.commandcode/worktrees/` vs. a dedicated `.runtime/`).

## Corrections

- 2026-10-18: "Would npm workspaces work? What about having worktrees in subfolders of gitignored .commandcode/worktrees/?" — user wants these evaluated during research.