---
id: T012
title: Type the stale-view check modules so the repository type check passes
wave: 5
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs
  - .claude/skills/verify-ai-browsers/checks/stale-view.test.mjs
  - .commandcode/skills/verify-ai-browsers/checks/stale-view.mjs
  - .claude/skills/verify-ai-browsers/checks/stale-view.mjs
---

# T012 — Type the stale-view check modules so the repository type check passes

## Context

P001 — The two stale-view check modules fail the repository type check

- **Locator**: Risk: project Verify
- **Evidence**: Project Verify failed at the reviewed commit.
- **Fix direction**: Resolve the recorded command failure before shipping.

`npm run check` (which runs `tsc` with `checkJs` over both skill trees) reports TS7006/TS7031/TS7034/TS7005 implicit `any` and TS7053 implicit index errors in `stale-view.mjs` and `stale-view.test.mjs` in both trees. T006's own Verify was `node --test`, so the type check never ran.

## Approach

- Add JSDoc types matching the style of the passing check modules (e.g. `error-explainer.mjs` and its test) so `tsc` accepts both files.
- Keep the `.commandcode` and `.claude` trees byte-identical.
- No behavioural change to the check or its tests.

## Interface contract

None

## Intent coverage

- None

## Acceptance criteria

1. `npm run check` exits 0 with no TS error in either tree.
2. `node --test .commandcode/skills/verify-ai-browsers/checks/stale-view.test.mjs` still passes 6/6.
3. The four files' `.commandcode`/`.claude` twins are byte-identical.
4. Nothing outside the four declared files changed.

## Verify

```bash
node --check .commandcode/skills/verify-ai-browsers/checks/stale-view.mjs && npm run check
```

Heavy: no

## Log

- created by planner