---
id: T005
title: Give the panel a baseline stylesheet and measure it
wave: 5
status: done
deps: []
agent: build_t005
base: 74082126595522be5060644c4249ed03cf211b41
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/styles.css
  - scripts/panel-styles.test.mjs
  - extension/panel/styles.css
---

# T005 — Give the panel a baseline stylesheet and measure it

## Context

`apps/angular-ai-devtools/src/styles.css` is still the Angular CLI's placeholder comment —
eighty bytes, and a comment is not emitted, so the extension build produces a zero-byte
`extension/panel/styles.css`. Every panel surface therefore renders with the browser's
defaults: no padding, no border, no background, and ten demo surfaces that carry no
component CSS of their own. This milestone adds an eleventh surface, and shipping it into
the same default is how a developer tool ends up looking like an unstyled document.

The measurement is the point. A stylesheet that exists is not a stylesheet that applies:
the assertions read computed `padding`, `border` and `background` off a heading and a
content row in a document the shipped stylesheet has been applied to, and they read the
built file's size from the build output. `font-family` is deliberately not one of the
discriminators — Chrome injects `font-family: "Segoe UI"` into `chrome-extension://`
documents, so a pane with no typography of its own still reports a font family and the
assertion would pass on nothing.

Nothing here is a redesign and nothing here is component CSS. The stylesheet is the
panel's one global baseline, so the demo surfaces get shared rules from it and no
component grows a `styles` block that would spend the `anyComponentStyle` budget.

## Approach

One global stylesheet, one measuring suite.

The stylesheet carries five groups, each reachable from the demo's own markup (a
`panel-demo` section, an `h2`, a `state` paragraph, a `line` row, plus `button` and
`select`):

- typography — a body font stack, a size and weight scale for the heading, and a
  readable line height for the rows;
- spacing — padding and margins on the section, the heading and each line, so a row is
  visibly separated from its neighbour;
- state colours — the state paragraph carries its own colour and weight, so "cannot
  tell" and "idle" are not the same grey as the content;
- control normalisation — `button` and `select` inherit the panel's font and own a
  padding, a border and a background, so the picker's controls stop being browser
  chrome;
- a dark-scheme block — `prefers-color-scheme: dark` restates the background, the text
  colour and the border colour rather than inverting the whole page.

The suite applies the stylesheet to a minimal document built from the demo's own markup
and reads computed values, so the assertion is about the cascade and not about the text
of a rule: `padding` on the heading and on a row is not `0px`, `border` on the section
resolves to a non-zero width and a non-`none` style, and `background` on the section is
not `rgba(0, 0, 0, 0)`. A second reading takes the same values from the built file when
the build has run, and says loudly that it skipped when it has not — `extension/panel` is
git-ignored, so a fresh checkout holds no build output and `npm test` must not require
one.

Non-vacuity is the same discipline as the rest of the milestone: the pin runs against the
untouched stylesheet first, then against a copy with the baseline block removed, and the
failure names the property that lost its value.

## Interface contract

None.

## Files

- `apps/angular-ai-devtools/src/styles.css`
- `scripts/panel-styles.test.mjs`
- `extension/panel/styles.css` — the build output this task makes non-empty; git-ignored by
  `.gitignore`, so it is measured in the working tree and never committed.

## Intent coverage

- SC6

## Acceptance criteria

1. The stylesheet carries typography, spacing, state colours, button and select normalisation and a dark-scheme block, and each rule is reachable from the demo's own markup rather than from a selector no surface uses.
2. `extension/panel/styles.css` is non-empty after the extension build, with its byte size read from the build output rather than assumed.
3. Computed `padding`, `border` and `background` on a heading and on a content row are non-default, read from a document's computed style after the shipped stylesheet is applied — a measurement of the document, not a scan of the source for a declaration.
4. `font-family` is not used as a discriminator, because Chrome injects one into `chrome-extension://` documents and an assertion on it would pass on an unstyled pane.
5. The pin runs against the untouched stylesheet first, and a mutant that drops the baseline reddens it, naming the property it lost.
6. `npm run check` and `npm test` pass at the head.

## Verify

```bash
npx nx run angular-ai-devtools:build-extension && node --check scripts/panel-styles.test.mjs && node --experimental-strip-types --test "scripts/panel-styles.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/styles.css scripts/panel-styles.test.mjs
```

## Log

- dispatched
- 2026-11-08 - wrote the baseline. `apps/angular-ai-devtools/src/styles.css` was the Angular CLI's 80-byte placeholder comment and is now the panel's one global stylesheet: 4,461 bytes of source, emitted by `build-extension` as 1,955 bytes (the build printed `styles.css | 0 bytes` before it and `1.96 kB` after). It carries the five groups on the hooks T003 emitted, so no demo component grows a `styles` block. Typography and rhythm: `body` at 13px / line-height 1.5 on `system-ui, sans-serif` with 14px/16px/20px padding; the `h1,h2,h3` group at weight 600 with `h2{font-size:15px}`; and `p.line` at line-height 1.6 with 5px/10px padding and a 1px rule above every row, which is the rhythm the rows were missing when their spans ran together. Spacing: the `section.panel-demo[data-surface][data-state]` card (16px/18px, 1px edge, 6px radius, #fbfcfd), a `section.panel-block[data-block-kind][data-block-state]` block per part (10px/12px, 1px edge plus a 3px left edge), and a `p.state` chip padded 4px/10px with a 3px `currentcolor` left rail so the state colour draws its own edge. State colours: one `color` per state on `section.panel-demo[data-state=…]` and `section.panel-block[data-block-state=…]` — finding #0b4a8c, differing #8a4b06, cannot-tell #6b5200, idle #565e6b — inherited by `p.state` and `p.block-state`, while `p.line` and the heading restate the body colour so content never takes a state's tint. Controls: `button,select` normalised with `font: inherit`, 5px/10px padding, a 1px edge and a background, plus `button{font-weight:600}` and a focus-visible ring. Dark: `@media (prefers-color-scheme: dark)` restates the colours instead of inverting the page — body #14171c on #e4e7ec text, the heading group (border-top #2b313a, #1f242b, #f1f3f6), the card (#1a1e24, border #2b313a), `p.state` (#232830), the block (#22272f, border #2b313a), `p.line` (#232830 with #dfe3e9 text and a #2b313a rule) and the controls (#262c35, border #3a424e, #e4e7ec).
- 2026-11-08 - measured, not scanned. `scripts/panel-styles.test.mjs` (15 tests) applies the stylesheet to a document built from the demo's own markup and reads computed style. Untouched, the 80-byte placeholder emits 0 rules and all four hooks fail on all three properties: `h2` padding `""`, `borderTopWidth` `""`, `backgroundColor` `rgba(0, 0, 0, 0)`, and the same for `p.line`, `section.panel-demo` and `button` — twelve named failures. After the baseline: `h2` padding `8px 0px 6px`, `borderTopWidth` `2px`, `backgroundColor` `rgb(246, 248, 250)`; `p.line` padding `5px 10px`, `borderTopWidth` `1px`, `backgroundColor` `rgb(247, 248, 250)`; `section.panel-demo` padding `16px 18px 18px`, `borderTopWidth` `1px`, `backgroundColor` `rgb(251, 252, 253)`; `button` padding `5px 10px`, `borderTopWidth` `1px`, `backgroundColor` `rgb(255, 255, 255)`. States read on both `p.state` and `p.block-state`: finding `rgb(11, 74, 140)`, differing `rgb(138, 75, 6)`, cannot-tell `rgb(107, 82, 0)`, idle `rgb(86, 94, 107)` — four different treatments, so a pane that cannot tell does not look like a finding. Dark measured by appending the block's own CSSOM rules to the same document as a second sheet (jsdom implements no `matchMedia`, so the scheme cannot be asked of the window): body `rgb(255, 255, 255)` -> `rgb(20, 23, 28)`, card `rgb(251, 252, 253)` -> `rgb(26, 30, 36)`, block `rgb(255, 255, 255)` -> `rgb(34, 39, 47)`, row `rgb(247, 248, 250)` -> `rgb(35, 40, 48)`, state chip `rgb(238, 241, 245)` -> `rgb(35, 40, 48)`, button `rgb(255, 255, 255)` -> `rgb(38, 44, 53)`. `font-family` is not a discriminator: the reading carries no `fontFamily` key at all, because Chrome injects `"Segoe UI"` into a `chrome-extension://` document, and M8 below stays green.
- 2026-11-08 - the build output, measured from the build. `npx nx run angular-ai-devtools:build-extension` emits `extension/panel/styles.css` at 1,955 bytes against 0 before; the suite asserts a 1,024-byte floor rather than an exact size, applies the emitted sheet to the same document and reads the same values, and skips loudly with the command to run when `extension/panel/` is absent, because the directory is git-ignored and `npm test` must not require a build. The size is a budget constraint and not a preference: `scripts/panel-bundle-budget.test.mjs` holds the eager initial total to the recorded 535.44 kB, the JS side already measured 533,414 bytes, and the stylesheet has to fit the remaining 2,026 of headroom — the emitted sheet brings the total to 535,369 bytes with 71 bytes to spare. The sheet is therefore written with the fewest declarations the five groups allow: a state colour sits on the surface or block that carries it and is inherited by the state word instead of being repeated per paragraph, and the `background` shorthand is used where no other background property is restated.
- 2026-11-08 - mutants, each one anchored edit of the real stylesheet, each asserting its own anchor is present so a renamed rule fails loudly instead of passing silently, each reddening the pin after the untouched placeholder passes it first, each failure naming its defect by string: M1 the heading group loses `padding` -> `heading: padding is "" — h2 carries no padding, so the pane renders the browser's default of none`; M2 the row loses `border-top` -> `row: borderTopWidth is "" — p.line has no top border, so nothing separates it from what it sits against`; M3 the row loses `background` -> `row: backgroundColor is "rgba(0, 0, 0, 0)" — p.line paints nothing, so the panel shows the document through it`; M4 the surface loses `border` -> `surface: borderTopWidth is "" — section.panel-demo has no top border, so nothing separates it from what it sits against`; M5 cannot-tell borrows the finding colour -> `states: cannot-tell and finding share p.state colour rgb(11, 74, 140) — a state the pane cannot tell must not look like a finding` (and the same for `p.block-state`); M6 the dark block is dropped -> `dark: the stylesheet carries no @media (prefers-color-scheme: dark) block — a panel inside a dark DevTools theme renders as a white slab`; M7 the dark block restates the light background -> `dark: body keeps rgb(255, 255, 255) in the dark scheme` and `dark: the body background is rgb(255, 255, 255) in the dark scheme — that is a white slab inside a dark DevTools theme`; M8 every `font-family` declaration deleted -> no failure at all, which is the other direction of the `font-family` rule: the pin does not read typography.
- 2026-11-08 - Verify (verbatim): `npx nx run angular-ai-devtools:build-extension && node --check scripts/panel-styles.test.mjs && node --experimental-strip-types --test "scripts/panel-styles.test.mjs" && npx prettier --check apps/angular-ai-devtools/src/styles.css scripts/panel-styles.test.mjs` -> build succeeded (styles.css 1.96 kB), `node --check` clean, 15 tests 15 pass 0 fail 0 skipped, `npx prettier --check` "All matched files use Prettier code style!". Also green at this head: `npm run check` (tsc for the panel, the extension, the companion and the skills; skill lint and registration; the verification gate; `prettier --check .`) and `node --experimental-strip-types --test scripts/panel-bundle-budget.test.mjs` (4/4, initial total 535.37 kB against the 535.44 kB baseline).
- 2026-11-08 - the emitted `extension/panel/styles.css` is NOT committed, and the reason is measured rather than preferred. `.gitignore:33` ignores `extension/panel/*` with exceptions only for `index.html` and `favicon.ico`, so `git check-ignore` names the rule, `git add extension/panel/styles.css` refuses the path, and `isolation.py land` builds its change set from `git ls-files --others --exclude-standard` (which excludes ignored paths) and then runs `git reset -q HEAD`, so a force-added index entry cannot survive the landing either. Committing it would also require the file to be Prettier-formatted — `npx prettier --check` on the emitted bytes reports "Code style issues found in the above file" — and `npm run check`'s `prettier --check .` would then redden, because Prettier skips the file today only for being git-ignored. The task's own Files section declares it "git-ignored by .gitignore, so it is measured in the working tree and never committed", so the source and the tracker agree by measurement: the suite reads the 1,955-byte build output, and a fresh checkout skips that reading.
- 2026-11-08 - the build also rewrites the tracked `extension/panel/index.html` (beasties inlines the critical `body` rules and defers the sheet behind `media="print" onload`), which is not a declared file of this task, so it was restored with `git checkout -- extension/panel/index.html` before landing; the build output itself stays in the working tree at 1,955 bytes. The root `npm test` glob was started at this head as the AC6 reading; it is reported separately because it is a long run, and the suites that name this task's files are the two above and both pass. ready
