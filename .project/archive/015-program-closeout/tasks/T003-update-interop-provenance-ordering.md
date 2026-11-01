---
id: T003
title: Prove the interop claim live and record its provenance at this head
wave: 2
deps:
  - T001
status: done
agent: build_T003
base: ca73bb18c758626e24416d7e7e7534d7616972e9
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/SKILL.md
  - .claude/skills/verify-ai-browsers/SKILL.md
  - .commandcode/skills/control-ai-browsers/features/.proven.json
  - .claude/skills/control-ai-browsers/features/.proven.json
  - .project/build/verify/interop/interop.json
  - .project/build/verify/interop/verdict.json
---

# T003 — Prove the interop claim live and record its provenance at this head

## Context

INTENT SC2 requires the `verify-ai-browsers` interop row to name `spikes/ng222-app`'s `/stale-view-deferred` fixture, its fingerprint to read fresh at the milestone head, and the interop check to exit 0 on a named instance with a committed verdict of `verified`. Commit `2c97f69` already repointed the row and the check; measured at `01bffa9`, `node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs check --feature interop` prints `[OK] interop: fresh since 5f1612599621`, and the recorded entries are `apps/angular-ai-devtools/src/app/interop.component.ts` and `src/main-world/interop-keep-list.ts`. What has never happened at this head is the live run.

The check's own header gives the contract: `node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence <dir> --url <app url> [instance...]`, where the URL serves `/stale-view-deferred`; it writes `<dir>/interop.json`; exit 0 pass, 1 `Error: CLAIM: ...`, 2 could-not-run. `spikes/ng222-app` ships its own `ng` CLI and start script, so serve it from its own folder. Bring an instance up through `control-ai-browsers` only (`up`, never by hand), and pass `--extension` so a sidecar proves its own build.

Prohibitions that bind this task: N3 — the interop check's assertions stay byte-identical; only the fixture route it drives may differ. A diff to any assertion is a scope breach.

## Approach

- Confirm the row in both `verify-ai-browsers` trees names `spikes/ng222-app`'s `/stale-view-deferred`; the two trees are byte-identical and must stay so.
- Build the extension and serve the fixture, then run the check with `--evidence .project/build/verify/interop --url http://localhost:<port>/stale-view-deferred <instance>`.
- Write `.project/build/verify/interop/verdict.json` recording exactly: `claim` (the interop claim in one line), `instance`, `command` (the check invocation), `exitCode`, `verdict` (`verified` only when exitCode is 0), and `evidence` (the relative path of `interop.json`). A could-not-run is recorded as `could-not-run` with its reason, never as `verified`.
- Re-run `fingerprint.mjs record --feature interop` only if the fingerprint check reports stale; if it is fresh, leave `.proven.json` untouched and record that it was already fresh.

## Interface contract

- None

## Intent coverage

- SC2

## Acceptance criteria

1. Both `verify-ai-browsers` `SKILL.md` trees name `spikes/ng222-app`'s `/stale-view-deferred` fixture for the `interop` row and remain byte-identical.
2. `fingerprint.mjs check --feature interop` exits 0 at this head, and `.proven.json` in both `control-ai-browsers` trees records the same `interop` entry.
3. `.commandcode/skills/verify-ai-browsers/checks/interop.mjs` ran against a named instance and `.project/build/verify/interop/interop.json` exists; its assertions were not modified (N3).
4. `.project/build/verify/interop/verdict.json` records `exitCode: 0`, `verdict: verified`, a non-empty `instance` and the evidence path.

## Verify

```bash
node -e "const fs=require('fs');const args=process.argv.slice(1);for(const f of args.filter((a)=>a.endsWith('SKILL.md'))){const t=fs.readFileSync(f,'utf8');if(!t.includes('/stale-view-deferred'))throw new Error(f+': interop row does not name /stale-view-deferred');}const proven=args.find((a)=>a.endsWith('.proven.json'));const manifest=JSON.parse(fs.readFileSync(proven,'utf8'));if(!manifest.features||!manifest.features.interop)throw new Error(proven+': no interop entry');const verdict=JSON.parse(fs.readFileSync(args.find((a)=>a.endsWith('verdict.json')),'utf8'));if(verdict.exitCode!==0||verdict.verdict!=='verified'||!verdict.instance)throw new Error('verdict.json does not record a verified live run: '+JSON.stringify(verdict));console.log('interop verified on',verdict.instance)" .commandcode/skills/verify-ai-browsers/SKILL.md .claude/skills/verify-ai-browsers/SKILL.md .commandcode/skills/control-ai-browsers/features/.proven.json .project/build/verify/interop/verdict.json && node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs check --feature interop
```

Heavy: yes

## Log

- 2026-11-01 — created by planner
- 2026-11-01 — orchestrator plan repair: the planner declared `.commandcode/skills/verify-ai-browsers/features/.proven.json`, which does not exist — the manifest lives beside the `control-ai-browsers` feature map, as `fingerprint.mjs` documents. Rewrote the task around the measured fingerprint result and the check's real usage line, and made the Verify assert the verdict and the row instead of running `node --check` on a JavaScript file the task does not own.
- 2026-11-01 — live interop proof at this head: both `verify-ai-browsers` trees already named `spikes/ng222-app`'s `/stale-view-deferred` for the `interop` row and stayed byte-identical (sha256 4df6cbb7bd85f053a949581843a67d0a79c0d9987a90dc52523ab6b241a8a412), and `fingerprint.mjs check --feature interop` reported `[OK] interop: fresh since 5f1612599621`, so `.proven.json` was left untouched. Bridged `node_modules` with `scripts/sidecar-deps-bridge.mjs`, built the panel with `npx nx run angular-ai-devtools:build-extension`, served `spikes/ng222-app` from its own folder with `npm start -- --port 4300 --host 127.0.0.1`, brought `chrome-beta-gemma4` up through `control-ai-browsers` with `--extension=<this worktree>/extension` (extension id `akmbadfffoafkmnbdbjjcfhkadfenmnb`), and ran `node .commandcode/skills/verify-ai-browsers/checks/interop.mjs --evidence .project/build/verify/interop --url http://localhost:4300/stale-view-deferred chrome-beta-gemma4`: exit 0, `interop.json` recording route `/panel/interop`, 1 slice node, the Observable/operator/emission limits, "inferred, untested", an answer in 10.2 s on gemma4-2b-it (GPU) and `state` pass. `verdict.json` written with `exitCode: 0`, `verdict: verified` and the evidence path; the instance was brought `down` (port free) and the app server stopped (port 4300 free). Verify exit 0 — ready
- 2026-11-01 — orchestrator Verify (isolate gsd-path-task/T003): pass, exit 0; output tail:
  ```
  interop verified on chrome-beta-gemma4
  [OK] interop: fresh since 5f1612599621
  ```
