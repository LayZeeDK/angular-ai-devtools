# Review — wave 1, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 2
Reviewed HEAD: 7c484804f6c92c7c5eca010a6bea09721bf268fc

## T001 — Give the fixture a form and record what its field state exposes: pass

- ✅ `scripts/field-state-capture.test.mjs` 5/5 pass, 0 skipped (x2); `research/raw/m031-field-state.json` validates: ng.getComponent exposed field tree, name + age fields with validity/errors, cross-field verdict observable (`name-too-short-for-age`).

## T002 — Read the field states and name the absence: pass

- ✅ `extension/field-state.js` pure read; `scripts/field-state.test.mjs` 7/7 pass, 0 skipped (4 behavior + 3 mutants). Module never echoes a field value and never names a rule function (grep: no `.value`/rule-function identifier; ownErrors copies only `{ kind }`).

## Intent coverage

### SC1 — On the fixture, a form with two validatable fields and a cross-field rule produces a FRM-1 finding naming each field's validity, the field's own errors, and whether submit is disabled.: pass

- ✅ T001 recording captures name/age validity + own errors + submit state via ng.getComponent; T002 read reports each field beside submit state.

### SC2 — The field state is read through the page agent's existing `window.ng` surface, with no second instrumentation path and no patch of the form.: pass

- ✅ Capture uses `window.ng.getComponent` only; no form patch; `field-state.js` reads given state only.

### SC3 — A form whose fields are all individually valid while submit stays disabled reports the form's own cross-field error kind when it carries one, and produces a "cannot tell" state when it carries none — never a rule the finding invents.: pass

- ✅ E3 pins kind present (`name-too-short-for-age`) and cannot-tell absent; mutant "naming cross-field function" reddens.
