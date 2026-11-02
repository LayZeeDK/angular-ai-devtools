# Synthesis — M018 instrument-core

Scope: milestone (`CHARTER.md` and `ROADMAP.md` exist).
Audited HEAD: 9d202988379b9aab10e30dd164ab661702736c1e

## Settled

- **Research and decide were not dispatched.** `.project/intent/INTENT.md`
  `## Open questions` records no `[RESEARCH]` item, so no evidence dimension was
  assigned and no decision remained open. The milestone's technical questions
  were settled by the inspect artifacts
  (`.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`)
  and by the ROADMAP entry's own scope.
- **The envelope is one declaration record.** INTENT edge E1 requires six
  hostile shapes to pass through it unchanged; they are implemented in
  `apps/angular-ai-devtools/src/app/tool-registry/hostile-tools.ts` and proved by
  `hostile-tools.spec.ts` (landed T002, `677b6da`).
- **The page-read port is the single path to page state.** INTENT edge E4 holds
  a reach guard that fails on a live direct import (landed T004, `8504846`).
- **Two tools were added without touching the envelope** (T006 `5044c2b`,
  T007 `4076ec65`), pinned by `scripts/registry-envelope-pin.test.mjs`.
- **`npm run check` now covers the panel**, not three files outside it
  (landed T008, `7af17cb`).

## Carried risks

- **The envelope pin is a self-asserted SHA-256 constant.** It catches
  accidental edits to the registry core, and nothing mechanically prevents a
  future commit from simply updating the expected hash. It guarantees process
  discipline, not tamper-proofing (final gap 2).
- **The extension initial bundle is 535.44 kB** against a 520 kB
  `maximumWarning` with a 1 MB error ceiling; the build exits 0, so this is an
  advisory inherited by later milestones (final gap 3).
