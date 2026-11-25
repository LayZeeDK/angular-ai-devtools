# PLAN — M069 ds-tokens

Milestone: M069 — ds-tokens · Branch: gsd-path/M069 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 3

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

## Waves

## Wave 1 — T001: measure the values the token layer must re-express

Goal: Record every selector and property the stylesheet renders today, read-only by default and armed by its own capture.
Review depth: full

## Wave 2 — T002: the token block and the reduced-motion contract

Goal: One `:root` block, every rendering declaration pointed at a token, the reduced-motion block restating the motion
tokens, and the style suite passing unmodified.
Review depth: full

## Wave 3 — T003: a suite that holds the token layer

Goal: Every token declared once, the block before its readers, no literal outside it.
Review depth: full

## Wave 4 — T004: re-derive the recordings the change moved

Goal: The census after the last suite edit, the stability record after the census.
Review depth: full

## Wave 5 — T005: the milestone verdict claims, then the project verify

Goal: Capture the claims and run the project verify from a landing that changes nothing the recordings count.
Review depth: full

## Intent coverage

| Criterion | Task | Acceptance |
| --- | --- | --- |
| SC1 | T002 | AC1 |
| SC2 | T002 | AC2 |
| SC3 | T001 | AC1 |
| SC3 | T002 | AC3 |
| SC3 | T003 | AC1 |
| SC4 | T003 | AC2 |
| SC4 | T004 | AC1 |
| SC4 | T005 | AC2 |

## Surface contract

### design system — T002, T003

Entry: `apps/angular-ai-devtools/src/styles.css`, the one global stylesheet M039 established, read by every panel surface.

States: the base block and the reduced-motion block, each asserted as a block rather than inferred from an absence.

Criteria: SC1, SC2, SC3, SC4

Walkthrough:

1. Open any panel surface and read its computed values; they resolve through the token block and equal what the baseline
   record captured before the token layer existed.
2. Set the OS to reduce motion and read the same values; the motion tokens restate to their reduced values and no other
   value moves.

## Held-out checks

Nothing is held out: every edge the intent declares is proved by the suite of the task that owns it, and that task's
Verify runs that suite.
