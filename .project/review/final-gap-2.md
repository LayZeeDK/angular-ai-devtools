# Gap Review — 2: the regenerated audit still describes the corrected documents

Reviewed HEAD: 897f24050454a9f6a5face2bafd7f115e76e8caf
Gap verdict: blocked
Risk: the regenerated audit still describes the corrected documents
Waves checked: 2, 3, 4

## Checked evidence

- **Check**: `python -c "import pathlib; print(sum(1 for _ in pathlib.Path(r'C:\Users\LarsGyrupBrinkNielse\.gsd-path\projects\d10fb97cec6c7ac7\8919d4cefeb4a7e5\verify\review-gap-2\plans\angular-ai-devtools-proposals.handoff.md').open(encoding='utf-8')))"` 
- **Observed**: Handoff line count = 92. Audit states "1110 measured 2026-10-31" for docs/feature-proposals.md (line 13 of handoff) — that is a measurement of the deliverable, not the handoff file itself; no handoff line count is asserted by the audit. All three audited docs contain their claimed rows except where noted.
- **Reference**: plans/angular-ai-devtools-proposals.handoff.md, .commandcode/skills/nx-import/references/TURBOREPO.md, docs/design/tutor.md; .project/research/DOCS-AUDIT.md

## Finding

- **Found**: Audit section `## Doc: docs/design/tutor.md` contains row "No shipped framework devtools panel uses an on-device model" (feature, unverifiable) with evidence "no survey evidence checked in this audit", but the corrected tutor.md in the sidecar does **not** contain that exact quoted claim. All other checked rows are supported: handoff.md has all three claims (including superseded/historical status and instance list), TURBOREPO.md has the migration claim, and tutor.md contains "The proposed tutor can run with no model" (line ~64), "The design calls for 27 lessons across five phases" (line ~238), and "The planned storage shapes live in `chrome.storage.local`" (line ~399). The regenerated audit still describes the corrected tutor.md as containing a claim it no longer has.
- **Fix direction**: Regenerate/reconcile DOCS-AUDIT.md for `docs/design/tutor.md` so it matches the corrected document (remove or reclassify the stale "No shipped framework devtools panel uses an on-device model" row). No changes needed to the three corrected documents in the sidecar.
