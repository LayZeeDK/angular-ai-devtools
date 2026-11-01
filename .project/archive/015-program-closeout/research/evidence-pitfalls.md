# Evidence — pitfalls
<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce?

## Finding: External checkout claim must be checked against the repo the skill controls

- **Claim**: A claim whose only evidence is an external checkout the repository does not control (the portal commit claim) is decidable only if the repo ships a command that inspects that external checkout path; otherwise it remains unverifiable from inside the repo. The M014 audit marked .claude/skills/control-pangular-inspector/SKILL.md line about portal worktree committed at `f102b97` as stale because `git log` in `D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools` has no such commit (INTENT.md Corrections / DOCS-AUDIT.md).
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (`## Corrections`), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (row for `.claude/skills/control-pangular-inspector/SKILL.md`), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md
- **Confidence**: high
- **Why it matters here**: If a skill asserts an external checkout state, the repo must ship a check that reads that external checkout (or the claim must be corrected). Without such a shipped command, "portal commit exists" is unverifiable from repo-only commands and becomes a correctness risk for the audit.
## Finding: Provenance fingerprint goes stale if re-recorded before the last edit

- **Claim**: A provenance fingerprint that goes stale because a later edit lands after it is recorded (`.proven.json`) means the interop provenance must be re-recorded last among the artifacts for SC2; if recorded before the final doc/panel edit, it reads stale at the shipped head. Edge E5 states: `.proven.json` records a fingerprint of the feature's own source; a re-record before the last doc or panel edit leaves the fingerprint stale at the head, so the re-record is the last artifact written before the final Verify.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (`## Edge coverage` E5, `## Scope: in` for interop provenance), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (interop fixture present at `spikes/ng222-app/src/app/stale-view-fixture.ts`)
- **Confidence**: high
- **Why it matters here**: The repository may ship a way to record provenance (fingerprint) but cannot enforce ordering across unrelated edits unless the process does it; a stale fingerprint is a failure mode the shipped tools might detect at re-check time only if re-checked at the final head, not by the act of recording alone.
## Finding: Budget warning can be silenced without recording the measurement

- **Claim**: A budget decision that silences a warning without recording the measurement is a failure mode for SC4: the panel bundle budget lives in `apps/angular-ai-devtools/project.json` (build configuration) and `build-extension` depends on `generate-error-digest`; edges E7/E8 require the decision to state measured size and rule in kB with two decimals (measurement at/below budget emits no warning; at/above warns) so the warning can never be silenced by wording alone.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (`## Edge coverage` E7/E8, `## Risks`), D:\projects\sandbox\angular-ai-devtools\.project\research\evidence-codebase.md (`apps/angular-ai-devtools/project.json` build-extension target, dependsOn generate-error-digest), D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (rows for panel/build related claims marked unverifiable in places)
- **Confidence**: high
- **Why it matters here**: The build system may emit a budget warning, but it cannot force a recorded decision artifact; the shipped check is the build output/verification, while the decision record is a document artifact that must be written and cited.
## Finding: Audit regenerated at wrong head invalidates Audited HEAD

- **Claim**: An audit regenerated at the wrong head means `Audited HEAD` is not the shipped head (E2); the shipped head becomes the head after the last correction, so the audit must be regenerated after the last correction and name that shipped head. DOCS-AUDIT.md at the time of audit names `Audited HEAD: 01bffa9f291688c44261a67847b14dcda42b0867` (M014 base context) and INTENT requires regenerating the docs audit at the milestone head with zero `stale`/`aspirational` and no M014 `fix-doc` row left `planned: no`.
- **Source**: D:\projects\sandbox\angular-ai-devtools\.project\research\DOCS-AUDIT.md (`## Docs Audit` header), D:\projects\sandbox\angular-ai-devtools\.project\intent\INTENT.md (`## Edge coverage` E2, `## Success criteria` SC1, `## Scope: in`)
- **Confidence**: high
- **Why it matters here**: Head-drift is a process failure; repository commands may regenerate audits, but they cannot know "last correction time" unless the process regenerates after corrections and records the correct HEAD.
## Assigned questions — answers

- [RESEARCH] Which `unverifiable` M014 audit rows are now decidable with the commands the repository already ships, and which need evidence this milestone cannot produce? → **Decidable with commands the repo already ships (examples):** rows about in-repo artifacts whose existence/content is checkable by repo commands (e.g. routes/components/files exist, config values in repo files, skills scripts present) — M014 deferred fix-doc rows 155/156/158 were discharged (`2c97f69`) per INTENT Corrections and re-derived as verified on regeneration. **Not decidable from repo-only shipped commands:** claims whose only evidence is an external checkout not controlled by repo (portal commit claim — repo can inspect external git log if path known, but if the external checkout is unavailable or has no such commit, the "committed" claim is false and must be corrected rather than verified; external state is outside repo control). Provenance (`.proven.json`) requires recording at correct time/order (process), budget decision requires recording measured values/reason (artifact), and audit regeneration at wrong head is a process error. Many M014 `unverifiable` rows require runtime/browser measurements not produced by static repo commands alone.

## Dead ends

- **D:\projects\github\LayZeeDK\HaasStefan__ng-journal-insurance-portal-ai-devtools (portal checkout)** — inspected per INTENT ruling; git log has no commit `f102b97`, so the `committed` claim cannot be verified and was ruled `fix-doc` (external checkout state outside repo control).
- **Runtime/browser measurements (DevTools attach/profiler/signal-graph timings, doctor counts)** — appear as `unverifiable` in DOCS-AUDIT.md and require running harnesses; not verifiable by static repo commands alone in this milestone scope.
