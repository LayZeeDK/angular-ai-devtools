# Evidence — domain

Dimension: domain
Questions assigned: Which submit-state shape does the fixture's binding expose through the component instance, if any?; Does the recorded fact tree carry the root field's invalid flag separately from its error kinds?

## Finding: the module already computes the submit state and the root kind

- **Claim**: `extension/field-state.js:70-97` derives `submit` from `submitState`/`submitDisabled`, reports `rootErrorKind`, and answers cannot-tell for a root invalid without a kind. Nothing in the contract is missing.
- **Source**: extension/field-state.js:46-98
- **Confidence**: high
- **Why it matters here**: M037 supplies a fact; it does not build an explanation layer

## Finding: the recorded fact never carried the submit state

- **Claim**: `research/raw/m031-field-state.json` has zero `disabled` and zero `submit` occurrences, so the module has been defaulting to enabled.
- **Source**: research/raw/m031-field-state.json
- **Confidence**: high
- **Why it matters here**: the milestone's work is capture and recording

## Assigned questions — answers

- Which submit-state shape does the fixture's binding expose through the component instance, if any? → The binding is a template expression, not component state: `[disabled]="fieldForm().invalid()"` (`field-form-page.ts:18`). Through the component instance you reach the ROOT FIELD and its `invalid()`; the button's own disabled state is separately observable on the element.
- Does the recorded fact tree carry the root field's invalid flag separately from its error kinds? → Yes. `root.invalid`/`root.valid` are read apart from `root.errors[]`: `extension/field-state.js:68` derives `rootInvalid` from the flags, while the kinds come from `root.errors[0].kind` at :63-67, and :77 handles invalid-with-no-kind as cannot-tell.

## Dead ends

- None: every assigned question was answerable from the repository.
