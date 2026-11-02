# AGENTS.md

Rules for agents working in this repository. Each rule is one line; the reference it points to holds the detail.
Read a reference only when the task touches it.

## Toolchain

- TypeScript is pinned to 6.0.x (`package.json`). If `npm run check` fails with errors no change explains, check
  `node_modules/typescript/package.json`: a 7.x there means a stale install; run `npm ci`.
- Checks: `npm run check` (type check, root and skills) and `npm test` (node:test, root and skills).
- Nx CLI entry for this install: `node_modules/nx/dist/bin/nx.js` (Nx 23); invoke via `node` or `npx nx`.
- GSD Path helpers: call `%USERPROFILE%\.commandcode\gsd.bat <verb>` (it runs `scripts/gsd/gsd.ts`). The `gsd`
  shim on PATH is a different global install whose `dist/loader.js` is missing, so bare `gsd <verb>` fails.

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
- `edge-dev-aion` runs with `--disable-component-update` and a pin of model 2026.10.15.1, runtime 2026.10.12.1 and
  manifest 2026.10.19.1 (measured 2026-10-30 on Edge Dev 158.0.4357.0: doctor exit 0, canaries 2-4 s). The earlier
  2026.10.2.1 pin could not generate on 158 and wedged a renderer, so do not restore it. Keep the switch, and prove a
  newer pair on a throwaway copy of the profile first: `references/edge-dev-aion-model.md`.
- Running the `state` and `extension-panel` verdicts (cost, timeouts, known hangs, coordinating with other sessions):
  `references/ai-browsers-verification.md`.

## Verification fixtures

- Panel verification runs against pages served by `control-angular-dev-app`. The counter app (`spikes/ng222-app`)
  carries a dev-only `stale-view` route (`src/app/stale-view-fixture.ts`, owner ruling 2026-10-30) so N24's claim is
  producible; adding another such route is a fixture change and needs a ruling of the same kind.
- The interop claim (N25) is producible from this repository. `spikes/ng222-app/src/app/stale-view-fixture.ts`
  (owner ruling 2026-10-30) holds both halves N25 needs: `toSignal(this.subject)` at line 14 and an unlabelled
  `effect` whose body calls `subject.error(...)` at line 22, served at `/stale-view` (and `/stale-view-deferred`
  for the capturable slice). The recorded source is `spikes/ng222-app`; the portal is not required.
- The interop verification is prepared, its logic proven, and its live run owed:
  `control-ai-browsers/features/interop.md`, `panel --feature=interop` (the driver pushes `/panel/interop`,
  `scripts/panel.mjs:246`), and `verify-ai-browsers/checks/interop.mjs` (10 tests, green 2026-11-01:
  `node --test .commandcode/skills/verify-ai-browsers/checks/interop.test.mjs` reports `tests 10`, `pass 10`). The app serves
  the route (`apps/angular-ai-devtools/src/app/app.routes.ts:15`), so the check's route assertion passes as soon as an
  instance runs the built panel. Measured 2026-10-31: check exits 0 on `edge-dev-aion` with `nodes: 1`, verdict `verified`
  (2/2), evidence `.project/build/verify/interop/`.

- **Every milestone runs unattended.** The owner's standing instruction: "A fresh session should
  be able to run `/gsd-path @ ~/.commandcode/prompts/deepseek-v4_1-flash-gsd-path-orchestrator.prompt.md`
  to complete the next milestone end-to-end without a human-in-the-loop, with full milestone
  decision authority." It applies to every milestone in this program, not to one of them. At each
  milestone's first legal boundary — `inspect/active` or `define/active` with `STATE.milestone:
  null` — record the grant once with `gsd.bat preapprove --repo <root> --grant
  intent,plan,rulings,ship`, quoting that instruction whenever a ruling is recorded as delegated.
  `STATE.milestone` must still be null at that moment: only `milestone intent approved` names it,
  so never set it in the next-milestone transition. Do not stop for the intent gate, the plan gate,
  a prohibition, an edge, a `NEEDS-USER` row, or ship approval; stop only at a helper failure, a
  contradiction the evidence cannot settle, or two identical failures.

- **Subagent dispatch uses the paid ladder, never the free one.** The owner's instruction: "Use
  paid-* subagents instead of free-*" and "Plan the most cost-effective paid model for each
  subagent task." `.project/model-policy.json` carries the per-role table; the cost arithmetic and
  the role mapping are in `~/.commandcode/references/paid-model-plan.md`. DeepSeek V4.1 Flash for
  every tool-loop role, because its cache read is ten times cheaper; GLM-5.3 Flash for `reviewer`,
  `skeptic` and `review_panel`, because an independent verdict may not share the parent's family.
  Re-read that plan before changing a role's model.

- **Skill timing is recorded, not discovered.** `~/.commandcode/references/gsd-path-skill-timing.md`
  is authoritative for when a `lars-*` or pstack skill runs in a milestone and what artifact it
  must leave: `lars-verify` before a wave review, `lars-review` after the canonical review,
  `lars-maintain-verification` only on drift and as a declared task, `lars-create-verification`
  only at define.

## Control skills

- Every `control-*` skill stops processes through its byte copy of `proctree.mjs`; never kill by process name.
- A process the run did not start (another program now holding a recorded PID, a port holder) is printed by PID,
  image name and start time only, never by command line, which can carry a secret.

## GSD Path

GSD Path workflow rules and lessons learned live in the user-scope
`~/AGENTS.md` (`## GSD Path` section). Detailed progressive-disclosure
docs are in `~/.commandcode/references/gsd-path-notes.md`.
