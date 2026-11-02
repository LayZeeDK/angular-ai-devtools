# Evidence — fingerprint

<!-- Written by one researcher role. Consumed by the decider. -->

Dimension: custom (fingerprint)
Questions assigned: Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead?

## Finding: the eight declared bits are the eight page-computed bits, name for name and in the same order

- **Claim**: `APP_FACT_FEATURES` lists the same eight names, in the same spelling and the same order, that `featuresOf()` writes into the `angular-ai:state` payload, so the adapter is a name-to-name map with no translation and the chip's stable order (E2) can be taken from the panel array rather than from payload key order.
- **Source**: `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:45-54`; `extension/agent-main.js:62-71` (the literal: `setProfiler, getSignalGraph, getHostElement, getInjector, getDirectiveMetadata, getInjectorResolutionPath, getInjectorMetadata, getInjectorProviders`).
- **Confidence**: high
- **Why it matters here**: E2 pins the chip's order to the declaration order, and this is the one place where the page and the panel already agree; a test can assert byte-identical chip text without inventing an ordering rule.

## Finding: the API behind each bit, and five fallback names that do not exist at either installed version

- **Claim**: each bit is a `typeof === "function"` test on one entry of the single `window.ng` object Angular publishes. The live entry per bit, at both 22.1.8 and 22.2.2, is: `setProfiler` -> `ɵsetProfiler`; `getSignalGraph` -> `ɵgetSignalGraph`; `getHostElement` -> `getHostElement`; `getInjector` -> `getInjector`; `getDirectiveMetadata` -> `getDirectiveMetadata`; `getInjectorResolutionPath` -> `ɵgetInjectorResolutionPath`; `getInjectorMetadata` -> `ɵgetInjectorMetadata`; `getInjectorProviders` -> `ɵgetInjectorProviders`. The five secondary names `featuresOf` also accepts (`ng.setProfiler`, `ng.getSignalGraph`, `ng.ɵgetHostElement`, `ng.ɵgetDirectiveMetadata`, `ng.ɵgetInjectorFromNode`) are not published on `window.ng` at either version, and `getInjectorFromNode` appears nowhere in either installed `@angular/core` package; the brief's `ɵgetInjector` does not exist either.
- **Source**: `extension/agent-main.js:73-80`; the publishing object at `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12910-12932` and the identical one at `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12558-12580`; full-text search for `getInjectorFromNode` over both `fesm2022` directories returns no hits.
- **Confidence**: high
- **Why it matters here**: a per-feature probe written from the `ɵ`-prefixed list in the milestone brief would test four names Angular does not publish, and would report "absent" for an API that is present. The only usable names are the unprefixed three plus the four `ɵ` helpers above.

## Finding: `window.ng` is published as one object behind a single dev-mode guard, so the eight bits flip together

- **Claim**: all 21 entries are published in one `for` loop by `publishDefaultGlobalUtils$1()`, whose only public caller is `ngDevMode && publishDefaultGlobalUtils$1()`; the call happens at platform creation (`createPlatform` and `createOrReusePlatformInjector`), not at module import. No code path publishes a subset, and `publishUtil` additionally refuses to write when the `COMPILED` flag is set.
- **Source**: `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12906-12960` (object at `:12910-12932`, loop at `:12940-12942`, `ngDevMode` guard at `:13163-13164`); `spikes/ng222-app/node_modules/@angular/core/fesm2022/core.mjs:2319-2332` (`publishDefaultGlobalUtils()` at `:2323`) and `:2383-2390` (`:2385`).
- **Confidence**: high
- **Why it matters here**: an eight-entry chip is showing one build-level fact eight times. The fingerprint has exactly two observable per-bit states, "this Angular build publishes its debug global" (8/8 true) and "it does not" (0/8), which is why the milestone's "absent by name" rendering is a display decision rather than a measurement.

## Finding: 22.1.8 and 22.2.2 publish identical key sets, so no supported version yields a partial fingerprint

- **Claim**: the `externalCoreGlobalUtils` literal has the same 21 keys at the panel's 22.1.8 and the fixtures' 22.2.2, so moving between any two versions the extension supports (>= 22.1.3) cannot flip a single bit.
- **Source**: `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12558-12580` (22.1.8, read from `node_modules/@angular/core/package.json` `"version": "22.1.8"`) versus `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12910-12932` (22.2.2).
- **Confidence**: high
- **Why it matters here**: a group gated on a bit and a group gated on a version would encode the same fact, and only the version has resolution inside the supported range. N2 assumes facts can contradict a version; on this surface they cannot, because the facts never vary with the version.

## Finding: both fixtures are dev builds of the same Angular 22.2.2, so all eight bits are true on both and none distinguishes them

- **Claim**: `spikes/ng222-app` and `spikes/ng222-ssr` each resolve `@angular/core` 22.2.2 from their own `node_modules`, and both are launched by `ng serve` with `architect.serve.defaultConfiguration = "development"`, so `window.ng` is published and every one of the eight checks in `featuresOf()` reads `true`. The two fixtures are indistinguishable on the fingerprint.
- **Source**: `spikes/ng222-app/package.json` and `spikes/ng222-ssr/package.json` (`"@angular/core": "^22.2.0"`; installed `22.2.2`); `spikes/ng222-app/angular.json` and `spikes/ng222-ssr/angular.json` (`serve.configurations.development`, `defaultConfiguration: "development"`); `.commandcode/skills/control-angular-dev-app/SKILL.md` (counter "Angular 22.2.2, zoneless"; doctor checks `dev-build` and `ng-core-functions`); `features/counter.md` and `features/ssr.md` (precondition: `up` and `doctor` exit 0, which requires `dev-build` to pass).
- **Confidence**: high
- **Why it matters here**: SC1's chip will render identically on both fixtures, so a test that wants a partial fingerprint (E1's two-of-eight) cannot obtain one from either; it must inject a payload. A live read of `__ngc.doctor().ngFunctions` on each fixture would settle the runtime question and was not run here (static evidence only), but it can only confirm the 8/8 result, not produce a subset. Confidence is high for the static evidence — same publisher, same version, dev configuration — and the doctor's `ng-core-functions` check passing on both is the recorded measurement that covers 7 of the 8 names.

## Finding: the fixtures never call the debug APIs; the extension calls six of them on both

- **Claim**: no fixture source calls any of the eight APIs. The only production callers are in the page agent: `ɵsetProfiler` (`agent-main.js:172`) and, on every recorded change-detection cycle, `getHostElement` (`:244`, `:275`), `getDirectiveMetadata` (`:264`), `getInjector` (`:276`) and `ɵgetSignalGraph` (`:277`) through `captureGraph`. The three injector-path reads (`:454`, `:467`, `:470`) sit behind an `angular-ai:di-query` event that `relay.js` never forwards and `background.js` never handles, so they are unreachable at this head.
- **Source**: search of `spikes/**/*.ts` for `ng.`/`ɵ` debug calls (no hits); `extension/agent-main.js:243-286`, `:436-471`; `extension/relay.js:5-24` (listens for `record`, `di-graph`, `error-capture`, `state` only); `extension/background.js:8-33`; `apps/angular-ai-devtools/src/app/page-reads.ts:14-20` ("This build has no page-request transport ... `angular-ai:di-query` has no caller and no responder").
- **Confidence**: high
- **Why it matters here**: "the fixture exercises the feature" is false for all eight bits. The bit reports the build's capability, and the only thing that changes an answer is the app's own content, which no bit mentions. Confidence is high for the call graph; the fixtures do hold signals, injectors and components, so the reads would answer if called, but nothing calls them.

## Finding: a true bit does not mean the read succeeds

- **Claim**: `ɵgetSignalGraph` throws unless it is handed a NodeInjector or an R3Injector (`throwError('getSignalGraph must be called with a NodeInjector or R3Injector')`), and `ɵgetInjectorProviders` throws for some injectors: the repository's own verification helper wraps it in `try`/`catch` with the comment "some injectors list no providers", and derives the graph only from `ɵgetSignalGraph(ng.getInjector(host))`.
- **Source**: `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:12597-12600`; `.commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js` (`injectors()` try/catch around `ɵgetInjectorProviders`; `graph()` requires `ng().getInjector(host)`).
- **Confidence**: high
- **Why it matters here**: a group gated on `getSignalGraph: true` can still fail on a host with no element injector. SC2 and N2 need the failure named rather than assumed impossible, and this is the concrete case where the bit is necessary but not sufficient.

## Finding: where the `[ng-version]` root enumeration exists today, and what it yields per fixture

- **Claim**: the only product-code enumeration is `extension/relay.js:28` (`document.querySelector('[ng-version]')`), which reads the attribute at `:32` and sends `{ type: 'angular-detected', version }` at `:41`, once per page load, from the ISOLATED world. `background.js:28-33` relays that message with a `tabId`, and the panel's handler writes it into the cause log and nothing else (`extension-message.service.ts:58-59`): no signal carries a version today. The attribute value is the Angular version string compiled into the root TView: `['ng-version', '22.2.2']` in the fixtures' copy, `['ng-version', '22.1.8']` in the panel's own.
- **Source**: `extension/relay.js:26-46`; `extension/background.js:28-33`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:58-59`; `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:9399`; `node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:9216`. Second enumerations, verification-only: `.commandcode/skills/control-angular-dev-app/scripts/ng-inspect.js` (`doctor()` `roots`/`ngVersion`, `root()`), `scripts/verify-relay.mjs:55,107`.
- **Fixture yield**: `ng222-app` has one root, `<app-root ng-version="22.2.2">` (`src/app/app.ts` selector `app-root`, bootstrapped from `src/main.ts`), so `querySelector` takes it. `ng222-ssr` carries the attribute on `<app-root>` in the server HTML and, per the recorded gotcha, on both `<app-root>` and the routed `<app-page>` once hydrated in the browser, so a `querySelector` still takes `<app-root>` and a `querySelectorAll` would see two.
- **Confidence**: high
- **Why it matters here**: SC2's version gate has a real source, but it lives in the isolated world and reaches the panel as one log line, so the milestone needs either a new signal or a second read; and "the version" is a single string, not a count of roots. Confidence is high for the code and the attribute value, medium for the two-root browser observation, which is recorded in the skill doc (`features/ssr.md`, Gotchas) and not re-measured here.

## Finding: `[ng-version]` survives a production build while `window.ng` does not, so "production Angular" is a nameable state with a version and no facts

- **Claim**: the `ng-version` attribute is written unguarded when the root TView is created (`rootSelectorOrNode ? ['ng-version', '22.2.2'] : ...`), and the Angular team declined a request to strip it from production bundles ("We don't consider exposing the framework version to be a security issue and do not wish to remove that information from production bundles"). The `ng` global, by contrast, is behind `ngDevMode`. A production Angular page therefore sends `angular-detected` with a version and never sends `angular-ai:state`: `agent-main.js` returns `"waiting"` while `readNg()` is undefined and announces nothing.
- **Source**: `spikes/ng222-app/node_modules/@angular/core/fesm2022/_debug_node-chunk.mjs:9399`; https://github.com/angular/angular/issues/64916 (maintainer comment, 2025-11-08, fetched); `_debug_node-chunk.mjs:13163-13164`; `extension/agent-main.js:145-157` (`if (!ngObj) return "waiting";` at `:147`).
- **Confidence**: high
- **Why it matters here**: this is what makes the three page classes tellable apart from messages that already exist: no `angular-detected` and no state means non-Angular (SC3's refusal); `angular-detected` plus no state means an Angular build without the debug surface, that is "cannot tell" with a version in hand (N4). It also corrects the INTENT risk that the version read "can be absent on a production build": the version is the part that survives. Confidence is high for "the attribute is not dev-guarded" and "the global is dev-guarded", medium for "every production build carries it", since an app may remove the attribute by hand.

## Finding: `featuresOf` always writes all eight keys, so the panel's "unpublished bit" branch is unreachable from this writer

- **Claim**: the page initialises the map with all eight keys `false` and returns it unchanged when `ng` is absent, so it never publishes a partial map or omits a key. The panel's `null` state ("the page published no such fact", `app-facts.ts:151-160`) therefore never occurs from this writer, `featuresReported` is always all eight (`:283`), and a renamed bit on either side would silently read `null` and then `false` rather than raising anything.
- **Source**: `extension/agent-main.js:62-82` (`if (!ng) return f;` at `:72`); `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:151-160`, `:280-283`.
- **Confidence**: high
- **Why it matters here**: E1's "exactly two of the eight bits" payload cannot be produced by the page, so that edge must be exercised by injecting `ToolContext.facts`. The same silence makes a page/panel name drift an under-claim rather than an error, which is the mirror image of N1.

## Finding: the bits are orthogonal to `supported`, and two of them are the prerequisite for any announcement at all

- **Claim**: `announceState(true, ...)` is reached only after `ɵsetProfiler` and `ɵgetSignalGraph` are both present, so on any page that reports `supported: true` those two bits are necessarily true. But a Zone.js page announces `supported: false` with all eight bits still true, because `featuresOf` is computed independently of the zone check. A page older than 22.1.3 likewise announces `supported: false` with all eight true.
- **Source**: `extension/agent-main.js:149-176` (`announceState(false, ...)` at `:150`, `:155`, `:160`, `:165`; `announceState(true, null)` at `:176`); `:117-123` (`announceState` always sends `featuresOf(readNg())`).
- **Confidence**: high
- **Why it matters here**: a chip that infers support from a bit is wrong in both directions, and N2's "the facts win over the version" has to name which fact wins: the zone/supported answer and the bit map are separate claims about the same page.

## Finding: only presence is observable per bit; the per-feature question needs a probe over the app, not the build

- **Claim**: every bit is a `typeof === "function"` test on one object Angular publishes wholesale, so a `true` bit states "this build ships the API", never "this app can be inspected with it". The differences a per-feature probe would find on the two fixtures are in the app's own content: `ng222-app` exposes `count`/`double`/`items` signals and an effect on `app-counter`; `ng222-ssr` exposes `REQUEST`-based server detection, an `httpResource`, transfer state and a `@defer (hydrate on interaction)` block. None of the eight bits mentions any of this, and the two helpers whose answers (not whose presence) would separate the SSR fixture, `ɵgetTransferState` and `ɵgetControlFlowBlocks`, are deliberately not in `APP_FACT_FEATURES`.
- **Source**: `_debug_node-chunk.mjs:12910-12932` (both `ɵ` helpers are published) against `app-facts.ts:45-54` (neither is a bit); `spikes/ng222-app/src/app/counter.ts` (`signal`, `computed`, `effect`, `providedIn: 'root'` service); `spikes/ng222-ssr/src/app/mismatch.ts:12` (`inject(REQUEST)`), `data-list.ts:22` (`httpResource`), `page.ts:15` (`@defer (hydrate on interaction)`), `page.ts:26` (a `signal`).
- **Confidence**: high
- **Why it matters here**: this is the direct answer. The fingerprint can separate "dev Angular that publishes the debug surface" from everything else and cannot separate the fixtures; anything the chip says beyond that needs a per-feature probe, and the two APIs that would carry the most signal for this fixture pair are outside the declared eight.

## Assigned questions — answers

- [RESEARCH] Which feature fingerprints `app_facts` can distinguish on the fixtures at this head, and which need a per-feature probe instead? → None of the eight bits distinguishes `spikes/ng222-app` from `spikes/ng222-ssr`: both are dev builds resolving `@angular/core` 22.2.2, served by `ng serve` in its `development` configuration, and Angular publishes the whole debug global in one `ngDevMode`-guarded loop, so all eight checks in `featuresOf()` (`extension/agent-main.js:73-80`) read `true` on both (`_debug_node-chunk.mjs:12910-12932`, `:13163-13164`); the 21-key set is identical at 22.1.8 and 22.2.2, so no supported version produces a subset. The only distinction the bits make is build-level: `window.ng` present (8/8 true) versus absent, which covers a production build, `ngDevMode=false` and a non-Angular page alike (8/8 false, or no record at all, since `agent-main.js:147` announces nothing without `ng`). So every bit needs a per-feature probe, an actual call on a real host, before the panel may claim the app supports anything: `ɵgetSignalGraph` throws without a NodeInjector or R3Injector (`_debug_node-chunk.mjs:12597-12600`), `ɵgetInjectorProviders` throws for some injectors (`ng-inspect.js` `injectors()`), the fixtures themselves call none of the eight APIs, and the three injector-path reads in the agent sit behind the unreachable `angular-ai:di-query` transport. The version a group gate needs is not in the payload either: it comes from the single `[ng-version]` read in `extension/relay.js:28-41`, which survives into production builds while `window.ng` does not, and which reaches the panel today only as a cause-log line (`extension-message.service.ts:58-59`).

## Dead ends

- The `ɵ` names the milestone brief lists (`ɵgetHostElement`, `ɵgetDirectiveMetadata`, `ɵgetInjector`, `ɵgetInjectorFromNode`): none is on `window.ng` and none is exported by `@angular/core` at 22.1.8 or 22.2.2, so a probe built from that list can only ever answer `false`. The live names are `getHostElement`, `getDirectiveMetadata`, `getInjector`, `ɵsetProfiler`, `ɵgetSignalGraph`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders`.
- The panel's own `@angular/core` 22.1.8 (`node_modules/@angular/core/package.json`) as a version probe: the panel's framework version says nothing about the inspected page, and both fixtures resolve their own 22.2.2 copy (no junction in `spikes/*/node_modules`).
- Looking for a test that pins the page-side list: `extension/agent-main.test.mjs` asserts nothing about `featuresOf` (the only `featuresOf` hits in the repository are `agent-main.js:61` and `:122`), so the eight names are pinned on the panel side only (`app-facts.ts:45`).
- `https://angular.dev/api/core/getSignalGraph`: resolves to the marketing home page with no API text, so it cannot support or contradict the dev-mode restriction; the installed `fesm2022` and the `ngDevMode` guard at `_debug_node-chunk.mjs:13164` are the usable sources.
- The in-page `angular:di_graph` tool (`core.mjs:2093-2132`, registered for `devtoolstooldiscovery` at `:2308`): dev-only, not reachable through this extension's transport, and it computes nothing the fingerprint could use.
- Searching for a fixture that produces a partial bit set: no fixture in `spikes/` runs a production build or a non-dev server configuration, so no fixture can produce a `false` bit or a mixed map; E1 and E3 must be driven by injected payloads, not by a fixture state.
