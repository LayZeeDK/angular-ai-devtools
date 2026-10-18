# Synthesis — sidecar-hardening

## Settled

- INTENT.md constraints: TypeScript 6.0.3 pinned; node:test for scripts; sidecar node_modules absent by design; bridge is temporary and cleaned up after checks.
- INTENT.md scope out: no changes to control/verify skills or byte-copied helpers; no browser automation or new product features; no GSD Path helper script changes beyond verification.
- INTENT.md SC1: AGENTS.md documents a repeatable dependency-bridge procedure and `npm run check` succeeds in a fresh sidecar after bridging.
- INTENT.md SC2: `isolation.py retire --force` clears a stale sidecar (worktree + branch gone), verified by command.
- INTENT.md SC3: baseline green (`npm run check` exit 0, `npm test` 296 pass) after changes.
- Brownfield: repo is a skill/control-script sandbox, not an Angular app; 296 tests pass at baseline; verify sidecar lacks node_modules.

## For the planner

Walking skeleton: update AGENTS.md with the bridge procedure, verify retire --force against a stale sidecar, re-run baseline checks. At most two deliverable-sized tasks in one wave.