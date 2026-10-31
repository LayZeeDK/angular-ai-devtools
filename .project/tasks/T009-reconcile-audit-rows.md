---
id: T009
title: Reconcile the audit's claim rows with its Summary and rule the dated-measurement rows
wave: 1
deps: [T001, T006]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - .project/research/DOCS-AUDIT.md
---

# T009 — Reconcile the audit's claim rows with its Summary and rule the dated-measurement rows

## Context

Wave 1 cycle 1 blocked on two findings against `.project/research/DOCS-AUDIT.md`. T001 rewrote the remediation queue's verdicts for the 45 settleable rows but left the matching `## Doc:` claim-table rows at `unverifiable`, so the Summary reads 247 verified against 202 claim rows and `check_docs_audit.py` fails with "Summary: verified count 247 does not match 202 claim rows". T006 worded the dated-measurement rows as historical but added no `accept-drift` ruling for them; queue 568 is the named case.

## Review findings

### t001_files

Criterion: docs-audit Summary/claim-row mismatch introduced by this task

- canonical lens — docs-audit Summary/claim-row mismatch introduced by this task — found: `check_docs_audit.py --repo <sidecar> --primary D:\projects\sandbox\angular-ai-devtools` fails with "Summary: verified count 247 does not match 202 claim rows"; fix: reconcile the 45 reclassified rows across both the claim tables and the Summary.

### t006_ac2

Criterion: Dated-measurement rows carry an `accept-drift` ruling with the dated head, following the 649/650 pattern.

- canonical lens — Dated-measurement rows carry an `accept-drift` ruling with the dated head, following the 649/650 pattern. — found: queue 568 ("branded install proven in Chrome Beta 2026-10-11") is worded as a dated measurement ("dated measurement, kept as a historical record") but has no `accept-drift` row in `## User rulings`; the task Log's claimed ruling for queue 681 is absent from the audit. fix: add an `accept-drift` `## User rulings` row for queue 568 (and any other dated-measurement row) quoting the delegated ruling and the dated head, or drop the dated-measurement wording.

## Approach

- For each queue row whose Suggested action T001 rewrote to a settled verdict, re-derive the underlying claim with the settling check named for that row in `.project/research/evidence-audit-verifiability.md`, then set the matching `## Doc:` claim-table row to the verdict the check proves, with evidence naming the command or the file:line it read. The claim-table row is the source of truth; the Summary and the queue follow it.
- Remove from `## Remediation queue` the rows whose claim is now `verified` (the queue lists non-verified claims), keeping every surviving row's number and never reusing a retired one.
- Add one `accept-drift` row to `## User rulings` for each queue row worded as a dated measurement, quoting the milestone's granting instruction verbatim as the existing 649/650 rows do, marked `(delegated: accept-drift - <one-line reason>)`, with `Planned` set to `n/a (accept-drift)` and a queue number above every existing number.
- Never delete or reorder an existing `## User rulings` row, and never add prose between that table and `## Remediation queue`.
- Documentation and audit text only: no product file, no skill script, no document prose.

## Interface contract

None

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. The Summary verdict counts equal the claim-table verdict counts, and `check_docs_audit.py` reports no count mismatch for the audit at this head.
2. Every queue row whose claim is now `verified` is gone from `## Remediation queue`, and every remaining row classifies a non-verified claim.
3. Every queue row worded as a dated measurement has an `accept-drift` row in `## User rulings` carrying its queue number.
4. The `| 650 |` ruling row is still present and every prior ruling row survives in order.

## Verify

```bash
python -c "import re,sys,pathlib;t=pathlib.Path(sys.argv[1]).read_text(encoding='utf-8');rows=re.findall(r'(?m)^\| \"[^\"]*\" \| (?:command|feature|structure|status|config|integration) \| (verified|stale|aspirational|unverifiable) \|',t);m={k:int(v) for k,v in re.findall(r'(?m)^\| (verified|stale|aspirational|unverifiable) \| (\d+) \|',t)};c={k:rows.count(k) for k in ('verified','stale','aspirational','unverifiable')};assert m==c,(m,c);assert '| 650 |' in t;sec=t.split('## User rulings')[1].split('## Remediation queue')[0];ruled=set(re.findall(r'(?m)^\| (\d+) \|',sec));dated=[n for n,a in re.findall(r'(?m)^\| (\d+) \|.*\| ([^|]+) \|\s*$',t.split('## Remediation queue')[1]) if 'dated measurement' in a];missing=[n for n in dated if n not in ruled];assert not missing,missing;print('ok',c)" .project/research/DOCS-AUDIT.md
```

Heavy: no

## Log

- created by orchestrator from wave 1 cycle 1 findings (fix batch t001_files, t006_ac2)
