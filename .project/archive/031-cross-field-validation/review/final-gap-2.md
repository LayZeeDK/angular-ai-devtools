# Gap Review — 2: proof strength

Reviewed HEAD: 1c05e439bf841f4c584f69f006f94b1233c3df4c
Gap verdict: pass
Risk: proof strength
Waves checked: 1, 2, 3, 4

## Checked evidence

- **Check**: `node --test scripts/field-state.test.mjs` before and after editing `extension/field-state.js` to report the rule's function name
- **Observed**: 7 pass before; 5 pass and 2 fail after, with `AssertionError` at `scripts/field-state.test.mjs:66:12` reporting `'nameTooShortForAgeFn'` where `'name-too-short-for-age'` is required; 7 pass again after restoring the file.
- **Reference**: scripts/field-state.test.mjs; extension/field-state.js

## Finding

- **Found**: The suite refuses the rule's identity on substance, not merely through a comment or a wrapper: naming the cross-field function as the root error reddens the root-kind equality pin. The evidence comes from the shipped extension module and its own test file.
- **Fix direction**: none

## Notes

- advisory: the suite pins the root kind's value, not its provenance, so any root-error shape the fixture does not build is unpinned. Recorded rather than changed, because T002 never produces one.
