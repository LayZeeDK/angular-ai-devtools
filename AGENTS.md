# AGENTS.md

Rules for agents working in this repository. Each rule is one line; the reference it points to holds the detail.
Read a reference only when the task touches it.

## Toolchain

- TypeScript is pinned to 6.0.x (`package.json`). If `npm run check` fails with errors no change explains, check
  `node_modules/typescript/package.json`: a 7.x there means a stale install; run `npm ci`.
- Checks: `npm run check` (type check, root and skills) and `npm test` (node:test, root and skills).

### Verify sidecar dependencies

Verify sidecars created by `isolation.py isolate-verify` ship without `node_modules`, so `npm run check`
fails with TS2688 unless dependencies are bridged from the primary worktree. The automatic bridge
(`scripts/sidecar-deps-bridge.mjs`) now creates and removes the junction for you when running checks in
a sidecar, so no manual step is needed in the common case. For legacy sidecars the manual junction
procedure still works: create a directory junction from the sidecar to the primary `node_modules`, run
`npm run check`, then remove the junction. Windows command: `mklink /J <sidecar>\node_modules <primary>\node_modules`.
The junction must be removed before retiring the sidecar (`isolation.py retire --force` clears stale
sidecars, including worktree and branch).

## Browsers and on-device models

- Drive the browsers only through the `control-ai-browsers` skill; each instance runs in its own profile under the
  primary checkout's `.commandcode/worktrees/.browsers/` (git-ignored). Never start, stop or touch a browser profile
  outside it.
- Launch an instance profile only through `control-ai-browsers up`, never by hand: Edge then signs Lars's Windows
  work account in and syncs it. The Edge sign-in switches are browser-level in `instances.json`; `up` and doctor
  refuse a profile that holds an account.
- The instances and their models are shared by every checkout: a worktree or GSD Path sidecar runs `up`, gets
  `alreadyRunning`, and must not wait for or start a model download. A model missing from a shared profile is a
  bug to fix in the skill, not an environment blocker (`.commandcode/skills/control-ai-browsers/SKILL.md`, Gotchas).
- Every instance loads `extension/`. Run `npx nx run angular-ai-devtools:build-extension` before `up`, and prove the
  extension's Prompt API feature with `control-ai-browsers panel <name> --url=<app>` or `verify-ai-browsers`
  `checks/extension-panel.mjs`.
- `.commandcode/skills/` is the maintained copy of the `control-*` and `verify-*` skills. `control-ai-browsers` and
  `verify-ai-browsers` drive shared instances, so `.claude/skills/` holds byte copies of them; after changing one,
  copy its `.commandcode` folder over the `.claude` one (`scripts/skills-mirror.test.mjs` fails until you do). The
  other `.claude/skills/` folders are older copies, not kept in step. `npm test` and `npm run check` cover both trees.
- `edge-dev-aion` is pinned to Aion model and runtime 2026.10.2.1 on purpose. Do not remove
  `--disable-component-update` or replace the pinned folders until a newer pair is proven to serve, and test that
  only on a throwaway copy of the profile: `references/edge-dev-aion-model.md`.
- Running the `state` and `extension-panel` verdicts (cost, timeouts, known hangs, coordinating with other sessions):
  `references/ai-browsers-verification.md`.

## Control skills

- Every `control-*` skill stops processes through its byte copy of `proctree.mjs`; never kill by process name.
- A process the run did not start (another program now holding a recorded PID, a port holder) is printed by PID,
  image name and start time only, never by command line, which can carry a secret.

## GSD Path

GSD Path workflow rules and lessons learned live in the user-scope
`~/AGENTS.md` (`## GSD Path` section). Detailed progressive-disclosure
docs are in `~/.commandcode/references/gsd-path-notes.md`.
