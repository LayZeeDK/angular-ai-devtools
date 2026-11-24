# Gap Review — 2: T008 exceeds the artefact ceiling the plan itself enforces

Reviewed HEAD: fdd75ba4b2e70e5626d32ff429a523d291743e12
Gap verdict: pass
Risk: T008 exceeds the artefact ceiling the plan itself enforces
Waves checked: 1, 2, 3, 4, 5, 6, 7, 8

## Checked evidence

- **Check**: `lars-gsd plan-lint --repo .`
- **Observed**: `result: OK (0 blockers, 0 warnings, 1 info)` — T008 now declares four authored artefacts.
- **Reference**: `.project/review/patch-findings-applied.md` P002, the record of the refusal this gap closes.

## Finding

- **Found**: At 8a523423 the ship gate refused with `[verify-weight] T008: 5 authored artefacts (4 recording(s) under research/raw, 0 suite(s), the task's own Log) exceed the ceiling of 4`; the fifth was `research/raw/m059-record-shapes.json`, which T008 re-derived after its own `m044` re-capture moved the line `m059` cites. The contract was corrected, T008 re-landed at `c7641b88`, and the ceiling holds at this head.
- **Fix direction**: none
