---
id: T002
title: Introduce the token block and the reduced-motion contract
wave: 2
status: pending
deps: []
agent: null
base: null
worktree: null
task_branch: null
files:
- apps/angular-ai-devtools/src/styles.css
- scripts/panel-styles.test.mjs
- research/raw/m069-token-baseline.json
---

# T002 — Introduce the token block and the reduced-motion contract

## Context

C1 measured that no custom property exists; C2 measured that the style suite resolves computed values and pins literal declarations, so the token block must keep every declaration anchor resolvable. C3 measured that `prefers-reduced-motion` appears nowhere in the panel.

## Approach

Declare the density, colour, type and motion tokens in one `:root` block before every rule, point each rendering declaration at its token, and add the reduced-motion block that restates the motion tokens. The style suite runs unmodified: the record T001 wrote is the proof that the rendered values did not move.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. Every rendering declaration resolves through a token, and a mutant that drops one token reddens naming the property it left unresolved.
2. The reduced-motion block exists as a block and restates the motion tokens; a mutant that deletes it reddens naming it.
3. `scripts/panel-styles.test.mjs` passes unmodified, and its computed values equal the values `research/raw/m069-token-baseline.json` recorded.

## Files

Every path this task may touch, and nothing else:

- `apps/angular-ai-devtools/src/styles.css`
- `scripts/panel-styles.test.mjs`
- `research/raw/m069-token-baseline.json`

## Interface contract

Byte-identical across the tasks that share it:

```css
/* apps/angular-ai-devtools/src/styles.css — one token block, before every rule */
:root {
  --ds-density-*: ...;
  --ds-color-*: ...;
  --ds-type-*: ...;
  --ds-motion-*: ...;
}
```

Every rule that renders a panel value reads a token; the token block precedes the rules that read it.

## Verify

```bash
node --test scripts/panel-styles.test.mjs
```

## Log

- pending
