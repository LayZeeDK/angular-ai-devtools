# Panel verification — N1/N2/N3 across model pairs

## N1 — change-detection causality ("Why did this update?")

| Pair | Verdict | verdict.json |
| --- | --- | --- |
| chrome-beta-nano | verified | D:\projects\sandbox\angular-ai-devtools\tmp\verdict-nano\verdict.json |
| chrome-beta-gemma4 | verified | D:\projects\sandbox\angular-ai-devtools\tmp\verdict-gemma4\verdict.json |
| edge-dev-aion | unverifiable | (none — instance hung; see reason) |
| edge-phi4mini | verified | D:\projects\sandbox\angular-ai-devtools\tmp\verdict-phi4mini\verdict.json |

### chrome-beta-nano
- Verdict: verified
- verdict.json: D:\projects\sandbox\angular-ai-devtools\tmp\verdict-nano\verdict.json (lint exit 0)
- Observed answer evidence: extension-panel check passed both runs; panel answered with Angular 22.2.2 and a Prompt API answer (extension-panel.json under the up evidence dir).

### chrome-beta-gemma4
- Verdict: verified
- verdict.json: D:\projects\sandbox\angular-ai-devtools\tmp\verdict-gemma4\verdict.json (lint exit 0)
- Observed answer evidence: extension-panel check passed both runs.

### edge-dev-aion
- Verdict: unverifiable
- Reason: the instance hung during the panel drive (control.mjs panel and verify-ai-browsers checks/extension-panel.mjs both timed out at 300s). The documented idle about:blank recovery (control.mjs swaps idle blank tabs before attaching; re-run alone) was applied and the hang persisted. No verdict.json was produced.
- verdict.json: none

### edge-phi4mini
- Verdict: verified
- verdict.json: D:\projects\sandbox\angular-ai-devtools\tmp\verdict-phi4mini\verdict.json (lint exit 0)
- Observed answer evidence: extension-panel check passed both runs.

## N2 — signal provenance

All four pairs: inconclusive. Map gap: `.commandcode/skills/control-ai-browsers/features/` has no feature file for signal provenance, so `lars-verify` reports the case as `inconclusive` naming the map gap and writes no `verdict.json`. No spec was written for a feature without a feature file.

## N3 — DI doctor

All four pairs: inconclusive. Map gap: `.commandcode/skills/control-ai-browsers/features/` has no feature file for the DI doctor, so `lars-verify` reports the case as `inconclusive` naming the map gap and writes no `verdict.json`. No spec was written for a feature without a feature file.

## Insurance portal

- Checkout path: D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools
- External dependency: the insurance-portal checkout (external repo, not present in this worktree's control).
- Status: not verified here (not driven in this run); recorded as unverifiable. Checkout present on disk but not exercised.

## Claims not verified

- edge-dev-aion N1: unverifiable — instance hung; documented recovery applied and still failed.
- All pairs N2: inconclusive — no feature file for signal provenance (map gap).
- All pairs N3: inconclusive — no feature file for the DI doctor (map gap).
- Insurance portal N1/N2/N3: unverifiable — external dependency (checkout not driven here).
