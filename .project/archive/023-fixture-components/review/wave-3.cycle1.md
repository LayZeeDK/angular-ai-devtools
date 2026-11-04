# Review — wave 3, cycle 1

Reviewed HEAD: 203184f5dde5f239244b3abc14e1d8c66065fb20
Wave verdict: blocked
Cycle: 1
Depth: full
Tasks reviewed: 4

Evidence basis: every landing commit was inspected with `git show --stat` in the verify sidecar
(c3f86ae T009, 200a014 T010, b469254 T011, 9628267 T012; each touches only its declared `files`
plus its own task file). All suites were run by me at this head: the four T009 suites plus
`scripts/overlay-verdict-claims.test.mjs` pass 18/18, `fixture-aria-rule-mutation.test.mjs`
passes 3/3, `fixture-aria-order.test.mjs` passes 2/2. I then applied five targeted mutants in the
sidecar (projection point moved after the probe's list; `data-extra="1"` added to one host;
`advance()` made a no-op; the listbox `@for` reversed to `[...listboxItems].reverse()`; the
milestone's `research/raw/m023-verdict-claims.json` renamed away), re-ran all seven suites, and
restored the tree (`git status` clean at 203184f). Mutant results are cited per criterion below.
`npm test` covers none of the held-out suites, so the orchestrator's 594/594 gate run is not
evidence for any of them; the recorded task Verify output and my own runs are.

## T009 — Harness family proofs: fail

- ✅ E1 renders the fixture and asserts that content inside the component root is included and content outside is excluded, with the projection point moved as the mutant that reddens it. — passes under the recorded INTENT ruling of 2026-11-03, and the ruling is honestly applied, not an excuse. The structural half genuinely reddens: with `<ng-content>` moved after the probe's `<ul>` in `spikes/ng222-app/src/app/components/harness-probe.ts`, `fixture-harness-root-boundary.test.mjs` went red at its line 20 assertion (`not ok 22 - probe places ng-content before its own list so projected content lands inside the root`), and reverted green. The rendered half is carried by the browser check the ruling names: the `components` feature of `.commandcode/skills/control-angular-dev-app` is proven in a real browser (`.proven.json` `provenAt` 2026-11-03T11:17:38Z at commit 62301add, an ancestor of this head), and its pinned sources are byte-identical to this head — git blob `e1beff48` for `components-page.ts` and `7eb4ff13` for `harness-probe.ts` both match `git hash-object` of the head files, so the proven rendered boundary is the boundary this head ships.
- ✅ E2 asserts the two hosts are identical in every attribute the harness matches on, with `id` named as excluded, and reddens when a distinguishing attribute is added to one host. — `tests/held-out/fixture-harness-ambiguity.test.mjs:24-46` compares matched attribute key sets and values key by key, excludes `id` by name, and requires the hosts to differ in `id` only; adding `data-extra="1"` to host `probe-a` reddened it (`not ok 19`), reverted green. N1 holds on the fixture side: no matched attribute distinguishes the hosts.
- ❌ E3 drives a predicate that matches nothing and asserts the named no-match it reports, reddening when the predicate silently passes an empty result. — found: `tests/held-out/fixture-harness-predicate.test.mjs:10-17` is the pre-repair assertion unchanged except for failure-message text (`git show f00f627:tests/held-out/fixture-harness-predicate.test.mjs` matches it line for line in substance). It counts `data-kind="alpha"` and `data-kind="absent"` occurrences in the probe's source; it drives no predicate, evaluates no match result, and asserts no named no-match report. A predicate implementation that silently passes an empty result leaves this suite green — exactly the defect the criterion and final-gap-2's finding (2) name. The mutant the task Log claims was proven ("add absent item") only reddens a fixture-shape change, not the named behaviour.
  fix: give the suite a subject it can fail for the named reason: assert the no-match path against the planned harness match semantics, e.g. an in-suite predicate evaluator over the probe's parsed item set that must return a named no-match for `data-kind="absent"` and one match for `data-kind="alpha"` — or record an E3 ruling of the same kind as E1's if driving a predicate before the harness exists is out of scope. As delivered, the criterion is unproven.
- ❌ E4 asserts the observable effect of the fixture action, not `signal()` or `count()` state, and reddens when the effect is removed. — found: `tests/held-out/fixture-harness-action.test.mjs:10-21` asserts source text — that `data-action="advance"` exists and that `data-state="count"` is interpolated from `count()`. That is still `count()` state, now read out of the template string. I removed the action's observable effect (`advance(): void {}` in `harness-probe.ts`) and both tests stayed green: the click no longer changes anything and nothing reddens. The effect after the action is never observed, which is the HAR-4 defect and final-gap-2's finding (3) this task was opened to repair.
  fix: assert the effect, not the wiring: evaluate the probe's template semantics (click on the `data-action` element updates the text the `data-state` element renders) against a small rendered DOM, or record an E4 ruling like E1's if runtime observation is deferred to the harness milestone. A source regex over the interpolation cannot satisfy this criterion.
- ❌ Each of the four assertions names its file and its mutant in the failure message, and each was seen failing before it was seen passing. — found: the messages do name file and a mutant (`tests/held-out/fixture-harness-*.test.mjs` failure strings), but the mutants recorded as proven for predicate and action in the T009 Log ("add absent item", "remove count effect") are fixture-shape mutants, not the criterion-named mutants, so for E3 and E4 the named defect's mutant was never seen failing. The two criteria above fail on exactly this point.

Warnings (non-blocking):

- `fixture-harness-ambiguity.test.mjs` hard-codes that `id` is outside the harness match set; the harness does not exist yet, so a future harness that adds `id` to its match set resolves the ambiguity while this suite stays green. The exclusion should be re-derived when the harness lands.
- `fixture-harness-root-boundary.test.mjs` still asserts source text; acceptable only while the `components` browser proof keeps covering the rendered boundary — its provenance pins must be re-recorded whenever `harness-probe.ts` or `components-page.ts` change, or the ruling's second leg goes stale silently.

Contract violations (blocking):

- none

## T010 — Aria rules read the rendered tree: fail

- ❌ E5 asserts the rendered DOM order of the options and reddens when the rendered order is reversed, rather than comparing a copy to itself. — found: `tests/held-out/fixture-aria-order.test.mjs:11-24` builds the jsdom document *from* the declared `listboxItems` array it then compares against — the copy-to-itself tautology the task context names, with jsdom as decoration — and its only real teeth is the constant pin `['Alpha', 'Beta', 'Gamma']`, which existed before this task. I reversed the actual rendered order in the fixture template (`@for (item of [...listboxItems].reverse(); track item)` in `aria-surfaces.ts`), leaving `aria-items.ts` untouched, and both tests stayed green: the rendered order changed, the verdict did not. E5's second clause, "the rule reads that order", is also unmet: `tests/held-out/aria-rules.mjs` contains four rules and none of them reads option order.
  fix: parse the surface template's own iteration (or render the `app-aria-surfaces` template into a DOM the way the suite already imports jsdom for) and assert that DOM order against the pinned sequence, and add or extend a rule whose verdict depends on the options' order, so a template-level reversal reddens.
- ❌ The listbox and menu rules read the rendered tree, and `listbox-accessible-name` fails on a wrong accessible name rather than on its absence alone. — found: first clause unmet. `tests/held-out/aria-rules.mjs:6-73` still evaluates `parseSurface` over the `aria-surfaces.ts` source text; the task's own Context names "evaluate parsed source rather than the rendered DOM" as the defect, and the landed diff to `aria-rules.mjs` only adds value-checking. A rule can still hold while the rendered tree breaks it. The second clause is met: `aria-label` is compared against the expected name (`aria-rules.mjs:32-34`, `:52-54`), the mutation suite's wrong-name case passes, and the recorded mutant text matches the code.
  fix: evaluate the rules over a parsed rendering of the surface (the same jsdom route the order suite should take), or record a ruling that source evaluation is the contract for this milestone and why, as E1's ruling did.
- ✅ Each new assertion was seen failing under its mutant and passing when the mutant is reverted. — the mutation suite is genuinely self-testing and I ran it green at head (3/3): `fixture-aria-rule-mutation.test.mjs:20-44` removes each rule's attribute from the parsed tag, requires the target rule to redden and every sibling to stay green (E4's edge, met), and `:46-60` reddens the accessible-name rules on a wrong name. Its structure can fail — a rule that ignores its attribute reddens it. The order test's recorded "reversed mutant" only reverses the declared array, which the constant pin catches; it is not the rendered-order mutant the criterion names (see the ❌ above).

Warnings (non-blocking):

- `listbox-accessible-name` and `menu-trigger-accessible-name` pass on the mere presence of `aria-labelledby` regardless of its value (`aria-rules.mjs:33`, `:54`), so a wrong name behind `aria-labelledby` slips through the value check; the mutation suite never exercises that path.

Contract violations (blocking):

- none

## T011 — Rebuild idempotency, for real: pass

- ✅ The suite runs two build and serve cycles and asserts the same entry is served by both, comparing the recorded output of each rather than asserting a constant. — `tests/held-out/fixture-rebuild-idempotent.test.mjs:106-138` and `:176-197`: `buildCycle` runs `ng build --configuration production` through the fixture's own `@angular/cli` into two distinct output directories (lines 177 and 180), requires `Application bundle generation complete`, then byte-compares the two entry documents (length plus base64 equality of the full buffer, lines 183-192) and compares the emitted bundle file sets. Nothing is compared to a constant. Not re-run here (two production builds; the fixture install is absent in this sidecar) — judged from the file plus the recorded task Verify in the Log. The cycles build rather than live-serve; the built `index.html` is the entry any server serves, a reasonable reading of E7's "the same entry served".
- ✅ It asserts the component-package install set is identical after the second cycle, reddening when a duplicate is added. — lines 62-104 walk the fixture's `node_modules` for `@angular/aria`, `@angular/cdk`, `@angular/material` and `@angular/core` occurrences; lines 164-173 require exactly one install of each before the first build, and lines 199-227 require the set unchanged after each cycle and exactly one install after the second. A nested duplicate `@angular/cdk` reddens the pre-build check — the recorded mutant failure in the task Log (`@angular/cdk must be installed exactly once before the first build, found 2`) matches the assertion at line 171.
- ✅ It no longer contains `assert.ok(true)` or any assertion that relates a value only to itself. — no `assert.ok(true)` remains; every assertion compares an independent measurement (manifest text counts, install walks, cross-cycle bytes) rather than a value to itself.
- ✅ A named mutant (a second build that appends a duplicate dependency entry) was seen reddening it, and the unmodified tree passes. — recorded in the task Log with the actual failure text, and the unmodified tree passes (1/1 recorded; the suite is also structurally capable of failing, per the checks above). A missing fixture install fails with a directive to install rather than skipping (`requirePrerequisite`, lines 140-147) — fail, never skip.

Warnings (non-blocking):

- The duplicate-entry mutant is caught before the builds run (the pre-build occurrence check), so the mutant proof does not demonstrate that the *post-cycle* checks bite; the before/after deep-equals at lines 202-216 are the guards that would catch a duplicate introduced between cycles.

Contract violations (blocking):

- none

## T012 — Verdict claims follow the milestone: pass

- ✅ The suite resolves its milestone and criteria from the project's current intent rather than a hard-coded `M022` path, and names what it resolved in the failure message. — `scripts/overlay-verdict-claims.test.mjs:65-81` reads `branch:` from `.project/STATE.md` (matches `gsd-path/M023`, verified against STATE.md line 9), asserts the number rather than guessing, and throws naming the exact resolved path `research/raw/m023-verdict-claims.json` when it is absent; `intentPath` (lines 89-105) reads the current `.project/intent/INTENT.md` for a live milestone. I renamed the recording away and the suite failed its two `load()`-based tests with that ENOENT — no fallback to M022's file or any highest-numbered file.
- ✅ It reddens when a recorded verdict claim names a criterion the resolved intent does not contain, proving it still tracks the right thing. — the suite's own test at lines 383-393 proves `validate()` refuses an undeclared criterion, and the recorded real mutant (an `SC99` row) reddened the resolved path per the task Log; `validate()` line 226 checks `Object.hasOwn(deps.criteria, ...)`.
- ✅ The archived M022 intent is read only if and when the resolved milestone is M022. — `intentPath` (lines 89-105) derives the archive prefix from the resolved milestone's number and reads the archived intent, e.g. `.project/archive/022-in-page-overlay/intent/INTENT.md` for M022 — the archive directory whose name starts with the resolved milestone's zero-padded number — only for that milestone; no `023-` archive exists, so the current intent is read, which is what the suite validated against.

Warnings (non-blocking):

- The file's header comment (lines 7-9) still says it "reads the highest-numbered `research/raw/mNNN-verdict-claims.json`", contradicting the branch-based resolution the code implements and documents at lines 57-62; and the Log's recorded mutant text ends "(resolved milestone M023)" while the code's criterion message (`${where} is not a criterion the intent declares`) does not include the resolved milestone — the resolved path is named only in the missing-recording error.
- `research/raw/m023-verdict-claims.json` is honest: the four `not-required` reasons are criterion-specific (harness target served only by the counter fixture; listbox/menu surface exists on no portal route; SC3's facts produced by the recorded project Verify and the explainer pin; SC4 is an aggregate gate with no page), each answers the portal clause by name, and each `criterionText` quotes INTENT.md verbatim — the suite enforces the quote character for character and passed.

Contract violations (blocking):

- none

## Intent coverage

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.: fail

- ❌ E1 (held-out, ruled 2026-11-03): pass — the structural assertion reddens when the projection point moves (my mutant: `not ok 22`), and the rendered boundary is evidenced by the `components` browser proof whose pinned sources are byte-identical to this head. E2 (held-out): pass — distinguishing attribute reddens (`not ok 19`). E3 (held-out): fail — the suite never drives a predicate or asserts a named no-match report; a silent empty pass stays green. E4 (held-out): fail — removing the action's observable effect (`advance()` no-op) leaves the suite green. Two of the four held-out edges of SC1 cannot fail for the defect they name, so SC1 fails.
- ✅ Prohibition N1 holds on the fixture: the two hosts are identical in every non-`id` attribute, asserted key by key, and both carry differing `id`s.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.: fail

- ❌ E4 (held-out): pass — removing any one rule attribute reddens that rule and leaves its siblings green (suite run green at head, structure able to fail). E5 (held-out): fail — the rendered option order is not asserted (template-level reversal stayed green) and no rule reads order. A held-out edge of SC2 failing fails the SC.
- ✅ Prohibition N5 holds as far as the mutation suite reaches: the negative path reddens on attribute removal and on a wrong `aria-label` value, not on presence alone — with the `aria-labelledby` presence bypass recorded as a warning.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.: pass

- ✅ E7 (held-out, T011): the suite runs two production build cycles, byte-compares the served entry documents, and guards the component-package install set against duplicates before and after both cycles; the recorded duplicate-package mutant reddened it and the unmodified tree passes. E6 is owned by T005 (wave 2) and recorded passing there (`tests/held-out/fixture-explainers-unchanged.test.mjs`, ledger row at 50901327b).

### SC4 — `npm run check` and `npm test` pass at the head.: pass

- ✅ Recorded by the orchestrator at this head: `npm run check` exit 0 and `npm test` exit 0 with 60/60 and 594/594 passing, 0 failing; not re-run per the brief. T012's held-out suite passes at this head (run by me, 10/10). Prohibition N6 holds: nothing in this wave weakens a check to reach green — the two warnings on `overlay-verdict-claims.test.mjs` are comment/message accuracy, not weakened assertions.

## Summary for orchestrator

- blocked findings: two disjoint file scopes. (1) `tests/held-out/fixture-harness-predicate.test.mjs` and `tests/held-out/fixture-harness-action.test.mjs` (T009, SC1/E3+E4): both suites are the pre-repair source-count assertions with new failure strings; neither can fail for the behaviour its criterion names — proven by mutants (no-op `advance()` stayed green; no predicate subject exists to mutate). (2) `tests/held-out/fixture-aria-order.test.mjs` and `tests/held-out/aria-rules.mjs` (T010, SC2/E5 + the rendered-tree clause): the order check is a copy-compared-to-itself plus the pre-existing constant pin, and a template-level reversal left it green; the rules still evaluate parsed source, not a rendered tree. Fix direction per task above; an E1-style recorded ruling is the honest alternative for either scope if runtime/rendered evaluation is ruled out of this milestone's cost.
- repeat offenders: E1/E3/E4/E5 were named by the final review and final-gap-2, repaired for E1 and E2 only, and re-fail here for the same reason on E3/E4/E5 — the repair pattern "new failure strings on the old assertion" is the thing to watch on the next attempt.
- warnings worth a human eye: the ambiguity suite's `id` exclusion is asserted, not derived from a harness match set (re-derive when the harness lands); the E1 ruling depends on the `components` browser proof's provenance pins staying fresh; `listbox-accessible-name` passes on a valueless `aria-labelledby`; `overlay-verdict-claims.test.mjs`'s header comment contradicts its own resolution logic and its Log's mutant message text; the rebuild proof's mutant bites before the builds rather than between cycles.
