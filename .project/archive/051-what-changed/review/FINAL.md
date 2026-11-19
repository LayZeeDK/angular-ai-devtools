# FINAL — M051 what-changed

Reviewed HEAD: 35438d52343119eb947de9c5c1171ffc1b2a7e82

Overall verdict: pass

## What this milestone set out to do

Report what changed between two records of the panel's inspected tab: each field that differs with its before and after, a field carried by one record only as added or removed, and a refusal naming both absences when the record cannot bind the pair to one page. The surface must never invent a change, a counterpart value, or a field the measurement does not carry.

## Tasks and waves

| wave | task | landing | what it established |
|---|---|---|---|
| 1 | T001 | measured | the record carries no page identity, so the pair is bound by the panel's inspected tab; the nine measured fields and their order |
| 2 | T002 | `ab67a17d` | a pure comparison answering four keys over the measured fields, with a one-sided field reported as added or removed and a five-mutant suite naming each broken field |
| 3 | T003 | `03d40d13` | the three states render, the route and its loader key are pinned, and every record the surface stales was re-derived in the same landing |
| 4 | T004 | `35438d52` | the milestone Log written and the project verify run; the recording the Log itself moved re-derived after its last byte |

## Success criteria

### SC1 — Two recorded page snapshots are compared field by field, and the surface names each field that changed with its before and after.

- **Check**: `node --test scripts/what-changed.test.mjs`
- **Observed**: pass; mutant M1 reddens naming `checks`, M4 names the field whose after value was invented.
- **Reference**: .project/build/verify-T004.log — head 465ad7408d9d9fb8edfa5ada3fdcda546d6dade8
- **Verdict**: met
- **Finding**: Met. E1's added/removed case was missed by the first implementation and repaired on measurement rather than left as a narrower claim.
- **Fix direction**: none

### SC2 — A pair that the record cannot establish as the same page is refused with `cannot-tell` naming what is missing, never compared as if it were the same page.

- **Check**: `node --test scripts/what-changed.test.mjs`
- **Observed**: the `cannot-tell` state renders its reason verbatim, naming the record's absent page identity and the panel's binding; mutant M3 reddens.
- **Reference**: .project/build/verify-T004.log — head 465ad7408d9d9fb8edfa5ada3fdcda546d6dade8
- **Verdict**: met
- **Finding**: Met.
- **Fix direction**: none

### SC3 — A comparison reads only the two snapshots it was given: no file, no clock, no third record.

- **Check**: `node --test scripts/what-changed.test.mjs`
- **Observed**: pass, with the poisoned-clock and source-token pins holding.
- **Reference**: .project/build/verify-T004.log — head 465ad7408d9d9fb8edfa5ada3fdcda546d6dade8
- **Verdict**: met
- **Finding**: Met.
- **Fix direction**: none

## Project verify

- **Command**: `npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npm run check && npm test`
- **Result**: check exit 0; test exit 0 in 11m34s — scripts 1668/1668, user-scope 60/60, skills 320/320, app 354/354, held-out corpus 22/22 suites and 85/85 tests
- **Recorded at**: `35438d52`

## Residuals the ship carries

- `research/raw/m056-gate-stability.json` is re-derived after the Log's last byte, because the Log itself moves one recorded value; the default run is green at 8/8 and the armed run at 9/9.
- The intent's SC1 prose still describes the pair as two recorded page snapshots; the surface and `research/raw/m051-surface.json` state the binding as the panel's inspected tab. The wording is a define-phase debt, not a silent correction.

## Provenance

- Waves reviewed with `/lars-review` against each landing; the gap review is `.project/review/final-gap-1.md`.
- Two out-of-family facts are recorded in the Log: four landings were traced to one stale verify log, and the intent's edge table is five columns because `check_handoffs` refuses a sixth.
