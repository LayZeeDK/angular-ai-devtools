# Final Review — M037 signal-forms-doctor

Reviewed HEAD: 4af7c3b169b9eea29e437ab0b763fa485178e50c
Overall verdict: pass
Met: SC1, SC2, SC3, SC4, SC5, SC6

Spike S9 settled the shape before a criterion was written: a cross-field rule lands on the form root, and
the fixture disables submit from the root's `invalid`. The milestone then added the one fact the module had
never been given, removed the module's claim about an unread state, and stopped the pane asserting a cause it
was not handed.

## Success criteria

### SC1 — On the fixture, a form whose submit is disabled produces a finding naming the form, the submit state, and the root field's error kinds when the root carries any -- and naming no rule, element or remedy the fact list does not carry.

- **Verdict**: met
- **Check**: `scripts/field-state.test.mjs` 12/12 and `scripts/panel-fields.test.mjs` 14/14 at this head
- **Observed**: the recording carries the submit element's own `disabled` and the root's kinds; the join names both
- **Reference**: ``research/raw/m031-field-state.json``
- **Finding**: The finding names the form, the submit state and the root kinds, and no rule the fact did not carry.
- **Fix direction**: None.

### SC2 — A field's own error and a root-level (cross-field) error are reported as different things, in different places, with different words; neither is merged into the other.

- **Verdict**: met
- **Check**: `scripts/field-state.test.mjs` E3 pins the separation with two mutants
- **Observed**: a field's own error and the root kind occupy different keys and different wording
- **Reference**: ``extension/field-state.js``
- **Finding**: Neither side is merged into the other.
- **Fix direction**: None.

### SC3 — Both are produced from what the page already exposes through `ng.getComponent`, with no new page-side instrumentation and no build-output or dev-server dependency.

- **Verdict**: met
- **Check**: the capture reads the rendered element through the page, with no new hook
- **Observed**: `document.querySelector('button[type="submit"]').disabled` is read in the page context
- **Reference**: ``scripts/field-state-capture.test.mjs``
- **Finding**: The oracle is the page; no build output or dev server is consulted.
- **Fix direction**: None.

### SC4 — Where the record carries no submit state, the module reports "cannot tell" with that reason rather than inferring a disabled submit from field validity.

- **Verdict**: met
- **Check**: `scripts/field-state.test.mjs` E1 pins cannot-tell with four mutants
- **Observed**: a fact carrying neither submit field answers cannot-tell / submit-state-unreadable
- **Reference**: ``extension/field-state.js``
- **Finding**: The module no longer infers a submit state from field validity, or claims one it was not given.
- **Fix direction**: None.

### SC5 — The panel renders the field set, the submit state and the root kind, and renders nothing it was not given.

- **Verdict**: met
- **Check**: `scripts/panel-fields.test.mjs` 14/14, including the mutant that restores the fixed sentence
- **Observed**: the pane renders one sentence per reason it was handed, and none for a cause it was not given
- **Reference**: ``apps/angular-ai-devtools/src/app/panel-fields.ts``
- **Finding**: The view layer cannot assert a cause the module did not give.
- **Fix direction**: None.

### SC6 — `npm run check` and `npm test` pass at the head.

- **Verdict**: met
- **Check**: `npm run check` and `npm test` exit 0 at this head
- **Observed**: 842 + 60 + 628 + 341 + 85 pass, 0 fail; `git status` unchanged across the run
- **Reference**: `.project/build/verify-ledger.jsonl`
- **Finding**: The gate measures the tree it ships.
- **Fix direction**: None.
