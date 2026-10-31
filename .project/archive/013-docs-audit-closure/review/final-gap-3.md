# Gap Review — 3: the audit's rulings and queue still satisfy the NEEDS-USER criterion after regeneration

Reviewed HEAD: 428f582d1be0d86e06e846fd026c47beb5c4031f
Gap verdict: pass
Risk: the audit's rulings and queue still satisfy the NEEDS-USER criterion after regeneration
Waves checked: 1, 4, 5

## Checked evidence

- **Check**: Read `C:\Users\LarsGyrupBrinkNielse\.commandcode\skills\gsd-path\templates\gap-review.md` and `<sidecar>\.project\research\DOCS-AUDIT.md`; ran `git -C <sidecar> show 14729ba:.project/research/DOCS-AUDIT.md`, `git -C <sidecar> log/log -S` over the audit's history, and a node parser (scratchpad `check-audit.mjs`, escaped-pipe-aware) that counted queue rows by Class cell, listed `## User rulings` rows, and mapped each queue row to the claim row carrying the SAME claim text inside that document's `## Doc:` section.
- **Observed**: Criterion count = 0 — the `## Remediation queue` holds 91 rows and every one has Class `fix-doc`; no row carries Class `NEEDS-USER` (the string does not appear in the audit at all), so there is no NEEDS-USER row needing a `fix-doc` ruling plus planned value. Rulings: 21 rows at HEAD — the 18 rows of `14729ba` (4, 5, 32, 36, 82, 83, 84, 183, 220, 310, 311, 319, 320, 379, 386, 414, 415, 540) all survive in the same order, and 3 rows were appended: **649, 650, 568** (649/650 `fix-doc` planned T002 at f07df6f; 568 `accept-drift` planned n/a at 181a39a). Sanity mapping by claim text: 344 claim rows = 253 verified + 91 unverifiable (matches the Summary), 91/91 queue rows map to their unverifiable claim row with 0 not-found and 0 verdict mismatches. Only queue number 568 also appears in `## User rulings`; that ruling is `accept-drift` for the dated-measurement row (install.md "branded install proven in Chrome Beta 2026-10-11") while the queue cell reads `fix-doc`, but its suggested action records the accept-drift disposition and the row is not NEEDS-USER, so the criterion is unaffected. The NEEDS-USER backlog inherited from `14729ba` (5 such rows, e.g. 540) is fully dispositioned in the regenerated queue, which still lists every remaining unresolvable claim.
- **Reference**: `.project/research/DOCS-AUDIT.md:1040-1065` (`## User rulings`) and `.project/research/DOCS-AUDIT.md:1066-1160` (`## Remediation queue`), `.project/research/DOCS-AUDIT.md:9-15` (Summary table); prior state via `git -C <sidecar> show 14729ba:.project/research/DOCS-AUDIT.md` (`## User rulings` at 1191-1212, `## Remediation queue` from 1214); append commits f07df6f and 181a39a.

## Finding

- **Found**: The regenerated audit satisfies the NEEDS-USER criterion: 0 of 91 remediation-queue rows are classed NEEDS-USER, the 91 rows account for exactly the 91 unverifiable claims, every queue row maps by claim text to its own `## Doc:` claim row, and all 18 previously recorded rulings survive unchanged and in order with 649, 650 and 568 appended. The only cross-table wrinkle (ruling 568 accept-drift vs queue 568 Class fix-doc for the same dated-measurement claim) leaves the claim dispositioned and never NEEDS-USER, so it does not break the criterion.
- **Fix direction**: none
