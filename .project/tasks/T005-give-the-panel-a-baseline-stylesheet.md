---
id: T005
title: Give the panel a baseline stylesheet and measure it
wave: 5
status: pending
deps: []
agent: null
base: null
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
