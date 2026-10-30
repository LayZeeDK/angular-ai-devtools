---
id: T002
title: Apply the accepted doc-fix alignment rows from DOCS-AUDIT
wave: 1
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/features/error-explainer.md
  - .claude/skills/control-ai-browsers/features/error-explainer.md
  - .commandcode/skills/control-ai-browsers/SKILL.md
  - .claude/skills/control-ai-browsers/SKILL.md
  - .commandcode/skills/control-ai-browsers/features/install.md
  - .claude/skills/control-ai-browsers/features/install.md
  - .commandcode/skills/control-ai-browsers/features/README.md
  - .claude/skills/control-ai-browsers/features/README.md
  - .commandcode/skills/nx-generate/SKILL.md
  - docs/design/tutor.md
  - scripts/doc-fix-alignment.test.mjs
---

# T002 — Apply the accepted doc-fix alignment rows from DOCS-AUDIT

## Context

The owner accepted nine `fix-doc` rows in `DOCS-AUDIT.md` `## User rulings` (queue #4, #5, #32, #36, #82, #83, #84, #183, #220). Each correction makes the doc match the code: error-explainer module/component names are `error-explainer.component.ts` (not `error-explainer.service.ts`/`n4-error-explainer.component.ts`); Angular DevTools is 1.22.1 (not 1.22.0); the features index lists `di-doctor.md`, `error-explainer.md`, `signal-provenance.md`; `nx format:write` (not `nx format --fix`); and the panel is the built Angular app (the vanilla files are legacy output). Each correction is proven by re-running the audit's claim check, not assumed.

## Approach

- Apply each accepted ruling to both the `.commandcode` and `.claude` copies where the stale claim appears.
- Re-run the audit's claim check against the corrected text for every row (grep-level: no `error-explainer.service.ts`/`n4-error-explainer.component.ts` stale names; no `1.22.0`; features index contains the three feature files; no `nx format --fix`; tutor.md states the panel is the built Angular app).
- Do not touch the `accept-drift` rows (310, 311, 319, 320); they remain dated measurements.
- Judgment prohibition N1/N2 etc. are N24 concerns and do not apply here.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `error-explainer.md` (both copies) names `error-explainer.component.ts` and no longer names `error-explainer.service.ts` or `n4-error-explainer.component.ts` (#4, #5, #83, #84).
2. `SKILL.md` and `install.md` (both copies) state Angular DevTools 1.22.1, not 1.22.0 (#32, #36).
3. `features/README.md` (both copies) lists `di-doctor.md`, `error-explainer.md` and `signal-provenance.md` (#82).
4. `nx-generate/SKILL.md` states `nx format:write`, not `nx format --fix` (#183).
5. `docs/design/tutor.md` states the panel is the built Angular app and the vanilla files are legacy output (#220).
6. Each correction is proven by re-running the audit's claim check against the corrected text.

## Verify

```bash
node --test scripts/doc-fix-alignment.test.mjs
```
Heavy: no

## Log

- created by planner