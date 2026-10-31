# Gap Review — 2: serialised graph node shape across waves

Reviewed HEAD: HEAD_SHA
Gap verdict: pass
Risk: serialised graph node shape across waves
Waves checked: 1, 2, 3

## Checked evidence

- **Check**: read `src/main-world/value-field.ts` (T001), `src/main-world/interop-keep-list.ts` (T002), `apps/angular-ai-devtools/src/app/interop.service.ts` (T004, T012), and the four retained `.project/plan/evidence/T00X/interop.json`.
- **Observed**: T001 adds an optional `value` to the serialised node; T002's classifier reads only `label` and `debuggableFnSource`, and treats `value` as an optional input; T004/T012 compare values to attribute fields, and every retained result records `nodes: 1` with the attribution wording. A node without `value` still lands in the slice, so the wave-1 addition is additive for wave 2.
- **Reference**: src/main-world/value-field.ts; src/main-world/interop-keep-list.ts; apps/angular-ai-devtools/src/app/interop.service.ts; .project/plan/evidence/T006/interop.json

## Finding

- **Found**: The seam holds; the optional field is additive and the classifier does not depend on it.
- **Fix direction**: none
