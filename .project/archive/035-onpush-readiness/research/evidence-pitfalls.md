# Evidence — pitfalls

Dimension: pitfalls
Questions assigned: Does the panel's existing changeDetection field already satisfy part of SC1, making this a join rather than

## Finding: the existing read fails open

- **Claim**: two paths return onpush when nothing was read — the hook is absent, and the call throws
- **Source**: `extension/agent-main.js:660-671`
- **Confidence**: high
- **Why it matters here**: a join copying this shape inherits the inversion, reporting the unprovable case as the best case

## Assigned questions — answers

- Does the panel's existing changeDetection field already satisfy part of SC1, making this a join rather than → partly: the strategy half is already reported, but its fallbacks are wrong and cannot-tell has no implementation

## Dead ends

- trusting the existing field without reading its fallbacks
