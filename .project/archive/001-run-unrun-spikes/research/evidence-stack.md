# Evidence — stack

Dimension: stack
Questions assigned: What is Angular 22.2's actual lookup path for a Meta-class/exported provider (`ng.ɵgetInjectorProviders` etc.), and what exactly does S16 need to call?

## Finding: `ng.ɵgetInjectorProviders` is the supported discovery API and only accepts Node/Environment injectors

- **Claim**: Angular 22.2 publishes `ng.ɵgetInjectorProviders(injector)` (signature `(injector: Injector) => ProviderRecord[]`, where `ProviderRecord = {token, isViewProvider, provider, importPath?}`); it throws for any injector that is not a `NodeInjector` or `EnvironmentInjector`. `ɵgetDependenciesFromInjectable(injector, token)` instantiates/looks up `token` within that injector (`injector.get(token, null, {self:true, optional:true})`) and reports its dependencies and `providedIn` injector. `ɵgetInjectorResolutionPath(injector)` returns the element-injector chain followed by the environment-injector chain. S16 can discover a provider by calling `ng.ɵgetInjectorProviders` on each injector in `ng.ɵgetInjectorResolutionPath(rootInjector)` and matching `record.token` to the token.
- **Source**: `packages/core/src/render3/util/injector_discovery_utils.ts:44-139` (`getDependenciesFromInjectable`), `:485-500` (`getInjectorProviders`), `:542-545` (`getInjectorResolutionPath`); `packages/core/src/render3/debug/injector_profiler.ts:129-149` (`ProviderRecord`); `research/02-angular-surface.md` §1.2 inventory rows.
- **Confidence**: high
- **Why it matters here**: This is the exact Tier-1 surface S16 is allowed to use for the companion-package lookup claim, without instantiating arbitrary tokens.

## Finding: Exported first-party class tokens are not identity-matchable across bundles

- **Claim**: Tier-2 limitation: an extension/companion bundle's copy of an `@angular/*` class (e.g. `Meta` from `@angular/platform-browser`) is a different constructor identity from the app's copy, so `record.token === Meta` / `injector.get(Meta)` cannot match by reference from outside the app's bundle. Angular DevTools avoids this by only operating inside the page's MAIN world where `window.ng` and the app's own classes exist; `ɵgetRouterInstance` exists precisely because token-based lookup from a foreign bundle fails. S16's "lookup by exported first-party class `Meta`" therefore only works when the lookup runs in the app's own bundle/main world (or via a companion package that re-exports/registers the class inside the app), not from an arbitrary extension bundle.
- **Source**: `research/02-angular-surface.md` §1.3 and §1.2 ("`ɵgetRouterInstance` ... `injector.get(Router, null, {optional: true})`"), `injector_discovery_utils.ts:491-499`; `packages/platform-browser/src/browser/meta.ts:61-62` (`Meta` is `@Service()` class exported as public API).
- **Confidence**: medium
- **Why it matters here**: This is the core risk S16 measures; the verdict must be recorded as works/works-with-degradation/fails with evidence, not assumed.

## Finding: `Meta` is an ordinary `@Service()`-decorated exported class

- **Claim**: `Meta` in Angular 22.2 is `@Service()` class in `packages/platform-browser/src/browser/meta.ts`, exported as public API; it is provided through the platform-browser provider set, so a `Meta` provider record appears in an injector's provider list only where platform-browser providers are configured (typically the root/environment injector). It is not a special-cased token.
- **Source**: `D:\projects\github\angular\angular\packages\platform-browser\src\browser\meta.ts:61-62`; public-api golden `platform-browser/index.api.md`.
- **Confidence**: high
- **Why it matters here**: S16 should look at the root/environment injector (not an arbitrary component node injector) to find `Meta`, and should feature-detect `typeof ng.ɵgetInjectorProviders === 'function'`.

## Assigned questions — answers

- What is Angular 22.2's actual lookup path for a Meta-class/exported provider (`ng.ɵgetInjectorProviders` etc.), and what exactly does S16 need to call? → S16 should (in the page's main world, using the app's own bundle identity) obtain a root injector via `ng.getInjector(document.querySelector('[ng-version]'))` or the root component host, call `ng.ɵgetInjectorResolutionPath(injector)` to get the injector chain, then for each injector call `ng.ɵgetInjectorProviders(injector)` and find the record whose `token` is the app's `Meta` class (or call `ng.ɵgetDependenciesFromInjectable(injector, Meta)` where a `Meta` instance is expected). It must feature-detect each `ɵ` function (`typeof ... === 'function'`) and target the root/environment injector where platform-browser providers live. Cross-bundle identity mismatch means the extension cannot do this with its own `Meta` import; the companion package must perform the lookup inside the app bundle.

## Dead ends

- `Meta` is not a core `ng` global or a special token — searching `packages/core` for `Meta` provider registration yields nothing; it lives in platform-browser.
- `ɵgetInjectorProviders` does not accept arbitrary injectors (throws for non-Node/Environment injectors), so passing a `NullInjector` or chained injector is a dead end.
- Matching by class identity from a foreign bundle is a dead end due to Tier-2 identity mismatch; string-name matching is not supported by the API (token is the constructor).