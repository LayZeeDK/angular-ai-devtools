---
id: T003
title: Move install scripts to user scope and repair tsconfig include
wave: 1
deps: [T001]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - scripts/install-angular-skills-command-code.mjs
  - scripts/install-gsd-path-command-code.mjs
  - scripts/install-gsd-path-command-code.test.mjs
  - scripts/install-mattpocock-skills-command-code.mjs
  - scripts/install-nx-skills-command-code.mjs
  - scripts/install-playwright-cli-command-code.mjs
  - scripts/install-pstack-command-code.mjs
  - scripts/install-pstack-opencode.mjs
  - scripts/install-pstack-opencode.test.mjs
  - tsconfig.json
---

# T003 — Move install scripts to user scope and repair tsconfig include

## Context

M008 moves all nine `install-*-command-code.mjs` scripts plus their tests out of `scripts/` into `~/.commandcode/scripts/`. The root `tsconfig.json` must stop referencing deleted `scripts/` paths and instead include the moved pstack installer, its test, and the retained in-repo `scripts/opencode-pstack-plugin.ts` cross-import target. The installer resolves its plugin template beside itself (`install-pstack-opencode.mjs:241`), so the cross-import target must survive the move: the template moves beside the installer while the repository keeps its copy as the declared source of truth.

## Approach

- Relocate all nine scripts and their tests (including `install-gsd-path-command-code.mjs` and its test, already patched in T001) to the user-scope scripts directory (`<home>/.commandcode/scripts/`), removing them from `scripts/`. `install-gsd-path-command-code.test.mjs` and `install-pstack-opencode.test.mjs` belong to the moved set and must move with their installers.
- Copy `scripts/opencode-pstack-plugin.ts` to the user-scope scripts directory beside the moved installer (same directory as `install-pstack-opencode.mjs`) so the moved installer keeps resolving its template beside itself (existing `fileURLToPath(new URL("opencode-pstack-plugin.ts", import.meta.url))` behavior). The in-repo copy at `scripts/opencode-pstack-plugin.ts` remains as the declared source of truth and is not deleted.
- Rewrite `tsconfig.json` `include` to the moved pstack installer and its test under the user profile plus the retained in-repo `scripts/opencode-pstack-plugin.ts`. Because neither `tsconfig.json` nor TypeScript expands `~`, use the absolute path form that TypeScript can resolve from the repository root on the `D:` drive to the user profile on the `C:` drive, e.g. `C:/Users/<user>/.commandcode/scripts/install-pstack-opencode.mjs` (forward slashes). No literal `~/.commandcode/...` may appear in `tsconfig.json`.
- No product or extension source changes. `AGENTS.md` needs no change: its only `scripts/` references (`scripts/sidecar-deps-bridge.mjs`, `scripts/skills-mirror.test.mjs`) stay in the repository.

## Interface contract

User-scope directory produced by T003 and consumed by T002:
- Path: `<home>/.commandcode/scripts/` (resolved at runtime via `os.homedir()`; never a literal `~`).
- Contents: the nine relocated install scripts and their tests, including `install-gsd-path-command-code.test.mjs` and `install-pstack-opencode.test.mjs`.
- Test discovery pattern: `**/*.test.mjs` applied under `<home>/.commandcode/scripts/`.

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. `npm run check` passes with `tsconfig.json` include pointing only at existing files, including the moved pstack installer under `~/.commandcode/scripts/` and the retained `scripts/opencode-pstack-plugin.ts`.
2. No stale `scripts/` references to moved installers remain in `tsconfig.json`.
3. The moved `install-pstack-opencode.mjs` still resolves its plugin template beside itself after the move (the template exists at `~/.commandcode/scripts/opencode-pstack-plugin.ts`), and the in-repo copy at `scripts/opencode-pstack-plugin.ts` remains.
4. The skills-mirror parity test passes.

## Verify

```bash
node --input-type=module -e "import {execSync} from 'node:child_process';import {bridgeSidecarDeps,unlinkSidecarDeps} from 'file:///D:/projects/sandbox/angular-ai-devtools/scripts/sidecar-deps-bridge.mjs';bridgeSidecarDeps('.','D:/projects/sandbox/angular-ai-devtools');try{execSync('npx tsc -p tsconfig.json',{stdio:'inherit'});execSync('npm run check:skills',{stdio:'inherit'});execSync('node --experimental-strip-types --test scripts/skills-mirror.test.mjs',{stdio:'inherit'});}finally{unlinkSidecarDeps('.');}"
```

Heavy: no

## Log

- created by planner
- 2026-10-28 — orchestrator plan-defect repair: the Verify now bridges the fresh verify sidecar's node_modules from the primary worktree for the duration of the check and always tears the junction down (`scripts/sidecar-deps-bridge.mjs`), because a sidecar ships without `node_modules` and `types: ["node"]` plus `@opencode/plugin` resolution need it. The check itself is unchanged: root `tsc -p tsconfig.json`, `npm run check:skills`, and the skills-mirror parity test.
- 2026-10-28 — moved 9 install scripts/tests to C:/Users/LarsGyrupBrinkNielse/.commandcode/scripts/ (byte-identical); copied opencode-pstack-plugin.ts to user scope; tsconfig include updated to C:/Users/.../.commandcode/scripts/install-pstack-opencode.mjs + .test.mjs + scripts/opencode-pstack-plugin.ts; swept `scripts/install-` usage lines to `~/.commandcode/scripts/install-` in moved copies; no remaining `scripts/` self-refs in moved files. Verify: `npx tsc -p tsconfig.json && node --experimental-strip-types --test scripts/skills-mirror.test.mjs` → tsc exit 0, skills-mirror 2 pass 0 fail; second tsc run exit 0. Stale refs outside scope: package.json test glob still `scripts/**/*.test.mjs` (T002 owns); task-file/plan references to moved paths are historical.
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): fail, exit 1; output tail:
  ```
  error TS2688: Cannot find type definition file for 'node'.
    The file is in the program because:
      Entry point of type library 'node' specified in compilerOptions
  npm notice run npx
  npm notice run tsc -p tsconfig.json
  ```
- 2026-10-28 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  ✔ .claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers (6.575ms)
  ✔ .claude/skills/verify-ai-browsers mirrors .commandcode/skills/verify-ai-browsers (1.8184ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 127.4615
  npm notice run npx
  npm notice run tsc -p tsconfig.json
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  ```
