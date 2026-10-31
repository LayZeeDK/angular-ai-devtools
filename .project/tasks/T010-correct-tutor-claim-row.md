---
id: T010
title: Reconcile the tutor audit section with the corrected document
wave: 5
deps: []
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T010 — Reconcile the tutor audit section with the corrected document

## Context

P001 blocks the milestone on one row of the docs audit. Its Evidence: "Audit section `## Doc: docs/design/tutor.md` contains row "No shipped framework devtools panel uses an on-device model" (feature, unverifiable) with evidence "no survey evidence checked in this audit", but the corrected tutor.md in the sidecar does **not** contain that exact quoted claim. All other checked rows are supported: handoff.md has all three claims (including superseded/historical status and instance list), TURBOREPO.md has the migration claim, and tutor.md contains "The proposed tutor can run with no model" (line ~64), "The design calls for 27 lessons across five phases" (line ~238), and "The planned storage shapes live in `chrome.storage.local`" (line ~399). The regenerated audit still describes the corrected tutor.md as containing a claim it no longer has." Its Fix direction: "Regenerate/reconcile DOCS-AUDIT.md for `docs/design/tutor.md` so it matches the corrected document (remove or reclassify the stale "No shipped framework devtools panel uses an on-device model" row). No changes needed to the three corrected documents in the sidecar." Verified in this repository: the sentence `No shipped framework devtools panel uses an on-device model` is absent from `docs/design/tutor.md` — a full-file search for `on-device model` matches only line 43 ("A tab in the extension's DevTools panel, on the on-device model") and line 668 ("the on-device model only rewords and explains"), neither of which is the quoted claim. The document's other audited claims are present at lines 64, 238 and 399, so only this one row needs reconciling.

## Approach

- The offending claim row is the first row of `## Doc: docs/design/tutor.md` in `.project/research/DOCS-AUDIT.md:851`; the matching `## Remediation queue` row is `| 644 | docs/design/tutor.md | "No shipped framework devtools panel uses an on-device model" | unverifiable | fix-doc | ...` at line 1133. Both describe a sentence the document does not contain.
- Prefer deleting both rows. The document's three remaining claims are verified at `docs/design/tutor.md:64`, `:238` and `:399`, and a `## Doc:` section of verified rows still satisfies the one-section-per-doc rule.
- If you replace rather than delete, the replacement must be a statement the corrected document actually makes, quoted verbatim with `docs/design/tutor.md:<line>` as its evidence (line 43, 64, 238 or 399 are the ones P001 checked), and it must carry a verdict the gate accepts.
- Recompute `## Summary` from the claim tables after the edit. It currently reads verified 253 / stale 0 / aspirational 0 / unverifiable 92 / descriptive 7 over 345 claims; deleting one unverifiable row leaves 344 claims and unverifiable 91. The gate fails on any Summary/claim-row mismatch.
- Queue numbers are bound to their original (doc, claim): do not renumber surviving rows, do not reuse 644, and add a new queue row only if the replacement claim is non-verified. Row `644` is the only queue row naming this claim.
- Edit nothing else: no other `## Doc:` section, no `## User rulings` row, none of the three corrected documents (`docs/design/tutor.md`, `.commandcode/skills/nx-import/references/TURBOREPO.md`, `plans/angular-ai-devtools-proposals.handoff.md`), no product or skill file.

## Interface contract

- None

## Owns

- The reconciled `## Doc: docs/design/tutor.md` section and queue of `.project/research/DOCS-AUDIT.md`, with the docs-audit gate passing.

## Depends on

- None

## Intent coverage

- None

## Acceptance criteria

1. The audit no longer quotes the absent claim for `docs/design/tutor.md`; that row is removed or replaced by a statement the corrected document makes, with evidence naming the document and its line.
2. The audit's Summary still shows zero stale and zero aspirational claims, and its queue and claim rows agree.
3. The audit gate passes.

## Verify

```bash
python -c "import pathlib,sys;d=pathlib.Path('docs/design/tutor.md').read_text(encoding='utf-8');a=pathlib.Path(sys.argv[1]).read_text(encoding='utf-8');q='No shipped framework devtools panel uses an on-device model';assert q not in d;assert q not in a;print('ok')" .project/research/DOCS-AUDIT.md && python "$HOME/.commandcode/skills/gsd-path/scripts/check_docs_audit.py" --repo . --emit-inventory > /tmp/m013-inv.txt && python "$HOME/.commandcode/skills/gsd-path/scripts/check_docs_audit.py" --repo . --primary D:/projects/sandbox/angular-ai-devtools --audit .project/research/DOCS-AUDIT.md --inventory /tmp/m013-inv.txt
```

Heavy: no

## Review findings

### Risk: the regenerated audit still describes the corrected documents

Criterion: The audit no longer quotes the absent claim for `docs/design/tutor.md`; that row is removed or replaced by a statement the corrected document makes, with evidence naming the document and its line.

Observation: Audit section `## Doc: docs/design/tutor.md` contains row "No shipped framework devtools panel uses an on-device model" (feature, unverifiable) with evidence "no survey evidence checked in this audit", but the corrected tutor.md in the sidecar does **not** contain that exact quoted claim. All other checked rows are supported: handoff.md has all three claims (including superseded/historical status and instance list), TURBOREPO.md has the migration claim, and tutor.md contains "The proposed tutor can run with no model" (line ~64), "The design calls for 27 lessons across five phases" (line ~238), and "The planned storage shapes live in `chrome.storage.local`" (line ~399). The regenerated audit still describes the corrected tutor.md as containing a claim it no longer has.

Fix direction: Regenerate/reconcile DOCS-AUDIT.md for `docs/design/tutor.md` so it matches the corrected document (remove or reclassify the stale "No shipped framework devtools panel uses an on-device model" row). No changes needed to the three corrected documents in the sidecar.

## Log

- 2026-10-31 — created by planner from P001 (`.project/review/final-gap-2.md`, source of `.project/review/PATCH-FINDINGS.md`); patch wave 5
