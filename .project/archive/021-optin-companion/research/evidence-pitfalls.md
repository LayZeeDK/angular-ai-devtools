# Evidence — pitfalls

<!-- Written by the pitfalls researcher. Consumed by the decider. -->

Dimension: pitfalls
Questions assigned: Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again?

## Assigned questions — answers

- Does the S16 verdict recorded against an exported provider carry over to a package that exports a facade at the table entry, or does the lookup need measuring again? → ` → It does not carry over unchanged, and the lookup has to be measured again - but the verdict's *shape* does transfer, so the milestone should budget for the same degraded answer instead of rediscovering it. What S16 actually recorded. `research/raw/s16-meta-lookup.json`: spike S16, dated 2026-10-18, run on `spikes/ng222-app` at Angular 22.2.2, method "walk root component injector resolution path via the internal `getInjectorResolutionPath` + `getInjectorProviders` helpers; identity-only token-name matching". Result: `router` "present in environment injector (index 2); instance url '/'", `meta` "absent (expected 'provided, not created yet')", `verdict: works-with-degradation`, reason "Meta is absent from all five injectors; identity-only token-name matching cannot resolve a Meta instance". The verdict is therefore a joint statement: the walk works page-side on that Angular version, and an identity match resolves a class the app's own bundle holds while a class no injector was given cannot resolve. What the facade changes. Only the provenance of the token. S16 matched a class that had been added to the fixture by hand, so it was the same module instance the app's injector held. A package facade supplies the token from *its* module, so the identity comparison still runs - the walk is unchanged - but its answer now depends on whether the package's `@angular/router` is the app's copy. That is what has to be measured, not the walk. What this checkout settles statically. (a) The walk stays page-side: the panel's only page realm is the `world: "MAIN"` agent (`extension/manifest.json`), the panel is a devtools document (`extension/devtools.js:2-8`), and the panel has no page-request transport (`apps/angular-ai-devtools/src/app/page-reads.ts:87-111`), so the token comparison cannot move into the panel. (b) Identity is a *resolution* decision the plan makes and that is then inspectable: peer dependencies plus no bundled or nested `@angular/*` under the package means one copy. (c) The fixture is a separate package with its own tracked lock (`spikes/ng222-app/package-lock.json`) and the root declares no `workspaces` (`package.json:2-4`), so no existing wiring already guarantees a shared copy. What only a measurement can settle. (i) Whether the facade's exported token is `===` the token in the injector's provider record on the fixture at its Angular version - a fact about a package that does not exist yet. (ii) Whether the facade survives the fixture's development build at all. (iii) Whether the fixture's `isDevMode()` is true under `--configuration development`. None of the three is decidable by reading; (ii) and (iii) are exactly the two questions SC4 and SC1 turn into evidence. Consequence for the plan. Treat `works-with-degradation` as the expected verdict and ship the state that matches it: a class the app never instantiated must render as "provided, not created yet", never as a symbol the package supplied. That is the same shape as E1's "declared, no symbols", which is why the two must not share one sentence.

## Finding: The only detection surface is a one-shot pushed record; there is no ask

- **Claim**: A package's presence can reach the panel only if it is computed inside `announceState` at the moment `tryInstall` runs: the record is dispatched once, `tryInstall` returns early once `installed`, the retry interval is cleared on the first success, the relay latches the last payload, and the panel-to-page direction has no transport at all. A design phrased as "the panel asks the package for its extra surface" needs a re-announce and a transport this build does not have.
- **Source**: `extension/agent-main.js:117-124` (the four-field record), `:145-183` (`if (installed) return "installed"` at `:168`, `announceState(true, null)` at `:176`), `:583-591`; `extension/relay.js:26-31,34-38`; `extension/background.js:30-51`; `apps/angular-ai-devtools/src/app/page-reads.ts:87-111`; `extension/manifest.json` content script `run_at: document_idle`.
- **Confidence**: high
- **Why it matters here**: SC1 and SC2 both hang on the panel learning of the entry; anything shaped as a request fails silently, and the silence looks exactly like "this app has no package".

## Finding: An entry written after bootstrap is invisible, because nothing re-announces

- **Claim**: The state record is built at `tryInstall` and never rebuilt, so a table entry created lazily - in an injector factory, on the first injection of a `provideAi*DevTools()` token, or by an app that defers bootstrap - is never published, and the panel answers SC2's refusal for a page that does have the package.
- **Source**: `extension/agent-main.js:117-124,145-176,583-591`; `docs/feature-proposals.md:228,240,241` (the provider writes the object; the `isDevMode()` guard; "each provider adds only its own key ... creates the object with `version` when it is missing").
- **Confidence**: high
- **Why it matters here**: SC1 fails non-deterministically while every deterministic case still passes, which is the hardest failure to see.

## Finding: Presence-only detection is the existing idiom, and its boolean cannot be told apart from a validated one

- **Claim**: `featuresOf` is eight `typeof` checks; the record's `features` is a boolean map the panel copies with no further validation and the chip renders as `present`; so a bit set from `typeof globalThis.ngAiDevTools === 'object'` reads to the user as a full opt-in. The facade shape - a `version` string plus per-package records whose values are functions or classes - is the only thing separating "a page wrote a key" from "the package is installed".
- **Source**: `extension/agent-main.js:61-82`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:161-172`; `apps/angular-ai-devtools/src/app/feature-fingerprint.ts:134-137`; `docs/feature-proposals.md:245,249`; `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:9-11` ("`globalThis.__ngRecorder` is a forgeable page global").
- **Confidence**: high
- **Why it matters here**: N1 - a stale or hostile stub would read as a complete opt-in and the panel would then name a surface it was never given.

## Finding: Validation has to happen in the page realm; a panel-side read of the entry reads the panel's own global

- **Claim**: The panel is a devtools document (`devtools.js` opens `panel/index.html`) and the only page realm is the `MAIN`-world agent, so `globalThis.ngAiDevTools` evaluated in panel code is the panel's own absent property; every existing `globalThis` read in the panel is a panel-realm capability (`chrome`, `LanguageModel`, `Summarizer`) - exactly the pattern a new read would copy - and a spec that stubs the panel's global would pass while detection is always false.
- **Source**: `extension/devtools.js:2-8`; `extension/manifest.json` `content_scripts[1].world: "MAIN"`; `apps/angular-ai-devtools/src/app/extension-message.service.ts:62`; `apps/angular-ai-devtools/src/app/extension-prompt.service.ts:38`; `apps/angular-ai-devtools/src/app/jobs/summarize-job.ts:120`.
- **Confidence**: high
- **Why it matters here**: SC1 and SC2 invert for every page, and the only tests that would catch it stub the wrong realm.

## Finding: N2's fallback is one line away, because page inspection already lives in the map the gates read

- **Claim**: `tool-groups` reads `facts.features[requiredFeature]` with no allowlist and `app_facts` truncates the same map to the eight `APP_FACT_FEATURES` names, so one record carries both page inspection and (from M021) the package bit; a surface built from `featuresOf`'s bits - or rendered from `app_facts`' eight rows - is page inspection presented as the package's extra surface, and nothing in the record distinguishes the two.
- **Source**: `apps/angular-ai-devtools/src/app/tool-groups.ts:245-262`; `apps/angular-ai-devtools/src/app/tool-registry/app-facts.ts:45-54,154-165,281`; `apps/angular-ai-devtools/src/app/feature-fingerprint.ts:122,134-137`.
- **Confidence**: high
- **Why it matters here**: N2 - the user cannot tell which surface they are looking at, which is the one difference this milestone ships.

## Finding: An unconditional companion key turns silence into a claim

- **Claim**: `buildPanelContext` returns `facts: {}` when the page has not spoken and omits `features` when the map is null, and the held-out chip suite asserts that empty object; a new key written before the early return turns "the page has not answered" into "the page has no package", the exact defect the adapter's own header forbids.
- **Source**: `apps/angular-ai-devtools/src/app/panel-context.ts:95-115`; `tests/held-out/feature-fingerprint-chip.test.mjs:180-184`.
- **Confidence**: high
- **Why it matters here**: E2/SC2 - the refusal must name the missing entry, never read as "no data yet".

## Finding: This builder has one tree-shaking lever (`optimization`), and both extension-side targets run optimized

- **Claim**: `@angular/build:application` declares `optimization` with default `true` and a description naming "tree-shaking, dead-code elimination", and declares neither `buildOptimizer` nor a `treeShaking` option; the root `build` target defaults to `production`, `development` is the only configuration with `optimization: false`, and `build-extension` - the sole build that produces what the extension loads - sets neither `defaultConfiguration` nor `optimization`, so it runs optimized. A proof taken on `build-extension`, on `build`, or "with `buildOptimizer`" is not the development build SC4 names, and `buildOptimizer` is not expressible here at all.
- **Source**: `node_modules/@angular/build/src/builders/application/schema.json:218-220` (grep of that file for `buildOptimizer` and `treeShaking`: no matches); `apps/angular-ai-devtools/project.json:14,46,52-92`; `scripts/panel-bundle-budget.test.mjs:175-195` (the pin measures the built `extension/panel` output).
- **Confidence**: high
- **Why it matters here**: N5/SC4 - the cheapest proof available to the plan is the one that proves a different proposition.

## Finding: The fixture is a third build graph, not the extension build and not the panel build

- **Claim**: `spikes/ng222-app` is a standalone Angular CLI app with its own `angular.json`, its own tracked `package-lock.json` and its own `node_modules`, and the root package declares no `workspaces`; `build-extension` compiles `apps/angular-ai-devtools/src/main.ts` into `extension/panel`, and no Nx target compiles the fixture. "The extension build and the panel build" are therefore the same target, and the app under test is a separate graph the package has to be installed into.
- **Source**: `spikes/ng222-app/angular.json:1-70`; `spikes/ng222-app/package.json`; `git ls-files spikes/ng222-app` (31 tracked files including `package-lock.json`); `package.json:2-4` (no `workspaces` key); `apps/angular-ai-devtools/project.json:10-16,52-64`.
- **Confidence**: high
- **Why it matters here**: a plan that expects a package dist under `extension/` or `dist/apps` cannot produce SC4's evidence at all.

## Finding: The fixture's default build is production, and the design's dev-mode guard makes that mistake look like a clean refusal

- **Claim**: `spikes/ng222-app`'s `build.defaultConfiguration` is `production` and `development` is the only configuration with `optimization: false`, while the installed builder defines `ngDevMode: "false"` only when script optimization is on; the design writes the table only under `isDevMode()`, so `npm run build` yields a bundle whose entry is never created, and the panel's honest "no table entry" answer reads as a correct SC2 result while SC1's example cannot be produced at all.
- **Source**: `spikes/ng222-app/angular.json:44-53,56-65`; `node_modules/@angular/build/src/tools/esbuild/application-code-bundle.js:447-449,461-470`; `docs/feature-proposals.md:240`.
- **Confidence**: high
- **Why it matters here**: SC1/SC4 - the run that is easiest to reach proves nothing and reports success.

## Finding: AR-3 is already red at the head, so a DOM snapshot cannot be a clean baseline

- **Claim**: `relay.js` creates a `div#angular-ai-devtools-marker` and appends it to `document.body` on every page carrying `[ng-version]`, and `relay.test.mjs` stubs `document.createElement`/`body.appendChild`, so the injection is asserted rather than caught. The extension already adds DOM to the inspected page; M021 can only claim that the package adds no further node.
- **Source**: `extension/relay.js:49-57`; `extension/relay.test.mjs:34-40`.
- **Confidence**: high
- **Why it matters here**: AR-3/N7 - an unscoped before/after DOM test either passes vacuously against the marker or fails for a cause that predates the milestone, and a package-side toast would hide behind it.

## Finding: N3's two cheapest violations are invisible to a string-key snapshot

- **Claim**: Nothing in the tree snapshots globals (no `ownKeys`, `getOwnPropertyNames` or `getOwnPropertySymbols` under `scripts/`, `extension/`, `apps/` or `tests/`), and the design has every provider "add only its own key" to an object it "creates when it is missing", so a second load either mutates the first object or replaces it. A replacement keeps the key count at one and throws nothing, so an E5 test that counts keys and asserts no throw cannot tell a no-op from a replacement; and a write under `Symbol.for(...)` is not an own string key at all.
- **Source**: `docs/feature-proposals.md:241`; `extension/agent-main.js:629` (the one page-global write that exists today, `__ngRecorder`); `git grep -n 'ownKeys|getOwnPropertyNames|getOwnPropertySymbols' -- scripts extension apps tests` returns no matches.
- **Confidence**: high
- **Why it matters here**: N3/SC3/E4/E5 - the test that looks like it proves the one-key contract does not.

## Finding: The panel's page-state types are closed, and two construction sites are plain JavaScript nothing checks

- **Claim**: `PanelSignals` has seven required members and `PanelContext` four, built in three type-checked places and two plain-JavaScript held-out fixtures (one of which already omits `replayOutcome`); the panel type-check covers only `apps/angular-ai-devtools/src/**/*.ts`, `npm test` does not run `tests/held-out/**`, and the root `tsconfig.json` include list is pinned at three entries. A new required member therefore breaks two suites no gate runs, and a defensive `?? 'absent'` default instead makes them pass while the production path silently reports absent.
- **Source**: `apps/angular-ai-devtools/src/app/panel-context.ts:47-62,75-80`; `apps/angular-ai-devtools/src/app/chat-entry.component.ts:173-182`; `apps/angular-ai-devtools/tsconfig.check.json` (`include: ["src/**/*.ts", "src/**/*.d.ts"]`); `package.json:10-12`; `scripts/panel-typecheck-scope.test.mjs:257-265,338`; `tests/held-out/tool-group-gates.test.mjs:44-50`; `tests/held-out/feature-fingerprint-chip.test.mjs:48-58`.
- **Confidence**: high
- **Why it matters here**: E3 - the chip, the replay and the group projection must keep working on a page without the package, and the only suite that would notice sits outside the gate.

## Finding: S16's identity match carries over only if the package resolves `@angular/*` to the app's own module instance

- **Claim**: S16 matched tokens by identity, page-side, against a class the fixture's own bundle held (`Router`), and recorded `works-with-degradation` because `Meta` was in no injector; a facade supplies the token from the package's module instead, so identity holds only when the package's `@angular/router` is the app's copy (peer resolution to the app's `node_modules`) and fails when it is a second copy (nested `node_modules`, a bundled dependency, or a tarball install). The failure is silent: the entry is well formed, the walk matches no record, and the panel reports "declared, no symbols".
- **Source**: `research/raw/s16-meta-lookup.json`; `.project/archive/001-run-unrun-spikes/research/SYNTHESIS.md:9,28,56` (the M001 filing records "cross-bundle `Meta` identity mismatch -> companion package must perform lookup inside app bundle/main world"); `spikes/ng222-app/package-lock.json` (own dependency tree, tracked).
- **Confidence**: medium
- **Why it matters here**: SC1 - a wiring defect then reads as E1's honest "declared, no symbols" state, which is the one state this milestone cannot afford to fake.

## Unverified

- Whether a development build (`optimization: false`) removes a top-level `globalThis` assignment at all: the builder passes no `treeShaking` flag to the bundler (`node_modules/@angular/build/src/tools/esbuild/application-code-bundle.js:436-474`), so the bundler's own default decides, and no build was run. `pure: ["forwardRef"]` is applied in both configurations (`:450`), so a facade that routes a token through `forwardRef` has to be proven in the dev build too.
- Whether `isDevMode()` is true in `spikes/ng222-app` under `--configuration development` at this head: no build was run; the configuration sets only `optimization: false`, `extractLicenses: false`, `sourceMap: true` (`spikes/ng222-app/angular.json:47-51`), which is consistent with dev mode but is not an observation.
- Whether the fixture page carries any `globalThis` key besides `ng`, `Zone` and `__ngRecorder` at `document_idle`: not observed in a browser, and no test in the tree snapshots globals.
- The panel's measured initial total at this head: no build output exists in the checkout (`extension/panel` holds two tracked files), so AR-1's headroom is quoted from `scripts/panel-bundle-budget.test.mjs:65` rather than re-measured. Any plan that routes the package into the panel's graph has an unmeasured budget.
- Checked with no finding: `extension/background.js:11,45` forwards unknown keys unchanged, so the wire is not a restriction - the restriction is the typed reader at `extension-message.service.ts:103-142`; and a package living outside `apps/angular-ai-devtools/src` is type-checked by nothing unless the pins in `scripts/panel-typecheck-scope.test.mjs:257-265,338` are deliberately re-taken.