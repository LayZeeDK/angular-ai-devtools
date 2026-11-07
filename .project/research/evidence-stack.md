# Evidence — stack

Dimension: stack
Questions assigned: Which submit-state shape does the fixture's binding expose through the component instance, if any?

## Finding: the page exposes the root field, not the button

- **Claim**: The fixture binds `[disabled]="fieldForm().invalid()"`, a template expression. `ng.getComponent` reaches the component and its root field; it does not carry the button's disabled value.
- **Source**: spikes/ng222-app/src/app/field-form-page.ts:18,25-31
- **Confidence**: high
- **Why it matters here**: the join must take the submit state as an input, exactly as field-state.js already declares

## Assigned questions — answers

- Which submit-state shape does the fixture's binding expose through the component instance, if any? → The binding is a template expression, not component state: `[disabled]="fieldForm().invalid()"` (`field-form-page.ts:18`). Through the component instance you reach the ROOT FIELD and its `invalid()`; the button's own disabled state is separately observable on the element.

## Dead ends

- None: every assigned question was answerable from the repository.
