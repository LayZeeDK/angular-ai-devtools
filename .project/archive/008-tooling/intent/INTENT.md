# Intent — angular-ai-devtools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: milestone

Review panel: off

Finding skeptics: off

Surfaces: none

## Summary

Move the nine `install-*-command-code.mjs` scripts and their tests out of the
repository's `scripts/` directory into the user-scope `~/.commandcode/scripts/`,
updating the test glob, the `tsconfig.json` include and the `AGENTS.md`
references so the repository stays green. Extend the GSD Path installer with a
guarded, idempotent patch that adds the `beam`, `glyph`, `laguna` and `glm`
review-panel families, so `detected` and named panels can express this host's
routes. These are user-scope tools that do not belong to the product, and the
milestone makes the repository layout match how Command Code installs them. No
product feature changes and no panel behavior changes.

## Problem

The repository carries installers for user-scope CLIs and skills in `scripts/`,
coupled to the repo's test glob, `tsconfig` include and `AGENTS.md`, although
those tools are installed globally under `~/.commandcode/`. Separately, the GSD
Path review panel cannot name this host's model families, so cross-model review
cannot use the configured free and paid routes.

## Users

Lars, as operator of this repository and of the Command Code installation.
Single user, highly technical.

## Success criteria

1. `npm run check` passes.
2. `npm test` passes.
3. The skills-mirror parity test passes.
4. The moved tests run from `~/.commandcode/scripts/`.
5. `review_panel.py` resolves the `beam`, `glyph`, `laguna` and `glm` families.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | idempotency | criterion SC1 | running `npm run check` twice on the unchanged tree yields exit 0 both times |
| E2 | SC2 | idempotency | criterion SC2 | running `npm test` twice yields the same pass count and leaves no generated files |
| E3 | SC3 | none | dismissed | the parity test compares two directory trees; it has no data shape of its own |
| E4 | SC4 | empty | criterion SC4 | an empty `~/.commandcode/scripts/` test set fails the command instead of passing silently |
| E5 | SC4 | boundary | held-out | the dedicated test glob must not fall back to the repository `scripts/**/*.test.mjs`; the test pins a non-zero exit when no user-scope tests exist |
| E6 | SC5 | empty | criterion SC5 | an unknown family still raises an error; a panel never resolves to an empty selection silently |
| E7 | SC5 | boundary | held-out | a panel names at most three families; naming a fourth is rejected |
| E8 | SC5 | ordering | criterion SC5 | the parent's family is always skipped while the other three families remain available |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | all | none | dismissed | this milestone changes repository tooling only; no person-facing product behavior is affected |

## Scope: in

- Move all nine `install-*-command-code.mjs` scripts plus their tests to `~/.commandcode/scripts/`.
- Run tests via a dedicated npm script glob over `~/.commandcode/scripts/**/*.test.mjs`.
- Replace the `tsconfig.json` include with the moved pstack installer paths under `~/.commandcode/scripts/` plus `scripts/opencode-pstack-plugin.ts` retained in-repo.
- Update the `package.json` test glob and `AGENTS.md` references (sidecar bridge, skill mirror).
- Keep `scripts/opencode-pstack-plugin.ts` as the cross-import target.
- Add the guarded, idempotent review-panel family patch (`beam`, `glyph`, `laguna`, `glm`) to the moved installer copy.

## Scope: out (vetoes)

- No product feature changes and no extension source changes.
- No changes to the panel's N1, N2 or N3 behavior.
- No code generation; no NgModule or Zone.js support; no Firefox or Safari (charter vetoes).
- No push, pull request, or ledger filing without Lars's explicit yes.

## Constraints

- TypeScript 6.0.x pin; `npm run check` and `npm test` are the repository gates.
- `~/.commandcode/scripts/` is outside this repository, so the move changes tracked files here and adds user-scope files there.
- The installer patch must fail loudly when its anchors are missing and must be idempotent on re-install.
- GSD Path: work stays on `gsd-path/M008`; state changes only through the bundled helpers; commit as the gmail identity; no push.
- Free model routes only.

## Current state (brownfield only)

- **What exists**: an Nx 23 / Angular 22.1 workspace whose app is emitted as the MV3 extension panel; the repository also hosts nine `install-*` scripts in `scripts/`, a `package.json` test glob over `scripts/**/*.test.mjs`, a narrow `tsconfig.json` include, and a GSD Path installer without any review-panel family patch.
- **Must not break**: the extension panel's N1, N2 and N3 behavior, the sidecar dependency bridge, the skills-mirror parity test, and the existing `npm run check` / `npm test` gates.
- **Doc-vs-code rulings**: none pending; the docs audit found no stale or aspirational claim about this work.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- The `tsconfig` include replacement leaves stale `scripts/` references if a path is missed.
- The guarded family patch must land in the moved installer copy before `detected` or named panels can express this host's routes.
- The cross-import target `scripts/opencode-pstack-plugin.ts` must remain in the repository, and the moved installer must still resolve it.

## Open questions

- None

## Corrections
