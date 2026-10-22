# Plan — angular-ai-devtools (milestone: nx-angular-workspace, feature N1)

Project verify: `npm ci && npm run check && npm test && npx nx run angular-ai-devtools:build-extension --skip-nx-cache && npx nx test angular-ai-devtools --skip-nx-cache`

## Config

- max_review_cycles: 3
- wave_budget: none
- review_panel: off
- finding_skeptics: off

## Wave 1 — risk burn-down

Goal: prove the three plan-invalidating risks before any UI lands: the `template.debuggableFn === instance.constructor` join and microtask-bounded cycle window on `spikes/ng222-app`, and the panel-local Prompt API availability contract (downloadable counts as unavailable). If any fails, the trigger walk or availability handling is redesigned before Wave 2.
Review depth: full

## Wave 2 — walking skeleton

Goal: a running end-to-end slice: the MAIN-world recorder feeds recorded cycles to the panel, the panel lists checked components, shows the chain for a picked component, and calls the panel-local Prompt API with a fact list. Browser test on `spikes/ng222-app` proves the chain.
Review depth: full

## Wave 3 — cleanup and hardening

Goal: remove all dead bridge/files with no dangling references, harden the panel against forged/untrusted chain data and prompt injection, and verify the browser matrix availability reasons.
Review depth: verify-only

## Surface contract

### DevTools panel — T004

Criteria: SC2, SC3, SC5
Entry: open Chrome DevTools on the inspected tab, select the "Angular AI" panel (`extension/devtools.html` → `devtools.js` → panel at `panel/index.html`)
States:
- empty: "no cycles recorded" until a change-detection cycle has checked a component since recording started (page reload resets recording)
- loading: "checking…" while `LanguageModel.availability()` is being read
- error: availability reason string shown; explain button disabled; deterministic chain still renders
- success: component picker lists checked components; selected component shows its last cycle's chain; explain button returns an answer
Walkthrough:
1. Load `spikes/ng222-app`, open the Angular AI panel; confirm recording starts and "no cycles recorded" shows before interaction.
2. Click the counter button; confirm the picker lists `app-counter` and selecting it shows `click -> count -> double -> app-counter template`.
3. Click Explain; confirm a single model call occurs and the answer renders; repeat on an unchanged slice and confirm no second model call (epoch cache).
4. Run with `--no-ai-features` on a warm profile; confirm the chain renders and the explain button shows the availability reason.

## Intent coverage

| Criterion | Task | Acceptance |
|-----------|------|------------|
| SC1 | T001 | AC1 |
| SC1 | T001 | AC2 |
| SC1 | T002 | AC1 |
| SC2 | T004 | AC1 |
| SC2 | T004 | AC2 |
| SC2 | T004 | AC3 |
| SC3 | T003 | AC1 |
| SC3 | T004 | AC4 |
| SC3 | T004 | AC5 |
| SC4 | T002 | AC2 |
| SC4 | T002 | AC3 |
| SC4 | T005 | AC1 |
| SC5 | T003 | AC2 |
| SC5 | T004 | AC6 |
| SC6 | T006 | AC1 |
| SC6 | T006 | AC2 |
| SC6 | T006 | AC3 |

## Held-out checks

| Edge | Task | Test |
|------|------|------|
| E4 | T001 | extension/agent-main.test.mjs::cycle-order |

## Dependency notes

- T002 depends on T001: it consumes the recorded cycle shape (array of `{ componentInstance, events: ProfilerEvent[] }` with microtask-delimited boundaries) defined in T001's Interface contract and the forbidden-API guarantee.
- T004 depends on T001/T002/T003: the panel consumes the recorded cycle shape (T001) and the chain-walk function (T002), and gates Explain on the availability contract fixed in T003.
- T005 depends on T004: the browser test drives the panel UI delivered by T004.
- T006 depends on T001/T004: deletion of the prompt bridge must not remove the recorder's remaining page-reading path, and the panel must already use only shaped facts.