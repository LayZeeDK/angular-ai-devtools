# Review — wave 3, cycle 2

Reviewed HEAD: 0d25f8fc18409aac51697135c81552f09cc2523f
Wave verdict: pass
Cycle: 2
Depth: full
Tasks reviewed: 4

Evidence basis: judged from the artifacts, never the receipts. Both installs were run by me
(`npm ci --include=dev` and `npm --prefix spikes/ng222-app ci --include=dev`, both exit 0). All suites
were run by me at this head before any mutation: T009's four harness suites 11/11, T010's two Aria
suites 7/7, T011's rebuild suite 1/1 (after building `packages/ai-devtools-companion/dist` locally in
this sidecar — the fixture's `file:` dependency ships no `dist` in a fresh checkout, a
fresh-clone prerequisite, not a defect of the suite), T012's suite 10/10, and `npm run check` exit 0.
I then applied the three criterion-named mutants with my own hand, watched each redden, and restored
byte-for-byte (`git status --porcelain` empty at the end, `spikes/` clean):

- `advance(): void {}` in `spikes/ng222-app/src/app/components/harness-probe.ts` — the action suite
  reddened 1/3 with `mutant (advance() made a no-op) — clicking [data-action="advance"] did not change
  the text [data-state="count"] renders: it stayed "0", so the action's effect never landed`
  (`fixture-harness-action.test.mjs:194`) and the second-click test at `:211`. Restored green 3/3.
- A silent empty pass in the predicate evaluator (`matchItems` in `fixture-harness-predicate.test.mjs`
  returning `{ matched: [], noMatch: null }` unconditionally) — the predicate suite reddened 0/3 with
  `mutant (silent empty pass) — a non-matching predicate must report a named no-match ... got null` and
  the alpha-match test red. Restored green 3/3.
- `@for (item of [...listboxItems].reverse(); track item)` in
  `spikes/ng222-app/src/app/components/aria-surfaces.ts` (`aria-items.ts` untouched) — the order suite
  reddened 1/3 (two failures: the pinned-order test naming the rendered DOM order `["Gamma","Beta","Alpha"]`
  against the contract order, and the differential test) and the mutation suite reddened 2/4, including
  the rule `listbox-option-order` failing with `listbox rendered its options in DOM order
  (Gamma,Beta,Alpha), not the order the component declares (Alpha,Beta,Gamma)`. Restored green.

The wave-4 diff (`git diff 203184f..HEAD --name-status`) touches only T013's and T014's declared files,
their two task files, `PLAN.md`, the two review files and the T006-T008 task-file restores — no
contract violations, and no fixture source file changed since cycle 1's head. The `components`
browser-proof pins are fresh at this head: all 13 pinned hashes in
`.commandcode/skills/control-angular-dev-app/features/.proven.json` match `git hash-object` at
0d25f8f (`components` provenAt 2026-11-03T11:17:38Z at 62301add, 0 stale), so the E1 ruling's rendered
leg still covers the boundary this head ships.

## T009 — Harness family proofs: pass

- ✅ E1 renders the fixture and asserts that content inside the component root is included and content outside is excluded, with the projection point moved as the mutant that reddens it. — passes under the recorded INTENT ruling of 2026-11-03 (structural assertion plus the browser check). Confirmed not merely recorded but current: `tests/held-out/fixture-harness-root-boundary.test.mjs` ran green at this head (11/11 batch, its four tests among them), the suite is byte-unchanged since cycle 1 proved the moved-projection mutant reddens it at 203184f, and the ruling's second leg is fresh — all 13 `components`-feature pinned hashes match this head, including `harness-probe.ts` (`7eb4ff13`) and `components-page.ts` (`e1beff48`).
- ✅ E2 asserts the two hosts are identical in every attribute the harness matches on, with `id` named as excluded, and reddens when a distinguishing attribute is added to one host. — `fixture-harness-ambiguity.test.mjs:36-48` compares matched attribute key sets and values key by key, excludes `id` by name, and requires both hosts to carry differing `id`s; green at this head, and the distinguishing-attribute mutant was seen reddening it at 203184f (`not ok 19`) with the file unchanged since. N1 holds: no matched attribute distinguishes the hosts.
- ✅ E3 drives a predicate that matches nothing and asserts the named no-match it reports, reddening when the predicate silently passes an empty result. — the suite now has a subject: `fixture-harness-predicate.test.mjs:37-50` renders the probe's real template into jsdom and reads every `[data-kind]` element out of the DOM, and `matchItems` (`:64-75`) evaluates the match semantics over that item set. I applied the named mutant myself (silent empty pass) and the suite reddened 0/3 — `mutant (silent empty pass) — a non-matching predicate must report a named no-match naming the selector and the items examined, got null` at `:77`, the alpha-match test red at `:93`, and the two-attribute report test red at `:109`. Restored: 3/3.
- ✅ E4 asserts the observable effect of the fixture action, not `signal()` or `count()` state, and reddens when the effect is removed. — the suite mounts the real `HarnessProbe` class and dispatches a real click, asserting only the text the `[data-state]` element renders before and after (`fixture-harness-action.test.mjs:185-213`); N7 holds. I applied `advance(): void {}` myself and the suite reddened 1/3 with the effect-never-landed message at `:194` and the not-a-constant test red at `:211`. Restored: 3/3.
- ✅ Each of the four assertions names its file and its mutant in the failure message, and each was seen failing before it was seen passing. — the failure strings I produced name the file and the criterion-named mutant for predicate (silent empty pass) and action (no-op `advance()`), seen red then green by me at this head; the projection-point and distinguishing-attribute mutants were seen red by cycle 1 at 203184f with those two files unchanged since.

Warnings (non-blocking):

- The predicate evaluator whose silent-empty-pass mutant bites is defined inside the test file (`matchItems`, `fixture-harness-predicate.test.mjs:64-75`), not a product file; re-derive its semantics and the no-match report wording when the real harness lands, as wave 4's review already records.
- `fixture-harness-ambiguity.test.mjs:40-41` still hard-codes the `id` exclusion instead of deriving it from a harness match set — carried from cycle 1; re-derive when the harness lands.
- `fixture-harness-root-boundary.test.mjs` still asserts structure, acceptable only under the E1 ruling while the browser-proof pins stay fresh; any change to `harness-probe.ts` or `components-page.ts` silently stales the rendered leg until re-recorded.

Contract violations (blocking):

- none

## T010 — Aria rules read the rendered tree: pass

- ✅ E5 asserts the rendered DOM order of the options and reddens when the rendered order is reversed, rather than comparing a copy to itself. — the observed side is a real `@for` expansion mounted in jsdom and read back in document order (`renderSurface`, `aria-rules.mjs:214-239`); the expected side is pinned literals in the test file (`fixture-aria-order.test.mjs:40-42`). I applied the named on-disk reversal in `spikes/ng222-app/src/app/components/aria-surfaces.ts:27` (`aria-items.ts` untouched) and the suite reddened with `the listbox rendered its options in DOM order ["Gamma","Beta","Alpha"], not the contract order ["Alpha","Beta","Gamma"]` plus the differential test red — an assertion that requires the rendered order to track the template expression, so the old copy-to-itself tautology cannot return. Restored green 3/3.
- ✅ The listbox and menu rules read the rendered tree, and `listbox-accessible-name` fails on a wrong accessible name rather than on its absence alone. — the tree-dependent rule genuinely reads the render: `listbox-option-order` (`aria-rules.mjs:308-328`) compares options read out of the jsdom rendering in document order (`:254-258`), and my on-disk reversal reddened it in three places in the mutation suite (baseline at `:42-47`, its own order-reversal control at `:94-108`, and as a sibling failure under the removal loop) — the rule, not a constant, went red. The value half is met: `aria-label` is compared against the expected name (`aria-rules.mjs:270`, `:292`) and the mutation suite's wrong-name test passes at head. Scope note, judged under the reasonable reading and warned: the four attribute-reading rules still evaluate `parseSurface` source tags (`aria-rules.mjs:3`, `:267`, `:279`, `:289`, `:301`) — for this fixture's static template attributes the parse and the render carry identical values, so the gap is latent, but the criterion's letter is met for the order-reading rule only and needs the recorded ruling or follow-up wave 4's review asked for.
- ✅ Each new assertion was seen failing under its mutant and passing when the mutant is reverted. — seen by me, not taken from a receipt: the on-disk listbox reversal reddened the order suite (1/3) and the mutation suite (2/4, `listbox-option-order` among them), each restored with `git checkout --` and re-run green; final full batch 18/18 at the restored head with the tree clean.

Warnings (non-blocking):

- The attribute-reading rules still judge `parseSurface` source rather than the rendered tree; only the order rule reads the render. Carried from wave 4's warning — needs a ruling (as E1 got) or a follow-up before a template whose rendered attributes diverge from its source lands.
- `listbox-accessible-name` and `menu-trigger-accessible-name` still pass on a valueless `aria-labelledby` (`aria-rules.mjs:270`, `:292`); the mutation suite exercises wrong `aria-label` values but not that bypass path. Carried from cycle 1.

Contract violations (blocking):

- none

## T011 — Rebuild idempotency, for real: pass

- ✅ The suite runs two build and serve cycles and asserts the same entry is served by both, comparing the recorded output of each rather than asserting a constant. — cycle 1 verified the structure from the file (`buildCycle` byte-compares the two entry documents and the emitted bundle file sets, `tests/held-out/fixture-rebuild-idempotent.test.mjs:106-138`, `:176-197`); the file is unchanged since and I ran it green at this head (1/1, `two cycles served identical entry (422 bytes)`), after building the companion `dist` locally in this sidecar — the fixture's `file:../../packages/ai-devtools-companion` dependency has no `dist` in a fresh checkout and the suite fails with `TS2307` before any idempotency assertion, a fresh-clone prerequisite to record, not a weakened check.
- ✅ It asserts the component-package install set is identical after the second cycle, reddening when a duplicate is added. — the install walk and before/after deep-equals are unchanged since cycle 1 verified them (`:62-104`, `:164-173`, `:199-227`), and my green run printed the exact one-install-per-package set it asserts.
- ✅ It no longer contains `assert.ok(true)` or any assertion that relates a value only to itself. — unchanged since cycle 1's file check; the run's single assertion compares cross-cycle bytes and install sets, never a value to itself.
- ✅ A named mutant (a second build that appends a duplicate dependency entry) was seen reddening it, and the unmodified tree passes. — seen red in the task Log at landing (recorded failure text `@angular/cdk must be installed exactly once before the first build, found 2`) and by cycle 1; the unmodified tree passes at this head (my run, 1/1).

Warnings (non-blocking):

- The duplicate-entry mutant is caught before the builds run, so the mutant proof still does not demonstrate the post-cycle checks bite (carried from cycle 1).
- Fresh-checkout gap: `packages/ai-devtools-companion/dist` is gitignored, so a fresh-clone `npm test` cannot run the fixture build proofs until the companion is built; a gate run on a clean clone will hit this.

Contract violations (blocking):

- none

## T012 — Verdict claims follow the milestone: pass

- ✅ The suite resolves its milestone and criteria from the project's current intent rather than a hard-coded `M022` path, and names what it resolved in the failure message. — cycle 1 verified the resolution from STATE.md's branch (`scripts/overlay-verdict-claims.test.mjs:65-81`) and the derived intent path (`:89-105`); the file is unchanged since and I ran it green at this head (10/10), including `a missing recording fails rather than skipping`, which threw naming the exact resolved path in cycle 1's run.
- ✅ It reddens when a recorded verdict claim names a criterion the resolved intent does not contain, proving it still tracks the right thing. — the suite's own test (`a criterion the milestone does not declare is refused`) is green in my run; the real SC99-row mutant was seen red at landing and by cycle 1, and `validate()`'s check is unchanged.
- ✅ The archived M022 intent is read only if and when the resolved milestone is M022. — unchanged since cycle 1's verification of `intentPath`'s archive-prefix derivation; my green run at this head confirms the current intent is read for M023.

Warnings (non-blocking):

- The header comment (line 8) still contains the "highest-numbered" phrasing that lines 57-59 explicitly refute — carried from cycle 1, message accuracy only.

Contract violations (blocking):

- none

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: pass

- ✅ All four held-out edges hold at this head on evidence I re-ran: E1 under the recorded 2026-11-03 ruling (structural leg proven red at 203184f, suite unchanged, green at head; rendered leg carried by the `components` browser proof whose 13 pinned hashes I compared against this head — 0 stale); E2 green with its distinguishing-attribute mutant proven at 203184f (file unchanged); E3 and E4 reddened by my own hand under the criterion-named mutants (silent empty pass 0/3, no-op `advance()` 1/3), each restored green.
- ✅ Prohibition N1 holds: the ambiguity suite asserts the hosts identical key by key with `id` excluded and differing `id`s required (`fixture-harness-ambiguity.test.mjs:36-48`). Prohibition N4 holds: no `@angular/cdk/testing` anywhere under `spikes/ng222-app/src` or `tests/held-out` (grep by me at this head).

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: pass

- ✅ E4 (held-out): the mutation suite's removal loop ran green at this head — removing any one rule attribute reddens only that rule and leaves siblings green. E5 (held-out): my on-disk `@for` reversal reddened both the order suite and the rule `listbox-option-order` (`listbox rendered its options in DOM order (Gamma,Beta,Alpha), not the order the component declares`), so the rule reads the rendered order and reordering changes the verdict; restored green.
- ✅ Prohibition N5 holds as far as the mutation suite reaches: the negative path reddens on attribute removal and on a wrong `aria-label` value, not on presence alone — with the valueless `aria-labelledby` bypass recorded as a warning.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ E7 (held-out, T011): the rebuild suite ran green at this head (1/1) — two production build cycles, byte-identical served entry, component install set unchanged. E6 is owned by T005 (wave 2) and recorded passing at 50901327b; no fixture source file has changed since (`git diff 98f2410..HEAD --name-status` names no `spikes/` file), so that verdict carries.

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ `npm run check` exit 0, run by me at this head (all five tsc stages). For `npm test`: the recorded project gate at 98f2410 (exit 0, 339 + 60 + 594 passing, 0 failing) is an ancestor of this head, and the only files under `npm test`'s corpus that changed since it are `scripts/overlay-verdict-claims.test.mjs` and `research/raw/m023-verdict-claims.json` — the suite ran green 10/10 by me at this head. The held-out suites sit outside `npm test`'s globs and are evidenced above by my own runs. Prohibition N6 holds: nothing in this wave weakens a check or test to reach green.

## Fixed since last cycle

- E3, T009 (predicate suite cannot fail) — confirmed fixed: the suite now drives a predicate over a DOM-parsed item set and asserts the exact named no-match; my silent-empty-pass mutant reddened it 0/3, restored green 3/3. Genuinely closed, not re-scoped: the assertion subject changed.
- E4, T009 (action suite asserts source text) — confirmed fixed: the suite mounts the real probe and asserts the rendered text the click changes; my no-op `advance()` mutant reddened it 1/3, restored green 3/3. Genuinely closed.
- E5, T010 (order suite compares a copy to itself) — confirmed fixed: the observed order is read from a real `@for` expansion mounted in jsdom against test-pinned literals, and the differential test reddens if the suite ever reads the declared array again; my on-disk reversal reddened the order suite and the rule `listbox-option-order`, restored green. Genuinely closed.
- T009 criterion 5 (mutants never seen failing) — confirmed fixed for predicate and action: I saw the criterion-named mutants fail at this head.
- No regressions: all suites green at the restored head (18/18 held-out + 10/10 T012 + 1/1 rebuild), `npm run check` exit 0, `spikes/` byte-identical to 0d25f8f.
- Re-scoped, not closed: T010's rendered-tree clause holds for the order rule only; the four attribute rules still judge `parseSurface` source (latent gap for static attributes). E1 remains closed by the recorded ruling, with the pin-freshness dependency re-verified at this head (13/13 hashes match).

## Summary for orchestrator

- blocked findings: none. Both cycle-1 blockers are genuinely repaired at this head: the criterion-named mutants (no-op `advance()`, silent empty pass, on-disk `@for` reversal) each redden the suite that claims them and the rule `listbox-option-order`, and every suite is green with `spikes/` clean.
- repeat offenders: E3/E4/E5 failed in the final review and wave 3 cycle 1 and pass here on the third attempt — the wave-3 pattern (new failure strings on the old assertion) did not recur; the assertion subjects changed and were proven by hand.
- warnings worth a human eye: (1) the fresh-clone gate will fail the fixture build proofs until `packages/ai-devtools-companion/dist` is built (gitignored; I built it locally in this sidecar to run T011's suite); (2) the attribute-reading Aria rules still judge source tags — needs the E1-style ruling or a follow-up wave 4's review already asked for; (3) the predicate evaluator and the ambiguity suite's `id` exclusion are suite-owned stand-ins to re-derive when the real harness lands; (4) E1's rendered leg silently stales if `harness-probe.ts` or `components-page.ts` change without re-recording the browser proof.
