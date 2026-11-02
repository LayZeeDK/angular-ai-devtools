---
id: T004
title: Build the panel context from the announced state and render the feature fingerprint
wave: 2
deps: [T002]
status: done
agent: build_T004
base: 9e749bd3fd79d34b2b7699c80811c85659c57d11
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
- build_T004: added panel-context.ts (PanelSignals/PanelContext/buildPanelContext: silent page yields facts {} with no supported key so app_facts keeps host-unavailable; received state carries the page's supported/reason/bracket zoneMode and features only when non-null; version trimmed or null) and feature-fingerprint.ts (no-angular-root / cannot-tell / fingerprint over the caller-supplied eight names, entries in given order with present = facts.features[name] === true, text joined by a middle dot, a map with no boolean is cannot-tell, supported:false renders the page's reason verbatim with zoneMode null), both with type-only imports only, plus panel-context.spec.ts (9), feature-fingerprint.spec.ts (11) and tests/held-out/feature-fingerprint-chip.test.mjs (7: E1 two present/six absent by name, E2 order + byte-identical text, E3 eight absent names). Verify passed exit 0: npm ci --include=dev, npm run check clean, held-out suite 7/7 pass, nx feature-fingerprint.spec.ts 11/11 pass.
- ready
- 2026-11-02 — orchestrator Verify (sidecar gsd-path-verify/task-t004-verify): pass, exit 0; output tail:
  ```
    Critical path:     <1ms (1 task)
    Recoverable time:  <1ms
  npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
  npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
  npm warn deprecated glob@10.5.0: Old versions of glob are not supported, and contain widely publicized security vulnerabilities, which have been fixed in the current version. Please update. Support for old versions may be purchased (at exorbitant rates) by contacting i@izs.me
  npm warn install-scripts 4 packages had install scripts blocked because they are not covered by allowScripts:
  npm warn install-scripts   @parcel/watcher@2.6.0 (install: node scripts/build-from-source.js)
  npm warn install-scripts   esbuild@0.28.2 (postinstall: node install.js)
  npm warn install-scripts   lmdb@3.5.6 (install: node-gyp-build-optional-packages)
  npm warn install-scripts   msgpackr-extract@3.0.4 (install: node-gyp-build-optional-packages)
  npm warn install-scripts
  npm warn install-scripts Run `npm install-scripts ls` to review, or `npm install-scripts approve <pkg>` to allow.
  npm notice run check
  npm notice run node scripts/ensure-sidecar-deps.mjs && tsc -p tsconfig.json && npm run check:skills && npm run check:panel
  npm notice run check:skills
  npm notice run tsc -p .claude/skills/tsconfig.json && tsc -p .claude/skills/tsconfig.run-code.json && tsc -p .commandcode/skills/tsconfig.json && tsc -p .commandcode/skills/tsconfig.run-code.json
  npm notice run check:panel
  npm notice run tsc -p apps/angular-ai-devtools/tsconfig.check.json
  npm notice run npx
  npm notice run nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/feature-fingerprint.spec.ts
  ```
