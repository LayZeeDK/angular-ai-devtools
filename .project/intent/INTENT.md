# Intent — angular-ai-devtools

<!-- Written by /gsd-path-define. Every downstream agent reads this first.
     Constraints and vetoes here override everything downstream. -->

Lane: standard   <!-- standard | quick | milestone -->
Review panel: off
Finding skeptics: off

Surfaces: command-line spike runs, research notes, filing ledger

## Summary

This milestone closes the unrun part of the measurement backlog that the ratified design depends on: every remaining open spike, S4, S14-S23, E1-E13, and TS1-TS12, gets run once against the configured per-model browser instances and produces committed, timestamped evidence plus a dated research-note delta. Lars (the sole user, technical) runs and reviews the spikes through the existing control scripts and commits the resulting evidence. It delivers measurement, not product code: no extension source, companion package, or root tooling is touched.

## Problem

The design is frozen at `docs/feature-proposals.md` and ratified by §8, but its pending measurement pipeline (S4, S14-S23, E1-E13, TS1-TS12) is still listed as unrun in `research/05-spikes.md` and the filing ledger. Several ratified features — router identity lookup (lookup-by-exported-class, S16), Worker Prompt API, `cdpAttach()` guard, Summarizer/Translator/WebMCP behavior, tutor cards — depend on these measurements, and their status is vague or "has not run". S16 in particular gates the companion package's main claim. The milestone turns these open questions into measured evidence.

## Users

Lars Gyrup Brink Nielsen, sole user/researcher, highly technical. Runs spikes via the per-model browser control scripts and reads `research/raw/*.json` + `research/*.md`. No other users.

## Success criteria

1. Each unrun spike named in `research/05-spikes.md` (S4, S14-S23, E1-E13, TS1-TS12) runs once and leaves a committed, timestamped evidence artifact under `research/raw/` (or the documented spike output path) plus a note in its matching research file, marking prior pending status updated. Every run creates a new timestamped evidence file (no overwrite), runs do not overlap on the same per-model instance, and follow `plans/angular-ai-devtools-proposals.handoff.md` next-work order.
2. S16's companion-package Meta-class lookup records exactly one of `works` / `works-with-degradation` / `fails`, with the measured evidence reference; with no evidence it stays blocked (never assumed from the lookup's theoretical argument).
3. `docs/filing-ledger.md` and the relevant `research/*.md` notes are updated from pending/unrun to measured for every completed spike, and rerunning an update does not duplicate rows.
4. Any spike that cannot run is recorded as blocked with the exact precondition (instance availability, model download, branded-browser access, or permission), not silently skipped or counted complete.

## Edge coverage

| Edge | Criterion | Category | Disposition | Detail |
|------|-----------|----------|-------------|--------|
| E1 | SC1 | idempotency | criterion SC1 | each run creates a new timestamped evidence file; notes point at the latest measured run; reruns never overwrite |
| E2 | SC4 | empty | criterion SC4 | a run with no usable instance/precondition records blocked rather than skipped or completed |
| E3 | SC1 | concurrency | criterion SC1 | two spikes never run on the same per-model instance concurrently; queue or reset between batches |
| E4 | SC1 | ordering | criterion SC1 | follow plans handoff next-work order; reset browser state after a residue-prone failure before rerun |
| E5 | SC3 | idempotency | criterion SC3 | ledger/note status updates are idempotent: re-run overwrites status, no duplicate measured rows |
| E6 | SC2 | boundary | criterion SC2 | S16 records only works / works-with-degradation / fails, each with evidence reference; missing evidence leaves blocked |

## Prohibitions

| Prohibition | Criterion | Must not | Disposition | Detail |
|-------------|-----------|----------|-------------|--------|
| N1 | SC1 | label a spike 'measured' without a committed evidence artifact | judgment | final reviewer checks the artifact path exists at the cited SHA |
| N2 | SC1 | overwrite or delete prior `research/raw/` evidence files | judgment | final reviewer checks no prior timestamped evidence file was removed or replaced |
| N3 | SC2 | extend S16's lookup verdict into a broader companion-package feasibility claim | judgment | final reviewer checks INTENT/notes only state the single lookup claim |
| N4 | SC1 | drive Lars's daily `chrome`/`edge` browsers or branded profiles without explicit approval | judgment | final reviewer checks only non-daily profiles and control script instances were used |
| N5 | SC3 | mark a spike 'measured' in the ledger without its evidence reference | judgment | final reviewer checks each measured row links to an artifact path |
| N6 | SC4 | record a blocked spike as measured or skip it without a precondition | judgment | final reviewer checks every unrun spike is measured or explicitly blocked |

## Scope: in

- Run all currently unrun spikes listed in `research/05-spikes.md` (S4, S14-S23, E1-E13, TS1-TS12), grouped into waves by the plan.
- Capture timestamped raw evidence per spike using the existing per-model control scripts.
- Record S16's companion-package Meta-class lookup verdict with evidence.
- Update `research/*.md` notes and `docs/filing-ledger.md` from pending to measured for completed spikes.
- Record blocked spikes with exact preconditions.
- Record the doc-vs-code rulings from the audit alignment pass (below) for downstream handling.

## Scope: out (vetoes)

- Extend or build the MV3 devtools extension source — the extension remains design-only in this milestone.
- Name, version, or scaffold the companion package (`provideAiDevTools()` etc.) — S16 measures only the lookup claim.
- Add a root `package.json`, `tsconfig`, `README`, or `AGENTS.md` as steady-state change.
- Drive Lars's daily browsers (`chrome`, `edge`) or brand-new profiles without explicit approval.
- Rewrite or delete existing `research/raw/*.json` evidence.

## Constraints

- Docs-first repository: no root manifest; all runnable commands are Node ESM skill scripts and per-model browser control scripts, not npm scripts.
- Measurements require per-model browser instances (Chrome Beta, Edge Dev, Edge stable) and any model downloads they need; some runs need Lars's explicit gesture or manual download.
- S4/E-spikes touch extension identity/routing claims and may require a browser available only after setup; those are allowed to be recorded blocked instead of run.
- The S16 result is about Angular 22.2's public/`${}`-surface lookup behavior only; do not project it onto the companion package.
- `tmp/review/` round findings and `*-brief-*.md` are gitignored; the last review round's closed-findings check (handoff line 67, from `0647e96`) is not recoverable from the tree.
- Four AI auditors found 5 stale doc claims and 51 aspirational claims in prior alignment pass; integration here does not repair them.
- Integration mode `direct`; no external landing.

## Current state (brownfield only)

- **What exists**: docs-first research/design repo for an MV3 on-device-LLM devtools extension; no product source (only S1 probe `spikes/s1-extension/`); Angular 22.2.2 fixtures in `spikes/ng222-app` and `spikes/ng222-ssr`; Vitest 5.0.3 Browser Mode; measurement harness via per-model control scripts. Design frozen and ratified (1080-line proposals, §8 rulings), 164 commits, clean tree at `ecfdbd0`.
- **Must not break**: existing measured evidence (`research/raw/*.json`, `research/s1-results/*.json`, `research/ep-trials/`), committed probes/skills conventions (conventional commits, numbered notes, evidence labels), and the S1 probe's manifest/behavior.
- **Doc-vs-code rulings**: DOCS-AUDIT.md (165 unverifiable + 51 aspirational + 5 stale as found 2026-10-15). Of 152 "Not found" claims, 114 resolve via directory-prefix shorthands, numbered-note shorthand, basename, or wildcard — ruling `fix-doc` (cite full path). Remaining 38 (external Chrome/Angular doc URLs, wildcard directories, fragments, one tracked-folder assertion) ruling `accept-drift` (source outside repo or deferred). 5 stale claims ruling `fix-doc` (correct ports/counts/paths). 51 aspirational claims ruling `fix-doc` (mark aspirational or implement). Remediation scheduled in planning; none blocks this milestone.
- **Ground truth**: `.project/research/evidence-codebase.md`, `.project/research/DOCS-AUDIT.md`

## Risks

- 35 unrun spikes in one milestone; some may require model downloads or branded-browser sessions that may be unavailable or need Lars's approval (S4, E1-E13 in particular).
- S16's verdict can gate the entire companion-package plan; an ambiguous result leaves it ungrounded.
- Round-10 closed-findings check may be unverifiable because `tmp/review/` is gitignored; we cannot confirm what `0647e96` closed.
- Per-model browsers share machines/resources; switching backends mid-wave risks residue and invalid measurements (addressed by E3/E4).
- Doc audit rulings consolidated; 38 external claims remain unverified against their sources and may resurface during planning.

## Open questions

- [RESEARCH] What is Angular 22.2's actual lookup path for a Meta-class/exported provider (`ng.ɵgetInjectorProviders` etc.), and what exactly does S16 need to call?
- [RESEARCH] Exact run order, instance requirements, and per-spike duration (handoff line 51-68 ordering).
- [RESEARCH] Is the round-10 stop rule the define step's completion gate for research review?
- [NEEDS-USER] Which of S4, E1-E13, and S14-S23 can run in automated mode vs. need manual model download/branded browser from Lars?
- [NEEDS-USER] Is the gitignored `tmp/review/` evidence recoverable, or must the closed-findings check be rerun from `0647e96`?
- [NEEDS-USER] Which unrun spikes (if any) are blocked on a specific branded browser profile or model that Lars must pre-approve?

## Corrections

- none yet