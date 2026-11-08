# Review — wave 5, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 79bbdc22d37af0fce6344b7da9df3b22ebc7f88f

Provenance: written at the reviewed head by the ship-phase reviewer, and **re-issued at
`79bbdc2`** after P002's repair. T005's Verify was **re-run** at `e5a3822` (output below), the
emitted bytes were read from the build output, and the bundle budget was measured a second way; the
suite was then re-run in a clean `git worktree` at `79bbdc2` where `extension/panel/styles.css` does
not exist, which is the environment that reddened SC6 at `e5a3822`, and again in that worktree after
`npx nx run angular-ai-devtools:build-extension`. This wave's task is independent of the four before
it and touches no file they touch; its measured artefact is the built output. What changed since the
cycle's first reading is one file — `scripts/panel-styles.test.mjs` — and this cycle now records the
verdict that file's repair earns. The block it replaced is preserved in
`.project/review/PATCH-FINDINGS.md` as P001 and P002 in their evidence form.

## T005 — Give the panel a baseline stylesheet and measure it: pass

- ✅ `npx nx run angular-ai-devtools:build-extension` succeeded at this head and printed `styles.css | 1.96 kB` and `Initial total 535.37 kB`; `node --check scripts/panel-styles.test.mjs` clean; `node --experimental-strip-types --test "scripts/panel-styles.test.mjs"` — **15 tests, 15 pass, 0 fail, 0 skipped**; `npx prettier --check apps/angular-ai-devtools/src/styles.css scripts/panel-styles.test.mjs` — "All matched files use Prettier code style!" (T005's Verify; recorded `pass` at `e5a3822` in `.project/build/verify-ledger.jsonl`)
- ✅ **AC1** the stylesheet carries typography, spacing, state colours, button and select normalisation and a dark-scheme block, and each rule is reachable from the demo's own markup — `apps/angular-ai-devtools/src/styles.css` is 4,461 bytes: typography at `:26` (`body`), `:38-39` (`h1,h2,h3`) and `:49` (`h2`); the card and block spacing at `:54` (`section.panel-demo[data-surface][data-state]`) and `:71` (`section.panel-block[data-block-kind][data-block-state]`); state colours at `:97-114` (four states, each on the surface and on the block); control normalisation at `:118-119` (`button, select`) and `:128` (`button`); the dark block at `:138` (`@media (prefers-color-scheme: dark)`) restating the surface at `:152` and the block at `:161`. Every selector it uses is a hook the demo's own template emits — `apps/angular-ai-devtools/src/app/panel-demo.ts:205-229`
- ✅ **AC2** `extension/panel/styles.css` is non-empty after the extension build, with its byte size read from the build output — measured at this head: **1,955 bytes**, against 0 before the task (the build printed `styles.css | 0 bytes` then `1.96 kB`, T005's Log). The suite prints "panel-styles: extension/panel/styles.css is 1955 bytes" from the built file rather than from a constant, and asserts a 1,024-byte floor rather than an exact size
- ✅ **AC3** computed `padding`, `border` and `background` on a heading and a content row are non-default, read from a document's computed style rather than scanned from the source — at this head the suite reports `h2 {padding: "8px 0px 6px", borderTopWidth: "2px", backgroundColor: "rgb(246, 248, 250)"}`, `p.line {padding: "5px 10px", borderTopWidth: "1px", backgroundColor: "rgb(247, 248, 250)"}`, `section.panel-demo {padding: "16px 18px 18px", borderTopWidth: "1px", backgroundColor: "rgb(251, 252, 253)"}` and `button {padding: "5px 10px", borderTopWidth: "1px", backgroundColor: "rgb(255, 255, 255)"}`, plus four distinct state colours (`rgb(11, 74, 140)`, `rgb(138, 75, 6)`, `rgb(107, 82, 0)`, `rgb(86, 94, 107)`) read on both `p.state` and `p.block-state`
- ✅ **AC4** `font-family` is not a discriminator — the reading carries no `fontFamily` key at all, and mutant M8 ("every font-family declaration is dropped") produces **no failure**, which is the assertion itself: the pin does not read typography, so it cannot pass on an unstyled pane whose font Chrome injected
- ✅ **AC5** the pin runs against the untouched stylesheet first and a mutant that drops the baseline reddens, naming the property it lost — at this head the untouched placeholder reads `{padding: "", borderTopWidth: "", backgroundColor: "rgba(0, 0, 0, 0)"}` on all four hooks, and M1–M7 each redden naming the defect by string (`heading: padding is "" — h2 carries no padding…`, `row: borderTopWidth is "" …`, `row: backgroundColor is "rgba(0, 0, 0, 0)" …`, `surface: borderTopWidth is "" …`, `states: cannot-tell and finding share p.state colour …`, `dark: the stylesheet carries no @media (prefers-color-scheme: dark) block …`, `dark: body keeps rgb(255, 255, 255) in the dark scheme`). Each mutant asserts its own anchor is present, so a renamed rule fails loudly instead of passing silently
- ✅ **AC6** `npm run check` and `npm test` pass at the head — established at `79bbdc2` in the environment the gate uses, which is the one that failed at `e5a3822`. A clean worktree made with `git worktree add -b gsd-path-verify/m039-e3-proof` (the branch prefix the helper's own verify sidecars carry, so `scripts/facade-dev-build.test.mjs`'s three root-checkout comparisons take their named skip exactly as under the gate) holds only `extension/panel/index.html` and `extension/panel/favicon.ico` — the two tracked exceptions — and no `styles.css`; with `node_modules` bridged by `scripts/ensure-sidecar-deps.mjs`, which is what `npm run check` invokes in a sidecar, `node --experimental-strip-types --test scripts/panel-styles.test.mjs` reports **15 tests, 15 pass, 0 fail, 0 skipped** there and prints `panel-styles: not measured — the built file extension/panel/styles.css cannot be read (extension/panel/styles.css is absent — run npx nx run angular-ai-devtools:build-extension); extension/panel/ is git-ignored, so a fresh checkout holds no build output. Unmeasured here: the 1024-byte floor on the emitted bytes, and the computed padding, border and background the built sheet gives the demo surface.`; `node --test tests/held-out/e3-zero-skipped.test.mjs`, which spawns the whole `npm test` chain in that worktree, **exits 0 in 486,260 ms** with the skip gone
- ✅ the repair that earns AC6 is P002's, and it is one file — `scripts/panel-styles.test.mjs:594` now handles the absent build by printing the sentence above and `return`ing, declaring no `skip:` and no `todo:`, which is the convention `scripts/panel-bundle-budget.test.mjs:441-452` already used for its own build-gated reading. Nothing else in the suite moved: the source pin, the four computed readings, the dark block and mutants M1 to M8 are unchanged, and `tests/held-out/e3-zero-skipped.test.mjs` was not touched, relaxed or excepted
- ✅ the built-file path still asserts wherever a build exists — after `npx nx run angular-ai-devtools:build-extension` in that same clean worktree the suite re-ran with the reading present: `panel-styles: extension/panel/styles.css is 1955 bytes` against the `BUILT_BYTE_FLOOR` of 1,024, and `baselineFailures`, `stateColourFailures` and `darkFailures` all empty, so a comment-only emit still reddens
- ✅ the budget half, measured at this head: `node --experimental-strip-types --test "scripts/panel-bundle-budget.test.mjs"` — **4 tests, 4 pass** — reporting "measured initial total 535.37 kB (535369 B over 9 eager files) against the 535.44 kB baseline". The baseline constant is 535,440 bytes, so the headroom is **71 bytes**
- ✅ the build's side effect on a tracked file is known and handled, not hidden — the build rewrites `extension/panel/index.html` (beasties inlines the critical `body` rules and defers the sheet behind `media="print" onload`). The reviewer restored it with `git checkout -- extension/panel/index.html` after measuring, which is the same handling T005's Log records, and the primary worktree carries no non-`.project` change at this head

Residual, recorded rather than glossed: one gap this wave leaves open and states explicitly, carried into
FINAL.md. The initial bundle sits **71 bytes** below its recorded baseline (535,369 of 535,440), so the
next byte any eager file gains reddens `scripts/panel-bundle-budget.test.mjs`; the stylesheet was written
to the fewest declarations the five groups allow for exactly that reason, and there is no room for another
rule without a ruling. The git-ignore fact behind P002 is repaired as a gate but not as a policy: the
emitted `extension/panel/styles.css` is still never committed, so the built-file reading is taken only
where a build has run, and committing it instead is an owner decision with its own consequences (a
`.gitignore` change, a Prettier-formatted emit, and `format:check` then seeing the file).

## Intent coverage

### SC6 — `npm run check` and `npm test` pass at the head.: pass

- ✅ the gate is **green** at this head in the environment the gate runs in: a clean `git worktree` at
  `79bbdc2` with no `extension/panel/styles.css`, `node_modules` bridged exactly as `npm run check` bridges
  it, ran `node --test tests/held-out/e3-zero-skipped.test.mjs` — which spawns `npm test` — to exit 0, and
  `node --experimental-strip-types --test scripts/panel-styles.test.mjs` to 15 tests, 15 pass, **0 skipped**
- ✅ the cause of the `e5a3822` red is repaired and the assertion that caught it is untouched —
  `scripts/panel-styles.test.mjs:594` prints the not-measured line and returns instead of declaring a
  `skip:`, so `tests/held-out/e3-zero-skipped.test.mjs:42` reads `skipped 0` rather than `skipped 1`; the
  held-out file was not edited, no gate was widened and no budget was raised
- ✅ the stylesheet's own budget reading is unchanged and still passes — 535,369 B against 535.44 kB at
  this head, `4 tests, 4 pass` — and `npm run check` exited 1 nowhere in the sidecar that
  `prepare-final` isolated at this head; its execution is recorded `pass` in
  `.project/build/verify-ledger.jsonl` and its view is `.project/review/final-gap-1.md` with
  `Gap verdict: pass`
- ✅ the built-file assertions did not become dead code to reach the green — running
  `npx nx run angular-ai-devtools:build-extension` in the same clean worktree and re-running the suite made
  the reading present, and it asserted then: 1,955 bytes against the 1,024-byte floor, with
  `baselineFailures`, `stateColourFailures` and `darkFailures` all empty
