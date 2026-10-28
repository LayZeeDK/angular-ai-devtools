# Evidence — stack

Dimension: stack
Questions assigned: Exact shape of `ng.ɵgetInjector*` APIs and what data they return per injector.

## Finding: ɵgetInjector* API surface measured in source

- **Claim**: `ng.getInjector` returns `Injector` (Tier 0); `ng.ɵgetInjectorResolutionPath` is `(injector) => Injector[]`; `ng.ɵgetInjectorMetadata` returns `{type, source}` shape; `ng.ɵgetInjectorProviders` returns `ProviderRecord[]`.
- **Source**: `research/02-angular-surface.md` §1.2 (measured in source, Angular 22.1.3+); `research/05-spikes.md` S2
- **Confidence**: high
- **Why it matters here**: satisfies SC1 (MAIN-world DI path tracer)

## Finding: ɵgetInjectorProviders throws on unsupported injector types

- **Claim**: `ng.ɵgetInjectorProviders` throws `"getInjectorProviders only supports NodeInjector and EnvironmentInjector"` for other injector types.
- **Source**: `research/17-vitest-browser-runtime.md:230`; raw JSON errors in `research/raw/vitest-*.json`
- **Confidence**: high
- **Why it matters here**: N3 must feature-detect Node/Environment injectors before calling; informs E2 edge

## Finding: angular:di_graph is forbidden

- **Claim**: `angular:di_graph` produces 42,788 chars on one-component app and changes the page; must never run.
- **Source**: `research/05-spikes.md` S2, S3 (measured)
- **Confidence**: high
- **Why it matters here**: DI facts come from `ɵgetInjector*` only, not `angular:di_graph`

## Assigned questions — answers

- Exact shape of `ng.ɵgetInjector*` APIs and what data they return per injector. → `getInjector` → Injector (Tier 0); `ɵgetInjectorResolutionPath` → Injector[] path (Tier 1); `ɵgetInjectorMetadata` → {type, source} (Tier 1); `ɵgetInjectorProviders` → ProviderRecord[] = {token, isViewProvider, provider, importPath?} (Tier 1, throws on non-Node/Env)

## Dead ends

- `angular:di_graph` — prohibited by feature-proposals §3.2
