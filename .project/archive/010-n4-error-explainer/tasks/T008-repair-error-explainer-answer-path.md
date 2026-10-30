---
id: T008
title: Repair the error-explainer panel answer path and prove the claim
wave: 2
deps: [T003]
status: done
agent: build_T008
base: 34b31bd804ceb352800c06c15515cbf9b0954cc7
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/error-explainer.component.ts
  - src/panel/error-explainer-view.ts
  - scripts/error-explainer.test.mjs
---

# T008 — Repair the error-explainer panel answer path and prove the claim

## Context

The wave-2 review blocked T003: the Explain action can never reach the model because the component hard-codes
the no-digest marker and returns, the template renders no digest entry, and one import names a symbol the
capture module does not export. The panel-side helpers that do this correctly already exist in the panel view
module; the live component simply does not use them. The same review records that no `lars-verify` verdict
exists for the error-explainer claim on any of the four instances, and no insurance-portal record names the
claim.

## Approach

- Resolve the digest entry for the captured error code in the component and render it; keep the explicit
  no-digest entry branch only when the fact-list helper says the model must not be called.
- Call the panel-local Prompt API with the shaped fact list on an explicit Explain action and render the
  answer; never call the model on capture alone.
- Fix the invalid import to take the no-digest marker from the module that exports it.
- Extend the node:test slice to cover the resolved-entry path and the explicit-answer path, so the fixed
  behaviour is pinned rather than described.
- The two gate-level findings — the four-model `lars-verify` verdicts and the insurance-portal record — are
  executed by the orchestrator at the wave gate, because they need browsers and the shared instances; this
  task must leave the code in a state where that gate can pass, and must not claim any verdict.

## Interface contract

None

## Review findings

### sc4

Criterion: The panel explains a captured error using the panel-local Prompt API, sending only a short fact list, and the answer is shown in the panel.

- Found: `error-explainer.component.ts` never reaches `this.prompt.explainFacts(...)` because `digest` is hard-coded to `NO_DIGEST_ENTRY`, so no model call and no answer is ever shown; the fact list is correctly shaped in `src/panel/error-explainer-view.ts` but unused in the live component. fix: resolve the digest entry for the captured code and invoke the Prompt API on "Explain", rendering `res.text` in `ai-answer`.

### t003_ac1

Criterion: The panel renders a captured `NG0xxx` error with its owning component and, on "Explain", shows the model answer (SC1, SC4).

- The panel renders a captured `NG0xxx` error with its owning component and, on "Explain", shows the model answer (SC1, SC4). — found: `apps/.../error-explainer.component.ts` `explain()` hard-codes `const digest = NO_DIGEST_ENTRY` and returns before ever calling `this.prompt.explainFacts(...)`; the model answer path is unreachable, so "Explain" only ever sets `NO_DIGEST_ENTRY`. Evidence: `apps/angular-ai-devtools/src/app/error-explainer.component.ts` lines 32-44. fix: load/resolve the digest entry for the captured error code and call `buildErrorExplainFacts(err, digest)` + `this.prompt.explainFacts(facts)` when an entry exists; keep the explicit no-digest branch only when `shouldCallModel(...)` is false.

### t003_ac2

Criterion: The panel shows the matching digest entry — one entry per code, body at most 150 tokens — and never shows MIT license text or the Google LLC copyright notice (SC2, SC3).

- The panel shows the matching digest entry — one entry per code, body at most 150 tokens — and never shows MIT license text or the Google LLC copyright notice (SC2, SC3). — found: the component template renders only `err.code` and `err.component`; no digest entry is rendered anywhere in `error-explainer.component.ts`. Evidence: `apps/angular-ai-devtools/src/app/error-explainer.component.ts` template block. fix: render the resolved digest entry body (or `NO_DIGEST_ENTRY`) alongside the captured error, reusing `resolveDigest`/`buildPanelFactList` from `src/panel/error-explainer-view.ts`.

### t003_files

Criterion: `error-explainer.component.ts` imports `NO_DIGEST_ENTRY` from `src/main-world/error-capture`, which does not export it (`NO_DIGEST_ENTRY` lives in `src/main-world/error-digest`); the import is invalid even though the app tsconfig does not compile it.

- `error-explainer.component.ts` imports `NO_DIGEST_ENTRY` from `src/main-world/error-capture`, which does not export it (`NO_DIGEST_ENTRY` lives in `src/main-world/error-digest`); the import is invalid even though the app tsconfig does not compile it. — evidence: `apps/angular-ai-devtools/src/app/error-explainer.component.ts` line 5 vs `src/main-world/error-capture.ts` exports. fix: import `NO_DIGEST_ENTRY` from `../../../../src/main-world/error-digest`.

### sc5

Criterion: `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

- Found: no `verdict.json` for the error-explainer claim exists for any of the four instances (N7). Evidence: repository search returned no `error-explainer` verdict files. fix: run the wave-2 gate `lars-verify` checks and retain each `verdict.json`.

### t003_ac5

Criterion: `lars-verify` records a verdict of `verified` for the error-explainer claim across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct, with each `verdict.json` retained as evidence (SC5, N7).

- `lars-verify` records a verdict of `verified` for the error-explainer claim across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct, with each `verdict.json` retained as evidence (SC5, N7). — found: no `verdict.json` exists for an `error-explainer` claim under `.commandcode/worktrees/tmp` or `tmp`; only di-doctor/extension-panel/signal-provenance verdicts are present. Evidence: repository search for `verdict*error-explainer*verdict.json` returned none. fix: run `lars-verify check error-explainer` on all four instances and retain each `verdict.json` as evidence; do not cite check output as a verdict.

### sc6

Criterion: Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the claim records that external dependency.

- Found: no record names the insurance-portal fixture or a check run there for the error-explainer claim (N8). Evidence: none found. fix: run/record the insurance-portal error-explainer check where meaningful and cite the fixture.

### t003_ac6

Criterion: Where meaningful, the error explanation is also verified on the insurance-portal fixture and the claim records that external dependency (SC6, N8).

- Where meaningful, the error explanation is also verified on the insurance-portal fixture and the claim records that external dependency (SC6, N8). — found: no record naming the insurance-portal fixture/check for the error-explainer claim. Evidence: none found in repository. fix: run/record the insurance-portal error-explainer check where meaningful and cite the fixture and check in the claim record.

## Intent coverage

- SC4
- SC5
- SC6

## Acceptance criteria

1. On an explicit Explain action the panel resolves the captured error's digest entry, sends only the shaped fact list to the panel-local Prompt API, and renders the model answer; capture alone never calls the model (SC4).
2. The panel renders the resolved digest entry, or the explicit no-digest marker when the code has no entry, and the import of the no-digest marker names the module that exports it.
3. The node:test slice covers the resolved-entry path and the explicit-answer path.
4. The four-model `lars-verify` evidence and the insurance-portal record are produced at the wave gate by the orchestrator; this task claims no verdict of its own (SC5, SC6).

## Verify

```bash
node --experimental-strip-types --test scripts/error-explainer.test.mjs
```

Heavy: no

## Log

- created by build fix-task batching from the wave 2 cycle 1 review
- 2026-10-30 — fixed component answer path, template digest entry, import; extended node:test; Verify exit 0 — ready
- 2026-10-30 — orchestrator Verify (sidecar gsd-path-verify/task-t008-verify): pass, exit 0; output tail:
  ```
  ✔ buildErrorExplainFacts produces fact list (0.9691ms)
  ✔ empty state text (0.0881ms)
  ✔ no digest entry marker (0.0547ms)
  ✔ resolved digest entry path (0.1089ms)
  ✔ explicit answer path only calls model when a digest entry exists (0.0705ms)
  ℹ tests 5
  ℹ suites 0
  ℹ pass 5
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 159.9757
  ```
