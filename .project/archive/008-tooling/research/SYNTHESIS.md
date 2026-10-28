# Synthesis

<!-- Written by the planning phase in milestone mode. The planner treats
     Settled as fixed and records exactly which program decisions this
     milestone's plan was built against. -->

## Settled

- Program scope and order — M008 is the tooling milestone, first after the shipped set (CHARTER.md `Full scope: in`; ROADMAP.md M008).
- Installer location — the nine `install-*-command-code.mjs` scripts and their tests belong in `~/.commandcode/scripts/` (CHARTER.md Corrections, 2026-10-28; ROADMAP.md M008 `Scope: in`).
- Repository gates — `npm run check`, `npm test` and the skills-mirror parity test stay green (INTENT.md SC1-SC3).
- Review-panel families — the installer gains a guarded, idempotent patch for `beam`, `glyph`, `laguna` and `glm`; the panel stays `off` until it lands (program SYNTHESIS.md, Tooling move mechanics; CHARTER.md Constraints).
- Cross-import target — `scripts/opencode-pstack-plugin.ts` stays in the repository and the moved installer keeps resolving it (program SYNTHESIS.md, Tooling move mechanics).
- GSD Path constraints — work stays on `gsd-path/M008`, state changes only through the bundled helpers, commits use the gmail identity, and nothing is pushed (CHARTER.md Constraints).
- Held-out rulings — E5 (no fallback to the repository test glob) and E7 (a fourth panel family is rejected) are pinned by named tests (INTENT.md `Edge coverage`).

## For the planner

- **Wave-1 blockers**: the installer move's coupling to the `package.json` test glob and the narrow `tsconfig.json` include, and the anchor-guarded idempotent family patch in the moved installer copy.
- **Walking skeleton**: move the nine scripts and their tests to `~/.commandcode/scripts/`, point the test glob and typecheck at the new location while keeping `scripts/opencode-pstack-plugin.ts`, add the guarded family patch, then prove `npm run check`, `npm test`, the skills-mirror parity test and family resolution.
- **Pitfalls → tasks**: stale `scripts/` references must be swept (task: repository reference update); the cross-import target must stay put (task: installer move); a missing anchor must fail loudly rather than patch nothing (task: family patch); an empty user-scope test directory must fail instead of silently passing (held-out E5).
