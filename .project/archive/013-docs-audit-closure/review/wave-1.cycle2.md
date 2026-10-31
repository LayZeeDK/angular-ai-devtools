# Review — wave 1, cycle 2
Wave verdict: blocked
Cycle: 2
Depth: full
Note: superseded by wave-1.cycle3.md. The wave gate rejected this artifact because it omitted the SC1 block that T009 Intent coverage owns; the per-task sections below are unchanged.
Lens: 
Tasks reviewed: 3

## T001 — Re-derive the 45 settleable unverifiable audit rows: pass

- ✅ Each of the 45 settleable rows in `.project/research/DOCS-AUDIT.md` carries a concrete verdict and evidence string instead of "unverifiable". — 45 rows reclassified to `verified` with triage-check evidence strings (e.g. "triage check (Test-Path ...) -> verified"); gate reports verified 247 incl. these 45; recorded Verify `ok 45` (exit 0).
- ✅ No settleable row retains a suggested action that names no code path while a shipped command could settle it (N3). — settleable rows' Suggested action rewritten to the settled wording; no row names a code path-less action.
- ✅ No product file under `apps/`, `src/`, `extension/` or a skill script is changed. — commit 4bb29928 touched only `.project/research/DOCS-AUDIT.md` and the task file.

Warnings (non-blocking):
- The 45 reclassified claim rows are missing the trailing pipe in their markdown table row; the audit gate still parses them (claims 345, verified 247) but the row shape is inconsistent with the other claim rows.

Contract violations (blocking):
- none

## T006 — Record honest missing-evidence wording for the 92 not-settleable rows: pass

- ✅ Every not-settleable row in `.project/research/DOCS-AUDIT.md` names the missing evidence (portal checkout, browser/on-device runtime, upstream source, or dated measurement). — recorded Verify `ok 92` (exit 0); each of the 92 rows' Suggested action reads "no reliable source found: ...".
- ✅ Dated-measurement rows carry an `accept-drift` ruling with the dated head, following the 649/650 pattern. — queue 568 now has an `accept-drift` row in `## User rulings` quoting the delegated 2026-10-31 instruction; 8 accept-drift rulings total, all dated-measurement rows covered.
- ✅ No not-settleable row is misclassified as stale or aspirational (SC1). — all 92 rows remain `unverifiable`; Summary still reports stale 2 and aspirational 4.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T009 — Reconcile the audit's claim rows with its Summary and rule the dated-measurement rows: pass

- ✅ The Summary verdict counts equal the claim-table verdict counts, and `check_docs_audit.py` reports no count mismatch for the audit at this head. — gate output: claims 345, verdicts verified 247 / stale 2 / aspirational 4 / unverifiable 92, matching Summary; exit 0.
- ✅ Every queue row whose claim is now `verified` is gone from `## Remediation queue`, and every remaining row classifies a non-verified claim. — queue now 98 rows, all non-verified; no verified claim remains in the queue.
- ✅ Every queue row worded as a dated measurement has an `accept-drift` row in `## User rulings` carrying its queue number. — queue 568 carries an accept-drift ruling; all dated-measurement rows covered.
- ✅ The `| 650 |` ruling row is still present and every prior ruling row survives in order. — 21 ruling rows including 649 and 650 in original relative order; new 568 row appended after 650.

Warnings (non-blocking):
- The 568 accept-drift ruling row is appended after the 650 row, so the ruling table is no longer in ascending queue-number order; prior rows are unchanged in relative order.

Contract violations (blocking):
- none

## Intent coverage

### SC3 — The remediation queue has no NEEDS-USER row without a recorded ruling.: pass
- ✅ The only `NEEDS-USER` rows are queue 649 and 650, and both have matching rows in `## User rulings` (649 fix-doc, 650 fix-doc) with quoted delegated rulings; no NEEDS-USER row lacks a recorded ruling.

## Fixed since last cycle

- docs-audit Summary/claim-row mismatch (T001) — confirmed fixed: gate reports claims 345 with verified 247 matching Summary; no count mismatch.
- missing accept-drift ruling for dated-measurement queue 568 (T006 AC2) — confirmed fixed: queue 568 now has an accept-drift ruling in `## User rulings`.
- No new regressions: claim rows not deleted (claims 345 unchanged), no document dropped from the frozen inventory (gate inventory matches), stale/aspirational counts unchanged at 2 and 4.
- New non-blocking warning: 45 reclassified claim rows missing trailing pipe (see T001 warnings).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: 45 reclassified claim rows missing trailing pipe in `.project/research/DOCS-AUDIT.md` (gate still passes; cosmetic).