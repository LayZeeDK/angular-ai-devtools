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
- scripts/teardown-leak-shapes.test.mjs
- scripts/outlet-record-shapes.test.mjs
- scripts/guard-record-shapes.test.mjs
- scripts/tutor-record-shapes.test.mjs
- scripts/tutor-answer.test.mjs
- scripts/chunk-failure-claims.test.mjs
- scripts/navigation-blocking.test.mjs
- scripts/m068-verdict-claims.test.mjs
- scripts/m067-verdict-claims.test.mjs
- scripts/guard-verdict-claims.test.mjs
- scripts/outlet-verdict-claims.test.mjs
- scripts/head-record.test.mjs
- scripts/gate-integrity-default-tasks.test.mjs
- scripts/gate-integrity.test.mjs
- scripts/token-baseline.test.mjs
- apps/angular-ai-devtools/src/styles.css
- scripts/panel-styles.test.mjs
- research/raw/m069-token-baseline.json
---

# T002 — Introduce the token block and the reduced-motion contract

## Context

C1 measured that no custom property exists; C2 measured that the style suite resolves computed values and pins literal declarations, so the token block must keep every declaration anchor resolvable. C3 measured that `prefers-reduced-motion` appears nowhere in the panel.

## Approach

Two halves, in this order, because the first makes the second measurable.

**The seam.** `scripts/panel-styles.test.mjs` measures through jsdom, which resolves no custom property: a longhand with `var()` reads back as that literal string and a shorthand containing `var()` reads back empty. Extend **only** the document-building seam so it substitutes `var(--name)` from `:root` the way a browser performs the cascade, and extend `scripts/token-baseline.test.mjs` so it counts media blocks per block rather than assuming one, labels a non-dark media query with its own document key, and reads a token row through `getPropertyValue` rather than a camel-cased property name. No assertion in either suite is edited, retuned or skipped.

**The tokens.** Then declare the density, colour, type and motion tokens in one `:root` block before every rule, point each rendering declaration at its token, and add the reduced-motion block that restates the motion tokens. The record T001 wrote is the proof that the rendered values did not move — it must re-derive byte-identical after the substitution seam lands and again after the tokens land.

## Intent coverage

- SC1
- SC2

## Acceptance criteria

1. Every rendering declaration resolves through a token, and a mutant that drops one token reddens naming the property it left unresolved.
2. The reduced-motion block exists as a block and restates the motion tokens; a mutant that deletes it reddens naming it.
3. No assertion in `scripts/panel-styles.test.mjs` is edited, retuned or skipped; only its document seam resolves `var()`, and every computed value it reads equals the value `research/raw/m069-token-baseline.json` recorded.

## Files

Every path this task may touch, and nothing else:

- `scripts/teardown-leak-shapes.test.mjs`
- `scripts/outlet-record-shapes.test.mjs`
- `scripts/guard-record-shapes.test.mjs`
- `scripts/tutor-record-shapes.test.mjs`
- `scripts/tutor-answer.test.mjs`
- `scripts/chunk-failure-claims.test.mjs`
- `scripts/navigation-blocking.test.mjs`
- `scripts/m068-verdict-claims.test.mjs`
- `scripts/m067-verdict-claims.test.mjs`
- `scripts/guard-verdict-claims.test.mjs`
- `scripts/outlet-verdict-claims.test.mjs`
- `scripts/head-record.test.mjs`
- `scripts/gate-integrity-default-tasks.test.mjs`
- `scripts/gate-integrity.test.mjs`
- `scripts/token-baseline.test.mjs`
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
