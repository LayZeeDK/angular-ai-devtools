# Evidence — stack

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: stack
Questions assigned: Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting?

## Finding: npm workspaces hoisting cannot bridge into an ephemeral sidecar without running npm install

- **Claim**: npm workspaces requires a root `package.json` declaring `"workspaces"` and an `npm install` run from that root to hoist/symlink dependencies; it cannot attach dependencies to an arbitrary external checkout (git worktree sidecar) without installing.
- **Source**: https://codebookcentral.com/npm-workspaces-monorepo-guide/ ; https://salivity.github.io/javascript/article/guide-to-npm-workspaces-for-java-script-monorepos
- **Confidence**: high
- **Why it matters here**: Sidecars are separate git worktrees with their own `package.json` and no `node_modules`; intent prohibition N2 forbids `npm install` in sidecars, so workspaces hoisting is infeasible for this design.

## Finding: npm workspaces on Windows creates junctions, inheriting junction tooling pitfalls

- **Claim**: On Windows, npm's workspaces feature creates junctions (not symlinks) in `node_modules`, and junctions are Windows-only abstractions that archive/tooling frequently mishandle (e.g. infinite loops when archiving self-referential junctions).
- **Source**: https://github.com/npm/cli/issues/5189
- **Confidence**: high
- **Why it matters here**: Even if workspaces were viable, it would still produce junctions on the project's Windows environment, so it offers no cross-platform advantage over an explicit junction bridge, while adding install/network cost.

## Finding: Node fs.symlinkSync supports 'junction' type on Windows without elevated permissions

- **Claim**: `fs.symlinkSync(target, path, 'junction')` creates a Windows directory junction without Administrator or Developer Mode privileges, whereas regular symlinks on Windows require the "Create symbolic links" permission.
- **Source**: https://nodejs.org/api/fs.html (fs.symlinkSync type param, junction); https://github.com/ehmicky/cross-platform-node-guide/blob/main/docs/3_filesystem/symlinks.md
- **Confidence**: high
- **Why it matters here**: The bridge can be implemented in the project's Node/ESM installers (`scripts/*.mjs`) using `node:fs` with type `'junction'` on `process.platform === 'win32'` and `'dir'` (symlink) elsewhere, with no permission or network dependency.

## Finding: Windows junctions require an absolute target path

- **Claim**: A directory junction on Windows stores an absolute target path, so the bridge must resolve the primary worktree's `node_modules` to an absolute path before creating the link.
- **Source**: https://www.tutorialspoint.com/nodejs/nodejs_quick_guide.htm (junction absolute path note); https://www.npmjs.com/package/symlink-dir (junction semantics)
- **Confidence**: medium
- **Why it matters here**: The implementation must use `path.resolve(primaryRoot, 'node_modules')` as the link target; relative targets would produce broken junctions.

## Finding: Idempotent reuse and fail-fast preconditions are required by the intent edges

- **Claim**: The existing AGENTS.md manual procedure (`mklink /J <sidecar>\node_modules <primary>\node_modules`, remove before retire) already encodes the correct lifecycle; automating it must preserve idempotent reuse when the link exists and points at the correct target (E1), and fail fast with a clear error when the primary `node_modules` is missing (E2).
- **Source**: D:\projects\sandbox\angular-ai-devtools\AGENTS.md (Verify sidecar dependencies section); D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (edges E1, E2, N1, N2)
- **Confidence**: high
- **Why it matters here**: Automation must not change semantics: reuse-if-correct, no npm install, and never touch/delete the primary `node_modules` during retire.

## Finding: Copying node_modules is not a viable fallback

- **Claim**: Copying the primary `node_modules` into a sidecar would duplicate a very large dependency tree (and risk TypeScript 6.0.3 vs stale 7.x drift) without any install, offering no advantage over a link while wasting disk and breaking the "no mutation of source" constraint.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (TypeScript pin load-bearing; node_modules absent in sidecar); D:\projects\sandbox\angular-ai-devtools\AGENTS.md (stale 7.x install breaks check)
- **Confidence**: medium
- **Why it matters here**: Rules out the only other zero-network alternative; confirms the link-based bridge as the only practical approach.

## Assigned questions — answers

- Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting? → Use a junction on Windows (`fs.symlinkSync(..., 'junction')`) and a directory symlink on POSIX (`fs.symlinkSync(..., 'dir')`), with absolute target paths, idempotent reuse, and fail-fast when the primary `node_modules` is missing. npm workspaces hoisting is not viable: it requires `npm install` (prohibited by N2) and a root workspaces declaration, and on Windows it creates junctions anyway (npm/cli#5189), so it provides no benefit. Keep the manual `mklink /J` procedure working for backward compatibility (N3).

## Dead ends

- npm workspaces hoisting — requires `npm install` and a root workspaces manifest; cannot bridge into ephemeral worktree sidecars; produces junctions on Windows anyway (npm/cli#5189). Dead end.
- Copying `node_modules` into sidecar — large disk cost and version-drift risk; no benefit over a link. Dead end.
- Regular POSIX-style symlinks on Windows (`type: 'file'`/default) — require "Create symbolic links" permission; non-admins fail with EPERM. Use junction fallback instead. Dead end.
- Hard links for directories — not supported on Windows/POSIX for directories. Dead end.