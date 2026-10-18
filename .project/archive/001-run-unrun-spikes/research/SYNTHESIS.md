# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- Run order — follow handoff lines 51-68: offline/one-fixture (S16, S19, S17, S18) → model-browser (S14, S15, S20, S23) → tutor TS1-TS12 → fold into proposals → final closed-findings check since 0647e96 (`plans/angular-ai-devtools-proposals.handoff.md:51-68`; evidence-domain.md § Run order is a two-tier sequence).
- Instance assignment — four per-model browser instances on fixed ports 9333/9334/9335/9337; S16-18 via `control-angular-dev-app`, S20-23 via `control-vitest-browser-angular`; only non-daily profiles under `.browsers/` (AGENTS.md; INTENT.md N4).
- S16 lookup path — in the page's main world, walk the root component's `ɵgetInjectorResolutionPath`, then read each injector's `ɵgetInjectorProviders` records and match by identity against `Meta` (expected absent → "provided, not created yet") and `Router` (expected present, `get` returns instance with matching `url`); feature-detect each `ɵ` function; target root/environment injector; never `angular:di_graph` or `injector.get` on a `ViewContainerRef` (evidence-stack.md § `ng.ɵgetInjectorProviders` is the supported discovery API; evidence-pitfalls.md § S16's specified call path).
- S16 verdict rule — record exactly one of `works` / `works-with-degradation` / `fails` with evidence reference; missing evidence leaves blocked (INTENT.md SC2/E6; evidence-stack.md § Exported first-party class tokens are not identity-matchable across bundles).
- Evidence idempotency — every run creates a new timestamped file under `research/raw/`; no overwrite; notes point at latest measured run; ledger updates idempotent with no duplicate rows (INTENT.md E1/E5, N1/N2/N5).
- Round-10 stop rule — a review-loop termination criterion (stop after one closed-findings check even if minors remain), NOT the define step's completion gate; completion gate is the still-pending closed-findings check over everything changed since `0647e96` (evidence-domain.md § The round-10 stop rule is explicitly defined).
- Per-spike duration — no reliable source; treat as unknown, measure during runs, one dev server at a time, close all browsers/tabs/dev servers started (evidence-domain.md § Per-spike durations are not specified; evidence-pitfalls.md § S16 has no duration estimate).

## Decisions

### Wave ordering and parallelism

- **Decision**: Run spikes strictly in handoff order, serialized per per-model instance; offline spikes (S16/S19/S17/S18) need no model browser and can run without instance contention; model-browser spikes (S14/S15/S20/S23) serialize on their instances (S14/S15 on 9334/9335; S20/S23 on 9335/9337), with queue/reset between batches.
- **Runner-up**: Maximize parallelism across all four instances — rejected because control scripts refuse parallel use of the same instance and shared profiles risk residue/collision.
- **Evidence**: evidence-domain.md § Instance requirements are four per-model browser instances; evidence-pitfalls.md § Per-model instances are four; § Residue risk from persistent Playwright profiles.
- **Confidence**: high

### S16 measurement controls

- **Decision**: S16 uses identity-only matching and a second walk proving no `Meta` record appears; never call `get` on a found `Router` lazily in a way that constructs; isolate each failure mode (missing export, name-vs-identity, lazy `get` side effect, first-walk contamination).
- **Runner-up**: Also assert by string name or construct `Meta` to confirm — rejected because string-name matching is unsupported by the API and construction invalidates the "nothing constructed" assertion.
- **Evidence**: evidence-pitfalls.md § Failure modes for the S16 lookup path; evidence-stack.md § Exported first-party class tokens are not identity-matchable across bundles; § `Meta` is an ordinary `@Service()`-decorated exported class.
- **Confidence**: high

### Blocked-spike recording

- **Decision**: Any spike that cannot run is recorded as blocked with the exact precondition (instance availability, model download, branded-browser access, or permission); never silently skipped or counted complete.
- **Runner-up**: Skip and mark pending — rejected by INTENT.md N6/SC4.
- **Evidence**: INTENT.md SC4/E2/N6; evidence-pitfalls.md § Residue risk from persistent Playwright profiles.
- **Confidence**: high

### Closed-findings check

- **Decision**: Carry the closed-findings check over everything changed since `0647e96` as a final step in this milestone, rerun from `0647e96` if the gitignored `tmp/review/round10-brief-closed.md` is unrecoverable; one reviewer briefed like the round-10 brief.
- **Runner-up**: Rely on the stop rule to skip it — rejected because the stop rule is a review-loop termination criterion, not the completion gate.
- **Evidence**: evidence-domain.md § The closed-findings check over everything changed since `0647e96` is still outstanding; § The round-10 stop rule is explicitly defined.
- **Confidence**: high

### Doc-vs-code audit rulings

- **Decision**: Carry the DOCS-AUDIT rulings (114 fix-doc via full path, 38 accept-drift, 5 stale fix-doc, 51 aspirational fix-doc) as remediation scheduled in planning; none blocks this milestone.
- **Runner-up**: Block milestone on audit remediation — rejected by INTENT.md (remediation scheduled in planning; none blocks).
- **Evidence**: INTENT.md Current state (brownfield only) § Doc-vs-code rulings; RESEARCH.md (audit alignment pass).
- **Confidence**: high

## For the planner

- **Wave-1 blockers**: S16's companion-package Meta-class lookup (gates the companion package's main claim); per-spike instance availability/model downloads for S4/E1-E13/S14-S23; recoverability of gitignored `tmp/review/round10-brief-closed.md`; per-spike durations unknown (measure during runs).
- **Walking skeleton**: Run S16 offline against the counter fixture via `control-angular-dev-app` + `lars-verify`, producing a timestamped `research/raw/` artifact and a `works`/`works-with-degradation`/`fails` verdict, then fold into `research/*.md` + `docs/filing-ledger.md`.
- **Pitfalls → tasks**: `angular:di_graph`/VCR `injector.get` corrupts signal graph → S16 must use `ɵgetInjectorProviders`/`ɵgetInjectorResolutionPath` read path only; cross-bundle `Meta` identity mismatch → companion package must perform lookup inside app bundle/main world; persistent profile collision → queue/reset per instance, close all browsers; first-walk `get` contaminating second walk → identity-only matching + second-walk control; lazy `get` side effects → never call `get` on found `Router` record during walk.

## User rulings

- Which of S4, E1-E13, and S14-S23 can run in automated mode vs. need manual model download/branded browser from Lars? → Treat all as automated-first; any spike that fails on a missing precondition is recorded blocked with the exact precondition (INTENT.md SC4/E2/N6).
- Is the gitignored `tmp/review/` evidence recoverable, or must the closed-findings check be rerun from `0647e96`? → Rerun the closed-findings check from `0647e96` as the final step; do not rely on the missing file.
- Which unrun spikes (if any) are blocked on a specific branded browser profile or model that Lars must pre-approve? → Pre-approve all branded/model downloads needed by the plan; spikes needing them are not skipped by default.

## Still unknown

- Per-spike durations — no source; measure during runs; accept risk (wave-1 measurement).
- Angular 22.2 `ɵ` surface is undocumented (no public doc page); feature-detect each function — accept risk.
- 38 external doc claims remain unverified against their sources — accept risk (may resurface during planning).
- Exact run order/instance requirements beyond handoff lines 51-68 — handoff is authoritative; accept.
- Round-10 closed-findings inputs — resolved: rerun from `0647e96` (no longer unknown).