# Review — wave 2, cycle 1

Wave verdict: blocked
Cycle: 1
Depth: full
Tasks reviewed: 2

## T003 — Panel error-explainer UI and Prompt API explanation: fail

- ❌ The panel renders a captured `NG0xxx` error with its owning component and, on "Explain", shows the model answer (SC1, SC4). — found: `apps/.../error-explainer.component.ts` `explain()` hard-codes `const digest = NO_DIGEST_ENTRY` and returns before ever calling `this.prompt.explainFacts(...)`; the model answer path is unreachable, so "Explain" only ever sets `NO_DIGEST_ENTRY`. Evidence: `apps/angular-ai-devtools/src/app/error-explainer.component.ts` lines 32-44.
  fix: load/resolve the digest entry for the captured error code and call `buildErrorExplainFacts(err, digest)` + `this.prompt.explainFacts(facts)` when an entry exists; keep the explicit no-digest branch only when `shouldCallModel(...)` is false.
- ❌ The panel shows the matching digest entry — one entry per code, body at most 150 tokens — and never shows MIT license text or the Google LLC copyright notice (SC2, SC3). — found: the component template renders only `err.code` and `err.component`; no digest entry is rendered anywhere in `error-explainer.component.ts`. Evidence: `apps/angular-ai-devtools/src/app/error-explainer.component.ts` template block.
  fix: render the resolved digest entry body (or `NO_DIGEST_ENTRY`) alongside the captured error, reusing `resolveDigest`/`buildPanelFactList` from `src/panel/error-explainer-view.ts`.
- ✅ The prompt carries only the error code, owning component name and digest entry; capture alone never prompts (N1, N2). — evidence: `src/panel/error-explainer-view.ts` `buildErrorExplainFacts` emits only `Error code`, `Owning component`, `Digest`; `extension-message.service.ts` and `relay.js`/`background.js` carry capture messages without invoking the model.
- ✅ An error code with no digest entry yields an explicit "no digest entry" answer and the model is not called (E6). — evidence: `error-explainer.component.ts` sets `this.answer.set(NO_DIGEST_ENTRY)` and returns; `shouldCallModel` in `src/panel/error-explainer-view.ts` returns false for missing entries.
- ❌ `lars-verify` records a verdict of `verified` for the error-explainer claim across Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct, with each `verdict.json` retained as evidence (SC5, N7). — found: no `verdict.json` exists for an `error-explainer` claim under `.commandcode/worktrees/tmp` or `tmp`; only di-doctor/extension-panel/signal-provenance verdicts are present. Evidence: repository search for `verdict*error-explainer*verdict.json` returned none.
  fix: run `lars-verify check error-explainer` on all four instances and retain each `verdict.json` as evidence; do not cite check output as a verdict.
- ❌ Where meaningful, the error explanation is also verified on the insurance-portal fixture and the claim records that external dependency (SC6, N8). — found: no record naming the insurance-portal fixture/check for the error-explainer claim. Evidence: none found in repository.
  fix: run/record the insurance-portal error-explainer check where meaningful and cite the fixture and check in the claim record.

Contract violations (blocking):
- ❌ `error-explainer.component.ts` imports `NO_DIGEST_ENTRY` from `src/main-world/error-capture`, which does not export it (`NO_DIGEST_ENTRY` lives in `src/main-world/error-digest`); the import is invalid even though the app tsconfig does not compile it. — evidence: `apps/angular-ai-devtools/src/app/error-explainer.component.ts` line 5 vs `src/main-world/error-capture.ts` exports.
  fix: import `NO_DIGEST_ENTRY` from `../../../../src/main-world/error-digest`.

Warnings (non-blocking):
- `scripts/error-explainer-panel.test.mjs` is a vacuous placeholder (`assert.ok(true)`), but it is explicitly documented as a browser-only separate test and is not part of the node:test slice.

## T007 — Wire the error digest generator into the extension build: pass

- ✅ `npx nx run angular-ai-devtools:build-extension` regenerates the offline digest through the generator script T001 landed, before it compiles the application, so the shipped digest is reproducible at build time (SC2). — evidence: `apps/angular-ai-devtools/project.json` `build-extension.dependsOn` contains `generate-error-digest`; `generate-error-digest` uses `nx:run-commands` with `node scripts/generate-error-digest.mjs` and `cwd: {workspaceRoot}`.
- ✅ The wiring is proven by a `node:test` that fails if the dependency or the generator command is removed. — evidence: `scripts/error-digest-wiring.test.mjs` tests 1-2; recorded Verify exit 0, 3 tests.
- ✅ The `build` target and every other existing target are unchanged. — evidence: diff `f33030a` touches only `build-extension` plus the new `generate-error-digest` target; `scripts/error-digest-wiring.test.mjs` asserts `build.executor === '@angular/build:application'`.

## Intent coverage

### SC1 — The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent`.: pass
- ✅ Evidence: `extension/agent-main.js` `captureErrorPayload` dispatches `angular-ai:error-capture` with `code`/`component`; `extension/relay.js` and `extension/background.js` forward it; `extension-message.service.ts` stores it in `capturedErrors`; `error-explainer.component.ts` renders `err.code` and `err.component ?? NO_OWN_COMPONENT`; no-owning-component renders `NO_OWN_COMPONENT` (E1), empty state renders `EMPTY_STATE` (E2).

### SC2 — The offline error digest is generated at extension build time with one entry per error code and each entry capped at 150 tokens.: pass
- ✅ Evidence: `scripts/generate-error-digest.mjs` produces one entry per snapshot code with `trimToTokens(..., 150)` and `TRIM_MARKER`; `apps/angular-ai-devtools/project.json` wires `generate-error-digest` into `build-extension` via `dependsOn` (T007); `extension/error-digest.json` contains no `MIT License`/`Google LLC` text.

### SC3 — The MIT license and Google LLC copyright notice is stripped from every digest entry before any digest text reaches the Prompt API or another built-in AI API.: pass
- ✅ Evidence: `stripLicense()` in `scripts/generate-error-digest.mjs` filters/removes `MIT License`, `Google LLC`, `licensed under`; `extension/error-digest.json` grep for those strings returned no matches (E5).

### SC4 — The panel explains a captured error using the panel-local Prompt API, sending only a short fact list, and the answer is shown in the panel.: fail
- ❌ Found: `error-explainer.component.ts` never reaches `this.prompt.explainFacts(...)` because `digest` is hard-coded to `NO_DIGEST_ENTRY`, so no model call and no answer is ever shown; the fact list is correctly shaped in `src/panel/error-explainer-view.ts` but unused in the live component.
  fix: resolve the digest entry for the captured code and invoke the Prompt API on "Explain", rendering `res.text` in `ai-answer`.

### SC5 — `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.: fail
- ❌ Found: no `verdict.json` for the error-explainer claim exists for any of the four instances (N7). Evidence: repository search returned no `error-explainer` verdict files.
  fix: run the wave-2 gate `lars-verify` checks and retain each `verdict.json`.

### SC6 — Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the claim records that external dependency.: fail
- ❌ Found: no record names the insurance-portal fixture or a check run there for the error-explainer claim (N8). Evidence: none found.
  fix: run/record the insurance-portal error-explainer check where meaningful and cite the fixture.

## Summary for orchestrator

- blocked findings: T003 AC1, AC2, AC5, AC6; SC4, SC5, SC6 (plus invalid `NO_DIGEST_ENTRY` import in `error-explainer.component.ts`). T007 passes.
- repeat offenders: SC5/SC6 are gate-level claims with no retained `verdict.json`.
- warnings worth a human eye: `scripts/error-explainer-panel.test.mjs` is a vacuous placeholder, documented as browser-only and outside the node:test slice.