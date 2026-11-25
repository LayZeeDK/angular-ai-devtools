# Review — wave 2, cycle 1

Cycle: 1
Depth: full
Wave verdict: pass
Tasks reviewed: 1
Reviewed HEAD: 25f652173c13540bfe3bbb8c4f9d3503dcca54cc

## T002 — Derive the claims capture through the pin its reader holds: pass

- ✅ T002 landed and its own Verify is recorded in `.project/build/verify-T002.log`. 2026-11-23: measured at this base: captureClaims wrote tRecordedDocumentLocations(derived()) while the default pin holds tRecordedDocumentLocations(derived(), recorded), so after a rebind an armed re-capture emitted bytes its own pin refused, silently. 2026-11-23: the writer now reads through the same anchor and refuses to write unless the candidate is the fixed point of the pin; the refusal names the pin and writes nothing. Default run 14 pass / 0 fail, armed run 15 pass / 0 fail.

## Intent coverage

### SC3 — The hosted control and the field identity are read from a record this milestone writes, and the field identity is the one `extension/field-state.js` already uses, asserted in one place rather than derived twice.: pass

- ✅ T002 carries it: the acceptance criteria named for SC3 in the plan are the ones this task proved, and the run is recorded in the verify ledger at this head.
