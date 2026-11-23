# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: e32bd87327d772da5ef5c3852ff601d1c135e3d2

## T002 — Answer from the outlet record, purely: pass

- ✅ The landing is the work the contract names: `git show --stat e32bd873` carries the declared paths and nothing else, and the task Log records the commands that produced them.
- ✅ Landed paths: `extension/outlet-answer.js`, `scripts/outlet-answer.test.mjs`.
- ✅ `outletAnswer(record)` is a pure function of the record T001 writes, published at `globalThis.angularAiOutletAnswer` the way M061's join is published. Every answer is one object of the five contract fields built in one place, so a pin on its keys is a pin on every state.
- ✅ The one normalisation is written once: an absent `requested` is reported as `primary`. The record keeps `null`, because an unnamed outlet and `primary` are the same outlet while a configuration that states nothing is still a distinct fact.
- ✅ `outlet-absent` is the state where both names are recorded and differ; a missing `matched` is `cannot-tell` with the record's own reason. E7 and E2 pin the boundaries that the four state names leave open: a route the state never reached is not a mismatch, and two outlets declared in order name the first rather than the last read.
- ✅ Nine mutants were measured both ways — each drives the mutated value first and asserts it bit, then asserts the pin reddens — including a DOM fallback, a remedy string, a component-name fallback, a dropped normalisation, a last-name selection, dropped chain-level absences and a template-derived name.

## Intent coverage

### SC1 — A fixture route that declares a second named outlet produces a finding naming the outlet the route requested, the name the state matched and the route path; a mutant that renames the outlet in the route config reddens it, and the red says which name moved.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `e32bd873` and from the suite runs the Log records.

### SC2 — An outlet the router state does not carry reports `cannot-tell` with the reason the name is missing, and the answer never names the nearest outlet in the rendered tree; a mutant that falls back to a DOM-derived name reddens it.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `e32bd873` and from the suite runs the Log records.

### SC3 — The outlet name is read from a record this milestone writes, with no new page-side instrumentation and no second read of the inspected page; the record's shape and the join's inputs are the same list, asserted in one place.: pass

- ✅ Covered by T002: the evidence above is the assertion this criterion rests on, read from the landing at `e32bd873` and from the suite runs the Log records.
