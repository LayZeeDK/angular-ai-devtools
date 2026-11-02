---
id: T004
title: Build the panel context from the announced state and render the feature fingerprint
wave: 2
deps: [T002]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/panel-context.ts
  - apps/angular-ai-devtools/src/app/panel-context.spec.ts
  - apps/angular-ai-devtools/src/app/feature-fingerprint.ts
  - apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts
  - tests/held-out/feature-fingerprint-chip.test.mjs
---

# T004 — Build the panel context from the announced state and render the feature fingerprint

## Context

`app_facts` can only answer from `ToolContext.facts`, and nothing in production builds one, so on every real call `readAppFacts` returns `{kind:'error', code:'host-unavailable'}` (`tool-registry/app-facts.ts:267-276`, `tool-registry.ts:275`). The signals the record needs are already on the panel side of the wire (`extension-message.service.ts:37-39,68-72`) and T002 adds the version; the missing piece is the adapter plus the display decision. Two existing behaviours decide the shape. First, `appFactsSnapshot` returns `null` — not "unsupported" — for facts without a boolean `supported`, so an adapter that omits the key while the page is silent keeps `host-unavailable` honest instead of turning silence into a claim. Second, `zoneMode` reads `noop` on the rejected-Zone path (`extension/agent-main.js:35,163-167`), so a chip that prints it beside `supported: false` would describe a Zone.js app as zoneless — the exact over-claim prohibition N1 and N2 exist for. The eight bits themselves are all `typeof window.ng.X === 'function'` reads of one dev-mode global, so they flip together on every fixture: the chip's eight-entry rendering is a display decision, and the partial map E1 rules on can only be injected.

## Approach

- **One adapter, one display model, no Angular imports.** `panel-context.ts` turns the six signals into `{facts, version, stateReceived}`; `feature-fingerprint.ts` turns that context plus the eight names into the chip model. Neither module may import a runtime value: the held-out suite loads them with `--experimental-strip-types`, and a plain-node import of `app-facts.ts` fails today because it reaches `./tool-registry` without an extension (`Cannot find module … tool-registry`). Type-only imports are erased and are fine.
- **The eight names are passed in, not imported.** The chip's order is the declaration order of `APP_FACT_FEATURES` (`tool-registry/app-facts.ts:45`), which is also the order `featuresOf` writes (`extension/agent-main.js:62-71`); the caller passes that array, so there is one vocabulary in the repository and the model still has no runtime import.
- **"Cannot tell" is decided by what the page did, not by bit-level nulls.** E1 rules that a payload carrying exactly two of the eight bits renders those two present and the other six absent by name, and E3 rules that an all-false payload renders eight absent names; so a received state whose feature map holds at least one boolean is a fingerprint, and an unpublished bit renders absent (the same reading `app_facts` already applies, `features[name] === true`). `cannot-tell` is reserved for the page never having announced state, or having announced a map with no boolean entry at all (`null`, `{}` — `readFeatureBits` returns the dangerous `{}`, `extension-message.service.ts:98-110`). Never invent a feature name and never drop an absent one.
- **Three page classes, three states** (settled in SYNTHESIS). `no-angular-root`: neither a version nor a state — the refusal must name the evidence, "No Angular root found on this page", because a root created through `ViewContainerRef.createComponent` also carries no `ng-version`. `cannot-tell`: a version arrived and no state did — a production build, `ngDevMode` off, or a page that never announced — and the text names the version and says the debug surface is absent. `fingerprint`: state received. The classifier reads `stateReceived`, never `notSupported()`, whose default is "not negative" (`extension-message.service.ts:33-39`) and therefore cannot tell silence from zero.
- **Never claim what the page denied.** When the payload carried `supported: false`, render the page's own `reason` verbatim and suppress `zoneMode`; when it was supported, `zoneMode` may be shown. The chip blocks only the eight published bits: DI-graph, stale-view and error-digest capabilities have no published bit, so naming them would be a claim `app_facts` cannot support.
- **Text stability (E2).** `text` is the eight entries joined deterministically, so the same payload twice yields byte-identical text; no `Date`, no map iteration order, no locale formatting.

## Interface contract

- `ExtensionMessageService` exposes `features: Signal<Readonly<Record<string, boolean>> | null>`, `zoneMode: Signal<string | null>`, `stateReceived: Signal<boolean>`, and `appVersion: Signal<string | null>` (new); the replay round trip is `{ type: 'angular-ai:state-request', tabId }` panel to background, `chrome.tabs.sendMessage(tabId, { type: 'angular-ai:replay-request' })` background to relay, and the relay's reply `{ state: <latched angular-ai:state detail> | null, version: string | null }`, which the background re-emits to the panel as `{ type: 'angular-ai:state', ...state, tabId }` when a state was latched and `{ type: 'angular-detected', version, tabId }` when a version was latched.
- `panel-context.ts` exports `PanelSignals` (the four signals above plus `notSupported: boolean` and `notSupportedReason: string | null`), `PanelContext = { readonly facts: Readonly<Record<string, unknown>>; readonly version: string | null; readonly stateReceived: boolean }`, and `buildPanelContext(signals: PanelSignals): PanelContext`; with `stateReceived === false` it returns `facts = {}` with no `supported` key, and with `stateReceived === true` it returns `{ supported: !notSupported, reason: notSupportedReason, zoneMode: zoneMode === 'zone' || zoneMode === 'noop' ? zoneMode : 'unknown', features }` where `features` appears only when the signal is not null, and `version` is the trimmed `appVersion` or null.
- `feature-fingerprint.ts` exports `FeatureFingerprintEntry = { readonly name: string; readonly present: boolean }` and `FeatureFingerprint` = `{ kind: 'no-angular-root'; message: string }` | `{ kind: 'cannot-tell'; message: string; version: string | null }` | `{ kind: 'fingerprint'; entries: readonly FeatureFingerprintEntry[]; text: string; supported: boolean; reason: string | null; zoneMode: 'zone' | 'noop' | null }`, plus `featureFingerprint(context: PanelContext, featureNames: readonly string[]): FeatureFingerprint`, where entries follow the given order, `present` is `facts.features[name] === true`, `text` joins `<name>: present` / `<name>: absent` with a middle dot, and `no-angular-root` means no version and no state.

## Intent coverage

- SC1
- SC3

## Acceptance criteria

1. `buildPanelContext` returns `facts` with no `supported` key and `stateReceived: false` for a silent page, so `app_facts` still answers `host-unavailable`; for a received state it carries the page's own `supported`, `reason`, `zoneMode` (or `'unknown'`) and `features`, and `version` is the trimmed `appVersion` or `null`.
2. E1 — a context whose feature map carries exactly two of the eight bits renders those two `present: true` and the other six `present: false` by name, and deleting an absent entry from the model fails `tests/held-out/feature-fingerprint-chip.test.mjs`.
3. E2 — the entries follow the order of the names passed in (the declaration order of `APP_FACT_FEATURES`), and two calls over equal contexts return byte-identical `text`.
4. E3 — an all-false map renders eight absent names: not an empty chip, and not an invented one.
5. SC3 — neither a version nor a state yields `kind: 'no-angular-root'` with the message "No Angular root found on this page"; a version with no state yields `kind: 'cannot-tell'` naming that version and stating the debug surface is absent; a `supported: false` payload renders the page's `reason` verbatim and reports `zoneMode: null`.
6. A received state whose feature map is `null` or holds no boolean entry yields `kind: 'cannot-tell'`, never eight absences.
7. Both modules carry no runtime import — type-only imports at most — so `node --experimental-strip-types --test tests/held-out/feature-fingerprint-chip.test.mjs` imports them and passes.

## Verify

```bash
npm ci --include=dev && npm run check && node --test tests/held-out/feature-fingerprint-chip.test.mjs && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
