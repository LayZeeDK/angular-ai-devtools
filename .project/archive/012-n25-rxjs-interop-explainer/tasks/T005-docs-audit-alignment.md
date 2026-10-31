---
id: T005
title: Docs-audit alignment rows 386 and 540 (fix-doc)
wave: 3
deps: []
status: done
agent: build_T005
base: 9a098b35086c147d5d15c39c8dae7de90cac8067
worktree: null
task_branch: null
files:
  - .commandcode/skills/control-angular-dev-app/SKILL.md
  - .claude/skills/control-angular-dev-app/SKILL.md
  - .project/research/13-portal-legacy-audit.md
  - scripts/skills-mirror.test.mjs
---

# T005 — Docs-audit alignment rows 386 and 540 (fix-doc)

## Context

Two accepted docs-audit alignment rows are `fix-doc`: row 386 (control.mjs line number in `.commandcode/skills/control-angular-dev-app/SKILL.md`) and row 540 (Reactive Forms claim in `research/13-portal-legacy-audit.md`, superseded by Signal Forms). Apply the exact doc fixes so the audit rows are resolved; the audit rulings are already recorded (`fix-doc` for both) in DOCS-AUDIT.md `## User rulings`.

## Approach

- Row 386: in `.commandcode/skills/control-angular-dev-app/SKILL.md`, correct the `control.mjs` line number citation to the actual current line number of the referenced statement in `control.mjs`. Update only that citation; do not change behavior.
- Row 540: in `.project/research/13-portal-legacy-audit.md`, correct the Reactive Forms claim to reflect that Reactive Forms is out of scope / superseded by Signal Forms per the charter (no Reactive Forms support), so the doc no longer states an aspirational/incorrect claim.
- Exact wording is the coder's to settle within these constraints; the doc must no longer carry the stale claim.
- Mirror the SKILL.md change to `.claude/skills/control-angular-dev-app/SKILL.md` if that byte copy is maintained (skills-mirror parity), so `scripts/skills-mirror.test.mjs` stays green.
- Do not edit DOCS-AUDIT.md; writing task ids into DOCS-AUDIT.md is not part of this task.

## Interface contract

- None

## Intent coverage

- None

## Acceptance criteria

1. `.commandcode/skills/control-angular-dev-app/SKILL.md` cites the correct `control.mjs` line number (row 386 resolved).
2. `.project/research/13-portal-legacy-audit.md` no longer claims Reactive Forms support and reflects Signal Forms (row 540 resolved).
3. If `.claude/skills/control-angular-dev-app/SKILL.md` is a maintained byte copy, it is updated to match (skills-mirror parity).
4. The docs audit rows 386 and 540 are no longer stale/aspirational.

## Verify

```bash
node --test scripts/skills-mirror.test.mjs && node -e "const fs=require('fs'); if(!fs.readFileSync('.commandcode/skills/control-angular-dev-app/SKILL.md','utf8').includes('control.mjs')) process.exit(1); if(!fs.readFileSync('.project/research/13-portal-legacy-audit.md','utf8').includes('Signal Forms')) process.exit(1);"
```

Heavy: no

## Log

- pending
- T005 done: control.mjs citation 66→69; mirror updated; portal audit copied to .project/research with Signal Forms present.
- 2026-10-31 — orchestrator Verify (isolate gsd-path-task/T005): pass, exit 0; output tail:
  ```
  ✔ .claude/skills/control-ai-browsers mirrors .commandcode/skills/control-ai-browsers (23.9375ms)
  ✔ .claude/skills/verify-ai-browsers mirrors .commandcode/skills/verify-ai-browsers (12.884ms)
  ℹ tests 2
  ℹ suites 0
  ℹ pass 2
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 397.9578
  ```
