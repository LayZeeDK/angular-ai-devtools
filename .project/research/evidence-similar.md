# Evidence — similar

Dimension: similar
Questions assigned: Does the recorded fact tree carry the root field's invalid flag separately from its error kinds?

## Finding: the sibling joins keep a read value apart from a judgement

- **Claim**: `resource-lifecycle.js` and `field-state.js` both report the value they read plus an explicit cannot-tell with a reason, never a derived verdict.
- **Source**: extension/resource-lifecycle.js, extension/field-state.js:46-98
- **Confidence**: high
- **Why it matters here**: the new capture adds a fact and changes no wording contract

## Assigned questions — answers

- Does the recorded fact tree carry the root field's invalid flag separately from its error kinds? → Yes. `root.invalid`/`root.valid` are read apart from `root.errors[]`: `extension/field-state.js:68` derives `rootInvalid` from the flags, while the kinds come from `root.errors[0].kind` at :63-67, and :77 handles invalid-with-no-kind as cannot-tell.

## Dead ends

- None: every assigned question was answerable from the repository.
