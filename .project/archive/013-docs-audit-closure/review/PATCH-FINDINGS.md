# Patch Findings

Reviewed HEAD: 897f24050454a9f6a5face2bafd7f115e76e8caf
State: ship/blocked

## Findings

### P001 — the audit quotes a tutor claim the corrected document no longer makes

- **Source**: `.project/review/final-gap-2.md`
- **Locator**: Risk: the regenerated audit still describes the corrected documents
- **Evidence**: Audit section `## Doc: docs/design/tutor.md` contains row "No shipped framework devtools panel uses an on-device model" (feature, unverifiable) with evidence "no survey evidence checked in this audit", but the corrected tutor.md in the sidecar does **not** contain that exact quoted claim. All other checked rows are supported: handoff.md has all three claims (including superseded/historical status and instance list), TURBOREPO.md has the migration claim, and tutor.md contains "The proposed tutor can run with no model" (line ~64), "The design calls for 27 lessons across five phases" (line ~238), and "The planned storage shapes live in `chrome.storage.local`" (line ~399). The regenerated audit still describes the corrected tutor.md as containing a claim it no longer has.
- **Fix direction**: Regenerate/reconcile DOCS-AUDIT.md for `docs/design/tutor.md` so it matches the corrected document (remove or reclassify the stale "No shipped framework devtools panel uses an on-device model" row). No changes needed to the three corrected documents in the sidecar.
