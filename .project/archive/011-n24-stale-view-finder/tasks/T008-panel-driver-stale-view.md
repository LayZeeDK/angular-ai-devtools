---
id: T008
title: Add the stale-view drive to the control-ai-browsers panel driver
wave: 4
deps: [T005]
status: done
agent: build_T008
base: 0544af3d08cd4df441ec959082655591545b48c1
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/panel.mjs
  - .claude/skills/control-ai-browsers/scripts/panel.mjs
  - .commandcode/skills/control-ai-browsers/features/stale-view.md
  - .claude/skills/control-ai-browsers/features/stale-view.md
  - .commandcode/skills/control-ai-browsers/features/README.md
  - .claude/skills/control-ai-browsers/features/README.md
  - scripts/stale-view-panel-drive.test.mjs
---

# T008 — Add the stale-view drive to the control-ai-browsers panel driver

## Context

T006's end-to-end verification could not run: `control-ai-browsers`' `panel` command implements only the `version` and `error-explainer` features, so there is no way to reach the `stale-view` panel surface from a model instance. Every one of the four supported pairs therefore records could-not-run, and SC5 stays unproven. The panel route and component already exist (`apps/angular-ai-devtools/src/app/stale-view.component.ts` at the `stale-view` route, landed by T005); only the driver path is missing. `.claude/skills/control-ai-browsers/` is a byte mirror of `.commandcode/skills/control-ai-browsers/` and `scripts/skills-mirror.test.mjs` enforces that.

## Approach

- Read `.commandcode/skills/control-ai-browsers/scripts/panel.mjs` and follow exactly how the `error-explainer` feature is implemented end to end (navigation to the route, the ready selector, the claim it returns, the JSON shape, exit codes).
- Add a `stale-view` feature in the same shape: navigate to the `stale-view` route, wait for the panel's finding list or its explicit empty state, and report the hedged wording "the template may show a stale value", the field name and the owning component in the same JSON shape the other features use. Keep exit semantics identical (pass, failed claim, could-not-run as exit 2 / no JSON).
- Mirror the change byte for byte into `.claude/skills/control-ai-browsers/scripts/panel.mjs`.
- Document the new feature in `features/stale-view.md` in both trees, following the structure of `features/error-explainer.md`.
- Add `scripts/stale-view-panel-drive.test.mjs` proving the driver accepts `--feature stale-view` and that its feature list includes it, without needing a live browser (follow how existing driver tests stub the panel HTML).

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `control-ai-browsers`' `panel` command accepts `--feature stale-view` and drives it with the same entry points, ready selector, JSON shape and exit codes as `error-explainer`.
2. The `.claude` copy is byte-identical to the `.commandcode` copy, proven by `node --test scripts/skills-mirror.test.mjs`.
3. `features/stale-view.md` documents the drive in both trees, matching the structure of `features/error-explainer.md`.
4. `node --test scripts/stale-view-panel-drive.test.mjs` proves the new feature is registered and its selector and wording are wired.
5. `features/README.md` (both copies) lists `stale-view.md` in its `## Features` index and its `## Full sweep` order, and — from the maintenance contract check of 2026-10-30 — also lists `di-doctor.md`, `error-explainer.md` and `signal-provenance.md` in `## Full sweep`, so `check-skill.mjs` reports no `full-sweep` failure.

## Verify

```bash
node --test scripts/stale-view-panel-drive.test.mjs scripts/skills-mirror.test.mjs
```

Heavy: no

## Log

- created by build repair (2026-10-30): T006 recorded all four pairs could-not-run because the panel driver has no `stale-view` feature
- implemented stale-view drive in panel.mjs (mirrored to .claude), features/stale-view.md both trees, README updates, test added; Verify `node --test scripts/stale-view-panel-drive.test.mjs scripts/skills-mirror.test.mjs` exit 0 (7 tests pass). ready
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T008): pass, exit 0; output tail:
  ```
  ✔ .claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers (7.5182ms)
  ✔ .claude/skills/verify-ai-browsers mirrors .commandcode/skills/verify-ai-browsers (1.9656ms)
  ✔ panel driver registers the stale-view feature (0.9327ms)
  ✔ panel driver routes to the stale-view panel route (0.0879ms)
  ✔ panel driver wires stale-view selectors (0.0746ms)
  ✔ stale-view component carries the hedged wording (0.2862ms)
  ✔ panel driver reads stale-view facts before explaining (0.1125ms)
  ℹ tests 7
  ℹ suites 0
  ℹ pass 7
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 153.3827
  ```
- 2026-10-30 — orchestrator regression Verify of T002 (isolate gsd-path-task/T008): pass, exit 0; output tail:
  ```
  ✔ error-explainer.md (both copies) names error-explainer.component.ts, not stale names (1.322ms)
  ✔ control-angular-devtools SKILL.md (both copies) states Angular DevTools 1.22.1 (0.3192ms)
  ✔ control-angular-devtools features/install.md (both copies) states Angular DevTools 1.22.1 (0.7926ms)
  ✔ control-ai-browsers features/README.md (both copies) lists di-doctor.md, error-explainer.md, signal-provenance.md (0.1811ms)
  ✔ nx-generate SKILL.md states nx format:write, not nx format --fix (0.1448ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 120.1229
  ```
