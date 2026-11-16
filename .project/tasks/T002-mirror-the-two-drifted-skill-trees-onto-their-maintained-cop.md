---
id: T002
title: Mirror the two drifted skill trees onto their maintained copies
wave: 2
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
  - .claude/skills/control-angular-dev-app/scripts/control.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.mjs
  - .claude/skills/control-pangular-inspector/scripts/text.mjs
  - .claude/skills/control-vitest-browser-angular/scripts/text.mjs
  - scripts/skills-mirror.test.mjs
---

# T002 — Mirror the two drifted skill trees onto their maintained copies

## Context

The inspection measured the two trees drifting: `.claude/skills/control-angular-dev-app/scripts/control.mjs`
is 58,441 bytes against `.commandcode`'s 59,743, and the same symbol sits 17 lines earlier in both drifted pairs
(`PORTAL_API_PORT` at :84 against :101, `DEFAULT_PORT` at :87 against :104). Two more trees are missing
a `text.mjs` helper script, which their `.commandcode` counterparts carry.

## Approach

Copy the maintained `.commandcode` copies over their `.claude` counterparts and restore `text.mjs` where it is absent from that tree. Do not edit `.commandcode`: it is the maintained copy, and the audit verified its line numbers. Prove
the result by hash in the mirror suite that already reads both trees.

## Intent coverage

- SC4 — AC1, AC2

## Interface contract

None

## Files

  - .claude/skills/control-angular-dev-app/scripts/control.mjs
  - .claude/skills/control-pangular-inspector/scripts/control.mjs
  - .claude/skills/control-pangular-inspector/scripts/text.mjs
  - .claude/skills/control-vitest-browser-angular/scripts/text.mjs
  - scripts/skills-mirror.test.mjs

## Acceptance criteria

- AC1 Each restored `.claude` file is byte-identical to its `.commandcode` counterpart, proven by SHA-256 in the suite.
- AC2 The suite reddens when one restored file is mutated by a single byte.

## Verify

```bash
node --test scripts/skills-mirror.test.mjs
npx prettier --check scripts/skills-mirror.test.mjs
```

## Log

- Queued by the plan for M046 copy-to-agent. No work has run yet.
