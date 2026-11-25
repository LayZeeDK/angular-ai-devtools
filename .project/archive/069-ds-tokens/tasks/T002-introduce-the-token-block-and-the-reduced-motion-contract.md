---
id: T002
title: Introduce the token block and the reduced-motion contract
wave: 2
status: done
deps: []
agent: build_T002
base: 48564e3edbd5b564333414dd465a285fe464bb36
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
- 2026-11-25: the seam came first, as the patch required. `documentWith` now substitutes `var(--name)` from a top-level `:root` the way a browser's cascade does, iterating to a fixed point and leaving an undeclared name standing rather than emptying it, so a dropped token reads as unresolved instead of as a browser default. No assertion, mutant anchor, expected value or measured hook was edited: the diff is +83/-1 and the single removal is the `<style>` template inside `documentWith`.
- 2026-11-25: with the seam in place and the stylesheet unchanged, all 77 computed readings were identical. The record's `derivedFrom.measuredBy.sha256` moved because it pins this suite's own digest — a one-field difference, deep-diffed to prove nothing else moved. That is a deviation from "byte-identical" and is recorded as such rather than claimed as met.
- 2026-11-25: three measured defects in `scripts/token-baseline.test.mjs` were repaired: it compared every non-`all` media rule to the dark count (8 against 7 once a second block existed), it labelled every non-dark media query `dark` (which recorded three fabricated motion values into the dark document), and it read custom properties through a camel-cased property name that is `undefined` for all 57 tokens, so every token row would have been a `not-resolved` absence. Each is now per-block, per-document, and read through `getPropertyValue`.
- 2026-11-25: the token block declares 57 distinct tokens — density 17, colour 28 (18 light, 10 dark), type 9, motion 3 — before every rule, and 63 of 66 rendering declarations read one. The three that do not are the anchors of mutants M5, M7 and M8, whose patterns match that declaration text exactly once; tokenising any of them would have forced three assertions to be weakened. No token is declared for them, because a token nothing reads is worse than the literal it duplicates.
- 2026-11-25: the reduced-motion block restates the three motion tokens and nothing in the sheet transitions or animates. That is recorded in the record's own statement and pinned by a test that only motion tokens may be unconsumed, rather than given a consumer by inventing a transition, which would be a rendered change.
- 2026-11-25: 77 rendered readings before and after, 0 moved and 0 gone; the record grew by the 60 token rows the seam now resolves. Verify 15/15 for `panel-styles` and 38/38 for `token-baseline`; the armed writer still writes only what moved and refuses a non-fixed-point candidate.
- 2026-11-25: new mutants prove AC1 and AC2. Dropping a token reddens naming the property left unresolved; deleting the reduced-motion block reddens naming the block; a restatement that changes nothing also reddens; and only motion tokens may be unconsumed.
- 2026-11-25: `npm run check` exit 0 before and after. One in-contract file had to change — `scripts/gate-integrity.test.mjs`, whose `SUITE_DIFF_REASONS` map reddened because this task edited a suite — and its row was appended as that file's convention requires.
- 2026-11-25: one red is outside this contract and needs a decision: `scripts/panel-bundle-budget.test.mjs` measures 538.25 kB against its recorded 535.44 kB, a 2.81 kB overrun caused by the token layer's 3,580 emitted bytes. Measured both sides: base 534.67 kB pass, tokenised 538.25 kB fail. The pin was not edited; widening it is the task after this one.
- 2026-11-25: `research/raw/m044-gate-shapes.json` remains stale by one suite and one record, which is pre-existing at this base and owed by T004.
- Landed paths: `scripts/teardown-leak-shapes.test.mjs`, `scripts/outlet-record-shapes.test.mjs`, `scripts/guard-record-shapes.test.mjs`, `scripts/tutor-record-shapes.test.mjs`, `scripts/tutor-answer.test.mjs`, `scripts/chunk-failure-claims.test.mjs`, `scripts/navigation-blocking.test.mjs`, `scripts/m068-verdict-claims.test.mjs`, `scripts/m067-verdict-claims.test.mjs`, `scripts/guard-verdict-claims.test.mjs`, `scripts/outlet-verdict-claims.test.mjs`, `scripts/head-record.test.mjs`, `scripts/gate-integrity-default-tasks.test.mjs`, `scripts/gate-integrity.test.mjs`, `scripts/token-baseline.test.mjs`, `apps/angular-ai-devtools/src/styles.css`, `scripts/panel-styles.test.mjs`, `research/raw/m069-token-baseline.json` — each is read from this tree, ready.
