# Evidence — similar

Dimension: similar
Questions assigned: Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting?

## Finding: Symlinking one shared node_modules is a documented trap unless both sides have identical dependencies

- **Claim**: A shared `node_modules` symlink only works when both branches have identical dependencies; it breaks silently when a branch adds or bumps a dependency, cross-contaminates tooling that writes into `node_modules` (Prisma, Next, `.bin` shims), breaks monorepo workspace links, and is unsafe under concurrent installs.
- **Source**: https://continuumcode.ai/guides/git-worktree-node-modules/ (symlink verdict table); https://www.gitworktree.org/guides/node-modules
- **Confidence**: high
- **Why it matters here**: The M003 bridge is exactly a shared `node_modules` link, so it must be gated on identical base (verify sidecars are pinned to the primary's base) and must not be used for task sidecars that can change `package.json`.

## Finding: Verify sidecars are safe to bridge because they are pinned to the primary's base commit

- **Claim**: Worktrees share Git objects/refs but not gitignored files, so each normally needs its own install; however, a sidecar created at the same base as the primary has an identical `package.json`/lockfile, which is the one condition under which a shared `node_modules` link is valid.
- **Source**: https://www.gitworktree.org/guides/node-modules ("Different branches may have different dependencies"); isolation.py `isolate_verify` requires primary HEAD == resolved base (codebase evidence)
- **Confidence**: high
- **Why it matters here**: Justifies keeping the junction/symlink bridge for verify sidecars (SC1–SC3) while failing fast if the primary's `node_modules` is missing/broken (E2), rather than attempting an install.

## Finding: pnpm's content-addressed store + hard links is the canonical alternative to symlinking

- **Claim**: pnpm stores each package version once in a global content-addressable store and hard-links it into each worktree, so repeated installs cost near-zero disk and time, provided the store is on the same filesystem as the worktrees (otherwise it copies).
- **Source**: https://continuumcode.ai/guides/git-worktree-node-modules/ (pnpm section); https://pnpm.io/settings/node-modules
- **Confidence**: high
- **Why it matters here**: A future migration to pnpm would remove the bridge entirely, but the stack is pinned to npm/TypeScript 6.0.3 and N2 forbids installs in sidecars, so the junction bridge remains the right choice for M003; pnpm is only a documented option.

## Finding: npm workspaces hoisting is not a fit for this repo or for sidecars

- **Claim**: npm workspaces hoist shared deps into a single root `node_modules` and symlink local packages; this requires running `npm install` in the sidecar, does not help a single-package repo, and the workspace symlinks would resolve against the sidecar's own tree rather than the primary's.
- **Source**: https://docs.npmjs.com/cli/v9/using-npm/workspaces/; https://continuumcode.ai/guides/git-worktree-node-modules/
- **Confidence**: medium
- **Why it matters here**: Answers the intent's open question — hoisting is a dead end given N2 (no installs) and the single-package layout; the junction/symlink bridge is the correct mechanism (with cross-platform handling).

## Finding: Gitignored runtime artifacts must be carried or relocated, not shared by mutable link

- **Claim**: Tools like Claude Code's `.worktreeinclude` and VS Code's `git.worktreeIncludeFiles` copy (not link) gitignored files into new worktrees; copying `node_modules` this way is discouraged because it is a full duplicate with no hard links, and shared mutable directories (browser profiles) cause lock contention when concurrently accessed.
- **Source**: https://continuumcode.ai/guides/git-worktree-node-modules/ (`.worktreeinclude` and Rust `CARGO_TARGET_DIR` lock example)
- **Confidence**: high
- **Why it matters here**: Supports relocating `.browsers/` and `tmp/` under a single git-ignored home (`.commandcode/worktrees/`) with per-worktree profiles (SC4, E3, N5) rather than symlinking one shared mutable profile.

## Finding: Central storage + symlink + manifest + auto-sync is the reusable pattern for shared ignored files

- **Claim**: `git-worktree-share` stores shared files once under `.git/shared/`, symlinks them into every worktree, tracks them in a manifest, backs up real files as `*.shared-backup` before replacing, and auto-syncs via a `post-checkout` hook; deleting a worktree only removes symlinks, leaving shared data safe.
- **Source**: https://github.com/keithamus/git-worktree-share (README)
- **Confidence**: medium
- **Why it matters here**: Reusable blueprint for E1/E3 idempotency and cleanup: reuse the bridge if it already points at the correct primary; back up rather than overwrite; auto-sync on creation; retire only removes the sidecar-local link, never the source (N1).

## Finding: Fail-fast on a missing/broken primary dependency tree beats attempting an install

- **Claim**: In CI and isolated checkouts, the recommended practice is a clean install from a lockfile (`npm ci`) when `node_modules` is missing, but for sidecars the intent explicitly forbids installs; therefore the sidecar creation path should verify the primary `node_modules` exists and is coherent, then bridge, and error clearly otherwise.
- **Source**: https://docs.npmjs.com/cli/v8/commands/npm-ci/ (missing/empty node_modules case); INTENT.md N2
- **Confidence**: high
- **Why it matters here**: Directly supports E2 and N2 — no network installs in sidecars; surface a clear error instead.

## Assigned questions — answers

- Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting? → Use a junction on Windows and a symlink on POSIX, bridging to the primary `node_modules`, with reuse-if-correct idempotency and fail-fast on a broken primary; npm workspaces hoisting is not applicable (single package + N2). Source: https://continuumcode.ai/guides/git-worktree-node-modules/, https://docs.npmjs.com/cli/v9/using-npm/workspaces/

## Dead ends

- Migrating the repo to pnpm solely to enable worktrees — rejected; stack is pinned to npm/TypeScript 6.0.3 and the change would violate the no-regression constraint (SC5) for no benefit to verify sidecars.
- Symlinking a single shared `.browsers/` profile across sidecars — rejected; mutable profile state and concurrent browser locks would cross-contaminate (analogous to the Rust `CARGO_TARGET_DIR` lock trap).
- Using npm workspaces hoisting in sidecars — rejected; requires `npm install` in the sidecar (N2) and is meaningless for a single-package repo.