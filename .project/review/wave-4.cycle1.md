# Review — wave 4, cycle 1

Reviewed HEAD: d655aacf273bfaa74fddce310cb2cc1a81f61410
Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 2

Evidence basis: judged from the artifacts, not the receipts. Both installs were run by me
(`npm ci --include=dev`, `npm --prefix spikes/ng222-app ci --include=dev`, both exit 0). All six held-out
suites were run by me at head before any mutation: predicate 3/3, action 3/3, aria-order 3/3,
aria-rule-mutation 4/4, ambiguity 2/2, rebuild-idempotent 1/1 — 16/16 green. I then applied four mutants
with my own hand and watched each redden, restoring byte-for-byte after each (`git status --porcelain`
clean, `git diff HEAD` empty at the end):

- `advance(): void {}` in `spikes/ng222-app/src/app/components/harness-probe.ts` — action suite 1/3, two
  failures naming the effect that never landed.
- silent empty pass in the predicate suite's evaluator (`matchItems` returns `noMatch: null` for every
  result) — predicate suite 1/3, two failures.
- `@for (item of [...listboxItems].reverse(); track item)` in
  `spikes/ng222-app/src/app/components/aria-surfaces.ts` (on disk, `aria-items.ts` untouched) — order suite
  2/3 and mutation suite 2/4 fail, including `listbox-option-order` reddening with
  `listbox rendered its options in DOM order (Gamma,Beta,Alpha), not the order the component declares (Alpha,Beta,Gamma)`.
- `@for (item of [...menuItems].reverse(); track item)` in the same file — order suite 2/3, only the menu
  test red, `Close,Save,Open` against the pinned `Open,Save,Close`.

The wave-4 diff (`git diff 203184f..HEAD --name-status`) touches only the two tasks' declared `files` plus
`.project/plan/PLAN.md`, the two task files and the committed wave-3 review — no contract violations. The
recorded task-Log failure texts match the failure strings I produced under the same mutants.

## T013 — Predicate and action suites learn to fail: pass

- ✅ Making the fixture action's `advance()` a no-op reddens the action suite, and the failure names the effect that did not happen. — I applied `advance(): void {}` to `harness-probe.ts:19` myself: `node --test tests/held-out/fixture-harness-action.test.mjs` exited 1, 1/3 pass, with `mutant (advance() made a no-op) — clicking [data-action="advance"] did not change the text [data-state="count"] renders: it stayed "0", so the action's effect never landed` (assertion at `fixture-harness-action.test.mjs:194-198`) and the second-click test red at `:211`. The suite does mount the real probe and dispatch a real click: `loadProbe` (`:76-104`) transpiles the real `HarnessProbe` class out of the fixture's TypeScript against the workspace's own `@angular/core` (`import.meta.resolve('@angular/core')`, `:80`), `mount` (`:129-172`) wires the template's `(click)="advance()"` binding to a listener and repaints the `{{ }}` text nodes from that instance, and the test dispatches a real `MouseEvent('click')` (`:168`). Reverted: 3/3 green.
- ✅ The predicate suite drives a real predicate against the fixture, asserts the named no-match a non-matching predicate reports, and reddens when the predicate silently passes an empty result. — `fixture-harness-predicate.test.mjs:37-50` builds the subject from the probe's real template rendered into jsdom (every `[data-kind]` element with tag, text and attributes read back out of the DOM), and `matchItems` (`:64-75`) evaluates the planned harness match semantics over that item set. Test 1 (`:77-91`) requires the exact named report `no element under <app-harness-probe> matches [data-kind="absent"] (3 items examined)`; test 2 (`:93-107`) requires `data-kind="alpha"` to match exactly `li:alpha item`; test 3 (`:109-123`) requires the report to name every attribute of a two-attribute non-matching predicate. I made the predicate silently pass an empty result (`matchItems` returning `noMatch: null` unconditionally) and the suite reddened 1/3 with `mutant (silent empty pass) — a non-matching predicate must report a named no-match ... got null` on tests 1 and 3. Reverted: 3/3 green.
- ✅ Neither suite counts occurrences in source text as its primary assertion; each names the rendered or executed behaviour it checks. — No `readFileSync`-and-count remains in either suite's assertions: the action suite's subject is the text the mounted `[data-state]` element renders before and after a dispatched click (`:178-213`), and the predicate suite's subject is a match result over DOM-parsed items (`:77-123`); the only source reads left are the template literal extraction itself (`:40-44`, `:27-31`), which feeds the render, not the assertion. Each failure string names the file and the mutant, per the wave-3 finding.
- ✅ Each new assertion was seen failing under its mutant and passing when the mutant was reverted. — Seen by me, not taken from the Log: action no-op mutant red (1/3) then green (3/3) after `git checkout`; predicate silent-empty-pass mutant red (1/3) then green (3/3) after revert. The Log's additional mutants (`this.count.set(1)`, `items.filter(() => true)`) are consistent with the assertions' structure — the constant-set mutant is caught by the second-click test at `:202-213`, the selector-ignoring mutant by tests 1 and 2's exact match counts.

Warnings (non-blocking):

- The predicate evaluator whose silent-empty-pass mutant reddens the suite is defined inside the test file itself (`matchItems`, `fixture-harness-predicate.test.mjs:64-75`), so that mutant mutates suite-owned code, not a product file; the fixture-side half (the probe's parsed item set, and the `alpha` match asserted exactly) is real and my fixture-touching checks confirm the subject bites. When the real harness lands, its no-match report wording and match semantics should be re-derived here, as the wave-3 `id`-exclusion warning already requires for the ambiguity suite.

Contract violations (blocking):

- none

## T014 — Aria order compares the real render: pass

- ✅ The expected order is not derived from the same array the assertion reads: reversing the fixture's real rendered iteration reddens the suite, and the failure names the rendered order it saw. — `fixture-aria-order.test.mjs:40-42` pins `LISTBOX_ORDER`, `REVERSED_LISTBOX_ORDER` and `MENU_ORDER` as literals in the test file; the observed side comes from `renderSurface` (`aria-rules.mjs:214-239`), which expands the template's real `@for` blocks against the component's scope and mounts the expansion in jsdom, reading option text back in document order (`:72-94`). I reversed the listbox's real `@for` iteration on disk in `spikes/ng222-app/src/app/components/aria-surfaces.ts:27` (`aria-items.ts` untouched) and the suite reddened 2/3 with `the listbox rendered its options in DOM order ["Gamma","Beta","Alpha"], not the contract order ["Alpha","Beta","Gamma"]`; the menu reversal reddened only the menu test, with `["Close","Save","Open"]` against the pinned `["Open","Save","Close"]`. Reverted byte-for-byte; `git status` clean.
- ✅ At least one Aria rule reads the option order from the rendered tree, and reordering the rendered options changes that rule's verdict. — `listbox-option-order` (`aria-rules.mjs:308-328`) compares `renderedListboxOptions(surface)` — options read out of the jsdom rendering in document order (`:254-258`) — against the declared order, so its verdict depends on the render, not the source parse. My on-disk listbox reversal reddened it three ways in the mutation suite: the all-rules baseline failed with `listbox rendered its options in DOM order (Gamma,Beta,Alpha), not the order the component declares (Alpha,Beta,Gamma)` (`fixture-aria-rule-mutation.test.mjs:42-47`), its own order-reversal control failed at `:98-108` (`listbox-option-order already fails on the unmutated ... so this suite cannot tell the order mutant from the fixture`), and it also surfaced as a sibling failure under the attribute-removal loop — each proof that the rule, not a constant, went red. Restored green.
- ✅ The suite no longer compares a list to a transformed copy of itself. — The declared-array copy is gone: nothing in `fixture-aria-order.test.mjs` builds its observed DOM from the array it asserts against; every observation is `renderSurface(template, scope)` output (`:59-70`, `:72-94`), and the suite's differential third test (`:96-126`) applies `reverseIteration` to the template in memory and requires the rendered order to flip to the pinned reversed literal — an assertion that reddens if the suite ever reads the declared array again. The old self-comparison from the wave-3 finding is not present.
- ✅ Each new assertion was seen failing under its mutant and passing when the mutant was reverted. — Seen by me on disk, not from the Log: listbox reversal red (order 2/3, mutation 2/4, `listbox-option-order` among the failures), menu reversal red (order 2/3), each restored with `git checkout --` and re-run green; final full batch 16/16 with `git diff HEAD` empty.

Warnings (non-blocking):

- `listbox-accessible-name` and `menu-trigger-accessible-name` still pass on a valueless `aria-labelledby` (`aria-rules.mjs:269-271`, `:291-293`), carried over from the wave-3 warning; the mutation suite exercises wrong `aria-label` values but not the `aria-labelledby` bypass path.
- `parseSurface`'s attribute parse (`aria-rules.mjs:18-40`) reads source tags, so the attribute rules still judge source text rather than the rendered tree; the wave-3 finding's first clause is answered for the order rule only. The fifth rule plus the render path now cover E5, which is what this wave was opened for, but the source-vs-rendered gap on the attribute rules remains open and is worth a ruling or a follow-up.

Contract violations (blocking):

- none

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: pass

- ✅ E3 and E4, the two edges the wave-3 review blocked on, now hold: I made `advance()` a no-op and the action suite reddened naming the effect that never landed, and I made the predicate silently pass an empty result and the predicate suite reddened naming the missing no-match report (both reverted green, 3/3 each). E1 and E2 are owned by T009 and were confirmed passing in the wave-3 review at 203184f; neither `harness-probe.ts`'s projection structure nor `components-page.ts` changed in wave 4 (`git diff 203184f..HEAD --name-status` names no fixture file), and my ambiguity re-run stayed green (2/2), so those verdicts carry to this head.
- ✅ Prohibition N7 holds: the action suite reads only the text the `[data-state]` element renders before and after the click (`fixture-harness-action.test.mjs:185-213`); `count()` and `signal()` state are never read — the suite's own header records this and the assertions bear it out.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: pass

- ✅ E5 now holds with teeth: the rendered order is read from a real `@for` expansion mounted in jsdom against literals pinned in the test, my on-disk reversal of the fixture's listbox iteration reddened both the order suite and the fifth rule `listbox-option-order`, and the menu reversal reddened only the menu case. E4 (attribute removal reddens that rule and leaves siblings green) was re-run green by me at this head (mutation suite 4/4, including `removing one rule attribute reddens only that rule` exercising every attribute-reading rule).
- ✅ Prohibition N5 holds as far as the mutation suite reaches: the negative path reddens on attribute removal and on a wrong `aria-label` value (`fixture-aria-rule-mutation.test.mjs:152-172`), not on presence alone — with the `aria-labelledby` valueless bypass still recorded as a warning.

## Summary for orchestrator

- blocked findings: none. Both wave-3 blockers are genuinely repaired: the named mutants (no-op `advance()`, silent empty pass, on-disk `@for` reversal) each redden the suite that claims them, and every suite is green at the restored head with `spikes/ng222-app` byte-identical to `d655aac`.
- repeat offenders: E3/E4/E5 failed in the final review, again in wave 3, and pass here on the third attempt — the wave-3 pattern ("new failure strings on the old assertion") did not recur; the assertions themselves changed, and the mutants I ran are the criterion-named ones, not fixture-shape substitutes.
- warnings worth a human eye: (1) the rebuild-idempotent suite cannot run in a fresh checkout until `packages/ai-devtools-companion/dist` is built — the fixture's `file:../../packages/ai-devtools-companion` dependency has no `dist` outside the primary worktree, so E7 there fails with `TS2307: Cannot find module 'ai-devtools-companion'` before any idempotency assertion runs (I built the dist locally in the sidecar to unblock it; it is gitignored and the tree is clean); a fresh-clone gate run will hit this. (2) The predicate suite's silent-empty-pass mutant is a mutation of suite-owned evaluator code, not a product file — re-derive its match semantics and report wording when the real harness lands, together with the ambiguity suite's `id` exclusion. (3) The attribute-reading Aria rules still judge `parseSurface` source tags rather than the rendered tree; only the order rule reads the render.
