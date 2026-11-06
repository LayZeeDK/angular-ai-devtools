# Evidence — stack

Dimension: stack
Questions assigned: Which readiness inputs does ɵcmp expose on 22.2.2 — strategy, standalone, signal inputs, anything else?

## Finding: no changeDetection field, only onPush

- **Claim**: the runtime def carries onPush: boolean and the hook synthesises changeDetection from it
- **Source**: `fesm2022/_debug_node-chunk.mjs:10152`, `:1976`; `types/_debug_node-chunk.d.ts:2765-2766`
- **Confidence**: high
- **Why it matters here**: the join must read onPush

## Finding: OnPush = 0, Eager = 1

- **Claim**: Default is a deprecated alias of Eager
- **Source**: `types/_debug_node-chunk.d.ts:4876-4887`
- **Confidence**: high
- **Why it matters here**: the existing === 0 test is correct

## Finding: signal inputs are distinguishable

- **Claim**: inputConfig marks SignalBased = 1
- **Source**: `fesm2022/_debug_node-chunk.mjs:5313-5315`
- **Confidence**: high
- **Why it matters here**: one readiness fact is available

## Finding: signal outputs are not

- **Claim**: no OutputFlags exists
- **Source**: `fesm2022/_debug_node-chunk.mjs:10225-10233`
- **Confidence**: high
- **Why it matters here**: no output fact may be promised

## Finding: panel 22.1.8, fixture 22.2.2

- **Claim**: the versions differ
- **Source**: `node_modules/@angular/core/package.json`
- **Confidence**: high
- **Why it matters here**: re-measure on the shipped version

## Assigned questions — answers

- Which readiness inputs does ɵcmp expose on 22.2.2 — strategy, standalone, signal inputs, anything else? → onPush, signals, standalone, inputs and inputConfig are exposed; there is no changeDetection field and no OnPush-safety marker.

## Dead ends

- reading a changeDetection field off the runtime def: the field does not exist, only onPush.
- a signal-output flag: no OutputFlags exists in the package.
