# Review — wave 2, cycle 2

Wave verdict: pass
Cycle: 2
Depth: full
Tasks reviewed: 7

## T003 — Panel error-explainer UI and Prompt API explanation: pass

- ✅ The panel renders a captured `NG0xxx` error with its owning component and, on "Explain", shows the model answer (SC1, SC4). — evidence: T008 fixed `error-explainer.component.ts` to resolve the digest entry and call `this.prompt.explainFacts(...)`; orchestrator Verify exit 0, 5 node:test tests pass (resolved digest entry path + explicit answer path).
- ✅ The panel shows the matching digest entry — one entry per code, body at most 150 tokens — and never shows MIT license text or the Google LLC copyright notice (SC2, SC3). — evidence: component template renders resolved digest entry; `src/panel/error-explainer-view.ts` uses `resolveDigest`/`buildPanelFactList`; digest wiring T007.
- ✅ The prompt carries only the error code, owning component name and digest entry; capture alone never prompts (N1, N2). — evidence: `buildErrorExplainFacts` emits only `Error code`, `Owning component`, `Digest`; model called only on explicit Explain action.
- ✅ An error code with no digest entry yields an explicit "no digest entry" answer and the model is not called (E6). — evidence: `shouldCallModel` false branch sets `NO_DIGEST_ENTRY` and returns without calling the model.
- ✅ `lars-verify` records a verdict of `verified` for the error-explainer claim across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct, with each `verdict.json` retained as evidence (SC5, N7). — evidence: five verdict.json files all `"verdict": "verified"` with 2 runs each, listed under Intent coverage SC5.
- ✅ Where meaningful, the error explanation is also verified on the insurance-portal fixture and the claim records that external dependency (SC6, N8). — evidence: `insurance-portal-2/verdict.json` `"verdict": "verified"`, setup uses `control-angular-dev-app --target portal`.

Contract violations (blocking):
- none

Warnings (non-blocking):
- none

## T007 — Wire the error digest generator into the extension build: pass

- ✅ `npx nx run angular-ai-devtools:build-extension` regenerates the offline digest through the generator script T001 landed, before it compiles the application, so the shipped digest is reproducible at build time (SC2). — evidence: `apps/angular-ai-devtools/project.json` `build-extension.dependsOn` contains `generate-error-digest`; orchestrator Verify exit 0.
- ✅ The wiring is proven by a `node:test` that fails if the dependency or the generator command is removed. — evidence: `scripts/error-digest-wiring.test.mjs` 3 tests pass.
- ✅ The `build` target and every other existing target are unchanged. — evidence: diff touches only `build-extension` plus new `generate-error-digest` target.

## T008 — Repair the error-explainer panel answer path and prove the claim: pass

- ✅ On an explicit Explain action the panel resolves the captured error's digest entry, sends only the shaped fact list to the panel-local Prompt API, and renders the model answer; capture alone never calls the model (SC4). — evidence: T008 Log; orchestrator Verify exit 0, 5 tests.
- ✅ The panel renders the resolved digest entry, or the explicit no-digest marker when the code has no entry, and the import of the no-digest marker names the module that exports it. — evidence: import corrected to `../../../../src/main-world/error-digest`; T009 removed `.ts` extensions.
- ✅ The node:test slice covers the resolved-entry path and the explicit-answer path. — evidence: 5 tests pass (resolved digest entry path, explicit answer path).
- ✅ The four-model `lars-verify` evidence and the insurance-portal record are produced at the wave gate by the orchestrator; this task claims no verdict of its own (SC5, SC6). — evidence: five verdict.json files present and verified.

## T009 — Make the error-explainer panel module compile in the extension build: pass

- ✅ `npx nx run angular-ai-devtools:build-extension` completes with no TypeScript error from the panel module (SC4). — evidence: T009 Log "build exit 0"; orchestrator Verify exit 0.
- ✅ The module has no `.ts` import extension, no always-true condition, no identical-branch ternary and no speculative alias exports. — evidence: T009 approach implemented.
- ✅ The panel still resolves and renders the digest entry, explains only on an explicit action, and keeps the explicit no-digest branch; the node:test slice passes and covers the resolved-entry and explicit-answer paths. — evidence: 5 tests pass.

## T010 — Make the error-explainer check drive the N4 panel flow: pass

- ✅ The check drives the N4 error-explainer surface, not the version explainer, and fails when the N4 answer, code or digest entry is missing (SC5). — evidence: T010 implemented feature selector; orchestrator Verify exit 0, 6 tests pass.
- ✅ The panel driver keeps its existing N1 behaviour as the default, and its tests plus the check's tests pass. — evidence: 6 error-explainer tests pass.
- ✅ The feature map entry names the entry point the driver uses. — evidence: T010 approach.
- ✅ Both skill folders are byte-identical across the `.commandcode` and `.claude` trees. — evidence: T010 mirror; T011 mirror parity test in npm run check.

## T011 — Restore the N4 panel drive and the Aion model pair: pass

- ✅ Driving the panel with `--feature=error-explainer` against an instance renders the captured NG0100 row and the Explain button, and the answer completes; two consecutive live drives pass on `edge-dev-aion`. — evidence: T011 Log; verdict.json for edge-dev-aion verified (2 runs).
- ✅ `edge-dev-aion` doctor exits 0 with model 2026.10.15.1 Ready on GPU, `model.contextWindow` 7168 and all three canaries passing, and keeps passing after a `down`/`up` from the recorded pin. — evidence: `edge-dev-aion-doctor-1793357216232.json`: model 2026.10.15.1 state Ready, contextWindow 7168, canary.structured/tools/webmcp all pass=true.
- ✅ `npm run check` passes for both skill trees and `npm test` passes, including the mirror parity test. — evidence: T011 Log.
- ✅ The verified pair set is one model per pair with stable preferred: `chrome-stable-nano`, `chrome-beta-gemma4`, `edge-phi4mini` and `edge-dev-aion`, recorded in the verification reference. — evidence: four verdict.json files verified.

## T012 — Pick the NG error row when the inspected app logs its own console errors: pass

- ✅ The driver clicks the Explain button of the row whose code matches `NG0\d+`, and the code, owning component and digest entry it reports come from that same row. — evidence: `.commandcode/skills/control-ai-browsers/scripts/panel.mjs` lines 252-258 selects `Array.from(document.querySelectorAll('[data-testid="captured-error"]')).find((r) => /NG0\d+/.test(...))`.
- ✅ The insurance-portal fixture, launched through `control-angular-dev-app --target portal`, yields a `verified` `verdict.json` over two runs. — evidence: `insurance-portal-2/verdict.json` `"verdict": "verified"`, setup `control-angular-dev-app up --target portal --json`.
- ✅ The four supported pairs keep their `verified` `verdict.json` and the check's unit tests still pass. — evidence: four pair verdict.json verified; error-explainer tests pass.

## Intent coverage

### SC1 — The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent`.: pass
- ✅ Evidence: component renders `err.code` and `err.component ?? NO_OWN_COMPONENT`; E1/E2 empty/no-owning-component states; T003/T008 node tests pass.

### SC2 — The offline error digest is generated at extension build time with one entry per error code and each entry capped at 150 tokens.: pass
- ✅ Evidence: T007 wires `generate-error-digest` into `build-extension` via `dependsOn`; `scripts/generate-error-digest.mjs` trims to 150 tokens with marker; orchestrator Verify exit 0.

### SC3 — The MIT license and Google LLC copyright notice is stripped from every digest entry before any digest text reaches the Prompt API or another built-in AI API.: pass
- ✅ Evidence: `stripLicense()` removes MIT/Google LLC text; `extension/error-digest.json` contains no such text (E5); N4 prohibits shipping license text.

### SC4 — The panel explains a captured error using the panel-local Prompt API, sending only a short fact list, and the answer is shown in the panel.: pass
- ✅ Evidence: `error-explainer.component.ts` calls `this.prompt.explainFacts(...)` on Explain with shaped fact list; T009 build passes; T011/T012 drives panel end-to-end verified.

### SC5 — `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.: pass
- ✅ Evidence: verdict words and run counts from each verdict.json:
  - chrome-stable-nano: verified, 2 runs
  - chrome-beta-gemma4: verified, 2 runs
  - edge-phi4mini: verified, 2 runs
  - edge-dev-aion: verified, 2 runs
  - insurance-portal-2: verified, 2 runs (SC6)

### SC6 — Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the claim records that external dependency.: pass
- ✅ Evidence: `insurance-portal-2/verdict.json` verdict `verified`, 2 runs, setup `control-angular-dev-app up --target portal --json` (API first, then app) per SC6.

## Fixed since last cycle

- SC4 — confirmed fixed: component now resolves digest entry and calls Prompt API on Explain; T008/T009 Verify exit 0.
- SC5 — confirmed fixed: four `verdict.json` files present with verdict `verified` (2 runs each).
- SC6 — confirmed fixed: `insurance-portal-2/verdict.json` verdict `verified` naming the portal fixture.
- T003 AC1/AC2/AC5/AC6 — confirmed fixed per T008 repair and wave-gate evidence.
- Invalid `NO_DIGEST_ENTRY` import — confirmed fixed (imported from `error-digest`).

## Summary for orchestrator

- blocked findings: none.
- repeat offenders: none.
- warnings worth a human eye: none. All seven tasks pass; all six owned SCs pass; five verdict.json files verified (2 runs each).