# Synthesis — N3 DI doctor

## RESEARCH answers (resolving INTENT.md open questions)

### 1. Exact shape of `ng.ɵgetInjector*` APIs

Measured in `research/02-angular-surface.md` (section 1.2, `ng` global
map) and `research/05-spikes.md` (S2):

| API | Signature | Returns | Tier | Source |
|-----|-----------|---------|------|--------|
| `getInjector` | `(el) => Injector` | NodeInjector or Injector.NULL | 0 | `discovery_utils.ts:141-148` |
| `ɵgetInjectorResolutionPath` | `(injector) => Injector[]` | Element chain → env chain (the DI lookup path) | 1 | `injector_discovery_utils.ts:542-616` |
| `ɵgetInjectorMetadata` | `(injector) => {type, source}` | `{'element', Element} | {'environment', string|null} | {'null', null} | null` | 1 | `injector_discovery_utils.ts:502-540` |
| `ɵgetInjectorProviders` | `(injector) => ProviderRecord[]` | `{token, isViewProvider, provider, importPath?}` per provider; **throws for other injector types** | 1 | `injector_discovery_utils.ts:485-500`; `ProviderRecord` at `render3/debug/injector_profiler.ts:129-149` |

Key constraints (measured, not inferred):
- `ɵgetInjectorProviders` only supports `NodeInjector` and
  `EnvironmentInjector` — throws otherwise
  (`research/17-vitest-browser-runtime.md:230`, raw JSON errors).
- `angular:di_graph` is **forbidden** by proposals §3.2 — it changes the
  page and its output is too large (~42,788 chars on one-component app,
  `research/05-spikes.md` S3).
- DI facts come from `ɵgetInjectorProviders`, `ɵgetInjectorResolutionPath`,
  and `ɵgetInjectorMetadata` only — never the full `di_graph`
  (`research/05-spikes.md` line 40, `research/02-angular-surface.md:308`).

### 2. Which DI questions are answerable from the tools alone

| Question | Answerable? | Tools | Caveat |
|----------|-------------|-------|--------|
| One-component path trace | Yes | `getInjector`, `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata` | Element-injector chain then env-injector chain |
| Two-component diff | Yes | Same as above, diff of two paths | Divergence = first injector with different provider |
| Token lookup on a path | Partial (Tier 1) | `ɵgetInjectorProviders` | Token name matching only; identity matching (Tier 2 opt-in) needed for robust lookup |
| NullInjectorError recovery | Yes | `ɵgetInjectorResolutionPath` + token name from error | N4 reconstructs at failing component |
| Whole-app token resolution | Partial | `di_lookup` per component, grouped | Token may resolve at root once first injected but has no record yet (`providedIn: 'root'`)

### Known limitations (from proposals §4.6 and research/12)

- `providedIn: 'any'` tokens: not supported (N3 limitations,
  `research/12-legacy-vs-modern-angular.md` I2).
- Injection flags (@SkipSelf, @Host, @Optional, @Self): not visible in the
  walk (proposals §3.4).
- `ɵgetDependenciesFromInjectable` runs only on the component's own class
  (proposals §3.4).

## Evidence sources

- `research/02-angular-surface.md` — full `ng.*` API table with tiers
- `research/05-spikes.md` — measured DI path on counter app (5 injectors),
  `angular:di_graph` forbidden finding, provider dump size (~100+ env
  providers per path)
- `research/12-legacy-vs-modern-angular.md` — `providedIn: 'any'` not
  supported (I2)
- `research/17-vitest-browser-runtime.md` — `ɵgetInjectorProviders` error
  on unsupported injector types
- `docs/feature-proposals.md` — N3 section (lines 576-584)
