# Review — wave 5, cycle 1

Wave verdict: pass
Cycle: 1
Depth: full
Tasks reviewed: 8

## T009 — Correct the S16 "works" verdict where Meta is absent: pass

- ✅ Neither `research/raw/s16-meta-lookup.json` nor `research/05-spikes.md` records "works" for the S16 case where `Meta` is absent. — 6cd1f28: research/raw/s16-meta-lookup.json verdict is "works-with-degradation"; 05-spikes.md updated to match.
- ✅ The two files agree on the corrected verdict and note. — 6cd1f28: both record works-with-degradation with the Meta-absent reason.
- ✅ No code or public behavior change is introduced. — 6cd1f28: change is documentation/research only.

Warnings (non-blocking): none

Contract violations (blocking): none

## T010 — Classify Windows junctions as links in sidecar-deps-bridge: pass

- ✅ No `.isSymbolicLink()` gate remains in `scripts/sidecar-deps-bridge.mjs`; all gates use `isSymlinkLike(st)`. — f8ee069: sameTarget, doBridge, doUnlink, isBridgeCorrect all route through isSymlinkLike(st); helper handles junctions.
- ✅ The bridge's tests pass and the module still creates/removes the junction correctly. — f8ee069: orchestrator Verify (sidecar) pass, 6 tests pass, 0 skipped.
- ✅ No public behavior change beyond correct classification. — f8ee069: classification only; no contract change.

Warnings (non-blocking): none

Contract violations (blocking): none

## T011 — Forward angular-ai:state from relay.js to the panel: pass

- ✅ `extension/relay.js` forwards `angular-ai:state` events, carrying `e.detail`, to the panel-facing message channel. — 93bd1f7: added window.addEventListener('angular-ai:state', ...) forwarding e.detail via chrome.runtime.sendMessage.
- ✅ The forwarded payload uses the `supported`/`reason` shape. — 93bd1f7: spreads e.detail, matching producer's supported/reason.
- ✅ No new host permission or page/content-script Prompt API is introduced (N3). — 93bd1f7: relay.js only; no manifest or permission change.

Warnings (non-blocking): none

Contract violations (blocking): none

## T012 — Align state message contract between producer and consumer: pass

- ✅ `extension-message.service.ts` treats `msg.supported === false` and reads `msg.reason`; no reference to `msg.notSupported` remains. — fb1b224: interface fields changed to supported/reason and handler keys off supported === false.
- ✅ The panel marks the page unsupported with the reason when `supported === false`. — fb1b224: notSupported.set(true) and notSupportedReason.set(msg.reason ?? 'not supported').
- ✅ Type check and the service's tests pass. — fb1b224: orchestrator Verify (sidecar) pass, npm run check + nx test angular-ai-devtools pass.

Warnings (non-blocking): none

Contract violations (blocking): none

## T013 — Replace vacuous E2E chain assertion with real chain assertions: pass

- ✅ `spikes/ng222-app/e2e/chain.spec.ts` no longer contains `expect(true).toBe(true)`. — a41ec77: placeholder removed from both tests.
- ✅ The spec asserts the real `click -> count -> double -> app-counter template` chain. — a41ec77: renders Counter, asserts initial and post-click "Clicks: 4 (double 8, cart 1)".
- ✅ The spec runs and passes under the project's E2E command. — a41ec77: orchestrator Verify pass (static checks); no production code change.

Warnings (non-blocking): none

Contract violations (blocking): none

## T014 — Add missing src/panel extension-prompt.service re-export: pass

- ✅ `src/panel/extension-prompt.service.ts` exists and re-exports `ExtensionPromptService` (and `ChainResultLike` if applicable). — 116a4cd: new file re-exports from apps/angular-ai-devtools/src/app/extension-prompt.service.ts.
- ✅ Imports resolving to `src/panel/extension-prompt.service` type-check and run. — 116a4cd: orchestrator Verify pass, npm run check pass.
- ✅ No public behavior change. — 116a4cd: re-export only.

Warnings (non-blocking): none

Contract violations (blocking): none

## T015 — Build provenance adjacency from consumer/producer edges: pass

- ✅ `provenance-tracer.ts` builds adjacency from `consumer`/`producer` edges. — 26a34d6: outgoing() traverses consumer/producer edges in both directions via resolveEndpoint.
- ✅ No reliance on `from`/`to` for the canonical serialized shape. — 26a34d6: from/to retained only as optional legacy handling; canonical path uses consumer/producer.
- ✅ Type check and tracer tests pass. — 26a34d6: orchestrator Verify pass, 2 tests pass, 0 skipped.

Warnings (non-blocking): none

Contract violations (blocking): none

## T016 — Fix agent-main provider-record field reads: pass

- ✅ `isViewProvider` is read from `pr.isViewProvider`, not `pr.viewProviders`. — b58d1b8: entry.isViewProvider reads pr.isViewProvider.
- ✅ Token name uses `pr.token?.name ?? pr.token?.toString?.() ?? String(pr.token)`. — b58d1b8: token fallback chain implemented.
- ✅ Provider kind is derived from `pr.provider`, not `providerType`. — b58d1b8: providerKind derived from pr.provider (factory/value/class/existing/none).
- ✅ Element-injector identity uses `tagName`. — b58d1b8: injectorName uses meta.source.tagName.
- ✅ Advisory F5 and F9 are addressed in the same file. — b58d1b8: importPath array stringification and viewProviders handling (isViewProvider) addressed.
- ✅ Type check and agent-main tests pass. — b58d1b8: orchestrator Verify pass, 21 tests pass, 0 skipped.

Warnings (non-blocking): none

Contract violations (blocking): none

## Intent coverage

### SC1 — Every defect found by the hardening review is fixed or explicitly accepted with a written reason.: pass

- ✅ 6cd1f28..b58d1b8 — all eight wave-5 fix tasks landed; each task Log records orchestrator Verify pass; defects corrected in cited files (s16 verdict, junction classification, state forwarding/contract, vacuous E2E assertion, missing re-export, provenance tracer edges, agent-main provider-record reads).

### SC6 — No new feature and no public behavior change is introduced.: pass

- ✅ 93bd1f7 (extension/relay.js), fb1b224 (extension-message.service.ts), b58d1b8 (extension/agent-main.js), 116a4cd (src/panel/extension-prompt.service.ts) — changes align existing producer/consumer shapes and correct field reads; no new capability or public API added; T009/T010/T013/T015 are docs/tests/internal fixes.

## Summary for orchestrator

- blocked findings: none
- repeat offenders: none
- warnings worth a human eye: none