# Evidence — pitfalls

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead?

## Finding: Every one of the eight bits flips together on every fixture at this head

- **Claim**: `app_facts` cannot tell any one of its eight features from another on this repository's fixtures. All eight are `typeof ng.X === 'function'` reads of one `window.ng` object; both fixture apps are Angular 22.2.2, whose `ng` exposes all eight, so a dev serve reports 8/8 `true` and a production build reports 8/8 `false`. No fixture produces a mixed map; the only mixed map in the tree is a hand-written spec payload.
- **Source**: `extension/agent-main.js:61-82` (`featuresOf`), `:117-124` (`announceState` payload), `:154-160` (missing `ɵsetProfiler`/`ɵgetSignalGraph`); `spikes/ng222-app/node_modules/@angular/core/package.json` and `spikes/ng222-ssr/node_modules/@angular/core/package.json` (both 22.2.2); `spikes/ng222-app/node_modules/@angular/core/types/core.d.ts:8759-8793` (all eight in `ExternalCoreGlobalUtils`, no per-API version split); `apps/angular-ai-devtools/src/app/extension-message.service.spec.ts:84-93` (the only mixed map).
- **Confidence**: high
- **Why it matters here**: SC1/E1/E3 ask the chip to name present and absent features by name. On the fixtures at this head that data does not exist: the chip can only say all eight present or all eight absent, so a per-feature probe (or a supplied payload, as E1 provides) is required.

## Finding: The bits' only source is a `ngDevMode`-only global, so a production build reports all eight absent

- **Claim**: All eight bits are published into `window.ng` only when `ngDevMode` is true. In a production build that publish call is compiled out, `featuresOf(undefined)` returns all `false`, and the page announces `supported:false` with the reason `ng.ɵsetProfiler not found (production build or not an Angular page)`. The payload cannot distinguish "this app lacks these APIs" from "this is a production build"; only the English `reason` string separates them.
- **Source**: `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12910-12932` (the eight plus others in one object), `:13163-13164` (`ngDevMode && publishDefaultGlobalUtils$1()`), `:12954-12960` (`if (typeof COMPILED === 'undefined' || !COMPILED)`); `spikes/ng222-app/node_modules/@angular/core/types/core.d.ts:8802-8803` ("when an application is not in production"); `extension/agent-main.js:61-72` (`if (!ng) return f;`), `:154-156`.
- **Confidence**: high
- **Why it matters here**: the chip must not render those eight `false` bits as "the app does not have these features" — that is N1 in reverse. "Cannot tell" and "reported absent" are separate concepts in `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:68-70`, but the page never emits the third state (`null`) that would carry the distinction.

## Finding: `[ng-version]` is not dev-mode; a production page has a version while its features are unreadable

- **Claim**: `ng-version` is emitted by `createRootTView` with no `ngDevMode` guard, and bootstrap always passes a selector, so a production Angular page carries `[ng-version="<version>"]` while `window.ng` is absent. The recorded risk "the `[ng-version]` root enumeration is dev-mode behaviour and can be absent on a production build" (`.project/ROADMAP.md:811`, restated at `.project/intent/INTENT.md:156`) is not supported by the installed 22.2.2 source.
- **Source**: `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:9398-9399` (`rootSelectorOrNode ? ['ng-version', '22.2.2'] : ...`), `:13274-13275` (`selectorOrNode = hostElement || componentFactory.selector`); the same code and the `22.1.8` literal survive in this repository's own production panel build at `extension/panel/chunk-DweK769i.js:34`; `.commandcode/skills/control-angular-devtools/scripts/control.mjs:1332-1333` reads `ngVersion` and `devBuild` as separate facts and prints "window.ng absent (production build or not Angular)" for a page whose `ng-version` it just read.
- **Confidence**: medium
- **Why it matters here**: it inverts the milestone's stated risk. The failure is not "no version, so a group is excluded for the wrong reason"; it is "version present, gate passes, every tool behind it unsupported". N2's "the facts win over the version" is the only rule that catches that, and the group filter must apply it. Confidence is high for the guarded code path and medium for "every production page", because a component created through `ViewContainerRef.createComponent` instead of `ApplicationRef.bootstrap` takes attributes from its selector and gets no `ng-version` (`_debug_node-chunk.mjs:9637-9640`). Settling check: build `spikes/ng222-app` (`ng build`, production by default in `spikes/ng222-app/angular.json`), serve the output, and read `document.querySelector('[ng-version]')` and `typeof window.ng` — not run here.

## Finding: The panel has no page DOM; the only `[ng-version]` read is in the relay, and the version is logged rather than signalled

- **Claim**: the inspected page's DOM is not reachable from the panel document, so the `[ng-version]` enumeration exists only in `extension/relay.js` (ISOLATED world), which sends it once as `angular-detected`; `ExtensionMessageService` writes that version into the cause log and exposes no signal for it. No production code stores the inspected app's version.
- **Source**: `extension/relay.js:27-41` (`document.querySelector('[ng-version]')`, `angularDetected` latch at `:30-31`, `chrome.runtime.sendMessage({ type: 'angular-detected', version })` at `:41`); `extension/background.js:28-32` re-broadcasts it with `tabId`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:58-59` (`causeService.record('Angular', 'v' + version + ' detected')` only); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:71-77` (`AppFactsSnapshot` has no version field); `extension/agent-main.js:117-124` (state payload has no version).
- **Confidence**: high
- **Why it matters here**: the plan says a group gate reads the `[ng-version]` root enumeration, but the value arrives on a different channel from the state payload that will carry `app_facts` facts, and nothing exposes it. The adapter for the chip is therefore not sufficient for SC2; the version needs its own signal (or a field on the adapter's snapshot, which the pinned envelope does not prevent because the snapshot is not the envelope).

## Finding: There is no replay, so a panel opened after page load never sees the state it needs

- **Claim**: the page announces `angular-ai:state` once, at the moment `tryInstall()` reaches a terminal answer, then clears its 100 ms retry interval; the relay only forwards live events, the service worker only broadcasts, and the panel registers its `chrome.runtime.onMessage` listener when the panel document loads. Nothing re-asks the page. `stateReceived()` therefore stays `false` for a panel opened after the page's content script ran, which is the normal DevTools session.
- **Source**: `extension/agent-main.js:583-591` (`start()`, `setInterval(..., 100)`, `clearInterval` on `installed`/`notsupported`), `:684` (`start()` at load); `extension/relay.js:19-23` (forward-only listener, no request handler); `extension/background.js:8-12` (broadcast, no `storage`/replay); `apps/angular-ai-devtools/src/app/extension-message.service.ts:44-50` (listener registered in the constructor).
- **Confidence**: medium
- **Why it matters here**: it turns the "cannot tell" state from the edge case (N4) into the default path, so SC1's chip would be blank for every page the user had already loaded. The milestone needs a request/response or last-known-state path, and that is a change to `relay.js`/`background.js`, not only to the panel. Confidence is high for "no replay or re-request path exists" and medium for the session consequence, which depends on the panel loading after the content script; settling check: load the built extension, open DevTools on a loaded page, and read `stateReceived()` — not run here.

## Finding: `zoneMode` in the payload is `noop` on the Zone.js rejection path

- **Claim**: `zoneMode` is assigned only after the Zone.js check rejects the app, and `announceState` reads the module-level default `"noop"` at that point. A Zone.js app that the page refuses is announced as `supported:false` with `zoneMode:"noop"`, and the panel stores that value unconditionally.
- **Source**: `extension/agent-main.js:35` (`var zoneMode = "noop"`), `:121` (`zoneMode: zoneMode` in the payload), `:163-167` (detect, then `announceState(false, ...)` and return), `:175` (`zoneMode = zone` only on the success path); `apps/angular-ai-devtools/src/app/extension-message.service.ts:72` (stores whatever string arrives); `extension/agent-main.test.mjs` "reports 'not supported' for a Zone.js app (E7)" asserts only `supported`/`reason`, never `zoneMode`.
- **Confidence**: high
- **Why it matters here**: a chip or group list that reads `zoneMode` alongside `supported` will describe a rejected Zone app as zoneless. N1's over-claim rule applies to this bit exactly as it does to the eight feature bits, and there is no test that would catch it.

## Finding: The first registry consumer inherits `host-unavailable` by default

- **Claim**: `ToolRegistry.execute` substitutes `EMPTY_FACTS` when the caller passes no `ToolContext`, and `readAppFacts` maps a facts object without a boolean `supported` to `{kind:'error', code:'host-unavailable'}`. A chat entry point that calls `registry.execute('app_facts')` before building the context gets the "the page has not spoken" answer on every call, whatever the page actually announced.
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:275` (`context?.facts ?? EMPTY_FACTS`), `:178` (`EMPTY_FACTS`); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:133-140` (`appFactsSnapshot` requires a boolean `supported`), `:267-276` (`host-unavailable`); `apps/angular-ai-devtools/src/app/app.config.ts:10-19` (registry provided, no caller).
- **Confidence**: high
- **Why it matters here**: the registry has no production consumer, so this milestone's entry point defines the calling convention for the eleven explainers after it. A convention that omits the context is not a neutral choice; it makes the honest failure the permanent one.

## Finding: Grouping must be a read-only projection; re-declaring throws

- **Claim**: `declare()` rejects an id that is already declared, and `assertDeclaration` throws `ToolDeclarationError` for any malformed field. A grouping layer that re-decorates declarations and feeds them back through `provideTools`/`declare` fails at injector construction, not at render time.
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:492-497` (`is already declared; tool ids are unique within a registry`), `:239-243` (`declare` calls `assertDeclaration`), `:421-429` and `:478-487` (field validation); `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts` is SHA-256-pinned by `scripts/registry-envelope-pin.test.mjs:55-56`, and `:107-123` fails on any byte change with a message that says updating the constant is not the fix.
- **Confidence**: high
- **Why it matters here**: SC2's "absent from the list, not present and empty" can be implemented as a filter over `registry.tools()`; the tempting alternative (a `group` field, or a wrapped declaration) either re-cuts the pinned envelope or throws. `grep -i group` over `apps/**/*.ts` returns no matches today, so there is no existing shape to extend.

## Finding: The bundle pin has zero margin, and only eager files count

- **Claim**: the measured initial total is 535,440 B, exactly `PRE_MILESTONE_INITIAL_KB = 535.44`, and `assertWithinBaseline` fails on any positive delta (`<=`). The total sums every file `index.html` loads eagerly — `script src`, `stylesheet`, and `modulepreload` links — and deliberately ignores anything not referenced there. So any byte added to the initial chunk fails the pin, while code in a lazily loaded chunk escapes the measurement entirely.
- **Source**: `scripts/panel-bundle-budget.test.mjs:62-65` (the constant), `:212-220` (`totalKb <= 535.44`, failure text "must not make the initial bundle worse"), `:295-356` (synthetic proof: eager files counted, icon and lazy chunk ignored, one byte over fails), `:362-373` (real measurement, skipped only when no build exists); `extension/panel/index.html` lists `main.js`, `styles.css` and three `modulepreload` chunks; `apps/angular-ai-devtools/project.json` `build-extension` budget `maximumWarning: "520kb"` (already exceeded at 535.44).
- **Confidence**: high
- **Why it matters here**: N5 and SC4 make this the binding constraint. The chip is a cross-route affordance with no host today (`apps/angular-ai-devtools/src/app/app.routes.ts:10-15` lists six routes and `app.ts` is a bare `<router-outlet>`), so it will be eager and every byte it adds fails the pin. The only green shapes are: offset bytes elsewhere, or put the new surface behind a lazy route — and the second is a decision about whether the chip exists on first paint, not a budget trick.

## Finding: The reach guard allowlists exactly two importers of `page-reads.ts`

- **Claim**: `scripts/registry-reach.test.mjs` walks `apps/angular-ai-devtools/src/**/*.ts`, resolves every static and dynamic import, and fails any file that reaches `page-reads.ts` outside `read-tools.ts` and its spec. The new chat entry point therefore cannot call a page reader directly; it must go through `TOOL_REGISTRY`.
- **Source**: `scripts/registry-reach.test.mjs:48-54` (`PAGE_READS_RELATIVE`, `ALLOWLIST_RELATIVE`), `:56-75` (forbidden re-exports from the registry module), `:13-22` (the check prints the allowlist and scanned-file count, so it cannot pass vacuously); `apps/angular-ai-devtools/src/app/tool-registry/read-tools.ts:21-23` states it is the only non-test importer.
- **Confidence**: high
- **Why it matters here**: the chip and group list are the first code that wants page data from a component. The guard makes "read the page directly from the chip" a red test, which forces the `app_facts`-context design — good, but the plan must not assume a direct read is available.

## Finding: `publish` is the filter nobody applies, and one shipped tool is panel-only

- **Claim**: nothing in production filters declarations on `publish === 'model'`, although the type's own doc comment says "the model loop filters on `'model'`". Of the eight shipped tools, `panel_environment` declares `publish: 'panel'`. A group projection that lists every declaration therefore offers a panel-only tool to the model.
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/tool-registry.ts:49-50` (`ToolPublish`); `apps/angular-ai-devtools/src/app/tool-registry/panel-environment.tool.ts:232-237` (`publish: 'panel'`); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:313` (`publish: 'model'`); `apps/angular-ai-devtools/src/app/app.config.ts:10-19` (all four providers registered); no `publish ===` comparison exists outside specs.
- **Confidence**: high
- **Why it matters here**: the group list is the first place the model's view of the registry is defined. Whether it filters `publish` is an invisible decision today, and getting it wrong is the "group offered and empty" failure SC2 forbids — a group containing only `panel_environment` would be offered to the model and answer nothing it may call.

## Finding: The app-feature marks N18 names are not in `app_facts` and nothing reads them

- **Claim**: Angular 22.2.2 defines 17 `performanceMarkFeature` names (`NgSignalForms`, `NgDefer`, `NgBoundary`, `NgEventReplay`, ...), which is the fingerprint `docs/feature-proposals.md:717` describes. None of them is published by `app_facts` or by the `angular-ai:state` payload, and no file under `extension/` or `apps/` reads `performance.getEntriesByName('mark_feature_usage')`; the only reader in the tree is a skill script.
- **Source**: `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs` and `core.mjs` (`performanceMarkFeature('<name>')` call sites, 17 distinct names); `extension/agent-main.js:61-82` (the eight API bits, none of the 17); `docs/feature-proposals.md:717` (N18's "about 20 `mark_feature_usage` names"), `:209` (the read is a Tier-0 surface); `research/16-ssr-runtime.md:119-123` (the SSR fixture measurably sets `NgEventReplay` and `NgIncrementalHydration`); `.commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:139` (the only reader).
- **Confidence**: high
- **Why it matters here**: this is the per-feature-probe half of the assigned question. The eight `app_facts` bits describe debug-API availability, not the app's features; the fingerprint the roadmap's N18 text describes needs a page-realm read of the marks, which is a different probe and a different (non-registry) channel.

## Finding: The two version gates agree on the unknown case; the premise that they disagree is wrong

- **Claim**: `versionOlderThan` returns `false` for a missing or unparseable version (so the page is not blocked), and `angularVersionGate` returns `supported: true` for the same input (so the scan runs). They share the 22.1.3 threshold and share the permissive answer, so INTENT's "opposite bias about an unknown version" (`.project/intent/INTENT.md:118-121`) is not what the code says. The real divergence is that neither gate is reachable from the panel, and they gate different things.
- **Source**: `extension/agent-main.js:136-144` (`if (!v) return false;`, `if (!m) return false;`) with `:149-152`; `src/main-world/stale-view-scan.ts:60-72` (unknown → `{supported: true, version: v}`), `:75-80` (aliases); `tests/held-out/stale-view-version-gate.test.mjs` asserts only `22.1.2` (unsupported) and `22.1.3`/`22.2.0` (supported) — the unknown case is untested.
- **Confidence**: high
- **Why it matters here**: a plan built on "the gates disagree, so pick one" would fix a problem that does not exist and leave the real one (no panel-visible version, no shared gate) in place. It also means the milestone is free to define the unknown-version behaviour for groups, but must say what it is, because nothing today decides it.

## Finding: A silent page already renders as a measured empty state

- **Claim**: `notSupported()` and `notSupportedReason()` are the only negative state the six routes read, and both default to "not negative". A page that never announces state therefore looks like a page with nothing to report: the existing views render their empty states ("no interop findings"), not a "cannot tell" state. Nothing distinguishes "the page said nothing" from "the page said zero".
- **Source**: `apps/angular-ai-devtools/src/app/extension-message.service.ts:33-39` (defaults `false`/`null`, no `supported` signal), `:67-76` (only `supported === false` sets the negative signals; neither is ever reset); `apps/angular-ai-devtools/src/app/interop.component.ts:11-16` (`@if (ext.notSupported())` ... `@else if` ... `empty-state`); `apps/angular-ai-devtools/src/app/extension-message.service.spec.ts:51-63` (asserts the flag flips, never that silence is distinguishable).
- **Confidence**: high
- **Why it matters here**: N4 requires "cannot tell" to be its own named state, distinct from the non-Angular refusal. The existing default already violates that rule in the six explainers; the chip must be built as a third state, not as an extension of `notSupported`, or it will inherit the same quiet failure.

## Finding: `readFeatureBits` collapses "no map" and "no usable bits" into different values, and `{}` is the dangerous one

- **Claim**: the panel's copy of the feature map keeps only boolean entries; a payload with no map yields `null`, but a payload with a map that holds no booleans yields `{}`. An adapter that treats a non-null map as "the page reported" will read `{}` as eight verified absences, which is an over-claim of absence; an adapter that treats `null` as "cannot tell" needs the same treatment for `{}`.
- **Source**: `apps/angular-ai-devtools/src/app/extension-message.service.ts:98-110` (`readFeatureBits`: non-object → `null`; otherwise `{}` plus boolean entries only); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:151-163` (the same idea but preserving `null` per bit); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:278-283` (an unpublished bit flattens to `false`, with `featuresReported` as the only record).
- **Confidence**: high
- **Why it matters here**: the adapter from signals to `ToolContext.facts` is the one new piece of logic with no test today. The distinction `featuresReported` exists to preserve is dropped by `ExtensionMessageService` before the adapter ever sees it. Confidence is high for the code behaviour and medium for exploitability, because the real page always publishes all eight booleans (`extension/agent-main.js:61-72`), so only a forged or malformed payload reaches it today.

## Finding: Trap inventory — most of these are already in the code, not introduced by M020

- **Claim**: of the failure modes above, eight are present facts about this head (the uniform fingerprint, the dev-mode-only bits, the `ng-version` inversion, the log-only version, the missing replay, the `zoneMode` default, the `EMPTY_FACTS` default, the silent-page empty state) and five are shapes M020 would introduce (a chip that reads the flattened `features` map, a group list that does not filter `publish`, a third version gate that falls back silently, an eager chip that breaks the bundle pin, and an adapter that treats `{}` as reported).
- **Source**: findings above, at their cited lines; `.project/research/evidence-codebase.md` findings "The registry has no production consumer", "`app_facts` is registered but its page channel is never filled in production", "Version gating exists twice".
- **Confidence**: high
- **Why it matters here**: the milestone's risk list treats these as risks to avoid; most are already true, so the plan needs to fix or route around existing behaviour (relay, payload defaults) rather than only add a new component.

## Assigned questions — answers

- [RESEARCH] Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead? → None of the eight `APP_FACT_FEATURES` bits can be distinguished from another on the fixtures at this head: all eight are `typeof window.ng.X === 'function'` reads of one dev-mode-only global (`extension/agent-main.js:61-82`), the two fixture apps are both Angular 22.2.2 (`spikes/ng222-app|ng222-ssr/node_modules/@angular/core/package.json`) and expose all eight (`spikes/ng222-app/node_modules/@angular/core/types/core.d.ts:8759-8793`; the panel's own 22.1.8 does too, `node_modules/@angular/core/types/core.d.ts:8771-8788`), so a dev serve reports 8/8 true and a production build 8/8 false with `supported:false` (`agent-main.js:154-156`); no installed Angular is below 22.1.8 and no fixture produces a mixed map (the only one is a spec payload, `apps/angular-ai-devtools/src/app/extension-message.service.spec.ts:84-93`). Two things need a per-feature probe instead: (a) the app-feature marks N18 names — 17 `performanceMarkFeature` names in 22.2.2, with the SSR fixture measurably emitting `NgEventReplay` and `NgIncrementalHydration` (`research/16-ssr-runtime.md:119-123`) — because `app_facts` publishes no such bit and nothing in `extension/` or `apps/` reads `performance.getEntriesByName('mark_feature_usage')` (the only reader is `.commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js:139`); (b) the group gates at `docs/feature-proposals.md:788` (`ɵgetControlFlowBlocks` from 22.0, `devtoolstooldiscovery` tools from 22.0) name APIs outside the eight, so each needs `typeof ng.<api> === 'function'` on the page or a version read. `zoneMode` is a third axis, but it is constant on both fixtures (zoneless, `spikes/ng222-app/src/app/app.config.ts`) and the payload reports `noop` even on the rejected-Zone path (`extension/agent-main.js:35,165,175`). The `fingerprint` dimension was dispatched this same question and should be read with this answer.

## Dead ends

- Live verification of a production build (`ng build` on `spikes/ng222-app`, then reading `[ng-version]` and `typeof window.ng` in a browser) — forbidden by the read-only brief; the claim is `unverifiable` and the settling check is named in the `[ng-version]` finding.
- `npm run check`, `npm test`, `npx nx run angular-ai-devtools:build-extension` — forbidden here; every Angular/vitest claim above rests on source, not on a run.
- Searching for a fixture on an Angular version below 22.1.8 to obtain a mixed feature map — none exists; the only `@angular/core` installs are 22.1.8 (workspace root) and 22.2.2 (`spikes/ng222-app`, `spikes/ng222-ssr`).
- `research/05-spikes.md:69` ("`mark_feature_usage` entries: `NgStandalone`, `NgControlFlow`") — that is the portal app, not a repository fixture; it says nothing about what the fixtures emit.
- `extension/panel.html` + `extension/panel.js` — the second, hand-written panel that `devtools.js` never opens (`extension/devtools.js:2-4`); not a candidate surface for the chip.
- A web search for Angular's `ng-version`-in-production behaviour returned a StackOverflow answer only; the installed 22.2.2 source was decisive, so no web source is load-bearing in this file.
