# FINAL — M066 schema-disabled-hidden

Reviewed HEAD: 5aa4e702e5b03e9d37af1a40a172242769f862e8
Branch: gsd-path/M066 · Milestone: schema-disabled-hidden

Overall verdict: pass

## Success criteria

### SC1 — A field whose disabled state a schema node declares produces a finding that names the state, the node and the input that node read; a mutant that reports the node without the input it read reddens it.

- **Verdict**: met

- **Check**: The join answers `declared` only when the record carries a node and the input that node read.

- **Observed**: All four fields of `research/raw/m066-schema-record.json` answer `no-node`, because the record states `schema.absent: true`; the mutant `DECLARED` reddens with "a record carrying the node and the input it read must state declared, never no-node".

- **Reference**: `extension/schema-attribution.js:1`, `scripts/schema-attribution.test.mjs` (mutant `DECLARED`)

- **Finding**: No defect.

- **Fix direction**: None required.

### SC2 — A field that is disabled by its own binding, with no schema node to name, reports that absence with its reason rather than naming a node the record does not carry; a mutant that infers a schema attribution reddens it.

- **Verdict**: met

- **Check**: A field disabled by its own binding, with no schema node to name, reports that absence with its reason.

- **Observed**: `policyNumber` reports `disabled: false` from its element and `status` reports `disabled() === true` from its field tree with no element at all; the mutant `NO-NODE` reddens with "an absent schema is a measurement, not a failure of the field".

- **Reference**: `extension/schema-attribution.js` (the `no-node` branch), `research/raw/m066-schema-record.json`

- **Finding**: No defect.

- **Fix direction**: None required.

### SC3 — The state and the attribution are read from a record this milestone writes, alongside the reading `extension/field-state.js` already performs — one source of the field's own state, asserted in one place.

- **Verdict**: met

- **Check**: The state and the attribution are read from a record this milestone writes, from one source.

- **Observed**: The join reads only that record, and the field list is one list behind a proxy whose write trap throws, naming the four fields it refused to change.

- **Reference**: `extension/schema-attribution.js` (`FIELD_NAMES`), `scripts/schema-attribution.test.mjs` (write trap)

- **Finding**: No defect.

- **Fix direction**: None required.

### SC4 — The panel renders exactly the object the join returns: one new surface, its loader key, its route-table pin and every enumerating suite moved in the same task, and the answer carries no remedy, no cause and no node it was not given.

- **Verdict**: met

- **Check**: The pane renders exactly the object the join returns, and every enumerating list moved with it.

- **Observed**: Adding `remedy` reddens with "a key the answer does not carry — a remedy, a cause or a suggestion — is a line the join never produced"; dropping the route or the `LOADERS` key reddens `panel-routes` naming what is missing; the route count moved 44 to 45 and the surface record 35 to 36 in the same landing.

- **Reference**: `apps/angular-ai-devtools/src/app/panel-schema.ts`, `scripts/panel-routes.test.mjs` (E1/E4)

- **Finding**: No defect.

- **Fix direction**: None required.

## Measured facts a reader should not have to rediscover

- The Insurance Portal builds its Signal Forms schema as a closure, so no schema token is reachable from any injector
  this milestone tried: five expressions, 100 provider records, zero schema tokens. The panel reports `no-node` with
  its reason on this target, which is the measurement rather than a gap.

- `status` is disabled by its field tree and carried by no element — the case the pane exists for.

- `nx run build-extension` warns the initial bundle exceeded its 520 kB default budget by 14.64 kB. The project
  superseded that default with `scripts/panel-bundle-budget.test.mjs`, which enforces a 535.44 kB baseline and passes.
  Recorded as a fact, not a blocker: the enforced gate is green, and widening either number to quiet the warning is
  the tolerance-widening this programme forbids.

## Project verify

Main suite 2236 passed and 0 failed, user-scope 60 and 0, skills 320 and 0, held-out 22 suites and 85 tests with 0
failed, run by the last task to land.
