# Review — wave 5, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 8

## T009 — Correct the S16 "works" verdict where Meta is absent: pass

- ✅ Neither `research/raw/s16-meta-lookup.json` nor `research/05-spikes.md` records "works" for the S16 case where `Meta` is absent. — diff: verdict changed to `works-with-degradation` with reason in both files (6cd1f28).
- ✅ The two files agree on the corrected verdict and note. — `research/raw/s16-meta-lookup.json` and `research/05-spikes.md` both state `works-with-degradation` and the same reason.
- ✅ No code or public behavior change is introduced. — documentation-only diff.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T010 — Classify Windows junctions as links in sidecar-deps-bridge: pass

- ✅ No `.isSymbolicLink()` gate remains in `scripts/sidecar-deps-bridge.mjs`; all gates use `isSymlinkLike(st)`. — diff: all four gates (`sameTarget`, `doBridge`, `doUnlink`, `isBridgeCorrect`) route through `isSymlinkLike` (f8ee069).
- ✅ The bridge's tests pass and the module still creates/removes the junction correctly. — recorded Verify: 6/6 pass, 0 skipped.
- ✅ No public behavior change beyond correct classification. — only link classification changed.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T011 — Forward angular-ai:state from relay.js to the panel: pass

- ✅ `extension/relay.js` forwards `angular-ai:state` events, carrying `e.detail`, to the panel-facing message channel. — diff adds listener forwarding `e.detail` (93bd1f7).
- ✅ The forwarded payload uses the `supported`/`reason` shape. — `chrome.runtime.sendMessage({ type: 'angular-ai:state', ...d })` spreads detail.
- ✅ No new host permission or page/content-script Prompt API is introduced (N3). — diff only adds a window listener.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T012 — Align state message contract between producer and consumer: pass

- ✅ `extension-message.service.ts` treats `msg.supported === false` and reads `msg.reason`; no reference to `msg.notSupported` remains. — diff (fb1b224).
- ✅ The panel marks the page unsupported with the reason when `supported === false`. — `this.notSupported.set(true)` + `this.notSupportedReason.set(msg.reason ?? 'not supported')`; new spec case added.
- ✅ Type check and the service's tests pass. — recorded Verify: `npm run check` + `npx nx test angular-ai-devtools` pass.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T013 — Replace vacuous E2E chain assertion with real chain assertions: pass

- ✅ `spikes/ng222-app/e2e/chain.spec.ts` no longer contains `expect(true).toBe(true)`. — diff removes placeholder (a41ec77).
- ✅ The spec asserts the real `click -> count -> double -> app-counter template` chain. — renders `Counter`, clicks Increment, asserts `Clicks: 4 (double 8, cart 1)`.
- ✅ The spec runs and passes under the project's E2E command. — recorded Verify passed.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T014 — Add missing src/panel extension-prompt.service re-export: pass

- ✅ `src/panel/extension-prompt.service.ts` exists and re-exports `ExtensionPromptService` (and `ChainResultLike` if applicable). — new file `export * from '../../apps/angular-ai-devtools/src/app/extension-prompt.service.ts'` (116a4cd).
- ✅ Imports resolving to `src/panel/extension-prompt.service` type-check and run. — `npm run check` passed in recorded Verify.
- ✅ No public behavior change. — re-export only.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T015 — Build provenance adjacency from consumer/producer edges: pass

- ✅ `provenance-tracer.ts` builds adjacency from `consumer`/`producer` edges. — diff adds `resolveEndpoint` and traverses canonical shape (26a34d6).
- ✅ No reliance on `from`/`to` for the canonical serialized shape. — `from`/`to` retained only as legacy fallback; canonical path uses `consumer`/`producer` both directions.
- ✅ Type check and tracer tests pass. — recorded Verify: 2/2 pass.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none

## T016 — Fix agent-main provider-record field reads: pass

- ✅ `isViewProvider` is read from `pr.isViewProvider`, not `pr.viewProviders`. — diff (b58d1b8).
- ✅ Token name uses `pr.token?.name ?? pr.token?.toString?.() ?? String(pr.token)`. — diff uses `pr.token.name ?? pr.token.toString() ?? String(pr.token)`.
- ✅ Provider kind is derived from `pr.provider`, not `providerType`. — diff inspects `pr.provider` for useFactory/useValue/useClass/useExisting or function.
- ✅ Element-injector identity uses `tagName`. — diff reads `meta.source.tagName` for element injectors.
- ✅ Advisory F5 and F9 are addressed in the same file. — importPath array stringification and viewProviders handling updated.
- ✅ Type check and agent-main tests pass. — recorded Verify: 21/21 pass.

Warnings (non-blocking):
- none

Contract violations (blocking):
- none (landing commit SHA in brief differs by one character from the resolved commit `b58d1b837b1466da44aeb9aa4dc552751a761231`; reviewed that commit.)

## Intent coverage

### SC1 — Every defect found by the hardening review is fixed or explicitly accepted with a written reason.: pass

- ✅ All eight tasks land fixes for the 12 round-2 blocking findings (S16 verdict, sidecar junction gates, state forwarding, state contract, vacuous chain spec, extension-prompt re-export, provenance edge shape, agent-main provider reads); each commit touches only its declared files.

### SC6 — No new feature and no public behavior change is introduced.: pass

- ✅ Changes are defect fixes/re-exports/docs; the only intended behavior change is the not-supported branch in T011+T012 (`msg.supported === false` + `msg.reason`), which changes exactly that branch and nothing else. No new host permission or Prompt API (N3).

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: T016 landing SHA in brief was one character off from the resolved commit; reviewed the resolved commit.
