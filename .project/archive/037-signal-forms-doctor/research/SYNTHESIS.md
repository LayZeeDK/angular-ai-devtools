# Synthesis — M037 signal-forms-doctor

## Settled

Spike S9 is answered: a cross-field rule attaches to the form **root** (`validate(f, …)` at
`field-form-page.ts:29-31`), and the fixture's submit is disabled by `fieldForm().invalid()` (`:18`). The submit
state is therefore explained by the root field's `invalid`, never by a field alone.

The module already implements the whole contract: `extension/field-state.js:70-97` derives `submit` from
`submitState`/`submitDisabled`, reports `rootErrorKind`, and answers `cannot-tell` with
`root-invalid-without-error-kind`. What is missing is the fact: `research/raw/m031-field-state.json` contains zero
`disabled` and zero `submit` occurrences, so the module has been defaulting to `enabled`.

## Decisions

### D1 — the milestone adds a fact, not a second explanation layer

- **Decision**: the work is capture plus recording plus the demo fact. No new module, no new wording contract.
- **Runner-up**: a dedicated submit-state module composed over `field-state.js`.
- **Evidence**: `extension/field-state.js:46-98` already yields `submit`, `submitState`, `rootErrorKind` and the
  cannot-tell reason; a second layer would duplicate them.
- **Confidence**: high

### D2 — the submit state comes from the root field, not from field validity

- **Decision**: read `root.invalid` (and the submit element's own `disabled` where it is reachable) and carry it as
  the fact. Never derive a disabled submit from the fields being invalid.
- **Runner-up**: infer disabled from "every field valid" alone.
- **Evidence**: a form can be invalid at the root with every field valid — that is exactly the cross-field case
  (`field-form-page.ts:29-31` with two individually valid fields).
- **Confidence**: high

### D3 — the recorded fact is re-captured, not hand-edited

- **Decision**: a new recording carries `submitDisabled`/`submitState` and the root kinds; the M031 recording is
  re-captured through its own capture path.
- **Runner-up**: append the field to the existing JSON by hand.
- **Evidence**: every other recording in this programme is produced by an armed capture; hand-editing evidence is
  the defect class the M036 gate hunted.
- **Confidence**: high

### D4 — E4 asserts the enabled case the fixture can actually produce

- **Decision**: E4 covers submit-enabled with the root valid; it does not assert "enabled with a root error", which
  this fixture cannot produce because its binding ties disabled to invalid.
- **Runner-up**: keep the original E4 wording and let it fail.
- **Evidence**: `field-form-page.ts:18` — enabled implies valid implies no root error.
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: the fact shape must gain the submit fields; the M031 recording is stale for them; the demo
  fact in `panel-demo.ts` must supply a submit state or the pane will render the default.
- **Walking skeleton**: T001 measures what the page exposes for the submit state and captures it; T002 records,
  supplies the demo fact, re-cuts the pins the change moves, and runs the gate.
- **Pitfalls → tasks**: the impossible E4 belongs in T001's acceptance wording, not in a later test; the "never
  infer from field validity" prohibition belongs in T002's join call shape.

## User rulings

None required. The standing grant for this milestone covers intent, plan, rulings and ship; recorded at
`inspect/active` with `milestone: null`.

## Still unknown

- Whether Signal Forms ever reports a **field** that is disabled independently of the root; the fixture binds only
  the root.
- Whether `invalid()` and a non-empty `errors[]` can disagree; nothing asserts it yet.
- Async or pending rule states; the fixture has none.
