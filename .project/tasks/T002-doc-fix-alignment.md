---
id: T002
title: Apply the accepted doc-fix alignment rows from DOCS-AUDIT
wave: 1
deps: []
status: done
agent: build_T002
base: e1bdc96caa764d330a3d27d9b0d7529bde368f5b
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/features/error-explainer.md
  - .claude/skills/control-ai-browsers/features/error-explainer.md
  - .commandcode/skills/control-angular-devtools/SKILL.md
  - .claude/skills/control-angular-devtools/SKILL.md
  - .commandcode/skills/control-angular-devtools/features/install.md
  - .claude/skills/control-angular-devtools/features/install.md
  - .commandcode/skills/control-ai-browsers/features/README.md
  - .claude/skills/control-ai-browsers/features/README.md
  - .commandcode/skills/nx-generate/SKILL.md
  - scripts/doc-fix-alignment.test.mjs
---

# T002 — Apply the accepted doc-fix alignment rows from DOCS-AUDIT

## Context

The owner accepted nine `fix-doc` rows in `DOCS-AUDIT.md` `## User rulings` (queue #4, #5, #32, #36, #82, #83, #84, #183, #220). Eight are repaired here: error-explainer module/component names are `error-explainer.component.ts` (not `error-explainer.service.ts`/`n4-error-explainer.component.ts`); Angular DevTools is 1.22.1 (not 1.22.0); the features index lists `di-doctor.md`, `error-explainer.md`, `signal-provenance.md`; and `nx format:write` (not `nx format --fix`). Row #220 sits in the taste tree, which build must not edit, so it is deferred. Each applied correction is proven by re-running the audit's claim check, not assumed.

## Approach

- Apply each accepted ruling to both the `.commandcode` and `.claude` copies where the stale claim appears.
- Re-run the audit's claim check against the corrected text for every applied row (grep-level: no `error-explainer.service.ts`/`n4-error-explainer.component.ts` stale names; no `1.22.0`; features index contains the three feature files; no `nx format --fix`).
- Leave queue #220 alone: it targets `.commandcode/taste/angular/taste.md`, and a build task never edits the taste tree. Its row stays `planned: no` for the post-ship commit.
- Do not touch the `accept-drift` rows (310, 311, 319, 320); they remain dated measurements.
- Judgment prohibition N1/N2 etc. are N24 concerns and do not apply here.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `features/error-explainer.md` in both the `.commandcode` and `.claude` copies names `error-explainer.component.ts` and no longer names `error-explainer.service.ts` or `n4-error-explainer.component.ts` (#4, #5, #83, #84).
2. `control-angular-devtools/SKILL.md` and `control-angular-devtools/features/install.md` in both copies state Angular DevTools 1.22.1, not 1.22.0 (#32, #36).
3. `control-ai-browsers/features/README.md` in both copies lists `di-doctor.md`, `error-explainer.md` and `signal-provenance.md` (#82).
4. `.commandcode/skills/nx-generate/SKILL.md` states `nx format:write`, not `nx format --fix` (#183).
5. Queue #220 is recorded as deferred, not silently dropped: its claim lives in `.commandcode/taste/angular/taste.md`, which a build task must not edit, so the row stays `planned: no` for a post-ship commit.
6. Each applied correction is proven by re-running the audit's claim check against the corrected text.

## Verify

```bash
node --test scripts/doc-fix-alignment.test.mjs
```
Heavy: no

## Log

- created by planner
- T002 coder: applied fix-doc rows (#4,#5,#32,#36,#82,#83,#84,#183); #220 deferred (taste tree untouched). Files updated per contract. Verify command: `node --test scripts/doc-fix-alignment.test.mjs` (cwd worktree). Output tail:
  ✔ error-explainer.md (both copies) names error-explainer.component.ts, not stale names
  ✔ control-angular-devtools SKILL.md (both copies) states Angular DevTools 1.22.1
  ✔ control-angular-devtools features/install.md (both copies) states Angular DevTools 1.22.1
  ✔ control-ai-browsers features/README.md (both copies) lists di-doctor.md, error-explainer.md, signal-provenance.md
  ✔ nx-generate SKILL.md states nx format:write, not nx format --fix
  tests 5, pass 5, fail 0
- 2026-10-30 — orchestrator Verify (isolate gsd-path-task/T002): pass, exit 0; output tail:
  ```
  ✔ error-explainer.md (both copies) names error-explainer.component.ts, not stale names (1.5677ms)
  ✔ control-angular-devtools SKILL.md (both copies) states Angular DevTools 1.22.1 (0.3251ms)
  ✔ control-angular-devtools features/install.md (both copies) states Angular DevTools 1.22.1 (0.8643ms)
  ✔ control-ai-browsers features/README.md (both copies) lists di-doctor.md, error-explainer.md, signal-provenance.md (0.2075ms)
  ✔ nx-generate SKILL.md states nx format:write, not nx format --fix (0.1668ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 130.702
  ```
