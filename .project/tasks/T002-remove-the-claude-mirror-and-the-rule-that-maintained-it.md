---
id: T002
title: Remove the .claude mirror and the rule that maintained it
wave: 2
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - .claude/skills/control-ai-browsers/SKILL.md
  - scripts/skills-mirror.test.mjs
  - scripts/skill-lint.mjs
  - AGENTS.md
  - package.json
---

# T002 — Remove the .claude mirror and the rule that maintained it

## Context

The owner's instruction: this repository uses Command Code only, so `.claude/` — 111 tracked files including the
`control-*` and `verify-*` skill copies — may be deleted. The inspection measured why keeping it is worse than
removing it: the two trees had drifted 17 lines apart on two skill pairs (`PORTAL_API_PORT` at `:84` against
`:101`, `DEFAULT_PORT` at `:87` against `:104`), two `.claude` trees were missing a `text.mjs` helper their
maintained counterparts carry, and three SKILL.md citations the audit called "wrong line numbers" were correct for
the stale copy they named. A mirror nothing enforces drifts into a second source of truth.

## Approach

Delete `.claude/` in full. Retire the rules and pins that existed only to keep it in step: `scripts/skills-mirror.test.mjs`
(which reads both trees), the mirror clause in `scripts/skill-lint.mjs`, the rule in `AGENTS.md` that says to copy a
changed skill across, and any `package.json` script that points at the mirror. Prove the result by the suites that
remain reading only `.commandcode`, and by a tree that carries no `.claude` path.

## Intent coverage

- SC4

## Interface contract

None

## Files

  - .claude/skills/control-ai-browsers/SKILL.md
  - scripts/skills-mirror.test.mjs
  - scripts/skill-lint.mjs
  - AGENTS.md
  - package.json

## Acceptance criteria

1. `.claude/` carries no tracked path, and `git ls-files '.claude/*'` prints nothing.
2. No suite or script resolves a `.claude` path: `skills-mirror.test.mjs` is gone, `skill-lint.mjs` names only `.commandcode`, and the `check:skills` script no longer typechecks a `.claude` project.
3. The rule in `AGENTS.md` that told a reader to copy a skill across the two trees is withdrawn, and the text that remains says where the maintained copy lives.

## Verify

```bash
node --check scripts/skill-lint.mjs
node scripts/skill-lint.mjs
npm run check
npx prettier --check AGENTS.md
```

## Log

- Queued by the plan for M046 copy-to-agent. The owner's instruction of 2026-11-16 authorises the deletion; the
  work lands here rather than as an ad-hoc removal, so the rules that maintained the mirror retire in one commit.
