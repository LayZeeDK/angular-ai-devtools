# Evidence — pitfalls

Dimension: pitfalls
Questions assigned: Can a form be submit-enabled while the root carries an error, and does the fixture produce that case?

## Finding: an enabled submit beside a root error cannot occur in this fixture

- **Claim**: The binding ties disabled to the root's invalid, so enabled implies valid implies no root error. A test that asserts that combination on this fixture would be vacuous.
- **Source**: spikes/ng222-app/src/app/field-form-page.ts:18
- **Confidence**: medium
- **Why it matters here**: E4 must be written so it asserts the enabled case it can actually produce, not a contradiction

## Assigned questions — answers

- Can a form be submit-enabled while the root carries an error, and does the fixture produce that case? → Not in this fixture. Its submit is bound to the root's invalid, so enabled implies valid implies no root error. The module must still not assume the inverse holds for other apps.

## Dead ends

- None: every assigned question was answerable from the repository.
