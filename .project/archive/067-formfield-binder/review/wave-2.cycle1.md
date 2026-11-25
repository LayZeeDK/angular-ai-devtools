# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 4150bf7565ac8a1736d1ed602208601e58373f74

## T002 — Derive the claims capture through the pin its reader holds: pass

- ✅ T002 landed and its own Verify is recorded in the verify ledger. 2026-11-23: measured at this base: captureClaims wrote tRecordedDocumentLocations(derived()) while the default pin holds tRecordedDocumentLocations(derived(), recorded), so after a rebind an armed re-capture emitted bytes its own pin refused, silently. 2026-11-23: the writer now reads through the same anchor and refuses to write unless the candidate is the fixed point of the pin; the refusal names the pin and writes nothing. Default run 14 pass / 0 fail, armed run 15 pass / 0 fail.

## Intent coverage

### SC3 — The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice.: pass

- ✅ T002 carries it: the acceptance criteria the plan assigns to this task for SC3 are the ones it proved, and the run is recorded in the verify ledger at this head.
