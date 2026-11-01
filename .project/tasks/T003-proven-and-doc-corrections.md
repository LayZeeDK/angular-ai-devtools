---
id: T003
title: Re-record interop provenance and correct portal-required notes
wave: 3
deps: [T002]
status: done
agent: build_T003
base: 5f161259962150908d76de9f8b66ceea6e2ea567
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/features/.proven.json
  - .claude/skills/control-ai-browsers/features/.proven.json
  - .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs
  - .commandcode/skills/control-ai-browsers/features/interop.md
  - .claude/skills/control-ai-browsers/features/interop.md
  - .commandcode/skills/control-ai-browsers/features/README.md
  - .claude/skills/control-ai-browsers/features/README.md
  - AGENTS.md
  - references/ai-browsers-verification.md
  - references/edge-dev-aion-model.md
---

# T003 — Re-record interop provenance and correct portal-required notes

## Context

SC2 requires the claim's recorded source to be `spikes/ng222-app`'s `stale-view` fixture, with every note that says the portal is required corrected. SC3 requires `.commandcode/skills/control-ai-browsers/features/.proven.json` to record interop as proven at the shipped head, with the fingerprint check reporting it fresh. Binding decision 3 specifies the exact re-record command and entries.

## Approach

- Run the fingerprint re-record exactly as decided: `node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs record --feature interop --entries apps/angular-ai-devtools/src/app/interop.component.ts src/main-world/interop-keep-list.ts`, then `check --feature interop`, which must report fresh. Apply the same change to the `.claude/skills/` byte copy (N4).
- Correct the interop feature doc and README in both skills trees, plus `AGENTS.md`, `references/ai-browsers-verification.md` and `references/edge-dev-aion-model.md`, so the recorded source is the in-repo `spikes/ng222-app` stale-view route and the portal is no longer named as required (N5, E4).
- N3 (criterion SC3): do not mark interop proven without a fresh fingerprint; the re-recorded entry must be at the shipped head (E5).
- Do not touch `.project/archive/**`.

## Interface contract

- None

## Intent coverage

- SC2
- SC3

## Acceptance criteria

1. `.proven.json` contains an `interop` feature entry recorded at the shipped head using entries `apps/angular-ai-devtools/src/app/interop.component.ts` and `src/main-world/interop-keep-list.ts`, and `fingerprint.mjs check --feature interop` reports it fresh (SC3, E5).
2. `interop.md`, the skills README, `AGENTS.md`, `references/ai-browsers-verification.md` and `references/edge-dev-aion-model.md` name `spikes/ng222-app`'s stale-view route as the source and no longer state the portal is required (SC2, E4, N5).
3. Both skills trees remain byte-identical for the touched files (N4).

## Verify

```bash
node .commandcode/skills/control-ai-browsers/scripts/fingerprint.mjs check --feature interop
```

Heavy: no

## Log

- created by planner
- T003: touched `.commandcode/skills/control-ai-browsers/features/.proven.json`, `.claude/skills/control-ai-browsers/features/.proven.json`, `.commandcode/skills/control-ai-browsers/features/interop.md`, `.claude/skills/control-ai-browsers/features/interop.md`, `AGENTS.md`. Re-recorded interop fingerprint (written, typescript, 10 files, since 5f1612599621); corrected portal-as-required wording to `spikes/ng222-app` fixture routes. Verify: `fingerprint.mjs check --feature interop` -> `[OK] interop: fresh since 5f1612599621` (exit 0); `node --experimental-strip-types --test scripts/skills-mirror.test.mjs` -> 2 pass, 0 fail (exit 0). RESULT: ready
- 2026-11-01 — orchestrator Verify (sidecar gsd-path-verify/task-t003-verify): pass, exit 0; output tail:
  ```
  [OK] interop: fresh since 5f1612599621
  ```
