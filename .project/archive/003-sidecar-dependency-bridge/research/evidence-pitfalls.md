# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting?

## Finding: Junctions are reparse points that many delete commands follow into their target

- **Claim**: A directory junction (`mklink /J`) is an NTFS reparse point; several common cleanup commands (old `git worktree remove`, `rm -rf <junction>/` with a trailing separator, `rmdir /s /q <junction>\`, `del /s` on a link) descend into it and delete the target's contents instead of unlinking the link.
- **Source**: https://yaw.sh/blog/git-worktree-remove-junction-node-modules/ (probe table); https://learn.microsoft.com/en-us/windows/win32/fileio/hard-links-and-junctions
- **Confidence**: high
- **Why it matters here**: The retire path runs `git worktree remove`/recursive deletes around a sidecar whose `node_modules` is a junction to the primary's; without unlinking the reparse point first, retire can gut the primary `node_modules` (prohibition N1).

## Finding: Git for Windows < 2.54 deletes through a junction in `git worktree remove`

- **Claim**: `git worktree remove` treated a junction as an ordinary directory until Git for Windows 2.54.0 (2026-04-20); on 2.53.x it emptied the junction's target, while a directory symlink was unlinked safely even on 2.53. On >=2.54 it leaves the junction (and target) alone but does not unlink the junction either.
- **Source**: https://yaw.sh/blog/git-worktree-remove-junction-node-modules/ ("Why Git Deleted Through a Junction")
- **Confidence**: high
- **Why it matters here**: The orchestrator's `isolation.py retire --force` may invoke git worktree removal; the bridge must unlink the junction before retire, and must not assume retire unlinks it, or the primary toolchain is destroyed.

## Finding: Safe teardown requires unlinking the reparse point before any recursive delete or worktree removal

- **Claim**: Unlinking with a non-recursive directory delete (`[System.IO.Directory]::Delete(path, $false)` on Windows, `fs.rmSync(path, { recursive: false })` / `rmdir` without `/s` on POSIX) removes only the link; `symlink_metadata().file_type().is_symlink()` is true for junctions, so the same check covers both platforms.
- **Source**: https://github.com/zekariasasaminew/pact/issues/283 (safety finding); https://yaw.sh/blog/git-worktree-remove-junction-node-modules/ ("How to Remove a Worktree That Has a Junction")
- **Confidence**: high
- **Why it matters here**: Edge E1/E5 require idempotent reuse and clean re-runs; the bridge must record linked paths and unlink them defensively before retire, matching pact-deps' accepted design.

## Finding: Trailing separators change junction handling from unlink to target deletion

- **Claim**: `rm -rf node_modules` unlinks a junction, but `rm -rf node_modules/` (trailing slash) empties its target and exits 0 with no error; `rm -r`/`find` empty the target then fail with "Not a directory" only after the damage.
- **Source**: https://yaw.sh/blog/git-worktree-remove-junction-node-modules/ (probe table)
- **Confidence**: high
- **Why it matters here**: Cleanup scripts and agents must never normalize or append separators to the bridge path; a single trailing slash turns a safe unlink into primary `node_modules` loss.

## Finding: npm workspaces is a same-root multi-package mechanism, not a cross-worktree dependency bridge

- **Claim**: npm workspaces symlink nested packages into a single root `node_modules` during `npm install` within one repository root; they do not provide a zero-install bridge between a primary checkout and a separate git worktree/sidecar, and using them would require `npm install`/`npm ci` in the sidecar.
- **Source**: https://docs.npmjs.com/cli/v10/using-npm/workspaces
- **Confidence**: high
- **Why it matters here**: Intent vetoes `npm install` in sidecars (N2) and requires zero manual steps; workspaces hoisting cannot satisfy SC1/SC2 and would add network/disk cost and lockfile churn.

## Finding: Hoisting introduces phantom-dependency and peer-dependency hazards

- **Claim**: Hoisting shared dependencies to a root `node_modules` can expose packages a workspace never declared (phantom dependencies) and create peer-dependency resolution mismatches; some toolchains (e.g. Turbopack) reject a `node_modules` that is a symlink pointing outside their configured root.
- **Source**: https://www.jonathancreamer.com/inside-the-pain-of-monorepos-and-hoisting/; https://github.com/zekariasasaminew/pact/issues/283 (Turbopack limitation)
- **Confidence**: medium
- **Why it matters here**: Even if workspaces were attempted, hoisting could mask missing direct dependencies or break tooling that assumes a real local `node_modules`, undermining the typecheck/test guarantees in SC1/SC2.

## Finding: The codebase already treats reparse points in browser profiles as unsafe

- **Claim**: `control-ai-browsers`' `reparseRefusal()` refuses profile folders that resolve through a junction/symlink, and `listing()` never follows links, because a linked profile can destroy or corrupt owned browser data.
- **Source**: `.commandcode/skills/control-ai-browsers/scripts/control.mjs` (`reparseRefusal`, `listing`, `refuseLinked`)
- **Confidence**: high
- **Why it matters here**: The same hazard applies to the dependency bridge: any recursive operation near a junction can damage the target, so the bridge must be an explicit, recorded, unlinked-before-retire reparse point rather than an implicit one.

## Finding: Relocating `.browsers/` and `tmp/` touches many hardcoded ROOT-relative paths

- **Claim**: Browser profiles and temp artifacts are derived from `ROOT = resolve(SKILL_DIR, '..', '..', '..')` (`PROFILES = ROOT/.browsers`, `TMP = ROOT/tmp/control-ai-browsers`), and `.gitignore` lists both `.browsers/` and `tmp/`; moving them requires updating every skill/control script and test that assumes those roots, plus gitignore entries for the new location.
- **Source**: `.commandcode/skills/control-ai-browsers/scripts/control.mjs` lines 92-97; `.gitignore`
- **Confidence**: high
- **Why it matters here**: Migration (SC4) must preserve ~9k browser + ~5k tmp files (N5) and keep every control skill's checks passing (SC3); a path sweep and one-time fallback read from the old location (edge E3) are required to avoid silently recreating empty artifact dirs.

## Assigned questions — answers

- Should the dependency bridge use a junction (Windows) / symlink (POSIX), or npm workspaces hoisting? → Use a junction (Windows) / symlink (POSIX) bridge from the sidecar `node_modules` to the primary `node_modules`, with recorded linked paths and unlink-before-retire; do not use npm workspaces hoisting. Junctions/symlinks satisfy zero-install (N2) and speed, while workspaces require install and introduce hoisting hazards. The junction must be unlinked (non-recursively) before `git worktree remove`/retire to avoid deleting the primary `node_modules`.

## Dead ends

- npm workspaces hoisting as a sidecar bridge — requires `npm install` in the sidecar (vetoes N2) and does not map to separate worktrees; dropped.
- Directory symlink (`mklink /D`) as the Windows default — safer for git but requires admin/Developer Mode; keep as optional fallback only, not the default.
- Relying on `git worktree remove` to unlink the junction — only safe on Git for Windows >=2.54 and even then leaves the junction behind; must unlink explicitly.