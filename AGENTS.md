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

- Drive the browsers only through the `control-ai-browsers` skill; each instance runs in its own profile under
  `.browsers/` (git-ignored). Never start, stop or touch a browser profile outside `.browsers/`.
- `edge-dev-aion` is pinned to Aion model and runtime 2026.10.2.1 on purpose. Do not remove
  `--disable-component-update` or replace the pinned folders until a newer pair is proven to serve, and test that
  only on a throwaway copy of the profile: `references/edge-dev-aion-model.md`.
- Running the four-instance `state` verdict (cost, timeouts, known hangs, coordinating with other sessions):
  `references/ai-browsers-verification.md`.

## Control skills

- Every `control-*` skill stops processes through its byte copy of `proctree.mjs`; never kill by process name.
- A process the run did not start (another program now holding a recorded PID, a port holder) is printed by PID,
  image name and start time only, never by command line, which can carry a secret.
