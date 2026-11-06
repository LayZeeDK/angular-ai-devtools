# Evidence — similar

Dimension: similar
Questions assigned: Does the panel's existing changeDetection field already satisfy part of SC1, making this a join rather than

## Finding: the shipped explainers separate a fact from a verdict

- **Claim**: router-diagnostic names the unmatched segment and no cause, and legacy-structure carries form and source together or neither
- **Source**: `extension/router-diagnostic.js`; `extension/legacy-structure.js`
- **Confidence**: high
- **Why it matters here**: this milestone keeps the same shape, so a blocker is never emitted as a fact

## Assigned questions — answers

- Does the panel's existing changeDetection field already satisfy part of SC1, making this a join rather than → yes in register: the existing field can carry the strategy half if its fallbacks are corrected, and the blockers stay out of it entirely

## Dead ends

- emitting a blocker and calling it a fact
