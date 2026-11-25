# PLAN — M069 ds-tokens

Milestone: M069 — ds-tokens · Branch: gsd-path/M069 · Baseline: `main` at binding

## Config

review_panel: off
finding_skeptics: off
max_review_cycles: 3

Project verify: `node scripts/ensure-sidecar-deps.mjs && npx nx run angular-ai-devtools:build-extension && npm run check && npm test`

Plan patch 2026-11-25: T002's first attempt was blocked by a measured oracle gap, not by the CSS. jsdom 27.4.0
resolves no custom property, so a token layer is invisible to a `getComputedStyle` measure and the intent's
"passes unmodified" forbade the only correct repair. The intent gained correction C4 (no assertion may be edited; the
document seam may substitute as a browser does), and T002 now owns the two seam repairs as well as the tokens —
`scripts/token-baseline.test.mjs` joined its files, because the record cannot represent a second media block, labels
every non-dark media query as the dark scheme, and reads token rows through a property name that does not exist.

Plan patch 2026-11-25 (second): the token layer moved the panel's bundle budget, and the pin that records it is a
recording like any other, so it belongs to the wave that re-derives what this milestone moved. Measured: 534.67 kB at
base, 538.25 kB after the tokens — 2.81 kB over the recorded 535.44 kB, from the token block's 3,580 emitted bytes.
`scripts/panel-bundle-budget.test.mjs` therefore joins T004, which states the cost, the reason it is declared and
M070's projection: Material and CDK arrive there and will need a further declared move rather than another quiet one.

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
Verify runs that suite. `plan-lint` refuses a row here for an edge a task already proves — it reports
`[held-out-row] ... names E1, which is not held-out` — so listing the edges' suites in this table contradicts the gate
that owns it. Which suite holds which edge is recorded in the milestone's claim census instead, which is the artefact a
reader opens for exactly that question.
