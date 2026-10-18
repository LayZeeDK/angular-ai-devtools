# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Dependency install in sidecars — none; fail fast instead (intent N2; AGENTS.md "Verify sidecar dependencies").
- Primary worktree `node_modules` must never be deleted or damaged during retire/cleanup (intent N1).
- Manual junction procedure in AGENTS.md must keep working for legacy sidecars (intent N3; evidence-domain.md § "Manual sidecar dependency bridge is documented in AGENTS.md").
- Git-ignored runtime artifacts remain git-ignored (intent constraint; evidence-codebase.md § "Large ignored browser profile data").
- Byte-copy helpers `proctree.mjs`/`fingerprint.mjs` are not edited in place (intent constraint; evidence-codebase.md § "Control skills ship byte-copied helpers").
- TypeScript pinned to 6.0.3 (intent constraint; AGENTS.md lines 7-9).
- Root verification commands are `npm run check` and `npm test` (evidence-codebase.md § "All tests pass at baseline"; evidence-domain.md § "Root typecheck and test commands").
- Control/verify skill check command inventory and documentation locations (evidence-domain.md, all findings).
- Verify sidecars are pinned to the primary's base commit — the precondition that makes a shared `node_modules` link valid (evidence-similar.md § "Verify sidecars are safe to bridge because they are pinned to the primary's base commit").
- npm workspaces hoisting as a sidecar bridge — rejected (intent N2 + evidence-stack.md, evidence-pitfalls.md, evidence-similar.md).
- Copying `node_modules` into a sidecar — rejected (evidence-stack.md § "Copying node_modules is not a viable fallback").

## Decisions

### Dependency bridge mechanism

- **Decision**: Junction on Windows via `fs.symlinkSync(target, path, 'junction')` and a directory symlink on POSIX via `fs.symlinkSync(target, path, 'dir')`, target resolved to an absolute path, created in the sidecar creation path (`isolation.py`/installer), with reuse-if-correct idempotency (E1/E5) and fail-fast on a missing or broken primary `node_modules` (E2); linked paths are recorded and unlinked non-recursively before retire.
- **Runner-up**: npm workspaces hoisting — requires `npm install` (N2 veto) and a root workspaces manifest, and on Windows produces junctions anyway (npm/cli#5189), so no benefit; copying `node_modules` — large disk cost plus TypeScript 6.0.3 vs stale 7.x drift risk.
- **Evidence**: evidence-stack.md § "Node fs.symlinkSync supports 'junction' type on Windows without elevated permissions", § "Windows junctions require an absolute target path", § "Idempotent reuse and fail-fast preconditions are required by the intent edges"; evidence-pitfalls.md § "Junctions are reparse points that many delete commands follow into their target", § "Safe teardown requires unlinking the reparse point before any recursive delete or worktree removal"; evidence-similar.md § "Verify sidecars are safe to bridge because they are pinned to the primary's base commit", § "Fail-fast on a missing/broken primary dependency tree beats attempting an install".
- **Confidence**: high

### Scope of the bridge (verify sidecars only)

- **Decision**: Apply the bridge only to verify sidecars created at the primary's base commit; sidecars that may change `package.json` (task sidecars) must not reuse a shared `node_modules` and must fail fast / be handled separately.
- **Runner-up**: Bridge every sidecar type — rejected because a shared `node_modules` only works when both sides have identical dependencies (continuumcode.ai symlink trap table).
- **Evidence**: evidence-similar.md § "Symlinking one shared node_modules is a documented trap unless both sides have identical dependencies", § "Verify sidecars are safe to bridge because they are pinned to the primary's base commit".
- **Confidence**: high

### Artifact relocation mechanism

- **Decision**: Relocate `.browsers/` and `tmp/` under a single git-ignored home (`.commandcode/worktrees/` by default, pending user ruling) with per-worktree profiles; copy (do not symlink) gitignored artifacts so mutable browser profiles do not cross-contaminate; update every `ROOT`-relative path in control scripts and tests; add a one-time fallback read from the old location (edge E3) so no artifacts are lost (N5).
- **Runner-up**: Symlink one shared `.browsers/` profile across sidecars — rejected because mutable profile state and concurrent browser locks would cross-contaminate (analogous to the Rust `CARGO_TARGET_DIR` lock trap).
- **Evidence**: evidence-pitfalls.md § "Relocating `.browsers/` and `tmp/` touches many hardcoded ROOT-relative paths"; evidence-similar.md § "Gitignored runtime artifacts must be carried or relocated, not shared by mutable link", § "Central storage + symlink + manifest + auto-sync is the reusable pattern for shared ignored files".
- **Confidence**: medium

### Teardown / retire safety

- **Decision**: Unlink the reparse point with a non-recursive directory delete before any recursive delete or `git worktree remove`; never append a trailing separator to the bridge path; record linked paths; retire removes only the sidecar-local link, never the source (N1).
- **Runner-up**: Rely on `git worktree remove` to unlink the junction — only safe on Git for Windows ≥2.54 and even then leaves the junction behind.
- **Evidence**: evidence-pitfalls.md § "Junctions are reparse points that many delete commands follow into their target", § "Git for Windows < 2.54 deletes through a junction in `git worktree remove`", § "Safe teardown requires unlinking the reparse point before any recursive delete or worktree removal", § "Trailing separators change junction handling from unlink to target deletion".
- **Confidence**: high

### Migration preserves existing artifacts

- **Decision**: Auto-migrate existing `.browsers/` and `tmp/` contents to the new location, preserving all files (N5), with a one-time fallback read from the old path (edge E3), pinned by a test.
- **Runner-up**: Delete old artifacts after copy — rejected by N5 (no loss of existing runtime artifacts).
- **Evidence**: intent INTENT.md (edge E3, prohibition N5); evidence-pitfalls.md § "Relocating `.browsers/` and `tmp/` touches many hardcoded ROOT-relative paths".
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: prove junction creation/reuse/fail-fast on this repo's actual `isolation.py` path on Windows without admin privileges; prove retire unlinks without damaging the primary `node_modules` (N1); complete the path sweep for `.browsers/`/`tmp/` references; resolve the low-confidence junction-absolute-path detail; confirm browser-dependent unrun checks remain manual proofs.
- **Walking skeleton**: implement the bridge in sidecar creation + retire unlink, with one test proving a fresh sidecar runs `npm run check` and `npm test` (296/296) with no manual step; then artifact relocation with fallback read and a preservation test.
- **Pitfalls → tasks**: trailing-separator handling in cleanup scripts (pitfalls.md); Git for Windows <2.54 `worktree remove` must be preceded by explicit unlink; TS 6.0.3 vs 7.x drift → fail fast, no install (N2); byte-copy helpers untouched (constraint); `reparseRefusal()` in `control-ai-browsers` already encodes the junction hazard and must be respected.

## User rulings

- Final location for relocated artifacts → `.commandcode/worktrees/` (user ruling 2026-10-18; matches evidence-preferred option).

## Still unknown

- Whether browser-dependent unrun checks are automated or remain manual proofs — accept risk / wave-1 spike (evidence-codebase.md open question).
- Junction absolute-target behavior on this environment's Git/Node versions — wave-1 spike (evidence-stack.md § "Windows junctions require an absolute target path", medium confidence).
