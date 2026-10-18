# Plan — angular-ai-devtools

Project verify: `git diff --check`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: Prove S16's companion-package Meta-class lookup verdict and establish instance/precondition availability plus blocked-spike recording before any dependent fold work.
Review depth: full

## Wave 2 — offline spikes

Goal: Complete remaining offline (no model browser) spikes S17-S19 against fixtures.
Review depth: verify-only

## Wave 3 — model-browser spikes

Goal: Run S14/S15/S20/S23 on per-model instances with queue/reset between batches.
Review depth: full

## Wave 4 — tutor spikes

Goal: Run TS1-TS12 tutor-card measurements.
Review depth: verify-only

## Wave 5 — extension-identity and edge spikes

Goal: Run S4 and E1-E13, recording blocked preconditions where instances/models are unavailable.
Review depth: full

## Wave 6 — fold and ledger

Goal: Fold measured results into research notes and filing ledger idempotently.
Review depth: verify-only

## Wave 7 — closed-findings check and final verification

Goal: Rerun closed-findings check since 0647e96 and confirm every unrun spike is measured or explicitly blocked.
Review depth: full

## Surface contract

### command-line spike runs — T001

Criteria: SC1, SC2
Entry: `node .claude/skills/control-angular-dev-app/scripts/control.mjs up --target counter` then spike probe via `node .claude/skills/control-ai-browsers/scripts/control.mjs run ...`
States: empty (no instance/fixture running) shows refused/exit 2; loading shows dev server/browser startup; error shows precondition failure or blocked record; success shows timestamped evidence JSON under `research/raw/` plus verdict.
Walkthrough:
1. Start counter fixture and run S16 probe; confirm new timestamped file in `research/raw/`.
2. Read verdict file; confirm exactly one of works/works-with-degradation/fails with evidence reference.

### research notes — T007

Criteria: SC3
Entry: updated `research/05-spikes.md` and matching `research/*.md` notes
States: empty (pending) shows prior pending status; loading shows in-progress runs; error shows blocked precondition; success shows measured status with evidence reference.
Walkthrough:
1. Open `research/05-spikes.md`; every completed spike shows measured with artifact path.
2. Re-run update; confirm no duplicate rows.

### filing ledger — T008

Criteria: SC4
Entry: `docs/filing-ledger.md`
States: empty (pending/unrun) shows prior status; success shows measured/blocked status with evidence reference.
Walkthrough:
1. Open ledger; every completed spike row links to artifact path.
2. Re-run update; confirm no duplicate measured rows.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T003 | AC1 |
| SC1 | T004 | AC1 |
| SC1 | T005 | AC1 |
| SC1 | T006 | AC1 |
| SC2 | T001 | AC2 |
| SC3 | T007 | AC1 |
| SC4 | T002 | AC1 |
| SC4 | T006 | AC1 |
| SC4 | T008 | AC2 |

## Dependency notes

T004 depends on T001 because S16's offline run establishes the evidence idempotency pattern and control-script usage reused by S17-S19. T005 depends on T001/T004 for queue/reset discipline. T006 depends on T005 for model-browser instance sequencing. T007 depends on T006. T008 depends on T001/T004/T005/T006/T007 for measured results.