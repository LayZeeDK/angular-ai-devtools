---
id: T008
title: Add the stale-view drive to the control-ai-browsers panel driver
wave: 4
deps: [T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/scripts/panel.mjs
  - .claude/skills/control-ai-browsers/scripts/panel.mjs
  - .commandcode/skills/control-ai-browsers/features/stale-view.md
  - .claude/skills/control-ai-browsers/features/stale-view.md
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

## Verify

```bash
node --test scripts/stale-view-panel-drive.test.mjs scripts/skills-mirror.test.mjs
```

Heavy: no

## Log

- created by build repair (2026-10-30): T006 recorded all four pairs could-not-run because the panel driver has no `stale-view` feature
