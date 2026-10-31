---
id: T005
title: Apply the eleven ruled alignment-queue fix-doc rows
wave: 3
deps: [T001, T006]
status: pending
agent: null
base: null
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
  - .commandcode/taste/angular/taste.md
  - scripts/doc-fix-alignment.test.mjs
---

# T005 — Apply the eleven ruled alignment-queue fix-doc rows

## Context

The alignment queue holds ruled `fix-doc` rows never worked and still in the queue: 4, 5, 32, 36, 82, 83, 84, 183, 220, 386, 540. Rulings: error-explainer module/component names follow code (4, 5, 83, 84); Angular DevTools is 1.22.1 (32, 36); features index lists the three shipped feature docs (82); `nx format:write` not `nx format --fix` (183); panel is the built Angular app, vanilla panel files legacy (220); cited control.mjs line number moved (386); Signal Forms superseded Reactive Forms rows (540). Each row's `planned` value in DOCS-AUDIT.md is set to T005.

## Approach

- Apply each ruling to both `.commandcode` and `.claude` copies where the stale claim appears; row 220 lives in the taste tree and is edited here as a documentation correction under this milestone.
- Re-run the audit's claim check against the corrected text for every applied row.
- Keep the skills-mirror parity for `control-ai-browsers` and `verify-ai-browsers` green (AGENTS.md).

## Interface contract

None

## Intent coverage

- SC3

## Acceptance criteria

1. Rows 4, 5, 83, 84: error-explainer docs name `error-explainer.component.ts`, not stale names.
2. Rows 32, 36: `control-angular-devtools` SKILL.md and install.md state 1.22.1.
3. Row 82: features README lists `di-doctor.md`, `error-explainer.md`, `signal-provenance.md`.
4. Row 183: `nx-generate/SKILL.md` states `nx format:write`.
5. Rows 220, 386, 540: corrected per their rulings, with the affected path named.
6. `scripts/doc-fix-alignment.test.mjs` passes.

## Verify

```bash
node --test scripts/doc-fix-alignment.test.mjs
```

Heavy: no

## Log

- created by planner