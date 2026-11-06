# Evidence — domain

Dimension: domain
Questions assigned: Which readiness inputs does ɵcmp expose on 22.2.2 — strategy, standalone, signal inputs, anything else?; Does the fixture already contain a component on each strategy, or does one need adding?

## Finding: no fixture component runs OnPush

- **Claim**: none of the twenty components sets changeDetection
- **Source**: `spikes/ng222-app/src/app/*.ts`
- **Confidence**: high
- **Why it matters here**: E3 needs a real OnPush subject

## Finding: no safety marker exists

- **Claim**: no field records async-pipe use, signal subscriptions or OnPush safety
- **Source**: `types/_debug_node-chunk.d.ts:2709-2808`; `types/core.d.ts:1561-1654`
- **Confidence**: high
- **Why it matters here**: the readiness verdict is not derivable from metadata

## Assigned questions — answers

- Which readiness inputs does ɵcmp expose on 22.2.2 — strategy, standalone, signal inputs, anything else? → onPush, signals, standalone and inputConfig, with no safety marker
- Does the fixture already contain a component on each strategy, or does one need adding? → no: none is OnPush, so one must be added

## Dead ends

- searching for an OnPush-safety flag: absent across all definitions
