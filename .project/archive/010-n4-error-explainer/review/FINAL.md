# Final Review — angular-ai-devtools (M010 · n4-error-explainer)

Reviewed HEAD: b0a40e7eeb2d0007684e2a83b28dac6e05b0cb3b
Overall verdict: pass

## Success criteria

### SC1 — The panel captures an `NG0xxx` error on `spikes/ng222-app` and shows the error code alongside its owning component, resolved through `ng.getOwningComponent`.

- **Verdict**: met
- **Surface**: DevTools panel
- **Check**: `read extension/agent-main.js capture hooks` and `read extension/relay.js`, `extension/background.js`, `apps/angular-ai-devtools/src/app/extension-message.service.ts` (final-gap-2); live panel runs recorded in five verdict.json files
- **Observed**: `captureErrorPayload` extracts `NG0\d{3,}` into `code`, resolves `component` via `ng.getOwningComponent`, stamps `timestamp`; hooks wrap `console.error`, `window` `error`, and `unhandledrejection`; relay forwards preserving code/message/component/timestamp; background re-broadcasts; panel appends to bounded `capturedErrors` (capacity 50, oldest dropped). Panel renders `err.code` and `err.component ?? NO_OWN_COMPONENT`; empty state renders `EMPTY_STATE` ("No captured errors"); no-owning-component renders "no owning component" (E1, E2). Five recorded live runs (chrome-stable-nano, chrome-beta-gemma4, edge-phi4mini, edge-dev-aion, insurance-portal-2) each report `verdict: "verified"` over 2 runs with condition exit 0, and the check reads the NG0-matching row's `error-code`, `owning-component`, and `digest-entry`. E3 is held out by `scripts/error-capture.test.mjs`, which passes in the project Verify ledger. N5 holds: the capture path calls no `angular:di_graph` and uses no `getViewContainerRef`, as read in final-gap-2.
- **Reference**: `extension/agent-main.js:519-566`; `extension/relay.js:15-18`; `extension/background.js:8-14`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:65-76`; `src/main-world/error-capture.ts:16`; `.commandcode/skills/control-ai-browsers/scripts/panel.mjs:252-281`; `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\{chrome-stable-nano,chrome-beta-gemma4,edge-phi4mini,edge-dev-aion,insurance-portal-2}\verdict.json`
- **Finding**: none
- **Fix direction**: none
- **Held-out**: E3 — `scripts/error-capture.test.mjs` (ring buffer keeps the most recent entries in order, dropping oldest first) passes in the project Verify recorded at `.project/build/verify-ledger.jsonl`.
- **Prohibition**: N5 — the owning component is resolved through `ng.getOwningComponent` on the fallback element in `extension/agent-main.js`; no `angular:di_graph` call and no `getViewContainerRef` use appears in the capture path (read in final-gap-2 evidence).

### SC2 — The offline error digest is generated at extension build time with one entry per error code and each entry capped at 150 tokens.

- **Verdict**: met
- **Surface**: DevTools panel
- **Check**: `node scripts/generate-error-digest.mjs <scratchpad>/fresh-digest.json` byte-compare to `extension/error-digest.json`; `node -e` count unique codes and max body tokens; `node --experimental-strip-types --test extension/error-digest.test.mjs scripts/error-digest-wiring.test.mjs`
- **Observed**: `build-extension.dependsOn` contains `"generate-error-digest"`; generator executor `nx:run-commands` command `node scripts/generate-error-digest.mjs`; 64 entries, 64 unique codes, max body 150 tokens; committed digest byte-identical to fresh generation; 8 tests pass, 0 fail. Panel renders `resolveDigest(errorDigest, code)` from the committed `extension/error-digest.json` imported at build time. N6 holds: no documented code is silently dropped, measured as 64 entries for 64 unique codes with none omitted (final-gap-3).
- **Reference**: `apps/angular-ai-devtools/project.json:52-99`; `scripts/generate-error-digest.mjs`; `extension/error-digest.json`; `extension/error-digest.test.mjs`; `scripts/error-digest-wiring.test.mjs`; `.project/review/final-gap-3.md`
- **Finding**: none
- **Fix direction**: none

### SC3 — The MIT license and Google LLC copyright notice is stripped from every digest entry before any digest text reaches the Prompt API or another built-in AI API.

- **Verdict**: met
- **Surface**: DevTools panel
- **Check**: grep for `MIT License`/`Google LLC`/`licensed under` in `extension/error-digest.json`; inspect `src/panel/error-explainer-view.ts` and `apps/angular-ai-devtools/src/app/error-explainer.component.ts` digest rendering
- **Observed**: No "MIT License"/"Google LLC"/"licensed under" text anywhere in the digest; `stripLicense()` filters those lines at generation; panel sends only the already-clean digest body via `buildErrorExplainFacts`; no license/copyright text reaches render or send. E5 (no MIT/Google text reaches digest file, Prompt API, or any built-in AI API) and N4 satisfied.
- **Reference**: `scripts/generate-error-digest.mjs`; `extension/error-digest.json`; `src/main-world/error-digest.ts`; `src/panel/error-explainer-view.ts`; `apps/angular-ai-devtools/src/app/error-explainer.component.ts`; `.project/review/final-gap-3.md`
- **Finding**: none
- **Fix direction**: none

### SC4 — The panel explains a captured error using the panel-local Prompt API, sending only a short fact list, and the answer is shown in the panel.

- **Verdict**: met
- **Surface**: DevTools panel
- **Check**: `node --experimental-strip-types --test scripts/error-explainer.test.mjs` (5 tests pass); live panel drive via `lars-verify check error-explainer` on five instances
- **Observed**: `error-explainer.component.ts` resolves the digest entry and calls `this.prompt.explainFacts(...)` on explicit "Explain" action; `buildErrorExplainFacts` emits only `Error code`, `Owning component`, `Digest`; capture alone never calls the model (N1, N2); no app code generated (N3). Answer rendered in panel. An error code with no digest entry yields explicit "no digest entry" answer and the model is not called (E6). T009 build passes; T011/T012 drive panel end-to-end verified.
- **Reference**: `apps/angular-ai-devtools/src/app/error-explainer.component.ts`; `src/panel/error-explainer-view.ts`; `src/main-world/error-digest.ts`; `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\{chrome-stable-nano,chrome-beta-gemma4,edge-phi4mini,edge-dev-aion,insurance-portal-2}\verdict.json`
- **Finding**: none
- **Fix direction**: none

### SC5 — `lars-verify` records a verdict of `verified` for the error-explainer claim, with end-to-end coverage on Gemini Nano, Gemma 4, Phi-4-mini and Aion-1.1-Instruct.

- **Verdict**: met
- **Check**: `lars-verify check error-explainer` retained verdict.json per instance (recorded, not re-run)
- **Observed**: All four required instances report `verdict: "verified"` over 2 runs with condition exit 0 and `outcome: "pass"`: chrome-stable-nano (Gemini Nano), chrome-beta-gemma4 (Gemma 4), edge-phi4mini (Phi-4-mini), edge-dev-aion (Aion-1.1-Instruct). N7 honored: each cites its verdict file.
- **Reference**: `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\chrome-stable-nano\verdict.json`; `.../chrome-beta-gemma4/verdict.json`; `.../edge-phi4mini/verdict.json`; `.../edge-dev-aion/verdict.json`
- **Finding**: none
- **Fix direction**: none

### SC6 — Where meaningful, the error explanation is also verified on the insurance-portal fixture, and the claim records that external dependency.

- **Verdict**: met
- **Check**: `lars-verify check error-explainer` on insurance-portal-2 with `control-angular-dev-app up --target portal --json` (recorded, not re-run)
- **Observed**: `insurance-portal-2/verdict.json` reports `verdict: "verified"` over 2 runs, setup `control-angular-dev-app up --target portal --json`, condition exit 0, `outcome: "pass"`. N8 honored: claim record names the fixture and the check that ran there.
- **Reference**: `D:\projects\sandbox\angular-ai-devtools\.commandcode\worktrees\tmp\control-ai-browsers\verify\error-explainer\insurance-portal-2\verdict.json`; `.project/review/final-gap-2.md`
- **Finding**: none
- **Fix direction**: none

### SC7 — The declared verification gate names and runs both test runners — `npm test` executes the app's `*.spec.ts` suite through the Nx unit-test target as well as the `node:test` suites — and the three Command Code documents that misstate the code (`AGENTS.md`'s Nx command path, `extension-panel.md`'s Angular version, `monitor-ci`'s `nx.json` claim) are corrected.

- **Verdict**: met
- **Check**: `npm run check && npm test && npx nx run angular-ai-devtools:build-extension` (exit 0 at b0a40e7); `node --experimental-strip-types --test scripts/npm-test-guard.test.mjs` (2 tests pass); `node --experimental-strip-types --test scripts/docs-correction.test.mjs` (3 tests pass)
- **Observed**: Project Verify passed at the reviewed commit (exit 0; final-gap-1 pass). `npm test` chain includes `test:app` invoking Nx unit-test target for `angular-ai-devtools` (N9 evidence names each runner and its own count). `AGENTS.md` now names `node_modules/nx/dist/bin/nx.js`; `extension-panel.md` states `~22.1.0`; `monitor-ci/SKILL.md` no longer claims `nx.json` contains `nxCloudId`/`nxCloudAccessToken`. The four `.claude/skills` drift rows remain untouched per owner ruling.
- **Reference**: `.project/build/verify-ledger.jsonl` (entry 8, commit b0a40e7eeb2d0007684e2a83b28dac6e05b0cb3b, exit_code 0); `.project/review/final-gap-1.md`; `.project/review/wave-3.cycle1.md`
- **Finding**: none
- **Fix direction**: none

---

Surface observation note: For SC1–SC4 the Surface is the DevTools "Angular AI" panel. The recorded live runs (five `verdict.json` files cited above, each `verified` over two runs) showed the panel rendering the captured NG0100 row with its owning component and digest entry and the model answering. This is recorded live evidence read at this HEAD, not a walkthrough performed in this session; no browser was driven from this sidecar.
