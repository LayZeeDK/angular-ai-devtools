# Final Review — M023 fixture-components

Reviewed HEAD: ceffcdf019651adce3ba546bd7615ce2cfc409fe
Overall verdict: blocked

<!-- Evidence reuse: the project Verify passed at this head (exit 0, recorded by prepare-final).
     The fixture proof pins are fresh (scripts/fixture-proof-fresh.test.mjs, 2/2). Two gap reviewers ran
     in isolated sidecars at this head; both returned `gaps`. This milestone's first final review blocked
     on eight decorative suites; wave 3 replaced them, wave 3's own review blocked on three restated
     assertions, wave 4 made those bite, and wave 3 re-reviewed green at cycle 2. What follows is judged
     from the suites themselves at this head, not from the task Logs. -->

## Success criteria

### SC1 — The harness target gives HAR-1 a root-boundary case with content outside the component root, HAR-2 a predicate case, HAR-3 an ambiguity case with two matching hosts, and HAR-4 an action case whose effect the harness observes.

- **Verdict**: not-met
- **Check**: E1 and E2 hold. Moving the projection point past the probe's own list reddens `fixture-harness-root-boundary.test.mjs:18`, and the page projects twice inside the probe roots and once outside; the ambiguity suite reddens when a distinguishing attribute is added to one host. E4 is genuinely behavioural now: `fixture-harness-action.test.mjs` transpiles the probe class, mounts its template in jsdom, dispatches a real click and reads the rendered `[data-state="count"]` text from 0 to 1 to 2 — making `advance()` a no-op reddens it. Three things do not hold. **E1's exclusion half has no assertion anywhere**: the intent's ruling names the browser check as the rendered leg, but that check only asserts both probe hosts appear, so nothing would catch content that fell outside the root. **E4 does not escape N7**: the rendered text it reads is the component's own `count()` getter evaluated against the instance, so the "observable effect" is still the component's state rendered verbatim. **E3 asserts against a subject the suite defines**: `fixture-harness-predicate.test.mjs` drives its own `matchItems` over a parsed item set, so a named no-match is proven of the test's evaluator, not of the harness.
- **Observed**: `npm test` green at this head (60 + 594, 0 fail) and the harness suites pass, but a green suite is not a proven criterion.
- **Reference**: `tests/held-out/fixture-harness-root-boundary.test.mjs:18`; `fixture-harness-ambiguity.test.mjs:24-46`; `fixture-harness-predicate.test.mjs`; `fixture-harness-action.test.mjs:109,136-159`; `.project/review/final-gap-1.md`; `.project/review/final-gap-2.md`; `.project/intent/INTENT.md ## Corrections`
- **Finding**: the ambiguity is guarded only across start-tag attributes and never across projected content, so two blocks inside one host and none in the other satisfies both the ambiguity suite and the boundary suite. The E1 ruling's browser leg is overstated relative to what the named check asserts.
- **Fix direction**: assert the exclusion half against the rendered page; make the action suite observe an effect that is not the component's own state; state E3's subject honestly as the planned match semantics or drive the real one.

### SC2 — The menu surface supplies the listbox and menu rules N23 needs, including at least one rule that fails when the attribute it reads is removed.

- **Verdict**: not-met
- **Check**: the "at least one rule that fails when its attribute is removed" half holds — the per-attribute mutant reddens exactly one rule and leaves its siblings green. The order half now genuinely bites: reversing the fixture's real `@for` iteration reddens both `fixture-aria-order.test.mjs` and the rule `listbox-option-order`. What fails is `menu-trigger-controls`: it passes whenever `aria-controls` equals any id present in the surface file, so a trigger pointing at the listbox returns `pass: true` with `aria-controls="components-listbox" resolves`. That is the N5-class defect this criterion exists to prevent, one rule to the left of the one the mutation suite exercises.
- **Observed**: the four attribute-reading rules still evaluate parsed source rather than the rendered tree, recorded only as review warnings and never ruled as E1's reading was.
- **Reference**: `tests/held-out/aria-rules.mjs:297-308`; `fixture-aria-order.test.mjs`; `fixture-aria-rule-mutation.test.mjs`; `.project/review/final-gap-2.md`
- **Finding**: a rule that cannot fail for the defect it names is exactly the class this milestone spent four waves repairing.
- **Fix direction**: assert that `aria-controls` resolves to the element the trigger controls, not to any id in the file, and redden it with a trigger pointing at a sibling id.

### SC3 — The fixture builds and serves, and the four shipped explainers still answer on it.

- **Verdict**: not-met
- **Check**: the build half is real — two production builds run, the entry documents are byte-compared, and the four component-package installs are guarded. The serve half is absent: no suite serves or fetches anything, so "builds and serves" is two builds. Worse, `installSetAfterOne` and `installSetAfterTwo` are measured back to back, which makes the between-cycles assertion a self-repeat. The explainer half proves only anti-tamper: `fixture-explainers-unchanged.test.mjs` shows four source files still hash to four pins, and no suite ever asks an explainer a question. Deleting an explainer from the panel's tool registry or route leaves all four pins matching.
- **Observed**: E6's pin is genuine and was repaired in-flight by T008; it answers N2, not SC3.
- **Reference**: `tests/held-out/fixture-rebuild-idempotent.test.mjs:118-152,200-216`; `tests/held-out/fixture-explainers-unchanged.test.mjs:15-19,31-52`; `.project/review/final-gap-2.md`
- **Finding**: both halves of this criterion name behaviour the milestone does not observe — a serve, and an explainer answering.
- **Fix direction**: serve the fixture and fetch the entry in the second cycle, taking the install-set measurement between the cycles; ask each explainer a question and assert its answer through the panel's own surface.

### SC4 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: the project Verify at this head exits 0; `npm run check` passes its five stages and `npm test` runs the node suites, the user-scope tests, the skills suites and the panel target with 60/60 and 594/594 passing and none failing. No criterion-carrying test is skipped.
- **Observed**: green wholesale, twice, on either side of the repair waves.
- **Reference**: `.project/build/verify-ledger.jsonl`; the prepare-final run at ceffcdf.
- **Finding**: none
- **Fix direction**: none

## Gaps carried into the record

Two gap reviewers returned `gaps` at this head. Beyond the criteria above they recorded: the `@angular/aria|cdk|material` `22.2.5` against a `22.2.2` core accepted in effect but unrecorded and unasserted, so nothing would catch a future drift; and the repaired suites now over-tight in ways a legitimate later change reddens — an assertion over every `readonly` field of `aria-surfaces.ts`, item vocabulary pinned as if it were order, and a pinned item count in a failure message.

## What this milestone got right

The fixture, the surfaces and the per-attribute mutation are real. Six decorative proofs were found and repaired across four waves, and each repair was verified by running the mutant rather than by reading a receipt. The remaining failures are narrower and named: a rule that resolves to any id, a serve that never happens, an explainer never asked a question, and an action whose effect is its own state.
