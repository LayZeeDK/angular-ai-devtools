# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Surfaces: none (INTENT.md `Surfaces: none`)
- Review panel: off (INTENT.md `Review panel: off`; AGENTS.md "Review panel stays off until the installer's guarded family patch lands")
- Finding skeptics: off (INTENT.md `Finding skeptics: off`)
- Scope out vetoes — no new product features, no shipped-behaviour changes to make a doc true, no rewriting already-verified documents, no `.project/archive/` edits, no code generation (INTENT.md Scope out; N2)
- No change under `apps/`, `src/`, `extension/` or a skill script in any SC2 task (INTENT.md N2)
- Skills mirror parity for `control-ai-browsers` and `verify-ai-browsers` must stay green (INTENT.md Constraints; AGENTS.md `scripts/skills-mirror.test.mjs`)
- TypeScript pinned to 6.0.x; Project Verify fixed as `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` (AGENTS.md Toolchain; INTENT.md SC4)
- Audit rulings carry forward verbatim; a persisting queue row keeps its number (INTENT.md Constraints)
- Retirement of a document permitted only when nothing replaced the capability and no live instruction depends on it, named in the task (INTENT.md Current state)
- Delegated rulings already recorded: queue 649 `fix-doc` (1110 lines), queue 650 `fix-doc` (date head, mark superseded), roadmap `[NEEDS-USER]` corrected in place (INTENT.md Corrections; N5)
- M013 runs unattended under the standing grant; no stop at intent/plan/rulings/edges/NEEDS-USER/ship (AGENTS.md "M013 runs unattended")
- Frozen inventory equality required of the audit gate (INTENT.md N1)

## Decisions

### Settling the 45 settleable unverifiable rows

- **Decision**: Targeted re-derive pass that re-derives only the 45 rows a shipped command or in-repo path can settle (file existence, grep for message strings/EXT_ID, `npx nx show project`, `git status`), recording a concrete verdict and evidence for each; leave the other 92 as not-settleable with honest missing-evidence wording.
- **Runner-up**: One full re-audit that re-derives all 137 unverifiable rows — lost because 92 cannot be settled by static evidence (external portal, browser/on-device runtime, upstream sources, dated measurements), so re-running would only reproduce "no reliable source found" and burn 12 Beam-high chunk workers (evidence-audit-verifiability.md § "On-device/browser claims are not-settleable"; evidence-pitfalls.md § "Portal and runtime-UI claims cannot be settled"; INTENT.md N3 only forbids unverifiable where evidence exists).
- **Evidence**: evidence-audit-verifiability.md § "Assigned questions — answers" (45 settleable / 92 not-settleable); evidence-pitfalls.md § "Many 'unverifiable' rows are only uninspected static claims"; INTENT.md Scope in ("Re-derive a verdict for each unverifiable row whose claim a shipped command can actually test")
- **Confidence**: high

### Fate of the 92 not-settleable rows (and SC1 survival)

- **Decision**: Record honest non-repository evidence wording on each of the 92 naming the missing evidence (portal checkout, browser/on-device runtime, upstream source, or dated measurement), with "no reliable source found" as the verdict where applicable; apply `accept-drift` rulings to the dated-measurement subset following the 649/650 pattern; retire a document only where nothing replaced the capability and no live instruction depends on it, with the path named in the task. SC1 survives because SC1 counts only stale (2) and aspirational (4), which are corrected/retired in their own tasks; the 92 remain `unverifiable` and are not counted in SC1.
- **Runner-up**: Retiring the documents wholesale — lost because most still carry live instructions or describe shipped capability, and INTENT.md's retirement ruling requires both no replacement and no live dependency, so blanket retirement would violate Scope out and N5; accept-drift for all 92 was rejected because only the dated-measurement subset is genuinely dated.
- **Evidence**: evidence-pitfalls.md § "Portal and runtime-UI claims cannot be settled from this repository", § "On-device model and browser-only claims are environment evidence", § "External Angular/Chromium/upstream claims are outside the sidecar", § "Historical dated measurements drift silently and need accept-drift rulings"; evidence-audit-verifiability.md § "On-device/browser claims are not-settleable under the static-only constraint"; INTENT.md SC1, N5, Scope out; DOCS-AUDIT.md Summary (stale 2, aspirational 4)
- **Confidence**: high

### Re-audit mode: delta rule vs full re-audit

- **Decision**: Re-audit with the delta rule — carry unchanged verified rows forward with an `unchanged:` prefix and re-derive only corrected/changed rows — so a second run reproduces the Summary counts and never resurfaces a corrected claim (E2), at a fraction of the 12-worker inspect cost.
- **Runner-up**: Full re-audit of all 141 documents — lost because it re-runs 12 Beam-high chunk workers over 202 already-verified rows, risks resurfacing corrected claims in violation of E2, and INTENT.md requires rulings to carry forward verbatim rather than be re-derived.
- **Evidence**: INTENT.md E2 (idempotency), E3 (fixed Summary template/order); INTENT.md Constraints ("Audit rulings carry forward verbatim"); evidence-codebase.md § "Maturity" (12-worker inspect cost implied by chunked protocol); AGENTS.md "M013 runs unattended" (cost/time budget)
- **Confidence**: high

### Batching the six stale/aspirational corrections into tasks

- **Decision**: One correction task per document (three correction tasks: `plans/angular-ai-devtools-proposals.handoff.md` covering rows 649/650, `.commandcode/skills/nx-import/references/TURBOREPO.md` covering row 465, `docs/design/tutor.md` covering rows 645–647) plus one separate re-audit task, so each diff touches only the sentences the audit marks and leaves verified sentences byte-identical (E4).
- **Runner-up**: One correction task plus one re-audit task (or one task per document family) — lost because a single correction task would conflate three unrelated documents/families and make E4's byte-identical check unreviewable; per-family still collapses the plans/skills/docs families into one mixed task.
- **Evidence**: INTENT.md E4 (boundary: corrected sentences only, verified sentences byte-identical); DOCS-AUDIT.md rows 465, 645–647, 649–650; INTENT.md SC2
- **Confidence**: medium

### Instrument that proves the milestone and where it runs

- **Decision**: Audit gate plus Project Verify: run `check_docs_audit.py` with `--repo` the docs sidecar, `--primary` the primary worktree, `--inventory` the frozen inventory file and `--prior-audit` the preserved prior copy to prove zero stale/aspirational and frozen-inventory equality, and run the Project Verify (`npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` plus `scripts/skills-mirror.test.mjs`) in the sidecar and re-confirm on the primary worktree with both a cold and a warm Nx cache (E7).
- **Runner-up**: Project Verify commands only — lost because Verify cannot attest the audit's Summary counts or frozen-inventory equality, so SC1 would be unproven (INTENT.md SC1, N1, N4).
- **Evidence**: INTENT.md SC1, SC4, E7; INTENT.md Constraints (audit gate command); AGENTS.md "Verify sidecar dependencies" (bridge); evidence-codebase.md § "Sidecar verification depends on a dependency bridge"
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: (a) re-derive the 45 settleable rows without violating N3 (any row whose suggested action names no code path while a shipped command could settle it fails review); (b) settle the dated-measurement accept-drift subset and the portal/on-device/upstream wording without misclassifying rows as stale/aspirational (SC1); (c) reconcile the interop route registration vs served `/panel/interop` mismatch before claiming N25 (evidence-codebase.md § "Interop route is registered but its verification check stays could-not-run"); (d) the N25 portal half still needs a ruling before SC1 is claimable (AGENTS.md Verification fixtures).
- **Walking skeleton**: the thinnest end-to-end slice is one corrected document (e.g. `plans/angular-ai-devtools-proposals.handoff.md` for rows 649/650) re-audited with the delta rule, proving the regenerated audit prints stale 0 / aspirational 0 and the audit gate passes in the sidecar.
- **Pitfalls → tasks**: stale/aspirational rows 649, 650, 465, 645–647 → per-document correction tasks (E4 byte-identical verified sentences); 45 settleable unverifiable rows → targeted re-derive task (N3); 92 not-settleable rows → honest-evidence-wording + accept-drift/retirement task (N5); skills-mirror parity → verify in the same task as any `.commandcode`/`.claude` skill edit; sidecar dependency bridge → run every check through it (AGENTS.md).

## User rulings

- Queue 649 → `fix-doc` (delegated 2026-10-31, INTENT.md Corrections)
- Queue 650 → `fix-doc` (delegated 2026-10-31, INTENT.md Corrections)
- Roadmap `[NEEDS-USER]` → correct in place; retire only when no replacement and no live instruction (delegated 2026-10-31, INTENT.md Corrections)
- Queues 310–320, 379, 414–415 → `accept-drift` (recorded in DOCS-AUDIT.md User rulings)

## Still unknown

- Which of the 137 unverifiable rows are testable — answered by the 45/92 triage, but per-row reclassification is the milestone's job, not this research step (evidence-pitfalls.md Dead ends).
- Whether the interop route registration is sufficient for `verify-ai-browsers/checks/interop.mjs` or the served build still needs wiring (evidence-codebase.md Open questions) — plan: wave-1 spike.
- Whether `src/main-world/*.ts` tracers are compiled into `extension/agent-main.js` or remain hand-maintained parallel (evidence-codebase.md Open questions) — plan: accept risk (not in scope).
- Which skill tree is authoritative for the 10 non-mirrored skills (evidence-codebase.md Open questions) — plan: accept risk.
- Whether the two `*.node.test.ts` files under app src are collected by `npm test` (evidence-codebase.md Open questions) — plan: accept risk.
- N25 portal half (unlabelled effect whose `debuggableFn` contains `subject.error`) has no source in the portal checkout; needs a ruling before SC1 is claimable (AGENTS.md Verification fixtures; N5) — plan: NEEDS-USER / delegated ruling.