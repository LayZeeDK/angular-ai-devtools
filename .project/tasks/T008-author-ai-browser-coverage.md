---
id: T008
title: Author control-ai-browsers feature files and verify checks for signal provenance (N2) and the DI doctor (N3)
wave: 4
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-ai-browsers/features/signal-provenance.md
  - .commandcode/skills/control-ai-browsers/features/di-doctor.md
  - .commandcode/skills/verify-ai-browsers/checks/signal-provenance.mjs
  - .commandcode/skills/verify-ai-browsers/checks/signal-provenance.test.mjs
  - .commandcode/skills/verify-ai-browsers/checks/di-doctor.mjs
  - .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs
  - .commandcode/skills/verify-ai-browsers/SKILL.md
  - .commandcode/skills/control-ai-browsers/SKILL.md
  - .claude/skills/control-ai-browsers/features/signal-provenance.md
  - .claude/skills/control-ai-browsers/features/di-doctor.md
  - .claude/skills/control-ai-browsers/SKILL.md
  - .claude/skills/verify-ai-browsers/checks/signal-provenance.mjs
  - .claude/skills/verify-ai-browsers/checks/signal-provenance.test.mjs
  - .claude/skills/verify-ai-browsers/checks/di-doctor.mjs
  - .claude/skills/verify-ai-browsers/checks/di-doctor.test.mjs
  - .claude/skills/verify-ai-browsers/SKILL.md
---

# T008 — Author control-ai-browsers feature files and verify checks for signal provenance (N2) and the DI doctor (N3)

## Context

SC2: `npm run check` and `npm test` pass with no skipped tests, and the skills-mirror parity test passes. SC3: the N1, N2 and N3 flows still answer in the DevTools panel on all four supported model pairs. T007 is blocked on a coverage gap: `.commandcode/skills/control-ai-browsers/features/` has no feature file for signal provenance (N2) or the DI doctor (N3), so `lars-verify` reports `inconclusive` naming the map gap instead of `verified`/`unverifiable`. Owner ruling 1a approves authoring both flows' coverage via `lars-maintain-verification` conventions. N3 (SC3): the panel stays panel-local Prompt API.

## Approach

- Follow `lars-maintain-verification` conventions: one feature file per flow under `.commandcode/skills/control-ai-browsers/features/`, naming sub-features, user POV, how to drive with `control-ai-browsers` (`panel`/`run <name> <file.js>` surface), and gotchas.
- Add the matching `verify-ai-browsers` checks (`.mjs` plus `.test.mjs`), each header comment stating the claim and naming its feature file and sub-feature, following the shape of `extension-panel.mjs`/`extension-panel.test.mjs`.
- Update the `verify-ai-browsers` SKILL.md Checks table and `control-ai-browsers` SKILL.md to list the new checks/commands.
- Mirror the whole `.commandcode/skills/{control-ai-browsers,verify-ai-browsers}` folders to `.claude/skills/` per the byte-copy parity rule; `scripts/skills-mirror.test.mjs` must pass.
- Verify proves the new coverage exists and is mirrored: `npm ci && npm test` (which runs `scripts/skills-mirror.test.mjs`) and a node:test run naming an owned check file.

## Interface contract

None

## Intent coverage

- SC2

## Acceptance criteria

1. Feature files exist for signal provenance (N2) and the DI doctor (N3) with sub-features, user POV, driving commands, and gotchas.
2. Matching `.mjs` checks and `.test.mjs` tests exist, each check header comment stating the claim and naming its feature file/sub-feature.
3. SKILL.md tables list the new checks/commands in both maintained and mirrored copies.
4. `.claude/skills/` is byte-identical to `.commandcode/skills/` for both skills (mirror test passes).
5. `npm run check` and `npm test` pass with no skipped tests.

## Verify

```bash
npm ci && npm run check && npm test && node --test .commandcode/skills/verify-ai-browsers/checks/signal-provenance.test.mjs .commandcode/skills/verify-ai-browsers/checks/di-doctor.test.mjs
```

Heavy: yes

## Log

- created by planner