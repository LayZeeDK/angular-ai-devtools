# INTENT — M069 ds-tokens

Lane: standard · Milestone: ds-tokens (M069) · Branch: gsd-path/M069
Review panel: off
Finding skeptics: off
Surfaces: design system

## Goal

The design system ships its density, colour, type and motion custom properties in one place, with a reduced-motion
contract every later component inherits — and the panel's existing style assertions keep passing unmodified, so the token
layer is a re-expression of what the panel already renders, not a restyle.

## Verification target

The panel's own stylesheet and the surfaces that consume it, on the Insurance Portal first where a surface renders there,
with the fixture only where the portal carries no such surface.

## Corrections

- C1 2026-11-25: measured before writing any criterion — no custom property exists in the panel today. A grep for a custom-property declaration over `apps/angular-ai-devtools/src` returns nothing; the two stylesheets are `styles.css` (the one global baseline M039 wrote) and `app.css`, which is empty. So this milestone introduces the token layer rather than migrating one, and the "existing tokens" reading of the roadmap entry is wrong.
- C2 2026-11-25: measured in `scripts/panel-styles.test.mjs` — it resolves values through `window.getComputedStyle` (line 168) and its mutant anchors match a literal declaration (lines 362 and 369). A token layer therefore cannot delete the property declarations that suite pins; it has to keep every anchor resolvable while the value behind it moves to a custom property, so the requirement is that the suite passes **unmodified**.
- C3 2026-11-25: measured — `prefers-reduced-motion` appears nowhere under `apps/` or `extension/`, and the panel carries no imperative animation API. The motion contract is written here, and its evidence has to be a block the suite reads rather than an animation that must be observed in a browser.
- C4 2026-11-25: measured after the first attempt, and it invalidates the reading of SC3 that attempt assumed. jsdom 27.4.0 resolves no custom property: `getComputedStyle(el).color` for `color: var(--ink)` answers the literal string `var(--ink)`, a shorthand containing `var()` answers `""`, and the camel-cased token name is `undefined` while `getPropertyValue('--ink')` answers the value. A token layer is therefore invisible to a `getComputedStyle` oracle that performs no substitution, and "passes unmodified" made the only correct repair illegal. SC3 is read as: **no assertion in `scripts/panel-styles.test.mjs` is edited, retuned or skipped** — the document-building seam may gain the substitution a browser performs, and that seam is named in the task that adds it.

## Success criteria

1. One token block declares the density, colour, type and motion properties, and every value the panel renders resolves
   through it rather than from a literal at the point of use; a mutant that drops a token reddens naming the property.
2. Every token is present under both motion preferences, with the reduced-motion block asserted as a block; a mutant that
   removes that block reddens naming it.
3. No colour, spacing, type or duration literal remains outside the token block, and `scripts/panel-styles.test.mjs`
   passes **unmodified** — proving the token layer re-expressed the rendered values instead of retuning the assertions.
4. The stylesheet stays within the bundle budget its own suite records, and a mutant that duplicates a token block reddens
   naming both blocks.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
| --- | --- | --- | --- | --- |
| E1 | SC1 | empty | criterion SC1 | A surface that declares no token-consuming property still resolves the baseline values, never a blank or inherited-from-nowhere value. |
| E2 | SC1 | ordering | criterion SC1 | The token block precedes every rule that reads it, so a rule never resolves a token declared after it. |
| E3 | SC2 | boundary | criterion SC2 | The reduced-motion block is proved present as a block, not inferred from an absent animation, which no reading can distinguish from a missing rule. |
| E4 | SC2 | precision | criterion SC2 | With motion allowed, the reduced-motion block's declarations do not leak into the base block, and vice versa. |
| E5 | SC3 | boundary | criterion SC3 | The literal-value suite runs unmodified; a run that edits its expectations reddens by naming the edited assertion. |
| E6 | SC3 | precision | criterion SC3 | A literal inside a comment or a token definition is not counted as a stray literal, and a literal in a real declaration is. |
| E7 | SC4 | ordering | criterion SC4 | The budget is measured after the token block lands, so a fresh build's total is compared, never a stale one. |
| E8 | SC4 | precision | criterion SC4 | A token declared twice under one name reddens naming both, and two names for one value are not treated as a duplicate. |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
| --- | --- | --- | --- | --- |
| N1 | SC1 | add a component library or a design-system package | criterion SC1 | A11: tokens first, and no `@angular/material` or `@angular/cdk` dependency in this entry (`package.json` carries neither today). |
| N2 | SC2 | implement motion in an imperative animation API | criterion SC2 | CSS transitions and keyframes only; the panel has no animation API and this milestone adds none. |
| N3 | SC3 | retune, skip or delete an existing style assertion to make the token layer land | criterion SC3 | The suite passes unmodified or the landing does not happen. |
| N4 | SC3 | restyle a surface beyond what re-expressing its values requires | criterion SC3 | The rendered result is unchanged; only where a value comes from changes. |
| N5 | SC4 | widen the bundle budget to fit the token block | criterion SC4 | Budgets move only when a milestone declares the move and says why. |
| N6 | SC4 | add a second stylesheet to hold the tokens | criterion SC4 | One block, in the one stylesheet M039 established. |

## Constraints

- The token block is CSS custom properties in `apps/angular-ai-devtools/src/styles.css`; no new stylesheet file.
- Every suite that enumerates the stylesheet or its rendered values is declared in the task that changes it, and a
  `pinned-file` warning is read as a blocker.
- A recording is written only by an explicit capture (`M069_CAPTURE=1`) and read by every default run.
- A suite this milestone adds owes the census its `SUITE_DIFF_REASONS` row in the same task, and every recording it
  writes is named in `scripts/recordings.json` in the same task.
- The project verify is the last task, after the last landing that changes what a recording counts.
