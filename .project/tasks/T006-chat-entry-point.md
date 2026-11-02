---
id: T006
title: Add the panel's lazy chat entry point with the context chip and the permitted group list
wave: 2
deps: [T003, T004, T005]
status: pending
agent: null
base: null
worktree: null
task_branch: null
files:
  - apps/angular-ai-devtools/src/app/chat-entry.component.ts
  - apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
  - apps/angular-ai-devtools/src/app/app.routes.ts
---

# T006 — Add the panel's lazy chat entry point with the context chip and the permitted group list

## Context

The tool registry has no production consumer: `tool-registry.ts:181` and `app.config.ts:14` are its only non-spec references, so the "chat" whose group list SC2 filters does not exist and this task creates it (INTENT § Corrections, 2026-11-02). It is the first caller, so its calling convention is the one the eleven explainers after it inherit: it must build `ToolContext` from the page's announced state *before* any `registry.execute` call, or `EMPTY_FACTS` makes the honest `host-unavailable` answer permanent (`tool-registry.ts:275`). The surface is one component holding no logic worth testing: it renders the two models wave 2 already delivered — the fingerprint from T004 and the projection from T005 — and the panel is the only place it renders (AR-1, AR-6, AR-7). Its bundle cost is why it is a lazy route: the initial total is pinned byte-exact at 535,440 B by `scripts/panel-bundle-budget.test.mjs`, T003 created the headroom this entry spends, and T007 measures the total with the route in place.

## Approach

- **Route entry, nothing else, in `app.routes.ts`.** Append the `chat` entry after T003's converted route; do not reorder or re-style the six explainer entries. `loadComponent` keeps the component and the three pure modules in a chunk `index.html` never references, so only the route literal lands in the eager `main.js`. The byte measurement is T007's: it builds, measures, and converts a further explainer route if the total is over the baseline — never raise the constant or the `build-extension` budget (N5).
- **One context, built once, used by everything.** Read the six signals once per render through `buildPanelContext`, then pass that one `PanelContext` to `featureFingerprint(context, APP_FACT_FEATURES)`, to `projectToolGroups(registry.tools(), context)` and to `registry.execute('app_facts', undefined, context)`. A second, subtly different context is how a chip and a group list come to disagree about the same page.
- **The component decides nothing.** No feature inference, no version guessing, no model call: the chip is deterministic code over announced facts (prohibition N3), and over-claiming is worse than silence (N1). Where the model says `present: false`, render the name and the word; where it says `cannot-tell` or `no-angular-root`, render that state's message verbatim and show no entries at all — silence and zero must never look alike (N4).
- **Reach and page purity.** `TOOL_REGISTRY` is injected; nothing imports `page-reads.ts` (`scripts/registry-reach.test.mjs` allowlists only `read-tools.ts` and its spec), and nothing is added to the inspected page (AR-3) — the relay's green badge is the page's only tool-owned element and is not the chip.
- **Spec shape.** Follow `interop.component.ts` / its spec: an inline template with `data-testid` hooks, `TestBed` with stubbed `TOOL_REGISTRY` and a stubbed `ExtensionMessageService` (or a provided fake returning the signals), one case per state: fingerprint with two present and six absent, all-false, `supported: false` (reason verbatim, no zone), `cannot-tell`, `no-angular-root`, and an empty projection rendering no group header plus the reason.

## Interface contract

- `ExtensionMessageService` exposes `features: Signal<Readonly<Record<string, boolean>> | null>`, `zoneMode: Signal<string | null>`, `stateReceived: Signal<boolean>`, and `appVersion: Signal<string | null>` (new); the replay round trip is `{ type: 'angular-ai:state-request', tabId }` panel to background, `chrome.tabs.sendMessage(tabId, { type: 'angular-ai:replay-request' })` background to relay, and the relay's reply `{ state: <latched angular-ai:state detail> | null, version: string | null }`, which the background re-emits to the panel as `{ type: 'angular-ai:state', ...state, tabId }` when a state was latched and `{ type: 'angular-detected', version, tabId }` when a version was latched.
- `panel-context.ts` exports `PanelSignals` (the four signals above plus `notSupported: boolean` and `notSupportedReason: string | null`), `PanelContext = { readonly facts: Readonly<Record<string, unknown>>; readonly version: string | null; readonly stateReceived: boolean }`, and `buildPanelContext(signals: PanelSignals): PanelContext`; with `stateReceived === false` it returns `facts = {}` with no `supported` key, and with `stateReceived === true` it returns `{ supported: !notSupported, reason: notSupportedReason, zoneMode: zoneMode === 'zone' || zoneMode === 'noop' ? zoneMode : 'unknown', features }` where `features` appears only when the signal is not null, and `version` is the trimmed `appVersion` or null.
- `feature-fingerprint.ts` exports `FeatureFingerprintEntry = { readonly name: string; readonly present: boolean }` and `FeatureFingerprint` = `{ kind: 'no-angular-root'; message: string }` | `{ kind: 'cannot-tell'; message: string; version: string | null }` | `{ kind: 'fingerprint'; entries: readonly FeatureFingerprintEntry[]; text: string; supported: boolean; reason: string | null; zoneMode: 'zone' | 'noop' | null }`, plus `featureFingerprint(context: PanelContext, featureNames: readonly string[]): FeatureFingerprint`, where entries follow the given order, `present` is `facts.features[name] === true`, `text` joins `<name>: present` / `<name>: absent` with a middle dot, and `no-angular-root` means no version and no state.
- `tool-groups.ts` exports `ToolGroupDeclaration = { readonly id: string; readonly title: string; readonly memberIds: readonly string[]; readonly minVersion: string; readonly requiredFeature?: string }`, `ToolGroupView = { readonly id: string; readonly title: string; readonly toolIds: readonly string[] }`, `ToolGroupExclusion = { readonly groupId: string; readonly reason: string }`, `ToolGroupProjection = { readonly groups: readonly ToolGroupView[]; readonly excluded: readonly ToolGroupExclusion[]; readonly emptyReason: string | null }`, `TOOL_GROUPS: readonly ToolGroupDeclaration[]`, and `projectToolGroups(tools: readonly ToolDeclaration[], context: PanelContext): ToolGroupProjection`.
- `app.routes.ts` keeps `appRoutes: Route[]` as an in-file literal with the six explainer paths unchanged ('' N1UpdateCauseComponent, `signal-provenance` N2SignalProvenanceComponent, `di-doctor` N3DiDoctorComponent, `error-explainer` ErrorExplainerComponent, `stale-view` StaleViewComponent, `interop` InteropComponent); an entry is `{ path, component }` or `{ path, loadComponent: () => import('./<file>').then((m) => m.<Class>) }`, T003 converts exactly one explainer to `loadComponent`, and T006 appends `{ path: 'chat', loadComponent: () => import('./chat-entry.component').then((m) => m.ChatEntryComponent) }`.

## Intent coverage

- SC1
- SC2
- SC3

## Acceptance criteria

1. SC1 — the chip renders all eight `APP_FACT_FEATURES` names in declaration order with present/absent marks from `featureFingerprint(buildPanelContext(…), APP_FACT_FEATURES)`, and the entry point passes that same `PanelContext` to `registry.execute('app_facts', undefined, context)`, so a live context never yields `host-unavailable`.
2. SC2 — the list is `projectToolGroups(registry.tools(), context)`; a group whose gate fails has no header at all, and an empty projection renders no group header plus the projection's `emptyReason`.
3. SC3 — a `no-angular-root` context renders the named refusal and no chip entry, and a `cannot-tell` context renders its own named state, visibly distinct from the refusal, naming the version and the absent debug surface.
4. The route is the single lazy `chat` entry in `app.routes.ts`, the six explainer routes and their components are unchanged, the component reaches page data only through `TOOL_REGISTRY` and imports no page reader, and nothing renders in the inspected page (AR-3, AR-6).
5. `chat-entry.component.spec.ts` covers the render states above — a fingerprint with two present and six absent, the all-false payload, `supported: false` with the reason verbatim and no zone claim, `cannot-tell`, `no-angular-root`, and an empty projection rendering no group header plus the reason — and no acceptance path calls a model to compute or render the chip.

## Verify

```bash
npm ci --include=dev && npm run check && npx nx run angular-ai-devtools:test --include=apps/angular-ai-devtools/src/app/chat-entry.component.spec.ts
```
<!-- Runs in a fresh sidecar worktree at the landed commit with nothing
     installed. The build and the byte measurement belong to T007, which measures
     the initial total with this route in place. -->

Heavy: yes

## Log

- 2026-11-02 — created by planner
