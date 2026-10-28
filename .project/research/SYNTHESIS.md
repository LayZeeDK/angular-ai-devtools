# Synthesis

<!-- Written by the decider role. The planner treats Decisions as settled. -->

## Settled

- API surface — `getInjector` (Tier 0), `ɵgetInjectorResolutionPath`, `ɵgetInjectorMetadata`, `ɵgetInjectorProviders` (Tier 1) available in Angular 22.1 (evidence-stack § "Finding: ɵgetInjector* API surface measured in source")
- Framework — zoneless standalone Angular 22.2, Nx workspace, MV3 extension, TypeScript 6.0.x (INTENT.md Constraints)
- Model — panel-local Prompt API only, no tool calling in core loop (INTENT.md Scope: in)
- `angular:di_graph` — forbidden (evidence-stack § Dead ends)
- Injection flags and `providedIn: 'any'` — not supported, accepted drift (evidence-domain § "Finding: providedIn: 'any' and injection flags are not supported")

## Decisions

### DI path tracing approach

- **Decision**: Trace DI paths via `ɵgetInjectorResolutionPath` + `ɵgetInjectorMetadata` + `ɵgetInjectorProviders` only; do not use `angular:di_graph`.
- **Runner-up**: `ng.ɵgetInjector(el).get(Token)` — rejected (prohibited; can construct nothing; feature-proposals §3.2)
- **Evidence**: evidence-stack § "Finding: ɵgetInjector* API surface measured in source"; evidence-stack § "Finding: ɵgetInjectorProviders throws on unsupported injector types"; evidence-domain § "Finding: Path trace and two-component diff are fully answerable from tools alone"
- **Confidence**: high

### Token matching strategy

- **Decision**: Name-based matching on Tier 1 (`ɵgetInjectorProviders` lists token name string); identity matching (Tier 2 opt-in export) reserved for future.
- **Runner-up**: Full identity matching only — rejected (extension has no import access to app token objects; Tier 2 opt-in keeps N3 Tier 1)
- **Evidence**: evidence-domain § "Finding: Token lookup is partially answerabled — name matching only on Tier 1"; feature-proposals N3 §3.4
- **Confidence**: high

### Two-component diff algorithm

- **Decision**: Walk both resolution paths side-by-side; divergence = first injector where provider records differ; render the divergent injector + provider on each side.
- **Runner-up**: Full graph diff — rejected (too expensive; N3 caps at 20 rows, proposals §3.7)
- **Evidence**: evidence-domain § "Finding: Path trace and two-component diff are fully answerable from tools alone"
- **Confidence**: high

### Prompt shape

- **Decision**: Send a deterministic diff (~200 tokens) of the two resolution paths — injector chain + token records only; no provider lists, no values.
- **Runner-up**: Send full provider dump — rejected (fits window on only ~10% of pages; proposals S3)
- **Evidence**: evidence-stack § "Finding: Short fact-list prompt suits small models"; INTENT.md Risks
- **Confidence**: medium

## For the planner

- **Wave-1 blockers**: `ɵgetInjectorProviders` throws on non-Node/Environment injectors — must feature-detect before calling; exact `ProviderRecord` field set (incl. `importPath`) — must confirm field availability before building provider display.
- **Walking skeleton**: MAIN-world reads `getInjector` for a selected component → walks `ɵgetInjectorResolutionPath` → walks `ɵgetInjectorMetadata` per injector → calls `ɵgetInjectorProviders` per injector → records resolution array → panel renders path + provider records → panel diffs two paths → user clicks explain → prompt sends ~200-token diff → Prompt API responds.
- **Pitfalls → tasks**: `ɵgetInjectorProviders` throws on unsupported injectors → task must guard with type check; provider dump too large → use `di_lookup` per token, not full dump; `providedIn: 'any'` unsupported → reject tokens with no record on the path.

## User rulings

- Confirm final set of DI questions to support → support all four in wave 1: path trace (single component), two-component diff, token lookup, NullInjectorError recovery (decided in AFK mode per gsd-path AFK instructions; feature-proposals N3/N4 scope).
- Doc-vs-code: npm ci procedure → use `npm ci` for clean installs and when `node_modules/typescript` reports 7.x; `npm install` when adding new dependencies (fix-doc).
- Doc-vs-code: mklink junction → automated bridge (`scripts/sidecar-deps-bridge.mjs`) is sufficient for all modern sidecars; manual junction mention is legacy-only fallback (accept-drift).

## Still unknown

- Exact `ProviderRecord` field names and `importPath` availability — plan: wave-1 spike against `ng.ɵgetInjectorProviders` on the counter fixture.
- Reliability of name-based token matching with multiple providers of the same type — plan: wave-1 spike, accept risk if identity matching is needed.
